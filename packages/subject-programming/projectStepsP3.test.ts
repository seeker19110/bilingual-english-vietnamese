// CỔNG NỘI DUNG cho DỰ ÁN TRỤC chặng P3 (PR-L8) — chạy code mẫu của CẢ 5 BƯỚC bằng ĐÚNG
// engine mà học viên gặp, rồi chấm bằng đúng grading.ts.
//
// Chặng này khác P1/P2 ở chỗ mỗi bước một ngôn ngữ (html → html/CSS → dom → sql → fetch), nên
// cổng phải gọi 4 bộ chạy khác nhau — mỗi bộ tái dùng nguyên xi của mạch bài học tương ứng,
// không đẻ engine mới. Bước nào dùng bộ nào là do `language` của bước quyết định (getStepLanguage),
// giống hệt cách trang dự án chọn bộ chạy — nên cổng và sản phẩm không thể lệch nhau.
import { describe, expect, it } from 'vitest'
import { Window } from 'happy-dom'
import initSqlJs from 'sql.js'
import { createRequire } from 'node:module'
import {
  P3_PROJECT_STEPS,
  PROJECT_STAGES,
  ProjectStepSchema,
  getStepLanguage,
  getStepFiles,
} from './projectSteps.js'
import { PROGRAMMING_LEVELS } from './curriculum.js'
import { moTaCayDom, type ElementLike } from './htmlPrelude.js'
import { chayBaiDom } from './domPrelude.js'
import { chayBaiFetch } from './fetchPrelude.js'
import { SQL_SEED } from './sqlDataset.js'
import { formatSqlResults, type SqlResultTable } from './sqlPrelude.js'
import { MENU_CUA_HANG } from './shopData.js'
import { gradeTestCase, allTestsPassed, type TestCaseResult } from './grading.js'
import type { ProjectStep } from './projectSteps.js'

const P3_UNIT_IDS = new Set(PROGRAMMING_LEVELS.find((l) => l.id === 'p3')!.units.map((u) => u.id))

const require = createRequire(import.meta.url)
const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
const SQL = await initSqlJs({ locateFile: () => wasmPath })

interface RunOutcome {
  output: string
  error?: string
}

function runHtml(html: string): RunOutcome {
  const win = new Window()
  try {
    win.document.write(html)
    return { output: moTaCayDom(win.document.documentElement as unknown as ElementLike) }
  } catch (err) {
    return { output: '', error: (err as Error).message }
  } finally {
    win.close()
  }
}

function runSql(sql: string): RunOutcome {
  const db = new SQL.Database()
  try {
    db.run(SQL_SEED)
    return { output: formatSqlResults(db.exec(sql) as SqlResultTable[]) }
  } catch (err) {
    return { output: '', error: (err as Error).message }
  } finally {
    db.close()
  }
}

/** Chạy MỘT bước bằng bộ chạy ứng với `language` của nó — bảng rẽ nhánh duy nhất của cổng. */
async function runStep(step: ProjectStep, code: string, hanhDong: string[]): Promise<RunOutcome> {
  const lang = getStepLanguage(step)
  if (lang === 'html') return runHtml(code)
  if (lang === 'sql') return runSql(code)
  if (lang === 'dom') return chayBaiDom(step.domHtml!, code, hanhDong)
  if (lang === 'fetch') return chayBaiFetch(step.domHtml!, code, hanhDong, 'cua-hang')
  throw new Error(`Bước ${step.id}: chặng P3 không dùng ngôn ngữ '${lang}'`)
}

async function gradeAll(step: ProjectStep, code: string): Promise<TestCaseResult[]> {
  const out: TestCaseResult[] = []
  for (const c of step.checks) {
    const r = await runStep(step, code, c.stdinLines)
    out.push(gradeTestCase(c, r.output, r.error))
  }
  return out
}

function describeFailures(results: TestCaseResult[]): string {
  return results
    .filter((r) => !r.passed)
    .map(
      (r) => `[${r.label}] ${r.error ? `LỖI: ${r.error}` : `output thật: ${r.actual ?? '(ẩn)'}`}`,
    )
    .join(' | ')
}

