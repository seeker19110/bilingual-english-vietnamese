// Test quên mật khẩu — 2 điểm bảo mật bắt buộc đúng của MỌI tính năng "quên mật khẩu":
//  1. requestPasswordReset KHÔNG được lộ email nào tồn tại (chống dò email hàng loạt) — phải
//     chạy qua cùng 1 đường (không throw, không phân nhánh quan sát được từ bên ngoài) dù email
//     tồn tại, không tồn tại, hay là tài khoản Google-only không có mật khẩu.
//  2. resetPassword: token dùng 1 lần (used_at chặn dùng lại), hết hạn bị từ chối, và ĐẶC BIỆT
//     phải THU HỒI TOÀN BỘ SESSION CŨ sau khi đổi thành công.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('./authService', () => ({
  hashPassword: async (pw: string) => `hashed:${pw}`,
}))
const mailCalls: unknown[] = []
vi.mock('./mailQuota', () => ({
  sendMailWithQuota: async (opts: unknown) => {
    mailCalls.push(opts)
    return { status: 'sent', channel: 'primary', switchedToFallback: false }
  },
}))

import { requestPasswordReset, resetPassword } from './passwordReset'
import { getPgPool } from './pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  mailCalls.length = 0
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

describe('requestPasswordReset', () => {
  it('email KHÔNG tồn tại → không gửi mail, không throw (chống dò email)', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    await expect(requestPasswordReset('khong-ton-tai@x.com')).resolves.toBeUndefined()
    expect(mailCalls).toEqual([])
  })

  it('tài khoản Google-only (không có mật khẩu) → không gửi mail, không throw', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 'u1', password_hash: null }] })
    await expect(requestPasswordReset('google@x.com')).resolves.toBeUndefined()
    expect(mailCalls).toEqual([])
  })

  it('email hợp lệ có mật khẩu → gửi mail chứa link reset', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1', password_hash: 'hash' }] })
      .mockResolvedValueOnce({ rows: [] }) // không có token gần đây
    await requestPasswordReset('thuc@x.com')
    expect(mailCalls).toHaveLength(1)
    const mail = mailCalls[0] as { to: string; text: string }
    expect(mail.to).toBe('thuc@x.com')
    expect(mail.text).toContain('/reset-password?token=')
  })

  it('chặn gửi lại quá nhanh (cooldown) — không gửi mail lần 2', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: 'u1', password_hash: 'hash' }] })
      .mockResolvedValueOnce({ rows: [{ created_at: new Date(Date.now() - 5_000) }] })
    await requestPasswordReset('thuc@x.com')
    expect(mailCalls).toEqual([])
  })

  it('chuẩn hoá email về chữ thường trước khi tra cứu', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    await requestPasswordReset('  ABC@Example.com  ')
    expect(query.mock.calls[0]?.[1]).toEqual(['abc@example.com'])
  })
})

describe('resetPassword', () => {
  const future = () => new Date(Date.now() + 60_000)
  const past = () => new Date(Date.now() - 60_000)

  it('token không tồn tại → invalid_or_expired', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    expect(await resetPassword('token-la', 'matkhaumoi')).toEqual({
      ok: false,
      reason: 'invalid_or_expired',
    })
  })

  it('token ĐÃ DÙNG rồi → already_used, không đổi mật khẩu lần 2', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'r1', user_id: 'u1', expires_at: future(), used_at: new Date() }],
    })
    const r = await resetPassword('token', 'matkhaumoi')
    expect(r).toEqual({ ok: false, reason: 'already_used' })
    expect(query.mock.calls.some((c) => String(c[0]).includes('update public.users'))).toBe(false)
  })

  it('token HẾT HẠN → invalid_or_expired dù nhập đúng', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'r1', user_id: 'u1', expires_at: past(), used_at: null }],
    })
    expect(await resetPassword('token', 'matkhaumoi')).toEqual({
      ok: false,
      reason: 'invalid_or_expired',
    })
  })

  it('hợp lệ → đổi mật khẩu VÀ thu hồi toàn bộ session cũ', async () => {
    query.mockResolvedValueOnce({
      rows: [{ id: 'r1', user_id: 'u1', expires_at: future(), used_at: null }],
    })
    const r = await resetPassword('token', 'matkhaumoi')
    expect(r).toEqual({ ok: true })

    expect(
      query.mock.calls.some((c) => String(c[0]).includes('password_resets set used_at = now()')),
    ).toBe(true)

    const updateUser = query.mock.calls.find((c) => String(c[0]).includes('update public.users'))
    expect((updateUser?.[1] as unknown[])[0]).toBe('hashed:matkhaumoi')

    // Chốt bảo mật quan trọng nhất của tính năng này: xoá TOÀN BỘ session, không phải 1 cái.
    const revoke = query.mock.calls.find((c) =>
      String(c[0]).includes('delete from public.sessions'),
    )
    expect(revoke).toBeDefined()
    expect((revoke?.[1] as unknown[])[0]).toBe('u1')
  })
})
