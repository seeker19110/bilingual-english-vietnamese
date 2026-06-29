# Gia sư ngôn ngữ AI (Việt ⇄ Anh) — Kế hoạch xây app & thiết kế sản phẩm

> **Sản phẩm:** Web app gia sư ngôn ngữ AI **hai chiều**, gồm 3 chế độ: **Luyện nói song ngữ**, **Luyện viết + chấm điểm**, **Chat tổng hợp**.
> **Hai chiều học (chọn bằng nút gạt ngôn ngữ):**
>
> - **Chiều A — Người Việt học tiếng Anh:** hội thoại bằng **giọng Anh**, sửa lỗi & giải thích bằng **giọng tiếng Việt**.
> - **Chiều B — Người nước ngoài học tiếng Việt (qua tiếng Anh):** hội thoại bằng **giọng Việt**, sửa lỗi & giải thích bằng **giọng tiếng Anh**.
>   **Điểm nhấn:** Chế độ **Luyện nói song ngữ** — AI nói ngôn ngữ đích để luyện hội thoại, nhưng **sửa lỗi và giải thích bằng GIỌNG tiếng mẹ đẻ của học viên**. Đây là tính năng chính, là thứ làm app khác biệt.
>   **Người làm:** mới bắt đầu lập trình, vốn tối thiểu, làm part-time.
>   **Nền tảng:** Web app trước, mobile để sau.
>   **Cập nhật:** Tháng 6/2026.

---

## 1. Định vị: tại sao người Việt chọn app của bạn thay vì ELSA/Talkpal?

Thị trường đã có nhiều app, giá tham khảo:

| App                | Giá/tháng  | Điểm mạnh                | Điểm yếu (khe hở cho bạn)                                |
| ------------------ | ---------- | ------------------------ | -------------------------------------------------------- |
| **ELSA Speak**     | ~13 USD    | Chấm phát âm chi tiết    | Chỉ tập trung phát âm, không phải "gia sư" trò chuyện    |
| **Talkpal**        | ~6 USD     | Hội thoại AI rẻ          | Phản hồi chung chung, không giải thích bằng tiếng Việt   |
| **Speak**          | ~57–71 USD | Chất lượng cao           | Quá đắt với người Việt                                   |
| **Talkio / Loora** | ~10–11 USD | Hội thoại không giới hạn | Giao diện & nội dung tiếng Anh, không hợp người Việt mới |

**Lợi thế cạnh tranh (USP) của bạn — phải bám chặt:**

1. **Sửa lỗi & giải thích bằng GIỌNG tiếng Việt.** Không chỉ chữ — học viên _nghe_ AI giải thích lỗi bằng tiếng Việt. App quốc tế không làm được vì họ không có giọng Việt tự nhiên. Người mới rất cần điều này.
2. **Luyện nói song ngữ:** AI hội thoại bằng **giọng tiếng Anh** chuẩn, rồi chuyển sang **giọng tiếng Việt** để nhận xét. Học viên vừa luyện tai nghe Anh, vừa hiểu lỗi sâu bằng tiếng mẹ đẻ.
3. **Gộp 3 kỹ năng trong 1 app** (nói + viết + chat) — đối thủ thường chỉ mạnh 1 mảng.
4. **Giá hợp túi tiền Việt** (xem Phần 6) + thanh toán nội địa (chuyển khoản, ví điện tử).
5. **Tình huống & nội dung "rất Việt Nam"**: phỏng vấn xin việc ở công ty VN, thi IELTS, giao tiếp công sở, du học — sát nhu cầu thật.

> Khẩu hiệu định vị thử: _"Gia sư tiếng Anh AI — nói chuyện bằng tiếng Anh, sửa lỗi bằng giọng tiếng Việt. Luyện nói–viết mọi lúc, giá bằng một ly cà phê."_

### 1b. Chiều B — Dạy tiếng Việt cho người nước ngoài (qua tiếng Anh)

