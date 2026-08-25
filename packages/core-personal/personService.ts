// packages/core-personal/personService.ts — Personal World Model service (V2-03 slice 1,
// docs/architecture-v2/21-ROADMAP.md mục "V2-03" + 02-SYSTEM-ARCHITECTURE.md mục 4).
//
// Đây là nơi ENFORCE các rule kiến trúc mà contract Zod (packages/core-contracts/personalFact.ts)
// cố ý KHÔNG enforce (Zod chỉ tả hình dạng):
//
//   1. GATE của V2-03: "không inference nào trở thành authoritative fact chỉ vì model nói vậy" —
//      fact `derived` KHÔNG được đè lên fact đang hiệu lực có origin `user_declared`. Bị chặn
//      thẳng bằng ConflictError, KHÔNG âm thầm supersede.
//   2. Supersede là APPEND: sửa 1 fact = INSERT bản ghi mới `supersedes = id bản cũ`, bản cũ chỉ
//      bị hạ cờ `is_current = false`. Không UPDATE giá trị, không DELETE dòng → giữ audit trail.
//   3. Optimistic concurrency: mọi thao tác sửa/xoá đọc bản ghi bằng `select ... for update` bên
//      trong transaction; nếu lúc đó bản ghi đã hết `is_current` (người/tiến trình khác vừa sửa
//      hoặc xoá) → ConflictError (409), không ghi đè âm thầm.
//
// Ghi chú thiết kế: các hàm nhận `pool` làm tham số đầu (thay vì tự gọi `getPgPool()`) để tầng
// gọi kiểm soát được connection và để test mock được pool — giống khuôn `withTransaction`.

import type { Pool, PoolClient } from 'pg'
import { withTransaction } from '@dhcb/core-db/transaction'
import { ConflictError, NotFoundError } from '@dhcb/core-errors/appError'
import { PersonSchema, PERSON_SCHEMA_VERSION, type Person } from '@dhcb/core-contracts/person'
import {
  PersonalFactSchema,
  PERSONAL_FACT_SCHEMA_VERSION,
  type PersonalFact,
  type FactOrigin,
  type Sensitivity,
} from '@dhcb/core-contracts/personalFact'

// ─── Hàng thô từ Postgres → contract ────────────────────────────────────────

interface PersonRow {
  id: string
  user_id: string
  display_name: string
  created_at: Date
  updated_at: Date
}

interface FactRow {
  id: string
  person_id: string
  namespace: string
  key: string
  value: unknown
  origin: string
  // `numeric` được driver `pg` trả về dạng CHUỖI (giữ nguyên độ chính xác) — phải Number() lại.
  confidence: string
  source: unknown
  sensitivity: string
  created_at: Date
  updated_at: Date
  last_confirmed_at: Date | null
  expires_at: Date | null
  supersedes: string | null
  is_current: boolean
}

function toPerson(row: PersonRow): Person {
  return PersonSchema.parse({
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    schemaVersion: PERSON_SCHEMA_VERSION,
  })
}

function toFact(row: FactRow): PersonalFact {
  // Field optional: chỉ đưa vào object khi có giá trị — schema `.strict()` chấp nhận thiếu field,
  // và ta không muốn ép `null` (contract dùng optional, không dùng nullable).
  return PersonalFactSchema.parse({
    id: row.id,
    personId: row.person_id,
    namespace: row.namespace,
    key: row.key,
    value: row.value,
    origin: row.origin,
    confidence: Number(row.confidence),
    source: row.source,
    sensitivity: row.sensitivity,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...(row.last_confirmed_at ? { lastConfirmedAt: row.last_confirmed_at.toISOString() } : {}),
    ...(row.expires_at ? { expiresAt: row.expires_at.toISOString() } : {}),
    ...(row.supersedes ? { supersedes: row.supersedes } : {}),
    schemaVersion: PERSONAL_FACT_SCHEMA_VERSION,
  })
}

const FACT_COLUMNS = `id, person_id, namespace, key, value, origin, confidence, source,
  sensitivity, created_at, updated_at, last_confirmed_at, expires_at, supersedes, is_current`

// ─── Person ─────────────────────────────────────────────────────────────────

/**
 * Lấy Person của 1 user auth, chưa có thì tạo. Idempotent — gọi bao nhiêu lần cũng ra đúng 1
 * Person (ràng buộc `unique(user_id)` ở DB + `on conflict do nothing` là lưới an toàn khi 2
 * request song song cùng tạo).
 *
 * `display_name` mặc định lấy `public.profiles.name` (hồ sơ hiện có); user chưa đặt tên thì để
 * 'Bạn' — contract yêu cầu `displayName` tối thiểu 1 ký tự nên không được để rỗng.
 */
