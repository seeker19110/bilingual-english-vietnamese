// ──────────────────────────────────────────────────────────────────────
// TRANG RIÊNG CỦA 1 CẤP CEFR — /learning-path/a1 · a2 · b1 · b2
//
// Mỗi cấp là 1 trang (URL riêng, share/back được). Bố cục:
//   1. Thẻ tổng quan: mục tiêu, số liệu, 2 thanh tiến độ (từ vựng + ngữ pháp),
//      mục tiêu "can-do" thu gọn được.
//   2. Thẻ "Học tiếp": chỉ đúng mục kế tiếp chưa xong (vòng từ vựng / bài ngữ pháp).
//   3. Danh sách unit đánh số "Phần 1..n", trong mỗi unit học theo trình tự:
//      ① Từ vựng → ② Ngữ pháp → ③ Hội thoại.
//   Mục nào đã hoàn thành 100% thì ẨN đi (gom vào nút "Đã hoàn thành n mục —
//   Xem lại"); unit xong hết thì thu gọn thành 1 dòng.
//
// THANH TAB TRÊN ĐẦU (chuyển từ trang /learning-path vào từng cấp):
//   Bài học · Hôm nay · Ôn SRS · Từ khó · Kiểm tra · Nghe — 5 tab học lấy dữ liệu
//   THEO TỪ VỰNG CỦA CẤP (components/StudyTabs.tsx); cấp cuối (B2) học tiếp
//   cả phần ngoài lộ trình CEFR. Tab "Nghe" (③ N3, thêm 2026-07-16) dùng thêm
//   hội thoại TOÀN CẤP (levelDialogues) cho dạng bài dictation. Cấp còn khóa thì
//   ẩn thanh tab.
// ──────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Brain,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Star,
  Target,
  CheckCircle2,
  Check,
  Layers,
  Lock,
  MessageCircle,
  Play,
  PartyPopper,
  X,
  Zap,
  Headphones,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { GrammarDetail, VocabFlash, DialogueView } from '../components/CefrLessonViews'
import {
  TodayLesson,
  SRSReview,
  HardWords,
  QuizTab,
  ListeningTab,
  type GrammarQuizSource,
} from '../components/StudyTabs'
import { ACCENT, type AccentClasses } from '../lib/cefrAccent'
import type { CefrLevel, CefrUnit, GrammarLesson } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import type { Dialogue } from '../data/dialogues'
import { loadCefr } from '../data/cefrLoader'
import { loadFoundation } from '../data/curriculumLoader'
import { getDialogues } from '../data/dialoguesLoader'
import { useAuth } from '../context/useAuth'
import { getDirection } from '../lib/storage'
import { getLearnedWords, getDifficultWords } from '../lib/vocab'
import { getDueWords } from '../lib/srs'
import {
  loadCurriculum,
  isCurriculumReady,
  getLevelWords,
  getBeyondCefrWords,
  getLearningPath,
} from '../lib/curriculum'
import { preloadLearnData } from '../lib/preloader'
import {
  getDoneGrammar,
  getViewedDialogues,
  markDialogueViewed,
  dialogueKey,
  circleDoneCount,
  levelVocabCounts,
  levelGrammarCounts,
  computeLockedMapPersisted,
  findNextStep,
  isExamEligible,
  UNLOCK_PCT,
} from '../lib/cefrProgress'
import { getExamMap } from '../lib/cefrExam'
import CefrExam from '../components/CefrExam'
import { useOnboarding } from '../lib/onboarding'

// % an toàn (0 khi total = 0, không chia cho 0).
const pct = (done: number, total: number) => (total > 0 ? Math.round((done / total) * 100) : 0)

// Tab trên trang cấp: 'lessons' = danh sách bài; 5 tab còn lại là tab học theo cấp
// ('listening' = luyện nghe, ③ N3 — thêm 2026-07-16).
type StudyTab = 'lessons' | 'today' | 'srs' | 'hard' | 'quiz' | 'listening'
const STUDY_TABS: StudyTab[] = ['lessons', 'today', 'srs', 'hard', 'quiz', 'listening']

