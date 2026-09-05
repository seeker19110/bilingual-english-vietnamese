// StoryReader — màn đọc 1 truyện cổ tích/ngụ ngôn, route /stories/:id (mục 6.4 đặc tả
// trang Nghe). Tải nội dung LAZY qua loadStory() (không import tĩnh — tránh phình bundle).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Play, Pause, Square, Eye, EyeOff, Sparkles } from 'lucide-react'
import Layout from '../../../components/Layout'
import { PageShell } from '@core/PageShell'
import { TwoPane } from '@core/TwoPane'
import PageHeader from '../../../components/PageHeader'
import { useIsDesktopViewport } from '../../../lib/useIsDesktopViewport'
import { CardListSkeleton } from '../../../components/Skeleton'
import KaraokeText, { KARAOKE_INDENT } from '../../../components/KaraokeText'
import { useLang } from '../../../context/useLang'
import { useAuth } from '../../../context/useAuth'
import { getDirection } from '../../../lib/storage'
import { groupLinesByParagraph, getStoryVoice } from '../../../lib/stories'
import { loadStory } from '../../../data/stories/loader'
import type { Story } from '../../../data/stories/index'
import { buildSlugSegment, idFromSlugSegment } from '@core/slug'
import {
  speak,
  stopSpeaking,
  pauseCurrentAudio,
  resumeCurrentAudio,
  unlockAudio,
} from '../../../lib/tts'

