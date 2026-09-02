# 0242 — 2026-09-02 — Lịch hoạt động dùng hết bề ngang desktop, badge đếm đạt AA

PR: #825 · Nhánh: `claude/modern-ui-redesign-jull9n`

## Bối cảnh

Đợt 4 của loạt nâng giao diện desktop. Khác ba đợt trước (đi theo danh sách điểm yếu đã khảo
sát), đợt này bắt đầu bằng việc **mở app ra nhìn**: chụp trang Tiến độ và Trang chủ ở 1440px
rồi soi. Hai thứ lộ ra — một lỗi bố cục thấy bằng mắt, một lỗi tương phản chỉ lộ khi đo.

## 1. Lịch hoạt động: đổi trục, dùng hết bề ngang

Thẻ "Lịch hoạt động" trải hết bề ngang (~776px) nhưng lưới ngày chỉ chiếm ~390px — **nửa phải
của thẻ bỏ trống**. Nguyên nhân nằm ngay trong code: bố cục 7 CỘT (thứ) × 5 hàng (tuần) khiến ô
to lên theo bề ngang khối, nên phải chặn `lg:max-w-sm` cho ô khỏi phình. Tức là bề ngang thừa
không phải do quên, mà là **cái giá của việc chọn sai trục**.

Nay desktop xếp ngược lại: **7 HÀNG (thứ) × N cột (tuần)** — đúng lối heatmap quen thuộc. Thêm
tuần là rộng ra chứ không cao lên, nên bề ngang được dùng để kể câu chuyện dài hơn: **26 tuần
(nửa năm)** thay vì 5 tuần. Với người học, nhìn thấy cả nửa năm phía sau chính là thứ tạo cảm
giác "mình đã đi được xa" — điều 5 tuần không cho được.

**Số tuần chọn theo bề ngang ĐO ĐƯỢC, không theo cảm giác.** Bản đầu đặt cứng 26 tuần cho mọi
desktop; chụp lại ở 1024px thì lịch **bị cắt giữa chừng** — sidebar 256px cộng cột ngữ cảnh ăn
gần hết màn, thẻ chỉ còn 424px. Cắt giữa chừng trông như lỗi render chứ không như nội dung cuộn
được. Nay hai mức: ≥1280px → 26 tuần; 1024–1279px → 13 tuần (một quý). Đo lại cả ba khổ:

| Khổ màn | Bề ngang thẻ | Bề ngang lưới   | Bị cắt |
| ------- | ------------ | --------------- | ------ |
| 1440px  | 776px        | 536px (26 tuần) | không  |
| 1280px  | 648px        | 536px (26 tuần) | không  |
| 1024px  | 424px        | 276px (13 tuần) | không  |

Dưới 1024px giữ nguyên bố cục cũ — màn hẹp không đủ chỗ cho 13 cột.

Tách `useMediaQuery` ra khỏi `useIsDesktopViewport` (cùng cơ chế, chỉ khác chuỗi truy vấn) thay
vì chép lại — chép là nhân đôi chỗ có thể sai (quên gọi lần đầu, quên gỡ listener).

## 2. Badge đếm số: lỗi tương phản thật, cổng không thấy

Badge đếm ("Từ khó 3", "Ôn SRS 12") dùng `text-white` trên `bg-rose-500`. Đo trong trình duyệt:
**3,67:1** — dưới sàn AA 4,5:1 mà CLAUDE.md mục 4.5 ghi là sàn cứng, dung sai 0. Cùng họ với 17
lỗi đã vá ở đợt 1.

**Vì sao cổng a11y không bắt được** (đáng ghi lại, vì đây là lỗ hổng dạng hệ thống): badge CHỈ
render khi số đếm > 0, mà E2E chạy với tài khoản trống thì không có gì để đếm — phần tử đó chưa
từng tồn tại lúc axe quét. Đây là loại lỗi mà "quét 15 trang × 5 theme" không với tới được, vì
nó phụ thuộc **trạng thái dữ liệu** chứ không phụ thuộc trang.

- Chuỗi class được chép nguyên văn ở **3 trang** (`CefrLevelPage`, `Learn`, `Dictionary`) — đúng
  kiểu trùng lặp mà design system sinh ra để chặn. Gom về `packages/core-ui/badgeStyles.ts`.
- Nền `rose-600` thay `rose-500`: chữ trắng đạt **4,70:1**, qua AA. Giữ họ màu đỏ vì badge đếm
  việc-cần-làm là quy ước quen thuộc.
- Chữ là `text-[#fff]` chứ **không** phải `text-white`: token đó bị đảo thành màu tối ở theme
  nền sáng, trong khi nền badge cố định đỏ ở mọi theme — để `text-white` là tự dựng lại đúng
  lỗi vừa vá.
- Cỡ chữ 11px → 12px: 11px bold trong vòng tròn 16px thì chữ số gần chạm viền.

## Bằng chứng kiểm chứng

- `e2e/badge-contrast.spec.ts` — gieo dữ liệu để badge hiện THẬT rồi đo tương phản tại chỗ.
  **Đã chứng minh test này bắt được lỗi**: tạm trả class về bản cũ thì test đỏ với đúng câu
  `tương phản badge = 3.67:1`; khôi phục thì xanh. Một test canh gác chưa từng thấy màu đỏ là
  một test chưa biết có tác dụng hay không.
- `packages/core-ui/badgeStyles.test.ts` — 3 test chặn tái phát (`text-white`, `rose-500`, rút
  gọn số > 99).
- **Kiểm bằng trình duyệt thật**: ảnh chụp thẻ lịch ở 1440/1280/1024px và ở mobile, kèm số đo
  bề ngang lưới so với bề ngang thẻ (bảng trên).
- `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` — xem phần Validation của
  PR.

## Một lỗi tôi tưởng có mà KHÔNG có

Nhìn ảnh chụp Trang chủ, phần chữ ở cột phải trông mờ nhạt như bị lỗi. Tự viết đoạn đo tương
phản thì ra **2,24:1** — tưởng đã tìm được lỗi lớn. Nhưng công thức tự viết đó **bỏ qua kênh
alpha** của nền (`bg-accent-500/20` bị tính như màu đặc), nên con số là giả. Cổng axe — vốn xử
lý alpha đúng — vẫn xanh, và app thật sự không có lỗi ở đó. Ghi lại để lần sau không đi "sửa"
một lỗi không tồn tại: **đo bằng công cụ hiểu đúng mô hình màu, đừng tự chế công thức rồi tin
nó hơn cổng đang chạy.**

## Việc tiếp theo

Còn 4 điểm yếu từ khảo sát: bấm vào một ngày trong lịch để xem hôm đó đã học gì (giờ đã có nửa
năm dữ liệu để bấm, nên đáng làm hơn trước); nói rõ khi phiên học bị rút gọn (`?cap=`); và di
trú dần 915 nút cũ sang `Button` dùng chung của đợt 1.