export async function getOrCreatePerson(pool: Pool, userId: string): Promise<Person> {
  const existing = await pool.query<PersonRow>(
    `select id, user_id, display_name, created_at, updated_at
       from personal.persons where user_id = $1`,
    [userId],
  )
  const found = existing.rows[0]
  if (found) return toPerson(found)

  const inserted = await pool.query<PersonRow>(
    `insert into personal.persons (user_id, display_name)
     values ($1, coalesce(nullif((select name from public.profiles where id = $1), ''), 'Bạn'))
     on conflict (user_id) do nothing
     returning id, user_id, display_name, created_at, updated_at`,
    [userId],
  )
  const created = inserted.rows[0]
  if (created) return toPerson(created)

  // Đua với một request song song vừa tạo trước — đọc lại bản của nó.
  const retry = await pool.query<PersonRow>(
    `select id, user_id, display_name, created_at, updated_at
       from personal.persons where user_id = $1`,
    [userId],
  )
  const row = retry.rows[0]
  if (!row) throw new ConflictError('Không tạo được hồ sơ Person, thử lại')
  return toPerson(row)
}

// ─── PersonalFact ───────────────────────────────────────────────────────────

export interface DeclareFactInput {
  personId: string
  namespace: string
  key: string
  value: unknown
  origin: FactOrigin
  confidence: number
  source: { type: string; id?: string; occurredAt?: string }
  sensitivity: Sensitivity
  expiresAt?: string
}

/** Đọc fact đang hiệu lực của (person, namespace, key) và KHOÁ ROW để chống race. */
async function lockCurrentFact(
  client: PoolClient,
  personId: string,
  namespace: string,
  key: string,
): Promise<FactRow | undefined> {
  const res = await client.query<FactRow>(
    `select ${FACT_COLUMNS} from personal.personal_facts
      where person_id = $1 and namespace = $2 and key = $3 and is_current
      for update`,
    [personId, namespace, key],
  )
  return res.rows[0]
}

async function insertFact(
  client: PoolClient,
  input: DeclareFactInput,
  supersedes: string | null,
): Promise<PersonalFact> {
  const res = await client.query<FactRow>(
    `insert into personal.personal_facts
       (person_id, namespace, key, value, origin, confidence, source, sensitivity,
        expires_at, supersedes)
     values ($1, $2, $3, $4::jsonb, $5, $6, $7::jsonb, $8, $9, $10)
     returning ${FACT_COLUMNS}`,
    [
      input.personId,
      input.namespace,
      input.key,
      JSON.stringify(input.value ?? null),
      input.origin,
      input.confidence,
      JSON.stringify(input.source),
      input.sensitivity,
      input.expiresAt ?? null,
      supersedes,
    ],
  )
  const row = res.rows[0]
  if (!row) throw new ConflictError('Không ghi được fact, thử lại')
  return toFact(row)
}

/**
 * Khai báo/cập nhật 1 fact. Có fact cũ cùng (person, namespace, key) → supersede bản đó.
 *
 * GATE V2-03: input `derived` gặp fact hiện tại `user_declared` ⇒ ném ConflictError (409).
 * Suy luận của model KHÔNG được tự nâng lên thành sự thật đè lời người dùng tự khai.
 */
export async function declareFact(pool: Pool, input: DeclareFactInput): Promise<PersonalFact> {
  return withTransaction(pool, (client) => declareFactWithClient(client, input))
}

/**
 * Bản chạy TRONG một transaction đang mở sẵn — dùng khi việc ghi fact phải nguyên tử cùng thao
 * tác khác (ví dụ Companion xác nhận một ProposedAction: đánh dấu 'committed' và ghi fact phải
 * cùng sống hoặc cùng chết, không được nửa nọ nửa kia).
 *
 * `declareFact` ở trên chỉ là lớp bọc mở transaction rồi gọi hàm này.
 */
export async function declareFactWithClient(
  client: PoolClient,
  input: DeclareFactInput,
): Promise<PersonalFact> {
  const current = await lockCurrentFact(client, input.personId, input.namespace, input.key)

  if (current && current.origin === 'user_declared' && input.origin === 'derived') {
    throw new ConflictError(
      `Fact "${input.namespace}.${input.key}" do người dùng tự khai — suy luận (derived) không được ghi đè`,
    )
  }

  if (current) {
    await client.query('update personal.personal_facts set is_current = false where id = $1', [
      current.id,
    ])
  }
  return insertFact(client, input, current?.id ?? null)
}

export interface ListFactsOptions {
  namespace?: string
  /** true = trả cả bản đã bị supersede/xoá mềm (dùng cho export/audit). */
  includeHistory?: boolean
}

