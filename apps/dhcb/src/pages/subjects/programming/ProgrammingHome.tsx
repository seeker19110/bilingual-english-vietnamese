// ProgrammingHome — trang tổng quan môn LẬP TRÌNH: thang bậc P1→P6 + dự án xuyên suốt.
// PR-L1: khung môn (đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md). Nội dung bài
// học chi tiết vào ở PR-L3/L4 — các bậc hiện là khung "sắp mở" trừ phần xem đề cương.
import { useNavigate } from 'react-router-dom'
import { Code2, Rocket, Store, Lock, ChevronRight, Languages, Clock, Play } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { PROGRAMMING_LEVELS, PROJECT_TRACKS } from '@dhcb/subject-programming/curriculum'

export default function ProgrammingHome() {
  const nav = useNavigate()

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/mon-hoc')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Môn Lập trình"
          subtitle="Từ số 0 tới sản phẩm chạy thật trên Internet — Python, JavaScript/TypeScript, SQL. Hoàn thành môn là hoàn thành luôn dự án của chính bạn."
        />

        {/* Chạy thử ngay — sandbox Python trong trình duyệt (PR-L2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => nav('/lap-trinh/chay-thu')}
            className="tap-44 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition shadow-md shadow-accent-500/20 active:scale-[0.98]"
          >
            <Play className="w-4 h-4" />
            <span>Chạy thử Python ngay</span>
          </button>
          <button
            onClick={() => nav('/lap-trinh/du-an')}
            className="tap-44 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-zinc-900 border border-accent-500/40 hover:border-accent-500 text-white font-semibold text-sm transition active:scale-[0.98]"
          >
            <Store className="w-4 h-4 text-accent-400" />
            <span>Dự án của tôi (P1 → P2)</span>
          </button>
        </div>

        {/* Dự án xuyên suốt */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-accent-400" />
            <span>Dự án xuyên suốt — học tới đâu, xây tới đó</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Mỗi bậc học kết thúc bằng một chặng của <strong>cùng một sản phẩm</strong>: bắt đầu là
            máy tính tiền chạy chữ (P1), kết thúc là web bán hàng thật của bạn chạy trên Internet
            (P5) — kèm repo GitHub làm hồ sơ xin việc.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {PROJECT_TRACKS.map((track) => (
              <div
                key={track.id}
                className={`rounded-2xl p-4 border space-y-1.5 ${
                  track.available
                    ? 'bg-zinc-950 border-accent-500/40'
                    : 'bg-zinc-950/60 border-zinc-800'
                }`}
              >
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>{track.name}</span>
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">{track.description}</p>
                {!track.available && (
                  <p className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Sắp mở
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Thang bậc P1–P6 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-accent-400" />
            <span>Lộ trình 6 bậc P1 → P6</span>
          </h2>
          {PROGRAMMING_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => nav(`/lap-trinh/${level.id}`)}
              className="tap-44 w-full text-left bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 transition flex items-start justify-between gap-3 active:scale-[0.99]"
            >
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm font-bold text-white">
                  <span className="text-accent-300 theme-light:text-accent-800 uppercase mr-2">
                    {level.id}
                  </span>
                  {level.name}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">{level.canDo}</p>
                <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-500 pt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" /> {level.languages.join(' · ')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {level.duration}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 shrink-0 mt-1" />
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
