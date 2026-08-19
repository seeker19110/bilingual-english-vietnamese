// packages/core-contracts/articulatoryPhonetics.ts — Hợp đồng dữ liệu cho 3D Articulatory Phonetics & Pitch Contour Engine V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const PHONETICS_SCHEMA_VERSION = 'v3.0.0'

export const L1PhonemeTargetSchema = z.enum([
  'TH_VOICELESS', // /θ/ as in "think"
  'TH_VOICED', // /ð/ as in "this"
  'ASH_SHORT_A', // /æ/ as in "cat" vs /ʌ/ "cut"
  'RETROFLEX_R', // /r/ as in "red" vs VN /r/
  'FINAL_CLUSTER_KS', // /-ks/ as in "box", "fix"
  'AFFRICATE_CH', // /tʃ/ as in "church"
  'AFFRICATE_JH', // /dʒ/ as in "judge"
  'FINAL_SIBILANT_Z', // /-z/ as in "dogs", "plays"
])

export type L1PhonemeTarget = z.infer<typeof L1PhonemeTargetSchema>

export const TonguePositionSchema = z.enum([
  'tip_between_teeth',
  'tip_alveolar_ridge',
  'blade_hard_palate',
  'dorsum_velar',
  'low_front',
  'low_back',
  'curled_retroflex',
])

export type TonguePosition = z.infer<typeof TonguePositionSchema>

export const JawOpeningSchema = z.enum(['closed', 'half_open', 'fully_open'])
export const LipShapeSchema = z.enum(['spread', 'neutral', 'rounded'])

export const ArticulatoryGuideSchema = z
  .object({
    targetPhoneme: L1PhonemeTargetSchema,
    ipaSymbol: z.string().min(1).max(10),
    commonVietnameseMistake: z.string().min(1).max(300),
    tonguePosition: TonguePositionSchema,
    jawOpening: JawOpeningSchema,
    lipShape: LipShapeSchema,
    vocalCordVibration: z.boolean(),
    airflowDescription: z.string().min(1).max(300),
    stepByStepAnatomyTips: z.array(z.string()).min(1),
  })
  .strict()

export type ArticulatoryGuide = z.infer<typeof ArticulatoryGuideSchema>

export const PitchSampleSchema = z
  .object({
    timeMs: z.number().nonnegative(),
    f0Hz: z.number().nonnegative(),
  })
  .strict()

export type PitchSample = z.infer<typeof PitchSampleSchema>

export const PitchContourDataSchema = z
  .object({
    userPitchTrack: z.array(PitchSampleSchema),
    nativePitchTrack: z.array(PitchSampleSchema),
    alignmentScore: z.number().min(0).max(100),
    intonationPattern: z.enum(['rising', 'falling', 'fall_rise', 'rise_fall', 'flat']),
    stressAccentsMatch: z.boolean(),
    coachingAdvice: z.string().min(1).max(500),
  })
  .strict()

export type PitchContourData = z.infer<typeof PitchContourDataSchema>

export const PhoneticAnalysisReportSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    targetWordOrPhrase: z.string().min(1).max(200),
    targetPhoneme: L1PhonemeTargetSchema,
    articulatoryGuide: ArticulatoryGuideSchema,
    pitchContour: PitchContourDataSchema,
    overallPhoneticScore: z.number().min(0).max(100),
    l1InterferenceMitigated: z.boolean(),
    createdAt: IsoDateTimeSchema,
    schemaVersion: z.literal(PHONETICS_SCHEMA_VERSION),
  })
  .strict()

export type PhoneticAnalysisReport = z.infer<typeof PhoneticAnalysisReportSchema>
