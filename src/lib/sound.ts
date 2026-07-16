// src/lib/sound.ts — Hiệu ứng âm thanh nhẹ khi đúng/sai/đạt mốc (V-6, gamification).
// Tổng hợp bằng Web Audio API (oscillator) — KHÔNG tải file audio nào (chi phí $0, không
// tốn băng thông/Storage). Gọi an toàn ở mọi nơi — tự kiểm tra hỗ trợ + tùy chọn bật/tắt,
// không bao giờ ném lỗi (cùng triết lý với haptics.ts).

const SOUND_KEY = 'ui_sound_enabled'

// Mặc định BẬT — người dùng tắt ở /profile nếu thấy phiền.
export function isSoundEnabled(): boolean {
  try {
    const v = localStorage.getItem(SOUND_KEY)
    return v === null ? true : v === 'true'
  } catch {
    return true
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled))
  } catch {
    /* localStorage đầy/bị chặn — bỏ qua, chỉ là tùy chọn */
  }
}

// Dùng lại 1 AudioContext cho cả phiên (tạo mới mỗi lần rất tốn + có giới hạn số lượng
// context đồng thời trên vài trình duyệt).
let sharedCtx: AudioContext | null = null
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!sharedCtx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      sharedCtx = new Ctor()
    }
    return sharedCtx
  } catch {
    return null
  }
}

// Phát 1 nốt "beep" ngắn — tần số (Hz) + thời lượng (ms). Giảm dần âm lượng về 0 (không có
// tiếng "tách" khi tắt đột ngột). Trình duyệt không hỗ trợ AudioContext (hoặc đã tắt âm
// thanh) → lặng lẽ bỏ qua, không làm vỡ luồng học.
function beep(freq: number, durationMs: number, volume = 0.12): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
    osc.start(now)
    osc.stop(now + durationMs / 1000)
  } catch {
    // Âm thanh chỉ là hiệu ứng phụ — lỗi ở đây không được phép làm vỡ hành động chính.
  }
}

export const sound = {
  correct: () => beep(880, 120, 0.12), // nốt cao ngắn, dễ chịu
  wrong: () => beep(220, 160, 0.1), // nốt trầm ngắn, không chói tai
  // Hợp âm 3 nốt tăng dần (đô-mi-sol) — dùng cho màn ăn mừng streak/mục tiêu tuần/huy hiệu.
  milestone: () => {
    beep(523.25, 100, 0.1) // C5
    setTimeout(() => beep(659.25, 100, 0.1), 90) // E5
    setTimeout(() => beep(783.99, 160, 0.12), 180) // G5
  },
}
