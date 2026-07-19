// src/lib/auth.ts — Đăng nhập/đăng ký (Giai đoạn B: gọi /api/auth tự viết, thay Supabase Auth).
// Giữ NGUYÊN chữ ký export (register/login/loginWithGoogle/logout/getCurrentUser) như cũ để
// AuthProvider.tsx + Login.tsx không phải sửa nơi gọi.
import { setStoredToken, clearStoredToken, getAuthHeader } from './authHeader'
import type { User as AppUser, Plan } from '../types'

interface AuthApiUser {
  id: string
  email: string
  name: string
  plan: Plan
  onboarded: boolean
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

// Đăng nhập bằng Google — dùng Google Identity Services (script tải trong index.html),
// trả về Promise<AppUser|null> thay vì void như bản Supabase cũ (không còn redirect rời
// trang — GIS hiện popup/One Tap ngay trên trang hiện tại).
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          prompt: () => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

let googleInitPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (googleInitPromise) return googleInitPromise
  googleInitPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
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
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        void callAuthApi({ action: 'google', idToken: resp.credential })
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
    })
    window.google!.accounts.id.prompt()
  })
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
  }
  return { ...profile, createdAt: Date.now() }
}

// Giữ export này (dùng ở AuthProvider.tsx khi SIGNED_OUT) — Giai đoạn B không còn cache
// profile riêng trong localStorage (đã gộp vào getCurrentUser gọi thẳng /api/auth?action=me).
export function clearProfileCache() {
  /* no-op — giữ lại export để AuthProvider.tsx không phải sửa import */
}
