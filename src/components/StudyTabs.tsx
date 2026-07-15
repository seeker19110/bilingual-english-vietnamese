// ──────────────────────────────────────────────────────────────────────
// CÁC TAB HỌC THEO CẤP — Hôm nay · Ôn SRS · Từ khó · Kiểm tra
//
// Trước đây nằm ở trang /learning-path (Learn.tsx); nay mỗi cấp CEFR có
// TRANG RIÊNG (/learning-path/a1…b2) nên 4 tab này chuyển vào trang cấp
// (CefrLevelPage) và GIỚI HẠN theo từ vựng của cấp qua prop `pool`:
//   - pool = getLevelWords(cấp); riêng cấp CUỐI (B2) cộng thêm phần ngoài
//     lộ trình CEFR (getBeyondCefrWords) để học tiếp sau khi xong B2.
//   - Giới hạn ngày (20 từ/lượt, tối đa 100/ngày, quiz mở batch) vẫn tính
//     CHUNG toàn app (lib/curriculum.ts), KHÔNG tách theo cấp.
// Yêu cầu: đã await loadCurriculum() trước khi render (trang cấp lo việc này).
// ──────────────────────────────────────────────────────────────────────

import { useMemo, useState, useEffect } from 'react'
import {
  Check,
  X,
  RotateCcw,
  Trophy,
  Sparkles,
  ClipboardList,
  ChevronRight,
  Home,
  Star,
  MessageCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import KaraokeText, { KARAOKE_INDENT } from './KaraokeText'
import WordCard from './WordCard'
import type { DictEntry } from '../types'
import {
  markStudiedToday,
  shouldCelebrateStreak,
  markStreakCelebrated,
  getStreak,
} from '../lib/storage'
import { haptics, vibrate } from '../lib/haptics'
import StreakCelebration from './StreakCelebration'
import WeeklyGoalCelebration from './WeeklyGoalCelebration'
import { shouldCelebrateWeeklyGoal, markWeeklyGoalCelebrated } from '../lib/weeklyGoal'
import { getLearnedWords, markLearned, getDifficultWords } from '../lib/vocab'
import {
  addToSRS,
  reviewWord,
  getDueWords,
  getSRSStats,
  getLeechWords,
  SRS_SESSION_CAP,
  type Rating,
} from '../lib/srs'
import {
  getTodayBatchFrom,
  getPoolProgress,
  getDailyLearned,
  bumpDailyLearned,
  getDailyQuizPasses,
  bumpDailyQuizPasses,
  getDailyAllowance,
  getDailySpeed,
  getDailyMax,
  findCircleOfWord,
  getCircleProgress,
  getCefrLevelOfCircle,
  isQuizPass,
  QUIZ_PASS_THRESHOLD_PCT,
} from '../lib/curriculum'
import { getDialogues } from '../data/dialoguesLoader'
import type { Dialogue } from '../data/dialogues'
import type { QuizItem } from '../data/cefr'

// ── Quiz (tab Kiểm tra) ──────────────────────────────────────────────────────
const QUIZ_SIZE = 10
const CHOICES = 4
// V8, docs/research/cai-tien-lo-trinh-hoc.md: trộn tối đa 2-3 câu quiz NGỮ PHÁP (lấy từ
// các bài đã "học xong") vào tab Kiểm tra — ngữ pháp trước đây không có vòng lặp củng cố
// như từ vựng (nút "Đã học xong" không yêu cầu gì, quiz trong bài không lưu kết quả).
const GRAMMAR_QUIZ_COUNT = 3

// 1 câu quiz ngữ pháp lấy từ GrammarLesson.quiz (src/data/cefr.ts) + lessonId để "mở lại
// bài đó" khi trả lời sai.
export interface GrammarQuizSource {
  lessonId: string
  item: QuizItem
}

interface QuizQuestion {
  kind: 'vocab' | 'grammar'
  prompt: string // vocab: từ tiếng Anh · grammar: câu có chỗ trống (item.q)
  correct: string
  options: string[]
  lessonId?: string // chỉ có ở kind 'grammar'
}

// Câu hỏi từ vựng lấy trong `pool` (từ vựng của cấp đang học); câu hỏi ngữ pháp lấy trong
// `grammarPool` (đã lọc sẵn CHỈ các bài đã học xong, xem CefrLevelPage.tsx).
function buildQuiz(
  userId: string,
  pool: DictEntry[],
  grammarPool: GrammarQuizSource[],
): QuizQuestion[] {
  const grammarQs: QuizQuestion[] = [...grammarPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, GRAMMAR_QUIZ_COUNT)
    .map(({ lessonId, item }) => ({
      kind: 'grammar',
      prompt: item.q,
      correct: item.options[item.answer] ?? '',
      options: item.options,
      lessonId,
    }))

  const vocabSize = Math.max(QUIZ_SIZE - grammarQs.length, 0)
  const learned = getLearnedWords(userId)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const learnedPool = shuffled.filter(
    (w) => learned.has(w.word) || learned.has(w.word.toLowerCase()),
  )
  const cands =
    learnedPool.length >= vocabSize
      ? learnedPool
      : [...learnedPool, ...shuffled.slice(0, vocabSize - learnedPool.length)]
  const meanings = pool.map((w) => w.vi)
  const vocabQs: QuizQuestion[] = cands.slice(0, vocabSize).map((q) => {
    const wrongs = meanings
      .filter((m) => m !== q.vi)
      .sort(() => Math.random() - 0.5)
      .slice(0, CHOICES - 1)
    return {
      kind: 'vocab',
      prompt: q.word,
      correct: q.vi,
      options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5),
    }
  })

  return [...vocabQs, ...grammarQs].sort(() => Math.random() - 0.5)
}

