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
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Home,
  ListChecks,
  Puzzle,
  PencilLine,
  Sparkles,
  MessageCircleQuestion,
  AlertCircle,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import CodeEditor from '../../../components/CodeEditor'
import { useAuth } from '../../../context/useAuth'
import { runLessonCode, resetLessonRunners } from '../../../lib/codeRunner'
import { HtmlPreview } from '../../../components/HtmlPreview'
import { saveLessonProgress } from '../../../lib/programmingProgress'
import { addLessonCardsToSrs } from '../../../lib/programmingSrs'
import { MAX_HINT_LEVEL } from '@dhcb/subject-programming/feedbackPrompt'
import {
  requestCodeFeedback,
  failedCaseLabels,
  type CodeFeedbackKind,
} from '../../../lib/programmingFeedback'
import { getLesson } from '@dhcb/subject-programming/lessons'
// fetchGia chứ KHÔNG phải fetchPrelude: prelude kéo theo linkedom (~94KB gzip) — thư viện đó
// chỉ được nằm trong worker, lọt vào đây là nổ ngân sách Initial JS.
import { FETCH_SHIM_JS } from '@dhcb/subject-programming/fetchGia'
import {
  gradeTestCase,
  allTestsPassed,
  checkParsonsOrder,
  parsonsShuffle,
  type TestCaseResult,
} from '@dhcb/subject-programming/grading'

// 6 màn hình phủ 8 bước sư phạm (①② gộp một màn; ⑧ SRS vào PR sau).
const STEPS = [
  { key: 'concept', label: 'Khái niệm', icon: BookOpen },
  { key: 'example', label: 'Ví dụ mẫu', icon: Play },
  { key: 'predict', label: 'Dự đoán', icon: ListChecks },
  { key: 'parsons', label: 'Xếp code', icon: Puzzle },
  { key: 'make', label: 'Tự viết', icon: PencilLine },
  { key: 'done', label: 'Về nhà', icon: Home },
] as const

