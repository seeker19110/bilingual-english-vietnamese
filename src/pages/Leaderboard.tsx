import { useState, useEffect } from 'react'
import { Trophy, Star, BookOpen } from 'lucide-react'
import Layout from '../components/Layout'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { fetchLeaderboard, type LeaderboardEntry, type Period } from '../lib/leaderboard'

// ── Huy chương top 3 ──────────────────────────────────────────────────────────
const MEDALS = ['🥇', '🥈', '🥉']
const MEDAL_BG = [
  'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  'from-zinc-400/20 to-zinc-500/10 border-zinc-400/30',
  'from-orange-600/20 to-amber-700/10 border-orange-600/30',
]
const MEDAL_TEXT = ['text-yellow-400', 'text-zinc-300', 'text-orange-400']

// Màu badge theo cấp độ
function levelColor(level: string): string {
  const map: Record<string, string> = {
    beginner:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    elementary:   'bg-sky-500/15 text-sky-400 border-sky-500/20',
    intermediate: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    advanced:     'bg-rose-500/15 text-rose-400 border-rose-500/20',
  }
  return map[level] ?? 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40'
}

// ── Skeleton loading ──────────────────────────────────────────────────────────
function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-6 h-4 rounded bg-zinc-800 shrink-0" />
      <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 rounded bg-zinc-800" />
        <div className="h-2.5 w-20 rounded bg-zinc-800/60" />
      </div>
      <div className="h-4 w-10 rounded bg-zinc-800" />
    </div>
  )
}

// ── Hiển thị 1 hàng trong bảng xếp hạng ──────────────────────────────────────
function LeaderRow({
  entry, rank, isMe, T,
}: {
  entry: LeaderboardEntry
  rank: number
  isMe: boolean
  T: ReturnType<typeof useLang>['T']
}) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null
  const isTop3 = rank <= 3

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
      isMe
        ? 'bg-emerald-500/10 border-emerald-500/25'
        : isTop3
          ? `bg-gradient-to-r ${MEDAL_BG[rank - 1]} border`
          : 'bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/60'
    }`}>

      {/* Hạng */}
      <div className="w-7 text-center shrink-0">
        {medal
          ? <span className="text-lg leading-none">{medal}</span>
          : <span className="text-sm font-bold text-zinc-500">{rank}</span>
        }
      </div>

      {/* Avatar chữ cái đầu */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        isMe
          ? 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/30'
          : 'bg-zinc-800 text-zinc-300'
      }`}>
        {entry.name[0]?.toUpperCase() ?? '?'}
      </div>

      {/* Tên + cấp độ */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? 'text-emerald-300' : isTop3 ? MEDAL_TEXT[rank - 1] : 'text-white'}`}>
          {entry.name}
          {isMe && <span className="ml-1.5 text-[10px] font-medium text-emerald-400/70">{T.leaderboardYou}</span>}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-[10px] px-1.5 py-px rounded-full border font-medium ${levelColor(entry.user_level)}`}>
            {T.leaderboardLevel(entry.user_level)}
          </span>
          {entry.words_learned > 0 && (
            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
              <BookOpen className="w-2.5 h-2.5" />
              {entry.words_learned}
            </span>
          )}
        </div>
      </div>

      {/* Điểm */}
      <div className="text-right shrink-0">
        <p className={`text-base font-bold ${isTop3 ? MEDAL_TEXT[rank - 1] : 'text-white'}`}>
          {entry.score}
        </p>
        <p className="text-[10px] text-zinc-600">{T.leaderboardScore}</p>
      </div>
    </div>
  )
}

// ── Trang chính ───────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { T } = useLang()
  const { user } = useAuth()

  const [period, setPeriod] = useState<Period>('week')
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(period).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [period])

  // Vị trí của user hiện tại (0-indexed → rank = index + 1)
  const myRank = user ? entries.findIndex(e => e.id === user.id) + 1 : 0

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={T.leaderboardTitle} subtitle={T.leaderboardSub} />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ── Tabs chọn kỳ ──────────────────────────────────────────────── */}
        <div className="flex gap-2 p-1 bg-zinc-900/80 border border-zinc-800/60 rounded-2xl">
          {(['week', 'month'] as Period[]).map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {p === 'week' ? T.leaderboardWeek : T.leaderboardMonth}
            </button>
          ))}
        </div>

        {/* ── Bảng xếp hạng ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          {loading ? (
            // Skeleton
            Array.from({ length: 7 }, (_, i) => <RowSkeleton key={i} />)
          ) : entries.length === 0 ? (
            // Trống
            <div className="py-16 text-center">
              <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">{T.leaderboardEmpty}</p>
            </div>
          ) : (
            entries.map((entry, i) => (
              <LeaderRow
                key={entry.id}
                entry={entry}
                rank={i + 1}
                isMe={user?.id === entry.id}
                T={T}
              />
            ))
          )}
        </div>

        {/* ── Vị trí của mình (nếu không nằm trong top visible) ─────────── */}
        {!loading && myRank > 0 && (
          <div className="pt-2 border-t border-zinc-800/60 text-center">
            <p className="text-xs text-zinc-500">
              Hạng của bạn: <strong className="text-emerald-400">#{myRank}</strong>
            </p>
          </div>
        )}

        {/* ── Chú thích cách tính điểm ───────────────────────────────────── */}
        {!loading && entries.length > 0 && (
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <p className="text-xs text-zinc-500">{T.leaderboardScoreLegend}</p>
          </div>
        )}

      </main>
    </div>
  )
}
