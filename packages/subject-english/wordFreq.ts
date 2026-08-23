// Đọc wordlist tần suất (NGSL/SUBTLEX...) → Map(từ viết thường → hạng tần suất).
// Tách riêng thành logic THUẦN (không đụng filesystem) để test được — scripts/
// assign-word-freq.ts chỉ lo đọc file rồi gọi hàm này.

export type WordFreqFormat = 'csv' | 'txt'

export function detectWordFreqFormat(listPath: string): WordFreqFormat {
  return listPath.toLowerCase().endsWith('.csv') ? 'csv' : 'txt'
}

// .csv: có cột "word" + "rank" (dòng đầu là header), ví dụ:
//   word,rank
//   the,1
//   be,2
// .txt: mỗi dòng 1 từ, ĐÃ SẮP THEO TẦN SUẤT GIẢM DẦN (dòng 1 = phổ biến nhất,
// hạng = số thứ tự dòng, bắt đầu từ 1).
// Từ trùng lặp: giữ hạng XUẤT HIỆN ĐẦU TIÊN (phổ biến nhất được ghi nhận trước).
export function parseWordRanks(raw: string, format: WordFreqFormat): Map<string, number> {
  const ranks = new Map<string, number>()

  if (format === 'csv') {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const header = lines[0]?.toLowerCase().split(',') ?? []
    const wordIdx = header.indexOf('word')
    const rankIdx = header.indexOf('rank')
    const hasHeader = wordIdx >= 0 && rankIdx >= 0
    const wi = hasHeader ? wordIdx : 0
    const ri = hasHeader ? rankIdx : 1
    for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
      const cols = lines[i]!.split(',')
      const word = cols[wi]?.trim().toLowerCase()
      const rank = Number(cols[ri])
      if (word && Number.isFinite(rank) && !ranks.has(word)) ranks.set(word, rank)
    }
    return ranks
  }

  const words = raw
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0)
  words.forEach((w, i) => {
    if (!ranks.has(w)) ranks.set(w, i + 1)
  })
  return ranks
}
