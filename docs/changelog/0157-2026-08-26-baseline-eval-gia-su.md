# 0157 — Baseline eval gia sư: từ "không tồn tại" đến 62/62, kèm dải nhiễu

- **Ngày:** 2026-08-26
- **PR:** #702
- **Nợ đóng:** baseline eval (🟡 → 🟢). **Nợ mở mới:** dải nhiễu eval (🟡).

## Việc đã làm

Nợ #5 ghi "baseline vẫn là bản 2026-08-21". Mở `git log` ra xem thì file
`docs/research/eval-tutor-baseline.md` có **đúng một commit** trong toàn bộ lịch sử (PR #625),
nội dung là bản mẫu rỗng ghi "⏳ CHƯA CÓ SỐ LIỆU BASELINE". Chưa từng có baseline số nào, ở bất
kỳ ngày nào — nên luật ở `CLAUDE.md` mục 8 ("PR sửa prompt/model phải dán bảng so sánh,
recall/precision không được tụt") **chưa bao giờ thi hành được**: không có mốc để so.

Lần chạy hôm nay là baseline ĐẦU TIÊN. Trên VPS với key thật, `--delay 3000`:

| Chấm được | Recall | Precision | FP-rate | Specificity | Feedback VI | Type-hit |
| --------- | ------ | --------- | ------- | ----------- | ----------- | -------- |
| 62/62     | 97,7%  | 97,7%     | 5,6%    | 94,4%       | 100,0%      | 76,7%    |

9/11 nhóm lỗi tuyệt đối; bỏ sót duy nhất `adj-02` (trật tự tính từ). Đo **đúng đường
production**: `chatFallback.ts` gọi Groq → Anthropic → Gemini và script cũng ưu tiên Groq, nên
đây là chất lượng provider chính người dùng thật đang gặp. Kết luận: **không có dấu hiệu tụt
chất lượng sư phạm** sau lần đổi prompt/model 24/8.

## Ba bẫy phải gỡ mới chạy được

1. **Script đọc sai cấu hình.** Nó lấy `process.env.GROQ_API_KEY` nguyên chuỗi làm Bearer token,
   trong khi production đi qua `groqKeyPool()` tách nhiều key theo dấu phẩy. Bể có 3 key nên
   script gửi `"key1,key2,key3"` → 62/62 lỗi `401`. Tôi đã dựa vào đó báo động một sự cố
   production hoàn toàn không có thật (rằng STT chế độ Luyện nói đang hỏng). Người dùng bác bỏ
   bằng ảnh màn hình app đang chạy bình thường.
2. **Báo lỗi che mất tín hiệu quyết định.** `callGroq` thử cả bể nhưng chỉ giữ `lastErr`, nên khi
   khoá #1 chạm hạn mức (`429`) còn khoá #3 hỏng (`401`) thì thông báo chỉ hiện `401` — dẫn tới
   hai vòng chẩn đoán sai nữa. Nay in trạng thái TỪNG khoá: `[#1→429 #2→429]`. Vừa sửa xong là
   nguyên nhân thật lộ ra ngay ở lần chạy kế tiếp.
3. **Một khoá trong `.env` hỏng vật lý.** Dài 50 ký tự thay vì 56, kết thúc bằng ký tự `>`, sai
   định dạng `gsk_[A-Za-z0-9]+` — bị cắt cụt lúc ghi file, không phải bị thu hồi. Chỉ thấy được
   khi hỏi thẳng Groq từng khoá một thay vì đọc lỗi gộp.

Kèm phát hiện đúng cho cả production: **Groq tính hạn mức theo TÀI KHOẢN, không theo khoá.** Gộp
nhiều khoá cùng một tài khoản vào bể không tăng quota chút nào — chỉ có giá trị dự phòng khi một
khoá bị thu hồi. Script nay gặp `429` toàn bể thì chờ rồi thử lại (lùi dần 5s→80s, tôn trọng
`retry-after`) thay vì bỏ cuộc; chạy đủ 62 câu cần `--delay 3000`.

## Nợ mới: dải nhiễu rộng hơn mức phân biệt được

Hai lượt chạy **liên tiếp**, cùng prompt · model · bộ đề · `--delay`, cách nhau vài phút:

| Chỉ số      | Lượt 1 | Lượt 2 | Chênh |
| ----------- | ------ | ------ | ----- |
| Recall      | 97,7%  | 97,7%  | 0     |
| Precision   | 100,0% | 97,7%  | −2,3  |
| FP-rate     | 0,0%   | 5,6%   | +5,6  |
| Specificity | 100,0% | 94,4%  | −5,6  |
| Type-hit    | 86,0%  | 76,7%  | −9,3  |

Đúng MỘT câu đổi phán đoán (`edge-05`: TN → FP) làm FP-rate nhảy 5,6 điểm, vì mẫu số chỉ có 18
câu đúng/ca biên. Nghĩa là luật ở mục 8 hiện **không phân biệt được** một prompt tệ đi 5 điểm
với nhiễu lấy mẫu. Dải nhiễu + cách đọc đã ghi vào cuối file baseline. Cách chữa thật là mở rộng
golden set, không phải chạy lại cùng 62 câu.

## Bằng chứng

- `npm run typecheck` · `npm run lint` (0 cảnh báo) · `npx prettier --check` — sạch.
- `npx vitest run scripts/` — 17 file / 147 test xanh.
- Eval chạy thật trên VPS production, output đầy đủ 62/62 (dán trong PR #702).
- `git log -- docs/research/eval-tutor-baseline.md` — 1 commit, chứng minh chưa từng có baseline.

## Bài học

Cùng một bài học lặp lại **ba lần trong một ngày**: công cụ chẩn đoán phải đọc cấu hình GIỐNG HỆT
production và không được che bớt số đo. Lần 1 nó đọc key sai cách nên đo chính nó chứ không đo hệ
thống. Lần 2 nó gộp lỗi nhiều khoá thành một dòng nên giấu mất `429`. Lần 3 — mục nợ chép lại
"baseline bản 2026-08-21" mà không ai mở file ra xem. Cả ba lần đều dẫn tới kết luận sai về một
thứ vốn đang khoẻ mạnh, và cả ba đều được gỡ bằng cùng một động tác: **đo trực tiếp thứ mình đang
nói về nó**, thay vì đọc thứ trung gian mô tả lại nó.
