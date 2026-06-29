// Khối "xương" nhấp nháy hiển thị trong lúc chờ tải dữ liệu — đỡ cảm giác trống/đơ
// so với chỉ hiện chữ "Đang tải...". Dùng animation shimmer khai báo sẵn trong tailwind.config.
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-zinc-800/60 bg-[length:200%_100%] animate-shimmer ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(63,63,70,0) 0%, rgba(82,82,91,0.5) 50%, rgba(63,63,70,0) 100%)',
      }}
    />
  )
}

// Mẫu skeleton dạng danh sách thẻ — dùng cho trang chờ (lazy-load), lịch sử, từ điển...
export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4"
        >
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
