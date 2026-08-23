// src/lib/friends.ts — Client cho tính năng kết bạn qua mã/URL/QR (xem api/friends.ts).

import { getAuthHeader } from '@core/authHeader'

export interface FriendUserSummary {
  id: string
  name: string
}

export interface FriendsState {
  code: string
  friends: FriendUserSummary[]
}

/** Đường dẫn chia sẻ để người khác quét/bấm là kết bạn ngay — dùng cho link + QR. */
export function buildFriendInviteUrl(code: string): string {
  return `${window.location.origin}/ket-ban/${code}`
}

export async function fetchFriendsState(): Promise<FriendsState | null> {
  try {
    const res = await fetch('/api/friends', { headers: getAuthHeader() })
    if (!res.ok) return null
    return (await res.json()) as FriendsState
  } catch {
    return null
  }
}

export async function lookupFriendByCode(code: string): Promise<FriendUserSummary | null> {
  try {
    const res = await fetch(`/api/friends?lookup=${encodeURIComponent(code)}`, {
      headers: getAuthHeader(),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { user: FriendUserSummary | null }
    return data.user
  } catch {
    return null
  }
}

export type AddFriendResult =
  { ok: true; alreadyFriends: boolean; friend: FriendUserSummary } | { ok: false; message: string }

export async function addFriendByCode(code: string): Promise<AddFriendResult> {
  try {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ code }),
    })
    const data = (await res.json()) as {
      ok?: boolean
      alreadyFriends?: boolean
      friend?: FriendUserSummary
      error?: string
    }
    if (!res.ok || !data.ok || !data.friend) {
      return { ok: false, message: data.error ?? 'Không kết bạn được' }
    }
    return { ok: true, alreadyFriends: !!data.alreadyFriends, friend: data.friend }
  } catch {
    return { ok: false, message: 'Lỗi mạng — thử lại sau' }
  }
}

export async function removeFriend(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/friends?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    })
    return res.ok
  } catch {
    return false
  }
}
