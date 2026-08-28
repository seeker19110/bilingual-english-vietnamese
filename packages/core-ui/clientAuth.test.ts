// packages/core-ui/clientAuth.test.ts — Kiểm thử module xác thực clientAuth và Safe Redirect.

import { describe, it, expect, vi } from 'vitest'
import { getSafeRedirectUrl } from './clientAuth.js'

describe('packages/core-ui/clientAuth.ts', () => {
  describe('getSafeRedirectUrl', () => {
    it('không có tham số hoặc chuỗi rỗng → trả về fallbackUrl mặc định', () => {
      expect(getSafeRedirectUrl(null)).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('')).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('   ', '/dashboard')).toBe('/dashboard')
    })

    it('đường dẫn tương đối hợp lệ (bắt đầu bằng /) → cho phép', () => {
      expect(getSafeRedirectUrl('/')).toBe('/')
      expect(getSafeRedirectUrl('/login')).toBe('/login')
      expect(getSafeRedirectUrl('/practice?level=A1')).toBe('/practice?level=A1')
    })

    it('đường dẫn bắt đầu bằng // (protocol-relative URL lạ) → từ chối, trả fallbackUrl', () => {
      expect(getSafeRedirectUrl('//evil.com/phishing')).toBe('https://www.donghanhcungban.org/')
    })

    it('URL tuyệt đối thuộc domain donghanhcungban.org / donghanhcungban.com → cho phép', () => {
      expect(getSafeRedirectUrl('https://donghanhcungban.org/')).toBe(
        'https://donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('https://www.donghanhcungban.org/profile')).toBe(
        'https://www.donghanhcungban.org/profile',
      )
      expect(getSafeRedirectUrl('https://en-vi.donghanhcungban.org/learning-path')).toBe(
        'https://en-vi.donghanhcungban.org/learning-path',
      )
      expect(getSafeRedirectUrl('https://math.donghanhcungban.org/')).toBe(
        'https://math.donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('https://en-vi.donghanhcungban.com/test')).toBe(
        'https://en-vi.donghanhcungban.com/test',
      )
    })

    it('URL localhost / 127.0.0.1 khi dev → cho phép', () => {
      expect(getSafeRedirectUrl('http://localhost:3000/')).toBe('http://localhost:3000/')
      expect(getSafeRedirectUrl('http://localhost:5173/practice')).toBe(
        'http://localhost:5173/practice',
      )
      expect(getSafeRedirectUrl('http://127.0.0.1:3000/test')).toBe('http://127.0.0.1:3000/test')
    })

    it('URL độc hại / domain bên ngoài (Open Redirect Attack) → từ chối, trả fallbackUrl', () => {
      expect(getSafeRedirectUrl('https://evil.com/hack')).toBe('https://www.donghanhcungban.org/')
      expect(getSafeRedirectUrl('https://attacker-donghanhcungban.org/')).toBe(
        'https://www.donghanhcungban.org/',
      )
      expect(getSafeRedirectUrl('javascript:alert(1)')).toBe('https://www.donghanhcungban.org/')
    })
  })

  describe('callAuthApi, register, login, logout, getCurrentUser', () => {
    it('callAuthApi trả về null khi resp không ok', async () => {
      const { callAuthApi } = await import('./clientAuth.js')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as unknown as Response)

      const res = await callAuthApi({ action: 'test' })
      expect(res).toBeNull()
    })

    it('register lưu token và trả user', async () => {
      const { register } = await import('./clientAuth.js')
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        name: 'User 1',
        plan: 'free' as const,
        onboarded: true,
        createdAt: Date.now(),
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token-xyz', user: mockUser }),
      } as unknown as Response)

      const user = await register('test@example.com', 'User 1', 'password123')
      expect(user).toEqual(mockUser)
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('mock-token-xyz')
    })

    it('login trả về null khi thất bại', async () => {
      const { login } = await import('./clientAuth.js')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as unknown as Response)

      const user = await login('bad@example.com', 'wrong')
      expect(user).toBeNull()
    })

    it('logout gọi API và xóa stored token', async () => {
      const { logout } = await import('./clientAuth.js')
      localStorage.setItem('gsa_session_token_v1', 'existing-token')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as unknown as Response)

      await logout()
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('getCurrentUser trả về null khi không có token', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.removeItem('gsa_session_token_v1')
      const user = await getCurrentUser()
      expect(user).toBeNull()
    })

    it('getCurrentUser xóa token khi nhận 401', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.setItem('gsa_session_token_v1', 'expired-token')
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as unknown as Response)

      const user = await getCurrentUser()
      expect(user).toBeNull()
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('getCurrentUser trả user hợp lệ khi token đúng', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.setItem('gsa_session_token_v1', 'valid-token')
      const mockProfile = {
        id: 'u-valid',
        email: 'valid@example.com',
        name: 'Valid User',
        plan: 'pro',
        onboarded: true,
        emailVerified: true,
        isAdmin: false,
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      } as unknown as Response)

      const user = await getCurrentUser()
      expect(user?.id).toBe('u-valid')
      expect(user?.plan).toBe('pro')
    })
  })

  describe('GoogleAuthError & OAuth utilities', () => {
    it('GoogleAuthError khởi tạo đúng name và code', async () => {
      const { GoogleAuthError } = await import('./clientAuth.js')
      const err = new GoogleAuthError('popup_blocked', 'Popup bị chặn')
      expect(err.name).toBe('GoogleAuthError')
      expect(err.code).toBe('popup_blocked')
      expect(err.message).toBe('Popup bị chặn')
    })

    it('handleOAuthRedirectCallback trả về null khi không có access_token trong url', async () => {
      const { handleOAuthRedirectCallback } = await import('./clientAuth.js')
      window.location.hash = ''
      window.location.search = ''
      const user = await handleOAuthRedirectCallback()
      expect(user).toBeNull()
    })

    it('handleOAuthRedirectCallback xử lý access_token từ hash thành công', async () => {
      const { handleOAuthRedirectCallback } = await import('./clientAuth.js')
      window.location.hash = '#access_token=google-oauth-token-123'
      const mockUser = {
        id: 'u-google',
        email: 'google@gmail.com',
        name: 'Google User',
        plan: 'free' as const,
        onboarded: true,
        createdAt: Date.now(),
      }
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'session-jwt', user: mockUser }),
      } as unknown as Response)

      const user = await handleOAuthRedirectCallback()
      expect(user?.email).toBe('google@gmail.com')
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('session-jwt')
    })

    // TEST CANH GÁC (audit 2026-08-28, F7): `state` của OAuth là token chống CSRF nên phải sinh
    // từ `crypto.getRandomValues`, không phải `Math.random`. Cách canh giống F6: ghim
    // `Math.random` về hằng số — nếu code quay lại dùng nó thì hai lần gọi cho ra cùng một
    // `state`, và Math.random sẽ bị gọi thật.
    it('state của OAuth KHÔNG phụ thuộc Math.random (nguồn mật mã)', async () => {
      const { loginWithGoogleRedirect } = await import('./clientAuth.js')
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id.apps.googleusercontent.com')
      const states: string[] = []
      try {
        for (let i = 0; i < 2; i++) {
          sessionStorage.removeItem('oauth_state_google')
          loginWithGoogleRedirect()
          states.push(sessionStorage.getItem('oauth_state_google') ?? '')
        }
        expect(states[0]).toMatch(/^[0-9a-f]{32}$/)
        expect(states[0]).not.toBe(states[1])
        expect(spy).not.toHaveBeenCalled()
      } finally {
        spy.mockRestore()
        vi.unstubAllEnvs()
      }
    })

    // ── Nạp lại cờ đã-đăng-nhập trên origin mới (2026-08-28) ──────────────────────────────
    // Server xác thực bằng COOKIE (Bearer bị bỏ qua từ Bước 6), và cookie đi theo mọi
    // subdomain — nên API vốn đã gọi được. Thứ hỏng là giao diện: nó đọc localStorage (cô lập
    // theo origin) để biết đã đăng nhập chưa, nên người dùng bị hiện thành khách dù phiên còn.
    it('localStorage rỗng nhưng cookie còn hiệu lực → nhận phiên và LƯU cờ cho origin này', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.removeItem('gsa_session_token_v1')
      const mockUser = {
        id: 'u-1',
        email: 'a@b.c',
        name: 'A',
        plan: 'free' as const,
        onboarded: true,
        createdAt: Date.now(),
      }
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        // 1) POST session-from-cookie → trả token + user
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: 'token-tu-cookie', user: mockUser }),
        } as unknown as Response)
        // 2) GET ?action=me bằng token vừa nhận
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        } as unknown as Response)

      const user = await getCurrentUser()

      expect(user?.email).toBe('a@b.c')
      // PHẢI lưu lại: cloud.ts/challengeCloud.ts/tutorFeedback.ts kiểm getStoredToken()
      // để quyết định có đồng bộ hay không.
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('token-tu-cookie')

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
      expect(url).toBe('/api/auth')
      // POST, không phải GET: SameSite=Lax không gửi cookie kèm POST từ site khác.
      expect(init.method).toBe('POST')
      expect(init.credentials).toBe('include')
      expect(JSON.parse(init.body as string)).toEqual({ action: 'session-from-cookie' })
    })

    it('localStorage rỗng và KHÔNG có cookie hợp lệ → null, không gọi thêm ?action=me', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.removeItem('gsa_session_token_v1')
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: false, status: 401 } as unknown as Response)

      expect(await getCurrentUser()).toBeNull()
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('mất mạng lúc đổi cookie → null chứ KHÔNG ném lỗi (AuthProvider vẫn dựng được UI)', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.removeItem('gsa_session_token_v1')
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network down'))
      await expect(getCurrentUser()).resolves.toBeNull()
    })

    it('ĐÃ có cờ trong localStorage → KHÔNG gọi session-from-cookie (không thêm vòng mạng)', async () => {
      const { getCurrentUser } = await import('./clientAuth.js')
      localStorage.setItem('gsa_session_token_v1', 'token-san-co')
      const mockUser = {
        id: 'u-2',
        email: 'c@d.e',
        name: 'C',
        plan: 'free' as const,
        onboarded: true,
        createdAt: Date.now(),
      }
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser } as unknown as Response)

      const user = await getCurrentUser()

      expect(user?.email).toBe('c@d.e')
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(fetchSpy.mock.calls[0]![0]).toBe('/api/auth?action=me')
    })

    it('preloadOAuthProviders chạy an toàn mà không quăng lỗi', async () => {
      const { preloadOAuthProviders } = await import('./clientAuth.js')
      expect(() => preloadOAuthProviders()).not.toThrow()
    })
  })
})
