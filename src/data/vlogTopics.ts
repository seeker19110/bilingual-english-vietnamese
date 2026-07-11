// ──────────────────────────────────────────────────────────────────────────
// 30 CHỦ ĐỀ VLOG — thử thách "Vlog 1 phút" 30 ngày
// (xem kế hoạch: docs/research/thu-thach-vlog-30-ngay.md, mục 3.3)
//
// Chủ đề sát đời sống Việt Nam, KHÓ DẦN theo tuần:
//   Tuần 1 (ngày 1–7):   mô tả trực tiếp, đơn giản (ăn gì, đường đi làm, thời tiết…)
//   Tuần 2 (ngày 8–14):  kể chuyện quá khứ (chuyện buồn cười, đi chợ, cơn mưa…)
//   Tuần 3 (ngày 15–21): ý kiến nhẹ nhàng (trà sữa, xe máy vs xe buýt…)
//   Tuần 4 (ngày 22–30): trừu tượng hơn (ước mơ, biết ơn, nhìn lại hành trình)
//
// Mỗi chủ đề: tiêu đề song ngữ + 6–8 từ/cụm gợi ý + 2 câu mẫu MỖI ngôn ngữ.
// sampleEn dùng cho chiều A (người Việt NÓI tiếng Anh, trình độ A2–B1);
// sampleVi dùng cho chiều B (người nước ngoài NÓI tiếng Việt) — là câu tự nhiên
// tương ứng về ý, KHÔNG dịch word-by-word.
// Chủ đề chỉ là GỢI Ý — người học được nói chủ đề tự do (xem kế hoạch mục 3.3).
// ──────────────────────────────────────────────────────────────────────────

// 1 từ/cụm gợi ý song ngữ (bấm nghe TTS được ở UI).
export interface VlogHintWord {
  en: string
  vi: string
}

// Tuần của thử thách (1..4) — tuần 4 dài 9 ngày (ngày 22–30).
export type VlogWeek = 1 | 2 | 3 | 4

// 1 chủ đề vlog của 1 ngày trong thử thách.
export interface VlogTopic {
  /** Ngày trong thử thách: 1..30 */
  day: number
  titleEn: string
  titleVi: string
  /** Tuần của thử thách: 1..4 */
  week: VlogWeek
  /** 6–8 từ/cụm gợi ý hữu dụng cho chủ đề */
  hintWords: VlogHintWord[]
  /** 2 câu mẫu tiếng Anh tự nhiên (A2–B1) — chiều A nói tiếng Anh */
  sampleEn: string[]
  /** 2 câu mẫu tiếng Việt tương ứng — chiều B nói tiếng Việt */
  sampleVi: string[]
}

// Hằng số của thử thách — tránh "số ma thuật" rải rác trong code.
export const VLOG_TOTAL_DAYS = 30
const VLOG_FIRST_DAY = 1
const WEEK_1_LAST_DAY = 7
const WEEK_2_LAST_DAY = 14
const WEEK_3_LAST_DAY = 21

// Suy ra tuần từ ngày (tuần 4 gồm ngày 22–30) — tính tự động để không lệch dữ liệu.
function weekOfDay(day: number): VlogWeek {
  if (day <= WEEK_1_LAST_DAY) return 1
  if (day <= WEEK_2_LAST_DAY) return 2
  if (day <= WEEK_3_LAST_DAY) return 3
  return 4
}

// Rút gọn: tạo 1 từ/cụm gợi ý.
const h = (en: string, vi: string): VlogHintWord => ({ en, vi })

// Rút gọn: tạo 1 chủ đề (week tự tính từ day).
const topic = (
  day: number,
  titleEn: string,
  titleVi: string,
  hintWords: VlogHintWord[],
  sampleEn: string[],
  sampleVi: string[],
): VlogTopic => ({ day, titleEn, titleVi, week: weekOfDay(day), hintWords, sampleEn, sampleVi })

