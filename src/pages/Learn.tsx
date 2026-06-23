import { useMemo, useState, useEffect } from 'react'
import { Check, X, RotateCcw, Eye, Target, Shuffle, Trophy, Sparkles, ClipboardList, ChevronRight, Home } from 'lucide-react'
import Layout from '../components/Layout'
import PronounceButton from '../components/PronounceButton'
import SpeakButton from '../components/SpeakButton'
import KaraokeText from '../components/KaraokeText'
import PronunciationCheck from '../components/PronunciationCheck'
import VocabMilestone from '../components/VocabMilestone'
import { EXTRA_EXAMPLES } from '../data/extra-examples'
import type { DictEntry } from '../types'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import { getLearnedWords, markLearned } from '../lib/vocab'
import {
  DAILY_GOAL,
  getTodayBatch,
  getPathProgress,
  getDailyLearned,
  bumpDailyLearned,
  findCircleOfWord,
  getLearningPath,
  wordKey,
  loadCurriculum,
  isCurriculumReady,
} from '../lib/curriculum'

type Tab = 'today' | 'random' | 'quiz'

// ── Quiz: kiểm tra từ đã học ──────────────────────────────────────────────────
const QUIZ_SIZE = 10
const CHOICES   = 4

interface QuizQuestion {
  word:    string
  correct: string
  options: string[]
}

function buildQuiz(userId: string): QuizQuestion[] {
  const learned  = getLearnedWords(userId)
  const allWords = getLearningPath()
  const shuffled = [...allWords].sort(() => Math.random() - 0.5)
  const pool     = shuffled.filter(w => learned.has(w.word) || learned.has(w.word.toLowerCase()))
  const candidates = pool.length >= QUIZ_SIZE ? pool : [...pool, ...shuffled.slice(0, QUIZ_SIZE - pool.length)]
  const questions  = candidates.slice(0, QUIZ_SIZE)
  const allMeanings = allWords.map(w => w.vi)
  return questions.map(q => {
    const wrongs = allMeanings.filter(m => m !== q.vi).sort(() => Math.random() - 0.5).slice(0, CHOICES - 1)
    return { word: q.word, correct: q.vi, options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5) }
  })
}

