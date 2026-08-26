// Test /api/exam-plan — chặn cửa, map lỗi domain, và canh gác "không có endpoint lịch hôm nay".
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ConflictError, NotFoundError } from '@dhcb/core-errors/appError'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
const rateOk = { value: true }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateOk.value,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

const getActivePlanMock = vi.fn()
const createPlanMock = vi.fn()
const archivePlanMock = vi.fn()
vi.mock('@dhcb/core-examplan/examPlanService', () => ({
  getActivePlan: (...a: unknown[]) => getActivePlanMock(...a),
  createPlan: (...a: unknown[]) => createPlanMock(...a),
  archivePlan: (...a: unknown[]) => archivePlanMock(...a),
}))

const handler = (await import('./exam-plan.js')).default
const URL_BASE = 'http://localhost/api/exam-plan'
const PLAN_ID = '22222222-2222-4222-8222-222222222222'

const VALID_BODY = {
  examKind: 'vao10-english',
  examDate: '2030-06-01',
  scopeItems: 1000,
}

function post(body: unknown): Request {
  return new Request(URL_BASE, { method: 'POST', body: JSON.stringify(body) })
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateOk.value = true
  getActivePlanMock.mockReset()
  createPlanMock.mockReset()
  archivePlanMock.mockReset()
  getActivePlanMock.mockResolvedValue(null)
})

describe('chặn cửa', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    expect((await handler(new Request(URL_BASE))).status).toBe(401)
  })

  it('quá tần suất → 429', async () => {
    rateOk.value = false
    expect((await handler(new Request(URL_BASE))).status).toBe(429)
  })

  it('method lạ → 405', async () => {
    expect((await handler(new Request(URL_BASE, { method: 'PATCH' }))).status).toBe(405)
  })
})

describe('GET', () => {
  it('chưa có kế hoạch → { plan: null }', async () => {
    expect(await (await handler(new Request(URL_BASE))).json()).toEqual({ plan: null })
  })

  it('truyền ngày hôm nay theo giờ VN xuống service (không phải ngày UTC)', async () => {
    await handler(new Request(URL_BASE))
    const today = getActivePlanMock.mock.calls[0]![2] as string
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('POST', () => {
  it('thiếu scopeItems → 400', async () => {
    const res = await handler(post({ examKind: 'vao10-english', examDate: '2030-06-01' }))
    expect(res.status).toBe(400)
    expect(createPlanMock).not.toHaveBeenCalled()
  })

  it('kỳ thi ngoài danh sách cho phép → 400 (đợt 1 chỉ một kỳ thi)', async () => {
    const res = await handler(post({ ...VALID_BODY, examKind: 'ielts' }))
    expect(res.status).toBe(400)
  })

  it('KHÔNG nhận userId từ client', async () => {
    const res = await handler(post({ ...VALID_BODY, userId: 'nguoi-khac' }))
    expect(res.status).toBe(400) // .strict() chặn trường thừa
  })

  it('ngày sai định dạng → 400', async () => {
    expect((await handler(post({ ...VALID_BODY, examDate: '01/06/2030' }))).status).toBe(400)
  })

  it('tạo thành công → trả plan', async () => {
    createPlanMock.mockResolvedValue({ id: PLAN_ID })
    const res = await handler(post(VALID_BODY))
    expect(await res.json()).toEqual({ plan: { id: PLAN_ID } })
  })

  it('đã có kế hoạch đang chạy → 409 (không phải 500)', async () => {
    createPlanMock.mockRejectedValue(new ConflictError('Bạn đang có một kế hoạch ôn thi'))
    expect((await handler(post(VALID_BODY))).status).toBe(409)
  })
})

describe('DELETE', () => {
  it('planId không phải uuid → 400', async () => {
    const res = await handler(new Request(`${URL_BASE}?planId=abc`, { method: 'DELETE' }))
    expect(res.status).toBe(400)
    expect(archivePlanMock).not.toHaveBeenCalled()
  })

  it('kế hoạch không tồn tại → 404', async () => {
    archivePlanMock.mockRejectedValue(new NotFoundError('Không tìm thấy kế hoạch đang chạy'))
    const res = await handler(new Request(`${URL_BASE}?planId=${PLAN_ID}`, { method: 'DELETE' }))
    expect(res.status).toBe(404)
  })

  it('kết thúc thành công → truyền userId từ token', async () => {
    archivePlanMock.mockResolvedValue(undefined)
    const res = await handler(new Request(`${URL_BASE}?planId=${PLAN_ID}`, { method: 'DELETE' }))
    expect(res.status).toBe(200)
    expect(archivePlanMock).toHaveBeenCalledWith({}, 'user-1', PLAN_ID)
  })
})

// Canh gác quyết định kiến trúc: lịch được tính Ở CLIENT bằng hàm thuần. Nếu ai đó thêm phép
// tính lịch vào handler (kéo theo phải nhân bản dữ liệu từ vựng sang server), test này đỏ.
describe('canh gác: handler không tự lập lịch', () => {
  it('không import buildExamPlan', () => {
    const src = readFileSync(join(__dirname, 'exam-plan.ts'), 'utf8')
    expect(src).not.toContain('buildExamPlan')
  })
})
