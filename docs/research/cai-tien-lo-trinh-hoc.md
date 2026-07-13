# Nghiên cứu: Cải tiến bài học & thứ tự học (lộ trình /learning-path)

> Ngày: 2026-07-04 · Trạng thái: đề xuất đã được duyệt và triển khai qua nhiều đợt (xem
> `PROGRESS.md` để biết PR/trạng thái từng mục — nhiều đề xuất bên dưới đã thành tính năng thật:
> tốc độ học 5/10/20 từ/ngày, sắp "Mở rộng" theo tần suất, gắn nhãn CEFR toàn từ điển...).
> Mục tiêu ban đầu: học dễ dàng, tự nhiên, ra kết quả nhanh, không nản lòng.

## Bối cảnh

Hệ thống đã có nền tốt (SRS, vòng chủ đề, lộ trình CEFR, quiz mở batch, streak) nhưng đối chiếu
với khoa học học ngôn ngữ (SLA) và kinh nghiệm Anki/Duolingo lộ ra **5 điểm nghẽn chính**:

| # | Vấn đề | Tác động |
| - | ------ | -------- |
| 1 | Ôn SRS bị chia theo cấp — từ cấp cũ đến hạn không hiện khi đang học cấp mới | 🔴 Mất kiến thức đã học |
| 2 | Không giới hạn số thẻ ôn/phiên khi quay lại sau nghỉ — dồn hàng trăm thẻ → ngợp | 🔴 Churn cao nhất (theo Duolingo) |
| 3 | ~8.500 từ "Mở rộng" xếp theo ALPHABET thay vì tần suất sử dụng | 🔴 Kết quả chậm |
| 4 | Học từ = nhìn 1 lần rồi bấm "Đã thuộc"; mini-quiz chỉ hỏi 5/20 từ, 1 chiều | 🟡 Nhớ nông |
| 5 | Phải xong 100% từ vựng của unit mới gợi ý ngữ pháp — đơn điệu, dễ nản | 🟡 Nhàm |

## Cơ sở khoa học chính

- **Luật Zipf**: ~2.000 từ thông dụng nhất phủ ~90% văn bản → thứ tự học từ vựng phải theo
  **tần suất**, không alphabet.
- **Số từ mới/ngày** (Nakata 2015): 15 từ/buổi nhớ 73%, 40 từ chỉ nhớ 42% → khuyến nghị 10–20/ngày.
- **Testing effect**: tự nhớ lại (recall) mạnh hơn đọc lại nhiều lần; kiểm tra 2 chiều (EN↔VI)
  bền hơn 1 chiều.
- **Lý do bỏ học số 1** (Duolingo): không phải vì khó mà vì nghỉ vài ngày rồi thấy ngợp khi quay
  lại — streak freeze giảm churn 21%.
- **Interleaving**: xen kẽ dạng bài (từ vựng ↔ ngữ pháp ↔ nghe) giữ chú ý tốt hơn học "block" dài.
- **FSRS vs SM-2**: FSRS cần ít hơn 20–30% lượt ôn cho cùng mức nhớ — nâng cấp tùy chọn, chưa gấp.

Nguồn: newgeneralservicelist.com/coverage · Nakata 2015 (SSLA) · blog.duolingo.com (streaks) ·
antiagent.io/blog/fsrs-vs-sm-2.

## Quyết định & kế hoạch theo đợt

| Đợt | Nội dung | Vấn đề giải quyết |
| --- | -------- | ------------------ |
| 1 | SRS toàn cục (không chia theo cấp) + cap ~30–60 thẻ/phiên ưu tiên quá hạn + leech tự động (`lapses` ≥3 lần quên → "Từ khó") | V1, V2, V10 |
| 2 | Mini-quiz đủ 20 từ (không chỉ 5), trộn 2 chiều EN↔VI, sai thì hiện lại thẻ | V4 |
| 3 | Chọn tốc độ học 5/10/20 từ/ngày ở Hồ sơ (mặc định mới 10, người cũ giữ 20) | V7 |
| 4 | Sắp "Mở rộng" theo tần suất (script offline thêm `freq`) + chạy `tag:cefr` gắn nhãn CEFR | V3 |
| 5 | `findNextStep` xen kẽ từ vựng↔ngữ pháp + nút "Tôi đã biết vòng này" (test-out 10 câu) | V5, V6 |
| 6 (sau) | Quiz ngữ pháp trộn vào tab Kiểm tra; streak freeze; cân nhắc FSRS | V8, V2, V9 |

**Những cái giữ nguyên (đã đúng)**: SRS due-ngay-hôm-học, quiz 100% mới mở batch mới, màn "xong
batch" có câu/hội thoại từ chính các từ vừa học (contextualization — điểm mạnh hiếm app nào có),
ngưỡng mở cấp 70% + grandfather, bài ngữ pháp có "lỗi người Việt hay mắc".

**Rủi ro đáng chú ý đã lưu ý khi làm**: đổi thứ tự lộ trình không mất tiến độ đã học (lưu theo từ,
không theo vị trí); đổi mặc định tốc độ 20→10 cần cập nhật FAQ/CLAUDE.md cùng lúc.
