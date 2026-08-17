// apps/english/src/components/chat/PresenceDot.tsx
// Small online/offline indicator with animated pulse when online

interface Props {
  online: boolean
  size?: 'sm' | 'md'
}

export default function PresenceDot({ online, size = 'sm' }: Props) {
  const dim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'

  if (!online) {
    return (
      <span
        className={`${dim} rounded-full bg-zinc-600 border-2 border-zinc-900 block shrink-0`}
        aria-label="Ngoại tuyến"
      />
    )
  }

  return (
    <span className={`relative ${dim} shrink-0 block`} aria-label="Trực tuyến">
      {/* Pulse ring */}
      <span
        className={`absolute inset-0 rounded-full bg-emerald-400/50 animate-ping`}
        aria-hidden
      />
      <span
        className={`relative ${dim} rounded-full bg-emerald-400 border-2 border-zinc-900 block`}
      />
    </span>
  )
}
