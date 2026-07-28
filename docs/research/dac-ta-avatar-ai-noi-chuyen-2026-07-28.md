# Đặc tả nghiên cứu: Avatar AI mô phỏng khẩu hình khi nói chuyện

> Trạng thái: **NGHIÊN CỨU KHẢ THI — chưa triển khai.** Tài liệu này chỉ để lưu kết quả tìm hiểu +
> đề xuất kiến trúc, làm cơ sở cho PR triển khai thật sau này (khi được xác nhận ưu tiên).
> Không có code tính năng nào đi kèm PR này.

## 1. Vấn đề & mục tiêu

Người dùng hỏi: tạo hình ảnh AI avatar "nói chuyện" mô phỏng khẩu hình miệng khi phát âm (kiểu
Grok Imagine) có khả thi cho app học tiếng Anh này không?

**Kết luận nhanh:** Khả thi, nhưng **không nên** dùng cách "AI generate video mỗi câu nói"
(kiểu Grok/HeyGen/D-ID) cho app này vì:

- **Băng thông:** video lip-sync tốn hàng trăm KB–vài MB mỗi câu, không phù hợp người dùng mạng
  di động/3G-4G tại Việt Nam (đối tượng chính của app).
- **Chi phí:** các model video AI (Wav2Lip/SadTalker chạy GPU, hoặc API Grok/HeyGen) tốn tiền
  GPU/API mỗi lần generate — ngược với nguyên tắc "ưu tiên chi phí thấp" của dự án (mục 3/7 CLAUDE.md).
- **Độ trễ:** generate video mất vài giây → không phù hợp hội thoại thời gian thực (chế độ Luyện nói).

**Hướng đề xuất: viseme animation 2D** (hình miệng tĩnh ghép theo âm vị, đồng bộ với audio TTS
đã có sẵn) — nhẹ, gần như miễn phí, chạy mượt trên máy/mạng yếu, phù hợp cả 3 chế độ hiện có.

## 2. Vì sao viseme animation phù hợp app này

App đã có sẵn:

- TTS Google Cloud qua `/api/tts` (giọng tiếng Anh + tiếng Việt, đã cache mã hoá).
- Chế độ Luyện nói song ngữ cần AI "nói" bằng giọng đích + giải thích bằng giọng mẹ đẻ.

Chỉ cần **thêm lớp animation khẩu hình chạy trên audio đã có**, không cần generate video mới:

```
[Câu trả lời AI] → Google TTS (đã có) → audio.mp3
                                       ↓
                    [Text → phoneme → viseme timeline]  (mới, chạy server, rẻ)
                                       ↓
              [Frontend: phát audio + đổi frame hình miệng theo timeline]
```

Tổng dữ liệu thêm cho mỗi câu: 1 file JSON timing vài trăm byte–vài KB. Sprite sheet hình miệng
(~12-15 khung hình PNG/SVG) chỉ tải 1 lần, cache vĩnh viễn ở trình duyệt.

## 3. Kiến trúc đề xuất chi tiết

### 3.1. Lấy thời điểm âm vị (timing)

Hai lựa chọn, ưu tiên lựa chọn A vì tận dụng hạ tầng TTS đã có:

- **A — SSML `<mark>` của Google Cloud TTS:** chèn thẻ `<mark name="w3"/>` vào SSML giữa các từ,
  API `synthesizeSpeech` trả về `timepoints` (ms) khi audio phát tới mốc đó. Không cần thư viện
  phoneme riêng cho phần "từ nào phát lúc nào" — chỉ cần map further xuống viseme ở bước 3.2.
  **Cần kiểm tra:** dự án đang dùng REST hay client library Google TTS nào (`api/tts.ts`) —
  đọc code thật trước khi triển khai để biết có hỗ trợ `enableTimePointing`/SSML marks hay không.
