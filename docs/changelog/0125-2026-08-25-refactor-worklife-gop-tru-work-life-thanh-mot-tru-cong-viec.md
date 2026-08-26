# refactor(worklife): gộp trụ WORK + LIFE thành MỘT trụ "Công việc & Đời sống" (2026-08-25)

Người dùng chốt: **gộp sâu cả dữ liệu**, không chỉ gộp hiển thị. Lý do sản phẩm: việc hằng
ngày và đời sống tiêu **cùng một quỹ thời gian** — tách làm hai trụ là bắt người dùng tự ghép
lại hai nửa vốn là một. Nền tảng còn **4 trụ**: Học tập · Sự nghiệp · Khởi nghiệp · Công việc
& Đời sống.

- **Dữ liệu — migration `0066_worklife_merge.sql`.** Tạo schema `worklife` rồi
  `alter table ... set schema` toàn bộ 9 bảng (`work`: projects/tasks/meetings/documents ·
  `life`: plans/habits/habit_logs/wellbeing_checks/growth_milestones), sau đó
  `drop schema ... restrict` hai schema cũ. **KHÔNG sao chép dữ liệu** — chỉ đổi chỗ đứng
  trong catalog nên chạy tức thì, giữ nguyên hàng/khoá ngoại/chỉ mục. Vòng lặp đọc
  `information_schema` nên **lũy đẳng** (chạy lại không lỗi). `restrict` (không phải
  `cascade`) là chốt an toàn: còn sót đối tượng nào thì migration BÁO LỖI thay vì xoá ngầm.
  Lệnh lùi ghi sẵn ở cuối file migration. Không có bảng trùng tên giữa hai schema — đã đối
  chiếu `0048` và `0050` trước khi viết.
- **Code truy vấn:** `workService.ts`, `lifeFoundationService.ts`, `personErasureService.ts`
  đổi tiền tố schema sang `worklife.*`. Lưu ý bẫy trong test cũ: vị từ `s.includes('work.')`
  KHÔNG khớp `'worklife.'` (chuỗi là `workl…`) trong khi `s.includes('life.')` thì CÓ khớp —
  nên đã viết lại 3 vị từ trong `personErasureService.test.ts` thành `'worklife.'` tường minh
  thay vì để chúng khớp/trượt do trùng chuỗi.
- **UI — `pages/domains/worklife/WorkLife.tsx` (mới).** Một trang, hai tab "Công việc" /
  "Đời sống", tab đang mở nằm trong query `?muc=` (chia sẻ/bookmark được đúng nửa đang xem).
  KHÔNG viết lại 1.800 dòng của hai trang cũ: `Work.tsx` và `Life.tsx` nhận thêm prop
  `embedded` — ở chế độ nhúng thì bỏ `Layout` riêng và **không render `PageHeader` (h1)** nữa
  mà dùng `h2`, vì hai `h1` trên một trang là lỗi phân cấp tiêu đề (a11y). Mọi tính năng, API
  và test sẵn có của hai trụ giữ nguyên hành vi.
- **Route:** `/cong-viec-cuoc-song` là route mới; `/cong-viec` và `/cuoc-song` (cùng các bí
  danh `/work`, `/life`, `/cong-viec-cua-toi`, `/cuoc-song-cua-toi`, `/hoc-cong-viec`,
  `/hoc-cuoc-song`) chuyển hướng sang đúng tab tương ứng — **link cũ, bookmark và SEO không
  gãy**. E2E `v2-hubs.spec.ts` thêm 2 khẳng định `toHaveURL` để chuyển hướng hỏng thì test đỏ
  chứ không trượt im lặng.
- **Điều hướng đã đồng bộ:** `Layout.tsx` (gộp 2 mục quick-nav thành "Công Việc & Đời Sống"),
  `Profile.tsx` (gộp 2 thẻ), `BottomNav.tsx`, `Home.tsx`, `About.tsx`, và trang chủ
  `apps/hub` (thẻ trụ + FAQ + bảng giá + footer đổi "năm trụ" → "bốn trụ").
- **Trụ Sự nghiệp nay mô tả nhiều ngành nghề** (yêu cầu người dùng): dùng đúng **8 họ nghề**
  của `docs/research/dac-ta-nang-luc-ca-nhan-theo-do-tuoi-2026-08-23.md` (kỹ thuật–CNTT ·
  y tế–chăm sóc · giáo dục · kinh doanh–bán hàng · tài chính–kế toán–pháp lý ·
  sáng tạo–truyền thông · sản xuất–kỹ thuật viên · dịch vụ công–hành chính) kèm **nhánh
  chuyển hướng tự nhiên** của từng họ, thay vì liệt kê nghề lẻ (đặc tả cố ý không mô hình hoá
  hàng nghìn nghề vì bảo trì bất khả thi).

**Việc tay còn lại của bạn:** chạy `npm run migrate:pg` trên VPS trước khi deploy bản này —
nếu deploy code mới mà chưa chạy migration thì mọi truy vấn `worklife.*` sẽ lỗi "schema does
not exist" (trụ Công việc & Đời sống trắng màn, các trụ khác không ảnh hưởng). Nên backup DB
trước, dù thao tác này lùi được bằng lệnh ghi ở cuối file migration.

**Quy ước mới (người dùng chốt 2026-08-25):** LUÔN bật auto-merge cho mọi PR ngay sau khi tạo
— ghi vào `CLAUDE.md` mục 11. An toàn vì `main` đã có required status check `quality`/`e2e`/
`metadata`, auto-merge chỉ merge khi cả ba xanh.
