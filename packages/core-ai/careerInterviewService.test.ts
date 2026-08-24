import { beforeEach, describe, expect, it, vi } from 'vitest'

const generateChatText = vi.hoisted(() => vi.fn())
vi.mock('./chatFallback.js', () => ({ generateChatText }))

import { CareerInterviewService, type InterviewContext } from './careerInterviewService.js'

const CTX: InterviewContext = {
  targetRole: 'Kỹ sư dữ liệu',
  currentTitle: 'Lập trình viên backend',
  yearsOfExperience: 3,
  industry: 'Thương mại điện tử',
  skillsRequired: ['SQL', 'Airflow'],
}

beforeEach(() => vi.clearAllMocks())

describe('CareerInterviewService.generateQuestions', () => {
  it('sinh câu hỏi từ JSON model trả về, gắn id tuần tự', async () => {
    generateChatText.mockResolvedValueOnce(
      JSON.stringify({
        questions: [
          { question: 'Kể về một pipeline bạn đã xây?', focus: 'kinh nghiệm thực chiến' },
          { question: 'Bạn xử lý dữ liệu lệch thế nào?' },
        ],
      }),
    )
    const out = await CareerInterviewService.generateQuestions(CTX, 'technical', 2)
    expect(out).toEqual([
      { id: 'q1', question: 'Kể về một pipeline bạn đã xây?', focus: 'kinh nghiệm thực chiến' },
      { id: 'q2', question: 'Bạn xử lý dữ liệu lệch thế nào?' },
    ])
  })

  it('bóc được JSON bị model bọc trong rào ```json', async () => {
    generateChatText.mockResolvedValueOnce(
      'Đây nhé:\n```json\n{"questions":[{"question":"Câu hỏi A"}]}\n```\nChúc may mắn!',
    )
    const out = await CareerInterviewService.generateQuestions(CTX, 'behavioral', 1)
    expect(out?.[0]?.question).toBe('Câu hỏi A')
  })

  it('truyền hồ sơ THẬT vào prompt để câu hỏi bám đúng người', async () => {
    generateChatText.mockResolvedValueOnce('{"questions":[{"question":"x"}]}')
    await CareerInterviewService.generateQuestions(CTX, 'technical', 1)
    const { userMessage, mode } = generateChatText.mock.calls[0]![0]
    expect(userMessage).toContain('Kỹ sư dữ liệu')
    expect(userMessage).toContain('Thương mại điện tử')
    expect(userMessage).toContain('SQL')
    // Nhãn mode để tách chi phí AI trên dashboard admin.
    expect(mode).toBe('career-interview')
  })

  it('cấm hỏi thông tin nhân thân (tuổi, giới tính, hôn nhân…) ngay trong prompt hệ thống', async () => {
    generateChatText.mockResolvedValueOnce('{"questions":[{"question":"x"}]}')
    await CareerInterviewService.generateQuestions(CTX, 'behavioral', 1)
    const { system } = generateChatText.mock.calls[0]![0]
    expect(system).toContain('Không hỏi về tuổi, giới tính')
  })

  it('AI không chạy được hoặc trả rác → null (caller tự quyết dùng bộ dự phòng)', async () => {
    generateChatText.mockResolvedValueOnce(null)
    expect(await CareerInterviewService.generateQuestions(CTX, 'behavioral')).toBeNull()

    generateChatText.mockResolvedValueOnce('không phải JSON gì cả')
    expect(await CareerInterviewService.generateQuestions(CTX, 'behavioral')).toBeNull()

    generateChatText.mockResolvedValueOnce('{"questions":[]}')
    expect(await CareerInterviewService.generateQuestions(CTX, 'behavioral')).toBeNull()
  })
})

