# Kiến trúc nền tảng DHCB — "Đồng hành cùng bạn" (chốt 2026-08-23)

> Người dùng chốt tầm nhìn: **DHCB là nền tảng phát triển mọi mảng liên quan đến cá nhân của
> một người; English chỉ là MỘT MÔN HỌC như mọi môn khác.** Tài liệu này là đặc tả kiến trúc
> theo tầm nhìn đó, thay thế cách đóng khung "app gia sư tiếng Anh" cũ. Yêu cầu đi kèm: mọi
> cấu trúc và phát triển phải theo **tiêu chuẩn cao nhất của ngành**.

## 1. Mô hình khái niệm

```
DHCB Platform (một người dùng — một hồ sơ — một dòng dữ liệu cá nhân)
├─ Companion ("Bạn Đồng Hành") — tác tử AI xuyên suốt, biết ngữ cảnh mọi trụ
├─ Trụ LEARNING (học tập)
│  ├─ Môn english  ← môn ĐẦU TIÊN, đã chín (3 chế độ, CEFR/SRS, TTS/STT)
│  └─ Môn math/physics/chemistry/biology… ← cùng KHUÔN môn học (mục 4)
├─ Trụ CAREER (sự nghiệp) · WORK (công việc) · STARTUP · LIFE (đời sống)
└─ Nền dùng chung: auth · billing · usage · personal data (facts/memory/
   consent/life-graph) · AI gateway · thông báo · admin
```

Nguyên tắc rút ra (và đối chiếu chuẩn ngành):

1. **Modular monolith trước, không microservices** — một server Express, ranh giới module
   bằng gói workspace + luật import (ESLint) + schema Postgres riêng từng domain. Đây là
   khuyến nghị chuẩn hiện nay cho đội nhỏ (tách service chỉ khi có áp lực scale thật).
2. **Subject là plugin của trụ Learning** — thêm môn mới KHÔNG được đòi sửa nền tảng; nền
   tảng expose khuôn (registry, tiến độ, lượt dùng, thanh toán) và môn cắm vào (mục 4).
3. **Một nguồn sự thật cho dữ liệu cá nhân** — mọi trụ ghi về Postgres schema riêng
   (`personal/career/work/startup/life/english`), KHÔNG state in-memory (nợ N1/N3 hiện tại).
4. **Đặt tên phản ánh vai trò**: cái gì của nền tảng mang tên nền tảng (`@dhcb/app`,
   `packages/core-*`), cái gì của môn mang tên môn (`subjects/english`, `subject-english`).

## 2. Hiện trạng sau PR-S2b (đã thực thi)

- `apps/english` → **`apps/dhcb`** (gói `@dhcb/app`): app chính giờ mang đúng tên nền tảng —
  nó vốn chứa toàn bộ platform (companion, 4 trụ đời sống, admin, phòng học đa môn), phần
  riêng môn Anh chỉ là `src/pages/subjects/english/` + `src/data/` + `src/prompts/`.
- Alias `@english/*` đã XOÁ (0 nơi dùng — không giữ khái niệm chết). Alias còn lại:
  `@dhcb/*` (workspace packages) và `@core` (packages/core-ui).
- URL công khai, route, schema `english.*`, nội dung môn — KHÔNG đổi (người dùng cuối không
  thấy khác biệt).

## 3. Cây thư mục đích (điều chỉnh platform-first so với đặc tả cải tổ cũ)

```
donghanh/
├─ apps/
│  ├─ dhcb/                        # ✅ App nền tảng (đổi tên từ english, PR-S2b)
│  │  └─ src/
│  │     ├─ pages/{core,companion,learning,domains,subjects/english}
│  │     ├─ components/ · lib/     # (S5 sắp lại khớp taxonomy pages)
│  │     └─ data/ · prompts/       # dữ liệu/prompt MÔN ANH — sẽ theo môn khi tách subject
│  ├─ hub/                         # landing apex — giữ; về lâu dài cân nhắc gộp vào dhcb
│  └─ server/                      # (S3) Express + api/
├─ packages/
│  ├─ core-*                       # nền tảng dùng chung (17 gói hiện có + core-http)
│  └─ subject-english/             # (S4, ĐỔI so với đặc tả cũ "core-english"):
│                                  # cefr*, dictionary, wordFreq, viseme, espeak…
├─ api/ → (S3) apps/server/src/api/
│  ├─ {core,admin,personal,domains,platform}/
│  └─ subjects/english/            # (S4, ĐỔI so với "api/english/"): dictionary,
│                                  # pronunciation, pronounce-assess, tutor-feedback,
│                                  # challenge, echo-shadowing, phonetics…
└─ postgres/  scripts/  e2e/  docs/
```

Khác biệt so với `dac-ta-cai-to-cau-truc-2026-08-23.md` (vẫn hiệu lực phần còn lại):
`core-english` → **`subject-english`**, `api/english/` → **`api/subjects/english/`** — để mọi
môn sau này (`subject-math`…) theo đúng một khuôn, và để phân biệt rõ 2 loại gói:
`core-*` = nền tảng, `subject-*` = môn học.

## 4. Khuôn "thêm một môn học mới" (chuẩn hoá từ những gì english đã có)

Một môn học đầy đủ gồm 5 mảnh, mảnh nào cũng có chỗ đứng định sẵn:

| Mảnh                | Chỗ đứng                              | English hiện tại                                       |
| ------------------- | ------------------------------------- | ------------------------------------------------------ |
| Khai báo môn        | `subjectRegistry` (`core-learner`)    | ✅ đã có (english + 4 môn STEM ở dạng khai báo)        |
| UI môn              | `apps/dhcb/src/pages/subjects/<môn>/` | ✅ `subjects/english/` (18 file)                       |
| Logic + dữ liệu môn | `packages/subject-<môn>/`             | ⏳ S4 (đang rải ở `api/_lib` + `core-ai` + `src/data`) |
| API môn             | `api/subjects/<môn>/`                 | ⏳ S4 (đang phẳng trong `api/`)                        |
| Dữ liệu bền         | Postgres schema `<môn>.*`             | ✅ schema `english` (7 bảng)                           |

Dịch vụ nền tảng môn nào cũng dùng, KHÔNG tự chế lại: auth/usage (đếm lượt theo mode),
billing (gói Pro/VIP), tiến độ + SRS (đang là của english — S4 cân nhắc kéo phần chung về
`core-learner`), TTS/STT/AI gateway (`core-ai`), theme/a11y (`core-ui`).

Định nghĩa xong khuôn này thì `core-grading` (engine chấm STEM 1.355 dòng đang mồ côi) có chỗ
quay lại: nó là mảnh "logic môn" của `subject-math/physics/chemistry` khi các môn đó làm thật.

## 5. Tiêu chuẩn ngành — đang đạt gì, còn thiếu gì (trung thực)

**Đã đạt:** TS strict toàn repo · workspace npm thật + project references (S1) · boundary
enforce bằng lint (`packages ↛ apps`, `packages ↛ api`) · conventional commits + PR policy ·
CI 3 job (typecheck/lint/format/test+coverage sàn 90/build/size-budget/boot-check + e2e a11y
WCAG 15 trang × 5 theme) · migration đánh số + backup/restore kiểm chứng · secret qua env ·
zero-downtime deploy (PM2 wait_ready).

**Còn thiếu so với "cao nhất của ngành" (cập nhật trạng thái 2026-08-23 cuối ngày):**

1. Persistence 33 API in-memory — **ĐÃ TRẢ PHẦN LỚN**: nền `platform.feature_state`
   (0058) + lô B (5 handler per-user, PR #625) + **N3 (2026-08-23): nhóm A đã GỘP/XOÁ**
   (daily-quests + referral-vip xoá hẳn, leaderboard giả xoá) và **PvP chuyển feature_state**
   (Elo thật K=32, trận vs Ghost per-user). Còn nhóm C multi-user realtime (phòng
   co-learning, WS session, mesh-telemetry, debate/stem/orchestrator session) — cần shared
   store khi dùng thật, đã ghi ở PROGRESS.
2. ~~Đếm lượt/rate-limit đủ 100% đường AI trả tiền~~ **ĐÃ XONG** (B3): companion/
   vision-solve/ambient-vision trừ `chat` + refund; gemini-live rate-limit + trừ `speaking`;
   co-learning rate-limit. Kèm B1 (bỏ fallback u-default), B2 (health/deep gate admin),
   B5 (scheduler instance 0), B6 (trùng route + JSON 404).
3. `quality`/`e2e` phải là **required status check** — VIỆC TAY người dùng trên GitHub
   Settings → Branches, chưa làm được từ phía AI.
4. ~~`npm audit` + `codemap cycles` vào CI~~ **ĐÃ XONG** (2 gate mới trong job quality).
5. Observability: Sentry đã có. **Alert chi phí AI theo token thật ĐÃ XONG (N4, 2026-08-23)**:
   bảng `platform.ai_token_usage_daily` (migration 0059) ghi token THẬT do nhà cung cấp báo về
   cho đường chat gia sư + Companion, quy giá bằng `capabilityCostTracker`, ngưỡng
   `AI_DAILY_BUDGET_USD` cảnh báo 1 lần/ngày, dashboard admin hiện cạnh số ước tính cũ. CÒN
   THIẾU: uptime monitor (cần dịch vụ ngoài — việc tay người dùng) và TTS/STT/chấm phát âm
   (tính theo ký tự/giờ audio, không theo token — vẫn dùng ước tính).
6. ~~Một lộ trình duy nhất~~ **ĐÃ CHỐT Q2**: thi hành = PROGRESS.md + tài liệu này;
   MASTER_SPEC = tầm nhìn; `docs/phases/` + `docs/architecture-v2/` = tham khảo (đã gắn banner).

## 6. Trình tự còn lại (điều chỉnh)

~~S3 (server → `apps/server/`)~~ ✅ ĐÃ XONG (cùng ngày) · ~~N1~~ ✅ ĐÃ XONG trong PR #625 (vá tiền/bảo mật — không
phụ thuộc cấu trúc) → ~~S4 (chia `api/` + `subject-english` + `core-domains`)~~ ✅ ĐÃ XONG (cùng ngày) → ~~S5~~ ✅ (thu hẹp: xoá mồ côi kiểm chứng; regroup components/lib HOÃN sau N3 — xem ADR-0004 mục 6) → ~~S6~~ ✅ (archive 24 script + ADR-0004). **Lộ trình S1→S6 HOÀN TẤT 2026-08-23.** ~~N3~~ ✅ (PR #629) → ~~N4~~ ✅ (đo chi phí AI theo
token thật + cảnh báo ngân sách). Còn lại: việc tay của người dùng (required status check,
uptime monitor) + persistence nhóm C khi các tính năng realtime được dùng thật.
