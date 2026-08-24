// Practice — trang GỘP "Luyện tập" (4 kỹ năng Nghe/Nói/Đọc/Viết vào 1 trang).
// Các tính năng NẶNG (AI hội thoại, chấm bài viết) vẫn ở nguyên trang gốc /chat,
// /speaking, /writing — trang này chỉ điều hướng tới (KHÔNG đổi code các trang đó).
// Các bài tập MỚI chạy ngay tại đây, dùng lại dữ liệu/hàm đã có sẵn (curriculum,
// listening.ts, PronunciationCheck, challengeTopics) — không soạn nội dung mới,
// TRỪ 2 bài đợt 2 (shadowing, phỏng vấn ngược) cần gọi AI chấm nội dung —
// dùng chung cột lượt "speaking" đã có (LIMITS trong types.ts), KHÔNG thêm cột mới.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Headphones,
  Mic,
  PenLine,
  MessageCircle,
  Volume2,
  Keyboard,
  ListChecks,
  Shuffle,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Square,
  Sparkles,
  BookOpen,
  BookMarked,
  Video,
  AlertCircle,
  Award,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Activity,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import Layout from '../../components/Layout.js'
import PageHeader from '../../components/PageHeader.js'
import PronunciationCheck from '../../components/PronunciationCheck.js'
import PvPArenaCard from '../../components/PvPArena/PvPArenaCard.js'
import { getDirection, getUsage, incrementUsage } from '../../lib/storage'
import { useAuth } from '../../context/useAuth'
import { loadCurriculum, getLearningPath } from '../../lib/curriculum'
import { getLearnedWords } from '../../lib/vocab'
import { buildDictationItems, type DictationItem } from '../../lib/listening'
import { scorePronunciation, scoreWords, type WordScore } from '../../lib/pronounceScore'
import { speak } from '../../lib/tts'
import { startListening, isSTTSupported } from '../../lib/stt'
import { callClaude, parseJson } from '../../lib/ai'
import { interviewAnswerFeedbackPrompt } from '../../prompts'
import { effectivePlan } from '../../lib/promo'
import { getLimits } from '../../lib/appSettings'
import { CHALLENGE_TOPICS } from '../../data/challengeTopics'
import type { DictEntry, User } from '../../types'
import { shuffle } from '@dhcb/core-contracts/shuffle'

type Mode =
  | 'hub'
  | 'vocab-listen'
  | 'scramble'
  | 'dictation'
  | 'fillblank'
  | 'pronounce-words'
  | 'read-aloud'
  | 'shadowing'
  | 'interview'

const SESSION_SIZE = 8
const INTERVIEW_ROUNDS = 5

// Rút câu ví dụ (ex_en/ex_vi) từ 1 pool từ vựng, lọc theo độ dài — dùng chung
// cho Sắp xếp câu và Shadowing.
function pickExampleSentences(
  pool: DictEntry[],
  isA: boolean,
  minWords: number,
  maxWords: number,
  count: number,
): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of shuffle(pool)) {
    const text = isA ? w.ex_en : w.ex_vi
    const n = text.trim().split(/\s+/).filter(Boolean).length
    if (text && n >= minWords && n <= maxWords && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
    if (out.length >= count) break
  }
  return out
}

