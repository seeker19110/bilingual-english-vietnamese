import { RealtimeSessionTelemetry } from '../../../../../packages/core-contracts/meshTelemetry.js'
import { DollarSign, Cpu } from 'lucide-react'

interface RealtimeCostTelemetryBadgeProps {
  telemetry: RealtimeSessionTelemetry
  onClick?: () => void
}

export default function RealtimeCostTelemetryBadge({
  telemetry,
  onClick,
}: RealtimeCostTelemetryBadgeProps) {
  const latency = telemetry.currentLatencyMs
  const latencyColor =
    latency < 100
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
      : latency < 250
        ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
        : 'text-rose-400 border-rose-500/40 bg-rose-950/30'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-md hover:border-zinc-700 transition shadow-sm text-[11px]"
      title="Xem chi tiết Sức khỏe Mạng lưới Mesh & Telemetry Chi phí"
    >
      <div className={'flex items-center gap-1 px-1.5 py-0.5 rounded-lg border ' + latencyColor}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        <span className="font-mono font-bold text-[10px]">{latency}ms</span>
      </div>

      <div className="flex items-center gap-1 text-zinc-400 font-mono text-[10px]">
        <Cpu className="w-3 h-3 text-cyan-400" />
        <span>{telemetry.totalTokens} tkn</span>
      </div>

      <div className="flex items-center gap-0.5 text-zinc-300 font-mono text-[10px] font-bold">
        <DollarSign className="w-3 h-3 text-emerald-400 -mr-0.5" />
        <span>{telemetry.accumulatedCostUsd.toFixed(4)}</span>
      </div>

      {telemetry.budgetWarning && (
        <span className="rounded px-1 text-[8px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
          80% Cap
        </span>
      )}
      {telemetry.isThrottled && (
        <span className="rounded px-1 text-[8px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
          Edge Mode
        </span>
      )}
    </button>
  )
}
