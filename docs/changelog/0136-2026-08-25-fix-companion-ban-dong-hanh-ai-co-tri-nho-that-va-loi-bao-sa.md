# fix(companion): Bạn Đồng Hành AI có TRÍ NHỚ thật + vá lỗi báo sai "đã thực thi" (2026-08-25)

Người dùng báo: _"nói chuyện 1 vòng rồi vào phiên khác hỏi không còn nhớ gì"_. Rà ra **ba** lỗ
hổng chồng lên nhau, sửa cả ba.

- **🔴 Lỗ hổng 1 — app BÁO SAI SỰ THẬT (nghiêm trọng nhất).** `proposedActionService` đánh dấu
  hành động `committed` kèm kết quả ĐÓNG CỨNG `{status:'ok'}` mà **không hề gọi capability nào**.
  Giao diện hiện "✅ Đã thực thi update_fact" trong khi **không có gì được ghi xuống DB**. Hai hàm
  ghi thật (`declareFact`, `ingestMemory`) đã tồn tại nhưng chưa nơi nào trong luồng Companion gọi.
  → File mới `capabilityExecutor.ts` thi hành THẬT. Capability chưa có đường ghi thì **ném lỗi**,
  tuyệt đối không âm thầm báo thành công. `dictionary.lookup` trả `no_side_effect` thay vì 'ok'.
- **🔴 Lỗ hổng 2 — hội thoại không được lưu ở đâu cả.** Không bảng nào chứa lượt thoại Companion.
  → Migration `0067` + `companionMessageService.ts` + `GET /api/companion` (KHÔNG đếm lượt vì
  không gọi model AI) + nạp lại khi mở trang.
- **🔴 Lỗ hổng 3 — ngay trong một phiên AI cũng không thấy tin trước.** Client chỉ gửi một câu,
  server dựng `messages = [1 tin]`. → Nạp 10 lượt gần nhất vào prompt, cắt mỗi tin 1500 ký tự để
  không ăn hết ngân sách token.
- **CỔNG CỨNG: ghi hồ sơ/ký ức LUÔN chờ người dùng bấm xác nhận** (chốt của người dùng
  2026-08-25) — `CONFIRMATION_REQUIRED_CAPABILITIES`, đặt TRƯỚC mọi điều kiện khác nên không
  Personal Policy nào lách qua được, kể cả `AUTOMATE`. Có test khoá bất biến này.
- **Nguyên tử:** tách `declareFactWithClient`/`ingestMemoryWithClient` (bản chạy trong transaction
  có sẵn) để việc đổi trạng thái hành động và việc ghi dữ liệu **cùng sống hoặc cùng chết** — thi
  hành lỗi ⇒ rollback ⇒ hành động vẫn `pending`, không bao giờ lặp lại đúng lỗi vừa vá. API công
  khai `declareFact`/`ingestMemory` giữ nguyên (chỉ thành lớp bọc).
- **Trí nhớ là tiện ích, không phải điều kiện để trả lời:** lỗi đọc/ghi lịch sử đều bị nuốt, người
  dùng vẫn nhận được câu trả lời. Có test cho cả hai nhánh.
- **Kiểm chứng:** 5539 unit test xanh (445 file; +45 test mới). Build · typecheck · lint (0 cảnh
  báo) · format xanh. Initial JS **123,34 kB / 140 kB**.
- **Còn lại:** `learning.update_goal` tạm lưu thành fact `learning.goal` (Context Engine đọc facts
  nên AI vẫn nhớ thật), chưa nối vào Goal Engine `life_goals` — `detail.storedAs` ghi rõ chỗ lưu
  tạm để sau dời. Migration `0067` tự áp khi deploy (`scripts/deploy.sh`).
