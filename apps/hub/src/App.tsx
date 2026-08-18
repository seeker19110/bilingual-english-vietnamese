import { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
  Mic,
  PenTool,
  Headphones,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  GraduationCap,
  Flame,
  User,
  Shield,
} from 'lucide-react'

// Trang chủ hub — Nền tảng "Đồng hành cùng bạn" (https://www.donghanhcungban.org)
// - Tiếng Anh giọng Mỹ (US Accent 🇺🇸), gia sư 2 chiều Việt - Anh, CEFR A1→C2.
// - Ẩn số người dùng và lượt học cho non-admin (chỉ admin mới thấy qua API).
// - Hiển thị liên kết trang cá nhân (Profile) khi người dùng đã đăng nhập.
const ENGLISH_APP_URL =
  (import.meta.env.VITE_ENGLISH_APP_URL as string | undefined) ||
  'https://en-vi.donghanhcungban.org'

const PROFILE_URL = `${ENGLISH_APP_URL}/profile`

interface HubStats {
  isAdmin?: boolean
  loggedIn?: boolean
  userName?: string
  totalUsers?: number
  totalEnglishSessions?: number
}

interface SubjectTab {
  id: string
  name: string
  flagOrEmoji: string
  status: 'live' | 'coming-soon'
  tagline: string
  description: string
  highlight: string
  accentNote?: string
  skills: string[]
  ctaUrl?: string
}

const SUBJECTS: SubjectTab[] = [
  {
    id: 'english',
    name: 'Tiếng Anh (Giọng Mỹ - US)',
    flagOrEmoji: '🇺🇸',
    status: 'live',
    tagline: 'Gia sư AI 2 chiều chuẩn giọng Mỹ (American English) · CEFR A1 → C2',
    description:
      'Gia sư AI đồng hành kiên nhẫn: AI đàm thoại bằng tiếng Anh giọng Mỹ tự nhiên, nhận diện và chấm điểm phát âm từng âm vị IPA, đồng thời giải thích ngữ pháp và sửa lỗi chi tiết bằng tiếng Việt gần gũi.',
    highlight:
      'Đầy đủ lộ trình CEFR A1→C2, 12.000+ từ vựng gắn nhãn cấp độ, 16+ giọng AI sống động (Chirp3-HD, Studio, Gemini AI), chấm bài viết chuẩn IELTS và hỗ trợ học Offline.',
    accentNote: 'Chuẩn 100% tiếng Anh - Mỹ (en-US Accent) bản xứ',
    skills: [
      'Đàm thoại phản xạ 2 chiều Việt ⇄ Anh',
      'Luyện phát âm & Nhận diện giọng nói chuẩn IPA',
      'Luyện viết chấm điểm tiêu chuẩn IELTS / CEFR',
      'Luyện nghe sâu & Đọc truyện song ngữ Karaoke Text',
      'Ôn từ vựng ngắt quãng thông minh (FSRS/SRS)',
      'Học ngoại tuyến (Offline) trên Web & Mobile PWA',
    ],
    ctaUrl: ENGLISH_APP_URL,
  },
  {
    id: 'math',
    name: 'Toán học',
    flagOrEmoji: '📐',
    status: 'coming-soon',
    tagline: 'Tư duy logic, giải toán từng bước kèm minh họa trực quan',
    description:
      'Gia sư AI hỗ trợ học Toán từ THCS, THPT đến Đại học (Đại số, Hình học không gian, Giải tích, Xác suất thống kê). Phân tích đề bài, hướng dẫn phương pháp giải từng bước thay vì chỉ đưa ra đáp án.',
    highlight: 'Hệ thống bài tập bám sát chương trình phổ thông và các kỳ thi chuẩn hóa.',
    skills: [
      'Giải bài tập từng bước có lý giải chi tiết',
      'Hình học không gian & Đồ thị trực quan',
      'Rèn luyện tư duy giải đề thi THPT Quốc gia',
      'Kiểm tra và củng cố lỗ hổng kiến thức',
    ],
  },
  {
    id: 'physics',
    name: 'Vật lý',
    flagOrEmoji: '⚛️',
    status: 'coming-soon',
    tagline: 'Hiểu bản chất hiện tượng & Ứng dụng thực tế',
    description:
      'Khám phá thế giới vật lý qua mô phỏng tương tác: Cơ học, Nhiệt học, Điện từ học, Quang học và Vật lý hiện đại. Giải bài tập định lượng và giải thích hiện tượng tự nhiên.',
    highlight: 'Mô phỏng thí nghiệm tương tác giúp nắm chắc bản chất vật lý.',
    skills: [
      'Mô phỏng hiện tượng & thí nghiệm ảo',
      'Hệ thống công thức & phương pháp giải bài tập',
      'Phân tích đồ thị và bài toán thực tế',
      'Hỏi đáp hiện tượng khoa học thường ngày',
    ],
  },
  {
    id: 'chemistry',
    name: 'Hóa học',
    flagOrEmoji: '🧪',
    status: 'coming-soon',
    tagline: 'Cơ chế phản ứng, bản chất liên kết & Bài toán hóa học',
    description:
      'Học Hóa học trực quan từ Hóa vô cơ đến Hóa hữu cơ. Hướng dẫn viết phương trình, cân bằng phản ứng, phân tích cơ chế và giải quyết các dạng bài toán hóa học phức tạp.',
    highlight: 'Trực quan hóa cấu trúc phân tử và chuỗi phản ứng liên hoàn.',
    skills: [
      'Viết và cân bằng phương trình phản ứng',
      'Chuỗi phản ứng và nhận biết chất',
      'Giải bài toán hóa vô cơ & hữu cơ',
      'Mô hình phân tử không gian 3D',
    ],
  },
  {
    id: 'biology',
    name: 'Sinh học',
    flagOrEmoji: '🧬',
    status: 'coming-soon',
    tagline: 'Cơ chế di truyền, tế bào học & Thế giới sống',
    description:
      'Hệ thống kiến thức sinh học toàn diện: Di truyền học, Sinh học tế bào, Sinh thái và Tiến hóa. Hỗ trợ giải bài tập quy luật di truyền và sơ đồ phả hệ chi tiết.',
    highlight: 'Sơ đồ tư duy sinh học và phương pháp giải bài tập di truyền chuẩn xác.',
    skills: [
      'Giải bài tập quy luật di truyền & phả hệ',
      'Cơ chế di truyền phân tử và biến dị',
      'Sinh học tế bào và vi sinh vật',
      'Sinh thái học và bảo vệ môi trường',
    ],
  },
]

