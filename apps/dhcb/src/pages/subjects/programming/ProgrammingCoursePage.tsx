// ProgrammingCoursePage — trang một KHOÁ NGẮN (`/lap-trinh/khoa-hoc/:courseId`, PR 3/4 khoá Git;
// đổi tiền tố từ '/khoa/' sang '/khoa-hoc/' — xem changelog đổi route).
//
// Khác trang bậc (ProgrammingLevelPage): khoá KHÔNG có unit riêng, chỉ có CHƯƠNG, mỗi chương
// liệt kê bài trực tiếp qua `chapter.lessonIds` (tham chiếu — có thể là bài thuộc xương sống
// P1–P6, không nhất thiết bài "của riêng" khoá). Cố ý theo đúng bố cục ProgrammingLevelPage để
// người dùng thấy quen tay: tiêu đề + can-do → dải tiến độ → danh sách chương/bài.
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { BookOpen, CheckCircle2, Play } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import LangBadge from '../../../components/programming/LangBadge'
import { useAuth } from '../../../context/useAuth'
import {
  fetchProgress,
  isLessonCompleted,
  type ProgrammingLessonProgress,
} from '../../../lib/programmingProgress'
import { getShortCourse } from '@dhcb/subject-programming/courses/registry'
import { getLessonSummary } from '@dhcb/subject-programming/lessonsLoader'
import { buildSlugSegment, idFromSlugSegment } from '@core/slug'

export default function ProgrammingCoursePage() {
  const nav = useNavigate()
  const { user } = useAuth()
  // URL là `<mã khoá>--<tiêu đề đã slug hoá>`; mã khoá đứng đầu nên link cũ (chỉ mã) vẫn tra
  // ra đúng khoá, rồi được chuyển hướng về URL chuẩn ngay bên dưới.
  const { courseId: courseSlugParam } = useParams<{ courseId: string }>()
  const course = courseSlugParam ? getShortCourse(idFromSlugSegment(courseSlugParam)) : undefined
  const [progress, setProgress] = useState<ProgrammingLessonProgress[]>([])

  useEffect(() => {
    if (!user) return
    void fetchProgress(user.id).then(setProgress)
  }, [user])

  // Mã khoá lạ → về trang tổng quan môn, không render trang rỗng.
  if (!course) return <Navigate to="/lap-trinh" replace />

  // URL chỉ có mã (link cũ) hoặc phần mô tả không khớp tiêu đề hiện tại → chuyển hướng về URL
  // chuẩn, để Google không coi là hai trang nội dung trùng nhau (cùng luật trang bài học).
  const canonicalCourse = buildSlugSegment(course.id, course.title)
  if (courseSlugParam !== canonicalCourse) {
    return <Navigate to={`/lap-trinh/khoa-hoc/${canonicalCourse}`} replace />
  }

  const allLessons = course.chapters.flatMap((ch) =>
    ch.lessonIds.map((id) => getLessonSummary(id)).filter((l) => l !== undefined),
  )
  const lessonCount = allLessons.length
  const completedCount = allLessons.filter((l) => isLessonCompleted(progress, l.id)).length

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader title={course.title} subtitle={course.canDo} />

        <section className="bg-zinc-900/80 border border-accent-500/30 rounded-3xl p-5 space-y-2 shadow-sm">
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong>Thời lượng:</strong> {course.duration}
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {course.prerequisites.length === 0 ? (
              <>
                <strong>Cần biết trước:</strong> không — vào thẳng học được.
              </>
            ) : (
              <>
                <strong>Nên biết trước:</strong> {course.prerequisites.join(', ')}
              </>
            )}
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-base font-bold text-white">
              {course.chapters.length} chương, {lessonCount} bài
            </h2>
            {lessonCount > 0 && (
              <p className="text-xs text-zinc-400">
                Đã hoàn thành{' '}
                <strong className="text-emerald-300 theme-light:text-emerald-800">
                  {completedCount}/{lessonCount}
                </strong>{' '}
                bài học
              </p>
            )}
          </div>
          {lessonCount > 0 && (
            <div
              className="h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden"
              role="progressbar"
              aria-label={`Tiến độ khoá ${course.title}`}
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={lessonCount}
            >
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round((completedCount / lessonCount) * 100)}%` }}
              />
            </div>
          )}
          {course.chapters.map((chapter, idx) => {
            const lessons = chapter.lessonIds
              .map((id) => getLessonSummary(id))
              .filter((l) => l !== undefined)
            const chapterCompleted =
              lessons.length > 0 && lessons.every((l) => isLessonCompleted(progress, l.id))
            return (
              <div
                key={chapter.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-white">
                    <span className="text-zinc-500 mr-2">Chương {idx + 1}</span>
                    {chapter.title}
                  </p>
                  {chapterCompleted && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 theme-light:text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed flex items-start gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
                  <span>{chapter.summary}</span>
                </p>
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="space-y-1.5">
                    <LangBadge language={lesson.language} />
                    <button
                      onClick={() =>
                        nav(`/lap-trinh/bai-hoc/${buildSlugSegment(lesson.id, lesson.title)}`)
                      }
                      className="tap-44 w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition active:scale-[0.98]"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Play className="w-4 h-4 shrink-0" />
                        <span className="truncate">Học bài: {lesson.title}</span>
                      </span>
                      {isLessonCompleted(progress, lesson.id) && (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </section>
      </main>
    </div>
  )
}
