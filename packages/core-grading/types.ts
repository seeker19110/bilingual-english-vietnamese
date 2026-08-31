// Kiểu dữ liệu của engine chấm dùng chung (Toán · Lý · Hoá).
// Đặc tả: docs/research/dac-ta-engine-cham-dung-chung.md
//
// Nguyên tắc bất di bất dịch: KHÔNG có AI trong luồng chấm. Mọi hàm ở package này
// đều thuần tuý và tất định — cùng đầu vào luôn cho cùng kết quả.

/** Mã lý do — để UI hiện gợi ý có ích mà KHÔNG cần gọi AI. */
export type ReasonCode =
  | 'CORRECT'
  | 'CORRECT_LOOSE' // đúng nhưng lệch nhẹ trong dung sai (nhắc học sinh chuyện làm tròn)
  | 'WRONG_VALUE'
  | 'WRONG_UNIT' // số đúng, đơn vị sai → học sinh tính đúng mà ghi nhầm đơn vị
  | 'MISSING_UNIT'
  | 'WRONG_DIMENSION' // sai cả thứ nguyên (trả khối lượng cho câu hỏi về lực)
  | 'NOT_SIMPLIFIED'
  | 'SIGN_ERROR' // đúng trị tuyệt đối, sai dấu
  | 'UNBALANCED_ATOMS'
  | 'UNBALANCED_CHARGE'
  | 'WRONG_SUBSTANCES' // PTHH: học sinh đổi cả chất, không chỉ hệ số
  | 'PARSE_ERROR'
  | 'EMPTY'

export type GradeResult = {
  correct: boolean
  reason: ReasonCode
  /** Dạng đã chuẩn hoá của câu trả lời — hiện lại cho học sinh + lưu log để rà lỗi chấm. */
  normalized?: string
  /** Nguyên tố lệch khi PTHH chưa cân bằng — chỉ rõ chỗ sai, không tốn lượt AI. */
  offendingElements?: string[]
}

/** Chính sách dung sai. Mặc định xem `defaultToleranceFor()` trong tolerance.ts. */
export type Tolerance =
  | { mode: 'exact' }
  | { mode: 'absolute'; eps: number }
  | { mode: 'relative'; pct: number } // pct tính theo %, vd 2 = 2%
  | { mode: 'sigfig'; digits: number }

/**
 * Đáp án dạng số.
 * QUY TẮC CHỐT: `value` LUÔN lưu ở đơn vị SI cơ sở, không phải đơn vị hiển thị.
 * Nhờ vậy học sinh trả `1 km`, `1000 m` hay `100000 cm` đều so được với cùng một con số.
 * `unit` chỉ dùng để (1) biết thứ nguyên mong đợi, (2) hiển thị.
 */
export type NumericSpec = {
  kind: 'numeric'
  value: number
  unit?: string
  /** Mặc định true khi có `unit` — đề không yêu cầu đơn vị thì đặt false. */
  unitRequired?: boolean
  tolerance?: Tolerance
}

export type FractionSpec = {
  kind: 'fraction'
  num: number
  den: number
  /** Bắt buộc rút gọn tối giản mới tính đúng. Mặc định false (chỉ nhắc). */
  requireSimplified?: boolean
}

export type ExpressionSpec = {
  kind: 'expression'
  /** Biểu thức đúng, vd '2*x + 2'. So khớp bằng thăm dò số (xem expression.ts). */
  expr: string
}

export type ChoiceSpec = {
  kind: 'choice'
  correctIds: readonly string[]
}

export type ChemFormulaSpec = {
  kind: 'chemFormula'
  /** vd 'Fe2(SO4)3' hoặc 'Fe₂(SO₄)₃' — hai cách viết được coi là một. */
  formula: string
}

/**
 * Cân bằng phương trình hoá học.
 * Không so với một bộ hệ số cố định: bội số của bộ hệ số đúng cũng bảo toàn nguyên tố.
 * Engine kiểm bảo toàn nguyên tố + điện tích + tối giản (xem chemistry.ts).
 * `reactants`/`products` chỉ để xác minh học sinh không tự đổi chất.
 */
export type ChemEquationSpec = {
  kind: 'chemEquation'
  reactants: readonly string[]
  products: readonly string[]
  /** Mặc định true — yêu cầu bộ hệ số nguyên tối giản. */
  requireSimplified?: boolean
}

export type AnswerSpec =
  NumericSpec | FractionSpec | ExpressionSpec | ChoiceSpec | ChemFormulaSpec | ChemEquationSpec
