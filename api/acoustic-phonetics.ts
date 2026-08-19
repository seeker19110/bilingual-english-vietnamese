// api/acoustic-phonetics.ts — API Endpoint phân tích âm học và tính điểm GOP V4.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import { analyzeAcousticPhonetics } from '../packages/core-ai/acousticPhoneticsService.js'
import { z } from 'zod'

const AcousticRequestSchema = z.object({
  targetSentence: z.string().min(1).max(1000),
  spokenTranscript: z.string().max(1000).optional(),
  sessionId: z.string().uuid().optional(),
  pcmAudioLengthMs: z.number().int().positive().optional(),
})

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await req.json()
    const parsed = AcousticRequestSchema.parse(body)

    const report = analyzeAcousticPhonetics({
      personId: auth.userId,
      sessionId: parsed.sessionId,
      targetSentence: parsed.targetSentence,
      spokenTranscript: parsed.spokenTranscript,
      pcmAudioLengthMs: parsed.pcmAudioLengthMs,
    })

    return jsonResponse(report, 200)
  } catch (err) {
    return jsonResponse({ error: 'Invalid acoustic analysis payload', details: String(err) }, 400)
  }
}
