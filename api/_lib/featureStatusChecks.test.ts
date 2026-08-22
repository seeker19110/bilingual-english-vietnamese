import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../packages/core-db/pgPool.js', () => {
  const query = vi.fn()
  return { getPgPool: () => ({ query }) }
})

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

  it('r2-storage: unconfigured khi STORAGE_DRIVER không phải r2', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    const results = await runAllFeatureChecks()
    const r2 = results.find((r) => r.key === 'r2-storage')
    expect(r2?.status).toBe('unconfigured')
  })

  it('sepay: unconfigured khi thiếu biến môi trường', async () => {
    queryMock.mockResolvedValue({ rows: [] })
    const results = await runAllFeatureChecks()
    const sepay = results.find((r) => r.key === 'sepay')
    expect(sepay?.status).toBe('unconfigured')
  })

  it('sepay: up khi đã cấu hình đủ, kèm thời điểm giao dịch gần nhất', async () => {
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
