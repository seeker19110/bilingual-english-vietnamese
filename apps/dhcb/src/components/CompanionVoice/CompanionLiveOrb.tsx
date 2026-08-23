import React, { useEffect, useRef } from 'react'

interface CompanionLiveOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted'
  audioLevel?: number // 0.0 -> 1.0
  className?: string
}

export const CompanionLiveOrb: React.FC<CompanionLiveOrbProps> = ({
  state,
  audioLevel = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0

    const render = () => {
      phase += 0.04
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const baseRadius = Math.min(centerX, centerY) * 0.45

      ctx.clearRect(0, 0, width, height)

      // Màu sắc theo state
      let color1 = '#38bdf8' // Sky
      let color2 = '#818cf8' // Indigo
      let pulseAmp = 1 + audioLevel * 0.4

      if (state === 'listening') {
        color1 = '#34d399' // Emerald
        color2 = '#06b6d4' // Cyan
        pulseAmp = 1 + audioLevel * 0.7
      } else if (state === 'thinking') {
        color1 = '#fbbf24' // Amber
        color2 = '#f43f5e' // Rose
        pulseAmp = 1 + Math.sin(phase * 2) * 0.15
      } else if (state === 'speaking') {
        color1 = '#a855f7' // Purple
        color2 = '#ec4899' // Pink
        pulseAmp = 1 + audioLevel * 0.9 + Math.sin(phase * 3) * 0.1
      }

      // Outer glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        baseRadius * 2 * pulseAmp,
      )
      glowGradient.addColorStop(0, color1 + '55')
      glowGradient.addColorStop(0.5, color2 + '22')
      glowGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius * 2 * pulseAmp, 0, Math.PI * 2)
      ctx.fill()

      // Core Organic Orb with waveform distortion
      ctx.save()
      ctx.beginPath()
      const points = 32
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const distortion =
          Math.sin(angle * 4 + phase) * (8 + audioLevel * 25) +
          Math.cos(angle * 2 - phase * 1.5) * (5 + audioLevel * 15)
        const r = baseRadius * pulseAmp + distortion
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()

      const coreGradient = ctx.createLinearGradient(
        centerX - baseRadius,
        centerY - baseRadius,
        centerX + baseRadius,
        centerY + baseRadius,
      )
      coreGradient.addColorStop(0, color1)
      coreGradient.addColorStop(1, color2)

      ctx.fillStyle = coreGradient
      ctx.shadowColor = color1
      ctx.shadowBlur = 20
      ctx.fill()
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [state, audioLevel])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="w-56 h-56 sm:w-64 sm:h-64 filter drop-shadow-2xl"
      />
    </div>
  )
}

export default CompanionLiveOrb
