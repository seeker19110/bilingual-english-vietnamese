import { describe, it, expect } from 'vitest'
import { encryptEnv } from './backup-env-to-r2'
import { decryptEnv } from './restore-env-from-r2'

describe('encryptEnv / decryptEnv', () => {
  it('mã hoá rồi giải mã đúng passphrase → khôi phục đúng nội dung gốc', () => {
    const plaintext = Buffer.from('OPENAI_API_KEY=sk-test\nR2_BUCKET=abc\n', 'utf8')
    const encrypted = encryptEnv(plaintext, 'passphrase-manh')
    const decrypted = decryptEnv(encrypted, 'passphrase-manh')
    expect(decrypted.toString('utf8')).toBe(plaintext.toString('utf8'))
  })

  it('sai passphrase → giải mã ném lỗi (auth tag không khớp), không trả về rác im lặng', () => {
    const plaintext = Buffer.from('SECRET=1', 'utf8')
    const encrypted = encryptEnv(plaintext, 'dung')
    expect(() => decryptEnv(encrypted, 'sai')).toThrow()
  })

  it('mỗi lần mã hoá cùng nội dung + passphrase ra ciphertext KHÁC nhau (salt/iv ngẫu nhiên)', () => {
    const plaintext = Buffer.from('A=1', 'utf8')
    const first = encryptEnv(plaintext, 'pass')
    const second = encryptEnv(plaintext, 'pass')
    expect(first.equals(second)).toBe(false)
  })
})
