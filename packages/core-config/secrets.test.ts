import { describe, it, expect, beforeEach } from 'vitest'
import {
  isSecretEnvKey,
  collectSecretValues,
  redactSecrets,
  resetSecretCache,
  REDACTED,
} from './secrets.js'

// Mọi test truyền env GIẢ vào tham số `source` thay vì đụng `process.env` thật — tránh làm nhiễu
// các test khác chạy song song trong cùng tiến trình vitest.
beforeEach(() => {
  resetSecretCache()
})

describe('isSecretEnvKey', () => {
  it('nhận diện các mảnh tên quen thuộc', () => {
    expect(isSecretEnvKey('ANTHROPIC_API_KEY')).toBe(true)
    expect(isSecretEnvKey('FACEBOOK_APP_SECRET')).toBe(true)
    expect(isSecretEnvKey('ENV_BACKUP_PASSPHRASE')).toBe(true)
    expect(isSecretEnvKey('SEPAY_WEBHOOK_API_KEY')).toBe(true)
    expect(isSecretEnvKey('SENTRY_DSN')).toBe(true)
    expect(isSecretEnvKey('CRON_SECRET')).toBe(true)
  })

  it('bắt được SMTP_PASS — biến mailer.ts đọc động, tên đầy đủ không có trong mã nguồn', () => {
    // Đây chính là ca dễ lọt nhất: grep "process.env." cả repo KHÔNG ra tên này
    // (mailer.ts ghép chuỗi `${prefix}PASS`), nên danh sách secret viết tay sẽ bỏ sót.
    expect(isSecretEnvKey('SMTP_PASS')).toBe(true)
    expect(isSecretEnvKey('SMTP_FALLBACK_PASS')).toBe(true)
  })

  it('chuỗi kết nối có nhúng mật khẩu tuy tên không lộ ra', () => {
    expect(isSecretEnvKey('DATABASE_URL')).toBe(true)
    expect(isSecretEnvKey('DATABASE_URL_READ')).toBe(true)
    expect(isSecretEnvKey('REDIS_URL')).toBe(true)
  })

  it('KHÔNG che biến công khai — che nhầm làm log vô dụng', () => {
    expect(isSecretEnvKey('R2_PUBLIC_BASE_URL')).toBe(false)
    expect(isSecretEnvKey('GOOGLE_CLIENT_ID')).toBe(false)
    expect(isSecretEnvKey('ALLOWED_ORIGINS')).toBe(false)
    expect(isSecretEnvKey('LOG_LEVEL')).toBe(false)
    expect(isSecretEnvKey('STORAGE_DRIVER')).toBe(false)
    expect(isSecretEnvKey('NODE_ENV')).toBe(false)
  })

  it('biến VITE_* luôn là công khai (Vite nhúng thẳng vào bundle trình duyệt)', () => {
    expect(isSecretEnvKey('VITE_SENTRY_DSN')).toBe(false)
    expect(isSecretEnvKey('VITE_SITE_URL')).toBe(false)
  })
})

