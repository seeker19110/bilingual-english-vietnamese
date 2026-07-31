# Đặc tả GĐ1 — Tách lõi dùng chung + trang hub

> Ngày: 2026-07-31 · Căn cứ: `docs/adr/0001-nen-tang-da-linh-vuc.md`
> Trạng thái: **đặc tả, chưa thi hành** · Ước lượng: 4–6 tuần, 8 PR
> Cập nhật 2026-07-31: chốt 3 điểm còn mở — tiền tố SePay `DHCB`, tách schema dữ liệu học theo môn,
> cơ chế học/ôn tách riêng từng môn (xem §2).
> **Nguyên tắc xuyên suốt GĐ1: đây là REFACTOR THUẦN. Không thêm một tính năng nào cho người dùng cuối. Nếu một PR vừa di chuyển file vừa đổi hành vi → tách làm hai PR.**

---

## 0. Trạng thái xuất phát (đã đọc repo, không đoán)

| Thành phần       | Hiện tại                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend         | `src/` — 47 component, 102 file `lib`, ~24 page                                                                                                           |
| Backend          | `api/` — ~50 handler + `api/_lib/` 86 file; `server.ts` gắn handler                                                                                       |
| Build            | `npm run build` = gen-data-manifest → `tsc` → `tsc -p tsconfig.api.json` → `vite build` → `build:server` (`tsc -p tsconfig.server.json` → `dist-server/`) |
| Chạy             | PM2 fork/cluster `node dist-server/server.js`, port 3001, Nginx `nginx/en-vi.conf`                                                                        |
| DB               | `postgres/schema.sql`, 13 bảng, tất cả trong `public`; migration mới nhất `0027`                                                                          |
| Đường dẫn import | **Tương đối, KHÔNG có alias** (`vite.config.ts` và `tsconfig.json` không khai báo `alias`/`paths`)                                                        |

> Ghi chú quan trọng: vì repo **chưa có alias**, mỗi lần di chuyển file là một loạt đổi đường dẫn
> tương đối. PR-1 sẽ dựng alias trước để các PR sau chỉ đổi _một_ tên alias thay vì hàng trăm `../../`.

---

## 1. Đích đến — cây thư mục sau GĐ1

```
package.json                  ← workspaces root, script điều phối
packages/
  core-auth/                  ← đăng ký/đăng nhập/token/Google, middleware validateAuth
  core-billing/               ← SePay, plan_prices, plan_features, promo, đếm lượt
  core-ai/                    ← aiConfig, gọi model, TTS/STT, cache mã hoá, fileStorage
  core-db/                    ← pgPool, chạy migration, helper truy vấn
  core-ui/                    ← theme + token --a-*, component dùng chung, layout, i18n
apps/
  english/                    ← toàn bộ app tiếng Anh hiện tại (src/ + api riêng của môn)
  hub/                        ← MỚI: trang giới thiệu + đăng nhập + điều hướng + bảng giá
server.ts                     ← một tiến trình: gắn API lõi + API từng môn, chọn dist theo Host
postgres/                     ← schema core + schema từng môn, migrations dùng chung
```

**Quy tắc phân loại — dùng khi phân vân một file thuộc `packages/` hay `apps/english/`:**

> Nếu app **Toán** cũng sẽ cần file này gần như nguyên vẹn → `packages/`.
> Nếu phải sửa nhiều mới dùng lại được → để nguyên ở `apps/english/`, tách sau khi môn Toán
> thật sự cần (tránh trừu tượng hoá sớm dựa trên phỏng đoán).

Áp quy tắc này vào hiện trạng:

| Vào `packages/`                                                                                                                                                                                | Ở lại `apps/english/`                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `api/auth.ts`, `_lib/authService.ts`, `adminAuth.ts`, `security.ts`, `emailVerification.ts`, `changeEmail.ts`                                                                                  | `api/dictionary.ts`, `pronunciation.ts`, `pronounce-assess.ts`, `avatar-visemes.ts`, `challenge.ts`  |
| `api/checkout.ts`, `payment-webhook.ts`, `payment-status.ts`, `payment-history.ts`, `plan-prices.ts`, `plan-features.ts`, `plan-marketing.ts`, `_lib/promo.ts`, `usage.ts`, `plan.ts`          | `api/tutor-feedback.ts`, `quests.ts`, `leaderboard.ts`, `history.ts`, `progress.ts`                  |
| `api/tts.ts`, `stt.ts`, `ai.ts`, `_lib/aiConfig.ts`, `aiCost.ts`, `openaiStt.ts`, `elevenLabsTts.ts`, `azurePronounce.ts`, `fileStorage.ts`                                                    | `src/data/**` (từ điển, CEFR), `src/prompts/**`, `src/pages/**`                                      |
| `_lib/pgPool.ts`, `date.ts`, `base64.ts`, `concurrencyLimiter.ts`, `settings.ts`                                                                                                               | `src/lib/curriculum.ts`, `cefr*.ts`, `vocab.ts`, `wordForms.ts`, `pos.ts`, `dictionaryApi.ts`        |
| `src/lib/theme.ts`, `auth.ts`, `authHeader.ts`, `payment.ts`, `planFeatures.ts`, `promo.ts`, `errorTracking.ts`, `storage.ts`, `date.ts`, `haptics.ts`, `sound.ts`, `deviceId.ts`, `uiLang.ts` | `src/lib/pronounce*.ts`, `listening.ts`, `placement.ts`, `mistakes.ts`, `challenge*.ts`              |
| `src/components/ThemeToggle.tsx` + component nền (nút, thẻ, modal, trạng thái tải/rỗng/lỗi)                                                                                                    | các component gắn nội dung tiếng Anh (`WordCard`, `StudyTabs`, `CefrLessonViews`, …)                 |
| _(không có)_ — mọi thứ thuộc **học tập/ôn tập** ở lại app, xem §2.3                                                                                                                            | `src/lib/srs.ts`, `cefrProgress.ts`, `stats.ts`, `achievements.ts`, `weeklyGoal.ts`, `curriculum.ts` |

⚠️ **`api/admin-*.ts`**: phần quản trị người dùng/gói/giá là lõi; phần thống kê học tập là của môn.
PR-4 tách theo đúng ranh giới đó, không bê nguyên cụm `admin-*` sang một bên.

---

## 2. Ba điểm ĐÃ CHỐT (2026-07-31) — trước đây để mở, nay không phải hỏi lại

### 2.1. Tiền tố SePay: **`DHCB` dùng chung toàn nền tảng** (không tách theo môn)

Nội dung chuyển khoản: `DHCB<mã đơn>`. Người dùng mua **một gói dùng cho mọi môn**, nên tiền tố
theo môn là sai mô hình kinh doanh — và người chuyển khoản chỉ cần nhớ một dạng nội dung.

**Ràng buộc bắt buộc — webhook phải chấp nhận CẢ HAI tiền tố mãi mãi:**

- `ENVI…` — giao dịch cũ, và cả những chuyển khoản mới của người dùng copy lại nội dung cũ.
- `DHCB…` — mặc định cho đơn mới.

Cách làm: hằng số `PAYMENT_PREFIX = 'DHCB'` (dùng khi **tạo** mã đơn) và
`ACCEPTED_PREFIXES = ['DHCB', 'ENVI']` (dùng khi **đối chiếu** webhook), đặt trong `core-billing`.
Tuyệt đối không xoá `ENVI` khỏi danh sách chấp nhận. Trên trang SePay nhớ **thêm** bộ lọc tiền tố
`DHCB` chứ không thay thế bộ lọc `ENVI` đang có.

**Kiểm thử bắt buộc:** một test cho mỗi tiền tố, cộng test mã đơn cũ dạng `ENVI…` vẫn khớp đúng
đơn hàng cũ trong bảng `payments`.

### 2.2. Dữ liệu học tập: **mỗi môn một schema riêng**

`core` giữ những gì không thuộc môn nào: `users`, `sessions`, `profiles`, `payments`,
`plan_prices`, `plan_features`, `app_settings`, `usage_events`, `push_subscriptions`.

