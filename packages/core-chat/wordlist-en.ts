// packages/core-chat/wordlist-en.ts — Từ tiếng Anh không văn minh, phân loại theo mức độ
// nghiêm trọng. So khớp sau khi CHUẨN HOÁ (viết thường, gộp ký tự lặp, đổi leetspeak cơ bản —
// xem moderator.ts#normalize).

export const EN_WORDS: Record<'high' | 'medium' | 'low', string[]> = {
  high: ['fuck', 'nigger', 'cunt', 'faggot'],
  medium: ['bitch', 'asshole', 'bastard', 'whore', 'slut'],
  low: ['damn', 'crap', 'idiot', 'stupid'],
}
