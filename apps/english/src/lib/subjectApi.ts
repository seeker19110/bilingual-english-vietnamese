// apps/english/src/lib/subjectApi.ts — Client API for Multi-Subject Learning (V2-12)
import { getAuthHeader } from '@core/authHeader'
import type { SubjectManifest } from '@dhcb/core-contracts/subjectManifest'

const API_BASE = '/api/subjects'

export async function listSubjects(
  category?: 'language' | 'stem' | 'humanities',
): Promise<SubjectManifest[]> {
  const url = category ? `${API_BASE}?category=${encodeURIComponent(category)}` : API_BASE
  const res = await fetch(url, {
    headers: getAuthHeader(),
  })
  if (!res.ok) {
    throw new Error(`Failed to list subjects: ${res.statusText}`)
  }
  const data = (await res.json()) as { subjects: SubjectManifest[] }
  return data.subjects
}

export async function getSubjectDetails(subjectId: string): Promise<SubjectManifest> {
  const res = await fetch(`${API_BASE}?id=${encodeURIComponent(subjectId)}`, {
    headers: getAuthHeader(),
  })
  if (!res.ok) {
    throw new Error(`Failed to get subject details: ${res.statusText}`)
  }
  const data = (await res.json()) as { subject: SubjectManifest }
  return data.subject
}
