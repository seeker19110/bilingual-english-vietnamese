# 0174 — Quy ước CI thành luật có test canh gác + tối ưu vòng 2 (đo thật)

- **Ngày:** 2026-08-27
- **Loại:** ci
- **PR:** (điền sau khi tạo)

## Số đo THẬT của vòng 1 (run CI của PR #713, không phải ước lượng)

Thời gian tường cả CI: **5 phút 50 giây** (09:00:19 → 09:06:09), so với ~15–20 phút trước đó.

| Job                      | Thời gian |
| ------------------------ | --------- |
| metadata                 | 3s        |
| audit                    | 38s       |
| build                    | 1m38      |
| static                   | 1m44      |
| unit                     | 3m09      |
| E2E mảnh 3               | 3m06      |
| E2E mảnh 1               | 3m33      |
| E2E mảnh 2               | 3m41      |
| **E2E mảnh 4 (tới hạn)** | **5m30**  |

Bóc log mảnh 4 theo mốc `##[group]Run` cho thấy chỗ tiền đi đâu:

| Bước                 | Thời gian  |
| -------------------- | ---------- |
| checkout             | 2s         |
| setup-node           | 4s         |
| `npm ci` (cache hit) | 14s        |
| cài Chromium         | 21s        |
| **chạy test**        | **4m16**   |
| **upload báo cáo**   | **29s** ⚠️ |

## Đã sửa ở vòng 2

### 1. Chỉ upload báo cáo Playwright khi ĐỎ (`if: failure()`)

Điều kiện cũ `!cancelled()` upload cả khi XANH: **29 giây** để đẩy 6,4 MB báo cáo mà không ai
mở — hơn 8% thời gian tường của cả CI, trên đúng đường tới hạn. Khi đỏ thì vẫn upload đủ như cũ,
không mất giá trị chẩn đoán.

### 2. E2E 4 → 6 mảnh

Bốn mảnh lệch nhau tới 1,5 lần (1m57 → 4m16) vì **Playwright chia mảnh theo SỐ TEST, không theo
THỜI GIAN** (đã kiểm: bản 1.62.1 không có chế độ chia theo thời lượng), mà mảnh 4 ôm cụm nặng
`programming-lesson.spec.ts` — chạy riêng file này mất **1,9 phút** cho 29 test (SQLite/WASM +
Worker + Pyodide trong trình duyệt). 1,9 phút đó là **sàn cứng** cho bất kỳ mảnh nào chứa nó.

Chia 6: 94/94/94/94/94/93 test. Cụm nặng nay đi cùng 64 test nhẹ thay vì 111. Giá phải trả:
thêm 2 runner × ~40 giây phí cố định.

### 3. GIỮ `workers: 2`, không nâng lên 3

Runner có 4 nhân nên 3 worker là khả thi về lý thuyết, nhưng đúng những test đã flaky sẵn
(`programming-lesson`) là loại nặng CPU. Một lần flake trên check **bắt buộc** `e2e` tốn cả một
vòng chạy lại — đắt hơn nhiều so với vài chục giây tiết kiệm được. Không đánh đổi.

### 4. KHÔNG cache trình duyệt Playwright (cân nhắc rồi bỏ)

Cài Chromium chỉ tốn 21s, cache lại còn ~10s. Tiết kiệm ~10 giây trên đường 5 phút, đổi lấy một
bộ phận động thêm (khoá cache cũ, cache miss âm thầm). Không đáng.

## Quy ước hoá — CLAUDE.md mục **11.1** + test canh gác

Thêm mục `11.1. Quy ước CI` vào `CLAUDE.md` với 4 luật (song song không nối đuôi · tên
`quality`/`e2e` bất biến · E2E luôn chia mảnh · artifact chỉ khi đỏ) và một luật làm việc: **ĐO,
đừng đoán** — đọc `started_at`/`completed_at` từng job và mốc `##[group]Run` trong log.

Quan trọng hơn: quy ước được **biến thành cổng chặn CI**, không để nằm dưới dạng văn xuôi mà
phiên sau đọc lướt qua — `scripts/ci-workflow-policy.test.ts` (7 test) kiểm:

1. Còn job id `quality` và `e2e`.
2. Hai job đó là job TỔNG HỢP (có `needs`).
3. **Không job nào mồ côi** — mọi job phải nằm trong cây `needs` của một trong hai. Đây là luật
   bắt được lỗi nguy hiểm nhất: thêm bước cổng mới vào một job không được `quality` gom lại thì
   cổng đó chạy nhưng đỏ vẫn merge được.
4. E2E có `--shard=` trên matrix nhiều mảnh.
5. Upload artifact có `if: failure()`.

## Bằng chứng kiểm chứng

| Việc                                                      | Kết quả                                            |
| --------------------------------------------------------- | -------------------------------------------------- |
| `npx playwright test --list --shard=N/6`                  | ✅ 563 test chia 94/94/94/94/94/93                 |
| `CI=1 npx playwright test e2e/programming-lesson.spec.ts` | ✅ 29 passed (**1,9 phút**) — đo sàn cứng của mảnh |
| `npx vitest run scripts/ci-workflow-policy.test.ts`       | ✅ 7/7 passed                                      |
| **Thử phá luật** (đổi `quality:` → `quality-gate:`)       | ✅ test ĐỎ đúng 3 ca — canh gác thật sự hoạt động  |
| `npm run typecheck`                                       | ✅ đạt                                             |
| `npm run lint`                                            | ✅ 0 cảnh báo                                      |
| `npm run test:coverage`                                   | ✅ branches 90,45% (sàn 90)                        |
| `npx prettier --check`                                    | ✅ đạt                                             |

## Việc còn lại

Con số của 6 mảnh phải đọc từ run CI của chính PR này rồi đối chiếu lại — **ước lượng không
phải bằng chứng**. Nếu `unit` (3m09) trở thành đường tới hạn mới thì đó là mục tiêu tối ưu tiếp
theo, không phải E2E.
