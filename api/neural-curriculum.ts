// api/neural-curriculum.ts — REST handler cho Lộ trình Vi mô Thần kinh & Collocations V4.3.
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import {
  NeuralCurriculumState,
  NeuralCurriculumStateSchema,
  NEURAL_CURRICULUM_VERSION,
} from '../packages/core-contracts/neuralCurriculum.js'
import { NeuralCurriculumService } from '../packages/core-ai/neuralCurriculumService.js'

const inMemoryCurriculumMap = new Map<string, NeuralCurriculumState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để truy cập Lộ trình Vi mô Thần kinh.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const existing =
      inMemoryCurriculumMap.get(personId) || NeuralCurriculumService.createDefaultState(personId)
    inMemoryCurriculumMap.set(personId, existing)

    return jsonResponse(
      {
        success: true,
        state: existing,
      },
      200,
    )
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'generate_module') {
        const topic = String(body.topicOrKeyword || 'Giao Tiếp & Đàm Thoại').slice(0, 100)
        const targetDomain = body.targetDomain || 'learning'
        const cefrLevel = body.cefrLevel || 'B2'
        const moduleId = `20000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`

        const newModule = NeuralCurriculumService.generateMicroCurriculumModule({
          moduleId,
          targetDomain,
          topicOrKeyword: topic,
          cefrLevel,
        })

        const current =
          inMemoryCurriculumMap.get(personId) ||
          NeuralCurriculumService.createDefaultState(personId)
        const updatedState: NeuralCurriculumState = {
          ...current,
          activeModuleId: newModule.moduleId,
          modules: [newModule, ...current.modules.filter((m) => m.moduleId !== newModule.moduleId)],
          updatedAt: new Date().toISOString(),
        }

        inMemoryCurriculumMap.set(personId, updatedState)
        return jsonResponse({ success: true, module: newModule, state: updatedState }, 200)
      }

      if (action === 'complete_drill') {
        const isCorrect = Boolean(body.isCorrect)
        const previousInterval = Number(body.previousInterval || 1)
        const review = NeuralCurriculumService.computeNextSpacedReview(previousInterval, isCorrect)

        const current =
          inMemoryCurriculumMap.get(personId) ||
          NeuralCurriculumService.createDefaultState(personId)
        const newScore = Math.max(0, Math.min(100, current.masteryScore + review.masteryDelta))
        const updatedState: NeuralCurriculumState = {
          ...current,
          masteryScore: newScore,
          updatedAt: new Date().toISOString(),
        }

        inMemoryCurriculumMap.set(personId, updatedState)
        return jsonResponse({ success: true, review, state: updatedState }, 200)
      }

      const parseResult = NeuralCurriculumStateSchema.safeParse({
        ...body,
        personId,
        schemaVersion: NEURAL_CURRICULUM_VERSION,
      })

      if (!parseResult.success) {
        return jsonResponse({ error: 'invalid_request', details: parseResult.error.format() }, 400)
      }

      inMemoryCurriculumMap.set(personId, parseResult.data)
      return jsonResponse({ success: true, state: parseResult.data }, 200)
    } catch (err) {
      return jsonResponse({ error: 'Invalid payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
