// learningPaths/diagnostic.ts — Chẩn đoán CHỌN ĐIỂM VÀO cho một lộ trình mục tiêu.
//
// Đặc tả: docs/specs/2026-08-31-khoa-hoc-ky-su-truong-ai.md (đợt 2). Hàm THUẦN, TẤT ĐỊNH —
// không I/O, không AI, không phụ thuộc thời gian: cùng bộ trả lời phải luôn ra cùng kết quả,
// vì lệch một milimet ở đây là chọn sai điểm vào cho người học.
//
// Luật số 1 của sản phẩm: đây là công cụ CHỌN VIỆC, không phải bảng chấm điểm. Không có "điểm
// số năng lực" nào tính ra ở đây — chỉ có MỘT gợi ý điểm vào + danh sách chặng đề xuất miễn,
// và người học được sửa tay đề xuất đó (UI đợt 2, không phải file này).
//
// Phạm vi thu hẹp so với mô tả gốc trong đặc tả ("5–7 câu hỏi + 2 bài code chấm bằng Sim"):
// đợt này dùng THUẦN trắc nghiệm (đủ 1 câu tín hiệu / giai đoạn P1–P4) để giữ phạm vi PR gọn —
// ghi rõ trong PR làm điểm lệch so với đặc tả. Chấm code bằng Sim thật để lại cho đợt sau nếu
// cần độ chính xác cao hơn; hàm `suggestEntry` không phụ thuộc NGUỒN câu hỏi nên mở rộng sau
// không phải viết lại logic suy điểm vào.
import type { LearningPath } from './types.js'

export interface DiagnosticAnswer {
  questionId: string
  correct: boolean
}

export interface DiagnosticQuestion {
  /** `<lộ trình>-dq<số>`, ví dụ 'principal-ai-dq1'. */
  id: string
  /** Giai đoạn (`PathPhase.id`) mà câu này là tín hiệu — KHÔNG phải id chặng. */
  phaseId: string
  prompt: string
  choices: string[]
  /** Chỉ số đáp án đúng trong `choices`. */
  answerIndex: number
}

export interface DiagnosticResult {
  /** stageId đề xuất bắt đầu — chặng đầu tiên của giai đoạn đầu tiên CHƯA vững. */
  entryStageId: string
  /** Các stageId đề xuất miễn — thuộc giai đoạn mà MỌI câu tín hiệu đều trả lời đúng. */
  skippedStageIds: string[]
}

export const PRINCIPAL_AI_DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: 'principal-ai-dq1',
    phaseId: 'principal-ai-p1',
    prompt: 'Độ phức tạp thời gian của tìm kiếm nhị phân trên mảng đã sắp xếp n phần tử là gì?',
    choices: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    answerIndex: 1,
  },
  {
    id: 'principal-ai-dq2',
    phaseId: 'principal-ai-p1',
    prompt: 'Gradient descent cập nhật tham số theo hướng nào để giảm hàm mất mát?',
    choices: [
      'Cùng chiều gradient',
      'Ngược chiều gradient',
      'Vuông góc với gradient',
      'Ngẫu nhiên, không liên quan gradient',
    ],
    answerIndex: 1,
  },
  {
    id: 'principal-ai-dq3',
    phaseId: 'principal-ai-p2',
    prompt: 'Câu SQL nào lấy đúng từng khách hàng kèm TỔNG số đơn hàng của họ?',
    choices: [
      'SELECT * FROM orders',
      'SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id',
      'SELECT customer_id FROM orders WHERE COUNT(*) > 1',
      'DELETE FROM orders GROUP BY customer_id',
    ],
    answerIndex: 1,
  },
  {
    id: 'principal-ai-dq4',
    phaseId: 'principal-ai-p2',
    prompt: 'API REST trả mã trạng thái nào khi client gửi dữ liệu sai định dạng?',
    choices: ['200', '401', '400', '500'],
    answerIndex: 2,
  },
  {
    id: 'principal-ai-dq5',
    phaseId: 'principal-ai-p3',
    prompt: 'RAG (Retrieval-Augmented Generation) giải quyết chủ yếu vấn đề gì của LLM?',
    choices: [
      'Tốc độ suy luận chậm',
      'Trả lời dựa trên tài liệu/kiến thức mà mô hình chưa được huấn luyện',
      'Chi phí GPU khi huấn luyện',
      'Giao diện người dùng',
    ],
    answerIndex: 1,
  },
  {
    id: 'principal-ai-dq6',
    phaseId: 'principal-ai-p4',
    prompt: 'Ranh giới module trong kiến trúc phần mềm quan trọng nhất vì lý do gì?',
    choices: [
      'Cho code trông gọn hơn',
      'Giới hạn tác động khi một phần thay đổi, để các phần khác không phải đổi theo',
      'Giúp chạy nhanh hơn',
      'Không có lý do kỹ thuật, chỉ là quy ước',
    ],
    answerIndex: 1,
  },
]

/**
 * Suy điểm vào từ bộ câu trả lời. Giai đoạn được coi là VỮNG khi người học trả lời ĐÚNG HẾT
 * mọi câu tín hiệu của giai đoạn đó (không trả lời = coi như chưa vững — bảo thủ có chủ đích:
 * đây là công cụ chọn việc, thà học lại một chặng đã biết còn hơn bỏ sót một chặng còn hổng).
 *
 * Đi từ giai đoạn đầu: giai đoạn vững VÀ có chặng thật thì miễn toàn bộ chặng của nó; giai đoạn
 * đầu tiên KHÔNG vững (hoặc đang soạn, `stages` rỗng) mà có chặng thật thì là điểm vào. Nếu đi
 * hết mà không tìm được điểm vào (mọi giai đoạn có chặng đều vững) thì lùi về chặng CUỐI của
 * giai đoạn có chặng gần nhất — ví dụ P5 đang soạn thì lùi về chặng cuối P4.
 */
export function suggestEntry(
  path: LearningPath,
  answers: DiagnosticAnswer[],
  questions: DiagnosticQuestion[] = PRINCIPAL_AI_DIAGNOSTIC,
): DiagnosticResult {
  const byPhase = new Map<string, boolean[]>()
  for (const q of questions) {
    const a = answers.find((x) => x.questionId === q.id)
    if (!a) continue
    const arr = byPhase.get(q.phaseId) ?? []
    arr.push(a.correct)
    byPhase.set(q.phaseId, arr)
  }

  const skippedStageIds: string[] = []
  let entryStageId: string | undefined

  for (const phase of path.phases) {
    if (phase.stages.length === 0) continue // đang soạn — không có gì để miễn hay vào
    const results = byPhase.get(phase.id) ?? []
    const vung = results.length > 0 && results.every(Boolean)
    if (vung) {
      skippedStageIds.push(...phase.stages.map((s) => s.stageId))
      continue
    }
    entryStageId = phase.stages[0]!.stageId
    break
  }

  if (!entryStageId) {
    const lastWithStages = [...path.phases].reverse().find((p) => p.stages.length > 0)
    entryStageId = lastWithStages?.stages.at(-1)?.stageId
  }

  // path luôn có ít nhất một giai đoạn có chặng thật (canh bởi learningPaths.test.ts) nên đây
  // không bao giờ undefined trong dữ liệu thật — vẫn xử lý tường minh thay vì `!` để tránh vỡ
  // âm thầm nếu một lộ trình tương lai vi phạm giả định đó.
  if (!entryStageId) {
    throw new Error(`Lộ trình "${path.id}" không có chặng nào để đề xuất điểm vào`)
  }

  return { entryStageId, skippedStageIds }
}
