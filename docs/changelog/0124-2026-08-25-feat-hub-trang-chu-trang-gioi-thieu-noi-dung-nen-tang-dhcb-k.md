# feat(hub): trang chủ + trang giới thiệu nói đúng "nền tảng DHCB", không còn đóng khung thành app tiếng Anh (2026-08-25)

Người dùng chỉ ra: **trang chủ là tổng hợp của DHCB, không phải của môn tiếng Anh** — và yêu
cầu rà lại cả các trang con. Trước đợt này, `apps/hub` (landing tại domain gốc) quảng bá gần
như 100% môn tiếng Anh (hero "Gia sư AI… Tiếng Anh Giọng Mỹ", 6 "điểm khác biệt" đều là tính
năng môn Anh, FAQ chỉ hỏi về giọng Mỹ), tức là mâu thuẫn trực tiếp với tầm nhìn đã chốt ở
`docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md`.

Đã sửa:

- **`apps/hub/src/App.tsx` — viết lại kiến trúc thông tin của trang chủ.** Thứ tự mục mới:
  Hero (nền tảng, 5 trụ) → dải "nền tảng hiện có gì" → **Năm trụ** (Học tập · Sự nghiệp ·
  Công việc · Khởi nghiệp · Đời sống, mỗi trụ một thẻ + thẻ thứ 6 là Companion) → **Bạn Đồng
  Hành** (6 cam kết dịch từ 8 luật hành xử SDT) → **Môn học** (tab: Tiếng Anh và Lập trình
  "học được", 4 môn STEM "đang xây") → Cách hoạt động 3 bước → Bảng giá "một tài khoản cho cả
  nền tảng" → Hỏi đáp cấp nền tảng → CTA → Footer 3 cột. Mục "6 điểm khác biệt" và "tính năng
  AI chuyên sâu" cũ (thuần môn Anh) bị bỏ, phần còn giá trị gộp vào tab môn Tiếng Anh.
- **Chỉ quảng cáo thứ có thật.** Mọi liên kết trụ/môn trỏ route CÓ THẬT trong
  `apps/dhcb/src/App.tsx` (`/mon-hoc`, `/su-nghiep`, `/cong-viec`, `/khoi-nghiep`,
  `/cuoc-song`, `/ban-dong-hanh`, `/hoc-tieng-anh`, `/lap-trinh`, `/bat-dau`); trạng thái môn
  bám `subjectRegistry` (core-learner). Môn chưa mở ghi thẳng "đang xây", không hứa trước.
- **Ngôn ngữ theo tư thế đồng hành.** FAQ trả lời thẳng câu "đây có phải app học tiếng Anh
  không"; không xếp loại/so sánh người dùng, không bảng điểm năng lực trên trang chủ (luật số
  1 của sản phẩm), CTA mở đầu là "vài câu hỏi ~90 giây" chứ không phải bài kiểm tra đầu vào.
- **Trang con đã rà cùng đợt:** `apps/hub/src/pages/HubLogin.tsx` ("cổng SSO" → "một tài khoản
  cho cả nền tảng", nút "Tiếp tục vào môn học" → "vào nền tảng"); `apps/dhcb/src/pages/core/
About.tsx` (`/gioi-thieu`) đổi tiêu đề thành "Giới thiệu nền tảng" và **thêm mục 5 trụ +
  Companion đặt TRƯỚC** phần môn Anh; `Landing.tsx` (`/welcome`) và `LandingEn.tsx`
  (`/learn-vietnamese`) giữ nguyên thông điệp quảng cáo theo từ khoá nhưng gắn nhãn "một môn
  của nền tảng" + mục dẫn sang phần còn lại.
- **SEO:** `apps/hub/index.html` và `apps/dhcb/index.html` đổi title/description/OG/Twitter và
  JSON-LD `WebApplication` sang mô tả cấp nền tảng; giữ nguyên schema `Course` của lộ trình
  CEFR (vẫn đúng, chỉ là một môn).
- **Biến môi trường:** thêm `VITE_APP_URL` (tên đúng vai trò) cho hub, **vẫn đọc
  `VITE_ENGLISH_APP_URL` làm dự phòng** nên không phải sửa `.env` trên VPS ngay.
- **Tương phản (a11y):** đã rà `packages/core-ui/theme.css` — token `--z-400`/`--z-500` vốn
  đã được chỉnh sẵn để `text-zinc-400` đạt AAA 7:1 và `text-zinc-500` đạt AA 4.5:1 trên mọi
  bề mặt thật, nên **chữ xám cũ KHÔNG hề vi phạm**; việc nâng lên `zinc-300` chỉ là chọn
  sáng hơn cho dễ đọc, không phải vá lỗi. Vấn đề THẬT là ở màu nhấn: `--a-*` **không đảo**
  theo theme (khác `--z-*`), nên mọi chữ màu nhấn bắt buộc có cặp
  `theme-light:text-accent-800/900` — thiếu là hỏng tương phản ở 3 theme nền sáng; đã rà đủ.
  Cũng đã xoá các class chết `accent-950` (thang accent của hub chỉ tới 900 — class cũ không
  sinh CSS nên nền coi như trong suốt).

**Còn mở:** hub chưa nằm trong cổng e2e a11y (`e2e/a11y*.spec.ts` chỉ quét 15 route của
`apps/dhcb`) — nên đợt này kiểm tương phản bằng cách rà token thủ công. Nên thêm hub vào bộ
quét a11y ở một PR riêng.
