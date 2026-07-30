import { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { getAuthHeader } from '../lib/authHeader'
import { getVoicePref, playAudioUrl, type Voice } from '../lib/tts'
import { VOICE_OPTIONS, pickRandomAllowedVoice } from '../lib/voiceTiers'

interface Props {
  word: string
  lang?: 'en-US' | 'vi-VN' // bỏ trống = tiếng Anh (mặc định cũ, giữ tương thích chỗ gọi chưa sửa)
}

// Nhãn ngắn gọn cho từng giọng (tên riêng + nhãn giới tính), hiển thị cạnh icon để người
// dùng biết đang nghe giọng nào.
const VOICE_LABEL: Record<Voice, string> = Object.fromEntries(
  VOICE_OPTIONS.map((v) => [v.id, `${v.gender === 'female' ? 'Nữ' : 'Nam'} · ${v.id}`]),
) as Record<Voice, string>

// Nút DUY NHẤT phát âm 1 từ. Quyết định 2026-07-29: mỗi lần bấm bốc NGẪU NHIÊN 1 giọng trong
// số giọng gói cho phép (trộn cả nam lẫn nữ, không tuần tự) — khác giọng mặc định cố định ở
// Cài đặt, đồng bộ với nút loa Từ điển (PronounceButton random, Dictionary.tsx). Nhãn cạnh
// icon luôn hiện đúng giọng VỪA phát.
export default function WordVoiceCycleButton({ word, lang = 'en-US' }: Props) {
  const [loading, setLoading] = useState(false)
  // Cache audio_url theo từng giọng đã tải — bấm lại đúng giọng cũ thì không gọi lại API.
  const [audioUrls, setAudioUrls] = useState<Partial<Record<Voice, string>>>({})
  // Giọng đang hiển thị nhãn — khởi tạo bằng giọng mặc định (trước khi bấm lần nào), sau đó
  // luôn cập nhật theo giọng NGẪU NHIÊN vừa bốc ở mỗi lần bấm.
  const [currentVoice, setCurrentVoice] = useState<Voice>(getVoicePref)

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

    const nextVoice = pickRandomAllowedVoice()

    // Cache tra theo giọng ĐOÁN trước (nextVoice) — nếu đã có nghĩa là lần trước server cũng
    // trả về đúng giọng này (không bị hạ gói), nên vừa tra cache vừa hiện nhãn ngay được.
    const cached = audioUrls[nextVoice]
    if (cached) {
      setCurrentVoice(nextVoice)
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
      const data = (await res.json()) as { audio_url?: string; voice?: string; error?: string }

      if (!res.ok || !data.audio_url) {
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const audioUrl = data.audio_url
      // Server có thể đã HẠ giọng đoán (nextVoice) xuống giọng khác nếu ngoài quyền gói hiện
      // tại (clampVoiceToPlan) — PHẢI hiện nhãn theo giọng server THẬT SỰ dùng, không phải
      // giọng client đoán, nếu không nhãn sẽ đổi liên tục nhưng audio luôn là 1 giọng cố định
      // (bug đã gặp: cache voice_allowed phía client lệch/rộng hơn gói thật).
      const actualVoice =
        data.voice && data.voice in VOICE_LABEL ? (data.voice as Voice) : nextVoice
      setCurrentVoice(actualVoice)

      setAudioUrls((prev) => ({ ...prev, [nextVoice]: audioUrl }))
      playAudioUrl(audioUrl)
    } catch (err) {
      console.error('Lỗi nghe giọng khác, dùng tạm Web Speech:', err)
      setCurrentVoice(nextVoice)
      speakWithWebSpeech(nextVoice)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Nghe"
      aria-label="Nghe"
      className="tap-44 shrink-0 h-10 px-3.5 flex items-center gap-1.5 rounded-full bg-zinc-800 hover:bg-accent-500/20 text-zinc-300 hover:text-accent-300 transition disabled:opacity-60 text-sm font-medium"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
      <span>{VOICE_LABEL[currentVoice]}</span>
    </button>
  )
}
