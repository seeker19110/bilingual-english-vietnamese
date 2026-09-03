// apps/dhcb/src/components/Home/HomeAiBriefingCard.tsx — Thẻ "Bạn Đồng Hành AI" mở đầu trang chủ:
// lời chào + bản tin ngắn + ĐÚNG HAI việc nên làm tiếp.
//
// [2026-09-03, đợt C thiết kế lại UI/UX] Viết lại phần trình bày cho "tập trung vào việc học":
// gỡ 2 quầng sáng blur nền, gradient + bóng màu accent, chấm "đang trực tuyến" nhấp nháy vĩnh
// viễn, nhãn HOA nhỏ giãn chữ, và nút "Live Studio" (header đã có nút Bạn Đồng Hành trên mọi
// trang). Thẻ nay là MỘT bề mặt phẳng, bên trong phân tách bằng khoảng cách + đường kẻ, không
// lồng thẻ trong thẻ (luật 4 mục 9 của `.agents/skills/ui-ux-craftsman`).
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Bot,
  Brain,
  Play,
  Flame,
  CheckCircle2,
  ChevronRight,
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

// Câu dự phòng khi API bản tin lỗi/chưa có — vẫn cho nghe được bằng giọng.
const FALLBACK_SUMMARY =
  'Hôm nay bạn đang duy trì chuỗi học tập rất tốt! Hãy bắt đầu với việc ưu tiên bên dưới để tối ưu hóa trí nhớ và phản xạ ngôn ngữ.'

// Một nút "việc tiếp theo" — dùng chung cho cả hai ô để hai ô luôn cùng khuôn.
const ACTION_BUTTON =
  'tap-44 flex items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-800/60 hover:bg-zinc-800 text-left transition-colors duration-200 active:scale-[0.98] group'

function timeOfDayGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Chào buổi sáng'
  if (hour >= 12 && hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
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

  const greeting = timeOfDayGreeting(new Date().getHours())

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

  const summary = briefing?.summary ?? FALLBACK_SUMMARY
  const insight = briefing?.insights?.[0]

  return (
    <section
      aria-label="Bạn Đồng Hành AI chào và đề xuất"
      className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 animate-fade-up"
    >
      {/* Đầu thẻ: danh tính + lời chào */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-accent-500/15 text-accent-400 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Bạn Đồng Hành AI
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            {userName ? `${greeting}, ${userName}!` : `${greeting}, bạn!`}
          </p>
        </div>
      </div>

      {/* Bản tin ngắn — tách khỏi đầu thẻ bằng khoảng cách, không bọc thêm thẻ con */}
      <div className="mt-4">
        {loading ? (
          // Skeleton tải: chỗ DUY NHẤT `animate-pulse` hợp lệ trong thẻ này (luật 6 mục 9).
          <div aria-live="polite" className="space-y-2" aria-label="Đang tải bản tin">
            <div className="h-3.5 rounded bg-zinc-800 animate-pulse w-11/12" />
            <div className="h-3.5 rounded bg-zinc-800 animate-pulse w-2/3" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-zinc-200 leading-relaxed read-measure">{summary}</p>
              <button
                onClick={() => void speak(summary, 'vi-VN')}
                aria-label="Nghe giọng đọc bản tin"
                title="Nghe giọng đọc AI"
                className="tap-44 p-1.5 rounded-lg text-zinc-400 hover:text-accent-300 hover:bg-zinc-800 transition active:scale-95 shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {insight && (
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-400 theme-light:text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{insight}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* Hai việc nên làm tiếp — đúng hai, không hơn */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {continueLessonLabel ? (
          <button onClick={onContinueClick} className={ACTION_BUTTON}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 text-accent-400 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">
                  Học tiếp{continueLevelId ? ` · ${continueLevelId}` : ''}
                </span>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  {continueLessonLabel}
                </p>
              </div>
            </div>
            <ArrowRight
              className="w-4 h-4 text-accent-400 group-hover:translate-x-1 transition-transform shrink-0"
              aria-hidden="true"
            />
          </button>
        ) : (
          <button onClick={() => nav('/lo-trinh-hoc')} className={ACTION_BUTTON}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-lime-500/15 text-lime-400 theme-light:text-lime-900 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Lộ trình học</span>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  Khám phá lộ trình CEFR A1–C2
                </p>
              </div>
            </div>
            <ArrowRight
              className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0"
              aria-hidden="true"
            />
          </button>
        )}

        {srsDueCount > 0 ? (
          <button
            onClick={() =>
              nav(
                continueLevelId
                  ? `/lo-trinh-hoc/${continueLevelId.toLowerCase()}?tab=srs`
                  : '/lo-trinh-hoc?tab=srs',
              )
            }
            className={ACTION_BUTTON}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 theme-light:text-sky-900 flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Ôn tập SRS</span>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  Ôn {srsDueCount} thẻ đến hạn
                </p>
              </div>
            </div>
            <ArrowRight
              className="w-4 h-4 text-sky-400 theme-light:text-sky-900 group-hover:translate-x-1 transition-transform shrink-0"
              aria-hidden="true"
            />
          </button>
        ) : (
          <button onClick={() => goToSubjects(nav)} className={ACTION_BUTTON}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 theme-light:text-blue-800 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Gia sư đa môn</span>
                <p className="text-sm font-semibold text-white truncate mt-0.5">
                  Toán, Lý, Hóa, Sinh
                </p>
              </div>
            </div>
            <ArrowRight
              className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-transform shrink-0"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Chân thẻ: một con số hôm nay + đường sang bảng tiến độ */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-3 border-t border-zinc-800 text-sm text-zinc-400">
        <span>
          Hôm nay đã học{' '}
          <strong className="text-zinc-200 font-semibold">
            {dailyLearned}/{dailyMax}
          </strong>{' '}
          từ
        </span>
        <button
          onClick={() => nav('/tien-do')}
          className="tap-44-y text-sm text-accent-400 theme-light:text-accent-800 hover:text-accent-300 font-medium flex items-center gap-1 transition"
        >
          <span>Xem tiến độ</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
