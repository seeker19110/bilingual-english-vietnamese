import { useState } from 'react'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import Layout from '../components/Layout'
import { getDirection } from '../lib/storage'
import lessonsData from '../data/lessons.json'
import type { Direction } from '../types'

interface Turn {
  speaker: 'A' | 'B'
  en: string
  vi: string
}

interface Lesson {
  id: number
  title: string
  situation: string
  turns: Turn[]
}

const LESSONS = lessonsData as Lesson[]

export default function Lessons() {
  const dir: Direction = getDirection()
  const isA = dir === 'A'

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = LESSONS.find(l => l.id === selectedId) ?? null

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout
        title={selected ? selected.title : (isA ? 'Bài học' : 'Lessons')}
        subtitle={selected
          ? selected.situation
          : `${LESSONS.length} ${isA ? 'bài học xoay quanh "tôi - I"' : 'lessons focused on "I / tôi"'}`}
      />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {!selected ? (
          <div className="space-y-2">
            {LESSONS.map(l => (
              <button key={l.id} onClick={() => setSelectedId(l.id)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 text-left flex items-center gap-4 transition group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{l.id}. {l.title}</p>
                  <p className="text-xs text-zinc-500 truncate">{l.situation}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
                  {l.turns.length / 2} {isA ? 'đoạn hội thoại' : 'exchanges'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedId(null)}
              className="mb-4 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              {isA ? 'Danh sách bài học' : 'Back to lessons'}
            </button>

            {/* Ghi chú hiển thị — chiều A: EN chính + VI phụ | chiều B: VI chính + EN phụ */}
            <p className="text-xs text-zinc-600 mb-3">
              {isA
                ? '🔵 Chính = tiếng Anh · xám = dịch tiếng Việt'
                : '🔵 Primary = Vietnamese · gray = English translation'}
            </p>

            <div className="space-y-3">
              {selected.turns.map((t, i) => (
                <div key={i} className={`flex ${t.speaker === 'A' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                    t.speaker === 'A'
                      ? 'bg-zinc-900 border border-zinc-800'
                      : 'bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    <p className="text-[10px] font-medium text-zinc-500 mb-1">
                      {t.speaker === 'A' ? (isA ? 'Người A' : 'Person A') : (isA ? 'Người B' : 'Person B')}
                    </p>
                    {/* Chiều A: EN là ngôn ngữ đích (chính) + VI là dịch */}
                    {/* Chiều B: VI là ngôn ngữ đích (chính) + EN là dịch */}
                    <p className="text-sm text-white leading-relaxed">
                      {isA ? t.en : t.vi}
                    </p>
                    <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">
                      {isA ? t.vi : t.en}
                    </p>
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
