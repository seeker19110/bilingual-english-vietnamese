import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Briefcase, GraduationCap, MessageCircle, ChevronRight, Check } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { saveOnboarding } from '../lib/cloud'

type OnboardLevel = 'beginner' | 'intermediate' | 'advanced'
type OnboardGoal  = 'daily' | 'travel' | 'work' | 'ielts'

const LEVELS: { value: OnboardLevel; emoji: string; label: string; desc: string }[] = [
  { value: 'beginner',     emoji: '🌱', label: 'Cơ bản',    desc: 'A1–A2 · Mới bắt đầu, biết ít từ' },
  { value: 'intermediate', emoji: '🌿', label: 'Trung cấp', desc: 'B1–B2 · Giao tiếp được hàng ngày' },
  { value: 'advanced',     emoji: '🌳', label: 'Nâng cao',  desc: 'C1+ · Muốn nói lưu loát, tự nhiên' },
]

const GOALS: { value: OnboardGoal; Icon: React.FC<{ className?: string }>; label: string; desc: string; color: string }[] = [
  { value: 'daily',  Icon: MessageCircle, label: 'Giao tiếp hàng ngày', desc: 'Chat, mua sắm, xã giao', color: 'emerald' },
  { value: 'travel', Icon: Plane,         label: 'Du lịch',              desc: 'Khách sạn, nhà hàng, chỉ đường', color: 'sky' },
  { value: 'work',   Icon: Briefcase,     label: 'Công việc',            desc: 'Họp, email, thuyết trình', color: 'violet' },
  { value: 'ielts',  Icon: GraduationCap, label: 'Luyện IELTS',          desc: 'Viết luận, đọc, nghe, nói', color: 'amber' },
]

const MINUTES = [5, 10, 20, 30] as const

export default function Onboarding() {
  const nav = useNavigate()
  const { user, refresh } = useAuth()
  const [step, setStep]       = useState(0)
  const [level, setLevel]     = useState<OnboardLevel>('beginner')
  const [goal, setGoal]       = useState<OnboardGoal>('daily')
  const [minutes, setMinutes] = useState<number>(10)
  const [saving, setSaving]   = useState(false)

  async function finish() {
    if (!user) return
    setSaving(true)
    await saveOnboarding(user.id, { level, goal, dailyMinutes: minutes })
    await refresh()
    nav('/', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center px-4 py-8">

      {/* Thanh tiến trình */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-accent-500' : 'bg-zinc-800'}`} />
          ))}
        </div>
        <p className="text-xs text-zinc-400 mt-2">Bước {step + 1} / 3</p>
      </div>

      {/* Bước 0: Trình độ */}
      {step === 0 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-1">Trình độ của bạn?</h1>
          <p className="text-zinc-400 text-sm mb-6">AI sẽ điều chỉnh độ khó phù hợp.</p>
          <div className="space-y-3">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  level === l.value
                    ? 'bg-accent-500/15 border-accent-500/50 text-white'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}>
                <span className="text-2xl">{l.emoji}</span>
                <div className="text-left flex-1">
                  <p className="font-semibold text-[15px]">{l.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{l.desc}</p>
                </div>
                {level === l.value && <Check className="w-4 h-4 text-accent-400 shrink-0" />}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)}
            className="mt-6 w-full bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition">
            Tiếp theo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bước 1: Mục tiêu */}
      {step === 1 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-1">Bạn học tiếng Anh để?</h1>
          <p className="text-zinc-400 text-sm mb-6">AI sẽ ưu tiên chủ đề và tình huống phù hợp.</p>
          <div className="space-y-3">
            {GOALS.map(g => {
              const Icon = g.Icon
              const active = goal === g.value
              const colors: Record<string, string> = {
                emerald: 'bg-accent-500/15 border-accent-500/50',
                sky:     'bg-sky-500/15 border-sky-500/50',
                violet:  'bg-violet-500/15 border-violet-500/50',
                amber:   'bg-amber-500/15 border-amber-500/50',
              }
              const iconColors: Record<string, string> = {
                emerald: 'text-accent-400',
                sky:     'text-sky-400',
                violet:  'text-violet-400',
                amber:   'text-amber-400',
              }
              return (
                <button key={g.value} onClick={() => setGoal(g.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    active ? colors[g.color] : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}>
                  <Icon className={`w-5 h-5 shrink-0 ${active ? iconColors[g.color] : 'text-zinc-400'}`} />
                  <div className="text-left flex-1">
                    <p className={`font-semibold text-[15px] ${active ? 'text-white' : 'text-zinc-400'}`}>{g.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{g.desc}</p>
                  </div>
                  {active && <Check className={`w-4 h-4 shrink-0 ${iconColors[g.color]}`} />}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(0)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition">
              Quay lại
            </button>
            <button onClick={() => setStep(2)}
              className="flex-1 bg-accent-500 hover:bg-accent-400 text-black font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition">
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bước 2: Thời gian */}
      {step === 2 && (
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-1">Học bao nhiêu phút mỗi ngày?</h1>
          <p className="text-zinc-400 text-sm mb-6">Mục tiêu nhỏ vừa thôi — quan trọng là đều đặn.</p>
          <div className="grid grid-cols-2 gap-3">
            {MINUTES.map(m => (
              <button key={m} onClick={() => setMinutes(m)}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  minutes === m
                    ? 'bg-accent-500/15 border-accent-500/50 text-white'
                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}>
                <p className="text-3xl font-bold">{m}</p>
                <p className="text-xs text-zinc-400 mt-1">phút / ngày</p>
                {m === 10 && <p className="text-[11px] text-accent-400 mt-1">Phổ biến nhất</p>}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition">
              Quay lại
            </button>
            <button onClick={finish} disabled={saving}
              className="flex-1 bg-accent-500 hover:bg-accent-400 disabled:opacity-60 text-black font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition">
              {saving ? 'Đang lưu...' : 'Bắt đầu học! 🚀'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
