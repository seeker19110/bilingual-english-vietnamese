import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  isAppError,
  toErrorBody,
} from './appError.js'

describe('các lớp lỗi con — status/code/message đúng theo từng loại', () => {
  it.each([
    [ValidationError, 'sai dữ liệu', 400, 'validation_error'],
    [UnauthorizedError, undefined, 401, 'unauthorized'],
    [ForbiddenError, undefined, 403, 'forbidden'],
    [NotFoundError, undefined, 404, 'not_found'],
    [ConflictError, 'key đã tồn tại', 409, 'conflict'],
    [RateLimitError, undefined, 429, 'rate_limited'],
  ] as const)('%s', (ErrorClass, customMessage, expectedStatus, expectedCode) => {
    const err = customMessage === undefined ? new ErrorClass() : new ErrorClass(customMessage)
    expect(err.status).toBe(expectedStatus)
    expect(err.code).toBe(expectedCode)
    expect(err).toBeInstanceOf(AppError)
    expect(err).toBeInstanceOf(Error)
    if (customMessage !== undefined) expect(err.message).toBe(customMessage)
    else expect(err.message.length).toBeGreaterThan(0) // có message mặc định hợp lý, không rỗng
  })
})

describe('isAppError', () => {
  it('AppError (và lớp con) → true', () => {
    expect(isAppError(new ValidationError('x'))).toBe(true)
    expect(isAppError(new NotFoundError())).toBe(true)
  })

  it('Error thường (lỗi hạ tầng bất ngờ) → false — KHÔNG bị coi nhầm là lỗi nghiệp vụ đã biết', () => {
    expect(isAppError(new Error('DB connection lost'))).toBe(false)
  })

  it('giá trị không phải Error (throw string/undefined...) → false, không ném lỗi khi kiểm', () => {
    expect(isAppError('chuỗi lỗi')).toBe(false)
    expect(isAppError(undefined)).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})

describe('toErrorBody', () => {
  it('đúng hình dạng {error:{message,code}}', () => {
    const err = new ConflictError('key đã tồn tại')
    expect(toErrorBody(err)).toEqual({
      error: { message: 'key đã tồn tại', code: 'conflict' },
    })
  })

  it('lớp con tuỳ biến vẫn ra đúng code của lớp cha AppError khi tự khai báo', () => {
    class QuotaExceededError extends AppError {
      constructor() {
        super('Hết hạn mức tháng này', 402, 'quota_exceeded')
      }
    }
    expect(toErrorBody(new QuotaExceededError())).toEqual({
      error: { message: 'Hết hạn mức tháng này', code: 'quota_exceeded' },
    })
  })
})
