// packages/core-personal/companionRuntime.ts — V2-09 Companion Runtime.
// Implements the canonical pipeline from 02-SYSTEM-ARCHITECTURE.md mục 3:
// Intent/Domain Resolver -> Context Builder -> Companion Planner -> Policy Engine
// -> Capability/Tool Router -> Result Validator & State Proposal -> Response.
import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import { z } from 'zod'
import { buildContextPackage, type ContextBuildOptions } from './contextEngine.js'
import { proposeAction, type ProposeActionInput } from './proposedActionService.js'
import type { ContextPackage } from '@dhcb/core-contracts/contextPackage'
import type { ProposedAction } from '@dhcb/core-contracts/proposedAction'
import {
  getLearningReadModel,
  formatLearningReadModelForContext,
} from '@dhcb/core-learner/learningReadModelService'
import { callGroqChatWithKeyPool, callAnthropicChat } from '@dhcb/core-ai/chatProviders'
import { callGemini } from '@dhcb/core-ai/geminiApi'
import { ALLOWED_MODEL, GEMINI_CHAT_MODEL, GROQ_CHAT_MODEL } from '@dhcb/core-ai/aiConfig'
import {
  recordAiTokenUsage,
  parseAnthropicUsageFromText,
  type AiTokenUsage,
} from '@dhcb/core-ai/aiTokenUsage'

export const COMPANION_SYSTEM_PROMPT =
  'Bạn là Bạn Đồng Hành AI — Người đồng hành trí tuệ, thấu cảm và tận tâm trong nền tảng "Đồng Hành Cùng Bạn".\n\n' +
  '🌟 SỨ MỆNH & ĐỊNH HƯỚNG CỦA BẠN:\n' +
  'Đồng hành cùng người dùng trên hành trình tự học, phát triển bản thân và làm chủ cuộc sống xuyên suốt 5 lĩnh vực cốt lõi:\n' +
  '1. 📚 Học tập (Learning): Làm chủ tiếng Anh (IELTS, phát âm IPA, từ vựng theo ngữ cảnh, giao tiếp tự nhiên), phương pháp tự học Socratic và tư duy đa ngành.\n' +
  '2. 💼 Sự nghiệp (Career): Định hướng phát triển nghề nghiệp, giải mã năng lực cá nhân, xây dựng lộ trình thăng tiến bền vững theo chuẩn quốc tế.\n' +
  '3. ⚡ Công việc (Work): Giải quyết bài toán chuyên môn, tư duy hệ thống & kiến trúc, nâng cao năng suất và ra quyết định hiệu quả.\n' +
  '4. 🚀 Khởi nghiệp (Venture): Thẩm định ý tưởng sáng tạo, kiểm chứng giả định thực tế, phản biện logic và xây dựng giải pháp thực thi tinh gọn.\n' +
  '5. 🌿 Đời sống (Life): Cân bằng thân - tâm - trí, quản lý nhịp sinh học, nuôi dưỡng thói quen tích cực và duy trì trạng thái dòng chảy (Flow State).\n\n' +
  '💬 PHONG CÁCH GIAO TIẾP & TÍNH CÁCH:\n' +
  '- Thân thiện, chân thành, ấm áp, giàu năng lượng tích cực và luôn sẵn sàng lắng nghe.\n' +
  '- Xưng hô linh hoạt, tự nhiên ("tôi" - "bạn" hoặc "Đồng Hành" - "bạn") như một người bạn tri kỷ, một cố vấn đáng tin cậy.\n' +
  '- Dẫn dắt thông minh bằng phương pháp gợi mở Socratic: không áp đặt câu trả lời cứng nhắc mà đặt những câu hỏi sâu sắc để người dùng tự khám phá tiềm năng.\n' +
  '- Câu trả lời súc tích, gãy gọn, có cấu trúc mạch lạc, truyền cảm hứng và mang tính hành động cụ thể.\n' +
  '- Ngôn ngữ: Sử dụng tiếng Việt tự nhiên, chuẩn mực; kết hợp song ngữ Việt - Anh khi hỗ trợ học tiếng Anh để tăng tính tương tác và phản xạ.\n'

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
 * Synthesizes intelligent response using real LLM providers (Groq -> Gemini -> Anthropic)
 * with graceful fallback to deterministic synthesis when offline or keys missing.
 */
