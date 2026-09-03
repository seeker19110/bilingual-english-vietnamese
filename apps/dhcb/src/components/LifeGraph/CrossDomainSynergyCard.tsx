import React, { useEffect, useState } from 'react'
import { Sparkles, AlertTriangle, ArrowRight, RefreshCw, Zap, Network } from 'lucide-react'

export interface CrossDomainSynergyItem {
  id: string
  title: string
  sourceDomain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  targetDomain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  description: string
  impact: 'high' | 'medium' | 'low'
  suggestedAction?: string
}

export interface CrossDomainConflictItem {
  id: string
  title: string
  domains: Array<'learning' | 'career' | 'work' | 'startup' | 'life'>
  description: string
  severity: 'high' | 'medium' | 'low'
  mitigationSuggestion: string
}

export interface CrossDomainSynergyReport {
  personId: string
  synergies: CrossDomainSynergyItem[]
  conflicts: CrossDomainConflictItem[]
  nodesCount: number
  edgesCount: number
  generatedAt: string
}

export const CrossDomainSynergyCard: React.FC = () => {
  const [data, setData] = useState<CrossDomainSynergyReport | null>(null)
  const [loading, setLoading] = useState(true)

  // Handler nút "Làm mới" — setLoading(true) đồng bộ trong handler là hợp lệ.
  const fetchSynergy = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/life-graph?kind=synergy')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Lỗi khi tải phân tích cộng hưởng đa miền:', err)
    } finally {
      setLoading(false)
    }
  }

  // Nạp phân tích 1 lần lúc mount — hàm async định nghĩa TRONG effect, mọi
  // setState nằm sau await (không setState đồng bộ trong thân effect);
  // `loading` khởi tạo mặc định true nên không cần setLoading(true).
  useEffect(() => {
    const initialFetch = async () => {
      const res = await fetch('/api/life-graph?kind=synergy')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    }
    initialFetch()
      .catch((err) => {
        console.error('Lỗi khi tải phân tích cộng hưởng đa miền:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
        <div className="h-20 bg-zinc-800/50 rounded" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 theme-light:text-sky-900">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Phân Tích Cộng Hưởng Đa Miền</h3>
            <p className="text-[11px] text-zinc-400">
              Liên kết thông minh giữa Học tập ↔ Sự nghiệp ↔ Công việc ↔ Khởi nghiệp ↔ Đời sống
            </p>
          </div>
        </div>
        <button
          onClick={fetchSynergy}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Synergies List */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 theme-light:text-sky-900">
          <Sparkles className="w-3.5 h-3.5" />
          Cơ hội cộng hưởng phát hiện ({data.synergies.length}):
        </div>

        {data.synergies.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/40 to-indigo-950/30 border border-sky-800/40 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="capitalize px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 theme-light:text-sky-900 text-[11px]">
                  {item.sourceDomain}
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
                <span className="capitalize px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 theme-light:text-indigo-800 text-[11px]">
                  {item.targetDomain}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 theme-light:text-emerald-900 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                {item.impact} impact
              </span>
            </div>

            <div className="font-semibold text-zinc-200">{item.title}</div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">{item.description}</p>

            {item.suggestedAction && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-300 theme-light:text-sky-900 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
                <Zap className="w-3.5 h-3.5 text-amber-400 theme-light:text-amber-900 shrink-0" />
                <span>Gợi ý: {item.suggestedAction}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conflicts List */}
      {data.conflicts.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 theme-light:text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            Cảnh báo nguy cơ & xung đột ({data.conflicts.length}):
          </div>

          {data.conflicts.map((con) => (
            <div
              key={con.id}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-xs text-amber-200 theme-light:text-amber-900"
            >
              <div className="font-semibold">{con.title}</div>
              <p className="text-[11px] opacity-90">{con.description}</p>
              <div className="text-[11px] font-medium text-zinc-300 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60 mt-1">
                Giải pháp: {con.mitigationSuggestion}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CrossDomainSynergyCard
