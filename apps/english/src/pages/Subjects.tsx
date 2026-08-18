// apps/english/src/pages/Subjects.tsx — Multi-Subject Learning Hub (V2-12)
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  ChevronRight,
  GraduationCap,
  Layers,
  Sparkles,
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { listSubjects } from '../lib/subjectApi'
import type { SubjectManifest } from '../../../../packages/core-contracts/subjectManifest'

const SUBJECT_ICONS: Record<string, typeof BookOpen> = {
  english: BookOpen,
  mathematics: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
}

const SUBJECT_COLORS: Record<
  string,
  { gradient: string; glow: string; text: string; bg: string; border: string }
> = {
  english: {
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  mathematics: {
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30 hover:border-blue-500/60',
  },
  physics: {
    gradient: 'from-purple-500 to-indigo-400',
    glow: 'shadow-purple-500/20',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30 hover:border-purple-500/60',
  },
  chemistry: {
    gradient: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30 hover:border-amber-500/60',
  },
  biology: {
    gradient: 'from-rose-500 to-pink-400',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30 hover:border-rose-500/60',
  },
}

export default function Subjects() {
  const nav = useNavigate()
  const [subjects, setSubjects] = useState<SubjectManifest[]>([])
  const [filter, setFilter] = useState<'all' | 'language' | 'stem'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listSubjects(filter === 'all' ? undefined : filter)
      .then(setSubjects)
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/')} />

      <main className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Không Gian Môn Học & Gia Sư AI"
          subtitle="Học tập và giải bài tập tương tác đa môn cùng AI: Tiếng Anh, Toán học, Vật lý, Hóa học & Sinh học"
        />

        {/* Bộ lọc phân loại */}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`tap-44 px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Tất cả môn học
          </button>
          <button
            onClick={() => setFilter('language')}
            className={`tap-44 px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'language'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Ngôn ngữ (Language)
          </button>
          <button
            onClick={() => setFilter('stem')}
            className={`tap-44 px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === 'stem'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Khoa học & Kỹ thuật (STEM)
          </button>
        </div>

        {/* Banner dẫn vào Phòng Thí Nghiệm Mô Phỏng Ứng Dụng Thực Tế */}
        <div
          onClick={() => nav('/ung-dung-thuc-te')}
          className="p-5 rounded-2xl bg-gradient-to-r from-accent-600/20 via-blue-600/20 to-purple-600/20 border border-accent-500/40 hover:border-accent-500/80 cursor-pointer transition-all flex items-center justify-between group shadow-lg shadow-accent-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-accent-500/20 text-accent-400 group-hover:scale-110 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-accent-500/20 text-accent-300 font-bold">
                  MỚI: REAL-LIFE LAB
                </span>
                <span className="text-xs text-zinc-400">10 Simulators Tương Tác</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1 group-hover:text-accent-300 transition">
                Phòng Thí Nghiệm Mô Phỏng & Ứng Dụng Thực Tế
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                Xem ngay công thức Toán, Lý, Hóa, Sinh giải quyết bài toán tiền điện, lãi kép, giảm
                mỡ, vệ tinh GPS ra sao
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-accent-400 group-hover:translate-x-1 transition" />
        </div>

        {/* Danh sách thẻ môn học */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500 text-sm">Đang tải danh mục môn học…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => {
              const Icon = SUBJECT_ICONS[sub.id] || BookOpen
              const style = SUBJECT_COLORS[sub.id] || SUBJECT_COLORS.english!

              return (
                <div
                  key={sub.id}
                  className={`bg-zinc-900/80 rounded-2xl p-5 border transition-all flex flex-col justify-between group ${style.border}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shrink-0 shadow-md ${style.glow}`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-accent-300 transition-colors">
                            {sub.label}
                          </h3>
                          <span
                            className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium mt-0.5 uppercase ${
                              sub.category === 'language'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                                : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                            }`}
                          >
                            {sub.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {sub.taxonomyKind === 'cefr' ? 'Chuẩn CEFR' : 'Theo Khối Lớp'}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed mb-4">{sub.description}</p>

                    {/* Mức độ chuẩn hóa */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Cấp độ:</span>
                        <div className="flex gap-1 flex-wrap">
                          {sub.standardLevels.map((lvl) => (
                            <span
                              key={lvl}
                              className="px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800 text-[10px] uppercase font-mono"
                            >
                              {lvl.replace('grade_', 'Lớp ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Layers className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>Chế độ chấm:</span>
                        <span className="text-zinc-300">
                          {sub.evaluationModes.map((m) => m.replace('_', ' ')).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <button
                    onClick={() => {
                      if (sub.id === 'english') {
                        nav('/')
                      } else {
                        nav(`/subjects/${sub.id}`)
                      }
                    }}
                    className={`w-full mt-2 tap-44 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
                      sub.id === 'english'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                        : 'bg-accent-500 hover:bg-accent-400 text-white shadow-md shadow-accent-500/20'
                    }`}
                  >
                    <span>Vào phòng học AI</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
