// api/_lib/cefrTagging.ts — logic THUẦN (không I/O) để gắn nhãn CEFR cho từ vựng bằng AI.
// Tách riêng khỏi scripts/tag-cefr-levels.ts (nơi làm I/O: đọc/ghi file, gọi provider AI)
// để test được (xem cefrTagging.test.ts) — giống cách googleTts.ts/supabaseAdmin.ts tách
// khỏi scripts/seed-pronunciations.ts.

export type CefrWordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

const CEFR_WORD_LEVELS: readonly CefrWordLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function isCefrWordLevel(v: unknown): v is CefrWordLevel {
  return typeof v === 'string' && (CEFR_WORD_LEVELS as readonly string[]).includes(v)
}

export interface CefrTagInput {
  word: string
  pos: string
  vi: string
}

// Prompt gửi AI: yêu cầu trả về CHỈ MỘT mảng JSON, không giải thích thêm, để parse an toàn.
export function buildCefrTagPrompt(items: CefrTagInput[]): { system: string; user: string } {
  const system =
    'Bạn là chuyên gia phân loại từ vựng tiếng Anh theo khung CEFR (Common European ' +
    'Framework). Với mỗi từ, ước lượng cấp độ CEFR phù hợp nhất dựa trên độ phổ biến/độ khó ' +
    'thực tế: A1=cơ bản nhất (người mới học), A2, B1, B2, C1, C2=rất nâng cao/từ hiếm dùng. ' +
    'CHỈ trả về một mảng JSON hợp lệ, KHÔNG kèm giải thích, KHÔNG dùng markdown code fence. ' +
    'Định dạng CHÍNH XÁC: [{"word":"...","level":"A1"}, ...] — "level" phải là một trong: ' +
    'A1, A2, B1, B2, C1, C2. Trả đủ và đúng thứ tự tất cả các từ được liệt kê, không bỏ sót.'

  const user = items
    .map((it, i) => `${i + 1}. ${it.word} (${it.pos}) — nghĩa tiếng Việt: ${it.vi}`)
    .join('\n')

  return { system, user }
}

// Bóc JSON khỏi phản hồi AI (có thể lỡ bọc trong ```json ... ``` dù đã dặn không dùng),
// rồi validate từng phần tử. Trả về map word (viết thường) → level, CHỈ gồm mục hợp lệ —
// không throw khi 1 phần tử lỗi, để không mất cả batch vì 1 dòng hỏng.
export function parseCefrTagResponse(raw: string): Map<string, CefrWordLevel> {
  const result = new Map<string, CefrWordLevel>()

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = (fenced ? fenced[1] : raw)?.trim()
  if (!jsonText) return result

  // Nếu model lỡ thêm chữ trước/sau mảng, cắt về đúng đoạn [ ... ] ngoài cùng.
  const start = jsonText.indexOf('[')
  const end = jsonText.lastIndexOf(']')
  const arrayText =
    start !== -1 && end !== -1 && end > start ? jsonText.slice(start, end + 1) : jsonText

  let parsed: unknown
  try {
    parsed = JSON.parse(arrayText)
  } catch {
    return result
  }
  if (!Array.isArray(parsed)) return result

  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue
    const word = (item as { word?: unknown }).word
    const level = (item as { level?: unknown }).level
    if (typeof word !== 'string' || !word.trim()) continue
    if (!isCefrWordLevel(level)) continue
    result.set(word.trim().toLowerCase(), level)
  }

  return result
}
