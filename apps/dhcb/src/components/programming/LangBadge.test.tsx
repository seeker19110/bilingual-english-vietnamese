// Cổng cho LangBadge (PR-UX1). Hai bất biến đáng chặn CI:
//  1. Mỗi giá trị `language` trong schema đều có nhãn — thêm ngôn ngữ mà quên nhãn thì test đỏ
//     ngay, thay vì lặng lẽ render một huy hiệu trống trên giao diện thật.
//  2. Bài chạy trên bộ mô phỏng phải TỰ NÓI RA điều đó (luật "không giả vờ" của môn).
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LESSON_LANGUAGES } from '@dhcb/subject-programming/lessonTypes'
import LangBadge from './LangBadge'

// Danh sách ngôn ngữ lấy TỪ SCHEMA, không chép tay — thêm ngôn ngữ mới là test tự phủ tới.
const LANGS = LESSON_LANGUAGES

// Làn chạy trên module giả lập nằm sẵn trong máy, không có gói tin nào rời trình duyệt.
const SIMULATED = [
  'pytest',
  'httpsim',
  'apisim',
  'fetch',
  'git',
  'bash',
  'hermes',
  'openclaw',
  'swift',
  'kotlin',
]

describe('LangBadge', () => {
  it('mọi ngôn ngữ trong schema đều render ra nhãn chữ, không có huy hiệu trống', () => {
    expect(LANGS.length).toBeGreaterThan(0)
    for (const lang of LANGS) {
      const html = renderToStaticMarkup(<LangBadge language={lang} />)
      // Bỏ thẻ đi, còn lại phải là chữ đọc được — chấm màu không tính (aria-hidden).
      const text = html.replace(/<[^>]*>/g, '').trim()
      expect(text.length, `ngôn ngữ '${lang}' chưa có nhãn`).toBeGreaterThan(1)
    }
  })

  it('làn mô phỏng tự khai "mô phỏng"; làn chạy thật thì không', () => {
    for (const lang of LANGS) {
      const text = renderToStaticMarkup(<LangBadge language={lang} />).replace(/<[^>]*>/g, '')
      expect(text.includes('mô phỏng'), `'${lang}' khai sai trạng thái mô phỏng`).toBe(
        SIMULATED.includes(lang),
      )
    }
  })

  it('chấm màu bị ẩn với trình đọc màn hình — màu không phải kênh thông tin duy nhất', () => {
    const html = renderToStaticMarkup(<LangBadge language="python" />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('Python')
  })
})
