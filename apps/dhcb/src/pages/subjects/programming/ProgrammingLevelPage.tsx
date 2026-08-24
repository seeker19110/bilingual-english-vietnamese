// ProgrammingLevelPage — trang một bậc P1–P6 của môn Lập trình: đề cương unit theo nhịp
// làn LUYỆN (kiến thức) + làn DỰ ÁN (bước xây tiếp dự án trục). PR-L1 là KHUNG: unit hiển
// thị đề cương + nhãn "sắp mở"; bài học tương tác vào ở PR-L3/L4.
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { BookOpen, Hammer, Trophy, Lock } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { getProgrammingLevel } from '@dhcb/subject-programming/curriculum'

export default function ProgrammingLevelPage() {
  const nav = useNavigate()
  const { levelId } = useParams<{ levelId: string }>()
  const level = levelId ? getProgrammingLevel(levelId) : undefined

  // Id bậc lạ → về trang tổng quan môn, không render trang rỗng.
  if (!level) return <Navigate to="/lap-trinh" replace />

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={`Bậc ${level.id.toUpperCase()} — ${level.name}`}
          subtitle={level.canDo}
        />

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
          <h2 className="text-base font-bold text-white">
            Đề cương {level.units.length} unit ({level.duration})
          </h2>
          {level.units.map((unit, idx) => (
            <div
              key={unit.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-white">
                  <span className="text-zinc-500 mr-2">Unit {idx + 1}</span>
                  {unit.title}
                </p>
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                  <Lock className="w-3 h-3" /> Sắp mở
                </span>
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
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
