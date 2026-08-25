// Golden set của `npm run eval:code-feedback` chỉ chạy TAY (tốn phí API) — nên một fixture
// trỏ sai mã bài sẽ nằm im tới lúc ai đó bỏ tiền chạy eval mới lộ. Test này giữ phần kiểm
// được MIỄN PHÍ: mọi ca đều trỏ bài có thật và dựng được prompt.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getLesson } from '@dhcb/subject-programming/lessons'
import {
  buildCodeFeedbackPrompt,
  MAX_HINT_LEVEL,
  type CodeFeedbackKind,
} from '@dhcb/subject-programming/feedbackPrompt'

interface Fixture {
  id: string
  lessonId: string
  kind: CodeFeedbackKind
  code: string
  note: string
  hintLevel?: number
  errorText?: string
  errorName?: string
}

const dir = path.dirname(fileURLToPath(import.meta.url))
const { cases } = JSON.parse(
  readFileSync(path.join(dir, 'eval-code-feedback-fixtures.json'), 'utf8'),
) as { cases: Fixture[] }

describe('golden set eval:code-feedback', () => {
  it('có ca cho cả 3 kind và mã ca không trùng', () => {
    expect(new Set(cases.map((c) => c.kind))).toEqual(
      new Set(['socratic_hint', 'explain_error', 'review']),
    )
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length)
  })

  it.each(cases.map((c) => [c.id, c] as const))('%s: bài có thật + prompt dựng được', (_id, c) => {
    const lesson = getLesson(c.lessonId)
    expect(lesson, `fixture trỏ bài không tồn tại: ${c.lessonId}`).toBeDefined()
    const p = buildCodeFeedbackPrompt({
      kind: c.kind,
      lesson: lesson!,
      code: c.code,
      hintLevel: c.hintLevel,
      errorText: c.errorText,
    })
    expect(p.system.length).toBeGreaterThan(0)
    expect(p.userMessage).toContain(c.code.split('\n')[0]!)
  })

  it('ca gợi ý luôn khai bậc trong dải 1..MAX_HINT_LEVEL và phủ đủ mọi bậc', () => {
    const levels = cases.filter((c) => c.kind === 'socratic_hint').map((c) => c.hintLevel)
    for (const l of levels) {
      expect(l).toBeGreaterThanOrEqual(1)
      expect(l).toBeLessThanOrEqual(MAX_HINT_LEVEL)
    }
    for (let l = 1; l <= MAX_HINT_LEVEL; l++) expect(levels).toContain(l)
  })

  it('ca giải thích lỗi phải khai errorText + errorName (nếu không, eval không chấm được gì)', () => {
    for (const c of cases.filter((x) => x.kind === 'explain_error')) {
      expect(c.errorText, c.id).toBeTruthy()
      expect(c.errorName, c.id).toBeTruthy()
      expect(c.errorText).toContain(c.errorName!)
    }
  })
})
