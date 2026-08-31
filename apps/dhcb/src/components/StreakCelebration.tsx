// ── Khoảnh khắc STREAK — "đỉnh" cảm xúc của ngày học ─────────────────────────
// (V-2, docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md — E2)
// Hiện 1 LẦN/NGÀY sau khi hoàn thành batch đầu tiên (gate: shouldCelebrateStreak
// ở nơi gọi). Nội dung: 🔥 streak + hàng 7 chấm tuần + câu động viên theo mốc.
// Trung thực: hàng chấm tuần hiện ĐÚNG ngày có học/nghỉ (ngày được vé-nghỉ bắc
// cầu vẫn hiện là chấm rỗng — không vẽ ✓ giả).

import Celebration from './Celebration'
import { getStreak } from '../lib/storage'
import { getActivity7Days } from '../lib/stats'

// Nhãn thứ trong tuần theo getDay(): 0 = Chủ nhật … 6 = Thứ bảy
const DOW_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const DOW_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Câu động viên theo mốc streak (mốc lớn có câu riêng — cảm giác tiến bộ thật)
function subtitleFor(streak: number, isA: boolean): string {
  const marks: [number, string, string][] = [
    [
      100,
      ' 100 ngày — kiên trì phi thường, bạn là số ít làm được điều này!',
      '100 days — extraordinary persistence!',
    ],
    [
      30,
      '1 tháng liên tục — thói quen đã hình thành rồi đó!',
      'A full month — the habit is real now!',
    ],
    [
      14,
      '2 tuần liên tục — não bạn đang quen dần với tiếng Anh mỗi ngày!',
      'Two weeks straight — your brain is settling into English!',
    ],
    [
      7,
      'Tròn 1 tuần — đều đặn thế này từ vựng sẽ ở lại rất lâu!',
      'A full week — consistency makes it stick!',
    ],
    [3, '3 ngày liên tiếp — khởi đầu thói quen tốt!', '3 days in a row — a great start!'],
  ]
  for (const [n, vi, en] of marks) if (streak === n) return isA ? vi : en
  if (streak <= 1)
    return isA
      ? 'Ngày đầu tiên của chuỗi mới — hẹn mai gặp lại nhé!'
      : 'Day one of a new streak — see you tomorrow!'
  return isA
    ? 'Học mỗi ngày một chút — bền hơn học dồn rất nhiều!'
    : 'A little every day beats cramming!'
}

export default function StreakCelebration({
  uid,
  isA,
  onDone,
}: {
  uid: string
  isA: boolean
  onDone: () => void
}) {
  const streak = getStreak(uid)
  const week = getActivity7Days(uid) // cũ → mới, phần tử cuối = hôm nay
  const dowLabels = isA ? DOW_VI : DOW_EN

  return (
    <Celebration
      icon="🔥"
      title={isA ? `Chuỗi ${streak} ngày!` : `${streak}-day streak!`}
      subtitle={subtitleFor(streak, isA)}
      ctaLabel={isA ? 'Tiếp tục' : 'Continue'}
      onDone={onDone}
    >
      {/* Hàng 7 chấm tuần — chấm hôm nay (cuối) pop nổi bật */}
      <div className="flex justify-center gap-2.5" aria-hidden="true">
        {week.map((d, i) => {
          const isToday = i === week.length - 1
          return (
            <div key={d.date} className="flex flex-col items-center gap-1">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  d.active
                    ? 'bg-orange-500 text-black'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                } ${isToday ? 'animate-pop-correct ring-2 ring-orange-400/60' : ''}`}
              >
                {d.active ? '✓' : ''}
              </span>
              <span
                className={`text-[11px] ${isToday ? 'text-orange-400 font-bold' : 'text-zinc-500'}`}
              >
                {dowLabels[d.dow]}
              </span>
            </div>
          )
        })}
      </div>
    </Celebration>
  )
}