export async function listFacts(
  pool: Pool,
  personId: string,
  opts: ListFactsOptions = {},
): Promise<PersonalFact[]> {
  const conditions = ['person_id = $1']
  const params: unknown[] = [personId]
  if (!opts.includeHistory) conditions.push('is_current')
  if (opts.namespace) {
    params.push(opts.namespace)
    conditions.push(`namespace = $${params.length}`)
  }
  const res = await pool.query<FactRow>(
    `select ${FACT_COLUMNS} from personal.personal_facts
      where ${conditions.join(' and ')}
      order by created_at asc, id asc`,
    params,
  )
  return res.rows.map(toFact)
}

export interface FactPatch {
  value?: unknown
  confidence?: number
  sensitivity?: Sensitivity
  origin?: FactOrigin
  expiresAt?: string
  source?: { type: string; id?: string; occurredAt?: string }
}

/**
 * Sửa 1 fact — vẫn là APPEND: bản cũ hạ cờ, bản mới trỏ `supersedes` về nó.
 *
 * `personId` là tham số BẮT BUỘC (khác đặc tả gốc chỉ có `factId`): mọi lượt sửa phải chứng minh
 * fact thuộc về chính người đang đăng nhập ngay trong câu SQL, không tin `id` client gửi lên
 * (CLAUDE.md mục 4.2 "không tin client").
 *
 * `personId`/`namespace`/`key` không đổi được — đổi những thứ đó là một fact KHÁC, hãy declare mới.
 */
export async function correctFact(
  pool: Pool,
  personId: string,
  factId: string,
  patch: FactPatch,
): Promise<PersonalFact> {
  return withTransaction(pool, async (client) => {
    const res = await client.query<FactRow>(
      `select ${FACT_COLUMNS} from personal.personal_facts
        where id = $1 and person_id = $2
        for update`,
      [factId, personId],
    )
    const current = res.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy fact')
    // Optimistic concurrency: bản này đã bị người/tiến trình khác supersede hoặc xoá trước đó.
    if (!current.is_current) {
      throw new ConflictError('Fact đã bị sửa hoặc xoá bởi thao tác khác — tải lại rồi thử lại')
    }

    const nextOrigin = patch.origin ?? (current.origin as FactOrigin)
    // GATE V2-03 áp cả ở đường sửa: không được hạ 1 lời tự khai xuống thành suy luận đè lên nó.
    if (current.origin === 'user_declared' && nextOrigin === 'derived') {
      throw new ConflictError('Fact do người dùng tự khai — suy luận (derived) không được ghi đè')
    }

    await client.query('update personal.personal_facts set is_current = false where id = $1', [
      current.id,
    ])

    const expiresAt = patch.expiresAt ?? current.expires_at?.toISOString()
    return insertFact(
      client,
      {
        personId: current.person_id,
        namespace: current.namespace,
        key: current.key,
        value: 'value' in patch ? patch.value : current.value,
        origin: nextOrigin,
        confidence: patch.confidence ?? Number(current.confidence),
        source: patch.source ?? (current.source as { type: string }),
        sensitivity: patch.sensitivity ?? (current.sensitivity as Sensitivity),
        ...(expiresAt ? { expiresAt } : {}),
      },
      current.id,
    )
  })
}

/**
 * Xoá mềm 1 fact: chỉ hạ `is_current`, KHÔNG xoá dòng (giữ audit trail).
 *
 * Quyết định: fact không tồn tại (hoặc của người khác) → 404; fact đã bị xoá/supersede rồi → 409,
 * KHÔNG im lặng coi là thành công. Lý do: người gọi cần phân biệt "tôi vừa xoá" với "ai đó đã
 * thay đổi trước tôi" — đúng tinh thần optimistic concurrency của cả nhóm hàm này.
 */
export async function deleteFact(pool: Pool, personId: string, factId: string): Promise<void> {
  await withTransaction(pool, async (client) => {
    const res = await client.query<FactRow>(
      `select ${FACT_COLUMNS} from personal.personal_facts
        where id = $1 and person_id = $2
        for update`,
      [factId, personId],
    )
    const current = res.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy fact')
    if (!current.is_current) {
      throw new ConflictError('Fact đã bị sửa hoặc xoá bởi thao tác khác — tải lại rồi thử lại')
    }
    await client.query(
      'update personal.personal_facts set is_current = false, updated_at = now() where id = $1',
      [current.id],
    )
  })
}

/** Xuất toàn bộ dữ liệu Personal World Model của 1 người — GỒM CẢ LỊCH SỬ (yêu cầu "export" của
 * V2-03: người dùng phải xem được cả những gì hệ thống TỪNG tin về mình). */
export async function exportPersonData(
  pool: Pool,
  person: Person,
): Promise<{ person: Person; facts: PersonalFact[] }> {
  const facts = await listFacts(pool, person.id, { includeHistory: true })
  return { person, facts }
}
