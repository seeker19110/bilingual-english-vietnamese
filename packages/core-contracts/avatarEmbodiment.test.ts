// packages/core-contracts/avatarEmbodiment.test.ts
import { describe, it, expect } from 'vitest'
import {
  AVATAR_EMBODIMENT_VERSION,
  Oculus15VisemeSchema,
  VisemeMorphTargetSchema,
  Avatar3DStateSchema,
  AvatarEmbodimentConfigSchema,
} from './avatarEmbodiment.js'

describe('Avatar Embodiment Contract (V4.1)', () => {
  it('validates 15 Oculus visemes properly', () => {
    expect(Oculus15VisemeSchema.parse('sil')).toBe('sil')
    expect(Oculus15VisemeSchema.parse('aa')).toBe('aa')
    expect(Oculus15VisemeSchema.parse('CH')).toBe('CH')
    expect(() => Oculus15VisemeSchema.parse('invalid_viseme')).toThrow()
  })

  it('validates VisemeMorphTargetSchema', () => {
    const validTarget = {
      viseme: 'aa',
      weight: 0.85,
      mouthWidth: 0.6,
      mouthHeight: 0.9,
      ledIntensity: 1.0,
      timestampMs: 120,
    }
    const parsed = VisemeMorphTargetSchema.parse(validTarget)
    expect(parsed.weight).toBe(0.85)
    expect(parsed.mouthHeight).toBe(0.9)
  })

  it('validates full Avatar3DStateSchema', () => {
    const validState = {
      pitch: 0.05,
      yaw: -0.12,
      roll: 0.02,
      gazeX: 0.3,
      gazeY: -0.1,
      breathPhase: 0.45,
      blinkState: 0,
      activeViseme: {
        viseme: 'sil',
        weight: 0,
        mouthWidth: 0.2,
        mouthHeight: 0.05,
        ledIntensity: 0.3,
      },
      emotion: {
        emotion: 'listening',
        intensity: 0.9,
        eyeGlowColor: '#00f0ff',
      },
      timestamp: new Date().toISOString(),
      schemaVersion: AVATAR_EMBODIMENT_VERSION,
    }
    const parsed = Avatar3DStateSchema.parse(validState)
    expect(parsed.schemaVersion).toBe('v4.1.0')
    expect(parsed.emotion.emotion).toBe('listening')
  })

  it('validates AvatarEmbodimentConfigSchema defaults', () => {
    const validConfig = {
      personId: '11111111-1111-4111-8111-111111111111',
    }
    const parsed = AvatarEmbodimentConfigSchema.parse(validConfig)
    expect(parsed.renderMode).toBe('3d_cyber_avatar')
    expect(parsed.quality).toBe('high')
    expect(parsed.autoGaze).toBe(true)
    expect(parsed.schemaVersion).toBe('v4.1.0')
  })
})
