import { useEffect, useState } from 'react'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DictEntry } from '../types'
import PronounceButton from './PronounceButton'
import KaraokeText from './KaraokeText'

interface Props {
  // Các từ "hôm nay" lấy TỪ LỘ TRÌNH HỌC (batch tab "Hôm nay") do trang cha truyền vào.
  // Thẻ này chỉ hiển thị 1 từ mỗi lần + nút xoay vòng để xem hết các từ.
  entries: DictEntry[]
  isA?: boolean
}

const POS_LABEL: Record<string, string> = {
  n: 'Danh từ',
  v: 'Động từ',
  adj: 'Tính từ',
  adv: 'Trạng từ',
  prep: 'Giới từ',
  conj: 'Liên từ',
  pron: 'Đại từ',
  interj: 'Thán từ',
  art: 'Mạo từ',
  num: 'Số từ',
  idiom: 'Thành ngữ',
}

// Thẻ "Từ vựng hôm nay" — hiển thị các từ trong lộ trình học hôm nay,
// mỗi lần 1 từ, có nút ◀ ▶ để xoay vòng qua hết danh sách.
export default function WordOfTheDay({ entries, isA = true }: Props) {
  const [idx, setIdx] = useState(0)

  // Danh sách đổi (vd: sau khi học thêm từ) → đưa con trỏ về đầu cho an toàn.
  useEffect(() => {
    setIdx(0)
  }, [entries])

  if (entries.length === 0) return null

  // Kẹp chỉ số trong khoảng hợp lệ phòng khi danh sách ngắn lại.
  const safeIdx = Math.min(idx, entries.length - 1)
  const entry = entries[safeIdx]
  const total = entries.length
  // safeIdx luôn trong [0, length-1] nên entry luôn có; guard này chỉ để TS narrow kiểu.
  if (!entry) return null

  const go = (delta: number) => setIdx((safeIdx + delta + total) % total)

  return (
    <div className="glass rounded-xl p-4 mb-4 animate-fade-in border-accent-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-accent-400" />
        <span className="text-sm font-semibold text-white">
          {isA ? 'Từ vựng hôm nay' : "Today's words"}
        </span>

        {/* Bộ điều khiển xoay vòng — chỉ hiện khi có nhiều hơn 1 từ */}
        {total > 1 && (
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={isA ? 'Từ trước' : 'Previous word'}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-400 tabular-nums select-none" aria-live="polite">
              {safeIdx + 1}/{total}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={isA ? 'Từ tiếp theo' : 'Next word'}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Từ + loại từ + phát âm */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="font-bold text-white text-lg">{entry.word}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-zinc-700 text-zinc-300">
          {POS_LABEL[entry.pos] || entry.pos}
        </span>
        <PronounceButton word={entry.word} />
      </div>

      {entry.ipa_en && <p className="text-xs text-accent-400/70 font-mono mb-1">{entry.ipa_en}</p>}
      <p className="text-sm text-zinc-200 font-medium mb-1">{entry.vi}</p>

      {/* Câu ví dụ — karaoke highlight từng chữ khi nghe */}
      {entry.ex_en && (
        <div className="mt-2 pl-3 border-l-2 border-zinc-700 space-y-1">
          <KaraokeText
            text={entry.ex_en}
            lang="en-US"
            textClass="text-xs text-zinc-400 italic leading-relaxed"
            iconSize="xs"
          />
          {entry.ex_vi && (
            <KaraokeText
              text={entry.ex_vi}
              lang="vi-VN"
              textClass="text-xs text-zinc-400 leading-relaxed"
              iconSize="xs"
            />
          )}
        </div>
      )}
    </div>
  )
}
