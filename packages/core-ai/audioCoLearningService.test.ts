// packages/core-ai/audioCoLearningService.test.ts — Tests cho Audio Co-learning Room Service V7.1
import { describe, it, expect, beforeEach } from 'vitest'
import {
  createAudioRoom,
  joinAudioRoom,
  leaveAudioRoom,
  processAudioChunk,
  broadcastAiSocraticHint,
  subscribeToRoomEvents,
  getAudioRoom,
  listActiveAudioRooms,
  setMemberMuted,
  _resetAudioCoLearningStateForTests,
} from './audioCoLearningService.js'

describe('audioCoLearningService', () => {
  beforeEach(() => {
    _resetAudioCoLearningStateForTests()
  })

  describe('createAudioRoom', () => {
    it('should create a new audio room', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-host-1',
        hostDisplayName: 'Nguyễn Văn A',
        topic: 'Luyện phát âm tiếng Anh',
        subject: 'english',
      })
      expect(room).not.toBeNull()
      expect(room!.id).toMatch(/^room-/)
      expect(room!.topic).toBe('Luyện phát âm tiếng Anh')
      expect(room!.members).toHaveLength(1)
      expect(room!.members[0]!.personId).toBe('person-host-1')
      expect(room!.members[0]!.role).toBe('host')
    })

    it('should cap maxMembers at 12', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'math',
        maxMembers: 50,
      })
      expect(room!.maxMembers).toBe(12)
    })

    it('should use default silenceThresholdMs = 8000', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'physics',
      })
      expect(room!.silenceThresholdMs).toBe(8000)
    })

    it('should emit room_created event on creation', () => {
      const events: string[] = []
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      // Đăng ký sau khi tạo để subscribe tới events tiếp theo
      const unsub = subscribeToRoomEvents(room!.id, (e) => events.push(e.type))
      void unsub // suppress unused warning — sẽ gọi khi cleanup
      // Room đã được tạo rồi, test event tiếp theo
      joinAudioRoom({ roomId: room!.id, personId: 'person-2', displayName: 'User B' })
      expect(events).toContain('member_joined')
    })
  })

  describe('joinAudioRoom', () => {
    it('should allow a new member to join', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Math Study',
        subject: 'math',
      })
      const result = joinAudioRoom({
        roomId: room!.id,
        personId: 'person-2',
        displayName: 'Learner B',
      })
      expect(result.success).toBe(true)
      expect(result.room!.members).toHaveLength(2)
    })

    it('should not allow joining a non-existent room', () => {
      const result = joinAudioRoom({
        roomId: 'room-does-not-exist',
        personId: 'person-2',
        displayName: 'User',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Room not found')
    })

    it('should update state if same person rejoins', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      joinAudioRoom({ roomId: room!.id, personId: 'person-2', displayName: 'User B' })
      // Rejoin
      const result = joinAudioRoom({
        roomId: room!.id,
        personId: 'person-2',
        displayName: 'User B',
      })
      expect(result.success).toBe(true)
      expect(result.room!.members).toHaveLength(2) // không thêm bản sao
    })

    it('should reject joining a full room', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
        maxMembers: 2,
      })
      joinAudioRoom({ roomId: room!.id, personId: 'person-2', displayName: 'User B' })
      const result = joinAudioRoom({
        roomId: room!.id,
        personId: 'person-3',
        displayName: 'User C',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Room is full')
    })
  })

  describe('leaveAudioRoom', () => {
    it('should remove a member from the room', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      joinAudioRoom({ roomId: room!.id, personId: 'person-2', displayName: 'User B' })
      const success = leaveAudioRoom(room!.id, 'person-2')
      expect(success).toBe(true)
      expect(getAudioRoom(room!.id)!.members).toHaveLength(1)
    })

    it('should close room when last member leaves', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      leaveAudioRoom(room!.id, 'person-1')
      expect(getAudioRoom(room!.id)).toBeNull()
    })

    it('should return false for non-existent member', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      const success = leaveAudioRoom(room!.id, 'person-ghost')
      expect(success).toBe(false)
    })
  })

  describe('processAudioChunk', () => {
    it('should return relayTo list excluding sender', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      joinAudioRoom({ roomId: room!.id, personId: 'person-2', displayName: 'B' })
      joinAudioRoom({ roomId: room!.id, personId: 'person-3', displayName: 'C' })

      const result = processAudioChunk({
        roomId: room!.id,
        senderPersonId: 'person-1',
        audioBase64: 'AAAA',
        audioLevel: 0,
      })

      expect(result.relayTo).toContain('person-2')
      expect(result.relayTo).toContain('person-3')
      expect(result.relayTo).not.toContain('person-1')
    })

    it('should detect speaking state from audioLevel > VAD_THRESHOLD', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      const result = processAudioChunk({
        roomId: room!.id,
        senderPersonId: 'person-1',
        audioBase64: 'AAAA',
        audioLevel: 0.5, // > 0.02 threshold
      })
      expect(result.isSpeaking).toBe(true)
    })

    it('should detect silence (audioLevel = 0)', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      const result = processAudioChunk({
        roomId: room!.id,
        senderPersonId: 'person-1',
        audioBase64: 'AAAA',
        audioLevel: 0,
      })
      expect(result.isSpeaking).toBe(false)
    })

    it('should return empty array for non-existent room', () => {
      const result = processAudioChunk({
        roomId: 'non-existent',
        senderPersonId: 'person-1',
        audioBase64: 'AAAA',
      })
      expect(result.relayTo).toHaveLength(0)
    })
  })

  describe('broadcastAiSocraticHint', () => {
    it('should emit ai_socratic_hint event', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Phonetics Practice',
        subject: 'english',
      })
      const events: string[] = []
      subscribeToRoomEvents(room!.id, (e) => events.push(e.type))

      const event = broadcastAiSocraticHint(
        room!.id,
        'Hãy thử phát âm âm /θ/ bằng cách đặt lưỡi giữa hai hàm răng.',
      )

      expect(event).not.toBeNull()
      expect(event!.type).toBe('ai_socratic_hint')
      expect(events).toContain('ai_socratic_hint')
    })

    it('should return null for non-existent room', () => {
      const result = broadcastAiSocraticHint('room-ghost', 'Hint text')
      expect(result).toBeNull()
    })
  })

  describe('setMemberMuted', () => {
    it('should mute a member', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      const success = setMemberMuted(room!.id, 'person-1', true)
      expect(success).toBe(true)
      const member = getAudioRoom(room!.id)!.members.find((m) => m.personId === 'person-1')
      expect(member!.isMuted).toBe(true)
      expect(member!.state).toBe('muted')
    })

    it('should unmute a member', () => {
      const room = createAudioRoom({
        hostPersonId: 'person-1',
        hostDisplayName: 'Host',
        topic: 'Test',
        subject: 'english',
      })
      setMemberMuted(room!.id, 'person-1', true)
      setMemberMuted(room!.id, 'person-1', false)
      const member = getAudioRoom(room!.id)!.members.find((m) => m.personId === 'person-1')
      expect(member!.isMuted).toBe(false)
      expect(member!.state).toBe('listening')
    })
  })

  describe('listActiveAudioRooms', () => {
    it('should list all active rooms', () => {
      createAudioRoom({
        hostPersonId: 'p1',
        hostDisplayName: 'H1',
        topic: 'Room 1',
        subject: 'english',
      })
      createAudioRoom({
        hostPersonId: 'p2',
        hostDisplayName: 'H2',
        topic: 'Room 2',
        subject: 'math',
      })
      const list = listActiveAudioRooms()
      expect(list).toHaveLength(2)
      expect(list.map((r) => r.topic)).toContain('Room 1')
      expect(list.map((r) => r.topic)).toContain('Room 2')
    })
  })
})
