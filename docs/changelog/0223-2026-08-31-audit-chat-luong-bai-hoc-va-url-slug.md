# 0223 — Audit chất lượng toàn bộ bài học/khoá học + URL mang tiêu đề cho khoá, hướng, lộ trình

**Ngày:** 2026-08-31 · **Nhánh:** `claude/audit-lesson-course-quality-fgvw04`
**Báo cáo audit:** `docs/research/audit-chat-luong-bai-hoc-2026-08-31.md`

## Việc đã làm

### 1. Rà chất lượng toàn bộ nội dung học của môn Lập trình

Thêm `scripts/audit-lessons.ts` (`npm run audit:lessons`) — rà 277 bài · 5 khoá ngắn · 14 hướng ·
1 lộ trình bằng một lượt tất định, bắt lớp lỗi mà hai cổng CI sẵn có (Zod schema + chạy thật
`sampleSolution`) không thể bắt vì chúng chỉ nhìn TỪNG BÀI: bài mồ côi, tham chiếu gãy, URL slug
đụng nhau, bước ⑥ chép lại bước ③, gợi ý một bậc, thiếu ca test ẩn.

Kết quả: **tham chiếu, bài mồ côi, URL, cấu trúc 14 hướng — sạch, 0 ca.** Tìm ra và **đã sửa 9
bài** có ví dụ mẫu (bước ③) trùng hệt lời giải bài tự viết (bước ⑥), khiến bước ⑥ chỉ còn là thao
tác chép: `hermes-u1-l2/l5/l7`, `hermes-u2-l3/l5`, `vibe-u3-l2/l4`, `vibe-u4-l2`, `openclaw-u1-l2`.
Cách sửa: đổi VÍ DỤ MẪU sang tình huống khác cùng khuôn, giữ nguyên đề bài + test-case + lời giải.

Còn 4 cảnh báo là **ngoại lệ có chủ ý** (bài mở đầu khoá công cụ, lời giải chỉ đúng một lệnh).
Hai heuristic bị loại vì báo động giả (dòng Parsons trùng nhau; ca test ẩn ở bài mô phỏng công
cụ và bài SQL khớp tuyệt đối) — lý do ghi trong báo cáo để lần sau không dựng lại.

### 2. URL mới: giữ nguyên mã, nối thêm tiêu đề

Mở rộng quy ước đã áp cho trang bài học (`<mã>--<tiêu đề đã slug hoá>`) ra ba tầng còn lại:

| Trang          | Trước                       | Sau                                                |
| -------------- | --------------------------- | -------------------------------------------------- |
| Khoá ngắn      | `/khoa-hoc/git`             | `/khoa-hoc/git--git-github-thuc-hanh`              |
| Hướng          | `/huong/web`                | `/huong/web--lap-trinh-web`                        |
| Chặng hướng    | `/huong/web/web-s2`         | `/huong/web--lap-trinh-web/web-s2--full-stack-...` |
| Lộ trình       | `/lo-trinh/principal-ai`    | `/lo-trinh/principal-ai--ky-su-truong-ai`          |
| Chặng lộ trình | `/lo-trinh/<id>/chang/<id>` | cả hai đoạn đều mang thêm tiêu đề                  |

Mã vẫn đứng đầu nên **link cũ và bookmark không chết**: trang tra ra đúng nội dung rồi
`<Navigate replace>` về URL chuẩn (đúng cơ chế trang bài học, tránh Google thấy hai URL cùng nội
dung). Việc dựng URL gom về một chỗ: `apps/dhcb/src/lib/programmingRoutes.ts` — ghép chuỗi rải rác
là cách chắc chắn để một trang nào đó quên phần tiêu đề rồi sinh URL thứ hai.

## Quyết định kèm theo

1. **Không sửa 4 bài "lời giải một lệnh".** Bài dạy đọc bảng trạng thái chỉ có đúng một lệnh để
   gõ; thêm thao tác cho khác ví dụ mẫu là bịa việc. Script hạ mức xuống cảnh báo kèm lý do.
2. **`audit:lessons` ĐÃ thành cổng chặn CI** (người dùng chốt ngay sau khi đọc báo cáo, làm ở
   đợt 0224). Đặt trong job `audit` — job ngắn nhất — chứ không phải `unit`, theo luật CI mục
   11.1: bước mới gắn vào job con hợp lý nhất, không nối vào job đã dài.

## Bằng chứng kiểm chứng

- `npm run audit:lessons` → **0 LỖI · 4 cảnh báo** (đúng 4 ngoại lệ ở trên).
- `npm test` → **526 file · 9.873 test xanh** (gồm cổng nội dung chạy thật mọi ví dụ mẫu mới trên
  hermesSim/vibeSim/openclawSim) + test mới `apps/dhcb/src/lib/programmingRoutes.test.ts` (4 test)
  canh bất biến "mã luôn tách lại được từ URL" và "không hai trang cùng URL".
- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npm run format` · `npm run build` → xanh.
- `npx playwright test e2e/programming-course.spec.ts` → 13/13 xanh (gồm ca URL cũ `/lap-trinh/khoa/:id`).
- `npx playwright test e2e/programming-home.spec.ts e2e/programming-about.spec.ts` → 7/7 xanh.
- `npx playwright test e2e/a11y.spec.ts` → **247/247 xanh** (15 trang × 5 theme, gồm 4 URL mới).
