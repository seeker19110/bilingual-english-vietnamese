import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LangProvider } from './context/LangProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import { useAuth } from './context/useAuth'
import { CardListSkeleton } from './components/Skeleton'
import { ErrorBoundary } from './components/ErrorBoundary'
import BottomNav from './components/BottomNav'
import PromoEndingBanner from './components/PromoEndingBanner'
import PlanExpiryBanner from './components/PlanExpiryBanner'
import { lazyWithRetry } from './lib/lazyWithRetry'
import { refreshAppSettings } from './lib/appSettings'
import { refreshPlanFeatures } from './lib/planFeatures'
import { refreshPlanMarketing } from './lib/planMarketing'
import FeatureGate from './components/FeatureGate'
// Dùng lazyWithRetry thay cho React.lazy: tự tải lại 1 lần khi chunk lỗi
// (thường do app vừa deploy bản mới, chunk cũ không còn) thay vì sập trang.
const Login = lazyWithRetry(() => import('./pages/Login'))
// Trang landing công khai (không cần đăng nhập) — điểm đến cho link quảng cáo TikTok/Facebook/SEO.
const Landing = lazyWithRetry(() => import('./pages/Landing'))
const LandingEn = lazyWithRetry(() => import('./pages/LandingEn'))
const WordDetail = lazyWithRetry(() => import('./pages/WordDetail'))
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'))
const Home = lazyWithRetry(() => import('./pages/Home'))
const Chat = lazyWithRetry(() => import('./pages/Chat'))
const Writing = lazyWithRetry(() => import('./pages/Writing'))
const Speaking = lazyWithRetry(() => import('./pages/Speaking'))
const CommonPhrases = lazyWithRetry(() => import('./pages/CommonPhrases'))
const History = lazyWithRetry(() => import('./pages/History'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const Profile = lazyWithRetry(() => import('./pages/Profile'))
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'))
const Placement = lazyWithRetry(() => import('./pages/Placement'))
const MistakeBank = lazyWithRetry(() => import('./pages/MistakeBank'))
const Quests = lazyWithRetry(() => import('./pages/Quests'))

// Thử thách "Challenge 1 phút" (chu kỳ tuần) — ghi hình/IndexedDB chỉ tải khi bấm vào.
const Challenge = lazyWithRetry(() => import('./pages/Challenge'))

// Trang Từ điển chứa file dữ liệu rất lớn (7.428 từ) — chỉ tải khi người dùng
// thực sự bấm vào, không gộp vào bundle chính để app khởi động nhanh hơn.
const Dictionary = lazyWithRetry(() => import('./pages/Dictionary'))

// Trang Bài học cũng chứa dữ liệu hội thoại lớn (sẽ lên tới 100 bài) — lazy-load tương tự.
const Lessons = lazyWithRetry(() => import('./pages/Lessons'))

// Trang Học theo lộ trình cũng dùng toàn bộ từ điển (qua lib/curriculum) — lazy-load.
const Learn = lazyWithRetry(() => import('./pages/Learn'))

// Trang riêng của từng cấp CEFR (/learning-path/a1…b2) — lazy-load tương tự.
const CefrLevelPage = lazyWithRetry(() => import('./pages/CefrLevelPage'))

// Trang quản trị tổng — chỉ admin (ADMIN_EMAILS) dùng được, lazy-load vì hiếm khi truy cập.
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'))

// PoC nội bộ — không link từ menu/BottomNav, chỉ vào qua URL trực tiếp /avatar-demo.
// Xem docs/research/dac-ta-avatar-ai-noi-chuyen-2026-07-28.md.
const AvatarDemo = lazyWithRetry(() => import('./pages/AvatarDemo'))

// Màn hình chờ — dùng khi kiểm tra session và khi lazy-load trang.
// Hiện khung skeleton nhấp nháy thay vì chữ trơ, đỡ cảm giác đơ.
function PageLoading() {
  return (
    <div className="min-h-dvh bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/60" />
      <CardListSkeleton rows={6} />
    </div>
  )
}

// Bảo vệ route: chờ Supabase xác nhận session rồi mới quyết định redirect
// Nếu chưa onboarding (lần đầu đăng nhập) → chuyển sang /onboarding trước
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />
  if (!user.onboarded) return <Navigate to="/onboarding" replace />
  return (
    <>
      {/* Chỉ hiện cho user đã đăng nhập + đã onboard — banner báo trước sắp hết
          khuyến mãi, không cần thiết ở landing/login/onboarding. */}
      <PromoEndingBanner />
      {/* Banner "còn X ngày dùng gói Pro/VIP" (trial hoặc gói trả phí sắp hết hạn) */}
      <PlanExpiryBanner />
      {children}
    </>
  )
}

// Bảo vệ route quản trị (/admin-s): ngoài đăng nhập + onboard (RequireAuth), còn cần cờ
// user.isAdmin (server tính từ ADMIN_EMAILS, trả về ở /api/auth?action=me — xem
// src/types.ts). Đây CHỈ là lớp che UI cho người dùng thường đỡ thấy khung/tên các mục quản
// trị nội bộ — không phải lớp bảo mật thật: mọi API admin vẫn TỰ kiểm lại quyền phía server
// (api/_lib/adminAuth.ts), nên dù cờ này bị qua mặt trên client thì dữ liệu vẫn an toàn.
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading />
  if (!user?.isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

// Cập nhật thẻ <link rel="canonical"> theo route hiện tại để tránh lỗi SEO
// "canonical points to homepage instead of current page".
// Tên miền lấy từ biến môi trường VITE_SITE_URL (đặt khi build) để dễ dùng cho
// staging / domain khác; nếu không đặt thì mặc định domain production hiện tại.
const BASE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://en-vi.donghanhcungban.com'
function CanonicalUpdater() {
  const { pathname } = useLocation()
  useEffect(() => {
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = BASE_URL + pathname
  }, [pathname])
  return null
}

// Prefetch các trang hay dùng nhất khi browser rảnh sau lần tải đầu
function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () => {
      void import('./pages/Home')
      void import('./pages/Chat')
      void import('./pages/Learn')
      void import('./pages/Dictionary')
      void import('./pages/Lessons')
      void import('./pages/CommonPhrases')
      void import('./pages/Speaking')
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch)
    } else {
      setTimeout(prefetch, 3000)
    }
  }, [])
}

