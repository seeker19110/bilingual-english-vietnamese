# 0196 — Sửa lỗi thật khiến trang Sự nghiệp/Khởi nghiệp trắng trang (2026-08-29)

**[Cập nhật cùng ngày] Mở rộng sang Work/Life:** rà thêm 2 domain còn lại cùng khuôn (Career/
Startup/Work/Life đều do một tác giả viết cùng đợt V2-13..17) thì thấy **Work và Life dính
ĐÚNG LỖI Y HỆT** — xem mục "Mở rộng phạm vi" bên dưới. Sửa cả 4, không chỉ 2.

Nối tiếp 0195: người dùng gửi ảnh chụp Console thật sau khi deploy bản 0195 lên production —
trang vẫn lỗi, nhưng lần này `ErrorBoundary` bắt được lỗi JS cụ thể thay vì trắng hẳn:

```
TypeError: g.map is not a function
    at Je (CareerStartup-*.js)
```

## Nguyên nhân gốc (đã tìm ra và xác nhận)

**Không liên quan gì đến việc gộp trang hay thiết kế lại UI ở 0195.** Đây là lỗi có sẵn từ
trước, chỉ lộ ra khi trang được mở thật với dữ liệu thật (môi trường phiên trước không có
Postgres nên không tái hiện được):

- `apps/server/src/api/domains/career.ts` và `apps/server/src/api/domains/startup.ts` (mọi GET
  danh sách) trả response **BỌC** trong object — `{ profile }`, `{ experiences }`, `{ goals }`,
  `{ analysis }`, `{ ventures }`, `{ problems }`, `{ hypotheses }`, `{ evidence }` — và với
  `career.ts`, các POST cũng bọc (`{ profile }`, `{ experience }`, `{ goal }`).
- `apps/dhcb/src/lib/careerApi.ts` (TOÀN BỘ hàm) và `apps/dhcb/src/lib/startupApi.ts` (4 hàm
  GET danh sách: `listVentures`/`listProblems`/`listHypotheses`/`listEvidence`) lại
  `return res.json()` THẲNG, coi response là dữ liệu trần — không gỡ vỏ. Kiểu TypeScript khai
  báo đúng hình dạng mong muốn (`Promise<CareerGoal[]>`…) nên type-checker không bắt được, vì
  không có gì validate response THẬT lúc chạy.
- Hậu quả: `Career.tsx`/`Startup.tsx` `setState` một OBJECT (`{goals: [...]}`) thay vì MẢNG vào
  state khai kiểu mảng, rồi gọi `.map()` trên state đó → `TypeError: X.map is not a function`
  ngay lúc render đầu tiên (không phải lỗi mạng/deploy cũ như nghi vấn ban đầu ở 0195).
- **Vì sao chưa từng bị bắt:** `apps/dhcb/src/lib/careerApi.test.ts` và `startupApi.test.ts`
  mock `fetch` trả response TRẦN (không bọc) — khớp đúng với code sai, nên test luôn xanh. Server
  test (`career.test.ts`) thì chỉ kiểm `json.profile...`/gọi service, không so hình dạng khớp
  với client. Không phía nào kiểm tra HỢP ĐỒNG giữa client và server.

## Việc đã làm

- `careerApi.ts`: gỡ đúng vỏ cho mọi hàm (`.profile`, `.experiences`, `.experience`, `.goals`,
  `.goal`, `.analysis`).
- `startupApi.ts`: gỡ đúng vỏ cho 4 hàm GET danh sách (`.ventures`, `.problems`, `.hypotheses`,
  `.evidence`). Các hàm POST/PATCH của startup vốn ĐÃ ĐÚNG (server không bọc response cho
  nhánh này) — không đổi.
- Cập nhật `careerApi.test.ts` + `startupApi.test.ts`: mock `fetch` theo ĐÚNG hình dạng response
  thật (bọc), để lần sau lỗi kiểu này bị test bắt ngay thay vì rơi tới production.