Cùng một bộ máy, chỉ **đảo vai hai ngôn ngữ**: AI hội thoại bằng **giọng tiếng Việt**, còn sửa lỗi & giải thích bằng **giọng tiếng Anh** (ngôn ngữ trung gian mà hầu hết người nước ngoài hiểu). Đây là ngách **ít đối thủ hơn nhiều** so với mảng học tiếng Anh.

- **Ai học?** Người nước ngoài sống/làm việc ở VN, vợ/chồng người Việt, người gốc Việt (Việt kiều) muốn lấy lại tiếng mẹ đẻ, dân du lịch dài ngày, nhân viên công ty đa quốc gia.
- **Khe hở thị trường:** app dạy tiếng Việt cho người nước ngoài rất ít và thường sơ sài. Lợi thế của bạn: **giải thích bằng giọng tiếng Anh tự nhiên + nội dung đời sống thật ở VN** (gọi món, mặc cả, grab, thủ tục, giao tiếp công sở).
- **Nội dung "rất Việt Nam" lúc này thành điểm cộng kép:** vừa hợp người Việt học Anh, vừa là thứ người nước ngoài cần khi học tiếng Việt.
- **Tận dụng lại gần như toàn bộ:** chỉ cần đổi prompt + đổi giọng TTS (đã có sẵn giọng Anh & giọng Việt), không phải xây lại từ đầu.

> Khẩu hiệu thử cho chiều B: _"Learn Vietnamese by talking. The AI speaks Vietnamese with you and explains your mistakes in clear English."_

---

## 2. Tính năng — chia theo phiên bản (đừng làm hết một lúc)

### MVP (làm trước — ra mắt trong ~6–8 tuần)

Bắt đầu bằng phần **dễ làm và rẻ nhất** để có sản phẩm sớm:

- **Chế độ Chat tổng hợp (chỉ text)** — gia sư AI trò chuyện theo tình huống, sửa lỗi ngay, giải thích bằng tiếng Việt.
- **Chế độ Luyện viết + chấm điểm** — dán đoạn văn / bài IELTS Writing → AI chấm theo tiêu chí, chỉ lỗi, gợi ý sửa, ước lượng band.
- Đăng nhập + giới hạn lượt dùng free + 1 gói trả phí.

> Lý do: cả hai chế độ trên **chỉ cần API text** (rẻ nhất, dễ làm nhất). Đây là nền móng — làm xong mới thêm giọng nói.

### v1 — Luyện nói song ngữ (tính năng chính, làm ngay sau MVP)

Đây là phần "ăn tiền" của app, nên ưu tiên cao chứ không để lâu:

- **Học viên bấm nói** → app ghi âm → **speech-to-text** chuyển thành chữ.
- **Gia sư AI trả lời bằng giọng tiếng Anh** (text-to-speech tiếng Anh) để học viên luyện nghe hội thoại tự nhiên.
- Nếu có lỗi: AI chuyển sang **giọng tiếng Việt** đọc phần nhận xét, sửa lỗi, giải thích vì sao sai — học viên _nghe_ được, không chỉ đọc.
- Trên màn hình hiển thị song song: câu thoại tiếng Anh (kèm phụ đề) + ô nhận xét tiếng Việt.
- Theo dõi tiến bộ: lưu lỗi hay mắc, từ vựng đã học, streak (chuỗi ngày học).

> **Vì sao tách giọng Anh và giọng Việt?** Hai giọng riêng nghe tự nhiên hơn nhiều so với một giọng đọc lẫn lộn hai thứ tiếng. Dùng **giọng Anh chuẩn** cho hội thoại + **giọng Việt tự nhiên** cho giải thích là điểm khác biệt mà đối thủ không có.

### v1b — Mở chiều "dạy tiếng Việt cho người nước ngoài"

Làm **sau khi chiều A (Việt học Anh) đã chạy ổn**, vì tận dụng lại gần hết hệ thống:

