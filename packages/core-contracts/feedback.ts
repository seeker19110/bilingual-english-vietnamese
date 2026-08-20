// packages/core-contracts/feedback.ts — Hợp đồng Dữ liệu Ý kiến Đóng góp & Phản hồi Người dùng.
import { z } from 'zod'

export type UserFeedbackCategory = 'bug' | 'feature' | 'content' | 'ui_ux' | 'other'
export type UserFeedbackStatus = 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'

export const FeedbackCategorySchema = z.enum(['bug', 'feature', 'content', 'ui_ux', 'other'])
export const FeedbackStatusSchema = z.enum(['new', 'reviewed', 'in_progress', 'resolved', 'closed'])

export const CreateFeedbackSchema = z.object({
  category: FeedbackCategorySchema,
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(200).optional(),
  message: z.string().trim().min(3, 'Nội dung góp ý tối thiểu 3 ký tự').max(10_000),
  contactEmail: z.string().trim().toLowerCase().email('Email không hợp lệ').optional(),
  contextInfo: z
    .object({
      currentUrl: z.string().max(2000).optional(),
      route: z.string().max(200).optional(),
      userAgent: z.string().max(1000).optional(),
      screenResolution: z.string().max(50).optional(),
      appVersion: z.string().max(50).optional(),
    })
    .optional(),
})

export type CreateFeedbackInput = z.infer<typeof CreateFeedbackSchema>

export interface UserFeedbackRecord {
  id: string
  userId: string | null
  userEmail?: string | null
  category: UserFeedbackCategory
  rating: number | null
  title: string | null
  message: string
  contactEmail: string | null
  contextInfo: Record<string, unknown>
  status: UserFeedbackStatus
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export const CATEGORY_METADATA: Record<
  UserFeedbackCategory,
  { labelVi: string; labelEn: string; icon: string; color: string }
> = {
  bug: {
    labelVi: 'Báo lỗi kỹ thuật',
    labelEn: 'Bug Report',
    icon: '🐛',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  feature: {
    labelVi: 'Đề xuất tính năng mới',
    labelEn: 'Feature Suggestion',
    icon: '💡',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  content: {
    labelVi: 'Góp ý nội dung học',
    labelEn: 'Content Feedback',
    icon: '📚',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  ui_ux: {
    labelVi: 'Giao diện & Trải nghiệm',
    labelEn: 'UI/UX Experience',
    icon: '🎨',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  other: {
    labelVi: 'Ý kiến khác',
    labelEn: 'General Feedback',
    icon: '💬',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
}
