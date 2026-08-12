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
    const { cipher, iv_b64 } = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    const decrypted = await decryptAudio(cipher, 'hash-abc', iv_b64)
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
    const { cipher, iv_b64 } = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    await expect(decryptAudio(cipher, 'hash-khac', iv_b64)).rejects.toThrow()
  })

  it('dữ liệu ciphertext hỏng (thiếu/đổi byte) → ném lỗi khi giải mã', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio, decryptAudio } = await importModule()
    const original = new TextEncoder().encode('secret audio').buffer
    const { cipher, iv_b64 } = await encryptAudio(original as ArrayBuffer, 'hash-abc')
    const corrupted = cipher.slice(0, cipher.byteLength - 1) // cắt bớt 1 byte cuối (auth tag hỏng)
    await expect(decryptAudio(corrupted, 'hash-abc', iv_b64)).rejects.toThrow()
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

  // ── Audit 2026-08-12: IV phải NGẪU NHIÊN, không suy ra từ hash ──────────────────────
  // AES-GCM sụp đổ khi cùng một cặp (khoá, nonce) mã hoá hai bản rõ khác nhau: lộ XOR hai bản
  // rõ VÀ khôi phục được khoá xác thực GHASH để giả mạo. Bản cũ suy iv từ hash nên mọi lần mã
  // hoá lại cùng một hash (tts_cache có `on conflict do update`) đều dùng lại đúng nonce đó.
  it('mã hoá 2 lần CÙNG hash → iv KHÁC nhau và ciphertext KHÁC nhau (không lặp nonce)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio } = await importModule()
    const plain = new TextEncoder().encode('same audio bytes').buffer as ArrayBuffer
    const a = await encryptAudio(plain, 'hash-abc')
    const b = await encryptAudio(plain, 'hash-abc')
    expect(a.iv_b64).not.toBe(b.iv_b64)
    expect(new Uint8Array(a.cipher)).not.toEqual(new Uint8Array(b.cipher))
  })

  it('giải mã bằng iv SAI → ném lỗi (không âm thầm ra rác)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { encryptAudio, decryptAudio } = await importModule()
    const plain = new TextEncoder().encode('abc').buffer as ArrayBuffer
    const { cipher } = await encryptAudio(plain, 'hash-abc')
    const { iv_b64: otherIv } = await encryptAudio(plain, 'hash-abc')
    await expect(decryptAudio(cipher, 'hash-abc', otherIv)).rejects.toThrow()
  })

  // TƯƠNG THÍCH NGƯỢC: bản ghi trước migration 0038 không có cột iv → truyền null/undefined
  // phải rơi về iv suy ra từ hash y như cũ, để audio đã trả tiền vẫn nghe được.
  it('iv null/undefined → dùng iv suy từ hash (bản ghi cũ vẫn giải mã được)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    const legacy = await getClientKeyMaterial('hash-cu')
    const explicitNull = await getClientKeyMaterial('hash-cu', null)
    expect(explicitNull).toEqual(legacy)
    // Cùng hash → iv suy ra ổn định giữa các lần gọi (đúng như bản ghi cũ đang dựa vào).
    expect((await getClientKeyMaterial('hash-cu')).iv_b64).toBe(legacy.iv_b64)
    // Có iv lưu sẵn thì PHẢI trả đúng iv đó, không phải iv suy ra.
    const stored = await getClientKeyMaterial('hash-cu', 'AAAAAAAAAAAAAAAA')
    expect(stored.iv_b64).toBe('AAAAAAAAAAAAAAAA')
    expect(stored.key_b64).toBe(legacy.key_b64) // khoá vẫn suy từ hash, không đổi
  })

  it('iv đã lưu sai độ dài → ném lỗi rõ ràng thay vì giải mã bậy', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    await expect(getClientKeyMaterial('hash-x', 'AAAA')).rejects.toThrow(/12 byte|IV/)
  })

  it('getClientKeyMaterial trả về chuỗi base64 hợp lệ, đúng độ dài (32 byte key, 12 byte iv)', async () => {
    vi.stubEnv('TTS_ENCRYPTION_MASTER_KEY', VALID_KEY_B64)
    const { getClientKeyMaterial } = await importModule()
    const { key_b64, iv_b64 } = await getClientKeyMaterial('hash-x')
    expect(Buffer.from(key_b64, 'base64').length).toBe(32)
    expect(Buffer.from(iv_b64, 'base64').length).toBe(12)
  })
})
