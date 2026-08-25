// Logic gom câu trả lời của thẻ câu hỏi tick chọn. Tách khỏi InteractiveQuestionCard.tsx để file
// component chỉ export component (luật react-refresh) và để test trực tiếp hàm thuần này.
import type { InteractiveQuestion } from '@dhcb/core-contracts/interactiveQuestion'

/** Bảng chọn: khoá là id câu hỏi, giá trị là tập id lựa chọn đã tick. */
export type SelectionMap = Record<string, string[]>

/**
 * Gom lựa chọn đã tick + ô "Khác…" thành MỘT tin nhắn tiếng Việt dễ đọc, mỗi câu một dòng
 * ("Câu hỏi → đáp án A, đáp án B"). Câu chưa trả lời bị bỏ qua hoàn toàn — không gửi dòng rỗng
 * làm AI tưởng người dùng từ chối trả lời.
 */
export function buildAnswerText(
  questions: InteractiveQuestion[],
  selections: SelectionMap,
  freeTexts: Record<string, string>,
): string {
  return questions
    .map((question) => {
      const chosenLabels = (selections[question.id] ?? [])
        .map((optionId) => question.options.find((o) => o.id === optionId)?.label)
        .filter((label): label is string => Boolean(label))
      const extra = (freeTexts[question.id] ?? '').trim()
      const answers = extra ? [...chosenLabels, extra] : chosenLabels
      return answers.length > 0 ? `${question.text} → ${answers.join(', ')}` : ''
    })
    .filter(Boolean)
    .join('\n')
}
