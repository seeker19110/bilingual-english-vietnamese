// apps/english/src/lib/neuralCurriculumApi.ts — Client API giao tiếp Lộ trình Vi mô Thần kinh.
import { NeuralCurriculumState, MicroCurriculumModule } from '@dhcb/core-contracts/neuralCurriculum'

export async function fetchNeuralCurriculum(): Promise<NeuralCurriculumState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/neural-curriculum', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải Lộ trình Vi mô: ${res.status}`)
  }

  const data = await res.json()
  return data.state
}

export async function generateMicroModule(params: {
  topicOrKeyword: string
  targetDomain?: 'learning' | 'career' | 'work' | 'startup' | 'life'
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}): Promise<{ module: MicroCurriculumModule; state: NeuralCurriculumState }> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/neural-curriculum?action=generate_module', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi tạo bài học vi mô: ${res.status}`)
  }

  return await res.json()
}

export async function completeDrill(params: {
  isCorrect: boolean
  previousInterval?: number
}): Promise<{ masteryDelta: number; nextIntervalDays: number }> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/neural-curriculum?action=complete_drill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    throw new Error(`Lỗi ghi nhận drill: ${res.status}`)
  }

  const data = await res.json()
  return data.review
}
