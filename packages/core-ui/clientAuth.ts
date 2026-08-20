// packages/core-ui/clientAuth.ts — Xác thực phía client dùng chung cho toàn bộ hệ sinh thái (Hub & Subdomains).
// Quản lý đăng nhập, đăng ký, OAuth 2.0 (Google, Facebook, Apple, Microsoft), SSO cookie và chuyển hướng an toàn.

import { setStoredToken, clearStoredToken, getAuthHeader } from './authHeader.js'

export type Plan = 'free' | 'pro' | 'vip'

export interface AppUser {
  id: string
  email: string
  name: string
  plan: Plan
  onboarded: boolean
  planExpiresAt?: string | null
  emailVerified?: boolean
  isAdmin?: boolean
  createdAt: number
}

interface AuthApiUser {
  id: string
  email: string
  name: string
  plan: Plan
  onboarded: boolean
  planExpiresAt?: string | null
  createdAt: number
}

// ── Kiểm tra và làm sạch URL chuyển hướng (Safe Redirect URL) ───────────────────────────
// Chống lỗ hổng Open Redirect Attack: chỉ cho phép các URL nội bộ hoặc thuộc hệ sinh thái Đồng Hành.
const ALLOWED_HOST_SUFFIXES = [
  'donghanhcungban.org',
  'donghanhcungban.com',
  'localhost',
  '127.0.0.1',
]

export function getSafeRedirectUrl(
  redirectParam: string | null | undefined,
  fallbackUrl = 'https://www.donghanhcungban.org/',
): string {
  if (!redirectParam || !redirectParam.trim()) return fallbackUrl
  const trimmed = redirectParam.trim()

  // 1. Đường dẫn tương đối hợp lệ (bắt đầu bằng / nhưng không phải //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }

  // 2. URL tuyệt đối: kiểm tra hostname
  try {
    const parsed = new URL(trimmed)
    const hostname = parsed.hostname.toLowerCase()
    const isAllowed = ALLOWED_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
    )
    if (isAllowed) {
      return parsed.toString()
    }
  } catch {
    // Không phải URL hợp lệ
  }

  return fallbackUrl
}

// ── Gọi API xác thực ──────────────────────────────────────────────────────────────────
export async function callAuthApi(
  body: Record<string, unknown>,
): Promise<{ token: string; user: AuthApiUser } | null> {
  const resp = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) return null
  return (await resp.json()) as { token: string; user: AuthApiUser }
}

export async function register(
  email: string,
  name: string,
  password: string,
): Promise<AppUser | null> {
  const result = await callAuthApi({ action: 'register', email, name, password })
  if (!result) return null
  setStoredToken(result.token)
  return result.user
}

export async function login(email: string, password: string): Promise<AppUser | null> {
  const result = await callAuthApi({ action: 'login', email, password })
  if (!result) return null
  setStoredToken(result.token)
  return result.user
}

// ── Google OAuth (Google Identity Services) ───────────────────────────────────────────
export class GoogleAuthError extends Error {
  constructor(
    public readonly code:
      'popup_blocked' | 'popup_closed' | 'access_denied' | 'origin_mismatch' | 'unknown',
    message: string,
  ) {
    super(message)
    this.name = 'GoogleAuthError'
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (resp: {
              access_token?: string
              error?: string
              error_description?: string
            }) => void
            error_callback?: (err: { type?: string; message?: string }) => void
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void }
        }
      }
    }
  }
}

let googleInitPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (googleInitPromise) return googleInitPromise
  googleInitPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Không tải được Google Identity Services'))
    document.head.appendChild(script)
  })
  return googleInitPromise
}

