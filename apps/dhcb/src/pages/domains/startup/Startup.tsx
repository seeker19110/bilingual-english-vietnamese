// apps/dhcb/src/pages/Startup.tsx — Startup Hub UI (V2-16)
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Lightbulb,
  FileCheck,
  Plus,
  RefreshCw,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'
import Modal from '../../../components/Modal'
import Field from '../../../components/Field'
import LoadError from '../../../components/LoadError'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'
import {
  listVentures,
  createVenture,
  updateVentureStage,
  listProblems,
  createProblem,
  listHypotheses,
  createHypothesis,
  updateHypothesisStatus,
  listEvidence,
  recordEvidence,
} from '../../../lib/startupApi'
import type { Venture, Problem, Hypothesis, ValidatedEvidence } from '@dhcb/core-contracts/startup'

export default function Startup() {
  const nav = useNavigate()
  const toast = useToast()
  const [ventures, setVentures] = useState<Venture[]>([])
  const [selectedVentureId, setSelectedVentureId] = useState<string>('')
  const [problems, setProblems] = useState<Problem[]>([])
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [evidenceList, setEvidenceList] = useState<ValidatedEvidence[]>([])
  const [loading, setLoading] = useState(true)
  // Lỗi TẢI dữ liệu — tách khỏi trạng thái rỗng, xem components/LoadError.tsx.
  const [loadError, setLoadError] = useState<string | null>(null)
  // Chặn gửi trùng: mạng chậm mà bấm "Lưu" hai lần sẽ tạo ra hai bản ghi.
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'canvas' | 'evidence'>('canvas')

  // Modals
  const [showVentureModal, setShowVentureModal] = useState(false)
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [showHypothesisModal, setShowHypothesisModal] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)

  // Forms
  const [ventureForm, setVentureForm] = useState({
    name: '',
    description: '',
    stage: 'ideation' as Venture['stage'],
  })
  const [problemForm, setProblemForm] = useState({
    statement: '',
    customerSegment: '',
    severity: 'major' as 'critical' | 'major' | 'minor',
  })
  const [hypForm, setHypForm] = useState({
    statement: '',
    hypothesisType: 'solution' as 'market' | 'customer' | 'problem' | 'solution' | 'business_model',
  })
  const [evidenceForm, setEvidenceForm] = useState({
    hypothesisId: '',
    title: '',
    evidenceType: 'interview' as
      'interview' | 'survey' | 'analytics' | 'test' | 'revenue' | 'observation',
    provenance: '',
    findings: '',
    supportsHypothesis: true,
  })

  const loadVentures = useCallback(async () => {
    setLoading(true)
    try {
      const vList = await listVentures()
      setVentures(vList)
      if (vList.length > 0 && !selectedVentureId) {
        setSelectedVentureId(vList[0]!.id)
      }
      setLoadError(null)
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Không thể tải danh sách dự án khởi nghiệp')
    } finally {
      setLoading(false)
    }
  }, [selectedVentureId])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve().then(loadVentures)
  }, [loadVentures])

  const loadVentureDetails = useCallback(
    async (vId: string) => {
      if (!vId) return
      try {
        const [pList, hList, eList] = await Promise.all([
          listProblems(vId),
          listHypotheses(vId),
          listEvidence(vId),
        ])
        setProblems(pList)
        setHypotheses(hList)
        setEvidenceList(eList)
      } catch {
        toast.error('Lỗi khi tải chi tiết dự án')
      }
    },
    [toast],
  )

  useEffect(() => {
    if (selectedVentureId) {
      // setState phải nằm trong callback bất đồng bộ (luật react-hooks/set-state-in-effect).
      void Promise.resolve().then(() => loadVentureDetails(selectedVentureId))
    }
  }, [selectedVentureId, loadVentureDetails])

  const handleCreateVenture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await createVenture({
        name: ventureForm.name,
        description: ventureForm.description || undefined,
        stage: ventureForm.stage,
      })
      setVentures((prev) => [created, ...prev])
      setSelectedVentureId(created.id)
      setShowVentureModal(false)
      setVentureForm({ name: '', description: '', stage: 'ideation' })
      toast.success('Đã tạo dự án khởi nghiệp mới!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo dự án')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStage = async (stage: Venture['stage']) => {
    if (!selectedVentureId) return
    try {
      const updated = await updateVentureStage(selectedVentureId, stage)
      setVentures((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
      toast.success(`Đã chuyển giai đoạn sang: ${stage.toUpperCase()}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật giai đoạn')
    }
  }

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    if (!selectedVentureId) return
    try {
      const created = await createProblem({
        ventureId: selectedVentureId,
        statement: problemForm.statement,
        customerSegment: problemForm.customerSegment,
        severity: problemForm.severity,
      })
      setProblems((prev) => [created, ...prev])
      setShowProblemModal(false)
      setProblemForm({ statement: '', customerSegment: '', severity: 'major' })
      toast.success('Đã ghi nhận bài toán khách hàng!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo bài toán')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateHypothesis = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    if (!selectedVentureId) return
    try {
      const created = await createHypothesis({
        ventureId: selectedVentureId,
        statement: hypForm.statement,
        hypothesisType: hypForm.hypothesisType,
      })
      setHypotheses((prev) => [created, ...prev])
      setShowHypothesisModal(false)
      setHypForm({ statement: '', hypothesisType: 'solution' })
      toast.success('Đã thêm giả thuyết kinh doanh!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo giả thuyết')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateHypothesisStatus = async (
    id: string,
    status: 'unverified' | 'supported' | 'refuted' | 'pivoted',
  ) => {
    try {
      const updated = await updateHypothesisStatus(id, status)
      setHypotheses((prev) => prev.map((h) => (h.id === id ? updated : h)))
      toast.success(`Đã cập nhật trạng thái giả thuyết: ${status}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi cập nhật giả thuyết')
    }
  }

  const handleRecordEvidence = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    if (!selectedVentureId) return
    try {
      const created = await recordEvidence({
        ventureId: selectedVentureId,
        hypothesisId: evidenceForm.hypothesisId || undefined,
        title: evidenceForm.title,
        evidenceType: evidenceForm.evidenceType,
        provenance: evidenceForm.provenance,
        findings: evidenceForm.findings,
        supportsHypothesis: evidenceForm.supportsHypothesis,
      })
      setEvidenceList((prev) => [created, ...prev])
      setShowEvidenceModal(false)
      setEvidenceForm({
        hypothesisId: '',
        title: '',
        evidenceType: 'interview',
        provenance: '',
        findings: '',
        supportsHypothesis: true,
      })
      toast.success('Đã lưu bằng chứng kiểm chứng!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi ghi nhận bằng chứng')
    } finally {
      setSubmitting(false)
    }
  }

  const currentVenture = ventures.find((v) => v.id === selectedVentureId)

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Không Gian Khởi Nghiệp" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <PageHeader
            title="Không Gian Khởi Nghiệp (Startup Hub)"
            subtitle="Khung Lean Canvas, quản lý bài toán thị trường, kiểm chứng giả thuyết và nhật ký bằng chứng"
            className="mb-0"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => nav('/startup/canvas')}
              className="tap-44 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black text-sm font-bold shadow-sm transition"
              title="Khung Lean Canvas 9 Ô"
            >
              <Rocket className="w-4 h-4" />
              Khung Lean Canvas 9 Ô
            </button>
            <button
              onClick={() => setShowVentureModal(true)}
              className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-800 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Dự án mới
            </button>
            <button
              onClick={loadVentures}
              disabled={loading}
              className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-800 transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 theme-light:text-purple-800 animate-spin mb-4" />
            <p className="text-zinc-400 text-sm">Đang tải dữ liệu khởi nghiệp...</p>
          </div>
        ) : loadError ? (
          // Lỗi TẢI phải được ưu tiên hơn trạng thái rỗng: nếu không, mất mạng lại
          // hiện ra đúng màn "chưa có gì" và người dùng tưởng mất dữ liệu.
          <div className="mt-6">
            <LoadError message={loadError} onRetry={() => void loadVentures()} retrying={loading} />
          </div>
        ) : ventures.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl mt-6">
            <Rocket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-200">Chưa có dự án khởi nghiệp nào</h3>
            <p className="text-zinc-400 text-sm mt-1 mb-6">
              Bắt đầu hiện thực hóa ý tưởng khởi nghiệp của bạn với Lean Canvas và AI Companion!
            </p>
            <button
              onClick={() => setShowVentureModal(true)}
              className="tap-44 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-[#fff] text-sm font-semibold shadow-lg shadow-purple-900/30 transition"
            >
              Tạo Dự Án Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {/* Venture Header Banner */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <select
                      aria-label="Chọn dự án khởi nghiệp"
                      value={selectedVentureId}
                      onChange={(e) => setSelectedVentureId(e.target.value)}
                      className="text-xl font-bold bg-transparent text-zinc-100 border-b border-zinc-700 pb-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {ventures.map((v) => (
                        <option key={v.id} value={v.id} className="bg-zinc-900 text-zinc-100">
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 theme-light:bg-purple-50 text-purple-400 theme-light:text-purple-800 border border-purple-800/40 uppercase font-semibold">
                      {currentVenture?.stage}
                    </span>
                  </div>
                  {currentVenture?.description && (
                    <p className="text-sm text-zinc-400 mt-2">{currentVenture.description}</p>
                  )}
                </div>

                {/* Stage Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ideation', 'validation', 'mvp', 'growth', 'scale'] as Venture['stage'][]).map(
                    (stg) => (
                      <button
                        key={stg}
                        onClick={() => handleUpdateStage(stg)}
                        className={`tap-44 text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          currentVenture?.stage === stg
                            ? 'bg-purple-600 text-[#fff] shadow-md'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {stg.toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === 'canvas'
                    ? 'bg-purple-600/20 text-purple-400 theme-light:text-purple-800 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Lean Discovery Canvas ({problems.length + hypotheses.length})
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === 'evidence'
                    ? 'bg-purple-600/20 text-purple-400 theme-light:text-purple-800 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Nhật Ký Bằng Chứng & Kiểm Chứng ({evidenceList.length})
              </button>
            </div>

            {/* Tab 1: Canvas View */}
            {activeTab === 'canvas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Problems Card */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-400 theme-light:text-red-800" />
                      Bài Toán Khách Hàng (Problems)
                    </h3>
                    <button
                      onClick={() => setShowProblemModal(true)}
                      className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 theme-light:text-red-800 border border-red-500/30 text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm bài toán
                    </button>
                  </div>

                  {problems.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">
                      Chưa định nghĩa bài toán khách hàng nào.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {problems.map((p) => (
                        <div
                          key={p.id}
                          className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-zinc-100">{p.statement}</h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase border ${
                                p.severity === 'critical'
                                  ? 'bg-red-950/80 theme-light:bg-red-50 text-red-400 theme-light:text-red-800 border-red-800/40'
                                  : p.severity === 'major'
                                    ? 'bg-amber-950/80 theme-light:bg-amber-50 text-amber-400 theme-light:text-amber-800 border-amber-800/40'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                              }`}
                            >
                              {p.severity}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-2">
                            Đối tượng:{' '}
                            <span className="text-zinc-300 font-medium">{p.customerSegment}</span>
                            {p.evidenceCount > 0 && ` • Đã có ${p.evidenceCount} bằng chứng`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hypotheses Card */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400 theme-light:text-amber-800" />
                      Giả Thuyết Cần Kiểm Chứng (Hypotheses)
                    </h3>
                    <button
                      onClick={() => setShowHypothesisModal(true)}
                      className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 theme-light:text-amber-800 border border-amber-500/30 text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm giả thuyết
                    </button>
                  </div>

                  {hypotheses.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">
                      Chưa có giả thuyết nào cần kiểm chứng.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {hypotheses.map((h) => (
                        <div
                          key={h.id}
                          className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-zinc-100">{h.statement}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                              {h.hypothesisType}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/80">
                            <span
                              className={`text-xs font-medium flex items-center gap-1 ${
                                h.status === 'supported'
                                  ? 'text-emerald-400 theme-light:text-emerald-800'
                                  : h.status === 'refuted'
                                    ? 'text-red-400 theme-light:text-red-800'
                                    : 'text-amber-400 theme-light:text-amber-800'
                              }`}
                            >
                              {h.status === 'supported' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : h.status === 'refuted' ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <HelpCircle className="w-3.5 h-3.5" />
                              )}
                              {h.status.toUpperCase()}
                            </span>

                            <div className="flex items-center gap-1 text-xs">
                              <button
                                onClick={() => handleUpdateHypothesisStatus(h.id, 'supported')}
                                className="tap-44 px-2 py-0.5 rounded bg-emerald-950/60 theme-light:bg-emerald-50 hover:bg-emerald-950 text-emerald-400 theme-light:text-emerald-800 border border-emerald-800/40 text-[11px]"
                              >
                                Xác thực
                              </button>
                              <button
                                onClick={() => handleUpdateHypothesisStatus(h.id, 'refuted')}
                                className="tap-44 px-2 py-0.5 rounded bg-red-950/60 theme-light:bg-red-50 hover:bg-red-950 text-red-400 theme-light:text-red-800 border border-red-800/40 text-[11px]"
                              >
                                Bác bỏ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Evidence Log */}
            {activeTab === 'evidence' && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 theme-light:text-emerald-800" />
                      Nhật Ký Bằng Chứng Đã Xác Thực (Validated Evidence)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Mọi phát hiện cần có nguồn gốc (provenance) rõ ràng để ngăn AI bịa đặt dữ liệu
                      thị trường.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEvidenceModal(true)}
                    className="tap-44 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-[#fff] text-xs font-semibold shadow-md transition shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ghi nhận bằng chứng
                  </button>
                </div>

                {evidenceList.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 text-sm">
                    Chưa có bằng chứng nào được ghi nhận.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evidenceList.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-zinc-100 text-sm">{ev.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                              ev.supportsHypothesis
                                ? 'bg-emerald-950/80 theme-light:bg-emerald-50 text-emerald-400 theme-light:text-emerald-800 border-emerald-800/40'
                                : 'bg-red-950/80 theme-light:bg-red-50 text-red-400 theme-light:text-red-800 border-red-800/40'
                            }`}
                          >
                            {ev.supportsHypothesis ? 'Ủng hộ giả thuyết' : 'Bác bỏ giả thuyết'}
                          </span>
                        </div>
                        <div className="text-xs text-purple-400/90 theme-light:text-purple-800/90 font-medium mt-1">
                          Nguồn: <span className="text-zinc-300 font-normal">{ev.provenance}</span>{' '}
                          • Loại: {ev.evidenceType}
                        </div>
                        <p className="text-xs text-zinc-300 mt-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                          {ev.findings}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Create Venture */}
        {showVentureModal && (
          <Modal title="Tạo Dự Án Khởi Nghiệp" onClose={() => setShowVentureModal(false)}>
            <form onSubmit={handleCreateVenture} className="space-y-4">
              <div>
                <Field label="Tên dự án" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={ventureForm.name}
                      onChange={(e) => setVentureForm({ ...ventureForm, name: e.target.value })}
                      placeholder="VD: EdTech AI Assistant"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-purple-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Giai đoạn ban đầu">
                  {(id) => (
                    <select
                      id={id}
                      value={ventureForm.stage}
                      onChange={(e) =>
                        setVentureForm({
                          ...ventureForm,
                          stage: e.target.value as Venture['stage'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="ideation">Ideation (Hình thành ý tưởng)</option>
                      <option value="validation">Validation (Kiểm chứng thị trường)</option>
                      <option value="mvp">MVP (Sản phẩm tối thiểu)</option>
                      <option value="growth">Growth (Tăng trưởng)</option>
                    </select>
                  )}
                </Field>
              </div>
              <div>
                <Field label="Mô tả tóm tắt">
                  {(id) => (
                    <textarea
                      id={id}
                      rows={3}
                      value={ventureForm.description}
                      onChange={(e) =>
                        setVentureForm({ ...ventureForm, description: e.target.value })
                      }
                      placeholder="Tầm nhìn, mô hình kinh doanh sơ bộ..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-purple-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVentureModal(false)}
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang lưu…' : 'Tạo Dự Án'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Problem */}
        {showProblemModal && (
          <Modal title="Thêm Bài Toán Khách Hàng" onClose={() => setShowProblemModal(false)}>
            <form onSubmit={handleCreateProblem} className="space-y-4">
              <div>
                <Field label="Mô tả bài toán / Nỗi đau" required>
                  {(id) => (
                    <textarea
                      id={id}
                      rows={3}
                      required
                      value={problemForm.statement}
                      onChange={(e) =>
                        setProblemForm({ ...problemForm, statement: e.target.value })
                      }
                      placeholder="VD: Học viên thiếu môi trường luyện nói tiếng Anh tương tác 1-1..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Field label="Phân khúc đối tượng" required>
                    {(id) => (
                      <input
                        id={id}
                        type="text"
                        required
                        value={problemForm.customerSegment}
                        onChange={(e) =>
                          setProblemForm({ ...problemForm, customerSegment: e.target.value })
                        }
                        placeholder="VD: Người đi làm, Sinh viên ĐH"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                      />
                    )}
                  </Field>
                </div>
                <div>
                  <Field label="Mức độ nghiêm trọng">
                    {(id) => (
                      <select
                        id={id}
                        value={problemForm.severity}
                        onChange={(e) =>
                          setProblemForm({
                            ...problemForm,
                            severity: e.target.value as 'critical' | 'major' | 'minor',
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="critical">Critical (Cấp bách)</option>
                        <option value="major">Major (Quan trọng)</option>
                        <option value="minor">Minor (Nhẹ)</option>
                      </select>
                    )}
                  </Field>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang lưu…' : 'Lưu Bài Toán'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Hypothesis */}
        {showHypothesisModal && (
          <Modal
            title="Thêm Giả Thuyết Cần Kiểm Chứng"
            onClose={() => setShowHypothesisModal(false)}
          >
            <form onSubmit={handleCreateHypothesis} className="space-y-4">
              <div>
                <Field label="Nội dung giả thuyết" required>
                  {(id) => (
                    <textarea
                      id={id}
                      rows={3}
                      required
                      value={hypForm.statement}
                      onChange={(e) => setHypForm({ ...hypForm, statement: e.target.value })}
                      placeholder="VD: Người dùng sẵn sàng trả 99k/tháng nếu AI có thể chấm phát âm từng âm vị..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Loại giả thuyết">
                  {(id) => (
                    <select
                      id={id}
                      value={hypForm.hypothesisType}
                      onChange={(e) =>
                        setHypForm({
                          ...hypForm,
                          hypothesisType: e.target.value as
                            'market' | 'customer' | 'problem' | 'solution' | 'business_model',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-amber-500 focus:outline-none"
                    >
                      <option value="solution">Solution (Giải pháp)</option>
                      <option value="customer">Customer (Khách hàng)</option>
                      <option value="business_model">
                        Business Model (Mô hình kinh doanh/Giá)
                      </option>
                      <option value="market">Market (Quy mô thị trường)</option>
                      <option value="problem">Problem (Mức độ tồn tại của vấn đề)</option>
                    </select>
                  )}
                </Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHypothesisModal(false)}
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="tap-44 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-[#fff] text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang lưu…' : 'Tạo Giả Thuyết'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal Evidence */}
        {showEvidenceModal && (
          <Modal title="Ghi Nhận Bằng Chứng Kiểm Chứng" onClose={() => setShowEvidenceModal(false)}>
            <form onSubmit={handleRecordEvidence} className="space-y-4">
              <div>
                <Field label="Tiêu đề bằng chứng" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={evidenceForm.title}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                      placeholder="VD: Khảo sát 50 người dùng thử nghiệm"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Field label="Loại bằng chứng">
                    {(id) => (
                      <select
                        id={id}
                        value={evidenceForm.evidenceType}
                        onChange={(e) =>
                          setEvidenceForm({
                            ...evidenceForm,
                            evidenceType: e.target.value as
                              | 'interview'
                              | 'survey'
                              | 'analytics'
                              | 'test'
                              | 'revenue'
                              | 'observation',
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="interview">Phỏng vấn 1-1 (Interview)</option>
                        <option value="survey">Khảo sát diện rộng (Survey)</option>
                        <option value="analytics">Dữ liệu phân tích (Analytics)</option>
                        <option value="test">A/B Test / Thử nghiệm</option>
                        <option value="revenue">Doanh thu thực tế (Revenue)</option>
                        <option value="observation">Quan sát thực tế (Observation)</option>
                      </select>
                    )}
                  </Field>
                </div>
                <div>
                  <Field label="Giả thuyết liên quan">
                    {(id) => (
                      <select
                        id={id}
                        value={evidenceForm.hypothesisId}
                        onChange={(e) =>
                          setEvidenceForm({ ...evidenceForm, hypothesisId: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">Chung (không gắn giả thuyết)</option>
                        {hypotheses.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.statement.substring(0, 35)}...
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>
              </div>
              <div>
                <Field label="Nguồn gốc / Bằng chứng thực tế (Provenance)" required>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      required
                      value={evidenceForm.provenance}
                      onChange={(e) =>
                        setEvidenceForm({ ...evidenceForm, provenance: e.target.value })
                      }
                      placeholder="VD: Link Google Sheet khảo sát, File ghi âm phỏng vấn #04"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div>
                <Field label="Phát hiện cốt lõi (Findings)" required>
                  {(id) => (
                    <textarea
                      id={id}
                      rows={3}
                      required
                      value={evidenceForm.findings}
                      onChange={(e) =>
                        setEvidenceForm({ ...evidenceForm, findings: e.target.value })
                      }
                      placeholder="85% người dùng phản hồi rằng..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  )}
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="supportsHyp"
                  checked={evidenceForm.supportsHypothesis}
                  onChange={(e) =>
                    setEvidenceForm({ ...evidenceForm, supportsHypothesis: e.target.checked })
                  }
                  className="rounded bg-zinc-950 border-zinc-800 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="supportsHyp" className="text-xs text-zinc-300">
                  Bằng chứng này ủng hộ giả thuyết đã chọn
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
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
                  {submitting ? 'Đang lưu…' : 'Lưu Bằng Chứng'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </main>
    </div>
  )
}
