import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Send,
  CheckCircle2,
  RotateCcw,
  BookMarked,
  BookOpen,
  Flame,
  Camera,
  Calendar,
  Loader2,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { getSubjectDetails } from '../lib/subjectApi'
import { solveProblemImage } from '../lib/visionSolverApi'
import IntegrationsModal from '../components/IntegrationsModal'
import { STEM_CURRICULUM } from '../data/stemCurriculum'
import type { SubjectManifest } from '../../../../packages/core-contracts/subjectManifest'

interface SolvedStep {
  title: string
  detail: string
  formula?: string
}

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const nav = useNavigate()
  const [subject, setSubject] = useState<SubjectManifest | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string>('grade_12')
  const [activeTab, setActiveTab] = useState<'solver' | 'curriculum' | 'practice'>('solver')
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | 'basic' | 'intermediate' | 'advanced'
  >('all')
  const [problemInput, setProblemInput] = useState('')
  const [solving, setSolving] = useState(false)
  const [solutionSteps, setSolutionSteps] = useState<SolvedStep[] | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string
      setImagePreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleVisionSolve = async () => {
    if (!imagePreview || !subjectId) return
    setSolving(true)
    try {
      const res = await solveProblemImage({
        imageBase64: imagePreview,
        subjectId,
        gradeLevel: selectedGrade,
        userPrompt: problemInput || undefined,
      })
      setProblemInput(res.problemText)
      setSolutionSteps(res.steps)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi phân tích ảnh đề bài'
      alert(msg)
    } finally {
      setSolving(false)
    }
  }

  useEffect(() => {
    if (!subjectId) return
    getSubjectDetails(subjectId)
      .then((s) => {
        setSubject(s)
        if (s.standardLevels.length > 0) {
          setSelectedGrade(s.standardLevels[0]!)
        }
      })
      .catch(() => {
        nav('/subjects')
      })
  }, [subjectId, nav])

  const curriculumList = subjectId ? STEM_CURRICULUM[subjectId] || [] : []
  const currentGradeData =
    curriculumList.find((g) => g.grade === selectedGrade) || curriculumList[0]

  const handleSolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!problemInput.trim()) return

    setSolving(true)
    setTimeout(() => {
      const isMath = subjectId === 'mathematics'
      const isChem = subjectId === 'chemistry'
      const isPhys = subjectId === 'physics'

      if (isMath) {
        setSolutionSteps([
          {
            title: 'Bước 1: Xác định tập xác định & Đạo hàm',
            detail: 'Tập xác định D = R. Lấy đạo hàm bậc nhất của hàm số:',
            formula: "y' = 3x^2 - 6x = 3x(x - 2)",
          },
          {
            title: 'Bước 2: Tìm nghiệm của đạo hàm (Điểm dừng)',
            detail: "Giải phương trình y' = 0:",
            formula: '3x(x - 2) = 0 ⇔ x = 0 hoặc x = 2',
          },
          {
            title: 'Bước 3: Lập bảng biến thiên & Xét dấu',
            detail:
              "Trên (-∞, 0) và (2, +∞): y' > 0 (Hàm số đồng biến). Trên khoảng (0, 2): y' < 0 (Hàm số nghịch biến).",
          },
          {
            title: 'Bước 4: Kết luận cực trị',
            detail: 'Hàm số đạt Cực đại tại x = 0 (y_CD = 2); đạt Cực tiểu tại x = 2 (y_CT = -2).',
            formula: 'y_cực đại = 2, y_cực tiểu = -2',
          },
        ])
      } else if (isChem) {
        setSolutionSteps([
          {
            title: 'Bước 1: Xác định sự thay đổi số oxi hóa',
            detail:
              'Fe(0) → Fe(+3) + 3e (Quá trình oxi hóa)\nN(+5) + 3e → N(+2) (Quá trình khử trong NO)',
          },
          {
            title: 'Bước 2: Thăng bằng electron',
            detail: 'Nhân hệ số 1 cho cả quá trình oxi hóa và quá trình khử (3e = 3e).',
            formula: '1 x | Fe → Fe(+3) + 3e\n1 x | N(+5) + 3e → N(+2)',
          },
          {
            title: 'Bước 3: Cân bằng số nguyên tử nguyên tố & Phân tử nước',
            detail: 'Đặt hệ số vào phương trình hóa học hoàn chỉnh:',
            formula: 'Fe + 4HNO3 (loãng) → Fe(NO3)3 + NO↑ + 2H2O',
          },
        ])
      } else if (isPhys) {
        setSolutionSteps([
          {
            title: 'Bước 1: Tóm tắt giả thiết và đổi đơn vị',
            detail: 'm = 200g = 0.2 kg; k = 50 N/m; Biên độ A = 4 cm = 0.04 m.',
          },
          {
            title: 'Bước 2: Tính tần số góc ω và chu kỳ T',
            detail: 'Tần số góc ω = √(k / m) = √(50 / 0.2) = √250 ≈ 15.81 rad/s.',
            formula: 'T = 2π / ω = 2π / 15.81 ≈ 0.397 (s)',
          },
          {
            title: 'Bước 3: Tính vận tốc cực đại',
            detail: 'Vận tốc cực đại của vật khi qua vị trí cân bằng:',
            formula: 'v_max = ω * A = 15.81 * 0.04 = 0.632 (m/s) = 63.2 (cm/s)',
          },
        ])
      } else {
        setSolutionSteps([
          {
            title: 'Bước 1: Xác định kiểu gen của P',
            detail: 'P: Cây hạt vàng dị hợp có kiểu gen Aa.',
          },
          {
            title: 'Bước 2: Sơ đồ lai tự thụ phấn',
            detail: 'P: Aa x Aa\nGiao tử: G_P = (1/2 A : 1/2 a) x (1/2 A : 1/2 a)',
            formula: 'F1: 1/4 AA : 2/4 Aa : 1/4 aa',
          },
          {
            title: 'Bước 3: Tỉ lệ phân ly kiểu hình',
            detail:
              'Tỉ lệ kiểu hình: 3 Hạt vàng (1 AA : 2 Aa) : 1 Hạt xanh (1 aa) (75% vàng : 25% xanh).',
          },
        ])
      }
      setSolving(false)
    }, 600)
  }

  const loadSampleProblem = (prompt: string, steps?: SolvedStep[]) => {
    setProblemInput(prompt)
    if (steps) {
      setSolutionSteps(steps)
    } else {
      setSolutionSteps(null)
    }
    setActiveTab('solver')
  }

  if (!subject) return null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/subjects')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={`Gia Sư AI: ${subject.label}`}
          subtitle={`Phòng học thông minh và giải bài tập từng bước (${subject.description})`}
        />

        {/* Khối chọn khối lớp */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-accent-400" />
            <span className="text-sm font-semibold text-white">Khối lớp / Cấp độ:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {subject.standardLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedGrade(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedGrade === lvl
                    ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {lvl.replace('grade_', 'Lớp ').toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Tab chuyển đổi tính năng: Giải bài tập AI vs Kho chương trình vs Luyện tập */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('solver')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === 'solver'
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Giải Bài Tập</span>
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === 'curriculum'
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chương Trình & Công Thức ({currentGradeData?.chapters.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`tap-44 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
              activeTab === 'practice'
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Bài Tập Trọng Tâm</span>
          </button>
        </div>

        {/* TAB 1: AI SOLVER */}
        {activeTab === 'solver' && (
          <div className="space-y-6">
            {/* Khung giải bài tập */}
            <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-400" />
                  <span>Nhập đề bài hoặc câu hỏi cần giải</span>
                </h3>
                {problemInput && (
                  <button
                    onClick={() => {
                      setProblemInput('')
                      setSolutionSteps(null)
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Xóa
                  </button>
                )}
              </div>

              <form onSubmit={handleSolve} className="space-y-3">
                <textarea
                  value={problemInput}
                  onChange={(e) => setProblemInput(e.target.value)}
                  placeholder={`Nhập đề bài ${subject.label} (hoặc bấm biểu tượng máy ảnh bên dưới để tải ảnh chụp đề bài)...`}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-accent-500 leading-relaxed placeholder:text-zinc-600 resize-none"
                />

                {/* Khối xem trước ảnh đề bài nếu có */}
                {imagePreview && (
                  <div className="relative inline-block border border-indigo-500/40 rounded-xl overflow-hidden bg-zinc-950 p-1.5">
                    <img
                      src={imagePreview}
                      alt="Đề bài chụp"
                      className="max-h-40 rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="tap-44 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition"
                    >
                      <Camera className="w-4 h-4 text-indigo-400" />
                      <span>{imagePreview ? 'Đổi ảnh đề bài' : 'Chụp / Tải ảnh đề'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCalendarModalOpen(true)}
                      className="tap-44 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>Lên lịch học Google</span>
                    </button>
                  </div>

                  <div>
                    {imagePreview ? (
                      <button
                        type="button"
                        onClick={handleVisionSolve}
                        disabled={solving}
                        className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm transition shadow-md shadow-indigo-500/20 active:scale-[0.98]"
                      >
                        {solving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>AI Vision đang giải…</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Giải từ hình ảnh (Vision)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={solving || !problemInput.trim()}
                        className="tap-44 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-white font-semibold text-sm transition shadow-md shadow-accent-500/20 active:scale-[0.98]"
                      >
                        {solving ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin" />
                            <span>AI đang giải…</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Phân tích & Giải từng bước</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>

            {/* Kết quả lời giải từng bước */}
            {solutionSteps && (
              <section className="bg-zinc-900/90 border border-accent-500/30 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Lời Giải Chi Tiết Từng Bước (AI Step Analysis)
                  </h3>
                </div>

                <div className="space-y-4">
                  {solutionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/80 space-y-2"
                    >
                      <h4 className="text-sm font-semibold text-accent-300">{step.title}</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {step.detail}
                      </p>
                      {step.formula && (
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-300 overflow-x-auto">
                          {step.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 2: CURRICULUM & FORMULAS */}
        {activeTab === 'curriculum' && currentGradeData && (
          <div className="space-y-4">
            {currentGradeData.chapters.map((chap) => (
              <div
                key={chap.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{chap.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{chap.description}</p>
                  </div>
                </div>

                {/* Danh sách công thức cốt lõi */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-semibold text-accent-300 uppercase tracking-wider block">
                    Công thức & Định lý cốt lõi:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {chap.keyFormulas.map((kf, i) => (
                      <div
                        key={i}
                        className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1"
                      >
                        <p className="text-xs font-medium text-zinc-300">{kf.name}</p>
                        <p className="text-xs font-mono text-amber-300 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                          {kf.formula}
                        </p>
                        {kf.note && <p className="text-[11px] text-zinc-500 italic">{kf.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: PRACTICE PROBLEMS */}
        {activeTab === 'practice' && currentGradeData && (
          <div className="space-y-4">
            {/* Bộ lọc độ khó */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Độ khó:</span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'basic', label: 'Cơ bản' },
                { id: 'intermediate', label: 'Vận dụng' },
                { id: 'advanced', label: 'Vận dụng cao' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() =>
                    setDifficultyFilter(diff.id as 'all' | 'basic' | 'intermediate' | 'advanced')
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    difficultyFilter === diff.id
                      ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/20'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>

            {currentGradeData.chapters
              .flatMap((c) => c.sampleProblems)
              .filter((prob) => difficultyFilter === 'all' || prob.difficulty === difficultyFilter)
              .map((prob) => (
                <div
                  key={prob.id}
                  className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 space-y-3 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-2 border ${
                          prob.difficulty === 'basic'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : prob.difficulty === 'intermediate'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {prob.difficulty === 'basic'
                          ? 'Cơ bản'
                          : prob.difficulty === 'intermediate'
                            ? 'Vận dụng'
                            : 'Vận dụng cao'}
                      </span>
                      <h4 className="text-sm font-bold text-white inline">{prob.title}</h4>
                    </div>
                    <button
                      onClick={() => loadSampleProblem(prob.prompt, prob.solutionSteps)}
                      className="tap-44 px-3 py-1.5 rounded-xl bg-accent-500 text-white font-semibold text-xs transition shadow-sm hover:bg-accent-400 shrink-0"
                    >
                      Xem Lời Giải AI →
                    </button>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                    {prob.prompt}
                  </p>
                </div>
              ))}
          </div>
        )}
      </main>

      <IntegrationsModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        itemType="study_schedule"
        itemData={{
          title: `Học ${subject.label} (${selectedGrade.replace('grade_', 'Lớp ')})`,
          description: `Phiên học và giải bài tập ${subject.label} trên Đồng Hành AI: ${window.location.href}`,
        }}
      />
    </div>
  )
}