- Thêm **nút gạt ngôn ngữ**: "Tôi học tiếng Anh" ↔ "I'm learning Vietnamese".
- Đảo vai giọng nói: hội thoại **giọng Việt**, giải thích **giọng Anh** (xem prompt 5.5).
- Dịch giao diện sang tiếng Anh cho chiều B (chỉ phần khung; nội dung do AI sinh).
- Bộ tình huống riêng cho người nước ngoài: chợ/siêu thị, thuê nhà, grab/taxi, nhà hàng, gặp gia đình bạn đời, công sở VN.
- Có thể ra mắt chiều B như một "sản phẩm em" để test thị trường ngách trước khi đầu tư sâu.

### v2 (mở rộng)

- Chấm phát âm chi tiết (so sánh với giọng chuẩn), flashcard từ vựng tự sinh, lộ trình theo mục tiêu (IELTS 6.5, phỏng vấn, giao tiếp tiếng Việt cơ bản...), bản mobile.
- (Xa hơn) mở thêm cặp ngôn ngữ khác bằng đúng kiến trúc này (ví dụ Việt ⇄ Trung/Nhật/Hàn).

---

## 3. Kiến trúc kỹ thuật cho người mới

Bạn dùng công cụ no-code/vibe-coding, không cần tự code từ đầu.

```
[Người dùng - trình duyệt + micro/loa]
        │  (nói / gõ)
        ▼
[Web app dựng bằng Lovable]  ──►  [Supabase]  (đăng nhập, lưu user, lịch sử học, số lượt còn lại)
        │
        ├──► [API Text]   chat & chấm bài: Gemini Flash-Lite / Claude Haiku   ← rẻ
        │
        └──► (v1) Luồng giọng nói song ngữ:
                 1. Giọng học viên → chữ:  gpt-4o-mini-transcribe / Deepgram (STT, hỗ trợ tiếng Anh + Việt)
                 2. AI xử lý → sinh 2 phần: câu thoại EN  +  nhận xét VN
                 3. Chữ → giọng:
                      • Câu thoại tiếng Anh → TTS giọng ENGLISH (Google/Azure/ElevenLabs)
                      • Nhận xét tiếng Việt → TTS giọng VIETNAMESE (Azure Neural — giọng Việt tốt nhất)
        │
        ▼
[Cổng thanh toán]  (giai đoạn đầu: chuyển khoản tay; sau: PayOS/Casso hoặc Stripe)
        │
        ▼
[Deploy trên Vercel]  (miễn phí)
```

**Bộ công cụ (đều có gói free):** Lovable (dựng app) · Supabase (database + auth) · Vercel (deploy) · GitHub (lưu code).

**Mẹo cho giọng song ngữ:** AI trả về phần ngôn ngữ đích (hội thoại) và phần ngôn ngữ giải thích **tách riêng** (2 trường JSON, ví dụ `speech_target` và `feedback_native`), rồi app gọi TTS hai lần với hai giọng khác nhau. Đừng nhét cả hai thứ tiếng vào một lần đọc — sẽ nghe rất giả.

**Thiết kế hai chiều ngay từ đầu:** đặt một biến `direction` (ví dụ `vi_learns_en` hoặc `en_learns_vi`). Biến này quyết định: (1) prompt nào được dùng, (2) giọng nào đọc phần hội thoại, (3) giọng nào đọc phần giải thích. Nhờ vậy mở thêm chiều B chỉ là đổi cấu hình, không phải viết lại. Cặp giọng đảo nhau:

| Chiều học                     | Hội thoại (ngôn ngữ đích) | Giải thích (tiếng mẹ đẻ) |
| ----------------------------- | ------------------------- | ------------------------ |
| A — Việt học Anh              | giọng **English**         | giọng **tiếng Việt**     |
| B — Người nước ngoài học Việt | giọng **tiếng Việt**      | giọng **English**        |

**Thứ tự dựng:** auth + database → chế độ Chat → chế độ Viết → giới hạn lượt + thanh toán → **chế độ Luyện nói song ngữ (STT + TTS Anh + TTS Việt)**.

---

## 4. Chi phí API & bài toán không lỗ

