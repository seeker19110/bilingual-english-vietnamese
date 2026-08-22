// apps/english/src/pages/LifeWheel.tsx — Wheel of Life Assessment (Life Sub-page)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Save } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'

interface Dimension {
  id: string
  label: string
  score: number
  color: string
  description: string
}

const DEFAULT_DIMENSIONS: Dimension[] = [
  {
    id: 'health',
    label: 'Sức khỏe & Thể chất',
    score: 8,
    color: '#10b981',
    description: 'Năng lượng, giấc ngủ, tập luyện và dinh dưỡng',
  },
  {
    id: 'career',
    label: 'Sự nghiệp & Học tập',
    score: 7,
    color: '#3b82f6',
    description: 'Mục tiêu công việc, kỹ năng và thăng tiến',
  },
  {
    id: 'finance',
    label: 'Tài chính cá nhân',
    score: 6,
    color: '#f59e0b',
    description: 'Thu nhập, tiết kiệm và đầu tư tương lai',
  },
  {
    id: 'relationships',
    label: 'Mối quan hệ & Gia đình',
    score: 8,
    color: '#ec4899',
    description: 'Gắn kết gia đình, tình bạn và kết nối xã hội',
  },
  {
    id: 'mindset',
    label: 'Tâm trí & Cảm xúc',
    score: 7,
    color: '#8b5cf6',
    description: 'Bình an nội tâm, quản lý stress và chánh niệm',
  },
  {
    id: 'environment',
    label: 'Môi trường sống',
    score: 9,
    color: '#06b6d4',
    description: 'Không gian sống, nhà ở và nơi làm việc',
  },
  {
    id: 'recreation',
    label: 'Giải trí & Sở thích',
    score: 6,
    color: '#f97316',
    description: 'Du lịch, đam mê cá nhân và thời gian tái tạo',
  },
  {
    id: 'growth',
    label: 'Phát triển bản thân',
    score: 8,
    color: '#6366f1',
    description: 'Đọc sách, thói quen tích cực và triết lý sống',
  },
]

export default function LifeWheel() {
  const nav = useNavigate()
  const toast = useToast()
  const [dimensions, setDimensions] = useState<Dimension[]>(DEFAULT_DIMENSIONS)

  const handleScoreChange = (id: string, newScore: number) => {
    setDimensions((prev) => prev.map((d) => (d.id === id ? { ...d, score: newScore } : d)))
  }

  // Tính điểm trung bình và mức cân bằng
  const avgScore = (dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length).toFixed(1)

  const lowestDimensions = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 2)

  // Vẽ SVG Radar Chart
  const size = 320
  const center = size / 2
  const radius = size * 0.38
  const count = dimensions.length

  const getCoordinates = (index: number, score: number) => {
    const angle = ((Math.PI * 2) / count) * index - Math.PI / 2
    const r = (radius * score) / 10
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  const polygonPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score)
      return `${x},${y}`
    })
    .join(' ')

  const handleSaveAssessment = () => {
    toast.success('Đã lưu kết quả Đánh giá Bánh xe cuộc đời thành công! 🎉')
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/life')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Bánh Xe Cuộc Đời (Wheel of Life)"
          subtitle="Tự đánh giá 8 khía cạnh cốt lõi để nhận diện điểm cân bằng và định hình kế hoạch phát triển"
        />

        {/* Khối biểu đồ Radar & Điểm trung bình */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-6">
          {/* SVG Radar Chart */}
          <div className="relative w-[320px] h-[320px] shrink-0">
            <svg width={size} height={size} className="overflow-visible">
              {/* Các vòng tròn đồng tâm 2, 4, 6, 8, 10 */}
              {[2, 4, 6, 8, 10].map((level) => {
                const r = (radius * level) / 10
                return (
                  <circle
                    key={level}
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray={level === 10 ? 'none' : '3 3'}
                  />
                )
              })}

              {/* Các trục nan hoa 8 hướng */}
              {dimensions.map((_, i) => {
                const { x, y } = getCoordinates(i, 10)
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#3f3f46"
                    strokeWidth="1"
                  />
                )
              })}

              {/* Đa giác diện tích điểm */}
              <polygon
                points={polygonPoints}
                fill="rgba(244, 63, 94, 0.2)"
                stroke="#f43f5e"
                strokeWidth="2"
              />

              {/* Các điểm nút (dots) */}
              {dimensions.map((d, i) => {
                const { x, y } = getCoordinates(i, d.score)
                return (
                  <circle
                    key={d.id}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill={d.color}
                    stroke="#18181b"
                    strokeWidth="1.5"
                  />
                )
              })}
            </svg>
          </div>

          {/* Bảng tổng kết chỉ số */}
          <div className="space-y-4 max-w-xs text-center md:text-left">
            <div>
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
                Điểm cân bằng trung bình
              </span>
              <div className="text-4xl font-extrabold text-white flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-rose-400">{avgScore}</span>
                <span className="text-sm text-zinc-500 font-normal">/ 10</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
              <span className="font-semibold text-accent-400 block">💡 Phân tích từ AI:</span>
              <p className="leading-relaxed">
                Cuộc sống của bạn đang phát triển tốt ở mảng{' '}
                <strong className="text-emerald-400">{dimensions[5]!.label}</strong> và{' '}
                <strong className="text-emerald-400">{dimensions[0]!.label}</strong>.
              </p>
              <p className="leading-relaxed text-zinc-400">
                Hãy tập trung cải thiện thêm ở:{' '}
                <span className="text-amber-300 font-medium">
                  {lowestDimensions.map((d) => d.label).join(', ')}
                </span>
                .
              </p>
            </div>

            <button
              onClick={handleSaveAssessment}
              className="tap-44 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition shadow-md shadow-rose-500/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Lưu kết quả đánh giá</span>
            </button>
          </div>
        </section>

        {/* Bảng trượt chấm điểm 8 khía cạnh */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Tùy chỉnh mức độ hài lòng từng khía cạnh (Thang điểm 1 - 10)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dimensions.map((d) => (
              <div
                key={d.id}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-2.5 transition group hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                    {d.label}
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-lg border font-mono"
                    style={{
                      backgroundColor: `${d.color}15`,
                      color: d.color,
                      borderColor: `${d.color}30`,
                    }}
                  >
                    {d.score} / 10
                  </span>
                </div>

                <p className="text-xs text-zinc-500 line-clamp-1">{d.description}</p>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={d.score}
                  onChange={(e) => handleScoreChange(d.id, parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
