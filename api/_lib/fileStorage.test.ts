import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock S3Client để test logic saveR2() OFFLINE (không cần Cloudflare thật).
const sendMock = vi.fn(async (cmd: { input: Record<string, unknown> }) => {
  void cmd
  return {}
})
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: sendMock })),
  PutObjectCommand: vi.fn((input: unknown) => ({ input })),
}))

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  sendMock.mockClear()
  process.env = { ...ORIGINAL_ENV }
})
afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('saveAudio — driver r2', () => {
  it('thiếu biến môi trường bắt buộc (R2_ACCOUNT_ID) → throw rõ ràng, không âm thầm lưu sai chỗ', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_BUCKET = 'test-bucket'
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev'
    // Cố tình KHÔNG set R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY (ca biên).
    const { saveAudio } = await import('./fileStorage')
    await expect(
      saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4)),
    ).rejects.toThrow(/R2_ACCOUNT_ID/)
  })

  it('thiếu R2_BUCKET/R2_PUBLIC_BASE_URL (đã có credentials) → throw rõ ràng', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    // Thiếu R2_BUCKET/R2_PUBLIC_BASE_URL.
    const { saveAudio } = await import('./fileStorage')
    await expect(
      saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4)),
    ).rejects.toThrow(/R2_BUCKET/)
  })

  it('đủ cấu hình → upload đúng key (bucket/fileName) và trả public URL không có dấu / trùng', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    process.env.R2_BUCKET = 'test-bucket'
    // Cố tình có dấu / thừa ở cuối (ca biên) — phải tự chuẩn hóa, không tạo URL có "//".
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev/'

    const { saveAudio } = await import('./fileStorage')
    const url = await saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4))

    expect(url).toBe('https://pub-abc.r2.dev/tts-cache/en-US/female/abc.mp3')
    expect(sendMock).toHaveBeenCalledTimes(1)
    const firstCall = sendMock.mock.calls[0]
    if (!firstCall) throw new Error('sendMock chưa từng được gọi')
    expect(firstCall[0].input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'tts-cache/en-US/female/abc.mp3',
      ContentType: 'audio/mpeg',
    })
  })
})