**Giá tham khảo (cập nhật tháng 6/2026):**

| Loại              | Lựa chọn rẻ                       | Giá                                          |
| ----------------- | --------------------------------- | -------------------------------------------- |
| Text (LLM)        | Gemini 3.1 Flash-Lite             | ~0,10 USD vào / ~0,40 USD ra / 1 triệu token |
| Text (LLM)        | Claude Haiku 4.5                  | ~0,25 USD vào / ~1,25 USD ra / 1 triệu token |
| Text (LLM)        | GPT-4o-mini                       | ~0,15 USD vào / ~0,60 USD ra / 1 triệu token |
| Giọng → chữ (STT) | gpt-4o-mini-transcribe            | ~0,003 USD/phút                              |
| Giọng → chữ (STT) | gpt-4o-transcribe (chính xác hơn) | ~0,006 USD/phút                              |
| Giọng → chữ (STT) | Deepgram Nova (batch)             | ~0,26 USD/giờ (~0,0043 USD/phút)             |
| Chữ → giọng (TTS) | Google / Amazon (giọng standard)  | ~4 USD / 1 triệu ký tự                       |
| Chữ → giọng (TTS) | Azure / Google (giọng Neural)     | ~16 USD / 1 triệu ký tự                      |
| Chữ → giọng (TTS) | ElevenLabs (chất lượng cao)       | gói từ ~5 USD/tháng                          |

> **Giọng tiếng Việt nên dùng gì?** **Azure Neural** có giọng Việt tự nhiên nhất hiện nay (MyAn, Mai, Long, NamMinh… nhiều cảm xúc) và **tặng 500.000 ký tự/tháng miễn phí** cho giọng neural — đủ chạy thử thoải mái. Giọng tiếng Anh có thể dùng chính Azure để gọn một nhà cung cấp, hoặc ElevenLabs nếu muốn nghe "xịn" hơn.

**Ước tính chi phí 1 khách/tháng:**

- Chế độ text (chat + chấm bài): thường **dưới ~0,3–0,8 USD/tháng** nếu đặt giới hạn lượt hợp lý.
- Chế độ nói song ngữ: mỗi phút nói tốn ~0,003 USD STT + 2 lần TTS (Anh + Việt). Phần nhận xét tiếng Việt thường ngắn (vài trăm ký tự) nên rẻ. Ước ~vài cent/phút → **60 phút nói/tháng ≈ ~0,3–0,6 USD.**
- **Tổng vốn 1 khách "vừa phải": ~0,6–1,5 USD/tháng.**

**Quy tắc vàng để lãi:**

1. **Đặt giới hạn lượt theo gói** (ví dụ Free: 10 tin nhắn/ngày, không có giọng nói; Pro: 60 phút nói/tháng). Chống "phá API".
2. **Bán cao hơn vốn ít nhất 4–6 lần.** Vốn ~1 USD → bán ~5 USD trở lên.
3. **Giọng tiếng Việt giải thích nên ngắn gọn** — vừa hay về sư phạm, vừa tiết kiệm ký tự TTS.
4. Bật **prompt caching** (giảm ~10× phần lặp) và **Batch API** (giảm ~50% cho việc chấm bài không cần ngay).
5. **Cache câu thoại TTS hay lặp lại** (lời chào, câu mẫu) để khỏi gọi TTS nhiều lần cho cùng một câu.
6. Dùng model rẻ trước; chỉ nâng cấp khi khách thật sự chê chất lượng.

---

## 5. Bí quyết ăn tiền: bộ prompt mẫu (đây là "linh hồn" sản phẩm)

Giá trị của bạn nằm ở **prompt được thiết kế tốt** cho người Việt — copy ChatGPT chung chung sẽ thua. Dưới đây là các prompt nền để bạn nhúng vào app (chỉnh sửa thêm khi test).

### 5.1 Prompt — Chế độ Luyện nói song ngữ (gia sư trò chuyện) ⭐