describe('collectSecretValues', () => {
  it('chỉ lấy giá trị của biến bí mật, bỏ biến công khai', () => {
    const env = { ANTHROPIC_API_KEY: 'sk-ant-abcdefgh', R2_PUBLIC_BASE_URL: 'https://pub.r2.dev' }
    expect(collectSecretValues(env)).toEqual(['sk-ant-abcdefgh'])
  })

  it('bỏ qua giá trị quá ngắn — che chúng sẽ đục thủng log không liên quan', () => {
    // 'true' là giá trị hợp lệ của một biến tên có chữ TOKEN; nếu che, mọi chữ "true"
    // trong log đều thành *** .
    const env = { USE_TOKEN: 'true', SHORT_KEY: 'abc' }
    expect(collectSecretValues(env)).toEqual([])
  })

  it('tách biến dạng danh sách theo dấu phẩy (GOOGLE_TTS_API_KEYS)', () => {
    // Log thường chỉ in ra MỘT key trong danh sách nên phải khớp được từng phần tử.
    const env = { GOOGLE_TTS_API_KEYS: 'key-aaaaaaaa, key-bbbbbbbb' }
    const values = collectSecretValues(env)
    expect(values).toContain('key-aaaaaaaa')
    expect(values).toContain('key-bbbbbbbb')
    expect(values).toContain('key-aaaaaaaa, key-bbbbbbbb')
  })

  it('sắp xếp DÀI TRƯỚC để secret lồng nhau không bị cắt vụn', () => {
    const env = { A_KEY: 'abcdefgh', B_KEY: 'abcdefgh-dai-hon' }
    expect(collectSecretValues(env)).toEqual(['abcdefgh-dai-hon', 'abcdefgh'])
  })

  it('bỏ qua biến rỗng / chưa đặt', () => {
    const env = { ANTHROPIC_API_KEY: '', GROQ_API_KEY: undefined }
    expect(collectSecretValues(env)).toEqual([])
  })

  it('khử trùng lặp khi hai biến cùng giá trị', () => {
    const env = { A_KEY: 'trung-nhau-8', B_SECRET: 'trung-nhau-8' }
    expect(collectSecretValues(env)).toEqual(['trung-nhau-8'])
  })

  it('cache theo danh tính của object env, và resetSecretCache() xoá được', () => {
    const env: NodeJS.ProcessEnv = { A_KEY: 'gia-tri-mot' }
    expect(collectSecretValues(env)).toEqual(['gia-tri-mot'])

    // Đổi env NHƯNG chưa reset → vẫn trả kết quả cũ (đúng như tài liệu module mô tả).
    env.A_KEY = 'gia-tri-hai'
    expect(collectSecretValues(env)).toEqual(['gia-tri-mot'])

    resetSecretCache()
    expect(collectSecretValues(env)).toEqual(['gia-tri-hai'])
  })

  it('đổi sang object env KHÁC thì tính lại ngay, không cần reset', () => {
    expect(collectSecretValues({ A_KEY: 'moi-truong-1' })).toEqual(['moi-truong-1'])
    expect(collectSecretValues({ A_KEY: 'moi-truong-2' })).toEqual(['moi-truong-2'])
  })
})

describe('redactSecrets', () => {
  it('che secret nằm giữa câu log', () => {
    const env = { ANTHROPIC_API_KEY: 'sk-ant-bimat123' }
    expect(redactSecrets('gọi API với key=sk-ant-bimat123 xong', env)).toBe(
      `gọi API với key=${REDACTED} xong`,
    )
  })

  it('che MỌI lần xuất hiện, không chỉ lần đầu', () => {
    const env = { A_KEY: 'bimat-12345' }
    expect(redactSecrets('bimat-12345 và bimat-12345', env)).toBe(`${REDACTED} và ${REDACTED}`)
  })

  it('che connection string Postgres lọt vào thông báo lỗi của thư viện pg', () => {
    // Ca thật: `pg` ném lỗi có kèm nguyên connection string, và pgPool.on('error') log nó ra.
    const url = 'postgres://user:matkhau@localhost:5432/db'
    const env = { DATABASE_URL: url }
    expect(redactSecrets(`connect ECONNREFUSED ${url}`, env)).toBe(
      `connect ECONNREFUSED ${REDACTED}`,
    )
  })

  it('secret chứa ký tự đặc biệt của regex vẫn che đúng (khoá base64 có + . $)', () => {
    // Đây là lý do dùng split/join thay cho RegExp: ghép thẳng chuỗi này vào regex sẽ khớp sai.
    const env = { TTS_ENCRYPTION_MASTER_KEY: 'a+b.c$d/e=fgh' }
    expect(redactSecrets('key=a+b.c$d/e=fgh', env)).toBe(`key=${REDACTED}`)
  })

  it('giữ nguyên chuỗi khi không có secret nào khớp', () => {
    const env = { ANTHROPIC_API_KEY: 'sk-ant-bimat123' }
    expect(redactSecrets('không có gì nhạy cảm', env)).toBe('không có gì nhạy cảm')
  })

  it('không có secret nào trong env → trả nguyên văn', () => {
    expect(redactSecrets('log bình thường', {})).toBe('log bình thường')
  })

  it('che được đúng một phần tử của danh sách key ngăn bằng dấu phẩy', () => {
    const env = { GOOGLE_TTS_API_KEYS: 'key-aaaaaaaa,key-bbbbbbbb' }
    expect(redactSecrets('dùng key-bbbbbbbb', env)).toBe(`dùng ${REDACTED}`)
  })
})
