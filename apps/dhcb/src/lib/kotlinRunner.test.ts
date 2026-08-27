// kotlinRunner — lớp mỏng nối bộ chạy Kotlin (kotlinSim) vào khuôn CodeRunResult của trang bài
// học (PR-M7). Engine đã có cổng riêng (conformance.test.ts); ở đây kiểm ĐÚNG phần lớp mỏng và
// ĐƯỜNG ĐI qua điểm vào chung — bài học PR-M2 dạy rằng cổng engine xanh không chứng minh giao
// diện gọi đúng bộ chạy.
import { describe, expect, it } from 'vitest'
import { runKotlin } from './kotlinRunner'
import { runLessonCode } from './codeRunner'

describe('runKotlin', () => {
  it('chạy chương trình Kotlin và trả output kèm dòng tự khai', async () => {
    const r = await runKotlin('val ten = "Lan"\nprintln("Chao $ten")')
    expect(r.output).toContain('[GIA LAP]')
    expect(r.output).toContain('Chao Lan')
    expect(r.error).toBeUndefined()
    expect(r.timedOut).toBe(false)
  })

  it('lỗi giữ NGUYÊN thông điệp dạy được kèm số dòng (không nuốt mất)', async () => {
    const r = await runKotlin('val a = 5\na = 6')
    expect(r.error).toContain('dong 2')
    expect(r.error).toContain('val')
    expect(r.output).toContain('dong 2')
  })

  it('dùng "!!" trên null thì nói rõ đây là NullPointerException kinh điển', async () => {
    const r = await runKotlin('val x: Int? = null\nprintln(x!!)')
    expect(r.error).toContain('!!')
    expect(r.error).toContain('?.')
  })

  it('dùng thẳng dấu chấm trên biến nullable báo lỗi kèm BA cách sửa', async () => {
    const r = await runKotlin('val s: String? = "hi"\nprintln(s.length)')
    expect(r.error).toContain('?.')
    expect(r.error).toContain('?:')
    expect(r.error).toContain('!!')
  })

  it('đi qua điểm vào chung runLessonCode với language="kotlin"', async () => {
    const r = await runLessonCode('kotlin', 'println(1 + 1)')
    expect(r.output).toContain('2')
    expect(r.error).toBeUndefined()
  })
})