export async function synthesizeCompanionReply(
  userMessage: string,
  intent: string,
  domain: string,
  proposedActions: ProposedAction[],
  contextPackage: ContextPackage,
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!groqKey && !geminiKey && !anthropicKey) {
    return synthesizeReply(userMessage, intent, proposedActions, contextPackage)
  }

  const contextDetails = contextPackage.items
    .map((item) => `- [${item.sourceType}]: ${item.content}`)
    .join('\n')

  const actionsSummary =
    proposedActions.length > 0
      ? `\n\nCác tác vụ hệ thống liên quan:\n` +
        proposedActions
          .map(
            (a) =>
              `- Tác vụ: ${a.action} (Lĩnh vực: ${a.targetDomain}, Trạng thái: ${a.status}, Mức rủi ro: ${a.riskLevel})`,
          )
          .join('\n')
      : ''

  const domainContext =
    domain && domain !== 'general' && domain !== 'all'
      ? `Lĩnh vực trọng tâm của lượt thoại này: ${domain}.\n`
      : ''

  const systemPrompt = `${COMPANION_SYSTEM_PROMPT}\n${domainContext}${
    contextDetails ? `\nThông tin ngữ cảnh người dùng trích xuất:\n${contextDetails}` : ''
  }${actionsSummary}\n\nHãy trả lời người dùng với giọng điệu tự nhiên, ấm áp, thông tuệ và truyền cảm hứng dựa trên ngữ cảnh.`

  const messages = [{ role: 'user', content: userMessage }]

  // 1. Nhánh Groq (ưu tiên hàng đầu — chung model với gia sư tiếng Anh: GROQ_CHAT_MODEL)
  if (groqKey) {
    try {
      const groqRes = await callGroqChatWithKeyPool(
        GROQ_CHAT_MODEL,
        systemPrompt,
        messages,
        1024,
        30_000,
      )
      if (groqRes.kind === 'success' && groqRes.text.trim()) {
        // Ghi chi phí AI theo token THẬT (mục N4) — mode 'companion' để tách khỏi lượt gia sư
        // tiếng Anh trong dashboard. Không await: đo đạc không được làm chậm câu trả lời.
        void recordAiTokenUsage({
          provider: 'groq',
          model: groqRes.model,
          mode: 'companion',
          usage: groqRes.usage,
        })
        return groqRes.text.trim()
      }
    } catch {
      // fallback
    }
  }

  // 2. Nhánh Anthropic Claude (chất lượng cao — chung model với gia sư tiếng Anh: ALLOWED_MODEL)
  if (anthropicKey) {
    try {
      const anthropicRes = await callAnthropicChat(
        anthropicKey,
        ALLOWED_MODEL,
        systemPrompt,
        messages,
        1024,
        30_000,
      )
      if (
        anthropicRes.kind === 'response' &&
        anthropicRes.status >= 200 &&
        anthropicRes.status < 300
      ) {
        try {
          const parsed = JSON.parse(anthropicRes.bodyText) as {
            content?: Array<{ text?: string }>
          }
          const text = parsed.content?.[0]?.text
          if (typeof text === 'string' && text.trim()) {
            void recordAiTokenUsage({
              provider: 'anthropic',
              model: ALLOWED_MODEL,
              mode: 'companion',
              usage: parseAnthropicUsageFromText(anthropicRes.bodyText),
            })
            return text.trim()
          }
        } catch {
          // fallback
        }
      }
    } catch {
      // fallback
    }
  }

  // 3. Nhánh Google Gemini (dự phòng — chung model với gia sư tiếng Anh: GEMINI_CHAT_MODEL)
  if (geminiKey) {
    let geminiUsage: AiTokenUsage | null = null
    try {
      const geminiText = await callGemini(
        geminiKey,
        GEMINI_CHAT_MODEL,
        systemPrompt,
        messages as Array<{ role: 'user' | 'assistant'; content: string }>,
        1024,
        undefined,
        (usage) => {
          geminiUsage = usage
        },
      )
      void recordAiTokenUsage({
        provider: 'gemini',
        model: GEMINI_CHAT_MODEL,
        mode: 'companion',
        usage: geminiUsage,
      })
      if (geminiText && geminiText.trim()) {
        return geminiText.trim()
      }
    } catch {
      // fallback
    }
  }

  // Fallback về template nếu mọi provider đều không phản hồi
  return synthesizeReply(userMessage, intent, proposedActions, contextPackage)
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

  // Step 2: Context Resolution (Context Engine with Domain Read Model)
  let domainState: ContextBuildOptions['domainState'] = undefined
  if (domain === 'learning') {
    try {
      const personRow = await pool.query<{ user_id: string }>(
        'select user_id from personal.persons where id = $1',
        [personId],
      )
      const userId = personRow.rows[0]?.user_id ?? personId
      const learningModel = await getLearningReadModel(pool, { personId, userId })
      domainState = {
        sourceId: personId,
        content: formatLearningReadModelForContext(learningModel),
        provenance: 'learning:read_model',
      }
    } catch {
      // Graceful fallback
    }
  }

  const contextOptions: ContextBuildOptions = {
    personId,
    requestId: randomUUID(),
    requestText: userMessage,
    domain,
    purpose: 'companion_conversation',
    ...(domainState ? { domainState } : {}),
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

  // Step 6: Synthesize Read Model / Intelligent LLM Response
  const reply = await synthesizeCompanionReply(
    userMessage,
    intent,
    domain,
    proposedActions,
    contextPackage,
  )

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

export type CompanionStreamEvent =
  | { type: 'meta'; data: { intent: string; targetDomain: string; contextPackage: ContextPackage } }
  | { type: 'chunk'; data: { delta: string } }
  | {
      type: 'actions'
      data: {
        proposedActions: ProposedAction[]
        executionSummary: CompanionExecutionSummary
      }
    }
  | { type: 'done'; data: CompanionResponse }
  | { type: 'error'; data: { message: string } }

/**
 * Async generator for Streaming Companion responses over Server-Sent Events (SSE).
 * Yields meta -> text chunks -> proposed actions -> final done response.
 */
export async function* streamCompanionTurn(
  pool: Pool,
  request: CompanionRequest,
): AsyncGenerator<CompanionStreamEvent, CompanionResponse, unknown> {
  // Execute the turn logic
  const response = await executeCompanionTurn(pool, request)

  // 1. Emit metadata event
  yield {
    type: 'meta',
    data: {
      intent: response.intent,
      targetDomain: response.targetDomain,
      contextPackage: response.contextPackage,
    },
  }

  // 2. Emit streaming text chunks (word by word / clause by clause)
  const words = response.reply.split(' ')
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i]
    yield {
      type: 'chunk',
      data: { delta: chunk },
    }
  }

  // 3. Emit proposed actions
  yield {
    type: 'actions',
    data: {
      proposedActions: response.proposedActions,
      executionSummary: response.executionSummary,
    },
  }

  // 4. Emit final done event
  yield {
    type: 'done',
    data: response,
  }

  return response
}