- **B — Ước lượng bằng công cụ phoneme (eSpeak-ng / CMU dict):** dùng khi không lấy được
  timepoints thật từ TTS provider, chia đều thời lượng audio theo số âm tiết ước lượng — kém
  chính xác hơn nhưng đơn giản, không phụ thuộc provider.

### 3.2. Bảng tra phoneme → viseme (tĩnh, không cần AI)

Dùng bộ 12-15 viseme chuẩn (Preston Blair hoặc Oculus visemes), lưu 1 file JSON tra cứu tĩnh
trong `src/data/` hoặc `api/_lib/`, ví dụ nhóm chính: `PP` (p/b/m), `FF` (f/v), `TH` (th),
`AA`/`E`/`OO` (nguyên âm mở/tròn môi), `REST` (miệng nghỉ giữa câu). Tiếng Việt cần bảng riêng
vì có thanh điệu và âm khác tiếng Anh — cần bảng phoneme→viseme tách theo `direction`
(`lib/direction.ts`) tương tự cách app đã tách giọng theo chiều học.

### 3.3. Asset hình miệng

- 12-15 ảnh PNG/SVG, ghép 1 sprite sheet duy nhất (ước lượng 50-100KB tổng, tải 1 lần/cache mãi).
- Cần thiết kế/mua asset avatar phù hợp phong cách app (theme hiện tại: 4 theme, xanh đêm mặc
  định) — đây là việc **thiết kế UI**, không phải việc kỹ thuật, cần quyết định riêng.

### 3.4. Render frontend

- Component React mới (ví dụ `AvatarSpeaking.tsx` trong `src/components/`), nhận `audioUrl` +
  `visemeTimeline: {viseme: string; startMs: number; endMs: number}[]`.
  - Phát audio qua `<audio>` hiện có (tái dùng logic TTS playback đã có trong Luyện nói).
  - `requestAnimationFrame` hoặc `setInterval` ~30fps đọc `audio.currentTime`, tra viseme hiện
    tại, đổi ảnh miệng tương ứng — không cần canvas phức tạp, CSS `background-position` trên
    sprite sheet là đủ.

### 3.5. Backend

- Hàm mới `textToVisemeTimeline(text, direction)` chạy khi tạo audio (cùng lúc gọi `/api/tts`),
  trả kèm timeline trong response — không tính lại mỗi lần phát (đã cache theo audio).
- Nếu dùng cách A (SSML marks): sửa `api/tts.ts` để chèn mark + đọc `timepoints` từ response
  Google TTS. Nếu dùng cách B: thêm phụ thuộc `espeak-ng` trên VPS hoặc dict tĩnh.

### 3.6. Cử động tay (đề xuất bổ sung — làm sau viseme, không làm cùng đợt)

Người dùng hỏi thêm: có nên thêm cử động tay cho avatar tự nhiên hơn không? **Trả lời: hợp lý,
cùng triết lý nhẹ-băng-thông như viseme — nhưng nên làm SAU khi viseme miệng đã chạy ổn, không
gộp chung 1 đợt** (tránh phình phạm vi, đúng nguyên tắc chia nhỏ ở mục 3 CLAUDE.md).

Cách làm khả thi, vẫn theo hướng "animation 2D ghép sẵn" chứ không AI-generate:

- **Không đồng bộ theo lời nói** (đơn giản nhất): vài cử chỉ tay lặp lại ngẫu nhiên/định kỳ khi
  avatar đang "nói" (audio đang phát) — ví dụ nghỉ tay, đưa tay nhẹ, gật đầu — chỉ cần 3-5 sprite
  tư thế tay, đổi ngẫu nhiên mỗi vài giây trong lúc audio phát, dừng khi audio dừng. Chi phí gần
  như 0 (không cần phân tích văn bản/audio thêm), tái dùng đúng cơ chế `setInterval` đã có ở 3.4.
