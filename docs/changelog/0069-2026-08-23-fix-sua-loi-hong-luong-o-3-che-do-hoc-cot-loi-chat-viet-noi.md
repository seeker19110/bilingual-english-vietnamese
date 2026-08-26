# fix: sửa lỗi hỏng luồng ở 3 chế độ học cốt lõi (Chat/Viết/Nói) — PR B trong loạt nâng cấp toàn diện (2026-08-23)

**Bối cảnh:** tiếp nối PR A (sửa key token sai cụm gamification) trong kế hoạch 7 PR (A→G) + 4
việc quyết định lớn đã người dùng duyệt. PR B xử lý các phát hiện nghiêm trọng nhất trong 3 chế
độ học CỐT LÕI (mô tả ở CLAUDE.md mục 1) — do Explore agent khảo sát trước đó.

**Lỗi đã sửa:**

1. **Bấm "Bắt đầu hội thoại/luyện nói" khi hết lượt = im lặng hoàn toàn** ở cả Chat và Speaking:
   `startSession` gọi `setLimitHit(true)` nhưng `SetupScreen` chỉ đọc prop `error` (banner
   `limitHit` chỉ render trong nhánh ĐÃ có session) — người dùng tưởng app hỏng. Speaking còn
   tệ hơn: `SetupScreen` không hề nhận cả `error` lẫn `loading`. Sửa: `Chat.tsx`/`Speaking.tsx`
   set thêm `error` với thông điệp thân thiện ở đúng điểm chạm; `Speaking.tsx`'s `SetupScreen`
   thêm 2 prop `loading`/`error` + banner lỗi + nút disable khi đang tải (giống `Chat.tsx` đã
   làm đúng từ trước — chỉ là bê nguyên pattern sang).
2. **Double-tap "Bắt đầu luyện nói" tạo 2 phiên/2 lượt/2 lần gọi AI**: hệ quả trực tiếp của #1 —
   nút giờ `disabled={loading}` giống Chat.
3. **Crash trắng trang khi AI trả JSON thiếu trường**: `parseJson` chỉ đảm bảo cú pháp JSON hợp
   lệ, không đảm bảo shape — `EvaluationResultView`/`Writing.tsx` render thẳng `scores.overall`,
   `errors.length`... không optional chaining → AI bỏ sót 1 trường là `TypeError`, mất trắng cả
   phiên đang mở. Thêm `hasNumberFields()` (helper nhẹ trong `lib/ai.ts`, không dùng Zod để
   tránh phình bundle client — dự án có ngân sách kích thước nghiêm ngặt) kiểm tra shape trước
   khi `setEvaluation`/lưu `WritingSubmission`, dùng ở cả 3 nơi (Chat/Speaking/Writing).
4. **Prompt chấm Speaking chiều B bị ngược ngôn ngữ**: `speakingFullEvaluationPrompt` nhánh
   `direction !== 'A'` (chiều B = người nước ngoài học tiếng Việt) vẫn viết "evaluating English
   pronunciation... for learners who are Vietnamese speakers" — SAI hoàn toàn hướng, phải chấm
   phát âm TIẾNG VIỆT cho người nói tiếng Anh. Sửa lại đúng hướng (theo đúng pattern
   `chatFullEvaluationPrompt` chiều B đã làm đúng), đồng thời đổi "stress/intonation" (đặc trưng
   tiếng Anh) → "tones and intonation" (tiếng Việt dùng thanh điệu, không dùng trọng âm). Kèm
   sửa lỗi gõ "logicq" → "logic" ở chiều A. **⚠️ Chưa chạy `npm run eval:tutor`** (sandbox không
   có AI key) — theo CLAUDE.md mục 8, PR sửa prompt bắt buộc chạy lại eval trước khi merge, cần
   người dùng chạy tay có key hoặc merge sau khi tự xác nhận.
5. **Đếm lệch lượt STT** (`sttCount`): client tăng lượt vô điều kiện sau khi ghi âm dừng, không
   phân biệt 2 case khác nhau: (a) ghi âm rỗng (`blob.size === 0`) — CHƯA hề gọi `/api/stt`,
   server không trừ lượt, nhưng client vẫn tăng → thừa; (b) Whisper nghe ra rỗng (server ĐÃ gọi
   API thành công, ĐÃ trừ lượt) — code cũ `throw` ở case này khiến rơi vào `catch`, client
   KHÔNG tăng → thiếu. Sửa `lib/sttServer.ts`: case (a) đổi từ `resolve('')` thành
   `reject(Error('EMPTY_RECORDING'))` để phân biệt được với case (b); case (b) bỏ `throw`, trả
   `''` bình thường qua `resolve`. `Speaking.tsx` tăng lượt khi `r.stop()` thành công (bất kể
   text rỗng hay không) và bỏ qua khi bắt được lỗi `EMPTY_RECORDING`. Đã xác nhận 2 điểm gọi
   khác (`CefrLessonViews.tsx`, `Lessons.tsx`, tính năng nói lại trong bài ngữ pháp) không đếm
   lượt và đã có `catch` mặc định `text=''` từ trước — đổi `resolve('')`→`reject` không phá gì.

**Cổng đã chạy:** build ✅ · typecheck ✅ (0 lỗi, 4 tsconfig) · lint ✅ (0 cảnh báo) · format ✅ ·
test+coverage ✅ (statements 93.96% · branches 90.11% · functions 96.94% · lines 93.96% — vẫn
trên sàn 90/90/90/90, dao động nhẹ so với PR trước do thêm nhánh mới chưa có test riêng).

**Kế hoạch còn lại:** PR C (lỗi logic SRS/CEFR) → PR D (UX Speaking sâu hơn — tách loading khỏi
speaking, sửa mic) → PR E (Writing + hiển thị lỗi) → PR F (hiệu năng CEFR) → PR G (đánh bóng UX)
→ 3 việc quyết định lớn còn lại (gộp referral, Elo+Memory Palace ra Postgres, ẩn telemetry USD).
