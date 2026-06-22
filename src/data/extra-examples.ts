// 2 ví dụ bổ sung cho mỗi từ có hình minh hoạ SVG
// Hiển thị trong ô "Ví dụ thêm" bên dưới SVG trong thẻ từ điển

export interface ExPair { en: string; vi: string }

export const EXTRA_EXAMPLES: Record<string, [ExPair, ExPair]> = {
  // ── Màu sắc ──────────────────────────────────────────────────
  red: [
    { en: 'She wore a red dress to the party.', vi: 'Cô ấy mặc váy đỏ đến bữa tiệc.' },
    { en: 'The red light means stop.', vi: 'Đèn đỏ có nghĩa là dừng lại.' },
  ],
  orange: [
    { en: 'He painted the wall orange.', vi: 'Anh ấy sơn bức tường màu cam.' },
    { en: 'Orange is a warm colour.', vi: 'Cam là màu ấm.' },
  ],
  yellow: [
    { en: 'The sunflowers are bright yellow.', vi: 'Những bông hướng dương vàng rực rỡ.' },
    { en: 'She highlighted the sentence in yellow.', vi: 'Cô ấy tô vàng câu đó.' },
  ],
  green: [
    { en: 'The grass looks greener after the rain.', vi: 'Cỏ trông xanh hơn sau cơn mưa.' },
    { en: 'Eat more green vegetables every day.', vi: 'Ăn nhiều rau xanh hơn mỗi ngày.' },
  ],
  blue: [
    { en: 'The sky is bright blue today.', vi: 'Bầu trời hôm nay xanh trong vắt.' },
    { en: 'He wore a blue tie to the meeting.', vi: 'Anh ấy đeo cà vạt xanh dự họp.' },
  ],
  purple: [
    { en: 'Purple grapes grow in the vineyard.', vi: 'Nho tím mọc trong vườn nho.' },
    { en: 'The queen wore a purple robe.', vi: 'Nữ hoàng mặc áo choàng tím.' },
  ],
  violet: [
    { en: 'Violet is the last colour of the rainbow.', vi: 'Tím là màu cuối cùng của cầu vồng.' },
    { en: 'She chose violet curtains for the bedroom.', vi: 'Cô ấy chọn rèm tím cho phòng ngủ.' },
  ],
  pink: [
    { en: 'The baby wore a pink hat.', vi: 'Em bé đội mũ hồng.' },
    { en: 'Pink roses are very popular.', vi: 'Hoa hồng hồng rất phổ biến.' },
  ],
  brown: [
    { en: 'The dog has a brown coat.', vi: 'Con chó có bộ lông màu nâu.' },
    { en: 'She drank brown rice tea.', vi: 'Cô ấy uống trà gạo lứt.' },
  ],
  black: [
    { en: 'He always wears black shoes.', vi: 'Anh ấy luôn mang giày đen.' },
    { en: 'The night sky is black and full of stars.', vi: 'Bầu trời đêm tối đen và đầy sao.' },
  ],
  white: [
    { en: 'She painted the fence white.', vi: 'Cô ấy sơn hàng rào màu trắng.' },
    { en: 'Fresh snow is always white.', vi: 'Tuyết mới rơi luôn trắng tinh.' },
  ],
  gray: [
    { en: 'The old building has gray walls.', vi: 'Toà nhà cũ có bức tường xám.' },
    { en: 'It was a cold, gray morning.', vi: 'Đó là một buổi sáng lạnh và u ám.' },
  ],
  grey: [
    { en: 'His hair turned grey after fifty.', vi: 'Tóc ông ấy bạc dần sau tuổi năm mươi.' },
    { en: 'The cat has a grey and white coat.', vi: 'Con mèo có bộ lông xám trắng.' },
  ],
  cyan: [
    { en: 'The tropical sea was a beautiful cyan.', vi: 'Biển nhiệt đới xanh lam tuyệt đẹp.' },
    { en: 'She chose cyan for the website theme.', vi: 'Cô ấy chọn màu xanh lam cho giao diện website.' },
  ],

  // ── Số ───────────────────────────────────────────────────────
  zero: [
    { en: 'The temperature dropped to zero last night.', vi: 'Nhiệt độ giảm xuống không độ tối qua.' },
    { en: 'Start counting from zero.', vi: 'Bắt đầu đếm từ không.' },
  ],
  one: [
    { en: 'I have one brother.', vi: 'Tôi có một người anh trai.' },
    { en: 'One step at a time.', vi: 'Từng bước một.' },
  ],
  two: [
    { en: 'She has two cats at home.', vi: 'Cô ấy có hai con mèo ở nhà.' },
    { en: 'It takes two people to carry this box.', vi: 'Cần hai người mới khiêng được hộp này.' },
  ],
  three: [
    { en: 'We waited for three hours.', vi: 'Chúng tôi đợi ba tiếng đồng hồ.' },
    { en: 'She speaks three languages.', vi: 'Cô ấy nói được ba thứ tiếng.' },
  ],
  four: [
    { en: 'A table usually has four legs.', vi: 'Cái bàn thường có bốn chân.' },
    { en: 'The store opens at four o\'clock.', vi: 'Cửa hàng mở cửa lúc bốn giờ.' },
  ],
  five: [
    { en: 'There are five fingers on each hand.', vi: 'Mỗi bàn tay có năm ngón.' },
    { en: 'The meeting starts in five minutes.', vi: 'Cuộc họp bắt đầu sau năm phút nữa.' },
  ],
  six: [
    { en: 'Six students passed the exam.', vi: 'Sáu học sinh vượt qua kỳ thi.' },
    { en: 'We need six eggs for this cake.', vi: 'Chúng ta cần sáu quả trứng cho chiếc bánh này.' },
  ],
  seven: [
    { en: 'There are seven days in a week.', vi: 'Một tuần có bảy ngày.' },
    { en: 'She woke up at seven in the morning.', vi: 'Cô ấy dậy lúc bảy giờ sáng.' },
  ],
  eight: [
    { en: 'The spider has eight legs.', vi: 'Con nhện có tám chân.' },
    { en: 'He sleeps eight hours a night.', vi: 'Anh ấy ngủ tám tiếng mỗi đêm.' },
  ],
  nine: [
    { en: 'The office closes at nine p.m.', vi: 'Văn phòng đóng cửa lúc chín giờ tối.' },
    { en: 'A cat is said to have nine lives.', vi: 'Người ta nói mèo có chín mạng.' },
  ],
  ten: [
    { en: 'Count from one to ten.', vi: 'Đếm từ một đến mười.' },
    { en: 'She scored ten out of ten.', vi: 'Cô ấy đạt mười trên mười điểm.' },
  ],
  eleven: [
    { en: 'The train leaves at eleven thirty.', vi: 'Tàu khởi hành lúc mười một giờ rưỡi.' },
    { en: 'There are eleven players in a football team.', vi: 'Đội bóng đá có mười một cầu thủ.' },
  ],
  twelve: [
    { en: 'Midnight is twelve o\'clock at night.', vi: 'Nửa đêm là mười hai giờ đêm.' },
    { en: 'A year has twelve months.', vi: 'Một năm có mười hai tháng.' },
  ],
  twenty: [
    { en: 'She saved twenty dollars this week.', vi: 'Cô ấy tiết kiệm được hai mươi đô la tuần này.' },
    { en: 'Twenty students are in the class.', vi: 'Lớp học có hai mươi học sinh.' },
  ],
  hundred: [
    { en: 'A hundred people attended the event.', vi: 'Một trăm người tham dự sự kiện.' },
    { en: 'He ran a hundred metres in twelve seconds.', vi: 'Anh ấy chạy một trăm mét trong mười hai giây.' },
  ],
  thousand: [
    { en: 'Over a thousand fans waited outside.', vi: 'Hơn một nghìn người hâm mộ đợi bên ngoài.' },
    { en: 'The city has a thousand years of history.', vi: 'Thành phố có lịch sử nghìn năm.' },
  ],

  // ── Hình học ──────────────────────────────────────────────────
  circle: [
    { en: 'Draw a circle with a compass.', vi: 'Vẽ hình tròn bằng compa.' },
    { en: 'The children sat in a circle.', vi: 'Các em ngồi thành vòng tròn.' },
  ],
  square: [
    { en: 'A square has four equal sides.', vi: 'Hình vuông có bốn cạnh bằng nhau.' },
    { en: 'The park is built in a square shape.', vi: 'Công viên được xây dựng theo hình vuông.' },
  ],
  triangle: [
    { en: 'A triangle has three sides.', vi: 'Hình tam giác có ba cạnh.' },
    { en: 'The roof of the house is triangle-shaped.', vi: 'Mái nhà có hình tam giác.' },
  ],
  rectangle: [
    { en: 'A football pitch is a rectangle.', vi: 'Sân bóng đá là một hình chữ nhật.' },
    { en: 'The TV screen has a rectangular shape.', vi: 'Màn hình TV có hình chữ nhật.' },
  ],
  star: [
    { en: 'She drew a five-pointed star.', vi: 'Cô ấy vẽ một ngôi sao năm cánh.' },
    { en: 'Stars shine brightly in the clear sky.', vi: 'Những ngôi sao lấp lánh trên bầu trời quang đãng.' },
  ],
  heart: [
    { en: 'She drew a heart on the card.', vi: 'Cô ấy vẽ hình trái tim lên tấm thiệp.' },
    { en: 'The heart symbol means love.', vi: 'Hình trái tim tượng trưng cho tình yêu.' },
  ],
  diamond: [
    { en: 'A diamond shape is like a square turned sideways.', vi: 'Hình thoi giống như hình vuông xoay nghiêng.' },
    { en: 'The kite has a diamond shape.', vi: 'Cánh diều có hình thoi.' },
  ],

  // ── Thời tiết ──────────────────────────────────────────────────
  sun: [
    { en: 'The sun rises in the east.', vi: 'Mặt trời mọc ở phía đông.' },
    { en: 'Don\'t look directly at the sun.', vi: 'Đừng nhìn thẳng vào mặt trời.' },
  ],
  moon: [
    { en: 'The moon is bright tonight.', vi: 'Trăng sáng đêm nay.' },
    { en: 'The moon goes around the Earth.', vi: 'Mặt trăng quay quanh Trái Đất.' },
  ],
  cloud: [
    { en: 'Dark clouds mean rain is coming.', vi: 'Mây đen báo hiệu mưa sắp đến.' },
    { en: 'White clouds floated across the blue sky.', vi: 'Những đám mây trắng trôi qua bầu trời xanh.' },
  ],
  rain: [
    { en: 'Don\'t forget your umbrella; it might rain.', vi: 'Đừng quên ô; trời có thể mưa.' },
    { en: 'The rain cooled the air.', vi: 'Cơn mưa làm không khí mát mẻ hơn.' },
  ],
  wind: [
    { en: 'A strong wind blew my hat off.', vi: 'Gió mạnh thổi bay chiếc mũ của tôi.' },
    { en: 'The wind turbines generate electricity.', vi: 'Tua bin gió tạo ra điện.' },
  ],
  snow: [
    { en: 'Children love to play in the snow.', vi: 'Trẻ em thích chơi trong tuyết.' },
    { en: 'The mountain peaks are covered with snow.', vi: 'Các đỉnh núi phủ đầy tuyết.' },
  ],
  thunder: [
    { en: 'I heard loud thunder during the storm.', vi: 'Tôi nghe thấy tiếng sấm lớn trong cơn bão.' },
    { en: 'Thunder usually follows lightning.', vi: 'Sấm thường đến sau sét.' },
  ],

  // ── Thực vật / thiên nhiên ─────────────────────────────────────
  tree: [
    { en: 'We planted a tree in the garden.', vi: 'Chúng tôi trồng một cái cây trong vườn.' },
    { en: 'The oak tree is hundreds of years old.', vi: 'Cây sồi này đã mấy trăm tuổi.' },
  ],
  flower: [
    { en: 'She gave him a bunch of flowers.', vi: 'Cô ấy tặng anh ấy một bó hoa.' },
    { en: 'Flowers bloom in spring.', vi: 'Hoa nở vào mùa xuân.' },
  ],
  mountain: [
    { en: 'We hiked up the mountain last weekend.', vi: 'Chúng tôi leo núi cuối tuần trước.' },
    { en: 'The mountain is covered in snow all year.', vi: 'Ngọn núi phủ tuyết quanh năm.' },
  ],
  sea: [
    { en: 'We swam in the sea every morning.', vi: 'Chúng tôi bơi biển mỗi buổi sáng.' },
    { en: 'The sea is calm today.', vi: 'Biển hôm nay yên lặng.' },
  ],
  river: [
    { en: 'The Mekong River runs through Vietnam.', vi: 'Sông Mê Kông chảy qua Việt Nam.' },
    { en: 'Children caught fish in the river.', vi: 'Bọn trẻ bắt cá trên sông.' },
  ],

  // ── Động vật ───────────────────────────────────────────────────
  cat: [
    { en: 'The cat sleeps on the sofa all day.', vi: 'Con mèo ngủ trên ghế sofa cả ngày.' },
    { en: 'Our cat loves chasing mice.', vi: 'Con mèo nhà chúng tôi thích đuổi chuột.' },
  ],
  dog: [
    { en: 'The dog wags its tail when happy.', vi: 'Con chó vẫy đuôi khi vui.' },
    { en: 'She walks her dog every evening.', vi: 'Cô ấy dắt chó đi dạo mỗi buổi tối.' },
  ],
  bird: [
    { en: 'The bird built a nest in the tree.', vi: 'Con chim làm tổ trên cây.' },
    { en: 'Birds fly south for the winter.', vi: 'Chim di cư về phương nam vào mùa đông.' },
  ],
  fish: [
    { en: 'He caught three fish in the river.', vi: 'Anh ấy bắt được ba con cá trên sông.' },
    { en: 'Fish are a healthy source of protein.', vi: 'Cá là nguồn protein tốt cho sức khoẻ.' },
  ],
  rabbit: [
    { en: 'The rabbit hopped across the garden.', vi: 'Con thỏ nhảy qua khu vườn.' },
    { en: 'My daughter keeps a white rabbit as a pet.', vi: 'Con gái tôi nuôi một con thỏ trắng làm thú cưng.' },
  ],
  elephant: [
    { en: 'Elephants use their trunks to drink water.', vi: 'Voi dùng vòi để uống nước.' },
    { en: 'The elephant is the largest land animal.', vi: 'Voi là động vật trên cạn lớn nhất.' },
  ],
  horse: [
    { en: 'She learned to ride a horse at age ten.', vi: 'Cô ấy học cưỡi ngựa từ năm mười tuổi.' },
    { en: 'Horses can run very fast.', vi: 'Ngựa có thể chạy rất nhanh.' },
  ],

  // ── Thực phẩm ─────────────────────────────────────────────────
  apple: [
    { en: 'An apple a day keeps the doctor away.', vi: 'Một quả táo mỗi ngày giúp bạn ít gặp bác sĩ hơn.' },
    { en: 'She made apple juice for breakfast.', vi: 'Cô ấy làm nước táo cho bữa sáng.' },
  ],
  banana: [
    { en: 'Monkeys love eating bananas.', vi: 'Khỉ rất thích ăn chuối.' },
    { en: 'Add a banana to your smoothie for extra sweetness.', vi: 'Thêm một quả chuối vào sinh tố cho ngọt hơn.' },
  ],
  egg: [
    { en: 'I eat a boiled egg every morning.', vi: 'Tôi ăn một quả trứng luộc mỗi sáng.' },
    { en: 'You need two eggs to make this omelette.', vi: 'Bạn cần hai quả trứng để làm trứng cuộn này.' },
  ],
  bread: [
    { en: 'He bought a loaf of bread from the bakery.', vi: 'Anh ấy mua một ổ bánh mì từ tiệm bánh.' },
    { en: 'Vietnamese people often eat bread for breakfast.', vi: 'Người Việt thường ăn bánh mì vào buổi sáng.' },
  ],
  milk: [
    { en: 'The baby drinks warm milk before bed.', vi: 'Em bé uống sữa ấm trước khi ngủ.' },
    { en: 'Milk is rich in calcium.', vi: 'Sữa giàu canxi.' },
  ],
  water: [
    { en: 'Drink at least eight glasses of water a day.', vi: 'Uống ít nhất tám ly nước mỗi ngày.' },
    { en: 'Water is essential for life.', vi: 'Nước là cần thiết cho sự sống.' },
  ],
  coffee: [
    { en: 'He drinks two cups of coffee every morning.', vi: 'Anh ấy uống hai tách cà phê mỗi sáng.' },
    { en: 'Vietnamese iced coffee is very strong.', vi: 'Cà phê đá Việt Nam rất đậm.' },
  ],
  rice: [
    { en: 'Vietnamese people eat rice three times a day.', vi: 'Người Việt ăn cơm ba bữa một ngày.' },
    { en: 'She cooked rice in a rice cooker.', vi: 'Cô ấy nấu cơm bằng nồi cơm điện.' },
  ],

  // ── Đồ vật ────────────────────────────────────────────────────
  house: [
    { en: 'They bought a house in the suburbs.', vi: 'Họ mua nhà ở ngoại ô.' },
    { en: 'Our house has three bedrooms.', vi: 'Nhà chúng tôi có ba phòng ngủ.' },
  ],
  car: [
    { en: 'He washes his car every Sunday.', vi: 'Anh ấy rửa xe mỗi chủ nhật.' },
    { en: 'Electric cars are becoming more popular.', vi: 'Xe điện ngày càng phổ biến hơn.' },
  ],
  book: [
    { en: 'I read a book before going to sleep.', vi: 'Tôi đọc sách trước khi ngủ.' },
    { en: 'The library has thousands of books.', vi: 'Thư viện có hàng nghìn cuốn sách.' },
  ],
  phone: [
    { en: 'She forgot her phone at home.', vi: 'Cô ấy để quên điện thoại ở nhà.' },
    { en: 'His phone battery died during the meeting.', vi: 'Pin điện thoại của anh ấy hết giữa cuộc họp.' },
  ],
  computer: [
    { en: 'He works on his computer all day.', vi: 'Anh ấy làm việc trên máy tính cả ngày.' },
    { en: 'The school gave every student a computer.', vi: 'Trường cấp máy tính cho mỗi học sinh.' },
  ],
  table: [
    { en: 'Set the table before dinner.', vi: 'Bày bàn trước bữa tối.' },
    { en: 'The books are on the table.', vi: 'Sách ở trên bàn.' },
  ],
  chair: [
    { en: 'Please pull up a chair and sit down.', vi: 'Hãy kéo ghế và ngồi xuống.' },
    { en: 'The office chair is adjustable.', vi: 'Ghế văn phòng có thể điều chỉnh được.' },
  ],
  bed: [
    { en: 'She made the bed after waking up.', vi: 'Cô ấy dọn giường sau khi thức dậy.' },
    { en: 'The hotel bed was very comfortable.', vi: 'Cái giường trong khách sạn rất thoải mái.' },
  ],
  pencil: [
    { en: 'Write your name in pencil first.', vi: 'Viết tên bằng bút chì trước.' },
    { en: 'He sharpened his pencil before drawing.', vi: 'Anh ấy gọt bút chì trước khi vẽ.' },
  ],
  clock: [
    { en: 'The clock on the wall shows three o\'clock.', vi: 'Đồng hồ trên tường chỉ ba giờ.' },
    { en: 'My alarm clock woke me up at six.', vi: 'Đồng hồ báo thức đánh thức tôi lúc sáu giờ.' },
  ],

  // ── Cơ thể người ──────────────────────────────────────────────
  eye: [
    { en: 'She has beautiful green eyes.', vi: 'Cô ấy có đôi mắt xanh đẹp.' },
    { en: 'Keep an eye on the children.', vi: 'Để mắt trông chừng bọn trẻ.' },
  ],
  nose: [
    { en: 'He blew his nose into a tissue.', vi: 'Anh ấy xì mũi vào khăn giấy.' },
    { en: 'The dog has a very sensitive nose.', vi: 'Con chó có chiếc mũi rất thính.' },
  ],
  mouth: [
    { en: 'Don\'t talk with your mouth full.', vi: 'Đừng nói chuyện khi miệng đang đầy thức ăn.' },
    { en: 'She opened her mouth to sing.', vi: 'Cô ấy há miệng hát.' },
  ],
  hand: [
    { en: 'Wash your hands before eating.', vi: 'Rửa tay trước khi ăn.' },
    { en: 'He offered his hand for a handshake.', vi: 'Anh ấy chìa tay ra để bắt tay.' },
  ],
  foot: [
    { en: 'My foot hurts after walking all day.', vi: 'Chân tôi đau sau khi đi bộ cả ngày.' },
    { en: 'She dipped her foot into the water.', vi: 'Cô ấy nhúng chân vào nước.' },
  ],
  head: [
    { en: 'He nodded his head to show agreement.', vi: 'Anh ấy gật đầu để tỏ ý đồng ý.' },
    { en: 'She put on a hat to protect her head from the sun.', vi: 'Cô ấy đội mũ để che nắng cho đầu.' },
  ],

  // ── Giao thông ────────────────────────────────────────────────
  bicycle: [
    { en: 'He rides his bicycle to work every day.', vi: 'Anh ấy đạp xe đến chỗ làm mỗi ngày.' },
    { en: 'Riding a bicycle is good exercise.', vi: 'Đạp xe là bài tập tốt.' },
  ],
  airplane: [
    { en: 'The airplane landed safely at the airport.', vi: 'Máy bay hạ cánh an toàn tại sân bay.' },
    { en: 'How long is the airplane ride from Hanoi to Ho Chi Minh City?', vi: 'Chuyến bay từ Hà Nội vào Thành phố Hồ Chí Minh mất bao lâu?' },
  ],
  ship: [
    { en: 'The ship sailed across the Pacific Ocean.', vi: 'Con tàu đi qua Thái Bình Dương.' },
    { en: 'Goods are transported by ship.', vi: 'Hàng hoá được vận chuyển bằng tàu biển.' },
  ],

  // ── Khác ──────────────────────────────────────────────────────
  fire: [
    { en: 'Don\'t play with fire.', vi: 'Đừng nghịch lửa.' },
    { en: 'The campfire kept us warm at night.', vi: 'Đống lửa trại giữ ấm cho chúng tôi về đêm.' },
  ],
  music: [
    { en: 'She listens to music while studying.', vi: 'Cô ấy nghe nhạc trong khi học bài.' },
    { en: 'Music can improve your mood.', vi: 'Âm nhạc có thể cải thiện tâm trạng của bạn.' },
  ],
  school: [
    { en: 'He walks to school every morning.', vi: 'Anh ấy đi bộ đến trường mỗi sáng.' },
    { en: 'School starts at seven thirty.', vi: 'Trường học bắt đầu lúc bảy giờ rưỡi.' },
  ],
  money: [
    { en: 'Save money for the future.', vi: 'Tiết kiệm tiền cho tương lai.' },
    { en: 'Money cannot buy happiness.', vi: 'Tiền không mua được hạnh phúc.' },
  ],
  key: [
    { en: 'I lost my key and couldn\'t get in.', vi: 'Tôi mất chìa khoá và không vào được.' },
    { en: 'She gave him a spare key.', vi: 'Cô ấy đưa cho anh ấy một chìa khoá dự phòng.' },
  ],
  door: [
    { en: 'Please close the door when you leave.', vi: 'Hãy đóng cửa khi ra ngoài.' },
    { en: 'He knocked on the door three times.', vi: 'Anh ấy gõ cửa ba lần.' },
  ],
  window: [
    { en: 'Open the window to let in fresh air.', vi: 'Mở cửa sổ cho không khí vào.' },
    { en: 'She looked out of the window at the rain.', vi: 'Cô ấy nhìn qua cửa sổ ra cơn mưa.' },
  ],
  ball: [
    { en: 'The children kicked the ball in the park.', vi: 'Bọn trẻ đá bóng trong công viên.' },
    { en: 'Throw the ball to me!', vi: 'Ném bóng cho tôi!' },
  ],
  umbrella: [
    { en: 'She opened her umbrella as the rain started.', vi: 'Cô ấy mở ô khi mưa bắt đầu rơi.' },
    { en: 'Don\'t forget to take an umbrella in rainy season.', vi: 'Đừng quên mang ô vào mùa mưa.' },
  ],
}
