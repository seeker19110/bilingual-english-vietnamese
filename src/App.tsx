import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './lib/storage'
import Login from './pages/Login'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Writing from './pages/Writing'
import Speaking from './pages/Speaking'

function RequireAuth({ children }: { children: React.ReactNode }) {
  return getCurrentUser() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/writing" element={<RequireAuth><Writing /></RequireAuth>} />
        <Route path="/speaking" element={<RequireAuth><Speaking /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
