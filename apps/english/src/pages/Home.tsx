// apps/english/src/pages/Home.tsx — Tiered AI Architecture Homepage
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
  Brain,
  Video,
  Bot,
  X,
  Sparkles,
  Headphones,
  Activity,
  Calculator,
  Briefcase,
  Heart,
  Rocket,
  GraduationCap,
} from 'lucide-react'
import Layout from '../components/Layout.js'
import PricePromoBanner from '../components/PricePromoBanner.js'
import RewardTipBanner from '../components/RewardTipBanner.js'
import HomeAiBriefingCard from '../components/Home/HomeAiBriefingCard.js'
import HomeUniversalAiBar from '../components/Home/HomeUniversalAiBar.js'
import DailyQuestsCard from '../components/DailyQuests/DailyQuestsCard.js'
import ReferralVipBanner from '../components/ReferralVip/ReferralVipBanner.js'
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

// Số từ vừa học tối đa gợi ý cho 1 phiên Speaking (② M4)
const RECENT_WORDS_FOR_SPEAKING = 8

export default function Home() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { T } = useLang()
  const syncVersion = useCloudSync(user?.id)

  const dir: Direction = getDirection()
  const [comebackClosed, setComebackClosed] = useState(false)

  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([])
  const [circleById, setCircleById] = useState<Record<string, Circle>>({})
  useEffect(() => {
    Promise.all([loadCefr(), loadFoundation()]).then(([lv, foundation]) => {
      setCefrLevels(lv)
      setCircleById(Object.fromEntries(foundation.map((c) => [c.id, c])))
    })
  }, [])

  const uid = user?.id ?? ''
  /* eslint-disable react-hooks/exhaustive-deps */
  const learned = useMemo(() => getLearnedWords(uid), [uid, syncVersion])
  const doneGrammar = useMemo(() => getDoneGrammar(uid), [uid, syncVersion])
  const examPassed = useMemo(() => getPassedExamLevels(uid), [uid, syncVersion])
  /* eslint-enable react-hooks/exhaustive-deps */

  const lockedMap = useMemo(
    () => computeLockedMapPersisted(uid, cefrLevels, examPassed),
    [uid, cefrLevels, examPassed],
  )

  const continueLevel = useMemo(() => {
    for (const lv of cefrLevels) {
      if (lockedMap.get(lv.id)) continue
      const next = findNextStep(lv, circleById, learned, doneGrammar)
      if (next) return { level: lv, next }
    }
    return null
  }, [cefrLevels, circleById, learned, doneGrammar, lockedMap])

  const showComeback = !comebackClosed && !!continueLevel && shouldShowComeback(uid)
  const daysAway = showComeback ? comebackDaysAway(uid) : 0
  function closeComeback() {
    dismissComebackToday(uid)
    setComebackClosed(true)
  }

  const recentWords = getRecentlyLearnedWords(uid, RECENT_WORDS_FOR_SPEAKING)

  if (!user) return null

  const srsDue = getSRSStats(user.id).due
  const dailyLearned = getDailyLearned(user.id)
  const dailyMax = getDailyMax(user.id)
  const isA = dir === 'A'

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

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout title={T.greeting} back={false} />

      <main className="max-w-3xl mx-auto px-4 pt-4 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <h1 className="sr-only">{T.greeting}</h1>

        {/* ── TẦNG 1: EXECUTIVE AI COMPANION (Hạt Nhân Điều Phối Tại Trang Chủ) ── */}
        <HomeAiBriefingCard
          userName={user.name || user.email?.split('@')[0]}
          srsDueCount={srsDue}
          dailyLearned={dailyLearned}
          dailyMax={dailyMax}
          continueLessonLabel={nextLabel}
          continueLevelId={continueLevel?.level.id}
          onContinueClick={goToNextStep}
        />

        {/* ── Universal AI Ask & Voice Bar (Hỏi nhanh đa năng mọi bộ môn) ── */}
        <HomeUniversalAiBar />

        {/* ── Luồng "quay lại sau khi bỏ bẵng" ── */}
        {showComeback && continueLevel && (
          <div className="glass rounded-2xl p-4 border border-accent-500/30 animate-fade-in">
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-sm font-medium transition"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent-500/15 hover:bg-accent-500/25 text-accent-300 text-sm font-medium transition"
              >
                <Sparkles className="w-4 h-4" />
                {isA ? `Học ${COMEBACK_NEW_WORDS} từ mới` : `Learn ${COMEBACK_NEW_WORDS} words`}
              </button>
            </div>
          </div>
        )}

        {/* ── Mẹo kiếm huy hiệu & thưởng ── */}
        {uid && <RewardTipBanner uid={uid} isA={isA} />}

        {/* ── Gợi ý "Luyện nói với từ vừa học" ── */}
        {recentWords.length > 0 && (
          <button
            onClick={() => nav(`/luyen-noi?words=${encodeURIComponent(recentWords.join(','))}`)}
            className="tap-44 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 hover:border-sky-500/50 transition animate-fade-in"
          >
            <Mic className="w-3.5 h-3.5 shrink-0" />
            {isA
              ? `Luyện nói với ${recentWords.length} từ vừa học`
              : `Practice speaking with ${recentWords.length} recent words`}
          </button>
        )}

        {/* ── NHIỆM VỤ HÀNG NGÀY & RƯƠNG BÍ ẨN ── */}
        <DailyQuestsCard />

        {/* ── CHƯƠNG TRÌNH MỜI BẠN NHẬN VIP ── */}
        <ReferralVipBanner />

        {/* ── TẦNG 2: PHÂN CẤP BỘ MÔN & MIỀN CHUYÊN BIỆT (Domain Hubs) ── */}

        {/* MIỀN 1: NGÔN NGỮ & TIẾNG ANH (Language & Communication Hub) */}
        <section aria-label="Bộ môn Ngôn ngữ và Tiếng Anh" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Ngôn Ngữ & Giao Tiếp (Language Hub)
              </h3>
            </div>
            <button
              onClick={() => nav('/lo-trinh-hoc')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
            >
              Lộ trình CEFR <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lộ trình CEFR */}
            <button
              onClick={() => nav('/lo-trinh-hoc')}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/50 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">Học Theo Lộ Trình CEFR</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20">
                    A1-C2
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Bắt đầu từ chữ cái, số... 5-20 từ mới mỗi ngày theo vòng tròn chủ đề ngữ cảnh.
                </p>
              </div>
            </button>

            {/* Từ điển & Ngữ pháp */}
            <button
              onClick={() => nav('/tu-dien')}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-amber-500/50 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">Từ Điển Song Ngữ 12.000+</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
                    Audio IPA
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Tra cứu phát âm chuẩn IPA, câu ví dụ thực tế và giải thích chi tiết ngữ cảnh.
                </p>
              </div>
            </button>
          </div>

          {/* Gia Sư 4 Kỹ Năng AI (Nghe, Chat, Nói, Viết) */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent-500/15 text-accent-400 border border-accent-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gia Sư Luyện 4 Kỹ Năng AI</h4>
                  <p className="text-xs text-zinc-400">
                    Luyện phản xạ Nghe, Nói, Đọc, Viết có chấm điểm & sửa lỗi Socratic
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => nav('/luyen-nghe')}
                className="tap-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-rose-500/40 transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition">
                  <Headphones className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Luyện Nghe</span>
              </button>

              <button
                onClick={() => nav('/tro-truyen')}
                className="tap-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-accent-500/40 transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition">
                  <MessageCircle className="w-4 h-4 text-accent-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Chat Đối Thoại</span>
              </button>

              <button
                onClick={() => nav('/luyen-noi')}
                className="tap-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-sky-500/40 transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition">
                  <Mic className="w-4 h-4 text-sky-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Luyện Nói & IPA</span>
              </button>

              <button
                onClick={() => nav('/luyen-viet')}
                className="tap-44 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-violet-500/40 transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition">
                  <PenLine className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Luyện Viết AI</span>
              </button>
            </div>
          </div>
        </section>

        {/* MIỀN 2: KHOA HỌC STEM & GIẢI BÀI TẬP AI (STEM & Problem Solvers Hub) */}
        <section aria-label="Bộ môn Khoa học và STEM" className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Khoa Học & STEM (STEM Solvers Hub)
              </h3>
            </div>
            <button
              onClick={() => nav('/subjects')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5"
            >
              5 Môn Học <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Không Gian Môn Học & Vision Solver */}
            <button
              onClick={() => nav('/subjects')}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-blue-500/50 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">Gia Sư AI: Toán, Lý, Hóa, Sinh</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 font-semibold border border-blue-500/20">
                    Vision OCR
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Chụp/nhập đề bài để AI phân tích lời giải từng bước, công thức LaTeX và bảng biến
                  thiên.
                </p>
              </div>
            </button>

            {/* Phòng Thí Nghiệm 10 Simulators */}
            <button
              onClick={() => nav('/ung-dung-thuc-te')}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-cyan-500/50 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">Phòng Thí Nghiệm 10 Simulators</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/20">
                    Tương tác
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Mô phỏng bài toán thực tế: tối ưu lợi nhuận, hóa đơn điện EVN, lãi kép, vệ tinh
                  GPS.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* MIỀN 3: SỰ NGHIỆP & CÔNG VIỆC (Career & Work Hub) */}
        <section aria-label="Sự nghiệp và Công việc" className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Sự Nghiệp & Không Gian Làm Việc (Career & Work)
              </h3>
            </div>
            <button
              onClick={() => nav('/dong-hanh')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-0.5"
            >
              Executive Suite <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bạn Đồng Hành AI Đa Lĩnh Vực Hero Link */}
            <button
              onClick={() => nav('/dong-hanh')}
              className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-accent-950/40 border border-accent-500/30 hover:border-accent-500/60 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 via-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-accent-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">Bạn Đồng Hành AI Đa Miền</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent-500/15 text-accent-300 font-semibold border border-accent-500/20">
                    Live Voice
                  </span>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  Đàm thoại thời gian thực, 3D Avatar, Goal Autopilot & Cung điện ký ức.
                </p>
              </div>
            </button>

            {/* Phỏng Vấn Thử Việc & Action Canvas */}
            <button
              onClick={() => nav('/career/interview')}
              className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-purple-500/50 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-start gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-white text-sm">AI Phỏng Vấn Thử Việc</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/20">
                    STAR Model
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  Mô phỏng phỏng vấn tiếng Anh/Việt chuyên sâu với AI Recruiter và phân tích khoảng
                  cách kỹ năng.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* MIỀN 4: KHỞI NGHIỆP & ĐỜI SỐNG (Startup & Life Hub) */}
        <section aria-label="Khởi nghiệp và Đời sống" className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Khởi Nghiệp & Đời Sống (Startup & Life)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Startup Lean Canvas */}
            <button
              onClick={() => nav('/startup/canvas')}
              className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-orange-500/40 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-xs truncate">Lean Startup Canvas</h4>
                <p className="text-[11px] text-zinc-400 truncate">Cố vấn mô hình kinh doanh</p>
              </div>
            </button>

            {/* Bánh Xe Cuộc Đời */}
            <button
              onClick={() => nav('/life/wheel')}
              className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-pink-500/40 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Heart className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-xs truncate">Bánh Xe Cuộc Đời</h4>
                <p className="text-[11px] text-zinc-400 truncate">Cân bằng 8 khía cạnh</p>
              </div>
            </button>

            {/* Video Thử Thách */}
            <button
              onClick={() => nav('/thu-thach')}
              className="p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-rose-500/40 text-left transition-all duration-200 group active:scale-[0.98] shadow-sm flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-xs truncate">Thử Thách Video</h4>
                <p className="text-[11px] text-zinc-400 truncate">1 phút mỗi ngày</p>
              </div>
            </button>
          </div>
        </section>

        {/* ── TIẾN ĐỘ & LỊCH SỬ HỌC ── */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => nav('/tien-do')}
            aria-label="Xem bảng tiến độ"
            className="bg-zinc-900/70 border border-zinc-800/80 hover:border-accent-500/40 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-98 animate-fade-in shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 group-hover:bg-accent-500/20 flex items-center justify-center shrink-0 transition">
              <TrendingUp className="w-4 h-4 text-accent-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition flex-1 text-left">
              {isA ? 'Tiến độ' : 'Progress'}
            </span>
          </button>

          <button
            onClick={() => nav('/lich-su-hoc')}
            aria-label="Xem lịch sử học"
            className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-98 animate-fade-in shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/50 group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition">
              <History className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
            </div>
            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition flex-1 text-left">
              {isA ? 'Lịch sử' : 'History'}
            </span>
          </button>
        </div>

        <PricePromoBanner isA={isA} />
      </main>
    </div>
  )
}
