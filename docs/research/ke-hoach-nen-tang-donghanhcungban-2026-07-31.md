# Kế hoạch: biến donghanhcungban.com thành NỀN TẢNG đồng hành đa lĩnh vực

> Ngày: 2026-07-31 · Trạng thái: **PHÁC THẢO — chờ người dùng chốt** (đây là cổng giai đoạn lớn, chưa code gì)
> Bối cảnh: hiện có 1 app chạy thật tại `en-vi.donghanhcungban.com` (React+Vite+Express+Postgres tự host, auth tự viết, thanh toán SePay).

---

## 1. Tầm nhìn & phạm vi

**Tầm nhìn:** `donghanhcungban.com` = "người đồng hành" của một người Việt suốt đời — bắt đầu từ **học hành**, sau lan sang **nuôi dạy con** và **phát triển nghề nghiệp**.

**Ba làn (lane) theo thời gian:**

| Làn               | Nội dung                                                      | Mốc dự kiến       |
| ----------------- | ------------------------------------------------------------- | ----------------- |
| L1 — Học hành     | Tiếng Anh (đã có) → Toán → Lý → Hoá → Văn/Sử/Địa              | 2026 H2 – 2027 H1 |
| L2 — Nuôi dạy con | Đồng hành cha mẹ: tâm lý theo độ tuổi, học cùng con, sức khoẻ | 2027              |
| L3 — Nghề nghiệp  | CV/phỏng vấn, kỹ năng số, định hướng ngành, học tiếp          | 2027–2028         |

**Nguyên tắc bất biến của nền tảng** (giữ đúng ADN app hiện tại):

1. Rẻ (ưu tiên model AI giá thấp, cache mạnh) — dự án vốn tối thiểu.
2. Tiếng Việt là ngôn ngữ mẹ đẻ của trải nghiệm; giải thích luôn dễ hiểu với người mới.
3. Sư phạm thật: có lộ trình, có SRS/ôn tập, có chấm điểm — không phải "chatbot hỏi đáp".
4. Một tài khoản, một gói cước dùng cho **mọi** môn/lĩnh vực.

**Không làm (ít nhất 12 tháng tới):** mạng xã hội, marketplace gia sư người thật, app native, livestream.

---

## 2. Quyết định kiến trúc cần chốt TRƯỚC (3 ngã rẽ)

### QĐ-1. Bố cục domain

| Phương án                                            | Mô tả                                                                                                                                                                                      | Ưu                                                                                               | Nhược                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **A. Subdomain mỗi môn** (`en-vi.`, `toan.`, `ly.`…) | Mỗi môn 1 app deploy riêng                                                                                                                                                                 | Cô lập lỗi; deploy độc lập; đã đúng với hiện trạng                                               | Cookie/SSO xuyên subdomain phải làm; N lần vận hành                               |
| **B. Một app, nhiều route** (`/anh`, `/toan`…)       | Gộp hết vào repo hiện tại                                                                                                                                                                  | Đơn giản nhất; SSO miễn phí                                                                      | Bundle phình; 1 lỗi sập cả nhà; repo khổng lồ                                     |
| **C. ⭐ Hub + subdomain, hạ tầng dùng chung**        | `donghanhcungban.com` = trang hub (giới thiệu + đăng nhập + điều hướng); mỗi môn 1 app subdomain; **dùng chung 1 Postgres + 1 dịch vụ auth + 1 dịch vụ thanh toán + 1 dịch vụ AI-gateway** | Mở môn mới không đụng môn cũ; chi phí vận hành gần bằng B; đường nâng cấp tự nhiên từ hiện trạng | Phải tách "lõi dùng chung" ra khỏi repo tiếng Anh (việc lớn nhất của cả kế hoạch) |

**Đề xuất: C.** Lý do: bạn đang một mình + VPS 1 vCPU, nhưng số môn sẽ tăng; C cho phép thêm môn mà **không** làm rủi ro app đang có người dùng thật.

