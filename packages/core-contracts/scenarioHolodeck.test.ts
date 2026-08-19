import { describe, it, expect } from 'vitest'
import {
  HolodeckScenarioSchema,
  HolodeckSessionSchema,
  HOLODECK_SCHEMA_VERSION,
} from './scenarioHolodeck.js'

describe('scenarioHolodeck contracts', () => {
  it('validates a correct scenario definition', () => {
    const scenario = {
      id: 'panel_tech_interview',
      title: 'Phỏng vấn Hội đồng Kỹ thuật & Văn hóa Big Tech',
      description: 'Mô phỏng phỏng vấn với CTO và HR Director',
      scenarioType: 'panel_interview',
      difficulty: 'advanced',
      personas: [
        {
          id: 'cto_alex',
          name: 'Alex (CTO)',
          role: 'tech_lead',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          temperament: 'analytical',
          speakingStyle: 'Direct, focused on system architecture and scalability',
        },
        {
          id: 'hr_sarah',
          name: 'Sarah (HR Director)',
          role: 'hr_director',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
          temperament: 'supportive',
          speakingStyle: 'Warm, evaluating team fit and conflict resolution',
        },
      ],
      initialPrompt:
        'Welcome to our leadership panel interview. Tell us about your proudest architecture decision.',
      schemaVersion: HOLODECK_SCHEMA_VERSION,
    }

    const parsed = HolodeckScenarioSchema.parse(scenario)
    expect(parsed.id).toBe('panel_tech_interview')
    expect(parsed.personas).toHaveLength(2)
  })

  it('validates a holodeck session with turns and rubric', () => {
    const session = {
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      scenarioId: 'panel_tech_interview',
      status: 'active',
      currentPressure: 45,
      turns: [
        {
          turnIndex: 0,
          speakerType: 'persona',
          personaId: 'cto_alex',
          content: 'How do you handle distributed race conditions?',
          pressureScore: 40,
          timestamp: new Date().toISOString(),
        },
        {
          turnIndex: 1,
          speakerType: 'user',
          content: 'We implemented optimistic locking and idempotent message queues.',
          pressureScore: 45,
          timestamp: new Date().toISOString(),
          instantFeedback: {
            strengths: ['Clear architectural terminology'],
            weaknesses: ['Could elaborate on retry limits'],
            suggestedNuance: 'Mention circuit breakers for resilient retries',
          },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: HOLODECK_SCHEMA_VERSION,
    }

    const parsed = HolodeckSessionSchema.parse(session)
    expect(parsed.status).toBe('active')
    expect(parsed.turns).toHaveLength(2)
  })
})
