import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  parseAzurePronounceResponse,
  resolveAzurePronounceConfig,
  assessPronunciation,
} from './azurePronounce.js'

const OLD_KEY = process.env.AZURE_SPEECH_KEY
const OLD_REGION = process.env.AZURE_SPEECH_REGION

afterEach(() => {
  vi.unstubAllGlobals()
  if (OLD_KEY === undefined) delete process.env.AZURE_SPEECH_KEY
  else process.env.AZURE_SPEECH_KEY = OLD_KEY
  if (OLD_REGION === undefined) delete process.env.AZURE_SPEECH_REGION
  else process.env.AZURE_SPEECH_REGION = OLD_REGION
})

describe('resolveAzurePronounceConfig', () => {
  it('thiếu 1 trong 2 biến môi trường → null (chưa cấu hình)', () => {
    delete process.env.AZURE_SPEECH_KEY
    process.env.AZURE_SPEECH_REGION = 'eastus'
    expect(resolveAzurePronounceConfig()).toBeNull()
  })

  it('thiếu cả 2 → null', () => {
    delete process.env.AZURE_SPEECH_KEY
    delete process.env.AZURE_SPEECH_REGION
    expect(resolveAzurePronounceConfig()).toBeNull()
  })

  it('đủ cả 2 → trả về config', () => {
    process.env.AZURE_SPEECH_KEY = 'test-key'
    process.env.AZURE_SPEECH_REGION = 'eastus'
    expect(resolveAzurePronounceConfig()).toEqual({ key: 'test-key', region: 'eastus' })
  })
})

const GOOD_AZURE_RESPONSE = {
  RecognitionStatus: 'Success',
  NBest: [
    {
      PronunciationAssessment: {
        AccuracyScore: 85,
        FluencyScore: 90,
        CompletenessScore: 100,
        PronScore: 88,
      },
      Words: [
        {
          Word: 'three',
          PronunciationAssessment: { AccuracyScore: 60, ErrorType: 'Mispronunciation' },
          Phonemes: [
            { Phoneme: 'θ', PronunciationAssessment: { AccuracyScore: 40 } },
            { Phoneme: 'r', PronunciationAssessment: { AccuracyScore: 90 } },
            { Phoneme: 'iː', PronunciationAssessment: { AccuracyScore: 95 } },
          ],
        },
        {
          Word: 'books',
          PronunciationAssessment: { AccuracyScore: 100, ErrorType: 'None' },
          Phonemes: [{ Phoneme: 's', PronunciationAssessment: { AccuracyScore: 100 } }],
        },
      ],
    },
  ],
}

describe('parseAzurePronounceResponse', () => {
  it('parse đúng response thành công đầy đủ (overall/words/phonemes)', () => {
    const result = parseAzurePronounceResponse(GOOD_AZURE_RESPONSE)
    expect(result.overall).toBe(88)
    expect(result.accuracy).toBe(85)
    expect(result.fluency).toBe(90)
    expect(result.completeness).toBe(100)
    expect(result.words).toHaveLength(2)
    expect(result.words[0]).toEqual({
      word: 'three',
      score: 60,
      errorType: 'Mispronunciation',
      phonemes: [
        { phoneme: 'θ', score: 40 },
        { phoneme: 'r', score: 90 },
        { phoneme: 'iː', score: 95 },
      ],
    })
  })

  it('RecognitionStatus="NoMatch" (im lặng/không nghe rõ) → throw thông điệp thân thiện', () => {
    expect(() => parseAzurePronounceResponse({ RecognitionStatus: 'NoMatch' })).toThrow(
      /Không nghe rõ/,
    )
  })

  it('RecognitionStatus khác Success/NoMatch → throw kèm trạng thái', () => {
    expect(() =>
      parseAzurePronounceResponse({ RecognitionStatus: 'InitialSilenceTimeout' }),
    ).toThrow(/InitialSilenceTimeout/)
  })

  it('thiếu NBest/PronunciationAssessment (200 nhưng cấu trúc hỏng) → throw', () => {
    expect(() => parseAzurePronounceResponse({ RecognitionStatus: 'Success', NBest: [] })).toThrow(
      /thiếu dữ liệu/,
    )
  })

  it('Words rỗng/thiếu → words trả về mảng rỗng, không throw', () => {
    const result = parseAzurePronounceResponse({
      RecognitionStatus: 'Success',
      NBest: [
        {
          PronunciationAssessment: {
            AccuracyScore: 50,
            FluencyScore: 50,
            CompletenessScore: 50,
            PronScore: 50,
          },
        },
      ],
    })
    expect(result.words).toEqual([])
  })

  it('Word thiếu Phonemes → phonemes trả về mảng rỗng cho từ đó', () => {
    const result = parseAzurePronounceResponse({
      RecognitionStatus: 'Success',
      NBest: [
        {
          PronunciationAssessment: {
            AccuracyScore: 50,
            FluencyScore: 50,
            CompletenessScore: 50,
            PronScore: 50,
          },
          Words: [{ Word: 'test', PronunciationAssessment: { AccuracyScore: 50 } }],
        },
      ],
    })
    expect(result.words[0]?.phonemes).toEqual([])
    expect(result.words[0]?.errorType).toBe('None')
  })

  it('score không phải number (null/undefined) → về 0, không NaN', () => {
    const result = parseAzurePronounceResponse({
      RecognitionStatus: 'Success',
      NBest: [{ PronunciationAssessment: {} }],
    })
    expect(result.overall).toBe(0)
    expect(result.accuracy).toBe(0)
  })
})

describe('assessPronunciation — gọi Azure qua fetch (mock)', () => {
  const config = { key: 'test-key', region: 'eastus' }

  it('gọi đúng URL region + header Pronunciation-Assessment, parse kết quả thành công', async () => {
    let capturedUrl = ''
    let capturedHeaders: Record<string, string> = {}
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      capturedUrl = url
      capturedHeaders = init.headers as Record<string, string>
      return new Response(JSON.stringify(GOOD_AZURE_RESPONSE), { status: 200 })
    })
    const result = await assessPronunciation(config, new ArrayBuffer(8), 'three books')
    expect(capturedUrl).toBe(
      'https://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed',
    )
    expect(capturedHeaders['Ocp-Apim-Subscription-Key']).toBe('test-key')
    expect(capturedHeaders['Content-Type']).toContain('audio/wav')
    expect(typeof capturedHeaders['Pronunciation-Assessment']).toBe('string')
    const decoded = JSON.parse(
      Buffer.from(capturedHeaders['Pronunciation-Assessment']!, 'base64').toString('utf-8'),
    ) as Record<string, unknown>
    expect(decoded).toMatchObject({
      ReferenceText: 'three books',
      PhonemeAlphabet: 'IPA',
      Granularity: 'Phoneme',
    })
    expect(result.overall).toBe(88)
  })

  it('Azure trả lỗi HTTP (vd 401 sai key) → throw kèm mã lỗi', async () => {
    vi.stubGlobal('fetch', async () => new Response('Unauthorized', { status: 401 }))
    await expect(assessPronunciation(config, new ArrayBuffer(8), 'hello')).rejects.toThrow(/401/)
  })
})
