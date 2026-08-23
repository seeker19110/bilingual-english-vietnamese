-- 0061_personal_intake.sql — Luồng NGƯỜI MỚI: 5 câu ~90 giây → hồ sơ ẩn → gợi ý một việc.
-- Đặc tả: docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md
--
-- Đây là lớp NỀN TẢNG, chạy TRƯỚC onboarding từng môn (`english.user_profile`, migration 0036/0059).
-- Nhóm tuổi vẫn là nguồn sự thật ở `public.profiles.age_group` — bảng này KHÔNG giữ bản sao, để
-- không lặp lại đúng lỗi hai nguồn sự thật mà 0059 vừa dọn.
--
-- MÃ HOÁ: hai câu trả lời tự do (câu 3, câu 4) là dữ liệu tầng T2 — chúng là lời người dùng tự nói
-- về bản thân, và câu 4 còn là tín hiệu năng khiếu. Lưu dạng ciphertext của
-- packages/core-config/userDataCrypto.ts (`v<n>:<iv>:<cipher>`), cần USER_DATA_MASTER_KEY.
-- Các câu chọn-sẵn (mối bận tâm, đà học) KHÔNG mã hoá: chúng là giá trị đóng, cần lọc/thống kê,
-- và mã hoá chúng chỉ làm hỏng truy vấn mà không giấu được gì đáng kể (chỉ 6 và 4 khả năng).
--
-- Idempotent. Rollback: drop table if exists personal.intake;

create table if not exists personal.intake (
  user_id            uuid primary key references public.users(id) on delete cascade,
  -- Câu 2 — mối bận tâm hiện tại. null = người dùng bỏ qua câu này (được phép).
  focus              text,
  -- Câu 5 — đà học hiện tại.
  last_learned       text,
  -- Câu 3 & 4 — ĐÃ MÃ HOÁ. null = bỏ qua.
  extra_hour_enc     text,
  flow_activity_enc  text,
  -- Việc người dùng đã CHỌN từ màn gợi ý (id trong kho việc của intakeSuggestion.ts). Lưu lại để
  -- biết gợi ý có trúng không — chỉ số quan trọng nhất của luồng này là tỷ lệ HOÀN THÀNH việc đầu.
  chosen_task_id     text,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'intake_focus_check') then
    alter table personal.intake add constraint intake_focus_check
      check (focus is null or focus in
        ('hoc_thi','cong_viec','suc_khoe','tien_bac','quan_he','chua_ro'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'intake_last_learned_check') then
    alter table personal.intake add constraint intake_last_learned_check
      check (last_learned is null or last_learned in
        ('tuan_nay','vai_thang','lau_roi','khong_nho'));
  end if;
end $$;
