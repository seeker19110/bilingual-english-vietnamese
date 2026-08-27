// swiftRunner — lớp mỏng nối bộ chạy Swift (swiftSim) vào khuôn CodeRunResult của trang bài
// học (PR-M3). Engine đã có cổng riêng (conformance.test.ts); ở đây kiểm ĐÚNG phần lớp mỏng
// và ĐƯỜNG ĐI qua điểm vào chung — bài học PR-M2 dạy rằng cổng engine xanh không chứng minh
// giao diện gọi đúng bộ chạy.
import { describe, expect, it } from 'vitest'
import { runSwift } from './swiftRunner'
import { runLessonCode } from './codeRunner'

describe('runSwift', () => {
  it('chạy chương trình Swift và trả output kèm dòng tự khai', async () => {
    const r = await runSwift('let ten = "Lan"\nprint("Chao \\(ten)")')
    expect(r.output).toContain('[GIA LAP]')
    expect(r.output).toContain('Chao Lan')
    expect(r.error).toBeUndefined()
    expect(r.timedOut).toBe(false)
  })

  it('lỗi giữ NGUYÊN thông điệp dạy được kèm số dòng (không nuốt mất)', async () => {
    const r = await runSwift('let a = 5\na = 6')
    expect(r.error).toContain('dong 2')
    expect(r.error).toContain('let')
    expect(r.output).toContain('dong 2')
  })

  it('mở gói nil bằng "!" thì nói rõ đây là lỗi crash kinh điển', async () => {
    const r = await runSwift('let x: Int? = nil\nprint(x!)')
    expect(r.error).toContain('nil')
    expect(r.error).toContain('if let')
  })

  it('điểm vào chung runLessonCode chọn ĐÚNG bộ chạy cho language "swift"', async () => {
    const r = await runLessonCode('swift', 'print(1 + 1)')
    expect(r.output).toContain('[GIA LAP]')
    expect(r.output).toContain('2')
  })

  it('mỗi lượt chạy là môi trường mới — không dính biến của lượt trước', async () => {
    await runSwift('let bimat = 42')
    const r = await runSwift('print(bimat)')
    expect(r.error).toContain('Chua khai bao')
  })
})
