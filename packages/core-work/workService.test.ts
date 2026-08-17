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

// Nhánh biên: tham số optional KHÔNG truyền, cột NULL, lỗi not-found, parse JSON hỏng.
describe('WorkService — nhánh biên', () => {
  it('tạo project không có description/deadline → gửi null xuống DB và bỏ field khỏi kết quả', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROJECT_ID,
          person_id: PERSON_ID,
          name: 'Dự án tối giản',
          description: null,
          status: 'active',
          deadline: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const project = await createWorkProject(pool, PERSON_ID, { name: 'Dự án tối giản' })
    expect(project.description).toBeUndefined()
    expect(project.deadline).toBeUndefined()
    expect(mockQuery.mock.calls[0]![1]).toEqual([
      expect.any(String),
      PERSON_ID,
      'Dự án tối giản',
      null,
      null,
    ])
  })

  it('lọc project theo status → thêm mệnh đề and status = $2', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const list = await listWorkProjects(pool, PERSON_ID, 'archived')
    expect(list).toEqual([])
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).toContain('and status = $2')
    expect(params).toEqual([PERSON_ID, 'archived'])
  })

  it('updateWorkProject ném NotFoundError khi project không thuộc person', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(
      updateWorkProject(pool, PERSON_ID, PROJECT_ID, { status: 'completed' }),
    ).rejects.toThrow('Không tìm thấy WorkProject')
    // Chỉ chạy câu select, không chạy câu update.
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('updateWorkProject không truyền field nào → tất cả tham số update là null (coalesce giữ nguyên)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: PROJECT_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: PROJECT_ID,
          person_id: PERSON_ID,
          name: 'Giữ nguyên',
          description: null,
          status: 'active',
          deadline: null,
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const updated = await updateWorkProject(pool, PERSON_ID, PROJECT_ID, {})
    expect(updated.version).toBe(2)
    expect(mockQuery.mock.calls[1]![1]).toEqual([null, null, null, null, PROJECT_ID, PERSON_ID])
  })

  it('tạo task không có projectId/dueAt', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: TASK_ID,
          person_id: PERSON_ID,
          project_id: null,
          title: 'Việc lẻ',
          priority: 'low',
          status: 'todo',
          due_at: null,
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const task = await createWorkTask(pool, PERSON_ID, { title: 'Việc lẻ', priority: 'low' })
    expect(task.projectId).toBeUndefined()
    expect(task.dueAt).toBeUndefined()
  })

  it('listWorkTasks không lọc gì → chỉ where person_id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await listWorkTasks(pool, PERSON_ID)
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).not.toContain('and status')
    expect(sql).not.toContain('and project_id')
    expect(params).toEqual([PERSON_ID])
  })

  it('listWorkTasks chỉ lọc projectId → placeholder lùi về $2', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await listWorkTasks(pool, PERSON_ID, undefined, PROJECT_ID)
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).toContain('and project_id = $2')
    expect(params).toEqual([PERSON_ID, PROJECT_ID])
  })

  it('updateWorkTask ném NotFoundError khi task không tồn tại', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    await expect(updateWorkTask(pool, PERSON_ID, TASK_ID, { status: 'done' })).rejects.toThrow(
      'Không tìm thấy WorkTask',
    )
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  it('updateWorkTask không truyền field nào → toàn null', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: TASK_ID }] })
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: TASK_ID,
          person_id: PERSON_ID,
          project_id: null,
          title: 'Việc lẻ',
          priority: 'low',
          status: 'todo',
          due_at: null,
          version: 2,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    await updateWorkTask(pool, PERSON_ID, TASK_ID, {})
    expect(mockQuery.mock.calls[1]![1]).toEqual([null, null, null, null, TASK_ID, PERSON_ID])
  })

  it('recordWorkMeeting mặc định 30 phút, không summary, actionItems rỗng', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Họp nhanh',
          scheduled_at: new Date('2026-08-18T10:00:00Z'),
          duration_minutes: 30,
          summary: null,
          action_items: null,
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const meeting = await recordWorkMeeting(pool, PERSON_ID, {
      title: 'Họp nhanh',
      scheduledAt: '2026-08-18T10:00:00Z',
    })
    expect(meeting.summary).toBeUndefined()
    expect(meeting.actionItems).toEqual([])
    const params = mockQuery.mock.calls[0]![1] as unknown[]
    expect(params[4]).toBe(30)
    expect(params[5]).toBeNull()
    expect(params[6]).toBe('[]')
  })

  it('action_items dạng chuỗi JSON hợp lệ được parse thành mảng', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Họp nhanh',
          scheduled_at: new Date('2026-08-18T10:00:00Z'),
          duration_minutes: 15,
          summary: 'Tóm tắt',
          action_items: '["Gửi báo cáo"]',
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listWorkMeetings(pool, PERSON_ID)
    expect(list[0]!.actionItems).toEqual(['Gửi báo cáo'])
  })

  it('action_items dạng chuỗi JSON hỏng hoặc không phải mảng → trả mảng rỗng', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Họp A',
          scheduled_at: new Date('2026-08-18T10:00:00Z'),
          duration_minutes: 15,
          summary: null,
          action_items: 'không-phải-json',
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
        {
          id: MEETING_ID,
          person_id: PERSON_ID,
          title: 'Họp B',
          scheduled_at: new Date('2026-08-18T11:00:00Z'),
          duration_minutes: 15,
          summary: null,
          action_items: '{"a":1}',
          created_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const list = await listWorkMeetings(pool, PERSON_ID)
    expect(list[0]!.actionItems).toEqual([])
    expect(list[1]!.actionItems).toEqual([])
  })

  it('tạo document không có projectId nhưng có contentUri', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: DOC_ID,
          person_id: PERSON_ID,
          project_id: null,
          title: 'Ghi chú rời',
          document_type: 'note',
          summary: 'Ghi chú không thuộc dự án',
          content_uri: 'https://example.com/note',
          version: 1,
          created_at: new Date('2026-08-17T00:00:00Z'),
          updated_at: new Date('2026-08-17T00:00:00Z'),
        },
      ],
    })

    const doc = await createWorkDocument(pool, PERSON_ID, {
      title: 'Ghi chú rời',
      documentType: 'note',
      summary: 'Ghi chú không thuộc dự án',
      contentUri: 'https://example.com/note',
    })
    expect(doc.projectId).toBeUndefined()
    expect(doc.contentUri).toBe('https://example.com/note')
  })

  it('listWorkDocuments không lọc projectId → chỉ where person_id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const docs = await listWorkDocuments(pool, PERSON_ID)
    expect(docs).toEqual([])
    const [sql, params] = mockQuery.mock.calls[0]! as [string, unknown[]]
    expect(sql).not.toContain('and project_id')
    expect(params).toEqual([PERSON_ID])
  })
})
