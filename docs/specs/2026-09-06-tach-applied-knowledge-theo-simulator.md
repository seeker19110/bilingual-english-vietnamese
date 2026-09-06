# Đặc tả: tách `AppliedKnowledge.tsx` (1.942 dòng) theo từng simulator

> Khuôn: `docs/templates/dac-ta-tinh-nang.md`. Trạng thái: **ĐÃ THI HÀNH 2026-09-06** — người
> dùng chốt phương án A ("triển khai phương án A"); kết quả ở `docs/changelog/0281`. Bối cảnh: mục "Tiếp theo" ưu tiên 3 của đánh giá sâu
> (`docs/changelog/0276`); ba file lớn khác đã tách thuần dời mã ở PR #866/#867/#868, riêng file
> này **không tách bằng dời mã được** nên cần đặc tả trước.

## 0. Một câu

Chia trang "Ứng dụng thực tế" (`/applied-knowledge`) từ MỘT hàm component 1.942 dòng / 42
`useState` thành 10 component simulator độc lập + 4 tab component, **không đổi giao diện và
kết quả tính**, để sửa một simulator không phải mở cả trang.

## ① Phạm vi

**LÀM:**

- Mỗi simulator (10 cái, comment `{/* SIMULATOR n: … */}` dòng 440–1701) thành một file
  `pages/learning/appliedKnowledge/simulators/<Ten>.tsx`, **tự giữ state của mình** (đã kiểm:
  không state simulator nào được đọc ngoài khối JSX của nó — mỗi tên chỉ xuất hiện ở dòng khai
  báo và trong khối của chính nó).
- Bốn tab (Simulators Lab · Library · AI Explainer · Capstone) thành 4 component trong
  `pages/learning/appliedKnowledge/tabs/`; state lọc thư viện (`searchQuery`, `selectedLevel`,
  `selectedSubject`) và state explainer (`explainerQuery`, `aiAnswer`, `isExplaining`,
  `handleAskExplainer`) đi theo tab của chúng.
- `AppliedKnowledge.tsx` còn: `usePageTitle`, `activeTab`, thanh tab, `activeSimulator` (picker),
  và gắn 4 tab. Mục tiêu ≤ 300 dòng.
- Hằng dùng chung (bảng bậc giá điện EVN, hằng vật lý…) nếu đang khai báo trong component → dời
  ra `appliedKnowledge/constants.ts`, **giữ nguyên giá trị**.

**KHÔNG LÀM (quan trọng ngang mục trên):**

- KHÔNG đổi công thức, giá trị mặc định, nhãn, thứ tự, class Tailwind của bất kỳ simulator nào.
  Đây là tái cấu trúc, không phải sửa nội dung.
- KHÔNG đụng `APPLIED_KNOWLEDGE_DATABASE`, `predictOffspringBloodTypes` và các hàm tính trong
  `apps/dhcb/src/data/*` / `lib/*` mà trang này import.
- KHÔNG thay "AI Explainer" giả lập (`setTimeout` 400 ms + câu trả lời cứng) bằng AI thật —
  đó là việc nghiệp vụ riêng, cần đặc tả khác.
- KHÔNG đổi route `/applied-knowledge` và cách `App.tsx` lazy-load trang.

## ② Điểm chạm

