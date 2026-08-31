# Đặc tả: KHOÁ RIÊNG "OpenClaw — dựng trợ lý AI của riêng bạn" (khoá ngắn thứ ba)

> Ngày 2026-08-31. Khoá ngắn thứ ba của môn Lập trình, LÀM ĐÚNG THEO TIỀN LỆ khoá Hermes
> (`docs/specs/2026-08-31-khoa-dieu-phoi-ai-van-phong.md`, chốt PR #751; hạ tầng `hermesSim`
>
> - C1 đã merge ở PR khoá Hermes 2/3): dạy CÀI ĐẶT — CẤU HÌNH — SỬ DỤNG — VẬN HÀNH tác tử
>   OpenClaw, chấm bằng bộ mô phỏng tất định `openclawSim` (khuôn `gitSim`/`hermesSim`),
>   làm thật để ở homework.
>   Khuôn: `docs/templates/dac-ta-tinh-nang.md`.

## 0. Một câu

Khoá học ĐỘC LẬP **"OpenClaw — dựng trợ lý AI của riêng bạn"** (`/lap-trinh/khoa/openclaw`,
20 bài / 4 chương) dạy người không chuyên và người điều phối dev tự cài đặt, nối kênh nhắn tin,
cấu hình an toàn và vận hành trợ lý AI OpenClaw trên máy của mình, chấm bài bằng bộ mô phỏng
tất định `openclawSim` — không gọi AI thật, không mạng thật khi chấm.

## 1. Nghiên cứu đầu vào

### 1.1. OpenClaw là gì (tra cứu thật 2026-08-31, không đoán)

