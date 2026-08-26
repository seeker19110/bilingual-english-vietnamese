# Tổng hợp 3 nhánh cũ tiền-V2 vào một PR (2026-08-16, PR #546)

3 PR treo từ trước khi V2 thành kiến trúc chính thức (#543 `claude/audit-data-flow-discrepancies-ex0185`,
#544 `claude/learning-progress-persistence-l1n2e4`, #545 `claude/jolly-mendel-xv76vp` — tổng 7
commit) được rà lại từng commit một bằng cherry-pick cô lập + soi từng đoạn conflict trên `main`
hiện tại (không chỉ grep tên file). **Kết quả: cả 7 commit đều đã được V2 hấp thụ đầy đủ hoặc vượt
qua** — enforcement theo `subject` (`isSubjectEnforced`), hoàn lượt đúng ngày đã trừ qua nửa đêm,
`grammarKey` hạ chữ thường, migration `0038_tts_cache_iv.sql`/`0039_tts_cache_stats.sql`
(main còn có thêm `recordTtsCacheEvent`/`isServableUrl` mà nhánh cũ chưa có), bảo vệ cache
ElevenLabs khỏi bị dọn nhầm orphan, merge tiến độ học kiểu union chỉ tăng
(`mergeArrayUnion`/`mergeByTimestamp`) + migration `0040_sync_user_settings.sql`, và các ghi chú
`PROGRESS.md` lịch sử — tất cả đã có nguyên vẹn trên `main`. Không có dòng code nào cần port.
Chi tiết đối chiếu từng nhóm: `docs/RECOVERY-V2-RECENT-BRANCHES.md`. PR #543/#544/#545 đóng lại,
lý do superseded by #546.
