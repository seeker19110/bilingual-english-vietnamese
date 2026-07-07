# Đánh giá & đề xuất: giúp việc học tiến triển tốt hơn (2026-07-07)

> **Cập nhật tiến độ:** Đề xuất **A — Sổ lỗi cá nhân ĐÃ TRIỂN KHAI** (localStorage, `src/lib/mistakes.ts` + trang `/mistakes`; xem PROGRESS.md mục "Tiếp theo"). Các đề xuất B→H vẫn theo thứ tự khuyến nghị bên dưới.
>
> Ngày: 2026-07-07 · Trạng thái: **ĐỀ XUẤT — chờ người dùng chốt ưu tiên trước khi code**
> Người đánh giá: AI (đọc trực tiếp mã nguồn, số liệu thật).
> Mục tiêu: sau khi engine từ vựng/SRS đã trưởng thành, tìm **biên giới tiếp theo** để người học
> tiến bộ nhanh hơn, nhớ lâu hơn, và **dùng được** thứ đã học — không lặp lại tài liệu
> `cai-tien-lo-trinh-hoc.md` (2026-07-04).

---

## 1. Tóm tắt cho người bận (TL;DR)

Tài liệu 2026-07-04 (đợt 1–5) đã **triển khai gần hết** và rất tốt — xem mục 2. Engine **từ vựng

- SRS** giờ ngang tầm các app lớn. Nhưng đánh giá lại toàn hệ thống lộ ra **một điểm nghẽn lớn về
  sư phạm còn bỏ trống**:

> **Người học đang học từ vựng trong một "silo" tách biệt hoàn toàn với 3 chế độ AI
> (Chat / Viết / Nói).** Từ vừa học không bao giờ quay lại trong hội thoại; lỗi AI sửa trong
> Chat/Viết/Nói thì "bay hơi" — không thành thẻ ôn. Và mọi bài luyện từ vựng đều là **nhận biết**
> (trắc nghiệm 4 đáp án), chưa có **sản xuất chủ động** (gõ / nói ra).

Ba khoảng trống này chính là chặng "recognition → production → use" mà khoa học học ngôn ngữ (SLA)
coi là khó nhất và quyết định việc có **dùng được** ngoại ngữ hay không. Vá chúng vừa **tăng hiệu
quả học rõ rệt**, vừa **tận dụng đúng điểm khác biệt của sản phẩm** (đã có sẵn AI + TTS 2 giọng).

| #     | Đề xuất                                                                                       | Vì sao quan trọng                          | Độ khó | Ưu tiên |
| ----- | --------------------------------------------------------------------------------------------- | ------------------------------------------ | ------ | ------- |
| **A** | **Sổ lỗi cá nhân** — thu lỗi AI sửa ở Chat/Viết/Nói → thành thẻ ôn cá nhân hóa                | Tài liệu ôn giá trị nhất đang bị vứt đi    | Vừa    | 🔴 Cao  |
| **B** | **Nối lộ trình ↔ 3 chế độ AI** — "luyện từ hôm nay bằng hội thoại", gợi ý chủ đề từ từ đã học | Đóng vòng recognition→use, tăng chuyển hóa | Vừa    | 🔴 Cao  |
| **C** | **Bài luyện sản xuất chủ động** — gõ chính tả / nhắc lại bằng giọng cho từ đã học             | Recall mạnh hơn recognition nhiều lần      | Vừa    | 🟡 TB   |
| **D** | **Nghe hiểu thành dạng bài chính** — audio→chọn nghĩa / chép chính tả (tận dụng cache TTS $0) | Kỹ năng nghe đang bị bỏ ngỏ                | Dễ–Vừa | 🟡 TB   |
| **E** | **Ngữ pháp có vòng lặp ôn nhẹ** — theo dõi mastery + nhắc ôn, không chỉ "tự khai xong"        | Ngữ pháp chưa có retention loop            | Vừa    | 🟡 TB   |
| **F** | **Giữ chân: streak freeze + tổng kết tuần**                                                   | Giảm churn (đợt 6 cũ còn treo)             | Dễ     | 🟢 Thấp |
| **G** | **Chấm phát âm cấp âm vị** (thay Levenshtein-trên-STT)                                        | Đúng lời hứa "gia sư giọng nói"            | Cao/$$ | 🟢 Thấp |
| **H** | **SM-2 → FSRS**                                                                               | Giảm 20–30% lượt ôn (đợt 6 cũ)             | Cao    | 🟢 Thấp |

