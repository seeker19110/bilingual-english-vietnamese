import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import type { DictEntry } from '../types'
import PronounceButton from './PronounceButton'
import SpeakButton from './SpeakButton'

interface Props {
  entries: DictEntry[]
}

const POS_LABEL: Record<string, string> = {
  n: 'Danh từ', v: 'Động từ', adj: 'Tính từ', adv: 'Trạng từ',
  prep: 'Giới từ', conj: 'Liên từ', pron: 'Đại từ', interj: 'Thán từ',
  art: 'Mạo từ', num: 'Số từ', idiom: 'Thành ngữ',
}

// Sinh số "ngẫu nhiên nhưng cố định theo ngày" từ chuỗi YYYY-MM-DD.
// Cùng một ngày luôn ra cùng một từ; sang ngày mới thì đổi từ.
function seedFromDate(date: string): number {
  let h = 0
  for (let i = 0; i < date.length; i++) {
    h = (h * 31 + date.charCodeAt(i)) >>> 0
  }
  return h
}

// Thẻ "Từ vựng mỗi ngày" — chọn 1 từ cố định theo ngày hôm nay, kèm ví dụ + nút phát âm.
export default function WordOfTheDay({ entries }: Props) {
  const entry = useMemo(() => {
    if (entries.length === 0) return null
    const today = new Date().toISOString().slice(0, 10)
    const idx = seedFromDate(today) % entries.length
    return entries[idx]
  }, [entries])

  if (!entry) return null

  return (
    <div className="glass rounded-xl p-4 mb-4 animate-fade-in border-emerald-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-semibold text-white">Từ vựng hôm nay</span>
      </div>

      {/* Từ + loại từ + phát âm */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="font-bold text-white text-lg">{entry.word}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-700 text-zinc-300">
          {POS_LABEL[entry.pos] || entry.pos}
        </span>
        <PronounceButton word={entry.word} />
      </div>

      {entry.ipa_en && <p className="text-xs text-emerald-400/70 font-mono mb-1">{entry.ipa_en}</p>}
      <p className="text-sm text-zinc-200 font-medium mb-1">{entry.vi}</p>

      {/* Câu ví dụ */}
      {entry.ex_en && (
        <div className="mt-2 pl-3 border-l-2 border-zinc-700 space-y-1">
          <div className="flex items-start gap-1.5">
            <SpeakButton text={entry.ex_en} lang="en-US" title="Nghe câu tiếng Anh" size="xs" />
            <p className="text-xs text-zinc-400 italic leading-relaxed">{entry.ex_en}</p>
          </div>
          {entry.ex_vi && (
            <div className="flex items-start gap-1.5">
              <SpeakButton text={entry.ex_vi} lang="vi-VN" title="Nghe câu tiếng Việt" size="xs" />
              <p className="text-xs text-zinc-500 leading-relaxed">{entry.ex_vi}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
