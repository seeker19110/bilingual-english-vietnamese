# Nghiên cứu & kế hoạch: Thử thách "English Vlog 1 phút/ngày" (30 ngày)

> Ngày: 2026-07-11 · Trạng thái: **ĐÃ TRIỂN KHAI XONG** (PR #230, #231, #233 + follow-up) — xem
> `PROGRESS.md`.
> **[2026-07-12] Lưu ý:** tính năng đã đổi tên "Vlog" → "Challenge" (route `/vlog` → `/challenge`,
> `vlogTopics.ts` → `challengeTopics.ts`, `lib/vlog.ts` → `lib/challenge.ts`...). Tài liệu này GIỮ
> NGUYÊN tên gọi/đường dẫn cũ vì là bản ghi nghiên cứu tại thời điểm thiết kế — đối chiếu tên file
> thật trong code khi cần.
> Nguồn ý tưởng: người dùng — "Mỗi ngày quay 1 video ngắn bằng tiếng Anh về một việc bạn làm. Ban
> đầu khó lắm nhưng tiến bộ cực nhanh."

## Bối cảnh & đề xuất

Thêm chế độ **"Vlog 1 phút" — thử thách 30 ngày**: mỗi ngày quay 1 video (trần **180 giây**, quyết
định người dùng 2026-07-11, nâng từ đề xuất ban đầu 60s) nói về đời sống theo chủ đề gợi ý, app
**tự nghe lại** (STT Whisper có sẵn) → **AI sửa lỗi + khen ngợi bằng tiếng Việt** (`/api/agent`) →
tô 1 ô trên bảng 30 ngày, huy hiệu mốc 3·7·14·21·30.

## Cơ sở sư phạm

Vlog trong EFL cho thấy tăng rõ độ trôi chảy/tự tin (91% sinh viên tự báo cáo cải thiện) và giảm
lo âu khi nói (82% giảm lo âu — rào cản số 1 của người Việt). **Nhưng độ chính xác không tự tăng**
nếu thiếu phản hồi sửa lỗi — đây chính là chỗ AI của app thêm giá trị (đúng "điểm khác biệt phải
giữ" ở CLAUDE.md mục 1). 30 ngày vì: streak ≥7 ngày trong 2 tuần đầu tăng mạnh khả năng duy trì đến
ngày 30; kết hợp streak + milestone giữ chân tốt hơn 35–60% so với 1 cơ chế đơn (nguồn: nghiên cứu
EFL vlog trên INATESOL/ResearchGate/BJET 2024; Duolingo blog về streak).

## 3 quyết định thiết kế quan trọng nhất (đều nghiêng về chi phí ≈ 0)

| #   | Quyết định                                                                        | Lý do                                                                                           |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | **Video KHÔNG upload lên server** — lưu trên máy (IndexedDB) + nút tải về         | 1 phút video ≈ 5–15MB; 30 ngày × nhiều người dùng sẽ vượt gói Storage miễn phí ngay             |
| 2   | **Chỉ gửi ÂM THANH lên server** để nhận diện (ghi song song 1 luồng audio-only)   | Tái dùng nguyên pipeline `/api/stt` (giới hạn ~6MB; audio opus ~1MB/phút → 180s ≈ 3MB, vẫn lọt) |
| 3   | **Không thêm cột đếm lượt mới** — 1 vlog tiêu 1 lượt `stt` + 1 lượt `chat` sẵn có | Free hiện 10 stt + 15 chat/ngày — thừa cho 1–2 vlog/ngày, không cần migration usage             |

## Thiết kế chính

- **Quay**: `getUserMedia` + 2 `MediaRecorder` song song (1 video, 1 audio-only gửi lên `/api/stt`).
- **Lưu video**: IndexedDB, giữ tối đa video ngày 1 + 7 video gần nhất (~100MB trần, dọn tự động),
  luôn có nút tải về trước khi bị dọn. Mất video khi xóa dữ liệu trình duyệt là đánh đổi chấp nhận
  được — transcript/feedback/tiến độ vẫn còn trên Supabase.
- **Server**: không thêm endpoint mới, tái dùng `/api/stt` + `/api/agent` (prompt riêng
  `src/prompts/vlog.ts`). Bảng mới `vlog_entries` (migration `0010`, RLS owner-only):
  `id · user_id · day (unique/user) · challenge_day · topic_id · transcript · feedback (jsonb) ·
duration_sec · word_count · created_at`.
- **Game hóa**: tái dùng pattern có sẵn — bảng 30 ô kiểu lịch, huy hiệu mốc, **vé nghỉ chung với
  streak** (1 ngày/tuần, không phát minh luật mới), màn tổng kết ngày 30 so sánh video ngày 1 vs 30.
- **30 chủ đề** sát đời sống Việt Nam (soạn tay, song ngữ, gợi ý — không ép buộc), dùng chung cho
  cả 2 chiều học qua `lib/direction.ts`.
- **Ràng buộc chất lượng**: lazy route/chunk riêng (ngân sách bundle hạn hẹp), mobile-first, 4
  theme, a11y AA, Zod validate, xử lý đủ nhánh lỗi (từ chối quyền camera → fallback audio-only, STT
  lỗi → hoàn lượt, mạng rớt → video vẫn còn local để nộp lại).

## Chi phí vận hành ước tính

STT + Claude feedback ≈ tương đương 1 lượt chat/ngày mỗi người; Supabase Storage = 0 (video không
upload); Supabase DB ~2–4KB text/người/ngày. Phù hợp định hướng "miễn phí cho cộng đồng".

## Rủi ro đã lưu ý

iOS Safari dùng codec video khác (mp4 không webm) → dò `isTypeSupported`; từ chối quyền camera →
fallback audio-only; ngại quay mặt → cho chọn audio-only từ đầu; nói quá ngắn để "điểm danh" →
yêu cầu ≥10s mới cho nộp; lạm dụng gọi AI nhiều lần/ngày → unique `user_id+day`, đếm lượt server.

## Câu hỏi đã chốt cùng người dùng (2026-07-11)

1. Lưu video local-only — ✅ đồng ý.
2. Tính lượt: 1 vlog = 1 lượt `stt` + 1 lượt `chat` sẵn có — ✅ đồng ý, không thêm cột.
3. Luật nghỉ dùng chung vé nghỉ streak — ✅ đồng ý.
4. Trần ghi hình nâng từ 60s lên **180 giây** — ✅ quyết định người dùng.

## Kết quả triển khai

PR #230 (nền tảng: data chủ đề, prompt AI, ghi hình + IndexedDB, migration 0010) → #231 (tự động
chạy migration khi deploy) → #233 (trang hoàn chỉnh: quay → nộp → feedback, bảng 30 ô, huy hiệu, vé
nghỉ, tổng kết) → follow-up (nhắc push, gate a11y 16 test). Còn ngoài phạm vi: i18n gộp từ điển
trung tâm, E2E cho luồng quay/nộp thật (cần mock `getUserMedia` sâu hơn).
