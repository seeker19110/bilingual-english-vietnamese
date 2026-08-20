// apps/english/src/components/ReferralVip/ViralShareCardGenerator.tsx — Trình Tạo Ảnh Story Mạng Xã Hội Viral (Facebook / Zalo / Instagram).
import { useState, useRef } from 'react'
import { Download, Check, Copy } from 'lucide-react'
import type { ViralShareCardData } from '../../../../../packages/core-contracts/referralVip.js'

interface ViralShareCardGeneratorProps {
  data: ViralShareCardData
}

export default function ViralShareCardGenerator({ data }: ViralShareCardGeneratorProps) {
  const [downloading, setDownloading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const inviteUrl = `https://www.donghanhcungban.org/dang-ky?ref=${data.referralCode}`

  async function handleDownloadImage() {
    setDownloading(true)
    try {
      // Tạo canvas và vẽ thẻ story
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 800
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Nền gradient đen - tím đậm
      const bgGrad = ctx.createLinearGradient(0, 0, 600, 800)
      bgGrad.addColorStop(0, '#09090b')
      bgGrad.addColorStop(0.5, '#1e1b4b')
      bgGrad.addColorStop(1, '#09090b')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 600, 800)

      // Viền phát sáng
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 4
      ctx.strokeRect(20, 20, 560, 760)

      // Tiêu đề
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🌟 BẠN ĐỒNG HÀNH AI — DONGHANHCUNGBAN.ORG', 300, 80)

      // Avatar & Tên
      ctx.font = '72px sans-serif'
      ctx.fillText(data.avatar, 300, 180)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText(data.name, 300, 240)

      // Thông tin thành tích
      ctx.fillStyle = '#cbd5e1'
      ctx.font = '20px sans-serif'
      ctx.fillText(
        `Chuỗi học: 🔥 ${data.streakDays} ngày · Trình độ: 🎓 ${data.cefrLevel}`,
        300,
        280,
      )

      // Thẻ quà tặng VIP
      ctx.fillStyle = '#312e81'
      ctx.fillRect(60, 330, 480, 240)
      ctx.strokeStyle = '#818cf8'
      ctx.strokeRect(60, 330, 480, 240)

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 26px sans-serif'
      ctx.fillText(`🎁 TẶNG BẠN ${data.vipGiftDays} NGÀY VIP MIỄN PHÍ`, 300, 380)

      ctx.fillStyle = '#ffffff'
      ctx.font = '18px sans-serif'
      ctx.fillText('Trải nghiệm Gia sư AI Song ngữ & Đấu trường 1v1', 300, 420)

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 38px monospace'
      ctx.fillText(data.referralCode, 300, 490)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px sans-serif'
      ctx.fillText('Nhập mã giới thiệu khi đăng ký tại website', 300, 530)

      // Footer link
      ctx.fillStyle = '#a5b4fc'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText('👉 Truy cập ngay: www.donghanhcungban.org', 300, 680)

      const imgData = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = imgData
      a.download = `DongHanh-VIP-${data.referralCode}.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
      <div className="text-center mb-3">
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
          Story / Social Card
        </span>
        <h4 className="text-sm font-bold text-white mt-1">Ảnh Thẻ Chia Sẻ Tặng 7 Ngày VIP</h4>
      </div>

      {/* Preview Card */}
      <div
        ref={cardRef}
        className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/60 via-zinc-900 to-zinc-950 border border-amber-500/40 text-center shadow-lg my-3"
      >
        <div className="text-4xl mb-2">{data.avatar}</div>
        <h5 className="text-base font-bold text-white">{data.name}</h5>
        <div className="text-xs text-zinc-300 mt-0.5">
          🔥 {data.streakDays} ngày chuỗi · 🎓 Cấp độ {data.cefrLevel}
        </div>

        <div className="my-3 p-3.5 rounded-xl bg-indigo-900/40 border border-indigo-500/40">
          <div className="text-xs font-bold text-amber-400">🎁 TẶNG BẠN 7 NGÀY VIP MIỄN PHÍ</div>
          <div className="my-1.5 font-mono text-lg font-black text-white tracking-widest bg-zinc-950/80 py-1 rounded-lg border border-zinc-800">
            {data.referralCode}
          </div>
          <div className="text-[10px] text-zinc-400">
            Trải nghiệm trọn vẹn Gia sư AI & Đấu trường 1v1
          </div>
        </div>

        <div className="text-[11px] font-semibold text-indigo-300">www.donghanhcungban.org</div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={handleCopyLink}
          className="tap-44 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copiedLink ? 'Đã sao chép' : 'Chép link'}</span>
        </button>

        <button
          type="button"
          disabled={downloading}
          onClick={handleDownloadImage}
          className="tap-44 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Đang tạo...' : 'Tải ảnh Story'}</span>
        </button>
      </div>
    </div>
  )
}
