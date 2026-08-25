// Gác lớp đệm JavaScript dùng chung (PR-L7b1): dữ liệu nhập phải là DỮ LIỆU, không được
// biến thành code; và output console phải gom giống nhau ở mọi nơi chạy.
import { describe, expect, it } from 'vitest'
import vm from 'node:vm'
import { wrapJavaScript, formatConsoleArgs, JS_INPUT_EXHAUSTED } from './jsPrelude.js'

function run(code: string, stdinLines: string[]): string[] {
  const out: string[] = []
  const ctx = vm.createContext({
    console: { log: (...a: unknown[]) => out.push(formatConsoleArgs(a)) },
  })
  vm.runInContext(wrapJavaScript(code, stdinLines), ctx, { timeout: 2_000 })
  return out
}

describe('wrapJavaScript', () => {
  it('input() đọc tuần tự đúng thứ tự các dòng', () => {
    expect(run('console.log(input() + "-" + input())', ['a', 'b'])).toEqual(['a', 'b', 'a-b'])
  })

  it('dòng nhập chứa ký tự nguy hiểm vẫn là DỮ LIỆU, không chạy thành code', () => {
    // Nếu nhúng dữ liệu sai cách, dòng này sẽ đóng chuỗi và chạy lệnh chèn vào.
    const doc = '"); console.log("BI CHEN"); ("'
    const out = run('const x = input(); console.log("nhan duoc: " + x);', [doc])
    // Dòng echo của input() có CHỨA chuỗi đó dưới dạng chữ — cái phải không tồn tại là một
    // dòng output DO lệnh chèn sinh ra, tức đúng bằng 'BI CHEN'.
    expect(out).not.toContain('BI CHEN')
    expect(out).toContain(`nhan duoc: ${doc}`)
  })

  it('hết dòng nhập thì ném lỗi có hướng dẫn sửa', () => {
    expect(() => run('input()', [])).toThrow(JS_INPUT_EXHAUSTED)
  })
})

describe('formatConsoleArgs', () => {
  it('nối nhiều đối số bằng khoảng trắng, giữ nguyên chuỗi', () => {
    expect(formatConsoleArgs(['a', 1, true])).toBe('a 1 true')
  })

  it('in được object/mảng và undefined mà không vỡ', () => {
    expect(formatConsoleArgs([{ a: 1 }])).toBe('{"a":1}')
    expect(formatConsoleArgs([[1, 2]])).toBe('[1,2]')
    expect(formatConsoleArgs([undefined])).toBe('undefined')
  })

  it('object tự tham chiếu không làm vỡ bộ gom output', () => {
    const vong: Record<string, unknown> = {}
    vong.self = vong
    expect(() => formatConsoleArgs([vong])).not.toThrow()
  })
})
