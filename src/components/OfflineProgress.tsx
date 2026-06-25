// src/components/OfflineProgress.tsx — Thanh tiến độ "tải dữ liệu để dùng offline".
// Nghe event 'data-precache-progress' do src/lib/dataPrecache.ts phát ra khi tải dần.
// Tự ẩn khi chưa có gì để tải (vd môi trường dev không chạy precache) và thu gọn thành
// 1 dòng "Sẵn sàng offline" khi đã tải xong.

import { useEffect, useState } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'
import { getPrecacheProgress, type PrecacheProgress } from '../lib/dataPrecache'

function mb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1)
}

export default function OfflineProgress({ isA }: { isA: boolean }) {
  const [p, setP] = useState<PrecacheProgress>(getPrecacheProgress())

  useEffect(() => {
    const onProgress = (e: Event) => setP((e as CustomEvent<PrecacheProgress>).detail)
    window.addEventListener('data-precache-progress', onProgress)
    // Đồng bộ lại lần đầu (phòng khi event đã phát trước khi component mount).
    setP(getPrecacheProgress())
    return () => window.removeEventListener('data-precache-progress', onProgress)
  }, [])

  // Chưa khởi động / không có gì để tải → ẩn hẳn.
  if (p.total === 0) return null

  const done = p.done >= p.total
  const pct = Math.min(100, Math.round((p.bytesDone / Math.max(1, p.bytesTotal)) * 100))

  if (done) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 px-4 py-2.5 animate-fade-in">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs text-emerald-300">
          {isA
            ? `Đã tải xong dữ liệu — dùng được khi không có mạng (${mb(p.bytesTotal)}MB)`
            : `All data downloaded — works offline (${mb(p.bytesTotal)}MB)`}
        </span>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
        <span className="text-xs text-zinc-300 flex-1">
          {isA ? 'Đang tải dữ liệu để dùng offline…' : 'Downloading data for offline use…'}
        </span>
        <span className="text-[11px] text-zinc-400 tabular-nums">
          {mb(p.bytesDone)}/{mb(p.bytesTotal)}MB
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