#### ✅ ĐÃ CHỐT (2026-07-31): phương án C, thi hành ở **MỨC 2 — tách frontend, chung backend**

Mỗi môn có subdomain riêng (`en-vi.` · `math.` · `ly.` · `hoa.`, viết thường), `donghanhcungban.com` là hub.
Nhưng **chỉ MỘT tiến trình PM2** phục vụ tất cả, cho tới khi chạm ngưỡng nâng cấp bên dưới.

| Mức                | Frontend                | Tiến trình PM2                    | Ghi chú                                          |
| ------------------ | ----------------------- | --------------------------------- | ------------------------------------------------ |
| 1                  | 1 bundle, route `/toan` | 1                                 | Bị loại: bundle phình, sập cả nhà                |
| **2 ⭐ đang chọn** | mỗi môn 1 bundle riêng  | **1**                             | Người dùng thấy như app riêng; RAM/CPU thấp nhất |
| 3                  | mỗi môn 1 bundle        | mỗi môn 1 tiến trình + port riêng | Để dành, xem ngưỡng bên dưới                     |

**Vì sao mức 2:** VPS hiện **1 vCPU** — chạy N tiến trình Node chỉ tổ tranh nhau 1 core và tốn N×~200MB RAM,
chậm hơn chứ không an toàn hơn. Backend gần như đã dùng chung sẵn (auth, đếm lượt, SePay, `/api/agent`,
`/api/tts`, `/api/stt`, cache mã hoá); tách tiến trình lúc này là nhân bản vô ích.

**Điểm chạm code khi thi hành:**

1. `nginx/` — thêm `server` block cho mỗi subdomain, cùng `proxy_pass http://127.0.0.1:3001`;
   mở rộng cert Let's Encrypt đa tên (`certbot -d en-vi.… -d math.… -d donghanhcungban.com`).
2. `server.ts` (chỗ `express.static(… 'dist')` và `res.sendFile(… 'dist/index.html')`) — thay đường dẫn
   cứng `dist` bằng **bảng tra theo header `Host`**: `en-vi.→apps/english/dist`, `math.→apps/math/dist`,
   apex→`apps/hub/dist`, không khớp → hub. `/api/*` giữ nguyên một bộ dùng chung.
3. Auth SSO — cookie `domain=.donghanhcungban.com`; vì cùng tiến trình nên cùng secret, không phải
   đồng bộ gì giữa các môn (đây là chỗ mức 2 rẻ hơn hẳn mức 3).
4. Đếm lượt — vẫn cần migration `(subject, mode)`, độc lập với việc chọn mức.

**Ngưỡng nâng lên mức 3** (chốt trước để khỏi tranh luận lại) — đạt **bất kỳ** điều nào:

- một môn chiếm > 50% CPU của tiến trình chung, **hoặc**
- cần deploy môn A mà không được phép gián đoạn môn B, **hoặc**
- đã lên VPS nhiều core (khi đó **bắt buộc** đặt `REDIS_URL` cho rate limit dùng chung).

Nâng cấp = thêm entry vào `ecosystem.config.cjs` + đổi port trong Nginx. Không phải viết lại —
với điều kiện làm monorepo (QĐ-2) ngay từ đầu.

### QĐ-2. Repo

- **C1. Monorepo** (npm workspaces): `packages/core-auth`, `core-billing`, `core-ai`, `core-ui`, `apps/english`, `apps/math`, `apps/hub`.
- C2. Nhiều repo + package nội bộ.

**Đề xuất: C1 monorepo, npm workspaces** (không thêm Turborepo/pnpm lúc đầu — giữ đúng luật "không nâng cấp bừa"). Một CI, một chỗ sửa lõi.

### QĐ-3. Dữ liệu

Một Postgres, **một schema `core`** (users, plans, payments, usage, streak) + **mỗi môn một schema riêng** (`english`, `math`…). Không nhét bảng môn mới vào `public` chung.

