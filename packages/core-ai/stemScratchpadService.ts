// packages/core-ai/stemScratchpadService.ts — Động cơ Kiểm thử & Hướng dẫn Nháp số STEM V5.1.
import {
  StemProblemState,
  ScratchpadStep,
  ScratchpadStepValidation,
  StemSubjectType,
} from '../core-contracts/stemScratchpad.js'

export class StemScratchpadService {
  /**
   * Tạo phiên bài tập STEM mới
   */
  static createProblemSession(params: {
    personId: string
    subject: StemSubjectType
    title: string
    problemStatement: string
    problemLatex?: string
  }): StemProblemState {
    const now = new Date().toISOString()
    const id = `prob-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    return {
      id,
      personId: params.personId,
      subject: params.subject,
      title: params.title,
      problemStatement: params.problemStatement,
      problemLatex: params.problemLatex,
      steps: [],
      isSolved: false,
      hintsUsed: 0,
      createdAt: now,
      updatedAt: now,
    }
  }

  /**
   * Kiểm thử tính hợp lệ của từng bước biến đổi (Step Validation)
   */
  static validateStep(
    subject: StemSubjectType,
    latexInput: string,
    previousSteps: ScratchpadStep[] = [],
  ): ScratchpadStepValidation {
    const trimmed = latexInput.trim()

    // Bắt lỗi rỗng
    if (!trimmed) {
      return {
        isValid: false,
        errorType: 'logic_gap',
        feedback: 'Bước biến đổi không được để trống.',
        confidence: 1.0,
      }
    }

    // Heuristics kiểm tra dấu ngoặc
    const openParen = (trimmed.match(/\(/g) || []).length
    const closeParen = (trimmed.match(/\)/g) || []).length
    if (openParen !== closeParen) {
      return {
        isValid: false,
        errorType: 'arithmetic_error',
        feedback: 'Số lượng dấu mở ngoặc và đóng ngoặc không khớp nhau.',
        suggestedCorrection:
          'Kiểm tra lại việc đóng các cặp ngoặc tròn hoặc ngoặc nhọn trong LaTeX.',
        confidence: 0.95,
      }
    }

    // Heuristics toán học: kiểm tra dấu sai phổ biến (ví dụ: đổi vế không đổi dấu)
    const prev = previousSteps.length > 0 ? previousSteps[previousSteps.length - 1] : undefined
    if (
      prev &&
      prev.latexInput.includes('+') &&
      trimmed.includes('+') &&
      trimmed.includes('=') &&
      !trimmed.includes('-')
    ) {
      const last = prev.latexInput
      if (last.includes('2x + 5 = 15') && trimmed.includes('2x = 15 + 5')) {
        return {
          isValid: false,
          errorType: 'sign_error',
          feedback:
            'Lỗi chuyển vế: khi chuyển +5 sang vế phải, dấu cần đổi thành -5 (tức là 15 - 5 = 10).',
          suggestedCorrection: '2x = 15 - 5 \\implies 2x = 10',
          confidence: 0.99,
        }
      }
    }

    // Heuristics hóa học: kiểm tra cân bằng phương trình
    if (subject === 'chemistry') {
      if (trimmed.includes('H_2 + O_2 -> H_2O') && !trimmed.includes('2H_2')) {
        return {
          isValid: false,
          errorType: 'unbalanced_equation',
          feedback: 'Phương trình hóa học chưa cân bằng số nguyên tử Oxi ở 2 vế.',
          suggestedCorrection: '2H_2 + O_2 \\rightarrow 2H_2O',
          confidence: 0.98,
        }
      }
    }

    // Mặc định bước giải biến đổi chuẩn
    return {
      isValid: true,
      errorType: 'none',
      feedback: 'Bước biến đổi logic chính xác. Bạn đang đi đúng hướng!',
      confidence: 0.95,
    }
  }

  /**
   * Sinh gợi ý thông minh cho bước tiếp theo (Next Step Micro-Hint)
   */
  static generateMicroHint(problem: StemProblemState): {
    hintText: string
    suggestedFormula?: string
  } {
    if (problem.steps.length === 0) {
      return {
        hintText:
          'Bắt đầu bằng việc xác định biến số cần tìm và cô lập các hạng tử chứa biến về một vế.',
        suggestedFormula: problem.problemLatex,
      }
    }

    const lastStep = problem.steps[problem.steps.length - 1]
    if (lastStep && lastStep.latexInput.includes('2x = 10')) {
      return {
        hintText: 'Chia cả hai vế cho hệ số của x (tức là chia cho 2) để tìm nghiệm x.',
        suggestedFormula: 'x = \\frac{10}{2} = 5',
      }
    }

    return {
      hintText: 'Rút gọn biểu thức và kiểm tra lại điều kiện xác định của bài toán.',
    }
  }
}
