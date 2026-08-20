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

  it('handles getHolodeckSession and invalid scenario/session errors', () => {
    expect(() => startHolodeckSession('u1', 'invalid-scenario')).toThrow(
      'Scenario invalid-scenario không tồn tại',
    )
    expect(() => processHolodeckTurn('nonexistent', 'test')).toThrow('không hoạt động')
    expect(() => finalizeHolodeckSession('nonexistent')).toThrow('không tồn tại')
  })

  it('runs turns with all persona types (hr_director, vc_pitch, ielts_examiner) and short utterance', () => {
    const personId = 'user-2'

    // VC Pitch scenario
    const vcSession = startHolodeckSession(personId, 'silicon_vc_pitch')
    expect(vcSession.turns[0]?.content).toContain('Marcus is listening')

    // Short utterance without technical keywords
    const shortTurn = processHolodeckTurn(vcSession.sessionId, 'Yes, okay.')
    expect(shortTurn.personaReplyTurn.content).toContain('Google or OpenAI')
    expect(shortTurn.instantFeedback.weaknesses).toContain(
      'Câu trả lời quá ngắn, chưa đủ dẫn chứng thực tế',
    )

    // IELTS Examiner scenario
    const ieltsSession = startHolodeckSession(personId, 'cambridge_ielts_examiner')
    const ieltsTurn = processHolodeckTurn(
      ieltsSession.sessionId,
      'I believe automation changes job markets significantly.',
    )
    expect(ieltsTurn.personaReplyTurn.content).toContain('To what extent do you believe')

    // BigTech second turn (HR Director)
    const btSession = startHolodeckSession(personId, 'bigtech_panel_interview')
    processHolodeckTurn(btSession.sessionId, 'Architecture scalability metrics')
    const hrTurn = processHolodeckTurn(
      btSession.sessionId,
      'We coordinated closely with all team members.',
    )
    expect(hrTurn.personaReplyTurn.content).toContain('How did you align the team')

    // Finalize session with 0 user turns
    const emptySession = startHolodeckSession(personId, 'cambridge_ielts_examiner')
    emptySession.turns = []
    const finalizedEmpty = finalizeHolodeckSession(emptySession.sessionId)
    expect(finalizedEmpty.status).toBe('completed')
  })
})
