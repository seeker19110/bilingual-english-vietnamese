// packages/core-personal/consentService.ts — ConsentGrant service (V2-04 slice 1,
// docs/architecture-v2/21-ROADMAP.md mục "V2-04" + 02-SYSTEM-ARCHITECTURE.md mục 7).
//
// Consent = người dùng ĐỒNG Ý cho hệ thống dùng (scope, purpose) tới khi nào. Ba rule kiến trúc
// được ENFORCE ở đây (contract Zod chỉ tả hình dạng):
//
//   1. AUDIT TRAIL: revoke chỉ hạ `status`, cấp lại là INSERT bản MỚI `version = cũ + 1` — không
//      bao giờ update đè giá trị cũ, không bao giờ delete dòng. Phải trả lời được "ngày X người
//      này đồng ý điều gì, phiên bản mấy".
//   2. Tối đa 1 grant `active` cho mỗi (person, scope, purpose) — DB chặn cứng bằng partial unique
//      index (migration 0042); tầng này khoá row + revoke bản cũ trong CÙNG transaction để không
//      bao giờ chạm vào ràng buộc đó.
//   3. Hết hạn tính TRỰC TIẾP lúc đọc (`expires_at is null or expires_at > now()`), không phụ
//      thuộc job nền — grant quá hạn mà DB vẫn ghi 'active' thì vẫn coi như KHÔNG còn hiệu lực.
//      Sai lệch theo hướng an toàn (deny), không theo hướng cho phép.
//
// Cùng khuôn với `personService.ts`: nhận `pool` làm tham số đầu (test mock được), ownership luôn
// kiểm bằng `person_id` NGAY TRONG câu SQL — không tin `id` client gửi lên.

import type { Pool, PoolClient } from 'pg'
import { withTransaction } from '../core-db/transaction.js'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'
import {
  ConsentGrantSchema,
  CONSENT_GRANT_SCHEMA_VERSION,
  type ConsentGrant,
} from '../core-contracts/consentGrant.js'

interface ConsentRow {
  id: string
  person_id: string
  scope: string
  purpose: string
  version: number
  status: string
  granted_at: Date
  expires_at: Date | null
  revoked_at: Date | null
}

const CONSENT_COLUMNS = `id, person_id, scope, purpose, version, status, granted_at,
  expires_at, revoked_at`

function toConsent(row: ConsentRow): ConsentGrant {
  // Field optional: chỉ đưa vào khi có giá trị — contract dùng optional, không dùng nullable.
  return ConsentGrantSchema.parse({
    id: row.id,
    personId: row.person_id,
    scope: row.scope,
    purpose: row.purpose,
    // `integer` được driver `pg` trả về dạng số, nhưng Number() cho chắc nếu kiểu cột đổi.
    version: Number(row.version),
    status: row.status,
    grantedAt: row.granted_at.toISOString(),
    ...(row.expires_at ? { expiresAt: row.expires_at.toISOString() } : {}),
    ...(row.revoked_at ? { revokedAt: row.revoked_at.toISOString() } : {}),
    schemaVersion: CONSENT_GRANT_SCHEMA_VERSION,
  })
}

export interface GrantConsentInput {
  personId: string
  scope: string
  purpose: string
  /** ISO datetime. Bỏ trống = consent không tự hết hạn (chỉ mất hiệu lực khi bị revoke). */
  expiresAt?: string
}

/** Đọc grant đang `active` của (person, scope, purpose) và KHOÁ ROW để chống race hai request
 * cùng cấp lại một lúc (nếu không, cả hai cùng insert 'active' → vi phạm unique index). */
async function lockActiveConsent(
  client: PoolClient,
  personId: string,
  scope: string,
  purpose: string,
): Promise<ConsentRow | undefined> {
  const res = await client.query<ConsentRow>(
    `select ${CONSENT_COLUMNS} from personal.consent_grants
      where person_id = $1 and scope = $2 and purpose = $3 and status = 'active'
      for update`,
    [personId, scope, purpose],
  )
  return res.rows[0]
}

