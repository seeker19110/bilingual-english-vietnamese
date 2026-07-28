// src/components/AvatarSpeaking.tsx — Avatar 2D đổi hình miệng theo audio đang phát.
// Vẫn là hình vẽ SVG THUẦN (không phải nhân vật thật/ảnh chụp) — cố tình giữ NHẸ (không dùng
// ảnh/asset ngoài) để không phá nguyên tắc "băng thông thấp" của hướng viseme animation (xem
// docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md) — chỉ nâng cấp PHẦN VẼ cho có tỉ lệ
// khuôn mặt/tóc/mắt rõ ràng hơn bản placeholder tròn+2 chấm+1 nét kẻ trước đây.

import { useEffect, useRef, useState } from 'react'
import { visemeAtTime, type Viseme, type VisemeFrame } from '../lib/viseme'

interface AvatarSpeakingProps {
  audioEl: HTMLAudioElement | null
  timeline: VisemeFrame[]
  isPlaying: boolean
}

// Mỗi viseme là 1 CỤM hình miệng (viền môi + khoang miệng bên trong nếu miệng mở) — vẽ dạng
// fill thay vì chỉ 1 nét kẻ, để trông giống hình miệng thật hơn thay vì 1 đường cong đơn giản.
interface MouthShape {
  lips: string // viền môi (fill được, khép kín)
  inner?: string // khoang miệng/răng bên trong (chỉ có khi miệng mở)
}

const MOUTH_SHAPES: Record<Viseme, MouthShape> = {
  // Miệng nghỉ: đường cong mỏng, hơi mỉm — không có khoang trong.
  REST: { lips: 'M 38 62 Q 50 66 62 62 Q 50 64 38 62 Z' },
  // Môi khép chặt (p/b/m): 1 dải mỏng nằm ngang.
  PP: { lips: 'M 36 62 Q 50 60 64 62 Q 50 64.5 36 62 Z' },
  // Răng trên chạm môi dưới (f/v): môi dưới nhô nhẹ, có 1 dải răng mỏng phía trên.
  FF: {
    lips: 'M 36 60 Q 50 68 64 60 Q 50 64 36 60 Z',
    inner: 'M 40 60 L 60 60 L 60 62.5 L 40 62.5 Z',
  },
  // Miệng mở rộng (nguyên âm mở, vd a): khoang miệng hình oval lớn.
  AA: {
    lips: 'M 33 56 Q 50 84 67 56 Q 50 72 33 56 Z',
    inner: 'M 40 60 Q 50 76 60 60 Q 50 68 40 60 Z',
  },
  // Môi tròn (nguyên âm tròn môi, vd o/u): khoang miệng hình tròn nhỏ.
  OO: {
    lips: 'M 42 54 Q 50 78 58 54 Q 50 66 42 54 Z',
    inner: 'M 46 58 Q 50 70 54 58 Q 50 63 46 58 Z',
  },
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

  const mouth = MOUTH_SHAPES[viseme]

  return (
    <svg
      viewBox="0 0 100 120"
      width={180}
      height={216}
      role="img"
      aria-label="Avatar AI đang nói"
      className="mx-auto"
    >
      {/* Vai/áo — dùng màu nhấn thương hiệu (đổi theo theme) cho có điểm nhấn cá tính */}
      <path d="M 14 120 Q 50 96 86 120 Z" className="fill-accent-500" />

      {/* Cổ */}
      <rect x="42" y="70" width="16" height="16" rx="4" className="fill-zinc-200" />

      {/* Khuôn mặt */}
      <ellipse cx="50" cy="46" rx="30" ry="34" className="fill-zinc-50 stroke-zinc-300" />

      {/* Tóc — mái đơn giản phủ nửa trên đầu */}
      <path
        d="M 20 40 Q 18 8 50 8 Q 82 8 80 40 Q 80 20 50 20 Q 20 20 20 40 Z"
        className="fill-accent-700"
      />

      {/* Lông mày */}
      <path d="M 28 34 Q 34 30 40 33" className="stroke-zinc-500" strokeWidth={2} fill="none" />
      <path d="M 60 33 Q 66 30 72 34" className="stroke-zinc-500" strokeWidth={2} fill="none" />

      {/* Mắt: tròng trắng + con ngươi + chấm sáng nhỏ (tạo cảm giác có hồn hơn 2 chấm đặc) */}
      <ellipse cx="36" cy="42" rx="6" ry="7" className="fill-white stroke-zinc-300" />
      <circle cx="37" cy="43" r="3.2" className="fill-zinc-800" />
      <circle cx="38.3" cy="41.3" r="1" className="fill-white" />

      <ellipse cx="64" cy="42" rx="6" ry="7" className="fill-white stroke-zinc-300" />
      <circle cx="65" cy="43" r="3.2" className="fill-zinc-800" />
      <circle cx="66.3" cy="41.3" r="1" className="fill-white" />

      {/* Má hồng nhẹ */}
      <ellipse cx="28" cy="56" rx="5" ry="3" className="fill-accent-300 opacity-40" />
      <ellipse cx="72" cy="56" rx="5" ry="3" className="fill-accent-300 opacity-40" />

      {/* Miệng — đổi hình theo viseme đang phát */}
      {mouth.inner && <path d={mouth.inner} className="fill-zinc-800" />}
      <path d={mouth.lips} className="fill-zinc-700" />
    </svg>
  )
}
