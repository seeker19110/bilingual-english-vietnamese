# feat(location): thiết kế lại UI/UX trang `/nhom-di-chung` — PR #693 (2026-08-26) ✅

Giai đoạn 1 của "Đi chung" chạy đúng nghiệp vụ nhưng giao diện là bố cục "trang tài liệu cuộn
dọc" — sai với bối cảnh dùng thật (đang đi bộ ngoài đường, một tay cầm máy, nắng chói, vội).
Đợt này thiết kế lại theo nguyên tắc "liếc một giây là biết", **không đổi API/schema nào**.

- **Ba lỗi THẬT phát hiện khi rà, đã sửa:**
  1. 🔴 **Rớt tương phản AA ở CẢ 5 THEME.** Nút chính dùng `bg-accent-500` + chữ trắng, đo được
     2,54–3,53 so với sàn 4,5 (chữ trắng trên nền accent không bao giờ đạt). Đổi sang mực tối
     `text-[#09090b]` → 5,64–7,84. Quy ước này đã có sẵn trong dự án (`TwoFactorSection.tsx`),
     trang mới chỉ làm sai.
  2. 🔴 **BottomNav che mất nút cuối trang.** Trang dùng `pb-24` (96px) trong khi `--bnav-h`
     ≈ 140px — sai quy ước mà 38/41 trang khác đang theo. Đổi sang
     `pb-[calc(1.5rem+var(--bnav-h))]`.
  3. 🟡 Biểu tượng dùng `text-accent-400` rớt tương phản ở 3 theme nền sáng → thêm biến thể
     `theme-light:text-accent-700`.
- **Vì sao lỗi 1 lọt lưới:** cổng a11y chỉ quét 15 trang cố định, `/nhom-di-chung` không nằm
  trong đó — và giao diện đáng quét chỉ hiện SAU khi có dữ liệu chuyến từ backend. Đã bịt hẳn:
  thêm fixture dùng chung `e2e/helpers/location.ts` (chuyến dựng sẵn có điểm hẹn, người đi lạc,
  người tắt chia sẻ, tôi là chủ chuyến) rồi nối vào **cả hai cổng** — `a11y.spec.ts` (A/AA) và
  `a11y-aaa.spec.ts` (AAA nội dung) — **×5 theme = 10 test mới**. Đã kiểm chứng cổng KHÔNG rỗng:
  đặt lại chữ trắng như bản cũ thì cổng fail đúng `color-contrast (serious)`.
- **Thiết kế lại theo mức khẩn** (thay vì 6 thẻ giống hệt nhau xếp dọc): cảnh báo đi lạc → bản
  đồ lớn (45dvh, trước bị kẹp giữa trang) → ai đang ở đâu → nhóm giãn bao xa → cài đặt →
  rời/kết thúc.
- **Công tắc chia sẻ dính đáy màn hình** (`ShareToggle`, `sticky bottom-[var(--bnav-h)]`) — luôn
  trong tầm ngón cái, không phải cuộn đi tìm. Hai trạng thái khác nhau về **màu + biểu tượng +
  chữ** (không chỉ khác chữ), và luôn nói rõ ai đang thấy mình.
- **Màu định danh nối bản đồ với danh sách** (`memberColor.ts`): mỗi người một màu cố định suy
  ra từ `userId`, dùng chung cho chấm SVG trên bản đồ và avatar trong danh sách — nhìn chấm là
  biết ai, không phải bấm từng chấm đọc tên. 8 màu đều đã đo ≥ 7:1 với mực tối.
- **Bản đồ thôi giật về giữa.** Trước đây `fitBounds` chạy mỗi lần vị trí cập nhật (vài giây/lần)
  nên người đang kéo bản đồ xem đường bị kéo về liên tục. Nay chỉ tự canh khung khi người dùng
  chưa tự kéo, kèm nút "Canh lại cả nhóm".
- **Hành động phá huỷ phải xác nhận.** "Kết thúc chuyến cho cả nhóm" xoá vị trí của TẤT CẢ mọi
  người, trước đây chỉ một chạm và trông y hệt nút "Chép link mời" bên cạnh. Nay xác nhận hai
  bước + nhóm riêng viền cảnh báo.
- **Ma trận khoảng cách thôi bùng nổ.** Liệt kê mọi cặp tăng theo bình phương (10 người = 45
  dòng). Nay dẫn bằng MỘT con số (cặp xa nhau nhất = độ giãn của nhóm), phần còn lại gấp vào
  `<details>`.
- **Khác:** mời bạn qua Web Share API (mở thẳng Zalo/Messenger) thay vì chỉ chép clipboard, đưa
  lên đầu chuyến thay vì lẫn cuối trang · màn hình chưa có chuyến nêu 3 cam kết riêng tư và đặt
  "chuyến đang mở" lên trên cùng · form gửi được bằng Enter · khoá nút khi đang gọi mạng (chống
  bấm hai lần ra hai chuyến) · bỏ điểm hẹn được (trước chỉ đặt được, không gỡ được).
- **Ba lỗi NỮA lộ ra khi CI chạy cổng mới — đều ở code DÙNG CHUNG, đã sửa:** cổng mới đỏ ngay
  lần đầu với `button-name (critical, 18–30 phần tử)`. Tái hiện được ở máy bằng cách giả lập
  trình duyệt TỪ CHỐI quyền vị trí (đúng cảnh CI headless): **89 toast trong 3 giây**. Gốc rễ:
  1. `ToastProvider` tạo mới object `api` **mỗi lần render** (không `useMemo`) → giá trị context
     đổi tham chiếu liên tục → 6 trang đặt `toast` trong mảng phụ thuộc `useEffect` chạy lại
     theo. Với `LiveLocation` thành **vòng lặp vô hạn**: lỗi GPS → toast → effect chạy lại →
     gọi lại `watchPosition` → lỗi GPS → … (vừa ngập màn hình vừa ngốn pin — trái đúng cam kết
     tiết kiệm pin của chính tính năng).
  2. Nút đóng toast chỉ có icon, **không có tên đọc được** → vi phạm `button-name` mức critical
     trên TOÀN APP, chỉ chưa lộ vì chưa trang nào được quét lúc đang hiện toast.
  3. Chữ toast dùng sắc độ -300, **rớt AA ở 3 theme nền sáng** (1,38–1,52 so với sàn 4,5) →
     thêm biến thể `theme-light:text-*-800` (6,09–6,64).
- **Lỗi thứ tư, thuộc loại "im lặng không báo":** `apps/dhcb/tailwind.config.js` **không quét
  `packages/core-ui/`**, nên class Tailwind chỉ dùng ở đó KHÔNG được sinh ra — bản vá tương phản
  toast suýt vô tác dụng (`theme-light:text-red-800` đếm được 0 trong CSS build ra).
  `apps/hub/tailwind.config.js` vốn đã quét đường dẫn này; đã bổ sung cho `apps/dhcb` cho khớp.
- **Cổng canh thêm cho chính bốn lỗi trên:** 5 test nữa quét màn hình lúc **đang hiện toast lỗi
  GPS** (fixture giả lập geolocation tất định — `fixed` / `denied` — để không còn cảnh "xanh ở
  máy dev, đỏ trên CI").
- **Kiểm chứng (sau khi merge `main`):** 458 file / **6043 test xanh** · **282/282 test a11y**
  (cả hai cổng, 5 theme) · typecheck/lint/format sạch · 45 phép đo tương phản thủ công đều đạt ·
  ngân sách: Initial JS 123,93 kB / 140 kB, CSS 15,85 kB / 18 kB.
