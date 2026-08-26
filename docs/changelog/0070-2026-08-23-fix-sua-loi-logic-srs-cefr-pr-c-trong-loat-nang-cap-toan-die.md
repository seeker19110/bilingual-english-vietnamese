# fix: sửa lỗi logic SRS/CEFR — PR C trong loạt nâng cấp toàn diện (2026-08-23)

**Bối cảnh:** tiếp nối PR A (gamification) + PR B (3 chế độ học) trong kế hoạch 7 PR (A→G) + 4
việc quyết định lớn. PR C xử lý các lỗi logic thầm lặng trong lộ trình CEFR + SRS (spaced
repetition) — không làm crash hay đỏ cổng nào, chỉ âm thầm cho số sai/trải nghiệm kém.

**Lỗi đã sửa:**

1. **Nguy cơ mất lịch ôn vĩnh viễn khi localStorage đầy quota**: `save()` trước đây nuốt lỗi
   `setItem` mà không giữ lại bản dữ liệu vừa ghi ở đâu cả — `load()` lần sau đọc lại bản CŨ
   trong localStorage rồi còn đẩy đè lên server qua `pushProgress`. Thêm cache trong bộ nhớ
   (`memCache`, module-level ở `srs.ts`) làm nguồn sự thật cho phiên hiện tại — `load()` luôn
   thấy đúng bản mới nhất bất kể `localStorage.setItem` thành hay bại. Phát hiện thêm khi sửa:
   3 file test (`srs.test.ts`, `srsPreloader.test.ts`, `cefrProgress.test.ts`) tái dùng cùng
   uid/word giữa các test — chỉ `localStorage.clear()` không đủ xoá sạch trạng thái nữa (cache
   mới không tự biết localStorage vừa bị xoá), phải thêm `_resetSrsMemCacheForTests()` (export
   test-only) vào `beforeEach` của cả 3 file — bắt được nhờ chạy lại `test:coverage` sau khi sửa,
   đúng bài học "sửa xong phải rà lại chính phần vừa sửa" (mục 5.2 audit).
2. **`getSRSStats` đếm cả thẻ ngữ pháp (`grammar:*`) vào "N từ cần ôn"**: Dashboard + push
   notification hiện số phồng lên (cộng thêm tối đa 78 bài ngữ pháp), lệch với tab "Ôn SRS" (đã
   lọc đúng). Sửa cả `srs.ts` (client) lẫn `api/push.ts` (server, cùng lỗi độc lập) — lọc
   `!key.startsWith('grammar:')`.
3. **Badge "Từ khó" chỉ đếm ⭐ thủ công, thiếu leech tự động** (≥3 lần "Quên"): người chưa từng
   bấm ⭐ thấy badge = 0 dù tab chứa hàng chục từ leech thật. Sửa `CefrLevelPage.tsx` khớp đúng
   logic tab thật (hợp của `getDifficultWords` + `getLeechWords`).
4. **Ngưỡng quiz 90% quá khắt với batch nhỏ**: batch 5 câu (tốc độ mặc định người mới) hay
   comeback (3 câu) phải đúng TUYỆT ĐỐI 100% mới đạt — ngược hẳn ý đồ "phiên nhẹ nhàng hơn" của
   luồng comeback. Đổi `isQuizPass` sang "cho phép sai tối thiểu 1 câu" (`maxWrongAllowed =
max(1, floor(total×10/100))`) — giữ nguyên hành vi cho batch ≥10 câu, chỉ nới cho batch nhỏ.
5. **Màn "Hoàn thành, đã học 0 từ" + CTA "Luyện 0 từ này"**: xảy ra khi đã thuộc hết pool VÀ vừa
   hết lượt hôm nay cùng lúc — guard cũ chỉ kiểm `phase === 'learning'`, bỏ sót
   `phase === 'batch-done'`. Sửa điều kiện, giữ nguyên `phase === 'daily-max'` (màn đó đã đúng,
   không phụ thuộc batch).
6. **Nút "Để sau" không hoãn gì cả**: từ bị bỏ qua quay lại NGAY đầu batch kế tiếp (do
   `getTodayBatchFrom` chỉ lọc theo `learned`, không biết gì về "để sau"). Thêm
   `getSkippedToday`/`addSkippedToday` (lưu theo ngày, cùng convention với các bộ đếm daily khác
   trong `curriculum.ts`) + tham số `defer` cho `getTodayBatchFrom` — từ bị hoãn xuống CUỐI hàng
   đợi trong ngày thay vì đứng đầu, chỉ xuất hiện lại nếu batch còn chỗ sau khi ưu tiên từ khác.

**Cổng đã chạy:** build ✅ · typecheck ✅ (0 lỗi, 4 tsconfig) · lint ✅ (0 cảnh báo) · format ✅ ·
test+coverage ✅ (statements 93.98% · branches 90.1% · functions 97.02% · lines 93.98% — trên sàn
90/90/90/90; thêm test ca biên cho `isQuizPass`, `getTodayBatchFrom` defer, `getSkippedToday`,
push notification lọc grammar). Lượt chạy đầu phát hiện 2 test fail do thiếu reset memCache mới —
đã sửa và chạy lại xác nhận xanh, đúng quy trình "sửa xong rà lại phần vừa sửa" thay vì tin lượt
chạy đầu.

**Kế hoạch còn lại:** PR D (UX Speaking sâu hơn) → PR E (Writing + hiển thị lỗi) → PR F (hiệu
năng CEFR) → PR G (đánh bóng UX) → 3 việc quyết định lớn còn lại (gộp referral, Elo+Memory Palace
ra Postgres, ẩn telemetry USD).
