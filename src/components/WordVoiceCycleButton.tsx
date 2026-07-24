import { useState } from 'react'
import { RotateCw, Loader2 } from 'lucide-react'
import { getAuthHeader } from '../lib/authHeader'
import { getVoicePref, playAudioUrl, type Voice } from '../lib/tts'
import { VOICE_OPTIONS, DEFAULT_SEED_VOICE_IDS } from '../lib/voiceTiers'

interface Props {
  word: string
  lang?: 'en-US' | 'vi-VN' // bỏ trống = tiếng Anh (mặc định cũ, giữ tương thích chỗ gọi chưa sửa)
}

// Xoay vòng 8 giọng đã seed sẵn (nhanh, phát ngay không phải chờ tạo mới) — không xoay hết
// 14 giọng để tránh người dùng bấm "nghe giọng khác" trúng 1 trong 6 giọng chưa seed, phải
// đợi Google TTS tạo mới ngay trong nút phụ này (trải nghiệm khựng). 6 giọng còn lại vẫn
// chọn được bình thường ở VoicePicker.tsx (trang Cài đặt).
const VOICE_CYCLE: Voice[] = DEFAULT_SEED_VOICE_IDS

// Nhãn ngắn gọn cho từng giọng (tên riêng + nhãn giới tính), hiển thị cạnh icon để người
// dùng biết đang nghe giọng nào.
const VOICE_LABEL: Record<Voice, string> = Object.fromEntries(
  VOICE_OPTIONS.map((v) => [v.id, `${v.gender === 'female' ? 'Nữ' : 'Nam'} · ${v.id}`]),
) as Record<Voice, string>

function initialIndex(): number {
  const idx = VOICE_CYCLE.indexOf(getVoicePref())
  return idx >= 0 ? idx : 0
}

// Nút DUY NHẤT phát âm 1 từ, gộp "nghe" + "đổi giọng" làm một (2026-07-24, theo yêu cầu
// người dùng — trước đây tách 2 nút: PronounceButton (giọng theo global pref) + nút phụ này
// (giọng tự xoay vòng riêng) gây lệch giọng khó hiểu giữa 2 nút). Bấm 1 cái = xoay sang giọng
// KẾ TIẾP trong vòng 8 giọng đã seed sẵn VÀ phát ngay — nhãn luôn khớp giọng vừa nghe.
export default function WordVoiceCycleButton({ word, lang = 'en-US' }: Props) {
  const [voiceIndex, setVoiceIndex] = useState(initialIndex)
  const [loading, setLoading] = useState(false)
  // Cache audio_url theo từng giọng đã tải — bấm lại đúng giọng cũ thì không gọi lại API.
  const [audioUrls, setAudioUrls] = useState<Partial<Record<Voice, string>>>({})

  const currentVoice = VOICE_CYCLE[voiceIndex] as Voice

  // Dự phòng Web Speech API khi /api/pronunciation lỗi — nút này giờ là nút loa DUY NHẤT
  // của thẻ nên phải có fallback như PronounceButton trước đây, không im lặng bỏ qua nữa.
  function speakWithWebSpeech(voice: Voice) {
    if (!('speechSynthesis' in window)) return
    const gender = VOICE_OPTIONS.find((v) => v.id === voice)?.gender ?? 'female'
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = lang
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith(lang.slice(0, 2)) &&
        (gender === 'male'
          ? v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('nam')
          : v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('nữ')),
    )
    if (preferred) utterance.voice = preferred
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  async function handleClick() {
    if (loading) return

    // Chuyển sang giọng KẾ TIẾP trong vòng trước khi phát
    const nextIndex = (voiceIndex + 1) % VOICE_CYCLE.length
    const nextVoice = VOICE_CYCLE[nextIndex] as Voice
    setVoiceIndex(nextIndex)

    const cached = audioUrls[nextVoice]
    if (cached) {
      playAudioUrl(cached)
      return
    }

    setLoading(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch(
        `/api/pronunciation?word=${encodeURIComponent(word)}&voice=${nextVoice}&lang=${lang}`,
        { headers },
      )
      const data = (await res.json()) as { audio_url?: string; error?: string }

      if (!res.ok || !data.audio_url) {
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const audioUrl = data.audio_url

      setAudioUrls((prev) => ({ ...prev, [nextVoice]: audioUrl }))
      playAudioUrl(audioUrl)
    } catch (err) {
      console.error('Lỗi nghe giọng khác, dùng tạm Web Speech:', err)
      speakWithWebSpeech(nextVoice)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Nghe / đổi giọng"
      aria-label="Nghe / đổi giọng"
      className="tap-44 shrink-0 h-10 px-3.5 flex items-center gap-1.5 rounded-full bg-zinc-800 hover:bg-accent-500/20 text-zinc-300 hover:text-accent-300 transition disabled:opacity-60 text-sm font-medium"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
      <span>{VOICE_LABEL[currentVoice]}</span>
    </button>
  )
}
