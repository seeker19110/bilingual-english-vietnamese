-- 0059_platform_vs_subject_profile.sql — Chốt ranh giới NỀN TẢNG vs MÔN HỌC cho dữ liệu hồ sơ
-- (PR C1b, xem docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md mục 8).
--
-- BỐI CẢNH: migration 0036 đã tạo `english.user_profile` để tách dữ liệu onboarding môn tiếng Anh
-- ra khỏi `public.profiles`, nhưng cố ý DỪNG ở bước "thêm bảng + backfill" — bảng đó tới nay vẫn
-- là bảng NGỦ, chưa code nào đọc/ghi. PR này đánh thức nó: `api/core/profile.ts` từ nay GHI CẢ HAI
-- nơi (dual-write) và ĐỌC ưu tiên `english.user_profile`, rơi về `public.profiles` khi chưa có.
--
-- SỬA MỘT PHÂN LOẠI SAI CỦA 0036: 0036 xếp `age_group` vào nhóm "chỉ đúng với việc học tiếng Anh".
-- Thực tế NGƯỢC LẠI — nhóm tuổi là dữ liệu CẤP NỀN TẢNG: nó quyết định giọng nói của Companion
-- (`apps/dhcb/src/prompts/index.ts` → ageGroupToneBlock), nội dung phù hợp lứa tuổi, và băng tuổi
-- trong hồ sơ năng lực (dùng cho MỌI môn, không riêng tiếng Anh). Vì vậy:
--   • `public.profiles.age_group`  → GIỮ, đây là nguồn sự thật duy nhất (dữ liệu nền tảng).
--   • `english.user_profile.age_group` → XOÁ, tránh hai nguồn sự thật lệch nhau.
--
-- AN TOÀN: cột bị xoá thuộc bảng NGỦ (chưa code nào đọc/ghi kể từ 0036) và dữ liệu trong đó chỉ là
-- bản sao backfill từ `public.profiles` — bản gốc còn nguyên. Không mất dữ liệu.
--
-- Idempotent. Rollback:
--   alter table english.user_profile add column if not exists age_group text;
--   update english.user_profile e set age_group = p.age_group
--     from public.profiles p where p.id = e.user_id;

alter table if exists english.user_profile drop column if exists age_group;

-- Bảo đảm mọi người dùng đã onboarded đều có hàng trong bảng môn (dual-write dùng upsert nên
-- không bắt buộc, nhưng backfill lại ở đây cho những ai đăng ký SAU khi 0036 chạy).
insert into english.user_profile (user_id, user_level, goal, daily_minutes)
select id, user_level, goal, daily_minutes
from public.profiles
where onboarded = true
on conflict (user_id) do nothing;
