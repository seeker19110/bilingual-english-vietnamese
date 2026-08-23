// apps/dhcb/src/lib/metacognitiveReflectionApi.ts — Client API cho Metacognitive Reflection & Socratic Journaling.
import type {
  MetacognitiveReflection,
  SocraticDailyPrompt,
  MetacognitiveSummary,
} from '@dhcb/core-contracts/metacognitiveReflection'

export async function fetchDailySocraticPrompt(
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life' = 'learning',
  contextAnchor?: string,
): Promise<SocraticDailyPrompt> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const q = new URLSearchParams({ action: 'daily_prompt', domain })
  if (contextAnchor) q.set('contextAnchor', contextAnchor)

  const res = await fetch(`/api/metacognitive-reflection?${q.toString()}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải câu hỏi phản tỉnh: ${res.status}`)
  }

  const data = await res.json()
  return data.prompt
}

export async function fetchMetacognitiveSummary(): Promise<{
  summary: MetacognitiveSummary
  reflections: MetacognitiveReflection[]
}> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/metacognitive-reflection?action=summary', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải tổng kết nhận thức: ${res.status}`)
  }

  const data = await res.json()
  return {
    summary: data.summary,
    reflections: data.reflections,
  }
}

export async function submitMetacognitiveReflectionApi(params: {
  title?: string
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  reflectionPrompt: string
  userReflection: string
}): Promise<MetacognitiveReflection> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/metacognitive-reflection?action=submit_reflection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi lưu nhật ký phản tỉnh: ${res.status}`)
  }

  const data = await res.json()
  return data.reflection
}
