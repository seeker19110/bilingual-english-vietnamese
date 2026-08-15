// packages/core-db/metrics.ts — Đếm/đo LATENCY cơ bản trong bộ nhớ, dùng chung toàn app.
//
// Phase 01 "Foundation OS" mục 6 (docs/phases/01-foundation-os.md): "basic metrics". CỐ Ý tối
// giản — đây KHÔNG phải hệ observability thật (không export Prometheus, không percentile chuẩn,
// không giữ lâu dài); mục tiêu chỉ là có MỘT nơi ghi "việc X xảy ra bao nhiêu lần / mất bao lâu"
// mà code chẩn đoán (endpoint admin, log định kỳ) đọc lại được, thay vì mỗi nơi tự cộng biến đếm
// rải rác. Quan sát/export thật (dashboard, alert) là việc của Phase 35 Observability
// (docs/phases/35-observability.md) — module này chỉ là nền để phase đó có chỗ bắt đầu.
//
// Reset khi restart process (PM2 reload/deploy) — CHẤP NHẬN ĐƯỢC vì mục đích là quan sát tức
// thời (vd "Groq đang lỗi bao nhiêu % trong giờ qua"), không phải số liệu tích luỹ dài hạn (số đó
// đã có bảng riêng trong Postgres, vd `tts_cache_stats`).

interface CounterState {
  count: number
}

interface LatencyState {
  count: number
  sumMs: number
  maxMs: number
}

const counters = new Map<string, CounterState>()
const latencies = new Map<string, LatencyState>()

/** Cộng 1 vào bộ đếm tên `name` (tự tạo nếu chưa có). */
export function incrementCounter(name: string): void {
  const state = counters.get(name)
  if (state) state.count += 1
  else counters.set(name, { count: 1 })
}

/** Ghi nhận 1 lần đo thời gian (ms) cho tên `name` — tích luỹ count/tổng/max để tính trung bình. */
export function recordLatency(name: string, ms: number): void {
  const state = latencies.get(name)
  if (state) {
    state.count += 1
    state.sumMs += ms
    if (ms > state.maxMs) state.maxMs = ms
  } else {
    latencies.set(name, { count: 1, sumMs: ms, maxMs: ms })
  }
}

export interface MetricsSnapshot {
  counters: Record<string, number>
  latencies: Record<string, { count: number; avgMs: number; maxMs: number }>
}

/** Chụp toàn bộ số liệu hiện có — dùng cho endpoint chẩn đoán/log định kỳ. */
export function getMetricsSnapshot(): MetricsSnapshot {
  const counterOut: Record<string, number> = {}
  for (const [name, state] of counters) counterOut[name] = state.count

  const latencyOut: Record<string, { count: number; avgMs: number; maxMs: number }> = {}
  for (const [name, state] of latencies) {
    latencyOut[name] = {
      count: state.count,
      avgMs: state.sumMs / state.count,
      maxMs: state.maxMs,
    }
  }

  return { counters: counterOut, latencies: latencyOut }
}

/** Xoá toàn bộ số liệu. Dùng trong test; production không cần gọi (reset tự nhiên khi restart). */
export function resetMetrics(): void {
  counters.clear()
  latencies.clear()
}
