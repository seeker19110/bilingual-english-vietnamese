// src/components/ShareResultCard.tsx — Nút "Chia sẻ kết quả" dùng chung cho màn chấm điểm
// Chat (EvaluationResultView) và tổng kết tuần Challenge. Vẽ 1 ảnh PNG bằng <canvas> ở client
// (không gọi server), rồi dùng Web Share API (mobile, nếu hỗ trợ chia sẻ file) hoặc tải file
// PNG về (desktop / trình duyệt không hỗ trợ). Không tự đăng lên mạng xã hội nào.
//
// Props linh hoạt (title + lines) để tái dùng ở cả 2 nơi — nội dung title/lines tính sẵn bằng
// hàm thuần ở src/lib/shareContent.ts (dễ test, không đụng canvas).

import { Share2 } from 'lucide-react'
import { useState } from 'react'
import { track } from '../lib/analytics'
import { fetchReferralStats, buildReferralLink } from '../lib/referral'
import { claimShareQuest } from '../lib/quests'
import { useToast } from '../context/ToastProvider'

const BASE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://en-vi.donghanhcungban.com'

const CANVAS_W = 1080
const CANVAS_H = 1080

// Vẽ ảnh kết quả lên canvas. Dùng font hệ thống mặc định (không nhúng font riêng) để tránh lỗi
// hiển thị dấu tiếng Việt trên các trình duyệt/headless khác nhau.
function drawShareImage(
  canvas: HTMLCanvasElement,
  appName: string,
  title: string,
  lines: string[],
  linkText: string,
) {
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Nền gradient màu thương hiệu — giá trị cố định gần với theme mặc định "Xanh đêm"
  // (đơn giản, chạy đúng mọi nơi thay vì đọc động --a-* qua getComputedStyle của 1 element
  // có thể chưa mount/không tồn tại khi export ảnh).
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
  gradient.addColorStop(0, '#0f172a')
  gradient.addColorStop(1, '#134e4a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#34d399' // accent-400
  ctx.font = '600 42px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillText(appName, CANVAS_W / 2, 160)

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 64px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  wrapText(ctx, title, CANVAS_W / 2, 320, CANVAS_W - 160, 76)

  ctx.font = '400 40px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillStyle = '#e2e8f0'
  let y = 480
  for (const line of lines) {
    ctx.fillText(line, CANVAS_W / 2, y)
    y += 64
  }

  ctx.font = '400 32px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText(linkText.replace(/^https?:\/\//, ''), CANVAS_W / 2, CANVAS_H - 80)
}

// Xuống dòng thủ công trên canvas theo maxWidth (canvas không tự wrap text).
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY)
      line = word
      curY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, curY)
}

export interface ShareResultCardProps {
  title: string
  lines: string[]
  isA: boolean
  appName?: string
}

// Nút "Chia sẻ kết quả" — vẽ ảnh, gọi track('share_click'), rồi share/tải về.
export default function ShareResultCard({
  title,
  lines,
  isA,
  appName = 'Gia sư tiếng Anh AI',
}: ShareResultCardProps) {
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  async function handleShare() {
    // Gọi track TRƯỚC khi chia sẻ/tải — không block nếu track lỗi (track() tự nuốt lỗi mạng).
    track('share_click')

    setBusy(true)
    try {
      // Gắn MÃ MỜI của chính người chia sẻ vào link in trên ảnh → mỗi lượt khoe thành tích
      // cũng là một lời mời, người xem quét/gõ link vào là đã tính cho người chia sẻ.
      // Lấy mã ngay lúc bấm (không lấy sẵn lúc render) để không tốn 1 request cho mọi người
      // chỉ xem kết quả mà không chia sẻ. Lỗi/chưa có mã → rơi về link trần, vẫn chia sẻ được.
      const stats = await fetchReferralStats()
      const linkText = stats ? buildReferralLink(stats.code) : BASE_URL

      const canvas = document.createElement('canvas')
      drawShareImage(canvas, appName, title, lines, linkText)

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png'),
      )
      if (!blob) return

      const fileName = 'ket-qua.png'
      const file = new File([blob], fileName, { type: 'image/png' })

      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>
        canShare?: (data: ShareData) => boolean
      }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          // Kèm link mời dạng CHỮ nữa: ảnh thì đẹp nhưng bấm không được, người nhận phải gõ tay.
          await nav.share({ files: [file], title, text: `${title}\n${linkText}` })
          // Promise chỉ resolve khi người dùng ĐÃ CHỌN nơi chia sẻ (không huỷ) — tín hiệu tốt
          // nhất hiện có, dù KHÔNG chứng minh được họ đã đăng công khai thật (xem cảnh báo ở
          // api/_lib/quests.ts). Gọi sau khi share xong, không chặn/làm chậm luồng share.
          void claimShareQuest().then((days) => {
            if (!days) return
            toast.success(
              isA
                ? `Cảm ơn bạn đã chia sẻ! Tặng thêm ${days} ngày dùng gói Pro 🎁`
                : `Thanks for sharing! Here's ${days} extra day of Pro on us 🎁`,
            )
          })
          return
        } catch {
          // Người dùng huỷ chia sẻ hoặc trình duyệt lỗi — rơi xuống tải file bên dưới.
        }
      }

      // Fallback: tải file PNG về máy.
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      disabled={busy}
      aria-label={isA ? 'Chia sẻ kết quả' : 'Share result'}
      className="tap-44 w-full flex items-center justify-center gap-2 bg-accent-500/10 border border-accent-500/30 hover:bg-accent-500/15 text-accent-400 theme-light:text-accent-800 rounded-xl py-3 text-sm font-medium transition active:scale-[0.99] disabled:opacity-60"
    >
      <Share2 className="w-4 h-4" />
      {busy
        ? isA
          ? 'Đang tạo ảnh...'
          : 'Creating image...'
        : isA
          ? 'Chia sẻ kết quả'
          : 'Share result'}
    </button>
  )
}
