import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  History as HistoryIcon,
  LogOut,
  Mail,
  Flame,
  BookOpen,
  Gauge,
  CalendarCheck,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { useCloudSync } from '../lib/useCloudSync'
import { getStreak, getDirection } from '../lib/storage'
import { getLearnedCount } from '../lib/vocab'
import { getDailySpeed, setDailySpeed, DAILY_SPEEDS, type DailySpeed } from '../lib/curriculum'
import { getWeeklyGoal, setWeeklyGoal, WEEKLY_GOALS, type WeeklyGoal } from '../lib/weeklyGoal'
import { logout } from '../lib/auth'

const SPEED_LABEL: Record<DailySpeed, { vi: string; en: string }> = {
  5: { vi: 'Nhẹ nhàng', en: 'Light' },
  10: { vi: 'Vừa', en: 'Regular' },
  20: { vi: 'Nhanh', en: 'Fast' },
}

// Nhãn mục tiêu tuần (số NGÀY học/tuần — ② M1, dac-ta-nang-cap-su-pham-2026-07-15.md).
const GOAL_LABEL: Record<WeeklyGoal, { vi: string; en: string }> = {
  3: { vi: 'Thoải mái', en: 'Relaxed' },
  5: { vi: 'Đều đặn', en: 'Steady' },
  7: { vi: 'Mỗi ngày', en: 'Every day' },
}

export default function Profile() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T } = useLang()
  useCloudSync(user?.id) // kéo lượt dùng mới nhất từ Supabase
  const [speed, setSpeed] = useState<DailySpeed>(() => getDailySpeed(user?.id ?? ''))
  const [weekGoal, setWeekGoal] = useState<WeeklyGoal>(() => getWeeklyGoal(user?.id ?? ''))

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  const isA = getDirection() === 'A'
  const streak = getStreak(user.id)
  const learned = getLearnedCount(user.id)

  function chooseSpeed(s: DailySpeed) {
    if (!user) return
    setDailySpeed(user.id, s)
    setSpeed(s)
  }

  function chooseWeekGoal(g: WeeklyGoal) {
    if (!user) return
    setWeeklyGoal(user.id, g)
    setWeekGoal(g)
  }

  async function handleLogout() {
    await logout()
    nav('/login')
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout streak={streak} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={isA ? 'Hồ sơ cá nhân' : 'Profile'}
          subtitle={
            isA
              ? 'Thông tin tài khoản và tiến độ học của bạn'
              : 'Your account info and learning progress'
          }
        />

        {/* Thông tin người dùng */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 flex items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center text-2xl font-bold text-white shadow-md shadow-accent-500/30 shrink-0">
            {user.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-lg truncate">{user.name}</p>
            <p className="text-sm text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {user.email}
            </p>
            <span
              className={`inline-block mt-2 text-[11px] px-2.5 py-1 rounded-full font-medium ${
                user.plan === 'pro'
                  ? 'bg-amber-500/15 text-amber-300 theme-light:text-amber-800 border border-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {user.plan === 'pro' ? T.planPro : T.planFree}
            </span>
          </div>
        </section>

        {/* Số liệu nhanh: streak + từ đã học */}
        <section className="grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${streak > 0 ? 'bg-orange-500/15' : 'bg-zinc-800'}`}
            >
              <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-400' : 'text-zinc-400'}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-none">{streak}</p>
              <p className="text-xs text-zinc-400 mt-1">{T.streakDays}</p>
            </div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-white leading-none">{learned}</p>
              <p className="text-xs text-zinc-400 mt-1">{isA ? 'từ đã thuộc' : 'words learned'}</p>
            </div>
          </div>
        </section>

        {/* Tốc độ học: số từ mới/ngày */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-semibold text-white">
              {isA ? 'Tốc độ học (từ mới/ngày)' : 'Learning speed (new words/day)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DAILY_SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => chooseSpeed(s)}
                aria-pressed={speed === s}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl text-sm font-medium border transition ${
                  speed === s
                    ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base font-bold">{s}</span>
                <span className="text-[11px]">{isA ? SPEED_LABEL[s].vi : SPEED_LABEL[s].en}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            {isA
              ? 'Đổi tốc độ chỉ áp dụng cho các batch từ mới tiếp theo, không ảnh hưởng từ đã học.'
              : 'Changing speed only affects upcoming batches, not words already learned.'}
          </p>
        </section>

        {/* Mục tiêu tuần: số ngày học/tuần (② M1) — vòng tiến độ hiện ở /progress */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-semibold text-white">
              {isA ? 'Mục tiêu tuần (số ngày học/tuần)' : 'Weekly goal (study days/week)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WEEKLY_GOALS.map((g) => (
              <button
                key={g}
                onClick={() => chooseWeekGoal(g)}
                aria-pressed={weekGoal === g}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl text-sm font-medium border transition ${
                  weekGoal === g
                    ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-base font-bold">{g}</span>
                <span className="text-[11px]">{isA ? GOAL_LABEL[g].vi : GOAL_LABEL[g].en}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            {isA
              ? 'Tuần tính từ Thứ 2. Ngày có học bất kỳ hoạt động nào (từ vựng, chat, viết, nói) đều được tính — cùng luật với chuỗi ngày.'
              : 'Weeks start on Monday. Any study activity (vocab, chat, writing, speaking) counts — same rule as your streak.'}
          </p>
        </section>

        {/* Điều hướng nhanh */}
        <section className="space-y-3 animate-fade-in">
          <button
            onClick={() => nav('/progress')}
            aria-label={isA ? 'Xem tiến độ học' : 'View progress'}
            className="w-full bg-zinc-900/80 border border-zinc-800/80 hover:border-accent-500/40 rounded-2xl p-4 flex items-center gap-4 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0 transition group-hover:scale-105">
              <TrendingUp className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-white text-[15px]">
                {isA ? 'Xem tiến độ học' : 'View progress'}
              </p>
              <p className="text-sm text-zinc-400 truncate">
                {isA
                  ? 'Streak, từ vựng, lộ trình CEFR, điểm viết'
                  : 'Streak, vocabulary, CEFR roadmap, writing scores'}
              </p>
            </div>
          </button>

          <button
            onClick={() => nav('/history')}
            aria-label={isA ? 'Xem lịch sử học' : 'View learning history'}
            className="w-full bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-4 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 transition group-hover:scale-105">
              <HistoryIcon className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-white text-[15px]">
                {isA ? 'Lịch sử học' : 'Learning history'}
              </p>
              <p className="text-sm text-zinc-400 truncate">
                {isA
                  ? 'Các phiên chat, viết, nói trước đây'
                  : 'Past chat, writing and speaking sessions'}
              </p>
            </div>
          </button>
        </section>

        {/* Hàng hành động nhanh (Chia sẻ/Nhắc học) — dời từ các trang luyện tập/nội
            dung sang đây theo U-5 (docs/research/cai-tien-ui-ux.md), tránh lặp lại
            ở mọi trang giờ đã có bottom-nav để điều hướng nhanh. */}
        <QuickActions />

        {/* Đăng xuất */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/25 text-red-400 theme-light:text-red-700 hover:bg-red-500/10 transition text-sm font-medium animate-fade-in"
        >
          <LogOut className="w-4 h-4" /> {T.logout}
        </button>
      </main>
    </div>
  )
}
