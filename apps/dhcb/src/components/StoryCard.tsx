// StoryCard — thẻ 1 truyện ở danh sách (tab Truyện cổ tích / Truyện ngụ ngôn, trang /listening).
// Hiện cờ quốc gia, tiêu đề (ngôn ngữ đích lớn, bản dịch nhỏ), cấp CEFR, ước lượng thời gian nghe.
import { Headphones, ChevronRight } from 'lucide-react'
import type { StoryMeta } from '../data/stories/index'
import { estimateListenMinutes } from '../lib/stories'

interface Props {
  story: StoryMeta
  isA: boolean // true = đích tiếng Anh (tiêu đề lớn = titleEn), false = đích tiếng Việt
  onClick: () => void
}

export default function StoryCard({ story, isA, onClick }: Props) {
  const minutes = estimateListenMinutes(story.lineCount)
  const mainTitle = isA ? story.titleEn : story.titleVi
  const subTitle = isA ? story.titleVi : story.titleEn
  const country = isA ? story.countryVi : story.countryEn

  return (
    <button
      onClick={onClick}
      className="text-left bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 hover:bg-zinc-800/60 active:scale-[0.98] transition-all group"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-lg leading-none" aria-hidden="true">
          {story.flag}
        </span>
        <span className="text-xs text-zinc-400 truncate">{country}</span>
        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 theme-light:text-accent-800 font-medium shrink-0">
          {story.level}
        </span>
      </div>
      <p className="font-bold text-base text-white leading-snug line-clamp-2">{mainTitle}</p>
      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{subTitle}</p>
      <div className="flex items-center justify-between mt-2.5">
        <span className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Headphones className="w-3 h-3" />
          {isA ? `~${minutes} phút` : `~${minutes} min`}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition" />
      </div>
    </button>
  )
}
