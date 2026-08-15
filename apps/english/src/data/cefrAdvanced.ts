// ──────────────────────────────────────────────────────────────────────────
// CẤP CEFR NÂNG CAO — C1 & C2
//
// Tách khỏi src/data/cefr.ts để file đó gọn. File này định nghĩa 2 cấp:
//   - C1_LEVEL: Thành thạo (Advanced)
//   - C2_LEVEL: Tinh thông (Proficiency)
//
// TỪ VỰNG: lấy TỰ ĐỘNG từ từ điển đã gắn nhãn CEFR (src/data/cefrC1C2Vocab.json,
// sinh bởi scripts/gen-cefr-c1c2-vocab.ts). Ở đây chỉ GHÉP các nhóm vòng từ vựng
// đó vào từng "Phần" (unit) qua C1_UNIT_CIRCLE_IDS / C2_UNIT_CIRCLE_IDS.
//
// NGỮ PHÁP: soạn tay, cùng chuẩn "làm giàu" như A1–B2 (cấu trúc + giải thích tiếng
// Việt + ví dụ bấm nghe + mẹo + lỗi thường gặp + quiz tự kiểm tra).
//
// Chỉ dùng TYPE từ cefr.ts (import type) để KHÔNG tạo vòng phụ thuộc lúc chạy —
// các helper ex/mis/qz định nghĩa lại tại chỗ (giống bản trong cefr.ts).
// ──────────────────────────────────────────────────────────────────────────

// Lấy kiểu từ `cefrTypes.ts` chứ KHÔNG từ './cefr' — './cefr' import DỮ LIỆU C1/C2 của file này
// nên import ngược lại sẽ thành chu trình.
import type {
  CefrLevel,
  CefrUnit,
  GrammarLesson,
  Example,
  CommonMistake,
  QuizItem,
} from './cefrTypes'
import { C1_VOCAB_UNITS, C2_VOCAB_UNITS, type VocabUnitDef } from './cefrC1C2Vocab'

// Helper rút gọn (bản sao của cefr.ts — dùng type-only import nên phải tự khai báo).
const ex = (en: string, vi: string): Example => ({ en, vi })
const mis = (wrong: string, right: string, noteVi: string): CommonMistake => ({
  wrong,
  right,
  noteVi,
})
const qz = (q: string, options: string[], answer: number, explainVi?: string): QuizItem => ({
  q,
  options,
  answer,
  explainVi,
})

// Metadata 1 "Phần" mang ngữ pháp (chưa có từ vựng — từ vựng ghép sau).
interface GrammarUnitMeta {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  grammar: GrammarLesson[]
}

// Ghép các Phần (unit) của cấp nâng cao. Khác A1–B2 (mỗi Phần trộn từ vựng + ngữ
// pháp): ở C1/C2, TỪ VỰNG gom theo CHỦ ĐỀ (sinh tự động) nên tách riêng khỏi ngữ
// pháp cho mạch lạc:
//   • Trước: các Phần NGỮ PHÁP (soạn tay) — kèm hội thoại, không có bước từ vựng.
//   • Sau:   các Phần TỪ VỰNG theo chủ đề (Kinh doanh, Khoa học… rồi danh/động/
//            tính-trạng từ nâng cao) — không có bước ngữ pháp.
// UI (UnitSection) tự bỏ qua bước nào không có.
function buildUnits(grammarUnits: GrammarUnitMeta[], vocabUnits: VocabUnitDef[]): CefrUnit[] {
  const grammar: CefrUnit[] = grammarUnits.map((g) => ({
    id: g.id,
    titleVi: g.titleVi,
    titleEn: g.titleEn,
    emoji: g.emoji,
    grammar: g.grammar,
    vocabCircleIds: [],
  }))
  const vocab: CefrUnit[] = vocabUnits.map((v) => ({
    id: v.id,
    titleVi: v.titleVi,
    titleEn: v.titleEn,
    emoji: v.emoji,
    grammar: [],
    vocabCircleIds: v.circleIds,
  }))
  return [...grammar, ...vocab]
}

