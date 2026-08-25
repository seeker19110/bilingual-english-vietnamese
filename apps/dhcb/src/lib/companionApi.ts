// apps/dhcb/src/lib/companionApi.ts — Client API wrapper for Companion Runtime and Proposed Actions
import { getAuthHeader } from '@core/authHeader'
import type { ContextPackage } from '@dhcb/core-contracts/contextPackage'
import type { ProposedAction } from '@dhcb/core-contracts/proposedAction'
import type { InteractiveQuestion } from '@dhcb/core-contracts/interactiveQuestion'

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
  // Câu hỏi tick chọn kèm lượt trả lời — server luôn trả mảng, nhưng để optional để client vẫn
  // chạy được với bản server cũ chưa có trường này.
  interactiveQuestions?: InteractiveQuestion[]
}

export interface SendCompanionMessageParams {
  message: string
  intent?: string
  domain?: string
  tokenBudget?: number
}

export interface CompanionStreamCallbacks {
  onMeta?: (meta: { intent: string; targetDomain: string; contextPackage: ContextPackage }) => void
  onChunk?: (delta: string) => void
  onActions?: (actions: {
    proposedActions: ProposedAction[]
    executionSummary: CompanionExecutionSummary
  }) => void
  onQuestions?: (questions: InteractiveQuestion[]) => void
  onDone?: (response: CompanionResponse) => void
  onError?: (error: Error) => void
}

/**
 * Sends a message turn to the Multi-Domain Companion Runtime.
 */
export async function sendCompanionMessage(
  params: SendCompanionMessageParams,
): Promise<CompanionResponse> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/companion', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }

  return res.json()
}

/**
 * Sends a message turn to the Multi-Domain Companion Runtime with real-time SSE streaming.
 */
export async function sendCompanionMessageStream(
  params: SendCompanionMessageParams,
  callbacks: CompanionStreamCallbacks,
): Promise<CompanionResponse> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/companion', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...params, stream: true }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    const err = new Error(errorBody.error || `HTTP error ${res.status}`)
    callbacks.onError?.(err)
    throw err
  }

  if (!res.body) {
    throw new Error('Response body is missing')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResponse: CompanionResponse | null = null
  let isStreaming = true
  while (isStreaming) {
    const { done, value } = await reader.read()
    if (done) {
      isStreaming = false
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.trim()) continue
      const lines = part.split('\n')
      let eventType = 'message'
      let dataText = ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataText = line.slice(5).trim()
        }
      }

      if (!dataText) continue
      try {
        const parsed = JSON.parse(dataText)
        if (eventType === 'meta') {
          callbacks.onMeta?.(parsed)
        } else if (eventType === 'chunk') {
          callbacks.onChunk?.(parsed.delta)
        } else if (eventType === 'actions') {
          callbacks.onActions?.(parsed)
        } else if (eventType === 'questions') {
          callbacks.onQuestions?.(parsed.interactiveQuestions)
        } else if (eventType === 'done') {
          finalResponse = parsed as CompanionResponse
          callbacks.onDone?.(finalResponse)
        } else if (eventType === 'error') {
          const err = new Error(parsed.message || parsed.error || 'SSE Error')
          callbacks.onError?.(err)
          throw err
        }
      } catch {
        // Ignore parse errors on partial chunks
      }
    }
  }

  if (!finalResponse) {
    throw new Error('Stream ended without completion event')
  }

  return finalResponse
}

/**
 * List proposed actions for the authenticated person.
 */
export async function listProposedActions(
  status?: 'pending' | 'confirmed' | 'rejected' | 'committed',
): Promise<ProposedAction[]> {
  const url = new URL(window.location.origin + '/api/proposed-actions')
  if (status) {
    url.searchParams.set('status', status)
  }

  const headers = await getAuthHeader()
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }

  const data = await res.json()
  return data.actions
}

/**
 * Confirm a pending proposed action.
 */
export async function confirmProposedAction(
  id: string,
  expectedVersion: number,
): Promise<{ action: ProposedAction }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/proposed-actions', {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'confirm',
      id,
      expectedVersion,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }

  return res.json()
}

/**
 * Reject a pending proposed action.
 */
export async function rejectProposedAction(
  id: string,
  expectedVersion: number,
  reason?: string,
): Promise<{ action: ProposedAction }> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/proposed-actions', {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'reject',
      id,
      expectedVersion,
      ...(reason ? { reason } : {}),
    }),
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP error ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }

  return res.json()
}
