// Nhãn + icon cho từng phần của bài trắc nghiệm (Từ vựng/Ngữ pháp/Nghe/Đọc hiểu) —
// dùng chung giữa CefrExam.tsx và ExamQuestionCard.tsx. Để riêng khỏi file
// component (react-refresh yêu cầu file component chỉ export component), giống
// cách làm của cefrAccent.ts.

import { BookOpen, Brain, Headphones, MessageSquareText } from 'lucide-react'
import type { ExamPart } from './cefrExam'

export const PART_META: Record<ExamPart, { icon: typeof BookOpen; vi: string; en: string }> = {
  vocab: { icon: BookOpen, vi: 'Từ vựng', en: 'Vocabulary' },
  grammar: { icon: Brain, vi: 'Ngữ pháp', en: 'Grammar' },
  listening: { icon: Headphones, vi: 'Nghe', en: 'Listening' },
  reading: { icon: MessageSquareText, vi: 'Đọc hiểu', en: 'Reading' },
}
