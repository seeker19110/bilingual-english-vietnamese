// companionLink.ts — Gọi API "Người thân theo dõi" (/api/companion-link).
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
//
// ⚠️ Không nhầm với `companion*` khác trong app: "Companion — Bạn Đồng Hành" là TÁC TỬ AI.
// Ở đây là NGƯỜI THẬT (bố mẹ, thầy cô) nhận báo cáo tuần qua email.

import { getAuthHeader } from '@core/authHeader'

export interface Watcher {
  linkId: string
  userId: string
  name: string
  relation: 'family' | 'teacher' | 'friend'
  createdAt: string
  lastReportAt?: string
}

export interface FollowedLearner {
  linkId: string
  userId: string
  name: string
}

export interface CompanionLinkState {
  watchers: Watcher[]
  following: FollowedLearner[]
}

const ENDPOINT = '/api/companion-link'

/** Trả null khi chưa đăng nhập/mạng lỗi — nơi gọi ẩn khối đi, không dựng khung lỗi. */
export async function fetchCompanionLinks(): Promise<CompanionLinkState | null> {
  try {
    const res = await fetch(ENDPOINT, { headers: { ...getAuthHeader() } })
    if (!res.ok) return null
    return (await res.json()) as CompanionLinkState
  } catch {
    return null
  }
}

export interface InviteCode {
  code: string
  expiresAt: string
}

export async function createCompanionInvite(): Promise<InviteCode | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action: 'invite' }),
    })
    if (!res.ok) return null
    return (await res.json()) as InviteCode
  } catch {
    return null
  }
}

export type RedeemOutcome = { ok: true; name: string } | { ok: false; message: string }

export async function redeemCompanionInvite(
  code: string,
  relation: Watcher['relation'] = 'family',
): Promise<RedeemOutcome> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action: 'redeem', code: code.trim().toUpperCase(), relation }),
    })
    const data = (await res.json()) as { learner?: { name: string }; error?: string }
    if (!res.ok) return { ok: false, message: data.error ?? 'Không dùng được mã này' }
    return { ok: true, name: data.learner?.name ?? 'Người học' }
  } catch {
    return { ok: false, message: 'Lỗi mạng — thử lại sau' }
  }
}

export async function removeCompanionLink(linkId: string): Promise<boolean> {
  try {
    const res = await fetch(`${ENDPOINT}?linkId=${encodeURIComponent(linkId)}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    })
    return res.ok
  } catch {
    return false
  }
}