export async function loginWithGoogle(): Promise<AppUser | null> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId) throw new Error('Thiếu VITE_GOOGLE_CLIENT_ID')

  // Không await microtask nếu script đã có sẵn để bảo toàn User Activation cho Chrome
  if (!window.google?.accounts?.oauth2) {
    await loadGoogleScript()
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (resp) => {
          if (!resp.access_token) {
            if (resp.error) {
              console.warn(
                '[auth] Google OAuth response error:',
                resp.error,
                resp.error_description,
              )
            }
            resolve(null)
            return
          }
          void callAuthApi({ action: 'google-token', accessToken: resp.access_token })
            .then((result) => {
              if (!result) {
                resolve(null)
                return
              }
              setStoredToken(result.token)
              resolve(result.user)
            })
            .catch(reject)
        },
        error_callback: (err) => {
          console.warn('[auth] Google OAuth error_callback:', err)
          if (err?.type === 'popup_closed') {
            resolve(null)
            return
          }
          if (err?.type === 'popup_blocked_by_browser') {
            reject(
              new GoogleAuthError(
                'popup_blocked',
                'Trình duyệt đang chặn cửa sổ Popup Google. Vui lòng cho phép popup trên thanh địa chỉ hoặc chọn chế độ chuyển trang.',
              ),
            )
            return
          }
          if (err?.type === 'origin_mismatch') {
            reject(
              new GoogleAuthError(
                'origin_mismatch',
                'Tên miền hiện tại chưa được cấp phép trong Google Cloud Console (Authorized JavaScript origins).',
              ),
            )
            return
          }
          if (err?.type === 'access_denied') {
            reject(
              new GoogleAuthError('access_denied', 'Bạn đã từ chối cấp quyền đăng nhập Google.'),
            )
            return
          }
          resolve(null)
        },
      })

      client.requestAccessToken({ prompt: 'select_account' })
    } catch (err) {
      reject(err)
    }
  })
}

// ── Đăng nhập Google qua Luồng Chuyển Hướng (Universal OAuth2 Redirect Flow) ───────────
export function loginWithGoogleRedirect(redirectPath = '/login'): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId) throw new Error('Thiếu VITE_GOOGLE_CLIENT_ID')

  const redirectUri = `${window.location.origin}${redirectPath}`
  const state = Math.random().toString(36).substring(2, 15)
  try {
    sessionStorage.setItem('oauth_state_google', state)
  } catch {
    // ignore
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Xử lý callback sau khi quay lại từ Google OAuth Redirect
export async function handleOAuthRedirectCallback(): Promise<AppUser | null> {
  if (typeof window === 'undefined') return null

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)
  const accessTokenFromHash = hashParams.get('access_token')

  const searchParams = new URLSearchParams(window.location.search)
  const accessTokenFromSearch = searchParams.get('access_token')

  const accessToken = accessTokenFromHash || accessTokenFromSearch
  if (!accessToken) return null

  try {
    const result = await callAuthApi({ action: 'google-token', accessToken })
    if (!result) return null

    setStoredToken(result.token)

    const cleanUrl = window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)

    return result.user
  } catch (err) {
    console.error('[auth] Lỗi xử lý Google OAuth Redirect Callback:', err)
    return null
  }
}

// ── Facebook Login ─────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    fbAsyncInit?: () => void
    FB?: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      login: (
        callback: (resp: { status: string; authResponse?: { accessToken: string } }) => void,
        options: { scope: string },
      ) => void
    }
  }
}

let facebookInitPromise: Promise<void> | null = null

function loadFacebookScript(appId: string): Promise<void> {
  if (facebookInitPromise) return facebookInitPromise
  facebookInitPromise = new Promise((resolve, reject) => {
    if (window.FB) {
      resolve()
      return
    }
    window.fbAsyncInit = () => {
      window.FB!.init({ appId, cookie: false, xfbml: false, version: 'v21.0' })
      resolve()
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Không tải được Facebook SDK'))
    document.head.appendChild(script)
  })
  return facebookInitPromise
}

export async function loginWithFacebook(): Promise<AppUser | null> {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined
  if (!appId) throw new Error('Thiếu VITE_FACEBOOK_APP_ID')

  await loadFacebookScript(appId)

  return new Promise((resolve, reject) => {
    window.FB!.login(
      (resp) => {
        if (resp.status !== 'connected' || !resp.authResponse) {
          resolve(null)
          return
        }
        void callAuthApi({ action: 'facebook', accessToken: resp.authResponse.accessToken })
          .then((result) => {
            if (!result) {
              resolve(null)
              return
            }
            setStoredToken(result.token)
            resolve(result.user)
          })
          .catch(reject)
      },
      { scope: 'email' },
    )
  })
}

// ── Apple Sign In ──────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string
          scope: string
          redirectURI: string
          usePopup: boolean
        }) => void
        signIn: () => Promise<{
          authorization: { id_token: string }
          user?: { name?: { firstName?: string; lastName?: string } }
        }>
      }
    }
  }
}

