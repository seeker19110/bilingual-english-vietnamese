# Nghiên cứu: Cải tiến bài học & thứ tự học (lộ trình /learning-path)

> Ngày: 2026-07-04 · Trạng thái: **ĐỀ XUẤT — chờ người dùng duyệt thứ tự ưu tiên trước khi code**
> Mục tiêu: học **dễ dàng, tự nhiên, ra kết quả nhanh, không nản lòng** — đối chiếu hệ thống
> hiện tại với các nguyên tắc đã được chứng minh trong khoa học học ngôn ngữ (SLA) và
> kinh nghiệm của các app lớn (Anki, Duolingo).

---

## 1. Tóm tắt cho người bận (TL;DR)

Hệ thống hiện tại đã có nền rất tốt (SRS, vòng chủ đề, lộ trình CEFR, quiz mở batch, streak).
Nghiên cứu chỉ ra **5 điểm nghẽn chính** khiến người học dễ nản hoặc tiến chậm:

| #   | Vấn đề                                                                                                                                                | Tác động                | Sửa khó/dễ |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------- |
| 1   | **Ôn SRS bị chia theo cấp** — từ A1 đến hạn ôn KHÔNG hiện khi đang học trang B1 → quên dần từ cũ                                                      | 🔴 Mất kiến thức đã học | Dễ         |
| 2   | **Không giới hạn ôn khi quay lại sau nghỉ** — nghỉ 1 tuần → hàng trăm thẻ dồn → ngợp → bỏ app (đây là lý do bỏ học số 1 theo nghiên cứu của Duolingo) | 🔴 Churn cao nhất       | Dễ         |
| 3   | **8.500 từ "Mở rộng" xếp theo ALPHABET** — người học sau B2 gặp "abandon, abbreviation, abolish…" thay vì từ thông dụng trước                         | 🔴 Kết quả chậm         | Vừa        |
| 4   | **Học từ = nhìn 1 lần rồi bấm "Đã thuộc"** — mini-quiz chỉ hỏi 5/20 từ, 1 chiều → 15 từ chưa từng được kiểm tra đã tính là thuộc                      | 🟡 Nhớ nông             | Dễ         |
| 5   | **Phải xong 100% từ vựng của unit mới được gợi ý ngữ pháp** — unit lớn (6 vòng ≈ 120 từ) → nhiều ngày liền chỉ lật thẻ, đơn điệu                      | 🟡 Nhàm, dễ nản         | Vừa        |

**Đề xuất làm theo 5 đợt nhỏ** (mỗi đợt 1 PR, chi tiết ở mục 5): ① sửa SRS toàn cục + chống ngợp,
② kiểm tra đủ 20 từ + 2 chiều, ③ chọn tốc độ học 5/10/20 từ/ngày, ④ sắp "Mở rộng" theo tần suất,
⑤ xen kẽ từ vựng–ngữ pháp + kiểm tra vượt vòng (cho người đã biết sẵn).

---

## 2. Hiện trạng (đọc từ mã nguồn, số liệu thật)

### 2.1 Nội dung

- **89 vòng từ vựng nền tảng** = 1.524 từ, gắn đủ vào lộ trình CEFR, chia đều
  ~380 từ/cấp (A1: 379 · A2: 382 · B1: 377 · B2: 386) — `src/data/curriculum.ts`.
- **23 unit / 61 bài ngữ pháp** A1→B2, mỗi bài có cấu trúc + giải thích tiếng Việt + ví dụ
  nghe được + mẹo + lỗi thường gặp + quiz — `src/data/cefr.ts`.
- **Từ điển 10.006 từ**; phần còn lại sau nền tảng (~8.480 từ) tự gom thành các cụm
  "Mở rộng" 20 từ, **giữ nguyên thứ tự alphabet** — `lib/curriculum.ts` (`getCircles()`).
  Chưa từ nào có nhãn CEFR (`level`) hay tần suất (script `tag:cefr` có sẵn nhưng chưa chạy).
- Hội thoại mẫu theo vòng/unit — `src/data/dialogues.ts`.

### 2.2 Luồng học

- **Trong unit:** ① Từ vựng (flashcard, bấm "Đã thuộc"/"Để sau") → ② Ngữ pháp (đọc, tự bấm
  "Đã học xong") → ③ Hội thoại (xem, không bắt buộc). "Học tiếp" (`findNextStep`) chỉ gợi ý
  ngữ pháp khi **mọi vòng từ vựng của unit đạt 100%**.