```
Bạn là gia sư tiếng Anh thân thiện cho người Việt, trình độ học viên: {level}.
Tình huống đóng vai: {situation}  (ví dụ: phỏng vấn xin việc, gọi món ở nhà hàng, du lịch).

QUY TẮC:
1. Nói chuyện tự nhiên bằng tiếng Anh, câu vừa với trình độ {level}, không quá khó.
2. Sau MỖI câu trả lời của học viên, nếu có lỗi (ngữ pháp/từ vựng/cách diễn đạt):
   - Nhẹ nhàng chỉ ra lỗi.
   - Viết lại câu đúng.
   - Giải thích NGẮN GỌN bằng TIẾNG VIỆT vì sao sai.
   Nếu không có lỗi: khen ngắn và tiếp tục hội thoại.
3. Luôn hỏi tiếp một câu để duy trì hội thoại.

QUAN TRỌNG — TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON để app đọc giọng đúng tiếng:
{
  "speech_en": "<câu thoại tiếng Anh của bạn — phần này sẽ được ĐỌC BẰNG GIỌNG ANH>",
  "feedback_vi": "<nhận xét/sửa lỗi bằng tiếng Việt — phần này sẽ được ĐỌC BẰNG GIỌNG VIỆT. Để trống nếu không có lỗi>",
  "corrected_en": "<câu đúng tiếng Anh, nếu có sửa>"
}

Bắt đầu bằng một câu mở đầu phù hợp tình huống (chỉ điền speech_en, feedback_vi để trống).
```

> App sẽ đọc `speech_en` bằng **giọng tiếng Anh**, đọc `feedback_vi` bằng **giọng tiếng Việt**. Đây là cốt lõi của trải nghiệm song ngữ.

### 5.2 Prompt — Chế độ Chat (chỉ text, dùng cho MVP)

```
Bạn là gia sư tiếng Anh thân thiện cho người Việt, trình độ học viên: {level}.
Trò chuyện tự nhiên bằng tiếng Anh theo tình huống {situation}.
Sau mỗi câu của học viên, nếu có lỗi: chỉ lỗi → viết lại câu đúng → giải thích NGẮN GỌN bằng TIẾNG VIỆT.
Nếu không có lỗi: khen ngắn và hỏi tiếp một câu.
Trình bày:
   💬 [câu thoại tiếng Anh của bạn]
   ✅ Nhận xét: [tiếng Việt, chỉ khi có lỗi]
```

### 5.3 Prompt — Chế độ Luyện viết + chấm điểm (kiểu IELTS)

```
Bạn là giám khảo IELTS Writing giàu kinh nghiệm, chấm bài cho người Việt.
Đề bài: {prompt}
Bài viết của học viên: {essay}

Hãy trả về:
1. ƯỚC LƯỢNG BAND (0–9) theo 4 tiêu chí: Task Response, Coherence & Cohesion,
   Lexical Resource, Grammatical Range & Accuracy. Cho điểm từng tiêu chí + điểm tổng.
2. 3–5 LỖI QUAN TRỌNG NHẤT: trích câu sai → sửa lại → giải thích bằng TIẾNG VIỆT.
3. 3 GỢI Ý NÂNG BAND cụ thể (tiếng Việt).
4. 1 ĐOẠN VIẾT MẪU ngắn cho thấy cách diễn đạt tốt hơn.
Giọng điệu: khích lệ, xây dựng. Không chê bai.
```

### 5.5 Prompt — Luyện nói song ngữ, CHIỀU B (người nước ngoài học tiếng Việt) ⭐

