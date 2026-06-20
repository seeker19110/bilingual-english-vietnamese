import { useState } from 'react'
import { Volume2, Square, Loader2 } from 'lucide-react'
import { speak, stopSpeaking } from '../lib/tts'

interface Props {
  text: string
  lang: 'en' | 'vi'
  title?: string        // tooltip hiển thị khi hover
  size?: 'sm' | 'xs'   // kích cỡ nút
  cache?: boolean       // true: nội dung tĩnh (lưu cache Google) | false: nội dung động (AI)
}

// Nút loa đọc nguyên câu/đoạn văn bằng Google TTS chất lượng cao (tts.ts), tự fallback
// giọng trình duyệt nếu Google lỗi. Hỗ trợ cả tiếng Anh ('en') lẫn tiếng Việt ('vi').
// - Bấm khi idle → tải audio (hiện spinner) rồi đọc (đổi sang icon dừng)
// - Bấm khi đang tải/đọc → dừng lại
export default function SpeakButton({ text, lang, title, size = 'sm', cache = true }: Props) {
  // 3 trạng thái: idle (chờ) / loading (đang tải audio) / playing (đang đọc)
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle')

  async function handleClick() {
    if (status === 'playing' || status === 'loading') {
      // Đang tải hoặc đang đọc → bấm để dừng
      stopSpeaking()
      setStatus('idle')
      return
    }
    if (!text.trim()) return

    setStatus('loading')
    try {
      // onPlay: chuyển loading → playing đúng lúc audio bắt đầu phát
      await speak(text, lang, { cache, onPlay: () => setStatus('playing') })
    } catch {
      // Lỗi thật — im lặng, về idle
    } finally {
      setStatus('idle')
    }
  }

  const sizeClass = size === 'xs' ? 'w-5 h-5' : 'w-6 h-6'
  const iconClass = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  // Màu theo ngôn ngữ: xanh lá = tiếng Anh, xanh dương = tiếng Việt
  const idleClass  = lang === 'en'
    ? 'bg-zinc-800/60 text-zinc-500 hover:bg-emerald-500/20 hover:text-emerald-300'
    : 'bg-zinc-800/60 text-zinc-500 hover:bg-sky-500/20 hover:text-sky-300'
  const activeClass = lang === 'en'
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-sky-500/20 text-sky-300'

  const active = status === 'playing' || status === 'loading'

  return (
    <button
      onClick={handleClick}
      title={title ?? (lang === 'en' ? 'Nghe tiếng Anh' : 'Nghe tiếng Việt')}
      className={`shrink-0 ${sizeClass} flex items-center justify-center rounded-full transition ${active ? activeClass : idleClass}`}
    >
      {status === 'loading'
        ? <Loader2 className={`${iconClass} animate-spin`} />
        : status === 'playing'
          ? <Square className={`${iconClass} fill-current`} />
          : <Volume2 className={iconClass} />
      }
    </button>
  )
}