- **Đồng bộ nhẹ theo ngữ điệu** (nâng cao hơn, làm nếu cách trên chưa đủ tự nhiên): dùng biên độ
  âm lượng audio (Web Audio API `AnalyserNode`, chạy hoàn toàn ở trình duyệt, không cần backend)
  để tăng tần suất/biên độ cử chỉ khi giọng nói to/nhấn — không cần dữ liệu timing mới từ server.
- **Không nên:** map cử chỉ tay theo ngữ nghĩa câu nói (kiểu "nói số thì giơ ngón tay") — cần
  NLP/AI phân tích câu, phức tạp và dễ sai, không đáng effort cho lợi ích thẩm mỹ tăng thêm.

Asset cần thêm: vài sprite tư thế tay/cánh tay (ước lượng thêm 20-50KB, cùng cơ chế cache vĩnh
viễn như sprite miệng ở 3.3) — vẫn là việc thiết kế UI cần làm riêng, không phải AI tự tạo được.

**Kết luận:** khả thi, effort nhỏ nếu chọn cách "không đồng bộ theo lời nói", nên xếp là bước 4
(sau khi PoC + tích hợp viseme miệng ở mục 5 đã xong và được xác nhận ổn).

## 4. Việc CẦN đọc code thật trước khi ước lượng effort chính xác

Tài liệu này KHÔNG khẳng định các điểm sau — phải đọc code lúc triển khai:

- `api/tts.ts` hiện gọi Google TTS REST hay SDK nào, có hỗ trợ SSML input + timepoints không.
- Cấu trúc cache audio (`api/_lib/fileStorage.ts`) có chỗ lưu kèm metadata JSON (timeline) không,
  hay chỉ lưu file audio.
- `src/pages` nào đang render UI Luyện nói (để biết cắm `AvatarSpeaking` vào đâu).

## 5. Đề xuất phạm vi triển khai (nếu được duyệt, chia nhỏ theo mục 3 CLAUDE.md)

1. **PoC nhỏ:** 1 câu tiếng Anh cố định, 5 viseme cơ bản, kiểm chứng đồng bộ audio-hình trên
   trình duyệt thật (mobile + desktop) trước khi làm đủ bộ.
2. Nếu PoC ổn: mở rộng bảng viseme đầy đủ (EN + VI riêng theo `direction`), tích hợp vào chế độ
   Luyện nói song ngữ.
3. Đo lại băng thông/hiệu năng thực tế (Lighthouse, kích thước JSON timeline theo câu dài) trước
   khi coi là xong — đối chiếu ngân sách Core Web Vitals ở mục 4 CLAUDE.md.
4. **(Tuỳ chọn, sau khi 1-3 ổn)** Thêm cử động tay kiểu "không đồng bộ theo lời nói" (xem 3.6) —
   bước riêng, có thể bỏ qua nếu avatar chỉ-miệng đã đủ tự nhiên với người dùng thật.

## 6. Rủi ro / điểm cần quyết định trước khi làm

- Google Cloud TTS có tính phí thêm khi bật SSML marks/timepoints không? Cần kiểm tra pricing
  trước khi chọn hướng A.
- Asset hình miệng cần ai thiết kế (không phải việc AI có thể tự bịa ra hình phù hợp thẩm mỹ app).
- Tiếng Việt có thanh điệu — cần xác nhận bảng viseme tiếng Việt có đủ tự nhiên hay cần đơn giản
  hoá (ví dụ chỉ animate theo nguyên âm, bỏ qua thanh điệu ở giai đoạn đầu).
- Đây là tính năng **thêm giá trị trải nghiệm**, không phải lỗi/nợ kỹ thuật — nên xếp độ ưu tiên
  sau các mục nợ kỹ thuật đang mở trong CLAUDE.md mục 13 (đặc biệt thanh toán Pro, Sentry).

## 7. Không làm trong phạm vi PR này

- Không sinh video AI (Wav2Lip/SadTalker/Grok Imagine) — đã loại vì băng thông/chi phí (mục 1).
- Không code component/backend thật — chỉ đặc tả, chờ xác nhận ưu tiên trước khi mở việc triển khai.
