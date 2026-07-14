# Audit & đặc tả: Trải nghiệm học tự nhiên, lôi cuốn (lớp cảm xúc — engagement)

> Ngày: 2026-07-11 · Trạng thái: đã duyệt, triển khai theo thứ tự V-1→V-6.
> **V-1, V-2, V-3 đã xong** (flashcard lật 3D, màn ăn mừng streak/confetti, vòng cung phiên học nối
> lộ trình↔Chat/Speaking qua `targetWords` — xem PROGRESS.md). **V-4 (mốc + huy hiệu), V-5 (Home
> "Hôm nay"), V-6 (âm UI) chưa làm.**
> Phương pháp: lái app thật bằng Playwright khổ mobile 375×812 + đọc mã nguồn xác nhận từng phát
> hiện.
>
> **Ranh giới với 2 tài liệu liên quan** (tránh trùng): `cai-tien-ui-ux.md` = lớp **cơ học** (điều
> hướng, vùng chạm) — đã xong hết. `danh-gia-tien-trien-hoc-2026-07-07.md` = lớp **sư phạm** (nội
> dung học gì). Tài liệu này = lớp **cảm xúc** (phản hồi, thành tựu, động lực quay lại).

## Bối cảnh

App có nền cơ học và sư phạm tốt nhưng lớp **cảm xúc gần như trống**: khoảnh khắc đáng ăn mừng
diễn ra câm lặng, thao tác học không có phản hồi xúc giác/chuyển động — học 1 batch giống điền
form hơn là chơi 1 màn game.

| #   | Phát hiện                                                                        | Tác động                        |
| --- | -------------------------------------------------------------------------------- | ------------------------------- |
| E1  | Khoảnh khắc thành tựu câm lặng (xong bài/quiz/lên mốc/streak: chỉ text tĩnh)     | 🔴 Mất "đỉnh" cảm xúc mỗi phiên |
| E2  | Streak thụ động — tăng không ai báo; 0 ngày hiện 💤 tiêu cực                     | 🔴 Bỏ phí cơ chế giữ chân #1    |
| E3  | Thẻ từ & quiz không có "juice" — lật tức thì, đúng/sai chỉ đổi màu, 0 haptic     | 🔴 Cảm giác "điền form"         |
| E4  | Vừa học xong đã "nợ" — badge Ôn SRS nhảy ngay khi vừa thuộc                      | 🟡 Giết cảm giác hoàn thành     |
| E5  | Mốc từ vựng bị chôn — đạt mốc không có gì xảy ra, 0 huy hiệu                     | 🟡 Bỏ phí hệ thành tựu sẵn có   |
| E6  | Phiên học không có "vòng cung" — vào thẳng thẻ 1/10, xong bài không có CTA chính | 🟡 Thiếu nhịp mở–cao trào–đóng  |
| E7  | "Tổng đã thuộc: 0/12245" gây nản ở trang tổng quan/Từ điển                       | 🟡                              |
| E8  | Trang chủ người học cũ ≈ người mới — thẻ Học tiếp lép vế giữa 7 card menu        | 🟢                              |
| E9  | App không có "giọng nói" UI — 0 âm phản hồi ngoài TTS                            | 🟢 Tùy chọn                     |

**Ràng buộc cứng**: ngân sách `size-limit` chỉ còn ~1.7kB → mọi hiệu ứng phải CSS thuần/mã cực nhẹ
hoặc tách chunk lazy.

## Nguyên tắc thiết kế (áp cho mọi đề xuất)

1. **Trung thực** — chỉ ăn mừng thành tựu thật, không XP ảo, không dark pattern (định vị "gia sư"
   chứ không phải game).
2. **Đỉnh–kết (peak-end rule)** — mỗi phiên cần 1 đỉnh cảm xúc + 1 kết rõ ràng.
3. **Nhẹ và tôn trọng** — chuyển động ≤600ms, tự tắt theo `prefers-reduced-motion`, haptic ≤40ms.
4. **Không đổi engine học** — SRS/curriculum/quiz logic giữ nguyên 100%.
5. **Ngân sách bundle** — mã mới trong initial bundle ≤~1kB; hiệu ứng nặng tách chunk lazy.
6. **Token theme** — chỉ dùng biến `--a-*` sẵn có; AA ở cả 4 theme.

## Quyết định người dùng (2026-07-11)

1. Thứ tự **V-1 → V-2** trước (80% giá trị cảm xúc).
2. **V-3 gộp đề xuất B sư phạm** (nút "Luyện ngay bằng hội thoại" bơm `targetWords`).
3. **SRS due dời +4h** thay vì tức thì (ôn cùng ngày buổi tối vẫn giữ spacing, chỉ hết cảnh "vừa
   xong đã nợ") — đồng ý.
4. **Âm UI (V-6)**: LÀM, mặc định BẬT, có toggle trong Hồ sơ (khi triển khai).

## Nội dung từng đợt

- **V-1 — "Juice" thao tác học**: lật thẻ 3D (CSS `rotateY`, tự tắt theo reduced-motion), thẻ
  trượt khi chuyển, quiz đúng/sai có pop/shake + haptic. Không đổi logic/dữ liệu.
- **V-2 — Hệ "Khoảnh khắc" + streak chủ động**: component `Celebration.tsx` dùng chung (streak/
  daily-goal/quiz-pass/milestone/exam-pass) + confetti CSS thuần lazy-load; khoảnh khắc streak bắn
  đúng 1 lần/ngày (idempotent); ô streak trang chủ có 3 trạng thái thay vì chỉ 💤; SRS
  `due: Date.now() + 4h` thay vì tức thì.
- **V-3 — Vòng cung phiên học**: màn mở mỏng (biết sắp học gì) → học → ăn mừng → 1 CTA chính (gộp
  nút "Luyện ngay bằng hội thoại" mở Chat/Speaking với `targetWords`).
- **V-4 — Mốc từ vựng + huy hiệu** (chưa làm): khoảnh khắc khi vượt mốc 100/250/500/1k/3k/5k/8k
  từ; khối "Huy hiệu" ở `/progress` suy từ dữ liệu thật có sẵn (streak, từ vựng, thi cuối cấp, lần
  đầu dùng mỗi chế độ) — không thêm bảng DB.
- **V-5 — Trang chủ "hôm nay" + lộ trình bớt bảng số** (chưa làm): sửa "0/12245" thành số trong
  ngày; gom thẻ Học tiếp + streak thành khối "Hôm nay" nổi bật; lộ trình thêm cột "hành trình" A1→C2.
- **V-6 — Âm UI** (chưa làm, tùy chọn): 3 âm ngắn WebAudio (đúng/sai/hoàn thành), toggle Hồ sơ.

## Những gì đã tốt (giữ nguyên, chỉ xây thêm)

Thẻ Học tiếp, bottom-nav, badge SRS/Từ khó, streak + vé nghỉ, mốc từ vựng đặt tên,
`BatchDoneView` ráp câu/hội thoại từ chính từ vừa học (điểm sáng sư phạm hiếm app có), mini-quiz
sai → ôn lại đúng từ sai, thi cuối cấp có màn chứng nhận, Sổ lỗi, 4 theme AA, karaoke TTS.
