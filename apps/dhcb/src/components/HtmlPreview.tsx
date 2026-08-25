// HtmlPreview — Khung XEM TRANG cho bài HTML/CSS của môn Lập trình (PR-L7c).
//
// Vì sao dùng được iframe ở đây trong khi bài JavaScript thì không: thuộc tính sandbox để
// RỖNG nghĩa là mọi quyền đều bị thu hồi — script KHÔNG chạy, form không gửi, không mở cửa
// sổ, không truy cập storage/cookie của trang cha (iframe mang origin ẩn danh). Trang chỉ
// được hiển thị. Không có script thì không có vòng lặp vô hạn, nên rủi ro treo trang mà bài
// JavaScript phải né bằng Web Worker ở đây KHÔNG tồn tại.
//
// Học viên vẫn có thể viết <script> vào bài — trình duyệt sẽ lặng lẽ không chạy nó. Đó là
// hành vi đúng cho hai unit này (U4 HTML, U5 CSS); bài DOM sẽ có cơ chế riêng.
interface Props {
  /** Mã HTML của học viên. */
  html: string
}

export function HtmlPreview({ html }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-400">
        Xem trang (script bị tắt trong khung này — chỉ hiển thị):
      </p>
      <iframe
        // sandbox="" = thu hồi TOÀN BỘ quyền. Đừng thêm allow-scripts vào đây.
        sandbox=""
        srcDoc={html}
        title="Xem trước trang web bạn vừa viết"
        className="w-full h-64 rounded-2xl border border-zinc-800 bg-white"
      />
    </div>
  )
}
