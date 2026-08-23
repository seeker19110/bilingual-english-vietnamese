// src/components/admin/AdminPricePromoPanel.tsx — Nội dung tab "Khuyến mãi giá" trong /admin-s.
// Cho admin đặt % giảm giá áp dụng cho TOÀN BỘ gói/chu kỳ (Pro/VIP × 10 ngày/tháng/năm) cùng
// lúc, có ngày bắt đầu + kết thúc — lưu bảng price_promo (migration 0026), API
// api/admin-price-promo.ts. Khác tab "Hạn mức & khuyến mãi" (AdminLimitsPanel — đó là khuyến
// mãi NÂNG HẠN MỨC cho user Free, không phải giảm GIÁ BÁN gói Pro/VIP).
import { useEffect, useState } from 'react'
import { ShieldAlert, Loader2, Save } from 'lucide-react'
import { useToast } from '@core/ToastProvider'
import { getAuthHeader } from '@core/authHeader'

interface PricePromo {
  percent: number
  startsAt: string | null
  endsAt: string | null
  updatedAt: string
}

// Chuyển ISO datetime → giá trị cho <input type="datetime-local"> (giờ local trình duyệt)
function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props {
  onForbiddenChange?: (forbidden: boolean) => void
}

export default function AdminPricePromoPanel({ onForbiddenChange }: Props) {
  const toast = useToast()
  const [enabled, setEnabled] = useState(false)
  const [percent, setPercent] = useState(10)
  const [startsLocal, setStartsLocal] = useState('')
  const [endsLocal, setEndsLocal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const headers = await getAuthHeader()
        const res = await fetch('/api/admin-price-promo', { headers })
        if (res.status === 403) {
          setForbidden(true)
          onForbiddenChange?.(true)
          return
        }
        if (!res.ok) throw new Error(`Lỗi ${res.status}`)
        const data = (await res.json()) as PricePromo
        setEnabled(data.percent > 0)
        if (data.percent > 0) setPercent(data.percent)
        setStartsLocal(toLocalInputValue(data.startsAt))
        setEndsLocal(toLocalInputValue(data.endsAt))
      } catch (err) {
        toast.error(`Không tải được cấu hình: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    if (enabled && (!startsLocal || !endsLocal)) {
      toast.error('Bật khuyến mãi phải chọn đủ ngày bắt đầu và kết thúc')
      return
    }
    setSaving(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/admin-price-promo', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          percent: enabled ? percent : 0,
          startsAt: enabled && startsLocal ? new Date(startsLocal).toISOString() : null,
          endsAt: enabled && endsLocal ? new Date(endsLocal).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const updated = (await res.json()) as PricePromo
      setEnabled(updated.percent > 0)
      if (updated.percent > 0) setPercent(updated.percent)
      setStartsLocal(toLocalInputValue(updated.startsAt))
      setEndsLocal(toLocalInputValue(updated.endsAt))
      toast.success('Đã lưu cấu hình khuyến mãi')
    } catch (err) {
      toast.error(`Lưu thất bại: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!loading && forbidden && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-3 text-red-300">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm">Bạn không có quyền truy cập trang này.</p>
        </div>
      )}

      {!loading && !forbidden && (
        <>
          <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white mb-1">Khuyến mãi giá bán</p>
            <p className="text-xs text-zinc-400 mb-3">
              Giảm % trên giá niêm yết cho TẤT CẢ gói/chu kỳ (Pro + VIP × 10 ngày/tháng/năm) cùng
              lúc, trong khoảng ngày chọn bên dưới. Trang Nâng cấp + đơn thanh toán mới tự động dùng
              giá đã giảm — không ảnh hưởng đơn đã tạo trước đó.
            </p>
            <label className="flex items-center gap-2 text-sm text-zinc-300 mb-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Bật khuyến mãi giá
            </label>

            {enabled && (
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-zinc-400">Giảm (%)</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={percent}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      setPercent(Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 1)
                    }}
                    className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-right text-white"
                  />
                </label>
                <label className="block text-sm text-zinc-400">
                  Từ ngày
                  <input
                    type="datetime-local"
                    value={startsLocal}
                    onChange={(e) => setStartsLocal(e.target.value)}
                    className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="block text-sm text-zinc-400">
                  Đến ngày
                  <input
                    type="datetime-local"
                    value={endsLocal}
                    onChange={(e) => setEndsLocal(e.target.value)}
                    className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="tap-44 w-full flex items-center justify-center gap-2 rounded-xl bg-accent-500 text-white font-semibold py-3 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu cấu hình
          </button>
        </>
      )}
    </div>
  )
}
