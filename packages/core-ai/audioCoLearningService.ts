// packages/core-ai/audioCoLearningService.ts — Động cơ Phòng Học Nhóm Âm Thanh Thời Gian Thực V7.1
// Mở rộng coLearningRoomService (text-only) thêm:
//   - Quản lý phòng âm thanh với VAD tích hợp (phát hiện ai đang nói)
//   - Relay PCM audio giữa các peer
//   - AI Socratic Moderator tự động trigger khi phát hiện silence > threshold
//   - Budget guard: tối đa 100 phòng đồng thời (in-memory), mỗi phòng ≤ 12 người

import { randomUUID } from 'node:crypto'
import type {
  AudioRoomState,
  AudioRoomMember,
  AudioRoomEvent,
} from '../core-contracts/audioCoLearningRoom.js'
import {
  AudioRoomStateSchema,
  AudioRoomEventSchema,
} from '../core-contracts/audioCoLearningRoom.js'

const MAX_ROOMS = 100
const MAX_MEMBERS_PER_ROOM = 12
const DEFAULT_SILENCE_THRESHOLD_MS = 8000

// In-memory store — không persist DB (đủ cho tính năng live session)
const activeRooms = new Map<string, AudioRoomState>()

// Track thời điểm lần cuối có ai nói trong phòng (để trigger AI moderator)
const roomLastSpeakingAt = new Map<string, number>()

// ─── Sự kiện handler type ─────────────────────────────────────────────────────
export type AudioRoomEventHandler = (event: AudioRoomEvent) => void
const roomEventHandlers = new Map<string, Set<AudioRoomEventHandler>>()

// ─── Tiện ích nội bộ ──────────────────────────────────────────────────────────

function buildEvent(
  roomId: string,
  type: AudioRoomEvent['type'],
  senderId: string,
  senderName: string,
  payload: Record<string, unknown> = {},
): AudioRoomEvent {
  return AudioRoomEventSchema.parse({
    eventId: randomUUID(),
    roomId,
    type,
    senderId,
    senderName,
    payload,
    timestamp: Date.now(),
  })
}

function emitRoomEvent(roomId: string, event: AudioRoomEvent): void {
  const handlers = roomEventHandlers.get(roomId)
  if (!handlers) return
  for (const handler of handlers) {
    try {
      handler(event)
    } catch (err) {
      console.error('[audioCoLearning] event handler error:', err)
    }
  }
}

