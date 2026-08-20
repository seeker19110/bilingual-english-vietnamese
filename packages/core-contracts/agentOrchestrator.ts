import { z } from 'zod'

export const AutonomousAgentRoleSchema = z.enum([
  'socratic_mentor',
  'career_strategist',
  'code_architect',
  'venture_validator',
  'life_concierge',
])
export type AutonomousAgentRole = z.infer<typeof AutonomousAgentRoleSchema>

export const AgentBudgetGuardrailSchema = z.object({
  maxTokens: z.number().int().min(100).max(500000),
  maxCostUsd: z.number().min(0.0001).max(5.0),
  maxExecutionSeconds: z.number().int().min(5).max(600),
  allowExternalTools: z.boolean(),
  requireHumanApprovalAboveRisk: z.enum(['low', 'medium', 'high']),
})
export type AgentBudgetGuardrail = z.infer<typeof AgentBudgetGuardrailSchema>

export const AgentTaskStepSchema = z.object({
  stepIndex: z.number().int().min(1),
  phase: z.enum(['plan', 'execute', 'verify', 'reflect', 'handoff']),
  agentRole: AutonomousAgentRoleSchema,
  actionDescription: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
  tokensUsed: z.number().int().min(0),
  costUsd: z.number().min(0),
  outputArtifact: z.string().optional(),
  reflectionNotes: z.string().optional(),
})
export type AgentTaskStep = z.infer<typeof AgentTaskStepSchema>

export const AgentExecutionSessionSchema = z.object({
  schemaVersion: z.literal('v5.5.0'),
  sessionId: z.string(),
  personId: z.string(),
  sessionTitle: z.string(),
  primaryRole: AutonomousAgentRoleSchema,
  status: z.enum([
    'idle',
    'in_progress',
    'awaiting_approval',
    'completed',
    'failed',
    'budget_exceeded',
  ]),
  totalTokensUsed: z.number().int().min(0),
  totalCostUsd: z.number().min(0),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  budgetGuardrail: AgentBudgetGuardrailSchema,
  steps: z.array(AgentTaskStepSchema),
  finalDeliverableMarkdown: z.string().optional(),
})
export type AgentExecutionSession = z.infer<typeof AgentExecutionSessionSchema>
