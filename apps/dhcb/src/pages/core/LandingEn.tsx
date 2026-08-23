import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Mic, PenLine, Volume2, Sparkles } from 'lucide-react'
import { track } from '../../lib/analytics'
import ThemeToggle from '../../components/ThemeToggle'
import { setDirection } from '../../lib/storage'

// Landing page TIẾNG ANH cho chiều B (người nước ngoài học tiếng Việt) — ngách gần như trống
// (xem docs/research/chien-luoc-marketing-2026-07-25.md §2.1). Song song với src/pages/Landing.tsx
// (chiều A, tiếng Việt) — KHÔNG gộp chung 1 component vì đối tượng, kênh phân phối (Reddit/expat
// group vs TikTok VN) và ngôn ngữ nội dung khác hẳn nhau, gộp lại sẽ rối hơn là tách.
const TITLE = 'Learn Vietnamese by Speaking with AI — Corrections Explained in English'
const DESCRIPTION =
  'Practice real Vietnamese conversation with an AI tutor. Mistakes are explained back to you in English, in a real Vietnamese voice. Free.'

const MODES = [
  {
    icon: MessageCircle,
    title: 'Chat practice',
    desc: 'Friendly conversation with AI, corrections explained in English as you go.',
  },
  {
    icon: PenLine,
    title: 'Writing + scoring',
    desc: 'Get your writing scored, mistakes highlighted, band estimate given.',
  },
  {
    icon: Mic,
    title: 'Bilingual speaking',
    desc: 'Speak Vietnamese, AI replies in a real Vietnamese voice — corrections explained in English.',
  },
] as const

export default function LandingEn() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  // SEO: set title + meta description ngay khi vào trang — cùng cách Landing.tsx (chiều A)
  // đang làm, đọc chú thích ở đó để biết vì sao document API thay vì react-helmet.
  useEffect(() => {
    const prevTitle = document.title
    document.title = TITLE

    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const prevDesc = metaDesc?.content
    if (metaDesc) metaDesc.content = DESCRIPTION

    return () => {
      document.title = prevTitle
      if (metaDesc && prevDesc !== undefined) metaDesc.content = prevDesc
    }
  }, [])

  useEffect(() => {
    track('landing_view', { path: '/learn-vietnamese' })
  }, [])

  useEffect(() => {
    const ref = searchParams.get('ref') ?? searchParams.get('utm_source')
    if (ref) {
      try {
        localStorage.setItem('pending_ref_code', ref)
      } catch {
        // localStorage có thể bị chặn (chế độ riêng tư) — bỏ qua, không chặn trang chạy tiếp
      }
    }
  }, [searchParams])

  function handleCtaClick() {
    track('cta_click', { path: '/learn-vietnamese' })
    // Đặt sẵn chiều B (đích=Việt, giải thích=Anh) TRƯỚC khi vào đăng ký — người từ landing này
    // đang tìm học tiếng Việt, không phải tiếng Anh. Không đặt thì họ vào app sẽ thấy mặc định
    // chiều A (học tiếng Anh) và phải tự tìm nút đổi chiều trong Hồ sơ, dễ bỏ cuộc luôn từ đầu.
    setDirection('B')
    nav('/login')
  }

  return (
    <div className="min-h-dvh bg-zinc-950 theme-light:bg-white text-zinc-100 theme-light:text-zinc-900">
      <header className="max-w-4xl mx-auto px-4 pt-4 flex justify-end">
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16 pt-6 sm:max-w-2xl">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-400">
            <Sparkles className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            Learn Vietnamese with AI
            <br />
            <span className="text-accent-400">mistakes explained back to you in English</span>
          </h1>
          <p className="mt-3 text-base text-zinc-400">
            Free. No prior Vietnamese needed to get started.
          </p>

          <button
            type="button"
            onClick={handleCtaClick}
            className="tap-44 mt-6 w-full rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-black transition hover:bg-accent-400 sm:w-auto sm:px-10"
          >
            Start learning free
          </button>
        </section>

        {/* Điểm khác biệt */}
        <section className="mt-10 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4">
          <div className="flex items-start gap-3">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
            <p className="text-sm text-zinc-300">
              <strong className="text-zinc-100 theme-light:text-zinc-900">What's different:</strong>{' '}
              The AI doesn't just correct your text — it{' '}
              <strong>reads the explanation back to you in a real English voice</strong>, while the
              conversation itself stays in natural Vietnamese. Content is grounded in everyday
              Vietnamese life, not textbook phrases.
            </p>
          </div>
        </section>

        {/* 3 chế độ */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Three practice modes
          </h2>
          <div className="mt-4 space-y-3">
            {MODES.map((mode) => (
              <div
                key={mode.title}
                className="flex items-start gap-3 rounded-xl border border-zinc-800 theme-light:border-zinc-200 bg-zinc-900/60 theme-light:bg-zinc-50 p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15 text-accent-400">
                  <mode.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 theme-light:text-zinc-900">
                    {mode.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-400">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Giới hạn dùng — thành thật, không phóng đại */}
        <section className="mt-8 rounded-xl border border-zinc-800 theme-light:border-zinc-200 bg-zinc-900/40 theme-light:bg-zinc-50 p-4 text-center">
          <p className="text-sm text-zinc-400">
            Free, with a daily usage limit so everyone gets a fair share.
          </p>
        </section>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleCtaClick}
            className="tap-44 w-full rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-black transition hover:bg-accent-400 sm:w-auto sm:px-10"
          >
            Sign up free
          </button>
        </div>
      </main>
    </div>
  )
}
