// Unit test cho AdminIntakePanel — tập trung vào chỗ dễ đọc nhầm số liệu nhất.
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

vi.mock('@core/authHeader', () => ({ getAuthHeader: async () => ({}) }))

import AdminIntakePanel from './AdminIntakePanel'
import { formatRate } from '../../lib/statFormat'

describe('formatRate', () => {
  it('CHƯA CÓ DỮ LIỆU (null) hiện dấu gạch, KHÔNG phải 0%', () => {
    // Đây là bug dễ mắc và khó phát hiện: thấy 0% người ta kết luận "gợi ý trượt hoàn toàn",
    // trong khi sự thật có thể chỉ là chưa ai đi qua luồng này.
    expect(formatRate(null)).toBe('—')
    expect(formatRate(undefined)).toBe('—')
    expect(formatRate(0)).toBe('0%')
  })

  it('giữ nguyên số đã làm tròn từ server, không tự làm tròn lại', () => {
    expect(formatRate(62.5)).toBe('62.5%')
    expect(formatRate(100)).toBe('100%')
  })
})

describe('AdminIntakePanel', () => {
  it('render được ở trạng thái đang tải mà không cần dữ liệu', () => {
    const html = renderToStaticMarkup(React.createElement(AdminIntakePanel))
    expect(html).toContain('Luồng người mới')
  })

  it('có nhãn cho ô chọn số ngày và nút tải lại (a11y)', () => {
    const html = renderToStaticMarkup(React.createElement(AdminIntakePanel))
    expect(html).toContain('aria-label="Số ngày hiển thị"')
    expect(html).toContain('aria-label="Tải lại"')
  })
})
