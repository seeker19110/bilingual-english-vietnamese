import { useState, useEffect } from 'react'
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
  Award,
  Volume2,
  VolumeX,
  Users,
  Gift,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import VoicePicker from '../components/VoicePicker'
import ReferralSection from '../components/ReferralSection'
import QuestsPanel from '../components/QuestsPanel'
import EmailVerifySection from '../components/EmailVerifySection'
import UpgradeSection from '../components/UpgradeSection'
import PricePromoBanner from '../components/PricePromoBanner'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import { useToast } from '@core/ToastProvider'
import { useCloudSync } from '../lib/useCloudSync'
import { getStreak, getDirection } from '../lib/storage'
import { getLearnedCount } from '../lib/vocab'
import { getDailySpeed, setDailySpeed, DAILY_SPEEDS, type DailySpeed } from '../lib/curriculum'
import { getWeeklyGoal, setWeeklyGoal, WEEKLY_GOALS, type WeeklyGoal } from '../lib/weeklyGoal'
import { isSoundEnabled, setSoundEnabled, sound } from '../lib/sound'
import { useOnboarding, pushAgeGroup } from '../lib/onboarding'
import {
  checkNewAchievements,
  achievementMessage,
  getEarnedAchievements,
} from '../lib/achievements'
import {
  fetchAchievementRewards,
  claimAchievementReward,
  type AchievementRewardStatus,
} from '../lib/achievementRewards'
import { ACHIEVEMENTS } from '../data/achievements'
import { logout } from '../lib/auth'
import type { AgeGroup } from '../types'

