// apps/dhcb/src/components/DailyQuests/DailyQuestsCard.tsx — Thẻ 3 Nhiệm Vụ Hàng Ngày & Rương Báu Bí Ẩn.
import { useState, useEffect, useCallback } from 'react'
import { Lock, Sparkles, Gift, RefreshCw } from 'lucide-react'
import { useToast } from '@core/ToastProvider'
import type { DailyQuestsState, DailyQuestItem } from '@dhcb/core-contracts/dailyQuests'
import { fetchDailyQuests, claimMysteryChest } from '../../lib/dailyQuestsApi.js'

export default function DailyQuestsCard() {
  const [state, setState] = useState<DailyQuestsState | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [rewardClaimed, setRewardClaimed] = useState<{
    streakFreeze: number
    bonusExp: number
    vipHours: number
  } | null>(null)
  const toast = useToast()

  const load = useCallback(() => {
    setLoadError(false)
    fetchDailyQuests()
      .then(setState)
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleClaimChest() {
    if (claiming || !state?.chestState.isUnlocked || state?.chestState.isClaimed) return
    setClaiming(true)
    try {
      const res = await claimMysteryChest()
      setState(res.state)
      setRewardClaimed(res.rewards)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không mở được rương. Thử lại nhé.')
    } finally {
      setClaiming(false)
    }
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 mb-6 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">Không tải được Nhiệm Vụ Hàng Ngày.</p>
        <button
          type="button"
          onClick={load}
          className="tap-44 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Thử lại
        </button>
      </div>
    )
  }

  if (!state) return null

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-950/70 to-purple-950/30 p-4 sm:p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/50 mb-6">
      {/* Header & Chest Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/40 shadow-inner">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">Nhiệm Vụ Hàng Ngày</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {state.completedCount}/3 Hoàn tất
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Hoàn thành cả 3 nhiệm vụ để mở Rương Bí Ẩn nhận Vé Đóng Băng Chuỗi (Streak Freeze)
            </p>
          </div>
        </div>

        {/* Nút Rương Bí Ẩn */}
        {state.chestState.isUnlocked ? (
          state.chestState.isClaimed ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <span>🎁 Đã mở rương hôm nay</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={claiming}
              onClick={handleClaimChest}
              className="tap-44 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 animate-bounce flex items-center gap-1.5"
            >
              <Gift className="w-4 h-4" />
              <span>{claiming ? 'Đang mở...' : 'Mở Rương Báu!'}</span>
            </button>
          )
        ) : (
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 font-medium text-xs flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Rương khóa (0/3)</span>
          </div>
        )}
      </div>

      {/* Thông báo chúc mừng khi nhận rương */}
      {rewardClaimed && (
        <div className="my-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong>Rương Báu Đã Mở:</strong> +{rewardClaimed.streakFreeze} Vé Bảo Vệ Chuỗi
              (Streak Freeze) & +{rewardClaimed.bonusExp} Exp!
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRewardClaimed(null)}
            className="text-amber-400 font-bold hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Danh sách 3 Nhiệm vụ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5">
        {state.quests.map((quest: DailyQuestItem) => {
          const percent = Math.round((quest.currentProgress / quest.targetGoal) * 100)
          return (
            <div
              key={quest.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                quest.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xl">{quest.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  +{quest.rewardExp} Exp
                </span>
              </div>

              <h4 className="text-xs font-bold text-white truncate">{quest.title}</h4>
              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                {quest.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                  <span className={quest.isCompleted ? 'text-emerald-400' : 'text-zinc-400'}>
                    {quest.isCompleted
                      ? 'Đã hoàn thành'
                      : `${quest.currentProgress}/${quest.targetGoal}`}
                  </span>
                  <span className="text-zinc-500">{percent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      quest.isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
