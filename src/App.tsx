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
import { lazyWithRetry } from './lib/lazyWithRetry'
// Dùng lazyWithRetry thay cho React.lazy: tự tải lại 1 lần khi chunk lỗi
// (thường do app vừa deploy bản mới, chunk cũ không còn) thay vì sập trang.
const Login = lazyWithRetry(() => import('./pages/Login'))
const Home = lazyWithRetry(() => import('./pages/Home'))
const Chat = lazyWithRetry(() => import('./pages/Chat'))
const Writing = lazyWithRetry(() => import('./pages/Writing'))
const Speaking = lazyWithRetry(() => import('./pages/Speaking'))
const CommonPhrases = lazyWithRetry(() => import('./pages/CommonPhrases'))
const History = lazyWithRetry(() => import('./pages/History'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const Profile = lazyWithRetry(() => import('./pages/Profile'))
const Onboarding = lazyWithRetry(() => import('./pages/Onboarding'))
const MistakeBank = lazyWithRetry(() => import('./pages/MistakeBank'))

// Thử thách "Vlog 1 phút — 30 ngày" — ghi hình/IndexedDB chỉ tải khi bấm vào.
const Vlog = lazyWithRetry(() => import('./pages/Vlog'))

// Trang Từ điển chứa file dữ liệu rất lớn (7.428 từ) — chỉ tải khi người dùng
// thực sự bấm vào, không gộp vào bundle chính để app khởi động nhanh hơn.
const Dictionary = lazyWithRetry(() => import('./pages/Dictionary'))

// Trang Bài học cũng chứa dữ liệu hội thoại lớn (sẽ lên tới 100 bài) — lazy-load tương tự.
const Lessons = lazyWithRetry(() => import('./pages/Lessons'))

// Trang Học theo lộ trình cũng dùng toàn bộ từ điển (qua lib/curriculum) — lazy-load.
const Learn = lazyWithRetry(() => import('./pages/Learn'))

// Trang riêng của từng cấp CEFR (/learning-path/a1…b2) — lazy-load tương tự.
const CefrLevelPage = lazyWithRetry(() => import('./pages/CefrLevelPage'))

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

export default function App() {
  usePrefetchPages()
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
                    <Route path="/onboarding" element={<Onboarding />} />
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
                          <Chat />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/writing"
                      element={
                        <RequireAuth>
                          <Writing />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/speaking"
                      element={
                        <RequireAuth>
                          <Speaking />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/learning-path"
                      element={
                        <RequireAuth>
                          <Learn />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/learning-path/:levelId"
                      element={
                        <RequireAuth>
                          <CefrLevelPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/dictionary"
                      element={
                        <RequireAuth>
                          <Dictionary />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/lessons"
                      element={
                        <RequireAuth>
                          <Lessons />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/phrases"
                      element={
                        <RequireAuth>
                          <CommonPhrases />
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
                    <Route
                      path="/mistakes"
                      element={
                        <RequireAuth>
                          <MistakeBank />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/challenge"
                      element={
                        <RequireAuth>
                          <Vlog />
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
