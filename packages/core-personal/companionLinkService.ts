// packages/core-personal/companionLinkService.ts — "Người thân theo dõi": tạo mã mời, nhận mã,
// liệt kê, gỡ liên kết.
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
//
// BA LUẬT ĐƯỢC ÉP Ở ĐÂY (contract Zod chỉ tả hình dạng, không ép được hành vi):
//
//   1. CHIỀU CẤP QUYỀN LÀ MỘT — chỉ người học tạo mã, chỉ người khác nhập mã. Không có hàm nào
//      cho phép một người tự gắn mình làm watcher của người khác, hay gắn hộ người thứ ba.
//   2. MÃ DÙNG MỘT LẦN, CÓ HẠN — `redeemInvite` kiểm `used_at is null and expires_at > now()`
//      NGAY TRONG CÂU UPDATE (không đọc rồi mới ghi), nên hai người cùng nhập một mã thì đúng
//      một người thắng. Hết hạn tính lúc đọc, không phụ thuộc job dọn.
//   3. TRẦN SỐ NGƯỜI THEO DÕI kiểm trong CÙNG transaction với lúc tạo liên kết — kiểm ngoài
//      transaction thì hai mã nhập đồng thời sẽ vượt trần.
//
// Cùng khuôn `consentService.ts`: nhận `pool` làm tham số đầu (test mock được), quyền sở hữu
// luôn kiểm bằng `learner_id` NGAY TRONG câu SQL — không tin id client gửi lên.

import type { Pool } from 'pg'
import { withTransaction } from '@dhcb/core-db/transaction'
import { ForbiddenError, NotFoundError } from '@dhcb/core-errors/appError'
import {
  CompanionLinkSchema,
  COMPANION_LINK_SCHEMA_VERSION,
  type CompanionInvite,
  type CompanionLink,
  type CompanionRelation,
} from '@dhcb/core-contracts/companionLink'

// Bộ ký tự bỏ 0/O/1/I/L để đọc lại qua điện thoại không nhầm — giống friends.ts/referral.ts.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
// Dài hơn friend_code (8) vì mã này mở quyền XEM TIẾN ĐỘ: 12 ký tự trên bộ 31 ≈ 59 bit, đoán mò
// không tới được trong 24 giờ sống của mã.
const CODE_LENGTH = 12
const MAX_CODE_ATTEMPTS = 8

/** Hạn sống của mã mời. Ngắn có chủ đích — mã lộ ra ngoài thì cũng chỉ lộ trong một ngày. */
export const INVITE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Trần số người theo dõi mỗi người học. KHÔNG phải giới hạn kỹ thuật — là giới hạn SẢN PHẨM để
 * tính năng không trượt thành "cả họ giám sát" (mục 3.5 đặc tả). Đổi số này là đổi quyết định
 * sản phẩm, không phải chỉnh tham số.
 */
export const MAX_WATCHERS_PER_LEARNER = 2

function randomCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return out
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase()
}

interface LinkRow {
  id: string
  learner_id: string
  watcher_id: string
  relation: string
  last_report_at: Date | null
  created_at: Date
}

function toLink(row: LinkRow): CompanionLink {
  return CompanionLinkSchema.parse({
    id: row.id,
    learnerId: row.learner_id,
    watcherId: row.watcher_id,
    relation: row.relation,
    createdAt: row.created_at.toISOString(),
    ...(row.last_report_at ? { lastReportAt: row.last_report_at.toISOString() } : {}),
    schemaVersion: COMPANION_LINK_SCHEMA_VERSION,
  })
}

/**
 * Người học tạo mã mời mới. Mã cũ chưa dùng của chính người đó bị VÔ HIỆU (hết hạn ngay) — nếu
 * không, mỗi lần bấm "tạo mã" lại để rơi thêm một mã còn sống ngoài tự nhiên.
 */
export async function createInvite(pool: Pool, learnerId: string): Promise<CompanionInvite> {
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

  return withTransaction(pool, async (client) => {
    await client.query(
      `update public.companion_invites set expires_at = now()
       where learner_id = $1 and used_at is null and expires_at > now()`,
      [learnerId],
    )

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = randomCode()
      try {
        await client.query(
          `insert into public.companion_invites (code, learner_id, expires_at)
           values ($1, $2, $3)`,
          [code, learnerId, expiresAt],
        )
        return { code, expiresAt: expiresAt.toISOString() }
      } catch (err) {
        // 23505 = unique_violation: mã trùng (xác suất cực thấp) → thử mã khác.
        if ((err as { code?: string }).code !== '23505') throw err
      }
    }
    throw new Error('Không sinh được mã mời sau nhiều lần thử')
  })
}

export interface LearnerSummary {
  id: string
  name: string
}

/**
 * Xem trước mã: mã này là của ai. Cho người sắp nhập biết mình đang theo dõi đúng người.
 * KHÔNG tạo liên kết — chỉ đọc.
 */
export async function peekInvite(pool: Pool, rawCode: string): Promise<LearnerSummary | null> {
  const { rows } = await pool.query<{ id: string; name: string | null }>(
    `select u.id, p.name
     from public.companion_invites i
     join public.users u on u.id = i.learner_id
     left join public.profiles p on p.id = u.id
     where i.code = $1 and i.used_at is null and i.expires_at > now()`,
    [normalizeInviteCode(rawCode)],
  )
  const row = rows[0]
  if (!row) return null
  return { id: row.id, name: row.name ?? 'Người học' }
}

export type RedeemResult =
  | { ok: true; link: CompanionLink; learner: LearnerSummary }
  | { ok: false; reason: 'code_invalid' | 'self_link' | 'too_many_watchers' }