describe('CareerInterviewService.evaluateAnswer', () => {
  const good = {
    score: 7.5,
    strengths: ['Có số liệu cụ thể'],
    improvements: ['Nên nói rõ vai trò cá nhân'],
    sampleAnswer: 'Tôi đã…',
    bandSignal: 'B3',
  }

  it('chấm được câu trả lời và giữ nguyên điểm model đưa ra', async () => {
    generateChatText.mockResolvedValueOnce(JSON.stringify(good))
    const fb = await CareerInterviewService.evaluateAnswer({
      ctx: CTX,
      kind: 'behavioral',
      question: 'Kể về một dự án?',
      answer: 'Tôi từng xây pipeline giảm 40% độ trễ.',
    })
    expect(fb?.score).toBe(7.5)
    expect(fb?.bandSignal).toBe('B3')
    expect(fb?.isFallback).toBe(false)
  })

  it('cắt điểm về khoảng 0–10 khi model trả ngoài thang', async () => {
    generateChatText.mockResolvedValueOnce(JSON.stringify({ ...good, score: 99 }))
    expect(
      (
        await CareerInterviewService.evaluateAnswer({
          ctx: CTX,
          kind: 'behavioral',
          question: 'q',
          answer: 'a',
        })
      )?.score,
    ).toBe(10)

    generateChatText.mockResolvedValueOnce(JSON.stringify({ ...good, score: -5 }))
    expect(
      (
        await CareerInterviewService.evaluateAnswer({
          ctx: CTX,
          kind: 'behavioral',
          question: 'q',
          answer: 'a',
        })
      )?.score,
    ).toBe(0)
  })

  it('giới hạn tối đa 3 điểm mạnh / 3 điểm cải thiện (luật hành xử số 3)', async () => {
    generateChatText.mockResolvedValueOnce(
      JSON.stringify({
        ...good,
        strengths: ['a', 'b', 'c', 'd', 'e'],
        improvements: ['1', '2', '3', '4'],
      }),
    )
    const fb = await CareerInterviewService.evaluateAnswer({
      ctx: CTX,
      kind: 'behavioral',
      question: 'q',
      answer: 'a',
    })
    expect(fb?.strengths).toHaveLength(3)
    expect(fb?.improvements).toHaveLength(3)
  })

  it('chấp nhận bandSignal null khi chưa đủ căn cứ kết luận bậc', async () => {
    generateChatText.mockResolvedValueOnce(JSON.stringify({ ...good, bandSignal: null }))
    const fb = await CareerInterviewService.evaluateAnswer({
      ctx: CTX,
      kind: 'behavioral',
      question: 'q',
      answer: 'ừ',
    })
    expect(fb?.bandSignal).toBeNull()
  })

  it('bandSignal sai thang → coi như không chấm được, KHÔNG bịa bậc', async () => {
    generateChatText.mockResolvedValueOnce(JSON.stringify({ ...good, bandSignal: 'B9' }))
    expect(
      await CareerInterviewService.evaluateAnswer({
        ctx: CTX,
        kind: 'behavioral',
        question: 'q',
        answer: 'a',
      }),
    ).toBeNull()
  })

  it('AI không chạy được → null', async () => {
    generateChatText.mockResolvedValueOnce(null)
    expect(
      await CareerInterviewService.evaluateAnswer({
        ctx: CTX,
        kind: 'behavioral',
        question: 'q',
        answer: 'a',
      }),
    ).toBeNull()
  })
})

describe('nội dung dự phòng', () => {
  it('câu hỏi dự phòng vẫn ghép tên vị trí, đủ 3 câu cho mỗi chế độ', () => {
    for (const kind of ['behavioral', 'technical', 'situational'] as const) {
      const qs = CareerInterviewService.fallbackQuestions(CTX, kind)
      expect(qs).toHaveLength(3)
      expect(qs.some((q) => q.question.includes('Kỹ sư dữ liệu'))).toBe(true)
    }
  })

  it('nhận xét dự phòng KHÔNG bịa điểm đẹp — điểm 0, cờ isFallback, nói rõ chưa chấm được', () => {
    const fb = CareerInterviewService.fallbackFeedback()
    expect(fb.score).toBe(0)
    expect(fb.isFallback).toBe(true)
    expect(fb.strengths).toEqual([])
    expect(fb.improvements[0]).toContain('CHƯA được chấm')
    expect(fb.bandSignal).toBeNull()
  })
})
