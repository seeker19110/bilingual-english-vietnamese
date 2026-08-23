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
  ListObjectsV2Command: vi.fn((input: unknown) => ({ input })),
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
  // ĐỔI HÀNH VI 2026-08-13: trước đây R2 lỗi thì fallback ghi local. Nhưng URL local đó bị lưu
  // vĩnh viễn vào tts_cache.audio_url → lần sau là "cache HIT giả" trả URL 404 và KHÔNG bao giờ
  // tự sinh lại. Nay ném lỗi để caller không ghi dòng cache hỏng.
  it('thiếu biến môi trường bắt buộc (R2_ACCOUNT_ID) → NÉM LỖI, không ghi local', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_BUCKET = 'test-bucket'
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev'
    // Cố tình KHÔNG set R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY (ca biên).
    const { saveAudio } = await import('./fileStorage.js')
    await expect(
      saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4)),
    ).rejects.toThrow(/R2_ACCOUNT_ID/)
    // Không được để lại file local nào — đó chính là nguồn của URL cache hỏng.
    await expect(fs.readdir(tmpUploadsDir)).resolves.toEqual([])
  })

  it('thiếu R2_BUCKET/R2_PUBLIC_BASE_URL (đã có credentials) → NÉM LỖI, không ghi local', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    // Thiếu R2_BUCKET/R2_PUBLIC_BASE_URL.
    const { saveAudio } = await import('./fileStorage.js')
    await expect(
      saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4)),
    ).rejects.toThrow(/R2_BUCKET/)
    await expect(fs.readdir(tmpUploadsDir)).resolves.toEqual([])
  })

  it('R2 sập giữa chừng (send ném lỗi) → NÉM LỖI, không nuốt im lặng', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    process.env.R2_BUCKET = 'test-bucket'
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev'
    sendMock.mockRejectedValueOnce(new Error('R2 quota exceeded'))
    const { saveAudio } = await import('./fileStorage.js')
    await expect(
      saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4)),
    ).rejects.toThrow(/quota exceeded/)
    await expect(fs.readdir(tmpUploadsDir)).resolves.toEqual([])
  })

  it('đủ cấu hình → upload đúng key (bucket/fileName) và trả public URL không có dấu / trùng', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    process.env.R2_BUCKET = 'test-bucket'
    // Cố tình có dấu / thừa ở cuối (ca biên) — phải tự chuẩn hóa, không tạo URL có "//".
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev/'

    const { saveAudio } = await import('./fileStorage.js')
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

describe('saveAudio — driver local', () => {
  it('ghi đúng đường dẫn lồng thư mục và trả URL tương đối khi không có baseUrl', async () => {
    process.env.STORAGE_DRIVER = 'local'
    const { saveAudio } = await import('./fileStorage.js')
    const url = await saveAudio('tts-cache', 'en-US/female/abc.mp3', new ArrayBuffer(4))
    expect(url).toBe('/uploads/tts-cache/en-US/female/abc.mp3')
    // File phải nằm thật trên đĩa, đúng cây thư mục (mkdir -p).
    const written = await fs.readFile(path.join(tmpUploadsDir, 'tts-cache/en-US/female/abc.mp3'))
    expect(written.length).toBe(4)
  })

  it('có baseUrl → trả URL tuyệt đối', async () => {
    process.env.STORAGE_DRIVER = 'local'
    const { saveAudio } = await import('./fileStorage.js')
    const url = await saveAudio('pronunciations', 'apple.mp3', new ArrayBuffer(2), 'https://x.vn')
    expect(url).toBe('https://x.vn/uploads/pronunciations/apple.mp3')
  })

  it('KHÔNG set STORAGE_DRIVER → mặc định là local, không đụng R2', async () => {
    delete process.env.STORAGE_DRIVER
    const { saveAudio } = await import('./fileStorage.js')
    const url = await saveAudio('tts-cache', 'a.mp3', new ArrayBuffer(1))
    expect(url).toBe('/uploads/tts-cache/a.mp3')
    expect(sendMock).not.toHaveBeenCalled()
  })
})

describe('getR2PublicBaseUrl', () => {
  it('cắt dấu / thừa ở cuối', async () => {
    process.env.R2_PUBLIC_BASE_URL = 'https://pub-abc.r2.dev/'
    const { getR2PublicBaseUrl } = await import('./fileStorage.js')
    expect(getR2PublicBaseUrl()).toBe('https://pub-abc.r2.dev')
  })

  it('chưa cấu hình → undefined', async () => {
    delete process.env.R2_PUBLIC_BASE_URL
    const { getR2PublicBaseUrl } = await import('./fileStorage.js')
    expect(getR2PublicBaseUrl()).toBeUndefined()
  })
})

describe('listR2Objects', () => {
  beforeEach(() => {
    process.env.R2_ACCOUNT_ID = 'acc123'
    process.env.R2_ACCESS_KEY_ID = 'key123'
    process.env.R2_SECRET_ACCESS_KEY = 'secret123'
    process.env.R2_BUCKET = 'test-bucket'
  })

  it('thiếu R2_BUCKET → ném lỗi rõ ràng', async () => {
    delete process.env.R2_BUCKET
    const { listR2Objects } = await import('./fileStorage.js')
    await expect(listR2Objects('tts-cache/')).rejects.toThrow(/R2_BUCKET/)
  })

  it('tự phân trang tới hết và gộp đủ mọi object', async () => {
    sendMock
      .mockResolvedValueOnce({
        Contents: [{ Key: 'tts-cache/a.mp3', Size: 10 }],
        IsTruncated: true,
        NextContinuationToken: 'trang2',
      })
      .mockResolvedValueOnce({
        Contents: [{ Key: 'tts-cache/b.mp3', Size: 20 }],
        IsTruncated: false,
      })
    const { listR2Objects } = await import('./fileStorage.js')
    const out = await listR2Objects('tts-cache/')
    expect(out).toEqual([
      { key: 'tts-cache/a.mp3', size: 10 },
      { key: 'tts-cache/b.mp3', size: 20 },
    ])
    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it('IsTruncated=true nhưng THIẾU token → dừng, không lặp vô hạn', async () => {
    // Ca biên nguy hiểm: nếu chỉ dựa vào IsTruncated thì vòng do/while quay mãi mãi.
    sendMock.mockResolvedValue({
      Contents: [{ Key: 'tts-cache/a.mp3', Size: 1 }],
      IsTruncated: true,
      // không có NextContinuationToken
    })
    const { listR2Objects } = await import('./fileStorage.js')
    const out = await listR2Objects('tts-cache/')
    expect(out).toHaveLength(1)
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it('bỏ qua entry không có Key, Size thiếu tính là 0', async () => {
    sendMock.mockResolvedValueOnce({
      Contents: [{ Size: 99 }, { Key: 'tts-cache/c.mp3' }],
      IsTruncated: false,
    })
    const { listR2Objects } = await import('./fileStorage.js')
    expect(await listR2Objects('tts-cache/')).toEqual([{ key: 'tts-cache/c.mp3', size: 0 }])
  })

  it('bucket rỗng (không có trường Contents) → mảng rỗng', async () => {
    sendMock.mockResolvedValueOnce({ IsTruncated: false })
    const { listR2Objects } = await import('./fileStorage.js')
    expect(await listR2Objects('tts-cache/')).toEqual([])
  })
})

// Chặn "cache HIT giả": dòng cache cũ trỏ /uploads/... sau khi đã chuyển sang R2 là audio chết.
describe('isServableUrl — quyết định cache HIT hay sinh lại', () => {
  const R2_ENV = {
    STORAGE_DRIVER: 'r2',
    R2_ACCOUNT_ID: 'acc123',
    R2_ACCESS_KEY_ID: 'key123',
    R2_SECRET_ACCESS_KEY: 'secret123',
    R2_BUCKET: 'test-bucket',
    R2_PUBLIC_BASE_URL: 'https://pub-abc.r2.dev',
  }

  it('chế độ r2: URL R2 đúng → phục vụ được', async () => {
    Object.assign(process.env, R2_ENV)
    const { isServableUrl } = await import('./fileStorage.js')
    expect(isServableUrl('https://pub-abc.r2.dev/tts-cache/en-US/f/a.mp3')).toBe(true)
  })

  it('chế độ r2: URL /uploads cũ → KHÔNG phục vụ được (phải sinh lại qua API)', async () => {
    Object.assign(process.env, R2_ENV)
    const { isServableUrl } = await import('./fileStorage.js')
    expect(isServableUrl('/uploads/tts-cache/en-US/f/a.mp3')).toBe(false)
    expect(isServableUrl('https://en-vi.donghanhcungban.org/uploads/tts-cache/a.mp3')).toBe(false)
  })

  it('chế độ r2: base URL có dấu / thừa vẫn khớp đúng', async () => {
    Object.assign(process.env, R2_ENV, { R2_PUBLIC_BASE_URL: 'https://pub-abc.r2.dev/' })
    const { isServableUrl } = await import('./fileStorage.js')
    expect(isServableUrl('https://pub-abc.r2.dev/tts-cache/a.mp3')).toBe(true)
  })

  it('chế độ r2: domain KHÁC chỉ trùng tiền tố → không được coi là khớp', async () => {
    Object.assign(process.env, R2_ENV)
    const { isServableUrl } = await import('./fileStorage.js')
    // "pub-abc.r2.dev.evil.com" bắt đầu bằng base nếu quên dấu "/" ngăn cách.
    expect(isServableUrl('https://pub-abc.r2.dev.evil.com/tts-cache/a.mp3')).toBe(false)
  })

  it('chế độ local: mọi URL đều chấp nhận (không có gì để phân biệt)', async () => {
    process.env.STORAGE_DRIVER = 'local'
    const { isServableUrl } = await import('./fileStorage.js')
    expect(isServableUrl('/uploads/tts-cache/a.mp3')).toBe(true)
    expect(isServableUrl('https://pub-abc.r2.dev/tts-cache/a.mp3')).toBe(true)
  })

  it('r2 nhưng THIẾU R2_PUBLIC_BASE_URL → giữ nguyên cache, không kích hoạt sinh lại toàn bộ', async () => {
    process.env.STORAGE_DRIVER = 'r2'
    delete process.env.R2_PUBLIC_BASE_URL
    const { isServableUrl } = await import('./fileStorage.js')
    // Ca biên tốn tiền: một biến môi trường thiếu KHÔNG được làm cả cache bị coi là hỏng.
    expect(isServableUrl('/uploads/tts-cache/a.mp3')).toBe(true)
  })

  it('URL rỗng/null → không phục vụ được', async () => {
    Object.assign(process.env, R2_ENV)
    const { isServableUrl } = await import('./fileStorage.js')
    expect(isServableUrl(null)).toBe(false)
    expect(isServableUrl(undefined)).toBe(false)
    expect(isServableUrl('')).toBe(false)
  })
})
