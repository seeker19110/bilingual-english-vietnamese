// Practice — trang GỘP "Luyện tập" (4 kỹ năng Nghe/Nói/Đọc/Viết vào 1 trang).
// Các tính năng NẶNG (AI hội thoại, chấm bài viết) vẫn ở nguyên trang gốc /chat,
// /speaking, /writing — trang này chỉ điều hướng tới (KHÔNG đổi code các trang đó).
// Các bài tập MỚI (nghe đoán từ, sắp xếp câu, nghe-viết lại, điền từ, chấm phát âm
// từ vựng, đọc lại câu) chạy ngay tại đây, dùng lại dữ liệu/hàm đã có sẵn
// (curriculum, listening.ts, PronunciationCheck) — không soạn nội dung mới.
import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import PronunciationCheck from '../components/PronunciationCheck'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { loadCurriculum, getLearningPath } from '../lib/curriculum'
import { getLearnedWords } from '../lib/vocab'
import { buildDictationItems, type DictationItem } from '../lib/listening'
import { scorePronunciation } from '../lib/pronounceScore'
import { speak } from '../lib/tts'
import type { DictEntry } from '../types'

type Mode =
  'hub' | 'vocab-listen' | 'scramble' | 'dictation' | 'fillblank' | 'pronounce-words' | 'read-aloud'

const SESSION_SIZE = 8

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
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
  const sentences = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const w of shuffle(pool)) {
      const text = isA ? w.ex_en : w.ex_vi
      const n = text.trim().split(/\s+/).filter(Boolean).length
      if (text && n >= 4 && n <= 8 && !seen.has(text)) {
        seen.add(text)
        out.push(text)
      }
      if (out.length >= SESSION_SIZE) break
    }
    return out
  }, [pool, isA])

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
    }
    const [title, sub] = titles[mode]
    return (
      <>
        <Layout onBack={() => setMode('hub')} />
        <main className="max-w-2xl mx-auto px-4 py-6">
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
        </main>
      </>
    )
  }

  const listening = [
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
      action: () => nav('/chat'),
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
      key: 'roleplay-speak',
      icon: MessageCircle,
      title: isA ? 'Nhập vai hội thoại' : 'Roleplay a conversation',
      desc: isA
        ? 'Nói theo tình huống, AI phản hồi bằng giọng nói'
        : 'Speak through a scenario, AI replies by voice',
      action: () => nav('/chat'),
    },
    {
      key: 'freetalk-speak',
      icon: Mic,
      title: isA ? 'Nói chuyện tự do với AI' : 'Free talk with AI',
      desc: isA ? 'Luyện nói song ngữ, sửa lỗi bằng giọng mẹ đẻ' : 'Bilingual speaking practice',
      action: () => nav('/speaking'),
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
      action: () => nav('/chat'),
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
      <main className="max-w-2xl mx-auto px-4 py-6">
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
