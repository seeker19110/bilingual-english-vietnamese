// src/components/EmailVerifySection.tsx — Khối xác thực email trong trang Hồ sơ.
// Chỉ hiện khi email CHƯA xác thực. Xác thực xong thì khối tự biến mất.
//
// Vì sao không ép xác thực mới cho học: app miễn phí cho cộng đồng, chặn cứng sẽ đuổi cả người
// học thật (mail vào spam, gõ nhầm email, học sinh không rành). Xác thực chỉ mở khoá phần
// THƯỞNG mời bạn — xem api/_lib/referral.ts.

import { useState } from 'react'
import { MailCheck, Loader2 } from 'lucide-react'
import { getAuthHeader } from '../lib/authHeader'
import { useToast } from '../context/ToastProvider'

async function postAuth(body: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    return res.ok ? { ok: true } : { ok: false, error: data.error }
  } catch {
    return { ok: false, error: 'Lỗi kết nối, thử lại sau' }
  }
}

export default function EmailVerifySection({
  isA,
  currentEmail,
  onVerified,
}: {
  isA: boolean
  currentEmail: string
  onVerified: () => void
}) {
  const toast = useToast()
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sent, setSent] = useState(false)

  // Đổi email — cho người gõ nhầm email lúc đăng ký tự sửa, nếu không họ kẹt vĩnh viễn
  // (không nhận được mã → không xác thực được → không mở khoá thưởng mời bạn).
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [changing, setChanging] = useState(false)

  async function handleChangeEmail() {
    const email = newEmail.trim()
    if (!email.includes('@')) {
      toast.error(isA ? 'Email không hợp lệ' : 'Invalid email')
      return
    }
    setChanging(true)
    const r = await postAuth({
      action: 'change-email',
      newEmail: email,
      // Tài khoản đăng nhập bằng Google không có mật khẩu — bỏ trống, server tự bỏ qua.
      ...(password ? { password } : {}),
    })
    setChanging(false)
    if (r.ok) {
      toast.success(
        isA ? 'Đã đổi email, mã mới đã gửi tới hộp thư mới' : 'Email changed — new code sent',
      )
      setEditing(false)
      setPassword('')
      setNewEmail('')
      setSent(true)
      onVerified() // refresh() để trang đọc lại email mới
    } else {
      toast.error(r.error ?? (isA ? 'Không đổi được email' : 'Could not change email'))
    }
  }

  async function handleSend() {
    setSending(true)
    const r = await postAuth({ action: 'send-verification' })
    setSending(false)
    if (r.ok) {
      setSent(true)
      toast.success(isA ? 'Đã gửi mã, kiểm tra hộp thư nhé' : 'Code sent — check your inbox')
    } else {
      toast.error(r.error ?? (isA ? 'Không gửi được mã' : 'Could not send code'))
    }
  }

  async function handleVerify() {
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error(isA ? 'Mã gồm 6 chữ số' : 'The code has 6 digits')
      return
    }
    setVerifying(true)
    const r = await postAuth({ action: 'verify-email', code: code.trim() })
    setVerifying(false)
    if (r.ok) {
      toast.success(isA ? 'Đã xác thực email!' : 'Email verified!')
      onVerified()
    } else {
      toast.error(r.error ?? (isA ? 'Mã không đúng' : 'Invalid code'))
    }
  }

  return (
    <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <MailCheck className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-amber-100 theme-light:text-amber-900">
          {isA ? 'Xác thực email' : 'Verify your email'}
        </h2>
      </div>
      <p className="text-xs text-amber-200/80 theme-light:text-amber-800 mb-1">
        {isA
          ? 'Xác thực email để mở khoá phần thưởng khi mời bạn. Bạn vẫn học bình thường nếu chưa xác thực.'
          : 'Verify your email to unlock invite rewards. You can keep learning without it.'}
      </p>
      <p className="text-xs text-amber-200/60 theme-light:text-amber-700 mb-3 break-all">
        {isA ? 'Mã gửi tới: ' : 'Code sent to: '}
        <strong className="font-semibold">{currentEmail}</strong>
        {' · '}
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="underline underline-offset-2"
        >
          {isA ? 'Sai email? Đổi' : 'Wrong email? Change'}
        </button>
      </p>

      {editing && (
        <div className="mb-3 space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <input
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={isA ? 'Email mới' : 'New email'}
            aria-label={isA ? 'Email mới' : 'New email'}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              isA
                ? 'Mật khẩu hiện tại (bỏ trống nếu dùng Google)'
                : 'Current password (skip for Google)'
            }
            aria-label={isA ? 'Mật khẩu hiện tại' : 'Current password'}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white"
          />
          <button
            type="button"
            onClick={handleChangeEmail}
            disabled={changing}
            className="tap-44 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 text-sm font-semibold text-amber-100 theme-light:text-amber-900 disabled:opacity-60"
          >
            {changing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isA ? 'Đổi email & gửi mã mới' : 'Change email & send new code'}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder={isA ? 'Nhập mã 6 chữ số' : 'Enter 6-digit code'}
          aria-label={isA ? 'Mã xác thực email' : 'Email verification code'}
          className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm tracking-widest text-white"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || code.length !== 6}
          className="tap-44 shrink-0 flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
          {isA ? 'Xác thực' : 'Verify'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="tap-44 mt-2 text-xs text-amber-300 theme-light:text-amber-800 underline underline-offset-2 disabled:opacity-60"
      >
        {sending
          ? isA
            ? 'Đang gửi...'
            : 'Sending...'
          : sent
            ? isA
              ? 'Gửi lại mã'
              : 'Resend code'
            : isA
              ? 'Gửi mã tới email của tôi'
              : 'Send code to my email'}
      </button>
    </section>
  )
}