// ══════════════════════════════════════════════════════════════════════════
// C1 — THÀNH THẠO (ngữ pháp)
// ══════════════════════════════════════════════════════════════════════════
const C1_GRAMMAR_UNITS: GrammarUnitMeta[] = [
  {
    id: 'c1-relative',
    titleVi: 'Mệnh đề quan hệ & rút gọn',
    titleEn: 'Relative clauses & reduction',
    emoji: '🔗',
    grammar: [
      {
        id: 'c1-g-reduced-relative',
        titleVi: 'Rút gọn mệnh đề quan hệ',
        titleEn: 'Reduced relative clauses',
        structure: 'N + V-ing (chủ động) / V-ed·V3 (bị động) — bỏ "who/which/that + be"',
        explainVi:
          'Khi mệnh đề quan hệ có "who/which/that", ta thường RÚT GỌN cho câu gọn và tự nhiên hơn:\n' +
          '• Chủ động → dùng V-ing: "The man who is waiting" → "The man waiting".\n' +
          '• Bị động → dùng V-ed/V3: "The car which was stolen" → "The car stolen".\n' +
          'Cách này rất phổ biến trong văn viết và báo chí tiếng Anh.',
        examples: [
          ex('The woman living next door is a doctor.', 'Người phụ nữ sống ở nhà bên là bác sĩ.'),
          ex(
            'The documents signed yesterday are ready.',
            'Các giấy tờ được ký hôm qua đã sẵn sàng.',
          ),
          ex('Anyone wanting a ticket should queue here.', 'Ai muốn mua vé thì xếp hàng ở đây.'),
        ],
        tipVi:
          'Nhớ đơn giản: đang LÀM → V-ing; BỊ làm → V3. Chỉ rút gọn được khi bỏ "who/which/that + be".',
        mistakes: [
          mis(
            'The people waited outside were angry.',
            'The people waiting outside were angry.',
            'Họ ĐANG đợi (chủ động) → dùng V-ing "waiting", không dùng "waited".',
          ),
          mis(
            'The letter writing by John arrived.',
            'The letter written by John arrived.',
            'Lá thư BỊ viết (bị động) → dùng V3 "written".',
          ),
          mis(
            'The boy who playing football is my son.',
            'The boy playing football is my son.',
            'Đã rút gọn thì BỎ "who", chỉ giữ V-ing.',
          ),
        ],
        quiz: [
          qz(
            'The girl ___ in the corner is my sister.',
            ['sitting', 'sat'],
            0,
            'Cô ấy đang ngồi (chủ động) → V-ing.',
          ),
          qz(
            'The house ___ last year looks new.',
            ['building', 'built'],
            1,
            'Ngôi nhà BỊ xây → V3.',
          ),
          qz('Passengers ___ to Hanoi should board now.', ['traveling', 'traveled'], 0),
          qz(
            'Rút gọn "The book which was published" thành:',
            ['the book publishing', 'the book published'],
            1,
          ),
        ],
      },
      {
        id: 'c1-g-relative-quantifier',
        titleVi: 'Mệnh đề quan hệ với giới từ & lượng từ',
        titleEn: 'Relative clauses with prepositions & quantifiers',
        structure: 'giới từ + which/whom · some/most/all/none/both + of + which/whom',
        explainVi:
          'Ở văn phong trang trọng, giới từ đặt TRƯỚC "which/whom" (không đặt cuối câu):\n' +
          '"the topic which we talked about" → "the topic about which we talked".\n' +
          'Với lượng từ, dùng "of which/of whom": "I have many friends, most of whom are students."',
        examples: [
          ex(
            'This is the report on which the decision was based.',
            'Đây là bản báo cáo mà quyết định dựa vào.',
          ),
          ex(
            'She has three sisters, all of whom are teachers.',
            'Cô ấy có ba chị em gái, tất cả đều là giáo viên.',
          ),
          ex(
            'He made several points, none of which were relevant.',
            'Anh ấy nêu vài ý, không ý nào liên quan cả.',
          ),
        ],
        tipVi: 'Sau giới từ dùng "whom" (người) / "which" (vật), KHÔNG dùng "who" hay "that".',
        mistakes: [
          mis(
            'The people with who I work are kind.',
            'The people with whom I work are kind.',
            'Sau giới từ "with" phải là "whom", không phải "who".',
          ),
          mis(
            'I read two books, both of them were boring.',
            'I read two books, both of which were boring.',
            'Trong mệnh đề quan hệ dùng "both of which", không dùng "both of them".',
          ),
        ],
        quiz: [
          qz(
            'The company for ___ she works is big.',
            ['which', 'whom'],
            0,
            '"Company" là vật → "which".',
          ),
          qz('I met many people, some of ___ were famous.', ['whom', 'them'], 0),
          qz(
            'This is the tool with ___ we fixed it.',
            ['which', 'that'],
            0,
            'Sau giới từ không dùng "that".',
          ),
        ],
      },
    ],
  },
  {
    id: 'c1-cleft',
    titleVi: 'Câu chẻ nhấn mạnh (Cleft)',
    titleEn: 'Cleft sentences for emphasis',
    emoji: '🎯',
    grammar: [
      {
        id: 'c1-g-it-cleft',
        titleVi: 'Câu chẻ với "It is/was ... that"',
        titleEn: 'It-cleft',
        structure: 'It + is/was + [phần nhấn mạnh] + that/who + phần còn lại',
        explainVi:
          'Dùng để NHẤN MẠNH một thành phần trong câu (chủ ngữ, tân ngữ, thời gian, nơi chốn):\n' +
          '"John broke the window yesterday." →\n' +
          '• Nhấn người: "It was John who broke the window."\n' +
          '• Nhấn thời gian: "It was yesterday that John broke the window."',
        examples: [
          ex('It was Mai who solved the problem.', 'Chính Mai là người giải quyết vấn đề.'),
          ex(
            'It is your health that matters most.',
            'Chính sức khỏe của bạn mới là điều quan trọng nhất.',
          ),
          ex('It was in Hue that we first met.', 'Chính ở Huế chúng tôi gặp nhau lần đầu.'),
        ],
        tipVi:
          'Nhấn người → "who" hoặc "that"; nhấn vật/thời gian/nơi chốn → "that". Động từ luôn chia theo "It" (is/was).',
        mistakes: [
          mis(
            'It were the students who complained.',
            'It was the students who complained.',
            'Sau "It" luôn dùng số ít "was", dù danh từ nhấn mạnh là số nhiều.',
          ),
          mis(
            'It was yesterday when I saw her.',
            'It was yesterday that I saw her.',
            'Câu chẻ nhấn mạnh dùng "that", không dùng "when".',
          ),
        ],
        quiz: [
          qz('___ was Lan who called you.', ['It', 'There'], 0),
          qz('It was money ___ they wanted.', ['that', 'which'], 0, 'Câu chẻ chuẩn dùng "that".'),
          qz('It ___ my parents who helped me.', ['was', 'were'], 0, 'Sau "It" luôn "was".'),
        ],
      },
      {
        id: 'c1-g-wh-cleft',
        titleVi: 'Câu chẻ với "What ... is" (giả chẻ)',
        titleEn: 'Wh-cleft (pseudo-cleft)',
        structure: 'What + mệnh đề + is/was + [phần nhấn mạnh]',
        explainVi:
          'Đưa "What ..." lên đầu để nhấn mạnh, thường dùng khi giải thích ý muốn/nhu cầu:\n' +
          '"I need a break." → "What I need is a break."\n' +
          'Cũng dùng "All (that) ... is" để nhấn nghĩa "chỉ ...": "All I want is peace."',
        examples: [
          ex(
            'What impressed me was her honesty.',
            'Điều làm tôi ấn tượng là sự trung thực của cô ấy.',
          ),
          ex('What we should do is call the police.', 'Điều chúng ta nên làm là gọi cảnh sát.'),
          ex(
            'All I asked for was a little respect.',
            'Tất cả những gì tôi xin chỉ là chút tôn trọng.',
          ),
        ],
        tipVi:
          'Động từ "is/was" chia theo phần đứng sau nếu là mệnh đề chỉ hành động thường để số ít: "What I need is...".',
        mistakes: [
          mis(
            'What I want are peace and quiet.',
            'What I want is peace and quiet.',
            'Sau mệnh đề "What I want" thường dùng "is" (coi như một khối ý).',
          ),
          mis(
            'The thing what I like is music.',
            'What I like is music.',
            'Không dùng "The thing what"; chỉ cần "What".',
          ),
        ],
        quiz: [
          qz('___ he needs is more time.', ['What', 'That'], 0),
          qz('What surprised us ___ the result.', ['was', 'were'], 0),
          qz('All I want ___ a cup of tea.', ['is', 'are'], 0),
        ],
      },
    ],
  },
  {
    id: 'c1-inversion',
    titleVi: 'Đảo ngữ & câu điều kiện nâng cao',
    titleEn: 'Inversion & advanced conditionals',
    emoji: '🔄',
    grammar: [
      {
        id: 'c1-g-negative-inversion',
        titleVi: 'Đảo ngữ sau trạng từ phủ định',
        titleEn: 'Inversion after negative adverbials',
        structure: 'Never/Rarely/Seldom/No sooner/Not only + trợ động từ + S + V',
        explainVi:
          'Khi đưa trạng từ phủ định/hạn định lên ĐẦU câu để nhấn mạnh, phải ĐẢO trợ động từ lên trước chủ ngữ (như câu hỏi):\n' +
          '"I have never seen such a mess." → "Never have I seen such a mess."\n' +
          'Các cụm hay gặp: Never, Rarely, Seldom, Little, No sooner ... than, Hardly ... when, Not only ... but also, Only then/after.',
        examples: [
          ex('Never have I felt so proud.', 'Chưa bao giờ tôi thấy tự hào đến vậy.'),
          ex('No sooner had we arrived than it rained.', 'Chúng tôi vừa đến thì trời đổ mưa.'),
          ex('Not only did she sing, but she also danced.', 'Cô ấy không chỉ hát mà còn nhảy.'),
        ],
        tipVi:
          'Sau cụm phủ định đầu câu, làm y như đặt CÂU HỎI: mượn trợ động từ (do/does/did/have/is...) đảo lên trước S.',
        mistakes: [
          mis(
            'Never I have seen such beauty.',
            'Never have I seen such beauty.',
            'Phải đảo trợ động từ "have" lên trước "I".',
          ),
          mis(
            'No sooner we had left than it started.',
            'No sooner had we left than it started.',
            'Đảo "had" lên trước "we"; cặp đi với "than".',
          ),
          mis(
            'Not only she is smart but also kind.',
            'Not only is she smart but also kind.',
            'Đảo "is" lên trước "she" sau "Not only".',
          ),
        ],
        quiz: [
          qz('Rarely ___ such dedication.', ['we see', 'do we see'], 1),
          qz('Not only ___ late, but he was rude.', ['he was', 'was he'], 1),
          qz('No sooner ___ than the phone rang.', ['I had sat', 'had I sat'], 1),
          qz('Đảo ngữ dùng để:', ['nhấn mạnh', 'đặt câu hỏi'], 0),
        ],
      },
      {
        id: 'c1-g-conditional-inversion',
        titleVi: 'Đảo ngữ trong câu điều kiện',
        titleEn: 'Inversion in conditionals',
        structure: 'Were S ... / Had S + V3 / Should S + V (bỏ "if")',
        explainVi:
          'Trong văn trang trọng, có thể BỎ "if" và đảo trợ động từ lên đầu:\n' +
          '• Loại 2: "If I were you" → "Were I you".\n' +
          '• Loại 3: "If I had known" → "Had I known".\n' +
          '• Điều kiện có thể xảy ra: "If you should need help" → "Should you need help".',
        examples: [
          ex('Were I rich, I would travel the world.', 'Nếu tôi giàu, tôi sẽ đi khắp thế giới.'),
          ex('Had she studied, she would have passed.', 'Nếu cô ấy học, cô ấy đã đậu.'),
          ex('Should you have questions, call me.', 'Nếu bạn có thắc mắc, hãy gọi tôi.'),
        ],
        tipVi:
          'Bỏ "if" thì phải đảo. Chỉ đảo được với "were", "had", "should" — không đảo với động từ thường.',
        mistakes: [
          mis(
            'Had I knew, I would have come.',
            'Had I known, I would have come.',
            'Sau "Had" (đảo loại 3) dùng V3 "known".',
          ),
          mis(
            'Would I you, I would rest.',
            'Were I you, I would rest.',
            'Đảo điều kiện loại 2 dùng "Were", không dùng "Would".',
          ),
        ],
        quiz: [
          qz('___ I known, I would have helped.', ['Had', 'Did'], 0),
          qz('___ you need anything, ask.', ['Should', 'Would'], 0),
          qz(
            '___ it not for you, I would fail.',
            ['Were', 'Was'],
            0,
            'Đảo điều kiện luôn dùng "Were".',
          ),
        ],
      },
    ],
  },
  {
    id: 'c1-verb-patterns',
    titleVi: 'Động từ + V-ing / to-V đổi nghĩa',
    titleEn: 'Verbs changing meaning: -ing vs to',
    emoji: '🔀',
    grammar: [
      {
        id: 'c1-g-ing-vs-to',
        titleVi: 'remember / stop / regret / try + V-ing hay to-V',
        titleEn: 'remember/stop/regret/try + -ing vs to',
        structure: 'V-ing = việc đã/đang xảy ra · to-V = việc sắp/định làm',
        explainVi:
          'Một số động từ ĐỔI NGHĨA tùy đi với V-ing hay to-V:\n' +
          '• remember/forget + V-ing = nhớ/quên việc ĐÃ làm; + to-V = nhớ/quên PHẢI làm.\n' +
          '• stop + V-ing = ngừng hẳn; + to-V = dừng LẠI ĐỂ làm việc khác.\n' +
          '• regret + V-ing = hối tiếc việc đã làm; + to-V = tiếc phải (báo tin).\n' +
          '• try + V-ing = thử; + to-V = cố gắng.',
        examples: [
          ex('I remember locking the door.', 'Tôi nhớ là đã khóa cửa (việc đã làm).'),
          ex('Remember to lock the door.', 'Nhớ khóa cửa nhé (việc phải làm).'),
          ex('He stopped smoking.', 'Anh ấy đã bỏ hút thuốc (ngừng hẳn).'),
          ex('He stopped to smoke.', 'Anh ấy dừng lại để hút thuốc.'),
        ],
        tipVi: 'Mẹo: V-ing hướng về QUÁ KHỨ/đang diễn ra; to-V hướng về TƯƠNG LAI/mục đích.',
        mistakes: [
          mis(
            'I stopped to smoke ten years ago (ý: bỏ thuốc).',
            'I stopped smoking ten years ago.',
            '"Bỏ hẳn" dùng V-ing; "stopped to smoke" nghĩa là dừng lại để hút.',
          ),
          mis(
            "Don't forget buying milk.",
            "Don't forget to buy milk.",
            'Nhắc việc PHẢI làm → to-V.',
          ),
        ],
        quiz: [
          qz('Please remember ___ the email. (nhắc việc phải làm)', ['sending', 'to send'], 1),
          qz(
            'I regret ___ you the meeting is cancelled.',
            ['telling', 'to tell'],
            1,
            '"Tiếc phải báo tin" → to-V.',
          ),
          qz(
            'He stopped ___ because his legs hurt.',
            ['walking', 'to walk'],
            0,
            '"Ngừng hẳn việc đang làm" → V-ing.',
          ),
          qz(
            'Why not try ___ a different browser?',
            ['using', 'to use'],
            0,
            '"Thử" một cách → V-ing.',
          ),
        ],
      },
    ],
  },
  {
    id: 'c1-subjunctive',
    titleVi: 'Thức giả định & câu trang trọng',
    titleEn: 'Subjunctive & formal structures',
    emoji: '📜',
    grammar: [
      {
        id: 'c1-g-subjunctive',
        titleVi: 'Thức giả định: suggest / insist / essential that + V nguyên thể',
        titleEn: 'Subjunctive: that + bare infinitive',
        structure: 'S + suggest/insist/demand/recommend + (that) + S + V (nguyên thể)',
        explainVi:
          'Sau động từ/tính từ chỉ ĐỀ NGHỊ, YÊU CẦU, CẦN THIẾT, mệnh đề "that" dùng động từ NGUYÊN THỂ (không chia, không "s", phủ định dùng "not"):\n' +
          '"The doctor recommended that he rest." (không phải "rests").\n' +
          'Tính từ hay gặp: essential, important, vital, necessary + that + S + V.',
        examples: [
          ex('I suggest that she take a break.', 'Tôi đề nghị cô ấy nghỉ một chút.'),
          ex(
            'It is essential that everyone be on time.',
            'Điều cốt yếu là mọi người phải đúng giờ.',
          ),
          ex('They demanded that he not leave.', 'Họ yêu cầu anh ấy đừng rời đi.'),
        ],
        tipVi:
          'Dùng động từ nguyên thể cho MỌI ngôi: "that he be / she go / they have". Phủ định: "that he not go".',
        mistakes: [
          mis(
            'I suggest that she takes a rest.',
            'I suggest that she take a rest.',
            'Thức giả định dùng nguyên thể "take", bỏ "s".',
          ),
          mis(
            'It is vital that he is here.',
            'It is vital that he be here.',
            'Sau "vital that" dùng nguyên thể "be".',
          ),
        ],
        quiz: [
          qz('The board insists that he ___ present.', ['is', 'be'], 1),
          qz('It is important that she ___ early.', ['arrives', 'arrive'], 1),
          qz(
            'We recommend that he ___ apply again.',
            ['not', 'does not'],
            0,
            'Phủ định giả định: "that he not apply".',
          ),
        ],
      },
      {
        id: 'c1-g-wish-ifonly',
        titleVi: 'wish / if only — ước điều trái thực tế',
        titleEn: 'wish / if only',
        structure: 'wish/if only + S + quá khứ (hiện tại) / had V3 (quá khứ) / would (phàn nàn)',
        explainVi:
          'Diễn tả điều TRÁI với thực tế:\n' +
          '• Ước hiện tại: "I wish I knew the answer." (thực ra không biết).\n' +
          '• Ước quá khứ: "I wish I had studied." (thực ra đã không học).\n' +
          '• Phàn nàn/mong người khác đổi: "I wish you would stop shouting."',
        examples: [
          ex('I wish I were taller.', 'Ước gì tôi cao hơn.'),
          ex('If only I had listened to you.', 'Giá mà tôi đã nghe lời bạn.'),
          ex('I wish it would stop raining.', 'Ước gì trời ngừng mưa.'),
        ],
        tipVi:
          'Với "wish" ở hiện tại, dùng "were" cho mọi ngôi ("I wish I were..."). Ước quá khứ → "had + V3".',
        mistakes: [
          mis(
            'I wish I know the answer.',
            'I wish I knew the answer.',
            'Ước hiện tại trái thực tế → lùi về quá khứ "knew".',
          ),
          mis(
            'I wish I would have come.',
            'I wish I had come.',
            'Ước quá khứ dùng "had come", không dùng "would have".',
          ),
        ],
        quiz: [
          qz('I wish I ___ how to swim.', ['know', 'knew'], 1),
          qz('If only she ___ told me earlier.', ['had', 'has'], 0),
          qz('I wish he ___ stop complaining.', ['would', 'will'], 0),
        ],
      },
    ],
  },
  {
    id: 'c1-cohesion',
    titleVi: 'Nhượng bộ & liên kết ý',
    titleEn: 'Concession & linking ideas',
    emoji: '🧩',
    grammar: [
      {
        id: 'c1-g-concession',
        titleVi: 'despite / although / however / whereas',
        titleEn: 'Concession & contrast linkers',
        structure:
          'despite/in spite of + N/V-ing · although/though + mệnh đề · however/nevertheless (nối câu)',
        explainVi:
          'Phân biệt cách dùng khi diễn tả tương phản/nhượng bộ:\n' +
          '• despite / in spite of + DANH TỪ hoặc V-ing: "Despite the rain, ...".\n' +
          '• although / though / even though + MỆNH ĐỀ (S + V): "Although it rained, ...".\n' +
          '• however / nevertheless nối HAI câu, có dấu chấm phẩy/chấm trước: "...; however, ...".\n' +
          '• whereas / while so sánh hai điều trái nhau.',
        examples: [
          ex('Despite being tired, she kept working.', 'Dù mệt, cô ấy vẫn làm việc.'),
          ex(
            'Although the plan was risky, it worked.',
            'Mặc dù kế hoạch mạo hiểm, nó vẫn thành công.',
          ),
          ex(
            'He is quiet, whereas his brother is loud.',
            'Anh ấy trầm lặng, trong khi em trai lại ồn ào.',
          ),
        ],
        tipVi:
          'Mẹo: sau "despite/in spite of" KHÔNG có mệnh đề — nếu muốn dùng mệnh đề, thêm "the fact that".',
        mistakes: [
          mis(
            'Despite of the rain, we went out.',
            'Despite the rain, we went out.',
            '"despite" KHÔNG đi với "of"; hoặc dùng "in spite of".',
          ),
          mis(
            'Although the traffic, I arrived on time.',
            'Despite the traffic, I arrived on time.',
            'Sau "although" phải là mệnh đề; đứng trước danh từ dùng "despite".',
          ),
          mis(
            'She studied hard, however she failed.',
            'She studied hard; however, she failed.',
            '"however" nối câu cần dấu chấm phẩy trước và phẩy sau.',
          ),
        ],
        quiz: [
          qz(
            '___ his age, he runs fast.',
            ['Despite', 'Although'],
            0,
            'Trước danh từ → "Despite".',
          ),
          qz(
            '___ it was late, they continued.',
            ['Although', 'Despite'],
            0,
            'Trước mệnh đề → "Although".',
          ),
          qz('I like tea, ___ she prefers coffee.', ['whereas', 'despite'], 0),
        ],
      },
    ],
  },
]

