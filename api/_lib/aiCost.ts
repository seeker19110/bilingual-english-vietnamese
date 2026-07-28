// api/_lib/aiCost.ts — ĐƠN GIÁ ước tính chi phí cho mỗi lượt gọi AI (USD/lượt).
//
// Mục đích: dashboard quản trị (/api/admin-usage-stats) cần quy đổi "số lượt dùng" thành
// "tiền" để bạn quyết định có nên chỉnh hạn mức gói / tắt bớt tính năng đắt hay không.
//
// LƯU Ý QUAN TRỌNG: đây là ƯỚC TÍNH, không phải hoá đơn thật. Ta KHÔNG đo token thật của
// từng request (sẽ phải sửa mọi handler AI và ghi thêm bảng log — tốn kém, chưa cần ở quy mô
// hiện tại). Con số mặc định dưới đây tính từ độ dài prompt/response điển hình của từng chế
// độ với model đang dùng (xem api/_lib/aiConfig.ts). Khi có hoá đơn thật từ nhà cung cấp,
// chỉnh lại bằng BIẾN MÔI TRƯỜNG — không cần sửa code, không cần deploy lại frontend.
import type { UsageMode } from './usage.js'

// Đơn giá mặc định (USD cho MỖI lượt). Cơ sở ước tính:
//   chat      — Claude Haiku 4.5, ~1.5k token vào + ~400 token ra mỗi lượt trò chuyện.
//   writing   — bài viết dài hơn + chấm điểm chi tiết kiểu IELTS → nhiều token ra nhất.
//   speaking  — 1 lượt nói = trả lời tiếng đích + phần sửa lỗi tiếng mẹ đẻ (2 đoạn văn bản).
//   stt       — Whisper qua Groq (whisper-large-v3-turbo), đoạn ghi âm ~30 giây.
//   pronounce — chấm phát âm Azure, tính theo giờ audio, mỗi lượt vài giây.
// CHƯA gồm: TTS (tính theo ký tự VÀ có cache dùng chung, xem tts_cache — chi phí thực tế
// thấp hơn nhiều số lượt) và hạ tầng VPS (chi phí cố định, không theo lượt).
const DEFAULT_UNIT_USD: Record<UsageMode, number> = {
  chat: 0.0025,
  writing: 0.004,
  speaking: 0.003,
  stt: 0.0005,
  pronounce: 0.0004,
}

// Tỉ giá quy đổi USD → VND để so trực tiếp với doanh thu (đơn thanh toán ghi bằng VND).
const DEFAULT_USD_VND = 26_000

// Đọc số dương từ biến môi trường; giá trị rỗng/sai định dạng/≤ 0 → dùng mặc định.
// (Đặt nhầm biến môi trường thành chuỗi rác KHÔNG được phép làm chi phí hiển thị thành 0 —
// số 0 trông như "miễn phí" và dẫn tới quyết định sai.)
function envNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const value = Number(raw)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const ENV_NAME: Record<UsageMode, string> = {
  chat: 'AI_COST_CHAT_USD',
  writing: 'AI_COST_WRITING_USD',
  speaking: 'AI_COST_SPEAKING_USD',
  stt: 'AI_COST_STT_USD',
  pronounce: 'AI_COST_PRONOUNCE_USD',
}

// Đơn giá đang áp dụng cho từng chế độ (đã tính cả ghi đè từ biến môi trường).
export function getUnitCostsUsd(): Record<UsageMode, number> {
  return {
    chat: envNumber(ENV_NAME.chat, DEFAULT_UNIT_USD.chat),
    writing: envNumber(ENV_NAME.writing, DEFAULT_UNIT_USD.writing),
    speaking: envNumber(ENV_NAME.speaking, DEFAULT_UNIT_USD.speaking),
    stt: envNumber(ENV_NAME.stt, DEFAULT_UNIT_USD.stt),
    pronounce: envNumber(ENV_NAME.pronounce, DEFAULT_UNIT_USD.pronounce),
  }
}

export function getUsdVndRate(): number {
  return envNumber('USD_VND_RATE', DEFAULT_USD_VND)
}

// Chi phí ước tính (USD) của một rổ lượt dùng theo chế độ.
export function estimateCostUsd(counts: Partial<Record<UsageMode, number>>): number {
  const unit = getUnitCostsUsd()
  let total = 0
  for (const [mode, price] of Object.entries(unit) as [UsageMode, number][]) {
    total += (counts[mode] ?? 0) * price
  }
  return total
}