describe('bất biến dữ liệu chặng P3', () => {
  it('đúng khuôn schema, id tuần tự p3-s1..s5, unit tồn tại, bước cuối là milestone', () => {
    expect(P3_PROJECT_STEPS.map((s) => s.id)).toEqual(['p3-s1', 'p3-s2', 'p3-s3', 'p3-s4', 'p3-s5'])
    for (const step of P3_PROJECT_STEPS) {
      expect(ProjectStepSchema.safeParse(step).success, `${step.id} sai khuôn`).toBe(true)
      expect(P3_UNIT_IDS.has(step.unitId), `${step.id} trỏ unit không có thật`).toBe(true)
      // Luôn có ca HIỆN để học viên đối chiếu được khi rớt (ca ẩn không lộ output).
      expect(step.checks.some((c) => !c.hidden)).toBe(true)
    }
    expect(P3_PROJECT_STEPS.at(-1)!.isMilestone).toBe(true)
    expect(P3_PROJECT_STEPS.slice(0, -1).every((s) => !s.isMilestone)).toBe(true)
  })

  it('chặng P3 đã gắn vào PROJECT_STAGES (chặn quên đăng ký)', () => {
    const p3 = PROJECT_STAGES.find((s) => s.level === 'p3')
    expect(p3?.steps).toBe(P3_PROJECT_STEPS)
  })

  it('bước dom/fetch có trang đi kèm; mỗi bước khai báo đúng một file làm việc', () => {
    for (const step of P3_PROJECT_STEPS) {
      const lang = getStepLanguage(step)
      expect(step.domHtml !== undefined, `${step.id}`).toBe(lang === 'dom' || lang === 'fetch')
      expect(getStepFiles(step)).toHaveLength(1)
    }
  })

  it('dự án dùng ĐÚNG bộ món của các chặng trước (một sản phẩm tiến hoá, không phải đề rời)', () => {
    for (const [ten, gia] of [
      ['tra da', 5000],
      ['nuoc cam', 15000],
      ['sua dau', 10000],
    ] as const) {
      expect(MENU_CUA_HANG.find((m) => m.ten === ten)?.gia).toBe(gia)
    }
  })
})

describe('code mẫu chặng P3 chạy THẬT và đạt hết milestone check', () => {
  it.each(P3_PROJECT_STEPS)('$id — $title', async (step) => {
    const results = await gradeAll(step, step.referenceCode)
    expect(allTestsPassed(results), `Bước ${step.id}: ${describeFailures(results)}`).toBe(true)
  })
})

describe('milestone check thật sự BẮT LỖI (chống test dễ dãi)', () => {
  it('p3-s1: thiếu meta charset thì rớt', async () => {
    const thieu = P3_PROJECT_STEPS[0]!.referenceCode.replace('<meta charset="utf-8" />', '')
    expect(allTestsPassed(await gradeAll(P3_PROJECT_STEPS[0]!, thieu))).toBe(false)
  })

  it('p3-s2: bỏ luật vùng chạm 44px thì rớt', async () => {
    const thieu = P3_PROJECT_STEPS[1]!.referenceCode.replace(
      'a { display: inline-block; min-height: 44px; }',
      '',
    )
    expect(allTestsPassed(await gradeAll(P3_PROJECT_STEPS[1]!, thieu))).toBe(false)
  })

  it('p3-s3: giỏ KHÔNG cộng dồn (tổng đặt lại mỗi lần bấm) thì rớt', async () => {
    const sai = P3_PROJECT_STEPS[2]!.referenceCode.replace(
      'tong = tong + thanhTien',
      'tong = thanhTien',
    )
    expect(allTestsPassed(await gradeAll(P3_PROJECT_STEPS[2]!, sai))).toBe(false)
  })

  it('p3-s4: quên GROUP BY thì rớt', async () => {
    const sai = P3_PROJECT_STEPS[3]!.referenceCode.replace('GROUP BY m.ten', '')
    expect(allTestsPassed(await gradeAll(P3_PROJECT_STEPS[3]!, sai))).toBe(false)
  })

  it('p3-s5: gõ cứng bảng giá 3 món cũ thay vì lấy từ API thì rớt', async () => {
    const sai = P3_PROJECT_STEPS[4]!.referenceCode
      .replace(
        'let BANG_GIA = {}',
        'let BANG_GIA = { "tra da": 5000, "nuoc cam": 15000, "sua dau": 10000 }',
      )
      .replace('BANG_GIA[mon.ten] = mon.gia', '')
    expect(allTestsPassed(await gradeAll(P3_PROJECT_STEPS[4]!, sai))).toBe(false)
  })
})
