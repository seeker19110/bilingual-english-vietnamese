// src/pages/Quests.tsx — Trang "Nhiệm vụ": gom hết các cách kiếm thêm hạn mức/ngày Pro vào 1
// nơi (streak học liên tiếp · thi đạt cấp CEFR · chia sẻ công khai · mời bạn). Dữ liệu đọc từ
// GET /api/quests (server tự tính lại mọi thứ, không tin số liệu client) — xem
// api/_lib/quests.ts để biết chi tiết + mức độ xác minh từng nhiệm vụ.
import { useEffect, useState } from 'react'
import { Flame, GraduationCap, Share2, Gift, Loader2, Check } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import ReferralSection from '../components/ReferralSection'
import { useLang } from '../context/useLang'
import { useToast } from '../context/ToastProvider'
import {
  fetchQuestsStatus,
  claimStreakQuest,
  claimCefrExamQuest,
  type QuestsStatus,
} from '../lib/quests'

function QuestCard({
  icon: Icon,
  title,
  description,
  status,
  action,
}: {
  icon: typeof Flame
  title: string
  description: string
  status: 'done' | 'ready' | 'locked'
  action?: React.ReactNode
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          status === 'ready' ? 'bg-accent-500/15' : 'bg-zinc-800'
        }`}
      >
        <Icon className={`w-5 h-5 ${status === 'ready' ? 'text-accent-400' : 'text-zinc-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  )
}

export default function Quests() {
  const { lang } = useLang()
  const isA = lang === 'vi'
  const toast = useToast()
  const [status, setStatus] = useState<QuestsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setStatus(await fetchQuestsStatus())
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleClaimStreak() {
    setClaiming('streak')
    const days = await claimStreakQuest()
    setClaiming(null)
    if (days) {
      toast.success(
        isA ? `Tuyệt vời! Tặng thêm ${days} ngày dùng gói Pro 🎁` : `Nice! +${days} day of Pro 🎁`,
      )
      void load()
    } else {
      toast.error(isA ? 'Chưa nhận được, thử lại sau nhé' : 'Could not claim right now')
    }
  }

  async function handleClaimCefr(level: QuestsStatus['cefrExams'][number]['level']) {
    setClaiming(`cefr-${level}`)
    const days = await claimCefrExamQuest(level)
    setClaiming(null)
    if (days) {
      toast.success(
        isA
          ? `Chúc mừng cấp ${level}! Tặng thêm ${days} ngày dùng gói Pro 🎁`
          : `Level ${level} — +${days} day of Pro 🎁`,
      )
      void load()
    } else {
      toast.error(isA ? 'Chưa nhận được, thử lại sau nhé' : 'Could not claim right now')
    }
  }

  const claimBtn = (label: string, key: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={claiming === key}
      className="tap-44 inline-flex items-center gap-1.5 bg-accent-500 hover:bg-accent-400 disabled:opacity-60 text-white text-xs font-medium px-3 py-2 rounded-lg transition active:scale-[0.97]"
    >
      {claiming === key && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {label}
    </button>
  )

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-4">
        <PageHeader
          title={isA ? 'Nhiệm vụ' : 'Quests'}
          subtitle={
            isA
              ? 'Hoàn thành nhiệm vụ để nhận thêm ngày dùng gói Pro miễn phí'
              : 'Complete quests to earn extra free days of Pro'
          }
        />

        {loading && (
          <div className="flex items-center justify-center py-16 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

        {!loading && !status && (
          <p className="text-sm text-zinc-400 text-center py-8">
            {isA ? 'Đăng nhập để xem nhiệm vụ nhé.' : 'Log in to see your quests.'}
          </p>
        )}

        {!loading && status && (
          <>
            <QuestCard
              icon={Flame}
              title={isA ? 'Học liên tiếp 5 ngày' : 'Learn 5 days in a row'}
              description={
                isA
                  ? `Streak hiện tại: ${status.streak.current}/${status.streak.required} ngày. Thưởng +${status.streak.rewardDays} ngày Pro, nhận lại được mỗi ${status.streak.cooldownDays} ngày.`
                  : `Current streak: ${status.streak.current}/${status.streak.required} days. +${status.streak.rewardDays} day of Pro, repeatable every ${status.streak.cooldownDays} days.`
              }
              status={status.streak.canClaim ? 'ready' : 'locked'}
              action={
                status.streak.canClaim
                  ? claimBtn(
                      isA ? 'Nhận thưởng' : 'Claim',
                      'streak',
                      () => void handleClaimStreak(),
                    )
                  : undefined
              }
            />

            {status.cefrExams
              .filter((e) => e.passed)
              .map((e) => (
                <QuestCard
                  key={e.level}
                  icon={GraduationCap}
                  title={isA ? `Đã thi đạt cấp ${e.level}` : `Passed level ${e.level}`}
                  description={
                    e.claimed
                      ? isA
                        ? 'Đã nhận thưởng cho cấp này.'
                        : 'Reward already claimed for this level.'
                      : isA
                        ? `Nhận +${e.rewardDays} ngày dùng gói Pro.`
                        : `Claim +${e.rewardDays} day of Pro.`
                  }
                  status={e.claimed ? 'done' : 'ready'}
                  action={
                    e.claimed ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        {isA ? 'Đã nhận' : 'Claimed'}
                      </span>
                    ) : (
                      claimBtn(
                        isA ? 'Nhận thưởng' : 'Claim',
                        `cefr-${e.level}`,
                        () => void handleClaimCefr(e.level),
                      )
                    )
                  }
                />
              ))}

            <QuestCard
              icon={Share2}
              title={isA ? 'Chia sẻ công khai' : 'Share publicly'}
              description={
                isA
                  ? `Bấm "Chia sẻ kết quả" ở màn chấm điểm Chat hoặc Thử thách và chọn nơi chia sẻ để nhận +${status.share.rewardDays} ngày Pro. Nhận lại được mỗi ${status.share.cooldownDays} ngày.`
                  : `Tap "Share result" on the Chat or Challenge score screen and pick where to share to get +${status.share.rewardDays} day of Pro. Repeatable every ${status.share.cooldownDays} days.`
              }
              status={status.share.canClaim ? 'ready' : 'locked'}
            />
          </>
        )}

        <QuestCard
          icon={Gift}
          title={isA ? 'Mời bạn cùng học' : 'Invite a friend'}
          description={
            isA
              ? 'Xem chi tiết mã mời và tiến độ thưởng bên dưới.'
              : 'See your invite code and progress below.'
          }
          status="ready"
        />
        <ReferralSection isA={isA} />
      </main>
    </div>
  )
}
