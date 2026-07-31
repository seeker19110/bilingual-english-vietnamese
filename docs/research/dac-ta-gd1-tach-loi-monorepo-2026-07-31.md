# Đặc tả GĐ1 — Tách lõi dùng chung + trang hub

> Ngày: 2026-07-31 · Căn cứ: `docs/adr/0001-nen-tang-da-linh-vuc.md`
> Trạng thái: **đặc tả, chưa thi hành** · Ước lượng: 4–6 tuần, 7 PR
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

| Vào `packages/`                                                                                                                                                                                | Ở lại `apps/english/`                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `api/auth.ts`, `_lib/authService.ts`, `adminAuth.ts`, `security.ts`, `emailVerification.ts`, `changeEmail.ts`                                                                                  | `api/dictionary.ts`, `pronunciation.ts`, `pronounce-assess.ts`, `avatar-visemes.ts`, `challenge.ts` |
| `api/checkout.ts`, `payment-webhook.ts`, `payment-status.ts`, `payment-history.ts`, `plan-prices.ts`, `plan-features.ts`, `plan-marketing.ts`, `_lib/promo.ts`, `usage.ts`, `plan.ts`          | `api/tutor-feedback.ts`, `quests.ts`, `leaderboard.ts`, `history.ts`, `progress.ts`                 |
| `api/tts.ts`, `stt.ts`, `ai.ts`, `_lib/aiConfig.ts`, `aiCost.ts`, `openaiStt.ts`, `elevenLabsTts.ts`, `azurePronounce.ts`, `fileStorage.ts`                                                    | `src/data/**` (từ điển, CEFR), `src/prompts/**`, `src/pages/**`                                     |
| `_lib/pgPool.ts`, `date.ts`, `base64.ts`, `concurrencyLimiter.ts`, `settings.ts`                                                                                                               | `src/lib/curriculum.ts`, `cefr*.ts`, `vocab.ts`, `wordForms.ts`, `pos.ts`, `dictionaryApi.ts`       |
| `src/lib/theme.ts`, `auth.ts`, `authHeader.ts`, `payment.ts`, `planFeatures.ts`, `promo.ts`, `errorTracking.ts`, `storage.ts`, `date.ts`, `haptics.ts`, `sound.ts`, `deviceId.ts`, `uiLang.ts` | `src/lib/pronounce*.ts`, `listening.ts`, `placement.ts`, `mistakes.ts`, `challenge*.ts`             |
| `src/components/ThemeToggle.tsx` + component nền (nút, thẻ, modal, trạng thái tải/rỗng/lỗi)                                                                                                    | các component gắn nội dung tiếng Anh (`WordCard`, `StudyTabs`, `CefrLessonViews`, …)                |
| `src/lib/srs.ts` ⚠️ xem §2                                                                                                                                                                     | `src/lib/stats.ts`, `achievements.ts`, `weeklyGoal.ts` (tách sau nếu Toán cần)                      |

⚠️ **`api/admin-*.ts`**: phần quản trị người dùng/gói/giá là lõi; phần thống kê học tập là của môn.
PR-4 tách theo đúng ranh giới đó, không bê nguyên cụm `admin-*` sang một bên.

---

## 2. Điểm cần quyết trong lúc làm (đừng tự ý, hỏi lại)

1. **`src/lib/srs.ts`** — thuật toán ôn tập (SM2/FSRS) dùng chung được cho mọi môn, nhưng
   _đơn vị được ôn_ hiện là từ vựng. Đề xuất: chuyển **thuật toán** vào `core-*` với kiểu
   `ReviewItem` chung (`{ id, ease, interval, due }`), giữ phần "từ vựng là gì" ở `apps/english`.
   Chỉ làm ở PR-6, sau khi mọi thứ khác đã ổn.
2. **`weeklyCredit` / `FREE_WEEKLY_BONUS_PER_DAY`** trong `api/_lib/usage.ts` — cơ chế "học thật
   thì được thêm lượt" hiện gắn với `api/progress.ts` của môn Anh. Sang nền tảng, "học thật" phải
   là **hợp đồng** mà mỗi môn tự báo lên (`grantDailyBonus(userId, subject)`).
3. **Tiền tố nội dung chuyển khoản SePay `"ENVI"`** đang cứng — phải thành cấu hình theo app,
   nhưng **không được đổi tiền tố của giao dịch cũ** (webhook vẫn phải nhận được `ENVI…`).

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
- **Rollback:** `drop table usage_events` — không mất gì vì `daily_usage` còn nguyên.
- **Nghiệm thu:** ca biên đếm lượt có test — hết lượt · hoàn lượt khi AI lỗi · đổi ngày theo giờ VN ·
  gói hết hạn · cửa sổ trượt 7 ngày của gói Free. Chạy thật một giao dịch SePay số tiền nhỏ.

### PR-6 — Tách `packages/core-ui` (theme, token `--a-*`, component nền, SRS)

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
| Refactor lớn làm hỏng app đang có người trả tiền               | 7 PR nhỏ, refactor thuần, E2E làm mốc, deploy giãn cách, backup trước migration        |
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
- [ ] `PROGRESS.md` cập nhật, ADR-0001 chuyển sang "Đã thi hành"
