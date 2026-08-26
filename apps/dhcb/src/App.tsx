import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
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
// ── 1. Core Platform & Shared Pages (Nền tảng dùng chung)
const Login = lazyWithRetry(() => import('./pages/core/Login'))
const Landing = lazyWithRetry(() => import('./pages/core/Landing'))
const LandingEn = lazyWithRetry(() => import('./pages/core/LandingEn'))
const ResetPassword = lazyWithRetry(() => import('./pages/core/ResetPassword'))
const Home = lazyWithRetry(() => import('./pages/core/Home'))
const History = lazyWithRetry(() => import('./pages/core/History'))
const Dashboard = lazyWithRetry(() => import('./pages/core/Dashboard'))
const Profile = lazyWithRetry(() => import('./pages/core/Profile'))
const Onboarding = lazyWithRetry(() => import('./pages/core/Onboarding'))
const Intake = lazyWithRetry(() => import('./pages/core/Intake'))
const MistakeBank = lazyWithRetry(() => import('./pages/core/MistakeBank'))
const Quests = lazyWithRetry(() => import('./pages/core/Quests'))
const About = lazyWithRetry(() => import('./pages/core/About'))
const AdminDashboard = lazyWithRetry(() => import('./pages/core/AdminDashboard'))
const Friends = lazyWithRetry(() => import('./pages/core/Friends'))
const LiveLocation = lazyWithRetry(() => import('./pages/core/LiveLocation'))
const AddFriend = lazyWithRetry(() => import('./pages/core/AddFriend'))

// ── 2. AI Companion & Decision Studio (Bạn Đồng Hành AI)
const Companion = lazyWithRetry(() => import('./pages/companion/Companion'))
const ActionCanvas = lazyWithRetry(() => import('./pages/companion/ActionCanvas'))
const AvatarDemo = lazyWithRetry(() => import('./pages/companion/AvatarDemo'))

// ── 3. Multi-Subject Learning & STEM Studio (Phòng Học & Luyện Tập Đa Môn)
const Subjects = lazyWithRetry(() => import('./pages/learning/Subjects'))
const SubjectDetail = lazyWithRetry(() => import('./pages/learning/SubjectDetail'))
const Practice = lazyWithRetry(() => import('./pages/learning/Practice'))
const AppliedKnowledge = lazyWithRetry(() => import('./pages/learning/AppliedKnowledge'))

// ── 4. Life Synthesis Domains (Sự nghiệp, Công việc, Khởi nghiệp, Cuộc sống)
const Career = lazyWithRetry(() => import('./pages/domains/career/Career'))
const CareerInterview = lazyWithRetry(() => import('./pages/domains/career/CareerInterview'))
const WorkLife = lazyWithRetry(() => import('./pages/domains/worklife/WorkLife'))
const WorkKanban = lazyWithRetry(() => import('./pages/domains/work/WorkKanban'))
const Startup = lazyWithRetry(() => import('./pages/domains/startup/Startup'))
const StartupCanvas = lazyWithRetry(() => import('./pages/domains/startup/StartupCanvas'))
const LifeGraph = lazyWithRetry(() => import('./pages/domains/life/LifeGraph'))
const LifeWheel = lazyWithRetry(() => import('./pages/domains/life/LifeWheel'))

