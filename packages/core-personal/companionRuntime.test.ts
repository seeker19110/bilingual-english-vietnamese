// packages/core-personal/companionRuntime.test.ts — Unit tests for Companion Runtime pipeline.
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import {
  resolveIntentAndDomain,
  generatePlan,
  synthesizeReply,
  synthesizeCompanionReply,
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

const chatProvidersMock = vi.hoisted(() => ({
  callGroqChat: vi.fn(),
  callAnthropicChat: vi.fn(),
}))

vi.mock('../core-ai/chatProviders.js', () => ({
  callGroqChat: (...a: unknown[]) => chatProvidersMock.callGroqChat(...a),
  callAnthropicChat: (...a: unknown[]) => chatProvidersMock.callAnthropicChat(...a),
}))

const geminiApiMock = vi.hoisted(() => ({
  callGemini: vi.fn(),
}))

vi.mock('../../api/_lib/geminiApi.js', () => ({
  callGemini: (...a: unknown[]) => geminiApiMock.callGemini(...a),
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

  it('handles profile fact and memory intents and rejected actions', async () => {
    // Rejected action
    proposedActionMock.proposeAction.mockResolvedValueOnce({
      action: {
        id: '22222222-2222-4222-8222-222222222222',
        personId: PERSON_ID,
        capabilityId: 'profile.update_fact',
        action: 'update_fact',
        targetDomain: 'profile',
        payload: { fact: 'Likes sci-fi' },
        riskLevel: 'low',
        status: 'rejected',
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
      autoExecuted: false,
    })

    const poolWithUser = {
      query: vi.fn().mockResolvedValue({ rows: [{ user_id: 'user-123' }] }),
    } as unknown as Pool

    const response = await executeCompanionTurn(poolWithUser, {
      personId: PERSON_ID,
      userMessage: 'Tôi thích đọc sách viễn tưởng',
    })

    expect(response.intent).toBe('update_profile_fact')
    expect(response.executionSummary.rejectedSteps).toBe(1)
    expect(response.reply).toContain('Tôi đã cập nhật thông tin hồ sơ của bạn.')

    // Memory intent synthesis
    const memoryReply = synthesizeReply('Ghi nhớ lịch', 'create_memory', [], {
      id: CTX_ID,
      personId: PERSON_ID,
      requestId: 'req-2',
      items: [],
      tokenBudget: 2000,
      tokenUsed: 0,
      createdAt: new Date().toISOString(),
      schemaVersion: 1,
    })
    expect(memoryReply).toContain('Tôi đã lưu lại ghi nhớ này vào kho kiến thức cá nhân.')
  })
})

// Nhánh biên: chỉ truyền một trong hai tham số explicit, các intent còn lại, đường ngữ cảnh domain learning.
describe('CompanionRuntime — nhánh biên', () => {
  it('chỉ truyền explicitIntent (thiếu domain) → vẫn nhận diện domain theo mẫu câu', () => {
    const res = resolveIntentAndDomain('Tôi muốn học IELTS', 'my_intent')
    expect(res.intent).toBe('my_intent')
    expect(res.domain).toBe('learning')
  })

  it('chỉ truyền explicitDomain (thiếu intent) → intent suy ra từ mẫu câu', () => {
    const memory = resolveIntentAndDomain('Nhớ giúp tôi lịch họp', undefined, 'my_domain')
    expect(memory.intent).toBe('create_memory')
    expect(memory.domain).toBe('my_domain')

    const profile = resolveIntentAndDomain('Tôi là kỹ sư phần mềm', undefined, 'my_domain')
    expect(profile.intent).toBe('update_profile_fact')
    expect(profile.domain).toBe('my_domain')

    const lookup = resolveIntentAndDomain('dictionary check', undefined, 'my_domain')
    expect(lookup.intent).toBe('dictionary_lookup')

    const fallback = resolveIntentAndDomain('Chào buổi tối', undefined, 'my_domain')
    expect(fallback.intent).toBe('general_conversation')
    expect(fallback.domain).toBe('my_domain')
  })

  it('generatePlan tạo bước cập nhật hồ sơ và bước lưu bộ nhớ', () => {
    const profile = generatePlan('update_profile_fact', 'profile', 'Tôi thích cà phê')
    expect(profile[0]?.capabilityId).toBe('profile.update_fact')
    expect(profile[0]?.riskLevel).toBe('low')

    const memory = generatePlan('create_memory', 'personal', 'Ghi nhớ họp 9h')
    expect(memory[0]?.capabilityId).toBe('memory.create_record')
    expect(memory[0]?.payload.namespace).toBe('semantic')
  })

  it('dictionary_lookup không khớp mẫu regex → lấy nguyên câu làm từ khoá', () => {
    const steps = generatePlan('dictionary_lookup', 'learning', 'lookup please')
    expect(steps[0]?.payload.word).toBe('lookup please')
  })

  it('dictionary_lookup với câu rỗng → dùng từ mặc định "learning"', () => {
    const steps = generatePlan('dictionary_lookup', 'learning', '   ')
    expect(steps[0]?.payload.word).toBe('learning')
  })

  it('synthesizeReply cho các intent còn lại và trường hợp không có ngữ cảnh', () => {
    const emptyCtx = {
      id: CTX_ID,
      personId: PERSON_ID,
      requestId: 'req-1',
      items: [],
      tokenBudget: 2000,
      tokenUsed: 0,
      createdAt: new Date().toISOString(),
      schemaVersion: 1,
    }

    expect(synthesizeReply('x', 'dictionary_lookup', [], emptyCtx)).toBe(
      'Tôi đã tra cứu từ vựng theo yêu cầu của bạn.',
    )
    expect(synthesizeReply('x', 'update_profile_fact', [], emptyCtx)).toBe(
      'Tôi đã cập nhật thông tin hồ sơ của bạn.',
    )
    expect(synthesizeReply('x', 'create_memory', [], emptyCtx)).toBe(
      'Tôi đã lưu lại ghi nhớ này vào kho kiến thức cá nhân.',
    )
    // Intent lạ → câu trả lời mặc định, và không có item ngữ cảnh nên không kèm chú thích token.
    const generic = synthesizeReply('Chào bạn', 'general_conversation', [], emptyCtx)
    expect(generic).toBe('Đồng Hành đã nhận được tin nhắn: "Chào bạn".')
    expect(generic).not.toContain('token ngữ cảnh')
  })

  it('synthesizeReply đếm cả tác vụ đã chạy và tác vụ bị chính sách từ chối', () => {
    const baseAction = {
      personId: PERSON_ID,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: {},
      riskLevel: 'low' as const,
      createdAt: new Date().toISOString(),
      schemaVersion: 1,
    }

    const text = synthesizeReply(
      'x',
      'set_learning_goal',
      [
        { ...baseAction, id: '22222222-2222-4222-8222-222222222222', status: 'committed' },
        { ...baseAction, id: '33333333-3333-4333-8333-333333333333', status: 'rejected' },
      ],
      {
        id: CTX_ID,
        personId: PERSON_ID,
        requestId: 'req-1',
        items: [],
        tokenBudget: 2000,
        tokenUsed: 0,
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
    )

    expect(text).toContain('Đã tự động thực hiện 1 tác vụ an toàn.')
    expect(text).toContain('Có 1 tác vụ bị từ chối do chính sách bảo mật.')
  })
})

describe('executeCompanionTurn — nhánh ngữ cảnh & đếm trạng thái', () => {
  it('domain learning: nạp Learning Read Model vào ngữ cảnh, tôn trọng tokenBudget truyền vào', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [{ user_id: 'user-42' }] })
    const livePool = { query: queryMock } as unknown as Pool

    proposedActionMock.proposeAction.mockResolvedValueOnce({
      action: {
        id: '22222222-2222-4222-8222-222222222222',
        personId: PERSON_ID,
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: 'learning',
        payload: {},
        riskLevel: 'medium',
        status: 'rejected',
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
      autoExecuted: false,
    })

    const res = await executeCompanionTurn(livePool, {
      personId: PERSON_ID,
      userMessage: 'Tôi muốn đặt mục tiêu IELTS 7.0',
      tokenBudget: 1200,
    })

    expect(res.executionSummary.rejectedSteps).toBe(1)
    const ctxOptions = contextEngineMock.buildContextPackage.mock.calls[0]![1] as {
      tokenBudget?: number
      domainState?: { provenance: string }
    }
    expect(ctxOptions.tokenBudget).toBe(1200)
    expect(ctxOptions.domainState?.provenance).toBe('learning:read_model')
  })

  it('domain không phải learning → bỏ qua hẳn bước đọc Learning Read Model', async () => {
    const queryMock = vi.fn()
    const livePool = { query: queryMock } as unknown as Pool

    const res = await executeCompanionTurn(livePool, {
      personId: PERSON_ID,
      userMessage: 'Chào bạn',
      targetDomain: 'personal',
      intent: 'general_conversation',
    })

    expect(queryMock).not.toHaveBeenCalled()
    expect(res.targetDomain).toBe('personal')
    expect(res.executionSummary.plannedSteps).toBe(0)
    const ctxOptions = contextEngineMock.buildContextPackage.mock.calls[0]![1] as {
      domainState?: unknown
      tokenBudget?: number
    }
    expect(ctxOptions.domainState).toBeUndefined()
    expect(ctxOptions.tokenBudget).toBeUndefined()
  })

  it('không tìm thấy person row → dùng personId thay cho userId', async () => {
    const queryMock = vi.fn().mockResolvedValue({ rows: [] })
    const livePool = { query: queryMock } as unknown as Pool

    await executeCompanionTurn(livePool, {
      personId: PERSON_ID,
      userMessage: 'Chào bạn',
    })

    expect(queryMock).toHaveBeenCalledWith('select user_id from personal.persons where id = $1', [
      PERSON_ID,
    ])
  })
})

describe('executeCompanionTurn — trạng thái confirmed không rơi vào ô đếm nào', () => {
  it('action ở trạng thái confirmed → cả 3 bộ đếm đều là 0', async () => {
    const livePool = { query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool

    proposedActionMock.proposeAction.mockResolvedValueOnce({
      action: {
        id: '22222222-2222-4222-8222-222222222222',
        personId: PERSON_ID,
        capabilityId: 'learning.update_goal',
        action: 'update_goal',
        targetDomain: 'learning',
        payload: {},
        riskLevel: 'medium',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        schemaVersion: 1,
      },
      autoExecuted: false,
    })

    const res = await executeCompanionTurn(livePool, {
      personId: PERSON_ID,
      userMessage: 'Tôi muốn đặt mục tiêu IELTS 7.0',
    })

    expect(res.executionSummary).toMatchObject({
      plannedSteps: 1,
      executedSteps: 0,
      pendingConfirmationSteps: 0,
      rejectedSteps: 0,
    })
  })

  it('action ở trạng thái pending → đếm vào ô chờ xác nhận', async () => {
    const livePool = { query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool

    // Dùng mock mặc định trong beforeEach (status = 'pending').
    const res = await executeCompanionTurn(livePool, {
      personId: PERSON_ID,
      userMessage: 'Tôi muốn đặt mục tiêu IELTS 7.0',
    })

    expect(res.executionSummary.pendingConfirmationSteps).toBe(1)
    expect(res.reply).toContain('Có 1 đề xuất hành động cần bạn xác nhận')
  })
})

describe('synthesizeCompanionReply with shared AI models', () => {
  const sampleContext = {
    id: CTX_ID,
    personId: PERSON_ID,
    requestId: 'req-3',
    items: [
      {
        sourceType: 'user_declared_fact' as const,
        sourceId: SOURCE_ID,
        content: 'Mục tiêu: Đạt IELTS 7.5 trong 6 tháng',
        provenance: 'profile:goals',
        sensitivity: 'personal' as const,
        tokenEstimate: 10,
      },
    ],
    tokenBudget: 2000,
    tokenUsed: 10,
    createdAt: new Date().toISOString(),
    schemaVersion: 1,
  }

  it('gọi Groq thành công khi có GROQ_API_KEY', async () => {
    process.env.GROQ_API_KEY = 'test-groq-key'
    chatProvidersMock.callGroqChat.mockResolvedValueOnce({
      kind: 'success',
      text: 'Chào bạn! Tôi là Bạn Đồng Hành AI sẵn sàng cùng bạn chinh phục IELTS.',
      latencyMs: 120,
    })

    const reply = await synthesizeCompanionReply(
      'Xin chào',
      'general_conversation',
      'learning',
      [],
      sampleContext,
    )

    expect(reply).toBe('Chào bạn! Tôi là Bạn Đồng Hành AI sẵn sàng cùng bạn chinh phục IELTS.')
    expect(chatProvidersMock.callGroqChat).toHaveBeenCalled()
    delete process.env.GROQ_API_KEY
  })

  it('fallback sang Anthropic khi Groq lỗi và có ANTHROPIC_API_KEY', async () => {
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    chatProvidersMock.callGroqChat.mockResolvedValueOnce({
      kind: 'network_error',
      message: 'Connection timeout',
      latencyMs: 500,
    })
    chatProvidersMock.callAnthropicChat.mockResolvedValueOnce({
      kind: 'response',
      status: 200,
      bodyText: JSON.stringify({
        content: [{ text: 'Phản hồi từ Anthropic Claude cho Bạn Đồng Hành.' }],
      }),
      latencyMs: 350,
    })

    const reply = await synthesizeCompanionReply(
      'Tư vấn sự nghiệp',
      'general_conversation',
      'career',
      [],
      sampleContext,
    )

    expect(reply).toBe('Phản hồi từ Anthropic Claude cho Bạn Đồng Hành.')
    expect(chatProvidersMock.callAnthropicChat).toHaveBeenCalled()
    delete process.env.GROQ_API_KEY
    delete process.env.ANTHROPIC_API_KEY
  })

  it('fallback sang Gemini khi Groq/Anthropic không có hoặc lỗi', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    geminiApiMock.callGemini.mockResolvedValueOnce('Phản hồi từ Google Gemini 2.0 Flash.')

    const reply = await synthesizeCompanionReply(
      'Lên kế hoạch',
      'general_conversation',
      'work',
      [],
      sampleContext,
    )

    expect(reply).toBe('Phản hồi từ Google Gemini 2.0 Flash.')
    expect(geminiApiMock.callGemini).toHaveBeenCalled()
    delete process.env.GEMINI_API_KEY
  })

  it('fallback về template deterministic khi không có bất kỳ API key nào', async () => {
    delete process.env.GROQ_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GEMINI_API_KEY

    const reply = await synthesizeCompanionReply(
      'Xin chào bạn',
      'general_conversation',
      'learning',
      [],
      sampleContext,
    )

    expect(reply).toContain('Đồng Hành đã nhận được tin nhắn: "Xin chào bạn".')
    expect(reply).toContain('[Sử dụng 10/2000 token ngữ cảnh]')
  })
})
