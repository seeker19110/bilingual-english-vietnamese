# 0238 — 2026-09-02 — Tầng desktop cho hai trang landing

PR: (điền khi tạo) · Nhánh: `claude/landing-desktop`

## Việc đã làm

Loạt thiết kế lại desktop (#815–#818) chỉ phủ các trang TRONG app (sau đăng nhập). Hai trang
landing công khai bị bỏ sót và vẫn là "mobile phóng to" — đo bằng ảnh chụp Playwright ở 1440px:
một cột `max-w-2xl` (~640px) nằm giữa màn hình với hai khoảng trống lớn hai bên. Đây lại đúng là
trang mà người CHƯA đăng ký nhìn thấy đầu tiên (điểm đến của link quảng cáo TikTok/Facebook/SEO).

Đã làm lại tầng desktop cho `apps/dhcb/src/pages/core/Landing.tsx` (chiều A, tiếng Việt) và
`LandingEn.tsx` (chiều B, tiếng Anh):

1. **Hero hai cột** — cột trái là tiêu đề + lời mời + nút CTA, cột phải là khối "Điểm khác biệt".
   Lý do đặt khối đó lên cột phải: nó là LÝ DO chọn sản phẩm này thay vì sản phẩm khác, nên phải
   đọc được cùng lúc với tiêu đề chứ không phải cuộn mới thấy.
2. **Ba chế độ luyện tập xếp NGANG** (`lg:grid-cols-3`) — ba chế độ là các lựa chọn ngang hàng
   nhau; xếp dọc làm chúng trông như ba bước nối tiếp.
3. **Hai khối cuối đứng cạnh nhau** (bản tiếng Việt) — "giới hạn lượt dùng" và "tiếng Anh chỉ là
   một môn" cùng là thông tin cần biết trước khi đăng ký, nên đọc một lượt.
4. Cỡ chữ tiêu đề lên `lg:text-5xl`, bề rộng khung lên `lg:max-w-6xl` (khớp bề rộng chuẩn app).

Kết quả đo: toàn bộ lời chào hàng nằm gọn trong khoảng một màn desktop thay vì phải cuộn qua
5 khối chồng dọc.

## Quyết định kèm theo

- **MỌI thay đổi nằm sau `lg:`** — dưới 1024px không đổi một pixel nào. Kiểm chứng bằng ảnh chụp
  390px trước/sau: giống hệt nhau.
- **Dùng lưới CSS, KHÔNG dựng hai nhánh DOM** — hero và khối "điểm khác biệt" vẫn là đúng hai
  phần tử, chỉ đổi cách xếp. Thứ tự đọc của trình đọc màn hình và thứ tự phím Tab giữ nguyên.
  (Trang này không dùng `useIsDesktopViewport` như các trang trong app vì không có nội dung nào
  bị LẶP giữa hai bố cục — bài học ở changelog `0199` nhắm vào ca lặp nội dung, không phải ca
  đổi hướng xếp của cùng một phần tử.)
- **Tiêu đề bản tiếng Anh nhỏ hơn một bậc ở `lg`** (`lg:text-4xl`, lên `5xl` từ `xl:`) — câu
  tiếng Anh dài hơn bản tiếng Việt nên ở `5xl` nó rớt chữ "AI" xuống một dòng riêng, nhìn như lỗi.
  Phát hiện bằng ảnh chụp, không phải bằng suy đoán.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm run format` ✅
- `npm test` ✅ — 537 file / 10.937 test
- `npm run build` ✅ — 214,09 kB JS · 38,59 kB CSS (cả hai KHÔNG đổi: thay đổi thuần class
  Tailwind, không thêm phần tử hay phụ thuộc nào)
- **Ảnh chụp thật** ở 1440px (cả hai trang) và 390px (kiểm mobile không đổi).
- Cổng a11y `e2e/a11y.spec.ts` + `a11y-aaa.spec.ts` do CI chạy: không đổi token màu nào nên
  tương phản giữ nguyên.
