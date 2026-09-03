import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, Scale, RefreshCw } from 'lucide-react'

export interface DomainCalibrationStat {
  domain: string
  totalDecisions: number
  reviewedDecisions: number
  matchedCount: number
  unmatchedCount: number
  successRate: number
}

export interface CalibrationInsight {
  type: 'positive' | 'warning' | 'info'
  title: string
  detail: string
  domain?: string
}

export interface OutcomeCalibrationReport {
  personId: string
  totalDecisions: number
  decidedCount: number
  reviewedCount: number
  pendingReviewCount: number
  overallSuccessRate: number
  calibrationScore: number
  domainStats: DomainCalibrationStat[]
  insights: CalibrationInsight[]
  generatedAt: string
}

export const OutcomeCalibrationCard: React.FC = () => {
  const [data, setData] = useState<OutcomeCalibrationReport | null>(null)
  const [loading, setLoading] = useState(true)

  // Handler nút "Làm mới" — setLoading(true) đồng bộ trong handler là hợp lệ.
  const fetchCalibration = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/decision-ledger?kind=calibration')
      if (res.ok) {
        const json = await res.json()
        setData(json.calibration)
      }
    } catch (err) {
      console.error('Lỗi khi tải báo cáo hiệu chuẩn quyết định:', err)
    } finally {
      setLoading(false)
    }
  }

  // Nạp báo cáo 1 lần lúc mount — hàm async định nghĩa TRONG effect, mọi
  // setState nằm sau await (không setState đồng bộ trong thân effect);
  // `loading` khởi tạo mặc định true nên không cần setLoading(true).
  useEffect(() => {
    const initialFetch = async () => {
      const res = await fetch('/api/decision-ledger?kind=calibration')
      if (res.ok) {
        const json = await res.json()
        setData(json.calibration)
      }
    }
    initialFetch()
      .catch((err) => {
        console.error('Lỗi khi tải báo cáo hiệu chuẩn quyết định:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="h-16 bg-zinc-800/50 rounded mb-2" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 theme-light:text-purple-800">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Đối Soát Quyết Định & Tự Hiệu Chuẩn</h3>
            <p className="text-[11px] text-zinc-400">
              Vòng lặp học từ kết quả thực tế (Outcome Learning Loop)
            </p>
          </div>
        </div>
        <button
          onClick={fetchCalibration}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
          <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
            Điểm Hiệu Chuẩn
          </span>
          <div className="text-xl font-extrabold text-purple-400 theme-light:text-purple-800 mt-0.5">
            {data.calibrationScore}
            <span className="text-xs font-normal text-zinc-400">/100</span>
          </div>
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
          <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
            Tỷ Lệ Đạt Kỳ Vọng
          </span>
          <div className="text-xl font-extrabold text-emerald-400 theme-light:text-emerald-900 mt-0.5">
            {Math.round(data.overallSuccessRate * 100)}%
          </div>
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
          <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
            Đã Đưa Ra
          </span>
          <div className="text-xl font-extrabold text-sky-400 theme-light:text-sky-900 mt-0.5">
            {data.decidedCount}
          </div>
        </div>

        <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
          <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
            Chờ Đánh Giá
          </span>
          <div
            className={`text-xl font-extrabold mt-0.5 ${
              data.pendingReviewCount > 0
                ? 'text-amber-400 theme-light:text-amber-900'
                : 'text-zinc-400'
            }`}
          >
            {data.pendingReviewCount}
          </div>
        </div>
      </div>

      {/* Domain Breakdown */}
      {data.domainStats.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-300">Phân rã theo lĩnh vực:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.domainStats.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs"
              >
                <span className="capitalize text-zinc-300 font-medium">{stat.domain}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">
                    {stat.totalDecisions} quyết định
                  </span>
                  <span className="font-semibold text-emerald-400 theme-light:text-emerald-900">
                    {Math.round(stat.successRate * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="space-y-2 pt-1">
          {data.insights.map((insight, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 p-3 rounded-xl text-xs border ${
                insight.type === 'positive'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 theme-light:text-emerald-900'
                  : insight.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 theme-light:text-amber-900'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300'
              }`}
            >
              {insight.type === 'positive' ? (
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400 theme-light:text-emerald-900" />
              ) : insight.type === 'warning' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400 theme-light:text-amber-900" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-400 theme-light:text-sky-900" />
              )}
              <div>
                <div className="font-semibold">{insight.title}</div>
                <div className="text-[11px] opacity-90 mt-0.5">{insight.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OutcomeCalibrationCard
