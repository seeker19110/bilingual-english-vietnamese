// CodeSurface — bề mặt "Bảng đen" của môn Lập trình (đặc tả UI/UX §4.1, PR-UX2).
//
// Luật N2: code là nhân vật chính, không phải minh hoạ. Mọi khối code TĨNH (ví dụ mẫu, đoạn
// code của bước Dự đoán) đi qua đây để có cùng một hình dạng: nền tối CỐ ĐỊNH ở mọi theme
// như mọi IDE quen thuộc, cuộn ngang riêng, không bao giờ xuống dòng giữa chừng làm sai thụt lề.
//
// Nền tối cố định `#0a0a0a` là quyết định đã có tiền lệ ở CodeEditor — giữ nguyên để hai thứ
// không lệch nhau khi người dùng đổi theme.
interface Props {
  code: string
  /** `wrap`: cho xuống dòng — dùng cho OUTPUT (dòng lỗi dài), không dùng cho code nguồn. */
  wrap?: boolean
  className?: string
}

export default function CodeSurface({ code, wrap = false, className = '' }: Props) {
  // Vùng cuộn ngang phải bấm Tab tới được và cuộn bằng bàn phím (WCAG 2.1.1 Keyboard) —
  // chỉ khi thật sự có thanh cuộn (chế độ `wrap` xuống dòng thì không).
  const scrollable = !wrap
  return (
    <pre
      // Chữ sáng CỐ ĐỊNH: nền #0a0a0a không đổi theo theme, mà token `zinc-100` lại bị
      // đảo thành màu TỐI ở các theme nền sáng → chữ tối trên nền tối, không đọc được.
      className={`rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-4 text-sm font-mono text-[#e4e4e7] ${
        wrap ? 'whitespace-pre-wrap' : 'overflow-x-auto whitespace-pre'
      } ${className}`}
      {...(scrollable
        ? { tabIndex: 0, role: 'region', 'aria-label': 'Đoạn code — cuộn ngang để xem hết' }
        : {})}
    >
      {code}
    </pre>
  )
}
