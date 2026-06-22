import { useState } from 'react'
import { Volume2, Loader2, VolumeX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getVoicePref } from '../lib/tts'

interface Props {
  word: string
}

// Nút loa phát âm 1 từ tiếng Anh — giọng nữ/nam lấy từ global pref (VoiceToggle trên header).
export default function PronounceButton({ word }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  // Nhớ audioUrl đã tải theo cặp "từ|giọng" — PHẢI có cả từ trong khoá, vì component này
  // hay bị dùng lại cho nhiều từ khác nhau (ví dụ chuyển thẻ flashcard) mà state không bị
  // reset; nếu chỉ theo giọng thì từ mới sẽ phát nhầm audio của từ cũ đã lưu.
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})

  function speakWithWebSpeech() {
    const voice = getVoicePref()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (voice === 'male' ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') : v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))
    )
    if (preferred) utterance.voice = preferred
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  async function handleClick() {
    if (status === 'loading') return

    if (word.includes(' ')) {
      speakWithWebSpeech()
      return
    }

    const voice = getVoicePref()
    const cacheKey = `${word}|${voice}`
    const cached = audioUrls[cacheKey]
    if (cached) {
      playAudio(cached)
      return
    }

    setStatus('loading')
    try {
      // Gửi kèm JWT để server xác thực người dùng
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch(`/api/pronunciation?word=${encodeURIComponent(word)}&voice=${voice}`, { headers })
      const data = (await res.json()) as { audio_url?: string; error?: string }

      if (!res.ok || !data.audio_url) {
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const audioUrl = data.audio_url

      setAudioUrls((prev) => ({ ...prev, [cacheKey]: audioUrl }))
      setStatus('idle')
      playAudio(audioUrl)
    } catch (err) {
      console.error('Lỗi phát âm:', err)
      // Fallback về Web Speech API nếu server lỗi
      speakWithWebSpeech()
      setStatus('idle')
    }
  }

  function playAudio(url: string) {
    new Audio(url).play().catch(err => console.error('Lỗi phát audio:', err))
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        title="Phát âm"
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-300 transition disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {status === 'error' && <VolumeX className="w-3.5 h-3.5 text-red-400" />}
        {status === 'idle' && <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
