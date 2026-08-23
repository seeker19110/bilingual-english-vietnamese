// apps/dhcb/src/lib/proactiveAgentApi.ts — Client API giao tiếp Proactive Agent V5.
import type {
  GoalAutoPilotPlan,
  ProactiveAction,
  ProactiveAgentConfig,
  ProactiveAgentState,
} from '@dhcb/core-contracts/proactiveAgent'

export async function fetchProactiveAgentState(params?: {
  stressIndex?: number
  circadianEnergy?: number
  hasUnfinishedCanvasTask?: boolean
  streakCount?: number
}): Promise<ProactiveAgentState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const searchParams = new URLSearchParams()
  if (params?.stressIndex !== undefined) searchParams.set('stressIndex', String(params.stressIndex))
  if (params?.circadianEnergy !== undefined)
    searchParams.set('circadianEnergy', String(params.circadianEnergy))
  if (params?.hasUnfinishedCanvasTask !== undefined)
    searchParams.set('hasUnfinishedCanvasTask', String(params.hasUnfinishedCanvasTask))
  if (params?.streakCount !== undefined) searchParams.set('streakCount', String(params.streakCount))

  const qs = searchParams.toString()
  const url = `/api/proactive-agent${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải Proactive Agent state: ${res.status}`)
  }

  const data = await res.json()
  return data.state
}

export async function dismissProactiveNudge(nudgeId: string): Promise<boolean> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/proactive-agent?action=dismiss_nudge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ nudgeId }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi ẩn nhắc nhở: ${res.status}`)
  }

  return true
}

export async function executeProactiveAction(
  nudgeId: string,
  actionPayload: ProactiveAction,
): Promise<{ success: boolean; message: string; targetUrl: string }> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/proactive-agent?action=execute_action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ nudgeId, actionPayload }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi thực thi hành động: ${res.status}`)
  }

  const data = await res.json()
  return data.result
}

export async function updateProactiveConfigApi(
  config: Partial<ProactiveAgentConfig>,
): Promise<ProactiveAgentConfig> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/proactive-agent?action=update_config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ config }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi cập nhật cấu hình Proactive Agent: ${res.status}`)
  }

  const data = await res.json()
  return data.config
}

export async function createAutoPilotPlanApi(params: {
  goalId: string
  goalTitle: string
  domain?: 'learning' | 'career' | 'work' | 'startup' | 'life'
}): Promise<GoalAutoPilotPlan> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/proactive-agent?action=create_plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi tạo kế hoạch Auto-Pilot: ${res.status}`)
  }

  const data = await res.json()
  return data.plan
}
