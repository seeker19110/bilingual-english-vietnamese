// api/acoustic-phonetics.ts — API Endpoint phân tích âm học và tính điểm GOP V4.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import { analyzeAcousticPhonetics } from '@dhcb/core-ai/acousticPhoneticsService'
import { z } from 'zod'

const AcousticRequestSchema = z.object({
  targetSentence: z.string().min(1).max(1000),
  spokenTranscript: z.string().max(1000).optional(),
  sessionId: z.string().uuid().optional(),
  pcmAudioLengthMs: z.number().int().positive().optional(),
})

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
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
