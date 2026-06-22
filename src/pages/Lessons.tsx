import { useState, useRef, useEffect, memo } from 'react'
import { ArrowLeft, MessageSquare, Play, Pause, Square, Volume2, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import { speak, stopSpeaking, pauseCurrentAudio, resumeCurrentAudio } from '../lib/tts'
import { INDEX, loadLesson, type Lesson, type LessonMeta } from '../data/lessons/loader'
import type { Direction } from '../types'

type Speed = 0.75 | 1 | 1.25
type AudioMode = 'en' | 'both' | 'vi'

// Trạng thái đồng bộ từng chữ: turn nào đang phát, ngôn ngữ nào, từ thứ mấy
interface WordSync {
  turnIdx: number
  lang: 'en' | 'vi'
  wordIdx: number
}

// Component hiển thị câu với từng từ được highlight khi đọc đến (karaoke style)
const WordText = memo(function WordText({
  text, baseClass, wordSync, turnIdx, lang,
}: {
  text: string
  baseClass: string
  wordSync: WordSync | null
  turnIdx: number
  lang: 'en' | 'vi'
}) {
  const isActive = wordSync?.turnIdx === turnIdx && wordSync?.lang === lang
  if (!isActive) return <p className={baseClass}>{text}</p>

  // Tách thành [từ, khoảng trắng, từ, ...] để giữ nguyên khoảng trắng gốc
  const parts = text.split(/(\s+)/)
  let wi = 0
  return (
    <p className={baseClass}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) return <span key={i}>{part}</span>
        const thisIdx = wi++
        return (
          <span key={i} className={
            thisIdx === wordSync.wordIdx
              ? 'text-emerald-200 bg-emerald-500/25 rounded px-0.5 transition-colors'
              : 'transition-colors'
          }>{part}</span>
        )
      })}
    </p>
  )
})

export default function Lessons() {
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  const [selectedMeta, setSelectedMeta] = useState<LessonMeta | null>(null)
  // Nội dung đầy đủ của bài đang chọn — lazy-load qua loader (chỉ tải chunk khi cần).
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)

  // Khi chọn 1 bài: tải nội dung đầy đủ từ chunk tương ứng.
  useEffect(() => {
    if (!selectedMeta) { setLesson(null); return }
    let alive = true
    setLoading(true)
    loadLesson(selectedMeta).then((l) => {
      if (alive) { setLesson(l); setLoading(false) }
    })
    return () => { alive = false }
  }, [selectedMeta])

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={selectedMeta ? selectedMeta.title : (isA ? 'Bài học' : 'Lessons')}
        subtitle={selectedMeta
          ? selectedMeta.situation
          : `${INDEX.length} ${isA ? 'bài học xoay quanh "tôi - I"' : 'lessons focused on "I / tôi"'}`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!selectedMeta ? (
          <LessonList lessons={INDEX} isA={isA} onSelect={setSelectedMeta} />
        ) : loading || !lesson ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {isA ? 'Đang tải bài học…' : 'Loading lesson…'}
          </div>
        ) : (
          <LessonView lesson={lesson} isA={isA} onBack={() => setSelectedMeta(null)} />
        )}
      </main>
    </div>
  )
}

