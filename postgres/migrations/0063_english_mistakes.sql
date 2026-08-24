-- 0063_english_mistakes.sql — SỔ TAY LỖI SAI lên server (Đợt 1 "Không nói dối",
-- docs/research/nang-tam-du-an-2026-08-24.md §4).
--
-- Trước migration này, sổ tay lỗi sai (apps/dhcb/src/lib/mistakes.ts) CHỈ nằm trong
-- localStorage theo khoá `et_mistakes_<uid>` — không bảng, không endpoint. Đây là tài liệu ôn
-- giá trị nhất và độc nhất của từng người (lỗi thật của chính họ), nhưng đổi máy, xoá cache
-- trình duyệt, hay chuyển từ máy tính sang điện thoại là mất sạch, không có đường khôi phục.
--
-- Thiết kế giữ ĐÚNG mô hình dữ liệu client đang dùng để không phải viết lại logic gộp/ôn:
--  * Khoá tự nhiên (user_id, dedupe_key) — client gộp lỗi trùng bằng `norm(wrong)→norm(corrected)`,
--    server dùng đúng khoá đó làm ràng buộc duy nhất nên đồng bộ hai chiều không sinh bản trùng.
--  * count / last_reviewed_at / review_count giữ nguyên ý nghĩa ở client.
--  * created_at là thời điểm mắc lỗi GẦN NHẤT (client đẩy lên đầu theo độ mới), KHÔNG phải
--    thời điểm tạo dòng — nên không dùng default now() để tránh hiểu nhầm khi merge.
--
-- Idempotent. Rollback: drop table if exists english.mistakes;

create schema if not exists english;

create table if not exists english.mistakes (
  id               uuid primary key,
  user_id          uuid not null references public.users(id) on delete cascade,
  -- Khoá gộp lỗi trùng, do client tính: `norm(wrong)→norm(corrected)`.
  dedupe_key       text not null,
  wrong            text not null,
  corrected        text not null default '',
  explanation      text not null default '',
  source           text not null check (source in ('chat', 'writing', 'speaking')),
  -- Chiều học lúc mắc lỗi: 'A' người Việt học tiếng Anh · 'B' người nước ngoài học tiếng Việt.
  dir              text not null check (dir in ('A', 'B')),
  count            integer not null default 1 check (count > 0),
  -- Thời điểm mắc lỗi gần nhất (mili-giây epoch ở client → timestamptz ở đây).
  created_at       timestamptz not null,
  last_reviewed_at timestamptz,
  review_count     integer not null default 0 check (review_count >= 0),
  updated_at       timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

-- Truy vấn chính: lấy toàn bộ sổ của một người, sắp theo lỗi lặp nhiều rồi tới lỗi mới hơn
-- (đúng thứ tự ôn mà getDueMistakes() dùng).
create index if not exists mistakes_user_order_idx
  on english.mistakes (user_id, count desc, created_at desc);

comment on table english.mistakes is
  'Sổ tay lỗi sai theo user — nguồn sự thật server, localStorage chỉ còn là bộ đệm ngoại tuyến';