Mọi bảng **dữ liệu học** chuyển sang schema của môn:

| Bảng hiện tại (đang ở `public`) | Sau GĐ1                                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `chat_sessions`                 | `english.chat_sessions`                                                                  |
| `writing_submissions`           | `english.writing_submissions`                                                            |
| `speaking_sessions`             | `english.speaking_sessions`                                                              |
| `learning_progress`             | `english.learning_progress`                                                              |
| `pronunciations`                | `english.pronunciations`                                                                 |
| `challenge_entries`             | `english.challenge_entries`                                                              |
| `tutor_feedback`                | `english.tutor_feedback`                                                                 |
| `tts_cache`                     | **ở lại `core`** — cache audio dùng chung, khoá là hash nội dung, môn nào cũng dùng được |

Môn Toán sau này có schema `math` với bảng **của riêng nó** (`math.attempts`, `math.problem_progress`,
`math.formula_reviews`…), **không** cố nhét vào bảng chung với tiếng Anh. Khoá ngoại về
`core.users(id)` là điểm nối duy nhất giữa các schema.

**Cách chuyển an toàn:** `alter table public.X set schema english` (đổi chỗ, **không** copy dữ liệu —
nhanh và không có nguy cơ lệch), rồi tạo `create view public.X as select * from english.X` để mã cũ
chưa kịp sửa vẫn chạy. Xoá view ở một PR sau, khi đã đổi hết truy vấn. Rollback: `set schema public`.
Nhớ đặt `search_path` của kết nối `pg` cho phù hợp, hoặc ghi rõ tên schema trong mọi câu truy vấn
(**khuyến nghị ghi rõ** — tường minh, không phụ thuộc trạng thái kết nối).

### 2.3. Cơ chế học & ôn tập: **tách riêng theo từng môn, KHÔNG đưa vào `core`**

`srs.ts`, `cefrProgress.ts`, `curriculum.ts`, `stats.ts`, `achievements.ts`, `weeklyGoal.ts` **ở lại
`apps/english/`**. Môn Toán tự viết cơ chế học/ôn của riêng nó, không kế thừa gì.

Lý do đúng đắn: ôn từ vựng và ôn công thức Toán khác nhau về bản chất — Toán còn phải sinh lại đề
theo tham số, chấm bước giải, phân biệt "sai vì nhầm dấu" với "chưa hiểu khái niệm". Một trừu tượng
SRS chung sẽ hoặc quá loãng để dùng được, hoặc biến thành nút thắt mà sửa cho môn này thì hỏng môn kia.

> ⚠️ Đánh đổi đã biết và **chấp nhận có chủ đích**: thuật toán lập lịch ôn (SM2/FSRS) sẽ tồn tại
> ở nhiều bản sao. Nếu sau này phát hiện lỗi trong công thức tính khoảng cách ôn, phải sửa ở từng
> môn. Ghi vào `PROGRESS.md` mục nợ kỹ thuật để không quên. Nếu tới môn thứ ba mà cả ba bản sao vẫn
> giống hệt nhau, khi đó **mới** tách phần hàm thuần ra dùng chung — tách dựa trên bằng chứng thật,
> không dựa trên phỏng đoán.

### 2.4. Hạn mức: **DÙNG CHUNG một bộ cho mọi môn, bằng tiếng Anh hiện tại** (chốt cuối 2026-07-31)

> Lịch sử quyết định tại chỗ này (giữ lại để không ai lật lại mà không biết): ban đầu định "kho chung
> toàn nền tảng" → sau đổi thành "chỉ áp cho tiếng Anh, môn khác không giới hạn" → **cùng ngày, chốt
> lại lần cuối**: mọi môn dùng chung một bộ hạn mức, giống hệt tiếng Anh. Xem ADR-0001 mục bổ sung 8.

- Mọi môn (`english`, `math`, `ly`, `hoa`, …) áp **cùng một cơ chế** đang chạy cho tiếng Anh: Free
  dùng cửa sổ trượt 7 ngày + thưởng khi học thật; Pro/VIP theo hạn mức ngày.
