# Đặc tả nghiên cứu: Nâng cấp Avatar AI lên 3D chất lượng cao

> Trạng thái: **NGHIÊN CỨU — chưa triển khai.** Tài liệu này nối tiếp
> `dac-ta-avatar-ai-noi-chuyen-2026-07-28.md` (bản 2D đã triển khai). Không có code tính năng
> nào đi kèm.
> Yêu cầu người dùng (2026-07-30): _"tạo AI tutor 3D đẹp để nói chuyện với người dùng trên đt"_,
> ưu tiên **chất lượng cao nhất có thể** (không tối ưu rẻ/nhẹ trước).

## 1. Hiện trạng đã có trong repo (đọc code thật, không phỏng đoán)

| Thành phần                                             | Hiện trạng                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `src/components/AvatarSpeaking.tsx`                    | Avatar **2D SVG robot** vẽ tay, miệng là "thanh LED" đổi rộng/cao theo viseme. 136 dòng.                                 |
| `src/lib/viseme.ts`                                    | 5 viseme (`PP/FF/AA/OO/REST`). Timing **chia đều** thời lượng audio theo số phoneme/âm tiết.                             |
| `api/avatar-visemes.ts` + `api/_lib/espeakPhonemes.ts` | Lấy chuỗi phoneme thật bằng eSpeak-ng trên VPS — nhưng **không có mốc thời gian**.                                       |
| `api/tts.ts`                                           | Google TTS Chirp3-HD (`googleTts.ts`, REST v1) + Studio + **ElevenLabs** (`elevenLabsTts.ts`). Cache mã hoá AES-256-GCM. |
| `src/pages/AvatarDemo.tsx`                             | Trang demo đang dùng avatar 2D.                                                                                          |

**Điểm nghẽn chất lượng số 1 không phải là 2D-hay-3D, mà là TIMING.** Miệng hiện chia đều theo
âm tiết nên luôn "trôi" so với giọng thật. Dựng 3D đẹp mà giữ timing chia đều thì trông **tệ hơn**
2D hiện tại — vì mắt người soi khẩu hình 3D khắt khe hơn nhiều (hiệu ứng uncanny valley).

→ **Thứ tự bắt buộc: sửa timing trước, dựng 3D sau.**

## 2. Lớp 1 — Timing chính xác (bắt buộc, làm trước)

### 2.1. ElevenLabs `with-timestamps` — đường chất lượng cao nhất

Dự án **đã tích hợp ElevenLabs** (`api/_lib/elevenLabsTts.ts` gọi
`POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`). ElevenLabs có endpoint song song
`POST /v1/text-to-speech/{voice_id}/with-timestamps` trả về **audio + alignment từng KÝ TỰ**
(`characters`, `character_start_times_seconds`, `character_end_times_seconds`).

Đây là timing **thật từ chính model đã sinh ra audio** — chính xác nhất có thể, không phải ước lượng.

- Thay đổi cần thiết: đổi URL + đọc thêm trường alignment; audio trả về là base64 trong JSON
  (thay vì binary) → chỉnh chỗ nhận response, phần mã hoá/lưu cache **giữ nguyên**.
- Lưu timeline vào cache cùng audio: thêm cột `viseme_timeline JSONB` vào bảng `tts_cache`
  (migration mới) — tính 1 lần, dùng mãi, **không tốn thêm tiền API**.
- Chi phí: ElevenLabs tính theo ký tự, endpoint timestamps **không tính thêm phí** so với endpoint
  thường (cùng 1 lần synthesize). Cần xác nhận lại trên trang pricing lúc triển khai.

### 2.2. Google Chirp3-HD — không có timing thật

Chirp3-HD **không hỗ trợ SSML** nên không dùng được `enableTimePointing`/`SSML_MARK`
(v1beta1). Hai lựa chọn:

- **B1 (khuyên dùng):** forced alignment sau khi có audio — chạy trên chính file audio đã sinh,
  cho mốc thời gian thật cho mọi provider. Có thể dùng ElevenLabs **Forced Alignment API**
  (nhận audio + text → timestamps) hoặc chạy offline. Ưu điểm: một cơ chế dùng chung cho **cả
  Google lẫn ElevenLabs**, và áp được cho audio đã cache từ trước.
- **B2:** đổi giọng mặc định của chế độ 3D sang ElevenLabs (đã có sẵn cơ chế `voiceAccess.ts`
  phân giọng theo gói) và chấp nhận Google chỉ chạy avatar 2D như hiện tại.

