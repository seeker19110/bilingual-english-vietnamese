// apps/dhcb/src/pages/core/Home.tsx — Trang chủ: một việc tiếp theo, hỏi nhanh, rồi danh sách bộ môn.
//
// [2026-09-03, đợt C thiết kế lại UI/UX] Gỡ banner "Bạn Đồng Hành AI Đa Miền" (là lối vào thứ ba
// tới trang Bạn Đồng Hành trên cùng một màn — header và thẻ AI đã có), thu 3 thẻ quảng cáo bộ môn
// thành một danh sách phẳng. Xem docs/changelog/0262-*.md.
import { useEffect, useMemo, useState } from 'react'
import FirstTaskCard from '../../components/FirstTaskCard'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  History,
  TrendingUp,
  Brain,
  X,
  Sparkles,
  Calculator,
  Briefcase,
  GraduationCap,
} from 'lucide-react'
import Layout from '../../components/Layout.js'
import PricePromoBanner from '../../components/PricePromoBanner.js'
import RewardTipBanner from '../../components/RewardTipBanner.js'
import HomeAiBriefingCard from '../../components/Home/HomeAiBriefingCard.js'
import HomeUniversalAiBar from '../../components/Home/HomeUniversalAiBar.js'
import { usePageTitle } from '../../lib/usePageTitle'
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
import { goToSubjects } from '../../lib/subjectsHost'
import { useIsDesktopViewport } from '../../lib/useIsDesktopViewport'
import { PageShell } from '@core/PageShell'
import { TwoPane } from '@core/TwoPane'
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
  // Desktop ≥1024px: bố cục 2 cột (chính + ngữ cảnh). Quyết định bằng JS chứ không bằng
  // `lg:hidden` để KHÔNG render trùng nội dung ở 2 nơi (xem useIsDesktopViewport.ts).
  const isDesktop = useIsDesktopViewport()

  const dir: Direction = getDirection()
  const [comebackClosed, setComebackClosed] = useState(false)

  const [cefrLevels, setCefrLevels] = useState<CefrLevel[]>([])
  const [circleById, setCircleById] = useState<Record<string, Circle>>({})

  usePageTitle('Trang chủ | Đồng hành cùng bạn')

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

  // ── Các khối nội dung tách riêng để LẮP LẠI theo 2 bố cục (mobile 1 cột / desktop 2 cột).
  // Mỗi khối chỉ render MỘT lần trong cây DOM, không nhân bản rồi ẩn bằng CSS.
  const topBlocks = (
    <>
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
    </>
  )

  // ── Mẹo thưởng & Nhiệm vụ ──
  // DailyQuestsCard + ReferralVipBanner (dữ liệu giả in-memory) đã gỡ 2026-08-23 — hệ nhiệm vụ/
  // giới thiệu THẬT ở /nhiem-vu và /profile (QuestsPanel, ReferralSection)
  const rewardTip = uid ? <RewardTipBanner uid={uid} isA={isA} /> : null

  // ── CÁC BỘ MÔN & KHÔNG GIAN ──
  // [2026-09-03, đợt C] Trước đây là 3 thẻ kiểu landing page (icon gradient + bóng màu, huy hiệu
  // huy hiệu quảng cáo kiểu buzzword, lối tắt là thẻ con lồng trong thẻ). Nay là MỘT danh sách phẳng: mỗi
  // dòng = một không gian, bấm cả dòng để vào, lối tắt là chữ thường bên dưới. Dữ liệu tách ra
  // mảng để ba dòng luôn cùng khuôn, không viết tay ba lần.
  const spaces: Array<{
    id: string
    icon: typeof GraduationCap
    tone: string
    title: string
    desc: string
    go: () => void
    shortcuts: Array<{ label: string; go: () => void }>
  }> = [
    {
      id: 'english',
      icon: GraduationCap,
      tone: 'bg-emerald-500/15 text-emerald-400 theme-light:text-emerald-900',
      title: 'Tiếng Anh',
      desc: 'Gia sư song ngữ Việt ⇄ Anh: lộ trình CEFR A1–C2, luyện nói, chấm bài viết, từ điển.',
      go: () => nav('/hoc-tieng-anh'),
      shortcuts: [
        { label: 'Lộ trình CEFR', go: () => nav('/lo-trinh-hoc') },
        { label: 'Luyện nói', go: () => nav('/luyen-noi') },
        { label: 'Từ điển', go: () => nav('/tu-dien') },
      ],
    },
    {
      id: 'stem',
      icon: Calculator,
      tone: 'bg-blue-500/15 text-blue-400 theme-light:text-blue-800',
      title: 'Toán, Lý, Hóa, Sinh',
      desc: 'Giải từng bước cùng AI, công thức LaTeX, mô phỏng thí nghiệm.',
      go: () => goToSubjects(nav),
      shortcuts: [
        { label: 'Bốn môn', go: () => goToSubjects(nav) },
        { label: 'Mô phỏng thí nghiệm', go: () => nav('/ung-dung-thuc-te') },
      ],
    },
    {
      id: 'career-life',
      icon: Briefcase,
      tone: 'bg-purple-500/15 text-purple-400 theme-light:text-purple-800',
      title: 'Sự nghiệp, Khởi nghiệp & Đời sống',
      desc: 'Phỏng vấn thử, quản lý công việc, Lean Canvas, bánh xe cuộc đời.',
      go: () => nav('/su-nghiep-khoi-nghiep'),
      shortcuts: [
        { label: 'Phỏng vấn thử', go: () => nav('/career/interview') },
        { label: 'Công việc', go: () => nav('/cong-viec-cuoc-song?muc=cong-viec') },
        { label: 'Lean Canvas', go: () => nav('/startup/canvas') },
        { label: 'Đời sống', go: () => nav('/cong-viec-cuoc-song?muc=doi-song') },
      ],
    },
  ]

  const spacesSection = (
    <section aria-labelledby="home-spaces-heading" className="pt-2">
      {/* Khoảng TRÊN tiêu đề (pt-2 + mt của section) lớn hơn khoảng dưới (mb-2) — luật 2 mục 9. */}
      <h2 id="home-spaces-heading" className="text-base font-bold text-white mb-2 px-1">
        Bộ môn & không gian
      </h2>
      <ul className="divide-y divide-zinc-800 rounded-3xl border border-zinc-800 bg-zinc-900/90">
        {spaces.map((s) => {
          const Icon = s.icon
          return (
            <li key={s.id} className="p-4">
              <button
                onClick={s.go}
                className="w-full flex items-start gap-3.5 text-left group"
                aria-label={`Vào không gian ${s.title}`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.tone}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base flex items-center gap-1.5">
                    <span>{s.title}</span>
                    <ChevronRight
                      className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-0.5">{s.desc}</p>
                </div>
              </button>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pl-[3.625rem]">
                {s.shortcuts.map((sc) => (
                  <button
                    key={sc.label}
                    onClick={sc.go}
                    className="tap-44-y text-sm font-medium text-zinc-400 hover:text-white underline-offset-4 hover:underline transition"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )

  // ── TIẾN ĐỘ & LỊCH SỬ HỌC ──
  // Desktop: nằm ở cột ngữ cảnh hẹp (w-72) nên xếp 1 cột cho dễ đọc; mobile giữ 2 cột như cũ.
  // [2026-09-02, đợt 2] Bỏ `lg:grid-cols-1`: trong cột phải desktop, một cột làm hai nút này
  // giãn hết bề ngang mà chỉ chứa một icon + một chữ, nên đọc như hai THẺ RỖNG chiếm chỗ lớn
  // (thấy rõ khi chụp màn hình 1440px). Giữ hai cột ở mọi bề rộng thì chúng trở lại đúng vai
  // trò: một cặp nút điều hướng gọn.
  const progressHistory = (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {/* GIỮ transition-all: đổi cả màu viền/nền (hover) LẪN transform (active:scale). */}
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

      {/* GIỮ transition-all: đổi cả màu viền/nền (hover) LẪN transform (active:scale). */}
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
  )

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout title={T.greeting} back={false} />

      {/* [2026-09-02, đợt 2] Cột trái = luồng thao tác chính (AI, hành động nhanh, không gian bộ
          môn); cột phải = ngữ cảnh phụ (mẹo thưởng, tiến độ/lịch sử, khuyến mãi). Bố cục này
          trước đây viết tay tại chỗ — nay dùng chung `PageShell` + `TwoPane`. Ở mobile thứ tự
          nội dung khác (ngữ cảnh phụ xen vào luồng chính) nên vẫn giữ nhánh riêng. */}
      <PageShell width="standard" baseWidth="max-w-3xl">
        <TwoPane
          isDesktop={isDesktop}
          railLabel="Gợi ý và tiến độ"
          rail={
            <div className="space-y-5">
              {rewardTip}
              {progressHistory}
              <PricePromoBanner isA={isA} />
            </div>
          }
        >
          <div className="space-y-5">
            <h1 className="sr-only">{T.greeting}</h1>
            {topBlocks}
            {!isDesktop && rewardTip}
            {spacesSection}
            {!isDesktop && progressHistory}
            {!isDesktop && <PricePromoBanner isA={isA} />}
          </div>
        </TwoPane>
      </PageShell>
    </div>
  )
}
