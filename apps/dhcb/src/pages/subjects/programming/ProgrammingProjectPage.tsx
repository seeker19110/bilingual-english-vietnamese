// ProgrammingProjectPage — DỰ ÁN TRỤC T1 "Cửa hàng của tôi", chặng P1 (PR-L3b).
// Học viên xây MỘT file cua_hang.py lớn dần qua 5 bước; mỗi bước có milestone check chấm
// HÀNH VI (test-case chạy Pyodide) — đạt hết mở bước sau; bước cuối chốt snapshot chặng.
// Workspace bền server (lib/programmingProject), tiến độ bước dùng chung bảng tiến độ bài học.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Store,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
  Save,
  Trophy,
  Lock,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import CodeEditor from '../../../components/CodeEditor'
import { useAuth } from '../../../context/useAuth'
import { runPython, resetPythonWorker } from '../../../lib/pythonRunner'
import {
  loadProjectFile,
  saveProjectFile,
  snapshotMilestone,
} from '../../../lib/programmingProject'
import {
  fetchProgress,
  saveLessonProgress,
  isLessonCompleted,
} from '../../../lib/programmingProgress'
import { P1_PROJECT_STEPS } from '@dhcb/subject-programming/projectSteps'
import {
  gradeTestCase,
  allTestsPassed,
  type TestCaseResult,
} from '@dhcb/subject-programming/grading'

