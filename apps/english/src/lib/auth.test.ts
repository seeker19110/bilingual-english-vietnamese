// Test src/lib/auth.ts — client đăng nhập/đăng ký, gọi /api/auth qua fetch.
// Mock fetch toàn cục + mock localStorage (qua @core/authHeader) để kiểm luồng lưu/xoá token.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

describe('src/lib/auth.ts', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('đăng nhập thành công → lưu token vào localStorage, trả user', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'tok-abc',
          user: {
            id: 'u1',
            email: 'a@b.com',
            name: 'A',
            plan: 'free',
            onboarded: false,
            createdAt: 1,
          },
        }),
      })
      const { login } = await import('./auth')

      const user = await login('a@b.com', '123456')

      expect(user?.email).toBe('a@b.com')
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('tok-abc')
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'login', email: 'a@b.com', password: '123456' }),
        }),
      )
    })

    it('sai mật khẩu (resp không ok) → trả null, KHÔNG lưu token', async () => {
      fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'sai' }) })
      const { login } = await import('./auth')

      const user = await login('a@b.com', 'wrong')

      expect(user).toBeNull()
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('lỗi mạng (fetch reject) → ném lỗi ra ngoài, không lưu token', async () => {
      fetchMock.mockRejectedValue(new Error('network down'))
      const { login } = await import('./auth')

      await expect(login('a@b.com', '123456')).rejects.toThrow('network down')
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })
  })

  describe('register', () => {
    it('đăng ký thành công → lưu token, trả user', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'tok-new',
          user: {
            id: 'u2',
            email: 'new@b.com',
            name: 'New',
            plan: 'free',
            onboarded: false,
            createdAt: 1,
          },
        }),
      })
      const { register } = await import('./auth')

      const user = await register('new@b.com', 'New', '123456')

      expect(user?.id).toBe('u2')
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('tok-new')
    })

    it('email đã tồn tại (resp không ok) → trả null', async () => {
      fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'trùng' }) })
      const { register } = await import('./auth')

      expect(await register('a@b.com', 'A', '123456')).toBeNull()
    })
  })

  describe('logout', () => {
    it('xoá token khỏi localStorage kể cả khi API logout lỗi', async () => {
      localStorage.setItem('gsa_session_token_v1', 'tok-cu')
      fetchMock.mockRejectedValue(new Error('mạng lỗi'))
      const { logout } = await import('./auth')

      await logout()

      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('gọi API logout thành công → vẫn xoá token', async () => {
      localStorage.setItem('gsa_session_token_v1', 'tok-cu')
      fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
      const { logout } = await import('./auth')

      await logout()

      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('chưa đăng nhập (không có token) → trả null, KHÔNG gọi fetch', async () => {
      const { getCurrentUser } = await import('./auth')

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('có token, server trả 200 → trả profile kèm createdAt', async () => {
      localStorage.setItem('gsa_session_token_v1', 'tok-abc')
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'u1',
          email: 'a@b.com',
          name: 'A',
          plan: 'free',
          onboarded: true,
        }),
      })
      const { getCurrentUser } = await import('./auth')

      const user = await getCurrentUser()

      expect(user?.email).toBe('a@b.com')
      expect(typeof user?.createdAt).toBe('number')
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth?action=me',
        expect.objectContaining({ headers: { Authorization: 'Bearer tok-abc' } }),
      )
    })

    it('token hết hạn (server trả 401) → xoá token, trả null', async () => {
      localStorage.setItem('gsa_session_token_v1', 'tok-het-han')
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })
      const { getCurrentUser } = await import('./auth')

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('gsa_session_token_v1')).toBeNull()
    })

    it('lỗi khác 401 (vd 500) → trả null nhưng KHÔNG xoá token', async () => {
      localStorage.setItem('gsa_session_token_v1', 'tok-con-hieu-luc')
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server error' }),
      })
      const { getCurrentUser } = await import('./auth')

      const user = await getCurrentUser()

      expect(user).toBeNull()
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('tok-con-hieu-luc')
    })
  })

  describe('loginWithGoogle', () => {
    it('thiếu VITE_GOOGLE_CLIENT_ID → ném lỗi', async () => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
      const { loginWithGoogle } = await import('./auth')

      await expect(loginWithGoogle()).rejects.toThrow('Thiếu VITE_GOOGLE_CLIENT_ID')
    })

    it('người dùng đóng popup (error_callback) → trả null', async () => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-test')
      const requestAccessToken = vi.fn()
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => {
              // Giả lập người dùng đóng popup — gọi error_callback ngay
              queueMicrotask(() => config.error_callback?.({ type: 'popup_closed' }))
              return { requestAccessToken }
            },
          },
        },
      }
      const { loginWithGoogle } = await import('./auth')

      const user = await loginWithGoogle()

      expect(user).toBeNull()
      expect(requestAccessToken).toHaveBeenCalled()
      delete window.google
    })

    it('lấy được access_token → gọi API, lưu token, trả user', async () => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-test')
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'tok-google',
          user: {
            id: 'u3',
            email: 'g@b.com',
            name: 'G',
            plan: 'free',
            onboarded: false,
            createdAt: 1,
          },
        }),
      })
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => {
              queueMicrotask(() => config.callback({ access_token: 'gtok' }))
              return { requestAccessToken: vi.fn() }
            },
          },
        },
      }
      const { loginWithGoogle } = await import('./auth')

      const user = await loginWithGoogle()

      expect(user?.email).toBe('g@b.com')
      expect(localStorage.getItem('gsa_session_token_v1')).toBe('tok-google')
      delete window.google
    })

    it('không có access_token trong callback → trả null', async () => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id-test')
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: (config) => {
              queueMicrotask(() => config.callback({}))
              return { requestAccessToken: vi.fn() }
            },
          },
        },
      }
      const { loginWithGoogle } = await import('./auth')

      expect(await loginWithGoogle()).toBeNull()
      delete window.google
    })
  })

  describe('preloadOAuthProviders', () => {
    it('không có client id nào cấu hình → không ném lỗi', async () => {
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
      vi.stubEnv('VITE_FACEBOOK_APP_ID', '')
      vi.stubEnv('VITE_APPLE_CLIENT_ID', '')
      vi.stubEnv('VITE_MICROSOFT_CLIENT_ID', '')
      const { preloadOAuthProviders } = await import('./auth')

      expect(() => preloadOAuthProviders()).not.toThrow()
    })
  })

  describe('clearProfileCache', () => {
    it('là no-op, gọi không lỗi', async () => {
      const { clearProfileCache } = await import('./auth')
      expect(() => clearProfileCache()).not.toThrow()
    })
  })
})
