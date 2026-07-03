// ──────────────────────────────────────────────────────────────────────
// TRANG /learning-path — TỔNG QUAN LỘ TRÌNH CEFR (A1 → B2)
//
// Các tab học (Hôm nay · Ôn SRS · Từ khó · Kiểm tra) đã CHUYỂN vào trang
// riêng của từng cấp (/learning-path/a1…b2 — CefrLevelPage.tsx, nội dung
// tab ở components/StudyTabs.tsx). Trang này chỉ còn: mốc từ vựng + bản đồ
// 4 cấp (RoadmapTab) để chọn cấp muốn học.
// ──────────────────────────────────────────────────────────────────────

import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import QuickActions from '../components/QuickActions'
import VocabMilestone from '../components/VocabMilestone'
import RoadmapTab from '../components/RoadmapTab'
import { getDirection } from '../lib/storage'
import { useAuth } from '../context/useAuth'

export default function Learn() {
  const { user } = useAuth()
  const isA = getDirection() === 'A'

  if (!user) return null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout back />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <PageHeader
          title={isA ? 'Học theo lộ trình' : 'Learning Path'}
          subtitle={isA ? 'Lộ trình chuẩn CEFR A1 → B2' : 'CEFR roadmap A1 → B2'}
        />
        <VocabMilestone userId={user.id} />

        <RoadmapTab uid={user.id} isA={isA} />

        {/* Hàng hành động nhanh ở đáy trang */}
        <QuickActions />
      </main>
    </div>
  )
}
