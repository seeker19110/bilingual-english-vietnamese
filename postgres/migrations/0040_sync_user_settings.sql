-- 0040_sync_user_settings.sql — Đồng bộ đa thiết bị cho cài đặt cá nhân + vé nghỉ streak.
--
-- Yêu cầu người dùng 2026-08-13: ngôn ngữ giao diện, chiều học (Anh⇄Việt), âm thanh,
-- giọng đọc TTS, vé nghỉ streak trước đây CHỈ lưu localStorage → đổi máy là mất. Thêm 2 cột:
--
--   settings              jsonb  — { uiLang, direction, soundEnabled, voicePref,
--                                     voiceRandomPref, nativeVoiceOn, nativeVoicePref,
--                                     updatedAt } — hợp nhất theo `updatedAt` MỚI HƠN thắng
--                                     (giống placement/weeklyGoal — đây là "lựa chọn hiện tại",
--                                     không phải tiến độ "chỉ tăng").
--   streak_freeze_dates   jsonb  — mảng "yyyy-mm-dd" — hợp nhất UNION như learned/achievements
--                                     (chỉ tăng, không bao giờ mất vé đã ghi nhận ở máy khác).
--
-- Rollback: alter table english.learning_progress drop column if exists settings,
--           drop column if exists streak_freeze_dates; (mất dữ liệu 2 cột này, không ảnh
--           hưởng các cột tiến độ học khác).

alter table english.learning_progress
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists streak_freeze_dates jsonb not null default '[]'::jsonb;