- Hạn mức là **kho chung theo người dùng**, cộng gộp mọi môn trong ngày/cửa sổ trượt — không phải
  N hạn mức riêng cộng lại. Đúng với nguyên tắc "một tài khoản, một gói cước dùng cho mọi môn".
- Không đổi hành vi của tiếng Anh trong GĐ1 — số đang hiển thị cho người dùng hiện tại phải giữ nguyên.

**Cách thi hành — vẫn giữ cấu hình theo môn làm phanh tay, chỉ đổi giá trị mặc định:**

```sql
-- Trong migration 0028, cạnh usage_events.
create table if not exists public.subject_limits (
  subject   text primary key,          -- 'english' | 'math' | ...
  enforced  boolean not null default true,   -- true = áp hạn mức (mặc định cho MỌI môn)
  updated_at timestamptz not null default now()
);
insert into public.subject_limits (subject, enforced) values ('english', true)
on conflict (subject) do nothing;
-- Môn mới thêm sau cũng insert với enforced = true (hoặc dựa vào default của cột).
```

`consumeUsage(userId, subject, mode)` được gọi ở mọi môn và **luôn kiểm tra hạn mức** khi
`enforced = true` (mặc định). Bảng `subject_limits` **vẫn giữ lại** dù không dùng "không giới hạn"
làm mặc định nữa — nó là chỗ admin bật `enforced = false` tạm thời cho một môn cụ thể khi cần
(ví dụ giai đoạn ra mắt muốn người dùng thử thoải mái), không cần deploy để bật lại sau đó.

`usage_events` đếm theo `(user_id, day, subject, mode)` để vẫn biết môn nào tốn bao nhiêu chi phí,
nhưng khi tính "còn bao nhiêu lượt hôm nay" của Free thì **cộng gộp mọi `subject`** của user trong
ngày/cửa sổ trượt — không tách riêng theo môn.

Vẫn giữ **rate limit kỹ thuật** (chống spam theo IP/token trong `api/_lib/security.ts`) cho mọi môn —
đây là chống lạm dụng hạ tầng, khác với hạn mức nghiệp vụ, và không được tắt.

### 2.5. Còn lại một điểm mở

**`weeklyCredit` / `FREE_WEEKLY_BONUS_PER_DAY`** trong `api/_lib/usage.ts` — cơ chế "học thật thì
được thêm lượt". Vì hạn mức giờ lại là **kho chung mọi môn** (§2.4), cơ chế "học thật" phải thành
**hợp đồng theo môn**: mỗi môn tự gọi `grantDailyBonus(userId, subject)` khi xác định người dùng đã
học thật hôm đó; `core-billing` cộng lượt và chống gian lận (mỗi ngày mỗi người tối đa N lượt thưởng,
tính chung mọi môn — không cộng dồn nếu học nhiều môn cùng ngày, tránh vượt trần thiết kế ban đầu
của cửa sổ trượt). Chốt chi tiết ở PR-5.

---

## 3. Chia PR (mỗi PR merge được độc lập, không PR nào để repo ở trạng thái hỏng)

### PR-1 — Alias đường dẫn (không di chuyển file nào)

- Thêm `resolve.alias` trong `vite.config.ts` + `paths` trong `tsconfig*.json`:
  `@core/*`, `@english/*`, tạm thời **cùng trỏ vào vị trí hiện tại**.
- Đổi các import tương đối sâu (`../../../`) sang alias. Việc cơ học → giao subagent `mechanical`.
- **Nghiệm thu:** `npm run build` + `typecheck` + `lint` + `test` + `test:e2e` xanh; `git diff` chỉ
  chứa dòng `import`. Ứng dụng chạy y hệt.

### PR-2 — Bật npm workspaces, dời app hiện tại vào `apps/english/`

- Root `package.json` thêm `"workspaces": ["packages/*", "apps/*"]`; giữ **một** `package-lock.json`.
- `git mv src apps/english/src` (dùng `git mv` để giữ lịch sử file).
- Cập nhật `vite.config.ts`, `tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts`,
  `size-limit`, `scripts/gen-data-manifest.mjs`, đường dẫn coverage trong CI.
