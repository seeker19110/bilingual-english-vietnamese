// lessonTypes — Kiểu + Zod schema cho BÀI HỌC 8 BƯỚC môn Lập trình (PR-L3).
// Khuôn 8 bước (đặc tả dac-ta-mon-lap-trinh-2026-08-24.md §3): ① móc thực tế → ② khái niệm
// → ③ ví dụ mẫu → ④ Predict → ⑤ Parsons → ⑥ tự viết (Make, chấm test-case) → ⑦ ứng dụng
// về nhà → ⑧ thẻ SRS (⑧ nối vào SRS chung ở PR sau — schema đã chừa chỗ).
// Zod validate ở test (chặn CI khi soạn nội dung sai khuôn) — dữ liệu là hằng biên dịch.
import { z } from 'zod'

/** Một ca chấm cho bài Make: chạy code học viên với stdin này, so output. */
export const TestCaseSchema = z
  .object({
    /** Mỗi phần tử một lần input(). */
    stdinLines: z.array(z.string().max(200)).max(20).default([]),
    /** Chuỗi PHẢI XUẤT HIỆN trong output (sau chuẩn hoá) — chấm "contains" là mặc định
     *  vì bài cho người mới thường in kèm lời dẫn tự do. */
    expected: z.string().min(1).max(500),
    /** 'exact': toàn bộ output (chuẩn hoá) phải bằng expected. Mặc định 'contains'. */
    match: z.enum(['contains', 'exact']).default('contains'),
    /** Ca ẩn: học viên chỉ thấy đạt/không đạt, không thấy stdin/expected (chống hardcode). */
    hidden: z.boolean().default(false),
    /** Mô tả ngắn hiện cho học viên (vd "180 kWh → 380.870 đồng"). */
    label: z.string().min(1).max(200),
  })
  .strict()

export const LessonSchema = z
  .object({
    /** id ổn định `<unit>-l<số>` (vd 'p1-u4-l1') — khoá tiến độ trong Postgres. */
    id: z.string().regex(/^p[1-6]-u\d+-l\d+$/),
    /** Unit chứa bài — phải tồn tại trong curriculum.ts (test kiểm chéo). */
    unitId: z.string().regex(/^p[1-6]-u\d+$/),
    /** Ngôn ngữ của bài (PR-L7b1) — quyết định bộ chạy ở trình duyệt VÀ cổng CI nào chấm
     *  bài. KHÔNG có giá trị mặc định ngầm: người soạn phải ghi rõ, vì chọn sai ngôn ngữ
     *  nghĩa là bài không được cổng nào chấm. */
    language: z.enum(['python', 'javascript', 'sql', 'html']),
    title: z.string().min(1).max(120),
    /** ① Móc thực tế (≤ 3 câu). */
    hook: z.string().min(1).max(600),
    /** ② Khái niệm — đoạn văn thuần, xuống dòng bằng \n (chưa cần markdown ở PR-L3). */
    theory: z.string().min(1).max(4000),
    /** ③ Ví dụ mẫu chạy được, chú thích TỪNG DÒNG bằng comment tiếng Việt trong code. */
    workedExample: z
      .object({
        code: z.string().min(1).max(4000),
        stdinLines: z.array(z.string().max(200)).max(20).default([]),
      })
      .strict(),
    /** ④ Predict: cho code, hỏi "in ra gì?" trước khi cho chạy. */
    predict: z
      .object({
        code: z.string().min(1).max(2000),
        question: z.string().min(1).max(300),
        choices: z.array(z.string().min(1).max(200)).min(2).max(4),
        answerIndex: z.number().int().nonnegative(),
        explain: z.string().min(1).max(600),
      })
      .strict(),
    /** ⑤ Parsons: xếp các dòng code về đúng thứ tự (mảng `lines` là thứ tự ĐÚNG;
     *  UI tự xáo trộn khi hiển thị — deterministic theo id, xem parsonsShuffle()). */
    parsons: z
      .object({
        prompt: z.string().min(1).max(400),
        lines: z.array(z.string().min(1).max(200)).min(3).max(12),
      })
      .strict(),
    /** ⑥ Tự viết (Make): đề + code khởi đầu + test-case + gợi ý bậc thang + code mẫu (phao). */
    make: z
      .object({
        prompt: z.string().min(1).max(1500),
        starterCode: z.string().max(2000).default(''),
        testCases: z.array(TestCaseSchema).min(1).max(10),
        /** Gợi ý bậc thang: nhắc khái niệm → chỉ vùng lỗi → ví dụ tương tự (mở dần). */
        hints: z.array(z.string().min(1).max(500)).min(1).max(5),
        /** Code mẫu tham chiếu — "phao", mở ra được nhưng đánh dấu đã xem. */
        sampleSolution: z.string().min(1).max(4000),
      })
      .strict(),
    /** ⑦ Ứng dụng về nhà — biến thể gắn đời thật, không chấm. */
    homework: z.string().min(1).max(800),
  })
  .strict()
  .refine((l) => l.predict.answerIndex < l.predict.choices.length, {
    message: 'predict.answerIndex vượt quá số lựa chọn',
  })
  .refine((l) => l.id.startsWith(`${l.unitId}-l`), {
    message: 'id bài học phải bắt đầu bằng unitId',
  })

export type ProgrammingTestCase = z.infer<typeof TestCaseSchema>
export type ProgrammingLesson = z.infer<typeof LessonSchema>
