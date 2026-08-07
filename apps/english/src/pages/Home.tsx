import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  PenLine,
  Mic,
  ChevronRight,
  BookOpen,
  History,
  Target,
  TrendingUp,
  Play,
  Brain,
  Video,
  Bot,
  X,
  Sparkles,
  Headphones,
  BookMarked,
} from 'lucide-react'
import Layout from '../components/Layout'
import PricePromoBanner from '../components/PricePromoBanner'
import { getDirection } from '../lib/storage'
import type { Direction } from '../types'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { useCloudSync } from '../lib/useCloudSync'
import type { CefrLevel } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import { getLearnedWords, getRecentlyLearnedWords } from '../lib/vocab'
import {
  getDoneGrammar,
  computeLockedMapPersisted,
  findNextStep,
  circleDoneCount,
} from '../lib/cefrProgress'
import { getPassedExamLevels } from '../lib/cefrExam'
import { getSRSStats } from '../lib/srs'
import { getDailyLearned, getDailyMax } from '../lib/curriculum'
import {
  shouldShowComeback,
  dismissComebackToday,
  comebackDaysAway,
  COMEBACK_SRS_CARDS,
  COMEBACK_NEW_WORDS,
} from '../lib/comeback'

// Số từ vừa học tối đa gợi ý cho 1 phiên Speaking (② M4) — đủ để AI có ngữ cảnh,
// không phình prompt (giống cap 20 từ ở StudyTabs.tsx cho `?words=` từ URL).
const RECENT_WORDS_FOR_SPEAKING = 8

// ── Nội dung cards theo chiều học và ngôn ngữ giao diện ──────────────────────
type IconType = typeof MessageCircle
interface ModeTag {
  label: string
  cls: string
}
interface ModeSubItem {
  path: string
  icon: IconType
  label: string
  color: string
  // Mô tả đầy đủ cho aria-label (label hiện trên nút chỉ ngắn gọn "Chat"/"Nói"/"Viết")
  fullDesc: string
}
type ModeCard =
  | {
      kind: 'link'
      path: string
      icon: IconType
      gradient: string
      glow: string
      ring: string
      tag: ModeTag
      title: string
      desc: string
    }
  | {
      kind: 'group'
      icon: IconType
      gradient: string
      glow: string
      tag: ModeTag
      title: string
      desc: string
      items: ModeSubItem[]
      // Hiện khối "Mẹo" (trước đây đứng riêng ở cuối trang Home) NGAY TRONG thẻ này —
      // chỉ 1 thẻ group cần hiện mẹo (Hội thoại + Câu thông dụng), không lặp ở thẻ group khác.
      showTip?: boolean
    }

