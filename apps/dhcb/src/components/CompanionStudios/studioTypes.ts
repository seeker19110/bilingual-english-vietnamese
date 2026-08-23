import {
  Sparkles,
  GraduationCap,
  Briefcase,
  FolderKanban,
  Rocket,
  Heart,
  MessageSquare,
  Brain,
  Swords,
  Target,
  Compass,
} from 'lucide-react'
import type { ProposedAction } from '@dhcb/core-contracts/proposedAction'
import type { ContextPackage } from '@dhcb/core-contracts/contextPackage'

export type StudioTab = 'dialogue' | 'cognitive' | 'labs' | 'proactive' | 'synthesis'

export interface ChatMessage {
  id: string
  sender: 'user' | 'companion'
  text: string
  timestamp: string
  intent?: string
  domain?: string
  contextPackage?: ContextPackage
  proposedActions?: ProposedAction[]
}

export const DOMAIN_OPTIONS = [
  { id: 'all', label: 'Tự động', icon: Sparkles, color: 'text-amber-400 bg-amber-400/10' },
  { id: 'learning', label: 'Học tập', icon: GraduationCap, color: 'text-blue-400 bg-blue-400/10' },
  { id: 'career', label: 'Sự nghiệp', icon: Briefcase, color: 'text-purple-400 bg-purple-400/10' },
  {
    id: 'work',
    label: 'Công việc',
    icon: FolderKanban,
    color: 'text-emerald-400 bg-emerald-400/10',
  },
  { id: 'startup', label: 'Khởi nghiệp', icon: Rocket, color: 'text-orange-400 bg-orange-400/10' },
  { id: 'life', label: 'Đời sống', icon: Heart, color: 'text-pink-400 bg-pink-400/10' },
]

export const QUICK_PROMPTS = [
  {
    label: '🎯 Đặt mục tiêu IELTS 7.0',
    domain: 'learning',
    text: 'Tôi muốn đặt mục tiêu học IELTS đạt 7.0 trong 6 tháng tới.',
  },
  {
    label: '💼 Đánh giá khoảng cách kỹ năng',
    domain: 'career',
    text: 'Tôi muốn làm Data Analyst, hãy phân tích khoảng cách kỹ năng của tôi.',
  },
  {
    label: '🌱 Xây dựng thói quen đọc sách',
    domain: 'life',
    text: 'Hãy giúp tôi lên kế hoạch và duy trì thói quen đọc sách 20 phút mỗi tối.',
  },
  {
    label: '🚀 Khảo sát ý tưởng kinh doanh',
    domain: 'startup',
    text: 'Tôi có ý tưởng làm app giáo dục AI cho học sinh Việt Nam, cần kiểm chứng gì trước?',
  },
]

export const STUDIO_TABS_CONFIG = [
  { id: 'dialogue' as const, label: 'Đối thoại & Voice', icon: MessageSquare, badge: 'Live' },
  { id: 'cognitive' as const, label: 'Nhận thức & Ký ức', icon: Brain, badge: 'Socratic' },
  { id: 'labs' as const, label: 'Đấu trường & Labs', icon: Swords, badge: 'STEM' },
  { id: 'proactive' as const, label: 'Tự trị & Lộ trình', icon: Target, badge: 'Autopilot' },
  { id: 'synthesis' as const, label: 'Tổng hợp & Studio', icon: Compass, badge: 'V6' },
]
