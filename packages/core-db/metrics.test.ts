import { describe, it, expect, beforeEach } from 'vitest'
import { incrementCounter, recordLatency, getMetricsSnapshot, resetMetrics } from './metrics.js'

beforeEach(() => {
  resetMetrics()
})

describe('incrementCounter', () => {
  it('bộ đếm mới bắt đầu từ 1', () => {
    incrementCounter('groq_call')
    expect(getMetricsSnapshot().counters.groq_call).toBe(1)
  })

  it('gọi nhiều lần cộng dồn đúng', () => {
    incrementCounter('groq_call')
    incrementCounter('groq_call')
    incrementCounter('groq_call')
    expect(getMetricsSnapshot().counters.groq_call).toBe(3)
  })

  it('các tên khác nhau đếm ĐỘC LẬP, không lẫn vào nhau', () => {
    incrementCounter('groq_call')
    incrementCounter('anthropic_call')
    incrementCounter('anthropic_call')
    const snap = getMetricsSnapshot()
    expect(snap.counters.groq_call).toBe(1)
    expect(snap.counters.anthropic_call).toBe(2)
  })
})

describe('recordLatency', () => {
  it('1 lần đo → avg = max = giá trị đó, count = 1', () => {
    recordLatency('groq_latency', 120)
    const snap = getMetricsSnapshot().latencies.groq_latency
    expect(snap).toEqual({ count: 1, avgMs: 120, maxMs: 120 })
  })

  it('nhiều lần đo → avg tính đúng trung bình cộng, maxMs là giá trị LỚN NHẤT (không phải lần cuối)', () => {
    recordLatency('groq_latency', 100)
    recordLatency('groq_latency', 300)
    recordLatency('groq_latency', 200)
    const snap = getMetricsSnapshot().latencies.groq_latency
    expect(snap).toBeDefined()
    expect(snap?.count).toBe(3)
    expect(snap?.avgMs).toBeCloseTo(200) // (100+300+200)/3
    expect(snap?.maxMs).toBe(300)
  })

  it('giá trị 0ms hợp lệ (không bị coi như "chưa có dữ liệu")', () => {
    recordLatency('instant', 0)
    expect(getMetricsSnapshot().latencies.instant).toEqual({ count: 1, avgMs: 0, maxMs: 0 })
  })
})

describe('getMetricsSnapshot', () => {
  it('chưa ghi gì → object rỗng ở cả 2 nhóm, không throw', () => {
    expect(getMetricsSnapshot()).toEqual({ counters: {}, latencies: {} })
  })

  it('counters và latencies độc lập nhau dù cùng tên', () => {
    incrementCounter('groq')
    recordLatency('groq', 50)
    const snap = getMetricsSnapshot()
    expect(snap.counters.groq).toBe(1)
    expect(snap.latencies.groq).toEqual({ count: 1, avgMs: 50, maxMs: 50 })
  })
})

describe('resetMetrics', () => {
  it('xoá sạch cả counters lẫn latencies', () => {
    incrementCounter('x')
    recordLatency('y', 10)
    resetMetrics()
    expect(getMetricsSnapshot()).toEqual({ counters: {}, latencies: {} })
  })
})
