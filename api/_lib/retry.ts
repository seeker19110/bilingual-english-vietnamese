// api/_lib/retry.ts
// Utility xử lý retry + exponential backoff + jitter cho các lệnh gọi API.
// Dùng khi gặp lỗi tạm thời (503, timeout, rate limit).

export interface RetryOptions {
  maxRetries?: number          // số lần retry tối đa (mặc định 3)
  initialDelayMs?: number      // khoảng chờ ban đầu (mặc định 100ms)
  maxDelayMs?: number          // khoảng chờ tối đa (mặc định 5000ms)
  backoffMultiplier?: number   // nhân số theo exponential (mặc định 2)
  jitterFactor?: number        // tỷ lệ random jitter (mặc định 0.1 = ±10%)
}

// Kiểm tra xem lỗi có nên retry không.
// Retry nếu: 503, 429 (rate limit), timeout, network error, 502/504 (gateway).
// Không retry nếu: 401 (auth), 403 (forbidden), 400/413 (bad request).
export function isRetryableError(error: unknown, statusCode?: number): boolean {
  // HTTP status codes nên retry
  if (statusCode) {
    const retryableStatuses = [429, 502, 503, 504]
    return retryableStatuses.includes(statusCode)
  }

  // Network errors / timeout
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('timeout') ||
      msg.includes('network') ||
      msg.includes('temporarily unavailable') ||
      msg.includes('failed to fetch')
    )
  }

  return false
}

// Sleep với jitter — tránh "thundering herd" khi nhiều request retry cùng lúc.
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Tính khoảng chờ tiếp theo với exponential backoff + jitter.
function getNextDelayMs(attempt: number, options: RetryOptions): number {
  const {
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    jitterFactor = 0.1,
  } = options

  // Exponential: delay = initialDelay * multiplier^attempt
  let delay = initialDelayMs * Math.pow(backoffMultiplier, attempt)
  delay = Math.min(delay, maxDelayMs)

  // Thêm jitter: [delay * (1 - jitter), delay * (1 + jitter)]
  const jitterRange = delay * jitterFactor
  const randomJitter = (Math.random() - 0.5) * 2 * jitterRange
  return Math.max(1, Math.round(delay + randomJitter))
}

// Retry một async function với exponential backoff + jitter.
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 3 } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Kiểm tra xem có nên retry
      let statusCode: number | undefined
      if (error instanceof Error && error.message.includes('(')) {
        const match = error.message.match(/\((\d{3})\)/)
        statusCode = match ? parseInt(match[1], 10) : undefined
      }

      if (!isRetryableError(error, statusCode)) {
        throw error // Không retry cho lỗi không thể retry
      }

      if (attempt === maxRetries) {
        throw error // Hết số lần retry
      }

      // Chờ trước khi retry
      const delayMs = getNextDelayMs(attempt, options)
      console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed, waiting ${delayMs}ms...`, error)
      await sleep(delayMs)
    }
  }

  throw lastError
}
