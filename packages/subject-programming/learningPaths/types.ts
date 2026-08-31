// learningPaths/types.ts — Kiểu dữ liệu tầng LỘ TRÌNH MỤC TIÊU của môn Lập trình.
//
// Vì sao có tầng này (tầng thứ 4, xem đặc tả `docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md`):
// ba tầng đã có đều gắn với MỘT trục — xương sống P1–P6 là đường chung một chiều,
// `specializations/` là MỘT hướng × 4 chặng, `courses/` (khoá ngắn) tham chiếu bài học lẻ và
// cố ý không có thứ tự bậc. Nhưng một MỤC TIÊU NGHỀ (ví dụ "Kỹ Sư Trưởng AI") cần ghép CHẶNG
// CỦA NHIỀU HƯỚNG theo thứ tự có phụ thuộc. Tầng này là bảng lắp ghép đó.
//
// Luật quan trọng nhất (kế thừa từ tầng khoá ngắn): lộ trình CHỈ THAM CHIẾU chặng đã tồn tại
// bằng id — `getSpecStage(stageId)` phải tra ra được — KHÔNG bao giờ nhúng nội dung. Nhúng sẽ
// tạo hai bản sao rồi phân kỳ theo thời gian.
//
// Dữ liệu là hằng biên dịch, không I/O, không phụ thuộc thời gian — để test kiểm được và để
// mỗi lần mở app ra cùng một lộ trình.

/** Mã lộ trình — ổn định, làm URL `/lap-trinh/lo-trinh/<id>` và khoá tiến độ (đợt 2). */
export type LearningPathId = 'principal-ai'

/**
 * Một mục trong giai đoạn: trỏ tới CHẶNG đã tồn tại của một hướng chuyên sâu.
 * Cố ý không có trường nội dung nào (modules/project…) — nội dung sống ở hướng gốc.
 */
export interface PathStageRef {
  /** id chặng có thật, ví dụ 'ai-s1' — test canh `getSpecStage()` tra ra được. */
  stageId: string
  /** Vì sao chặng này nằm ở đây — MỘT câu, hiện trên UI để người học hiểu logic lộ trình. */
  why: string
  /**
   * Chỉ khi đạt các chặng này mới nên vào (stageId khác TRONG cùng lộ trình).
   * Không khai = chỉ cần theo thứ tự giai đoạn. Test canh: không vòng lặp.
   */
  requires?: string[]
}

/** Một giai đoạn của lộ trình — nhóm chặng theo mục tiêu, kết bằng một artifact. */
export interface PathPhase {
  /** `<lộ trình>-p<số>`, ví dụ 'principal-ai-p1'. */
  id: string
  name: string
  /** Can-do đo được: xong giai đoạn thì LÀM ĐƯỢC gì. */
  canDo: string
  /**
   * Các chặng theo thứ tự nên học. Mảng RỖNG nghĩa là giai đoạn ĐANG SOẠN nội dung —
   * giao diện phải nói rõ điều đó, không hứa suông (cùng luật `stageUnits.ts`).
   */
  stages: PathStageRef[]
  /** Artifact chốt giai đoạn — bằng chứng giữ lại được (đợt 3 mới có nơi nộp; đợt 1 chỉ hiển thị). */
  artifact: { name: string; brief: string }
}

/** Một lộ trình mục tiêu — từ kho tri thức chung lắp thành một con đường tới một đích nghề. */
export interface LearningPath {
  id: LearningPathId
  /** Tên hiển thị, ví dụ 'Kỹ Sư Trưởng AI'. */
  title: string
  /** Một câu bán hàng — đích đến là ai/làm được gì. */
  tagline: string
  forWho: string
  /** Bậc xương sống tối thiểu nên xong trước khi vào giai đoạn 1 (cùng thang với hướng). */
  prerequisite: 'p3' | 'p4' | 'p5'
  /** Tổng thời lượng ước tính cả lộ trình. */
  duration: string
  /** Các giai đoạn theo thứ tự — số lượng tuỳ lộ trình, mỗi giai đoạn có artifact riêng. */
  phases: PathPhase[]
  /** Dấu hiệu ĐÃ đạt đích — hành vi quan sát được, không phải "số năm kinh nghiệm". */
  outcomes: string[]
}