// ══════════════════════════════════════════════════════════════════════════
// C2 — TINH THÔNG (ngữ pháp)
// ══════════════════════════════════════════════════════════════════════════
const C2_GRAMMAR_UNITS: GrammarUnitMeta[] = [
  {
    id: 'c2-inversion',
    titleVi: 'Đảo ngữ nâng cao & đưa lên đầu câu',
    titleEn: 'Advanced inversion & fronting',
    emoji: '⤴️',
    grammar: [
      {
        id: 'c2-g-adv-inversion',
        titleVi: 'So / Such / Only ... — đảo ngữ nhấn mạnh cao',
        titleEn: 'So/Such/Only inversion',
        structure:
          'So + adj + V + S + that ... · Such + be + N + that ... · Only + [cụm] + trợ ĐT + S',
        explainVi:
          'Các cấu trúc đảo ngữ trang trọng để nhấn mạnh mạnh:\n' +
          '• "So + tính từ" đầu câu: "So great was the noise that we left."\n' +
          '• "Such + be": "Such was her fear that she froze."\n' +
          '• "Only + trạng ngữ" (Only then/Only after/Only by): "Only then did I understand."',
        examples: [
          ex(
            'So difficult was the exam that many failed.',
            'Kỳ thi khó đến mức nhiều người trượt.',
          ),
          ex('Only after the meeting did she call me.', 'Chỉ sau cuộc họp cô ấy mới gọi tôi.'),
          ex(
            'Such was his talent that everyone admired him.',
            'Tài năng của anh lớn đến mức ai cũng ngưỡng mộ.',
          ),
        ],
        tipVi:
          'Sau "Only when/after/by..." mới đảo, và đảo ở MỆNH ĐỀ CHÍNH chứ không phải mệnh đề "only".',
        mistakes: [
          mis(
            'Only then I realized the truth.',
            'Only then did I realize the truth.',
            'Sau "Only then" phải đảo trợ động từ: "did I realize".',
          ),
          mis(
            'So beautiful the view was that we stayed.',
            'So beautiful was the view that we stayed.',
            'Đảo "was" lên trước "the view".',
          ),
        ],
        quiz: [
          qz('Only by working hard ___ succeed.', ['you will', 'will you'], 1),
          qz('So loud ___ the music that we shouted.', ['was', 'it was'], 0),
          qz('Only when he left ___ relaxed.', ['I felt', 'did I feel'], 1),
        ],
      },
      {
        id: 'c2-g-fronting',
        titleVi: 'Đưa thành phần lên đầu câu (fronting)',
        titleEn: 'Fronting for emphasis',
        structure: '[Tân ngữ / bổ ngữ / trạng ngữ] + S + V (đưa lên đầu để nhấn)',
        explainVi:
          'Chuyển một thành phần (thường ở cuối) lên ĐẦU câu để nhấn mạnh hoặc liên kết ý mượt hơn:\n' +
          '"I will never forget that day." → "That day I will never forget."\n' +
          'Với bổ ngữ + động từ chỉ vị trí, có thể đảo cả chủ-vị: "On the hill stood a castle."',
        examples: [
          ex('This book I really recommend.', 'Cuốn sách này thì tôi thực sự khuyên đọc.'),
          ex('Down the street came the parade.', 'Đoàn diễu hành tiến xuống phố.'),
          ex('Gone are the days of cheap oil.', 'Thời dầu rẻ đã qua rồi.'),
        ],
        tipVi:
          'Fronting hay dùng trong văn kể/miêu tả để tạo nhịp; đừng lạm dụng trong văn nói thường ngày.',
        mistakes: [
          mis(
            'Down the street the parade came marching (sai nhịp).',
            'Down the street came the parade.',
            'Khi đưa trạng ngữ chỉ nơi chốn lên đầu, đảo động từ trước chủ ngữ.',
          ),
        ],
        quiz: [
          qz('"Gone ___ the days of youth."', ['are', 'is'], 0, 'Chủ ngữ "days" số nhiều → "are".'),
          qz('Fronting dùng chủ yếu để:', ['nhấn mạnh / liên kết ý', 'đặt câu hỏi'], 0),
        ],
      },
    ],
  },
  {
    id: 'c2-ellipsis',
    titleVi: 'Lược bỏ & thay thế',
    titleEn: 'Ellipsis & substitution',
    emoji: '✂️',
    grammar: [
      {
        id: 'c2-g-ellipsis',
        titleVi: 'so / neither / do so / one — tránh lặp',
        titleEn: 'Ellipsis & substitution',
        structure: 'So + trợ ĐT + S (cũng vậy) · Neither/Nor + trợ ĐT + S · do so · one/ones',
        explainVi:
          'Người bản xứ tránh lặp từ bằng cách LƯỢC BỎ hoặc THAY THẾ:\n' +
          '• Đồng ý khẳng định: "So do I / So am I."\n' +
          '• Đồng ý phủ định: "Neither do I / Nor can she."\n' +
          '• "do so" thay cả cụm động từ; "one/ones" thay danh từ đã nhắc.',
        examples: [
          ex('"I love jazz." "So do I."', '"Tôi thích nhạc jazz." "Tôi cũng vậy."'),
          ex("She can't swim, and neither can he.", 'Cô ấy không bơi được, và anh ấy cũng thế.'),
          ex('If you want to leave, do so quietly.', 'Nếu muốn đi thì đi cho nhẹ nhàng.'),
        ],
        tipVi:
          'Trong "So do I / Neither do I", trợ động từ phải KHỚP với câu trước (do/does/did/have/am/can...).',
        mistakes: [
          mis(
            '"I am tired." "So do I."',
            '"I am tired." "So am I."',
            'Câu trước dùng "am" → đáp lại phải "So am I".',
          ),
          mis(
            'She likes it and so I do.',
            'She likes it and so do I.',
            'Cấu trúc đảo: "so + trợ ĐT + S".',
          ),
        ],
        quiz: [
          qz('"I have finished." "So ___ I."', ['have', 'do'], 0),
          qz("He won't go, and ___ will she.", ['neither', 'so'], 0),
          qz('"I can\'t drive." "___ can I."', ['Neither', 'So'], 0),
        ],
      },
    ],
  },
  {
    id: 'c2-nominalization',
    titleVi: 'Danh từ hóa & văn phong học thuật',
    titleEn: 'Nominalization & academic style',
    emoji: '🎓',
    grammar: [
      {
        id: 'c2-g-nominalization',
        titleVi: 'Danh từ hóa (nominalization)',
        titleEn: 'Nominalization',
        structure: 'động từ/tính từ → danh từ (decide → decision, able → ability)',
        explainVi:
          'Văn học thuật/trang trọng thường biến ĐỘNG TỪ hoặc TÍNH TỪ thành DANH TỪ để câu súc tích, khách quan:\n' +
          '"They decided quickly, which helped." → "Their quick decision helped."\n' +
          '"The prices increased." → "The increase in prices ...".',
        examples: [
          ex(
            'The introduction of the law reduced crime.',
            'Việc ban hành luật đã làm giảm tội phạm.',
          ),
          ex(
            'Her refusal to comment surprised us.',
            'Việc cô ấy từ chối bình luận khiến chúng tôi bất ngờ.',
          ),
          ex(
            'There was a significant improvement in results.',
            'Đã có sự cải thiện đáng kể về kết quả.',
          ),
        ],
        tipVi:
          'Danh từ hóa làm văn trang trọng hơn nhưng đừng lạm dụng — dễ khiến câu nặng nề, khó đọc.',
        mistakes: [
          mis(
            'The decide of the manager was final.',
            'The decision of the manager was final.',
            '"decide" là động từ; dạng danh từ là "decision".',
          ),
          mis(
            'They discussed about the analyse of data.',
            'They discussed the analysis of data.',
            'Danh từ của "analyse" là "analysis"; "discuss" không đi với "about".',
          ),
        ],
        quiz: [
          qz('Danh từ của "decide" là:', ['decision', 'deciding'], 0),
          qz('Danh từ của "able" là:', ['ability', 'ableness'], 0),
          qz(
            '"The ___ in temperature worried scientists." (increase/v→n)',
            ['increase', 'increased'],
            0,
          ),
        ],
      },
    ],
  },
  {
    id: 'c2-participle',
    titleVi: 'Mệnh đề phân từ & tuyệt đối',
    titleEn: 'Participle & absolute clauses',
    emoji: '🌿',
    grammar: [
      {
        id: 'c2-g-participle',
        titleVi: 'Mệnh đề phân từ & cấu trúc tuyệt đối',
        titleEn: 'Participle & absolute clauses',
        structure:
          'V-ing/V3 + mệnh đề chính · [N + phân từ] (absolute): "The weather being fine, ..."',
        explainVi:
          'Rút gọn mệnh đề trạng ngữ bằng phân từ, cho văn viết súc tích:\n' +
          '• "Because he was tired, he left." → "Being tired, he left."\n' +
          '• "After it was done, ..." → "Done, ...".\n' +
          '• Cấu trúc TUYỆT ĐỐI giữ chủ ngữ riêng: "The sun having set, we went home."',
        examples: [
          ex('Not knowing the way, we asked for help.', 'Vì không biết đường, chúng tôi hỏi thăm.'),
          ex('The meeting over, everyone left.', 'Cuộc họp kết thúc, mọi người ra về.'),
          ex(
            'Weather permitting, we will travel tomorrow.',
            'Nếu thời tiết cho phép, chúng tôi sẽ đi vào ngày mai.',
          ),
        ],
        tipVi:
          'Phân từ phải cùng chủ ngữ với mệnh đề chính, nếu không sẽ thành "dangling" (treo lơ lửng) — trừ cấu trúc tuyệt đối có chủ ngữ riêng.',
        mistakes: [
          mis(
            'Walking home, the rain started.',
            'Walking home, I got caught in the rain.',
            'Chủ ngữ của "walking" phải là người, không phải "the rain" (dangling).',
          ),
          mis(
            'The work was finished, we went home.',
            'The work finished, we went home.',
            'Cấu trúc tuyệt đối bỏ "was": "The work finished, ...".',
          ),
        ],
        quiz: [
          qz('___ tired, she took a nap.', ['Being', 'Been'], 0),
          qz(
            'The game ___, fans celebrated.',
            ['over', 'was over'],
            0,
            'Cấu trúc tuyệt đối bỏ động từ "was".',
          ),
          qz('Phân từ treo (dangling) là lỗi khi:', ['sai chủ ngữ', 'thiếu tân ngữ'], 0),
        ],
      },
    ],
  },
  {
    id: 'c2-formal-subjunctive',
    titleVi: 'Giả định trang trọng & thành ngữ cố định',
    titleEn: 'Formal subjunctive & fixed expressions',
    emoji: '🏛️',
    grammar: [
      {
        id: 'c2-g-fixed-subjunctive',
        titleVi: 'Be that as it may · Come what may · lest',
        titleEn: 'Fixed subjunctive expressions',
        structure: 'Be that as it may, ... · Come what may, ... · lest + S + (should) + V',
        explainVi:
          'Các cụm giả định CỐ ĐỊNH, rất trang trọng/văn chương:\n' +
          '• "Be that as it may" = dù thế nào đi nữa.\n' +
          '• "Come what may" = dù chuyện gì xảy ra.\n' +
          '• "lest" = kẻo, e rằng (+ nguyên thể): "Speak softly lest you wake the baby."\n' +
          '• "so be it" = thì cứ thế vậy.',
        examples: [
          ex('Be that as it may, we must proceed.', 'Dù vậy đi nữa, chúng ta vẫn phải tiến hành.'),
          ex('Come what may, I will support you.', 'Dù có chuyện gì, tôi vẫn ủng hộ bạn.'),
          ex('He wrote it down lest he forget.', 'Anh ấy ghi lại kẻo quên.'),
        ],
        tipVi:
          'Đây là cụm cố định — học nguyên khối, không dịch/ghép từng từ. Dùng khi cần giọng văn trang trọng.',
        mistakes: [
          mis(
            'Lest he forgets, he wrote it down.',
            'Lest he forget, he wrote it down.',
            'Sau "lest" dùng nguyên thể "forget" (giả định).',
          ),
          mis(
            'Be that as it may be, we go on.',
            'Be that as it may, we go on.',
            'Cụm cố định là "Be that as it may", không thêm "be" ở cuối.',
          ),
        ],
        quiz: [
          qz("___ what may, we'll finish.", ['Come', 'Comes'], 0),
          qz('Whisper ___ you wake them.', ['lest', 'unless'], 0, '"lest" = kẻo.'),
          qz('"Be that as it may" nghĩa là:', ['dù thế nào đi nữa', 'ngay lập tức'], 0),
        ],
      },
    ],
  },
  {
    id: 'c2-modality',
    titleVi: 'Sắc thái tình thái & giảm nhẹ (hedging)',
    titleEn: 'Advanced modality & hedging',
    emoji: '🎚️',
    grammar: [
      {
        id: 'c2-g-hedging',
        titleVi: 'may well · might as well · would sooner · cannot but',
        titleEn: 'Advanced modal expressions',
        structure:
          'may well + V · might/may as well + V · would sooner/rather + V · cannot (help) but + V',
        explainVi:
          'Các cụm tình thái nâng cao thể hiện sắc thái tinh tế:\n' +
          '• "may well" = rất có thể: "It may well rain."\n' +
          '• "might as well" = chẳng mất gì (nên cứ làm): "We might as well start."\n' +
          '• "would sooner/rather" = thà rằng: "I would sooner walk than wait."\n' +
          '• "cannot but / cannot help but" = không thể không: "I cannot but agree."',
        examples: [
          ex('She may well be the best candidate.', 'Cô ấy rất có thể là ứng viên xuất sắc nhất.'),
          ex(
            'Nobody is here, so we might as well leave.',
            'Chẳng có ai ở đây, nên ta về cũng được.',
          ),
          ex('I would sooner die than betray them.', 'Tôi thà chết chứ không phản bội họ.'),
        ],
        tipVi:
          'Phân biệt: "may well" (khả năng cao) khác "may as well/might as well" (chẳng có lý do gì để không làm).',
        mistakes: [
          mis(
            'I would sooner to walk than wait.',
            'I would sooner walk than wait.',
            'Sau "would sooner" dùng nguyên thể KHÔNG "to".',
          ),
          mis(
            'I cannot but to agree.',
            'I cannot but agree.',
            'Sau "cannot but" dùng nguyên thể không "to".',
          ),
        ],
        quiz: [
          qz('It ___ well snow tonight.', ['may', 'might to'], 0),
          qz("We're early; we might as well ___ a coffee.", ['grab', 'to grab'], 0),
          qz('"would sooner X than Y" nghĩa là:', ['thà X hơn Y', 'vừa X vừa Y'], 0),
        ],
      },
    ],
  },
]

