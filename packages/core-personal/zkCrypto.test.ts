import { describe, it, expect } from 'vitest'
import {
  encryptZeroKnowledge,
  decryptZeroKnowledge,
  deriveKeyFromPassphrase,
  type EncryptedPayload,
} from './zkCrypto.js'

describe('zkCrypto (Zero-Knowledge AES-256-GCM)', () => {
  it('dẫn xuất key 32 bytes từ passphrase', () => {
    const salt = Buffer.alloc(16, 1)
    const key1 = deriveKeyFromPassphrase('my-secret-pass', salt)
    const key2 = deriveKeyFromPassphrase('my-secret-pass', salt)
    expect(key1.length).toBe(32)
    expect(key1.equals(key2)).toBe(true)
  })

  it('mã hóa và giải mã thành công chuỗi dữ liệu gốc', () => {
    const originalText = 'Dữ liệu cá nhân cực kỳ nhạy cảm: Mục tiêu tài chính 2026'
    const passphrase = 'SuperSecureUserPassphrase#123'

    const encrypted = encryptZeroKnowledge(originalText, passphrase)
    expect(encrypted.version).toBe(1)
    expect(encrypted.ciphertext).not.toBe(originalText)
    expect(encrypted.iv).toBeDefined()
    expect(encrypted.tag).toBeDefined()
    expect(encrypted.salt).toBeDefined()

    const decrypted = decryptZeroKnowledge(encrypted, passphrase)
    expect(decrypted).toBe(originalText)
  })

  it('quăng lỗi khi dùng sai mật khẩu giải mã', () => {
    const originalText = 'Bí mật kinh doanh'
    const encrypted = encryptZeroKnowledge(originalText, 'pass-dung')

    expect(() => {
      decryptZeroKnowledge(encrypted, 'pass-sai')
    }).toThrow()
  })

  it('quăng lỗi nếu phiên bản payload không được hỗ trợ', () => {
    const invalidPayload: EncryptedPayload = {
      version: 99 as unknown as 1,
      ciphertext: 'abc',
      iv: 'abc',
      salt: 'abc',
      tag: 'abc',
    }

    expect(() => {
      decryptZeroKnowledge(invalidPayload, 'pass')
    }).toThrow(/Unsupported encrypted payload version/)
  })
})
