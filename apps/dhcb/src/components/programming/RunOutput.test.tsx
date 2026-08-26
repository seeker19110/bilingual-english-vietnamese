// Cổng cho luật N4 (đặc tả UI/UX §2): chạy code không bao giờ im lặng.
// Ca đáng chặn nhất là ca thứ ba — chạy xong mà chương trình không in gì. Trước PR-UX5 màn
// hình trống trơn ở ca này, không phân biệt được với "chưa chạy lần nào".
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RunOutput from './RunOutput'

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

describe('RunOutput — luật N4', () => {
  it('chưa chạy → không hiện gì (đúng, vì chưa có gì để nói)', () => {
    expect(renderToStaticMarkup(<RunOutput state="idle" output="" />)).toBe('')
  })

  it('đang chạy → nói rõ đang chạy', () => {
    expect(text(renderToStaticMarkup(<RunOutput state="running" output="" />))).toContain(
      'Đang chạy',
    )
  })

  it('chạy xong có output → hiện đúng output', () => {
    const html = renderToStaticMarkup(<RunOutput state="done" output="Xin chào" />)
    expect(text(html)).toContain('Xin chào')
  })

  it('CHẠY XONG MÀ KHÔNG IN GÌ → vẫn phải nói ra, không được để trống', () => {
    const html = renderToStaticMarkup(<RunOutput state="done" output="" />)
    expect(html).not.toBe('')
    expect(text(html)).toContain('không in ra gì')
    // Và phải nói rõ đây KHÔNG phải lỗi — người mới rất dễ tưởng máy hỏng.
    expect(text(html)).toContain('Không phải lỗi')
  })

  it('output toàn khoảng trắng cũng tính là không in gì', () => {
    // Dùng biểu thức chứ không phải chuỗi JSX: trong JSX attribute, "\n" là hai ký tự
    // literal chứ không phải xuống dòng.
    expect(text(renderToStaticMarkup(<RunOutput state="done" output={'   \n  '} />))).toContain(
      'không in ra gì',
    )
  })
})
