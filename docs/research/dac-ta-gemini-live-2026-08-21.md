# Đặc tả nghiên cứu: tích hợp Gemini Live API vào chế độ Luyện nói

> Ngày: 2026-08-21 · Nhánh: `claude/gemini-live-integration-xo175x` · Trạng thái: **NGHIÊN CỨU — chưa code, chờ người dùng duyệt hướng đi**.

## 1. Gemini Live là gì, khác pipeline hiện tại ra sao

**Hiện tại** (chế độ 3 — Luyện nói song ngữ, `src/pages` Speaking + `api/stt.ts` + `api/tts.ts`):

```
Ghi âm (MediaRecorder) → /api/stt (Whisper Groq/OpenAI) → text
  → /api/agent (Claude/Gemini/Groq text) → 2 câu trả lời (hội thoại + sửa lỗi)
  → /api/tts (Google Cloud TTS) × 2 lần, 2 giọng khác nhau → phát audio
```
3 bước tuần tự, độ trễ cộng dồn (STT ~1-2s + LLM ~1-3s + TTS ~1-2s), nhưng **kiểm soát được từng bước** — đặc biệt là tách được 2 giọng (giọng đích cho hội thoại, giọng mẹ đẻ cho sửa lỗi/giải thích) vì TTS gọi riêng cho từng đoạn text.

**Gemini Live API**: 1 kết nối **WebSocket song công** (WSS) duy nhất tới Gemini — client gửi audio stream liên tục, server Google tự làm STT + suy luận + TTS **bên trong mô hình**, trả về audio ngay khi có (không đợi câu nói xong hẳn), hỗ trợ **barge-in** (ngắt lời AI giữa chừng), độ trễ mục tiêu là "gần real-time" (dưới ~1s), không có bước "text ở giữa" mà ứng dụng kiểm soát trực tiếp.

## 2. Vấn đề cốt lõi: đặc trưng "2 giọng" của sản phẩm

Đây là điểm khác biệt phải giữ của app (CLAUDE.md mục 1): hội thoại bằng **giọng ngôn ngữ đích**, sửa lỗi/giải thích bằng **giọng tiếng mẹ đẻ**. Một phiên Live chỉ cấu hình **1 giọng cố định** cho toàn phiên (chọn từ 30 giọng HD có sẵn, đặt lúc mở kết nối) — model không tự chuyển giọng giữa chừng theo ngữ cảnh nội dung.

→ Không thể thay thế 1:1 pipeline hiện tại bằng 1 phiên Live duy nhất mà giữ được tính năng lõi.

**3 phương án khả thi, xếp theo mức xáo trộn kiến trúc:**

| Phương án | Cách làm | Ưu | Nhược |
|---|---|---|---|
| **A. Không đổi kiến trúc, chỉ thay STT** | Dùng Live API kiểu "chỉ nghe" (nhận audio → trả text, tắt output audio) thay Whisper, giữ nguyên LLM text + TTS Google 2 giọng như cũ | Rủi ro thấp, không phá tính năng 2 giọng | Không tận dụng được lợi ích chính của Live (độ trễ thấp, barge-in) — gần như phí Live để làm việc mà Whisper đã làm rẻ hơn |
| **B. 2 phiên Live song song** | 1 phiên Live giọng đích cho hội thoại, 1 phiên Live giọng mẹ đẻ cho sửa lỗi, đồng bộ tay | Có barge-in + độ trễ thấp cho cả 2 luồng | Phức tạp cao: 2 WebSocket, chi phí gần gấp đôi, đồng bộ 2 audio stream dễ lệch/rối UI |
| **C. Live cho hội thoại, giữ pipeline cũ cho sửa lỗi** | Hội thoại chính (nói qua nói lại) chạy qua Live (1 giọng đích, có barge-in); phần sửa lỗi/giải thích vẫn lấy transcript rồi gọi `/api/agent` + `/api/tts` như cũ | Cân bằng: có trải nghiệm real-time cho phần hội thoại (giá trị UX rõ nhất), giữ nguyên cơ chế 2 giọng đã có | Vẫn phải chạy 2 hệ thống song song trong cùng 1 tính năng, tăng độ phức tạp code |

