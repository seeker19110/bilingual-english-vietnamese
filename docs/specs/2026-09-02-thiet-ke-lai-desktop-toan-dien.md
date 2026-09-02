# Đặc tả — Thiết kế lại toàn diện giao diện web desktop

- **Ngày:** 2026-09-02
- **Trạng thái duyệt:** Approved for implementation
- **Người duyệt:** Người dùng (chốt trong phiên 2026-09-02 qua `AskUserQuestion`: cách làm =
  "nền hệ thống trước, rồi áp theo đợt"; mức làm mới diện mạo = "làm mới mạnh")
- **Đợt này thi hành:** ĐỢT 1 — nền hệ thống thiết kế + ngôn ngữ thị giác mới. Đợt 2–4 mô tả ở
  mục ⑦ để phiên sau nối tiếp, KHÔNG làm trong đợt này.

## 0. Một câu

Dựng tầng hệ thống thiết kế còn thiếu (thang chữ · token bề mặt/độ nổi · khung trang dùng chung)
rồi áp lên các trang lõi, để giao diện desktop thôi là "mobile phóng to" và trở nên hiện đại,
mạch lạc cho người học.

## 1. Vì sao — bằng chứng đo được

Khảo sát mã nguồn ngày 2026-09-02 (3 luồng rà soát song song + chụp màn hình thật ở 1440×900):

| Triệu chứng                     | Số đo thật                                                                      | Hệ quả trên desktop                                       |
| ------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Không có khung trang dùng chung | **154 chỗ** tự đặt `max-w-*` (từ `max-w-lg` tới `max-w-7xl`)                    | Header (`max-w-5xl`) lệch mép nội dung ở hầu hết trang    |
| Không có thang chữ              | `text-xs` **1348 lần** (~50% toàn app), `text-base` chỉ 156                     | Chữ 12px trên màn 1440px — "nén cỡ mobile"                |
| Không có tầng desktop           | `lg:`+`xl:` **62 lần** vs `sm:` **302 lần**                                     | 13 trang môn Lập trình cứng `max-w-4xl`, bỏ trống 1/3 màn |
| Không có token độ nổi           | `shadow-2xl` **41 chỗ**; shadow màu hardcode `shadow-emerald-500/20` **14 chỗ** | Trái quy chuẩn skill; sai tông ở 3 theme nền sáng         |
| Bố cục 2 cột chép tay           | **6 bản sao**, bề rộng lệch nhau (`w-72 xl:w-80` vs `w-80 xl:w-96`)             | Không sửa được tập trung                                  |

`Layout.tsx` mang tên "Layout" nhưng **chỉ là thanh header** — nó không bọc `children`, nên
không có chỗ nào áp được bề rộng/nhịp chung. Đây là nguyên nhân gốc của dòng đầu bảng.

## 2. Đo tương phản — ràng buộc cứng của việc "làm mới mạnh"

Đã tính WCAG cho mọi cặp (màu chữ × bề mặt) trên **cả 5 theme** trước khi thiết kế:

| Màu chữ            | Trên `z-950`/`z-900`    | Trên `z-800` (thẻ nổi)            | Kết luận                                 |
| ------------------ | ----------------------- | --------------------------------- | ---------------------------------------- |
| `z-100`–`z-300`    | AAA mọi theme           | **AAA mọi theme** (≥7,06)         | dùng được cho chữ nội dung               |
| `z-400`            | AAA                     | **6,40–7,24 → rớt AAA**           | CHỈ cho nhãn/phụ (AA), không nội dung    |
| `z-500`            | AA (5,08–6,09)          | AA (4,58–4,65)                    | chỉ nhãn phụ/gợi ý                       |
| `z-600`            | 1,77–3,25               | 1,59–3,00                         | **cấm dùng làm màu chữ**                 |
| accent `a-400/500` | AAA ở dark-blue/vibrant | **1,35–2,89 ở blue-sky/pink/kid** | chữ nhấn buộc có biến thể `theme-light:` |

**Suy ra luật thiết kế bắt buộc:** thêm tầng bề mặt nổi mà vẫn để chữ `z-400` sẽ làm **vỡ cổng
AAA một cách im lặng**. Vì vậy đợt này thay việc "mỗi chỗ tự chọn màu chữ" bằng **token ngữ nghĩa**
đã được đo sẵn.

## ① Phạm vi

