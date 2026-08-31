// courses/types.ts — Kiểu dữ liệu tầng KHOÁ NGẮN của môn Lập trình (PR 2/4 khoá Git).
//
// Vì sao có tầng này: hai tầng đã có (`curriculum.ts` xương sống P1–P6, `specializations/`
// 13 hướng chuyên sâu) đều gắn với MỘT VỊ TRÍ trong lộ trình dài. Nhưng có kỹ năng không
// thuộc bậc nào — Git là ví dụ đầu tiên: người mới cần nó từ tuần đầu, người đã đi làm vẫn
// quay lại tra cứu. Khoá ngắn học được ĐỘC LẬP, không đòi hỏi đã học xong bậc nào.
//
// Luật quan trọng nhất của tầng này: khoá CHỈ THAM CHIẾU bài học đã tồn tại bằng id — không
// bao giờ nhúng nội dung. Một bài có thể vừa thuộc xương sống P1–P6 vừa nằm trong một khoá
// ngắn (ví dụ hai bài Git đầu tiên vẫn là `p3-u10-l1`/`p3-u10-l2` của P3). Nhúng nội dung sẽ
// tạo ra hai bản sao rồi phân kỳ theo thời gian — điều tuyệt đối phải tránh.
//
// Dữ liệu là hằng biên dịch, không I/O, không phụ thuộc thời gian.

/** Mã khoá ngắn — ổn định, dùng làm URL `/lap-trinh/khoa-hoc/<id>`. */
export type ShortCourseId = 'git' | 'hermes' | 'vibe' | 'openclaw'

/** Một chương trong khoá — nhóm các bài theo chủ đề, không phải một bài riêng. */
export interface CourseChapter {
  /** `<khoá>-c<số>`, ví dụ 'git-c3'. */
  id: string
  title: string
  /** Một câu: chương này dạy được gì. */
  summary: string
  /**
   * id BÀI đã tồn tại trong `lessons.ts` (`getLesson()` tra ra được) — THAM CHIẾU, không
   * nhúng nội dung. Cố ý cho phép trộn id thuộc xương sống cũ ('p3-u10-l1') với id thuộc
   * riêng khoá này ('git-u2-l1').
   */
  lessonIds: string[]
}

/** Một khoá ngắn — cắt ngang bậc P1–P6, học được độc lập. */
export interface ShortCourse {
  id: ShortCourseId
  title: string
  /** Một câu: học xong LÀM ĐƯỢC gì (can-do), không phải "biết về". */
  canDo: string
  duration: string
  /** Cần biết trước — mảng rỗng nghĩa là vào thẳng được, không cần học bậc nào trước. */
  prerequisites: string[]
  chapters: CourseChapter[]
}
