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

  it('handles calculateConsensusDegree with 0 or 1 perspective', () => {
    expect(calculateConsensusDegree([])).toBe(1.0)
    expect(
      calculateConsensusDegree([
        {
          agentRole: 'career',
          agentName: 'Agent',
          standpoint: 'Stand',
          confidenceScore: 0.8,
          keyArguments: [],
          recommendedAction: 'Action',
        },
      ]),
    ).toBe(1.0)
  })

  it('handles dissenting perspectives (confidence < 0.6) and missing proposal id', () => {
    const proposal: ConsensusProposal = {
      id: '',
      questionOrTopic: 'Khởi nghiệp EdTech',
      domain: 'startup',
      perspectives: [
        {
          agentRole: 'career',
          agentName: 'Growth Expert',
          standpoint: 'Tập trung vào product-market fit',
          confidenceScore: 0.9,
          keyArguments: ['pmf', 'traction'],
          recommendedAction: 'Launch MVP',
        },
        {
          agentRole: 'pedagogy',
          agentName: 'Cautious Educator',
          standpoint: 'Cần thẩm định kỹ giáo trình',
          confidenceScore: 0.5, // < 0.6 -> dissenting
          keyArguments: ['audit', 'quality'],
          recommendedAction: 'Pedagogy Review',
        },
      ],
      createdAt: Date.now(),
    }

    const verdict = resolveMultiAgentConsensus(proposal)
    expect(verdict.proposalId).toMatch(/^prop-/)
    expect(verdict.domain).toBe('startup')
    expect(verdict.dissentingPerspectives.length).toBe(1)
    expect(verdict.dissentingPerspectives[0]).toContain('Quan điểm thận trọng từ Cautious Educator')
  })
})