// ── Mục tiêu "can-do" (CEFR) cho từng cấp ─────────────────────────────────
const C1_CAN_DO = [
  'Hiểu nhiều loại văn bản dài, đòi hỏi, và nhận ra hàm ý.',
  'Diễn đạt trôi chảy, tự nhiên, ít phải tìm từ.',
  'Dùng ngôn ngữ linh hoạt, hiệu quả cho mục đích xã hội, học thuật và công việc.',
  'Viết văn bản rõ ràng, có bố cục chặt chẽ về chủ đề phức tạp.',
  'Dùng thành thạo đảo ngữ, câu chẻ, mệnh đề rút gọn và thức giả định.',
]
const C2_CAN_DO = [
  'Hiểu hầu như mọi thứ nghe/đọc được một cách dễ dàng.',
  'Tóm tắt thông tin từ nhiều nguồn nói và viết, dựng lại lập luận mạch lạc.',
  'Diễn đạt tức thì, rất trôi chảy và chính xác, phân biệt sắc thái nghĩa tinh tế ngay trong tình huống phức tạp.',
  'Sử dụng thành ngữ, cấu trúc trang trọng và văn phong học thuật một cách tự nhiên.',
  'Làm chủ đảo ngữ nâng cao, lược bỏ, danh từ hóa và mệnh đề phân từ/tuyệt đối.',
]

// ── Hai cấp nâng cao hoàn chỉnh ───────────────────────────────────────────
export const C1_LEVEL: CefrLevel = {
  id: 'C1',
  titleVi: 'C1 — Thành thạo',
  titleEn: 'C1 — Advanced',
  subtitleVi: 'Người dùng thành thạo',
  goalVi:
    'Diễn đạt trôi chảy, tự nhiên và linh hoạt; hiểu văn bản dài, phức tạp và nắm được hàm ý.',
  accent: 'rose',
  canDo: C1_CAN_DO,
  units: buildUnits(C1_GRAMMAR_UNITS, C1_VOCAB_UNITS),
}

export const C2_LEVEL: CefrLevel = {
  id: 'C2',
  titleVi: 'C2 — Tinh thông',
  titleEn: 'C2 — Proficiency',
  subtitleVi: 'Người dùng tinh thông',
  goalVi:
    'Hiểu hầu như mọi thứ dễ dàng, diễn đạt chính xác và tinh tế như người bản xứ có học vấn cao.',
  accent: 'cyan',
  canDo: C2_CAN_DO,
  units: buildUnits(C2_GRAMMAR_UNITS, C2_VOCAB_UNITS),
}
