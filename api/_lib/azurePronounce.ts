// api/_lib/azurePronounce.ts — Chấm phát âm CHI TIẾT (từng âm vị) qua Azure AI Speech
// Pronunciation Assessment (① Giai đoạn 2, docs/research/dac-ta-nang-cap-su-pham-2026-07-15.md).
//
// CHỈ chạy ở server — cần AZURE_SPEECH_KEY (KHÔNG được lộ ra client). Region đọc từ
// AZURE_SPEECH_REGION (vd "eastus" — xem danh sách vùng hỗ trợ trong Azure Portal).
//
// Azure CHƯA hỗ trợ Pronunciation Assessment cho vi-VN (chỉ en-US ở bản này) — chiều B
// (người nước ngoài học tiếng Việt) tiếp tục dùng "Giai đoạn 1" (bảng trap client, xem
// src/lib/pronounceCoach.ts), KHÔNG gọi module này.
//
// Endpoint dùng REST "recognition/conversation" (KHÔNG dùng SDK — nhẹ hơn, không cần cài
// gói native) — xem https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment.
// Audio input PHẢI là WAV PCM 16kHz mono (client tự convert trước khi gửi — xem đặc tả
// mục ①, "chuyển sang WAV PCM 16kHz mono ở client"). Câu tối đa ~30s theo giới hạn Azure.
//
// PhonemeAlphabet chọn 'IPA' (không phải mặc định 'SAPI') để khớp ký hiệu IPA đã dùng sẵn
// trong src/data/pronunciationTraps.ts (vd /θ/, /ð/, /ʃ/) — client PR sau map thẳng phoneme
// trả về vào bảng trap mà không cần thêm 1 bảng chuyển đổi SAPI→IPA.

import { fetchWithTimeout } from './fetchTimeout'
import { bytesToBase64 } from './base64'

const AZURE_TIMEOUT_MS = 20_000

export interface AzurePronounceConfig {
  key: string
  region: string
}

export function resolveAzurePronounceConfig(): AzurePronounceConfig | null {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) return null
  return { key, region }
}

// ── Kiểu dữ liệu rút gọn trả về cho client (đã lọc bớt field Azure không cần) ──────────
export interface PhonemeScore {
  phoneme: string
  score: number
}
export interface WordAssessment {
  word: string
  score: number
  errorType: string // 'None' | 'Omission' | 'Insertion' | 'Mispronunciation' | ...
  phonemes: PhonemeScore[]
}
export interface PronounceAssessmentResult {
  overall: number
  accuracy: number
  fluency: number
  completeness: number
  words: WordAssessment[]
}

// ── Kiểu dữ liệu THÔ Azure trả về (chỉ khai những field ta dùng) ───────────────────────
interface AzurePhonemeRaw {
  Phoneme?: unknown
  PronunciationAssessment?: { AccuracyScore?: unknown }
}
interface AzureWordRaw {
  Word?: unknown
  PronunciationAssessment?: { AccuracyScore?: unknown; ErrorType?: unknown }
  Phonemes?: unknown
}
interface AzureNBestRaw {
  PronunciationAssessment?: {
    AccuracyScore?: unknown
    FluencyScore?: unknown
    CompletenessScore?: unknown
    PronScore?: unknown
  }
  Words?: unknown
}
interface AzureResponseRaw {
  RecognitionStatus?: unknown
  NBest?: unknown
}

function numOr0(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

// Hàm THUẦN — parse JSON Azure trả về thành shape rút gọn. Tách riêng khỏi lời gọi mạng
// để test được bằng fixture, không cần key/region thật.
export function parseAzurePronounceResponse(raw: unknown): PronounceAssessmentResult {
  const data = raw as AzureResponseRaw
  if (data.RecognitionStatus !== 'Success') {
    const status = typeof data.RecognitionStatus === 'string' ? data.RecognitionStatus : 'Unknown'
    throw new Error(
      status === 'NoMatch'
        ? 'Không nghe rõ giọng nói — thử nói to và rõ hơn.'
        : `Azure không nhận diện được (${status})`,
    )
  }
  const nbest = Array.isArray(data.NBest) ? (data.NBest[0] as AzureNBestRaw | undefined) : undefined
  if (!nbest?.PronunciationAssessment) {
    throw new Error('Azure trả về thiếu dữ liệu chấm phát âm')
  }

  const words: WordAssessment[] = Array.isArray(nbest.Words)
    ? (nbest.Words as AzureWordRaw[]).map((w) => ({
        word: typeof w.Word === 'string' ? w.Word : '',
        score: numOr0(w.PronunciationAssessment?.AccuracyScore),
        errorType:
          typeof w.PronunciationAssessment?.ErrorType === 'string'
            ? w.PronunciationAssessment.ErrorType
            : 'None',
        phonemes: Array.isArray(w.Phonemes)
          ? (w.Phonemes as AzurePhonemeRaw[]).map((p) => ({
              phoneme: typeof p.Phoneme === 'string' ? p.Phoneme : '',
              score: numOr0(p.PronunciationAssessment?.AccuracyScore),
            }))
          : [],
      }))
    : []

  return {
    overall: numOr0(nbest.PronunciationAssessment.PronScore),
    accuracy: numOr0(nbest.PronunciationAssessment.AccuracyScore),
    fluency: numOr0(nbest.PronunciationAssessment.FluencyScore),
    completeness: numOr0(nbest.PronunciationAssessment.CompletenessScore),
    words,
  }
}

// Base64 JSON cho header "Pronunciation-Assessment" (xem tài liệu Azure — KHÔNG dùng
// SDK nên phải tự dựng header này bằng tay).
function buildAssessmentHeader(referenceText: string): string {
  const params = {
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
    PhonemeAlphabet: 'IPA',
  }
  return bytesToBase64(new TextEncoder().encode(JSON.stringify(params)))
}

// Gọi Azure Pronunciation Assessment. `audio` PHẢI là WAV PCM 16kHz mono (client convert
// trước — xem src/lib/wav.ts ở PR client). Câu tối đa ~30s (giới hạn Azure short-audio).
export async function assessPronunciation(
  config: AzurePronounceConfig,
  audio: ArrayBuffer,
  referenceText: string,
): Promise<PronounceAssessmentResult> {
  const url = `https://${config.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`

  const resp = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.key,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        Accept: 'application/json',
        'Pronunciation-Assessment': buildAssessmentHeader(referenceText),
      },
      body: audio,
    },
    AZURE_TIMEOUT_MS,
  )

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    throw new Error(`Azure Speech lỗi (${resp.status}): ${detail.slice(0, 200)}`)
  }

  const json = (await resp.json()) as unknown
  return parseAzurePronounceResponse(json)
}