// ── Kết quả cuối phiên (dùng chung cho mọi mini-game) ─────────────────────
function GameResult({
  score,
  total,
  isA,
  onRetry,
  onExit,
}: {
  score: number
  total: number
  isA: boolean
  onRetry: () => void
  onExit: () => void
}) {
  const pct = total > 0 ? (score / total) * 100 : 0
  const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'

  return (
    <div className="text-center space-y-6 py-10 max-w-sm mx-auto animate-fade-up">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-accent-500/20 to-indigo-500/10 border border-accent-500/30 flex items-center justify-center text-4xl shadow-lg shadow-accent-500/15">
        {emoji}
      </div>
      <div>
        <p className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          {score}
          <span className="text-2xl text-zinc-500 font-bold">/{total}</span>
        </p>
        <p className="text-sm font-medium text-zinc-400 mt-1.5">
          {isA ? 'Điểm phiên luyện tập này' : 'Score for this session'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 min-h-11 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-semibold hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200 active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" /> {isA ? 'Làm lại' : 'Retry'}
        </button>
        <button
          onClick={onExit}
          className="flex-1 px-5 py-3.5 min-h-11 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold hover:from-accent-400 hover:to-accent-500 transition-all duration-200 shadow-md shadow-accent-500/25 active:scale-95"
        >
          {isA ? 'Về Luyện tập' : 'Back to Practice'}
        </button>
      </div>
    </div>
  )
}

function MiniHeader({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-zinc-400">{sub}</p>
      </div>
      <button
        onClick={onBack}
        className="text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800/60 transition"
      >
        ✕
      </button>
    </div>
  )
}

// ── 1) Nghe đoán từ vựng — nghe audio, chọn nghĩa đúng trong 4 lựa chọn ────
function VocabListenGuess({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo(() => shuffle(pool).slice(0, SESSION_SIZE), [pool])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const current = items[idx]

  const options = useMemo(() => {
    if (!current) return []
    const wrong = shuffle(pool.filter((w) => w.word !== current.word)).slice(0, 3)
    return shuffle([current, ...wrong]).map((w) => (isA ? w.vi : w.word))
  }, [current, pool, isA])

  useEffect(() => {
    if (current) void speak(isA ? current.word : current.vi, isA ? 'en-US' : 'vi-VN')
  }, [current, isA])

  if (items.length < 4) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Chưa đủ từ vựng đã học để luyện — hãy học thêm từ mới nhé.'
          : 'Not enough learned words yet — learn more words first.'}
      </p>
    )
  }

  if (idx >= items.length || !current) {
    return (
      <GameResult
        score={score}
        total={items.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setScore(0)
          setPicked(null)
        }}
        onExit={onExit}
      />
    )
  }

  const correctAnswer = isA ? current.vi : current.word

  function choose(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === correctAnswer) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <div className="flex justify-center">
        <button
          onClick={() =>
            current && void speak(isA ? current.word : current.vi, isA ? 'en-US' : 'vi-VN')
          }
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition"
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-sm font-medium">{isA ? 'Nghe lại' : 'Play again'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const isCorrect = opt === correctAnswer
          const showState = picked !== null
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={showState}
              className={`flex items-center justify-between px-4 py-3 min-h-11 rounded-xl text-sm font-medium border transition text-left ${
                showState && isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : showState && opt === picked
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {opt}
              {showState && isCorrect && <Check className="w-4 h-4" />}
              {showState && opt === picked && !isCorrect && <X className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
      {picked && (
        <button
          onClick={() => {
            setIdx((i) => i + 1)
            setPicked(null)
          }}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </button>
      )}
    </div>
  )
}

// ── 2) Sắp xếp câu — ghép các từ theo đúng thứ tự ──────────────────────────
function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?"']/g, '')
    .trim()
}

function SentenceScramble({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const sentences = useMemo(() => pickExampleSentences(pool, isA, 4, 8, SESSION_SIZE), [pool, isA])

  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [built, setBuilt] = useState<string[]>([])
  const [bank, setBank] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean | null>(null)

  const target = sentences[idx]

  useEffect(() => {
    if (target) {
      setBank(shuffle(target.trim().split(/\s+/)))
      setBuilt([])
      setChecked(null)
    }
  }, [target])

  if (sentences.length < 3) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ phù hợp để sắp xếp.' : 'Not enough example sentences yet.'}
      </p>
    )
  }

  if (idx >= sentences.length || !target) {
    return (
      <GameResult
        score={score}
        total={sentences.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setScore(0)
        }}
        onExit={onExit}
      />
    )
  }

  function tapBank(word: string, i: number) {
    if (checked) return
    setBuilt((b) => [...b, word])
    setBank((b) => b.filter((_, j) => j !== i))
  }

  function tapBuilt(i: number) {
    if (checked) return
    const word = built[i]
    if (word === undefined) return
    setBank((b) => [...b, word])
    setBuilt((b) => b.filter((_, j) => j !== i))
  }

  function check() {
    const ok = normalizeForCompare(built.join(' ')) === normalizeForCompare(target ?? '')
    setChecked(ok)
    if (ok) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{sentences.length}
      </p>
      <button
        onClick={() => void speak(target, isA ? 'en-US' : 'vi-VN')}
        className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition"
      >
        <Volume2 className="w-4 h-4" /> {isA ? 'Nghe câu' : 'Listen'}
      </button>

      <div className="min-h-14 flex flex-wrap gap-2 p-3 rounded-xl border border-zinc-700/60 bg-zinc-900/50">
        {built.length === 0 && (
          <span className="text-xs text-zinc-500">
            {isA ? 'Bấm các từ bên dưới theo đúng thứ tự' : 'Tap the words below in order'}
          </span>
        )}
        {built.map((w, i) => (
          <button
            key={i}
            onClick={() => tapBuilt(i)}
            className="px-3 py-1.5 rounded-lg bg-accent-500/20 text-accent-200 text-sm font-medium border border-accent-500/30"
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map((w, i) => (
          <button
            key={i}
            onClick={() => tapBank(w, i)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition"
          >
            {w}
          </button>
        ))}
      </div>

      {checked !== null && (
        <p
          className={`text-center text-sm font-medium ${checked ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {checked
            ? isA
              ? 'Chính xác! 🎉'
              : 'Correct! 🎉'
            : `${isA ? 'Đáp án đúng' : 'Correct answer'}: ${target}`}
        </p>
      )}

      {checked === null ? (
        <button
          onClick={check}
          disabled={bank.length > 0}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {isA ? 'Kiểm tra' : 'Check'}
        </button>
      ) : (
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </button>
      )}
    </div>
  )
}

