// api/stem-scratchpad.ts — REST handler cho Platform V5 STEM Interactive Scratchpad.
import { jsonResponse } from './_lib/http.js'
import { validateAuth, getCorsHeaders } from '../packages/core-auth/security.js'
import { StemScratchpadService } from '../packages/core-ai/stemScratchpadService.js'
import { StemProblemState, StemSubjectType } from '../packages/core-contracts/stemScratchpad.js'
import { filterStemQuestions, getStemQuestionById } from '../packages/core-ai/stemQuestionBank.js'
import type { StemQuestion } from '../packages/core-ai/stemQuestionBank.js'

// In-memory cache cho các bài tập STEM đang làm dở
const activeProblems = new Map<string, StemProblemState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      { error: 'Unauthorized', message: 'Yêu cầu đăng nhập để sử dụng STEM Scratchpad.' },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (req.method === 'GET') {
    const problemId = url.searchParams.get('problemId')
    if (problemId) {
      const prob = activeProblems.get(problemId)
      if (!prob) {
        return jsonResponse({ error: 'Problem not found' }, 404)
      }
      return jsonResponse({ success: true, problem: prob }, 200)
    }

    // Lọc ngân hàng câu hỏi nâng cao
    if (action === 'get_questions') {
      const subject = url.searchParams.get('subject') as StemQuestion['subject'] | null
      const gradeStr = url.searchParams.get('grade')
      const difficulty = url.searchParams.get('difficulty') as StemQuestion['difficulty'] | null
      const limitStr = url.searchParams.get('limit')

      const questions = filterStemQuestions({
        subject: subject ?? undefined,
        grade: gradeStr ? (parseInt(gradeStr) as 10 | 11 | 12) : undefined,
        difficulty: difficulty ?? undefined,
        limit: limitStr ? parseInt(limitStr) : 20,
      })
      return jsonResponse({ success: true, questions, total: questions.length }, 200)
    }

    // Trả về danh sách bài tập STEM mẫu
    const sampleProblems = [
      {
        id: 'math-linear-1',
        subject: 'math' as StemSubjectType,
        title: 'Phương trình bậc nhất 1 ẩn',
        problemStatement: 'Giải phương trình: 2x + 5 = 15',
        problemLatex: '2x + 5 = 15',
      },
      {
        id: 'chem-redox-1',
        subject: 'chemistry' as StemSubjectType,
        title: 'Cân bằng phản ứng Oxy hóa - Khử',
        problemStatement: 'Cân bằng phản ứng tạo nước từ Hydro và Oxi:',
        problemLatex: 'H_2 + O_2 \\rightarrow H_2O',
      },
      {
        id: 'phys-motion-1',
        subject: 'physics' as StemSubjectType,
        title: 'Phương trình chuyển động thẳng đều',
        problemStatement:
          'Một vật chuyển động từ trạng thái nghỉ với gia tốc a = 2m/s². Tính vận tốc v sau t = 5s:',
        problemLatex: 'v = v_0 + a \\cdot t',
      },
    ]

    return jsonResponse({ success: true, problems: sampleProblems }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'create_problem') {
        const { subject, title, problemStatement, problemLatex } = body
        if (!subject || !title || !problemStatement) {
          return jsonResponse({ error: 'Missing required problem fields' }, 400)
        }

        const prob = StemScratchpadService.createProblemSession({
          personId,
          subject,
          title,
          problemStatement,
          problemLatex,
        })
        activeProblems.set(prob.id, prob)
        return jsonResponse({ success: true, problem: prob }, 200)
      }

      if (action === 'validate_step') {
        const { problemId, latexInput, explanation } = body
        if (!latexInput) {
          return jsonResponse({ error: 'Missing latexInput' }, 400)
        }

        let prob = problemId ? activeProblems.get(problemId) : undefined
        if (!prob) {
          prob = StemScratchpadService.createProblemSession({
            personId,
            subject: 'math',
            title: 'Bài tập STEM',
            problemStatement: 'Giải phương trình',
            problemLatex: latexInput,
          })
          if (problemId) prob.id = problemId
          activeProblems.set(prob.id, prob)
        }

        const validation = StemScratchpadService.validateStep(prob.subject, latexInput, prob.steps)

        const newStep = {
          stepNumber: prob.steps.length + 1,
          latexInput,
          explanation,
          validation,
          createdAt: new Date().toISOString(),
        }
        prob.steps.push(newStep)

        if (
          validation.isValid &&
          (latexInput.includes('x = 5') ||
            latexInput.includes('v = 10') ||
            latexInput.includes('2H_2O'))
        ) {
          prob.isSolved = true
        }

        prob.updatedAt = new Date().toISOString()
        activeProblems.set(prob.id, prob)

        return jsonResponse(
          {
            success: true,
            step: newStep,
            validation,
            isSolved: prob.isSolved,
            problem: prob,
          },
          200,
        )
      }

      if (action === 'get_hint') {
        const { problemId } = body
        const prob = activeProblems.get(problemId)
        if (!prob) {
          return jsonResponse({ error: 'Problem not found' }, 404)
        }

        prob.hintsUsed += 1
        const hint = StemScratchpadService.generateMicroHint(prob)
        return jsonResponse({ success: true, hint, hintsUsed: prob.hintsUsed }, 200)
      }

      if (action === 'submit_solution') {
        const { problemId, finalAnswer } = body
        const prob = activeProblems.get(problemId)
        if (!prob) {
          return jsonResponse({ error: 'Problem not found' }, 404)
        }
        // Kiểm tra bài giải dựa vào câu từ question bank
        const question = getStemQuestionById(problemId)
        const isCorrect =
          prob.isSolved || (question && finalAnswer?.includes(question.solutionLatex?.slice(0, 10)))
        prob.isSolved = !!isCorrect
        prob.updatedAt = new Date().toISOString()
        activeProblems.set(prob.id, prob)
        return jsonResponse(
          {
            success: true,
            isSolved: prob.isSolved,
            solutionPreview: question?.solutionLatex?.slice(0, 100),
          },
          200,
        )
      }

      return jsonResponse({ error: 'Invalid action parameter' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
