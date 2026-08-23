import { useState, useEffect } from 'react'
import { RealtimeSessionTelemetry } from '@dhcb/core-contracts/meshTelemetry'
import { fetchMeshTelemetry, MeshStatusSummary } from '../../lib/meshTelemetryApi.js'
import RealtimeCostTelemetryBadge from './RealtimeCostTelemetryBadge'
import MeshHealthMonitorModal from './MeshHealthMonitorModal'

export default function RealtimeTelemetryBar() {
  const [telemetry, setTelemetry] = useState<RealtimeSessionTelemetry | null>(null)
  const [meshStatus, setMeshStatus] = useState<MeshStatusSummary | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadTelemetry = async () => {
    try {
      const data = await fetchMeshTelemetry()
      setTelemetry(data.telemetry)
      setMeshStatus(data.meshStatus)
    } catch {
      // im lặng
    }
  }

  useEffect(() => {
    void loadTelemetry()
    const interval = setInterval(() => {
      void loadTelemetry()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  if (!telemetry || !meshStatus) return null

  return (
    <div className="flex items-center justify-between py-1.5 px-2 bg-zinc-950/40 rounded-xl border border-zinc-800/60 mb-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] text-zinc-400 font-medium">
          Mesh:{' '}
          <span className="text-zinc-200 font-semibold">{meshStatus.region.split(' ')[0]}</span>
        </span>
      </div>

      <RealtimeCostTelemetryBadge telemetry={telemetry} onClick={() => setModalOpen(true)} />

      <MeshHealthMonitorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        telemetry={telemetry}
        meshStatus={meshStatus}
        onUpdated={(updated) => setTelemetry(updated)}
      />
    </div>
  )
}