export default function StoryReader() {
  const { id: slugParam } = useParams<{ id: string }>()
  const id = slugParam ? idFromSlugSegment(slugParam) : undefined
  const nav = useNavigate()
  const { T } = useLang()
  const { user } = useAuth()
  const isA = getDirection() === 'A' // đích = tiếng Anh (A) hoặc tiếng Việt (B)
  // Ngưỡng 1024px quyết ở JS (xem `TwoPane.tsx`): thanh điều khiển chỉ được dựng MỘT chỗ,
  // ẩn bằng `lg:hidden` sẽ để lại bản thứ hai trong DOM cho trình đọc màn hình.
  const isDesktop = useIsDesktopViewport()

  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false) // mặc định ẨN — trang luyện nghe

  // Đổi truyện (id đổi) → quay lại trạng thái đang tải — pattern so-sánh-prev ngay
  // trong render (không setState đồng bộ trong effect). Mount lần đầu đã đúng mặc định.
  const [prevId, setPrevId] = useState(id)
  if (id !== prevId) {
    setPrevId(id)
    setLoading(true)
    setNotFound(false)
  }

  useEffect(() => {
    if (!id) return
    let alive = true
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

  // URL cũ chỉ có id hoặc slug mô tả không khớp tiêu đề hiện tại → chuyển hướng về URL chuẩn
  // (tránh Google coi 2 URL cùng nội dung là 2 trang khác nhau).
  useEffect(() => {
    if (!story || !id) return
    const canonicalSegment = buildSlugSegment(id, isA ? story.titleEn : story.titleVi)
    if (slugParam !== canonicalSegment) {
      nav(`/truyen-song-ngu/${canonicalSegment}`, { replace: true })
    }
  }, [story, id, isA, slugParam, nav])

  const paragraphs = useMemo(() => (story ? groupLinesByParagraph(story.lines) : []), [story])
  const flatLines = story?.lines ?? []
  // Giọng cố định theo thể loại truyện (không dùng giọng chung toàn app nữa — xem lib/stories.ts)
  // Truyền `plan` để tự hạ giọng khi gói chưa mở khoá giọng Gemini — xem getStoryVoice().
  const storyVoice = story ? getStoryVoice(story.kind, user?.plan) : undefined

  // ── Phát tất cả — 2 nguồn phát riêng biệt (tiếng Việt / tiếng Anh), tuần tự
  // từng câu, tự cuộn tới câu đang đọc. Chọn được đọc bản gốc hay bản dịch.
  const [playing, setPlaying] = useState(false)
  const [playLang, setPlayLang] = useState<'vi' | 'en' | null>(null)
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

  async function playAll(lang: 'vi' | 'en') {
    if (flatLines.length === 0 || playing) return
    unlockAudio()
    stopRef.current = false
    pauseRef.current = false
    setPlaying(true)
    setPlayLang(lang)
    setPaused(false)

    const bcp47 = lang === 'en' ? 'en-US' : 'vi-VN'
    for (let i = 0; i < flatLines.length; i++) {
      if (stopRef.current) break
      while (pauseRef.current && !stopRef.current) await new Promise((r) => setTimeout(r, 100))
      if (stopRef.current) break

      const ln = flatLines[i]
      if (!ln) continue
      setActiveIdx(i)
      setWordIdx(null)
      lineRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })

      await speak(lang === 'en' ? ln.en : ln.vi, bcp47, storyVoice, undefined, (wi) =>
        setWordIdx(wi),
      )
      if (!stopRef.current) await new Promise((r) => setTimeout(r, 300))
    }

    stopRef.current = false
    setPlaying(false)
    setPlayLang(null)
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
    setPlayLang(null)
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
        {/* [2026-09-02, đợt 4 thiết kế lại desktop] Trang chữ để đọc → width reading. */}
        <PageShell width="reading" baseWidth="max-w-3xl" className="!pb-0 text-center">
          <p className="text-zinc-400 text-sm py-16">{T.storyNotFound}</p>
        </PageShell>
      </div>
    )
  }

  const targetLang = isA ? 'en-US' : 'vi-VN'
  // Chỉ số dòng toàn cục = offset cộng dồn của từng đoạn + vị trí trong đoạn —
  // thay cho biến đếm bị gán dần trong JSX (React Compiler cấm reassign khi render).
  const paraOffsets: number[] = []
  let paraOffsetAcc = 0
  for (const para of paragraphs) {
    paraOffsets.push(paraOffsetAcc)
    paraOffsetAcc += para.length
  }

  // Thanh điều khiển audio — tách ra một biến vì nó được đặt ở HAI CHỖ KHÁC NHAU tuỳ khuôn:
  // dưới 1024px nằm trong luồng cuộn như cũ; từ 1024px trở lên chuyển sang cột phụ `sticky`.
  // VÌ SAO ĐỔI CHỖ (đo ở 1280px): truyện dài 3–5 màn hình, nên đọc tới đoạn giữa là Tạm
  // dừng/Dừng/Hiện bản dịch đã trôi khỏi tầm mắt — đúng lúc người đọc cần chúng nhất.
  // 2 nguồn phát riêng (tiếng Việt / tiếng Anh) · Tạm dừng · Dừng · nút hiện bản dịch.
  // `mb-5` chỉ cần ở khuôn trong-luồng; trong cột phụ thì khoảng cách do cột đó tự lo.
  const controls = (
    <div className={`flex flex-wrap items-center gap-2 ${isDesktop ? '' : 'mb-5'}`}>
      {!playing || playLang === 'vi' ? (
        <button
          onClick={() => (playing ? undefined : playAll('vi'))}
          disabled={playing && playLang !== 'vi'}
          className="tap-44 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition disabled:opacity-40"
        >
          <Play className="w-4 h-4 fill-current" />
          {T.playStoryVi}
        </button>
      ) : null}
      {!playing || playLang === 'en' ? (
        <button
          onClick={() => (playing ? undefined : playAll('en'))}
          disabled={playing && playLang !== 'en'}
          className="tap-44 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition disabled:opacity-40"
        >
          <Play className="w-4 h-4 fill-current" />
          {T.playStoryEn}
        </button>
      ) : null}

      {playing && (
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
  )

  // Mục lục đoạn — chỉ dựng ở desktop. Truyện không có tiêu đề chương, nên nhãn lấy mấy chữ
  // đầu của đoạn: đủ để nhận ra "đoạn con cáo gặp con quạ" mà không phải đọc lại cả trang.
  // Đoạn đang được đọc to (khi bấm "Phát tất cả") được đánh dấu để không mất dấu chỗ đang nghe.
  const activePara = (() => {
    if (activeIdx === null) return null
    // paraOffsets tăng dần → đoạn chứa activeIdx là đoạn cuối cùng có offset ≤ activeIdx.
    let found = 0
    for (let i = 0; i < paraOffsets.length; i++) {
      if ((paraOffsets[i] ?? 0) <= activeIdx) found = i
    }
    return found
  })()

  const paragraphToc = (
    <nav
      aria-label={isA ? 'Mục lục các đoạn' : 'Paragraph outline'}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3"
    >
      <h2 className="t-label px-1 pb-2 text-zinc-300">{isA ? 'Các đoạn' : 'Paragraphs'}</h2>
      <ol className="space-y-0.5">
        {paragraphs.map((para, pi) => {
          const first = para[0]
          const preview = first ? (isA ? first.en : first.vi) : ''
          const isActive = activePara === pi
          return (
            <li key={pi}>
              {/* Liên kết neo thật (`<a href="#...">`): mở được ở tab mới, chạy cả khi JS
                  chưa kịp chạy, và trình duyệt tự lo phần cuộn lẫn đưa tiêu điểm bàn phím. */}
              <a
                href={`#doan-${pi}`}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-200 theme-light:text-accent-900'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <span className="shrink-0 font-semibold tabular-nums">{pi + 1}</span>
                <span className="line-clamp-2 leading-snug">{preview}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )

  return (
    <div className="min-h-dvh bg-zinc-950">
      {/* `focus`: trang đọc truyện → ẩn bộ chuyển Studio + huy hiệu streak (xem Layout). */}
      <Layout back onBack={() => nav(-1)} focus />
      {/* [2026-09-02, đợt 4] Trang chữ để đọc → width `reading`.
          [2026-09-05, đợt 1 "desktop giáo dục"] Ở desktop đổi sang `standard`: sau khi trừ cột
          phụ 288–320px, cột chữ còn lại vẫn rơi đúng khoảng đọc 65–75 ký tự mà `reading` nhắm
          tới (xem chú thích của `PageShell`), nên không có gì bị hy sinh để lấy chỗ cho cột
          phụ. Dưới 1024px `baseWidth` vẫn là `max-w-3xl` như cũ, không đổi một pixel nào. */}
      <PageShell width={isDesktop ? 'standard' : 'reading'} baseWidth="max-w-3xl">
        <TwoPane
          isDesktop={isDesktop}
          railLabel={isA ? 'Điều khiển đọc truyện và mục lục đoạn' : 'Reading controls and outline'}
          rail={
            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                {controls}
              </div>
              {paragraphToc}
            </div>
          }
        >
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

          {/* Nghĩa vụ ghi công bản quyền — bắt buộc hiển thị (mục 3, đặc tả trang Nghe).
            Dùng text-zinc-400 (không phải 500) để đạt AAA 7:1 — đây là nội dung
            đọc (mục 4.5 CLAUDE.md), không phải UI phụ. */}
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4 border-l-2 border-zinc-800 pl-2">
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

          {!isDesktop && controls}

          {/* Vùng loan báo cho trình đọc màn hình biết câu nào đang được đọc khi "Phát tất cả"
            đang chạy — người mắt thấy đã có highlight nền (isActive), người dùng screen reader
            cần kênh riêng vì highlight chỉ đổi class, không tự thông báo. */}
          <p aria-live="polite" className="sr-only">
            {playing && activeIdx !== null && flatLines[activeIdx]
              ? isA
                ? flatLines[activeIdx].en
                : flatLines[activeIdx].vi
              : ''}
          </p>

          {/* Nội dung truyện theo đoạn */}
          <div className="space-y-5">
            {paragraphs.map((para, pi) => (
              // `id` là đích của mục lục đoạn ở cột phụ desktop. `scroll-mt-20` chừa đúng chiều
              // cao header sticky, nếu không đoạn được nhảy tới sẽ nằm KHUẤT sau header.
              <div key={pi} id={`doan-${pi}`} className="space-y-2 scroll-mt-20">
                {para.map((ln, li) => {
                  const idx = (paraOffsets[pi] ?? 0) + li
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
                        voice={storyVoice}
                        textClass="text-[15px] leading-relaxed text-zinc-100"
                        buttonClass="w-full px-2 py-1.5 rounded-lg hover:bg-zinc-900/60"
                        disabled={playing}
                        externalState={
                          playing && playLang === (isA ? 'en' : 'vi')
                            ? { playing: isActive, wordIdx: isActive ? wordIdx : null }
                            : undefined
                        }
                      />
                      {showTranslation && (
                        <KaraokeText
                          text={isA ? ln.vi : ln.en}
                          lang={isA ? 'vi-VN' : 'en-US'}
                          voice={storyVoice}
                          textClass={`text-sm text-zinc-400 ${KARAOKE_INDENT}`}
                          buttonClass="w-full px-2 py-1 rounded-lg hover:bg-zinc-900/60"
                          disabled={playing}
                          externalState={
                            playing && playLang === (isA ? 'vi' : 'en')
                              ? { playing: isActive, wordIdx: isActive ? wordIdx : null }
                              : undefined
                          }
                        />
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
                voice={storyVoice}
                textClass="text-sm text-zinc-200 leading-relaxed"
                disabled={playing}
              />
              {showTranslation && (
                <KaraokeText
                  text={isA ? story.moralVi : story.moralEn}
                  lang={isA ? 'vi-VN' : 'en-US'}
                  voice={storyVoice}
                  textClass={`text-xs text-zinc-400 mt-1 ${KARAOKE_INDENT}`}
                  buttonClass="w-full px-2 py-1 rounded-lg hover:bg-zinc-900/60"
                  disabled={playing}
                />
              )}
            </div>
          )}
        </TwoPane>
      </PageShell>
    </div>
  )
}
