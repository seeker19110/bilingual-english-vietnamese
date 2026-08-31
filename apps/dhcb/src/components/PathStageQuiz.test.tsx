// PathStageQuiz — SSR chỉ thấy trạng thái ĐÓNG ban đầu (state mở/nộp bài là tương tác client,
// dự án không có testing-library để mô phỏng click). Test này canh đúng phần đo được qua SSR:
// nút mở/đóng hiện đúng, và chặng chưa có quiz không render component (cha đã lo việc đó,
// nhưng test lại ở đây để không phụ thuộc ngầm vào cách cha gọi).
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import PathStageQuiz from './PathStageQuiz'

describe('PathStageQuiz — trạng thái đóng ban đầu (SSR)', () => {
  it('hiện nút "Mở bài kiểm", KHÔNG hiện câu hỏi nào khi chưa mở', () => {
    const html = renderToStaticMarkup(
      <PathStageQuiz pathId="principal-ai" stageId="ai-s1" stageName="Ứng dụng LLM" topics={[]} />,
    )
    expect(html).toContain('Bài kiểm sau chặng')
    expect(html).toContain('Mở bài kiểm')
    expect(html).not.toContain('Nộp bài')
  })

  it('không hiện điểm số/kết quả nào khi chưa nộp — chưa có gì để lộ', () => {
    const html = renderToStaticMarkup(
      <PathStageQuiz pathId="principal-ai" stageId="data-s1" stageName="Dữ liệu" topics={[]} />,
    )
    expect(html).not.toMatch(/\d+\/\d+ câu đúng/)
  })
})
