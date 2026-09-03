// Test companionLinkService — "Người thân theo dõi".
// Mock `pg` Pool bằng tay (cùng khuôn consentService.test.ts) để kiểm HÀNH VI DOMAIN mà không
// cần Postgres thật: chiều cấp quyền, mã dùng một lần, trần số người theo dõi, quyền gỡ.

import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  createInvite,
  peekInvite,
  redeemInvite,
  listWatchers,
  listFollowedLearners,
  removeLink,
  normalizeInviteCode,
  MAX_WATCHERS_PER_LEARNER,
  INVITE_TTL_MS,
} from './companionLinkService.js'
import { ForbiddenError, NotFoundError } from '@dhcb/core-errors/appError'
import { WeeklyReportDataSchema } from '@dhcb/core-contracts/companionLink'

const LEARNER = '11111111-1111-4111-8111-111111111111'
const WATCHER = '22222222-2222-4222-8222-222222222222'
const OTHER = '33333333-3333-4333-8333-333333333333'
const LINK_ID = '44444444-4444-4444-8444-444444444444'
const NOW = new Date('2026-08-26T00:00:00.000Z')

interface LinkRowLike {
  id: string
  learner_id: string
  watcher_id: string
  relation: string
  last_report_at: Date | null
  created_at: Date
  name?: string | null
}

function linkRow(over: Partial<LinkRowLike> = {}): LinkRowLike {
  return {
    id: LINK_ID,
    learner_id: LEARNER,
    watcher_id: WATCHER,
    relation: 'family',
    last_report_at: null,
    created_at: NOW,
    ...over,
  }
}

/** `handler` nhận SQL đã lowercase để so khớp cho gọn; trả về `rows`. */
function mockPool(handler: (sql: string, params: unknown[]) => unknown[]) {
  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const t = sql.trim().toLowerCase()
    if (t === 'begin' || t === 'commit' || t === 'rollback') return { rows: [] }
    return { rows: handler(t, params) }
  })
  const client = { query, release: vi.fn() }
  const pool = { query, connect: vi.fn(async () => client) } as unknown as Pool
  return { pool, query }
}

describe('normalizeInviteCode', () => {
  it('bỏ khoảng trắng và viết hoa — người dùng gõ tay kiểu gì cũng khớp', () => {
    expect(normalizeInviteCode('  abcdefgh2345 ')).toBe('ABCDEFGH2345')
  })
})

describe('createInvite', () => {
  it('vô hiệu mã cũ chưa dùng rồi mới sinh mã mới', async () => {
    const seen: string[] = []
    const { pool } = mockPool((sql) => {
      seen.push(sql.split('\n')[0]!.trim())
      return []
    })

    const invite = await createInvite(pool, LEARNER)

    expect(seen[0]).toContain('update public.companion_invites set expires_at = now()')
    expect(seen[1]).toContain('insert into public.companion_invites')
    expect(invite.code).toMatch(/^[A-HJ-NP-Z2-9]{12}$/)
    // Hạn 24 giờ — mã lộ ra ngoài chỉ lộ trong một ngày.
    const ttl = new Date(invite.expiresAt).getTime() - Date.now()
    expect(ttl).toBeGreaterThan(INVITE_TTL_MS - 5_000)
    expect(ttl).toBeLessThanOrEqual(INVITE_TTL_MS)
  })

  // TEST CANH GÁC (audit 2026-08-28, F6): mã mời mở quyền XEM tiến độ học của người khác nên
  // phải sinh từ nguồn MẬT MÃ (`crypto.randomInt`), không phải `Math.random`. Cách canh: ghim
  // `Math.random` về một hằng số — nếu code lỡ quay lại dùng nó, mọi ký tự trong mã sẽ giống
  // hệt nhau và hai mã liên tiếp sẽ trùng nhau. Với crypto thì ghim vô hại.
  it('sinh mã KHÔNG phụ thuộc Math.random (nguồn mật mã)', async () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    try {
      const { pool } = mockPool(() => [])
      const a = await createInvite(pool, LEARNER)
      const b = await createInvite(pool, LEARNER)

      expect(a.code).not.toBe(b.code)
      // Không phải 12 lần cùng một ký tự (dấu hiệu Math.random bị ghim).
      expect(new Set(a.code).size).toBeGreaterThan(1)
      expect(spy).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })

  it('mã trùng (23505) thì thử mã khác, không ném lỗi ra ngoài', async () => {
    let inserts = 0
    const query = vi.fn(async (sql: string) => {
      const t = sql.trim().toLowerCase()
      if (t === 'begin' || t === 'commit' || t === 'rollback') return { rows: [] }
      if (t.startsWith('insert into public.companion_invites')) {
        inserts++
        if (inserts === 1) throw Object.assign(new Error('dup'), { code: '23505' })
      }
      return { rows: [] }
    })
    const client = { query, release: vi.fn() }
    const pool = { query, connect: vi.fn(async () => client) } as unknown as Pool

    const invite = await createInvite(pool, LEARNER)
    expect(inserts).toBe(2)
    expect(invite.code).toHaveLength(12)
  })
})

