import { useState, useRef } from 'react'
import { Mic, Square, Loader2, RotateCcw } from 'lucide-react'
import { startListening, isSTTSupported } from '../lib/stt'
import { scorePronunciation, pronounceFeedback, scoreWords } from '../lib/pronounceScore'

interface Props {
  target: string
  lang: 'en' | 'vi'
  isA: boolean
}

// Nút chấm phát âm: bấm nói → STT nghe → highlight từng từ đúng/sai + điểm tổng.
export default function PronunciationCheck({ target, lang, isA }: Props) {
  const [status, setStatus] = useState<'idle' | 'listening'>('idle')
  const [score,  setScore]  = useState<number | null>(null)
  const [heard,  setHeard]  = useState('')
  const [words,  setWords]  = useState<Array<{ word: string; ok: boolean }>>([])
  const [error,  setError]  = useState('')
  const stopRef = useRef<(() => void) | null>(null)

  if (!isSTTSupported()) return null

  function start() {
    setScore(null)
    setHeard('')
    setWords([])
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
          setWords(scoreWords(target, last))
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
    <div className="flex flex-col items-center gap-3">
      {/* Nút bấm */}
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

      {/* Gợi nhắc khi đang nghe */}
      {status === 'listening' && (
        <span className="flex items-center gap-1 text-xs text-zinc-400">
          <Loader2 className="w-3 h-3 animate-spin" /> {isA ? `Hãy đọc: "${target}"` : `Say: "${target}"`}
        </span>
      )}

      {/* Kết quả: điểm + highlight từng từ */}
      {fb && words.length > 0 && (
        <div className="w-full text-center space-y-2">
          {/* Điểm tổng */}
          <p className={`text-sm font-bold ${fb.color}`}>{score}% · {fb.label}</p>

          {/* Highlight từng từ: xanh = đúng, đỏ = sai/thiếu */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {words.map((w, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                w.ok
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
              }`}>
                {w.word}
              </span>
            ))}
          </div>

          {/* Câu người dùng đọc */}
          <p className="text-xs text-zinc-400">{isA ? 'Bạn đọc' : 'You said'}: "<span className="text-zinc-400">{heard}</span>"</p>

          {/* Nút thử lại */}
          <button onClick={start}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition mx-auto">
            <RotateCcw className="w-3 h-3" /> {isA ? 'Thử lại' : 'Try again'}
          </button>
        </div>
      )}

      {/* Kết quả khi câu 1 từ (không có words array đủ) */}
      {fb && words.length === 0 && (
        <div className="text-center">
          <p className={`text-sm font-bold ${fb.color}`}>{score}% · {fb.label}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{isA ? 'Bạn đọc' : 'You said'}: "{heard}"</p>
        </div>
      )}

      {error && <p className="text-xs text-rose-400/80">{error}</p>}
    </div>
  )
}
