// src/components/AvatarSpeaking.tsx — Avatar robot 2D đổi hình miệng theo audio đang phát.
// Đổi từ phong cách "khuôn mặt người vẽ tay" sang "robot AI" theo yêu cầu người dùng — vẫn là
// SVG THUẦN vẽ tay (không dùng ảnh/asset ngoài, không phải ảnh robot thật/AI-generated có rủi ro
// bản quyền) để giữ nguyên tắc băng thông thấp. Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md.

import { useEffect, useRef, useState } from 'react'
import { visemeAtTime, type Viseme, type VisemeFrame } from '../lib/viseme'

interface AvatarSpeakingProps {
  audioEl: HTMLAudioElement | null
  timeline: VisemeFrame[]
  isPlaying: boolean
}

// Miệng robot vẽ dạng "màn hình LED" hình chữ nhật bo góc — đổi RỘNG/CAO theo viseme thay vì vẽ
// môi/răng (không phù hợp thẩm mỹ robot). Toạ độ tâm cố định (50, 64), chỉ đổi kích thước.
interface MouthLed {
  width: number
  height: number
  // Số thanh chia dọc bên trong (tạo cảm giác "loa LED" nhiều đoạn) — nhiều hơn khi miệng mở to.
  bars: number
}

const MOUTH_LEDS: Record<Viseme, MouthLed> = {
  REST: { width: 14, height: 3, bars: 1 },
  PP: { width: 8, height: 2, bars: 1 }, // môi khép (p/b/m) — thanh LED thu nhỏ nhất
  FF: { width: 16, height: 3, bars: 2 }, // răng chạm môi dưới
  AA: { width: 22, height: 12, bars: 4 }, // miệng mở rộng — LED cao nhất
  OO: { width: 12, height: 10, bars: 1 }, // môi tròn — LED gần vuông, bo tròn nhiều
}

export default function AvatarSpeaking({ audioEl, timeline, isPlaying }: AvatarSpeakingProps) {
  const [viseme, setViseme] = useState<Viseme>('REST')
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying || !audioEl || timeline.length === 0) {
      setViseme('REST')
      return
    }

    const tick = () => {
      const timeMs = audioEl.currentTime * 1000
      setViseme(visemeAtTime(timeline, timeMs))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [audioEl, timeline, isPlaying])

  const mouth = MOUTH_LEDS[viseme]
  const mouthX = 50 - mouth.width / 2
  const mouthY = 64 - mouth.height / 2
  const barWidth = mouth.width / mouth.bars
  const isSpeaking = viseme !== 'REST'

  return (
    <svg
      viewBox="0 0 100 120"
      width={180}
      height={216}
      role="img"
      aria-label="Avatar AI đang nói"
      className="mx-auto"
    >
      {/* Vai/thân — tấm kim loại bo góc, viền accent phát sáng nhẹ */}
      <path
        d="M 16 120 L 16 104 Q 16 92 28 92 L 72 92 Q 84 92 84 104 L 84 120 Z"
        className="fill-zinc-200 stroke-accent-500"
        strokeWidth={1.5}
      />
      <rect x="40" y="82" width="20" height="14" rx="4" className="fill-zinc-300" />

      {/* Ăng-ten nhỏ trên đầu */}
      <line x1="50" y1="4" x2="50" y2="12" className="stroke-zinc-400" strokeWidth={2} />
      <circle cx="50" cy="4" r="2.5" className="fill-accent-500" />

      {/* Đầu robot — hình vòm kim loại */}
      <path
        d="M 22 46 Q 22 10 50 10 Q 78 10 78 46 L 78 62 Q 78 74 66 74 L 34 74 Q 22 74 22 62 Z"
        className="fill-zinc-100 stroke-zinc-400"
        strokeWidth={1.5}
      />

      {/* Đường mạch (circuit line) trang trí — nét mảnh màu nhấn thương hiệu */}
      <path
        d="M 26 40 L 34 40 L 34 34 L 40 34"
        className="stroke-accent-400"
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
      <path
        d="M 74 40 L 66 40 L 66 34 L 60 34"
        className="stroke-accent-400"
        strokeWidth={1}
        fill="none"
        opacity={0.6}
      />
      <circle cx="26" cy="40" r="1.2" className="fill-accent-400" opacity={0.8} />
      <circle cx="74" cy="40" r="1.2" className="fill-accent-400" opacity={0.8} />

      {/* Tấm visor che mắt — nền tối, 2 mắt LED tròn phát sáng */}
      <rect x="30" y="34" width="40" height="14" rx="7" className="fill-zinc-800" />
      <circle cx="40" cy="41" r="4" className="fill-accent-400" />
      <circle cx="60" cy="41" r="4" className="fill-accent-400" />
      <circle cx="41" cy="39.5" r="1.2" className="fill-white opacity-80" />
      <circle cx="61" cy="39.5" r="1.2" className="fill-white opacity-80" />

      {/* Miệng — màn hình LED đổi kích thước/số thanh theo viseme đang phát */}
      <rect
        x={mouthX}
        y={mouthY}
        width={mouth.width}
        height={mouth.height}
        rx={mouth.height / 2}
        className="fill-zinc-800"
      />
      {Array.from({ length: mouth.bars }).map((_, i) => (
        <rect
          key={i}
          x={mouthX + i * barWidth + barWidth * 0.15}
          y={mouthY + mouth.height * 0.2}
          width={barWidth * 0.7}
          height={mouth.height * 0.6}
          rx={1}
          className={isSpeaking ? 'fill-accent-400' : 'fill-accent-600'}
          opacity={isSpeaking ? 0.95 : 0.5}
        />
      ))}
    </svg>
  )
}
