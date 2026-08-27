// specializations/stageDetailTypes.ts — Kiểu dữ liệu tầng CHI TIẾT CHẶNG (đợt 1: chặng S3).
//
// Vì sao có tầng này: `types.ts` mô tả chặng ở mức BẢN ĐỒ — học gì, làm dự án gì. Bản đồ đủ để
// CHỌN hướng, nhưng chưa đủ để ĐI: người học biết mình phải học "hiệu năng web" mà vẫn không
// biết hôm nay ngồi xuống làm gì, và làm xong thì lấy gì chứng minh là đạt.
//
// Vì sao chọn chặng S3 làm đợt đầu: S1–S2 là kiến thức giáo trình nào cũng có; S4 phụ thuộc bối
// cảnh công ty nên không đặc tả chung được. S3 đúng là chỗ người học khựng lại — biết làm cho
// chạy rồi, nhưng không biết thế nào là "đủ tốt". Mà "đủ tốt" thì ĐO ĐƯỢC, nên đặc tả được.
//
// Luật xuyên suốt: mọi ngưỡng ĐẠT phải là CON SỐ. "Nhanh hơn" không phải tiêu chí — "LCP ≤ 2,5s"
// mới là. Test `stageDetails.test.ts` canh đúng luật này, phá là CI đỏ.
//
// Dữ liệu là hằng biên dịch, không I/O, không phụ thuộc thời gian — cùng luật với `types.ts`.

/** Bài luyện của MỘT module trong chặng — gắn với module có thật qua `moduleId`. */
export interface SpecModuleDrill {
  /** Phải khớp đúng một `SpecModule.id` của chặng, ví dụ 'web-s3-m1'. */
  moduleId: string
  /** Việc phải LÀM (động từ đứng đầu) — không phải "đọc hiểu về…". */
  drill: string
  /** Bằng chứng nộp: lệnh chạy được hoặc số đo. Bắt buộc có con số. */
  evidence: string
}

/** Một dòng thang chấm dự án của chặng. */
export interface SpecRubricRow {
  /** Chấm cái gì. */
  criterion: string
  /** Ngưỡng ĐẠT — bắt buộc chứa CON SỐ. */
  pass: string
  /** Dấu hiệu CHƯA đạt, viết cụ thể để tự chấm được. */
  fail: string
}

/**
 * Chi tiết thi hành của một chặng: vào bằng gì, làm gì, chấm ra sao, ra bằng gì.
 * Một `SpecStageDetail` luôn gắn với một `SpecStage` có thật qua `stageId`.
 */
export interface SpecStageDetail {
  /** '<hướng>-s3'. Phải trỏ tới một `SpecStage` có thật trong sổ đăng ký hướng. */
  stageId: string
  /** 3–5 điều kiện vào, mỗi điều kiện TỰ KIỂM được (không phải "hiểu rõ về…"). */
  entryGate: string[]
  /** Phủ ĐÚNG tập module của chặng: không thiếu, không thừa, không trùng. */
  moduleDrills: SpecModuleDrill[]
  /** Thang chấm dự án chặng — ít nhất phủ đủ số `requirements` của dự án. */
  projectRubric: SpecRubricRow[]
  /** 2–4 bẫy RIÊNG của chặng này ở hướng này. */
  pitfalls: string[]
  /** 3–5 dấu hiệu quan sát được là đã qua chặng. */
  exitSignals: string[]
  /** Một câu: xong chặng này thì chuẩn bị gì cho chặng sau. */
  nextStagePrep: string
}
