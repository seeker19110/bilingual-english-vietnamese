import { describe, it, expect } from 'vitest'
import { buildCefrTagPrompt, parseCefrTagResponse } from './cefrTagging'

describe('buildCefrTagPrompt', () => {
  it('liệt kê đủ số từ, đúng thứ tự, kèm loại từ + nghĩa tiếng Việt', () => {
    const { system, user } = buildCefrTagPrompt([
      { word: 'run', pos: 'v', vi: 'chạy' },
      { word: 'ephemeral', pos: 'adj', vi: 'phù du' },
    ])
    expect(system).toContain('A1, A2, B1, B2, C1, C2')
    expect(user.split('\n')).toEqual([
      '1. run (v) — nghĩa tiếng Việt: chạy',
      '2. ephemeral (adj) — nghĩa tiếng Việt: phù du',
    ])
  })
})

describe('parseCefrTagResponse', () => {
  it('parse mảng JSON hợp lệ', () => {
    const map = parseCefrTagResponse(
      '[{"word":"run","level":"A1"},{"word":"ephemeral","level":"C1"}]',
    )
    expect(map.get('run')).toBe('A1')
    expect(map.get('ephemeral')).toBe('C1')
    expect(map.size).toBe(2)
  })

  it('bóc JSON khỏi markdown code fence dù đã dặn không dùng', () => {
    const map = parseCefrTagResponse('```json\n[{"word":"hello","level":"A1"}]\n```')
    expect(map.get('hello')).toBe('A1')
  })

  it('cắt phần chữ thừa trước/sau mảng JSON', () => {
    const map = parseCefrTagResponse('Đây là kết quả: [{"word":"cat","level":"A1"}] xong rồi.')
    expect(map.get('cat')).toBe('A1')
  })

  it('chuẩn hoá từ về chữ thường + bỏ khoảng trắng thừa', () => {
    const map = parseCefrTagResponse('[{"word":"  Hello ","level":"A2"}]')
    expect(map.get('hello')).toBe('A2')
  })

  it('bỏ qua phần tử có level không hợp lệ, giữ lại phần tử hợp lệ khác', () => {
    const map = parseCefrTagResponse(
      '[{"word":"good","level":"A1"},{"word":"bad","level":"Z9"},{"word":"nolevel"}]',
    )
    expect(map.get('good')).toBe('A1')
    expect(map.has('bad')).toBe(false)
    expect(map.has('nolevel')).toBe(false)
    expect(map.size).toBe(1)
  })

  it('trả map rỗng khi JSON hỏng, không throw', () => {
    expect(() => parseCefrTagResponse('không phải JSON gì cả')).not.toThrow()
    expect(parseCefrTagResponse('không phải JSON gì cả').size).toBe(0)
  })

  it('trả map rỗng khi phản hồi là object thay vì mảng', () => {
    const map = parseCefrTagResponse('{"word":"run","level":"A1"}')
    expect(map.size).toBe(0)
  })

  it('trả map rỗng với chuỗi rỗng', () => {
    expect(parseCefrTagResponse('').size).toBe(0)
  })
})