```
You are a friendly Vietnamese tutor for a foreigner. Learner level: {level}.
Role-play situation: {situation} (e.g. ordering food, renting a room, taking a Grab, meeting your partner's family).

RULES:
1. Speak naturally in VIETNAMESE, with sentences suitable for level {level} (not too hard).
2. After EACH learner reply, if there is a mistake (grammar / vocabulary / tone / word order):
   - Gently point it out.
   - Give the corrected Vietnamese sentence.
   - Explain BRIEFLY in ENGLISH why it was wrong.
   If there is no mistake: praise briefly and continue.
3. Always ask one follow-up question to keep the conversation going.

IMPORTANT — return EXACTLY this JSON so the app reads each part in the right voice:
{
  "speech_target": "<your Vietnamese line — READ ALOUD WITH THE VIETNAMESE VOICE>",
  "feedback_native": "<correction/explanation in English — READ ALOUD WITH THE ENGLISH VOICE. Leave empty if no mistake>",
  "corrected_target": "<the corrected Vietnamese sentence, if any>",
  "romanization": "<optional: the Vietnamese line in simple phonetic hint for beginners>"
}

Start with an opening line that fits the situation (fill only speech_target; leave feedback_native empty).
```

> Đây chính là **prompt 5.1 đảo chiều**: ngôn ngữ hội thoại = tiếng Việt, ngôn ngữ giải thích = tiếng Anh. App đọc `speech_target` bằng **giọng Việt** và `feedback_native` bằng **giọng Anh**. Có thêm trường `romanization` giúp người mới chưa quen chữ Việt.

### 5.4 Prompt — Tạo bài tập từ vựng/ngữ pháp

```
Tạo {n} câu bài tập {dạng: điền từ / chọn đáp án / dịch} cho người Việt học tiếng Anh,
chủ đề {topic}, trình độ {level}.
Mỗi câu kèm đáp án và giải thích ngắn bằng tiếng Việt (ẩn đáp án cho tới khi học viên trả lời).
```

> **Mẹo:** giữ bộ prompt này là tài sản bí mật, liên tục tinh chỉnh theo phản hồi khách. Đây mới là thứ giữ chân người dùng, không phải model.

---

## 6. Định giá & thu tiền cho thị trường Việt Nam

Đối thủ quốc tế ~6–13 USD/tháng. Bạn định giá **hợp túi tiền Việt + nhấn mạnh "rẻ hơn gia sư thật"** (gia sư người thật 150k–500k/buổi).

| Gói                     | Giá gợi ý    | Bao gồm                                                                      | Mục đích                      |
| ----------------------- | ------------ | ---------------------------------------------------------------------------- | ----------------------------- |
| **Free**                | 0đ           | 10 tin nhắn chat/ngày, 1 bài chấm viết/ngày (chưa có giọng nói)              | Kéo người dùng, cho nếm thử   |
| **Pro tháng**           | ~99k đ/tháng | Chat không giới hạn, 30 bài viết/tháng, **60 phút luyện nói song ngữ/tháng** | Doanh thu chính               |
| **Pro năm**             | ~799k đ/năm  | Như Pro + giảm giá                                                           | Thu tiền trước, giữ khách lâu |
| **Combo lớp/trung tâm** | thỏa thuận   | Bán cho trung tâm tiếng Anh, gia sư                                          | Khách sỉ, doanh thu lớn       |

**Lưu ý định giá khi có giọng nói:** giọng nói là tính năng "wow" → để **chỉ gói Pro mới có**. Đây là động lực chính khiến khách nâng cấp từ Free lên Pro.

**Thu tiền (theo giai đoạn):**

- **Đầu (vốn 0):** khách chuyển khoản → bạn kích hoạt tài khoản tay. Đủ để bắt đầu.
- **Khi có khách đều:** tích hợp **PayOS / Casso** (tự động xác nhận chuyển khoản VN) hoặc **Stripe** (nếu có khách quốc tế).

**Mô hình subscription rất hợp ngách này** vì học là việc lặp lại → doanh thu định kỳ ổn định.

---

## 7. Lộ trình build (cụ thể từng tuần)

### Giai đoạn 1 — MVP text (Tuần 1–6)

