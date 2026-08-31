# Tổng hợp Nghiên cứu: Phuong Phap Va Su Pham

Tài liệu này gộp từ 11 tài liệu nghiên cứu liên quan.

---

## [1] Tài liệu: cai-tien-lo-trinh-hoc.md

_(Chi tiết nguồn gốc: `cai-tien-lo-trinh-hoc.md`)_

# Nghiên cứu: Cải tiến bài học & thứ tự học (lộ trình /learning-path)

> Ngày: 2026-07-04 · Trạng thái: đề xuất đã được duyệt và triển khai qua nhiều đợt (xem
> `PROGRESS.md` để biết PR/trạng thái từng mục — nhiều đề xuất bên dưới đã thành tính năng thật:
> tốc độ học 5/10/20 từ/ngày, sắp "Mở rộng" theo tần suất, gắn nhãn CEFR toàn từ điển...).
> Mục tiêu ban đầu: học dễ dàng, tự nhiên, ra kết quả nhanh, không nản lòng.

## Bối cảnh

Hệ thống đã có nền tốt (SRS, vòng chủ đề, lộ trình CEFR, quiz mở batch, streak) nhưng đối chiếu
với khoa học học ngôn ngữ (SLA) và kinh nghiệm Anki/Duolingo lộ ra **5 điểm nghẽn chính**:

| #   | Vấn đề                                                                          | Tác động                          |
| --- | ------------------------------------------------------------------------------- | --------------------------------- |
| 1   | Ôn SRS bị chia theo cấp — từ cấp cũ đến hạn không hiện khi đang học cấp mới     | 🔴 Mất kiến thức đã học           |
| 2   | Không giới hạn số thẻ ôn/phiên khi quay lại sau nghỉ — dồn hàng trăm thẻ → ngợp | 🔴 Churn cao nhất (theo Duolingo) |
| 3   | ~8.500 từ "Mở rộng" xếp theo ALPHABET thay vì tần suất sử dụng                  | 🔴 Kết quả chậm                   |
| 4   | Học từ = nhìn 1 lần rồi bấm "Đã thuộc"; mini-quiz chỉ hỏi 5/20 từ, 1 chiều      | 🟡 Nhớ nông                       |
| 5   | Phải xong 100% từ vựng của unit mới gợi ý ngữ pháp — đơn điệu, dễ nản           | 🟡 Nhàm                           |

## Cơ sở khoa học chính

- **Luật Zipf**: ~2.000 từ thông dụng nhất phủ ~90% văn bản → thứ tự học từ vựng phải theo
  **tần suất**, không alphabet.
- **Số từ mới/ngày** (Nakata 2015): 15 từ/buổi nhớ 73%, 40 từ chỉ nhớ 42% → khuyến nghị 10–20/ngày.
- **Testing effect**: tự nhớ lại (recall) mạnh hơn đọc lại nhiều lần; kiểm tra 2 chiều (EN↔VI)
  bền hơn 1 chiều.
- **Lý do bỏ học số 1** (Duolingo): không phải vì khó mà vì nghỉ vài ngày rồi thấy ngợp khi quay
  lại — streak freeze giảm churn 21%.
- **Interleaving**: xen kẽ dạng bài (từ vựng ↔ ngữ pháp ↔ nghe) giữ chú ý tốt hơn học "block" dài.
- **FSRS vs SM-2**: FSRS cần ít hơn 20–30% lượt ôn cho cùng mức nhớ — nâng cấp tùy chọn, chưa gấp.

Nguồn: newgeneralservicelist.com/coverage · Nakata 2015 (SSLA) · blog.duolingo.com (streaks) ·
antiagent.io/blog/fsrs-vs-sm-2.

## Quyết định & kế hoạch theo đợt

| Đợt     | Nội dung                                                                                                                    | Vấn đề giải quyết |
| ------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | SRS toàn cục (không chia theo cấp) + cap ~30–60 thẻ/phiên ưu tiên quá hạn + leech tự động (`lapses` ≥3 lần quên → "Từ khó") | V1, V2, V10       |
| 2       | Mini-quiz đủ 20 từ (không chỉ 5), trộn 2 chiều EN↔VI, sai thì hiện lại thẻ                                                  | V4                |
| 3       | Chọn tốc độ học 5/10/20 từ/ngày ở Hồ sơ (mặc định mới 10, người cũ giữ 20)                                                  | V7                |
| 4       | Sắp "Mở rộng" theo tần suất (script offline thêm `freq`) + chạy `tag:cefr` gắn nhãn CEFR                                    | V3                |
| 5       | `findNextStep` xen kẽ từ vựng↔ngữ pháp + nút "Tôi đã biết vòng này" (test-out 10 câu)                                       | V5, V6            |
| 6 (sau) | Quiz ngữ pháp trộn vào tab Kiểm tra; streak freeze; cân nhắc FSRS                                                           | V8, V2, V9        |

**Những cái giữ nguyên (đã đúng)**: SRS due-ngay-hôm-học, quiz 100% mới mở batch mới, màn "xong
batch" có câu/hội thoại từ chính các từ vừa học (contextualization — điểm mạnh hiếm app nào có),
ngưỡng mở cấp 70% + grandfather, bài ngữ pháp có "lỗi người Việt hay mắc".

**Rủi ro đáng chú ý đã lưu ý khi làm**: đổi thứ tự lộ trình không mất tiến độ đã học (lưu theo từ,
không theo vị trí); đổi mặc định tốc độ 20→10 cần cập nhật FAQ/CLAUDE.md cùng lúc.

---

## [2] Tài liệu: cai-tien-trai-nghiem-hoc-2026-07-11.md

_(Chi tiết nguồn gốc: `cai-tien-trai-nghiem-hoc-2026-07-11.md`)_

# Audit & đặc tả: Trải nghiệm học tự nhiên, lôi cuốn (lớp cảm xúc — engagement)

> Ngày: 2026-07-11 · Trạng thái: đã duyệt, triển khai theo thứ tự V-1→V-6.
> **V-1, V-2, V-3 đã xong** (flashcard lật 3D, màn ăn mừng streak/confetti, vòng cung phiên học nối
> lộ trình↔Chat/Speaking qua `targetWords` — xem PROGRESS.md). **V-4 (mốc + huy hiệu), V-5 (Home
> "Hôm nay"), V-6 (âm UI) chưa làm.**
> Phương pháp: lái app thật bằng Playwright khổ mobile 375×812 + đọc mã nguồn xác nhận từng phát
> hiện.
>
> **Ranh giới với 2 tài liệu liên quan** (tránh trùng): `cai-tien-ui-ux.md` = lớp **cơ học** (điều
> hướng, vùng chạm) — đã xong hết. `danh-gia-tien-trien-hoc-2026-07-07.md` = lớp **sư phạm** (nội
> dung học gì). Tài liệu này = lớp **cảm xúc** (phản hồi, thành tựu, động lực quay lại).

## Bối cảnh

App có nền cơ học và sư phạm tốt nhưng lớp **cảm xúc gần như trống**: khoảnh khắc đáng ăn mừng
diễn ra câm lặng, thao tác học không có phản hồi xúc giác/chuyển động — học 1 batch giống điền
form hơn là chơi 1 màn game.

| #   | Phát hiện                                                                        | Tác động                        |
| --- | -------------------------------------------------------------------------------- | ------------------------------- |
| E1  | Khoảnh khắc thành tựu câm lặng (xong bài/quiz/lên mốc/streak: chỉ text tĩnh)     | 🔴 Mất "đỉnh" cảm xúc mỗi phiên |
| E2  | Streak thụ động — tăng không ai báo; 0 ngày hiện 💤 tiêu cực                     | 🔴 Bỏ phí cơ chế giữ chân #1    |
| E3  | Thẻ từ & quiz không có "juice" — lật tức thì, đúng/sai chỉ đổi màu, 0 haptic     | 🔴 Cảm giác "điền form"         |
| E4  | Vừa học xong đã "nợ" — badge Ôn SRS nhảy ngay khi vừa thuộc                      | 🟡 Giết cảm giác hoàn thành     |
| E5  | Mốc từ vựng bị chôn — đạt mốc không có gì xảy ra, 0 huy hiệu                     | 🟡 Bỏ phí hệ thành tựu sẵn có   |
| E6  | Phiên học không có "vòng cung" — vào thẳng thẻ 1/10, xong bài không có CTA chính | 🟡 Thiếu nhịp mở–cao trào–đóng  |
| E7  | "Tổng đã thuộc: 0/12245" gây nản ở trang tổng quan/Từ điển                       | 🟡                              |
| E8  | Trang chủ người học cũ ≈ người mới — thẻ Học tiếp lép vế giữa 7 card menu        | 🟢                              |
| E9  | App không có "giọng nói" UI — 0 âm phản hồi ngoài TTS                            | 🟢 Tùy chọn                     |

**Ràng buộc cứng**: ngân sách `size-limit` chỉ còn ~1.7kB → mọi hiệu ứng phải CSS thuần/mã cực nhẹ
hoặc tách chunk lazy.

## Nguyên tắc thiết kế (áp cho mọi đề xuất)

1. **Trung thực** — chỉ ăn mừng thành tựu thật, không XP ảo, không dark pattern (định vị "gia sư"
   chứ không phải game).
2. **Đỉnh–kết (peak-end rule)** — mỗi phiên cần 1 đỉnh cảm xúc + 1 kết rõ ràng.
3. **Nhẹ và tôn trọng** — chuyển động ≤600ms, tự tắt theo `prefers-reduced-motion`, haptic ≤40ms.
4. **Không đổi engine học** — SRS/curriculum/quiz logic giữ nguyên 100%.
5. **Ngân sách bundle** — mã mới trong initial bundle ≤~1kB; hiệu ứng nặng tách chunk lazy.
6. **Token theme** — chỉ dùng biến `--a-*` sẵn có; AA ở cả 4 theme.

## Quyết định người dùng (2026-07-11)