**Quyết định cần bạn chốt** (xem mục 7).

### 2.3. Nâng bộ viseme 5 → 15

> ⚠️ **Cập nhật sau khi chốt phong cách robot (mục 3.2.1):** vì miệng là dải LED chứ không phải
> môi, bộ 15 viseme **không còn bắt buộc**. Bộ 5 hiện tại + timing thật đã đủ điều khiển cường độ
> dải sáng. Giữ mục này như bước **tuỳ chọn**, chỉ làm nếu sau này đổi sang avatar có môi thật.

Bộ 5 viseme hiện tại quá thô cho 3D. Chuẩn nên dùng: **Oculus/OVR 15 viseme**
(`sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, I, O, U`) — đây cũng chính là bộ mà
Ready Player Me nhúng sẵn trong blendshape của avatar, nên map 1-1 không cần tự chế.

- Bảng tra `phoneme (IPA từ eSpeak-ng) → viseme OVR`: file JSON tĩnh, **tách riêng EN và VI**
  theo `lib/direction.ts` (tiếng Việt có âm cuối tắc /p t k/ và nguyên âm đôi khác tiếng Anh).
- Giữ nguyên `api/_lib/espeakPhonemes.ts` (đã có phoneme thật) — chỉ đổi bảng map và **gắn mốc
  thời gian thật từ lớp 2.1/2.2** thay vì chia đều.

## 3. Lớp 2 — Render 3D

### 3.1. Thư viện (phiên bản ổn định hiện hành, đã kiểm 2026-07-30)

| Gói                  | Bản chọn                         | Ghi chú                                                                                          |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `three`              | r18x (mới nhất r184, 16/04/2026) | Ổn định. **Không** dùng WebGPURenderer ở đợt đầu — hỗ trợ mobile chưa đồng đều.                  |
| `@react-three/fiber` | **v8.x**                         | ⚠️ **BẮT BUỘC v8** — v9 yêu cầu React 19. Dự án đang React 18 và CLAUDE.md mục 6 cấm nâng React. |
| `@react-three/drei`  | v9.x                             | Bản đi kèm R3F v8.                                                                               |
| `@pixiv/three-vrm`   | v3.5.x                           | Chỉ cần nếu chọn hướng avatar VRM.                                                               |

Rủi ro đã lường: R3F v8 là nhánh bảo trì. Đây là **cái giá bắt buộc** của việc giữ React 18 —
nếu sau này nâng React 19 thì mới lên R3F v9. Cần ghi vào `PROGRESS.md` mục nợ kỹ thuật.

### 3.2. Phong cách chốt: ROBOT hình người, khung nửa thân trên

Người dùng đã gửi ảnh tham chiếu (2026-07-30): robot nữ hình người, vỏ kim loại trắng/xám, sợi
carbon đen, **đường viền phát sáng xanh (emissive)**, khung cắt ngang hông, nền xám trơn.

**Đánh giá trung thực:** ảnh đó là render offline/AI-generated tĩnh, KHÔNG phải khung hình
real-time. Chạy y hệt trên điện thoại là không thể. Nhưng đạt ~80–85% cảm giác thị giác đó trong
WebGL mobile là khả thi, và phong cách robot làm việc này DỄ HƠN avatar người thật rất nhiều:

- Không có da / tóc / mắt ướt → bỏ được 3 thứ đắt nhất và dễ rơi vào uncanny valley nhất.
  Kim loại + nhựa + emissive là nhóm vật liệu PBR rẻ và dễ đẹp nhất.
- Khung **bust (nửa thân trên)** trên màn dọc điện thoại → dồn ngân sách đa giác/texture vào
  mặt + vai, nơi người dùng thật sự nhìn.
- Viền phát sáng gần như miễn phí về GPU (emissive, không cần đèn thật) nhưng tạo ấn tượng
  "cao cấp" mạnh nhất trong ảnh — và **đổi màu theo 4 theme** qua biến `--a-*` được.

### 3.2.1. Hệ quả LỚN: bỏ được bài toán blendshape khẩu hình

Robot không có môi. Miệng làm bằng **dải LED / visor emissive phản ứng theo giọng nói** — đúng
ngôn ngữ thị giác của avatar 2D đang chạy, nhưng ở dạng 3D. Nghĩa là:

