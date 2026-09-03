// apps/dhcb/src/components/Home/HomeAiBriefingCard.tsx — AI Companion Proactive Briefing Widget for Homepage
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Sun,
  Moon,
  Sunset,
  ArrowRight,
  Bot,
  Brain,
  Play,
  Flame,
  CheckCircle2,
  ChevronRight,
  Radio,
  Volume2,
} from 'lucide-react'
import { fetchProactiveBriefing } from '../../lib/proactiveBriefingApi'
import { speak } from '../../lib/tts'
import type { ProactiveBriefing } from '@dhcb/core-contracts/proactiveBriefing'
import { goToSubjects } from '../../lib/subjectsHost'

interface Props {
  userName?: string
  srsDueCount?: number
  dailyLearned?: number
  dailyMax?: number
  continueLessonLabel?: string
  continueLevelId?: string
  onContinueClick?: () => void
}

export default function HomeAiBriefingCard({
  userName,
  srsDueCount = 0,
  dailyLearned = 0,
  dailyMax = 20,
  continueLessonLabel,
  continueLevelId,
  onContinueClick,
}: Props) {
  const nav = useNavigate()
  const [briefing, setBriefing] = useState<ProactiveBriefing | null>(null)
  const [loading, setLoading] = useState(true)

  const currentHour = new Date().getHours()
  const isMorning = currentHour >= 5 && currentHour < 12
  const isAfternoon = currentHour >= 12 && currentHour < 18
  const timeOfDayGreeting = isMorning
    ? 'Chào buổi sáng'
    : isAfternoon
      ? 'Chào buổi chiều'
      : 'Chào buổi tối'

  const TimeIcon = isMorning ? Sun : isAfternoon ? Sunset : Moon
  const timeBadgeColor = isMorning
    ? 'bg-amber-500/15 text-amber-300 theme-light:text-amber-900 border-amber-500/30'
    : isAfternoon
      ? 'bg-orange-500/15 text-orange-300 theme-light:text-orange-900 border-orange-500/30'
      : 'bg-indigo-500/15 text-indigo-300 theme-light:text-indigo-800 border-indigo-500/30'

  useEffect(() => {
    let isMounted = true
    fetchProactiveBriefing()
      .then((data) => {
        if (isMounted) setBriefing(data)
      })
      .catch(() => {
        if (isMounted) setBriefing(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      aria-label="Bạn Đồng Hành AI Chào & Đề Xuất"
      className="relative overflow-hidden rounded-3xl border border-accent-500/30 bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-accent-950/40 p-5 sm:p-6 shadow-xl shadow-accent-500/5 backdrop-blur-md transition-all duration-300 animate-fade-up mb-4"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header: AI Companion Identity & Live Greeting */}
      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-accent-500/25 p-2.5">
              <Bot className="w-full h-full text-white" />
            </div>
            <span
              title="AI đang túc trực trực tuyến"
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${timeBadgeColor}`}
              >
                <TimeIcon className="w-3 h-3 shrink-0" />
                <span>{timeOfDayGreeting}</span>
              </span>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Gia Sư Điều Phối AI
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              {userName ? `${timeOfDayGreeting}, ${userName}!` : `${timeOfDayGreeting}, bạn!`}
            </h2>
          </div>
        </div>

        {/* Live Voice Shortcut */}
        <button
          onClick={() => nav('/ban-dong-hanh')}
          className="tap-44 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 border border-accent-500/30 text-accent-300 text-xs font-semibold transition-all shadow-sm active:scale-95 shrink-0"
          aria-label="Mở Không Gian Bạn Đồng Hành"
        >
          <Radio className="w-3.5 h-3.5 text-accent-400 animate-pulse" />
          <span className="hidden sm:inline">Live Studio</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic AI Socratic Message / Briefing Summary */}
      <div className="relative z-10 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-3.5 sm:p-4 mb-4">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-ping" />
            <span>AI đang tổng hợp tiến độ học tập và gợi ý mục tiêu hôm nay...</span>
          </div>
        ) : briefing ? (
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">{briefing.summary}</p>
              <button
                onClick={() => void speak(briefing.summary, 'vi-VN')}
                aria-label="Nghe giọng đọc bản tin"
                title="Nghe giọng đọc AI"
                className="tap-44 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-accent-300 border border-zinc-800 transition active:scale-95 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {briefing.insights && briefing.insights.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 flex items-center gap-2 text-xs text-emerald-400 theme-light:text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{briefing.insights[0]}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Hôm nay bạn đang duy trì chuỗi học tập rất tốt! Hãy bắt đầu với mục tiêu ưu tiên bên
              dưới để tối ưu hóa trí nhớ và phản xạ ngôn ngữ.
            </p>
            <button
              onClick={() =>
                void speak(
                  'Hôm nay bạn đang duy trì chuỗi học tập rất tốt! Hãy bắt đầu với mục tiêu ưu tiên bên dưới để tối ưu hóa trí nhớ và phản xạ ngôn ngữ.',
                  'vi-VN',
                )
              }
              aria-label="Nghe giọng đọc AI"
              title="Nghe giọng đọc AI"
              className="tap-44 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-accent-300 border border-zinc-800 transition active:scale-95 shrink-0"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Priority 1-Tap CTA Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Next Lesson or Priority Learning Action */}
        {continueLessonLabel ? (
          <button
            onClick={onContinueClick}
            className="tap-44 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-accent-500/30 hover:border-accent-500/60 text-left transition-all duration-200 active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-400 bg-accent-500/15 px-1.5 py-0.5 rounded border border-accent-500/20">
                    {continueLevelId || 'CEFR'}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">Học tiếp ngay</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                  {continueLessonLabel}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-accent-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        ) : (
          <button
            onClick={() => nav('/lo-trinh-hoc')}
            className="tap-44 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-accent-500/50 text-left transition-all duration-200 active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-lime-500/15 text-lime-400 theme-light:text-lime-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Lộ trình học</span>
                <p className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                  Khám phá lộ trình CEFR A1-C2
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        )}

        {/* Secondary Quick Action: SRS Review or STEM Solver */}
        {srsDueCount > 0 ? (
          <button
            onClick={() =>
              nav(
                continueLevelId
                  ? `/lo-trinh-hoc/${continueLevelId.toLowerCase()}?tab=srs`
                  : '/lo-trinh-hoc?tab=srs',
              )
            }
            className="tap-44 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-sky-500/30 hover:border-sky-500/60 text-left transition-all duration-200 active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 theme-light:text-sky-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Brain className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Cung điện Trí nhớ SRS</span>
                <p className="text-xs sm:text-sm font-semibold text-sky-300 theme-light:text-sky-900 truncate mt-0.5">
                  Ôn ngay {srsDueCount} thẻ đến hạn
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-400 theme-light:text-sky-900 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        ) : (
          <button
            onClick={() => goToSubjects(nav)}
            className="tap-44 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/50 text-left transition-all duration-200 active:scale-[0.98] group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 theme-light:text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Gia Sư Đa Môn AI</span>
                <p className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
                  Toán, Lý, Hóa, Sinh & Thực tế
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>
        )}
      </div>

      {/* Progress Footer Micro-Badges */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
            <span>
              Đã nạp:{' '}
              <strong className="text-zinc-200 font-semibold">
                {dailyLearned}/{dailyMax}
              </strong>{' '}
              từ hôm nay
            </span>
          </span>
        </div>

        <button
          onClick={() => nav('/tien-do')}
          className="text-xs text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1 transition"
        >
          <span>Xem Dashboard Tiến Độ</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </section>
  )
}
