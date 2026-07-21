// api/_lib/plan.ts — chuẩn hóa giá trị cột profiles.plan (text tự do, không CHECK constraint)
// thành 1 trong 3 gói hợp lệ. Dùng ở MỌI nơi đọc plan từ DB để tránh mỗi chỗ tự viết
// `=== 'pro' ? 'pro' : 'free'` (dễ quên 'vip' → âm thầm hạ cấp user VIP xuống free).
export type Plan = 'free' | 'pro' | 'vip'

export function normalizePlan(value: string | null | undefined): Plan {
  if (value === 'pro' || value === 'vip') return value
  return 'free'
}
