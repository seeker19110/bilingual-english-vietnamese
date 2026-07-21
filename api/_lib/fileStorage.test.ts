import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

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
let tmpUploadsDir: string

beforeEach(async () => {
  vi.resetModules()
  sendMock.mockClear()
  process.env = { ...ORIGINAL_ENV }
  tmpUploadsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fileStorage-test-'))
  process.env.UPLOADS_DIR = tmpUploadsDir
})
afterEach(async () => {
  process.env = { ...ORIGINAL_ENV }
  await fs.rm(tmpUploadsDir, { recursive: true, force: true })
})

describe('saveAudio — driver r2', () => {
  it('thiếu biến môi trường bắt buộc (R2_ACCOUNT_ID) → fallback ghi local thay vì mất audio', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_BUCKET = 'test-bucket'
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev'
    // Cố tình KHÔNG set R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY (ca biên).
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { saveAudio } = await import('./fileStorage')
    const url = await saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4))
    // saveR2 lỗi (thiếu R2_ACCOUNT_ID) → saveAudio tự fallback ghi local (xem fileStorage.ts),
    // không được im lặng nuốt lỗi hay ném lỗi mất audio vừa sinh (tốn tiền gọi TTS).
    expect(url).toBe('/uploads/tts-cache/en-US/female/abc.mp3')
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('R2_ACCOUNT_ID'))
    errSpy.mockRestore()
  })

  it('thiếu R2_BUCKET/R2_PUBLIC_BASE_URL (đã có credentials) → fallback ghi local thay vì mất audio', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    // Thiếu R2_BUCKET/R2_PUBLIC_BASE_URL.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { saveAudio } = await import('./fileStorage')
    const url = await saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4))
    expect(url).toBe('/uploads/tts-cache/en-US/female/abc.mp3')
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('R2_BUCKET'))
    errSpy.mockRestore()
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
