// apps/english/src/components/chat/UserSearch.tsx
// Debounced user search to start new DM conversations

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, MessageCirclePlus, X } from 'lucide-react'
import type { UserSearchResult } from './useChat'

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-zinc-400 bg-zinc-800' },
  pro: { label: 'Pro', color: 'text-accent-400 bg-accent-500/10' },
  vip: { label: 'VIP', color: 'text-amber-400 bg-amber-500/10' },
}

interface Props {
  onSearch: (q: string) => Promise<UserSearchResult[]>
  onCreateRoom: (userId: string) => Promise<string | null>
  onClose: () => void
}

export default function UserSearch({ onSearch, onCreateRoom, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      const res = await onSearch(q)
      setResults(res)
      setLoading(false)
    },
    [onSearch],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void doSearch(q), 300)
  }

  const handleCreate = async (userId: string) => {
    setCreatingId(userId)
    await onCreateRoom(userId)
    setCreatingId(null)
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Tìm người dùng theo tên..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
        ) : (
          <button
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="text-zinc-500 hover:text-zinc-300 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">Nhập tên để tìm kiếm</p>
          </div>
        ) : results.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <p className="text-sm">Không tìm thấy kết quả</p>
          </div>
        ) : (
          <ul role="list">
            {results.map((user) => {
              const plan = (user.plan ? PLAN_LABELS[user.plan] : undefined) ??
                PLAN_LABELS.free ?? { label: 'Free', color: 'text-zinc-400 bg-zinc-800' }
              return (
                <li key={user.id}>
                  <button
                    onClick={() => void handleCreate(user.id)}
                    disabled={!!creatingId}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left group"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500/80 to-accent-400/80 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {(user.nickname ?? user.name)[0]?.toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.nickname ?? user.name}
                      </p>
                      {user.nickname && (
                        <p className="text-xs text-zinc-500 truncate">{user.name}</p>
                      )}
                    </div>
                    {/* Plan badge */}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${plan.color} shrink-0`}
                    >
                      {plan.label}
                    </span>
                    {/* Start chat icon */}
                    {creatingId === user.id ? (
                      <Loader2 className="w-4 h-4 text-accent-400 animate-spin shrink-0" />
                    ) : (
                      <MessageCirclePlus className="w-4 h-4 text-zinc-600 group-hover:text-accent-400 transition-colors shrink-0" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
