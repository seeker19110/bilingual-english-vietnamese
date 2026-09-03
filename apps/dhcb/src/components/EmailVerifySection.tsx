// src/components/EmailVerifySection.tsx — Khối xác thực email trong trang Hồ sơ.
// Chỉ hiện khi email CHƯA xác thực. Xác thực xong thì khối tự biến mất.
//
// Vì sao không ép xác thực mới cho học: app miễn phí cho cộng đồng, chặn cứng sẽ đuổi cả người
// học thật (mail vào spam, gõ nhầm email, học sinh không rành). Xác thực chỉ mở khoá phần
// THƯỞNG mời bạn (api/_lib/referral.ts) và quà dùng thử Pro 14 ngày (api/_lib/trial.ts) —
// riêng tài khoản Google/Facebook/Apple/Microsoft được cấp quà này NGAY lúc đăng nhập lần đầu
// (4 kênh OAuth đó đã tự xác minh email cho ta rồi), chỉ email/password mới cần bước này.

import { useState } from 'react'
import { MailCheck, Loader2 } from 'lucide-react'
import { Button } from '@core/Button'
import { getAuthHeader } from '@core/authHeader'
import { useToast } from '@core/ToastProvider'

// Trạng thái gửi mail từ server (xem api/_lib/mailer.ts) — quyết định thông báo hiện cho user.
type MailStatus = 'sent' | 'rejected' | 'not_configured' | 'error' | 'quota_exceeded'

async function postAuth(body: Record<string, unknown>): Promise<{
  ok: boolean
  error?: string
  mail?: MailStatus
  trialGranted?: boolean
  trialDays?: number
}> {
  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      mail?: MailStatus
      trialGranted?: boolean
      trialDays?: number
    }
    return res.ok
      ? { ok: true, mail: data.mail, trialGranted: data.trialGranted, trialDays: data.trialDays }
      : { ok: false, error: data.error }
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

  // Báo cho người dùng đúng tình trạng gửi thật, thay vì luôn nói "đã gửi".
  // 'rejected' = máy chủ nhận từ chối thẳng địa chỉ → gần như chắc chắn gõ sai email, nên MỞ
  // LUÔN ô đổi email cho họ sửa ngay thay vì bắt tự mò.
  function handleMailStatus(mail?: MailStatus) {
    if (mail === 'rejected') {
      setEditing(true)
      toast.error(
        isA
          ? 'Không gửi được tới email này — có thể bạn nhập sai. Kiểm tra và đổi lại nhé.'
          : 'That address rejected the email — it may be wrong. Please check and change it.',
      )
      return
    }
    if (mail === 'quota_exceeded') {
      // Hệ thống đã gửi hết hạn mức thư trong ngày — lỗi phía mình, không phải lỗi người dùng.
      toast.error(
        isA
          ? 'Hệ thống đang quá tải gửi mã, vui lòng thử lại sau vài giờ.'
          : 'We have hit our daily sending limit — please try again in a few hours.',
      )
      return
    }
    if (mail === 'not_configured' || mail === 'error') {
      // Lỗi phía máy chủ, KHÔNG phải lỗi email người dùng — đừng đổ lỗi cho họ.
      toast.error(
        isA
          ? 'Hệ thống gửi mail đang trục trặc, thử lại sau ít phút nhé.'
          : 'Our mail service is having trouble — please try again shortly.',
      )
      return
    }
    toast.success(isA ? 'Đã gửi mã, kiểm tra hộp thư nhé' : 'Code sent — check your inbox')
  }

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
      setEditing(false)
      setPassword('')
      setNewEmail('')
      setSent(true)
      handleMailStatus(r.mail)
      onVerified() // refresh() để trang đọc lại email mới
    } else {
      toast.error(r.error ?? (isA ? 'Không đổi được email' : 'Could not change email'))
    }
  }

  async function handleSend() {
    setSending(true)
    const r = await postAuth({ action: 'send-verification' })
    setSending(false)
    if (!r.ok) {
      toast.error(r.error ?? (isA ? 'Không gửi được mã' : 'Could not send code'))
      return
    }
    setSent(true)
    handleMailStatus(r.mail)
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
      // Chỉ khoe quà khi server XÁC NHẬN vừa cấp (trialGranted) — người xác thực lại lần sau
      // (vd sau khi đổi email) không được nhận nữa, không hứa hão.
      const days = r.trialDays ?? 14
      toast.success(
        r.trialGranted
          ? isA
            ? `Đã xác thực email! Tặng bạn ${days} ngày dùng thử gói Pro 🎁`
            : `Email verified! Enjoy ${days} days of Pro on us 🎁`
          : isA
            ? 'Đã xác thực email!'
            : 'Email verified!',
      )
      onVerified()
    } else {
      toast.error(r.error ?? (isA ? 'Mã không đúng' : 'Invalid code'))
    }
  }

  return (
    <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <MailCheck className="w-4 h-4 text-amber-400 theme-light:text-amber-900" />
        <h2 className="text-sm font-semibold text-amber-100 theme-light:text-amber-900">
          {isA ? 'Xác thực email' : 'Verify your email'}
        </h2>
      </div>
      <p className="text-xs text-amber-200/80 theme-light:text-amber-800 mb-1">
        {isA
          ? 'Xác thực email để nhận 14 ngày dùng thử gói Pro (tặng 1 lần) và mở khoá thưởng mời bạn. Bạn vẫn học bình thường nếu chưa xác thực.'
          : 'Verify your email for a one-time 14-day Pro trial and to unlock invite rewards. You can keep learning without it.'}
      </p>
      <p className="text-xs text-amber-200/60 theme-light:text-amber-900 mb-3 break-all">
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
            className="tap-44 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 transition-colors border border-amber-500/40 px-4 py-2.5 text-sm font-semibold text-amber-100 theme-light:text-amber-900 disabled:opacity-60"
          >
            {changing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isA ? 'Đổi email & gửi mã mới' : 'Change email & send new code'}
          </button>
        </div>
      )}

      {/* Máy chủ nhận CHẤP NHẬN thư không có nghĩa là thư vào được hộp thư: có thể bị trả lại
          sau đó hoặc rơi vào thư rác, và những việc đó báo về bất đồng bộ nên không thể biết
          ngay. Vì vậy luôn cho người dùng lối thoát thay vì để họ ngồi chờ mã không bao giờ tới. */}
      {sent && (
        <p className="text-xs text-amber-200/70 theme-light:text-amber-800 mb-3">
          {isA
            ? 'Chưa nhận được sau vài phút? Xem thư rác/quảng cáo — hoặc email có thể sai, bấm "Sai email? Đổi" ở trên.'
            : 'Nothing after a few minutes? Check spam — or the address may be wrong, use "Wrong email? Change" above.'}
        </p>
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
        <Button
          onClick={handleVerify}
          disabled={code.length !== 6}
          loading={verifying}
          loadingLabel={isA ? 'Đang xác thực' : 'Verifying'}
          className="shrink-0"
        >
          {isA ? 'Xác thực' : 'Verify'}
        </Button>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        className="tap-44 mt-2 text-xs text-amber-300 theme-light:text-amber-800 hover:text-amber-200 transition-colors underline underline-offset-2 disabled:opacity-60"
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