1. Thứ tự **V-1 → V-2** trước (80% giá trị cảm xúc).
2. **V-3 gộp đề xuất B sư phạm** (nút "Luyện ngay bằng hội thoại" bơm `targetWords`).
3. **SRS due dời +4h** thay vì tức thì (ôn cùng ngày buổi tối vẫn giữ spacing, chỉ hết cảnh "vừa
   xong đã nợ") — đồng ý.
4. **Âm UI (V-6)**: LÀM, mặc định BẬT, có toggle trong Hồ sơ (khi triển khai).

## Nội dung từng đợt

- **V-1 — "Juice" thao tác học**: lật thẻ 3D (CSS `rotateY`, tự tắt theo reduced-motion), thẻ
  trượt khi chuyển, quiz đúng/sai có pop/shake + haptic. Không đổi logic/dữ liệu.
- **V-2 — Hệ "Khoảnh khắc" + streak chủ động**: component `Celebration.tsx` dùng chung (streak/
  daily-goal/quiz-pass/milestone/exam-pass) + confetti CSS thuần lazy-load; khoảnh khắc streak bắn
  đúng 1 lần/ngày (idempotent); ô streak trang chủ có 3 trạng thái thay vì chỉ 💤; SRS
  `due: Date.now() + 4h` thay vì tức thì.
- **V-3 — Vòng cung phiên học**: màn mở mỏng (biết sắp học gì) → học → ăn mừng → 1 CTA chính (gộp
  nút "Luyện ngay bằng hội thoại" mở Chat/Speaking với `targetWords`).
- **V-4 — Mốc từ vựng + huy hiệu** (chưa làm): khoảnh khắc khi vượt mốc 100/250/500/1k/3k/5k/8k
  từ; khối "Huy hiệu" ở `/progress` suy từ dữ liệu thật có sẵn (streak, từ vựng, thi cuối cấp, lần
  đầu dùng mỗi chế độ) — không thêm bảng DB.
- **V-5 — Trang chủ "hôm nay" + lộ trình bớt bảng số** (chưa làm): sửa "0/12245" thành số trong
  ngày; gom thẻ Học tiếp + streak thành khối "Hôm nay" nổi bật; lộ trình thêm cột "hành trình" A1→C2.
- **V-6 — Âm UI** (chưa làm, tùy chọn): 3 âm ngắn WebAudio (đúng/sai/hoàn thành), toggle Hồ sơ.

## Những gì đã tốt (giữ nguyên, chỉ xây thêm)

Thẻ Học tiếp, bottom-nav, badge SRS/Từ khó, streak + vé nghỉ, mốc từ vựng đặt tên,
`BatchDoneView` ráp câu/hội thoại từ chính từ vừa học (điểm sáng sư phạm hiếm app có), mini-quiz
sai → ôn lại đúng từ sai, thi cuối cấp có màn chứng nhận, Sổ lỗi, 4 theme AA, karaoke TTS.

---

## [3] Tài liệu: dac-ta-nang-cap-su-pham-2026-07-15.md

_(Chi tiết nguồn gốc: `dac-ta-nang-cap-su-pham-2026-07-15.md`)_

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
  - trang giải đấu (xem phần thay thế Challenge bên dưới).
- **Chống gian lận mức hợp lý:** điểm chỉ từ counters server-side; trần điểm/ngày (= trần
  lượt dùng sẵn có) nên không farm vô hạn được. Không làm hơn ở quy mô hiện tại.

**M5b — THAY trang Challenge bằng Giải đấu tuần, Challenge thành hoạt động ghi điểm
(NGƯỜI DÙNG CHỐT 2026-07-15).**

Challenge 30 ngày (route `/challenge`, PR #230–233) không còn là tính năng đứng riêng —
**Giải đấu tuần tiếp quản trang này**, còn phần lõi của Challenge (quay video ngắn theo chủ đề
→ STT → AI sửa lỗi tiếng Việt) trở thành **hoạt động ghi điểm giá trị nhất của giải**:

- **Giữ nguyên (tái dùng, không viết lại):** pipeline quay + IndexedDB
  (`challengeRecorder.ts`/`challengeVideo.ts`), 30 chủ đề (`challengeTopics.ts`), prompt AI
  (`prompts/challenge.ts`), bảng `challenge_entries` (migration 0010) + cách tính lượt
  (1 challenge = 1 lượt stt + 1 lượt chat, không đổi), luật ≥10s mới cho nộp, unique
  `user_id+day` (mỗi ngày 1 challenge — đồng thời là trần điểm challenge/ngày).
- **Thay đổi:** route `/challenge` đổi thành trang "🏆 Giải đấu tuần" (redirect 1 dòng từ
  đường cũ để bookmark/lịch sử không vỡ). Bỏ khung "vòng 30 ngày" (bảng 30 ô, resume/restart,
  mốc 3/7/14/21/30) → thay bằng **chu kỳ TUẦN**: bảng 7 ô Thứ 2→CN, nộp challenge tô ô hôm đó
  và cộng điểm giải; cuối tuần có màn tổng kết tuần (thay tổng kết ngày 30). Logic vòng/round
  trong `lib/challenge.ts` gọn lại đáng kể — phần lịch sử entries GIỮ NGUYÊN schema (cột
  `challenge_day`/`round` cũ để nguyên, dữ liệu người dùng cũ không mất; UI mới không dùng tới).
- **Điểm challenge trong công thức giải:** +15 điểm/challenge nộp (cao nhất bảng điểm — nói
  chủ động là hoạt động sư phạm giá trị nhất, và mỗi ngày chỉ nộp được 1 nên không farm).
  Server đếm TRỰC TIẾP từ `challenge_entries` (đã là dữ liệu server-side, RLS owner) — client
  không gửi điểm.
- **Huy hiệu:** mốc 3/7/14/21/30 ngày liên tục cũ → chuyển thành huy hiệu M2 theo TỔNG SỐ
  challenge đã nộp (10/30/100) + huy hiệu "nộp đủ 7/7 ngày trong 1 tuần giải". Huy hiệu người
  dùng đã đạt trước đó không bị thu hồi (dữ liệu chỉ "tốt lên" — nguyên tắc sẵn có của app).
- **Không cần giải đấu vẫn quay được:** người KHÔNG opt-in giải vẫn thấy phần quay + feedback
  AI như cũ (giá trị học không bị khóa sau tính năng thi đua) — chỉ phần bảng xếp hạng yêu cầu
  opt-in + nickname.
- Chia PR (thay cho 2 PR cũ của M5): (1) `feat(league): migration + tính điểm tuần (usage +
challenge_entries) + /api/leaderboard` · (2) `feat(league): trang Giải đấu tuần thay
/challenge (bảng 7 ô + quay challenge + xếp hạng) + opt-in nickname` · (3)
  `refactor(challenge): gọn logic 30 ngày còn chu kỳ tuần + huy hiệu M2 + redirect`.

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
- `scripts/eval-tutor.ts` (chạy tay, KHÔNG vào CI vì tốn phí API): gọi `/api/agent` với prompt
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
| 15  | Trang giải đấu thay /challenge | ② M5b    | Lớn      | $0                       |
| 16  | Gọn challenge → chu kỳ tuần    | ② M5b    | Vừa      | $0                       |
| 17  | Azure pronounce API + UI âm vị | ① G2     | Lớn      | Free tier → cần theo dõi |

**QUYẾT ĐỊNH CỦA NGƯỜI DÙNG (chốt 2026-07-15):**

1. ✅ Làm theo thứ tự ưu tiên trên.
2. ✅ LÀM Azure Pronunciation Assessment (① Giai đoạn 2) — chấp nhận thêm dịch vụ ngoài;
   khi làm tới sẽ cần người dùng tự tạo key Azure (AI không có quyền) và điền
   `AZURE_SPEECH_KEY`/`AZURE_SPEECH_REGION` vào `.env` trên VPS.
3. ✅ LÀM giải đấu tuần (đảo đề xuất ban đầu của AI — xem M5, kèm điều kiện giảm mặt trái:
   opt-in + nickname ẩn danh + không xuống hạng/bêu tên).
4. ✅ **THAY Challenge bằng Giải đấu tuần + tích hợp challenge vào giải** (xem M5b): trang
   `/challenge` trở thành trang giải đấu; quay challenge = hoạt động ghi điểm cao nhất
   (+15/ngày); bỏ khung 30 ngày, chuyển chu kỳ tuần; dữ liệu + huy hiệu cũ của người dùng
   giữ nguyên, phần quay + AI feedback vẫn dùng được không cần vào giải.

---

## [4] Tài liệu: lo-trinh-cefr-c1-c2.md

_(Chi tiết nguồn gốc: `lo-trinh-cefr-c1-c2.md`)_

# Kế hoạch & thực thi: Thêm cấp C1–C2 vào lộ trình CEFR (Đợt 2)

> 2026-07-06 · **ĐÃ THỰC HIỆN** (PR — xem `PROGRESS.md`). Mục tiêu: mở rộng lộ trình từ A1→B2
> thành **A1→C2 đầy đủ**, gộp phần từ vựng CEFR C1/C2 ("Đợt 2").

## 1. Phát hiện then chốt

Lộ trình vốn **data-driven** từ `CEFR_LEVELS` (`src/data/cefr.ts`) — `RoadmapTab`/`Home`/
`CefrLevelPage` tự duyệt `levels.map(...)`, `computeLockedMapPersisted` tự nối chuỗi mở khóa,
`CefrWordLevel`/`LEVEL_COLOR` đã sẵn `'C1'|'C2'`. → Thêm C1/C2 chủ yếu là **thêm dữ liệu**,
không viết lại logic.

## 2. Nguồn từ vựng

Chọn **từ điển dự án đã gắn nhãn C1/C2** (2.357 từ, có sẵn nghĩa TV + ví dụ song ngữ + phiên
âm + tần suất) thay vì headword Octanove trần (1.955 từ, không nghĩa). Làm sạch: bỏ ~9 từ gắn
nhầm (`freq < 2000`) + ~100 từ trùng nền tảng A1-B2 → **C1 = 687 từ · C2 = 1.561 từ**.

## 3. Kiến trúc dữ liệu

```
scripts/gen-cefr-c1c2-vocab.ts → src/data/cefrC1C2Vocab.json (KHÔNG sửa tay)
  → src/data/cefrC1C2Vocab.ts (wrapper kiểu)
    → curriculum.ts: FOUNDATION += CEFR_C1C2_CIRCLES
    → cefrAdvanced.ts: buildUnits() + ngữ pháp soạn tay → C1_LEVEL/C2_LEVEL
      → cefr.ts: CEFR_LEVELS.push(C1_LEVEL, C2_LEVEL)
```

Sau khi sửa nguồn `.ts`, chạy lại `npx tsx scripts/gen-curriculum-json.ts` +
`scripts/gen-learn-json.ts` (client đọc qua `fetch('/data/*.json')`).

## 4. Ngữ pháp C1/C2 (soạn tay, `src/data/cefrAdvanced.ts`)

- **C1 (10 bài/6 Phần):** rút gọn mệnh đề quan hệ · câu chẻ It/Wh-cleft · đảo ngữ phủ định &
  điều kiện · V-ing/to-V đổi nghĩa · thức giả định + wish · nhượng bộ.
- **C2 (7 bài/6 Phần):** đảo ngữ nâng cao & fronting · lược bỏ/thay thế · danh từ hóa · mệnh đề
  phân từ/tuyệt đối · giả định trang trọng · tình thái/hedging.

Không đổi schema DB — cột `cefr_grammar`/`cefr_dialogues`/`cefr_unlocked` là mảng id tự do,
C1/C2 dùng chung.

## 5. Bổ sung (đã làm)

- **Gom từ vựng theo chủ đề**: 10 chủ đề (Kinh doanh, Luật pháp, Khoa học...) qua nghĩa TV +
  gốc từ tiếng Anh; ~7% khớp, còn lại theo loại từ. Unit đổi thành Phần Ngữ pháp (có hội thoại)
  → Phần Từ vựng theo chủ đề.
- **Hội thoại cho mọi Phần ngữ pháp**: 12 hội thoại C1/C2 mới, dùng đúng cấu trúc bài.

## 6. Kiểm chứng

Build/typecheck/lint/test/size-limit xanh; E2E a11y `/learning-path/c1` 0 critical/serious 4
theme; lái app thật xác nhận bản đồ 6 cấp + nội dung Phần render đúng.

---

## [5] Tài liệu: sm2-den-fsrs-2026-07-16.md

_(Chi tiết nguồn gốc: `sm2-den-fsrs-2026-07-16.md`)_

# Nghiên cứu: nâng cấp SM-2 → FSRS (đề xuất H)

> Ngày lập: 2026-07-16 · Yêu cầu: `docs/research/danh-gia-tien-trien-hoc-2026-07-07.md` đề xuất H
> — "SM-2 → FSRS, giảm 20-30% lượt ôn", ưu tiên 🟢 Thấp, chưa có đặc tả chi tiết. Tài liệu này
> research-first (KHUNG 3, CLAUDE.md mục 0) trước khi đề xuất có làm hay không / làm thế nào.

## FSRS là gì, vì sao đáng cân nhắc

**FSRS** (Free Spaced Repetition Scheduler) là thuật toán lặp cách quãng mã nguồn mở, hiện là
**mặc định của Anki** (từ bản 23.10, thay SM-2 sau nhiều năm). Khác SM-2 (công thức cứng, cùng 1
đường cong cho mọi người), FSRS mô hình hoá trí nhớ bằng 3 biến — **Difficulty (D)**, **Stability
(S)**, **Retrievability (R)** — và **khớp theo lịch sử ôn thật** của từng thẻ để dự đoán xác suất
nhớ lại, thay vì áp công thức chung.

Số liệu từ benchmark cộng đồng open-spaced-repetition (không phải thử nghiệm lâm sàng có đối
chứng, mà từ mô phỏng trên dữ liệu ôn thật của Anki):

- FSRS dự đoán khả năng nhớ chính xác hơn SM-2 ở **99.5%** bộ dữ liệu người dùng được test, kể cả
  khi dùng tham số MẶC ĐỊNH (không tối ưu riêng theo từng người).
- Học viên dùng FSRS cần **giảm 20-30% lượt ôn** để giữ cùng mức retention — đây chính là con số
  PROGRESS.md đang trích dẫn cho đề xuất H.
- FSRS-6 (bản mới nhất) có 21 tham số HUẤN LUYỆN SẴN (train trên ~700 triệu lượt ôn thật của
  ~10.000 người dùng Anki) — khác SM-2 vốn có ~6 tham số phải **tự tay chỉnh** mới tối ưu.

## Thư viện — `ts-fsrs` (đã xác nhận qua GitHub/npm, 2026-07-16)

- Cài đặt TypeScript chính thức của tổ chức **open-spaced-repetition** (cùng nhóm chuẩn hoá FSRS).
- Giấy phép **MIT** — dùng thoải mái, không ràng buộc.
- Hỗ trợ ESM/CJS/UMD, cần Node ≥ 18 (dự án đang dùng Node 22 trên VPS — đủ điều kiện).
- API rất gọn:

  ```ts
  import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'

  const scheduler = fsrs() // params mặc định, request_retention ~0.9
  const card = createEmptyCard()
  const { card: nextCard, log } = scheduler.next(card, new Date(), Rating.Good)
  ```

- `Card` lưu: `due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state
(New/Learning/Review/Relearning), last_review, learning_steps`.
- 4 mức đánh giá **Again/Hard/Good/Easy** — TRÙNG KHỚP HOÀN TOÀN với `Rating` (`'again'|'hard'|
'good'|'easy'`) app đang dùng ở `src/lib/srs.ts` — không cần đổi UI đánh giá, không cần dạy lại
  người dùng cách bấm.

## Rào cản QUAN TRỌNG phát hiện được: dữ liệu app KHÔNG có lịch sử ôn chi tiết

Đây là phát hiện cốt lõi của đợt research này, và là lý do đề xuất KHÔNG vội làm ngay dù thư viện
sẵn có và lợi ích rõ ràng:

- **FSRS học tốt nhất khi có TOÀN BỘ lịch sử ôn** (mỗi lần ôn: ngày, mức đánh giá) của từng thẻ —
  đây là cách Anki chuyển đổi engine cho người dùng cũ mà "không mất tiến độ, không cần học lại
  từ đầu": nó tính lại Stability/Difficulty từ **revlog** (bảng log từng lượt ôn) đã lưu sẵn.
- App hiện tại (`src/lib/srs.ts` `SRSCard`) chỉ lưu **trạng thái RÚT GỌN** mỗi thẻ:
  `{interval, ease, due, reps, lapses}` — KHÔNG lưu log từng lượt ôn (ngày + mức đánh giá của mỗi
  lần ôn quá khứ). Quyết định này hợp lý lúc thiết kế SM-2 (SM-2 chỉ cần trạng thái rút gọn), nhưng
  nghĩa là **không thể tái tạo lịch sử để FSRS học lại chính xác** như Anki làm.
- Hệ quả: muốn chuyển sang FSRS, phải chọn 1 trong các hướng đánh đổi khác nhau đáng kể (xem mục
  dưới) — đúng tình huống CLAUDE.md mục 12 yêu cầu dừng hỏi trước khi chọn, không tự quyết thay.

## 3 hướng chuyển đổi khả dĩ (đánh đổi khác nhau đáng kể)

1. **Suy diễn gần đúng từ SM-2** (ease/interval hiện có → ước lượng Stability/Difficulty ban đầu
   bằng công thức xấp xỉ, kiểu cộng đồng Anki hay dùng khi thiếu revlog). Ưu điểm: giữ nguyên tiến
   độ, không thẻ nào bị coi "học lại từ đầu". Nhược điểm: xấp xỉ không chính xác bằng khớp từ lịch
   sử thật — lợi ích 20-30% có thể KHÔNG đạt đủ ngay từ đầu, cần vài chu kỳ ôn thật để FSRS "học
   lại" đúng trên từng thẻ.
2. **Coi thẻ cũ là mới, chuyển dần khi ôn tự nhiên** (thẻ SM-2 cũ giữ nguyên lịch ôn hiện tại; MỖI
   LẦN thẻ đó đến hạn và được ôn thật, tạo thẻ FSRS mới từ chính lượt ôn đó làm điểm bắt đầu). Ưu
   điểm: đơn giản, không cần công thức xấp xỉ dễ sai, dữ liệu FSRS luôn bắt đầu từ 1 lượt ôn CÓ
   THẬT. Nhược điểm: mất vài tuần để toàn bộ thẻ chuyển hết, 2 engine chạy song song 1 thời gian
   (phức tạp code hơn 1 chút, nhưng không thay đổi hành vi người dùng đột ngột).
3. **Cắt hẳn, thẻ cũ mất tiến độ, mọi thẻ bắt đầu lại từ New** (đơn giản nhất về code, nhưng người
   dùng đang có hàng trăm/nghìn thẻ đã ôn nhiều tháng sẽ cảm thấy bị "reset" đột ngột — trải
   nghiệm xấu, không nên chọn cho 1 app đã có người dùng thật).

**Khuyến nghị của tôi: hướng 2** (chuyển dần khi ôn tự nhiên) — cân bằng tốt nhất giữa đúng đắn kỹ
thuật (không bịa lịch sử) và trải nghiệm người dùng (không ai bị mất tiến độ đột ngột), đổi lại
chấp nhận có giai đoạn chuyển tiếp vài tuần chạy 2 hệ song song.

## Phạm vi kỹ thuật nếu làm (ước lượng, CHƯA code)

- Thay ruột `src/lib/srs.ts` (giữ NGUYÊN chữ ký hàm public: `addToSRS`/`reviewWord`/`getDueWords`/
  `getSRSStats`/`getNextReview`/`getLeechWords`/`addToSRSKnown` — mọi nơi gọi trong `StudyTabs.tsx`,
  `Flashcard.tsx`, `Challenge.tsx` KHÔNG cần sửa) để dùng `ts-fsrs` bên trong thay vì công thức SM-2
  tự viết hiện tại.
- **Áp dụng đồng thời cho cả từ vựng LẪN ngữ pháp** — vì đề xuất E (vừa xong, PR #257) cố tình dùng
  CHUNG engine này qua tiền tố khoá `grammar:<lessonId>`, nên nâng cấp FSRS ở `srs.ts` tự động áp
  dụng cho cả 2 mà không cần sửa `cefrProgress.ts`/`StudyTabs.tsx` phần ngữ pháp.
- Cần đổi shape lưu trong localStorage (`srs_${uid}`) từ `SRSCard` sang thêm field FSRS
  (`stability`, `difficulty`, `state`...) — có migration đọc dữ liệu cũ (thẻ SM-2 cũ vẫn đọc được,
  áp hướng 2 ở trên khi ôn lần tới) chứ không xoá sạch localStorage người dùng.
- Bundle size: `ts-fsrs` là thư viện thuần JS nhỏ (không phụ thuộc ngoài) — cần đo lại qua
  `npm run size` sau khi thêm, ngân sách hiện còn dư (~0.1kB tính tới 2026-07-16), nhiều khả năng
  vẫn lọt nhưng PHẢI đo thật, không giả định.
- Cần bộ test đối chiếu hành vi cũ/mới (ví dụ: cùng chuỗi rating 'good' liên tiếp, so khoảng cách
  ôn SM-2 hiện tại vs FSRS) để không âm thầm đổi trải nghiệm mà không ai nhận ra.

## Khuyến nghị

Vì đây là **ưu tiên thấp** (🟢, tự bản thân PROGRESS.md đã ghi) và cần MỘT quyết định đánh đổi thật
sự (không phải việc kỹ thuật thuần tuý có 1 đáp án đúng), tôi đề xuất KHÔNG tự triển khai ngay mà
xin ý kiến bạn ở 2 điểm trước khi viết code:

1. Có muốn làm ngay bây giờ không, hay giữ nguyên SM-2 (đang chạy ổn, không lỗi) và để dành việc
   này cho đợt sau khi có ưu tiên cao hơn hết?
2. Nếu làm: đồng ý hướng chuyển đổi **#2 (chuyển dần khi ôn tự nhiên)** ở trên, hay muốn hướng
   khác?

## Quyết định & kết quả thực tế (2026-07-16, sau khi triển khai)

- **Người dùng chọn làm NGAY** + hướng chuyển đổi **#3 (cắt hẳn, đặt lại từ New)** — KHÁC khuyến
  nghị #2 của tôi ở trên. Đã cảnh báo rõ đánh đổi (mọi thẻ SRS cũ, cả từ vựng lẫn ngữ pháp, coi
  như học lại từ đầu) trước khi làm; người dùng xác nhận chấp nhận đổi.
- Triển khai: `src/lib/srs.ts` viết lại ruột dùng `ts-fsrs@5.4.1` (FSRS-6, xác nhận qua
  `node_modules/ts-fsrs/dist/index.d.ts` thật — không đoán field), `fsrs({ enable_short_term:
false })` (bỏ bước học theo PHÚT kiểu Anki mặc định, giữ đúng nhịp học theo NGÀY của app). Giữ
  NGUYÊN mọi chữ ký hàm public + 2 quyết định UX độc lập với thuật toán (delay 4h thẻ mới,
  'again' → ôn lại ngay trong phiên). "Cắt hẳn" thực hiện tự nhiên qua việc đổi SHAPE lưu trong
  `localStorage` — dữ liệu `SRSCard` kiểu SM-2 cũ không còn khớp field mới nên coi như bị bỏ qua,
  không cần code dọn dẹp riêng.
- **Phát hiện qua test thực tế (node + vitest, không suy đoán công thức)**: `lapses` (dùng cho
  "leech"/tab Từ khó) trong FSRS chỉ tăng khi thẻ trượt SAU KHI đã từng học được (state Review) —
  KHÔNG tính lần trượt đầu tiên lúc thẻ còn hoàn toàn mới. Coi đây là cải thiện ngữ nghĩa hợp lý
  (đúng tinh thần "leech" thật hơn), đã cập nhật test phản ánh đúng hành vi thật thay vì ép về số
  cũ. Tie-break độ ưu tiên khi ôn (`getDueWords`/`getDueGrammarLessonIds` có `limit`) đổi từ
  "ease thấp nhất trước" (SM-2) sang "difficulty CAO nhất trước" (FSRS) — cùng ý định (thẻ khó
  hơn ưu tiên ôn trước).
- **Bundle size: VƯỢT ngân sách 5.71kB (116→121.71kB brotli)** — đúng rủi ro đã lường trước ở mục
  "Phạm vi kỹ thuật" bên trên. Đã đo THẬT bằng `npm run size`, không giả định. Người dùng chọn
  **nâng ngân sách `.size-limit.json` lên 123 kB** thay vì huỷ việc — chấp nhận đánh đổi ~5% kích
  thước bundle đầu để lấy lợi ích giảm 20-30% lượt ôn.
- Test: viết lại 2 ca kiểm tra gắn với công thức SM-2 cũ (tăng interval theo cấp số, leech đếm cả
  lần trượt đầu) bằng giá trị THẬT đo qua `node --input-type=module` chạy trực tiếp `ts-fsrs`
  trước khi đưa vào test — không suy đoán/bịa số kỳ vọng.

---

## [6] Tài liệu: danh-gia-tien-trien-hoc-2026-07-07.md

_(Chi tiết nguồn gốc: `danh-gia-tien-trien-hoc-2026-07-07.md`)_

# Đánh giá & đề xuất: giúp việc học tiến triển tốt hơn (2026-07-07)

> Ngày: 2026-07-07 · Trạng thái: đề xuất A→H, đánh giá lại toàn hệ thống sau khi engine SRS/từ vựng
> đã trưởng thành (đợt cải tiến `cai-tien-lo-trinh-hoc.md` 2026-07-04 đã triển khai gần hết — xem
> mục "Đã tốt" bên dưới).
> **Cập nhật trạng thái (xem PROGRESS.md):** **A (Sổ lỗi cá nhân) đã xong** (`src/lib/mistakes.ts`,
> trang `/mistakes`). **B đã có nền** (`targetWords?` trong prompt) **nhưng chưa có nút CTA riêng**.
> **C, D, E, F, G, H chưa làm.**

## Bối cảnh / chẩn đoán

Sau khi engine từ vựng-SRS đã ngang tầm các app lớn, đánh giá lộ ra điểm nghẽn sư phạm còn bỏ
trống: **người học học từ vựng trong "silo" tách biệt hoàn toàn với 3 chế độ AI (Chat/Viết/Nói)**.
Từ vừa học không quay lại trong hội thoại; lỗi AI sửa trong Chat/Viết/Nói "bay hơi" — không thành
thẻ ôn; mọi bài luyện từ vựng chỉ là **nhận biết** (trắc nghiệm), chưa có **sản xuất chủ động**
(gõ/nói ra). Đây là chặng "recognition → production → use" mà SLA coi là khó nhất và quyết định
việc có dùng được ngoại ngữ hay không.

## Đề xuất & ưu tiên

| #   | Đề xuất                                                              | Vì sao quan trọng                    | Ưu tiên | Trạng thái                               |
| --- | -------------------------------------------------------------------- | ------------------------------------ | ------- | ---------------------------------------- |
| A   | Sổ lỗi cá nhân — thu lỗi AI sửa ở Chat/Viết/Nói → thẻ ôn cá nhân hóa | Tài liệu ôn giá trị nhất đang bị vứt | 🔴 Cao  | ✅ Đã xong                               |
| B   | Nối lộ trình ↔ 3 chế độ AI — nút "luyện từ hôm nay bằng hội thoại"   | Đóng vòng recognition→use            | 🔴 Cao  | ⏳ Có nền (`targetWords`), thiếu nút CTA |
| C   | Bài luyện sản xuất chủ động — gõ chính tả/nói lại cho từ đã học      | Recall mạnh hơn recognition          | 🟡 TB   | Chưa làm                                 |
| D   | Nghe hiểu thành dạng bài chính — audio→chọn nghĩa/chép chính tả      | Tận dụng cache TTS $0                | 🟡 TB   | Chưa làm                                 |
| E   | Ngữ pháp có vòng lặp ôn nhẹ — theo dõi mastery + nhắc ôn             | Ngữ pháp chưa có retention loop      | 🟡 TB   | Chưa làm                                 |
| F   | Giữ chân: streak freeze + tổng kết tuần                              | Giảm churn                           | 🟢 Thấp | Streak freeze đã có; tổng kết tuần chưa  |
| G   | Chấm phát âm cấp âm vị (thay Levenshtein-trên-STT)                   | Đúng lời hứa "gia sư giọng nói"      | 🟢 Thấp | Chưa làm, tốn tiền — chờ có Pro          |
| H   | SM-2 → FSRS                                                          | Giảm 20–30% lượt ôn                  | 🟢 Thấp | Chưa làm                                 |

**Thứ tự khuyến nghị:** A → B (giá trị sư phạm cao nhất/giờ code, tận dụng đúng thứ đối thủ không
có — AI hội thoại + TTS 2 giọng) → D (rẻ) → C → E → F → G/H (sau).

## Cơ sở khoa học

- **Output Hypothesis (Swain)**: chỉ input chưa đủ, phải tạo ra ngôn ngữ + nhận phản hồi mới
  chuyển "biết" thành "dùng được" → nền tảng cho B, C.
- **Testing effect có phân cấp**: free recall (gõ/nói) > cued recall > recognition (trắc nghiệm) —
  bài hiện tại dừng ở đáy thang → C nâng bậc.
- **Error-driven learning**: phản hồi sửa lỗi chỉ "ăn" khi được ôn lại có chủ đích → nền tảng A.
- **Spacing** áp cho mọi loại kiến thức, không riêng từ vựng → E.
- Nguồn: Swain (1985), Roediger & Karpicke (2006), Lyster & Ranta (1997), Cepeda et al. (2006).

## Quyết định kỹ thuật đáng chú ý (đề xuất A, đã áp dụng)

Sổ lỗi lưu **client-side (localStorage) + đồng bộ**, không tạo bảng Supabase riêng — tránh
migration, theo mẫu `learning_progress`. Parse cặp câu sai/đúng từ định dạng phản hồi AI có sẵn
("✅ Nhận xét"); có nhánh bỏ qua khi không parse được (không throw).

## Đề xuất B (chưa hoàn thiện) — chi tiết còn lại

Thêm nút **"Luyện các từ này bằng hội thoại"** ở màn "xong batch"/trang cấp → mở Chat/Nói với
`targetWords` bơm sẵn (tham số đã có trong prompt, chỉ thiếu điểm vào từ UI). Tùy chọn: chấm điểm
cuối phiên báo "đã dùng được X/Y từ mục tiêu".

## Những gì đã làm tốt (giữ nguyên, không cần đụng lại engine SRS)

SRS toàn cục + chống ngợp (cap phiên, ưu tiên quá hạn), leech tự động, mini-quiz phủ đủ batch 2
chiều, tốc độ học 5/10/20 từ/ngày, "Mở rộng" sắp theo tần suất, xen kẽ từ vựng↔ngữ pháp, test-out
"Tôi đã biết vòng này", quiz ngữ pháp trong tab Kiểm tra, học trong ngữ cảnh (`BatchDoneView`),
lỗi người Việt hay mắc nhúng vào prompt. Việc tiếp theo nằm ở **kết nối** và **chiều sản xuất**,
không phải tinh chỉnh thêm SRS.

---

## [7] Tài liệu: bai-kiem-tra-cuoi-cap.md

_(Chi tiết nguồn gốc: `bai-kiem-tra-cuoi-cap.md`)_

# Nghiên cứu & Quyết định: Bài kiểm tra cuối cấp (End-of-level Assessment)

> Ngày: 2026-07-07 · Trạng thái: **ĐÃ TRIỂN KHAI**. Code: `src/lib/cefrExam.ts`,
> `src/components/CefrExam.tsx`, migration `0009` — xem PROGRESS.md.

## Bối cảnh / vấn đề

Trước đây **không có bài thi thật**: cấp CEFR sau tự mở khóa khi cấp trước đạt "≥70% từ vựng +
100% ngữ pháp" — nhưng cả hai chỉ cần **bấm nút** ("Đã thuộc"/"Đã học xong"), không chứng minh
học viên dùng được kiến thức. Tab "Kiểm tra" cũ chỉ là quiz luyện tập nhẹ (10 câu, làm lại vô hạn,
không chặn tiến độ).

## Quyết định (người dùng chốt)

1. **Chặn lên cấp**: điều kiện cũ (≥70% từ vựng + 100% ngữ pháp) chuyển thành **điều kiện DỰ THI**,
   không còn tự mở khóa cấp sau — phải **thi đạt ≥70%** mới mở khóa. Người dùng đã mở khóa từ trước
   (grandfather qua `et_cefr_unlocked_*`) **không bị khóa lại**.
2. **Đề đầy đủ 4 phần** (~24 câu, xáo trộn mỗi lần thi, chống học vẹt): Từ vựng (8 câu, 2 chiều
   EN↔VI), Ngữ pháp (8 câu điền chỗ trống), Nghe (4 câu, dùng TTS đã cache), Đọc hiểu (4 câu, dựa
   trên hội thoại mẫu).
3. **Ngưỡng đạt ≥70%** (đồng bộ `UNLOCK_PCT` sẵn có).
4. **Thi lại không giới hạn**, mỗi lần đề mới, xem lại câu sai + link mở lại bài học.
5. **Lưu kết quả lên Supabase** — cột `cefr_exams jsonb` trong `learning_progress` (migration 0009):
   `levelId → { passed, bestPct, attempts, lastAt }`, merge "chỉ tốt lên" (giữ bestPct cao hơn).

## Triển khai (3 đợt, mỗi đợt 1 PR)

1. Migration 0009 + `lib/cefrExam.ts` (dựng đề, chấm điểm) + nối `progressSync`.
2. Màn thi `CefrExam.tsx` (4 phần, full-screen) + màn chứng nhận + thẻ CTA trên trang cấp.
3. Nối luật mở khóa (`cefrProgress.ts`) + grandfather + huy hiệu ở RoadmapTab/Dashboard.

## Rủi ro đã lưu ý khi làm

- **Hồi tố khóa lại** người đang học dở — giải quyết bằng grandfather (`everUnlocked` luôn mở) + test
  ca biên riêng.
- **Kho câu mỏng** ở cấp học viên mới học — chặn dự thi tới khi đạt điều kiện học.
- **Chi phí TTS phần Nghe** — dùng cache đã mã hóa sẵn, không phát sinh lượt AI đắt.
- Không đụng tab "Kiểm tra" luyện tập cũ — bài thi là luồng riêng.

---

## [8] Tài liệu: huong-dan-doi-chieu-sgk.md

_(Chi tiết nguồn gốc: `huong-dan-doi-chieu-sgk.md`)_

# Quy trình đối chiếu SGK — biên soạn lại kho kiến thức theo chương trình MỚI NHẤT

> Ngày: 2026-08-01 · Trạng thái: **sẵn sàng thi hành ở PHIÊN LOCAL**
> Dành cho: phiên Claude Code chạy trên **máy người dùng**, có PDF SGK trong `tai-lieu-sgk/`
> Liên quan: `kho-kien-thuc-{toan,ly,hoa,sinh}-gdpt2018.md` · `dac-ta-gd2-mon-toan-2026-08-01.md`

---

## 0. Đọc trước — vì sao cần quy trình này

Bốn file kho kiến thức hiện có được viết **KHÔNG có SGK trong tay** (phiên chạy từ xa, sandbox
chặn mọi nguồn Việt Nam — xem `kho-kien-thuc-toan-gdpt2018.md` §0.1). Chúng bám **kiến thức khoa
học phổ quát** + khung chương trình theo hiểu biết chung, và **chưa từng được đối chiếu** với:

- **Thông tư 17/2025/TT-BGDĐT** — bản sửa đổi Chương trình GDPT mới nhất (AI đọc bản gốc bị 403).
- Bộ SGK **"Kết nối tri thức với cuộc sống"** — dùng chung toàn quốc từ năm học 2026-2027 theo
  **Quyết định 3588/QĐ-BGDĐT** (26/12/2025).

Phiên local có SGK thật → đây là lúc **biến bản thảo thành bản chuẩn**.

### 0.1 Ranh giới bản quyền — KHÔNG đổi dù đã có sách trong tay

Có PDF **không** đồng nghĩa được chép nội dung. Ranh giới giữ nguyên như `kho-kien-thuc-toan` §0.2:

| Lấy từ SGK được                                                       | TUYỆT ĐỐI KHÔNG                                    |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| **Thứ tự chương/bài**, tên bài (dữ kiện về cấu trúc chương trình)     | Chép nguyên văn đề bài, lời văn, hình vẽ           |
| **Danh mục công thức/định lý** xuất hiện ở lớp nào (sự thật khoa học) | Chép cách diễn đạt/trình bày đặc trưng của sách    |
| **Phạm vi kiến thức** từng lớp (mức độ sâu tới đâu)                   | Lấy đề trong sách rồi đổi vài con số               |
| Thứ tự xuất hiện của khái niệm để dựng `prerequisites`                | Sao chép nguyên cấu trúc trình bày của một bài học |

> Đề bài trong app **luôn do template tự sinh theo tham số** (đặc tả GĐ2 §3.2). SGK chỉ dùng để
> biết **dạy gì, theo thứ tự nào**, không phải để lấy nội dung.

---

## 1. Chuẩn bị (làm một lần)

```bash
ls tai-lieu-sgk/            # xác nhận PDF đã có
git check-ignore -v tai-lieu-sgk/   # BẮT BUỘC: xác nhận git đang chặn thư mục này
git status --short          # tai-lieu-sgk/ KHÔNG được xuất hiện ở đây
```

Nếu `git status` có hiện `tai-lieu-sgk/` → **dừng lại**, sửa `.gitignore` trước khi làm tiếp.
Không bao giờ được để tài liệu bản quyền lọt lên GitHub.

**Thứ tự ưu tiên đọc** (không ôm hết một lượt):

1. Toán 6, 7, 8, 9 — đợt 2a làm cấp 2 trước.
2. Toán 1-5 — đợt 2b.
3. KHTN 6-9 — chuẩn bị GĐ3 (Hoá trước, theo thứ tự đã chốt).
4. Toán 10-12 — đợt 2d, làm sau cùng.

---

## 2. Quy trình cho MỖI cuốn sách

### Bước 1 — Trích mục lục

Đọc phần Mục lục, ghi ra danh sách **chương → bài** theo đúng thứ tự sách. Đây là dữ liệu quan
trọng nhất: nó cho phép app hiện đúng bài học sinh đang học trên lớp.

Ghi vào file mới `docs/research/muc-luc-sgk/toan-<lop>.md` theo mẫu:

```md
# Mục lục Toán <lớp> — Kết nối tri thức (đối chiếu ngày YYYY-MM-DD)

| #   | Chương | Bài | Mạch (SO/HINH/TK) | Công thức chính | Chấm tự động được? |
| --- | ------ | --- | ----------------- | --------------- | ------------------ |
| 1   | ...    | ... | SO                | ...             | ✅ / 🟡 / ❌       |
```

Cột **"Chấm tự động được?"** quyết định bài nào vào MVP:

- ✅ ra đáp số/biểu thức → engine `packages/core-grading` chấm được ngay
- 🟡 cần dạng nhập đặc biệt (công thức hoá học, chọn nhiều đáp án)
- ❌ tự luận/chứng minh → **loại khỏi MVP**, không để AI chấm (nguyên tắc đã chốt)

### Bước 2 — Đối chiếu với kho kiến thức hiện có

Với mỗi mục trong `kho-kien-thuc-*.md`, gán một trong bốn trạng thái và **ghi thẳng vào file**:

| Ký hiệu | Nghĩa                                          | Hành động                            |
| ------- | ---------------------------------------------- | ------------------------------------ |
| `[✓]`   | Khớp SGK                                       | Giữ nguyên                           |
| `[≠]`   | Có trong SGK nhưng **khác lớp / khác thứ tự**  | Sửa lại vị trí, **ghi rõ đã sửa gì** |
| `[+]`   | SGK có mà kho kiến thức **thiếu**              | Bổ sung                              |
| `[−]`   | Kho kiến thức có mà SGK **không dạy ở lớp đó** | Bỏ hoặc chuyển sang lớp đúng         |

> **Bắt buộc ghi lại mọi mục `[≠]` `[+]` `[−]`** vào một mục "Nhật ký đối chiếu" cuối mỗi file
> kho kiến thức. Đây là bằng chứng cho thấy nội dung đã được kiểm chứng thật, không phải AI tự
> tin là đúng — trực tiếp phục vụ cổng duyệt chuyên môn (`kho-kien-thuc-toan` §0.3).

### Bước 3 — Soi kỹ những chỗ ĐÃ ĐÁNH DẤU NGHI NGỜ

Các điểm AI tự nhận là rủi ro, **phải kiểm trước tiên**:

| Chỗ nghi ngờ                               | Ở đâu                        | Vì sao nghi                                                                                               |
| ------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| **`n = V/24` hay `n = V/22,4`**            | `kho-kien-thuc-hoa` §2 lớp 8 | CT 2018 dùng đkc 25 °C 1 bar → 24 L/mol, khác 22,4 của chương trình cũ. AI rất dễ viết theo thói quen cũ. |
| **Hệ số `g = 10` hay `9,8`**               | `kho-kien-thuc-ly` §2        | Quyết định ngưỡng dung sai 3% của engine chấm phụ thuộc điều này                                          |
| **Phân môn KHTN tách/gộp thế nào ở lớp 9** | `kho-kien-thuc-ly` §0        | Ảnh hưởng quyết định kiến trúc PA C (`subject` + `branch`)                                                |
| **Thống kê & Xác suất dạy từ lớp mấy**     | cả 4 file                    | Mạch TK là phần mới của CT 2018, dễ nhớ sai mốc lớp                                                       |
| Nội dung **STEM/AI/chuyển đổi số** mới     | cả 4 file                    | TT 17/2025 tăng thời lượng phần này — AI chưa đọc được nội dung cụ thể                                    |

### Bước 4 — Cập nhật 12 chủ đề đợt 2a

`dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a đang đề xuất 12 chủ đề **dựa trên phỏng đoán**. Sau khi
có mục lục thật → chọn lại 3 chủ đề/lớp theo tiêu chí:

1. Chấm tự động được (cột ✅ ở Bước 1).
2. Là chủ đề **trọng tâm** của lớp đó theo SGK (số tiết nhiều, nhiều bài luyện tập).
3. Có `prerequisites` rõ ràng để dựng được lộ trình.

### Bước 5 — Chạy cổng chất lượng rồi commit

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

Commit **chỉ tài liệu**, tuyệt đối không kèm file trong `tai-lieu-sgk/`:

```bash
git status --short          # kiểm tra lại lần cuối trước khi add
git add docs/ && git commit  # KHÔNG dùng `git add -A` ở bước này
```

---

## 3. Việc KHÔNG làm ở phiên đối chiếu này

Giữ phạm vi hẹp, tránh trộn nhiều loại việc vào một PR (kỷ luật đã theo suốt GĐ1):

- ❌ Không viết code app Toán (đó là PR-2 trở đi).
- ❌ Không soạn nội dung bài giảng đầy đủ (đó là PR-1, sau khi chốt xong chủ đề).
- ❌ Không sửa `packages/core-grading` trừ khi đối chiếu phát hiện engine thiếu dạng bài thật sự
  cần — nếu có, **ghi lại thành mục riêng**, không sửa lẫn vào commit tài liệu.

---

## 4. Đầu ra mong đợi của phiên local

1. `docs/research/muc-luc-sgk/toan-6..9.md` — mục lục thật, có cột "chấm tự động được".
2. 4 file `kho-kien-thuc-*.md` đã đối chiếu, mỗi file có **Nhật ký đối chiếu** ghi rõ đã sửa gì.
3. `dac-ta-gd2-mon-toan-2026-08-01.md` §2.1a — 12 chủ đề đợt 2a **chốt theo SGK thật**, không còn
   là phỏng đoán.
4. Danh sách điểm cần **giáo viên có chuyên môn** duyệt lần cuối (những chỗ SGK và kiến thức phổ
   quát không khớp nhau, AI không tự phân xử được).

Xong 4 mục trên là đủ điều kiện mở **PR-1** (soạn 1 bài học mẫu để duyệt định dạng).

---

## [9] Tài liệu: bo-sung-dang-bien-the-tu-dien.md

_(Chi tiết nguồn gốc: `bo-sung-dang-bien-the-tu-dien.md`)_

# Kế hoạch & Quyết định: Bổ sung các dạng biến thể của từ vào từ điển (word forms)

> Ngày lập: 2026-07-06 · Yêu cầu: bổ sung dạng biến thể của từ (số ít/nhiều, các thì…), hiển thị
> **trong phần giải thích nghĩa của TỪ GỐC**, chất lượng sư phạm cao — áp dụng cả khi TRA TỪ ĐIỂN
> lẫn khi HỌC TỪ MỚI (flashcard/lộ trình).

## Bối cảnh

Từ điển 12.062 từ (`public/data/dictionary/chunk-*.json`) chưa có trường dạng biến thể — tra "go"
không thấy went/gone/goes/going. ~94 entry là dạng bất quy tắc có sẵn (went, mice…) nhưng chỉ ghi
chú trong nghĩa, không liên kết cấu trúc về từ gốc. Server search tra "books"/"played" ra 0 kết quả.

## Chuẩn sư phạm áp dụng (theo Oxford/Cambridge Learner's)

1. Dạng biến thể hiển thị **ngay trong entry từ gốc**, có nút phát âm từng dạng.
2. Chỉ dạng **bất quy tắc** mới có entry tra cứu riêng (trỏ về từ gốc) — **không** thêm hàng chục
   nghìn dạng quy tắc (books, played…) làm entry riêng, tránh loãng từ điển/phá SRS.
3. Dạng quy tắc xử lý ở **tầng tìm kiếm**: tra "books" → trả entry "book" kèm chú thích.
4. Không sinh dạng sai: danh từ không đếm được không hiện số nhiều; modal verb không chia; tính từ
   dài dùng "more/most" chứ không bịa "beautifuler".

## Quyết định thiết kế

- **Lưu sẵn (precompute) forms vào JSON** (không tính lúc chạy) — kiểm định offline một lần, server
  search dùng ngay, không tốn CPU client. Thêm trường `forms?: WordForms` + `base?: string` vào
  `DictEntry` (`src/types.ts`).
- **Nguồn sinh dữ liệu 3 tầng** (`scripts/gen-word-forms.ts`, script `_lib/irregularForms.ts`):
  1. Bảng bất quy tắc soạn tay (~200 động từ, ~60 danh từ, ~10 tính từ so sánh, ~150 từ không đếm được).
  2. Quy tắc chính tả thuật toán (số nhiều/V-s/V-ing/V-ed, gấp đôi phụ âm CVC…) — trường hợp không
     chắc chắn (đa âm tiết) thì **bỏ qua** thay vì đoán.
  3. Kiểm định chéo với 94 entry biến thể có sẵn trước khi ghi; không ghi đè nếu lệch.
- Phạm vi: n/v/adj/adv có dạng biến thể; các loại từ khác (prep/conj/pron…) bỏ qua.

## Các bước đã triển khai

1. Schema (`WordForms`) + script sinh forms + ≥25 test ca biên (CVC doubling, e câm, y→ies,
   uncountable, bất quy tắc).
2. Vá ~40–60 dạng bất quy tắc còn thiếu entry riêng (hid, woken, geese, leaves…) + gắn `base` cho
   toàn bộ entry biến thể.
3. UI từ điển: khối "Các dạng của từ" (`WordFormsBlock.tsx`) — chip nhãn Việt + từ + phát âm; dạng
   bất quy tắc tô màu nhấn; liên kết "→ Xem từ gốc".
4. Tìm kiếm hiểu biến thể: index dạng→từ gốc ở `api/_lib/dictionaryData.ts`, trả entry gốc lên đầu
   kết quả kèm `matchedForm`.
5. `WordFormsBlock` gắn vào mọi nơi HỌC từ mới: `WordCard`, `Flashcard`, `StudyTabs`, `WordOfTheDay`
   — dữ liệu forms đi kèm sẵn trong `DictEntry`, không cần gọi thêm API.

## Rủi ro đã lưu ý

Sinh dạng sai (đa âm tiết, -o→es) là rủi ro sư phạm cao nhất → xử lý bằng 3 tầng + validation chéo,
nghi ngờ thì bỏ qua. Phình dữ liệu chunk (+250–400KB ước tính) → đo thật, gzip đã bật. SRS tính
trùng "go"/"went" là 2 từ khác nhau — ngoài phạm vi đợt này, ghi nợ kỹ thuật (trường `base` tạo nền
để khử trùng sau).

---

## [10] Tài liệu: vi-du-dang-tu.md

_(Chi tiết nguồn gốc: `vi-du-dang-tu.md`)_

# Ví dụ cho "các dạng của từ" (word forms) — kế hoạch & quyết định

> Bổ sung câu ví dụ song ngữ cho từng dạng biến thể (số nhiều, thì, so sánh...). Nối tiếp
> tính năng word forms. **ĐÃ LÀM** (Lô 1 + Lô 2, xem `PROGRESS.md`).

## Quyết định đã chốt

| Vấn đề    | Lựa chọn                                                                      |
| --------- | ----------------------------------------------------------------------------- |
| Phạm vi   | Dạng **bất quy tắc** + từ CEFR A1–B2 hay gặp (không phủ 100% ~12.649 ô)       |
| Lưu trữ   | File riêng, nạp lười (`public/data/form-examples.json`) — không phình từ điển |
| Cách soạn | Viết tay theo lô nhỏ, mỗi dạng đúng **2 ví dụ** song ngữ                      |

## Kiến trúc

- Nguồn soạn tay: `src/data/form-examples.ts` — khoá `` `${word}|${formKey}` ``
  (`formKey ∈ plural|v3s|ving|past|pastPart|comparative|superlative`), mỗi câu dùng đúng dạng đó.
- Sinh + kiểm định chéo từ điển: `scripts/gen-form-examples.ts` (`npm run gen:form-examples`) →
  `public/data/form-examples.json`, cảnh báo nếu `word|formKey` trỏ dạng không tồn tại.
- Nạp lười: `src/data/formExamplesLoader.ts`. Hiển thị: `WordFormsBlock.tsx` (dùng ở Từ điển,
  `WordCard`, `Flashcard`).

**Lưu ý dữ liệu:** mỗi từ trong từ điển chỉ giữ 1 loại từ (pos) chính, nên chỉ đặt khoá cho
dạng từ đó thực sự có (vd `watch` là động từ → không có `plural`). Chạy
`npm run gen:form-examples` và soát cảnh báo trước khi commit.

## Trạng thái

- **Lô 1:** 251 ô = 502 ví dụ, 0 cảnh báo (bất quy tắc + A1-B2 hay gặp).
- **Lô 2:** +140 ô = 280 ví dụ, phủ NỐT toàn bộ dạng bất quy tắc còn thiếu trong A1-B2.
- **Tổng: 391 ô = 782 ví dụ, 0 cảnh báo — 250/250 ô bất quy tắc A1-B2 đã phủ 100%.**

## Lô tiếp theo (khi cần mở rộng)

Chỉ cần thêm khoá vào `src/data/form-examples.ts` rồi chạy lại script — UI tự nhận. Ưu tiên
tiếp theo: dạng THƯỜNG (quy tắc) theo tần suất từ (SUBTLEX) trong dải A1-B2.

---

## [11] Tài liệu: dac-ta-engine-cham-dung-chung.md

_(Chi tiết nguồn gốc: `dac-ta-engine-cham-dung-chung.md`)_

# Đặc tả ENGINE CHẤM DÙNG CHUNG (Toán · Lý · Hoá) — `packages/core-grading`

> Ngày: 2026-08-01 · Trạng thái: **ĐÃ THI HÀNH** — `packages/core-grading/` đã có code + 74 test
> (99% câu lệnh · 90,6% nhánh). Bước 1-4 của §10 xong; còn bước 5 (nối vào `api/` chấm lại phía
> server) chờ khi có app Toán thật. Đặc tả gốc: **KÍN, sẵn sàng thi hành** (đủ chi tiết để giao
> `spec-executor` theo CLAUDE.md §3 — schema, API, tiêu chí chấp nhận đều đã chốt)
> Chặn: **PR-5 của GĐ2** (`dac-ta-gd2-mon-toan-2026-08-01.md` §5) — phải xong trước
> Căn cứ phát sinh: `kho-kien-thuc-ly-gdpt2018.md` §4 + `kho-kien-thuc-hoa-gdpt2018.md` §4

---

## 0. Vì sao phải làm NGAY ở GĐ2, không chờ GĐ3

Đặc tả GĐ2 ban đầu (§3.3) mô tả chấm là "so khớp số/biểu thức chuẩn hoá" — **đúng cho Toán,
thiếu cho Lý/Hoá**:

| Phát hiện khi lập kho kiến thức Lý/Hoá       | Hệ quả nếu engine chỉ biết "số trần"                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| Đáp án Lý/Hoá là **(giá trị, đơn vị)**       | `10 N` và `10 kg` bị chấm như nhau → sai nghiêm trọng      |
| Học sinh trả `1 km` thay `1000 m` — vẫn đúng | Bị chấm sai → mất niềm tin, đúng rủi ro 🔴 đã ghi ở GĐ2 §7 |
| Bài dùng `g = 10` vs `g = 9,8` lệch vài %    | Dung sai cứng → chấm sai hàng loạt                         |
| Cân bằng PTHH cần kiểm bảo toàn nguyên tố    | Không so khớp chuỗi được → phải có nhánh riêng             |

**Chi phí sửa sau ≫ chi phí thiết kế đúng ngay.** Engine viết cho Toán trước, nhưng **kiểu dữ
liệu đáp án phải mở sẵn cho đơn vị** ngay từ đầu (Toán để đơn vị rỗng).

**Nguyên tắc bất di bất dịch: KHÔNG có AI trong luồng chấm.** Engine thuần thuật toán, tất định
(cùng đầu vào → cùng kết quả), chạy được offline, test được 100%. AI chỉ dùng để _giải thích_
sau khi đã biết đúng/sai — không bao giờ để _phán_ đúng/sai.

---

## 1. Vị trí & ranh giới

```
packages/core-grading/          ← MỚI
  src/
    index.ts                    ← export công khai: gradeAnswer, parseAnswer
    number.ts                   ← chuẩn hoá số (dấu phẩy thập phân VN, luỹ thừa, …)
    units.ts                    ← hệ đơn vị: vector thứ nguyên + quy đổi
    tolerance.ts                ← chính sách dung sai
    expression.ts               ← so khớp biểu thức đại số (§5)
    chemistry.ts                ← công thức hoá học + cân bằng PTHH (§6)
    types.ts
  test/                         ← bắt buộc, xem §8
```

Thuần TypeScript, **không phụ thuộc React, không gọi mạng, không đọc DB**. Dùng được cả ở client
(chấm nhanh, phản hồi tức thì) lẫn server (chấm lại để chống gian lận — xem §7).

---

## 2. API công khai — hợp đồng duy nhất

```ts
/** Chấm một câu trả lời. Thuần tuý, tất định, không side-effect, không AI. */
export function gradeAnswer(raw: string, spec: AnswerSpec): GradeResult

export type GradeResult = {
  correct: boolean
  /** Mã lý do — để UI hiện gợi ý mà KHÔNG cần gọi AI. Xem §2.1 */
  reason: ReasonCode
  /** Dạng đã chuẩn hoá của câu trả lời, để hiện lại cho học sinh + lưu log */
  normalized?: string
}
```

### 2.1 `ReasonCode` — phản hồi có ích mà không cần AI

Đây là điểm khiến engine có giá trị sư phạm, không chỉ đúng/sai:

| Mã                  | Ý nghĩa                                         | Gợi ý hiện cho học sinh                  |
| ------------------- | ----------------------------------------------- | ---------------------------------------- |
| `CORRECT`           | Đúng                                            | —                                        |
| `CORRECT_LOOSE`     | Đúng nhưng lệch nhẹ trong dung sai              | "Đúng rồi! Lưu ý làm tròn."              |
| `WRONG_VALUE`       | Sai giá trị                                     | —                                        |
| `WRONG_UNIT`        | **Số đúng, đơn vị sai**                         | "Kết quả đúng nhưng sai đơn vị."         |
| `MISSING_UNIT`      | Đề yêu cầu đơn vị mà học sinh không ghi         | "Nhớ ghi đơn vị nhé."                    |
| `WRONG_DIMENSION`   | Sai thứ nguyên (trả khối lượng cho câu hỏi lực) | "Đại lượng này không phải khối lượng."   |
| `NOT_SIMPLIFIED`    | Đúng nhưng chưa tối giản (phân số, hệ số PTHH)  | "Đúng rồi, rút gọn thêm nhé."            |
| `SIGN_ERROR`        | Đúng trị tuyệt đối, sai dấu                     | "Kiểm tra lại dấu."                      |
| `UNBALANCED_ATOMS`  | PTHH chưa cân bằng nguyên tố                    | Chỉ rõ nguyên tố nào lệch                |
| `UNBALANCED_CHARGE` | PTHH ion chưa cân bằng điện tích                | —                                        |
| `PARSE_ERROR`       | Không hiểu được câu trả lời                     | "Chưa đọc được, kiểm tra lại cách viết." |
| `EMPTY`             | Bỏ trống                                        | —                                        |

> `WRONG_UNIT` và `SIGN_ERROR` là hai lỗi phổ biến nhất của học sinh THCS/THPT — bắt đúng được
> chúng bằng thuật toán tạo ra phản hồi chất lượng cao mà **không tốn một đồng tiền AI nào**.

### 2.2 `AnswerSpec` — khai báo đáp án đúng

```ts
export type AnswerSpec =
  NumericSpec | ExpressionSpec | FractionSpec | ChoiceSpec | ChemFormulaSpec | ChemEquationSpec

type NumericSpec = {
  kind: 'numeric'
  value: number //  giá trị đúng, ở ĐƠN VỊ CHUẨN (SI) — không phải đơn vị hiển thị
  unit?: string //  vd 'm/s'. Bỏ trống = đại lượng không đơn vị (Toán)
  unitRequired?: boolean //  mặc định true khi có `unit`
  tolerance?: Tolerance //  mặc định: xem §4
}
```

**Quy tắc chốt:** `value` luôn lưu ở **đơn vị SI cơ sở**, quy đổi diễn ra lúc chấm. Nhờ vậy học
sinh trả `1 km`, `1000 m` hay `100000 cm` đều so được với cùng một con số.

---

## 3. Chuẩn hoá SỐ — bẫy tiếng Việt phải xử lý

Đây là chỗ dễ sai nhất và **ảnh hưởng 100% người dùng Việt Nam**:

| Đầu vào học sinh gõ  | Ý nghĩa           | Ghi chú                                                    |
| -------------------- | ----------------- | ---------------------------------------------------------- |
| `0,5`                | 0.5               | **Dấu phẩy thập phân — chuẩn Việt Nam, PHẢI hỗ trợ**       |
| `0.5`                | 0.5               | Kiểu Anh–Mỹ, học sinh dùng máy tính bỏ túi hay gõ kiểu này |
| `1.000`              | ⚠️ **nhập nhằng** | VN: một nghìn · Anh–Mỹ: 1.0 — xem quy tắc bên dưới         |
| `1 000`, `1.000.000` | 1000, 1000000     | Dấu phân nhóm nghìn                                        |
| `2^3`, `2**3`        | 8                 |                                                            |
| `1,5.10^3`, `1,5e3`  | 1500              | Ký hiệu khoa học, kiểu VN dùng dấu `.` làm dấu nhân        |
| `−5` (U+2212)        | -5                | Dấu trừ Unicode do copy-paste                              |
| `½`                  | 0.5               | Ký tự phân số Unicode                                      |
| `π`, `pi`            | 3.14159…          |                                                            |
| `√2`, `sqrt(2)`      | 1.41421…          |                                                            |

**Quy tắc gỡ nhập nhằng `1.000`** (chốt, phải test):

1. Nếu chuỗi có **cả** `,` và `.` → dấu xuất hiện **sau cùng** là dấu thập phân, dấu kia là phân nhóm.
2. Nếu chỉ có **một loại** dấu, xuất hiện **một lần**, và **đúng 3 chữ số** theo sau → coi là
   **phân nhóm nghìn** (`1.000` = 1000, `1,000` = 1000).
3. Ngược lại → coi là **dấu thập phân** (`1.5` = 1.5, `0,5` = 0.5).
4. Trường hợp còn nhập nhằng thật sự (`1.000` mà đề mong 1.0) → **đề phải ràng buộc dung sai đủ
   chặt để phân biệt**; nếu không, trả `PARSE_ERROR` còn hơn chấm bừa.

> Quy tắc 2 cố tình ưu tiên cách hiểu Việt Nam vì người dùng mục tiêu là học sinh Việt.

---

## 4. Đơn vị & thứ nguyên

### 4.1 Mô hình

Mỗi đơn vị = **(hệ số quy đổi về SI, vector thứ nguyên)**. Vector 7 chiều theo SI cơ sở:

```
[ kg , m , s , A , K , mol , cd ]
```

Ví dụ: `N` (newton) = hệ số `1`, vector `[1, 1, −2, 0, 0, 0, 0]` (kg·m·s⁻²).
`km/h` = hệ số `1/3.6`, vector `[0, 1, −1, 0, 0, 0, 0]`.

**Lợi ích quyết định:** so sánh **vector thứ nguyên** phát hiện được `WRONG_DIMENSION` — học sinh
trả khối lượng cho câu hỏi về lực bị bắt ngay, dù con số có thể trùng.

### 4.2 Bộ đơn vị tối thiểu phải hỗ trợ

| Nhóm       | Đơn vị                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Độ dài     | `mm cm dm m km`                                                                                              |
| Khối lượng | `mg g kg tấn` (`t`)                                                                                          |
| Thời gian  | `s min h ngày`                                                                                               |
| Diện tích  | `cm² m² km² ha`                                                                                              |
| Thể tích   | `mL cm³ L m³`                                                                                                |
| Tốc độ     | `m/s km/h`                                                                                                   |
| Lực        | `N kN`                                                                                                       |
| Áp suất    | `Pa kPa bar atm`                                                                                             |
| Năng lượng | `J kJ cal kcal kWh`                                                                                          |
| Công suất  | `W kW MW`                                                                                                    |
| Điện       | `A mA V mV Ω kΩ C F Wb T`                                                                                    |
| Nhiệt độ   | `°C K` — ⚠️ **quy đổi CÓ ĐỘ LỆCH GỐC** (`K = °C + 273,15`), không phải nhân hệ số. Phải xử lý riêng, dễ sai. |
| Hoá học    | `mol mmol g/mol M` (mol/L) `%`                                                                               |

---

## 5. Dung sai (`Tolerance`)

```ts
type Tolerance =
  | { mode: 'exact' } //  bằng đúng (số nguyên, phân số tối giản)
  | { mode: 'absolute'; eps: number } //  |a − b| ≤ eps
  | { mode: 'relative'; pct: number } //  |a − b| / |b| ≤ pct
  | { mode: 'sigfig'; digits: number } //  khớp tới n chữ số có nghĩa
```

**Mặc định khi đề không khai báo:**

| Môn  | Mặc định                                                                      |
| ---- | ----------------------------------------------------------------------------- |
| Toán | `exact` với số nguyên/phân số · `relative 0,1%` với số thập phân              |
| Lý   | **`relative 3%`** — hấp thụ chênh lệch `g = 9,8` vs `10`, làm tròn trung gian |
| Hoá  | **`relative 1%`** — hấp thụ chênh lệch nguyên tử khối làm tròn                |

> Vì sao Lý lỏng hơn Hoá: hằng số `g` chênh 2% giữa hai quy ước phổ biến, còn nguyên tử khối chỉ
> chênh dưới 1%. Con số này **phải kiểm chứng bằng bộ test thật** (§8) rồi mới chốt, không đoán.

---

## 6. So khớp BIỂU THỨC đại số — dùng thăm dò số, KHÔNG dùng CAS

Vấn đề: `2(x+1)`, `2x+2`, `2·x+2` là **cùng một biểu thức**, nhưng so chuỗi thì khác nhau.

**Hai hướng, và lý do chọn:**

| Hướng                               | Đánh giá                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Rút gọn ký hiệu bằng CAS (`mathjs`) | Đúng về lý thuyết nhưng **nặng bundle** (mathjs vài trăm kB), và rút gọn ký hiệu vẫn có ca thất bại |
| ✅ **Thăm dò số ngẫu nhiên**        | Nhẹ, dễ hiểu, dễ test, độ tin cậy thực tế rất cao — **CHỌN**                                        |

### 6.1 Thuật toán thăm dò số

1. Parse cả hai biểu thức thành AST (parser tự viết, phạm vi: `+ − × ÷ ^ √`, ngoặc, hàm lượng
   giác/log cơ bản, biến chữ cái).
2. Lấy tập biến hợp của hai bên. Nếu **khác tập biến** → sai ngay.
3. Lặp `N = 20` lần: gán mỗi biến một giá trị ngẫu nhiên trong khoảng an toàn (tránh 0, ±1 vì
   nhiều biểu thức sai vẫn trùng tại các điểm đó), tính cả hai vế.
4. Nếu một lần cho ra `NaN`/`∞`/chia cho 0 ở **một trong hai bên** → bỏ mẫu đó, lấy mẫu khác (tối
   đa 100 lần thử) — **không** coi là sai.
5. **Đúng ⟺ cả `N` mẫu đều khớp** trong dung sai `relative 1e-9`.

> Xác suất hai biểu thức khác nhau trùng nhau tại 20 điểm ngẫu nhiên là gần như bằng 0. Đây là kỹ
> thuật chuẩn, đơn giản hơn CAS rất nhiều mà đủ tin cậy cho phạm vi phổ thông.

**Kiểm tối giản riêng:** đúng về giá trị nhưng chưa rút gọn (`4/8` vs `1/2`) → `NOT_SIMPLIFIED`,
vẫn tính đúng hay không **do đề quyết định** (`requireSimplified?: boolean`).

---

## 7. Hoá học

### 7.1 Parser công thức — `Fe₂(SO₄)₃` → vector nguyên tố

Yêu cầu: xử lý **ngoặc lồng nhau**, chỉ số dưới cả dạng ASCII (`Fe2(SO4)3`) lẫn Unicode
(`Fe₂(SO₄)₃`), tiền tố hệ số, ngậm nước (`CuSO₄·5H₂O`), ion mang điện (`SO₄²⁻`).

Kết quả: `{ Fe: 2, S: 3, O: 12 }` + điện tích.

### 7.2 Cân bằng phương trình hoá học — chấm TUYỆT ĐỐI chính xác

Không so với một đáp án cố định (bội số của bộ hệ số đúng cũng bảo toàn nguyên tố). Cách đúng:

1. Parse mỗi chất → vector nguyên tố (§7.1).
2. Nhân hệ số học sinh nhập, cộng theo từng vế.
3. **Đúng ⟺ vector hai vế bằng nhau ở MỌI nguyên tố** — nếu lệch, trả `UNBALANCED_ATOMS` **kèm
   tên nguyên tố lệch** (phản hồi cực kỳ có ích, miễn phí).
4. Phản ứng ion: kiểm thêm **bảo toàn điện tích** → `UNBALANCED_CHARGE`.
5. Kiểm **tối giản**: `ƯCLN(các hệ số) = 1`, nếu không → `NOT_SIMPLIFIED`.
6. Hệ số phải là **số nguyên dương**.

> Đây là dạng bài học sinh luyện nhiều nhất mà lại chấm chính xác 100% bằng thuật toán thuần —
> ứng viên số một cho tính năng "đinh" của môn Hoá (xem `kho-kien-thuc-hoa-gdpt2018.md` §4.1).

---

## 8. Chống gian lận — chấm ở đâu

| Nơi                 | Vai trò                                                              |
| ------------------- | -------------------------------------------------------------------- |
| **Client**          | Chấm tức thì để phản hồi nhanh (UX). **KHÔNG tin được.**             |
| **Server** (`api/`) | Chấm LẠI bằng **cùng một hàm** trước khi ghi điểm/tiến độ/SRS vào DB |

Đúng nguyên tắc CLAUDE.md §4.2 ("không tin client; logic nhạy cảm luôn ở server"). Vì engine là
package thuần TS dùng chung, **hai nơi chạy cùng một code** → không có nguy cơ lệch logic.

Đề sinh theo tham số: **đáp án đúng KHÔNG được gửi xuống client** trước khi học sinh nộp — server
giữ `seed` sinh đề, tự tính lại đáp án khi chấm.

---

## 9. Tiêu chí chấp nhận (nghiệm thu PR)

Bắt buộc có test tự động cho **toàn bộ** ca dưới đây — đây là bộ test ca biên mà đặc tả GĐ2 §5
yêu cầu ở PR-5:

**Số & định dạng**

- `0,5` = `0.5` = `1/2` = `½` đều đúng cho đáp án 0.5
- `1.000` hiểu là 1000 (quy tắc §3), `1.5` hiểu là 1.5
- `−5` (dấu trừ Unicode) = `-5`
- `1,5.10^3` = `1,5e3` = `1500`
- Khoảng trắng thừa, dấu `=` thừa ở đầu (`= 5`) vẫn chấp nhận
- Bỏ trống → `EMPTY` (không phải `PARSE_ERROR`)

**Đơn vị**

- `1 km` = `1000 m` = `100000 cm` (đáp án đúng 1000 m)
- Phân biệt hai lỗi (luật đã làm rõ khi thi hành — bản đặc tả đầu tiên nêu hai ca trùng nhau):
  - con số TRÙNG đáp án nhưng đơn vị khác thứ nguyên (`10 kg` khi đáp án `10 N`) → `WRONG_UNIT`
    (học sinh tính đúng, chỉ ghi nhầm đơn vị)
  - con số cũng khác (`10 kg` khi đáp án `50 N`) → `WRONG_DIMENSION` (hiểu sai bản chất đại lượng)
- Thiếu đơn vị khi `unitRequired` → `MISSING_UNIT`
- `25 °C` = `298,15 K` (**ca độ lệch gốc — bắt buộc test**)

**Dung sai**

- `g = 10` vs `g = 9,8`: kết quả lệch 2,04% vẫn đúng với mặc định môn Lý (3%)
- Lệch 5% → sai
- `CORRECT_LOOSE` được trả đúng khi lệch trong dung sai nhưng khác giá trị chuẩn

**Biểu thức**

- `2(x+1)` = `2x+2` = `2*x + 2`
- `x^2-1` = `(x-1)(x+1)`
- `x+1` ≠ `x-1` (phải sai)
- Biểu thức có mẫu số triệt tiêu tại điểm thăm dò → vẫn chấm đúng (lấy mẫu lại, §6.1 bước 4)
- `4/8` với `requireSimplified` → `NOT_SIMPLIFIED`

**Hoá học**

- `Fe2(SO4)3` = `Fe₂(SO₄)₃` → `{Fe:2, S:3, O:12}`
- `CuSO₄·5H₂O` parse đúng (ngậm nước)
- PTHH cân bằng đúng → `CORRECT`
- Hệ số gấp đôi bộ tối giản → `NOT_SIMPLIFIED`
- Lệch nguyên tố → `UNBALANCED_ATOMS` **có nêu đúng tên nguyên tố lệch**
- Phản ứng ion lệch điện tích → `UNBALANCED_CHARGE`

**Bất biến chung**

- `gradeAnswer` là **hàm thuần**: gọi 2 lần cùng đầu vào → cùng kết quả (kể cả nhánh thăm dò
  ngẫu nhiên §6 — dùng seed cố định để tất định)
- **Không có** lệnh gọi mạng / AI nào trong package (test canh gác: quét import)

**Cổng chất lượng:** độ phủ test của `packages/core-grading` **≥ 90%** (cao hơn ngưỡng chung của
repo — vì chấm sai ảnh hưởng trực tiếp niềm tin người học, rủi ro 🔴 ở GĐ2 §7).

---

## 10. Thứ tự thi hành

| Bước | Nội dung                                    | Phục vụ         | Giao cho                                         |
| ---- | ------------------------------------------- | --------------- | ------------------------------------------------ |
| 1    | `types.ts` + `number.ts` + test (§3)        | Toán            | `spec-executor`                                  |
| 2    | `units.ts` + `tolerance.ts` + test (§4, §5) | Lý/Hoá (mở sẵn) | `spec-executor`                                  |
| 3    | `expression.ts` + test (§6)                 | Toán PR-5       | `complex-implementer` (thuật toán, cần tự quyết) |
| 4    | `chemistry.ts` + test (§7)                  | GĐ3 Hoá         | `spec-executor`                                  |
| 5    | Nối vào `api/` chấm lại phía server (§8)    | Cả 3 môn        | `standard-worker`                                |

Bước 1-3 nằm trong phạm vi **GĐ2 PR-5**. Bước 4 hoãn tới GĐ3 nhưng **kiểu dữ liệu phải có sẵn từ
bước 1** để không phải đổi API về sau.

---
