// lessonsLazy — canh file SINH TỰ ĐỘNG không lệch registry.
//
// Vì sao cần: `lessonsLazy.ts` do scripts/gen-lesson-index.ts sinh ra và được commit. Ai thêm
// bài học mà quên chạy lại `npm run gen:lesson-index` thì app liệt kê THIẾU bài (chỉ mục cũ)
// trong khi server vẫn có — hỏng im lặng. Ba bất biến dưới đây bắt đúng ca đó.
import { describe, expect, it, beforeEach } from 'vitest'
import { PROGRAMMING_LESSONS, getLesson, getLessonsByUnit } from './lessons.js'
import { buildLessonIndex } from './lessonIndex.js'
import { LESSON_INDEX, UNIT_LOADERS } from './lessonsLazy.js'
import {
  getLessonSummary,
  getUnitSummaries,
  loadLesson,
  loadLessons,
  loadUnitLessons,
  _resetLessonCacheForTests,
} from './lessonsLoader.js'

const GOI_Y = 'Chỉ mục lệch registry — chạy: npm run gen:lesson-index'

describe('lessonsLazy (file sinh tự động)', () => {
  beforeEach(() => _resetLessonCacheForTests())

  it('LESSON_INDEX khớp CHÍNH XÁC registry (cả thứ tự)', () => {
    expect(LESSON_INDEX, GOI_Y).toEqual(buildLessonIndex(PROGRAMMING_LESSONS))
  })

  it('mọi unit trong registry đều có loader, và loader trả đúng bài của unit đó', async () => {
    const unitIds = [...new Set(PROGRAMMING_LESSONS.map((l) => l.unitId))]
    expect(Object.keys(UNIT_LOADERS).sort(), GOI_Y).toEqual([...unitIds].sort())
    for (const unitId of unitIds) {
      const loaded = await loadUnitLessons(unitId)
      expect(loaded, `${GOI_Y} (unit ${unitId})`).toEqual(getLessonsByUnit(unitId))
    }
  })

  it('gộp mọi loader lại được đúng tập bài của registry (không thừa, không thiếu)', async () => {
    const all = (await Promise.all(Object.values(UNIT_LOADERS).map((f) => f()))).flat()
    expect(all.map((l) => l.id).sort(), GOI_Y).toEqual(PROGRAMMING_LESSONS.map((l) => l.id).sort())
  })
})

describe('lessonsLoader', () => {
  beforeEach(() => _resetLessonCacheForTests())

  it('tra tóm tắt đồng bộ: đúng bài, đúng unit, đúng số thẻ SRS', () => {
    const mau = PROGRAMMING_LESSONS[0]!
    expect(getLessonSummary(mau.id)).toEqual({
      id: mau.id,
      unitId: mau.unitId,
      title: mau.title,
      language: mau.language,
      srsCardCount: mau.srsCards?.length ?? 0,
    })
    expect(getUnitSummaries(mau.unitId).map((s) => s.id)).toEqual(
      getLessonsByUnit(mau.unitId).map((l) => l.id),
    )
    expect(getLessonSummary('khong-co-bai-nay')).toBeUndefined()
    expect(getUnitSummaries('khong-co-unit-nay')).toEqual([])
  })

  it('loadLesson nạp đủ nội dung, giống hệt bản đồng bộ', async () => {
    const mau = PROGRAMMING_LESSONS.at(-1)!
    expect(await loadLesson(mau.id)).toEqual(getLesson(mau.id))
    expect(await loadLesson('khong-co-bai-nay')).toBeUndefined()
    expect(await loadUnitLessons('khong-co-unit-nay')).toEqual([])
  })

  it('loadLessons gom theo unit, bỏ qua id lạ, trả map theo id', async () => {
    const [a, b] = [PROGRAMMING_LESSONS[0]!, PROGRAMMING_LESSONS[1]!]
    const map = await loadLessons([a.id, b.id, 'khong-co-bai-nay'])
    expect([...map.keys()].sort()).toEqual([a.id, b.id].sort())
    expect(map.get(a.id)).toEqual(getLesson(a.id))
  })

  it('cùng unit nạp hai lần thì dùng lại một promise (cache)', async () => {
    const unitId = PROGRAMMING_LESSONS[0]!.unitId
    const p1 = loadUnitLessons(unitId)
    const p2 = loadUnitLessons(unitId)
    expect(p1).toBe(p2)
    expect(await p1).toEqual(getLessonsByUnit(unitId))
  })
})
