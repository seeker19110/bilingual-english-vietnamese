// packages/core-personal/workplaceErrorHarvesterService.ts — V3 Workplace Error Harvester & Auto-SRS Generator.
import { randomUUID } from 'node:crypto'
import {
  type HarvestedMistake,
  type AutoSrsCard,
  type HarvestedSourceType,
  WORKPLACE_HARVESTER_SCHEMA_VERSION,
} from '@dhcb/core-contracts/workplaceErrorHarvester'

// Bộ nhớ đệm tạm thời cho các lỗi thu hoạch được và thẻ SRS
const mistakesStore = new Map<string, HarvestedMistake[]>()
const srsCardsStore = new Map<string, AutoSrsCard[]>()

// Mẫu nhận diện các lỗi tiếng Anh công sở kinh điển người Việt hay mắc
interface CommonMistakePattern {
  regex: RegExp
  detected: string
  alternative: string
  explanationVi: string
  category: HarvestedMistake['errorCategory']
  cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  urgency: 'critical' | 'moderate' | 'polish'
}

const WORKPLACE_PATTERNS: CommonMistakePattern[] = [
  {
    regex: /\bdiscuss\s+about\b/i,
    detected: 'discuss about',
    alternative: 'discuss [something]',
    explanationVi:
      'Động từ "discuss" là ngoại động từ trực tiếp trong tiếng Anh, không đi kèm giới từ "about".',
    category: 'preposition_misuse',
    cefr: 'B1',
    urgency: 'moderate',
  },
  {
    regex: /\bexplain\s+me\b/i,
    detected: 'explain me',
    alternative: 'explain to me',
    explanationVi:
      'Cấu trúc đúng là "explain something to someone" hoặc "explain to someone that...", không dùng "explain me".',
    category: 'preposition_misuse',
    cefr: 'A2',
    urgency: 'critical',
  },
  {
    regex: /\binformation\s+are\b|\binformations\b/i,
    detected: 'informations / information are',
    alternative: 'information is / pieces of information',
    explanationVi:
      '"Information" là danh từ không đếm được trong tiếng Anh, luôn đi với động từ số ít "is".',
    category: 'l1_literal_translation',
    cefr: 'A2',
    urgency: 'critical',
  },
  {
    regex: /\bi\s+am\s+agree\b/i,
    detected: 'I am agree',
    alternative: 'I agree',
    explanationVi: '"Agree" là động từ, không phải tính từ, do đó không dùng với to-be "am".',
    category: 'l1_literal_translation',
    cefr: 'A1',
    urgency: 'critical',
  },
  {
    regex: /\blook\s+forward\s+to\s+hear\b/i,
    detected: 'look forward to hear',
    alternative: 'look forward to hearing',
    explanationVi:
      'Sau cụm "look forward to" (to là giới từ), bắt buộc dùng danh động từ V-ing ("hearing").',
    category: 'awkward_collocation',
    cefr: 'B1',
    urgency: 'moderate',
  },
  {
    regex: /\bgive\s+me\s+the\s+report\s+now\b/i,
    detected: 'Give me the report now',
    alternative: 'Could you please share the report with me when you get a chance?',
    explanationVi:
      'Câu mệnh lệnh trực tiếp dễ tạo cảm giác gay gắt trong văn hóa giao tiếp công sở quốc tế.',
    category: 'diplomatic_tone_mismatch',
    cefr: 'B2',
    urgency: 'polish',
  },
]

export function harvestMistakesFromText(
  personId: string,
  rawText: string,
  sourceType: HarvestedSourceType = 'email',
): HarvestedMistake[] {
  const userMistakes = mistakesStore.get(personId) ?? []
  const newHarvested: HarvestedMistake[] = []
  const now = new Date().toISOString()

  for (const pattern of WORKPLACE_PATTERNS) {
    if (pattern.regex.test(rawText)) {
      const mistake: HarvestedMistake = {
        id: randomUUID(),
        personId,
        sourceType,
        originalContextSnippet: rawText.slice(0, 300),
        detectedMistake: pattern.detected,
        nativeAlternative: pattern.alternative,
        explanationVi: pattern.explanationVi,
        errorCategory: pattern.category,
        cefrLevel: pattern.cefr,
        urgency: pattern.urgency,
        harvestedAt: now,
        convertedToSrs: false,
      }

      userMistakes.unshift(mistake)
      newHarvested.push(mistake)
    }
  }

  mistakesStore.set(personId, userMistakes)
  return newHarvested
}

