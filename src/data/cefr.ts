// ──────────────────────────────────────────────────────────────────────────
// LỘ TRÌNH HỌC THEO CHUẨN CEFR (A1 → B2)
//
// Đây là phần "khung lộ trình" gắn lên trên hệ thống flashcard/SRS sẵn có.
// Mỗi CẤP ĐỘ (CefrLevel) gồm:
//   - canDo[]:  các mục tiêu "Tôi có thể…" theo mô tả CEFR (tiếng Việt) — để
//               học viên biết học xong cấp này thì làm được gì.
//   - units[]:  các bài học. Mỗi unit gồm:
//       · grammar[]:      bài NGỮ PHÁP (cấu trúc + giải thích tiếng Việt + ví dụ
//                         có thể bấm nghe).
//       · vocabCircleIds: liên kết tới các "vòng" từ vựng trong
//                         src/data/curriculum.ts (FOUNDATION) để luyện flashcard.
//
// ⚠️ Đây là KHUNG — nội dung ngữ pháp đã có thật nhưng còn mở rộng được:
//    thêm bài vào mảng grammar[] hoặc thêm unit vào units[] là xong, UI tự cập nhật.
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
    goalVi: 'Chào hỏi, giới thiệu bản thân và gia đình, nói về đồ vật quen thuộc bằng những câu rất đơn giản.',
    accent: 'emerald',
    canDo: [
      'Tôi có thể chào hỏi và giới thiệu tên, tuổi, quốc tịch của mình.',
      'Tôi có thể nói về gia đình và những người thân quen.',
      'Tôi có thể gọi tên đồ vật, màu sắc, con số và thời gian.',
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
        vocabCircleIds: ['family', 'body'],
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
        ],
      },
      {
        id: 'a1-numbers-time',
        titleVi: 'Số, màu sắc & thời gian',
        titleEn: 'Numbers, Colors & Time',
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
        ],
      },
      {
        id: 'a1-questions',
        titleVi: 'Hỏi đáp cơ bản',
        titleEn: 'Basic Questions',
        emoji: '❓',
        vocabCircleIds: ['questions', 'food'],
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
    goalVi: 'Nói về thói quen, kể chuyện quá khứ đơn giản, mô tả và so sánh người, vật, nơi chốn quen thuộc.',
    accent: 'sky',
    canDo: [
      'Tôi có thể kể về thói quen và lịch sinh hoạt hằng ngày.',
      'Tôi có thể kể lại những việc đã xảy ra trong quá khứ (cuối tuần, kỳ nghỉ).',
      'Tôi có thể nói về việc đang diễn ra ngay lúc này.',
      'Tôi có thể so sánh hai người, hai vật (cao hơn, đẹp nhất…).',
    ],
    units: [
      {
        id: 'a2-routine',
        titleVi: 'Thói quen hằng ngày',
        titleEn: 'Daily Routine',
        emoji: '🌅',
        vocabCircleIds: ['verbs', 'time'],
        grammar: [
          {
            id: 'a2-present-simple',
            titleVi: 'Hiện tại đơn (Present Simple)',
            titleEn: 'Present Simple',
            structure: 'S + V(-s/-es) • He/She/It thêm -s',
            explainVi:
              'Diễn tả thói quen, sự thật hiển nhiên.\n' +
              '• I/you/we/they + V   • he/she/it + V-s\n' +
              '• Phủ định: do/does + not + V. Câu hỏi: Do/Does + S + V?',
            examples: [
              ex('I get up at six every day.', 'Tôi dậy lúc sáu giờ mỗi ngày.'),
              ex('She works in a hospital.', 'Cô ấy làm việc ở bệnh viện.'),
              ex('Do you drink coffee?', 'Bạn có uống cà phê không?'),
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
        vocabCircleIds: ['transport', 'city-places'],
        grammar: [
          {
            id: 'a2-past-simple',
            titleVi: 'Quá khứ đơn (Past Simple)',
            titleEn: 'Past Simple',
            structure: 'S + V2/V-ed (+ ngày/thời gian quá khứ)',
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
        ],
      },
      {
        id: 'a2-continuous',
        titleVi: 'Việc đang diễn ra',
        titleEn: 'Happening Now',
        emoji: '⏳',
        vocabCircleIds: ['clothing', 'weather'],
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
        ],
      },
      {
        id: 'a2-compare',
        titleVi: 'So sánh',
        titleEn: 'Comparisons',
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
    goalVi: 'Nói về kinh nghiệm, kế hoạch tương lai, đưa ra giả thiết và lời khuyên trong các tình huống quen thuộc.',
    accent: 'violet',
    canDo: [
      'Tôi có thể nói về kinh nghiệm và những việc đã làm trong đời.',
      'Tôi có thể nói về kế hoạch và dự định trong tương lai.',
      'Tôi có thể diễn đạt điều kiện ("nếu… thì…").',
      'Tôi có thể đưa ra lời khuyên và nói về bổn phận.',
    ],
    units: [
      {
        id: 'b1-experience',
        titleVi: 'Kinh nghiệm & trải nghiệm',
        titleEn: 'Experiences',
        emoji: '🌍',
        vocabCircleIds: ['social', 'sports'],
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
        ],
      },
      {
        id: 'b1-future',
        titleVi: 'Kế hoạch tương lai',
        titleEn: 'Future Plans',
        emoji: '🔮',
        vocabCircleIds: ['jobs', 'emotions'],
        grammar: [
          {
            id: 'b1-will-going-to',
            titleVi: 'Will vs. Be going to',
            titleEn: 'Will vs. Be going to',
            structure: 'S + will + V • S + am/is/are + going to + V',
            explainVi:
              '• will: quyết định ngay lúc nói, dự đoán.\n' +
              '• be going to: dự định đã có sẵn, hoặc điều sắp xảy ra dựa vào dấu hiệu.',
            examples: [
              ex('I think it will rain tomorrow.', 'Tôi nghĩ mai trời sẽ mưa.'),
              ex('I am going to start a new job.', 'Tôi sắp bắt đầu công việc mới.'),
              ex('She will help you.', 'Cô ấy sẽ giúp bạn.'),
            ],
          },
        ],
      },
      {
        id: 'b1-conditionals',
        titleVi: 'Câu điều kiện',
        titleEn: 'Conditionals',
        emoji: '🔀',
        vocabCircleIds: ['nature', 'school'],
        grammar: [
          {
            id: 'b1-cond-0-1',
            titleVi: 'Điều kiện loại 0 & loại 1',
            titleEn: 'Zero & First Conditional',
            structure: 'If + S + V(hiện tại), S + will + V',
            explainVi:
              '• Loại 0: sự thật luôn đúng. If you heat ice, it melts.\n' +
              '• Loại 1: điều kiện có thật ở tương lai. If it rains, I will stay home.',
            examples: [
              ex('If you heat water, it boils.', 'Nếu đun nước, nó sẽ sôi.'),
              ex('If it rains, I will stay home.', 'Nếu trời mưa, tôi sẽ ở nhà.'),
              ex('If you study hard, you will pass.', 'Nếu học chăm, bạn sẽ đậu.'),
            ],
          },
        ],
      },
      {
        id: 'b1-modals',
        titleVi: 'Lời khuyên & bổn phận',
        titleEn: 'Advice & Obligation',
        emoji: '💡',
        vocabCircleIds: ['medical', 'personality'],
        grammar: [
          {
            id: 'b1-modals-lesson',
            titleVi: 'Modal verbs (should, must, have to)',
            titleEn: 'Modal verbs',
            structure: 'S + should / must / have to + V (nguyên mẫu)',
            explainVi:
              '• should: nên (lời khuyên).\n' +
              '• must: phải (bắt buộc, mạnh).\n' +
              '• have to: phải (do quy định bên ngoài).',
            examples: [
              ex('You should see a doctor.', 'Bạn nên đi khám bác sĩ.'),
              ex('You must wear a helmet.', 'Bạn phải đội mũ bảo hiểm.'),
              ex('I have to work on Saturday.', 'Tôi phải làm việc vào thứ Bảy.'),
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
    goalVi: 'Diễn đạt ý phức tạp, dùng câu giả định, câu bị động, tường thuật và thành ngữ một cách tự nhiên.',
    accent: 'amber',
    canDo: [
      'Tôi có thể nói về tình huống giả định trái với thực tế.',
      'Tôi có thể dùng câu bị động khi muốn nhấn mạnh hành động.',
      'Tôi có thể thuật lại lời người khác (câu tường thuật).',
      'Tôi có thể dùng phrasal verbs và thành ngữ thông dụng.',
    ],
    units: [
      {
        id: 'b2-hypothetical',
        titleVi: 'Giả định trái thực tế',
        titleEn: 'Hypothetical Situations',
        emoji: '🎭',
        vocabCircleIds: ['emotions', 'social'],
        grammar: [
          {
            id: 'b2-cond-2-3',
            titleVi: 'Điều kiện loại 2 & loại 3',
            titleEn: 'Second & Third Conditional',
            structure: 'If + S + V2, S + would + V • If + S + had + V3, S + would have + V3',
            explainVi:
              '• Loại 2: giả định KHÔNG có thật ở hiện tại. If I were rich, I would travel.\n' +
              '• Loại 3: tiếc nuối về quá khứ. If I had studied, I would have passed.',
            examples: [
              ex('If I were you, I would accept the offer.', 'Nếu là bạn, tôi sẽ nhận lời đề nghị.'),
              ex('If I had more time, I would learn piano.', 'Nếu có thêm thời gian, tôi sẽ học piano.'),
              ex('If she had left earlier, she would have caught the train.', 'Nếu đi sớm hơn, cô ấy đã kịp tàu.'),
            ],
          },
        ],
      },
      {
        id: 'b2-passive',
        titleVi: 'Câu bị động',
        titleEn: 'The Passive Voice',
        emoji: '🔁',
        vocabCircleIds: ['business', 'it'],
        grammar: [
          {
            id: 'b2-passive-lesson',
            titleVi: 'Câu bị động (Passive Voice)',
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
        ],
      },
      {
        id: 'b2-reported',
        titleVi: 'Câu tường thuật',
        titleEn: 'Reported Speech',
        emoji: '💬',
        vocabCircleIds: ['business', 'school'],
        grammar: [
          {
            id: 'b2-reported-lesson',
            titleVi: 'Câu tường thuật (Reported Speech)',
            titleEn: 'Reported Speech',
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
        ],
      },
      {
        id: 'b2-idioms',
        titleVi: 'Phrasal verbs & thành ngữ',
        titleEn: 'Phrasal Verbs & Idioms',
        emoji: '🗣️',
        vocabCircleIds: ['it', 'personality'],
        grammar: [
          {
            id: 'b2-phrasal',
            titleVi: 'Phrasal verbs thông dụng',
            titleEn: 'Common phrasal verbs',
            structure: 'động từ + giới từ/trạng từ (mang nghĩa mới)',
            explainVi:
              'Ghép động từ với một từ nhỏ để tạo nghĩa mới — rất phổ biến trong giao tiếp.\n' +
              'give up (từ bỏ), look for (tìm kiếm), find out (phát hiện), turn off (tắt).',
            examples: [
              ex('Don\'t give up — keep trying!', 'Đừng bỏ cuộc — cứ cố gắng!'),
              ex('I am looking for my keys.', 'Tôi đang tìm chìa khóa.'),
              ex('Please turn off the lights.', 'Làm ơn tắt đèn.'),
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
