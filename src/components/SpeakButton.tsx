import { useState } from 'react'
import { Volume2, Square } from 'lucide-react'
import { speak, stopSpeaking, isTTSSupported } from '../lib/tts'

interface Props {
  text: string
  lang: 'en-US' | 'vi-VN'
  title?: string        // tooltip hiển thị khi hover
  size?: 'sm' | 'xs'   // kích cỡ nút
}

// Nút loa đọc nguyên câu/đoạn văn bằng Web Speech API (miễn phí, không cần API key).
// Hỗ trợ cả tiếng Anh ('en') lẫn tiếng Việt ('vi').
// - Bấm khi idle → bắt đầu đọc (nút đổi sang icon dừng)
// - Bấm khi đang đọc → dừng lại
export default function SpeakButton({ text, lang, title, size = 'sm' }: Props) {
  // Chỉ cần 2 trạng thái: idle / playing — không cần loading riêng
  const [playing, setPlaying] = useState(false)

  // Ẩn nút nếu trình duyệt không hỗ trợ Web Speech API
  if (!isTTSSupported()) return null

  async function handleClick() {
    if (playing) {
      // Đang đọc → bấm để dừng; speak() sẽ resolve ngay nhờ fix trong tts.ts
      stopSpeaking()
      return
    }
    if (!text.trim()) return

    setPlaying(true)
    try {
      await speak(text, lang)
    } catch {
      // Lỗi thật (không phải canceled/interrupted) — im lặng, về idle
    } finally {
      // Luôn chạy khi xong, dù đọc hết hay bị dừng giữa chừng
      setPlaying(false)
    }
  }

  const sizeClass = size === 'xs' ? 'w-5 h-5' : 'w-6 h-6'
  const iconClass = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  // Màu theo ngôn ngữ: xanh lá = tiếng Anh, xanh dương = tiếng Việt
  const idleClass  = lang === 'en-US'
    ? 'bg-zinc-800/60 text-zinc-500 hover:bg-emerald-500/20 hover:text-emerald-300'
    : 'bg-zinc-800/60 text-zinc-500 hover:bg-sky-500/20 hover:text-sky-300'
  const activeClass = lang === 'en-US'
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-sky-500/20 text-sky-300'

  const label = title ?? (lang === 'en-US' ? 'Nghe tiếng Anh' : 'Nghe tiếng Việt')
  return (
    <button
      onClick={handleClick}
      title={label}
      aria-label={playing ? (lang === 'en-US' ? 'Dừng' : 'Stop') : label}
      className={`shrink-0 ${sizeClass} flex items-center justify-center rounded-full transition
        ${playing ? activeClass : idleClass}
      `}
    >
      {playing
        ? <Square className={`${iconClass} fill-current`} />
        : <Volume2 className={iconClass} />
      }
    </button>
  )
}
