// apps/dhcb/src/components/OfflineSyncIndicator.tsx — PWA Offline & Sync Status Banner.
import { useState, useEffect } from 'react'
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { getPendingOfflineActions, flushOfflineQueue } from '../lib/offlineStore'

export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [pendingCount, setPendingCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [justSynced, setJustSynced] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true
      setIsOnline(online)
      setPendingCount(getPendingOfflineActions().length)

      if (online && getPendingOfflineActions().length > 0) {
        handleAutoSync()
      }
    }

    const handleAutoSync = async () => {
      setSyncing(true)
      const res = await flushOfflineQueue(async () => true)
      setSyncing(false)
      setPendingCount(res.remaining)
      if (res.flushed > 0) {
        setJustSynced(true)
        setTimeout(() => setJustSynced(false), 4000)
      }
    }

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    updateStatus()

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (isOnline && pendingCount === 0 && !justSynced) return null

  return (
    // `bottom-20` (80px) THẤP HƠN BottomNav thật (5.25rem + safe-area ≈ 84px trở lên) nên
    // dải thông báo đè lên thanh điều hướng. Dùng biến `--bnav-h` (index.css) — biến này
    // tự về 0px từ 1024px trở lên, nên desktop chỉ còn 1rem cách mép dưới.
    <div className="fixed bottom-[calc(1rem+var(--bnav-h))] left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-fade-in pointer-events-auto">
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl shadow-lg border text-sm font-medium transition-all ${
          !isOnline
            ? 'bg-amber-950/90 border-amber-600/50 text-amber-200'
            : justSynced
              ? 'bg-emerald-950/90 border-emerald-600/50 text-emerald-200'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          ) : justSynced ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <RefreshCw
              className={`w-4 h-4 text-blue-400 shrink-0 ${syncing ? 'animate-spin' : ''}`}
            />
          )}

          <div>
            {!isOnline ? (
              <span>
                Đang học offline
                {pendingCount > 0 && ` (${pendingCount} mục chờ đồng bộ)`}
              </span>
            ) : justSynced ? (
              <span>Đã đồng bộ dữ liệu học tập thành công!</span>
            ) : (
              <span>Đang đồng bộ dữ liệu ({pendingCount} mục)...</span>
            )}
          </div>
        </div>

        {!isOnline && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
            Tự lưu cục bộ
          </span>
        )}
      </div>
    </div>
  )
}
