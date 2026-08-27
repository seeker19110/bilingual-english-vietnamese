// src/components/CompanionLinkSection.tsx — Khối "Người thân theo dõi" trong trang Hồ sơ.
//
// Đặc tả: docs/research/dac-ta-nguoi-dong-hanh-2026-08-26.md
//
// Ba điều giao diện này BẮT BUỘC nói rõ, vì chúng là luật riêng tư chứ không phải văn quảng cáo:
//   1. Người thân chỉ nhận BÁO CÁO TUẦN qua email — không xem được gì theo thời gian thực.
//   2. Danh sách những gì họ thấy là ĐÓNG, liệt kê thẳng ra đây để người học tự quyết.
//   3. Gỡ lúc nào cũng được, gỡ là ngừng ngay.

import { useEffect, useState } from 'react'
import { HeartHandshake, Copy, Check, Trash2, Loader2 } from 'lucide-react'
import {
  fetchCompanionLinks,
  createCompanionInvite,
  redeemCompanionInvite,
  removeCompanionLink,
  type CompanionLinkState,
  type InviteCode,
} from '../lib/companionLink'

// Đúng những gì một người theo dõi nhìn thấy — khớp WeeklyReportDataSchema (contract). Đổi ở
// contract mà quên đổi ở đây là nói dối người dùng, nên hai chỗ phải sửa cùng nhau.
const VISIBLE_FIELDS = [
  'Số ngày đã học trong tuần',
  'Chuỗi ngày học liên tiếp',
  'Số lượt học/ôn từ vựng',
  'Trình độ đang học và phần trăm hoàn thành',
]

