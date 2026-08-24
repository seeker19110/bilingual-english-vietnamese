// packages/core-contracts/career.ts — Contract cho Career Domain (V2-13).
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'
import { ProficiencyBandSchema } from './careerInterview.js'

export const CAREER_SCHEMA_VERSION = 1

export const CareerProfileSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    targetRole: z.string().min(1).max(200),
    currentTitle: z.string().max(200).optional(),
    yearsOfExperience: z.number().int().nonnegative(),
    industry: z.string().max(200).optional(),
    targetSalaryMin: z.number().nonnegative().optional(),
    targetSalaryMax: z.number().nonnegative().optional(),
    currency: z.string().default('VND'),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export const CareerExperienceSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    company: z.string().min(1).max(200),
    role: z.string().min(1).max(200),
    startDate: z.string().min(1).max(50),
    endDate: z.string().max(50).optional(),
    isCurrent: z.boolean().default(false),
    achievements: z.array(z.string().min(1).max(500)),
    createdAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export const CareerGoalStatusSchema = z.enum(['active', 'completed', 'paused', 'abandoned'])

export const CareerGoalSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    targetTitle: z.string().min(1).max(200),
    targetCompanyType: z.string().max(200).optional(),
    timeframe: z.string().max(100).optional(),
    status: CareerGoalStatusSchema,
    skillsRequired: z.array(z.string().min(1).max(100)),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

// Người dùng TỰ đánh giá bậc thành thạo của mình cho một kỹ năng, theo thang B1–B5 dùng chung
// (docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md mục 6.2).
// Cố ý dùng BẬC chứ không dùng "số năm kinh nghiệm" — mười năm lặp lại một việc không bằng
// mười năm tích luỹ (mục 6.1 của cùng tài liệu).
export const SkillSelfLevelSchema = z
  .object({
    skill: z.string().min(1).max(100),
    selfBand: ProficiencyBandSchema,
    // Bậc người dùng muốn đạt cho kỹ năng này. Mặc định B3 "Thạo việc" — nhãn thị trường
    // Middle/Nhân viên chính, mức tối thiểu để tự chịu trách nhiệm một kết quả.
    targetBand: ProficiencyBandSchema.default('B3'),
    updatedAt: IsoDateTimeSchema,
  })
  .strict()

export const SkillGapItemSchema = z
  .object({
    skill: z.string().min(1).max(100),
    requiredLevel: z.string().min(1).max(50),
    currentMastery: z.string().nullable(),
    isFulfilled: z.boolean(),
    // Bậc người dùng tự đánh giá — null khi họ CHƯA đánh giá kỹ năng này. Trước 2026-08-24 chỗ
    // này bịa cứng "In Progress" cho mọi kỹ năng ngoài tiếng Anh; nay nói thật là chưa có dữ liệu.
    selfBand: ProficiencyBandSchema.nullable().default(null),
    targetBand: ProficiencyBandSchema.nullable().default(null),
    // Nguồn của `currentMastery`: dữ liệu học thật trong hệ thống, hay người dùng tự khai.
    // Đặc tả năng lực mục 10 đòi "xác định bằng bằng chứng, không bằng tự khai" — ta chưa đo
    // được mọi kỹ năng, nên tối thiểu phải NÓI RÕ con số đến từ đâu.
    source: z.enum(['learning_data', 'self_assessment', 'unknown']).default('unknown'),
  })
  .strict()

export const CareerSkillGapAnalysisSchema = versionedObject(
  {
    personId: UuidSchema,
    goalId: UuidSchema,
    targetTitle: z.string().min(1).max(200),
    gaps: z.array(SkillGapItemSchema),
    analyzedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export type CareerProfile = z.infer<typeof CareerProfileSchema>
export type CareerExperience = z.infer<typeof CareerExperienceSchema>
export type CareerGoal = z.infer<typeof CareerGoalSchema>
export type CareerSkillGapAnalysis = z.infer<typeof CareerSkillGapAnalysisSchema>
export type SkillSelfLevel = z.infer<typeof SkillSelfLevelSchema>
export type SkillGapItem = z.infer<typeof SkillGapItemSchema>
