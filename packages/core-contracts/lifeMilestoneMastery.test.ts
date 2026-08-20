// packages/core-contracts/lifeMilestoneMastery.test.ts
import { describe, expect, it } from 'vitest'
import {
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
  LifeStageTypeSchema,
  CapitalCategorySchema,
  MilestoneBenchmarkItemSchema,
  DeathTrapDefenseSchema,
  LifeStageProfileSchema,
  FiveCapitalsAssessmentSchema,
  SupremePrincipleComplianceSchema,
  DailyLifeOSRoutineSchema,
  MotivationDiagnosticSchema,
  MicroEvidenceLogSchema,
} from './lifeMilestoneMastery.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

describe('Life Milestone Mastery Contracts', () => {
  it('validates LifeStageType enum and CapitalCategory enum', () => {
    expect(LifeStageTypeSchema.parse('early_childhood_primary')).toBe('early_childhood_primary')
    expect(LifeStageTypeSchema.parse('upper_secondary')).toBe('upper_secondary')
    expect(LifeStageTypeSchema.parse('family_builder')).toBe('family_builder')
    expect(() => LifeStageTypeSchema.parse('invalid_stage')).toThrow()

    expect(CapitalCategorySchema.parse('human')).toBe('human')
    expect(CapitalCategorySchema.parse('moral_legacy')).toBe('moral_legacy')
    expect(() => CapitalCategorySchema.parse('invalid_capital')).toThrow()
  })

  it('validates MilestoneBenchmarkItem and DeathTrapDefense', () => {
    const item = {
      id: 'ielts-7-milestone',
      title: 'Đạt IELTS 7.0 - 8.0',
      category: 'human',
      tier: 'baseline',
      description: 'Chứng chỉ ngoại ngữ chuẩn mực phục vụ hội nhập đại học',
      measurableMetric: 'IELTS Overall >= 7.0',
    }
    const parsedItem = MilestoneBenchmarkItemSchema.parse(item)
    expect(parsedItem.id).toBe('ielts-7-milestone')

    const trap = {
      trapName: 'Nợ tiêu dùng & Cờ bạc mạng',
      riskDescription: 'Dính vào bẫy tín dụng đen hoặc cờ bạc trực tuyến',
      consequence: 'Gánh nặng nợ nần, mất phương hướng tuổi trẻ',
      antidoteStrategy: 'Giáo dục tài chính FQ sớm, cắt toàn bộ app tín dụng đen',
    }
    const parsedTrap = DeathTrapDefenseSchema.parse(trap)
    expect(parsedTrap.trapName).toBe('Nợ tiêu dùng & Cờ bạc mạng')
  })

  it('validates LifeStageProfile', () => {
    const profile = {
      stage: 'upper_secondary',
      ageRange: '15 - 18 tuổi',
      vietnameseTitle: 'THPT & Vị thành niên (Cấp 3)',
      developmentalCore: 'Bệ phóng học thuật, định vị nghề nghiệp và bản lĩnh',
      benchmarks: [
        {
          id: 'ielts-7',
          title: 'IELTS 7.0+',
          category: 'human',
          tier: 'baseline',
          description: 'Chuẩn bị đầu ra THPT',
          measurableMetric: 'IELTS >= 7.0',
        },
      ],
      deathTraps: [
        {
          trapName: 'Chọn sai ngành',
          riskDescription: 'Chạy theo trào lưu',
          consequence: 'Lãng phí 4-5 năm đại học',
          antidoteStrategy: 'Thấu hiểu Ikigai và trải nghiệm thực tế',
        },
      ],
    }
    const parsed = LifeStageProfileSchema.parse(profile)
    expect(parsed.stage).toBe('upper_secondary')
    expect(parsed.benchmarks.length).toBe(1)
  })

  it('validates FiveCapitalsAssessment and detects invalid scores', () => {
    const validAssessment = {
      id: ID_1,
      personId: PERSON_ID,
      humanScore: 85,
      physicalScore: 78,
      socialScore: 90,
      financialScore: 70,
      moralLegacyScore: 95,
      overallBalanceScore: 83.6,
      bottleneckCapital: 'financial',
      createdAt: '2026-08-20T10:00:00Z',
      schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
    }
    const parsed = FiveCapitalsAssessmentSchema.parse(validAssessment)
    expect(parsed.bottleneckCapital).toBe('financial')

    const invalidAssessment = {
      ...validAssessment,
      humanScore: 120, // > 100
    }
    expect(() => FiveCapitalsAssessmentSchema.parse(invalidAssessment)).toThrow()
  })

  it('validates SupremePrincipleCompliance', () => {
    const compliance = {
      id: ID_1,
      personId: PERSON_ID,
      isLegallyCompliant: true,
      isCompassionAligned: true,
      legalChecklist: ['Minh bạch thuế', 'Tôn trọng quyền sở hữu trí tuệ'],
      compassionChecklist: ['Yêu thương gia đình', 'Phụng sự cộng đồng'],
      flaggedConcerns: [],
      verdict: 'approved',
      explanation: 'Kế hoạch hoàn toàn hợp pháp và chan chứa tình yêu thương.',
      evaluatedAt: '2026-08-20T10:00:00Z',
      schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
    }
    const parsed = SupremePrincipleComplianceSchema.parse(compliance)
    expect(parsed.verdict).toBe('approved')
    expect(parsed.isLegallyCompliant).toBe(true)
  })

  it('validates DailyLifeOSRoutine', () => {
    const routine = {
      id: ID_1,
      personId: PERSON_ID,
      stage: 'university_launchpad',
      morningGoldenHour: {
        exerciseMinutes: 20,
        mindFoodMinutes: 20,
        top3Priorities: ['Hoàn thành đồ án AI', 'Luyện nghe IELTS Speaking', 'Tập gym 45p'],
      },
      deepWorkMinutes: 180,
      compassionateAction: 'Hướng dẫn bài tập lập trình cho đàn em khóa dưới',
      eveningReflection: {
        gratitudeEntries: ['Biết ơn sức khỏe tốt', 'Biết ơn cha mẹ luôn ủng hộ'],
        microVictories: ['Hoàn thành 100% bài tập tuần', 'Không lướt mạng xã hội khi học'],
        bedtimeTarget: '22:45',
      },
      createdAt: '2026-08-20T10:00:00Z',
      schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
    }
    const parsed = DailyLifeOSRoutineSchema.parse(routine)
    expect(parsed.deepWorkMinutes).toBe(180)
    expect(parsed.morningGoldenHour.top3Priorities.length).toBe(3)
  })

  it('validates MotivationDiagnostic and MicroEvidenceLog', () => {
    const diagnostic = {
      id: ID_1,
      personId: PERSON_ID,
      autonomyLevel: 9,
      competenceLevel: 8,
      relatednessLevel: 9,
      dopamineDynamic: 'tonic_sustainable',
      unshakeableBeliefIndex: 88,
      logotherapyWhyReason: 'Chiến đấu vì tương lai tươi sáng của con và danh dự gia đình',
      prescribedActionSteps: ['Giữ vững nghi thức buổi sáng', 'Ăn mừng 3 chiến thắng nhỏ mỗi ngày'],
      createdAt: '2026-08-20T10:00:00Z',
      schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
    }
    const parsedDiag = MotivationDiagnosticSchema.parse(diagnostic)
    expect(parsedDiag.autonomyLevel).toBe(9)

    const microEvidence = {
      id: ID_1,
      personId: PERSON_ID,
      actionDescription: 'Gấp chăn gối và tập thể dục 20 phút ngay khi thức dậy',
      capitalReinforced: 'physical',
      loggedAt: '2026-08-20',
      streakCount: 14,
      createdAt: '2026-08-20T10:00:00Z',
      schemaVersion: LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
    }
    const parsedLog = MicroEvidenceLogSchema.parse(microEvidence)
    expect(parsedLog.streakCount).toBe(14)
  })
})