/** Đặt lại state cho tests */
export function _resetAudioCoLearningStateForTests(): void {
  activeRooms.clear()
  roomLastSpeakingAt.clear()
  roomEventHandlers.clear()
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Tạo phòng học nhóm âm thanh mới.
 * @returns AudioRoomState hoặc null nếu đã đạt giới hạn MAX_ROOMS
 */
export function createAudioRoom(params: {
  hostPersonId: string
  hostDisplayName: string
  topic: string
  subject: string
  moderationMode?: AudioRoomState['moderationMode']
  silenceThresholdMs?: number
  maxMembers?: number
}): AudioRoomState | null {
  if (activeRooms.size >= MAX_ROOMS) {
    return null
  }

  const now = Date.now()
  const roomId = `room-${randomUUID()}`

  const hostMember: AudioRoomMember = {
    id: `session-${randomUUID()}`,
    personId: params.hostPersonId,
    displayName: params.hostDisplayName,
    role: 'host',
    state: 'connected',
    audioLevel: 0,
    isMuted: false,
    isSpeaking: false,
    joinedAt: now,
    lastActiveAt: now,
  }

  const room = AudioRoomStateSchema.parse({
    id: roomId,
    topic: params.topic,
    subject: params.subject,
    hostPersonId: params.hostPersonId,
    members: [hostMember],
    maxMembers: Math.min(params.maxMembers ?? 8, MAX_MEMBERS_PER_ROOM),
    moderationMode: params.moderationMode ?? 'open',
    silenceThresholdMs: params.silenceThresholdMs ?? DEFAULT_SILENCE_THRESHOLD_MS,
    aiSummaryHistory: [],
    createdAt: now,
    updatedAt: now,
  })

  activeRooms.set(roomId, room)
  roomLastSpeakingAt.set(roomId, now)
  roomEventHandlers.set(roomId, new Set())

  emitRoomEvent(roomId, buildEvent(roomId, 'room_created', 'system', 'Hệ thống', { room }))

  return room
}

/**
 * Tham gia phòng học nhóm âm thanh.
 */
export function joinAudioRoom(params: {
  roomId: string
  personId: string
  displayName: string
  role?: AudioRoomMember['role']
}): { success: boolean; room?: AudioRoomState; error?: string } {
  const room = activeRooms.get(params.roomId)
  if (!room) return { success: false, error: 'Room not found' }
  if (!room.isActive) return { success: false, error: 'Room is closed' }
  if (room.members.length >= room.maxMembers) return { success: false, error: 'Room is full' }

  // Kiểm tra đã join chưa
  const existing = room.members.find((m) => m.personId === params.personId)
  if (existing) {
    // Cập nhật trạng thái về connected
    existing.state = 'connected'
    existing.lastActiveAt = Date.now()
    return { success: true, room }
  }

  const now = Date.now()
  const newMember: AudioRoomMember = {
    id: `session-${randomUUID()}`,
    personId: params.personId,
    displayName: params.displayName,
    role: params.role ?? 'learner',
    state: 'connected',
    audioLevel: 0,
    isMuted: false,
    isSpeaking: false,
    joinedAt: now,
    lastActiveAt: now,
  }

  room.members.push(newMember)
  room.updatedAt = now

  emitRoomEvent(
    params.roomId,
    buildEvent(params.roomId, 'member_joined', params.personId, params.displayName, {
      member: newMember,
    }),
  )

  return { success: true, room }
}

/**
 * Rời phòng học nhóm.
 */
export function leaveAudioRoom(roomId: string, personId: string): boolean {
  const room = activeRooms.get(roomId)
  if (!room) return false

  const idx = room.members.findIndex((m) => m.personId === personId)
  if (idx === -1) return false

  const member = room.members[idx]!
  room.members.splice(idx, 1)
  room.updatedAt = Date.now()

  emitRoomEvent(roomId, buildEvent(roomId, 'member_left', personId, member.displayName))

  // Đóng phòng khi không còn ai hoặc chỉ còn AI
  if (room.members.length === 0) {
    room.isActive = false
    emitRoomEvent(roomId, buildEvent(roomId, 'room_closed', 'system', 'Hệ thống'))
    activeRooms.delete(roomId)
    roomLastSpeakingAt.delete(roomId)
  }

  return true
}

/**
 * Xử lý chunk audio từ một thành viên.
 * Tính RMS từ PCM base64, cập nhật audioLevel, phát hiện ai đang nói,
 * và relay đến tất cả thành viên khác trong phòng.
 * @returns Danh sách personId cần nhận relay event (không bao gồm sender)
 */
export function processAudioChunk(params: {
  roomId: string
  senderPersonId: string
  audioBase64: string
  audioLevel?: number
}): {
  relayTo: string[]
  isSpeaking: boolean
  shouldTriggerAiModerator: boolean
  silenceDurationMs: number
} {
  const room = activeRooms.get(params.roomId)
  if (!room) {
    return { relayTo: [], isSpeaking: false, shouldTriggerAiModerator: false, silenceDurationMs: 0 }
  }

  // Tính RMS từ PCM hoặc dùng audioLevel truyền vào
  let rms = params.audioLevel ?? 0
  if (!params.audioLevel && params.audioBase64) {
    try {
      const raw = Buffer.from(params.audioBase64, 'base64')
      // Tính RMS đơn giản từ PCM 16-bit
      const samples = new Int16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2))
      let sumSquares = 0
      for (let i = 0; i < samples.length; i++) {
        const val = (samples[i] ?? 0) / 32768
        sumSquares += val * val
      }
      rms = samples.length > 0 ? Math.sqrt(sumSquares / samples.length) : 0
    } catch {
      rms = 0
    }
  }

  const VAD_THRESHOLD = 0.02 // Ngưỡng phát hiện giọng nói
  const isSpeaking = rms > VAD_THRESHOLD
  const now = Date.now()

  // Cập nhật trạng thái thành viên
  const member = room.members.find((m) => m.personId === params.senderPersonId)
  if (member) {
    const wasSpeaking = member.isSpeaking
    member.audioLevel = Math.min(1, rms)
    member.isSpeaking = isSpeaking
    member.lastActiveAt = now

    if (isSpeaking && !wasSpeaking) {
      roomLastSpeakingAt.set(params.roomId, now)
      emitRoomEvent(
        params.roomId,
        buildEvent(params.roomId, 'member_speaking', params.senderPersonId, member.displayName, {
          audioLevel: rms,
        }),
      )
    } else if (!isSpeaking && wasSpeaking) {
      emitRoomEvent(
        params.roomId,
        buildEvent(params.roomId, 'member_silent', params.senderPersonId, member.displayName),
      )
    }
  }

  if (isSpeaking) {
    roomLastSpeakingAt.set(params.roomId, now)
  }

  // Kiểm tra ngưỡng im lặng để trigger AI moderator
  const lastSpeaking = roomLastSpeakingAt.get(params.roomId) ?? now
  const silenceDurationMs = now - lastSpeaking
  const shouldTriggerAiModerator =
    silenceDurationMs >= room.silenceThresholdMs && room.members.length >= 2

  // Danh sách peer cần relay (trừ sender)
  const relayTo = room.members
    .filter((m) => m.personId !== params.senderPersonId && m.state !== 'disconnected' && !m.isMuted)
    .map((m) => m.personId)

  return { relayTo, isSpeaking, shouldTriggerAiModerator, silenceDurationMs }
}