// Trộn ngẫu nhiên (Fisher–Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Learn() {
  const { user } = useAuth()
  const isA = getDirection() === 'A'
  const [tab, setTab] = useState<Tab>('today')
  const [refresh, setRefresh] = useState(0)
  // Nạp dữ liệu từ điển (dynamic import) trước khi cho các tab dùng curriculum
  const [ready, setReady] = useState(isCurriculumReady())
  useEffect(() => { loadCurriculum().then(() => setReady(true)) }, [])

  if (!user) return null
  const uid = user.id

  const TABS: { key: Tab; icon: typeof Target; label: string; active: string; inactive: string }[] = [
    { key: 'today',  icon: Target,        label: isA ? 'Hôm nay'      : 'Today',   active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40', inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200' },
    { key: 'random', icon: Shuffle,       label: isA ? 'Ôn ngẫu nhiên': 'Review',  active: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',             inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200' },
    { key: 'quiz',   icon: ClipboardList, label: isA ? 'Kiểm tra'     : 'Quiz',    active: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',    inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200' },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={isA ? 'Học theo lộ trình' : 'Learning Path'}
        subtitle={isA ? `${DAILY_GOAL} từ mới mỗi ngày` : `${DAILY_GOAL} new words a day`}
        back
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <VocabMilestone userId={uid} refreshKey={refresh} />

        <div className="flex gap-2 mb-4">
          {TABS.map(({ key, icon: Icon, label, active, inactive }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${tab === key ? active : inactive}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {!ready ? (
          <div className="glass rounded-xl p-8 text-center animate-fade-in">
            <p className="text-zinc-400 text-sm">{isA ? 'Đang tải từ vựng…' : 'Loading vocabulary…'}</p>
          </div>
        ) : (
          <>
            {tab === 'today'  && <TodayLesson  uid={uid} isA={isA} onProgress={() => setRefresh(k => k + 1)} />}
            {tab === 'random' && <RandomReview uid={uid} isA={isA} />}
            {tab === 'quiz'   && <QuizTab      uid={uid} isA={isA} />}
          </>
        )}
      </main>
    </div>
  )
}

// ── Thẻ học chung (hiện từ → lật xem nghĩa) ──────────────────────────────────
function WordCard({ card, isA }: { card: DictEntry; isA: boolean }) {
  const [flipped, setFlipped] = useState(false)
  // Lưu ý: việc reset mặt thẻ khi đổi từ là nhờ component cha gắn key={card.word}
  // cho chính <WordCard/> (xem dưới), khiến cả thẻ remount mỗi khi đổi từ.
  return (
    <div>
      <button
        onClick={() => setFlipped(f => !f)}
        className="glass w-full rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center text-center hover:bg-zinc-800/60 transition mb-4"
      >
        {!flipped ? (
          <>
            <span className="font-bold text-white text-3xl mb-2">{card.word}</span>
            {card.ipa_en && <span className="text-sm text-emerald-400/70 font-mono">{card.ipa_en}</span>}
            <span className="flex items-center gap-1 text-xs text-zinc-500 mt-4">
              <Eye className="w-3.5 h-3.5" /> {isA ? 'Bấm để xem nghĩa' : 'Tap to flip'}
            </span>
          </>
        ) : (
          <>
            <span className="text-xl text-zinc-100 font-medium mb-2">{card.vi}</span>
            {card.ex_en && <span className="text-sm text-zinc-400 italic mt-1">{card.ex_en}</span>}
            {card.ex_vi && <span className="text-xs text-zinc-500 mt-0.5">{card.ex_vi}</span>}
            {EXTRA_EXAMPLES[card.word.toLowerCase()] && (
              <div className="mt-2 space-y-1 text-left w-full border-t border-zinc-700/50 pt-2">
                {EXTRA_EXAMPLES[card.word.toLowerCase()].map((ex, i) => (
                  <div key={i}>
                    <p className="text-xs text-emerald-400/80 italic">{ex.en}</p>
                    <p className="text-xs text-zinc-500">{ex.vi}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 mb-3">
        <PronounceButton word={card.word} />
        {card.ex_en && <SpeakButton text={card.ex_en} lang="en-US" title="Nghe câu ví dụ" />}
      </div>

      {/* Chấm phát âm: đọc từ mục tiêu theo ngôn ngữ đích (A: tiếng Anh, B: tiếng Việt) */}
      <div className="mb-4">
        <PronunciationCheck target={card.word} lang={isA ? 'en' : 'vi'} isA={isA} />
      </div>
    </div>
  )
}

// ── Tab "Hôm nay": học 20 từ mới kế tiếp ─────────────────────────────────────
function TodayLesson({ uid, isA, onProgress }: { uid: string; isA: boolean; onProgress: () => void }) {
  // Lấy bộ 20 từ kế tiếp chưa thuộc — cố định trong suốt lượt học này
  const [batch] = useState<DictEntry[]>(() => getTodayBatch(getLearnedWords(uid)))
  const [idx, setIdx] = useState(0)
  const [dailyStart] = useState(() => getDailyLearned(uid))

  const progress = useMemo(() => getPathProgress(getLearnedWords(uid)), [uid])
  const card = batch[idx]
  const done = idx >= batch.length

  // Chủ đề của từ đang học (vòng tròn)
  const circle = card ? findCircleOfWord(card.word) : undefined

  function learn() {
    if (!card) return
    markLearned(uid, card.word)
    bumpDailyLearned(uid)
    onProgress()
    setIdx(i => i + 1)
  }

  function skip() {
    setIdx(i => i + 1)
  }

  // Hết lộ trình
  if (batch.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">
          {isA ? 'Tuyệt vời! Bạn đã học hết lộ trình.' : 'Amazing! You finished the whole path.'}
        </p>
        <p className="text-sm text-zinc-400">
          {isA ? 'Hãy chuyển sang Ôn ngẫu nhiên để nhớ lâu hơn.' : 'Switch to Random review to retain more.'}
        </p>
      </div>
    )
  }

  // Học xong bộ hôm nay → hiển thị câu thông dụng từ các chủ đề vừa học
  if (done) {
    const learnedToday = getDailyLearned(uid) - dailyStart
    // Gom câu thông dụng từ các vòng có trong batch (không trùng)
    const seen = new Set<string>()
    const sentences: { en: string; vi: string }[] = []
    for (const e of batch) {
      const c = findCircleOfWord(e.word)
      if (c && !seen.has(c.id)) {
        seen.add(c.id)
        c.sentences.forEach(s => sentences.push(s))
      }
    }
    return (
      <div className="animate-fade-in space-y-4">
        <div className="glass rounded-xl p-8 text-center">
          <Check className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">{isA ? 'Hoàn thành bài hôm nay!' : 'Today\'s lesson done!'}</p>
          <p className="text-sm text-zinc-400">
            {isA
              ? <>Bạn đã học <strong className="text-emerald-300">{learnedToday}</strong>/{DAILY_GOAL} từ hôm nay</>
              : <>You learned <strong className="text-emerald-300">{learnedToday}</strong>/{DAILY_GOAL} words today</>}
          </p>
        </div>

        {sentences.length > 0 && (
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-white">
                {isA ? 'Câu thông dụng từ những từ vừa học' : 'Common sentences from these words'}
              </span>
            </div>
            <div className="space-y-2">
              {sentences.map((s, i) => (
                <div key={i} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3">
                  <KaraokeText
                    text={s.en} lang="en-US"
                    textClass="font-medium text-[15px] leading-snug text-teal-300"
                    buttonClass="w-full"
                  />
                  <p className="text-sm text-zinc-400 mt-1 pl-6">{s.vi}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Tên chủ đề (vòng tròn) đang học */}
      {circle && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2">
          <span>{circle.emoji}</span>
          <span>{isA ? circle.titleVi : circle.titleEn}</span>
        </div>
      )}

      {/* Tiến độ trong lượt */}
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
        <span>{isA ? 'Từ' : 'Word'} {idx + 1}/{batch.length}</span>
        <span className="text-zinc-600">
          {isA ? 'Tổng đã thuộc' : 'Total learned'}: {progress.done}/{progress.total}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(idx / batch.length) * 100}%` }} />
      </div>

      <WordCard key={card.word} card={card} isA={isA} />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={skip}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition py-3 rounded-xl text-sm font-medium">
          <X className="w-4 h-4" /> {isA ? 'Để sau' : 'Later'}
        </button>
        <button onClick={learn}
          className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition py-3 rounded-xl text-sm font-medium">
          <Check className="w-4 h-4" /> {isA ? 'Đã thuộc' : 'Got it'}
        </button>
      </div>
    </div>
  )
}

// ── Tab "Ôn ngẫu nhiên": không lặp trong 1 vòng ─────────────────────────────
function RandomReview({ uid, isA }: { uid: string; isA: boolean }) {
  // Nguồn ôn tập: các từ đã thuộc; nếu chưa thuộc từ nào thì lấy phần đầu lộ trình
  const pool = useMemo<DictEntry[]>(() => {
    const learned = getLearnedWords(uid)
    const path = getLearningPath()
    const known = path.filter(e => learned.has(wordKey(e.word)) || learned.has(e.word))
    return known.length > 0 ? known : path.slice(0, DAILY_GOAL)
  }, [uid])

  // Hàng đợi đã trộn — đi hết mới trộn lại (đảm bảo không lặp trong 1 vòng)
  const [queue, setQueue] = useState<DictEntry[]>(() => shuffle(pool))
  const [idx, setIdx] = useState(0)

  const card = queue[idx]

  function next() {
    if (idx + 1 >= queue.length) {
      // Hết 1 vòng → trộn lại, tránh để từ cuối cùng lặp ngay đầu vòng mới
      const reshuffled = shuffle(pool)
      if (reshuffled.length > 1 && reshuffled[0].word === card?.word) {
        const last = reshuffled.length - 1
        const tmp = reshuffled[0]
        reshuffled[0] = reshuffled[last]
        reshuffled[last] = tmp
      }
      setQueue(reshuffled)
      setIdx(0)
    } else {
      setIdx(i => i + 1)
    }
  }

  if (pool.length === 0 || !card) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-zinc-400 text-sm">
          {isA ? 'Chưa có từ nào để ôn. Hãy học vài từ ở tab Hôm nay trước nhé.' : 'No words to review yet. Learn some in the Today tab first.'}
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
        <span>{isA ? 'Ôn ngẫu nhiên' : 'Random review'}</span>
        <span>{idx + 1}/{queue.length}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${((idx + 1) / queue.length) * 100}%` }} />
      </div>

      <WordCard key={card.word} card={card} isA={isA} />

      <button onClick={next}
        className="w-full flex items-center justify-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 transition py-3 rounded-xl text-sm font-medium">
        <RotateCcw className="w-4 h-4" /> {isA ? 'Từ tiếp theo' : 'Next word'}
      </button>
    </div>
  )
}

// ── Tab "Kiểm tra": 10 câu trắc nghiệm từ đã học ────────────────────────────
function QuizTab({ uid, isA }: { uid: string; isA: boolean }) {
  const nav = useNavigate()
  const [questions] = useState<QuizQuestion[]>(() => buildQuiz(uid))
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers,  setAnswers]  = useState<boolean[]>([])
  const [done,     setDone]     = useState(false)

  if (questions.length === 0) return (
    <div className="glass rounded-xl p-8 text-center animate-fade-in">
      <p className="text-zinc-400 text-sm">
        {isA ? 'Chưa đủ từ để tạo quiz. Hãy học vài từ ở tab Hôm nay trước nhé.' : 'Not enough words for a quiz yet. Learn some words first.'}
      </p>
    </div>
  )

  const q    = questions[current]
  const score = answers.filter(Boolean).length
  const pct   = Math.round((score / QUIZ_SIZE) * 100)

  function pick(opt: string) { if (selected === null) setSelected(opt) }

  function next() {
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) { setDone(true) }
    else { setCurrent(c => c + 1); setSelected(null) }
  }

  function restart() { setCurrent(0); setSelected(null); setAnswers([]); setDone(false) }

  // Màn hình kết quả
  if (done) {
    const grade = pct >= 90 ? { emoji: '🏆', label: isA ? 'Xuất sắc!' : 'Excellent!' }
                : pct >= 70 ? { emoji: '👍', label: isA ? 'Tốt lắm!'  : 'Good job!'  }
                : pct >= 50 ? { emoji: '💪', label: isA ? 'Cố lên!'   : 'Keep going!'}
                :             { emoji: '📚', label: isA ? 'Cần ôn thêm' : 'Study more' }
    return (
      <div className="animate-fade-in space-y-4">
        <div className="glass rounded-xl p-8 text-center space-y-2">
          <p className="text-4xl">{grade.emoji}</p>
          <p className="text-2xl font-bold text-white">{score}/{QUIZ_SIZE}</p>
          <p className="text-zinc-400">{grade.label}</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="space-y-1.5">
          {questions.map((qq, i) => (
            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${answers[i] ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
              <span>{answers[i] ? '✓' : '✗'}</span>
              <span className="font-medium">{qq.word}</span>
              <span className="text-zinc-500 flex-1 truncate">= {qq.correct}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={restart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition">
            <RotateCcw className="w-4 h-4" /> {isA ? 'Làm lại' : 'Retry'}
          </button>
          <button onClick={() => nav('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition">
            <Home className="w-4 h-4" /> {isA ? 'Trang chủ' : 'Home'}
          </button>
        </div>
      </div>
    )
  }

  // Màn hình câu hỏi
  return (
    <div className="animate-fade-in space-y-4">
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${(current / QUIZ_SIZE) * 100}%` }} />
      </div>
      <div className="text-center py-6">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wide">
          {isA ? `Câu ${current + 1}/${QUIZ_SIZE} — Nghĩa tiếng Việt của từ này là?` : `Q ${current + 1}/${QUIZ_SIZE} — Vietnamese meaning?`}
        </p>
        <p className="text-4xl font-bold text-white">{q.word}</p>
      </div>
      <div className="space-y-2.5">
        {q.options.map(opt => {
          let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
          if (selected !== null) {
            if (opt === q.correct)  cls = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
            else if (opt === selected) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
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
      {selected !== null && (
        <button onClick={next}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition animate-fade-in">
          {current + 1 >= questions.length ? (isA ? 'Xem kết quả' : 'See results') : (isA ? 'Câu tiếp theo' : 'Next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