// ── Tab Hôm nay ───────────────────────────────────────────────────────────────
// Mini-quiz mở batch mới: hỏi ĐỦ cả batch (không chỉ 5/20 từ) để mọi từ vừa học
// đều được kiểm tra ít nhất 1 lần, trộn đều 2 chiều EN→VI và VI→EN (testing
// effect 2 chiều bền hơn 1 chiều nhận biết).
const MINI_QUIZ_CHOICES = 4

type QuizDirection = 'en-vi' | 'vi-en'

interface MiniQuizQ {
  word: string // key để tra lại DictEntry gốc (map lỗi sai → flashcard ôn lại)
  direction: QuizDirection
  prompt: string // cái hiển thị lớn để hỏi (từ tiếng Anh hoặc nghĩa tiếng Việt)
  correct: string
  options: string[]
}

function buildMiniQuiz(batch: DictEntry[], pool: DictEntry[]): MiniQuizQ[] {
  const allMeanings = pool.map((w) => w.vi)
  const allWords = pool.map((w) => w.word)
  const qs = [...batch].sort(() => Math.random() - 0.5)
  return qs.map((q, i) => {
    // Xen kẽ 2 chiều theo thứ tự đã xáo trộn — mỗi từ chỉ hỏi 1 chiều/lượt.
    const direction: QuizDirection = i % 2 === 0 ? 'en-vi' : 'vi-en'
    if (direction === 'en-vi') {
      const wrongs = allMeanings
        .filter((m) => m !== q.vi)
        .sort(() => Math.random() - 0.5)
        .slice(0, MINI_QUIZ_CHOICES - 1)
      return {
        word: q.word,
        direction,
        prompt: q.word,
        correct: q.vi,
        options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5),
      }
    }
    const wrongs = allWords
      .filter((w) => w !== q.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, MINI_QUIZ_CHOICES - 1)
    return {
      word: q.word,
      direction,
      prompt: q.vi,
      correct: q.word,
      options: [q.word, ...wrongs].sort(() => Math.random() - 0.5),
    }
  })
}

type TodayPhase = 'learning' | 'batch-done' | 'mini-quiz' | 'mini-quiz-review' | 'daily-max'

