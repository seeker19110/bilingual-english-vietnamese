# feat: Đợt 1 "Không nói dối" — 3 chỗ giao diện nói dối nay lưu THẬT (2026-08-24)

**Chủ dự án đã chốt 4 câu hỏi của tài liệu nâng tầm (2026-08-24):** ① đồng ý phương án **nâng tầm
SẢN PHẨM** (không phải hạ tầng, không mở môn mới) · ② mũi nhọn Đợt 2 = **CAREER** · ③ **GIỮ NGUYÊN**
cả 4 trụ, KHÔNG ẩn 3 trụ còn lại (khác đề xuất — hệ quả: các điểm "nói dối" ở Work/Startup/Life
càng phải sửa ngay, không được trì hoãn bằng cách ẩn đi) · ④ Bánh xe cuộc đời **lưu thật**.

Đợt 1 làm trọn cả 3 việc trong một PR (mỗi việc độc lập, đều nhỏ):

**1. Bánh Xe Cuộc Đời lưu thật.** `LifeWheel.tsx:110` trước đây bấm "Lưu" chỉ gọi
`toast.success('Đã lưu…')` rồi thôi — không một lệnh ghi nào. Nay: contract dùng chung
`LifeWheelScoresSchema`/`LifeWheelStateSchema` (`packages/core-contracts/lifeFoundation.ts`, 8 khía
cạnh khai báo MỘT chỗ cho cả client lẫn server, `.strict()` nên thiếu/thừa khoá hay điểm ngoài
1–10 đều bị từ chối) → `/api/life?kind=wheel` GET/POST lưu qua `platform.feature_state` (hạ tầng
migration 0058 có sẵn, không cần bảng mới) → client `getLifeWheel`/`saveLifeWheel` trong
`lifeApi.ts`, trang tải lại điểm đã lưu khi mở và chỉ báo thành công SAU KHI server xác nhận, nút
có trạng thái "Đang lưu…" + báo lỗi thật khi hỏng.

**2. Sổ tay lỗi sai lên server** — món DUY NHẤT trong danh sách có nguy cơ mất dữ liệu thật của
người dùng thật. Migration **0063** (`english.mistakes`): khoá tự nhiên `(user_id, dedupe_key)`
dùng ĐÚNG khoá gộp lỗi trùng của client (`norm(wrong)→norm(corrected)`) nên đồng bộ hai chiều
không sinh bản trùng. Handler `api/subjects/english/mistakes.ts` (GET/POST/DELETE).
**Quyết định thiết kế quan trọng — hợp nhất lấy `greatest()`, KHÔNG cộng dồn:** client gửi lên
tổng tích luỹ của máy đó chứ không phải phần tăng thêm, cộng dồn sẽ thổi phồng số lần mắc lỗi
mỗi lần đồng bộ (có test canh gác). `localStorage` vẫn là nơi ghi/đọc tức thì (mọi hàm giữ nguyên
chữ ký đồng bộ → luồng Chat/Viết/Nói không đổi, vẫn chạy khi mất mạng), server là nguồn sự thật.
Đẩy lên bằng `scheduleMistakeSync()` **gom nhóm 5 giây** — nếu đẩy mỗi lỗi thì một phiên chat 20
tin nhắn thành 20 request gửi trọn sổ; nếu không đẩy gì thì lỗi chỉ lên server lúc mở trang Sổ
tay, mà người dùng có thể không bao giờ mở trên máy đó rồi đổi máy là mất.

**3. Bốn handler cuối còn giữ `new Map` cấp module** → `platform.feature_state`:
`agent-orchestrator`, `mesh-telemetry`, `stem-scratchpad`, `debate-arena`. Grep xác nhận
`apps/server/src/api/` nay **KHÔNG CÒN** `new Map` cấp module nào.
**Vá thêm 3 lỗi thật lộ ra trong lúc chuyển, không chỉ là đổi chỗ lưu:**

- 🔴 **Lỗ hổng quyền:** `stem-scratchpad` và `debate-arena` khoá Map theo `problemId`/`sessionId`
  **TOÀN CỤC** — ai biết id là đọc/sửa được bài làm và phiên tranh biện của người khác. Lưu theo
  user vá luôn lỗ hổng này.
- `stem-scratchpad` `get_hint`: số gợi ý đã dùng chỉ tăng trong bộ nhớ rồi mất → xin gợi ý vô hạn
  mà bộ đếm luôn về 1 sau mỗi restart/đổi instance. Nay được lưu.
- `debate-arena` `evaluate_match`: kết quả chấm không được lưu → mở lại phiên thấy chưa hoàn thành
  và chưa có điểm. Nay được lưu.
  Mỗi kho state đều có trần (50 phiên orchestrator · 30 bài STEM · 20 phiên tranh biện) để dòng
  JSONB không phình vô hạn.

Build ✅ | Type ✅ | Lint ✅ (0 cảnh báo) | Format ✅ | Test ✅ **5142/5142** (416 file, +22 test mới;
chạy sau `npm ci` để khớp lockfile). `codemap impact` cho 2 file dùng chung
(`core-contracts/lifeFoundation.ts` 13 file · `lib/mistakes.ts` 8 file): mọi file bị ảnh hưởng đều
nằm trong bộ test đang xanh.

⚠️ **VIỆC TAY trước khi deploy:** chạy `npm run migrate:pg` trên VPS để tạo bảng
`english.mistakes` (migration 0063). Bánh xe cuộc đời và 4 handler kia dùng bảng
`platform.feature_state` đã có sẵn từ 0058, không cần gì thêm.

**Tiếp theo:** Đợt 2 — làm sâu trụ **Career** (chờ chủ dự án duyệt PR này trước, theo CLAUDE.md mục 3).
