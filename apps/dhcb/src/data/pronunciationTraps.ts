// Bảng lỗi phát âm điển hình của người Việt khi học tiếng Anh — soạn tay.
// Dùng để tra cứu trong src/lib/pronounceCoach.ts: khi STT nghe ra 1 từ THẬT
// khác với từ mục tiêu, tra bảng này để biết đây có phải lỗi "chuyển di" quen
// thuộc không (thay vì chỉ đọc sai ngẫu nhiên) và sinh gợi ý tiếng Việt cụ thể.

export type TrapGroup =
  | 'final-consonant' // âm cuối/cụm phụ âm bị nuốt (áp dụng chung, không theo từ cụ thể)
  | 'consonant-cluster' // cụm phụ âm đầu "s+phụ âm" bị nuốt mất /s/
  | 'th-voiceless' // "th" vô thanh /θ/ → nhầm thành /t/
  | 'th-voiced' // "th" hữu thanh /ð/ → nhầm thành /d/
  | 'sh-s' // /ʃ/ → /s/
  | 'ch-tr' // cụm "tr" /tr/ → lệch thành /tʃ/ ("ch")
  | 'j-d' // /dʒ/ → /d/
  | 'z-s' // /z/ → /s/ (mất rung dây thanh)
  | 'r-l' // /r/ ↔ /l/
  | 'v-w' // /v/ ↔ /w/
  | 'vowel-length' // nguyên âm ngắn/dài lẫn nhau (/ɪ/-/iː/, /ʊ/-/uː/)

export interface WordTrap {
  id: string
  // Từ mục tiêu (đã chuẩn hoá: chữ thường, không dấu câu)
  target: string
  // Các từ THẬT mà STT/người nghe dễ nhầm ra khi người Việt đọc sai target
  traps: string[]
  // Gợi ý sửa bằng tiếng Việt — mô tả vị trí lưỡi/môi/hơi, không dùng thuật ngữ ngữ âm học khó hiểu
  tipVi: string
  group: TrapGroup
}

