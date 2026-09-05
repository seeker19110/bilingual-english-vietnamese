// Test navPaths — bảng tiền tố đường dẫn dùng chung cho BottomNav/DesktopSidebar.
import { describe, it, expect } from 'vitest'
import {
  LEARNING_PATHS,
  PRACTICE_PATHS,
  COMPANION_PATHS,
  PRICING_PATHS,
  PROFILE_PATHS,
  ENGLISH_PATHS,
  CAREER_PATHS,
  WORKLIFE_PATHS,
  PROGRESS_PATHS,
  matchesNav,
  resolveActiveNav,
} from './navPaths.js'

// Mọi bảng path phải là mảng khác rỗng — nếu ai đó lỡ xoá sạch nội dung, test này bắt ngay.
describe('các bảng hằng path', () => {
  it.each([
    ['LEARNING_PATHS', LEARNING_PATHS],
    ['PRACTICE_PATHS', PRACTICE_PATHS],
    ['COMPANION_PATHS', COMPANION_PATHS],
    ['PRICING_PATHS', PRICING_PATHS],
    ['PROFILE_PATHS', PROFILE_PATHS],
    ['ENGLISH_PATHS', ENGLISH_PATHS],
    ['CAREER_PATHS', CAREER_PATHS],
    ['WORKLIFE_PATHS', WORKLIFE_PATHS],
    ['PROGRESS_PATHS', PROGRESS_PATHS],
  ])('%s không rỗng và mọi phần tử bắt đầu bằng "/"', (_name, paths) => {
    expect(paths.length).toBeGreaterThan(0)
    for (const p of paths) expect(p.startsWith('/')).toBe(true)
  })
})

describe('matchesNav', () => {
  it('khớp khi pathname trùng chính xác một tiền tố', () => {
    expect(matchesNav('/tien-do', PROGRESS_PATHS)).toBe(true)
  })

  it('khớp khi pathname là trang con (khớp một phần theo tiền tố)', () => {
    expect(matchesNav('/luyen-noi/bai-1', PRACTICE_PATHS)).toBe(true)
  })

  it('không khớp khi pathname không thuộc nhóm', () => {
    expect(matchesNav('/khong-ton-tai', PROGRESS_PATHS)).toBe(false)
  })

  it('chuỗi rỗng không khớp bất kỳ tiền tố nào (trừ khi tiền tố cũng rỗng)', () => {
    expect(matchesNav('', PROGRESS_PATHS)).toBe(false)
  })

  it('mảng path rỗng thì không bao giờ khớp', () => {
    expect(matchesNav('/tien-do', [])).toBe(false)
  })
})

describe('resolveActiveNav', () => {
  it('trả về to của entry khớp ĐẦU TIÊN theo thứ tự (ai đứng trước thắng)', () => {
    const result = resolveActiveNav('/hoc-tieng-anh', [
      { to: '/english', paths: ENGLISH_PATHS },
      { to: '/phong-hoc', paths: LEARNING_PATHS },
    ])
    expect(result).toBe('/english')
  })

  it('entry sau vẫn khớp nếu entry trước không khớp', () => {
    const result = resolveActiveNav('/luyen-noi', [
      { to: '/english', paths: ENGLISH_PATHS },
      { to: '/luyen-tap', paths: PRACTICE_PATHS },
    ])
    expect(result).toBe('/luyen-tap')
  })

  it('không entry nào khớp → trả về null', () => {
    const result = resolveActiveNav('/khong-ton-tai', [{ to: '/english', paths: ENGLISH_PATHS }])
    expect(result).toBeNull()
  })

  it('entry exact=true chỉ khớp khi pathname bằng CHÍNH XÁC to', () => {
    expect(resolveActiveNav('/', [{ to: '/', exact: true }])).toBe('/')
    expect(resolveActiveNav('/khac', [{ to: '/', exact: true }])).toBeNull()
  })

  it('entry không truyền paths thì dùng chính [to] làm tiền tố duy nhất', () => {
    expect(resolveActiveNav('/nang-cap', [{ to: '/nang-cap' }])).toBe('/nang-cap')
    expect(resolveActiveNav('/nang-cap/xyz', [{ to: '/nang-cap' }])).toBe('/nang-cap')
    expect(resolveActiveNav('/khac', [{ to: '/nang-cap' }])).toBeNull()
  })

  it('mảng entries rỗng → luôn null', () => {
    expect(resolveActiveNav('/tien-do', [])).toBeNull()
  })
})
