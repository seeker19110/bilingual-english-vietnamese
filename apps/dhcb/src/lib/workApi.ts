// apps/dhcb/src/lib/workApi.ts — Client API wrapper for Work Domain (V2-15)
import { getAuthHeader } from '@core/authHeader'
import type { WorkProject, WorkTask, WorkMeeting, WorkDocument } from '@dhcb/core-contracts/work'

export interface CreateWorkProjectParams {
  name: string
  description?: string
  deadline?: string
}

export interface CreateWorkTaskParams {
  projectId?: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueAt?: string
}

export interface RecordWorkMeetingParams {
  title: string
  scheduledAt: string
  durationMinutes?: number
  summary?: string
  actionItems?: string[]
}

export interface CreateWorkDocumentParams {
  projectId?: string
  title: string
  documentType: 'spec' | 'minutes' | 'proposal' | 'report' | 'note'
  summary: string
  contentUri?: string
}

export async function listWorkProjects(): Promise<WorkProject[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work?kind=projects', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createWorkProject(params: CreateWorkProjectParams): Promise<WorkProject> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'project', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateWorkProjectStatus(
  id: string,
  status: 'active' | 'completed' | 'archived',
): Promise<WorkProject> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'project_status', id, status }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listWorkTasks(projectId?: string): Promise<WorkTask[]> {
  const headers = await getAuthHeader()
  const url = projectId
    ? `/api/work?kind=tasks&projectId=${encodeURIComponent(projectId)}`
    : '/api/work?kind=tasks'
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createWorkTask(params: CreateWorkTaskParams): Promise<WorkTask> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'task', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function updateWorkTaskStatus(
  id: string,
  status: 'todo' | 'in_progress' | 'blocked' | 'done',
): Promise<WorkTask> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'task_status', id, status }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listWorkMeetings(): Promise<WorkMeeting[]> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work?kind=meetings', { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function recordWorkMeeting(params: RecordWorkMeetingParams): Promise<WorkMeeting> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'meeting', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function listWorkDocuments(projectId?: string): Promise<WorkDocument[]> {
  const headers = await getAuthHeader()
  const url = projectId
    ? `/api/work?kind=documents&projectId=${encodeURIComponent(projectId)}`
    : '/api/work?kind=documents'
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}

export async function createWorkDocument(params: CreateWorkDocumentParams): Promise<WorkDocument> {
  const headers = await getAuthHeader()
  const res = await fetch('/api/work', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'document', ...params }),
  })
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errorBody.error || `HTTP error ${res.status}`)
  }
  return res.json()
}
