# fix(gemini-live): chuyển sang SDK chính thức @google/genai (2026-08-23)

**Chạy thật trên VPS với key mới đã cho câu trả lời dứt điểm — sau 3 vòng thăm dò.**

Vòng 1 (`npm run smoke:gemini-live`): key HỢP LỆ, Live API đã mở, liệt kê được **6 model**
(có `gemini-3.1-flash-live-preview` đúng như mặc định code đặt). Nhưng phiên Live treo 30s.

Vòng 2: đổi model (`native-audio` → `live-preview`) — **vẫn treo y hệt** → loại giả thuyết
"sai loại model".

Vòng 3 (script thăm dò tối giản, in MỌI sự kiện gồm mã đóng kết nối):

| Đường dẫn         | Kết quả                                        |
| ----------------- | ---------------------------------------------- |
| `v1beta`          | OPEN → `CLOSE 1011 Internal error encountered` |
| `v1alpha`         | OPEN → `CLOSE 1011 Internal error encountered` |
| **đường dẫn BỊA** | **`404` ngay, không OPEN**                     |

**Kết luận rút ra:**

1. **Endpoint KHÔNG phải nguyên nhân** — `v1beta` và `v1alpha` hành xử giống hệt. Việc đổi
   `v1alpha`→`v1beta` ở PR #634 không gây lỗi mà cũng không sửa được gì.
2. Gói `setup` tối giản (CHỈ `model`, không `generationConfig`) vẫn `1011` → loại luôn giả
   thuyết sai `responseModalities`.
3. Lỗi `1011` là Google tự báo lỗi nội bộ sau khi nhận `setup` — chi tiết giao thức mà ta
   KHÔNG nhìn thấy được từ ngoài. Đúng lúc ngừng đoán.

**Đính chính một suy luận sai của tôi giữa chừng:** tôi từng khẳng định "WebSocket mở được
nghĩa là URL đúng", rồi TỰ RÚT LẠI vì nghĩ gateway có thể im lặng. Phép thử đường dẫn bịa
(`404` ngay) chứng minh **khẳng định GỐC mới đúng** — lần rút lại đó là tự làm nhiễu.

**Quyết định của người dùng: dùng SDK chính thức `@google/genai`.**

**Đã làm (bước 1 — CHỨNG MINH TRƯỚC, PORT SAU):**

1. Thêm `@google/genai@2.18.0` (ghim đúng phiên bản, `npm audit` 0 lỗ hổng). KHÔNG vi phạm
   luật ghim phiên bản ở CLAUDE.md mục 6 — đó là luật cấm NÂNG React/TS/Tailwind/ESLint,
   không cấm thêm dependency mới.
2. **Viết lại `scripts/smoke-gemini-live.ts` bằng SDK** — endpoint/xác thực/khung setup do
   Google tự lo; callback `onerror`/`onclose` in thẳng lý do (thứ bản tự dựng giấu mất).
3. **CỐ Ý CHƯA port `packages/core-ai/geminiLiveService.ts`.** Port mù khi chưa biết SDK có
   chạy nổi trên tài khoản này là đánh cược. Thứ tự đúng: script kiểm chứng trước → biết kết
   quả → mới viết lại service.

**Bundle client KHÔNG đổi** (JS 120.65/123 kB) — SDK chỉ nằm ở server.

**Cổng:** typecheck ✅ · lint ✅ · format ✅ · test 4962/4962 ✅ · build ✅ · size ✅ ·
`npm audit --omit=dev` 0 lỗ hổng ✅.

**BƯỚC TIẾP THEO CẦN NGƯỜI DÙNG:** chạy `npm run smoke:gemini-live` trên VPS sau khi deploy.
Nếu SDK cũng báo lỗi → vấn đề nằm ở tài khoản/model chứ không phải code, và nên đóng nợ này
lại thay vì đào tiếp. Nếu chạy được → port service sang SDK.
