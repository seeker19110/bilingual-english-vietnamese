import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatAgo, formatDistance, formatRemaining } from './locationFormat'

// Ca biên của ba hàm định dạng màn hình "Đi chung". Toàn bộ đều là ngưỡng chuyển đơn vị — chỗ
// dễ sai nhất và cũng là chỗ người dùng nhìn thấy ngay (mét nhảy thành km, "vừa xong" thành số).

describe('formatDistance', () => {
  it('dưới 1 km đọc theo mét, làm tròn', () => {
    expect(formatDistance(0)).toBe('0 m')
    expect(formatDistance(20.4)).toBe('20 m')
    expect(formatDistance(999)).toBe('999 m')
  })

  it('từ đúng 1000 m trở lên đổi sang km', () => {
    expect(formatDistance(1000)).toBe('1.0 km')
    expect(formatDistance(1449)).toBe('1.4 km')
  })
})

describe('formatAgo', () => {
  afterEach(() => vi.useRealTimers())

  function atSecondsAgo(seconds: number): string {
    const now = new Date('2026-08-26T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    return formatAgo(new Date(now.getTime() - seconds * 1000).toISOString())
  }

  it('chưa từng chia sẻ', () => {
    expect(formatAgo(null)).toBe('chưa chia sẻ')
  })

  it('dưới 15 giây coi như đang chạy thật', () => {
    expect(atSecondsAgo(0)).toBe('vừa xong')
    expect(atSecondsAgo(14)).toBe('vừa xong')
  })

  it('các ngưỡng giây → phút → giờ', () => {
    expect(atSecondsAgo(15)).toBe('15 giây trước')
    expect(atSecondsAgo(59)).toBe('59 giây trước')
    expect(atSecondsAgo(60)).toBe('1 phút trước')
    expect(atSecondsAgo(3600)).toBe('1 giờ trước')
  })

  it('mốc thời gian ở tương lai (lệch đồng hồ máy) không ra số âm', () => {
    expect(atSecondsAgo(-30)).toBe('vừa xong')
  })
})

describe('formatRemaining', () => {
  afterEach(() => vi.useRealTimers())

  function inMinutes(minutes: number): string {
    const now = new Date('2026-08-26T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    return formatRemaining(new Date(now.getTime() + minutes * 60_000).toISOString())
  }

  it('hết hạn rồi thì nói hết hạn, không đếm ngược âm', () => {
    expect(inMinutes(0)).toBe('đã hết hạn')
    expect(inMinutes(-30)).toBe('đã hết hạn')
  })

  it('dưới 1 giờ đếm theo phút', () => {
    expect(inMinutes(45)).toBe('còn 45 phút')
  })

  it('tròn giờ thì không hiện "0 phút" thừa', () => {
    expect(inMinutes(60)).toBe('còn 1 giờ')
    expect(inMinutes(240)).toBe('còn 4 giờ')
  })

  it('lẻ phút thì hiện cả giờ lẫn phút', () => {
    expect(inMinutes(95)).toBe('còn 1 giờ 35 phút')
  })
})
