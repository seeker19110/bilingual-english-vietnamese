// apps/dhcb/src/pages/core/Pricing.tsx — Trang "Bảng giá / Nâng cấp" (/nang-cap).
//
// Vì sao tách khỏi trang Hồ sơ (audit UI/UX 2026-08-31 mục B9): bảng gói trước đây là một
// <h2> nhúng giữa Profile, mà Profile giới hạn `max-w-3xl` — trên desktop 4 gói
// (Free/Plus/Pro/VIP) không xếp cạnh nhau để so sánh được, và không có URL nào dẫn thẳng
// tới bảng giá. Trang này nới bề rộng ở desktop (`lg:max-w-6xl`) để UpgradeSection bung
// `lg:grid-cols-4`; Hồ sơ giữ bản rút gọn có nút dẫn sang đây.

import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import UpgradeSection from '../../components/UpgradeSection'
import PricePromoBanner from '../../components/PricePromoBanner'
import { useAuth } from '../../context/useAuth'
import { getDirection } from '../../lib/storage'

export default function Pricing() {
  const { user } = useAuth()
  const isA = getDirection() === 'A'

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />

      <main className="max-w-3xl lg:max-w-6xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title={isA ? 'Nâng cấp gói' : 'Upgrade your plan'}
          subtitle={
            isA
              ? 'So sánh Free · Plus · Pro · VIP rồi chọn chu kỳ 10 ngày, tháng hoặc năm.'
              : 'Compare Free · Plus · Pro · VIP, then pick a 10-day, monthly or yearly cycle.'
          }
        />

        <PricePromoBanner isA={isA} />

        {/* Đã là VIP thì UpgradeSection tự trả về null — khi đó nói rõ thay vì để trang trống. */}
        {user?.plan === 'vip' ? (
          <p className="text-sm text-zinc-300 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-4">
            {isA
              ? 'Bạn đang dùng gói VIP — gói cao nhất hiện có. Không còn gì để nâng cấp thêm.'
              : "You're on VIP — the highest plan available. Nothing left to upgrade."}
          </p>
        ) : (
          <UpgradeSection isA={isA} currentPlan={user?.plan ?? 'free'} variant="full" />
        )}
      </main>
    </div>
  )
}
