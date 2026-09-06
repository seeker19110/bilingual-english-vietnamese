# 0278 — 2026-09-06 — Tách `StudyTabs.tsx` (2.071 dòng) thành thư mục `studyTabs/`

**PR:** (điền khi tạo) · **Loại:** `refactor(english)` · **Nhánh:** `claude/danh-gia-sau-du-an-tpvud1`

## Việc đã làm

Mục "Tiếp theo" ưu tiên 3 (đánh giá sâu `0276`): 4 file giao diện > 1.700 dòng là điểm nóng
sửa-là-dễ-gãy. Đợt này tách file lớn nhất, **mã GIỮ NGUYÊN từng dòng** (chỉ chia file + cắt
import không dùng):

| File mới (`apps/dhcb/src/components/studyTabs/`) | Dòng | Nội dung                                                  |
| ------------------------------------------------ | ---- | --------------------------------------------------------- |
| `quizBuilders.ts`                                | 126  | hằng số + `buildQuiz` / `buildMiniQuiz` + kiểu dùng chung |
| `TodayLesson.tsx`                                | 817  | `BatchDoneView` + `TodayLesson` (tab Hôm nay)             |
| `SRSReview.tsx`                                  | 325  | tab Ôn SRS                                                |
| `HardWords.tsx`                                  | 87   | tab Từ khó                                                |
| `QuizTab.tsx`                                    | 272  | tab Kiểm tra                                              |
| `ListeningTab.tsx`                               | 450  | `MeaningPractice` + `DictationPractice` + tab Nghe        |

`components/StudyTabs.tsx` còn 23 dòng, là **barrel re-export** nên 4 nơi đang import
(`StudyPanel`, `CefrLevelPage`, `Learn`, `RoadmapTab`) **không đổi một dòng**. `npm run codemap
-- impact` xác nhận đúng 6 file bị ảnh hưởng gián tiếp, không có consumer nào khác.

## Bằng chứng

- **Thân mã giống hệt:** script so chuỗi (bỏ import/comment/khoảng trắng) giữa bản cũ từ dòng
  101 và 6 file mới nối lại → `THÂN MÃ GIỐNG HỆT`.
- **Tầng 8b (ảnh chụp trước/sau, 1440px + 390px, 5 tab `/lo-trinh-hoc/a1?tab=…`):** 6/10 ảnh
  **giống hệt từng byte** (today · srs · hard). 4 ảnh quiz/listening khác nhau — chụp lại lần
  hai trên CÙNG mã mới vẫn khác → do câu hỏi bốc ngẫu nhiên, không do mã; nhìn ảnh 390px tab
  Kiểm tra trước/sau: cùng bố cục, chỉ khác từ được hỏi.
- Cổng: typecheck ✅ · lint ✅ · format ✅ · `npm test` ✅ · build ✅ (số trong mô tả PR).

## Còn lại của mục này

3 file > 1.700 dòng chưa tách: `pages/learning/AppliedKnowledge.tsx` (1.942) ·
`pages/learning/Practice.tsx` (1.752) · `pages/subjects/english/Lessons.tsx` (1.693) — mỗi file
một PR, cùng quy trình (so thân mã + Tầng 8b).