// ── Màn "Xong batch": câu + hội thoại dựng TỪ CHÍNH 20 từ vừa học ─────────────
// "Câu thông dụng" lấy thẳng ví dụ của CHÍNH 20 từ trong batch (ex_en/ex_vi),
// kèm 1 HỘI THOẠI của vòng có nhiều từ nhất trong batch.
function BatchDoneView({
  batch,
  uid,
  isA,
  dailyStart,
  onStartQuiz,
}: {
  batch: DictEntry[]
  uid: string
  isA: boolean
  dailyStart: number
  onStartQuiz: () => void
}) {
  const nav = useNavigate()
  const learnedToday = getDailyLearned(uid) - dailyStart
  const totalToday = getDailyLearned(uid)
  const quizPasses = getDailyQuizPasses(uid)
  const speed = getDailySpeed(uid)
  const dailyMax = getDailyMax(uid)
  const canLearnMore = totalToday < dailyMax

  // Câu ví dụ từ CHÍNH các từ vừa học (mỗi từ có sẵn ex_en/ex_vi) → đổi theo batch.
  const sentences = useMemo(() => {
    const seen = new Set<string>()
    const out: { en: string; vi: string }[] = []
    for (const e of batch) {
      const en = e.ex_en?.trim()
      if (en && e.ex_vi && !seen.has(en)) {
        seen.add(en)
        out.push({ en, vi: e.ex_vi })
      }
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
    if (!topId) {
      setDialogue(null)
      return
    }
    let alive = true
    getDialogues(topId).then((ds) => {
      if (alive) setDialogue(ds[ds.length - 1] ?? null)
    })
    return () => {
      alive = false
    }
  }, [batch])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass rounded-xl p-8 text-center">
        <Check className="w-10 h-10 text-accent-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">
          {isA ? 'Hoàn thành bài hôm nay!' : "Today's lesson done!"}
        </p>
        <p className="text-sm text-zinc-400 mb-1">
          {isA ? (
            <>
              {`Đã học `}
              <strong className="text-accent-300">{learnedToday}</strong>
              {` từ trong lượt này · Tổng hôm nay: `}
              <strong className="text-accent-300">{totalToday}</strong>
              {`/${dailyMax}`}
            </>
          ) : (
            <>
              Learned <strong className="text-accent-300">{learnedToday}</strong> words · Today
              total: <strong className="text-accent-300">{totalToday}</strong>/{dailyMax}
            </>
          )}
        </p>
        {canLearnMore && (
          <p className="text-xs text-zinc-400 mt-2">
            {isA
              ? `Còn ${dailyMax - totalToday} từ có thể học hôm nay.`
              : `${dailyMax - totalToday} more words available today.`}
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
              <div
                key={i}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3"
              >
                <KaraokeText
                  text={s.en}
                  lang="en-US"
                  textClass="font-medium text-[15px] leading-snug text-teal-300"
                  buttonClass="w-full"
                />
                <p className={`text-sm text-zinc-400 mt-1 ${KARAOKE_INDENT}`}>{s.vi}</p>
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
              const name =
                ln.who === 'A'
                  ? isA
                    ? (dialogue.speakerA?.vi ?? 'A')
                    : (dialogue.speakerA?.en ?? 'A')
                  : isA
                    ? (dialogue.speakerB?.vi ?? 'B')
                    : (dialogue.speakerB?.en ?? 'B')
              return (
                <div key={i} className={`flex ${isB ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 border ${isB ? 'bg-teal-500/10 border-teal-500/30' : 'bg-zinc-900/80 border-zinc-800/80'}`}
                  >
                    <span
                      className={`text-[11px] font-semibold tracking-wide ${isB ? 'text-teal-300' : 'text-zinc-400'}`}
                    >
                      {name}
                    </span>
                    <KaraokeText
                      text={ln.en}
                      lang="en-US"
                      textClass={`font-medium text-[15px] leading-snug ${isB ? 'text-teal-300' : 'text-zinc-100'}`}
                      buttonClass="w-full"
                    />
                    <p className={`text-sm text-zinc-400 mt-1 ${KARAOKE_INDENT}`}>{ln.vi}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CTA: 1 nút chính + các lựa chọn phụ (V-3 "vòng cung phiên" + đề xuất B) ──
          Nút chính: LUYỆN NGAY các từ vừa học bằng hội thoại — đóng vòng
          recognition → use (từ được bơm vào prompt Chat/Nói qua ?words=). */}
      <button
        onClick={() => nav(`/chat?words=${encodeURIComponent(batch.map((w) => w.word).join(','))}`)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
      >
        <MessageCircle className="w-4 h-4" />
        {isA
          ? `Luyện ngay ${batch.length} từ này bằng hội thoại`
          : `Practice these ${batch.length} words in a chat`}
      </button>
      <button
        onClick={() =>
          nav(`/speaking?words=${encodeURIComponent(batch.map((w) => w.word).join(','))}`)
        }
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 theme-light:text-sky-700 text-sm font-medium transition"
      >
        🎤 {isA ? 'Hoặc luyện nói với giọng thật' : 'Or practice speaking aloud'}
      </button>
      {canLearnMore && quizPasses < dailyMax / speed - 1 && (
        <button
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition"
        >
          <ClipboardList className="w-4 h-4" />
          {isA
            ? `Muốn học thêm? Kiểm tra ngắn để mở ${speed} từ tiếp theo →`
            : `Want more? Short quiz unlocks ${speed} more words →`}
        </button>
      )}
    </div>
  )
}

export function TodayLesson({
  uid,
  isA,
  pool,
  onProgress,
}: {
  uid: string
  isA: boolean
  pool: DictEntry[]
  onProgress: () => void
}) {
  const dailyMax = getDailyMax(uid)
  const speed = getDailySpeed(uid)

  // Phase bắt đầu dựa trên trạng thái ngày hiện tại
  const [phase, setPhase] = useState<TodayPhase>(() => {
    const learned = getDailyLearned(uid)
    if (learned >= dailyMax) return 'daily-max'
    if (learned >= getDailyAllowance(uid)) return 'batch-done'
    return 'learning'
  })
  const [batch, setBatch] = useState<DictEntry[]>(() =>
    getTodayBatchFrom(pool, getLearnedWords(uid), speed),
  )
  const [idx, setIdx] = useState(0)
  const [dailyStart] = useState(() => getDailyLearned(uid))

  // Mini-quiz state
  const [quizQs, setQuizQs] = useState<MiniQuizQ[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizSel, setQuizSel] = useState<string | null>(null)
  const [quizAns, setQuizAns] = useState<boolean[]>([])
  const [quizDone, setQuizDone] = useState(false)
  // Từ trả lời sai trong mini-quiz — ôn lại flashcard TRƯỚC KHI cho làm lại quiz.
  const [wrongWords, setWrongWords] = useState<DictEntry[]>([])
  const [reviewIdx, setReviewIdx] = useState(0)
  // Khoảnh khắc streak — "đỉnh" cảm xúc, bắn 1 lần/ngày khi xong batch đầu tiên
  // (V-2, docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md).
  const [celebrating, setCelebrating] = useState(false)
  // Khoảnh khắc ĐẠT MỤC TIÊU TUẦN — 1 lần/tuần, hiện SAU màn streak nếu trùng ngày
  // (② M1, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
  const [weekCelebrating, setWeekCelebrating] = useState(false)

  // Tiến độ CỦA CẤP này (pool đã lọc theo cấp ở trang cha) — trước đây dùng
  // getPathProgress (cả lộ trình, ~10.000 từ) gây khó hiểu khi đang xem 1 cấp.
  const progress = useMemo(() => getPoolProgress(pool, getLearnedWords(uid)), [pool, uid])
  const card = batch[idx]
  const circle = card ? findCircleOfWord(card.word) : undefined

  const circleProgress = useMemo(() => {
    if (!circle) return null
    return getCircleProgress(circle.id, getLearnedWords(uid))
  }, [circle, uid])

  function learn() {
    if (!card) return
    haptics.success() // phản hồi xúc giác khi thuộc thêm 1 từ
    markLearned(uid, card.word)
    addToSRS(uid, card.word)
    bumpDailyLearned(uid)
    markStudiedToday(uid) // ghi nhận có học hôm nay → tính streak (đồng bộ server)
    onProgress()
    const nextIdx = idx + 1
    if (nextIdx >= batch.length) {
      // Hết batch → check tổng hôm nay
      const totalToday = getDailyLearned(uid) // đã bump rồi
      if (totalToday >= dailyMax) setPhase('daily-max')
      else setPhase('batch-done')
      // Lần ĐẦU hoàn thành bài trong ngày → màn "🔥 Chuỗi N ngày" (1 lần/ngày).
      // Đánh dấu đã ăn mừng NGAY (không đợi onDone) — rời trang giữa chừng vẫn
      // không hiện lại màn này trong cùng ngày.
      if (shouldCelebrateStreak(uid)) {
        markStreakCelebrated(uid)
        setCelebrating(true)
      }
      // Hôm nay vừa thành "ngày có học" → có thể vừa chạm mục tiêu tuần.
      // Đánh dấu NGAY (không đợi onDone) để rời trang giữa chừng không bắn lặp.
      if (shouldCelebrateWeeklyGoal(uid)) {
        markWeeklyGoalCelebrated(uid)
        setWeekCelebrating(true)
      }
    } else {
      setIdx(nextIdx)
    }
  }

  function skip() {
    haptics.tap()
    const nextIdx = idx + 1
    if (nextIdx >= batch.length) {
      const totalToday = getDailyLearned(uid)
      if (totalToday >= dailyMax) setPhase('daily-max')
      else setPhase('batch-done')
    } else {
      setIdx(nextIdx)
    }
  }

  function startMiniQuiz() {
    setQuizQs(buildMiniQuiz(batch, pool))
    setQuizIdx(0)
    setQuizSel(null)
    setQuizAns([])
    setQuizDone(false)
    setPhase('mini-quiz')
  }

  function quizNext() {
    const q = quizQs[quizIdx]
    if (!q) return
    const ok = quizSel === q.correct
    const newAns = [...quizAns, ok]
    setQuizAns(newAns)
    if (quizIdx + 1 >= quizQs.length) {
      const wrongKeys = new Set(
        quizQs.filter((_, i) => !newAns[i]).map((qq) => qq.word.toLowerCase()),
      )
      setWrongWords(batch.filter((w) => wrongKeys.has(w.word.toLowerCase())))
      setQuizDone(true)
    } else {
      setQuizIdx((q) => q + 1)
      setQuizSel(null)
    }
  }

  // Xem lại flashcard của từng từ trả lời sai TRƯỚC KHI làm lại quiz.
  function startWrongReview() {
    setReviewIdx(0)
    setPhase('mini-quiz-review')
  }

  function reviewNext() {
    if (reviewIdx + 1 >= wrongWords.length) {
      startMiniQuiz()
    } else {
      setReviewIdx((i) => i + 1)
    }
  }

  function unlockNextBatch() {
    bumpDailyQuizPasses(uid)
    const newBatch = getTodayBatchFrom(pool, getLearnedWords(uid), speed)
    setBatch(newBatch)
    setIdx(0)
    setPhase('learning')
    onProgress()
  }

  // ── Đã thuộc hết từ vựng của cấp này ──────────────────────────────────
  if (batch.length === 0 && phase === 'learning') {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-white font-semibold mb-1">
          {isA
            ? 'Tuyệt vời! Bạn đã thuộc hết từ vựng phần này.'
            : 'Amazing! You learned all words here.'}
        </p>
        <p className="text-sm text-zinc-400">
          {isA
            ? 'Hãy Ôn SRS để nhớ lâu hơn, hoặc sang cấp tiếp theo.'
            : 'Review SRS to retain more, or move to the next level.'}
        </p>
      </div>
    )
  }

  // ── Khoảnh khắc streak (overlay toàn màn, 1 lần/ngày) — hiện TRƯỚC màn xong bài
  if (celebrating) {
    return (
      <StreakCelebration
        uid={uid}
        isA={isA}
        onDone={() => {
          setCelebrating(false)
        }}
      />
    )
  }

  // ── Khoảnh khắc mục tiêu tuần (1 lần/tuần) — hiện SAU màn streak (nếu có)
  if (weekCelebrating) {
    return (
      <WeeklyGoalCelebration
        uid={uid}
        isA={isA}
        onDone={() => {
          setWeekCelebrating(false)
        }}
      />
    )
  }

  // ── Đã đạt 100 từ/ngày ────────────────────────────────────────────────
  if (phase === 'daily-max') {
    const streakTomorrow = getStreak(uid) + 1
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-2">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-white font-semibold">
          {isA
            ? `Xuất sắc! Đã học đủ ${dailyMax} từ hôm nay 🎉`
            : `Amazing! ${dailyMax} words learned today 🎉`}
        </p>
        {/* Móc quay lại: cho thấy phần thưởng cụ thể của ngày mai (V-3 "kết" phiên) */}
        <p className="text-sm text-orange-400">
          {isA
            ? `🔥 Hẹn mai nhé — chuỗi sẽ thành ${streakTomorrow} ngày!`
            : `🔥 See you tomorrow — your streak becomes ${streakTomorrow} days!`}
        </p>
        <p className="text-xs text-zinc-400 pt-1">
          {isA
            ? 'Trong khi chờ, hãy ôn SRS để nhớ lâu hơn.'
            : 'Meanwhile, review SRS to retain better.'}
        </p>
      </div>
    )
  }

  // ── Xong batch, chờ kiểm tra ──────────────────────────────────────────
  if (phase === 'batch-done') {
    return (
      <BatchDoneView
        batch={batch}
        uid={uid}
        isA={isA}
        dailyStart={dailyStart}
        onStartQuiz={startMiniQuiz}
      />
    )
  }

  // ── Mini-quiz mở batch mới ────────────────────────────────────────────
  if (phase === 'mini-quiz') {
    const q = quizQs[quizIdx]
    const score = quizAns.filter(Boolean).length
    const passed = quizAns.length === quizQs.length && isQuizPass(score, quizQs.length)

    if (quizDone) {
      if (passed) {
        return (
          <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
            <p className="text-4xl">🏆</p>
            <p className="text-white font-semibold">
              {isA
                ? `Xuất sắc! ${score}/${quizQs.length} đúng!`
                : `Great! ${score}/${quizQs.length} correct!`}
            </p>
            <p className="text-sm text-zinc-400">
              {isA
                ? `Bạn đã mở được ${speed} từ mới. Tiếp tục thôi!`
                : `You unlocked ${speed} more words. Keep going!`}
            </p>
            <button
              onClick={unlockNextBatch}
              className="mt-2 w-full py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
            >
              {isA ? `Học ${speed} từ tiếp theo →` : `Learn next ${speed} words →`}
            </button>
          </div>
        )
      }
      return (
        <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
          <p className="text-4xl">📚</p>
          <p className="text-white font-semibold">
            {isA
              ? `${score}/${quizQs.length} — Cần đạt ≥${QUIZ_PASS_THRESHOLD_PCT}% để mở batch mới`
              : `${score}/${quizQs.length} — Need ≥${QUIZ_PASS_THRESHOLD_PCT}% to unlock next batch`}
          </p>
          <p className="text-sm text-zinc-400">
            {isA ? 'Ôn lại rồi thử lại nhé!' : 'Review and try again!'}
          </p>
          <button
            onClick={wrongWords.length > 0 ? startWrongReview : startMiniQuiz}
            className="w-full py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            {wrongWords.length > 0
              ? isA
                ? `Ôn lại ${wrongWords.length} từ sai rồi làm lại`
                : `Review ${wrongWords.length} missed words then retry`
              : isA
                ? 'Làm lại kiểm tra'
                : 'Retry quiz'}
          </button>
          <button
            onClick={() => setPhase('batch-done')}
            className="w-full py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
          >
            {isA ? 'Ôn lại từ vừa học trước' : 'Review words first'}
          </button>
        </div>
      )
    }

    if (!q) return null // quizIdx luôn hợp lệ ở nhánh này; guard để TS narrow kiểu
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="text-violet-400 font-medium">
            {isA ? 'Kiểm tra mở batch mới' : 'Quiz to unlock next batch'}
          </span>
          <span>
            {quizIdx + 1}/{quizQs.length}
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${(quizIdx / quizQs.length) * 100}%` }}
          />
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">
            {q.direction === 'en-vi'
              ? isA
                ? 'Nghĩa tiếng Việt của từ này là?'
                : 'Vietnamese meaning?'
              : isA
                ? 'Từ tiếng Anh của nghĩa này là?'
                : 'English word for this meaning?'}
          </p>
          <p className="text-4xl font-bold text-white">{q.prompt}</p>
        </div>
        <div className="space-y-2.5">
          {q.options.map((opt) => {
            let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
            if (quizSel !== null) {
              // Đúng → phồng nhẹ; đáp án sai đã chọn → lắc ngang (phản hồi tức thì)
              if (opt === q.correct)
                cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300 animate-pop-correct'
              else if (opt === quizSel)
                cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-shake'
              else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
            }
            return (
              <button
                key={opt}
                onClick={() => {
                  if (quizSel === null) {
                    setQuizSel(opt)
                    if (opt === q.correct) haptics.success()
                    else vibrate(60)
                  }
                }}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
        {quizSel !== null && (
          <button
            onClick={quizNext}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition animate-fade-in"
          >
            {quizIdx + 1 >= quizQs.length
              ? isA
                ? 'Xem kết quả'
                : 'See results'
              : isA
                ? 'Câu tiếp theo'
                : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // ── Ôn lại flashcard của từ trả lời sai TRƯỚC KHI làm lại mini-quiz ────
  if (phase === 'mini-quiz-review') {
    const reviewCard = wrongWords[reviewIdx]
    if (!reviewCard) return null // wrongWords không rỗng khi vào phase này
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span>{isA ? 'Ôn lại từ đã trả lời sai' : 'Review missed words'}</span>
          <span>
            {reviewIdx + 1}/{wrongWords.length}
          </span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full mb-4">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${((reviewIdx + 1) / wrongWords.length) * 100}%` }}
          />
        </div>

        <div key={reviewCard.word} className="animate-fade-in">
          <WordCard card={reviewCard} isA={isA} uid={uid} onUpdate={onProgress} />
        </div>

        <button
          onClick={reviewNext}
          className="w-full flex items-center justify-center gap-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition py-3 rounded-xl text-sm font-medium mt-3"
        >
          {reviewIdx + 1 >= wrongWords.length
            ? isA
              ? 'Làm lại kiểm tra'
              : 'Retry quiz'
            : isA
              ? 'Từ tiếp theo'
              : 'Next word'}
        </button>
      </div>
    )
  }

  // ── Đang học ──────────────────────────────────────────────────────────
  if (!card) return null // idx luôn trong batch ở phase này; guard để TS narrow kiểu
  // Cấp CEFR của vòng đang học (null với vòng mở rộng) — hiện chip nhỏ cho biết
  // từ hôm nay thuộc cấp nào.
  const circleLevel = circle ? getCefrLevelOfCircle(circle.id) : null
  // Màn mở phiên (V-3): 1 dòng cho biết lượt này gồm gì — chỉ hiện ở thẻ ĐẦU,
  // tự biến mất khi sang thẻ 2 (không thêm bước bấm nào).
  const srsWaiting = idx === 0 ? getDueWords(uid, pool).length : 0
  return (
    <div className="animate-fade-in">
      {idx === 0 && (
        <div className="glass rounded-xl px-4 py-2.5 mb-3 text-center">
          <p className="text-sm text-white font-medium">
            {isA
              ? `Lượt này: ${batch.length} từ mới · ~${Math.max(2, Math.round(batch.length / 2))} phút`
              : `This round: ${batch.length} new words · ~${Math.max(2, Math.round(batch.length / 2))} min`}
          </p>
          {srsWaiting > 0 && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {isA
                ? `+ ${srsWaiting} thẻ SRS đang chờ ôn sau đó`
                : `+ ${srsWaiting} SRS cards waiting after`}
            </p>
          )}
        </div>
      )}
      {/* Tên chủ đề + cấp CEFR + tiến độ vòng */}
      {circle && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-2">
          {circleLevel && (
            <span className="px-1.5 py-0.5 rounded bg-accent-500/15 text-accent-300 theme-light:text-accent-800 font-bold text-[11px]">
              {circleLevel}
            </span>
          )}
          <span>{circle.emoji}</span>
          <span>{isA ? circle.titleVi : circle.titleEn}</span>
          {circleProgress && circleProgress.total > 0 && (
            <span className="text-zinc-400">
              ({circleProgress.done}/{circleProgress.total})
            </span>
          )}
        </div>
      )}

      {/* Tiến độ trong lượt — số bước pop nhẹ khi nhảy, thanh chạy mượt */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>
          {isA ? 'Từ' : 'Word'}{' '}
          <span key={idx} className="inline-block animate-pop-correct">
            {idx + 1}
          </span>
          /{batch.length}
        </span>
        <span className="text-zinc-400">
          {isA ? 'Tổng đã thuộc' : 'Total learned'}: {progress.done}/{progress.total}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-300"
          style={{ width: `${(idx / batch.length) * 100}%` }}
        />
      </div>

      {/* key theo từ → thẻ mới trượt vào khi chuyển */}
      <div key={card.word} className="animate-fade-in">
        <WordCard card={card} isA={isA} uid={uid} onUpdate={onProgress} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={skip}
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition py-3 rounded-xl text-sm font-medium"
        >
          <X className="w-4 h-4" /> {isA ? 'Để sau' : 'Later'}
        </button>
        <button
          onClick={learn}
          className="flex items-center justify-center gap-2 bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 transition py-3 rounded-xl text-sm font-medium"
        >
          <Check className="w-4 h-4" /> {isA ? 'Đã thuộc' : 'Got it'}
        </button>
      </div>
    </div>
  )
}

