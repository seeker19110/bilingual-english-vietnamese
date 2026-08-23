// api/_lib/fetchTimeout.ts — fetch có giới hạn thời gian (timeout).
//
// LÝ DO: fetch mặc định của Node KHÔNG có timeout. Nếu nhà cung cấp AI/STT
// (Gemini/Groq/OpenAI/Anthropic) phản hồi chậm hoặc treo, request sẽ giữ kết nối
// vô hạn, chiếm tài nguyên server và khiến người dùng chờ mãi không có lỗi.
//
// Hàm này bọc fetch bằng AbortController + setTimeout để tự huỷ sau `timeoutMs`,
// và ném ra lỗi có thông điệp rõ ràng để handler trả về cho client.

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    // AbortError = đã quá thời gian chờ → đổi sang thông điệp dễ hiểu
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        `Hết thời gian chờ (quá ${Math.round(timeoutMs / 1000)}s) — máy chủ phản hồi chậm, thử lại sau.`,
      )
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
