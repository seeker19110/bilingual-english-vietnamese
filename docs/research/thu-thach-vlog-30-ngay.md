# Nghiên cứu & kế hoạch: Thử thách "English Vlog 1 phút/ngày" (30 ngày)

> Ngày: 2026-07-11 · Trạng thái: **ĐỀ XUẤT — CHỜ NGƯỜI DÙNG DUYỆT** (chưa code)
> Nguồn ý tưởng: người dùng — "Mỗi ngày quay 1 video ngắn bằng tiếng Anh về một việc bạn làm
> (ăn gì, nghĩ gì, thấy gì trên đường). Ban đầu khó lắm nhưng tiến bộ cực nhanh."
> Phương pháp: đọc mã nguồn thật (STT/TTS/usage/streak/push đã có) + tra cứu nghiên cứu
> sư phạm về vlog trong học ngoại ngữ + cơ chế thử thách 30 ngày. Không suy đoán.

---

## 1. Tóm tắt cho người bận (TL;DR)

**Đề xuất:** thêm chế độ **"Vlog 1 phút" — thử thách 30 ngày** tại trang mới `/vlog`:
mỗi ngày người học quay 1 video nói về đời sống của mình theo chủ đề gợi ý (mục tiêu ~1 phút,
trần **180 giây** — quyết định người dùng 2026-07-11, nâng từ 60s),
app **tự nghe lại** (STT Whisper đã có) → **AI sửa lỗi + khen ngợi bằng tiếng Việt**
(qua `/api/claude` đã có) → tô 1 ô trên **bảng 30 ngày**, có huy hiệu mốc 3·7·14·21·30.

**3 quyết định thiết kế quan trọng nhất** (đều nghiêng về **chi phí ≈ 0**):

| #   | Quyết định                                                                                | Lý do                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Video KHÔNG upload lên server** — lưu ngay trên máy người dùng (IndexedDB) + nút tải về | 1 phút video ≈ 5–15 MB; 30 ngày × nhiều người dùng sẽ vượt gói Supabase Storage miễn phí ngay. Chỉ text lên DB (≈ vài KB)            |
| 2   | **Chỉ gửi ÂM THANH lên server để nhận diện** (ghi song song 1 luồng audio-only)           | Tái dùng nguyên pipeline `/api/stt` hiện có (giới hạn ~6 MB; audio opus ~1 MB/phút → trần 180s ≈ 3 MB, vẫn lọt); video không rời máy |
| 3   | **Không thêm cột đếm lượt mới** — 1 vlog tiêu 1 lượt `stt` + 1 lượt `chat` sẵn có         | Không cần migration cho usage; free hiện 10 stt + 15 chat/ngày → thừa cho 1–2 vlog/ngày                                              |

**Điểm khác biệt so với "tự quay bằng điện thoại rồi đăng TikTok":** có AI phản hồi từng ngày
(nghiên cứu chỉ ra vlog tự do KHÔNG cải thiện độ chính xác nếu thiếu phản hồi — mục 2),
riêng tư tuyệt đối (video không rời máy — hết sợ ngại), và gắn vào hệ streak/SRS/lộ trình sẵn có.

**Phân kỳ 4 PR nhỏ** (mục 7): ① khung trang + quay + lưu local → ② STT + AI feedback +
bảng `vlog_entries` (migration 0010) → ③ game hóa (bảng 30 ô, huy hiệu, tổng kết, so sánh
ngày 1 vs 30) → ④ nhắc push + tích hợp Trang chủ/Dashboard + E2E/a11y.

---

## 2. Cơ sở sư phạm (vì sao đáng làm)

Tra cứu nghiên cứu về vlog trong dạy tiếng Anh (EFL) cho thấy ý tưởng của người dùng có
nền tảng khoa học vững:

