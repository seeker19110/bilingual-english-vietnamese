// ProgrammingLessonPage — BÀI HỌC 8 BƯỚC môn Lập trình (PR-L3).
// Khuôn sư phạm (đặc tả §3): ①móc thực tế + ②khái niệm → ③ví dụ mẫu chạy được → ④Predict
// → ⑤Parsons (xếp dòng) → ⑥Tự viết chấm test-case → ⑦ứng dụng về nhà. (⑧ thẻ SRS: PR sau.)
// Code chạy bằng sandbox Pyodide tự host (lib/pythonRunner) — chấm bằng engine thuần
// (@dhcb/subject-programming/grading), tiến độ lưu server (lib/programmingProgress).
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import {
  BookOpen,
  Play,
  Loader2,
  Lightbulb,
  Eye,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Home,
  ListChecks,
  Puzzle,
  PencilLine,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import LangBadge from '../../../components/programming/LangBadge'
import CodeSurface from '../../../components/programming/CodeSurface'
import StepBar, { type LessonStep } from '../../../components/programming/StepBar'
import LivePreview from '../../../components/programming/LivePreview'
import PredictStep from '../../../components/programming/PredictStep'
import ParsonsStep from '../../../components/programming/ParsonsStep'
import TestResultList from '../../../components/programming/TestResultList'
import AiHelpPanel from '../../../components/programming/AiHelpPanel'
import CodeEditor from '../../../components/CodeEditor'
import { useAuth } from '../../../context/useAuth'
import { runLessonCode, resetLessonRunners } from '../../../lib/codeRunner'
import { saveLessonProgress } from '../../../lib/programmingProgress'
import { addLessonCardsToSrs } from '../../../lib/programmingSrs'
import { getLesson } from '@dhcb/subject-programming/lessons'
import { getLevelIdOfLesson } from '@dhcb/subject-programming/curriculum'
import {
  gradeTestCase,
  allTestsPassed,
  checkParsonsOrder,
  parsonsShuffle,
  type TestCaseResult,
} from '@dhcb/subject-programming/grading'

// 6 màn hình phủ 8 bước sư phạm (①② gộp một màn; ⑧ SRS chạy ngầm khi đạt bài Make).
// `graded` = bước có chấm (pha TRẢ) · `startsPhase` = vẽ vạch ngăn phía trước (luật N3).
const STEPS: readonly LessonStep[] = [
  { key: 'concept', label: 'Khái niệm', icon: BookOpen },
  { key: 'example', label: 'Ví dụ mẫu', icon: Play },
  { key: 'predict', label: 'Dự đoán', icon: ListChecks, graded: true, startsPhase: 'luyện tập' },
  { key: 'parsons', label: 'Xếp code', icon: Puzzle, graded: true },
  { key: 'make', label: 'Tự viết', icon: PencilLine, graded: true },
  { key: 'done', label: 'Về nhà', icon: Home, startsPhase: 'hoàn tất' },
] as const

export default function ProgrammingLessonPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = lessonId ? getLesson(lessonId) : undefined

  const [step, setStep] = useState(0)
  // ③ Ví dụ mẫu
  const [exampleOutput, setExampleOutput] = useState('')
  const [exampleRunning, setExampleRunning] = useState(false)
  // ④ Predict
  const [predictChoice, setPredictChoice] = useState<number | null>(null)
  const [predictRevealed, setPredictRevealed] = useState(false)
  // ⑤ Parsons
  const shuffledLines = useMemo(
    () => (lesson ? parsonsShuffle(lesson.parsons.lines, lesson.id) : []),
    [lesson],
  )
  const [arranged, setArranged] = useState<string[]>([])
  const [parsonsResult, setParsonsResult] = useState<'correct' | 'wrong' | null>(null)
  // ⑥ Make
  const [code, setCode] = useState(lesson?.make.starterCode ?? '')
  const [grading, setGrading] = useState(false)
  const [results, setResults] = useState<TestCaseResult[] | null>(null)
  const [hintsShown, setHintsShown] = useState(0)
  const [sampleViewed, setSampleViewed] = useState(false)
  const passed = results !== null && allTestsPassed(results)

  // Ghi "đang học" khi vào bài; rời trang huỷ mọi worker chạy code (Python/JavaScript).
  useEffect(() => {
    if (user && lesson) void saveLessonProgress(user.id, lesson.id, 'in_progress')
    return () => resetLessonRunners()
  }, [user, lesson])

  if (!lesson) return <Navigate to="/lap-trinh" replace />

  const runExample = async () => {
    setExampleRunning(true)
    const r = await runLessonCode(lesson.language, lesson.workedExample.code, {
      stdinLines: lesson.workedExample.stdinLines,
      onOutput: setExampleOutput,
      ...(lesson.domHtml ? { domHtml: lesson.domHtml } : {}),
    })
    setExampleOutput(r.output + (r.error ? `\n${r.error}` : ''))
    setExampleRunning(false)
  }

  const gradeMake = async () => {
    if (grading) return
    setGrading(true)
    setResults(null)
    const out: TestCaseResult[] = []
    for (const testCase of lesson.make.testCases) {
      const r = await runLessonCode(lesson.language, code, {
        stdinLines: testCase.stdinLines,
        ...(lesson.domHtml ? { domHtml: lesson.domHtml } : {}),
      })
      out.push(
        gradeTestCase(testCase, r.output, r.error ?? (r.timedOut ? 'Quá thời gian' : undefined)),
      )
      setResults([...out])
    }
    setGrading(false)
    if (allTestsPassed(out) && user) {
      void saveLessonProgress(user.id, lesson.id, 'completed')
      // ⑧ Thẻ SRS vào vòng ôn NGAY khi đạt bài (PR-L10): đó là lúc học viên vừa hiểu, nên
      // lịch ôn đầu tiên tính từ đây mới đúng. Gọi nhiều lần cũng vô hại — addToSRS bỏ qua
      // thẻ đã có trong kho, không đặt lại lịch của thẻ đang ôn dở.
      addLessonCardsToSrs(user.id, lesson.id)
    }
  }

  const stepDone = (i: number): boolean => {
    if (i === 2) return predictRevealed
    if (i === 3) return parsonsResult === 'correct'
    if (i === 4) return passed
    return true
  }

  const current = STEPS[step]!
  const levelId = getLevelIdOfLesson(lesson.id)
  const backTo = levelId ? `/lap-trinh/${levelId}` : '/lap-trinh'

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* Quay lại ĐÚNG bậc của bài đang học (PR-UX1). Trước đây ghi cứng '/lap-trinh/p1' nên
          học xong bài P5 bấm quay lại là rơi về bậc P1. Mã bài lạ → lùi về trang môn. */}
      <Layout onBack={() => nav(backTo)} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <PageHeader title={lesson.title} subtitle={`Bài học unit ${lesson.unitId.toUpperCase()}`} />

        {/* Ngôn ngữ của bài + lối về đúng bậc (PR-UX1). */}
        <div className="flex items-center gap-2 flex-wrap -mt-3">
          <LangBadge language={lesson.language} />
          {levelId && (
            <button
              onClick={() => nav(backTo)}
              className="tap-44 text-[11px] font-semibold text-zinc-400 hover:text-white underline underline-offset-2 transition"
            >
              Bậc {levelId.toUpperCase()}
            </button>
          )}
        </div>

        <StepBar steps={STEPS} current={step} isDone={stepDone} onGo={setStep} />

        {/* ①② Móc thực tế + khái niệm */}
        {current.key === 'concept' && (
          <section className="space-y-4">
            <div className="bg-accent-500/10 border border-accent-500/30 rounded-3xl p-5">
              <p className="text-sm text-zinc-100 leading-relaxed">{lesson.hook}</p>
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5">
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {lesson.theory}
              </p>
            </div>
          </section>
        )}

        {/* ③ Ví dụ mẫu chạy được */}
        {current.key === 'example' && (
          <section className="space-y-3">
            <p className="text-sm text-zinc-300">
              Đọc từng dòng (chú thích tiếng Việt trong code) rồi bấm chạy để thấy kết quả thật:
            </p>
            <CodeSurface code={lesson.workedExample.code} />
            <button
              onClick={() => void runExample()}
              disabled={exampleRunning}
              className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
            >
              {exampleRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{lesson.language === 'git' ? 'Chạy thử các lệnh' : 'Chạy ví dụ'}</span>
            </button>
            {exampleOutput && <CodeSurface code={exampleOutput} wrap />}
          </section>
        )}

        {/* ④ Predict — dự đoán TRƯỚC khi chạy */}
        {current.key === 'predict' && (
          <PredictStep
            predict={lesson.predict}
            choice={predictChoice}
            revealed={predictRevealed}
            onChoose={(i) => {
              setPredictChoice(i)
              setPredictRevealed(true)
            }}
          />
        )}

        {/* ⑤ Parsons — bấm dòng để xếp thứ tự */}
        {current.key === 'parsons' && (
          <ParsonsStep
            prompt={lesson.parsons.prompt}
            shuffledLines={shuffledLines}
            arranged={arranged}
            result={parsonsResult}
            onArrangedChange={(lines) => {
              setArranged(lines)
              setParsonsResult(null)
            }}
            onCheck={() =>
              setParsonsResult(
                checkParsonsOrder(arranged, lesson.parsons.lines) ? 'correct' : 'wrong',
              )
            }
          />
        )}

        {/* ⑥ Make — tự viết, chấm test-case */}
        {current.key === 'make' && (
          <section className="space-y-3">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5">
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {lesson.make.prompt}
              </p>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              // Bài Git/dòng lệnh: học viên gõ LỆNH chứ không phải code — nhãn phải nói đúng
              // thứ đang làm, nhất là với người dùng trình đọc màn hình.
              ariaLabel={
                lesson.language === 'git' ? 'Ô gõ lệnh bài tự viết' : 'Ô soạn code bài tự viết'
              }
            />
            <LivePreview language={lesson.language} domHtml={lesson.domHtml} code={code} />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => void gradeMake()}
                disabled={grading || !code.trim()}
                className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
              >
                {grading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{grading ? 'Đang chấm…' : 'Chấm bài'}</span>
              </button>
              {hintsShown < lesson.make.hints.length && (
                <button
                  onClick={() => setHintsShown(hintsShown + 1)}
                  className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-200 font-semibold text-sm transition"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>
                    Gợi ý ({hintsShown}/{lesson.make.hints.length})
                  </span>
                </button>
              )}
              {!sampleViewed && (
                <button
                  onClick={() => {
                    // "Phao": xem code mẫu — không phạt, chỉ ghi nhận để Companion kèm sát hơn.
                    setSampleViewed(true)
                    setCode(lesson.make.sampleSolution)
                  }}
                  className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-semibold text-sm transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem code mẫu</span>
                </button>
              )}
            </div>
            {hintsShown > 0 && (
              <ul className="space-y-2">
                {lesson.make.hints.slice(0, hintsShown).map((hint, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-zinc-100"
                  >
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* ⑥b AI đồng hành — gợi ý soạn sẵn ở trên vẫn là đường CHÍNH (0đ, tức thì);
                AI chỉ dùng khi bí thật, và mỗi lượt hỏi tiêu 1 lượt AI trong ngày. */}
            <AiHelpPanel lessonId={lesson.id} code={code} results={results} passed={passed} />
            {results && <TestResultList results={results} />}
            {passed && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-zinc-100 flex items-start gap-2">
                <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
                <p>
                  <strong>Đạt toàn bộ test!</strong> Bài được ghi nhận hoàn thành
                  {sampleViewed ? ' (bạn có xem code mẫu — thử tự viết lại lần nữa nhé)' : ''}. Sang
                  bước "Về nhà" để chốt bài.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ⑦ Ứng dụng về nhà */}
        {current.key === 'done' && (
          <section className="space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5">
              <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-accent-400" />
                <span>Ứng dụng vào đời thật</span>
              </h2>
              <p className="text-sm text-zinc-200 leading-relaxed">{lesson.homework}</p>
            </div>
            <div
              className={`rounded-3xl border p-5 text-sm ${
                passed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-zinc-100'
                  : 'border-zinc-800 bg-zinc-900/80 text-zinc-300'
              }`}
            >
              {passed
                ? 'Bài học đã hoàn thành — tiến độ đã được lưu. 🎉'
                : 'Bạn chưa đạt hết test ở bước "Tự viết" — quay lại chấm bài để hoàn thành bài học.'}
            </div>
            <button
              onClick={() => nav(backTo)}
              className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
            >
              <span>{levelId ? `Về trang bậc ${levelId.toUpperCase()}` : 'Về trang môn'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Điều hướng trước / sau */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="tap-44 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 disabled:opacity-40 text-zinc-200 font-semibold text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Bước trước</span>
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep(step + 1)}
              className={`tap-44 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-semibold text-sm transition ${
                stepDone(step)
                  ? 'bg-accent-500 hover:bg-accent-400 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}
            >
              <span>Bước tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
