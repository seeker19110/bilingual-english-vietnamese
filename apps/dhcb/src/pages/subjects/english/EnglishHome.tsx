// apps/dhcb/src/pages/EnglishHome.tsx — Không gian Chuyên Sâu Môn Tiếng Anh (English Studio Hub)
import { useEffect, useState } from 'react'
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
  GraduationCap,
  Bookmark,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import Layout from '../../../components/Layout.js'
import PricePromoBanner from '../../../components/PricePromoBanner.js'
import RewardTipBanner from '../../../components/RewardTipBanner.js'
import { getDirection } from '../../../lib/storage'
import type { Direction } from '../../../types'
import { useAuth } from '../../../context/useAuth'
import { useCloudSync } from '../../../lib/useCloudSync'
import type { CefrLevel } from '../../../data/cefr'
import type { Circle } from '../../../data/curriculum'
import { loadCefr } from '../../../data/cefrLoader'
import { loadFoundation } from '../../../data/curriculumLoader'
import { getLearnedWords, getRecentlyLearnedWords } from '../../../lib/vocab'
import {
  getDoneGrammar,
  computeLockedMapPersisted,
  persistUnlockedLevels,
  findNextStep,
  circleDoneCount,
} from '../../../lib/cefrProgress'
import { getPassedExamLevels } from '../../../lib/cefrExam'
import { getSRSStats } from '../../../lib/srs'
import { getDailyLearned, getDailyMax } from '../../../lib/curriculum'
import {
  shouldShowComeback,
  dismissComebackToday,
  comebackDaysAway,
  COMEBACK_SRS_CARDS,
  COMEBACK_NEW_WORDS,
} from '../../../lib/comeback'

// Số từ vừa học tối đa gợi ý cho 1 phiên Speaking
const RECENT_WORDS_FOR_SPEAKING = 8

