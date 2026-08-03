// Test api/_lib/ttsCrypto.ts — mã hoá/giải mã AES-256-GCM cho audio TTS cache.
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Khoá gốc 32 byte hợp lệ dạng base64 (dùng cho test, không phải khoá thật).
const VALID_KEY_B64 = Buffer.from('a'.repeat(32)).toString('base64')

async function importModule() {
  vi.resetModules()
  return import('./ttsCrypto')
}

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('ttsCrypto', () => {
  it('mã hoá rồi giải mã ra đúng dữ liệu gốc (vòng tròn round-trip)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio, decryptAudio } = await importModule()
    const original = new TextEncoder().encode('hello audio data').buffer
    const cipher = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    const decrypted = await decryptAudio(cipher, 'hash-abc')
    expect(new TextDecoder().decode(decrypted)).toBe('hello audio data')
  })

  it('cùng hash → luôn ra cùng khoá/iv (deterministic) → key material giống nhau', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    const m1 = await getClientKeyMaterial('same-hash')
    const m2 = await getClientKeyMaterial('same-hash')
    expect(m1).toEqual(m2)
  })

  it('hash khác nhau → khoá/iv khác nhau', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    const m1 = await getClientKeyMaterial('hash-1')
    const m2 = await getClientKeyMaterial('hash-2')
    expect(m1.key_b64).not.toBe(m2.key_b64)
    expect(m1.iv_b64).not.toBe(m2.iv_b64)
  })

  it('giải mã với hash sai (khác khoá) → ném lỗi', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio, decryptAudio } = await importModule()
    const original = new TextEncoder().encode('secret').buffer
    const cipher = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    await expect(decryptAudio(cipher, 'hash-khac')).rejects.toThrow()
  })

  it('dữ liệu ciphertext hỏng (thiếu/đổi byte) → ném lỗi khi giải mã', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio, decryptAudio } = await importModule()
    const original = new TextEncoder().encode('secret audio').buffer
    const cipher = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    const corrupted = cipher.slice(0, cipher.byteLength - 1) // cắt bớt 1 byte cuối (auth tag hỏng)
    await expect(decryptAudio(corrupted, 'hash-abc')).rejects.toThrow()
  })

  it('chưa cấu hình TTS_ENCRYPTION_MASTER_KEY → ném lỗi rõ ràng', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', '')
    const { encryptAudio } = await importModule()
    await expect(encryptAudio(new ArrayBuffer(4), 'hash-abc')).rejects.toThrow(
      /TTS_ENCRYPTION_MASTER_KEY/,
    )
  })

  it('khoá cấu hình sai độ dài (không đủ 32 byte) → ném lỗi rõ ràng', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', Buffer.from('too-short').toString('base64'))
    const { encryptAudio } = await importModule()
    await expect(encryptAudio(new ArrayBuffer(4), 'hash-abc')).rejects.toThrow(/32 byte/)
  })

  it('getClientKeyMaterial trả về chuỗi base64 hợp lệ, đúng độ dài (32 byte key, 12 byte iv)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    const { key_b64, iv_b64 } = await getClientKeyMaterial('hash-x')
    expect(Buffer.from(key_b64, 'base64').length).toBe(32)
    expect(Buffer.from(iv_b64, 'base64').length).toBe(12)
  })
})
