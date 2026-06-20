import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from './context/LangProvider'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Writing from './pages/Writing'
import Speaking from './pages/Speaking'
import PartsOfSpeech from './pages/PartsOfSpeech'
import CommonPhrases from './pages/CommonPhrases'

// Trang Từ điển chứa file dữ liệu rất lớn (7.428 từ) — chỉ tải khi người dùng
// thực sự bấm vào, không gộp vào bundle chính để app khởi động nhanh hơn.
const Dictionary = lazy(() => import('./pages/Dictionary'))

// Trang Bài học cũng chứa dữ liệu hội thoại lớn (sẽ lên tới 100 bài) — lazy-load tương tự.
const Lessons = lazy(() => import('./pages/Lessons'))

// Màn hình chờ — dùng khi kiểm tra session và khi lazy-load trang
function PageLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-sm text-zinc-500">Đang tải...</p>
    </div>
  )
}

// Bảo vệ route: chờ Supabase xác nhận session rồi mới quyết định redirect
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
              <Route path="/writing" element={<RequireAuth><Writing /></RequireAuth>} />
              <Route path="/speaking" element={<RequireAuth><Speaking /></RequireAuth>} />
              <Route path="/dictionary" element={<RequireAuth><Dictionary /></RequireAuth>} />
              <Route path="/lessons" element={<RequireAuth><Lessons /></RequireAuth>} />
              <Route path="/parts-of-speech" element={<RequireAuth><PartsOfSpeech /></RequireAuth>} />
              <Route path="/phrases" element={<RequireAuth><CommonPhrases /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  )
}
