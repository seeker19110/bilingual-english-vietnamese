# 0173 — Chia nhỏ CI: 4 nhánh chất lượng song song + E2E 4 mảnh

- **Ngày:** 2026-08-27
- **Loại:** ci
- **PR:** (điền sau khi tạo)

## Vấn đề

`.github/workflows/ci.yml` chỉ có **2 job**, cả hai đều là chuỗi tuần tự dài:

- `quality`: typecheck → lint → format → test+coverage → build → size-limit → boot check →
  `npm audit` → codemap cycles. Chín bước nối đuôi trên MỘT runner; một bước chậm là cả cổng chậm.
- `e2e`: **563 test** (22 file) chạy trên **một runner với đúng 1 worker**
  (`workers: process.env.CI ? 1 : undefined`).

Hệ quả: mỗi vòng CI ~15–20 phút, và vì `main` bật auto-merge cho mọi PR (CLAUDE.md mục 11),
thời gian đó nhân lên theo số lần push sửa.

## Đã làm

### 1. Tách `quality` thành 4 nhánh chạy song song

| Job mới  | Nội dung                                    |
| -------- | ------------------------------------------- |
| `static` | typecheck + lint + format:check             |
| `unit`   | `npm run test:coverage` (gồm cổng coverage) |
| `build`  | build + size-limit + boot check server      |
| `audit`  | `npm audit --omit=dev` + codemap cycles     |

Bốn nhánh này **không phụ thuộc nhau** nên chạy đồng thời; tổng thời gian tường nay bằng nhánh
chậm nhất (`build`) thay vì tổng chín bước.

### 2. E2E chia 4 mảnh (`--shard`) + 2 worker mỗi mảnh

- `e2e-shard` là matrix `[1,2,3,4]`, mỗi mảnh chạy `npm run test:e2e -- --shard=N/4`.
- `fail-fast: false` — một mảnh đỏ không giết ba mảnh kia, để xem hết lỗi trong một vòng.
- `playwright.config.ts`: `workers` trên CI **1 → 2** (mỗi runner ubuntu-latest có 4 nhân, mỗi
  mảnh giờ chỉ gánh ~1/4 số test nên 2 worker vẫn thoải mái).
- Báo cáo Playwright upload theo tên riêng từng mảnh (`playwright-report-shard-N`) — artifact
  trùng tên sẽ bị `upload-artifact@v4` từ chối.

Cân bằng mảnh thực đo: 141 / 141 / 141 / 140 test; các file a11y nặng rơi vào ba mảnh khác nhau.

### 3. Giữ NGUYÊN tên hai required status check

`quality` và `e2e` nay là **job tổng hợp** (`needs:` các job con, chỉ kiểm `result`). Đây là
điểm quan trọng nhất của thay đổi: branch protection nhánh `main` yêu cầu đúng ba check
`quality`, `e2e`, `metadata` (CLAUDE.md mục 13.6) — đổi tên job là auto-merge kẹt vĩnh viễn trên
mọi PR đang mở. Hai job tổng hợp `exit 1` nếu bất kỳ job con nào không `success`, nên cổng vẫn
chặt đúng như cũ, không nới lỏng gì.

## Bằng chứng kiểm chứng

| Việc                                          | Kết quả                                                       |
| --------------------------------------------- | ------------------------------------------------------------- |
| `python3 -c "yaml.safe_load(...)"`            | ✅ 7 job: static, unit, build, audit, quality, e2e-shard, e2e |
| `npx prettier --check` 2 file sửa             | ✅ đạt chuẩn                                                  |
| `npx playwright test --list --shard=N/4`      | ✅ 563 test chia 141/141/141/140                              |
| `CI=1 npx playwright test --shard=4/4` (thật) | ✅ **137 passed (5,1 phút)**, 3 flaky đã xanh lại ở lần thử 2 |

Ba ca flaky đều ở `e2e/programming-lesson.spec.ts` (bài SQL/DOM chạy WASM + Worker trong trình
duyệt) — vốn đã nặng từ trước, và `retries: 1` sẵn có đã bắt được. Cần theo dõi vài vòng CI đầu
xem 2 worker có làm chúng nặng thêm không; nếu có, hạ riêng mảnh chứa chúng chứ đừng quay về 1
worker cho tất cả.

## Không đụng tới

Nội dung test, ngưỡng coverage, ngân sách bundle, `pr-policy.yml`, `deploy.yml` — thay đổi này
thuần về **cách xếp việc trên runner**, không nới bất kỳ cổng nào.
