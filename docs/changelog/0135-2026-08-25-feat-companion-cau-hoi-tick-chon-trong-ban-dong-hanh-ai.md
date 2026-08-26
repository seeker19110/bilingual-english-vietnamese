# feat(companion): câu hỏi tick chọn trong Bạn Đồng Hành AI (2026-08-25)

Người dùng trả lời câu hỏi khảo sát của Companion bằng cách **bấm tick**, thay vì gõ tay như trước.

- **Vấn đề:** Companion hay hỏi khảo sát bản thân bằng chữ thuần ("Bạn cảm thấy hạnh phúc nhất
  khi làm gì? (công việc, học tập, sáng tạo...)") — người dùng phải gõ tay, chậm trên điện thoại
  và dữ liệu thu về không chuẩn hoá được.
- **Cách làm — theo đúng khuôn `proposedActions` đã có:** LLM trả về **dữ liệu có cấu trúc** bên
  cạnh lời văn. Contract mới `packages/core-contracts/interactiveQuestion.ts`: LLM nối một khối
  ` ```dhcb-questions ` (JSON) vào cuối câu trả lời; `extractInteractiveQuestions()` gỡ khối
  đó ra khỏi lời văn và validate bằng Zod. Ràng buộc: tối đa **5 câu/lượt** (khớp luồng người mới
  "5 câu ~90 giây"), mỗi câu **2–8 lựa chọn**, `multi` (nhiều/một), `allowFreeText` (ô "Khác…").
- **NGUYÊN TẮC BẤT BIẾN — hỏng thì về hành vi cũ:** LLM là nguồn KHÔNG đáng tin, nên mọi nhánh
  (không có khối · JSON sai cú pháp · sai schema · id trùng nhau) đều rơi về **hiện chữ như cũ**,
  không bao giờ ném lỗi. Riêng khi JSON sai schema, khối vẫn bị GỠ để người dùng khỏi đọc JSON thô.
- **Điểm chạm:** `companionRuntime.ts` (nối hướng dẫn vào system prompt + trường mới
  `interactiveQuestions` trong `CompanionResponse` + sự kiện SSE mới `questions` — chỉ phát khi có,
  nên client cũ bỏ qua an toàn) · `companionApi.ts` (`onQuestions`) · `InteractiveQuestionCard.tsx`
  - `interactiveAnswer.ts` (giao diện tick, vùng chạm ≥ 44px, checkbox/radio thật + `fieldset`).
- **Câu trả lời đi vào luồng chat SẴN CÓ:** bấm "Gửi câu trả lời" gom lựa chọn thành một tin nhắn
  tiếng Việt ("Câu hỏi → đáp án A, đáp án B") rồi gọi `handleSend()` như tin nhắn thường — cơ chế
  ghi nhận hồ sơ (`update_fact`) và schema DB **không phải sửa gì**.
- **Kiểm chứng:** 5507 unit test xanh (443 file; +25 test mới: 12 contract, 9 UI/gom câu trả lời,
  4 runtime/stream). Build · typecheck · lint (0 cảnh báo) · format xanh. Initial JS
  **123,36 kB / 140 kB** (không đổi — component nằm trong chunk lazy của trang Companion).
- **Còn lại:** chưa chạy `eval:tutor` cho thay đổi system prompt của Companion (cần key AI thật —
  thuộc nợ kỹ thuật #5 vốn đã mở); prompt của gia sư tiếng Anh (`/api/agent`) KHÔNG bị đụng tới.
