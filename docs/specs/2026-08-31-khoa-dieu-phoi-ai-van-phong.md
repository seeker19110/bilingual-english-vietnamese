# Đặc tả: KHOÁ RIÊNG "Hermes Agent — trợ lý AI cho người đi làm" (khoá ngắn thứ hai)

> Ngày 2026-08-31, VIẾT LẠI cùng ngày theo làm rõ của người dùng: khoá phải **bám đúng đề cương
> Hermes Agent Course trong 2 ảnh tham chiếu** (giữ các bài về công cụ thật: Docker, Telegram,
> LiteLLM, llama.cpp, Open WebUI, Memos, Linear, Firecrawl, Honcho, Herdr, Paperclip…), chỉ xoay
> góc nhìn sang **nhân viên văn phòng** và **người điều phối dev** — KHÔNG lược bỏ công cụ như
> bản nháp đầu.
> Khuôn: `docs/templates/dac-ta-tinh-nang.md` · Nền: `docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md`
> (khoá Git — tiền lệ tầng khoá ngắn, đủ 4 PR #740–#744) · `gitSim.ts`/`bashSim.ts` (khuôn "máy
> ảo tí hon tất định").

## 0. Một câu

Khoá học ĐỘC LẬP **"Hermes Agent — trợ lý AI cho người đi làm"** (`/lap-trinh/khoa/hermes`,
22 bài / 4 chương đúng đề cương khoá tham chiếu) dạy nhân viên văn phòng và người điều phối dev
cài đặt — cấu hình — giao việc — điều phối tác tử AI Hermes, chấm bài bằng bộ mô phỏng tất định
`hermesSim` (đúng cách `gitSim` mô phỏng git THẬT), không gọi AI thật khi chấm.

## 1. Nghiên cứu đầu vào

### 1.1. Hermes Agent là gì (tra cứu thật 2026-08-31, không đoán)

**Hermes Agent** — tác tử AI mã nguồn mở của Nous Research ("the agent that grows with you",
~165k sao GitHub). Điều đã xác minh từ tài liệu chính thức + docs cộng đồng:

- **Cài & chạy**: script cài một dòng hoặc **Docker**; chạy `hermes` (CLI) hoặc
  `hermes gateway` (chế độ nhắn tin). Có **dashboard** quản lý.
- **Kênh nhắn tin**: Telegram (BotFather → `hermes gateway setup` → `hermes gateway start`),
  Discord, Slack, WhatsApp… — một gateway nhiều nền tảng.
- **Lệnh lõi**: `/new` · `/resume <session>` · `/model` · `/personality` · `/skills` ·
  `/permission` · `/stop` · `/usage`; các lệnh mục tiêu `/goal`, lái `/steer`, học thành kỹ năng
  `/learn` (tên đúng như 2 ảnh đề cương).
- **Model**: model chính + **curator model** (model phụ rẻ hơn lo nén ngữ cảnh) trong
  `~/.hermes/config.yaml`; nối được **LiteLLM**, **llama.cpp** (API kiểu OpenAI), **Open WebUI**,
  35+ provider.
- **Profile**: `hermes profile create <tên>` — nhiều "con" Hermes tách biệt config/bộ nhớ/phiên.
- **Hệ sinh thái** (phần III–IV của khoá tham chiếu, là công cụ NGOÀI ghép với Hermes):
  **Memos** (ghi chú tự host) · **Linear** (quản việc người+agent) · **Firecrawl** (trích xuất
  web) · **Honcho** (bộ nhớ/mô hình hoá người dùng) · **Herdr** (bảng điều khiển multi-agent) ·
  **Paperclip** (điều phối nhiều agent kiểu "công ty 0 người": sơ đồ tổ chức, ngân sách, việc
  nguyên tử) · Kanban board.

### 1.2. Đề cương tham chiếu (2 ảnh người dùng gửi) — GIỮ NGUYÊN KHUNG

Ảnh 1: phần **I Cơ bản** (Dashboard bằng Docker · Cấu hình AI model, curator model · Làm quen
Dashboard & Hermes CLI · Kết nối Telegram · Cấu hình profile agent · Quản lý session · Sử dụng
skill) và phần **II Công cụ nâng cao** (5 bài: /goal & /steer · /learn · LiteLLM · llama.cpp ·
Open WebUI). Ảnh 2: phần **III Tech stack ứng dụng** (5 bài: Memos · Linear · Bookmark bằng
Hermes · Understand-anything · Design & Frontend skill làm landing page) và phần **IV
Multi-agent và hệ sinh thái** (5 bài: Kanban board · Herdr · Firecrawl · Honcho · Paperclip).

**Quyết định (làm rõ của người dùng 2026-08-31): giữ đúng danh sách bài này**, mỗi bài dạy qua
lăng kính hai đối tượng — ví dụ bài Linear dạy "giao việc cho agent như giao cho một dev trong
team", bài Paperclip dạy "điều phối một đội dev-AI có ngân sách", bài Memos/Bookmark dạy quy
trình văn phòng (ghi chú họp, kho tư liệu phòng ban).

### 1.3. Đối tượng

- **Nhân viên văn phòng chưa từng code**: tự dựng được một Hermes chạy trong Telegram làm trợ
  lý việc hằng ngày (email, ghi chú, tổng hợp, bookmark), có thói quen KIỂM CHỨNG kết quả.
- **Người bắt đầu điều phối dev**: dùng Hermes + Linear/Kanban/Herdr/Paperclip để giao việc,
  theo dõi và nghiệm thu công việc dev (người hoặc agent) bằng bằng chứng đo được.
- `prerequisites: []` — vào thẳng, không cần biết code; bài nào cần gõ lệnh đều gõ trong
  terminal giả lập của bài học.

### 1.4. Hiện trạng hạ tầng (đo thật từ mã nguồn 2026-08-31)

| Thứ                                    | Số thật hôm nay                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Tầng khoá ngắn `courses/`              | ĐÃ CÓ (PR #740): khoá `git` đủ 5 chương; đăng ký khoá mới = 1 file + 1 dòng registry     |
| Trang khoá `/lap-trinh/khoa/:courseId` | ĐÃ CÓ (PR #742), **data-driven** — khoá mới tự hiện ở `ProgrammingHome`                  |
| Khuôn bài 8 bước + SRS                 | ĐÃ CÓ (`lessonTypes.ts`) — mọi bài phải có ví dụ CHẠY ĐƯỢC + bài Make CHẤM ĐƯỢC tất định |
| Bộ chạy cho tác tử                     | **CHƯA CÓ** — phải thêm ngôn ngữ `'hermes'` + `hermesSim.ts` (khuôn `gitSim`)            |
| Regex `lessonId`                       | `^(p[1-6]-u\d+-l\d+\|git-u\d+-l\d+)$` ở 3 chỗ — nới thêm nhánh `hermes-u\d+-l\d+`        |
| Bài dùng lại được                      | 0 — 22/22 bài mới (khác khoá Git dùng lại 2 bài cũ)                                      |

## ② Phạm vi

**LÀM:**

- **Bộ mô phỏng `hermesSim.ts`** — mô phỏng CLI Hermes THẬT (đúng cách `gitSim` mô phỏng git
  thật): máy ảo tí hon thuần TypeScript, tất định tuyệt đối, in dòng tự khai `[GIA LAP]` mỗi
  lượt. Bộ lệnh đóng (xem ③). Phản hồi "AI" là văn bản đóng hộp tất định.
- **Ngôn ngữ bài học mới `'hermes'`** trong `LESSON_LANGUAGES` + `hermesRunner.ts` (khuôn
  `gitRunner.ts`, không worker) + nhãn `LangBadge` (nhóm "mô phỏng").
- **Khoá `hermes` 4 chương / 22 bài** (id `hermes-uN-lM`, unit ảo `hermes-uN`), đề cương bám
  2 ảnh:

  | Chương                         | Bài | Danh sách bài (tiêu đề theo đề cương tham chiếu, góc nhìn văn phòng/điều phối dev)                                                                                                                                                                                                                                                                                            |
  | ------------------------------ | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | C1 Cơ bản                      | 7   | Dashboard bằng Docker (dựng Hermes chạy được) · Cấu hình AI model, curator model & tuỳ chọn cơ bản · Làm quen Dashboard & Hermes CLI · Kết nối Telegram (trợ lý trong túi mọi nhân viên) · Cấu hình profile agent (mỗi vai một profile: thư ký · trợ lý dự án) · Quản lý session (mỗi việc một phiên, /new /resume) · Sử dụng skill (kho kỹ năng có sẵn)                      |
  | C2 Công cụ nâng cao            | 5   | /goal & /steer — agent bền bỉ theo mục tiêu, người lái giữa chừng · /learn — biến việc lặp của phòng thành kỹ năng · LiteLLM — một proxy quản mọi model (kiểm soát chi phí cho cả phòng) · llama.cpp — self-host model (dữ liệu không rời công ty) · Open WebUI — giao diện web chat cho người không dùng terminal                                                            |
  | C3 Tech stack ứng dụng         | 5   | Memos — ghi chú & sắp xếp thông tin (biên bản họp, quy trình phòng) · Linear — người và agent làm việc cùng nhau (giao việc dev cho agent như cho teammate) · Bookmark mọi thứ bằng Hermes (kho tư liệu phòng ban) · Understand-anything — hiểu mọi tài liệu/codebase (đọc hợp đồng, đọc repo trước khi giao việc) · Design & Frontend skill — làm landing page không cần dev |
  | C4 Multi-agent và hệ sinh thái | 5   | Kanban board — bảng việc cho đội người+agent · Herdr — bảng điều khiển multi-agent (điều phối nhiều dev-AI song song) · Firecrawl — tìm kiếm & trích xuất thông tin (nghiên cứu thị trường/đối thủ) · Honcho — bộ nhớ dài hạn cho agent (agent nhớ ngữ cảnh phòng ban) · Paperclip — "công ty 0 người" (sơ đồ tổ chức agent, ngân sách, nghiệm thu việc nguyên tử)            |

- **Luật soạn bài cho chủ đề công cụ thật** (điểm mấu chốt sau làm rõ): bước ①–⑤ dạy khái niệm
  - lệnh qua `hermesSim` (Predict/Parsons trên transcript lệnh thật); bài Make chấm phần MÔ
    PHỎNG ĐƯỢC tất định (chuỗi lệnh đúng, trạng thái phiên/profile/goal/bảng việc đúng); bước ⑦
    homework là LÀM THẬT trên máy học viên (cài Docker thật, tạo bot BotFather thật…) — không
    chấm, có checklist tự kiểm. Bài học NÓI THẲNG chỗ nào là giả lập (luật tự khai của
    `bashSim`/`gitSim`).
- Cổng chấm: `hermesSim.test.ts` + `lessonsHermes.test.ts` (mọi `sampleSolution` đạt 100%
  test-case). Nới regex id ở 3 chỗ (`lessonTypes.ts` · `progress.ts` · `feedback.ts`).

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **KHÔNG gọi AI thật, mạng thật, Docker thật trong bài học/chấm bài** — mô phỏng tất định
  100% (cổng chấm phải cho cùng output với cùng input; không đốt tiền API). Làm thật để ở
  homework, không chấm.
- **KHÔNG nhúng/redistribute nội dung khoá Hermes tham chiếu** — chỉ dùng ĐỀ CƯƠNG chủ đề (danh
  sách năng lực cần dạy, theo yêu cầu người dùng); toàn bộ lời giảng, ví dụ, bài tập tự soạn,
  ví dụ đặt trong bối cảnh văn phòng Việt Nam.
- **KHÔNG đụng** khoá `git`, `curriculum.ts`, hai tầng còn lại của môn.
- **KHÔNG** mô phỏng sâu từng công cụ hệ sinh thái (Memos/Linear/Firecrawl/Honcho/Herdr/
  Paperclip là sản phẩm ngoài): bài C3–C4 mô phỏng ở mức LỆNH/LUỒNG VIỆC (giao việc, trạng
  thái, nghiệm thu) qua `hermesSim`, không dựng lại UI/API thật của từng sản phẩm.
- **KHÔNG** làm tính năng Companion/hạ tầng tác tử thật của nền tảng — đây là KHOÁ HỌC.

## ③ Hợp đồng dữ liệu — `hermesSim`

Cùng hình dạng với `gitSim`/`bashSim`; chấm bài Make bằng **TRẠNG THÁI**, không so chuỗi thô.

```ts
export const DONG_TU_KHAI_HERMES =
  '[GIA LAP] Mo phong Hermes Agent cua DHCB de hoc — khong phai AI that, khong goi mang.'

export interface HermesRunResult {
  output: string
  error?: string
  /** Trạng thái cuối để chấm. */
  state: {
    phien: string[] // các session đã tạo, phần tử đầu là phiên hiện tại
    profile: string[] // profile đã tạo
    modelChinh: string | null
    modelCurator: string | null
    gateway: 'chua-cau-hinh' | 'da-cau-hinh' | 'dang-chay' // luồng Telegram
    goal: string | null
    kyNang: string[] // skill đã bật/học qua /learn
    viec: Array<{
      id: string
      ten: string
      trangThai: 'cho' | 'dang-lam' | 'cho-duyet' | 'xong' | 'tu-choi'
    }> // bảng việc C3–C4
  }
}
```

**Bộ lệnh mô phỏng (đóng, tất định — chọn theo lệnh Hermes THẬT đã xác minh ở 1.1):**
`hermes` · `hermes gateway setup|start` · `hermes model <tên>` (+ curator) · `hermes profile
create <tên>` · `/new` · `/resume <phiên>` · `/model` · `/skills` · `/goal "<mục tiêu>"` ·
`/steer "<chỉ dẫn>"` · `/learn <tên>` · `/permission` · `/stop`; và nhóm lệnh luồng việc cho
C3–C4: `giao "<việc>"` · `trangthai` · `duyet <id>` · `tuchoi <id> "<lý do>"` (mô phỏng
Linear/Kanban/Paperclip ở mức luồng việc). Danh sách chốt cứng ở PR 2 trong `hermesSim.ts`;
lệnh ngoài danh sách → "mô phỏng không làm việc này" + chỉ chỗ đọc thêm (luật `gitSim`).

**Luật sư phạm nạp vào sim:**

- Việc `cho-duyet` không bao giờ tự thành `xong` — chỉ `duyet` của học viên chuyển được
  (nghiệm thu là việc của NGƯỜI).
- Kịch bản chứa chuỗi dạng secret/API key dán vào việc → agent từ chối kèm giải thích; hành
  động khó hoàn tác → agent dừng hỏi xác nhận (`/permission`).
- `/goal` khi đã có goal đang chạy → hỏi thay thế hay giữ — dạy phân biệt goal dài với việc lẻ.

**Ca lỗi (một phần hợp đồng):** lệnh sai → lỗi tiếng Việt gợi lệnh gần đúng, KHÔNG stack
trace · `/resume` phiên không tồn tại → nêu tên + gợi `/new` · `duyet` id không tồn tại/chưa
`cho-duyet` → nói rõ trạng thái · khoá trỏ id bài không tồn tại → CI đỏ ở `courses.test.ts`.

## ④ Điểm chạm

| Việc | Đường dẫn                                                         | Ghi chú                                       |
| ---- | ----------------------------------------------------------------- | --------------------------------------------- |
| Thêm | `packages/subject-programming/hermesSim.ts` + `hermesSim.test.ts` | Máy ảo mới — rủi ro cao nhất, PR riêng        |
| Sửa  | `packages/subject-programming/lessonTypes.ts`                     | +`'hermes'` vào `LESSON_LANGUAGES`, nới regex |
| Thêm | `packages/subject-programming/courses/hermes.ts`                  | Khoá (nới `ShortCourseId`)                    |
| Sửa  | `packages/subject-programming/courses/registry.ts`                | +1 import, +1 phần tử                         |
| Thêm | `lessons/hermesu1.ts … hermesu4.ts` + `lessonsHermes.test.ts`     | 22 bài mới                                    |
| Sửa  | `packages/subject-programming/lessons.ts`                         | +4 import                                     |
| Sửa  | `apps/server/src/api/subjects/programming/{progress,feedback}.ts` | nới regex `lessonId` (tiền lệ `git-u`)        |
| Thêm | `apps/dhcb/src/lib/hermesRunner.ts`                               | khuôn `gitRunner.ts`, không worker            |
| Sửa  | `apps/dhcb/src/lib/codeRunner.ts` + `LangBadge`                   | nối ngôn ngữ `'hermes'` (nhãn "mô phỏng")     |

Không cần route/trang mới (data-driven), không cần migration (`lesson_id` là `text`).
`lessonTypes.ts` và `codeRunner.ts` là điểm nóng — chạy `npm run codemap -- impact` trước khi
sửa, dán kết quả vào PR.

## ⑤ Tiêu chí chấp nhận

- [ ] `hermesSim` tất định: cùng chuỗi lệnh 2 lượt → output byte-identical; không `Date.now()`,
      không random (test canh).
- [ ] `hermesSim.test.ts` phủ từng lệnh + đủ ca lỗi ③ + 3 luật sư phạm.
- [ ] Mọi `sampleSolution` của 22 bài đạt 100% test-case (`lessonsHermes.test.ts`).
- [ ] `courses.test.ts`: mọi `lessonIds` khoá `hermes` tra ra bài thật; khoá `git` không đổi.
- [ ] Vào thẳng `/lap-trinh/khoa/hermes` khi chưa học gì vẫn học được bài đầu (E2E).
- [ ] Bài Make chấm bằng `state`, không so output thô; mỗi bài công cụ thật có homework
      "làm thật + checklist tự kiểm".
- [ ] Coverage branches ≥ 90 (biên hiện dư 0,56 điểm) · Initial JS < 140 kB (runner nạp lười).
- [ ] `npm run eval:code-feedback` không phát sinh ca vi phạm mới.

**Lệnh chứng minh:** `npm run typecheck && npm run lint && npm test && npm run build` ·
`npm run budget` · `npm run test:e2e -- --grep "khoa/hermes"`.

## ⑥ Bất biến không được phá

| Bất biến                                                 | Test canh                              |
| -------------------------------------------------------- | -------------------------------------- |
| Khoá `git` + xương sống P1–P6 không đổi                  | `courses.test.ts` (không hồi quy)      |
| `hermesSim` tất định tuyệt đối, không I/O/mạng           | `hermesSim.test.ts` (chạy 2 lượt)      |
| Mỗi lượt chạy in dòng tự khai `[GIA LAP]`                | `hermesSim.test.ts`                    |
| Nội dung bài MỘT nguồn — khoá tham chiếu id, không nhúng | `courses.test.ts`                      |
| Nội dung tự soạn, không chép từ khoá tham chiếu          | rà tay khi review nội dung C1–C4       |
| Khoá tiến độ đã ghi Postgres không đổi nghĩa             | regex `progress.ts` chỉ NỚI, không đổi |

## Quy ước phải theo

Comment tiếng Việt · import xuyên gói `@dhcb/...` không đuôi `.js`, nội bộ gói tương đối có
`.js` · conventional commits scope chữ thường · mỗi bài đủ 8 bước + 2–4 thẻ SRS · terminal giả
lập xuất **không dấu** · a11y AAA nội dung / AA còn lại, màu từ token `--a-*`.

## Nghiệm thu — chia 4 PR (PR 1 là chính tài liệu này)

| PR  | Nội dung                                                            | Vì sao tách                                                   |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | Đặc tả này                                                          | Chốt thiết kế + phạm vi, người dùng duyệt được sớm            |
| 2   | `hermesSim.ts` + test + ngôn ngữ `'hermes'` + runner + nới regex id | Hạ tầng, rủi ro cao nhất; review độc lập với nội dung         |
| 3   | Khoá `hermes` + chương C1 (7 bài) + E2E vào thẳng                   | Lát cắt dọc đầu tiên chạy được thật trên trang khoá           |
| 4   | Chương C2–C4 (15 bài)                                               | Khối nội dung lớn nhất, đi cuối (có thể tách 4a/4b nếu phình) |

**Câu hỏi mở cho người dùng (không chặn PR 2):** ① phiên bản Hermes đổi nhanh (v0.2→v0.6 trong
vài tháng) — chấp nhận rủi ro nội dung phải cập nhật theo, hay muốn thêm dòng "soạn theo
v0.6.x" vào từng bài? ② bài Paperclip/Herdr là công cụ trẻ, tài liệu mỏng — nếu lúc soạn PR 4
không đủ nguồn kiểm chứng thì đề xuất thay bằng bài "điều phối nhiều profile Hermes" (cùng năng
lực, công cụ chín hơn), quyết lúc đó được không?