// ── Tab Ôn SRS ────────────────────────────────────────────────────────────────
// `pool` = TOÀN BỘ từ đã học (mọi cấp + Mở rộng) — mặc định ôn theo pool này để
// không bỏ sót từ cấp khác đến hạn. `levelPool` = riêng từ vựng của cấp đang mở,
// dùng khi người dùng bật lọc "Chỉ cấp này". Mỗi phiên cap SRS_SESSION_CAP thẻ,
// ưu tiên thẻ quá hạn lâu nhất, để tránh cảm giác ngợp khi quay lại sau vài ngày.
export function SRSReview({
  uid,
  isA,
  pool,
  levelPool,
  onUpdate,
}: {
  uid: string
  isA: boolean
  pool: DictEntry[]
  levelPool: DictEntry[]
  onUpdate: () => void
}) {
  const [onlyThisLevel, setOnlyThisLevel] = useState(false)
  const activePool = onlyThisLevel ? levelPool : pool
  const [due, setDue] = useState<DictEntry[]>(() => getDueWords(uid, activePool, SRS_SESSION_CAP))
  const [idx, setIdx] = useState(0)
  const [sessionDone, setDone] = useState(0)

  function toggleScope() {
    const next = !onlyThisLevel
    setOnlyThisLevel(next)
    setDue(getDueWords(uid, next ? levelPool : pool, SRS_SESSION_CAP))
    setIdx(0)
  }

  const card = due[idx]

  function rate(rating: Rating) {
    if (!card) return
    // Nhớ/Dễ → rung "thành công"; Quên/Khó → rung chạm thường
    if (rating === 'good' || rating === 'easy') haptics.success()
    else haptics.tap()
    reviewWord(uid, card.word, rating)
    setDone((n) => n + 1)
    onUpdate()
    const nextIdx = idx + 1
    if (nextIdx >= due.length) {
      // Kiểm tra xem còn thẻ "again" nào đến hạn không
      const remaining = getDueWords(uid, activePool, SRS_SESSION_CAP)
      setDue(remaining)
      setIdx(0)
    } else {
      setIdx(nextIdx)
    }
  }

  const stats = getSRSStats(uid)
  const totalDue = getDueWords(uid, activePool).length

  const scopeToggle = (
    <button
      onClick={toggleScope}
      className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition"
    >
      {onlyThisLevel
        ? isA
          ? 'Đang lọc: chỉ cấp này — bấm để ôn tất cả'
          : 'Filter: this level only — tap for all levels'
        : isA
          ? 'Đang ôn: tất cả các cấp — bấm để chỉ lọc cấp này'
          : 'Reviewing: all levels — tap to filter this level'}
    </button>
  )

  if (!card) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
        <p className="text-3xl">{sessionDone > 0 ? '✅' : '🔁'}</p>
        <p className="text-white font-semibold">
          {sessionDone > 0
            ? isA
              ? 'Ôn tập xong hôm nay!'
              : 'All caught up!'
            : isA
              ? 'Không có từ nào cần ôn hôm nay'
              : 'No words due today'}
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
              {isA
                ? 'Học từ ở tab Hôm nay → từ tự vào SRS'
                : 'Learn words in Today tab → auto-added to SRS'}
            </p>
          )}
        </div>
        {levelPool.length > 0 && levelPool.length !== pool.length && (
          <div className="pt-1">{scopeToggle}</div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>{isA ? 'Ôn SRS' : 'SRS Review'}</span>
        <span>
          {idx + 1}/{due.length} {isA ? 'cần ôn' : 'due'}
          {totalDue > due.length ? ` (${totalDue} ${isA ? 'tổng' : 'total'})` : ''}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${(idx / Math.max(due.length, 1)) * 100}%` }}
        />
      </div>

      {/* key theo từ → thẻ mới trượt vào khi chuyển */}
      <div key={card.word} className="animate-fade-in">
        <WordCard card={card} isA={isA} uid={uid} onUpdate={onUpdate} />
      </div>

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {[
          {
            r: 'again' as Rating,
            la: 'Quên',
            lb: 'Again',
            cls: 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30',
          },
          {
            r: 'hard' as Rating,
            la: 'Khó',
            lb: 'Hard',
            cls: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
          },
          {
            r: 'good' as Rating,
            la: 'Nhớ',
            lb: 'Good',
            cls: 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30',
          },
          {
            r: 'easy' as Rating,
            la: 'Dễ',
            lb: 'Easy',
            cls: 'bg-accent-500/20 text-accent-300 hover:bg-accent-500/30',
          },
        ].map(({ r, la, lb, cls }) => (
          <button
            key={r}
            onClick={() => rate(r)}
            className={`py-2.5 rounded-xl text-sm font-medium transition ${cls}`}
          >
            {isA ? la : lb}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-400 mt-2">
        {isA
          ? 'Quên → ôn sớm   ·   Dễ → ôn sau lâu hơn'
          : 'Again = review soon  ·  Easy = review later'}
      </p>
      {levelPool.length > 0 && levelPool.length !== pool.length && (
        <p className="text-center mt-2">{scopeToggle}</p>
      )}
    </div>
  )
}

// ── Tab Từ khó ────────────────────────────────────────────────────────────────
// Gồm từ đánh dấu ⭐ thủ công VÀ "leech" tự động (≥3 lần bấm "Quên" ở SRS) —
// cả 2 loại đều cần chú ý thêm nên gộp chung 1 danh sách.
export function HardWords({
  uid,
  isA,
  pool,
  onUpdate,
}: {
  uid: string
  isA: boolean
  pool: DictEntry[]
  onUpdate: () => void
}) {
  const [hardSet, setHardSet] = useState(() => getDifficultWords(uid))
  const leechWords = useMemo(() => getLeechWords(uid, pool), [uid, pool])
  const hardWords = useMemo(() => {
    const leechKeys = new Set(leechWords.map((w) => w.word.toLowerCase()))
    return pool.filter(
      (w) => hardSet.has(w.word.toLowerCase()) || leechKeys.has(w.word.toLowerCase()),
    )
  }, [pool, hardSet, leechWords])
  const [idx, setIdx] = useState(0)

  function refresh() {
    setHardSet(getDifficultWords(uid))
    onUpdate()
  }

  if (hardWords.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-2">
        <Star className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-white font-medium">
          {isA ? 'Chưa có từ khó trong phần này' : 'No difficult words here yet'}
        </p>
        <p className="text-sm text-zinc-400">
          {isA
            ? 'Bấm ⭐ trên thẻ từ để đánh dấu từ cần ôn thêm.'
            : 'Tap ⭐ on a word card to mark it as difficult.'}
        </p>
      </div>
    )
  }

  const card = hardWords[idx % hardWords.length]
  if (!card) return null // hardWords không rỗng ở nhánh này; guard để TS narrow kiểu

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>
          {isA ? `${hardWords.length} từ đã đánh dấu khó` : `${hardWords.length} difficult words`}
        </span>
        <span>
          {(idx % hardWords.length) + 1}/{hardWords.length}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${(((idx % hardWords.length) + 1) / hardWords.length) * 100}%` }}
        />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={refresh} />

      <button
        onClick={() => setIdx((i) => i + 1)}
        className="w-full flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition py-3 rounded-xl text-sm font-medium"
      >
        <RotateCcw className="w-4 h-4" /> {isA ? 'Từ tiếp theo' : 'Next word'}
      </button>
    </div>
  )
}

