// src/components/UpgradeSection.tsx — Khối "Nâng cấp Pro/VIP" trong trang Hồ sơ.
//
// SePay KHÔNG redirect người dùng về sau khi chuyển khoản (khác cổng trung gian như PayOS) —
// nên luồng ở đây KHÔNG rời khỏi app: chọn gói → hiện mã QR ngay trong trang → người dùng quét
// chuyển khoản → component tự POLL /api/payment-status cho tới khi thấy 'paid'. Xem đặc tả:
// docs/research/dac-ta-thanh-toan-2026-07-25.md.

import { useEffect, useRef, useState } from 'react'
import { Crown, Copy, Check, Loader2, Sparkles } from 'lucide-react'
import {
  createCheckout,
  fetchPaymentStatus,
  fetchPlanPrices,
  type PayableCycle,
  type PayablePlan,
  type PlanPrices,
  type CheckoutResult,
} from '../lib/payment'
import { useToast } from '../context/ToastProvider'

const CYCLE_LABEL: Record<PayableCycle, { vi: string; en: string }> = {
  '10day': { vi: '10 ngày', en: '10 days' },
  month: { vi: 'Tháng', en: 'Month' },
  year: { vi: 'Năm', en: 'Year' },
}

const POLL_INTERVAL_MS = 4000

function formatVnd(n: number): string {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function UpgradeSection({
  isA,
  currentPlan,
}: {
  isA: boolean
  currentPlan: string
}) {
  const toast = useToast()
  const [prices, setPrices] = useState<PlanPrices | null>(null)
  const [plan, setPlan] = useState<PayablePlan>('pro')
  const [cycle, setCycle] = useState<PayableCycle>('month')
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null)
  const [creating, setCreating] = useState(false)
  const [paid, setPaid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchPlanPrices().then(setPrices)
  }, [])

  // Dừng poll/đếm ngược khi rời trang — tránh gọi API vô ích sau khi component unmount.
  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (tickRef.current) clearInterval(tickRef.current)
    },
    [],
  )

  // Đã là VIP → không cần chào mua nữa (Pro thấp hơn VIP, không có gì để chào thêm).
  if (currentPlan === 'vip') return null

  async function handleCreateCheckout() {
    setCreating(true)
    const r = await createCheckout(plan, cycle)
    setCreating(false)
    if (!r.ok) {
      toast.error(r.error)
      return
    }
    setCheckout(r.data)
    setPaid(false)
    startCountdown(r.data.expiresAt)
    startPolling(r.data.paymentCode)
  }

  function startCountdown(expiresAt: string) {
    if (tickRef.current) clearInterval(tickRef.current)
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left <= 0 && tickRef.current) clearInterval(tickRef.current)
    }
    tick()
    tickRef.current = setInterval(tick, 1000)
  }

  function startPolling(code: string) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const status = await fetchPaymentStatus(code)
      if (status?.status === 'paid') {
        setPaid(true)
        if (pollRef.current) clearInterval(pollRef.current)
        if (tickRef.current) clearInterval(tickRef.current)
      } else if (status?.status === 'expired' || status?.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }, POLL_INTERVAL_MS)
  }

  async function copyCode() {
    if (!checkout) return
    try {
      await navigator.clipboard.writeText(checkout.paymentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard — mã vẫn hiện sẵn để người dùng tự gõ.
    }
  }

  function reset() {
    setCheckout(null)
    setPaid(false)
    if (pollRef.current) clearInterval(pollRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <section
      id="upgrade-section"
      className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-4 animate-fade-in scroll-mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">
          {isA ? 'Nâng cấp Pro/VIP' : 'Upgrade to Pro/VIP'}
        </h2>
      </div>

      {paid ? (
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white mb-1">
            {isA ? 'Thanh toán thành công! 🎉' : 'Payment successful! 🎉'}
          </p>
          <p className="text-xs text-zinc-400">
            {isA
              ? 'Tải lại trang để thấy gói mới nếu chưa cập nhật.'
              : 'Reload if plan not updated yet.'}
          </p>
        </div>
      ) : checkout ? (
        <div>
          <div className="flex justify-center mb-3">
            <img
              src={checkout.qrUrl}
              alt={isA ? 'Mã QR chuyển khoản' : 'Bank transfer QR code'}
              className="w-48 h-48 rounded-xl border border-zinc-700 bg-white p-1"
            />
          </div>
          <div className="space-y-1.5 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">{isA ? 'Số tiền' : 'Amount'}</span>
              <span className="font-semibold text-white">{formatVnd(checkout.amountVnd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isA ? 'Ngân hàng' : 'Bank'}</span>
              <span className="text-white">{checkout.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{isA ? 'Số tài khoản' : 'Account'}</span>
              <span className="text-white font-mono">{checkout.bankAccount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">{isA ? 'Nội dung CK' : 'Transfer content'}</span>
              <button
                type="button"
                onClick={copyCode}
                className="flex items-center gap-1 text-white font-mono bg-zinc-800 px-2 py-1 rounded-lg"
              >
                {checkout.paymentCode}
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-amber-300 theme-light:text-amber-800 mb-3">
            {isA
              ? `Chuyển ĐÚNG nội dung ở trên — sai nội dung sẽ không tự động ghi nhận. Mã hết hạn sau ${mm}:${ss}.`
              : `Transfer with EXACT content above — wrong content won't auto-confirm. Code expires in ${mm}:${ss}.`}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 mb-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {isA ? 'Đang chờ chuyển khoản...' : 'Waiting for transfer...'}
          </div>
          <button
            type="button"
            onClick={reset}
            className="w-full text-xs text-zinc-400 underline underline-offset-2"
          >
            {isA ? 'Huỷ, chọn gói khác' : 'Cancel, pick another plan'}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-3">
            {(['pro', 'vip'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${
                  plan === p
                    ? 'bg-amber-500/15 text-amber-300 theme-light:text-amber-800 border-amber-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                }`}
              >
                {p === 'pro' ? (isA ? 'Pro' : 'Pro') : 'VIP'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            {(['10day', 'month', 'year'] as const).map((c) => {
              const entry = prices?.[plan][c]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCycle(c)}
                  className={`flex-1 py-2 rounded-xl text-xs border ${
                    cycle === c
                      ? 'bg-accent-500/15 text-accent-300 theme-light:text-accent-800 border-accent-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <div className="font-semibold">{isA ? CYCLE_LABEL[c].vi : CYCLE_LABEL[c].en}</div>
                  <div>{entry ? formatVnd(entry.effectiveVnd) : '…'}</div>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={handleCreateCheckout}
            disabled={creating || !prices}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold text-sm disabled:opacity-60"
          >
            {creating
              ? isA
                ? 'Đang tạo đơn...'
                : 'Creating order...'
              : isA
                ? `Nâng cấp ${plan.toUpperCase()}`
                : `Upgrade to ${plan.toUpperCase()}`}
          </button>
        </div>
      )}
    </section>
  )
}
