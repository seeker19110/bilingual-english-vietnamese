// apps/english/src/lib/referralVipApi.ts — Client API cho Referral VIP & Viral Share Booster.
import { getAuthHeader } from '@core/authHeader'
import type {
  ReferralVipDashboard,
  ReferralMilestoneDefinition,
  ViralShareCardData,
} from '../../../../packages/core-contracts/referralVip'

export async function fetchReferralVipDashboard(): Promise<{
  dashboard: ReferralVipDashboard
  milestones: ReferralMilestoneDefinition[]
}> {
  const res = await fetch('/api/referral-vip', {
    headers: { ...getAuthHeader() },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return {
    dashboard: data.dashboard,
    milestones: data.milestones || [],
  }
}

export async function generateShareCard(profile: {
  name: string
  avatar: string
  streakDays: number
  cefrLevel: string
}): Promise<ViralShareCardData> {
  const res = await fetch('/api/referral-vip?action=generate_share_card', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.cardData
}