const HIDDEN_FIELDS = [
  'Nội dung trò chuyện với Bạn Đồng Hành',
  'Nhật ký cảm xúc, ghi chú riêng tư',
  'Bài viết, bài nói và lỗi sai cụ thể',
  'Vị trí, bạn bè, lịch sử thanh toán',
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

export default function CompanionLinkSection() {
  const [state, setState] = useState<CompanionLinkState | null>(null)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState<InviteCode | null>(null)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    let alive = true
    fetchCompanionLinks().then((s) => {
      if (!alive) return
      setState(s)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  async function reload() {
    setState(await fetchCompanionLinks())
  }

  async function handleCreate() {
    setCreating(true)
    const res = await createCompanionInvite()
    setCreating(false)
    if (!res) {
      setMessage({ kind: 'err', text: 'Không tạo được mã — thử lại sau' })
      return
    }
    setInvite(res)
    setMessage(null)
  }

  async function handleCopy() {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard — mã vẫn hiện trên màn hình để đọc/gõ tay.
    }
  }

  async function handleRedeem() {
    if (code.trim().length < 8) return
    setRedeeming(true)
    const res = await redeemCompanionInvite(code)
    setRedeeming(false)
    if (res.ok) {
      setCode('')
      setMessage({ kind: 'ok', text: `Bạn đang theo dõi việc học của ${res.name}` })
      await reload()
    } else {
      setMessage({ kind: 'err', text: res.message })
    }
  }

  async function handleRemove(linkId: string) {
    if (await removeCompanionLink(linkId)) await reload()
  }

  // Chưa đăng nhập/mạng lỗi → ẩn hẳn khối, không dựng khung lỗi giữa trang Hồ sơ.
  if (!loading && !state) return null

  return (
    <section
      id="companion-link-section"
      className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-in"
    >
      <div className="flex items-center gap-2 mb-3">
        <HeartHandshake className="w-4 h-4 text-accent-400 theme-light:text-accent-800" />
        <h2 className="text-sm font-semibold text-white">Người thân theo dõi</h2>
      </div>

      {loading || !state ? (
        <div className="h-16 rounded-xl bg-zinc-800/50 animate-pulse" />
      ) : (
        <>
          <p className="text-xs text-zinc-300 mb-3">
            Mời bố mẹ hoặc thầy cô nhận <strong>báo cáo tuần</strong> qua email vào tối chủ nhật. Họ
            không xem được gì theo thời gian thực, và bạn gỡ lúc nào cũng được.
          </p>

          <details className="mb-4 rounded-xl bg-zinc-800/40 border border-zinc-700/60 px-3 py-2">
            <summary className="tap-44 cursor-pointer text-xs font-medium text-zinc-200 py-1">
              Họ thấy được những gì?
            </summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-emerald-300 theme-light:text-emerald-800 mb-1">
                  Họ thấy
                </p>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  {VISIBLE_FIELDS.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-300 theme-light:text-rose-800 mb-1">
                  Họ KHÔNG thấy
                </p>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  {HIDDEN_FIELDS.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>

          {/* ── Mời người thân ────────────────────────────────────────────── */}
          {invite ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <code className="flex-1 min-w-0 truncate bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest text-accent-400 theme-light:text-accent-800">
                  {invite.code}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Sao chép mã mời"
                  className="tap-44 shrink-0 flex items-center gap-1.5 rounded-xl bg-accent-500/15 border border-accent-500/30 px-3 py-2.5 text-xs font-medium text-accent-400 theme-light:text-accent-800 hover:bg-accent-500/25 transition"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã chép' : 'Chép mã'}
                </button>
              </div>
              <p className="text-xs text-zinc-300">
                Mã dùng được <strong>một lần</strong>, hết hạn lúc{' '}
                {new Date(invite.expiresAt).toLocaleString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })}
                . Gửi riêng cho đúng người bạn muốn.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="tap-44 mb-4 w-full rounded-xl bg-accent-500/15 border border-accent-500/30 px-3 py-2.5 text-xs font-medium text-accent-400 theme-light:text-accent-800 hover:bg-accent-500/25 transition disabled:opacity-60"
            >
              {creating ? 'Đang tạo mã…' : 'Tạo mã mời người thân'}
            </button>
          )}

          {/* ── Ai đang theo dõi mình ─────────────────────────────────────── */}
          {state.watchers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-zinc-200 mb-2">Đang theo dõi bạn</h3>
              <ul className="space-y-2">
                {state.watchers.map((w) => (
                  <li
                    key={w.linkId}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2"
                  >
                    <span className="flex-1 min-w-0 truncate text-xs text-zinc-100">
                      {w.name}
                      {w.lastReportAt && (
                        <span className="text-zinc-300">
                          {' '}
                          · thư gần nhất {formatDate(w.lastReportAt)}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleRemove(w.linkId)}
                      aria-label={`Ngừng chia sẻ với ${w.name}`}
                      className="tap-44 shrink-0 rounded-lg p-2 text-zinc-300 hover:text-rose-300 theme-light:hover:text-rose-800 hover:bg-zinc-700/60 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Mình theo dõi ai ──────────────────────────────────────────── */}
          <div className="border-t border-zinc-800 pt-3">
            <h3 className="text-xs font-semibold text-zinc-200 mb-2">
              Có người mời bạn theo dõi họ?
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="companion-code" className="sr-only">
                Mã mời theo dõi
              </label>
              <input
                id="companion-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã mời"
                autoComplete="off"
                className="flex-1 min-w-0 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2.5 text-base font-mono tracking-widest text-zinc-100 placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={handleRedeem}
                disabled={redeeming || code.trim().length < 8}
                className="tap-44 shrink-0 rounded-xl bg-accent-500/15 border border-accent-500/30 px-3 py-2.5 text-xs font-medium text-accent-400 theme-light:text-accent-800 hover:bg-accent-500/25 transition disabled:opacity-60"
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Dùng mã'}
              </button>
            </div>

            {state.following.length > 0 && (
              <ul className="mt-3 space-y-2">
                {state.following.map((f) => (
                  <li
                    key={f.linkId}
                    className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2"
                  >
                    <span className="flex-1 min-w-0 truncate text-xs text-zinc-100">
                      Bạn đang theo dõi {f.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleRemove(f.linkId)}
                      aria-label={`Ngừng theo dõi ${f.name}`}
                      className="tap-44 shrink-0 rounded-lg p-2 text-zinc-300 hover:text-rose-300 theme-light:hover:text-rose-800 hover:bg-zinc-700/60 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {message && (
            <p
              role="status"
              className={`mt-3 text-xs ${message.kind === 'ok' ? 'text-emerald-300 theme-light:text-emerald-800' : 'text-rose-300 theme-light:text-rose-800'}`}
            >
              {message.text}
            </p>
          )}
        </>
      )}
    </section>
  )
}
