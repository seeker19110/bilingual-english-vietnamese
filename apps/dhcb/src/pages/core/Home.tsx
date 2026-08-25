// apps/dhcb/src/pages/Home.tsx — Đồng Hành Platform Hub (Trang Chủ Nền Tảng Đa Lĩnh Vực)
import { useEffect, useMemo, useState } from 'react'
import FirstTaskCard from '../../components/FirstTaskCard'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  History,
  TrendingUp,
  Brain,
  Bot,
  X,
  Sparkles,
  Calculator,
  Briefcase,
  Rocket,
  GraduationCap,
} from 'lucide-react'
import Layout from '../../components/Layout.js'
import PricePromoBanner from '../../components/PricePromoBanner.js'
import RewardTipBanner from '../../components/RewardTipBanner.js'
import HomeAiBriefingCard from '../../components/Home/HomeAiBriefingCard.js'
import HomeUniversalAiBar from '../../components/Home/HomeUniversalAiBar.js'
import { getDirection } from '../../lib/storage'
import type { Direction } from '../../types'
import { useLang } from '../../context/useLang'
import { useAuth } from '../../context/useAuth'
import { useCloudSync } from '../../lib/useCloudSync'
import type { CefrLevel } from '../../data/cefr'
import type { Circle } from '../../data/curriculum'
import { loadCefr } from '../../data/cefrLoader'
import { loadFoundation } from '../../data/curriculumLoader'
import { getLearnedWords } from '../../lib/vocab'
import {
  getDoneGrammar,
  computeLockedMapPersisted,
  persistUnlockedLevels,
  findNextStep,
  circleDoneCount,
} from '../../lib/cefrProgress'
import { getPassedExamLevels } from '../../lib/cefrExam'
import { getSRSStats } from '../../lib/srs'
import { getDailyLearned, getDailyMax } from '../../lib/curriculum'
import {
  shouldShowComeback,
  dismissComebackToday,
  comebackDaysAway,
  COMEBACK_SRS_CARDS,
  COMEBACK_NEW_WORDS,
} from '../../lib/comeback'

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
  // syncVersion tăng khi cloud sync xong → tham chiếu nó trong thân memo (void) để
  // dependency là "thật" (đọc lại localStorage đúng lúc), không cần eslint-disable.
  const learned = useMemo(() => {
    void syncVersion
    return getLearnedWords(uid)
  }, [uid, syncVersion])
  const doneGrammar = useMemo(() => {
    void syncVersion
    return getDoneGrammar(uid)
  }, [uid, syncVersion])
  const examPassed = useMemo(() => {
    void syncVersion
    return getPassedExamLevels(uid)
  }, [uid, syncVersion])

  const lockedMap = useMemo(
    () => computeLockedMapPersisted(uid, cefrLevels, examPassed),
    [uid, cefrLevels, examPassed],
  )

  // Ghi nhớ cấp VỪA mở khóa (grandfather) — side effect tách khỏi render, xem cefrProgress.ts.
  useEffect(() => {
    persistUnlockedLevels(uid, cefrLevels, examPassed)
  }, [uid, cefrLevels, examPassed])

  // Không bọc useMemo: phép tính thuần, rẻ (≤6 cấp) — tính lại mỗi render, compiler tự memo.
  // (computeLockedMapPersisted nay đã THUẦN — phần ghi tách sang persistUnlockedLevels ở trên.)
  const continueLevel = (() => {
    for (const lv of cefrLevels) {
      if (lockedMap.get(lv.id)) continue
      const next = findNextStep(lv, circleById, learned, doneGrammar)
      if (next) return { level: lv, next }
    }
    return null
  })()

  const showComeback = !comebackClosed && !!continueLevel && shouldShowComeback(uid)
  const daysAway = showComeback ? comebackDaysAway(uid) : 0
  function closeComeback() {
    dismissComebackToday(uid)
    setComebackClosed(true)
  }

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

        {/* Việc đầu tiên chọn ở luồng người mới — tự ẩn khi đã xong hoặc chưa chọn */}
        <FirstTaskCard />

        {/* ── TẦNG 1: EXECUTIVE AI COMPANION (Hạt Nhân Điều Phối Trung Tâm) ── */}
        <HomeAiBriefingCard
          userName={user.name || user.email?.split('@')[0]}
          srsDueCount={srsDue}
          dailyLearned={dailyLearned}
          dailyMax={dailyMax}
          continueLessonLabel={nextLabel}
          continueLevelId={continueLevel?.level.id}
          onContinueClick={goToNextStep}
        />

        {/* ── Universal AI Ask & Voice Bar (Hỏi nhanh đa năng mọi bộ môn & lĩnh vực) ── */}
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

        {/* ── Mẹo thưởng & Nhiệm vụ ── */}
        {uid && <RewardTipBanner uid={uid} isA={isA} />}
        {/* DailyQuestsCard + ReferralVipBanner (dữ liệu giả in-memory) đã gỡ 2026-08-23 — hệ nhiệm vụ/giới thiệu THẬT ở /nhiem-vu và /profile (QuestsPanel, ReferralSection) */}

        {/* ── TẦNG 2: CÁC KHÔNG GIAN BỘ MÔN & MIỀN CHUYÊN BIỆT (Platform Domain Hubs) ── */}
        <section aria-label="Danh mục Không gian & Bộ môn" className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Các Không Gian & Bộ Môn
            </h2>
            <span className="text-[11px] text-zinc-500 font-medium">4 Không gian chuyên sâu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* KHÔNG GIAN 1: MÔN TIẾNG ANH (Chuyên biệt ngôn ngữ) */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 shadow-md group flex flex-col justify-between space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 text-zinc-950 font-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-base">Môn Tiếng Anh</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 theme-light:text-emerald-800 font-bold border border-emerald-500/30">
                      CEFR A1–C2
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    Gia sư song ngữ 2 chiều Việt ⇄ Anh: Luyện phát âm chuẩn IPA, chấm bài viết
                    IELTS, luyện nghe sâu và từ điển 12.000+ từ.
                  </p>
                </div>
              </div>

              {/* Lối tắt con trong Tiếng Anh */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => nav('/lo-trinh-hoc')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-emerald-300 transition text-center truncate"
                >
                  Lộ trình CEFR
                </button>
                <button
                  onClick={() => nav('/luyen-noi')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-emerald-300 transition text-center truncate"
                >
                  Luyện Nói IPA
                </button>
                <button
                  onClick={() => nav('/tu-dien')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-emerald-300 transition text-center truncate"
                >
                  Từ Điển 12k+
                </button>
              </div>

              <button
                onClick={() => nav('/hoc-tieng-anh')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 theme-light:text-emerald-800 border border-emerald-500/30 font-semibold text-xs transition active:scale-[0.98]"
              >
                <span>Vào Không Gian Học Tiếng Anh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* KHÔNG GIAN 2: KHOA HỌC & STEM (Toán, Lý, Hóa, Sinh) */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-blue-500/30 hover:border-blue-500/60 transition-all duration-200 shadow-md group flex flex-col justify-between space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-base">Khoa Học & STEM</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 theme-light:text-blue-800 font-bold border border-blue-500/30">
                      Vision OCR
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    Gia sư giải Toán, Lý, Hóa, Sinh từng bước bằng AI, công thức LaTeX, kèm phòng
                    thí nghiệm 10 Simulators ứng dụng thực tế.
                  </p>
                </div>
              </div>

              {/* Lối tắt con trong STEM */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => nav('/mon-hoc')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-blue-300 transition text-center truncate"
                >
                  4 Môn Toán Lý Hóa Sinh
                </button>
                <button
                  onClick={() => nav('/ung-dung-thuc-te')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-cyan-300 transition text-center truncate"
                >
                  10 Simulators Thí Nghiệm
                </button>
              </div>

              <button
                onClick={() => nav('/mon-hoc')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 theme-light:text-blue-800 border border-blue-500/30 font-semibold text-xs transition active:scale-[0.98]"
              >
                <span>Vào Không Gian Phòng Học & STEM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* KHÔNG GIAN 3: SỰ NGHIỆP & CÔNG VIỆC */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-200 shadow-md group flex flex-col justify-between space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-base">Sự Nghiệp & Công Việc</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 theme-light:text-purple-800 font-bold border border-purple-500/30">
                      Career Hub
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    Mô phỏng phỏng vấn thử việc STAR với AI Recruiter, Action Canvas và Bảng điều
                    khiển công việc Kanban.
                  </p>
                </div>
              </div>

              {/* Lối tắt con trong Career */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => nav('/career/interview')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-purple-300 transition text-center truncate"
                >
                  Phỏng Vấn STAR
                </button>
                <button
                  onClick={() => nav('/cong-viec-cuoc-song?muc=cong-viec')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-purple-300 transition text-center truncate"
                >
                  Công Việc Của Tôi
                </button>
              </div>

              <button
                onClick={() => nav('/su-nghiep')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 theme-light:text-purple-800 border border-purple-500/30 font-semibold text-xs transition active:scale-[0.98]"
              >
                <span>Vào Không Gian Sự Nghiệp Của Tôi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* KHÔNG GIAN 4: KHỞI NGHIỆP & ĐỜI SỐNG */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-orange-500/30 hover:border-orange-500/60 transition-all duration-200 shadow-md group flex flex-col justify-between space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Rocket className="w-6 h-6 text-zinc-950 font-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-base">Tôi Khởi Nghiệp & Đời Sống</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 theme-light:text-orange-800 font-bold border border-orange-500/30">
                      Life OS
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    Cố vấn mô hình kinh doanh Lean Startup Canvas, cân bằng 8 khía cạnh Bánh xe cuộc
                    đời và mạng lưới Life Graph.
                  </p>
                </div>
              </div>

              {/* Lối tắt con trong Startup/Life */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => nav('/startup/canvas')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-orange-300 transition text-center truncate"
                >
                  Lean Canvas
                </button>
                <button
                  onClick={() => nav('/cong-viec-cuoc-song?muc=doi-song')}
                  className="py-1.5 px-2 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-[11px] font-medium text-zinc-300 hover:text-pink-300 transition text-center truncate"
                >
                  Bánh Xe Cuộc Đời
                </button>
              </div>

              <button
                onClick={() => nav('/khoi-nghiep')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 theme-light:text-orange-800 border border-orange-500/30 font-semibold text-xs transition active:scale-[0.98]"
              >
                <span>Vào Không Gian Tôi Khởi Nghiệp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── BẠN ĐỒNG HÀNH AI ĐA LĨNH VỰC HERO BANNER ── */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-accent-950/40 border border-accent-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 via-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-accent-500/25">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Bạn Đồng Hành AI Đa Miền (Companion Live Voice)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Đàm thoại thời gian thực, 3D Avatar, Goal Autopilot & Cung điện ký nhớ Loci
              </p>
            </div>
          </div>

          <button
            onClick={() => nav('/ban-dong-hanh')}
            className="tap-44 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-[#09090b] font-bold text-xs shadow-md shadow-accent-500/25 transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Mở Bạn Đồng Hành</span>
          </button>
        </div>

        {/* ── TIẾN ĐỘ & LỊCH SỬ HỌC ── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
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
