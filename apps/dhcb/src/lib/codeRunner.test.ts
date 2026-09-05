// Test cho codeRunner — điểm vào duy nhất chạy code bài học. Đây là LOGIC ĐIỀU PHỐI thuần
// (chọn đúng bộ chạy theo `language`, ghép options) nên mock hết các bộ chạy con để kiểm
// đúng cái gì được gọi với đúng tham số nào, không đụng Worker thật.
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./pythonRunner', () => ({
  runPython: vi.fn(async () => ({ output: 'py', timedOut: false, durationMs: 1 })),
  resetPythonWorker: vi.fn(),
}))
vi.mock('./jsRunner', () => ({
  runJavaScript: vi.fn(async () => ({ output: 'js', timedOut: false, durationMs: 1 })),
  resetJsWorker: vi.fn(),
}))
vi.mock('./sqlRunner', () => ({
  runSql: vi.fn(async () => ({ output: 'sql', timedOut: false, durationMs: 1 })),
  resetSqlWorker: vi.fn(),
}))
vi.mock('./htmlRunner', () => ({
  runHtml: vi.fn(async () => ({ output: 'html', timedOut: false, durationMs: 1 })),
}))
vi.mock('./gitRunner', () => ({
  runGit: vi.fn(async () => ({ output: 'git', timedOut: false, durationMs: 1 })),
}))
vi.mock('./bashRunner', () => ({
  runBash: vi.fn(async () => ({ output: 'bash', timedOut: false, durationMs: 1 })),
}))
vi.mock('./hermesRunner', () => ({
  runHermes: vi.fn(async () => ({ output: 'hermes', timedOut: false, durationMs: 1 })),
}))
vi.mock('./vibeRunner', () => ({
  runVibe: vi.fn(async () => ({ output: 'vibe', timedOut: false, durationMs: 1 })),
}))
vi.mock('./openclawRunner', () => ({
  runOpenclaw: vi.fn(async () => ({ output: 'openclaw', timedOut: false, durationMs: 1 })),
}))
vi.mock('./swiftRunner', () => ({
  runSwift: vi.fn(async () => ({ output: 'swift', timedOut: false, durationMs: 1 })),
}))
vi.mock('./kotlinRunner', () => ({
  runKotlin: vi.fn(async () => ({ output: 'kotlin', timedOut: false, durationMs: 1 })),
}))
vi.mock('./domRunner', () => ({
  runDom: vi.fn(async () => ({ output: 'dom', timedOut: false, durationMs: 1 })),
  resetDomWorker: vi.fn(),
}))
vi.mock('./fetchRunner', () => ({
  runFetchLesson: vi.fn(async () => ({ output: 'fetch', timedOut: false, durationMs: 1 })),
  resetFetchWorker: vi.fn(),
}))
vi.mock('./tsRunner', () => ({
  runTypeScript: vi.fn(async () => ({ output: 'ts', timedOut: false, durationMs: 1 })),
}))

import { runLessonCode, resetLessonRunners, laBaiDongLenh } from './codeRunner'
import { runPython, resetPythonWorker } from './pythonRunner'
import { runJavaScript, resetJsWorker } from './jsRunner'
import { runSql, resetSqlWorker } from './sqlRunner'
import { runHtml } from './htmlRunner'
import { runGit } from './gitRunner'
import { runBash } from './bashRunner'
import { runHermes } from './hermesRunner'
import { runVibe } from './vibeRunner'
import { runOpenclaw } from './openclawRunner'
import { runSwift } from './swiftRunner'
import { runKotlin } from './kotlinRunner'
import { runDom, resetDomWorker } from './domRunner'
import { runFetchLesson, resetFetchWorker } from './fetchRunner'
import { runTypeScript } from './tsRunner'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('laBaiDongLenh', () => {
  it('nhận diện đúng các ngôn ngữ dòng lệnh', () => {
    expect(laBaiDongLenh('git')).toBe(true)
    expect(laBaiDongLenh('bash')).toBe(true)
    expect(laBaiDongLenh('hermes')).toBe(true)
    expect(laBaiDongLenh('vibe')).toBe(true)
    expect(laBaiDongLenh('openclaw')).toBe(true)
  })
  it('ngôn ngữ khác không phải bài dòng lệnh', () => {
    expect(laBaiDongLenh('python')).toBe(false)
    expect(laBaiDongLenh('javascript')).toBe(false)
  })
})

