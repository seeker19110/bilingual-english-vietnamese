// Cổng cho trang mô tả khoá học (PR-UX3) — khoá tiêu chí A11 của đặc tả UI/UX:
// MỌI CON SỐ trên trang phải sinh từ dữ liệu giáo trình, không viết tay. Hôm nay viết tay
// "60 bài" thì đúng; tháng sau soạn thêm bài là trang tự nói dối mà không ai hay.
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { PROGRAMMING_LESSONS } from '@dhcb/subject-programming/lessons'
import { PROGRAMMING_LEVELS } from '@dhcb/subject-programming/curriculum'
import { PROJECT_STAGES } from '@dhcb/subject-programming/projectSteps'
import ProgrammingAbout from './ProgrammingAbout'

// Trang đọc `useAuth` — render tĩnh không có AuthProvider nên mock về "chưa đăng nhập",
// cũng chính là ca công khai mà trang này sinh ra để phục vụ.
import { vi } from 'vitest'
vi.mock('../../../context/useAuth', () => ({ useAuth: () => ({ user: null, loading: false }) }))
// Layout kéo theo LangProvider/theme — không phải thứ test này quan tâm, thay bằng thẻ rỗng.
vi.mock('../../../components/Layout', () => ({ default: () => null }))

function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ProgrammingAbout />
    </MemoryRouter>,
  )
}

describe('ProgrammingAbout', () => {
  it('số bài và số bậc hiện trên trang khớp dữ liệu giáo trình thật', () => {
    const html = render()
    expect(html).toContain(`${PROGRAMMING_LESSONS.length} bài`)
    expect(html).toContain(`${PROGRAMMING_LEVELS.length} bậc`)
    expect(html).toContain(`${PROJECT_STAGES.length} chặng dự án`)
  })

  it('tổng thời lượng cộng từ duration của các bậc, không phải con số gõ tay', () => {
    const tong = PROGRAMMING_LEVELS.reduce((t, bac) => {
      const so = bac.duration.match(/\d+/g)
      return t + (so ? Number(so[so.length - 1]) : 0)
    }, 0)
    expect(render()).toContain(`khoảng ${tong} tuần`)
  })

  it('khối "trạng thái thật" bắt buộc có mặt — luật N1, không được lặng lẽ gỡ đi', () => {
    const html = render()
    expect(html).toContain('Trạng thái thật hôm nay')
    expect(html).toContain('chưa có ai đi hết môn này')
  })

  it('nói thẳng cả phần KHÔNG dạy, không chỉ phần bán được', () => {
    const html = render()
    expect(html).toContain('KHÔNG có')
    expect(html).toContain('kinh nghiệm làm việc nhóm')
  })
})
