// apps/dhcb/src/pages/Career.tsx — Career Hub UI (V2-13)
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  Plus,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
  TrendingUp,
  DollarSign,
  Award,
  Sparkles,
} from 'lucide-react'
import Modal from '../../../components/Modal'
import Field from '../../../components/Field'
import LoadError from '../../../components/LoadError'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'
import {
  fetchCareerProfile,
  saveCareerProfile,
  listCareerExperiences,
  addCareerExperience,
  listCareerGoals,
  createCareerGoal,
  fetchCareerSkillGap,
  saveSkillSelfLevel,
} from '../../../lib/careerApi'
import type {
  CareerProfile,
  CareerExperience,
  CareerGoal,
  CareerSkillGapAnalysis,
} from '@dhcb/core-contracts/career'
import { PROFICIENCY_BAND_LABELS, type ProficiencyBand } from '@dhcb/core-contracts/careerInterview'

// Thang bậc dùng chung toàn nền tảng (Dreyfus) — xem
// docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md mục 6.2.
const BANDS = Object.keys(PROFICIENCY_BAND_LABELS) as ProficiencyBand[]

// `embedded` = đang được nhúng trong trang gộp "Sự nghiệp & Khởi nghiệp"
// (không dựng Layout riêng, đầu trang xuống h2 để trang gộp giữ đúng MỘT h1).
export default function Career({ embedded = false }: { embedded?: boolean } = {}) {
  const nav = useNavigate()
  const toast = useToast()
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [experiences, setExperiences] = useState<CareerExperience[]>([])
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [skillGap, setSkillGap] = useState<CareerSkillGapAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  // Lỗi TẢI dữ liệu — tách khỏi trạng thái rỗng, xem components/LoadError.tsx.
  const [loadError, setLoadError] = useState<string | null>(null)
  // Chặn gửi trùng: mạng chậm mà bấm "Lưu" hai lần sẽ tạo ra hai bản ghi.
  const [submitting, setSubmitting] = useState(false)
  const [skillGapLoading, setSkillGapLoading] = useState(false)
  // Kỹ năng đang được lưu bậc — chặn bấm liên tiếp và cho người dùng thấy phản hồi.
  const [savingSkill, setSavingSkill] = useState<string | null>(null)

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)

  // Form states
  const [profileForm, setProfileForm] = useState({
    targetRole: '',
    currentTitle: '',
    yearsOfExperience: 0,
    industry: '',
    targetSalaryMin: 0,
    targetSalaryMax: 0,
    currency: 'VND',
  })

  const [expForm, setExpForm] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    achievements: '',
  })

  const [goalForm, setGoalForm] = useState({
    targetTitle: '',
    targetCompanyType: '',
    timeframe: '',
    skillsRequired: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [profData, expData, goalData] = await Promise.all([
        fetchCareerProfile(),
        listCareerExperiences(),
        listCareerGoals(),
      ])
      setProfile(profData)
      if (profData) {
        setProfileForm({
          targetRole: profData.targetRole,
          currentTitle: profData.currentTitle || '',
          yearsOfExperience: profData.yearsOfExperience,
          industry: profData.industry || '',
          targetSalaryMin: profData.targetSalaryMin || 0,
          targetSalaryMax: profData.targetSalaryMax || 0,
          currency: profData.currency || 'VND',
        })
      }
      setExperiences(expData)
      setGoals(goalData)
      if (goalData.length > 0 && !selectedGoalId) {
        setSelectedGoalId(goalData[0]!.id)
      }
      setLoadError(null)
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu sự nghiệp')
    } finally {
      setLoading(false)
    }
  }, [selectedGoalId])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve().then(loadData)
  }, [loadData])

  const loadSkillGap = useCallback(async (goalId: string) => {
    setSkillGapLoading(true)
    try {
      const gap = await fetchCareerSkillGap(goalId)
      setSkillGap(gap)
    } catch {
      setSkillGap(null)
    } finally {
      setSkillGapLoading(false)
    }
  }, [])

  useEffect(() => {
    // setState phải nằm trong callback bất đồng bộ (luật react-hooks/set-state-in-effect).
    void Promise.resolve().then(() => {
      if (selectedGoalId) {
        return loadSkillGap(selectedGoalId)
      }
      setSkillGap(null)
    })
  }, [selectedGoalId, loadSkillGap])

  // Người dùng tự chấm bậc thành thạo cho một kỹ năng, rồi tải lại bảng phân tích để thấy
  // khoảng cách cập nhật ngay.
  const handleSetSkillBand = useCallback(
    async (skill: string, selfBand: ProficiencyBand) => {
      if (savingSkill) return
      setSavingSkill(skill)
      try {
        await saveSkillSelfLevel({ skill, selfBand })
        if (selectedGoalId) await loadSkillGap(selectedGoalId)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không lưu được mức thành thạo')
      } finally {
        setSavingSkill(null)
      }
    },
    [savingSkill, selectedGoalId, loadSkillGap, toast],
  )

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const saved = await saveCareerProfile({
        targetRole: profileForm.targetRole,
        currentTitle: profileForm.currentTitle || undefined,
        yearsOfExperience: Number(profileForm.yearsOfExperience),
        industry: profileForm.industry || undefined,
        targetSalaryMin: profileForm.targetSalaryMin
          ? Number(profileForm.targetSalaryMin)
          : undefined,
        targetSalaryMax: profileForm.targetSalaryMax
          ? Number(profileForm.targetSalaryMax)
          : undefined,
        currency: profileForm.currency,
      })
      setProfile(saved)
      setShowProfileModal(false)
      toast.success('Đã lưu hồ sơ sự nghiệp thành công!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu hồ sơ')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const achievements = expForm.achievements
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const created = await addCareerExperience({
        company: expForm.company,
        role: expForm.role,
        startDate: expForm.startDate,
        endDate: expForm.isCurrent ? undefined : expForm.endDate || undefined,
        isCurrent: expForm.isCurrent,
        achievements: achievements.length > 0 ? achievements : undefined,
      })
      setExperiences((prev) => [created, ...prev])
      setShowExperienceModal(false)
      setExpForm({
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        achievements: '',
      })
      toast.success('Đã thêm kinh nghiệm làm việc!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi thêm kinh nghiệm')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const skills = goalForm.skillsRequired
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (skills.length === 0) {
        toast.error('Vui lòng nhập ít nhất một kỹ năng yêu cầu')
        return
      }
      const created = await createCareerGoal({
        targetTitle: goalForm.targetTitle,
        targetCompanyType: goalForm.targetCompanyType || undefined,
        timeframe: goalForm.timeframe || undefined,
        skillsRequired: skills,
      })
      setGoals((prev) => [created, ...prev])
      setSelectedGoalId(created.id)
      setShowGoalModal(false)
      setGoalForm({
        targetTitle: '',
        targetCompanyType: '',
        timeframe: '',
        skillsRequired: '',
      })
      toast.success('Đã thêm mục tiêu sự nghiệp!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo mục tiêu')
    } finally {
      setSubmitting(false)
    }
  }

  const body = (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {embedded ? (
          <div className="mb-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              Không Gian Sự Nghiệp (Career Hub)
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">
              Định vị lộ trình nghề nghiệp, kinh nghiệm và phân tích khoảng cách kỹ năng với AI
            </p>
          </div>
        ) : (
          <PageHeader
            title="Không Gian Sự Nghiệp (Career Hub)"
            subtitle="Định vị lộ trình nghề nghiệp, kinh nghiệm và phân tích khoảng cách kỹ năng với AI"
            className="mb-0"
          />
        )}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => nav('/career/interview')}
            className="tap-44 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold transition shadow-sm"
            title="Phòng Luyện Phỏng Vấn AI"
          >
            <Sparkles className="w-4 h-4" />
            Luyện Phỏng Vấn AI
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="tap-44 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-800 transition shadow-sm"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-400 theme-light:text-emerald-800 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Đang tải dữ liệu sự nghiệp...</p>
        </div>
      ) : loadError ? (
        // Lỗi TẢI phải được ưu tiên hơn trạng thái rỗng: nếu không, mất mạng lại
        // hiện ra đúng màn "chưa có gì" và người dùng tưởng mất dữ liệu.
        <div className="mt-6">
          <LoadError message={loadError} onRetry={() => void loadData()} retrying={loading} />
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {/* 1. Career Profile Card */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 theme-light:text-emerald-800 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                    {profile?.targetRole || 'Chưa thiết lập vị trí mục tiêu'}
                    {profile && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 theme-light:bg-emerald-50 text-emerald-400 theme-light:text-emerald-800 border border-emerald-800/40">
                        {profile.yearsOfExperience} năm kinh nghiệm
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    {profile?.currentTitle
                      ? `Hiện tại: ${profile.currentTitle}`
                      : 'Chưa có chức danh hiện tại'}
                    {profile?.industry && ` • Ngành: ${profile.industry}`}
                  </p>
                  {(profile?.targetSalaryMin || profile?.targetSalaryMax) && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 theme-light:text-amber-800 mt-2 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      Mức lương kỳ vọng: {profile.targetSalaryMin?.toLocaleString()} -{' '}
                      {profile.targetSalaryMax?.toLocaleString()} {profile.currency}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="tap-44 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#fff] text-sm font-semibold shadow-lg shadow-emerald-900/30 transition self-start md:self-auto"
              >
                {profile ? 'Chỉnh sửa hồ sơ' : 'Thiết lập hồ sơ'}
              </button>
            </div>
          </div>

          {/* 2. Grid: Goals & Skill Gap on Left, Experiences on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Goals & Skill Gap Analysis */}
            <div className="lg:col-span-7 space-y-6">
              {/* Career Goals */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400 theme-light:text-indigo-800" />
                    Mục Tiêu Sự Nghiệp ({goals.length})
                  </h3>
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 theme-light:text-indigo-800 border border-indigo-500/30 text-xs font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm mục tiêu
                  </button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Chưa có mục tiêu nào. Nhấn &quot;Thêm mục tiêu&quot; để thiết lập đích đến nghề
                    nghiệp!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {goals.map((g) => {
                      const isSelected = selectedGoalId === g.id
                      return (
                        // Trước đây là <div onClick>: không focus được bằng bàn phím,
                        // Enter/Space không kích hoạt. Đây là nút CHỌN nên dùng
                        // <button> + aria-pressed để trình đọc màn hình biết mục nào
                        // đang được chọn.
                        <button
                          key={g.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedGoalId(g.id)}
                          className={`tap-44 w-full text-left p-4 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/30 theme-light:bg-indigo-50 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                              : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-zinc-100 text-sm">{g.targetTitle}</h4>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                              {g.status}
                            </span>
                          </div>
                          {g.targetCompanyType && (
                            <p className="text-xs text-zinc-400 mt-1">
                              Loại hình: {g.targetCompanyType}
                            </p>
                          )}
                          {g.timeframe && (
                            <p className="text-xs text-indigo-400/80 theme-light:text-indigo-800/80 mt-0.5 font-medium">
                              Khung thời gian: {g.timeframe}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {g.skillsRequired.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Skill Gap Analysis */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 theme-light:text-amber-800" />
                    Phân Tích Khoảng Cách Kỹ Năng (Skill Gap Analysis)
                  </h3>
                </div>

                {skillGapLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-amber-400 theme-light:text-amber-800 animate-spin mr-2" />
                    <span className="text-zinc-400 text-sm">Đang phân tích kỹ năng...</span>
                  </div>
                ) : !selectedGoalId ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Chọn một mục tiêu ở trên để xem phân tích khoảng cách kỹ năng.
                  </div>
                ) : !skillGap || skillGap.gaps.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    Chưa có dữ liệu phân tích khoảng cách kỹ năng cho mục tiêu này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {skillGap.gaps.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.isFulfilled ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 theme-light:text-emerald-800 shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-400 theme-light:text-amber-800 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-zinc-200">
                                {item.skill}
                              </div>
                              <div className="text-xs text-zinc-400">
                                Yêu cầu:{' '}
                                <span className="text-zinc-300 font-medium">
                                  {item.requiredLevel}
                                </span>
                                {item.currentMastery ? (
                                  <>
                                    {' '}
                                    • Đã đạt:{' '}
                                    <span className="text-emerald-400 theme-light:text-emerald-800 font-medium">
                                      {item.currentMastery}
                                    </span>
                                    {/* Nói rõ con số đến từ đâu — dữ liệu học thật hay tự khai. */}
                                    <span className="text-zinc-500">
                                      {item.source === 'learning_data'
                                        ? ' (theo dữ liệu học của bạn)'
                                        : item.source === 'self_assessment'
                                          ? ' (bạn tự đánh giá)'
                                          : ''}
                                    </span>
                                  </>
                                ) : (
                                  <> • Chưa có dữ liệu</>
                                )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
                              item.isFulfilled
                                ? 'bg-emerald-950/60 theme-light:bg-emerald-50 text-emerald-400 theme-light:text-emerald-800 border-emerald-800/40'
                                : 'bg-amber-950/60 theme-light:bg-amber-50 text-amber-400 theme-light:text-amber-800 border-amber-800/40'
                            }`}
                          >
                            {item.isFulfilled ? 'Đã đáp ứng' : 'Cần trau dồi'}
                          </span>
                        </div>

                        {/* Tự chấm bậc thành thạo. Tiếng Anh đã đo được bằng dữ liệu học thật
                              nên không cần tự khai. */}
                        {item.source !== 'learning_data' && (
                          <div className="flex items-center gap-1.5 flex-wrap pl-8">
                            <span className="text-xs text-zinc-500">Bạn đang ở bậc:</span>
                            {BANDS.map((band) => (
                              <button
                                key={band}
                                onClick={() => handleSetSkillBand(item.skill, band)}
                                disabled={savingSkill === item.skill}
                                title={`${band} — ${PROFICIENCY_BAND_LABELS[band]}`}
                                className={`tap-44 px-2 py-1 rounded-lg text-xs font-medium border transition disabled:opacity-50 ${
                                  item.selfBand === band
                                    ? 'bg-accent-500 text-[#09090b] border-accent-500 font-bold'
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                                }`}
                              >
                                {band}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Experience Timeline */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400 theme-light:text-blue-800" />
                    Kinh Nghiệm Làm Việc ({experiences.length})
                  </h3>
                  <button
                    onClick={() => setShowExperienceModal(true)}
                    className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 theme-light:text-blue-800 border border-blue-500/30 text-xs font-medium transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm
                  </button>
                </div>

                {experiences.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">
                    Chưa có thông tin kinh nghiệm làm việc.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6 my-2">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-zinc-100 text-sm">{exp.role}</h4>
                            {exp.isCurrent && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 theme-light:bg-emerald-50 text-emerald-400 theme-light:text-emerald-800 border border-emerald-800/40">
                                Hiện tại
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium">
                            <Building className="w-3.5 h-3.5 text-zinc-500" />
                            {exp.company}
                            <span className="text-zinc-600">•</span>
                            <span>
                              {exp.startDate} {exp.endDate ? `→ ${exp.endDate}` : '→ Nay'}
                            </span>
                          </div>
                          {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="mt-2.5 space-y-1">
                              {exp.achievements.map((ach, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs text-zinc-400 list-disc list-inside"
                                >
                                  {ach}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profile */}
      {showProfileModal && (
        <Modal title="Thiết Lập Hồ Sơ Sự Nghiệp" onClose={() => setShowProfileModal(false)}>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Field label="Vị trí mục tiêu" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={profileForm.targetRole}
                    onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                    placeholder="VD: Senior Frontend Engineer, AI Product Manager"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Chức danh hiện tại">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={profileForm.currentTitle}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, currentTitle: e.target.value })
                      }
                      placeholder="VD: Fullstack Developer"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Số năm kinh nghiệm">
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      min={0}
                      value={profileForm.yearsOfExperience}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          yearsOfExperience: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div>
              <Field label="Ngành nghề (Industry)">
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                    placeholder="VD: EdTech, Fintech, AI SaaS"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Lương tối thiểu">
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      min={0}
                      value={profileForm.targetSalaryMin}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          targetSalaryMin: Number(e.target.value),
                        })
                      }
                      placeholder="VD: 30000000"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Lương tối đa">
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      min={0}
                      value={profileForm.targetSalaryMax}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          targetSalaryMax: Number(e.target.value),
                        })
                      }
                      placeholder="VD: 50000000"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Lưu Hồ Sơ'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Experience */}
      {showExperienceModal && (
        <Modal title="Thêm Kinh Nghiệm Làm Việc" onClose={() => setShowExperienceModal(false)}>
          <form onSubmit={handleAddExperience} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Công ty" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={expForm.company}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      placeholder="VD: Google, VNG"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Vai trò / Chức danh" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={expForm.role}
                      onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                      placeholder="VD: Software Engineer"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Bắt đầu" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={expForm.startDate}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                      placeholder="VD: 2022-01"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Kết thúc">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      disabled={expForm.isCurrent}
                      value={expForm.endDate}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                      placeholder={expForm.isCurrent ? 'Hiện tại' : 'VD: 2024-06'}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={expForm.isCurrent}
                onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-800 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isCurrent" className="text-xs text-zinc-300">
                Tôi hiện đang làm việc tại đây
              </label>
            </div>
            <div>
              <Field label="Thành tựu chính (Mỗi dòng 1 mục)">
                {(id) => (
                  <textarea
                    id={id}
                    rows={3}
                    value={expForm.achievements}
                    onChange={(e) => setExpForm({ ...expForm, achievements: e.target.value })}
                    placeholder="VD: Thiết kế hệ thống microservices phục vụ 100k người dùng..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExperienceModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Thêm Kinh Nghiệm'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Goal */}
      {showGoalModal && (
        <Modal title="Thêm Mục Tiêu Sự Nghiệp" onClose={() => setShowGoalModal(false)}>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <Field label="Chức danh / Mục tiêu" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={goalForm.targetTitle}
                    onChange={(e) => setGoalForm({ ...goalForm, targetTitle: e.target.value })}
                    placeholder="VD: Tech Lead, Principal Architect"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Loại hình doanh nghiệp">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={goalForm.targetCompanyType}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, targetCompanyType: e.target.value })
                      }
                      placeholder="VD: Big Tech, Startup Series A"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Khung thời gian">
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      value={goalForm.timeframe}
                      onChange={(e) => setGoalForm({ ...goalForm, timeframe: e.target.value })}
                      placeholder="VD: 1-2 năm, Q4 2026"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
            </div>
            <div>
              <Field label="Kỹ năng yêu cầu (*) (Phân cách bằng dấu phẩy)" required>
                {(id) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={goalForm.skillsRequired}
                    onChange={(e) => setGoalForm({ ...goalForm, skillsRequired: e.target.value })}
                    placeholder="VD: System Design, Kubernetes, English C1, Leadership"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="tap-44 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang lưu…' : 'Tạo Mục Tiêu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  )

  if (embedded) return body

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Không Gian Sự Nghiệp" />
      {body}
    </div>
  )
}
