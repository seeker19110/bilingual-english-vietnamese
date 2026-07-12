import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  PenLine,
  Mic,
  ChevronRight,
  BookOpen,
  GraduationCap,
  MessagesSquare,
  ArrowLeftRight,
  History,
  Target,
  TrendingUp,
  Play,
  Brain,
  Video,
} from 'lucide-react'
import Layout from '../components/Layout'
import { getStreak, hasStudiedToday, getDirection, setDirection } from '../lib/storage'
import { getVoicePref, setVoicePref, type Voice } from '../lib/tts'
import type { Direction } from '../types'
import { useLang } from '../context/useLang'
import { useAuth } from '../context/useAuth'
import { useCloudSync } from '../lib/useCloudSync'
import type { CefrLevel } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import { getLearnedWords } from '../lib/vocab'
import {
  getDoneGrammar,
  computeLockedMapPersisted,
  findNextStep,
  circleDoneCount,
} from '../lib/cefrProgress'
import { getPassedExamLevels } from '../lib/cefrExam'
import { getSRSStats } from '../lib/srs'
import { getDailyLearned, getDailyMax } from '../lib/curriculum'

// ── Nội dung cards theo chiều học và ngôn ngữ giao diện ──────────────────────
function getModes(dir: Direction, T: ReturnType<typeof useLang>['T']) {
  const isA = dir === 'A'
  return [
    {
      path: '/dictionary',
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
      path: '/learning-path',
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
      path: '/lessons',
      icon: GraduationCap,
      gradient: 'from-rose-500 to-pink-400',
      glow: 'shadow-rose-500/20',
      ring: 'hover:border-rose-500/40',
      tag: {
        label: T.tagLessonsCount,
        cls: 'bg-rose-500/15 text-rose-300 theme-light:text-rose-700 border border-rose-500/20',
      },
      title: isA ? T.lessonsTitleA : T.lessonsTitleB,
      desc: isA ? T.lessonsDescA : T.lessonsDescB,
    },
    {
      path: '/phrases',
      icon: MessagesSquare,
      gradient: 'from-teal-500 to-accent-400',
      glow: 'shadow-teal-500/20',
      ring: 'hover:border-teal-500/40',
      tag: {
        label: T.tagPhrasesCount,
        cls: 'bg-teal-500/15 text-teal-300 theme-light:text-teal-800 border border-teal-500/20',
      },
      title: isA ? T.phrasesTitleA : T.phrasesTitleB,
      desc: isA ? T.phrasesDescA : T.phrasesDescB,
    },
    {
      path: '/chat',
      icon: MessageCircle,
      gradient: 'from-accent-500 to-accent-400',
      glow: 'shadow-accent-500/20',
      ring: 'hover:border-accent-500/40',
      tag: {
        label: T.tagPopular,
        cls: 'bg-accent-500/15 text-accent-300 theme-light:text-accent-700 border border-accent-500/20',
      },
      title: isA ? T.chatTitleA : T.chatTitleB,
      desc: isA ? T.chatDescA : T.chatDescB,
    },
    {
      path: '/speaking',
      icon: Mic,
      gradient: 'from-sky-500 to-cyan-400',
      glow: 'shadow-sky-500/20',
      ring: 'hover:border-sky-500/40',
      tag: {
        label: T.tagKeyFeature,
        cls: 'bg-sky-500/15 text-sky-300 theme-light:text-sky-700 border border-sky-500/20',
      },
      title: isA ? T.speakTitleA : T.speakTitleB,
      desc: isA ? T.speakDescA : T.speakDescB,
    },
    {
      path: '/writing',
      icon: PenLine,
      gradient: 'from-violet-500 to-purple-400',
      glow: 'shadow-violet-500/20',
      ring: 'hover:border-violet-500/40',
      tag: {
        label: 'IELTS',
        cls: 'bg-violet-500/15 text-violet-300 theme-light:text-violet-700 border border-violet-500/20',
      },
      title: isA ? T.writeTitleA : T.writeTitleB,
      desc: isA ? T.writeDescA : T.writeDescB,
    },
    {
      path: '/challenge',
      icon: Video,
      gradient: 'from-rose-500 to-red-400',
      glow: 'shadow-rose-500/20',
      ring: 'hover:border-rose-500/40',
      tag: {
        label: isA ? '30 ngày' : '30 days',
        cls: 'bg-rose-500/15 text-rose-300 theme-light:text-rose-800 border border-rose-500/20',
      },
      title: isA ? 'Challenge 1 phút' : '1-Minute Challenge',
      desc: isA
        ? 'Thử thách 30 ngày: mỗi ngày quay 1 video ngắn kể về cuộc sống — AI khen và sửa lỗi.'
        : '30-day challenge: record a short daily video about your life — AI praises and corrects.',
    },
  ]
}

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T, setLang } = useLang()
  useCloudSync(user?.id) // kéo lượt dùng từ Supabase khi mở trang chủ

  const [dir, setDir] = useState<Direction>(getDirection)
  const [voice, setVoice] = useState<Voice>(getVoicePref)

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
  const learned = useMemo(() => getLearnedWords(uid), [uid])
  const doneGrammar = useMemo(() => getDoneGrammar(uid), [uid])
  const examPassed = useMemo(() => getPassedExamLevels(uid), [uid])
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

  // RequireAuth đã đảm bảo có user; guard để TypeScript yên tâm
  if (!user) return null

  const streak = getStreak(user.id)
  const studiedToday = hasStudiedToday(user.id) // ô streak 3 trạng thái (V-2, E2)
  const srsDue = getSRSStats(user.id).due
  const dailyLearned = getDailyLearned(user.id)
  const dailyMax = getDailyMax(user.id)

  function toggleDir() {
    const next: Direction = dir === 'A' ? 'B' : 'A'
    setDirection(next)
    setDir(next)
    setLang(next === 'A' ? 'vi' : 'en')
  }

  function chooseVoice(v: Voice) {
    setVoice(v)
    setVoicePref(v)
  }

  // Bấm cả khối để đổi giọng Nữ ↔ Nam (giống ô Ngôn ngữ học)
  function toggleVoice() {
    chooseVoice(voice === 'female' ? 'male' : 'female')
  }

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
    nav(`/learning-path/${continueLevel.level.id.toLowerCase()}`)
  }

  function goToSrs() {
    if (!continueLevel) return
    nav(`/learning-path/${continueLevel.level.id.toLowerCase()}?tab=srs`)
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout title={T.greeting(user.name)} back={false} />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
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

        {/* ── Chọn chiều học + streak + giọng đọc (3 cột căn giữa) ──────────── */}
        <div className="mb-6 grid grid-cols-3 gap-3 animate-fade-in">
          {/* Chiều học — icon trên, text giữa, nhãn dưới, căn giữa */}
          <button
            onClick={toggleDir}
            title={isA ? T.toggleDirTitleA : T.toggleDirTitleB}
            aria-label={isA ? T.toggleDirTitleA : T.toggleDirTitleB}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 border transition-all active:scale-[0.98] ${
              isA
                ? 'bg-accent-500/10 border-accent-500/30 hover:border-accent-500/60'
                : 'bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60'
            }`}
          >
            <ArrowLeftRight className={`w-4 h-4 ${isA ? 'text-accent-400' : 'text-sky-400'}`} />
            <span
              className={`text-xs font-semibold leading-none text-center ${isA ? 'text-accent-300 theme-light:text-accent-700' : 'text-sky-300 theme-light:text-sky-700'}`}
            >
              {isA ? '🇻🇳 → 🇺🇸' : '🇺🇸 → 🇻🇳'}
            </span>
            <span
              className={`text-[11px] leading-none text-center ${isA ? 'text-accent-400 theme-light:text-accent-700' : 'text-sky-400 theme-light:text-sky-700'}`}
            >
              {isA ? 'Ngôn ngữ' : 'Language'}
            </span>
          </button>

          {/* Streak — 3 trạng thái (V-2, E2): đã giữ hôm nay ✓ · CHƯA giữ (viền đậm
              nhắc nhở) · chưa có chuỗi (🌱 mời gọi thay 💤 trống rỗng) */}
          <div
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 border ${
              streak > 0
                ? studiedToday
                  ? 'bg-orange-500/10 border-orange-500/25'
                  : 'bg-orange-500/15 border-orange-500/60'
                : 'bg-zinc-900/40 border-zinc-800/40'
            }`}
          >
            <span className="text-xl leading-none">{streak > 0 ? '🔥' : '🌱'}</span>
            <p
              className={`text-sm font-bold leading-none ${streak > 0 ? 'text-orange-400' : 'text-zinc-400'}`}
            >
              {streak}
            </p>
            <p
              className={`text-[11px] leading-none text-center ${
                streak > 0
                  ? `text-orange-400 ${studiedToday ? '' : 'font-semibold'}`
                  : 'text-zinc-400'
              }`}
            >
              {streak > 0 ? (studiedToday ? T.streakDoneToday : T.streakKeepToday) : T.streakStart}
            </p>
          </div>

          {/* Giọng đọc — icon trên, text giữa, nhãn dưới, căn giữa */}
          <button
            type="button"
            onClick={toggleVoice}
            title={isA ? 'Nhấn để đổi giọng đọc' : 'Tap to switch voice'}
            aria-label={`${isA ? 'Giọng đọc' : 'Voice'}: ${voice === 'female' ? (isA ? 'Nữ' : 'Female') : isA ? 'Nam' : 'Male'}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 border bg-zinc-900/80 border-zinc-700/60 hover:border-zinc-600 transition-all active:scale-[0.98]"
          >
            <Mic className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold leading-none text-center text-zinc-200">
              {voice === 'female' ? (isA ? 'Nữ' : 'Female') : isA ? 'Nam' : 'Male'}
            </span>
            <span className="text-[11px] leading-none text-center text-zinc-400">
              {isA ? 'Giọng đọc' : 'Voice'}
            </span>
          </button>
        </div>

        {/* ── Mode cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {MODES.map((m, i) => {
            const Icon = m.icon
            return (
              <button
                key={m.path}
                onClick={() => nav(m.path)}
                aria-label={`${m.title}. ${m.desc}`}
                className={`w-full bg-zinc-900/80 border border-zinc-800/80 ${m.ring} rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-[0.99] animate-fade-up`}
                style={{ animationDelay: `${100 + i * 60}ms` }}
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

        {/* ── Tip ──────────────────────────────────────────────────────── */}
        <div className="mt-6 glass rounded-xl p-4 text-xs text-zinc-400 animate-fade-in delay-400">
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
      </main>
    </div>
  )
}
