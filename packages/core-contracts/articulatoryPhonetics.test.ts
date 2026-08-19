import { describe, it, expect } from 'vitest'
import {
  ArticulatoryGuideSchema,
  PhoneticAnalysisReportSchema,
  PHONETICS_SCHEMA_VERSION,
} from './articulatoryPhonetics.js'

describe('articulatoryPhonetics contracts', () => {
  it('validates articulatory anatomy guide', () => {
    const guide = {
      targetPhoneme: 'TH_VOICELESS',
      ipaSymbol: '/θ/',
      commonVietnameseMistake:
        'Phát âm nhầm thành /t/ hoặc /s/ (ví dụ: "thank" -> "tank" hoặc "sank")',
      tonguePosition: 'tip_between_teeth',
      jawOpening: 'half_open',
      lipShape: 'neutral',
      vocalCordVibration: false,
      airflowDescription: 'Luồng khí liên tục đi qua khe giữa đầu lưỡi và răng cửa hàm trên',
      stepByStepAnatomyTips: [
        'Đặt nhẹ đầu lưỡi thò ra giữa hai hàm răng',
        'Thổi nhẹ luồng khí ra ngoài mà không làm rung dây thanh',
      ],
    }

    const parsed = ArticulatoryGuideSchema.parse(guide)
    expect(parsed.targetPhoneme).toBe('TH_VOICELESS')
    expect(parsed.vocalCordVibration).toBe(false)
  })

  it('validates pitch contour data and full phonetic analysis report', () => {
    const report = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      personId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      targetWordOrPhrase: 'thoughtful',
      targetPhoneme: 'TH_VOICELESS',
      articulatoryGuide: {
        targetPhoneme: 'TH_VOICELESS',
        ipaSymbol: '/θ/',
        commonVietnameseMistake: 'Lỗi phát âm thành /t/',
        tonguePosition: 'tip_between_teeth',
        jawOpening: 'half_open',
        lipShape: 'neutral',
        vocalCordVibration: false,
        airflowDescription: 'Luồng khí ma sát',
        stepByStepAnatomyTips: ['Đặt đầu lưỡi giữa răng'],
      },
      pitchContour: {
        userPitchTrack: [
          { timeMs: 0, f0Hz: 150 },
          { timeMs: 200, f0Hz: 180 },
        ],
        nativePitchTrack: [
          { timeMs: 0, f0Hz: 145 },
          { timeMs: 200, f0Hz: 185 },
        ],
        alignmentScore: 92,
        intonationPattern: 'falling',
        stressAccentsMatch: true,
        coachingAdvice: 'Đường cong ngữ điệu rất chuẩn, giữ vững cao độ ở âm tiết đầu!',
      },
      overallPhoneticScore: 88,
      l1InterferenceMitigated: true,
      createdAt: new Date().toISOString(),
      schemaVersion: PHONETICS_SCHEMA_VERSION,
    }

    const parsed = PhoneticAnalysisReportSchema.parse(report)
    expect(parsed.overallPhoneticScore).toBe(88)
    expect(parsed.pitchContour.alignmentScore).toBe(92)
  })
})
