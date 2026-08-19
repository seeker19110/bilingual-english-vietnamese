// packages/core-contracts/proactiveAgent.test.ts
import { describe, expect, it } from 'vitest'
import {
  GoalAutoPilotPlanSchema,
  ProactiveAgentConfigSchema,
  ProactiveAgentStateSchema,
  ProactiveNudgeSchema,
} from './proactiveAgent.js'

describe('proactiveAgent contract schemas', () => {
  const dummyPersonId = '11111111-1111-4111-8111-111111111111'
  const isoNow = '2026-08-20T00:00:00.000Z'

  it('validates a valid ProactiveNudge schema', () => {
    const validNudge = {
      id: 'nudge-1',
      personId: dummyPersonId,
      nudgeType: 'circadian_peak',
      priority: 'high',
      domain: 'learning',
      title: 'Khung giờ vàng học tập',
      message:
        'Năng lượng nhận thức đang ở mức đỉnh cao, hãy luyện nhanh 1 bài Collocation 2 phút!',
      suggestedAction: {
        id: 'act-1',
        label: 'Luyện 2 phút ngay',
        actionType: 'start_micro_drill',
        targetUrl: '/dong-hanh',
        payload: { drillId: 'colloc-001' },
      },
      dismissed: false,
      expiresAt: isoNow,
      createdAt: isoNow,
    }

    const parsed = ProactiveNudgeSchema.safeParse(validNudge)
    expect(parsed.success).toBe(true)
  })

  it('validates a valid GoalAutoPilotPlan schema', () => {
    const validPlan = {
      id: 'plan-1',
      personId: dummyPersonId,
      goalId: 'goal-ielts-7',
      goalTitle: 'Đạt IELTS 7.5 Speaking & Writing',
      domain: 'learning',
      progressPercentage: 45,
      steps: [
        {
          stepNumber: 1,
          title: 'Ôn 15 Collocations C1 chủ đề Technology',
          description: 'Học các cụm cutting-edge technology, push the boundaries',
          estimatedMinutes: 10,
          domain: 'learning',
          status: 'completed',
          actionRoute: '/dong-hanh',
        },
        {
          stepNumber: 2,
          title: 'Luyện phản xạ Echo Shadowing',
          description: 'Luyện nhại giọng 3 phút với tốc độ 1.0x',
          estimatedMinutes: 5,
          domain: 'learning',
          status: 'in_progress',
          actionRoute: '/dong-hanh',
        },
      ],
      recommendedPacePerDay: 2,
      nextMilestoneDate: isoNow,
      updatedAt: isoNow,
    }

    const parsed = GoalAutoPilotPlanSchema.safeParse(validPlan)
    expect(parsed.success).toBe(true)
  })

  it('validates ProactiveAgentStateSchema and Config', () => {
    const validConfig = {
      nudgeFrequency: 'balanced',
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      autoFlowShieldEnabled: true,
      autoPilotEnabled: true,
    }

    expect(ProactiveAgentConfigSchema.safeParse(validConfig).success).toBe(true)

    const validState = {
      nudges: [],
      autoPilotPlans: [],
      config: validConfig,
      lastEvaluatedAt: isoNow,
    }

    expect(ProactiveAgentStateSchema.safeParse(validState).success).toBe(true)
  })
})
