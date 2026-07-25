// Test mailer — phân loại đúng tình trạng gửi để UI báo cho người dùng chính xác:
//  1. Chưa cấu hình SMTP → 'not_configured' (lỗi phía mình, KHÔNG đổ lỗi email người dùng).
//  2. Máy chủ nhận từ chối địa chỉ → 'rejected' (nhiều khả năng gõ sai email).
//  3. Lỗi SMTP 5xx → 'rejected'; lỗi khác/4xx → 'error'.
//  4. Không bao giờ ném lỗi ra ngoài.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const sendMailMock = vi.fn()
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: sendMailMock }) },
}))

import { sendMail, isMailerConfigured } from './mailer'

const ORIGINAL_ENV = { ...process.env }

function configureSmtp() {
  process.env.SMTP_HOST = 'smtp.test'
  process.env.SMTP_USER = 'user@test'
  process.env.SMTP_PASS = 'pw'
}

beforeEach(() => {
  sendMailMock.mockReset()
  delete process.env.SMTP_HOST
  delete process.env.SMTP_USER
  delete process.env.SMTP_PASS
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

const MAIL = { to: 'a@b.com', subject: 's', text: 't' }

describe('mailer', () => {
  it('chưa cấu hình SMTP → not_configured, KHÔNG gọi gửi', async () => {
    expect(isMailerConfigured()).toBe(false)
    expect(await sendMail(MAIL)).toEqual({ status: 'not_configured' })
    expect(sendMailMock).not.toHaveBeenCalled()
  })

  it('gửi được → sent', async () => {
    configureSmtp()
    sendMailMock.mockResolvedValueOnce({ accepted: ['a@b.com'], rejected: [], response: '250 OK' })
    expect(await sendMail(MAIL)).toEqual({ status: 'sent', detail: '250 OK' })
  })

  it('máy chủ nhận TỪ CHỐI địa chỉ → rejected (gợi ý người dùng gõ sai email)', async () => {
    configureSmtp()
    sendMailMock.mockResolvedValueOnce({ accepted: [], rejected: ['a@b.com'], response: '550' })
    expect(await sendMail(MAIL)).toEqual({ status: 'rejected', detail: '550' })
  })

  it('lỗi SMTP 5xx (địa chỉ không tồn tại) → rejected', async () => {
    configureSmtp()
    sendMailMock.mockRejectedValueOnce(
      Object.assign(new Error('no such user'), { responseCode: 550 }),
    )
    expect((await sendMail(MAIL)).status).toBe('rejected')
  })

  it('lỗi tạm thời 4xx → error, KHÔNG đổ lỗi cho email người dùng', async () => {
    configureSmtp()
    sendMailMock.mockRejectedValueOnce(Object.assign(new Error('try later'), { responseCode: 421 }))
    expect((await sendMail(MAIL)).status).toBe('error')
  })

  it('lỗi mạng (không có mã SMTP) → error, không ném ra ngoài', async () => {
    configureSmtp()
    sendMailMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    await expect(sendMail(MAIL)).resolves.toEqual(expect.objectContaining({ status: 'error' }))
  })
})
