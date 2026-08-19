// packages/core-contracts/avatarEmbodiment.ts — Hợp đồng Hiện thân 3D & Khẩu hình Viseme Morphing V4.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const AVATAR_EMBODIMENT_VERSION = 'v4.1.0'

export const Oculus15VisemeSchema = z.enum([
  'sil', // Im lặng / Rest
  'PP', // /p/, /b/, /m/ (môi khép)
  'FF', // /f/, /v/ (răng trên chạm môi dưới)
  'TH', // /θ/, /ð/ (lưỡi kẹp giữa 2 răng)
  'DD', // /t/, /d/, /n/ (đầu lưỡi vòm họng)
  'kk', // /k/, /g/, /ŋ/ (gốc lưỡi ngạc mềm)
  'CH', // /tʃ/, /dʒ/, /ʃ/, /ʒ/ (môi chu nhẹ, thoát khí)
  'SS', // /s/, /z/ (răng khép, khe hẹp)
  'nn', // /l/, /d/, /t/
  'RR', // /r/ (môi hơi chu tròn)
  'aa', // /ɑː/, /æ/, /ʌ/ (miệng mở rộng)
  'E', // /e/, /eɪ/, /ɛ/ (miệng mở vừa ngang)
  'I', // /iː/, /ɪ/ (miệng bẹt bè ngang)
  'O', // /ɒ/, /ɔː/, /oʊ/ (môi tròn mở to)
  'U', // /uː/, /ʊ/ (môi chu nhỏ chặt)
])

export type Oculus15Viseme = z.infer<typeof Oculus15VisemeSchema>

export const VisemeMorphTargetSchema = z
  .object({
    viseme: Oculus15VisemeSchema,
    weight: z.number().min(0).max(1),
    mouthWidth: z.number().min(0).max(1),
    mouthHeight: z.number().min(0).max(1),
    ledIntensity: z.number().min(0).max(1),
    timestampMs: z.number().nonnegative().optional(),
  })
  .strict()

export type VisemeMorphTarget = z.infer<typeof VisemeMorphTargetSchema>

export const AvatarEmotionTypeSchema = z.enum([
  'neutral',
  'focused',
  'celebrating',
  'encouraging',
  'thinking',
  'listening',
])

export type AvatarEmotionType = z.infer<typeof AvatarEmotionTypeSchema>

export const AvatarEmotionStateSchema = z
  .object({
    emotion: AvatarEmotionTypeSchema.default('neutral'),
    intensity: z.number().min(0).max(1).default(0.8),
    eyeGlowColor: z.string().default('#00f0ff'),
  })
  .strict()

export type AvatarEmotionState = z.infer<typeof AvatarEmotionStateSchema>

export const Avatar3DStateSchema = z
  .object({
    pitch: z.number(), // Độ nghiêng đầu lên/xuống (rad)
    yaw: z.number(), // Độ xoay đầu trái/phải (rad)
    roll: z.number(), // Độ nghiêng cổ trái/phải (rad)
    gazeX: z.number().min(-1).max(1), // Ánh mắt ngang
    gazeY: z.number().min(-1).max(1), // Ánh mắt dọc
    breathPhase: z.number().min(0).max(1), // Chu kỳ thở 0..1
    blinkState: z.number().min(0).max(1), // 0: mở to, 1: nhắm mắt
    activeViseme: VisemeMorphTargetSchema,
    emotion: AvatarEmotionStateSchema,
    timestamp: IsoDateTimeSchema,
    schemaVersion: z.literal(AVATAR_EMBODIMENT_VERSION).default(AVATAR_EMBODIMENT_VERSION),
  })
  .strict()

export type Avatar3DState = z.infer<typeof Avatar3DStateSchema>

export const AvatarRenderModeSchema = z.enum(['3d_cyber_avatar', 'live_orb', 'minimal'])

export type AvatarRenderMode = z.infer<typeof AvatarRenderModeSchema>

export const AvatarQualityProfileSchema = z.enum(['high', 'medium', 'battery_saver'])

export type AvatarQualityProfile = z.infer<typeof AvatarQualityProfileSchema>

export const AvatarEmbodimentConfigSchema = z
  .object({
    personId: UuidSchema,
    renderMode: AvatarRenderModeSchema.default('3d_cyber_avatar'),
    quality: AvatarQualityProfileSchema.default('high'),
    emissiveAccent: z.string().default('cyan'),
    autoGaze: z.boolean().default(true),
    idleAnimations: z.boolean().default(true),
    schemaVersion: z.literal(AVATAR_EMBODIMENT_VERSION).default(AVATAR_EMBODIMENT_VERSION),
  })
  .strict()

export type AvatarEmbodimentConfig = z.infer<typeof AvatarEmbodimentConfigSchema>
