# 0176 — Chặng S2: chi tiết thi hành được cho cả 13 hướng chuyên sâu (2026-08-27)

**Nhánh:** `claude/s2-specification-byj1ov` · **Đặc tả:** `docs/specs/2026-08-27-chang-s2-huong-chuyen-sau.md`

## Vấn đề

PR #712 dựng xong tầng 13 hướng chuyên sâu, nhưng mỗi chặng mới chỉ là **bản đồ**: module nào,
dự án tên gì. Người học đứng trước bản đồ vẫn hỏi hai câu app chưa trả lời được — "module này
học xong tôi làm được gì, làm sao biết đã nắm?" và "dự án coi là xong khi nào?".

Chọn **S2** làm chặng đầu tiên soạn chi tiết (không phải S1) vì: S1 phần lớn trùng xương sống
P4/P5 đã dạy, còn **S2 là chỗ đường của 13 hướng thật sự rẽ khỏi nhau** và là dự án đầu tiên đủ
lớn để phải ĐẶC TẢ trước khi làm — đúng kỹ năng mà §2.4/§2.5 của đặc tả gốc đặt làm trọng tâm.

## Đã làm

1. **Kiểu `SpecStageDetail`** (`specializations/stageDetailTypes.ts`): mỗi module có `objective`
   · `practice[]` · `selfCheck[]` (hỏi + đáp) · `doneSignals[]`; mỗi chặng có `rubric[]` (tiêu chí
   đo được + `howToProve`) và `specBrief` — **đúng sáu ô của một đặc tả kín**.
2. **13 file nội dung** `specializations/details/<hướng>-s2.ts` — phủ đủ **53 module** S2 và
   **65 tiêu chí rubric**, mỗi hướng một đặc tả mẫu 6 ô.
3. **Sổ đăng ký** `stageDetails.ts`: `getSpecStageDetail` · `getSpecModuleDetail` ·
   `countStageProgressItems`; mã lạ hoặc chặng chưa soạn → `undefined`, không đoán bừa.
4. **Test bất biến** `specStageDetails.test.ts` (15 test): phủ đủ 13 hướng · id module khớp
   1–1 với bản đồ (không thừa không thiếu) · khuôn dạng từng ô · rubric ≥ 4 và luôn có cách
   chứng minh · đặc tả 6 ô đủ mục · **chống copy-paste giữa các hướng** (không mục tiêu hay
   tiêu chí nào trùng nguyên văn ở hai hướng).
5. **Trang chặng** `/lap-trinh/huong/:specId/:stageId` (`ProgrammingSpecStagePage.tsx`), lối vào
   từ mỗi thẻ chặng ở trang hướng. Chặng chưa soạn chi tiết (S1/S3/S4) vẫn mở được: hiện bản đồ
   - ghi chú đang soạn.
6. **Tiến độ**: đánh dấu xong từng module và từng tiêu chí, lưu qua `/api/programming/progress`
   (khoá `web-s2-m1` / `web-s2-r3`). **Không cần migration** — `lesson_progress.lesson_id` là
   `text`; server nới regex và **kiểm tồn tại thật** qua registry để không ghi khoá rác.
   Bất biến cũ giữ nguyên: `completed` không bị kéo lùi.

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` ✅ (0 cảnh báo) · `npm run build` ✅
- `npx vitest run packages/subject-programming apps/server/src/api/subjects/programming` →
  **996/996 xanh** (28 file), gồm 15 test mới của chi tiết chặng và 2 test mới của endpoint tiến độ.
- E2E a11y route mới: `npx playwright test e2e/a11y.spec.ts e2e/a11y-aaa.spec.ts -g "web-s2"` →
  **10/10 xanh** (5 theme × 2 cổng A/AA và AAA).
- `npm run budget`: Initial JS **124,78 kB / 140** (baseline đợt trước 124,35) · CSS **16,27 / 18**.
  Dữ liệu chi tiết nằm ở route nạp lười nên phần tăng là mã trang, không phải nội dung.

## Cố ý để ngỏ

- **Chưa soạn bài học 8 bước** cho tầng hướng: 9/13 hướng không có bộ chạy trong trình duyệt,
  ép khuôn Predict/Parsons/Make lên chúng sẽ đẻ ra nội dung giả. Tầng này là bản đồ + nghiệm thu;
  chấm code tự động vẫn thuộc xương sống P1–P5.
- **Chưa soạn chi tiết S1/S3/S4** — khuôn và sổ đăng ký đã sẵn, thêm chặng chỉ là thêm 1 file
  nội dung + 1 dòng import.
- Chưa có gợi ý hướng theo hồ sơ năng lực (giữ nguyên lý do ở §5.3 đặc tả gốc).
