import { useRef, useState } from 'react'
import { Volume2, Loader2, VolumeX } from 'lucide-react'
import { getAuthHeader } from '@core/authHeader'
import { getVoicePref, playAudioUrl, type Voice } from '../lib/tts'
import { VOICE_OPTIONS, pickRandomAllowedVoice, resolveActualVoice } from '../lib/voiceTiers'

interface Props {
  word: string
  lang?: 'en-US' | 'vi-VN' // bỏ trống = tiếng Anh (mặc định cũ, giữ tương thích chỗ gọi chưa sửa)
  // Quyết định 2026-07-29: nút loa PronounceButton (dùng khắp Từ điển — kết quả tra cứu, tab
  // Flashcard, các dạng biến thể của từ ở WordFormsBlock) bốc NGẪU NHIÊN 1 giọng (cả nam lẫn
  // nữ, trong số giọng gói cho phép) MỖI LẦN BẤM theo mặc định — áp dụng TOÀN CỤC cho mọi nơi
  // dùng component này, không cần bật riêng từng chỗ. Truyền `random={false}` nếu 1 màn hình cụ
  // thể nào đó sau này cần giữ cố định giọng mặc định ở Cài đặt thay vì ngẫu nhiên.
  random?: boolean
}

// Nút loa phát âm 1 từ — mặc định BỐC NGẪU NHIÊN giọng mỗi lần bấm (xem ghi chú Props.random);
// truyền `random={false}` để dùng đúng giọng mặc định đã lưu ở Cài đặt (VoiceMenu/VoicePicker) thay vào đó.
export default function PronounceButton({ word, lang = 'en-US', random = true }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  // Nhớ audioUrl đã tải theo cặp "từ|giọng" — PHẢI có cả từ trong khoá, vì component này
  // hay bị dùng lại cho nhiều từ khác nhau (ví dụ chuyển thẻ flashcard) mà state không bị
  // reset; nếu chỉ theo giọng thì từ mới sẽ phát nhầm audio của từ cũ đã lưu.
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})

  // Giọng của lần bấm trước — loại khỏi bể random để không bốc lại đúng giọng cũ (gói Free chỉ
  // 4 giọng nên random đều sẽ lặp ~25% số lần bấm, người dùng tưởng random không chạy).
  const lastVoiceRef = useRef<Voice | null>(null)

  function pickVoice(): Voice {
    // Truyền `lang` để bỏ giọng Studio khi đọc tiếng Việt (Google không có Studio cho vi-VN,
    // server hạ về Chirp3-HD nên Kore/Puck bị trúng gấp đôi — xem api/pronunciation.ts).
    return random
      ? pickRandomAllowedVoice({ lang, exclude: lastVoiceRef.current ?? undefined })
      : getVoicePref()
  }

  function speakWithWebSpeech(voice: Voice) {
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
    if (status === 'loading') return

    const guessedVoice = pickVoice()
    lastVoiceRef.current = guessedVoice

    // Trước đây cụm từ (word có dấu cách) bị bắt đọc bằng Web Speech API trình duyệt thay vì
    // Google TTS — Web Speech chỉ set utt.lang chứ không đảm bảo máy có SẴN giọng đúng ngôn
    // ngữ đó; máy thiếu giọng vi-VN thì trình duyệt tự phát bằng giọng mặc định (thường là
    // tiếng Anh) dù đặt lang='vi-VN', gây hiện tượng "chữ Việt đọc giọng Anh". Bản dịch tiếng
    // Việt trong từ điển (card.vi) hầu như luôn là cụm ≥ 2 từ nên lỗi này xảy ra rất thường
    // xuyên ở chiều B. /api/pronunciation đã hỗ trợ cụm từ (WORD_SAFE_PATTERN cho phép dấu
    // cách, tối đa 100 ký tự — xem api/pronunciation.ts) nên bỏ nhánh này, đi cùng đường
    // Google TTS như WordVoiceCycleButton đang làm.
    const guessCacheKey = `${word}|${guessedVoice}|${lang}`
    const cached = audioUrls[guessCacheKey]
    if (cached) {
      playAudio(cached)
      return
    }

    setStatus('loading')
    try {
      // Gửi kèm JWT để server xác thực người dùng
      const headers = await getAuthHeader()
      const res = await fetch(
        `/api/pronunciation?word=${encodeURIComponent(word)}&voice=${guessedVoice}&lang=${lang}`,
        { headers },
      )
      const data = (await res.json()) as { audio_url?: string; voice?: string; error?: string }

      if (!res.ok || !data.audio_url) {
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const audioUrl = data.audio_url
      const actualVoice = resolveActualVoice(guessedVoice, data.voice)
      // Nhớ giọng THẬT vừa nghe (server có thể đã hạ giọng đoán) để lần bấm sau không lặp lại nó.
      lastVoiceRef.current = actualVoice

      setAudioUrls((prev) => ({ ...prev, [`${word}|${actualVoice}|${lang}`]: audioUrl }))
      setStatus('idle')
      playAudio(audioUrl)
    } catch (err) {
      console.error('Lỗi phát âm:', err)
      // Fallback về Web Speech API nếu server lỗi
      speakWithWebSpeech(guessedVoice)
      setStatus('idle')
    }
  }

  function playAudio(url: string) {
    playAudioUrl(url)
  }

  // Chuẩn nút loa tròn độc lập: 36px hiển thị, icon 18px, vùng chạm ≥ 44px (tap-44).
  return (
    <button
      onClick={handleClick}
      disabled={status === 'loading'}
      title="Phát âm"
      aria-label={`Phát âm từ "${word}"`}
      className="tap-44 shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-accent-500/20 text-zinc-400 hover:text-accent-300 transition disabled:opacity-60"
    >
      {status === 'loading' && <Loader2 className="w-[1.125rem] h-[1.125rem] animate-spin" />}
      {status === 'error' && <VolumeX className="w-[1.125rem] h-[1.125rem] text-red-400" />}
      {status === 'idle' && <Volume2 className="w-[1.125rem] h-[1.125rem]" />}
    </button>
  )
}
