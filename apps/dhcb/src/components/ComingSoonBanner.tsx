// src/components/ComingSoonBanner.tsx — nhãn "Sắp ra mắt" cho tính năng còn đang hoàn thiện.
//
// Quyết định 2026-08-09: tính năng đối thoại với AI (Luyện nói song ngữ + Avatar AI nói
// chuyện) VẪN vào được như cũ, chỉ thêm banner này để người dùng biết đang dùng bản chưa
// hoàn thiện — không chặn route, không ẩn khỏi menu, nên khi xong chỉ cần gỡ 1 dòng banner.
//
// Màu chữ dùng đúng bộ class của RewardTipBanner (text-white cho tiêu đề, text-zinc-400 cho
// mô tả) — đã qua cả 2 cổng a11y (AA cho mọi thành phần, AAA cho nội dung/tiêu đề).
import { Hammer } from 'lucide-react'

export default function ComingSoonBanner({ isA, note }: { isA: boolean; note?: string }) {
  return (
    <div
      role="status"
      className="mb-3 glass rounded-2xl p-4 border border-amber-500/30 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <Hammer className="w-4 h-4 text-amber-300" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">
            {isA ? 'Sắp ra mắt — bản đang hoàn thiện' : 'Coming soon — work in progress'}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {note ??
              (isA
                ? 'Tính năng đối thoại với AI vẫn dùng được bình thường, nhưng còn đang hoàn thiện nên có thể chưa ổn định. Bản chính thức sẽ ra mắt trong thời gian tới.'
                : 'The AI conversation feature still works, but it is being polished and may be unstable. The finished version is coming soon.')}
          </p>
        </div>
      </div>
    </div>
  )
}
