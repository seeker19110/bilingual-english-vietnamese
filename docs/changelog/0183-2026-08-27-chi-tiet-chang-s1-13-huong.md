# feat(programming): chi tiết chặng S1 cho toàn bộ 13 hướng chuyên sâu (2026-08-27)

**Nhánh:** `claude/check-next-tasks-5ia6r2`

## Bối cảnh

PR #718 · #719 · #721 lần lượt mở tầng "chi tiết chặng" (`SpecStageDetail`) cho S2, S3 và S4 của
13 hướng. Còn trống đúng một mảng: **chặng S1 — chặng NHẬP MÔN, chặng đông người đứng nhất.**
Người học mới chọn hướng, mở chặng đầu tiên ra thì thấy ít nội dung hơn hẳn ba chặng sau nó.
Đợt này lấp kín, để cả 13 hướng đủ chi tiết **4/4 chặng**.

## Đã làm

- **13 file mới** `specializations/details/<hướng>-s1.ts` — tổng **53 module** (web 5, còn lại 4
  mỗi hướng) và **58 tiêu chí rubric**, mỗi module có mục tiêu · 2–4 bài luyện tay · 2–4 câu tự
  kiểm có đáp án · 2–3 dấu hiệu đã nắm; mỗi chặng có rubric kèm CÁCH CHỨNG MINH và một đặc tả
  mẫu 6 ô.
- Đăng ký 13 mục vào `specializations/stageDetails.ts` (chỉ THÊM, đặt trước khối S2, không đổi
  thứ tự phần tử cũ).
- **Siết cổng — hai ca mới** trong `specStageDetails.test.ts` (16 → 19 ca, tính cả ca cũ):
  1. "mỗi hướng có đúng một chi tiết cho chặng S1";
  2. **"KHÔNG chặng nào của bản đồ còn thiếu chi tiết"** — quét thẳng 4 chặng × 13 hướng từ
     `PROGRAMMING_SPECIALIZATIONS`, nên chặng mới thêm vào bản đồ mà quên soạn chi tiết là CI đỏ,
     không phải trang thiếu nội dung. Ca này thay thế được cả ba ca đếm theo từng chặng nếu sau
     này muốn gọn lại.
- Đặc tả giao việc: `docs/specs/2026-08-27-chi-tiet-chang-s1-13-huong.md`.

## Quyết định kèm theo

- **Hình dạng `practice` của S1 khác hẳn ba chặng sau, có chủ ý.** S2–S4 luyện bằng cách XÂY
  thêm; S1 luyện bằng cách **quan sát và đo thứ đã có** — mở công cụ nhà phát triển đọc thứ tự
  tải trang, làm đầy ổ đĩa để xem hệ thống hỏng theo cách nào, khoá số khung hình xuống 30 để
  kiểm tốc độ nhân vật. Ở chặng nhập môn, thứ người học thiếu không phải kỹ thuật mà là **thói
  quen nhìn vào bằng chứng thay vì đoán**.
- **Mỗi `objective` bắt đầu bằng một động từ làm được, không bằng "hiểu về".** Cổng `objective`
  ≥ 40 ký tự không bắt được lỗi này, nên nó là kỷ luật soạn chứ không phải ràng buộc máy — ghi
  lại đây để đợt sau giữ đúng.
- **Ràng buộc riêng ghi thẳng vào dữ liệu, không để ngầm:** hướng `security` đặt luật đạo đức
  (chỉ tấn công hệ thống của chính mình; lab KHÔNG BAO GIỜ phơi ra Internet) ở comment đầu file
  **và** trong ô "KHÔNG làm" của đặc tả mẫu — vì S1 là chặng người học lần đầu chạm vào công cụ
  khai thác.
- **Hai chặng đã có bài học 8 bước nói rõ quan hệ hai tầng ngay trong comment:** `web-s1`
  (`p6-u16`…`p6-u18`) và `architecture-s1` (`p6-u19`…`p6-u21`). Chi tiết chặng KHÔNG thay thế
  bài học — bài học chấm được bằng test-case, chi tiết chặng là bản đồ luyện tay trên hệ thống
  thật nơi không có test-case nào chấm hộ.

## Việc phát sinh đã xử lý

`progress.test.ts` đỏ một ca: nó dùng `'web-s1-r1'` làm ví dụ **khoá không tồn tại** (đúng, khi
chi tiết S1 chưa soạn). Khoá đó nay có thật nên server trả 200 — hành vi ĐÚNG, test mới là thứ
lạc hậu. Đã đổi dữ liệu ca kiểm sang `'web-s1-r99'` (tiêu chí ngoài dải của chặng có thật) và
thêm `'web-s5-m1'` (chặng không có trong bản đồ), tức siết chặt hơn bản cũ chứ không nới ra.

**Bài học ghi lại:** một test dùng "thứ chưa làm" làm ví dụ phản chứng sẽ tự hết hạn đúng vào
ngày thứ đó được làm. Nên chọn phản chứng là thứ **không bao giờ tồn tại** (`-r99`, `-s5`), đừng
chọn thứ đang trống trong kế hoạch.

## Bằng chứng kiểm chứng

- `npm ci` trước khi chạy cổng (container phiên mới, `node_modules` trống — CLAUDE.md mục 8).
- `npm test` — **490 file, 7.074 test, toàn bộ xanh**; `specStageDetails.test.ts` 19/19.
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run build` — sạch.
- `npx prettier --check` trên gói: 11 file mới lệch định dạng, đã `--write` và kiểm lại sạch.
- `npm run budget`: Initial JS 124,80/140 kB · CSS 16,27/18 kB — đều còn dư.
- **Xác nhận dữ liệu KHÔNG rơi vào Initial JS:** `grep -rl "web-s1-r1" dist/` chỉ trúng
  `dist/js/ProgrammingSpecStagePage-*.js`, tức chunk lười của trang chặng.

## Việc để ngỏ (cố ý)

- **Bài học 8 bước cho 49/52 chặng còn lại** — `stageUnits.ts` mới nối 3 chặng (`web-s1`,
  `architecture-s1`, `web-s4`). Tầng khác, đặc tả riêng.
- Chưa nối tiến độ chặng với tiến độ bài học (đánh dấu chặng vẫn là thao tác tay).
- Chưa gợi ý hướng theo hồ sơ người học.
