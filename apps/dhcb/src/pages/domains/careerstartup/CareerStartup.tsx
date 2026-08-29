// apps/dhcb/src/pages/domains/careerstartup/CareerStartup.tsx
// Trụ GỘP "Sự nghiệp & Khởi nghiệp" (quyết định người dùng 2026-08-28).
//
// Vì sao gộp: hai trụ này trả lời cùng MỘT câu hỏi — "mình sống bằng nghề gì" — chỉ khác
// đường đi: làm thuê để tiến trong nghề, hay tự dựng việc của mình. Người dùng thường cân
// nhắc cả hai cùng lúc chứ không chọn dứt khoát một bên, nên tách làm hai trang buộc họ
// nhảy qua nhảy lại. Ở đây chúng đứng chung một trang, chuyển bằng tab.
//
// Làm theo đúng khuôn đã dùng cho trụ gộp "Công việc & Đời sống" (WorkLife.tsx): trang này
// KHÔNG viết lại nội dung hai trụ cũ — nó nhúng `<Career embedded />` và `<Startup embedded />`
// (chế độ nhúng: không dựng Layout riêng, không render h1 riêng) nên mọi tính năng, API và
// test sẵn có của hai trụ giữ nguyên hành vi.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, Rocket, ArrowRight } from 'lucide-react'
import Layout from '../../../components/Layout'
import Career from '../career/Career'
import Startup from '../startup/Startup'

type Tab = 'su-nghiep' | 'khoi-nghiep'

// Tab đang mở nằm trong query `?muc=` để chia sẻ/bookmark được đúng nửa mình đang xem,
// và để hai route cũ `/su-nghiep` `/khoi-nghiep` chuyển hướng sang đúng tab tương ứng.
function readTab(raw: string | null): Tab {
  return raw === 'khoi-nghiep' ? 'khoi-nghiep' : 'su-nghiep'
}

const TABS: {
  id: Tab
  label: string
  hint: string
  icon: typeof Briefcase
  gradient: string
}[] = [
  {
    id: 'su-nghiep',
    label: 'Sự nghiệp',
    hint: 'Hồ sơ nghề, mục tiêu, khoảng cách kỹ năng, phỏng vấn',
    icon: Briefcase,
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'khoi-nghiep',
    label: 'Khởi nghiệp',
    hint: 'Lean Canvas, bài toán thị trường, giả thuyết, bằng chứng',
    icon: Rocket,
    gradient: 'from-orange-500 to-rose-600',
  },
]

export default function CareerStartup() {
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(() => readTab(searchParams.get('muc')))

  function switchTab(next: Tab) {
    setTab(next)
    const params = new URLSearchParams(searchParams)
    params.set('muc', next)
    setSearchParams(params, { replace: true })
  }

  const active = TABS.find((t) => t.id === tab) ?? TABS[0]!

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Sự Nghiệp & Khởi Nghiệp" />

      {/* Banner tổng quan — gradient đổi theo tab đang mở, để người dùng thấy ngay đang ở
          "nửa" nào mà không cần đọc chữ. */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${active.gradient} opacity-15 transition-colors duration-500`}
          aria-hidden="true"
        />
        <div className="relative max-w-6xl w-full mx-auto px-4 pt-8 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Sự Nghiệp & Khởi Nghiệp
          </h1>
          <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed max-w-2xl">
            Cùng một câu hỏi — mình sống bằng nghề gì — chỉ khác đường đi: tiến trong nghề, hay tự
            dựng việc của mình. Hai nửa nằm chung một chỗ để bạn cân nhắc cả hai cùng lúc.
          </p>

          <div
            role="tablist"
            aria-label="Chọn nửa muốn xem"
            className="flex flex-col sm:flex-row gap-3 mt-6"
          >
            {TABS.map((t) => {
              const Icon = t.icon
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`careerstartup-tab-${t.id}`}
                  aria-selected={isActive}
                  aria-controls={`careerstartup-panel-${t.id}`}
                  onClick={() => switchTab(t.id)}
                  className={`tap-44 group flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${t.gradient} text-white shadow-lg shadow-black/30 scale-[1.01]`
                      : 'bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <span
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{t.label}</span>
                    <span
                      className={`block text-xs mt-0.5 truncate ${isActive ? 'text-white/85' : 'text-zinc-400'}`}
                    >
                      {t.hint}
                    </span>
                  </span>
                  <ArrowRight
                    className={`w-4 h-4 ml-auto shrink-0 transition-transform ${isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5'}`}
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        id={`careerstartup-panel-${tab}`}
        aria-labelledby={`careerstartup-tab-${tab}`}
        className="flex-1 flex flex-col"
      >
        {tab === 'su-nghiep' ? <Career embedded /> : <Startup embedded />}
      </div>
    </div>
  )
}
