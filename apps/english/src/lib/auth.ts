// src/lib/auth.ts — Đăng nhập/đăng ký (Giai đoạn B: gọi /api/auth tự viết, thay Supabase Auth).
// Giữ NGUYÊN chữ ký export (register/login/loginWithGoogle/logout/getCurrentUser) như cũ để
// AuthProvider.tsx + Login.tsx không phải sửa nơi gọi.
import { setStoredToken, clearStoredToken, getAuthHeader } from '@core/authHeader'
import type { User as AppUser, Plan } from '../types'

interface AuthApiUser {
  id: string
  email: string
  name: string
  plan: Plan
  onboarded: boolean
  planExpiresAt?: string | null
  createdAt: number
}

async function callAuthApi(
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

// Đăng nhập bằng Google — dùng Google Identity Services (script tải trong index.html).
// Dùng luồng OAuth2 popup THẬT (`oauth2.initTokenClient`) thay vì One Tap (`accounts.id.prompt`):
// One Tap hiển thị qua iframe, phụ thuộc cookie bên thứ 3/FedCM — bị Safari ITP chặn và KHÔNG
// hoạt động khi chạy PWA ở chế độ standalone (đã cài lên Home Screen iPhone), khiến nút bấm
// treo loading vô thời hạn mà không báo lỗi. Popup OAuth2 mở thẳng trang đăng nhập thật của
// Google (accounts.google.com) — tự nhận diện tài khoản đã lưu trong Safari/Chrome hoặc chuyển
// sang app Google (nếu có cài) qua universal link, không cần 2 bước.
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (resp: { access_token?: string; error?: string }) => void
            error_callback?: (err: { type?: string; message?: string }) => void
          }) => { requestAccessToken: () => void }
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

  await loadGoogleScript()

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (resp) => {
        if (!resp.access_token) {
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
      // Popup bị chặn/người dùng đóng popup mà không chọn tài khoản — trả về null thay vì
      // treo Promise vô thời hạn (lỗi cũ của One Tap khi bị Safari âm thầm bỏ qua).
      error_callback: () => resolve(null),
    })
    client.requestAccessToken()
  })
}

// ── Đăng nhập bằng Facebook (Facebook Login for Web SDK) ────────────────────────────────
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

// ── Đăng nhập bằng Apple (Sign in with Apple JS) ─────────────────────────────────────────
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
    // Apple bắt buộc redirectURI hợp lệ dù dùng popup — phải khớp domain đã đăng ký trong
    // Apple Developer (Services ID → Sign In with Apple → Website URLs).
    redirectURI: window.location.origin,
    usePopup: true,
  })

  const resp = await window.AppleID!.auth.signIn()
  // Tên CHỈ có ở lần đăng nhập đầu tiên (xem api/_lib/authService.ts) — gửi kèm ngay lúc này,
  // các lần sau server tự lấy phần trước @ của email làm tên mặc định.
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

// ── Đăng nhập bằng Microsoft (MSAL.js — Microsoft Authentication Library) ────────────────
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
      // 'common' — chấp nhận CẢ tài khoản công ty/trường lẫn tài khoản cá nhân Microsoft
      // (outlook.com/hotmail.com...), khớp verifyMicrosoftIdToken() ở server (regex issuer).
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

export async function logout() {
  await callAuthApi({ action: 'logout' }).catch(() => undefined)
  clearStoredToken()
}

// Lấy user hiện tại (gọi khi app khởi động + sau mỗi lần đăng nhập/đăng ký).
export async function getCurrentUser(): Promise<AppUser | null> {
  const auth = getAuthHeader()
  if (!auth.Authorization) return null

  const resp = await fetch('/api/auth?action=me', { headers: auth })
  if (!resp.ok) {
    if (resp.status === 401) clearStoredToken() // token hết hạn/thu hồi — dọn luôn
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

// Giữ export này (dùng ở AuthProvider.tsx khi SIGNED_OUT) — Giai đoạn B không còn cache
// profile riêng trong localStorage (đã gộp vào getCurrentUser gọi thẳng /api/auth?action=me).
export function clearProfileCache() {
  /* no-op — giữ lại export để AuthProvider.tsx không phải sửa import */
}

// Tải trước (preload) SDK của cả 4 nhà cung cấp NGAY khi trang Login hiện ra (gọi từ
// useEffect, không chờ) — thay vì đợi bấm nút mới bắt đầu tải qua mạng. Lý do: các hàm
// loginWith*() đều "await loadXScript()" rồi mới mở popup; nếu SDK CHƯA tải xong lúc bấm,
// khoảng chờ mạng đó cắt đứt chuỗi "cử chỉ người dùng" (user gesture) mà Safari/Chrome mobile
// dựa vào để cho phép mở popup — trình duyệt coi popup không còn gắn với cú bấm nữa và ÂM THẦM
// chặn, buộc người dùng phải bấm lại nhiều lần mới thành công. Preload xong trước thì lúc bấm
// nút, script đã có sẵn, popup mở ngay trong cùng nhịp bấm — không riêng gì Google, áp dụng
// chung cho Facebook/Apple/Microsoft. Lỗi tải (mất mạng, thiếu script CSP...) bỏ qua trong lúc
// preload — nút vẫn tự thử tải lại lúc bấm (có xử lý lỗi ở loginWith*() đầy đủ).
export function preloadOAuthProviders() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (googleClientId) void loadGoogleScript().catch(() => undefined)

  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined
  if (facebookAppId) void loadFacebookScript(facebookAppId).catch(() => undefined)

  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined
  if (appleClientId) void loadAppleScript().catch(() => undefined)

  const microsoftClientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined
  if (microsoftClientId) void loadMicrosoftScript().catch(() => undefined)
}