- **Chưa** tách `packages/` — đây thuần tuý là bước dời chỗ.
- **Nghiệm thu:** như PR-1, cộng thêm: `npm ci` từ đầu trên máy sạch chạy được; CI xanh.

### PR-3 — Tách `packages/core-db` + `core-ai`

Hai package ít ràng buộc nhất, làm trước để kiểm chứng cách làm.

- **Nghiệm thu:** `/api/tts`, `/api/stt`, `/api/agent` hoạt động thật (smoke test tay trên staging
  hoặc local có key); cache mã hoá vẫn giải mã được **file cũ** (kiểm tra bằng một hash đã có trong DB).

### PR-4 — Tách `packages/core-auth` ⚠️ PR nhạy cảm nhất

- Kèm rà bảo mật: mọi handler còn lại vẫn gọi `validateAuth()` và vẫn đối chiếu `user_id` với token.
- **Nghiệm thu bắt buộc, làm tay:** đăng ký mới · xác thực email · đăng nhập email/mật khẩu ·
  đăng nhập Google · đổi email · quên mật khẩu · token hết hạn bị từ chối · **token của user A
  không đọc được dữ liệu user B** (thử thật, ít nhất 3 endpoint).

### PR-5 — Tách `packages/core-billing` + migration `(subject, mode)` ⚠️ có migration

Migration `0028_platform_subject.sql`, **cộng dồn, không phá dữ liệu cũ**:

```sql
-- Bảng đếm lượt dạng DÒNG thay cho cột cứng, có chiều `subject`.
create table if not exists public.usage_events (
  user_id  uuid not null references public.users(id) on delete cascade,
  day      text not null,                 -- 'YYYY-MM-DD' theo giờ VN
  subject  text not null,                 -- 'english' | 'math' | ...
  mode     text not null,                 -- 'chat' | 'writing' | 'speaking' | 'stt' | 'pronounce' | ...
  count    integer not null default 0,
  primary key (user_id, day, subject, mode)
);

-- Backfill từ daily_usage, gán toàn bộ lịch sử cho môn 'english'.
insert into public.usage_events (user_id, day, subject, mode, count)
select user_id, day, 'english', m.mode, m.cnt
from public.daily_usage d
cross join lateral (values
  ('chat', d.chat_count), ('writing', d.writing_count),
  ('speaking', d.speaking_count), ('stt', d.stt_count),
  ('pronounce', d.pronounce_count)
) as m(mode, cnt)
where m.cnt > 0
on conflict do nothing;
```

- **`daily_usage` được GIỮ NGUYÊN, không `drop`.** Xoá ở một PR sau, sau khi `usage_events` chạy
  thật ổn ít nhất 2 tuần. Đây là đường lùi.
- Hàm SQL `consume_usage`/`refund_usage`/`grant_daily_bonus_rolling` thêm tham số `subject`
  (mặc định `'english'` để mã cũ gọi vẫn đúng).
- Thêm bảng `subject_limits`, mặc định `enforced = true` cho mọi môn (hạn mức dùng chung — §2.4).
  Bảng này cần một màn quản trị nhỏ (bật/tắt `enforced` theo môn) trong trang admin sẵn có, dùng làm
  phanh tay khi cần nới tạm cho một môn cụ thể.
- Cơ chế "học thật được thêm lượt" thành hợp đồng `grantDailyBonus(userId, subject)` theo môn (§2.5),
  cộng gộp đúng trần thiết kế ban đầu bất kể học mấy môn trong ngày.
- **Rollback:** `drop table usage_events` — không mất gì vì `daily_usage` còn nguyên.

Cùng PR này, đổi tiền tố SePay sang **`DHCB`** theo §2.1: hằng số `PAYMENT_PREFIX = 'DHCB'` khi tạo
mã đơn, `ACCEPTED_PREFIXES = ['DHCB', 'ENVI']` khi đối chiếu webhook. **Việc tay đi kèm, không quên:**
vào trang SePay **thêm** bộ lọc tiền tố `DHCB`, **giữ nguyên** bộ lọc `ENVI` đang có.

