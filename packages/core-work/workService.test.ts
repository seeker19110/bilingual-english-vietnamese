import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  createWorkProject,
  listWorkProjects,
  updateWorkProject,
  createWorkTask,
  listWorkTasks,
  updateWorkTask,
  recordWorkMeeting,
  listWorkMeetings,
  createWorkDocument,
  listWorkDocuments,
} from './workService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const PROJECT_ID = '22222222-2222-4222-8222-222222222222'
const TASK_ID = '33333333-3333-4333-8333-333333333333'
const MEETING_ID = '44444444-4444-4444-8444-444444444444'
const DOC_ID = '55555555-5555-4555-8555-555555555555'

const mockQuery = vi.fn()
const pool = { query: mockQuery } as unknown as Pool

vi.mock('../core-db/transaction.js', () => ({
  withTransaction: async (_pool: unknown, cb: (client: { query: typeof mockQuery }) => unknown) =>
    cb({ query: mockQuery }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('WorkService', () => {
  it('creates and lists projects', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROJECT_ID,
          person_id: PERSON_ID,
          name: 'Core Architecture V2',
          description: 'Refactoring core modules',
          status: 'active',
          deadline: new Date('2026-12-31T00:00:00Z'),
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const project = await createWorkProject(pool, PERSON_ID, {
      name: 'Core Architecture V2',
      description: 'Refactoring core modules',
      deadline: '2026-12-31T00:00:00Z',
    })
    expect(project.name).toBe('Core Architecture V2')
    expect(project.status).toBe('active')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROJECT_ID,
          person_id: PERSON_ID,
          name: 'Core Architecture V2',
          description: 'Refactoring core modules',
          status: 'active',
          deadline: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listWorkProjects(pool, PERSON_ID)
    expect(list.length).toBe(1)
  })

  it('updates project', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROJECT_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROJECT_ID,
          person_id: PERSON_ID,
          name: 'Core Architecture V2 Updated',
          description: 'Done',
          status: 'completed',
          deadline: null,
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const updated = await updateWorkProject(pool, PERSON_ID, PROJECT_ID, {
      status: 'completed',
      name: 'Core Architecture V2 Updated',
    })
    expect(updated.status).toBe('completed')
    expect(updated.version).toBe(2)
  })

  it('creates and lists tasks', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: TASK_ID,
          person_id: PERSON_ID,
          project_id: PROJECT_ID,
          title: 'Implement V2-15 Work Domain',
          priority: 'urgent',
          status: 'todo',
          due_at: new Date('2026-08-18T00:00:00Z'),
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const task = await createWorkTask(pool, PERSON_ID, {
      projectId: PROJECT_ID,
      title: 'Implement V2-15 Work Domain',
      priority: 'urgent',
      dueAt: '2026-08-18T00:00:00Z',
    })
    expect(task.title).toBe('Implement V2-15 Work Domain')
    expect(task.priority).toBe('urgent')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: TASK_ID,
          person_id: PERSON_ID,
          project_id: PROJECT_ID,
          title: 'Implement V2-15 Work Domain',
          priority: 'urgent',
          status: 'todo',
          due_at: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const tasks = await listWorkTasks(pool, PERSON_ID, 'todo', PROJECT_ID)
    expect(tasks.length).toBe(1)
  })

  it('updates task', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: TASK_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: TASK_ID,
          person_id: PERSON_ID,
          project_id: PROJECT_ID,
          title: 'Implement V2-15 Work Domain',
          priority: 'urgent',
          status: 'done',
          due_at: null,
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const updated = await updateWorkTask(pool, PERSON_ID, TASK_ID, { status: 'done' })
    expect(updated.status).toBe('done')
    expect(updated.version).toBe(2)
  })

  it('records and lists meetings', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Engineering Sync',
          scheduled_at: new Date('2026-08-18T10:00:00Z'),
          duration_minutes: 30,
          summary: 'Review roadmap',
          action_items: ['Deploy PR #589'],
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const meeting = await recordWorkMeeting(pool, PERSON_ID, {
      title: 'Engineering Sync',
      scheduledAt: '2026-08-18T10:00:00Z',
      durationMinutes: 30,
      summary: 'Review roadmap',
      actionItems: ['Deploy PR #589'],
    })
    expect(meeting.title).toBe('Engineering Sync')
    expect(meeting.actionItems).toContain('Deploy PR #589')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Engineering Sync',
          scheduled_at: new Date('2026-08-18T10:00:00Z'),
          duration_minutes: 30,
          summary: 'Review roadmap',
          action_items: ['Deploy PR #589'],
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listWorkMeetings(pool, PERSON_ID)
    expect(list.length).toBe(1)
  })

  it('creates and lists documents', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: DOC_ID,
          person_id: PERSON_ID,
          project_id: PROJECT_ID,
          title: 'V2-15 Spec',
          document_type: 'spec',
          summary: 'Work domain architecture spec',
          content_uri: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const doc = await createWorkDocument(pool, PERSON_ID, {
      projectId: PROJECT_ID,
      title: 'V2-15 Spec',
      documentType: 'spec',
      summary: 'Work domain architecture spec',
    })
    expect(doc.title).toBe('V2-15 Spec')
    expect(doc.documentType).toBe('spec')

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: DOC_ID,
          person_id: PERSON_ID,
          project_id: PROJECT_ID,
          title: 'V2-15 Spec',
          document_type: 'spec',
          summary: 'Work domain architecture spec',
          content_uri: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const docs = await listWorkDocuments(pool, PERSON_ID, PROJECT_ID)
    expect(docs.length).toBe(1)
  })
})
