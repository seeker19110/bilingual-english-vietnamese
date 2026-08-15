// src/components/admin/AdminUsersPanel.tsx — Tab "Người dùng" trong /admin-s: bảng danh sách
// user thật (email, gói, đã xác thực email chưa, hoạt động gần nhất) để admin theo dõi/quản lý,
// tìm theo email + phân trang. Gọi api/admin-users.ts (GET, admin-only).
import { useEffect, useState } from 'react'
import { Loader2, Search, Users, ShieldCheck, ShieldOff } from 'lucide-react'
import { useToast } from '@core/ToastProvider'
import { getAuthHeader } from '@core/authHeader'

interface AdminUserRow {
  id: string
  email: string
  createdAt: string
  emailVerified: boolean
  plan: 'free' | 'pro' | 'vip'
  planExpiresAt: string | null
  lastActiveDay: string | null
}

const PAGE_SIZE = 20

const PLAN_BADGE: Record<AdminUserRow['plan'], string> = {
  free: 'bg-zinc-800 text-zinc-400',
  pro: 'bg-accent-500/15 text-accent-300 border border-accent-500/30',
  vip: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN')
}

interface AdminUsersPanelProps {
  /** Gọi khi admin bấm 1 dòng user — để panel "Cấp gói tay" điền sẵn email. */
  onSelectEmail?: (email: string) => void
  /** Gọi mỗi khi tải xong 1 trang, để nơi khác (vd. datalist gợi ý email) dùng lại danh sách này. */
  onEmailsChange?: (emails: string[]) => void
}

export default function AdminUsersPanel({ onSelectEmail, onEmailsChange }: AdminUsersPanelProps) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<AdminUserRow[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const headers = await getAuthHeader()
        const params = new URLSearchParams({
          search,
          limit: String(PAGE_SIZE),
          offset: String(offset),
        })
        const res = await fetch(`/api/admin-users?${params}`, { headers })
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(data.error ?? `Lỗi ${res.status}`)
        }
        const data = (await res.json()) as { total: number; users: AdminUserRow[] }
        if (cancelled) return
        setTotal(data.total)
        setUsers(data.users)
        onEmailsChange?.(data.users.map((u) => u.email))
      } catch (err) {
        if (!cancelled) toast.error(`Tải danh sách thất bại: ${(err as Error).message}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast không đổi giữa các lần render
  }, [search, offset])

  function handleSearchSubmit() {
    setOffset(0)
    setSearch(searchInput.trim())
  }

  const page = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-4">
      <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4" /> Người dùng ({total})
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Tìm theo email..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            aria-label="Tìm kiếm"
            className="tap-44 shrink-0 flex items-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-medium px-4"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-10">Không tìm thấy user nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Gói</th>
                  <th className="px-4 py-2 font-medium">Xác thực email</th>
                  <th className="px-4 py-2 font-medium">Đăng ký</th>
                  <th className="px-4 py-2 font-medium">Hoạt động gần nhất</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => onSelectEmail?.(u.email)}
                    className={`border-b border-zinc-800/60 last:border-0 ${
                      onSelectEmail ? 'cursor-pointer hover:bg-zinc-800/40' : ''
                    }`}
                    title={onSelectEmail ? 'Bấm để điền email vào form Cấp gói tay' : undefined}
                  >
                    <td className="px-4 py-2.5 text-zinc-200">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium uppercase ${PLAN_BADGE[u.plan]}`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-accent-300 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500 text-xs">
                          <ShieldOff className="w-3.5 h-3.5" /> Chưa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-2.5 text-zinc-400">{u.lastActiveDay ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            disabled={offset === 0}
            className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            disabled={page >= totalPages}
            className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  )
}
