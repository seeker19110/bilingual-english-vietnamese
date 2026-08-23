// src/components/admin/AdminIntakePanel.tsx — Tab "Analytics" trong /admin: gợi ý của luồng
// người mới (/bat-dau) có TRÚNG không.
//
// Đọc GET /api/admin-intake-stats. Trình bày cố ý tách làm HAI khối, không gộp thành một bảng số:
//   Khối 1 — SUY LUẬN có đúng không (nhận việc chính / đổi việc / bỏ qua)
//   Khối 2 — có TÁC DỤNG THẬT không (làm xong việc đầu, và làm xong trong 7 ngày)
// Gộp lại thì người đọc sẽ nhìn ra một con số "tỷ lệ thành công" mơ hồ và không biết phải sửa gì.
//
// Lưu ý khi đọc số: tỷ lệ "đổi việc" cao KHÔNG hẳn xấu — nghĩa là màn gợi ý đang làm đúng việc của
// nó (đưa lựa chọn thật), chỉ là thứ tự xếp chưa chuẩn. Ghi thẳng lên giao diện để không ai vội
// kết luận sai.

import { useEffect, useState } from 'react'
import { Compass, Loader2, ShieldAlert, RefreshCw } from 'lucide-react'
import { getAuthHeader } from '@core/authHeader'
import { formatRate } from '../../lib/statFormat'

interface Stats {
  days: number
  counts: {
    answered: number
    tookSuggested: number
    switched: number
    skipped: number
    done: number
    doneWithin7Days: number
    topTasks: { taskId: string; chosen: number; done: number }[]
  }
  rates: {
    tookSuggested: number | null
    switched: number | null
    skipped: number | null
    doneAmongChosen: number | null
    doneWithin7DaysAmongChosen: number | null
  }
  note: string
}

const DAY_OPTIONS = [7, 14, 30, 90]

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-lg font-semibold text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminIntakePanel() {
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`/api/admin-intake-stats?days=${days}`, { headers })
      if (res.status === 403) {
        setForbidden(true)
        return
      }
      if (!res.ok) throw new Error(`Lỗi ${res.status}`)
      setStats((await res.json()) as Stats)
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

  const c = stats?.counts
  const r = stats?.rates
  const chosen = c ? c.tookSuggested + c.switched : 0

  return (
    <div id="admin-intake-panel" className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-accent-400" />
          <h2 className="text-sm font-semibold text-white">
            Luồng người mới — gợi ý có trúng không
          </h2>
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

      {!loading && !error && c && r && c.answered === 0 && (
        <p className="text-sm text-zinc-400">
          Chưa ai đi qua luồng người mới trong {stats?.days} ngày gần đây.
        </p>
      )}

      {!loading && !error && c && r && c.answered > 0 && (
        <>
          {/* ── Khối 1: suy luận có đúng không ─────────────────────────── */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-300">
              1. Suy luận có đúng không?{' '}
              <span className="font-normal text-zinc-500">
                — {c.answered} người trả lời xong 5 câu
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                label="Nhận việc chính"
                value={formatRate(r.tookSuggested)}
                sub={`${c.tookSuggested} người`}
              />
              <Stat
                label="Đổi việc khác"
                value={formatRate(r.switched)}
                sub={`${c.switched} người`}
              />
              <Stat
                label="Không chọn gì"
                value={formatRate(r.skipped)}
                sub={`${c.skipped} người`}
              />
            </div>
            <p className="text-xs text-zinc-500">
              &quot;Đổi việc&quot; cao không hẳn xấu — nghĩa là màn gợi ý đang đưa lựa chọn thật,
              chỉ là thứ tự xếp chưa chuẩn. &quot;Không chọn gì&quot; mới là tín hiệu trượt hẳn.
            </p>
          </section>

          {/* ── Khối 2: có tác dụng thật không ─────────────────────────── */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-zinc-300">
              2. Có tác dụng thật không?{' '}
              <span className="font-normal text-zinc-500">— trong {chosen} người đã chọn việc</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Stat
                label="Làm xong việc đầu"
                value={formatRate(r.doneAmongChosen)}
                sub={`${c.done} người`}
              />
              <Stat
                label="Làm xong trong 7 ngày"
                value={formatRate(r.doneWithin7DaysAmongChosen)}
                sub={`${c.doneWithin7Days} người · chỉ số quan trọng nhất`}
              />
            </div>
            <p className="text-xs text-zinc-500">{stats?.note}</p>
          </section>

          {/* ── Việc nào hay được chọn ─────────────────────────────────── */}
          {c.topTasks.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-300">Việc được chọn nhiều nhất</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-zinc-400 text-left">
                      <th scope="col" className="py-1.5 pr-3 font-medium">
                        Việc
                      </th>
                      <th scope="col" className="py-1.5 pr-3 font-medium">
                        Được chọn
                      </th>
                      <th scope="col" className="py-1.5 font-medium">
                        Làm xong
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.topTasks.map((t) => (
                      <tr key={t.taskId} className="border-t border-zinc-800">
                        <td className="py-1.5 pr-3 text-zinc-200 font-mono">{t.taskId}</td>
                        <td className="py-1.5 pr-3 text-zinc-300">{t.chosen}</td>
                        <td className="py-1.5 text-zinc-300">{t.done}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
