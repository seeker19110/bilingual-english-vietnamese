# feat: Đợt 2 "Một mũi nhọn thật" — trụ CAREER hết giả (2026-08-24)

Mũi nhọn do chủ dự án chọn: **CAREER**. Khảo sát trước khi làm cho thấy tầng API/DB của trụ này
thực ra đã thật (hồ sơ · kinh nghiệm · mục tiêu đều lưu Postgres, trang đã nối API) — **hai chỗ
GIẢ nằm ở phần "thông minh" nhất**, đúng phần người dùng tìm đến:

**1. 🔴 "Phòng Luyện Phỏng Vấn AI" là GIẢ HOÀN TOÀN.** `CareerInterview.tsx` có 3 câu hỏi CỨNG,
`setTimeout(700)` giả vờ đang phân tích, rồi trả **điểm 8.5 cứng** kèm bộ nhận xét y hệt cho MỌI
câu trả lời của MỌI người — gõ "abc" cũng được khen _"cấu trúc rõ ràng theo mô hình STAR"_. Cùng
loại lỗi với "Live Voice giả lập" vừa gỡ ở PR #650, chỉ khác chỗ.

**Đã thay bằng pipeline thật:** `packages/core-ai/careerInterviewService.ts` dùng
`generateChatText` (Groq → Anthropic → Gemini, đúng chuỗi dự phòng dùng chung) sinh câu hỏi theo
**hồ sơ nghề nghiệp thật** (vị trí đang nhắm, vị trí hiện tại, ngành, kỹ năng mục tiêu) và chấm
câu trả lời thật. API mới `/api/career-interview` (`api/domains/career-interview.ts`) — vì đây là
**đường AI trả tiền** nên có đủ rate-limit + `checkAndConsumeUsage('chat')` + **hoàn lượt khi AI
không chạy được** (khuôn `/api/debate-arena`). Phiên lưu ở `platform.feature_state`, mở lại trang
là thấy buổi luyện trước.

**Nguyên tắc giữ xuyên suốt — không bao giờ bịa:** khi không provider nào dùng được,
`fallbackFeedback()` trả **điểm 0 + cờ `isFallback`** và nói thẳng "câu trả lời của bạn CHƯA được
chấm", giao diện hiện băng cảnh báo màu hổ phách, lượt dùng được hoàn. Tuyệt đối không đưa nhận
xét mẫu ra như thể AI vừa nghĩ.

Giọng và ranh giới bám **8 luật hành xử của Companion** (`dong-hanh-va-phat-trien-nang-khieu`
mục 2): tối đa 3 điểm mạnh / 3 điểm cải thiện (luật 3), nói thật kèm đường đi tiếp (luật 6), so
với yêu cầu vị trí chứ không so người khác (luật 4), nhận xét câu trả lời chứ không phán xét con
người (luật 7). Prompt cấm hỏi tuổi/giới tính/hôn nhân/con cái/tôn giáo/quê quán — có test canh gác.

**2. 🔴 Bảng "Phân tích khoảng cách kỹ năng" bịa cứng "In Progress".** `analyzeCareerSkillGap`
trả `currentMastery: 'In Progress'`, `isFulfilled: false`, `requiredLevel: 'Proficient'` cho
**mọi** kỹ năng không phải tiếng Anh — nghĩa là ai nhập mục tiêu gì (SQL, Figma, quản lý dự
án…) cũng thấy y hệt một bảng "đang tiến hành / chưa đạt", vô nghĩa hoàn toàn.

**Đã thay bằng thang B1–B5** (Dreyfus) đã chốt ở `dac-ta-nang-luc-ca-nhan-theo-do-tuoi` mục 6.2 —
cố ý dùng BẬC chứ không dùng "số năm kinh nghiệm" (mục 6.1: mười năm lặp lại một việc không bằng
mười năm tích luỹ). Ba nguồn dữ liệu, và **luôn nói rõ con số đến từ đâu** (`source`):

- `learning_data` — tiếng Anh vẫn ưu tiên **dữ liệu học thật** trong hệ thống, kể cả khi người
  dùng tự khai cao hơn (có test canh gác: tự khai B5 nhưng dữ liệu nói A1 thì lấy A1).
- `self_assessment` — người dùng tự chấm bậc ngay tại bảng (nút B1–B5 mỗi dòng kỹ năng), lưu qua
  `POST /api/career {resource:'skill_level'}` vào `platform.feature_state`.
- `unknown` — chưa đánh giá thì `currentMastery: null` + hiện "Chưa có dữ liệu", **không bịa**.

Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ **5178/5178** (418 file, +36 test mới).
`codemap impact` cho `core-contracts/career.ts` và `core-domains/careerService.ts`: mọi file bị
ảnh hưởng đều nằm trong bộ test đang xanh. **Không cần migration mới** — dùng
`platform.feature_state` (0058) đã có.

**Còn lại của Đợt 2:** cổng ra "ít nhất 5 người dùng thật quay lại lần thứ hai" chỉ đo được sau
khi deploy — chưa đóng được bằng code.
