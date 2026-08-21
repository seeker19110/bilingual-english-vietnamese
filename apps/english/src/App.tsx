import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LangProvider } from './context/LangProvider'
import { AppThemeProvider as ThemeProvider } from './context/AppThemeProvider'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from '@core/ToastProvider'
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
import OfflineSyncIndicator from './components/OfflineSyncIndicator'
import { useOneHandedDrag } from './lib/useOneHandedDrag'
// Dùng lazyWithRetry thay cho React.lazy: tự tải lại 1 lần khi chunk lỗi
// (thường do app vừa deploy bản mới, chunk cũ không còn) thay vì sập trang.
const Login = lazyWithRetry(() => import('./pages/Login'))
// Trang landing công khai (không cần đăng nhập) — điểm đến cho link quảng cáo TikTok/Facebook/SEO.
const Landing = lazyWithRetry(() => import('./pages/Landing'))
const LandingEn = lazyWithRetry(() => import('./pages/LandingEn'))
const WordDetail = lazyWithRetry(() => import('./pages/WordDetail'))
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'))
const Home = lazyWithRetry(() => import('./pages/Home'))
const EnglishHome = lazyWithRetry(() => import('./pages/EnglishHome'))
const Chat = lazyWithRetry(() => import('./pages/Chat'))
const Writing = lazyWithRetry(() => import('./pages/Writing'))
const Speaking = lazyWithRetry(() => import('./pages/Speaking'))
// Trang "Luyện tập" gộp — hub điều hướng 4 kỹ năng, dùng lại curriculum + listening.
const Practice = lazyWithRetry(() => import('./pages/Practice'))
const CommonPhrases = lazyWithRetry(() => import('./pages/CommonPhrases'))

