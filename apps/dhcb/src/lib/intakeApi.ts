// src/lib/intakeApi.ts — Gọi /api/intake (luồng người mới 5 câu).
import { getAuthHeader } from '@core/authHeader'
import type { AgeGroup } from '../types'

export type Focus = 'hoc_thi' | 'cong_viec' | 'suc_khoe' | 'tien_bac' | 'quan_he' | 'chua_ro'
export type LearningMomentum = 'tuan_nay' | 'vai_thang' | 'lau_roi' | 'khong_nho'

export interface IntakeAnswers {
  focus?: Focus
  extraHour?: string
  flowActivity?: string
  lastLearned?: LearningMomentum
}

export interface Suggestion {
  id: string
  title: string
  why: string
}

export interface IntakeResult {
  primary: Suggestion
  alternatives: Suggestion[]
}

type Res<T> = { ok: true; data: T } | { ok: false; error: string }

async function call<T>(init?: RequestInit): Promise<Res<T>> {
  try {
    const res = await fetch('/api/intake', {
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      ...init,
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) return { ok: false, error: data.error ?? `Lỗi ${res.status}` }
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Lỗi kết nối, thử lại sau' }
  }
}

export const fetchIntake = () =>
  call<{
    done: boolean
    chosenTaskId: string | null
    taskDone: boolean
    result: IntakeResult | null
  }>()

export const saveIntake = (answers: IntakeAnswers, ageGroup?: AgeGroup) =>
  call<{ result: IntakeResult }>({
    method: 'POST',
    body: JSON.stringify({ answers, ageGroup }),
  })

export const chooseTask = (taskId: string) =>
  call<{ ok: true }>({ method: 'POST', body: JSON.stringify({ action: 'choose', taskId }) })

/** Người dùng tự đánh dấu đã làm xong việc đầu tiên — tín hiệu quan trọng nhất của cả luồng. */
export const markTaskDone = () =>
  call<{ ok: true }>({ method: 'POST', body: JSON.stringify({ action: 'done' }) })