let appleInitPromise: Promise<void> | null = null

function loadAppleScript(): Promise<void> {
  if (appleInitPromise) return appleInitPromise
  appleInitPromise = new Promise((resolve, reject) => {
    if (window.AppleID) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Không tải được Sign in with Apple JS'))
    document.head.appendChild(script)
  })
  return appleInitPromise
}

export async function loginWithApple(): Promise<AppUser | null> {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined
  if (!clientId) throw new Error('Thiếu VITE_APPLE_CLIENT_ID')

  await loadAppleScript()
  window.AppleID!.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: window.location.origin,
    usePopup: true,
  })

  const resp = await window.AppleID!.auth.signIn()
  const first = resp.user?.name?.firstName
  const last = resp.user?.name?.lastName
  const name = [first, last].filter(Boolean).join(' ').trim() || undefined

  const result = await callAuthApi({
    action: 'apple',
    idToken: resp.authorization.id_token,
    ...(name ? { name } : {}),
  })
  if (!result) return null
  setStoredToken(result.token)
  return result.user
}

// ── Microsoft Sign In ──────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    msal?: {
      PublicClientApplication: new (config: { auth: { clientId: string; authority: string } }) => {
        initialize: () => Promise<void>
        loginPopup: (request: { scopes: string[] }) => Promise<{ idToken: string }>
      }
    }
  }
}

let microsoftInitPromise: Promise<void> | null = null

function loadMicrosoftScript(): Promise<void> {
  if (microsoftInitPromise) return microsoftInitPromise
  microsoftInitPromise = new Promise((resolve, reject) => {
    if (window.msal) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://alcdn.msauth.net/browser/3.7.1/js/msal-browser.min.js'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Không tải được MSAL.js'))
    document.head.appendChild(script)
  })
  return microsoftInitPromise
}

export async function loginWithMicrosoft(): Promise<AppUser | null> {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined
  if (!clientId) throw new Error('Thiếu VITE_MICROSOFT_CLIENT_ID')

  await loadMicrosoftScript()
  const app = new window.msal!.PublicClientApplication({
    auth: {
      clientId,
      authority: 'https://login.microsoftonline.com/common',
    },
  })
  await app.initialize()

  const resp = await app.loginPopup({ scopes: ['openid', 'profile', 'email'] })
  const result = await callAuthApi({ action: 'microsoft', idToken: resp.idToken })
  if (!result) return null
  setStoredToken(result.token)
  return result.user
}

// ── Đăng xuất & Lấy thông tin user hiện tại ─────────────────────────────────────────────
export async function logout(): Promise<void> {
  await callAuthApi({ action: 'logout' }).catch(() => undefined)
  clearStoredToken()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const auth = getAuthHeader()
  if (!auth.Authorization) return null

  const resp = await fetch('/api/auth?action=me', {
    headers: auth,
    credentials: 'include',
  })
  if (!resp.ok) {
    if (resp.status === 401) clearStoredToken()
    return null
  }
  const profile = (await resp.json()) as {
    id: string
    email: string
    name: string
    plan: Plan
    onboarded: boolean
    planExpiresAt?: string | null
    emailVerified?: boolean
    isAdmin?: boolean
  }
  return { ...profile, createdAt: Date.now() }
}

export function clearProfileCache(): void {
  /* no-op */
}

// Tải trước (preload) SDK của cả 4 nhà cung cấp OAuth
export function preloadOAuthProviders(): void {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (googleClientId) void loadGoogleScript().catch(() => undefined)

  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined
  if (facebookAppId) void loadFacebookScript(facebookAppId).catch(() => undefined)

  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined
  if (appleClientId) void loadAppleScript().catch(() => undefined)

  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined
  if (microsoftClientId) void loadMicrosoftScript().catch(() => undefined)
}