**Đề xuất cá nhân: Phương án C**, thử nghiệm trước ở dạng tính năng phụ (ví dụ nút "Chế độ real-time" riêng trong Luyện nói), không thay thế luồng cũ ngay — để so sánh trải nghiệm + chi phí thật trước khi quyết định thay hẳn.

## 3. Chi phí (tra ngày 2026-08-21, xem lại trước khi triển khai vì giá đổi thường xuyên)

- Live API: **$3/1M token audio input, $12/1M token audio output** — quy đổi ~25 token/giây audio ⇒ khoảng **$0.037/phút hội thoại 2 chiều**.
- So với hiện tại: Whisper (Groq free/rẻ) + Claude Haiku (rẻ) + Google TTS (theo ký tự, có cache) — ước tính rẻ hơn nhiều lần cho hội thoại ngắn, đặc biệt vì đã có cache TTS vĩnh viễn (không tính lại phí giọng đã phát trước đó).
- Live API **không cache được** theo cách TTS hiện tại (audio sinh ra theo ngữ cảnh hội thoại, không lặp lại y hệt) → mất lợi thế cache đang có.
- Cần bật đếm lượt riêng (giống `stt_count`) nếu dùng thật, tránh vỡ ngân sách Free/Pro.

Nguồn tham khảo giá: [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini 2.5 Flash Native Audio pricing — FutureAGI](https://futureagi.com/llm-cost-calculator/google/gemini-2-5-flash-native-audio-latest/).

## 4. Ràng buộc kỹ thuật khác

- **Không gọi thẳng từ client** — lộ `GEMINI_API_KEY`. Phải làm server proxy WebSocket trong `server.ts` (đúng nguyên tắc mục 4.2 CLAUDE.md: logic nhạy cảm ở server). Việc thêm 1 tầng proxy WS vào Express hiện tại (vốn là HTTP request/response, không có WS) là thay đổi hạ tầng, cần kiểm tra Express + `ws` hoạt động ổn với PM2 cluster mode 3 instances (sticky session cho WebSocket — nếu không cấu hình đúng ở Nginx, client có thể bị route sang instance khác giữa phiên và rớt kết nối).
- Tiếng Việt nằm trong danh sách 70 ngôn ngữ Live API hỗ trợ chính thức — khả thi về mặt ngôn ngữ. (Nguồn: [Live API overview](https://ai.google.dev/gemini-api/docs/live-api).)
- Cần key `GEMINI_API_KEY` riêng hoặc dùng chung key Gemini đã có cho chat text (`GEMINI_CHAT_MODEL` trong `api/_lib/aiConfig.ts`) — kiểm tra hạn mức/billing tách biệt.

## 5. Đề xuất các bước tiếp theo (nếu bạn duyệt Phương án C)

1. **Prototype nhỏ, tách biệt hoàn toàn khỏi luồng Speaking hiện tại** — 1 endpoint WS thử nghiệm trong `server.ts`, không đụng `api/stt.ts`/`api/tts.ts`, để nghe thử độ trễ/giọng tiếng Việt thật trước khi quyết định đầu tư tiếp.
2. Đo thử chi phí + độ trễ thật, so với pipeline cũ.
3. Nếu ổn: thiết kế UI bật/tắt "Chế độ real-time" trong trang Luyện nói, đếm lượt riêng, migration nếu cần bảng theo dõi.
4. Viết test + cập nhật `PROGRESS.md` theo quy định mục 3 CLAUDE.md (PR = coi như xong, phải cập nhật tài liệu ngay trong PR).

**Việc dừng ở đây chờ bạn quyết định**: chọn Phương án A/B/C, hoặc dừng hẳn (giữ pipeline hiện tại) — đây là quyết định kiến trúc lớn, đúng loại việc CLAUDE.md yêu cầu hỏi trước khi làm (mục 12).