describe('peekInvite', () => {
  it('mã hết hạn/đã dùng → null (điều kiện nằm trong SQL, không lọc ở JS)', async () => {
    const { pool, query } = mockPool(() => [])
    expect(await peekInvite(pool, 'ABCDEFGH2345')).toBeNull()
    const sql = String(query.mock.calls[0]![0]).toLowerCase()
    expect(sql).toContain('used_at is null')
    expect(sql).toContain('expires_at > now()')
  })

  it('không có tên hồ sơ vẫn trả tên mặc định, không trả null tên', async () => {
    const { pool } = mockPool(() => [{ id: LEARNER, name: null }])
    expect(await peekInvite(pool, 'abcdefgh2345')).toEqual({ id: LEARNER, name: 'Người học' })
  })
})

describe('redeemInvite', () => {
  it('giành mã bằng chính câu UPDATE — hai người cùng nhập thì người sau trượt', async () => {
    // Lượt update thứ hai trả 0 dòng: mã đã bị người trước giành.
    let claims = 0
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('update public.companion_invites\n       set used_by')) {
        claims++
        return claims === 1 ? [{ learner_id: LEARNER }] : []
      }
      if (sql.startsWith('select id, learner_id')) return []
      if (sql.startsWith('insert into public.companion_links')) return [linkRow()]
      if (sql.startsWith('select u.id, p.name')) return [{ id: LEARNER, name: 'Bé Na' }]
      return []
    })

    const first = await redeemInvite(pool, WATCHER, 'ABCDEFGH2345')
    expect(first.ok).toBe(true)

    const second = await redeemInvite(pool, OTHER, 'ABCDEFGH2345')
    expect(second).toEqual({ ok: false, reason: 'code_invalid' })
  })

  it('tự theo dõi chính mình → trả mã về trạng thái chưa dùng', async () => {
    const restored: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('update public.companion_invites\n       set used_by')) {
        return [{ learner_id: LEARNER }]
      }
      if (sql.includes('set used_by = null')) {
        restored.push(sql)
        return []
      }
      return []
    })

    const res = await redeemInvite(pool, LEARNER, 'ABCDEFGH2345')
    expect(res).toEqual({ ok: false, reason: 'self_link' })
    expect(restored).toHaveLength(1)
  })

  it('nhập lại khi đã liên kết → idempotent, không tạo dòng thứ hai', async () => {
    const inserts: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('update public.companion_invites\n       set used_by')) {
        return [{ learner_id: LEARNER }]
      }
      if (sql.startsWith('select id, learner_id')) return [linkRow()]
      if (sql.startsWith('insert into public.companion_links')) {
        inserts.push(sql)
        return [linkRow()]
      }
      if (sql.startsWith('select u.id, p.name')) return [{ id: LEARNER, name: 'Bé Na' }]
      return []
    })

    const res = await redeemInvite(pool, WATCHER, 'ABCDEFGH2345')
    expect(res.ok).toBe(true)
    expect(inserts).toHaveLength(0)
  })

  it('chạm trần người theo dõi → từ chối và trả mã về chưa dùng', async () => {
    const full = Array.from({ length: MAX_WATCHERS_PER_LEARNER }, (_, i) =>
      linkRow({ id: `link-${i}`, watcher_id: `w-${i}` }),
    )
    const restored: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('update public.companion_invites\n       set used_by')) {
        return [{ learner_id: LEARNER }]
      }
      if (sql.startsWith('select id, learner_id')) return full
      if (sql.includes('set used_by = null')) {
        restored.push(sql)
        return []
      }
      return []
    })

    const res = await redeemInvite(pool, WATCHER, 'ABCDEFGH2345')
    expect(res).toEqual({ ok: false, reason: 'too_many_watchers' })
    expect(restored).toHaveLength(1)
  })

  it('đếm trần trong cùng transaction và KHOÁ dòng (for update)', async () => {
    const seen: string[] = []
    const { pool } = mockPool((sql) => {
      seen.push(sql)
      if (sql.startsWith('update public.companion_invites\n       set used_by')) {
        return [{ learner_id: LEARNER }]
      }
      if (sql.startsWith('select id, learner_id')) return []
      if (sql.startsWith('insert into public.companion_links')) return [linkRow()]
      return [{ id: LEARNER, name: 'Bé Na' }]
    })
    await redeemInvite(pool, WATCHER, 'ABCDEFGH2345')
    expect(seen.some((s) => s.includes('for update'))).toBe(true)
  })
})