// ── 3) Nghe & viết lại (chính tả) ───────────────────────────────────────
function DictationTyping({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo<DictationItem[]>(
    () => buildDictationItems(isA, [], pool, SESSION_SIZE),
    [pool, isA],
  )
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [typed, setTyped] = useState('')
  const [checked, setChecked] = useState<number | null>(null)
  const current = items[idx]

  useEffect(() => {
    if (current) void speak(current.text, current.lang)
  }, [current])

  if (items.length < 3) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện chính tả.' : 'Not enough sentences yet.'}
      </p>
    )
  }

  if (idx >= items.length || !current) {
    return (
      <GameResult
        score={score}
        total={items.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setScore(0)
          setTyped('')
          setChecked(null)
        }}
        onExit={onExit}
      />
    )
  }

  function check() {
    if (!current) return
    const s = scorePronunciation(current.text, typed)
    setChecked(s)
    if (s >= 85) setScore((sc) => sc + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <div className="flex justify-center">
        <button
          onClick={() => void speak(current.text, current.lang)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-accent-500/15 border border-accent-500/30 text-accent-300 hover:bg-accent-500/25 transition"
        >
          <Volume2 className="w-6 h-6" />
          <span className="text-sm font-medium">{isA ? 'Nghe câu' : 'Play sentence'}</span>
        </button>
      </div>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={checked !== null}
        placeholder={isA ? 'Gõ lại những gì bạn nghe được...' : 'Type what you heard...'}
        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-accent-500"
      />
      {checked !== null && (
        <div className="text-center space-y-1">
          <p
            className={`text-sm font-bold ${checked >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {checked}%
          </p>
          <p className="text-xs text-zinc-400">
            {isA ? 'Câu đúng' : 'Correct sentence'}: "{current.text}"
          </p>
        </div>
      )}
      {checked === null ? (
        <button
          onClick={check}
          disabled={!typed.trim()}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {isA ? 'Kiểm tra' : 'Check'}
        </button>
      ) : (
        <button
          onClick={() => {
            setIdx((i) => i + 1)
            setTyped('')
            setChecked(null)
          }}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </button>
      )}
    </div>
  )
}

// ── 4) Điền từ trắc nghiệm — chọn từ đúng lấp vào câu ví dụ ─────────────
function FillBlankQuiz({
  pool,
  isA,
  onExit,
}: {
  pool: DictEntry[]
  isA: boolean
  onExit: () => void
}) {
  const items = useMemo(() => {
    return shuffle(pool)
      .filter((w) => (isA ? w.ex_en : w.ex_vi))
      .slice(0, SESSION_SIZE)
  }, [pool, isA])
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const current = items[idx]

  const answer = current ? (isA ? current.word : current.vi) : ''
  const sentence = current ? (isA ? current.ex_en : current.ex_vi) : ''
  const blanked = useMemo(() => {
    if (!current) return ''
    const re = new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    return sentence.replace(re, '_____')
  }, [current, answer, sentence])

  const options = useMemo(() => {
    if (!current) return []
    const wrong = shuffle(pool.filter((w) => w.word !== current.word)).slice(0, 3)
    return shuffle([current, ...wrong]).map((w) => (isA ? w.word : w.vi))
  }, [current, pool, isA])

  if (items.length < 4) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện điền từ.' : 'Not enough sentences yet.'}
      </p>
    )
  }

  if (idx >= items.length) {
    return (
      <GameResult
        score={score}
        total={items.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setScore(0)
          setPicked(null)
        }}
        onExit={onExit}
      />
    )
  }

  function choose(opt: string) {
    if (picked) return
    setPicked(opt)
    if (opt === answer) setScore((s) => s + 1)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <p className="text-center text-base text-white leading-relaxed px-2">{blanked}</p>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const isCorrect = opt === answer
          const showState = picked !== null
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              disabled={showState}
              className={`flex items-center justify-between px-4 py-3 min-h-11 rounded-xl text-sm font-medium border transition text-left ${
                showState && isCorrect
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : showState && opt === picked
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {opt}
              {showState && isCorrect && <Check className="w-4 h-4" />}
              {showState && opt === picked && !isCorrect && <X className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
      {picked && (
        <button
          onClick={() => {
            setIdx((i) => i + 1)
            setPicked(null)
          }}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </button>
      )}
    </div>
  )
}

// ── 5) Chấm phát âm từ vựng / 6) Đọc lại câu — dùng lại PronunciationCheck ──
function PronounceList({
  items,
  isA,
  lang,
  onExit,
}: {
  items: string[]
  isA: boolean
  lang: 'en' | 'vi'
  onExit: () => void
}) {
  const [idx, setIdx] = useState(0)
  const current = items[idx]

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ nội dung để luyện.' : 'Not enough content yet.'}
      </p>
    )
  }

  if (idx >= items.length || !current) {
    return (
      <GameResult
        score={items.length}
        total={items.length}
        isA={isA}
        onRetry={() => setIdx(0)}
        onExit={onExit}
      />
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{items.length}
      </p>
      <p className="text-center text-lg font-semibold text-white px-2">{current}</p>
      <PronunciationCheck key={current} target={current} lang={lang} isA={isA} />
      <button
        onClick={() => setIdx((i) => i + 1)}
        className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
      >
        {isA ? 'Tiếp theo →' : 'Next →'}
      </button>
    </div>
  )
}

const SHADOW_PASS_THRESHOLD = 70

// ── 7) Shadowing — nói đè theo audio ngay khi đang phát ────────────────────
function Shadowing({ pool, isA, onExit }: { pool: DictEntry[]; isA: boolean; onExit: () => void }) {
  const sentences = useMemo(() => pickExampleSentences(pool, isA, 3, 10, SESSION_SIZE), [pool, isA])
  const [idx, setIdx] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [status, setStatus] = useState<'idle' | 'active'>('idle')
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [words, setWords] = useState<WordScore[]>([])
  const [error, setError] = useState('')
  const stopRef = useRef<(() => void) | null>(null)
  const target = sentences[idx]

  if (!isSTTSupported()) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Trình duyệt không hỗ trợ nhận giọng nói — dùng Chrome hoặc Edge.'
          : 'Your browser does not support speech recognition — use Chrome or Edge.'}
      </p>
    )
  }

  if (sentences.length < 3) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA ? 'Chưa đủ câu ví dụ để luyện shadowing.' : 'Not enough sentences yet.'}
      </p>
    )
  }

  if (idx >= sentences.length || !target) {
    return (
      <GameResult
        score={passCount}
        total={sentences.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setPassCount(0)
          setScore(null)
          setHeard('')
        }}
        onExit={onExit}
      />
    )
  }

  function start() {
    if (!target) return
    setHeard('')
    setScore(null)
    setWords([])
    setError('')
    setStatus('active')
    // Phát audio VÀ mở mic CÙNG LÚC — người học nói đè theo ngay khi nghe,
    // khác "Đọc lại câu" (nghe xong mới đọc).
    void speak(target, isA ? 'en-US' : 'vi-VN')
    stopRef.current = startListening(
      isA ? 'en' : 'vi',
      () => {},
      (last) => {
        setStatus('idle')
        if (!last.trim()) {
          setError(isA ? 'Không nghe rõ, thử lại nhé.' : 'Did not catch that, try again.')
          return
        }
        setHeard(last)
        const s = scorePronunciation(target, last)
        setScore(s)
        setWords(scoreWords(target, last))
        if (s >= SHADOW_PASS_THRESHOLD) setPassCount((c) => c + 1)
      },
      () => {
        setStatus('idle')
        setError(isA ? 'Lỗi micro, thử lại.' : 'Mic error, try again.')
      },
    )
  }

  function stop() {
    stopRef.current?.()
    setStatus('idle')
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{sentences.length}
      </p>
      <p className="text-center text-lg font-semibold text-white px-2">{target}</p>

      <div className="flex justify-center">
        <button
          onClick={status === 'active' ? stop : start}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition ${
            status === 'active'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-accent-500/15 border-accent-500/30 text-accent-300 hover:bg-accent-500/25'
          }`}
        >
          {status === 'active' ? (
            <>
              <Square className="w-5 h-5" />
              <span className="text-sm font-medium">{isA ? 'Đang nói đè...' : 'Shadowing...'}</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Bắt đầu — nghe & nói đè theo' : 'Start — listen & speak along'}
              </span>
            </>
          )}
        </button>
      </div>

      {score !== null && (
        <div className="text-center space-y-2">
          <p
            className={`text-sm font-bold ${score >= SHADOW_PASS_THRESHOLD ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {score}%
          </p>
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
          <p className="text-xs text-zinc-400">
            {isA ? 'Bạn nói' : 'You said'}: "{heard}"
          </p>
        </div>
      )}
      {error && <p className="text-xs text-rose-400/80 text-center">{error}</p>}

      {score !== null && (
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu tiếp theo →' : 'Next →'}
        </button>
      )}
    </div>
  )
}

