// ProgrammingSpecializations — DANH SÁCH 12 HƯỚNG CHUYÊN SÂU của môn Lập trình (`/lap-trinh/huong`).
//
// Vì sao có trang này: P1–P5 là xương sống chung, học xong ai cũng "lập trình được". Nhưng
// "chuyên gia" thì không có đường chung — người làm web, người làm nhúng, người làm hệ thống đi
// ba con đường khác hẳn. Trang này bày ra đủ 12 con đường để học viên chọn CÓ THÔNG TIN, thay vì
// chọn theo lời đồn trên mạng.
//
// Nguyên tắc trình bày (luật số 1 của sản phẩm): đây là CÔNG CỤ CHỌN VIỆC, không phải bảng xếp
// hạng người. Không hướng nào được gắn nhãn "xịn hơn"; mỗi thẻ nói rõ hợp với ai và cần bậc nào.
import { useNavigate } from 'react-router-dom'
import { Compass, Clock, Lock, ArrowRight, Boxes, Layers } from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import {
  PROGRAMMING_SPECIALIZATIONS,
  productSpecializations,
  crossCuttingSpecializations,
  countArchitectureItems,
  type ProgrammingSpecialization,
} from '@dhcb/subject-programming/specializations/registry'

function SpecCard({ spec, onOpen }: { spec: ProgrammingSpecialization; onOpen: () => void }) {
  return (
    <li>
      <button
        onClick={onOpen}
        className="tap-44 w-full h-full text-left rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 hover:border-accent-500/60 transition active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-white leading-snug">{spec.name}</h2>
          <ArrowRight className="w-4 h-4 text-accent-400 shrink-0 mt-1" aria-hidden="true" />
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">{spec.tagline}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
            <Lock className="w-3 h-3" aria-hidden="true" />
            Cần xong bậc {spec.prerequisite.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {spec.duration}
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-zinc-200">Ngôn ngữ chính:</span>{' '}
          {spec.languages.join(' · ')}
        </p>
        <p className="text-xs text-zinc-300 leading-relaxed flex items-center gap-1.5">
          <Boxes className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>
            Bản đồ kiến trúc: {spec.architecture.modules.length} module ·{' '}
            {countArchitectureItems(spec)} mục
          </span>
        </p>
      </button>
    </li>
  )
}

export default function ProgrammingSpecializations() {
  const nav = useNavigate()

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Layout onBack={() => nav('/lap-trinh')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Hướng chuyên sâu"
          subtitle={`Xong xương sống P1–P5 là bạn lập trình được. Muốn đi tới mức chuyên gia thì phải chọn một con đường — dưới đây là ${PROGRAMMING_SPECIALIZATIONS.length} con đường thật của nghề, mỗi con đường 4 chặng, 5 sản phẩm phải nộp và một bản đồ kiến trúc riêng.`}
        />

        <section className="rounded-3xl border border-accent-500/40 bg-zinc-900 p-5 space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-400" aria-hidden="true" />
            <span>Chọn thế nào cho đỡ hối hận</span>
          </h2>
          <ul className="text-sm text-zinc-200 leading-relaxed space-y-1.5 list-disc pl-5">
            <li>
              Chọn theo <strong>sản phẩm bạn muốn làm ra</strong>, không theo mức lương người ta
              đồn.
            </li>
            <li>
              Đọc mục <em>&ldquo;hợp với ai&rdquo;</em> và mục <em>&ldquo;bẫy thường gặp&rdquo;</em>{' '}
              của hướng trước khi quyết.
            </li>
            <li>
              Đi <strong>một hướng chính</strong> tới hết chặng 3 rồi hẵng mở hướng thứ hai. Riêng{' '}
              <strong>Kiến trúc</strong> và <strong>Thuật toán</strong> là hướng nền — học song
              song, không thay thế.
            </li>
            <li>
              Mỗi hướng có phần <strong>&ldquo;Kiến trúc &amp; module&rdquo;</strong> riêng: module
              nào, hợp đồng gì, quyết định nào phải chốt sớm, ngưỡng phi chức năng nào. Đọc phần đó
              nếu việc của bạn là <em>đặc tả cho người khác (hoặc AI) code</em>.
            </li>
            <li>Đổi hướng giữa chừng không mất gì: chặng 1 của hướng nào cũng dùng lại nền cũ.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-400" aria-hidden="true" />
            <span>Hướng sản phẩm — chọn MỘT làm hướng chính</span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productSpecializations().map((spec) => (
              <SpecCard
                key={spec.id}
                spec={spec}
                onOpen={() => nav(`/lap-trinh/huong/${spec.id}`)}
              />
            ))}
          </ul>
        </section>

        {/* Hai hướng NỀN tách riêng: gộp chung danh sách trên khiến người học tưởng phải chọn
            một trong 13, trong khi hai hướng này học SONG SONG với hướng chính. */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-accent-400" aria-hidden="true" />
            <span>Hướng nền — học SONG SONG, không thay hướng chính</span>
          </h2>
          <p className="text-sm text-zinc-200 leading-relaxed">
            Hai hướng này cắt ngang mọi hướng trên. Đặc biệt{' '}
            <strong>Kiến trúc hệ thống &amp; Đặc tả</strong> là hướng dành cho người sẽ quyết định
            và viết đặc tả để người khác — hoặc AI — thi hành, thay vì tự gõ từng dòng.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {crossCuttingSpecializations().map((spec) => (
              <SpecCard
                key={spec.id}
                spec={spec}
                onOpen={() => nav(`/lap-trinh/huong/${spec.id}`)}
              />
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
