-- 0059_ai_token_usage_daily.sql — Đo CHI PHÍ AI theo TOKEN THẬT (mục N4).
--
-- VẤN ĐỀ: packages/core-ai/aiCost.ts chỉ ƯỚC TÍNH tiền theo "số lượt × đơn giá cố định"
-- (chính chú thích đầu file đó thừa nhận "KHÔNG đo token thật"). Sai lệch lớn khi độ dài
-- prompt/response thay đổi, và không phân biệt được provider/model nào đang ngốn tiền.
-- Bảng này ghi TOKEN THẬT do chính nhà cung cấp trả về trong mỗi response (Groq `usage`,
-- Anthropic `usage`, Gemini `usageMetadata`), quy ra USD theo bảng giá thật
-- (packages/core-ai/capabilityCostTracker.ts).
--
-- CỘNG DỒN THEO NGÀY, không ghi mỗi lượt gọi một dòng: quy mô hiện tại chỉ cần biết "ngày X,
-- provider Y, model Z, chế độ M tốn bao nhiêu" để cảnh báo vượt ngân sách và so với doanh thu
-- — log per-call sẽ phình vô hạn mà không trả lời thêm câu hỏi nào. Cũng vì thế bảng KHÔNG có
-- user_id: đây là số liệu VẬN HÀNH gộp, không phải nhật ký hành vi cá nhân.
--
-- Rollback: DROP TABLE platform.ai_token_usage_daily;

create schema if not exists platform;

create table if not exists platform.ai_token_usage_daily (
  day                text           not null,       -- 'YYYY-MM-DD' theo GIỜ VIỆT NAM (vnDateStr)
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

comment on table platform.ai_token_usage_daily is
  'Token AI THẬT cộng dồn theo ngày/provider/model/chế độ — xem packages/core-ai/aiTokenUsage.ts';

-- Dashboard admin luôn lọc theo khoảng ngày rồi gộp → index theo day là đủ.
create index if not exists ai_token_usage_daily_day_idx
  on platform.ai_token_usage_daily (day);