**Khuyến nghị của tôi:** làm **A → B** trước (giá trị sư phạm cao nhất, tận dụng hạ tầng sẵn có,
độc đáo so với đối thủ), rồi **C/D/E**. F/G/H để sau. Chi tiết + lý do ở mục 4–5.

---

## 2. Những gì đã LÀM TỐT (giữ nguyên — công nhận trước khi phê bình)

Đọc mã nguồn xác nhận đợt 1–5 của `cai-tien-lo-trinh-hoc.md` **đã triển khai thật**:

- **SRS toàn cục + chống ngợp** (`lib/srs.ts`, `StudyTabs.tsx`): tab Ôn SRS dùng `pool` = **toàn bộ
  từ đã học mọi cấp** (không còn khóa theo trang cấp), có toggle "chỉ cấp này"; cap
  `SRS_SESSION_CAP = 30`/phiên, ưu tiên **quá hạn lâu nhất rồi ease thấp nhất** (`getDueWords`).
- **Leech tự động** (`lapses ≥ 3` → tab Từ khó) — `getLeechWords`.
- **Mini-quiz mở batch phủ ĐỦ batch, 2 chiều EN↔VI** (`buildMiniQuiz`), sai → ôn lại flashcard trước
  khi làm lại; giữ luật đúng 100% mới mở batch.
- **Tốc độ học 5/10/20 từ/ngày** (`getDailySpeed`, mặc định mới 10, người cũ giữ 20).
- **Phần "Mở rộng" sắp theo TẦN SUẤT** (`compareByFreq`, freq thật SUBTLEX 97% từ điển) — đúng Zipf.
- **Xen kẽ từ vựng ↔ ngữ pháp** trong `findNextStep` (interleaving) — không còn "block" từ vựng dài.
- **Test-out "Tôi đã biết vòng này"** → `addToSRSKnown` (interval 7 ngày, không tính vào 20 từ/ngày).
- **Quiz ngữ pháp trộn vào tab Kiểm tra** (`GRAMMAR_QUIZ_COUNT = 3`, sai → "Mở lại bài").
- **Học trong ngữ cảnh**: màn "xong batch" ráp **chính** các từ vừa học thành câu + hội thoại
  (`BatchDoneView`) — điểm mạnh hiếm app nào có, giữ.
- **Lỗi người Việt hay mắc** nhúng vào prompt Chat/Nói (`VIET_COMMON_ERRORS`) — contrastive analysis,
  rất giá trị.

→ Kết luận: **không cần đụng lại engine từ vựng/SRS.** Việc tiếp theo nằm ở **kết nối** và
**chiều sản xuất**, không phải tinh chỉnh thêm SRS.

---

## 3. Chẩn đoán: điểm nghẽn còn lại (đọc từ mã nguồn)

### 3.1 Ba "silo" không nói chuyện với nhau 🔴

- `src/pages/Speaking.tsx`, `Chat.tsx`, `Writing.tsx`: **không hề** import `getLearnedWords` /
  `getDueWords` / lộ trình (đã grep — 0 kết quả). Prompt (`src/prompts/index.ts`) chỉ nhận
  `situation` + `level`, **không nhận danh sách từ người học đang học**.
