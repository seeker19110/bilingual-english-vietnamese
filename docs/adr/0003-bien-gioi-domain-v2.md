# ADR-0003: Biên giới domain V2 — Personal OS Core ↔ Learning ↔ shared platform

- **Trạng thái:** Đã chấp nhận
- **Ngày:** 2026-08-16
- **Liên quan:** `docs/architecture-v2/21-ROADMAP.md` (V2-01), `docs/architecture-v2/
02-SYSTEM-ARCHITECTURE.md` mục 2 "Layers" + mục 11 "Cross-domain protocol" (kiến trúc MỤC TIÊU),
  `docs/architecture-v2/V2-00-BASELINE-OWNERSHIP-MAP.md` +
  `docs/architecture-v2/V2-00-CRITICAL-FLOWS.md` (bằng chứng hiện trạng dùng để viết ADR này),
  `docs/goals/v2-wave-a-architecture-boundaries.md` (goal GOAL-2026-001, M2/S1)

## Bối cảnh

`02-SYSTEM-ARCHITECTURE.md` đã mô tả kiến trúc MỤC TIÊU nhiều lớp (Experience → Companion →
Personal Intelligence → Domain → Capability → Platform) và luật "domain không import
repository/table của domain khác" (mục 11). Nhưng tài liệu đó viết cho hệ thống CHƯA tồn tại —
hiện tại repo chỉ có đúng 1 domain thật (`Learning`, môn tiếng Anh) chạy production, cộng lớp nền
tảng dùng chung (`packages/core-*`), và **hoàn toàn chưa có "Personal OS Core"** (Person,
PersonalFact, Life Graph, Consent, Personal Policy, Decision Ledger — xác nhận ở V2-00 mục 4:
0 file, 0 bảng).

ADR này trả lời câu hỏi cụ thể mà `V2-00-CRITICAL-FLOWS.md` để ngỏ: **áp kiến trúc mục tiêu đó
lên MÃ NGUỒN THẬT hiện có như thế nào** — package nào thuộc lớp nào, luật dependency nào bắt
đầu enforce được NGAY (không chờ Personal OS Core được xây), và luật nào phải chờ.

## Quyết định

### 1. Ba nhóm biên giới cho trạng thái HIỆN TẠI (trước khi có Personal OS Core)

Vì Personal OS Core chưa tồn tại, biên giới thật hiện nay là **2 lớp, không phải 3**:

- **Platform Layer** (`packages/core-auth`, `core-billing`, `core-ai`, `core-db`, `core-config`,
  `core-errors`, `core-ui`, `core-contracts`) — hạ tầng dùng chung, KHÔNG chứa business rule của
  bất kỳ domain nào, dùng được cho mọi domain/app tương lai (Learning, Toán, Personal OS Core sau
  này). Bằng chứng V2-00: auth/TTS/STT/billing/logging/metrics đều đã ở đây, KHÔNG có logic riêng
  theo môn (xác nhận ở `V2-00-BASELINE-OWNERSHIP-MAP.md` mục 3 "Tất cả đều platform").
- **Learning domain** (`apps/english/`, phần lớn `api/*.ts` — xem bảng phân loại route ở
  `V2-00-BASELINE-OWNERSHIP-MAP.md` mục 1, schema Postgres `english.*`) — sở hữu business truth
  của việc học tiếng Anh: chat, speaking, learning progress, SRS, tutor feedback, dictionary.
- **Experience/ops phụ trợ** (`apps/hub/`) — UI khung nhiều môn, hiện KHÔNG sở hữu business truth
  nào (xác nhận V2-00-CRITICAL-FLOWS mục 4) — xếp cùng nhóm Platform về mặt dependency (không phụ
  thuộc app nào khác, không app nào nên phụ thuộc ngược vào nó).

**Personal OS Core sẽ là lớp thứ 3 khi Wave B (V2-03 trở đi) bắt đầu implement** — ADR này KHÔNG
tự tạo trước package rỗng cho nó (đúng nguyên tắc "không xây khi chưa cần" — code chết không ai
review được đúng).

### 2. Luật dependency áp dụng NGAY, enforce bằng lint trong PR này

