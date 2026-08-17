import { describe, expect, it } from 'vitest'
import {
  WorkProjectSchema,
  WorkTaskSchema,
  WorkMeetingSchema,
  WorkDocumentSchema,
  WORK_SCHEMA_VERSION,
} from './work.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

describe('Work Domain Contracts', () => {
  it('validates WorkProject', () => {
    const project = {
      id: ID_1,
      personId: PERSON_ID,
      name: 'Mobile App Redesign',
      description: 'Cải tiến UX/UI và hiệu năng cho ứng dụng mobile',
      status: 'active',
      deadline: '2026-12-31T00:00:00Z',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: WORK_SCHEMA_VERSION,
    }

    const parsed = WorkProjectSchema.parse(project)
    expect(parsed.name).toBe('Mobile App Redesign')
    expect(parsed.status).toBe('active')
  })

  it('validates WorkTask', () => {
    const task = {
      id: ID_1,
      personId: PERSON_ID,
      projectId: ID_1,
      title: 'Review Pull Request #589',
      priority: 'high',
      status: 'in_progress',
      dueAt: '2026-08-18T12:00:00Z',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: WORK_SCHEMA_VERSION,
    }

    const parsed = WorkTaskSchema.parse(task)
    expect(parsed.title).toBe('Review Pull Request #589')
    expect(parsed.priority).toBe('high')
  })

  it('validates WorkMeeting', () => {
    const meeting = {
      id: ID_1,
      personId: PERSON_ID,
      title: 'Sprint Planning',
      scheduledAt: '2026-08-18T09:00:00Z',
      durationMinutes: 45,
      summary: 'Thống nhất roadmap Sprint 24',
      actionItems: ['Tạo ticket Jira', 'Cập nhật spec'],
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: WORK_SCHEMA_VERSION,
    }

    const parsed = WorkMeetingSchema.parse(meeting)
    expect(parsed.durationMinutes).toBe(45)
    expect(parsed.actionItems.length).toBe(2)
  })

  it('validates WorkDocument', () => {
    const doc = {
      id: ID_1,
      personId: PERSON_ID,
      title: 'Architecture Spec V2',
      documentType: 'spec',
      summary: 'Thiết kế chi tiết hệ thống Personal OS',
      contentUri: 's3://docs/architecture-v2.md',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: WORK_SCHEMA_VERSION,
    }

    const parsed = WorkDocumentSchema.parse(doc)
    expect(parsed.documentType).toBe('spec')
  })
})
