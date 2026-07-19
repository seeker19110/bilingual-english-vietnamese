import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Mic, PenLine, MessageCircle } from 'lucide-react'
import { login, register, loginWithGoogle } from '../lib/auth'
import { useAuth } from '../context/useAuth'
import { useLang } from '../context/useLang'
import type { UiLang } from '../lib/uiLang'

// Nhãn tính năng lấy từ i18n theo `key` (icon + màu cố định, chữ dịch theo ngôn ngữ)
const FEATURES = [
  { icon: MessageCircle, key: 'featChat', color: 'text-accent-400' },
  { icon: Mic, key: 'featSpeak', color: 'text-sky-400' },
  { icon: PenLine, key: 'featScore', color: 'text-violet-400' },
] as const

export default function Login() {
  const nav = useNavigate()
  const { user, refresh } = useAuth()
  const { T, lang, setLang } = useLang()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Đã đăng nhập → về trang chủ
  if (user) {
    nav('/')
    return null
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError(T.errNameRequired)
          return
        }
        const u = await register(email.trim(), name.trim(), password)
        if (!u) {
          setError(T.errEmailInvalid)
          return
        }
      } else {
        const u = await login(email.trim(), password)
        if (!u) {
          setError(T.errBadCredentials)
          return
        }
      }
      await refresh()
      nav('/')
    } catch {
      setError(T.errConnection)
    } finally {
      setLoading(false)
    }
  }

  // Đăng nhập bằng Google — Giai đoạn B dùng Google Identity Services (popup/One Tap ngay
  // trên trang, KHÔNG redirect rời trang như Supabase OAuth trước đây).
  async function googleSignIn() {
    setError('')
    setLoading(true)
    try {
      const u = await loginWithGoogle()
      if (!u) {
        setError(T.errGoogle)
        return
      }
      await refresh()
      nav('/')
    } catch {
      setError(T.errGoogle)
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-accent-500/70 focus:bg-zinc-800 transition'

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient blobs nền */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-[140px] opacity-[0.07] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-[140px] opacity-[0.07] translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500 rounded-full blur-[120px] opacity-[0.04] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Chọn ngôn ngữ giao diện (VI/EN) — trang này không có header nên đặt góc trên */}
      <div
        className="absolute top-4 right-4 z-10 flex gap-1 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-1"
        role="group"
        aria-label={T.langToggleLabel}
      >
        {(['vi', 'en'] as const).map((l: UiLang) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              lang === l ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Logo */}
      <div className="mb-7 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-accent-500/30 glow-accent">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{T.loginBrand}</h1>
        <p className="text-zinc-400 text-sm mt-1.5 tracking-wide">{T.loginTagline}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-2xl p-6 shadow-2xl shadow-black/40 animate-scale-in delay-100">
        {/* Tabs */}
        <div className="flex mb-5 bg-zinc-800/60 rounded-xl p-1 gap-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m)
                setError('')
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                mode === m
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {m === 'login' ? T.loginTabLogin : T.loginTabRegister}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={T.namePlaceholder}
              className={inputCls}
              required
              autoFocus
            />
          )}
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={T.emailPlaceholder}
            className={inputCls}
            required
            autoFocus={mode === 'login'}
          />
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={T.passwordPlaceholder}
              className={`${inputCls} pr-11`}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              aria-label={showPw ? T.hidePassword : T.showPassword}
              aria-pressed={showPw}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 p-0.5 transition"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-teal-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition active:scale-[0.98] mt-1 shadow-lg shadow-accent-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />{' '}
                {T.loginProcessing}
              </span>
            ) : mode === 'login' ? (
              T.loginSubmit
            ) : (
              T.registerSubmit
            )}
          </button>
        </form>

        {/* Ngăn cách "hoặc" */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-zinc-700/60" />
          <span className="text-xs text-zinc-400">{T.loginOr}</span>
          <div className="flex-1 h-px bg-zinc-700/60" />
        </div>

        {/* Nút đăng nhập bằng Google */}
        <button
          type="button"
          onClick={googleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#ffffff] hover:bg-[#f4f4f5] disabled:opacity-50 text-[#27272a] font-medium py-3 rounded-xl text-sm transition active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
            />
          </svg>
          {T.googleSignIn}
        </button>

        <p className="text-center text-xs text-zinc-400 mt-4">{T.loginPrivacy}</p>
      </div>

      {/* Feature pills */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in delay-300">
        {FEATURES.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.key} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Icon className={`w-3.5 h-3.5 ${f.color}`} />
              <span>{T[f.key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
