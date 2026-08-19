import { describe, it, expect } from 'vitest'
import {
  getArticulatoryGuide,
  generatePitchContour,
  analyzePhoneticsAndPitch,
} from './articulatoryPhoneticsService.js'

describe('articulatoryPhoneticsService', () => {
  it('retrieves anatomy guide for TH_VOICELESS and ASH_SHORT_A', () => {
    const thGuide = getArticulatoryGuide('TH_VOICELESS')
    expect(thGuide.ipaSymbol).toBe('/θ/')
    expect(thGuide.tonguePosition).toBe('tip_between_teeth')
    expect(thGuide.vocalCordVibration).toBe(false)

    const ashGuide = getArticulatoryGuide('ASH_SHORT_A')
    expect(ashGuide.ipaSymbol).toBe('/æ/')
    expect(ashGuide.jawOpening).toBe('fully_open')
  })

  it('generates pitch contour for questions and statements', () => {
    const questionContour = generatePitchContour('Are you ready?', 90)
    expect(questionContour.intonationPattern).toBe('rising')
    expect(questionContour.alignmentScore).toBe(90)

    const statementContour = generatePitchContour('I love programming.', 85)
    expect(statementContour.intonationPattern).toBe('falling')
  })

  it('produces a full phonetic analysis report', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const report = analyzePhoneticsAndPitch(personId, 'Thank you very much', 'TH_VOICELESS', 88)
    expect(report.id).toBeDefined()
    expect(report.overallPhoneticScore).toBe(88)
    expect(report.l1InterferenceMitigated).toBe(true)
    expect(report.articulatoryGuide.targetPhoneme).toBe('TH_VOICELESS')
  })
})
