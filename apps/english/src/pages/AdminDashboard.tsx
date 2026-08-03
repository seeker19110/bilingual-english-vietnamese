import { useSearchParams } from 'react-router-dom'
import {
  Sliders,
  ShieldCheck,
  BarChart3,
  Activity,
  ToggleRight,
  FileText,
  ChevronDown,
  Award,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import AdminUsersPanel from '../components/admin/AdminUsersPanel'
import AdminLimitsPanel from '../components/admin/AdminLimitsPanel'
import AdminGrantPlanPanel from '../components/admin/AdminGrantPlanPanel'
import AdminVipWhitelistPanel from '../components/admin/AdminVipWhitelistPanel'
import AdminPlanFeaturesPanel from '../components/admin/AdminPlanFeaturesPanel'
import AdminPlanMarketingPanel from '../components/admin/AdminPlanMarketingPanel'
import AdminPricePromoPanel from '../components/admin/AdminPricePromoPanel'
import AdminAchievementRewardsPanel from '../components/admin/AdminAchievementRewardsPanel'
import AdminAnalyticsPanel from '../components/admin/AdminAnalyticsPanel'
import AdminUsagePanel from '../components/admin/AdminUsagePanel'

// Trang khung tổng quản trị (/admin-s) — gom các mục quản trị vào 1 nơi, mỗi mục là 1
// accordion (component lật mở/đóng được) thay vì tab + menu bên cạnh như trước. Mục đang mở
// lưu ở query string ?tab=... để bookmark/redirect được (vd /admin-settings cũ →
// /admin-s?tab=limits). Quyền admin do SERVER tự kiểm (ADMIN_EMAILS trong .env, xem
// api/_lib/adminAuth.ts) — client không biết trước ai là admin, chỉ dựa vào response 403 của
// từng mục. Mỗi mục tự gọi API riêng và tự xử lý 403/tải/lỗi; panel chỉ MOUNT khi đang mở
// (giữ nguyên hành vi cũ: không gọi API của mục đang đóng) — đóng lại thì unmount luôn, mở
// lại sẽ tải mới (không giữ state cũ giữa các lần mở).
//
// Ghi chú: tab "Chặn tên tài khoản giả danh" CHƯA thêm vì chưa thấy code liên quan
// (vd api/_lib/reservedNames.ts) trong repo lúc viết trang này — không bịa UI cho tính năng
// chưa tồn tại. Thêm lại khi tính năng đó có thật.
type TabKey =
  | 'usage'
  | 'limits'
  | 'plan-features'
  | 'plan-marketing'
  | 'achievement-rewards'
  | 'grant-plan'
  | 'analytics'

const TABS: { key: TabKey; label: string; icon: typeof Sliders }[] = [
  // "Sử dụng & chi phí" để đầu tiên và là tab mặc định — đây là màn cần nhìn mỗi ngày để
  // quyết định chỉnh hạn mức/giá, các tab còn lại chỉ mở khi cần thao tác cụ thể.
  { key: 'usage', label: 'Sử dụng & chi phí', icon: Activity },
  // Gộp "Khuyến mãi giá" (AdminPricePromoPanel) vào đây — cùng nhóm "hạn mức dùng thử/giá",
  // liên quan chặt tới nhau nên gộp 1 mục cho gọn thay vì 2 accordion tách rời.
  { key: 'limits', label: 'Hạn mức & khuyến mãi', icon: Sliders },
  { key: 'plan-features', label: 'Tính năng theo gói', icon: ToggleRight },
  { key: 'plan-marketing', label: 'Nội dung gói', icon: FileText },
  // Gom TOÀN BỘ cấu hình thưởng huy hiệu (bật/tắt + gói + số ngày, 19 huy hiệu) vào 1 mục
  // duy nhất — admin không phải tìm rải rác nhiều nơi (yêu cầu 2026-08-03).
  { key: 'achievement-rewards', label: 'Thưởng huy hiệu', icon: Award },
  // Gộp "Người dùng" (AdminUsersPanel) + "Danh sách VIP" (AdminVipWhitelistPanel) vào đây —
  // cùng nhóm xem/quản lý user cụ thể (tra cứu, cấp gói tay, whitelist VIP).
  { key: 'grant-plan', label: 'Người dùng & cấp gói', icon: ShieldCheck },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function AdminPanel({ tabKey }: { tabKey: TabKey }) {
  switch (tabKey) {
    case 'usage':
      return <AdminUsagePanel />
    case 'limits':
      return (
        <>
          <AdminLimitsPanel />
          <AdminPricePromoPanel />
        </>
      )
    case 'plan-features':
      return <AdminPlanFeaturesPanel />
    case 'plan-marketing':
      return <AdminPlanMarketingPanel />
    case 'achievement-rewards':
      return <AdminAchievementRewardsPanel />
    case 'grant-plan':
      return (
        <>
          <AdminUsersPanel />
          <AdminGrantPlanPanel />
          <AdminVipWhitelistPanel />
        </>
      )
    case 'analytics':
      return <AdminAnalyticsPanel />
  }
}

export default function AdminDashboard() {
  // Mục đang mở đọc/ghi qua query string (?tab=...) để link kiểu /admin-s?tab=limits (vd
  // redirect từ /admin-settings cũ) mở đúng mục, và người dùng có thể chia sẻ/bookmark 1 mục
  // cụ thể. null = tất cả đang đóng (bấm lại mục đang mở để đóng nó).
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const openKey: TabKey | null = TABS.some((t) => t.key === tabParam)
    ? (tabParam as TabKey)
    : 'usage'

  const toggle = (key: TabKey) => {
    if (openKey === key) {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ tab: key }, { replace: true })
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        <PageHeader
          title="Quản trị hệ thống"
          subtitle="Cấu hình hạn mức, cấp gói, và các mục vận hành khác"
        />

        <div className="space-y-3">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isOpen = openKey === key
            return (
              <div
                key={key}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-expanded={isOpen}
                  className="tap-44 w-full flex items-center gap-3 px-4 py-3.5 text-left transition hover:bg-zinc-800/40"
                >
                  <Icon className="w-4 h-4 shrink-0 text-accent-400" />
                  <span className="flex-1 text-sm font-semibold text-white">{label}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-800/80 space-y-4">
                    <AdminPanel tabKey={key} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
