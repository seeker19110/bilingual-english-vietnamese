// Lessons — trang Bài học (hội thoại mẫu). [2026-09-06] File này từng dài 1.693 dòng; các phần
// SearchBar · LessonList · LessonView · InlinePronounce · WordText · hằng dùng chung nay nằm ở
// `pages/subjects/english/lessons/`, file này chỉ còn TRANG CHÍNH. `InlinePronounce` re-export
// để `components/CefrLessonViews.tsx` giữ nguyên đường import.
import { useState, useEffect, useDeferredValue } from 'react'
import { usePageTitle } from '../../../lib/usePageTitle'
import { Play, Loader2 } from 'lucide-react'
import Layout from '../../../components/Layout'
import { PageShell } from '@core/PageShell'
import { TwoPane } from '@core/TwoPane'
import PageHeader from '../../../components/PageHeader'
import { useIsDesktopViewport } from '../../../lib/useIsDesktopViewport'
import { getDirection } from '../../../lib/storage'
import { useAuth } from '../../../context/useAuth'
import { getViewedIds, markViewed } from '../../../lib/viewedTracking'
import { loadIndex, loadLesson, type Lesson, type LessonMeta } from '../../../data/lessons/loader'
import type { Direction } from '../../../types'
import { getColor } from './lessons/shared'
import { SearchBar } from './lessons/SearchBar'
import { LessonList } from './lessons/LessonList'
import { LessonView } from './lessons/LessonView'

export { InlinePronounce } from './lessons/InlinePronounce'

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
