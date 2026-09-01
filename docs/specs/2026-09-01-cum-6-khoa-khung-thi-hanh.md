# Đặc tả kín — PHẦN KHUNG thi hành cụm 6 khoá "Kỹ sư AI thực chiến"

> Ngày 2026-09-01. Bổ trợ cho đặc tả khung `2026-09-01-cum-6-khoa-ai-engineer.md`. File này
> chốt KÍN phần hạ tầng: nội dung chính xác 5 file khoá (`courses/*.ts` — riêng `mlds.ts`
> nằm trong đặc tả bài chi tiết của khoá đó), registry, và diff regex 4 chỗ. Phần NỘI DUNG
> BÀI HỌC kín từng bài nằm ở 6 file `2026-09-01-<id>-bai-hoc-chi-tiet.md` cùng thư mục.

## 1. `courses/types.ts` — nới `ShortCourseId`

```ts
export type ShortCourseId =
  | 'git'
  | 'hermes'
  | 'vibe'
  | 'openclaw'
  | 'ml'
  | 'pyai'
  | 'mathai'
  | 'mlds'
  | 'cv1'
  | 'cv2'
  | 'llmagent'
```

## 2. `courses/registry.ts` — 6 import + 6 phần tử, đúng thứ tự chuỗi

```ts
import { PYAI_COURSE } from './pyai.js'
import { MATHAI_COURSE } from './mathai.js'
import { MLDS_COURSE } from './mlds.js'
import { CV1_COURSE } from './cv1.js'
import { CV2_COURSE } from './cv2.js'
import { LLMAGENT_COURSE } from './llmagent.js'

export const SHORT_COURSES: ShortCourse[] = [
  GIT_COURSE,
  HERMES_COURSE,
  VIBE_COURSE,
  OPENCLAW_COURSE,
  ML_COURSE,
  PYAI_COURSE,
  MATHAI_COURSE,
  MLDS_COURSE,
  CV1_COURSE,
  CV2_COURSE,
  LLMAGENT_COURSE,
]
```

## 3. Nới regex lessonId — đúng 4 chỗ, một lần cho cả 6 tiền tố

Nhóm hiện tại `(git|hermes|vibe|openclaw|ml)` đổi thành
`(git|hermes|vibe|openclaw|ml|pyai|mathai|mlds|cv1|cv2|llmagent)` tại:

1. `packages/subject-programming/lessonTypes.ts` — regex của `id` (dòng `z.string().regex(...)`).
2. `packages/subject-programming/lessonTypes.ts` — regex của `unitId`.
3. `apps/server/src/api/subjects/programming/progress.ts` — regex validate lessonId.
4. `apps/server/src/api/subjects/programming/feedback.ts` — regex validate lessonId.

Lưu ý thứ tự alternation: `ml` đứng TRƯỚC `mlds` trong nhóm cũ — regex alternation của JS thử
trái sang phải, `ml` sẽ khớp trước tiền tố `mlds-...` rồi fail ở `-u`, backtrack sang `mlds`
vẫn khớp đúng vì cả nhóm nằm trong một alternation có backtracking. AN TOÀN, nhưng để khỏi
nghĩ: đặt `mlds` TRƯỚC `ml` hoặc giữ nguyên đều đúng — chốt: dùng đúng chuỗi ghi ở trên
(`ml|pyai|mathai|mlds|...`), đã kiểm bằng suy luận backtracking.

## 4. Nội dung chính xác 5 file khoá

### 4.1. `courses/pyai.ts`

```ts
// courses/pyai.ts — Khoá 1/6 cụm "Kỹ sư AI thực chiến"
// (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md).
import type { ShortCourse } from './types.js'

export const PYAI_COURSE: ShortCourse = {
  id: 'pyai',
  title: 'Python / AI Cơ Bản',
  canDo:
    'Viết được chương trình Python có hàm, cấu trúc dữ liệu, file và lớp; nói được AI học từ dữ liệu khác gì luật viết tay, qua 2 case study tự chạy.',
  duration: '17 bài · vào thẳng từ số 0 — cửa vào của chuỗi 6 khoá Kỹ sư AI',
  prerequisites: [],
  chapters: [
    {
      id: 'pyai-c1',
      title: 'Python nhập môn',
      summary: 'Biến, điều kiện, vòng lặp, hàm, chuỗi — đủ vốn để bắt đầu nghĩ bằng code.',
      lessonIds: ['pyai-u1-l1', 'pyai-u1-l2', 'pyai-u1-l3', 'pyai-u1-l4', 'pyai-u1-l5'],
    },
    {
      id: 'pyai-c2',
      title: 'Cấu trúc dữ liệu, file & OOP',
      summary: 'List, dict, đọc/ghi file, lớp và tổ chức chương trình có xử lý lỗi.',
      lessonIds: ['pyai-u2-l1', 'pyai-u2-l2', 'pyai-u2-l3', 'pyai-u2-l4', 'pyai-u2-l5'],
    },
    {
      id: 'pyai-c3',
      title: 'AI là gì',
      summary:
        'Luật viết tay vs học từ dữ liệu, bản đồ AI/ML/DL/GenAI, vòng đời dự án AI, đạo đức & giới hạn.',
      lessonIds: ['pyai-u3-l1', 'pyai-u3-l2', 'pyai-u3-l3', 'pyai-u3-l4'],
    },
    {
      id: 'pyai-c4',
      title: 'Case study chạy thật',
      summary: 'Hai case study trọn gói + bản đồ 5 khoá tiếp theo của chuỗi.',
      lessonIds: ['pyai-u4-l1', 'pyai-u4-l2', 'pyai-u4-l3'],
    },
  ],
}
```

