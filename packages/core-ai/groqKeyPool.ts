// packages/core-ai/groqKeyPool.ts — Bể nhiều GROQ_API_KEY (cách nhau dấu phẩy hoặc xuống
// dòng), xoay vòng dùng CHUNG cho chat (chatProviders.ts), STT (openaiStt.ts) và kiểm tra
// trạng thái tính năng (api/_lib/featureStatusChecks.ts). Groq FREE mỗi key có hạn mức
// riêng — gộp bể giúp chia đều tải và tự chuyển key khác khi 1 key hết quota/bị revoke,
// thay vì gửi nguyên chuỗi "key1,key2" làm 1 Bearer token (lỗi 401 chắc chắn).

export function groqKeyPool(): string[] {
  return (process.env.GROQ_API_KEY || '')
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean)
}

export function hasGroqKey(): boolean {
  return groqKeyPool().length > 0
}

// Lỗi coi là DO CHÍNH key này gây ra (nên thử key khác trong bể): 401 key sai/bị revoke,
// 429 hết hạn mức. Lỗi khác (400 tham số sai, 5xx, mạng lỗi...) thử key khác cũng lỗi y hệt
// → không đáng thử, nơi gọi nên trả lỗi ngay.
export function isSkippableGroqKeyError(status: number | undefined): boolean {
  return status === 401 || status === 429
}

// Con trỏ round-robin — sống trong bộ nhớ tiến trình Node (server.ts chạy liên tục trên
// VPS) nên chia đều tải qua nhiều lần gọi khác nhau, không phải lúc nào cũng bắt đầu từ
// key #0.
let nextKeyIndex = 0

export function nextGroqKeyStartIndex(poolLength: number): number {
  const startIndex = nextKeyIndex % poolLength
  nextKeyIndex = (nextKeyIndex + 1) % poolLength
  return startIndex
}

export function groqModelPool(customModelString?: string): string[] {
  const raw =
    customModelString !== undefined ? customModelString : process.env.GROQ_CHAT_MODEL || ''
  const models = raw
    .split(/[,\n]/)
    .map((m) => m.trim())
    .filter(Boolean)
  return models.length > 0 ? models : ['openai/gpt-oss-120b']
}

// Chỉ dùng trong test — con trỏ round-robin sống ở module scope nên rò rỉ trạng thái giữa
// các test case nếu không reset (thứ tự thử key trong 1 test phụ thuộc test chạy trước nó).
export function __resetGroqKeyRotationForTests(): void {
  nextKeyIndex = 0
}
