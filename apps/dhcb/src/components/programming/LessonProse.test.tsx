// Cổng hiển thị cho phần lý thuyết: dấu markdown phải BIẾN THÀNH ĐỊNH DẠNG, không được
// hiện nguyên dấu ra màn hình — đó chính là lỗi bản cũ mắc phải (in thẳng `whitespace-pre-line`).
//
// Ca cuối chạy trên dữ liệu THẬT của mọi bài: bắt được ca người soạn viết dấu sao mà bộ đọc
// không hiểu, khiến học viên nhìn thấy `**` giữa câu.
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import LessonProse from './LessonProse'
import { PROGRAMMING_LESSONS } from '@dhcb/subject-programming/lessons'

const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

describe('LessonProse', () => {
  it('**đậm** thành thẻ <strong>, không còn dấu sao trên màn hình', () => {
    const html = renderToStaticMarkup(<LessonProse text="Nhớ **luật mượn** nhé." />)
    expect(html).toContain('<strong')
    expect(text(html)).toBe('Nhớ luật mượn nhé.')
  })

  it('`code` trong dòng thành thẻ <code>', () => {
    const html = renderToStaticMarkup(<LessonProse text="Gọi `max(a, b)` là xong." />)
    expect(html).toContain('<code')
    expect(text(html)).toBe('Gọi max(a, b) là xong.')
  })

  it('gạch đầu dòng thành danh sách thật (<ul>/<li>), không phải chữ chạy dài', () => {
    const html = renderToStaticMarkup(<LessonProse text={'Ba thứ:\n- một\n- hai'} />)
    expect(html).toContain('<ul')
    expect((html.match(/<li/g) ?? []).length).toBe(2)
  })

  it('mục đánh số thành <ol>', () => {
    const html = renderToStaticMarkup(<LessonProse text={'1. đầu\n2. sau'} />)
    expect(html).toContain('<ol')
  })

  it('dòng thụt lề thành khối code <pre>, giữ nguyên ký tự trùng dấu markdown', () => {
    const html = renderToStaticMarkup(
      <LessonProse text={'Ví dụ:\n  tong = gia * 2\n  # ghi chú'} />,
    )
    expect(html).toContain('<pre')
    // Dấu * và # trong code phải còn nguyên, không bị hiểu thành markdown
    expect(html).toContain('gia * 2')
    expect(html).toContain('# ghi chú')
  })

  it.each(PROGRAMMING_LESSONS)('$id — MỌI cặp **đậm** đều thành thẻ <strong>', (lesson) => {
    // Đếm cặp dấu đậm ở các dòng CHỮ THƯỜNG (dòng thụt lề là code, không tính) rồi đối chiếu
    // với số thẻ <strong> render ra. Lệch nghĩa là có dấu sao lọt nguyên ra màn hình.
    const capDam = lesson.theory
      .split('\n')
      .filter((l) => !/^ {2,}\S/.test(l))
      .join('\n')
      .match(/\*\*[^*]+\*\*/g)
    const html = renderToStaticMarkup(<LessonProse text={lesson.theory} />)
    expect((html.match(/<strong/g) ?? []).length).toBe(capDam?.length ?? 0)
  })
})
