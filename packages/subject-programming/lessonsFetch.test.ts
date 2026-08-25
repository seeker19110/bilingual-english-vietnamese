// CỔNG NỘI DUNG cho bài FETCH (PR-L7e) — chạy JavaScript của học viên với fetch GIẢ LẬP
// (dữ liệu thời tiết mẫu, weatherData.ts) trên trang thật, rồi chấm trên cây DOM.
//
// Cổng này và Worker trong trình duyệt gọi CÙNG hàm chayBaiFetch() với CÙNG linkedom + CÙNG
// fetch giả, nên không có khe hở "xanh ở CI, rớt ở người học". Khung xem trang (iframe) dùng
// FETCH_SHIM_JS sinh từ chính taoFetchGia() — test "tự chứa" bên dưới canh cho nguồn đó.
import { describe, expect, it } from 'vitest'
import { PROGRAMMING_LESSONS } from './lessons.js'
import { chayBaiFetch, taoFetchGia, FETCH_SHIM_JS } from './fetchPrelude.js'
import { THOI_TIET_63_TINH } from './weatherData.js'
import { gradeTestCase, allTestsPassed } from './grading.js'
import type { ProgrammingLesson, ProgrammingTestCase } from './lessonTypes.js'

const FETCH_LESSONS = PROGRAMMING_LESSONS.filter((l) => l.language === 'fetch')

const TRANG_THU = `<!doctype html><html lang="vi"><body>
<button id="nut">Tai</button><p id="kq"></p></body></html>`

async function gradeAll(lesson: ProgrammingLesson, js: string, cases: ProgrammingTestCase[]) {
  const out = []
  for (const c of cases) {
    const r = await chayBaiFetch(lesson.domHtml!, js, c.stdinLines)
    out.push(gradeTestCase(c, r.output, r.error))
  }
  return out
}

function describeFailures(results: Awaited<ReturnType<typeof gradeAll>>): string {
  return results
    .filter((r) => !r.passed)
    .map(
      (r) => `[${r.label}] ${r.error ? `LỖI: ${r.error}` : `output thật: ${r.actual ?? '(ẩn)'}`}`,
    )
    .join(' | ')
}

describe('fetch giả lập (taoFetchGia)', () => {
  const f = taoFetchGia(THOI_TIET_63_TINH)

  it('trả đủ 63 tỉnh, đúng hình dạng {ten, nhietDo, troi}', async () => {
    const res = await f('/api/thoi-tiet')
    expect(res.ok).toBe(true)
    const ds = (await res.json()) as { ten: string; nhietDo: number; troi: string }[]
    expect(ds).toHaveLength(63)
    expect(ds[0]).toEqual({ ten: 'An Giang', nhietDo: 18, troi: 'nắng' })
  })

  it('tra theo ?tinh= — chịu được URL-encode, chữ thường và địa chỉ tuyệt đối', async () => {
    for (const url of [
      '/api/thoi-tiet?tinh=' + encodeURIComponent('Hà Nội'),
      '/api/thoi-tiet?tinh=hà nội',
      'https://vi-du.dhcb.vn/api/thoi-tiet?tinh=Hà Nội',
    ]) {
      const res = await f(url)
      expect(res.status, url).toBe(200)
      expect(await res.json()).toEqual({ ten: 'Hà Nội', nhietDo: 35, troi: 'có giông' })
    }
  })

  it('tỉnh không tồn tại → 404 + ok=false, KHÔNG reject (đúng hành vi fetch thật)', async () => {
    const res = await f('/api/thoi-tiet?tinh=Sai Gon')
    expect(res.ok).toBe(false)
    expect(res.status).toBe(404)
    expect(await res.json()).toHaveProperty('error')
  })

  it('địa chỉ ngoài API mẫu → reject TypeError như lỗi mạng thật', async () => {
    await expect(f('https://api.thoitiet.vn/hom-nay')).rejects.toThrow(/khong co mang that/)
  })

  it('học viên sửa object nhận được KHÔNG làm bẩn dữ liệu lần gọi sau', async () => {
    const lan1 = (await (await f('/api/thoi-tiet')).json()) as { nhietDo: number }[]
    lan1[0]!.nhietDo = -999
    const lan2 = (await (await f('/api/thoi-tiet')).json()) as { nhietDo: number }[]
    expect(lan2[0]!.nhietDo).toBe(18)
  })

  it('FETCH_SHIM_JS tự chứa — chạy được trong scope trần không có helper nào của bundler', async () => {
    // Đây là đúng cách iframe dùng shim: một scope mới toanh, chỉ có JavaScript chuẩn.
    const chay = new Function(
      FETCH_SHIM_JS + '\nreturn fetch("/api/thoi-tiet?tinh=" + encodeURIComponent("Đà Nẵng"))',
    ) as () => Promise<{ status: number; json(): Promise<unknown> }>
    const res = await chay()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ten: 'Đà Nẵng', nhietDo: 26, troi: 'mưa rào' })
  })
})

