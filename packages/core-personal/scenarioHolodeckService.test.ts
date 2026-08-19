import { describe, it, expect } from 'vitest'
import {
  listPredefinedScenarios,
  startHolodeckSession,
  processHolodeckTurn,
  finalizeHolodeckSession,
} from './scenarioHolodeckService.js'

describe('scenarioHolodeckService', () => {
  it('lists predefined scenarios', () => {
    const list = listPredefinedScenarios()
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]?.id).toBe('bigtech_panel_interview')
  })

  it('starts, interacts and finalizes a holodeck session', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const session = startHolodeckSession(personId, 'bigtech_panel_interview')
    expect(session.sessionId).toBeDefined()
    expect(session.status).toBe('active')
    expect(session.turns).toHaveLength(1)

    const turnResult = processHolodeckTurn(
      session.sessionId,
      'We noticed high latency on our distributed Redis cluster, so we implemented local memory fallback and circuit breakers.',
    )
    expect(turnResult.updatedSession.turns).toHaveLength(3) // 1 initial + 1 user + 1 reply
    expect(turnResult.personaReplyTurn.speakerType).toBe('persona')
    expect(turnResult.instantFeedback.strengths.length).toBeGreaterThan(0)

    const finalized = finalizeHolodeckSession(session.sessionId)
    expect(finalized.status).toBe('completed')
    expect(finalized.finalRubric?.overallBand).toBeGreaterThan(0)
    expect(finalized.finalRubric?.recommendedDrills).toHaveLength(3)
  })
})