function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN')
}

function useHubStats() {
  const [stats, setStats] = useState<HubStats | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/hub-stats', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HubStats | null) => {
        if (!cancelled && data) setStats(data)
      })
      .catch(() => {
        // Fail-open
      })
    return () => {
      cancelled = true
    }
  }, [])
  return stats
}

// ── Header / Navigation ──────────────────────────────────────────────────────────
function Navbar({ stats }: { stats: HubStats | null }) {
  const isLoggedIn = !!stats?.loggedIn
  const displayName = stats?.userName?.trim()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              Đồng hành cùng bạn
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Platform
              </span>
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Nền tảng học tập cùng Gia sư AI thông minh
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <a href="#subjects" className="hover:text-emerald-400 transition-colors">
            Môn học
          </a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Tính năng AI
          </a>
          <a href="#why-us" className="hover:text-emerald-400 transition-colors">
            Điểm khác biệt
          </a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">
            Bảng giá
          </a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">
            Hỏi đáp
          </a>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoggedIn ? (
            <>
              <a
                href={PROFILE_URL}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition"
                title="Truy cập trang cá nhân & quản lý tài khoản"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[120px] sm:max-w-[160px] truncate">
                  {displayName || 'Trang cá nhân'}
                </span>
              </a>
              <a
                href={ENGLISH_APP_URL}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Vào học</span>
                <span className="text-xs">🇺🇸</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <>
              <a
                href={`${ENGLISH_APP_URL}/login`}
                className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition"
              >
                Đăng nhập
              </a>
              <a
                href={ENGLISH_APP_URL}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                <span>Học Tiếng Anh</span>
                <span className="text-xs">🇺🇸</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Hero Section ─────────────────────────────────────────────────────────────────
function Hero({ stats }: { stats: HubStats | null }) {
  const isLoggedIn = !!stats?.loggedIn
  const displayName = stats?.userName?.trim()

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-10 right-10 w-[300px] h-[250px] bg-teal-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Accent / User Greeting badge */}
        {isLoggedIn ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 mb-6 shadow-sm">
            <span>👋</span>
            <span className="font-semibold">
              Chào mừng trở lại{displayName ? `, ${displayName}` : ''}!
            </span>
            <span className="text-emerald-600">•</span>
            <a href={PROFILE_URL} className="underline hover:text-white transition">
              Trang cá nhân
            </a>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-300 mb-6 shadow-sm">
            <span className="text-base">🇺🇸</span>
            <span className="font-semibold text-emerald-400">Tiếng Anh Giọng Mỹ (US Accent)</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Chuẩn CEFR A1 → C2</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
          Gia sư AI kiên nhẫn, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            đồng hành cùng bạn
          </span>{' '}
          mỗi ngày
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Trải nghiệm học Tiếng Anh giọng Mỹ tự nhiên cùng Gia sư AI song ngữ 2 chiều: Đàm thoại bản
          xứ phản xạ nhanh, chấm điểm phát âm từng âm tiết IPA, và sửa lỗi ngữ pháp bằng tiếng Việt
          tận tâm.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <a
            href={ENGLISH_APP_URL}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all hover:scale-[1.02]"
          >
            <span>{isLoggedIn ? 'Tiếp tục học Tiếng Anh ngay' : 'Bắt đầu học Tiếng Anh ngay'}</span>
            <span className="text-sm">🇺🇸</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {isLoggedIn ? (
            <a
              href={PROFILE_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-base transition"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Xem trang cá nhân & Lộ trình</span>
            </a>
          ) : (
            <a
              href="#subjects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-base transition"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Xem tất cả môn học</span>
            </a>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 border-t border-zinc-800/60 text-xs sm:text-sm text-zinc-400">
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Không cần thẻ tín dụng</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Học Web & Mobile PWA</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Phát âm chuẩn giọng Mỹ</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-zinc-900/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Học phí siêu tiết kiệm</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Activity / Platform Highlights Section ────────────────────────────────────────
// - Cho Admin: Hiển thị 4 thẻ bao gồm Số người dùng và Lượt học thật.
// - Cho Non-Admin / Khách: Ẩn số người dùng và lượt học, hiển thị các mốc chất lượng nền tảng.
function ActivitySection({ stats }: { stats: HubStats | null }) {
  const isAdmin = stats?.isAdmin === true
  const hasAdminStats =
    isAdmin && stats.totalUsers !== undefined && stats.totalEnglishSessions !== undefined

  return (
    <section className="px-4 sm:px-6 py-8 bg-zinc-900/40 border-y border-zinc-800/80">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              {isAdmin ? 'Thống kê hoạt động nền tảng' : 'Chất lượng đào tạo chuẩn quốc tế'}
            </h2>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                <Shield className="w-2.5 h-2.5" />
                Admin
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {isAdmin
              ? 'Số liệu quản trị thời gian thực'
              : 'Nền tảng học tập thông minh với kho dữ liệu chuẩn mực'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {hasAdminStats ? (
            <>
              {/* Thẻ dành riêng cho Admin */}
              <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center relative">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {formatNumber(stats.totalUsers!)}
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Người dùng tham gia</span>
                </div>
              </div>

              <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {formatNumber(stats.totalEnglishSessions!)}
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Lượt học đã thực hiện</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Thẻ hiển thị cho Người học & Khách vãng lai */}
              <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                  6 Cấp độ
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Lộ trình CEFR A1 → C2</span>
                </div>
              </div>

              <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Tiếng Anh Giọng Mỹ (US)</span>
                </div>
              </div>
            </>
          )}

          <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">
              12.160+
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
              <span>Từ vựng chuẩn hóa A1-C2</span>
            </div>
          </div>

          <div className="bg-zinc-900/80 rounded-xl p-4 sm:p-5 border border-zinc-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight">
              16+
            </div>
            <div className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center justify-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Giọng AI Mỹ (Chirp3, Studio, Gemini)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Subjects Showcase ────────────────────────────────────────────────────────────
function SubjectTabs() {
  const [active, setActive] = useState(SUBJECTS[0]!.id)
  const current = SUBJECTS.find((s) => s.id === active)!

  return (
    <section id="subjects" className="px-4 sm:px-6 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
          Hệ sinh thái môn học
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Một nền tảng — Nhiều môn học
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Bắt đầu với môn <strong>Tiếng Anh giọng Mỹ (US Accent)</strong> đã hoàn thiện và sẵn sàng
          học ngay, mở rộng dần sang toàn bộ các môn STEM phổ thông.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              active === s.id
                ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 scale-105'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>{s.flagOrEmoji}</span>
            <span>{s.name}</span>
            {s.status === 'live' ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Sắp ra mắt
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Subject Detail Card */}
      <div className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-3xl">{current.flagOrEmoji}</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{current.name}</h3>
              {current.status === 'live' ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Đang hoạt động (Live)
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Lộ trình Giai đoạn 2
                </span>
              )}
            </div>

            <p className="text-emerald-400 font-medium text-sm sm:text-base mb-3">
              {current.tagline}
            </p>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">
              {current.description}
            </p>

            {current.accentNote && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium mb-5">
                <span>🎯</span>
                <span>{current.accentNote}</span>
              </div>
            )}

            {/* Skills List */}
            <div className="mt-2 mb-6">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Kỹ năng & Tính năng nổi bật:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {current.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 mb-6">
              💡 {current.highlight}
            </div>

            {current.status === 'live' && current.ctaUrl && (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={current.ctaUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm sm:text-base transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
                >
                  <span>Vào học Tiếng Anh ngay</span>
                  <span className="text-sm">🇺🇸</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-xs text-zinc-400">
                  Miễn phí sử dụng hàng ngày • Không cần thẻ
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 6 Core Advantages (Why Us) ───────────────────────────────────────────────────
function WhyUsSection() {
  const features = [
    {
      icon: <Volume2 className="w-6 h-6 text-emerald-400" />,
      title: 'Giọng Mỹ Chuẩn Bản Xứ (US Accent 🇺🇸)',
      description:
        'Học theo giọng tiếng Anh - Mỹ tự nhiên phổ biến nhất thế giới. AI phát âm rõ âm cuối (ending sounds), nối âm, ngữ điệu thực tế và chấm điểm ngữ âm IPA tức thì.',
    },
    {
      icon: <Mic className="w-6 h-6 text-emerald-400" />,
      title: 'Gia sư Song ngữ 2 chiều Việt ⇄ Anh',
      description:
        'Không sợ bí từ! Bạn có thể nói tiếng Anh để luyện phản xạ, hoặc hỏi bằng tiếng Việt bất kỳ lúc nào để AI giải thích cặn kẽ và hướng dẫn cách diễn đạt hay hơn.',
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-400" />,
      title: 'Chuẩn CEFR A1→C2 & Chấm Điểm IELTS',
      description:
        'Hơn 12.000 từ vựng và bài học phân cấp chặt chẽ theo Khung tham chiếu Châu Âu. Công cụ luyện viết chấm bài tự động theo 4 tiêu chí chuẩn bài thi IELTS.',
    },
    {
      icon: <Headphones className="w-6 h-6 text-emerald-400" />,
      title: 'Luyện nghe & Karaoke Text thông minh',
      description:
        'Kho truyện ngắn và bài nghe phong phú, chữ sáng theo từng nhịp giọng đọc giúp bạn đồng thời bắt kịp tai nghe và mắt nhìn mặt chữ chính xác.',
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: 'Ghi nhớ dài hạn với thuật toán FSRS/SRS',
      description:
        'Tự động tính toán chu kỳ lặp lại ngắt quãng khoa học cho từng từ vựng và mẫu câu, giúp bạn ôn lại đúng lúc trước khi quên mà không tốn công ghi chép.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-400" />,
      title: 'Học Ngoại tuyến (Offline Mode) & PWA',
      description:
        'Cài đặt trực tiếp như một ứng dụng di động native từ trình duyệt. Tải trước bài học và audio để luyện tập ngay cả khi đang trên xe buýt hoặc mất mạng.',
    },
  ]

  return (
    <section
      id="why-us"
      className="px-4 sm:px-6 py-16 sm:py-20 bg-zinc-900/30 border-t border-zinc-800"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
            Điểm khác biệt vượt trội
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Tại sao chọn Đồng Hành Cùng Bạn?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Được thiết kế riêng cho người học Việt Nam với mục tiêu tối ưu hiệu quả và chi phí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/70 hover:bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all hover:scale-[1.01] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Interactive Features Showcase ────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="px-4 sm:px-6 py-16 sm:py-20 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
          Tính năng AI chuyên sâu
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Bộ công cụ toàn diện cho người học
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Mỗi tính năng đều được tối ưu để bạn tiến bộ nhanh nhất trong từng kỹ năng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Box 1: Luyện phát âm & Hội thoại */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Luyện nói & Phản xạ Giọng Mỹ (US)</h3>
              <p className="text-xs text-zinc-400">Tự tin giao tiếp không ngại sai</p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            Trò chuyện tự do với các nhân vật AI đa dạng. AI lắng nghe phát âm của bạn, nhận diện
            từng âm sai theo bảng phiên âm IPA quốc tế và gợi ý cách đặt lưỡi, khẩu hình để chuẩn
            hóa giọng Mỹ tự nhiên.
          </p>
          <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/80 text-xs font-mono text-zinc-300">
            <div className="flex items-center justify-between text-zinc-400 mb-2 pb-2 border-b border-zinc-800">
              <span>Đánh giá phát âm AI</span>
              <span className="text-emerald-400 font-bold">96% Match (US)</span>
            </div>
            <div className="text-zinc-300 mb-1">
              User: <span className="text-white">"I'd like to schedule an appointment."</span>
            </div>
            <div className="text-emerald-400">
              AI Tutor: 🇺🇸 /aɪd laɪk tuː ˈskedʒuːl ən əˈpɔɪntmənt/ — Âm /skedʒuːl/ chuẩn giọng Mỹ!
            </div>
          </div>
        </div>

        {/* Box 2: Luyện viết & Chấm điểm */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 sm:p-8 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Luyện viết & Chấm điểm IELTS/CEFR</h3>
              <p className="text-xs text-zinc-400">Nhận xét chi tiết sau 3 giây</p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            Chấm bài viết tiếng Anh theo 4 tiêu chí chuẩn IELTS: Task Achievement, Coherence &
            Cohesion, Lexical Resource, Grammatical Range & Accuracy. Kèm bản viết lại chuẩn mực để
            học hỏi.
          </p>
          <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800/80 text-xs font-mono text-zinc-300">
            <div className="flex items-center justify-between text-zinc-400 mb-2 pb-2 border-b border-zinc-800">
              <span>Tiêu chí đánh giá</span>
              <span className="text-teal-400 font-bold">Band 7.0 (CEFR C1)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-zinc-900 p-1.5 rounded">Từ vựng (Lexical): 7.5</div>
              <div className="bg-zinc-900 p-1.5 rounded">Ngữ pháp (Grammar): 7.0</div>
              <div className="bg-zinc-900 p-1.5 rounded">Mạch lạc (Coherence): 7.0</div>
              <div className="bg-zinc-900 p-1.5 rounded">Nhiệm vụ (Task): 6.5</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing Section ──────────────────────────────────────────────────────────────
function PricingSection({ stats }: { stats: HubStats | null }) {
  const isLoggedIn = !!stats?.loggedIn

  return (
    <section
      id="pricing"
      className="px-4 sm:px-6 py-16 sm:py-20 bg-zinc-900/40 border-t border-zinc-800"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
            Bảng giá minh bạch & Tiết kiệm
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Một gói duy nhất — Học tất cả các môn
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Học phí bình dân cho học sinh, sinh viên và người đi làm. Khi hệ thống mở thêm môn Toán,
            Lý, Hóa, tài khoản của bạn được dùng chung không cần mua thêm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Gói Miễn Phí (Free)</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400">
                  Trọn đời
                </span>
              </div>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">0đ</span>
                <span className="text-zinc-400 text-xs sm:text-sm"> / mãi mãi</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mb-6">
                Trải nghiệm đầy đủ các tính năng cơ bản mỗi ngày mà không tốn bất kỳ chi phí nào.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>4 giọng đọc AI tiếng Anh Mỹ chuẩn</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chat đàm thoại & Luyện phát âm IPA</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tra từ điển & Ôn tập từ vựng ngắt quãng</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đầy đủ lộ trình CEFR A1 → C2</span>
                </li>
              </ul>
            </div>
            <a
              href={ENGLISH_APP_URL}
              className="w-full py-3 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-center font-semibold text-sm text-white transition block"
            >
              {isLoggedIn ? 'Vào học ngay' : 'Học thử miễn phí ngay'}
            </a>
          </div>

          {/* Pro / VIP Tier */}
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900 to-emerald-950/30 rounded-2xl p-6 sm:p-8 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-emerald-500 text-zinc-950 font-bold text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
              Khuyên dùng
            </div>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Gói Pro / VIP</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Một gói đa môn
                </span>
              </div>
              <div className="mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                  Học phí bình dân
                </span>
                <span className="text-zinc-400 text-xs sm:text-sm"> / theo tháng & năm</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 mb-6">
                Không giới hạn lượt học, mở trọn bộ 16+ giọng AI cao cấp nhất và áp dụng cho mọi môn
                học.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-200 mb-8">
                <li className="flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Trọn bộ 16+ giọng AI Mỹ (Chirp3-HD, Studio, Gemini)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chấm bài viết IELTS & Sửa lỗi chi tiết không giới hạn</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tải bài học & Nghe ngoại tuyến (Offline) không giới hạn</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tự động mở khóa các môn STEM mới (Toán, Lý, Hóa)</span>
                </li>
              </ul>
            </div>
            <a
              href={isLoggedIn ? PROFILE_URL : `${ENGLISH_APP_URL}/login`}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-center font-bold text-sm text-zinc-950 shadow-md shadow-emerald-500/25 transition block hover:scale-[1.02]"
            >
              {isLoggedIn
                ? 'Xem chi tiết giá & Nâng cấp trong Hồ sơ →'
                : 'Đăng nhập để xem bảng giá & Nâng cấp →'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── FAQ Section ──────────────────────────────────────────────────────────────────
function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Nền tảng sử dụng chuẩn Tiếng Anh giọng gì?',
      a: 'Đồng hành cùng bạn sử dụng 100% chuẩn Tiếng Anh - Mỹ (American English / US Accent) phổ biến nhất toàn cầu. Toàn bộ hệ thống 16+ giọng đọc AI chất lượng cao (Google Chirp3-HD, Studio, Gemini AI, ElevenLabs) và bộ nhận diện chấm phát âm IPA đều được thiết lập theo chuẩn giọng Mỹ.',
    },
    {
      q: 'Tôi có thể dùng thử miễn phí không?',
      a: 'Có! Bạn có thể sử dụng gói Miễn phí (Free) mãi mãi mà không cần nhập thẻ ngân hàng hay thanh toán bất kỳ khoản nào. Gói miễn phí đã bao gồm 4 giọng đọc chuẩn, tra từ điển, chat phản xạ và ôn tập ngắt quãng hàng ngày.',
    },
    {
      q: 'Tôi có thể cài đặt ứng dụng lên điện thoại như thế nào?',
      a: 'Bạn có thể truy cập website trên trình duyệt điện thoại (Safari trên iPhone hoặc Chrome trên Android) và bấm "Thêm vào Màn hình chính" (Add to Home Screen). Ứng dụng hỗ trợ công nghệ PWA (Progressive Web App), hoạt động mượt mà và hỗ trợ cả chế độ học Offline.',
    },
    {
      q: 'Khi mở thêm các môn Toán, Lý, Hóa, tôi có phải mua gói riêng không?',
      a: 'Không. Tôn chỉ của Đồng hành cùng bạn là "Một gói, dùng mọi môn". Khi bạn đăng ký gói Pro hoặc VIP, bạn sẽ được tự động sử dụng tất cả các môn học mới khi ra mắt mà không phát sinh thêm chi phí.',
    },
  ]

  return (
    <section id="faq" className="px-4 sm:px-6 py-16 sm:py-20 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
          Giải đáp thắc mắc
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Câu hỏi thường gặp
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-zinc-200 hover:text-white"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Call to Action Banner ────────────────────────────────────────────────────────
function CtaBanner({ stats }: { stats: HubStats | null }) {
  const isLoggedIn = !!stats?.loggedIn

  return (
    <section className="px-4 sm:px-6 py-14 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <span>🇺🇸</span>
            <span>Bắt đầu ngay hôm nay</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Sẵn sàng nâng tầm Tiếng Anh Giọng Mỹ cùng AI?
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base mb-8 leading-relaxed">
            Học tập kiên nhẫn cùng gia sư AI thông minh 24/7. Khám phá ngay trải nghiệm song ngữ 2
            chiều độc đáo!
          </p>
          <a
            href={ENGLISH_APP_URL}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <span>{isLoggedIn ? 'Tiếp tục bài học' : 'Học Tiếng Anh miễn phí ngay'}</span>
            <span className="text-sm">🇺🇸</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────────
function Footer({ stats }: { stats: HubStats | null }) {
  const isLoggedIn = !!stats?.loggedIn

  return (
    <footer className="px-4 sm:px-6 py-12 bg-zinc-950 border-t border-zinc-800/80 text-zinc-500 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Đồng hành cùng bạn</span>
          </div>
          <p className="text-zinc-500 text-xs">
            Nền tảng học tập cùng Gia sư AI thông minh · donghanhcungban.org
          </p>
        </div>

        <div className="flex items-center gap-6 text-zinc-400 flex-wrap justify-center">
          <a href={ENGLISH_APP_URL} className="hover:text-emerald-400 transition">
            Học Tiếng Anh 🇺🇸
          </a>
          {isLoggedIn && (
            <a href={PROFILE_URL} className="hover:text-emerald-400 transition">
              Trang cá nhân
            </a>
          )}
          <a href="#subjects" className="hover:text-emerald-400 transition">
            Các môn học
          </a>
          <a href="#pricing" className="hover:text-emerald-400 transition">
            Bảng giá
          </a>
          <a
            href="mailto:donghanhcungban.org@gmail.com"
            className="hover:text-emerald-400 transition"
          >
            Liên hệ hỗ trợ
          </a>
        </div>

        <div className="text-center md:text-right text-zinc-500">
          <p>© 2026 Đồng Hành Cùng Bạn. All rights reserved.</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Phục vụ học sinh, sinh viên và người đi làm Việt Nam
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Root App Component ───────────────────────────────────────────────────────────
export default function App() {
  const stats = useHubStats()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar stats={stats} />
      <main className="flex-1">
        <Hero stats={stats} />
        <ActivitySection stats={stats} />
        <SubjectTabs />
        <WhyUsSection />
        <FeaturesSection />
        <PricingSection stats={stats} />
        <FaqSection />
        <CtaBanner stats={stats} />
      </main>
      <Footer stats={stats} />
    </div>
  )
}