### 4.2. `courses/mathai.ts`

```ts
// courses/mathai.ts — Khoá 2/6 cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const MATHAI_COURSE: ShortCourse = {
  id: 'mathai',
  title: 'Toán Thiết Yếu cho AI',
  canDo:
    'Tự cài được nhân ma trận, tính được xác suất/kỳ vọng, lấy đạo hàm số và chạy gradient descent hội tụ — đọc công thức trong tài liệu ML không còn sợ.',
  duration: '13 bài · nên học sau khoá Python / AI Cơ Bản',
  prerequisites: ['Khoá Python / AI Cơ Bản (pyai) hoặc biết Python căn bản'],
  chapters: [
    {
      id: 'mathai-c1',
      title: 'Xác suất & thống kê',
      summary:
        'Xác suất từ đếm, Bayes, kỳ vọng/phương sai, phân phối và thống kê mô tả — tự cài hết.',
      lessonIds: ['mathai-u1-l1', 'mathai-u1-l2', 'mathai-u1-l3', 'mathai-u1-l4', 'mathai-u1-l5'],
    },
    {
      id: 'mathai-c2',
      title: 'Đại số tuyến tính',
      summary: 'Vector, nhân ma trận 3 vòng lặp, cosine similarity và trực giác PCA.',
      lessonIds: ['mathai-u2-l1', 'mathai-u2-l2', 'mathai-u2-l3', 'mathai-u2-l4'],
    },
    {
      id: 'mathai-c3',
      title: 'Giải tích & tối ưu hoá',
      summary: 'Đạo hàm số, gradient, gradient descent tự cài và hàm mất mát trong ML thật.',
      lessonIds: ['mathai-u3-l1', 'mathai-u3-l2', 'mathai-u3-l3', 'mathai-u3-l4'],
    },
  ],
}
```

### 4.3. `courses/cv1.ts`

```ts
// courses/cv1.ts — Khoá 4/6 cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const CV1_COURSE: ShortCourse = {
  id: 'cv1',
  title: 'Deep Learning for Computer Vision cơ bản',
  canDo:
    'Giải thích và tự cài được forward pass của MLP và CNN (convolution/pooling), chạy được vòng huấn luyện trên bài toán ảnh nhỏ; đọc hiểu code PyTorch tương đương và biết Docker đóng gói mô hình để làm gì.',
  duration: '14 bài · 3 giai đoạn · nên học sau khoá Machine Learning & Data Science',
  prerequisites: ['Khoá Machine Learning & Data Science (mlds)'],
  chapters: [
    {
      id: 'cv1-c1',
      title: 'Nơ-ron & mạng MLP',
      summary:
        'Ảnh là ma trận số; nơ-ron, forward pass, hàm mất mát và trực giác lan truyền ngược.',
      lessonIds: ['cv1-u1-l1', 'cv1-u1-l2', 'cv1-u1-l3', 'cv1-u1-l4', 'cv1-u1-l5'],
    },
    {
      id: 'cv1-c2',
      title: 'CNN',
      summary:
        'Convolution/pooling tự cài, kiến trúc CNN, vòng huấn luyện đầy đủ, augment & overfit.',
      lessonIds: ['cv1-u2-l1', 'cv1-u2-l2', 'cv1-u2-l3', 'cv1-u2-l4', 'cv1-u2-l5'],
    },
    {
      id: 'cv1-c3',
      title: 'PyTorch, transfer learning & Docker',
      summary:
        'Đọc PyTorch bằng vốn tự cài, transfer learning, đánh giá mô hình ảnh, đóng gói triển khai.',
      lessonIds: ['cv1-u3-l1', 'cv1-u3-l2', 'cv1-u3-l3', 'cv1-u3-l4'],
    },
  ],
}
```

### 4.4. `courses/cv2.ts`

