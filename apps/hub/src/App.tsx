import { useEffect, useState } from 'react'

// Trang chủ hub — bố cục 1 trang theo §7.1 đã chốt (docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md):
// 1. Mở đầu — mục tiêu tổng thể   2. Hoạt động dự án nói chung (số thật)
// 3. Tab riêng từng môn            4. Bảng giá chung + đăng nhập/đăng ký
//
// PR-7 phạm vi ĐÃ THU HẸP (xem PROGRESS.md): CHƯA có SSO cookie dùng chung — nút đăng
// nhập/đăng ký + "Học ngay" tạm điều hướng thẳng sang app tiếng Anh (subdomain hiện có),
// người dùng vẫn phải đăng nhập lại ở đó cho tới khi PR sau làm cookie domain chung.
const ENGLISH_APP_URL =
  (import.meta.env.VITE_ENGLISH_APP_URL as string | undefined) ||
  'https://en-vi.donghanhcungban.com'

interface HubStats {
  totalUsers: number
  totalEnglishSessions: number
}

interface SubjectTab {
  id: string
  name: string
  emoji: string
  status: 'live' | 'coming-soon'
  description: string
  highlight: string
  ctaUrl?: string
}

const SUBJECTS: SubjectTab[] = [
  {
    id: 'english',
    name: 'Tiếng Anh',
    emoji: '🇬🇧',
    status: 'live',
    description:
      'Gia sư AI hai chiều Việt ⇄ Anh: chat tự do, luyện viết chấm điểm kiểu IELTS, luyện nói song ngữ (AI trả lời bằng giọng tiếng Anh, sửa lỗi bằng giọng tiếng Việt).',
    highlight: 'Lộ trình CEFR A1→C2 đầy đủ, hơn 12.000 từ đã gắn nhãn trình độ.',
    ctaUrl: ENGLISH_APP_URL,
  },
  {
    id: 'math',
    name: 'Toán',
    emoji: '📐',
    status: 'coming-soon',
    description:
      'Gia sư AI giải bài tập Toán theo chương trình phổ thông Việt Nam, chấm bài kèm giải thích từng bước.',
    highlight:
      'Đang trong giai đoạn thiết kế (GĐ2) — dự kiến mở sau khi hoàn tất tách lõi dùng chung.',
  },
  {
    id: 'physics',
    name: 'Vật lý',
    emoji: '⚛️',
    status: 'coming-soon',
    description: 'Gia sư AI cho môn Vật lý — công thức, bài tập, thí nghiệm mô phỏng.',
    highlight: 'Kế hoạch mở sau môn Toán (GĐ3).',
  },
  {
    id: 'chemistry',
    name: 'Hoá học',
    emoji: '🧪',
    status: 'coming-soon',
    description: 'Gia sư AI cho môn Hoá học — phản ứng, phương trình, bài tập tính toán.',
    highlight: 'Kế hoạch mở sau môn Toán (GĐ3).',
  },
]

function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN')
}

function useHubStats() {
  const [stats, setStats] = useState<HubStats | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/hub-stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HubStats | null) => {
        if (!cancelled && data) setStats(data)
      })
      .catch(() => {
        // Fail-open: hub vẫn hiển thị bình thường, chỉ ẩn phần số liệu nếu lỗi mạng/API.
      })
    return () => {
      cancelled = true
    }
  }, [])
  return stats
}

function Hero() {
  return (
    <section className="px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Đồng hành cùng bạn</h1>
      <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
        Nền tảng học tập cùng AI, đồng hành với bạn trong nhiều môn học — bắt đầu từ tiếng Anh, mở
        rộng dần sang Toán, Vật lý, Hoá học và hơn thế nữa. Mục tiêu: học phí thấp, nội dung sát đời
        sống Việt Nam, luôn có một người bạn AI đồng hành mỗi khi bạn cần học.
      </p>
    </section>
  )
}

function ActivitySection({ stats }: { stats: HubStats | null }) {
  return (
    <section className="px-6 py-10 bg-zinc-900/50 border-y border-zinc-800">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-6">Hoạt động của dự án</h2>
        {stats ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-emerald-400">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-zinc-400 mt-1">người học đã tham gia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">
                {formatNumber(stats.totalEnglishSessions)}
              </div>
              <div className="text-sm text-zinc-400 mt-1">lượt học đã thực hiện</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-500">Đang tải số liệu…</div>
        )}
      </div>
    </section>
  )
}

function SubjectTabs() {
  const [active, setActive] = useState(SUBJECTS[0]!.id)
  const current = SUBJECTS.find((s) => s.id === active)!

  return (
    <section className="px-6 py-12 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">Các môn học</h2>
      <div className="flex gap-2 justify-center flex-wrap mb-6">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              active === s.id
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{current.emoji}</span>
          <h3 className="text-lg font-semibold">{current.name}</h3>
          {current.status === 'coming-soon' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Sắp ra mắt
            </span>
          )}
        </div>
        <p className="text-zinc-300 mb-3">{current.description}</p>
        <p className="text-sm text-zinc-500 mb-4">{current.highlight}</p>
        {current.status === 'live' && current.ctaUrl && (
          <a
            href={current.ctaUrl}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition"
          >
            Học ngay →
          </a>
        )}
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="px-6 py-12 bg-zinc-900/50 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-3">Một gói, dùng mọi môn</h2>
        <p className="text-zinc-400 mb-6">
          Gói Pro/VIP áp dụng chung cho tất cả các môn khi mở thêm — không phải mua riêng cho từng
          môn. Xem chi tiết giá và đăng ký ngay trong app tiếng Anh.
        </p>
        <a
          href={`${ENGLISH_APP_URL}/login`}
          className="inline-flex items-center px-5 py-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition font-medium"
        >
          Đăng nhập / Đăng ký
        </a>
      </div>
    </section>
  )
}

export default function App() {
  const stats = useHubStats()
  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <Hero />
      <ActivitySection stats={stats} />
      <SubjectTabs />
      <PricingSection />
      <footer className="px-6 py-8 text-center text-xs text-zinc-600">
        © Đồng hành cùng bạn — donghanhcungban.com
      </footer>
    </div>
  )
}