- KHÔNG cần model có 15 blendshape viseme (rất hiếm và đắt với model robot) → mở rộng mạnh
  nguồn model mua được.
- KHÔNG cần rig mặt.
- Lớp timing chính xác ở mục 2 **vẫn giữ nguyên giá trị** — nó điều khiển cường độ/độ rộng/số
  đoạn của dải sáng thay vì hình miệng.
- Rủi ro triển khai giảm mạnh, chất lượng cảm nhận lại cao hơn: không ai soi độ khớp môi của robot.

Đánh đổi: mất biểu cảm khuôn mặt. Bù bằng (a) đầu nghiêng/gật, (b) mắt đổi màu + cường độ theo
cảm xúc câu trả lời (mục 3.3), (c) cử động tay idle — ảnh tham chiếu có tư thế tay rất hợp.

### 3.2.2. Nguồn model (KHÔNG tự có — cần quyết định chi phí)

| Đường                                       | Chi phí        | Ghi chú                                                              |
| ------------------------------------------- | -------------- | -------------------------------------------------------------------- |
| Mua model robot rigged (Sketchfab/CGTrader) | ~$30–150       | Nhanh nhất. **Phải kiểm giấy phép thương mại** — app có bán Pro/VIP. |
| Thuê 3D artist làm riêng                    | ~$300–1500     | Đúng nhận diện thương hiệu, bản quyền trọn.                          |
| Model miễn phí + chỉnh trong Blender        | 0đ + nhiều giờ | Khó đạt mức ảnh tham chiếu.                                          |

**Bắt buộc tối ưu lại sau khi có model:** giảm đa giác (mục tiêu ~50–80k tris cho bust), gộp
material, nén Draco + texture KTX2 → GLB ≤ 3MB. Model mua về thường 50–200MB; dùng thẳng là
màn hình trắng trên điện thoại.

### 3.2.3. Hai hướng ĐÃ LOẠI (lưu lại lý do)

- **Ready Player Me** (người thật, 52 blendshape ARKit + 15 viseme Oculus): loại vì người dùng
  chọn phong cách robot; avatar người thật còn kéo theo chi phí da/tóc và rủi ro uncanny valley.
- **VRM / VRoid** (anime): loại vì lệch phong cách ảnh tham chiếu; chỉ có 5 viseme chuẩn VRM.

Hai hướng này chỉ nên xét lại nếu sau PoC quyết định đổi hẳn phong cách nhân vật.

### 3.3. Ba thứ quyết định "đẹp" hơn cả model

1. **Ánh sáng:** HDRI environment (`drei/Environment`) + key light — ăn đứt directional light thô.
   Nâng cao: baked lighting để khỏi tốn GPU trên mobile.
2. **Idle animation:** hô hấp nhẹ, chớp mắt ngẫu nhiên 3–6s, đầu vi chuyển động, mắt nhìn theo
   camera (`lookAt`). Thiếu 4 thứ này thì model đẹp mấy cũng như tượng.
3. **Co-articulation:** làm mượt chuyển tiếp giữa 2 viseme (lerp ~60–80ms) thay vì nhảy giật —
   đây là khác biệt lớn nhất giữa lip-sync "nghiệp dư" và "chuyên nghiệp".

Nâng cao (đợt sau, nếu cần): điều khiển blendshape cảm xúc theo **nội dung câu trả lời AI** —
prompt trong `src/prompts/` trả kèm một nhãn cảm xúc (`neutral | happy | encouraging | thinking`),
frontend map sang biểu cảm. Rất rẻ (chỉ vài token) và tăng cảm giác "gia sư thật" nhiều nhất.

## 4. Ràng buộc mobile (đối tượng chính của app)

Đây là chỗ "chất lượng cao nhất" phải thoả hiệp với thực tế máy Android tầm trung ở VN:

- Bundle: three + R3F + drei ≈ **600–700KB gzip**. **Bắt buộc** `React.lazy` + dynamic import,
  chỉ tải khi vào màn có avatar. Ngân sách bundle-size trong CI sẽ đỏ nếu không tách chunk →
  phải cập nhật cấu hình budget cho chunk riêng này.
- Model GLB **≤ 3MB**: nén Draco/meshopt + texture KTX2.
- `dpr={[1, 1.5]}`, khoá 30fps, **không post-processing, không shadow map động** — nếu không máy
  sẽ nóng và tụt pin thấy rõ trong 1 phiên học 15 phút.
