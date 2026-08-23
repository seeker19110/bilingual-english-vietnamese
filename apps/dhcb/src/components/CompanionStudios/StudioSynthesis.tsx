import { NavigateFunction } from 'react-router-dom'
import { LayoutGrid, ChevronRight } from 'lucide-react'
import LifeSynthesisDashboard from '../LifeSynthesis/LifeSynthesisDashboard'
import AgentOrchestratorCard from '../AgentOrchestrator/AgentOrchestratorCard'

interface StudioSynthesisProps {
  navigate: NavigateFunction
}

export default function StudioSynthesis({ navigate }: StudioSynthesisProps) {
  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <LifeSynthesisDashboard />
      <AgentOrchestratorCard />

      {/* Action Canvas Workspace Banner */}
      <div className="flex items-center justify-between p-4 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-zinc-900 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              Không Gian Làm Việc Trực Quan (Action Canvas)
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase bg-cyan-500/30 text-cyan-300 border border-cyan-500/40">
                V4.2 Hub
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Phác thảo sơ đồ tư duy, phân rã mục tiêu 5 miền và kết nối tương tác trực quan cùng
              AI.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition shadow-md shadow-cyan-500/20 flex-shrink-0"
        >
          <span>Mở Workspace</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
