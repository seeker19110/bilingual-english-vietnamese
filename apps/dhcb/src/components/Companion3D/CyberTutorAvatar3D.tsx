import React, { useState, useEffect, useRef } from 'react'
import { Eye, Cpu, ShieldCheck } from 'lucide-react'
import { Oculus15Viseme, AvatarEmotionType } from '@dhcb/core-contracts/avatarEmbodiment'
import { VisemeMorphingService } from '@dhcb/core-ai/visemeMorphingService'

interface CyberTutorAvatar3DProps {
  isSpeaking?: boolean
  isListening?: boolean
  currentSpeechAmplitude?: number
  currentIpaPhoneme?: string
  emotion?: AvatarEmotionType
  interactiveGaze?: boolean
  accentColor?: string
}

export default function CyberTutorAvatar3D({
  isSpeaking = false,
  isListening = false,
  currentSpeechAmplitude = 0,
  currentIpaPhoneme = 'sil',
  emotion = 'neutral',
  interactiveGaze = true,
  accentColor = '#00f0ff',
}: CyberTutorAvatar3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  // Viseme đang hoạt động là GIÁ TRỊ DẪN XUẤT thuần từ props — không cần state
  // + effect (tránh setState đồng bộ trong effect gây render dây chuyền).
  const activeViseme: Oculus15Viseme =
    isSpeaking && currentIpaPhoneme
      ? VisemeMorphingService.mapIpaToViseme(currentIpaPhoneme)
      : 'sil'
  const [fps, setFps] = useState(60)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactiveGaze || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5
    setGaze({
      x: Math.max(-1, Math.min(1, relativeX * 2.2)),
      y: Math.max(-1, Math.min(1, relativeY * 2.2)),
    })
  }

  const handlePointerLeave = () => {
    setGaze({ x: 0, y: 0 })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let frameCount = 0
    let lastFpsUpdate = performance.now()

    let smoothedWidth = 0.2
    let smoothedHeight = 0.05
    let smoothedIntensity = 0.3
    let smoothedGazeX = 0
    let smoothedGazeY = 0

    const render = (now: number) => {
      frameCount++
      if (now - lastFpsUpdate >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastFpsUpdate = now
      }

      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      const idle = VisemeMorphingService.computeNaturalIdleState(now, gaze, emotion)

      smoothedGazeX = VisemeMorphingService.smoothStep(smoothedGazeX, idle.gazeX, 0.1)
      smoothedGazeY = VisemeMorphingService.smoothStep(smoothedGazeY, idle.gazeY, 0.1)

      const targetMorph = isSpeaking
        ? VisemeMorphingService.calculateMorphTarget(
            activeViseme,
            currentSpeechAmplitude || 0.7,
            now,
          )
        : idle.activeViseme

      smoothedWidth = VisemeMorphingService.smoothStep(smoothedWidth, targetMorph.mouthWidth, 0.25)
      smoothedHeight = VisemeMorphingService.smoothStep(
        smoothedHeight,
        targetMorph.mouthHeight,
        0.3,
      )
      smoothedIntensity = VisemeMorphingService.smoothStep(
        smoothedIntensity,
        targetMorph.ledIntensity,
        0.25,
      )

      const headOffsetX = smoothedGazeX * 12 + Math.sin(now * 0.001) * 2
      const headOffsetY =
        smoothedGazeY * 8 + Math.cos(now * 0.0015) * 3 + (1 - idle.breathPhase) * 4

      const gradBg = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, 160)
      gradBg.addColorStop(0, 'rgba(6, 182, 212, 0.12)')
      gradBg.addColorStop(0.6, 'rgba(15, 23, 42, 0.4)')
      gradBg.addColorStop(1, 'rgba(9, 9, 11, 0)')
      ctx.fillStyle = gradBg
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.translate(cx, cy + 90)
      ctx.beginPath()
      ctx.moveTo(-110, 40)
      ctx.lineTo(-45, 10)
      ctx.lineTo(0, 20)
      ctx.lineTo(45, 10)
      ctx.lineTo(110, 40)
      ctx.lineTo(120, 80)
      ctx.lineTo(-120, 80)
      ctx.closePath()
      const shoulderGrad = ctx.createLinearGradient(-110, 10, 110, 80)
      shoulderGrad.addColorStop(0, '#1e293b')
      shoulderGrad.addColorStop(0.5, '#0f172a')
      shoulderGrad.addColorStop(1, '#1e293b')
      ctx.fillStyle = shoulderGrad
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-90, 36)
      ctx.lineTo(-40, 14)
      ctx.lineTo(40, 14)
      ctx.lineTo(90, 36)
      ctx.strokeStyle = isListening
        ? '#22c55e'
        : isSpeaking
          ? accentColor
          : 'rgba(6, 182, 212, 0.6)'
      ctx.lineWidth = 2.5
      ctx.shadowColor = accentColor
      ctx.shadowBlur = 12
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.translate(cx + headOffsetX, cy - 20 + headOffsetY)

      ctx.beginPath()
      ctx.rect(-18, 55, 36, 35)
      ctx.fillStyle = '#0f172a'
      ctx.fill()
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)'
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(0, 0, 68, 78, 0, 0, Math.PI * 2)
      const headGrad = ctx.createRadialGradient(-20, -25, 10, 0, 0, 80)
      headGrad.addColorStop(0, '#f8fafc')
      headGrad.addColorStop(0.5, '#cbd5e1')
      headGrad.addColorStop(0.85, '#64748b')
      headGrad.addColorStop(1, '#334155')
      ctx.fillStyle = headGrad
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)'
      ctx.stroke()

      ctx.beginPath()
      ctx.roundRect(-52, -26, 104, 44, [14, 14, 20, 20])
      const visorGrad = ctx.createLinearGradient(0, -26, 0, 18)
      visorGrad.addColorStop(0, '#020617')
      visorGrad.addColorStop(0.7, '#0f172a')
      visorGrad.addColorStop(1, '#020617')
      ctx.fillStyle = visorGrad
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(-45, -20)
      ctx.lineTo(25, -20)
      ctx.lineTo(10, -8)
      ctx.lineTo(-45, -8)
      ctx.closePath()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.fill()

      const eyeSpacing = 24
      const eyeRadius = 7
      const eyeGazeOffsetX = smoothedGazeX * 5
      const eyeGazeOffsetY = smoothedGazeY * 4
      const blinkScaleY = 1 - idle.blinkState

      const eyeColor = isListening
        ? '#22c55e'
        : isSpeaking
          ? accentColor
          : idle.emotion.eyeGlowColor

      ;[-eyeSpacing, eyeSpacing].forEach((eyeBaseX) => {
        ctx.save()
        ctx.translate(eyeBaseX + eyeGazeOffsetX, -5 + eyeGazeOffsetY)
        ctx.scale(1, blinkScaleY)
        ctx.beginPath()
        ctx.arc(0, 0, eyeRadius * 1.6, 0, Math.PI * 2)
        ctx.fillStyle = eyeColor + '33'
        ctx.shadowColor = eyeColor
        ctx.shadowBlur = 14
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, 0, eyeRadius, 0, Math.PI * 2)
        ctx.fillStyle = eyeColor
        ctx.fill()
        ctx.beginPath()
        ctx.arc(-2, -2, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.restore()
      })

      ctx.save()
      ctx.translate(0, 42)
      const mouthWidthPx = smoothedWidth * 56
      const mouthHeightPx = Math.max(3, smoothedHeight * 28)
      ctx.beginPath()
      ctx.roundRect(-mouthWidthPx / 2, -mouthHeightPx / 2, mouthWidthPx, mouthHeightPx, [4])
      const mouthGrad = ctx.createLinearGradient(-mouthWidthPx / 2, 0, mouthWidthPx / 2, 0)
      mouthGrad.addColorStop(0, 'rgba(6, 182, 212, 0.2)')
      mouthGrad.addColorStop(0.5, eyeColor)
      mouthGrad.addColorStop(1, 'rgba(6, 182, 212, 0.2)')
      ctx.fillStyle = mouthGrad
      ctx.shadowColor = eyeColor
      ctx.shadowBlur = 10 * smoothedIntensity
      ctx.fill()

      if (isSpeaking && smoothedHeight > 0.08) {
        ctx.beginPath()
        ctx.moveTo(-mouthWidthPx / 2 + 4, 0)
        for (let x = -mouthWidthPx / 2 + 4; x <= mouthWidthPx / 2 - 4; x += 4) {
          const waveY = Math.sin((x + now * 0.02) * 0.4) * (mouthHeightPx * 0.35)
          ctx.lineTo(x, waveY)
        }
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.restore()

      ;[-68, 68].forEach((earX) => {
        ctx.beginPath()
        ctx.ellipse(earX, -2, 7, 18, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#1e293b'
        ctx.fill()
        ctx.lineWidth = 1.5
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
        ctx.stroke()
      })

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isSpeaking, isListening, currentSpeechAmplitude, activeViseme, emotion, gaze, accentColor])

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950 p-4 shadow-2xl backdrop-blur-xl transition-all select-none"
    >
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 items-center justify-center">
            <span
              className={`absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping ${
                isListening ? 'bg-emerald-400' : isSpeaking ? 'bg-cyan-400' : 'bg-sky-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isListening ? 'bg-emerald-500' : isSpeaking ? 'bg-cyan-500' : 'bg-sky-500'
              }`}
            />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 theme-light:text-cyan-800">
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready / 3D Cyber Tutor'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 border border-cyan-800/40 text-cyan-300 theme-light:text-cyan-800 font-mono">
            {fps} FPS
          </span>
          <span className="rounded bg-zinc-900/80 px-1.5 py-0.5 border border-zinc-800 font-mono uppercase text-zinc-400">
            Viseme: {activeViseme}
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={340}
        height={300}
        className="h-[280px] w-[320px] max-w-full cursor-crosshair drop-shadow-[0_0_25px_rgba(6,182,212,0.25)]"
      />
      <div className="mt-1 flex items-center gap-4 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Eye className="h-3.5 w-3.5 text-cyan-400 theme-light:text-cyan-800" />
          <span>Interactive Gaze Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Cpu className="h-3.5 w-3.5 text-sky-400 theme-light:text-sky-800" />
          <span>15 Oculus Morphing</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 theme-light:text-emerald-800" />
          <span>PBR Cyber Shader</span>
        </div>
      </div>
    </div>
  )
}
