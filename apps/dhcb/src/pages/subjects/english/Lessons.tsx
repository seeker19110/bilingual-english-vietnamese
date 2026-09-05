import { useState, useRef, useEffect, memo, useMemo, useDeferredValue } from 'react'
import type { PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../../lib/usePageTitle'
import {
  Play,
  Pause,
  Square,
  Volume2,
  Loader2,
  Search,
  X,
  Mic,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Drama,
  Lock,
  Award,
} from 'lucide-react'
import { startListening, isSTTSupported } from '../../../lib/stt'
import { scorePronunciation, pronounceFeedback, scoreWords } from '../../../lib/pronounceScore'
import Layout from '../../../components/Layout'
import { PageShell } from '@core/PageShell'
import { TwoPane } from '@core/TwoPane'
import PageHeader from '../../../components/PageHeader'
import { useIsDesktopViewport } from '../../../lib/useIsDesktopViewport'
import { getDirection, getUsage, incrementUsage } from '../../../lib/storage'
import { useAuth } from '../../../context/useAuth'
import { getViewedIds, markViewed } from '../../../lib/viewedTracking'
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
} from '../../../lib/tts'
import { pickRandomVoice } from '../../../lib/voiceTiers'
import VoiceRoleBadge from '../../../components/VoiceRoleBadge'
import EvaluationResultView from '../../../components/EvaluationResultView'
import { loadIndex, loadLesson, type Lesson, type LessonMeta } from '../../../data/lessons/loader'
import type { Direction, Plan, EvaluationResult } from '../../../types'
import { startRecording, isRecordingSupported, type Recorder } from '../../../lib/sttServer'
import { callClaude, parseJson } from '../../../lib/ai'
import { speakingFullEvaluationPrompt } from '../../../prompts'
import { effectivePlan } from '../../../lib/promo'
import { isFeatureEnabled } from '../../../lib/planFeatures'
import { getLimits } from '../../../lib/appSettings'
import { useApiThrottle } from '../../../lib/useApiThrottle'

const PAGE_SIZE = 10

type Speed = 0.75 | 1 | 1.25
type AudioMode = 'en' | 'both' | 'vi'

// ── Hệ thống màu sắc — giống CommonPhrases ───────────────────────────────────
const COLORS = [
  {
    bg: 'bg-accent-500/10',
    text: 'text-accent-400 theme-light:text-accent-800',
    border: 'border-accent-500/25',
    dot: 'bg-accent-400',
  },
  {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400 theme-light:text-sky-800',
    border: 'border-sky-500/25',
    dot: 'bg-sky-400',
  },
  {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400 theme-light:text-violet-800',
    border: 'border-violet-500/25',
    dot: 'bg-violet-400',
  },
  {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400 theme-light:text-amber-800',
    border: 'border-amber-500/25',
    dot: 'bg-amber-400',
  },
  {
    bg: 'bg-pink-500/10',
    text: 'text-pink-400 theme-light:text-pink-800',
    border: 'border-pink-500/25',
    dot: 'bg-pink-400',
  },
  {
    bg: 'bg-teal-500/10',
    text: 'text-teal-400 theme-light:text-teal-800',
    border: 'border-teal-500/25',
    dot: 'bg-teal-400',
  },
  {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400 theme-light:text-rose-800',
    border: 'border-rose-500/25',
    dot: 'bg-rose-400',
  },
  {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400 theme-light:text-indigo-800',
    border: 'border-indigo-500/25',
    dot: 'bg-indigo-400',
  },
  {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400 theme-light:text-orange-800',
    border: 'border-orange-500/25',
    dot: 'bg-orange-400',
  },
  {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400 theme-light:text-cyan-800',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
  },
]

function getColor(id: number) {
  // COLORS không rỗng; với id≥1 chỉ số luôn hợp lệ, fallback COLORS[0] phòng id lạ
  return COLORS[(id - 1) % COLORS.length] ?? COLORS[0]!
}

// ── Trạng thái đồng bộ từng chữ: turn nào đang phát, ngôn ngữ nào, từ thứ mấy
interface WordSync {
  turnIdx: number
  lang: 'en' | 'vi'
  wordIdx: number
}

