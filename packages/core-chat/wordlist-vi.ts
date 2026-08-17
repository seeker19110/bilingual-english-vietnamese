// packages/core-chat/wordlist-vi.ts — Danh sách từ tiếng Việt không văn minh phân loại theo mức độ.
// Nguồn: tổng hợp từ ngữ thông dụng, phân loại thủ công.
//
// Cấu trúc:
//   high   → tục tĩu nặng, phân biệt chủng tộc/giới tính, lăng mạ cá nhân → BLOCK message
//   medium → xúc phạm, chửi bới phổ biến → FILTER (thay ***)
//   low    → nhẹ, thiếu lịch sự → FILTER (thay ***)
//
// LƯU Ý: Danh sách này không exhaustive — có thể bổ sung theo thời gian.
// Moderator sẽ normalize text (bỏ dấu, bỏ ký tự lặp, v.v.) trước khi so khớp.

export const VI_WORDS: Record<'high' | 'medium' | 'low', string[]> = {
  high: [
    // Tục tĩu nghiêm trọng (normalized — không dấu để khớp sau normalize)
    'dit',
    'ditme',
    'ditmay',
    'ditmacon',
    'concac',
    'lonme',
    'catdi',
    'butme',
    'dume',
    'dumay',
    'duma',
    'du ma',
    'đụ mẹ',
    'đụ má',
    'cặc',
    'lồn',
    'đụt',
    'địt mẹ',
    'địt má',
    'con lồn',
    'con cặc',
    'vãi lồn',
    'vl', // viết tắt phổ biến của "vãi lồn"
    'đm', // viết tắt
    'đkm', // viết tắt
    'dcm', // viết tắt
    'đcm', // viết tắt
    'dkm',
    'dm',
    // Phân biệt chủng tộc / hạ nhục
    'chệt',
    'mọi',
    'thằng mọi',
    'con mọi',
  ],
  medium: [
    'đồ chó',
    'đồ súc vật',
    'ngu như chó',
    'ngu như bò',
    'thằng khùng',
    'con khùng',
    'đồ điên',
    'thằng điên',
    'con điên',
    'đồ ngu',
    'thằng ngu',
    'con ngu',
    'đồ óc chó',
    'óc chó',
    'thằng hâm',
    'con hâm',
    'mày chết đi',
    'cút xéo',
    'câm mồm',
    'câm miệng',
    'đồ phản bội',
    'thằng hèn',
    'con hèn',
    'đồ vô liêm sỉ',
    'đồ mất dạy',
    'mất dạy',
    'vô học',
    'đồ vô học',
    'láo',
    'đồ láo',
    'xạo',
    'đồ xạo',
    'nói bậy',
    'thối mồm',
  ],
  low: [
    'đồ ngốc',
    'thằng ngốc',
    'con ngốc',
    'ngu',
    'dốt',
    'đần',
    'khùng',
    'điên',
    'hâm',
    'bựa',
    'thấy ghét',
    'chán',
    'vô dụng',
    'rác',
    'trash',
    'xấu xa',
    'tệ',
    'kém',
  ],
}

// Viết tắt phổ biến trên mạng (map về dạng normalize để so sánh)
export const VI_ABBREVIATIONS: Record<string, 'high' | 'medium' | 'low'> = {
  đm: 'high',
  dm: 'high',
  dkm: 'high',
  đkm: 'high',
  dcm: 'high',
  đcm: 'high',
  vl: 'high',
  clgt: 'high', // viết tắt tục
  kml: 'medium', // viết tắt chửi nhẹ
  vcl: 'high',
  cmn: 'high',
}
