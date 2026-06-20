import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { POS_LIST } from '../lib/pos'

// Trang giải thích "loại từ" (parts of speech): Danh từ, Động từ, Tính từ...
// Mỗi mục có id = mã pos (vd id="n") để các trang khác (Từ điển) có thể
// gắn link kiểu /parts-of-speech#n và nhảy thẳng tới đúng phần.
export default function PartsOfSpeech() {
  const location = useLocation()

  // Khi vào trang bằng link có #n, #v..., tự cuộn tới đúng mục đó.
  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const activeCode = location.hash.slice(1)

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title="Từ loại" subtitle="Danh từ, động từ, tính từ là gì?" />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Giới thiệu ngắn */}
        <div className="glass rounded-xl p-4 mb-4 animate-fade-in">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <strong className="text-white">Loại từ</strong> (từ loại) là cách phân nhóm các từ
            theo vai trò của chúng trong câu. Biết một từ thuộc loại nào giúp bạn dùng đúng vị
            trí trong câu và ghép câu chính xác hơn.
          </p>
        </div>

        {/* Danh sách các loại từ */}
        <div className="space-y-3">
          {POS_LIST.map(p => (
            <section
              key={p.code}
              id={p.code}
              className={`glass rounded-xl p-4 scroll-mt-20 transition ${
                activeCode === p.code ? 'ring-2 ring-emerald-500/60' : ''
              }`}
            >
              {/* Tên loại từ + badge màu khớp với Từ điển */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="font-bold text-white text-base">{p.label}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.color}`}>
                  {p.labelEn}
                </span>
              </div>

              {/* Định nghĩa */}
              <p className="text-sm text-zinc-300 leading-relaxed mb-3">{p.definition}</p>

              {/* Ví dụ điển hình */}
              <div className="space-y-1.5">
                {p.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm pl-3 border-l-2 border-zinc-700">
                    <span className="text-zinc-200 italic">{ex.en}</span>
                    <span className="text-zinc-500">—</span>
                    <span className="text-zinc-400">{ex.vi}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