describe('runLessonCode', () => {
  it('javascript: chuyển stdinLines/onOutput, bỏ field undefined', async () => {
    const onOutput = vi.fn()
    await runLessonCode('javascript', 'code', { stdinLines: ['a'], onOutput })
    expect(runJavaScript).toHaveBeenCalledWith('code', { stdinLines: ['a'], onOutput })
  })

  it('javascript: không truyền options thì không có field thừa', async () => {
    await runLessonCode('javascript', 'code')
    expect(runJavaScript).toHaveBeenCalledWith('code', {})
  })

  it('dom: thiếu domHtml trả lỗi ngay, không gọi runDom', async () => {
    const result = await runLessonCode('dom', 'code')
    expect(result.error).toMatch(/thiếu trang HTML/)
    expect(runDom).not.toHaveBeenCalled()
  })

  it('dom: có domHtml thì gọi runDom với html + hanhDong', async () => {
    await runLessonCode('dom', 'code', { domHtml: '<x/>', stdinLines: ['click #a'] })
    expect(runDom).toHaveBeenCalledWith('code', { html: '<x/>', hanhDong: ['click #a'] })
  })

  it('dom: có onOutput thì được chuyển kèm', async () => {
    const onOutput = vi.fn()
    await runLessonCode('dom', 'code', { domHtml: '<x/>', onOutput })
    expect(runDom).toHaveBeenCalledWith('code', { html: '<x/>', onOutput })
  })

  it('fetch: thiếu domHtml trả lỗi ngay', async () => {
    const result = await runLessonCode('fetch', 'code')
    expect(result.error).toMatch(/thiếu trang HTML/)
    expect(runFetchLesson).not.toHaveBeenCalled()
  })

  it('fetch: có domHtml nhưng không có fetchApi thì không gửi field api', async () => {
    await runLessonCode('fetch', 'code', { domHtml: '<x/>' })
    expect(runFetchLesson).toHaveBeenCalledWith('code', { html: '<x/>' })
  })

  it('fetch: có domHtml + fetchApi thì gọi runFetchLesson với api', async () => {
    await runLessonCode('fetch', 'code', { domHtml: '<x/>', fetchApi: { id: 'weather' } as never })
    expect(runFetchLesson).toHaveBeenCalledWith('code', {
      html: '<x/>',
      api: { id: 'weather' },
    })
  })

  it('git: chuyển stdinLines thành lenhChuanBi', async () => {
    await runLessonCode('git', 'git log', { stdinLines: ['git init'] })
    expect(runGit).toHaveBeenCalledWith('git log', { lenhChuanBi: ['git init'] })
  })

  it('git: không có stdinLines thì options rỗng', async () => {
    await runLessonCode('git', 'git log')
    expect(runGit).toHaveBeenCalledWith('git log', {})
  })

  it('bash: chuyển stdinLines thành lenhChuanBi', async () => {
    await runLessonCode('bash', 'ls', { stdinLines: ['mkdir a'] })
    expect(runBash).toHaveBeenCalledWith('ls', { lenhChuanBi: ['mkdir a'] })
  })

  it('bash: không có stdinLines thì options rỗng', async () => {
    await runLessonCode('bash', 'ls')
    expect(runBash).toHaveBeenCalledWith('ls', {})
  })

  it('hermes: chuyển stdinLines thành lenhChuanBi', async () => {
    await runLessonCode('hermes', 'lenh', { stdinLines: ['setup'] })
    expect(runHermes).toHaveBeenCalledWith('lenh', { lenhChuanBi: ['setup'] })
  })

  it('hermes: không có stdinLines thì options rỗng', async () => {
    await runLessonCode('hermes', 'lenh')
    expect(runHermes).toHaveBeenCalledWith('lenh', {})
  })

  it('vibe: chuyển stdinLines thành lenhChuanBi', async () => {
    await runLessonCode('vibe', 'lenh', { stdinLines: ['setup'] })
    expect(runVibe).toHaveBeenCalledWith('lenh', { lenhChuanBi: ['setup'] })
  })

  it('vibe: không có stdinLines thì options rỗng', async () => {
    await runLessonCode('vibe', 'lenh')
    expect(runVibe).toHaveBeenCalledWith('lenh', {})
  })

  it('openclaw: chuyển stdinLines thành lenhChuanBi', async () => {
    await runLessonCode('openclaw', 'lenh', { stdinLines: ['setup'] })
    expect(runOpenclaw).toHaveBeenCalledWith('lenh', { lenhChuanBi: ['setup'] })
  })

  it('openclaw: không có stdinLines thì options rỗng', async () => {
    await runLessonCode('openclaw', 'lenh')
    expect(runOpenclaw).toHaveBeenCalledWith('lenh', {})
  })

  it('swift: gọi thẳng runSwift(code)', async () => {
    await runLessonCode('swift', 'print(1)')
    expect(runSwift).toHaveBeenCalledWith('print(1)')
  })

  it('kotlin: gọi thẳng runKotlin(code)', async () => {
    await runLessonCode('kotlin', 'println(1)')
    expect(runKotlin).toHaveBeenCalledWith('println(1)')
  })

  it('html: gọi thẳng runHtml(code)', async () => {
    await runLessonCode('html', '<h1>x</h1>')
    expect(runHtml).toHaveBeenCalledWith('<h1>x</h1>')
  })

  it('typescript: chuyển stdinLines/onOutput', async () => {
    const onOutput = vi.fn()
    await runLessonCode('typescript', 'const x=1', { stdinLines: ['a'], onOutput })
    expect(runTypeScript).toHaveBeenCalledWith('const x=1', { stdinLines: ['a'], onOutput })
  })

  it('sql: chuyển onOutput/onLoading', async () => {
    const onOutput = vi.fn()
    const onLoading = vi.fn()
    await runLessonCode('sql', 'SELECT 1', { onOutput, onLoading })
    expect(runSql).toHaveBeenCalledWith('SELECT 1', { onOutput, onLoading })
  })

  it('sql: không truyền options thì không có field thừa', async () => {
    await runLessonCode('sql', 'SELECT 1')
    expect(runSql).toHaveBeenCalledWith('SELECT 1', {})
  })

  it('typescript: không truyền options thì không có field thừa', async () => {
    await runLessonCode('typescript', 'const x=1')
    expect(runTypeScript).toHaveBeenCalledWith('const x=1', {})
  })

  it('python: gọi runPython với code gốc (làn thuần không đổi gì)', async () => {
    await runLessonCode('python', 'print(1)', { files: { 'a.py': 'x' } })
    expect(runPython).toHaveBeenCalledWith('print(1)', {
      files: { 'a.py': 'x' },
    })
  })

  it('ngôn ngữ làn Python mở rộng (pytest) vẫn đi qua runPython với code đã nối prelude', async () => {
    await runLessonCode('pytest', 'def test_x(): pass')
    expect(runPython).toHaveBeenCalledTimes(1)
    const [codeSent] = vi.mocked(runPython).mock.calls[0]
    expect(codeSent).toContain('def test_x(): pass')
    expect(codeSent).toContain('dhcb_pytest.chay')
  })

  it('ngôn ngữ không thuộc làn Python đã biết mặc định coi như python thuần', async () => {
    await runLessonCode('mot-ngon-ngu-la' as never, 'code')
    expect(runPython).toHaveBeenCalledWith('code', {})
  })
})

describe('resetLessonRunners', () => {
  it('dọn dẹp tất cả worker của mọi bộ chạy', () => {
    resetLessonRunners()
    expect(resetPythonWorker).toHaveBeenCalledTimes(1)
    expect(resetJsWorker).toHaveBeenCalledTimes(1)
    expect(resetSqlWorker).toHaveBeenCalledTimes(1)
    expect(resetDomWorker).toHaveBeenCalledTimes(1)
    expect(resetFetchWorker).toHaveBeenCalledTimes(1)
  })
})