describe('bộ chạy chayBaiFetch', () => {
  it('await hai tầng + render sau click chạy trọn vẹn (chống test rỗng vô nghĩa)', async () => {
    const js = `document.getElementById("nut").addEventListener("click", async () => {
      const res = await fetch("/api/thoi-tiet?tinh=" + encodeURIComponent("Cần Thơ"))
      const t = await res.json()
      document.getElementById("kq").textContent = t.ten + ": " + t.nhietDo
    })`
    const r = await chayBaiFetch(TRANG_THU, js, ['click #nut'])
    expect(r.error).toBeUndefined()
    expect(r.output).toContain('p id="kq" "Cần Thơ: 30"')
  })

  it('chuỗi .then() không await cũng lắng xong trước khi chụp cây DOM', async () => {
    const js = `fetch("/api/thoi-tiet").then((res) => res.json()).then((ds) => {
      document.getElementById("kq").textContent = "so tinh: " + ds.length
    })`
    const r = await chayBaiFetch(TRANG_THU, js, [])
    expect(r.output).toContain('so tinh: 63')
  })

  it('lỗi trong code học viên được trả về, không làm vỡ bộ chấm', async () => {
    const r = await chayBaiFetch(TRANG_THU, 'khongTonTai()', [])
    expect(r.error).toBeTruthy()
    expect(r.output).toBe('')
  })

  it('gọi địa chỉ lạ mà không try/catch → lỗi mạng giả nổi lên như fetch thật', async () => {
    const r = await chayBaiFetch(TRANG_THU, 'await fetch("https://google.com")', [])
    expect(r.error).toContain('khong co mang that')
  })
})

describe('nội dung FETCH môn Lập trình chạy THẬT', () => {
  it('có ít nhất một bài fetch (chặn quên đăng ký vào lessons.ts)', () => {
    expect(FETCH_LESSONS.length).toBeGreaterThan(0)
  })

  it.each(FETCH_LESSONS)('$id — code mẫu đạt HẾT test-case', async (lesson) => {
    const results = await gradeAll(lesson, lesson.make.sampleSolution, lesson.make.testCases)
    expect(allTestsPassed(results), `Bài ${lesson.id}: ${describeFailures(results)}`).toBe(true)
  })

  it.each(FETCH_LESSONS)('$id — ví dụ mẫu chạy không lỗi', async (lesson) => {
    const r = await chayBaiFetch(
      lesson.domHtml!,
      lesson.workedExample.code,
      lesson.workedExample.stdinLines,
    )
    expect(r.error, `Bài ${lesson.id} ví dụ mẫu lỗi: ${r.error}`).toBeUndefined()
    expect(r.output.trim().length).toBeGreaterThan(0)
  })

  it.each(FETCH_LESSONS)('$id — đáp án Predict khớp cây DOM thật', async (lesson) => {
    const r = await chayBaiFetch(lesson.domHtml!, lesson.predict.code, [])
    expect(r.error, `Bài ${lesson.id} code Predict lỗi: ${r.error}`).toBeUndefined()
    const answer = lesson.predict.choices[lesson.predict.answerIndex]!
    expect(
      r.output.includes(answer),
      `Bài ${lesson.id}: đáp án "${answer}" KHÔNG có trong cây thật "${r.output}"`,
    ).toBe(true)
    const saiMaKhop = lesson.predict.choices.filter(
      (c, i) => i !== lesson.predict.answerIndex && r.output.includes(c),
    )
    expect(saiMaKhop, `Bài ${lesson.id}: lựa chọn sai lại khớp cây thật`).toEqual([])
  })
})
