// apps/english/src/lib/actionCanvasApi.ts — Client API giao tiếp Action Canvas V4.2.
import { ActionCanvasState } from '../../../../packages/core-contracts/actionCanvas.js'

export async function fetchActionCanvas(): Promise<ActionCanvasState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/action-canvas', {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  if (!res.ok) {
    throw new Error(`Lỗi tải Action Canvas: ${res.status}`)
  }

  const data = await res.json()
  return data.canvas
}

export async function saveActionCanvas(canvas: ActionCanvasState): Promise<ActionCanvasState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/action-canvas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(canvas),
  })

  if (!res.ok) {
    throw new Error(`Lỗi lưu Action Canvas: ${res.status}`)
  }

  const data = await res.json()
  return data.canvas
}

export async function synthesizeGoalCanvas(goalPrompt: string): Promise<ActionCanvasState> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/action-canvas?action=synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ goalPrompt }),
  })

  if (!res.ok) {
    throw new Error(`Lỗi phân rã mục tiêu: ${res.status}`)
  }

  const data = await res.json()
  return data.canvas
}

export async function exportCanvasMarkdown(): Promise<{ markdown: string; title: string }> {
  const token = localStorage.getItem('gsa_session_token_v1')
  const res = await fetch('/api/action-canvas?action=export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    throw new Error(`Lỗi xuất Markdown: ${res.status}`)
  }

  return await res.json()
}