export default function EnglishHome() {
  const nav = useNavigate()
  const { user } = useAuth()
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
  // Đọc từ localStorage mỗi render — bỏ useMemo thủ công vì React Compiler không
  // bảo toàn được (hàm ngoài opaque); compiler tự memo phần nó chứng minh được.
  // syncVersion tăng (đồng bộ cloud xong) → re-render → tự đọc lại bản mới.
  void syncVersion
  const learned = getLearnedWords(uid)
  const doneGrammar = getDoneGrammar(uid)
  const examPassed = getPassedExamLevels(uid)

  const lockedMap = computeLockedMapPersisted(uid, cefrLevels, examPassed)

  // Ghi nhớ cấp VỪA mở khóa (grandfather) — side effect tách khỏi render, xem cefrProgress.ts.
  // examPassed là Set mới mỗi render → effect chạy mỗi render, nhưng persist idempotent
  // (không đổi thì không ghi, không push) nên vô hại.
  useEffect(() => {
    persistUnlockedLevels(uid, cefrLevels, examPassed)
  })

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

  const recentWords = getRecentlyLearnedWords(uid, RECENT_WORDS_FOR_SPEAKING)

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

  if (!user) return null

  const srsDue = getSRSStats(user.id).due
  const dailyLearned = getDailyLearned(user.id)
  const dailyMax = getDailyMax(user.id)

  function goToNextStep() {
    if (!continueLevel) return
    nav(`/lo-trinh-hoc/${continueLevel.level.id.toLowerCase()}`)
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout title={isA ? 'Không Gian Tiếng Anh' : 'English Studio'} back />

      <main className="max-w-3xl mx-auto px-4 pt-4 pb-[calc(2rem+var(--bnav-h))] space-y-5">
        <h1 className="sr-only">{isA ? 'Không Gian Tiếng Anh' : 'English Studio'}</h1>

        {/* ── TIÊU ĐỀ & TIẾP TỤC HỌC CEFR ── */}
        <section
          aria-label="Học tập trọng tâm"
          className="glass rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-emerald-950/30 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {isA ? 'Gia Sư Tiếng Anh Song Ngữ' : 'Bilingual English Tutor'}
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 theme-light:text-emerald-800 font-bold border border-emerald-500/30">
                    CEFR A1–C2
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  {isA ? 'Hôm nay đã học:' : 'Today learned:'}{' '}
                  <span className="text-emerald-400 font-bold">{dailyLearned}</span> / {dailyMax} từ
                  vựng
                </p>
              </div>
            </div>
            {srsDue > 0 && (
              <button
                onClick={() => nav('/luyen-tap')}
                className="tap-44 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-xs text-sky-300 font-semibold transition"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{srsDue} thẻ đến hạn</span>
              </button>
            )}
          </div>

          {continueLevel && (
            <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  {isA ? 'Bài học tiếp theo theo lộ trình:' : 'Next roadmap lesson:'}
                </p>
                <p className="text-sm font-bold text-emerald-300 theme-light:text-emerald-800 truncate mt-0.5">
                  {nextLabel || (isA ? 'Bắt đầu bài học mới' : 'Start new lesson')}
                </p>
              </div>
              <button
                onClick={goToNextStep}
                className="tap-44 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#09090b] font-bold text-sm shadow-md shadow-emerald-500/20 transition active:scale-95 shrink-0"
              >
                <span>{isA ? 'Tiếp tục học ngay' : 'Continue learning'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

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
            className="tap-44 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-300 theme-light:text-sky-800 hover:border-sky-500/50 transition animate-fade-in"
          >
            <Mic className="w-3.5 h-3.5 shrink-0" />
            {isA
              ? `Luyện nói với ${recentWords.length} từ vừa học`
              : `Practice speaking with ${recentWords.length} recent words`}
          </button>
        )}

        {/* DailyQuestsCard + ReferralVipBanner (dữ liệu giả in-memory) đã gỡ 2026-08-23 — hệ nhiệm vụ/giới thiệu THẬT ở /nhiem-vu và /profile (QuestsPanel, ReferralSection) */}

        {/* ── GIA SƯ 4 KỸ NĂNG AI ── */}
        <section aria-label="Gia Sư 4 Kỹ Năng AI" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent-500/15 text-accent-400 border border-accent-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gia Sư Luyện 4 Kỹ Năng AI
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => nav('/luyen-nghe')}
              className="tap-44 flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-rose-500/40 transition active:scale-95 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center group-hover:scale-110 transition">
                <Headphones className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Luyện Nghe</span>
            </button>

            <button
              onClick={() => nav('/tro-truyen')}
              className="tap-44 flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-accent-500/40 transition active:scale-95 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center group-hover:scale-110 transition">
                <MessageCircle className="w-5 h-5 text-accent-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Chat Đối Thoại</span>
            </button>

            <button
              onClick={() => nav('/luyen-noi')}
              className="tap-44 flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-sky-500/40 transition active:scale-95 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center group-hover:scale-110 transition">
                <Mic className="w-5 h-5 text-sky-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Luyện Nói IPA</span>
            </button>

            <button
              onClick={() => nav('/luyen-viet')}
              className="tap-44 flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-violet-500/40 transition active:scale-95 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center group-hover:scale-110 transition">
                <PenLine className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Luyện Viết IELTS</span>
            </button>
          </div>
        </section>

        {/* ── LỘ TRÌNH VÀ TỪ ĐIỂN ── */}
        <section aria-label="Lộ trình & Từ điển" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 theme-light:text-emerald-800 font-semibold border border-emerald-500/20">
                  A1-C2
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                6 cấp độ chuẩn hóa, 5-20 từ mới mỗi ngày theo vòng tròn chủ đề ngữ cảnh.
              </p>
            </div>
          </button>

          {/* Từ điển Song Ngữ */}
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
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 theme-light:text-amber-800 font-semibold border border-amber-500/20">
                  Audio IPA
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                Tra cứu phát âm chuẩn IPA, câu ví dụ thực tế và giải thích chi tiết ngữ cảnh.
              </p>
            </div>
          </button>
        </section>

        {/* ── THƯ VIỆN & TÀI NGUYÊN HỌC TẬP MỞ RỘNG ── */}
        <section aria-label="Tài nguyên học tập" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tài Nguyên & Công Cụ Bổ Trợ
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Bài học ngữ pháp */}
            <button
              onClick={() => nav('/bai-hoc')}
              className="p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 text-left transition active:scale-95 flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Bookmark className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white text-xs truncate">Ngữ Pháp</h4>
                <p className="text-[11px] text-zinc-400 truncate">100+ chủ điểm</p>
              </div>
            </button>

            {/* Mẫu câu thông dụng */}
            <button
              onClick={() => nav('/cau-thong-dung')}
              className="p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 text-left transition active:scale-95 flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white text-xs truncate">Mẫu Câu</h4>
                <p className="text-[11px] text-zinc-400 truncate">Giao tiếp nhanh</p>
              </div>
            </button>

            {/* Truyện song ngữ */}
            <button
              onClick={() => nav('/truyen-song-ngu')}
              className="p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 text-left transition active:scale-95 flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white text-xs truncate">Truyện Song Ngữ</h4>
                <p className="text-[11px] text-zinc-400 truncate">Karaoke Text</p>
              </div>
            </button>

            {/* Sổ tay lỗi sai */}
            <button
              onClick={() => nav('/so-tay-loi-sai')}
              className="p-3 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800/80 text-left transition active:scale-95 flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-white text-xs truncate">Sổ Lỗi Sai</h4>
                <p className="text-[11px] text-zinc-400 truncate">Khắc phục lỗ hổng</p>
              </div>
            </button>
          </div>
        </section>

        {/* ── THỬ THÁCH VIDEO 1 PHÚT ── */}
        <button
          onClick={() => nav('/thu-thach')}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-rose-950/30 border border-rose-500/20 hover:border-rose-500/40 text-left transition flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Thử Thách Video Nói 1 Phút Mỗi Ngày</h4>
              <p className="text-[11px] text-zinc-400">
                Ghi hình phát âm, nhận phản hồi AI và tích lũy chuỗi Streak
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-rose-400 transition" />
        </button>

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
              {isA ? 'Tiến độ học' : 'Progress'}
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
              {isA ? 'Lịch sử học' : 'History'}
            </span>
          </button>
        </div>

        <PricePromoBanner isA={isA} />
      </main>
    </div>
  )
}
