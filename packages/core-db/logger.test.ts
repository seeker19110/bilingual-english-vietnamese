import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createLogger } from './logger'
import { resetSecretCache } from '../core-config/secrets.js'

const originalLogLevel = process.env.LOG_LEVEL

beforeEach(() => {
  delete process.env.LOG_LEVEL
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

afterEach(() => {
  if (originalLogLevel === undefined) delete process.env.LOG_LEVEL
  else process.env.LOG_LEVEL = originalLogLevel
  vi.restoreAllMocks()
})

describe('createLogger', () => {
  it('gắn đúng tiền tố module vào message', () => {
    const log = createLogger('agent')
    log.info('gọi Gemini bắt đầu')
    expect(console.log).toHaveBeenCalledWith('[agent] gọi Gemini bắt đầu')
  })

  it('debug/info dùng console.log, warn dùng console.warn, error dùng console.error', () => {
    const log = createLogger('x')
    log.debug('a')
    log.info('b')
    log.warn('c')
    log.error('d')
    expect(console.log).toHaveBeenCalledWith('[x] a')
    expect(console.log).toHaveBeenCalledWith('[x] b')
    expect(console.warn).toHaveBeenCalledWith('[x] c')
    expect(console.error).toHaveBeenCalledWith('[x] d')
  })

  it('chưa đặt LOG_LEVEL → mặc định hiện cả debug (khớp hành vi console.log cũ)', () => {
    const log = createLogger('x')
    log.debug('chi tiết vận hành')
    expect(console.log).toHaveBeenCalledWith('[x] chi tiết vận hành')
  })

  it('LOG_LEVEL=info → ẩn debug, vẫn hiện info/warn/error', () => {
    process.env.LOG_LEVEL = 'info'
    const log = createLogger('x')
    log.debug('bị ẩn')
    log.info('vẫn hiện')
    expect(console.log).not.toHaveBeenCalledWith('[x] bị ẩn')
    expect(console.log).toHaveBeenCalledWith('[x] vẫn hiện')
  })

  it('LOG_LEVEL=error → chỉ hiện error, ẩn cả warn', () => {
    process.env.LOG_LEVEL = 'error'
    const log = createLogger('x')
    log.warn('bị ẩn')
    log.error('vẫn hiện')
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('[x] vẫn hiện')
  })

  it('LOG_LEVEL rác/không hợp lệ → rơi về mặc định debug, không throw', () => {
    process.env.LOG_LEVEL = 'khong-hop-le'
    const log = createLogger('x')
    expect(() => log.debug('vẫn chạy bình thường')).not.toThrow()
    expect(console.log).toHaveBeenCalledWith('[x] vẫn chạy bình thường')
  })

  describe('che bí mật (Phase 01 mục 7 — secrets never enter logs)', () => {
    const originalKey = process.env.ANTHROPIC_API_KEY

    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = 'sk-ant-bi-mat-that-su'
      resetSecretCache()
    })

    afterEach(() => {
      if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY
      else process.env.ANTHROPIC_API_KEY = originalKey
      resetSecretCache()
    })

    it('secret lỡ tay đưa vào message log bị thay bằng ***, ở mọi cấp độ', () => {
      const log = createLogger('agent')
      log.error('gọi API lỗi với key=sk-ant-bi-mat-that-su')
      expect(console.error).toHaveBeenCalledWith('[agent] gọi API lỗi với key=***')
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('sk-ant-bi-mat-that-su'),
      )
    })

    it('message không chứa secret thì giữ nguyên', () => {
      const log = createLogger('agent')
      log.info('câu log bình thường')
      expect(console.log).toHaveBeenCalledWith('[agent] câu log bình thường')
    })
  })
})
