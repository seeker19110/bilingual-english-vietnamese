# Đánh giá & đề xuất: giúp việc học tiến triển tốt hơn (2026-07-07)

> Ngày: 2026-07-07 · Trạng thái: đề xuất A→H, đánh giá lại toàn hệ thống sau khi engine SRS/từ vựng
> đã trưởng thành (đợt cải tiến `cai-tien-lo-trinh-hoc.md` 2026-07-04 đã triển khai gần hết — xem
> mục "Đã tốt" bên dưới).
> **Cập nhật trạng thái (xem PROGRESS.md):** **A (Sổ lỗi cá nhân) đã xong** (`src/lib/mistakes.ts`,
> trang `/mistakes`). **B đã có nền** (`targetWords?` trong prompt) **nhưng chưa có nút CTA riêng**.
> **C, D, E, F, G, H chưa làm.**

## Bối cảnh / chẩn đoán

Sau khi engine từ vựng-SRS đã ngang tầm các app lớn, đánh giá lộ ra điểm nghẽn sư phạm còn bỏ
trống: **người học học từ vựng trong "silo" tách biệt hoàn toàn với 3 chế độ AI (Chat/Viết/Nói)**.
Từ vừa học không quay lại trong hội thoại; lỗi AI sửa trong Chat/Viết/Nói "bay hơi" — không thành
thẻ ôn; mọi bài luyện từ vựng chỉ là **nhận biết** (trắc nghiệm), chưa có **sản xuất chủ động**
(gõ/nói ra). Đây là chặng "recognition → production → use" mà SLA coi là khó nhất và quyết định
việc có dùng được ngoại ngữ hay không.

## Đề xuất & ưu tiên

| # | Đề xuất | Vì sao quan trọng | Ưu tiên | Trạng thái |
| - | ------- | ------------------ | ------- | ---------- |
| A | Sổ lỗi cá nhân — thu lỗi AI sửa ở Chat/Viết/Nói → thẻ ôn cá nhân hóa | Tài liệu ôn giá trị nhất đang bị vứt | 🔴 Cao | ✅ Đã xong |
| B | Nối lộ trình ↔ 3 chế độ AI — nút "luyện từ hôm nay bằng hội thoại" | Đóng vòng recognition→use | 🔴 Cao | ⏳ Có nền (`targetWords`), thiếu nút CTA |
| C | Bài luyện sản xuất chủ động — gõ chính tả/nói lại cho từ đã học | Recall mạnh hơn recognition | 🟡 TB | Chưa làm |
| D | Nghe hiểu thành dạng bài chính — audio→chọn nghĩa/chép chính tả | Tận dụng cache TTS $0 | 🟡 TB | Chưa làm |
| E | Ngữ pháp có vòng lặp ôn nhẹ — theo dõi mastery + nhắc ôn | Ngữ pháp chưa có retention loop | 🟡 TB | Chưa làm |
| F | Giữ chân: streak freeze + tổng kết tuần | Giảm churn | 🟢 Thấp | Streak freeze đã có; tổng kết tuần chưa |
| G | Chấm phát âm cấp âm vị (thay Levenshtein-trên-STT) | Đúng lời hứa "gia sư giọng nói" | 🟢 Thấp | Chưa làm, tốn tiền — chờ có Pro |
| H | SM-2 → FSRS | Giảm 20–30% lượt ôn | 🟢 Thấp | Chưa làm |

**Thứ tự khuyến nghị:** A → B (giá trị sư phạm cao nhất/giờ code, tận dụng đúng thứ đối thủ không
có — AI hội thoại + TTS 2 giọng) → D (rẻ) → C → E → F → G/H (sau).

## Cơ sở khoa học

- **Output Hypothesis (Swain)**: chỉ input chưa đủ, phải tạo ra ngôn ngữ + nhận phản hồi mới
  chuyển "biết" thành "dùng được" → nền tảng cho B, C.
- **Testing effect có phân cấp**: free recall (gõ/nói) > cued recall > recognition (trắc nghiệm) —
  bài hiện tại dừng ở đáy thang → C nâng bậc.
- **Error-driven learning**: phản hồi sửa lỗi chỉ "ăn" khi được ôn lại có chủ đích → nền tảng A.
- **Spacing** áp cho mọi loại kiến thức, không riêng từ vựng → E.
- Nguồn: Swain (1985), Roediger & Karpicke (2006), Lyster & Ranta (1997), Cepeda et al. (2006).

## Quyết định kỹ thuật đáng chú ý (đề xuất A, đã áp dụng)

Sổ lỗi lưu **client-side (localStorage) + đồng bộ**, không tạo bảng Supabase riêng — tránh
migration, theo mẫu `learning_progress`. Parse cặp câu sai/đúng từ định dạng phản hồi AI có sẵn
("✅ Nhận xét"); có nhánh bỏ qua khi không parse được (không throw).

## Đề xuất B (chưa hoàn thiện) — chi tiết còn lại

Thêm nút **"Luyện các từ này bằng hội thoại"** ở màn "xong batch"/trang cấp → mở Chat/Nói với
`targetWords` bơm sẵn (tham số đã có trong prompt, chỉ thiếu điểm vào từ UI). Tùy chọn: chấm điểm
cuối phiên báo "đã dùng được X/Y từ mục tiêu".

## Những gì đã làm tốt (giữ nguyên, không cần đụng lại engine SRS)

SRS toàn cục + chống ngợp (cap phiên, ưu tiên quá hạn), leech tự động, mini-quiz phủ đủ batch 2
chiều, tốc độ học 5/10/20 từ/ngày, "Mở rộng" sắp theo tần suất, xen kẽ từ vựng↔ngữ pháp, test-out
"Tôi đã biết vòng này", quiz ngữ pháp trong tab Kiểm tra, học trong ngữ cảnh (`BatchDoneView`),
lỗi người Việt hay mắc nhúng vào prompt. Việc tiếp theo nằm ở **kết nối** và **chiều sản xuất**,
không phải tinh chỉnh thêm SRS.