- **T1:** Lập tài khoản Lovable/Supabase/Vercel/GitHub. Lấy API key Gemini Flash-Lite hoặc Claude Haiku. Học nhanh khái niệm gọi API.
- **T2:** Dựng khung app + đăng nhập (Supabase). Một màn hình chọn chế độ.
- **T3:** Làm **chế độ Chat** (prompt 5.2). Test cho ra hội thoại + sửa lỗi tiếng Việt mượt.
- **T4:** Làm **chế độ Luyện viết** (prompt 5.3). Hiển thị band + lỗi đẹp mắt.
- **T5:** Thêm giới hạn lượt dùng (Free vs Pro) + đếm lượt trong Supabase.
- **T6:** Deploy lên Vercel. Thu tiền thủ công. **Mục tiêu: mời 20 người học thử.**

### Giai đoạn 2 — Luyện nói song ngữ (Tuần 7–11) ⭐

- **T7:** Sửa theo phản hồi MVP, tinh chỉnh prompt.
- **T8:** Lấy API key STT (gpt-4o-mini-transcribe) + TTS (Azure — bật giọng Việt + giọng Anh). Test riêng từng phần: thu âm → ra chữ; chữ → ra giọng đúng tiếng.
- **T9:** Ghép luồng: nói → STT → AI trả JSON `speech_en` + `feedback_vi` (prompt 5.1) → đọc 2 giọng. Làm giao diện nút "bấm để nói".
- **T10:** Hoàn thiện trải nghiệm: phụ đề, lịch sử hội thoại, đặt giới hạn phút nói cho gói Pro.
- **T11:** Đẩy marketing (Phần 8). **Mục tiêu: khách trả tiền đầu tiên nhờ tính năng giọng nói.**

### Giai đoạn 3 — Tăng trưởng & mở chiều B (Tuần 12+)

- Thêm theo dõi tiến bộ, streak, chấm phát âm. Tích hợp thanh toán tự động (PayOS). Tiếp cận trung tâm/gia sư để bán sỉ.
- **Mở chiều B (dạy tiếng Việt cho người nước ngoài):** thêm nút gạt ngôn ngữ + prompt 5.5 + đảo giọng. Vì tận dụng lại hệ thống nên chi phí mở thêm rất thấp — đáng làm để chạm tới ngách ít đối thủ. Marketing chiều B bằng tiếng Anh trên các kênh expat/Việt kiều (xem Phần 8).

> **Mốc thực tế:** khách trả tiền đầu tiên thường trong 2–6 tuần sau ra mắt; 500–2.000 USD/tháng sau 2–4 tháng làm đều.

---

## 8. Marketing không tốn tiền (đúng cho ngách học tiếng Anh)

1. **TikTok/Reels** — quay màn hình: "học viên nói sai bằng tiếng Anh → AI sửa + **giải thích bằng giọng tiếng Việt**". Demo giọng nói song ngữ rất dễ viral ở VN.
2. **Group Facebook** học tiếng Anh / IELTS / TOEIC — tham gia giúp đỡ thật, tặng tài khoản dùng thử, lâu lâu nhắc app.
3. **Hợp tác micro-influencer** mảng học tiếng Anh: tặng tài khoản đổi lấy review.
4. **Build in public**: kể hành trình làm app → tạo cộng đồng người ủng hộ thành khách đầu.
5. **Nội dung miễn phí dẫn dắt**: đăng "mẫu câu phỏng vấn tiếng Anh", "sửa 5 lỗi người Việt hay mắc" → cuối bài dẫn về app.
6. **Tặng dùng thử cho gia sư/trung tâm nhỏ** → họ giới thiệu học viên (kênh bán sỉ).

**Kênh riêng cho chiều B (người nước ngoài học tiếng Việt) — bằng tiếng Anh:**

7. Group/subreddit/Facebook expat ở VN (r/VietNam, "Expats in Hanoi/Saigon", hội vợ chồng đa quốc gia), cộng đồng Việt kiều — đăng mẹo học tiếng Việt + demo app.
8. Nội dung tiếng Anh "Survival Vietnamese": video ngắn "1 câu tiếng Việt mỗi ngày", AI sửa phát âm/giải thích bằng tiếng Anh — dễ lan trong cộng đồng người nước ngoài.
9. Hợp tác trung tâm/giáo viên dạy tiếng Việt cho người nước ngoài, công ty có nhân sự nước ngoài tại VN.

