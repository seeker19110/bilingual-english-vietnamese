// specializations/stageDetailTypes.ts — CHI TIẾT một chặng của hướng chuyên sâu.
//
// Vì sao có tầng này: `types.ts` mới chỉ là BẢN ĐỒ (chặng gồm module nào, dự án tên gì).
// Người học đứng trước bản đồ vẫn hỏi đúng hai câu app chưa trả lời được:
//   ① "module này học xong thì TÔI LÀM ĐƯỢC gì, và làm sao biết mình đã nắm?"
//   ② "dự án chặng coi là XONG khi nào — chứng minh bằng cách nào?"
// Bốn ô của `SpecModuleDetail` trả lời câu ①; `rubric` + `specBrief` trả lời câu ②.
//
// `specBrief` cố ý là ĐÚNG SÁU Ô của một đặc tả kín (docs/research/
// dac-ta-huong-chuyen-sau-mon-lap-trinh-2026-08-27.md §2.5): dự án chặng S2 là dự án đầu
// tiên đủ lớn để phải ĐẶC TẢ trước khi làm, nên bản mẫu này vừa là hướng dẫn làm dự án vừa
// là bài tập viết đặc tả.
//
// Dữ liệu là hằng biên dịch: không I/O, không phụ thuộc thời gian.

/** Một câu tự kiểm: hỏi và đáp án ngắn (người học tự chấm — tầng này không chấm tự động). */
export interface SpecSelfCheck {
  q: string
  a: string
}

/** Chi tiết một module trong chặng. `moduleId` phải khớp id module trong `stages`. */
export interface SpecModuleDetail {
  /** Khớp CHÍNH XÁC id module ở bản đồ — ví dụ 'web-s2-m1'. */
  moduleId: string
  /** Một câu: học xong LÀM ĐƯỢC gì (đo được, không phải "hiểu về ..."). */
  objective: string
  /** 2–4 việc phải tự tay làm. Không chấm tự động — tầng này là bản đồ + nghiệm thu. */
  practice: string[]
  /** 2–4 câu tự kiểm kèm đáp án ngắn. */
  selfCheck: SpecSelfCheck[]
  /** 2–3 dấu hiệu QUAN SÁT ĐƯỢC là đã nắm (hành vi, không phải cảm giác). */
  doneSignals: string[]
}

/** Một tiêu chí nghiệm thu dự án chặng. */
export interface SpecRubricItem {
  /** `<stageId>-r<số>` — ví dụ 'web-s2-r1'. Là khoá tiến độ nên phải ổn định. */
  id: string
  /** Tiêu chí, ĐO ĐƯỢC. "Nhanh" không phải tiêu chí; "p95 < 300ms" mới là. */
  text: string
  /** Chứng minh bằng cách nào: lệnh chạy, số đo, thao tác tái hiện được. */
  howToProve: string
}

/**
 * Sáu ô của một đặc tả kín — bản mẫu cho chính dự án của chặng.
 * Ô `scopeDont` ("KHÔNG làm") là ô hay bị bỏ nhất và cũng là ô giữ cho dự án không phình.
 */
export interface SpecBrief {
  scopeDo: string[]
  scopeDont: string[]
  touchpoints: string[]
  contracts: string[]
  acceptance: string[]
  invariants: string[]
  conventions: string[]
}

export interface SpecStageDetail {
  /** Id chặng đầy đủ — ví dụ 'web-s2'. */
  stageId: string
  modules: SpecModuleDetail[]
  /** ≥ 4 tiêu chí nghiệm thu dự án chặng. */
  rubric: SpecRubricItem[]
  specBrief: SpecBrief
}
