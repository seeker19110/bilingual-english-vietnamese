# Đặc tả: KHOÁ RIÊNG "Điều phối AI thực hành" (môn Lập trình — khoá ngắn thứ hai)

> Ngày 2026-08-31 · Khuôn: `docs/templates/dac-ta-tinh-nang.md`
> Nền: `docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md` (khoá Git — tiền lệ tầng khoá ngắn,
> đã chạy thật đủ 4 PR #740–#744) · `packages/subject-programming/gitSim.ts` + `bashSim.ts`
> (khuôn "máy ảo tí hon tất định") · yêu cầu người dùng 2026-08-31 kèm ảnh tham chiếu
> "Hermes Agent Course".

## 0. Một câu

Khoá học ĐỘC LẬP **"Điều phối AI thực hành"** (`/lap-trinh/khoa/ai`, 16 bài / 5 chương) dạy
**nhân viên văn phòng chưa từng code** và **người bắt đầu điều phối dev** cách GIAO VIỆC — THEO
DÕI — NGHIỆM THU công việc với tác tử AI, chấm bài bằng bộ mô phỏng tác tử tất định `agentSim`
(khuôn `gitSim`), không gọi AI thật khi chấm.

## 1. Nghiên cứu đầu vào (vì sao khoá trông như thế này)

### 1.1. Tham chiếu: Hermes Agent Course (ảnh người dùng gửi)

Khoá tham chiếu có 4 phần: **I Cơ bản** (cài đặt Docker, cấu hình model, dashboard, kết nối
Telegram, cấu hình profile agent, quản lý session, sử dụng skill) · **II Công cụ nâng cao**
(slash goal/steer — agent bền bỉ theo mục tiêu, slash learn — agent học thành kỹ năng, LiteLLM,
llama.cpp, Open WebUI) · **III Tech stack ứng dụng** (Memos ghi chú, Linear — người và agent làm
việc cùng nhau, bookmark, understand-anything, design/frontend) · **IV Multi-agent** (Kanban
board, Herdr bảng điều khiển multi-agent, Firecrawl, Honcho memory, Paperclip "công ty 0 người").

**Phân loại khi mang về DHCB** — tách "kỹ năng bền" khỏi "thao tác theo sản phẩm":

| Nhóm trong Hermes Course                                               | Về DHCB thành                                                             | Vì sao                                                                                                           |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Session, skill, goal/steer, kanban, multi-agent, người+agent làm chung | **GIỮ — thành xương sống khoá** (C1, C4, C5)                              | Là khái niệm nền của MỌI tác tử (Claude Code, Hermes, Codex…), không chết theo sản phẩm                          |
| Giao việc, theo dõi, nghiệm thu (ngầm trong Linear/Kanban)             | **GIỮ và NÂNG thành trọng tâm** (C2, C3, C5)                              | Đây mới là kỹ năng "nhân viên văn phòng + điều phối dev" cần — khoá tham chiếu coi là phụ, ta coi là chính       |
| Docker, Telegram, LiteLLM, llama.cpp, Open WebUI, Firecrawl, Honcho    | **BỎ khỏi phạm vi khoá này**                                              | Thao tác cài đặt theo MỘT sản phẩm cụ thể, lỗi thời nhanh, không mô phỏng tất định được, sai đối tượng văn phòng |
| Memos/bookmark/understand-anything                                     | **BỎ** (nhắc 1 câu ở bài "việc lặp lại thành kỹ năng" như ví dụ ứng dụng) | Là ứng dụng của kỹ năng giao việc, không phải kỹ năng riêng                                                      |

### 1.2. Đối tượng (người dùng chốt: "trước tiên tập trung vào nhân viên văn phòng và điều phối dev")

- **Nhân viên văn phòng chưa từng code**: cần dùng tác tử AI cho email, tài liệu, bảng tính,
  tổng hợp thông tin — và cần nhất là thói quen **kiểm chứng** (không tin mù kết quả AI).
- **Người bắt đầu điều phối dev** (PM/chủ dự án nhỏ/người tự học đang thuê-dùng AI dev): cần
  viết **đặc tả giao việc** ra hồn, nghiệm thu bằng **bằng chứng đo được**, điều phối nhiều
  việc/nhiều tác tử song song không dẫm chân nhau.
- `prerequisites: []` — vào thẳng, không cần học bậc P nào, không cần biết code. Đây là khoá
  ngắn ĐẦU TIÊN của môn nhắm người KHÔNG học lập trình — cửa ngõ kéo người mới vào nền tảng.

### 1.3. Hiện trạng hạ tầng (đo thật 2026-08-31, không đoán)

| Thứ                                    | Số thật hôm nay                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Tầng khoá ngắn `courses/`              | ĐÃ CÓ (PR #740): `types.ts` · `registry.ts` · khoá `git` đủ 5 chương                              |
| Trang khoá `/lap-trinh/khoa/:courseId` | ĐÃ CÓ (PR #742), **data-driven**: đăng ký khoá vào `SHORT_COURSES` là tự hiện ở `ProgrammingHome` |
| Khuôn bài 8 bước + SRS                 | ĐÃ CÓ (`lessonTypes.ts`) — bắt buộc mọi bài có ví dụ CHẠY ĐƯỢC + bài Make CHẤM ĐƯỢC               |
| Bộ chạy cho tác tử AI                  | **CHƯA CÓ** — `LESSON_LANGUAGES` chưa có `'agent'`, phải viết `agentSim.ts` mới                   |
| Regex `lessonId`                       | `^(p[1-6]-u\d+-l\d+\|git-u\d+-l\d+)$` ở 3 chỗ — phải nới thêm nhánh `ai-u\d+-l\d+`                |
| Bài dùng lại được                      | **0 bài** — khác khoá Git (dùng lại 2 bài `p3-u10`), khoá này 16/16 bài đều mới                   |

## ② Phạm vi

**LÀM:**

- **Bộ mô phỏng `agentSim.ts`** — "máy ảo tí hon" thuần TypeScript, tất định tuyệt đối, đúng
  khuôn `gitSim`/`bashSim` (xem ③). Học viên gõ lệnh CLI của một tác tử HƯ CẤU tên `tro` (trợ
  lý) — cố ý KHÔNG nhại tên sản phẩm thật nào, và in dòng tự khai `[GIA LAP]` mỗi lượt chạy.
- **Ngôn ngữ bài học mới `'agent'`** trong `LESSON_LANGUAGES` + runner phía trình duyệt
  (`agentRunner.ts`, khuôn `gitRunner.ts` — không cần worker) + nhãn ở `LangBadge`.
- **Khoá `ai` 5 chương / 16 bài mới** (id `ai-uN-lM`, unit ảo `ai-uN` — đúng cơ chế `git-uN`):

  | Chương                       | Bài | Nội dung                                                                                                                                                                           |
  | ---------------------------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | C1 Làm quen tác tử AI        | 3   | tác tử ≠ chatbot (có công cụ, tự hành động) + giao việc đầu tiên `tro giao` · phiên làm việc — mỗi việc một phiên `tro phien` · đọc & KIỂM CHỨNG kết quả, duyệt/từ chối            |
  | C2 Giao việc cho rõ          | 3   | khuôn giao việc 3 phần (Mục tiêu · Phạm vi/KHÔNG làm · Nghiệm thu) — thiếu phần là tác tử hỏi lại · chia việc lớn thành chuỗi việc nhỏ · lái giữa chừng `tro sua` (steer)          |
  | C3 Việc văn phòng hằng ngày  | 4   | email & văn bản theo khuôn · tổng hợp báo cáo — luật "số liệu phải kèm nguồn" · bảng tính & số liệu — tự kiểm phép tính · việc lặp lại thành KỸ NĂNG `tro kynang` (learn/skill)    |
  | C4 Mục tiêu dài & nhiều việc | 3   | mục tiêu bền bỉ `tro muctieu` (goal) khác việc lẻ · bảng việc song song `tro bang` (kanban) · an toàn: secrets không dán vào việc, hành động khó hoàn tác tác tử phải HỎI          |
  | C5 Điều phối dev bằng AI     | 3   | viết đặc tả giao việc dev (khuôn 6 ô rút gọn của DHCB) · nghiệm thu bằng BẰNG CHỨNG — không nhận "chắc là xong" · điều phối nhiều tác tử song song, tránh dẫm chân, review rồi gộp |

- Cổng chấm: `agentSim.test.ts` + `lessonsAgent.test.ts` (mọi `sampleSolution` đạt 100%
  test-case qua chính `agentSim`).
- Nới regex id ở 3 chỗ: `lessonTypes.ts` · `api/subjects/programming/progress.ts` ·
  `api/subjects/programming/feedback.ts` (đều đã có tiền lệ nhánh `git-u`).

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **KHÔNG gọi AI thật trong bài học/chấm bài.** Toàn bộ "tác tử" là mô phỏng tất định — vì cổng
  chấm phải cho cùng output với cùng input (bài học của khoá Git), và vì gọi AI thật mỗi lượt
  Make là đốt tiền API vô hạn. Phản hồi AI thật chỉ ở kênh feedback sẵn có (`/api/agent-feedback`).
- **KHÔNG dạy cài đặt sản phẩm cụ thể** (Docker, Telegram, LiteLLM, llama.cpp, Open WebUI…) —
  xem bảng 1.1. Nếu sau này cần, đó là KHOÁ KHÁC ("Tự host AI"), không nhét vào đây.
- **KHÔNG đụng** `curriculum.ts`, khoá `git`, hai tầng còn lại của môn.
- **KHÔNG** làm hạ tầng tác tử thật (webhook, hàng đợi…) — đây là KHOÁ HỌC, không phải tính năng
  Companion của nền tảng.
- **KHÔNG** dùng tên/logo Hermes hay sản phẩm thật nào trong nội dung bài.

## ③ Hợp đồng dữ liệu — `agentSim`

Cùng hình dạng kết quả với `gitSim`/`bashSim`; chấm bài Make bằng **TRẠNG THÁI** (bảng việc,
phiên, kỹ năng) chứ không so chuỗi output thô.

```ts
/** Dòng tự khai in đầu MỌI lượt chạy (luật tự khai — khuôn bashSim). */
export const DONG_TU_KHAI_AGENT =
  '[GIA LAP] Tac tu "tro" cua DHCB — mo phong de hoc, khong phai AI that.'

export interface AgentRunResult {
  output: string
  error?: string
  /** Trạng thái cuối để chấm: việc (id, trạng thái, nhãn), phiên hiện tại, kỹ năng đã lưu. */
  state: {
    viec: Array<{
      id: string
      ten: string
      trangThai: 'cho' | 'dang-lam' | 'cho-duyet' | 'xong' | 'tu-choi'
    }>
    phienHienTai: string
    kyNang: string[]
    mucTieu: string | null
  }
}
```

**Bộ lệnh mô phỏng (đóng, tất định):** `tro giao "<việc>"` · `tro trangthai` · `tro ketqua <id>`
· `tro duyet <id>` · `tro tuchoi <id> "<lý do>"` · `tro sua <id> "<chỉ dẫn>"` · `tro phien
[moi <tên>|<tên>]` · `tro kynang [luu <tên>|<tên>]` · `tro muctieu "<mục tiêu>"` · `tro bang`.
Kết quả việc là VĂN BẢN ĐÓNG HỘP chọn tất định theo nội dung lệnh giao (bảng tra trong sim, có
thể seed thêm qua `lenhChuanBi` như `gitSim`) — không sinh ngẫu nhiên.

**Luật sư phạm nạp vào sim (điểm ăn tiền của khoá):**

- `tro giao` với yêu cầu THIẾU khuôn 3 phần (từ C2 trở đi, khi bài bật cờ khuôn) → tác tử
  KHÔNG làm mà **hỏi lại đúng phần thiếu** — dạy phản xạ viết yêu cầu đủ ý bằng chính trải nghiệm.
- Việc ở trạng thái `cho-duyet` không bao giờ tự nhảy sang `xong` — chỉ `tro duyet` của học viên
  chuyển được. Dạy: **nghiệm thu là việc của NGƯỜI**, không phải của AI.
- Lệnh chạm dữ liệu nhạy cảm/khó hoàn tác trong kịch bản (vd "xoá toàn bộ…") → tác tử dừng và
  hỏi xác nhận. Yêu cầu chứa chuỗi dạng mật khẩu/API key trong kịch bản C4 → tác tử từ chối kèm
  giải thích.

**Ca lỗi (một phần hợp đồng):**

| Tình huống                        | Hành vi mong đợi                                                         |
| --------------------------------- | ------------------------------------------------------------------------ |
| Lệnh ngoài bộ lệnh đóng           | Lỗi tiếng Việt gợi lệnh gần đúng, KHÔNG stack trace                      |
| `tro duyet` id không tồn tại      | Lỗi nêu rõ id + gợi `tro trangthai`                                      |
| `tro duyet` việc chưa `cho-duyet` | Từ chối, nói rõ trạng thái hiện tại                                      |
| Khoá trỏ id bài không tồn tại     | CI đỏ ở `courses.test.ts` (cổng đã có sẵn, quét MỌI khoá trong registry) |

## ④ Điểm chạm

| Việc | Đường dẫn                                                         | Ghi chú                                         |
| ---- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Thêm | `packages/subject-programming/agentSim.ts` + `agentSim.test.ts`   | Máy ảo mới — rủi ro cao nhất, PR riêng          |
| Sửa  | `packages/subject-programming/lessonTypes.ts`                     | +`'agent'` vào `LESSON_LANGUAGES`, nới regex id |
| Thêm | `packages/subject-programming/courses/ai.ts`                      | Khoá `ai` (nới `ShortCourseId`)                 |
| Sửa  | `packages/subject-programming/courses/registry.ts`                | +1 import, +1 phần tử                           |
| Thêm | `lessons/aiu1.ts … aiu5.ts` + `lessonsAgent.test.ts`              | 16 bài mới                                      |
| Sửa  | `packages/subject-programming/lessons.ts`                         | +5 import                                       |
| Sửa  | `apps/server/src/api/subjects/programming/{progress,feedback}.ts` | nới regex `lessonId` (tiền lệ `git-u`)          |
| Thêm | `apps/dhcb/src/lib/agentRunner.ts`                                | khuôn `gitRunner.ts`, không worker              |
| Sửa  | `apps/dhcb/src/lib/codeRunner.ts` + `LangBadge`                   | nối ngôn ngữ `'agent'` (nhãn "mô phỏng")        |

Không cần route/trang mới (đã data-driven), không cần migration (`lesson_id` là `text`).
`lessonTypes.ts` và `codeRunner.ts` là điểm nóng — chạy `npm run codemap -- impact` trước khi
sửa và dán kết quả vào PR.

## ⑤ Tiêu chí chấp nhận

- [ ] `agentSim` tất định: cùng chuỗi lệnh 2 lượt → output byte-identical; không `Date.now()`,
      không random (test canh).
- [ ] `agentSim.test.ts` phủ từng lệnh + đủ ca lỗi bảng ③ + 3 luật sư phạm.
- [ ] Mọi `sampleSolution` của 16 bài đạt 100% test-case qua `agentSim` (`lessonsAgent.test.ts`).
- [ ] `courses.test.ts`: mọi `lessonIds` của khoá `ai` tra ra bài thật; khoá `git` **không đổi
      một byte** (test không hồi quy đã có tự phủ vì quét cả registry).
- [ ] Vào thẳng `/lap-trinh/khoa/ai` khi chưa học gì vẫn học được bài đầu (E2E, khuôn ca khoá git).
- [ ] Bài Make chấm bằng `state`, không so output thô.
- [ ] Coverage branches ≥ 90 (biên hiện dư 0,56 điểm) · Initial JS < 140 kB (runner nạp lười).
- [ ] `npm run eval:code-feedback` không phát sinh ca vi phạm mới.

**Lệnh chứng minh:** `npm run typecheck && npm run lint && npm test && npm run build` ·
`npm run budget` · `npm run test:e2e -- --grep "khoa/ai"`.

## ⑥ Bất biến không được phá

| Bất biến                                                 | Test canh                              |
| -------------------------------------------------------- | -------------------------------------- |
| Khoá `git` + xương sống P1–P6 không đổi                  | `courses.test.ts` (không hồi quy)      |
| `agentSim` tất định tuyệt đối, không I/O/mạng            | `agentSim.test.ts` (chạy 2 lượt)       |
| Mỗi lượt chạy in dòng tự khai `[GIA LAP]`                | `agentSim.test.ts`                     |
| Nội dung bài MỘT nguồn — khoá tham chiếu id, không nhúng | `courses.test.ts`                      |
| Không nhại tên sản phẩm thật trong nội dung bài          | rà tay khi review nội dung (C1–C5)     |
| Khoá tiến độ đã ghi Postgres không đổi nghĩa             | regex `progress.ts` chỉ NỚI, không đổi |

## Quy ước phải theo

Comment tiếng Việt · import xuyên gói `@dhcb/...` không đuôi `.js`, nội bộ gói tương đối có
`.js` · conventional commits scope chữ thường (`feat(programming): ...`) · mỗi bài đủ 8 bước +
2–4 thẻ SRS · terminal giả lập xuất **không dấu** (đúng `gitSim`/`bashSim`) · a11y AAA nội
dung / AA còn lại, màu từ token `--a-*`.

## Nghiệm thu — chia 4 PR (PR 1 là chính tài liệu này)

| PR  | Nội dung                                                          | Vì sao tách                                                            |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Đặc tả này                                                        | Chốt thiết kế + phạm vi trước khi viết code, người dùng duyệt được sớm |
| 2   | `agentSim.ts` + test + ngôn ngữ `'agent'` + runner + nới regex id | Hạ tầng, rủi ro cao nhất; review độc lập với nội dung                  |
| 3   | Khoá `ai` + chương C1–C2 (6 bài) + E2E vào thẳng                  | Lát cắt dọc đầu tiên chạy được thật trên trang khoá                    |
| 4   | Chương C3–C5 (10 bài)                                             | Khối nội dung lớn nhất, đi cuối                                        |

**Câu hỏi mở cho người dùng (không chặn PR 2):** ① tên tác tử hư cấu `tro` ổn chưa hay muốn tên
khác (đổi rẻ nhất là trước PR 3)? ② phần "Tự host AI / công cụ cụ thể" (nửa II–IV của khoá tham
chiếu) có muốn thành khoá ngắn thứ ba sau khi khoá này xong không?
