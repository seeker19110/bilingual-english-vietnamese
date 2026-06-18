import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { login, register, getCurrentUser } from '../lib/storage'

export default function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getCurrentUser()) nav('/')
  }, [nav])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (mode === 'register') {
        if (!name.trim()) { setError('Vui lòng nhập tên.'); setLoading(false); return }
        const user = register(email.trim(), name.trim(), password)
        if (!user) { setError('Email đã được dùng. Hãy đăng nhập.'); setLoading(false); return }
        nav('/')
      } else {
        const user = login(email.trim(), password)
        if (!user) { setError('Email hoặc mật khẩu không đúng.'); setLoading(false); return }
        nav('/')
      }
    }, 300)
  }

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500 transition"

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Gia sư tiếng Anh AI</h1>
        <p className="text-zinc-400 text-sm mt-1">Luyện nói · Viết · Nhận xét bằng tiếng Việt</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        {/* Tabs */}
        <div className="flex mb-6 bg-zinc-800 rounded-xl p-1">
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${mode === m ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Tên của bạn" className={inputCls} required />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" className={inputCls} required />
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu" className={`${inputCls} pr-10`} required minLength={6} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition mt-2">
            {loading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Dữ liệu lưu trên máy bạn · Hoàn toàn riêng tư
        </p>
      </div>
    </div>
  )
}
