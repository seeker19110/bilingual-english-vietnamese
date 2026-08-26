# feat(exam-plan): chế độ ôn thi có hạn chót — "Đếm ngược kỳ thi" (2026-08-26)

Thi hành trọn bộ E1–E4 của `docs/research/dac-ta-che-do-on-thi-2026-08-26.md`. Ý tưởng #1 của đợt
đề xuất tích hợp cùng ngày, làm ngay sau khi C1–C4 ("Người thân theo dõi") xong.

App vốn học theo nhịp VÔ HẠN (CEFR · SRS · streak). Đợt này thêm nhịp có **hạn chót thật**: người
học khai ngày thi, hệ thống chia việc ngược từ ngày đó về hôm nay.

## Đã làm

- **E1 — `packages/core-examplan/examPlan.ts`** (gói workspace mới, 18 test). Hàm thuần, tất
  định, không AI, không DB: ba giai đoạn `build` → `consolidate` → `taper`, khối lượng mỗi ngày,
  mức khả thi, đề xuất cắt phạm vi.
- **E2 — `postgres/migrations/0070_exam_plans.sql`** + `packages/core-contracts/examPlan.ts` +
  `examPlanService.ts` (11 test) + `apps/server/src/api/learning/exam-plan.ts` (15 test).
- **E3 — `apps/dhcb/src/pages/learning/ExamPlan.tsx`** (route `/on-thi`) +
  `apps/dhcb/src/lib/examPlan.ts` (9 test) + cổng a11y `e2e/a11y-exam-plan.spec.ts`.
- **E4 — nối FSRS**: `apps/dhcb/src/lib/srs.ts` nhận mức nhớ mục tiêu theo giai đoạn, có cờ tắt.

## Quyết định đáng ghi lại

1. **Lịch tính Ở CLIENT, server chỉ giữ Ý ĐỊNH.** Dữ liệu từ vựng/CEFR nằm ở `apps/dhcb/src/data`
   và trạng thái SRS ở localStorage; nhân bản chúng sang server chỉ để chia một phép chia là cái
   giá quá đắt. Bảng `exam_plans` lưu "thi gì, ngày nào, trần bao nhiêu, nghỉ ngày nào" — lịch
   luôn được tính lại từ trạng thái học thật. Có **test canh gác** bắt đỏ nếu ai đó thêm
   `buildExamPlan` vào handler.
2. **KHÔNG có bảng lịch từng ngày.** Lưu lịch xuống DB là tự chuốc bài toán đồng bộ khi người học
   đi lệch kế hoạch — mà họ luôn đi lệch.
3. **Taper (T-3 → T-0) không giao mục mới, kể cả khi còn chỗ trống.** Quyết định sư phạm, không
   phải tối ưu số học: nhồi kiến thức mới sát ngày thi làm hỏng cả phần đã thuộc.
4. **Không kịp thì nói thẳng.** Khi khối lượng vượt trần, màn hình hiện đúng con số nên cắt bớt
   thay vì im lặng nhồi lịch không ai theo nổi. Ngược lại, trễ thì **nén lịch, không phạt** —
   không có màn hình "bạn đã bỏ lỡ N ngày".
5. **Phạm vi kỳ thi = từ vựng A1 → B1** (không lấy tới B2). Đề vào 10 bám A2–B1, nhưng phải chắc
   A1 mới làm được A2. Đưa vào phạm vi thứ đề không hỏi chỉ làm kế hoạch bất khả thi giả.

## Phát hiện đo được (sửa lại hiểu biết ban đầu)

**`request_retention` KHÔNG đổi lịch ở lượt ôn đầu tiên.** Test E4 bản đầu ôn một lượt rồi khẳng
định "retention cao ⇒ ôn sớm hơn" — và đỏ. Đo thẳng bằng `ts-fsrs` cho thấy lượt đầu luôn là
**3 ngày** ở mọi mức retention; khác biệt bắt đầu từ lượt hai (0,9 → 14 ngày · 0,95 → 6 ngày) và
doãng dần (lượt bốn: 271 ngày so với 63 ngày). Thêm nữa, ôn hai lượt trong **cùng một khoảnh
khắc** thì FSRS thấy `elapsed_days = 0` và cho ra cùng lịch bất kể retention — test phải tua thời
gian tới hạn giữa hai lượt. Đã ghi nguyên nhận xét này vào comment của test để đợt sau không kết
luận nhầm "retention không có tác dụng".

## Bằng chứng

```
Build ✅ (dist + dist-server + hub) | Type ✅ | Lint ✅ 0 cảnh báo | Format ✅
Test ✅ 6222/6222 (474 file) — 53 test mới của đợt này
Boot check ✅ chạy thật: node dist-server/server.js → /api/health 200
E2E a11y ✅ 11/11 (2 màn hình × 5 theme A/AA + 1 lượt AAA) — Chromium thật
```

## ⚠️ Việc tay trước khi dùng thật

`npm run migrate:pg` trên VPS để tạo bảng `exam_plans` (hoặc để `scripts/deploy.sh` tự chạy khi
merge vào `main`).

## Việc để lại (đúng như đặc tả mục 9)

- Thi thử full-length ở mốc T-60/T-30/T-7 — **chặn bởi ngân hàng đề** (phải chốt nguồn đề không
  vi phạm bản quyền) và bởi việc `packages/core-grading` hiện không còn trong repo (khôi phục từ
  commit `9fa6f59`).
- Kỳ thi thứ hai (Toán vào 10) — chỉ mở sau khi kỳ thi đầu có người dùng thật.
- Ghép "còn N ngày đến kỳ thi" vào báo cáo tuần của "Người thân theo dõi" (một PR riêng, để không
  sửa `weeklyReport.ts` hai lần).