const AGE_GROUP_OPTIONS: { value: AgeGroup; emoji: string; vi: string; en: string }[] = [
  { value: 'nhi_dong', emoji: '🧸', vi: 'Nhi đồng (<10)', en: 'Kids (<10)' },
  { value: 'thieu_nien', emoji: '🎒', vi: 'Thiếu niên (10–15)', en: 'Teens (10–15)' },
  { value: 'thanh_nien', emoji: '🎓', vi: 'Thanh niên (16–22)', en: 'Young adult (16–22)' },
  { value: 'nguoi_lon', emoji: '💼', vi: 'Người lớn (23+)', en: 'Adult (23+)' },
]

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
  const { user, refresh } = useAuth()
  const { T } = useLang()
  const toast = useToast()
  useCloudSync(user?.id) // kéo lượt dùng mới nhất từ Supabase
  const [speed, setSpeed] = useState<DailySpeed>(() => getDailySpeed(user?.id ?? ''))
  const [weekGoal, setWeekGoal] = useState<WeeklyGoal>(() => getWeeklyGoal(user?.id ?? ''))
  const [earned, setEarned] = useState<Set<string>>(() => getEarnedAchievements(user?.id ?? ''))
  const [rewards, setRewards] = useState<AchievementRewardStatus[] | null>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled())
  const [questsOpen, setQuestsOpen] = useState(false)
  const onboardingData = useOnboarding(user?.id)
  const [ageGroup, setAgeGroupState] = useState<AgeGroup>('nguoi_lon')

  // Backfill lúc mở trang: bắt các huy hiệu đã đủ điều kiện nhưng chưa từng được
  // ghi nhận (vd người dùng cũ đạt streak_7 TRƯỚC khi tính năng này ra mắt) —
  // vẫn báo toast, không bỏ lỡ niềm vui chỉ vì thứ tự trang ghé thăm.
  useEffect(() => {
    if (!user) return
    const isA = getDirection() === 'A'
    const fresh = checkNewAchievements(user.id)
    if (fresh.length > 0) {
      setEarned(getEarnedAchievements(user.id))
      for (const a of fresh) toast.success(achievementMessage(a, isA))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Phần thưởng huy hiệu (② quyết định 2026-08-03) — server tự xác minh lại "đã đạt" nên tải
  // riêng, không dựa vào `earned` (tính ở client, chỉ để hiển thị UI ngay).
  useEffect(() => {
    if (!user) return
    void fetchAchievementRewards().then(setRewards)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function handleClaimReward(id: string) {
    setClaimingId(id)
    const result = await claimAchievementReward(id)
    setClaimingId(null)
    if (result) {
      const planLabel = result.rewardPlan === 'vip' ? 'VIP' : 'Pro'
      toast.success(
        isA
          ? `Tuyệt vời! Tặng thêm ${result.rewardDays} ngày gói ${planLabel} 🎁`
          : `Nice! +${result.rewardDays} day of ${planLabel} 🎁`,
      )
      void fetchAchievementRewards().then(setRewards)
    } else {
      toast.error(isA ? 'Chưa nhận được, thử lại sau nhé' : 'Could not claim right now')
    }
  }

  // Đồng bộ state hiển thị khi cache/fetch onboarding có dữ liệu (có thể tới sau lần
  // render đầu nếu thiết bị mới chưa có cache local).
  useEffect(() => {
    if (onboardingData) setAgeGroupState(onboardingData.ageGroup)
  }, [onboardingData])

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

  // Đổi nhóm tuổi (kế hoạch "giao diện + nội dung theo độ tuổi", GĐ 1) — đổi state ngay
  // để UI mượt, đẩy lên server kiểu "bắn rồi quên" như tốc độ học/mục tiêu tuần.
  function chooseAgeGroup(a: AgeGroup) {
    if (!user) return
    setAgeGroupState(a)
    void pushAgeGroup(user.id, a)
  }

  // Bật/tắt âm thanh phản hồi UI (V-6) — bật thử ngay 1 tiếng "đúng" để nghe được hiệu ứng.
  function chooseSound(enabled: boolean) {
    setSoundEnabled(enabled)
    setSoundOn(enabled)
    if (enabled) sound.correct()
  }

  async function handleLogout() {
    await logout()
    // Giai đoạn B: không còn onAuthStateChange của Supabase tự bắn sự kiện SIGNED_OUT —
    // phải tự refresh() để AuthProvider cập nhật user=null trước khi điều hướng, nếu không
    // Login.tsx (thấy user cũ còn trong context) sẽ redirect ngược lại '/' → màn hình trống.
    await refresh()
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
                user.plan === 'vip'
                  ? 'bg-violet-500/15 text-violet-300 theme-light:text-violet-800 border border-violet-500/20'
                  : user.plan === 'pro'
                    ? 'bg-amber-500/15 text-amber-300 theme-light:text-amber-800 border border-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {user.plan === 'vip' ? T.planVip : user.plan === 'pro' ? T.planPro : T.planFree}
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

        {/* Nhóm tuổi (kế hoạch "giao diện + nội dung theo độ tuổi", GĐ 1) */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-semibold text-white">
              {isA ? 'Nhóm tuổi' : 'Age group'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AGE_GROUP_OPTIONS.map((a) => (
              <button
                key={a.value}
                onClick={() => chooseAgeGroup(a.value)}
                aria-pressed={ageGroup === a.value}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium border transition ${
                  ageGroup === a.value
                    ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-lg shrink-0">{a.emoji}</span>
                <span className="text-left">{isA ? a.vi : a.en}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            {isA
              ? 'Giúp app hiển thị giao diện và nội dung phù hợp với bạn hơn.'
              : 'Helps the app show a more suitable look and content for you.'}
          </p>
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

        {/* Nhiệm vụ — mở NGAY tại chỗ (không sang trang riêng /quests nữa), có nút chia sẻ/chép
            link mời ngay trong khối để dễ lan truyền. Nội dung dùng chung với trang /quests qua
            QuestsPanel.tsx (trang /quests vẫn giữ để có link riêng chia sẻ được). */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <button
            type="button"
            onClick={() => setQuestsOpen((v) => !v)}
            aria-expanded={questsOpen}
            className="tap-44 w-full flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{isA ? 'Nhiệm vụ' : 'Quests'}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isA ? 'Kiếm thêm ngày dùng gói Pro miễn phí' : 'Earn extra free days of Pro'}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${questsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {questsOpen && (
            <div className="mt-4 pt-4 border-t border-zinc-800/80">
              <QuestsPanel isA={isA} userId={user.id} />
            </div>
          )}
        </section>

        {/* Băng khuyến mãi % (nếu đang chạy) — ngay trên phần nâng cấp */}
        <PricePromoBanner isA={isA} />

        {/* Nâng cấp Pro/VIP qua SePay — ẩn nếu đã VIP (xem UpgradeSection.tsx) */}
        <UpgradeSection isA={isA} currentPlan={user.plan} />

        {/* Xác thực email — chỉ hiện khi CHƯA xác thực; mở khoá thưởng mời bạn */}
        {user.emailVerified === false && (
          <EmailVerifySection
            isA={isA}
            currentEmail={user.email}
            onVerified={() => void refresh()}
          />
        )}

        {/* Mời bạn cùng học — thưởng ngày gói Pro cho cả 2 bên (xem api/_lib/referral.ts) */}
        <ReferralSection isA={isA} />

        {/* Chọn giọng đọc — 14 giọng Chirp3-HD, áp dụng toàn cục */}
        <VoicePicker plan={user.plan} isA={isA} />

        {/* Âm thanh phản hồi UI (V-6) — đúng/sai/đạt mốc */}
        <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-accent-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-accent-400" />
            )}
            <span className="text-sm font-semibold text-white">
              {isA ? 'Âm thanh khi học' : 'Study sound effects'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => chooseSound(true)}
              aria-pressed={soundOn}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition ${
                soundOn
                  ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <Volume2 className="w-4 h-4" /> {isA ? 'Bật' : 'On'}
            </button>
            <button
              onClick={() => chooseSound(false)}
              aria-pressed={!soundOn}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition ${
                !soundOn
                  ? 'bg-accent-500/20 border-accent-500/60 text-accent-300 theme-light:text-accent-800'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <VolumeX className="w-4 h-4" /> {isA ? 'Tắt' : 'Off'}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            {isA
              ? 'Tiếng "ting" nhỏ khi trả lời đúng/sai và khi đạt mốc (streak, huy hiệu). Không cần tải gì thêm.'
              : 'A small "ting" when you answer right/wrong and when you hit a milestone (streak, achievements). No download needed.'}
          </p>
        </section>

        {/* Huy hiệu & mốc (② M2) */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              {isA ? 'Huy hiệu & mốc' : 'Achievements'}
            </h2>
            <span className="text-xs text-zinc-400">
              {earned.size}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 grid grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const has = earned.has(a.id)
              const name = isA ? a.nameVi : a.nameEn
              return (
                <div key={a.id} className="flex flex-col items-center gap-1 text-center">
                  <span
                    title={name}
                    aria-label={`${name}${has ? (isA ? ' — đã đạt' : ' — earned') : isA ? ' — chưa đạt' : ' — locked'}`}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 ${
                      has
                        ? 'bg-amber-500/15 border border-amber-500/40'
                        : 'bg-zinc-900/60 border border-zinc-800/60 opacity-40 grayscale'
                    }`}
                  >
                    {a.icon}
                  </span>
                  <span className="text-[10px] text-zinc-400 text-center leading-tight line-clamp-2">
                    {name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Phần thưởng huy hiệu (② quyết định 2026-08-03) — chỉ hiện huy hiệu đã đạt, CÓ
              thưởng (admin bật + số ngày > 0, xem AdminAchievementRewardsPanel) và CHƯA nhận —
              server tự xác minh lại "đã đạt" lúc bấm Nhận thưởng, không tin danh sách `earned`
              tính ở client. */}
          {rewards &&
            rewards.some(
              (r) => r.earned && !r.claimed && r.reward.enabled && r.reward.rewardDays > 0,
            ) && (
              <div className="mt-3 space-y-2">
                {rewards
                  .filter(
                    (r) => r.earned && !r.claimed && r.reward.enabled && r.reward.rewardDays > 0,
                  )
                  .map((r) => {
                    const def = ACHIEVEMENTS.find((a) => a.id === r.id)
                    if (!def) return null
                    const name = isA ? def.nameVi : def.nameEn
                    const planLabel = r.reward.rewardPlan === 'vip' ? 'VIP' : 'Pro'
                    return (
                      <div
                        key={r.id}
                        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3"
                      >
                        <span className="text-lg shrink-0">{def.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{name}</p>
                          <p className="text-xs text-amber-300 mt-0.5 flex items-center gap-1">
                            <Gift className="w-3 h-3" />
                            {isA
                              ? `+${r.reward.rewardDays} ngày gói ${planLabel}`
                              : `+${r.reward.rewardDays} day of ${planLabel}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleClaimReward(r.id)}
                          disabled={claimingId === r.id}
                          className="tap-44 inline-flex items-center gap-1.5 bg-accent-500 hover:bg-accent-400 disabled:opacity-60 text-white text-xs font-medium px-3 py-2 rounded-lg transition active:scale-[0.97] shrink-0"
                        >
                          {claimingId === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {isA ? 'Nhận thưởng' : 'Claim'}
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}
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

        {/* Cấu hình hệ thống — chỉ hiện với admin thật (cờ isAdmin do server tính từ
            ADMIN_EMAILS, trả về ở /api/auth?action=me). Chỉ để ẩn UI khỏi người dùng thường —
            mọi API admin vẫn TỰ kiểm lại quyền phía server, không tin cờ này. */}
        {user?.isAdmin && (
          <button
            onClick={() => nav('/admin-s')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition text-xs font-medium animate-fade-in"
          >
            Quản trị hệ thống (Admin)
          </button>
        )}

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
