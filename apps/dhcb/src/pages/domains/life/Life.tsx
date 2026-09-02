// apps/dhcb/src/pages/Life.tsx — Life Foundation Hub UI (V2-17)
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame,
  Smile,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Loader2,
  Calendar,
  CheckCircle2,
  Trophy,
  Heart,
} from 'lucide-react'
import Modal from '../../../components/Modal'
import Field from '../../../components/Field'
import { vnDateStr } from '../../../lib/date'
import LoadError from '../../../components/LoadError'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { PageShell } from '@core/PageShell'
import { useToast } from '@core/ToastProvider'
import {
  listLifePlans,
  createLifePlan,
  updateLifePlanStatus,
  listHabits,
  createHabit,
  logHabit,
  listWellbeingChecks,
  recordWellbeingCheck,
  listGrowthMilestones,
  createGrowthMilestone,
} from '../../../lib/lifeApi'
import type {
  LifePlan,
  Habit,
  WellbeingCheck,
  GrowthMilestone,
} from '@dhcb/core-contracts/lifeFoundation'

// `embedded` = đang được nhúng trong trang gộp "Công việc & Đời sống"
// (`/cong-viec-cuoc-song`): khi đó KHÔNG dựng Layout riêng và KHÔNG render
// PageHeader (h1) nữa — trang gộp đã có h1 của nó, hai h1 trên một trang là
// lỗi phân cấp tiêu đề (a11y).
export default function Life({ embedded = false }: { embedded?: boolean } = {}) {
  const nav = useNavigate()
  const toast = useToast()
  const [plans, setPlans] = useState<LifePlan[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [wellbeingChecks, setWellbeingChecks] = useState<WellbeingCheck[]>([])
  const [milestones, setMilestones] = useState<GrowthMilestone[]>([])
  const [loading, setLoading] = useState(true)
  // Lỗi TẢI dữ liệu — tách khỏi trạng thái rỗng, xem components/LoadError.tsx.
  const [loadError, setLoadError] = useState<string | null>(null)
  // Chặn gửi trùng: mạng chậm mà bấm "Lưu" hai lần sẽ tạo ra hai bản ghi.
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'habits' | 'wellbeing' | 'plans' | 'milestones'>(
    'habits',
  )

  // Modals
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [showWellbeingModal, setShowWellbeingModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)

  // Forms
  const [habitForm, setHabitForm] = useState({
    title: '',
    habitType: 'build' as 'build' | 'break',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    targetCount: 1,
  })
  const [wellbeingForm, setWellbeingForm] = useState({
    moodScore: 8,
    energyScore: 8,
    stressScore: 3,
    notes: '',
  })
  const [planForm, setPlanForm] = useState({
    title: '',
    planType: 'weekly' as LifePlan['planType'],
    periodStart: new Date().toISOString().split('T')[0] || '',
    periodEnd: '',
  })
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    area: 'learning' as GrowthMilestone['area'],
    description: '',
    achievedAt: new Date().toISOString().split('T')[0] || '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [hList, wList, pList, mList] = await Promise.all([
        listHabits(),
        listWellbeingChecks(),
        listLifePlans(),
        listGrowthMilestones(),
      ])
      setHabits(hList)
      setWellbeingChecks(wList)
      setPlans(pList)
      setMilestones(mList)
      setLoadError(null)
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu Life Foundation')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve().then(loadData)
  }, [loadData])

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await createHabit({
        title: habitForm.title,
        habitType: habitForm.habitType,
        frequency: habitForm.frequency,
        targetCount: Number(habitForm.targetCount) || 1,
      })
      setHabits((prev) => [created, ...prev])
      setShowHabitModal(false)
      setHabitForm({ title: '', habitType: 'build', frequency: 'daily', targetCount: 1 })
      toast.success('Đã thêm thói quen mới!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo thói quen')
    } finally {
      setSubmitting(false)
    }
  }

  // Đang gửi check-in cho thói quen nào (khoá nút, chặn bấm dồn).
  const [loggingHabitId, setLoggingHabitId] = useState<string | null>(null)
  // Hôm nay theo múi giờ VN — cùng luật với server (packages/core-db/date.ts).
  const today = vnDateStr()

  const handleLogHabit = async (habitId: string) => {
    if (loggingHabitId) return
    setLoggingHabitId(habitId)
    try {
      await logHabit({ habitId, count: 1 })
      // Đọc LẠI từ server thay vì tự cộng `currentStreak + 1` ở client: streak là
      // chuỗi ngày liên tiếp do server tính (đứt quãng thì reset, cùng ngày thì
      // không cộng), client đoán sẽ lệch với con số thật.
      setHabits(await listHabits())
      toast.success('🔥 Check-in thói quen thành công!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi check-in thói quen')
    } finally {
      setLoggingHabitId(null)
    }
  }

  const handleRecordWellbeing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await recordWellbeingCheck({
        moodScore: Number(wellbeingForm.moodScore),
        energyScore: Number(wellbeingForm.energyScore),
        stressScore: Number(wellbeingForm.stressScore),
        notes: wellbeingForm.notes || undefined,
      })
      setWellbeingChecks((prev) => [created, ...prev])
      setShowWellbeingModal(false)
      setWellbeingForm({ moodScore: 8, energyScore: 8, stressScore: 3, notes: '' })
      toast.success('Đã lưu nhật ký tâm trạng & sức khỏe!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu wellbeing')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await createLifePlan({
        title: planForm.title,
        planType: planForm.planType,
        periodStart: planForm.periodStart,
        periodEnd: planForm.periodEnd,
      })
      setPlans((prev) => [created, ...prev])
      setShowPlanModal(false)
      setPlanForm({
        title: '',
        planType: 'weekly',
        periodStart: new Date().toISOString().split('T')[0] || '',
        periodEnd: '',
      })
      toast.success('Đã tạo kế hoạch cuộc sống!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo kế hoạch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await createGrowthMilestone({
        title: milestoneForm.title,
        area: milestoneForm.area,
        description: milestoneForm.description || undefined,
        achievedAt: milestoneForm.achievedAt || undefined,
      })
      setMilestones((prev) => [created, ...prev])
      setShowMilestoneModal(false)
      setMilestoneForm({
        title: '',
        area: 'learning',
        description: '',
        achievedAt: new Date().toISOString().split('T')[0] || '',
      })
      toast.success('🎉 Đã thêm cột mốc phát triển bản thân!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo cột mốc')
    } finally {
      setSubmitting(false)
    }
  }

  const body = (
    // [2026-09-02, đợt 4 thiết kế lại desktop] width="standard"; giữ bố cục flex cột (dùng
    // chung cho bản độc lập lẫn bản nhúng).
    <PageShell
      width="standard"
      baseWidth="max-w-6xl"
      className="!pt-6 !pb-20 flex flex-1 flex-col space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {embedded ? (
          <div className="mb-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              Nền Tảng Cuộc Sống (Life Foundation)
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">
              Xây dựng thói quen bền vững, theo dõi tâm trạng, kế hoạch cuộc sống và cột mốc phát
              triển
            </p>
          </div>
        ) : (
          <PageHeader
            title="Nền Tảng Cuộc Sống (Life Foundation)"
            subtitle="Xây dựng thói quen bền vững, theo dõi tâm trạng, kế hoạch cuộc sống và cột mốc phát triển"
            className="mb-0"
          />
        )}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => nav('/life/wheel')}
            className="tap-44 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-black text-sm font-bold shadow-sm transition"
            title="Bánh xe cuộc đời"
          >
            <Heart className="w-4 h-4" />
            Bánh Xe Cuộc Đời
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-800 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('habits')}
          className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'habits'
              ? 'bg-rose-600/20 text-rose-400 theme-light:text-rose-800 border border-rose-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400 theme-light:text-amber-800" />
          Thói quen ({habits.length})
        </button>
        <button
          onClick={() => setActiveTab('wellbeing')}
          className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'wellbeing'
              ? 'bg-rose-600/20 text-rose-400 theme-light:text-rose-800 border border-rose-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Smile className="w-4 h-4 text-emerald-400 theme-light:text-emerald-800" />
          Sức khỏe & Tâm trạng ({wellbeingChecks.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'plans'
              ? 'bg-rose-600/20 text-rose-400 theme-light:text-rose-800 border border-rose-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-400 theme-light:text-blue-800" />
          Kế hoạch ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'milestones'
              ? 'bg-rose-600/20 text-rose-400 theme-light:text-rose-800 border border-rose-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-yellow-400 theme-light:text-yellow-800" />
          Cột mốc ({milestones.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-400 theme-light:text-rose-800 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Đang tải dữ liệu cuộc sống...</p>
        </div>
      ) : loadError ? (
        // Lỗi TẢI phải được ưu tiên hơn trạng thái rỗng: nếu không, mất mạng lại
        // hiện ra đúng màn "chưa có gì" và người dùng tưởng mất dữ liệu.
        <div className="mt-6">
          <LoadError message={loadError} onRetry={() => void loadData()} retrying={loading} />
        </div>
      ) : (
        <div>
          {/* Tab 1: Habits */}
          {activeTab === 'habits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">
                  Theo Dõi Thói Quen Hàng Ngày
                </h3>
                <button
                  onClick={() => setShowHabitModal(true)}
                  className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-[#fff] text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm thói quen
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có thói quen nào. Nhấn &quot;Thêm thói quen&quot; để bắt đầu xây dựng chuỗi
                  streak!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-zinc-100 text-base">{habit.title}</h4>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                              habit.habitType === 'build'
                                ? 'bg-emerald-950/80 theme-light:bg-emerald-50 text-emerald-400 theme-light:text-emerald-800 border border-emerald-800/40'
                                : 'bg-amber-950/80 theme-light:bg-amber-50 text-amber-400 theme-light:text-amber-800 border border-amber-800/40'
                            }`}
                          >
                            {habit.habitType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs">
                          <span className="flex items-center gap-1 text-amber-400 theme-light:text-amber-800 font-bold text-sm">
                            <Flame className="w-4 h-4 fill-amber-400" />
                            {habit.currentStreak} ngày
                          </span>
                          <span className="text-zinc-500">(Kỷ lục: {habit.bestStreak} ngày)</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
                        {/* Đã check-in hôm nay thì nút phải NÓI RA điều đó và khoá lại:
                            trước đây nút bấm được vô hạn, mỗi lần bấm streak lại nhảy
                            thêm một ngày. */}
                        <button
                          onClick={() => handleLogHabit(habit.id)}
                          disabled={habit.lastLoggedAt === today || loggingHabitId === habit.id}
                          className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 enabled:hover:bg-emerald-600/30 text-emerald-300 theme-light:text-emerald-800 border border-emerald-500/30 text-xs font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {habit.lastLoggedAt === today
                            ? 'Đã xong hôm nay ✓'
                            : loggingHabitId === habit.id
                              ? 'Đang ghi nhận…'
                              : 'Hoàn thành hôm nay'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Wellbeing */}
          {activeTab === 'wellbeing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">
                  Nhật Ký Sức Khỏe & Tâm Trạng
                </h3>
                <button
                  onClick={() => setShowWellbeingModal(true)}
                  className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-[#fff] text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Check-in Tâm Trạng
                </button>
              </div>

              {wellbeingChecks.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có lượt check-in nào. Hãy ghi nhận trạng thái của bạn hôm nay!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wellbeingChecks.map((check) => (
                    <div
                      key={check.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                        <span className="font-medium text-zinc-300">
                          {new Date(check.checkedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center my-3">
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                          <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                            <Smile className="w-3 h-3 text-emerald-400 theme-light:text-emerald-800" />{' '}
                            Tâm trạng
                          </div>
                          <div className="text-base font-bold text-zinc-100 mt-1">
                            {check.moodScore}/10
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                          <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400 theme-light:text-amber-800" />{' '}
                            Năng lượng
                          </div>
                          <div className="text-base font-bold text-zinc-100 mt-1">
                            {check.energyScore}/10
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                          <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                            <Activity className="w-3 h-3 text-rose-400 theme-light:text-rose-800" />{' '}
                            Căng thẳng
                          </div>
                          <div className="text-base font-bold text-zinc-100 mt-1">
                            {check.stressScore}/10
                          </div>
                        </div>
                      </div>
                      {check.notes && (
                        <p className="text-xs text-zinc-300 mt-2 italic bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                          &quot;{check.notes}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Plans */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">Kế Hoạch Cuộc Sống</h3>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-[#fff] text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tạo kế hoạch
                </button>
              </div>

              {plans.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có kế hoạch nào được tạo.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-zinc-100 text-base">{p.title}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                            {p.planType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          {p.periodStart} → {p.periodEnd}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 uppercase font-medium">
                          Trạng thái: <span className="text-zinc-200">{p.status}</span>
                        </span>
                        <button
                          onClick={() =>
                            updateLifePlanStatus(
                              p.id,
                              p.status === 'completed' ? 'active' : 'completed',
                            ).then(loadData)
                          }
                          className="tap-44 text-xs text-rose-400 theme-light:text-rose-800 hover:text-rose-300 transition font-medium"
                        >
                          {p.status === 'completed' ? 'Mở lại' : 'Hoàn tất'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Milestones */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">
                  Cột Mốc Phát Triển Cá Nhân
                </h3>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-[#fff] text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm cột mốc
                </button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có cột mốc nào được lưu lại.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6 my-2">
                  {milestones.map((m) => (
                    <div key={m.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-zinc-950" />
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-zinc-100 text-sm">{m.title}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-yellow-400 theme-light:text-yellow-800 border border-zinc-700 uppercase">
                            {m.area}
                          </span>
                        </div>
                        {m.achievedAt && (
                          <div className="text-xs text-zinc-500 mt-0.5">
                            Đạt được: {m.achievedAt}
                          </div>
                        )}
                        {m.description && (
                          <p className="text-xs text-zinc-400 mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Habit */}
      {showHabitModal && (
        <Modal title="Thêm Thói Quen Mới" onClose={() => setShowHabitModal(false)}>
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div>
              <Field label="Tên thói quen" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={habitForm.title}
                    onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                    placeholder="VD: Luyện phát âm 15 phút, Đọc sách"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="life-habit-goal"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Mục tiêu thói quen
                </label>
                <select
                  id="life-habit-goal"
                  value={habitForm.habitType}
                  onChange={(e) =>
                    setHabitForm({
                      ...habitForm,
                      habitType: e.target.value as 'build' | 'break',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="build">Build (Xây dựng)</option>
                  <option value="break">Break (Bỏ thói quen xấu)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="life-habit-frequency"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Tần suất
                </label>
                <select
                  id="life-habit-frequency"
                  value={habitForm.frequency}
                  onChange={(e) =>
                    setHabitForm({
                      ...habitForm,
                      frequency: e.target.value as 'daily' | 'weekly' | 'custom',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="daily">Hàng ngày (Daily)</option>
                  <option value="weekly">Hàng tuần (Weekly)</option>
                  <option value="custom">Tùy biến</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHabitModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Tạo Thói Quen'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Wellbeing */}
      {showWellbeingModal && (
        <Modal title="Check-in Sức Khỏe & Tâm Trạng" onClose={() => setShowWellbeingModal(false)}>
          <form onSubmit={handleRecordWellbeing} className="space-y-4">
            <div>
              <label
                htmlFor="life-wellbeing-mood"
                className="flex justify-between text-xs font-medium text-zinc-400 mb-1"
              >
                <span>Tâm trạng (Mood): {wellbeingForm.moodScore}/10</span>
              </label>
              <input
                id="life-wellbeing-mood"
                type="range"
                min={1}
                max={10}
                value={wellbeingForm.moodScore}
                onChange={(e) =>
                  setWellbeingForm({ ...wellbeingForm, moodScore: Number(e.target.value) })
                }
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label
                htmlFor="life-wellbeing-energy"
                className="flex justify-between text-xs font-medium text-zinc-400 mb-1"
              >
                <span>Mức năng lượng (Energy): {wellbeingForm.energyScore}/10</span>
              </label>
              <input
                id="life-wellbeing-energy"
                type="range"
                min={1}
                max={10}
                value={wellbeingForm.energyScore}
                onChange={(e) =>
                  setWellbeingForm({ ...wellbeingForm, energyScore: Number(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="life-wellbeing-stress"
                className="flex justify-between text-xs font-medium text-zinc-400 mb-1"
              >
                <span>Mức căng thẳng (Stress): {wellbeingForm.stressScore}/10</span>
              </label>
              <input
                id="life-wellbeing-stress"
                type="range"
                min={1}
                max={10}
                value={wellbeingForm.stressScore}
                onChange={(e) =>
                  setWellbeingForm({ ...wellbeingForm, stressScore: Number(e.target.value) })
                }
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <Field label="Ghi chú thêm">
                {(id) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={wellbeingForm.notes}
                    onChange={(e) => setWellbeingForm({ ...wellbeingForm, notes: e.target.value })}
                    placeholder="Hôm nay bạn cảm thấy thế nào? Có điều gì đáng nhớ..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWellbeingModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Lưu Check-in'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Plan */}
      {showPlanModal && (
        <Modal title="Tạo Kế Hoạch Cuộc Sống" onClose={() => setShowPlanModal(false)}>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <Field label="Tiêu đề kế hoạch" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={planForm.title}
                    onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                    placeholder="VD: Kế hoạch rèn luyện Q4"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div>
              <label
                htmlFor="life-plan-cycle"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Loại chu kỳ
              </label>
              <select
                id="life-plan-cycle"
                value={planForm.planType}
                onChange={(e) =>
                  setPlanForm({ ...planForm, planType: e.target.value as LifePlan['planType'] })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
              >
                <option value="daily">Hàng ngày (Daily)</option>
                <option value="weekly">Hàng tuần (Weekly)</option>
                <option value="monthly">Hàng tháng (Monthly)</option>
                <option value="quarterly">Hàng quý (Quarterly)</option>
                <option value="yearly">Hàng năm (Yearly)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Ngày bắt đầu" required>
                  {(id) => (
                    <input
                      id={id}
                      type="date"
                      required
                      value={planForm.periodStart}
                      onChange={(e) => setPlanForm({ ...planForm, periodStart: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Ngày kết thúc" required>
                  {(id) => (
                    <input
                      id={id}
                      type="date"
                      required
                      value={planForm.periodEnd}
                      onChange={(e) => setPlanForm({ ...planForm, periodEnd: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Lưu Kế Hoạch'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Milestone */}
      {showMilestoneModal && (
        <Modal title="Thêm Cột Mốc Bản Thân" onClose={() => setShowMilestoneModal(false)}>
          <form onSubmit={handleCreateMilestone} className="space-y-4">
            <div>
              <Field label="Tiêu đề cột mốc" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    placeholder="VD: Đạt chứng chỉ IELTS 7.5, Mua nhà đầu tiên"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="life-milestone-domain"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Lĩnh vực
                </label>
                <select
                  id="life-milestone-domain"
                  value={milestoneForm.area}
                  onChange={(e) =>
                    setMilestoneForm({
                      ...milestoneForm,
                      area: e.target.value as GrowthMilestone['area'],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="learning">Học tập (Learning)</option>
                  <option value="career">Sự nghiệp (Career)</option>
                  <option value="health">Sức khỏe (Health)</option>
                  <option value="finances">Tài chính (Finances)</option>
                  <option value="relationships">Mối quan hệ</option>
                  <option value="creativity">Sáng tạo</option>
                  <option value="spirituality">Tâm thức</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <Field label="Ngày hoàn thành">
                  {(id) => (
                    <input
                      id={id}
                      type="date"
                      value={milestoneForm.achievedAt}
                      onChange={(e) =>
                        setMilestoneForm({ ...milestoneForm, achievedAt: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div>
              <Field label="Mô tả chi tiết">
                {(id) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={milestoneForm.description}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, description: e.target.value })
                    }
                    placeholder="Cảm xúc, ý nghĩa của cột mốc..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-rose-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMilestoneModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Lưu Cột Mốc'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageShell>
  )

  if (embedded) return body

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Nền Tảng Cuộc Sống" />
      {body}
    </div>
  )
}