export default function ProgrammingProjectPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [code, setCode] = useState<string | null>(null) // null = đang tải workspace
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set())
  const [activeStepId, setActiveStepId] = useState(P1_PROJECT_STEPS[0]!.id)
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<TestCaseResult[] | null>(null)
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving'>('saved')
  const [hintShown, setHintShown] = useState(false)
  const [refViewed, setRefViewed] = useState(false)
  const [milestoneDone, setMilestoneDone] = useState(false)

  // Nạp workspace + tiến độ bước; đặt bước hiện tại = bước đầu tiên CHƯA xong.
  useEffect(() => {
    if (!user) return
    void Promise.all([loadProjectFile(user.id), fetchProgress(user.id)]).then(
      ([content, progress]) => {
        setCode(content)
        const done = new Set(
          P1_PROJECT_STEPS.filter((s) => isLessonCompleted(progress, s.id)).map((s) => s.id),
        )
        setDoneSteps(done)
        const firstOpen = P1_PROJECT_STEPS.find((s) => !done.has(s.id))
        setActiveStepId(firstOpen?.id ?? P1_PROJECT_STEPS.at(-1)!.id)
        if (!firstOpen) setMilestoneDone(true)
      },
    )
    return () => resetPythonWorker()
  }, [user])

  const activeIndex = P1_PROJECT_STEPS.findIndex((s) => s.id === activeStepId)
  const activeStep = P1_PROJECT_STEPS[activeIndex]!
  // Bước được MỞ khi mọi bước trước nó đã xong.
  const isUnlocked = (i: number) => P1_PROJECT_STEPS.slice(0, i).every((s) => doneSteps.has(s.id))

  const onCodeChange = (next: string) => {
    setCode(next)
    setSaveState('dirty')
  }

  const doSave = async (): Promise<void> => {
    if (!user || code === null) return
    setSaveState('saving')
    await saveProjectFile(user.id, code)
    setSaveState('saved')
  }

  const runChecks = async () => {
    if (checking || !user || code === null) return
    setChecking(true)
    setResults(null)
    await doSave() // luôn lưu trước khi chấm — không chấm bản chưa lưu
    const out: TestCaseResult[] = []
    for (const check of activeStep.checks) {
      const r = await runPython(code, { stdinLines: check.stdinLines })
      out.push(
        gradeTestCase(check, r.output, r.error ?? (r.timedOut ? 'Quá thời gian' : undefined)),
      )
      setResults([...out])
    }
    setChecking(false)
    if (allTestsPassed(out)) {
      const nextDone = new Set(doneSteps)
      nextDone.add(activeStep.id)
      setDoneSteps(nextDone)
      void saveLessonProgress(user.id, activeStep.id, 'completed')
      if (activeStep.isMilestone) {
        setMilestoneDone(true)
        void snapshotMilestone('p1')
      }
      // KHÔNG tự nhảy bước: giữ nguyên các ca xanh cho học viên thấy thành quả,
      // banner bên dưới hiện nút "Sang bước tiếp" (đúng nhịp thong thả của Companion).
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <PageHeader
          title="Dự án: Cửa hàng của tôi"
          subtitle='Chặng P1 — "Máy tính tiền": xây file cua_hang.py lớn dần qua 5 bước. Đạt hết test của bước là mở bước sau; xong bước 5 là hoàn thành chặng.'
        />

        {/* Thanh bước dự án */}
        <nav aria-label="Các bước dự án" className="flex gap-1.5 overflow-x-auto pb-1">
          {P1_PROJECT_STEPS.map((s, i) => {
            const unlocked = isUnlocked(i)
            return (
              <button
                key={s.id}
                disabled={!unlocked}
                onClick={() => {
                  setActiveStepId(s.id)
                  setResults(null)
                  setHintShown(false)
                }}
                aria-current={s.id === activeStepId ? 'step' : undefined}
                className={`tap-44 shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  s.id === activeStepId
                    ? 'bg-accent-500 text-black'
                    : unlocked
                      ? 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white'
                      : 'bg-zinc-900/50 border border-zinc-800 text-zinc-500'
                }`}
              >
                {doneSteps.has(s.id) ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : unlocked ? (
                  <Store className="w-3.5 h-3.5" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Bước {i + 1}</span>
              </button>
            )
          })}
        </nav>

        {/* Yêu cầu bước hiện tại */}
        <section className="bg-zinc-900/80 border border-accent-500/30 rounded-3xl p-5 space-y-2">
          <h2 className="text-sm font-bold text-white">
            Bước {activeIndex + 1}: {activeStep.title}
          </h2>
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
            {activeStep.requirement}
          </p>
        </section>

        {/* Editor workspace */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono">cua_hang.py</h2>
            <span className="text-xs text-zinc-400">
              {saveState === 'saving' ? 'Đang lưu…' : saveState === 'dirty' ? 'Chưa lưu' : 'Đã lưu'}
            </span>
          </div>
          {code === null ? (
            <div className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-6 text-sm text-zinc-400">
              Đang tải workspace của bạn…
            </div>
          ) : (
            <CodeEditor value={code} onChange={onCodeChange} ariaLabel="File dự án cua_hang.py" />
          )}
        </section>

        {/* Hành động */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => void runChecks()}
            disabled={checking || code === null || !code.trim()}
            className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-black font-semibold text-sm transition"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{checking ? 'Đang kiểm tra…' : 'Kiểm tra bước'}</span>
          </button>
          <button
            onClick={() => void doSave()}
            disabled={saveState !== 'dirty'}
            className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 disabled:opacity-50 text-zinc-200 font-semibold text-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>Lưu</span>
          </button>
          {!hintShown && (
            <button
              onClick={() => setHintShown(true)}
              className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-200 font-semibold text-sm transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Gợi ý</span>
            </button>
          )}
          {!refViewed && (
            <button
              onClick={() => {
                // "Phao": nạp code tham chiếu của bước — không phạt, chỉ ghi nhận.
                setRefViewed(true)
                setCode(activeStep.referenceCode)
                setSaveState('dirty')
              }}
              className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-semibold text-sm transition"
            >
              <Eye className="w-4 h-4" />
              <span>Xem code mẫu bước này</span>
            </button>
          )}
        </div>
        {hintShown && (
          <p className="flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-zinc-100">
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{activeStep.hint}</span>
          </p>
        )}

        {/* Kết quả milestone check */}
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

        {results && allTestsPassed(results) && !activeStep.isMilestone && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-zinc-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="font-semibold">Đạt hết test của bước {activeIndex + 1}! 🎉</p>
            <button
              onClick={() => {
                const next = P1_PROJECT_STEPS[activeIndex + 1]
                if (next) {
                  setActiveStepId(next.id)
                  setResults(null)
                  setHintShown(false)
                  setRefViewed(false)
                }
              }}
              className="tap-44 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent-500 hover:bg-accent-400 text-black font-semibold text-sm transition"
            >
              Sang bước {activeIndex + 2}
            </button>
          </div>
        )}

        {milestoneDone && (
          <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm text-zinc-100 flex items-start gap-3">
            <Trophy className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">Hoàn thành chặng P1 — Máy tính tiền! 🎉</p>
              <p className="mt-1 leading-relaxed">
                Bản cửa hàng của bạn đã được chốt snapshot milestone P1 — sau này nhìn lại sẽ thấy
                mình đi xa cỡ nào. Chặng P2 ("Sổ sách tử tế") mở cùng nội dung bậc P2.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
