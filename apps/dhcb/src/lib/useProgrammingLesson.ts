// useProgrammingLesson — nạp lười MỘT bài học môn Lập trình cho trang bài học.
//
// Nội dung bài không còn nằm trong bundle chung (đợt tối ưu 2026-09-01): mỗi unit là một chunk
// riêng, chỉ tải khi mở đúng bài. Hook này gói ba trạng thái rõ ràng (đang tải / lỗi / xong)
// để trang không có ca "mở bài mà màn hình trống".
//
// Cách tránh setState đồng bộ trong effect (react-hooks/set-state-in-effect): trạng thái luôn
// ghi kèm `lessonId` mà nó thuộc về; đổi bài thì trạng thái cũ tự thành "cũ" và hook trả
// "đang tải" ngay trong lượt render, không cần reset bằng setState.
import { useCallback, useEffect, useState } from 'react'
import type { ProgrammingLesson } from '@dhcb/subject-programming/lessonTypes'
import { loadLesson } from '@dhcb/subject-programming/lessonsLoader'

export type LessonLoadState =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; lesson: ProgrammingLesson | undefined }

type Ket =
  | { lessonId: string; attempt: number; status: 'ready'; lesson: ProgrammingLesson | undefined }
  | { lessonId: string; attempt: number; status: 'error' }

export function useProgrammingLesson(lessonId: string | undefined): LessonLoadState {
  const [ket, setKet] = useState<Ket | null>(null)
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    if (!lessonId) return
    let cancelled = false
    loadLesson(lessonId)
      .then((lesson) => {
        if (!cancelled) setKet({ lessonId, attempt, status: 'ready', lesson })
      })
      .catch(() => {
        if (!cancelled) setKet({ lessonId, attempt, status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [lessonId, attempt])

  // Không có id trong URL → không có gì để nạp, coi như "xong, không tìm thấy".
  if (!lessonId) return { status: 'ready', lesson: undefined }
  // Kết quả thuộc bài khác hoặc lượt thử cũ → đang tải.
  if (!ket || ket.lessonId !== lessonId || ket.attempt !== attempt) return { status: 'loading' }
  if (ket.status === 'error') return { status: 'error', retry }
  return { status: 'ready', lesson: ket.lesson }
}
