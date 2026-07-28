// src/components/admin/AdminVipWhitelistPanel.tsx — Tab "Danh sách VIP" trong /admin.
// Quản lý public.vip_whitelist qua api/admin-vip-whitelist.ts: thêm email → cấp VIP vĩnh viễn
// ngay (nếu đã có tài khoản) hoặc tự cấp lúc người đó đăng ký sau này; xoá email → hạ về free.
import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck, Trash2 } from 'lucide-react'
import { useToast } from '../../context/ToastProvider'
import { getAuthHeader } from '../../lib/authHeader'

interface WhitelistItem {
  email: string
  note: string | null
  createdAt: string
}

export default function AdminVipWhitelistPanel() {
  const toast = useToast()
  const [items, setItems] = useState<WhitelistItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/admin-vip-whitelist', { headers })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      const data = (await res.json()) as { items: WhitelistItem[] }
      setItems(data.items)
    } catch (err) {
      toast.error(`Tải danh sách thất bại: ${(err as Error).message}`)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdd() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error('Nhập email trước đã')
      return
    }
    setAdding(true)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/admin-vip-whitelist', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, note: note.trim() || undefined }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      toast.success(`Đã cấp VIP vĩnh viễn cho ${trimmedEmail}`)
      setEmail('')
      setNote('')
      await load()
    } catch (err) {
      toast.error(`Thêm thất bại: ${(err as Error).message}`)
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(targetEmail: string) {
    setRemovingEmail(targetEmail)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/admin-vip-whitelist', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Lỗi ${res.status}`)
      }
      toast.success(`Đã gỡ ${targetEmail} khỏi danh sách VIP`)
      await load()
    } catch (err) {
      toast.error(`Gỡ thất bại: ${(err as Error).message}`)
    } finally {
      setRemovingEmail(null)
    }
  }

  return (
    <div className="space-y-4">
      <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Thêm email vào danh sách VIP</p>
        <p className="text-xs text-zinc-500">
          Email trong danh sách này luôn là VIP vĩnh viễn — cấp ngay nếu đã có tài khoản, hoặc tự
          cấp lúc người đó đăng ký sau này. Gỡ khỏi danh sách sẽ hạ về Free ngay.
        </p>

        <label className="block">
          <span className="block text-xs text-zinc-400 mb-1">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-zinc-400 mb-1">Ghi chú (tuỳ chọn)</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="vd: bạn thân, đóng góp code..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white"
          />
        </label>

        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="tap-44 w-full flex items-center justify-center gap-2 rounded-xl bg-accent-500 text-white font-semibold py-3 disabled:opacity-60"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Thêm vào danh sách VIP
        </button>
      </section>

      <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-white">
          Danh sách hiện tại {items ? `(${items.length})` : ''}
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {!loading && items && items.length === 0 && (
          <p className="text-sm text-zinc-500 py-2">Chưa có email nào trong danh sách.</p>
        )}

        {!loading &&
          items &&
          items.map((item) => (
            <div
              key={item.email}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{item.email}</p>
                {item.note && <p className="text-xs text-zinc-500 truncate">{item.note}</p>}
                <p className="text-[11px] text-zinc-600">
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.email)}
                disabled={removingEmail === item.email}
                className="tap-44 shrink-0 flex items-center gap-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium px-3 py-2 disabled:opacity-60"
              >
                {removingEmail === item.email ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Gỡ
              </button>
            </div>
          ))}
      </section>
    </div>
  )
}
