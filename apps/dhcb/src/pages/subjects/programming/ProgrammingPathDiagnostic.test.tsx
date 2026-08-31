// Cổng cho trang CHẨN ĐOÁN: luật số 1 phải giữ TRÊN GIAO DIỆN, không chỉ trong hàm suggestEntry.
//
// Hai điều bắt buộc kiểm ở tầng trang (learningPaths test đã canh suggestEntry đúng, nhưng
// không canh trang có LỠ hiện điểm số hay không): không có chuỗi phần trăm/điểm số nào lọt ra
// màn hình, và mọi câu hỏi trong bank đều được render (không rớt câu khi soạn thêm sau này).
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PRINCIPAL_AI_DIAGNOSTIC } from '@dhcb/subject-programming/learningPaths/diagnostic'
import ProgrammingPathDiagnostic from './ProgrammingPathDiagnostic'

vi.mock('../../../components/Layout', () => ({ default: () => null }))
vi.mock('../../../context/useAuth', () => ({ useAuth: () => ({ user: null }) }))

/** renderToStaticMarkup escape HTML — so chuỗi thô sẽ trượt oan ở &, <, >. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function render(pathId: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/lap-trinh/lo-trinh/${pathId}/chan-doan`]}>
      <Routes>
        <Route
          path="/lap-trinh/lo-trinh/:pathId/chan-doan"
          element={<ProgrammingPathDiagnostic />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProgrammingPathDiagnostic — chẩn đoán chọn điểm vào', () => {
  it('hiện đủ mọi câu hỏi của bank, không rớt câu', () => {
    const html = render('principal-ai')
    for (const q of PRINCIPAL_AI_DIAGNOSTIC) {
      expect(html, `thiếu câu ${q.id}`).toContain(esc(q.prompt))
      for (const choice of q.choices) {
        expect(html).toContain(esc(choice))
      }
    }
  })

  it('KHÔNG hiện điểm số/phần trăm nào — luật số 1: công cụ chọn việc, không chấm điểm', () => {
    const html = render('principal-ai')
    expect(html).not.toMatch(/\d+\s*%/)
    expect(html).not.toMatch(/\d+\s*\/\s*\d+\s*(điểm|câu đúng)/)
  })

  it('id lộ trình lạ: nói không biết, không đoán bừa', () => {
    expect(render('khong-co-lo-trinh-nay')).toContain('Không có lộ trình này')
  })
})
