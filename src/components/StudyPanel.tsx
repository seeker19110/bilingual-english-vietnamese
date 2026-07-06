// ──────────────────────────────────────────────────────────────────────
// KHỐI HỌC NHANH — Hôm nay · Ôn SRS · Từ khó · Kiểm tra
//
// Cụm 4 tab học đặt NGAY DƯỚI "Mốc từ vựng" (VocabMilestone) ở các trang có
// component đó (Từ điển, Học theo lộ trình). DÙNG LẠI component StudyTabs.tsx
// của trang cấp CEFR. Khác trang cấp: KHÔNG giới hạn theo cấp — pool = TOÀN BỘ
// lộ trình học (getLearningPath); không có phần ngữ pháp nên tab Kiểm tra chỉ
// hỏi từ vựng. Giới hạn ngày (tốc độ/ngày, cap) vẫn tính CHUNG toàn app
// (lib/curriculum.ts).
// ──────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { Target, Brain, Star, ClipboardList } from 'lucide-react'
import { TodayLesson, SRSReview, HardWords, QuizTab } from './StudyTabs'
import type { DictEntry } from '../types'
import { getDifficultWords } from '../lib/vocab'
import { getDueWords } from '../lib/srs'
import { loadCurriculum, isCurriculumReady, getLearningPath } from '../lib/curriculum'

type StudyTab = 'today' | 'srs' | 'hard' | 'quiz'

export default function StudyPanel({
  uid,
  isA,
  onProgress,
}: {
  uid: string
  isA: boolean
  // Gọi khi học/ôn xong 1 từ để trang cha cập nhật (vd: "Mốc từ vựng", "Đã học").
  onProgress?: () => void
}) {
  const [tab, setTab] = useState<StudyTab>('today')
  // Các tab học cần TOÀN BỘ từ điển (nạp động) — gate riêng để hiện trạng thái tải.
  const [ready, setReady] = useState(isCurriculumReady())
  // Khóa invalidation thủ công: bump() để tính lại badge sau khi học/đánh dấu.
  const [refresh, setRefresh] = useState(0)
  const bump = () => {
    setRefresh((k) => k + 1)
    onProgress?.()
  }

  useEffect(() => {
    loadCurriculum().then(() => setReady(true))
  }, [])

  // Pool = toàn bộ từ trong lộ trình học (mọi cấp + phần mở rộng).
  const pool = useMemo<DictEntry[]>(() => (ready ? getLearningPath() : []), [ready])

  // Badge trên tab: số từ CẦN ÔN SRS / số từ đã đánh dấu khó.
  // `refresh` là khóa invalidation thủ công (dữ liệu đọc từ localStorage).
  const srsDue = useMemo(
    () => (uid && ready ? getDueWords(uid, pool).length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, pool, ready, refresh],
  )
  const hardCount = useMemo(() => {
    if (!uid || !ready) return 0
    const hard = getDifficultWords(uid)
    return pool.filter((w) => hard.has(w.word.toLowerCase())).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, pool, ready, refresh])

  type TabDef = {
    key: StudyTab
    icon: typeof Target
    labelA: string
    labelB: string
    badge?: number
    active: string
  }
  const TABS: TabDef[] = [
    {
      key: 'today',
      icon: Target,
      labelA: 'Hôm nay',
      labelB: 'Today',
      active:
        'bg-accent-500/20 text-accent-300 theme-light:text-accent-800 border border-accent-500/40',
    },
    {
      key: 'srs',
      icon: Brain,
      labelA: 'Ôn SRS',
      labelB: 'SRS',
      badge: srsDue,
      active: 'bg-sky-500/20 text-sky-300 theme-light:text-sky-800 border border-sky-500/40',
    },
    {
      key: 'hard',
      icon: Star,
      labelA: 'Từ khó',
      labelB: 'Hard',
      badge: hardCount,
      active:
        'bg-amber-500/20 text-amber-300 theme-light:text-amber-800 border border-amber-500/40',
    },
    {
      key: 'quiz',
      icon: ClipboardList,
      labelA: 'Kiểm tra',
      labelB: 'Quiz',
      active:
        'bg-violet-500/20 text-violet-300 theme-light:text-violet-800 border border-violet-500/40',
    },
  ]

  return (
    <div className="mb-4">
      {/* Thanh 4 tab học — kiểu dáng đồng bộ với trang cấp CEFR */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {TABS.map(({ key, icon: Icon, labelA, labelB, badge, active }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-xl text-xs font-medium transition ${
              tab === key
                ? active
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
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

      {/* Nội dung tab — chờ từ điển nạp xong mới render (dữ liệu nặng) */}
      {!ready ? (
        <div className="glass rounded-xl p-8 text-center animate-fade-in">
          <p className="text-zinc-400 text-sm">
            {isA ? 'Đang tải từ vựng…' : 'Loading vocabulary…'}
          </p>
        </div>
      ) : (
        <>
          {tab === 'today' && <TodayLesson uid={uid} isA={isA} pool={pool} onProgress={bump} />}
          {tab === 'srs' && (
            // levelPool = pool ⇒ không hiện nút lọc "chỉ cấp này" (trang từ điển không chia cấp).
            <SRSReview uid={uid} isA={isA} pool={pool} levelPool={pool} onUpdate={bump} />
          )}
          {tab === 'hard' && <HardWords uid={uid} isA={isA} pool={pool} onUpdate={bump} />}
          {tab === 'quiz' && (
            // Trang từ điển không có phần ngữ pháp ⇒ grammarPool rỗng, không mở lại bài.
            <QuizTab uid={uid} isA={isA} pool={pool} grammarPool={[]} onOpenLesson={() => {}} />
          )}
        </>
      )}
    </div>
  )
}