- **Bắt buộc có công tắc tắt 3D** → fallback về avatar 2D SVG **đang có** (đây là lợi thế lớn:
  fallback đã tồn tại và đã chạy tốt). Tự tắt khi `prefers-reduced-motion` (mục 5 a11y CLAUDE.md).
- **Rủi ro lớn nhất chưa kiểm chứng:** WebGL chạy song song với `MediaRecorder` (đang ghi âm ở
  chế độ Luyện nói) trên **iOS Safari**. Phải test trên iPhone thật ở PoC, trước khi làm tiếp.

## 5. Phạm vi đề xuất (chia nhỏ theo mục 3 CLAUDE.md)

| Bước | Nội dung                                                                                                    | Rủi ro  | Có giá trị kể cả khi dừng ở đây                 |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| 1    | Timing thật (ElevenLabs `with-timestamps` + cột `viseme_timeline` + migration)                              | Thấp    | ✅ Avatar 2D **hiện tại** khớp miệng chuẩn ngay |
| 2    | _(tuỳ chọn, xem 2.3)_ Nâng 5 → 15 viseme OVR — **bỏ được** nếu giữ phong cách robot LED                     | Thấp    | ✅ 2D mượt hơn                                  |
| 3    | PoC 3D trên `/avatar-demo` (đã có sẵn trang này) — đo FPS/pin/bundle trên **điện thoại thật, có cả iPhone** | **Cao** | ⚠️ Cổng quyết định go/no-go                     |
| 4    | Tích hợp vào Chat + Luyện nói, công tắc bật/tắt 3D, fallback 2D                                             | Trung   |                                                 |
| 5    | (Tuỳ chọn) Biểu cảm theo cảm xúc câu trả lời AI                                                             | Thấp    |                                                 |

Bước 1–2 là **thắng lợi chắc chắn**, không phụ thuộc quyết định 3D. Bước 3 là cổng thật sự.

## 6. Việc KHÔNG làm

- Không sinh video AI mỗi câu (HeyGen/D-ID/Wav2Lip) — đã loại ở đặc tả 28/07 vì băng thông,
  chi phí GPU và độ trễ; kết luận đó vẫn đúng và không thay đổi.
- Không nâng React/TS/Tailwind để lấy R3F v9 (CLAUDE.md mục 6).
- Không dùng WebGPURenderer ở đợt đầu.

## 7. Câu cần bạn quyết trước khi mở việc triển khai

1. **Ngân sách model 3D** (mục 3.2.2): mua ~$30–150, thuê artist ~$300–1500, hay tự chỉnh model
   miễn phí? Đây là chặn cứng — không có model thì không có bước 3.
2. **Provider giọng cho chế độ 3D:** ElevenLabs (timing thật, chất lượng cao nhất, đắt hơn) hay
   giữ Google Chirp3-HD + forced alignment (rẻ hơn, thêm 1 lượt xử lý)?
3. **Ưu tiên:** làm ngay, hay xếp sau các nợ kỹ thuật đang mở ở CLAUDE.md mục 13?

Trong lúc chờ 1&2, **bước 1 ở mục 5 (timing thật) chạy được ngay** và cải thiện avatar 2D đang
có — không phụ thuộc quyết định nào ở trên.

## 8. Đánh giá combo "Unity + Ready Player Me + Oculus Lipsync + Convai/Inworld"

Người dùng đề xuất combo này (2026-07-30) như "công thức hoàn hảo nhất hiện nay". Nhận định đó
**đúng — nhưng cho bối cảnh làm MOBILE APP NATIVE TỪ ĐẦU.** Dự án này là **web app React 18 +
Vite, deploy VPS, dùng như PWA trên điện thoại**. Đánh giá từng thành phần:

### 8.1. Unity — ❌ KHÔNG áp dụng

| Vấn đề                 | Chi tiết                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Không tái dùng được gì | Toàn bộ UI (chat, lộ trình CEFR, SRS, thanh toán SePay, 4 theme, auth Bearer token, i18n) là React/DOM. Unity không dùng lại được dòng nào.                                    |
| Hai đường đi           | Build native → phải viết lại app + qua App Store/CH Play, mất luôn ưu thế "vào web là học ngay". Build Unity **WebGL** → gói build 15–40MB, nuốt chửng ngân sách LCP hiện tại. |
| WebGL trên di động     | Unity Web nay có chạy trên iOS Safari (WebGL 2.0 từ iOS 15), nhưng vẫn nặng hơn nhiều so với three.js thuần, và khó nhúng chung DOM với UI React sẵn có.                       |
| Chi phí thật           | Đây là **viết lại sản phẩm**, không phải thêm tính năng — vi phạm mục 12 CLAUDE.md (breaking change diện rộng).                                                                |

