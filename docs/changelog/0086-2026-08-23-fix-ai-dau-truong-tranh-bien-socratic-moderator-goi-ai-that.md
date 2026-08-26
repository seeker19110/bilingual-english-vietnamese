# fix(ai): Đấu trường Tranh biện + Socratic Moderator gọi AI THẬT (hết scaffolding giả) (2026-08-23)

**Bối cảnh:** nợ kỹ thuật ghi từ 2026-08-21 nêu rõ _"chưa rà lại các file V6.x/V7.0 khác cùng
thời điểm với `cf44362` xem có scaffolding giả tương tự không"_ (sau khi phát hiện
`geminiLiveService` echo ngược audio người dùng giả làm phản hồi AI). Phiên này đã rà. Người
dùng chọn **hướng A — nối AI thật**.

**Rà soát: 6 tính năng đều NỐI THÔNG tới UI (người dùng bấm được thật). Tìm thấy 2 chỗ giả.**

1. **`DebateArenaService.generateAiTurn`** — chú thích ghi _"Sinh phản hồi / phản biện AI sắc
   sảo"_ nhưng trả về **1 trong 3 đoạn tiếng Anh CỨNG**, bỏ qua cả chủ đề tranh biện lẫn lập
   luận người học vừa viết. UI hiển thị "Debater AI". _(Công bằng: `analyzeArgumentTurn` chấm
   lập luận người dùng thì CÓ đọc thật nội dung — chỉ phần "đối thủ nói gì" là giả.)_
2. **"AI Socratic Moderator"** phòng học nhóm — im lặng quá ngưỡng thì phát **một câu cố định**
   dán nhãn `🤖 Đồng Hành AI`. _(VAD của service này là THẬT — tính RMS từ PCM 16-bit.)_

**4 tính năng KHÔNG giả, đã kiểm và giữ nguyên** (ghi lại để phiên sau đừng xoá nhầm):
`socraticDiagnosticsService` (ngân hàng ngộ nhận + lộ trình hỏi soạn sẵn),
`metacognitiveReflectionService` (bộ câu hỏi phản tư curated — loại nội dung này VỐN NÊN soạn
tay), `scenarioHolodeckService` (chấm theo luật nhưng CÓ đọc câu người dùng),
`stemScratchpadService` (validator ký hiệu theo luật). **Ranh giới phân định:** nội dung soạn
sẵn là hợp lệ; GIẢ là khi code trình bày kết quả như thể AI vừa suy nghĩ đáp lại người dùng,
mà thực ra là chuỗi cố định bỏ qua input.

**Đã làm:**

1. **`generateAiTurn` gọi model THẬT** — prompt dựng từ kiến nghị (motion) + 6 lượt gần nhất
   nên đối thủ phản biện đúng thứ người học vừa nói. Thành `async`.
2. **Gói dùng chung `packages/core-ai/chatFallback.ts`** — chuỗi dự phòng Groq → Anthropic →
   Gemini + tự ghi token (mục N4, chế độ `debate`/`co-learning` hiện riêng trên dashboard
   admin). Tách ra vì cả 2 chỗ vá đều cần; chép đôi ~60 dòng gọi provider là chỗ dễ lệch nhất
   về sau. `ai.ts`/`companionRuntime.ts` CỐ Ý không dùng — chúng còn phải tự quyết hoàn
   lượt/forward status gốc theo từng nhánh lỗi.
3. **Cờ `isFallback`** trong contract `DebateTurn` + payload sự kiện phòng học: khi không gọi
   được AI thì vẫn có câu mẫu NHƯNG **UI hiện badge "Câu mẫu — chưa gọi được AI"**. Không lặp
   lại lỗi cũ là im lặng để người học tưởng đang đấu với AI.
4. **`/api/debate-arena` nay có rate-limit + ĐẾM LƯỢT** (chế độ `chat`, khuôn N1 mục B3) —
   trước đây endpoint mang tiếng "AI" mà không có cả hai, vì nó chỉ trả chuỗi cứng nên không
   ai thấy cần chặn. **Hoàn lượt khi rơi vào fallback** — không tính tiền người học cho câu mẫu.
5. Moderator phòng học nhóm sinh câu hỏi bằng AI theo chủ đề phòng; **không `await` trong luồng
   relay audio** (chờ AI sẽ làm nghẽn tiếng nói cả phòng), sinh xong mới phát.

**Bài học về TEST:** bộ test cũ vẫn xanh suốt trong khi tính năng hoàn toàn giả, vì nó chỉ kiểm
`content.length > 20`. Đã thêm `debateArenaAiTurn.test.ts` ghim đúng thứ test cũ bỏ lọt: có gọi
provider không · prompt có mang chủ đề + lời người học không · model trả rỗng/lỗi mạng/không có
key thì có gắn cờ nói thật không.

**Cổng đã chạy:** typecheck ✅ · lint ✅ · format ✅ · test **4956/4956** (405 file, +8 ca mới) ✅ ·
build ✅ · size ✅ (JS 120.65/123 · CSS 15.7/16) · `git status` sau build vẫn SẠCH ✅.

**CHƯA kiểm được:** chưa gọi provider thật (sandbox không có key AI). Cần chạy thử 1 phiên
tranh biện thật sau khi deploy để xác nhận chất lượng phản biện.