/**
 * Cấp consent cho (scope, purpose). Đã có bản `active` → thu hồi bản đó rồi INSERT bản mới với
 * `version` tăng 1 (KHÔNG update bản cũ) — giữ nguyên lịch sử ai đồng ý gì, lúc nào.
 */
export async function grantConsent(pool: Pool, input: GrantConsentInput): Promise<ConsentGrant> {
  return withTransaction(pool, async (client) => {
    const current = await lockActiveConsent(client, input.personId, input.scope, input.purpose)

    if (current) {
      await client.query(
        `update personal.consent_grants set status = 'revoked', revoked_at = now()
          where id = $1`,
        [current.id],
      )
    }

    const res = await client.query<ConsentRow>(
      `insert into personal.consent_grants
         (person_id, scope, purpose, version, status, expires_at)
       values ($1, $2, $3, $4, 'active', $5)
       returning ${CONSENT_COLUMNS}`,
      [
        input.personId,
        input.scope,
        input.purpose,
        current ? Number(current.version) + 1 : 1,
        input.expiresAt ?? null,
      ],
    )
    const row = res.rows[0]
    if (!row) throw new ConflictError('Không ghi được consent, thử lại')
    return toConsent(row)
  })
}

export interface ListConsentsOptions {
  /** true = trả cả bản đã revoke/hết hạn (dùng cho audit/export). */
  includeHistory?: boolean
  scope?: string
}

export async function listConsents(
  pool: Pool,
  personId: string,
  opts: ListConsentsOptions = {},
): Promise<ConsentGrant[]> {
  const conditions = ['person_id = $1']
  const params: unknown[] = [personId]
  if (!opts.includeHistory) conditions.push("status = 'active'")
  if (opts.scope) {
    params.push(opts.scope)
    conditions.push(`scope = $${params.length}`)
  }
  const res = await pool.query<ConsentRow>(
    `select ${CONSENT_COLUMNS} from personal.consent_grants
      where ${conditions.join(' and ')}
      order by granted_at asc, id asc`,
    params,
  )
  return res.rows.map(toConsent)
}

/**
 * Thu hồi consent. Xoá mềm: chỉ đổi `status`/`revoked_at`, KHÔNG xoá dòng.
 *
 * Quyết định (nhất quán với `deleteFact` ở personService.ts): không tồn tại / của người khác → 404;
 * đã revoked/expired rồi → 409, KHÔNG im lặng coi là thành công — người gọi cần phân biệt "tôi vừa
 * thu hồi" với "ai đó đã thu hồi trước tôi".
 */
export async function revokeConsent(
  pool: Pool,
  personId: string,
  consentId: string,
): Promise<void> {
  await withTransaction(pool, async (client) => {
    const res = await client.query<ConsentRow>(
      `select ${CONSENT_COLUMNS} from personal.consent_grants
        where id = $1 and person_id = $2
        for update`,
      [consentId, personId],
    )
    const current = res.rows[0]
    if (!current) throw new NotFoundError('Không tìm thấy consent')
    if (current.status !== 'active') {
      throw new ConflictError('Consent đã được thu hồi hoặc hết hạn trước đó')
    }
    await client.query(
      `update personal.consent_grants set status = 'revoked', revoked_at = now() where id = $1`,
      [current.id],
    )
  })
}

/**
 * (scope, purpose) này còn được đồng ý không? Đây là hàm mà Context Builder / tool execution SẼ
 * gọi trước khi đụng vào dữ liệu cá nhân (V2-07/V2-08) — slice này mới chỉ dựng sẵn điểm nối.
 *
 * Hết hạn được so trực tiếp trong SQL nên không cần job dọn `status='expired'`.
 */
export async function isConsentActive(
  pool: Pool,
  personId: string,
  scope: string,
  purpose: string,
): Promise<boolean> {
  const res = await pool.query<{ id: string }>(
    `select id from personal.consent_grants
      where person_id = $1 and scope = $2 and purpose = $3 and status = 'active'
        and (expires_at is null or expires_at > now())
      limit 1`,
    [personId, scope, purpose],
  )
  return res.rows.length > 0
}
