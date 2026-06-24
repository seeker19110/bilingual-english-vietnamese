// ──────────────────────────────────────────────────────────────────────────
// LỘ TRÌNH HỌC THEO CHUẨN CEFR (A1 → B2) — BẢN ĐẦY ĐỦ (đã LÀM GIÀU nội dung)
//
// Đây là "khung lộ trình" gắn lên trên hệ thống flashcard/SRS sẵn có.
// Mỗi CẤP ĐỘ (CefrLevel) gồm:
//   - canDo[]:  các mục tiêu "Tôi có thể…" theo mô tả CEFR (tiếng Việt) — để
//               học viên biết học xong cấp này thì làm được gì.
//   - units[]:  các bài học. Mỗi unit gồm:
//       · grammar[]:      bài NGỮ PHÁP (cấu trúc + giải thích tiếng Việt + ví dụ
//                         có thể bấm nghe + mẹo + lỗi thường gặp + quiz tự kiểm tra).
//       · vocabCircleIds: liên kết tới các "vòng" từ vựng trong
//                         src/data/curriculum.ts (FOUNDATION) để luyện flashcard.
//
// Mỗi bài ngữ pháp (GrammarLesson) ngoài cấu trúc + giải thích + ví dụ còn có thể
// kèm 3 phần LÀM GIÀU (tùy chọn):
//   · tipVi:    mẹo/lưu ý ngắn giúp nhớ và dùng đúng.
//   · mistakes: các lỗi người Việt hay mắc (câu sai → câu đúng + giải thích).
//   · quiz:     vài câu trắc nghiệm để tự kiểm tra ngay.
//
// Giáo trình phủ các điểm ngữ pháp cốt lõi của từng cấp CEFR. Vẫn mở rộng được:
// thêm bài vào mảng grammar[] hoặc thêm unit vào units[] là UI tự cập nhật.
// ──────────────────────────────────────────────────────────────────────────

// Một ví dụ minh họa (Anh ↔ Việt) — dùng chung cho ngữ pháp.
export interface Example {
  en: string
  vi: string
}

// Một lỗi thường gặp: câu SAI → câu ĐÚNG + giải thích ngắn (tiếng Việt).
export interface CommonMistake {
  wrong: string
  right: string
  noteVi: string
}

