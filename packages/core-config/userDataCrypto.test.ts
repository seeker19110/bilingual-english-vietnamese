import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  encryptUserField,
  decryptUserField,
  isEncryptedField,
  hashLookupValue,
} from './userDataCrypto.js'

// Khoá giả 32 byte cho test — KHÔNG dùng khoá thật.
const KEY_V1 = Buffer.alloc(32, 1).toString('base64')
const KEY_V2 = Buffer.alloc(32, 2).toString('base64')

const USER_A = '11111111-1111-1111-1111-111111111111'
const USER_B = '22222222-2222-2222-2222-222222222222'

const savedEnv = { ...process.env }

beforeEach(() => {
  process.env.USER_DATA_MASTER_KEY = KEY_V1
  delete process.env.USER_DATA_KEY_VERSION
  delete process.env.USER_DATA_MASTER_KEY_V1
  delete process.env.USER_DATA_MASTER_KEY_V2
})

afterEach(() => {
  process.env = { ...savedEnv }
})

describe('encrypt/decrypt vòng tròn', () => {
  it('giải mã trả lại đúng bản gốc', async () => {
    const plain = 'Việc gì bạn làm mà quên mất thời gian? — vẽ tranh'
    const enc = await encryptUserField(USER_A, plain)
    expect(await decryptUserField(USER_A, enc)).toBe(plain)
  })

  it('ciphertext KHÔNG chứa bản rõ', async () => {
    const enc = await encryptUserField(USER_A, 'bí mật rất riêng tư')
    expect(enc).not.toContain('bí mật')
  })

  it('mã hoá cùng một giá trị hai lần cho ra hai ciphertext KHÁC nhau (iv ngẫu nhiên)', async () => {
    // Đây là bài học từ audit ttsCrypto 2026-08-12: iv tất định = dùng lại nonce trong AES-GCM,
    // hỏng nặng. Test này chốt lại rằng lỗi đó không lặp ở đây.
    const a = await encryptUserField(USER_A, 'cùng một câu')
    const b = await encryptUserField(USER_A, 'cùng một câu')
    expect(a).not.toBe(b)
    expect(await decryptUserField(USER_A, a)).toBe(await decryptUserField(USER_A, b))
  })

  it('chuỗi RỖNG vẫn được mã hoá (không lộ việc trường đang rỗng)', async () => {
    const enc = await encryptUserField(USER_A, '')
    expect(isEncryptedField(enc)).toBe(true)
    expect(await decryptUserField(USER_A, enc)).toBe('')
  })

  it('giữ nguyên ký tự tiếng Việt có dấu và emoji', async () => {
    const plain = 'Đồng hành cùng bạn 🌱 — ngữ pháp, phát âm'
    expect(await decryptUserField(USER_A, await encryptUserField(USER_A, plain))).toBe(plain)
  })
})

describe('cách ly giữa người dùng', () => {
  it('người dùng khác KHÔNG giải mã được dữ liệu của người này', async () => {
    const enc = await encryptUserField(USER_A, 'hồ sơ năng lực của A')
    // AES-GCM có xác thực: sai khoá thì ném lỗi, không trả ra rác.
    await expect(decryptUserField(USER_B, enc)).rejects.toThrow()
  })
})

describe('chuyển đổi dần — dữ liệu cũ chưa mã hoá', () => {
  it('giá trị plaintext đi qua decrypt được trả nguyên vẹn', async () => {
    expect(await decryptUserField(USER_A, 'beginner')).toBe('beginner')
    expect(await decryptUserField(USER_A, '')).toBe('')
  })

  it('isEncryptedField phân biệt đúng, kể cả chuỗi có dấu hai chấm', async () => {
    expect(isEncryptedField(await encryptUserField(USER_A, 'x'))).toBe(true)
    expect(isEncryptedField('beginner')).toBe(false)
    expect(isEncryptedField('')).toBe(false)
    // Ca biên: văn bản người dùng có thể chứa ':' — không được nhầm là ciphertext.
    expect(isEncryptedField('ghi chú: hôm nay: học bài')).toBe(false)
    expect(isEncryptedField('http://a.b:8080')).toBe(false)
    // Đúng 3 phần nhưng tag không phải v<số>
    expect(isEncryptedField('abc:def:ghi')).toBe(false)
    expect(isEncryptedField('vX:aaa:bbb')).toBe(false)
  })
})

