// apps/dhcb/src/pages/subjects/english/lessons/LessonView.tsx — chi tiết bài học: audio player +
// karaoke. Tách từ Lessons.tsx 2026-09-06 (mã giữ nguyên); cùng ngày tách tiếp chế độ "Đóng vai"
// ra useRolePlay.ts + RolePlayToolbar/RolePlayTurnControls/RolePlayFinishBar.

import { useState, useRef, useEffect, useMemo } from 'react'
import type { PointerEvent } from 'react'
import { Play, Pause, Square, Volume2, ChevronUp, ChevronDown } from 'lucide-react'
import {
  speak,
  stopSpeaking,
  pauseCurrentAudio,
  resumeCurrentAudio,
  unlockAudio,
  prefetchSpeech,
  getRatePref,
  setRatePref,
  type Voice,
} from '../../../../lib/tts'
import { pickRandomVoice } from '../../../../lib/voiceTiers'
import VoiceRoleBadge from '../../../../components/VoiceRoleBadge'
import EvaluationResultView from '../../../../components/EvaluationResultView'
import { type Lesson } from '../../../../data/lessons/loader'
import type { Plan } from '../../../../types'
import { COLORS } from './shared'
import type { Speed, AudioMode, WordSync } from './shared'
import { WordText } from './WordText'
import { InlinePronounce } from './InlinePronounce'
import { useRolePlay } from './useRolePlay'
import { RolePlayToolbar } from './RolePlayToolbar'
import { RolePlayTurnControls } from './RolePlayTurnControls'
import { RolePlayFinishBar } from './RolePlayFinishBar'