function getModes(dir: Direction, T: ReturnType<typeof useLang>['T']): ModeCard[] {
  const isA = dir === 'A'
  return [
    {
      kind: 'link',
      path: '/tu-dien',
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-amber-500/20',
      ring: 'hover:border-amber-500/40',
      tag: {
        label: T.tagDictCount,
        cls: 'bg-amber-500/15 text-amber-300 theme-light:text-amber-800 border border-amber-500/20',
      },
      title: isA ? T.dictTitleA : T.dictTitleB,
      desc: isA ? T.dictDescA : T.dictDescB,
    },
    {
      kind: 'link',
      path: '/lo-trinh-hoc',
      icon: Target,
      gradient: 'from-lime-500 to-green-400',
      glow: 'shadow-lime-500/20',
      ring: 'hover:border-lime-500/40',
      tag: {
        label: isA ? '5-20 từ/ngày' : '5-20/day',
        cls: 'bg-lime-500/15 text-lime-300 theme-light:text-lime-800 border border-lime-500/20',
      },
      title: isA ? 'Học theo lộ trình' : 'Learning Path',
      desc: isA
        ? 'Bắt đầu từ chữ cái, số... mỗi ngày 5-20 từ mới (tự chọn tốc độ) theo vòng tròn liên quan, kèm câu thông dụng.'
        : 'Start from letters and numbers — 5-20 new words a day (pick your pace) in related circles, with common sentences.',
    },
    {
      kind: 'link',
      path: '/truyen-song-ngu',
      icon: BookMarked,
      gradient: 'from-fuchsia-500 to-purple-400',
      glow: 'shadow-fuchsia-500/20',
      ring: 'hover:border-fuchsia-500/40',
      tag: {
        label: isA ? '6 thể loại' : '6 genres',
        cls: 'bg-fuchsia-500/15 text-fuchsia-300 theme-light:text-fuchsia-800 border border-fuchsia-500/20',
      },
      title: isA ? 'Nghe - Đọc - Kể Truyện' : 'Listen - Read - Tell Stories',
      desc: isA
        ? 'Cổ tích, ngụ ngôn, truyện dân gian Việt Nam... nghe giọng đọc chuẩn, đọc song ngữ.'
        : 'Fairy tales, fables, Vietnamese folk stories... listen with native voices, read bilingual text.',
    },
    {
      kind: 'group',
      icon: Bot,
      gradient: 'from-accent-500 via-sky-500 to-violet-500',
      glow: 'shadow-accent-500/20',
      tag: {
        label: T.tagTutorModes,
        cls: 'bg-accent-500/15 text-accent-300 theme-light:text-accent-700 border border-accent-500/20',
      },
      title: isA ? T.tutorTitleA : T.tutorTitleB,
      desc: isA ? T.tutorDescA : T.tutorDescB,
      showTip: true,
      items: [
        {
          path: '/luyen-nghe',
          icon: Headphones,
          label: T.listen,
          color: 'text-rose-400',
          fullDesc: `${T.listen}. ${isA ? T.listenDescA : T.listenDescB}`,
        },
        {
          path: '/tro-truyen',
          icon: MessageCircle,
          label: T.chat,
          color: 'text-accent-400',
          fullDesc: `${isA ? T.chatTitleA : T.chatTitleB}. ${isA ? T.chatDescA : T.chatDescB}`,
        },
        {
          path: '/luyen-noi',
          icon: Mic,
          label: T.speak,
          color: 'text-sky-400',
          fullDesc: `${isA ? T.speakTitleA : T.speakTitleB}. ${isA ? T.speakDescA : T.speakDescB}`,
        },
        {
          path: '/luyen-viet',
          icon: PenLine,
          label: T.write,
          color: 'text-violet-400',
          fullDesc: `${isA ? T.writeTitleA : T.writeTitleB}. ${isA ? T.writeDescA : T.writeDescB}`,
        },
      ],
    },
    {
      kind: 'link',
      path: '/thu-thach',
      icon: Video,
      gradient: 'from-rose-500 to-red-400',
      glow: 'shadow-rose-500/20',
      ring: 'hover:border-rose-500/40',
      tag: {
        label: isA ? 'mỗi tuần' : 'weekly',
        cls: 'bg-rose-500/15 text-rose-300 theme-light:text-rose-800 border border-rose-500/20',
      },
      title: 'Challenge',
      desc: isA
        ? 'Mỗi ngày quay 1 video ngắn kể về cuộc sống — sửa lỗi. Bảng tuần Thứ 2 → CN.'
        : 'Record a short daily video about your life — corrects your mistakes. Weekly board Mon → Sun.',
    },
  ]
}

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T } = useLang()
  // PHẢI dùng giá trị trả về + thêm vào deps useMemo bên dưới (xem cảnh báo useCloudSync.ts).
  const syncVersion = useCloudSync(user?.id)

  // Chiều học đọc trực tiếp từ localStorage — đổi chiều/ngôn ngữ hiển thị đã dời sang
  // trang Hồ sơ (Profile.tsx), Home không còn tự đổi nên không cần state riêng.
  const dir: Direction = getDirection()
  // Đóng banner "quay lại" (② M4) NGAY trong phiên này — dismissComebackToday()
  // ghi localStorage để không hiện lại trong ngày hôm nay ở lần mở app sau.
  const [comebackClosed, setComebackClosed] = useState(false)

  // Dữ liệu cho thẻ "Học tiếp" — chỉ cần lộ trình CEFR + vòng nền tảng (không cần
  // nạp toàn bộ từ điển ~10k từ như trang /learning-path, findNextStep chỉ tham
  // chiếu circleById theo unit).
  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([])
  const [circleById, setCircleById] = useState<Record<string, Circle>>({})
  useEffect(() => {
    Promise.all([loadCefr(), loadFoundation()]).then(([lv, foundation]) => {
      setCefrLevels(lv)
      setCircleById(Object.fromEntries(foundation.map((c) => [c.id, c])))
    })
  }, [])

  const uid = user?.id ?? ''
  // syncVersion: KHÔNG dùng trong thân hàm nhưng BẮT BUỘC có trong deps — báo hiệu cloud sync
  // vừa kéo dữ liệu mới, cần đọc lại localStorage (xem cảnh báo trong useCloudSync.ts).
  /* eslint-disable react-hooks/exhaustive-deps */
  const learned = useMemo(() => getLearnedWords(uid), [uid, syncVersion])
  const doneGrammar = useMemo(() => getDoneGrammar(uid), [uid, syncVersion])
  const examPassed = useMemo(() => getPassedExamLevels(uid), [uid, syncVersion])
  /* eslint-enable react-hooks/exhaustive-deps */
  const lockedMap = useMemo(
    () => computeLockedMapPersisted(uid, cefrLevels, examPassed),
    [uid, cefrLevels, examPassed],
  )
  // Cấp đầu tiên chưa khóa mà vẫn còn mục chưa xong — "đang học dở".
  const continueLevel = useMemo(() => {
    for (const lv of cefrLevels) {
      if (lockedMap.get(lv.id)) continue
      const next = findNextStep(lv, circleById, learned, doneGrammar)
      if (next) return { level: lv, next }
    }
    return null
  }, [cefrLevels, circleById, learned, doneGrammar, lockedMap])

  // Luồng "quay lại sau khi bỏ bẵng" (② M4) — chỉ hiện khi có nơi để trỏ CTA tới.
  const showComeback = !comebackClosed && !!continueLevel && shouldShowComeback(uid)
  const daysAway = showComeback ? comebackDaysAway(uid) : 0
  function closeComeback() {
    dismissComebackToday(uid)
    setComebackClosed(true)
  }

  // N từ học GẦN NHẤT — gợi ý "Luyện nói với từ vừa học" (nối đề xuất B,
  // docs/research/danh-gia-tien-trien-hoc-2026-07-07.md; đã có CTA tương tự
  // ngay sau khi học xong 1 batch ở StudyTabs.tsx — đây là lối vào từ Home,
  // cho người KHÔNG đang giữa phiên học).
  const recentWords = getRecentlyLearnedWords(uid, RECENT_WORDS_FOR_SPEAKING)

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  const srsDue = getSRSStats(user.id).due
  const dailyLearned = getDailyLearned(user.id)
  const dailyMax = getDailyMax(user.id)

  const MODES = getModes(dir, T)
  const isA = dir === 'A'

  // Nhãn mục "Học tiếp" (vòng từ vựng hoặc bài ngữ pháp kế tiếp chưa xong).
  let nextLabel = ''
  if (continueLevel) {
    const { next } = continueLevel
    if (next.kind === 'vocab' && next.circleId) {
      const c = circleById[next.circleId]
      if (c) {
        const done = circleDoneCount(c, learned)
        nextLabel = `${c.emoji} ${isA ? c.titleVi : c.titleEn} (${done}/${c.words.length})`
      }
    } else if (next.kind === 'grammar' && next.lessonId) {
      const g = next.unit.grammar.find((x) => x.id === next.lessonId)
      if (g) nextLabel = isA ? g.titleVi : g.titleEn
    }
  }

  function goToNextStep() {
    if (!continueLevel) return
    nav(`/lo-trinh-hoc/${continueLevel.level.id.toLowerCase()}`)
  }

  function goToSrs() {
    if (!continueLevel) return
    nav(`/lo-trinh-hoc/${continueLevel.level.id.toLowerCase()}?tab=srs`)
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={T.greeting} back={false} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        {/* Trang chủ dùng Layout title (chỉ là <p>) thay vì PageHeader nên cần <h1>
            riêng cho screen reader/SEO — ẩn trực quan vì tên đã hiện trong header. */}
        <h1 className="sr-only">{T.greeting}</h1>

        {/* ── Luồng "quay lại sau khi bỏ bẵng" (② M4) — bỏ ≥3 ngày → chào +
            đề xuất phiên RÚT GỌN thay vì đập nguyên nợ ôn vào mặt ─────────── */}
        {showComeback && continueLevel && (
          <div className="mb-3 glass rounded-2xl p-4 border border-accent-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">
                👋
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">
                  {isA ? 'Mừng bạn quay lại!' : 'Welcome back!'}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {isA
                    ? `Đã ${daysAway} ngày rồi — bắt đầu nhẹ nhàng thôi, không cần ôn hết nợ cũ.`
                    : `It's been ${daysAway} days — let's ease back in, no need to clear the backlog.`}
                </p>
              </div>
              <button
                onClick={closeComeback}
                aria-label={isA ? 'Đóng' : 'Dismiss'}
                className="tap-44 shrink-0 text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              {srsDue > 0 && (
                <button
                  onClick={() =>
                    nav(
                      `/lo-trinh-hoc/${continueLevel.level.id.toLowerCase()}?tab=srs&cap=${COMEBACK_SRS_CARDS}`,
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 theme-light:text-sky-800 text-sm font-medium transition"
                >
                  <Brain className="w-4 h-4" />
                  {isA
                    ? `Ôn ${Math.min(srsDue, COMEBACK_SRS_CARDS)} thẻ`
                    : `Review ${Math.min(srsDue, COMEBACK_SRS_CARDS)} cards`}
                </button>
              )}
              <button
                onClick={() =>
                  nav(
                    `/lo-trinh-hoc/${continueLevel.level.id.toLowerCase()}?tab=today&cap=${COMEBACK_NEW_WORDS}`,
                  )
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
              >
                <Sparkles className="w-4 h-4" />
                {isA ? `Học ${COMEBACK_NEW_WORDS} từ mới` : `Learn ${COMEBACK_NEW_WORDS} words`}
              </button>
            </div>
          </div>
        )}

        {/* ── Gợi ý "Luyện nói với từ vừa học" (② M4, nối đề xuất B) ────────── */}
        {recentWords.length > 0 && (
          <button
            onClick={() => nav(`/luyen-noi?words=${encodeURIComponent(recentWords.join(','))}`)}
            className="tap-44 w-full flex items-center justify-center gap-1.5 mb-3 px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 theme-light:text-sky-800 hover:border-sky-500/50 transition animate-fade-in"
          >
            <Mic className="w-3.5 h-3.5 shrink-0" />
            {isA
              ? `Luyện nói với ${recentWords.length} từ vừa học`
              : `Practice speaking with ${recentWords.length} recent words`}
          </button>
        )}

        {/* ── Thẻ "Học tiếp" — mục kế tiếp trong lộ trình CEFR ─────────────── */}
        {continueLevel && nextLabel && (
          <div className="mb-3 animate-fade-in">
            <button
              onClick={goToNextStep}
              aria-label={`${isA ? 'Học tiếp' : 'Continue'} — ${continueLevel.level.id}: ${nextLabel}`}
              className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-left border border-zinc-800/80 hover:border-accent-500/40 transition active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 fill-current text-accent-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-400">
                  {isA ? 'Học tiếp' : 'Continue'} · {continueLevel.level.id}
                </p>
                <p className="text-sm font-semibold text-white truncate mt-0.5">{nextLabel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </button>

            {(srsDue > 0 || dailyMax > 0) && (
              <div className="flex gap-2 mt-2">
                {srsDue > 0 && (
                  <button
                    onClick={goToSrs}
                    className="tap-44 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 theme-light:text-sky-800 hover:border-sky-500/50 transition"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    {srsDue} {isA ? 'thẻ cần ôn' : 'due'}
                  </button>
                )}
                <span className="flex items-center px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-xs text-zinc-400">
                  {dailyLearned}/{dailyMax} {isA ? 'từ hôm nay' : 'words today'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Mode cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {MODES.map((m, i) => {
            const Icon = m.icon
            const delay = { animationDelay: `${100 + i * 60}ms` }

            // Thẻ gộp nhiều nút con cùng chủ đề (vd "Học cùng gia sư AI": Chat/Nói/Viết —
            // gộp vì cả 3 đều là hội thoại với AI, chỉ khác kênh; hay "Hội thoại + Câu thông
            // dụng" — gộp vì cùng nhóm nội dung mẫu câu/hội thoại có sẵn).
            if (m.kind === 'group') {
              const gridCls = m.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              return (
                <div
                  key={m.title}
                  className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4 animate-fade-up"
                  style={delay}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-lg ${m.glow}`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-white text-[15px]">{m.title}</p>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${m.tag.cls}`}
                        >
                          {m.tag.label}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{m.desc}</p>
                    </div>
                  </div>

                  <div className={`grid ${gridCls} gap-2`}>
                    {m.items.map((sub) => {
                      const SubIcon = sub.icon
                      return (
                        <button
                          key={sub.path}
                          onClick={() => nav(sub.path)}
                          aria-label={sub.fullDesc}
                          className="tap-44 flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 border border-zinc-800/60 bg-zinc-950/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition active:scale-[0.98]"
                        >
                          <SubIcon className={`w-5 h-5 ${sub.color}`} />
                          <span className="text-xs font-medium text-zinc-200">{sub.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Mẹo — trước đây đứng riêng ở cuối trang Home, nay gộp vào NGAY thẻ
                      liên quan (Hội thoại + Câu thông dụng dẫn sang Luyện nói). */}
                  {m.showTip && (
                    <div className="mt-3 glass rounded-xl p-3 text-xs text-zinc-400">
                      <strong className="text-zinc-400">{T.tip}</strong>{' '}
                      {T.tipBody(
                        `<strong class="text-teal-400">${T.tipPhrases}</strong>`,
                        `<strong class="text-sky-400">${T.tipSpeaking}</strong>`,
                      )
                        .split(/(<strong[^>]*>.*?<\/strong>)/g)
                        .map((part, idx) => {
                          if (part.startsWith('<strong')) {
                            // theme-light: sắc độ đậm hơn để đạt AA trên nền sáng (Blue sky/Pink)
                            const color = part.includes('teal')
                              ? 'text-teal-400 theme-light:text-teal-700'
                              : 'text-sky-400 theme-light:text-sky-700'
                            const text = part.replace(/<[^>]+>/g, '')
                            return (
                              <strong key={idx} className={color}>
                                {text}
                              </strong>
                            )
                          }
                          return part
                        })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={m.path}
                onClick={() => nav(m.path)}
                aria-label={`${m.title}. ${m.desc}`}
                className={`w-full bg-zinc-900/80 border border-zinc-800/80 ${m.ring} rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-[0.99] animate-fade-up`}
                style={delay}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-lg ${m.glow} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white text-[15px]">{m.title}</p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${m.tag.cls}`}
                    >
                      {m.tag.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{m.desc}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 shrink-0 transition-all group-hover:translate-x-0.5" />
              </button>
            )
          })}
        </div>

        {/* ── Tiến độ + Lịch sử học ──────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {/* Bảng tiến độ: streak, từ đã thuộc, % CEFR, lượt còn lại */}
          <button
            onClick={() => nav('/progress')}
            aria-label={isA ? 'Xem bảng tiến độ' : 'View progress dashboard'}
            className="bg-zinc-900/60 border border-zinc-800/60 hover:border-accent-500/40 rounded-2xl px-4 py-3 flex items-center gap-3 transition group animate-fade-in"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-accent-500/15 flex items-center justify-center shrink-0 transition">
              <TrendingUp className="w-4 h-4 text-accent-400" />
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition flex-1 text-left">
              {isA ? 'Tiến độ' : 'Progress'}
            </span>
          </button>

          {/* Lịch sử học */}
          <button
            onClick={() => nav('/history')}
            aria-label={isA ? 'Xem lịch sử học' : 'View learning history'}
            className="bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 rounded-2xl px-4 py-3 flex items-center gap-3 transition group animate-fade-in"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition">
              <History className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition flex-1 text-left">
              {isA ? 'Lịch sử' : 'History'}
            </span>
          </button>
        </div>

        <PricePromoBanner isA={isA} />
      </main>
    </div>
  )
}