- Hệ quả sư phạm: học viên cày 20 từ "nhà hàng" ở tab Hôm nay, rồi vào Chat nói chuyện "sân bay" —
  **không có cầu nối** để đưa từ mới vào dùng. Đây đúng là chỗ SLA gọi là hố "biết từ nhưng không
  dùng được": nhận biết được trên flashcard ≠ tự bật ra khi nói.

### 3.2 Lỗi của người học "bay hơi" 🔴

- Chat/Viết/Nói đều **sửa lỗi bằng AI** rất tốt (viết lại câu đúng + giải thích). Nhưng lỗi đó
  **không được lưu lại** dưới dạng có thể ôn. `errorTracking.ts` **chỉ là Sentry** (báo crash kỹ
  thuật), không phải sổ lỗi học viên. Bảng `writing_submissions` có lưu `feedback` (JSON) nhưng
  không có màn nào biến nó thành **thẻ ôn**.
- Đây là **tài liệu ôn tập giá trị nhất** và độc nhất của từng người (lỗi thật của chính họ) —
  hiện đang bị vứt đi sau mỗi phiên.

### 3.3 Chỉ có nhận biết, chưa có sản xuất 🟡

- Mọi bài kiểm tra từ vựng (`buildMiniQuiz`, `buildQuiz`) đều là **trắc nghiệm 4 đáp án**. Kể cả
  chiều "VI→EN" vẫn là **chọn** từ tiếng Anh trong 4 lựa chọn, không phải **gõ ra** hay **nói ra**.
- Testing effect mạnh nhất khi phải **tự sản xuất** (free recall) chứ không phải nhận ra
  (recognition). Thiếu bước này, từ dừng ở mức "nhìn quen", khó bật ra khi giao tiếp.

### 3.4 Nghe hiểu bị bỏ ngỏ 🟡

- TTS + karaoke có mặt khắp nơi (nghe **thụ động** khi đã thấy chữ), nhưng **không có dạng bài
  nghe chủ động**: phát audio ẩn chữ → chọn nghĩa / chép lại. Cache TTS đã mã hóa sẵn ⇒ dạng bài
  này gần như **$0** chi phí thêm.

### 3.5 Ngữ pháp không có vòng lặp ôn 🟡

- `cefrProgress.ts`: ngữ pháp chỉ có cờ nhị phân "đã học xong" (tự khai). Quiz trong bài không lưu
  kết quả; 3 câu trộn vào Kiểm tra là bước đầu tốt nhưng **không có lịch ôn lại** như từ vựng. Bài
  ngữ pháp học xong rồi để đó, không nhắc lại → quên cấu trúc.

### 3.6 Chấm phát âm còn yếu so với định vị sản phẩm 🟢

- `pronounceScore.ts` = **Levenshtein trên văn bản Web Speech STT**. Nó đo "STT có nhận đúng CHỮ
  không", không đo **âm vị** (phoneme). Với sản phẩm tự định vị là "gia sư **giọng nói** song ngữ",
  đây là chỗ yếu — nhưng nâng cấp cần API chấm phát âm (Azure Pronunciation Assessment, Speechace…),
  **tốn tiền**, nên để cân nhắc sau, không gấp.

---

## 4. Cơ sở khoa học đối chiếu (chỉ phần MỚI so với doc cũ)

1. **Output Hypothesis (Swain):** chỉ nghe/đọc (input) chưa đủ; người học phải **tạo ra** ngôn ngữ
   (output) và **nhận phản hồi** thì mới chuyển "biết" thành "dùng được" → nền tảng cho đề xuất **B, C**.
2. **Testing effect có phân cấp:** free recall (gõ/nói ra) > cued recall > recognition (trắc nghiệm).
   Bài hiện tại dừng ở đáy thang → đề xuất **C** nâng lên bậc cao hơn.
3. **Error-driven learning / uptake:** phản hồi sửa lỗi chỉ "ăn" khi được **ôn lại có chủ đích**;
   sửa một lần rồi thôi thì phần lớn rơi rụng → nền tảng cho **A** (sổ lỗi thành thẻ ôn).
