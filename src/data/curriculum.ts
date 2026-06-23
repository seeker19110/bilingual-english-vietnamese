// ──────────────────────────────────────────────────────────────────────────
// LỘ TRÌNH HỌC TỪ VỰNG — phần NỀN TẢNG (thủ công, sắp theo "vòng tròn" chủ đề)
//
// Ý tưởng: người mới bắt đầu học theo vòng tròn liên quan nhau:
//   chữ cái → số đếm → màu sắc → gia đình → cơ thể → đồ ăn → ...
// Mỗi vòng (circle) gom ~20 từ cùng chủ đề, kèm vài CÂU THÔNG DỤNG dùng
// chính những từ trong vòng đó (để học từ xong là ráp được câu ngay).
//
// Sau khi học hết phần nền tảng này, lib/curriculum.ts sẽ tự động nối tiếp
// bằng các từ còn lại trong dictionary.json (xem hàm getLearningPath).
// ──────────────────────────────────────────────────────────────────────────

import type { DictEntry } from '../types'

export interface Circle {
  id: string
  titleVi: string
  titleEn: string
  emoji: string
  words: DictEntry[]
  // Câu thông dụng ráp từ chính các từ trong vòng này
  sentences: { en: string; vi: string }[]
}

// Rút gọn: hàm tạo 1 mục từ cho nhanh (ipa để trống — PronounceButton vẫn đọc được)
const w = (word: string, pos: string, vi: string, ex_en: string, ex_vi: string): DictEntry =>
  ({ word, pos, vi, ex_en, ex_vi })

