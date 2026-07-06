import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import WordFormsBlock from './WordFormsBlock'
import { computeForms } from '../lib/wordForms'

// Render kiểm chứng component không lỗi và xuất đúng nội dung mong đợi (không cần trình duyệt thật).
function render(el: React.ReactElement): string {
  return renderToStaticMarkup(el)
}

describe('WordFormsBlock', () => {
  it('động từ bất quy tắc: hiện đủ các dạng + nhãn bất quy tắc', () => {
    const html = render(<WordFormsBlock forms={computeForms('go', 'v')} word="go" isA={true} />)
    expect(html).toContain('Các dạng của từ')
    expect(html).toContain('bất quy tắc')
    expect(html).toContain('goes')
    expect(html).toContain('going')
    expect(html).toContain('went')
    expect(html).toContain('gone')
  })

  it('danh từ không đếm được: hiện chú thích, không có số nhiều', () => {
    const html = render(
      <WordFormsBlock forms={computeForms('advice', 'n')} word="advice" isA={true} />,
    )
    expect(html).toContain('không đếm được')
    expect(html).not.toContain('advices')
  })

  it('entry là dạng biến thể: hiện link về từ gốc', () => {
    const html = render(<WordFormsBlock base="go" word="went" isA={true} />)
    expect(html).toContain('Xem từ gốc')
    expect(html).toContain('go')
  })

  it('danh từ đếm được thường: hiện số nhiều', () => {
    const html = render(<WordFormsBlock forms={computeForms('book', 'n')} word="book" isA={true} />)
    expect(html).toContain('số nhiều')
    expect(html).toContain('books')
  })

  it('không có forms và không base: render rỗng', () => {
    const html = render(<WordFormsBlock word="the" isA={true} />)
    expect(html).toBe('')
  })

  it('chiều B: nhãn tiếng Anh', () => {
    const html = render(
      <WordFormsBlock forms={computeForms('big', 'adj')} word="big" isA={false} />,
    )
    expect(html).toContain('Word forms')
    expect(html).toContain('comparative')
    expect(html).toContain('bigger')
  })
})
