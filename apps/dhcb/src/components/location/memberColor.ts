// apps/dhcb/src/components/location/memberColor.ts — Màu định danh cho từng người trong chuyến.
//
// Vì sao cần: bản đồ và danh sách là HAI cách nhìn cùng một nhóm người. Nếu chấm trên bản đồ
// không có gì nối với dòng trong danh sách thì người dùng phải đọc tên trên từng chấm mới biết
// ai là ai — rất chậm khi đang vừa đi vừa nhìn. Gán mỗi người một màu CỐ ĐỊNH rồi dùng chung
// cho cả chấm bản đồ lẫn avatar trong danh sách là nối được hai cách nhìn chỉ bằng mắt.
//
// Màu cố định (không theo theme) là CỐ Ý: đây là màu định danh, giống màu áo — đổi theo theme
// thì mất luôn ý nghĩa "chấm vàng là Lan". Bù lại, mọi màu ở đây đều đã đo tương phản với chữ
// mực tối MEMBER_INK ≥ 7:1 nên chữ trên nền màu luôn đọc được ở mọi theme.

/** Mực chữ dùng TRÊN nền màu định danh — tương phản 7,3:1 → 13,2:1 với cả 8 màu dưới đây. */
export const MEMBER_INK = '#09090b'

const PALETTE = [
  '#34d399', // xanh ngọc
  '#60a5fa', // xanh dương
  '#fbbf24', // vàng
  '#f472b6', // hồng
  '#a78bfa', // tím
  '#22d3ee', // xanh lơ
  '#fb923c', // cam
  '#a3e635', // xanh lá mạ
] as const

/**
 * Màu của một người — suy ra từ userId nên KHÔNG đổi giữa các lần tải trang, và mọi người
 * trong chuyến đều thấy cùng một màu cho cùng một người (cùng userId → cùng màu).
 */
export function memberColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    // Băm chuỗi kiểu djb2 rút gọn — chỉ cần trải đều, không cần chống va chạm.
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]!
}

/** Chữ cái đầu hiển thị trong avatar/chấm bản đồ. */
export function memberInitial(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase()
}
