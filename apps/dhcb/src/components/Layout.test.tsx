// apps/dhcb/src/components/Layout.test.tsx — Cổng canh CHẾ ĐỘ TẬP TRUNG của header.
//
// VÌ SAO CẦN (đợt B thiết kế lại UI/UX, 2026-09-03): header mặc định mang 8 khe trong 56px.
// Trang ngồi học lâu bật `focus` để ẩn đúng hai thứ không phục vụ việc đang làm — bộ chuyển
// Studio và huy hiệu streak. Đây là thứ RẤT dễ mất im lặng: thêm một prop mới vào Layout, hay
// dựng lại khối streak, là cờ này thành no-op mà không có gì đỏ. Test dưới canh cả hai chiều
// (bật thì ẩn, TẮT thì vẫn còn) — chỉ canh chiều "ẩn" thì một Layout hỏng hẳn cũng qua được.
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', name: 'An' } }),
}))
vi.mock('../context/useLang', () => ({
  useLang: () => ({
    T: { home: 'Trang chủ', appName: 'Đồng Hành', aboutApp: 'Giới thiệu', streakDays: 'ngày' },
  }),
}))
vi.mock('../lib/storage', () => ({ getStreak: () => 7 }))
// ThemeToggle đòi ThemeContext của `@core/*`; test này chỉ quan tâm các khe khác của header
// nên thay bằng một chỗ giữ chỗ, không dựng cả cây provider chỉ để render một nút.
vi.mock('./ThemeToggle', () => ({ default: () => null }))

const render = (focus: boolean) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <Layout title="Bài học" focus={focus} />
    </MemoryRouter>,
  )

describe('Layout — chế độ tập trung', () => {
  it('mặc định (focus tắt): còn bộ chuyển Studio và huy hiệu streak', () => {
    const html = render(false)
    expect(html).toContain('Chuyển đổi Studio')
    expect(html).toContain('🔥')
  })

  it('focus bật: ẩn CẢ bộ chuyển Studio LẪN huy hiệu streak', () => {
    const html = render(true)
    expect(html).not.toContain('Chuyển đổi Studio')
    expect(html).not.toContain('🔥')
  })

  it('focus bật vẫn GIỮ đường lùi và nút Bạn Đồng Hành (trợ giúp ngay trong lúc học)', () => {
    const html = render(true)
    expect(html).toContain('Trang chủ')
    expect(html).toContain('Mở Bạn Đồng Hành AI')
  })

  it('không còn chấm nhấp nháy vĩnh viễn trong header', () => {
    expect(render(false)).not.toContain('animate-ping')
    expect(render(false)).not.toContain('animate-pulse')
  })
})
