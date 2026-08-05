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
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import PronunciationCheck from '../components/PronunciationCheck'
import { getDirection, getUsage, incrementUsage } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { loadCurriculum, getLearningPath } from '../lib/curriculum'
import { getLearnedWords } from '../lib/vocab'
import { buildDictationItems, type DictationItem } from '../lib/listening'
import { scorePronunciation, scoreWords, type WordScore } from '../lib/pronounceScore'
import { speak } from '../lib/tts'
import { startListening, isSTTSupported } from '../lib/stt'
import { callClaude, parseJson } from '../lib/ai'
import { interviewAnswerFeedbackPrompt } from '../prompts'
import { effectivePlan } from '../lib/promo'
import { getLimits } from '../lib/appSettings'
import { CHALLENGE_TOPICS } from '../data/challengeTopics'
import type { DictEntry, User } from '../types'

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

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

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
  return (
    <div className="text-center space-y-4 py-8">
      <p className="text-4xl font-bold text-white">
        {score}/{total}
      </p>
      <p className="text-sm text-zinc-400">
        {isA ? 'Điểm phiên luyện tập này' : 'Score for this session'}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2.5 min-h-11 rounded-xl bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 transition"
        >
          <RotateCcw className="w-4 h-4" /> {isA ? 'Làm lại' : 'Retry'}
        </button>
        <button
          onClick={onExit}
          className="px-4 py-2.5 min-h-11 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-400 transition"
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

  const listening = [
    {
      key: 'listening-library',
      icon: Headphones,
      title: isA ? 'Thư viện Nghe' : 'Listening library',
      desc: isA
        ? 'Câu thông dụng, hội thoại, truyện cổ tích & ngụ ngôn — nghe hiểu, không chấm điểm'
        : 'Phrases, dialogues, fairy tales & fables — listen for understanding, no scoring',
      action: () => nav('/luyen-nghe'),
    },
    {
      key: 'vocab-listen',
      icon: Headphones,
      title: isA ? 'Nghe đoán từ vựng' : 'Listen & guess vocab',
      desc: isA ? 'Nghe audio, chọn nghĩa đúng' : 'Listen then pick the meaning',
      action: () => setMode('vocab-listen'),
    },
    {
      key: 'roleplay-listen',
      icon: MessageCircle,
      title: isA ? 'Nghe đoạn hội thoại · Nhập vai' : 'Listen to dialogues · Roleplay',
      desc: isA
        ? 'AI đóng vai đối tác hội thoại theo tình huống'
        : 'AI roleplays a conversation partner',
      action: () => nav('/tro-truyen'),
    },
  ]

  const speaking = [
    {
      key: 'pronounce-words',
      icon: Mic,
      title: isA ? 'Chấm phát âm từ vựng' : 'Word pronunciation check',
      desc: isA ? 'Đọc to từ đã học, AI chấm điểm' : 'Read learned words aloud, get scored',
      action: () => setMode('pronounce-words'),
    },
    {
      key: 'read-aloud',
      icon: Volume2,
      title: isA ? 'Đọc lại câu' : 'Read the sentence',
      desc: isA ? 'Đọc to cả câu ví dụ, AI chấm điểm' : 'Read example sentences aloud',
      action: () => setMode('read-aloud'),
    },
    {
      key: 'shadowing',
      icon: Sparkles,
      title: isA ? 'Shadowing — nói đè theo' : 'Shadowing',
      desc: isA ? 'Nói đè ngay khi audio đang phát' : 'Speak along as the audio plays',
      action: () => setMode('shadowing'),
    },
    {
      key: 'interview',
      icon: MessageCircle,
      title: isA ? 'Phỏng vấn ngược' : 'Reverse interview',
      desc: isA ? 'AI hỏi, bạn trả lời nói, AI chấm nội dung' : 'AI asks, you answer, AI grades',
      action: () => setMode('interview'),
    },
    {
      key: 'roleplay-speak',
      icon: MessageCircle,
      title: isA ? 'Nhập vai hội thoại' : 'Roleplay a conversation',
      desc: isA
        ? 'Nói theo tình huống, AI phản hồi bằng giọng nói'
        : 'Speak through a scenario, AI replies by voice',
      action: () => nav('/tro-truyen'),
    },
    {
      key: 'sample-dialogues',
      icon: Mic,
      title: isA ? 'Bài học hội thoại mẫu' : 'Sample dialogue lessons',
      desc: isA
        ? 'Nghe từng câu hội thoại rồi đọc lại, AI chấm phát âm'
        : 'Listen to each dialogue line, read it back, get scored',
      action: () => nav('/bai-hoc'),
    },
    {
      key: 'freetalk-speak',
      icon: Mic,
      title: isA ? 'Nói chuyện tự do với AI' : 'Free talk with AI',
      desc: isA ? 'Luyện nói song ngữ, sửa lỗi bằng giọng mẹ đẻ' : 'Bilingual speaking practice',
      action: () => nav('/luyen-noi'),
    },
  ]

  const writing = [
    {
      key: 'dictation',
      icon: Keyboard,
      title: isA ? 'Nghe & viết lại' : 'Listen & write',
      desc: isA ? 'Nghe câu rồi gõ lại chính xác' : 'Listen then type the sentence',
      action: () => setMode('dictation'),
    },
    {
      key: 'fillblank',
      icon: ListChecks,
      title: isA ? 'Điền từ trắc nghiệm' : 'Fill in the blank',
      desc: isA ? 'Chọn từ đúng để hoàn thành câu' : 'Pick the right word to complete the sentence',
      action: () => setMode('fillblank'),
    },
    {
      key: 'scramble',
      icon: Shuffle,
      title: isA ? 'Sắp xếp câu' : 'Sentence scramble',
      desc: isA ? 'Ghép các từ thành câu đúng' : 'Put the words in the right order',
      action: () => setMode('scramble'),
    },
    {
      key: 'freetalk-write',
      icon: PenLine,
      title: isA ? 'Chat tự do với AI' : 'Free chat with AI',
      desc: isA ? 'Viết & trò chuyện, AI sửa lỗi ngay' : 'Write & chat, AI corrects instantly',
      action: () => nav('/tro-truyen'),
    },
  ]

  function Section({
    title,
    items,
  }: {
    title: string
    items: {
      key: string
      icon: typeof Headphones
      title: string
      desc: string
      action: () => void
    }[]
  }) {
    return (
      <div className="mb-7">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
          {title}
        </h2>
        <div className="space-y-2.5">
          {items.map((it) => (
            <button
              key={it.key}
              onClick={it.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-accent-500/40 hover:bg-zinc-900 transition text-left"
            >
              <span className="shrink-0 w-10 h-10 rounded-lg bg-accent-500/15 text-accent-300 flex items-center justify-center">
                <it.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white truncate">{it.title}</span>
                <span className="block text-xs text-zinc-400 truncate">{it.desc}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Layout back={false} />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        <PageHeader
          title={isA ? 'Luyện tập' : 'Practice'}
          subtitle={
            isA
              ? 'Nghe · Nói · Viết — chọn bài tập bên dưới'
              : 'Listening · Speaking · Writing — pick an exercise below'
          }
        />
        <Section title={isA ? 'Nghe' : 'Listening'} items={listening} />
        <Section title={isA ? 'Nói' : 'Speaking'} items={speaking} />
        <Section title={isA ? 'Viết' : 'Writing'} items={writing} />
      </main>
    </>
  )
}
