// ──────────────────────────────────────────────────────────────────────
// TRANG /learning-path — TỔNG QUAN LỘ TRÌNH CEFR (A1 → C2)
//
// Các tab học (Hôm nay · Ôn SRS · Từ khó · Kiểm tra) đã CHUYỂN vào trang
// riêng của từng cấp (/learning-path/a1…c2 — CefrLevelPage.tsx, nội dung
// tab ở components/StudyTabs.tsx). Trang này chỉ còn: mốc từ vựng + bản đồ
// 6 cấp (RoadmapTab) để chọn cấp muốn học.
// ──────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Target, Brain, Star, ClipboardList } from 'lucide-react'
import { usePageTitle } from '../../../lib/usePageTitle'
import Layout from '../../../components/Layout'
import { PageShell } from '@core/PageShell'
import PageHeader from '../../../components/PageHeader'
import VocabMilestone from '../../../components/VocabMilestone'
import StudyPanel, { type StudyTab } from '../../../components/StudyPanel'
import RoadmapTab from '../../../components/RoadmapTab'
import { getDirection } from '../../../lib/storage'
import { useAuth } from '../../../context/useAuth'
import { useOnboarding } from '../../../lib/onboarding'

type TabDef = {
  key: StudyTab
  icon: typeof Target
  labelA: string
  labelB: string
  badge?: number
  active: string
}

export default function Learn() {
  usePageTitle('Lộ trình học | Môn Tiếng Anh · Đồng hành cùng bạn')
  const { user } = useAuth()
  const onboarding = useOnboarding(user?.id) // nhóm tuổi (GĐ 4, PROGRESS.md) — lọc vòng từ vựng
  const isA = getDirection() === 'A'
  const [tab, setTab] = useState<StudyTab>('today')
  const [badges, setBadges] = useState({ srsDue: 0, hardCount: 0 })

  if (!user) return null

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
      badge: badges.srsDue,
      active: 'bg-sky-500/20 text-sky-300 theme-light:text-sky-800 border border-sky-500/40',
    },
    {
      key: 'hard',
      icon: Star,
      labelA: 'Từ khó',
      labelB: 'Hard',
      badge: badges.hardCount,
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
    <div className="min-h-dvh bg-zinc-950">
      <Layout back />

      {/* [2026-09-02, đợt 4 thiết kế lại desktop] Bản đồ lộ trình → width standard. */}
      <PageShell
        width="standard"
        baseWidth="max-w-3xl"
        className="!pb-[calc(1.5rem+var(--bnav-h))]"
      >
        <PageHeader
          title={isA ? 'Học theo lộ trình' : 'Learning Path'}
          subtitle={isA ? 'Lộ trình chuẩn CEFR A1 → C2' : 'CEFR roadmap A1 → C2'}
        />
        <VocabMilestone userId={user.id} />

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

          <StudyPanel
            uid={user.id}
            isA={isA}
            tab={tab}
            ageGroup={onboarding?.ageGroup}
            onBadges={setBadges}
          />
        </div>

        <RoadmapTab uid={user.id} isA={isA} />
      </PageShell>
    </div>
  )
}
