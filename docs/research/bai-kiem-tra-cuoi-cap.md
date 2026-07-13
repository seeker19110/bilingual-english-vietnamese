# Nghiên cứu & Quyết định: Bài kiểm tra cuối cấp (End-of-level Assessment)

> Ngày: 2026-07-07 · Trạng thái: **ĐÃ TRIỂN KHAI**. Code: `src/lib/cefrExam.ts`,
> `src/components/CefrExam.tsx`, migration `0009` — xem PROGRESS.md.

## Bối cảnh / vấn đề

Trước đây **không có bài thi thật**: cấp CEFR sau tự mở khóa khi cấp trước đạt "≥70% từ vựng +
100% ngữ pháp" — nhưng cả hai chỉ cần **bấm nút** ("Đã thuộc"/"Đã học xong"), không chứng minh
học viên dùng được kiến thức. Tab "Kiểm tra" cũ chỉ là quiz luyện tập nhẹ (10 câu, làm lại vô hạn,
không chặn tiến độ).

## Quyết định (người dùng chốt)

1. **Chặn lên cấp**: điều kiện cũ (≥70% từ vựng + 100% ngữ pháp) chuyển thành **điều kiện DỰ THI**,
   không còn tự mở khóa cấp sau — phải **thi đạt ≥70%** mới mở khóa. Người dùng đã mở khóa từ trước
   (grandfather qua `et_cefr_unlocked_*`) **không bị khóa lại**.
2. **Đề đầy đủ 4 phần** (~24 câu, xáo trộn mỗi lần thi, chống học vẹt): Từ vựng (8 câu, 2 chiều
   EN↔VI), Ngữ pháp (8 câu điền chỗ trống), Nghe (4 câu, dùng TTS đã cache), Đọc hiểu (4 câu, dựa
   trên hội thoại mẫu).
3. **Ngưỡng đạt ≥70%** (đồng bộ `UNLOCK_PCT` sẵn có).
4. **Thi lại không giới hạn**, mỗi lần đề mới, xem lại câu sai + link mở lại bài học.
5. **Lưu kết quả lên Supabase** — cột `cefr_exams jsonb` trong `learning_progress` (migration 0009):
   `levelId → { passed, bestPct, attempts, lastAt }`, merge "chỉ tốt lên" (giữ bestPct cao hơn).

## Triển khai (3 đợt, mỗi đợt 1 PR)

1. Migration 0009 + `lib/cefrExam.ts` (dựng đề, chấm điểm) + nối `progressSync`.
2. Màn thi `CefrExam.tsx` (4 phần, full-screen) + màn chứng nhận + thẻ CTA trên trang cấp.
3. Nối luật mở khóa (`cefrProgress.ts`) + grandfather + huy hiệu ở RoadmapTab/Dashboard.

## Rủi ro đã lưu ý khi làm

- **Hồi tố khóa lại** người đang học dở — giải quyết bằng grandfather (`everUnlocked` luôn mở) + test
  ca biên riêng.
- **Kho câu mỏng** ở cấp học viên mới học — chặn dự thi tới khi đạt điều kiện học.
- **Chi phí TTS phần Nghe** — dùng cache đã mã hóa sẵn, không phát sinh lượt AI đắt.
- Không đụng tab "Kiểm tra" luyện tập cũ — bài thi là luồng riêng.
