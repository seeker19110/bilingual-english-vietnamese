// api/metacognitive-reflection.ts — REST handler cho Metacognitive Reflection & Socratic Journaling.
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import { MetacognitiveReflectionService } from '@dhcb/core-personal/metacognitiveReflectionService'
import { MetacognitiveReflection } from '@dhcb/core-contracts/metacognitiveReflection'

const userReflectionsMap = new Map<string, MetacognitiveReflection[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      {
        error: 'Unauthorized',
        message: 'Yêu cầu đăng nhập để truy cập Nhật ký Phản tỉnh Nhận thức.',
      },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    if (action === 'daily_prompt') {
      const rawDomain = url.searchParams.get('domain')
      const domain = (
        rawDomain === 'career' ||
        rawDomain === 'work' ||
        rawDomain === 'startup' ||
        rawDomain === 'life'
          ? rawDomain
          : 'learning'
      ) as MetacognitiveReflection['domain']
      const contextAnchor = url.searchParams.get('contextAnchor') || undefined
      const prompt = MetacognitiveReflectionService.generateDailySocraticPrompt(
        domain,
        contextAnchor,
      )
      return jsonResponse({ success: true, prompt }, 200)
    }

    if (action === 'summary') {
      const list = userReflectionsMap.get(personId) || []
      const summary = MetacognitiveReflectionService.summarizeReflections(list)
      return jsonResponse({ success: true, summary, reflections: list }, 200)
    }

    const list = userReflectionsMap.get(personId) || []
    return jsonResponse({ success: true, reflections: list }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'submit_reflection') {
        const { title, domain, reflectionPrompt, userReflection } = body
        if (!reflectionPrompt || !userReflection) {
          return jsonResponse({ error: 'Missing required reflection fields' }, 400)
        }

        const analysis = MetacognitiveReflectionService.analyzeReflection(personId, {
          title,
          domain: domain || 'learning',
          reflectionPrompt,
          userReflection,
        })

        const currentList = userReflectionsMap.get(personId) || []
        currentList.unshift(analysis)
        userReflectionsMap.set(personId, currentList)

        return jsonResponse({ success: true, reflection: analysis }, 200)
      }

      return jsonResponse({ error: 'Unknown action' }, 400)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonResponse({ error: 'Failed to process request', details: msg }, 500)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