→ **Tương đương trên web: three.js + React Three Fiber v8** (đã đặc tả ở mục 3.1). Cùng làm được
việc avatar 3D, nhúng thẳng vào React hiện có, không đụng phần còn lại của app.

### 8.2. Ready Player Me — ✅ ÁP DỤNG ĐƯỢC (nhưng lệch phong cách đã chốt)

RPM **không phải công nghệ riêng của Unity** — có SDK web chính chủ `@readyplayerme/visage`,
xây trên đúng stack đã chọn: three.js + react-three-fiber + drei. Avatar xuất GLB, kèm sẵn
blendshape ARKit + viseme Oculus.

- **Ưu:** bỏ được toàn bộ khâu tìm/mua/rig model ở mục 3.2.2 — tiết kiệm $30–1500 và 1–3 ngày Blender.
- **Vướng 1:** RPM là avatar **người thật**, trong khi mục 3.2 đã chốt phong cách **robot** theo
  ảnh tham chiếu người dùng gửi. Hai thứ loại trừ nhau → **cần chọn lại** (xem mục 9).
- **Vướng 2:** dùng thương mại phải **đăng ký partner** với RPM (app có bán gói Pro/VIP). Việc tay,
  phải làm trước khi triển khai.

### 8.3. Oculus Lipsync — ⚠️ ÁP DỤNG MỘT PHẦN

Phải tách hai thứ hay bị gộp làm một:

- **Plugin OVRLipSync (Unity/native): ❌** — không có bản chạy trên web.
- **Bộ 15 viseme chuẩn Oculus (`sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, I, O, U`): ✅** —
  đây là **chuẩn dữ liệu**, không phụ thuộc Unity. Đúng bộ mà mục 2.3 đã đề xuất và đúng bộ mà
  avatar RPM nhúng sẵn.

Quan trọng: cách OVRLipSync sinh viseme là **phân tích biên độ audio thời gian thực** — tức là
**đoán**. Cách của dự án (timestamp thật từ ElevenLabs, mục 2.1) **chính xác hơn**, vì lấy mốc
thời gian từ chính model đã sinh ra audio. Không cần thay thế bằng OVRLipSync.

### 8.4. Convai / Inworld — ❌ KHÔNG, và đây là cái "không" mạnh nhất

Convai/Inworld là nền tảng **NPC hội thoại trọn gói**: LLM + STT + TTS + lipsync trong một API.
Dự án này **đã có đủ cả ba** và chúng là tài sản cốt lõi:

| Thành phần | Dự án đã có                                                | Convai/Inworld thay thế bằng       |
| ---------- | ---------------------------------------------------------- | ---------------------------------- |
| LLM        | `/api/agent` + prompt sư phạm riêng ở `src/prompts/`       | LLM chung, không có sư phạm CEFR   |
| STT        | Whisper qua Groq/OpenAI (`/api/stt`)                       | STT đóng gói                       |
| TTS        | Google Chirp3-HD + ElevenLabs, **cache dùng chung mã hoá** | TTS đóng gói, **mất cơ chế cache** |

Ba lý do bác bỏ, theo thứ tự nặng dần:

1. **Phá vỡ điểm khác biệt sản phẩm.** Đặc trưng bất biến của app (CLAUDE.md mục 1) là **sửa lỗi
   và giải thích bằng GIỌNG tiếng mẹ đẻ**, hai giọng riêng, đảo chiều theo `direction` A/B. Đây là
   logic sư phạm song ngữ, không phải hội thoại NPC. Convai/Inworld không làm được việc này.
2. **Phá vỡ mô hình chi phí.** Inworld ~$15/1M ký tự; stack voice agent thật ~$0.007–0.091 **mỗi
   phút hội thoại**, và **tính tiền theo mỗi cuộc trò chuyện, mãi mãi**. App đang MIỄN PHÍ cho cộng
   đồng với gói Pro 20.000đ/10 ngày. Vài chục phút nói/tháng của một người dùng free là đã lỗ.
   Cơ chế **cache TTS dùng chung** (câu nào đã sinh thì mọi user sau dùng lại miễn phí) — thứ giữ
   chi phí app ở mức thấp — sẽ **mất trắng**.