4. **Spacing áp cho MỌI loại kiến thức,** không riêng từ vựng — ngữ pháp cũng cần nhắc lại theo lịch
   → đề xuất **E**.
5. **Dictation & listening-for-meaning** củng cố cả nghe lẫn chính tả/âm–chữ; rẻ khi đã có TTS → **D**.

> Nguồn: Swain (1985) Output Hypothesis · Roediger & Karpicke (2006) testing effect ·
> Lyster & Ranta (1997) corrective feedback & uptake · Cepeda et al. (2006) spacing.

---

## 5. Đề xuất chi tiết (mỗi đề xuất = 1 đợt, 1 PR nhỏ)

### A — Sổ lỗi cá nhân (Mistake Bank) 🔴

- **Ý tưởng:** mỗi lần AI sửa lỗi trong Chat/Viết/Nói, lưu lại `{ câu sai, câu đúng, giải thích,
nguồn, thời điểm }`. Thêm 1 mục "Ôn lỗi của tôi" (có thể nằm trong `/progress` hoặc tab học) hiển
  thị lại dưới dạng thẻ: cho xem câu sai → tự sửa → lật xem đáp án đúng. Lỗi lặp nhiều lần được ưu tiên.
- **Vì sao:** biến phản hồi đang "bay hơi" thành vòng lặp ôn cá nhân hóa — thứ **không app từ vựng
  đại trà nào làm được** vì họ không có AI hội thoại như dự án này.
- **Kỹ thuật:** prompt Chat/Nói đã có định dạng "✅ Nhận xét" → parse phần này ở client để bắt cặp
  sai/đúng (đợt đầu client-side, localStorage + đồng bộ như `learning_progress`). Writing đã có
  `feedback` JSON → tận dụng thẳng. **Không cần đổi provider AI.** Cân nhắc bảng Supabase mới
  `mistakes` (RLS "own", theo mẫu sẵn) hoặc gộp vào `learning_progress` jsonb (tránh migration).
- **Rủi ro:** parse output AI có thể lệch định dạng → cần chuẩn hóa format phản hồi + có nhánh bỏ qua
  khi không parse được (không throw).

### B — Nối lộ trình ↔ 3 chế độ AI 🔴

- **Ý tưởng:**
  1. Ở màn "xong batch" và trang cấp, thêm nút **"Luyện các từ này bằng hội thoại"** → mở Chat/Nói
     với `situation` bơm sẵn danh sách từ vừa học, yêu cầu AI dẫn dắt để học viên **dùng** chúng.
  2. Prompt nhận thêm tham số `targetWords?: string[]`; AI được dặn "khuyến khích học viên dùng các
     từ sau, khen khi họ dùng đúng".
  3. (Tùy chọn) Chấm điểm cuối phiên báo "bạn đã dùng được X/Y từ mục tiêu".
- **Vì sao:** đóng vòng recognition → production → use ngay trong sản phẩm, biến 3 chế độ AI từ
  "tính năng rời" thành **bước cuối của lộ trình**.
- **Kỹ thuật:** chỉ thêm 1 tham số optional vào `chatSystemPrompt`/`speakingSystemPrompt` + đường
  điều hướng mang theo từ. Không đụng đếm lượt/bảo mật server.

### C — Bài luyện sản xuất chủ động 🟡

- **Ý tưởng:** thêm dạng bài **gõ đáp án** (nghe/nhìn nghĩa → gõ từ tiếng Anh, chấm mềm cho phép sai
  chính tả nhẹ như `scoreWords`) và/hoặc **nói ra** (đã có STT + `pronounceScore`). Xen 1–2 câu dạng
  này vào mini-quiz cho từ đã ôn ≥ n lần (đừng bắt gõ ngay từ mới → nản).
