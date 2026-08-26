# fix: Quét sâu toàn dự án — vá 8 lỗi audit + nâng cấp 13 gói trong dải semver (2026-08-24)

Quét theo yêu cầu "quét sâu, vá lỗi và nâng cấp": 3 lượt rà song song (bảo mật API server ·
logic thanh toán/đếm lượt · diff các PR #647/#650/#652 mới merge), mọi phát hiện đều xác minh
trên code thật trước khi vá. Đã vá trong PR này:

1. **[Bảo mật, vừa]** 10 endpoint trả nguyên `err.message` trong response 500 (lộ tên bảng/host
   DB) → helper mới `internalErrorResponse()` trong `packages/core-http/http.ts`: log chi tiết ở
   server, client chỉ nhận `{ error: 'Internal server error' }`.
2. **[Thanh toán, vừa]** Webhook SePay không kiểm `payments.expires_at` — đơn chốt giá khuyến mãi
   có thể chuyển khoản nhiều tháng sau vẫn được cấp gói → kiểm hạn + ân hạn 24h (chuyển khoản
   chậm), quá hạn thì log `SEPAY_PAYMENT_LATE` giữ pending cho admin đối chiếu tay. Có test 2 ca.
3. **[Thanh toán, vừa]** Promo giảm sâu + làm tròn nghìn có thể ra giá **0đ** → webhook cấp gói
   cho mọi giao dịch chứa mã. Vá 2 lớp: sàn 1.000đ trong `effectivePrice` + checkout chặn tạo đơn
   `amountVnd <= 0`. Có test.
4. **[UI, vừa]** Tab Profile ở `BottomNav` còn trỏ `/profile` (URL cũ) và `PROFILE_PATHS` thiếu
   `/trang-ca-nhan` → tab mất highlight ngay khi vào trang Profile (sót của Đợt 3 #652). Sửa cả
   các điểm điều hướng cũ còn sót: `Layout`, `Dashboard`, `LifeGraph` (`/profile`) và
   `HomeUniversalAiBar`, `Subjects`, `Practice` (`/phong-hoc/*` → `/mon-hoc/*`).
5. **[Voice Companion, vừa]** Kẹt trạng thái "Đang nhận diện" + nuốt câu nói khi ghi âm trong lúc
   AI còn đang trả lời (state `loading` cũ trong closure) → thêm `loadingRef` + báo lỗi rõ ràng.
6. **[Voice Companion, vừa]** Bấm "Dừng" không hủy được TTS sắp phát khi stream LLM về xong sau
   đó → thêm cờ `voiceCancelledRef`.
7. **[Đồng bộ, thấp]** `syncMistakes` ghi đè localStorage bằng bản server — lỗi mới `addMistake`
   trong lúc request đang bay bị nuốt → hợp nhất lại với sổ cục bộ hiện tại (`mergeMistakeLists`,
   cùng luật với server). Test cập nhật theo hợp đồng mới.
8. **[Gemini, thấp]** `scripts/tag-cefr-levels.ts` còn gọi `gemini-2.0-flash` đã chết (404) →
   `gemini-3.6-flash`; thêm giá model mới vào `capabilityCostTracker.ts` ($0.75/$3.75 mỗi 1M
   token — giá khuyến mãi đến 31/12/2026, sau đó $1.5/$7.5, cần cập nhật lại qua năm) thay vì rơi
   vào fallback làm số chi phí admin lệch.

**Nâng cấp:** 13 gói trong dải semver lockfile (`@aws-sdk/client-s3`, `@sentry/node`,
`@sentry/react`, `@types/pg`, `pg`, `ws`, `jose`, `google-auth-library`, `lucide-react`,
`happy-dom`, `vitest`, `@vitest/coverage-v8`, `@fontsource-variable/inter`). KHÔNG nâng major nào
(React/TS/Tailwind/ESLint bị khoá theo CLAUDE.md; Express 5/Vite 8 để dành khi có kế hoạch riêng).
`npm audit`: 0 lỗ hổng. Toàn bộ cổng xanh sau nâng cấp: typecheck · lint 0 cảnh báo · format ·
test 5181/5181 · build app+hub+packages+server.

**Nợ ghi nhận thêm (chưa vá, mức thấp):** `refundUsage` tra gói tại thời điểm HOÀN thay vì lúc
trừ — nếu gói đổi giữa chừng (free→pro do webhook) thì hoàn nhầm nhánh, thiệt 1 lượt, ca cực
hiếm; vá cần đổi chữ ký `checkAndConsumeUsage` trả kèm `plan`, để đợt sau. Fail-open đếm lượt khi
DB lỗi là chủ đích (đã có comment), giữ nguyên.
