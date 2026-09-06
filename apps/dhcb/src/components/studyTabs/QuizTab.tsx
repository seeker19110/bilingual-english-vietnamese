// apps/dhcb/src/components/studyTabs/QuizTab.tsx — tách từ components/StudyTabs.tsx (2.071 dòng) ngày 2026-09-06, mã GIỮ NGUYÊN.
// Barrel `components/StudyTabs.tsx` re-export nên nơi dùng không đổi đường import.

import { useState, useEffect } from 'react'
import { RotateCcw, ChevronRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuizKeyboard } from '@dhcb/core-ui/useQuizKeyboard'
import { loadQuizSession, saveQuizSession, clearQuizSession } from '../../lib/quizSession'
import QuizOptionKey from '../QuizOptionKey'
import type { DictEntry } from '../../types'
import { haptics, vibrate } from '../../lib/haptics'
import { sound } from '../../lib/sound'
import ShareResultCard from '../ShareResultCard'
import { buildQuizShareContent } from '../../lib/shareContent'
import { reviewGrammar } from '../../lib/srs'
import {
  getDailyLearned,
  bumpDailyQuizPasses,
  getDailySpeed,
  getDailyMax,
  isQuizPass,
  QUIZ_PASS_THRESHOLD_PCT,
} from '../../lib/curriculum'
import { GrammarQuizSource, QuizQuestion, buildQuiz } from './quizBuilders'

// ── Tab Kiểm tra ──────────────────────────────────────────────────────────────
export function QuizTab({
  uid,
  isA,
  pool,
  grammarPool,
  onOpenLesson,
  sessionScope,
}: {
  uid: string
  isA: boolean
  pool: DictEntry[]
  grammarPool: GrammarQuizSource[]
  onOpenLesson: (lessonId: string) => void
  /** Mã cấp học — tách phiên làm dở theo từng cấp (xem lib/quizSession.ts). */
  sessionScope: string
}) {
  const nav = useNavigate()
  // Khôi phục bài đang làm dở nếu có (đổi tab rồi quay lại thì học tiếp đúng chỗ, không phải
  // làm lại từ câu 1 — lý do đầy đủ ở đầu lib/quizSession.ts). Đọc MỘT LẦN lúc dựng, gom vào
  // các initializer để bốn state dưới đây luôn nhất quán với nhau.
  const [restored] = useState(() => loadQuizSession(uid, sessionScope))
  const [questions] = useState<QuizQuestion[]>(
    () => (restored?.questions as QuizQuestion[] | undefined) ?? buildQuiz(uid, pool, grammarPool),
  )
  const [current, setCurrent] = useState(restored?.current ?? 0)
  const [selected, setSelected] = useState<string | null>(restored?.selected ?? null)
  const [answers, setAnswers] = useState<boolean[]>(restored?.answers ?? [])
  const [done, setDone] = useState(false)

  // Ghi lại phiên sau mỗi thay đổi. Làm xong cả bài thì XOÁ: giữ lại sẽ khiến lần vào sau bị
  // ném thẳng vào màn kết quả cũ thay vì được làm một bài mới.
  useEffect(() => {
    if (done || questions.length === 0) {
      clearQuizSession(uid, sessionScope)
      return
    }
    saveQuizSession(uid, sessionScope, { questions, current, selected, answers })
  }, [uid, sessionScope, questions, current, selected, answers, done])

  // Bàn phím: 1..n chọn đáp án, Enter/Space sang câu tiếp. Đặt TRƯỚC các nhánh return sớm bên
  // dưới vì hook phải chạy ở mọi lượt render (luật hooks). `pick`/`next` là khai báo hàm nên
  // được hoist — gọi trong callback ở đây vẫn trỏ đúng hàm định nghĩa phía dưới.
  useQuizKeyboard({
    optionCount: questions[current]?.options.length ?? 0,
    onPick: (i) => {
      const opt = questions[current]?.options[i]
      if (opt !== undefined) pick(opt)
    },
    onNext: () => next(),
    answered: selected !== null,
    enabled: !done && questions.length > 0,
  })

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
      if (opt === q?.correct) {
        haptics.success()
        sound.correct()
      } else {
        vibrate(60)
        sound.wrong()
      }
    }
  }

  function next() {
    if (!q) return
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (q.kind === 'grammar' && q.lessonId) {
      reviewGrammar(uid, q.lessonId, ok ? 'good' : 'again') // đề xuất E — cập nhật lịch ôn
    }
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
    clearQuizSession(uid, sessionScope)
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
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${answers[i] ? 'bg-accent-500/10 text-accent-300' : 'bg-rose-500/10 text-rose-300 theme-light:text-rose-900'}`}
            >
              <span>{answers[i] ? '✓' : '✗'}</span>
              <span className="font-medium truncate">{qq.prompt}</span>
              <span className="text-zinc-400 flex-1 truncate">= {qq.correct}</span>
              {!answers[i] && qq.kind === 'grammar' && qq.lessonId && (
                <button
                  onClick={() => onOpenLesson(qq.lessonId!)}
                  className="text-xs text-violet-300 theme-light:text-violet-800 hover:text-violet-200 underline underline-offset-2 shrink-0"
                >
                  {isA ? 'Mở lại bài' : 'Review'}
                </button>
              )}
            </div>
          ))}
        </div>
        <ShareResultCard {...buildQuizShareContent(score, questions.length, isA)} isA={isA} />
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
        {q.options.map((opt, optIdx) => {
          let cls = 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600'
          if (selected !== null) {
            // Đúng → phồng nhẹ; đáp án sai đã chọn → lắc ngang (đồng bộ mini-quiz)
            if (opt === q.correct)
              cls = 'bg-accent-500/20 border-accent-500/60 text-accent-300 animate-pop-correct'
            else if (opt === selected)
              cls =
                'bg-rose-500/20 border-rose-500/60 text-rose-300 theme-light:text-rose-900 animate-shake'
            else cls = 'bg-zinc-900/40 border-zinc-800/40 text-zinc-400'
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl border font-medium text-[15px] transition-all ${cls}`}
            >
              <QuizOptionKey index={optIdx} />
              <span className="min-w-0 flex-1">{opt}</span>
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