- **Rủi ro:** gõ trên mobile phiền — cần cho phép "gợi ý chữ đầu", và chỉ áp cho từ đã quen.

### D — Nghe hiểu thành dạng bài 🟡

- **Ý tưởng:** thêm câu hỏi "🔊 → chọn nghĩa" (phát audio ẩn chữ) và **chép chính tả** câu ví dụ ngắn.
  Trộn vào tab Kiểm tra / mini-quiz.
- **Kỹ thuật:** tái dùng TTS cache (đã có), `scoreWords` cho chấm chép chính tả. Gần **$0**.

### E — Ngữ pháp có vòng lặp ôn nhẹ 🟡

- **Ý tưởng:** lưu kết quả quiz ngữ pháp; bài sai/ít làm được nhắc ôn lại theo lịch giãn cách đơn
  giản (không cần SRS đầy đủ — có thể tái dùng `SRSCard` với key `grammar:<lessonId>`). "Học tiếp"
  thỉnh thoảng chèn 1 bài ngữ pháp cũ cần ôn.
- **Rủi ro:** đừng làm nặng — chỉ cần "3 bài ngữ pháp nên xem lại" là đủ giá trị bước đầu.

### F — Giữ chân (đợt 6 cũ còn treo) 🟢

- **Streak freeze** (1 "vé nghỉ"/tuần, giảm churn ~21% theo Duolingo) + **tổng kết tuần** ("tuần này
  bạn học N từ mới, ôn M thẻ, giữ streak K ngày") ở `/progress`. Dễ, tận dụng `stats.ts` sẵn có.

### G — Chấm phát âm cấp âm vị 🟢 (cân nhắc, tốn tiền)

- Tích hợp API chấm phát âm thật (Azure/Speechace) cho điểm theo **âm vị + trọng âm**, chỉ bật cho
  gói Pro để kiểm soát chi phí. Để **sau khi có thanh toán Pro** (đang là nợ kỹ thuật #1).

### H — SM-2 → FSRS 🟢 (đợt 6 cũ)

- Giữ nguyên khuyến nghị doc cũ: để sau; `ts-fsrs` có sẵn nhưng cần migrate `SRSCard`
  (localStorage + Supabase). Lợi ích (−20–30% lượt ôn) thật nhưng không gấp bằng A/B.

---

## 6. Đề xuất thứ tự & câu hỏi cần chốt

**Thứ tự đề xuất:** A (sổ lỗi) → B (nối AI ↔ lộ trình) → D (nghe, rẻ) → C (sản xuất) → E (ngữ pháp)
→ F (giữ chân) → G/H (sau).

Lý do: A + B mang lại **giá trị sư phạm cao nhất trên mỗi giờ code**, tận dụng đúng thứ dự án đã có
mà đối thủ không có (AI hội thoại + TTS 2 giọng), và **không** đụng phần nhạy cảm (thanh toán, schema
phá vỡ, bảo mật server).

**Cần người dùng chốt trước khi code (theo CLAUDE.md mục 3 & 12):**

1. Ưu tiên **A → B** trước có đúng ý bạn không? Hay muốn ưu tiên khác (vd F giữ chân, hoặc E ngữ pháp)?
2. **Sổ lỗi (A):** lưu client-side + đồng bộ qua `learning_progress` (không migration) hay tạo bảng
   `mistakes` riêng (sạch hơn nhưng cần migration)?
3. **Nối AI (B):** đồng ý thêm nút "Luyện từ hôm nay bằng hội thoại" bơm từ vào prompt không?
4. Mỗi đề xuất vẫn giữ nguyên tắc **1 PR nhỏ/đợt, xin duyệt ở mỗi cổng** như các đợt trước — OK chứ?

> Ghi chú: mọi đề xuất trên **không** đụng tới nợ kỹ thuật đang treo (thanh toán Pro, Sentry DSN,
> migration production) — có thể làm song song, không xung đột.