**OpenClaw** — trợ lý AI cá nhân mã nguồn mở, TỰ HOST ("Your own personal AI assistant. Any
OS. Any Platform." — github.com/openclaw/openclaw, docs.openclaw.ai). Điều đã xác minh từ tài
liệu chính thức + docs cộng đồng:

- **Cài đặt**: script một dòng (`curl -fsSL https://openclaw.ai/install.sh | bash`,
  Windows dùng PowerShell `install.ps1`); có đường Docker/Nix. Sau cài chạy
  **`openclaw onboard`** — trình hướng dẫn kiểm model, tạo workspace, cấu hình Gateway
  (biến thể `openclaw setup --baseline` tạo config nền không qua wizard).
- **Kiến trúc Gateway**: Gateway là "control plane" chạy trên máy người dùng, quản phiên,
  công cụ, sự kiện và kết nối kênh; Control UI (web) · CLI · TUI đều nối vào Gateway.
  Lệnh: `openclaw gateway start|stop|restart|status` · `openclaw dashboard` (mở Control UI)
  · `openclaw chat` (chat ngay trong terminal) · `openclaw doctor` (chẩn đoán).
- **Kênh nhắn tin**: WhatsApp · Telegram · Discord · Slack · Signal · iMessage — cấu hình
  trong `~/.openclaw/openclaw.json` mục `channels`, quản bằng
  `openclaw channel add|remove|list|status|reconnect`. **An toàn theo thiết kế**: danh sách
  `allowFrom` (chỉ số/tài khoản được phép), `dmPolicy`/`groupPolicy` (mặc định chặn người lạ),
  token bot giữ như mật khẩu.
- **Model**: `openclaw models` — nhiều provider, chọn model chính + model rẻ dự phòng trong
  config; nối được endpoint tự host kiểu OpenAI-API.
- **Skills**: kho kỹ năng cài thêm được (`openclaw skills` liệt kê/soi; bật tắt theo agent
  qua `agents.defaults.skills` / `agents.entries`); slash trong chat: `/config` (đọc-ghi
  config), `/mcp` (quản MCP server), `/plugins` (cài/bật plugin).
- **Tự động hoá**: `openclaw cron` — tạo/sửa/bật/tắt/kích tay việc chạy theo lịch; webhook
  cho luồng sự kiện; sandbox + cơ chế duyệt lệnh (approvals) cho lệnh chạy trên máy thật.
- **Multi-agent**: `openclaw agents list|add|delete|bind|unbind` — nhiều agent tách biệt
  workspace/bộ nhớ/skill; "routing bindings" ghim lưu lượng một kênh vào một agent.

### 1.2. Vì sao đáng dạy — và dạy KHÁC khoá Hermes chỗ nào

Khoá Hermes dạy **giao việc & điều phối** (goal/steer, Linear, Paperclip — lăng kính "quản
một đội agent"). Khoá OpenClaw dạy **TỰ CHỦ HẠ TẦNG**: trợ lý chạy TRÊN MÁY CỦA BẠN, dữ liệu
không rời nhà, tự nối kênh, tự đặt hàng rào an toàn, tự vận hành (doctor, backup, cập nhật).
Năng lực đích: "tôi tự dựng và tự chịu trách nhiệm một trợ lý AI" — bậc tiếp theo sau "tôi
biết dùng một trợ lý ai đó dựng sẵn". Hai khoá bổ nhau, không thay nhau; bài trùng khái niệm
(Docker, gateway, skill) NHẮC LẠI có chủ đích với công cụ khác — đúng tinh thần SRS.

**Trọng tâm sư phạm riêng của khoá này: AN TOÀN.** OpenClaw là agent có quyền chạy lệnh trên
máy thật và nhận tin từ Internet — khoá phải dạy `allowFrom`/`dmPolicy` chặn người lạ, giữ
token, sandbox/approvals, và thói quen "quyền hẹp nhất đủ dùng" NGAY TỪ BÀI NỐI KÊNH, không
để cuối khoá.

### 1.3. Đối tượng

- **Người dùng cá nhân không chuyên**: tự cài OpenClaw, nối Telegram/WhatsApp, có trợ lý
  riêng tư trên máy mình; biết tự kiểm tra sức khoẻ hệ thống và tự khoá cửa an toàn.
- **Người bắt đầu điều phối dev / IT phòng ban**: dựng OpenClaw làm trợ lý chung, chia agent
  theo vai, đặt cron cho việc lặp của phòng, hiểu ranh giới quyền trước khi mở cho đồng nghiệp.
- `prerequisites: []` — vào thẳng; mọi lệnh gõ trong terminal giả lập của bài học.

### 1.4. Hiện trạng hạ tầng (đo thật từ mã nguồn 2026-08-31)

| Thứ                                    | Số thật hôm nay                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| Tầng khoá ngắn `courses/`              | ĐÃ CÓ: khoá `git` + `hermes`; đăng ký khoá mới = 1 file + 1 dòng registry              |
| Trang khoá `/lap-trinh/khoa/:courseId` | ĐÃ CÓ, data-driven — khoá mới tự hiện ở `ProgrammingHome`                              |
| Khuôn bài 8 bước + SRS                 | ĐÃ CÓ (`lessonTypes.ts`)                                                               |
| Khuôn "máy ảo tí hon tất định"         | ĐÃ CÓ ×3: `bashSim` · `gitSim` · `hermesSim` — `openclawSim` là con thứ tư cùng khuôn  |
| Khuôn runner không worker              | ĐÃ CÓ (`gitRunner.ts`/`hermesRunner.ts`)                                               |
| Regex `lessonId`                       | `^(p[1-6]-u\d+-l\d+\|git-u\d+-l\d+\|hermes-u\d+-l\d+)$` ở 3 chỗ — nới thêm `openclaw-` |
| Bài dùng lại được                      | 0 — 20/20 bài mới                                                                      |

## ② Phạm vi

**LÀM:**

- **Bộ mô phỏng `openclawSim.ts`** — mô phỏng CLI + Gateway OpenClaw THẬT: máy ảo tí hon
  thuần TypeScript, tất định tuyệt đối, in dòng tự khai `[GIA LAP]` mỗi lượt. Bộ lệnh đóng
  (xem ③). Phản hồi "AI" là văn bản đóng hộp tất định.
- **Ngôn ngữ bài học mới `'openclaw'`** trong `LESSON_LANGUAGES` + `openclawRunner.ts`
  (khuôn `hermesRunner.ts`, không worker) + nhãn `LangBadge` ("OpenClaw · mô phỏng").
- **Khoá `openclaw` 4 chương / 20 bài** (id `openclaw-uN-lM`, unit ảo `openclaw-uN`):

  | Chương                    | Bài | Danh sách bài (góc nhìn tự chủ hạ tầng + an toàn)                                                                                                                                                                                                                                                                                                                 |
  | ------------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | C1 Cài đặt & làm quen     | 6   | OpenClaw là gì — trợ lý tự host vs trợ lý đám mây · Cài đặt (script một dòng / Docker) & `openclaw onboard` · Kiến trúc Gateway (control plane trên máy bạn; start/stop/status) · Dashboard & chat terminal (`openclaw dashboard`, `openclaw chat`) · Cấu hình model (`openclaw models`, model chính + model rẻ) · `openclaw doctor` — tự chẩn đoán khi trục trặc |
  | C2 Nối kênh & khoá cửa    | 5   | Nối Telegram (BotFather, token giữ như mật khẩu) · Nối WhatsApp/Discord — một Gateway nhiều kênh · `allowFrom` & `dmPolicy` — mặc định chặn người lạ · `groupPolicy` — agent trong nhóm chat (khi nào được nói) · Sandbox & approvals — agent muốn chạy lệnh trên máy thật thì NGƯỜI duyệt                                                                        |
  | C3 Skills & tự động hoá   | 5   | Kho skills — xem/soi/bật kỹ năng (`openclaw skills`) · `/config` `/plugins` `/mcp` — chỉnh trợ lý ngay trong chat · `openclaw cron` — việc lặp chạy theo lịch (báo cáo sáng, nhắc hạn) · Webhook — trợ lý phản ứng theo sự kiện · Nối model tự host (endpoint kiểu OpenAI — dữ liệu không rời máy)                                                                |
  | C4 Nhiều agent & vận hành | 4   | `openclaw agents` — mỗi vai một agent, tách workspace/bộ nhớ · Routing bindings — ghim kênh nào vào agent nào · Vận hành dài hạn: backup config, cập nhật phiên bản, đọc log · Tổng kết: checklist "trợ lý của tôi đã an toàn chưa?" (rà toàn bộ hàng rào C2)                                                                                                     |

- **Luật soạn bài cho công cụ thật** (đúng luật khoá Hermes): bước ①–⑤ dạy khái niệm + lệnh
  qua `openclawSim` (Predict/Parsons trên transcript lệnh thật); bài Make chấm phần MÔ PHỎNG
  ĐƯỢC tất định (chuỗi lệnh + trạng thái gateway/kênh/agent/cron đúng); bước ⑦ homework là
  LÀM THẬT trên máy học viên (chạy script cài thật, tạo bot BotFather thật, mở dashboard
  thật…) — không chấm, có checklist tự kiểm. Bài học NÓI THẲNG chỗ nào là giả lập.
- Cổng chấm: `openclawSim.test.ts` + `lessonsOpenclaw.test.ts` (mọi `sampleSolution` đạt
  100% test-case). Nới regex id ở 3 chỗ (`lessonTypes.ts` · `progress.ts` · `feedback.ts`).

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **KHÔNG gọi AI thật, mạng thật, Docker thật trong bài học/chấm bài** — mô phỏng tất định
  100%. Làm thật để ở homework, không chấm.
- **KHÔNG đụng** khoá `git`, khoá `hermes`, `curriculum.ts`, hai tầng còn lại của môn.
  KHÔNG dùng chung máy `hermesSim` (hai bộ lệnh khác nhau; ghép chung là nợ) — chỉ dùng
  chung KHUÔN.
- **KHÔNG** mô phỏng UI dashboard/Control UI (là web app thật): bài dashboard dạy qua
  mô tả + ảnh chụp thật + transcript CLI; sim chỉ mô phỏng LỆNH.
- **KHÔNG** dạy viết skill/plugin mới cho OpenClaw (năng lực dev, để dành khoá sau nếu cần)
  — khoá này dừng ở CÀI ĐẶT & SỬ DỤNG như người dùng yêu cầu.
- **KHÔNG nhúng/redistribute** tài liệu OpenClaw — lời giảng, ví dụ, bài tập tự soạn,
  bối cảnh đời sống/văn phòng Việt Nam.

## ③ Hợp đồng dữ liệu — `openclawSim`

Cùng hình dạng với `hermesSim`; chấm bài Make bằng **TRẠNG THÁI**, không so chuỗi thô.

```ts
export const DONG_TU_KHAI_OPENCLAW =
  '[GIA LAP] Mo phong OpenClaw cua DHCB de hoc — khong phai AI that, khong goi mang.'

export interface OpenclawRunResult {
  output: string
  error?: string
  /** Trạng thái cuối để chấm. */
  state: {
    daCai: boolean // đã qua install + onboard chưa
    gateway: 'dung' | 'dang-chay' // openclaw gateway start/stop
    modelChinh: string | null
    kenh: Array<{
      ten: 'telegram' | 'whatsapp' | 'discord'
      trangThai: 'cho-token' | 'da-noi'
      allowFrom: string[] // rỗng = chặn hết người lạ (mặc định an toàn)
      dmPolicy: 'chan-nguoi-la' | 'mo'
    }>
    kyNang: string[] // skill đã bật
    cron: Array<{ id: string; lich: string; ten: string; bat: boolean }>
    agents: Array<{ ten: string; kenhGhim: string[] }> // routing bindings
    choDuyet: string[] // lệnh máy thật đang chờ NGƯỜI duyệt (approvals)
  }
}
```

**Bộ lệnh mô phỏng (đóng, tất định — theo CLI OpenClaw THẬT đã xác minh ở 1.1):**
`openclaw onboard` · `openclaw gateway start|stop|status` · `openclaw dashboard` ·
`openclaw chat "<tin>"` · `openclaw doctor` · `openclaw models [use <tên>]` ·
`openclaw channel add|remove|list|status <kênh>` · `openclaw channel allow <kênh> <ai>` ·
`openclaw skills [list|info <tên>]` · `openclaw cron add|list|enable|disable|run <…>` ·
`openclaw agents list|add|delete|bind|unbind <…>` · slash trong chat: `/config` · `/plugins`
· duyệt lệnh: `duyet <id>` · `tuchoi <id> "<lý do>"`. Danh sách chốt cứng ở PR 2; lệnh ngoài
danh sách → "mô phỏng không làm việc này" + chỉ chỗ đọc thêm (luật `gitSim`).

**Luật sư phạm nạp vào sim:**

- Kênh mới thêm luôn ở `dmPolicy: 'chan-nguoi-la'` và `allowFrom` RỖNG — học viên phải TỰ
  mở từng người (`channel allow`); tin từ người lạ trong kịch bản bị chặn kèm giải thích
  (an toàn mặc định là bài học, không phải chú thích).
- Lệnh agent muốn chạy trên "máy thật" (kịch bản đóng hộp) vào hàng `choDuyet` — chỉ NGƯỜI
  `duyet` mới chạy; token/secret dán vào chat → cảnh báo + từ chối lưu.
- `gateway` chưa `dang-chay` mà gọi `chat`/`channel status` → lỗi chỉ đúng nguyên nhân +
  gợi `openclaw gateway start` (dạy tư duy "control plane trước, mọi thứ sau").

**Ca lỗi (một phần hợp đồng):** lệnh sai → lỗi tiếng Việt gợi lệnh gần đúng, KHÔNG stack
trace · `channel add` kênh đã có → nói rõ, không nhân đôi · `cron enable` id không tồn tại →
kể id đang có · `bind` agent chưa tạo → gợi `agents add` · khoá trỏ id bài không tồn tại →
CI đỏ ở `courses.test.ts`.

## ④ Điểm chạm

| Việc | Đường dẫn                                                             | Ghi chú                                         |
| ---- | --------------------------------------------------------------------- | ----------------------------------------------- |
| Thêm | `packages/subject-programming/openclawSim.ts` + `openclawSim.test.ts` | Máy ảo mới — rủi ro cao nhất, PR riêng          |
| Sửa  | `packages/subject-programming/lessonTypes.ts`                         | +`'openclaw'` vào `LESSON_LANGUAGES`, nới regex |
| Thêm | `packages/subject-programming/courses/openclaw.ts`                    | Khoá (nới `ShortCourseId`)                      |
| Sửa  | `packages/subject-programming/courses/registry.ts`                    | +1 import, +1 phần tử                           |
| Thêm | `lessons/openclawu1.ts … openclawu4.ts` + `lessonsOpenclaw.test.ts`   | 20 bài mới                                      |
| Sửa  | `packages/subject-programming/lessons.ts`                             | +4 import                                       |
| Sửa  | `apps/server/src/api/subjects/programming/{progress,feedback}.ts`     | nới regex `lessonId` (tiền lệ `hermes-u`)       |
| Thêm | `apps/dhcb/src/lib/openclawRunner.ts`                                 | khuôn `hermesRunner.ts`, không worker           |
| Sửa  | `apps/dhcb/src/lib/codeRunner.ts` + `LangBadge`                       | nối ngôn ngữ `'openclaw'` (nhãn "mô phỏng")     |

Không cần route/trang mới (data-driven), không cần migration (`lesson_id` là `text`).
`lessonTypes.ts` và `codeRunner.ts` là điểm nóng — chạy `npm run codemap -- impact` trước
khi sửa, dán kết quả vào PR.

## ⑤ Tiêu chí chấp nhận

- [ ] `openclawSim` tất định: cùng chuỗi lệnh 2 lượt → output byte-identical; không
      `Date.now()`, không random (test canh) — kể cả lệnh `cron` (lịch chỉ là DỮ LIỆU,
      sim không bao giờ "đến giờ chạy"; kích tay bằng `cron run`).
- [ ] `openclawSim.test.ts` phủ từng lệnh + đủ ca lỗi ③ + 3 luật sư phạm.
- [ ] Mọi `sampleSolution` của 20 bài đạt 100% test-case (`lessonsOpenclaw.test.ts`).
- [ ] `courses.test.ts`: mọi `lessonIds` khoá `openclaw` tra ra bài thật; khoá `git` +
      `hermes` không đổi.
- [ ] Vào thẳng `/lap-trinh/khoa/openclaw` khi chưa học gì vẫn học được bài đầu (E2E).
- [ ] Bài Make chấm bằng `state`, không so output thô; mỗi bài công cụ thật có homework
      "làm thật + checklist tự kiểm"; bài cuối C4 có checklist an toàn tổng.
- [ ] Coverage branches ≥ 90 · Initial JS < 140 kB (runner nạp lười).
- [ ] `npm run eval:code-feedback` không phát sinh ca vi phạm mới.

**Lệnh chứng minh:** `npm run typecheck && npm run lint && npm test && npm run build` ·
`npm run budget` · `npm run test:e2e -- --grep "khoa/openclaw"`.

## ⑥ Bất biến không được phá

| Bất biến                                                 | Test canh                              |
| -------------------------------------------------------- | -------------------------------------- |
| Khoá `git` + `hermes` + xương sống P1–P6 không đổi       | `courses.test.ts` (không hồi quy)      |
| `openclawSim` tất định tuyệt đối, không I/O/mạng         | `openclawSim.test.ts` (chạy 2 lượt)    |
| Mỗi lượt chạy in dòng tự khai `[GIA LAP]`                | `openclawSim.test.ts`                  |
| Kênh mới sinh ra LUÔN ở trạng thái chặn người lạ         | `openclawSim.test.ts` (luật sư phạm ①) |
| Nội dung bài MỘT nguồn — khoá tham chiếu id, không nhúng | `courses.test.ts`                      |
| Nội dung tự soạn, không chép tài liệu OpenClaw           | rà tay khi review nội dung C1–C4       |
| Khoá tiến độ đã ghi Postgres không đổi nghĩa             | regex `progress.ts` chỉ NỚI, không đổi |

## Quy ước phải theo

Comment tiếng Việt · import xuyên gói `@dhcb/...` không đuôi `.js`, nội bộ gói tương đối có
`.js` · conventional commits scope chữ thường · mỗi bài đủ 8 bước + 2–4 thẻ SRS · terminal
giả lập xuất **không dấu** · a11y AAA nội dung / AA còn lại, màu từ token `--a-*`.

## Nghiệm thu — chia 3 PR (PR 1 là chính tài liệu này)

| PR  | Nội dung                                                                                                         | Vì sao tách                                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Đặc tả này                                                                                                       | Chốt thiết kế + phạm vi, người dùng duyệt được sớm                                                                     |
| 2   | `openclawSim.ts` + test + ngôn ngữ `'openclaw'` + runner + nới regex + khoá `openclaw` + chương C1 (6 bài) + E2E | Hạ tầng + lát cắt dọc đầu tiên (theo bài học PR Hermes 2/3: gộp vì cổng nội dung chỉ chạy khi bài đã nối `lessons.ts`) |
| 3   | Chương C2–C4 (14 bài)                                                                                            | Khối nội dung lớn nhất, đi cuối (tách 3a/3b nếu phình)                                                                 |

**Câu hỏi mở cho người dùng (không chặn PR 2):** ① OpenClaw phát triển rất nhanh — chấp nhận
nội dung phải cập nhật theo phiên bản, hay thêm dòng "soạn theo bản 2026.x" vào từng bài?
② kênh iMessage/Signal chỉ nhắc tên trong bài "một Gateway nhiều kênh" (không có bài riêng —
người học Việt Nam chủ yếu dùng Telegram/Zalo/Messenger) — đồng ý vậy chứ?
