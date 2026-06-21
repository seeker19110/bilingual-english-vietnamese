import { useState, useRef } from 'react'
import { ArrowLeft, MessageSquare, Play, Pause, Square, Volume2 } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import { speak, stopSpeaking, pauseCurrentAudio, resumeCurrentAudio } from '../lib/tts'
import lessonsData from '../data/lessons.json'
import type { Direction } from '../types'

interface Turn {
  speaker: 'A' | 'B'
  en: string
  vi: string
}

interface Lesson {
  id: number
  title: string
  situation: string
  turns: Turn[]
}

const LESSONS = lessonsData as Lesson[]

type Speed = 0.75 | 1 | 1.25
type AudioMode = 'en' | 'both' | 'vi'

export default function Lessons() {
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = LESSONS.find(l => l.id === selectedId) ?? null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={selected ? selected.title : (isA ? 'Bài học' : 'Lessons')}
        subtitle={selected
          ? selected.situation
          : `${LESSONS.length} ${isA ? 'bài học xoay quanh "tôi - I"' : 'lessons focused on "I / tôi"'}`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!selected ? (
          <LessonList lessons={LESSONS} isA={isA} onSelect={setSelectedId} />
        ) : (
          <LessonView lesson={selected} isA={isA} onBack={() => setSelectedId(null)} />
        )}
      </main>
    </div>
  )
}