/**
 * Người theo dõi nhập mã. Toàn bộ nằm trong MỘT transaction: đánh dấu mã đã dùng, kiểm trần, tạo
 * liên kết. Hai người cùng nhập một mã ⇒ đúng một người thắng (câu update có `used_at is null`).
 */
export async function redeemInvite(
  pool: Pool,
  watcherId: string,
  rawCode: string,
  relation: CompanionRelation = 'family',
): Promise<RedeemResult> {
  const code = normalizeInviteCode(rawCode)

  return withTransaction(pool, async (client) => {
    // Giành mã: điều kiện nằm trong chính câu UPDATE nên không có khe đọc-rồi-ghi.
    const { rows: claimed } = await client.query<{ learner_id: string }>(
      `update public.companion_invites
       set used_by = $1, used_at = now()
       where code = $2 and used_at is null and expires_at > now()
       returning learner_id`,
      [watcherId, code],
    )
    const learnerId = claimed[0]?.learner_id
    if (!learnerId) return { ok: false as const, reason: 'code_invalid' as const }

    if (learnerId === watcherId) {
      // Tự theo dõi mình là vô nghĩa — trả mã về trạng thái chưa dùng để người học khỏi mất mã.
      await client.query(
        'update public.companion_invites set used_by = null, used_at = null where code = $1',
        [code],
      )
      return { ok: false as const, reason: 'self_link' as const }
    }

    // Khoá các dòng liên kết hiện có của người học rồi mới đếm — kiểm trần ngoài transaction thì
    // hai mã nhập đồng thời cùng thấy "còn chỗ" và cùng chèn.
    const { rows: existing } = await client.query<LinkRow>(
      `select id, learner_id, watcher_id, relation, last_report_at, created_at
       from public.companion_links where learner_id = $1 for update`,
      [learnerId],
    )
    const already = existing.find((r) => r.watcher_id === watcherId)
    if (already) {
      const learner = await readLearner(client, learnerId)
      return { ok: true as const, link: toLink(already), learner }
    }
    if (existing.length >= MAX_WATCHERS_PER_LEARNER) {
      await client.query(
        'update public.companion_invites set used_by = null, used_at = null where code = $1',
        [code],
      )
      return { ok: false as const, reason: 'too_many_watchers' as const }
    }

    const { rows: inserted } = await client.query<LinkRow>(
      `insert into public.companion_links (learner_id, watcher_id, relation)
       values ($1, $2, $3)
       returning id, learner_id, watcher_id, relation, last_report_at, created_at`,
      [learnerId, watcherId, relation],
    )
    const learner = await readLearner(client, learnerId)
    return { ok: true as const, link: toLink(inserted[0]!), learner }
  })
}

async function readLearner(
  client: { query: Pool['query'] },
  learnerId: string,
): Promise<LearnerSummary> {
  const { rows } = await client.query<{ id: string; name: string | null }>(
    `select u.id, p.name from public.users u
     left join public.profiles p on p.id = u.id where u.id = $1`,
    [learnerId],
  )
  return { id: learnerId, name: rows[0]?.name ?? 'Người học' }
}

export interface WatcherView {
  linkId: string
  userId: string
  name: string
  relation: CompanionRelation
  createdAt: string
  lastReportAt?: string
}

/** Người học xem ai đang theo dõi mình (luật riêng tư 3.7: luôn thấy được). */
export async function listWatchers(pool: Pool, learnerId: string): Promise<WatcherView[]> {
  const { rows } = await pool.query<LinkRow & { name: string | null }>(
    `select l.id, l.learner_id, l.watcher_id, l.relation, l.last_report_at, l.created_at, p.name
     from public.companion_links l
     left join public.profiles p on p.id = l.watcher_id
     where l.learner_id = $1
     order by l.created_at asc`,
    [learnerId],
  )
  return rows.map((r) => ({
    linkId: r.id,
    userId: r.watcher_id,
    name: r.name ?? 'Người thân',
    relation: r.relation as CompanionRelation,
    createdAt: r.created_at.toISOString(),
    ...(r.last_report_at ? { lastReportAt: r.last_report_at.toISOString() } : {}),
  }))
}

/** Người theo dõi xem mình đang theo dõi ai — để họ tự gỡ được, không phải xin người học gỡ hộ. */
export async function listFollowedLearners(
  pool: Pool,
  watcherId: string,
): Promise<Array<{ linkId: string; userId: string; name: string }>> {
  const { rows } = await pool.query<{ id: string; learner_id: string; name: string | null }>(
    `select l.id, l.learner_id, p.name
     from public.companion_links l
     left join public.profiles p on p.id = l.learner_id
     where l.watcher_id = $1
     order by l.created_at asc`,
    [watcherId],
  )
  return rows.map((r) => ({
    linkId: r.id,
    userId: r.learner_id,
    name: r.name ?? 'Người học',
  }))
}

/**
 * Gỡ liên kết. CẢ HAI bên đều gỡ được: người học vì đây là quyền của họ (luật 3.3), người theo
 * dõi vì không ai nên bị buộc phải nhận thư mãi mãi. Câu delete tự kiểm quyền bằng
 * `learner_id = $2 or watcher_id = $2` — không tin phía gọi đã kiểm hộ.
 */
export async function removeLink(pool: Pool, linkId: string, actorId: string): Promise<void> {
  const { rows } = await pool.query<{ learner_id: string; watcher_id: string }>(
    'select learner_id, watcher_id from public.companion_links where id = $1',
    [linkId],
  )
  const row = rows[0]
  if (!row) throw new NotFoundError('Không tìm thấy liên kết')
  if (row.learner_id !== actorId && row.watcher_id !== actorId) {
    throw new ForbiddenError('Không có quyền gỡ liên kết này')
  }
  await pool.query('delete from public.companion_links where id = $1', [linkId])
}
