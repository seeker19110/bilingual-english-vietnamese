import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../packages/core-db/pgPool.js', () => {
  const query = vi.fn()
  return { getPgPool: () => ({ query }) }
})

const s3SendMock = vi.fn(() => Promise.resolve({}))
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: s3SendMock })),
  ListObjectsV2Command: vi.fn((input: unknown) => input),
}))

import { getPgPool } from '../../packages/core-db/pgPool.js'
import {
  runAllFeatureChecks,
  summarizeOverallStatus,
  type FeatureCheckResult,
} from './featureStatusChecks.js'

const ORIGINAL_ENV = { ...process.env }

describe('featureStatusChecks', () => {
  const queryMock = getPgPool().query as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GEMINI_API_KEY
    delete process.env.GROQ_API_KEY
    delete process.env.OPENAI_API_KEY
    delete process.env.GOOGLE_TTS_API_KEY
    delete process.env.GOOGLE_TTS_API_KEYS
    delete process.env.STORAGE_DRIVER
    delete process.env.SEPAY_WEBHOOK_API_KEY
    delete process.env.SEPAY_BANK_ACCOUNT
    delete process.env.SEPAY_BANK_CODE
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    vi.unstubAllGlobals()
  })

  it('database: up khi query SELECT 1 thành công', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] })
    const results = await runAllFeatureChecks()
    const db = results.find((r) => r.key === 'database')
    expect(db?.status).toBe('up')
  })

  it('database: down khi query lỗi', async () => {
    queryMock.mockRejectedValueOnce(new Error('connection refused'))
    const results = await runAllFeatureChecks()
    const db = results.find((r) => r.key === 'database')
    expect(db?.status).toBe('down')
    expect(db?.message).toContain('connection refused')
  })

  it('database: down khi query ném giá trị không phải Error instance', async () => {
    queryMock.mockRejectedValueOnce('timeout string')
    const results = await runAllFeatureChecks()
    const db = results.find((r) => r.key === 'database')
    expect(db?.status).toBe('down')
    expect(db?.message).toBe('timeout string')
  })

  it('anthropic: unconfigured khi thiếu ANTHROPIC_API_KEY', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    const results = await runAllFeatureChecks()
    const anthropic = results.find((r) => r.key === 'anthropic')
    expect(anthropic?.status).toBe('unconfigured')
  })

  it('anthropic: up khi có key và fetch trả 200', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    queryMock.mockResolvedValue({ rows: [] })
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    const results = await runAllFeatureChecks()
    const anthropic = results.find((r) => r.key === 'anthropic')
    expect(anthropic?.status).toBe('up')
  })

  it('anthropic: down khi fetch trả lỗi HTTP', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    queryMock.mockResolvedValue({ rows: [] })
    vi.mocked(fetch).mockResolvedValue(new Response('unauthorized', { status: 401 }))
    const results = await runAllFeatureChecks()
    const anthropic = results.find((r) => r.key === 'anthropic')
    expect(anthropic?.status).toBe('down')
  })

  it('anthropic: down khi fetch ném lỗi mạng', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
    queryMock.mockResolvedValue({ rows: [] })
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))
    const results = await runAllFeatureChecks()
    const anthropic = results.find((r) => r.key === 'anthropic')
    expect(anthropic?.status).toBe('down')
    expect(anthropic?.message).toContain('network down')
  })

  it('gemini: unconfigured khi thiếu key, up khi có key và fetch 200, down khi HTTP lỗi', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    let results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'gemini')?.status).toBe('unconfigured')

    process.env.GEMINI_API_KEY = 'gm-test'
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'gemini')?.status).toBe('up')

    vi.mocked(fetch).mockResolvedValue(new Response('err', { status: 500 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'gemini')?.status).toBe('down')
  })

  it('groq: down khi fetch ném lỗi mạng', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.GROQ_API_KEY = 'gsk-test'
    vi.mocked(fetch).mockRejectedValue(new Error('groq unreachable'))
    const results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'groq')?.status).toBe('down')
    expect(results.find((r) => r.key === 'groq')?.message).toContain('groq unreachable')
  })

  it('openai-stt: down khi fetch ném lỗi mạng', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.mocked(fetch).mockRejectedValue(new Error('openai unreachable'))
    const results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'openai-stt')?.status).toBe('down')
  })

  it('gemini: down khi fetch ném lỗi mạng', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.GEMINI_API_KEY = 'gm-test'
    vi.mocked(fetch).mockRejectedValue(new Error('gemini unreachable'))
    const results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'gemini')?.status).toBe('down')
  })

  it('groq: unconfigured khi thiếu key, up khi có key và fetch 200, down khi HTTP lỗi', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    let results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'groq')?.status).toBe('unconfigured')

    process.env.GROQ_API_KEY = 'gsk-test'
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'groq')?.status).toBe('up')

    vi.mocked(fetch).mockResolvedValue(new Response('err', { status: 500 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'groq')?.status).toBe('down')
  })

  it('openai-stt: unconfigured khi thiếu key, up khi có key và fetch 200, down khi HTTP lỗi', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    let results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'openai-stt')?.status).toBe('unconfigured')

    process.env.OPENAI_API_KEY = 'sk-test'
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'openai-stt')?.status).toBe('up')

    vi.mocked(fetch).mockResolvedValue(new Response('err', { status: 500 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'openai-stt')?.status).toBe('down')
  })

  it('google-tts: unconfigured khi thiếu key, up khi có GOOGLE_TTS_API_KEY, down khi HTTP lỗi', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    let results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'google-tts')?.status).toBe('unconfigured')

    process.env.GOOGLE_TTS_API_KEY = 'AIza-test'
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'google-tts')?.status).toBe('up')

    vi.mocked(fetch).mockResolvedValue(new Response('err', { status: 500 }))
    results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'google-tts')?.status).toBe('down')
  })

  it('google-tts: dùng GOOGLE_TTS_API_KEYS (danh sách) khi thiếu GOOGLE_TTS_API_KEY', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.GOOGLE_TTS_API_KEYS = 'AIza-key1,AIza-key2'
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }))
    const results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'google-tts')?.status).toBe('up')
  })

  it('google-tts: down khi fetch ném lỗi mạng', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.GOOGLE_TTS_API_KEY = 'AIza-test'
    vi.mocked(fetch).mockRejectedValue(new Error('timeout'))
    const results = await runAllFeatureChecks()
    expect(results.find((r) => r.key === 'google-tts')?.status).toBe('down')
  })

  it('r2-storage: unconfigured khi STORAGE_DRIVER không phải r2', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    const results = await runAllFeatureChecks()
    const r2 = results.find((r) => r.key === 'r2-storage')
    expect(r2?.status).toBe('unconfigured')
  })

  it('r2-storage: unconfigured khi STORAGE_DRIVER=r2 nhưng thiếu biến R2_*', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.STORAGE_DRIVER = 'r2'
    const results = await runAllFeatureChecks()
    const r2 = results.find((r) => r.key === 'r2-storage')
    expect(r2?.status).toBe('unconfigured')
    expect(r2?.message).toContain('R2_')
  })

  it('r2-storage: up khi ListObjectsV2 thành công', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc'
    process.env.R2_ACCESS_KEY_ID = 'key'
    process.env.R2_SECRET_ACCESS_KEY = 'secret'
    process.env.R2_BUCKET = 'bucket'
    const results = await runAllFeatureChecks()
    const r2 = results.find((r) => r.key === 'r2-storage')
    expect(r2?.status).toBe('up')
  })

  it('r2-storage: down khi ListObjectsV2 ném lỗi', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    process.env.STORAGE_DRIVER = 'r2'
    process.env.R2_ACCOUNT_ID = 'acc'
    process.env.R2_ACCESS_KEY_ID = 'key'
    process.env.R2_SECRET_ACCESS_KEY = 'secret'
    process.env.R2_BUCKET = 'bucket'
    s3SendMock.mockRejectedValueOnce(new Error('access denied'))
    const results = await runAllFeatureChecks()
    const r2 = results.find((r) => r.key === 'r2-storage')
    expect(r2?.status).toBe('down')
    expect(r2?.message).toContain('access denied')
  })

  it('sepay: unconfigured khi thiếu biến môi trường', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    const results = await runAllFeatureChecks()
    const sepay = results.find((r) => r.key === 'sepay')
    expect(sepay?.status).toBe('unconfigured')
  })

  it('sepay: up khi đã cấu hình đủ, chưa có giao dịch nào', async () => {
    process.env.SEPAY_WEBHOOK_API_KEY = 'key'
    process.env.SEPAY_BANK_ACCOUNT = '123'
    process.env.SEPAY_BANK_CODE = 'VCB'
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes('payments')) return Promise.resolve({ rows: [{ last_payment_at: null }] })
      return Promise.resolve({ rows: [] })
    })
    const results = await runAllFeatureChecks()
    const sepay = results.find((r) => r.key === 'sepay')
    expect(sepay?.status).toBe('up')
    expect(sepay?.message).toContain('chưa ghi nhận giao dịch')
  })

  it('sepay: up kèm thời điểm giao dịch gần nhất khi đã có giao dịch', async () => {
    process.env.SEPAY_WEBHOOK_API_KEY = 'key'
    process.env.SEPAY_BANK_ACCOUNT = '123'
    process.env.SEPAY_BANK_CODE = 'VCB'
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes('payments')) {
        return Promise.resolve({ rows: [{ last_payment_at: '2026-08-01T00:00:00.000Z' }] })
      }
      return Promise.resolve({ rows: [] })
    })
    const results = await runAllFeatureChecks()
    const sepay = results.find((r) => r.key === 'sepay')
    expect(sepay?.status).toBe('up')
    expect(sepay?.message).toContain('Giao dịch gần nhất')
  })

  it('sepay: down khi truy vấn CSDL lỗi', async () => {
    process.env.SEPAY_WEBHOOK_API_KEY = 'key'
    process.env.SEPAY_BANK_ACCOUNT = '123'
    process.env.SEPAY_BANK_CODE = 'VCB'
    queryMock.mockImplementation((sql: string) => {
      if (sql.includes('payments')) return Promise.reject(new Error('db timeout'))
      return Promise.resolve({ rows: [] })
    })
    const results = await runAllFeatureChecks()
    const sepay = results.find((r) => r.key === 'sepay')
    expect(sepay?.status).toBe('down')
    expect(sepay?.message).toContain('db timeout')
  })

  describe('summarizeOverallStatus', () => {
    const base: Omit<FeatureCheckResult, 'status'> = { key: 'x', label: 'x', usesApi: true }

    it('up khi không có tính năng nào cấu hình', () => {
      expect(summarizeOverallStatus([{ ...base, status: 'unconfigured' }])).toBe('up')
    })

    it('up khi mọi tính năng đã cấu hình đều chạy tốt', () => {
      expect(
        summarizeOverallStatus([
          { ...base, status: 'up' },
          { ...base, status: 'unconfigured' },
        ]),
      ).toBe('up')
    })

    it('degraded khi có tính năng lỗi nhưng còn tính năng khác chạy được', () => {
      expect(
        summarizeOverallStatus([
          { ...base, status: 'up' },
          { ...base, status: 'down' },
        ]),
      ).toBe('degraded')
    })

    it('down khi toàn bộ tính năng đã cấu hình đều lỗi', () => {
      expect(summarizeOverallStatus([{ ...base, status: 'down' }])).toBe('down')
    })
  })
})
