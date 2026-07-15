# Đặc tả: Nâng cấp 5 hạng mục sư phạm còn thua app lớn (2026-07-15)

> Nguồn gốc: phân tích so sánh với Duolingo / ELSA / Babbel / Busuu / Speak cho thấy app đang
> **thắng** ở sửa lỗi bằng giọng tiếng mẹ đẻ + lỗi đặc thù người Việt + lộ trình CEFR đầy đủ,
> nhưng **thua** ở 5 điểm: ① chấm phát âm chi tiết, ② động lực duy trì, ③ nghe đa dạng,
> ④ test xếp lớp, ⑤ độ tin cậy "giáo viên AI".
>
> Tài liệu này là ĐẶC TẢ TRIỂN KHAI — mỗi hạng mục: hiện trạng thật trong code → thiết kế →
> chia PR nhỏ → tiêu chí chấp nhận → chi phí/rủi ro. Thứ tự ưu tiên đề xuất ở cuối.
> Liên quan: `danh-gia-tien-trien-hoc-2026-07-07.md` (đề xuất C–H) — tài liệu này KẾ THỪA và
> cụ thể hóa các mục trùng (nghe hiểu = D, giữ chân = H), không làm song song 2 kế hoạch.

## Nguyên tắc chung (áp cho cả 5 hạng mục)

- **Chi phí ≈ 0 trước, trả phí sau:** dự án miễn phí cho cộng đồng → ưu tiên giải pháp chạy
  trình duyệt / tận dụng hạ tầng sẵn có / free tier; mọi API trả phí mới đều phải qua
  `consume_usage` (đếm lượt/ngày) như chat/stt hiện nay.
- **Tận dụng cái đã có:** TTS đã hỗ trợ **4 giọng** mỗi ngôn ngữ (`Voice = female|female2|male|male2`,
  cache theo `hash(text+lang+voice)` — `api/tts.ts`); Web Push nhắc học theo giờ đã chạy
  (`src/lib/pushNotif.ts` + `/api/push`); engine dựng đề trộn ngẫu nhiên đã có (`src/lib/cefrExam.ts`);
  SRS đã có vé nghỉ streak + leech + cap phiên (`src/lib/srs.ts`).
- **Mỗi PR một lát cắt hoàn chỉnh** — chạy được, test được, không phá tính năng cũ (CLAUDE.md §3).

---

## ① Chấm phát âm chi tiết (thu hẹp khoảng cách với ELSA)

### Hiện trạng

`src/lib/pronounceScore.ts`: Web Speech STT → so chuỗi ký tự Levenshtein → điểm 0–100 +
highlight từ đúng/sai (`scoreWords`, ngưỡng ~25% ký tự lệch). UI: `PronunciationCheck.tsx`.

**Hạn chế bản chất:** Web Speech tự "sửa lỗi hộ" người nói (nghe "tree" vẫn trả "three" nếu
ngữ cảnh gợi ý) → điểm ảo; không biết sai **âm nào**; không chấm được trọng âm/âm cuối — đúng
những lỗi nặng nhất của người Việt.

### Giải pháp — 2 giai đoạn

**Giai đoạn 1 (chi phí $0): "Huấn luyện viên lỗi Việt" chạy trình duyệt.**
Không cố đo âm vị bằng Levenshtein (bất khả thi) — thay vào đó khai thác _tri thức đối chiếu_:

- Thêm `src/data/pronunciationTraps.ts`: bảng ánh xạ **cặp lỗi điển hình của người Việt**,
  soạn tay (~60–80 mục), mỗi mục: `{ pattern, trap, tipVi }`. Ví dụ:
  - âm cuối bị nuốt: từ kết thúc `-s/-ts/-ks` → tip "người Việt hay nuốt âm cuối /s/…"
  - `th` → /t,d/: "three→tree", "they→day"
  - `sh` vs `s`, `ch` vs `tr`, `j/z` vs `d`
  - cụm phụ âm đầu: `str-`, `spr-`, `sk-`
  - từ đa âm tiết → đánh dấu trọng âm (lấy từ trường phiên âm IPA đã có trong từ điển nếu có,
    kiểm tra `DictEntry` trước khi làm).