- **Nghiệm thu:** ca biên đếm lượt có test — hết lượt · hoàn lượt khi AI lỗi · đổi ngày theo giờ VN ·
  gói hết hạn · cửa sổ trượt 7 ngày của gói Free **cộng gộp đúng khi học nhiều môn cùng ngày** ·
  hạn mức của môn Toán/Lý/Hoá bị chặn giống hệt tiếng Anh khi hết lượt · admin bật `enforced = false`
  cho một môn thì môn đó không bị chặn nhưng vẫn ghi đủ dòng vào `usage_events`. Test webhook khớp
  đúng với **cả hai** tiền tố, kể cả một mã đơn `ENVI…` cũ có thật trong bảng `payments`. Chạy thật
  một giao dịch SePay số tiền nhỏ bằng nội dung `DHCB…`.

### PR-5b — Chuyển bảng dữ liệu học sang schema `english` ⚠️ có migration

Migration `0029_schema_english.sql`, theo cách ở §2.2:

```sql
create schema if not exists english;

-- Đổi CHỖ, không copy dữ liệu (nhanh, không có nguy cơ lệch bản sao).
alter table public.chat_sessions       set schema english;
alter table public.writing_submissions set schema english;
alter table public.speaking_sessions   set schema english;
alter table public.learning_progress   set schema english;
alter table public.pronunciations      set schema english;
alter table public.challenge_entries   set schema english;
alter table public.tutor_feedback      set schema english;
-- tts_cache Ở LẠI public/core: cache audio dùng chung mọi môn.

-- Cầu tương thích: mã chưa kịp sửa vẫn chạy.
create view public.chat_sessions       as select * from english.chat_sessions;
-- … tương tự cho các bảng còn lại.
```

- Sau đó đổi truy vấn trong `apps/english/api` sang **ghi rõ tên schema** (`english.chat_sessions`),
  không dựa vào `search_path`.
- View tương thích xoá ở PR sau, khi đã xác nhận không còn truy vấn nào dùng tên cũ
  (kiểm bằng `grep` toàn repo + theo dõi log 1 tuần).
- **Rollback:** `drop view` + `alter table … set schema public`.
- **Nghiệm thu:** mọi luồng học chạy thật (chat · viết · nói · lộ trình · SRS · phát âm · challenge);
  đếm số dòng từng bảng trước/sau migration phải **bằng nhau tuyệt đối**.

### PR-6 — Tách `packages/core-ui` (theme, token `--a-*`, component nền)

**Không** đưa SRS hay bất cứ logic học/ôn nào vào `core-ui` — theo §2.3, những thứ đó ở lại
`apps/english/`.

- **Nghiệm thu:** cả 4 theme hiển thị đúng trên mọi trang; axe trong E2E không có lỗi mới;
  ảnh chụp màn hình trước/sau vài trang chính để đối chiếu bằng mắt.

### PR-7 — `apps/hub` + Nginx đa subdomain + SSO

1. `apps/hub`: trang giới thiệu, đăng nhập chung, thẻ điều hướng sang từng môn, bảng giá.
2. `server.ts`: thay đường dẫn cứng `dist` (chỗ `express.static` và `res.sendFile`) bằng bảng tra
   theo `Host` → `apps/<app>/dist`; không khớp → hub. **`/api/*` xử lý trước, không đụng bảng này.**
3. `nginx/`: thêm `server` block cho apex + `math.` (dựng sẵn, trỏ tạm về hub);
   mở rộng cert: `certbot --expand -d en-vi.… -d donghanhcungban.com -d www.… -d math.…`.
4. Cookie phiên đặt `domain=.donghanhcungban.com`, `Secure`, `HttpOnly`, `SameSite=Lax`.
5. Cập nhật CSP (`server.ts`) và `VITE_SITE_URL` cho hub.

