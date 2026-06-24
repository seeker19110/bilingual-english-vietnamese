import { Sparkles } from 'lucide-react'
import type { DictEntry } from '../types'
import PronounceButton from './PronounceButton'
import KaraokeText from './KaraokeText'

interface Props {
  // Từ của hôm nay do trang cha lấy từ /api/dictionary?mode=wordOfDay (server tự
  // chọn cố định theo ngày) — component này chỉ hiển thị, không tự tính nữa.
  entry: DictEntry | null
}

const POS_LABEL: Record<string, string> = {
  n: 'Danh từ', v: 'Động từ', adj: 'Tính từ', adv: 'Trạng từ',
  prep: 'Giới từ', conj: 'Liên từ', pron: 'Đại từ', interj: 'Thán từ',
  art: 'Mạo từ', num: 'Số từ', idiom: 'Thành ngữ',
}

// Thẻ "Từ vựng mỗi ngày" — hiển thị 1 từ cố định theo ngày hôm nay, kèm ví dụ + nút phát âm.
export default function WordOfTheDay({ entry }: Props) {
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

      {/* Câu ví dụ — karaoke highlight từng chữ khi nghe */}
      {entry.ex_en && (
        <div className="mt-2 pl-3 border-l-2 border-zinc-700 space-y-1">
          <KaraokeText text={entry.ex_en} lang="en-US" textClass="text-xs text-zinc-400 italic leading-relaxed" iconSize="xs" />
          {entry.ex_vi && (
            <KaraokeText text={entry.ex_vi} lang="vi-VN" textClass="text-xs text-zinc-500 leading-relaxed" iconSize="xs" />
          )}
        </div>
      )}
    </div>
  )
}
