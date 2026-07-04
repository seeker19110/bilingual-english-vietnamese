import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, History as HistoryIcon, LogOut, Mail, Flame, BookOpen } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { useCloudSync } from '../lib/useCloudSync'
import { getStreak, getDirection } from '../lib/storage'
import { getLearnedCount } from '../lib/vocab'
import { logout } from '../lib/auth'
import {
  DAILY_GOAL_OPTIONS,
  getDailyGoal,
  setDailyGoal,
  type DailyGoalOption,
} from '../lib/curriculum'

const PACE_LABEL: Record<DailyGoalOption, { vi: string; en: string }> = {
  5: { vi: 'Nhẹ nhàng', en: 'Gentle' },
  10: { vi: 'Vừa', en: 'Moderate' },
  20: { vi: 'Nhanh', en: 'Fast' },
}

export default function Profile() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T } = useLang()
  useCloudSync(user?.id) // kéo lượt dùng mới nhất từ Supabase
  const [goal, setGoal] = useState<DailyGoalOption | null>(null)

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  const isA = getDirection() === 'A'
  const uid = user.id
  const streak = getStreak(uid)
  const learned = getLearnedCount(uid)
  // goal đọc lười (không phải useState(() => ...)) vì getDailyGoal() có thể TỰ GHI
  // giá trị mặc định lần đầu (side effect) — tránh gọi trong initializer render đầu.
  const currentGoal = goal ?? getDailyGoal(uid)

  function pickGoal(n: DailyGoalOption) {
    setDailyGoal(uid, n)
    setGoal(n)
  }

  async function handleLogout() {
    await logout()
    nav('/login')
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout streak={streak} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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

        {/* Tốc độ học từ mới */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <p className="font-semibold text-white text-[15px]">
            {isA ? 'Tốc độ học từ mới' : 'New word pace'}
          </p>
          <p className="text-sm text-zinc-400 mt-0.5 mb-3">
            {isA
              ? 'Số từ mới mỗi lượt — mở thêm bằng kiểm tra, tối đa 5 lượt/ngày'
              : 'New words per round — unlock more via quiz, up to 5 rounds/day'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DAILY_GOAL_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => pickGoal(n)}
                aria-pressed={currentGoal === n}
                className={`py-2.5 rounded-xl text-sm font-medium border transition ${
                  currentGoal === n
                    ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                {n} · {isA ? PACE_LABEL[n].vi : PACE_LABEL[n].en}
              </button>
            ))}
          </div>
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