- **Tab "Hôm nay":** 20 từ kế tiếp chưa thuộc; xong batch → mini-quiz 5 câu (EN→nghĩa VI,
  trắc nghiệm), đúng 100% mở batch mới; tối đa 100 từ/ngày.
- **SRS (SM-2 rút gọn):** từ nào bấm "Đã thuộc" tự vào SRS, due ngay hôm đó; "Quên" → drill
  lại trong phiên. **Tab Ôn SRS lọc theo từ vựng của CẤP đang mở** (`pool = getLevelWords`).
- **Mở khóa cấp:** thuộc ≥70% từ vựng cấp trước (có grandfather, không khóa lại).
- **Động lực:** streak, biểu đồ 7 ngày, màn "xong batch" có câu + hội thoại ráp từ từ vừa học.

### 2.3 Những cái ĐANG LÀM ĐÚNG (giữ nguyên, không đụng)

- SRS due-ngay-hôm-học + "Quên → drill tới khi nhớ" — đúng khuyến nghị same-day review.
- Quiz 100% mới mở batch mới — đúng nguyên tắc mastery gate nhẹ.
- Màn "xong batch" hiện câu thông dụng + hội thoại từ CHÍNH các từ vừa học — đúng nguyên tắc
  học trong ngữ cảnh (contextualization), đây là điểm mạnh hiếm app nào có.
- Ngưỡng mở cấp 70% (không phải 100%) + grandfather — tránh khóa hồi tố, đúng.
- Bài ngữ pháp có "lỗi người Việt hay mắc" — đúng tinh thần contrastive analysis, rất giá trị.

---

## 3. Cơ sở khoa học đối chiếu

1. **Luật Zipf & danh sách tần suất:** ~2.000 từ thông dụng nhất phủ ~90% văn bản tiếng Anh
   thường gặp; bộ NGSL 2.800 từ phủ ~92% (94% đề TOEIC, 95% phim truyền hình). 2.000 từ
   TIẾP THEO chỉ thêm ~5%. → Thứ tự học từ vựng phải theo **tần suất**, không theo alphabet.
2. **Số từ mới/ngày:** nghiên cứu Nakata (2015, SSLA) — nhóm học 15 từ/buổi nhớ 73% khi kiểm
   tra trễ, nhóm 40 từ chỉ nhớ 42%. Khuyến nghị chung cho người lớn: **10–20 từ/ngày**, và
   quan trọng hơn con số là khối lượng ôn kéo theo: 20 từ mới/ngày với SM-2 → sau vài tuần
   ~100+ lượt ôn/ngày.
3. **Testing effect (retrieval practice):** tự nhớ lại (recall) mạnh hơn đọc lại (recognition)
   nhiều lần; kiểm tra 2 chiều (EN→VI _và_ VI→EN) cho kết quả bền hơn 1 chiều.
4. **Lý do bỏ học số 1** (nghiên cứu nội bộ Duolingo công bố): người dùng bỏ **không phải vì
   khó**, mà vì **nghỉ vài ngày rồi quay lại thấy ngợp**. Streak Freeze giảm churn 21%;
   monthly churn của họ giảm 47%→28% chủ yếu nhờ các cơ chế "quay lại nhẹ nhàng".
5. **Interleaving (xen kẽ):** trộn dạng bài (từ vựng ↔ ngữ pháp ↔ nghe) trong 1 phiên giữ
   chú ý tốt hơn "block" dài một dạng; đồng thời tăng khả năng chuyển hóa sang dùng thật.
6. **Comprehensible input:** nghe/đọc nội dung hiểu được ở mức i+1 trước khi phân tích ngữ
   pháp giúp tiếp thu tự nhiên hơn — hội thoại mẫu nên là **đầu vào** của unit, không chỉ
   là mục "xem thêm" cuối unit.
7. **FSRS vs SM-2:** thuật toán FSRS (2022, benchmark trên 700 triệu lượt ôn Anki) cần
   **ít hơn 20–30% lượt ôn** cho cùng mức nhớ so với SM-2, và tránh "ease hell". Có thư viện
   TypeScript mở (`ts-fsrs`). — Đây là nâng cấp _tùy chọn, giai đoạn sau_.

