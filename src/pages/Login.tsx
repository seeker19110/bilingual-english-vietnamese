import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Mic, PenLine, MessageCircle } from 'lucide-react'
import { login, register } from '../lib/auth'
import { useAuth } from '../context/useAuth'

const FEATURES = [
  { icon: MessageCircle, label: 'Chat với gia sư AI', color: 'text-emerald-400' },
  { icon: Mic,          label: 'Luyện nói song ngữ', color: 'text-sky-400' },
  { icon: PenLine,      label: 'Chấm bài IELTS tức thì', color: 'text-violet-400' },
]

export default function Login() {
  const nav = useNavigate()
  const { user, refresh } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Đã đăng nhập → về trang chủ
  if (user) { nav('/'); return null }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) { setError('Vui lòng nhập tên.'); return }
        const u = await register(email.trim(), name.trim(), password)
        if (!u) { setError('Email đã được dùng hoặc không hợp lệ. Hãy thử email khác.'); return }
      } else {
        const u = await login(email.trim(), password)
        if (!u) { setError('Email hoặc mật khẩu không đúng.'); return }
      }
      await refresh()
      nav('/')
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-emerald-500/70 focus:bg-zinc-800 transition"

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Gradient blobs nền */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[140px] opacity-[0.07] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-[140px] opacity-[0.07] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500 rounded-full blur-[120px] opacity-[0.04] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Logo */}
      <div className="mb-7 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/30 glow-emerald">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Gia sư tiếng Anh AI</h1>
        <p className="text-zinc-500 text-sm mt-1.5 tracking-wide">Luyện nói · Viết · Nhận xét bằng tiếng Việt</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-2xl p-6 shadow-2xl shadow-black/40 animate-scale-in delay-100">

        {/* Tabs */}
        <div className="flex mb-5 bg-zinc-800/60 rounded-xl p-1 gap-1">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                mode === m
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}>
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Tên của bạn" className={inputCls} required
              autoFocus />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" className={inputCls} required
            autoFocus={mode === 'login'} />
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu" className={`${inputCls} pr-11`} required minLength={6} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 transition">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] mt-1 shadow-lg shadow-emerald-500/20">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Đang xử lý…</span>
              : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản miễn phí'
            }
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Dữ liệu lưu trên máy bạn · Hoàn toàn riêng tư
        </p>
      </div>

      {/* Feature pills */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in delay-300">
        {FEATURES.map(f => {
          const Icon = f.icon
          return (
            <div key={f.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Icon className={`w-3.5 h-3.5 ${f.color}`} />
              <span>{f.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
