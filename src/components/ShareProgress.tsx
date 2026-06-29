import { useState } from 'react'
import { X, Share2, Copy, Check } from 'lucide-react'
import { getStreak } from '../lib/storage'
import { getLearnedCount } from '../lib/vocab'

interface Props {
  userId: string
  isA: boolean
  onClose: () => void
}

// Modal chia sẻ tiến độ học tập — dùng Web Share API hoặc copy text
export default function ShareProgress({ userId, isA, onClose }: Props) {
  const streak = getStreak(userId)
  const learned = getLearnedCount(userId)
  const [copied, setCopied] = useState(false)

  const shareText = isA
    ? `🇻🇳→🇺🇸 Tôi đang học tiếng Anh với AI Gia sư!\n📚 Đã học: ${learned} từ\n🔥 Streak: ${streak} ngày liên tiếp\n👉 ${window.location.origin}`
    : `🇺🇸→🇻🇳 I'm learning Vietnamese with AI Tutor!\n📚 Words learned: ${learned}\n🔥 Streak: ${streak} days\n👉 ${window.location.origin}`

  async function doShare() {
    if (navigator.share) {
      await navigator.share({ text: shareText }).catch(() => {})
    } else {
      copyText()
    }
  }

  function copyText() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const statCards = [
    {
      emoji: '📚',
      value: learned,
      label: isA ? 'từ đã học' : 'words learned',
      color: 'text-accent-400',
    },
    {
      emoji: '🔥',
      value: streak,
      label: isA ? 'ngày streak' : 'day streak',
      color: 'text-orange-400',
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">
            {isA ? 'Chia sẻ tiến độ' : 'Share Progress'}
          </h2>
          <button
            onClick={onClose}
            aria-label={isA ? 'Đóng' : 'Close'}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Card xem trước */}
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-5 mb-5 border border-zinc-700/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎓</span>
            <div>
              <p className="text-sm font-semibold text-white">
                {isA ? 'AI Gia sư tiếng Anh' : 'AI Vietnamese Tutor'}
              </p>
              <p className="text-xs text-zinc-400">{window.location.hostname}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statCards.map((s) => (
              <div key={s.label} className="bg-zinc-900/60 rounded-xl p-3 text-center">
                <p className="text-2xl">{s.emoji}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-400 text-center mt-3">
            {isA ? 'Học tiếng Anh mỗi ngày' : 'Learning Vietnamese every day'} 💪
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3">
          <button
            onClick={copyText}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-accent-400" /> : <Copy className="w-4 h-4" />}
            {copied ? (isA ? 'Đã sao chép!' : 'Copied!') : isA ? 'Sao chép' : 'Copy'}
          </button>
          {'share' in navigator && (
            <button
              onClick={doShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 text-black text-sm font-semibold transition"
            >
              <Share2 className="w-4 h-4" />
              {isA ? 'Chia sẻ' : 'Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
