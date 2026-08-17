// packages/core-personal/companionRuntime.test.ts — Unit tests for Companion Runtime pipeline.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import {
  resolveIntentAndDomain,
  generatePlan,
  synthesizeReply,
  executeCompanionTurn,
} from './companionRuntime.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const CTX_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const SOURCE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

const contextEngineMock = vi.hoisted(() => ({
  buildContextPackage: vi.fn(),
}))

vi.mock('./contextEngine.js', () => ({
  buildContextPackage: (...a: unknown[]) => contextEngineMock.buildContextPackage(...a),
}))

const proposedActionMock = vi.hoisted(() => ({
  proposeAction: vi.fn(),
}))

vi.mock('./proposedActionService.js', () => ({
  proposeAction: (...a: unknown[]) => proposedActionMock.proposeAction(...a),
}))

const pool = {} as Pool

beforeEach(() => {
  vi.clearAllMocks()
  contextEngineMock.buildContextPackage.mockResolvedValue({
    id: CTX_ID,
    personId: PERSON_ID,
    requestId: 'req-1',
    items: [],
    tokenBudget: 2000,
    tokenUsed: 0,
    createdAt: new Date().toISOString(),
    schemaVersion: 1,
  })
  proposedActionMock.proposeAction.mockResolvedValue({
    action: {
      id: '22222222-2222-4222-8222-222222222222',
      personId: PERSON_ID,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: {},
      riskLevel: 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      schemaVersion: 1,
    },
    autoExecuted: false,
  })
})

describe('resolveIntentAndDomain', () => {
  it('respects explicit intent and domain', () => {
    const res = resolveIntentAndDomain('hello', 'custom_intent', 'custom_domain')
    expect(res.intent).toBe('custom_intent')
    expect(res.domain).toBe('custom_domain')
  })

  it('detects goal-setting intent', () => {
    const res = resolveIntentAndDomain('Tôi muốn đặt mục tiêu học IELTS 7.5')
    expect(res.intent).toBe('set_learning_goal')
    expect(res.domain).toBe('learning')
  })

  it('detects dictionary lookup intent', () => {
    const res = resolveIntentAndDomain('Từ serendipity nghĩa là gì?')
    expect(res.intent).toBe('dictionary_lookup')
    expect(res.domain).toBe('learning')
  })

  it('detects profile update fact intent', () => {
    const res = resolveIntentAndDomain('Tôi thích đọc sách khoa học viễn tưởng')
    expect(res.intent).toBe('update_profile_fact')
    expect(res.domain).toBe('profile')
  })

  it('detects memory creation intent', () => {
    const res = resolveIntentAndDomain('Ghi nhớ giúp tôi cuộc họp ngày mai')
    expect(res.intent).toBe('create_memory')
    expect(res.domain).toBe('personal')
  })

  it('falls back to general_conversation', () => {
    const res = resolveIntentAndDomain('Chào bạn buổi sáng')
    expect(res.intent).toBe('general_conversation')
    expect(res.domain).toBe('learning')
  })
})

describe('generatePlan', () => {
  it('generates a goal-setting step with medium risk', () => {
    const steps = generatePlan('set_learning_goal', 'learning', 'Tôi muốn học IELTS')
    expect(steps.length).toBe(1)
    expect(steps[0]?.capabilityId).toBe('learning.update_goal')
    expect(steps[0]?.riskLevel).toBe('medium')
  })

  it('generates a dictionary lookup step with low risk', () => {
    const steps = generatePlan('dictionary_lookup', 'learning', 'Nghĩa của từ "comprehension"')
    expect(steps.length).toBe(1)
    expect(steps[0]?.capabilityId).toBe('dictionary.lookup')
    expect(steps[0]?.payload.word).toBe('comprehension')
    expect(steps[0]?.riskLevel).toBe('low')
  })

  it('returns empty plan for general conversation', () => {
    const steps = generatePlan('general_conversation', 'learning', 'Xin chào')
    expect(steps.length).toBe(0)
  })
})

describe('synthesizeReply', () => {
  it('synthesizes response with pending actions notice', () => {
    const text = synthesizeReply(
      'Đặt mục tiêu',
      'set_learning_goal',
      [
        {
          id: '22222222-2222-4222-8222-222222222222',
          personId: PERSON_ID,
          capabilityId: 'learning.update_goal',
          action: 'update_goal',
          targetDomain: 'learning',
          payload: {},
          riskLevel: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
          schemaVersion: 1,
        },
      ],
      {
        id: CTX_ID,
        personId: PERSON_ID,
        requestId: 'req-1',
        items: [
          {
            sourceType: 'current_request',
            sourceId: SOURCE_ID,
            content: 'test',
            provenance: 'test',
            sensitivity: 'public',
            tokenEstimate: 5,
          },
        ],
        tokenBudget: 2000,
        tokenUsed: 5,
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
    )

    expect(text).toContain('Tôi đã ghi nhận mong muốn học tập của bạn.')
    expect(text).toContain('Có 1 đề xuất hành động cần bạn xác nhận')
    expect(text).toContain('[Sử dụng 5/2000 token ngữ cảnh]')
  })
})

describe('executeCompanionTurn end-to-end execution pipeline', () => {
  it('executes full pipeline: Intent -> Context -> Planner -> Policy -> Actions -> Response', async () => {
    proposedActionMock.proposeAction.mockResolvedValueOnce({
      action: {
        id: '22222222-2222-4222-8222-222222222222',
        personId: PERSON_ID,
        capabilityId: 'dictionary.lookup',
        action: 'lookup',
        targetDomain: 'learning',
        payload: { word: 'fluent' },
        riskLevel: 'low',
        status: 'committed',
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
      autoExecuted: true,
    })

    const response = await executeCompanionTurn(pool, {
      personId: PERSON_ID,
      userMessage: 'Tra từ "fluent" nghĩa là gì',
    })

    expect(response.intent).toBe('dictionary_lookup')
    expect(response.targetDomain).toBe('learning')
    expect(response.proposedActions.length).toBe(1)
    expect(response.proposedActions[0]?.status).toBe('committed')
    expect(response.executionSummary.executedSteps).toBe(1)
    expect(response.executionSummary.pendingConfirmationSteps).toBe(0)
    expect(response.reply).toContain('Tôi đã tra cứu từ vựng theo yêu cầu của bạn.')
    expect(contextEngineMock.buildContextPackage).toHaveBeenCalled()
    expect(proposedActionMock.proposeAction).toHaveBeenCalled()
  })
})
