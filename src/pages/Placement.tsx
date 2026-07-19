// ──────────────────────────────────────────────────────────────────────
// BÀI TEST XẾP LỚP ĐẦU VÀO — trang riêng, KHÔNG bọc RequireAuth (giống /onboarding)
// vì có thể vào từ giữa luồng onboarding, trước khi user.onboarded = true.
//
// Nguồn: docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md (mục ④). Thuật toán
// bậc thang thuần ở lib/placement.ts; trang này chỉ lo dựng câu hỏi (tái dùng
// buildExam của lib/cefrExam.ts qua PLACEMENT_ROUND_PLAN) + UI + điều hướng.
//
// 2 nơi vào trang này (phân biệt qua location.state.from):
//   - 'onboarding': từ Onboarding bước 1 → xong bài test KHÔNG tự lưu vào profiles
//     (tránh set onboarded=true giữa chừng) — quay lại /onboarding kèm presetLevel,
//     Onboarding tự hoàn tất bước mục tiêu/thời gian rồi lưu thật.
//   - mặc định (từ /profile, "Kiểm tra lại trình độ"): áp kết quả NGAY vào profiles
//     (chỉ đổi level, giữ nguyên goal/dailyMinutes đã có) rồi quay lại /profile.
// ──────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import ExamQuestionCard from '../components/ExamQuestionCard'
import { useAuth } from '../context/useAuth'
import { getDirection } from '../lib/storage'
import { ACCENT } from '../lib/cefrAccent'
import { CEFR_LEVELS, type CefrLevel } from '../data/cefr'
import type { Dialogue } from '../data/dialogues'
import { getDialogues } from '../data/dialoguesLoader'
import { getLevelWords } from '../lib/curriculum'
import { getLearnedWords } from '../lib/vocab'
import { stopSpeaking } from '../lib/tts'
import { buildExam, levelGrammarSources, type ExamQuestion } from '../lib/cefrExam'
import {
  nextPlacementStep,
  cefrToAppLevel,
  canRetakePlacement,
  PLACEMENT_START,
  PLACEMENT_ROUND_PLAN,
  PLACEMENT_MAX_ROUNDS,
  type CefrId,
  type PlacementRound,
  type PlacementResult,
} from '../lib/placement'
import { getPlacementResult, savePlacementResult } from '../lib/placementResult'
import { saveOnboarding } from '../lib/cloud'
import { cacheOnboarding, getCachedOnboarding } from '../lib/onboarding'
import { setDailySpeed } from '../lib/curriculum'
import { minutesToSpeed } from '../lib/onboarding'

// Màu nhấn trung tính cho bài test (không gắn với 1 cấp CEFR cụ thể như CefrExam).
const accent = ACCENT.emerald

const CEFR_LABEL: Record<CefrId, { vi: string; en: string }> = {
  A1: { vi: 'A1 · Mới bắt đầu', en: 'A1 · Beginner' },
  A2: { vi: 'A2 · Sơ cấp', en: 'A2 · Elementary' },
  B1: { vi: 'B1 · Trung cấp', en: 'B1 · Intermediate' },
  B2: { vi: 'B2 · Trung cấp cao', en: 'B2 · Upper-intermediate' },
  C1: { vi: 'C1 · Nâng cao', en: 'C1 · Advanced' },
  C2: { vi: 'C2 · Thành thạo', en: 'C2 · Proficient' },
}

type Phase = 'intro' | 'testing' | 'result'