export const VLOG_TOPICS: VlogTopic[] = [
  // ═══════ TUẦN 1 — MÔ TẢ TRỰC TIẾP, ĐƠN GIẢN ═══════
  topic(
    1,
    'What I ate today',
    'Hôm nay tôi ăn gì',
    [
      h('breakfast', 'bữa sáng'),
      h('banh mi', 'bánh mì'),
      h('iced milk coffee', 'cà phê sữa đá'),
      h('street food', 'đồ ăn vỉa hè'),
      h('delicious', 'ngon'),
      h('full', 'no bụng'),
      h('grilled pork with broken rice', 'cơm tấm sườn nướng'),
    ],
    [
      'This morning I had a banh mi and an iced milk coffee near my house.',
      'For lunch I ate broken rice with grilled pork — it was so delicious.',
    ],
    [
      'Sáng nay tôi ăn bánh mì và uống cà phê sữa đá gần nhà.',
      'Trưa tôi ăn cơm tấm sườn nướng, ngon lắm luôn.',
    ],
  ),
  topic(
    2,
    'My way to work or school',
    'Đường tôi đi làm / đi học',
    [
      h('ride a motorbike', 'chạy xe máy'),
      h('traffic jam', 'kẹt xe'),
      h('rush hour', 'giờ cao điểm'),
      h('helmet', 'mũ bảo hiểm'),
      h('crowded', 'đông đúc'),
      h('traffic light', 'đèn giao thông'),
      h('it takes about twenty minutes', 'mất khoảng hai mươi phút'),
    ],
    [
      'Every day I ride my motorbike to work, and it takes about twenty minutes.',
      'This morning the traffic was terrible, so I was almost late.',
    ],
    [
      'Ngày nào tôi cũng đi làm bằng xe máy, mất khoảng hai mươi phút.',
      'Sáng nay kẹt xe kinh khủng nên tôi suýt trễ giờ.',
    ],
  ),
  topic(
    3,
    'My favorite coffee shop',
    'Quán cà phê quen của tôi',
    [
      h('regular customer', 'khách quen'),
      h('order', 'gọi món'),
      h('cozy', 'ấm cúng'),
      h('by the window', 'cạnh cửa sổ'),
      h('free wifi', 'wifi miễn phí'),
      h('the owner', 'chủ quán'),
      h('almost every weekend', 'hầu như cuối tuần nào cũng'),
    ],
    [
      'There is a small coffee shop near my house where I go almost every weekend.',
      'I always order an iced milk coffee and sit by the window.',
    ],
    [
      'Gần nhà tôi có một quán cà phê nhỏ, hầu như cuối tuần nào tôi cũng ghé.',
      'Tôi luôn gọi một ly cà phê sữa đá rồi ngồi cạnh cửa sổ.',
    ],
  ),
  topic(
    4,
    "Today's weather",
    'Thời tiết hôm nay',
    [
      h('hot and humid', 'nóng và oi bức'),
      h('sunny', 'nắng'),
      h('sudden rain', 'mưa bất chợt'),
      h('raincoat', 'áo mưa'),
      h('weather forecast', 'dự báo thời tiết'),
      h('sweat', 'đổ mồ hôi'),
      h('cool', 'mát mẻ'),
    ],
    [
      'Today is really hot, around thirty-five degrees, so I stay inside most of the time.',
      'It rained suddenly this afternoon and I forgot my raincoat again.',
    ],
    [
      'Hôm nay trời nóng thật, khoảng ba mươi lăm độ, nên tôi ở trong nhà gần cả ngày.',
      'Chiều nay trời mưa bất chợt mà tôi lại quên áo mưa.',
    ],
  ),
  topic(
    5,
    "What's in my bag",
    'Trong túi / balo của tôi có gì',
    [
      h('carry', 'mang theo'),
      h('wallet', 'ví tiền'),
      h('keys', 'chìa khóa'),
      h('phone charger', 'cục sạc điện thoại'),
      h('earphones', 'tai nghe'),
      h('water bottle', 'bình nước'),
      h('tissues', 'khăn giấy'),
    ],
    [
      'In my bag I always carry my wallet, my keys and a phone charger.',
      'There is also a small water bottle because the weather is so hot.',
    ],
    [
      'Trong balo tôi lúc nào cũng có ví, chìa khóa và cục sạc điện thoại.',
      'Còn có một bình nước nhỏ nữa vì trời nóng quá mà.',
    ],
  ),
  topic(
    6,
    'My favorite dish',
    'Món khoái khẩu của tôi',
    [
      h('favorite dish', 'món khoái khẩu'),
      h('grilled pork with noodles', 'bún chả'),
      h('fresh herbs', 'rau thơm'),
      h('fish sauce', 'nước mắm'),
      h('taste', 'hương vị'),
      h('cook', 'nấu ăn'),
      h('never get bored of it', 'ăn hoài không ngán'),
    ],
    [
      'My favorite dish is bun cha — grilled pork with rice noodles and fresh herbs.',
      'My mom cooks it best, and I can eat it every week without getting bored.',
    ],
    [
      'Món khoái khẩu của tôi là bún chả — thịt nướng ăn kèm bún và rau thơm.',
      'Mẹ tôi nấu món này ngon nhất, tuần nào ăn cũng không thấy ngán.',
    ],
  ),
  topic(
    7,
    'Someone I met today',
    'Người tôi gặp hôm nay',
    [
      h('neighbor', 'hàng xóm'),
      h('colleague', 'đồng nghiệp'),
      h('friendly', 'thân thiện'),
      h('smile', 'nụ cười'),
      h('chat for a while', 'trò chuyện một lúc'),
      h('say hello', 'chào hỏi'),
      h('make my day', 'làm tôi vui cả ngày'),
    ],
    [
      'Today I met my old neighbor at the market and we chatted for a while.',
      'She still remembers me, and her smile made my whole day.',
    ],
    [
      'Hôm nay tôi gặp lại cô hàng xóm cũ ở chợ và đứng trò chuyện một lúc.',
      'Cô vẫn nhớ tôi, nụ cười của cô làm tôi vui cả ngày.',
    ],
  ),

  // ═══════ TUẦN 2 — KỂ CHUYỆN QUÁ KHỨ ═══════
  topic(
    8,
    'A funny story this week',
    'Chuyện buồn cười tuần này',
    [
      h('happen', 'xảy ra'),
      h('by mistake', 'nhầm / lỡ tay'),
      h('embarrassed', 'ngại / xấu hổ'),
      h('laugh out loud', 'cười to'),
      h('silly', 'ngớ ngẩn'),
      h("couldn't stop laughing", 'cười không nhịn được'),
      h('suddenly', 'đột nhiên'),
    ],
    [
      'Yesterday I sent a message to the wrong person — I texted my boss instead of my friend.',
      'I was so embarrassed, but now I laugh every time I think about it.',
    ],
    [
      'Hôm qua tôi nhắn tin nhầm người — định gửi cho bạn mà lại gửi cho sếp.',
      'Lúc đó tôi ngại muốn độn thổ, mà giờ nghĩ lại vẫn buồn cười.',
    ],
  ),
  topic(
    9,
    'A trip to the market or supermarket',
    'Một lần đi chợ / siêu thị',
    [
      h('go to the market', 'đi chợ'),
      h('fresh vegetables', 'rau tươi'),
      h('bargain', 'mặc cả / trả giá'),
      h('the seller', 'người bán hàng'),
      h('expensive', 'đắt / mắc'),
      h('cheap', 'rẻ'),
      h('a good deal', 'giá hời'),
    ],
    [
      'This morning I went to the market and bought some vegetables and fresh fish.',
      'The seller asked for a high price, but I bargained and got a good deal.',
    ],
    [
      'Sáng nay tôi đi chợ mua ít rau với cá tươi.',
      'Cô bán hàng nói giá hơi cao, nhưng tôi trả giá nên mua được giá hời.',
    ],
  ),
  topic(
    10,
    'A rain I still remember',
    'Một cơn mưa tôi còn nhớ',
    [
      h('heavy rain', 'mưa to'),
      h('get soaked', 'ướt sũng'),
      h('take shelter', 'trú mưa'),
      h('flooded street', 'đường ngập nước'),
      h('thunder', 'sấm'),
      h('wait for the rain to stop', 'đợi mưa tạnh'),
      h('on my way home', 'trên đường về nhà'),
    ],
    [
      'Last week I got caught in a heavy rain on my way home from work.',
      'I had no raincoat, so I stopped and took shelter under a bridge for an hour.',
    ],
    [
      'Tuần trước tôi bị dính một trận mưa to trên đường đi làm về.',
      'Không mang áo mưa nên tôi phải tấp vào gầm cầu trú cả tiếng đồng hồ.',
    ],
  ),
  topic(
    11,
    'A family meal',
    'Bữa cơm gia đình',
    [
      h('gather', 'quây quần'),
      h('home-cooked meal', 'cơm nhà'),
      h('braised fish', 'cá kho'),
      h('sour soup', 'canh chua'),
      h('talk about our day', 'kể chuyện trong ngày'),
      h('warm', 'ấm áp'),
      h('together', 'cùng nhau'),
    ],
    [
      "Last Sunday my whole family gathered for dinner at my parents' house.",
      'My mom made braised fish and sour soup, and we talked and laughed a lot.',
    ],
    [
      'Chủ nhật tuần rồi cả nhà tôi quây quần ăn tối ở nhà ba mẹ.',
      'Mẹ tôi nấu cá kho với canh chua, mọi người vừa ăn vừa nói cười rôm rả.',
    ],
  ),
  topic(
    12,
    'A childhood memory',
    'Kỷ niệm hồi nhỏ',
    [
      h('childhood', 'tuổi thơ'),
      h('the countryside', 'quê'),
      h('grandparents', 'ông bà'),
      h('fly a kite', 'thả diều'),
      h('rice field', 'cánh đồng lúa'),
      h('summer holiday', 'kỳ nghỉ hè'),
      h('miss', 'nhớ'),
    ],
    [
      "When I was small, I spent every summer at my grandparents' house in the countryside.",
      'My cousins and I flew kites in the rice fields until it got dark.',
    ],
    [
      'Hồi nhỏ, hè nào tôi cũng về quê ở với ông bà.',
      'Tôi với mấy đứa em họ thả diều ngoài đồng đến tận tối mịt.',
    ],
  ),
  topic(
    13,
    'My day yesterday',
    'Ngày hôm qua của tôi',
    [
      h('wake up late', 'dậy trễ'),
      h('skip breakfast', 'nhịn bữa sáng'),
      h('busy', 'bận rộn'),
      h('finish work', 'xong việc'),
      h('cook dinner', 'nấu bữa tối'),
      h('watch a movie', 'xem phim'),
      h('go to bed early', 'đi ngủ sớm'),
    ],
    [
      'Yesterday I woke up late, so I skipped breakfast and rushed to work.',
      'In the evening I cooked dinner, watched a movie and went to bed early.',
    ],
    [
      'Hôm qua tôi dậy trễ nên nhịn luôn bữa sáng, vội vàng đi làm.',
      'Buổi tối tôi nấu cơm, xem một bộ phim rồi đi ngủ sớm.',
    ],
  ),
  topic(
    14,
    'A small win this week',
    'Một việc nhỏ tôi làm được tuần này',
    [
      h('finally', 'cuối cùng cũng'),
      h('finish', 'hoàn thành'),
      h('delay', 'trì hoãn'),
      h('proud of myself', 'tự hào về bản thân'),
      h('try my best', 'cố gắng hết sức'),
      h('on time', 'đúng hạn'),
      h('a small thing', 'một chuyện nhỏ'),
    ],
    [
      'This week I finally finished a report that I had delayed for a month.',
      'It is a small thing, but I feel really proud of myself.',
    ],
    [
      'Tuần này tôi cuối cùng cũng làm xong cái báo cáo bị trì hoãn cả tháng.',
      'Chuyện nhỏ thôi mà tôi thấy tự hào về bản thân ghê.',
    ],
  ),

  // ═══════ TUẦN 3 — Ý KIẾN NHẸ NHÀNG ═══════
  topic(
    15,
    'Is bubble tea worth the money?',
    'Trà sữa có đáng tiền không?',
    [
      h('bubble tea', 'trà sữa'),
      h('worth the money', 'đáng tiền'),
      h('in my opinion', 'theo tôi'),
      h('too sweet', 'ngọt quá'),
      h('once in a while', 'thỉnh thoảng'),
      h('addicted', 'ghiền'),
      h('spend money on', 'tốn tiền vào'),
    ],
    [
      'In my opinion, bubble tea is tasty but a little too expensive to drink every day.',
      'I think once or twice a week is enough, or you will spend all your money on it.',
    ],
    [
      'Theo tôi, trà sữa ngon thật nhưng uống mỗi ngày thì hơi tốn tiền.',
      'Tôi nghĩ tuần uống một hai lần là đủ, không thì bay hết lương mất.',
    ],
  ),
  topic(
    16,
    'Motorbike or bus?',
    'Xe máy hay xe buýt?',
    [
      h('prefer', 'thích hơn'),
      h('convenient', 'tiện lợi'),
      h('flexible', 'chủ động / linh hoạt'),
      h('safe', 'an toàn'),
      h('dangerous', 'nguy hiểm'),
      h('air pollution', 'khói bụi / ô nhiễm'),
      h('wait for the bus', 'chờ xe buýt'),
    ],
    [
      'I prefer riding a motorbike because it is fast and I can go anywhere I want.',
      'The bus is cheaper and safer, but I have to wait and it is often crowded.',
    ],
    [
      'Tôi thích đi xe máy hơn vì nhanh và muốn đi đâu thì đi.',
      'Xe buýt rẻ hơn và an toàn hơn, nhưng phải chờ lâu mà lại hay đông.',
    ],
  ),
  topic(
    17,
    'Working from home or at the office?',
    'Làm việc ở nhà hay lên văn phòng?',
    [
      h('work from home', 'làm việc ở nhà'),
      h('save time', 'tiết kiệm thời gian'),
      h('focus', 'tập trung'),
      h('lonely', 'cô đơn / buồn'),
      h('colleagues', 'đồng nghiệp'),
      h('a mix of both', 'kết hợp cả hai'),
      h('online meeting', 'họp online'),
    ],
    [
      'Working from home saves me two hours of travel every day, which is great.',
      'But sometimes I miss chatting with my colleagues at lunch, so I like a mix of both.',
    ],
    [
      'Làm việc ở nhà giúp tôi tiết kiệm hai tiếng đi lại mỗi ngày, thích lắm.',
      'Nhưng nhiều lúc cũng nhớ mấy buổi trưa tám chuyện với đồng nghiệp, nên tôi thích kết hợp cả hai.',
    ],
  ),
  topic(
    18,
    'Social media: good or bad?',
    'Mạng xã hội: lợi hay hại?',
    [
      h('social media', 'mạng xã hội'),
      h('scroll', 'lướt (điện thoại)'),
      h('keep in touch', 'giữ liên lạc'),
      h('waste time', 'tốn thời gian'),
      h('addictive', 'gây nghiện'),
      h('without noticing', 'lúc nào không hay'),
      h('limit', 'giới hạn / bớt lại'),
    ],
    [
      'Social media helps me keep in touch with old friends, and that is a good thing.',
      'But I often scroll for an hour without noticing, so I am trying to limit it.',
    ],
    [
      'Mạng xã hội giúp tôi giữ liên lạc với bạn cũ, cái đó thì tốt.',
      'Nhưng nhiều khi tôi lướt cả tiếng lúc nào không hay, nên đang tập bớt lại.',
    ],
  ),
  topic(
    19,
    'Street food or home cooking?',
    'Ăn ngoài hay cơm nhà?',
    [
      h('eat out', 'ăn ngoài'),
      h('home-cooked meal', 'cơm nhà'),
      h('full of flavor', 'đậm đà'),
      h('healthy', 'tốt cho sức khỏe'),
      h('save money', 'tiết kiệm tiền'),
      h('food safety', 'an toàn thực phẩm'),
      h('especially', 'nhất là'),
    ],
    [
      'Street food in Vietnam is cheap, fast and full of flavor, so I eat out a lot.',
      "Still, I think home-cooked meals are healthier, especially my mom's cooking.",
    ],
    [
      'Đồ ăn vỉa hè ở Việt Nam rẻ, nhanh mà đậm đà nên tôi hay ăn ngoài.',
      'Dù vậy tôi vẫn thấy cơm nhà tốt cho sức khỏe hơn, nhất là cơm mẹ nấu.',
    ],
  ),
  topic(
    20,
    'Is city life too busy?',
    'Sống ở thành phố có quá vội vã?',
    [
      h('city life', 'cuộc sống thành phố'),
      h('exciting', 'sôi động'),
      h('full of opportunities', 'nhiều cơ hội'),
      h('noisy', 'ồn ào'),
      h('stressful', 'áp lực'),
      h('fresh air', 'không khí trong lành'),
      h('peaceful', 'yên bình'),
    ],
    [
      'Life in the city is exciting and full of opportunities, but it is also noisy and stressful.',
      'Sometimes I dream about moving to the countryside for some fresh air and peace.',
    ],
    [
      'Cuộc sống thành phố sôi động và nhiều cơ hội, nhưng cũng ồn ào, áp lực.',
      'Thỉnh thoảng tôi cũng mơ được về quê sống cho yên bình, hít không khí trong lành.',
    ],
  ),
  topic(
    21,
    'The hardest part of learning a language',
    'Điều khó nhất khi học ngoại ngữ',
    [
      h('pronunciation', 'phát âm'),
      h('vocabulary', 'từ vựng'),
      h('shy', 'ngại / rụt rè'),
      h('practice every day', 'luyện tập mỗi ngày'),
      h('give up', 'bỏ cuộc'),
      h('confident', 'tự tin'),
      h('improve', 'tiến bộ'),
    ],
    [
      'For me, the hardest part of learning English is speaking, because I am shy about my pronunciation.',
      'I think the only way to improve is to practice a little every day, like this vlog.',
    ],
    [
      'Với tôi, khó nhất khi học tiếng Việt là phát âm cho đúng thanh điệu.',
      'Tôi nghĩ cách duy nhất để tiến bộ là luyện một chút mỗi ngày, như quay vlog này vậy.',
    ],
  ),

  // ═══════ TUẦN 4 — TRỪU TƯỢNG HƠN ═══════
  topic(
    22,
    'A message to myself one year ago',
    'Điều muốn nói với bản thân một năm trước',
    [
      h('if I could', 'nếu có thể'),
      h('advice', 'lời khuyên'),
      h('worry less', 'bớt lo lắng'),
      h('be brave', 'mạnh dạn lên'),
      h('regret', 'hối tiếc'),
      h('everything will be okay', 'mọi chuyện rồi sẽ ổn'),
      h('believe in yourself', 'tin vào bản thân'),
    ],
    [
      'If I could talk to myself one year ago, I would say: worry less, everything will be okay.',
      'I would also tell myself to start learning English earlier instead of waiting.',
    ],
    [
      'Nếu được nói với bản thân của một năm trước, tôi sẽ bảo: bớt lo đi, mọi chuyện rồi sẽ ổn.',
      'Tôi cũng sẽ dặn mình bắt đầu học tiếng Việt sớm hơn, đừng chần chừ nữa.',
    ],
  ),
  topic(
    23,
    'My dream',
    'Ước mơ của tôi',
    [
      h('dream', 'ước mơ'),
      h('one day', 'một ngày nào đó'),
      h('open my own shop', 'mở quán của riêng mình'),
      h('save up', 'dành dụm'),
      h('step by step', 'từng bước một'),
      h('come true', 'thành hiện thực'),
      h('it may take years', 'có thể mất nhiều năm'),
    ],
    [
      'My dream is to open a small coffee shop of my own one day.',
      'It may take years, but I am saving up and learning step by step.',
    ],
    [
      'Ước mơ của tôi là một ngày nào đó mở được một quán cà phê nhỏ của riêng mình.',
      'Chắc phải mất nhiều năm, nhưng tôi đang dành dụm và học hỏi từng bước một.',
    ],
  ),
  topic(
    24,
    'Things I am grateful for',
    'Những điều tôi biết ơn',
    [
      h('grateful', 'biết ơn'),
      h('health', 'sức khỏe'),
      h('family', 'gia đình'),
      h('friends', 'bạn bè'),
      h('simple things', 'những điều giản dị'),
      h('lucky', 'may mắn'),
      h('appreciate', 'trân trọng'),
    ],
    [
      'Today I want to talk about three things I am grateful for: my health, my family and my friends.',
      'Sometimes simple things, like a good meal after work, make me feel really lucky.',
    ],
    [
      'Hôm nay tôi muốn kể về ba điều tôi biết ơn: sức khỏe, gia đình và bạn bè.',
      'Đôi khi những điều giản dị, như bữa cơm ngon sau giờ làm, cũng làm tôi thấy mình may mắn.',
    ],
  ),
  topic(
    25,
    'A person who inspires me',
    'Người truyền cảm hứng cho tôi',
    [
      h('inspire', 'truyền cảm hứng'),
      h('admire', 'ngưỡng mộ'),
      h('hard-working', 'chăm chỉ'),
      h('never give up', 'không bao giờ bỏ cuộc'),
      h('sacrifice', 'hy sinh'),
      h('raise children', 'nuôi con'),
      h('a good example', 'tấm gương tốt'),
    ],
    [
      'The person who inspires me most is my mother, who raised three children on her own.',
      'She never complains and always tells us to keep learning, no matter how old we are.',
    ],
    [
      'Người truyền cảm hứng cho tôi nhất là mẹ tôi — một mình nuôi ba đứa con khôn lớn.',
      'Mẹ chẳng bao giờ than vãn và luôn dặn tụi tôi phải học hoài, bao nhiêu tuổi cũng học.',
    ],
  ),
  topic(
    26,
    'If I had one totally free day',
    'Nếu có một ngày rảnh hoàn toàn',
    [
      h('totally free', 'rảnh hoàn toàn'),
      h('sleep in', 'ngủ nướng'),
      h('turn off my phone', 'tắt điện thoại'),
      h('relax', 'thư giãn'),
      h('read a book', 'đọc sách'),
      h('do nothing', 'không làm gì cả'),
      h('recharge', 'nạp lại năng lượng'),
    ],
    [
      'If I had one totally free day, I would sleep in and turn off my phone.',
      'Then I would drink coffee slowly, read a book and do nothing important at all.',
    ],
    [
      'Nếu có một ngày rảnh hoàn toàn, tôi sẽ ngủ nướng và tắt luôn điện thoại.',
      'Rồi tôi sẽ nhâm nhi cà phê, đọc sách và chẳng làm gì quan trọng cả.',
    ],
  ),
  topic(
    27,
    'A habit I want to build',
    'Thói quen tôi muốn xây dựng',
    [
      h('build a habit', 'tập một thói quen'),
      h('exercise', 'tập thể dục'),
      h('every morning', 'mỗi sáng'),
      h('start small', 'bắt đầu từ việc nhỏ'),
      h('consistent', 'đều đặn'),
      h('little by little', 'từng chút một'),
      h('stick to it', 'duy trì / theo tới cùng'),
    ],
    [
      'I want to build a habit of exercising for fifteen minutes every morning.',
      'I always give up after a few days, so this time I will start small and stay consistent.',
    ],
    [
      'Tôi muốn tập thói quen thể dục mười lăm phút mỗi sáng.',
      'Lần nào tôi cũng bỏ cuộc sau vài ngày, nên lần này tôi sẽ bắt đầu nhẹ thôi và giữ cho đều.',
    ],
  ),
  topic(
    28,
    'What Tet means to me',
    'Tết với tôi là gì',
    [
      h('Lunar New Year', 'Tết'),
      h('family reunion', 'sum họp gia đình'),
      h('lucky money', 'lì xì'),
      h('square sticky rice cake', 'bánh chưng'),
      h('apricot blossom', 'hoa mai'),
      h('peach blossom', 'hoa đào'),
      h('tradition', 'truyền thống'),
    ],
    [
      'For me, Tet is not about lucky money — it is the time when my whole family reunites.',
      'I love the smell of banh chung and the yellow apricot flowers in front of every house.',
    ],
    [
      'Với tôi, Tết không phải là lì xì — mà là dịp cả nhà sum họp đông đủ.',
      'Tôi mê mùi bánh chưng và sắc mai vàng trước cửa mỗi nhà lắm.',
    ],
  ),
  topic(
    29,
    'My plan after this challenge',
    'Kế hoạch của tôi sau thử thách',
    [
      h('plan', 'kế hoạch'),
      h('keep going', 'tiếp tục'),
      h('next goal', 'mục tiêu tiếp theo'),
      h('a little every day', 'một chút mỗi ngày'),
      h('routine', 'nếp sinh hoạt'),
      h('practice speaking', 'luyện nói'),
      h('without switching languages', 'không phải đổi sang ngôn ngữ khác'),
    ],
    [
      'After this challenge, I plan to keep speaking English a little every day.',
      'My next goal is to talk with a foreigner for five minutes without switching to Vietnamese.',
    ],
    [
      'Sau thử thách này, tôi định vẫn luyện nói tiếng Việt một chút mỗi ngày.',
      'Mục tiêu tiếp theo của tôi là trò chuyện với người Việt năm phút mà không phải đổi sang tiếng Anh.',
    ],
  ),
  topic(
    30,
    'Looking back on my 30-day journey',
    'Nhìn lại hành trình 30 ngày',
    [
      h('look back', 'nhìn lại'),
      h('journey', 'hành trình'),
      h('at first', 'lúc đầu'),
      h('nervous', 'run / hồi hộp'),
      h('get used to', 'quen dần'),
      h('progress', 'tiến bộ'),
      h('proud of how far I have come', 'tự hào vì mình đã đi được xa'),
    ],
    [
      'Thirty days ago, I was so nervous that I deleted my first vlog three times.',
      'Today I just talk naturally, and I am really proud of how far I have come.',
    ],
    [
      'Ba mươi ngày trước, tôi run tới mức xóa đi quay lại cái vlog đầu tiên ba lần.',
      'Còn hôm nay tôi nói tự nhiên hơn hẳn, và tôi thật sự tự hào vì mình đã đi được xa như vậy.',
    ],
  ),
]

// Lấy chủ đề theo ngày trong thử thách — kẹp về khoảng 1..30 để không bao giờ
// trả undefined (ngày < 1 → ngày 1, ngày > 30 → ngày 30, NaN → ngày 1).
export function getTopicForDay(day: number): VlogTopic {
  const safeDay = Number.isFinite(day) ? Math.trunc(day) : VLOG_FIRST_DAY
  const clamped = Math.min(Math.max(safeDay, VLOG_FIRST_DAY), VLOG_TOTAL_DAYS)
  const found = VLOG_TOPICS[clamped - VLOG_FIRST_DAY]
  if (!found) {
    // Không thể xảy ra vì VLOG_TOPICS luôn đủ 30 phần tử — nhánh này chỉ để
    // thỏa noUncheckedIndexedAccess của TypeScript strict.
    throw new Error(`Không tìm thấy chủ đề vlog cho ngày ${clamped}`)
  }
  return found
}
