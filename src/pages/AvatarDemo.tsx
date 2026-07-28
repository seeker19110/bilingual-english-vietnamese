// src/pages/AvatarDemo.tsx — PoC "avatar AI nói chuyện" (mô phỏng khẩu hình theo audio TTS).
// Trang DEMO ẨN — chỉ vào được qua URL trực tiếp (/avatar-demo), KHÔNG có trong menu/BottomNav,
// KHÔNG gắn vào luồng Luyện nói thật. Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md
// (mục 5, bước 1 "PoC nhỏ") — chứng minh cơ chế viseme animation chạy đúng trước khi mở rộng.
import { useRef, useState } from 'react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import AvatarSpeaking from '../components/AvatarSpeaking'
import { ensureAudioBuffer, bufferToBlobUrl, DEFAULT_VOICE } from '../lib/tts'
import {
  fallbackWordVisemes,
  framesFromWordVisemes,
  type Viseme,
  type VisemeFrame,
} from '../lib/viseme'
import { getAccessToken } from '../lib/authHeader'
import { useToast } from '../context/ToastProvider'

const DEMO_SENTENCE = 'Hello, how are you today? I am your English tutor.'

// Hỏi server dãy viseme thật (eSpeak-ng, xem api/avatar-visemes.ts) — trả null nếu server chưa
// cài eSpeak-ng hoặc lỗi mạng, để dùng fallbackWordVisemes() (đếm nguyên âm chữ viết) thay thế.
async function fetchWordVisemes(text: string): Promise<Viseme[][] | null> {
  try {
    const token = await getAccessToken()
    if (!token) return null
    const res = await fetch('/api/avatar-visemes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text, lang: 'en-US' }),
    })
    if (!res.ok) return null
    const { wordVisemes } = (await res.json()) as { wordVisemes: Viseme[][] | null }
    return wordVisemes
  } catch {
    return null
  }
}

export default function AvatarDemo() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [timeline, setTimeline] = useState<VisemeFrame[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  async function handlePlay() {
    if (loading || isPlaying) return
    setLoading(true)
    try {
      const words = DEMO_SENTENCE.split(/\s+/).filter(Boolean)
      const [buffer, wordVisemes] = await Promise.all([
        ensureAudioBuffer(DEMO_SENTENCE, 'en-US', DEFAULT_VOICE),
        fetchWordVisemes(DEMO_SENTENCE),
      ])
      const blobUrl = bufferToBlobUrl(buffer)

      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.src = blobUrl

      audio.onloadedmetadata = () => {
        const durationMs = audio.duration * 1000
        const frames = framesFromWordVisemes(wordVisemes ?? fallbackWordVisemes(words), durationMs)
        setTimeline(frames)
      }
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(blobUrl)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        toast.error('Không phát được audio demo')
      }

      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('[AvatarDemo] Lỗi phát demo:', err)
      toast.error('Không tạo được audio demo — kiểm tra đăng nhập/kết nối mạng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Layout title="PoC — Avatar AI nói chuyện" />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
        <PageHeader
          title="PoC — Avatar AI nói chuyện"
          subtitle="Demo nội bộ: mô phỏng khẩu hình theo audio TTS (ước lượng, chưa chính xác theo phoneme thật)"
        />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col items-center gap-5">
          <AvatarSpeaking audioEl={audioRef.current} timeline={timeline} isPlaying={isPlaying} />
          <p className="text-sm text-zinc-400 text-center max-w-sm">{DEMO_SENTENCE}</p>
          <button
            type="button"
            onClick={handlePlay}
            disabled={loading || isPlaying}
            className="min-h-11 px-6 rounded-full bg-accent-500 text-white font-medium disabled:opacity-50"
          >
            {loading ? 'Đang tạo audio…' : isPlaying ? 'Đang nói…' : 'Phát demo'}
          </button>
        </div>
      </main>
    </>
  )
}
