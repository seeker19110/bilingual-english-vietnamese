// packages/core-life/lifeMilestoneMasteryService.test.ts
import { describe, expect, it } from 'vitest'
import {
  getLifeStageProfile,
  getAllLifeStageProfiles,
  evaluateFiveCapitals,
  verifySupremeCompliance,
  generateDailyLifeOSRoutine,
  diagnoseMotivationAndBelief,
  createMicroEvidenceLogInMemory,
} from './lifeMilestoneMasteryService.js'
import type { LifeStageType } from '../core-contracts/lifeMilestoneMastery.js'

const PERSON_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

describe('LifeMilestoneMasteryService', () => {
  it('retrieves profile for each of the 8 life stages', () => {
    const stages: LifeStageType[] = [
      'early_childhood_primary',
      'lower_secondary',
      'upper_secondary',
      'university_launchpad',
      'young_professional',
      'family_builder',
      'prime_leader',
      'sage_legacy',
    ]

    for (const stage of stages) {
      const profile = getLifeStageProfile(stage)
      expect(profile.stage).toBe(stage)
      expect(profile.benchmarks.length).toBeGreaterThan(0)
      expect(profile.deathTraps.length).toBeGreaterThan(0)
      expect(profile.vietnameseTitle).toBeDefined()
    }

    const allProfiles = getAllLifeStageProfiles()
    expect(allProfiles.length).toBe(8)
  })

  describe('evaluateFiveCapitals', () => {
    it('computes balance and identifies bottleneck accurately', () => {
      const assessment = evaluateFiveCapitals(PERSON_ID, {
        human: 90,
        physical: 80,
        social: 85,
        financial: 45, // lowest
        moralLegacy: 95,
      })

      expect(assessment.personId).toBe(PERSON_ID)
      expect(assessment.financialScore).toBe(45)
      expect(assessment.bottleneckCapital).toBe('financial')
      expect(assessment.overallBalanceScore).toBe(79)
    })

    it('clamps scores between 0 and 100', () => {
      const assessment = evaluateFiveCapitals(PERSON_ID, {
        human: 150, // clamp to 100
        physical: -20, // clamp to 0
        social: 50,
        financial: 50,
        moralLegacy: 50,
      })

      expect(assessment.humanScore).toBe(100)
      expect(assessment.physicalScore).toBe(0)
      expect(assessment.bottleneckCapital).toBe('physical')
    })
  })

  describe('verifySupremeCompliance', () => {
    it('approves compliant, ethical and compassionate plans', () => {
      const result = verifySupremeCompliance(PERSON_ID, {
        planText:
          'Học tập chăm chỉ, luyện thi IELTS 7.5 và đi làm thêm gia sư tích lũy kinh nghiệm.',
        actionItems: [
          'Dậy sớm chạy bộ 30p',
          'Tập trung học sâu 3h',
          'Dành thời gian ăn cơm cùng gia đình',
        ],
        targetAudience: 'Sinh viên năm 2',
      })

      expect(result.verdict).toBe('approved')
      expect(result.isLegallyCompliant).toBe(true)
      expect(result.isCompassionAligned).toBe(true)
      expect(result.flaggedConcerns.length).toBe(0)
      expect(result.legalChecklist.length).toBeGreaterThan(0)
      expect(result.compassionChecklist.length).toBeGreaterThan(0)
    })

    it('rejects plans violating the law (gambling, fraud, tax evasion, violence, hacking)', () => {
      const result = verifySupremeCompliance(PERSON_ID, {
        planText: 'Tham gia đánh bạc tài xỉu trực tuyến và trốn thuế để giàu nhanh.',
        actionItems: ['Chơi cá độ', 'Rửa tiền'],
      })

      expect(result.verdict).toBe('rejected')
      expect(result.isLegallyCompliant).toBe(false)
      expect(result.flaggedConcerns.length).toBeGreaterThan(0)
      expect(result.explanation).toContain('vi phạm Quy ước Tối thượng về Pháp luật')
    })

    it('requires revision when plan is toxic or lacks compassion', () => {
      const result = verifySupremeCompliance(PERSON_ID, {
        planText:
          'Quyết tâm làm việc cật lực để hại người và trả thù đối thủ, sẵn sàng bỏ bê con cái.',
        actionItems: ['Chèn ép đồng nghiệp'],
      })

      expect(result.verdict).toBe('requires_revision')
      expect(result.isLegallyCompliant).toBe(true)
      expect(result.isCompassionAligned).toBe(false)
      expect(result.explanation).toContain(
        'cần điều chỉnh tâm thế để phù hợp với Quy ước Yêu thương con người',
      )
    })
  })

  describe('generateDailyLifeOSRoutine', () => {
    it('generates customized routines for all life stages', () => {
      const primaryRoutine = generateDailyLifeOSRoutine(PERSON_ID, 'early_childhood_primary')
      expect(primaryRoutine.stage).toBe('early_childhood_primary')
      expect(primaryRoutine.deepWorkMinutes).toBe(60)

      const uniRoutine = generateDailyLifeOSRoutine(PERSON_ID, 'university_launchpad', [
        'Luyện đề IELTS Speaking',
        'Tập gym 45p',
      ])
      expect(uniRoutine.stage).toBe('university_launchpad')
      expect(uniRoutine.morningGoldenHour.top3Priorities).toEqual([
        'Luyện đề IELTS Speaking',
        'Tập gym 45p',
      ])

      const familyRoutine = generateDailyLifeOSRoutine(PERSON_ID, 'family_builder')
      expect(familyRoutine.stage).toBe('family_builder')
      expect(familyRoutine.compassionateAction).toContain('con')

      const sageRoutine = generateDailyLifeOSRoutine(PERSON_ID, 'sage_legacy')
      expect(sageRoutine.stage).toBe('sage_legacy')
      expect(sageRoutine.morningGoldenHour.exerciseMinutes).toBe(45)

      // Test all other stages
      generateDailyLifeOSRoutine(PERSON_ID, 'lower_secondary')
      generateDailyLifeOSRoutine(PERSON_ID, 'upper_secondary')
      generateDailyLifeOSRoutine(PERSON_ID, 'young_professional')
      generateDailyLifeOSRoutine(PERSON_ID, 'prime_leader')
    })
  })

  describe('diagnoseMotivationAndBelief', () => {
    it('computes sustainable tonic dopamine and unshakeable belief', () => {
      const result = diagnoseMotivationAndBelief(PERSON_ID, {
        autonomy: 9,
        competence: 8,
        relatedness: 9,
        isChasingInstantDopamine: false,
        whyReason: 'Vì tương lai gia đình và sự tự hào của cha mẹ',
      })

      expect(result.dopamineDynamic).toBe('tonic_sustainable')
      expect(result.unshakeableBeliefIndex).toBe(86.7)
      expect(result.logotherapyWhyReason).toBe('Vì tương lai gia đình và sự tự hào của cha mẹ')
      expect(result.prescribedActionSteps.length).toBeGreaterThan(0)
    })

    it('handles low SDT scores and phasic dopamine scatter', () => {
      const result = diagnoseMotivationAndBelief(PERSON_ID, {
        autonomy: 3,
        competence: 4,
        relatedness: 4,
        isChasingInstantDopamine: true,
        whyReason: '',
      })

      expect(result.dopamineDynamic).toBe('phasic_scattered')
      expect(result.unshakeableBeliefIndex).toBeLessThan(50)
      expect(result.prescribedActionSteps).toContain(
        'Chuyển đổi tâm thế từ "Tôi buộc phải làm" sang "Tôi chọn làm vì đây là con đường tự do của tôi"',
      )
      expect(result.prescribedActionSteps).toContain(
        'Chia nhỏ mục tiêu lớn thành các nhiệm vụ 15 phút để tích lũy chiến thắng vi mô (Micro-wins)',
      )
      expect(result.prescribedActionSteps).toContain(
        'Gắn hành động học tập/làm việc với lợi ích cụ thể của người thân yêu nhất',
      )
    })
  })

  describe('createMicroEvidenceLogInMemory', () => {
    it('creates a validated micro-evidence item to build neural belief', () => {
      const log = createMicroEvidenceLogInMemory(PERSON_ID, {
        actionDescription: 'Gấp chăn màn và hít đất 20 cái ngay khi thức dậy',
        capitalReinforced: 'physical',
        currentStreak: 5,
      })

      expect(log.personId).toBe(PERSON_ID)
      expect(log.streakCount).toBe(6)
      expect(log.capitalReinforced).toBe('physical')
      expect(log.loggedAt).toBeDefined()
    })
  })
})
