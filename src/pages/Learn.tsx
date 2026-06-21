import { useMemo, useState } from 'react'
import { Check, X, RotateCcw, Eye, Target, Shuffle, Trophy, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import PronounceButton from '../components/PronounceButton'
import SpeakButton from '../components/SpeakButton'
import PronunciationCheck from '../components/PronunciationCheck'
import VocabMilestone from '../components/VocabMilestone'
import type { DictEntry } from '../types'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
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
} from '../lib/curriculum'

type Tab = 'today' | 'random'

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
  const [refresh, setRefresh] = useState(0) // đổi để tính lại tiến độ/mốc

  if (!user) return null
  const uid = user.id

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={isA ? 'Học theo lộ trình' : 'Learning Path'}
        subtitle={isA ? `${DAILY_GOAL} từ mới mỗi ngày` : `${DAILY_GOAL} new words a day`}
        back
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Mốc tổng số từ đã thuộc */}
        <VocabMilestone userId={uid} refreshKey={refresh} />

        {/* Chuyển tab */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('today')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
              tab === 'today'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}>
            <Target className="w-4 h-4" /> {isA ? 'Hôm nay' : 'Today'}
          </button>
          <button onClick={() => setTab('random')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
              tab === 'random'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}>
            <Shuffle className="w-4 h-4" /> {isA ? 'Ôn ngẫu nhiên' : 'Random review'}
          </button>
        </div>

        {tab === 'today'
          ? <TodayLesson uid={uid} isA={isA} onProgress={() => setRefresh(k => k + 1)} />
          : <RandomReview uid={uid} isA={isA} />}
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
                <div key={i} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] leading-snug text-teal-300">{s.en}</p>
                    <p className="text-sm text-zinc-400 mt-0.5">{s.vi}</p>
                  </div>
                  <SpeakButton text={s.en} lang="en-US" title="Nghe câu" />
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