// ── Danh sách bài học ─────────────────────────────────────────────────────────
function LessonList({ lessons, isA, onSelect }: {
  lessons: LessonMeta[]
  isA: boolean
  onSelect: (meta: LessonMeta) => void
}) {
  return (
    <div className="space-y-2">
      {lessons.map(l => (
        <button key={l.id} onClick={() => onSelect(l)}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 text-left flex items-center gap-4 transition group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white">{l.id}. {l.title}</p>
            <p className="text-xs text-zinc-500 truncate">{l.situation}</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
            {l.turnCount / 2} {isA ? 'lượt' : 'exchanges'}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Chi tiết bài học + audio player ──────────────────────────────────────────
function LessonView({ lesson, isA, onBack }: { lesson: Lesson; isA: boolean; onBack: () => void }) {
  // Giọng theo giới tính người nói (mặc định A=nữ, B=nam nếu không có dữ liệu)
  const voiceA = lesson.speakerAGender ?? 'female'
  const voiceB = lesson.speakerBGender ?? 'male'
  // Trạng thái phát
  const [activeTurn, setActiveTurn]   = useState<number | null>(null)
  const [playing,    setPlaying]      = useState(false)
  const [paused,     setPaused]       = useState(false)
  const [speed,      setSpeed]        = useState<Speed>(1)
  const [mode,       setMode]         = useState<AudioMode>('en')
  const [wordSync,   setWordSync]     = useState<WordSync | null>(null)

  // Refs: đọc giá trị mới nhất trong async loop mà không cần re-render
  const stopRef     = useRef(false)
  const pauseRef    = useRef(false)
  const speedRef    = useRef<Speed>(1)
  const modeRef     = useRef<AudioMode>('en')
  const turnRefs    = useRef<(HTMLDivElement | null)[]>([])
  // wordSyncRef: tránh setState trùng lặp khi ontimeupdate gọi liên tục
  const wordSyncRef = useRef<WordSync | null>(null)

  function changeSpeed(s: Speed) { setSpeed(s); speedRef.current = s }
  function changeMode(m: AudioMode) { setMode(m); modeRef.current = m }

  // Chỉ setState khi từ thực sự đổi (ontimeupdate chạy ~4 lần/giây)
  function syncWord(ws: WordSync | null) {
    const prev = wordSyncRef.current
    if (!ws) {
      if (prev !== null) { wordSyncRef.current = null; setWordSync(null) }
      return
    }
    if (prev?.turnIdx === ws.turnIdx && prev?.lang === ws.lang && prev?.wordIdx === ws.wordIdx) return
    wordSyncRef.current = ws
    setWordSync({ ...ws })
  }

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
      if (stopRef.current) break

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
      // Giọng đọc theo giới tính người nói A hoặc B
      const curVoice   = t.speaker === 'A' ? voiceA : voiceB

      if (curMode === 'en') {
        await speak(t.en, 'en-US', curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: 'en', wordIdx: wi }))
      } else if (curMode === 'vi') {
        await speak(t.vi, 'vi-VN', curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: 'vi', wordIdx: wi }))
      } else {
        // Phát ngôn ngữ đích → nghỉ ngắn → phát bản dịch
        const tLang = isA ? 'en' : 'vi'
        const rLang = isA ? 'vi' : 'en'
        await speak(targetText, targetLang, curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: tLang, wordIdx: wi }))
        if (!stopRef.current) {
          syncWord(null)
          await new Promise(r => setTimeout(r, 250))
          await speak(transText, transLang, curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: rLang, wordIdx: wi }))
        }
      }

      syncWord(null)
      if (!stopRef.current) await new Promise(r => setTimeout(r, 500))
    }

    if (!stopRef.current) {
      setActiveTurn(null)
      setPlaying(false)
      setPaused(false)
      syncWord(null)
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
    syncWord(null)
  }

  // ── Phát từng turn riêng lẻ (bấm vào bong bóng) ───────────────────────────
  async function playTurn(idx: number) {
    if (playing || paused) handleStop()
    await new Promise(r => setTimeout(r, 80))

    const t = lesson.turns[idx]
    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang  = isA ? 'vi-VN' : 'en-US'
    const targetText = isA ? t.en : t.vi
    const transText  = isA ? t.vi : t.en
    const curMode    = modeRef.current
    const curSpeed   = speedRef.current
    const curVoice   = t.speaker === 'A' ? voiceA : voiceB

    if (curMode === 'en') {
      await speak(t.en, 'en-US', curVoice, curSpeed, wi => syncWord({ turnIdx: idx, lang: 'en', wordIdx: wi }))
    } else if (curMode === 'vi') {
      await speak(t.vi, 'vi-VN', curVoice, curSpeed, wi => syncWord({ turnIdx: idx, lang: 'vi', wordIdx: wi }))
    } else {
      const tLang = isA ? 'en' : 'vi'
      const rLang = isA ? 'vi' : 'en'
      await speak(targetText, targetLang, curVoice, curSpeed, wi => syncWord({ turnIdx: idx, lang: tLang, wordIdx: wi }))
      syncWord(null)
      await new Promise(r => setTimeout(r, 250))
      await speak(transText, transLang, curVoice, curSpeed, wi => syncWord({ turnIdx: idx, lang: rLang, wordIdx: wi }))
    }
    syncWord(null)
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
                    {t.speaker === 'A'
                      ? (isA ? (lesson.speakerAName?.vi ?? 'Người A') : (lesson.speakerAName?.en ?? 'Person A'))
                      : (isA ? (lesson.speakerBName?.vi ?? 'Người B') : (lesson.speakerBName?.en ?? 'Person B'))
                    }
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

                {/* Câu chính (ngôn ngữ đích) — từng chữ sáng theo giọng đọc */}
                <WordText
                  text={isA ? t.en : t.vi}
                  baseClass="text-sm text-white leading-relaxed"
                  wordSync={wordSync}
                  turnIdx={i}
                  lang={isA ? 'en' : 'vi'}
                />

                {/* Bản dịch — cũng highlight nếu đang phát chế độ EN+VI */}
                <WordText
                  text={isA ? t.vi : t.en}
                  baseClass="text-xs text-zinc-500 italic mt-1 leading-relaxed"
                  wordSync={wordSync}
                  turnIdx={i}
                  lang={isA ? 'vi' : 'en'}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
