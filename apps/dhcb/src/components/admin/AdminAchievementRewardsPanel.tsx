// src/components/admin/AdminAchievementRewardsPanel.tsx — Tab "Thưởng huy hiệu" trong /admin-s.
// Cấu hình phần thưởng (bật/tắt + gói Pro/VIP + số ngày) cho TỪNG huy hiệu & mốc (migration
// 0026), áp dụng NGAY cho toàn bộ người dùng. Gọi thẳng api/admin-achievement-rewards.ts.
import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@core/ToastProvider'
import { getAuthHeader } from '@core/authHeader'
import { ACHIEVEMENTS } from '../../data/achievements'

interface RewardConfig {
  enabled: boolean
  rewardPlan: 'pro' | 'vip'
  rewardDays: number
}

interface RewardRow {
  achievementId: string
  config: RewardConfig
}

async function api(method: string, body?: unknown) {
  const headers = await getAuthHeader()
  const res = await fetch('/api/admin-achievement-rewards', {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `Lỗi ${res.status}`)
  }
  return res.json().catch(() => ({}))
}

function RewardRowEditor({ row, onReload }: { row: RewardRow; onReload: () => Promise<void> }) {
  const toast = useToast()
  const def = ACHIEVEMENTS.find((a) => a.id === row.achievementId)
  const [enabled, setEnabled] = useState(row.config.enabled)
  const [rewardPlan, setRewardPlan] = useState<'pro' | 'vip'>(row.config.rewardPlan)
  const [rewardDays, setRewardDays] = useState(row.config.rewardDays)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEnabled(row.config.enabled)
    setRewardPlan(row.config.rewardPlan)
    setRewardDays(row.config.rewardDays)
  }, [row])

  async function save() {
    setSaving(true)
    try {
      await api('PUT', { achievementId: row.achievementId, enabled, rewardPlan, rewardDays })
      toast.success('Đã lưu')
      await onReload()
    } catch (err) {
      toast.error(`Lưu thất bại: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3">
      <div className="flex items-center gap-2 sm:w-56 shrink-0">
        <span className="text-lg">{def?.icon ?? '🏅'}</span>
        <span className="text-sm text-white truncate">{def?.nameVi ?? row.achievementId}</span>
      </div>

      <label className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 accent-accent-500"
        />
        Bật thưởng
      </label>

      <select
        value={rewardPlan}
        onChange={(e) => setRewardPlan(e.target.value as 'pro' | 'vip')}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white"
      >
        <option value="pro">Pro</option>
        <option value="vip">VIP</option>
      </select>

      <input
        type="number"
        min={0}
        max={3650}
        value={rewardDays}
        onChange={(e) => setRewardDays(Math.max(0, Number(e.target.value) || 0))}
        className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white"
      />
      <span className="text-xs text-zinc-500 shrink-0">ngày</span>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="tap-44 flex items-center justify-center gap-1.5 rounded-lg bg-accent-500 text-white text-sm font-semibold px-3 py-1.5 disabled:opacity-60 whitespace-nowrap sm:ml-auto"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Lưu
      </button>
    </div>
  )
}

export default function AdminAchievementRewardsPanel() {
  const toast = useToast()
  const [rows, setRows] = useState<RewardRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const data = (await api('GET')) as { rewards: RewardRow[] }
      setRows(data.rewards)
    } catch (err) {
      toast.error(`Tải cấu hình thất bại: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Mỗi huy hiệu/mốc tặng thêm N ngày gói Pro/VIP khi người dùng đạt được (nhận 1 lần duy
        nhất/tài khoản). Sửa xong bấm Lưu ở đúng hàng — áp dụng ngay cho toàn bộ người dùng, không
        cần deploy lại. Tắt "Bật thưởng" nếu chưa muốn phát thưởng cho huy hiệu đó.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
        </div>
      )}

      {!loading &&
        rows &&
        rows.map((row) => <RewardRowEditor key={row.achievementId} row={row} onReload={load} />)}
    </div>
  )
}
