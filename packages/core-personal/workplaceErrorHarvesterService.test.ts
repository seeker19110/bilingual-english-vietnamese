import { describe, it, expect } from 'vitest'
import {
  harvestMistakesFromText,
  listHarvestedMistakes,
  convertMistakeToSrsCard,
  listAutoSrsCards,
} from './workplaceErrorHarvesterService.js'

describe('workplaceErrorHarvesterService', () => {
  it('harvests workplace mistakes from raw draft text', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const text = 'Hi Sarah, I am agree that we should discuss about the budget.'
    const harvested = harvestMistakesFromText(personId, text, 'email')

    expect(harvested.length).toBeGreaterThanOrEqual(2)
    const hasDiscuss = harvested.some((m) => m.detectedMistake === 'discuss about')
    const hasAgree = harvested.some((m) => m.detectedMistake === 'I am agree')
    expect(hasDiscuss).toBe(true)
    expect(hasAgree).toBe(true)
  })

  it('converts a harvested mistake to a Spaced Repetition SRS Card', () => {
    const personId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    const mistakes = listHarvestedMistakes(personId)
    expect(mistakes.length).toBeGreaterThan(0)

    const firstMistake = mistakes[0]!
    const srsCard = convertMistakeToSrsCard(personId, firstMistake.id)

    expect(srsCard.mistakeId).toBe(firstMistake.id)
    expect(srsCard.frontPrompt).toContain('Hãy sửa lỗi')

    const userCards = listAutoSrsCards(personId)
    expect(userCards.length).toBeGreaterThanOrEqual(1)
  })
})
