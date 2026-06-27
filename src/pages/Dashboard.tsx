import { useState, useEffect, useMemo } from 'react'
import { Flame, BookOpen, Target, GraduationCap, MessageCircle, PenLine, Mic, RotateCcw, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { useCloudSync } from '../lib/useCloudSync'
import { getStreak, getUsage, getChatSessions, getWritingSubs, getSpeakingSessions } from '../lib/storage'
import { getLearnedWords, getLearnedCount } from '../lib/vocab'
import { getSRSStats } from '../lib/srs'
import { loadCurriculum, getPathProgress, getDailyLearned, DAILY_GOAL } from '../lib/curriculum'
import { getActivity7Days, getWeekTotal, getCefrProgress, type LevelProgress } from '../lib/stats'
import { LIMITS } from '../types'

// Bảng màu nhấn cho từng cấp CEFR (Tailwind cần class tĩnh — không ghép động được).
const ACCENT: Record<LevelProgress['accent'], { bar: string; text: string; soft: string }> = {
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-300', soft: 'bg-emerald-500/10' },
  sky:     { bar: 'bg-sky-500',     text: 'text-sky-300',     soft: 'bg-sky-500/10' },
  violet:  { bar: 'bg-violet-500',  text: 'text-violet-300',  soft: 'bg-violet-500/10' },
  amber:   { bar: 'bg-amber-500',   text: 'text-amber-300',   soft: 'bg-amber-500/10' },
}

// Một thẻ số liệu nhỏ (icon + số to + nhãn).
function StatCard({ icon, value, label, sub, color }: {
  icon: React.ReactNode; value: string | number; label: string; sub?: string; color: string
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-1.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-white leading-none mt-1">{value}</p>
      <p className="text-xs text-zinc-400 leading-tight">{label}</p>
      {sub && <p className="text-[11px] text-zinc-500 leading-tight">{sub}</p>}
    </div>
  )
}

// Thanh tiến độ ngang đơn giản.
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { T, lang } = useLang()
  const vi = lang === 'vi'
  useCloudSync(user?.id)  // kéo lượt dùng mới nhất từ Supabase

  const [ready, setReady] = useState(false)
  const [cefr, setCefr] = useState<LevelProgress[]>([])

  // Nạp dữ liệu từ điển (cho tiến độ lộ trình) + tiến độ CEFR — đều bất đồng bộ.
  useEffect(() => {
    if (!user) return
    let alive = true
    ;(async () => {
      await loadCurriculum()
      const levels = await getCefrProgress(getLearnedWords(user.id))
      if (!alive) return
      setCefr(levels)
      setReady(true)
    })()
    return () => { alive = false }
  }, [user])

  // Số liệu đọc tức thì từ localStorage (re-tính khi đã nạp xong dữ liệu).
  const stats = useMemo(() => {
    if (!user) return null
    const usage = getUsage(user.id)
    const limit = LIMITS[user.plan]
    return {
      streak: getStreak(user.id),
      week: getActivity7Days(user.id),
      weekTotal: getWeekTotal(user.id),
      learnedToday: getDailyLearned(user.id),
      learnedTotal: getLearnedCount(user.id),
      path: ready ? getPathProgress(getLearnedWords(user.id)) : { done: 0, total: 0 },
      srs: getSRSStats(user.id),
      usage, limit,
      chatN: getChatSessions(user.id).length,
      writeN: getWritingSubs(user.id).length,
      speakN: getSpeakingSessions(user.id).length,
    }
  }, [user, ready])

  if (!user || !stats) return null

  const maxDay = Math.max(1, ...stats.week.map(d => d.count))
  const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const DOW_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dow = vi ? DOW_VI : DOW_EN

  // Tổng tiến độ CEFR (trung bình % 4 cấp) — chỉ để hiển thị 1 con số tổng quan.
  const cefrOverall = cefr.length
    ? Math.round(cefr.reduce((s, l) => s + l.pct, 0) / cefr.length)
    : 0

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={vi ? 'Tiến độ học' : 'Your Progress'} streak={stats.streak} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Streak + biểu đồ 7 ngày ─────────────────────────────────── */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.streak > 0 ? 'bg-orange-500/15' : 'bg-zinc-800'}`}>
                <Flame className={`w-6 h-6 ${stats.streak > 0 ? 'text-orange-400' : 'text-zinc-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{stats.streak}</p>
                <p className="text-xs text-zinc-400 mt-1">{T.streakDays}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white leading-none">{stats.weekTotal}</p>
              <p className="text-xs text-zinc-400 mt-1">{vi ? 'hoạt động / 7 ngày' : 'activities / 7 days'}</p>
            </div>
          </div>

          {/* Cột hoạt động 7 ngày gần nhất */}
          <div className="flex items-end justify-between gap-1.5 h-20">
            {stats.week.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-md transition-all ${d.active ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-zinc-800'}`}
                    style={{ height: `${d.active ? Math.max(14, (d.count / maxDay) * 100) : 6}%` }}
                    title={`${d.count} ${vi ? 'hoạt động' : 'activities'}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{dow[d.dow]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Hôm nay ──────────────────────────────────────────────────── */}
        <section className="animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-lime-400" /> {vi ? 'Hôm nay' : 'Today'}
          </h2>

          {/* Mục tiêu từ mới hôm nay */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-300">{vi ? 'Từ mới hôm nay' : 'New words today'}</span>
              <span className="text-sm font-semibold text-lime-300">{stats.learnedToday}/{DAILY_GOAL}</span>
            </div>
            <Bar pct={(stats.learnedToday / DAILY_GOAL) * 100} color="bg-lime-500" />
          </div>

          {/* Lượt dùng còn lại hôm nay */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <MessageCircle className="w-4 h-4 text-emerald-400" />, label: vi ? 'Chat' : 'Chat', used: stats.usage.chatCount, max: stats.limit.chat },
              { icon: <Mic className="w-4 h-4 text-sky-400" />, label: vi ? 'Nói' : 'Speak', used: stats.usage.speakingCount, max: stats.limit.speaking },
              { icon: <PenLine className="w-4 h-4 text-violet-400" />, label: vi ? 'Viết' : 'Write', used: stats.usage.writingCount, max: stats.limit.writing },
            ].map((m) => (
              <div key={m.label} className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 text-center">
                <div className="flex justify-center mb-1.5">{m.icon}</div>
                <p className="text-base font-bold text-white leading-none">{m.used}<span className="text-zinc-600 text-xs">/{m.max}</span></p>
                <p className="text-[11px] text-zinc-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Từ vựng ──────────────────────────────────────────────────── */}
        <section className="animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> {vi ? 'Từ vựng' : 'Vocabulary'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<BookOpen className="w-5 h-5 text-amber-300" />} color="bg-amber-500/10"
              value={stats.learnedTotal} label={vi ? 'từ đã thuộc' : 'words learned'} />
            <StatCard icon={<RotateCcw className="w-5 h-5 text-teal-300" />} color="bg-teal-500/10"
              value={stats.srs.due} label={vi ? 'cần ôn hôm nay' : 'due to review'}
              sub={vi ? `${stats.srs.total} trong SRS` : `${stats.srs.total} in SRS`} />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-lime-300" />} color="bg-lime-500/10"
              value={stats.path.total ? `${Math.round((stats.path.done / stats.path.total) * 100)}%` : '—'}
              label={vi ? 'lộ trình' : 'of path'}
              sub={ready ? `${stats.path.done}/${stats.path.total}` : '…'} />
          </div>
        </section>

        {/* ── Lộ trình CEFR ───────────────────────────────────────────── */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> {vi ? 'Lộ trình CEFR' : 'CEFR Roadmap'}
            </h2>
            {cefr.length > 0 && <span className="text-xs text-zinc-500">{vi ? 'Tổng' : 'Overall'} {cefrOverall}%</span>}
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            {cefr.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-2">{vi ? 'Đang tải…' : 'Loading…'}</p>
            ) : cefr.map((l) => {
              const c = ACCENT[l.accent]
              return (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className={`font-semibold ${c.text}`}>{vi ? l.titleVi : l.titleEn}</span>
                    <span className="text-zinc-400 text-xs">
                      {l.doneWords}/{l.totalWords} {vi ? 'từ' : 'words'} · {l.pct}%
                    </span>
                  </div>
                  <Bar pct={l.pct} color={c.bar} />
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Tổng kết hoạt động ──────────────────────────────────────── */}
        <section className="animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">{vi ? 'Tổng kết' : 'All-time totals'}</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<MessageCircle className="w-5 h-5 text-emerald-300" />} color="bg-emerald-500/10"
              value={stats.chatN} label={vi ? 'phiên chat' : 'chat sessions'} />
            <StatCard icon={<Mic className="w-5 h-5 text-sky-300" />} color="bg-sky-500/10"
              value={stats.speakN} label={vi ? 'lượt luyện nói' : 'speaking turns'} />
            <StatCard icon={<PenLine className="w-5 h-5 text-violet-300" />} color="bg-violet-500/10"
              value={stats.writeN} label={vi ? 'bài đã chấm' : 'graded essays'} />
          </div>
        </section>

      </main>
    </div>
  )
}
