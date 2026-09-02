import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TocRail, type TocItem } from './TocRail.js'

const ITEMS: TocItem[] = [
  { id: 'chuong-c1', label: 'Python nhập môn', hint: '5 bài', done: true },
  { id: 'chuong-c2', label: 'Cấu trúc dữ liệu', hint: '4 bài' },
]

describe('TocRail', () => {
  it('không vẽ gì khi danh sách rỗng (trang ngắn không cần mục lục)', () => {
    expect(renderToStaticMarkup(<TocRail items={[]} />)).toBe('')
  })

  it('mỗi mục là liên kết NEO tới đúng id của phần tương ứng trong trang', () => {
    const html = renderToStaticMarkup(<TocRail items={ITEMS} />)
    expect(html).toContain('href="#chuong-c1"')
    expect(html).toContain('href="#chuong-c2"')
    expect(html).toContain('Python nhập môn')
    expect(html).toContain('Cấu trúc dữ liệu')
  })

  it('chỉ mục ĐANG XEM mang aria-current — trình đọc màn hình biết đang ở đâu', () => {
    const html = renderToStaticMarkup(<TocRail items={ITEMS} activeId="chuong-c2" />)
    expect(html.match(/aria-current="true"/g)).toHaveLength(1)
    // Đúng mục thứ hai được đánh dấu, không phải mục đầu.
    const posActive = html.indexOf('aria-current="true"')
    expect(posActive).toBeGreaterThan(html.indexOf('Python nhập môn'))
  })

  it('không truyền activeId thì không mục nào bị đánh dấu đang xem', () => {
    expect(renderToStaticMarkup(<TocRail items={ITEMS} />)).not.toContain('aria-current')
  })

  it('mục đã hoàn thành hiện ✓ thay số thứ tự, mục chưa xong giữ số', () => {
    const html = renderToStaticMarkup(<TocRail items={ITEMS} />)
    expect(html).toContain('✓')
    // Mục 1 xong → không còn số "1"; mục 2 chưa xong → vẫn mang số thứ tự của nó.
    expect(html).toContain('>2<')
  })

  it('chữ phụ (số bài) được vẽ, bỏ trống thì không sinh thẻ thừa', () => {
    expect(renderToStaticMarkup(<TocRail items={ITEMS} />)).toContain('5 bài')
    const khongHint = renderToStaticMarkup(<TocRail items={[{ id: 'a', label: 'Chương A' }]} />)
    expect(khongHint).toContain('Chương A')
    expect(khongHint).not.toContain('bài')
  })

  it('tiêu đề mục lục dùng làm nhãn vùng cho trình đọc màn hình', () => {
    const html = renderToStaticMarkup(<TocRail items={ITEMS} title="Mục lục 10 unit" />)
    expect(html).toContain('aria-label="Mục lục 10 unit"')
  })
})