> ⚠️ Rủi ro lớn nhất: bảng `profiles`/`daily_usage`/`payments` hiện đang gắn chặt vào khái niệm "mode: chat/writing/speaking/stt". Phải tổng quát hoá thành `(subject, mode)` trước khi có môn thứ hai. Đây là **migration phá vỡ**, cần làm sớm khi còn ít dữ liệu.

---

## 3. Cái gì tái dùng được, cái gì phải viết mới

**Tái dùng gần như nguyên vẹn (~60% giá trị đã có):**

- Auth Bearer token + Google Identity (`api/auth.ts`, `api/_lib/authService.ts`)
- Thanh toán SePay + `plan_prices`/`payments` (chỉ cần bỏ chữ "ENVI" cứng → tiền tố theo app)
- Đếm lượt/rate limit (`api/_lib/usage.ts`, `security.ts`)
- AI gateway `/api/agent`, TTS/STT + cache mã hoá, `fileStorage.ts` (R2/local)
- Hệ theme 4 màu + design tokens `--a-*`, bộ UI, hạ tầng test/CI/Sentry/PM2/Nginx
- **Động cơ SRS** (`cefrProgress`, SM2/FSRS) — dùng lại được cho MỌI môn: Toán/Lý/Hoá cũng cần ôn công thức, khái niệm.

**Phải viết mới cho mỗi môn:**

- Mô hình nội dung (Toán ≠ từ vựng: cần **bài toán có lời giải từng bước**, công thức LaTeX, chấm đáp án số/biểu thức)
- Chấm bài (Anh = IELTS band; Toán = đúng/sai + chỉ ra bước sai; Lý/Hoá = còn có đơn vị đo, cân bằng phương trình)
- Lộ trình (Anh = CEFR; Toán/Lý/Hoá = **chương trình GDPT 2018 theo lớp 6→12**)

---

## 4. Lộ trình 5 giai đoạn

### GĐ 0 — Chốt hướng + ADR (1 tuần, 0 dòng code sản phẩm)

- Chốt QĐ-1/2/3 ở trên; viết `docs/adr/0001-nen-tang-da-linh-vuc.md`.
- Khảo sát pháp lý/nội dung: dùng đề Toán/Lý/Hoá ở đâu cho **hợp pháp** (SGK có bản quyền!) — xem §6.
- **Cổng ra:** ADR được duyệt.

### GĐ 1 — Tách lõi dùng chung + trang hub (4–6 tuần) ⚠️ nặng nhất

1. Chuyển repo sang npm workspaces, **app tiếng Anh chạy y hệt như cũ** (không đổi hành vi — đây là refactor thuần, phải có E2E xanh trước & sau).
2. Tách `packages/core-auth`, `core-billing`, `core-ai`, `core-ui` (theme + component chung).
3. Migration `(subject, mode)` cho `daily_usage`/`plan_features`; thêm cột `subject` mặc định `'english'` (backfill an toàn, rollback được).
4. Dựng `apps/hub` tại `donghanhcungban.com`: giới thiệu, đăng nhập chung, thẻ điều hướng sang từng môn, trang giá chung.
5. SSO xuyên subdomain (cookie `.donghanhcungban.com` hoặc token hand-off qua URL một lần).

- **Cổng ra:** đăng nhập ở hub → vào thẳng en-vi không phải login lại; app tiếng Anh không hồi quy.

### GĐ 2 — Môn thứ hai: TOÁN (6–8 tuần) — bài kiểm chứng cho toàn kiến trúc

Vì sao Toán trước: nhu cầu lớn nhất, dữ liệu dễ tự sinh nhất, và chấm tự động khả thi (đáp án số/biểu thức) — khác Văn phải chấm bằng AI đắt tiền.

- Phạm vi MVP hẹp: **lớp 6–9, 3 chủ đề mỗi lớp**, không ôm cả 6→12.
- Tính năng: lộ trình theo chương → bài giảng ngắn (video/chữ) → luyện tập sinh đề theo tham số → **giải thích từng bước** → SRS công thức → chấm & thống kê.
- Kỹ thuật mới cần nghiên cứu: KaTeX (render công thức), nhập công thức trên mobile, sinh đề có tham số + kiểm đáp án bằng biểu thức (đề xuất: template hoá đề, chấm bằng so khớp số/biểu thức chuẩn hoá — **không** để AI tự chấm đúng/sai vì hay sai số học).
- **Cổng ra:** 50 người dùng thật học Toán 1 tuần, chi phí AI/người ≤ mức của môn Anh.

