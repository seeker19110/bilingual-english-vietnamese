// apps/dhcb/src/lib/workApi.test.ts
//
// Mock body của các hàm GET danh sách (list*) PHẢI khớp hình dạng THẬT của server — bọc trong
// { projects }/{ tasks }/{ meetings }/{ documents } (xem apps/server/src/api/domains/work.ts).
// Xem careerApi.test.ts để biết lý do.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listWorkProjects,
  createWorkProject,
  updateWorkProjectStatus,
  listWorkTasks,
  createWorkTask,
  updateWorkTaskStatus,
  listWorkMeetings,
  recordWorkMeeting,
  listWorkDocuments,
  createWorkDocument,
} from './workApi'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn().mockResolvedValue({ Authorization: 'Bearer mock-token' }),
}))

describe('workApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('listWorkProjects fetches projects', async () => {
    const mock = [{ id: 'p-1', name: 'Platform V2' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ projects: mock }),
    } as unknown as Response)

    const res = await listWorkProjects()
    expect(res).toEqual(mock)
  })

  it('createWorkProject posts project data', async () => {
    const mock = { id: 'p-2', name: 'Design System' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mock,
    } as unknown as Response)

    const res = await createWorkProject({ name: 'Design System' })
    expect(res).toEqual(mock)
  })

  it('updateWorkProjectStatus sends PATCH', async () => {
    const mock = { id: 'p-2', status: 'completed' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mock,
    } as unknown as Response)

    const res = await updateWorkProjectStatus('p-2', 'completed')
    expect(res).toEqual(mock)
  })

  it('listWorkTasks fetches tasks with or without projectId', async () => {
    const mock = [{ id: 't-1', title: 'Code review' }]
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mock }),
    } as unknown as Response)

    const res = await listWorkTasks('p-1')
    expect(fetchSpy).toHaveBeenCalledWith('/api/work?kind=tasks&projectId=p-1', expect.anything())
    expect(res).toEqual(mock)
  })

  it('createWorkTask and updateWorkTaskStatus work correctly', async () => {
    const mockTask = { id: 't-2', title: 'Write tests', priority: 'high', status: 'todo' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockTask,
    } as unknown as Response)

    const created = await createWorkTask({ title: 'Write tests', priority: 'high' })
    expect(created).toEqual(mockTask)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTask, status: 'done' }),
    } as unknown as Response)

    const updated = await updateWorkTaskStatus('t-2', 'done')
    expect(updated.status).toBe('done')
  })

  it('meeting and document API calls succeed', async () => {
    const mockMeetings = [{ id: 'm-1', title: 'Sync' }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ meetings: mockMeetings }),
    } as unknown as Response)

    const meetings = await listWorkMeetings()
    expect(meetings).toEqual(mockMeetings)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'm-2', title: 'Sprint Retrospective' }),
    } as unknown as Response)

    const recorded = await recordWorkMeeting({
      title: 'Sprint Retrospective',
      scheduledAt: '2026-08-17T10:00:00Z',
      durationMinutes: 45,
    })
    expect(recorded.title).toBe('Sprint Retrospective')

    const mockDoc = { id: 'd-1', title: 'Spec', documentType: 'spec', summary: 'Summary' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockDoc,
    } as unknown as Response)

    const doc = await createWorkDocument({
      title: 'Spec',
      documentType: 'spec',
      summary: 'Summary',
    })
    expect(doc).toEqual(mockDoc)

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [mockDoc] }),
    } as unknown as Response)

    const docs = await listWorkDocuments('p-1')
    expect(docs).toEqual([mockDoc])
  })
})
