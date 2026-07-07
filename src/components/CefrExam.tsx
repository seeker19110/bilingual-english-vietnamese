// ──────────────────────────────────────────────────────────────────────
// BÀI THI CUỐI CẤP — màn thi toàn màn hình (1 câu/màn)
//
// Dựng đề xáo trộn 4 phần (Từ vựng · Ngữ pháp · Nghe · Đọc hiểu) từ kho của
// cấp (lib/cefrExam.ts buildExam). Đạt ≥70% → "qua cấp" (lưu kết quả, mở khóa
// cấp sau ở computeLockedMap). Trượt → xem câu sai + mở lại bài ngữ pháp + thi lại
// (đề MỚI). Kết quả lưu Supabase qua saveExamAttempt.
//
// Điều kiện DỰ THI do trang cấp (CefrLevelPage) kiểm tra trước khi cho vào đây.
// ──────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  Volume2,
  GraduationCap,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  Brain,
  Headphones,
  MessageSquareText,
} from 'lucide-react'
import type { CefrLevel } from '../data/cefr'
import type { Dialogue } from '../data/dialogues'
import type { AccentClasses } from '../lib/cefrAccent'
import { getDialogues } from '../data/dialoguesLoader'
import { getLevelWords } from '../lib/curriculum'
import { getLearnedWords } from '../lib/vocab'
import { speak, stopSpeaking } from '../lib/tts'
import {
  buildExam,
  scoreExam,
  saveExamAttempt,
  EXAM_PASS_PCT,
  type ExamQuestion,
  type ExamPart,
  type GrammarExamSource,
} from '../lib/cefrExam'

// Nhãn + icon cho từng phần (hiện trên đầu mỗi câu để biết đang thi kỹ năng nào).
const PART_META: Record<ExamPart, { icon: typeof BookOpen; vi: string; en: string }> = {
  vocab: { icon: BookOpen, vi: 'Từ vựng', en: 'Vocabulary' },
  grammar: { icon: Brain, vi: 'Ngữ pháp', en: 'Grammar' },
  listening: { icon: Headphones, vi: 'Nghe', en: 'Listening' },
  reading: { icon: MessageSquareText, vi: 'Đọc hiểu', en: 'Reading' },
}

// Gom mọi câu quiz ngữ pháp của cấp (không lọc "đã học xong": điều kiện dự thi đã
// yêu cầu học đủ ngữ pháp; đề thi phủ toàn cấp).
function levelGrammarSources(level: CefrLevel): GrammarExamSource[] {
  const out: GrammarExamSource[] = []
  for (const u of level.units) {
    for (const g of u.grammar) {
      if (g.quiz) for (const item of g.quiz) out.push({ lessonId: g.id, item })
    }
  }
  return out
}

