// src/lib/twoFactorApi.ts — Gọi /api/two-factor (xác thực hai bước TOTP).
// Nghiệp vụ ở server: packages/core-auth/twoFactor.ts. File này chỉ là lớp gọi mạng + kiểu dữ liệu.

import { getAuthHeader } from '@core/authHeader'

export interface TwoFactorStatus {
  enabled: boolean
  /** Đã sinh secret nhưng chưa nhập mã xác nhận ⇒ 2FA CHƯA có hiệu lực. */
  pending: boolean
  recoveryCodesLeft: number
}

export interface SetupData {
  /** Secret Base32 — hiện cho người dùng gõ tay khi không quét được QR. */
  secret: string
  /** Chuỗi otpauth:// để dựng mã QR. */
  otpauthUri: string
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function call<T>(body: Record<string, unknown> | null): Promise<Result<T>> {
  try {
    const res = await fetch('/api/two-factor', {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) return { ok: false, error: data.error ?? `Lỗi ${res.status}` }
    return { ok: true, data }
  } catch {
    return { ok: false, error: 'Lỗi kết nối, thử lại sau' }
  }
}

export const fetchTwoFactorStatus = () => call<TwoFactorStatus>(null)

export const startTwoFactorSetup = () => call<SetupData>({ action: 'setup' })

export const confirmTwoFactorSetup = (code: string) =>
  call<{ recoveryCodes: string[] }>({ action: 'confirm', code })

export const verifyTwoFactor = (code: string) =>
  call<{ stepUpUntil: string; usedRecoveryCode: boolean }>({ action: 'verify', code })

export const disableTwoFactor = (code: string, password: string) =>
  call<{ ok: true }>({ action: 'disable', code, password })

export const regenerateRecoveryCodes = (code: string) =>
  call<{ recoveryCodes: string[] }>({ action: 'regenerate-recovery', code })