// ── Chi tiết bài học với audio player + karaoke ──────────────────────────────
export function LessonView({
  lesson,
  isA,
  color,
  plan,
  userId,
  onBack,
  variant = 'mobile',
}: {
  lesson: Lesson
  isA: boolean
  color: (typeof COLORS)[0]
  plan: Plan
  userId: string
  onBack: () => void
  /**
   * Khuôn dựng — QUYẾT ĐỊNH BỞI JS chứ không phải `lg:` (xem luật của `TwoPane`).
   *
   * - `mobile`: như trước — cột dọc chiếm trọn chiều cao, thanh điều khiển đứng yên ở trên,
   *   bong bóng hội thoại cuộn NỘI BỘ. Đúng cho màn hình chỉ chứa được một thứ một lúc.
   * - `desktop`: nằm trong cột phải của master–detail. Ở đây trang đã cuộn theo cả trang rồi,
   *   nên cuộn nội bộ nữa là hai thanh cuộn lồng nhau; thanh điều khiển chuyển sang `sticky`
   *   để vẫn bám theo, còn nút "← Danh sách" bỏ đi vì danh sách hiện sẵn bên trái.
   */
  variant?: 'mobile' | 'desktop'
}) {
  const isDesktopPane = variant === 'desktop'
  // Phân giọng cho từng nhân vật — RANDOM trong số giọng gói hiện tại cho phép (đúng giới
  // tính của vai), đổi mỗi lần mở bài học khác/mở lại, để người dùng nghe thử nhiều giọng rồi
  // chọn giọng ưng ý làm mặc định (nút "Đặt mặc định" ở VoiceRoleBadge).
  const genderA = lesson.speakerAGender ?? 'female'
  const genderB = lesson.speakerBGender ?? 'male'
  const initialVoices = useMemo<{ voiceA: Voice; voiceB: Voice }>(() => {
    const a = pickRandomVoice(genderA, plan)
    let b = pickRandomVoice(genderB, plan)
    for (let i = 0; i < 5 && b === a; i++) b = pickRandomVoice(genderB, plan)
    return { voiceA: a, voiceB: b }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, genderA, genderB, plan])

  const [voiceA, setVoiceA] = useState<Voice>(initialVoices.voiceA)
  const [voiceB, setVoiceB] = useState<Voice>(initialVoices.voiceB)
  const voiceARef = useRef<Voice>(initialVoices.voiceA)
  const voiceBRef = useRef<Voice>(initialVoices.voiceB)
  // Đổi bài học → nhận cặp giọng random mới: state reset bằng pattern so-sánh-prev
  // ngay trong render (không setState đồng bộ trong effect); ref đồng bộ ở effect dưới.
  const [prevInitialVoices, setPrevInitialVoices] = useState(initialVoices)
  if (initialVoices !== prevInitialVoices) {
    setPrevInitialVoices(initialVoices)
    setVoiceA(initialVoices.voiceA)
    setVoiceB(initialVoices.voiceB)
  }
  useEffect(() => {
    voiceARef.current = initialVoices.voiceA
    voiceBRef.current = initialVoices.voiceB
  }, [initialVoices])

  function changeVoiceA(v: Voice) {
    setVoiceA(v)
    voiceARef.current = v
  }
  function changeVoiceB(v: Voice) {
    setVoiceB(v)
    voiceBRef.current = v
  }

  const [activeTurn, setActiveTurn] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  // Panel "Cài đặt giọng" ẩn mặc định, bấm nhãn ở thanh control mới hiện; đặt xong 1 giọng thì
  // tự ẩn lại sau 3s (đỡ chiếm chỗ màn hình nhỏ).
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false)
  const hideVoiceSettingsRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (hideVoiceSettingsRef.current) clearTimeout(hideVoiceSettingsRef.current)
    },
    [],
  )
  function handleVoiceSet() {
    if (hideVoiceSettingsRef.current) clearTimeout(hideVoiceSettingsRef.current)
    hideVoiceSettingsRef.current = setTimeout(() => setVoiceSettingsOpen(false), 3000)
  }
  const [speed, setSpeed] = useState<Speed>(getRatePref())
  const [mode, setMode] = useState<AudioMode>('en')
  const [wordSync, setWordSync] = useState<WordSync | null>(null)

  const stopRef = useRef(false)
  const pauseRef = useRef(false)
  const speedRef = useRef<Speed>(getRatePref())
  const modeRef = useRef<AudioMode>('en')
  const turnRefs = useRef<(HTMLDivElement | null)[]>([])
  const wordSyncRef = useRef<WordSync | null>(null)
  const speedDragRef = useRef<{ startY: number; steps: number } | null>(null)

  // Dừng audio khi thoát trang hoặc back về danh sách
  useEffect(() => {
    return () => {
      stopRef.current = true
      stopSpeaking()
    }
  }, [])

  function changeSpeed(s: Speed) {
    setSpeed(s)
    speedRef.current = s
    setRatePref(s)
  }
  function changeMode(m: AudioMode) {
    setMode(m)
    modeRef.current = m
  }

  function syncWord(ws: WordSync | null) {
    const prev = wordSyncRef.current
    if (!ws) {
      if (prev !== null) {
        wordSyncRef.current = null
        setWordSync(null)
      }
      return
    }
    if (prev?.turnIdx === ws.turnIdx && prev?.lang === ws.lang && prev?.wordIdx === ws.wordIdx)
      return
    wordSyncRef.current = ws
    setWordSync({ ...ws })
  }

  async function startPlayAll() {
    unlockAudio() // mở khoá audio iOS NGAY trong cú bấm (trước mọi await)
    stopRef.current = false
    pauseRef.current = false
    setPlaying(true)
    setPaused(false)
    setActiveTurn(null)

    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang = isA ? 'vi-VN' : 'en-US'

    // Nạp TRƯỚC audio các lượt (chạy nền, tuần tự) để phát liền mạch không khựng.
    // Tải nhanh hơn đọc nên bộ nạp luôn đi trước trình phát; trùng câu thì gộp (dedup).
    void (async () => {
      for (const t of lesson.turns) {
        if (stopRef.current) break
        const v = t.speaker === 'A' ? voiceARef.current : voiceBRef.current
        const m = modeRef.current
        if (m === 'en' || m === 'both') await prefetchSpeech(t.en, 'en-US', v)
        if (m === 'vi' || m === 'both') await prefetchSpeech(t.vi, 'vi-VN', v)
      }
    })()

    for (let i = 0; i < lesson.turns.length; i++) {
      if (stopRef.current) break
      while (pauseRef.current && !stopRef.current) await new Promise((r) => setTimeout(r, 100))
      if (stopRef.current) break

      const t = lesson.turns[i]
      if (!t) continue // i < turns.length nên t luôn có; guard để TS narrow kiểu
      setActiveTurn(i)
      turnRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      const targetText = isA ? t.en : t.vi
      const transText = isA ? t.vi : t.en
      const curMode = modeRef.current
      const curSpeed = speedRef.current
      const curVoice = t.speaker === 'A' ? voiceARef.current : voiceBRef.current

      if (curMode === 'en') {
        await speak(t.en, 'en-US', curVoice, curSpeed, (wi) =>
          syncWord({ turnIdx: i, lang: 'en', wordIdx: wi }),
        )
      } else if (curMode === 'vi') {
        await speak(t.vi, 'vi-VN', curVoice, curSpeed, (wi) =>
          syncWord({ turnIdx: i, lang: 'vi', wordIdx: wi }),
        )
      } else {
        const tLang = isA ? 'en' : 'vi'
        const rLang = isA ? 'vi' : 'en'
        await speak(targetText, targetLang, curVoice, curSpeed, (wi) =>
          syncWord({ turnIdx: i, lang: tLang, wordIdx: wi }),
        )
        if (!stopRef.current) {
          syncWord(null)
          await new Promise((r) => setTimeout(r, 250))
          await speak(transText, transLang, curVoice, curSpeed, (wi) =>
            syncWord({ turnIdx: i, lang: rLang, wordIdx: wi }),
          )
        }
      }

      syncWord(null)
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 500))
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
    pauseCurrentAudio()
  }
  function handleResume() {
    pauseRef.current = false
    setPaused(false)
    resumeCurrentAudio()
  }
  function handleStop() {
    stopRef.current = true
    stopSpeaking()
    setPlaying(false)
    setPaused(false)
    setActiveTurn(null)
    syncWord(null)
  }

  async function playTurn(idx: number) {
    unlockAudio() // mở khoá audio iOS NGAY trong cú bấm (trước mọi await)
    if (playing || paused) handleStop()
    await new Promise((r) => setTimeout(r, 80))

    const t = lesson.turns[idx]
    if (!t) return // idx ngoài phạm vi thì không phát gì
    const targetLang = isA ? 'en-US' : 'vi-VN'
    const transLang = isA ? 'vi-VN' : 'en-US'
    const targetText = isA ? t.en : t.vi
    const transText = isA ? t.vi : t.en
    const curMode = modeRef.current
    const curSpeed = speedRef.current
    const curVoice = t.speaker === 'A' ? voiceARef.current : voiceBRef.current

    if (curMode === 'en') {
      await speak(t.en, 'en-US', curVoice, curSpeed, (wi) =>
        syncWord({ turnIdx: idx, lang: 'en', wordIdx: wi }),
      )
    } else if (curMode === 'vi') {
      await speak(t.vi, 'vi-VN', curVoice, curSpeed, (wi) =>
        syncWord({ turnIdx: idx, lang: 'vi', wordIdx: wi }),
      )
    } else {
      const tLang = isA ? 'en' : 'vi'
      const rLang = isA ? 'vi' : 'en'
      await speak(targetText, targetLang, curVoice, curSpeed, (wi) =>
        syncWord({ turnIdx: idx, lang: tLang, wordIdx: wi }),
      )
      syncWord(null)
      await new Promise((r) => setTimeout(r, 250))
      await speak(transText, transLang, curVoice, curSpeed, (wi) =>
        syncWord({ turnIdx: idx, lang: rLang, wordIdx: wi }),
      )
    }
    syncWord(null)
  }

  // ── Chế độ "Đóng vai" — state + logic ở useRolePlay.ts (tách 2026-09-06) ───────────
  const {
    isPro,
    canRecord,
    rolePlay,
    rolePicker,
    setRolePicker,
    rpIdx,
    rpRecording,
    rpTranscribing,
    rpFinished,
    rpEvaluating,
    rpEvaluation,
    rpError,
    rpThrottled,
    startRolePlay,
    stopRolePlay,
    closeRolePlayResult,
    gradeRolePlay,
    beginRolePlayRecording,
    finishRolePlayRecording,
    skipRolePlayLine,
  } = useRolePlay({
    lesson,
    isA,
    plan,
    userId,
    speedRef,
    voiceARef,
    voiceBRef,
    setActiveTurn,
    syncWord,
  })

  const speakerName = (role: 'A' | 'B') =>
    role === 'A'
      ? isA
        ? (lesson.speakerAName?.vi ?? 'Người A')
        : (lesson.speakerAName?.en ?? 'Person A')
      : isA
        ? (lesson.speakerBName?.vi ?? 'Người B')
        : (lesson.speakerBName?.en ?? 'Person B')

  const isIdle = !playing && !paused && !rolePlay
  const SPEEDS: Speed[] = [0.75, 1, 1.25]

  function stepSpeed(delta: number) {
    const i = SPEEDS.indexOf(speedRef.current)
    const next = SPEEDS[(i + delta + SPEEDS.length) % SPEEDS.length]
    if (next !== undefined) changeSpeed(next)
  }
  function onSpeedPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    speedDragRef.current = { startY: e.clientY, steps: 0 }
  }
  function onSpeedPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = speedDragRef.current
    if (!d) return
    const diff = e.clientY - d.startY
    const targetSteps = Math.trunc(-diff / 32)
    if (targetSteps !== d.steps) {
      stepSpeed(targetSteps - d.steps)
      d.steps = targetSteps
    }
  }
  function onSpeedPointerUp() {
    speedDragRef.current = null
  }

  const MODES: { key: AudioMode; label: string }[] = [
    { key: 'en', label: 'EN' },
    { key: 'both', label: isA ? 'EN+VI' : 'VI+EN' },
    { key: 'vi', label: 'VI' },
  ]

  // Đang xem kết quả chấm điểm đóng vai → thay toàn bộ nội dung màn bài học.
  if (rpEvaluation) {
    return (
      <EvaluationResultView
        evaluation={rpEvaluation}
        onClose={closeRolePlayResult}
        dir={isA ? 'A' : 'B'}
      />
    )
  }

  return (
    <>
      {/* Thanh điều khiển audio — không cuộn, giống CommonPhrases giữ nội dung trong flex.
          Ở khuôn desktop nó nằm trong luồng cuộn của trang nên phải `sticky`: truyện/hội thoại
          dài vài màn hình, mà Tạm dừng/Dừng là thứ cần đúng lúc đang nghe dở. `top-16` chừa
          đúng header sticky cao 56px cộng khoảng thở, khớp `top-20` của cột phụ `TwoPane`. */}
      <div
        className={
          isDesktopPane
            ? 'sticky top-16 z-10 mb-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/95 backdrop-blur-sm px-3 py-2.5'
            : 'bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/40 px-4 py-2.5'
        }
      >
        <div className={isDesktopPane ? '' : 'max-w-3xl mx-auto'}>
          <div className="glass rounded-xl px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Nút quay lại danh sách — CHỈ khuôn mobile. Ở desktop danh sách đứng sẵn bên
                trái nên nút này vừa thừa vừa gây hiểu nhầm là sẽ rời trang. */}
            {!isDesktopPane && (
              <>
                <button
                  onClick={onBack}
                  className="tap-44-y shrink-0 text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
                >
                  ← {isA ? 'Danh sách' : 'Back'}
                </button>

                <div className="h-3.5 w-px bg-zinc-700" />
              </>
            )}

            {/* Play / Pause / Resume / Stop */}
            <div className="flex items-center gap-1.5">
              {isIdle && (
                <button
                  onClick={() => void startPlayAll()}
                  className="tap-44-y flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-xs font-medium transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isA ? 'Phát tất cả' : 'Play all'}
                </button>
              )}
              {playing && !paused && (
                <button
                  onClick={handlePause}
                  className="tap-44-y flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 theme-light:text-amber-900 text-xs font-medium transition"
                >
                  <Pause className="w-3 h-3 fill-current" />
                  {isA ? 'Dừng' : 'Pause'}
                </button>
              )}
              {paused && (
                <button
                  onClick={handleResume}
                  className="tap-44-y flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-xs font-medium transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {isA ? 'Tiếp' : 'Resume'}
                </button>
              )}
              {!isIdle && !rolePlay && (
                <button
                  onClick={handleStop}
                  className="tap-44 w-6 h-6 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}
            </div>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Tốc độ — chỉ hiện tốc độ hiện tại, vuốt lên/xuống (hoặc bấm mũi tên) để đổi */}
            <div
              onPointerDown={onSpeedPointerDown}
              onPointerMove={onSpeedPointerMove}
              onPointerUp={onSpeedPointerUp}
              onPointerCancel={onSpeedPointerUp}
              className="flex items-center gap-0.5 cursor-ns-resize touch-none select-none"
              title={isA ? 'Vuốt lên/xuống để đổi tốc độ' : 'Swipe up/down to change speed'}
            >
              <button
                type="button"
                onClick={() => stepSpeed(-1)}
                aria-label={isA ? 'Tốc độ chậm hơn' : 'Slower'}
                className="tap-44 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="min-w-[30px] text-center px-1.5 py-0.5 rounded text-xs font-medium bg-sky-500/20 text-sky-300 theme-light:text-sky-900 border border-sky-500/40">
                {speed}×
              </span>
              <button
                type="button"
                onClick={() => stepSpeed(1)}
                aria-label={isA ? 'Tốc độ nhanh hơn' : 'Faster'}
                className="tap-44 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Chế độ nghe */}
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-zinc-400 shrink-0" />
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => changeMode(m.key)}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                    mode === m.key
                      ? 'bg-violet-500/20 text-violet-300 theme-light:text-violet-800 border border-violet-500/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="h-3.5 w-px bg-zinc-700" />

            {/* Đóng vai — chỉ Pro/VIP. Free thấy nút khoá + link nâng cấp. */}
            <RolePlayToolbar
              isA={isA}
              isPro={isPro}
              canRecord={canRecord}
              rolePlay={rolePlay}
              rolePicker={rolePicker}
              setRolePicker={setRolePicker}
              speakerName={speakerName}
              startRolePlay={startRolePlay}
              stopRolePlay={stopRolePlay}
            />

            {/* Nút mở/ẩn panel giọng — nằm ở phần còn dư của thanh control */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {(playing || rolePlay) && activeTurn !== null && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                  <span className="text-[11px] text-zinc-400">
                    {activeTurn + 1}/{lesson.turns.length}
                  </span>
                </div>
              )}
              {!rolePlay && (
                <button
                  type="button"
                  onClick={() => setVoiceSettingsOpen((o) => !o)}
                  aria-expanded={voiceSettingsOpen}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium transition ${
                    voiceSettingsOpen
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isA ? 'Cài đặt giọng' : 'Voice settings'}
                </button>
              )}
            </div>
          </div>

          {rpError && (
            <p className="text-[11px] text-red-400 theme-light:text-red-700 mt-1.5 px-1">
              {rpError}
            </p>
          )}

          {/* Giọng đang phát cho từng nhân vật — vuốt lên/xuống để đổi ngay + nút đặt mặc định —
              chỉ hiện khi bấm "Cài đặt giọng", tự ẩn 3s sau khi đặt mặc định */}
          {voiceSettingsOpen && !rolePlay && (
            <div className="flex gap-2 mt-2 animate-fade-in">
              <VoiceRoleBadge
                voice={voiceA}
                gender={genderA}
                label="A"
                isA={isA}
                plan={plan}
                onChange={changeVoiceA}
                onSet={handleVoiceSet}
              />
              <VoiceRoleBadge
                voice={voiceB}
                gender={genderB}
                label="B"
                isA={isA}
                plan={plan}
                onChange={changeVoiceB}
                onSet={handleVoiceSet}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bong bóng hội thoại — khuôn mobile cuộn NỘI BỘ (không cuộn cả trang); khuôn desktop
          nằm trong luồng cuộn chung của `PageShell` nên không tự cuộn nữa. */}
      <div className={isDesktopPane ? '' : 'flex-1 overflow-y-auto'}>
        <div
          className={
            isDesktopPane ? 'space-y-3 pb-8' : 'max-w-3xl mx-auto px-4 py-4 space-y-3 pb-8'
          }
        >
          {lesson.turns.map((t, i) => {
            const isActive = activeTurn === i
            const isLeft = t.speaker === 'A'
            const isMyTurn = rolePlay !== null && rpIdx === i

            return (
              <div
                key={i}
                ref={(el) => {
                  turnRefs.current[i] = el
                }}
                className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 transition-all duration-300 ${
                    isActive
                      ? isLeft
                        ? `${color.bg} border ${color.border} shadow-lg`
                        : 'bg-sky-500/15 border border-sky-500/50 shadow-lg shadow-sky-500/10'
                      : isLeft
                        ? 'bg-zinc-900 border border-zinc-800'
                        : 'bg-accent-500/10 border border-accent-500/30'
                  } ${isMyTurn ? 'ring-2 ring-offset-1 ring-offset-zinc-950 ring-accent-500/60 animate-pulse' : ''}`}
                >
                  {/* Nhãn speaker + nút phát + nút kiểm tra phát âm */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-[11px] font-medium text-zinc-400">
                      {t.speaker === 'A'
                        ? isA
                          ? (lesson.speakerAName?.vi ?? 'Người A')
                          : (lesson.speakerAName?.en ?? 'Person A')
                        : isA
                          ? (lesson.speakerBName?.vi ?? 'Người B')
                          : (lesson.speakerBName?.en ?? 'Person B')}
                      {isMyTurn && (
                        <span className="ml-1.5 text-violet-400 theme-light:text-violet-800">
                          {isA ? '· đến lượt bạn' : '· your turn'}
                        </span>
                      )}
                    </p>
                    {/* gap-2 để vùng chạm 44px của 2 nút cạnh nhau không đè lên nhau */}
                    {!rolePlay && (
                      <div className="flex items-center gap-2">
                        <InlinePronounce
                          text={isA ? t.en : t.vi}
                          lang={isA ? 'en-US' : 'vi-VN'}
                          isA={isA}
                        />
                        <button
                          onClick={() => void playTurn(i)}
                          title={isA ? 'Nghe câu này' : 'Play this line'}
                          aria-label={isA ? 'Nghe câu này' : 'Play this line'}
                          className={`tap-44 shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition ${
                            isActive
                              ? `${color.text} bg-zinc-800/50`
                              : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <Volume2
                            className={`w-[1.125rem] h-[1.125rem] ${isActive ? 'animate-pulse' : ''}`}
                          />
                        </button>
                      </div>
                    )}
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

                  {/* Đến lượt người dùng trong chế độ đóng vai → nút ghi âm thay vì phát TTS */}
                  {isMyTurn && (
                    <RolePlayTurnControls
                      isA={isA}
                      canRecord={canRecord}
                      rpRecording={rpRecording}
                      rpTranscribing={rpTranscribing}
                      beginRolePlayRecording={beginRolePlayRecording}
                      finishRolePlayRecording={finishRolePlayRecording}
                      skipRolePlayLine={skipRolePlayLine}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kết thúc đóng vai xong (chưa chấm) → thanh dưới cùng màn hình, luôn trong tầm tay
          bấm (không phải cuộn lên) — giống thanh tìm kiếm cố định dưới ở màn danh sách. */}
      {rolePlay && rpFinished && (
        <RolePlayFinishBar
          isA={isA}
          rpEvaluating={rpEvaluating}
          rpThrottled={rpThrottled}
          gradeRolePlay={gradeRolePlay}
          readAgain={() => void startRolePlay(rolePlay.role)}
        />
      )}
    </>
  )
}
