// src/lib/authHeader.ts — Lấy session token hiện tại để gửi kèm request lên server.
// Giai đoạn B: token tự phát hành (xem api/auth.ts), lưu trong localStorage — thay
// Supabase access_token trước đây.

const TOKEN_KEY = 'gsa_session_token_v1'

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null // localStorage bị chặn (chế độ ẩn danh nghiêm ngặt) — coi như chưa đăng nhập
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* bỏ qua — chỉ ảnh hưởng persist qua lần tải lại, không chặn phiên hiện tại */
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getAccessToken(): string | undefined {
  return getStoredToken() ?? undefined
}

// Header sẵn sàng spread vào fetch({ headers: { ...getAuthHeader() } }).
// Rỗng nếu chưa đăng nhập — server sẽ tự trả 401 cho các endpoint bắt buộc auth.
export function getAuthHeader(): Record<string, string> {
  const token = getStoredToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
