import { useState, useRef, useEffect, memo, useMemo, useDeferredValue } from 'react'
import { Play, Pause, Square, Volume2, Loader2, Search, X, Mic, RotateCcw } from 'lucide-react'
import { startListening, isSTTSupported } from '../lib/stt'
import { scorePronunciation, pronounceFeedback, scoreWords } from '../lib/pronounceScore'
import Layout from '../components/Layout'
import VoiceToggle from '../components/VoiceToggle'
import { getDirection } from '../lib/storage'
import { speak, stopSpeaking, pauseCurrentAudio, resumeCurrentAudio } from '../lib/tts'
import { loadIndex, loadLesson, type Lesson, type LessonMeta } from '../data/lessons/loader'
import type { Direction } from '../types'

const PAGE_SIZE = 10

type Speed = 0.75 | 1 | 1.25
type AudioMode = 'en' | 'both' | 'vi'

// ── Hệ thống màu sắc — giống CommonPhrases ───────────────────────────────────
const COLORS = [
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  { bg: 'bg-sky-500/10',     text: 'text-sky-400',     border: 'border-sky-500/25',     dot: 'bg-sky-400'     },
  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/25',  dot: 'bg-violet-400'  },
  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/25',   dot: 'bg-amber-400'   },
  { bg: 'bg-pink-500/10',    text: 'text-pink-400',    border: 'border-pink-500/25',    dot: 'bg-pink-400'    },
  { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/25',    dot: 'bg-teal-400'    },
  { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/25',    dot: 'bg-rose-400'    },
  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/25',  dot: 'bg-indigo-400'  },
  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/25',  dot: 'bg-orange-400'  },
  { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/25',    dot: 'bg-cyan-400'    },
]

function getColor(id: number) {
  return COLORS[(id - 1) % COLORS.length]
}

// ── Trạng thái đồng bộ từng chữ: turn nào đang phát, ngôn ngữ nào, từ thứ mấy
interface WordSync {
  turnIdx: number
  lang: 'en' | 'vi'
  wordIdx: number
}

// Component highlight từng từ kiểu karaoke
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

// ── Trang chính ───────────────────────────────────────────────────────────────
export default function Lessons() {
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  const [index, setIndex]           = useState<LessonMeta[]>([])
  const [query, setQuery]           = useState('')
  const deferredQuery               = useDeferredValue(query)
  const [selectedMeta, setSelectedMeta] = useState<LessonMeta | null>(null)
  const [lesson, setLesson]         = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(false)

  useEffect(() => { loadIndex().then(setIndex) }, [])

  useEffect(() => {
    if (!selectedMeta) { setLesson(null); return }
    let alive = true
    setLoadingLesson(true)
    loadLesson(selectedMeta).then(l => {
      if (alive) { setLesson(l); setLoadingLesson(false) }
    })
    return () => { alive = false }
  }, [selectedMeta])

  // ── Màn hình chi tiết bài học ─────────────────────────────────────────────
  if (selectedMeta) {
    const c = getColor(selectedMeta.id)
    return (
      <div className="h-dvh overflow-hidden bg-zinc-950 flex flex-col">
        <Layout
          title={selectedMeta.title}
          subtitle={selectedMeta.situation}
          back
          extra={<VoiceToggle />}
        />
        {loadingLesson || !lesson ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {isA ? 'Đang tải bài học…' : 'Loading lesson…'}
          </div>
        ) : (
          <LessonView lesson={lesson} isA={isA} color={c} onBack={() => setSelectedMeta(null)} />
        )}
      </div>
    )
  }

  // ── Màn hình danh sách ────────────────────────────────────────────────────
  // Mobile: h-dvh flex col, search cố định dưới cùng
  // Desktop (sm+): layout thường, search ở trên
  return (
    <div className="bg-zinc-950 flex flex-col h-dvh sm:h-auto sm:block sm:min-h-dvh">
      <Layout
        title={isA ? 'Bài học' : 'Lessons'}
        subtitle={
          index.length > 0
            ? (isA ? `${index.length} chủ đề bài học giao tiếp` : `${index.length} conversation lesson topics`)
            : (isA ? 'Bài học giao tiếp' : 'Conversation lessons')
        }
        back
        extra={<VoiceToggle />}
      />

      <main className="flex-1 overflow-y-auto sm:overflow-visible sm:flex-none">
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
          {/* Search bar — chỉ hiện ở trên trên desktop */}
          <div className="hidden sm:block mb-4">
            <SearchBar query={query} setQuery={setQuery} isA={isA} variant="desktop" />
          </div>
          <LessonList lessons={index} isA={isA} query={deferredQuery} onSelect={setSelectedMeta} />
        </div>
      </main>

      {/* Search bar cố định ở dưới — CHỈ trên mobile */}
      <div className="sm:hidden shrink-0 border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-md px-4 pt-3 pb-safe">
        <SearchBar query={query} setQuery={setQuery} isA={isA} variant="mobile" />
      </div>
    </div>
  )
}

// ── Ô tìm kiếm dùng chung ────────────────────────────────────────────────────
function SearchBar({ query, setQuery, isA, variant = 'desktop' }: {
  query: string
  setQuery: (v: string) => void
  isA: boolean
  variant?: 'desktop' | 'mobile'
}) {
  const inputId = variant === 'desktop' ? 'lesson-search-desktop' : 'lesson-search-mobile'
  const label = isA ? 'Tìm chủ đề bài học (tiếng Anh hoặc tiếng Việt)' : 'Search lesson topics (English or Vietnamese)'
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" aria-hidden="true" />
      <input
        id={inputId}
        name="query"
        type="search"
        aria-label={label}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={isA ? 'Tìm bằng tiếng Anh hoặc tiếng Việt…' : 'Search in English or Vietnamese…'}
        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-emerald-500/60 focus:bg-zinc-900 transition"
      />
      {query && (
        <button onClick={() => setQuery('')}
          aria-label={isA ? 'Xóa tìm kiếm' : 'Clear search'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-0.5">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ── Danh sách bài học — nhận query từ cha, IntersectionObserver lazy load ─────
function LessonList({ lessons, isA, query, onSelect }: {
  lessons: LessonMeta[]
  isA: boolean
  query: string
  onSelect: (meta: LessonMeta) => void
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    return lessons.filter(l =>
      l.title.toLowerCase().includes(q) || l.situation.toLowerCase().includes(q)
    )
  }, [query, lessons])

  useEffect(() => { setVisible(PAGE_SIZE) }, [query])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || visible >= filtered.length) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(v => Math.min(v + PAGE_SIZE, filtered.length))
    }, { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, filtered.length])

  const shown = filtered.slice(0, visible)

  return (
    <div className="space-y-4">
      {query.trim() && (
        <p className="text-xs text-zinc-400 px-1">
          {filtered.length} {isA ? 'bài phù hợp' : 'lessons found'}
        </p>
      )}

      {/* Cards màu sắc — grid 2 cột trên màn rộng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.map(l => {
          const c = getColor(l.id)
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l)}
              className={`text-left bg-zinc-900/80 border rounded-xl p-3.5 hover:bg-zinc-800/60 active:scale-[0.98] transition-all group ${c.border}`}
            >
              <div className="flex items-start gap-3">
                {/* Số bài + chấm màu */}
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <span className={`text-xs font-bold ${c.text}`}>{l.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-[15px] leading-snug ${c.text}`}>{l.title}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{l.situation}</p>
                  <p className="text-[11px] text-zinc-400 mt-1.5">
                    {l.turnCount / 2} {isA ? 'lượt thoại' : 'exchanges'}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {shown.length === 0 && (
        <p className="text-center text-zinc-400 py-10 text-sm">
          {isA ? 'Không tìm thấy bài nào.' : 'No lessons found.'}
        </p>
      )}

      {/* Sentinel — cuộn tới đây tự động tải thêm */}
      {visible < filtered.length && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      )}
    </div>
  )
}

// ── Chi tiết bài học với audio player + karaoke ──────────────────────────────
function LessonView({ lesson, isA, color, onBack }: {
  lesson: Lesson
  isA: boolean
  color: typeof COLORS[0]
  onBack: () => void
}) {
  // Phân giọng cho từng nhân vật — nếu cùng giới thì dùng giọng thứ 2 cho B
  // để 2 nhân vật luôn có giọng khác nhau (female vs female2, male vs male2)
  const genderA = lesson.speakerAGender ?? 'female'
  const genderB = lesson.speakerBGender ?? 'male'
  const voiceA = genderA === 'female' ? 'female' : 'male'
  const voiceB = genderB === genderA
    ? (genderB === 'female' ? 'female2' : 'male2')
    : (genderB === 'female' ? 'female' : 'male')

  const [activeTurn, setActiveTurn] = useState<number | null>(null)
  const [playing,    setPlaying]    = useState(false)
  const [paused,     setPaused]     = useState(false)
  const [speed,      setSpeed]      = useState<Speed>(1)
  const [mode,       setMode]       = useState<AudioMode>('en')
  const [wordSync,   setWordSync]   = useState<WordSync | null>(null)

  const stopRef     = useRef(false)
  const pauseRef    = useRef(false)
  const speedRef    = useRef<Speed>(1)
  const modeRef     = useRef<AudioMode>('en')
  const turnRefs    = useRef<(HTMLDivElement | null)[]>([])
  const wordSyncRef = useRef<WordSync | null>(null)

  // Dừng audio khi thoát trang hoặc back về danh sách
  useEffect(() => {
    return () => {
      stopRef.current = true
      stopSpeaking()
    }
  }, [])

  function changeSpeed(s: Speed) { setSpeed(s); speedRef.current = s }
  function changeMode(m: AudioMode) { setMode(m); modeRef.current = m }

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
      while (pauseRef.current && !stopRef.current) await new Promise(r => setTimeout(r, 100))
      if (stopRef.current) break

      const t = lesson.turns[i]
      setActiveTurn(i)
      turnRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      const targetText = isA ? t.en : t.vi
      const transText  = isA ? t.vi : t.en
      const curMode    = modeRef.current
      const curSpeed   = speedRef.current
      const curVoice   = t.speaker === 'A' ? voiceA : voiceB

      if (curMode === 'en') {
        await speak(t.en, 'en-US', curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: 'en', wordIdx: wi }))
      } else if (curMode === 'vi') {
        await speak(t.vi, 'vi-VN', curVoice, curSpeed, wi => syncWord({ turnIdx: i, lang: 'vi', wordIdx: wi }))
      } else {
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

  function handlePause()  { pauseRef.current = true;  setPaused(true);  pauseCurrentAudio() }
  function handleResume() { pauseRef.current = false; setPaused(false); resumeCurrentAudio() }
  function handleStop()   {
    stopRef.current = true; stopSpeaking()
    setPlaying(false); setPaused(false); setActiveTurn(null); syncWord(null)
  }

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
    { key: 'en',   label: 'EN' },
    { key: 'both', label: isA ? 'EN+VI' : 'VI+EN' },
    { key: 'vi',   label: 'VI' },
  ]

  return (
    <>
      {/* Thanh điều khiển audio — không cuộn, giống CommonPhrases giữ nội dung trong flex */}
      <div className="bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/40 px-4 py-2.5">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-xl px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">

            {/* Nút quay lại danh sách */}
            <button
              onClick={onBack}
              className="shrink-0 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              ← {isA ? 'Danh sách' : 'Back'}
            </button>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Play / Pause / Resume / Stop */}
            <div className="flex items-center gap-1.5">
              {isIdle && (
                <button onClick={() => void startPlayAll()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition">
                  <Play className="w-3 h-3 fill-current" />
                  {isA ? 'Phát tất cả' : 'Play all'}
                </button>
              )}
              {playing && !paused && (
                <button onClick={handlePause}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition">
                  <Pause className="w-3 h-3 fill-current" />
                  {isA ? 'Dừng' : 'Pause'}
                </button>
              )}
              {paused && (
                <button onClick={handleResume}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition">
                  <Play className="w-3 h-3 fill-current" />
                  {isA ? 'Tiếp' : 'Resume'}
                </button>
              )}
              {!isIdle && (
                <button onClick={handleStop}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition">
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}
            </div>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Tốc độ */}
            <div className="flex items-center gap-1">
              {SPEEDS.map(s => (
                <button key={s} onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                    speed === s
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {s}×
                </button>
              ))}
            </div>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Chế độ nghe */}
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-zinc-400 shrink-0" />
              {MODES.map(m => (
                <button key={m.key} onClick={() => changeMode(m.key)}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                    mode === m.key
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Số turn đang phát */}
            {playing && activeTurn !== null && (
              <div className="ml-auto flex items-center gap-1 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-400">{activeTurn + 1}/{lesson.turns.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bong bóng hội thoại — cuộn nội bộ, không cuộn cả trang */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-3 pb-8">
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
                      ? `${color.bg} border ${color.border} shadow-lg`
                      : 'bg-sky-500/15 border border-sky-500/50 shadow-lg shadow-sky-500/10'
                    : isLeft
                      ? 'bg-zinc-900 border border-zinc-800'
                      : 'bg-emerald-500/10 border border-emerald-500/30'
                }`}>
                  {/* Nhãn speaker + nút phát + nút kiểm tra phát âm */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-[10px] font-medium text-zinc-400">
                      {t.speaker === 'A'
                        ? (isA ? (lesson.speakerAName?.vi ?? 'Người A') : (lesson.speakerAName?.en ?? 'Person A'))
                        : (isA ? (lesson.speakerBName?.vi ?? 'Người B') : (lesson.speakerBName?.en ?? 'Person B'))
                      }
                    </p>
                    <div className="flex items-center gap-1">
                      <InlinePronounce
                        text={isA ? t.en : t.vi}
                        lang={isA ? 'en-US' : 'vi-VN'}
                        isA={isA}
                      />
                      <button
                        onClick={() => void playTurn(i)}
                        title={isA ? 'Nghe câu này' : 'Play this line'}
                        className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition ${
                          isActive
                            ? `${color.text} bg-zinc-800/50`
                            : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        <Volume2 className={`w-3 h-3 ${isActive ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Câu chính */}
                  <WordText
                    text={isA ? t.en : t.vi}
                    baseClass={`text-sm leading-relaxed ${isActive ? color.text : 'text-white'}`}
                    wordSync={wordSync}
                    turnIdx={i}
                    lang={isA ? 'en' : 'vi'}
                  />

                  {/* Bản dịch */}
                  <WordText
                    text={isA ? t.vi : t.en}
                    baseClass="text-xs text-zinc-400 italic mt-1 leading-relaxed"
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
    </>
  )
}

// ── Kiểm tra phát âm inline cho 1 câu hội thoại ──────────────────────────────
export function InlinePronounce({ text, lang, isA }: {
  text: string; lang: 'en-US' | 'vi-VN'; isA: boolean
}) {
  const [open,   setOpen]   = useState(false)
  const [status, setStatus] = useState<'idle' | 'listening'>('idle')
  const [score,  setScore]  = useState<number | null>(null)
  const [heard,  setHeard]  = useState('')
  const [words,  setWords]  = useState<Array<{ word: string; ok: boolean }>>([])
  const [err,    setErr]    = useState('')
  const stopRef = useRef<(() => void) | null>(null)

  if (!isSTTSupported()) return null

  function reset() { setScore(null); setHeard(''); setWords([]); setErr('') }

  function start() {
    reset()
    setStatus('listening')
    stopRef.current = startListening(
      lang === 'en-US' ? 'en' : 'vi',
      () => {},
      (last) => {
        setStatus('idle')
        if (last.trim()) {
          setHeard(last)
          setScore(scorePronunciation(text, last))
          setWords(scoreWords(text, last))
        } else {
          setErr(isA ? 'Không nghe rõ, thử lại.' : 'Did not catch that.')
        }
      },
      () => { setStatus('idle'); setErr(isA ? 'Lỗi micro.' : 'Mic error.') },
    )
  }

  function stop() { stopRef.current?.(); setStatus('idle') }

  const fb = score !== null ? pronounceFeedback(score, isA) : null

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); reset() }}
        title={isA ? 'Kiểm tra phát âm câu này' : 'Check pronunciation'}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-zinc-500 hover:text-violet-300 hover:bg-violet-500/15 transition"
      >
        <Mic className="w-3 h-3" />
      </button>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={status === 'listening' ? stop : start}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            status === 'listening'
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
          }`}
        >
          {status === 'listening'
            ? <><Square className="w-3 h-3" /> {isA ? 'Dừng' : 'Stop'}</>
            : <><Mic className="w-3 h-3" /> {isA ? 'Nói lại' : 'Repeat'}</>}
        </button>
        <button onClick={() => { stop(); setOpen(false); reset() }}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition">
          {isA ? 'Đóng' : 'Close'}
        </button>
        {status === 'listening' && (
          <span className="text-[10px] text-zinc-400 animate-pulse">
            {isA ? `Đọc: "${text}"` : `Say: "${text}"`}
          </span>
        )}
      </div>

      {fb && (
        <div className="space-y-1.5">
          <p className={`text-xs font-bold ${fb.color}`}>{score}% · {fb.label}</p>
          {words.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {words.map((w, i) => (
                <span key={i} className={`px-1.5 py-0.5 rounded text-xs ${
                  w.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}>{w.word}</span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-zinc-400">{isA ? 'Bạn đọc' : 'You said'}: "{heard}"</p>
          <button onClick={start}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-300 transition">
            <RotateCcw className="w-2.5 h-2.5" /> {isA ? 'Thử lại' : 'Retry'}
          </button>
        </div>
      )}
      {err && <p className="text-[10px] text-rose-400">{err}</p>}
    </div>
  )
}
