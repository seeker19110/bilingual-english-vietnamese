import { useEffect, useState } from 'react'
import { ShieldAlert, Loader2, Save } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { useToast } from '../context/ToastProvider'
import { getAuthHeader } from '../lib/authHeader'
import type { Plan } from '../types'

type UsageMode = 'chat' | 'writing' | 'speaking' | 'stt' | 'pronounce'
type LimitsByPlan = Record<Plan, Record<UsageMode, number>>

interface AppSettings {
  limits: LimitsByPlan
  promoUntil: string | null
}

const MODES: { key: UsageMode; label: string }[] = [
  { key: 'chat', label: 'Chat' },
  { key: 'writing', label: 'Luyện viết' },
  { key: 'speaking', label: 'Luyện nói' },
  { key: 'stt', label: 'STT (nhận diện giọng nói)' },
  { key: 'pronounce', label: 'Chấm phát âm' },
]
const PLANS: { key: Plan; label: string }[] = [
  { key: 'free', label: 'Free' },
  { key: 'pro', label: 'Pro' },
  { key: 'vip', label: 'VIP' },
]

// Chuyển ISO datetime → giá trị cho <input type="datetime-local"> (giờ local trình duyệt)
function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Trang cấu hình hạn mức lượt dùng AI theo gói (free/pro/vip) + mốc khuyến mãi — CHỈ admin
// (ADMIN_EMAILS trong .env, xem api/_lib/adminAuth.ts) mới lưu được; server luôn tự kiểm tra
// lại quyền (không tin client), trang này chỉ là giao diện gọi /api/admin-settings.
export default function AdminSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [promoEnabled, setPromoEnabled] = useState(false)
  const [promoLocal, setPromoLocal] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const headers = await getAuthHeader()
        const res = await fetch('/api/admin-settings', { headers })
        if (res.status === 403) {
          setForbidden(true)
          return
        }
        if (!res.ok) throw new Error(`Lỗi ${res.status}`)
        const data = (await res.json()) as AppSettings
        setSettings(data)
        setPromoEnabled(data.promoUntil !== null)
        setPromoLocal(toLocalInputValue(data.promoUntil))
      } catch (err) {
        toast.error(`Không tải được cấu hình: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateLimit(plan: Plan, mode: UsageMode, value: number) {
    setSettings((prev) =>
      prev ? { ...prev, limits: { ...prev.limits, [plan]: { ...prev.limits[plan], [mode]: value } } } : prev,
    )
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const headers = await getAuthHeader()
      const promoUntil = promoEnabled && promoLocal ? new Date(promoLocal).toISOString() : null
      const res = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ limits: settings.limits, promoUntil }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const updated = (await res.json()) as AppSettings
      setSettings(updated)
      setPromoEnabled(updated.promoUntil !== null)
      setPromoLocal(toLocalInputValue(updated.promoUntil))
      toast.success('Đã lưu cấu hình')
    } catch (err) {
      toast.error(`Lưu thất bại: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <PageHeader title="Cấu hình hệ thống (Admin)" />

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

        {!loading && !forbidden && settings && (
          <>
            <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
              <p className="text-sm font-semibold text-white mb-3">Khuyến mãi ra mắt</p>
              <label className="flex items-center gap-2 text-sm text-zinc-300 mb-3">
                <input
                  type="checkbox"
                  checked={promoEnabled}
                  onChange={(e) => setPromoEnabled(e.target.checked)}
                />
                Bật khuyến mãi (mọi user được đối xử như VIP tới thời điểm bên dưới)
              </label>
              {promoEnabled && (
                <input
                  type="datetime-local"
                  value={promoLocal}
                  onChange={(e) => setPromoLocal(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              )}
            </section>

            {PLANS.map(({ key: plan, label }) => (
              <section key={plan} className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
                <p className="text-sm font-semibold text-white mb-3">Hạn mức gói {label} (lượt/ngày)</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {MODES.map(({ key: mode, label: modeLabel }) => (
                    <label key={mode} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-zinc-400">{modeLabel}</span>
                      <input
                        type="number"
                        min={0}
                        max={1_000_000}
                        value={settings.limits[plan][mode]}
                        onChange={(e) => updateLimit(plan, mode, Math.max(0, Number(e.target.value)))}
                        className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-right text-white"
                      />
                    </label>
                  ))}
                </div>
              </section>
            ))}

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
    </Layout>
  )
}
