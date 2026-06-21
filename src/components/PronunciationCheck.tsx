import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { startListening, isSTTSupported } from '../lib/stt'
import { scorePronunciation, pronounceFeedback } from '../lib/pronounceScore'

interface Props {
  // Từ/câu mục tiêu cần đọc đúng
  target: string
  // Ngôn ngữ đọc: 'en' (chiều A đọc tiếng Anh) | 'vi' (chiều B đọc tiếng Việt)
  lang: 'en' | 'vi'
  isA: boolean
}

// Nút "chấm phát âm": bấm để nói → STT nghe → so với mục tiêu → hiện điểm.
// Hoàn toàn chạy ở trình duyệt (Web Speech), không cần API key.
export default function PronunciationCheck({ target, lang, isA }: Props) {
  const [status, setStatus] = useState<'idle' | 'listening'>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [error, setError] = useState('')
  const stopRef = useRef<(() => void) | null>(null)

  if (!isSTTSupported()) return null

  function start() {
    setScore(null)
    setHeard('')
    setError('')
    setStatus('listening')
    stopRef.current = startListening(
      lang,
      () => {},
      (last) => {
        setStatus('idle')
        if (last.trim()) {
          setHeard(last)
          setScore(scorePronunciation(target, last))
        } else {
          setError(isA ? 'Không nghe rõ, thử lại nhé.' : 'Did not catch that, try again.')
        }
      },
      (err) => {
        setStatus('idle')
        setError(err === 'no-speech'
          ? (isA ? 'Không nghe thấy gì.' : 'No speech detected.')
          : (isA ? 'Lỗi micro, thử lại.' : 'Mic error, try again.'))
      },
    )
  }

  function stop() {
    stopRef.current?.()
    setStatus('idle')
  }

  const fb = score !== null ? pronounceFeedback(score, isA) : null

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={status === 'listening' ? stop : start}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
          status === 'listening'
            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        {status === 'listening'
          ? <><Square className="w-4 h-4" /> {isA ? 'Đang nghe... bấm để dừng' : 'Listening... tap to stop'}</>
          : <><Mic className="w-4 h-4" /> {isA ? 'Chấm phát âm' : 'Check pronunciation'}</>}
      </button>

      {status === 'listening' && (
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Loader2 className="w-3 h-3 animate-spin" /> {isA ? `Hãy đọc: "${target}"` : `Say: "${target}"`}
        </span>
      )}

      {fb && (
        <div className="text-center">
          <p className={`text-sm font-bold ${fb.color}`}>{score}% · {fb.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{isA ? 'Bạn đọc' : 'You said'}: "{heard}"</p>
        </div>
      )}

      {error && <p className="text-xs text-rose-400/80">{error}</p>}
    </div>
  )
}