// Component highlight từng từ kiểu karaoke
const WordText = memo(function WordText({
  text,
  baseClass,
  wordSync,
  turnIdx,
  lang,
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
          <span
            key={i}
            className={
              thisIdx === wordSync.wordIdx
                ? 'text-accent-200 bg-accent-500/25 rounded px-0.5 transition-colors'
                : 'transition-colors'
            }
          >
            {part}
          </span>
        )
      })}
    </p>
  )
})

// ── Trang chính ───────────────────────────────────────────────────────────────
export default function Lessons() {
  usePageTitle('Bài học | Môn Tiếng Anh · Đồng hành cùng bạn')
  const dir: Direction = getDirection()
  const isA = dir === 'A'
  // Ngưỡng 1024px quyết ở JS, không phải `lg:` — xem lý do trong `TwoPane.tsx`: ẩn bằng CSS
  // vẫn để nguyên nội dung trong DOM cả hai nhánh, khiến trình đọc màn hình đọc hai lần.
  const isDesktop = useIsDesktopViewport()
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const [index, setIndex] = useState<LessonMeta[]>([])
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [selectedMeta, setSelectedMeta] = useState<LessonMeta | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(false)
  useEffect(() => {
    loadIndex().then(setIndex)
  }, [])

  // Đổi bài đang chọn → bật/tắt trạng thái tải NGAY TRONG RENDER (pattern so-sánh-prev,
  // không setState đồng bộ trong effect); phần async tải bài vẫn nằm ở effect dưới.
  const [prevSelectedMeta, setPrevSelectedMeta] = useState(selectedMeta)
  if (selectedMeta !== prevSelectedMeta) {
    setPrevSelectedMeta(selectedMeta)
    if (!selectedMeta) setLesson(null)
    else setLoadingLesson(true)
  }

  useEffect(() => {
    if (!selectedMeta) return
    let alive = true
    loadLesson(selectedMeta).then((l) => {
      if (alive) {
        setLesson(l)
        setLoadingLesson(false)
      }
    })
    // Đánh dấu "đã xem" vào localStorage — CTA "Tiếp tục bài N" đọc trực tiếp
    // localStorage mỗi render nên khi quay lại danh sách sẽ tự tính lại đúng.
    if (uid) markViewed('lessons', uid, String(selectedMeta.id))
    return () => {
      alive = false
    }
  }, [selectedMeta, uid])

  // Bài đầu tiên (theo thứ tự danh sách) CHƯA xem — gợi ý "Tiếp tục bài N".
  // Đọc trực tiếp localStorage mỗi render (bỏ khóa invalidation viewedRefresh cũ).
  const nextUnviewed = (() => {
    if (!uid || index.length === 0) return null
    const viewed = getViewedIds('lessons', uid)
    return index.find((m) => !viewed.has(String(m.id))) ?? null
  })()

  // Gợi ý "Tiếp tục bài N" — dùng chung cho cả màn danh sách mobile lẫn cột trái desktop.
  const continueCta = nextUnviewed && !query.trim() && (
    <button
      onClick={() => setSelectedMeta(nextUnviewed)}
      className="w-full flex items-center gap-3 bg-accent-500/10 hover:bg-accent-500/15 border border-accent-500/30 rounded-2xl px-4 py-3 mb-4 transition text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-accent-500/20 flex items-center justify-center shrink-0">
        <Play className="w-4 h-4 text-accent-400 theme-light:text-accent-800" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-accent-400 theme-light:text-accent-800 font-medium">
          {isA ? 'Tiếp tục' : 'Continue'}
        </p>
        <p className="text-sm font-semibold text-white truncate">
          {isA ? `Bài ${nextUnviewed.id}: ${nextUnviewed.title}` : `Lesson ${nextUnviewed.id}`}
        </p>
      </div>
    </button>
  )

  // ── Desktop (≥1024px): MỘT màn hình master–detail ─────────────────────────
  // Trước đây desktop đi đúng luồng của điện thoại: danh sách BỊ THAY THẾ bởi chi tiết. Muốn
  // đổi bài phải quay lại rồi cuộn tìm lại từ đầu, trong khi màn 1280px thừa chỗ để giữ cả hai.
  // Dưới 1024px KHÔNG đổi gì — hai nhánh dưới đây giữ nguyên như trước đợt này.
  if (isDesktop) {
    const selectedColor = selectedMeta ? getColor(selectedMeta.id) : null
    return (
      <div className="min-h-dvh bg-zinc-950">
        {/* `focus`: trang ngồi học lâu → ẩn bộ chuyển Studio + huy hiệu streak (xem Layout). */}
        <Layout back focus title={selectedMeta?.title} subtitle={selectedMeta?.situation} />
        <PageShell width="standard" baseWidth="max-w-3xl">
          <TwoPane
            isDesktop
            railSide="left"
            railLabel={isA ? 'Danh sách bài hội thoại' : 'Dialogue list'}
            rail={
              <div className="pr-1">
                <h2 className="t-label px-1 pb-2 text-zinc-300">
                  {isA ? `${index.length} bài hội thoại` : `${index.length} dialogues`}
                </h2>
                <div className="mb-3">
                  <SearchBar query={query} setQuery={setQuery} isA={isA} variant="desktop" />
                </div>
                {continueCta}
                <LessonList
                  lessons={index}
                  isA={isA}
                  query={deferredQuery}
                  onSelect={setSelectedMeta}
                  compact
                  selectedId={selectedMeta?.id}
                />
              </div>
            }
          >
            {!selectedMeta ? (
              // Màn rỗng: KHÔNG tự chọn bài thay người dùng — mở sẵn một bài bất kỳ thì lần
              // sau quay lại họ không phân biệt được đâu là bài mình đang học dở.
              <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/15">
                  <Play className="h-5 w-5 text-accent-400 theme-light:text-accent-800" />
                </div>
                <p className="text-base font-semibold text-white">
                  {isA ? 'Chọn một bài hội thoại để bắt đầu' : 'Pick a dialogue to start'}
                </p>
                <p className="read-body mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                  {isA
                    ? 'Danh sách bài nằm ở cột bên trái và luôn hiện sẵn, nên bạn đổi bài lúc nào cũng được mà không rời trang.'
                    : 'The lesson list stays on the left, so you can switch lessons at any time without leaving this page.'}
                </p>
              </div>
            ) : loadingLesson || !lesson || !selectedColor ? (
              <div className="flex items-center justify-center py-24 text-zinc-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isA ? 'Đang tải bài học…' : 'Loading lesson…'}
              </div>
            ) : (
              <LessonView
                lesson={lesson}
                isA={isA}
                color={selectedColor}
                plan={user?.plan ?? 'free'}
                userId={uid}
                onBack={() => setSelectedMeta(null)}
                variant="desktop"
              />
            )}
          </TwoPane>
        </PageShell>
      </div>
    )
  }

  // ── Màn hình chi tiết bài học (mobile) ────────────────────────────────────
  if (selectedMeta) {
    const c = getColor(selectedMeta.id)
    return (
      <div className="h-[calc(100dvh-var(--bnav-h))] overflow-hidden bg-zinc-950 flex flex-col">
        <Layout title={selectedMeta.title} subtitle={selectedMeta.situation} back />
        {loadingLesson || !lesson ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {isA ? 'Đang tải bài học…' : 'Loading lesson…'}
          </div>
        ) : (
          <LessonView
            lesson={lesson}
            isA={isA}
            color={c}
            plan={user?.plan ?? 'free'}
            userId={uid}
            onBack={() => setSelectedMeta(null)}
          />
        )}
      </div>
    )
  }

  // ── Màn hình danh sách ────────────────────────────────────────────────────
  // Mobile: h-dvh flex col, search cố định dưới cùng
  // Desktop (sm+): layout thường, search ở trên
  return (
    <div className="bg-zinc-950 flex flex-col h-[calc(100dvh-var(--bnav-h))] sm:h-auto sm:block sm:min-h-dvh">
      <Layout back />

      {/* <div> chứ không phải <main>: landmark <main> do PageShell render bên trong. */}
      <div className="flex-1 overflow-y-auto sm:overflow-visible sm:flex-none">
        {/* [2026-09-02, đợt 4 thiết kế lại desktop] Danh sách bài hội thoại → width standard. */}
        <PageShell
          width="standard"
          baseWidth="max-w-3xl"
          className="!pt-4 !pb-2 sm:!pb-[calc(1.5rem+var(--bnav-h))]"
        >
          {/* Tiêu đề trang — ngay dưới AppHeader, cỡ chữ lớn */}
          <PageHeader
            title={isA ? 'Các bài hội thoại mẫu thông dụng' : 'Common sample dialogues'}
            subtitle={
              index.length > 0
                ? isA
                  ? `${index.length} chủ đề hội thoại giao tiếp`
                  : `${index.length} conversation topics`
                : isA
                  ? 'Hội thoại mẫu giao tiếp'
                  : 'Conversation lessons'
            }
          />
          {/* Gợi ý "Tiếp tục bài N" — bài đầu tiên chưa xem, ẩn khi đang tìm kiếm */}
          {continueCta}
          {/* Search bar — chỉ hiện ở trên trên desktop */}
          <div className="hidden sm:block mb-4">
            <SearchBar query={query} setQuery={setQuery} isA={isA} variant="desktop" />
          </div>
          <LessonList lessons={index} isA={isA} query={deferredQuery} onSelect={setSelectedMeta} />
        </PageShell>
      </div>

      {/* Search bar cố định ở dưới — CHỈ trên mobile */}
      <div className="sm:hidden shrink-0 border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-md px-4 pt-3 pb-safe">
        <SearchBar query={query} setQuery={setQuery} isA={isA} variant="mobile" />
      </div>
    </div>
  )
}

