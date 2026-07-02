// api/_lib/base64.ts — Giải mã base64 → bytes, dùng chung cho các handler server-side.
// Dùng atob() (Web API) thay vì Buffer (Node API) vì các handler này chạy trên Edge Runtime.

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
