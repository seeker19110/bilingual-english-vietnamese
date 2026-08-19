// PageHeader — tiêu đề lớn của trang, đặt NGAY DƯỚI thanh AppHeader (Layout) trong phần
// nội dung. Tách khỏi thanh header để tiêu đề to, rõ, dễ đọc trên mobile.
// Dùng: đặt <PageHeader title=… subtitle=… /> ở đầu <main> của mỗi trang,
// và KHÔNG truyền title cho <Layout> nữa.

interface Props {
  title: string
  subtitle?: string
  className?: string
}

export default function PageHeader({ title, subtitle, className = '' }: Props) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-zinc-400 theme-light:text-zinc-600 mt-1.5 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  )
}