```ts
// courses/cv2.ts — Khoá 5/6 cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const CV2_COURSE: ShortCourse = {
  id: 'cv2',
  title: 'Deep Learning for CV nâng cao',
  canDo:
    'Tự cài được attention một đầu và giải thích ViT; tự cài IoU + NMS của object detection; giải thích và mô phỏng được GAN, diffusion — đọc hiểu kiến trúc CV 2026.',
  duration: '14 bài · 4 giai đoạn · nên học sau khoá Deep Learning for CV cơ bản',
  prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1)'],
  chapters: [
    {
      id: 'cv2-c1',
      title: 'Transformer & ViT',
      summary:
        'Vì sao cần attention; self-attention tự cài; multi-head, positional encoding và ViT.',
      lessonIds: ['cv2-u1-l1', 'cv2-u1-l2', 'cv2-u1-l3', 'cv2-u1-l4'],
    },
    {
      id: 'cv2-c2',
      title: 'Object detection',
      summary: 'Bài toán phát hiện vật, IoU và non-max suppression tự cài, dòng họ mô hình.',
      lessonIds: ['cv2-u2-l1', 'cv2-u2-l2', 'cv2-u2-l3', 'cv2-u2-l4'],
    },
    {
      id: 'cv2-c3',
      title: 'Mô hình sinh ảnh',
      summary: 'GAN hai người chơi, vì sao GAN khó, diffusion từng bước, bức tranh sinh ảnh 2026.',
      lessonIds: ['cv2-u3-l1', 'cv2-u3-l2', 'cv2-u3-l3', 'cv2-u3-l4'],
    },
    {
      id: 'cv2-c4',
      title: 'Tổng hợp',
      summary: 'Project pipeline nhận diện tổng hợp + tổng kết, lối đi tiếp.',
      lessonIds: ['cv2-u4-l1', 'cv2-u4-l2'],
    },
  ],
}
```

### 4.5. `courses/llmagent.ts`

```ts
// courses/llmagent.ts — Khoá 6/6, khoá cuối cụm "Kỹ sư AI thực chiến".
import type { ShortCourse } from './types.js'

export const LLMAGENT_COURSE: ShortCourse = {
  id: 'llmagent',
  title: 'LLMs & AI Agents',
  canDo:
    'Tự cài tokenizer + sinh next-token + RAG mini + vòng lặp agent ReAct chạy thật bằng Python thuần; thiết kế được hệ RAG/agent thực tế và nói được chi phí, giới hạn, cách triển khai.',
  duration: '14 bài · khoá cuối chuỗi — nên học sau khoá Deep Learning for CV cơ bản',
  prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1) hoặc nắm vững MLP/attention'],
  chapters: [
    {
      id: 'llmagent-c1',
      title: 'NLP → LLM',
      summary:
        'Tokenizer, embedding, mô hình ngôn ngữ n-gram, đường tới Transformer, prompt & giới hạn.',
      lessonIds: [
        'llmagent-u1-l1',
        'llmagent-u1-l2',
        'llmagent-u1-l3',
        'llmagent-u1-l4',
        'llmagent-u1-l5',
      ],
    },
    {
      id: 'llmagent-c2',
      title: 'RAG',
      summary: 'Vì sao RAG; pipeline RAG mini tự cài; chunking, đánh giá retrieval; RAG sản xuất.',
      lessonIds: ['llmagent-u2-l1', 'llmagent-u2-l2', 'llmagent-u2-l3', 'llmagent-u2-l4'],
    },
    {
      id: 'llmagent-c3',
      title: 'AI Agents & triển khai',
      summary:
        'Vòng lặp agent ReAct tự cài, tool use/MCP, đánh giá & an toàn, triển khai + tổng kết chuỗi.',
      lessonIds: [
        'llmagent-u3-l1',
        'llmagent-u3-l2',
        'llmagent-u3-l3',
        'llmagent-u3-l4',
        'llmagent-u3-l5',
      ],
    },
  ],
}
```

> `courses/mlds.ts` (chương 1–2 tham chiếu `ml-u1-*`/`ml-u2-*`): nội dung chính xác nằm cuối
> `2026-09-01-mlds-bai-hoc-chi-tiet.md`.

## 5. File bài học & đăng ký `lessons.ts`

Mỗi unit một file: `lessons/pyaiu1..4.ts` · `mathaiu1..3.ts` · `mldsu1..3.ts` · `cv1u1..3.ts`
· `cv2u1..4.ts` · `llmagentu1..3.ts` — export mảng `<ID>_U<N>_LESSONS: ProgrammingLesson[]`
(khuôn y hệt `mlu1.ts`), nội dung từng phần tử lấy NGUYÊN VĂN từ file đặc tả bài chi tiết
tương ứng. Đăng ký vào `lessons.ts` theo đúng cách các mảng `ML_U*_LESSONS` đang được nối.
Test: mỗi khoá một file `lessons<TênKhoá>.test.ts` theo khuôn `lessonsPython.test.ts`/cách
các bài `ml` được gom chấm (nếu `lessonsPython.test.ts` tự quét mọi bài `language: 'python'`
thì KHÔNG cần file test mới — kiểm thực tế khi thi hành, ưu tiên cơ chế tự quét sẵn có).

## 6. Thứ tự thi hành & cổng (giữ nguyên đặc tả khung §⑤–⑥)

5 đợt PR như đặc tả khung; đợt 1 (`pyai`) nới luôn regex đủ 6 tiền tố (mục 3). Mỗi đợt chạy
đủ: `npm run typecheck` · `npm run lint` · `npm test` (gồm cổng python3 chấm code thật +
schema + srsCards + courses.test.ts).
