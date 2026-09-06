# 0279 — 2026-09-06 — Tách `Practice.tsx` (1.752 dòng) thành thư mục `practice/`

**PR:** (điền khi tạo) · **Loại:** `refactor(english)` · **Nhánh:** `claude/danh-gia-sau-du-an-tpvud1`

## Việc đã làm

Tiếp mục "Tiếp theo" ưu tiên 3 (sau `StudyTabs.tsx` ở `0278`). Trang Luyện tập gồm 8 mini-game
đã có ranh giới comment rõ nên tách **thuần dời mã**, không đổi một dòng logic:

| File mới (`apps/dhcb/src/pages/learning/practice/`) | Dòng | Nội dung                                                           |
| --------------------------------------------------- | ---- | ------------------------------------------------------------------ |
| `shared.ts`                                         | 42   | `Mode`, `SESSION_SIZE`, `INTERVIEW_ROUNDS`, `pickExampleSentences` |
| `GameChrome.tsx`                                    | 81   | `GameResult` + `MiniHeader` (khung dùng chung mọi game)            |
| `VocabListenGuess.tsx`                              | 124  | 1) Nghe đoán từ vựng                                               |
| `SentenceScramble.tsx`                              | 159  | 2) Sắp xếp câu                                                     |
| `DictationTyping.tsx`                               | 119  | 3) Nghe & viết lại                                                 |
| `FillBlankQuiz.tsx`                                 | 117  | 4) Điền từ trắc nghiệm                                             |
| `PronounceList.tsx`                                 | 55   | 5–6) Chấm phát âm từ / đọc lại câu                                 |
| `Shadowing.tsx`                                     | 176  | 7) Shadowing                                                       |
| `ReverseInterview.tsx`                              | 236  | 8) Phỏng vấn ngược (AI chấm)                                       |

`pages/learning/Practice.tsx` còn **743 dòng** = trang hub (thẻ chọn game + điều hướng), import
8 game từ thư mục mới. Route `/luyen-tap` và `App.tsx` không đổi. Tách `shared` thành `.ts`
(hằng/hàm) + `GameChrome.tsx` (component) để không vướng luật `react-refresh/only-export-components`.

## Bằng chứng

- **Thân mã giống hệt:** so chuỗi (bỏ import/comment/khoảng trắng/dấu `;` do prettier gộp dòng
  kiểu inline) giữa bản cũ từ dòng 62 và 10 file mới nối lại → `THÂN MÃ GIỐNG HỆT`.
- **Tầng 8b — ảnh chụp trước/sau, 1440px + 390px, `/luyen-tap` hub + 3 game (nghe đoán từ ·
  sắp xếp câu · điền từ):** hub **giống hệt từng byte** ở cả hai khổ; 6 ảnh game khác nhau,
  chụp lại lần hai trên cùng mã mới vẫn khác → do câu/từ bốc ngẫu nhiên. Nhìn ảnh Sắp xếp câu
  390px trước/sau: cùng bố cục, chỉ khác câu ("France is the capital of Paris" vs "The baby is
  crying").
- `npm run codemap -- impact`: `Practice.tsx` chỉ có `App.tsx` (lazy route) + 1 test thiết kế
  dùng — không consumer nào khác.
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ · build ✅ (số trong mô tả PR).

## Còn lại của mục này

- `pages/subjects/english/Lessons.tsx` (1.693): `LessonView` một mình ~970 dòng (có chế độ Đóng
  vai lồng trong) — tách được `SearchBar`/`LessonList`/`InlinePronounce`/`WordText` ra trước,
  `LessonView` cần tách chế độ Đóng vai riêng (không còn là dời thuần, cần đọc kỹ state).
- `pages/learning/AppliedKnowledge.tsx` (1.942): **một hàm component duy nhất, 42 `useState`,
  không có ranh giới** — không tách bằng cách dời mã được; cần thiết kế lại thành các section
  component có props rõ. Đây là việc tái cấu trúc thật, cần đặc tả ngắn + Tầng 8b đầy đủ, tách
  đợt riêng.
