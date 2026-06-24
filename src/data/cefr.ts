// ──────────────────────────────────────────────────────────────────────────
// LỘ TRÌNH HỌC THEO CHUẨN CEFR (A1 → B2) — BẢN ĐẦY ĐỦ
//
// Đây là "khung lộ trình" gắn lên trên hệ thống flashcard/SRS sẵn có.
// Mỗi CẤP ĐỘ (CefrLevel) gồm:
//   - canDo[]:  các mục tiêu "Tôi có thể…" theo mô tả CEFR (tiếng Việt) — để
//               học viên biết học xong cấp này thì làm được gì.
//   - units[]:  các bài học. Mỗi unit gồm:
//       · grammar[]:      bài NGỮ PHÁP (cấu trúc + giải thích tiếng Việt + ví dụ
//                         có thể bấm nghe).
//       · vocabCircleIds: liên kết tới các "vòng" từ vựng trong
//                         src/data/curriculum.ts (FOUNDATION) để luyện flashcard.
//
// Giáo trình phủ các điểm ngữ pháp cốt lõi của từng cấp CEFR. Vẫn mở rộng được:
// thêm bài vào mảng grammar[] hoặc thêm unit vào units[] là UI tự cập nhật.
// ──────────────────────────────────────────────────────────────────────────

// Một ví dụ minh họa (Anh ↔ Việt) — dùng chung cho ngữ pháp.
export interface Example {
  en: string
  vi: string
}

// Một bài ngữ pháp nhỏ.
export interface GrammarLesson {
  id: string
  titleVi: string
  titleEn: string
  // Công thức ngắn gọn, vd: "S + am/is/are + (tính từ / danh từ)"
  structure: string
  // Giải thích cho người mới, bằng tiếng Việt (có thể nhiều dòng — xuống dòng bằng \n).
  explainVi: string
  examples: Example[]
}

// Một unit (bài học) — gom vài điểm ngữ pháp + vài chủ đề từ vựng liên quan.
export interface CefrUnit {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  grammar: GrammarLesson[]
  // id của các vòng từ vựng trong FOUNDATION (src/data/curriculum.ts)
  vocabCircleIds: string[]
}

// Một cấp độ CEFR.
export interface CefrLevel {
  id: 'A1' | 'A2' | 'B1' | 'B2'
  titleVi: string
  titleEn: string
  subtitleVi: string // vd: "Người mới bắt đầu"
  goalVi: string     // mục tiêu tổng quát của cả cấp
  // Màu nhấn (Tailwind) cho UI — dùng để phân biệt các cấp.
  accent: 'emerald' | 'sky' | 'violet' | 'amber'
  // Mục tiêu "Tôi có thể…" theo CEFR (tiếng Việt).
  canDo: string[]
  units: CefrUnit[]
}

// Rút gọn: hàm tạo 1 ví dụ.
const ex = (en: string, vi: string): Example => ({ en, vi })