3. **Mất kiểm soát.** Đếm/giới hạn lượt (`api/_lib/usage.ts`), kiểm quyền server, guardrail model
   trong `aiConfig.ts`, eval chất lượng gia sư (`npm run eval:tutor`) đều nằm ở server dự án.
   Đẩy sang nền tảng ngoài là bỏ hết.

→ **Giữ nguyên pipeline AI hiện có.** Avatar 3D chỉ là **lớp hiển thị** cắm lên trên, không đụng
vào tầng AI.

### 8.5. Bảng tổng kết

| Thành phần combo | Áp dụng? | Thay bằng / ghi chú                                                                  |
| ---------------- | -------- | ------------------------------------------------------------------------------------ |
| Unity            | ❌       | three.js + React Three Fiber v8                                                      |
| Ready Player Me  | ✅       | Qua `@readyplayerme/visage` (web SDK); cần chốt lại phong cách + đăng ký partner     |
| Oculus Lipsync   | ⚠️       | Bỏ plugin, **giữ bộ 15 viseme**; timing lấy từ ElevenLabs timestamps (chính xác hơn) |
| Convai / Inworld | ❌       | Giữ `/api/agent` + `/api/stt` + `/api/tts` hiện có                                   |

## 9. Quyết định mới phát sinh: phong cách nhân vật (robot hay người?)

Mục 3.2 đã chốt **robot** (theo ảnh người dùng gửi). Mục 8.2 cho thấy **Ready Player Me** (người
thật) giúp bỏ hẳn khâu model + rig. Hai đường không thể đi cùng lúc:

|                    | Robot (ảnh tham chiếu)                       | Ready Player Me (người)                         |
| ------------------ | -------------------------------------------- | ----------------------------------------------- |
| Model              | Tự mua/thuê, $30–1500 + 1–3 ngày Blender     | Miễn phí, có sẵn                                |
| Rig + blendshape   | Phải tự làm                                  | Có sẵn 52 ARKit + 15 viseme                     |
| Khẩu hình          | Dải LED emissive (dễ, không cần rig mặt)     | Khẩu hình môi thật (cần bộ 15 viseme ở mục 2.3) |
| Uncanny valley     | Không có                                     | Có rủi ro                                       |
| Biểu cảm khuôn mặt | Không (bù bằng mắt/đầu/tay)                  | Đầy đủ                                          |
| Nhận diện riêng    | Cao — hợp 4 theme, viền sáng đổi màu `--a-*` | Thấp — nhìn giống mọi app dùng RPM              |
| Thời gian tới PoC  | Lâu hơn                                      | Nhanh nhất                                      |
| Giấy phép          | Theo model mua                               | Phải đăng ký partner thương mại                 |

**Khuyến nghị:** làm **PoC bằng Ready Player Me trước** (nhanh, gần như 0 đồng) để kiểm chứng rủi
ro lớn nhất — FPS/pin/WebGL + `MediaRecorder` trên iPhone thật (mục 4). Nếu PoC đạt, mới quyết
định có đầu tư model robot riêng cho bản chính thức hay không. Như vậy **không tiêu tiền vào model
trước khi biết 3D có chạy nổi trên điện thoại người dùng hay không**.

## 10. Nguồn đã tra (2026-07-30)

- React Three Fiber — npm / releases (R3F v8 ↔ React 18, v9 ↔ React 19)
- three.js releases (r184, 16/04/2026)
- ElevenLabs Docs — Create speech with timing (`/with-timestamps`), Forced Alignment
- Google Cloud TTS — SSML + `enableTimePointing` (`SSML_MARK`, v1beta1)
- `@pixiv/three-vrm` npm (v3.5.x) + migration guide 1.0 (`expressionManager`)
- Khronos — KTX 2.0 + glTF, `KHR_texture_basisu`, `KHR_draco_mesh_compression`
- So sánh công cụ image-to-3D 2026 (Rodin / Tripo / Meshy v6 / Hunyuan3D v3 / TRELLIS 2)
- `@readyplayerme/visage` npm (three.js + react-three-fiber + drei)
- Unity Manual — Web browser compatibility (WebGL 2.0 trên iOS Safari)
- Inworld AI — Voice agent cost per minute 2026 · Convai pricing
