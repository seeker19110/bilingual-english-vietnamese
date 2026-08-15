// packages/core-db/requestId.ts — Mã định danh ngắn cho MỘT lượt xử lý request, để ghép vào log.
//
// Phase 01 "Foundation OS" mục 6 (docs/phases/01-foundation-os.md): "structured logging,
// correlation IDs and basic metrics". Trước file này, log của app KHÔNG có cách nào nối các dòng
// log rải rác của CÙNG MỘT request lại với nhau (vd request gọi `/api/agent`, thử Groq rồi fallback
// Anthropic rồi Gemini — 3 dòng debug log riêng biệt không có gì chung để `grep` ra đúng 1 lượt gọi
// giữa hàng nghìn dòng log khác chạy song song trên VPS cluster nhiều tiến trình).
//
// KHÔNG dùng thư viện `uuid` ngoài — `crypto.randomUUID()` có sẵn trong Node ≥ 14.17 (runtime hiện
// tại là Node 22, xem package.json engines) nên không cần thêm dependency cho việc này.

import { randomUUID } from 'node:crypto'

/**
 * Sinh 1 request ID mới — 8 ký tự đầu của UUID v4, đủ ngắn để đọc trong log bằng mắt (so với UUID
 * đầy đủ 36 ký tự) mà xác suất trùng trong cùng 1 khoảng thời gian ngắn (vài phút log) vẫn cực
 * thấp — đây KHÔNG phải khoá bảo mật/định danh lâu dài, chỉ để người đọc log lọc ra đúng 1 lượt.
 */
export function createRequestId(): string {
  return randomUUID().slice(0, 8)
}