export const CEFR_LEVELS: CefrLevel[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // A1 — NGƯỜI MỚI BẮT ĐẦU
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'A1',
    titleVi: 'A1 — Sơ cấp',
    titleEn: 'A1 — Beginner',
    subtitleVi: 'Người mới bắt đầu',
    goalVi: 'Chào hỏi, giới thiệu bản thân và gia đình, nói về đồ vật quen thuộc và đặt câu hỏi đơn giản.',
    accent: 'emerald',
    canDo: [
      'Tôi có thể chào hỏi và giới thiệu tên, tuổi, quốc tịch của mình.',
      'Tôi có thể nói về gia đình và những người thân quen.',
      'Tôi có thể gọi tên đồ vật, màu sắc, con số và thời gian.',
      'Tôi có thể nói mình thích gì, có thể làm gì.',
      'Tôi có thể đặt và trả lời câu hỏi đơn giản về thông tin cá nhân.',
    ],
    units: [
      {
        id: 'a1-greetings',
        titleVi: 'Chào hỏi & giới thiệu bản thân',
        titleEn: 'Greetings & Introductions',
        emoji: '👋',
        vocabCircleIds: ['greetings', 'letters'],
        grammar: [
          {
            id: 'a1-be',
            titleVi: 'Động từ "to be" (am / is / are)',
            titleEn: 'The verb "to be"',
            structure: 'S + am / is / are + (tính từ • danh từ • nơi chốn)',
            explainVi:
              '"To be" nghĩa là "thì, là, ở". Đây là động từ quan trọng nhất khi mới học.\n' +
              '• I → am   • He/She/It → is   • You/We/They → are\n' +
              'Dùng để nói bạn LÀ ai, NHƯ THẾ NÀO, hoặc Ở ĐÂU.',
            examples: [
              ex('I am a student.', 'Tôi là học sinh.'),
              ex('She is happy.', 'Cô ấy vui.'),
              ex('We are from Vietnam.', 'Chúng tôi đến từ Việt Nam.'),
            ],
          },
          {
            id: 'a1-be-negative',
            titleVi: 'Phủ định với "to be" (am not / isn\'t / aren\'t)',
            titleEn: 'Negative with "to be"',
            structure: 'S + am/is/are + not + …',
            explainVi:
              'Thêm "not" sau to be để nói "không".\n' +
              'Viết tắt: is not → isn\'t, are not → aren\'t (am not không có dạng tắt).',
            examples: [
              ex('I am not tired.', 'Tôi không mệt.'),
              ex('He isn\'t at home.', 'Anh ấy không có ở nhà.'),
              ex('They aren\'t students.', 'Họ không phải học sinh.'),
            ],
          },
          {
            id: 'a1-pronouns',
            titleVi: 'Đại từ nhân xưng (I, you, he, she…)',
            titleEn: 'Subject pronouns',
            structure: 'I • you • he • she • it • we • they + động từ',
            explainVi:
              'Đại từ nhân xưng đứng đầu câu để chỉ người/vật làm hành động.\n' +
              'I (tôi), you (bạn), he (anh ấy), she (cô ấy), it (nó), we (chúng tôi), they (họ).',
            examples: [
              ex('He is my brother.', 'Anh ấy là anh trai tôi.'),
              ex('They are teachers.', 'Họ là giáo viên.'),
              ex('It is a book.', 'Đó là một cuốn sách.'),
            ],
          },
        ],
      },
      {
        id: 'a1-family',
        titleVi: 'Gia đình & sự sở hữu',
        titleEn: 'Family & Possession',
        emoji: '👪',
        vocabCircleIds: ['family'],
        grammar: [
          {
            id: 'a1-have',
            titleVi: 'Have / Has — "có"',
            titleEn: 'Have / Has',
            structure: 'I/You/We/They + have • He/She/It + has',
            explainVi:
              '"Have/Has" nghĩa là "có" (sở hữu).\n' +
              '• I, you, we, they → have   • he, she, it → has',
            examples: [
              ex('I have two sisters.', 'Tôi có hai chị/em gái.'),
              ex('She has a new phone.', 'Cô ấy có điện thoại mới.'),
              ex('They have a big house.', 'Họ có một ngôi nhà lớn.'),
            ],
          },
          {
            id: 'a1-possessive',
            titleVi: 'Tính từ sở hữu (my, your, his…)',
            titleEn: 'Possessive adjectives',
            structure: 'my • your • his • her • its • our • their + danh từ',
            explainVi:
              'Đặt trước danh từ để chỉ "của ai".\n' +
              'I→my, you→your, he→his, she→her, it→its, we→our, they→their.',
            examples: [
              ex('This is my mother.', 'Đây là mẹ tôi.'),
              ex('Her name is Lan.', 'Tên cô ấy là Lan.'),
              ex('Our family is small.', 'Gia đình tôi nhỏ.'),
            ],
          },
          {
            id: 'a1-possessive-s',
            titleVi: 'Sở hữu cách ("\'s")',
            titleEn: "Possessive 's",
            structure: 'tên/người + \'s + danh từ',
            explainVi:
              'Thêm \'s vào sau tên người để chỉ "của ai đó".\n' +
              'Lan\'s book = cuốn sách của Lan.',
            examples: [
              ex("This is Lan's bag.", 'Đây là túi của Lan.'),
              ex("My father's car is red.", 'Xe của bố tôi màu đỏ.'),
              ex("The dog's name is Max.", 'Tên con chó là Max.'),
            ],
          },
        ],
      },
      {
        id: 'a1-things',
        titleVi: 'Đồ vật & nơi chốn',
        titleEn: 'Things & Places',
        emoji: '🏠',
        vocabCircleIds: ['home', 'colors'],
        grammar: [
          {
            id: 'a1-there-is',
            titleVi: 'There is / There are — "có (tồn tại)"',
            titleEn: 'There is / There are',
            structure: 'There is + danh từ số ít • There are + danh từ số nhiều',
            explainVi:
              'Dùng để nói "có cái gì đó tồn tại ở đâu".\n' +
              '• There is + 1 vật   • There are + nhiều vật.',
            examples: [
              ex('There is a book on the table.', 'Có một cuốn sách trên bàn.'),
              ex('There are four chairs in the room.', 'Có bốn cái ghế trong phòng.'),
              ex('Is there a bank near here?', 'Gần đây có ngân hàng không?'),
            ],
          },
          {
            id: 'a1-demonstratives',
            titleVi: 'This / That / These / Those',
            titleEn: 'Demonstratives',
            structure: 'this/that + số ít • these/those + số nhiều',
            explainVi:
              'Chỉ vật ở gần hay xa.\n' +
              '• this (này – gần), that (kia – xa)\n' +
              '• these (những… này – gần), those (những… kia – xa)',
            examples: [
              ex('This is my pen.', 'Đây là cây bút của tôi.'),
              ex('That is your bag.', 'Kia là túi của bạn.'),
              ex('These shoes are new.', 'Đôi giày này mới.'),
            ],
          },
          {
            id: 'a1-prep-place',
            titleVi: 'Giới từ chỉ nơi chốn (in, on, under…)',
            titleEn: 'Prepositions of place',
            structure: 'in • on • under • next to • behind + nơi chốn',
            explainVi:
              'Cho biết vật nằm ở đâu.\n' +
              'in (trong), on (trên), under (dưới), next to (cạnh), behind (sau).',
            examples: [
              ex('The cat is under the table.', 'Con mèo ở dưới bàn.'),
              ex('Your phone is on the bed.', 'Điện thoại của bạn ở trên giường.'),
              ex('The shop is next to the bank.', 'Cửa hàng ở cạnh ngân hàng.'),
            ],
          },
        ],
      },
      {
        id: 'a1-numbers-time',
        titleVi: 'Số, thời gian & lịch',
        titleEn: 'Numbers, Time & Calendar',
        emoji: '🔢',
        vocabCircleIds: ['numbers', 'time', 'months'],
        grammar: [
          {
            id: 'a1-plural',
            titleVi: 'Danh từ số nhiều (thêm -s / -es)',
            titleEn: 'Plural nouns',
            structure: 'danh từ + -s / -es',
            explainVi:
              'Khi có nhiều hơn một, thêm -s vào danh từ.\n' +
              '• one book → two books   • một số từ thêm -es: box → boxes.',
            examples: [
              ex('I have three cats.', 'Tôi có ba con mèo.'),
              ex('There are seven days in a week.', 'Một tuần có bảy ngày.'),
              ex('She buys two boxes.', 'Cô ấy mua hai cái hộp.'),
            ],
          },
          {
            id: 'a1-articles',
            titleVi: 'Mạo từ a / an / the',
            titleEn: 'Articles a / an / the',
            structure: 'a/an + danh từ chung • the + danh từ xác định',
            explainVi:
              '• a / an = "một" (nhắc lần đầu). Dùng "an" trước nguyên âm (a, e, i, o, u).\n' +
              '• the = "cái đó" (đã biết rõ là cái nào).',
            examples: [
              ex('I have a dog.', 'Tôi có một con chó.'),
              ex('She eats an apple.', 'Cô ấy ăn một quả táo.'),
              ex('The dog is friendly.', 'Con chó đó thân thiện.'),
            ],
          },
          {
            id: 'a1-how-many',
            titleVi: 'Hỏi số lượng (How many…?)',
            titleEn: 'How many…?',
            structure: 'How many + danh từ số nhiều + are there?',
            explainVi:
              'Dùng "How many" để hỏi "có bao nhiêu" với danh từ đếm được.',
            examples: [
              ex('How many books do you have?', 'Bạn có bao nhiêu cuốn sách?'),
              ex('How many people are there?', 'Có bao nhiêu người?'),
              ex('How many days are in May?', 'Tháng Năm có bao nhiêu ngày?'),
            ],
          },
        ],
      },
      {
        id: 'a1-actions',
        titleVi: 'Hành động & khả năng',
        titleEn: 'Actions & Ability',
        emoji: '🏃',
        vocabCircleIds: ['verbs', 'food'],
        grammar: [
          {
            id: 'a1-present-basic',
            titleVi: 'Hiện tại đơn cơ bản (I like / want / have)',
            titleEn: 'Basic present (like / want / have)',
            structure: 'I/You/We/They + động từ nguyên mẫu',
            explainVi:
              'Nói điều bạn thích, muốn, làm thường ngày. Với I/you/we/they giữ nguyên động từ.',
            examples: [
              ex('I like coffee.', 'Tôi thích cà phê.'),
              ex('I want some water.', 'Tôi muốn chút nước.'),
              ex('We eat rice every day.', 'Chúng tôi ăn cơm mỗi ngày.'),
            ],
          },
          {
            id: 'a1-can',
            titleVi: 'Can — diễn tả khả năng',
            titleEn: 'Can (ability)',
            structure: 'S + can / can\'t + động từ nguyên mẫu',
            explainVi:
              '"Can" = "có thể". Sau "can" luôn dùng động từ nguyên mẫu (không thêm -s).\n' +
              'Phủ định: cannot / can\'t.',
            examples: [
              ex('I can swim.', 'Tôi biết bơi.'),
              ex('She can speak English.', 'Cô ấy nói được tiếng Anh.'),
              ex("He can't cook.", 'Anh ấy không biết nấu ăn.'),
            ],
          },
          {
            id: 'a1-imperative',
            titleVi: 'Câu mệnh lệnh (Open the door!)',
            titleEn: 'Imperatives',
            structure: 'Động từ nguyên mẫu + … (không có chủ ngữ)',
            explainVi:
              'Dùng để ra lệnh, hướng dẫn, mời. Bắt đầu bằng động từ.\n' +
              'Phủ định: Don\'t + động từ.',
            examples: [
              ex('Open the window, please.', 'Làm ơn mở cửa sổ.'),
              ex('Sit down.', 'Ngồi xuống.'),
              ex("Don't worry.", 'Đừng lo lắng.'),
            ],
          },
        ],
      },
      {
        id: 'a1-questions',
        titleVi: 'Hỏi đáp & đại từ tân ngữ',
        titleEn: 'Questions & Object Pronouns',
        emoji: '❓',
        vocabCircleIds: ['questions', 'body'],
        grammar: [
          {
            id: 'a1-yesno',
            titleVi: 'Câu hỏi Yes/No với "to be"',
            titleEn: 'Yes/No questions with be',
            structure: 'Am / Is / Are + S + …?',
            explainVi:
              'Đảo "to be" lên đầu câu để hỏi. Trả lời: Yes, I am. / No, I am not.',
            examples: [
              ex('Are you a student?', 'Bạn có phải học sinh không?'),
              ex('Is she your sister?', 'Cô ấy là chị/em gái bạn à?'),
              ex('Yes, I am. / No, I am not.', 'Vâng, đúng vậy. / Không, không phải.'),
            ],
          },
          {
            id: 'a1-wh',
            titleVi: 'Câu hỏi Wh- (What, Where, Who…)',
            titleEn: 'Wh- questions',
            structure: 'Wh-word + am/is/are + S + …?',
            explainVi:
              'Hỏi thông tin cụ thể.\n' +
              'What (cái gì), Where (ở đâu), Who (ai), When (khi nào), How (như thế nào).',
            examples: [
              ex('What is your name?', 'Tên bạn là gì?'),
              ex('Where are you from?', 'Bạn đến từ đâu?'),
              ex('How old are you?', 'Bạn bao nhiêu tuổi?'),
            ],
          },
          {
            id: 'a1-object-pronouns',
            titleVi: 'Đại từ tân ngữ (me, him, her…)',
            titleEn: 'Object pronouns',
            structure: 'động từ / giới từ + me • you • him • her • it • us • them',
            explainVi:
              'Đứng SAU động từ hoặc giới từ (nhận hành động).\n' +
              'I→me, you→you, he→him, she→her, it→it, we→us, they→them.',
            examples: [
              ex('Please help me.', 'Làm ơn giúp tôi.'),
              ex('I love her.', 'Tôi yêu cô ấy.'),
              ex('Call us tomorrow.', 'Gọi cho chúng tôi ngày mai nhé.'),
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // A2 — SƠ CẤP NÂNG CAO
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'A2',
    titleVi: 'A2 — Sơ trung cấp',
    titleEn: 'A2 — Elementary',
    subtitleVi: 'Giao tiếp đời thường đơn giản',
    goalVi: 'Nói về thói quen, kể chuyện quá khứ, mô tả và so sánh, nói về số lượng và mua sắm.',
    accent: 'sky',
    canDo: [
      'Tôi có thể kể về thói quen và lịch sinh hoạt hằng ngày.',
      'Tôi có thể kể lại những việc đã xảy ra trong quá khứ.',
      'Tôi có thể nói về việc đang diễn ra và kế hoạch sắp tới.',
      'Tôi có thể so sánh người, vật, nơi chốn quen thuộc.',
      'Tôi có thể hỏi giá, nói về số lượng và đi mua sắm.',
    ],
    units: [
      {
        id: 'a2-routine',
        titleVi: 'Thói quen hằng ngày',
        titleEn: 'Daily Routine',
        emoji: '🌅',
        vocabCircleIds: ['cooking', 'fruits-veggies'],
        grammar: [
          {
            id: 'a2-present-simple',
            titleVi: 'Hiện tại đơn (Present Simple)',
            titleEn: 'Present Simple',
            structure: 'S + V(-s/-es) • He/She/It thêm -s',
            explainVi:
              'Diễn tả thói quen, sự thật hiển nhiên.\n' +
              '• I/you/we/they + V   • he/she/it + V-s',
            examples: [
              ex('I get up at six every day.', 'Tôi dậy lúc sáu giờ mỗi ngày.'),
              ex('She works in a hospital.', 'Cô ấy làm việc ở bệnh viện.'),
              ex('The sun rises in the east.', 'Mặt trời mọc ở hướng đông.'),
            ],
          },
          {
            id: 'a2-present-simple-neg',
            titleVi: 'Phủ định & câu hỏi (do / does)',
            titleEn: 'Negatives & questions (do/does)',
            structure: "S + don't/doesn't + V • Do/Does + S + V?",
            explainVi:
              'Dùng "do/does" làm trợ động từ.\n' +
              '• I/you/we/they → don\'t / Do…?   • he/she/it → doesn\'t / Does…?\n' +
              'Sau do/does, động từ trở về nguyên mẫu (bỏ -s).',
            examples: [
              ex("I don't drink coffee.", 'Tôi không uống cà phê.'),
              ex("She doesn't eat meat.", 'Cô ấy không ăn thịt.'),
              ex('Do you like Vietnamese food?', 'Bạn có thích món Việt không?'),
            ],
          },
          {
            id: 'a2-adverbs-freq',
            titleVi: 'Trạng từ tần suất (always, often…)',
            titleEn: 'Adverbs of frequency',
            structure: 'S + [always/usually/often/sometimes/never] + V',
            explainVi:
              'Cho biết bạn làm việc gì thường xuyên đến mức nào. Đứng TRƯỚC động từ thường, nhưng SAU "to be".',
            examples: [
              ex('I always brush my teeth in the morning.', 'Tôi luôn đánh răng vào buổi sáng.'),
              ex('He never eats meat.', 'Anh ấy không bao giờ ăn thịt.'),
              ex('She is usually late.', 'Cô ấy thường hay trễ.'),
            ],
          },
        ],
      },
      {
        id: 'a2-past',
        titleVi: 'Kể chuyện quá khứ',
        titleEn: 'Talking about the Past',
        emoji: '⏪',
        vocabCircleIds: ['transport', 'animals'],
        grammar: [
          {
            id: 'a2-was-were',
            titleVi: 'Was / Were (quá khứ của "to be")',
            titleEn: 'Was / Were',
            structure: 'I/He/She/It + was • You/We/They + were',
            explainVi: '"Was/Were" là dạng quá khứ của "to be". Dùng để mô tả trạng thái trong quá khứ.',
            examples: [
              ex('I was tired last night.', 'Tối qua tôi mệt.'),
              ex('They were at home.', 'Họ đã ở nhà.'),
              ex('Were you happy?', 'Bạn đã vui chứ?'),
            ],
          },
          {
            id: 'a2-past-simple',
            titleVi: 'Quá khứ đơn (Past Simple)',
            titleEn: 'Past Simple',
            structure: 'S + V2/V-ed (+ thời gian quá khứ)',
            explainVi:
              'Diễn tả việc đã xảy ra và kết thúc trong quá khứ.\n' +
              '• Động từ có quy tắc: thêm -ed (work → worked)\n' +
              '• Động từ bất quy tắc phải học thuộc (go → went, see → saw).',
            examples: [
              ex('I visited my grandmother yesterday.', 'Hôm qua tôi thăm bà.'),
              ex('We went to the beach last week.', 'Tuần trước chúng tôi đi biển.'),
              ex('She saw a good film.', 'Cô ấy đã xem một bộ phim hay.'),
            ],
          },
          {
            id: 'a2-past-neg',
            titleVi: 'Phủ định & câu hỏi quá khứ (did)',
            titleEn: 'Past negatives & questions (did)',
            structure: "S + didn't + V • Did + S + V?",
            explainVi:
              'Dùng "did" cho mọi chủ ngữ. Sau "did/didn\'t", động từ trở về nguyên mẫu.',
            examples: [
              ex("I didn't go to work yesterday.", 'Hôm qua tôi không đi làm.'),
              ex('Did you see the news?', 'Bạn có xem tin tức không?'),
              ex("She didn't call me.", 'Cô ấy đã không gọi cho tôi.'),
            ],
          },
        ],
      },
      {
        id: 'a2-continuous',
        titleVi: 'Đang diễn ra & kế hoạch',
        titleEn: 'Now & Future Plans',
        emoji: '⏳',
        vocabCircleIds: ['weather', 'clothing', 'travel'],
        grammar: [
          {
            id: 'a2-present-cont',
            titleVi: 'Hiện tại tiếp diễn (Present Continuous)',
            titleEn: 'Present Continuous',
            structure: 'S + am/is/are + V-ing',
            explainVi:
              'Diễn tả việc đang xảy ra ngay lúc nói. Ghép "to be" + động từ thêm -ing.',
            examples: [
              ex('I am reading a book now.', 'Bây giờ tôi đang đọc sách.'),
              ex('It is raining outside.', 'Bên ngoài trời đang mưa.'),
              ex('They are playing football.', 'Họ đang chơi bóng đá.'),
            ],
          },
          {
            id: 'a2-going-to',
            titleVi: 'Be going to (kế hoạch tương lai)',
            titleEn: 'Be going to',
            structure: 'S + am/is/are + going to + V',
            explainVi:
              'Diễn tả dự định, kế hoạch đã có sẵn hoặc điều sắp xảy ra theo dấu hiệu.',
            examples: [
              ex('I am going to visit my family this weekend.', 'Cuối tuần này tôi sẽ về thăm gia đình.'),
              ex('It is going to rain.', 'Trời sắp mưa.'),
              ex('They are going to buy a new car.', 'Họ định mua xe mới.'),
            ],
          },
        ],
      },
      {
        id: 'a2-compare',
        titleVi: 'Mô tả & so sánh',
        titleEn: 'Describing & Comparing',
        emoji: '⚖️',
        vocabCircleIds: ['adjectives', 'personality'],
        grammar: [
          {
            id: 'a2-comparative',
            titleVi: 'So sánh hơn & nhất',
            titleEn: 'Comparative & Superlative',
            structure: 'tính từ + -er… than • the + tính từ + -est',
            explainVi:
              '• Tính từ ngắn: thêm -er (so sánh hơn), -est (so sánh nhất). big → bigger → the biggest.\n' +
              '• Tính từ dài: more/most. beautiful → more beautiful → the most beautiful.',
            examples: [
              ex('My house is bigger than yours.', 'Nhà tôi to hơn nhà bạn.'),
              ex('She is the tallest in the class.', 'Cô ấy cao nhất lớp.'),
              ex('This film is more interesting.', 'Bộ phim này hay hơn.'),
            ],
          },
          {
            id: 'a2-adverbs-manner',
            titleVi: 'Trạng từ chỉ cách thức (quickly, slowly…)',
            titleEn: 'Adverbs of manner',
            structure: 'động từ + tính từ + -ly',
            explainVi:
              'Cho biết hành động được làm NHƯ THẾ NÀO. Thường thêm -ly vào tính từ.\n' +
              'quick → quickly, slow → slowly. (Bất quy tắc: good → well.)',
            examples: [
              ex('She speaks English fluently.', 'Cô ấy nói tiếng Anh trôi chảy.'),
              ex('He drives carefully.', 'Anh ấy lái xe cẩn thận.'),
              ex('They work well together.', 'Họ làm việc ăn ý với nhau.'),
            ],
          },
        ],
      },
      {
        id: 'a2-shopping',
        titleVi: 'Số lượng & mua sắm',
        titleEn: 'Quantity & Shopping',
        emoji: '🛒',
        vocabCircleIds: ['shopping'],
        grammar: [
          {
            id: 'a2-countable',
            titleVi: 'Danh từ đếm được / không đếm được',
            titleEn: 'Countable & uncountable nouns',
            structure: 'a/an + đếm được • some/much + không đếm được',
            explainVi:
              '• Đếm được: có số nhiều (apple → apples).\n' +
              '• Không đếm được: không có số nhiều (water, rice, money) — không dùng "a/an".',
            examples: [
              ex('I have two apples.', 'Tôi có hai quả táo.'),
              ex('There is some water in the glass.', 'Có chút nước trong ly.'),
              ex('How much money do you have?', 'Bạn có bao nhiêu tiền?'),
            ],
          },
          {
            id: 'a2-some-any',
            titleVi: 'Some / Any / How much / How many',
            titleEn: 'Some / Any / How much / many',
            structure: 'some (câu khẳng định) • any (phủ định/câu hỏi)',
            explainVi:
              '• some: dùng trong câu khẳng định.\n' +
              '• any: dùng trong câu phủ định và câu hỏi.\n' +
              '• how many + đếm được, how much + không đếm được.',
            examples: [
              ex('I have some questions.', 'Tôi có vài câu hỏi.'),
              ex("There isn't any milk.", 'Không còn chút sữa nào.'),
              ex('How much does it cost?', 'Cái này giá bao nhiêu?'),
            ],
          },
          {
            id: 'a2-would-like',
            titleVi: "Would like (muốn — lịch sự)",
            titleEn: 'Would like',
            structure: "S + would like + danh từ / to + V",
            explainVi:
              '"Would like" = "muốn" một cách lịch sự (lịch sự hơn "want"). Viết tắt: I\'d like.',
            examples: [
              ex("I'd like a cup of coffee, please.", 'Cho tôi một tách cà phê.'),
              ex('Would you like some tea?', 'Bạn dùng chút trà nhé?'),
              ex("She'd like to learn English.", 'Cô ấy muốn học tiếng Anh.'),
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // B1 — TRUNG CẤP
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'B1',
    titleVi: 'B1 — Trung cấp',
    titleEn: 'B1 — Intermediate',
    subtitleVi: 'Tự tin trong giao tiếp hằng ngày',
    goalVi: 'Nói về kinh nghiệm, kế hoạch tương lai, điều kiện, lời khuyên và dùng mệnh đề phức.',
    accent: 'violet',
    canDo: [
      'Tôi có thể nói về kinh nghiệm và những việc đã làm trong đời.',
      'Tôi có thể nói về kế hoạch và dự đoán tương lai.',
      'Tôi có thể diễn đạt điều kiện ("nếu… thì…").',
      'Tôi có thể đưa ra lời khuyên và nói về bổn phận.',
      'Tôi có thể nối câu bằng mệnh đề quan hệ và dùng động từ + V-ing/to-V.',
    ],
    units: [
      {
        id: 'b1-experience',
        titleVi: 'Kinh nghiệm & trải nghiệm',
        titleEn: 'Experiences',
        emoji: '🌍',
        vocabCircleIds: ['sports', 'emotions', 'media'],
        grammar: [
          {
            id: 'b1-present-perfect',
            titleVi: 'Hiện tại hoàn thành (Present Perfect)',
            titleEn: 'Present Perfect',
            structure: 'S + have/has + V3 (quá khứ phân từ)',
            explainVi:
              'Diễn tả trải nghiệm hoặc việc xảy ra trong quá khứ nhưng còn liên quan tới hiện tại.\n' +
              'Thường đi với: ever, never, already, yet, just.',
            examples: [
              ex('I have visited Japan twice.', 'Tôi đã đến Nhật hai lần.'),
              ex('She has never eaten durian.', 'Cô ấy chưa từng ăn sầu riêng.'),
              ex('Have you finished your homework yet?', 'Bạn làm xong bài tập chưa?'),
            ],
          },
          {
            id: 'b1-for-since',
            titleVi: 'For / Since (khoảng thời gian)',
            titleEn: 'For / Since',
            structure: 'have/has + V3 + for + khoảng / since + mốc',
            explainVi:
              '• for + khoảng thời gian (for two years — trong hai năm).\n' +
              '• since + mốc bắt đầu (since 2020 — từ năm 2020).',
            examples: [
              ex('I have lived here for ten years.', 'Tôi đã sống ở đây mười năm.'),
              ex('She has worked here since 2019.', 'Cô ấy làm ở đây từ năm 2019.'),
              ex("We've known each other for a long time.", 'Chúng tôi quen nhau đã lâu.'),
            ],
          },
          {
            id: 'b1-pp-vs-past',
            titleVi: 'Hiện tại hoàn thành vs. Quá khứ đơn',
            titleEn: 'Present Perfect vs Past Simple',
            structure: 'have/has + V3 (chưa rõ lúc nào) • V2 (rõ thời điểm)',
            explainVi:
              '• Quá khứ đơn: có mốc thời gian rõ ràng (yesterday, in 2010).\n' +
              '• Hiện tại hoàn thành: không nói rõ khi nào, nhấn vào kết quả/kinh nghiệm.',
            examples: [
              ex('I have been to Paris.', 'Tôi đã từng đến Paris.'),
              ex('I went to Paris in 2018.', 'Tôi đến Paris vào năm 2018.'),
              ex('Have you seen this film? — Yes, I saw it last week.', 'Bạn xem phim này chưa? — Rồi, tuần trước tôi xem.'),
            ],
          },
        ],
      },
      {
        id: 'b1-future',
        titleVi: 'Kế hoạch & dự đoán tương lai',
        titleEn: 'Future Plans & Predictions',
        emoji: '🔮',
        vocabCircleIds: ['jobs'],
        grammar: [
          {
            id: 'b1-will-going-to',
            titleVi: 'Will vs. Be going to',
            titleEn: 'Will vs. Be going to',
            structure: 'S + will + V • S + am/is/are + going to + V',
            explainVi:
              '• will: quyết định ngay lúc nói, dự đoán, lời hứa.\n' +
              '• be going to: dự định đã có sẵn, hoặc điều sắp xảy ra dựa vào dấu hiệu.',
            examples: [
              ex('I think it will rain tomorrow.', 'Tôi nghĩ mai trời sẽ mưa.'),
              ex('I am going to start a new job.', 'Tôi sắp bắt đầu công việc mới.'),
              ex("Don't worry, I'll help you.", 'Đừng lo, tôi sẽ giúp bạn.'),
            ],
          },
          {
            id: 'b1-present-cont-future',
            titleVi: 'Hiện tại tiếp diễn cho tương lai (lịch hẹn)',
            titleEn: 'Present Continuous for future',
            structure: 'S + am/is/are + V-ing + thời gian tương lai',
            explainVi:
              'Dùng cho cuộc hẹn, sắp xếp đã chốt (có thời gian/địa điểm cụ thể).',
            examples: [
              ex('I am meeting my boss at 3 p.m.', 'Tôi gặp sếp lúc 3 giờ chiều.'),
              ex('We are flying to Da Nang on Friday.', 'Thứ Sáu chúng tôi bay đi Đà Nẵng.'),
              ex('She is having dinner with friends tonight.', 'Tối nay cô ấy ăn tối với bạn bè.'),
            ],
          },
        ],
      },
      {
        id: 'b1-conditionals',
        titleVi: 'Câu điều kiện',
        titleEn: 'Conditionals',
        emoji: '🔀',
        vocabCircleIds: ['nature'],
        grammar: [
          {
            id: 'b1-cond-0',
            titleVi: 'Điều kiện loại 0 (sự thật)',
            titleEn: 'Zero Conditional',
            structure: 'If + S + V(hiện tại), S + V(hiện tại)',
            explainVi:
              'Diễn tả sự thật luôn đúng, quy luật tự nhiên. Cả hai vế đều ở hiện tại đơn.',
            examples: [
              ex('If you heat water, it boils.', 'Nếu đun nước, nó sôi.'),
              ex('Ice melts if the weather is hot.', 'Băng tan nếu trời nóng.'),
              ex('If you mix blue and yellow, you get green.', 'Trộn xanh dương với vàng thì ra xanh lá.'),
            ],
          },
          {
            id: 'b1-cond-1',
            titleVi: 'Điều kiện loại 1 (có thật ở tương lai)',
            titleEn: 'First Conditional',
            structure: 'If + S + V(hiện tại), S + will + V',
            explainVi:
              'Điều kiện có khả năng xảy ra ở tương lai. Vế "if" dùng hiện tại đơn, vế chính dùng "will".',
            examples: [
              ex('If it rains, I will stay home.', 'Nếu trời mưa, tôi sẽ ở nhà.'),
              ex('If you study hard, you will pass.', 'Nếu học chăm, bạn sẽ đậu.'),
              ex("If we leave now, we won't be late.", 'Nếu đi bây giờ, chúng ta sẽ không trễ.'),
            ],
          },
          {
            id: 'b1-time-clauses',
            titleVi: 'Mệnh đề thời gian (when / as soon as)',
            titleEn: 'Time clauses',
            structure: 'when / as soon as / before / after + S + V(hiện tại), S + will + V',
            explainVi:
              'Sau when, as soon as, before, after… nói về tương lai, vẫn dùng HIỆN TẠI (không dùng will).',
            examples: [
              ex('I will call you when I arrive.', 'Tôi sẽ gọi bạn khi tôi đến nơi.'),
              ex('As soon as he comes, we will start.', 'Ngay khi anh ấy đến, chúng ta sẽ bắt đầu.'),
              ex('Turn off the lights before you leave.', 'Tắt đèn trước khi bạn rời đi.'),
            ],
          },
        ],
      },
      {
        id: 'b1-modals',
        titleVi: 'Lời khuyên & bổn phận',
        titleEn: 'Advice & Obligation',
        emoji: '💡',
        vocabCircleIds: ['city-places'],
        grammar: [
          {
            id: 'b1-should',
            titleVi: 'Should / Ought to (lời khuyên)',
            titleEn: 'Should / Ought to',
            structure: 'S + should / ought to + V (nguyên mẫu)',
            explainVi:
              '"Should" = "nên" (đưa lời khuyên). Phủ định: shouldn\'t (không nên).',
            examples: [
              ex('You should see a doctor.', 'Bạn nên đi khám bác sĩ.'),
              ex("You shouldn't eat too much sugar.", 'Bạn không nên ăn quá nhiều đường.'),
              ex('We ought to leave early.', 'Chúng ta nên đi sớm.'),
            ],
          },
          {
            id: 'b1-must-have-to',
            titleVi: 'Must / Have to / Mustn\'t',
            titleEn: 'Must / Have to / Mustn\'t',
            structure: 'S + must / have to + V • mustn\'t = cấm',
            explainVi:
              '• must / have to: phải (bắt buộc).\n' +
              '• mustn\'t: cấm, không được phép.\n' +
              '• don\'t have to: không cần thiết (khác mustn\'t!).',
            examples: [
              ex('You must wear a helmet.', 'Bạn phải đội mũ bảo hiểm.'),
              ex('I have to work on Saturday.', 'Tôi phải làm việc thứ Bảy.'),
              ex("You don't have to come if you're busy.", 'Bạn không nhất thiết phải đến nếu bận.'),
            ],
          },
        ],
      },
      {
        id: 'b1-clauses',
        titleVi: 'Mệnh đề & dạng động từ',
        titleEn: 'Clauses & Verb Forms',
        emoji: '🔗',
        vocabCircleIds: ['school'],
        grammar: [
          {
            id: 'b1-relative',
            titleVi: 'Mệnh đề quan hệ (who / which / that)',
            titleEn: 'Defining relative clauses',
            structure: 'danh từ + who (người) / which (vật) / that + …',
            explainVi:
              'Dùng để mô tả thêm cho danh từ, nối hai câu thành một.\n' +
              'who → người, which → vật, that → cả hai.',
            examples: [
              ex('The man who lives next door is a doctor.', 'Người đàn ông sống cạnh nhà là bác sĩ.'),
              ex('This is the book which I told you about.', 'Đây là cuốn sách tôi đã kể với bạn.'),
              ex("She's the teacher that helped me.", 'Cô ấy là giáo viên đã giúp tôi.'),
            ],
          },
          {
            id: 'b1-gerund-infinitive',
            titleVi: 'Động từ + V-ing / to + V',
            titleEn: 'Gerund vs. Infinitive',
            structure: 'enjoy/like + V-ing • want/decide + to + V',
            explainVi:
              'Sau một số động từ dùng V-ing (enjoy, finish, avoid), sau số khác dùng to-V (want, decide, hope, need).',
            examples: [
              ex('I enjoy reading books.', 'Tôi thích đọc sách.'),
              ex('She wants to travel the world.', 'Cô ấy muốn đi khắp thế giới.'),
              ex('They decided to move to the city.', 'Họ quyết định chuyển lên thành phố.'),
            ],
          },
          {
            id: 'b1-used-to',
            titleVi: 'Used to (thói quen trong quá khứ)',
            titleEn: 'Used to',
            structure: 'S + used to + V (nguyên mẫu)',
            explainVi:
              'Diễn tả thói quen hoặc trạng thái trong quá khứ mà bây giờ không còn nữa.',
            examples: [
              ex('I used to play football every day.', 'Hồi xưa tôi chơi bóng đá mỗi ngày.'),
              ex('She used to live in Hanoi.', 'Trước đây cô ấy sống ở Hà Nội.'),
              ex("They didn't use to have a car.", 'Trước đây họ không có ô tô.'),
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // B2 — TRUNG CAO CẤP
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'B2',
    titleVi: 'B2 — Trung cao cấp',
    titleEn: 'B2 — Upper-Intermediate',
    subtitleVi: 'Diễn đạt trôi chảy & tự nhiên',
    goalVi: 'Dùng câu giả định, câu bị động, tường thuật, suy đoán và thành ngữ một cách tự nhiên.',
    accent: 'amber',
    canDo: [
      'Tôi có thể nói về tình huống giả định trái với thực tế và điều tiếc nuối.',
      'Tôi có thể dùng câu bị động khi muốn nhấn mạnh hành động.',
      'Tôi có thể thuật lại lời người khác (câu tường thuật).',
      'Tôi có thể suy đoán và dùng mệnh đề quan hệ phức.',
      'Tôi có thể dùng phrasal verbs, thành ngữ và từ nối để diễn đạt tự nhiên.',
    ],
    units: [
      {
        id: 'b2-hypothetical',
        titleVi: 'Giả định & tiếc nuối',
        titleEn: 'Hypotheticals & Regrets',
        emoji: '🎭',
        vocabCircleIds: ['personality'],
        grammar: [
          {
            id: 'b2-cond-2',
            titleVi: 'Điều kiện loại 2 (giả định hiện tại)',
            titleEn: 'Second Conditional',
            structure: 'If + S + V2, S + would + V',
            explainVi:
              'Giả định KHÔNG có thật hoặc khó xảy ra ở hiện tại.\n' +
              'Lưu ý: với "to be" dùng "were" cho mọi chủ ngữ (If I were…).',
            examples: [
              ex('If I were you, I would accept the offer.', 'Nếu là bạn, tôi sẽ nhận lời đề nghị.'),
              ex('If I had more time, I would learn piano.', 'Nếu có thêm thời gian, tôi sẽ học piano.'),
              ex('What would you do if you won the lottery?', 'Bạn sẽ làm gì nếu trúng số?'),
            ],
          },
          {
            id: 'b2-cond-3',
            titleVi: 'Điều kiện loại 3 (tiếc nuối quá khứ)',
            titleEn: 'Third Conditional',
            structure: 'If + S + had + V3, S + would have + V3',
            explainVi:
              'Diễn tả điều trái với quá khứ — việc đã không xảy ra và sự tiếc nuối.',
            examples: [
              ex('If I had studied, I would have passed.', 'Nếu tôi đã học, tôi đã đậu rồi.'),
              ex('If she had left earlier, she would have caught the train.', 'Nếu đi sớm hơn, cô ấy đã kịp tàu.'),
              ex("If we had known, we would have helped.", 'Nếu biết, chúng tôi đã giúp.'),
            ],
          },
          {
            id: 'b2-wish',
            titleVi: 'Wish / If only (ước)',
            titleEn: 'Wish / If only',
            structure: 'S + wish + S + V2 (hiện tại) / had + V3 (quá khứ)',
            explainVi:
              '• wish + quá khứ đơn: ước điều trái hiện tại.\n' +
              '• wish + quá khứ hoàn thành: tiếc điều trong quá khứ.',
            examples: [
              ex('I wish I had more money.', 'Ước gì tôi có nhiều tiền hơn.'),
              ex('I wish I could speak French.', 'Ước gì tôi nói được tiếng Pháp.'),
              ex('She wishes she had studied harder.', 'Cô ấy ước mình đã học chăm hơn.'),
            ],
          },
        ],
      },
      {
        id: 'b2-passive',
        titleVi: 'Câu bị động',
        titleEn: 'The Passive Voice',
        emoji: '🔁',
        vocabCircleIds: ['business', 'it', 'environment'],
        grammar: [
          {
            id: 'b2-passive',
            titleVi: 'Câu bị động (các thì cơ bản)',
            titleEn: 'Passive Voice',
            structure: 'S + be + V3 (+ by + tác nhân)',
            explainVi:
              'Dùng khi hành động quan trọng hơn người làm, hoặc không biết ai làm.\n' +
              'Active: They built this house. → Passive: This house was built.',
            examples: [
              ex('This bridge was built in 1990.', 'Cây cầu này được xây năm 1990.'),
              ex('English is spoken all over the world.', 'Tiếng Anh được nói khắp thế giới.'),
              ex('The report will be sent tomorrow.', 'Báo cáo sẽ được gửi vào ngày mai.'),
            ],
          },
          {
            id: 'b2-causative',
            titleVi: 'Câu nhờ vả (have something done)',
            titleEn: 'Causative (have something done)',
            structure: 'S + have/get + tân ngữ + V3',
            explainVi:
              'Diễn tả việc bạn nhờ/thuê người khác làm cho mình (không tự làm).',
            examples: [
              ex('I had my car repaired yesterday.', 'Hôm qua tôi mang xe đi sửa.'),
              ex('She is getting her hair cut.', 'Cô ấy đang đi cắt tóc.'),
              ex('We had the house painted.', 'Chúng tôi đã thuê sơn lại nhà.'),
            ],
          },
        ],
      },
      {
        id: 'b2-reported',
        titleVi: 'Câu tường thuật',
        titleEn: 'Reported Speech',
        emoji: '💬',
        vocabCircleIds: ['social'],
        grammar: [
          {
            id: 'b2-reported-statements',
            titleVi: 'Tường thuật câu trần thuật',
            titleEn: 'Reported statements',
            structure: 'S + said (that) + S + V (lùi thì)',
            explainVi:
              'Thuật lại lời người khác. Thường lùi một thì về quá khứ.\n' +
              '"I am tired" → He said he was tired.',
            examples: [
              ex('She said she was busy.', 'Cô ấy nói cô ấy bận.'),
              ex('He told me he would come.', 'Anh ấy bảo tôi rằng anh ấy sẽ đến.'),
              ex('They said they had finished.', 'Họ nói họ đã làm xong.'),
            ],
          },
          {
            id: 'b2-reported-questions',
            titleVi: 'Tường thuật câu hỏi',
            titleEn: 'Reported questions',
            structure: 'S + asked + (if/whether • Wh-) + S + V (không đảo)',
            explainVi:
              'Khi thuật lại câu hỏi, KHÔNG đảo trợ động từ và bỏ dấu hỏi.\n' +
              '• Yes/No → dùng if/whether.   • Wh-question → giữ từ để hỏi.',
            examples: [
              ex('She asked if I was OK.', 'Cô ấy hỏi tôi có ổn không.'),
              ex('He asked where I lived.', 'Anh ấy hỏi tôi sống ở đâu.'),
              ex('They asked what time the meeting started.', 'Họ hỏi cuộc họp bắt đầu lúc mấy giờ.'),
            ],
          },
        ],
      },
      {
        id: 'b2-deduction',
        titleVi: 'Suy đoán & mệnh đề quan hệ',
        titleEn: 'Deduction & Relative Clauses',
        emoji: '🧩',
        vocabCircleIds: ['medical'],
        grammar: [
          {
            id: 'b2-modals-deduction',
            titleVi: 'Suy đoán (must / might / can\'t + be)',
            titleEn: 'Modals of deduction',
            structure: 'S + must / might / can\'t + be / V',
            explainVi:
              '• must be: chắc chắn là (suy đoán có cơ sở mạnh).\n' +
              '• might/may be: có lẽ là (không chắc).\n' +
              '• can\'t be: không thể nào là (chắc chắn không).',
            examples: [
              ex("He isn't answering — he must be busy.", 'Anh ấy không trả lời — chắc đang bận.'),
              ex('She might be at home now.', 'Có lẽ giờ cô ấy đang ở nhà.'),
              ex("That can't be true.", 'Điều đó không thể là thật.'),
            ],
          },
          {
            id: 'b2-non-defining',
            titleVi: 'Mệnh đề quan hệ không xác định (có dấu phẩy)',
            titleEn: 'Non-defining relative clauses',
            structure: 'danh từ, who/which + … , (thông tin thêm)',
            explainVi:
              'Bổ sung thông tin KHÔNG bắt buộc (bỏ đi câu vẫn đủ nghĩa). Đặt giữa hai dấu phẩy, không dùng "that".',
            examples: [
              ex('My brother, who lives in Hue, is a teacher.', 'Anh trai tôi, người sống ở Huế, là giáo viên.'),
              ex('Hanoi, which is the capital, is very old.', 'Hà Nội, thủ đô, rất cổ kính.'),
              ex('Our manager, who is very kind, helped us.', 'Quản lý của chúng tôi, người rất tốt bụng, đã giúp chúng tôi.'),
            ],
          },
        ],
      },
      {
        id: 'b2-natural',
        titleVi: 'Diễn đạt tự nhiên',
        titleEn: 'Natural Expression',
        emoji: '🗣️',
        vocabCircleIds: ['it'],
        grammar: [
          {
            id: 'b2-phrasal',
            titleVi: 'Phrasal verbs thông dụng',
            titleEn: 'Common phrasal verbs',
            structure: 'động từ + giới từ/trạng từ (mang nghĩa mới)',
            explainVi:
              'Ghép động từ với một từ nhỏ để tạo nghĩa mới — rất phổ biến trong giao tiếp.\n' +
              'give up (từ bỏ), look for (tìm), find out (phát hiện), turn off (tắt).',
            examples: [
              ex("Don't give up — keep trying!", 'Đừng bỏ cuộc — cứ cố gắng!'),
              ex('I am looking for my keys.', 'Tôi đang tìm chìa khóa.'),
              ex('Please turn off the lights.', 'Làm ơn tắt đèn.'),
            ],
          },
          {
            id: 'b2-linking',
            titleVi: 'Từ nối (although / however / despite)',
            titleEn: 'Linking words',
            structure: 'although + mệnh đề • despite + danh từ/V-ing • however, …',
            explainVi:
              'Dùng để nối ý tương phản, làm câu mạch lạc hơn.\n' +
              '• although + mệnh đề.   • despite/in spite of + danh từ/V-ing.   • however đứng đầu câu, có dấu phẩy.',
            examples: [
              ex('Although it was raining, we went out.', 'Mặc dù trời mưa, chúng tôi vẫn ra ngoài.'),
              ex('Despite the rain, we went out.', 'Bất chấp cơn mưa, chúng tôi vẫn ra ngoài.'),
              ex("The plan was risky. However, it worked.", 'Kế hoạch rủi ro. Tuy nhiên, nó đã thành công.'),
            ],
          },
          {
            id: 'b2-idioms',
            titleVi: 'Thành ngữ thông dụng',
            titleEn: 'Common idioms',
            structure: 'cụm từ cố định mang nghĩa bóng',
            explainVi:
              'Thành ngữ không dịch theo nghĩa đen. Học cả cụm và tình huống dùng.',
            examples: [
              ex("It's a piece of cake.", 'Chuyện nhỏ (dễ ợt).'),
              ex('Break a leg!', 'Chúc may mắn!'),
              ex("Once in a blue moon.", 'Hiếm khi, họa hoằn lắm.'),
            ],
          },
        ],
      },
    ],
  },
]

// Tiện ích: tổng số bài ngữ pháp trong 1 cấp (để hiển thị thống kê).
export function countGrammar(level: CefrLevel): number {
  return level.units.reduce((sum, u) => sum + u.grammar.length, 0)
}
