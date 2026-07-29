import { useSearchParams } from 'react-router-dom'
import { Sliders, ShieldCheck, BarChart3, Activity, Crown, ToggleRight } from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import AdminLimitsPanel from '../components/admin/AdminLimitsPanel'
import AdminGrantPlanPanel from '../components/admin/AdminGrantPlanPanel'
import AdminVipWhitelistPanel from '../components/admin/AdminVipWhitelistPanel'
import AdminPlanFeaturesPanel from '../components/admin/AdminPlanFeaturesPanel'
import AdminAnalyticsPanel from '../components/admin/AdminAnalyticsPanel'
import AdminUsagePanel from '../components/admin/AdminUsagePanel'

// Trang khung tổng quản trị (/admin) — gom các mục quản trị vào 1 nơi, điều hướng bằng tab
// (lưu ở query string ?tab=... để bookmark/redirect được, vd /admin-settings cũ → /admin?tab=limits).
// Quyền admin do SERVER tự kiểm (ADMIN_EMAILS trong .env, xem api/_lib/adminAuth.ts) — client
// không biết trước ai là admin, chỉ dựa vào response 403 của từng tab. Mỗi tab tự gọi API
// riêng và tự xử lý 403/tải/lỗi — trang này chỉ là khung điều hướng.
//
// Ghi chú: tab "Chặn tên tài khoản giả danh" CHƯA thêm vì chưa thấy code liên quan
// (vd api/_lib/reservedNames.ts) trong repo lúc viết trang này — không bịa UI cho tính năng
// chưa tồn tại. Thêm lại khi tính năng đó có thật.
type TabKey = 'usage' | 'limits' | 'plan-features' | 'grant-plan' | 'vip-whitelist' | 'analytics'

const TABS: { key: TabKey; label: string; icon: typeof Sliders }[] = [
  // "Sử dụng & chi phí" để đầu tiên và là tab mặc định — đây là màn cần nhìn mỗi ngày để
  // quyết định chỉnh hạn mức/giá, các tab còn lại chỉ mở khi cần thao tác cụ thể.
  { key: 'usage', label: 'Sử dụng & chi phí', icon: Activity },
  { key: 'limits', label: 'Hạn mức & khuyến mãi', icon: Sliders },
  { key: 'plan-features', label: 'Tính năng theo gói', icon: ToggleRight },
  { key: 'grant-plan', label: 'Cấp gói tay', icon: ShieldCheck },
  { key: 'vip-whitelist', label: 'Danh sách VIP', icon: Crown },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminDashboard() {
  // Tab đọc/ghi qua query string (?tab=...) để link kiểu /admin?tab=limits (vd redirect từ
  // /admin-settings cũ) mở đúng tab, và người dùng có thể chia sẻ/bookmark 1 tab cụ thể.
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : 'usage'
  const setTab = (key: TabKey) => setSearchParams({ tab: key }, { replace: true })

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))]">
        <PageHeader
          title="Quản trị hệ thống"
          subtitle="Cấu hình hạn mức, cấp gói, và các mục vận hành khác"
        />

        <div className="flex flex-col md:flex-row gap-4">
          {/* Tab ngang cuộn được trên mobile, menu dọc bên trái trên desktop. 6 tab hiện đã
              rộng hơn 1 màn hình mobile — dải mờ bên phải (chỉ hiện trên mobile, md:hidden) gợi
              ý còn tab cuộn tiếp, tránh người dùng tưởng chỉ có 1 tab "Sử dụng & chi phí". */}
          <div style={{ position: 'relative' }}>
            <nav
              className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 md:w-56 shrink-0"
              aria-label="Mục quản trị"
            >
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={tab === key ? 'page' : undefined}
                  className={`tap-44 shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                    tab === key
                      ? 'bg-accent-500 text-white'
                      : 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
            <div
              aria-hidden="true"
              className="pointer-events-none md:hidden"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: '0.25rem',
                width: '2.5rem',
                background: 'linear-gradient(to left, rgb(var(--z-950)), transparent)',
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            {tab === 'usage' && <AdminUsagePanel />}
            {tab === 'limits' && <AdminLimitsPanel />}
            {tab === 'plan-features' && <AdminPlanFeaturesPanel />}
            {tab === 'grant-plan' && <AdminGrantPlanPanel />}
            {tab === 'vip-whitelist' && <AdminVipWhitelistPanel />}
            {tab === 'analytics' && <AdminAnalyticsPanel />}
          </div>
        </div>
      </main>
    </div>
  )
}
