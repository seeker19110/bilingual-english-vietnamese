# 0276 — 2026-09-06 — Đánh giá sâu dự án + cắt gọn tài liệu điều hành

**PR:** (điền khi tạo) · **Loại:** `docs` · **Nhánh:** `claude/danh-gia-sau-du-an-tpvud1`

## Việc đã làm

Người dùng yêu cầu "đánh giá sâu về dự án" rồi "xử lý ngay". Đợt này là phần xử lý được
trong repo; hai việc còn lại (mời người học thật, việc trên VPS) ghi vào `PROGRESS.md` cho
người dùng.

1. **Đánh giá sâu, đo thật trong phiên** (không lấy từ trí nhớ): typecheck ✅ · 574 file /
   12.160 unit test ✅ (141 giây) · ~360.000 dòng TS/TSX · 22 gói · 112 endpoint · 78 migration ·
   310 file changelog · nhịp ~15 đợt việc/ngày trong 3 tuần. Kết luận: **kỹ thuật rất khoẻ;
   rủi ro nằm ở chỗ chưa có bằng chứng người học thật, chiều rộng phình nhanh hơn chiều sâu,
   và tài liệu điều hành nặng hơn phần mềm.**
2. **`PROGRESS.md` 3.797 → 838 dòng.** Chỉ còn: giai đoạn hiện tại · đã xong tóm tắt · tiếp theo
   (viết lại, chỉ mục CÒN MỞ, xếp 3 ưu tiên) · cần làm tay · quyết định quan trọng · sự cố ·
   nợ kỹ thuật còn mở. Phần đã xong dời **nguyên văn** sang
   `docs/legacy/progress-luu-tru-den-2026-09-06.md` (2.603 dòng); 467 dòng nợ đã đóng + mục
   nginx ✅ dời sang `docs/legacy/no-ky-thuat-da-dong.md`. Quyết định Tầng 8b dời từ "Tiếp theo"
   sang "Quyết định quan trọng" cho đúng chỗ.
3. **`CLAUDE.md` 513 → 301 dòng.** Mục 3 và 11 chỉ giữ luật hiện hành; phần lịch sử vì sao có
   luật (PR #693/#709/#724/#726/#727) và mục 13 "Trạng thái hiện tại" dài (trùng `PROGRESS.md`)
   dời sang `docs/legacy/claude-md-lich-su-quy-uoc.md`. Không đổi một luật nào.
4. **`docs/README.md` mới** — bản đồ tài liệu: nguồn thi hành · vận hành · tham khảo (KHÔNG
   phải backlog: `MASTER_SPEC`, `architecture-v2/`, `phases/`, `OS_*`…). Quyết định **không dời
   file** các tài liệu tham khảo vì code (`packages/core-contracts/*`, `core-errors/*`) và
   ADR-0003/0004 còn trích dẫn đường dẫn — dời là phá 30+ liên kết để đổi lấy sự gọn mà một
   file chỉ mục đã đủ.

## Hai kết luận đo được, ĐÍNH CHÍNH bản đánh giá ban đầu

- **Zod:** bản đánh giá đầu ghi "62/120 handler dùng Zod". Đo lại: mọi handler có đọc
  `req.body/query/params` đều đã validate; 46 handler không dùng Zod là handler **không đọc
  input**. Không có việc gì phải làm.
- **`react-hooks/exhaustive-deps`:** 28 chỗ tắt trong 16 file đều là khuôn có chủ đích, có comment
  (khoá invalidation thủ công `refresh`/`ready` cho dữ liệu localStorage; effect chỉ chạy lúc
  mount). Không phải stale closure. Ghi vào `PROGRESS.md` để đợt sau không rà lại.
- **Đường đo người dùng:** bản đánh giá đầu ghi "không có". Thực tế đã có bảng
  `analytics_events`, client `lib/analytics.ts`, tab admin Analytics + DAU/WAU/MAU. Lỗ hổng thật
  hẹp hơn: 3/6 sự kiện phễu (`signup`, `first_session_done`, `day2_return`) khai trong whitelist
  nhưng **chưa nơi nào bắn** → phễu admin luôn 0 ở ba bước quan trọng nhất. Ghi thành việc ưu
  tiên 1 trong `PROGRESS.md` (PR riêng, loại `fix`).

## Bằng chứng kiểm chứng

- Hook đầu phiên `.claude/report-status.sh` chạy trên `PROGRESS.md` mới vẫn in đủ **8 món nợ
  mở** (định dạng `- 🟡 **[...]` giữ nguyên).
- `scripts/changelog.test.ts` (canh `PROGRESS.md` không chồng mục `###` vào "Giai đoạn hiện
  tại") ✅ · `npm run format:check` ✅ · `npm test` ✅ (xem mô tả PR).
