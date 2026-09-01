# 0228 — Đợt tối ưu dự án: tách chunk bài học Lập trình, cache Playwright CI, dọn nợ

- **PR:** #{{PR}}
- **Ngày:** 2026-09-01
- **Nhánh:** `claude/project-optimization-qpxoir`
- **Bối cảnh:** người dùng yêu cầu "quét dự án xem còn gì cần tối ưu" rồi "fix toàn bộ". Đợt quét
  đo bằng công cụ (build · budget · coverage · codemap · thời gian CI thật trên GitHub), không đoán.

## Đã làm

### 1. Chunk bài học môn Lập trình 3 MB → 153 chunk theo unit, nạp lười

**Vấn đề đo được:** `packages/subject-programming/lessons.ts` import tĩnh 153 file unit rồi gộp
thành một mảng; Vite đóng tất cả vào MỘT chunk `lessons-*.js` **3,0 MB thô / 843 kB gzip**. Bất
kỳ trang nào của môn (trang chủ môn, trang bậc, trang khoá, ôn thẻ, "học tiếp bài nào") chỉ
cần TIÊU ĐỀ một bài cũng tải trọn nội dung của mọi bài.

**Cách sửa (giữ nguyên nguồn sự thật):**

- `scripts/gen-lesson-index.ts` (`npm run gen:lesson-index`) sinh
  `packages/subject-programming/lessonsLazy.ts`: chỉ mục nhẹ `LESSON_INDEX` (id · unitId ·
  title · language · số thẻ SRS) + bảng `UNIT_LOADERS` mỗi unit một `import()` động. File sinh
  ra được format bằng đúng cấu hình Prettier của repo.
- `lessonsLoader.ts` — tầng tra cứu cho giao diện: đồng bộ (`getLessonSummary`,
  `getUnitSummaries`) và nạp lười có cache (`loadLesson`, `loadUnitLessons`, `loadLessons`).
- `lessonsLazy.test.ts` canh 3 bất biến: chỉ mục khớp CHÍNH XÁC registry (cả thứ tự), mọi unit
  có loader và loader trả đúng bài, gộp mọi loader = đúng tập bài. Quên chạy gen là test đỏ với
  đúng câu nhắc lệnh.
- App KHÔNG còn file nào (ngoài test) import `@dhcb/subject-programming/lessons`. Đã chuyển 9
  file: `programmingSrs.ts` (đếm/lọc đến hạn bằng chỉ mục, nội dung thẻ nạp lười qua
  `hydrateProgCards`), `programmingNextLesson.ts`, 6 trang môn, và `ProgrammingLessonPage.tsx`
  tách thành vỏ nạp lười (3 trạng thái: đang tải / lỗi có nút thử lại / xong) + thân trang
  (`LessonBody`, `key` theo id bài).
- `vite.config.ts` đặt tên chunk `js/prog-lesson-<unit>-<hash>.js` để dễ đọc trong `dist/`.
- Server (`feedback.ts`, `progress.ts`), script và test vẫn dùng registry đồng bộ — không đổi.

**Kết quả:** chunk `lessons-*.js` biến mất khỏi `dist/`; 153 chunk `prog-lesson-*` mỗi cái vài
kB, chỉ tải khi mở đúng bài.

### 2. `programmingRoutes.ts` 48 kB gzip → 0,5 kB

File dựng URL dùng chung của 10 chunk lại import GIÁ TRỊ `getSpecialization` (registry 14 hướng
chuyên sâu, ~155 kB thô). Hai hàm tra theo id chặng tách sang `programmingRoutesSpec.ts`; chỉ
`ProgrammingPathPage` (vốn đã dùng registry) import file đó. Ghi rõ ở đầu file luật "không import
registry dữ liệu".

### 3. Vá cảnh báo `Circular chunk: vendor-misc -> vendor-core -> vendor-misc`

`id.includes('node_modules/react')` bắt cả gói tên bắt đầu bằng "react", trong khi dependency
runtime của react-dom (`scheduler`) và react-router (`cookie`, `set-cookie-parser`) lại rơi sang
`vendor-misc`. Nay so khớp đúng tên gói qua `VENDOR_CORE_PACKAGES`. Build không còn cảnh báo.

