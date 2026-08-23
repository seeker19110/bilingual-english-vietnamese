import { useState, useRef } from 'react'
import { Mic, Square, Loader2, RotateCcw, Volume2 } from 'lucide-react'
import { startListening, isSTTSupported } from '../lib/stt'
import { scorePronunciation, pronounceFeedback, scoreWords } from '../lib/pronounceScore'
import type { WordScore } from '../lib/pronounceScore'
import { coachTips } from '../lib/pronounceCoach'
import { speak } from '../lib/tts'
import DetailedPronunciationCheck from './DetailedPronunciationCheck'

interface Props {
  target: string
  lang: 'en' | 'vi'
  isA: boolean
}

// Nút chấm phát âm: bấm nói → STT nghe → highlight từng từ đúng/sai + điểm tổng.
export default function PronunciationCheck({ target, lang, isA }: Props) {
  const [status, setStatus] = useState<'idle' | 'listening'>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [words, setWords] = useState<WordScore[]>([])
  const [error, setError] = useState('')
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
        setError(
          err === 'no-speech'
            ? isA
              ? 'Không nghe thấy gì.'
              : 'No speech detected.'
            : isA
              ? 'Lỗi micro, thử lại.'
              : 'Mic error, try again.',
        )
      },
    )
  }

  function stop() {
    stopRef.current?.()
    setStatus('idle')
  }

  const fb = score !== null ? pronounceFeedback(score, isA) : null

  // Gợi ý sửa lỗi phát âm (tối đa 2) — CHỈ chiều A (người Việt học tiếng Anh):
  // bảng WORD_TRAPS (src/data/pronunciationTraps.ts) soạn riêng cho lỗi người Việt
  // đọc TIẾNG ANH, tip luôn viết bằng tiếng Việt. Ở chiều B (target là tiếng Việt),
  // luật "nuốt âm cuối" vẫn có thể khớp nhầm trên từ tiếng Việt (vd "một"/"mộ") và
  // hiện tip tiếng Việt cho người học tiếng Việt bằng giao diện tiếng Anh — sai cả
  // ngôn ngữ lẫn ý nghĩa, nên tắt hẳn ở chiều B tới khi có bảng lỗi riêng cho chiều B.
  const tips = isA
    ? coachTips(
        words
          .filter((w) => w.trapHit && w.spokenWord)
          .map((w) => ({ target: w.word, spoken: w.spokenWord! })),
      )
    : []

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Nút bấm */}
      <button
        onClick={status === 'listening' ? stop : start}
        className={`flex items-center gap-2 px-4 py-2 min-h-11 rounded-xl text-sm font-medium transition ${
          status === 'listening'
            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        {status === 'listening' ? (
          <>
            <Square className="w-4 h-4" />{' '}
            {isA ? 'Đang nghe... bấm để dừng' : 'Listening... tap to stop'}
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" /> {isA ? 'Chấm phát âm' : 'Check pronunciation'}
          </>
        )}
      </button>

      {/* Gợi nhắc khi đang nghe */}
      {status === 'listening' && (
        <span className="flex items-center gap-1 text-xs text-zinc-400">
          <Loader2 className="w-3 h-3 animate-spin" />{' '}
          {isA ? `Hãy đọc: "${target}"` : `Say: "${target}"`}
        </span>
      )}

      {/* Kết quả: điểm + highlight từng từ */}
      {fb && words.length > 0 && (
        <div className="w-full text-center space-y-2">
          {/* Điểm tổng */}
          <p className={`text-sm font-bold ${fb.color}`}>
            {score}% · {fb.label}
          </p>

          {/* Highlight từng từ: xanh = đúng, đỏ = sai/thiếu */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {words.map((w, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                  w.ok
                    ? 'bg-accent-500/15 text-accent-300 border border-accent-500/25'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                }`}
              >
                {w.word}
              </span>
            ))}
          </div>

          {/* Câu người dùng đọc */}
          <p className="text-xs text-zinc-400">
            {isA ? 'Bạn đọc' : 'You said'}: "<span className="text-zinc-400">{heard}</span>"
          </p>

          {/* Gợi ý huấn luyện viên lỗi: vì sao sai + nút nghe lại từ đúng */}
          {tips.length > 0 && (
            <div className="flex flex-col gap-1.5 text-left">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5"
                >
                  <button
                    onClick={() => void speak(tip.word, lang === 'en' ? 'en-US' : 'vi-VN')}
                    aria-label={isA ? `Nghe lại từ "${tip.word}"` : `Listen to "${tip.word}"`}
                    className="tap-44 flex-shrink-0 text-amber-300 hover:text-amber-200 transition"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-amber-200/90 leading-relaxed">{tip.tipVi}</p>
                </div>
              ))}
            </div>
          )}

          {/* Nút thử lại */}
          <button
            onClick={start}
            className="tap-44 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition mx-auto px-1"
          >
            <RotateCcw className="w-3 h-3" /> {isA ? 'Thử lại' : 'Try again'}
          </button>
        </div>
      )}

      {/* Kết quả khi câu 1 từ (không có words array đủ) */}
      {fb && words.length === 0 && (
        <div className="text-center">
          <p className={`text-sm font-bold ${fb.color}`}>
            {score}% · {fb.label}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isA ? 'Bạn đọc' : 'You said'}: "{heard}"
          </p>
        </div>
      )}

      {error && <p className="text-xs text-rose-400/80">{error}</p>}

      {/* Chấm chi tiết bằng AI (① Giai đoạn 2, Azure) — CHỈ tiếng Anh, Azure chưa hỗ trợ vi-VN */}
      {lang === 'en' && <DetailedPronunciationCheck target={target} isA={isA} />}
    </div>
  )
}