**LÀM trong đợt 1:**

1. **Thang chữ chính thức** — khai trong `tailwind.config.js` (`fontSize`) + lớp ngữ nghĩa: cấp
   `display / h1 / h2 / h3 / body-lg / body / body-sm / label / caption`, có **bậc tăng ở
   `lg:`** (chữ nội dung to hơn trên desktop). Sàn tuyệt đối 11px giữ nguyên.
2. **Token bề mặt & độ nổi** — 3 cấp đúng mục 6 của skill `ui-ux-craftsman` (nền + viền, KHÔNG
   shadow nặng): `--surface-base` (nền trang) → `--surface-card` (thẻ) → `--surface-raised`
   (modal/dropdown/toast, kèm viền đậm hơn + `backdrop-blur`). Khai cho **cả 5 theme** trong
   `packages/core-ui/theme.css`.
3. **Token màu chữ ngữ nghĩa** — `--text-primary` / `--text-secondary` / `--text-muted` /
   `--text-disabled`, ánh xạ theo bảng đo mục 2 để **AAA tự động đúng trên mọi bề mặt**.
4. **Khung trang dùng chung `PageShell`** — áp bề rộng chuẩn theo loại nội dung
   (`reading` ~72ch · `standard` · `wide`), padding và nhịp dọc thống nhất, **khớp mép với
   header**.
5. **`TwoPane` + `ContextRail`** — gom 6 bản sao bố cục 2 cột thành một component có API props.
6. **Script đo tương phản** `scripts/contrast-audit.ts` + test canh — chạy độc lập, nhanh, chặn
   token mới rớt ngưỡng mà không phải đợi E2E.
7. **Áp lên 3 trang chứng minh:** trang bài học môn Lập trình (`ProgrammingLessonPage`), trang
   bậc (`ProgrammingLevelPage`), và `Profile` — ba trang hiện KHÔNG có tầng desktop nào.

**KHÔNG làm trong đợt 1 (để đợt sau, xem mục ⑦):**

- Không đổi **bảng màu nhấn (hue)** của 5 theme. "Làm mới mạnh" ở đợt này thực hiện qua **chữ,
  khoảng thở, bề mặt, bo góc, nhịp và mật độ** — là các trục đổi diện mạo rõ rệt mà **không đánh
  cược cổng AAA** trên 5 theme. Đổi hue để đợt riêng, có đo lại toàn bộ.
- Không đổi bất cứ thứ gì **dưới 1024px** (mobile/tablet giữ nguyên tuyệt đối).
- Không đổi route, API, schema, logic nghiệp vụ.
- Không migrate 154 chỗ `max-w-*` trong một đợt — chỉ 3 trang chứng minh.
- Không đụng `apps/hub` (landing dùng hệ riêng).

## ② Điểm chạm

| File                                             | Việc                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `packages/core-ui/theme.css`                     | thêm token bề mặt + màu chữ ngữ nghĩa cho 5 theme              |
| `apps/dhcb/tailwind.config.js`                   | khai `fontSize` thang chữ; map token bề mặt/chữ sang class     |
| `apps/dhcb/src/index.css`                        | lớp tiện ích thang chữ; dọn `.glow-*` hardcode nếu chạm        |
| `packages/core-ui/PageShell.tsx` (mới)           | khung trang dùng chung                                         |
| `packages/core-ui/TwoPane.tsx` (mới)             | bố cục 2 cột + context rail                                    |
| `scripts/contrast-audit.ts` (mới)                | đo tương phản 5 theme                                          |
| `scripts/contrast-audit.test.ts` (mới)           | test canh ngưỡng                                               |
| `apps/dhcb/src/pages/programming/LessonPage.tsx` | áp `PageShell` + `TwoPane` (mục lục bước + tiến độ ở cột phải) |
| `apps/dhcb/src/pages/programming/LevelPage.tsx`  | áp `PageShell` + master–detail                                 |
| `apps/dhcb/src/pages/core/Profile.tsx`           | áp `PageShell` + 2 cột                                         |

## ③ Hợp đồng dữ liệu

Thuần trình bày — **không có hợp đồng dữ liệu mới**. `PageShell`/`TwoPane` nhận props React
thuần (`width`, `title`, `rail`, `children`), không đọc/ghi trạng thái toàn cục, không gọi API.

## ④ Tiêu chí chấp nhận (đo được)

