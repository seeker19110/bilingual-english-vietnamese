// api/_lib/concurrencyLimiter.ts — Giới hạn số lượt gọi ĐANG BAY đồng thời tới 1 nhà cung cấp
// AI/STT/TTS (Anthropic/Groq/Gemini/Google TTS/OpenAI STT...), chuẩn bị cho scale 100k-1M
// (xem docs/research/ke-hoach-scale-30k-concurrent.md). KHÔNG phải hàng đợi (BullMQ) — request
// vẫn đồng bộ chờ trả lời như cũ, chỉ CHỜ TỚI LƯỢT trước khi thật sự gọi ra ngoài nếu đã đạt
// giới hạn, tránh dồn quá nhiều kết nối cùng lúc làm nhà cung cấp trả 429/lỗi rate limit của họ.
//
// Giới hạn theo TỪNG TIẾN TRÌNH Node (không phải toàn cụm) — chạy N tiến trình (cluster mode)
// thì tổng giới hạn thật = N × giới hạn cấu hình. Tính vào khi đặt số.
//
// MẶC ĐỊNH KHÔNG GIỚI HẠN (giữ nguyên hành vi hiện tại) — chỉ bật khi đặt biến môi trường
// tương ứng, vd AI_CONCURRENCY_ANTHROPIC=20. Không đặt gì = không đổi gì so với trước.

const inFlight = new Map<string, number>()
const waiters = new Map<string, Array<() => void>>()

function envLimit(key: string): number | null {
  const v = Number(process.env[`AI_CONCURRENCY_${key.toUpperCase()}`])
  return Number.isFinite(v) && v > 0 ? v : null
}

/**
 * Chạy `fn()` sau khi đảm bảo không vượt quá giới hạn concurrency cấu hình cho `key`
 * (vd 'anthropic', 'groq', 'gemini', 'google-tts', 'openai-stt'). Không cấu hình giới hạn cho
 * key đó → chạy ngay, không chờ (giống hệt trước khi có hàm này).
 */
export async function withConcurrencyLimit<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const limit = envLimit(key)
  if (limit === null) return fn()

  while ((inFlight.get(key) ?? 0) >= limit) {
    await new Promise<void>((resolve) => {
      const list = waiters.get(key) ?? []
      list.push(resolve)
      waiters.set(key, list)
    })
  }

  inFlight.set(key, (inFlight.get(key) ?? 0) + 1)
  try {
    return await fn()
  } finally {
    inFlight.set(key, (inFlight.get(key) ?? 0) - 1)
    const list = waiters.get(key)
    const next = list?.shift()
    if (next) next()
  }
}
