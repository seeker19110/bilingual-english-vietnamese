// Test toán vị trí: khoảng cách haversine, làm mờ toạ độ (chế độ kín đáo), phát hiện người lạc,
// và luật tiết kiệm pin (khi nào mới gửi vị trí mới).
import { describe, it, expect } from 'vitest'
import {
  APPROX_GRID_DEG,
  coarsen,
  distanceMeters,
  findStragglers,
  groupCenter,
  shouldSendUpdate,
} from './geo.js'

describe('distanceMeters', () => {
  it('cùng một điểm → 0m', () => {
    expect(distanceMeters({ lat: 10.77, lng: 106.7 }, { lat: 10.77, lng: 106.7 })).toBe(0)
  })

  it('1 độ vĩ tuyến ≈ 111km (sai số < 1%)', () => {
    const d = distanceMeters({ lat: 10, lng: 106 }, { lat: 11, lng: 106 })
    expect(d).toBeGreaterThan(110_000)
    expect(d).toBeLessThan(112_000)
  })

  it('đối xứng — đổi chiều cho cùng kết quả', () => {
    const a = { lat: 21.03, lng: 105.85 }
    const b = { lat: 10.78, lng: 106.7 }
    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 6)
  })

  it('qua kinh tuyến 180° vẫn ra khoảng cách ngắn, không vòng quanh Trái Đất', () => {
    const d = distanceMeters({ lat: 0, lng: 179.99 }, { lat: 0, lng: -179.99 })
    expect(d).toBeLessThan(3000)
  })
})

describe('coarsen', () => {
  it('làm tròn về lưới ~500m', () => {
    const out = coarsen({ lat: 10.7712, lng: 106.7003 })
    const steps = out.lat / APPROX_GRID_DEG
    expect(Math.abs(steps - Math.round(steps))).toBeLessThan(1e-6)
    expect(distanceMeters(out, { lat: 10.7712, lng: 106.7003 })).toBeLessThan(500)
  })

  it('không để lộ chữ số thập phân thừa (sai số dấu phẩy động)', () => {
    const out = coarsen({ lat: 10.0051, lng: 106.0049 })
    expect(String(out.lat).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(6)
  })
})

describe('groupCenter', () => {
  it('nhóm rỗng → null', () => expect(groupCenter([])).toBeNull())
  it('trung bình cộng toạ độ', () => {
    expect(
      groupCenter([
        { lat: 10, lng: 100 },
        { lat: 12, lng: 102 },
      ]),
    ).toEqual({
      lat: 11,
      lng: 101,
    })
  })
})

describe('findStragglers', () => {
  const anchor = { lat: 10.77, lng: 106.7 }

  it('không có mốc → không cảnh báo ai', () => {
    expect(findStragglers([{ userId: 'u1', position: anchor }], null, 300)).toEqual([])
  })

  it('bỏ qua người chưa có vị trí (đang tắt chia sẻ)', () => {
    expect(findStragglers([{ userId: 'u1', position: null }], anchor, 300)).toEqual([])
  })

  it('chỉ báo người vượt ngưỡng, sắp xếp xa nhất trước', () => {
    const out = findStragglers(
      [
        { userId: 'gan', position: { lat: 10.7705, lng: 106.7 } }, // ~55m
        { userId: 'xa', position: { lat: 10.78, lng: 106.7 } }, // ~1.1km
        { userId: 'vua-du', position: { lat: 10.775, lng: 106.7 } }, // ~555m
      ],
      anchor,
      300,
    )
    expect(out.map((s) => s.userId)).toEqual(['xa', 'vua-du'])
    expect(out[0]!.distanceM).toBeGreaterThan(out[1]!.distanceM)
  })

  it('đúng ở ranh giới: bằng ngưỡng thì KHÔNG báo lạc', () => {
    const point = { lat: 10.77, lng: 106.7 }
    const out = findStragglers([{ userId: 'u1', position: point }], anchor, 0)
    expect(out).toEqual([])
  })
})

describe('shouldSendUpdate', () => {
  const p = { lat: 10.77, lng: 106.7 }

  it('lần đầu luôn gửi', () => expect(shouldSendUpdate(null, p, 0)).toBe(true))

  it('đứng yên nhưng quá lâu → vẫn gửi (nhịp tim còn online)', () => {
    expect(shouldSendUpdate({ point: p, sentAtMs: 0 }, p, 30_000)).toBe(true)
  })

  it('đứng yên và mới gửi → không gửi', () => {
    expect(shouldSendUpdate({ point: p, sentAtMs: 0 }, p, 5_000)).toBe(false)
  })

  it('di chuyển đủ xa → gửi ngay dù mới gửi', () => {
    expect(shouldSendUpdate({ point: p, sentAtMs: 0 }, { lat: 10.7705, lng: 106.7 }, 1_000)).toBe(
      true,
    )
  })
})
