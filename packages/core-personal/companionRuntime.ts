// packages/core-personal/companionRuntime.ts — V2-09 Companion Runtime.
// Implements the canonical pipeline from 02-SYSTEM-ARCHITECTURE.md mục 3:
// Intent/Domain Resolver -> Context Builder -> Companion Planner -> Policy Engine
// -> Capability/Tool Router -> Result Validator & State Proposal -> Response.
import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import { z } from 'zod'
import { buildContextPackage, type ContextBuildOptions } from './contextEngine.js'
import { proposeAction, type ProposeActionInput } from './proposedActionService.js'
import type { ContextPackage } from '../core-contracts/contextPackage.js'
import type { ProposedAction } from '../core-contracts/proposedAction.js'

export const CompanionRequestSchema = z.object({
  personId: z.string().uuid(),
  userMessage: z.string().min(1).max(2000),
  intent: z.string().max(100).optional(),
  targetDomain: z.string().max(100).optional(),
  tokenBudget: z.number().int().positive().max(8000).optional(),
})

export type CompanionRequest = z.infer<typeof CompanionRequestSchema>

export interface PlannedStep {
  capabilityId: string
  action: string
  targetDomain: string
  payload: Record<string, unknown>
  riskLevel: 'low' | 'medium' | 'high' | 'restricted'
  description: string
}

export interface CompanionExecutionSummary {
  plannedSteps: number
  executedSteps: number
  pendingConfirmationSteps: number
  rejectedSteps: number
}

export interface CompanionResponse {
  reply: string
  intent: string
  targetDomain: string
  contextPackage: ContextPackage
  proposedActions: ProposedAction[]
  executionSummary: CompanionExecutionSummary
}

/**
 * 1. Intent & Domain Resolver
 * Deterministically extracts intent and domain based on pattern analysis or user specification.
 */
export function resolveIntentAndDomain(
  userMessage: string,
  explicitIntent?: string,
  explicitDomain?: string,
): { intent: string; domain: string } {
  if (explicitIntent && explicitDomain) {
    return { intent: explicitIntent, domain: explicitDomain }
  }

  const msg = userMessage.trim().toLowerCase()

  // Goal-setting patterns
  if (
    msg.includes('mục tiêu') ||
    msg.includes('đặt mục tiêu') ||
    msg.includes('goal') ||
    msg.includes('học ielts') ||
    msg.includes('ielts')
  ) {
    return {
      intent: explicitIntent ?? 'set_learning_goal',
      domain: explicitDomain ?? 'learning',
    }
  }

  // Dictionary / Lookup patterns
  if (
    msg.includes('nghĩa là gì') ||
    msg.includes('nghĩa của từ') ||
    msg.includes('tra từ') ||
    msg.includes('lookup') ||
    msg.includes('dictionary')
  ) {
    return {
      intent: explicitIntent ?? 'dictionary_lookup',
      domain: explicitDomain ?? 'learning',
    }
  }

  // Profile / Fact update patterns
  if (
    msg.includes('tôi thích') ||
    msg.includes('sở thích') ||
    msg.includes('thông tin của tôi') ||
    msg.includes('cập nhật thông tin') ||
    msg.includes('tôi là')
  ) {
    return {
      intent: explicitIntent ?? 'update_profile_fact',
      domain: explicitDomain ?? 'profile',
    }
  }

  // Memory / Note patterns
  if (
    msg.includes('ghi nhớ') ||
    msg.includes('nhớ giúp') ||
    msg.includes('lưu ý') ||
    msg.includes('remember') ||
    msg.includes('note')
  ) {
    return {
      intent: explicitIntent ?? 'create_memory',
      domain: explicitDomain ?? 'personal',
    }
  }

  return {
    intent: explicitIntent ?? 'general_conversation',
    domain: explicitDomain ?? 'learning',
  }
}

/**
 * 2. Companion Planner
 * Generates an executable plan (list of PlannedSteps) from the resolved intent & context.
 */