| Việc | Đường dẫn file                                                   | Ghi chú                                                          |
| ---- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| Sửa  | `apps/dhcb/src/pages/learning/AppliedKnowledge.tsx`              | còn vỏ trang + thanh tab + picker                                |
| Thêm | `apps/dhcb/src/pages/learning/appliedKnowledge/simulators/*.tsx` | 10 file, mỗi file một simulator                                  |
| Thêm | `apps/dhcb/src/pages/learning/appliedKnowledge/tabs/*.tsx`       | 4 tab                                                            |
| Thêm | `apps/dhcb/src/pages/learning/appliedKnowledge/constants.ts`     | chỉ khi có hằng đang nằm trong component                         |
| Sửa  | `apps/dhcb/src/pages/core/UiNoise.design.test.ts`                | đổi khoá allowlist theo file mới, cùng tổng số (tiền lệ PR #868) |

**Ảnh hưởng lan ra (theo codemap, đo 2026-09-06):** chỉ `App.tsx` (lazy route) và
`UiNoise.design.test.ts`. Không component nào khác import file này.

## ③ Hợp đồng dữ liệu

**Vào (mỗi simulator):** không có props bắt buộc. Mỗi simulator là component không tham số,
tự giữ state; nếu cần `isA`/`nav` thì nhận qua props tường minh, không đọc context ẩn.

```ts
// pages/learning/appliedKnowledge/simulators/ProfitOptimization.tsx
export function ProfitOptimization(): JSX.Element
```

**Ra:** JSX giống hệt khối cũ.

**Quyết định cần người dùng chốt — giữ hay bỏ "nhớ giá trị khi đổi simulator":**

| Phương án                                        | Hành vi                                                              | Đề xuất |
| ------------------------------------------------ | -------------------------------------------------------------------- | ------- |
| A. State nằm trong từng simulator (đề xuất)      | Đổi sang simulator khác rồi quay lại → giá trị **về mặc định**       | ✅      |
| B. Giữ 10 simulator luôn mount, ẩn bằng `hidden` | Giá trị **được nhớ** như hiện nay, nhưng 10 cây DOM sống cùng lúc    |         |
| C. State vẫn ở cha, truyền xuống qua props       | Giữ y hệt hiện nay, nhưng cha vẫn 42 `useState` — không đạt mục tiêu |         |

Lý do đề xuất A: hiện tại việc nhớ giá trị là **hệ quả ngẫu nhiên** của cách viết (mọi state ở
cha), không phải tính năng được nêu ở đâu; simulator là công cụ thử nhanh, về mặc định khi
quay lại là hành vi người dùng quen thấy ở máy tính cầm tay. Nếu người dùng muốn giữ, chọn B
(chi phí: DOM lớn hơn, cần đo Tầng 8b kỹ hơn).

**Ca lỗi:** không có đường mạng/DB; ca duy nhất là nhập số ngoài miền (âm, rỗng) — giữ NGUYÊN
cách xử lý hiện tại của từng simulator (không thêm validate mới trong đợt này).

## ④ Tiêu chí chấp nhận

```
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
npx vitest run apps/dhcb/src/pages/core/UiNoise.design.test.ts
npm run codemap -- impact apps/dhcb/src/pages/learning/AppliedKnowledge.tsx
```

- [ ] `AppliedKnowledge.tsx` ≤ 300 dòng; không file mới nào > 350 dòng.
- [ ] **Tầng 8b:** ảnh `fullPage` 1440px + 390px, trước/sau, cho: tab Simulators với simulator
      1, 4 (EVN), 9 (TDEE), 10 (huyết thống) ở **giá trị mặc định**, tab Library, tab Explainer,
      tab Projects → **giống hệt từng byte** (trang không có phần ngẫu nhiên; nếu khác phải chỉ
      ra dòng mã gây khác).
- [ ] Với mỗi simulator: nhập cùng một bộ giá trị vào bản cũ và bản mới → **kết quả hiển thị
      giống hệt** (bảng đối chiếu 10 dòng trong mô tả PR, ít nhất 1 bộ giá trị khác mặc định
      mỗi simulator).
- [ ] Nếu chọn phương án A: ghi rõ trong changelog rằng giá trị không còn được nhớ khi đổi
      simulator, và vì sao.

## ⑤ Bất biến không được phá

- Kết quả tính của 10 simulator với cùng đầu vào không đổi (test canh: bảng đối chiếu ở ④; nếu
  hàm tính đang inline trong JSX thì tách thành hàm thuần trong file simulator và **thêm unit
  test** cho hàm đó — đây là chỗ duy nhất được thêm mã mới).
- a11y: `e2e/a11y.spec.ts` + `a11y-aaa.spec.ts` đã quét `/applied-knowledge` → CI phải xanh.
- Số `animate-pulse` / bóng màu toàn trang không đổi (`UiNoise.design.test.ts` chỉ đổi khoá
  file, không đổi tổng).

## ⑥ Quy ước dự án liên quan

- CLAUDE.md mục 7 (comment tiếng Việt ở chỗ quan trọng, mỗi file một việc), mục 4.5 (a11y),
  mục 11 (PR `refactor(learning): …`, đủ 6 tiêu đề mô tả, không cần link spec vì không phải
  `feat` — nhưng vẫn trỏ về file này trong mô tả).
- Cách làm đã dùng thành công 3 lần trong ngày: script tách + so chuỗi thân mã + ảnh chụp
  trước/sau (`docs/changelog/0278` → `0280`). Riêng đợt này thân mã **sẽ khác** (state dời chỗ),
  nên bằng chứng chính là ④, không phải so chuỗi.

## Nghiệm thu (bên giao việc điền SAU khi nhận kết quả)

- Ngày · PR: 2026-09-06 · PR #TBD (`docs/changelog/0281`).
- Phương án state đã chọn (A/B): **A** — state trong từng simulator; `activeSimulator` vẫn ở
  trang để đổi tab rồi quay lại đúng simulator (chỉ GIÁ TRỊ về mặc định).
- Ảnh Tầng 8b: 14 ảnh (1440 + 390 × simulator 1/4/9/10 + 3 tab) → 10 giống hệt từng byte, 4 lệch
  5–106 px do răng cưa chữ (chụp lại cùng mã cũng lệch đúng 4 ảnh đó) — không có dòng mã gây khác.
- Bảng đối chiếu 10 simulator: **10/10 đạt** (băm chữ khung kết quả với bộ giá trị khác mặc định
  giống hệt bản cũ).
- Lệch so với đặc tả: không cần `constants.ts` (không có hằng nào nằm trong component);
  `AppliedKnowledge.tsx` còn 112 dòng.