export const WORD_TRAPS: WordTrap[] = [
  // ── th vô thanh /θ/ → /t/ ──────────────────────────────────────────
  {
    id: 'th-vl-1',
    target: 'three',
    traps: ['tree'],
    tipVi:
      '"th" trong "three" đọc bằng cách đặt đầu lưỡi giữa hai hàm răng và đẩy hơi ra (âm /θ/) — khác hẳn "tree", lưỡi phải chạm vòm miệng (âm /t/).',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-2',
    target: 'think',
    traps: ['sink'],
    tipVi:
      '"th" trong "think" là đặt lưỡi giữa răng rồi đẩy hơi (âm /θ/), không phải âm /s/ như "sink" — thử cắn nhẹ đầu lưỡi rồi thổi hơi ra.',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-3',
    target: 'thank',
    traps: ['tank'],
    tipVi:
      'Âm /θ/ đầu từ "thank" cần đặt lưỡi giữa hai hàm răng, khác âm /t/ (lưỡi chạm vòm miệng) của "tank".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-4',
    target: 'thin',
    traps: ['tin'],
    tipVi: '"thin" bắt đầu bằng /θ/ (lưỡi giữa răng, đẩy hơi), không phải /t/ như "tin".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-5',
    target: 'path',
    traps: ['pat'],
    tipVi:
      'Âm /θ/ cuối từ "path" cần giữ lưỡi giữa răng tới hết hơi, đừng đổi thành /t/ như "pat".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-6',
    target: 'bath',
    traps: ['bat'],
    tipVi: 'Kết thúc "bath" bằng /θ/ (lưỡi giữa răng), không phải /t/ như "bat".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-7',
    target: 'tenth',
    traps: ['tent'],
    tipVi: '"tenth" có âm /θ/ ở cuối (lưỡi giữa răng) — nếu bỏ qua sẽ nghe thành "tent".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-8',
    target: 'fourth',
    traps: ['fort'],
    tipVi: 'Đuôi "-th" của "fourth" là âm /θ/ (lưỡi giữa răng), không phải /t/ trong "fort".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-9',
    target: 'thread',
    traps: ['tread'],
    tipVi: '"thread" mở đầu bằng /θ/ (lưỡi giữa răng, đẩy hơi), không phải /t/ như "tread".',
    group: 'th-voiceless',
  },
  {
    id: 'th-vl-10',
    target: 'thought',
    traps: ['taught'],
    tipVi: 'Âm /θ/ đầu "thought" cần lưỡi giữa hai hàm răng, khác /t/ của "taught".',
    group: 'th-voiceless',
  },

  // ── th hữu thanh /ð/ → /d/ ─────────────────────────────────────────
  {
    id: 'th-vd-1',
    target: 'they',
    traps: ['day'],
    tipVi:
      '"th" trong "they" là âm /ð/ (lưỡi giữa răng, có rung dây thanh), không phải /d/ như "day".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-2',
    target: 'though',
    traps: ['dough'],
    tipVi:
      '"though" bắt đầu bằng /ð/ (lưỡi giữa răng, có rung), khác /d/ (lưỡi chạm vòm miệng) của "dough".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-3',
    target: 'there',
    traps: ['dare'],
    tipVi:
      '"there" mở đầu bằng /ð/ — đặt lưỡi giữa răng và rung dây thanh, đừng đọc thành /d/ như "dare".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-4',
    target: 'then',
    traps: ['den'],
    tipVi: '"then" có âm /ð/ đầu từ (lưỡi giữa răng), không phải /d/ như "den".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-5',
    target: 'those',
    traps: ['doze'],
    tipVi: '"those" bắt đầu bằng /ð/, khác âm /d/ của "doze".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-6',
    target: 'other',
    traps: ['udder'],
    tipVi: 'Âm giữa của "other" là /ð/ (lưỡi giữa răng), không phải /d/ như "udder".',
    group: 'th-voiced',
  },
  {
    id: 'th-vd-7',
    target: 'breathe',
    traps: ['breed'],
    tipVi: '"breathe" kết thúc bằng /ð/ (lưỡi giữa răng, có rung), không phải /d/ như "breed".',
    group: 'th-voiced',
  },

  // ── /ʃ/ ("sh") → /s/ ───────────────────────────────────────────────
  {
    id: 'sh-s-1',
    target: 'she',
    traps: ['see'],
    tipVi:
      '"sh" trong "she" đọc bằng cách chúm môi tròn, đẩy hơi rộng (âm /ʃ/) — khác "see", môi không chúm, hơi hẹp (âm /s/).',
    group: 'sh-s',
  },
  {
    id: 'sh-s-2',
    target: 'shoe',
    traps: ['sue'],
    tipVi: 'Chúm môi tròn cho âm /ʃ/ đầu "shoe" — nếu môi không chúm sẽ thành /s/ như "sue".',
    group: 'sh-s',
  },
  {
    id: 'sh-s-3',
    target: 'ship',
    traps: ['sip'],
    tipVi: '"ship" cần chúm môi cho âm /ʃ/, khác "sip" (âm /s/, môi không chúm).',
    group: 'sh-s',
  },
  {
    id: 'sh-s-4',
    target: 'sheet',
    traps: ['seat'],
    tipVi: 'Âm /ʃ/ đầu "sheet" chúm môi tròn hơn — không chúm sẽ nghe thành "seat" (/s/).',
    group: 'sh-s',
  },
  {
    id: 'sh-s-5',
    target: 'shore',
    traps: ['sore'],
    tipVi: '"shore" mở đầu bằng /ʃ/ (chúm môi), khác /s/ (môi bình thường) của "sore".',
    group: 'sh-s',
  },

  // ── cụm "tr" /tr/ → lệch thành /tʃ/ ("ch") ─────────────────────────
  {
    id: 'ch-tr-1',
    target: 'train',
    traps: ['chain'],
    tipVi:
      '"tr" trong "train" là 2 âm /t/ rồi /r/ tách biệt (lưỡi cong lên cho /r/) — đừng đọc dính thành /tʃ/ như "chain".',
    group: 'ch-tr',
  },
  {
    id: 'ch-tr-2',
    target: 'truck',
    traps: ['chuck'],
    tipVi: 'Giữ rõ 2 âm /t/ rồi /r/ trong "truck" — đọc dính lại sẽ thành "chuck" (/tʃ/).',
    group: 'ch-tr',
  },
  {
    id: 'ch-tr-3',
    target: 'trip',
    traps: ['chip'],
    tipVi: '"trip" cần tách /t/ và /r/ rõ ràng, không dính lại thành /tʃ/ như "chip".',
    group: 'ch-tr',
  },
  {
    id: 'ch-tr-4',
    target: 'true',
    traps: ['chew'],
    tipVi: 'Đọc rõ /t/ rồi lượn lưỡi sang /r/ trong "true" — đừng gộp thành /tʃ/ như "chew".',
    group: 'ch-tr',
  },
  {
    id: 'ch-tr-5',
    target: 'try',
    traps: ['chai'],
    tipVi: '"try" là /t/ rồi /r/ tách biệt — gộp lại nghe sẽ giống "chai" (/tʃ/).',
    group: 'ch-tr',
  },

  // ── /dʒ/ ("j") → /d/ ───────────────────────────────────────────────
  {
    id: 'j-d-1',
    target: 'jump',
    traps: ['dump'],
    tipVi:
      '"j" trong "jump" là âm /dʒ/ (đầu lưỡi phồng, có ma sát) — khác /d/ (lưỡi chạm nhẹ vòm miệng) của "dump".',
    group: 'j-d',
  },
  {
    id: 'j-d-2',
    target: 'jam',
    traps: ['dam'],
    tipVi: '"jam" bắt đầu bằng /dʒ/, không phải /d/ như "dam".',
    group: 'j-d',
  },
  {
    id: 'j-d-3',
    target: 'jeep',
    traps: ['deep'],
    tipVi: '"jeep" mở đầu bằng /dʒ/ (có ma sát), khác /d/ của "deep".',
    group: 'j-d',
  },
  {
    id: 'j-d-4',
    target: 'large',
    traps: ['lard'],
    tipVi: '"large" kết thúc bằng /dʒ/, không phải /d/ như "lard".',
    group: 'j-d',
  },

  // ── /z/ → /s/ (mất rung dây thanh) ────────────────────────────────
  {
    id: 'z-s-1',
    target: 'rise',
    traps: ['rice'],
    tipVi: '"rise" kết thúc bằng /z/ (rung dây thanh) — nếu mất rung sẽ thành /s/ như "rice".',
    group: 'z-s',
  },
  {
    id: 'z-s-2',
    target: 'buzz',
    traps: ['bus'],
    tipVi: '"buzz" kết thúc bằng /z/ có rung — không rung sẽ nghe thành "bus" (/s/).',
    group: 'z-s',
  },
  {
    id: 'z-s-3',
    target: 'prize',
    traps: ['price'],
    tipVi: '"prize" kết thúc bằng /z/ rung — mất rung thành /s/ như "price".',
    group: 'z-s',
  },
  {
    id: 'z-s-4',
    target: 'zip',
    traps: ['sip'],
    tipVi: '"zip" bắt đầu bằng /z/ (rung dây thanh), không phải /s/ như "sip".',
    group: 'z-s',
  },
  {
    id: 'z-s-5',
    target: 'zap',
    traps: ['sap'],
    tipVi: '"zap" mở đầu bằng /z/ có rung, khác /s/ của "sap".',
    group: 'z-s',
  },

  // ── /r/ ↔ /l/ ──────────────────────────────────────────────────────
  {
    id: 'r-l-1',
    target: 'right',
    traps: ['light'],
    tipVi:
      '"r" trong "right" cong đầu lưỡi lên, KHÔNG chạm vòm miệng — khác "light" (/l/), đầu lưỡi phải chạm vòm miệng.',
    group: 'r-l',
  },
  {
    id: 'r-l-2',
    target: 'road',
    traps: ['load'],
    tipVi: '"road" bắt đầu bằng /r/ (lưỡi không chạm vòm miệng), khác /l/ (lưỡi chạm) của "load".',
    group: 'r-l',
  },
  {
    id: 'r-l-3',
    target: 'rice',
    traps: ['lice'],
    tipVi:
      'Giữ đầu lưỡi không chạm vòm miệng cho /r/ trong "rice" — chạm vào sẽ thành /l/ như "lice".',
    group: 'r-l',
  },
  {
    id: 'r-l-4',
    target: 'correct',
    traps: ['collect'],
    tipVi:
      'Âm /r/ giữa "correct" không chạm lưỡi vào vòm miệng — chạm vào sẽ thành /l/ như "collect".',
    group: 'r-l',
  },
  {
    id: 'r-l-5',
    target: 'free',
    traps: ['flee'],
    tipVi: '"free" có /r/ (lưỡi không chạm), khác "flee" có thêm /l/ (lưỡi chạm vòm miệng).',
    group: 'r-l',
  },
  {
    id: 'r-l-6',
    target: 'grass',
    traps: ['glass'],
    tipVi: 'Cụm "gr-" trong "grass" dùng /r/ (lưỡi không chạm) — nhầm sang /l/ sẽ thành "glass".',
    group: 'r-l',
  },
  {
    id: 'r-l-7',
    target: 'arrive',
    traps: ['alive'],
    tipVi: '"arrive" có /r/ giữa từ (lưỡi không chạm vòm miệng), khác /l/ của "alive".',
    group: 'r-l',
  },

  // ── /v/ ↔ /w/ ──────────────────────────────────────────────────────
  {
    id: 'v-w-1',
    target: 'vest',
    traps: ['west'],
    tipVi:
      '"v" trong "vest" là môi trên chạm răng dưới, đẩy hơi rung (âm /v/) — khác "west" (/w/), môi tròn lại không chạm răng.',
    group: 'v-w',
  },
  {
    id: 'v-w-2',
    target: 'vet',
    traps: ['wet'],
    tipVi: '"vet" cần môi trên chạm răng dưới cho âm /v/, không chúm tròn môi như "wet" (/w/).',
    group: 'v-w',
  },
  {
    id: 'v-w-3',
    target: 'vine',
    traps: ['wine'],
    tipVi: '"vine" bắt đầu bằng /v/ (răng chạm môi), khác /w/ (môi tròn) của "wine".',
    group: 'v-w',
  },
  {
    id: 'v-w-4',
    target: 'verse',
    traps: ['worse'],
    tipVi:
      'Âm /v/ đầu "verse" cần răng trên chạm môi dưới — chúm môi tròn sẽ thành /w/ như "worse".',
    group: 'v-w',
  },
  {
    id: 'v-w-5',
    target: 'vary',
    traps: ['wary'],
    tipVi: '"vary" mở đầu bằng /v/ (răng chạm môi), không phải /w/ như "wary".',
    group: 'v-w',
  },

  // ── nguyên âm ngắn/dài lẫn nhau ─────────────────────────────────────
  {
    id: 'vlen-1',
    target: 'live',
    traps: ['leave'],
    tipVi: 'Nguyên âm trong "live" ngắn (âm /ɪ/) — kéo dài thành /iː/ sẽ nghe ra "leave".',
    group: 'vowel-length',
  },
  {
    id: 'vlen-2',
    target: 'bit',
    traps: ['beat'],
    tipVi: '"bit" có nguyên âm ngắn /ɪ/ — kéo dài thành "beat" (/iː/) sẽ đổi nghĩa.',
    group: 'vowel-length',
  },
  {
    id: 'vlen-3',
    target: 'fill',
    traps: ['feel'],
    tipVi: 'Giữ nguyên âm ngắn /ɪ/ trong "fill" — kéo dài sẽ thành "feel" (/iː/).',
    group: 'vowel-length',
  },
  {
    id: 'vlen-4',
    target: 'sit',
    traps: ['seat'],
    tipVi: '"sit" có nguyên âm ngắn /ɪ/, khác "seat" nguyên âm dài /iː/.',
    group: 'vowel-length',
  },
  {
    id: 'vlen-5',
    target: 'full',
    traps: ['fool'],
    tipVi: '"full" có nguyên âm ngắn /ʊ/ — kéo dài thành /uː/ sẽ nghe ra "fool".',
    group: 'vowel-length',
  },
  {
    id: 'vlen-6',
    target: 'chip',
    traps: ['cheap'],
    tipVi: '"chip" có nguyên âm ngắn /ɪ/, khác "cheap" nguyên âm dài /iː/.',
    group: 'vowel-length',
  },

  // ── cụm phụ âm đầu "s+phụ âm" bị nuốt mất /s/ ───────────────────────
  {
    id: 'cc-1',
    target: 'start',
    traps: ['tart'],
    tipVi: '"start" có 2 phụ âm đầu /s/+/t/ đọc liền nhau — nếu bỏ /s/ sẽ nghe thành "tart".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-2',
    target: 'stop',
    traps: ['top'],
    tipVi: 'Đọc rõ /s/ trước /t/ trong "stop" — bỏ /s/ sẽ thành "top".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-3',
    target: 'small',
    traps: ['mall'],
    tipVi: 'Giữ âm /s/ đầu "small" trước khi vào /m/ — bỏ /s/ sẽ nghe thành "mall".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-4',
    target: 'spot',
    traps: ['pot'],
    tipVi: '"spot" có /s/+/p/ đầu từ — nuốt mất /s/ sẽ thành "pot".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-5',
    target: 'spin',
    traps: ['pin'],
    tipVi: 'Đọc đủ /s/ trước /p/ trong "spin" — thiếu /s/ sẽ thành "pin".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-6',
    target: 'sport',
    traps: ['port'],
    tipVi: 'Giữ /s/ đầu "sport" — bỏ qua sẽ nghe thành "port".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-7',
    target: 'speak',
    traps: ['peak'],
    tipVi: '"speak" có /s/+/p/ đầu từ, đừng bỏ /s/ kẻo thành "peak".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-8',
    target: 'smile',
    traps: ['mile'],
    tipVi: 'Đọc rõ /s/ trước /m/ trong "smile" — thiếu /s/ sẽ thành "mile".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-9',
    target: 'slow',
    traps: ['low'],
    tipVi: 'Giữ âm /s/ đầu "slow" — bỏ mất sẽ nghe thành "low".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-10',
    target: 'scare',
    traps: ['care'],
    tipVi: '"scare" có /s/+/k/ đầu từ — nuốt /s/ sẽ thành "care".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-11',
    target: 'score',
    traps: ['core'],
    tipVi: 'Đọc đủ /s/ trước /k/ trong "score" — thiếu sẽ thành "core".',
    group: 'consonant-cluster',
  },
  {
    id: 'cc-12',
    target: 'spray',
    traps: ['pray'],
    tipVi: '"spray" có 3 phụ âm /s/+/p/+/r/ đầu từ — bỏ /s/ sẽ thành "pray".',
    group: 'consonant-cluster',
  },
]

// Đuôi (hậu tố) người Việt hay "nuốt" mất khi nói tiếng Anh — vì tiếng Việt
// không có các cụm phụ âm cuối này. Áp dụng CHUNG cho mọi từ (không liệt kê
// từng từ), khác với WORD_TRAPS ở trên vốn là các cặp từ cụ thể.
const DROPPABLE_ENDINGS = [
  's',
  'es',
  'ts',
  'ks',
  'ps',
  'ds',
  'ed',
  't',
  'd',
  'k',
  'p',
  'st',
  'nd',
  'nt',
  'ct',
  'ft',
  'ld',
  'pt',
]

// true nếu `spoken` giống `target` nhưng bị cắt mất đúng 1 đuôi phụ âm hay gặp
// (vd "cats"→"cat", "asked"→"ask", "works"→"work") — dấu hiệu "nuốt âm cuối".
export function matchesFinalConsonantDrop(target: string, spoken: string): boolean {
  if (spoken.length < 2 || spoken.length >= target.length) return false
  if (!target.startsWith(spoken)) return false
  const dropped = target.slice(spoken.length)
  return DROPPABLE_ENDINGS.includes(dropped)
}
