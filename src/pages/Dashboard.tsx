import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  BookOpen,
  Target,
  GraduationCap,
  MessageCircle,
  PenLine,
  Mic,
  RotateCcw,
  TrendingUp,
  CalendarDays,
  Trophy,
  BookMarked,
  ArrowRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { useCloudSync } from '../lib/useCloudSync'
import {
  getStreak,
  getUsage,
  getChatSessions,
  getWritingSubs,
  getSpeakingSessions,
} from '../lib/storage'
import { getLearnedWords, getLearnedCount } from '../lib/vocab'
import { getSRSStats } from '../lib/srs'
import { getMistakeStats } from '../lib/mistakes'
import { getExamMap } from '../lib/cefrExam'
import { loadCurriculum, getPathProgress, getDailyLearned, getDailySpeed } from '../lib/curriculum'
import {
  getActivity7Days,
  getWeekTotal,
  getCefrProgress,
  getActivityCalendar,
  getWritingProgress,
  type LevelProgress,
} from '../lib/stats'
import { LIMITS } from '../types'

// Màu ô heatmap theo số hoạt động trong ngày (đậm dần).
function heatColor(count: number): string {
  if (count <= 0) return 'bg-zinc-800/50'
  if (count <= 2) return 'bg-accent-900'
  if (count <= 5) return 'bg-accent-700'
  if (count <= 10) return 'bg-accent-500'
  return 'bg-accent-400'
}

// Màu theo band IELTS (đồng bộ với trang Luyện viết).
function bandBar(v: number): string {
  return v >= 7 ? 'bg-accent-500' : v >= 5 ? 'bg-amber-500' : 'bg-red-500'
}
function bandText(v: number): string {
  return v >= 7
    ? 'text-accent-400 theme-light:text-accent-800'
    : v >= 5
      ? 'text-amber-400 theme-light:text-amber-800'
      : 'text-red-400 theme-light:text-red-700'
}

// Bảng màu nhấn cho từng cấp CEFR (Tailwind cần class tĩnh — không ghép động được).
const ACCENT: Record<LevelProgress['accent'], { bar: string; text: string; soft: string }> = {
  emerald: {
    bar: 'bg-accent-500',
    text: 'text-accent-300 theme-light:text-accent-800',
    soft: 'bg-accent-500/10',
  },
  sky: { bar: 'bg-sky-500', text: 'text-sky-300 theme-light:text-sky-800', soft: 'bg-sky-500/10' },
  violet: {
    bar: 'bg-violet-500',
    text: 'text-violet-300 theme-light:text-violet-800',
    soft: 'bg-violet-500/10',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-300 theme-light:text-amber-800',
    soft: 'bg-amber-500/10',
  },
  rose: {
    bar: 'bg-rose-500',
    text: 'text-rose-300 theme-light:text-rose-800',
    soft: 'bg-rose-500/10',
  },
  cyan: {
    bar: 'bg-cyan-500',
    text: 'text-cyan-300 theme-light:text-cyan-800',
    soft: 'bg-cyan-500/10',
  },
}

// Một thẻ số liệu nhỏ (icon + số to + nhãn).
function StatCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  sub?: string
  color: string
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-1.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-white leading-none mt-1">{value}</p>
      <p className="text-xs text-zinc-400 leading-tight">{label}</p>
      {sub && <p className="text-[11px] text-zinc-400 leading-tight">{sub}</p>}
    </div>
  )
}

// Thanh tiến độ ngang đơn giản.
function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

