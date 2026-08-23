// apps/dhcb/src/lib/agentOrchestratorApi.ts — REST Client cho Autonomous Multi-Agent Orchestrator Studio V5.5.
import type {
  AutonomousAgentRole,
  AgentExecutionSession,
  AgentBudgetGuardrail,
} from '@dhcb/core-contracts/agentOrchestrator'

export async function fetchAgentSessions(): Promise<AgentExecutionSession[]> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/agent-orchestrator', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách phiên Agent: ${res.status}`)
  }

  const data = await res.json()
  return data.sessions || []
}

export async function createAutonomousAgentSession(params: {
  sessionTitle: string
  primaryRole: AutonomousAgentRole
  userGoalDescription: string
  budgetGuardrail?: Partial<AgentBudgetGuardrail>
}): Promise<AgentExecutionSession> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/agent-orchestrator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi khởi tạo phiên Agent tự trị: ${res.status}`)
  }

  const data = await res.json()
  return data.session
}
