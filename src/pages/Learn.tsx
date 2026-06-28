import { useMemo, useState, useEffect } from 'react'
import {
  Check, X, RotateCcw, Target, Trophy, Sparkles, Route,
  ClipboardList, ChevronRight, Home, Star, Brain, MessageCircle,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import KaraokeText from '../components/KaraokeText'
import VocabMilestone from '../components/VocabMilestone'
import WordCard from '../components/WordCard'
import RoadmapTab from '../components/RoadmapTab'
import type { DictEntry } from '../types'
import { getDirection, markStudiedToday } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import { getLearnedWords, markLearned, getDifficultWords } from '../lib/vocab'
import { preloadLearnData } from '../lib/preloader'
import { addToSRS, reviewWord, getDueWords, getSRSStats, type Rating } from '../lib/srs'
import {
  DAILY_GOAL,
  DAILY_MAX,
  getTodayBatch,
  getPathProgress,
  getDailyLearned,
  bumpDailyLearned,
  getDailyQuizPasses,
  bumpDailyQuizPasses,
  getDailyAllowance,
  findCircleOfWord,
  getCircleProgress,
  getLearningPath,
  loadCurriculum,
  isCurriculumReady,
} from '../lib/curriculum'
import { getDialogues } from '../data/dialoguesLoader'
import type { Dialogue } from '../data/dialogues'

type Tab = 'roadmap' | 'today' | 'srs' | 'hard' | 'quiz'

// ── Quiz ─────────────────────────────────────────────────────────────────────
const QUIZ_SIZE = 10
const CHOICES   = 4

interface QuizQuestion { word: string; correct: string; options: string[] }

function buildQuiz(userId: string): QuizQuestion[] {
  const learned  = getLearnedWords(userId)
  const allWords = getLearningPath()
  const shuffled = [...allWords].sort(() => Math.random() - 0.5)
  const pool     = shuffled.filter(w => learned.has(w.word) || learned.has(w.word.toLowerCase()))
  const cands    = pool.length >= QUIZ_SIZE ? pool : [...pool, ...shuffled.slice(0, QUIZ_SIZE - pool.length)]
  const qs       = cands.slice(0, QUIZ_SIZE)
  const meanings = allWords.map(w => w.vi)
  return qs.map(q => {
    const wrongs = meanings.filter(m => m !== q.vi).sort(() => Math.random() - 0.5).slice(0, CHOICES - 1)
    return { word: q.word, correct: q.vi, options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5) }
  })
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function Learn() {
  const { user } = useAuth()
  const isA = getDirection() === 'A'
  const [tab, setTab] = useState<Tab>('today')
  const [refresh, setRefresh] = useState(0)
  const [ready, setReady] = useState(isCurriculumReady())
  useEffect(() => { loadCurriculum().then(() => setReady(true)) }, [])

  // uid an toàn (chuỗi rỗng khi chưa đăng nhập) — để mọi hook bên dưới luôn được
  // gọi theo đúng thứ tự, KHÔNG đặt "return null" trước hook (vi phạm Rules of Hooks
  // → React crash "rendered fewer hooks than expected" khi user đăng xuất).
  const uid = user?.id ?? ''

  // Preload audio 20 từ "hôm nay" khi browser rảnh — chỉ chạy cho người THẬT SỰ
  // vào trang Học (không phải lúc đăng nhập), tránh tải dữ liệu/audio cho người không học.
  useEffect(() => {
    if (!uid) return
    const run = () => { void preloadLearnData(uid) }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    }
    const tid = setTimeout(run, 500)
    return () => clearTimeout(tid)
  }, [uid])

  // Badge counts cho tab buttons.
  // `refresh` là khóa invalidation THỦ CÔNG: bump() tăng nó để 2 badge này tính lại
  // sau khi user đánh dấu từ ở các tab con (dữ liệu đọc từ localStorage). Vì thế cố ý
  // giữ `refresh` trong deps dù callback không đọc trực tiếp → tắt cảnh báo exhaustive-deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const srsDue   = useMemo(() => ready && uid ? getSRSStats(uid).due : 0, [uid, ready, refresh])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hardCount = useMemo(() => uid ? getDifficultWords(uid).size : 0, [uid, refresh])

  // Đã gọi đủ hook ở trên → giờ mới được phép thoát sớm.
  if (!user) return null

  const bump = () => setRefresh(k => k + 1)

  type TabDef = { key: Tab; icon: typeof Target; labelA: string; labelB: string; badge?: number; active: string; inactive: string }
  const TABS: TabDef[] = [
    {
      key: 'roadmap', icon: Route, labelA: 'Lộ trình', labelB: 'Roadmap',
      active: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'today', icon: Target, labelA: 'Hôm nay', labelB: 'Today',
      active: 'bg-accent-500/20 text-accent-300 border border-accent-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'srs', icon: Brain, labelA: 'Ôn SRS', labelB: 'SRS', badge: srsDue,
      active: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'hard', icon: Star, labelA: 'Từ khó', labelB: 'Hard', badge: hardCount,
      active: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'quiz', icon: ClipboardList, labelA: 'Kiểm tra', labelB: 'Quiz',
      active: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout back />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Tiêu đề trang — ngay dưới AppHeader, cỡ chữ lớn */}
        <PageHeader
          title={isA ? 'Học theo lộ trình' : 'Learning Path'}
          subtitle={isA ? `${DAILY_GOAL} từ mới mỗi ngày` : `${DAILY_GOAL} new words a day`}
        />
        <VocabMilestone userId={uid} refreshKey={refresh} />

        {/* Tab bar */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {TABS.map(({ key, icon: Icon, labelA, labelB, badge, active, inactive }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition ${tab === key ? active : inactive}`}>
              <Icon className="w-4 h-4" />
              <span>{isA ? labelA : labelB}</span>
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Lộ trình dùng dữ liệu tĩnh (FOUNDATION) nên hiện ngay, không cần chờ tải từ điển */}
        {tab === 'roadmap' && <RoadmapTab uid={uid} isA={isA} onProgress={bump} />}

        {tab !== 'roadmap' && (!ready ? (
          <div className="glass rounded-xl p-8 text-center animate-fade-in">
            <p className="text-zinc-400 text-sm">{isA ? 'Đang tải từ vựng…' : 'Loading vocabulary…'}</p>
          </div>
        ) : (
          <>
            {tab === 'today' && <TodayLesson uid={uid} isA={isA} onProgress={bump} />}
            {tab === 'srs'   && <SRSReview   uid={uid} isA={isA} onUpdate={bump}  />}
            {tab === 'hard'  && <HardWords   uid={uid} isA={isA} onUpdate={bump}  />}
            {tab === 'quiz'  && <QuizTab     uid={uid} isA={isA}                  />}
          </>
        ))}

        {/* Hàng hành động nhanh ở đáy trang */}
        <QuickActions />
      </main>
    </div>
  )
}

// ── Tab Hôm nay ───────────────────────────────────────────────────────────────
// Số câu mini-quiz cần đúng 100% để mở batch mới
const MINI_QUIZ_SIZE = 5
const MINI_QUIZ_CHOICES = 4

interface MiniQuizQ { word: string; correct: string; options: string[] }

function buildMiniQuiz(batch: DictEntry[]): MiniQuizQ[] {
  const allMeanings = getLearningPath().map(w => w.vi)
  const pool = [...batch].sort(() => Math.random() - 0.5).slice(0, MINI_QUIZ_SIZE)
  return pool.map(q => {
    const wrongs = allMeanings
      .filter(m => m !== q.vi)
      .sort(() => Math.random() - 0.5)
      .slice(0, MINI_QUIZ_CHOICES - 1)
    return { word: q.word, correct: q.vi, options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5) }
  })
}

type TodayPhase = 'learning' | 'batch-done' | 'mini-quiz' | 'daily-max'

// ── Màn "Xong batch": câu + hội thoại dựng TỪ CHÍNH 20 từ vừa học ─────────────
// SỬA LỖI: trước đây màn này hiển thị câu CỐ ĐỊNH của "vòng" (circle.sentences),
// nên khi học sang 20 từ mới mà vẫn cùng một vòng thì câu KHÔNG đổi (và vòng mở
// rộng không có câu nào). Giờ:
//   • "Câu thông dụng" lấy thẳng ví dụ của CHÍNH 20 từ trong batch → luôn đổi theo
//     từ mới (mỗi DictEntry đã có sẵn ex_en/ex_vi).
//   • Kèm 1 HỘI THOẠI của vòng (nói đủ các từ vừa học): tải theo circle có nhiều
//     từ nhất trong batch, lấy cuộc hội thoại cuối (bản dựng "đủ 20 từ").
function BatchDoneView({ batch, uid, isA, dailyStart, onStartQuiz }: {
  batch: DictEntry[]; uid: string; isA: boolean; dailyStart: number; onStartQuiz: () => void
}) {
  const learnedToday = getDailyLearned(uid) - dailyStart
  const totalToday   = getDailyLearned(uid)
  const quizPasses   = getDailyQuizPasses(uid)
  const canLearnMore = totalToday < DAILY_MAX

  // Câu ví dụ từ CHÍNH các từ vừa học (mỗi từ có sẵn ex_en/ex_vi) → đổi theo batch.
  const sentences = useMemo(() => {
    const seen = new Set<string>()
    const out: { en: string; vi: string }[] = []
    for (const e of batch) {
      const en = e.ex_en?.trim()
      if (en && e.ex_vi && !seen.has(en)) { seen.add(en); out.push({ en, vi: e.ex_vi }) }
    }
    return out
  }, [batch])

  // Hội thoại của vòng hiện tại — chọn circle có NHIỀU từ nhất trong batch.
  const [dialogue, setDialogue] = useState<Dialogue | null>(null)
  useEffect(() => {
    const counts = new Map<string, number>()
    for (const e of batch) {
      const c = findCircleOfWord(e.word)
      if (c) counts.set(c.id, (counts.get(c.id) ?? 0) + 1)
    }
    const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    if (!topId) { setDialogue(null); return }
    let alive = true
    getDialogues(topId).then(ds => { if (alive) setDialogue(ds.length ? ds[ds.length - 1] : null) })
    return () => { alive = false }
  }, [batch])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass rounded-xl p-8 text-center">
        <Check className="w-10 h-10 text-accent-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">{isA ? 'Hoàn thành bài hôm nay!' : "Today's lesson done!"}</p>
        <p className="text-sm text-zinc-400 mb-1">
          {isA
            ? <>{`Đã học `}<strong className="text-accent-300">{learnedToday}</strong>{` từ trong lượt này · Tổng hôm nay: `}<strong className="text-accent-300">{totalToday}</strong>{`/${DAILY_MAX}`}</>
            : <>Learned <strong className="text-accent-300">{learnedToday}</strong> words · Today total: <strong className="text-accent-300">{totalToday}</strong>/{DAILY_MAX}</>}
        </p>
        {canLearnMore && (
          <p className="text-xs text-zinc-500 mt-2">
            {isA
              ? `Còn ${DAILY_MAX - totalToday} từ có thể học hôm nay — kiểm tra để mở thêm.`
              : `${DAILY_MAX - totalToday} more words available today — pass a quiz to unlock.`}
          </p>
        )}
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
                <KaraokeText text={s.en} lang="en-US"
                  textClass="font-medium text-[15px] leading-snug text-teal-300"
                  buttonClass="w-full" />
                <p className="text-sm text-zinc-400 mt-1 pl-6">{s.vi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dialogue && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">
              {isA ? 'Hội thoại dùng các từ vừa học' : 'A conversation using these words'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-3">{isA ? dialogue.titleVi : dialogue.titleEn}</p>
          <div className="space-y-2.5">
            {dialogue.lines.map((ln, i) => {
              const isB = ln.who === 'B'
              const name = ln.who === 'A'
                ? (isA ? (dialogue.speakerA?.vi ?? 'A') : (dialogue.speakerA?.en ?? 'A'))
                : (isA ? (dialogue.speakerB?.vi ?? 'B') : (dialogue.speakerB?.en ?? 'B'))
              return (
                <div key={i} className={`flex ${isB ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 border ${isB ? 'bg-teal-500/10 border-teal-500/30' : 'bg-zinc-900/80 border-zinc-800/80'}`}>
                    <span className={`text-[11px] font-semibold tracking-wide ${isB ? 'text-teal-300' : 'text-zinc-400'}`}>{name}</span>
                    <KaraokeText text={ln.en} lang="en-US"
                      textClass={`font-medium text-[15px] leading-snug ${isB ? 'text-teal-300' : 'text-zinc-100'}`}
                      buttonClass="w-full" />
                    <p className="text-sm text-zinc-400 mt-1 pl-6">{ln.vi}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {canLearnMore && quizPasses < (DAILY_MAX / DAILY_GOAL - 1) && (
        <button onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition">
          <ClipboardList className="w-4 h-4" />
          {isA ? `Kiểm tra để học thêm 20 từ (còn ${DAILY_MAX - totalToday} từ hôm nay)` : `Quiz to unlock 20 more words (${DAILY_MAX - totalToday} left today)`}
        </button>
      )}
    </div>
  )
}

function TodayLesson({ uid, isA, onProgress }: { uid: string; isA: boolean; onProgress: () => void }) {
  // Phase bắt đầu dựa trên trạng thái ngày hiện tại
  const [phase, setPhase] = useState<TodayPhase>(() => {
    const learned = getDailyLearned(uid)
    if (learned >= DAILY_MAX) return 'daily-max'
    if (learned >= getDailyAllowance(uid)) return 'batch-done'
    return 'learning'
  })
  const [batch, setBatch] = useState<DictEntry[]>(() => getTodayBatch(getLearnedWords(uid)))
  const [idx, setIdx] = useState(0)
  const [dailyStart] = useState(() => getDailyLearned(uid))

  // Mini-quiz state
  const [quizQs, setQuizQs]       = useState<MiniQuizQ[]>([])
  const [quizIdx, setQuizIdx]     = useState(0)
  const [quizSel, setQuizSel]     = useState<string | null>(null)
  const [quizAns, setQuizAns]     = useState<boolean[]>([])
  const [quizDone, setQuizDone]   = useState(false)

  const progress = useMemo(() => getPathProgress(getLearnedWords(uid)), [uid])
  const card     = batch[idx]
  const circle   = card ? findCircleOfWord(card.word) : undefined

  const circleProgress = useMemo(() => {
    if (!circle) return null
    return getCircleProgress(circle.id, getLearnedWords(uid))
  }, [circle, uid])

  function learn() {
    if (!card) return
    markLearned(uid, card.word)
    addToSRS(uid, card.word)
    bumpDailyLearned(uid)
    markStudiedToday(uid) // ghi nhận có học hôm nay → tính streak (đồng bộ server)
    onProgress()
    const nextIdx = idx + 1
    if (nextIdx >= batch.length) {
      // Hết batch → check tổng hôm nay
      const totalToday = getDailyLearned(uid) // đã bump rồi
      if (totalToday >= DAILY_MAX) setPhase('daily-max')
      else setPhase('batch-done')
    } else {
      setIdx(nextIdx)
    }
  }

  function skip() {
    const nextIdx = idx + 1
    if (nextIdx >= batch.length) {
      const totalToday = getDailyLearned(uid)
      if (totalToday >= DAILY_MAX) setPhase('daily-max')
      else setPhase('batch-done')
    } else {
      setIdx(nextIdx)
    }
  }

  function startMiniQuiz() {
    setQuizQs(buildMiniQuiz(batch))
    setQuizIdx(0)
    setQuizSel(null)
    setQuizAns([])
    setQuizDone(false)
    setPhase('mini-quiz')
  }

  function quizNext() {
    const ok = quizSel === quizQs[quizIdx].correct
    const newAns = [...quizAns, ok]
    setQuizAns(newAns)
    if (quizIdx + 1 >= quizQs.length) {
      setQuizDone(true)
    } else {
      setQuizIdx(q => q + 1)
      setQuizSel(null)
    }
  }

  function unlockNextBatch() {
    bumpDailyQuizPasses(uid)
    const newBatch = getTodayBatch(getLearnedWords(uid))
    setBatch(newBatch)
    setIdx(0)
    setPhase('learning')
    onProgress()
  }

  // ── Hết lộ trình ──────────────────────────────────────────────────────
  if (batch.length === 0 && phase === 'learning') {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">
          {isA ? 'Tuyệt vời! Bạn đã học hết lộ trình.' : 'Amazing! You finished the whole path.'}
        </p>
        <p className="text-sm text-zinc-400">
          {isA ? 'Hãy chuyển sang Ôn SRS để nhớ lâu hơn.' : 'Switch to SRS review to retain more.'}
        </p>
      </div>
    )
  }

  // ── Đã đạt 100 từ/ngày ────────────────────────────────────────────────
  if (phase === 'daily-max') {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-2">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-white font-semibold">
          {isA ? `Xuất sắc! Đã học đủ ${DAILY_MAX} từ hôm nay 🎉` : `Amazing! ${DAILY_MAX} words learned today 🎉`}
        </p>
        <p className="text-sm text-zinc-400">
          {isA ? 'Quay lại vào ngày mai để tiếp tục.' : 'Come back tomorrow to continue.'}
        </p>
        <p className="text-xs text-zinc-500 pt-1">
          {isA ? 'Trong khi chờ, hãy ôn SRS để nhớ lâu hơn.' : 'Meanwhile, review SRS to retain better.'}
        </p>
      </div>
    )
  }

  // ── Xong batch, chờ kiểm tra ──────────────────────────────────────────
  if (phase === 'batch-done') {
    return <BatchDoneView batch={batch} uid={uid} isA={isA}
      dailyStart={dailyStart} onStartQuiz={startMiniQuiz} />
  }

  // ── Mini-quiz mở batch mới ────────────────────────────────────────────
  if (phase === 'mini-quiz') {
    const q = quizQs[quizIdx]
    const allRight = quizAns.length === quizQs.length && quizAns.every(Boolean)

    if (quizDone) {
      if (allRight) {
        return (
          <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
            <p className="text-4xl">🏆</p>
            <p className="text-white font-semibold">{isA ? 'Xuất sắc! 100% đúng!' : 'Perfect! 100% correct!'}</p>
            <p className="text-sm text-zinc-400">
              {isA ? 'Bạn đã mở được 20 từ mới. Tiếp tục thôi!' : 'You unlocked 20 more words. Keep going!'}
            </p>
            <button onClick={unlockNextBatch}
              className="mt-2 w-full py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition">
              {isA ? 'Học 20 từ tiếp theo →' : 'Learn next 20 words →'}
            </button>
          </div>
        )
      }
      const score = quizAns.filter(Boolean).length
      return (
        <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
          <p className="text-4xl">📚</p>
          <p className="text-white font-semibold">
            {isA ? `${score}/${quizQs.length} — Cần đúng 100% để mở batch mới` : `${score}/${quizQs.length} — Need 100% to unlock next batch`}
          </p>
          <p className="text-sm text-zinc-400">
            {isA ? 'Ôn lại rồi thử lại nhé!' : 'Review and try again!'}
          </p>
          <button onClick={startMiniQuiz}
            className="w-full py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition">
            <RotateCcw className="w-4 h-4 inline mr-1" /> {isA ? 'Làm lại kiểm tra' : 'Retry quiz'}
          </button>
          <button onClick={() => setPhase('batch-done')}
            className="w-full py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition">
            {isA ? 'Ôn lại từ vừa học trước' : 'Review words first'}
          </button>
        </div>
      )
    }

    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="text-violet-400 font-medium">
            {isA ? 'Kiểm tra mở batch mới' : 'Quiz to unlock next batch'}
          </span>
          <span>{quizIdx + 1}/{quizQs.length}</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full">
          <div className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${(quizIdx / quizQs.length) * 100}%` }} />
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">
            {isA ? 'Nghĩa tiếng Việt của từ này là?' : 'Vietnamese meaning?'}
          </p>
          <p className="text-4xl font-bold text-white">{q.word}</p>
        </div>
        <div className="space-y-2.5">
          {q.options.map(opt => {
            let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
            if (quizSel !== null) {
              if (opt === q.correct)    cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300'
              else if (opt === quizSel) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
              else                      cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
            }
            return (
              <button key={opt} onClick={() => { if (quizSel === null) setQuizSel(opt) }}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {quizSel !== null && (
          <button onClick={quizNext}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition animate-fade-in">
            {quizIdx + 1 >= quizQs.length ? (isA ? 'Xem kết quả' : 'See results') : (isA ? 'Câu tiếp theo' : 'Next')}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // ── Đang học ──────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      {/* Tên chủ đề + tiến độ vòng */}
      {circle && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2">
          <span>{circle.emoji}</span>
          <span>{isA ? circle.titleVi : circle.titleEn}</span>
          {circleProgress && circleProgress.total > 0 && (
            <span className="text-zinc-400">
              ({circleProgress.done}/{circleProgress.total})
            </span>
          )}
        </div>
      )}

      {/* Tiến độ trong lượt */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>{isA ? 'Từ' : 'Word'} {idx + 1}/{batch.length}</span>
        <span className="text-zinc-400">
          {isA ? 'Tổng đã thuộc' : 'Total learned'}: {progress.done}/{progress.total}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${(idx / batch.length) * 100}%` }} />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onProgress} />

      <div className="grid grid-cols-2 gap-3">
        <button onClick={skip}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition py-3 rounded-xl text-sm font-medium">
          <X className="w-4 h-4" /> {isA ? 'Để sau' : 'Later'}
        </button>
        <button onClick={learn}
          className="flex items-center justify-center gap-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 transition py-3 rounded-xl text-sm font-medium">
          <Check className="w-4 h-4" /> {isA ? 'Đã thuộc' : 'Got it'}
        </button>
      </div>
    </div>
  )
}

// ── Tab Ôn SRS ────────────────────────────────────────────────────────────────
function SRSReview({ uid, isA, onUpdate }: { uid: string; isA: boolean; onUpdate: () => void }) {
  const allWords = getLearningPath()
  const [due, setDue]         = useState<DictEntry[]>(() => getDueWords(uid, allWords))
  const [idx, setIdx]         = useState(0)
  const [sessionDone, setDone] = useState(0)

  const card = due[idx]

  function rate(rating: Rating) {
    if (!card) return
    reviewWord(uid, card.word, rating)
    setDone(n => n + 1)
    onUpdate()
    const nextIdx = idx + 1
    if (nextIdx >= due.length) {
      // Kiểm tra xem còn thẻ "again" nào đến hạn không
      const remaining = getDueWords(uid, allWords)
      setDue(remaining)
      setIdx(0)
    } else {
      setIdx(nextIdx)
    }
  }

  const stats = getSRSStats(uid)

  if (!card) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
        <p className="text-3xl">{sessionDone > 0 ? '✅' : '🔁'}</p>
        <p className="text-white font-semibold">
          {sessionDone > 0
            ? (isA ? 'Ôn tập xong hôm nay!' : 'All caught up!')
            : (isA ? 'Không có từ nào cần ôn hôm nay' : 'No words due today')}
        </p>
        {sessionDone > 0 && (
          <p className="text-sm text-zinc-400">
            {isA ? `Đã ôn ${sessionDone} thẻ` : `Reviewed ${sessionDone} cards`}
          </p>
        )}
        <div className="text-xs text-zinc-400 space-y-1 pt-2 border-t border-zinc-800">
          <p>{isA ? `Tổng trong SRS: ${stats.total} từ` : `Total in SRS: ${stats.total} words`}</p>
          {stats.total === 0 && (
            <p className="text-zinc-400">
              {isA ? 'Học từ ở tab Hôm nay → từ tự vào SRS' : 'Learn words in Today tab → auto-added to SRS'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>{isA ? 'Ôn SRS' : 'SRS Review'}</span>
        <span>{idx + 1}/{due.length} {isA ? 'cần ôn' : 'due'}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${(idx / Math.max(due.length, 1)) * 100}%` }} />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onUpdate} />

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {([
          { r: 'again' as Rating, la: 'Quên',  lb: 'Again', cls: 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'       },
          { r: 'hard'  as Rating, la: 'Khó',   lb: 'Hard',  cls: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' },
          { r: 'good'  as Rating, la: 'Nhớ',   lb: 'Good',  cls: 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'         },
          { r: 'easy'  as Rating, la: 'Dễ',    lb: 'Easy',  cls: 'bg-accent-500/20 text-accent-300 hover:bg-accent-500/30' },
        ]).map(({ r, la, lb, cls }) => (
          <button key={r} onClick={() => rate(r)}
            className={`py-2.5 rounded-xl text-sm font-medium transition ${cls}`}>
            {isA ? la : lb}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-400 mt-2">
        {isA ? 'Quên → ôn sớm   ·   Dễ → ôn sau lâu hơn' : 'Again = review soon  ·  Easy = review later'}
      </p>
    </div>
  )
}

// ── Tab Từ khó ────────────────────────────────────────────────────────────────
function HardWords({ uid, isA, onUpdate }: { uid: string; isA: boolean; onUpdate: () => void }) {
  const allWords = getLearningPath()
  const [hardSet, setHardSet] = useState(() => getDifficultWords(uid))
  const hardWords = useMemo(
    () => allWords.filter(w => hardSet.has(w.word.toLowerCase())),
    [allWords, hardSet],
  )
  const [idx, setIdx] = useState(0)

  function refresh() {
    setHardSet(getDifficultWords(uid))
    onUpdate()
  }

  if (hardWords.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-2">
        <Star className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-white font-medium">{isA ? 'Chưa có từ khó' : 'No difficult words yet'}</p>
        <p className="text-sm text-zinc-400">
          {isA
            ? 'Bấm ⭐ trên thẻ từ để đánh dấu từ cần ôn thêm.'
            : 'Tap ⭐ on a word card to mark it as difficult.'}
        </p>
      </div>
    )
  }

  const card = hardWords[idx % hardWords.length]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>{isA ? `${hardWords.length} từ đã đánh dấu khó` : `${hardWords.length} difficult words`}</span>
        <span>{(idx % hardWords.length) + 1}/{hardWords.length}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${((idx % hardWords.length + 1) / hardWords.length) * 100}%` }} />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={refresh} />

      <button onClick={() => setIdx(i => i + 1)}
        className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition py-3 rounded-xl text-sm font-medium">
        <RotateCcw className="w-4 h-4" /> {isA ? 'Từ tiếp theo' : 'Next word'}
      </button>
    </div>
  )
}

// ── Tab Kiểm tra ──────────────────────────────────────────────────────────────
function QuizTab({ uid, isA }: { uid: string; isA: boolean }) {
  const nav = useNavigate()
  const [questions] = useState<QuizQuestion[]>(() => buildQuiz(uid))
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers,  setAnswers]  = useState<boolean[]>([])
  const [done,     setDone]     = useState(false)

  if (questions.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-zinc-400 text-sm">
          {isA
            ? 'Chưa đủ từ để tạo quiz. Hãy học vài từ ở tab Hôm nay trước nhé.'
            : 'Not enough words for a quiz yet. Learn some words first.'}
        </p>
      </div>
    )
  }

  const q     = questions[current]
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

  if (done) {
    const grade = pct >= 90 ? { emoji: '🏆', label: isA ? 'Xuất sắc!'    : 'Excellent!' }
                : pct >= 70 ? { emoji: '👍', label: isA ? 'Tốt lắm!'     : 'Good job!'  }
                : pct >= 50 ? { emoji: '💪', label: isA ? 'Cố lên!'      : 'Keep going!'}
                :             { emoji: '📚', label: isA ? 'Cần ôn thêm'  : 'Study more' }
    return (
      <div className="animate-fade-in space-y-4">
        <div className="glass rounded-xl p-8 text-center space-y-2">
          <p className="text-4xl">{grade.emoji}</p>
          <p className="text-2xl font-bold text-white">{score}/{QUIZ_SIZE}</p>
          <p className="text-zinc-400">{grade.label}</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${pct >= 70 ? 'bg-accent-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="space-y-1.5">
          {questions.map((qq, i) => (
            <div key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${answers[i] ? 'bg-accent-500/10 text-accent-300' : 'bg-rose-500/10 text-rose-300'}`}>
              <span>{answers[i] ? '✓' : '✗'}</span>
              <span className="font-medium">{qq.word}</span>
              <span className="text-zinc-400 flex-1 truncate">= {qq.correct}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={restart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition">
            <RotateCcw className="w-4 h-4" /> {isA ? 'Làm lại' : 'Retry'}
          </button>
          <button onClick={() => nav('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition">
            <Home className="w-4 h-4" /> {isA ? 'Trang chủ' : 'Home'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${(current / QUIZ_SIZE) * 100}%` }} />
      </div>
      <div className="text-center py-6">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">
          {isA
            ? `Câu ${current + 1}/${QUIZ_SIZE} — Nghĩa tiếng Việt của từ này là?`
            : `Q ${current + 1}/${QUIZ_SIZE} — Vietnamese meaning?`}
        </p>
        <p className="text-4xl font-bold text-white">{q.word}</p>
      </div>
      <div className="space-y-2.5">
        {q.options.map(opt => {
          let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
          if (selected !== null) {
            if (opt === q.correct)     cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300'
            else if (opt === selected) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
            else                       cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
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