export default function Dashboard() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T, lang } = useLang()
  const vi = lang === 'vi'
  useCloudSync(user?.id) // kéo lượt dùng mới nhất từ Supabase

  const [ready, setReady] = useState(false)
  const [cefr, setCefr] = useState<LevelProgress[]>([])
  // Kết quả thi cuối cấp — để hiện huy hiệu "🎓 Đã qua" cạnh từng cấp.
  const examMap = useMemo(() => getExamMap(user?.id ?? ''), [user])

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
    return () => {
      alive = false
    }
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
      calendar: getActivityCalendar(user.id, 35),
      writing: getWritingProgress(user.id),
      learnedToday: getDailyLearned(user.id),
      learnedTotal: getLearnedCount(user.id),
      dailySpeed: getDailySpeed(user.id),
      path: ready ? getPathProgress(getLearnedWords(user.id)) : { done: 0, total: 0 },
      srs: getSRSStats(user.id),
      mistakes: getMistakeStats(user.id),
      usage,
      limit,
      chatN: getChatSessions(user.id).length,
      writeN: getWritingSubs(user.id).length,
      speakN: getSpeakingSessions(user.id).length,
    }
  }, [user, ready])

  if (!user || !stats) return null

  const maxDay = Math.max(1, ...stats.week.map((d) => d.count))
  const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const DOW_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const dow = vi ? DOW_VI : DOW_EN
  // Nhãn thứ bắt đầu từ Thứ 2 — cho lưới lịch heatmap.
  const WDOW = vi ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const wp = stats.writing

  // Tổng tiến độ CEFR (trung bình % 4 cấp) — chỉ để hiển thị 1 con số tổng quan.
  const cefrOverall = cefr.length
    ? Math.round(cefr.reduce((s, l) => s + l.pct, 0) / cefr.length)
    : 0

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout streak={stats.streak} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        {/* Tiêu đề trang — ngay dưới AppHeader, cỡ chữ lớn */}
        <PageHeader
          title={vi ? 'Tiến độ học' : 'Your Progress'}
          subtitle={
            vi
              ? 'Chuỗi ngày, mục tiêu hôm nay và tiến độ lộ trình'
              : 'Streak, today’s goal and roadmap progress'
          }
        />

        {/* ── Streak + biểu đồ 7 ngày ─────────────────────────────────── */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.streak > 0 ? 'bg-orange-500/15' : 'bg-zinc-800'}`}
              >
                <Flame
                  className={`w-6 h-6 ${stats.streak > 0 ? 'text-orange-400' : 'text-zinc-400'}`}
                />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{stats.streak}</p>
                <p className="text-xs text-zinc-400 mt-1">{T.streakDays}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white leading-none">{stats.weekTotal}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {vi ? 'hoạt động / 7 ngày' : 'activities / 7 days'}
              </p>
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
                <span className="text-[11px] text-zinc-400">{dow[d.dow]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lịch hoạt động 5 tuần (heatmap) ─────────────────────────── */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-accent-400" />{' '}
              {vi ? 'Lịch hoạt động' : 'Activity calendar'}
            </h2>
            <span className="text-xs text-zinc-400">
              {stats.calendar.activeDays} {vi ? 'ngày / 5 tuần' : 'days / 5 weeks'}
            </span>
          </div>

          {/* Nhãn thứ */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WDOW.map((w, i) => (
              <span key={i} className="text-[11px] text-zinc-400 text-center">
                {w}
              </span>
            ))}
          </div>

          {/* Lưới ngày — ô đầu lệch cột theo thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1.5">
            {stats.calendar.days.map((d, idx) => (
              <div
                key={d.date}
                style={idx === 0 ? { gridColumnStart: stats.calendar.firstColumn + 1 } : undefined}
                className={`aspect-square rounded-[4px] ${heatColor(d.count)} ${d.date === stats.calendar.days[stats.calendar.days.length - 1]?.date ? 'ring-1 ring-accent-400/70' : ''}`}
                title={`${d.date}: ${d.count} ${vi ? 'hoạt động' : 'activities'}`}
              />
            ))}
          </div>

          {/* Chú thích đậm nhạt */}
          <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-zinc-400">
            <span>{vi ? 'Ít' : 'Less'}</span>
            <span className="w-3 h-3 rounded-[3px] bg-zinc-800/50" />
            <span className="w-3 h-3 rounded-[3px] bg-accent-900" />
            <span className="w-3 h-3 rounded-[3px] bg-accent-700" />
            <span className="w-3 h-3 rounded-[3px] bg-accent-500" />
            <span className="w-3 h-3 rounded-[3px] bg-accent-400" />
            <span>{vi ? 'Nhiều' : 'More'}</span>
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
              <span className="text-sm text-zinc-300">
                {vi ? 'Từ mới hôm nay' : 'New words today'}
              </span>
              <span className="text-sm font-semibold text-lime-300 theme-light:text-lime-800">
                {stats.learnedToday}/{stats.dailySpeed}
              </span>
            </div>
            <Bar pct={(stats.learnedToday / stats.dailySpeed) * 100} color="bg-lime-500" />
          </div>

          {/* Lượt dùng còn lại hôm nay */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: <MessageCircle className="w-4 h-4 text-accent-400" />,
                label: vi ? 'Chat' : 'Chat',
                used: stats.usage.chatCount,
                max: stats.limit.chat,
              },
              {
                icon: <Mic className="w-4 h-4 text-sky-400" />,
                label: vi ? 'Nói' : 'Speak',
                used: stats.usage.speakingCount,
                max: stats.limit.speaking,
              },
              {
                icon: <PenLine className="w-4 h-4 text-violet-400" />,
                label: vi ? 'Viết' : 'Write',
                used: stats.usage.writingCount,
                max: stats.limit.writing,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 text-center"
              >
                <div className="flex justify-center mb-1.5">{m.icon}</div>
                <p className="text-base font-bold text-white leading-none">
                  {m.used}
                  <span className="text-zinc-400 text-xs">/{m.max}</span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">{m.label}</p>
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
            <StatCard
              icon={<BookOpen className="w-5 h-5 text-amber-300" />}
              color="bg-amber-500/10"
              value={stats.learnedTotal}
              label={vi ? 'từ đã thuộc' : 'words learned'}
            />
            <StatCard
              icon={<RotateCcw className="w-5 h-5 text-teal-300" />}
              color="bg-teal-500/10"
              value={stats.srs.due}
              label={vi ? 'cần ôn hôm nay' : 'due to review'}
              sub={vi ? `${stats.srs.total} trong SRS` : `${stats.srs.total} in SRS`}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-lime-300" />}
              color="bg-lime-500/10"
              value={
                stats.path.total
                  ? `${Math.round((stats.path.done / stats.path.total) * 100)}%`
                  : '—'
              }
              label={vi ? 'lộ trình' : 'of path'}
              sub={ready ? `${stats.path.done}/${stats.path.total}` : '…'}
            />
          </div>
        </section>

        {/* ── Sổ lỗi cá nhân ──────────────────────────────────────────── */}
        {stats.mistakes.total > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-rose-400" />{' '}
              {vi ? 'Sổ lỗi của tôi' : 'Mistake Bank'}
            </h2>
            <button
              onClick={() => nav('/mistakes')}
              className="w-full bg-zinc-900/80 border border-zinc-800/80 hover:border-rose-500/40 rounded-2xl p-4 flex items-center justify-between transition group text-left"
            >
              <div>
                <p className="text-sm text-zinc-200">
                  {stats.mistakes.due > 0
                    ? vi
                      ? `${stats.mistakes.due} lỗi cần ôn hôm nay`
                      : `${stats.mistakes.due} mistakes to review`
                    : vi
                      ? 'Không có lỗi cần ôn hôm nay'
                      : 'No mistakes due today'}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {vi
                    ? `${stats.mistakes.total} lỗi đã ghi từ Chat · Viết · Nói`
                    : `${stats.mistakes.total} recorded from Chat · Writing · Speaking`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {stats.mistakes.due > 0 && (
                  <span className="text-sm font-bold text-rose-300 theme-light:text-rose-700 bg-rose-500/10 rounded-full w-8 h-8 flex items-center justify-center">
                    {stats.mistakes.due}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition" />
              </div>
            </button>
          </section>
        )}

        {/* ── Lộ trình CEFR ───────────────────────────────────────────── */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-400" />{' '}
              {vi ? 'Lộ trình CEFR' : 'CEFR Roadmap'}
            </h2>
            {cefr.length > 0 && (
              <span className="text-xs text-zinc-400">
                {vi ? 'Tổng' : 'Overall'} {cefrOverall}%
              </span>
            )}
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            {cefr.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-2">
                {vi ? 'Đang tải…' : 'Loading…'}
              </p>
            ) : (
              cefr.map((l) => {
                const c = ACCENT[l.accent]
                const exam = examMap[l.id]
                return (
                  <div key={l.id}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className={`font-semibold ${c.text} flex items-center gap-1.5`}>
                        {vi ? l.titleVi : l.titleEn}
                        {exam?.passed && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 theme-light:text-amber-800">
                            <GraduationCap className="w-2.5 h-2.5" />
                            {exam.bestPct}%
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-400 text-xs">
                        {l.doneWords}/{l.totalWords} {vi ? 'từ' : 'words'} · {l.pct}%
                      </span>
                    </div>
                    <Bar pct={l.pct} color={c.bar} />
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* ── Điểm IELTS luyện viết theo thời gian ─────────────────────── */}
        <section className="animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
            <PenLine className="w-4 h-4 text-violet-400" />{' '}
            {vi ? 'Điểm viết IELTS (ước lượng)' : 'IELTS writing score (estimated)'}
          </h2>

          {wp.count === 0 ? (
            <button
              onClick={() => nav('/writing')}
              className="w-full bg-zinc-900/80 border border-zinc-800/80 hover:border-violet-500/40 rounded-2xl p-5 text-center transition group"
            >
              <p className="text-sm text-zinc-400">
                {vi ? 'Chưa có bài viết nào được chấm.' : 'No graded essays yet.'}
              </p>
              <p className="text-xs text-violet-400 theme-light:text-violet-800 mt-1 group-hover:underline">
                {vi ? 'Viết bài đầu tiên →' : 'Write your first essay →'}
              </p>
            </button>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
              {/* 3 số tổng quan: gần nhất · cao nhất · trung bình */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className={`text-2xl font-bold leading-none ${bandText(wp.latest!)}`}>
                    {wp.latest}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">{vi ? 'gần nhất' : 'latest'}</p>
                </div>
                <div className="text-center border-x border-zinc-800">
                  <p className="text-2xl font-bold leading-none text-amber-300 flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {wp.best}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">{vi ? 'cao nhất' : 'best'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold leading-none text-zinc-200">{wp.avg}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{vi ? 'trung bình' : 'average'}</p>
                </div>
              </div>

              {/* Biểu đồ cột band qua các bài (tối đa 12 bài gần nhất), thang 0–9 */}
              <div>
                <p className="text-[11px] text-zinc-400 mb-2">
                  {vi ? `${wp.count} bài đã chấm` : `${wp.count} essays graded`}
                </p>
                <div className="flex items-end justify-between gap-1.5 h-24">
                  {wp.history.slice(-12).map((p, i) => (
                    <div
                      key={`${p.date}-${i}`}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${p.date}: ${p.overall}`}
                    >
                      <span className="text-[11px] text-zinc-400">{p.overall}</span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-md ${bandBar(p.overall)} transition-all`}
                          style={{ height: `${(p.overall / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Điểm trung bình từng tiêu chí — chỉ ra điểm mạnh / yếu */}
              {wp.components && (
                <div className="space-y-2 pt-1">
                  {[
                    {
                      label: vi ? 'Trả lời đề (TR)' : 'Task Response',
                      val: wp.components.task_response,
                    },
                    { label: vi ? 'Mạch lạc (CC)' : 'Coherence', val: wp.components.coherence },
                    { label: vi ? 'Từ vựng (LR)' : 'Lexical', val: wp.components.lexical },
                    { label: vi ? 'Ngữ pháp (GRA)' : 'Grammar', val: wp.components.grammar },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 w-28 shrink-0">{c.label}</span>
                      <div className="flex-1">
                        <Bar pct={(c.val / 9) * 100} color={bandBar(c.val)} />
                      </div>
                      <span className={`text-xs font-semibold w-6 text-right ${bandText(c.val)}`}>
                        {c.val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Tổng kết hoạt động ──────────────────────────────────────── */}
        <section className="animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            {vi ? 'Tổng kết' : 'All-time totals'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<MessageCircle className="w-5 h-5 text-accent-300" />}
              color="bg-accent-500/10"
              value={stats.chatN}
              label={vi ? 'phiên chat' : 'chat sessions'}
            />
            <StatCard
              icon={<Mic className="w-5 h-5 text-sky-300" />}
              color="bg-sky-500/10"
              value={stats.speakN}
              label={vi ? 'lượt luyện nói' : 'speaking turns'}
            />
            <StatCard
              icon={<PenLine className="w-5 h-5 text-violet-300" />}
              color="bg-violet-500/10"
              value={stats.writeN}
              label={vi ? 'bài đã chấm' : 'graded essays'}
            />
          </div>
        </section>

        {/* Hàng hành động nhanh ở đáy trang */}
        <QuickActions />
      </main>
    </div>
  )
}
