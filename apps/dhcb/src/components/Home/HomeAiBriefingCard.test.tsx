// apps/dhcb/src/components/Home/HomeAiBriefingCard.test.tsx — Cổng canh thẻ AI mở đầu trang chủ.
//
// VÌ SAO CẦN (đợt C thiết kế lại UI/UX, 2026-09-03): thẻ này là thứ đầu tiên người học nhìn
// thấy mỗi ngày. Trước đợt C nó mang 2 quầng sáng blur, gradient + bóng màu, một chấm "trực
// tuyến" nhấp nháy vĩnh viễn và nhãn HOA nhỏ giãn chữ — đúng bộ "tell" của UI do AI sinh mà
// mục 9 của `.agents/skills/ui-ux-craftsman` liệt kê. Mấy thứ này rất dễ quay lại theo từng
// PR nhỏ, nên canh bằng test render thật (happy-dom) ở cả trạng thái đang tải lẫn đã tải.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import HomeAiBriefingCard from './HomeAiBriefingCard'

const fetchBriefing = vi.fn()
vi.mock('../../lib/proactiveBriefingApi', () => ({
  fetchProactiveBriefing: () => fetchBriefing(),
}))
vi.mock('../../lib/tts', () => ({ speak: vi.fn() }))

// happy-dom không có sẵn cờ này; React 18 cần nó để act() không cảnh báo.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

async function render(props: Parameters<typeof HomeAiBriefingCard>[0]) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root.render(
      <MemoryRouter>
        <HomeAiBriefingCard {...props} />
      </MemoryRouter>,
    )
  })
  return container
}

// Ba mẫu trang trí mà đợt C gỡ — không được quay lại ở BẤT KỲ trạng thái nào.
const FORBIDDEN = ['animate-ping', 'blur-', 'bg-gradient-', 'shadow-accent-', 'uppercase']

describe('HomeAiBriefingCard — thẻ AI tập trung (đợt C)', () => {
  beforeEach(() => {
    fetchBriefing.mockReset()
  })

  it('đang tải: chỉ có skeleton, không có chấm nhấp nháy hay quầng sáng', async () => {
    fetchBriefing.mockReturnValue(new Promise(() => {}))
    const el = await render({ userName: 'An' })
    const html = el.innerHTML
    expect(html).toContain('Đang tải bản tin')
    for (const cls of FORBIDDEN) expect(html).not.toContain(cls)
    // Tiêu đề thẻ phải là "Bạn Đồng Hành AI" — e2e/v2-hubs.spec.ts tìm heading này trên trang chủ.
    expect(el.querySelector('h2')?.textContent).toBe('Bạn Đồng Hành AI')
    expect(html).toContain(', An!')
  })

  it('đã tải: không còn animate-pulse nào (pulse chỉ dành cho skeleton — luật 6 mục 9)', async () => {
    fetchBriefing.mockResolvedValue({ summary: 'Bản tin thử.', insights: ['Đã ôn 3 thẻ'] })
    const el = await render({ srsDueCount: 4, continueLessonLabel: 'Bài 1', continueLevelId: 'A1' })
    const html = el.innerHTML
    expect(html).toContain('Bản tin thử.')
    expect(html).toContain('Đã ôn 3 thẻ')
    expect(html).not.toContain('animate-pulse')
    for (const cls of FORBIDDEN) expect(html).not.toContain(cls)
    // Đúng HAI việc tiếp theo: học tiếp + ôn SRS.
    expect(html).toContain('Bài 1')
    expect(html).toContain('Ôn 4 thẻ đến hạn')
  })

  it('API lỗi: vẫn có câu dự phòng, không vỡ thẻ', async () => {
    fetchBriefing.mockRejectedValue(new Error('down'))
    const el = await render({})
    expect(el.innerHTML).toContain('Hôm nay bạn đang duy trì chuỗi học tập rất tốt')
    expect(el.innerHTML).toContain('Khám phá lộ trình CEFR')
  })
})
