// programmingRoutes — dựng URL của môn Lập trình ở MỘT chỗ duy nhất.
//
// VÌ SAO: từ 2026-08-31 mọi URL nội dung của môn mang dạng `<mã>--<tiêu đề đã slug hoá>`
// (xem `@core/slug`): mã giữ nguyên để link cũ và khoá tiến độ không đổi, phần mô tả thêm vào
// để người đọc và Google biết trang nói về gì. Ghép chuỗi đó rải rác ở từng trang là cách
// chắc chắn để một chỗ nào đó quên phần mô tả rồi sinh ra URL thứ hai cùng nội dung.
//
// Mọi hàm ở đây là hàm thuần, không I/O, và CHỈ nhận đối tượng đã có tên/tiêu đề — file này
// cố ý KHÔNG import registry dữ liệu nào (hướng chuyên sâu, khoá học…): nó được 10 chunk dùng
// chung, mà kéo registry 14 hướng vào là +48 kB gzip cho mọi trang cần dựng một URL (đo
// 2026-09-01). Hàm tra cứu theo id (cần registry) nằm ở `programmingRoutesSpec.ts`.
import { buildSlugSegment } from '@core/slug'
import type { ShortCourse } from '@dhcb/subject-programming/courses/types'
import type {
  ProgrammingSpecialization,
  SpecStage,
} from '@dhcb/subject-programming/specializations/types'
import type { LearningPath } from '@dhcb/subject-programming/learningPaths/types'
import type { ProgrammingLevel } from '@dhcb/subject-programming/curriculum'

/** Trang một bậc P1–P6. */
export function duongDanBac(level: Pick<ProgrammingLevel, 'id' | 'name'>): string {
  return `/lap-trinh/${buildSlugSegment(level.id, level.name)}`
}

/** Trang một khoá ngắn. */
export function duongDanKhoa(course: Pick<ShortCourse, 'id' | 'title'>): string {
  return `/lap-trinh/khoa-hoc/${buildSlugSegment(course.id, course.title)}`
}

/** Trang một hướng chuyên sâu. */
export function duongDanHuong(spec: Pick<ProgrammingSpecialization, 'id' | 'name'>): string {
  return `/lap-trinh/huong/${buildSlugSegment(spec.id, spec.name)}`
}

/** Trang MỘT CHẶNG của một hướng chuyên sâu. */
export function duongDanChangHuong(
  spec: Pick<ProgrammingSpecialization, 'id' | 'name'>,
  stage: Pick<SpecStage, 'id' | 'name'>,
): string {
  return `${duongDanHuong(spec)}/${buildSlugSegment(stage.id, stage.name)}`
}

/** Trang tổng quan một lộ trình mục tiêu. */
export function duongDanLoTrinh(path: Pick<LearningPath, 'id' | 'title'>): string {
  return `/lap-trinh/lo-trinh/${buildSlugSegment(path.id, path.title)}`
}

/** Trang một chặng RIÊNG của lộ trình (chặng không thuộc hướng nào). */
export function duongDanChangLoTrinh(
  path: Pick<LearningPath, 'id' | 'title'>,
  stage: Pick<SpecStage, 'id' | 'name'>,
): string {
  return `${duongDanLoTrinh(path)}/chang/${buildSlugSegment(stage.id, stage.name)}`
}

/** Màn chẩn đoán chọn điểm vào của một lộ trình. */
export function duongDanChanDoan(path: Pick<LearningPath, 'id' | 'title'>): string {
  return `${duongDanLoTrinh(path)}/chan-doan`
}
