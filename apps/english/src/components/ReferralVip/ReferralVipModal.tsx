// apps/english/src/components/ReferralVip/ReferralVipModal.tsx — Hộp Thoại Giới Thiệu Bạn Bè Nhận VIP.
import { useState, useEffect } from 'react'
import { X, Gift, Copy, Check, Users, Sparkles, Award } from 'lucide-react'
import type {
  ReferralVipDashboard,
  ReferralMilestoneDefinition,
  RefereeRecord,
} from '../../../../../packages/core-contracts/referralVip.js'
import { fetchReferralVipDashboard } from '../../lib/referralVipApi.js'
import ViralShareCardGenerator from './ViralShareCardGenerator.js'

interface ReferralVipModalProps {
  onClose: () => void
}

export default function ReferralVipModal({ onClose }: ReferralVipModalProps) {
  const [dashboard, setDashboard] = useState<ReferralVipDashboard | null>(null)
  const [milestones, setMilestones] = useState<ReferralMilestoneDefinition[]>([])
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeTab, setActiveTab] = useState<'invite' | 'card' | 'history'>('invite')

  useEffect(() => {
    fetchReferralVipDashboard().then((res) => {
      setDashboard(res.dashboard)
      setMilestones(res.milestones)
    })
  }, [])

  async function handleCopyLink() {
    if (!dashboard) return
    try {
      await navigator.clipboard.writeText(dashboard.inviteUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback
    }
  }

  function handleShareZalo() {
    if (!dashboard) return
    const url = `https://zalo.me/share?url=${encodeURIComponent(dashboard.inviteUrl)}`
    window.open(url, '_blank')
  }

  function handleShareFacebook() {
    if (!dashboard) return
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboard.inviteUrl)}`
    window.open(url, '_blank')
  }

  function handleShareTelegram() {
    if (!dashboard) return
    const text = encodeURIComponent(dashboard.shareTemplates.telegramText)
    const url = `https://t.me/share/url?url=${encodeURIComponent(dashboard.inviteUrl)}&text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/40 shadow-inner">
              🎁
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Mời Bạn Bè — Nhận VIP Toàn Năng
              </h3>
              <p className="text-[11px] text-zinc-400">
                Tặng 7 ngày VIP cho bạn bè · Tích lũy không giới hạn ngày VIP
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="tap-44 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 my-4">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`tap-44 flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'invite'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Mã Mời & Thưởng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`tap-44 flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'card'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thẻ Story Viral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`tap-44 flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bạn Bè ({dashboard?.referees.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Invite & Milestones */}
        {activeTab === 'invite' && dashboard && (
          <div className="space-y-4">
            {/* Banner thống kê VIP */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-900 border border-amber-500/30 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-300">Tổng ngày VIP đã nhận</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  +{dashboard.totalVipDaysEarned} Ngày VIP
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Đã mời thành công: {dashboard.successfulRefereesCount}/{dashboard.totalInvited}{' '}
                  bạn
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-2xl flex items-center justify-center border border-amber-400/40">
                👑
              </div>
            </div>

            {/* Khung Mã mời & Nút sao chép */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <label className="text-xs font-bold text-zinc-300 block mb-2">
                Mã giới thiệu riêng & Đường dẫn đăng ký:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono tracking-wider text-amber-400 truncate">
                  {dashboard.inviteUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="tap-44 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedLink ? 'Đã sao chép' : 'Sao chép link'}</span>
                </button>
              </div>

              {/* Nút chia sẻ nhanh 1 chạm mạng xã hội */}
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-zinc-400">Chia sẻ nhanh:</span>
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="tap-44 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30 transition flex items-center gap-1"
                >
                  <span>💬 Zalo</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="tap-44 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-600/30 transition flex items-center gap-1"
                >
                  <span>🌐 Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="tap-44 px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-bold hover:bg-sky-600/30 transition flex items-center gap-1"
                >
                  <span>✈️ Telegram</span>
                </button>
              </div>
            </div>

            {/* Mốc Thưởng Tích Lũy (Milestone Road) */}
            <div>
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Lộ Trình Mốc Thưởng (Milestone Road)</span>
              </h4>
              <div className="space-y-2">
                {milestones.map((m) => {
                  const isReached = dashboard.successfulRefereesCount >= m.requiredReferees
                  return (
                    <div
                      key={m.tier}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isReached
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isReached
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {m.requiredReferees} bạn
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{m.title}</span>
                            {m.badgeName && (
                              <span className="text-[10px] text-amber-300 px-1.5 py-0.2 rounded bg-amber-500/20">
                                {m.badgeName}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-300">{m.rewardDescription}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isReached ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Đã đạt
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-zinc-500">
                            Cần thêm {m.requiredReferees - dashboard.successfulRefereesCount} bạn
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Story Card Generator */}
        {activeTab === 'card' && (
          <ViralShareCardGenerator
            data={{
              name: 'Người Học Tiên Phong',
              avatar: '🌟',
              streakDays: 14,
              cefrLevel: 'B2',
              referralCode: dashboard?.referralCode || 'DHCB-VIP777',
              vipGiftDays: 7,
              qrPayload: dashboard?.inviteUrl || 'https://www.donghanhcungban.org',
            }}
          />
        )}

        {/* Tab 3: Referees History */}
        {activeTab === 'history' && dashboard && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {dashboard.referees.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Chưa có bạn bè nào đăng ký qua mã của bạn. Hãy chia sẻ link ngay nhé!
              </div>
            ) : (
              dashboard.referees.map((ref: RefereeRecord) => (
                <div
                  key={ref.refereeId}
                  className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                      👤
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{ref.refereeName}</div>
                      <div className="text-[10px] text-zinc-400">{ref.refereeEmailMasked}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {ref.hasCompletedFirstLesson ? (
                      <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        +7 Ngày VIP ✅
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                        Chờ học buổi đầu ⏳
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
