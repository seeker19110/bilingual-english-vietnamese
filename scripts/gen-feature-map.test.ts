// scripts/gen-feature-map.test.ts — test 3 hàm thuần rút dữ liệu cho bản đồ tính năng.

import { describe, expect, it } from 'vitest'

import { extractRoutes, extractApiPaths, groupByPillar } from './gen-feature-map'

describe('extractRoutes', () => {
  it('rút mọi path= và bỏ trùng, sắp xếp', () => {
    const src = '<Route path="/b" /><Route path="/a" /><Route path="/a" />'
    expect(extractRoutes(src)).toEqual(['/a', '/b'])
  })

  it('nguồn không có route nào → mảng rỗng', () => {
    expect(extractRoutes('export default function App() { return null }')).toEqual([])
  })
})

describe('extractApiPaths', () => {
  it('chỉ lấy chuỗi bắt đầu bằng /api/', () => {
    const src = "gan('/api/chat', h); gan('/health', h); gan('/api/tts', h)"
    expect(extractApiPaths(src)).toEqual(['/api/chat', '/api/tts'])
  })
})

describe('groupByPillar', () => {
  it('gom theo đoạn đầu của đường dẫn', () => {
    const g = groupByPillar(['/hoc/a', '/hoc/b', '/thi/c'])
    expect([...g.keys()]).toEqual(['hoc', 'thi'])
    expect(g.get('hoc')).toEqual(['/hoc/a', '/hoc/b'])
  })

  it('đường dẫn gốc "/" được gom vào nhóm riêng, không làm vỡ hàm', () => {
    expect([...groupByPillar(['/']).keys()]).toEqual(['(gốc)'])
  })
})
