// ── Màn ăn mừng ĐẠT MỤC TIÊU TUẦN ────────────────────────────────────────────
// (② M1, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md)
// Hiện 1 LẦN/TUẦN khi số ngày học trong tuần chạm mục tiêu (gate:
// shouldCelebrateWeeklyGoal ở nơi gọi — giống cơ chế StreakCelebration).
// Trung thực: hàng chấm T2→CN hiện ĐÚNG ngày có học; ngày chưa tới trong tuần
// hiện ô mờ — không vẽ ✓ giả.

import Celebration from './Celebration'
import { getWeeklyProgress, getWeekDays } from '../lib/weeklyGoal'

// Nhãn thứ bắt đầu từ Thứ 2 (tuần mục tiêu tính từ T2 → CN).
const DOW_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const DOW_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function WeeklyGoalCelebration({
  uid,
  isA,
  onDone,
}: {
  uid: string
  isA: boolean
  onDone: () => void
}) {
  const p = getWeeklyProgress(uid)
  const days = getWeekDays(uid) // T2 → hôm nay; ngày sau hôm nay chưa có phần tử
  const labels = isA ? DOW_VI : DOW_EN

  return (
    <Celebration
      icon="🎯"
      title={isA ? 'Đạt mục tiêu tuần!' : 'Weekly goal reached!'}
      subtitle={
        isA
          ? `Bạn đã học ${p.daysDone}/${p.goal} ngày tuần này — đều đặn chính là sức mạnh!`
          : `You studied ${p.daysDone}/${p.goal} days this week — consistency is power!`
      }
      ctaLabel={isA ? 'Tuyệt vời' : 'Awesome'}
      onDone={onDone}
    >
      {/* Hàng 7 chấm T2→CN — chấm hôm nay (cuối phần đã trôi qua) pop nổi bật */}
      <div className="flex justify-center gap-2.5" aria-hidden="true">
        {labels.map((label, i) => {
          const d = days[i] // undefined = ngày chưa tới trong tuần
          const isToday = i === days.length - 1
          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  d?.active
                    ? 'bg-accent-500 text-black'
                    : d
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                      : 'bg-zinc-900 border border-zinc-800' // ngày chưa tới — ô mờ
                } ${isToday ? 'animate-pop-correct ring-2 ring-accent-400/60' : ''}`}
              >
                {d?.active ? '✓' : ''}
              </span>
              <span
                className={`text-[10px] ${isToday ? 'text-accent-400 font-bold' : 'text-zinc-500'}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </Celebration>
  )
}