export function generatePlan(intent: string, domain: string, userMessage: string): PlannedStep[] {
  const steps: PlannedStep[] = []

  switch (intent) {
    case 'set_learning_goal':
      steps.push({
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: domain,
        payload: {
          rawMessage: userMessage,
          source: 'companion_runtime',
          proposedAt: new Date().toISOString(),
        },
        riskLevel: 'medium',
        description: 'Cập nhật mục tiêu học tập cho người học',
      })
      break

    case 'dictionary_lookup': {
      // Extract candidate word if possible
      const match = userMessage.match(/(?:nghĩa của từ|tra từ|từ)\s+["']?([a-zA-Z\s-]+)["']?/i)
      const word = match ? match[1]?.trim() : userMessage.trim()
      steps.push({
        capabilityId: 'dictionary.lookup',
        action: 'lookup',
        targetDomain: 'learning',
        payload: { word: word || 'learning' },
        riskLevel: 'low',
        description: `Tra cứu định nghĩa từ vựng: ${word}`,
      })
      break
    }

    case 'update_profile_fact':
      steps.push({
        capabilityId: 'profile.update_fact',
        action: 'update_fact',
        targetDomain: domain,
        payload: {
          rawText: userMessage,
          origin: 'observed',
          confidence: 0.85,
        },
        riskLevel: 'low',
        description: 'Cập nhật sự thật hồ sơ người học',
      })
      break

    case 'create_memory':
      steps.push({
        capabilityId: 'memory.create_record',
        action: 'create_record',
        targetDomain: 'personal',
        payload: {
          content: userMessage,
          namespace: 'semantic',
          sensitivity: 'personal',
        },
        riskLevel: 'low',
        description: 'Lưu bản ghi bộ nhớ mới',
      })
      break

    default:
      // No active tool proposal needed for simple chat
      break
  }

  return steps
}

/**
 * 3. Synthesizes a response message for the user based on context and executed actions.
 */
export function synthesizeReply(
  userMessage: string,
  intent: string,
  proposedActions: ProposedAction[],
  contextPackage: ContextPackage,
): string {
  const committed = proposedActions.filter((a) => a.status === 'committed')
  const pending = proposedActions.filter((a) => a.status === 'pending')
  const rejected = proposedActions.filter((a) => a.status === 'rejected')

  const parts: string[] = []

  if (intent === 'set_learning_goal') {
    parts.push('Tôi đã ghi nhận mong muốn học tập của bạn.')
  } else if (intent === 'dictionary_lookup') {
    parts.push('Tôi đã tra cứu từ vựng theo yêu cầu của bạn.')
  } else if (intent === 'update_profile_fact') {
    parts.push('Tôi đã cập nhật thông tin hồ sơ của bạn.')
  } else if (intent === 'create_memory') {
    parts.push('Tôi đã lưu lại ghi nhớ này vào kho kiến thức cá nhân.')
  } else {
    parts.push(`Đồng Hành đã nhận được tin nhắn: "${userMessage}".`)
  }

  if (committed.length > 0) {
    parts.push(`Đã tự động thực hiện ${committed.length} tác vụ an toàn.`)
  }

  if (pending.length > 0) {
    parts.push(`Có ${pending.length} đề xuất hành động cần bạn xác nhận trước khi áp dụng.`)
  }

  if (rejected.length > 0) {
    parts.push(`Có ${rejected.length} tác vụ bị từ chối do chính sách bảo mật.`)
  }

  if (contextPackage.items.length > 0) {
    parts.push(`[Sử dụng ${contextPackage.tokenUsed}/${contextPackage.tokenBudget} token ngữ cảnh]`)
  }

  return parts.join(' ')
}

/**
 * Main Companion Runtime Execution Entrypoint.
 * Connects Intent/Domain Resolution -> Context Builder -> Planner -> Policy Gate -> ProposedActions -> Response.
 */
export async function executeCompanionTurn(
  pool: Pool,
  request: CompanionRequest,
): Promise<CompanionResponse> {
  const validated = CompanionRequestSchema.parse(request)
  const {
    personId,
    userMessage,
    intent: explicitIntent,
    targetDomain: explicitDomain,
    tokenBudget,
  } = validated

  // Step 1: Intent & Domain Resolution
  const { intent, domain } = resolveIntentAndDomain(userMessage, explicitIntent, explicitDomain)

  // Step 2: Context Resolution (Context Engine)
  const contextOptions: ContextBuildOptions = {
    personId,
    requestId: randomUUID(),
    requestText: userMessage,
    domain,
    purpose: 'companion_conversation',
    ...(tokenBudget !== undefined ? { tokenBudget } : {}),
  }
  const contextPackage = await buildContextPackage(pool, contextOptions)

  // Step 3: Companion Planner
  const plannedSteps = generatePlan(intent, domain, userMessage)

  // Step 4 & 5: Policy Gate & Capability/Tool Router (State Proposal via proposeAction)
  const proposedActions: ProposedAction[] = []
  let executedCount = 0
  let pendingCount = 0
  let rejectedCount = 0

  for (const step of plannedSteps) {
    const proposeInput: ProposeActionInput = {
      personId,
      capabilityId: step.capabilityId,
      action: step.action,
      targetDomain: step.targetDomain,
      payload: step.payload,
      riskLevel: step.riskLevel,
    }

    const result = await proposeAction(pool, proposeInput)
    proposedActions.push(result.action)

    if (result.action.status === 'committed') {
      executedCount++
    } else if (result.action.status === 'pending') {
      pendingCount++
    } else if (result.action.status === 'rejected') {
      rejectedCount++
    }
  }

  // Step 6: Synthesize Read Model / Response
  const reply = synthesizeReply(userMessage, intent, proposedActions, contextPackage)

  return {
    reply,
    intent,
    targetDomain: domain,
    contextPackage,
    proposedActions,
    executionSummary: {
      plannedSteps: plannedSteps.length,
      executedSteps: executedCount,
      pendingConfirmationSteps: pendingCount,
      rejectedSteps: rejectedCount,
    },
  }
}
