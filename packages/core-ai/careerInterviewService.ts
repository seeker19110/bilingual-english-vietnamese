// packages/core-ai/careerInterviewService.ts — Động cơ Phòng Luyện Phỏng Vấn (trụ CAREER).
//
// [2026-08-24, Đợt 2 "Một mũi nhọn thật"] Thay bản GIẢ HOÀN TOÀN ở `CareerInterview.tsx`:
// trước đây trang này có 3 câu hỏi CỨNG, `setTimeout(700)` giả vờ đang phân tích, rồi trả
// **điểm 8.5 cứng** cùng bộ nhận xét y hệt cho MỌI câu trả lời của MỌI người — gõ "abc" cũng
// được khen "cấu trúc rõ ràng theo mô hình STAR". Cùng loại lỗi với "Live Voice giả lập" đã
// gỡ ở PR #650.
//
// Nay: câu hỏi sinh theo hồ sơ nghề nghiệp THẬT của người dùng, câu trả lời được model THẬT
// chấm. Khi không provider nào chạy được thì vẫn có nội dung dự phòng, nhưng gắn cờ
// `isFallback` để giao diện NÓI THẬT thay vì để người học tưởng AI vừa chấm.
//
// Giọng và ranh giới bám 8 luật hành xử của Companion
// (docs/research/dong-hanh-va-phat-trien-nang-khieu-2026-08-23.md mục 2) — đáng chú ý:
//   · luật 3 "mỗi lúc chỉ 3 việc"  → tối đa 3 điểm mạnh, 3 điểm cần cải thiện,
//   · luật 6 "nói thật kể cả điều khó nghe, nhưng luôn kèm đường đi tiếp",
//   · luật 4 "so với chính họ, không so người khác",
//   · luật 7 "biết giới hạn" → không phán xét con người, chỉ nhận xét câu trả lời.

import { generateChatText } from './chatFallback.js'
import {
  InterviewFeedbackSchema,
  PROFICIENCY_BAND_LABELS,
  type InterviewFeedback,
  type InterviewKind,
  type InterviewQuestion,
  type ProficiencyBand,
} from '@dhcb/core-contracts/careerInterview'

// Bối cảnh nghề nghiệp dùng để cá nhân hoá câu hỏi. Mọi trường đều không bắt buộc — người dùng
// mới chưa khai hồ sơ vẫn luyện được.
export interface InterviewContext {
  targetRole: string
  currentTitle?: string
  yearsOfExperience?: number
  industry?: string
  /** Kỹ năng mục tiêu nghề nghiệp đang nhắm tới (từ CareerGoal), để hỏi trúng chỗ. */
  skillsRequired?: string[]
}

const KIND_BRIEF: Record<InterviewKind, string> = {
  behavioral:
    'phỏng vấn HÀNH VI: hỏi về việc đã làm thật trong quá khứ, mong đợi câu trả lời theo cấu trúc STAR (Tình huống — Nhiệm vụ — Hành động — Kết quả)',
  technical:
    'phỏng vấn CHUYÊN MÔN: hỏi kiến thức và cách xử lý bài toán nghiệp vụ của đúng vị trí này',
  situational:
    'phỏng vấn TÌNH HUỐNG: đưa ra tình huống giả định chưa xảy ra và hỏi ứng viên sẽ xử lý thế nào',
}

const MAX_QUESTIONS = 5

function contextBlock(ctx: InterviewContext): string {
  const lines = [`Vị trí ứng tuyển: ${ctx.targetRole}`]
  if (ctx.currentTitle) lines.push(`Vị trí hiện tại: ${ctx.currentTitle}`)
  if (typeof ctx.yearsOfExperience === 'number')
    lines.push(`Số năm đi làm: ${ctx.yearsOfExperience}`)
  if (ctx.industry) lines.push(`Ngành: ${ctx.industry}`)
  if (ctx.skillsRequired?.length)
    lines.push(`Kỹ năng vị trí đòi hỏi: ${ctx.skillsRequired.slice(0, 10).join(', ')}`)
  return lines.join('\n')
}

