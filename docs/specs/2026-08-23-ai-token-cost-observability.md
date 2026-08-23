# Feature spec: Đo chi phí AI theo token thật + cảnh báo ngân sách (N4)

| Thuộc tính   | Giá trị                                   |
| ------------ | ----------------------------------------- |
| Issue        | không có (mục N4 của lộ trình platform)   |
| Spec owner   | Claude Opus (AI) — dự án một người        |
| Trạng thái   | **Approved for implementation**           |
| Người duyệt  | Chủ dự án (donghanhcungban.org@gmail.com) |
| Ngày duyệt   | 2026-08-23                                |
| Lần cập nhật | 2026-08-23                                |

> **Ghi chú trung thực về quy trình (đọc trước):** kế hoạch 7 bước của N4 đã được chủ dự án
> duyệt trong phiên làm việc TRƯỚC khi code (AI trình bày kế hoạch → chủ dự án trả lời "làm N4
> đi"), và mục N4 vốn đã nằm trong lộ trình đã chốt tại
> `docs/research/dac-ta-kien-truc-platform-dhcb-2026-08-23.md` mục 5.5 + mục 6. Tuy nhiên file
> spec NÀY được viết SAU khi code xong, khi cổng CI `metadata` (`.github/workflows/pr-policy.yml`)
> chặn PR `feat:` không có liên kết `docs/specs/`. Nội dung dưới đây mô tả đúng thứ đã làm,
> không phải một bản thiết kế tưởng tượng lại. Bài học ghi ở mục 9.

## 1. Tóm tắt quyết định

Ghi **token thật** do chính nhà cung cấp AI báo về trong mỗi response (Groq `usage`, Anthropic
`usage`, Gemini `usageMetadata`) vào bảng cộng dồn theo ngày `platform.ai_token_usage_daily`,
quy ra USD bằng bảng giá thật trong `packages/core-ai/capabilityCostTracker.ts`, kèm ngưỡng
cảnh báo `AI_DAILY_BUDGET_USD` và hiển thị trên dashboard admin **cạnh** số ước tính cũ.

## 2. Vấn đề và mục tiêu

**Vấn đề (đã xác minh bằng cách đọc code, không suy đoán):**

- `packages/core-ai/aiCost.ts` chỉ ƯỚC TÍNH `số lượt × đơn giá cố định` — chú thích đầu file tự
  nhận "KHÔNG đo token thật". Sai lệch lớn khi độ dài prompt/response thay đổi, và không phân
  biệt được provider/model nào đang ngốn tiền.
- `packages/core-ai/capabilityCostTracker.ts` (231 dòng, đã có bảng giá thật + chiết khấu cache)
  **mồ côi — 0 nơi import**.
- Cả 3 provider **đều đã trả token thật** trong response mà hệ thống đang vứt đi.

**Mục tiêu:** trả lời được "ngày X, model Y, chế độ M tốn bao nhiêu tiền THẬT", và tự kêu khi
vượt ngưỡng chi phí một ngày.

**Ngoài phạm vi (nói rõ để không hiểu nhầm số liệu):**

- TTS/STT/chấm phát âm — tính theo ký tự / giờ audio chứ không theo token, vẫn dùng ước tính cũ.
- Uptime monitor (nửa còn lại của mục 5.5 đặc tả platform) — cần dịch vụ ngoài, là việc tay.
- Chi phí theo TỪNG người dùng — xem mục 6 (quyết định riêng tư).

## 3. Đặc tả dữ liệu

Migration `postgres/migrations/0059_ai_token_usage_daily.sql`:

```sql
create table if not exists platform.ai_token_usage_daily (
  day                text           not null,       -- 'YYYY-MM-DD' theo GIỜ VN (vnDateStr)
  provider           text           not null,       -- 'groq' | 'anthropic' | 'gemini'
  model              text           not null,
  mode               text           not null,       -- chat | writing | speaking | companion
  calls              integer        not null default 0,
  prompt_tokens      bigint         not null default 0,
  completion_tokens  bigint         not null default 0,
  cache_read_tokens  bigint         not null default 0,
  cache_write_tokens bigint         not null default 0,
  cost_usd           numeric(14, 6) not null default 0,
  updated_at         timestamptz    not null default now(),
  primary key (day, provider, model, mode)
);
create index if not exists ai_token_usage_daily_day_idx on platform.ai_token_usage_daily (day);
```

**Cộng dồn theo ngày, KHÔNG log per-call:** quy mô hiện tại chỉ cần biết tổng theo
ngày/model/chế độ; log từng lượt gọi sẽ phình vô hạn mà không trả lời thêm câu hỏi nào.
Cộng dồn bằng `INSERT … ON CONFLICT (day, provider, model, mode) DO UPDATE` — nguyên tử trong
DB nên an toàn khi nhiều tiến trình PM2 cluster ghi song song.

## 4. Đặc tả API

`GET /api/admin-usage-stats?days=N` (đã có, chỉ **thêm** trường — không breaking) trả thêm:

```ts
tokenCost: {
  totals: { calls, promptTokens, completionTokens, cacheReadTokens, costUsd },
  totalVnd: number,
  byProviderModel: { provider, model, mode, calls, promptTokens, completionTokens,
                     cacheReadTokens, costUsd }[],
  dailyBudgetUsd: number | null   // null = chưa đặt AI_DAILY_BUDGET_USD
}
```

Quyền: giữ nguyên `validateAuth()` + `isAdminEmail()` sẵn có của handler.

## 5. Điểm chạm code

| File                                                 | Việc                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `packages/core-ai/aiTokenUsage.ts` (mới)             | parser 3 provider, `recordAiTokenUsage()`, ngưỡng ngân sách       |
| `packages/core-ai/chatProviders.ts`                  | kết quả `success` của Groq trả kèm `usage` + `model` thực sự dùng |
| `packages/core-ai/geminiApi.ts`                      | thêm tham số **tuỳ chọn** `onUsage` (3 nơi gọi hiện có không đổi) |
| `packages/core-ai/ai.ts`                             | ghi ở cả 3 nhánh provider của `/api/agent`                        |
| `packages/core-personal/companionRuntime.ts`         | ghi với `mode: 'companion'`                                       |
| `apps/server/src/api/admin/admin-usage-stats.ts`     | truy vấn ⑫ + khối `tokenCost`                                     |
| `apps/dhcb/src/components/admin/AdminUsagePanel.tsx` | thẻ "Chi phí AI đo THẬT theo token"                               |

**Ba chi tiết dễ làm sai (lý do phải viết ra):**

1. Anthropic báo `cache_read_input_tokens` / `cache_creation_input_tokens` **TÁCH KHỎI**
   `input_tokens` → parser phải cộng lại để `promptTokens` là tổng đầu vào thật, đúng như
   `calculateCostUsd()` mong đợi (hàm đó trừ ngược cacheRead ra để áp giá chiết khấu 10%).
   Cộng sai → tính thiếu tiền.
2. Groq có bể model xoay vòng khi model đầu lỗi → phải ghi model **THỰC SỰ** dùng; lấy
   `GROQ_CHAT_MODEL` sẽ tra nhầm bảng giá.
3. Gemini đã tính tiền token ngay khi trả body hợp lệ, kể cả khi phần text rỗng làm
   `callGemini()` ném lỗi → `onUsage` bắn ngay khi có body, và nhánh `catch` cũng ghi.

## 6. Bảo mật & riêng tư

Bảng **KHÔNG lưu `user_id`**: đây là số liệu VẬN HÀNH gộp để quyết định giá/hạn mức, không phải
nhật ký hành vi cá nhân. Muốn biết ai ngốn nhiều lượt thì bảng `topUsers` sẵn có (theo số lượt)
đã đủ. Đổi lại: không truy được chi phí thật theo từng người — chấp nhận, đúng nguyên tắc thu
thập tối thiểu.

## 7. Bất biến bắt buộc

**Đo đạc KHÔNG ĐƯỢC làm hỏng lượt trả lời của người dùng.** `recordAiTokenUsage()` nuốt mọi lỗi
bên trong (DB sập / bảng chưa migrate → chỉ log cảnh báo) và caller gọi `void` **không `await`**.
Có test riêng ghim hành vi này. Vi phạm bất biến = đổi một tính năng phụ (số liệu) lấy tính năng
chính (người học nhận được câu trả lời) — không bao giờ đáng.

## 8. Tiêu chí chấp nhận

- [x] Migration 0059 idempotent, chỉ thêm mới, có câu lệnh rollback ghi trong header file.
- [x] Parser đúng cho cả 3 provider; body thiếu/rỗng/số rác/số âm → `null`, không ghi dòng 0 token.
- [x] Anthropic cộng đúng cache token (có test).
- [x] DB lỗi → không ném ra ngoài (có test).
- [x] Cảnh báo vượt ngưỡng đúng **1 lần/ngày/tiến trình**; chưa đặt biến → không truy vấn, không kêu.
- [x] Dashboard admin hiện số thật cạnh số ước tính kèm tỉ lệ lệch.
- [x] Không breaking: `/api/admin-usage-stats` chỉ thêm trường; `callGemini()` thêm tham số tuỳ chọn.
- [x] Cổng: typecheck · lint · format · build · size · test 4948/4948 · coverage 93.73%.

## 9. Rủi ro & bài học

- **Rủi ro chính** (đường AI trả tiền là critical flow) đã chặn bằng bất biến mục 7.
- **Rollback:** revert commit là đủ; dọn hẳn thì `DROP TABLE platform.ai_token_usage_daily;`.
- **Bài học quy trình:** với PR `feat:`, phải tạo `docs/specs/YYYY-MM-DD-slug.md` **TRƯỚC** khi
  code — cổng CI `metadata` chặn, và lần này spec phải viết bù sau khi đã code xong. Lộ trình
  lớn nằm ở `docs/research/` nhưng cổng CI chỉ nhận `docs/specs/`; hai thư mục này chưa được
  nối với nhau. Cân nhắc cho lần sau: hoặc mở rộng regex của cổng để chấp nhận
  `docs/research/`, hoặc quy ước mỗi mục lộ trình khi bắt đầu làm thì tách một spec ở
  `docs/specs/`.
