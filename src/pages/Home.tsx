import { useNavigate } from 'react-router-dom'
import { MessageCircle, PenLine, Mic, ChevronRight, Zap, Crown } from 'lucide-react'
import Layout from '../components/Layout'
import { getCurrentUser, getUsage } from '../lib/storage'
import { LIMITS } from '../types'

const MODES = [
  {
    path: '/chat',
    icon: MessageCircle,
    color: 'emerald',
    title: 'Chat với gia sư',
    desc: 'Trò chuyện tiếng Anh theo tình huống. AI sửa lỗi và giải thích bằng tiếng Việt ngay lập tức.',
    tag: 'Phổ biến',
  },
  {
    path: '/speaking',
    icon: Mic,
    color: 'sky',
    title: 'Luyện nói song ngữ',
    desc: 'Nói → AI nghe → trả lời bằng giọng tiếng Anh → sửa lỗi bằng giọng tiếng Việt.',
    tag: 'Tính năng chính',
  },
  {
    path: '/writing',
    icon: PenLine,
    color: 'violet',
    title: 'Luyện viết & chấm điểm',
    desc: 'Nộp bài viết, AI chấm theo tiêu chí IELTS, chỉ lỗi và ước lượng band.',
    tag: 'IELTS',
  },
]

const colorMap: Record<string, { bg: string; text: string; ring: string; tag: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'hover:border-emerald-500/50', tag: 'bg-emerald-500/20 text-emerald-300' },
  sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-400',     ring: 'hover:border-sky-500/50',     tag: 'bg-sky-500/20 text-sky-300' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-400',  ring: 'hover:border-violet-500/50',  tag: 'bg-violet-500/20 text-violet-300' },
}

export default function Home() {
  const nav = useNavigate()
  const user = getCurrentUser()!
  const usage = getUsage(user.id)
  const limit = LIMITS[user.plan]

  const usagePct = (used: number, max: number) => Math.min(100, Math.round(used / max * 100))

  return (
    <div className="min-h-screen bg-zinc-950">
      <Layout title={`Xin chào, ${user.name} 👋`} back={false} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Gói hiện tại */}
        <div className={`mb-6 rounded-2xl p-4 flex items-center gap-3 ${user.plan === 'pro' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800'}`}>
          {user.plan === 'pro'
            ? <Crown className="w-5 h-5 text-amber-400 shrink-0" />
            : <Zap className="w-5 h-5 text-zinc-400 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{user.plan === 'pro' ? 'Gói Pro' : 'Gói Miễn phí'}</p>
            <p className="text-xs text-zinc-500">
              {user.plan === 'free' ? `Chat: ${usage.chatCount}/${limit.chat} · Nói: ${usage.speakingCount}/${limit.speaking} · Viết: ${usage.writingCount}/${limit.writing} hôm nay` : 'Không giới hạn lượt dùng'}
            </p>
          </div>
          {user.plan === 'free' && (
            <div className="shrink-0">
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${usagePct(usage.chatCount, limit.chat)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          {MODES.map(m => {
            const c = colorMap[m.color]
            const Icon = m.icon
            return (
              <button key={m.path} onClick={() => nav(m.path)}
                className={`w-full bg-zinc-900 border border-zinc-800 ${c.ring} rounded-2xl p-5 text-left flex items-center gap-4 transition group`}>
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{m.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.tag}`}>{m.tag}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{m.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition" />
              </button>
            )
          })}
        </div>

        {/* Tip */}
        <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-500">
          <strong className="text-zinc-400">Mẹo:</strong> Bắt đầu với chế độ <strong className="text-emerald-400">Chat</strong> để làm quen.
          Khi tự tin hơn, chuyển sang <strong className="text-sky-400">Luyện nói</strong> để luyện phát âm và phản xạ.
        </div>
      </main>
    </div>
  )
}
