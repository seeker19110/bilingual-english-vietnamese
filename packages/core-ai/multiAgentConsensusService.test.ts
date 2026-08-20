import { describe, it, expect } from 'vitest'
import {
  type ConsensusProposal,
  calculateConsensusDegree,
  resolveMultiAgentConsensus,
} from './multiAgentConsensusService'

describe('multiAgentConsensusService (Multi-Agent Delphi Consensus)', () => {
  it('calculates consensus degree correctly between perspectives', () => {
    const perspectives = [
      {
        agentRole: 'pedagogy' as const,
        agentName: 'Gia Sư Sư Phạm',
        standpoint: 'Nên tập trung luyện phản xạ phát âm trước',
        confidenceScore: 0.95,
        keyArguments: ['phát âm', 'phản xạ', 'tự tin'],
        recommendedAction: 'Luyện 15 phút Shadowing',
      },
      {
        agentRole: 'linguistics' as const,
        agentName: 'Chuyên Gia Ngôn Ngữ',
        standpoint: 'Cần sửa lỗi ngữ âm IPA cơ bản',
        confidenceScore: 0.9,
        keyArguments: ['ngữ âm', 'ipa', 'phát âm'],
        recommendedAction: 'Học khẩu hình IPA',
      },
    ]

    const degree = calculateConsensusDegree(perspectives)
    expect(degree).toBeGreaterThan(0.5)
    expect(degree).toBeLessThanOrEqual(1.0)
  })

  it('resolves multi-agent consensus weighted by domain specialization', () => {
    const proposal: ConsensusProposal = {
      id: 'prop-1',
      questionOrTopic: 'Lộ trình chuyển ngành sang AI Engineer cho người đi làm',
      domain: 'career',
      perspectives: [
        {
          agentRole: 'career',
          agentName: 'Cố Vấn Nghề Nghiệp',
          standpoint: 'Xây dựng Portfolio GitHub và chứng chỉ uy tín',
          confidenceScore: 0.95,
          keyArguments: ['portfolio', 'github', 'chứng chỉ', 'thực chiến'],
          recommendedAction: 'Xây dựng 3 dự án End-to-End trên GitHub trong 90 ngày',
        },
        {
          agentRole: 'stem',
          agentName: 'Kiến Trúc Sư STEM',
          standpoint: 'Học sâu toán giải tích và xác suất thống kê',
          confidenceScore: 0.85,
          keyArguments: ['toán học', 'giải tích', 'xác suất'],
          recommendedAction: 'Ôn tập Linear Algebra và Calculus',
        },
        {
          agentRole: 'pedagogy',
          agentName: 'Chuyên Gia Phương Pháp',
          standpoint: 'Học theo chu kỳ ngắn 30 phút mỗi ngày',
          confidenceScore: 0.8,
          keyArguments: ['chu kỳ', 'thói quen', 'kỷ luật'],
          recommendedAction: 'Thiết lập thời gian biểu cố định',
        },
      ],
      createdAt: Date.now(),
    }

    const verdict = resolveMultiAgentConsensus(proposal)

    expect(verdict.proposalId).toBe('prop-1')
    expect(verdict.domain).toBe('career')
    expect(verdict.consensusDegree).toBeGreaterThan(0.4)
    expect(verdict.contributingAgents.length).toBe(3)
    // Career lead perspective should prevail in 'career' domain
    expect(verdict.finalRecommendedAction).toContain('GitHub')
    expect(verdict.synthesisSummary).toContain('Portfolio')
  })
})