## Mở rộng phạm vi: Work và Life dính cùng lỗi

Sau khi sửa Career/Startup, rà `apps/server/src/api/domains/work.ts` và `.../life.ts` (cùng
khuôn V2-13..17) thì xác nhận **CẢ HAI cũng bọc response GET trong object** y hệt:
`{ projects }`/`{ tasks }`/`{ meetings }`/`{ documents }` (work), `{ plans }`/`{ habits }`/
`{ checks }` (⚠️ `kind=wellbeing` trả khoá `checks`, không phải `wellbeing`)/`{ wheel }`/
`{ milestones }` (life). `apps/dhcb/src/lib/workApi.ts` (4 hàm GET danh sách) và
`apps/dhcb/src/lib/lifeApi.ts` (4 hàm GET danh sách: `listLifePlans`/`listHabits`/
`listWellbeingChecks`/`listGrowthMilestones`) đọc thẳng response y hệt lỗi ở Career/Startup —
nghĩa là trụ gộp **"Công việc & Đời sống"** (`/cong-viec-cuoc-song`) có cùng nguy cơ trắng trang.
Đã sửa cả `workApi.ts`/`lifeApi.ts` + test tương ứng (`workApi.test.ts`/`lifeApi.test.ts`) theo
đúng cách đã làm với Career/Startup. Ghi chú: `getLifeWheel`/`saveLifeWheel` trong
`lifeApi.ts` VỐN ĐÃ gỡ vỏ đúng từ trước — chỉ 4 hàm GET danh sách còn lại bị lỗi.

**Phát hiện thêm nguyên nhân vì sao lỗi lọt qua cả E2E:** `e2e/helpers/domains.ts`
(`mockDomainApis`, dùng trong `e2e/a11y-modals.spec.ts`) mock `/api/{career,startup,work,life}`
trả về **response TRẦN** (mảng/`null` không bọc) — khớp đúng với code client SAI, nên test luôn
xanh. Xác nhận trực tiếp: sau khi sửa client mà CHƯA sửa mock, `a11y-modals.spec.ts` cho
"Khởi nghiệp" đỏ với đúng lỗi "element was detached from DOM, retrying" (nút "Dự án mới" biến mất
vì `Startup.tsx` crash lúc `ventures.map()` nhận `undefined` do destructure sai key từ mock trần).
Đã sửa `mockDomainApis` để bọc đúng theo từng cặp `kind`/`resource` → tên khoá thật của từng
handler (không đoán theo quy luật chung, vì `kind=wellbeing` → khoá `checks` là ngoại lệ).

## Bằng chứng kiểm chứng

- `npm run typecheck` ✅ · `npm run lint` (file đã sửa) ✅ 0 cảnh báo · `npm run build` ✅
  (client + server + hub) · `npx vitest run` ✅ 7675/7675 (502 file, gồm 21 test đã sửa của 4
  file `{career,startup,work,life}Api.test.ts`).
- Đã đọc lại `apps/server/src/api/domains/{career,startup,work,life}.test.ts` xác nhận hình
  dạng response bọc là CHỦ Ý phía server (test có `json.profile.targetRole`…), nên chọn sửa
  CLIENT để khớp hợp đồng thật, không đổi API.
- `npx playwright test e2e/a11y-modals.spec.ts --project=chromium` ✅ 20/20 (cả 4 trang × 5
  theme, gồm "Khởi nghiệp" — trước khi sửa `mockDomainApis` test này đỏ đúng như production).

## Việc còn lại (người dùng)

- Sau khi PR này merge và VPS tự deploy (`deploy.yml` chạy khi push `main`), mở lại
  `https://www.donghanhcungban.org/su-nghiep-khoi-nghiep` và thử cả hai tab (Sự nghiệp, Khởi
  nghiệp) để xác nhận hết lỗi — lần này với bằng chứng gốc rễ cụ thể, không còn là suy đoán.
