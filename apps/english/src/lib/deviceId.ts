// src/lib/deviceId.ts — Dấu vân tay thiết bị BEST-EFFORT, dùng DUY NHẤT cho việc chống cày
// thưởng mời bạn (1 người tạo hàng loạt tài khoản trên cùng máy để tự thưởng cho mình).
//
// ⚠️ GIỚI HẠN PHẢI BIẾT TRƯỚC KHI TIN VÀO GIÁ TRỊ NÀY:
// Trình duyệt KHÔNG có API nào trả về mã phần cứng cố định. Đây chỉ là chuỗi đặc trưng suy ra
// từ vài thuộc tính môi trường + 1 UUID lưu trong localStorage. Nghĩa là:
//   • Xoá dữ liệu duyệt web / dùng cửa sổ ẩn danh / đổi trình duyệt → RA MÃ KHÁC.
//   • Hai máy cùng cấu hình, cùng hệ điều hành có thể RA MÃ GIỐNG NHAU (đụng độ).
// Vì vậy mã này CHỈ được dùng để TỪ CHỐI THƯỞNG, TUYỆT ĐỐI không dùng để chặn đăng ký hay
// khoá tài khoản — xem chú thích ở api/_lib/referral.ts.
//
// Riêng tư: không thu thập thông tin định danh cá nhân (không tên, email, vị trí, danh bạ);
// chỉ băm vài thuộc tính kỹ thuật của trình duyệt thành 1 chuỗi vô nghĩa với bên thứ ba.

const DEVICE_ID_KEY = 'device_fp_id'

// UUID ngẫu nhiên gắn với trình duyệt này, sinh 1 lần rồi giữ nguyên. Đây là phần "ổn định"
// nhất của dấu vân tay khi người dùng KHÔNG chủ động xoá dữ liệu.
function getOrCreateLocalId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEVICE_ID_KEY, fresh)
    return fresh
  } catch {
    // localStorage bị chặn (ẩn danh/chế độ riêng tư) → không có phần ổn định, chỉ còn các
    // thuộc tính môi trường bên dưới. Chấp nhận: đây là best-effort, không phải bảo mật.
    return 'no-storage'
  }
}

// Vài thuộc tính môi trường ít đổi. KHÔNG dùng canvas/WebGL fingerprint: nặng hơn, bị các
// trình duyệt chú trọng riêng tư (Safari ITP, Firefox RFP) làm nhiễu hoặc chặn, và mang tiếng
// "theo dõi người dùng" trong khi lợi ích chống gian lận tăng không đáng kể.
function environmentSignals(): string {
  if (typeof navigator === 'undefined' || typeof screen === 'undefined') return 'ssr'
  const parts = [
    navigator.language,
    navigator.hardwareConcurrency ?? '',
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ]
  return parts.join('|')
}

// Băm SHA-256 → hex. Băm để server KHÔNG lưu thẳng thuộc tính thiết bị (giảm dữ liệu nhạy cảm
// lưu trữ), chỉ lưu 1 chuỗi không đảo ngược được về cấu hình máy.
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Trả về mã thiết bị (hex 64 ký tự), hoặc null nếu môi trường không hỗ trợ (vd crypto.subtle
 * chỉ có trên HTTPS/localhost). Gọi phía sau luôn phải chịu được giá trị null.
 */
export async function getDeviceHash(): Promise<string | null> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return null
    return await sha256Hex(`${getOrCreateLocalId()}::${environmentSignals()}`)
  } catch {
    return null
  }
}
