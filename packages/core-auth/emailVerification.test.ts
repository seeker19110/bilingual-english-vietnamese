// Test xác thực email — các ca biên quan trọng vì đây là hàng rào chống tài khoản giả:
//  1. Đã xác thực rồi thì không gửi lại.
//  2. Chặn gửi lại trong vòng 60s (cooldown) — chống đốt hạn mức mail.
//  3. Mã lưu trong DB phải là HASH, không phải mã gốc.
//  4. Sai mã → tăng attempts; quá 5 lần → khoá, phải gửi mã mới.
//  5. Mã hết hạn → từ chối.
//  6. Đúng mã → đánh dấu email_verified + xoá mã (dùng 1 lần).

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createHash } from 'node:crypto'

vi.mock('../core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const mailState: { status: string } = { status: 'sent' }
// emailVerification gửi qua mailQuota (kiểm soát hạn mức + tự chuyển kênh dự phòng) chứ không
// gọi thẳng mailer — mock ở đúng tầng này, hành vi hạn mức/chuyển kênh có test riêng ở
// mailQuota.test.ts, ở đây chỉ cần giả lập kết quả gửi cuối cùng.
vi.mock('../../api/_lib/mailQuota', () => ({
  sendMailWithQuota: async () => ({
    status: mailState.status,
    channel: 'primary',
    switchedToFallback: false,
  }),
}))

import { sendVerificationCode, verifyCode, isEmailVerified } from './emailVerification'
import { getPgPool } from '../core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  mailState.status = 'sent'
})

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

describe('sendVerificationCode', () => {
  it('từ chối khi email đã xác thực rồi', async () => {
    query.mockResolvedValueOnce({ rows: [{ email: 'a@b.com', email_verified: new Date() }] })
    const r = await sendVerificationCode('u1')
    expect(r).toEqual({ ok: false, reason: 'already_verified' })
  })

  it('từ chối khi không tìm thấy user', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const r = await sendVerificationCode('u1')
    expect(r).toEqual({ ok: false, reason: 'user_not_found' })
  })

  it('chặn gửi lại khi chưa quá 60s (chống đốt hạn mức mail)', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', email_verified: null }] })
      .mockResolvedValueOnce({ rows: [{ last_sent_at: new Date(Date.now() - 5_000) }] })
    const r = await sendVerificationCode('u1')
    expect(r).toEqual({ ok: false, reason: 'cooldown' })
  })

  it('cho gửi lại khi đã quá 60s', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', email_verified: null }] })
      .mockResolvedValueOnce({ rows: [{ last_sent_at: new Date(Date.now() - 120_000) }] })
    const r = await sendVerificationCode('u1')
    expect(r).toEqual({ ok: true, mail: 'sent' })
  })

  it('LƯU HASH của mã, không lưu mã gốc', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', email_verified: null }] })
      .mockResolvedValueOnce({ rows: [] })
    await sendVerificationCode('u1')

    const insertCall = query.mock.calls.find((c) =>
      String(c[0]).includes('insert into public.email_verifications'),
    )
    const storedHash = (insertCall?.[1] as unknown[])[1] as string
    // Hash hex 64 ký tự, và KHÔNG phải chuỗi 6 chữ số.
    expect(storedHash).toMatch(/^[a-f0-9]{64}$/)
    expect(storedHash).not.toMatch(/^\d{6}$/)
  })

  it('trả trạng thái gửi thật (rejected = địa chỉ bị từ chối)', async () => {
    mailState.status = 'rejected'
    query
      .mockResolvedValueOnce({ rows: [{ email: 'sai@khong-ton-tai.xyz', email_verified: null }] })
      .mockResolvedValueOnce({ rows: [] })
    const r = await sendVerificationCode('u1')
    expect(r).toEqual({ ok: true, mail: 'rejected' })
  })
})

describe('verifyCode', () => {
  const future = () => new Date(Date.now() + 60_000)

  it('không có mã đang chờ → báo no_code', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const r = await verifyCode('u1', '123456')
    expect(r).toEqual({ ok: false, reason: 'no_code' })
  })

  it('quá số lần nhập sai → khoá, không cho thử tiếp', async () => {
    query.mockResolvedValueOnce({
      rows: [{ code_hash: sha256('123456'), expires_at: future(), attempts: 5 }],
    })
    const r = await verifyCode('u1', '123456')
    expect(r).toEqual({ ok: false, reason: 'too_many_attempts' })
  })

  it('mã hết hạn → từ chối kể cả khi nhập đúng', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { code_hash: sha256('123456'), expires_at: new Date(Date.now() - 1_000), attempts: 0 },
      ],
    })
    const r = await verifyCode('u1', '123456')
    expect(r).toEqual({ ok: false, reason: 'expired' })
  })

  it('sai mã → tăng attempts trong DB', async () => {
    query.mockResolvedValueOnce({
      rows: [{ code_hash: sha256('123456'), expires_at: future(), attempts: 1 }],
    })
    const r = await verifyCode('u1', '999999')
    expect(r).toEqual({ ok: false, reason: 'wrong_code' })
    expect(query.mock.calls.some((c) => String(c[0]).includes('attempts = attempts + 1'))).toBe(
      true,
    )
  })

  it('đúng mã → đánh dấu đã xác thực và XOÁ mã (dùng 1 lần)', async () => {
    query.mockResolvedValueOnce({
      rows: [{ code_hash: sha256('123456'), expires_at: future(), attempts: 0 }],
    })
    const r = await verifyCode('u1', '123456')
    expect(r).toEqual({ ok: true })
    expect(query.mock.calls.some((c) => String(c[0]).includes('set email_verified = now()'))).toBe(
      true,
    )
    expect(
      query.mock.calls.some((c) => String(c[0]).includes('delete from public.email_verifications')),
    ).toBe(true)
  })

  it('bỏ khoảng trắng thừa quanh mã người dùng dán vào', async () => {
    query.mockResolvedValueOnce({
      rows: [{ code_hash: sha256('123456'), expires_at: future(), attempts: 0 }],
    })
    const r = await verifyCode('u1', '  123456  ')
    expect(r).toEqual({ ok: true })
  })
})

describe('isEmailVerified', () => {
  it('trả false khi chưa xác thực, true khi đã xác thực', async () => {
    query.mockResolvedValueOnce({ rows: [{ email_verified: null }] })
    expect(await isEmailVerified('u1')).toBe(false)

    query.mockResolvedValueOnce({ rows: [{ email_verified: new Date() }] })
    expect(await isEmailVerified('u1')).toBe(true)
  })

  it('user không tồn tại → false (không nổ lỗi)', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    expect(await isEmailVerified('u1')).toBe(false)
  })
})
