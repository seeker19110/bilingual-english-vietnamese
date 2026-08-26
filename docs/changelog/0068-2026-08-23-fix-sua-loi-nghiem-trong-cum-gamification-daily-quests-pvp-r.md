# fix: sửa lỗi nghiêm trọng cụm gamification (Daily Quests/PvP/Referral) — PR A trong loạt nâng cấp toàn diện (2026-08-23)

**Bối cảnh:** sau đợt xoá code chết (PR trước), người dùng yêu cầu "nâng cấp tất cả tính năng
hiện tại". Đã chạy 3 lượt khảo sát song song (Explore agent) qua 3 chế độ học cốt lõi, lộ trình
CEFR/SRS, và Companion Studios/gamification — tổng ~45 phát hiện cụ thể. Kế hoạch: 7 PR (A→G) +
4 việc quyết định lớn, làm tuần tự. Đây là PR A, phát hiện nghiêm trọng nhất trong toàn bộ đợt
khảo sát.

**Lỗi đã sửa:**

1. **Sai key token localStorage** (`auth_token` — không tồn tại; key thật `gsa_session_token_v1`)
   ở `dailyQuestsApi.ts`, `pvpArenaApi.ts`, `referralVipApi.ts`, `AcousticPhoneticsLab.tsx` — khiến
   MỌI request tới `/api/daily-quests`, `/api/pvp-arena`, `/api/referral-vip` không gửi
   Authorization, server rơi vào bucket `'u-default'`/`'guest-learner'` DÙNG CHUNG cho tất cả
   user (một người mở Rương Bí Ẩn → mọi người khác thấy rương đã mở). Sửa: dùng chung helper
   `getAuthHeader` từ `@core/authHeader` (đã có sẵn, 47 file lib khác đang dùng đúng).
2. **Xoá toàn bộ dữ liệu giả trong catch-fallback** của `dailyQuestsApi.ts`/`pvpArenaApi.ts`/
   `referralVipApi.ts` — trước đây khi request lỗi, các hàm trả về state "thành công" giả (VD:
   "đã hoàn thành 3/3 nhiệm vụ", Elo 1250, danh sách bạn bè mẫu) khiến người dùng tưởng thao tác
   thành công dù thực ra lỗi. Giờ lỗi bay lên UI xử lý thật.
3. **`DailyQuestsCard`**: thêm state lỗi + nút "Thử lại" (trước: card biến mất im lặng khi fetch
   lỗi); thêm toast khi mở rương thất bại (trước: `finally` không `catch`, bấm vô tri).
4. **`PvPArenaLobbyModal`**: toast khi tải hồ sơ/ghép trận thất bại (trước: `catch {}` rỗng); độ
   trễ giả 1.2s giờ chạy SONG SONG với request thật (`Promise.all`) thay vì cộng dồn sau khi
   request đã xong.
5. **`PvPBattlefieldModal`**: bọc `try/catch` quanh `submitPvPRoundAction` (trước: ngoài mọi
   catch — mạng chớp là trận đấu treo cứng vĩnh viễn, 4 nút disabled không hồi). Giờ: toast lỗi +
   reset để người chơi thử lại lượt đó (không tự phục hồi bộ đếm giờ — chấp nhận hạn chế này,
   ghi vào nợ kỹ thuật nếu cần làm kỹ hơn).
6. **Nhiệm vụ hàng ngày giờ tăng tiến độ thật** (trước: `updateQuestProgress()` không nơi nào gọi
   → luôn 0/3): nối `vocab_mastery` vào 2 điểm gọi `bumpDailyLearned` (`StudyTabs.tsx`,
   `CefrLessonViews.tsx`), `pvp_battle` vào lúc thắng trận PvP, `ai_dialogue` vào `onDone` của
   Companion — cả 3 đều gọi kiểu "fire-and-forget" (`.catch(() => {})`), không chặn luồng chính.

**Chưa sửa trong PR này (để riêng theo kế hoạch):**

- Elo PvP vẫn hardcode 1250 ở server (`api/pvp-arena.ts`) — cần bảng Postgres, xem việc quyết
  định #2 (PR sau).
- Hai hệ thống referral song song (`ReferralSection`/`lib/referral.ts` thật vs `ReferralVipBanner`/
  `referralVipApi.ts` với 2 "bạn mời" hardcode `Huyền Trang`/`Quốc Bảo` cho MỌI user) — xem việc
  quyết định #1 (PR sau).
- `api/daily-quests.ts`/`api/pvp-arena.ts`/`api/referral-vip.ts` vẫn lưu `Map` in-memory (mất khi
  server restart/cold start) — chấp nhận cho nhiệm vụ NGÀY (tự sinh lại đúng), nhưng PvP
  Elo/leaderboard nên chuyển Postgres cùng lúc với việc quyết định #2.

**Cổng đã chạy:** build ✅ · typecheck ✅ (0 lỗi, 4 tsconfig) · lint ✅ (0 cảnh báo) · format ✅ ·
test+coverage ✅ (statements 93.97% · branches 90.11% · functions 97.01% · lines 93.97% — giữ
nguyên baseline, không thêm test mới vì đây là sửa lỗi cơ học/nối dây, không phải logic phức tạp
mới). Không có test đơn vị sẵn cho 3 file `*Api.ts` này trước đó nên không có test regression.

**Kế hoạch còn lại:** PR B (lỗi hỏng luồng 3 chế độ học) → PR C (lỗi logic SRS/CEFR) → PR D (UX
Speaking) → PR E (Writing + hiển thị lỗi) → PR F (hiệu năng CEFR) → PR G (đánh bóng UX) → 4 việc
quyết định lớn (gộp referral, Elo+Memory Palace ra Postgres, ẩn telemetry USD, đã làm #4 ở trên).
