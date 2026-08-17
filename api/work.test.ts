import { beforeEach, describe, expect, it, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true

vi.mock('../packages/core-auth/security.js', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: () => ({}) }))

const getOrCreatePerson = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
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

vi.mock('../packages/core-work/workService.js', () => ({
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
    const res = await handler(req('GET', '?kind=tasks&status=todo'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.tasks.length).toBe(1)
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

  it('PATCH project cập nhật dự án', async () => {
    workService.updateWorkProject.mockResolvedValueOnce({ id: ID_1, status: 'completed' })
    const res = await handler(req('PATCH', '', { kind: 'project', id: ID_1, status: 'completed' }))
    expect(res.status).toBe(200)
    expect(workService.updateWorkProject).toHaveBeenCalledWith({}, PERSON_ID, ID_1, {
      kind: 'project',
      id: ID_1,
      status: 'completed',
    })
  })
})