Nguồn chính: [newgeneralservicelist.com/coverage](https://www.newgeneralservicelist.com/coverage) ·
[Nakata 2015 — tóm tắt tại wordplus.app](https://www.wordplus.app/en/blog/how-many-words-to-learn-per-day) ·
[Duolingo blog — streaks](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) ·
[FSRS vs SM-2 benchmark](https://www.antiagent.io/blog/fsrs-vs-sm-2)

---

## 4. Phân tích vấn đề chi tiết

### V1 — Ôn SRS bị chia theo trang cấp 🔴

`CefrLevelPage.tsx` truyền `pool = getLevelWords(level.id)` vào tab **Ôn SRS**; badge đếm due
cũng lọc theo pool. Người đã lên B1 sẽ **không bao giờ thấy** từ A1/A2 đến hạn ôn trừ khi tự
quay về trang A1 — trái mục đích của SRS (giữ TOÀN BỘ những gì đã học). Kết quả: từ cũ rơi
rụng dần mà người học không biết, đến khi gặp lại thì "ơ, từ này học rồi mà quên" → nản.

**Đề xuất:** tab Ôn SRS (và badge) dùng **toàn bộ từ đã vào SRS** (mọi cấp + Mở rộng), có thể
kèm bộ lọc "chỉ cấp này" tùy chọn. Sửa nhỏ: đổi pool truyền vào `SRSReview` + badge.

### V2 — Quay lại sau nghỉ = ngợp 🔴

Không có giới hạn số thẻ ôn/phiên. Học 20 từ/ngày × 2 tuần rồi nghỉ 1 tuần → ~200+ thẻ due
cùng lúc. Màn hình hiện "200 thẻ cần ôn" là đòn tâm lý nặng nhất với người mới.

**Đề xuất:**

- **Cap phiên ôn: ~30–60 thẻ/lần** (hằng số, không "số ma thuật" rải rác), ưu tiên thẻ quá hạn
  lâu nhất + ease thấp nhất trước; hiện "Ôn 30 thẻ quan trọng nhất trước nhé" thay vì con số dồn.
- **Thông điệp mừng quay lại** khi `lastStudied` cách ≥3 ngày: phiên "khởi động nhẹ" 10 thẻ,
  KHÔNG hiện tổng backlog.
- (Tùy chọn, đợt sau) **Streak freeze**: 1 "vé nghỉ" mỗi tuần để streak không đứt — cơ chế đã
  được chứng minh giảm churn 21%.

### V3 — Phần "Mở rộng" xếp theo alphabet 🔴

`getCircles()` lấy `ENTRIES.filter(...)` giữ nguyên thứ tự file → alphabet. Người học hết
nền tảng (1.524 từ) sẽ học tiếp "a, abandon, ability, abolish…" — gần như ngẫu nhiên về độ
hữu dụng, vi phạm trực tiếp luật Zipf (mục 3.1).

**Đề xuất (làm offline bằng script, không phình bundle):**

1. Thêm trường `freq?: number` (hạng tần suất) vào `DictEntry`, điền bằng script
   `scripts/` đối chiếu danh sách tần suất mở (NGSL / SUBTLEX-US — miễn phí, hợp giấy phép).
2. `getCircles()` sắp phần mở rộng theo `freq` tăng dần (từ thông dụng trước), từ không có
   `freq` xếp cuối. Cache/`_pathCache` giữ nguyên cơ chế.
3. Chạy luôn `npm run tag:cefr` (hạ tầng có sẵn) để gắn nhãn CEFR từng từ — phục vụ cả mục
   tiêu đang treo trong PROGRESS.md.
   ⚠️ Lưu ý: thứ tự lộ trình đổi → tiến độ "% lộ trình" của người dùng hiện tại KHÔNG mất
   (learned lưu theo từ, không theo vị trí), chỉ thứ tự từ SẮP HỌC đổi — an toàn.

### V4 — "Đã thuộc" sau 1 lần nhìn, quiz chỉ phủ 5/20 từ 🟡

Flashcard bấm "Đã thuộc" là vào SRS ngay — encoding quá nông (mục 3.3). Mini-quiz mở batch
chỉ 5 câu, chỉ chiều nhận biết EN→VI (dễ nhất), nên 15/20 từ chưa từng bị kiểm tra.

**Đề xuất:**

- Mini-quiz hỏi **đủ 20 từ** (chia 2 màn 10 câu cho đỡ dài), trộn 2 chiều: EN→VI và VI→EN
  (mỗi chiều ~nửa). Câu sai → hiện lại flashcard từ đó ngay trước khi cho làm lại.
- Giữ luật đúng 100% mở batch (đang tốt).
- (Tùy chọn) thêm dạng câu hỏi nghe: phát audio → chọn nghĩa (TTS đã có sẵn cache).

### V5 — Unit "block" từ vựng quá dài, ngữ pháp/hội thoại bị dồn cuối 🟡

`findNextStep` bắt xong 100% mọi vòng từ vựng rồi mới tới ngữ pháp. Unit lớn nhất
(A1 "actions": 6 vòng ≈ 120 từ) nghĩa là ~1 tuần chỉ lật thẻ trước khi gặp bài ngữ pháp
đầu tiên của unit — vi phạm interleaving (mục 3.5), và hội thoại (phần "tự nhiên" nhất)
bị đẩy xuống thành mục phụ.

**Đề xuất (chỉ đổi LOGIC gợi ý, không đổi dữ liệu):**

- `findNextStep` xen kẽ: vòng từ vựng 1 → bài ngữ pháp 1 → vòng 2 → bài 2 … (hết loại nào
  thì tiếp loại kia). Người dùng vẫn tự do bấm học mục nào tùy thích như hiện tại.
- Ngưỡng "xong vòng" để chuyển bước trong gợi ý: có thể nới 100% → ≥90% (tránh kẹt vì
  1–2 từ "Để sau"), nhưng đây là thay đổi hành vi — cần người dùng quyết.
- Hội thoại: thêm 1 bước gợi ý "🎧 Nghe hội thoại mở đầu" ĐẦU unit (dùng chính dialogue có
  sẵn của unit) — nghe trước, học từ sau, đúng comprehensible input. Không bắt buộc.

### V6 — Người "biết sẵn" bị bắt cày từ đầu 🟡

Không có kiểm tra xếp lớp. Người đã biết tiếng Anh cơ bản muốn học B1 phải bấm "Đã thuộc"
~265 từ A1 (70%) + tương tự A2, bị chặn thêm bởi trần 100 từ/ngày → vài ngày bấm thẻ vô nghĩa
→ bỏ app trước khi tới nội dung phù hợp.

**Đề xuất:** nút **"Tôi đã biết vòng này"** trên mỗi vòng từ vựng → quiz nhanh 10 câu lấy từ
vòng đó, đúng ≥9/10 → đánh dấu cả vòng đã thuộc (vào SRS với interval dài, vd 7 ngày, không
tính vào bộ đếm 20 từ/ngày). Đây vừa là "test-out" vừa là placement từng phần, rẻ hơn nhiều
so với xây bài kiểm tra xếp lớp riêng.

### V7 — Tốc độ học cố định 20 từ/ngày 🟡

20 là ngưỡng TRÊN của khuyến nghị (mục 3.2); người mới/bận rộn dễ hụt mục tiêu liên tục →
cảm giác thất bại. Hiện `DAILY_GOAL = 20` cứng, kéo theo `getDailyAllowance`, FAQ, UI.

**Đề xuất:** cho chọn tốc độ ở Hồ sơ: **Nhẹ nhàng 5 · Vừa 10 (mặc định mới) · Nhanh 20**;
trần ngày = 5×tốc độ như công thức hiện tại. Người học nhanh không mất gì (vẫn mở batch
qua quiz), người mới có mục tiêu đạt được mỗi ngày → giữ streak → giữ người.
⚠️ Đổi mặc định 20→10 ảnh hưởng copy (FAQ index.html, CLAUDE.md, Dashboard) — làm 1 PR riêng.

### V8 — Ngữ pháp "tự khai đã xong", quiz không lưu 🟢 (nhẹ)

Nút "Đã học xong" không yêu cầu gì; quiz trong bài không bắt buộc, không lưu kết quả, không
ôn lại. Ngữ pháp vì thế không có vòng lặp củng cố như từ vựng.

**Đề xuất (nhẹ, đợt sau):** trộn 2–3 câu quiz ngữ pháp (từ các bài đã "học xong") vào tab
"Kiểm tra" của cấp; sai thì gợi ý mở lại bài đó. Không cần SRS riêng cho ngữ pháp ở giai
đoạn này.

### V9 — SM-2 → FSRS 🟢 (cân nhắc, KHÔNG gấp)

FSRS tiết kiệm 20–30% lượt ôn (mục 3.7) — đúng hướng "không nản lòng". Nhưng: thêm dependency,
phải migrate `SRSCard` (localStorage + Supabase), khó kiểm chứng nhanh. **Khuyến nghị: để sau
khi các đợt 1–5 xong**; các cải tiến cap-ôn/leech ở V2 đã giải quyết phần lớn nỗi đau trước mắt.

### V10 — Leech (từ học mãi không vào) 🟢

Từ bị đánh "Quên" nhiều lần chiếm thời gian ôn không tương xứng. Hiện "Từ khó" chỉ đánh dấu
tay ⭐. **Đề xuất:** thẻ có ≥3 lần "Quên" tự vào danh sách "Từ khó" (đếm thêm trường `lapses`
trong `SRSCard` — thêm trường mới, dữ liệu cũ thiếu trường coi như 0, không cần migrate).

---

## 5. Kế hoạch thực hiện đề xuất (mỗi đợt 1 PR nhỏ, kiểm tra được)

| Đợt           | Nội dung                                                                                             | Vấn đề    | File chính                                                        | Rủi ro                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **1**         | SRS toàn cục + cap 30 thẻ/phiên ưu tiên quá hạn + leech tự động (`lapses`)                           | V1 V2 V10 | `lib/srs.ts`, `StudyTabs.tsx`, `CefrLevelPage.tsx`                | Thấp — không đổi schema                                                |
| **2**         | Mini-quiz đủ 20 từ, 2 chiều EN↔VI, sai hiện lại thẻ                                                  | V4        | `StudyTabs.tsx`                                                   | Thấp                                                                   |
| **3**         | Chọn tốc độ 5/10/20 từ/ngày (mặc định 10)                                                            | V7        | `lib/curriculum.ts`, Profile, Dashboard, copy                     | Vừa — đổi mặc định, cần cập nhật FAQ/tài liệu                          |
| **4**         | Sắp "Mở rộng" theo tần suất (script offline thêm `freq`) + chạy `tag:cefr`                           | V3        | `scripts/`, `getCircles()`, data JSON                             | Vừa — cần key AI cho tag:cefr (đã hẹn chạy máy local); thứ tự path đổi |
| **5**         | `findNextStep` xen kẽ từ vựng↔ngữ pháp + bước "nghe hội thoại" đầu unit + nút "Tôi đã biết vòng này" | V5 V6     | `lib/cefrProgress.ts`, `CefrLevelPage.tsx`, `CefrLessonViews.tsx` | Vừa — đổi hành vi gợi ý, cần chốt UX                                   |
| **6** _(sau)_ | Quiz ngữ pháp trộn vào tab Kiểm tra; streak freeze; cân nhắc FSRS                                    | V8 V2 V9  | —                                                                 | Để sau khi 1–5 chạy ổn                                                 |

Đề xuất thứ tự trên vì: đợt 1–2 **chống mất kiến thức + chống ngợp** (giữ người dùng hiện có),
đợt 3 **hạ rào cản hằng ngày**, đợt 4 **tăng tốc kết quả dài hạn**, đợt 5 **tự nhiên hóa** luồng học.

### Câu hỏi cần người dùng chốt trước khi code

1. Mặc định tốc độ mới 10 từ/ngày (người cũ giữ 20) — đồng ý?
2. Gợi ý "Học tiếp" xen kẽ từ vựng↔ngữ pháp — đồng ý đổi hành vi này?
3. Nút "Tôi đã biết vòng này" (quiz 10 câu vượt vòng) — có muốn làm ở đợt 5 hay sớm hơn?
4. Nguồn tần suất: NGSL (2.800 từ, giấy phép CC BY) + SUBTLEX cho phần còn lại — OK?

---

## 6. Nguồn tham khảo

- NGSL coverage: https://www.newgeneralservicelist.com/coverage · https://en.wikipedia.org/wiki/New_General_Service_List
- Số từ/ngày & Nakata 2015: https://www.wordplus.app/en/blog/how-many-words-to-learn-per-day · https://storylearning.com/how-many-words-can-you-learn-per-day
- Duolingo streak/churn: https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/ · https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/
- FSRS benchmark: https://www.antiagent.io/blog/fsrs-vs-sm-2 · https://deckstudy.com/blog/fsrs-vs-sm2-modern-spaced-repetition
- Gamification misuse (mặt trái): https://arxiv.org/pdf/2203.16175
