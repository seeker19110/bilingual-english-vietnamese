import { useState } from 'react'
import { Volume2, Loader2, VolumeX } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Props {
  word: string
}

type Voice = 'female' | 'male'

// Nút loa phát âm 1 từ tiếng Anh, có thể chọn giọng nữ/nam.
// Gọi GET /api/pronunciation?word=...&voice=... — endpoint này tự kiểm tra cache trong
// Supabase (riêng theo từng giọng), nếu chưa có thì tạo audio bằng Google TTS rồi lưu lại
// cho lần sau (xem api/pronunciation.ts).
//
// Lần đầu bấm 1 từ (với 1 giọng): có thể chậm vài giây (đang tạo audio mới).
// Các lần bấm sau (trong cùng phiên xem trang, cùng giọng): phát lại ngay từ audioUrl đã
// lưu trong state, không gọi lại API. Đổi sang giọng khác lần đầu thì lại phải tải mới.
export default function PronounceButton({ word }: Props) {
  const [voice, setVoice] = useState<Voice>('female')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  // Nhớ audioUrl riêng cho từng giọng đã tải, để qua lại giữa nữ/nam không phải tải lại.
  const [audioUrls, setAudioUrls] = useState<Partial<Record<Voice, string>>>({})

  async function handleClick() {
    if (status === 'loading') return

    const cached = audioUrls[voice]
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

      setAudioUrls((prev) => ({ ...prev, [voice]: data.audio_url }))
      setStatus('idle')
      playAudio(data.audio_url)
    } catch (err) {
      console.error('Lỗi phát âm:', err)
      setStatus('error')
      // Tự quay lại trạng thái bình thường sau 2 giây để người dùng bấm thử lại được
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  function playAudio(url: string) {
    new Audio(url).play().catch(err => console.error('Lỗi phát audio:', err))
  }

  return (
    <div className="flex items-center gap-1">
      {/* Chọn giọng — chỉ đổi lựa chọn, chưa tự phát; bấm nút loa bên cạnh để nghe */}
      <div className="flex rounded-full bg-zinc-800 p-0.5 text-[10px] leading-none">
        <button
          type="button"
          onClick={() => setVoice('female')}
          title="Giọng nữ"
          className={`px-1.5 py-0.5 rounded-full transition ${
            voice === 'female' ? 'bg-emerald-500/30 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Nữ
        </button>
        <button
          type="button"
          onClick={() => setVoice('male')}
          title="Giọng nam"
          className={`px-1.5 py-0.5 rounded-full transition ${
            voice === 'male' ? 'bg-emerald-500/30 text-emerald-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Nam
        </button>
      </div>

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
