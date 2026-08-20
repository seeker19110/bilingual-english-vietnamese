import { describe, it, expect } from 'vitest'
import {
  AgentExecutionSessionSchema,
  AgentBudgetGuardrailSchema,
  type AgentExecutionSession,
} from './agentOrchestrator'

describe('AgentOrchestrator Schemas', () => {
  it('validates a valid AgentExecutionSession', () => {
    const session: AgentExecutionSession = {
      schemaVersion: 'v5.5.0',
      sessionId: 'sess-123',
      personId: 'user-456',
      sessionTitle: 'Refactor Auth Architecture into Zero-Trust Layer',
      primaryRole: 'code_architect',
      status: 'completed',
      totalTokensUsed: 1450,
      totalCostUsd: 0.0029,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      budgetGuardrail: {
        maxTokens: 50000,
        maxCostUsd: 0.25,
        maxExecutionSeconds: 120,
        allowExternalTools: false,
        requireHumanApprovalAboveRisk: 'medium',
      },
      steps: [
        {
          stepIndex: 1,
          phase: 'plan',
          agentRole: 'code_architect',
          actionDescription: 'Analyze dependency tree of auth packages',
          status: 'completed',
          tokensUsed: 400,
          costUsd: 0.0008,
          outputArtifact: 'Identified 3 coupling points',
          reflectionNotes: 'No circular dependencies found',
        },
        {
          stepIndex: 2,
          phase: 'execute',
          agentRole: 'code_architect',
          actionDescription: 'Draft Zero-Trust middleware and token refresher',
          status: 'completed',
          tokensUsed: 1050,
          costUsd: 0.0021,
          outputArtifact: 'Created zeroTrustAuth.ts',
        },
      ],
      finalDeliverableMarkdown:
        '## Architecture Delivered\nZero-trust architecture successfully synthesized.',
    }

    const parsed = AgentExecutionSessionSchema.parse(session)
    expect(parsed.schemaVersion).toBe('v5.5.0')
    expect(parsed.primaryRole).toBe('code_architect')
    expect(parsed.steps).toHaveLength(2)
  })

  it('rejects invalid budget boundaries', () => {
    const invalidGuardrail = {
      maxTokens: 50, // Less than minimum 100
      maxCostUsd: 10.0, // Exceeds max 5.0
      maxExecutionSeconds: 2, // Less than 5
      allowExternalTools: true,
      requireHumanApprovalAboveRisk: 'high',
    }

    expect(() => AgentBudgetGuardrailSchema.parse(invalidGuardrail)).toThrow()
  })
})