- **Trôi chảy (fluency) & tự tin tăng rõ**: các nhóm thực nghiệm dùng vlog vượt nhóm đối
  chứng về từ vựng, độ trôi chảy và mức hoàn thành nhiệm vụ nói; sinh viên tự báo cáo
  91% thấy kỹ năng nói cải thiện ([INATESOL](https://journal.umg.ac.id/index.php/inatesol/article/view/9804),
  [ResearchGate — Improving the Speaking Skill by Vlog](https://www.researchgate.net/publication/334269864_Improving_the_Speaking_Skill_by_Vlog_video_blog_as_Learning_Media_The_EFL_Students_Perspective)).
- **Giảm lo âu khi nói** (rào cản số 1 của người Việt học tiếng Anh): 82% giảm lo âu, 88%
  tăng động lực; vlog giảm đáng kể "foreign language speaking anxiety" so với nhóm đối chứng
  ([Pattimura University](https://www.researchgate.net/publication/387484798_REDUCING_EFL_STUDENTS'_SPEAKING_ANXIETY_THROUGH_VLOG_IN_ENGLISH_EDUCATION_STUDY_PROGRAM_AT_PATTIMURA_UNIVERSITY),
  [BJET 2024 — Jin](https://bera-journals.onlinelibrary.wiley.com/doi/abs/10.1111/bjet.13381)).
- **⚠️ Nhưng độ CHÍNH XÁC không tự tăng**: nghiên cứu vlog ngoài lớp học ghi nhận fluency
  và động lực tăng nhưng "no discernible enhancements in speaking accuracy" khi không có
  phản hồi sửa lỗi ([UOC — Developing fluency and motivation through vlogging](https://openaccess.uoc.edu/items/ebbd7d03-5367-4b40-bb3d-c93ce5c4c25f?locale=en)).
  → **Đây chính là chỗ app của ta thêm giá trị**: mỗi vlog đều được AI sửa lỗi + giải thích
  bằng tiếng Việt (đúng "điểm khác biệt phải giữ" trong CLAUDE.md mục 1).
- **Vì sao 30 ngày**: streak 7 ngày đầu là ngưỡng "loss aversion" bắt đầu giữ chân; người giữ
  streak ≥ 7 ngày trong 2 tuần đầu có xác suất còn học ở ngày 30 cao hơn hẳn; sau ~30 ngày
  thói quen bắt đầu tự duy trì. App kết hợp cả streak + mốc (milestone) giữ chân tốt hơn
  35–60% so với chỉ 1 cơ chế ([Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit/),
  [Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps),
  [StriveCloud](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)).

Kết hợp với hạ tầng sẵn có (STT Whisper, chấm kiểu IELTS, streak + vé nghỉ, push nhắc giờ,
confetti/haptics), tính năng này **lấp đúng lỗ hổng lớp cảm xúc** đã chỉ ra trong
`cai-tien-trai-nghiem-hoc-2026-07-11.md` mà gần như không tốn thêm chi phí vận hành.

## 3. Trải nghiệm người dùng (luồng chính)

### 3.1 Một ngày trong thử thách

1. **Vào `/vlog`** (từ card Trang chủ hoặc thông báo push) → thấy bảng 30 ô + ô hôm nay
   nhấp nháy + **chủ đề gợi ý của ngày** (xem 3.3) kèm 6–8 từ/cụm gợi ý (bấm nghe TTS được).
2. **Bấm quay** → xin quyền camera+mic → đếm ngược 3-2-1 → quay tối đa **180 giây**
   (vòng tròn tiến độ, tự dừng ở 180s; dừng sớm được nếu ≥ 10s). Quay lại được (tối đa vài lần).
3. **Xem lại video** của chính mình (bước tự-quan-sát — self-monitoring, chính là chỗ
   "ban đầu khó lắm nhưng tiến bộ cực nhanh") → bấm **"Nộp vlog hôm nay"**.
4. App gửi **âm thanh** (không gửi video) lên `/api/stt` → transcript → gửi transcript +
   chủ đề lên `/api/claude` với prompt riêng → nhận **phản hồi có cấu trúc**:
   - 1 lời khen cụ thể (theo giọng điệu thân mật sẵn có của Chat/Speaking);
   - 2–3 lỗi đáng sửa nhất (không dội bom lỗi) + cách nói tự nhiên hơn, giải thích tiếng Việt;
   - 1 "câu nâng cấp" để dùng thử ngày mai; ước lượng nhịp nói (số từ/phút do client tự tính).
5. Ô hôm nay chuyển ✅ + confetti + haptic (tái dùng `confetti.ts`, `haptics.ts`) →
   cộng vào streak chung của app (vlog tính là hoạt động trong ngày).

### 3.2 Game hóa (gắn vào hệ sẵn có, không xây hệ mới)

- **Bảng 30 ô** kiểu lịch (tái dùng pattern `getActivityCalendar` — lưới 7 cột đã có ở Dashboard).
- **Huy hiệu mốc**: ngày 1 "Mở màn 🎬" · 3 "Khởi động 🔥" · 7 "Tuần đầu 🏅" · 14 "Nửa chặng 🚀"
  · 21 "Thành thói quen 💪" · 30 "Hoàn thành 🏆" — hiện màn ăn mừng (confetti + haptic).
- **Luật nghỉ**: dùng **chung cơ chế "vé nghỉ" 1 ngày/tuần** đã có của streak
  (`storage.ts` — streak freeze): lỡ 1 ngày/tuần không đứt thử thách. Nhất quán toàn app,
  không phát minh luật mới. Đứt hẳn → cho "tiếp tục từ ngày đã đến" hoặc "bắt đầu lại" (tự chọn).
- **Màn tổng kết ngày 30**: xem lại **video ngày 1 cạnh video ngày 30** (cả hai còn trên máy) —
  khoảnh khắc "wow" chủ đạo; kèm biểu đồ nhịp nói (từ/phút) + số từ vựng khác nhau đã dùng
  qua 30 ngày + tổng lỗi đã sửa. Nút "Chia sẻ thành tích" (chỉ ảnh tổng kết, không chia sẻ video).
- **Sau ngày 30**: mời vòng mới (chủ đề khó dần lên theo cấp CEFR đang học).

### 3.3 30 chủ đề sát đời sống Việt Nam (dữ liệu tĩnh, soạn tay)

Tuần 1 dễ — mô tả trực tiếp (Hôm nay tôi ăn gì · Đường tôi đi làm/đi học · Quán cà phê quen ·
Thời tiết hôm nay · Túi/balo của tôi có gì · Món khoái khẩu · Người tôi gặp hôm nay);
tuần 2 kể chuyện (chuyện buồn cười tuần này, chợ/siêu thị, mưa Sài Gòn/Hà Nội…); tuần 3 ý kiến
nhẹ (trà sữa đáng giá không, xe máy vs xe buýt…); tuần 4 trừu tượng hơn (điều muốn nói với
mình 1 năm trước, kế hoạch sau thử thách…). Mỗi chủ đề: tiêu đề song ngữ + 6–8 từ/cụm gợi ý +
2 câu mẫu. **Chiều B** (người nước ngoài học tiếng Việt): cùng bộ chủ đề, đề bài hiện tiếng Anh,
nói bằng tiếng Việt — tái dùng `lib/direction.ts` như mọi chế độ khác.

> Chủ đề là **gợi ý, không ép buộc** — người học được nói chủ đề tự do (nghiên cứu vlog hiệu quả
> nhờ tính "authentic" — nói về đời mình thật).

## 4. Thiết kế kỹ thuật

### 4.1 Quay & lưu trữ (chi phí ≈ 0, riêng tư tối đa)

- **Quay**: `getUserMedia({ video: { facingMode: 'user', width ≤ 720 }, audio: true })` +
  **2 MediaRecorder song song trên cùng stream**:
  - 1 recorder video (`video/mp4` trên iOS Safari, `video/webm;codecs=vp8` nơi khác — dò bằng
    `MediaRecorder.isTypeSupported`, cùng pattern `sttServer.ts:27` đang dùng cho audio);
  - 1 recorder **audio-only** (webm/opus ≈ ~1 MB/phút → trần 180s ≈ ~3 MB) từ
    `new MediaStream(stream.getAudioTracks())` → gửi thẳng vào pipeline `/api/stt` hiện có,
    **vẫn lọt** giới hạn ~6 MB kể cả khi quay hết trần 180 giây.
- **Lưu video**: IndexedDB (API thô, không thêm thư viện — giữ ngân sách bundle), key theo
  `uid + ngày`. Giữ tối đa **video ngày 1 + 7 video gần nhất** (dọn tự động, ~100 MB trần) để
  không phình bộ nhớ máy; luôn có nút **"Tải video về máy"** trước khi bị dọn. Ghi rõ trong UI:
  _"Video chỉ nằm trên thiết bị của bạn — không tải lên máy chủ."_
- **Mất video khi xóa dữ liệu trình duyệt** là đánh đổi chấp nhận được: transcript + phản hồi +
  tiến độ thử thách vẫn còn trên Supabase (đồng bộ đa thiết bị cho phần text).

### 4.2 Server & dữ liệu

- **Không thêm endpoint mới**: tái dùng `/api/stt` (Whisper Groq/OpenAI) + `/api/claude`
  (prompt mới đặt tại `src/prompts/vlog.ts` theo quy ước). Đếm lượt: **1 stt + 1 chat**/lần nộp
  (server đã đếm authoritative — `api/_lib/usage.ts`); client chặn sớm khi hết lượt như các chế độ khác.
- **Bảng mới `vlog_entries`** (migration `0010`, RLS owner-only như các bảng khác):
  `id · user_id · day (date, unique cùng user_id) · challenge_day (1..30) · topic_id ·
transcript · feedback (jsonb) · duration_sec · word_count · created_at`.
  Trạng thái thử thách (ngày bắt đầu, số vòng) để trong `learning_progress` hoặc cột jsonb riêng —
  chốt khi làm PR 2.
- **Nhắc hằng ngày**: tái dùng hạ tầng push sẵn có (`api/push.ts` + `remind_hour`) — thêm nội dung
  nhắc "🎬 Hôm nay chưa quay vlog" khi đang trong thử thách và hôm nay chưa nộp.

### 4.3 Ràng buộc chất lượng phải giữ (từ CLAUDE.md + audit trước)

- **Bundle budget chỉ còn ~1.7 kB** ở chunk chính → toàn bộ trang `/vlog` là **lazy route +
  chunk riêng** (pattern `lazyWithRetry.ts` sẵn có); không thêm thư viện ngoài.
- Mobile-first (vùng chạm ≥ 44px, quay dọc), 4 theme qua token `--a-*`, không hard-code màu,
  a11y AA (label nút quay/dừng, thông báo trạng thái `aria-live`), Zod validate mọi payload
  (đã có sẵn ở stt/ai), xử lý đủ nhánh lỗi: từ chối quyền camera (→ **fallback vlog chỉ-âm-thanh**),
  STT lỗi (hoàn lượt — `refundUsage` đã có), mạng rớt giữa chừng (video vẫn còn local, cho nộp lại).
- Ca biên phải test: đổi ngày lúc 0h (múi giờ VN — dùng `vnDateStr` như usage), nộp 2 lần 1 ngày
  (idempotent theo `user_id+day`), quay < 10s, hết lượt giữa chừng, IndexedDB đầy/quota.

## 5. Chi phí vận hành ước tính

| Khoản                    | Ước tính                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| STT (Groq whisper-turbo) | ~1 phút audio/người/ngày — trong ngưỡng free tier Groq hiện dùng; nếu OpenAI: ~$0.003/phút |
| Claude feedback          | 1 request ngắn/người/ngày (transcript ~150 từ) — tương đương 1 lượt chat hiện tại          |
| Supabase Storage         | **0** (video không upload)                                                                 |
| Supabase DB              | ~2–4 KB text/người/ngày — không đáng kể                                                    |

→ Phù hợp định hướng "miễn phí cho cộng đồng" (quyết định 2026-07-11).

## 6. Rủi ro & cách né

| Rủi ro                                                       | Cách né                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| iOS Safari hỗ trợ MediaRecorder video khác (mp4, không webm) | Dò `isTypeSupported` theo danh sách ưu tiên; E2E chỉ mock, tự smoke test tay trên iPhone thật   |
| Người dùng từ chối quyền camera                              | Fallback **vlog chỉ-âm-thanh** (vẫn đủ giá trị học — pipeline giống hệt, chỉ thiếu video local) |
| Ngại quay mặt mình                                           | Cho chọn "quay không lưu hình" (audio-only) ngay từ đầu; nhấn mạnh video không rời máy          |
| Nói quá ngắn (5–10s) để "điểm danh" cho xong                 | Yêu cầu ≥ 10s mới cho nộp; AI feedback khuyến khích kéo dài dần (không phạt)                    |
| Bảng 30 ô + trang mới làm phình bundle chính                 | Lazy route chunk riêng; đo `size-limit` trong CI (đã có gate)                                   |
| Lạm dụng gọi AI nhiều lần/ngày                               | Unique `user_id+day` + đếm lượt server sẵn có; nộp lại trong ngày = ghi đè, tốn lượt như thường |

## 7. Kế hoạch triển khai (4 PR nhỏ, tuần tự)

| PR  | Nội dung                                                                                                                                       | Kiểm tra được bằng                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Trang `/vlog` (lazy) + data 30 chủ đề (`src/data/vlogTopics.ts`) + quay video/audio ≤ 180s + lưu/xem lại/tải về (IndexedDB, `src/lib/vlog.ts`) | Quay & xem lại được trên mobile, chưa cần backend         |
| 2   | Nộp vlog: audio → `/api/stt` → transcript → `/api/claude` (prompt `src/prompts/vlog.ts`) → hiện feedback; migration **0010** `vlog_entries`    | Nộp thật nhận feedback; unit test lib + ca biên ngày/lượt |
| 3   | Game hóa: bảng 30 ô, huy hiệu mốc, vé nghỉ, màn tổng kết ngày 30 + so sánh ngày 1/30, vòng mới                                                 | Test logic mốc/đứt chuỗi; smoke luồng trọn vẹn            |
| 4   | Nhắc push "chưa quay vlog", card Trang chủ + ô Dashboard, i18n chiều B, E2E + a11y 4 theme                                                     | CI e2e + axe xanh; Lighthouse không tụt                   |

Mỗi PR qua đủ cổng commit/merge (CLAUDE.md mục 8–9). Ước lượng: PR 1–2 là phần nặng
(MediaRecorder + pipeline), PR 3–4 nhẹ hơn vì tái dùng hạ tầng sẵn có.

## 8. Câu hỏi cần người dùng chốt trước khi code

1. **Lưu video local-only** (đề xuất, chi phí 0, riêng tư) — đồng ý? Hay muốn có tùy chọn
   upload lên Supabase Storage (tốn dung lượng, phải trả phí khi đông người dùng)?
2. **Tính lượt**: 1 vlog = 1 lượt `stt` + 1 lượt `chat` (đề xuất, không cần migration) —
   đồng ý? Hay muốn cột lượt riêng `vlog_count` (kiểm soát chặt hơn, thêm migration)?
3. **Luật nghỉ**: dùng chung vé nghỉ 1 ngày/tuần như streak (đề xuất) — đồng ý?
4. **Phạm vi PR 1**: bắt đầu đúng theo bảng mục 7 — đồng ý cho làm PR 1?
