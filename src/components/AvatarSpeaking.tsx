// src/components/AvatarSpeaking.tsx — PoC avatar 2D đổi hình miệng theo audio đang phát.
// Hình miệng là SVG PLACEHOLDER đơn giản (không phải nhân vật thật) — chỉ để chứng minh cơ
// chế đồng bộ audio↔khẩu hình hoạt động đúng. Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md.

import { useEffect, useRef, useState } from 'react'
import { visemeAtTime, type Viseme, type VisemeFrame } from '../lib/viseme'

interface AvatarSpeakingProps {
  audioEl: HTMLAudioElement | null
  timeline: VisemeFrame[]
  isPlaying: boolean
}

// Mỗi viseme là 1 hình miệng SVG đơn giản (path khác nhau) — vẽ tay, không phải asset thật.
const MOUTH_PATHS: Record<Viseme, string> = {
  REST: 'M 30 60 Q 50 62 70 60', // miệng nghỉ, gần như thẳng
  PP: 'M 30 60 L 70 60', // môi khép (p/b/m)
  FF: 'M 28 58 Q 50 66 72 58', // răng chạm môi dưới
  AA: 'M 30 55 Q 50 85 70 55 Q 50 70 30 55', // miệng mở rộng
  OO: 'M 40 55 Q 50 75 60 55 Q 50 65 40 55', // môi tròn
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

  return (
    <svg
      viewBox="0 0 100 100"
      width={160}
      height={160}
      role="img"
      aria-label="Avatar AI đang nói"
      className="mx-auto"
    >
      <circle cx="50" cy="50" r="45" className="fill-zinc-100 stroke-accent-500" strokeWidth={2} />
      <circle cx="35" cy="40" r="4" className="fill-zinc-800" />
      <circle cx="65" cy="40" r="4" className="fill-zinc-800" />
      <path
        d={MOUTH_PATHS[viseme]}
        className="fill-none stroke-zinc-800"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  )
}
