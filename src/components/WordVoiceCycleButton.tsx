import { useState } from 'react'
import { RotateCw, Loader2 } from 'lucide-react'
import { getAuthHeader } from '../lib/authHeader'
import { playAudioUrl, type Voice } from '../lib/tts'

interface Props {
  word: string
}

// Thứ tự xoay vòng cố định 4 giọng — mỗi lần bấm chuyển sang giọng kế tiếp trong vòng.
const VOICE_CYCLE: Voice[] = ['female', 'female2', 'male', 'male2']

// Nhãn tiếng Việt ngắn gọn cho từng giọng, hiển thị cạnh icon để người dùng biết đang nghe giọng nào.
const VOICE_LABEL: Record<Voice, string> = {
  female: 'Nữ 1',
  female2: 'Nữ 2',
  male: 'Nam 1',
  male2: 'Nam 2',
}

// Nút phụ "nghe giọng khác" — xoay vòng 4 giọng TTS cho CÙNG 1 từ, phục vụ luyện nghe đa giọng
// (N2 trong đặc tả nâng cấp sư phạm). Khác PronounceButton: giọng ở đây KHÔNG lấy từ global pref
// mà tự xoay vòng nội bộ, và KHÔNG có fallback Web Speech API khi lỗi (bấm lại là được, không
// cần thiết phải luôn phát được — đây là nút phụ, không phải nút loa chính).
export default function WordVoiceCycleButton({ word }: Props) {
  const [voiceIndex, setVoiceIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  // Cache audio_url theo từng giọng đã tải — bấm lại đúng giọng cũ thì không gọi lại API.
  const [audioUrls, setAudioUrls] = useState<Partial<Record<Voice, string>>>({})

  const currentVoice = VOICE_CYCLE[voiceIndex] as Voice

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
        `/api/pronunciation?word=${encodeURIComponent(word)}&voice=${nextVoice}`,
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
      // Lỗi mạng/server: bỏ qua âm thầm, không throw, không crash UI — không có
      // fallback Web Speech ở đây vì đây chỉ là nút phụ, người dùng bấm lại là được.
      console.error('Lỗi nghe giọng khác:', err)
    } finally {
      setLoading(false)
    }
  }

  // Nút phụ, nhỏ hơn và nhạt màu hơn nút loa chính (PronounceButton) để không cạnh tranh sự chú ý.
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Nghe giọng khác"
      aria-label="Nghe giọng khác"
      className="tap-44 shrink-0 h-9 px-2.5 flex items-center gap-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300 transition disabled:opacity-60 text-xs"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RotateCw className="w-3.5 h-3.5" />
      )}
      <span>{VOICE_LABEL[currentVoice]}</span>
    </button>
  )
}
