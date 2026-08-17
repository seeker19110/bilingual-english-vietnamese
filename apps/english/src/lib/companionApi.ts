// apps/english/src/lib/companionApi.ts — Client API wrapper for Companion Runtime and Proposed Actions
import { getAuthHeader } from '@core/authHeader'
import type { ContextPackage } from '../../../../packages/core-contracts/contextPackage'
import type { ProposedAction } from '../../../../packages/core-contracts/proposedAction'

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

export interface SendCompanionMessageParams {
  message: string
  intent?: string
  domain?: string
  tokenBudget?: number
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
