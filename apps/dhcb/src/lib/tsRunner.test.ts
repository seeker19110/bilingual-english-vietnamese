// tsRunner — kiểm HỢP ĐỒNG phía client của làn TypeScript (PR-L16).
//
// Cổng nội dung (packages/subject-programming/lessonsTs.test.ts) đã chạy tsc THẬT, nên ở đây
// không kiểm lại việc biên dịch. Thứ cần canh là phần chỉ tồn tại ở client và có thể hỏng
// lặng lẽ: còn lỗi kiểu thì TUYỆT ĐỐI KHÔNG chạy code (nếu chạy, học viên sẽ thấy chương
// trình vẫn in kết quả dù trình biên dịch đã từ chối — hỏng đúng bài học của unit U10), và
// lỗi mạng phải thành câu tiếng Việt chứ không phải một Promise bị reject.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runTypeScript, resetTsCache } from './tsRunner'
import { TIEU_DE_LOI, TIEU_DE_CHAY } from '@dhcb/subject-programming/tsPrelude'

const runJavaScript = vi.hoisted(() => vi.fn())
vi.mock('./jsRunner', () => ({ runJavaScript }))

function traLoi(body: unknown, ok = true, status = 200) {
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    json: async () => body,
  } as unknown as Response)
}

describe('runTypeScript', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    runJavaScript.mockReset()
    resetTsCache()
  })

  it('còn lỗi kiểu thì KHÔNG chạy code, và in nguyên danh sách lỗi', async () => {
    traLoi({ loi: ['Dong 1: TS2322 Type ...'], js: 'console.log("khong duoc chay")' })

    const r = await runTypeScript('const a: number = "x"')

    expect(runJavaScript).not.toHaveBeenCalled()
    expect(r.output).toContain(TIEU_DE_LOI)
    expect(r.output).toContain('TS2322')
    expect(r.error).toBeUndefined() // lỗi KIỂU không phải lỗi hệ thống
  })

  it('sạch kiểu thì chạy JavaScript sinh ra và gắn đúng tiêu đề', async () => {
    traLoi({ loi: [], js: 'console.log("chao")' })
    runJavaScript.mockResolvedValueOnce({
      output: 'chao',
      timedOut: false,
      durationMs: 3,
    })

    const r = await runTypeScript('console.log("chao")')

    expect(runJavaScript).toHaveBeenCalledWith('console.log("chao")', {})
    expect(r.output).toBe(`${TIEU_DE_CHAY}\nchao`)
  })

  it('mất mạng thì trả câu tiếng Việt, không ném lỗi ra ngoài', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('offline'))

    const r = await runTypeScript('const a = 1')

    expect(r.error).toContain('mất mạng')
    expect(runJavaScript).not.toHaveBeenCalled()
  })

  it('chấm nhiều ca trên CÙNG code chỉ gọi server MỘT lần (nhớ kết quả kiểm kiểu)', async () => {
    const goi = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ loi: [], js: 'x' }) } as Response)
    runJavaScript.mockResolvedValue({ output: 'ra', timedOut: false, durationMs: 1 })

    await runTypeScript('const a = 1')
    await runTypeScript('const a = 1')

    expect(goi).toHaveBeenCalledTimes(1)
    expect(runJavaScript).toHaveBeenCalledTimes(2) // vẫn chạy lại từng ca
  })

  it('code ĐỔI thì phải kiểm kiểu lại, không dùng kết quả cũ', async () => {
    const goi = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => ({ loi: [], js: 'x' }) } as Response)
    runJavaScript.mockResolvedValue({ output: 'ra', timedOut: false, durationMs: 1 })

    await runTypeScript('const a = 1')
    await runTypeScript('const a: string = 1')

    expect(goi).toHaveBeenCalledTimes(2)
  })

  it('server từ chối (429…) thì hiện đúng thông điệp của server', async () => {
    traLoi({ error: 'Quá nhiều yêu cầu — thử lại sau 1 phút' }, false, 429)

    const r = await runTypeScript('const a = 1')

    expect(r.error).toBe('Quá nhiều yêu cầu — thử lại sau 1 phút')
  })
})
