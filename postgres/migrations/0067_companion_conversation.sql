-- postgres/migrations/0067_companion_conversation.sql — Lưu hội thoại với Bạn Đồng Hành AI.
--
-- VÌ SAO: trước migration này KHÔNG có bảng nào chứa lượt thoại của Companion. Hội thoại chỉ
-- nằm trong bộ nhớ trình duyệt, nên tải lại trang hay mở phiên mới là mất sạch — và bản thân
-- LLM cũng chỉ nhận đúng MỘT tin nhắn mỗi lượt, không thấy các tin trước đó.
--
-- Bảng này phục vụ hai việc cùng lúc:
--   1. Nạp lại hội thoại khi người dùng mở lại trang (trí nhớ "nhìn thấy được").
--   2. Ghép vài lượt gần nhất vào prompt gửi LLM (trí nhớ "trong lúc trò chuyện").
--
-- KHÁC `personal.memory_records`: bảng đó là trí nhớ ĐÃ CHỌN LỌC (sự thật đọng lại về người
-- dùng, phải qua xác nhận mới ghi). Bảng này là bản ghi thô của cuộc trò chuyện.

create table if not exists personal.companion_messages (
  id         uuid primary key default gen_random_uuid(),
  person_id  uuid not null references personal.persons(id) on delete cascade,
  -- 'user' = người dùng gõ/nói · 'companion' = câu trả lời của AI. Khớp `sender` ở giao diện.
  role       text not null check (role in ('user', 'companion')),
  content    text not null check (char_length(content) between 1 and 8000),
  -- Lĩnh vực + ý định đã phân giải của lượt đó (learning/career/...). Giữ lại để sau này thống
  -- kê được người dùng hay trao đổi trụ nào, không phải suy đoán lại từ nội dung.
  domain     text,
  intent     text,
  created_at timestamptz not null default now()
);

-- Truy vấn duy nhất trên bảng này là "lấy N tin gần nhất của một người" → index đúng khuôn đó.
create index if not exists idx_companion_messages_person_created
  on personal.companion_messages(person_id, created_at desc);