interface InterviewFeedback {
  score: number
  feedback: string
  correction: string
}

// ── 8) Phỏng vấn ngược — AI hỏi (chủ đề Challenge có sẵn), học viên trả lời
// nói tự do, 1 lượt gọi AI chấm NHANH nội dung. Dùng chung cột lượt "speaking"
// (LIMITS trong types.ts) — KHÔNG thêm cột đếm mới.
function ReverseInterview({ isA, user, onExit }: { isA: boolean; user: User; onExit: () => void }) {
  const topics = useMemo(() => shuffle(CHALLENGE_TOPICS).slice(0, INTERVIEW_ROUNDS), [])
  const [idx, setIdx] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<InterviewFeedback | null>(null)
  const [error, setError] = useState('')
  const [limitHit, setLimitHit] = useState(false)
  const stopRef = useRef<(() => void) | null>(null)
  const topic = topics[idx]

  if (!isSTTSupported()) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Trình duyệt không hỗ trợ nhận giọng nói — dùng Chrome hoặc Edge.'
          : 'Your browser does not support speech recognition — use Chrome or Edge.'}
      </p>
    )
  }

  if (idx >= topics.length || !topic) {
    return (
      <GameResult
        score={passCount}
        total={topics.length}
        isA={isA}
        onRetry={() => {
          setIdx(0)
          setPassCount(0)
          setResult(null)
          setTranscript('')
        }}
        onExit={onExit}
      />
    )
  }

  function startAnswer() {
    setTranscript('')
    setResult(null)
    setError('')
    setListening(true)
    stopRef.current = startListening(
      isA ? 'en' : 'vi',
      () => {},
      (last) => {
        setListening(false)
        if (!last.trim()) {
          setError(isA ? 'Không nghe rõ, thử lại nhé.' : 'Did not catch that, try again.')
          return
        }
        setTranscript(last)
      },
      () => {
        setListening(false)
        setError(isA ? 'Lỗi micro, thử lại.' : 'Mic error, try again.')
      },
    )
  }

  function stopAnswer() {
    stopRef.current?.()
    setListening(false)
  }

  async function grade() {
    if (!topic) return
    // Free plan: server tự chặn theo kho lượt tuần (không suy được từ localStorage) —
    // chỉ chặn TRƯỚC ở client cho gói trả phí, giống Speaking.tsx.
    const plan = effectivePlan(user.plan)
    const usage = getUsage(user.id)
    if (plan !== 'free' && usage.speakingCount >= getLimits()[plan].speaking) {
      setLimitHit(true)
      return
    }
    setGrading(true)
    setError('')
    try {
      const question = isA ? topic.titleEn : topic.titleVi
      const sys = interviewAnswerFeedbackPrompt(isA ? 'A' : 'B')
      const raw = await callClaude(
        [{ role: 'user', content: `Câu hỏi: "${question}"\nCâu trả lời: "${transcript}"` }],
        sys,
        512,
        'speaking',
      )
      const ai = parseJson<InterviewFeedback>(raw)
      if (!ai) throw new Error('parse')
      setResult(ai)
      incrementUsage(user.id, 'speakingCount')
      if (ai.score >= 60) setPassCount((c) => c + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : isA ? 'Có lỗi xảy ra' : 'Something went wrong')
    } finally {
      setGrading(false)
    }
  }

  if (limitHit) {
    return (
      <p className="text-sm text-zinc-400 text-center py-8">
        {isA
          ? 'Bạn đã dùng hết lượt Nói hôm nay — quay lại vào ngày mai hoặc nâng cấp gói.'
          : 'You have used all your speaking turns today — come back tomorrow or upgrade.'}
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500 text-center">
        {idx + 1}/{topics.length}
      </p>
      <div className="text-center space-y-1">
        <p className="text-[11px] uppercase tracking-wide text-accent-400 font-semibold">
          {isA ? 'AI hỏi' : 'AI asks'}
        </p>
        <p className="text-lg font-semibold text-white px-2">
          {isA ? topic.titleEn : topic.titleVi}
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={listening ? stopAnswer : startAnswer}
          disabled={grading}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl border transition disabled:opacity-40 ${
            listening
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-accent-500/15 border-accent-500/30 text-accent-300 hover:bg-accent-500/25'
          }`}
        >
          {listening ? (
            <>
              <Square className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Đang nghe... bấm để dừng' : 'Listening... tap to stop'}
              </span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span className="text-sm font-medium">
                {isA ? 'Trả lời bằng giọng nói' : 'Answer by voice'}
              </span>
            </>
          )}
        </button>
      </div>

      {transcript && !result && (
        <div className="text-center space-y-3">
          <p className="text-xs text-zinc-400">
            {isA ? 'Bạn trả lời' : 'You answered'}: "{transcript}"
          </p>
          <button
            onClick={() => void grade()}
            disabled={grading}
            className="flex items-center gap-1.5 mx-auto px-4 py-2.5 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {grading
              ? isA
                ? 'Đang chấm...'
                : 'Grading...'
              : isA
                ? 'AI chấm điểm'
                : 'Grade with AI'}
          </button>
        </div>
      )}

      {result && (
        <div className="text-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p
            className={`text-2xl font-bold ${result.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {result.score}%
          </p>
          <p className="text-sm text-zinc-200">{result.feedback}</p>
          {result.correction && (
            <p className="text-xs text-amber-300/90">
              {isA ? 'Gợi ý câu tốt hơn' : 'Better version'}: {result.correction}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-400/80 text-center">{error}</p>}

      {result && (
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="w-full py-3 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
        >
          {isA ? 'Câu hỏi tiếp theo →' : 'Next question →'}
        </button>
      )}
    </div>
  )
}

// ── Trang chính ─────────────────────────────────────────────────────────
export default function Practice() {
  const nav = useNavigate()
  const { user } = useAuth()
  const dir = getDirection()
  const isA = dir === 'A'
  const [mode, setMode] = useState<Mode>('hub')
  const [pool, setPool] = useState<DictEntry[]>([])

  useEffect(() => {
    loadCurriculum().then(() => {
      const learned = getLearnedWords(user?.id ?? '')
      const path = getLearningPath()
      let p = path.filter((w) => learned.has(w.word.toLowerCase()))
      if (p.length < 12) p = path.slice(0, 80)
      setPool(p)
    })
  }, [user?.id])

  const sentencePool = useMemo(() => pool.filter((w) => (isA ? w.ex_en : w.ex_vi)), [pool, isA])

  if (mode !== 'hub') {
    const titles: Record<Exclude<Mode, 'hub'>, [string, string]> = {
      'vocab-listen': [
        isA ? 'Nghe đoán từ vựng' : 'Listen & guess',
        isA ? 'Nghe rồi chọn nghĩa đúng' : 'Listen then pick the meaning',
      ],
      scramble: [
        isA ? 'Sắp xếp câu' : 'Sentence scramble',
        isA ? 'Ghép từ đúng thứ tự' : 'Put the words in order',
      ],
      dictation: [
        isA ? 'Nghe & viết lại' : 'Listen & write',
        isA ? 'Nghe rồi gõ lại câu' : 'Listen then type the sentence',
      ],
      fillblank: [
        isA ? 'Điền từ trắc nghiệm' : 'Fill in the blank',
        isA ? 'Chọn từ đúng cho câu' : 'Pick the right word',
      ],
      'pronounce-words': [
        isA ? 'Chấm phát âm từ vựng' : 'Word pronunciation',
        isA ? 'Đọc to từng từ, AI chấm điểm' : 'Read each word aloud',
      ],
      'read-aloud': [
        isA ? 'Đọc lại câu' : 'Read the sentence',
        isA ? 'Đọc to cả câu, AI chấm điểm' : 'Read the sentence aloud',
      ],
      shadowing: [
        isA ? 'Shadowing' : 'Shadowing',
        isA ? 'Nghe & nói đè theo ngay khi audio phát' : 'Speak along as the audio plays',
      ],
      interview: [
        isA ? 'Phỏng vấn ngược' : 'Reverse interview',
        isA ? 'AI hỏi, bạn trả lời nói, AI chấm nội dung' : 'AI asks, you answer, AI grades',
      ],
    }
    const [title, sub] = titles[mode]
    return (
      <>
        <Layout onBack={() => setMode('hub')} />
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
          <MiniHeader title={title} sub={sub} onBack={() => setMode('hub')} />
          {mode === 'vocab-listen' && (
            <VocabListenGuess pool={pool} isA={isA} onExit={() => setMode('hub')} />
          )}
          {mode === 'scramble' && (
            <SentenceScramble pool={sentencePool} isA={isA} onExit={() => setMode('hub')} />
          )}
          {mode === 'dictation' && (
            <DictationTyping pool={sentencePool} isA={isA} onExit={() => setMode('hub')} />
          )}
          {mode === 'fillblank' && (
            <FillBlankQuiz pool={sentencePool} isA={isA} onExit={() => setMode('hub')} />
          )}
          {mode === 'pronounce-words' && (
            <PronounceList
              items={shuffle(pool)
                .slice(0, SESSION_SIZE)
                .map((w) => (isA ? w.word : w.vi))}
              isA={isA}
              lang={isA ? 'en' : 'vi'}
              onExit={() => setMode('hub')}
            />
          )}
          {mode === 'read-aloud' && (
            <PronounceList
              items={shuffle(sentencePool)
                .slice(0, SESSION_SIZE)
                .map((w) => (isA ? w.ex_en : w.ex_vi))}
              isA={isA}
              lang={isA ? 'en' : 'vi'}
              onExit={() => setMode('hub')}
            />
          )}
          {mode === 'shadowing' && (
            <Shadowing pool={sentencePool} isA={isA} onExit={() => setMode('hub')} />
          )}
          {mode === 'interview' && user && (
            <ReverseInterview isA={isA} user={user} onExit={() => setMode('hub')} />
          )}
        </main>
      </>
    )
  }

  return (
    <>
      <Layout back={false} />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-7">
        <PageHeader
          title={
            isA ? 'Phòng Luyện Tập Đa Môn & Sửa Lỗi' : 'Multi-Subject Practice & Mistake Studio'
          }
          subtitle={
            isA
              ? 'Luyện tập toàn diện 5 môn học · Giải bài tập từng bước · Sổ tay sửa lỗi AI & Phản xạ'
              : 'Comprehensive practice across 5 subjects · Step-by-step solver · AI mistake bank & reflex drills'
          }
        />

        {/* ── BANNER SPOTLIGHT: SỔ TAY SỬA LỖI ĐA MÔN & CUNG ĐIỆN TRÍ NHỚ ── */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-500/15 via-zinc-900/90 to-amber-500/10 border border-rose-500/30 hover:border-rose-500/60 transition-all duration-200 shadow-lg group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform text-white font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-white text-base">Sổ Tay Sửa Lỗi Đa Môn AI</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Smart Mistake Bank
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                Tự động tổng hợp các bẫy biến đổi Toán - Lý - Hóa, lỗi phát âm IPA, sai ngữ pháp
                IELTS để bạn ôn tập ngắt quãng (SRS) và không lặp lại lỗi sai.
              </p>
            </div>
          </div>
          <button
            onClick={() => nav('/so-tay-loi-sai')}
            className="tap-44 w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition active:scale-95 shrink-0"
          >
            <span>Mở Sổ Lỗi & Ôn Tập</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* DailyQuestsCard + ReferralVipBanner (dữ liệu giả in-memory) đã gỡ 2026-08-23 — hệ nhiệm vụ/giới thiệu THẬT ở /nhiem-vu và /profile (QuestsPanel, ReferralSection) */}

        {/* ── ĐẤU TRƯỜNG 1V1 PVP ARENA ── */}
        <PvPArenaCard />

        {/* ── TẦNG 1: LUYỆN TẬP 5 MÔN HỌC CỐT LÕI & GIẢI ĐỀ AI ── */}
        <section aria-label="Luyện tập 5 Môn học cốt lõi" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 theme-light:text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              1. Luyện Tập 5 Môn Học & Giải Đề Từng Bước
            </h2>
            <button
              onClick={() => nav('/phong-hoc')}
              className="text-[11px] text-zinc-400 hover:text-blue-300 transition flex items-center gap-1 font-medium"
            >
              <span>Xem tất cả môn</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Toán Học */}
            <button
              onClick={() => nav('/phong-hoc/mathematics')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-blue-500/30 hover:border-blue-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">Toán Học</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/20">
                      LaTeX OCR
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Khảo sát hàm số, đạo hàm, tích phân, hình học Oxyz & giải đề thi.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Giải bài tập & Nhận gợi ý Socratic</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Vật Lý */}
            <button
              onClick={() => nav('/phong-hoc/physics')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-cyan-500/30 hover:border-cyan-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Atom className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">Vật Lý</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/20">
                      Simulators
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Dao động cơ, sóng âm, điện xoay chiều kèm phân tích công thức.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-cyan-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Luyện giải & Thí nghiệm</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Hóa Học */}
            <button
              onClick={() => nav('/phong-hoc/chemistry')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-amber-500/30 hover:border-amber-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">Hóa Học</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
                      PTHH Step
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Cân bằng oxi hóa khử, este - lipit, amino axit & bài toán dung dịch.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Luyện chuỗi phản ứng</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Sinh Học */}
            <button
              onClick={() => nav('/phong-hoc/biology')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Dna className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">Sinh Học</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20">
                      Di Truyền
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Di truyền Mendel, phiên mã ADN, đột biến gen và phả hệ.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Luyện giải bài tập ADN</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Tiếng Anh Song Ngữ */}
            <button
              onClick={() => nav('/hoc-tieng-anh')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-purple-500/30 hover:border-purple-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">Tiếng Anh CEFR</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/20">
                      A1 - C2
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Lộ trình chuẩn hóa 6 cấp độ CEFR, từ vựng và phản xạ ngữ cảnh.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-purple-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Khám phá lộ trình</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 10 Simulators Thí Nghiệm */}
            <button
              onClick={() => nav('/ung-dung-thuc-te')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-teal-500/30 hover:border-teal-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-bold text-white text-sm">10 Simulators STEM</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/20">
                      Phòng Thí Nghiệm
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    Mô phỏng điện EVN, con lắc lò xo, tên lửa nước, thấu kính quang học.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-teal-400 font-medium pt-2 border-t border-zinc-800/80">
                <span>Vào phòng thí nghiệm</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </section>

        {/* ── TẦNG 2: 4 TRỤ CỘT KỸ NĂNG CHÍNH (Core Skills Mastery) ── */}
        <section aria-label="4 Kỹ năng cốt lõi" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-accent-400 theme-light:text-accent-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              2. 4 Kỹ Năng Đàm Thoại & Đánh Giá AI
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Luyện Nói & IPA */}
            <button
              onClick={() => nav('/luyen-noi')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-sky-500/30 hover:border-sky-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-white text-sm">Luyện Nói & Chấm Âm IPA</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 font-semibold border border-sky-500/20">
                    Live STT
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Đàm thoại tự do, nhận diện và chấm điểm từng âm vị IPA, sửa lỗi bằng tiếng mẹ đẻ.
                </p>
              </div>
            </button>

            {/* Luyện Viết & IELTS */}
            <button
              onClick={() => nav('/luyen-viet')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-violet-500/30 hover:border-violet-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <PenLine className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-white text-sm">Luyện Viết & Chấm IELTS</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/20">
                    Band 9.0
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Chấm 4 tiêu chí Task, Coherence, Lexical, Grammar kèm gợi ý viết lại xuất sắc.
                </p>
              </div>
            </button>

            {/* Chat Đối Thoại Socratic */}
            <button
              onClick={() => nav('/tro-truyen')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-accent-500/30 hover:border-accent-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-500 to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-accent-500/20 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-white text-sm">Chat Đàm Thoại AI</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-500/15 text-accent-300 font-semibold border border-accent-500/20">
                    Socratic
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Nhập vai tình huống thực tế, trò chuyện linh hoạt và sửa lỗi ngữ cảnh tức thì.
                </p>
              </div>
            </button>

            {/* Thư Viện Nghe */}
            <button
              onClick={() => nav('/luyen-nghe')}
              className="tap-44 p-4 rounded-3xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-rose-500/30 hover:border-rose-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-white text-sm">Thư Viện Luyện Nghe</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/20">
                    Chirp3 HD
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Kho bài nghe, truyện cổ tích và hội thoại mẫu giọng bản xứ chuẩn Mỹ.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* ── TẦNG 3: 8 BÀI TẬP PHẢN XẠ NHANH (Interactive Drill Studio) ── */}
        <section aria-label="Bài tập tương tác nhanh" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              3. 8 Chế Độ Luyện Tập Phản Xạ Nhanh
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Nghe đoán từ */}
            <button
              onClick={() => setMode('vocab-listen')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                  Nghe Đoán Từ Vựng
                </p>
                <p className="text-[11px] text-zinc-400 truncate">Nghe phát âm, chọn nghĩa đúng</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 2. Sắp xếp câu */}
            <button
              onClick={() => setMode('scramble')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Shuffle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  Sắp Xếp Câu Hoàn Chỉnh
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Ghép từ ngữ thành câu chuẩn ngữ pháp
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 3. Nghe viết chính tả */}
            <button
              onClick={() => setMode('dictation')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Keyboard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                  Nghe & Viết Chính Tả (Dictation)
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Nghe từng câu và gõ lại chính xác
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 4. Điền từ trắc nghiệm */}
            <button
              onClick={() => setMode('fillblank')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ListChecks className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                  Điền Từ Ngữ Cảnh
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Chọn từ chính xác để hoàn chỉnh câu
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 5. Chấm phát âm từ */}
            <button
              onClick={() => setMode('pronounce-words')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                  Chấm Phát Âm Từ Vựng
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Đọc to từ vựng, AI chấm điểm chuẩn
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 6. Đọc diễn cảm cả câu */}
            <button
              onClick={() => setMode('read-aloud')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                  Đọc Lại Câu Ví Dụ
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Rèn ngữ điệu và nối âm tự nhiên
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 7. Shadowing */}
            <button
              onClick={() => setMode('shadowing')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-accent-500/15 text-accent-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-accent-300 transition-colors truncate">
                  Echo Shadowing (Nói Đè)
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Nói đồng thời theo nhịp audio phát
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* 8. Phỏng vấn ngược */}
            <button
              onClick={() => setMode('interview')}
              className="tap-44 flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700 text-left transition active:scale-[0.98] group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  Phỏng Vấn Ngược AI
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  AI đặt câu hỏi, bạn trả lời bằng giọng nói
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>
          </div>
        </section>

        {/* ── TẦNG 4: SỔ TAY LỖI SAI & KHO HỌC LIỆU BỔ TRỢ (Resource & Tool Vault) ── */}
        <section aria-label="Sổ tay lỗi sai và kho học liệu" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              4. Sổ Tay Lỗi Sai & Kho Học Liệu Bổ Trợ
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Sổ tay lỗi sai */}
            <button
              onClick={() => nav('/so-tay-loi-sai')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-rose-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">Sổ Tay Lỗi Sai</p>
              <p className="text-[10px] text-zinc-400 truncate">Ôn lại điểm sai đa môn</p>
            </button>

            {/* Từ điển 12k từ */}
            <button
              onClick={() => nav('/tu-dien')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-amber-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">Từ Điển 12k+ IPA</p>
              <p className="text-[10px] text-zinc-400 truncate">Tra cứu & Nghe phát âm</p>
            </button>

            {/* Truyện song ngữ */}
            <button
              onClick={() => nav('/truyen-song-ngu')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-pink-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <BookMarked className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">Truyện Karaoke Text</p>
              <p className="text-[10px] text-zinc-400 truncate">Vừa nghe vừa sáng chữ</p>
            </button>

            {/* Mẫu câu thông dụng */}
            <button
              onClick={() => nav('/cau-thong-dung')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-blue-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">Mẫu Câu Giao Tiếp</p>
              <p className="text-[10px] text-zinc-400 truncate">Câu thông dụng hằng ngày</p>
            </button>

            {/* Bài học mẫu */}
            <button
              onClick={() => nav('/bai-hoc')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-teal-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <Award className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">100+ Hội Thoại Mẫu</p>
              <p className="text-[10px] text-zinc-400 truncate">Tình huống theo chủ đề</p>
            </button>

            {/* Video Thử Thách */}
            <button
              onClick={() => nav('/thu-thach')}
              className="tap-44 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800/80 hover:border-orange-500/40 text-left transition active:scale-[0.98] group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition">
                <Video className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white truncate">Thử Thách 1 Phút</p>
              <p className="text-[10px] text-zinc-400 truncate">Video nói tiếng Anh tuần</p>
            </button>
          </div>
        </section>
      </main>
    </>
  )
}
