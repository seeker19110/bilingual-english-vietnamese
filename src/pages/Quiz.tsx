import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, RotateCcw, Home } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/useAuth'
import { getLearnedWords } from '../lib/vocab'
import { getLearningPath } from '../lib/curriculum'
import { useLang } from '../context/useLang'
import { getDirection } from '../lib/storage'

const QUIZ_SIZE = 10
const CHOICES   = 4

interface Question {
  word:    string   // từ tiếng Anh
  correct: string   // nghĩa đúng (tiếng Việt)
  options: string[] // 4 lựa chọn (gộp correct vào)
}

// Xáo trộn mảng (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuiz(userId: string): Question[] {
  const learned  = getLearnedWords(userId)
  const allWords = getLearningPath()

  // Ưu tiên các từ đã học; nếu chưa đủ, bổ sung từ đầu lộ trình
  const pool = allWords.filter(w => learned.has(w.word) || learned.has(w.word.toLowerCase()))
  const candidates = pool.length >= QUIZ_SIZE ? pool : [...pool, ...allWords.slice(0, QUIZ_SIZE - pool.length)]
  const questions  = shuffle(candidates).slice(0, QUIZ_SIZE)

  // Tập nghĩa dùng để tạo đáp án nhiễu
  const allMeanings = allWords.map(w => w.vi)

  return questions.map(q => {
    const wrongs = shuffle(allMeanings.filter(m => m !== q.vi)).slice(0, CHOICES - 1)
    return {
      word:    q.word,
      correct: q.vi,
      options: shuffle([q.vi, ...wrongs]),
    }
  })
}

export default function Quiz() {
  const nav         = useNavigate()
  const { user }    = useAuth()
  useLang()
  const isA = getDirection() === 'A'

  // Quiz được tạo 1 lần, không thay đổi khi re-render
  const questions = useMemo(() => user ? buildQuiz(user.id) : [], [user])

  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers,  setAnswers]  = useState<boolean[]>([])
  const [done,     setDone]     = useState(false)

  if (!user || questions.length === 0) return null

  const q      = questions[current]
  const score  = answers.filter(Boolean).length
  const pct    = Math.round((score / QUIZ_SIZE) * 100)

  function pick(option: string) {
    if (selected !== null) return
    setSelected(option)
  }

  function next() {
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (current + 1 >= QUIZ_SIZE) {
      setDone(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setDone(false)
    // Không rebuild quiz — dùng lại câu hỏi cũ (component không re-mount)
  }

  // ── Màn hình kết quả ──────────────────────────────────────────────────────
  if (done) {
    const grade = pct >= 90 ? { emoji: '🏆', label: isA ? 'Xuất sắc!' : 'Excellent!' }
                : pct >= 70 ? { emoji: '👍', label: isA ? 'Tốt lắm!' : 'Good job!' }
                : pct >= 50 ? { emoji: '💪', label: isA ? 'Cố lên!' : 'Keep going!' }
                :             { emoji: '📚', label: isA ? 'Cần ôn thêm' : 'Study more' }

    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout title={isA ? 'Kết quả kiểm tra' : 'Quiz Result'} />
        <main className="max-w-sm mx-auto px-4 py-10 text-center space-y-6">
          <div className="text-6xl">{grade.emoji}</div>
          <div>
            <p className="text-3xl font-bold text-white">{score}/{QUIZ_SIZE}</p>
            <p className="text-zinc-400 mt-1">{grade.label}</p>
          </div>

          {/* Thanh tiến trình điểm */}
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-zinc-400">{pct}%</p>

          {/* Tổng kết từng câu */}
          <div className="space-y-1.5 text-left">
            {questions.map((qq, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                answers[i] ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
              }`}>
                <span>{answers[i] ? '✓' : '✗'}</span>
                <span className="font-medium">{qq.word}</span>
                <span className="text-zinc-500 flex-1 truncate">= {qq.correct}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={restart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition">
              <RotateCcw className="w-4 h-4" />
              {isA ? 'Làm lại' : 'Retry'}
            </button>
            <button onClick={() => nav('/')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition">
              <Home className="w-4 h-4" />
              {isA ? 'Trang chủ' : 'Home'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Màn hình câu hỏi ──────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={isA ? `Câu ${current + 1}/${QUIZ_SIZE}` : `Q ${current + 1}/${QUIZ_SIZE}`} />

      <main className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Thanh tiến trình */}
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(current / QUIZ_SIZE) * 100}%` }} />
        </div>

        {/* Từ cần dịch */}
        <div className="text-center py-8">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">
            {isA ? 'Nghĩa tiếng Việt của từ này là?' : 'What is the Vietnamese meaning?'}
          </p>
          <p className="text-4xl font-bold text-white">{q.word}</p>
        </div>

        {/* 4 lựa chọn */}
        <div className="space-y-3">
          {q.options.map(opt => {
            const isCorrect = opt === q.correct
            const isChosen  = opt === selected
            let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
            if (selected !== null) {
              if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
              else if (isChosen) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
              else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600'
            }
            return (
              <button key={opt} onClick={() => pick(opt)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Nút tiếp theo (chỉ hiện sau khi chọn) */}
        {selected !== null && (
          <button onClick={next}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition animate-fade-in">
            {current + 1 >= QUIZ_SIZE
              ? (isA ? 'Xem kết quả' : 'See results')
              : (isA ? 'Câu tiếp theo' : 'Next question')}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </main>
    </div>
  )
}