// Trang "Thư viện Nghe" (/listening) — 2 tab, tái dùng patterns/dialogues.
const Listening = lazyWithRetry(() => import('./pages/Listening'))
// Trang "Nghe - Đọc - Kể Truyện" (/stories) — tách riêng khỏi /listening (2026-08-02).
const Stories = lazyWithRetry(() => import('./pages/Stories'))
const StoryReader = lazyWithRetry(() => import('./pages/StoryReader'))
const History = lazyWithRetry(() => import('./pages/History'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const Profile = lazyWithRetry(() => import('./pages/Profile'))
const EnglishSettings = lazyWithRetry(() => import('./pages/EnglishSettings'))
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'))
const Placement = lazyWithRetry(() => import('./pages/Placement'))
const MistakeBank = lazyWithRetry(() => import('./pages/MistakeBank'))
const Quests = lazyWithRetry(() => import('./pages/Quests'))
// Trang giới thiệu app (tính năng + mẹo học hiệu quả) — vào từ logo "Gia sư AI" ở header.
const About = lazyWithRetry(() => import('./pages/About'))

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

// Trang Mạng lưới cá nhân (Life Graph)
const LifeGraph = lazyWithRetry(() => import('./pages/LifeGraph'))

// Trang Bạn Đồng Hành AI Đa Lĩnh Vực (Companion Runtime)
const Companion = lazyWithRetry(() => import('./pages/Companion'))

// Các Hub Chuyên Biệt Platform V2
const Career = lazyWithRetry(() => import('./pages/Career'))
const Work = lazyWithRetry(() => import('./pages/Work'))
const Startup = lazyWithRetry(() => import('./pages/Startup'))
const Life = lazyWithRetry(() => import('./pages/Life'))

// Các Trang Con Chuyên Sâu Platform V2 (Sub-pages & Multi-Subject)
const Subjects = lazyWithRetry(() => import('./pages/Subjects'))
const SubjectDetail = lazyWithRetry(() => import('./pages/SubjectDetail'))
const AppliedKnowledge = lazyWithRetry(() => import('./pages/AppliedKnowledge'))
const CareerInterview = lazyWithRetry(() => import('./pages/CareerInterview'))
const WorkKanban = lazyWithRetry(() => import('./pages/WorkKanban'))
const StartupCanvas = lazyWithRetry(() => import('./pages/StartupCanvas'))
const ActionCanvas = lazyWithRetry(() => import('./pages/ActionCanvas'))
const LifeWheel = lazyWithRetry(() => import('./pages/LifeWheel'))
const Friends = lazyWithRetry(() => import('./pages/Friends'))
const AddFriend = lazyWithRetry(() => import('./pages/AddFriend'))
const ChatPage = lazyWithRetry(() => import('./pages/ChatPage'))

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
  'https://www.donghanhcungban.org'
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
  // Kéo toàn bộ nội dung trang xuống 1 tay (Reachability) — xem lib/useOneHandedDrag.ts
  const oneHandedDrag = useOneHandedDrag()
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
                {/* Bọc toàn bộ nội dung định tuyến để hỗ trợ kéo 1 tay (không bọc
                    BottomNav — giữ cố định để luôn bấm được dù đang kéo xuống) */}
                <div style={oneHandedDrag.contentStyle}>
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
                        path="/profile"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/trang-ca-nhan"
                        element={
                          <RequireAuth>
                            <Profile />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/life-graph"
                        element={
                          <RequireAuth>
                            <LifeGraph />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/dong-hanh"
                        element={
                          <RequireAuth>
                            <Companion />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/companion"
                        element={
                          <RequireAuth>
                            <Companion />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/ban-be"
                        element={
                          <RequireAuth>
                            <Friends />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/ket-ban/:code"
                        element={
                          <RequireAuth>
                            <AddFriend />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/tin-nhan"
                        element={
                          <RequireAuth>
                            <ChatPage />
                          </RequireAuth>
                        }
                      />
                      {/* V2 Specialized Domain Hubs & Hoc-* Routes */}
                      <Route
                        path="/su-nghiep-cua-toi"
                        element={
                          <RequireAuth>
                            <Career />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-su-nghiep"
                        element={
                          <RequireAuth>
                            <Career />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/career"
                        element={
                          <RequireAuth>
                            <Career />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/su-nghiep"
                        element={
                          <RequireAuth>
                            <Career />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cong-viec-cua-toi"
                        element={
                          <RequireAuth>
                            <Work />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-cong-viec"
                        element={
                          <RequireAuth>
                            <Work />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/work"
                        element={
                          <RequireAuth>
                            <Work />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cong-viec"
                        element={
                          <RequireAuth>
                            <Work />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/toi-khoi-nghiep"
                        element={
                          <RequireAuth>
                            <Startup />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-khoi-nghiep"
                        element={
                          <RequireAuth>
                            <Startup />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/startup"
                        element={
                          <RequireAuth>
                            <Startup />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/khoi-nghiep"
                        element={
                          <RequireAuth>
                            <Startup />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cuoc-song-cua-toi"
                        element={
                          <RequireAuth>
                            <Life />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-cuoc-song"
                        element={
                          <RequireAuth>
                            <Life />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/life"
                        element={
                          <RequireAuth>
                            <Life />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cuoc-song"
                        element={
                          <RequireAuth>
                            <Life />
                          </RequireAuth>
                        }
                      />
                      {/* V2 Multi-Subject Learning Hub & Sub-pages */}
                      <Route
                        path="/hoc-mon-hoc"
                        element={
                          <RequireAuth>
                            <Subjects />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/subjects"
                        element={
                          <RequireAuth>
                            <Subjects />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/mon-hoc"
                        element={
                          <RequireAuth>
                            <Subjects />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-mon-hoc/:subjectId"
                        element={
                          <RequireAuth>
                            <SubjectDetail />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/subjects/:subjectId"
                        element={
                          <RequireAuth>
                            <SubjectDetail />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/career/interview"
                        element={
                          <RequireAuth>
                            <CareerInterview />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/work/kanban"
                        element={
                          <RequireAuth>
                            <WorkKanban />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/startup/canvas"
                        element={
                          <RequireAuth>
                            <StartupCanvas />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/workspace"
                        element={
                          <RequireAuth>
                            <ActionCanvas />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/action-canvas"
                        element={
                          <RequireAuth>
                            <ActionCanvas />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/life/wheel"
                        element={
                          <RequireAuth>
                            <LifeWheel />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/life/wheel-of-life"
                        element={
                          <RequireAuth>
                            <LifeWheel />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/ung-dung-thuc-te"
                        element={
                          <RequireAuth>
                            <AppliedKnowledge />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/applied-knowledge"
                        element={
                          <RequireAuth>
                            <AppliedKnowledge />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/mo-phong"
                        element={
                          <RequireAuth>
                            <AppliedKnowledge />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/simulators"
                        element={
                          <RequireAuth>
                            <AppliedKnowledge />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/"
                        element={
                          <RequireAuth>
                            <Home />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/hoc-tieng-anh"
                        element={
                          <RequireAuth>
                            <EnglishHome />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/tieng-anh"
                        element={
                          <RequireAuth>
                            <EnglishHome />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/english"
                        element={
                          <RequireAuth>
                            <EnglishHome />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/tro-truyen"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="chat">
                              <Chat />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/luyen-viet"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="writing">
                              <Writing />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/luyen-noi"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="speaking">
                              <Speaking />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/luyen-tap"
                        element={
                          <RequireAuth>
                            <Practice />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lo-trinh-hoc"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="learning_path">
                              <Learn />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lo-trinh-hoc/:levelId"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="learning_path">
                              <CefrLevelPage />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/tu-dien"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="dictionary">
                              <Dictionary />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/bai-hoc"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="lessons">
                              <Lessons />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cau-thong-dung"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="phrases">
                              <CommonPhrases />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/luyen-nghe"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="listening">
                              <Listening />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/truyen-song-ngu"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="listening">
                              <Stories />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/truyen-song-ngu/:id"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="listening">
                              <StoryReader />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lich-su-hoc"
                        element={
                          <RequireAuth>
                            <History />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/tien-do"
                        element={
                          <RequireAuth>
                            <Dashboard />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/so-tay-loi-sai"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="mistake_bank">
                              <MistakeBank />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/thu-thach"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="challenge">
                              <Challenge />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cai-dat"
                        element={
                          <RequireAuth>
                            <EnglishSettings />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cai-dat-tieng-anh"
                        element={
                          <RequireAuth>
                            <EnglishSettings />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <RequireAuth>
                            <EnglishSettings />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/nhiem-vu"
                        element={
                          <RequireAuth>
                            <FeatureGate featureKey="quests">
                              <Quests />
                            </FeatureGate>
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/gioi-thieu"
                        element={
                          <RequireAuth>
                            <About />
                          </RequireAuth>
                        }
                      />

                      {/* Chuyển hướng tương thích ngược cho đường dẫn tiếng Anh & alias cũ */}
                      <Route path="/chat" element={<Navigate to="/tro-truyen" replace />} />
                      <Route path="/ai-chat" element={<Navigate to="/tro-truyen" replace />} />
                      <Route path="/messages" element={<Navigate to="/tin-nhan" replace />} />
                      <Route path="/ho-so" element={<Navigate to="/profile" replace />} />
                      <Route path="/writing" element={<Navigate to="/luyen-viet" replace />} />
                      <Route path="/speaking" element={<Navigate to="/luyen-noi" replace />} />
                      <Route path="/practice" element={<Navigate to="/luyen-tap" replace />} />
                      <Route
                        path="/learning-path"
                        element={<Navigate to="/lo-trinh-hoc" replace />}
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
                      <Route path="/dictionary" element={<Navigate to="/tu-dien" replace />} />
                      <Route path="/lessons" element={<Navigate to="/bai-hoc" replace />} />
                      <Route path="/phrases" element={<Navigate to="/cau-thong-dung" replace />} />
                      <Route path="/listening" element={<Navigate to="/luyen-nghe" replace />} />
                      <Route path="/stories" element={<Navigate to="/truyen-song-ngu" replace />} />
                      <Route
                        path="/stories/:id"
                        element={<Navigate to="/truyen-song-ngu" replace />}
                      />
                      <Route path="/history" element={<Navigate to="/lich-su-hoc" replace />} />
                      <Route path="/progress" element={<Navigate to="/tien-do" replace />} />
                      <Route path="/mistakes" element={<Navigate to="/so-tay-loi-sai" replace />} />
                      <Route path="/challenge" element={<Navigate to="/thu-thach" replace />} />
                      <Route path="/quests" element={<Navigate to="/nhiem-vu" replace />} />

                      {/* Redirects quản trị cũ */}
                      <Route
                        path="/admin-settings"
                        element={<Navigate to="/admin-s?tab=limits" replace />}
                      />
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
                </div>
              </ErrorBoundary>
              {/* Dải trigger Reachability giờ lồng NGAY TRONG BottomNav (xem
                  components/BottomNav.tsx) thay vì <div> rời định vị bằng biến CSS
                  --bnav-only-h — chỉ cần truyền triggerHandlers + isOpen xuống, chiều
                  cao 3.5rem vẫn được cộng vào --bnav-h ở index.css để mọi trang tự
                  chừa đủ padding-bottom, không bị trigger che/chặn tap nội dung
                  cuối trang. */}
              <OfflineSyncIndicator />
              <BottomNav
                triggerHandlers={oneHandedDrag.triggerHandlers}
                isReachabilityOpen={oneHandedDrag.isOpen}
              />
            </BrowserRouter>
          </ToastProvider>
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
