import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from './context/LangProvider'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import { useAuth } from './context/useAuth'
import { CardListSkeleton } from './components/Skeleton'
import Login from './pages/Login'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Writing from './pages/Writing'
import Speaking from './pages/Speaking'
import CommonPhrases from './pages/CommonPhrases'
import History from './pages/History'
import Onboarding from './pages/Onboarding'

// Trang Từ điển chứa file dữ liệu rất lớn (7.428 từ) — chỉ tải khi người dùng
// thực sự bấm vào, không gộp vào bundle chính để app khởi động nhanh hơn.
const Dictionary = lazy(() => import('./pages/Dictionary'))

// Trang Bài học cũng chứa dữ liệu hội thoại lớn (sẽ lên tới 100 bài) — lazy-load tương tự.
const Lessons = lazy(() => import('./pages/Lessons'))

// Trang Học theo lộ trình cũng dùng toàn bộ từ điển (qua lib/curriculum) — lazy-load.
const Learn = lazy(() => import('./pages/Learn'))

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

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/writing" element={<RequireAuth><Writing /></RequireAuth>} />
              <Route path="/speaking" element={<RequireAuth><Speaking /></RequireAuth>} />
              <Route path="/learn" element={<RequireAuth><Learn /></RequireAuth>} />
              <Route path="/dictionary" element={<RequireAuth><Dictionary /></RequireAuth>} />
              <Route path="/lessons" element={<RequireAuth><Lessons /></RequireAuth>} />
              <Route path="/phrases" element={<RequireAuth><CommonPhrases /></RequireAuth>} />
              <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </ToastProvider>
      </LangProvider>
    </AuthProvider>
  )
}