export default function CefrExam({
  uid,
  isA,
  level,
  accent,
  onClose,
  onOpenLesson,
}: {
  uid: string
  isA: boolean
  level: CefrLevel
  accent: AccentClasses
  onClose: () => void
  onOpenLesson: (lessonId: string) => void
}) {
  // Nạp hội thoại của tất cả unit trong cấp (cho phần Đọc) — async.
  const [dialogues, setDialogues] = useState<Dialogue[] | null>(null)
  useEffect(() => {
    let alive = true
    Promise.all(level.units.map((u) => getDialogues(u.id))).then((lists) => {
      if (alive) setDialogues(lists.flat())
    })
    return () => {
      alive = false
    }
  }, [level])

  const grammarSources = useMemo(() => levelGrammarSources(level), [level])

  // Bộ đếm để dựng lại đề MỚI mỗi lần "Thi lại".
  const [attempt, setAttempt] = useState(0)
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null)

  // Dựng đề khi có đủ dữ liệu (hoặc khi bấm thi lại).
  useEffect(() => {
    if (dialogues == null) return
    const qs = buildExam({
      isA,
      words: getLevelWords(level.id),
      learned: getLearnedWords(uid),
      grammar: grammarSources,
      dialogues,
    })
    setQuestions(qs)
    setCurrent(0)
    setSelected(null)
    setAnswers([])
    setDone(false)
    setSavedPct(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogues, attempt])

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [savedPct, setSavedPct] = useState<number | null>(null)

  const q = questions?.[current]

  // Tự phát audio khi vào 1 câu NGHE (và dừng audio khi rời câu/màn).
  useEffect(() => {
    if (!done && q?.promptKind === 'audio' && q.audioText && q.audioLang) {
      void speak(q.audioText, q.audioLang)
    }
    return () => stopSpeaking()
  }, [q, done])

  if (questions == null) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-zinc-400 text-sm">{isA ? 'Đang chuẩn bị đề thi…' : 'Preparing exam…'}</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center animate-fade-in space-y-3">
        <p className="text-zinc-400 text-sm">
          {isA
            ? 'Chưa đủ dữ liệu để tạo đề thi cho cấp này.'
            : 'Not enough data to build an exam for this level yet.'}
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> {isA ? 'Quay lại' : 'Back'}
        </button>
      </div>
    )
  }

  function pick(opt: string) {
    if (selected === null) setSelected(opt)
  }

  function next() {
    if (!q || !questions) return
    const ok = selected === q.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)
    if (current + 1 >= questions.length) {
      // Chấm điểm + lưu kết quả (giữ điểm cao nhất, đồng bộ Supabase).
      const correct = newAnswers.filter(Boolean).length
      const s = scoreExam(correct, questions.length)
      saveExamAttempt(uid, level.id, s.pct)
      setSavedPct(s.pct)
      setDone(true)
      stopSpeaking()
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  function retry() {
    stopSpeaking()
    setAttempt((a) => a + 1) // → useEffect dựng đề MỚI
  }

  // ── Màn kết quả ─────────────────────────────────────────────────────
  if (done) {
    const correct = answers.filter(Boolean).length
    const s = scoreExam(correct, questions.length)
    const passThreshold = Math.round(EXAM_PASS_PCT * 100)
    const wrong = questions.filter((_, i) => !answers[i])
    return (
      <div className="animate-fade-in space-y-4">
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <p className="text-5xl">{s.passed ? '🎓' : '📚'}</p>
          <p className="text-2xl font-bold text-white">
            {s.correct}/{s.total} · {s.pct}%
          </p>
          {s.passed ? (
            <>
              <p className={`font-semibold ${accent.text}`}>
                {isA ? `Chúc mừng! Bạn đã QUA cấp ${level.id} 🎉` : `You PASSED ${level.id}! 🎉`}
              </p>
              <p className="text-sm text-zinc-400">
                {isA
                  ? 'Cấp tiếp theo đã được mở khóa. Tiếp tục hành trình nhé!'
                  : 'The next level is now unlocked. Keep going!'}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              {isA
                ? `Cần đạt ≥${passThreshold}% để qua cấp. Xem lại câu sai rồi thi lại (đề mới) nhé!`
                : `Need ≥${passThreshold}% to pass. Review the misses and retry (new exam)!`}
            </p>
          )}
          {savedPct != null && (
            <p className="text-xs text-zinc-500">
              {isA ? `Điểm cao nhất đã lưu: ${savedPct}%` : `Best score saved: ${savedPct}%`}
            </p>
          )}
        </div>

        {/* Danh sách câu sai (+ mở lại bài với câu ngữ pháp) */}
        {wrong.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-zinc-400 px-1">
              {isA ? `Câu cần xem lại (${wrong.length})` : `To review (${wrong.length})`}
            </p>
            {wrong.map((qq) => (
              <div
                key={qq.key}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm bg-rose-500/10 text-rose-300"
              >
                <span className="text-[11px] font-semibold uppercase shrink-0 opacity-80">
                  {isA ? PART_META[qq.part].vi : PART_META[qq.part].en}
                </span>
                <span className="font-medium truncate">
                  {qq.promptKind === 'audio' ? `🔊 ${qq.audioText}` : qq.prompt}
                </span>
                <span className="text-zinc-400 flex-1 truncate">= {qq.correct}</span>
                {qq.part === 'grammar' && qq.lessonId && (
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
        )}

        <div className="flex gap-3">
          {!s.passed && (
            <button
              onClick={retry}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" /> {isA ? 'Thi lại (đề mới)' : 'Retry (new exam)'}
            </button>
          )}
          <button
            onClick={onClose}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition ${s.passed ? 'bg-accent-500 hover:bg-accent-400 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
          >
            {isA ? 'Xong' : 'Done'}
          </button>
        </div>
      </div>
    )
  }

  // ── Màn 1 câu ───────────────────────────────────────────────────────
  if (!q) return null
  const meta = PART_META[q.part]
  const MetaIcon = meta.icon

  return (
    <div className="animate-fade-in space-y-4">
      {/* Đầu bài: nút thoát + tiến độ */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {isA ? 'Thoát' : 'Exit'}
        </button>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <GraduationCap className={`w-4 h-4 ${accent.text}`} />
          {isA ? `Thi cuối cấp ${level.id}` : `${level.id} exam`}
        </span>
        <span className="text-xs text-zinc-400">
          {current + 1}/{questions.length}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${accent.bar} transition-all`}
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>

      {/* Nhãn phần */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        <MetaIcon className={`w-3.5 h-3.5 ${accent.text}`} />
        {isA ? meta.vi : meta.en}
      </div>

      {/* Phần ĐỌC: hiện hội thoại (ngôn ngữ đích) */}
      {q.part === 'reading' && q.passage && (
        <div className="glass rounded-xl p-3 max-h-56 overflow-y-auto space-y-1.5">
          <p className="text-xs text-zinc-400 mb-1">
            {isA ? q.passage.titleVi : q.passage.titleEn}
          </p>
          {q.passage.lines.map((ln, i) => (
            <p
              key={i}
              className={`text-sm leading-snug ${ln.text === q.prompt ? `font-semibold ${accent.text}` : 'text-zinc-300'}`}
            >
              <span className="text-zinc-500">{ln.who}: </span>
              {ln.text}
            </p>
          ))}
        </div>
      )}

      {/* Câu hỏi */}
      <div className="text-center py-2">
        {q.promptKind === 'audio' ? (
          <button
            onClick={() => q.audioText && q.audioLang && void speak(q.audioText, q.audioLang)}
            className={`inline-flex items-center gap-2 px-5 py-4 rounded-2xl ${accent.soft} border ${accent.ring} ${accent.text} font-semibold transition hover:opacity-90`}
          >
            <Volume2 className="w-6 h-6" />
            {isA ? 'Nghe lại' : 'Play again'}
          </button>
        ) : q.part === 'grammar' || q.part === 'reading' ? (
          <p className="text-xl font-semibold text-white leading-snug px-2">{q.prompt}</p>
        ) : (
          <p className="text-4xl font-bold text-white">{q.prompt}</p>
        )}
        {q.part === 'reading' && (
          <p className="text-xs text-zinc-400 mt-2">
            {isA ? 'Câu trên có nghĩa là gì?' : 'What does the line above mean?'}
          </p>
        )}
        {q.promptKind === 'audio' && (
          <p className="text-xs text-zinc-400 mt-2">
            {isA ? 'Nghe rồi chọn đáp án đúng' : 'Listen, then choose the answer'}
          </p>
        )}
      </div>

      {/* Đáp án */}
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
              ? 'Nộp bài'
              : 'Submit'
            : isA
              ? 'Câu tiếp theo'
              : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
