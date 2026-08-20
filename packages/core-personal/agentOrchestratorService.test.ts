import { describe, it, expect } from 'vitest'
import { orchestrateAutonomousAgentTask } from './agentOrchestratorService'
import { AgentExecutionSessionSchema } from '../core-contracts/agentOrchestrator'

describe('agentOrchestratorService', () => {
  it('orchestrates an autonomous agent task loop successfully matching v5.5.0', () => {
    const session = orchestrateAutonomousAgentTask({
      personId: 'usr-agent-test',
      sessionTitle: 'Thiết kế Hệ Thống Kiến Trúc V6',
      primaryRole: 'code_architect',
      userGoalDescription: 'Xây dựng cấu trúc module chuẩn phân tầng cho dự án',
      budgetGuardrail: {
        maxTokens: 10000,
        maxCostUsd: 0.05,
      },
    })

    expect(session.schemaVersion).toBe('v5.5.0')
    expect(session.personId).toBe('usr-agent-test')
    expect(session.primaryRole).toBe('code_architect')
    expect(session.status).toBe('completed')
    expect(session.steps).toHaveLength(5)
    expect(session.totalTokensUsed).toBeGreaterThan(0)
    expect(session.totalCostUsd).toBeLessThanOrEqual(0.05)

    const parsed = AgentExecutionSessionSchema.parse(session)
    expect(parsed.sessionId).toBe(session.sessionId)
  })

  it('supports all 5 autonomous agent roles', () => {
    const roles = [
      'socratic_mentor',
      'career_strategist',
      'code_architect',
      'venture_validator',
      'life_concierge',
    ] as const

    for (const role of roles) {
      const session = orchestrateAutonomousAgentTask({
        personId: 'usr-multi',
        sessionTitle: `Task for ${role}`,
        primaryRole: role,
        userGoalDescription: `Goal for ${role}`,
      })

      expect(session.primaryRole).toBe(role)
      expect(session.steps.every((s) => s.status === 'completed')).toBe(true)
    }
  })
})