- `src/lib/pronounceCoach.ts`: nhận `(target, spoken)` — với mỗi từ bị chấm sai ở `scoreWords`,
  tra bảng trap → sinh **gợi ý cụ thể bằng tiếng Việt** ("Bạn đọc 'tree' — chú ý âm /θ/: đặt
  lưỡi giữa 2 hàm răng…"). Kèm nút 🔊 đọc lại từ đó bằng TTS (đã có sẵn).
- Sửa `scoreWords`: khi từ spoken khớp với **dạng trap** của từ target (vd target "three",
  spoken "tree") → đánh dấu `trapHit` thay vì chỉ `ok:false`, để UI hiện tip đúng lỗi.
- UI `PronunciationCheck.tsx`: dưới dòng highlight hiện tối đa 2 tip (tránh ngợp).

**Giai đoạn 2 (khi Giai đoạn 1 đã chạy ổn): chấm âm vị thật qua Azure Pronunciation Assessment.**

- **Vì sao Azure:** là API thương mại duy nhất trả điểm tới **từng âm vị** (accuracy per
  phoneme + lỗi omission/insertion/mispronunciation), có free tier F0 (5 giờ audio/tháng),
  hỗ trợ en-US. Google/AWS không có sản phẩm tương đương. Tự host wav2vec2-phoneme trên VPS
  bị LOẠI: VPS đang share với app khác, CPU inference chậm >5s/câu, phức tạp vận hành.
  ⚠️ Trước khi code PHẢI xác minh lại pricing/tier trên trang Azure hiện hành (KHUNG 3 —
  research-first, thông tin ở đây là thời điểm viết đặc tả).
- **Kiến trúc:** client ghi âm sẵn có (`MediaRecorder`, pipeline STT) → convert sang WAV PCM
  16kHz mono ở client (AudioContext `decodeAudioData` + downsample, ~30 dòng, `src/lib/wav.ts`)
  → POST `/api/pronounce-assess` (handler mới `api/pronounce-assess.ts`): validate Zod + auth +
  `consume_usage(mode:'pronounce')` → gọi Azure REST (key trong `.env`: `AZURE_SPEECH_KEY`,
  `AZURE_SPEECH_REGION`) → trả JSON rút gọn `{ overall, words: [{word, score, phonemes:
[{p, score}], errorType}] }`.
- **Giới hạn lượt:** cột `pronounce_count` trong `daily_usage` (migration mới), free 10/ngày
  (5h/tháng ÷ ~5s/câu ≈ 3.600 câu/tháng — 10/ngày/người là an toàn với cỡ người dùng hiện tại;
  xem lại khi user tăng). Hết lượt → tự rơi về Giai đoạn 1 (client, miễn phí) — UI ghi rõ.
- **UI:** màu theo điểm âm vị (xanh ≥80 / vàng 60–79 / đỏ <60 — dùng màu ngữ nghĩa sẵn có),
  bấm vào từ → xem chi tiết âm vị + tip tiếng Việt (map âm vị → tip từ bảng trap Giai đoạn 1,
  tái dùng).
- **Chiều B (người nước ngoài học tiếng Việt):** Azure chưa hỗ trợ vi-VN pronunciation
  assessment → chiều B giữ Giai đoạn 1. Ghi rõ trong UI.

### Chia PR

1. `feat(pronounce): bảng lỗi phát âm đặc thù người Việt + coach tip` (Giai đoạn 1 — data + lib + test)
2. `feat(pronounce): hiện tip lỗi trong PronunciationCheck` (UI + E2E)
3. `feat(api): /api/pronounce-assess qua Azure + đếm lượt pronounce` (Giai đoạn 2 — server)
4. `feat(pronounce): UI điểm âm vị chi tiết + fallback client` (Giai đoạn 2 — client)

### Tiêu chí chấp nhận

- G1: đọc "tree" khi target "three" → hiện tip về /θ/ bằng tiếng Việt; ≥1 unit test cho mỗi
  nhóm trap; không gọi API nào mới.
- G2: câu 5 từ trả điểm từng âm vị <3s; hết lượt → fallback G1 không vỡ UI; key không lộ client;
  `npm run typecheck && npm test && npm run test:e2e` xanh.

### Rủi ro

- Web Speech "sửa hộ" làm trap không kích hoạt → chấp nhận (G1 là best-effort, G2 mới là thật).
- Azure đổi giá/tier → đã có fallback G1, chỉ cần tắt env key là app vẫn chạy.

---

## ② Động lực duy trì (motivation engineering)

### Hiện trạng

Đã có: streak + màn ăn mừng + confetti, **vé nghỉ streak** (SRS), Web Push nhắc học theo giờ
(`remindHour` cố định người dùng chọn), WordOfTheDay, Dashboard biểu đồ 7 ngày, cap 30 thẻ
SRS/phiên (chống ngợp), thẻ mới due +4h (chống "vừa xong đã nợ"). PROGRESS còn ghi V-4 (huy
hiệu), V-5 (Home "Hôm nay"), V-6 (âm UI) chưa làm.

→ Nền đã khá; cái thiếu so với Duolingo là **mục tiêu tuần**, **huy hiệu/mốc**, **nhắc thông
minh**, và **luồng quay lại sau khi bỏ bẵng** (comeback).

### Thiết kế — 5 mảnh (M5 giải đấu chia 2 PR, còn lại mỗi mảnh 1 PR)

**M1 — Mục tiêu tuần (weekly goal).**

- `src/lib/weeklyGoal.ts`: mục tiêu = số **ngày học/tuần** (3/5/7 — chọn ở Hồ sơ, mặc định 5;
  KHÔNG dùng XP/phút vì app đã đo "ngày có hoạt động" trong `stats.ts`). Tuần tính từ Thứ 2,
  theo ngày LOCAL (nhất quán với streak hiện tại — kiểm tra `lib/date.ts` trước).
- Dashboard: vòng tiến độ tuần (3/5 ngày) + dòng động viên. Đạt mục tiêu tuần → màn ăn mừng
  (tái dùng confetti) + huy hiệu tuần (nối M2).
- Lưu: localStorage + cột JSONB trong `learning_progress` (pattern sẵn có của `cefrProgress`).

**M2 — Huy hiệu & mốc (V-4 cũ, cụ thể hóa).**

- `src/data/achievements.ts`: ~20 huy hiệu khai báo tĩnh
  `{ id, icon, nameVi, nameEn, cond }`, 4 nhóm: chuỗi ngày (7/30/100/365) · khối lượng (100/500/
  1000 từ thuộc, qua cấp A1…C2) · kỹ năng (10 phiên Speaking, 10 bài viết được chấm, điểm phát
  âm ≥90 lần đầu) · đặc biệt (học đủ 7 ngày liên tiếp trước 8h sáng…— chọn vui, không ép).
- `src/lib/achievements.ts`: `checkNewAchievements(stats)` chạy sau mỗi phiên học — pure
  function, dễ test ca biên. Huy hiệu mới → toast + confetti, xem lại ở `/profile`.

**M5 — Giải đấu tuần (leaderboard) — NGƯỜI DÙNG CHỐT LÀM (2026-07-15).**

> AI từng đề xuất KHÔNG làm (áp lực so găng, cần đông người dùng); người dùng quyết định LÀM
> để việc học đỡ nhàm. Thiết kế dưới đây giữ tinh thần "đồng hành nhẹ nhàng" bằng các biện
> pháp giảm mặt trái — đây là điều kiện đi kèm, không cắt khi triển khai.

- **Điểm tuần** tính Ở SERVER từ dữ liệu đã có (không tin client — CLAUDE.md §4.2): từ
  `daily_usage` (đã đếm atomic qua `consume_usage`) + `learning_progress`. Công thức đợt đầu,
  hằng số đặt tên trong `api/_lib/leaderboard.ts`: 1 điểm/từ mới thuộc · 1 điểm/thẻ SRS ôn ·
  5 điểm/phiên Chat·Viết·Nói. Client KHÔNG gửi điểm lên — server tự tổng hợp.
- **Tham gia opt-in + nickname:** mặc định KHÔNG vào giải. Bật ở `/profile` → chọn nickname
  (validate server: 3–20 ký tự, lọc từ bậy cơ bản, không trùng). Bảng xếp hạng chỉ hiện
  nickname + điểm — KHÔNG lộ email/tên thật/uid (cột `nickname`, `league_opt_in` trong
  `profiles`, migration mới; RLS: đọc bảng xếp hạng qua API server, không mở SELECT chéo user).
- **Cơ chế giải:** giải TUẦN (Thứ 2 → CN, UTC+7 cố định — ghi rõ để khỏi lệch ngày), bảng ≤30
  người (đủ đông mới chia bảng; ít người dùng thì 1 bảng chung — xử lý ca "bảng 2 người" ngay
  từ đầu). Top 3 cuối tuần → huy hiệu (nối M2). **Không có xuống hạng/bêu tên** — chỉ thăng
  hạng và ghi nhận; người không chơi tuần đó đơn giản là vắng mặt, không bị trừ gì.
- **API:** `GET /api/leaderboard` (auth) → `{ me: {rank, points}, top: [{nickname, points}],
weekEnds }`. Cache server 5 phút (đủ tươi, đỡ query). UI: mục "🏆 Giải đấu tuần" ở Dashboard
  - trang `/league` đơn giản.
- **Chống gian lận mức hợp lý:** điểm chỉ từ counters server-side; trần điểm/ngày (= trần
  lượt dùng sẵn có) nên không farm vô hạn được. Không làm hơn ở quy mô hiện tại.
- Chia PR: (1) `feat(league): migration + tính điểm tuần + /api/leaderboard` · (2)
  `feat(league): opt-in nickname + UI bảng xếp hạng + huy hiệu top 3`.

**M3 — Nhắc thông minh (nâng cấp push sẵn có).**

- Hiện `remindHour` cố định. Nâng: server chọn giờ gửi = **giờ người dùng thường học nhất**
  (mode của giờ trong `daily_usage` 14 ngày gần nhất; chưa đủ dữ liệu → giữ giờ đã chọn).
- Nội dung nhắc theo ngữ cảnh, xoay vòng chống nhàm (đang có X thẻ SRS đến hạn / sắp mất
  streak Y ngày / còn Z từ là đạt mục tiêu tuần). Template ở server (`api/_lib/pushTemplates.ts`).
- **Đạo đức:** tối đa 1 push/ngày, có nút tắt hẳn — không "dọa" kiểu tối hậu thư.

**M4 — Luồng quay lại (comeback) + Home "Hôm nay" (V-5 cũ).**

- Bỏ ≥3 ngày → lần mở app kế: màn chào "Mừng bạn quay lại 👋" + đề xuất phiên RÚT GỌN (5 thẻ
  SRS + 3 từ mới) thay vì đập nguyên nợ ôn vào mặt (nghiên cứu Duolingo: nợ ôn dồn là lý do bỏ
  học số 1 — đã ghi chú trong `srs.ts`).
- Home gom "việc hôm nay" 1 chỗ: N từ mới · M thẻ ôn · 1 gợi ý Speaking dùng từ vừa học
  (nối đề xuất B của `danh-gia-tien-trien-hoc`).

### Tiêu chí chấp nhận (chung)

Mỗi mảnh: unit test logic thuần (tuần nhuận ngày, đổi múi giờ, streak vs goal lệch nhau) ·
không tăng bundle quá budget (`size-limit`) · a11y AA (huy hiệu có text, không chỉ màu/icon) ·
sync Supabase theo pattern `pushProgress` sẵn có.

---

## ③ Nghe đa dạng (nhiều giọng, tốc độ, ngữ cảnh)

### Hiện trạng

Hạ tầng TTS **đã có 4 giọng/ngôn ngữ** + cache theo giọng — nhưng UI gần như chỉ dùng 1 giọng
mặc định. Bài thi cuối cấp đã có phần nghe TTS (`cefrExam.ts`). Thẻ `<audio>` dùng chung
(`tts.ts`) → chỉnh `playbackRate` được ngay.

→ Đây là hạng mục RẺ NHẤT: chủ yếu là _dùng_ hạ tầng sẵn có, không thêm dịch vụ mới.

### Thiết kế — 3 mảnh

**N1 — Tốc độ phát 0.75× / 1× / 1.25×.**

- Nút tốc độ trong mọi chỗ phát TTS (component nghe dùng chung — rà `WordCard`,
  `CefrLessonViews`, Speaking). Set `audio.playbackRate` + `preservesPitch` trên thẻ dùng chung
  (`getSharedAudio()`); lưu lựa chọn localStorage. **Không** sinh audio mới → $0, cache nguyên vẹn.
- Lưu ý kỹ thuật: kiểm tra `preservesPitch` trên Safari iOS (tiền tố webkit) — có fallback bỏ
  chỉnh pitch, chỉ chỉnh rate.

**N2 — Xoay giọng có chủ đích (voice rotation).**

- Quy ước sư phạm: **gia sư giữ 1 giọng cố định** (Emma/Linh — danh tính nhất quán tạo gắn bó),
  còn **nội dung luyện nghe thì xoay giọng**:
  - Hội thoại mẫu trong bài học CEFR: người A giọng `female`, người B giọng `male` (đúng vai).
  - Flashcard/WordCard: nút "nghe giọng khác" xoay vòng 4 giọng.
  - Phần nghe của bài thi + tab Kiểm tra: random giọng mỗi câu (seed theo đề — thi lại nghe
    giọng khác, chống học vẹt âm).
- Sửa: truyền `voice` xuống các lời gọi `speak()` hiện có (tham số đã tồn tại trong API).
  Cache tăng ~4× dung lượng cho câu được nghe đủ 4 giọng — chấp nhận (Supabase Storage rẻ).

**N3 — Bài luyện nghe chuyên biệt (đề xuất D cũ, cụ thể hóa).**

- Dạng bài "Nghe → gõ lại" (dictation) + "Nghe → chọn nghĩa": tái dùng engine `buildExam` phần
  listening, thêm dạng dictation chấm bằng `scoreWords` (đã có).
- Mỗi cấp CEFR thêm mục "Luyện nghe" trong tab học (câu lấy từ kho hội thoại + câu ví dụ sẵn
  có của cấp đó — KHÔNG cần soạn nội dung mới đợt đầu).
- Tốc độ mặc định theo cấp: A1–A2 0.9×, B1+ 1×, C1+ 1.1× (hằng số đặt tên, không magic number).
- **Ngoài phạm vi (ghi nhận, chưa làm):** audio người thật/video kiểu Cake — cần nguồn nội
  dung bản quyền, để ngỏ; TTS Google neural hiện đủ tốt cho mục tiêu trước mắt.

### Chia PR

1. `feat(tts): nút tốc độ phát + preservesPitch` (N1)
2. `feat(tts): xoay giọng hội thoại/flashcard/thi` (N2)
3. `feat(learn): bài luyện nghe dictation theo cấp CEFR` (N3)

### Tiêu chí chấp nhận

N1: đổi tốc độ có hiệu lực ngay giữa câu đang phát, giữ nguyên cao độ trên Chrome/Firefox,
iOS không vỡ tiếng. N2: 2 nhân vật hội thoại 2 giọng khác nhau; gia sư Speaking vẫn 1 giọng.
N3: dictation chấm đúng với lỗi 1 ký tự (dùng ngưỡng `scoreWords` hiện hành); đếm vào giới hạn
lượt TTS/cache như cũ.

---

## ④ Bài test xếp lớp đầu vào (placement test)

### Hiện trạng

Onboarding hỏi người dùng TỰ chọn trình độ (`onboarding.ts`: beginner/intermediate/advanced).
Đã có sẵn: kho từ vựng 12.073 từ gắn nhãn CEFR + kho ngữ pháp/quiz theo cấp + engine dựng đề
`buildExam` (trộn từ vựng 2 chiều · ngữ pháp · nghe TTS · đọc hiểu) + hệ chấm `scoreExam`.

→ Chi phí gần $0: chỉ cần logic thích ứng + 1 trang UI, không cần nội dung mới, không gọi AI.

### Thiết kế

**Thuật toán thích ứng bậc thang (staircase), 3 vòng × 8 câu ≈ 5–7 phút:**

1. Vòng 1 bắt đầu ở **A2** (đa số người Việt tự học rơi quanh đây): 8 câu trộn (4 từ vựng +
   2 ngữ pháp + 1 nghe + 1 đọc) lấy từ kho cấp đó qua `buildExam` thu nhỏ.
2. Điểm vòng ≥75% → vòng sau lên 1 cấp; ≤40% → xuống 1 cấp; giữa → dừng, chốt cấp hiện tại.
3. Tối đa 3 vòng; chạm biên (A1 hoặc C2) thì dừng ở biên. Kết quả = cấp CEFR đề xuất.
4. Ánh xạ ra `Level` app đang dùng: A1–A2→beginner, B1–B2→intermediate, C1–C2→advanced —
   ghi vào onboarding (`saveOnboarding`) + đề xuất trang lộ trình bắt đầu (`/learning-path/{cefr}`).
   **Không tự mở khóa cấp** — lộ trình vẫn yêu cầu thi cuối cấp như thiết kế hiện hành; placement
   chỉ đề xuất ĐIỂM BẮT ĐẦU + chỉnh độ khó hội thoại AI.

**File & UI:**

- `src/lib/placement.ts`: `buildPlacementRound(level)`, `nextLevel(pct, cur)`,
  `finishPlacement(history) → {cefr, level}` — pure function, test ca biên đầy đủ (đúng CLAUDE.md
  §4.9: rà biên A1/C2, vòng lặp lên-xuống-lên, kho câu mỏng).
- Trang `/placement` (`src/pages/PlacementPage.tsx`): tái dùng component câu hỏi của bài thi
  cuối cấp (rà `CefrLessonViews`/exam UI để dùng chung, KHÔNG copy). Có nút "Bỏ qua — tự chọn"
  (giữ đường cũ, không ép).
- Onboarding: bước chọn trình độ thêm lựa chọn nổi bật "🎯 Làm bài test 5 phút để xếp đúng
  trình độ (khuyên dùng)". Người dùng CŨ: banner nhỏ ở `/profile` "Kiểm tra lại trình độ".
- Lưu kết quả: `placement` JSONB trong `learning_progress` (cấp, %, ngày) — cho phép làm lại
  sau ≥30 ngày (chống spam làm lại liên tục để "được" xếp cao).

### Chia PR

1. `feat(placement): thuật toán xếp lớp thích ứng + test` (lib thuần)
2. `feat(placement): trang /placement + nối onboarding` (UI + E2E)

### Tiêu chí chấp nhận

Trả lời đúng hết → C2; sai hết → A1; hồ sơ "A2 đúng 80%, B1 đúng 50%" → B1. Bỏ ngang không
lưu kết quả rác. E2E: luồng onboarding mới đi qua placement ra đúng trang cấp đề xuất.

---

## ⑤ Độ tin cậy "giáo viên AI" (chất lượng sửa lỗi)

### Hiện trạng

Prompt đã khá tốt (recast + giải thích L1 + `VIET_COMMON_ERRORS` + ép JSON + ép trình độ);
model/token ép ở server. Nhưng **không có cách đo** AI sửa đúng bao nhiêu %, sót bao nhiêu —
đổi prompt/model hiện tại là "đổi mù".

### Thiết kế — đo lường trước, tin cậy sau (3 mảnh)

**T1 — Bộ đề chuẩn (golden set) + script đánh giá offline.**

- `scripts/eval-tutor-fixtures.json`: ~60 câu học viên giả lập, soạn tay theo đúng các nhóm
  trong `VIET_COMMON_ERRORS` + câu ĐÚNG (đo false positive) + ca biên (câu trộn Việt-Anh, câu
  1 từ, emoji). Mỗi mục: `{ input, expectedErrors: [loại lỗi], level }`.
- `scripts/eval-tutor.ts` (chạy tay, KHÔNG vào CI vì tốn phí API): gọi `/api/claude` với prompt
  chat/speaking thật → chấm tự động: có phát hiện lỗi không (recall) · có bịa lỗi ở câu đúng
  không (precision) · JSON đúng schema không · feedback có tiếng Việt không. Xuất bảng tổng +
  lưu `docs/research/eval-tutor-baseline.md`.
- **Quy trình:** mọi PR đổi prompt hoặc model PHẢI chạy lại eval, dán bảng so sánh vào PR —
  ghi thành luật trong CLAUDE.md (mục 8) khi mảnh này merge.

**T2 — Vá điểm yếu phát hiện được từ eval.**

- Dự kiến (xác nhận bằng số liệu T1 trước khi làm): thêm 2–3 ví dụ few-shot vào prompt (lỗi →
  sửa mẫu chuẩn) — few-shot ổn định chất lượng sửa lỗi hơn mô tả suông; siết schema JSON
  Speaking bằng Zod ở server (`api/claude` hiện validate đến đâu — rà trước); quy tắc "không
  chắc thì đừng sửa" (giảm bịa lỗi — với người mới, sửa SAI còn hại hơn bỏ SÓT).

**T3 — Vòng phản hồi người dùng.**

- Nút 👍/👎 nhỏ cạnh mỗi khối "✅ Nhận xét" (Chat/Speaking). 👎 → lưu
  `{input, aiFeedback, ngày}` vào bảng `tutor_feedback` (migration mới, RLS: user chỉ ghi/đọc
  của mình; KHÔNG lưu nếu người dùng không bấm — tôn trọng dữ liệu).
- Định kỳ (thủ công) đọc bảng này → bổ sung ca sai vào golden set T1 → vòng cải tiến khép kín.
- Dashboard admin KHÔNG làm đợt này (query SQL trực tiếp đủ dùng ở quy mô hiện tại).

### Chia PR

1. `test(eval): golden set 60 câu + script eval-tutor + baseline` (T1)
2. `feat(prompt): vá theo kết quả eval` (T2 — nội dung chốt sau khi có số liệu T1)
3. `feat(chat): nút phản hồi 👍/👎 + bảng tutor_feedback` (T3)

### Tiêu chí chấp nhận

T1: script chạy 1 lệnh, xuất recall/precision/JSON-valid rõ ràng; chi phí 1 lần chạy <$0.1
(60 câu × model rẻ). T2: recall/precision KHÔNG giảm so baseline (có bảng chứng minh trong PR).
T3: 👎 ghi đúng RLS, không chặn luồng chat khi mạng lỗi.

---

## Thứ tự ưu tiên đề xuất & lộ trình PR

Xếp theo **hiệu quả sư phạm / chi phí công sức**, mỗi dòng ≈ 1 PR nhỏ:

| #   | Việc                           | Hạng mục | Công sức | Chi phí chạy             |
| --- | ------------------------------ | -------- | -------- | ------------------------ |
| 1   | Placement lib + test           | ④        | Nhỏ      | $0                       |
| 2   | Trang /placement + onboarding  | ④        | Vừa      | $0                       |
| 3   | Tốc độ phát TTS                | ③ N1     | Nhỏ      | $0                       |
| 4   | Xoay giọng nghe                | ③ N2     | Nhỏ      | ~0 (cache thêm)          |
| 5   | Golden set + eval baseline     | ⑤ T1     | Vừa      | <$0.1/lần chạy           |
| 6   | Trap phát âm Việt + coach tip  | ① G1     | Vừa      | $0                       |
| 7   | Mục tiêu tuần                  | ② M1     | Nhỏ      | $0                       |
| 8   | Huy hiệu (V-4 cũ)              | ② M2     | Vừa      | $0                       |
| 9   | Bài luyện nghe dictation       | ③ N3     | Vừa      | $0                       |
| 10  | Vá prompt theo eval            | ⑤ T2     | Nhỏ      | $0                       |
| 11  | Comeback + Home Hôm nay (V-5)  | ② M4     | Vừa      | $0                       |
| 12  | Nhắc thông minh                | ② M3     | Vừa      | $0                       |
| 13  | Nút 👍/👎 + tutor_feedback     | ⑤ T3     | Nhỏ      | $0                       |
| 14  | Giải đấu tuần: điểm + API      | ② M5     | Vừa      | $0                       |
| 15  | Giải đấu tuần: opt-in + UI     | ② M5     | Vừa      | $0                       |
| 16  | Azure pronounce API + UI âm vị | ① G2     | Lớn      | Free tier → cần theo dõi |

**QUYẾT ĐỊNH CỦA NGƯỜI DÙNG (chốt 2026-07-15):**

1. ✅ Làm theo thứ tự ưu tiên trên.
2. ✅ LÀM Azure Pronunciation Assessment (① Giai đoạn 2) — chấp nhận thêm dịch vụ ngoài;
   khi làm tới sẽ cần người dùng tự tạo key Azure (AI không có quyền) và điền
   `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` vào `.env` trên VPS.
3. ✅ LÀM giải đấu tuần (đảo đề xuất ban đầu của AI — xem M5, kèm điều kiện giảm mặt trái:
   opt-in + nickname ẩn danh + không xuống hạng/bêu tên).
