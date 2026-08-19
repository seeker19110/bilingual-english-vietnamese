// packages/core-personal/zkCrypto.ts — Tiện ích mã hóa đầu cuối / Zero-Knowledge Encryption
// Sử dụng chuẩn AES-256-GCM với dẫn xuất khóa PBKDF2-HMAC-SHA256, bảo vệ dữ liệu STRICT_PRIVATE.

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from 'node:crypto'

export interface EncryptedPayload {
  version: 1
  ciphertext: string // Base64
  iv: string // Base64
  salt: string // Base64
  tag: string // Base64
}

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 12
const SALT_LENGTH = 16
const PBKDF2_ITERATIONS = 100_000

/** Dẫn xuất khóa mã hóa 256-bit từ passphrase và salt */
export function deriveKeyFromPassphrase(passphrase: string, salt: Buffer): Buffer {
  return pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256')
}

/** Mã hóa chuỗi văn bản thuần bằng mật khẩu người dùng */
export function encryptZeroKnowledge(plaintext: string, passphrase: string): EncryptedPayload {
  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)
  const key = deriveKeyFromPassphrase(passphrase, salt)

  const cipher = createCipheriv(ALGORITHM, key, iv)
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
  ciphertext += cipher.final('base64')
  const tag = cipher.getAuthTag().toString('base64')

  return {
    version: 1,
    ciphertext,
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag,
  }
}

/** Giải mã EncryptedPayload bằng mật khẩu */
export function decryptZeroKnowledge(payload: EncryptedPayload, passphrase: string): string {
  if (payload.version !== 1) {
    throw new Error(`Unsupported encrypted payload version: ${payload.version}`)
  }

  const salt = Buffer.from(payload.salt, 'base64')
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const key = deriveKeyFromPassphrase(passphrase, salt)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