export default function Placement() {
  const nav = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isA = getDirection() === 'A'
  const fromOnboarding = (location.state as { from?: string } | null)?.from === 'onboarding'

  const [phase, setPhase] = useState<Phase>('intro')
  const [history, setHistory] = useState<PlacementRound[]>([])
  const [levelObj, setLevelObj] = useState<CefrLevel | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [result, setResult] = useState<PlacementResult | null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) return null // như /onboarding: chưa đăng nhập thì AuthProvider tự điều hướng /login

  const saved = getPlacementResult(user.id)
  const canRetake = canRetakePlacement(saved?.lastAt ?? null)

  // Dựng 1 vòng thi ở cấp `levelId`: nạp hội thoại của cấp rồi buildExam thu nhỏ.
  async function loadRound(levelId: CefrId) {
    const level = CEFR_LEVELS.find((l) => l.id === levelId)
    if (!level || !user) return
    setLoading(true)
    const dialogueLists = await Promise.all(level.units.map((u) => getDialogues(u.id)))
    const dialogues: Dialogue[] = dialogueLists.flat()
    const qs = buildExam({
      isA,
      words: getLevelWords(level.id),
      learned: getLearnedWords(user.id),
      grammar: levelGrammarSources(level),
      dialogues,
      plan: PLACEMENT_ROUND_PLAN,
    })
    setLevelObj(level)
    setLoading(false)
    // Kho quá mỏng để hỏi (ca hiếm) → không thi được vòng này, dùng luôn cấp này
    // làm kết quả (giống "điểm ở giữa" — dừng lại đây).
    if (qs.length === 0) {
      finish({ cefr: level.id, appLevel: cefrToAppLevel(level.id) })
      return
    }
    setQuestions(qs)
    setCurrent(0)
    setSelected(null)
    setAnswers([])
  }

  function startTest() {
    setHistory([])
    setPhase('testing')
    void loadRound(PLACEMENT_START)
  }

  function pick(opt: string) {
    if (selected === null) setSelected(opt)
  }

  function next() {
    if (!questions || !levelObj) return
    const q = questions[current]
    const ok = selected === q?.correct
    const newAnswers = [...answers, ok]
    setAnswers(newAnswers)

    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1)
      setSelected(null)
      return
    }

    // Hết câu của vòng → chấm điểm vòng, hỏi bước kế tiếp.
    stopSpeaking()
    const correct = newAnswers.filter(Boolean).length
    const pct = Math.round((correct / questions.length) * 100)
    const newHistory = [...history, { levelId: levelObj.id, pct }]
    setHistory(newHistory)
    const step = nextPlacementStep(newHistory)
    if (step.done) {
      finish(step.result)
    } else {
      void loadRound(step.nextLevel)
    }
  }

  function finish(res: PlacementResult) {
    if (!user) return
    savePlacementResult(user.id, res)
    setResult(res)
    setPhase('result')
  }

  // Áp kết quả vào profiles NGAY (chỉ đổi level, giữ goal/dailyMinutes đã có) —
  // dùng khi thi từ /profile (đã onboarded từ trước).
  async function applyResultNow(res: PlacementResult) {
    if (!user) return
    const cached = getCachedOnboarding(user.id)
    const goal = cached?.goal ?? 'daily'
    const dailyMinutes = cached?.dailyMinutes ?? 10
    await saveOnboarding({ level: res.appLevel, goal, dailyMinutes })
    cacheOnboarding(user.id, { level: res.appLevel, goal, dailyMinutes })
    setDailySpeed(user.id, minutesToSpeed(dailyMinutes))
  }

  function continueAfterResult() {
    if (!result) return
    if (fromOnboarding) {
      // Chưa lưu profiles ở đây — để Onboarding tự hoàn tất bước mục tiêu/thời
      // gian rồi lưu 1 lần (tránh set onboarded=true giữa chừng).
      nav('/onboarding', { replace: true, state: { presetLevel: result.appLevel } })
    } else {
      void applyResultNow(result).then(() => nav('/profile', { replace: true }))
    }
  }

  function skipTest() {
    if (fromOnboarding) nav('/onboarding', { replace: true })
    else nav('/profile', { replace: true })
  }

  // ── Màn giới thiệu ─────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-dvh bg-zinc-950">
        {!fromOnboarding && <Layout />}
        <main
          className={`max-w-lg mx-auto px-4 pb-[calc(1.5rem+var(--bnav-h))] space-y-5 ${fromOnboarding ? 'pt-10' : 'pt-6'}`}
        >
          <PageHeader
            title={isA ? '🎯 Test xếp lớp' : '🎯 Placement test'}
            subtitle={
              isA
                ? 'Trả lời ~5–7 phút để AI đề xuất cấp CEFR phù hợp nhất cho bạn.'
                : 'Answer for ~5–7 minutes so the AI can suggest the CEFR level that fits you.'
            }
          />

          {saved && !canRetake ? (
            <div className="glass rounded-2xl p-6 text-center space-y-3 animate-fade-in">
              <GraduationCap className={`w-8 h-8 mx-auto ${accent.text}`} />
              <p className="text-sm text-zinc-300">
                {isA
                  ? 'Bạn đã làm bài test này gần đây. Kết quả:'
                  : "You've taken this test recently. Result:"}
              </p>
              <p className="text-2xl font-bold text-white">
                {isA ? CEFR_LABEL[saved.cefr].vi : CEFR_LABEL[saved.cefr].en}
              </p>
              <button
                onClick={() => continueAfterResultFromSaved()}
                className="w-full bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3 rounded-2xl transition"
              >
                {isA ? 'Dùng kết quả này' : 'Use this result'}
              </button>
              <button
                onClick={skipTest}
                className="w-full text-sm text-zinc-400 hover:text-zinc-200 py-2 transition"
              >
                {isA ? 'Bỏ qua — tự chọn trình độ' : 'Skip — pick manually'}
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 text-center space-y-4 animate-fade-in">
              <Sparkles className={`w-8 h-8 mx-auto ${accent.text}`} />
              <p className="text-sm text-zinc-400">
                {isA
                  ? `Tối đa ${PLACEMENT_MAX_ROUNDS} vòng, mỗi vòng ${Object.values(PLACEMENT_ROUND_PLAN).reduce((a, b) => a + b, 0)} câu (từ vựng · ngữ pháp · nghe · đọc hiểu). Câu hỏi tự điều chỉnh độ khó theo bạn.`
                  : `Up to ${PLACEMENT_MAX_ROUNDS} rounds, ${Object.values(PLACEMENT_ROUND_PLAN).reduce((a, b) => a + b, 0)} questions each (vocabulary · grammar · listening · reading). Difficulty adapts to you.`}
              </p>
              <button
                onClick={startTest}
                className="w-full bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3 rounded-2xl transition"
              >
                {isA ? 'Bắt đầu' : 'Start'}
              </button>
              <button
                onClick={skipTest}
                className="w-full text-sm text-zinc-400 hover:text-zinc-200 py-2 transition"
              >
                {isA ? 'Bỏ qua — tự chọn trình độ' : 'Skip — pick manually'}
              </button>
            </div>
          )}
        </main>
      </div>
    )
  }

  // Dùng kết quả ĐÃ LƯU trước đó (không thi lại) — chỉ hợp lệ khi `saved` tồn tại.
  function continueAfterResultFromSaved() {
    if (!saved) return
    finish({ cefr: saved.cefr, appLevel: saved.appLevel })
  }

  // ── Màn kết quả ─────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        {!fromOnboarding && <Layout />}
        <main
          className={`max-w-lg mx-auto px-4 pb-[calc(1.5rem+var(--bnav-h))] space-y-5 ${fromOnboarding ? 'pt-10' : 'pt-6'}`}
        >
          <div className="glass rounded-2xl p-8 text-center space-y-3 animate-fade-in">
            <p className="text-5xl">🎓</p>
            <p className="text-sm text-zinc-400">
              {isA ? 'Trình độ đề xuất của bạn:' : 'Your suggested level:'}
            </p>
            <p className="text-3xl font-bold text-white">
              {isA ? CEFR_LABEL[result.cefr].vi : CEFR_LABEL[result.cefr].en}
            </p>
            <button
              onClick={continueAfterResult}
              className="w-full mt-4 bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3 rounded-2xl transition"
            >
              {isA ? 'Tiếp tục' : 'Continue'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Màn đang thi (hoặc đang nạp câu hỏi) ─────────────────────────────────
  return (
    <div className="min-h-dvh bg-zinc-950">
      {!fromOnboarding && <Layout />}
      <main
        className={`max-w-lg mx-auto px-4 pb-[calc(1.5rem+var(--bnav-h))] space-y-4 ${fromOnboarding ? 'pt-10' : 'pt-6'}`}
      >
        {loading || !questions || !levelObj ? (
          <div className="glass rounded-xl p-8 text-center animate-fade-in">
            <RotateCcw className={`w-6 h-6 mx-auto mb-2 animate-spin ${accent.text}`} />
            <p className="text-zinc-400 text-sm">
              {isA ? 'Đang chuẩn bị câu hỏi…' : 'Preparing questions…'}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={skipTest}
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition"
              >
                <ArrowLeft className="w-4 h-4" /> {isA ? 'Thoát' : 'Exit'}
              </button>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                <GraduationCap className={`w-4 h-4 ${accent.text}`} />
                {isA
                  ? `Vòng ${history.length + 1}/${PLACEMENT_MAX_ROUNDS} · ${levelObj.id}`
                  : `Round ${history.length + 1}/${PLACEMENT_MAX_ROUNDS} · ${levelObj.id}`}
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
            <ExamQuestionCard
              q={questions[current] as ExamQuestion}
              isA={isA}
              accent={accent}
              current={current}
              total={questions.length}
              selected={selected}
              onPick={pick}
              onNext={next}
              nextLabel={{
                last: isA ? 'Xong vòng này' : 'Finish round',
                more: isA ? 'Câu tiếp theo' : 'Next',
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