// Cắt rào JSON mà model hay bọc quanh (```json … ```), rồi lấy khối { … } ngoài cùng.
function extractJson(raw: string): string | null {
  const noFence = raw.replace(/```(?:json)?/gi, '').trim()
  const start = noFence.indexOf('{')
  const end = noFence.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return noFence.slice(start, end + 1)
}

export class CareerInterviewService {
  /**
   * Sinh bộ câu hỏi phỏng vấn bám đúng vị trí và hồ sơ người dùng.
   * Trả `null` khi không provider nào dùng được — caller quyết định dùng bộ dự phòng.
   */
  static async generateQuestions(
    ctx: InterviewContext,
    kind: InterviewKind,
    count = 3,
  ): Promise<InterviewQuestion[] | null> {
    const n = Math.min(Math.max(1, count), MAX_QUESTIONS)
    const system = [
      'Bạn là chuyên gia tuyển dụng người Việt, phỏng vấn ứng viên bằng TIẾNG VIỆT.',
      `Đây là ${KIND_BRIEF[kind]}.`,
      'Câu hỏi phải bám đúng vị trí và hồ sơ được cung cấp — KHÔNG hỏi chung chung kiểu mẫu.',
      'Không hỏi về tuổi, giới tính, tình trạng hôn nhân, con cái, tôn giáo hay quê quán.',
      `Trả về DUY NHẤT một khối JSON: {"questions":[{"question":"...","focus":"..."}]} với đúng ${n} câu.`,
      '"focus" nói ngắn gọn câu đó soi năng lực gì (tối đa 12 từ).',
    ].join(' ')

    const raw = await generateChatText({
      system,
      userMessage: `Hồ sơ ứng viên:\n${contextBlock(ctx)}\n\nSinh ${n} câu hỏi phỏng vấn.`,
      maxTokens: 800,
      mode: 'career-interview',
    })
    if (!raw) return null

    const json = extractJson(raw)
    if (!json) return null
    try {
      const parsed = JSON.parse(json) as {
        questions?: Array<{ question?: string; focus?: string }>
      }
      const list = (parsed.questions ?? [])
        .filter((q): q is { question: string; focus?: string } => Boolean(q.question?.trim()))
        .slice(0, n)
        .map((q, i) => ({
          id: `q${i + 1}`,
          question: q.question.trim().slice(0, 1000),
          ...(q.focus?.trim() ? { focus: q.focus.trim().slice(0, 200) } : {}),
        }))
      return list.length > 0 ? list : null
    } catch {
      return null
    }
  }

  /**
   * Chấm MỘT câu trả lời bằng model thật.
   * Trả `null` khi không provider nào dùng được — caller gắn cờ fallback và HOÀN lượt đã trừ.
   */
  static async evaluateAnswer(params: {
    ctx: InterviewContext
    kind: InterviewKind
    question: string
    answer: string
  }): Promise<InterviewFeedback | null> {
    const { ctx, kind, question, answer } = params
    const bandTable = (Object.keys(PROFICIENCY_BAND_LABELS) as ProficiencyBand[])
      .map((b) => `${b}=${PROFICIENCY_BAND_LABELS[b]}`)
      .join(', ')

    const system = [
      'Bạn là chuyên gia tuyển dụng người Việt, nhận xét câu trả lời phỏng vấn bằng TIẾNG VIỆT.',
      `Đây là ${KIND_BRIEF[kind]}.`,
      'Nguyên tắc bắt buộc:',
      '(1) Nhận xét CÂU TRẢ LỜI, tuyệt đối không phán xét con người.',
      '(2) Nói thật kể cả điều khó nghe, nhưng mỗi điểm yếu phải kèm cách sửa cụ thể.',
      '(3) Tối đa 3 điểm mạnh và tối đa 3 điểm cần cải thiện — không liệt kê dài hơn.',
      '(4) So sánh với yêu cầu của vị trí, KHÔNG so sánh với ứng viên khác.',
      '(5) Câu trả lời sơ sài, lạc đề hoặc vô nghĩa thì phải cho điểm THẤP và nói rõ vì sao.',
      `Chấm điểm 0–10 (một chữ số thập phân) và ước lượng bậc năng lực theo thang: ${bandTable}.`,
      'Nếu câu trả lời quá ngắn để kết luận bậc thì đặt "bandSignal": null.',
      'Trả về DUY NHẤT khối JSON:',
      '{"score":number,"strengths":[string],"improvements":[string],"sampleAnswer":string,"bandSignal":"B1"|"B2"|"B3"|"B4"|"B5"|null}',
      '"sampleAnswer" là một câu trả lời mẫu tốt cho chính câu hỏi này, viết ở ngôi thứ nhất.',
    ].join(' ')

    const raw = await generateChatText({
      system,
      userMessage: [
        `Hồ sơ ứng viên:\n${contextBlock(ctx)}`,
        `\nCâu hỏi: ${question}`,
        `\nCâu trả lời của ứng viên:\n${answer}`,
      ].join('\n'),
      maxTokens: 1200,
      mode: 'career-interview',
    })
    if (!raw) return null

    const json = extractJson(raw)
    if (!json) return null
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>
      const result = InterviewFeedbackSchema.safeParse({
        score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 0,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 3) : [],
        sampleAnswer: typeof parsed.sampleAnswer === 'string' ? parsed.sampleAnswer : '',
        bandSignal: parsed.bandSignal ?? null,
        isFallback: false,
      })
      return result.success ? result.data : null
    } catch {
      return null
    }
  }

  /**
   * Bộ câu hỏi dự phòng khi AI không chạy được. Vẫn ghép tên vị trí vào để không lạc đề hoàn
   * toàn, nhưng caller PHẢI cho người dùng biết đây là bộ mặc định, không phải AI soạn riêng.
   */
  static fallbackQuestions(ctx: InterviewContext, kind: InterviewKind): InterviewQuestion[] {
    const role = ctx.targetRole || 'vị trí bạn đang nhắm tới'
    const byKind: Record<InterviewKind, string[]> = {
      behavioral: [
        `Hãy kể về một việc bạn đã làm và tự hào nhất, liên quan tới ${role}. Bạn đã làm gì và kết quả đo được ra sao?`,
        'Hãy kể một lần bạn bất đồng với đồng nghiệp hoặc gặp bế tắc. Bạn đã xử lý thế nào và rút ra điều gì?',
        `Vì sao bạn muốn làm ${role}, và trong 2 năm tới bạn muốn giỏi thêm điều gì?`,
      ],
      technical: [
        `Với vị trí ${role}, đâu là phần chuyên môn bạn tự tin nhất? Hãy giải thích như đang nói với người mới.`,
        `Hãy mô tả một bài toán khó về chuyên môn bạn từng gặp khi làm ${role} và cách bạn giải quyết.`,
        'Khi gặp một vấn đề bạn chưa từng biết cách giải, quy trình tìm hiểu của bạn là gì?',
      ],
      situational: [
        `Giả sử tuần đầu nhận việc ${role}, bạn phát hiện cách làm hiện tại của nhóm có vấn đề. Bạn xử lý thế nào?`,
        'Bạn được giao hai việc gấp cùng hạn chót và không thể làm cả hai. Bạn quyết định ra sao?',
        'Nếu bạn mắc một lỗi gây ảnh hưởng tới người dùng thật, bạn sẽ làm gì đầu tiên?',
      ],
    }
    return byKind[kind].map((question, i) => ({ id: `q${i + 1}`, question }))
  }

  /**
   * Nhận xét dự phòng khi AI không chấm được. KHÔNG bịa điểm số đẹp — trả về điểm 0 và nói
   * thẳng là chưa chấm được, đúng bài học "không bao giờ đưa nội dung mẫu ra như thể AI vừa nghĩ".
   */
  static fallbackFeedback(): InterviewFeedback {
    return {
      score: 0,
      strengths: [],
      improvements: [
        'Hiện chưa kết nối được trợ lý AI nên câu trả lời của bạn CHƯA được chấm. Hãy thử lại sau ít phút — câu trả lời bạn vừa viết vẫn được giữ nguyên.',
      ],
      sampleAnswer: '',
      bandSignal: null,
      isFallback: true,
    }
  }
}
