export interface PresenceDotProps {
  online: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PresenceDot({ online, className = '', size = 'md' }: PresenceDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }[size]

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${sizeClasses} ${className}`}
      title={online ? 'Đang hoạt động' : 'Ngoại tuyến'}
      aria-label={online ? 'Đang hoạt động' : 'Ngoại tuyến'}
    >
      {online && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      )}
      <span
        className={`relative inline-flex rounded-full ${sizeClasses} ${
          online ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-zinc-500'
        }`}
      />
    </span>
  )
}
