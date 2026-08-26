// ProgrammingLevelPage — trang một bậc P1–P6 của môn Lập trình: đề cương unit theo nhịp
// làn LUYỆN (kiến thức) + làn DỰ ÁN (bước xây tiếp dự án trục). PR-L3: unit ĐÃ CÓ bài học
// (khuôn 8 bước) hiện nút "Học bài" + trạng thái hoàn thành từ server; unit chưa soạn
// vẫn là "Sắp mở" (nội dung hàng loạt vào PR-L4).
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { BookOpen, Hammer, Trophy, Lock, CheckCircle2, Play } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import LangBadge from '../../../components/programming/LangBadge'
import { useAuth } from '../../../context/useAuth'
import {
  fetchProgress,
  isLessonCompleted,
  type ProgrammingLessonProgress,
} from '../../../lib/programmingProgress'
import { getProgrammingLevel } from '@dhcb/subject-programming/curriculum'
import { getLessonsByUnit } from '@dhcb/subject-programming/lessons'

export default function ProgrammingLevelPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { levelId } = useParams<{ levelId: string }>()
  const level = levelId ? getProgrammingLevel(levelId) : undefined
  const [progress, setProgress] = useState<ProgrammingLessonProgress[]>([])

  useEffect(() => {
    if (!user) return
    void fetchProgress(user.id).then(setProgress)
  }, [user])

  // Id bậc lạ → về trang tổng quan môn, không render trang rỗng.
  if (!level) return <Navigate to="/lap-trinh" replace />

  // Tiến độ bậc: đếm trên các bài ĐÃ SOẠN của bậc (unit chưa có bài không tính vào mẫu số,
  // để thanh tiến độ không "đứng im" ở mức thấp khi nội dung còn đang soạn dần).
  const levelLessons = level.units.flatMap((u) => getLessonsByUnit(u.id))
  const lessonCount = levelLessons.length
  const completedCount = levelLessons.filter((l) => isLessonCompleted(progress, l.id)).length

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={`Bậc ${level.id.toUpperCase()} — ${level.name}`}
          subtitle={level.canDo}
        />

        {/* P6 soạn TRƯỚC mốc "P1–P5 chạy thật với người học" nên dễ phải sửa hơn — nói ra vì
            đây là cảnh báo có hệ quả thực tế cho người đang học, không phải tự bôi xấu. */}
        {level.id === 'p6' && (
          <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-zinc-100 leading-relaxed">
            <strong>Bản mở đường.</strong> Bậc này được soạn trước khi có dữ liệu người học thật,
            nên nội dung của nó dễ được sửa hơn P1–P5.
          </p>
        )}

        {/* Chặng dự án trục của bậc */}
        <section className="bg-zinc-900/80 border border-accent-500/30 rounded-3xl p-5 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent-400" />
            <span>{level.projectStage}</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong>Hoàn thành bậc = </strong>
            {level.projectMilestone}
          </p>
        </section>

        {/* Danh sách unit */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-base font-bold text-white">
              Đề cương {level.units.length} unit ({level.duration})
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
              aria-label={`Tiến độ bậc ${level.id.toUpperCase()}`}
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
          {level.units.map((unit, idx) => {
            const lessons = getLessonsByUnit(unit.id)
            const unitCompleted =
              lessons.length > 0 && lessons.every((l) => isLessonCompleted(progress, l.id))
            return (
              <div
                key={unit.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-white">
                    <span className="text-zinc-500 mr-2">Unit {idx + 1}</span>
                    {unit.title}
                  </p>
                  {lessons.length === 0 ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                      <Lock className="w-3 h-3" /> Sắp mở
                    </span>
                  ) : unitCompleted ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 theme-light:text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed flex items-start gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
                  <span>{unit.topics}</span>
                </p>
                {unit.projectStep && (
                  <p className="text-xs text-accent-300 theme-light:text-accent-800 leading-relaxed flex items-start gap-1.5">
                    <Hammer className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Dự án:</strong> {unit.projectStep}
                    </span>
                  </p>
                )}
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="space-y-1.5">
                    {/* Ngôn ngữ hiện TRƯỚC khi bấm (PR-UX1) — học viên biết sắp viết gì. */}
                    <LangBadge language={lesson.language} />
                    <button
                      onClick={() => nav(`/lap-trinh/bai-hoc/${lesson.id}`)}
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
