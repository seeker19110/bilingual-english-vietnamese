import { describe, it, expect } from 'vitest'
import {
  type CoLearningMember,
  createCoLearningRoom,
  evaluateSocraticIntervention,
  postMessageToRoom,
} from './coLearningRoomService'

describe('coLearningRoomService (Multiplayer Co-learning & Socratic Moderator)', () => {
  const sampleHost: CoLearningMember = {
    id: 'mem-1',
    personId: 'usr-1',
    name: 'Nguyễn Văn A',
    role: 'learner',
    joinedAt: Date.now(),
  }

  it('creates a co-learning room with initial AI welcome message', () => {
    const room = createCoLearningRoom(
      'Phân biệt Past Simple và Present Perfect',
      'English Grammar',
      sampleHost,
    )
    expect(room.id).toBeDefined()
    expect(room.members.length).toBe(1)
    expect(room.messages.length).toBe(1)
    expect(room.messages[0]?.isAiModerator).toBe(true)
  })

  it('triggers Socratic intervention when learner expresses confusion', () => {
    const messages = [
      {
        id: '1',
        roomId: 'r1',
        senderId: 'usr-1',
        senderName: 'Văn A',
        isAiModerator: false,
        content: 'Tôi không hiểu tại sao câu này lại dùng Present Perfect?',
        timestamp: Date.now(),
      },
    ]

    const result = evaluateSocraticIntervention(messages, 'English Grammar')
    expect(result.shouldIntervene).toBe(false)
    // Needs at least 2 messages for natural conversation context
    const messages2 = [
      {
        id: '0',
        roomId: 'r1',
        senderId: 'usr-2',
        senderName: 'Văn B',
        isAiModerator: false,
        content: 'Chào bạn',
        timestamp: Date.now() - 1000,
      },
      ...messages,
    ]

    const result2 = evaluateSocraticIntervention(messages2, 'English Grammar')
    expect(result2.shouldIntervene).toBe(true)
    expect(result2.socraticType).toBe('probing_reasons')
    expect(result2.interventionMessage).toContain('Văn A')
  })

  it('posts message to room and includes AI Socratic response automatically', () => {
    const room = createCoLearningRoom('IELTS Speaking Part 2', 'English Speaking', sampleHost)

    const { updatedRoom, aiReply } = postMessageToRoom(room, {
      senderId: 'usr-2',
      senderName: 'Trần Thị B',
      content: 'Nhưng mà tôi không đồng ý với cách tiếp cận này, sai rồi.',
    })

    expect(updatedRoom.messages.length).toBe(3) // Welcome + User Msg + AI Reply
    expect(aiReply).toBeDefined()
    expect(aiReply?.isAiModerator).toBe(true)
    expect(aiReply?.socraticType).toBe('probing_assumptions')
  })
})
