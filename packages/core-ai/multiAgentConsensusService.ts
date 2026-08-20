// packages/core-ai/multiAgentConsensusService.ts — Giao thức Đồng Thuận & Tranh Biện Đa Agent (Multi-Agent Delphi Consensus Protocol)
import { randomUUID } from 'node:crypto'

export type AgentRoleType = 'pedagogy' | 'linguistics' | 'career' | 'stem'

export interface AgentPerspective {
  agentRole: AgentRoleType
  agentName: string
  standpoint: string
  confidenceScore: number // 0.0 -> 1.0
  keyArguments: string[]
  recommendedAction: string
}

export interface ConsensusProposal {
  id: string
  questionOrTopic: string
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  perspectives: AgentPerspective[]
  createdAt: number
}

export interface ConsensusVerdict {
  proposalId: string
  topic: string
  domain: ConsensusProposal['domain']
  consensusDegree: number // 0.0 -> 1.0 (Độ đồng thuận giữa các Agent)
  synthesisSummary: string
  finalRecommendedAction: string
  contributingAgents: string[]
  dissentingPerspectives: string[]
  resolvedAt: number
}

// Trọng số chuyên môn theo từng Domain
const DOMAIN_ROLE_WEIGHTS: Record<ConsensusProposal['domain'], Record<AgentRoleType, number>> = {
  learning: { pedagogy: 0.4, linguistics: 0.35, stem: 0.15, career: 0.1 },
  career: { career: 0.5, pedagogy: 0.2, linguistics: 0.15, stem: 0.15 },
  work: { career: 0.4, stem: 0.3, pedagogy: 0.15, linguistics: 0.15 },
  startup: { career: 0.4, stem: 0.35, pedagogy: 0.15, linguistics: 0.1 },
  life: { pedagogy: 0.3, career: 0.3, linguistics: 0.2, stem: 0.2 },
}

/** Đánh giá mức độ tương đồng giữa các quan điểm (Cosine/Jaccard approximation) */
export function calculateConsensusDegree(perspectives: AgentPerspective[]): number {
  if (perspectives.length <= 1) return 1.0

  let totalPairwiseSim = 0
  let comparisons = 0

  for (let i = 0; i < perspectives.length; i++) {
    for (let j = i + 1; j < perspectives.length; j++) {
      const p1 = perspectives[i]
      const p2 = perspectives[j]
      if (!p1 || !p2) continue

      // Tính Jaccard similarity giữa các từ khóa lập luận
      const words1 = new Set(p1.keyArguments.join(' ').toLowerCase().split(/\s+/))
      const words2 = new Set(p2.keyArguments.join(' ').toLowerCase().split(/\s+/))

      const intersection = new Set([...words1].filter((x) => words2.has(x)))
      const union = new Set([...words1, ...words2])

      const sim = union.size > 0 ? intersection.size / union.size : 0.5
      const confAlignment = 1 - Math.abs(p1.confidenceScore - p2.confidenceScore)
      totalPairwiseSim += sim * 0.5 + confAlignment * 0.5
      comparisons++
    }
  }

  const baseDegree = comparisons > 0 ? totalPairwiseSim / comparisons : 0.7
  return Math.min(1.0, Math.max(0.3, Math.round(baseDegree * 100) / 100))
}

/** Thực thi giao thức biểu quyết đồng thuận đa Agent theo phương pháp Delphi */
export function resolveMultiAgentConsensus(proposal: ConsensusProposal): ConsensusVerdict {
  const weights = DOMAIN_ROLE_WEIGHTS[proposal.domain] || {
    pedagogy: 0.25,
    linguistics: 0.25,
    career: 0.25,
    stem: 0.25,
  }

  const consensusDegree = calculateConsensusDegree(proposal.perspectives)
  const contributingAgents: string[] = []
  const dissentingPerspectives: string[] = []

  let highestWeightedScore = -1
  let leadPerspective = proposal.perspectives[0]

  for (const p of proposal.perspectives) {
    const roleWeight = weights[p.agentRole] || 0.25
    const weightedScore = p.confidenceScore * roleWeight
    contributingAgents.push(`${p.agentName} (${p.agentRole})`)

    if (weightedScore > highestWeightedScore) {
      highestWeightedScore = weightedScore
      leadPerspective = p
    }

    if (p.confidenceScore < 0.6) {
      dissentingPerspectives.push(`Quan điểm thận trọng từ ${p.agentName}: ${p.standpoint}`)
    }
  }

  const synthesisSummary = `Dựa trên phân tích đa chiều từ ${proposal.perspectives.length} chuyên gia AI: ${leadPerspective?.standpoint || 'Đạt được sự thống nhất'}.`
  const finalRecommendedAction =
    leadPerspective?.recommendedAction || 'Tiếp tục theo dõi và kiểm chứng thêm thông tin.'

  return {
    proposalId: proposal.id || `prop-${randomUUID()}`,
    topic: proposal.questionOrTopic,
    domain: proposal.domain,
    consensusDegree,
    synthesisSummary,
    finalRecommendedAction,
    contributingAgents,
    dissentingPerspectives,
    resolvedAt: Date.now(),
  }
}