// ── Danh sách bài học ─────────────────────────────────────────────────────────
function LessonList({ lessons, isA, onSelect }: {
  lessons: Lesson[]
  isA: boolean
  onSelect: (id: number) => void
}) {
  return (
    <div className="space-y-2">
      {lessons.map(l => (
        <button key={l.id} onClick={() => onSelect(l.id)}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 text-left flex items-center gap-4 transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">{l.id}. {l.title}</p>
            <p className="text-xs text-zinc-500 truncate">{l.situation}</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
            {l.turns.length / 2} {isA ? 'lượt' : 'exchanges'}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Chi tiết bài học + audio player ──────────────────────────────────────────
function LessonView({ lesson, isA, onBack }: { lesson: Lesson; isA: boolean; onBack: () => void }) {
  // Trạng thái phát
  const [activeTurn, setActiveTurn]   = useState<number | null>(null)
  const [playing,    setPlaying]      = useState(false)
  const [paused,     setPaused]       = useState(false)
  const [speed,      setSpeed]        = useState<Speed>(1)
  const [mode,       setMode]         = useState<AudioMode>('en')

  // Refs: đọc giá trị mới nhất trong async loop mà không cần re-render
  const stopRef  = useRef(false)
  const pauseRef = useRef(false)
  const speedRef = useRef<Speed>(1)
  const modeRef  = useRef<AudioMode>('en')
  const turnRefs = useRef<(HTMLDivElement | null)[]>([])

  function changeSpeed(s: Speed) { setSpeed(s); speedRef.current = s }
  function changeMode(m: AudioMode) { setMode(m); modeRef.current = m }

  // ── Phát toàn bài tự động ──────────────────────────────────────────────────
  async function startPlayAll() {
    stopRef.current  = false
    pauseRef.current = false
    setPlaying(true)
    setPaused(false)
    setActiveTurn(null)

    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang  = isA ? 'vi-VN' : 'en-US'

    for (let i = 0; i < lesson.turns.length; i++) {
      // Dừng hẳn
      if (stopRef.current) break

      // Tạm dừng giữa các turn: chờ cho đến khi resume hoặc stop
      while (pauseRef.current && !stopRef.current) {
        await new Promise(r => setTimeout(r, 100))
      }
      if (stopRef.current) break

      const t = lesson.turns[i]
      setActiveTurn(i)
      turnRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      const targetText = isA ? t.en : t.vi
      const transText  = isA ? t.vi : t.en
      const curMode    = modeRef.current
      const curSpeed   = speedRef.current

      if (curMode === 'en') {
        await speak(t.en, 'en-US', undefined, curSpeed)
      } else if (curMode === 'vi') {
        await speak(t.vi, 'vi-VN', undefined, curSpeed)
      } else {
        // Phát ngôn ngữ đích → nghỉ ngắn → phát bản dịch
        await speak(targetText, targetLang, undefined, curSpeed)
        if (!stopRef.current) {
          await new Promise(r => setTimeout(r, 250))
          await speak(transText, transLang, undefined, curSpeed)
        }
      }

      // Nghỉ ngắn giữa các lượt
      if (!stopRef.current) await new Promise(r => setTimeout(r, 500))
    }

    // Kết thúc tự nhiên (không bị stop)
    if (!stopRef.current) {
      setActiveTurn(null)
      setPlaying(false)
      setPaused(false)
    }
  }

  function handlePause() {
    pauseRef.current = true
    setPaused(true)
    pauseCurrentAudio()  // dừng audio đang phát giữa chừng
  }

  function handleResume() {
    pauseRef.current = false
    setPaused(false)
    resumeCurrentAudio()  // tiếp tục audio từ chỗ dừng; loop thoát khỏi while-wait
  }

  function handleStop() {
    stopRef.current = true
    stopSpeaking()
    setPlaying(false)
    setPaused(false)
    setActiveTurn(null)
  }

  // ── Phát từng turn riêng lẻ (bấm vào bong bóng) ───────────────────────────
  async function playTurn(idx: number) {
    if (playing || paused) handleStop()
    await new Promise(r => setTimeout(r, 80)) // chờ stop propagate

    const t = lesson.turns[idx]
    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang  = isA ? 'vi-VN' : 'en-US'
    const targetText = isA ? t.en : t.vi
    const transText  = isA ? t.vi : t.en
    const curMode    = modeRef.current

    if (curMode === 'en') {
      await speak(t.en, 'en-US', undefined, speedRef.current)
    } else if (curMode === 'vi') {
      await speak(t.vi, 'vi-VN', undefined, speedRef.current)
    } else {
      await speak(targetText, targetLang, undefined, speedRef.current)
      await new Promise(r => setTimeout(r, 250))
      await speak(transText, transLang, undefined, speedRef.current)
    }
  }

  const isIdle = !playing && !paused
  const SPEEDS: Speed[] = [0.75, 1, 1.25]
  const MODES: { key: AudioMode; label: string }[] = [
    { key: 'en',   label: 'EN'               },
    { key: 'both', label: isA ? 'EN+VI' : 'VI+EN' },
    { key: 'vi',   label: 'VI'               },
  ]

  return (
    <div>
      {/* Nút quay lại */}
      <button onClick={onBack}
        className="mb-3 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" />
        {isA ? 'Danh sách bài học' : 'Back to lessons'}
      </button>

      {/* ── Thanh điều khiển audio (sticky ngay dưới header) ── */}
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-sm pt-1 pb-3">
        <div className="glass rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">

          {/* Play / Pause / Resume / Stop */}
          <div className="flex items-center gap-2">
            {isIdle && (
              <button onClick={() => void startPlayAll()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition">
                <Play className="w-3.5 h-3.5 fill-current" />
                {isA ? 'Phát tất cả' : 'Play all'}
              </button>
            )}
            {playing && !paused && (
              <button onClick={handlePause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm font-medium transition">
                <Pause className="w-3.5 h-3.5 fill-current" />
                {isA ? 'Tạm dừng' : 'Pause'}
              </button>
            )}
            {paused && (
              <button onClick={handleResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-medium transition">
                <Play className="w-3.5 h-3.5 fill-current" />
                {isA ? 'Tiếp tục' : 'Resume'}
              </button>
            )}
            {!isIdle && (
              <button onClick={handleStop} title={isA ? 'Dừng hẳn' : 'Stop'}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition">
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>

          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />

          {/* Tốc độ */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
              {isA ? 'Tốc độ' : 'Speed'}
            </span>
            {SPEEDS.map(s => (
              <button key={s} onClick={() => changeSpeed(s)}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                  speed === s
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}>
                {s}×
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-zinc-700 hidden sm:block" />

          {/* Chế độ nghe */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
            {MODES.map(m => (
              <button key={m.key} onClick={() => changeMode(m.key)}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                  mode === m.key
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Chỉ số turn đang phát */}
          {playing && activeTurn !== null && (
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-500">
                {activeTurn + 1}/{lesson.turns.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bong bóng hội thoại ── */}
      <div className="space-y-3 pb-8">
        {lesson.turns.map((t, i) => {
          const isActive = activeTurn === i
          const isLeft   = t.speaker === 'A'

          return (
            <div
              key={i}
              ref={el => { turnRefs.current[i] = el }}
              className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-3.5 transition-all duration-300 ${
                isActive
                  ? isLeft
                    ? 'bg-emerald-500/15 border border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-sky-500/15 border border-sky-500/50 shadow-lg shadow-sky-500/10'
                  : isLeft
                    ? 'bg-zinc-900 border border-zinc-800'
                    : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                {/* Nhãn speaker + nút phát */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-[10px] font-medium text-zinc-500">
                    {t.speaker === 'A' ? (isA ? 'Người A' : 'Person A') : (isA ? 'Người B' : 'Person B')}
                  </p>
                  {/* Nút phát từng turn */}
                  <button
                    onClick={() => void playTurn(i)}
                    title={isA ? 'Nghe câu này' : 'Play this line'}
                    className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition ${
                      isActive
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isActive
                      ? <Volume2 className="w-3 h-3 animate-pulse" />
                      : <Volume2 className="w-3 h-3" />
                    }
                  </button>
                </div>

                {/* Câu chính (ngôn ngữ đích) */}
                <p className="text-sm text-white leading-relaxed">{isA ? t.en : t.vi}</p>

                {/* Bản dịch */}
                <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">{isA ? t.vi : t.en}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
