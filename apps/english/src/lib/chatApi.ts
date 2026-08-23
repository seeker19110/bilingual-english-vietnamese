// apps/english/src/lib/chatApi.ts — Client REST cho chat 1-1 (lịch sử, danh sách phòng, tạo phòng DM).
// Real-time (tin nhắn mới, typing, read receipt, presence) đi qua WebSocket (xem useChat.ts).

import { getAuthHeader } from '@core/authHeader'
import type { ChatMessage, RoomSummary } from '@dhcb/core-contracts/chat'

export type { ChatMessage, RoomSummary }

export async function fetchRooms(): Promise<RoomSummary[]> {
  try {
    const res = await fetch('/api/chat', { headers: getAuthHeader() })
    if (!res.ok) return []
    const data = (await res.json()) as { rooms?: RoomSummary[] }
    return data.rooms ?? []
  } catch {
    return []
  }
}

export async function fetchMessages(
  roomId: string,
  cursor?: string,
  limit = 30,
): Promise<ChatMessage[]> {
  try {
    const params = new URLSearchParams({ roomId, limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    const res = await fetch(`/api/chat?${params.toString()}`, { headers: getAuthHeader() })
    if (!res.ok) return []
    const data = (await res.json()) as { messages?: ChatMessage[] }
    return data.messages ?? []
  } catch {
    return []
  }
}

export type CreateDmRoomResult =
  { ok: true; roomId: string } | { ok: false; error: string; reason?: string }

export async function createOrGetDmRoom(targetUserId: string): Promise<CreateDmRoomResult> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ targetUserId }),
    })
    const data = (await res.json()) as { roomId?: string; error?: string; reason?: string }
    if (!res.ok || !data.roomId) {
      return { ok: false, error: data.error ?? 'Không thể tạo phòng chat', reason: data.reason }
    }
    return { ok: true, roomId: data.roomId }
  } catch {
    return { ok: false, error: 'Lỗi kết nối — thử lại sau' }
  }
}

export async function deleteChatMessage(messageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/chat?messageId=${encodeURIComponent(messageId)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    })
    return res.ok
  } catch {
    return false
  }
}
