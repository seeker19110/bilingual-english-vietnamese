// src/pages/learning/ExamPlan.tsx — Chế độ ôn thi có hạn chót ("Đếm ngược kỳ thi").
//
// Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md
//
// LUẬT BỐ CỤC (mục 4.1, và luật số 1 của sản phẩm): màn hình này là ĐỒNG HỒ ĐẾM NGƯỢC + ĐÚNG 3
// VIỆC HÔM NAY. Không phải bảng điểm, không phải biểu đồ tiến độ, không phải kết quả chẩn đoán.
// Con số "đã thuộc bao nhiêu/bao nhiêu" nằm ở dòng phụ, không phải nhân vật chính.
//
// LUẬT GIỌNG (mục 4.2, 4.3): trễ thì NÉN LỊCH, không phạt — không có màn hình "bạn đã bỏ lỡ N
// ngày". Không kịp thì NÓI THẲNG và đề xuất cắt phạm vi, không im lặng nhồi lịch.

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, Target, BookOpen, RotateCcw, Sparkles, Loader2 } from 'lucide-react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/useAuth'
import { setExamRetention } from '../../lib/srs'
import type { ExamPlan as ExamPlanRecord } from '@dhcb/core-contracts/examPlan'
import {
  fetchExamPlan,
  createExamPlan,
  endExamPlan,
  computeTodayPlan,
  getExamScopeWords,
  suggestedDailyCap,
  type TodayPlan,
} from '../../lib/examPlan'

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

function daysLabel(n: number): string {
  if (n === 0) return 'Thi hôm nay'
  if (n === 1) return 'Còn 1 ngày'
  return `Còn ${n} ngày`
}

