// src/components/admin/AdminAnalyticsPanel.tsx — Tab "Analytics" trong /admin.
// Đọc GET /api/analytics-summary (chỉ admin) — bảng số tổng theo sự kiện + theo ngày, KHÔNG
// cần biểu đồ đẹp (xem đặc tả M1.7 gốc), chỉ cần biết kênh nào đang hoạt động.
import { useEffect, useState } from 'react'
import { BarChart3, Loader2, ShieldAlert, RefreshCw } from 'lucide-react'
import { getAuthHeader } from '@core/lib/authHeader'

interface DailyRow {
  day: string
  event: string
  count: number
}
interface Summary {
  days: number
  daily: DailyRow[]
  totalsByEvent: Record<string, number>
}

// Nhãn tiếng Việt cho các event — khớp EVENT_TYPES trong api/analytics.ts, không thêm event lạ.
const EVENT_LABELS: Record<string, string> = {
  landing_view: 'Xem landing page',
  cta_click: 'Bấm nút bắt đầu',
  signup: 'Đăng ký thành công',
  first_session_done: 'Hoàn thành phiên học đầu',
  share_click: 'Chia sẻ kết quả',
  day2_return: 'Quay lại ngày thứ 2',
}

const DAY_OPTIONS = [7, 14, 30, 90]

export default function AdminAnalyticsPanel() {
  const [days, setDays] = useState(14)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`/api/analytics-summary?days=${days}`, { headers })
      if (res.status === 403) {
        setForbidden(true)
        return
      }
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      setSummary((await res.json()) as Summary)
    } catch (err) {
      setError(`Không tải được số liệu: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  if (forbidden) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-3 text-red-300">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <p className="text-sm">Bạn không có quyền truy cập trang này.</p>
      </div>
    )
  }

  // Danh sách event xuất hiện trong dữ liệu, ưu tiên thứ tự trong EVENT_LABELS trước, event lạ
  // (nếu whitelist server đổi mà UI chưa cập nhật) xếp cuối thay vì bị ẩn mất.
  const knownEvents = Object.keys(EVENT_LABELS)
  const eventKeys = summary
    ? [
        ...knownEvents.filter((e) => e in summary.totalsByEvent),
        ...Object.keys(summary.totalsByEvent).filter((e) => !knownEvents.includes(e)),
      ]
    : []

  const dayKeys = summary ? Array.from(new Set(summary.daily.map((r) => r.day))).sort() : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-400" />
          <h2 className="text-sm font-semibold text-white">Analytics marketing</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label="Số ngày hiển thị"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white"
          >
            {DAY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} ngày
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            aria-label="Tải lại"
            className="tap-44 p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && summary && eventKeys.length === 0 && (
        <p className="text-sm text-zinc-400">
          Chưa có sự kiện nào trong {summary.days} ngày gần đây.
        </p>
      )}

      {!loading && !error && summary && eventKeys.length > 0 && (
        <>
          {/* Tổng theo event */}
          <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-3">
              Tổng {summary.days} ngày gần đây
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eventKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 bg-zinc-800/60 rounded-xl px-3 py-2.5"
                >
                  <span className="text-xs text-zinc-400">{EVENT_LABELS[key] ?? key}</span>
                  <span className="text-sm font-semibold text-accent-400 tabular-nums">
                    {summary.totalsByEvent[key]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Bảng theo ngày — không vẽ biểu đồ, đủ dùng để thấy xu hướng thô */}
          <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 overflow-x-auto">
            <p className="text-sm font-semibold text-white mb-3">Theo ngày</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-2 pr-3 font-medium">Ngày</th>
                  {eventKeys.map((key) => (
                    <th key={key} className="pb-2 px-3 font-medium text-right whitespace-nowrap">
                      {EVENT_LABELS[key] ?? key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayKeys.map((day) => (
                  <tr key={day} className="border-t border-zinc-800/80">
                    <td className="py-2 pr-3 text-zinc-300 whitespace-nowrap">{day}</td>
                    {eventKeys.map((key) => {
                      const count =
                        summary.daily.find((r) => r.day === day && r.event === key)?.count ?? 0
                      return (
                        <td key={key} className="py-2 px-3 text-right text-zinc-400 tabular-nums">
                          {count || '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}