// ── 5. English Subject Module (Module Môn Học Tiếng Anh Chuyên Biệt)
const EnglishHome = lazyWithRetry(() => import('./pages/subjects/english/EnglishHome'))
const Chat = lazyWithRetry(() => import('./pages/subjects/english/Chat'))
const Writing = lazyWithRetry(() => import('./pages/subjects/english/Writing'))
const Speaking = lazyWithRetry(() => import('./pages/subjects/english/Speaking'))
const CommonPhrases = lazyWithRetry(() => import('./pages/subjects/english/CommonPhrases'))
const Listening = lazyWithRetry(() => import('./pages/subjects/english/Listening'))
const Stories = lazyWithRetry(() => import('./pages/subjects/english/Stories'))
const StoryReader = lazyWithRetry(() => import('./pages/subjects/english/StoryReader'))
const EnglishSettings = lazyWithRetry(() => import('./pages/subjects/english/EnglishSettings'))
const Placement = lazyWithRetry(() => import('./pages/subjects/english/Placement'))
const Challenge = lazyWithRetry(() => import('./pages/subjects/english/Challenge'))
const Dictionary = lazyWithRetry(() => import('./pages/subjects/english/Dictionary'))
const WordDetail = lazyWithRetry(() => import('./pages/subjects/english/WordDetail'))
const Lessons = lazyWithRetry(() => import('./pages/subjects/english/Lessons'))
const Learn = lazyWithRetry(() => import('./pages/subjects/english/Learn'))
const CefrLevelPage = lazyWithRetry(() => import('./pages/subjects/english/CefrLevelPage'))
const ProgrammingHome = lazyWithRetry(() => import('./pages/subjects/programming/ProgrammingHome'))
const ProgrammingLevelPage = lazyWithRetry(
  () => import('./pages/subjects/programming/ProgrammingLevelPage'),
)
const ProgrammingPlayground = lazyWithRetry(
  () => import('./pages/subjects/programming/ProgrammingPlayground'),
)
const ProgrammingLessonPage = lazyWithRetry(
  () => import('./pages/subjects/programming/ProgrammingLessonPage'),
)
const ProgrammingReview = lazyWithRetry(
  () => import('./pages/subjects/programming/ProgrammingReview'),
)
const ProgrammingProjectPage = lazyWithRetry(
  () => import('./pages/subjects/programming/ProgrammingProjectPage'),
)
const ChatPage = lazyWithRetry(() => import('./pages/subjects/english/ChatPage'))

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
  // Người MỚI đi qua lớp nền tảng trước (5 câu ~90 giây), rồi mới tới onboarding của môn.
  // Người đã onboarded từ trước KHÔNG bị chạm tới — họ không bao giờ vào nhánh này.
  // Trang /bat-dau tự kiểm: ai đã trả lời rồi thì nó chuyển thẳng sang /onboarding.
  if (!user.onboarded) return <Navigate to="/bat-dau" replace />
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
      void import('./pages/core/Home')
      void import('./pages/subjects/english/Chat')
      void import('./pages/subjects/english/Learn')
      void import('./pages/subjects/english/Dictionary')
      void import('./pages/subjects/english/Lessons')
      void import('./pages/subjects/english/CommonPhrases')
      void import('./pages/subjects/english/Speaking')
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

