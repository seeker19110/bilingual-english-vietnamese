import { describe, it, expect } from 'vitest'
import {
  HarvestedMistakeSchema,
  AutoSrsCardSchema,
  WORKPLACE_HARVESTER_SCHEMA_VERSION,
} from './workplaceErrorHarvester.js'

describe('workplaceErrorHarvester contracts', () => {
  it('validates a harvested workplace mistake', () => {
    const mistake = {
      id: '33333333-3333-4333-8333-333333333333',
      personId: '44444444-4444-4444-8444-444444444444',
      sourceType: 'email',
      originalContextSnippet: 'Please discuss about this proposal tomorrow.',
      detectedMistake: 'discuss about',
      nativeAlternative: 'discuss this proposal',
      explanationVi: 'Động từ "discuss" là ngoại động từ trực tiếp, không đi kèm giới từ "about".',
      errorCategory: 'preposition_misuse',
      cefrLevel: 'B1',
      urgency: 'moderate',
      harvestedAt: new Date().toISOString(),
      convertedToSrs: false,
    }

    const parsed = HarvestedMistakeSchema.parse(mistake)
    expect(parsed.detectedMistake).toBe('discuss about')
    expect(parsed.convertedToSrs).toBe(false)
  })

  it('validates an auto-generated SRS card from a mistake', () => {
    const card = {
      id: '55555555-5555-4555-8555-555555555555',
      personId: '44444444-4444-4444-8444-444444444444',
      mistakeId: '33333333-3333-4333-8333-333333333333',
      frontPrompt: 'Hãy sửa câu: "Please discuss about this issue with the client."',
      backAnswer: 'Please discuss this issue with the client.',
      contextSentence: 'We will discuss this issue tomorrow morning.',
      drillType: 'rephrase',
      cefrLevel: 'B1',
      repetitionIntervalDays: 1,
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      schemaVersion: WORKPLACE_HARVESTER_SCHEMA_VERSION,
    }

    const parsed = AutoSrsCardSchema.parse(card)
    expect(parsed.drillType).toBe('rephrase')
    expect(parsed.repetitionIntervalDays).toBe(1)
  })
})