---

## 9. Rủi ro & cách xử lý

| Rủi ro                          | Cách giảm                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Chi phí API vượt doanh thu      | Đặt giới hạn lượt chặt, dùng model rẻ, prompt caching, cache TTS, bán cao hơn vốn 4–6 lần                   |
| Đối thủ lớn (ELSA, Talkpal)     | Bám USP: **giọng tiếng Việt giải thích** + giá rẻ + nội dung Việt + gộp 3 kỹ năng                           |
| Giọng nói khó làm / nghe giả    | Tách riêng giọng Anh & giọng Việt; dùng Azure Neural (giọng Việt tốt); ra mắt text trước rồi mới thêm giọng |
| Độ trễ khi nói (chờ STT→AI→TTS) | Stream câu trả lời, đọc giọng ngay khi có; cache câu mẫu hay lặp                                            |
| Khách dùng thử rồi bỏ           | Thêm streak, theo dõi tiến bộ, nhắc học qua email/thông báo                                                 |
| Phụ thuộc 1 nhà cung cấp API    | Thiết kế để dễ đổi giữa Gemini/Claude/OpenAI và giữa Azure/Google/ElevenLabs khi giá thay đổi               |

---

## 10. Việc làm NGAY tuần này

1. Lập tài khoản **Lovable, Supabase, Vercel, GitHub** (free).
2. Lấy **API key** Gemini Flash-Lite hoặc Claude Haiku, gọi thử 1 lần.
3. Lập tài khoản **Azure Speech** (free 500k ký tự/tháng), nghe thử **giọng Việt** (MyAn, Mai) và một **giọng Anh** để cảm nhận chất lượng.
4. Mở ChatGPT/Claude, dán **prompt 5.1 và 5.3**, test thử và chỉnh cho hợp.
5. Vào **3 group Facebook học tiếng Anh/IELTS**, ghi lại 5 điều học viên hay than phiền.
6. Trong Lovable, gõ mô tả app đầu tiên: _"Web app gia sư tiếng Anh cho người Việt, có chế độ chat sửa lỗi và chế độ chấm bài viết, đăng nhập bằng email."_ → xem nó dựng ra gì.

---

## Nguồn tham khảo

- [Best AI English Tutor Apps in 2026 — Practice Me](https://practiceme.app/blog/best-ai-english-tutor-apps)
- [Best AI Language Speaking Practice Apps in 2026 — Talkio AI](https://www.talkio.ai/blog/best-ai-language-speaking-practice-apps-in-2026)
- [Speech-to-Text APIs in 2026: Benchmarks & Pricing — Future AGI](https://futureagi.com/blog/speech-to-text-apis-in-2026-benchmarks-pricing-developer-s-decision-guide/)
- [OpenAI Whisper / GPT-4o Transcribe Pricing 2026 — DIYAI](https://diyai.io/ai-tools/speech-to-text/openai-whisper-api-pricing-2026/)
- [Deepgram Pricing 2026 — DIYAI](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/)
- [Best Text to Speech APIs 2026 — Deepgram](https://deepgram.com/learn/best-text-to-speech-apis-2026)
- [Google vs Azure vs ElevenLabs TTS 2026 (giọng Việt)](https://ttsforfree.com/en/blogs/google-vs-azure-vs-elevenlabs-tts-comparison/)
- [Vietnamese Text to Speech & AI Voices — ElevenLabs](https://elevenlabs.io/text-to-speech/vietnamese)
- [AI API Pricing Comparison (June 2026) — DevTk.AI](https://devtk.ai/en/blog/ai-api-pricing-comparison-2026/)
- [AI API Pricing Comparison (2026) — IntuitionLabs](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude)
- [Best AI App Builder 2026: Lovable vs Bolt vs v0 — Mocha](https://getmocha.com/blog/best-ai-app-builder-2026)
