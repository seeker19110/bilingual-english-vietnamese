# 0267 — 2026-09-04 — Siết sàn coverage + vá 3 lỗi Windows chặn coverage chạy được

## Việc đã làm

Theo yêu cầu người dùng "nâng coverage lên 100%", đã chọn phương án **nâng sàn ngưỡng CI dần
dần** (thay vì viết test bổ sung cho toàn repo — khối lượng quá lớn cho một đợt).

Trước khi đo được số coverage thật, `npm run test:coverage` không chạy trọn vẹn trên Windows vì
3 lỗi độc lập — cả ba đều cùng một lớp nguyên nhân đã gặp ở PR #794 (so sánh đường dẫn `\` vs
`/` hoặc encoding console) nhưng chưa được vá hết:

1. **`apps/dhcb/src/pages/core/UiNoise.design.test.ts`** — so khớp tên file tương đối bằng
   `f.slice(SRC_DIR.length + 1)` (giữ nguyên `\` của Windows) với allowlist viết bằng `/`.
   Thêm hàm `toRelativePosix()` chuẩn hoá trước khi so sánh.
2. **`scripts/fixed-color-contrast-audit.ts`** — `relative(root, file)` cũng sinh `\` trên
   Windows, khiến `ALLOWLIST` (checkbox tick color ở `Career.tsx`/`Startup.tsx`, không phải màu
   chữ thật) không khớp được, làm test báo nhầm "rớt tương phản AA". Chuẩn hoá `/` trước khi so
   khớp.
3. **`packages/subject-programming/lessonsPython.test.ts`** — `python3` trên Windows in ra theo
   codepage console mặc định (không phải UTF-8), làm chữ tiếng Việt có dấu trong output ("Khá")
   hỏng thành ký tự thay thế trước khi Node decode UTF-8. Ép `PYTHONIOENCODING=utf-8` +
   `PYTHONUTF8=1` khi spawn.

Sau khi vá cả ba, `npm run test:coverage` chạy trọn 551/551 file · 11.160/11.160 test, đo được
số thật: **stmts 96,36% · branches 90,71% · funcs 95,19% · lines 96,36%** (so với nợ kỹ thuật
#7 đo lần trước 2026-08-28: stmts 95,28 · branches 90,56 · funcs 95,34 · lines 95,28 — đã tăng ở
3/4 chỉ số).

Siết sàn trong `vitest.config.ts` (giữ triết lý sàn tối thiểu, không phải mục tiêu, theo quyết
định gốc 2026-08-13):

| Chỉ số     | Sàn cũ | Sàn mới                             | Số đo thật |
| ---------- | ------ | ----------------------------------- | ---------- |
| statements | 90     | **95**                              | 96,36      |
| branches   | 90     | 90 (giữ nguyên — biên độ mỏng nhất) | 90,71      |
| functions  | 90     | **94**                              | 95,19      |
| lines      | 90     | **95**                              | 96,36      |

## Bằng chứng kiểm chứng

Build ✅ · Type ✅ · Lint ✅ (0 cảnh báo) · Test ✅ (11.160/11.160, 551/551 file) · Coverage ✅
đạt sàn mới (đo trực tiếp, xem bảng trên).

## Việc còn lại

Sàn `branches` giữ nguyên 90 vì biên độ hiện tại (90,71) quá mỏng để siết an toàn — nâng tiếp
đợt sau khi viết thêm test cho nhánh logic chưa phủ.