export const FOUNDATION: Circle[] = [
  // ── Vòng 1: Chữ cái ──────────────────────────────────────────────────────
  {
    id: 'letters',
    titleVi: 'Bảng chữ cái',
    titleEn: 'The Alphabet',
    emoji: '🔤',
    words: 'a b c d e f g h i j k l m n o p q r s t u v w x y z'.split(' ').map(c =>
      w(c.toUpperCase(), 'letter', `chữ cái ${c.toUpperCase()}`, `The letter ${c.toUpperCase()}.`, `Chữ cái ${c.toUpperCase()}.`),
    ),
    sentences: [
      { en: 'How do you spell it?', vi: 'Bạn đánh vần nó thế nào?' },
      { en: 'My name starts with the letter A.', vi: 'Tên tôi bắt đầu bằng chữ A.' },
      { en: 'Can you say the alphabet?', vi: 'Bạn đọc được bảng chữ cái không?' },
    ],
  },

  // ── Vòng 2: Số đếm ───────────────────────────────────────────────────────
  {
    id: 'numbers',
    titleVi: 'Số đếm',
    titleEn: 'Numbers',
    emoji: '🔢',
    words: [
      w('zero', 'num', 'số không', 'Zero means nothing.', 'Số không nghĩa là không có gì.'),
      w('one', 'num', 'một', 'I have one brother.', 'Tôi có một anh trai.'),
      w('two', 'num', 'hai', 'She has two cats.', 'Cô ấy có hai con mèo.'),
      w('three', 'num', 'ba', 'There are three apples.', 'Có ba quả táo.'),
      w('four', 'num', 'bốn', 'A table has four legs.', 'Cái bàn có bốn chân.'),
      w('five', 'num', 'năm', 'I have five fingers.', 'Tôi có năm ngón tay.'),
      w('six', 'num', 'sáu', 'It is six o\'clock.', 'Bây giờ là sáu giờ.'),
      w('seven', 'num', 'bảy', 'A week has seven days.', 'Một tuần có bảy ngày.'),
      w('eight', 'num', 'tám', 'I sleep eight hours.', 'Tôi ngủ tám tiếng.'),
      w('nine', 'num', 'chín', 'The store opens at nine.', 'Cửa hàng mở lúc chín giờ.'),
      w('ten', 'num', 'mười', 'I have ten dollars.', 'Tôi có mười đô la.'),
      w('eleven', 'num', 'mười một', 'He is eleven years old.', 'Cậu ấy mười một tuổi.'),
      w('twelve', 'num', 'mười hai', 'A year has twelve months.', 'Một năm có mười hai tháng.'),
      w('thirteen', 'num', 'mười ba', 'She is thirteen now.', 'Cô bé mười ba tuổi rồi.'),
      w('twenty', 'num', 'hai mươi', 'I am twenty years old.', 'Tôi hai mươi tuổi.'),
      w('thirty', 'num', 'ba mươi', 'It costs thirty dollars.', 'Nó giá ba mươi đô.'),
      w('forty', 'num', 'bốn mươi', 'He runs forty minutes.', 'Anh ấy chạy bốn mươi phút.'),
      w('fifty', 'num', 'năm mươi', 'There are fifty people.', 'Có năm mươi người.'),
      w('hundred', 'num', 'một trăm', 'I have a hundred books.', 'Tôi có một trăm cuốn sách.'),
      w('thousand', 'num', 'một nghìn', 'It costs a thousand dollars.', 'Nó giá một nghìn đô.'),
    ],
    sentences: [
      { en: 'How old are you?', vi: 'Bạn bao nhiêu tuổi?' },
      { en: 'I have two children.', vi: 'Tôi có hai con.' },
      { en: 'It costs ten dollars.', vi: 'Nó giá mười đô la.' },
      { en: 'There are five of us.', vi: 'Chúng tôi có năm người.' },
    ],
  },

  // ── Vòng 3: Màu sắc ──────────────────────────────────────────────────────
  {
    id: 'colors',
    titleVi: 'Màu sắc',
    titleEn: 'Colors',
    emoji: '🎨',
    words: [
      w('red', 'n', 'màu đỏ', 'The apple is red.', 'Quả táo màu đỏ.'),
      w('orange', 'n', 'màu cam', 'I like the orange shirt.', 'Tôi thích cái áo màu cam.'),
      w('yellow', 'n', 'màu vàng', 'The sun is yellow.', 'Mặt trời màu vàng.'),
      w('green', 'n', 'màu xanh lá', 'Grass is green.', 'Cỏ màu xanh lá.'),
      w('blue', 'n', 'màu xanh dương', 'The sky is blue.', 'Bầu trời màu xanh.'),
      w('purple', 'n', 'màu tím', 'She wears a purple dress.', 'Cô ấy mặc váy tím.'),
      w('pink', 'n', 'màu hồng', 'The flower is pink.', 'Bông hoa màu hồng.'),
      w('brown', 'n', 'màu nâu', 'His hair is brown.', 'Tóc anh ấy màu nâu.'),
      w('black', 'n', 'màu đen', 'I have black shoes.', 'Tôi có đôi giày đen.'),
      w('white', 'n', 'màu trắng', 'The snow is white.', 'Tuyết màu trắng.'),
      w('gray', 'n', 'màu xám', 'The cat is gray.', 'Con mèo màu xám.'),
      w('color', 'n', 'màu sắc', 'What is your favorite color?', 'Màu yêu thích của bạn là gì?'),
    ],
    sentences: [
      { en: 'What color is it?', vi: 'Nó màu gì?' },
      { en: 'My favorite color is blue.', vi: 'Màu yêu thích của tôi là xanh dương.' },
      { en: 'I want the red one.', vi: 'Tôi muốn cái màu đỏ.' },
    ],
  },

  // ── Vòng 4: Gia đình ─────────────────────────────────────────────────────
  {
    id: 'family',
    titleVi: 'Gia đình',
    titleEn: 'Family',
    emoji: '👪',
    words: [
      w('family', 'n', 'gia đình', 'I love my family.', 'Tôi yêu gia đình mình.'),
      w('father', 'n', 'bố, cha', 'My father is a teacher.', 'Bố tôi là giáo viên.'),
      w('mother', 'n', 'mẹ', 'My mother cooks well.', 'Mẹ tôi nấu ăn ngon.'),
      w('parents', 'n', 'bố mẹ', 'My parents live here.', 'Bố mẹ tôi sống ở đây.'),
      w('son', 'n', 'con trai', 'They have one son.', 'Họ có một người con trai.'),
      w('daughter', 'n', 'con gái', 'Their daughter is smart.', 'Con gái họ thông minh.'),
      w('brother', 'n', 'anh/em trai', 'My brother is tall.', 'Anh trai tôi cao.'),
      w('sister', 'n', 'chị/em gái', 'I have a younger sister.', 'Tôi có một em gái.'),
      w('grandfather', 'n', 'ông', 'My grandfather is old.', 'Ông tôi đã già.'),
      w('grandmother', 'n', 'bà', 'My grandmother tells stories.', 'Bà tôi kể chuyện.'),
      w('husband', 'n', 'chồng', 'Her husband is kind.', 'Chồng cô ấy tốt bụng.'),
      w('wife', 'n', 'vợ', 'His wife is a doctor.', 'Vợ anh ấy là bác sĩ.'),
      w('child', 'n', 'đứa trẻ', 'The child is sleeping.', 'Đứa trẻ đang ngủ.'),
      w('baby', 'n', 'em bé', 'The baby is crying.', 'Em bé đang khóc.'),
    ],
    sentences: [
      { en: 'How many people are in your family?', vi: 'Gia đình bạn có mấy người?' },
      { en: 'This is my mother.', vi: 'Đây là mẹ tôi.' },
      { en: 'I have one brother and one sister.', vi: 'Tôi có một anh trai và một em gái.' },
    ],
  },

  // ── Vòng 5: Cơ thể ───────────────────────────────────────────────────────
  {
    id: 'body',
    titleVi: 'Cơ thể',
    titleEn: 'The Body',
    emoji: '🧍',
    words: [
      w('head', 'n', 'đầu', 'My head hurts.', 'Đầu tôi đau.'),
      w('hair', 'n', 'tóc', 'She has long hair.', 'Cô ấy có mái tóc dài.'),
      w('face', 'n', 'khuôn mặt', 'He has a kind face.', 'Anh ấy có khuôn mặt hiền.'),
      w('eye', 'n', 'mắt', 'Her eyes are brown.', 'Mắt cô ấy màu nâu.'),
      w('ear', 'n', 'tai', 'I have two ears.', 'Tôi có hai cái tai.'),
      w('nose', 'n', 'mũi', 'My nose is cold.', 'Mũi tôi lạnh.'),
      w('mouth', 'n', 'miệng', 'Open your mouth.', 'Há miệng ra.'),
      w('tooth', 'n', 'răng', 'Brush your teeth.', 'Đánh răng đi.'),
      w('hand', 'n', 'bàn tay', 'Wash your hands.', 'Rửa tay đi.'),
      w('arm', 'n', 'cánh tay', 'He broke his arm.', 'Anh ấy bị gãy tay.'),
      w('leg', 'n', 'chân (cẳng)', 'My legs are tired.', 'Chân tôi mỏi.'),
      w('foot', 'n', 'bàn chân', 'My foot hurts.', 'Bàn chân tôi đau.'),
      w('finger', 'n', 'ngón tay', 'I cut my finger.', 'Tôi bị đứt tay.'),
      w('stomach', 'n', 'bụng, dạ dày', 'My stomach hurts.', 'Bụng tôi đau.'),
      w('heart', 'n', 'tim', 'My heart beats fast.', 'Tim tôi đập nhanh.'),
      w('body', 'n', 'cơ thể', 'Take care of your body.', 'Hãy chăm sóc cơ thể bạn.'),
    ],
    sentences: [
      { en: 'My head hurts.', vi: 'Tôi đau đầu.' },
      { en: 'Wash your hands before eating.', vi: 'Rửa tay trước khi ăn.' },
      { en: 'She has beautiful eyes.', vi: 'Cô ấy có đôi mắt đẹp.' },
    ],
  },

  // ── Vòng 6: Đồ ăn & thức uống ────────────────────────────────────────────
  {
    id: 'food',
    titleVi: 'Đồ ăn & thức uống',
    titleEn: 'Food & Drink',
    emoji: '🍚',
    words: [
      w('food', 'n', 'thức ăn', 'The food is delicious.', 'Món ăn rất ngon.'),
      w('water', 'n', 'nước', 'I drink water every day.', 'Tôi uống nước mỗi ngày.'),
      w('rice', 'n', 'cơm, gạo', 'We eat rice every day.', 'Chúng tôi ăn cơm mỗi ngày.'),
      w('bread', 'n', 'bánh mì', 'I eat bread for breakfast.', 'Tôi ăn bánh mì sáng.'),
      w('meat', 'n', 'thịt', 'She does not eat meat.', 'Cô ấy không ăn thịt.'),
      w('fish', 'n', 'cá', 'This fish is fresh.', 'Con cá này tươi.'),
      w('egg', 'n', 'trứng', 'I want two eggs.', 'Tôi muốn hai quả trứng.'),
      w('fruit', 'n', 'trái cây', 'Fruit is good for you.', 'Trái cây tốt cho bạn.'),
      w('vegetable', 'n', 'rau củ', 'Eat your vegetables.', 'Ăn rau đi.'),
      w('milk', 'n', 'sữa', 'The baby drinks milk.', 'Em bé uống sữa.'),
      w('coffee', 'n', 'cà phê', 'I drink coffee in the morning.', 'Tôi uống cà phê buổi sáng.'),
      w('tea', 'n', 'trà', 'She likes green tea.', 'Cô ấy thích trà xanh.'),
      w('sugar', 'n', 'đường', 'No sugar, please.', 'Đừng cho đường nhé.'),
      w('salt', 'n', 'muối', 'Add a little salt.', 'Cho thêm chút muối.'),
      w('breakfast', 'n', 'bữa sáng', 'I have breakfast at seven.', 'Tôi ăn sáng lúc bảy giờ.'),
      w('lunch', 'n', 'bữa trưa', 'Let\'s have lunch together.', 'Cùng ăn trưa nhé.'),
      w('dinner', 'n', 'bữa tối', 'Dinner is ready.', 'Bữa tối xong rồi.'),
      w('eat', 'v', 'ăn', 'I want to eat now.', 'Tôi muốn ăn bây giờ.'),
    ],
    sentences: [
      { en: 'I am hungry.', vi: 'Tôi đói.' },
      { en: 'Can I have some water?', vi: 'Cho tôi xin chút nước được không?' },
      { en: 'What do you want to eat?', vi: 'Bạn muốn ăn gì?' },
      { en: 'The food is delicious.', vi: 'Món ăn rất ngon.' },
    ],
  },

  // ── Vòng 7: Động vật ─────────────────────────────────────────────────────
  {
    id: 'animals',
    titleVi: 'Động vật',
    titleEn: 'Animals',
    emoji: '🐶',
    words: [
      w('animal', 'n', 'động vật', 'I love animals.', 'Tôi yêu động vật.'),
      w('dog', 'n', 'con chó', 'The dog is friendly.', 'Con chó thân thiện.'),
      w('cat', 'n', 'con mèo', 'My cat sleeps a lot.', 'Mèo của tôi ngủ nhiều.'),
      w('bird', 'n', 'con chim', 'A bird is singing.', 'Một con chim đang hót.'),
      w('chicken', 'n', 'con gà', 'We have ten chickens.', 'Chúng tôi có mười con gà.'),
      w('pig', 'n', 'con lợn', 'The pig is big.', 'Con lợn to.'),
      w('cow', 'n', 'con bò', 'The cow gives milk.', 'Con bò cho sữa.'),
      w('horse', 'n', 'con ngựa', 'He rides a horse.', 'Anh ấy cưỡi ngựa.'),
      w('rabbit', 'n', 'con thỏ', 'The rabbit is fast.', 'Con thỏ chạy nhanh.'),
      w('mouse', 'n', 'con chuột', 'The cat caught a mouse.', 'Con mèo bắt được chuột.'),
      w('elephant', 'n', 'con voi', 'An elephant is huge.', 'Con voi rất to.'),
      w('tiger', 'n', 'con hổ', 'The tiger is dangerous.', 'Con hổ nguy hiểm.'),
      w('monkey', 'n', 'con khỉ', 'The monkey is clever.', 'Con khỉ thông minh.'),
      w('snake', 'n', 'con rắn', 'I am afraid of snakes.', 'Tôi sợ rắn.'),
      w('insect', 'n', 'côn trùng', 'There is an insect here.', 'Có con côn trùng ở đây.'),
      w('fly', 'v', 'bay', 'Birds can fly.', 'Chim có thể bay.'),
    ],
    sentences: [
      { en: 'Do you have a pet?', vi: 'Bạn có nuôi thú cưng không?' },
      { en: 'I have a dog and a cat.', vi: 'Tôi có một con chó và một con mèo.' },
      { en: 'The dog is friendly.', vi: 'Con chó rất thân thiện.' },
    ],
  },

  // ── Vòng 8: Thời gian & ngày tháng ───────────────────────────────────────
  {
    id: 'time',
    titleVi: 'Thời gian & ngày tháng',
    titleEn: 'Time & Days',
    emoji: '🕐',
    words: [
      w('time', 'n', 'thời gian', 'What time is it?', 'Mấy giờ rồi?'),
      w('day', 'n', 'ngày', 'Have a nice day.', 'Chúc một ngày tốt lành.'),
      w('week', 'n', 'tuần', 'See you next week.', 'Hẹn gặp tuần sau.'),
      w('month', 'n', 'tháng', 'I am busy this month.', 'Tháng này tôi bận.'),
      w('year', 'n', 'năm', 'Happy New Year!', 'Chúc mừng năm mới!'),
      w('hour', 'n', 'giờ (60 phút)', 'I wait one hour.', 'Tôi đợi một tiếng.'),
      w('minute', 'n', 'phút', 'Wait a minute.', 'Đợi một phút.'),
      w('today', 'adv', 'hôm nay', 'Today is Monday.', 'Hôm nay là thứ Hai.'),
      w('tomorrow', 'adv', 'ngày mai', 'See you tomorrow.', 'Hẹn gặp ngày mai.'),
      w('yesterday', 'adv', 'hôm qua', 'I was busy yesterday.', 'Hôm qua tôi bận.'),
      w('morning', 'n', 'buổi sáng', 'Good morning!', 'Chào buổi sáng!'),
      w('afternoon', 'n', 'buổi chiều', 'Good afternoon!', 'Chào buổi chiều!'),
      w('evening', 'n', 'buổi tối', 'Good evening!', 'Chào buổi tối!'),
      w('night', 'n', 'ban đêm', 'Good night!', 'Chúc ngủ ngon!'),
      w('Monday', 'n', 'thứ Hai', 'I work on Monday.', 'Tôi làm việc thứ Hai.'),
      w('Friday', 'n', 'thứ Sáu', 'Friday is my day off.', 'Thứ Sáu tôi nghỉ.'),
      w('Saturday', 'n', 'thứ Bảy', 'We rest on Saturday.', 'Chúng tôi nghỉ thứ Bảy.'),
      w('Sunday', 'n', 'Chủ nhật', 'I sleep late on Sunday.', 'Chủ nhật tôi ngủ nướng.'),
    ],
    sentences: [
      { en: 'What time is it?', vi: 'Mấy giờ rồi?' },
      { en: 'See you tomorrow.', vi: 'Hẹn gặp ngày mai.' },
      { en: 'I am free this week.', vi: 'Tuần này tôi rảnh.' },
    ],
  },

  // ── Vòng 9: Đại từ & lời chào ────────────────────────────────────────────
  {
    id: 'greetings',
    titleVi: 'Đại từ & lời chào',
    titleEn: 'Pronouns & Greetings',
    emoji: '👋',
    words: [
      w('I', 'pron', 'tôi', 'I am a student.', 'Tôi là học sinh.'),
      w('you', 'pron', 'bạn', 'You are kind.', 'Bạn thật tốt bụng.'),
      w('he', 'pron', 'anh ấy', 'He is my friend.', 'Anh ấy là bạn tôi.'),
      w('she', 'pron', 'cô ấy', 'She is a doctor.', 'Cô ấy là bác sĩ.'),
      w('we', 'pron', 'chúng tôi', 'We are happy.', 'Chúng tôi vui.'),
      w('they', 'pron', 'họ', 'They are here.', 'Họ ở đây.'),
      w('it', 'pron', 'nó', 'It is a book.', 'Đó là một cuốn sách.'),
      w('hello', 'interj', 'xin chào', 'Hello, how are you?', 'Xin chào, bạn khỏe không?'),
      w('hi', 'interj', 'chào (thân mật)', 'Hi, nice to meet you.', 'Chào, rất vui được gặp bạn.'),
      w('goodbye', 'interj', 'tạm biệt', 'Goodbye, see you soon.', 'Tạm biệt, hẹn sớm gặp lại.'),
      w('please', 'adv', 'làm ơn', 'Please help me.', 'Làm ơn giúp tôi.'),
      w('thanks', 'interj', 'cảm ơn', 'Thanks for your help.', 'Cảm ơn sự giúp đỡ của bạn.'),
      w('sorry', 'adj', 'xin lỗi', 'I am sorry.', 'Tôi xin lỗi.'),
      w('yes', 'adv', 'vâng, có', 'Yes, I agree.', 'Vâng, tôi đồng ý.'),
      w('no', 'adv', 'không', 'No, thank you.', 'Không, cảm ơn.'),
      w('name', 'n', 'tên', 'What is your name?', 'Tên bạn là gì?'),
    ],
    sentences: [
      { en: 'Hello, how are you?', vi: 'Xin chào, bạn khỏe không?' },
      { en: 'What is your name?', vi: 'Tên bạn là gì?' },
      { en: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.' },
      { en: 'Thank you very much.', vi: 'Cảm ơn bạn rất nhiều.' },
    ],
  },

  // ── Vòng 10: Động từ cơ bản ──────────────────────────────────────────────
  {
    id: 'verbs',
    titleVi: 'Động từ cơ bản',
    titleEn: 'Basic Verbs',
    emoji: '🏃',
    words: [
      w('be', 'v', 'thì, là, ở', 'I want to be happy.', 'Tôi muốn được hạnh phúc.'),
      w('have', 'v', 'có', 'I have a question.', 'Tôi có một câu hỏi.'),
      w('do', 'v', 'làm', 'What do you do?', 'Bạn làm nghề gì?'),
      w('go', 'v', 'đi', 'I go to school.', 'Tôi đi học.'),
      w('come', 'v', 'đến', 'Please come here.', 'Làm ơn lại đây.'),
      w('see', 'v', 'nhìn, thấy', 'I can see you.', 'Tôi thấy bạn.'),
      w('know', 'v', 'biết', 'I know the answer.', 'Tôi biết câu trả lời.'),
      w('want', 'v', 'muốn', 'I want some water.', 'Tôi muốn chút nước.'),
      w('like', 'v', 'thích', 'I like this song.', 'Tôi thích bài hát này.'),
      w('love', 'v', 'yêu', 'I love my family.', 'Tôi yêu gia đình.'),
      w('make', 'v', 'làm, tạo ra', 'I make coffee.', 'Tôi pha cà phê.'),
      w('say', 'v', 'nói', 'What did you say?', 'Bạn nói gì cơ?'),
      w('think', 'v', 'nghĩ', 'I think so.', 'Tôi nghĩ vậy.'),
      w('work', 'v', 'làm việc', 'I work in an office.', 'Tôi làm việc ở văn phòng.'),
      w('read', 'v', 'đọc', 'I read every night.', 'Tôi đọc sách mỗi tối.'),
      w('write', 'v', 'viết', 'Please write your name.', 'Làm ơn viết tên bạn.'),
      w('speak', 'v', 'nói (ngôn ngữ)', 'I speak a little English.', 'Tôi nói một chút tiếng Anh.'),
      w('learn', 'v', 'học', 'I learn English.', 'Tôi học tiếng Anh.'),
      w('help', 'v', 'giúp đỡ', 'Can you help me?', 'Bạn giúp tôi được không?'),
      w('give', 'v', 'cho, đưa', 'Give me the book.', 'Đưa tôi cuốn sách.'),
    ],
    sentences: [
      { en: 'I want to learn English.', vi: 'Tôi muốn học tiếng Anh.' },
      { en: 'Can you help me?', vi: 'Bạn giúp tôi được không?' },
      { en: 'I do not know.', vi: 'Tôi không biết.' },
      { en: 'I like this very much.', vi: 'Tôi rất thích cái này.' },
    ],
  },

  // ── Vòng 11: Tính từ cơ bản ──────────────────────────────────────────────
  {
    id: 'adjectives',
    titleVi: 'Tính từ cơ bản',
    titleEn: 'Basic Adjectives',
    emoji: '⭐',
    words: [
      w('good', 'adj', 'tốt', 'This is a good idea.', 'Đây là ý hay.'),
      w('bad', 'adj', 'xấu, tệ', 'The weather is bad.', 'Thời tiết xấu.'),
      w('big', 'adj', 'to, lớn', 'It is a big house.', 'Đó là ngôi nhà lớn.'),
      w('small', 'adj', 'nhỏ', 'I have a small car.', 'Tôi có một chiếc xe nhỏ.'),
      w('hot', 'adj', 'nóng', 'The coffee is hot.', 'Cà phê nóng.'),
      w('cold', 'adj', 'lạnh', 'The water is cold.', 'Nước lạnh.'),
      w('new', 'adj', 'mới', 'I have a new phone.', 'Tôi có điện thoại mới.'),
      w('old', 'adj', 'cũ, già', 'This is an old book.', 'Đây là cuốn sách cũ.'),
      w('happy', 'adj', 'vui, hạnh phúc', 'I am happy today.', 'Hôm nay tôi vui.'),
      w('sad', 'adj', 'buồn', 'She looks sad.', 'Cô ấy trông buồn.'),
      w('easy', 'adj', 'dễ', 'This is easy.', 'Cái này dễ.'),
      w('hard', 'adj', 'khó', 'The test is hard.', 'Bài thi khó.'),
      w('fast', 'adj', 'nhanh', 'He is a fast runner.', 'Anh ấy chạy nhanh.'),
      w('slow', 'adj', 'chậm', 'The bus is slow.', 'Xe buýt chậm.'),
      w('beautiful', 'adj', 'đẹp', 'What a beautiful day.', 'Một ngày thật đẹp.'),
      w('expensive', 'adj', 'đắt', 'This is too expensive.', 'Cái này đắt quá.'),
    ],
    sentences: [
      { en: 'This is very good.', vi: 'Cái này rất tốt.' },
      { en: 'It is too expensive.', vi: 'Nó đắt quá.' },
      { en: 'I am very happy.', vi: 'Tôi rất vui.' },
    ],
  },

  // ── Vòng 12: Nhà cửa & đồ vật ────────────────────────────────────────────
  {
    id: 'home',
    titleVi: 'Nhà cửa & đồ vật',
    titleEn: 'Home & Objects',
    emoji: '🏠',
    words: [
      w('house', 'n', 'ngôi nhà', 'My house is small.', 'Nhà tôi nhỏ.'),
      w('room', 'n', 'căn phòng', 'This is my room.', 'Đây là phòng tôi.'),
      w('door', 'n', 'cửa', 'Please close the door.', 'Làm ơn đóng cửa.'),
      w('window', 'n', 'cửa sổ', 'Open the window.', 'Mở cửa sổ ra.'),
      w('table', 'n', 'cái bàn', 'The book is on the table.', 'Cuốn sách trên bàn.'),
      w('chair', 'n', 'cái ghế', 'Sit on the chair.', 'Ngồi lên ghế.'),
      w('bed', 'n', 'cái giường', 'I sleep in my bed.', 'Tôi ngủ trên giường.'),
      w('kitchen', 'n', 'nhà bếp', 'Mom is in the kitchen.', 'Mẹ đang ở trong bếp.'),
      w('phone', 'n', 'điện thoại', 'Where is my phone?', 'Điện thoại tôi đâu?'),
      w('book', 'n', 'cuốn sách', 'I am reading a book.', 'Tôi đang đọc sách.'),
      w('pen', 'n', 'cái bút', 'Can I borrow a pen?', 'Cho tôi mượn cây bút?'),
      w('bag', 'n', 'cái túi', 'My bag is heavy.', 'Túi tôi nặng.'),
      w('clock', 'n', 'đồng hồ', 'The clock is on the wall.', 'Đồng hồ treo trên tường.'),
      w('key', 'n', 'chìa khóa', 'I lost my keys.', 'Tôi làm mất chìa khóa.'),
      w('money', 'n', 'tiền', 'I have no money.', 'Tôi không có tiền.'),
      w('car', 'n', 'xe hơi', 'My car is red.', 'Xe tôi màu đỏ.'),
    ],
    sentences: [
      { en: 'Where is my phone?', vi: 'Điện thoại của tôi đâu?' },
      { en: 'Please close the door.', vi: 'Làm ơn đóng cửa.' },
      { en: 'The book is on the table.', vi: 'Cuốn sách ở trên bàn.' },
    ],
  },

  // ── Vòng 13: Công nghệ & IT ───────────────────────────────────────────────
  {
    id: 'it',
    titleVi: 'Công nghệ & IT',
    titleEn: 'Technology & IT',
    emoji: '💻',
    words: [
      w('computer',  'n',   'máy tính',      'I use a computer every day.',      'Tôi dùng máy tính mỗi ngày.'),
      w('software',  'n',   'phần mềm',      'We need new software.',             'Chúng tôi cần phần mềm mới.'),
      w('internet',  'n',   'internet',      'The internet is slow today.',       'Hôm nay internet chậm.'),
      w('email',     'n',   'thư điện tử',   'Please send me an email.',          'Hãy gửi email cho tôi.'),
      w('database',  'n',   'cơ sở dữ liệu', 'The database is too large.',       'Cơ sở dữ liệu quá lớn.'),
      w('app',       'n',   'ứng dụng',      'I downloaded a new app.',           'Tôi tải một ứng dụng mới.'),
      w('website',   'n',   'trang web',     'Visit our website.',                'Hãy truy cập trang web của chúng tôi.'),
      w('code',      'n',   'mã lập trình',  'I write code every day.',           'Tôi viết code mỗi ngày.'),
      w('developer', 'n',   'lập trình viên','She is a developer.',               'Cô ấy là lập trình viên.'),
      w('server',    'n',   'máy chủ',       'The server is down.',               'Máy chủ đang bị sự cố.'),
      w('data',      'n',   'dữ liệu',       'We have a lot of data.',            'Chúng tôi có rất nhiều dữ liệu.'),
      w('network',   'n',   'mạng lưới',     'The network is secure.',            'Mạng lưới an toàn.'),
      w('update',    'v',   'cập nhật',      'Please update your software.',      'Hãy cập nhật phần mềm.'),
      w('download',  'v',   'tải xuống',     'Download the file here.',           'Tải tệp tại đây.'),
      w('upload',    'v',   'tải lên',       'Upload the photo to the cloud.',    'Tải ảnh lên đám mây.'),
      w('password',  'n',   'mật khẩu',      'Change your password regularly.',  'Đổi mật khẩu thường xuyên.'),
      w('screen',    'n',   'màn hình',      'The screen is too bright.',         'Màn hình quá sáng.'),
      w('keyboard',  'n',   'bàn phím',      'I need a new keyboard.',            'Tôi cần bàn phím mới.'),
      w('backup',    'n',   'sao lưu',       'Always make a backup.',             'Luôn tạo bản sao lưu.'),
      w('bug',       'n',   'lỗi phần mềm',  'There is a bug in the code.',      'Có lỗi trong code.'),
    ],
    sentences: [
      { en: 'Please send me an email.',     vi: 'Hãy gửi email cho tôi.' },
      { en: 'The server is down.',          vi: 'Máy chủ đang bị sự cố.' },
      { en: 'Can you fix this bug?',        vi: 'Bạn có thể sửa lỗi này không?' },
    ],
  },

  // ── Vòng 14: Y tế & sức khỏe ─────────────────────────────────────────────
  {
    id: 'medical',
    titleVi: 'Y tế & sức khỏe',
    titleEn: 'Health & Medical',
    emoji: '🏥',
    words: [
      w('doctor',       'n', 'bác sĩ',         'I need to see a doctor.',           'Tôi cần gặp bác sĩ.'),
      w('nurse',        'n', 'y tá',            'The nurse is very kind.',           'Y tá rất tốt bụng.'),
      w('hospital',     'n', 'bệnh viện',       'Take him to the hospital.',         'Đưa anh ấy đến bệnh viện.'),
      w('medicine',     'n', 'thuốc',           'Take this medicine twice a day.',   'Uống thuốc này hai lần mỗi ngày.'),
      w('prescription', 'n', 'đơn thuốc',       'Here is your prescription.',        'Đây là đơn thuốc của bạn.'),
      w('patient',      'n', 'bệnh nhân',       'The patient is recovering.',        'Bệnh nhân đang hồi phục.'),
      w('fever',        'n', 'sốt',             'I have a fever.',                   'Tôi bị sốt.'),
      w('headache',     'n', 'đau đầu',         'I have a headache.',                'Tôi bị đau đầu.'),
      w('allergy',      'n', 'dị ứng',          'I am allergic to peanuts.',         'Tôi dị ứng với lạc.'),
      w('vaccine',      'n', 'vắc-xin',         'Get your vaccine today.',           'Tiêm vắc-xin ngay hôm nay.'),
      w('surgery',      'n', 'phẫu thuật',      'The surgery was successful.',       'Ca phẫu thuật thành công.'),
      w('diagnosis',    'n', 'chẩn đoán',       'The diagnosis is correct.',         'Chẩn đoán chính xác.'),
      w('symptom',      'n', 'triệu chứng',     'What are your symptoms?',           'Bạn có triệu chứng gì?'),
      w('treatment',    'n', 'điều trị',        'The treatment is working.',         'Quá trình điều trị đang có hiệu quả.'),
      w('pharmacy',     'n', 'nhà thuốc',       'Go to the pharmacy.',               'Hãy đến nhà thuốc.'),
      w('appointment',  'n', 'cuộc hẹn khám',  'I have an appointment tomorrow.',   'Tôi có lịch khám ngày mai.'),
      w('emergency',    'n', 'cấp cứu',         'Call emergency services.',          'Gọi cấp cứu.'),
      w('insurance',    'n', 'bảo hiểm',        'Do you have health insurance?',     'Bạn có bảo hiểm y tế không?'),
      w('blood',        'n', 'máu',             'The blood test is normal.',         'Xét nghiệm máu bình thường.'),
      w('pain',         'n', 'cơn đau',         'I feel pain in my chest.',          'Tôi đau ngực.'),
    ],
    sentences: [
      { en: 'I need to see a doctor.',      vi: 'Tôi cần gặp bác sĩ.' },
      { en: 'What are your symptoms?',      vi: 'Bạn có triệu chứng gì?' },
      { en: 'Take this medicine twice a day.', vi: 'Uống thuốc này hai lần mỗi ngày.' },
    ],
  },

  // ── Vòng 15: Kinh doanh & công sở ────────────────────────────────────────
  {
    id: 'business',
    titleVi: 'Kinh doanh & công sở',
    titleEn: 'Business & Office',
    emoji: '💼',
    words: [
      w('meeting',      'n', 'cuộc họp',              'The weekly meeting is on Monday morning.',  'Cuộc họp hàng tuần vào sáng thứ Hai.'),
      w('deadline',     'n', 'hạn chót',              'Submit the report before the deadline.',    'Nộp báo cáo trước hạn chót.'),
      w('budget',       'n', 'ngân sách',             'We need to stay within budget.',            'Chúng ta cần giữ trong ngân sách.'),
      w('contract',     'n', 'hợp đồng',              'Read the contract carefully before signing.','Đọc kỹ hợp đồng trước khi ký.'),
      w('salary',       'n', 'lương',                 'She asked for a salary increase.',          'Cô ấy xin tăng lương.'),
      w('profit',       'n', 'lợi nhuận',             'The company made a large profit this year.','Công ty thu được lợi nhuận lớn năm nay.'),
      w('market',       'n', 'thị trường',            'Research the market before launching.',     'Nghiên cứu thị trường trước khi ra mắt.'),
      w('client',       'n', 'khách hàng',            'Always listen to your client.',             'Luôn lắng nghe khách hàng của bạn.'),
      w('project',      'n', 'dự án',                 'The project is due at the end of the month.','Dự án đến hạn cuối tháng.'),
      w('manager',      'n', 'quản lý',               'The manager praised the whole team.',       'Quản lý khen cả nhóm.'),
      w('invoice',      'n', 'hóa đơn',               'Send the invoice after the work is done.',  'Gửi hóa đơn sau khi hoàn thành công việc.'),
      w('report',       'n', 'báo cáo',               'She writes a weekly report for her boss.',  'Cô ấy viết báo cáo tuần cho sếp.'),
      w('strategy',     'n', 'chiến lược',            'We need a clear growth strategy.',          'Chúng ta cần chiến lược phát triển rõ ràng.'),
      w('negotiation',  'n', 'đàm phán',              'Good communication helps in negotiation.',  'Giao tiếp tốt hỗ trợ đàm phán.'),
      w('presentation', 'n', 'thuyết trình',          'She practised her presentation many times.','Cô ấy luyện thuyết trình nhiều lần.'),
      w('expense',      'n', 'chi phí',               'Keep all receipts for your expenses.',      'Giữ tất cả hóa đơn cho chi phí của bạn.'),
      w('revenue',      'n', 'doanh thu',             'Revenue grew by thirty percent this year.', 'Doanh thu tăng ba mươi phần trăm năm nay.'),
      w('partnership',  'n', 'đối tác / hợp tác',    'They formed a partnership to expand.',      'Họ hợp tác để mở rộng kinh doanh.'),
      w('startup',      'n', 'công ty khởi nghiệp',  'She built her startup from zero.',          'Cô ấy xây dựng startup từ con số không.'),
      w('office',       'n', 'văn phòng',             'The office has a great city view.',         'Văn phòng có tầm nhìn đẹp ra thành phố.'),
    ],
    sentences: [
      { en: 'The deadline is this Friday.',   vi: 'Hạn chót là thứ Sáu này.' },
      { en: 'Please sign the contract.',      vi: 'Hãy ký hợp đồng.' },
      { en: 'I have a presentation today.',   vi: 'Hôm nay tôi có thuyết trình.' },
      { en: 'Can we reschedule the meeting?', vi: 'Chúng ta có thể dời cuộc họp không?' },
    ],
  },

  // ── Vòng 16: Bạn bè & xã hội ─────────────────────────────────────────────
  {
    id: 'social',
    titleVi: 'Bạn bè & xã hội',
    titleEn: 'Friends & Society',
    emoji: '🤝',
    words: [
      w('friend',       'n',    'bạn bè',          'She is my best friend.',                    'Cô ấy là bạn thân nhất của tôi.'),
      w('buddy',        'n',    'bạn thân, đồng đội','We have been buddies since school.',       'Chúng tôi là bạn thân từ hồi đi học.'),
      w('classmate',    'n',    'bạn cùng lớp',    'My classmate helped me with the homework.', 'Bạn cùng lớp giúp tôi làm bài tập.'),
      w('colleague',    'n',    'đồng nghiệp',     'My colleague is very supportive.',          'Đồng nghiệp tôi rất hỗ trợ.'),
      w('neighbor',     'n',    'hàng xóm',        'My neighbor is very friendly.',             'Hàng xóm tôi rất thân thiện.'),
      w('stranger',     'n',    'người lạ',        'A stranger helped him find the way.',       'Một người lạ giúp anh ấy tìm đường.'),
      w('group',        'n',    'nhóm',            'We work in a group of five people.',        'Chúng tôi làm việc theo nhóm năm người.'),
      w('team',         'n',    'đội, nhóm làm việc','Our team won the competition.',           'Đội chúng tôi thắng cuộc thi.'),
      w('member',       'n',    'thành viên',      'Every member must attend the meeting.',     'Mọi thành viên đều phải dự họp.'),
      w('community',    'n',    'cộng đồng',       'Volunteering is great for the community.',  'Tình nguyện rất tốt cho cộng đồng.'),
      w('society',      'n',    'xã hội',          'Education improves society for everyone.',  'Giáo dục cải thiện xã hội cho mọi người.'),
      w('relationship', 'n',    'mối quan hệ',     'A good relationship needs trust.',          'Mối quan hệ tốt cần có sự tin tưởng.'),
      w('trust',        'n/v',  'tin tưởng',       'Trust is the foundation of friendship.',    'Tin tưởng là nền tảng của tình bạn.'),
      w('invite',       'v',    'mời',             'I will invite you to my birthday party.',   'Tôi sẽ mời bạn đến tiệc sinh nhật tôi.'),
      w('introduce',    'v',    'giới thiệu',      'Let me introduce my friend to you.',        'Để tôi giới thiệu bạn tôi với bạn.'),
      w('chat',         'v',    'trò chuyện, nhắn tin','They chatted about weekend plans.',     'Họ nhắn tin về kế hoạch cuối tuần.'),
      w('share',        'v',    'chia sẻ',         'Share your ideas with the group.',          'Chia sẻ ý tưởng của bạn với nhóm.'),
      w('together',     'adv',  'cùng nhau',       'Let\'s solve this problem together.',       'Hãy cùng nhau giải quyết vấn đề này.'),
      w('care',         'v',    'quan tâm, chăm sóc','I care about your health.',              'Tôi quan tâm đến sức khỏe của bạn.'),
      w('support',      'v/n',  'hỗ trợ, ủng hộ', 'Family support is very important.',         'Sự hỗ trợ của gia đình rất quan trọng.'),
    ],
    sentences: [
      { en: 'Let me introduce my friend to you.',      vi: 'Để tôi giới thiệu bạn tôi với bạn.' },
      { en: 'We work much better as a team.',          vi: 'Chúng ta làm tốt hơn nhiều khi là một đội.' },
      { en: 'I trust you completely.',                 vi: 'Tôi tin tưởng bạn hoàn toàn.' },
      { en: 'Share your problems — don\'t face them alone.', vi: 'Hãy chia sẻ vấn đề — đừng đối mặt một mình.' },
    ],
  },

  // ── Vòng 17: Trường học & lớp học ────────────────────────────────────────
  {
    id: 'school',
    titleVi: 'Trường học & lớp học',
    titleEn: 'School & Classroom',
    emoji: '🏫',
    words: [
      w('school',      'n',    'trường học',            'I walk to school every morning.',           'Tôi đi bộ đến trường mỗi sáng.'),
      w('class',       'n',    'lớp học, tiết học',     'The English class starts at eight.',        'Tiết tiếng Anh bắt đầu lúc tám giờ.'),
      w('classroom',   'n',    'phòng học',             'Our classroom has thirty students.',        'Lớp học của chúng tôi có ba mươi học sinh.'),
      w('lesson',      'n',    'bài học',               'Today\'s lesson is about numbers.',         'Bài học hôm nay về số đếm.'),
      w('teacher',     'n',    'giáo viên',             'My teacher is very patient.',               'Giáo viên tôi rất kiên nhẫn.'),
      w('student',     'n',    'học sinh, sinh viên',   'Every student learns differently.',         'Mỗi học sinh học theo cách khác nhau.'),
      w('study',       'v',    'học, nghiên cứu',       'I study for two hours every evening.',      'Tôi học hai tiếng mỗi buổi tối.'),
      w('homework',    'n',    'bài tập về nhà',        'Did you finish your homework?',             'Bạn làm xong bài tập chưa?'),
      w('exam',        'n',    'kỳ thi, bài kiểm tra',  'The final exam is next week.',              'Kỳ thi cuối kỳ là tuần sau.'),
      w('grade',       'n',    'điểm số; lớp học',      'She got a high grade on the test.',         'Cô bé được điểm cao trong bài kiểm tra.'),
      w('subject',     'n',    'môn học',               'My favourite subject is English.',          'Môn học yêu thích của tôi là tiếng Anh.'),
      w('notebook',    'n',    'vở ghi chép',           'Write new words in your notebook.',         'Ghi các từ mới vào vở.'),
      w('library',     'n',    'thư viện',              'I borrow books from the library.',          'Tôi mượn sách ở thư viện.'),
      w('university',  'n',    'trường đại học',        'She studies at a top university.',          'Cô ấy học ở một trường đại học hàng đầu.'),
      w('practice',    'v',    'luyện tập',             'Practice speaking English every day.',      'Luyện nói tiếng Anh mỗi ngày.'),
      w('question',    'n',    'câu hỏi',               'Do you have any questions?',                'Bạn có câu hỏi nào không?'),
      w('answer',      'n/v',  'câu trả lời / trả lời', 'She answered every question correctly.',    'Cô ấy trả lời đúng tất cả câu hỏi.'),
      w('board',       'n',    'bảng (đen/trắng)',      'The teacher writes on the board.',          'Giáo viên viết lên bảng.'),
      w('schedule',    'n',    'thời khóa biểu, lịch',  'Check your class schedule.',                'Xem thời khóa biểu của bạn.'),
      w('knowledge',   'n',    'kiến thức',             'Knowledge is power.',                       'Kiến thức là sức mạnh.'),
    ],
    sentences: [
      { en: 'The exam is next Monday.',           vi: 'Kỳ thi là thứ Hai tuần sau.' },
      { en: 'Have you done your homework yet?',   vi: 'Bạn làm bài tập về nhà chưa?' },
      { en: 'What is your favourite subject?',    vi: 'Môn học yêu thích của bạn là gì?' },
      { en: 'Let\'s go to the library together.', vi: 'Cùng đến thư viện đi.' },
    ],
  },
]
