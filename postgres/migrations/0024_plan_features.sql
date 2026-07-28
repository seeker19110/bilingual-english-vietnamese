-- 0024_plan_features.sql — Ma trận "tính năng nào bật cho gói nào" (Free/Pro/VIP), quản lý
-- qua /admin (tab "Tính năng theo gói", api/admin-plan-features.ts). Khác app_settings (số hạn
-- mức lượt/ngày) — đây là BẬT/TẮT từng tính năng theo từng gói, admin thêm/xoá tính năng được.
--
-- 2 bảng: feature_catalog (danh mục tính năng, admin thêm/xoá) + plan_feature_flags (bật/tắt
-- theo từng gói, 1 dòng mỗi cặp tính năng×gói). Xoá 1 dòng feature_catalog → cascade xoá hết
-- cờ liên quan.
--
-- Rollback: drop table if exists public.plan_feature_flags; drop table if exists public.feature_catalog;
create table if not exists public.feature_catalog (
  key         text primary key,
  label       text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.plan_feature_flags (
  feature_key text not null references public.feature_catalog(key) on delete cascade,
  plan        text not null check (plan in ('free', 'pro', 'vip')),
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now(),
  primary key (feature_key, plan)
);

-- Seed danh mục mặc định — khớp ĐÚNG hành vi hiện tại của app (không đổi trải nghiệm ai cả khi
-- migration này chạy), trừ "dialogue_roleplay" vốn đã chỉ mở cho Pro/VIP từ trước (xem
-- src/components/CefrLessonViews.tsx, biến `isPro`).
insert into public.feature_catalog (key, label, description, sort_order) values
  ('chat', 'Chat tổng hợp', 'Trò chuyện tự do với gia sư AI, sửa lỗi + giải thích', 10),
  ('writing', 'Luyện viết + chấm điểm', 'AI chấm bài viết kiểu IELTS, chỉ lỗi, ước lượng band', 20),
  ('speaking', 'Luyện nói song ngữ', 'Nói → AI nghe (STT) → trả lời + sửa lỗi bằng giọng nói 2 chiều', 30),
  ('learning_path', 'Lộ trình học CEFR', 'Học từ vựng + ngữ pháp theo cấp A1→C2', 40),
  ('dictionary', 'Từ điển Anh–Việt', 'Tra cứu từ vựng', 50),
  ('lessons', 'Bài học hội thoại kịch bản', 'Hội thoại mẫu có kịch bản sẵn', 60),
  ('phrases', 'Cụm từ thông dụng', 'Mẫu câu/cụm từ hay dùng trong đời sống', 70),
  ('mistake_bank', 'Ngân hàng lỗi sai', 'Ôn lại các lỗi từng mắc (kiểu SRS)', 80),
  ('challenge', 'Thử thách 1 phút', 'Thử thách theo tuần + bảng xếp hạng', 90),
  ('quests', 'Nhiệm vụ đổi lượt', 'Streak, thi đạt cấp, chia sẻ, mời bạn để kiếm thêm lượt', 100),
  ('dialogue_roleplay', 'Chế độ đóng vai hội thoại', 'AI chấm điểm khi đóng vai trong hội thoại CEFR', 110)
on conflict (key) do nothing;

insert into public.plan_feature_flags (feature_key, plan, enabled)
select c.key, p.plan, (c.key != 'dialogue_roleplay' or p.plan != 'free')
from public.feature_catalog c
cross join (values ('free'), ('pro'), ('vip')) as p(plan)
on conflict (feature_key, plan) do nothing;
