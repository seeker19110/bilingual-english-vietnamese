// apps/dhcb/src/pages/StartupCanvas.tsx — Interactive 9-Box Lean Canvas (Startup Sub-page)
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Target,
  Users,
  Lightbulb,
  DollarSign,
  PieChart,
  Shield,
  Activity,
  Share2,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'
import { listVentures } from '../../../lib/startupApi'
import type { Venture } from '@dhcb/core-contracts/startup'

interface CanvasState {
  problem: string[]
  customerSegments: string[]
  uniqueValue: string[]
  solution: string[]
  channels: string[]
  revenue: string[]
  cost: string[]
  keyMetrics: string[]
  unfairAdvantage: string[]
}

const DEFAULT_CANVAS: CanvasState = {
  problem: [
    'Người học tiếng Anh thiếu môi trường luyện tập 2 chiều',
    'Chi phí học gia sư 1-kèm-1 truyền thống quá đắt đỏ',
  ],
  customerSegments: [
    'Học sinh, sinh viên luyện thi chứng chỉ CEFR / IELTS',
    'Người đi làm cần nâng cao phản xạ giao tiếp quốc tế',
  ],
  uniqueValue: [
    'Gia sư AI hai chiều: AI phản hồi tiếng Anh và giải thích ngữ pháp bằng tiếng Việt',
    'Personal OS: Tích hợp lộ trình học tập với mục tiêu sự nghiệp và cuộc sống',
  ],
  solution: [
    'Luyện nói song ngữ với độ trễ thấp (<300ms)',
    'Hệ thống sửa lỗi sai tức thời và chấm điểm viết theo chuẩn IELTS',
  ],
  channels: [
    'Truyền miệng qua cộng đồng học tập & TikTok / Facebook shorts',
    'Mô hình giới thiệu bạn bè nhận thưởng Pro (Referral loop)',
  ],
  revenue: [
    'Gói thuê bao Pro / VIP thanh toán linh hoạt qua VietQR / SePay',
    'Gói hỗ trợ theo trường học & doanh nghiệp',
  ],
  cost: [
    'Chi phí hạ tầng máy chủ VPS & Cloudflare R2',
    'Chi phí API model AI tối ưu theo task (Gemini Flash / Claude Haiku)',
  ],
  keyMetrics: [
    'Tỉ lệ giữ chân ngày 7 (D7 Retention > 35%)',
    'Số lượt học trung bình / ngày / người dùng (Sessions/DAU)',
  ],
  unfairAdvantage: [
    'Bộ dữ liệu ngữ liệu và giải thích lỗi tiếng Anh - Việt 12.000 từ chuẩn hóa',
    'Kiến trúc Personal OS Core độc quyền không phụ thuộc vào 1 nhà cung cấp LLM',
  ],
}

