# 0281 — 2026-09-06 — Tách `AppliedKnowledge.tsx` (1.942 dòng) theo từng simulator — phương án A

**PR:** #869 · **Loại:** `refactor(learning)` · **Nhánh:** `claude/phuong-an-a-rgkgoc` ·
**Đặc tả:** `docs/specs/2026-09-06-tach-applied-knowledge-theo-simulator.md`

## Việc đã làm

File thứ tư và cuối cùng trong mục "4 file > 1.700 dòng" (sau `0278` StudyTabs, `0279`
Practice, `0280` Lessons). Khác ba lần trước, file này **không tách bằng dời mã** được: một hàm
component giữ 42 `useState` cho cả 10 simulator. Người dùng chốt **phương án A** của đặc tả:
state đi theo từng simulator.

| File mới (`apps/dhcb/src/pages/learning/appliedKnowledge/`) | Dòng | Nội dung                                                  |
| ----------------------------------------------------------- | ---- | --------------------------------------------------------- |
| `simulators/ProfitOptimization.tsx`                         | 152  | Mô phỏng 1 — tối ưu lợi nhuận (đạo hàm)                   |
| `simulators/CompoundInterest.tsx`                           | 173  | Mô phỏng 2 — lãi kép & FIRE                               |
| `simulators/LoanAmortization.tsx`                           | 123  | Mô phỏng 3 — trả góp mua nhà                              |
| `simulators/EvnElectricity.tsx`                             | 163  | Mô phỏng 4 — tiền điện EVN bậc thang                      |
| `simulators/GpsRelativity.tsx`                              | 90   | Mô phỏng 5 — GPS & Einstein                               |
| `simulators/BrakingDistance.tsx`                            | 127  | Mô phỏng 6 — phanh & động năng                            |
| `simulators/AlcoholDilution.tsx`                            | 101  | Mô phỏng 7 — pha cồn 70°                                  |
| `simulators/PhScale.tsx`                                    | 106  | Mô phỏng 8 — thang đo pH                                  |
| `simulators/TdeeMacro.tsx`                                  | 193  | Mô phỏng 9 — BMR/TDEE & macro                             |
| `simulators/BloodGenetics.tsx`                              | 115  | Mô phỏng 10 — nhóm máu Men-đen                            |
| `tabs/SimulatorsLab.tsx`                                    | 237  | Tab 1: bảng chọn 10 simulator + mount simulator đang chọn |
| `tabs/KnowledgeLibrary.tsx`                                 | 152  | Tab 2: kho tri thức + state lọc (tìm/cấp/môn)             |
| `tabs/AiExplainer.tsx`                                      | 100  | Tab 3: AI giải đáp (vẫn giả lập `setTimeout` 400 ms)      |
| `tabs/CapstoneProjects.tsx`                                 | 50   | Tab 4: dự án mini (không state)                           |

`pages/learning/AppliedKnowledge.tsx` còn **112 dòng** (mục tiêu ≤ 300): `usePageTitle`, thanh 4
tab, `activeTab`, `activeSimulator` (giữ ở trang để đổi tab rồi quay lại vẫn đúng simulator) và
gắn 4 tab. Không file mới nào > 350 dòng (lớn nhất 237). Không cần `constants.ts`: không có hằng
nào khai báo trong component (mọi hằng đã ở `lib/simulators`).

**Hành vi đổi (có chủ ý, phương án A):** đổi sang simulator khác rồi quay lại → **giá trị đã
nhập về mặc định** (trước đây được nhớ vì mọi state nằm ở cha). Lý do: việc nhớ giá trị là hệ
quả ngẫu nhiên của cách viết cũ, không phải tính năng được nêu ở đâu; simulator là công cụ thử
nhanh, về mặc định khi quay lại là hành vi quen thấy. Đổi TAB (Library/Explainer…) rồi quay lại
tab Simulators cũng về mặc định — cùng lý do.

**Không đổi:** công thức, giá trị mặc định, nhãn, thứ tự, class Tailwind của mọi simulator; hàm
tính trong `lib/simulators`; route `/ung-dung-thuc-te` và lazy-load ở `App.tsx`.

## Bằng chứng

- **Bảng đối chiếu 10 simulator (tiêu chí ④):** script Playwright đặt MỌI `input`/`select` của
  từng simulator sang giá trị khác mặc định (range/number → 62 % quãng, select → option 2, nhóm
  nút → nút thứ 2), rồi băm SHA-256 toàn bộ chữ trong khung kết quả. Bản cũ và bản mới: **10/10
  băm giống hệt** (vd. mô phỏng 1 với F=3,2 triệu · c=33.000 · Q0=950 · k=10 → giá tối ưu
  80.500 đ, 475 đơn, lãi 19,36 Tr ở cả hai bản).
- **Tầng 8b — 14 ảnh `fullPage` 1440px + 390px, trước/sau** (simulator 1/4/9/10 mặc định + 3 tab):
  10/14 ảnh **giống hệt từng byte**; 4 ảnh lệch 5–106 pixel (răng cưa chữ ở
  `blood_genetics`/`evn_electric`/`tdee_macro`). Chụp lại bản MỚI lần hai → lệch **đúng 4 ảnh
  đó** với mức tương tự (5–97 px) so với lần một, các ảnh khác 0 px → đây là nhiễu render, không
  do mã (đặc tả yêu cầu chỉ ra dòng mã gây khác nếu có: không có).
- `npm run codemap -- impact AppliedKnowledge.tsx`: chỉ `App.tsx` (lazy route) → không đổi.
- `UiNoise.design.test.ts`: khoá `AppliedKnowledge.tsx` 14 → 4 (tab) + `tabs/SimulatorsLab.tsx`
  10 (simulator đang chọn); tổng không đổi.
- Cổng: typecheck ✅ · lint ✅ (0 cảnh báo) · format ✅ · `npm test` ✅ 574 file / 12.162 test ·
  build ✅.
