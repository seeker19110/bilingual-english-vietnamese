import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Mic, PenLine, Volume2, Sparkles } from 'lucide-react'
import { track } from '../lib/analytics'
import ThemeToggle from '../components/ThemeToggle'

// Trang landing công khai, KHÔNG bọc RequireAuth — dùng làm điểm đến cho link quảng cáo
// (TikTok/Facebook/SEO). Khác với "/" (đã gắn RequireAuth, đẩy người chưa đăng nhập sang
// /login), trang này ai cũng vào được để đọc giới thiệu trước khi quyết định đăng ký.
const TITLE = 'Nói tiếng Anh với AI — sửa lỗi bằng giọng Việt | Gia sư tiếng Anh AI'
const DESCRIPTION =
  'Nói tiếng Anh với AI — sai chỗ nào, được giảng lại bằng tiếng Việt. Miễn phí. Hội thoại giọng Anh chuẩn, sửa lỗi & giải thích bằng giọng tiếng Việt, nội dung sát đời sống Việt Nam.'

const MODES = [
  {
    icon: MessageCircle,
    title: 'Chat tổng hợp',
    desc: 'Trò chuyện thân mật với AI, sửa lỗi kèm động viên, giải thích bằng tiếng Việt.',
  },
  {
    icon: PenLine,
    title: 'Luyện viết + chấm điểm',
    desc: 'Chấm bài kiểu IELTS, chỉ rõ lỗi sai, ước lượng band điểm.',
  },
  {
    icon: Mic,
    title: 'Luyện nói song ngữ',
    desc: 'Nói tiếng Anh, AI trả lời bằng giọng Anh chuẩn — sửa lỗi & giải thích bằng giọng tiếng Việt.',
  },
] as const

export default function Landing() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()

  // SEO: set title + meta description ngay khi vào trang. Dự án hiện set các thẻ SEO tĩnh
  // trong index.html (không dùng react-helmet hay thư viện SEO nào ở phía React) — trang này
  // cần title/description RIÊNG cho mục đích quảng cáo nên set trực tiếp qua document API,
  // và trả về thẻ gốc lúc rời trang để không ảnh hưởng các trang khác.
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

  // Ghi nhận lượt xem trang landing (chưa cần đăng nhập vẫn track được).
  useEffect(() => {
    track('landing_view')
  }, [])

  // Lưu tạm mã giới thiệu/nguồn traffic (utm_source hoặc ref) để dùng cho tính năng referral
  // sau này — CHỈ lưu lại, chưa xử lý gì thêm.
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
    track('cta_click')
    // Login.tsx hiện chưa đọc query param để chọn sẵn tab đăng ký (chỉ có state nội bộ
    // mode='login'|'register', mặc định 'login') — trỏ thẳng sang /login, người dùng tự bấm
    // tab "Đăng ký" ở đó.
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
            Nói tiếng Anh với AI
            <br />
            <span className="text-accent-400">sai chỗ nào, được giảng lại bằng tiếng Việt</span>
          </h1>
          <p className="mt-3 text-base text-zinc-400 theme-light:text-zinc-600">
            Miễn phí. Không cần biết trước tiếng Anh vẫn học được.
          </p>

          <button
            type="button"
            onClick={handleCtaClick}
            className="tap-44 mt-6 w-full rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-black transition hover:bg-accent-400 sm:w-auto sm:px-10"
          >
            Bắt đầu học miễn phí
          </button>
        </section>

        {/* Điểm khác biệt */}
        <section className="mt-10 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4">
          <div className="flex items-start gap-3">
            <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
            <p className="text-sm text-zinc-300 theme-light:text-zinc-700">
              <strong className="text-zinc-100 theme-light:text-zinc-900">Điểm khác biệt:</strong>{' '}
              AI không chỉ sửa lỗi bằng chữ — mà còn{' '}
              <strong>đọc to lời giải thích bằng giọng tiếng Việt</strong>, trong khi hội thoại
              chính vẫn bằng giọng tiếng Anh chuẩn. Nội dung bài học sát với đời sống người Việt.
            </p>
          </div>
        </section>

        {/* 3 chế độ */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-zinc-500">
            3 chế độ luyện tập
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
                  <p className="mt-0.5 text-sm text-zinc-400 theme-light:text-zinc-600">
                    {mode.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Giới hạn dùng — thành thật, không phóng đại */}
        <section className="mt-8 rounded-xl border border-zinc-800 theme-light:border-zinc-200 bg-zinc-900/40 theme-light:bg-zinc-50 p-4 text-center">
          <p className="text-sm text-zinc-400 theme-light:text-zinc-600">
            Miễn phí, có giới hạn lượt dùng mỗi ngày để mọi người cùng dùng được.
          </p>
        </section>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleCtaClick}
            className="tap-44 w-full rounded-xl bg-accent-500 px-6 py-3.5 text-base font-semibold text-black transition hover:bg-accent-400 sm:w-auto sm:px-10"
          >
            Đăng ký ngay — miễn phí
          </button>
        </div>
      </main>
    </div>
  )
}
