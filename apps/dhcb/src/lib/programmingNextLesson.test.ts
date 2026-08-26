import { describe, it, expect } from 'vitest'
import {
  lessonsInOrder,
  pickNextLesson,
  countCompleted,
  countCompletedByLevel,
} from './programmingNextLesson'
import type { ProgrammingLessonProgress } from './programmingProgress'

const done = (lessonId: string): ProgrammingLessonProgress => ({
  lessonId,
  status: 'completed',
  completedAt: 1,
})
const doing = (lessonId: string): ProgrammingLessonProgress => ({
  lessonId,
  status: 'in_progress',
  completedAt: null,
})

describe('programmingNextLesson', () => {
  it('thứ tự bài theo giáo trình: bài đầu là bài 1 của bậc P1', () => {
    const all = lessonsInOrder()
    expect(all.length).toBeGreaterThan(0)
    expect(all[0]!.levelId).toBe('p1')
    expect(all[0]!.lesson.id).toMatch(/^p1-u1-/)
  })

  it('chưa học gì → gợi ý bài đầu tiên, và KHÔNG gọi là "học tiếp"', () => {
    const next = pickNextLesson([])
    expect(next?.lesson.id).toBe(lessonsInOrder()[0]!.lesson.id)
    expect(next?.resuming).toBe(false)
  })

  it('có bài đang dở → ưu tiên bài dở, kể cả khi nó nằm sau nhiều bài chưa xong khác', () => {
    const all = lessonsInOrder()
    const muon = all[5]!.lesson.id
    const next = pickNextLesson([doing(muon)])
    expect(next?.lesson.id).toBe(muon)
    expect(next?.resuming).toBe(true)
  })

  it('nhiều bài dở → lấy bài SỚM NHẤT trong giáo trình, không phải bài server trả trước', () => {
    const all = lessonsInOrder()
    const som = all[2]!.lesson.id
    const muon = all[9]!.lesson.id
    // Cố tình đặt bài muộn LÊN TRƯỚC trong mảng, đúng ca dễ sai nếu ai đó duyệt theo progress.
    const next = pickNextLesson([doing(muon), doing(som)])
    expect(next?.lesson.id).toBe(som)
  })

  it('bỏ qua các bài đã hoàn thành', () => {
    const all = lessonsInOrder()
    const next = pickNextLesson([done(all[0]!.lesson.id), done(all[1]!.lesson.id)])
    expect(next?.lesson.id).toBe(all[2]!.lesson.id)
  })

  it('hoàn thành hết môn → null, không đẩy học viên quay lại bài nào', () => {
    const tatCa = lessonsInOrder().map((x) => done(x.lesson.id))
    expect(pickNextLesson(tatCa)).toBeNull()
  })

  it('đếm tiến độ: tổng là số bài ĐÃ SOẠN, tiến độ chỉ tính bài completed', () => {
    const all = lessonsInOrder()
    const c = countCompleted([done(all[0]!.lesson.id), doing(all[1]!.lesson.id)])
    expect(c.total).toBe(all.length)
    expect(c.done).toBe(1)
  })

  it('đếm theo bậc: bài của bậc khác không lọt vào mẫu số', () => {
    const p1 = countCompletedByLevel([], 'p1')
    const p6 = countCompletedByLevel([], 'p6')
    expect(p1.total).toBeGreaterThan(0)
    expect(p6.total).toBeGreaterThan(0)
    expect(p1.total + p6.total).toBeLessThan(lessonsInOrder().length)
  })

  it('tiến độ bài không tồn tại (mã cũ đã xoá) không làm sai số đếm', () => {
    expect(countCompleted([done('p9-u9-l9')]).done).toBe(0)
  })
})