### 4. CI: cache trình duyệt Playwright theo phiên bản `@playwright/test`

Đo run `33537608110` trên `main`: bước "Install Playwright Chromium" mất ~22 giây MỖI mảnh, và
mảnh 3 kẹt tải **10,5 phút** — một mình nó kéo CI từ ~5 phút lên 13,8 phút. Thêm `actions/cache`
cho `~/.cache/ms-playwright`; cache trúng thì chỉ chạy `playwright install-deps`. Test canh luật
CI (`scripts/ci-workflow-policy.test.ts`) vẫn xanh.

### 5. Codemap bắt mẫu `new Worker(new URL('./x', import.meta.url))`

5 file `apps/dhcb/src/workers/*` từng bị `npm run codemap -- orphans` báo mồ côi nhầm. Thêm dạng
thứ 4 vào `scripts/lib/scanGraph.ts` + ca test; quét lại không còn báo worker.

### 6. Nới biên coverage branches

Trước đợt: **90,19%** trên sàn 90 (còn 0,19 điểm — PR nội dung kế tiếp rất dễ đỏ CI). Thêm test
ca biên cho `apps/dhcb/src/lib/progressSync.ts` (74% → 92% nhánh: JSON hỏng/sai hình dạng,
hợp nhất placement/weeklyGoal/cefrExams/SRS/settings, dedup pull, localStorage đầy, hàng chờ
review offline) và `apps/server/src/api/learning/co-learning-audio.ts` (từng nhánh của handler:
OPTIONS, 429, 404, 503 đầy phòng, 400 thiếu trường, 405). Sau đợt: **90,67%**.

### 7. Tài liệu

- `CLAUDE.md`: sửa câu sai "đã xoá `core-grading` mồ côi" (gói đã khôi phục 2026-08-31 cho 3 gói
  môn STEM chưa nối vào app); thêm quy ước "thêm bài học → `npm run gen:lesson-index`".
- `PROGRESS.md`: mục "Nợ kỹ thuật còn mở" chỉ còn nợ đang mở — 7 khối 🟢 đã đóng dời nguyên văn
  sang `docs/legacy/no-ky-thuat-da-dong.md`; cập nhật số đo ngân sách 2026-09-01.

## Còn để ngỏ (cố ý, không thuộc đợt này)

- **CSS còn đúng 1 kB dưới ngân sách 18 kB** (PR #797 thêm keyframes). Không cắt được bằng tay
  mà không đụng giao diện vừa thiết kế lại; ghi ở PROGRESS.md để PR giao diện sau rà trước.
- `ProgrammingSpecStagePage` chunk 468 kB thô (126 kB gzip) — nội dung chi tiết chặng hướng
  chuyên sâu, cùng kiểu vấn đề với mục 1, ứng viên cho đợt sau.
- Ba gói `subject-physics/chemistry/biology` (~6.000 dòng mỗi gói) chưa nối vào app — theo goal
  đang ACTIVE, chờ duyệt chuyên môn, không phải lỗi.
- Nợ cần VPS/quyết định người dùng giữ nguyên: hai file Nginx trùng vai trò, chiều B cho 4 trang
  trụ cột + 2 tính năng, Redis rớt 7 lần/ngày.

## Bằng chứng kiểm chứng

- `npm run build` ✅ (không còn cảnh báo circular chunk; `ls dist/js | grep -c prog-lesson` = 153;
  không còn `lessons-*.js`).
- `npm run typecheck` ✅ · `npm run lint` ✅ 0 cảnh báo · `npm run format:check` ✅.
- `npm run test:coverage` ✅ 10.847 test xanh; branches 90,67%.
- `npm run budget`: JS 127,26 / 140 kB · CSS 17,00 / 18 kB.
- E2E `e2e/programming-lesson.spec.ts` chạy tại máy: 26/29 xanh lượt đầu (chạy song song với
  coverage), 3 ca Worker (JS vòng lặp vô hạn · SQL · DOM) chạy lại riêng **xanh hết** — lỗi do
  máy quá tải, không do thay đổi.
- `npm run codemap -- orphans` không còn liệt kê `apps/dhcb/src/workers/*`.
