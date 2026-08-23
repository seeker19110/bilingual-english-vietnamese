// Test trần mail/ngày + tự chuyển kênh dự phòng. Đây là logic quyết định "gửi qua đâu" nên sai
// ở đây nghĩa là hoặc bị nhà cung cấp khoá tài khoản gửi, hoặc người dùng không nhận được mã.
//  1. Còn hạn mức → dùng kênh chính.
//  2. Chạm trần + CÓ dự phòng → tự chuyển sang dự phòng (KHÔNG ngừng gửi).
//  3. Chạm trần + KHÔNG có dự phòng → quota_exceeded (báo rõ để đi cấu hình SES).
//  4. Kênh chính lỗi tạm thời → thử dự phòng.
//  5. Địa chỉ bị từ chối (sai email) → KHÔNG đổi kênh, vì đổi cũng vô ích.
//  6. Lỗi DB khi đếm → vẫn gửi được (fail-open).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const sent: { channel: string; status: string }[] = []
const behaviour: { primary: string; fallback: string } = { primary: 'sent', fallback: 'sent' }
vi.mock('./mailer.js', () => ({
  sendMail: async (_opts: unknown, channel: 'primary' | 'fallback' = 'primary') => {
    const status = channel === 'fallback' ? behaviour.fallback : behaviour.primary
    sent.push({ channel, status })
    return { status }
  },
  isMailerConfigured: (channel: 'primary' | 'fallback' = 'primary') =>
    channel === 'fallback'
      ? Boolean(process.env.SMTP_FALLBACK_HOST)
      : Boolean(process.env.SMTP_HOST),
}))

import { sendMailWithQuota, primaryDailyLimit, getDailyCounts } from './mailQuota.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()
const ORIGINAL_ENV = { ...process.env }
const MAIL = { to: 'a@b.com', subject: 's', text: 't' }

// Số thư kênh chính đã gửi hôm nay do test quy định.
function primarySentToday(n: number) {
  query.mockResolvedValueOnce({ rows: [{ primary_sent: n, fallback_sent: 0 }] })
}

beforeEach(() => {
  sent.length = 0
  behaviour.primary = 'sent'
  behaviour.fallback = 'sent'
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  process.env.SMTP_HOST = 'smtp.primary'
  delete process.env.SMTP_FALLBACK_HOST
  process.env.SMTP_DAILY_LIMIT = '100'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('primaryDailyLimit', () => {
  it('đọc từ biến môi trường, có mặc định an toàn khi giá trị vô lý', () => {
    process.env.SMTP_DAILY_LIMIT = '250'
    expect(primaryDailyLimit()).toBe(250)
    process.env.SMTP_DAILY_LIMIT = 'abc'
    expect(primaryDailyLimit()).toBe(280)
    process.env.SMTP_DAILY_LIMIT = '-5'
    expect(primaryDailyLimit()).toBe(280)
  })
})

describe('sendMailWithQuota', () => {
  it('còn hạn mức → gửi qua kênh CHÍNH', async () => {
    primarySentToday(10)
    const r = await sendMailWithQuota(MAIL)
    expect(r.channel).toBe('primary')
    expect(r.switchedToFallback).toBe(false)
    expect(sent.map((s) => s.channel)).toEqual(['primary'])
  })

  it('CHẠM TRẦN + có dự phòng → tự chuyển sang dự phòng, KHÔNG ngừng gửi', async () => {
    process.env.SMTP_FALLBACK_HOST = 'email-smtp.ap-southeast-1.amazonaws.com'
    primarySentToday(100) // = trần
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('sent')
    expect(r.channel).toBe('fallback')
    expect(r.switchedToFallback).toBe(true)
    // Không hề thử kênh chính nữa — tránh bị nhà cung cấp phạt vì vượt hạn mức.
    expect(sent.map((s) => s.channel)).toEqual(['fallback'])
  })

  it('CHẠM TRẦN + KHÔNG có dự phòng → quota_exceeded, không gửi gì', async () => {
    primarySentToday(150)
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('quota_exceeded')
    expect(r.channel).toBeNull()
    expect(sent).toEqual([])
  })

  it('kênh chính lỗi tạm thời → thử kênh dự phòng', async () => {
    process.env.SMTP_FALLBACK_HOST = 'ses'
    behaviour.primary = 'error'
    primarySentToday(0)
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('sent')
    expect(r.channel).toBe('fallback')
    // switchedToFallback=false vì chuyển do LỖI, không phải do chạm trần.
    expect(r.switchedToFallback).toBe(false)
    expect(sent.map((s) => s.channel)).toEqual(['primary', 'fallback'])
  })

  it('địa chỉ bị TỪ CHỐI (sai email) → KHÔNG đổi kênh vì đổi cũng vô ích', async () => {
    process.env.SMTP_FALLBACK_HOST = 'ses'
    behaviour.primary = 'rejected'
    primarySentToday(0)
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('rejected')
    expect(sent.map((s) => s.channel)).toEqual(['primary'])
  })

  it('kênh chính chưa cấu hình + không có dự phòng → trả not_configured', async () => {
    delete process.env.SMTP_HOST
    behaviour.primary = 'not_configured'
    primarySentToday(0)
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('not_configured')
    expect(r.channel).toBeNull()
  })

  it('CẢ HAI kênh đều lỗi → trả lỗi của kênh dự phòng, không throw', async () => {
    process.env.SMTP_FALLBACK_HOST = 'ses'
    behaviour.primary = 'error'
    behaviour.fallback = 'error'
    primarySentToday(0)
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('error')
    expect(sent.map((s) => s.channel)).toEqual(['primary', 'fallback'])
  })

  it('gửi xong có tăng bộ đếm đúng cột của kênh đã dùng', async () => {
    primarySentToday(5)
    await sendMailWithQuota(MAIL)
    const incr = query.mock.calls.find((c) =>
      String(c[0]).includes('insert into public.email_daily_usage'),
    )
    expect(String(incr?.[0])).toContain('primary_sent')
  })
})

describe('getDailyCounts', () => {
  it('lỗi DB → coi như chưa gửi thư nào (fail-open, không chặn nhầm người dùng)', async () => {
    query.mockRejectedValueOnce(new Error('db down'))
    const c = await getDailyCounts()
    expect(c.primarySent).toBe(0)
    expect(c.fallbackSent).toBe(0)
  })

  it('lỗi DB lúc gửi vẫn KHÔNG chặn được mail (fail-open toàn luồng)', async () => {
    query.mockRejectedValue(new Error('db down'))
    const r = await sendMailWithQuota(MAIL)
    expect(r.status).toBe('sent')
    expect(r.channel).toBe('primary')
  })
})