export default function StartupCanvas() {
  const nav = useNavigate()
  const toast = useToast()
  const [ventures, setVentures] = useState<Venture[]>([])
  const [selectedVentureId, setSelectedVentureId] = useState<string>('default')
  const [canvas, setCanvas] = useState<CanvasState>(DEFAULT_CANVAS)
  const [editingBox, setEditingBox] = useState<keyof CanvasState | null>(null)
  const [newPointInput, setNewPointInput] = useState('')

  useEffect(() => {
    listVentures()
      .then((vData) => {
        setVentures(vData)
        if (vData.length > 0) {
          setSelectedVentureId(vData[0]!.id)
        }
      })
      .catch(() => null)
  }, [])

  const handleAddPoint = (boxKey: keyof CanvasState) => {
    if (!newPointInput.trim()) return
    setCanvas((prev) => ({
      ...prev,
      [boxKey]: [...prev[boxKey], newPointInput.trim()],
    }))
    setNewPointInput('')
    toast.success('Đã thêm mục mới vào Canvas')
  }

  const handleRemovePoint = (boxKey: keyof CanvasState, index: number) => {
    setCanvas((prev) => ({
      ...prev,
      [boxKey]: prev[boxKey].filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    toast.success('Đã lưu Lean Canvas vào dự án thành công! 🎉')
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/startup')} />

      <main className="max-w-7xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Khung Lean Canvas 9 Ô Chuẩn Hóa"
          subtitle="Thiết kế, kiểm chứng và hoàn thiện mô hình kinh doanh khởi nghiệp trên 1 trang duy nhất"
        />

        {/* Thanh công cụ chọn dự án & lưu */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-purple-400" />
            <select
              value={selectedVentureId}
              onChange={(e) => setSelectedVentureId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="default">Dự án Mẫu: Đồng Hành AI EdTech</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="tap-44 flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition shadow-md shadow-purple-500/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Canvas</span>
            </button>
          </div>
        </section>

        {/* Lưới 9 Ô Lean Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {/* Ô 1: Problem (Cột 1) */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                <Target className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase">1. Vấn đề (Problem)</h3>
              </div>
              <ul className="space-y-2">
                {canvas.problem.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                  >
                    <span>• {pt}</span>
                    <button
                      onClick={() => handleRemovePoint('problem', i)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setEditingBox(editingBox === 'problem' ? null : 'problem')}
              className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
            >
              <Plus className="w-3 h-3" /> Thêm điểm
            </button>
          </div>

          {/* Ô 2: Solution & Key Metrics (Cột 2) */}
          <div className="space-y-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    4. Giải pháp (Solution)
                  </h3>
                </div>
                <ul className="space-y-2">
                  {canvas.solution.map((pt, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                    >
                      <span>• {pt}</span>
                      <button
                        onClick={() => handleRemovePoint('solution', i)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setEditingBox(editingBox === 'solution' ? null : 'solution')}
                className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
              >
                <Plus className="w-3 h-3" /> Thêm điểm
              </button>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    8. Chỉ số (Key Metrics)
                  </h3>
                </div>
                <ul className="space-y-2">
                  {canvas.keyMetrics.map((pt, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                    >
                      <span>• {pt}</span>
                      <button
                        onClick={() => handleRemovePoint('keyMetrics', i)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setEditingBox(editingBox === 'keyMetrics' ? null : 'keyMetrics')}
                className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
              >
                <Plus className="w-3 h-3" /> Thêm điểm
              </button>
            </div>
          </div>

          {/* Ô 3: Unique Value Proposition (Cột 3 - Trung tâm) */}
          <div className="bg-zinc-900/90 border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg shadow-purple-500/5">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-500/20">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-purple-300 uppercase">
                  3. Giá trị độc nhất (UVP)
                </h3>
              </div>
              <ul className="space-y-2">
                {canvas.uniqueValue.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-200 flex items-start justify-between gap-1 group"
                  >
                    <span>• {pt}</span>
                    <button
                      onClick={() => handleRemovePoint('uniqueValue', i)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setEditingBox(editingBox === 'uniqueValue' ? null : 'uniqueValue')}
              className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
            >
              <Plus className="w-3 h-3" /> Thêm điểm
            </button>
          </div>

          {/* Ô 4: Unfair Advantage & Channels (Cột 4) */}
          <div className="space-y-3.5">
            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase">
                    5. Lợi thế (Unfair Adv)
                  </h3>
                </div>
                <ul className="space-y-2">
                  {canvas.unfairAdvantage.map((pt, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                    >
                      <span>• {pt}</span>
                      <button
                        onClick={() => handleRemovePoint('unfairAdvantage', i)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() =>
                  setEditingBox(editingBox === 'unfairAdvantage' ? null : 'unfairAdvantage')
                }
                className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
              >
                <Plus className="w-3 h-3" /> Thêm điểm
              </button>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase">6. Kênh (Channels)</h3>
                </div>
                <ul className="space-y-2">
                  {canvas.channels.map((pt, i) => (
                    <li
                      key={i}
                      className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                    >
                      <span>• {pt}</span>
                      <button
                        onClick={() => handleRemovePoint('channels', i)}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setEditingBox(editingBox === 'channels' ? null : 'channels')}
                className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
              >
                <Plus className="w-3 h-3" /> Thêm điểm
              </button>
            </div>
          </div>

          {/* Ô 5: Customer Segments (Cột 5) */}
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  2. Khách hàng (Customers)
                </h3>
              </div>
              <ul className="space-y-2">
                {canvas.customerSegments.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                  >
                    <span>• {pt}</span>
                    <button
                      onClick={() => handleRemovePoint('customerSegments', i)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() =>
                setEditingBox(editingBox === 'customerSegments' ? null : 'customerSegments')
              }
              className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
            >
              <Plus className="w-3 h-3" /> Thêm điểm
            </button>
          </div>
        </div>

        {/* Hàng Dưới: Chi phí (Cost) & Doanh thu (Revenue) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                <PieChart className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  7. Cấu trúc chi phí (Cost Structure)
                </h3>
              </div>
              <ul className="space-y-2">
                {canvas.cost.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                  >
                    <span>• {pt}</span>
                    <button
                      onClick={() => handleRemovePoint('cost', i)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setEditingBox(editingBox === 'cost' ? null : 'cost')}
              className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
            >
              <Plus className="w-3 h-3" /> Thêm điểm
            </button>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase">
                  9. Dòng doanh thu (Revenue Streams)
                </h3>
              </div>
              <ul className="space-y-2">
                {canvas.revenue.map((pt, i) => (
                  <li
                    key={i}
                    className="text-xs text-zinc-300 flex items-start justify-between gap-1 group"
                  >
                    <span>• {pt}</span>
                    <button
                      onClick={() => handleRemovePoint('revenue', i)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setEditingBox(editingBox === 'revenue' ? null : 'revenue')}
              className="tap-44 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold pt-2"
            >
              <Plus className="w-3 h-3" /> Thêm điểm
            </button>
          </div>
        </div>

        {/* Modal / Inline Thêm mục vào ô */}
        {editingBox && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-md w-full space-y-4">
              <h3 className="text-sm font-bold text-white uppercase">Thêm mục mới vào ô Canvas</h3>
              <input
                type="text"
                value={newPointInput}
                onChange={(e) => setNewPointInput(e.target.value)}
                placeholder="Nhập nội dung gạch đầu dòng..."
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingBox(null)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleAddPoint(editingBox)
                    setEditingBox(null)
                  }}
                  className="px-4 py-2 bg-purple-500 text-white font-bold rounded-xl text-xs"
                >
                  Thêm vào Canvas
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
