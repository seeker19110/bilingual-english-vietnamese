import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true

vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('@dhcb/core-personal/personService', () => ({
  getOrCreatePerson: (...a: unknown[]) => getOrCreatePerson(...a),
}))

const workService = vi.hoisted(() => ({
  createWorkProject: vi.fn(),
  listWorkProjects: vi.fn(),
  updateWorkProject: vi.fn(),
  createWorkTask: vi.fn(),
  listWorkTasks: vi.fn(),
  updateWorkTask: vi.fn(),
  recordWorkMeeting: vi.fn(),
  listWorkMeetings: vi.fn(),
  createWorkDocument: vi.fn(),
  listWorkDocuments: vi.fn(),
}))

vi.mock('@dhcb/core-domains/workService', () => ({
  ...workService,
}))

import handler from './work.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

function req(method: string, query = '', body?: unknown) {
  return new Request(`http://localhost/api/work${query}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePerson.mockResolvedValue({ id: PERSON_ID })
})

describe('api/work', () => {
  it('handles OPTIONS', async () => {
    const res = await handler(new Request('http://localhost/api/work', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('401 khi chưa đăng nhập', async () => {
    authState.user = null
    const res = await handler(req('GET'))
    expect(res.status).toBe(401)
  })

  it('429 khi vượt rate limit', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('GET ?kind=projects trả danh sách dự án', async () => {
    workService.listWorkProjects.mockResolvedValueOnce([{ id: ID_1, name: 'Project A' }])
    const res = await handler(req('GET', '?kind=projects'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.projects.length).toBe(1)
  })

  it('GET ?kind=tasks trả danh sách công việc', async () => {
    workService.listWorkTasks.mockResolvedValueOnce([{ id: ID_1, title: 'Task A' }])
    const res = await handler(req('GET', '?kind=tasks&status=todo&projectId=' + ID_1))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.tasks.length).toBe(1)
  })

  it('GET ?kind=meetings and ?kind=documents', async () => {
    workService.listWorkMeetings.mockResolvedValueOnce([{ id: ID_1, title: 'Sync' }])
    const resM = await handler(req('GET', '?kind=meetings'))
    expect(resM.status).toBe(200)
    const jsonM = await resM.json()
    expect(jsonM.meetings.length).toBe(1)

    workService.listWorkDocuments.mockResolvedValueOnce([{ id: ID_1, title: 'Doc' }])
    const resD = await handler(req('GET', '?kind=documents&projectId=' + ID_1))
    expect(resD.status).toBe(200)
    const jsonD = await resD.json()
    expect(jsonD.documents.length).toBe(1)
  })

  it('GET với kind không hợp lệ trả 400', async () => {
    const res = await handler(req('GET', '?kind=unknown'))
    expect(res.status).toBe(400)
  })

  it('POST project tạo dự án mới', async () => {
    workService.createWorkProject.mockResolvedValueOnce({ id: ID_1, name: 'New Project' })
    const res = await handler(
      req('POST', '', { kind: 'project', name: 'New Project', description: 'desc' }),
    )
    expect(res.status).toBe(201)
    expect(workService.createWorkProject).toHaveBeenCalledWith({}, PERSON_ID, {
      kind: 'project',
      name: 'New Project',
      description: 'desc',
    })
  })

  it('POST task tạo công việc mới', async () => {
    workService.createWorkTask.mockResolvedValueOnce({ id: ID_1, title: 'New Task' })
    const res = await handler(
      req('POST', '', { kind: 'task', title: 'New Task', priority: 'high' }),
    )
    expect(res.status).toBe(201)
    expect(workService.createWorkTask).toHaveBeenCalledWith({}, PERSON_ID, {
      kind: 'task',
      title: 'New Task',
      priority: 'high',
    })
  })

  it('POST meeting và document', async () => {
    workService.recordWorkMeeting.mockResolvedValueOnce({ id: ID_1, title: 'Meeting' })
    const resM = await handler(
      req('POST', '', {
        kind: 'meeting',
        title: 'Meeting',
        scheduledAt: '2026-08-18T10:00:00Z',
        durationMinutes: 30,
        summary: 'Review',
      }),
    )
    expect(resM.status).toBe(201)

    workService.createWorkDocument.mockResolvedValueOnce({ id: ID_1, title: 'Doc' })
    const resD = await handler(
      req('POST', '', {
        kind: 'document',
        title: 'Doc',
        documentType: 'spec',
        summary: 'Spec doc',
      }),
    )
    expect(resD.status).toBe(201)
  })

  it('POST payload không hợp lệ trả 400', async () => {
    const res = await handler(req('POST', '', { kind: 'unknown' }))
    expect(res.status).toBe(400)
  })

  it('PATCH project và task cập nhật', async () => {
    workService.updateWorkProject.mockResolvedValueOnce({ id: ID_1, status: 'completed' })
    const res = await handler(req('PATCH', '', { kind: 'project', id: ID_1, status: 'completed' }))
    expect(res.status).toBe(200)

    workService.updateWorkTask.mockResolvedValueOnce({ id: ID_1, status: 'done' })
    const resT = await handler(req('PATCH', '', { kind: 'task', id: ID_1, status: 'done' }))
    expect(resT.status).toBe(200)

    const resInvalid = await handler(req('PATCH', '', { kind: 'unknown' }))
    expect(resInvalid.status).toBe(400)
  })

  it('DELETE trả 405', async () => {
    const res = await handler(req('DELETE'))
    expect(res.status).toBe(405)
  })
})
