import { useState } from 'react'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import Layout from '../components/Layout'
import lessonsData from '../data/lessons.json'

// Cấu trúc 1 lượt nói trong bài học
interface Turn {
  speaker: 'A' | 'B'
  en: string
  vi: string
}

// Cấu trúc 1 bài học — khớp với dữ liệu trong src/data/lessons.json
interface Lesson {
  id: number
  title: string
  situation: string
  turns: Turn[]
}

const LESSONS = lessonsData as Lesson[]

export default function Lessons() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = LESSONS.find(l => l.id === selectedId) ?? null

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout
        title={selected ? selected.title : 'Bài học'}
        subtitle={selected ? selected.situation : `${LESSONS.length} bài học xoay quanh "tôi - I"`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!selected ? (
          // Danh sách bài học
          <div className="space-y-2">
            {LESSONS.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 text-left flex items-center gap-4 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {l.id}. {l.title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{l.situation}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
                  {l.turns.length / 2} đoạn hội thoại
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Chi tiết hội thoại của bài học
          <div>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-4 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Danh sách bài học
            </button>

            <div className="space-y-3">
              {selected.turns.map((t, i) => (
                <div
                  key={i}
                  className={`flex ${t.speaker === 'A' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      t.speaker === 'A'
                        ? 'bg-zinc-900 border border-zinc-800'
                        : 'bg-emerald-500/10 border border-emerald-500/30'
                    }`}
                  >
                    <p className="text-[10px] font-medium text-zinc-500 mb-1">
                      {t.speaker === 'A' ? 'Người A' : 'Người B'}
                    </p>
                    <p className="text-sm text-white leading-relaxed">{t.en}</p>
                    <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">{t.vi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
