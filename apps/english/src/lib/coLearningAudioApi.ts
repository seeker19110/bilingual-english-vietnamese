// apps/english/src/lib/coLearningAudioApi.ts — Client API cho Phòng Học Nhóm Âm Thanh Thời Gian Thực V7.1.
import type { AudioRoomState, AudioRoomEvent } from '@dhcb/core-contracts/audioCoLearningRoom'

export async function fetchActiveAudioRooms(): Promise<
  Array<{
    id: string
    topic: string
    subject: string
    memberCount: number
    isActive: boolean
  }>
> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/co-learning-audio', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải danh sách phòng học: ${res.status}`)
  }

  const data = await res.json()
  return data.rooms
}

export async function createAudioRoomApi(params: {
  topic: string
  subject: string
  displayName?: string
  moderationMode?: 'open' | 'turn_based' | 'ai_only'
  maxMembers?: number
}): Promise<AudioRoomState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/co-learning-audio?action=create_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi tạo phòng học nhóm: ${res.status}`)
  }

  const data = await res.json()
  return data.room
}

export async function joinAudioRoomApi(params: {
  roomId: string
  displayName?: string
  role?: 'learner' | 'peer_tutor' | 'observer'
}): Promise<AudioRoomState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/co-learning-audio?action=join_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi tham gia phòng học: ${res.status}`)
  }

  const data = await res.json()
  return data.room
}

export async function leaveAudioRoomApi(roomId: string): Promise<boolean> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/co-learning-audio?action=leave_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ roomId }),
  })

  return res.ok
}

export async function requestSocraticHintApi(
  roomId: string,
  hintText?: string,
): Promise<AudioRoomEvent> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/co-learning-audio?action=request_hint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ roomId, hintText }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi yêu cầu gợi ý: ${res.status}`)
  }

  const data = await res.json()
  return data.event
}