// ── Màn hình khi CHƯA có kế hoạch ────────────────────────────────────────────
function CreateForm({ uid, onCreated }: { uid: string; onCreated: () => void }) {
  const [examDate, setExamDate] = useState('')
  const [targetLabel, setTargetLabel] = useState('')
  const [dailyCap, setDailyCap] = useState(() => suggestedDailyCap(uid))
  const [restDays, setRestDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleRestDay(d: number) {
    setRestDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  async function submit() {
    if (!examDate) return
    setSaving(true)
    setError(null)
    const res = await createExamPlan({
      examKind: 'vao10-english',
      examDate,
      scopeItems: getExamScopeWords().length,
      ...(targetLabel.trim() ? { targetLabel: targetLabel.trim() } : {}),
      dailyCapItems: dailyCap,
      restDays,
    })
    setSaving(false)
    if (res.ok) onCreated()
    else setError(res.message)
  }

  return (
    <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4">
      <p className="text-sm text-zinc-300">
        Cho biết ngày thi, hệ thống tự chia việc mỗi ngày từ đó ngược về hôm nay. Bận vài hôm cũng
        không sao — lịch tự tính lại, không có ai trừ điểm bạn cả.
      </p>

      <div>
        <label htmlFor="exam-date" className="block text-xs font-medium text-zinc-200 mb-1.5">
          Ngày thi
        </label>
        <input
          id="exam-date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-base text-zinc-100"
        />
      </div>

      <div>
        <label htmlFor="exam-target" className="block text-xs font-medium text-zinc-200 mb-1.5">
          Mục tiêu của bạn (tuỳ chọn)
        </label>
        <input
          id="exam-target"
          value={targetLabel}
          onChange={(e) => setTargetLabel(e.target.value)}
          placeholder="ví dụ: 8 điểm"
          maxLength={60}
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-base text-zinc-100 placeholder:text-zinc-400"
        />
        <p className="text-xs text-zinc-300 mt-1">
          Chỉ để bạn nhớ mình đang nhắm gì — hệ thống không dùng con số này để chấm bất cứ thứ gì.
        </p>
      </div>

      <div>
        <label htmlFor="exam-cap" className="block text-xs font-medium text-zinc-200 mb-1.5">
          Nhiều nhất mỗi ngày: {dailyCap} mục
        </label>
        <input
          id="exam-cap"
          type="range"
          min={5}
          max={40}
          step={5}
          value={dailyCap}
          onChange={(e) => setDailyCap(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <fieldset>
        <legend className="text-xs font-medium text-zinc-200 mb-1.5">Ngày nghỉ trong tuần</legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map((label, d) => {
            const on = restDays.includes(d)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleRestDay(d)}
                aria-pressed={on}
                className={`tap-44 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  on
                    ? 'bg-accent-500/20 border-accent-500/40 text-accent-400 theme-light:text-accent-800'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-xs text-rose-300 theme-light:text-rose-800">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!examDate || saving}
        className="tap-44 w-full rounded-xl bg-accent-500/15 border border-accent-500/30 px-3 py-3 text-sm font-semibold text-accent-400 theme-light:text-accent-800 hover:bg-accent-500/25 transition disabled:opacity-60"
      >
        {saving ? 'Đang tạo…' : 'Bắt đầu đếm ngược'}
      </button>
    </section>
  )
}

// ── Ba việc hôm nay ──────────────────────────────────────────────────────────
function TodayTasks({ plan }: { plan: TodayPlan }) {
  const navigate = useNavigate()

  const tasks = [
    plan.todayReviewItems > 0 && {
      key: 'review',
      icon: RotateCcw,
      title: `Ôn ${plan.todayReviewItems} thẻ đến hạn`,
      desc: 'Trả nợ cũ trước — đây là phần dễ quên nhất.',
      to: '/lo-trinh-hoc/a1?tab=srs',
    },
    plan.todayNewItems > 0 && {
      key: 'new',
      icon: BookOpen,
      title: `Học ${plan.todayNewItems} mục mới`,
      desc: 'Đúng bằng phần chia đều từ nay tới ngày thi.',
      to: '/hoc-tieng-anh',
    },
    {
      key: 'speak',
      icon: Sparkles,
      title: 'Nói thử 5 phút',
      desc: 'Phần dễ bỏ nhất khi ôn thi, và mất điểm nhiều nhất.',
      to: '/luyen-noi',
    },
  ].filter(Boolean) as Array<{
    key: string
    icon: typeof BookOpen
    title: string
    desc: string
    to: string
  }>

  return (
    <section aria-labelledby="today-heading" className="space-y-2">
      <h2 id="today-heading" className="text-sm font-semibold text-white">
        {plan.phase === 'taper' ? 'Mấy ngày cuối — chỉ ôn lại' : 'Hôm nay'}
      </h2>
      {tasks.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => navigate(t.to)}
          className="tap-44 w-full text-left flex items-start gap-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-3.5 hover:border-zinc-700 transition"
        >
          <t.icon className="w-5 h-5 mt-0.5 shrink-0 text-accent-400 theme-light:text-accent-800" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-white">{t.title}</span>
            <span className="block text-xs text-zinc-300 mt-0.5">{t.desc}</span>
          </span>
        </button>
      ))}
    </section>
  )
}

export default function ExamPlanPage() {
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const [record, setRecord] = useState<ExamPlanRecord | null>(null)
  const [plan, setPlan] = useState<TodayPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const apply = useCallback(
    (rec: ExamPlanRecord | null) => {
      const next = rec && uid ? computeTodayPlan(rec, uid) : null
      setRecord(rec)
      setPlan(next)
      setLoading(false)
      // Nối vào FSRS: càng gần ngày thi, mức nhớ mục tiêu càng cao → lịch ôn dày lên. Không có
      // kế hoạch thì trả về mặc định 0,9. Xem lib/srs.ts mục "Mức nhớ mục tiêu".
      if (uid) setExamRetention(uid, next?.requestRetention ?? null)
    },
    [uid],
  )

  // Cờ `alive` để không setState sau khi component đã rời màn hình (cùng khuôn ReferralSection).
  useEffect(() => {
    let alive = true
    fetchExamPlan().then((rec) => {
      if (alive) apply(rec)
    })
    return () => {
      alive = false
    }
  }, [apply])

  async function reload() {
    apply(await fetchExamPlan())
  }

  async function handleEnd() {
    if (!record) return
    if (await endExamPlan(record.id)) {
      setRecord(null)
      setPlan(null)
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        <PageHeader
          title="Ôn thi"
          subtitle="Đặt ngày thi, mỗi ngày chỉ cần làm đúng phần việc của ngày đó."
        />

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" aria-label="Đang tải" />
          </div>
        ) : !record || !plan ? (
          <CreateForm uid={uid} onCreated={() => void reload()} />
        ) : (
          <div className="space-y-5">
            {/* Đồng hồ đếm ngược — nhân vật chính của màn hình này. */}
            <section className="rounded-2xl bg-zinc-900/80 border border-zinc-800/80 p-5 text-center">
              <p className="flex items-center justify-center gap-2 text-xs text-zinc-300">
                <CalendarClock className="w-4 h-4" aria-hidden />
                Thi vào lớp 10 — Tiếng Anh · {plan.examDate}
              </p>
              <p className="mt-2 text-3xl font-extrabold text-white tracking-tight">
                {daysLabel(plan.daysLeft)}
              </p>
              {record.targetLabel && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-zinc-300">
                  <Target className="w-3.5 h-3.5" aria-hidden />
                  Mục tiêu bạn đặt: {record.targetLabel}
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-300">
                Đã nắm {plan.masteredItems}/{plan.scopeItems} mục trong phạm vi thi
              </p>
            </section>

            {/* Không kịp thì NÓI THẲNG, kèm đề xuất cắt phạm vi. */}
            {plan.feasibility === 'not-feasible' && plan.suggestedScopeCut !== null && (
              <section
                role="alert"
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
              >
                <h2 className="text-sm font-semibold text-amber-200 theme-light:text-amber-900">
                  Với quỹ thời gian này, học hết phạm vi là không kịp
                </h2>
                <p className="mt-1.5 text-xs text-zinc-200">
                  Nói thẳng để bạn còn kịp đổi cách: nên bỏ bớt khoảng{' '}
                  <strong>{plan.suggestedScopeCut} mục</strong> ít gặp trong đề, dồn sức vào phần
                  còn lại. Hoặc nâng số mục mỗi ngày nếu bạn thật sự có thời gian.
                </p>
              </section>
            )}

            {plan.feasibility === 'tight' && (
              <p className="text-xs text-zinc-300">
                Lịch đang khá sát — nghỉ một hôm là phải bù. Cân nhắc nâng số mục mỗi ngày một chút.
              </p>
            )}

            <TodayTasks plan={plan} />

            <button
              type="button"
              onClick={handleEnd}
              className="tap-44 w-full rounded-xl border border-zinc-700 px-3 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800/60 transition"
            >
              Kết thúc kế hoạch này
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
