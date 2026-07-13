# Gia sư ngôn ngữ AI (Việt ⇄ Anh) — Định vị sản phẩm & prompt gốc

> Tài liệu **kế hoạch/định vị ban đầu**, giữ lại làm tham khảo cho bộ prompt và lý do thiết kế.
> Trạng thái triển khai thật xem `PROJECT.md`/`PROGRESS.md`. Sản phẩm **đã build và deploy xong**
> (https://en-vi.donghanhcungban.com) — phần lộ trình/tuần trong bản kế hoạch gốc không còn áp dụng.

## 1. Định vị

Đối thủ tham khảo: ELSA Speak (~13 USD/tháng, mạnh chấm phát âm nhưng không phải "gia sư" trò
chuyện), Talkpal (~6 USD, không giải thích tiếng Việt), Speak (~57-71 USD, quá đắt), Talkio/Loora
(~10-11 USD, không hợp người Việt mới).

**Lợi thế cạnh tranh (USP) — phải bám chặt:**

1. **Sửa lỗi & giải thích bằng GIỌNG tiếng mẹ đẻ** — không chỉ chữ. Đối thủ quốc tế không có
   giọng Việt tự nhiên; đây là thứ người mới rất cần.
2. **Luyện nói song ngữ:** AI hội thoại giọng ngôn ngữ đích, rồi đổi giọng tiếng mẹ đẻ khi nhận xét.
3. **Gộp 3 kỹ năng** (nói + viết + chat) trong 1 app.
4. **Miễn phí** cho cộng đồng (quyết định 2026-07-11 — xem `CLAUDE.md` mục 13).
5. **Nội dung "rất Việt Nam"**: phỏng vấn xin việc VN, thi IELTS, giao tiếp công sở, du học.

### 1b. Chiều B — dạy tiếng Việt cho người nước ngoài (qua tiếng Anh)

Đảo vai hai ngôn ngữ: AI hội thoại giọng Việt, sửa lỗi/giải thích giọng Anh. Ngách ít đối thủ
hơn nhiều so với mảng học tiếng Anh. Đối tượng: người nước ngoài sống/làm việc ở VN, vợ/chồng
người Việt, Việt kiều muốn lấy lại tiếng mẹ đẻ. Tận dụng lại gần như toàn bộ hệ thống (chỉ đổi
prompt + đổi giọng TTS) — đã triển khai xong (nút gạt chiều A/B).

## 2. Kiến trúc thiết kế hai chiều

Biến `direction` (`Direction` trong `src/types.ts`) quyết định: (1) prompt nào dùng, (2) giọng
đọc hội thoại, (3) giọng đọc giải thích — mở thêm chiều chỉ là đổi cấu hình, không viết lại.
Chi tiết đầy đủ: `BILINGUAL_SYSTEM.md`.

| Chiều học                     | Hội thoại (đích) | Giải thích (mẹ đẻ) |
| ------------------------------ | ------------------ | -------------------- |
| A — Việt học Anh                | giọng English       | giọng tiếng Việt      |
| B — Người nước ngoài học Việt   | giọng tiếng Việt    | giọng English          |

**Mẹo kỹ thuật cốt lõi:** AI trả JSON tách riêng phần hội thoại và phần giải thích (2 trường),
app gọi TTS 2 lần với 2 giọng khác nhau — không nhét cả hai thứ tiếng vào một lần đọc.

## 3. Bộ prompt nền (tài sản cốt lõi, tinh chỉnh liên tục)

Bản triển khai thật ở `src/prompts/index.ts` (đã tinh chỉnh nhiều lần — giọng thân mật hơn, luôn
kèm câu động viên khi sửa lỗi). Dưới đây là ý tưởng gốc, giữ tham khảo:

**Luyện nói song ngữ, chiều A** — gia sư tiếng Anh, đóng vai theo tình huống, sau mỗi câu học
viên: chỉ lỗi (nếu có) → viết lại câu đúng → giải thích ngắn gọn bằng tiếng Việt; luôn hỏi tiếp
1 câu để duy trì hội thoại. Trả JSON `{ speech, feedback, corrected }` — app đọc `speech` bằng
giọng Anh, `feedback` bằng giọng Việt.

**Luyện nói song ngữ, chiều B** — bản đảo chiều: hội thoại tiếng Việt, giải thích tiếng Anh.

**Luyện viết (kiểu IELTS):** chấm 4 tiêu chí (Task Response, Coherence & Cohesion, Lexical
Resource, Grammatical Range & Accuracy) → điểm từng tiêu chí + tổng; 3-5 lỗi quan trọng nhất
(trích câu sai → sửa → giải thích); gợi ý nâng band; đoạn viết mẫu. Giọng điệu khích lệ.

**Chat (text-only):** như luyện nói song ngữ nhưng không có audio, trình bày 💬 câu thoại / ✅
nhận xét.

## 4. Chi phí API — nguyên tắc giữ chi phí thấp (vẫn áp dụng)

1. Giới hạn lượt theo ngày/tính năng, đếm ở server (đã làm — `daily_usage`, atomic).
2. Dùng model rẻ trước; chỉ nâng cấp khi thật sự cần.
3. Giải thích tiếng mẹ đẻ ngắn gọn — vừa sư phạm, vừa tiết kiệm ký tự TTS.
4. Cache audio TTS hay lặp lại (đã làm — `tts_cache`, cache theo hash).
5. Whisper Groq (`whisper-large-v3-turbo`) rẻ/miễn phí hơn OpenAI cho STT — dùng làm ưu tiên.

## 5. Rủi ro & cách xử lý (vẫn còn giá trị)

| Rủi ro                       | Cách giảm                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------- |
| Chi phí API vượt kiểm soát     | Giới hạn lượt chặt, model rẻ, cache TTS, atomic đếm lượt server-side          |
| Đối thủ lớn (ELSA, Talkpal)     | Bám USP: giọng tiếng Việt giải thích + miễn phí + nội dung Việt + gộp 3 kỹ năng |
| Giọng nói khó làm/nghe giả      | Tách riêng giọng đích và giọng mẹ đẻ, dùng TTS chất lượng cao (Google Cloud)    |
| Độ trễ nói (STT→AI→TTS)         | Cache câu mẫu hay lặp; đọc giọng ngay khi có kết quả                           |
| Phụ thuộc 1 nhà cung cấp API    | Đã thiết kế đổi được provider (Groq/OpenAI cho STT, nhiều lựa chọn cho chat)   |

## 6. Marketing (chưa triển khai, tham khảo khi cần)

- TikTok/Reels: demo "học viên nói sai → AI sửa bằng giọng tiếng Việt" — dễ viral ở VN.
- Group Facebook học tiếng Anh/IELTS/TOEIC — giúp đỡ thật, tặng dùng thử.
- Nội dung miễn phí dẫn dắt (mẫu câu phỏng vấn, lỗi hay gặp) → dẫn về app.
- Kênh chiều B (tiếng Anh): group expat ở VN, nội dung "Survival Vietnamese", hợp tác trung tâm
  dạy tiếng Việt cho người nước ngoài.
