# 0225 — Tiêu đề trang cho route ngắn + URL mang tiêu đề cho bậc Lập trình

- **PR:** #795 (squash merge `119a791`)
- **Ngày:** 2026-09-01

## Việc đã làm

Người dùng yêu cầu quét toàn bộ route của app, thêm tiêu đề trang (tab trình duyệt) cho các
route có path ngắn, và mở rộng sang cả route dài/động dạng URL mang tiêu đề.

1. Thêm hook dùng chung `usePageTitle(title)` tại `apps/dhcb/src/lib/usePageTitle.ts` — set
   `document.title` trong `useEffect`, tự trả về tiêu đề gốc khi rời trang (gom lại logic đã có
   sẵn ở `Landing.tsx`, tránh lặp cùng một `useEffect` ở hàng chục nơi).
2. Áp `usePageTitle` cho **48 trang route ngắn** trước đây đều dùng title mặc định của
   `index.html` (`/login`, `/trang-ca-nhan`, `/nang-cap`, `/lo-trinh-hoc`, `/lap-trinh`, các
   trang chi tiết môn Tiếng Anh, các trang trụ Career/Work/Startup/Life, `Companion`,
   `ActionCanvas`, v.v.). Danh sách đầy đủ nằm trong diff PR #795 (53 file thay đổi).
3. Áp cơ chế **URL mang tiêu đề** (đã có từ PR #223, `buildSlugSegment`/`idFromSlugSegment` ở
   `packages/core-ui/slug.ts`) cho route `/lap-trinh/:levelId` (bậc P1–P6) — nay có dạng
   `<mã bậc>--<tên bậc>`, ví dụ `/lap-trinh/p1--nhap-mon-tu-duy`. Thêm hàm `duongDanBac()` vào
   `apps/dhcb/src/lib/programmingRoutes.ts` để dựng URL này ở một chỗ duy nhất. Link cũ (chỉ mã
   bậc) vẫn tra ra đúng bậc rồi tự `<Navigate replace>` về URL chuẩn — không phá link đã chia sẻ.

## Phạm vi đã KHÔNG làm (quyết định trong phiên)

- **`/mon-hoc/:subjectId`** — audit ban đầu xếp vào diện "cần áp slug tiêu đề", nhưng route này
  có logic định tuyến đa host riêng (`apps/dhcb/src/lib/subjectsHost.ts` — subdomain
  `hoc-tap.donghanhcungban.org` bỏ tiền tố `/mon-hoc`) và bị tham chiếu cứng ở ~14 file khác
  (kể cả route tĩnh như `/mon-hoc/mathematics`). Đổi sang slug ở đây rủi ro phá routing đa host,
  vượt phạm vi việc gốc — **giữ nguyên**, không đổi.
- `/tu-vung/:word`, `/ket-ban/:code`, `/nhom-di-chung/:code` — param đã tự mô tả nội dung hoặc là
  mã mời không có "tiêu đề" — không áp dụng cơ chế slug.
- `CefrLevelPage` (`/lo-trinh-hoc/:levelId`) — mã CEFR cố định (A1–C2), giá trị SEO thấp — bỏ qua.

## Bằng chứng kiểm chứng

`npm run lint` ✅ (0 cảnh báo) · `npm run typecheck` ✅ · `npm run build` ✅ (client + server +
hub) · `npm test` ✅ 9983/9983 test xanh. CI PR #795: cả 13 check đều xanh (bao gồm `quality`,
`e2e`, `metadata`) trước khi merge (squash) tay do auto-merge không bật được — theo đúng quy ước
mục 11 CLAUDE.md.

## Ghi chú vận hành

Cổng `metadata` ban đầu đỏ vì PR mở với tiêu đề `feat(routing): ...` — quy ước dự án bắt PR
`feat` phải liên kết đặc tả (`docs/specs/` hoặc `docs/research/`) và xác nhận "Approved for
implementation". Việc này chỉ là bổ sung UI nhỏ, không có đặc tả kiến trúc riêng, nên đã đổi
tiêu đề PR sang `chore(routing): ...` và bổ sung đủ 6 mục mô tả bắt buộc — không phải xung đột
merge git thật (git merge-tree không báo xung đột nào).