// Một câu hỏi trắc nghiệm nhỏ để tự kiểm tra ngay sau khi học.
export interface QuizItem {
  // Câu hỏi/câu có chỗ trống. Dùng "___" để đánh dấu chỗ cần điền.
  q: string
  // Các lựa chọn (2–4 đáp án).
  options: string[]
  // Vị trí (index) của đáp án đúng trong mảng options.
  answer: number
  // Giải thích ngắn vì sao đúng (tiếng Việt) — hiện sau khi chọn.
  explainVi?: string
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
  // ── Các trường LÀM GIÀU nội dung (tất cả tùy chọn — bài cũ không có vẫn chạy) ──
  // Mẹo/lưu ý ngắn giúp nhớ hoặc dùng đúng (tiếng Việt, có thể nhiều dòng).
  tipVi?: string
  // Lỗi người Việt hay mắc với điểm ngữ pháp này.
  mistakes?: CommonMistake[]
  // Bài tập nhỏ tự kiểm tra ngay.
  quiz?: QuizItem[]
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
// Rút gọn: hàm tạo 1 lỗi thường gặp (sai → đúng + ghi chú).
const mis = (wrong: string, right: string, noteVi: string): CommonMistake => ({ wrong, right, noteVi })
// Rút gọn: hàm tạo 1 câu quiz.
const qz = (q: string, options: string[], answer: number, explainVi?: string): QuizItem =>
  ({ q, options, answer, explainVi })

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
              ex('He is at school now.', 'Bây giờ anh ấy ở trường.'),
              ex("My name is Minh. I'm twenty.", 'Tôi tên Minh. Tôi hai mươi tuổi.'),
            ],
            tipVi:
              'Nhớ nhanh: "I am, he/she/it is, còn lại are". Trong nói chuyện thường rút gọn: I am → I\'m, she is → she\'s, you are → you\'re.',
            mistakes: [
              mis('I student.', 'I am a student.', 'Câu tiếng Anh BẮT BUỘC có động từ — không được bỏ "am/is/are".'),
              mis('She are happy.', 'She is happy.', 'She/he/it đi với "is", không phải "are".'),
            ],
            quiz: [
              qz('She ___ a teacher.', ['am', 'is', 'are'], 1, 'She đi với "is".'),
              qz('We ___ from Hanoi.', ['is', 'am', 'are'], 2, 'We/you/they đi với "are".'),
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
              ex("This isn't my bag.", 'Đây không phải túi của tôi.'),
              ex("We aren't ready yet.", 'Chúng tôi chưa sẵn sàng.'),
            ],
            tipVi: 'Chỉ cần chèn "not" ngay sau am/is/are. Không dùng "do not" với to be.',
            mistakes: [
              mis("He doesn't is at home.", "He isn't at home.", 'Với to be KHÔNG dùng do/does — chỉ thêm "not".'),
              mis('I amn\'t tired.', "I'm not tired.", '"am not" không có dạng viết tắt "amn\'t".'),
            ],
            quiz: [
              qz('They ___ ready.', ["isn't", "aren't", "am not"], 1, 'They đi với aren\'t.'),
              qz('Chọn câu ĐÚNG:', ["She not happy.", "She isn't happy.", "She don't happy."], 1),
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
              ex('We live in Da Nang.', 'Chúng tôi sống ở Đà Nẵng.'),
              ex('You are my best friend.', 'Bạn là bạn thân nhất của tôi.'),
            ],
            tipVi:
              'Dùng "it" cho đồ vật và con vật (khi không rõ giới tính). "I" luôn viết HOA dù ở giữa câu.',
            mistakes: [
              mis('me am a student.', 'I am a student.', 'Chủ ngữ dùng "I", không dùng "me" (me là tân ngữ).'),
              mis('He are my brother.', 'He is my brother.', 'He đi với is.'),
            ],
            quiz: [
              qz('___ is a cat. (con mèo)', ['He', 'She', 'It'], 2, 'Đồ vật/con vật dùng "it".'),
              qz('Chọn chủ ngữ đúng: ___ am happy.', ['Me', 'I', 'My'], 1),
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
              ex('My brother has a dog.', 'Anh trai tôi có một con chó.'),
              ex('We have a small family.', 'Gia đình tôi nhỏ.'),
            ],
            tipVi: 'Quy tắc giống "to be": he/she/it dùng "has", còn lại dùng "have".',
            mistakes: [
              mis('She have a new phone.', 'She has a new phone.', 'She → has (không phải have).'),
              mis('He has got two car.', 'He has two cars.', 'Danh từ đếm được số nhiều phải thêm -s: cars.'),
            ],
            quiz: [
              qz('He ___ a bike.', ['have', 'has'], 1, 'He → has.'),
              qz('We ___ three cats.', ['has', 'have'], 1, 'We → have.'),
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
              ex('His car is new.', 'Xe của anh ấy mới.'),
              ex('What is their address?', 'Địa chỉ của họ là gì?'),
            ],
            tipVi:
              'Đừng nhầm "its" (của nó) với "it\'s" (= it is). "its" KHÔNG có dấu nháy.',
            mistakes: [
              mis('This is me mother.', 'This is my mother.', 'Trước danh từ dùng "my", không dùng "me".'),
              mis("She name is Lan.", 'Her name is Lan.', 'Cần tính từ sở hữu "her" trước danh từ.'),
            ],
            quiz: [
              qz('I love ___ family.', ['I', 'my', 'me'], 1, 'Trước danh từ dùng my.'),
              qz('They sold ___ house.', ['their', 'they', "they're"], 0),
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
              ex("My sister's room is big.", 'Phòng của chị tôi rộng.'),
              ex("Is this Nam's phone?", 'Đây có phải điện thoại của Nam không?'),
            ],
            tipVi:
              'Người sở hữu đứng TRƯỚC, vật được sở hữu đứng SAU: "Lan\'s bag" = túi của Lan (không phải "bag\'s Lan").',
            mistakes: [
              mis('the bag of Lan', "Lan's bag", 'Với người, tiếng Anh thường dùng \'s thay vì "of".'),
              mis("My fathers car", "My father's car", 'Thiếu dấu nháy: phải là father\'s.'),
            ],
            quiz: [
              qz('"Cuốn sách của Nam" =', ["Nam book's", "Nam's book", "book of Nam"], 1),
              qz('Chọn câu đúng:', ["the car's my father", "my father's car", "my father car's"], 1),
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
              ex("There isn't any milk in the fridge.", 'Trong tủ lạnh không còn sữa.'),
              ex('There are many people in the park.', 'Có nhiều người trong công viên.'),
            ],
            tipVi:
              'Chọn is hay are theo danh từ NGAY SAU nó. Với danh từ không đếm được (water, milk) dùng "there is".',
            mistakes: [
              mis('There are a book on the table.', 'There is a book on the table.', 'Một vật (a book) → there is.'),
              mis('Have a bank near here?', 'Is there a bank near here?', 'Hỏi "có tồn tại không" dùng there is/are, không dùng "have".'),
            ],
            quiz: [
              qz('___ a cat under the table.', ['There is', 'There are'], 0, 'a cat = số ít → there is.'),
              qz('___ five books here.', ['There is', 'There are'], 1, 'five books = số nhiều → there are.'),
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
              ex('Those houses are old.', 'Những ngôi nhà kia cũ.'),
              ex('Is this your phone?', 'Đây có phải điện thoại của bạn không?'),
            ],
            tipVi:
              'Gần → this/these (có "s" = số nhiều: these). Xa → that/those. "this/that" đi với is; "these/those" đi với are.',
            mistakes: [
              mis('This are my shoes.', 'These are my shoes.', 'Nhiều vật (shoes) → these are.'),
              mis('These is a pen.', 'This is a pen.', 'Một vật → this is.'),
            ],
            quiz: [
              qz('___ books are new. (nhiều, ở xa)', ['That', 'Those', 'This'], 1),
              qz('___ is my pen. (một, ở gần)', ['These', 'This', 'Those'], 1),
            ],
          },
          {
            id: 'a1-prep-place',
            titleVi: 'Giới từ chỉ nơi chốn (in, on, under…)',
            titleEn: 'Prepositions of place',
            structure: 'in • on • under • next to • behind + nơi chốn',
            explainVi:
              'Cho biết vật nằm ở đâu.\n' +
              'in (trong), on (trên), under (dưới), next to (cạnh), behind (sau), in front of (trước).',
            examples: [
              ex('The cat is under the table.', 'Con mèo ở dưới bàn.'),
              ex('Your phone is on the bed.', 'Điện thoại của bạn ở trên giường.'),
              ex('The shop is next to the bank.', 'Cửa hàng ở cạnh ngân hàng.'),
              ex('There is a car in front of the house.', 'Có một chiếc xe trước nhà.'),
              ex('My keys are in my bag.', 'Chìa khóa của tôi ở trong túi.'),
            ],
            tipVi:
              'Mẹo "in–on–at": in = bên trong (in the box), on = trên bề mặt (on the table), at = tại một điểm (at the door).',
            mistakes: [
              mis('The cat is in the table.', 'The cat is under / on the table.', '"in the table" nghĩa là bên trong cái bàn — sai nghĩa.'),
              mis('My keys are on my bag.', 'My keys are in my bag.', 'Bên trong túi → in (on = trên bề mặt).'),
            ],
            quiz: [
              qz('The book is ___ the table. (trên)', ['in', 'on', 'under'], 1),
              qz('The dog is ___ the table. (dưới)', ['on', 'under', 'next to'], 1),
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
              '• one book → two books   • tận cùng s, x, ch, sh thêm -es: box → boxes, watch → watches\n' +
              '• tận cùng phụ âm + y: đổi y → ies: city → cities.',
            examples: [
              ex('I have three cats.', 'Tôi có ba con mèo.'),
              ex('There are seven days in a week.', 'Một tuần có bảy ngày.'),
              ex('She buys two boxes.', 'Cô ấy mua hai cái hộp.'),
              ex('There are many cities in Vietnam.', 'Việt Nam có nhiều thành phố.'),
              ex('We have two children.', 'Chúng tôi có hai đứa con.'),
            ],
            tipVi:
              'Một số danh từ bất quy tắc phải nhớ: man→men, woman→women, child→children, foot→feet, tooth→teeth, person→people.',
            mistakes: [
              mis('I have three cat.', 'I have three cats.', 'Nhiều hơn một phải thêm -s.'),
              mis('two childs', 'two children', 'child là danh từ bất quy tắc → children.'),
            ],
            quiz: [
              qz('Số nhiều của "box" là:', ['boxs', 'boxes', 'boxies'], 1, 'Tận cùng -x thêm -es.'),
              qz('Số nhiều của "city" là:', ['citys', 'cities', 'cityes'], 1, 'phụ âm + y → ies.'),
            ],
          },
          {
            id: 'a1-articles',
            titleVi: 'Mạo từ a / an / the',
            titleEn: 'Articles a / an / the',
            structure: 'a/an + danh từ chung • the + danh từ xác định',
            explainVi:
              '• a / an = "một" (nhắc lần đầu, chưa xác định). Dùng "an" trước âm nguyên âm (a, e, i, o, u).\n' +
              '• the = "cái đó" (người nghe đã biết rõ là cái nào).',
            examples: [
              ex('I have a dog.', 'Tôi có một con chó.'),
              ex('She eats an apple.', 'Cô ấy ăn một quả táo.'),
              ex('The dog is friendly.', 'Con chó đó thân thiện.'),
              ex('He is an honest man.', 'Anh ấy là người trung thực.'),
              ex('Close the door, please.', 'Làm ơn đóng cửa lại.'),
            ],
            tipVi:
              'Chọn a/an theo ÂM ĐỌC, không theo chữ cái: an hour (h câm), a university (đọc /ju/ như phụ âm).',
            mistakes: [
              mis('She eats a apple.', 'She eats an apple.', 'apple bắt đầu bằng nguyên âm → dùng "an".'),
              mis('I have dog.', 'I have a dog.', 'Danh từ đếm được số ít cần a/an hoặc the.'),
            ],
            quiz: [
              qz('I saw ___ elephant.', ['a', 'an', 'the'], 1, 'elephant bắt đầu nguyên âm → an.'),
              qz('It takes ___ hour.', ['a', 'an'], 1, 'h câm, đọc như nguyên âm → an.'),
            ],
          },
          {
            id: 'a1-how-many',
            titleVi: 'Hỏi số lượng (How many…?)',
            titleEn: 'How many…?',
            structure: 'How many + danh từ số nhiều + are there? / do you have?',
            explainVi:
              'Dùng "How many" để hỏi "có bao nhiêu" với danh từ ĐẾM ĐƯỢC (luôn ở số nhiều).',
            examples: [
              ex('How many books do you have?', 'Bạn có bao nhiêu cuốn sách?'),
              ex('How many people are there?', 'Có bao nhiêu người?'),
              ex('How many days are in May?', 'Tháng Năm có bao nhiêu ngày?'),
              ex('How many brothers do you have?', 'Bạn có mấy anh em trai?'),
              ex('How many students are in the class?', 'Lớp có bao nhiêu học sinh?'),
            ],
            tipVi:
              'How many đi với danh từ ĐẾM ĐƯỢC (số nhiều). Với danh từ KHÔNG đếm được (water, money) dùng "How much".',
            mistakes: [
              mis('How many book do you have?', 'How many books do you have?', 'Sau how many là danh từ số nhiều.'),
              mis('How much apples?', 'How many apples?', 'apples đếm được → how many.'),
            ],
            quiz: [
              qz('___ chairs are there?', ['How much', 'How many'], 1, 'chairs đếm được → how many.'),
              qz('___ water do you need?', ['How many', 'How much'], 1, 'water không đếm được → how much.'),
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
              ex('They live in the city.', 'Họ sống ở thành phố.'),
              ex('I like watching films.', 'Tôi thích xem phim.'),
            ],
            tipVi:
              'Sau "like/love/enjoy" có thể dùng danh từ (like coffee) hoặc V-ing (like reading).',
            mistakes: [
              mis('I likes coffee.', 'I like coffee.', 'Với "I" giữ nguyên động từ, không thêm -s.'),
              mis('I want water some.', 'I want some water.', 'Trật tự đúng: some + danh từ.'),
            ],
            quiz: [
              qz('I ___ tea.', ['likes', 'like'], 1, 'I → like (không thêm -s).'),
              qz('They ___ in Hue.', ['live', 'lives'], 0, 'They → live.'),
            ],
          },
          {
            id: 'a1-can',
            titleVi: 'Can — diễn tả khả năng',
            titleEn: 'Can (ability)',
            structure: 'S + can / can\'t + động từ nguyên mẫu',
            explainVi:
              '"Can" = "có thể". Sau "can" luôn dùng động từ nguyên mẫu (không thêm -s, không "to").\n' +
              'Phủ định: cannot / can\'t. Câu hỏi: Can + S + V?',
            examples: [
              ex('I can swim.', 'Tôi biết bơi.'),
              ex('She can speak English.', 'Cô ấy nói được tiếng Anh.'),
              ex("He can't cook.", 'Anh ấy không biết nấu ăn.'),
              ex('Can you help me?', 'Bạn giúp tôi được không?'),
              ex('They can play the guitar.', 'Họ chơi được ghi-ta.'),
            ],
            tipVi:
              '"can" không bao giờ thêm -s và không có "to" đằng sau: She can swim (KHÔNG "cans", KHÔNG "to swim").',
            mistakes: [
              mis('She can to swim.', 'She can swim.', 'Sau "can" KHÔNG có "to".'),
              mis('He cans drive.', 'He can drive.', '"can" không thêm -s cho he/she/it.'),
            ],
            quiz: [
              qz('She can ___ very fast.', ['runs', 'to run', 'run'], 2, 'Sau can dùng động từ nguyên mẫu, không "to".'),
              qz('Câu phủ định của "I can swim":', ["I can't swim", "I don't can swim"], 0),
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
              ex('Turn left at the corner.', 'Rẽ trái ở góc đường.'),
              ex("Please don't be late.", 'Làm ơn đừng đến muộn.'),
            ],
            tipVi:
              'Thêm "please" để lịch sự hơn (đầu hoặc cuối câu). Câu mệnh lệnh KHÔNG có chủ ngữ.',
            mistakes: [
              mis('You open the door.', 'Open the door.', 'Câu mệnh lệnh bỏ chủ ngữ (trừ khi muốn nhấn mạnh).'),
              mis("No worry.", "Don't worry.", 'Phủ định mệnh lệnh dùng "Don\'t + động từ".'),
            ],
            quiz: [
              qz('Đừng chạm vào nó! =', ["No touch it!", "Don't touch it!", "Not touch it!"], 1),
              qz('Câu mệnh lệnh đúng:', ["You sit down.", "Sit down.", "To sit down."], 1),
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
              'Đảo "to be" lên đầu câu để hỏi. Trả lời ngắn: Yes, I am. / No, I am not.',
            examples: [
              ex('Are you a student?', 'Bạn có phải học sinh không?'),
              ex('Is she your sister?', 'Cô ấy là chị/em gái bạn à?'),
              ex('Yes, I am. / No, I am not.', 'Vâng, đúng vậy. / Không, không phải.'),
              ex('Are they at home?', 'Họ có ở nhà không?'),
              ex('Is it expensive?', 'Cái đó có đắt không?'),
            ],
            tipVi:
              'Trả lời ngắn KHÔNG rút gọn khi "Yes": nói "Yes, I am" (không nói "Yes, I\'m"). Khi "No" thì rút gọn được: "No, I\'m not".',
            mistakes: [
              mis('You are a student?', 'Are you a student?', 'Câu hỏi phải đảo "are" lên đầu.'),
              mis('Are she your sister?', 'Is she your sister?', 'she đi với is.'),
            ],
            quiz: [
              qz('___ you happy?', ['Is', 'Are', 'Am'], 1, 'you → are.'),
              qz('___ he a doctor?', ['Are', 'Is', 'Am'], 1, 'he → is.'),
            ],
          },
          {
            id: 'a1-wh',
            titleVi: 'Câu hỏi Wh- (What, Where, Who…)',
            titleEn: 'Wh- questions',
            structure: 'Wh-word + am/is/are + S + …?',
            explainVi:
              'Hỏi thông tin cụ thể.\n' +
              'What (cái gì), Where (ở đâu), Who (ai), When (khi nào), Why (tại sao), How (như thế nào).',
            examples: [
              ex('What is your name?', 'Tên bạn là gì?'),
              ex('Where are you from?', 'Bạn đến từ đâu?'),
              ex('How old are you?', 'Bạn bao nhiêu tuổi?'),
              ex('Who is that man?', 'Người đàn ông kia là ai?'),
              ex('Why are you sad?', 'Sao bạn buồn vậy?'),
            ],
            tipVi:
              'Thứ tự: từ để hỏi + to be + chủ ngữ. "How old" hỏi tuổi (dùng to be, KHÔNG dùng have): How old are you?',
            mistakes: [
              mis('How old have you?', 'How old are you?', 'Hỏi tuổi dùng to be: How old are you?'),
              mis('Where you are from?', 'Where are you from?', 'Phải đảo to be lên trước chủ ngữ.'),
            ],
            quiz: [
              qz('___ is your name?', ['Where', 'What', 'Who'], 1),
              qz('___ are you from?', ['What', 'Where', 'When'], 1),
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
              ex('I will tell him.', 'Tôi sẽ nói với anh ấy.'),
              ex('Listen to them.', 'Hãy nghe họ.'),
            ],
            tipVi:
              'Chủ ngữ (đầu câu) dùng I/he/she; tân ngữ (sau động từ/giới từ) dùng me/him/her.',
            mistakes: [
              mis('Please help I.', 'Please help me.', 'Sau động từ dùng tân ngữ "me".'),
              mis('I love she.', 'I love her.', 'Sau động từ "love" dùng "her".'),
            ],
            quiz: [
              qz('Can you help ___?', ['I', 'me', 'my'], 1),
              qz('I saw ___ at school. (anh ấy)', ['he', 'him', 'his'], 1),
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
              '• I/you/we/they + V   • he/she/it + V-s\n' +
              'Tận cùng o, s, x, ch, sh thêm -es (go→goes); phụ âm + y → ies (study→studies).',
            examples: [
              ex('I get up at six every day.', 'Tôi dậy lúc sáu giờ mỗi ngày.'),
              ex('She works in a hospital.', 'Cô ấy làm việc ở bệnh viện.'),
              ex('The sun rises in the east.', 'Mặt trời mọc ở hướng đông.'),
              ex('He goes to school by bus.', 'Anh ấy đi học bằng xe buýt.'),
              ex('My mother studies English.', 'Mẹ tôi học tiếng Anh.'),
            ],
            tipVi:
              'Mẹo nhớ thêm -s: "He, She, It → thêm S". Đi kèm trạng từ tần suất: always, usually, often, every day.',
            mistakes: [
              mis('She work in a hospital.', 'She works in a hospital.', 'he/she/it phải thêm -s.'),
              mis('He gos to school.', 'He goes to school.', 'go tận cùng -o → thêm -es: goes.'),
            ],
            quiz: [
              qz('He ___ football every Sunday.', ['play', 'plays'], 1, 'he → plays.'),
              qz('She ___ English. (study)', ['studys', 'studies'], 1, 'phụ âm + y → ies.'),
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
              ex('Does he live near here?', 'Anh ấy có sống gần đây không?'),
              ex("They don't work on Sunday.", 'Họ không làm việc Chủ nhật.'),
            ],
            tipVi:
              'Khi đã có "does/doesn\'t" thì động từ chính BỎ -s (vì -s đã chuyển vào does). Does she like? (KHÔNG "likes").',
            mistakes: [
              mis("She doesn't eats meat.", "She doesn't eat meat.", 'Sau doesn\'t, động từ về nguyên mẫu (eat).'),
              mis('Does he lives here?', 'Does he live here?', 'Sau does, bỏ -s ở động từ chính.'),
            ],
            quiz: [
              qz('She ___ like coffee.', ["don't", "doesn't"], 1, 'she → doesn\'t.'),
              qz('___ you speak English?', ['Does', 'Do'], 1, 'you → do.'),
            ],
          },
          {
            id: 'a2-adverbs-freq',
            titleVi: 'Trạng từ tần suất (always, often…)',
            titleEn: 'Adverbs of frequency',
            structure: 'S + [always/usually/often/sometimes/never] + V',
            explainVi:
              'Cho biết bạn làm việc gì thường xuyên đến mức nào. Đứng TRƯỚC động từ thường, nhưng SAU "to be".\n' +
              'Mức độ: always (100%) > usually > often > sometimes > rarely > never (0%).',
            examples: [
              ex('I always brush my teeth in the morning.', 'Tôi luôn đánh răng vào buổi sáng.'),
              ex('He never eats meat.', 'Anh ấy không bao giờ ăn thịt.'),
              ex('She is usually late.', 'Cô ấy thường hay trễ.'),
              ex('We sometimes go to the cinema.', 'Thỉnh thoảng chúng tôi đi xem phim.'),
              ex('They often play football after school.', 'Họ hay chơi bóng sau giờ học.'),
            ],
            tipVi:
              'Vị trí: TRƯỚC động từ thường (I often go), nhưng SAU to be (She is often late). "never" đã mang nghĩa phủ định — không thêm "not".',
            mistakes: [
              mis('I brush always my teeth.', 'I always brush my teeth.', 'Trạng từ tần suất đứng TRƯỚC động từ thường.'),
              mis("He doesn't never eat meat.", 'He never eats meat.', '"never" đã là phủ định, không dùng kèm doesn\'t.'),
            ],
            quiz: [
              qz('She ___ late. (thường — với to be)', ['is usually', 'usually is'], 0, 'Trạng từ đứng sau to be.'),
              qz('I ___ coffee in the morning. (luôn uống)', ['drink always', 'always drink'], 1),
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
            explainVi:
              '"Was/Were" là dạng quá khứ của "to be". Dùng để mô tả trạng thái trong quá khứ.\n' +
              'Phủ định: wasn\'t / weren\'t. Câu hỏi: Was/Were + S?',
            examples: [
              ex('I was tired last night.', 'Tối qua tôi mệt.'),
              ex('They were at home.', 'Họ đã ở nhà.'),
              ex('Were you happy?', 'Bạn đã vui chứ?'),
              ex("She wasn't at school yesterday.", 'Hôm qua cô ấy không đi học.'),
              ex('The weather was nice last weekend.', 'Cuối tuần trước thời tiết đẹp.'),
            ],
            tipVi:
              'Quy tắc giống hiện tại nhưng lùi về quá khứ: I/he/she/it → was; you/we/they → were.',
            mistakes: [
              mis('They was at home.', 'They were at home.', 'they → were.'),
              mis('I were tired.', 'I was tired.', 'I → was.'),
            ],
            quiz: [
              qz('We ___ at the party.', ['was', 'were'], 1, 'we → were.'),
              qz('He ___ very happy.', ['were', 'was'], 1, 'he → was.'),
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
              '• Động từ bất quy tắc phải học thuộc (go → went, see → saw, eat → ate).',
            examples: [
              ex('I visited my grandmother yesterday.', 'Hôm qua tôi thăm bà.'),
              ex('We went to the beach last week.', 'Tuần trước chúng tôi đi biển.'),
              ex('She saw a good film.', 'Cô ấy đã xem một bộ phim hay.'),
              ex('They bought a new house last year.', 'Năm ngoái họ mua nhà mới.'),
              ex('He ate pho for breakfast.', 'Anh ấy ăn phở cho bữa sáng.'),
            ],
            tipVi:
              'Dùng với mốc thời gian quá khứ: yesterday, last week, in 2010, two days ago. Quá khứ đơn KHÔNG đổi theo chủ ngữ (I/he/they đều worked).',
            mistakes: [
              mis('Yesterday I go to school.', 'Yesterday I went to school.', 'Có "yesterday" → động từ phải ở quá khứ.'),
              mis('She buyed a house.', 'She bought a house.', 'buy là bất quy tắc → bought.'),
            ],
            quiz: [
              qz('We ___ to Hue last year.', ['go', 'went', 'goed'], 1, 'go → went.'),
              qz('Quá khứ của "study":', ['studyed', 'studied', 'studed'], 1, 'phụ âm + y → ied.'),
            ],
          },
          {
            id: 'a2-past-neg',
            titleVi: 'Phủ định & câu hỏi quá khứ (did)',
            titleEn: 'Past negatives & questions (did)',
            structure: "S + didn't + V • Did + S + V?",
            explainVi:
              'Dùng "did" cho mọi chủ ngữ. Sau "did/didn\'t", động từ trở về NGUYÊN MẪU (bỏ đuôi quá khứ).',
            examples: [
              ex("I didn't go to work yesterday.", 'Hôm qua tôi không đi làm.'),
              ex('Did you see the news?', 'Bạn có xem tin tức không?'),
              ex("She didn't call me.", 'Cô ấy đã không gọi cho tôi.'),
              ex('Did they enjoy the trip?', 'Họ có thích chuyến đi không?'),
              ex('What time did you get home?', 'Mấy giờ bạn về đến nhà?'),
            ],
            tipVi:
              'Khi đã có "did" thì động từ chính KHÔNG chia quá khứ nữa: Did you go? (KHÔNG "Did you went?").',
            mistakes: [
              mis('Did you went there?', 'Did you go there?', 'Sau "did" động từ về nguyên mẫu (go).'),
              mis("She didn't called me.", "She didn't call me.", 'Sau didn\'t dùng nguyên mẫu (call).'),
            ],
            quiz: [
              qz('___ you see the film?', ['Do', 'Did', 'Does'], 1, 'Hỏi quá khứ dùng did.'),
              qz("I ___ go to school yesterday.", ["didn't", "don't"], 0),
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
              'Diễn tả việc đang xảy ra ngay lúc nói. Ghép "to be" + động từ thêm -ing.\n' +
              'Quy tắc -ing: write→writing (bỏ e), run→running (gấp đôi phụ âm).',
            examples: [
              ex('I am reading a book now.', 'Bây giờ tôi đang đọc sách.'),
              ex('It is raining outside.', 'Bên ngoài trời đang mưa.'),
              ex('They are playing football.', 'Họ đang chơi bóng đá.'),
              ex('She is cooking dinner.', 'Cô ấy đang nấu bữa tối.'),
              ex('What are you doing?', 'Bạn đang làm gì vậy?'),
            ],
            tipVi:
              'Đi với now, at the moment, right now. Một số động từ chỉ trạng thái (like, want, know, love) KHÔNG dùng -ing.',
            mistakes: [
              mis('I reading a book now.', 'I am reading a book now.', 'Thiếu "am/is/are" trước V-ing.'),
              mis('I am wanting a coffee.', 'I want a coffee.', '"want" là động từ trạng thái — không dùng tiếp diễn.'),
            ],
            quiz: [
              qz('She ___ TV now.', ['watch', 'is watching', 'watches'], 1),
              qz('Dạng -ing của "run":', ['runing', 'running'], 1, 'Gấp đôi n: running.'),
            ],
          },
          {
            id: 'a2-going-to',
            titleVi: 'Be going to (kế hoạch tương lai)',
            titleEn: 'Be going to',
            structure: 'S + am/is/are + going to + V',
            explainVi:
              'Diễn tả dự định, kế hoạch đã có sẵn hoặc điều sắp xảy ra theo dấu hiệu nhìn thấy.',
            examples: [
              ex('I am going to visit my family this weekend.', 'Cuối tuần này tôi sẽ về thăm gia đình.'),
              ex('It is going to rain.', 'Trời sắp mưa.'),
              ex('They are going to buy a new car.', 'Họ định mua xe mới.'),
              ex('She is going to study abroad.', 'Cô ấy định đi du học.'),
              ex('What are you going to do tonight?', 'Tối nay bạn định làm gì?'),
            ],
            tipVi:
              'Sau "going to" là động từ NGUYÊN MẪU. Khác "be going to" (kế hoạch) với "will" (quyết định ngay lúc nói).',
            mistakes: [
              mis('I am going to visiting my family.', 'I am going to visit my family.', 'Sau "going to" dùng nguyên mẫu.'),
              mis('She going to study abroad.', 'She is going to study abroad.', 'Thiếu "is".'),
            ],
            quiz: [
              qz('We are going to ___ a film.', ['watching', 'watch', 'watches'], 1),
              qz('Chọn câu đúng:', ['He going to leave.', 'He is going to leave.'], 1),
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
              '• Tính từ dài (≥2 âm tiết): more/most. beautiful → more beautiful → the most beautiful.',
            examples: [
              ex('My house is bigger than yours.', 'Nhà tôi to hơn nhà bạn.'),
              ex('She is the tallest in the class.', 'Cô ấy cao nhất lớp.'),
              ex('This film is more interesting.', 'Bộ phim này hay hơn.'),
              ex('Today is hotter than yesterday.', 'Hôm nay nóng hơn hôm qua.'),
              ex('It is the most expensive phone.', 'Đó là chiếc điện thoại đắt nhất.'),
            ],
            tipVi:
              'Bất quy tắc cần nhớ: good→better→best, bad→worse→worst, far→farther→farthest. So sánh hơn dùng "than", so sánh nhất dùng "the".',
            mistakes: [
              mis('My house is more big than yours.', 'My house is bigger than yours.', 'Tính từ ngắn thêm -er, không dùng "more".'),
              mis('She is the most tall.', 'She is the tallest.', 'Tính từ ngắn thêm -est, không dùng "most".'),
            ],
            quiz: [
              qz('She is ___ than me. (tall)', ['more tall', 'taller', 'tallest'], 1),
              qz('It is the ___ film. (interesting)', ['interestingest', 'most interesting'], 1),
            ],
          },
          {
            id: 'a2-as-as',
            titleVi: 'So sánh bằng (as … as)',
            titleEn: 'Comparison of equality (as … as)',
            structure: 'as + tính từ + as • not as + tính từ + as',
            explainVi:
              'Dùng "as … as" để nói hai thứ NGANG BẰNG nhau.\n' +
              'Phủ định "not as … as" = không bằng (kém hơn).',
            examples: [
              ex('She is as tall as her brother.', 'Cô ấy cao bằng anh trai mình.'),
              ex('This phone is as expensive as that one.', 'Điện thoại này đắt ngang cái kia.'),
              ex("My room isn't as big as yours.", 'Phòng tôi không to bằng phòng bạn.'),
              ex('He runs as fast as me.', 'Anh ấy chạy nhanh bằng tôi.'),
              ex('Today is not as hot as yesterday.', 'Hôm nay không nóng bằng hôm qua.'),
            ],
            tipVi:
              'Giữa hai "as" luôn là tính từ/trạng từ NGUYÊN GỐC (không thêm -er): as tall as (KHÔNG "as taller as").',
            mistakes: [
              mis('She is as taller as her brother.', 'She is as tall as her brother.', 'Giữa as…as dùng tính từ nguyên gốc.'),
              mis('This phone is as expensive than that.', 'This phone is as expensive as that.', 'Dùng "as", không dùng "than".'),
            ],
            quiz: [
              qz('He is ___ his father.', ['as tall as', 'as taller as', 'tall as'], 0),
              qz('"không to bằng" =', ['not as big as', 'as not big as'], 0),
            ],
          },
          {
            id: 'a2-adverbs-manner',
            titleVi: 'Trạng từ chỉ cách thức (quickly, slowly…)',
            titleEn: 'Adverbs of manner',
            structure: 'động từ + tính từ + -ly',
            explainVi:
              'Cho biết hành động được làm NHƯ THẾ NÀO. Thường thêm -ly vào tính từ.\n' +
              'quick → quickly, slow → slowly, careful → carefully. (Bất quy tắc: good → well, fast → fast.)',
            examples: [
              ex('She speaks English fluently.', 'Cô ấy nói tiếng Anh trôi chảy.'),
              ex('He drives carefully.', 'Anh ấy lái xe cẩn thận.'),
              ex('They work well together.', 'Họ làm việc ăn ý với nhau.'),
              ex('Please speak slowly.', 'Làm ơn nói chậm thôi.'),
              ex('The dog runs fast.', 'Con chó chạy nhanh.'),
            ],
            tipVi:
              'Trạng từ bổ nghĩa cho ĐỘNG TỪ (mô tả cách làm); tính từ bổ nghĩa cho DANH TỪ. "good" là tính từ, "well" là trạng từ.',
            mistakes: [
              mis('She speaks English good.', 'She speaks English well.', '"good" là tính từ; bổ nghĩa cho động từ dùng "well".'),
              mis('He drives careful.', 'He drives carefully.', 'Bổ nghĩa cho động từ "drives" cần trạng từ "carefully".'),
            ],
            quiz: [
              qz('He sings ___. (beautiful)', ['beautiful', 'beautifully'], 1),
              qz('She speaks ___ English. (good)', ['good', 'well'], 1, 'Bổ nghĩa động từ → well.'),
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
              '• Không đếm được: không có số nhiều (water, rice, money, information) — không dùng "a/an".',
            examples: [
              ex('I have two apples.', 'Tôi có hai quả táo.'),
              ex('There is some water in the glass.', 'Có chút nước trong ly.'),
              ex('How much money do you have?', 'Bạn có bao nhiêu tiền?'),
              ex('I need some information.', 'Tôi cần một ít thông tin.'),
              ex('Can I have a glass of water?', 'Cho tôi một ly nước được không?'),
            ],
            tipVi:
              'Để đếm danh từ không đếm được, dùng "đơn vị": a glass of water, a cup of coffee, a piece of advice, a kilo of rice.',
            mistakes: [
              mis('I need some informations.', 'I need some information.', 'information không đếm được — không thêm -s.'),
              mis('How many money?', 'How much money?', 'money không đếm được → how much.'),
            ],
            quiz: [
              qz('Chọn từ KHÔNG đếm được:', ['apple', 'water', 'book'], 1),
              qz('I drink ___ milk.', ['a', 'some'], 1, 'milk không đếm được → some.'),
            ],
          },
          {
            id: 'a2-some-any',
            titleVi: 'Some / Any / How much / How many',
            titleEn: 'Some / Any / How much / many',
            structure: 'some (câu khẳng định) • any (phủ định/câu hỏi)',
            explainVi:
              '• some: dùng trong câu khẳng định (và lời mời/đề nghị).\n' +
              '• any: dùng trong câu phủ định và câu hỏi.\n' +
              '• how many + đếm được, how much + không đếm được.',
            examples: [
              ex('I have some questions.', 'Tôi có vài câu hỏi.'),
              ex("There isn't any milk.", 'Không còn chút sữa nào.'),
              ex('How much does it cost?', 'Cái này giá bao nhiêu?'),
              ex('Do you have any brothers?', 'Bạn có anh em trai nào không?'),
              ex('Would you like some tea?', 'Bạn dùng chút trà nhé? (lời mời → some)'),
            ],
            tipVi:
              'Ngoại lệ: trong LỜI MỜI/ĐỀ NGHỊ dùng "some" dù là câu hỏi: "Would you like some coffee?"',
            mistakes: [
              mis("I don't have some money.", "I don't have any money.", 'Câu phủ định dùng "any".'),
              mis('Do you have some questions?', 'Do you have any questions?', 'Câu hỏi (không phải mời) dùng "any".'),
            ],
            quiz: [
              qz("There aren't ___ apples.", ['some', 'any'], 1, 'Câu phủ định → any.'),
              qz('___ sugar is there?', ['How many', 'How much'], 1, 'sugar không đếm được.'),
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
              ex("We'd like to book a table for two.", 'Chúng tôi muốn đặt bàn cho hai người.'),
              ex('Would you like to come with us?', 'Bạn muốn đi cùng chúng tôi không?'),
            ],
            tipVi:
              'Sau "would like" + danh từ HOẶC to + V. "would like" ≠ "like": I like coffee (thích nói chung) vs I\'d like a coffee (muốn ngay bây giờ).',
            mistakes: [
              mis("I would like coffee?", "Would you like coffee?", 'Câu hỏi mời phải đảo: Would you like…?'),
              mis("She would like learn English.", "She would like to learn English.", 'Trước động từ cần "to".'),
            ],
            quiz: [
              qz('___ you like some cake?', ['Do', 'Would'], 1, 'Lời mời lịch sự dùng Would.'),
              qz("I'd like ___ a room.", ['book', 'to book'], 1),
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
              'Thường đi với: ever, never, already, yet, just, so far.',
            examples: [
              ex('I have visited Japan twice.', 'Tôi đã đến Nhật hai lần.'),
              ex('She has never eaten durian.', 'Cô ấy chưa từng ăn sầu riêng.'),
              ex('Have you finished your homework yet?', 'Bạn làm xong bài tập chưa?'),
              ex("I have just had lunch.", 'Tôi vừa ăn trưa xong.'),
              ex("They have already left.", 'Họ đã đi rồi.'),
            ],
            tipVi:
              'Vị trí trạng từ: just/already đứng GIỮA have và V3; yet đứng CUỐI câu phủ định/nghi vấn. "he/she/it" dùng "has".',
            mistakes: [
              mis('I have visit Japan.', 'I have visited Japan.', 'Sau have/has dùng V3 (quá khứ phân từ).'),
              mis('She has ate durian.', 'She has eaten durian.', 'eat → eaten (V3), không phải "ate" (V2).'),
            ],
            quiz: [
              qz('I have ___ this film.', ['saw', 'seen', 'see'], 1, 'see → seen (V3).'),
              qz('___ you ever been to Hue?', ['Did', 'Have', 'Are'], 1),
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
              ex('He has been ill since Monday.', 'Anh ấy ốm từ thứ Hai.'),
              ex('They have studied English for three years.', 'Họ học tiếng Anh được ba năm.'),
            ],
            tipVi:
              'Phân biệt: for + KHOẢNG (for 3 days), since + MỐC bắt đầu (since Monday, since 2019).',
            mistakes: [
              mis('I have lived here since ten years.', 'I have lived here for ten years.', '"ten years" là khoảng → dùng for.'),
              mis('She has worked here for 2019.', 'She has worked here since 2019.', '"2019" là mốc → dùng since.'),
            ],
            quiz: [
              qz('I have studied English ___ five years.', ['since', 'for'], 1),
              qz('He has lived here ___ 2020.', ['for', 'since'], 1),
            ],
          },
          {
            id: 'b1-pp-vs-past',
            titleVi: 'Hiện tại hoàn thành vs. Quá khứ đơn',
            titleEn: 'Present Perfect vs Past Simple',
            structure: 'have/has + V3 (chưa rõ lúc nào) • V2 (rõ thời điểm)',
            explainVi:
              '• Quá khứ đơn: có mốc thời gian rõ ràng (yesterday, in 2010, last week).\n' +
              '• Hiện tại hoàn thành: không nói rõ khi nào, nhấn vào kết quả/kinh nghiệm.',
            examples: [
              ex('I have been to Paris.', 'Tôi đã từng đến Paris.'),
              ex('I went to Paris in 2018.', 'Tôi đến Paris vào năm 2018.'),
              ex('Have you seen this film? — Yes, I saw it last week.', 'Bạn xem phim này chưa? — Rồi, tuần trước tôi xem.'),
              ex('She has finished her work.', 'Cô ấy làm xong việc rồi.'),
              ex('She finished her work at 5 p.m.', 'Cô ấy làm xong việc lúc 5 giờ chiều.'),
            ],
            tipVi:
              'Có mốc thời gian quá khứ rõ ràng (yesterday, ago, in 2010) → BẮT BUỘC dùng quá khứ đơn, không dùng hiện tại hoàn thành.',
            mistakes: [
              mis('I have gone to Paris in 2018.', 'I went to Paris in 2018.', 'Có "in 2018" → quá khứ đơn.'),
              mis('I saw this film already.', 'I have already seen this film.', '"already" (chưa rõ lúc nào) → hiện tại hoàn thành.'),
            ],
            quiz: [
              qz('I ___ him yesterday.', ['have seen', 'saw'], 1, 'Có "yesterday" → quá khứ đơn.'),
              qz('___ you ever ___ sushi?', ['Did / eat', 'Have / eaten'], 1, 'Hỏi kinh nghiệm → present perfect.'),
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
              ex("Look at those clouds — it's going to rain.", 'Nhìn mây kìa — trời sắp mưa.'),
              ex('Maybe she will come later.', 'Có lẽ lát nữa cô ấy sẽ đến.'),
            ],
            tipVi:
              'Quyết định NGAY lúc nói → will (I\'ll help you). Đã LÊN KẾ HOẠCH từ trước → be going to. Sau cả hai đều là động từ nguyên mẫu.',
            mistakes: [
              mis('I will to help you.', 'I will help you.', 'Sau "will" KHÔNG có "to".'),
              mis('She will helps you.', 'She will help you.', 'Sau "will" động từ nguyên mẫu, không thêm -s.'),
            ],
            quiz: [
              qz('The phone is ringing! I ___ answer it.', ["'m going to", "'ll"], 1, 'Quyết định ngay lúc nói → will.'),
              qz('After "will" we use:', ['to + V', 'V nguyên mẫu', 'V-ing'], 1),
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
              ex('They are getting married next month.', 'Tháng sau họ cưới.'),
              ex('What are you doing this weekend?', 'Cuối tuần này bạn làm gì?'),
            ],
            tipVi:
              'Dùng khi đã CHỐT lịch (có thời gian + người + nơi). Khác với "be going to" (chỉ là dự định). Cần thời gian tương lai đi kèm để khỏi nhầm với hiện tại.',
            mistakes: [
              mis("I meet my boss at 3 p.m. tomorrow.", "I'm meeting my boss at 3 p.m. tomorrow.", 'Lịch hẹn tương lai → hiện tại tiếp diễn.'),
              mis('We are fly to Da Nang on Friday.', 'We are flying to Da Nang on Friday.', 'Cần dạng V-ing (flying).'),
            ],
            quiz: [
              qz('I ___ the doctor at 9 tomorrow.', ['see', 'am seeing'], 1, 'Lịch hẹn đã chốt → present continuous.'),
              qz('Chọn câu chỉ lịch hẹn:', ['It will rain.', 'We are meeting at 5.'], 1),
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
              ex('Plants die if you don\'t water them.', 'Cây chết nếu bạn không tưới.'),
              ex('If I drink coffee at night, I can\'t sleep.', 'Nếu tối uống cà phê, tôi không ngủ được.'),
            ],
            tipVi:
              'Loại 0 nói về điều LUÔN đúng → có thể thay "if" bằng "when" mà nghĩa gần như không đổi.',
            mistakes: [
              mis('If you heat water, it will boil.', 'If you heat water, it boils.', 'Loại 0 (sự thật) → cả hai vế hiện tại, không dùng will.'),
              mis('If you will mix blue and yellow…', 'If you mix blue and yellow…', 'Sau "if" loại 0 KHÔNG dùng will.'),
            ],
            quiz: [
              qz('If you heat ice, it ___.', ['will melt', 'melts'], 1, 'Loại 0 → hiện tại.'),
              qz('Water ___ at 100°C.', ['boils', 'will boil'], 0),
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
              ex('I will call you if I have time.', 'Tôi sẽ gọi bạn nếu có thời gian.'),
              ex('If she comes, we will start.', 'Nếu cô ấy đến, chúng ta sẽ bắt đầu.'),
            ],
            tipVi:
              'Quy tắc vàng: SAU "if" KHÔNG dùng "will". "will" chỉ nằm ở vế chính.',
            mistakes: [
              mis('If it will rain, I will stay home.', 'If it rains, I will stay home.', 'Sau "if" dùng hiện tại đơn, không dùng will.'),
              mis('If you study hard, you pass.', 'If you study hard, you will pass.', 'Vế chính (kết quả tương lai) cần "will".'),
            ],
            quiz: [
              qz('If it ___, we will cancel the trip.', ['will rain', 'rains'], 1, 'Sau if → hiện tại.'),
              qz('If you ask him, he ___ help.', ['will', 'wills'], 0),
            ],
          },
          {
            id: 'b1-time-clauses',
            titleVi: 'Mệnh đề thời gian (when / as soon as)',
            titleEn: 'Time clauses',
            structure: 'when / as soon as / before / after + S + V(hiện tại), S + will + V',
            explainVi:
              'Sau when, as soon as, before, after, until… nói về tương lai, vẫn dùng HIỆN TẠI (không dùng will).',
            examples: [
              ex('I will call you when I arrive.', 'Tôi sẽ gọi bạn khi tôi đến nơi.'),
              ex('As soon as he comes, we will start.', 'Ngay khi anh ấy đến, chúng ta sẽ bắt đầu.'),
              ex('Turn off the lights before you leave.', 'Tắt đèn trước khi bạn rời đi.'),
              ex("I won't go until you call me.", 'Tôi sẽ không đi cho đến khi bạn gọi.'),
              ex('After I finish work, I will go home.', 'Sau khi xong việc, tôi sẽ về nhà.'),
            ],
            tipVi:
              'Giống điều kiện loại 1: sau từ chỉ thời gian (when/before/after/until/as soon as) dùng HIỆN TẠI dù nói về tương lai.',
            mistakes: [
              mis('I will call you when I will arrive.', 'I will call you when I arrive.', 'Sau "when" (tương lai) dùng hiện tại.'),
              mis('As soon as he will come…', 'As soon as he comes…', 'Sau "as soon as" dùng hiện tại.'),
            ],
            quiz: [
              qz('I will text you when I ___ there.', ['will get', 'get'], 1),
              qz("We'll wait until she ___.", ['arrives', 'will arrive'], 0),
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
              '"Should" = "nên" (đưa lời khuyên). Phủ định: shouldn\'t (không nên). Câu hỏi: Should I…?',
            examples: [
              ex('You should see a doctor.', 'Bạn nên đi khám bác sĩ.'),
              ex("You shouldn't eat too much sugar.", 'Bạn không nên ăn quá nhiều đường.'),
              ex('We ought to leave early.', 'Chúng ta nên đi sớm.'),
              ex('Should I call her now?', 'Tôi có nên gọi cho cô ấy bây giờ không?'),
              ex('You should drink more water.', 'Bạn nên uống nhiều nước hơn.'),
            ],
            tipVi:
              'Sau "should" là động từ NGUYÊN MẪU (không "to", không -s). "ought to" nghĩa giống "should" nhưng có "to".',
            mistakes: [
              mis('You should to see a doctor.', 'You should see a doctor.', 'Sau "should" KHÔNG có "to".'),
              mis('She should sees a doctor.', 'She should see a doctor.', 'Sau "should" động từ nguyên mẫu.'),
            ],
            quiz: [
              qz('You should ___ more.', ['to study', 'study', 'studies'], 1),
              qz('Lời khuyên "không nên" =', ["should not", "don't should"], 0),
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
              '• don\'t have to: không cần thiết (KHÁC mustn\'t!).',
            examples: [
              ex('You must wear a helmet.', 'Bạn phải đội mũ bảo hiểm.'),
              ex('I have to work on Saturday.', 'Tôi phải làm việc thứ Bảy.'),
              ex("You don't have to come if you're busy.", 'Bạn không nhất thiết phải đến nếu bận.'),
              ex("You mustn't smoke here.", 'Bạn không được hút thuốc ở đây.'),
              ex('She has to study for the exam.', 'Cô ấy phải học cho kỳ thi.'),
            ],
            tipVi:
              'Phân biệt quan trọng: mustn\'t = CẤM (không được làm); don\'t have to = KHÔNG CẦN (làm cũng được, không làm cũng được).',
            mistakes: [
              mis('He must to wear a helmet.', 'He must wear a helmet.', 'Sau "must" KHÔNG có "to".'),
              mis("You don't have to smoke here. (ý: cấm)", "You mustn't smoke here.", 'Cấm → mustn\'t, không phải don\'t have to.'),
            ],
            quiz: [
              qz('Đèn đỏ: You ___ stop. (bắt buộc)', ['must', "don't have to"], 0),
              qz('Bài tập tự chọn: You ___ do it. (không bắt buộc)', ["mustn't", "don't have to"], 1),
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
              ex('I like songs which have good lyrics.', 'Tôi thích những bài hát có lời hay.'),
              ex('The phone that I bought is broken.', 'Cái điện thoại tôi mua bị hỏng.'),
            ],
            tipVi:
              'Khi đại từ quan hệ là TÂN NGỮ, có thể lược bỏ: "the book (which) I told you about". Khi là CHỦ NGỮ thì không bỏ được.',
            mistakes: [
              mis('The man which lives next door…', 'The man who lives next door…', 'Chỉ người → who/that, không dùng which.'),
              mis('The book who I read…', 'The book which/that I read…', 'Chỉ vật → which/that, không dùng who.'),
            ],
            quiz: [
              qz('The woman ___ called you is my aunt.', ['which', 'who'], 1, 'Người → who.'),
              qz('This is the car ___ I want.', ['who', 'which'], 1, 'Vật → which.'),
            ],
          },
          {
            id: 'b1-gerund-infinitive',
            titleVi: 'Động từ + V-ing / to + V',
            titleEn: 'Gerund vs. Infinitive',
            structure: 'enjoy/like + V-ing • want/decide + to + V',
            explainVi:
              'Sau một số động từ dùng V-ing (enjoy, finish, avoid, mind), sau số khác dùng to-V (want, decide, hope, need, would like).',
            examples: [
              ex('I enjoy reading books.', 'Tôi thích đọc sách.'),
              ex('She wants to travel the world.', 'Cô ấy muốn đi khắp thế giới.'),
              ex('They decided to move to the city.', 'Họ quyết định chuyển lên thành phố.'),
              ex('Would you mind closing the door?', 'Bạn đóng giúp cửa được không?'),
              ex('I hope to see you soon.', 'Tôi mong sớm gặp bạn.'),
            ],
            tipVi:
              'Nhóm V-ing: enjoy, finish, avoid, mind, suggest, keep. Nhóm to-V: want, need, decide, hope, plan, promise, agree.',
            mistakes: [
              mis('I enjoy to read books.', 'I enjoy reading books.', 'Sau "enjoy" dùng V-ing.'),
              mis('She wants travelling the world.', 'She wants to travel the world.', 'Sau "want" dùng to + V.'),
            ],
            quiz: [
              qz('I want ___ home.', ['going', 'to go'], 1, 'want + to V.'),
              qz('She enjoys ___.', ['to dance', 'dancing'], 1, 'enjoy + V-ing.'),
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
              ex('Did you use to smoke?', 'Trước đây bạn có hút thuốc không?'),
              ex('There used to be a market here.', 'Trước đây ở đây có một cái chợ.'),
            ],
            tipVi:
              'Ở phủ định/nghi vấn (có did/didn\'t) thì viết "use to" (KHÔNG có "d"): didn\'t use to, Did you use to…?',
            mistakes: [
              mis("They didn't used to have a car.", "They didn't use to have a car.", 'Sau "didn\'t" dùng "use to" (bỏ d).'),
              mis('I used to playing football.', 'I used to play football.', 'Sau "used to" dùng động từ nguyên mẫu.'),
            ],
            quiz: [
              qz('I ___ live in Hue.', ['use to', 'used to'], 1, 'Khẳng định → used to.'),
              qz("She didn't ___ like coffee.", ['used to', 'use to'], 1, 'Sau didn\'t → use to.'),
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
              ex('If she spoke English, she would get the job.', 'Nếu cô ấy nói được tiếng Anh, cô ấy sẽ được nhận việc.'),
              ex("I wouldn't do that if I were you.", 'Nếu là bạn, tôi sẽ không làm vậy.'),
            ],
            tipVi:
              'Loại 1 (có thật) vs loại 2 (giả định): loại 2 lùi thì ở vế if (V2) và dùng "would" thay "will". Thành ngữ khuyên bảo: "If I were you, I would…".',
            mistakes: [
              mis('If I was you, I would accept.', 'If I were you, I would accept.', 'Với điều kiện loại 2, "to be" dùng "were" cho mọi chủ ngữ.'),
              mis('If I had more time, I will learn piano.', 'If I had more time, I would learn piano.', 'Vế chính loại 2 dùng "would", không "will".'),
            ],
            quiz: [
              qz('If I ___ rich, I would travel.', ['am', 'were'], 1, 'Loại 2 → were.'),
              qz('If he studied, he ___ pass.', ['will', 'would'], 1),
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
              ex("If you had told me, I wouldn't have worried.", 'Nếu bạn nói cho tôi biết, tôi đã không lo lắng.'),
              ex('I would have come if you had invited me.', 'Tôi đã đến nếu bạn mời tôi.'),
            ],
            tipVi:
              'Công thức: vế if dùng "had + V3" (quá khứ hoàn thành), vế chính dùng "would have + V3". Nói về điều ĐÃ KHÔNG xảy ra.',
            mistakes: [
              mis('If I would have studied, I would have passed.', 'If I had studied, I would have passed.', 'Sau "if" loại 3 dùng "had + V3", KHÔNG dùng would.'),
              mis('If I had studied, I would passed.', 'If I had studied, I would have passed.', 'Vế chính cần "would have + V3".'),
            ],
            quiz: [
              qz('If I ___ known, I would have called.', ['had', 'have', 'would have'], 0),
              qz('She would have come if she ___ time.', ['had had', 'has had'], 0),
            ],
          },
          {
            id: 'b2-wish',
            titleVi: 'Wish / If only (ước)',
            titleEn: 'Wish / If only',
            structure: 'S + wish + S + V2 (hiện tại) / had + V3 (quá khứ)',
            explainVi:
              '• wish + quá khứ đơn: ước điều trái hiện tại.\n' +
              '• wish + quá khứ hoàn thành: tiếc điều trong quá khứ.\n' +
              '• wish + would: mong ai đó thay đổi hành vi gây khó chịu.',
            examples: [
              ex('I wish I had more money.', 'Ước gì tôi có nhiều tiền hơn.'),
              ex('I wish I could speak French.', 'Ước gì tôi nói được tiếng Pháp.'),
              ex('She wishes she had studied harder.', 'Cô ấy ước mình đã học chăm hơn.'),
              ex('I wish you would stop shouting.', 'Ước gì bạn ngừng la hét.'),
              ex('If only I were taller!', 'Giá mà tôi cao hơn!'),
            ],
            tipVi:
              'Giống điều kiện: ước hiện tại → lùi một thì (wish I had); tiếc quá khứ → lùi hai thì (wish I had had). "If only" mạnh hơn "wish".',
            mistakes: [
              mis('I wish I have more money.', 'I wish I had more money.', 'Ước trái hiện tại → lùi về quá khứ đơn (had).'),
              mis('I wish I studied harder. (tiếc quá khứ)', 'I wish I had studied harder.', 'Tiếc quá khứ → wish + had + V3.'),
            ],
            quiz: [
              qz('I wish I ___ taller.', ['am', 'were'], 1, 'Ước trái hiện tại → were.'),
              qz('She wishes she ___ harder. (tiếc quá khứ)', ['studied', 'had studied'], 1),
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
              ex('My car is being repaired.', 'Xe của tôi đang được sửa.'),
              ex('The letter has been delivered.', 'Lá thư đã được giao.'),
            ],
            tipVi:
              'Bị động = đúng dạng "be" theo thì + V3. Chỉ thêm "by + người làm" khi cần nói rõ ai làm.',
            mistakes: [
              mis('This bridge was build in 1990.', 'This bridge was built in 1990.', 'Bị động dùng V3 (built), không phải nguyên mẫu.'),
              mis('English speaks all over the world.', 'English is spoken all over the world.', 'Cần "be + V3" cho bị động.'),
            ],
            quiz: [
              qz('The room ___ cleaned every day.', ['is', 'is being', 'was'], 0, 'Thói quen hiện tại → is cleaned.'),
              qz('Bị động của "They make cars here":', ['Cars are made here.', 'Cars are make here.'], 0),
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
              ex('I need to get my laptop fixed.', 'Tôi cần mang laptop đi sửa.'),
              ex('Where do you have your hair done?', 'Bạn làm tóc ở đâu vậy?'),
            ],
            tipVi:
              'Phân biệt: "I repaired my car" (tự sửa) vs "I had my car repaired" (thuê người sửa). Vật + V3 (quá khứ phân từ).',
            mistakes: [
              mis('I had my car repair.', 'I had my car repaired.', 'Cấu trúc nhờ vả dùng V3 (repaired).'),
              mis('I cut my hair yesterday. (ý: đi tiệm)', 'I had my hair cut yesterday.', 'Nhờ người khác làm → have something done.'),
            ],
            quiz: [
              qz('I had my house ___.', ['paint', 'painted'], 1, 'have + O + V3.'),
              qz('She is getting her hair ___.', ['cut', 'cutting'], 0),
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
              '"I am tired" → He said he was tired. (am→was, will→would, can→could)',
            examples: [
              ex('She said she was busy.', 'Cô ấy nói cô ấy bận.'),
              ex('He told me he would come.', 'Anh ấy bảo tôi rằng anh ấy sẽ đến.'),
              ex('They said they had finished.', 'Họ nói họ đã làm xong.'),
              ex('She said she could help us.', 'Cô ấy nói cô ấy có thể giúp chúng tôi.'),
              ex('He said he liked the food.', 'Anh ấy nói anh ấy thích món ăn.'),
            ],
            tipVi:
              'Phân biệt say và tell: "tell" cần tân ngữ (tell me), "say" thì không (say that). Lùi thì: V→V2, V2→had V3, will→would, can→could.',
            mistakes: [
              mis('She said me she was busy.', 'She told me she was busy.', '"said" không đi với tân ngữ; dùng "told me".'),
              mis('He said he will come.', 'He said he would come.', 'Lùi thì: will → would.'),
            ],
            quiz: [
              qz('"I am happy" → She said she ___ happy.', ['is', 'was'], 1, 'Lùi thì: am → was.'),
              qz('She ___ me she was tired.', ['said', 'told'], 1, 'Có tân ngữ "me" → told.'),
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
              ex('She asked if I could help.', 'Cô ấy hỏi tôi có giúp được không.'),
              ex('He asked why I was late.', 'Anh ấy hỏi sao tôi muộn.'),
            ],
            tipVi:
              'Câu tường thuật trở về trật tự CÂU KỂ (chủ ngữ + động từ), KHÔNG đảo và KHÔNG dùng do/does/did.',
            mistakes: [
              mis('He asked where did I live.', 'He asked where I lived.', 'Tường thuật câu hỏi: không đảo, không "did".'),
              mis('She asked was I OK.', 'She asked if I was OK.', 'Câu hỏi Yes/No → dùng "if/whether".'),
            ],
            quiz: [
              qz('He asked where I ___.', ['live', 'lived', 'did live'], 1),
              qz('She asked ___ I was hungry.', ['if', 'that'], 0, 'Yes/No → if.'),
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
              ex("They must know each other.", 'Chắc họ quen nhau.'),
              ex('It might rain later.', 'Lát nữa có thể mưa.'),
            ],
            tipVi:
              'Để suy đoán "chắc chắn KHÔNG" dùng "can\'t" (KHÔNG dùng "mustn\'t" — mustn\'t nghĩa là cấm). Sau modal là động từ nguyên mẫu.',
            mistakes: [
              mis("That mustn't be true.", "That can't be true.", 'Suy đoán "không thể đúng" dùng "can\'t", không "mustn\'t".'),
              mis('He must to be busy.', 'He must be busy.', 'Sau "must" KHÔNG có "to".'),
            ],
            quiz: [
              qz('The light is on — someone ___ be home.', ['must', "can't"], 0),
              qz("He's never lies — that ___ be false.", ["can't", 'must'], 0),
            ],
          },
          {
            id: 'b2-non-defining',
            titleVi: 'Mệnh đề quan hệ không xác định (có dấu phẩy)',
            titleEn: 'Non-defining relative clauses',
            structure: 'danh từ, who/which + … , (thông tin thêm)',
            explainVi:
              'Bổ sung thông tin KHÔNG bắt buộc (bỏ đi câu vẫn đủ nghĩa). Đặt giữa hai dấu phẩy, KHÔNG dùng "that".',
            examples: [
              ex('My brother, who lives in Hue, is a teacher.', 'Anh trai tôi, người sống ở Huế, là giáo viên.'),
              ex('Hanoi, which is the capital, is very old.', 'Hà Nội, thủ đô, rất cổ kính.'),
              ex('Our manager, who is very kind, helped us.', 'Quản lý của chúng tôi, người rất tốt bụng, đã giúp chúng tôi.'),
              ex('This book, which I read last year, is excellent.', 'Cuốn sách này, tôi đọc năm ngoái, rất hay.'),
              ex('Ms. Lan, who teaches us English, is from Hue.', 'Cô Lan, người dạy chúng tôi tiếng Anh, quê ở Huế.'),
            ],
            tipVi:
              'Mệnh đề KHÔNG xác định: có DẤU PHẨY, KHÔNG dùng "that", và KHÔNG được lược bỏ đại từ quan hệ.',
            mistakes: [
              mis('My brother, that lives in Hue, is a teacher.', 'My brother, who lives in Hue, is a teacher.', 'Mệnh đề không xác định KHÔNG dùng "that".'),
              mis('Hanoi which is the capital is very old.', 'Hanoi, which is the capital, is very old.', 'Cần hai dấu phẩy bao quanh thông tin thêm.'),
            ],
            quiz: [
              qz('Hue, ___ is in central Vietnam, is beautiful.', ['that', 'which'], 1, 'Không xác định → which, không that.'),
              qz('Mệnh đề không xác định có:', ['dấu phẩy', 'không dấu phẩy'], 0),
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
              'give up (từ bỏ), look for (tìm), find out (phát hiện), turn off (tắt), get up (thức dậy).',
            examples: [
              ex("Don't give up — keep trying!", 'Đừng bỏ cuộc — cứ cố gắng!'),
              ex('I am looking for my keys.', 'Tôi đang tìm chìa khóa.'),
              ex('Please turn off the lights.', 'Làm ơn tắt đèn.'),
              ex('I need to find out the truth.', 'Tôi cần tìm ra sự thật.'),
              ex('She gets along well with everyone.', 'Cô ấy hòa hợp với mọi người.'),
            ],
            tipVi:
              'Có loại "tách được": turn the light off = turn off the light. Nhưng nếu tân ngữ là ĐẠI TỪ thì BẮT BUỘC tách: "turn it off" (KHÔNG "turn off it").',
            mistakes: [
              mis('Please turn off it.', 'Please turn it off.', 'Đại từ (it) phải đứng giữa: turn it off.'),
              mis("I am looking my keys.", 'I am looking for my keys.', 'Thiếu giới từ "for".'),
            ],
            quiz: [
              qz('Please turn ___. (it)', ['off it', 'it off'], 1, 'Đại từ đứng giữa.'),
              qz('"phát hiện ra" =', ['find out', 'find for', 'look out'], 0),
            ],
          },
          {
            id: 'b2-linking',
            titleVi: 'Từ nối (although / however / despite)',
            titleEn: 'Linking words',
            structure: 'although + mệnh đề • despite + danh từ/V-ing • however, …',
            explainVi:
              'Dùng để nối ý tương phản, làm câu mạch lạc hơn.\n' +
              '• although + mệnh đề (S + V).   • despite/in spite of + danh từ/V-ing.   • however đứng đầu câu, có dấu phẩy.',
            examples: [
              ex('Although it was raining, we went out.', 'Mặc dù trời mưa, chúng tôi vẫn ra ngoài.'),
              ex('Despite the rain, we went out.', 'Bất chấp cơn mưa, chúng tôi vẫn ra ngoài.'),
              ex("The plan was risky. However, it worked.", 'Kế hoạch rủi ro. Tuy nhiên, nó đã thành công.'),
              ex('In spite of being tired, she kept working.', 'Dù mệt, cô ấy vẫn tiếp tục làm việc.'),
              ex('He passed the exam although he didn\'t study much.', 'Anh ấy đậu dù không học nhiều.'),
            ],
            tipVi:
              'Quy tắc ngữ pháp: although + MỆNH ĐỀ (có động từ); despite/in spite of + DANH TỪ hoặc V-ing. Đừng dùng "despite of".',
            mistakes: [
              mis('Despite it was raining, we went out.', 'Although it was raining, we went out.', 'despite đi với danh từ/V-ing, không đi với mệnh đề.'),
              mis('In spite of the rain, but we went out.', 'In spite of the rain, we went out.', 'Không dùng "but" kèm theo.'),
            ],
            quiz: [
              qz('___ the rain, we went out.', ['Although', 'Despite'], 1, 'despite + danh từ (the rain).'),
              qz('___ it was cold, we swam.', ['Despite', 'Although'], 1, 'although + mệnh đề.'),
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
              ex("It's raining cats and dogs.", 'Trời mưa như trút nước.'),
              ex("Let's call it a day.", 'Thôi nghỉ tay hôm nay nhé.'),
            ],
            tipVi:
              'Đừng dịch từng từ. "Break a leg" KHÔNG phải "gãy chân" mà là "chúc may mắn" (thường nói trước khi biểu diễn).',
            mistakes: [
              mis("It's a cake piece.", "It's a piece of cake.", 'Thành ngữ cố định — không đổi trật tự từ.'),
              mis('Raining dogs and cats.', 'Raining cats and dogs.', 'Đúng thứ tự cố định: cats and dogs.'),
            ],
            quiz: [
              qz('"Việc dễ ợt" =', ['a piece of cake', 'a cup of tea', 'break a leg'], 0),
              qz('"Hiếm khi" =', ['once in a blue moon', 'rain cats and dogs'], 0),
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
