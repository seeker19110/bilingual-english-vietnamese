// KaraokeText — nút loa + văn bản với từng chữ sáng lên theo giọng đọc.
// Thay thế pattern "SpeakButton + <p>text</p>" ở mọi nơi trong dự án.
// Tự quản lý trạng thái phát/dừng và word-sync, không cần state ở component cha.

import { useState, useRef } from 'react'
import { Volume2, Square } from 'lucide-react'
import { speak, stopSpeaking } from '../lib/tts'

interface Props {
  text: string
  lang: 'en-US' | 'vi-VN'
  textClass?: string // class CSS cho phần văn bản (font, màu, size...)
  buttonClass?: string // class CSS thêm vào nút container (padding, hover...)
  iconSize?: 'xs' | 'sm'
}

export default function KaraokeText({
  text,
  lang,
  textClass = 'text-sm text-zinc-300 leading-relaxed',
  buttonClass = '',
  iconSize = 'sm',
}: Props) {
  const [playing, setPlaying] = useState(false)
  const [wordIdx, setWordIdx] = useState<number | null>(null)
  const wordIdxRef = useRef<number | null>(null)

  // Chỉ setState khi từ thực sự thay đổi — ontimeupdate gọi ~4 lần/giây
  function onWord(idx: number) {
    if (wordIdxRef.current === idx) return
    wordIdxRef.current = idx
    setWordIdx(idx)
  }

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation() // tránh trigger parent nếu nằm trong nút khác
    if (playing) {
      stopSpeaking()
      return
    }
    if (!text.trim()) return
    setPlaying(true)
    wordIdxRef.current = null
    setWordIdx(null)
    try {
      await speak(text, lang, undefined, 1, onWord)
    } catch {
      // lỗi mạng / TTS → im lặng
    } finally {
      setPlaying(false)
      setWordIdx(null)
      wordIdxRef.current = null
    }
  }

  const iSize = iconSize === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'
  const bSize = iconSize === 'xs' ? 'w-4 h-4 mt-0.5' : 'w-5 h-5 mt-0.5'
  const accent = lang === 'en-US' ? 'text-accent-300' : 'text-sky-300'
  const idle =
    lang === 'en-US' ? 'text-zinc-400 hover:text-accent-400' : 'text-zinc-400 hover:text-sky-400'
  const wordHl =
    lang === 'en-US'
      ? 'bg-accent-500/20 text-accent-200 rounded px-0.5'
      : 'bg-sky-500/20 text-sky-200 rounded px-0.5'

  // Tách text thành [từ, khoảng-trắng, từ...] để giữ nguyên whitespace gốc
  const parts = text.split(/(\s+)/)
  let wi = 0

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-start gap-2 text-left transition group ${buttonClass}`}
    >
      {/* Icon loa / dừng */}
      <span
        className={`shrink-0 ${bSize} flex items-center justify-center transition
        ${playing ? accent : idle}`}
      >
        {playing ? <Square className={`${iSize} fill-current`} /> : <Volume2 className={iSize} />}
      </span>

      {/* Văn bản: từng chữ highlight đúng lúc đọc */}
      <span className={textClass}>
        {parts.map((part, i) => {
          if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
          const thisIdx = wi++
          return (
            <span key={i} className={playing && thisIdx === wordIdx ? wordHl : 'transition-colors'}>
              {part}
            </span>
          )
        })}
      </span>
    </button>
  )
}
