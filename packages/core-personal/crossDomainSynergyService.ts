// packages/core-personal/crossDomainSynergyService.ts — Động cơ phân tích cộng hưởng và xung đột đa miền
// Traversal qua 5 miền (Learning, Career, Work, Startup, Life) để đề xuất hành động tối ưu.

import type { Pool } from 'pg'
import { syncCrossDomainLifeGraph } from './crossDomainGraphService.js'

export interface CrossDomainSynergyItem {
  id: string
  title: string
  sourceDomain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  targetDomain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  description: string
  impact: 'high' | 'medium' | 'low'
  suggestedAction?: string
}

export interface CrossDomainConflictItem {
  id: string
  title: string
  domains: Array<'learning' | 'career' | 'work' | 'startup' | 'life'>
  description: string
  severity: 'high' | 'medium' | 'low'
  mitigationSuggestion: string
}

export interface CrossDomainSynergyReport {
  personId: string
  synergies: CrossDomainSynergyItem[]
  conflicts: CrossDomainConflictItem[]
  nodesCount: number
  edgesCount: number
  generatedAt: string
}

export async function analyzeCrossDomainSynergies(
  pool: Pool,
  personId: string,
  userId: string,
): Promise<CrossDomainSynergyReport> {
  const graph = await syncCrossDomainLifeGraph(pool, personId, userId)

  const synergies: CrossDomainSynergyItem[] = []
  const conflicts: CrossDomainConflictItem[] = []

  // 1. Phân tích các Goal Nodes và Skill Nodes
  const goalNodes = graph.nodes.filter((n) => n.type === 'Goal')
  const skillNodes = graph.nodes.filter((n) => n.type === 'Skill')

  // Tìm các kỹ năng tiếng Anh/ngoại ngữ phục vụ mục tiêu Career
  const careerGoals = goalNodes.filter((g) => g.label.toLowerCase().includes('career'))
  const langSkills = skillNodes.filter((s) =>
    /english|tiếng anh|ielts|toeic|communication/i.test(s.label),
  )

  if (careerGoals.length > 0 && langSkills.length > 0) {
    synergies.push({
      id: `syn-career-lang-${personId.slice(0, 8)}`,
      title: 'Cộng hưởng Ngoại ngữ & Mục tiêu Sự nghiệp',
      sourceDomain: 'learning',
      targetDomain: 'career',
      description: `Bạn có ${langSkills.length} kỹ năng ngôn ngữ đang được yêu cầu trực tiếp bởi mục tiêu sự nghiệp "${careerGoals[0]?.label ?? ''}".`,
      impact: 'high',
      suggestedAction:
        'Luyện tập Speaking chuyên ngành trên Đồng Hành để nâng cao cơ hội phỏng vấn.',
    })
  }

  // 2. Tự động kiểm tra số lượng mục tiêu đồng thời (Phát hiện quá tải/xung đột thời gian)
  if (goalNodes.length >= 4) {
    conflicts.push({
      id: `con-overload-${personId.slice(0, 8)}`,
      title: 'Nguy cơ phân tán năng lượng đa mục tiêu',
      domains: ['career', 'learning', 'work', 'life'],
      description: `Đang có ${goalNodes.length} mục tiêu lớn hoạt động song song giữa các lĩnh vực.`,
      severity: 'medium',
      mitigationSuggestion:
        'Nên ưu tiên tối đa 2 mục tiêu trọng tâm trong tháng này để đảm bảo tỷ lệ hoàn thành cao nhất.',
    })
  }

  // 3. Nếu chưa có nhiều kết nối, gợi ý liên kết đầu tiên
  if (synergies.length === 0) {
    synergies.push({
      id: `syn-init-${personId.slice(0, 8)}`,
      title: 'Khám phá liên kết Kỹ năng & Mục tiêu',
      sourceDomain: 'learning',
      targetDomain: 'career',
      description:
        'Hệ thống đang sẵn sàng đồng bộ kỹ năng học tập của bạn vào bản đồ sự nghiệp và đời sống.',
      impact: 'medium',
      suggestedAction: 'Thiết lập thêm mục tiêu trong tab Sự nghiệp hoặc Đời sống.',
    })
  }

  return {
    personId,
    synergies,
    conflicts,
    nodesCount: graph.nodes.length,
    edgesCount: graph.edges.length,
    generatedAt: new Date().toISOString(),
  }
}