describe('listWatchers / listFollowedLearners', () => {
  it('người học luôn thấy ai đang theo dõi mình (luật riêng tư 3.7)', async () => {
    const { pool } = mockPool(() => [linkRow({ name: 'Mẹ', last_report_at: NOW })])
    const rows = await listWatchers(pool, LEARNER)
    expect(rows).toEqual([
      {
        linkId: LINK_ID,
        userId: WATCHER,
        name: 'Mẹ',
        relation: 'family',
        createdAt: NOW.toISOString(),
        lastReportAt: NOW.toISOString(),
      },
    ])
  })

  it('người theo dõi tự xem được mình theo dõi ai (để tự gỡ)', async () => {
    const { pool } = mockPool(() => [{ id: LINK_ID, learner_id: LEARNER, name: null }])
    expect(await listFollowedLearners(pool, WATCHER)).toEqual([
      { linkId: LINK_ID, userId: LEARNER, name: 'Người học' },
    ])
  })
})

describe('removeLink', () => {
  it('người học gỡ được', async () => {
    const deleted: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('delete')) {
        deleted.push(sql)
        return []
      }
      return [{ learner_id: LEARNER, watcher_id: WATCHER }]
    })
    await removeLink(pool, LINK_ID, LEARNER)
    expect(deleted).toHaveLength(1)
  })

  it('người theo dõi cũng gỡ được — không ai bị buộc nhận thư mãi mãi', async () => {
    const deleted: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('delete')) {
        deleted.push(sql)
        return []
      }
      return [{ learner_id: LEARNER, watcher_id: WATCHER }]
    })
    await removeLink(pool, LINK_ID, WATCHER)
    expect(deleted).toHaveLength(1)
  })

  it('người ngoài cuộc gỡ → ForbiddenError, KHÔNG xoá gì', async () => {
    const deleted: string[] = []
    const { pool } = mockPool((sql) => {
      if (sql.startsWith('delete')) {
        deleted.push(sql)
        return []
      }
      return [{ learner_id: LEARNER, watcher_id: WATCHER }]
    })
    await expect(removeLink(pool, LINK_ID, OTHER)).rejects.toBeInstanceOf(ForbiddenError)
    expect(deleted).toHaveLength(0)
  })

  it('liên kết không tồn tại → NotFoundError', async () => {
    const { pool } = mockPool(() => [])
    await expect(removeLink(pool, LINK_ID, LEARNER)).rejects.toBeInstanceOf(NotFoundError)
  })
})

// ── Canh gác riêng tư ────────────────────────────────────────────────────────
// Test này KHÔNG kiểm code chạy mà kiểm QUYẾT ĐỊNH SẢN PHẨM: danh sách trường người theo dõi
// được thấy là ĐÓNG (mục 3.4 đặc tả). Thêm trường vào contract mà không đọc lại đặc tả thì test
// này đỏ — đó là mục đích. Cùng tinh thần 7 test bất biến chặn rò con số năng lực.
describe('canh gác: danh sách trường báo cáo là ĐÓNG', () => {
  it('đúng bộ trường đã chốt, không hơn', () => {
    expect(Object.keys(WeeklyReportDataSchema.shape).sort()).toEqual(
      [
        'cefrLevel',
        'cefrPercent',
        'daysStudied',
        'direction',
        'learnerName',
        'wordsPracticed',
        'streakDays',
        'topicHint',
        'weekStart',
        'weeklyGoalDays',
      ].sort(),
    )
  })

  it('từ chối trường lạ — kể cả trường nghe vô hại', () => {
    const base = {
      learnerName: 'Bé Na',
      weekStart: '2026-08-24',
      daysStudied: 4,
      weeklyGoalDays: 5,
      streakDays: 9,
      wordsPracticed: 110,
    }
    expect(WeeklyReportDataSchema.safeParse(base).success).toBe(true)
    for (const leak of ['chatMessages', 'moodScore', 'abilityScore', 'mistakes', 'lastLocation']) {
      expect(WeeklyReportDataSchema.safeParse({ ...base, [leak]: 'x' }).success).toBe(false)
    }
  })
})