export function listHarvestedMistakes(personId: string): HarvestedMistake[] {
  const existing = mistakesStore.get(personId)
  if (!existing || existing.length === 0) {
    // Khởi tạo một số mẫu mặc định sinh động nếu người dùng chưa có
    const initialSamples: HarvestedMistake[] = [
      {
        id: randomUUID(),
        personId,
        sourceType: 'email',
        originalContextSnippet:
          'Hi team, let us discuss about the project scope during tomorrow standup.',
        detectedMistake: 'discuss about',
        nativeAlternative: 'discuss the project scope',
        explanationVi:
          'Động từ "discuss" là ngoại động từ trực tiếp trong tiếng Anh, không đi kèm giới từ "about".',
        errorCategory: 'preposition_misuse',
        cefrLevel: 'B1',
        urgency: 'moderate',
        harvestedAt: new Date(Date.now() - 3600000).toISOString(),
        convertedToSrs: false,
      },
      {
        id: randomUUID(),
        personId,
        sourceType: 'slack_chat',
        originalContextSnippet: 'Could you explain me how the payment webhook works?',
        detectedMistake: 'explain me',
        nativeAlternative: 'explain to me',
        explanationVi: 'Cấu trúc chuẩn là "explain something to someone", không viết "explain me".',
        errorCategory: 'preposition_misuse',
        cefrLevel: 'A2',
        urgency: 'critical',
        harvestedAt: new Date(Date.now() - 7200000).toISOString(),
        convertedToSrs: false,
      },
      {
        id: randomUUID(),
        personId,
        sourceType: 'document_draft',
        originalContextSnippet: 'All informations regarding the API deployment are updated.',
        detectedMistake: 'informations are',
        nativeAlternative: 'all information is',
        explanationVi: '"Information" là danh từ không đếm được, luôn chia động từ số ít "is".',
        errorCategory: 'l1_literal_translation',
        cefrLevel: 'A2',
        urgency: 'critical',
        harvestedAt: new Date(Date.now() - 10800000).toISOString(),
        convertedToSrs: true,
      },
    ]
    mistakesStore.set(personId, initialSamples)
    return initialSamples
  }
  return existing
}

export function convertMistakeToSrsCard(personId: string, mistakeId: string): AutoSrsCard {
  const mistakes = listHarvestedMistakes(personId)
  const targetMistake = mistakes.find((m) => m.id === mistakeId)

  if (!targetMistake) {
    throw new Error(`Không tìm thấy lỗi với ID ${mistakeId}`)
  }

  targetMistake.convertedToSrs = true
  mistakesStore.set(personId, mistakes)

  const userCards = srsCardsStore.get(personId) ?? []
  const now = new Date().toISOString()
  const tomorrow = new Date(Date.now() + 86400000).toISOString()

  const card: AutoSrsCard = {
    id: randomUUID(),
    personId,
    mistakeId: targetMistake.id,
    frontPrompt: `Hãy sửa lỗi diễn đạt trong câu: "${targetMistake.originalContextSnippet}"`,
    backAnswer: `Chuẩn bản xứ: "${targetMistake.nativeAlternative}" — ${targetMistake.explanationVi}`,
    contextSentence: targetMistake.originalContextSnippet,
    drillType: 'rephrase',
    cefrLevel: targetMistake.cefrLevel,
    repetitionIntervalDays: 1,
    nextReviewDate: tomorrow,
    createdAt: now,
    schemaVersion: WORKPLACE_HARVESTER_SCHEMA_VERSION,
  }

  userCards.unshift(card)
  srsCardsStore.set(personId, userCards)

  return card
}

export function listAutoSrsCards(personId: string): AutoSrsCard[] {
  return srsCardsStore.get(personId) ?? []
}
