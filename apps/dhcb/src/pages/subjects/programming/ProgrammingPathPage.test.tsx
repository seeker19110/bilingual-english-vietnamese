// Cổng cho trang LỘ TRÌNH MỤC TIÊU: lối "Vào học" phải bám dữ liệu thật, không hứa suông.
//
// Cùng lý do với ProgrammingSpecializationPage.test.tsx: test dữ liệu (learningPaths.test.ts)
// chứng minh MANIFEST đúng, không chứng minh TRANG đọc đúng manifest. Ba lỗi trang này có thể
// mắc: hiện nút vào chặng chưa có bài, giấu giai đoạn đang soạn, và đoán bừa khi id lộ trình lạ.
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { getLearningPath, pathStageRefs } from '@dhcb/subject-programming/learningPaths/registry'
import { unitsOfStage } from '@dhcb/subject-programming/specializations/stageUnits'
import ProgrammingPathPage from './ProgrammingPathPage'

vi.mock('../../../components/Layout', () => ({ default: () => null }))
vi.mock('../../../context/useAuth', () => ({ useAuth: () => ({ user: null }) }))

function render(pathId: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/lap-trinh/lo-trinh/${pathId}`]}>
      <Routes>
        <Route path="/lap-trinh/lo-trinh/:pathId" element={<ProgrammingPathPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const NHAN_VAO_HOC = 'Vào học chặng này'

describe('ProgrammingPathPage — trang lộ trình mục tiêu', () => {
  it('hiện đủ mọi giai đoạn và mọi chặng của manifest', () => {
    const html = render('principal-ai')
    const path = getLearningPath('principal-ai')!
    for (const phase of path.phases) {
      // renderToStaticMarkup escape &, so chuỗi thô sẽ trượt oan.
      expect(html).toContain(phase.name.replace(/&/g, '&amp;'))
    }
    for (const ref of pathStageRefs(path)) {
      expect(html, `thiếu chặng ${ref.stageId}`).toContain(ref.stageId.toUpperCase())
    }
  })

  it('nút "Vào học" hiện ĐÚNG bằng số chặng đã có bài thật — không hứa suông', () => {
    const html = render('principal-ai')
    const soChangCoBai = pathStageRefs(getLearningPath('principal-ai')!).filter(
      (r) => unitsOfStage(r.stageId).length > 0,
    ).length
    expect(html.split(NHAN_VAO_HOC).length - 1).toBe(soChangCoBai)
  })

  it('giai đoạn stages rỗng phải nói rõ "đang soạn", không giấu', () => {
    // Manifest đợt 1 chốt P5 đang soạn — learningPaths.test.ts canh điều đó ở tầng dữ liệu.
    expect(render('principal-ai')).toContain('đang soạn')
  })

  it('id lộ trình lạ: nói không biết, không đoán bừa', () => {
    const html = render('khong-co-lo-trinh-nay')
    expect(html).toContain('Không có lộ trình này')
    expect(html).not.toContain(NHAN_VAO_HOC)
  })
})
