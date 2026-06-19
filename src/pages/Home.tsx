import { useNavigate } from 'react-router-dom'
import { MessageCircle, PenLine, Mic, ChevronRight, Zap, Crown, BookOpen, GraduationCap } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, getUsage, getStreak } from '../lib/storage'
import { LIMITS } from '../types'

const MODES = [
  {
    path: '/chat',
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/20',
    ring: 'hover:border-emerald-500/40',
    tag: { label: 'Phổ biến', cls: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' },
    title: 'Chat với gia sư',
    desc: 'Trò chuyện tiếng Anh theo tình huống. AI sửa lỗi và giải thích bằng tiếng Việt ngay lập tức.',
  },
  {
    path: '/speaking',
    icon: Mic,
    gradient: 'from-sky-500 to-cyan-400',
    glow: 'shadow-sky-500/20',
    ring: 'hover:border-sky-500/40',
    tag: { label: 'Tính năng chính', cls: 'bg-sky-500/15 text-sky-300 border border-sky-500/20' },
    title: 'Luyện nói song ngữ',
    desc: 'Nói → AI nghe → trả lời bằng giọng tiếng Anh → sửa lỗi bằng giọng tiếng Việt.',
  },
  {
    path: '/writing',
    icon: PenLine,
    gradient: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/20',
    ring: 'hover:border-violet-500/40',
    tag: { label: 'IELTS', cls: 'bg-violet-500/15 text-violet-300 border border-violet-500/20' },
    title: 'Luyện viết & chấm điểm',
    desc: 'Nộp bài viết, AI chấm theo tiêu chí IELTS, chỉ lỗi và ước lượng band.',
  },
  {
    path: '/dictionary',
    icon: BookOpen,
    gradient: 'from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/20',
    ring: 'hover:border-amber-500/40',
    tag: { label: 'Không giới hạn', cls: 'bg-amber-500/15 text-amber-300 border border-amber-500/20' },
    title: 'Từ điển',
    desc: 'Tra hơn 7.400 từ tiếng Anh thông dụng: loại từ, nghĩa tiếng Việt, ví dụ minh họa.',
  },
  {
    path: '/lessons',
    icon: GraduationCap,
    gradient: 'from-rose-500 to-pink-400',
    glow: 'shadow-rose-500/20',
    ring: 'hover:border-rose-500/40',
    tag: { label: 'Không giới hạn', cls: 'bg-rose-500/15 text-rose-300 border border-rose-500/20' },
    title: 'Bài học',
    desc: 'Các bài hội thoại mẫu xoay quanh "tôi - I", mỗi bài 40 đoạn hội thoại song ngữ.',
  },
]

export default function Home() {
  const nav = useNavigate()
  const user = getCurrentUser()!
  const usage = getUsage(user.id)
  const limit = LIMITS[user.plan]
  const streak = getStreak(user.id)

  const usagePct = (used: number, max: number) => Math.min(100, Math.round(used / max * 100))
  const firstName = user.name.split(' ').at(-1) ?? user.name

  // Tiêu chí màu bar lượt dùng
  const barColor = (used: number, max: number) => {
    const pct = used / max
    if (pct >= 0.85) return 'bg-red-500'
    if (pct >= 0.6) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title={`Xin chào, ${firstName}`} back={false} />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Greeting + streak ─────────────────────────────────────────── */}
        <div className="mb-6 flex items-start justify-between animate-fade-in">
          <div>
            <p className="text-zinc-500 text-sm">Hôm nay luyện gì?</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 rounded-xl px-3 py-2 shrink-0">
              <span className="text-xl leading-none">🔥</span>
              <div className="leading-none">
                <p className="text-base font-bold text-orange-400">{streak}</p>
                <p className="text-[10px] text-orange-400/60 mt-0.5">ngày liên tiếp</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Usage card ────────────────────────────────────────────────── */}
        <div className={`mb-6 rounded-2xl p-4 border animate-fade-in delay-50 ${
          user.plan === 'pro'
            ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/30'
            : 'bg-zinc-900/80 border-zinc-800/80'
        }`}>
          <div className="flex items-center gap-3">
            {user.plan === 'pro'
              ? <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              : <Zap className="w-5 h-5 text-zinc-400 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{user.plan === 'pro' ? 'Gói Pro' : 'Gói Miễn phí'}</p>
              {user.plan === 'free' ? (
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: 'Chat', used: usage.chatCount, max: limit.chat },
                    { label: 'Nói', used: usage.speakingCount, max: limit.speaking },
                    { label: 'Viết', used: usage.writingCount, max: limit.writing },
                  ].map(({ label, used, max }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 w-8 shrink-0">{label}</span>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor(used, max)} rounded-full transition-all`}
                          style={{ width: `${usagePct(used, max)}%` }} />
                      </div>
                      <span className="text-[10px] text-zinc-500 w-10 text-right">{used}/{max}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 mt-0.5">Không giới hạn lượt dùng</p>
              )}
            </div>
            {user.plan === 'free' && (
              <div className="shrink-0 text-right">
                <span className="text-[10px] text-zinc-600 block">Làm mới lúc</span>
                <span className="text-xs text-zinc-500 font-medium">12:00 AM</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Mode cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {MODES.map((m, i) => {
            const Icon = m.icon
            return (
              <button key={m.path} onClick={() => nav(m.path)}
                className={`w-full bg-zinc-900/80 border border-zinc-800/80 ${m.ring} rounded-2xl p-4 text-left flex items-center gap-4 transition-all duration-200 group hover:bg-zinc-800/60 active:scale-[0.99] animate-fade-up`}
                style={{ animationDelay: `${100 + i * 60}ms` }}>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shrink-0 shadow-lg ${m.glow} transition-transform group-hover:scale-105`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-white text-[15px]">{m.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.tag.cls}`}>
                      {m.tag.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{m.desc}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-all group-hover:translate-x-0.5" />
              </button>
            )
          })}
        </div>

        {/* ── Tip ──────────────────────────────────────────────────────── */}
        <div className="mt-6 glass rounded-xl p-4 text-xs text-zinc-500 animate-fade-in delay-400">
          <strong className="text-zinc-400">💡 Mẹo:</strong>{' '}
          Bắt đầu với chế độ{' '}
          <strong className="text-emerald-400">Chat</strong> để làm quen.
          Khi tự tin hơn, chuyển sang{' '}
          <strong className="text-sky-400">Luyện nói</strong> để rèn phản xạ và phát âm.
        </div>
      </main>
    </div>
  )
}
