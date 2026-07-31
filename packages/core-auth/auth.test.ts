// Test api/auth.ts — trước GĐ1 (nền tảng đa lĩnh vực), file này CHƯA có test nào dù xử lý
// toàn bộ đăng ký/đăng nhập/OAuth (Google/Facebook/Apple/Microsoft)/logout. Trọng tâm ở đây:
// đăng nhập Google (action 'google' và 'google-token') — luồng GĐ1 sẽ đụng vào khi tách
// packages/core-auth, cần có test trước để phát hiện hồi quy.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async (req: Request) => {
    const header = req.headers.get('Authorization')
    if (header === 'Bearer valid-token') return { userId: 'user-1' }
    return null
  },
  logSecurityEvent: vi.fn(),
}))

const authService = vi.hoisted(() => ({
  createUserWithPassword: vi.fn(),
  verifyUserPassword: vi.fn(),
  verifyGoogleIdToken: vi.fn(),
  verifyGoogleAccessToken: vi.fn(),
  findOrCreateGoogleUser: vi.fn(),
  verifyFacebookAccessToken: vi.fn(),
  findOrCreateFacebookUser: vi.fn(),
  verifyAppleIdToken: vi.fn(),
  findOrCreateAppleUser: vi.fn(),
  verifyMicrosoftIdToken: vi.fn(),
  findOrCreateMicrosoftUser: vi.fn(),
  createSession: vi.fn(async () => 'session-token-abc'),
  revokeSession: vi.fn(),
  ensureProfileRow: vi.fn(async (_userId: string, name: string) => ({
    plan: 'free' as const,
    onboarded: false,
    name,
    planExpiresAt: null,
  })),
  getUserById: vi.fn(),
}))
vi.mock('./authService', () => authService)

vi.mock('./emailVerification', () => ({
  sendVerificationCode: vi.fn(async () => ({ ok: true, mail: 'sent' })),
  verifyCode: vi.fn(),
  isEmailVerified: vi.fn(async () => false),
}))

vi.mock('./adminAuth', () => ({ isAdminEmail: () => false }))

const trial = vi.hoisted(() => ({ grantSignupTrial: vi.fn(async () => true) }))
vi.mock('../../api/_lib/trial', () => ({ ...trial, SIGNUP_TRIAL_DAYS: 14 }))

vi.mock('./changeEmail', () => ({ changeEmail: vi.fn() }))
vi.mock('../../api/_lib/passwordReset', () => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
}))

import handler from './auth'

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  authService.createSession.mockResolvedValue('session-token-abc')
  authService.ensureProfileRow.mockImplementation(async (_userId: string, name: string) => ({
    plan: 'free' as const,
    onboarded: false,
    name,
    planExpiresAt: null,
  }))
  trial.grantSignupTrial.mockResolvedValue(true)
})