// Chu kỳ đồng bộ định kỳ khi app mở lâu (không đóng tab) — 1h là đủ mới cho cấu hình hiếm
// khi đổi (admin sửa hạn mức/khuyến mãi), và hầu như MIỄN PHÍ nhờ ETag/If-None-Match (xem
// refreshAppSettings() ở lib/appSettings.ts): admin chưa đổi gì → server trả 304 rỗng.
// Cân nhắc đã chọn polling thay vì server đẩy (WebSocket/SSE): cấu hình này đổi rất hiếm
// (admin sửa tay), không cần độ trễ tức thời — dựng thêm kết nối bền (WebSocket/SSE) chỉ để
// đẩy vài con số hiếm khi đổi là thừa hạ tầng so với lợi ích, trong khi polling 1h + ETag đã
// gần như miễn phí và không cần thêm gì ở server.
const APP_SETTINGS_POLL_MS = 60 * 60 * 1000

export default function App() {
  usePrefetchPages()
  // Đồng bộ hạn mức/khuyến mãi thật từ server: ngay lúc mở app, định kỳ mỗi 1h nếu app mở
  // lâu, và mỗi lần quay lại tab (visibilitychange) — trình duyệt thường tạm dừng
  // setInterval khi tab ẩn/máy ngủ, nên bắt thêm sự kiện này để không phải đợi đủ 1h mới
  // đồng bộ lại sau khi user quay lại dùng tiếp.
  useEffect(() => {
    void refreshAppSettings()
    void refreshPlanFeatures()
    void refreshPlanMarketing()
    const interval = setInterval(() => {
      void refreshAppSettings()
      void refreshPlanFeatures()
      void refreshPlanMarketing()
    }, APP_SETTINGS_POLL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshAppSettings()
        void refreshPlanFeatures()
        void refreshPlanMarketing()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return (
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          <ToastProvider>
            <BrowserRouter>
              <CanonicalUpdater />
              <ErrorBoundary>
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Công khai, KHÔNG bọc RequireAuth — vào được khi chưa đăng nhập */}
                    <Route path="/welcome" element={<Landing />} />
                    <Route path="/learn-vietnamese" element={<LandingEn />} />
                    <Route path="/tu-vung/:word" element={<WordDetail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/placement" element={<Placement />} />
                    <Route
                      path="/"
                      element={
                        <RequireAuth>
                          <Home />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/chat"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="chat">
                            <Chat />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/writing"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="writing">
                            <Writing />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/speaking"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="speaking">
                            <Speaking />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/learning-path"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="learning_path">
                            <Learn />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/learning-path/:levelId"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="learning_path">
                            <CefrLevelPage />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/dictionary"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="dictionary">
                            <Dictionary />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/lessons"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="lessons">
                            <Lessons />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/phrases"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="phrases">
                            <CommonPhrases />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <RequireAuth>
                          <History />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/progress"
                      element={
                        <RequireAuth>
                          <Dashboard />
                        </RequireAuth>
                      }
                    />
                    {/* /admin-settings đã tích hợp vào tab "Hạn mức & khuyến mãi" của
                        /admin-s — giữ redirect để không vỡ link cũ trong docs/runbook. */}
                    <Route
                      path="/admin-settings"
                      element={<Navigate to="/admin-s?tab=limits" replace />}
                    />
                    {/* Đường dẫn trang quản trị tổng đổi từ /admin sang /admin-s (2026-07-29)
                        — giữ redirect /admin cũ để không vỡ link đã chia sẻ/bookmark. */}
                    <Route path="/admin" element={<Navigate to="/admin-s" replace />} />
                    <Route
                      path="/admin-s"
                      element={
                        <RequireAuth>
                          <RequireAdmin>
                            <AdminDashboard />
                          </RequireAdmin>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/mistakes"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="mistake_bank">
                            <MistakeBank />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/challenge"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="challenge">
                            <Challenge />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <RequireAuth>
                          <Profile />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/quests"
                      element={
                        <RequireAuth>
                          <FeatureGate featureKey="quests">
                            <Quests />
                          </FeatureGate>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/avatar-demo"
                      element={
                        <RequireAuth>
                          <AvatarDemo />
                        </RequireAuth>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
              <BottomNav />
            </BrowserRouter>
          </ToastProvider>
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