- **`packages/**` (Platform Layer) không được import từ `apps/**` (Experience Layer).** Đây là
  chiều dependency SAI theo mục 2 `02-SYSTEM-ARCHITECTURE.md` (Platform ở dưới, Experience ở
  trên) — platform phụ thuộc app cụ thể sẽ khoá platform vào 1 domain, phá mục tiêu "dùng chung
  mọi domain tương lai". Đã xác nhận qua `grep` thật: **0 vi phạm hiện có** (3 kết quả tưởng như
  khớp chỉ là comment tiếng Việt nhắc tên file, không phải `import` thật — xem PR diff). Thêm
  `no-restricted-imports` override trong `.eslintrc.cjs` cho `packages/**/*.ts(x)`, loại trừ
  `*.test.ts` (test file được phép import chéo để viết parity test — xem mục "Ngoại lệ có chủ
  đích" bên dưới). Chạy `npm run lint` xác nhận 0 cảnh báo mới.
- **Chiều ngược lại (`apps/**` import `packages/**`) là bình thường, không chặn** — đúng thiết
  kế "app tiêu thụ platform".
- **`apps/english/` và `apps/hub/` không import lẫn nhau** — đã đúng thực tế (không thấy import
  chéo nào khi grep), nhưng CHƯA thêm lint rule ở PR này vì độ ưu tiên thấp hơn (2 app hiện không
  có nhu cầu dùng chung code ngoài `packages/`) — để dành cho PR sau nếu phát sinh nhu cầu thật.

### 3. Ngoại lệ có chủ đích (không phải lỗ hổng)

`api/_lib/voiceTierParity.test.ts` import trực tiếp `apps/english/src/lib/voiceTiers.ts` — đây
là test **cố ý** so khớp cấu hình giọng nói giữa client và server để phát hiện lệch cấu hình sớm.
Vì nó nằm ở `api/`, không phải `packages/`, và là file `.test.ts`, luật ở mục 2 không chặn nó —
giữ nguyên, không coi là vi phạm boundary.

### 4. Luật CHỜ tới khi có Personal OS Core (Wave B, chưa enforce ở ADR này)

- "Domain không import repository/table của domain khác" (mục 11
  `02-SYSTEM-ARCHITECTURE.md`) — hiện chỉ có 1 domain (Learning) nên luật này chưa có gì để test
  thật; sẽ viết lint rule cụ thể khi domain thứ 2 (Personal OS Core hoặc môn học thứ 2) xuất hiện,
  lúc đó mới biết import nào là cross-domain thật.
- Cross-domain protocol đầy đủ (typed read model / versioned service / domain event / capability
  invocation, cấm import thẳng bảng domain khác) — cần Domain Event/Outbox pattern (mục 13
  `02-SYSTEM-ARCHITECTURE.md`) chưa tồn tại trong repo — đây là việc của phase implementation sau,
  không phải ADR biên giới.

### 5. Câu hỏi mở từ V2-00 — trả lời ở đây

`V2-00-CRITICAL-FLOWS.md` mục 1.3 để ngỏ: TTS/STT (`packages/core-ai/{tts,stt}.ts`) thuộc
platform hay learning-specific? **Quyết định: Platform.** Lý do: TTS/STT hiện KHÔNG có logic
tiếng Anh/tiếng Việt hard-code trong `core-ai` — ngôn ngữ/giọng là THAM SỐ truyền vào từ
`apps/english/` (`direction`, `voice tier`), không phải logic cố định trong package. Môn học
thứ 2 (Toán, tiếng Việt cho người bản xứ...) gọi lại được đúng `ttsHandler`/`sttHandler` với
tham số khác mà không cần sửa `packages/core-ai/`. Nếu sau này phát sinh logic PHIÊN ÂM/NGỮ ÂM
đặc thù ngôn ngữ học (không chỉ tham số hoá được), sẽ tách phần đó ra domain riêng — nhưng hiện
tại chưa có bằng chứng cần tách.

## Lý do

- Enforce được NGAY một luật thật (platform không phụ thuộc app cụ thể) tốt hơn viết ADR đầy đủ
  3 lớp nhưng không lint được gì — đúng nguyên tắc CLAUDE.md "chống ảo giác": không giả định cấu
  trúc sẽ có, chỉ quyết định dựa trên cấu trúc THẬT đã đọc (V2-00). Viết luật cho lớp
  (Personal OS Core) chưa thể tồn tại là lãng phí review và dễ trôi khỏi thực tế repo.
- TTS/STT là điểm neo cụ thể nhất mà roadmap để ngỏ — trả lời rõ tránh việc Wave D
  (multi-subject) phải quay lại tranh luận từ đầu.

## Các phương án đã cân nhắc

- **Viết ADR đầy đủ 3 lớp (bao gồm Personal OS Core) + tạo sẵn package rỗng `packages/
core-personal/`** — bị loại: tạo code/thư mục không ai dùng, không lint/test được gì, vi phạm
  nguyên tắc "không thiết kế cho yêu cầu giả định" (CLAUDE.md nguyên tắc bất biến).
- **Enforce luôn "domain không import domain khác" bằng lint** — bị loại ở ADR này vì hiện chỉ
  có 1 domain thật, không có ca thật nào để viết rule đúng (rủi ro viết rule dựa trên đoán, phải
  sửa lại khi domain thứ 2 xuất hiện) — để dành cho ADR/PR sau khi có domain thứ 2.
- **Không thêm lint rule nào, chỉ viết tài liệu** — bị loại vì tài liệu không có "chặn CI" thì dễ
  bị vi phạm âm thầm về sau (đúng bài học CLAUDE.md mục 4 luật a11y: "gác tự động, chặn CI" mới
  đáng tin, không phải quy ước bằng lời).

## Hệ quả

- **Tích cực:** Có 1 lint rule THẬT bảo vệ hướng dependency platform→app không bị đảo ngược khi
  code mới thêm vào (kể cả code do AI phiên sau viết) — chặn ngay lúc `npm run lint` thay vì phát
  hiện muộn lúc review kiến trúc.
- **Đánh đổi / rủi ro:** ADR này CHƯA giải quyết boundary Personal OS Core thật (đó là việc Wave
  B) — nếu owner cần enforce sớm hơn, phải mở ADR mới khi có cấu trúc thật để dựa vào.
- **Việc cần làm tiếp theo:**
  - M3/S1 (V2-02 field-by-field contract diff) — dùng đúng phân loại Platform/Learning ở ADR này
    để biết contract nào (`packages/core-contracts/*`) nên giữ nguyên (đã là platform/learning
    dùng chung) và contract nào (Person/PersonalFact/ConsentGrant...) là hoàn toàn mới.
  - Khi domain thứ 2 xuất hiện (Personal OS Core hoặc môn học mới): viết ADR bổ sung cho luật
    "domain không import domain khác" với ca thật để lint đúng, không đoán trước.