export default function ProgrammingLessonPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = lessonId ? getLesson(lessonId) : undefined

  const [step, setStep] = useState(0)
  // ③ Ví dụ mẫu
  const [exampleOutput, setExampleOutput] = useState('')
  // Bài DOM: bản chụp code để xem trang chạy (null = chưa bấm xem lần nào).
  const [previewScript, setPreviewScript] = useState<string | null>(null)
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
  // ⑥b AI phản hồi code (PR-L5) — TIÊU LƯỢT nên chỉ chạy khi học viên tự bấm, không tự động.
  // `aiLevel` = bậc gợi ý Socratic đã dùng: mở dần 1→MAX_HINT_LEVEL, không nhảy cóc.
  const [aiLevel, setAiLevel] = useState(0)
  const [aiBusy, setAiBusy] = useState<CodeFeedbackKind | null>(null)
  const [aiText, setAiText] = useState('')
  const [aiError, setAiError] = useState('')
  // Lỗi runtime đầu tiên trong lần chấm gần nhất — có thì mới mời "giải thích lỗi".
  const firstError = results?.find((r) => r.error)?.error ?? ''

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

  const askAi = async (kind: CodeFeedbackKind) => {
    if (aiBusy || !lesson) return
    const nextLevel = kind === 'socratic_hint' ? Math.min(aiLevel + 1, MAX_HINT_LEVEL) : undefined
    setAiBusy(kind)
    setAiError('')
    setAiText('')
    const r = await requestCodeFeedback({
      kind,
      lessonId: lesson.id,
      code,
      ...(nextLevel ? { hintLevel: nextLevel } : {}),
      ...(kind === 'explain_error' && firstError ? { errorText: firstError } : {}),
      ...(kind === 'socratic_hint' ? { failedCaseLabels: failedCaseLabels(results) } : {}),
    })
    setAiBusy(null)
    if (r.ok) {
      setAiText(r.text)
      // Lên bậc theo bậc SERVER đã dùng (server là nơi kẹp dải), không theo phỏng đoán client.
      if (kind === 'socratic_hint') setAiLevel(r.hintLevel ?? nextLevel ?? aiLevel + 1)
    } else {
      setAiError(r.message)
    }
  }

  const stepDone = (i: number): boolean => {
    if (i === 2) return predictRevealed
    if (i === 3) return parsonsResult === 'correct'
    if (i === 4) return passed
    return true
  }

  const current = STEPS[step]!

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh/p1')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <PageHeader title={lesson.title} subtitle={`Bài học unit ${lesson.unitId.toUpperCase()}`} />

        {/* Thanh bước */}
        <nav aria-label="Các bước bài học" className="flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              aria-current={i === step ? 'step' : undefined}
              className={`tap-44 shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                i === step
                  ? 'bg-accent-500 text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

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
            <pre className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-4 text-sm font-mono text-zinc-100 overflow-x-auto whitespace-pre">
              {lesson.workedExample.code}
            </pre>
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
            {exampleOutput && (
              <pre className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-mono text-zinc-100 whitespace-pre-wrap">
                {exampleOutput}
              </pre>
            )}
          </section>
        )}

        {/* ④ Predict — dự đoán TRƯỚC khi chạy */}
        {current.key === 'predict' && (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-white">{lesson.predict.question}</p>
            <pre className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-4 text-sm font-mono text-zinc-100 overflow-x-auto whitespace-pre">
              {lesson.predict.code}
            </pre>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lesson.predict.choices.map((choice, i) => {
                const isAnswer = i === lesson.predict.answerIndex
                const showState = predictRevealed && (isAnswer || i === predictChoice)
                return (
                  <button
                    key={choice}
                    disabled={predictRevealed}
                    onClick={() => {
                      setPredictChoice(i)
                      setPredictRevealed(true)
                    }}
                    className={`tap-44 text-left px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                      showState
                        ? isAnswer
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 theme-light:text-emerald-800'
                          : 'bg-rose-500/15 border-rose-500/50 text-rose-300 theme-light:text-rose-700'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-600'
                    }`}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
            {predictRevealed && (
              <div
                className={`rounded-2xl border p-4 text-sm leading-relaxed ${
                  predictChoice === lesson.predict.answerIndex
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-100'
                    : 'bg-amber-500/10 border-amber-500/30 text-zinc-100'
                }`}
              >
                <p className="font-semibold mb-1">
                  {predictChoice === lesson.predict.answerIndex
                    ? 'Chính xác! 🎉'
                    : 'Chưa đúng — không sao, đoán sai là lúc học được nhiều nhất.'}
                </p>
                <p>{lesson.predict.explain}</p>
              </div>
            )}
          </section>
        )}

        {/* ⑤ Parsons — bấm dòng để xếp thứ tự */}
        {current.key === 'parsons' && (
          <section className="space-y-3">
            <p className="text-sm text-zinc-300">{lesson.parsons.prompt}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase">
                Bài của bạn (bấm dòng để trả lại kho)
              </p>
              <div className="min-h-[64px] rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 p-2 space-y-1">
                {arranged.map((line, i) => (
                  <button
                    key={`${line}-${i}`}
                    onClick={() => {
                      setArranged(arranged.filter((_, idx) => idx !== i))
                      setParsonsResult(null)
                    }}
                    className="tap-44 w-full text-left px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm text-zinc-100 whitespace-pre hover:border-rose-500/50"
                  >
                    {line}
                  </button>
                ))}
                {arranged.length === 0 && (
                  <p className="text-xs text-zinc-500 p-2">
                    Bấm các dòng ở kho bên dưới theo đúng thứ tự…
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-zinc-400 uppercase">
                Kho dòng code (đã xáo trộn)
              </p>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-2 space-y-1">
                {shuffledLines
                  .filter((line) => {
                    const used = arranged.filter((a) => a === line).length
                    const total = shuffledLines.filter((s) => s === line).length
                    return used < total
                  })
                  .map((line, i) => (
                    <button
                      key={`${line}-${i}`}
                      onClick={() => {
                        setArranged([...arranged, line])
                        setParsonsResult(null)
                      }}
                      className="tap-44 w-full text-left px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-200 whitespace-pre hover:border-accent-500/60"
                    >
                      {line}
                    </button>
                  ))}
              </div>
            </div>
            <button
              onClick={() =>
                setParsonsResult(
                  checkParsonsOrder(arranged, lesson.parsons.lines) ? 'correct' : 'wrong',
                )
              }
              disabled={arranged.length === 0}
              className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kiểm tra thứ tự</span>
            </button>
            {parsonsResult === 'correct' && (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-zinc-100">
                Đúng thứ tự! Chương trình đọc từ trên xuống đúng như bạn xếp. 🎉
              </p>
            )}
            {parsonsResult === 'wrong' && (
              <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-zinc-100">
                Chưa đúng thứ tự — để ý: khai báo/đọc dữ liệu trước, rồi if → elif → else; dòng thụt
                lề nằm ngay dưới điều kiện của nó.
              </p>
            )}
          </section>
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
            {/* Bài HTML/CSS: hiện luôn trang học viên đang viết — thấy ngay kết quả là thứ
                khiến người mới bám trụ được với web. Cập nhật theo từng lần gõ. */}
            {lesson.language === 'html' && <HtmlPreview html={code} />}
            {/* Bài DOM: KHÔNG xem trực tiếp theo từng phím gõ — script dở dang (hoặc vòng lặp
                vô hạn đang gõ nửa chừng) sẽ chạy ngay trong khung. Học viên bấm nút thì mới
                chụp lại code hiện tại và chạy. */}
            {(lesson.language === 'dom' || lesson.language === 'fetch') && lesson.domHtml && (
              <div className="space-y-2">
                <button
                  onClick={() =>
                    // Bài fetch: nhét fetch giả (cùng nguồn với bộ chấm) vào TRƯỚC code —
                    // iframe không có mạng thật nên fetch thật kiểu gì cũng thất bại.
                    setPreviewScript(lesson.language === 'fetch' ? FETCH_SHIM_JS + code : code)
                  }
                  className="tap-44 inline-flex items-center px-4 py-2 rounded-2xl border border-zinc-700 hover:border-zinc-500 text-sm text-zinc-200 transition"
                >
                  Xem trang chạy
                </button>
                {previewScript !== null && (
                  <HtmlPreview html={lesson.domHtml} script={previewScript} />
                )}
              </div>
            )}
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
            {/* ⑥b AI đồng hành: gợi ý Socratic (mở dần) · giải thích lỗi · góp ý sau khi đạt.
                Gợi ý soạn sẵn ở trên vẫn là đường CHÍNH (0đ, tức thì) — AI chỉ dùng khi bí thật. */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-400" />
                <span>Bí quá? Hỏi Bạn Đồng Hành</span>
              </h2>
              <p className="text-xs text-zinc-300">
                AI sẽ hỏi ngược để bạn tự tìm ra chỗ sai, không đưa lời giải sẵn. Mỗi lần hỏi tiêu 1
                lượt AI trong ngày.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => void askAi('socratic_hint')}
                  disabled={aiBusy !== null || !code.trim() || aiLevel >= MAX_HINT_LEVEL}
                  className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
                >
                  {aiBusy === 'socratic_hint' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircleQuestion className="w-4 h-4" />
                  )}
                  <span>
                    {aiLevel >= MAX_HINT_LEVEL
                      ? `Đã dùng hết ${MAX_HINT_LEVEL} bậc gợi ý`
                      : `Gợi ý bậc ${aiLevel + 1}/${MAX_HINT_LEVEL}`}
                  </span>
                </button>
                {firstError && (
                  <button
                    onClick={() => void askAi('explain_error')}
                    disabled={aiBusy !== null}
                    className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 disabled:opacity-50 text-zinc-200 font-semibold text-sm transition"
                  >
                    {aiBusy === 'explain_error' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>Lỗi này nghĩa là gì?</span>
                  </button>
                )}
                {passed && (
                  <button
                    onClick={() => void askAi('review')}
                    disabled={aiBusy !== null}
                    className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 disabled:opacity-50 text-zinc-200 font-semibold text-sm transition"
                  >
                    {aiBusy === 'review' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-accent-400" />
                    )}
                    <span>Nhờ AI xem lại code</span>
                  </button>
                )}
              </div>
              <div aria-live="polite">
                {aiText && (
                  <p className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 text-sm text-zinc-100 leading-relaxed whitespace-pre-line">
                    {aiText}
                  </p>
                )}
                {aiError && (
                  <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-zinc-100">
                    {aiError}
                  </p>
                )}
              </div>
            </div>
            {results && (
              <ul className="space-y-2" aria-live="polite">
                {results.map((r, i) => (
                  <li
                    key={i}
                    className={`rounded-2xl border p-3.5 text-sm ${
                      r.passed
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-rose-500/30 bg-rose-500/10'
                    }`}
                  >
                    <p className="flex items-center gap-2 font-semibold text-zinc-100">
                      {r.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>{r.hidden ? `Ca ẩn ${i + 1}` : r.label}</span>
                    </p>
                    {r.error && (
                      <pre className="mt-2 text-xs font-mono text-zinc-200 whitespace-pre-wrap">
                        {r.error}
                      </pre>
                    )}
                    {!r.passed && r.actual !== undefined && !r.error && (
                      <p className="mt-2 text-xs text-zinc-200">
                        Máy của bạn in ra:{' '}
                        <code className="font-mono">{r.actual || '(không in gì)'}</code>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
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
              onClick={() => nav('/lap-trinh/p1')}
              className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
            >
              <span>Về trang bậc P1</span>
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
