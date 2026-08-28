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
import { Briefcase, Rocket } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import Career from '../career/Career'
import Startup from '../startup/Startup'

type Tab = 'su-nghiep' | 'khoi-nghiep'

// Tab đang mở nằm trong query `?muc=` để chia sẻ/bookmark được đúng nửa mình đang xem,
// và để hai route cũ `/su-nghiep` `/khoi-nghiep` chuyển hướng sang đúng tab tương ứng.
function readTab(raw: string | null): Tab {
  return raw === 'khoi-nghiep' ? 'khoi-nghiep' : 'su-nghiep'
}

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

  const TABS: { id: Tab; label: string; hint: string; icon: typeof Briefcase }[] = [
    {
      id: 'su-nghiep',
      label: 'Sự nghiệp',
      hint: 'Hồ sơ nghề, mục tiêu, khoảng cách kỹ năng, phỏng vấn',
      icon: Briefcase,
    },
    {
      id: 'khoi-nghiep',
      label: 'Khởi nghiệp',
      hint: 'Lean Canvas, bài toán thị trường, giả thuyết, bằng chứng',
      icon: Rocket,
    },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Sự Nghiệp & Khởi Nghiệp" />

      <div className="max-w-6xl w-full mx-auto px-4 pt-6">
        <PageHeader
          title="Sự Nghiệp & Khởi Nghiệp"
          subtitle="Cùng một câu hỏi — mình sống bằng nghề gì — chỉ khác đường đi: tiến trong nghề, hay tự dựng việc của mình. Hai nửa nằm chung một chỗ để bạn cân nhắc cả hai cùng lúc."
        />

        <div
          role="tablist"
          aria-label="Chọn nửa muốn xem"
          className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3"
        >
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`careerstartup-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`careerstartup-panel-${t.id}`}
                onClick={() => switchTab(t.id)}
                className={`tap-44 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-accent-500 text-black shadow-sm'
                    : 'bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{t.label}</span>
                <span
                  className={`hidden sm:inline text-xs font-normal ${active ? 'text-black' : 'text-zinc-300'}`}
                >
                  · {t.hint}
                </span>
              </button>
            )
          })}
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
