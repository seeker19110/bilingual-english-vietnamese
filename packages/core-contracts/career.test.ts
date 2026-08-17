import { describe, expect, it } from 'vitest'
import {
  CareerProfileSchema,
  CareerExperienceSchema,
  CareerGoalSchema,
  CareerSkillGapAnalysisSchema,
  CAREER_SCHEMA_VERSION,
} from './career.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

describe('Career Domain Contracts', () => {
  it('validates CareerProfile', () => {
    const profile = {
      id: ID_1,
      personId: PERSON_ID,
      targetRole: 'Senior Frontend Engineer',
      currentTitle: 'Frontend Developer',
      yearsOfExperience: 4,
      industry: 'Software & Technology',
      targetSalaryMin: 35000000,
      targetSalaryMax: 50000000,
      currency: 'VND',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: CAREER_SCHEMA_VERSION,
    }

    const parsed = CareerProfileSchema.parse(profile)
    expect(parsed.targetRole).toBe('Senior Frontend Engineer')
    expect(parsed.yearsOfExperience).toBe(4)
  })

  it('validates CareerExperience', () => {
    const exp = {
      id: ID_1,
      personId: PERSON_ID,
      company: 'Tech Corp',
      role: 'Frontend Developer',
      startDate: '2022-01',
      endDate: '2024-06',
      isCurrent: false,
      achievements: ['Tối ưu Core Web Vitals tăng 30%'],
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: CAREER_SCHEMA_VERSION,
    }

    const parsed = CareerExperienceSchema.parse(exp)
    expect(parsed.company).toBe('Tech Corp')
  })

  it('validates CareerGoal', () => {
    const goal = {
      id: ID_1,
      personId: PERSON_ID,
      targetTitle: 'Data Analyst',
      targetCompanyType: 'Fintech',
      timeframe: '6 months',
      status: 'active',
      skillsRequired: ['SQL', 'English B2', 'Python'],
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: CAREER_SCHEMA_VERSION,
    }

    const parsed = CareerGoalSchema.parse(goal)
    expect(parsed.targetTitle).toBe('Data Analyst')
    expect(parsed.skillsRequired).toContain('SQL')
  })

  it('validates CareerSkillGapAnalysis', () => {
    const gap = {
      personId: PERSON_ID,
      goalId: ID_1,
      targetTitle: 'Data Analyst',
      gaps: [
        {
          skill: 'English B2',
          requiredLevel: 'B2',
          currentMastery: 'B1',
          isFulfilled: false,
        },
        {
          skill: 'SQL',
          requiredLevel: 'Intermediate',
          currentMastery: 'Intermediate',
          isFulfilled: true,
        },
      ],
      analyzedAt: '2026-08-17T00:00:00Z',
      schemaVersion: CAREER_SCHEMA_VERSION,
    }

    const parsed = CareerSkillGapAnalysisSchema.parse(gap)
    expect(parsed.gaps.length).toBe(2)
    expect(parsed.gaps[0]?.isFulfilled).toBe(false)
  })
})