- **Nghiệm thu:** đăng nhập ở hub → mở `en-vi.` **không phải đăng nhập lại**; đăng xuất ở một
  subdomain thì mọi subdomain cùng mất phiên; SSL hợp lệ trên cả 3 tên miền.

---

## 4. Kế hoạch chống hồi quy (bắt buộc, không rút gọn)

**Trước khi bắt đầu PR-1:**

1. Chạy `npm run test:e2e`, **ghi lại** số ca đang xanh — đây là mốc đối chiếu cho mọi PR sau.
2. Bổ sung E2E cho luồng chưa được phủ mà GĐ1 sẽ đụng tới: **thanh toán** và **đăng nhập Google**.
   Nếu chưa phủ được thì phải có **danh sách kiểm tra tay** viết sẵn, ký từng mục mỗi lần deploy.
3. **Backup DB** (`npm run backup:r2`) và xác minh restore chạy được (`npm run restore:r2` vào
   một DB tạm) — chưa xác minh restore thì chưa được chạy migration nào.

**Mỗi PR:** đủ cổng commit ở `CLAUDE.md` §8 + E2E không được ít ca xanh hơn mốc + xuất báo cáo §10.

**Deploy:** mỗi PR deploy riêng, giãn cách ít nhất 1 ngày, theo dõi Sentry trước khi làm PR kế tiếp.
Nhớ `npm run build` (gồm `build:server`) **trước mỗi** `pm2 reload`.

---

## 5. Rủi ro riêng của GĐ1

| Rủi ro                                                         | Giảm thiểu                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Refactor lớn làm hỏng app đang có người trả tiền               | 8 PR nhỏ, refactor thuần, E2E làm mốc, deploy giãn cách, backup trước migration        |
| Đổi tiền tố SePay làm rơi giao dịch cũ `ENVI…`                 | `ACCEPTED_PREFIXES` chấp nhận cả hai **vĩnh viễn**; giữ bộ lọc `ENVI` trên trang SePay |
| Chuyển schema làm hỏng truy vấn chưa kịp sửa                   | `set schema` (không copy) + view tương thích ở `public`; đếm số dòng trước/sau         |
| SM2/FSRS nhân bản ở nhiều môn, sửa lỗi sót chỗ                 | Chấp nhận có chủ đích (§2.3); ghi nợ kỹ thuật; xét gộp lại khi có môn thứ ba           |
| Lịch sử git nát sau khi dời file                               | Luôn `git mv`; PR di chuyển **không** kèm sửa nội dung                                 |
| Migration `(subject, mode)` sai → mất lượt/mất tiền người dùng | Cộng dồn, giữ `daily_usage`, rollback bằng một câu `drop`                              |
| Trừu tượng hoá sớm, `core-*` phình theo phỏng đoán             | Áp quy tắc §1: chỉ tách khi môn thứ hai thật sự cần                                    |
| Làm 4–6 tuần không có gì mới cho người dùng, dễ nản            | Chấp nhận có chủ đích; hub (PR-7) là thứ nhìn thấy được, đặt ở cuối làm mốc hoàn thành |

## 6. Cổng ra GĐ1

- [ ] Đăng nhập ở `donghanhcungban.com` → vào `en-vi.` không phải đăng nhập lại
- [ ] App tiếng Anh không hồi quy: E2E xanh bằng hoặc hơn mốc, Sentry không có loại lỗi mới
- [ ] Thêm một app rỗng mới (`math.`) chỉ cần: tạo `apps/math`, thêm `server` block Nginx, thêm
      một dòng vào bảng tra `Host` — **không đụng vào `packages/` hay `apps/english/`**
- [ ] `usage_events` chạy thật ≥ 2 tuần, số liệu khớp `daily_usage`
- [ ] Thanh toán bằng nội dung `DHCB…` chạy thật; một giao dịch `ENVI…` cũ vẫn đối chiếu đúng
- [ ] Bảng dữ liệu học nằm hết trong schema `english`; `core` không còn bảng nào thuộc về môn
- [ ] `PROGRESS.md` cập nhật, ADR-0001 chuyển sang "Đã thi hành"