### GĐ 3 — Lý + Hoá (4–6 tuần/môn, dùng lại 80% từ GĐ2)

Thêm: đơn vị đo & thứ nguyên, cân bằng phương trình hoá học, bảng tuần hoàn, mô phỏng đơn giản.

### GĐ 4 — L2 nuôi dạy con & L3 nghề nghiệp (2027+)

Khác biệt về chất: ít "luyện tập", nhiều "tư vấn + theo dõi dài hạn". Cần thiết kế riêng, sẽ có kế hoạch riêng. **Chưa phác thảo chi tiết ở đây để tránh phình phạm vi.**

---

## 5. Mô hình kinh doanh

- Giữ nguyên bậc Free/Pro/VIP hiện có, nhưng **gói mua một lần dùng cho mọi môn** ("Đồng hành toàn diện") — đây là lợi thế lớn nhất so với app đơn môn.
- Lượt dùng: hạn mức chung theo ngày, chia sẻ giữa các môn (đơn giản, dễ hiểu, chống lạm dụng tốt hơn hạn mức riêng từng môn).
- Cần tính lại giá khi chi phí AI tăng theo số môn — làm bảng chi phí/người dùng trước GĐ2.

---

## 6. Rủi ro & cách giảm

| Rủi ro                                       | Mức    | Giảm thiểu                                                                                                                                              |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phình phạm vi, không môn nào tới nơi**     | 🔴 cao | Mỗi GĐ có cổng ra đo được; cấm mở môn mới khi môn trước chưa đạt cổng                                                                                   |
| Refactor GĐ1 làm hỏng app đang có người dùng | 🔴 cao | Refactor thuần + E2E đầy đủ trước khi tách; deploy từng bước, giữ rollback                                                                              |
| Bản quyền đề/SGK Toán-Lý-Hoá                 | 🔴 cao | Chỉ bám **chương trình GDPT 2018** (văn bản nhà nước, được dùng); đề **tự sinh theo tham số** hoặc AI sinh mới; tuyệt đối không chép đề/sách thương mại |
| AI chấm sai Toán/Lý/Hoá                      | 🟡 vừa | Chấm bằng thuật toán (so khớp đáp án chuẩn hoá), AI chỉ **giải thích**, không phán đúng/sai                                                             |
| VPS 1 vCPU không tải nổi nhiều app           | 🟡 vừa | Nâng VPS trước GĐ2; đặt `REDIS_URL` khi chạy nhiều tiến trình                                                                                           |
| Một mình làm không xuể                       | 🟡 vừa | Dùng subagent theo luật phân việc ở CLAUDE.md §3; ưu tiên tái dùng thay vì viết mới                                                                     |

---

## 7. Việc tiếp theo ngay (nếu bạn duyệt)

1. ~~QĐ-1/2/3~~ **ĐÃ CHỐT HẾT (2026-07-31)**: C ở mức 2 · monorepo npm workspaces · schema `core` + schema mỗi môn.
2. ~~Viết ADR + đặc tả GĐ1~~ **XONG** → `docs/adr/0001-nen-tang-da-linh-vuc.md` và
   `docs/research/dac-ta-gd1-tach-loi-monorepo-2026-07-31.md` (7 PR, migration `0028`, kế hoạch chống hồi quy).
3. **Việc kế tiếp:** ba việc chuẩn bị BẮT BUỘC trước PR-1 — ghi mốc E2E đang xanh · bổ sung E2E
   (hoặc danh sách kiểm tra tay) cho thanh toán + đăng nhập Google · backup DB và **xác minh restore
   chạy được**. Xong ba việc đó mới mở PR-1 (alias đường dẫn).
