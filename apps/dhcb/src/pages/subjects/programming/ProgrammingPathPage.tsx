// ProgrammingPathPage — TRANG TỔNG QUAN MỘT LỘ TRÌNH MỤC TIÊU (`/lap-trinh/lo-trinh/:pathId`).
//
// Đặc tả: `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md` (đợt 1). Trang này là bảng lắp
// ghép: mỗi giai đoạn liệt kê các CHẶNG của những hướng chuyên sâu có sẵn, kèm lý do vì sao
// chặng đó nằm ở vị trí đó. Ba luật hiển thị:
//  · Chỉ hiện nút "Vào học" ở chặng ĐÃ có bài thật (`unitsOfStage` > 0) — không hứa suông.
//  · Giai đoạn stages rỗng = ĐANG SOẠN, nói rõ, không giấu.
//  · Trạng thái "đã xong" đọc từ tiến độ hướng sẵn có (đợt 1 CHỈ ĐỌC — tiến độ riêng của lộ
//    trình là việc của đợt 2).
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Map, Clock, Lock, CheckCircle2, Play, Hammer, Award, Target } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useAuth } from '../../../context/useAuth'
import {
  fetchSpecProgress,
  isStageCompleted,
  EMPTY_SPEC_PROGRESS,
  type SpecProgressSnapshot,
} from '../../../lib/programmingSpecProgress'
import {
  getLearningPath,
  pathStageRefs,
  isPhaseDrafting,
} from '@dhcb/subject-programming/learningPaths/registry'
import { getSpecStage } from '@dhcb/subject-programming/specializations/registry'
import { unitsOfStage } from '@dhcb/subject-programming/specializations/stageUnits'

export default function ProgrammingPathPage() {
  const nav = useNavigate()
  const { pathId } = useParams()
  const { user } = useAuth()
  const [progress, setProgress] = useState<SpecProgressSnapshot>(EMPTY_SPEC_PROGRESS)

  useEffect(() => {
    if (!user) return
    void fetchSpecProgress(user.id).then(setProgress)
  }, [user])

  const path = getLearningPath(pathId ?? '')

  if (!path) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100">
        <Layout onBack={() => nav('/lap-trinh')} />
        <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
          <PageHeader
            title="Không có lộ trình này"
            subtitle="Đường dẫn không đúng hoặc lộ trình chưa tồn tại. Quay lại trang môn để xem các lộ trình đang mở."
          />
        </main>
      </div>
    )
  }

  const allRefs = pathStageRefs(path)
  const doneCount = allRefs.filter((r) => isStageCompleted(progress, r.stageId)).length

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader title={`Lộ trình: ${path.title}`} subtitle={path.tagline} />

        {/* Thông tin đầu vào + tiến độ tổng — đọc từ tiến độ hướng sẵn có */}
        <section className="rounded-3xl border border-accent-500/40 bg-zinc-900 p-5 space-y-3">
          <p className="text-sm text-zinc-200 leading-relaxed">{path.forWho}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Nên xong bậc {path.prerequisite.toUpperCase()} trước
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {path.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Map className="w-3 h-3" aria-hidden="true" />
              {doneCount}/{allRefs.length} chặng xong
            </span>
          </div>
        </section>

        {/* Các giai đoạn */}
        {path.phases.map((phase, idx) => (
          <section
            key={phase.id}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm"
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-400 shrink-0" aria-hidden="true" />
              <span>
                Giai đoạn {idx + 1}: {phase.name}
              </span>
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">{phase.canDo}</p>

            {isPhaseDrafting(phase) ? (
              <p className="flex items-start gap-2 text-sm text-zinc-300 rounded-2xl bg-zinc-950 border border-zinc-800 p-3">
                <Hammer className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Nội dung giai đoạn này <strong>đang soạn</strong> — sẽ mở sau. Bạn cứ đi các giai
                  đoạn trước, tới đây là kịp.
                </span>
              </p>
            ) : (
              <ol className="space-y-2">
                {phase.stages.map((ref) => {
                  const stage = getSpecStage(ref.stageId)
                  const xong = isStageCompleted(progress, ref.stageId)
                  const coBai = unitsOfStage(ref.stageId).length > 0
                  const [specId] = ref.stageId.split('-')
                  return (
                    <li
                      key={ref.stageId}
                      className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white leading-snug">
                          {stage?.name ?? ref.stageId}
                          {xong && (
                            <CheckCircle2
                              className="inline-block w-4 h-4 text-emerald-400 ml-1.5 align-text-bottom"
                              aria-label="Đã xong"
                            />
                          )}
                        </p>
                        <span className="text-[11px] font-semibold text-zinc-400 shrink-0">
                          {ref.stageId.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{ref.why}</p>
                      {coBai ? (
                        <button
                          onClick={() => nav(`/lap-trinh/huong/${specId}/${ref.stageId}`)}
                          className="tap-44 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-xs transition active:scale-[0.98]"
                        >
                          <Play className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Vào học chặng này</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => nav(`/lap-trinh/huong/${specId}`)}
                          className="tap-44 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-accent-500/60 text-zinc-200 font-semibold text-xs transition active:scale-[0.98]"
                        >
                          <Map className="w-3.5 h-3.5 text-accent-400" aria-hidden="true" />
                          <span>Xem bản đồ chặng (bài đang soạn)</span>
                        </button>
                      )}
                    </li>
                  )
                })}
              </ol>
            )}

            <p className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed">
              <Award className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong className="text-zinc-200">Bằng chứng chốt giai đoạn:</strong>{' '}
                {phase.artifact.name} — {phase.artifact.brief}
              </span>
            </p>
          </section>
        ))}

        {/* Đích đến — hành vi quan sát được, không phải danh xưng */}
        <section className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 space-y-2">
          <h2 className="text-base font-bold text-white">Đi hết lộ trình, bạn là người:</h2>
          <ul className="text-sm text-zinc-100 leading-relaxed space-y-1.5 list-disc pl-5">
            {path.outcomes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
