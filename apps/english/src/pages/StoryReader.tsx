// StoryReader — màn đọc 1 truyện cổ tích/ngụ ngôn, route /stories/:id (mục 6.4 đặc tả
// trang Nghe). Tải nội dung LAZY qua loadStory() (không import tĩnh — tránh phình bundle).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, Pause, Square, Eye, EyeOff, Sparkles } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { CardListSkeleton } from '../components/Skeleton'
import KaraokeText, { KARAOKE_INDENT } from '../components/KaraokeText'
import { useLang } from '../context/useLang'
import { getDirection } from '../lib/storage'
import { groupLinesByParagraph } from '../lib/stories'
import { loadStory } from '../data/stories/loader'
import type { Story } from '../data/stories/index'
import { speak, stopSpeaking, pauseCurrentAudio, resumeCurrentAudio, unlockAudio } from '../lib/tts'

export default function StoryReader() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { T } = useLang()
  const isA = getDirection() === 'A' // đích = tiếng Anh (A) hoặc tiếng Việt (B)

  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false) // mặc định ẨN — trang luyện nghe

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    setNotFound(false)
    loadStory(id).then((s) => {
      if (!alive) return
      setLoading(false)
      if (!s) setNotFound(true)
      else setStory(s)
    })
    return () => {
      alive = false
    }
  }, [id])

  const paragraphs = useMemo(() => (story ? groupLinesByParagraph(story.lines) : []), [story])
  const flatLines = story?.lines ?? []

  // ── Phát tất cả — tuần tự từng câu, tự cuộn tới câu đang đọc ────────────────
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [wordIdx, setWordIdx] = useState<number | null>(null)
  const stopRef = useRef(false)
  const pauseRef = useRef(false)
  const lineRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(
    () => () => {
      stopRef.current = true
      stopSpeaking()
    },
    [],
  )

  async function playAll() {
    if (flatLines.length === 0) return
    unlockAudio()
    stopRef.current = false
    pauseRef.current = false
    setPlaying(true)
    setPaused(false)

    const lang = isA ? 'en-US' : 'vi-VN'
    for (let i = 0; i < flatLines.length; i++) {
      if (stopRef.current) break
      while (pauseRef.current && !stopRef.current) await new Promise((r) => setTimeout(r, 100))
      if (stopRef.current) break

      const ln = flatLines[i]
      if (!ln) continue
      setActiveIdx(i)
      setWordIdx(null)
      lineRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      await speak(isA ? ln.en : ln.vi, lang, undefined, undefined, (wi) => setWordIdx(wi))
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 300))
    }

    stopRef.current = false
    setPlaying(false)
    setPaused(false)
    setActiveIdx(null)
    setWordIdx(null)
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
    setActiveIdx(null)
    setWordIdx(null)
  }

  // ── Trạng thái tải / rỗng / lỗi ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout back onBack={() => nav(-1)} />
        <CardListSkeleton rows={4} />
      </div>
    )
  }

  if (notFound || !story) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout back onBack={() => nav(-1)} />
        <main className="max-w-3xl mx-auto px-4 pt-6 text-center">
          <p className="text-zinc-400 text-sm py-16">{T.storyNotFound}</p>
        </main>
      </div>
    )
  }

  const targetLang = isA ? 'en-US' : 'vi-VN'
  let globalIdx = -1

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout back onBack={() => nav(-1)} />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl leading-none" aria-hidden="true">
            {story.flag}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-300 theme-light:text-accent-800 font-medium">
            {story.level}
          </span>
        </div>
        <PageHeader
          title={isA ? story.titleEn : story.titleVi}
          subtitle={isA ? story.titleVi : story.titleEn}
        />

        {/* Nghĩa vụ ghi công bản quyền — bắt buộc hiển thị (mục 3, đặc tả trang Nghe) */}
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-4 border-l-2 border-zinc-800 pl-2">
          {T.sourceLabel}: {story.source.en}
          {story.source.enUrl && (
            <>
              {' · '}
              <a
                href={story.source.enUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-300"
              >
                {story.source.enUrl}
              </a>
            </>
          )}
          <br />
          {story.source.vi}
        </p>

        {/* Thanh điều khiển: Phát tất cả / Tạm dừng / Dừng + nút hiện bản dịch */}
        <div className="flex items-center gap-2 mb-5">
          {!playing ? (
            <button
              onClick={playAll}
              className="tap-44 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
            >
              <Play className="w-4 h-4 fill-current" />
              {T.playWholeStory}
            </button>
          ) : (
            <>
              <button
                onClick={paused ? handleResume : handlePause}
                aria-label={paused ? (isA ? 'Tiếp tục' : 'Resume') : isA ? 'Tạm dừng' : 'Pause'}
                className="tap-44 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
              >
                {paused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                {paused ? (isA ? 'Tiếp tục' : 'Resume') : isA ? 'Tạm dừng' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                aria-label={isA ? 'Dừng' : 'Stop'}
                className="tap-44 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
              >
                <Square className="w-4 h-4 fill-current" />
                {isA ? 'Dừng' : 'Stop'}
              </button>
            </>
          )}

          <button
            onClick={() => setShowTranslation((v) => !v)}
            aria-pressed={showTranslation}
            className="tap-44 ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 text-xs font-medium transition"
          >
            {showTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showTranslation ? T.hideTranslation : T.showTranslation}
          </button>
        </div>

        {/* Nội dung truyện theo đoạn */}
        <div className="space-y-5">
          {paragraphs.map((para, pi) => (
            <div key={pi} className="space-y-2">
              {para.map((ln, li) => {
                globalIdx += 1
                const idx = globalIdx
                const isActive = playing && activeIdx === idx
                return (
                  <div
                    key={li}
                    ref={(el) => {
                      lineRefs.current[idx] = el
                    }}
                    className={`rounded-lg transition ${isActive ? 'bg-accent-500/10' : ''}`}
                  >
                    <KaraokeText
                      text={isA ? ln.en : ln.vi}
                      lang={targetLang}
                      textClass="text-[15px] leading-relaxed text-zinc-100"
                      buttonClass="w-full px-2 py-1.5 rounded-lg hover:bg-zinc-900/60"
                      externalState={
                        playing
                          ? { playing: isActive, wordIdx: isActive ? wordIdx : null }
                          : undefined
                      }
                    />
                    {showTranslation && (
                      <p className={`text-sm text-zinc-400 ${KARAOKE_INDENT}`}>
                        {isA ? ln.vi : ln.en}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bài học rút ra — chỉ truyện ngụ ngôn */}
        {story.kind === 'fable' && story.moralEn && story.moralVi && (
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 theme-light:text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {T.moralLabel}
            </p>
            <KaraokeText
              text={isA ? story.moralEn : story.moralVi}
              lang={targetLang}
              textClass="text-sm text-zinc-200 leading-relaxed"
            />
            {showTranslation && (
              <p className={`text-xs text-zinc-400 mt-1 ${KARAOKE_INDENT}`}>
                {isA ? story.moralVi : story.moralEn}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
