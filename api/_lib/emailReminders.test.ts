import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendEmailReminders } from './emailReminders.js'

vi.mock('../../packages/core-db/pgPool.js', () => {
  const query = vi.fn()
  return { getPgPool: () => ({ query }) }
})

vi.mock('./mailQuota.js', () => ({
  sendMailWithQuota: vi.fn(() => Promise.resolve({ status: 'sent', channel: 'primary' })),
}))

import { getPgPool } from '../../packages/core-db/pgPool.js'
import { sendMailWithQuota } from './mailQuota.js'

describe('sendEmailReminders', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('không gửi nếu không có ai chưa học', async () => {
    // 1. studiedRows: 0 hàng
    queryMock.mockResolvedValueOnce({ rows: [] })
    // 2. activeRows: 0 hàng
    queryMock.mockResolvedValueOnce({ rows: [] })

    const res = await sendEmailReminders()
    expect(res.sent).toBe(0)
    expect(res.skipped).toBe(0)
  })

  it('gửi email thành công cho user đủ điều kiện', async () => {
    // 1. studiedUserIds: u1 đã học -> rỗng
    queryMock.mockResolvedValueOnce({ rows: [] })
    // 2. activeUserIds: u2 có hoạt động
    queryMock.mockResolvedValueOnce({ rows: [{ user_id: 'u2' }] })
    // 3. pushSubs: u2 không có push
    queryMock.mockResolvedValueOnce({ rows: [] })
    // 4. recentReminders: u2 không nằm trong cooldown
    queryMock.mockResolvedValueOnce({ rows: [] })
    // 5. userEmails: tìm thấy email của u2
    queryMock.mockResolvedValueOnce({ rows: [{ id: 'u2', email: 'test@example.com' }] })
    // 6. recentUsage: daily usage của u2 trong 14 ngày qua
    queryMock.mockResolvedValueOnce({ rows: [{ user_id: 'u2', day: '2026-08-03', chat_count: 1 }] })
    // 7. progress: learning progress của u2
    queryMock.mockResolvedValueOnce({
      rows: [{ user_id: 'u2', srs: {}, weekly_goal: { goal: 5 } }],
    })

    // 8. update email_reminders (sau khi gửi thành công)
    queryMock.mockResolvedValueOnce({ rows: [] })

    const res = await sendEmailReminders()
    expect(res.sent).toBe(1)
    expect(res.skipped).toBe(0)
    expect(sendMailWithQuota).toHaveBeenCalledOnce()
  })
})
