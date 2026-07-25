import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import AdminLimitsPanel from '../components/admin/AdminLimitsPanel'

// Trang cấu hình hạn mức lượt dùng AI theo gói (free/pro/vip) + mốc khuyến mãi — CHỈ admin
// (ADMIN_EMAILS trong .env, xem api/_lib/adminAuth.ts) mới lưu được; server luôn tự kiểm tra
// lại quyền (không tin client), trang này chỉ là giao diện gọi /api/admin-settings.
//
// [Giữ route cũ /admin-settings hoạt động] Nội dung/logic thật đã chuyển vào
// AdminLimitsPanel (dùng chung với tab "Hạn mức & khuyến mãi" của trang tổng /admin) —
// xem src/components/admin/AdminLimitsPanel.tsx và src/pages/AdminDashboard.tsx.
export default function AdminSettings() {
  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-4">
        <PageHeader title="Cấu hình hệ thống (Admin)" />
        <AdminLimitsPanel />
      </main>
    </div>
  )
}
