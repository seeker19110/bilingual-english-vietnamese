// KaraokeText — nút loa + văn bản với từng chữ sáng lên theo giọng đọc.
// Thay thế pattern "SpeakButton + <p>text</p>" ở mọi nơi trong dự án.
// Tự quản lý trạng thái phát/dừng và word-sync, không cần state ở component cha.

import { useState, useRef } from 'react'
import { Volume2, Square } from 'lucide-react'
import { speak, stopSpeaking, type Voice } from '../lib/tts'

interface Props {
  text: string
  lang: 'en-US' | 'vi-VN'
  textClass?: string // class CSS cho phần văn bản (font, màu, size...)
  buttonClass?: string // class CSS thêm vào nút container (padding, hover...)
  iconSize?: 'xs' | 'sm'
  voice?: Voice // giọng riêng cho nhân vật (vd hội thoại 2 người) — bỏ trống thì dùng giọng mặc định
  // Cho cha ĐIỀU KHIỂN trạng thái phát/từ đang đọc từ bên ngoài — dùng khi cha tự phát audio
  // tuần tự nhiều câu (vd "Phát tất cả" trong hội thoại ở RoadmapTab) để chữ vẫn sáng lên đúng
  // nhịp, thay vì im lìm vì component không biết cha đang phát. Bỏ trống (mặc định) thì component
  // tự quản lý phát/dừng khi bấm — giữ nguyên hành vi ở mọi nơi khác đang dùng component này.
  externalState?: { playing: boolean; wordIdx: number | null }
}

export default function KaraokeText({
  text,
  lang,
  textClass = 'text-sm text-zinc-300 leading-relaxed',
  buttonClass = '',
  iconSize = 'sm',
  voice,
  externalState,
}: Props) {
  const [playing, setPlaying] = useState(false)
  const [wordIdx, setWordIdx] = useState<number | null>(null)
  const wordIdxRef = useRef<number | null>(null)

  const isControlled = externalState !== undefined
  const displayPlaying = isControlled ? externalState.playing : playing
  const displayWordIdx = isControlled ? externalState.wordIdx : wordIdx

  // Chỉ setState khi từ thực sự thay đổi — ontimeupdate gọi ~4 lần/giây
  function onWord(idx: number) {
    if (wordIdxRef.current === idx) return
    wordIdxRef.current = idx
    setWordIdx(idx)
  }

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation() // tránh trigger parent nếu nằm trong nút khác
    // Cha đang điều khiển (vd giữa lúc "Phát tất cả") → bấm không tự phát audio riêng,
    // tránh chồng tiếng với audio cha đang phát.
    if (isControlled) return
    if (playing) {
      stopSpeaking()
      return
    }
    if (!text.trim()) return
    setPlaying(true)
    wordIdxRef.current = null
    setWordIdx(null)
    try {
      await speak(text, lang, voice, 1, onWord)
    } catch {
      // lỗi mạng / TTS → im lặng
    } finally {
      setPlaying(false)
      setWordIdx(null)
      wordIdxRef.current = null
    }
  }

  // Icon loa to gấp 1.5x kích thước gốc (w-3/w-3.5 → 1.125rem/1.3125rem) — vùng chạm rõ ràng hơn trên mobile.
  const iSize = iconSize === 'xs' ? 'w-[1.125rem] h-[1.125rem]' : 'w-[1.3125rem] h-[1.3125rem]'
  const bSize = iconSize === 'xs' ? 'w-6 h-6 mt-0.5' : 'w-[1.875rem] h-[1.875rem] mt-0.5'
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
        ${displayPlaying ? accent : idle}`}
      >
        {displayPlaying ? (
          <Square className={`${iSize} fill-current`} />
        ) : (
          <Volume2 className={iSize} />
        )}
      </span>

      {/* Văn bản: từng chữ highlight đúng lúc đọc */}
      <span className={textClass}>
        {parts.map((part, i) => {
          // Đoạn rỗng '' chỉ sinh ra ở đầu/cuối khi text có khoảng trắng thừa; bỏ qua để
          // chỉ số từ (wi) khớp với bộ đếm của audio (dùng text.trim().split ở tts.ts).
          if (part === '') return null
          if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
          const thisIdx = wi++
          return (
            <span
              key={i}
              className={
                displayPlaying && thisIdx === displayWordIdx ? wordHl : 'transition-colors'
              }
            >
              {part}
            </span>
          )
        })}
      </span>
    </button>
  )
}