describe('xoay khoá (key rotation)', () => {
  it('dữ liệu mã hoá bằng khoá v1 vẫn giải mã được sau khi chuyển sang v2', async () => {
    const old = await encryptUserField(USER_A, 'ghi từ thời khoá cũ')

    // Xoay khoá: khoá mới thành hiện tại, khoá cũ giữ lại dưới tên _V1.
    process.env.USER_DATA_KEY_VERSION = '2'
    process.env.USER_DATA_MASTER_KEY = KEY_V2
    process.env.USER_DATA_MASTER_KEY_V1 = KEY_V1

    expect(await decryptUserField(USER_A, old)).toBe('ghi từ thời khoá cũ')

    const fresh = await encryptUserField(USER_A, 'ghi bằng khoá mới')
    expect(fresh.startsWith('v2:')).toBe(true)
    expect(await decryptUserField(USER_A, fresh)).toBe('ghi bằng khoá mới')
  })
})

describe('hashLookupValue', () => {
  it('tất định — cùng giá trị luôn ra cùng kết quả', async () => {
    expect(await hashLookupValue('a@b.com')).toBe(await hashLookupValue('a@b.com'))
  })

  it('chuẩn hoá hoa/thường và khoảng trắng thừa', async () => {
    const base = await hashLookupValue('a@b.com')
    expect(await hashLookupValue('A@B.com')).toBe(base)
    expect(await hashLookupValue('  a@b.com  ')).toBe(base)
  })

  it('giá trị khác nhau ra kết quả khác nhau', async () => {
    expect(await hashLookupValue('a@b.com')).not.toBe(await hashLookupValue('c@d.com'))
  })

  it('KHÔNG đổi khi xoay khoá — nếu đổi thì mọi người dùng cũ sẽ không đăng nhập được', async () => {
    const before = await hashLookupValue('a@b.com')
    process.env.USER_DATA_KEY_VERSION = '2'
    process.env.USER_DATA_MASTER_KEY = KEY_V2
    process.env.USER_DATA_MASTER_KEY_V1 = KEY_V1
    expect(await hashLookupValue('a@b.com')).toBe(before)
  })
})

describe('cấu hình sai thì báo lỗi rõ ràng, không im lặng', () => {
  it('thiếu khoá gốc', async () => {
    delete process.env.USER_DATA_MASTER_KEY
    await expect(encryptUserField(USER_A, 'x')).rejects.toThrow(/USER_DATA_MASTER_KEY/)
  })

  it('khoá sai độ dài', async () => {
    process.env.USER_DATA_MASTER_KEY = Buffer.alloc(16, 1).toString('base64')
    await expect(encryptUserField(USER_A, 'x')).rejects.toThrow(/32 byte/)
  })

  it('thiếu userId', async () => {
    await expect(encryptUserField('', 'x')).rejects.toThrow(/userId/)
  })

  it('USER_DATA_KEY_VERSION không hợp lệ', async () => {
    process.env.USER_DATA_KEY_VERSION = 'abc'
    await expect(encryptUserField(USER_A, 'x')).rejects.toThrow(/USER_DATA_KEY_VERSION/)
  })

  it('thiếu khoá của phiên bản cũ khi giải mã dữ liệu cũ', async () => {
    const old = await encryptUserField(USER_A, 'dữ liệu cũ')
    process.env.USER_DATA_KEY_VERSION = '2'
    process.env.USER_DATA_MASTER_KEY = KEY_V2
    // Cố ý KHÔNG đặt USER_DATA_MASTER_KEY_V1
    await expect(decryptUserField(USER_A, old)).rejects.toThrow(/USER_DATA_MASTER_KEY_V1/)
  })
})
