# feat(programming): PR-L7e — Fetch API giả lập + P3-U7 (2026-08-25)

Mạch Web của bậc P3 HOÀN TẤT: HTML → CSS → DOM → **fetch + render danh sách (U7)**.

- **Bài toán "sandbox không có mạng" giải bằng fetch GIẢ LẬP** (`fetchGia.ts` —
  `taoFetchGia()`): hàm cùng tên, cùng hình dạng fetch thật (Promise, `.ok`/`.status`/
  `.json()`), phục vụ bộ dữ liệu **thời tiết mẫu 63 tỉnh** cố định (`weatherData.ts`, sinh
  deterministic — đổi công thức là phải sửa expected trong bài, cổng CI chặn). API mẫu:
  `/api/thoi-tiet` (mảng 63) · `?tinh=<tên>` (một tỉnh hoặc **404** — dạy `res.ok`) · địa chỉ
  khác **reject TypeError** như lỗi mất mạng thật.
- **Một nguồn, ba nơi dùng:** cổng CI (`lessonsFetch.test.ts`) + Worker chấm bài
  (`fetchWorker.ts` → `chayBaiFetch()` trong `fetchPrelude.ts`, linkedom, bọc code học viên
  trong hàm async rồi **xả microtask** sau script và sau MỖI hành động) + khung xem trang
  (iframe nhúng `FETCH_SHIM_JS` sinh từ chính `taoFetchGia().toString()` — có dòng đệm
  `__name` vì esbuild keepNames chèn helper vào source; test "tự chứa" + E2E iframe canh).
- **Ngôn ngữ bài học mới `'fetch'`** = bài DOM + fetch giả (dùng chung `domHtml`, hành động
  `click`/`dien`, `thucHien()` export từ `domPrelude`). `codeRunner` rẽ nhánh sang
  `fetchRunner`; phần main-thread chung của dom/fetch tách thành khuôn
  `taoPageWorkerRunner()` (`lib/pageWorkerRunner.ts`) — domRunner/fetchRunner giờ chỉ còn
  khai báo worker.
- **Suýt nổ ngân sách (bài học):** import `FETCH_SHIM_JS` từ `fetchPrelude` kéo linkedom
  (~94KB gzip) vào bundle chính → Initial JS 177KB/140KB ĐỎ. Tách shim sang `fetchGia.ts`
  (không import linkedom) → về **123,3KB (88,1%)**. linkedom chỉ được sống trong worker.
- **Nội dung P3-U7 (2 bài):** L1 fetch + await hai tầng + render danh sách 63 tỉnh (ca ẩn:
  bấm 2 lần không nhân đôi danh sách); L2 query string + `encodeURIComponent` + rẽ nhánh
  `res.ok`/404 (ca ẩn: hiện tên từ DỮ LIỆU chứ không phải ô nhập; tra hỏng rồi tra lại).
- **Kiểm chứng:** 441 file / 5482 unit test xanh; cổng fetch 17 test. E2E
  `programming-lesson` 18 test (3 mới: 2 bài chấm thật trong Worker **với mọi request ra
  ngoài origin bị chặn** — chứng minh không cần mạng; 1 test iframe tra cứu chạy bằng shim),
  2 flaky cũ (SQL/DOM, xanh khi retry — giới hạn máy local đã ghi nhận ở PR-L7d).
- **Còn lại của môn:** U10–U12 (Git/công cụ/milestone — bản chất không chạy trong sandbox,
  cần cách tiếp cận riêng) · chặng P3 dự án trục · thẻ SRS.
- **Tiếp theo:** chặng P3 của dự án trục (đã đủ hạ tầng 4 ngôn ngữ + fetch), hoặc U10–U11
  (Git/GitHub — dạng đọc-hiểu + Predict, không chạy code thật; cần chốt cách làm với người dùng).
