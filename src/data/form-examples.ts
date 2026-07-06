// Ví dụ cho "các dạng của từ" (word forms) trong từ điển.
// Mỗi ô dạng từ có ĐÚNG 2 ví dụ chất lượng cao (song ngữ Anh–Việt), câu sát đời sống,
// trình độ A1–B2, và LUÔN dùng chính dạng biến thể đó trong câu (vd "went", "children").
//
// KHOÁ = `${word}|${formKey}` — word là TỪ GỐC như trong từ điển, formKey ∈
//   plural | v3s | ving | past | pastPart | comparative | superlative.
// Ưu tiên: dạng BẤT QUY TẮC trước (giá trị học cao nhất), rồi dạng thường A1–B2 hay gặp.
//
// LƯU Ý: mỗi từ trong từ điển chỉ có MỘT loại từ (pos) chính, nên chỉ đặt khoá cho dạng
// mà từ đó THỰC SỰ có (vd "break" lưu là danh từ → chỉ có plural, không có past). Chạy
// `npm run gen:form-examples` để KIỂM TRA hợp lệ + sinh public/data/form-examples.json.

export type { ExPair } from './extra-examples'
import type { ExPair } from './extra-examples'

export const FORM_EXAMPLES: Record<string, [ExPair, ExPair]> = {
  // ══════════════════════════════════════════════════════════════════════════
  // 1) ĐỘNG TỪ BẤT QUY TẮC — quá khứ (V2) và phân từ (V3, chỉ khi khác V2)
  // ══════════════════════════════════════════════════════════════════════════
  'go|past': [
    { en: 'I went to the market this morning.', vi: 'Sáng nay tôi đã đi chợ.' },
    { en: 'We went to Da Nang last summer.', vi: 'Mùa hè năm ngoái chúng tôi đã đi Đà Nẵng.' },
  ],
  'go|pastPart': [
    { en: 'She has gone to work already.', vi: 'Cô ấy đã đi làm rồi.' },
    { en: 'All the food has gone.', vi: 'Đồ ăn đã hết sạch rồi.' },
  ],
  'come|past': [
    { en: 'He came home late last night.', vi: 'Tối qua anh ấy về nhà muộn.' },
    { en: 'My friends came to visit me.', vi: 'Bạn bè đã đến thăm tôi.' },
  ],
  'come|pastPart': [
    { en: 'Winter has come early this year.', vi: 'Năm nay mùa đông đến sớm.' },
    { en: 'The exam results have come out.', vi: 'Kết quả thi đã có rồi.' },
  ],
  'see|past': [
    { en: 'I saw a good film yesterday.', vi: 'Hôm qua tôi đã xem một bộ phim hay.' },
    {
      en: 'We saw many tourists at the beach.',
      vi: 'Chúng tôi thấy rất nhiều du khách ở bãi biển.',
    },
  ],
  'see|pastPart': [
    { en: 'Have you seen my keys anywhere?', vi: 'Bạn có thấy chìa khóa của tôi ở đâu không?' },
    { en: 'I have never seen real snow.', vi: 'Tôi chưa bao giờ thấy tuyết thật.' },
  ],
  'take|past': [
    { en: 'She took the bus to school.', vi: 'Cô ấy đã đi xe buýt đến trường.' },
    { en: 'It took two hours to finish the work.', vi: 'Mất hai tiếng để hoàn thành công việc.' },
  ],
  'take|pastPart': [
    {
      en: 'The medicine should be taken twice a day.',
      vi: 'Thuốc nên được uống hai lần một ngày.',
    },
    { en: 'He has taken my advice.', vi: 'Anh ấy đã nghe theo lời khuyên của tôi.' },
  ],
  'get|past': [
    { en: 'I got a new phone last week.', vi: 'Tuần trước tôi mua một chiếc điện thoại mới.' },
    { en: 'We got home just before the rain.', vi: 'Chúng tôi về đến nhà ngay trước cơn mưa.' },
  ],
  'make|past': [
    {
      en: 'My mother made a big cake for my birthday.',
      vi: 'Mẹ tôi đã làm một chiếc bánh lớn cho sinh nhật tôi.',
    },
    { en: 'They made a lot of noise last night.', vi: 'Tối qua họ làm ồn ào lắm.' },
  ],
  'know|past': [
    { en: 'I knew the answer right away.', vi: 'Tôi biết ngay câu trả lời.' },
    { en: 'We knew each other in high school.', vi: 'Chúng tôi biết nhau từ hồi cấp ba.' },
  ],
  'know|pastPart': [
    { en: 'I have known her for ten years.', vi: 'Tôi đã quen cô ấy được mười năm.' },
    { en: 'He is known for his kindness.', vi: 'Anh ấy nổi tiếng vì sự tử tế.' },
  ],
  'think|past': [
    { en: 'I thought the test was easy.', vi: 'Tôi nghĩ bài kiểm tra khá dễ.' },
    { en: 'She thought about it all night.', vi: 'Cô ấy đã suy nghĩ về nó suốt đêm.' },
  ],
  'give|past': [
    {
      en: 'He gave me a book for my birthday.',
      vi: 'Anh ấy tặng tôi một cuốn sách nhân sinh nhật.',
    },
    { en: 'They gave money to the poor.', vi: 'Họ đã cho tiền người nghèo.' },
  ],
  'give|pastPart': [
    {
      en: 'The prize was given to the best student.',
      vi: 'Giải thưởng được trao cho học sinh giỏi nhất.',
    },
    { en: 'I have given up sugar this month.', vi: 'Tháng này tôi đã bỏ đường.' },
  ],
  'find|past': [
    { en: 'I found my wallet under the bed.', vi: 'Tôi tìm thấy ví ở dưới giường.' },
    {
      en: 'She found a good job in the city.',
      vi: 'Cô ấy đã tìm được một công việc tốt ở thành phố.',
    },
  ],
  'tell|past': [
    { en: 'She told me a funny story.', vi: 'Cô ấy kể cho tôi một câu chuyện vui.' },
    { en: 'He told the truth in the end.', vi: 'Cuối cùng anh ấy đã nói thật.' },
  ],
  'become|past': [
    { en: 'He became a doctor after many years.', vi: 'Anh ấy trở thành bác sĩ sau nhiều năm.' },
    {
      en: 'The weather became colder in December.',
      vi: 'Thời tiết trở lạnh hơn vào tháng Mười Hai.',
    },
  ],
  'become|pastPart': [
    { en: 'She has become a famous singer.', vi: 'Cô ấy đã trở thành một ca sĩ nổi tiếng.' },
    { en: 'The city has become very crowded.', vi: 'Thành phố đã trở nên rất đông đúc.' },
  ],
  'leave|past': [
    { en: 'The train left ten minutes ago.', vi: 'Tàu đã rời đi mười phút trước.' },
    { en: 'I left my umbrella at the office.', vi: 'Tôi để quên ô ở văn phòng.' },
  ],
  'feel|past': [
    { en: 'I felt tired after the long trip.', vi: 'Tôi thấy mệt sau chuyến đi dài.' },
    { en: 'She felt happy about the good news.', vi: 'Cô ấy cảm thấy vui vì tin tốt.' },
  ],
  'bring|past': [
    { en: 'She brought some fruit to the party.', vi: 'Cô ấy mang ít trái cây đến bữa tiệc.' },
    { en: 'The rain brought cooler weather.', vi: 'Cơn mưa mang lại thời tiết mát mẻ hơn.' },
  ],
  'begin|past': [
    { en: 'The film began at eight o’clock.', vi: 'Bộ phim bắt đầu lúc tám giờ.' },
    { en: 'It began to rain in the afternoon.', vi: 'Trời bắt đầu mưa vào buổi chiều.' },
  ],
  'begin|pastPart': [
    { en: 'The meeting has already begun.', vi: 'Cuộc họp đã bắt đầu rồi.' },
    { en: 'The new project has just begun.', vi: 'Dự án mới vừa mới bắt đầu.' },
  ],
  'keep|past': [
    { en: 'She kept the letter for many years.', vi: 'Cô ấy giữ bức thư trong nhiều năm.' },
    { en: 'He kept running until the finish line.', vi: 'Anh ấy cứ chạy mãi đến vạch đích.' },
  ],
  'hold|past': [
    { en: 'The mother held her baby gently.', vi: 'Người mẹ nhẹ nhàng bế em bé.' },
    { en: 'They held a meeting yesterday.', vi: 'Hôm qua họ đã tổ chức một cuộc họp.' },
  ],
  'write|past': [
    { en: 'She wrote a letter to her friend.', vi: 'Cô ấy viết một lá thư cho bạn.' },
    { en: 'He wrote his name on the board.', vi: 'Anh ấy viết tên mình lên bảng.' },
  ],
  'write|pastPart': [
    {
      en: 'This book was written by a young author.',
      vi: 'Cuốn sách này do một tác giả trẻ viết.',
    },
    { en: 'I have written three emails today.', vi: 'Hôm nay tôi đã viết ba email.' },
  ],
  'stand|past': [
    { en: 'We stood in line for an hour.', vi: 'Chúng tôi đứng xếp hàng cả tiếng đồng hồ.' },
    { en: 'He stood near the door.', vi: 'Anh ấy đứng gần cửa.' },
  ],
  'hear|past': [
    { en: 'I heard a strange noise last night.', vi: 'Đêm qua tôi nghe thấy một tiếng động lạ.' },
    { en: 'She heard the good news from a friend.', vi: 'Cô ấy nghe tin vui từ một người bạn.' },
  ],
  'let|past': [
    { en: 'My parents let me go to the concert.', vi: 'Bố mẹ cho tôi đi xem hòa nhạc.' },
    { en: 'She let the cat sleep on the sofa.', vi: 'Cô ấy để con mèo ngủ trên ghế sofa.' },
  ],
  'mean|past': [
    { en: 'I never meant to hurt you.', vi: 'Tôi chưa bao giờ có ý làm bạn tổn thương.' },
    {
      en: 'The red light meant we had to stop.',
      vi: 'Đèn đỏ có nghĩa là chúng tôi phải dừng lại.',
    },
  ],
  'meet|past': [
    { en: 'I met an old friend at the station.', vi: 'Tôi gặp một người bạn cũ ở nhà ga.' },
    { en: 'We first met in 2019.', vi: 'Chúng tôi gặp nhau lần đầu vào năm 2019.' },
  ],
  'run|past': [
    { en: 'He ran to catch the bus.', vi: 'Anh ấy chạy để bắt kịp xe buýt.' },
    { en: 'She ran five kilometers this morning.', vi: 'Sáng nay cô ấy chạy năm cây số.' },
  ],
  'pay|past': [
    { en: 'I paid for the coffee.', vi: 'Tôi đã trả tiền cà phê.' },
    { en: 'They paid the bill in cash.', vi: 'Họ thanh toán hóa đơn bằng tiền mặt.' },
  ],
  'sit|past': [
    { en: 'We sat by the window.', vi: 'Chúng tôi ngồi cạnh cửa sổ.' },
    { en: 'She sat quietly and read a book.', vi: 'Cô ấy ngồi lặng lẽ đọc sách.' },
  ],
  'speak|past': [
    { en: 'He spoke very clearly.', vi: 'Anh ấy nói rất rõ ràng.' },
    {
      en: 'She spoke to the teacher after class.',
      vi: 'Cô ấy nói chuyện với giáo viên sau giờ học.',
    },
  ],
  'speak|pastPart': [
    { en: 'English is spoken all over the world.', vi: 'Tiếng Anh được nói trên khắp thế giới.' },
    {
      en: 'I have not spoken to him for weeks.',
      vi: 'Tôi đã không nói chuyện với anh ấy nhiều tuần.',
    },
  ],
  'lead|past': [
    {
      en: 'The guide led us through the old town.',
      vi: 'Hướng dẫn viên dẫn chúng tôi qua khu phố cổ.',
    },
    { en: 'Hard work led to his success.', vi: 'Sự chăm chỉ đã dẫn đến thành công của anh ấy.' },
  ],
  'read|past': [
    { en: 'I read the whole book last weekend.', vi: 'Cuối tuần trước tôi đọc hết cả cuốn sách.' },
    { en: 'She read the message twice.', vi: 'Cô ấy đọc tin nhắn hai lần.' },
  ],
  'grow|past': [
    { en: 'The children grew very fast.', vi: 'Bọn trẻ lớn rất nhanh.' },
    { en: 'We grew vegetables in our garden.', vi: 'Chúng tôi trồng rau trong vườn.' },
  ],
  'grow|pastPart': [
    {
      en: 'The city has grown a lot in ten years.',
      vi: 'Thành phố đã phát triển rất nhiều trong mười năm.',
    },
    { en: 'These flowers are grown in Da Lat.', vi: 'Những bông hoa này được trồng ở Đà Lạt.' },
  ],
  'lose|past': [
    { en: 'I lost my keys yesterday.', vi: 'Hôm qua tôi làm mất chìa khóa.' },
    { en: 'Our team lost the match.', vi: 'Đội của chúng tôi thua trận đấu.' },
  ],
  'fall|past': [
    { en: 'The old man fell on the ice.', vi: 'Ông cụ bị ngã trên băng.' },
    { en: 'Prices fell last month.', vi: 'Giá cả giảm vào tháng trước.' },
  ],
  'fall|pastPart': [
    { en: 'Many leaves have fallen from the tree.', vi: 'Nhiều lá đã rụng khỏi cây.' },
    { en: 'The temperature has fallen sharply.', vi: 'Nhiệt độ đã giảm mạnh.' },
  ],
  'send|past': [
    { en: 'She sent me a postcard from Hue.', vi: 'Cô ấy gửi cho tôi một tấm bưu thiếp từ Huế.' },
    { en: 'I sent the email this morning.', vi: 'Tôi đã gửi email sáng nay.' },
  ],
  'build|past': [
    {
      en: 'They built a new bridge over the river.',
      vi: 'Họ đã xây một cây cầu mới bắc qua sông.',
    },
    { en: 'My grandfather built this house himself.', vi: 'Ông tôi tự tay xây ngôi nhà này.' },
  ],
  'understand|past': [
    { en: 'I understood the lesson very well.', vi: 'Tôi hiểu bài học rất rõ.' },
    { en: 'She understood what I meant.', vi: 'Cô ấy hiểu ý tôi.' },
  ],
  'spend|past': [
    { en: 'We spent a week in Nha Trang.', vi: 'Chúng tôi ở Nha Trang một tuần.' },
    { en: 'She spent all her money on books.', vi: 'Cô ấy tiêu hết tiền vào sách.' },
  ],
  'drive|past': [
    { en: 'He drove to the countryside on Sunday.', vi: 'Chủ nhật anh ấy lái xe về quê.' },
    { en: 'She drove carefully in the rain.', vi: 'Cô ấy lái xe cẩn thận dưới mưa.' },
  ],
  'drive|pastPart': [
    { en: 'This car has been driven for years.', vi: 'Chiếc xe này đã được dùng nhiều năm.' },
    { en: 'I have never driven a truck.', vi: 'Tôi chưa bao giờ lái xe tải.' },
  ],
  'buy|past': [
    { en: 'I bought some vegetables at the market.', vi: 'Tôi mua ít rau ở chợ.' },
    { en: 'She bought a gift for her mother.', vi: 'Cô ấy mua một món quà cho mẹ.' },
  ],
  'wear|past': [
    { en: 'She wore a beautiful ao dai.', vi: 'Cô ấy mặc một chiếc áo dài đẹp.' },
    { en: 'He wore a coat because it was cold.', vi: 'Anh ấy mặc áo khoác vì trời lạnh.' },
  ],
  'wear|pastPart': [
    { en: 'This shirt has been worn only once.', vi: 'Chiếc áo này mới chỉ mặc một lần.' },
    { en: 'A uniform must be worn at school.', vi: 'Phải mặc đồng phục ở trường.' },
  ],
  'choose|past': [
    { en: 'I chose the blue one.', vi: 'Tôi đã chọn cái màu xanh.' },
    { en: 'They chose her as the leader.', vi: 'Họ chọn cô ấy làm trưởng nhóm.' },
  ],
  'choose|pastPart': [
    { en: 'The winner has been chosen.', vi: 'Người chiến thắng đã được chọn.' },
    {
      en: 'I have chosen a good school for my son.',
      vi: 'Tôi đã chọn một ngôi trường tốt cho con trai.',
    },
  ],
  'throw|past': [
    { en: 'He threw the ball to his dog.', vi: 'Anh ấy ném quả bóng cho con chó.' },
    { en: 'She threw away the old newspapers.', vi: 'Cô ấy vứt đi những tờ báo cũ.' },
  ],
  'throw|pastPart': [
    { en: 'The rubbish has been thrown away.', vi: 'Rác đã được vứt đi.' },
    { en: 'The ball was thrown over the wall.', vi: 'Quả bóng bị ném qua tường.' },
  ],
  'catch|past': [
    { en: 'I caught the last bus home.', vi: 'Tôi bắt kịp chuyến xe buýt cuối về nhà.' },
    { en: 'The cat caught a mouse.', vi: 'Con mèo bắt được một con chuột.' },
  ],
  'win|past': [
    { en: 'Our team won the game.', vi: 'Đội của chúng tôi đã thắng trận.' },
    { en: 'She won first prize in the contest.', vi: 'Cô ấy giành giải nhất trong cuộc thi.' },
  ],
  'forget|past': [
    { en: 'I forgot to bring my umbrella.', vi: 'Tôi quên mang ô.' },
    { en: 'She forgot his phone number.', vi: 'Cô ấy quên số điện thoại của anh ấy.' },
  ],
  'forget|pastPart': [
    { en: 'His name has been forgotten.', vi: 'Tên anh ấy đã bị lãng quên.' },
    { en: 'I have forgotten my password again.', vi: 'Tôi lại quên mật khẩu rồi.' },
  ],
  'sell|past': [
    { en: 'They sold their old car.', vi: 'Họ đã bán chiếc xe cũ.' },
    { en: 'She sold flowers at the market.', vi: 'Cô ấy bán hoa ở chợ.' },
  ],
  'eat|past': [
    { en: 'We ate pho for breakfast.', vi: 'Chúng tôi ăn phở cho bữa sáng.' },
    { en: 'She ate too much cake.', vi: 'Cô ấy ăn quá nhiều bánh.' },
  ],
  'eat|pastPart': [
    { en: 'Have you eaten yet?', vi: 'Bạn ăn gì chưa?' },
    { en: 'All the rice has been eaten.', vi: 'Cơm đã được ăn hết.' },
  ],
  'drink|past': [
    { en: 'He drank a glass of water.', vi: 'Anh ấy uống một cốc nước.' },
    { en: 'We drank coffee at the corner shop.', vi: 'Chúng tôi uống cà phê ở quán góc phố.' },
  ],
  'drink|pastPart': [
    { en: 'All the milk has been drunk.', vi: 'Sữa đã được uống hết.' },
    { en: 'I have not drunk enough water today.', vi: 'Hôm nay tôi uống chưa đủ nước.' },
  ],
  'swim|past': [
    { en: 'We swam in the sea all afternoon.', vi: 'Chúng tôi bơi ở biển cả buổi chiều.' },
    { en: 'She swam across the lake.', vi: 'Cô ấy bơi qua hồ.' },
  ],
  'fly|past': [
    { en: 'The plane flew above the clouds.', vi: 'Máy bay bay trên những đám mây.' },
    { en: 'We flew to Ho Chi Minh City.', vi: 'Chúng tôi bay vào Thành phố Hồ Chí Minh.' },
  ],
  'fly|pastPart': [
    {
      en: 'The birds have flown south for winter.',
      vi: 'Đàn chim đã bay về phương nam tránh đông.',
    },
    { en: 'I have never flown in a helicopter.', vi: 'Tôi chưa bao giờ đi trực thăng.' },
  ],
  'ride|past': [
    { en: 'He rode his bike to school.', vi: 'Anh ấy đạp xe đến trường.' },
    { en: 'We rode a boat on the river.', vi: 'Chúng tôi đi thuyền trên sông.' },
  ],
  'sing|past': [
    { en: 'She sang a beautiful song.', vi: 'Cô ấy hát một bài hát hay.' },
    { en: 'We sang together at the party.', vi: 'Chúng tôi cùng hát ở bữa tiệc.' },
  ],
  'sing|pastPart': [
    { en: 'This song has been sung for years.', vi: 'Bài hát này đã được hát nhiều năm.' },
    { en: 'The national anthem was sung by everyone.', vi: 'Quốc ca được mọi người cùng hát.' },
  ],
  'sleep|past': [
    { en: 'I slept for nine hours last night.', vi: 'Đêm qua tôi ngủ chín tiếng.' },
    { en: 'The baby slept all afternoon.', vi: 'Em bé ngủ cả buổi chiều.' },
  ],
  'teach|past': [
    { en: 'She taught English for ten years.', vi: 'Cô ấy dạy tiếng Anh mười năm.' },
    { en: 'My father taught me how to swim.', vi: 'Bố dạy tôi cách bơi.' },
  ],
  'wake|past': [
    { en: 'I woke up early this morning.', vi: 'Sáng nay tôi dậy sớm.' },
    { en: 'The noise woke the baby.', vi: 'Tiếng ồn làm em bé thức giấc.' },
  ],
  'hide|past': [
    { en: 'The child hid behind the door.', vi: 'Đứa trẻ trốn sau cánh cửa.' },
    { en: 'She hid the gift in the closet.', vi: 'Cô ấy giấu món quà trong tủ.' },
  ],
  'hide|pastPart': [
    { en: 'The money was hidden under the bed.', vi: 'Tiền được giấu dưới gầm giường.' },
    { en: 'He has hidden the truth from us.', vi: 'Anh ấy đã giấu chúng tôi sự thật.' },
  ],
  'steal|past': [
    { en: 'Someone stole my bicycle.', vi: 'Ai đó đã lấy trộm xe đạp của tôi.' },
    { en: 'The thief stole a lot of money.', vi: 'Tên trộm lấy đi rất nhiều tiền.' },
  ],
  'steal|pastPart': [
    { en: 'My phone has been stolen.', vi: 'Điện thoại của tôi bị lấy trộm.' },
    { en: 'The paintings were stolen last night.', vi: 'Những bức tranh bị đánh cắp đêm qua.' },
  ],
  'draw|past': [
    { en: 'The boy drew a picture of his family.', vi: 'Cậu bé vẽ một bức tranh về gia đình.' },
    { en: 'She drew a map for me.', vi: 'Cô ấy vẽ cho tôi một tấm bản đồ.' },
  ],
  'draw|pastPart': [
    { en: 'This picture was drawn by a child.', vi: 'Bức tranh này do một đứa trẻ vẽ.' },
    { en: 'I have drawn a plan for the garden.', vi: 'Tôi đã vẽ một sơ đồ cho khu vườn.' },
  ],
  'cut|past': [
    { en: 'He cut the cake into eight pieces.', vi: 'Anh ấy cắt bánh thành tám phần.' },
    { en: 'She cut her finger while cooking.', vi: 'Cô ấy bị đứt tay khi nấu ăn.' },
  ],
  'put|past': [
    { en: 'I put the keys on the table.', vi: 'Tôi để chìa khóa trên bàn.' },
    { en: 'She put the baby to bed.', vi: 'Cô ấy đặt em bé đi ngủ.' },
  ],
  'hit|past': [
    { en: 'The ball hit the window.', vi: 'Quả bóng đập vào cửa sổ.' },
    { en: 'A storm hit the coast last night.', vi: 'Một cơn bão đã đổ vào bờ biển đêm qua.' },
  ],
  'set|past': [
    { en: 'The sun set behind the mountains.', vi: 'Mặt trời lặn sau những ngọn núi.' },
    { en: 'She set the table for dinner.', vi: 'Cô ấy dọn bàn cho bữa tối.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 2) DANH TỪ SỐ NHIỀU BẤT QUY TẮC
  // ══════════════════════════════════════════════════════════════════════════
  'child|plural': [
    { en: 'The children are playing in the yard.', vi: 'Bọn trẻ đang chơi ngoài sân.' },
    {
      en: 'All the children got a small gift.',
      vi: 'Tất cả bọn trẻ đều nhận được một món quà nhỏ.',
    },
  ],
  'man|plural': [
    { en: 'Two men were waiting at the door.', vi: 'Hai người đàn ông đang đợi ở cửa.' },
    {
      en: 'The men worked in the field all day.',
      vi: 'Những người đàn ông làm việc ngoài đồng cả ngày.',
    },
  ],
  'woman|plural': [
    {
      en: 'Three women were talking in the kitchen.',
      vi: 'Ba người phụ nữ đang trò chuyện trong bếp.',
    },
    {
      en: 'The women sang a folk song together.',
      vi: 'Những người phụ nữ cùng hát một bài dân ca.',
    },
  ],
  'foot|plural': [
    { en: 'My feet hurt after the long walk.', vi: 'Chân tôi đau sau khi đi bộ đường dài.' },
    { en: 'Keep your feet warm in winter.', vi: 'Hãy giữ ấm chân vào mùa đông.' },
  ],
  'tooth|plural': [
    { en: 'Brush your teeth twice a day.', vi: 'Hãy đánh răng hai lần một ngày.' },
    { en: 'The baby has two new teeth.', vi: 'Em bé có hai chiếc răng mới.' },
  ],
  'mouse|plural': [
    { en: 'There are mice in the old barn.', vi: 'Có mấy con chuột trong kho cũ.' },
    { en: 'The cat chased the mice away.', vi: 'Con mèo đuổi lũ chuột đi.' },
  ],
  'person|plural': [
    { en: 'Many people came to the festival.', vi: 'Rất nhiều người đến lễ hội.' },
    { en: 'Some people prefer tea to coffee.', vi: 'Một số người thích trà hơn cà phê.' },
  ],
  'leaf|plural': [
    { en: 'The leaves turn yellow in autumn.', vi: 'Lá chuyển vàng vào mùa thu.' },
    { en: 'We raked the leaves in the garden.', vi: 'Chúng tôi cào lá trong vườn.' },
  ],
  'life|plural': [
    { en: 'The fire put many lives at risk.', vi: 'Đám cháy khiến nhiều mạng sống gặp nguy hiểm.' },
    { en: 'Their lives changed after the trip.', vi: 'Cuộc sống của họ thay đổi sau chuyến đi.' },
  ],
  'knife|plural': [
    { en: 'The knives are in the top drawer.', vi: 'Mấy con dao ở trong ngăn kéo trên cùng.' },
    { en: 'These knives are very sharp.', vi: 'Những con dao này rất sắc.' },
  ],
  'wife|plural': [
    { en: 'The two men brought their wives.', vi: 'Hai người đàn ông dẫn theo vợ.' },
    { en: 'Their wives are close friends.', vi: 'Vợ của họ là bạn thân của nhau.' },
  ],
  'fish|plural': [
    { en: 'There are many fish in this lake.', vi: 'Có nhiều cá trong hồ này.' },
    { en: 'We caught five fish this morning.', vi: 'Sáng nay chúng tôi bắt được năm con cá.' },
  ],
  'sheep|plural': [
    { en: 'The farmer keeps twenty sheep.', vi: 'Người nông dân nuôi hai mươi con cừu.' },
    { en: 'The sheep are grazing on the hill.', vi: 'Đàn cừu đang gặm cỏ trên đồi.' },
  ],
  'goose|plural': [
    { en: 'The geese flew over the lake.', vi: 'Đàn ngỗng bay qua hồ.' },
    { en: 'We saw wild geese near the river.', vi: 'Chúng tôi thấy ngỗng trời gần sông.' },
  ],
  'wolf|plural': [
    { en: 'Wolves hunt together in a pack.', vi: 'Bầy sói săn mồi cùng nhau.' },
    { en: 'The wolves howled at night.', vi: 'Đàn sói tru lên trong đêm.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 3) TÍNH TỪ SO SÁNH BẤT QUY TẮC (so sánh hơn / nhất)
  // ══════════════════════════════════════════════════════════════════════════
  'good|comparative': [
    { en: 'This restaurant is better than that one.', vi: 'Nhà hàng này ngon hơn nhà hàng kia.' },
    { en: 'Her English is better now.', vi: 'Tiếng Anh của cô ấy giờ tốt hơn rồi.' },
  ],
  'good|superlative': [
    { en: 'This is the best coffee in town.', vi: 'Đây là cà phê ngon nhất thị trấn.' },
    { en: 'She is the best student in the class.', vi: 'Cô ấy là học sinh giỏi nhất lớp.' },
  ],
  'bad|comparative': [
    { en: 'The traffic is worse in the morning.', vi: 'Giao thông tệ hơn vào buổi sáng.' },
    { en: 'His cold got worse overnight.', vi: 'Cơn cảm của anh ấy nặng hơn qua một đêm.' },
  ],
  'bad|superlative': [
    { en: 'That was the worst day of my life.', vi: 'Đó là ngày tồi tệ nhất đời tôi.' },
    {
      en: 'This is the worst traffic I have seen.',
      vi: 'Đây là cảnh tắc đường tệ nhất tôi từng thấy.',
    },
  ],
  'far|comparative': [
    { en: 'The station is farther than I thought.', vi: 'Nhà ga xa hơn tôi tưởng.' },
    { en: 'Can you walk a little farther?', vi: 'Bạn có thể đi xa thêm một chút không?' },
  ],
  'far|superlative': [
    {
      en: 'That is the farthest village in the valley.',
      vi: 'Đó là ngôi làng xa nhất trong thung lũng.',
    },
    { en: 'He threw the ball the farthest.', vi: 'Anh ấy ném bóng xa nhất.' },
  ],
  'little|comparative': [
    { en: 'Please put less sugar in my tea.', vi: 'Làm ơn cho ít đường hơn vào trà của tôi.' },
    { en: 'We have less time than before.', vi: 'Chúng ta có ít thời gian hơn trước.' },
  ],
  'many|comparative': [
    { en: 'More people came than we expected.', vi: 'Nhiều người đến hơn chúng tôi mong đợi.' },
    { en: 'She has more books than me.', vi: 'Cô ấy có nhiều sách hơn tôi.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 4) TÍNH TỪ SO SÁNH THƯỜNG (A1–B2 hay gặp) — so sánh hơn
  // ══════════════════════════════════════════════════════════════════════════
  'big|comparative': [
    { en: 'An elephant is bigger than a horse.', vi: 'Con voi to hơn con ngựa.' },
    { en: 'We need a bigger table.', vi: 'Chúng ta cần một cái bàn to hơn.' },
  ],
  'big|superlative': [
    { en: 'This is the biggest market in the city.', vi: 'Đây là khu chợ lớn nhất thành phố.' },
    { en: 'It was the biggest fish I ever caught.', vi: 'Đó là con cá to nhất tôi từng bắt.' },
  ],
  'small|comparative': [
    { en: 'A phone is smaller than a laptop.', vi: 'Điện thoại nhỏ hơn máy tính xách tay.' },
    { en: 'Their house is smaller than ours.', vi: 'Nhà của họ nhỏ hơn nhà chúng tôi.' },
  ],
  'hot|comparative': [
    { en: 'Summer is hotter than spring.', vi: 'Mùa hè nóng hơn mùa xuân.' },
    { en: 'Today is hotter than yesterday.', vi: 'Hôm nay nóng hơn hôm qua.' },
  ],
  'hot|superlative': [
    { en: 'June is the hottest month here.', vi: 'Tháng Sáu là tháng nóng nhất ở đây.' },
    { en: 'It was the hottest day of the year.', vi: 'Đó là ngày nóng nhất trong năm.' },
  ],
  'cold|comparative': [
    { en: 'The north is colder than the south.', vi: 'Miền Bắc lạnh hơn miền Nam.' },
    { en: 'It gets colder at night.', vi: 'Trời trở lạnh hơn về đêm.' },
  ],
  'happy|comparative': [
    { en: 'She looks happier than last year.', vi: 'Trông cô ấy vui hơn năm ngoái.' },
    {
      en: 'Children are happier when they play outside.',
      vi: 'Trẻ con vui hơn khi được chơi ngoài trời.',
    },
  ],
  'happy|superlative': [
    { en: 'That was the happiest day of her life.', vi: 'Đó là ngày hạnh phúc nhất đời cô ấy.' },
    { en: 'He is the happiest person I know.', vi: 'Anh ấy là người vui vẻ nhất tôi biết.' },
  ],
  'easy|comparative': [
    { en: 'This exercise is easier than the last one.', vi: 'Bài tập này dễ hơn bài trước.' },
    { en: 'Cooking is easier with a good recipe.', vi: 'Nấu ăn dễ hơn khi có công thức tốt.' },
  ],
  'busy|comparative': [
    { en: 'The street is busier in the evening.', vi: 'Con phố đông đúc hơn vào buổi tối.' },
    { en: 'I am busier this week than usual.', vi: 'Tuần này tôi bận hơn bình thường.' },
  ],
  'tall|comparative': [
    { en: 'My brother is taller than me.', vi: 'Anh trai tôi cao hơn tôi.' },
    { en: 'This building is taller than that one.', vi: 'Tòa nhà này cao hơn tòa kia.' },
  ],
  'nice|comparative': [
    { en: 'The weather is nicer today.', vi: 'Thời tiết hôm nay đẹp hơn.' },
    { en: 'This hotel is nicer than the old one.', vi: 'Khách sạn này đẹp hơn khách sạn cũ.' },
  ],
  'cheap|comparative': [
    { en: 'Vegetables are cheaper at the market.', vi: 'Rau ở chợ rẻ hơn.' },
    { en: 'This phone is cheaper than that one.', vi: 'Điện thoại này rẻ hơn cái kia.' },
  ],
  'long|comparative': [
    { en: 'The Mekong is longer than the Red River.', vi: 'Sông Mê Kông dài hơn sông Hồng.' },
    { en: 'Summer days are longer than winter days.', vi: 'Ngày mùa hè dài hơn ngày mùa đông.' },
  ],
  'short|comparative': [
    { en: 'This road is shorter than the other one.', vi: 'Con đường này ngắn hơn con đường kia.' },
    { en: 'Her hair is shorter now.', vi: 'Tóc cô ấy giờ ngắn hơn.' },
  ],
  'old|comparative': [
    { en: 'My brother is older than me.', vi: 'Anh trai tôi lớn tuổi hơn tôi.' },
    { en: 'This building is older than the church.', vi: 'Tòa nhà này cổ hơn nhà thờ.' },
  ],
  'young|comparative': [
    { en: 'She looks younger than her age.', vi: 'Trông cô ấy trẻ hơn tuổi.' },
    { en: 'He is two years younger than me.', vi: 'Anh ấy nhỏ hơn tôi hai tuổi.' },
  ],
  'new|comparative': [
    { en: 'This phone is newer than mine.', vi: 'Điện thoại này mới hơn của tôi.' },
    { en: 'We moved to a newer flat.', vi: 'Chúng tôi chuyển đến một căn hộ mới hơn.' },
  ],
  'fast|comparative': [
    { en: 'A train is faster than a bus.', vi: 'Tàu hỏa nhanh hơn xe buýt.' },
    { en: 'He runs faster than his friends.', vi: 'Anh ấy chạy nhanh hơn các bạn.' },
  ],
  'slow|comparative': [
    { en: 'The traffic is slower in the rain.', vi: 'Giao thông chậm hơn khi trời mưa.' },
    { en: 'This computer is slower than the old one.', vi: 'Máy tính này chậm hơn máy cũ.' },
  ],
  'strong|comparative': [
    { en: 'Coffee is stronger than tea.', vi: 'Cà phê đậm hơn trà.' },
    { en: 'He is stronger than he looks.', vi: 'Anh ấy khỏe hơn vẻ ngoài.' },
  ],
  'clean|comparative': [
    { en: 'The air is cleaner in the countryside.', vi: 'Không khí ở nông thôn trong lành hơn.' },
    { en: 'This room is cleaner than mine.', vi: 'Căn phòng này sạch hơn phòng tôi.' },
  ],
  'warm|comparative': [
    { en: 'The south is warmer than the north.', vi: 'Miền Nam ấm hơn miền Bắc.' },
    { en: 'It feels warmer today.', vi: 'Hôm nay cảm giác ấm hơn.' },
  ],
  'cool|comparative': [
    { en: 'The evening is cooler than the afternoon.', vi: 'Buổi tối mát hơn buổi chiều.' },
    { en: 'It is cooler under the trees.', vi: 'Dưới những tán cây mát hơn.' },
  ],
  'late|comparative': [
    { en: 'He arrived later than everyone.', vi: 'Anh ấy đến muộn hơn mọi người.' },
    { en: 'The bus is later than usual today.', vi: 'Hôm nay xe buýt muộn hơn thường lệ.' },
  ],
  'wide|comparative': [
    { en: 'This street is wider than that one.', vi: 'Con phố này rộng hơn con phố kia.' },
    { en: 'The new road is wider and safer.', vi: 'Con đường mới rộng hơn và an toàn hơn.' },
  ],
  'rich|comparative': [
    { en: 'He is richer than his neighbors.', vi: 'Anh ấy giàu hơn hàng xóm.' },
    { en: 'The soil here is richer for farming.', vi: 'Đất ở đây màu mỡ hơn để trồng trọt.' },
  ],
  'poor|comparative': [
    {
      en: 'Some families are poorer than others.',
      vi: 'Một số gia đình nghèo hơn các gia đình khác.',
    },
    { en: 'The village was poorer in the past.', vi: 'Ngôi làng ngày xưa nghèo hơn.' },
  ],
  'kind|comparative': [
    { en: 'She is kinder than her sister.', vi: 'Cô ấy tốt bụng hơn chị mình.' },
    { en: 'People here are kinder to strangers.', vi: 'Người ở đây tử tế hơn với người lạ.' },
  ],
  'funny|comparative': [
    { en: 'This film is funnier than the last one.', vi: 'Bộ phim này vui hơn phim trước.' },
    { en: 'His jokes are funnier than mine.', vi: 'Mấy trò đùa của anh ấy vui hơn của tôi.' },
  ],
  'heavy|comparative': [
    { en: 'This bag is heavier than that one.', vi: 'Cái túi này nặng hơn cái kia.' },
    { en: 'The rain is heavier now.', vi: 'Mưa giờ nặng hạt hơn.' },
  ],
  'dark|comparative': [
    { en: 'The sky grew darker before the storm.', vi: 'Bầu trời tối hơn trước cơn bão.' },
    { en: 'This color is darker than blue.', vi: 'Màu này đậm hơn màu xanh.' },
  ],
  'quiet|comparative': [
    { en: 'The library is quieter than the café.', vi: 'Thư viện yên tĩnh hơn quán cà phê.' },
    { en: 'The street is quieter at night.', vi: 'Con phố yên tĩnh hơn vào ban đêm.' },
  ],
  'loud|comparative': [
    { en: 'The music got louder at midnight.', vi: 'Nhạc to hơn vào lúc nửa đêm.' },
    { en: 'His voice is louder than mine.', vi: 'Giọng anh ấy to hơn giọng tôi.' },
  ],
  'hard|comparative': [
    { en: 'This exam is harder than the last.', vi: 'Bài thi này khó hơn bài trước.' },
    { en: 'She works harder than anyone.', vi: 'Cô ấy làm việc chăm chỉ hơn bất kỳ ai.' },
  ],
  'sweet|comparative': [
    { en: 'Ripe mangoes are sweeter.', vi: 'Xoài chín ngọt hơn.' },
    { en: 'This tea is sweeter than I like.', vi: 'Trà này ngọt hơn tôi thích.' },
  ],
  'fresh|comparative': [
    { en: 'The fish at the market is fresher.', vi: 'Cá ở chợ tươi hơn.' },
    { en: 'The air is fresher after the rain.', vi: 'Không khí trong lành hơn sau cơn mưa.' },
  ],
  'dirty|comparative': [
    { en: 'The river is dirtier than before.', vi: 'Dòng sông bẩn hơn trước.' },
    { en: 'My shoes are dirtier than yours.', vi: 'Giày của tôi bẩn hơn giày của bạn.' },
  ],
  'angry|comparative': [
    {
      en: 'He got angrier when no one listened.',
      vi: 'Anh ấy càng tức giận hơn khi không ai nghe.',
    },
    { en: 'She was angrier than I expected.', vi: 'Cô ấy giận hơn tôi tưởng.' },
  ],
  'hungry|comparative': [
    { en: 'I am hungrier after exercise.', vi: 'Tôi đói hơn sau khi tập thể dục.' },
    { en: 'The children are hungrier at noon.', vi: 'Bọn trẻ đói hơn vào buổi trưa.' },
  ],
  'low|comparative': [
    { en: 'Prices are lower at the market.', vi: 'Giá ở chợ thấp hơn.' },
    { en: 'The river is lower in the dry season.', vi: 'Mực nước sông thấp hơn vào mùa khô.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 5) TÍNH TỪ SO SÁNH NHẤT (A1–B2 hay gặp)
  // ══════════════════════════════════════════════════════════════════════════
  'old|superlative': [
    { en: 'This is the oldest temple in the city.', vi: 'Đây là ngôi đền cổ nhất thành phố.' },
    { en: 'He is the oldest in the family.', vi: 'Ông ấy là người lớn tuổi nhất nhà.' },
  ],
  'young|superlative': [
    { en: 'She is the youngest teacher at school.', vi: 'Cô ấy là giáo viên trẻ nhất trường.' },
    { en: 'He is the youngest of five children.', vi: 'Anh ấy là con út trong năm anh em.' },
  ],
  'long|superlative': [
    {
      en: 'The Nile is the longest river in the world.',
      vi: 'Sông Nile là con sông dài nhất thế giới.',
    },
    { en: 'That was the longest day of my life.', vi: 'Đó là ngày dài nhất đời tôi.' },
  ],
  'short|superlative': [
    { en: 'This is the shortest way to the beach.', vi: 'Đây là đường ngắn nhất ra biển.' },
    { en: 'February is the shortest month.', vi: 'Tháng Hai là tháng ngắn nhất.' },
  ],
  'new|superlative': [
    {
      en: 'This is the newest phone in the shop.',
      vi: 'Đây là chiếc điện thoại mới nhất cửa hàng.',
    },
    { en: 'She bought the newest model.', vi: 'Cô ấy mua mẫu mới nhất.' },
  ],
  'fast|superlative': [
    {
      en: 'He is the fastest runner in the school.',
      vi: 'Anh ấy là người chạy nhanh nhất trường.',
    },
    { en: 'This is the fastest way to get there.', vi: 'Đây là cách nhanh nhất để đến đó.' },
  ],
  'strong|superlative': [
    { en: 'He is the strongest man in the village.', vi: 'Anh ấy là người khỏe nhất làng.' },
    { en: 'This is the strongest coffee they make.', vi: 'Đây là loại cà phê đậm nhất họ pha.' },
  ],
  'rich|superlative': [
    { en: 'He is the richest man in town.', vi: 'Ông ấy là người giàu nhất thị trấn.' },
    { en: 'This is the richest soil in the area.', vi: 'Đây là vùng đất màu mỡ nhất khu vực.' },
  ],
  'kind|superlative': [
    { en: 'She is the kindest person I know.', vi: 'Cô ấy là người tử tế nhất tôi biết.' },
    { en: 'He gave the kindest smile.', vi: 'Anh ấy nở nụ cười hiền nhất.' },
  ],
  'clean|superlative': [
    { en: 'This is the cleanest beach in the country.', vi: 'Đây là bãi biển sạch nhất cả nước.' },
    {
      en: 'Her kitchen is the cleanest I have seen.',
      vi: 'Bếp của cô ấy sạch nhất tôi từng thấy.',
    },
  ],
  'deep|superlative': [
    { en: 'This is the deepest lake in the region.', vi: 'Đây là hồ sâu nhất vùng.' },
    { en: 'It was the deepest sleep in weeks.', vi: 'Đó là giấc ngủ sâu nhất trong nhiều tuần.' },
  ],
  'high|superlative': [
    {
      en: 'Fansipan is the highest mountain in Vietnam.',
      vi: 'Fansipan là ngọn núi cao nhất Việt Nam.',
    },
    { en: 'She got the highest score in the class.', vi: 'Cô ấy đạt điểm cao nhất lớp.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 6) ĐỘNG TỪ THƯỜNG A1–B2 — dạng V-ing (hiện tại tiếp diễn)
  // ══════════════════════════════════════════════════════════════════════════
  'play|ving': [
    {
      en: 'The kids are playing football in the park.',
      vi: 'Bọn trẻ đang chơi bóng đá trong công viên.',
    },
    { en: 'She is playing the piano right now.', vi: 'Cô ấy đang chơi đàn piano ngay lúc này.' },
  ],
  'run|ving': [
    { en: 'He is running to catch the bus.', vi: 'Anh ấy đang chạy để bắt xe buýt.' },
    { en: 'Why are you running so fast?', vi: 'Sao bạn chạy nhanh thế?' },
  ],
  'make|ving': [
    { en: 'My mother is making dinner.', vi: 'Mẹ tôi đang nấu bữa tối.' },
    { en: 'They are making too much noise.', vi: 'Họ đang làm ồn quá.' },
  ],
  'write|ving': [
    { en: 'She is writing a letter to her friend.', vi: 'Cô ấy đang viết thư cho bạn.' },
    { en: 'I am writing an email to my boss.', vi: 'Tôi đang viết email cho sếp.' },
  ],
  'study|ving': [
    { en: 'He is studying for his exam.', vi: 'Anh ấy đang ôn thi.' },
    { en: 'We are studying English together.', vi: 'Chúng tôi đang học tiếng Anh cùng nhau.' },
  ],
  'cook|ving': [
    { en: 'Dad is cooking breakfast in the kitchen.', vi: 'Bố đang nấu bữa sáng trong bếp.' },
    {
      en: 'She is cooking a special meal tonight.',
      vi: 'Tối nay cô ấy đang nấu một bữa đặc biệt.',
    },
  ],
  'work|ving': [
    { en: 'He is working from home today.', vi: 'Hôm nay anh ấy đang làm việc ở nhà.' },
    { en: 'They are working on a new project.', vi: 'Họ đang làm một dự án mới.' },
  ],
  'walk|ving': [
    { en: 'We are walking along the river.', vi: 'Chúng tôi đang đi bộ dọc bờ sông.' },
    { en: 'The old man is walking his dog.', vi: 'Ông cụ đang dắt chó đi dạo.' },
  ],
  'watch|ving': [
    { en: 'They are watching a football match.', vi: 'Họ đang xem một trận bóng đá.' },
    { en: 'She is watching the children play.', vi: 'Cô ấy đang trông bọn trẻ chơi.' },
  ],
  'read|ving': [
    { en: 'She is reading a book in the garden.', vi: 'Cô ấy đang đọc sách trong vườn.' },
    {
      en: 'The teacher is reading a story to the class.',
      vi: 'Cô giáo đang đọc truyện cho cả lớp.',
    },
  ],
  'sit|ving': [
    { en: 'They are sitting by the window.', vi: 'Họ đang ngồi cạnh cửa sổ.' },
    { en: 'The cat is sitting on the wall.', vi: 'Con mèo đang ngồi trên tường.' },
  ],
  'swim|ving': [
    { en: 'The children are swimming in the pool.', vi: 'Bọn trẻ đang bơi trong bể.' },
    { en: 'She is swimming very fast.', vi: 'Cô ấy đang bơi rất nhanh.' },
  ],
  'eat|ving': [
    { en: 'We are eating lunch at a small shop.', vi: 'Chúng tôi đang ăn trưa ở một quán nhỏ.' },
    { en: 'The baby is eating rice porridge.', vi: 'Em bé đang ăn cháo.' },
  ],
  'drink|ving': [
    { en: 'He is drinking iced tea.', vi: 'Anh ấy đang uống trà đá.' },
    { en: 'They are drinking coffee on the balcony.', vi: 'Họ đang uống cà phê ngoài ban công.' },
  ],
  'come|ving': [
    { en: 'My friends are coming to my house tonight.', vi: 'Tối nay bạn bè đang đến nhà tôi.' },
    { en: 'A storm is coming this way.', vi: 'Một cơn bão đang kéo đến hướng này.' },
  ],
  'see|ving': [
    { en: 'I am seeing the doctor this afternoon.', vi: 'Chiều nay tôi đi khám bác sĩ.' },
    { en: 'She is seeing her old friends this week.', vi: 'Tuần này cô ấy đang gặp lại bạn cũ.' },
  ],
  'take|ving': [
    { en: 'He is taking photos of the sunset.', vi: 'Anh ấy đang chụp ảnh hoàng hôn.' },
    { en: 'We are taking a break now.', vi: 'Chúng tôi đang nghỉ giải lao.' },
  ],
  'talk|ving': [
    { en: 'They are talking about the weekend.', vi: 'Họ đang nói về cuối tuần.' },
    { en: 'The teacher is talking to the parents.', vi: 'Cô giáo đang nói chuyện với phụ huynh.' },
  ],
  'listen|ving': [
    { en: 'She is listening to music.', vi: 'Cô ấy đang nghe nhạc.' },
    { en: 'We are listening to the news.', vi: 'Chúng tôi đang nghe tin tức.' },
  ],
  'dance|ving': [
    { en: 'They are dancing at the wedding.', vi: 'Họ đang nhảy ở đám cưới.' },
    { en: 'The children are dancing to the song.', vi: 'Bọn trẻ đang nhảy theo bài hát.' },
  ],
  'sleep|ving': [
    { en: 'The baby is sleeping now.', vi: 'Em bé đang ngủ.' },
    { en: 'Be quiet — Grandpa is sleeping.', vi: 'Giữ yên lặng nào — ông đang ngủ.' },
  ],
  'drive|ving': [
    { en: 'He is driving to the airport.', vi: 'Anh ấy đang lái xe ra sân bay.' },
    { en: 'She is driving very carefully.', vi: 'Cô ấy đang lái xe rất cẩn thận.' },
  ],
  'help|ving': [
    { en: 'She is helping her mother in the kitchen.', vi: 'Cô ấy đang giúp mẹ trong bếp.' },
    { en: 'We are helping our neighbor move.', vi: 'Chúng tôi đang giúp hàng xóm chuyển nhà.' },
  ],
  'jump|ving': [
    { en: 'The dog is jumping over the fence.', vi: 'Con chó đang nhảy qua hàng rào.' },
    { en: 'The kids are jumping on the bed.', vi: 'Bọn trẻ đang nhảy trên giường.' },
  ],
  'use|ving': [
    { en: 'He is using my computer.', vi: 'Anh ấy đang dùng máy tính của tôi.' },
    { en: 'They are using a map to find the way.', vi: 'Họ đang dùng bản đồ để tìm đường.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 7) ĐỘNG TỪ THƯỜNG A1–B2 — quá khứ đơn (V-ed)
  // ══════════════════════════════════════════════════════════════════════════
  'study|past': [
    { en: 'She studied hard for the test.', vi: 'Cô ấy học chăm chỉ cho bài kiểm tra.' },
    { en: 'I studied French in high school.', vi: 'Tôi học tiếng Pháp hồi cấp ba.' },
  ],
  'work|past': [
    { en: 'She worked in a bank for five years.', vi: 'Cô ấy làm ở ngân hàng năm năm.' },
    { en: 'We worked late last night.', vi: 'Tối qua chúng tôi làm việc muộn.' },
  ],
  'watch|past': [
    { en: 'We watched a movie last night.', vi: 'Tối qua chúng tôi xem phim.' },
    { en: 'He watched the sunset from the beach.', vi: 'Anh ấy ngắm hoàng hôn từ bãi biển.' },
  ],
  'stop|past': [
    { en: 'The bus stopped in front of the school.', vi: 'Xe buýt dừng trước cổng trường.' },
    { en: 'It suddenly stopped raining.', vi: 'Trời bỗng ngừng mưa.' },
  ],
  'try|past': [
    { en: 'I tried the new noodle shop yesterday.', vi: 'Hôm qua tôi thử quán bún mới.' },
    { en: 'She tried her best to help us.', vi: 'Cô ấy đã cố hết sức để giúp chúng tôi.' },
  ],
  'carry|past': [
    { en: 'He carried the heavy box upstairs.', vi: 'Anh ấy khiêng cái hộp nặng lên gác.' },
    { en: 'She carried her baby all day.', vi: 'Cô ấy bế con cả ngày.' },
  ],
  'travel|past': [
    { en: 'We traveled around Vietnam last year.', vi: 'Năm ngoái chúng tôi đi khắp Việt Nam.' },
    { en: 'They traveled by train to Hue.', vi: 'Họ đi tàu ra Huế.' },
  ],
  'walk|past': [
    { en: 'We walked to school together.', vi: 'Chúng tôi cùng đi bộ đến trường.' },
    { en: 'She walked along the beach at sunset.', vi: 'Cô ấy đi dạo dọc bãi biển lúc hoàng hôn.' },
  ],
  'talk|past': [
    { en: 'We talked for hours last night.', vi: 'Tối qua chúng tôi nói chuyện hàng giờ.' },
    { en: 'She talked to her boss about the plan.', vi: 'Cô ấy nói với sếp về kế hoạch.' },
  ],
  'want|past': [
    { en: 'I wanted to go, but it rained.', vi: 'Tôi muốn đi, nhưng trời mưa.' },
    { en: 'She wanted a cup of tea.', vi: 'Cô ấy muốn một tách trà.' },
  ],
  'need|past': [
    { en: 'We needed more time to finish.', vi: 'Chúng tôi cần thêm thời gian để hoàn thành.' },
    { en: 'He needed help with his homework.', vi: 'Anh ấy cần giúp đỡ với bài tập.' },
  ],
  'like|past': [
    { en: 'I liked the food at that restaurant.', vi: 'Tôi thích đồ ăn ở nhà hàng đó.' },
    { en: 'She liked the gift very much.', vi: 'Cô ấy rất thích món quà.' },
  ],
  'love|past': [
    { en: 'We loved our trip to Hoi An.', vi: 'Chúng tôi rất thích chuyến đi Hội An.' },
    { en: 'She loved that song when she was young.', vi: 'Cô ấy yêu bài hát đó khi còn trẻ.' },
  ],
  'live|past': [
    { en: 'They lived in Hanoi for ten years.', vi: 'Họ sống ở Hà Nội mười năm.' },
    { en: 'My grandmother lived in a small village.', vi: 'Bà tôi sống ở một ngôi làng nhỏ.' },
  ],
  'close|past': [
    { en: 'The shop closed at nine last night.', vi: 'Cửa hàng đóng cửa lúc chín giờ tối qua.' },
    { en: 'She closed the window because of the noise.', vi: 'Cô ấy đóng cửa sổ vì tiếng ồn.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 8) NGÔI 3 SỐ ÍT (V-s) hay gặp — hiện tại đơn
  // ══════════════════════════════════════════════════════════════════════════
  'go|v3s': [
    { en: 'She goes to school by bike.', vi: 'Cô ấy đi học bằng xe đạp.' },
    { en: 'He goes to the gym every morning.', vi: 'Anh ấy đến phòng gym mỗi sáng.' },
  ],
  'do|v3s': [
    { en: 'He does his homework after dinner.', vi: 'Anh ấy làm bài tập sau bữa tối.' },
    { en: 'She does yoga every day.', vi: 'Cô ấy tập yoga mỗi ngày.' },
  ],
  'have|v3s': [
    { en: 'My sister has a small dog.', vi: 'Chị tôi có một con chó nhỏ.' },
    { en: 'He has breakfast at seven.', vi: 'Anh ấy ăn sáng lúc bảy giờ.' },
  ],
  'watch|v3s': [
    { en: 'She watches the news every evening.', vi: 'Cô ấy xem tin tức mỗi tối.' },
    { en: 'My father watches football on weekends.', vi: 'Bố tôi xem bóng đá vào cuối tuần.' },
  ],
  'study|v3s': [
    { en: 'He studies English every night.', vi: 'Anh ấy học tiếng Anh mỗi tối.' },
    { en: 'She studies at the library.', vi: 'Cô ấy học ở thư viện.' },
  ],
  'teach|v3s': [
    { en: 'She teaches math at a high school.', vi: 'Cô ấy dạy toán ở một trường cấp ba.' },
    { en: 'He teaches us how to cook.', vi: 'Anh ấy dạy chúng tôi nấu ăn.' },
  ],
  'fly|v3s': [
    { en: 'A bird flies over the house.', vi: 'Một con chim bay qua ngôi nhà.' },
    { en: 'Time flies when you are busy.', vi: 'Thời gian trôi nhanh khi bạn bận rộn.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 9) DANH TỪ SỐ NHIỀU THƯỜNG A1–B2 (đổi chính tả đáng chú ý: -ies, -es)
  // ══════════════════════════════════════════════════════════════════════════
  'baby|plural': [
    { en: 'The babies are sleeping now.', vi: 'Các em bé đang ngủ.' },
    {
      en: 'Two babies were born in our building.',
      vi: 'Hai em bé được sinh ra trong tòa nhà của chúng tôi.',
    },
  ],
  'city|plural': [
    {
      en: 'We visited three cities in one week.',
      vi: 'Chúng tôi thăm ba thành phố trong một tuần.',
    },
    { en: 'Big cities are often crowded.', vi: 'Các thành phố lớn thường đông đúc.' },
  ],
  'country|plural': [
    { en: 'She has traveled to many countries.', vi: 'Cô ấy đã đi nhiều nước.' },
    { en: 'These two countries share a border.', vi: 'Hai nước này có chung biên giới.' },
  ],
  'story|plural': [
    { en: 'Grandma told us old stories.', vi: 'Bà kể cho chúng tôi những câu chuyện xưa.' },
    { en: 'I love reading short stories.', vi: 'Tôi thích đọc truyện ngắn.' },
  ],
  'family|plural': [
    { en: 'Many families live in this village.', vi: 'Nhiều gia đình sống trong ngôi làng này.' },
    { en: 'Both families came to the wedding.', vi: 'Cả hai gia đình đều đến đám cưới.' },
  ],
  'party|plural': [
    {
      en: 'We went to two parties last weekend.',
      vi: 'Cuối tuần trước chúng tôi đi hai bữa tiệc.',
    },
    { en: 'Birthday parties are fun for kids.', vi: 'Tiệc sinh nhật rất vui với trẻ con.' },
  ],
  'library|plural': [
    { en: 'The city has several public libraries.', vi: 'Thành phố có vài thư viện công cộng.' },
    { en: 'Libraries are quiet places to study.', vi: 'Thư viện là nơi yên tĩnh để học.' },
  ],
  'box|plural': [
    { en: 'The boxes are too heavy to lift.', vi: 'Mấy cái hộp nặng quá không nhấc nổi.' },
    { en: 'We packed everything into three boxes.', vi: 'Chúng tôi xếp mọi thứ vào ba cái hộp.' },
  ],
  'dish|plural': [
    { en: 'Please wash the dishes after dinner.', vi: 'Hãy rửa bát sau bữa tối.' },
    {
      en: 'The restaurant serves many local dishes.',
      vi: 'Nhà hàng phục vụ nhiều món ăn địa phương.',
    },
  ],
  'class|plural': [
    { en: 'She teaches three classes a day.', vi: 'Cô ấy dạy ba lớp một ngày.' },
    { en: 'The classes start at eight.', vi: 'Các lớp học bắt đầu lúc tám giờ.' },
  ],
  'bus|plural': [
    { en: 'The buses are always full at rush hour.', vi: 'Xe buýt luôn đông vào giờ cao điểm.' },
    { en: 'Two buses go to the city center.', vi: 'Có hai tuyến xe buýt đi vào trung tâm.' },
  ],
  'church|plural': [
    { en: 'There are old churches in the town.', vi: 'Trong thị trấn có những nhà thờ cổ.' },
    { en: 'The churches are full on Sundays.', vi: 'Các nhà thờ đông kín vào Chủ nhật.' },
  ],
  'potato|plural': [
    { en: 'We bought a kilo of potatoes.', vi: 'Chúng tôi mua một cân khoai tây.' },
    { en: 'She fried the potatoes for lunch.', vi: 'Cô ấy chiên khoai tây cho bữa trưa.' },
  ],
  'tomato|plural': [
    { en: 'The tomatoes are ripe and red.', vi: 'Những quả cà chua chín đỏ.' },
    { en: 'Add two tomatoes to the soup.', vi: 'Cho hai quả cà chua vào canh.' },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // 10) DANH TỪ SỐ NHIỀU THƯỜNG A1–B2 (thêm -s đơn giản, từ rất hay gặp)
  // ══════════════════════════════════════════════════════════════════════════
  'apple|plural': [
    { en: 'I bought six apples at the market.', vi: 'Tôi mua sáu quả táo ở chợ.' },
    { en: 'These apples are sweet and fresh.', vi: 'Những quả táo này ngọt và tươi.' },
  ],
  'book|plural': [
    { en: 'She has many books on her shelf.', vi: 'Cô ấy có nhiều sách trên giá.' },
    { en: 'I borrowed two books from the library.', vi: 'Tôi mượn hai cuốn sách từ thư viện.' },
  ],
  'car|plural': [
    { en: 'There are too many cars on this road.', vi: 'Có quá nhiều ô tô trên con đường này.' },
    { en: 'Electric cars are quieter than old ones.', vi: 'Xe điện chạy êm hơn xe cũ.' },
  ],
  'house|plural': [
    { en: 'The houses near the river are beautiful.', vi: 'Những ngôi nhà gần sông rất đẹp.' },
    { en: 'New houses are being built here.', vi: 'Nhiều ngôi nhà mới đang được xây ở đây.' },
  ],
  'friend|plural': [
    { en: 'I met my friends at the café.', vi: 'Tôi gặp bạn bè ở quán cà phê.' },
    { en: 'She has friends in many countries.', vi: 'Cô ấy có bạn ở nhiều nước.' },
  ],
  'teacher|plural': [
    {
      en: 'The teachers are very kind at this school.',
      vi: 'Các thầy cô ở trường này rất tốt bụng.',
    },
    { en: 'Good teachers make learning fun.', vi: 'Thầy cô giỏi làm việc học trở nên thú vị.' },
  ],
  'student|plural': [
    { en: 'The students are doing a group project.', vi: 'Học sinh đang làm dự án nhóm.' },
    { en: 'Many students ride bikes to school.', vi: 'Nhiều học sinh đạp xe đến trường.' },
  ],
  'dog|plural': [
    { en: 'The dogs are playing in the yard.', vi: 'Mấy con chó đang chơi ngoài sân.' },
    { en: 'Two dogs were barking loudly.', vi: 'Hai con chó đang sủa to.' },
  ],
  'cat|plural': [
    { en: 'The cats are sleeping on the sofa.', vi: 'Mấy con mèo đang ngủ trên ghế sofa.' },
    { en: 'She feeds the stray cats every morning.', vi: 'Cô ấy cho mèo hoang ăn mỗi sáng.' },
  ],
  'table|plural': [
    { en: 'The tables are set for dinner.', vi: 'Các bàn đã được dọn cho bữa tối.' },
    { en: 'They moved the tables outside.', vi: 'Họ chuyển mấy cái bàn ra ngoài.' },
  ],
  'chair|plural': [
    { en: 'We need more chairs for the guests.', vi: 'Chúng ta cần thêm ghế cho khách.' },
    { en: 'The chairs are made of wood.', vi: 'Những chiếc ghế được làm bằng gỗ.' },
  ],
  'phone|plural': [
    { en: 'Modern phones have great cameras.', vi: 'Điện thoại hiện đại có camera rất tốt.' },
    { en: 'Please turn off your phones in class.', vi: 'Hãy tắt điện thoại trong giờ học.' },
  ],
  'door|plural': [
    { en: 'Please close the doors when you leave.', vi: 'Hãy đóng các cửa khi rời đi.' },
    { en: 'The doors are painted green.', vi: 'Những cánh cửa được sơn màu xanh.' },
  ],
  'window|plural': [
    { en: 'Open the windows to let in fresh air.', vi: 'Mở cửa sổ cho không khí trong lành vào.' },
    { en: 'The windows face the sea.', vi: 'Những ô cửa sổ hướng ra biển.' },
  ],
  'tree|plural': [
    { en: 'The trees give us cool shade.', vi: 'Những hàng cây cho chúng ta bóng mát.' },
    { en: 'They planted young trees along the street.', vi: 'Họ trồng cây non dọc con phố.' },
  ],
  'flower|plural': [
    { en: 'She bought fresh flowers for the table.', vi: 'Cô ấy mua hoa tươi để bày bàn.' },
    { en: 'The flowers bloom in spring.', vi: 'Hoa nở vào mùa xuân.' },
  ],
  'bird|plural': [
    { en: 'The birds sing early in the morning.', vi: 'Chim hót vào sáng sớm.' },
    {
      en: 'Many birds fly south in winter.',
      vi: 'Nhiều loài chim bay về phương nam vào mùa đông.',
    },
  ],
  'egg|plural': [
    { en: 'I need three eggs for this cake.', vi: 'Tôi cần ba quả trứng cho cái bánh này.' },
    { en: 'The eggs are in the fridge.', vi: 'Trứng ở trong tủ lạnh.' },
  ],
  'banana|plural': [
    { en: 'Monkeys love eating bananas.', vi: 'Khỉ thích ăn chuối.' },
    { en: 'These bananas are not ripe yet.', vi: 'Mấy quả chuối này chưa chín.' },
  ],
  'pen|plural': [
    { en: 'She keeps her pens in a cup.', vi: 'Cô ấy để bút trong một cái cốc.' },
    { en: 'These pens write very smoothly.', vi: 'Những cây bút này viết rất trơn.' },
  ],
  'bag|plural': [
    { en: 'The bags are heavy after shopping.', vi: 'Mấy cái túi nặng sau khi mua sắm.' },
    { en: 'She packed two bags for the trip.', vi: 'Cô ấy xếp hai túi hành lý cho chuyến đi.' },
  ],
  'shoe|plural': [
    { en: 'Please take off your shoes at the door.', vi: 'Hãy cởi giày ở cửa.' },
    { en: 'These shoes are too small for me.', vi: 'Đôi giày này quá nhỏ với tôi.' },
  ],
  'ticket|plural': [
    { en: 'I bought two tickets for the show.', vi: 'Tôi mua hai vé xem chương trình.' },
    { en: 'The tickets are sold out.', vi: 'Vé đã bán hết.' },
  ],
  'key|plural': [
    { en: 'I always lose my keys.', vi: 'Tôi luôn làm mất chìa khóa.' },
    { en: 'The keys are on the table.', vi: 'Chìa khóa ở trên bàn.' },
  ],
  'star|plural': [
    { en: 'The stars are bright tonight.', vi: 'Đêm nay các vì sao rất sáng.' },
    { en: 'We counted the stars in the sky.', vi: 'Chúng tôi đếm sao trên trời.' },
  ],
  'day|plural': [
    { en: 'The days are longer in summer.', vi: 'Ngày dài hơn vào mùa hè.' },
    { en: 'We spent three days in Sapa.', vi: 'Chúng tôi ở Sapa ba ngày.' },
  ],
  'boy|plural': [
    { en: 'The boys are playing football outside.', vi: 'Mấy cậu bé đang chơi bóng đá bên ngoài.' },
    { en: 'Two boys helped the old lady.', vi: 'Hai cậu bé giúp bà cụ.' },
  ],
  'girl|plural': [
    { en: 'The girls are singing on the stage.', vi: 'Các cô bé đang hát trên sân khấu.' },
    { en: 'Three girls joined the dance class.', vi: 'Ba cô bé tham gia lớp học nhảy.' },
  ],
}
