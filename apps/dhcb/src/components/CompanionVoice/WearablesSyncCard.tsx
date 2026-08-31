import { useState, useEffect } from 'react'
import { Watch, Heart, Moon, Clock, RotateCw } from 'lucide-react'
import type {
  BioStreamRecord,
  CircadianLearningWindow,
  WearableSource,
} from '@dhcb/core-contracts/wearablesIntegration'

export default function WearablesSyncCard() {
  const [bio, setBio] = useState<BioStreamRecord | null>(null)
  const [window, setWindow] = useState<CircadianLearningWindow | null>(null)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [selectedSource, setSelectedSource] = useState<WearableSource>('apple_health')

  // Nạp dữ liệu sinh trắc 1 lần lúc mount — hàm async định nghĩa TRONG effect,
  // mọi setState nằm sau await (không setState đồng bộ trong thân effect).
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/wearables-sync')
        if (res.ok) {
          const data = await res.json()
          if (data.bio) setBio(data.bio)
          if (data.window) setWindow(data.window)
        }
      } catch (err) {
        console.error('Failed to load wearables bio data', err)
      }
    }
    void loadData()
  }, [])

  const handleSyncNow = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/wearables-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: selectedSource,
          hrvMs: Math.floor(Math.random() * 20) + 65, // 65 - 85ms
          restingHeartRateBpm: Math.floor(Math.random() * 8) + 50,
          sleepQualityScore: Math.floor(Math.random() * 10) + 88,
          deepSleepMinutes: Math.floor(Math.random() * 30) + 90,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.bio) setBio(data.bio)
        if (data.window) setWindow(data.window)
      }
    } catch (err) {
      console.error('Failed to sync bio data', err)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Watch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Wearables & Circadian Bio-Adaptive MCP
              </h3>
              <span className="text-[11px] px-2 py-0.5 font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Bio-Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Đồng bộ nhịp tim (HRV) & giấc ngủ ➔ Tự động xác định Khung Giờ Học Vàng
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Sinh trắc'}</span>
        </button>
      </div>

      {/* Device Selector */}
      <div className="mt-4 flex gap-2">
        {(['apple_health', 'oura_ring', 'garmin_connect'] as WearableSource[]).map((src) => {
          const isSelected = selectedSource === src
          const labels: Record<string, string> = {
            apple_health: 'Apple HealthKit',
            oura_ring: 'Oura Ring Gen3',
            garmin_connect: 'Garmin Elevate',
          }
          return (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {labels[src]}
            </button>
          )
        })}
      </div>

      {bio && window && (
        <div className="mt-4 space-y-4">
          {/* Bio Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Biến thiên HRV</span>
              </div>
              <div className="text-base font-bold text-white">{bio.hrvMs} ms</div>
              <div className="text-[11px] text-emerald-400 font-medium">Phục hồi tốt</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chất lượng Giấc ngủ</span>
              </div>
              <div className="text-base font-bold text-white">{bio.sleepQualityScore}/100</div>
              <div className="text-[11px] text-indigo-300 font-medium">
                {bio.deepSleepMinutes} phút ngủ sâu
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>Nhịp tim Nghỉ ngơi</span>
              </div>
              <div className="text-base font-bold text-white">{bio.restingHeartRateBpm} bpm</div>
              <div className="text-[11px] text-slate-400">Bình ổn</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
              <div className="text-[11px] font-bold text-emerald-300">Readiness Score</div>
              <div className="text-xl font-black text-emerald-400">{bio.readinessScore}%</div>
              <div className="text-[11px] text-emerald-300 font-semibold uppercase">
                {window.currentCognitiveBand.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Circadian Golden Window Banner */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Khung Giờ Học Vàng (Circadian Golden Window):
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                {window.goldenWindowStart} — {window.goldenWindowEnd}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">💡 {window.adaptationAdvice}</p>
          </div>
        </div>
      )}
    </div>
  )
}