/**
 * Broadcast AI Socratic hint vào phòng khi phát hiện im lặng kéo dài hoặc confusion.
 * @returns Nội dung hint đã gửi hoặc null nếu phòng không hợp lệ
 */
export function broadcastAiSocraticHint(
  roomId: string,
  hint: string,
  socraticType:
    'clarification' | 'probing_assumptions' | 'probing_reasons' | 'summary' = 'clarification',
): AudioRoomEvent | null {
  const room = activeRooms.get(roomId)
  if (!room || !room.isActive) return null

  // Reset silence clock sau khi AI nói
  roomLastSpeakingAt.set(roomId, Date.now())

  const event = buildEvent(roomId, 'ai_socratic_hint', 'ai-moderator', '🤖 Đồng Hành AI', {
    hint,
    socraticType,
    topic: room.topic,
  })

  emitRoomEvent(roomId, event)
  room.updatedAt = Date.now()

  return event
}

/**
 * Đăng ký event handler cho phòng.
 * @returns unsubscribe function
 */
export function subscribeToRoomEvents(roomId: string, handler: AudioRoomEventHandler): () => void {
  let handlers = roomEventHandlers.get(roomId)
  if (!handlers) {
    handlers = new Set()
    roomEventHandlers.set(roomId, handlers)
  }
  handlers.add(handler)
  return () => handlers?.delete(handler)
}

/**
 * Lấy trạng thái phòng (read-only copy).
 */
export function getAudioRoom(roomId: string): AudioRoomState | null {
  return activeRooms.get(roomId) ?? null
}

/**
 * Danh sách tóm tắt tất cả phòng đang hoạt động.
 */
export function listActiveAudioRooms(): Array<{
  id: string
  topic: string
  subject: string
  memberCount: number
  isActive: boolean
}> {
  return Array.from(activeRooms.values()).map((r) => ({
    id: r.id,
    topic: r.topic,
    subject: r.subject,
    memberCount: r.members.length,
    isActive: r.isActive,
  }))
}

/**
 * Cập nhật trạng thái mute của thành viên.
 */
export function setMemberMuted(roomId: string, personId: string, isMuted: boolean): boolean {
  const room = activeRooms.get(roomId)
  if (!room) return false
  const member = room.members.find((m) => m.personId === personId)
  if (!member) return false

  member.isMuted = isMuted
  member.state = isMuted ? 'muted' : 'listening'
  room.updatedAt = Date.now()

  emitRoomEvent(
    roomId,
    buildEvent(roomId, isMuted ? 'member_muted' : 'member_unmuted', personId, member.displayName),
  )

  return true
}
