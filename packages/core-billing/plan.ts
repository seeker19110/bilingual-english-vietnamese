// api/_lib/plan.ts — chuẩn hóa giá trị cột profiles.plan (text tự do, không CHECK constraint)
// thành 1 trong 3 gói hợp lệ. Dùng ở MỌI nơi đọc plan từ DB để tránh mỗi chỗ tự viết
export type Plan = 'free' | 'plus' | 'pro' | 'vip'

export function normalizePlan(value: string | null | undefined): Plan {
  if (value === 'plus' || value === 'pro' || value === 'vip') return value
  return 'free'
}

// Gói THỰC SỰ có hiệu lực ngay lúc đọc — nếu Pro/VIP đã quá `planExpiresAt` thì coi như
// hết hạn (Free), bất kể job dọn dữ liệu (api/_lib/planExpiry.ts) đã chạy hay chưa. Free
// không bao giờ hết hạn nên bỏ qua `planExpiresAt` (kể cả nếu cột còn giá trị cũ sót lại).
export function resolvePlan(
  rawPlan: string | null | undefined,
  planExpiresAt: Date | string | null | undefined,
  now: Date = new Date(),
): Plan {
  const plan = normalizePlan(rawPlan)
  if (plan === 'free' || !planExpiresAt) return plan
  // Hết hạn = còn hiệu lực khi now < planExpiresAt (đúng lúc planExpiresAt trở đi đã hết hạn).
  return new Date(planExpiresAt).getTime() <= now.getTime() ? 'free' : plan
}
