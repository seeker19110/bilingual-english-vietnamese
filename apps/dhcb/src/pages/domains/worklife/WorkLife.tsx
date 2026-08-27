// apps/dhcb/src/pages/domains/worklife/WorkLife.tsx
// Trụ GỘP "Công việc & Đời sống" (quyết định người dùng 2026-08-25).
//
// Vì sao gộp: việc hằng ngày và đời sống là MỘT guồng — thời gian dồn cho việc thì lấy đi
// của sức khoẻ, quan hệ, thói quen, và ngược lại. Tách làm hai trụ khiến người dùng phải
// tự ghép hai bức tranh vốn là một. Ở đây chúng đứng chung một trang, chuyển qua lại bằng
// tab, và dùng CHUNG một schema dữ liệu `worklife` (migration 0066).
//
// Trang này KHÔNG viết lại nội dung hai trụ cũ — nó nhúng `<Work embedded />` và
// `<Life embedded />` (chế độ nhúng: không dựng Layout riêng, không render h1 riêng) nên
// mọi tính năng, API và test sẵn có của hai trụ giữ nguyên hành vi.
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, HeartHandshake } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import Work from '../work/Work'
import Life from '../life/Life'

type Tab = 'cong-viec' | 'doi-song'

// Tab đang mở nằm trong query `?muc=` để chia sẻ/bookmark được đúng nửa mình đang xem,
// và để hai route cũ `/cong-viec` `/cuoc-song` chuyển hướng sang đúng tab tương ứng.
function readTab(raw: string | null): Tab {
  return raw === 'doi-song' ? 'doi-song' : 'cong-viec'
}

export default function WorkLife() {
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
      id: 'cong-viec',
      label: 'Công việc',
      hint: 'Dự án, việc cần làm, cuộc họp, tài liệu',
      icon: Briefcase,
    },
    {
      id: 'doi-song',
      label: 'Đời sống',
      hint: 'Thói quen, tâm trạng, kế hoạch, cột mốc',
      icon: HeartHandshake,
    },
  ]

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Công Việc & Đời Sống" />

      <div className="max-w-6xl w-full mx-auto px-4 pt-6">
        <PageHeader
          title="Công Việc & Đời Sống"
          subtitle="Một guồng, không phải hai: thời gian dồn cho việc thì lấy đi của sức khoẻ, quan hệ và thói quen — nên hai nửa này nằm chung một chỗ để bạn thấy cả hai cùng lúc."
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
                id={`worklife-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`worklife-panel-${t.id}`}
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
        id={`worklife-panel-${tab}`}
        aria-labelledby={`worklife-tab-${tab}`}
        className="flex-1 flex flex-col"
      >
        {tab === 'cong-viec' ? <Work embedded /> : <Life embedded />}
      </div>
    </div>
  )
}
