// ──────────────────────────────────────────────────────────────────────
// GỢI Ý "CÁCH KIẾM HUY HIỆU & THƯỞNG HIỆU QUẢ" — banner tự hiện 1 LẦN rồi tự
// ẩn (khác comeback.ts là tắt lại mỗi ngày): đây là mẹo one-off, không phải
// nhắc nhở lặp lại, nên nhớ "đã xem" VĨNH VIỄN theo từng user — không hiện
// lại nữa dù đóng bằng tay hay để tự động ẩn sau vài giây.
// ──────────────────────────────────────────────────────────────────────

const SEEN_KEY = (uid: string) => `et_reward_tip_seen_${uid}`

export function hasSeenRewardTip(uid: string): boolean {
  try {
    return localStorage.getItem(SEEN_KEY(uid)) === '1'
  } catch {
    return true // không đọc được localStorage thì thà ẩn còn hơn phiền người dùng
  }
}

export function dismissRewardTip(uid: string): void {
  try {
    localStorage.setItem(SEEN_KEY(uid), '1')
  } catch {
    /* hết dung lượng — bỏ qua, chỉ ảnh hưởng việc banner có hiện lại lần sau không */
  }
}

export function shouldShowRewardTip(uid: string): boolean {
  return !!uid && !hasSeenRewardTip(uid)
}