export default function CefrLevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const isA = getDirection() === 'A'

  const [levels, setLevels] = useState<CefrLevel[]>([])
  const [circleById, setCircleById] = useState<Record<string, Circle>>({})
  const [ready, setReady] = useState(false)

  // Tab đang mở — cho phép mở thẳng qua URL `?tab=` (vd link "Học tiếp" ở Home),
  // mặc định danh sách bài của cấp nếu không có/param không hợp lệ.
  const [tab, setTab] = useState<StudyTab>(() => {
    const t = searchParams.get('tab')
    return (STUDY_TABS as string[]).includes(t ?? '') ? (t as StudyTab) : 'lessons'
  })
  // Giới hạn phiên RIÊNG cho tab đang mở qua URL `?cap=` — dùng cho luồng "quay
  // lại sau khi bỏ bẵng" (② M4, lib/comeback.ts): Home trỏ tới `?tab=today&cap=3`
  // hoặc `?tab=srs&cap=5` để phiên đầu nhẹ nhàng hơn, không đổi tốc độ đã lưu.
  const sessionCap = useMemo(() => {
    const n = Number(searchParams.get('cap'))
    return Number.isFinite(n) && n > 0 ? n : undefined
  }, [searchParams])
  // Các tab học cần TOÀN BỘ từ điển (nạp động, nặng hơn cefr+foundation) —
  // gate riêng để tab "Bài học" vẫn hiện ngay không phải chờ.
  const [dictReady, setDictReady] = useState(isCurriculumReady())
  useEffect(() => {
    loadCurriculum().then(() => setDictReady(true))
  }, [])

  // Màn con đang mở (giữ nguyên mẫu của RoadmapTab cũ: hội thoại đè lên flashcard
  // để xem xong hội thoại quay lại đúng màn flashcard).
  const [lesson, setLesson] = useState<GrammarLesson | null>(null)
  const [circle, setCircle] = useState<Circle | null>(null)
  const [dialogue, setDialogue] = useState<Dialogue | null>(null)
  // Đang làm bài thi cuối cấp (màn thi toàn màn hình đè lên trang cấp).
  const [examing, setExaming] = useState(false)

  // Khóa invalidation thủ công: bump() để tính lại tiến độ sau khi học/đánh dấu.
  const [refresh, setRefresh] = useState(0)
  const bump = () => setRefresh((k) => k + 1)

  useEffect(() => {
    Promise.all([loadCefr(), loadFoundation()]).then(([lv, foundation]) => {
      setLevels(lv)
      setCircleById(Object.fromEntries(foundation.map((c) => [c.id, c])))
      setReady(true)
    })
  }, [])

  const uid = user?.id ?? ''
  const level = levels.find((l) => l.id === (levelId ?? '').toUpperCase())

  // Hội thoại của TOÀN CẤP (mọi unit) — dùng cho tab "Nghe" (③ N3, dictation lấy
  // câu từ hội thoại). Tải riêng theo cấp (giống CefrExam.tsx) — chỉ chạy khi có
  // `level`, không chặn các tab khác.
  const [levelDialogues, setLevelDialogues] = useState<Dialogue[]>([])
  useEffect(() => {
    if (!level) return
    let alive = true
    Promise.all(level.units.map((u) => getDialogues(u.id))).then((lists) => {
      if (alive) setLevelDialogues(lists.flat())
    })
    return () => {
      alive = false
    }
  }, [level])

  // U-3: trình độ khai lúc onboarding — nếu ≥ Trung cấp thì gợi ý test-out ở A1
  // ("Tôi đã biết vòng này" trong vòng từ vựng) thay vì học lại từng thẻ.
  const onboarding = useOnboarding(user?.id)
  const [testoutDismissed, setTestoutDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`et_a1_testout_dismissed_${uid}`) === '1'
    } catch {
      return false
    }
  })
  function dismissTestout() {
    try {
      localStorage.setItem(`et_a1_testout_dismissed_${uid}`, '1')
    } catch {
      /* localStorage bị chặn — banner vẫn ẩn trong phiên này nhờ state */
    }
    setTestoutDismissed(true)
  }

  // `refresh`/`ready` là khóa invalidation thủ công (dữ liệu đọc từ localStorage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const learned = useMemo(() => getLearnedWords(uid), [uid, refresh, ready])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doneGrammar = useMemo(() => getDoneGrammar(uid), [uid, refresh])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const viewedDialogues = useMemo(() => getViewedDialogues(uid), [uid, refresh])

  // Kết quả thi cuối cấp (để mở khóa + hiện điểm/huy hiệu + CTA "Thi cuối cấp").
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const examMap = useMemo(() => getExamMap(uid), [uid, refresh])
  const examPassed = useMemo(
    () => new Set(Object.keys(examMap).filter((id) => examMap[id]?.passed)),
    [examMap],
  )
  const lockedMap = useMemo(
    () => computeLockedMapPersisted(uid, levels, examPassed),
    [uid, levels, examPassed],
  )

  // Số thứ tự "Bài N" liên tục trong cả cấp (ổn định dù có ẩn bài đã xong).
  const lessonNumberOf = useMemo(() => {
    const map = new Map<string, number>()
    let n = 0
    level?.units.forEach((u) => u.grammar.forEach((g) => map.set(g.id, ++n)))
    return map
  }, [level])

  // Nguồn câu quiz NGỮ PHÁP cho tab "Kiểm tra" (V8, docs/research/cai-tien-lo-trinh-hoc.md):
  // CHỈ lấy từ các bài đã đánh dấu "Đã học xong" — ngữ pháp chưa học không nên bị hỏi.
  const grammarQuizPool = useMemo((): GrammarQuizSource[] => {
    const out: GrammarQuizSource[] = []
    if (!level) return out
    for (const u of level.units) {
      for (const g of u.grammar) {
        if (doneGrammar.has(g.id) && g.quiz) {
          for (const item of g.quiz) out.push({ lessonId: g.id, item })
        }
      }
    }
    return out
  }, [level, doneGrammar])

  // Mở lại 1 bài ngữ pháp theo id (dùng khi trả lời sai câu quiz ngữ pháp ở tab Kiểm tra).
  function openLessonById(lessonId: string) {
    const g = level?.units.flatMap((u) => u.grammar).find((x) => x.id === lessonId)
    if (g) setLesson(g)
  }

  // Preload audio 20 từ "hôm nay" khi browser rảnh (chuyển từ trang /learning-path
  // sang đây vì tab "Hôm nay" giờ nằm ở trang cấp).
  useEffect(() => {
    if (!uid) return
    const run = () => {
      void preloadLearnData(uid)
    }
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: 3000 })
      return () => cancelIdleCallback(id)
    }
    const tid = setTimeout(run, 500)
    return () => clearTimeout(tid)
  }, [uid])

  // Từ vựng dùng cho 4 tab học: từ của CẤP này; cấp CUỐI (B2) cộng thêm phần
  // ngoài lộ trình CEFR để học tiếp sau khi xong cấp.
  const studyPool = useMemo(() => {
    if (!dictReady || !level) return []
    const words = getLevelWords(level.id)
    const isLast = levels[levels.length - 1]?.id === level.id
    return isLast ? [...words, ...getBeyondCefrWords()] : words
  }, [dictReady, level, levels])

  // Toàn bộ từ đã học (mọi cấp + Mở rộng) — dùng riêng cho tab Ôn SRS để KHÔNG
  // bỏ sót từ đến hạn của cấp khác (trước đây lọc theo studyPool khiến từ A1
  // đến hạn không hiện khi đang học trang B1 → quên dần).
  const allWordsPool = useMemo(() => (dictReady ? getLearningPath() : []), [dictReady])

  // Badge trên tab: số từ CẦN ÔN SRS (toàn bộ lộ trình) / đã đánh dấu khó của cấp này.
  // `refresh` là khóa invalidation thủ công (dữ liệu đọc từ localStorage).
  const srsDue = useMemo(
    () => (uid ? getDueWords(uid, allWordsPool).length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, allWordsPool, refresh],
  )
  const hardCount = useMemo(() => {
    if (!uid) return 0
    const hard = getDifficultWords(uid)
    return studyPool.filter((w) => hard.has(w.word.toLowerCase())).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, studyPool, refresh])

  if (!user) return null
  // Dữ liệu đã tải mà không tìm thấy cấp (URL sai kiểu /learning-path/c9) → về lộ trình.
  if (ready && !level) return <Navigate to="/learning-path" replace />

  const accent: AccentClasses = level ? ACCENT[level.accent] : ACCENT.emerald
  const locked = level ? (lockedMap.get(level.id) ?? false) : false

  // Mở 1 hội thoại + ghi "đã xem" (ownerId = id unit hoặc id vòng từ vựng).
  function openDialogue(ownerId: string, d: Dialogue) {
    if (uid) markDialogueViewed(uid, ownerId, d.titleEn)
    bump()
    setDialogue(d)
  }

  // ── Khung trang chung ──────────────────────────────────────────────────
  function shell(children: React.ReactNode) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout back />
        <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
          {children}
        </main>
      </div>
    )
  }

  if (!ready || !level) {
    return shell(
      <div className="glass rounded-xl p-8 text-center animate-fade-in">
        <p className="text-zinc-400 text-sm">{isA ? 'Đang tải lộ trình…' : 'Loading roadmap…'}</p>
      </div>,
    )
  }

  // ── Màn con: hội thoại / flashcard / bài ngữ pháp ─────────────────────
  if (dialogue) {
    return shell(
      <DialogueView
        dialogue={dialogue}
        isA={isA}
        accent={accent}
        onBack={() => setDialogue(null)}
      />,
    )
  }
  if (circle) {
    return shell(
      <VocabFlash
        circle={circle}
        isA={isA}
        uid={uid}
        pool={studyPool}
        onProgress={bump}
        onBack={() => setCircle(null)}
        onOpenDialogue={(d) => openDialogue(circle.id, d)}
      />,
    )
  }
  if (lesson) {
    return shell(
      <GrammarDetail
        lesson={lesson}
        isA={isA}
        uid={uid}
        accent={accent}
        onBack={() => setLesson(null)}
        onDoneChange={bump}
      />,
    )
  }
  if (examing) {
    return shell(
      <CefrExam
        uid={uid}
        isA={isA}
        level={level}
        accent={accent}
        onClose={() => {
          setExaming(false)
          bump() // cập nhật kết quả thi + mở khóa cấp sau nếu vừa đạt
        }}
        onOpenLesson={(id) => {
          setExaming(false)
          openLessonById(id)
        }}
      />,
    )
  }

  const vocab = levelVocabCounts(level, circleById, learned)
  const grammar = levelGrammarCounts(level, doneGrammar)
  const next = locked ? null : findNextStep(level, circleById, learned, doneGrammar)

  // Bài thi cuối cấp: đủ điều kiện dự thi (≥70% từ vựng + 100% ngữ pháp) + kết quả.
  const examResult = examMap[level.id]
  const examPassedThis = examResult?.passed ?? false
  const examEligible = !locked && isExamEligible(level, circleById, learned, doneGrammar)

  // Banner gợi ý test-out (U-3): chỉ ở A1, người khai trình độ ≥ Trung cấp, chưa
  // bấm đóng, và từ vựng A1 chưa đạt ngưỡng mở A2 (đạt rồi thì gợi ý hết tác dụng).
  const showTestoutBanner =
    level.id === 'A1' &&
    !locked &&
    !testoutDismissed &&
    onboarding != null &&
    onboarding.level !== 'beginner' &&
    vocab.total > 0 &&
    vocab.done / vocab.total < UNLOCK_PCT

  // Mục "Học tiếp": nhãn + hành động mở đúng màn.
  let nextLabel = ''
  let nextOnClick: (() => void) | null = null
  if (next?.kind === 'vocab' && next.circleId) {
    const c = circleById[next.circleId]
    if (c) {
      const done = circleDoneCount(c, learned)
      nextLabel = `${c.emoji} ${isA ? c.titleVi : c.titleEn} (${done}/${c.words.length} ${isA ? 'từ' : 'words'})`
      nextOnClick = () => setCircle(c)
    }
  } else if (next?.kind === 'grammar' && next.lessonId) {
    const g = next.unit.grammar.find((x) => x.id === next.lessonId)
    if (g) {
      nextLabel = `${isA ? 'Bài' : 'Lesson'} ${lessonNumberOf.get(g.id) ?? ''}: ${isA ? g.titleVi : g.titleEn}`
      nextOnClick = () => setLesson(g)
    }
  }

  // Cấp kế tiếp (để gợi ý khi hoàn thành cấp này).
  const levelIdx = levels.findIndex((l) => l.id === level.id)
  const nextLevel = levels[levelIdx + 1]
  const prevLevel = levelIdx > 0 ? levels[levelIdx - 1] : undefined

  // Đánh số bài ngữ pháp liên tục trong cả cấp (Bài 1, Bài 2, …)
  let lessonStart = 0

  // Cấp còn khóa → chỉ hiện màn khóa (không có thanh tab / tab học).
  const activeTab: StudyTab = locked ? 'lessons' : tab

  // Thanh tab của trang cấp (kiểu dáng giữ nguyên từ trang /learning-path cũ).
  type TabDef = {
    key: StudyTab
    icon: typeof Target
    labelA: string
    labelB: string
    badge?: number
    active: string
    inactive: string
  }
  const TABS: TabDef[] = [
    {
      key: 'lessons',
      icon: BookOpen,
      labelA: 'Bài học',
      labelB: 'Lessons',
      active: 'bg-teal-500/20 text-teal-300 theme-light:text-teal-800 border border-teal-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'today',
      icon: Target,
      labelA: 'Hôm nay',
      labelB: 'Today',
      active:
        'bg-accent-500/20 text-accent-300 theme-light:text-accent-800 border border-accent-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'srs',
      icon: Brain,
      labelA: 'Ôn SRS',
      labelB: 'SRS',
      badge: srsDue,
      active: 'bg-sky-500/20 text-sky-300 theme-light:text-sky-800 border border-sky-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'hard',
      icon: Star,
      labelA: 'Từ khó',
      labelB: 'Hard',
      badge: hardCount,
      active:
        'bg-amber-500/20 text-amber-300 theme-light:text-amber-800 border border-amber-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'quiz',
      icon: ClipboardList,
      labelA: 'Kiểm tra',
      labelB: 'Quiz',
      active:
        'bg-violet-500/20 text-violet-300 theme-light:text-violet-800 border border-violet-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
    {
      key: 'listening',
      icon: Headphones,
      labelA: 'Nghe',
      labelB: 'Listen',
      active: 'bg-sky-500/20 text-sky-300 theme-light:text-sky-800 border border-sky-500/40',
      inactive: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200',
    },
  ]

  return shell(
    <div className="animate-fade-in">
      {/* Về trang lộ trình (tổng quan 4 cấp ở /learning-path) */}
      <button
        onClick={() => nav('/learning-path')}
        className="tap-44 flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-3"
      >
        <ChevronLeft className="w-4 h-4" /> {isA ? 'Lộ trình A1 → C2' : 'Roadmap A1 → C2'}
      </button>

      {/* Thanh tab học của cấp — ẩn khi cấp còn khóa */}
      {!locked && (
        <div className="grid grid-cols-6 gap-1.5 mb-4">
          {TABS.map(({ key, icon: Icon, labelA, labelB, badge, active, inactive }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition ${activeTab === key ? active : inactive}`}
            >
              <Icon className="w-4 h-4" />
              <span>{isA ? labelA : labelB}</span>
              {badge != null && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tiêu đề: to + phụ đề ở tab "Bài học"; gọn 1 dòng ở 4 tab học (đỡ chiếm chỗ,
          vì các tab đó đã có ngữ cảnh riêng — vd "Từ 3/10" — không cần tiêu đề to). */}
      {activeTab === 'lessons' ? (
        <PageHeader
          title={isA ? level.titleVi : level.titleEn}
          subtitle={level.subtitleVi}
          className="mb-4"
        />
      ) : (
        <p className="text-sm font-semibold text-zinc-300 mb-4">
          {isA ? level.titleVi : level.titleEn}
        </p>
      )}

      {/* 5 tab học theo cấp — cần từ điển nạp xong mới render */}
      {activeTab !== 'lessons' &&
        (!dictReady ? (
          <div className="glass rounded-xl p-8 text-center animate-fade-in">
            <p className="text-zinc-400 text-sm">
              {isA ? 'Đang tải từ vựng…' : 'Loading vocabulary…'}
            </p>
          </div>
        ) : (
          // key={level.id}: đổi cấp (điều hướng giữa các trang cấp) → remount để
          // batch/câu hỏi khởi tạo lại theo đúng từ vựng của cấp mới.
          <>
            {activeTab === 'today' && (
              <TodayLesson
                key={level.id}
                uid={uid}
                isA={isA}
                pool={studyPool}
                onProgress={bump}
                sessionCap={sessionCap}
              />
            )}
            {activeTab === 'srs' && (
              <SRSReview
                key={level.id}
                uid={uid}
                isA={isA}
                pool={allWordsPool}
                levelPool={studyPool}
                onUpdate={bump}
                sessionCap={sessionCap}
              />
            )}
            {activeTab === 'hard' && (
              <HardWords key={level.id} uid={uid} isA={isA} pool={studyPool} onUpdate={bump} />
            )}
            {activeTab === 'quiz' && (
              <QuizTab
                key={level.id}
                uid={uid}
                isA={isA}
                pool={studyPool}
                grammarPool={grammarQuizPool}
                onOpenLesson={openLessonById}
              />
            )}
            {activeTab === 'listening' && (
              <ListeningTab
                key={level.id}
                isA={isA}
                levelId={level.id}
                accent={accent}
                pool={studyPool}
                learned={learned}
                dialogues={levelDialogues}
              />
            )}
          </>
        ))}

      {activeTab === 'lessons' && (
        <>
          {/* Thẻ tổng quan cấp độ */}
          <div className={`glass rounded-2xl p-5 mb-4 border ${accent.ring}`}>
            <div className="flex items-start gap-3">
              <GraduationCap className={`w-6 h-6 shrink-0 ${accent.text}`} />
              <div className="flex-1">
                <p className="text-base text-zinc-300 leading-snug">{level.goalVi}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> {level.units.length}{' '}
                    {isA ? 'chủ đề' : 'units'}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {grammar.total}{' '}
                    {isA ? 'bài ngữ pháp' : 'grammar points'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {vocab.total} {isA ? 'từ vựng' : 'words'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2 thanh tiến độ: từ vựng + ngữ pháp */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">{isA ? 'Từ vựng' : 'Vocabulary'}</span>
                  <span className={`font-semibold ${accent.text}`}>
                    {vocab.done}/{vocab.total} ({pct(vocab.done, vocab.total)}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${accent.bar} transition-all`}
                    style={{ width: `${pct(vocab.done, vocab.total)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">{isA ? 'Ngữ pháp' : 'Grammar'}</span>
                  <span className={`font-semibold ${accent.text}`}>
                    {grammar.done}/{grammar.total} ({pct(grammar.done, grammar.total)}%)
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${accent.bar} transition-all`}
                    style={{ width: `${pct(grammar.done, grammar.total)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mục tiêu can-do — thu gọn được để không đẩy nội dung học xuống */}
            <details className="mt-4 pt-4 border-t border-zinc-800/80 group">
              <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-300 flex items-center gap-1.5 select-none">
                <Sparkles className={`w-4 h-4 shrink-0 ${accent.text}`} />
                <span className="flex-1">
                  {isA
                    ? 'Hoàn thành cấp này, bạn có thể…'
                    : 'After this level, you will be able to…'}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="space-y-2 mt-3">
                {level.canDo.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-base text-zinc-300 leading-snug"
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${accent.text}`} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {locked ? (
            /* Màn khóa — cấp này chưa mở */
            <div className="glass rounded-2xl p-6 text-center space-y-3 border border-zinc-700/60">
              <Lock className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-white font-semibold text-lg">
                {isA ? `Cấp ${level.id} đang bị khóa` : `${level.id} is locked`}
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isA
                  ? `Thi đạt bài kiểm tra cuối cấp ${prevLevel?.id ?? ''} (≥70%) để mở khóa.`
                  : `Pass the ${prevLevel?.id ?? 'previous level'} end-of-level exam (≥70%) to unlock.`}
              </p>
              {prevLevel && (
                <button
                  onClick={() => nav(`/learning-path/${prevLevel.id.toLowerCase()}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
                >
                  {isA ? `Học tiếp cấp ${prevLevel.id}` : `Continue ${prevLevel.id}`}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Gợi ý test-out cho người đã có nền (U-3) */}
              {showTestoutBanner && (
                <div className="glass rounded-2xl p-4 mb-4 border border-sky-500/30 flex items-start gap-3 animate-fade-in">
                  <Zap className="w-5 h-5 text-sky-400 theme-light:text-sky-700 shrink-0 mt-0.5" />
                  <p className="flex-1 text-sm text-zinc-300 leading-relaxed">
                    {isA ? (
                      <>
                        Bạn khai trình độ{' '}
                        <strong className="text-white">
                          {onboarding?.level === 'advanced' ? 'Nâng cao' : 'Trung cấp'}
                        </strong>{' '}
                        khi bắt đầu? Không cần học lại từng thẻ — mở một vòng từ vựng rồi bấm{' '}
                        <strong className="text-white">
                          “Tôi đã biết vòng này — kiểm tra nhanh”
                        </strong>{' '}
                        để vượt nhanh các vòng đã biết.
                      </>
                    ) : (
                      <>
                        You said your level is{' '}
                        <strong className="text-white">
                          {onboarding?.level === 'advanced' ? 'Advanced' : 'Intermediate'}
                        </strong>
                        ? No need to relearn every card — open a vocabulary set and tap{' '}
                        <strong className="text-white">
                          “I already know this set — quick test”
                        </strong>{' '}
                        to skip ahead.
                      </>
                    )}
                  </p>
                  <button
                    onClick={dismissTestout}
                    aria-label={isA ? 'Đóng gợi ý' : 'Dismiss suggestion'}
                    className="tap-44 shrink-0 text-zinc-400 hover:text-zinc-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Thẻ CTA bài thi cuối cấp — khi đủ điều kiện dự thi hoặc đã qua */}
              {(examEligible || examPassedThis) && (
                <button
                  onClick={() => setExaming(true)}
                  className={`w-full glass rounded-2xl p-4 mb-4 flex items-center gap-3 text-left border transition hover:border-zinc-500 ${examPassedThis ? 'border-amber-500/40' : accent.ring} animate-fade-in`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${examPassedThis ? 'bg-amber-500/15' : accent.soft}`}
                  >
                    <GraduationCap
                      className={`w-5 h-5 ${examPassedThis ? 'text-amber-300 theme-light:text-amber-800' : accent.text}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {examPassedThis
                        ? isA
                          ? `🎓 Đã qua cấp ${level.id} · điểm cao nhất ${examResult?.bestPct}%`
                          : `🎓 ${level.id} passed · best ${examResult?.bestPct}%`
                        : isA
                          ? `🎓 Sẵn sàng — Thi cuối cấp ${level.id}`
                          : `🎓 Ready — take the ${level.id} exam`}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {examPassedThis
                        ? isA
                          ? 'Thi lại để cải thiện điểm (không bắt buộc).'
                          : 'Retake to improve your score (optional).'
                        : isA
                          ? 'Đạt ≥70% để qua cấp và mở khóa cấp tiếp theo.'
                          : 'Score ≥70% to pass and unlock the next level.'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
                </button>
              )}

              {/* Học tiếp / hoàn thành cấp */}
              {nextOnClick ? (
                <button
                  onClick={nextOnClick}
                  className={`w-full glass rounded-2xl p-4 mb-4 flex items-center gap-3 text-left border ${accent.ring} hover:border-zinc-500 transition`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${accent.soft} flex items-center justify-center shrink-0`}
                  >
                    <Play className={`w-5 h-5 fill-current ${accent.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400">
                      {isA ? 'Học tiếp' : 'Continue'} · {isA ? 'Phần' : 'Part'}{' '}
                      {(next?.unitIndex ?? 0) + 1} — {isA ? next?.unit.titleVi : next?.unit.titleEn}
                    </p>
                    <p className="text-sm font-semibold text-white truncate mt-0.5">{nextLabel}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 shrink-0" />
                </button>
              ) : (
                <div className="glass rounded-2xl p-5 mb-4 text-center space-y-2">
                  <PartyPopper className="w-8 h-8 text-amber-400 theme-light:text-amber-700 mx-auto" />
                  <p className="text-white font-semibold">
                    {isA
                      ? `Chúc mừng! Bạn đã hoàn thành cấp ${level.id} 🎉`
                      : `Congrats! You finished ${level.id} 🎉`}
                  </p>
                  {nextLevel && !(lockedMap.get(nextLevel.id) ?? false) && (
                    <button
                      onClick={() => nav(`/learning-path/${nextLevel.id.toLowerCase()}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 text-accent-300 theme-light:text-accent-800 text-sm font-medium transition"
                    >
                      {isA ? `Sang cấp ${nextLevel.id}` : `Go to ${nextLevel.id}`}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Danh sách unit — "Phần 1..n", trình tự: từ vựng → ngữ pháp → hội thoại */}
              <div className="space-y-3">
                {level.units.map((unit, ui) => {
                  const start = lessonStart
                  lessonStart += unit.grammar.length
                  return (
                    <UnitSection
                      key={unit.id}
                      unit={unit}
                      index={ui}
                      isA={isA}
                      accent={accent}
                      circleById={circleById}
                      learned={learned}
                      doneGrammar={doneGrammar}
                      viewedDialogues={viewedDialogues}
                      lessonStartIndex={start}
                      onOpenLesson={setLesson}
                      onOpenCircle={setCircle}
                      onOpenDialogue={openDialogue}
                    />
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>,
  )
}

// ── 1 unit — "Phần i" với 3 bước; ẩn mục đã hoàn thành 100% ──────────────────
function UnitSection({
  unit,
  index,
  isA,
  accent,
  circleById,
  learned,
  doneGrammar,
  viewedDialogues,
  lessonStartIndex,
  onOpenLesson,
  onOpenCircle,
  onOpenDialogue,
}: {
  unit: CefrUnit
  index: number
  isA: boolean
  accent: AccentClasses
  circleById: Record<string, Circle>
  learned: Set<string>
  doneGrammar: Set<string>
  viewedDialogues: Set<string>
  lessonStartIndex: number
  onOpenLesson: (g: GrammarLesson) => void
  onOpenCircle: (c: Circle) => void
  onOpenDialogue: (ownerId: string, d: Dialogue) => void
}) {
  const [dialogues, setDialogues] = useState<Dialogue[]>([])
  const [dlgLoaded, setDlgLoaded] = useState(false)
  useEffect(() => {
    getDialogues(unit.id).then((ds) => {
      setDialogues(ds)
      setDlgLoaded(true)
    })
  }, [unit.id])

  // Hiện lại các mục đã hoàn thành (mặc định ẩn).
  const [showDone, setShowDone] = useState(false)
  // Unit đã xong 100% → thu gọn thành 1 dòng; bấm để mở rộng xem lại.
  const [expanded, setExpanded] = useState(false)

  const circles = unit.vocabCircleIds
    .map((id) => circleById[id])
    .filter((c): c is Circle => c != null)
  const isCircleDone = (c: Circle) => circleDoneCount(c, learned) >= c.words.length
  const isDlgViewed = (d: Dialogue) => viewedDialogues.has(dialogueKey(unit.id, d.titleEn))

  const doneCircles = circles.filter(isCircleDone)
  const doneLessons = unit.grammar.filter((g) => doneGrammar.has(g.id))
  const doneDlgs = dialogues.filter(isDlgViewed)
  const hiddenCount = doneCircles.length + doneLessons.length + doneDlgs.length
  const totalCount = circles.length + unit.grammar.length + dialogues.length
  // Chỉ coi là "xong hết" khi hội thoại đã tải xong (tránh nhấp nháy thu gọn).
  const allDone = dlgLoaded && totalCount > 0 && hiddenCount >= totalCount

  // Unit hoàn thành + đang thu gọn → chỉ 1 dòng mỏng.
  if (allDone && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full glass rounded-2xl px-4 py-3 flex items-center gap-2 text-left hover:border-zinc-600 border border-transparent transition"
      >
        <CheckCircle2 className={`w-4 h-4 shrink-0 ${accent.text}`} />
        <span className="text-lg shrink-0">{unit.emoji}</span>
        <span className="flex-1 min-w-0 text-sm font-medium text-zinc-300 truncate">
          {isA ? unit.titleVi : unit.titleEn}
        </span>
        <span className={`text-xs shrink-0 ${accent.text}`}>{isA ? 'Hoàn thành' : 'Done'}</span>
        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
      </button>
    )
  }

  // Khi unit đã xong và người dùng mở rộng → hiện tất cả mục (kiểu "đã xong").
  const showAll = showDone || (allDone && expanded)

  const visCircles = showAll ? circles : circles.filter((c) => !isCircleDone(c))
  const visLessons = showAll ? unit.grammar : unit.grammar.filter((g) => !doneGrammar.has(g.id))
  const visDlgs = showAll ? dialogues : dialogues.filter((d) => !isDlgViewed(d))

  // Đánh số bước theo các phần CÓ TRONG unit (unit thiếu phần nào thì bỏ qua số đó).
  let step = 0
  const stepLabel = (nameVi: string, nameEn: string) => {
    step += 1
    return (
      <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
        {step} · {isA ? nameVi : nameEn}
      </p>
    )
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[11px] font-bold uppercase tracking-wide ${accent.text}`}>
          {isA ? 'Phần' : 'Part'} {index + 1}
        </span>
        <span className="text-xl">{unit.emoji}</span>
        <h4 className="flex-1 min-w-0 font-semibold text-white text-base truncate">
          {isA ? unit.titleVi : unit.titleEn}
        </h4>
        {allDone && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition shrink-0"
          >
            {isA ? 'Thu gọn' : 'Collapse'}
          </button>
        )}
      </div>

      {/* ① Từ vựng */}
      {circles.length > 0 && (
        <div className="mb-3">
          {stepLabel('Từ vựng', 'Vocabulary')}
          {visCircles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {visCircles.map((c) => {
                const done = circleDoneCount(c, learned)
                const full = done >= c.words.length
                return (
                  <button
                    key={c.id}
                    onClick={() => onOpenCircle(c)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition hover:border-zinc-500 ${full ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/70 border-zinc-800 text-zinc-300'}`}
                  >
                    <span>{c.emoji}</span>
                    <span>{isA ? c.titleVi : c.titleEn}</span>
                    <span className={full ? accent.text : 'text-zinc-400'}>
                      {full ? <Check className="w-3.5 h-3.5" /> : `${done}/${c.words.length}`}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              {isA ? '✓ Đã thuộc hết từ vựng phần này' : '✓ All words learned'}
            </p>
          )}
        </div>
      )}

      {/* ② Ngữ pháp — số thứ tự "Bài N" liên tục toàn cấp */}
      {unit.grammar.length > 0 && (
        <div className="mb-3">
          {stepLabel('Ngữ pháp', 'Grammar')}
          {visLessons.length > 0 ? (
            <div className="space-y-1.5">
              {visLessons.map((g) => {
                const gi = unit.grammar.indexOf(g)
                const done = doneGrammar.has(g.id)
                return (
                  <button
                    key={g.id}
                    onClick={() => onOpenLesson(g)}
                    className={`w-full flex items-center gap-2 text-left px-3 py-3 rounded-xl border transition hover:border-zinc-600 ${done ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/70 border-zinc-800'}`}
                  >
                    <span className={`text-xs font-bold w-14 shrink-0 ${accent.text}`}>
                      {isA ? `Bài ${lessonStartIndex + gi + 1}` : `L.${lessonStartIndex + gi + 1}`}
                    </span>
                    {done ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${accent.text}`} />
                    ) : (
                      <BookOpen className={`w-4 h-4 shrink-0 ${accent.text}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {isA ? g.titleVi : g.titleEn}
                      </p>
                      <p className="text-xs text-zinc-400 font-mono truncate">{g.structure}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              {isA ? '✓ Đã học xong ngữ pháp phần này' : '✓ All grammar done'}
            </p>
          )}
        </div>
      )}

      {/* ③ Hội thoại mẫu */}
      {dialogues.length > 0 && (
        <div className="mb-1">
          {stepLabel('Hội thoại', 'Dialogues')}
          {visDlgs.length > 0 ? (
            <div className="space-y-1.5">
              {visDlgs.map((dl, i) => {
                const viewed = isDlgViewed(dl)
                return (
                  <button
                    key={i}
                    onClick={() => onOpenDialogue(unit.id, dl)}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border transition hover:border-zinc-600 ${viewed ? `${accent.soft} ${accent.ring}` : 'bg-zinc-900/70 border-zinc-800'}`}
                  >
                    {viewed ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${accent.text}`} />
                    ) : (
                      <MessageCircle className={`w-4 h-4 shrink-0 ${accent.text}`} />
                    )}
                    <span className="flex-1 min-w-0 text-sm font-medium text-zinc-200 truncate">
                      {isA ? dl.titleVi : dl.titleEn}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              {isA ? '✓ Đã xem hết hội thoại phần này' : '✓ All dialogues viewed'}
            </p>
          )}
        </div>
      )}

      {/* Nút hiện/ẩn các mục đã hoàn thành (chỉ khi có mục bị ẩn và unit chưa xong hết) */}
      {hiddenCount > 0 && !allDone && (
        <button
          onClick={() => setShowDone((v) => !v)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 py-2 transition"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-accent-400 theme-light:text-accent-800" />
          {showDone
            ? isA
              ? 'Ẩn mục đã hoàn thành'
              : 'Hide completed'
            : isA
              ? `Đã hoàn thành ${hiddenCount} mục · Xem lại`
              : `${hiddenCount} completed · Review`}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showDone ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </div>
  )
}
