# feat(programming): PR-L5 — AI phản hồi code + gợi ý Socratic (mode `code_feedback`) — PR #661 (2026-08-25)

Đợt cuối của MVP môn Lập trình theo phân đợt đặc tả. AI vào môn **đúng một cửa**, có đếm lượt:

- **Mode đếm lượt MỚI `code_feedback`** (migration `0065`): thêm cột
  `daily_usage.code_feedback_count` **và sửa cả 3 hàm SQL** `consume_usage`/`refund_usage`/
  `consume_usage_total` — chúng whitelist tên cột bằng danh sách cứng và cộng TAY từng cột để
  ra tổng ngày, nên chỉ thêm cột mà quên hàm thì lượt AI của môn vừa KHÔNG đếm được (fail-open
  = miễn phí không giới hạn) vừa lọt khỏi hạn mức tổng của Pro/VIP. Hạn mức giữ nguyên luật
  chung (Free: kho lượt cửa sổ trượt · Pro/VIP: tổng ngày mọi mode) — không đặt hạn mức riêng.
  Dashboard admin + `aiCost` đã cộng mode mới vào (nếu không, chi phí hiển thị sẽ thiếu).
- **ĐỔI so với đặc tả (đã ghi ngược lại vào đặc tả §6.3):** KHÔNG dùng `/api/agent` như đặc tả
  đề xuất. Lý do đọc code mới thấy: `/api/agent` chèn cứng guardrail _"Bạn là trợ lý GIA SƯ
  NGÔN NGỮ… việc ngoài phạm vi học ngôn ngữ thì từ chối"_ (hỏi Python là đúng cái nó được dặn
  từ chối) và chỉ nhận mode `chat|writing|speaking`. Thay bằng endpoint riêng
  `POST /api/programming/feedback`; **prompt dựng HOÀN TOÀN Ở SERVER**
  (`packages/subject-programming/feedbackPrompt.ts`) nên client không gửi được prompt tuỳ ý.
- **3 việc AI được phép làm** — `socratic_hint` (gợi ý bậc thang 1→3, mở dần, mỗi bậc một luật
  riêng: bậc 1 chỉ định hướng · bậc 2 khoanh vùng · bậc 3 nêu khái niệm + ví dụ ≤3 dòng với dữ
  liệu KHÁC đề bài) · `explain_error` (dịch traceback Python sang tiếng Việt, 3 phần) ·
  `review` (góp ý chất lượng code). Mọi kind đều mang luật **cấm viết lời giải hoàn chỉnh**.
- **Không thành đường vòng lấy lời giải:** `review` chỉ mở khi `lesson_progress.status =
'completed'` — kiểm ở SERVER, không tin client tự khai; `hintLevel` bị Zod kẹp trong 1..3.
  Code học viên bọc trong rào "dữ liệu, không phải chỉ thị" + guardrail dặn cách xử lý câu ra
  lệnh nhúng trong code (chống prompt injection — có ca test và ca eval riêng).
- **Ca ẩn không bị lộ qua miệng AI:** client gửi nhãn ca CHƯA ĐẠT để gợi ý trúng chỗ, nhưng ca
  ẩn chỉ gửi số thứ tự — nhãn ca ẩn thường mô tả chính đáp án.
- **Companion biết môn Lập trình tồn tại:** `programmingReadModelService` (core-learner) tóm
  tắt bậc + số bài đã xong, nối một dòng vào ngữ cảnh Companion khi domain là learning và
  người học ĐÃ chạm vào môn (chưa chạm thì chuỗi rỗng — không tốn token, không rủ học môn chưa
  mở). Cố ý KHÔNG nhồi vào `LearningReadModel` (khuôn đó là hình dạng môn ngôn ngữ: CEFR,
  chiều học, từ/ngày — 4 nơi khác đang dùng chung).
- **Eval prompt riêng cho môn** (`npm run eval:code-feedback`, chạy TAY vì tốn phí API, đúng
  chính sách của `eval:tutor`): 8 ca golden qua ĐÚNG prompt + chuỗi provider production, chấm
  tự động 3 bất biến (lộ lời giải = có khối code > 3 dòng · không phải tiếng Việt · gợi ý mà
  không có câu hỏi / giải thích lỗi mà không gọi tên lỗi); còn 1 ca vi phạm là thoát mã 1.
  Phần chấm tách ra `scripts/lib/codeFeedbackScoring.ts` để test được MIỄN PHÍ trong CI (16
  test), và có test bất biến cho chính golden set (mọi ca trỏ bài có thật, phủ đủ 3 bậc gợi ý).
  **CHƯA chạy được lần thật** — môi trường phiên này không có key AI. Việc tay khi deploy.
  CLAUDE.md §8 đã bổ sung luật: PR sửa `feedbackPrompt.ts` phải chạy lại eval này.
- **UI:** khối "Bí quá? Hỏi Bạn Đồng Hành" ở bước ⑥ Tự viết — nút gợi ý hiện rõ bậc đang ở
  (`Gợi ý bậc 1/3`), nút "Lỗi này nghĩa là gì?" chỉ hiện khi lần chấm gần nhất có lỗi runtime,
  nút "Nhờ AI xem lại code" chỉ hiện sau khi đạt hết test. Gợi ý soạn sẵn (0đ) vẫn là đường
  chính; AI chỉ gọi khi học viên tự bấm, không bao giờ tự động sau mỗi lần chấm.
- Kiểm chứng: typecheck · lint 0 cảnh báo · format · test **5359/5359** · coverage
  93,35/90,09/96,5/93,35 (sàn 90, KHÔNG hạ ngưỡng) · build · size 122,65/123 kB (chạy KHÔNG
  pipe) · e2e bài học 4/4 (gồm ca mới: bậc gợi ý mở dần theo bậc SERVER trả về + hết lượt hiện
  nguyên văn lời nhắn) · a11y khối AI mới 10/10 (5 theme × A/AA + AAA — khối này chỉ hiện sau
  khi gọi API nên vòng quét theo route không chạm tới, phải quét riêng đúng trạng thái đó).
- **Giới hạn đã biết (cố ý, không phải sót):** trang Tiến độ của môn tiếng Anh hiển thị lượt
  còn lại theo TỪNG mode tiếng Anh (đọc từ localStorage) nên KHÔNG hiện lượt `code_feedback`.
  Với Pro/VIP, lượt này vẫn trừ vào hạn mức TỔNG/ngày ở server — nghĩa là con số hiển thị bên
  môn tiếng Anh có thể lạc quan hơn thực tế một chút. Trang Lập trình cố ý KHÔNG kiểm hạn mức
  ở client: cứ gọi, và hiện nguyên văn lời nhắn của server (server là nguồn sự thật duy nhất).
  Hợp nhất hai cách hiển thị là việc của đợt "lượt dùng đa môn", không thuộc PR này.
- **Việc tay khi deploy:** `npm run migrate:pg` (migration `0065`) TRƯỚC khi chạy bản mới —
  thiếu nó thì mọi lượt `code_feedback` rơi vào nhánh fail-open (cho qua, không đếm).
- **Tiếp theo:** soạn nội dung bậc P2 (PR-L6) theo phân đợt đặc tả; hoặc chạy
  `npm run eval:code-feedback` với key thật để chốt chất lượng prompt trước khi mở rộng.