// ── Tab Kiểm tra ──────────────────────────────────────────────────────────────
export function QuizTab({
  uid,
  isA,
  pool,
  grammarPool,
  onOpenLesson,
}: {
  uid: string
  isA: boolean
  pool: DictEntry[]
  grammarPool: GrammarQuizSource[]
  onOpenLesson: (lessonId: string) => void
}) {
  const nav = useNavigate()
  const [questions] = useState<QuizQuestion[]>(() => buildQuiz(uid, pool, grammarPool))
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [done, setDone] = useState(false)

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

  const q = questions[current]
  if (!q) return null // current luôn hợp lệ ở nhánh này; guard để TS narrow kiểu
  const score = answers.filter(Boolean).length
  const pct = Math.round((score / questions.length) * 100)

  function pick(opt: string) {
    if (selected === null) {
      setSelected(opt)
      if (opt === q?.correct) haptics.success()
      else vibrate(60)
    }
  }

  function next() {
    if (!q) return
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      // Đạt ≥ ngưỡng chung → cũng tính là 1 lần "kiểm tra đạt", mở thêm từ mới cho
      // hôm nay giống mini-quiz ở tab "Hôm nay" (trần tối đa/ngày vẫn giữ nguyên).
      const passedFinal = isQuizPass(newAnswers.filter(Boolean).length, questions.length)
      if (passedFinal && getDailyLearned(uid) < getDailyMax(uid)) {
        bumpDailyQuizPasses(uid)
      }
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  function restart() {
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setDone(false)
  }

  if (done) {
    const grade =
      pct >= 90
        ? { emoji: '🏆', label: isA ? 'Xuất sắc!' : 'Excellent!' }
        : pct >= 70
          ? { emoji: '👍', label: isA ? 'Tốt lắm!' : 'Good job!' }
          : pct >= 50
            ? { emoji: '💪', label: isA ? 'Cố lên!' : 'Keep going!' }
            : { emoji: '📚', label: isA ? 'Cần ôn thêm' : 'Study more' }
    // Đạt ngưỡng chung đã mở thêm từ mới cho hôm nay ở tab "Hôm nay" (xem next()) —
    // báo cho người dùng biết, trừ khi đã đạt trần tối đa/ngày (không còn gì để mở thêm).
    const unlockedMore =
      isQuizPass(score, questions.length) && getDailyLearned(uid) < getDailyMax(uid)
    return (
      <div className="animate-fade-in space-y-4">
        <div className="glass rounded-xl p-8 text-center space-y-2">
          <p className="text-4xl">{grade.emoji}</p>
          <p className="text-2xl font-bold text-white">
            {score}/{questions.length}
          </p>
          <p className="text-zinc-400">{grade.label}</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full ${pct >= 70 ? 'bg-accent-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {unlockedMore && (
            <p className="text-xs text-accent-300 pt-1">
              {isA
                ? `🎉 Đạt ≥${QUIZ_PASS_THRESHOLD_PCT}% — đã mở thêm ${getDailySpeed(uid)} từ mới cho hôm nay ở tab "Hôm nay"!`
                : `🎉 Scored ≥${QUIZ_PASS_THRESHOLD_PCT}% — unlocked ${getDailySpeed(uid)} more words for today in the "Today" tab!`}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          {questions.map((qq, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${answers[i] ? 'bg-accent-500/10 text-accent-300' : 'bg-rose-500/10 text-rose-300'}`}
            >
              <span>{answers[i] ? '✓' : '✗'}</span>
              <span className="font-medium truncate">{qq.prompt}</span>
              <span className="text-zinc-400 flex-1 truncate">= {qq.correct}</span>
              {!answers[i] && qq.kind === 'grammar' && qq.lessonId && (
                <button
                  onClick={() => onOpenLesson(qq.lessonId!)}
                  className="text-xs text-violet-300 hover:text-violet-200 underline underline-offset-2 shrink-0"
                >
                  {isA ? 'Mở lại bài' : 'Review'}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition"
          >
            <RotateCcw className="w-4 h-4" /> {isA ? 'Làm lại' : 'Retry'}
          </button>
          <button
            onClick={() => nav('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
          >
            <Home className="w-4 h-4" /> {isA ? 'Trang chủ' : 'Home'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>
      <div className="text-center py-6">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">
          {q.kind === 'vocab'
            ? isA
              ? `Câu ${current + 1}/${questions.length} — Nghĩa tiếng Việt của từ này là?`
              : `Q ${current + 1}/${questions.length} — Vietnamese meaning?`
            : isA
              ? `Câu ${current + 1}/${questions.length} — Điền vào chỗ trống`
              : `Q ${current + 1}/${questions.length} — Fill in the blank`}
        </p>
        {q.kind === 'vocab' ? (
          <p className="text-4xl font-bold text-white">{q.prompt}</p>
        ) : (
          <p className="text-xl font-semibold text-white leading-snug px-2">{q.prompt}</p>
        )}
      </div>
      <div className="space-y-2.5">
        {q.options.map((opt) => {
          let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
          if (selected !== null) {
            // Đúng → phồng nhẹ; đáp án sai đã chọn → lắc ngang (đồng bộ mini-quiz)
            if (opt === q.correct)
              cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300 animate-pop-correct'
            else if (opt === selected)
              cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300 animate-shake'
            else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <button
          onClick={next}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition animate-fade-in"
        >
          {current + 1 >= questions.length
            ? isA
              ? 'Xem kết quả'
              : 'See results'
            : isA
              ? 'Câu tiếp theo'
              : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
