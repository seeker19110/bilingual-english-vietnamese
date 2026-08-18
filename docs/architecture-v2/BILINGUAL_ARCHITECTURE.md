# Hệ Thống Song Ngữ Hai Chiều & Gia Sư Ngôn Ngữ AI (Bilingual Architecture)

> Tài liệu tổng hợp định vị sản phẩm, kiến trúc kỹ thuật hai chiều (Việt ⇄ Anh), cơ chế điều phối Prompt và giải pháp TTS/STT phân tách giọng nói trong nền tảng **Đồng Hành**.

---

## 1. Định Vị Sản Phẩm & Lợi Thế Cạnh Tranh (USP)

| Chiều       | Học viên mục tiêu               | Giao diện  | Hội thoại (Ngôn ngữ đích) | Nhận xét & Sửa lỗi (Tiếng mẹ đẻ) |
| :---------- | :------------------------------ | :--------- | :------------------------ | :------------------------------- |
| **Chiều A** | Người Việt học Tiếng Anh        | Tiếng Việt | Tiếng Anh (`en-US`)       | Tiếng Việt (`vi-VN`)             |
| **Chiều B** | Người nước ngoài học Tiếng Việt | Tiếng Anh  | Tiếng Việt (`vi-VN`)      | Tiếng Anh (`en-US`)              |

**Lợi thế cốt lõi**:

1. **Phân tách giọng nói bản xứ**: AI hội thoại bằng giọng ngôn ngữ đích, sau đó chuyển sang giọng tiếng mẹ đẻ để nhận xét ngữ pháp/phát âm.
2. **Tích hợp 3 trong 1**: Luyện Nói (Voice), Luyện Viết (Writing/IELTS) và Trò Chuyện (Chat) trong cùng một nền tảng mượt mà.
3. **Phù hợp bối cảnh văn hóa Việt Nam**: Tình huống phỏng vấn xin việc, IELTS, giao tiếp công sở và thi chuyển cấp.

---

## 2. Kiến Trúc Điều Phối Hai Chiều (Bidirectional Engine)

1. **State & Direction Type**:
   - `Direction = 'A' | 'B'` được định nghĩa tại `apps/english/src/types.ts`.
   - Lưu trữ và đồng bộ qua `getDirection()` / `setDirection()` tại `apps/english/src/lib/storage.ts`.
   - Người dùng chuyển đổi trực tiếp trên thanh điều hướng qua `LangProvider.tsx`.
2. **Định Dạng JSON Giao Tiếp Của AI**:
   Mọi phản hồi từ AI trong chế độ Chat/Speaking đều tuân thủ cấu trúc JSON phân tách 3 trường:
   ```json
   {
     "speech": "<câu hội thoại ngôn ngữ đích — đọc bằng giọng target>",
     "feedback": "<nhận xét lỗi & giải thích — đọc bằng giọng native, rỗng nếu không có lỗi>",
     "corrected": "<câu sửa chuẩn ngữ pháp>"
   }
   ```

---

## 3. Kiến Trúc Xử Lý Âm Thanh Hai Giọng (Bilingual Voice TTS/STT)

1. **Điều Phối TTS Đa Giọng (`speakBilingual`)**:
   - Phân bổ 2 giọng khác nhau: Giọng hội thoại chính (`en-US-Chirp3-HD-Kore`) và giọng giải thích (`vi-VN-Chirp3-HD-Kore` hoặc giọng đối lập giới tính qua `getNativeVoicePref()`).
   - Tích hợp callback highlight chữ theo thời gian thực (Karaoke style).
2. **Bộ Nhớ Đệm Âm Thanh (Audio Caching Pipeline)**:
   - Toàn bộ audio sinh ra được hash SHA-256 nội dung và lưu trữ trong bảng `tts_cache`.
   - Lưu trữ file mã hóa AES-256-GCM trên Cloudflare R2 hoặc VPS local storage (`STORAGE_DRIVER`).
   - Bỏ qua TTS gọi mạng nếu bản ghi đã tồn tại trong cache.
