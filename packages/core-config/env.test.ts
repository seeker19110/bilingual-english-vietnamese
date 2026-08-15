import { describe, it, expect, beforeEach } from 'vitest'
import { parseEnv, getEnv, resetEnvCache, describeEnv } from './env.js'

beforeEach(() => {
  resetEnvCache()
})

describe('parseEnv', () => {
  it('object rỗng → toàn bộ optional là undefined, có default cho phần còn lại', () => {
    const env = parseEnv({})
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.ANTHROPIC_API_KEY).toBeUndefined()
    expect(env.PG_POOL_MAX).toBe(10)
    expect(env.PG_POOL_READ_MAX).toBe(10)
    expect(env.PORT).toBe(3001)
    expect(env.LOG_LEVEL).toBe('debug')
  })

  it('không bao giờ ném lỗi dù giá trị sai kiểu — thiết kế lenient có chủ đích', () => {
    // NODE_ENV thật ra là string tuỳ ý (không phải enum) nên bất kỳ giá trị nào cũng hợp lệ;
    // ca đáng kiểm là PG_POOL_MAX/PORT/LOG_LEVEL nhận rác mà không throw.
    expect(() =>
      parseEnv({ PG_POOL_MAX: 'không phải số', PORT: 'abc', LOG_LEVEL: 'nonsense' }),
    ).not.toThrow()
  })

  describe('positiveIntWithDefault — khớp đúng công thức cũ trong pgPool.ts', () => {
    it('chuỗi số hợp lệ → parse đúng số', () => {
      expect(parseEnv({ PG_POOL_MAX: '25' }).PG_POOL_MAX).toBe(25)
    })

    it('chuỗi rỗng (biến đặt nhưng để trống) → rơi về mặc định, không phải 0', () => {
      expect(parseEnv({ PG_POOL_MAX: '' }).PG_POOL_MAX).toBe(10)
    })

    it('không phải số → rơi về mặc định', () => {
      expect(parseEnv({ PG_POOL_MAX: 'abc' }).PG_POOL_MAX).toBe(10)
    })

    it('số âm hoặc 0 → rơi về mặc định (pool 0 kết nối là vô nghĩa)', () => {
      expect(parseEnv({ PG_POOL_MAX: '0' }).PG_POOL_MAX).toBe(10)
      expect(parseEnv({ PG_POOL_MAX: '-5' }).PG_POOL_MAX).toBe(10)
    })

    it('số thập phân → rơi về mặc định (pool phải là số nguyên kết nối)', () => {
      expect(parseEnv({ PG_POOL_MAX: '3.5' }).PG_POOL_MAX).toBe(10)
    })
  })

  describe('LOG_LEVEL', () => {
    it('giá trị hợp lệ được giữ nguyên', () => {
      expect(parseEnv({ LOG_LEVEL: 'warn' }).LOG_LEVEL).toBe('warn')
    })

    it('giá trị lạ → rơi về debug (khớp mặc định cũ của logger.ts)', () => {
      expect(parseEnv({ LOG_LEVEL: 'verbose' }).LOG_LEVEL).toBe('debug')
    })
  })
})

describe('getEnv', () => {
  it('cache theo process.env thật — gọi nhiều lần không parse lại (không ném lỗi)', () => {
    expect(() => {
      getEnv()
      getEnv()
    }).not.toThrow()
  })

  it('resetEnvCache() cho phép tính lại', () => {
    const a = getEnv()
    resetEnvCache()
    const b = getEnv()
    // Không đổi process.env thật giữa 2 lần gọi nên nội dung phải giống hệt, dù là object khác.
    expect(b).toEqual(a)
  })
})

describe('describeEnv', () => {
  it('biến chưa đặt hoặc rỗng → "missing"', () => {
    const out = describeEnv({ ANTHROPIC_API_KEY: '' })
    expect(out.ANTHROPIC_API_KEY).toBe('missing')
    expect(out.GROQ_API_KEY).toBe('missing')
  })

  it('biến bí mật ĐÃ đặt → chỉ báo "set", KHÔNG lộ giá trị thật', () => {
    const out = describeEnv({ ANTHROPIC_API_KEY: 'sk-ant-bi-mat-that' })
    expect(out.ANTHROPIC_API_KEY).toBe('set')
    expect(Object.values(out)).not.toContain('sk-ant-bi-mat-that')
  })

  it('biến công khai ĐÃ đặt → trả về đúng giá trị (hữu ích để chẩn đoán)', () => {
    const out = describeEnv({ STORAGE_DRIVER: 'r2', NODE_ENV: 'production' })
    expect(out.STORAGE_DRIVER).toBe('r2')
    expect(out.NODE_ENV).toBe('production')
  })
})
