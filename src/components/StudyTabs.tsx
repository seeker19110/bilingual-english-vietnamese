// ──────────────────────────────────────────────────────────────────────
// CÁC TAB HỌC THEO CẤP — Hôm nay · Ôn SRS · Từ khó · Kiểm tra
//
// Trước đây nằm ở trang /learning-path (Learn.tsx); nay mỗi cấp CEFR có
// TRANG RIÊNG (/learning-path/a1…b2) nên 4 tab này chuyển vào trang cấp
// (CefrLevelPage). "Hôm nay"/"Từ khó"/"Kiểm tra" GIỚI HẠN theo từ vựng của
// cấp qua prop `pool`:
//   - pool = getLevelWords(cấp); riêng cấp CUỐI (B2) cộng thêm phần ngoài
//     lộ trình CEFR (getBeyondCefrWords) để học tiếp sau khi xong B2.
//   - Giới hạn ngày (tốc độ học 5/10/20 từ/lượt tùy chọn ở Hồ sơ, trần = 5×tốc
//     độ, quiz mở batch) vẫn tính CHUNG toàn app (lib/curriculum.ts), KHÔNG
//     tách theo cấp.
// "Ôn SRS" dùng TOÀN BỘ lộ trình (mọi cấp) qua `pool` riêng — ôn tập không nên
// bị chặn theo cấp đang xem (xem docs/research/cai-tien-lo-trinh-hoc.md, V1).
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
import { markStudiedToday, daysSinceLastStudy } from '../lib/storage'
import { getLearnedWords, markLearned, getDifficultWords } from '../lib/vocab'
import {
  addToSRS,
  reviewWord,
  getDueSession,
  getSRSStats,
  SESSION_CAP,
  WELCOME_BACK_CAP,
  type Rating,
} from '../lib/srs'
import {
  DAILY_MAX_MULTIPLIER,
  getDailyGoal,
  getTodayBatchFrom,
  getPathProgress,
  getDailyLearned,
  bumpDailyLearned,
  getDailyQuizPasses,
  bumpDailyQuizPasses,
  getDailyAllowance,
  findCircleOfWord,
  getCircleProgress,
  getCefrLevelOfCircle,
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
// Mini-quiz hỏi ĐỦ cả batch (tối đa = tốc độ học đã chọn, xem getDailyGoal) thay vì chỉ 5 câu, để không có
// từ nào "lọt lưới" chưa từng được kiểm tra trước khi tính là đã học (V4,
// docs/research/cai-tien-lo-trinh-hoc.md). Trộn 2 CHIỀU: nửa EN→VI (nhìn từ, chọn
// nghĩa — dễ hơn) và nửa VI→EN (nhìn nghĩa, chọn từ — khó hơn, đúng testing effect).
// Cần đúng 100% để mở batch mới.
const MINI_QUIZ_CHOICES = 4
// Nhóm hiển thị 10 câu/"phần" cho đỡ dài mắt (không tách phiên, vẫn 1 luồng liên tục).
const MINI_QUIZ_GROUP = 10

type QuizDirection = 'en2vi' | 'vi2en'

interface MiniQuizQ {
  entry: DictEntry // để hiện lại flashcard khi trả lời sai
  direction: QuizDirection
  prompt: string
  correct: string
  options: string[]
}

function buildMiniQuiz(batch: DictEntry[], pool: DictEntry[]): MiniQuizQ[] {
  const enPool = pool.map((w) => w.word)
  const viPool = pool.map((w) => w.vi)
  const shuffled = [...batch].sort(() => Math.random() - 0.5)
  const half = Math.ceil(shuffled.length / 2)
  const qs = shuffled.map((q, i): MiniQuizQ => {
    const direction: QuizDirection = i < half ? 'en2vi' : 'vi2en'
    if (direction === 'en2vi') {
      const wrongs = viPool
        .filter((m) => m !== q.vi)
        .sort(() => Math.random() - 0.5)
        .slice(0, MINI_QUIZ_CHOICES - 1)
      return {
        entry: q,
        direction,
        prompt: q.word,
        correct: q.vi,
        options: [q.vi, ...wrongs].sort(() => Math.random() - 0.5),
      }
    }
    const wrongs = enPool
      .filter((w) => w !== q.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, MINI_QUIZ_CHOICES - 1)
    return {
      entry: q,
      direction,
      prompt: q.vi,
      correct: q.word,
      options: [q.word, ...wrongs].sort(() => Math.random() - 0.5),
    }
  })
  // Trộn lại thứ tự câu hỏi để 2 chiều xen kẽ ngẫu nhiên, không dồn thành 2 khối.
  return qs.sort(() => Math.random() - 0.5)
}

type TodayPhase = 'learning' | 'batch-done' | 'mini-quiz' | 'daily-max'

// ── Màn "Xong batch": câu + hội thoại dựng TỪ CHÍNH 20 từ vừa học ─────────────
// "Câu thông dụng" lấy thẳng ví dụ của CHÍNH 20 từ trong batch (ex_en/ex_vi),
// kèm 1 HỘI THOẠI của vòng có nhiều từ nhất trong batch.
function BatchDoneView({
  batch,
  uid,
  isA,
  dailyStart,
  goal,
  dailyMax,
  onStartQuiz,
}: {
  batch: DictEntry[]
  uid: string
  isA: boolean
  dailyStart: number
  goal: number
  dailyMax: number
  onStartQuiz: () => void
}) {
  const learnedToday = getDailyLearned(uid) - dailyStart
  const totalToday = getDailyLearned(uid)
  const quizPasses = getDailyQuizPasses(uid)
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
              ? `Còn ${dailyMax - totalToday} từ có thể học hôm nay — kiểm tra để mở thêm.`
              : `${dailyMax - totalToday} more words available today — pass a quiz to unlock.`}
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

      {canLearnMore && quizPasses < DAILY_MAX_MULTIPLIER - 1 && (
        <button
          onClick={onStartQuiz}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition"
        >
          <ClipboardList className="w-4 h-4" />
          {isA
            ? `Kiểm tra để học thêm ${goal} từ (còn ${dailyMax - totalToday} từ hôm nay)`
            : `Quiz to unlock ${goal} more words (${dailyMax - totalToday} left today)`}
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
  // Tốc độ học đã chọn (5/10/20 từ/lượt) — đọc 1 lần lúc mở tab, đủ ổn định cho
  // cả phiên (đổi tốc độ ở Hồ sơ áp dụng từ lượt học TIẾP THEO, không đổi giữa chừng).
  const [goal] = useState(() => getDailyGoal(uid))
  const dailyMax = goal * DAILY_MAX_MULTIPLIER
  // Phase bắt đầu dựa trên trạng thái ngày hiện tại
  const [phase, setPhase] = useState<TodayPhase>(() => {
    const learned = getDailyLearned(uid)
    if (learned >= dailyMax) return 'daily-max'
    if (learned >= getDailyAllowance(uid)) return 'batch-done'
    return 'learning'
  })
  const [batch, setBatch] = useState<DictEntry[]>(() =>
    getTodayBatchFrom(pool, getLearnedWords(uid), goal),
  )
  const [idx, setIdx] = useState(0)
  const [dailyStart] = useState(() => getDailyLearned(uid))

  // Mini-quiz state
  const [quizQs, setQuizQs] = useState<MiniQuizQ[]>([])
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizSel, setQuizSel] = useState<string | null>(null)
  const [quizAns, setQuizAns] = useState<boolean[]>([])
  const [quizDone, setQuizDone] = useState(false)
  // Trả lời sai → hiện lại flashcard của từ đó trước khi cho qua câu tiếp theo.
  const [reviewCard, setReviewCard] = useState<DictEntry | null>(null)

  const progress = useMemo(() => getPathProgress(getLearnedWords(uid)), [uid])
  const card = batch[idx]
  const circle = card ? findCircleOfWord(card.word) : undefined

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
      if (totalToday >= dailyMax) setPhase('daily-max')
      else setPhase('batch-done')
    } else {
      setIdx(nextIdx)
    }
  }

  function skip() {
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
    setReviewCard(null)
    setPhase('mini-quiz')
  }

  function advanceQuiz() {
    if (quizIdx + 1 >= quizQs.length) {
      setQuizDone(true)
    } else {
      setQuizIdx((i) => i + 1)
      setQuizSel(null)
    }
  }

  function quizNext() {
    const q = quizQs[quizIdx]
    if (!q) return
    const ok = quizSel === q.correct
    setQuizAns((prev) => [...prev, ok])
    if (!ok) {
      setReviewCard(q.entry) // sai → hiện lại flashcard của từ này trước khi qua câu tiếp theo
      return
    }
    advanceQuiz()
  }

  function continueAfterReview() {
    setReviewCard(null)
    advanceQuiz()
  }

  function unlockNextBatch() {
    bumpDailyQuizPasses(uid)
    const newBatch = getTodayBatchFrom(pool, getLearnedWords(uid), goal)
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

  // ── Đã đạt trần từ/ngày ────────────────────────────────────────────────
  if (phase === 'daily-max') {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-2">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
        <p className="text-white font-semibold">
          {isA
            ? `Xuất sắc! Đã học đủ ${dailyMax} từ hôm nay 🎉`
            : `Amazing! ${dailyMax} words learned today 🎉`}
        </p>
        <p className="text-sm text-zinc-400">
          {isA ? 'Quay lại vào ngày mai để tiếp tục.' : 'Come back tomorrow to continue.'}
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
        goal={goal}
        dailyMax={dailyMax}
        onStartQuiz={startMiniQuiz}
      />
    )
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
            <p className="text-white font-semibold">
              {isA ? 'Xuất sắc! 100% đúng!' : 'Perfect! 100% correct!'}
            </p>
            <p className="text-sm text-zinc-400">
              {isA
                ? 'Bạn đã mở được 20 từ mới. Tiếp tục thôi!'
                : 'You unlocked 20 more words. Keep going!'}
            </p>
            <button
              onClick={unlockNextBatch}
              className="mt-2 w-full py-3 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold transition"
            >
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
            {isA
              ? `${score}/${quizQs.length} — Cần đúng 100% để mở batch mới`
              : `${score}/${quizQs.length} — Need 100% to unlock next batch`}
          </p>
          <p className="text-sm text-zinc-400">
            {isA ? 'Ôn lại rồi thử lại nhé!' : 'Review and try again!'}
          </p>
          <button
            onClick={startMiniQuiz}
            className="w-full py-3 rounded-2xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" /> {isA ? 'Làm lại kiểm tra' : 'Retry quiz'}
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

    // Trả lời sai → hiện lại flashcard của từ đó NGAY trước khi qua câu tiếp theo
    // (testing effect: sửa lỗi ngay lúc còn nhớ ngữ cảnh câu hỏi).
    if (reviewCard) {
      return (
        <div className="animate-fade-in space-y-4">
          <div className="glass rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-rose-300 font-medium">
              {isA
                ? 'Chưa đúng — xem lại từ này rồi tiếp tục nhé'
                : 'Not quite — review then continue'}
            </p>
          </div>
          <WordCard
            key={reviewCard.word}
            card={reviewCard}
            isA={isA}
            uid={uid}
            onUpdate={onProgress}
          />
          <button
            onClick={continueAfterReview}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition"
          >
            {isA ? 'Tiếp tục' : 'Continue'} <ChevronRight className="w-4 h-4" />
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
            {quizQs.length > MINI_QUIZ_GROUP &&
              ` · ${isA ? 'Phần' : 'Part'} ${Math.floor(quizIdx / MINI_QUIZ_GROUP) + 1}/${Math.ceil(quizQs.length / MINI_QUIZ_GROUP)}`}
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
            {q.direction === 'en2vi'
              ? isA
                ? 'Nghĩa tiếng Việt của từ này là?'
                : 'Vietnamese meaning?'
              : isA
                ? 'Từ tiếng Anh có nghĩa này là?'
                : 'English word for this meaning?'}
          </p>
          <p className="text-4xl font-bold text-white">{q.prompt}</p>
        </div>
        <div className="space-y-2.5">
          {q.options.map((opt) => {
            let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
            if (quizSel !== null) {
              if (opt === q.correct) cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300'
              else if (opt === quizSel) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
              else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
            }
            return (
              <button
                key={opt}
                onClick={() => {
                  if (quizSel === null) setQuizSel(opt)
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

  // ── Đang học ──────────────────────────────────────────────────────────
  if (!card) return null // idx luôn trong batch ở phase này; guard để TS narrow kiểu
  // Cấp CEFR của vòng đang học (null với vòng mở rộng) — hiện chip nhỏ cho biết
  // từ hôm nay thuộc cấp nào.
  const circleLevel = circle ? getCefrLevelOfCircle(circle.id) : null
  return (
    <div className="animate-fade-in">
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

      {/* Tiến độ trong lượt */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>
          {isA ? 'Từ' : 'Word'} {idx + 1}/{batch.length}
        </span>
        <span className="text-zinc-400">
          {isA ? 'Tổng đã thuộc' : 'Total learned'}: {progress.done}/{progress.total}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-accent-500 rounded-full transition-all"
          style={{ width: `${(idx / batch.length) * 100}%` }}
        />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onProgress} />

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
// Ôn SRS dùng TOÀN BỘ từ đã học (mọi cấp + Mở rộng) qua `pool` — trước đây lọc
// theo cấp đang xem khiến từ cấp khác đến hạn ôn không bao giờ hiện ra, rơi rụng
// dần mà người học không biết (V1, docs/research/cai-tien-lo-trinh-hoc.md). Có
// nút "Chỉ cấp này" (dùng `levelPool`) cho ai muốn tập trung 1 cấp.
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
  const effectivePool = onlyThisLevel ? levelPool : pool

  // Quay lại sau ≥3 ngày nghỉ → phiên "khởi động nhẹ" nhỏ hơn hẳn, không dội cả
  // backlog (V2). Tính 1 lần lúc mở tab là đủ, không cần theo dõi sống.
  const [gapDays] = useState(() => daysSinceLastStudy(uid))
  const isWelcomeBack = gapDays !== null && gapDays >= 3
  const cap = isWelcomeBack ? WELCOME_BACK_CAP : SESSION_CAP

  const startSession = () => getDueSession(uid, effectivePool, cap)
  const [session, setSession] = useState(startSession)
  const [due, setDue] = useState<DictEntry[]>(() => session.cards)
  const [sessionDone, setDone] = useState(0)
  const sessionSize = session.cards.length
  // Số thẻ đến hạn nhưng CHƯA vào phiên này vì vượt cap — mời ôn tiếp, không dội hết 1 lần.
  const backlogRemaining = Math.max(session.totalDue - sessionSize, 0)

  // Đổi bộ lọc "chỉ cấp này" → dựng lại phiên từ đầu.
  useEffect(() => {
    const s = startSession()
    setSession(s)
    setDue(s.cards)
    setDone(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyThisLevel])

  function startNewSession() {
    const s = startSession()
    setSession(s)
    setDue(s.cards)
    setDone(0)
  }

  const card = due[0]

  function rate(rating: Rating) {
    if (!card) return
    reviewWord(uid, card.word, rating)
    setDone((n) => n + 1)
    onUpdate()
    // 'again' → đẩy thẻ xuống cuối hàng đợi CỦA PHIÊN NÀY để ôn lại sớm, không kéo
    // thêm thẻ mới từ backlog (giữ đúng giới hạn cap của phiên).
    setDue((prev) => (rating === 'again' ? [...prev.slice(1), prev[0]!] : prev.slice(1)))
  }

  const stats = getSRSStats(uid)

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
        {backlogRemaining > 0 && (
          <div className="pt-1">
            <p className="text-sm text-zinc-400 mb-2">
              {isA
                ? `Còn ${backlogRemaining} thẻ khác đến hạn`
                : `${backlogRemaining} more cards due`}
            </p>
            <button
              onClick={startNewSession}
              className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-sm font-medium transition"
            >
              {isA ? 'Ôn tiếp phiên mới →' : 'Start another session →'}
            </button>
          </div>
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
          <button
            onClick={() => setOnlyThisLevel((v) => !v)}
            className="text-xs text-zinc-400 hover:text-zinc-300 underline underline-offset-2"
          >
            {onlyThisLevel
              ? isA
                ? 'Đang lọc: chỉ cấp này — bấm để ôn tất cả'
                : 'Filtering: this level only — tap for all levels'
              : isA
                ? 'Chỉ ôn từ cấp này'
                : 'Only review this level'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {isWelcomeBack && (
        <div className="mb-3 rounded-xl bg-accent-500/10 border border-accent-500/30 px-4 py-2.5 text-sm text-accent-300 theme-light:text-accent-800">
          {isA
            ? '👋 Chào mừng quay lại! Bắt đầu nhẹ nhàng với vài thẻ trước nhé.'
            : "👋 Welcome back! Let's warm up with a few cards first."}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>{isA ? 'Ôn SRS' : 'SRS Review'}</span>
        <span>
          {sessionSize - due.length + 1}/{sessionSize} {isA ? 'cần ôn' : 'due'}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mb-4">
        <div
          className="h-full bg-sky-500 rounded-full transition-all"
          style={{ width: `${((sessionSize - due.length) / Math.max(sessionSize, 1)) * 100}%` }}
        />
      </div>

      <WordCard key={card.word} card={card} isA={isA} uid={uid} onUpdate={onUpdate} />

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
    </div>
  )
}

// ── Tab Từ khó ────────────────────────────────────────────────────────────────
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
  const hardWords = useMemo(
    () => pool.filter((w) => hardSet.has(w.word.toLowerCase())),
    [pool, hardSet],
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
    if (selected === null) setSelected(opt)
  }

  function next() {
    if (!q) return
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
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
            if (opt === q.correct) cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300'
            else if (opt === selected) cls = 'bg-rose-500/20 border-rose-500/60 text-rose-300'
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
