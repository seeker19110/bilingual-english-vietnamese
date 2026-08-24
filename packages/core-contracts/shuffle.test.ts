import { describe, it, expect } from 'vitest'
import { shuffle } from './shuffle.js'

// Nguồn ngẫu nhiên XÁC ĐỊNH (mulberry32) — test phân bố phải lặp lại y hệt mỗi lần chạy, nếu
// không chính nó thành test flaky (quy trình audit Tầng 1b).
function seededRng(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

describe('shuffle', () => {
  it('không đụng mảng gốc, trả bản sao', () => {
    const goc = [1, 2, 3, 4, 5]
    const ra = shuffle(goc, seededRng(1))
    expect(goc).toEqual([1, 2, 3, 4, 5])
    expect(ra).not.toBe(goc)
  })

  it('giữ nguyên đủ phần tử, không thêm không mất', () => {
    const goc = ['a', 'b', 'c', 'd', 'e', 'f']
    expect([...shuffle(goc, seededRng(7))].sort()).toEqual([...goc].sort())
  })

  it('ca biên: mảng rỗng và mảng 1 phần tử', () => {
    expect(shuffle([], seededRng(1))).toEqual([])
    expect(shuffle(['x'], seededRng(1))).toEqual(['x'])
  })

  // ── BẤT BIẾN CHÍNH — đây là test bắt được lỗi F1 ──────────────────────────────
  // Với `sort(() => Math.random() - 0.5)` test này FAIL (vị trí 1 ~36%, vị trí 2 ~17%).
  it('phân bố ĐỀU: phần tử đứng đầu rơi vào mọi vị trí với xác suất như nhau', () => {
    const K = 4
    const N = 100_000
    const rng = seededRng(20260824)
    const dem = new Array<number>(K).fill(0)
    const goc = ['DUNG', 'sai1', 'sai2', 'sai3']

    for (let n = 0; n < N; n++) {
      dem[shuffle(goc, rng).indexOf('DUNG')]!++
    }

    // Sai số ±1 điểm phần trăm quanh 25% — rộng hơn ~7 lần độ lệch chuẩn nên không thể flaky,
    // mà vẫn hẹp hơn nhiều so với mức lệch 11 điểm của thuật toán sai.
    for (let i = 0; i < K; i++) {
      const pct = (dem[i]! / N) * 100
      expect(pct).toBeGreaterThan(100 / K - 1)
      expect(pct).toBeLessThan(100 / K + 1)
    }
  })

  it('phân bố ĐỀU cả với 3 lựa chọn', () => {
    const K = 3
    const N = 100_000
    const rng = seededRng(999)
    const dem = new Array<number>(K).fill(0)
    const goc = ['DUNG', 'sai1', 'sai2']
    for (let n = 0; n < N; n++) dem[shuffle(goc, rng).indexOf('DUNG')]!++
    for (let i = 0; i < K; i++) {
      const pct = (dem[i]! / N) * 100
      expect(pct).toBeGreaterThan(100 / K - 1)
      expect(pct).toBeLessThan(100 / K + 1)
    }
  })
})