1. `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run format:check` · `npm test` xanh.
2. `npm run build` xanh; **`npm run budget` còn trong ngân sách** — CSS đang ở 93,1%/18kB nên
   phải báo cáo số CSS trước/sau; nếu vượt phải dọn class cũ, KHÔNG nới ngân sách.
3. `npm run test:e2e` xanh **toàn bộ**, đặc biệt `e2e/a11y.spec.ts` (AA, 0 vi phạm mọi mức) và
   `e2e/a11y-aaa.spec.ts` (AAA nội dung/tiêu đề) trên **15+ trang × 5 theme**.
4. Script `contrast-audit` báo **0 cặp token ngữ nghĩa rớt ngưỡng** ở cả 5 theme.
5. Chụp màn hình thật 1440×900 ở **cả 5 theme** cho 3 trang đã áp, đính vào PR: không tràn
   ngang, không vùng trống lớn vô nghĩa bên phải, mép nội dung thẳng hàng với header.
6. Ở < 1024px: `git diff` chứng minh không đổi hành vi mobile (không sửa class không có tiền tố
   `lg:`/`xl:` ở phần bố cục), và ảnh chụp 390×844 giống trước.

## ⑤ Bất biến không được phá

1. **A11y là sàn cứng, dung sai 0** — AAA cho nội dung/tiêu đề, AA cho phần còn lại, ở **mọi
   theme**. Không baseline, không ngoại lệ (CLAUDE.md mục 4.5).
2. **Gate bằng JS, không bằng CSS** — nội dung trùng giữa 2 breakpoint phải dùng
   `useIsDesktopViewport()`, KHÔNG `lg:hidden` (bài học changelog `0199`: DOM trùng phá
   strict-mode Playwright và làm trình đọc màn hình đọc hai lần).
3. **Breakpoint desktop duy nhất là `lg:` (≥1024px)**; `--sidebar-w` + `data-sidebar` trên
   `<html>` vẫn là nguồn sự thật duy nhất của vỏ ứng dụng.
4. **Thang zinc bị ĐẢO ở 3 theme nền sáng** (`--z-50` là màu tối nhất) — token mới phải tôn
   trọng quy ước này, không được giả định z-950 luôn tối.
5. Không hard-code hex; nền tối cố định vẫn dùng `text-[#fff]` (vì `--c-white` bị đảo ở theme
   sáng) — điểm này đã được quyết định và **không đề xuất lại**.
6. Sàn chữ 11px · vùng chạm ≥ 44px · `dvh` thay `vh` — có `scripts/ui-policy.test.ts` canh.
7. Không đổi hành vi dưới 1024px.

## ⑥ Quy ước dự án liên quan

- Tailwind **3** (không phải v4), ESLint 8 `.eslintrc.cjs` — giữ nguyên phiên bản.
- Import xuyên gói dùng tên gói `@dhcb/<gói>/<file>` (không đuôi `.js`); `packages/` không
  import `apps/`.
- Dùng thang spacing Tailwind gốc, cấm px tuỳ ý (mục 5 skill `ui-ux-craftsman`).
- Comment tiếng Việt ở chỗ quan trọng.
- Trước khi sửa file dùng chung: `npm run codemap -- impact <file>`.

## ⑦ Các đợt sau (KHÔNG làm trong đợt 1)

- **Đợt 2 — trang lõi người học:** Home, Tiến độ, Chat, Luyện nói, Luyện viết, CEFR — chuyển
  sang `PageShell`/`TwoPane`, bỏ 6 bản sao bố cục, làm đầy cột phải hiện đang rỗng.
- **Đợt 3 — môn Lập trình (10 trang còn lại):** hướng chuyên sâu, chặng, khoá học, dự án,
  playground — master–detail cho danh sách dài.
- **Đợt 4 — phần còn lại + phủ breadcrumb:** EnglishHome, Practice, ExamPlan, Subjects, các trụ
  domain, `WorkKanban`/`LifeGraph` (nợ đã ghi sẵn); bổ sung node breadcrumb cho toàn bộ route
  `/lap-trinh/**` và các trang domain hiện không có tầng cha.
- **Đợt riêng (tuỳ chọn):** đổi hue bảng màu nhấn, có đo lại tương phản toàn bộ 5 theme.

## Nghiệm thu

_(điền sau khi thi hành xong)_
