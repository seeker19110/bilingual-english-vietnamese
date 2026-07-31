// ──────────────────────────────────────────────────────────────────────
// TRANG /learning-path — TỔNG QUAN LỘ TRÌNH CEFR (A1 → C2)
//
// Các tab học (Hôm nay · Ôn SRS · Từ khó · Kiểm tra) đã CHUYỂN vào trang
// riêng của từng cấp (/learning-path/a1…c2 — CefrLevelPage.tsx, nội dung
// tab ở components/StudyTabs.tsx). Trang này chỉ còn: mốc từ vựng + bản đồ
// 6 cấp (RoadmapTab) để chọn cấp muốn học.
// ──────────────────────────────────────────────────────────────────────

import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import VocabMilestone from '../components/VocabMilestone'
import StudyPanel from '../components/StudyPanel'
import RoadmapTab from '../components/RoadmapTab'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'
import { useOnboarding } from '../lib/onboarding'

export default function Learn() {
  const { user } = useAuth()
  const onboarding = useOnboarding(user?.id) // nhóm tuổi (GĐ 4, PROGRESS.md) — lọc vòng từ vựng
  const isA = getDirection() === 'A'

  if (!user) return null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout back />

      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        <PageHeader
          title={isA ? 'Học theo lộ trình' : 'Learning Path'}
          subtitle={isA ? 'Lộ trình chuẩn CEFR A1 → C2' : 'CEFR roadmap A1 → C2'}
        />
        <VocabMilestone userId={user.id} />
        <StudyPanel uid={user.id} isA={isA} ageGroup={onboarding?.ageGroup} />

        <RoadmapTab uid={user.id} isA={isA} />
      </main>
    </div>
  )
}
