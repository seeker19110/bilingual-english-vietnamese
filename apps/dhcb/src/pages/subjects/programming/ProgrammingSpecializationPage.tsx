// ProgrammingSpecializationPage — CHI TIẾT MỘT HƯỚNG chuyên sâu (`/lap-trinh/huong/:specId`).
//
// Bố cục cố ý theo thứ tự câu hỏi của người đang cân nhắc:
//  ① "hướng này làm ra cái gì, hợp với tôi không?"  → tóm tắt + hợp với ai
//  ② "đi thế nào?"                                   → 4 chặng, mỗi chặng module + dự án
//  ③ "cuối đường có gì?"                             → capstone
//  ④ "thế nào là giỏi?"                              → dấu hiệu chuyên gia + nghề nghiệp
//  ⑤ "cái gì làm người ta khựng lại?"                → bẫy thường gặp + nguồn học
//
// Mã hướng lạ thì nói KHÔNG BIẾT và mời quay lại danh sách — tuyệt đối không đoán bừa một hướng.
import { useNavigate, useParams } from 'react-router-dom'
import {
  Clock,
  Lock,
  Wrench,
  Target,
  Trophy,
  Sparkles,
  Briefcase,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import {
  getSpecialization,
  type SpecProject,
  type SpecStage,
} from '@dhcb/subject-programming/specializations/registry'

const TIER_LABEL: Record<string, string> = {
  s1: 'Chặng 1 — căn bản',
  s2: 'Chặng 2 — vững tay',
  s3: 'Chặng 3 — nâng cao',
  s4: 'Chặng 4 — chuyên gia',
}

function ProjectBlock({ project, tone }: { project: SpecProject; tone: 'stage' | 'capstone' }) {
  const border = tone === 'capstone' ? 'border-emerald-500/40' : 'border-zinc-800'
  const bg = tone === 'capstone' ? 'bg-emerald-500/10' : 'bg-zinc-950'
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-4 space-y-2`}>
      <h4 className="text-sm font-bold text-white flex items-center gap-2">
        <Trophy className="w-4 h-4 text-accent-400 shrink-0" aria-hidden="true" />
        <span>Dự án: {project.name}</span>
      </h4>
      <p className="text-sm text-zinc-200 leading-relaxed">{project.brief}</p>
      <p className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
        Xong nghĩa là đạt đủ:
      </p>
      <ul className="text-sm text-zinc-200 leading-relaxed space-y-1 list-disc pl-5">
        {project.requirements.map((req) => (
          <li key={req}>{req}</li>
        ))}
      </ul>
      {project.stretch && project.stretch.length > 0 && (
        <p className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-zinc-200">Muốn đi xa hơn:</span>{' '}
          {project.stretch.join(' · ')}
        </p>
      )}
    </div>
  )
}

function StageBlock({ stage }: { stage: SpecStage }) {
  return (
    <li className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
      <div className="space-y-1.5">
        {/* Nhãn chặng dùng zinc-300 chứ không phải accent-400: accent ở theme nền sáng
            không đạt tương phản AA cho CHỮ (cổng e2e/a11y.spec.ts bắt được). */}
        <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
          {TIER_LABEL[stage.tier] ?? stage.tier}
        </p>
        <h3 className="text-base font-bold text-white leading-snug">{stage.name}</h3>
        <p className="text-sm text-zinc-200 leading-relaxed">
          <span className="font-semibold">Học xong làm được:</span> {stage.canDo}
        </p>
        <p className="text-xs text-zinc-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{stage.duration}</span>
        </p>
      </div>

      <ol className="space-y-3">
        {stage.modules.map((mod, i) => (
          <li key={mod.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
            <h4 className="text-sm font-bold text-white">
              {i + 1}. {mod.title}
            </h4>
            <ul className="text-sm text-zinc-200 leading-relaxed space-y-1 list-disc pl-5">
              {mod.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <ProjectBlock project={stage.project} tone="stage" />
    </li>
  )
}

export default function ProgrammingSpecializationPage() {
  const nav = useNavigate()
  const { specId } = useParams<{ specId: string }>()
  const spec = getSpecialization(specId ?? '')

  if (!spec) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100">
        <Layout onBack={() => nav('/lap-trinh/huong')} />
        <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-4">
          <PageHeader
            title="Không có hướng này"
            subtitle="Đường dẫn không khớp hướng nào trong môn Lập trình. Quay lại danh sách để chọn hướng có thật."
          />
          <button
            onClick={() => nav('/lap-trinh/huong')}
            className="tap-44 w-full py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
          >
            Xem 12 hướng chuyên sâu
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh/huong')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader title={spec.name} subtitle={spec.tagline} />

        {/* ① Hợp với ai + điều kiện vào */}
        <section className="rounded-3xl border border-accent-500/40 bg-zinc-900 p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-400" aria-hidden="true" />
            <span>Hướng này hợp với ai</span>
          </h2>
          <p className="text-sm text-zinc-200 leading-relaxed">{spec.forWho}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Cần xong bậc {spec.prerequisite.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {spec.duration}
            </span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed">
            <span className="font-semibold">Ngôn ngữ:</span> {spec.languages.join(' · ')}
          </p>
          <p className="text-sm text-zinc-200 leading-relaxed flex items-start gap-2">
            <Wrench className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <span className="font-semibold">Công cụ lõi:</span> {spec.coreTools.join(' · ')}
            </span>
          </p>
        </section>

        {/* ② Bốn chặng */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">
            Lộ trình {spec.stages.length} chặng — học tới đâu nộp sản phẩm tới đó
          </h2>
          <ol className="space-y-4">
            {spec.stages.map((stage) => (
              <StageBlock key={stage.id} stage={stage} />
            ))}
          </ol>
        </section>

        {/* ③ Capstone */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">Sản phẩm tốt nghiệp hướng</h2>
          <ProjectBlock project={spec.capstone} tone="capstone" />
        </section>

        {/* ④ Thế nào là giỏi */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-400" aria-hidden="true" />
            <span>Dấu hiệu bạn đã thành chuyên gia</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Đây là hành vi quan sát được, không phải số năm kinh nghiệm.
          </p>
          <ul className="text-sm text-zinc-200 leading-relaxed space-y-1.5 list-disc pl-5">
            {spec.expertSignals.map((sig) => (
              <li key={sig}>{sig}</li>
            ))}
          </ul>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pt-1">
            <Briefcase className="w-4 h-4 text-accent-400" aria-hidden="true" />
            <span>Vị trí công việc mở ra</span>
          </h3>
          <ul className="flex flex-wrap gap-2">
            {spec.careers.map((career) => (
              <li
                key={career}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-200"
              >
                {career}
              </li>
            ))}
          </ul>
        </section>

        {/* ⑤ Bẫy + nguồn học */}
        <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <span>Bẫy khiến người học đứng lại ở mức trung bình</span>
          </h2>
          <ul className="text-sm text-zinc-100 leading-relaxed space-y-1.5 list-disc pl-5">
            {spec.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-400" aria-hidden="true" />
            <span>Nguồn học chuẩn của ngành</span>
          </h2>
          <ul className="text-sm text-zinc-200 leading-relaxed space-y-1.5 list-disc pl-5">
            {spec.resources.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