// ── Ô tìm kiếm dùng chung ────────────────────────────────────────────────────
function SearchBar({
  query,
  setQuery,
  isA,
  variant = 'desktop',
}: {
  query: string
  setQuery: (v: string) => void
  isA: boolean
  variant?: 'desktop' | 'mobile'
}) {
  const inputId = variant === 'desktop' ? 'lesson-search-desktop' : 'lesson-search-mobile'
  const label = isA
    ? 'Tìm chủ đề bài học (tiếng Anh hoặc tiếng Việt)'
    : 'Search lesson topics (English or Vietnamese)'
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={inputId}
        name="query"
        type="search"
        aria-label={label}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          isA ? 'Tìm bằng tiếng Anh hoặc tiếng Việt…' : 'Search in English or Vietnamese…'
        }
        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-accent-500/60 focus:bg-zinc-900 transition"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          aria-label={isA ? 'Xóa tìm kiếm' : 'Clear search'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// ── Danh sách bài học — nhận query từ cha, IntersectionObserver lazy load ─────
function LessonList({
  lessons,
  isA,
  query,
  onSelect,
  compact = false,
  selectedId,
}: {
  lessons: LessonMeta[]
  isA: boolean
  query: string
  onSelect: (meta: LessonMeta) => void
  /**
   * Khuôn GỌN cho cột phụ desktop (master–detail): luôn MỘT cột và thẻ nhỏ lại. Rail rộng
   * 288–320px, không đủ chỗ cho lưới 2 cột lẫn dòng "N lượt thoại" — nhồi vào thì chữ bị cắt.
   */
  compact?: boolean
  /** Mã bài đang mở ở cột phải — tô đậm để người dùng biết mình đang ở đâu trong danh sách. */
  selectedId?: number
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    return lessons.filter(
      (l) => l.title.toLowerCase().includes(q) || l.situation.toLowerCase().includes(q),
    )
  }, [query, lessons])

  // Đổi từ khóa tìm kiếm → thu về trang đầu — pattern so-sánh-prev ngay trong render.
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    setVisible(PAGE_SIZE)
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || visible >= filtered.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))
      },
      { rootMargin: '300px' },
    )
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

      {/* Cards màu sắc — grid 2 cột trên màn rộng; khuôn `compact` luôn một cột. */}
      <div className={compact ? 'space-y-1.5' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
        {shown.map((l) => {
          const c = getColor(l.id)
          const isSelected = l.id === selectedId
          return (
            <button
              key={l.id}
              onClick={() => onSelect(l)}
              // `aria-current="true"` chứ không chỉ đổi màu: người dùng trình đọc màn hình
              // cũng cần biết mục nào đang mở, mà màu thì họ không thấy.
              aria-current={isSelected ? 'true' : undefined}
              className={`text-left w-full border transition-all group ${
                compact ? 'rounded-xl p-2.5' : 'rounded-xl p-3.5 active:scale-[0.98]'
              } ${
                isSelected
                  ? `bg-zinc-800 ${c.border} ring-1 ring-inset ring-accent-500/40`
                  : `bg-zinc-900/80 hover:bg-zinc-800/60 ${c.border}`
              }`}
            >
              <div className={`flex items-start ${compact ? 'gap-2.5' : 'gap-3'}`}>
                {/* Số bài + chấm màu */}
                <div
                  className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg ${c.bg} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <span className={`text-xs font-bold ${c.text}`}>{l.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold leading-snug ${compact ? 'text-sm' : 'text-[15px]'} ${c.text}`}
                  >
                    {l.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{l.situation}</p>
                  {/* Dòng "N lượt thoại" chỉ có chỗ ở khuôn rộng. */}
                  {!compact && (
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      {l.turnCount / 2} {isA ? 'lượt thoại' : 'exchanges'}
                    </p>
                  )}
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
function LessonView({
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

  // ── Chế độ "Đóng vai" ─────────────────────────────────────────────────────
  // Người dùng chọn 1 vai (A hoặc B) → dòng của vai kia AI đọc bằng TTS như bình thường,
  // dòng của vai người dùng thì DỪNG lại chờ họ bấm ghi âm và tự đọc. Hết hội thoại → gọi
  // AI chấm điểm 1 lần bằng đúng prompt speakingFullEvaluationPrompt() đang dùng ở trang
  // Luyện nói. Giống hệt cách làm ở DialogueView (src/components/CefrLessonViews.tsx),
  // chỉ đổi tên trường dữ liệu cho khớp Lesson/Turn. Bật/tắt qua ma trận tính năng theo gói
  // (feature key "dialogue_roleplay", dùng chung với /learning-path).
  const isPro = isFeatureEnabled(effectivePlan(plan), 'dialogue_roleplay')
  const canRecord = isRecordingSupported()
  const [rolePlay, setRolePlay] = useState<{ role: 'A' | 'B' } | null>(null)
  const [rolePicker, setRolePicker] = useState(false)
  const [rpIdx, setRpIdx] = useState<number | null>(null)
  const [rpRecording, setRpRecording] = useState(false)
  const [rpTranscribing, setRpTranscribing] = useState(false)
  const [rpTranscripts, setRpTranscripts] = useState<Record<number, string>>({})
  const [rpFinished, setRpFinished] = useState(false)
  const [rpEvaluating, setRpEvaluating] = useState(false)
  const [rpEvaluation, setRpEvaluation] = useState<EvaluationResult | null>(null)
  const [rpError, setRpError] = useState('')
  const rpStopRef = useRef(false)
  const rpRecorderRef = useRef<Recorder | null>(null)
  const rpResolveRef = useRef<((text: string) => void) | null>(null)
  const rpWordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { isThrottled: rpThrottled, throttle: rpThrottle } = useApiThrottle()

  function stopWordPacer() {
    if (rpWordTimerRef.current) {
      clearInterval(rpWordTimerRef.current)
      rpWordTimerRef.current = null
    }
  }
  // "Sáng chữ theo tốc độ người đọc": không có mốc thời gian thật của giọng người dùng
  // (STT chỉ trả text sau khi ghi xong) nên ước lượng bằng nhịp đều theo tốc độ đang chọn.
  function startWordPacer(turnIdx: number, text: string, lang: 'en' | 'vi') {
    stopWordPacer()
    const words = text.split(/\s+/).filter(Boolean)
    if (words.length === 0) return
    let wi = 0
    syncWord({ turnIdx, lang, wordIdx: 0 })
    const msPerWord = Math.max(120, 320 / speedRef.current)
    rpWordTimerRef.current = setInterval(() => {
      wi++
      if (wi >= words.length) {
        stopWordPacer()
        return
      }
      syncWord({ turnIdx, lang, wordIdx: wi })
    }, msPerWord)
  }

  function waitForUserTurn(i: number, text: string, lang: 'en' | 'vi'): Promise<string> {
    return new Promise((resolve) => {
      rpResolveRef.current = resolve
      startWordPacer(i, text, lang)
    })
  }

  async function beginRolePlayRecording() {
    if (!canRecord || rpIdx === null || rpRecording) return
    unlockAudio()
    try {
      const rec = await startRecording(isA ? 'en' : 'vi')
      rpRecorderRef.current = rec
      setRpRecording(true)
    } catch {
      setRpError(
        isA
          ? 'Không mở được micro. Kiểm tra quyền truy cập trình duyệt.'
          : 'Could not access microphone. Check browser permissions.',
      )
    }
  }

  async function finishRolePlayRecording() {
    const rec = rpRecorderRef.current
    if (!rec) return
    setRpRecording(false)
    setRpTranscribing(true)
    stopWordPacer()
    let text = ''
    try {
      text = await rec.stop()
    } catch {
      text = ''
    }
    rpRecorderRef.current = null
    setRpTranscribing(false)
    rpResolveRef.current?.(text)
    rpResolveRef.current = null
  }

  function skipRolePlayLine() {
    stopWordPacer()
    if (rpRecorderRef.current) {
      rpRecorderRef.current.cancel()
      rpRecorderRef.current = null
    }
    setRpRecording(false)
    rpResolveRef.current?.('')
    rpResolveRef.current = null
  }

  async function startRolePlay(role: 'A' | 'B') {
    unlockAudio()
    rpStopRef.current = false
    setRolePicker(false)
    setRolePlay({ role })
    setRpFinished(false)
    setRpEvaluation(null)
    setRpError('')
    setRpTranscripts({})
    setActiveTurn(null)
    syncWord(null)

    for (let i = 0; i < lesson.turns.length; i++) {
      if (rpStopRef.current) break
      const t = lesson.turns[i]
      if (!t) continue
      setActiveTurn(i)
      syncWord(null)
      const displayText = isA ? t.en : t.vi
      const displayLang: 'en' | 'vi' = isA ? 'en' : 'vi'

      if (t.speaker === role) {
        setRpIdx(i)
        const text = await waitForUserTurn(i, displayText, displayLang)
        setRpIdx(null)
        if (rpStopRef.current) break
        setRpTranscripts((prev) => ({ ...prev, [i]: text }))
      } else {
        const v = t.speaker === 'A' ? voiceARef.current : voiceBRef.current
        const lang = isA ? 'en-US' : 'vi-VN'
        await speak(displayText, lang, v, speedRef.current, (wi) =>
          syncWord({ turnIdx: i, lang: displayLang, wordIdx: wi }),
        )
        if (!rpStopRef.current) await new Promise((r) => setTimeout(r, 400))
      }
    }

    const wasStopped = rpStopRef.current
    rpStopRef.current = false
    setActiveTurn(null)
    syncWord(null)
    setRpIdx(null)
    if (!wasStopped) setRpFinished(true)
    else setRolePlay(null)
  }

  function stopRolePlay() {
    rpStopRef.current = true
    stopWordPacer()
    stopSpeaking()
    if (rpRecorderRef.current) {
      rpRecorderRef.current.cancel()
      rpRecorderRef.current = null
    }
    rpResolveRef.current?.('')
    rpResolveRef.current = null
    setRpRecording(false)
    setRpTranscribing(false)
    setRolePlay(null)
    setRpFinished(false)
    setRpIdx(null)
    setActiveTurn(null)
    syncWord(null)
  }

  function closeRolePlayResult() {
    setRolePlay(null)
    setRpFinished(false)
    setRpEvaluation(null)
    setRpTranscripts({})
    setActiveTurn(null)
  }

  async function gradeRolePlay() {
    if (rpEvaluating || !rolePlay) return
    const usage = getUsage(userId)
    const planForLimit = effectivePlan(plan)
    if (planForLimit !== 'free' && usage.speakingCount >= getLimits()[planForLimit].speaking) {
      setRpError(
        isA
          ? 'Bạn đã dùng hết lượt chấm điểm hôm nay. Thử lại vào ngày mai nhé.'
          : "You've used all your grading turns today. Try again tomorrow.",
      )
      return
    }
    if (rpThrottled) return
    setRpEvaluating(true)
    setRpError('')
    const role = rolePlay.role
    const sys = speakingFullEvaluationPrompt(isA ? 'A' : 'B')
    const history = lesson.turns.map((t, i) => ({
      role: t.speaker === role ? ('user' as const) : ('assistant' as const),
      content: t.speaker === role ? (rpTranscripts[i] ?? '') : isA ? t.en : t.vi,
    }))
    try {
      const raw = await callClaude(history, sys, 2048, 'speaking')
      const data = parseJson<EvaluationResult>(raw)
      if (!data) {
        throw new Error(
          isA
            ? 'AI trả về định dạng không đúng. Thử lại.'
            : 'AI returned invalid format. Please try again.',
        )
      }
      setRpEvaluation(data)
      incrementUsage(userId, 'speakingCount')
      rpThrottle()
    } catch (e) {
      setRpError(e instanceof Error ? e.message : isA ? 'Lỗi không xác định' : 'Unknown error')
    }
    setRpEvaluating(false)
  }

  // Dừng đóng vai khi rời màn hình
  useEffect(
    () => () => {
      rpStopRef.current = true
      stopWordPacer()
      if (rpRecorderRef.current) rpRecorderRef.current.cancel()
    },
    [],
  )

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
            {!rolePlay && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRolePicker((o) => !o)}
                  aria-expanded={rolePicker}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    rolePicker
                      ? 'bg-violet-500/20 text-violet-300 theme-light:text-violet-800'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {isPro ? (
                    <Drama className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3 text-zinc-500" />
                  )}
                  {isA ? 'Đóng vai' : 'Role-play'}
                </button>
                {rolePicker && (
                  <div className="absolute right-0 z-20 mt-1.5 w-64 glass rounded-xl p-3 animate-fade-in shadow-xl">
                    {isPro ? (
                      <>
                        <p className="text-xs text-zinc-400 mb-2">
                          {isA
                            ? 'Chọn vai bạn muốn đọc — AI sẽ đọc vai còn lại, bạn nói vai của mình.'
                            : 'Pick the role you want to read — AI reads the other role, you speak yours.'}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => void startRolePlay('A')}
                            className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-accent-500/50 text-sm text-zinc-100 transition"
                          >
                            {speakerName('A')}
                          </button>
                          <button
                            onClick={() => void startRolePlay('B')}
                            className="text-left px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-accent-500/50 text-sm text-zinc-100 transition"
                          >
                            {speakerName('B')}
                          </button>
                        </div>
                        {!canRecord && (
                          <p className="text-[11px] text-amber-400 theme-light:text-amber-900 mt-2">
                            {isA
                              ? 'Trình duyệt này không hỗ trợ ghi âm.'
                              : 'This browser does not support recording.'}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-zinc-300 mb-2">
                          {isA
                            ? 'Đóng vai đọc hội thoại + AI chấm điểm là tính năng dành cho gói Pro/VIP.'
                            : 'Dialogue role-play + AI grading is a Pro/VIP feature.'}
                        </p>
                        <Link
                          to="/profile"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent-400 theme-light:text-accent-700 hover:underline"
                        >
                          {isA ? 'Nâng cấp Pro/VIP →' : 'Upgrade to Pro/VIP →'}
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {rolePlay && (
              <button
                onClick={stopRolePlay}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 theme-light:text-red-700 text-xs font-medium transition"
              >
                <Square className="w-3 h-3 fill-current" />
                {isA ? 'Dừng đóng vai' : 'Stop role-play'}
              </button>
            )}

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
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/60">
                      {rpTranscribing ? (
                        <span className="text-xs text-zinc-400">
                          {isA ? 'Đang nhận diện...' : 'Transcribing...'}
                        </span>
                      ) : rpRecording ? (
                        <button
                          onClick={() => void finishRolePlayRecording()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 theme-light:text-red-700 text-xs font-semibold animate-pulse transition"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          {isA ? 'Dừng ghi âm' : 'Stop recording'}
                        </button>
                      ) : (
                        <button
                          onClick={() => void beginRolePlayRecording()}
                          disabled={!canRecord}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-50 text-violet-300 theme-light:text-violet-800 text-xs font-semibold transition"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          {isA ? 'Bấm để nói câu này' : 'Tap to say this line'}
                        </button>
                      )}
                      {!rpRecording && !rpTranscribing && (
                        <button
                          onClick={skipRolePlayLine}
                          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                        >
                          {isA ? 'Bỏ qua' : 'Skip'}
                        </button>
                      )}
                    </div>
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
        <div className="shrink-0 border-t border-zinc-800/40 bg-zinc-950/95 backdrop-blur-md px-4 py-3 pb-safe animate-fade-in">
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <button
              onClick={() => void gradeRolePlay()}
              disabled={rpEvaluating || rpThrottled}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 disabled:opacity-50 text-accent-300 theme-light:text-accent-800 text-sm font-semibold transition"
            >
              {rpEvaluating ? (
                isA ? (
                  'Đang chấm điểm...'
                ) : (
                  'Grading...'
                )
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  {isA ? 'Kết thúc & chấm điểm' : 'Finish & grade'}
                </>
              )}
            </button>
            <button
              onClick={() => void startRolePlay(rolePlay.role)}
              className="shrink-0 px-3 py-2.5 text-xs text-zinc-400 hover:text-white transition"
            >
              {isA ? 'Đọc lại' : 'Read again'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Kiểm tra phát âm inline cho 1 câu hội thoại ──────────────────────────────
export function InlinePronounce({
  text,
  lang,
  isA,
}: {
  text: string
  lang: 'en-US' | 'vi-VN'
  isA: boolean
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'listening'>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [heard, setHeard] = useState('')
  const [words, setWords] = useState<Array<{ word: string; ok: boolean }>>([])
  const [err, setErr] = useState('')
  const stopRef = useRef<(() => void) | null>(null)

  // Dừng nhận diện giọng nói khi rời trang/đóng component để micro KHÔNG mở dai dẳng
  // (~20s tới khi Web Speech tự timeout) và tránh setState sau khi đã unmount.
  useEffect(
    () => () => {
      stopRef.current?.()
    },
    [],
  )

  if (!isSTTSupported()) return null

  function reset() {
    setScore(null)
    setHeard('')
    setWords([])
    setErr('')
  }

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
      () => {
        setStatus('idle')
        setErr(isA ? 'Lỗi micro.' : 'Mic error.')
      },
    )
  }

  function stop() {
    stopRef.current?.()
    setStatus('idle')
  }

  const fb = score !== null ? pronounceFeedback(score, isA) : null

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true)
          reset()
        }}
        title={isA ? 'Kiểm tra phát âm câu này' : 'Check pronunciation'}
        aria-label={isA ? 'Kiểm tra phát âm câu này' : 'Check pronunciation'}
        className="tap-44 shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-zinc-500 hover:text-violet-300 hover:bg-violet-500/15 transition"
      >
        <Mic className="w-[1.125rem] h-[1.125rem]" />
      </button>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={status === 'listening' ? stop : start}
          className={`tap-44 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            status === 'listening'
              ? 'bg-rose-500/20 text-rose-300 theme-light:text-rose-900'
              : 'bg-violet-500/20 text-violet-300 theme-light:text-violet-800 hover:bg-violet-500/30'
          }`}
        >
          {status === 'listening' ? (
            <>
              <Square className="w-3 h-3" /> {isA ? 'Dừng' : 'Stop'}
            </>
          ) : (
            <>
              <Mic className="w-3 h-3" /> {isA ? 'Nói lại' : 'Repeat'}
            </>
          )}
        </button>
        <button
          onClick={() => {
            stop()
            setOpen(false)
            reset()
          }}
          className="tap-44 text-[11px] text-zinc-400 hover:text-zinc-300 transition px-1"
        >
          {isA ? 'Đóng' : 'Close'}
        </button>
        {status === 'listening' && (
          <span className="text-[11px] text-zinc-400 animate-pulse">
            {isA ? `Đọc: "${text}"` : `Say: "${text}"`}
          </span>
        )}
      </div>

      {fb && (
        <div className="space-y-1.5">
          <p className={`text-xs font-bold ${fb.color}`}>
            {score}% · {fb.label}
          </p>
          {words.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {words.map((w, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    w.ok
                      ? 'bg-accent-500/15 text-accent-300'
                      : 'bg-rose-500/15 text-rose-300 theme-light:text-rose-900'
                  }`}
                >
                  {w.word}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-zinc-400">
            {isA ? 'Bạn đọc' : 'You said'}: "{heard}"
          </p>
          <button
            onClick={start}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-300 transition"
          >
            <RotateCcw className="w-2.5 h-2.5" /> {isA ? 'Thử lại' : 'Retry'}
          </button>
        </div>
      )}
      {err && <p className="text-[11px] text-rose-400 theme-light:text-rose-900">{err}</p>}
    </div>
  )
}