describe('/api/auth — action google (One Tap idToken)', () => {
  it('idToken hợp lệ, user đã tồn tại → đăng nhập, KHÔNG cấp lại quà dùng thử', async () => {
    authService.verifyGoogleIdToken.mockResolvedValue({
      googleId: 'g-1',
      email: 'a@b.com',
      name: 'A',
    })
    authService.findOrCreateGoogleUser.mockResolvedValue({
      user: { id: 'user-1', email: 'a@b.com' },
      isNew: false,
    })

    const resp = await handler(makeRequest({ action: 'google', idToken: 'x'.repeat(20) }))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { token: string; signupTrialGranted: boolean }
    expect(data.token).toBe('session-token-abc')
    expect(data.signupTrialGranted).toBe(false)
    expect(trial.grantSignupTrial).not.toHaveBeenCalled()
  })

  it('user MỚI qua Google → cấp quà dùng thử ngay (không cần xác thực email)', async () => {
    authService.verifyGoogleIdToken.mockResolvedValue({
      googleId: 'g-2',
      email: 'new@b.com',
      name: 'New',
    })
    authService.findOrCreateGoogleUser.mockResolvedValue({
      user: { id: 'user-2', email: 'new@b.com' },
      isNew: true,
    })

    const resp = await handler(makeRequest({ action: 'google', idToken: 'x'.repeat(20) }))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { signupTrialGranted: boolean }
    expect(data.signupTrialGranted).toBe(true)
    expect(trial.grantSignupTrial).toHaveBeenCalledWith('user-2')
  })

  it('idToken không hợp lệ → 401, không tạo phiên', async () => {
    authService.verifyGoogleIdToken.mockResolvedValue(null)

    const resp = await handler(makeRequest({ action: 'google', idToken: 'x'.repeat(20) }))
    expect(resp.status).toBe(401)
    expect(authService.findOrCreateGoogleUser).not.toHaveBeenCalled()
    expect(authService.createSession).not.toHaveBeenCalled()
  })

  it('idToken thiếu/ngắn → 400 (Zod chặn trước khi gọi Google)', async () => {
    const resp = await handler(makeRequest({ action: 'google', idToken: 'short' }))
    expect(resp.status).toBe(400)
    expect(authService.verifyGoogleIdToken).not.toHaveBeenCalled()
  })
})

describe('/api/auth — action google-token (popup OAuth2, Safari/iOS/PWA)', () => {
  it('accessToken hợp lệ → đăng nhập thành công', async () => {
    authService.verifyGoogleAccessToken.mockResolvedValue({
      googleId: 'g-3',
      email: 'c@d.com',
      name: 'C',
    })
    authService.findOrCreateGoogleUser.mockResolvedValue({
      user: { id: 'user-3', email: 'c@d.com' },
      isNew: false,
    })

    const resp = await handler(makeRequest({ action: 'google-token', accessToken: 'y'.repeat(20) }))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { user: { email: string } }
    expect(data.user.email).toBe('c@d.com')
  })

  it('accessToken không hợp lệ (Google từ chối) → 401', async () => {
    authService.verifyGoogleAccessToken.mockResolvedValue(null)

    const resp = await handler(makeRequest({ action: 'google-token', accessToken: 'y'.repeat(20) }))
    expect(resp.status).toBe(401)
    expect(authService.findOrCreateGoogleUser).not.toHaveBeenCalled()
  })
})

describe('/api/auth — action register/login (đối chiếu hành vi trước khi tách core-auth)', () => {
  it('đăng ký thành công → 200, gửi mã xác thực, KHÔNG cấp quà dùng thử ngay', async () => {
    authService.createUserWithPassword.mockResolvedValue({ id: 'user-4', email: 'e@f.com' })

    const resp = await handler(
      makeRequest({ action: 'register', email: 'e@f.com', name: 'E', password: 'abcdef' }),
    )
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as { signupTrialGranted?: boolean }
    expect(data.signupTrialGranted).toBeUndefined()
    expect(trial.grantSignupTrial).not.toHaveBeenCalled()
  })

  it('đăng ký email đã tồn tại → 409, không lộ lý do cụ thể', async () => {
    authService.createUserWithPassword.mockResolvedValue(null)

    const resp = await handler(
      makeRequest({ action: 'register', email: 'e@f.com', name: 'E', password: 'abcdef' }),
    )
    expect(resp.status).toBe(409)
  })

  it('đăng nhập sai mật khẩu → 401', async () => {
    authService.verifyUserPassword.mockResolvedValue(null)

    const resp = await handler(
      makeRequest({ action: 'login', email: 'e@f.com', password: 'wrong' }),
    )
    expect(resp.status).toBe(401)
    expect(authService.createSession).not.toHaveBeenCalled()
  })
})

describe('/api/auth — action logout', () => {
  it('có token → thu hồi phiên', async () => {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer valid-token' },
      body: JSON.stringify({ action: 'logout' }),
    })
    const resp = await handler(req)
    expect(resp.status).toBe(200)
    expect(authService.revokeSession).toHaveBeenCalledWith('valid-token')
  })
})
