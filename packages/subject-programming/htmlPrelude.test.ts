// Gác bộ mô tả cây DOM (PR-L7c): đây là thứ quyết định bài HTML đạt hay rớt, nên phải chắc
// nó bỏ qua cái KHÔNG đáng chấm (khoảng trắng, thứ tự thuộc tính) và giữ cái đáng chấm
// (cấu trúc lồng nhau, chữ, thuộc tính có ý nghĩa).
import { describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import { moTaCayDom, chuanHoaCss } from './htmlPrelude.js'

function ta(html: string): string {
  const win = new Window()
  win.document.write(`<!doctype html><html><body>${html}</body></html>`)
  return moTaCayDom(win.document.body as unknown as Parameters<typeof moTaCayDom>[0])
}

describe('moTaCayDom', () => {
  it('mô tả đúng cấu trúc lồng nhau và chữ', () => {
    expect(ta('<h1>Quan ca phe</h1><ul><li>Ca phe den</li><li>Tra da</li></ul>')).toBe(
      ['body', '  h1 "Quan ca phe"', '  ul', '    li "Ca phe den"', '    li "Tra da"'].join('\n'),
    )
  })

  it('BỎ QUA khoảng trắng và xuống dòng — người mới thụt lề tuỳ ý, đó không phải lỗi', () => {
    const gon = ta('<p>Xin chao</p>')
    const rong = ta('<p>\n\n   Xin   chao   \n</p>')
    expect(rong).toBe(gon)
  })

  it('giữ thuộc tính có ý nghĩa, bỏ thuộc tính trang trí', () => {
    expect(ta('<a href="/menu" class="nut" style="color:red" data-x="1">Xem menu</a>')).toBe(
      'body\n  a class="nut" href="/menu" "Xem menu"',
    )
  })

  it('chữ của thẻ cha không nuốt chữ của thẻ con (và ngược lại)', () => {
    expect(ta('<p>den <b>den</b></p>')).toBe('body\n  p "den"\n    b "den"')
  })

  it('thẻ style được in thành CSS đã chuẩn hoá, không phải chữ thường', () => {
    expect(ta('<style>.menu{display:flex;  gap:12px}</style>')).toBe(
      'body\n  style\n    .menu { display: flex; gap: 12px }',
    )
  })
})

describe('chuanHoaCss', () => {
  it('sắp khai báo theo bảng chữ cái nên thứ tự gõ không ảnh hưởng kết quả chấm', () => {
    expect(chuanHoaCss('.a{gap:8px;display:flex}')).toBe(chuanHoaCss('.a{display:flex;gap:8px;}'))
  })

  it('bỏ chú thích và khoảng trắng thừa', () => {
    expect(chuanHoaCss('/* ghi chu */ .a  {  color : red ; }')).toBe('.a { color: red }')
  })

  it('giữ nhiều luật, mỗi luật một dòng', () => {
    expect(chuanHoaCss('.a{color:red}.b{color:blue}')).toBe('.a { color: red }\n.b { color: blue }')
  })
})
