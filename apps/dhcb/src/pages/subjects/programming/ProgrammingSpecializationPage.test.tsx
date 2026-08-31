// Cổng cho trang CHI TIẾT MỘT HƯỚNG: lối "Vào học" phải bám dữ liệu thật.
//
// Vì sao cần test này chứ không chỉ tin `stageUnits.test.ts`: cổng kia chứng minh BẢNG dữ
// liệu đúng, không chứng minh TRANG đọc đúng bảng đó. Hai lỗi hay gặp nằm đúng ở khe giữa
// hai thứ — hiện nút ở chặng chưa có bài (dẫn người học tới trang rỗng), và không hiện nút
// ở chặng đã soạn (nội dung viết xong mà không ai vào được).
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { getProgrammingLevel } from '@dhcb/subject-programming/curriculum'
import { unitsOfStage } from '@dhcb/subject-programming/specializations/stageUnits'
import ProgrammingSpecializationPage from './ProgrammingSpecializationPage'

vi.mock('../../../components/Layout', () => ({ default: () => null }))

function render(specId: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/lap-trinh/huong/${specId}`]}>
      <Routes>
        <Route path="/lap-trinh/huong/:specId" element={<ProgrammingSpecializationPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const NHAN_VAO_HOC = 'Vào học chặng này'

describe('ProgrammingSpecializationPage — lối vào bài học', () => {
  // Số chặng đã soạn của hướng `web` còn tăng theo từng đợt nội dung, nên đếm TỪ DỮ LIỆU
  // chứ không ghi cứng — ghi cứng thì mỗi đợt soạn bài mới là cổng này đỏ oan một lần.
  const CHANG_WEB_DA_CO_BAI = ['web-s1', 'web-s2', 'web-s3', 'web-s4'].filter(
    (id) => unitsOfStage(id).length > 0,
  )

  it('hướng đã soạn bài: hiện lối vào ĐÚNG bằng số chặng đã có bài, kèm tên unit thật', () => {
    const html = render('web')
    expect(html.split(NHAN_VAO_HOC).length - 1).toBe(CHANG_WEB_DA_CO_BAI.length)
    const p6 = getProgrammingLevel('p6')!
    for (const stageId of CHANG_WEB_DA_CO_BAI) {
      for (const unitId of unitsOfStage(stageId)) {
        // renderToStaticMarkup escape dấu & thành &amp; — so chuỗi thô sẽ trượt oan.
        const title = p6.units.find((u) => u.id === unitId)!.title.replace(/&/g, '&amp;')
        expect(html, `thiếu tên unit ${unitId} trên trang`).toContain(title)
      }
    }
  })

  it('hướng chưa soạn bài: KHÔNG hiện lối vào nào (không hứa suông)', () => {
    expect(render('game')).not.toContain(NHAN_VAO_HOC)
  })

  it('mã hướng lạ: nói không biết, không đoán bừa một hướng', () => {
    const html = render('khong-co-huong-nay')
    expect(html).toContain('Không có hướng này')
    expect(html).not.toContain(NHAN_VAO_HOC)
  })
})