// Chuyển hướng URL cũ của trang chi tiết môn học về URL chính thức, GIỮ NGUYÊN mã môn.
function SubjectRedirect() {
  const { subjectId } = useParams()
  return <Navigate to={`/mon-hoc/${subjectId ?? ''}`} replace />
}

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
                      <Route path="/bat-dau" element={<Intake />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/placement" element={<Placement />} />
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
                        path="/ban-dong-hanh"
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
                        path="/nhom-di-chung"
                        element={
                          <RequireAuth>
                            <LiveLocation />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/nhom-di-chung/:code"
                        element={
                          <RequireAuth>
                            <LiveLocation />
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
                        path="/su-nghiep"
                        element={
                          <RequireAuth>
                            <Career />
                          </RequireAuth>
                        }
                      />
                      {/* Trụ GỘP "Công việc & Đời sống" (2026-08-25). Hai route cũ
                          /cong-viec và /cuoc-song vẫn vào được — chuyển hướng sang đúng
                          tab của trang gộp, nên link cũ và bookmark không gãy. */}
                      <Route
                        path="/cong-viec-cuoc-song"
                        element={
                          <RequireAuth>
                            <WorkLife />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/cong-viec"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=cong-viec" replace />}
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
                        path="/cuoc-song"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=doi-song" replace />}
                      />
                      {/* V2 Multi-Subject Learning Hub & Sub-pages */}
                      <Route
                        path="/mon-hoc"
                        element={
                          <RequireAuth>
                            <Subjects />
                          </RequireAuth>
                        }
                      />
                      {/* Môn Lập trình có không gian riêng (như English) — đặt TRƯỚC
                          route param :subjectId để 'programming' không rơi vào SubjectDetail */}
                      <Route
                        path="/mon-hoc/programming"
                        element={<Navigate to="/lap-trinh" replace />}
                      />
                      <Route
                        path="/lap-trinh"
                        element={
                          <RequireAuth>
                            <ProgrammingHome />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lap-trinh/du-an"
                        element={
                          <RequireAuth>
                            <ProgrammingProjectPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lap-trinh/bai-hoc/:lessonId"
                        element={
                          <RequireAuth>
                            <ProgrammingLessonPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lap-trinh/on-tap"
                        element={
                          <RequireAuth>
                            <ProgrammingReview />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lap-trinh/chay-thu"
                        element={
                          <RequireAuth>
                            <ProgrammingPlayground />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/lap-trinh/:levelId"
                        element={
                          <RequireAuth>
                            <ProgrammingLevelPage />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/mon-hoc/:subjectId"
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
                        path="/ung-dung-thuc-te"
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
                      {/* ── Gom URL trùng (Đợt 3, docs/research/nang-tam-du-an-2026-08-24.md §4) ──
                          Trước đây mỗi trang có tới 4 URL cùng render một component, không
                          redirect — đúng loại lỗi trùng nội dung vừa sửa ở tầng tên miền (PR #645),
                          nhưng ở tầng route. Nay mỗi trang có MỘT URL chính thức (tiếng Việt);
                          các URL cũ vẫn sống, chỉ chuyển hướng — không ai mất bookmark. */}
                      <Route path="/career" element={<Navigate to="/su-nghiep" replace />} />
                      <Route
                        path="/su-nghiep-cua-toi"
                        element={<Navigate to="/su-nghiep" replace />}
                      />
                      <Route path="/hoc-su-nghiep" element={<Navigate to="/su-nghiep" replace />} />
                      <Route
                        path="/work"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=cong-viec" replace />}
                      />
                      <Route
                        path="/cong-viec-cua-toi"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=cong-viec" replace />}
                      />
                      <Route
                        path="/hoc-cong-viec"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=cong-viec" replace />}
                      />
                      <Route path="/startup" element={<Navigate to="/khoi-nghiep" replace />} />
                      <Route
                        path="/toi-khoi-nghiep"
                        element={<Navigate to="/khoi-nghiep" replace />}
                      />
                      <Route
                        path="/hoc-khoi-nghiep"
                        element={<Navigate to="/khoi-nghiep" replace />}
                      />
                      <Route
                        path="/life"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=doi-song" replace />}
                      />
                      <Route
                        path="/cuoc-song-cua-toi"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=doi-song" replace />}
                      />
                      <Route
                        path="/hoc-cuoc-song"
                        element={<Navigate to="/cong-viec-cuoc-song?muc=doi-song" replace />}
                      />
                      <Route path="/companion" element={<Navigate to="/ban-dong-hanh" replace />} />
                      <Route path="/dong-hanh" element={<Navigate to="/ban-dong-hanh" replace />} />
                      <Route
                        path="/agent-ban-dong-hanh"
                        element={<Navigate to="/ban-dong-hanh" replace />}
                      />
                      <Route path="/subjects" element={<Navigate to="/mon-hoc" replace />} />
                      <Route path="/phong-hoc" element={<Navigate to="/mon-hoc" replace />} />
                      <Route path="/hoc-mon-hoc" element={<Navigate to="/mon-hoc" replace />} />
                      <Route
                        path="/applied-knowledge"
                        element={<Navigate to="/ung-dung-thuc-te" replace />}
                      />
                      <Route
                        path="/mo-phong"
                        element={<Navigate to="/ung-dung-thuc-te" replace />}
                      />
                      <Route
                        path="/simulators"
                        element={<Navigate to="/ung-dung-thuc-te" replace />}
                      />
                      <Route path="/tieng-anh" element={<Navigate to="/hoc-tieng-anh" replace />} />
                      <Route path="/english" element={<Navigate to="/hoc-tieng-anh" replace />} />
                      <Route path="/profile" element={<Navigate to="/trang-ca-nhan" replace />} />
                      <Route
                        path="/phong-luyen-tap"
                        element={<Navigate to="/luyen-tap" replace />}
                      />
                      <Route path="/workspace" element={<Navigate to="/action-canvas" replace />} />
                      <Route
                        path="/life/wheel-of-life"
                        element={<Navigate to="/life/wheel" replace />}
                      />
                      {/* Route có tham số: <Navigate to> không tự thay ":subjectId", phải đọc
                          params thật rồi dựng đường dẫn đích. */}
                      <Route path="/subjects/:subjectId" element={<SubjectRedirect />} />
                      <Route path="/phong-hoc/:subjectId" element={<SubjectRedirect />} />
                      <Route path="/hoc-mon-hoc/:subjectId" element={<SubjectRedirect />} />
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
