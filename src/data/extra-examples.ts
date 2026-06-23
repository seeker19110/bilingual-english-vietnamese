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
    { en: 'School teaches us more than just books.', vi: 'Trường học dạy nhiều hơn chỉ là sách vở.' },
    { en: 'She stayed after school to practise English.', vi: 'Cô ấy ở lại sau giờ học để luyện tiếng Anh.' },
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

  // ── Gia đình ──────────────────────────────────────────────────
  family: [
    { en: 'Our family goes on vacation every summer.', vi: 'Gia đình chúng tôi đi nghỉ mỗi mùa hè.' },
    { en: 'A happy family is the greatest blessing.', vi: 'Một gia đình hạnh phúc là phước lành lớn nhất.' },
  ],
  father: [
    { en: 'My father works hard to support the family.', vi: 'Bố tôi làm việc chăm chỉ để nuôi gia đình.' },
    { en: 'He became a father for the first time last year.', vi: 'Anh ấy lần đầu làm bố vào năm ngoái.' },
  ],
  mother: [
    { en: 'My mother is the heart of our family.', vi: 'Mẹ tôi là trái tim của gia đình.' },
    { en: 'She calls her mother every evening.', vi: 'Cô ấy gọi cho mẹ mỗi buổi tối.' },
  ],
  parents: [
    { en: 'My parents support everything I do.', vi: 'Bố mẹ ủng hộ mọi việc tôi làm.' },
    { en: 'Always respect your parents.', vi: 'Luôn tôn trọng bố mẹ của bạn.' },
  ],
  son: [
    { en: 'His son just started primary school.', vi: 'Con trai anh ấy vừa bắt đầu học tiểu học.' },
    { en: 'The father watched proudly as his son graduated.', vi: 'Người cha tự hào nhìn con trai tốt nghiệp.' },
  ],
  daughter: [
    { en: 'Her daughter loves singing and dancing.', vi: 'Con gái cô ấy thích ca hát và nhảy múa.' },
    { en: 'He has two daughters and one son.', vi: 'Anh ấy có hai con gái và một con trai.' },
  ],
  brother: [
    { en: 'My younger brother is very funny.', vi: 'Em trai tôi rất hài hước.' },
    { en: 'Brothers should always look out for each other.', vi: 'Anh em phải luôn trông chừng nhau.' },
  ],
  sister: [
    { en: 'She talks to her sister on the phone every day.', vi: 'Cô ấy gọi điện cho em gái mỗi ngày.' },
    { en: 'My sister is also my closest friend.', vi: 'Chị gái cũng là người bạn thân nhất của tôi.' },
  ],
  grandfather: [
    { en: 'My grandfather tells amazing stories.', vi: 'Ông tôi kể những câu chuyện tuyệt vời.' },
    { en: 'He visits his grandfather every weekend.', vi: 'Cậu ấy thăm ông mỗi cuối tuần.' },
  ],
  grandmother: [
    { en: 'My grandmother makes the best food.', vi: 'Bà tôi nấu ăn ngon nhất.' },
    { en: 'She learned to cook from her grandmother.', vi: 'Cô ấy học nấu ăn từ bà ngoại.' },
  ],
  husband: [
    { en: 'Her husband always supports her career.', vi: 'Chồng cô ấy luôn ủng hộ sự nghiệp của cô.' },
    { en: 'They have been husband and wife for ten years.', vi: 'Họ đã là vợ chồng mười năm rồi.' },
  ],
  wife: [
    { en: 'He cooked a special dinner to surprise his wife.', vi: 'Anh ấy nấu bữa tối đặc biệt để làm vợ ngạc nhiên.' },
    { en: 'His wife is both a doctor and a great mother.', vi: 'Vợ anh ấy vừa là bác sĩ vừa là người mẹ tuyệt vời.' },
  ],
  child: [
    { en: 'The child played happily in the garden.', vi: 'Đứa trẻ chơi vui vẻ trong vườn.' },
    { en: 'Every child deserves a good education.', vi: 'Mỗi đứa trẻ đều xứng đáng được học hành tử tế.' },
  ],
  baby: [
    { en: 'The baby sleeps most of the day.', vi: 'Em bé ngủ gần suốt ngày.' },
    { en: 'She is expecting a baby in March.', vi: 'Cô ấy sắp sinh em bé vào tháng Ba.' },
  ],

  // ── Cơ thể (bổ sung) ──────────────────────────────────────────
  hair: [
    { en: 'He cut his hair short last week.', vi: 'Anh ấy cắt tóc ngắn tuần trước.' },
    { en: 'She tied her hair in a ponytail.', vi: 'Cô ấy buộc tóc đuôi ngựa.' },
  ],
  face: [
    { en: 'She washed her face before going to bed.', vi: 'Cô ấy rửa mặt trước khi ngủ.' },
    { en: 'Wear sunscreen to protect your face from the sun.', vi: 'Thoa kem chống nắng để bảo vệ da mặt.' },
  ],
  ear: [
    { en: 'He wears earrings in both ears.', vi: 'Anh ấy đeo bông tai ở cả hai tai.' },
    { en: 'Turn the music down — it hurts my ears.', vi: 'Vặn nhỏ nhạc xuống — tai tôi đau.' },
  ],
  tooth: [
    { en: 'She lost a baby tooth when she was six.', vi: 'Cô bé rụng răng sữa lúc sáu tuổi.' },
    { en: 'Brush your teeth at least twice a day.', vi: 'Đánh răng ít nhất hai lần mỗi ngày.' },
  ],
  arm: [
    { en: 'She carried the baby gently in her arms.', vi: 'Cô ấy nhẹ nhàng bế em bé trên tay.' },
    { en: 'He raised his arm to ask a question.', vi: 'Anh ấy giơ tay lên để hỏi.' },
  ],
  leg: [
    { en: 'He broke his leg playing football.', vi: 'Anh ấy gãy chân khi chơi bóng đá.' },
    { en: 'After the long hike, her legs were very tired.', vi: 'Sau chuyến leo núi dài, chân cô ấy rất mỏi.' },
  ],
  finger: [
    { en: 'She wore a ring on her finger.', vi: 'Cô ấy đeo nhẫn trên ngón tay.' },
    { en: 'He pointed his finger at the map.', vi: 'Anh ấy chỉ ngón tay vào bản đồ.' },
  ],
  stomach: [
    { en: 'I ate too much and my stomach hurts.', vi: 'Tôi ăn quá nhiều và đau bụng.' },
    { en: 'Drink ginger tea to calm an upset stomach.', vi: 'Uống trà gừng để dịu dạ dày khó chịu.' },
  ],
  body: [
    { en: 'Regular exercise keeps your body healthy.', vi: 'Tập thể dục thường xuyên giúp cơ thể khoẻ mạnh.' },
    { en: 'Listen to your body when you feel tired.', vi: 'Hãy lắng nghe cơ thể khi bạn thấy mệt.' },
  ],

  // ── Đồ ăn & thức uống (bổ sung) ──────────────────────────────
  food: [
    { en: 'Vietnamese food is delicious and varied.', vi: 'Ẩm thực Việt Nam ngon và đa dạng.' },
    { en: 'She always brings food to share at work.', vi: 'Cô ấy luôn mang đồ ăn đến chia sẻ ở chỗ làm.' },
  ],
  meat: [
    { en: 'He does not eat red meat.', vi: 'Anh ấy không ăn thịt đỏ.' },
    { en: 'The grilled meat smelled wonderful.', vi: 'Thịt nướng thơm ngon vô cùng.' },
  ],
  vegetable: [
    { en: 'She grows vegetables in her garden.', vi: 'Cô ấy trồng rau trong vườn nhà.' },
    { en: 'Fresh vegetables are healthier than canned ones.', vi: 'Rau tươi tốt hơn rau đóng hộp.' },
  ],
  tea: [
    { en: 'Herbal tea helps me sleep at night.', vi: 'Trà thảo mộc giúp tôi ngủ ngon.' },
    { en: 'She drinks a cup of green tea every afternoon.', vi: 'Cô ấy uống một tách trà xanh mỗi chiều.' },
  ],
  sugar: [
    { en: 'This coffee has too much sugar.', vi: 'Cà phê này cho quá nhiều đường.' },
    { en: 'Cutting down on sugar is good for your health.', vi: 'Giảm đường có lợi cho sức khoẻ bạn.' },
  ],
  salt: [
    { en: 'Too much salt is bad for your heart.', vi: 'Ăn quá nhiều muối không tốt cho tim.' },
    { en: 'Add a pinch of salt to improve the taste.', vi: 'Cho thêm một nhúm muối để tăng vị.' },
  ],
  breakfast: [
    { en: 'Never skip breakfast — it gives you energy.', vi: 'Đừng bỏ bữa sáng — nó cho bạn năng lượng.' },
    { en: 'He had a bowl of pho for breakfast.', vi: 'Anh ấy ăn một bát phở vào bữa sáng.' },
  ],
  lunch: [
    { en: 'We have a one-hour lunch break at noon.', vi: 'Chúng tôi có giờ nghỉ trưa một tiếng.' },
    { en: 'She usually eats a light lunch.', vi: 'Cô ấy thường ăn trưa nhẹ.' },
  ],
  dinner: [
    { en: 'The whole family eats dinner together.', vi: 'Cả gia đình cùng ăn tối với nhau.' },
    { en: 'He cooked a special dinner for her birthday.', vi: 'Anh ấy nấu bữa tối đặc biệt cho sinh nhật cô ấy.' },
  ],
  eat: [
    { en: 'Eat slowly and enjoy every bite.', vi: 'Ăn chậm và thưởng thức từng miếng.' },
    { en: 'She eats three balanced meals a day.', vi: 'Cô ấy ăn ba bữa cân bằng mỗi ngày.' },
  ],

  // ── Động vật (bổ sung) ────────────────────────────────────────
  animal: [
    { en: 'Every animal has its own natural habitat.', vi: 'Mỗi loài động vật có môi trường sống riêng.' },
    { en: 'Children love learning about animals.', vi: 'Trẻ em thích tìm hiểu về động vật.' },
  ],
  chicken: [
    { en: 'We had grilled chicken for dinner.', vi: 'Chúng tôi ăn gà nướng cho bữa tối.' },
    { en: 'The chicken laid an egg this morning.', vi: 'Con gà đẻ một quả trứng sáng nay.' },
  ],
  pig: [
    { en: 'The pig rolled in the mud to cool down.', vi: 'Con lợn lăn trong bùn để hạ nhiệt.' },
    { en: 'Pork is one of the most popular meats in Vietnam.', vi: 'Thịt lợn là một trong những loại thịt phổ biến nhất ở Việt Nam.' },
  ],
  cow: [
    { en: 'The farmer milks the cow every morning.', vi: 'Người nông dân vắt sữa bò mỗi sáng.' },
    { en: 'Cows are very important to Vietnamese farmers.', vi: 'Bò rất quan trọng với nông dân Việt Nam.' },
  ],
  mouse: [
    { en: 'A mouse ran across the kitchen floor.', vi: 'Một con chuột chạy qua sàn bếp.' },
    { en: 'The cat is always hunting for a mouse.', vi: 'Con mèo luôn đi săn chuột.' },
  ],
  tiger: [
    { en: 'The tiger is a symbol of strength and power.', vi: 'Con hổ là biểu tượng của sức mạnh.' },
    { en: 'Tigers are endangered animals in the wild.', vi: 'Hổ là loài động vật có nguy cơ tuyệt chủng.' },
  ],
  monkey: [
    { en: 'The monkey swung from branch to branch.', vi: 'Con khỉ đu từ cành này sang cành khác.' },
    { en: 'Monkeys live in tropical forests and jungles.', vi: 'Khỉ sống trong rừng nhiệt đới.' },
  ],
  snake: [
    { en: 'She screamed when she saw a snake in the garden.', vi: 'Cô ấy la to khi thấy con rắn trong vườn.' },
    { en: 'Some snakes are venomous, so keep a safe distance.', vi: 'Một số loài rắn có độc, hãy giữ khoảng cách an toàn.' },
  ],
  insect: [
    { en: 'Mosquitoes are the most common insect in Vietnam.', vi: 'Muỗi là loài côn trùng phổ biến nhất ở Việt Nam.' },
    { en: 'Some insects are very helpful to farmers.', vi: 'Một số côn trùng rất có ích cho nông dân.' },
  ],
  fly: [
    { en: 'The eagle flew high above the mountains.', vi: 'Đại bàng bay cao trên đỉnh núi.' },
    { en: 'Airplanes can fly across the ocean in hours.', vi: 'Máy bay có thể bay qua đại dương trong vài tiếng.' },
  ],

  // ── Thời gian (bổ sung) ───────────────────────────────────────
  time: [
    { en: 'There is no time to waste.', vi: 'Không có thời gian để lãng phí.' },
    { en: 'Time flies when you are having fun.', vi: 'Thời gian trôi nhanh khi bạn đang vui.' },
  ],
  day: [
    { en: 'It was the best day of my life.', vi: 'Đó là ngày đẹp nhất trong cuộc đời tôi.' },
    { en: 'She works five days a week.', vi: 'Cô ấy làm việc năm ngày mỗi tuần.' },
  ],
  week: [
    { en: 'He takes an English class twice a week.', vi: 'Anh ấy học tiếng Anh hai lần mỗi tuần.' },
    { en: 'The project took two weeks to finish.', vi: 'Dự án mất hai tuần để hoàn thành.' },
  ],
  month: [
    { en: 'My birthday is next month.', vi: 'Sinh nhật tôi là tháng sau.' },
    { en: 'She saves a little money every month.', vi: 'Cô ấy tiết kiệm một chút tiền mỗi tháng.' },
  ],
  year: [
    { en: 'I have worked here for three years.', vi: 'Tôi đã làm ở đây ba năm rồi.' },
    { en: 'A year has three hundred and sixty-five days.', vi: 'Một năm có ba trăm sáu mươi lăm ngày.' },
  ],
  hour: [
    { en: 'The concert lasted two hours.', vi: 'Buổi hòa nhạc kéo dài hai tiếng.' },
    { en: 'It takes one hour to get there by bus.', vi: 'Đi xe buýt mất một tiếng đến đó.' },
  ],
  minute: [
    { en: 'The soup needs ten more minutes to cook.', vi: 'Canh cần thêm mười phút nữa.' },
    { en: 'Take a few minutes to rest your eyes.', vi: 'Hãy dành vài phút để nghỉ mắt.' },
  ],
  today: [
    { en: 'I have a meeting today at noon.', vi: 'Hôm nay tôi có cuộc họp lúc trưa.' },
    { en: 'Today is a great day to start something new.', vi: 'Hôm nay là ngày tuyệt vời để bắt đầu điều mới.' },
  ],
  tomorrow: [
    { en: 'Let\'s plan what to do tomorrow.', vi: 'Hãy lên kế hoạch cho ngày mai.' },
    { en: 'Tomorrow is the start of a new week.', vi: 'Ngày mai là đầu tuần mới.' },
  ],
  yesterday: [
    { en: 'Yesterday was my birthday.', vi: 'Hôm qua là sinh nhật tôi.' },
    { en: 'I forgot where I put my keys yesterday.', vi: 'Hôm qua tôi quên để chìa khoá ở đâu.' },
  ],
  morning: [
    { en: 'She exercises every morning before work.', vi: 'Cô ấy tập thể dục mỗi sáng trước khi đi làm.' },
    { en: 'I am not a morning person at all.', vi: 'Tôi hoàn toàn không phải người ưa dậy sớm.' },
  ],
  afternoon: [
    { en: 'They had a team meeting in the afternoon.', vi: 'Họ họp nhóm vào buổi chiều.' },
    { en: 'The rain started in the afternoon.', vi: 'Mưa bắt đầu vào buổi chiều.' },
  ],
  evening: [
    { en: 'The family gathers every evening for dinner.', vi: 'Cả gia đình tụ họp mỗi tối để ăn cơm.' },
    { en: 'Take a short walk in the evening to relax.', vi: 'Đi dạo ngắn vào buổi tối để thư giãn.' },
  ],
  night: [
    { en: 'He works the night shift at the factory.', vi: 'Anh ấy làm ca đêm ở nhà máy.' },
    { en: 'The city is very beautiful at night.', vi: 'Thành phố rất đẹp vào ban đêm.' },
  ],
  Monday: [
    { en: 'The work week always starts on Monday.', vi: 'Tuần làm việc luôn bắt đầu vào thứ Hai.' },
    { en: 'The staff meeting is held every Monday morning.', vi: 'Cuộc họp nhân viên tổ chức mỗi sáng thứ Hai.' },
  ],
  Friday: [
    { en: 'Everyone is happy on Friday afternoon.', vi: 'Mọi người đều vui vào chiều thứ Sáu.' },
    { en: 'We finish work at noon on Fridays.', vi: 'Chúng tôi tan làm lúc trưa các ngày thứ Sáu.' },
  ],
  Saturday: [
    { en: 'We play football in the park every Saturday morning.', vi: 'Chúng tôi đá bóng ở công viên mỗi sáng thứ Bảy.' },
    { en: 'The market is busiest on Saturday.', vi: 'Chợ đông nhất vào ngày thứ Bảy.' },
  ],
  Sunday: [
    { en: 'She reads books on Sunday afternoon.', vi: 'Cô ấy đọc sách vào chiều Chủ nhật.' },
    { en: 'Sunday is the perfect day to rest and recharge.', vi: 'Chủ nhật là ngày hoàn hảo để nghỉ ngơi và nạp lại năng lượng.' },
  ],

  // ── Đại từ & lời chào ─────────────────────────────────────────
  I: [
    { en: 'I am learning English every day.', vi: 'Tôi đang học tiếng Anh mỗi ngày.' },
    { en: 'I want to travel the world one day.', vi: 'Tôi muốn đi du lịch khắp thế giới một ngày nào đó.' },
  ],
  you: [
    { en: 'I am really glad you are here.', vi: 'Tôi rất vui vì bạn ở đây.' },
    { en: 'I will always support you.', vi: 'Tôi sẽ luôn ủng hộ bạn.' },
  ],
  he: [
    { en: 'He works as a software engineer.', vi: 'Anh ấy làm kỹ sư phần mềm.' },
    { en: 'He speaks English very fluently.', vi: 'Anh ấy nói tiếng Anh rất lưu loát.' },
  ],
  she: [
    { en: 'She is the top student in the class.', vi: 'Cô ấy là học sinh giỏi nhất lớp.' },
    { en: 'She loves reading books and cooking.', vi: 'Cô ấy thích đọc sách và nấu ăn.' },
  ],
  we: [
    { en: 'We are all in this together.', vi: 'Tất cả chúng ta cùng nhau trong việc này.' },
    { en: 'We had a wonderful time last weekend.', vi: 'Chúng tôi có khoảng thời gian tuyệt vời cuối tuần trước.' },
  ],
  they: [
    { en: 'They work at the same company.', vi: 'Họ làm việc ở cùng công ty.' },
    { en: 'They got married last year.', vi: 'Họ kết hôn năm ngoái.' },
  ],
  it: [
    { en: 'It is getting very late.', vi: 'Đã muộn lắm rồi.' },
    { en: 'It is cold outside today, so wear a jacket.', vi: 'Hôm nay trời lạnh ngoài, hãy mặc áo khoác.' },
  ],
  hello: [
    { en: 'She said hello to everyone she met.', vi: 'Cô ấy chào mọi người cô gặp.' },
    { en: 'Say hello to your family for me.', vi: 'Chào hỏi gia đình bạn giúp tôi nhé.' },
  ],
  hi: [
    { en: 'He waved hi from across the room.', vi: 'Anh ấy vẫy tay chào từ phía bên kia phòng.' },
    { en: 'She texted hi to her friend first thing in the morning.', vi: 'Cô ấy nhắn tin "hi" cho bạn ngay buổi sáng.' },
  ],
  goodbye: [
    { en: 'She said goodbye with tears in her eyes.', vi: 'Cô ấy nói lời tạm biệt với đôi mắt đẫm lệ.' },
    { en: 'It is never easy to say goodbye to someone you love.', vi: 'Nói lời tạm biệt với người bạn yêu thương không bao giờ dễ.' },
  ],
  please: [
    { en: 'Please be quiet in the library.', vi: 'Làm ơn giữ yên lặng trong thư viện.' },
    { en: 'Could you please help me with this?', vi: 'Bạn có thể vui lòng giúp tôi việc này không?' },
  ],
  thanks: [
    { en: 'Thanks for coming to my birthday party.', vi: 'Cảm ơn bạn đã đến dự tiệc sinh nhật tôi.' },
    { en: 'She said thanks and smiled warmly.', vi: 'Cô ấy nói cảm ơn và mỉm cười thân thiện.' },
  ],
  sorry: [
    { en: 'He said sorry for arriving late.', vi: 'Anh ấy xin lỗi vì đến muộn.' },
    { en: 'I am so sorry to hear that news.', vi: 'Tôi rất tiếc khi nghe tin đó.' },
  ],
  yes: [
    { en: 'She said yes to the job offer right away.', vi: 'Cô ấy đồng ý ngay với lời đề nghị việc làm.' },
    { en: 'Say yes to new opportunities.', vi: 'Hãy nói có với những cơ hội mới.' },
  ],
  no: [
    { en: 'He politely said no to working overtime.', vi: 'Anh ấy lịch sự từ chối làm thêm giờ.' },
    { en: 'It is important to know when to say no.', vi: 'Quan trọng là phải biết lúc nào cần nói không.' },
  ],
  name: [
    { en: 'I forgot his name after the meeting.', vi: 'Tôi quên tên anh ấy sau cuộc họp.' },
    { en: 'She wrote her name on the registration form.', vi: 'Cô ấy viết tên vào mẫu đăng ký.' },
  ],

  // ── Động từ cơ bản ────────────────────────────────────────────
  be: [
    { en: 'I want to be a confident English speaker.', vi: 'Tôi muốn trở thành người nói tiếng Anh tự tin.' },
    { en: 'Be honest and people will trust you.', vi: 'Hãy trung thực và mọi người sẽ tin bạn.' },
  ],
  have: [
    { en: 'I have a lot of work to finish today.', vi: 'Tôi có nhiều việc cần hoàn thành hôm nay.' },
    { en: 'Do you have a moment to talk?', vi: 'Bạn có một chút thời gian để nói chuyện không?' },
  ],
  do: [
    { en: 'What do you do for a living?', vi: 'Bạn làm nghề gì để kiếm sống?' },
    { en: 'Do your best every single day.', vi: 'Cố gắng hết sức mỗi ngày.' },
  ],
  go: [
    { en: 'Let\'s go for a walk in the park.', vi: 'Cùng đi dạo trong công viên đi.' },
    { en: 'She goes to the gym three times a week.', vi: 'Cô ấy đi gym ba lần mỗi tuần.' },
  ],
  come: [
    { en: 'Come and join us at the table.', vi: 'Lại đây ngồi cùng chúng tôi nào.' },
    { en: 'She came to Vietnam to study Vietnamese.', vi: 'Cô ấy đến Việt Nam để học tiếng Việt.' },
  ],
  see: [
    { en: 'I will see you at the coffee shop tomorrow.', vi: 'Tôi sẽ gặp bạn ở quán cà phê ngày mai.' },
    { en: 'Can you see the sign from where you are standing?', vi: 'Bạn có thể nhìn thấy biển hiệu từ chỗ bạn đứng không?' },
  ],
  know: [
    { en: 'Do you know each other already?', vi: 'Hai bạn đã biết nhau rồi chưa?' },
    { en: 'I did not know you could speak French.', vi: 'Tôi không biết bạn có thể nói tiếng Pháp.' },
  ],
  want: [
    { en: 'What do you want to be when you grow up?', vi: 'Bạn muốn làm gì khi lớn lên?' },
    { en: 'She wants to travel to Japan one day.', vi: 'Cô ấy muốn đến Nhật Bản một ngày nào đó.' },
  ],
  like: [
    { en: 'I really like learning new things every day.', vi: 'Tôi thực sự thích học điều mới mỗi ngày.' },
    { en: 'Do you like Vietnamese food?', vi: 'Bạn có thích ẩm thực Việt Nam không?' },
  ],
  love: [
    { en: 'I love spending quality time with my family.', vi: 'Tôi thích dành thời gian chất lượng bên gia đình.' },
    { en: 'He loves playing the guitar after work.', vi: 'Anh ấy thích chơi đàn guitar sau giờ làm.' },
  ],
  make: [
    { en: 'She makes her own lunch every day.', vi: 'Cô ấy tự chuẩn bị bữa trưa mỗi ngày.' },
    { en: 'Let\'s make a plan for next week.', vi: 'Hãy lên kế hoạch cho tuần sau.' },
  ],
  say: [
    { en: 'He said nothing and just smiled.', vi: 'Anh ấy không nói gì mà chỉ mỉm cười.' },
    { en: 'What did she say about the project?', vi: 'Cô ấy nói gì về dự án?' },
  ],
  think: [
    { en: 'I think we need a little more time.', vi: 'Tôi nghĩ chúng ta cần thêm một chút thời gian.' },
    { en: 'Think before you speak to avoid misunderstandings.', vi: 'Suy nghĩ trước khi nói để tránh hiểu nhầm.' },
  ],
  work: [
    { en: 'She works from home every Friday.', vi: 'Cô ấy làm việc ở nhà mỗi thứ Sáu.' },
    { en: 'He works hard to provide for his family.', vi: 'Anh ấy làm việc chăm chỉ để lo cho gia đình.' },
  ],
  read: [
    { en: 'He reads the newspaper every morning over coffee.', vi: 'Anh ấy đọc báo mỗi sáng cùng ly cà phê.' },
    { en: 'Reading every day helps expand your vocabulary.', vi: 'Đọc sách mỗi ngày giúp mở rộng vốn từ.' },
  ],
  write: [
    { en: 'She writes in her diary every night before bed.', vi: 'Cô ấy viết nhật ký mỗi tối trước khi ngủ.' },
    { en: 'Write a short letter to practise your English.', vi: 'Viết một bức thư ngắn để luyện tiếng Anh.' },
  ],
  speak: [
    { en: 'He speaks three languages fluently.', vi: 'Anh ấy nói được ba thứ tiếng lưu loát.' },
    { en: 'Speak clearly so everyone in the room can hear you.', vi: 'Nói rõ ràng để mọi người trong phòng đều nghe thấy.' },
  ],
  learn: [
    { en: 'You can learn something new every single day.', vi: 'Bạn có thể học điều gì đó mới mỗi ngày.' },
    { en: 'She learned to drive a car last year.', vi: 'Cô ấy học lái xe ô tô năm ngoái.' },
  ],
  help: [
    { en: 'He helped his elderly neighbor carry the groceries.', vi: 'Anh ấy giúp người hàng xóm lớn tuổi mang đồ chợ.' },
    { en: 'Can you help me find this address?', vi: 'Bạn có thể giúp tôi tìm địa chỉ này không?' },
  ],
  give: [
    { en: 'She gave her old clothes to a charity shop.', vi: 'Cô ấy tặng quần áo cũ cho cửa hàng từ thiện.' },
    { en: 'Give me just a moment to think about it.', vi: 'Cho tôi một chút thời gian để suy nghĩ.' },
  ],

  // ── Tính từ cơ bản ────────────────────────────────────────────
  good: [
    { en: 'She is a very good listener.', vi: 'Cô ấy là người lắng nghe rất tốt.' },
    { en: 'Good friends are rare and precious.', vi: 'Bạn tốt thì hiếm và quý giá.' },
  ],
  bad: [
    { en: 'He felt bad about missing the important meeting.', vi: 'Anh ấy cảm thấy tệ vì đã bỏ lỡ cuộc họp quan trọng.' },
    { en: 'Smoking is very bad for your health.', vi: 'Hút thuốc rất có hại cho sức khoẻ.' },
  ],
  big: [
    { en: 'Ho Chi Minh City is a very big city.', vi: 'Thành phố Hồ Chí Minh là một thành phố rất lớn.' },
    { en: 'She had a big smile on her face.', vi: 'Cô ấy nở một nụ cười rộng trên mặt.' },
  ],
  small: [
    { en: 'They live in a small but cosy apartment.', vi: 'Họ sống trong một căn hộ nhỏ nhưng ấm cúng.' },
    { en: 'Even small actions can make a big difference.', vi: 'Ngay cả những hành động nhỏ cũng có thể tạo ra sự khác biệt lớn.' },
  ],
  hot: [
    { en: 'Hanoi is extremely hot in summer.', vi: 'Hà Nội cực kỳ nóng vào mùa hè.' },
    { en: 'Be careful — the pan is still hot.', vi: 'Cẩn thận — cái chảo vẫn còn nóng.' },
  ],
  cold: [
    { en: 'The north of Vietnam can be very cold in winter.', vi: 'Miền bắc Việt Nam có thể rất lạnh vào mùa đông.' },
    { en: 'She drank a glass of cold water after running.', vi: 'Cô ấy uống một ly nước lạnh sau khi chạy bộ.' },
  ],
  new: [
    { en: 'He started a new job at the beginning of this month.', vi: 'Anh ấy bắt đầu công việc mới vào đầu tháng này.' },
    { en: 'She bought a new dress for the party.', vi: 'Cô ấy mua một chiếc váy mới cho bữa tiệc.' },
  ],
  old: [
    { en: 'The old temple has stood for over a thousand years.', vi: 'Ngôi đền cổ đã đứng vững hơn một nghìn năm.' },
    { en: 'He is the oldest and most experienced person on the team.', vi: 'Anh ấy là người lớn tuổi nhất và nhiều kinh nghiệm nhất trong nhóm.' },
  ],
  happy: [
    { en: 'She looked very happy when she heard the good news.', vi: 'Cô ấy trông rất vui khi nghe tin tốt.' },
    { en: 'Do what makes you happy every day.', vi: 'Hãy làm những gì khiến bạn hạnh phúc mỗi ngày.' },
  ],
  sad: [
    { en: 'He was very sad when his dog died.', vi: 'Anh ấy rất buồn khi con chó của anh chết.' },
    { en: 'The movie had a very sad ending.', vi: 'Bộ phim có một kết thúc rất buồn.' },
  ],
  easy: [
    { en: 'The first chapter of the book is easy to understand.', vi: 'Chương đầu tiên của cuốn sách dễ hiểu.' },
    { en: 'This task looks easy but it is not.', vi: 'Nhiệm vụ này trông dễ nhưng thực ra không phải.' },
  ],
  hard: [
    { en: 'The job turned out to be harder than expected.', vi: 'Công việc hoá ra khó hơn dự đoán.' },
    { en: 'She worked very hard to achieve her dream.', vi: 'Cô ấy làm việc rất chăm chỉ để đạt được ước mơ.' },
  ],
  fast: [
    { en: 'The new train runs very fast.', vi: 'Chuyến tàu mới chạy rất nhanh.' },
    { en: 'He types very fast with all ten fingers.', vi: 'Anh ấy gõ phím rất nhanh bằng cả mười ngón.' },
  ],
  slow: [
    { en: 'The internet connection at the café is very slow.', vi: 'Kết nối internet ở quán cà phê rất chậm.' },
    { en: 'Slow down when you drive in the rain.', vi: 'Đi chậm lại khi lái xe trong mưa.' },
  ],
  beautiful: [
    { en: 'Vietnam has a long and beautiful coastline.', vi: 'Việt Nam có đường bờ biển dài và đẹp.' },
    { en: 'She smiled and the whole room felt beautiful.', vi: 'Cô ấy mỉm cười và cả căn phòng như sáng lên.' },
  ],
  expensive: [
    { en: 'Living in the city centre is quite expensive.', vi: 'Sống ở trung tâm thành phố khá đắt đỏ.' },
    { en: 'The repair cost was more expensive than expected.', vi: 'Chi phí sửa chữa đắt hơn dự tính.' },
  ],

  // ── Nhà cửa & đồ vật (bổ sung) ───────────────────────────────
  room: [
    { en: 'She decorated her room with colourful plants.', vi: 'Cô ấy trang trí phòng bằng những cây xanh đầy màu sắc.' },
    { en: 'There is no room in the bag for more books.', vi: 'Không còn chỗ trong túi để thêm sách nữa.' },
  ],
  kitchen: [
    { en: 'The kitchen always smells amazing when she cooks.', vi: 'Nhà bếp luôn thơm ngào ngạt khi cô ấy nấu ăn.' },
    { en: 'She spends a lot of time in the kitchen every evening.', vi: 'Cô ấy dành nhiều thời gian trong bếp mỗi buổi tối.' },
  ],
  pen: [
    { en: 'Can I borrow your pen for a moment?', vi: 'Tôi mượn bút của bạn một chút được không?' },
    { en: 'Sign the form with a pen, not a pencil.', vi: 'Ký vào mẫu bằng bút mực, không phải bút chì.' },
  ],
  bag: [
    { en: 'Her school bag is full of books and notebooks.', vi: 'Cặp sách của cô bé đầy sách và vở.' },
    { en: 'Pack light — one small bag is enough for the trip.', vi: 'Đóng gói gọn — một túi nhỏ là đủ cho chuyến đi.' },
  ],

  // ── Công nghệ & IT ────────────────────────────────────────────
  software: [
    { en: 'This software is free to download and use.', vi: 'Phần mềm này miễn phí tải về và sử dụng.' },
    { en: 'The hospital uses special software to manage patient records.', vi: 'Bệnh viện dùng phần mềm đặc biệt để quản lý hồ sơ bệnh nhân.' },
  ],
  internet: [
    { en: 'She orders groceries on the internet every week.', vi: 'Cô ấy đặt hàng tạp hóa trên mạng mỗi tuần.' },
    { en: 'The internet has completely changed the way we learn.', vi: 'Internet đã thay đổi hoàn toàn cách chúng ta học.' },
  ],
  email: [
    { en: 'I sent you an email this morning — please check.', vi: 'Tôi đã gửi email cho bạn sáng nay — hãy kiểm tra nhé.' },
    { en: 'Check your email for the meeting link.', vi: 'Kiểm tra email để lấy đường link cuộc họp.' },
  ],
  database: [
    { en: 'The database stores all customer information securely.', vi: 'Cơ sở dữ liệu lưu trữ thông tin khách hàng an toàn.' },
    { en: 'We back up the database automatically every night.', vi: 'Chúng tôi tự động sao lưu cơ sở dữ liệu mỗi đêm.' },
  ],
  app: [
    { en: 'I use a dictionary app on my phone every day.', vi: 'Tôi dùng ứng dụng từ điển trên điện thoại mỗi ngày.' },
    { en: 'She downloaded a fitness app to track her steps.', vi: 'Cô ấy tải ứng dụng thể dục để theo dõi số bước chân.' },
  ],
  website: [
    { en: 'The company website gets thousands of visitors a day.', vi: 'Trang web của công ty có hàng nghìn lượt truy cập mỗi ngày.' },
    { en: 'Create a simple website to showcase your work.', vi: 'Tạo một trang web đơn giản để trưng bày công việc của bạn.' },
  ],
  code: [
    { en: 'He writes clean and easy-to-read code.', vi: 'Anh ấy viết code sạch và dễ đọc.' },
    { en: 'There is a bug hidden somewhere in the code.', vi: 'Có một lỗi ẩn đâu đó trong code.' },
  ],
  developer: [
    { en: 'She is a front-end developer at a fast-growing startup.', vi: 'Cô ấy là lập trình viên giao diện ở một startup đang phát triển nhanh.' },
    { en: 'Developers need both creativity and strong logic.', vi: 'Lập trình viên cần cả sự sáng tạo lẫn tư duy logic.' },
  ],
  server: [
    { en: 'The server crashed during peak traffic hours.', vi: 'Máy chủ bị sập trong giờ cao điểm.' },
    { en: 'We moved all our data to a cloud server.', vi: 'Chúng tôi chuyển toàn bộ dữ liệu lên máy chủ đám mây.' },
  ],
  data: [
    { en: 'Always back up your data before updating the system.', vi: 'Luôn sao lưu dữ liệu trước khi cập nhật hệ thống.' },
    { en: 'The company analyses customer data to improve its service.', vi: 'Công ty phân tích dữ liệu khách hàng để cải thiện dịch vụ.' },
  ],
  network: [
    { en: 'Is this WiFi network secure enough to use?', vi: 'Mạng WiFi này có đủ an toàn để dùng không?' },
    { en: 'She works in IT network security.', vi: 'Cô ấy làm trong lĩnh vực bảo mật mạng IT.' },
  ],
  update: [
    { en: 'Update your app to get the latest features and fixes.', vi: 'Cập nhật ứng dụng để nhận tính năng và bản vá mới nhất.' },
    { en: 'He forgot to update his antivirus software.', vi: 'Anh ấy quên cập nhật phần mềm diệt virus.' },
  ],
  download: [
    { en: 'Download the registration form and fill it in.', vi: 'Tải mẫu đăng ký về và điền vào.' },
    { en: 'The large file took ten minutes to download.', vi: 'Tệp lớn mất mười phút để tải xuống.' },
  ],
  upload: [
    { en: 'Please upload your CV to the company website.', vi: 'Hãy tải hồ sơ của bạn lên trang web công ty.' },
    { en: 'She uploaded the photos from her trip to the cloud.', vi: 'Cô ấy tải ảnh chuyến đi lên đám mây.' },
  ],
  password: [
    { en: 'Use a strong password with letters, numbers and symbols.', vi: 'Dùng mật khẩu mạnh gồm chữ, số và ký hiệu.' },
    { en: 'Never share your password with anyone, even close friends.', vi: 'Đừng bao giờ chia sẻ mật khẩu với bất kỳ ai, kể cả bạn thân.' },
  ],
  screen: [
    { en: 'Reduce your screen time at least one hour before bed.', vi: 'Giảm thời gian nhìn màn hình ít nhất một tiếng trước khi ngủ.' },
    { en: 'The phone screen cracked when it fell on the floor.', vi: 'Màn hình điện thoại vỡ khi nó rơi xuống sàn.' },
  ],
  keyboard: [
    { en: 'She types very fast on a mechanical keyboard.', vi: 'Cô ấy gõ phím rất nhanh trên bàn phím cơ.' },
    { en: 'The keyboard shortcut saves a lot of time.', vi: 'Phím tắt giúp tiết kiệm rất nhiều thời gian.' },
  ],
  backup: [
    { en: 'Always make a backup before you update the system.', vi: 'Luôn tạo bản sao lưu trước khi cập nhật hệ thống.' },
    { en: 'He lost all his files because he had no backup.', vi: 'Anh ấy mất tất cả tệp vì không có bản sao lưu.' },
  ],
  bug: [
    { en: 'The developer fixed the bug in under an hour.', vi: 'Lập trình viên sửa lỗi trong chưa đầy một tiếng.' },
    { en: 'Please report any bugs you find while testing.', vi: 'Hãy báo cáo mọi lỗi bạn tìm thấy khi kiểm thử.' },
  ],

  // ── Y tế & sức khỏe ──────────────────────────────────────────
  doctor: [
    { en: 'See a doctor if the pain does not go away.', vi: 'Hãy gặp bác sĩ nếu cơn đau không giảm.' },
    { en: 'My doctor gave me very helpful advice.', vi: 'Bác sĩ của tôi đưa ra lời khuyên rất hữu ích.' },
  ],
  nurse: [
    { en: 'The nurse took my temperature and blood pressure.', vi: 'Y tá đo nhiệt độ và huyết áp của tôi.' },
    { en: 'Nurses work long hours and deserve great respect.', vi: 'Y tá làm việc nhiều giờ và xứng đáng được tôn trọng.' },
  ],
  hospital: [
    { en: 'She was in the hospital for three days after the accident.', vi: 'Cô ấy nằm viện ba ngày sau tai nạn.' },
    { en: 'The new hospital is very modern and well-equipped.', vi: 'Bệnh viện mới rất hiện đại và được trang bị tốt.' },
  ],
  medicine: [
    { en: 'Take the medicine after every meal, not before.', vi: 'Uống thuốc sau mỗi bữa ăn, không phải trước.' },
    { en: 'She forgot to bring her medicine on the business trip.', vi: 'Cô ấy quên mang thuốc trong chuyến công tác.' },
  ],
  prescription: [
    { en: 'You need a prescription to buy this medicine.', vi: 'Bạn cần đơn thuốc để mua thuốc này.' },
    { en: 'The doctor wrote a prescription for antibiotics.', vi: 'Bác sĩ kê đơn thuốc kháng sinh.' },
  ],
  patient: [
    { en: 'The doctor spoke calmly and clearly to the patient.', vi: 'Bác sĩ nói chuyện bình tĩnh và rõ ràng với bệnh nhân.' },
    { en: 'The patients in the waiting room waited for over an hour.', vi: 'Bệnh nhân ở phòng chờ đợi hơn một tiếng.' },
  ],
  fever: [
    { en: 'He stayed home from work because he had a high fever.', vi: 'Anh ấy nghỉ làm vì bị sốt cao.' },
    { en: 'Take medicine and rest well to bring the fever down.', vi: 'Uống thuốc và nghỉ ngơi để hạ sốt.' },
  ],
  headache: [
    { en: 'She took a tablet to relieve her headache.', vi: 'Cô ấy uống thuốc để giảm đau đầu.' },
    { en: 'Staring at a screen for too long causes headaches.', vi: 'Nhìn màn hình quá lâu gây ra đau đầu.' },
  ],
  allergy: [
    { en: 'She has a severe allergy to seafood.', vi: 'Cô ấy bị dị ứng nặng với hải sản.' },
    { en: 'Always tell the doctor about any allergies you have.', vi: 'Luôn báo cho bác sĩ về bất kỳ dị ứng nào bạn có.' },
  ],
  vaccine: [
    { en: 'Get your flu vaccine every year before winter.', vi: 'Tiêm vaccine cúm mỗi năm trước mùa đông.' },
    { en: 'The vaccine was proven to be safe and effective.', vi: 'Vaccine đã được chứng minh là an toàn và hiệu quả.' },
  ],
  surgery: [
    { en: 'He had heart surgery and recovered in two weeks.', vi: 'Anh ấy phẫu thuật tim và hồi phục trong hai tuần.' },
    { en: 'She recovered remarkably quickly after the surgery.', vi: 'Cô ấy phục hồi nhanh đến đáng ngạc nhiên sau ca phẫu thuật.' },
  ],
  diagnosis: [
    { en: 'The doctor gave her a clear and detailed diagnosis.', vi: 'Bác sĩ đưa ra chẩn đoán rõ ràng và chi tiết cho cô ấy.' },
    { en: 'An early diagnosis can save many lives.', vi: 'Chẩn đoán sớm có thể cứu sống nhiều người.' },
  ],
  symptom: [
    { en: 'Tell the doctor all your symptoms so they can help.', vi: 'Cho bác sĩ biết tất cả triệu chứng để họ giúp được bạn.' },
    { en: 'Fever and cough are common cold symptoms.', vi: 'Sốt và ho là triệu chứng cảm lạnh thông thường.' },
  ],
  treatment: [
    { en: 'The full treatment takes about six weeks.', vi: 'Toàn bộ quá trình điều trị khoảng sáu tuần.' },
    { en: 'New treatments for cancer are being developed rapidly.', vi: 'Các phương pháp điều trị ung thư mới đang được phát triển nhanh chóng.' },
  ],
  pharmacy: [
    { en: 'The pharmacy near my house is open until midnight.', vi: 'Nhà thuốc gần nhà tôi mở đến nửa đêm.' },
    { en: 'You can buy vitamins and supplements at the pharmacy.', vi: 'Bạn có thể mua vitamin và thực phẩm bổ sung ở nhà thuốc.' },
  ],
  appointment: [
    { en: 'Please arrive ten minutes early for your appointment.', vi: 'Hãy đến sớm mười phút trước giờ hẹn khám.' },
    { en: 'She made an appointment with the dentist for next Friday.', vi: 'Cô ấy đặt lịch hẹn với nha sĩ vào thứ Sáu tuần sau.' },
  ],
  emergency: [
    { en: 'In a medical emergency, call 115 immediately.', vi: 'Trong tình huống cấp cứu, gọi ngay 115.' },
    { en: 'The emergency room was crowded on Saturday night.', vi: 'Phòng cấp cứu rất đông vào tối thứ Bảy.' },
  ],
  insurance: [
    { en: 'Health insurance covers the cost of most medicines.', vi: 'Bảo hiểm y tế chi trả phần lớn chi phí thuốc.' },
    { en: 'She applied for health insurance through her employer.', vi: 'Cô ấy đăng ký bảo hiểm y tế qua công ty.' },
  ],
  blood: [
    { en: 'His blood pressure was too high.', vi: 'Huyết áp của anh ấy quá cao.' },
    { en: 'She donates blood twice a year to help others.', vi: 'Cô ấy hiến máu hai lần mỗi năm để giúp người khác.' },
  ],
  pain: [
    { en: 'The pain in her back got worse after sitting all day.', vi: 'Cơn đau lưng của cô ấy nặng hơn sau khi ngồi cả ngày.' },
    { en: 'Point to where you feel the pain.', vi: 'Hãy chỉ vào chỗ bạn cảm thấy đau.' },
  ],

  // ── Kinh doanh & công sở ──────────────────────────────────────
  meeting: [
    { en: 'The morning meeting lasted two hours.', vi: 'Cuộc họp buổi sáng kéo dài hai tiếng.' },
    { en: 'She sent the meeting notes to everyone afterwards.', vi: 'Sau cuộc họp cô ấy gửi biên bản cho mọi người.' },
  ],
  deadline: [
    { en: 'We need to meet the deadline — no extensions.', vi: 'Chúng ta phải đáp ứng hạn chót — không gia hạn.' },
    { en: 'He always finishes his work before the deadline.', vi: 'Anh ấy luôn hoàn thành công việc trước hạn chót.' },
  ],
  budget: [
    { en: 'We have a limited budget for this project.', vi: 'Chúng ta có ngân sách hạn hẹp cho dự án này.' },
    { en: 'She managed the team budget very carefully.', vi: 'Cô ấy quản lý ngân sách nhóm rất cẩn thận.' },
  ],
  contract: [
    { en: 'Read the entire contract carefully before you sign.', vi: 'Đọc kỹ toàn bộ hợp đồng trước khi ký.' },
    { en: 'The contract expires at the end of the year.', vi: 'Hợp đồng hết hạn vào cuối năm.' },
  ],
  salary: [
    { en: 'She negotiated a higher salary at her new job.', vi: 'Cô ấy thương lượng mức lương cao hơn ở công việc mới.' },
    { en: 'His salary is paid on the first day of each month.', vi: 'Lương của anh ấy được trả vào ngày đầu tiên mỗi tháng.' },
  ],
  profit: [
    { en: 'The company reported its highest profit in ten years.', vi: 'Công ty báo cáo lợi nhuận cao nhất trong mười năm.' },
    { en: 'They shared the profit equally among all partners.', vi: 'Họ chia đều lợi nhuận cho tất cả các đối tác.' },
  ],
  market: [
    { en: 'The property market is booming in major cities.', vi: 'Thị trường bất động sản đang bùng nổ ở các thành phố lớn.' },
    { en: 'She researched the market thoroughly before launching the product.', vi: 'Cô ấy nghiên cứu thị trường kỹ lưỡng trước khi ra mắt sản phẩm.' },
  ],
  client: [
    { en: 'The client changed the requirements at the last minute.', vi: 'Khách hàng thay đổi yêu cầu vào phút chót.' },
    { en: 'We must always keep the client satisfied.', vi: 'Chúng ta phải luôn giữ cho khách hàng hài lòng.' },
  ],
  project: [
    { en: 'The project took the whole team six months to complete.', vi: 'Dự án mất cả nhóm sáu tháng để hoàn thành.' },
    { en: 'She was appointed as the new project leader.', vi: 'Cô ấy được bổ nhiệm là trưởng dự án mới.' },
  ],
  manager: [
    { en: 'The manager praised the whole team for the great results.', vi: 'Quản lý khen cả nhóm vì kết quả tốt.' },
    { en: 'He has been a project manager for five years.', vi: 'Anh ấy đã làm quản lý dự án được năm năm.' },
  ],
  invoice: [
    { en: 'Send the invoice to the client after the work is done.', vi: 'Gửi hóa đơn cho khách hàng sau khi hoàn thành công việc.' },
    { en: 'The invoice must include the tax amount.', vi: 'Hóa đơn phải ghi rõ số tiền thuế.' },
  ],
  report: [
    { en: 'She writes a detailed weekly report for her manager.', vi: 'Cô ấy viết báo cáo tuần chi tiết cho quản lý.' },
    { en: 'The financial report showed very good results.', vi: 'Báo cáo tài chính cho thấy kết quả rất tốt.' },
  ],
  strategy: [
    { en: 'We need a clear and practical growth strategy.', vi: 'Chúng ta cần chiến lược tăng trưởng rõ ràng và thực tế.' },
    { en: 'The new marketing strategy worked better than expected.', vi: 'Chiến lược marketing mới hiệu quả hơn dự kiến.' },
  ],
  negotiation: [
    { en: 'The price negotiation took over three hours.', vi: 'Cuộc đàm phán giá kéo dài hơn ba tiếng.' },
    { en: 'Good communication skills are essential in any negotiation.', vi: 'Kỹ năng giao tiếp tốt rất cần thiết trong đàm phán.' },
  ],
  presentation: [
    { en: 'His presentation was clear, confident and engaging.', vi: 'Bài thuyết trình của anh ấy rõ ràng, tự tin và thu hút.' },
    { en: 'She practised her presentation in front of the mirror many times.', vi: 'Cô ấy luyện thuyết trình trước gương nhiều lần.' },
  ],
  expense: [
    { en: 'Keep all your receipts for the monthly expense report.', vi: 'Giữ tất cả hóa đơn cho báo cáo chi phí tháng.' },
    { en: 'All company expenses must be approved by the manager.', vi: 'Mọi chi phí của công ty phải được quản lý phê duyệt.' },
  ],
  revenue: [
    { en: 'Revenue grew by thirty percent compared to last year.', vi: 'Doanh thu tăng ba mươi phần trăm so với năm ngoái.' },
    { en: 'The new product line boosted revenue significantly.', vi: 'Dòng sản phẩm mới đã tăng doanh thu đáng kể.' },
  ],
  partnership: [
    { en: 'They formed a strategic partnership to expand to new markets.', vi: 'Họ hình thành quan hệ đối tác chiến lược để mở rộng sang thị trường mới.' },
    { en: 'Our partnership with the NGO was a great success.', vi: 'Quan hệ đối tác với tổ chức phi chính phủ rất thành công.' },
  ],
  startup: [
    { en: 'She built her startup from zero with just one laptop.', vi: 'Cô ấy xây dựng startup từ con số không chỉ với một chiếc laptop.' },
    { en: 'Many young people in Vietnam dream of running a startup.', vi: 'Nhiều bạn trẻ Việt Nam mơ ước điều hành một startup.' },
  ],
  office: [
    { en: 'She decorated her office with plants and family photos.', vi: 'Cô ấy trang trí văn phòng bằng cây xanh và ảnh gia đình.' },
    { en: 'The new office has a wonderful view of the river.', vi: 'Văn phòng mới có tầm nhìn tuyệt đẹp ra sông.' },
  ],

  // ── Bạn bè & xã hội ───────────────────────────────────────────
  friend: [
    { en: 'A true friend stays with you through the hard times.', vi: 'Bạn thật sự ở bên bạn qua những lúc khó khăn.' },
    { en: 'She made many new friends at her new school.', vi: 'Cô ấy kết bạn nhiều ở trường mới.' },
  ],
  buddy: [
    { en: 'He asked his buddy to help him move to the new flat.', vi: 'Anh ấy nhờ bạn thân giúp chuyển đến căn hộ mới.' },
    { en: 'Having a study buddy keeps you motivated.', vi: 'Có bạn học cùng giúp bạn duy trì động lực.' },
  ],
  classmate: [
    { en: 'She and her classmate study together every weekend.', vi: 'Cô ấy và bạn cùng lớp học chung mỗi cuối tuần.' },
    { en: 'I still keep in touch with my old classmates.', vi: 'Tôi vẫn giữ liên lạc với những bạn cũ.' },
  ],
  colleague: [
    { en: 'She asked her colleague for advice on the project.', vi: 'Cô ấy hỏi ý kiến đồng nghiệp về dự án.' },
    { en: 'He had lunch with his colleagues every day.', vi: 'Anh ấy ăn trưa cùng đồng nghiệp mỗi ngày.' },
  ],
  neighbor: [
    { en: 'They helped their neighbor when she was ill.', vi: 'Họ giúp đỡ hàng xóm khi bà ấy ốm.' },
    { en: 'Good neighbors make everyday life much better.', vi: 'Hàng xóm tốt làm cho cuộc sống hàng ngày tốt hơn nhiều.' },
  ],
  stranger: [
    { en: 'Be kind to strangers — you never know their story.', vi: 'Hãy tử tế với người lạ — bạn không biết câu chuyện của họ.' },
    { en: 'A stranger offered to carry her heavy bags.', vi: 'Một người lạ đề nghị mang giúp túi nặng của cô.' },
  ],
  group: [
    { en: 'She joined a study group on Saturday mornings.', vi: 'Cô ấy tham gia một nhóm học vào sáng thứ Bảy.' },
    { en: 'They split into small groups for the workshop activity.', vi: 'Họ chia thành các nhóm nhỏ cho hoạt động hội thảo.' },
  ],
  team: [
    { en: 'Teamwork makes the dream work.', vi: 'Làm việc nhóm giúp biến ước mơ thành hiện thực.' },
    { en: 'She is the most valuable member of the team.', vi: 'Cô ấy là thành viên có giá trị nhất của nhóm.' },
  ],
  member: [
    { en: 'He became a member of the book club last month.', vi: 'Anh ấy trở thành thành viên của câu lạc bộ đọc sách tháng trước.' },
    { en: 'All members must follow the group rules.', vi: 'Tất cả thành viên phải tuân theo quy định nhóm.' },
  ],
  community: [
    { en: 'Volunteering is one of the best ways to help the community.', vi: 'Tình nguyện là một trong những cách tốt nhất để giúp cộng đồng.' },
    { en: 'She feels a strong sense of belonging in her community.', vi: 'Cô ấy cảm thấy thuộc về cộng đồng của mình rất mạnh mẽ.' },
  ],
  society: [
    { en: 'Good education improves society as a whole.', vi: 'Giáo dục tốt cải thiện xã hội nói chung.' },
    { en: 'We all have a role to play in making society better.', vi: 'Tất cả chúng ta đều có vai trò trong việc làm cho xã hội tốt hơn.' },
  ],
  relationship: [
    { en: 'Building a strong relationship takes time and effort.', vi: 'Xây dựng mối quan hệ bền vững cần thời gian và nỗ lực.' },
    { en: 'They have a strong professional relationship.', vi: 'Họ có mối quan hệ công việc vững chắc.' },
  ],
  trust: [
    { en: 'Trust is the true foundation of any friendship.', vi: 'Tin tưởng là nền tảng thực sự của tình bạn.' },
    { en: 'She trusted him completely with her secret.', vi: 'Cô ấy hoàn toàn tin tưởng anh ấy với bí mật của mình.' },
  ],
  invite: [
    { en: 'He invited all his classmates to his birthday party.', vi: 'Anh ấy mời tất cả bạn cùng lớp đến tiệc sinh nhật.' },
    { en: 'We were all invited to the company annual dinner.', vi: 'Tất cả chúng tôi được mời đến bữa tối thường niên của công ty.' },
  ],
  introduce: [
    { en: 'She confidently introduced herself to the new team.', vi: 'Cô ấy tự tin giới thiệu bản thân với nhóm mới.' },
    { en: 'Let me introduce you to my manager.', vi: 'Để tôi giới thiệu bạn với quản lý của tôi.' },
  ],
  chat: [
    { en: 'They chatted about their weekend plans over coffee.', vi: 'Họ nói chuyện về kế hoạch cuối tuần trong lúc uống cà phê.' },
    { en: 'She chats online with her friends every evening.', vi: 'Cô ấy nhắn tin với bạn bè mỗi tối.' },
  ],
  share: [
    { en: 'He shared his lunch with a colleague who forgot theirs.', vi: 'Anh ấy chia bữa trưa với đồng nghiệp quên đem cơm.' },
    { en: 'Share both your success and your challenges with your team.', vi: 'Chia sẻ cả thành công lẫn khó khăn với nhóm của bạn.' },
  ],
  together: [
    { en: 'We study together every evening at the library.', vi: 'Chúng tôi cùng nhau học mỗi tối ở thư viện.' },
    { en: 'Together, we can achieve much more.', vi: 'Cùng nhau, chúng ta có thể đạt được nhiều hơn.' },
  ],
  care: [
    { en: 'She cares deeply about her friends\' well-being.', vi: 'Cô ấy quan tâm sâu sắc đến sức khoẻ của bạn bè.' },
    { en: 'He takes great care of his elderly parents.', vi: 'Anh ấy chăm sóc tận tình cha mẹ già.' },
  ],
  support: [
    { en: 'Family support is very important during hard times.', vi: 'Sự hỗ trợ của gia đình rất quan trọng trong lúc khó khăn.' },
    { en: 'She always supports local small businesses.', vi: 'Cô ấy luôn ủng hộ các doanh nghiệp nhỏ địa phương.' },
  ],

  // ── Trường học & lớp học ──────────────────────────────────────
  class: [
    { en: 'She missed class because she was sick.', vi: 'Cô ấy nghỉ học vì bị ốm.' },
    { en: 'The class finished thirty minutes early today.', vi: 'Tiết học hôm nay kết thúc sớm ba mươi phút.' },
  ],
  classroom: [
    { en: 'The classroom was very quiet during the final exam.', vi: 'Phòng học rất yên tĩnh trong suốt kỳ thi cuối kỳ.' },
    { en: 'She rearranged the classroom for the group presentation.', vi: 'Cô ấy sắp xếp lại phòng học cho buổi thuyết trình nhóm.' },
  ],
  lesson: [
    { en: 'The lesson started exactly at eight o\'clock.', vi: 'Bài học bắt đầu đúng lúc tám giờ.' },
    { en: 'Life teaches us valuable lessons every single day.', vi: 'Cuộc sống dạy chúng ta những bài học quý giá mỗi ngày.' },
  ],
  teacher: [
    { en: 'A great teacher has the power to change lives.', vi: 'Một người thầy giỏi có sức mạnh thay đổi cuộc đời.' },
    { en: 'The teacher explained the grammar rule very clearly.', vi: 'Giáo viên giải thích quy tắc ngữ pháp rất rõ ràng.' },
  ],
  student: [
    { en: 'She was an outstanding student throughout her school years.', vi: 'Cô ấy là học sinh xuất sắc suốt những năm đi học.' },
    { en: 'Every student learns at a different pace and that is fine.', vi: 'Mỗi học sinh học theo tốc độ khác nhau và điều đó bình thường.' },
  ],
  study: [
    { en: 'He stayed up late to study for the important exam.', vi: 'Anh ấy thức khuya để ôn thi cho kỳ thi quan trọng.' },
    { en: 'She studies much better in a quiet environment.', vi: 'Cô ấy học hiệu quả hơn trong môi trường yên tĩnh.' },
  ],
  homework: [
    { en: 'She does her homework right after coming home from school.', vi: 'Cô ấy làm bài tập ngay sau khi về nhà từ trường.' },
    { en: 'He forgot to bring his homework to class.', vi: 'Anh ấy quên mang bài tập đến lớp.' },
  ],
  exam: [
    { en: 'She prepared for the final exam for two full weeks.', vi: 'Cô ấy ôn thi cuối kỳ trong hai tuần đầy đủ.' },
    { en: 'The exam covers all three chapters we studied.', vi: 'Bài thi bao gồm cả ba chương chúng ta đã học.' },
  ],
  grade: [
    { en: 'She improved her grade from a C to an A this semester.', vi: 'Cô ấy cải thiện điểm số từ C lên A học kỳ này.' },
    { en: 'Getting good grades is not the only goal of education.', vi: 'Điểm số tốt không phải là mục tiêu duy nhất của giáo dục.' },
  ],
  subject: [
    { en: 'She finds the maths subject the most challenging.', vi: 'Cô ấy thấy môn toán là khó nhất.' },
    { en: 'Which subject do you find the hardest at school?', vi: 'Bạn thấy môn học nào ở trường khó nhất?' },
  ],
  notebook: [
    { en: 'He filled three notebooks with notes during the semester.', vi: 'Anh ấy lấp đầy ba quyển vở trong suốt học kỳ.' },
    { en: 'She colour-codes her notebook for each different subject.', vi: 'Cô ấy dùng màu khác nhau trong vở cho từng môn học.' },
  ],
  library: [
    { en: 'The school library is open from seven to nine every evening.', vi: 'Thư viện trường mở cửa từ bảy đến chín giờ tối.' },
    { en: 'She spent the whole afternoon studying quietly in the library.', vi: 'Cô ấy dành cả buổi chiều học yên tĩnh trong thư viện.' },
  ],
  university: [
    { en: 'She was accepted into the top university in the country.', vi: 'Cô ấy được nhận vào trường đại học hàng đầu cả nước.' },
    { en: 'He worked part-time while studying at university.', vi: 'Anh ấy làm thêm trong khi học đại học.' },
  ],
  practice: [
    { en: 'The more you practise, the more confident you become.', vi: 'Luyện tập càng nhiều, bạn càng tự tin.' },
    { en: 'She practises speaking English with her friends every day.', vi: 'Cô ấy luyện nói tiếng Anh với bạn bè mỗi ngày.' },
  ],
  question: [
    { en: 'He raised his hand confidently to ask a question.', vi: 'Anh ấy tự tin giơ tay hỏi câu hỏi.' },
    { en: 'A thoughtful question shows that you are really thinking.', vi: 'Một câu hỏi sâu sắc cho thấy bạn đang thực sự suy nghĩ.' },
  ],
  answer: [
    { en: 'The correct answer was on the tip of her tongue.', vi: 'Câu trả lời đúng đang ở đầu lưỡi của cô ấy.' },
    { en: 'She answered every question in the exam correctly.', vi: 'Cô ấy trả lời đúng tất cả câu hỏi trong bài thi.' },
  ],
  board: [
    { en: 'The teacher erased the board and started a new topic.', vi: 'Giáo viên xoá bảng và bắt đầu chủ đề mới.' },
    { en: 'She wrote the homework assignment on the board.', vi: 'Cô ấy viết bài tập lên bảng.' },
  ],
  schedule: [
    { en: 'She checked her schedule and found a free slot on Thursday.', vi: 'Cô ấy xem lịch và tìm thấy khoảng trống vào thứ Năm.' },
    { en: 'The class schedule changes at the start of each new semester.', vi: 'Thời khoá biểu thay đổi vào đầu mỗi học kỳ mới.' },
  ],
  knowledge: [
    { en: 'Reading widely is the best way to gain knowledge.', vi: 'Đọc rộng là cách tốt nhất để tích lũy kiến thức.' },
    { en: 'He shared his knowledge freely with everyone around him.', vi: 'Anh ấy chia sẻ kiến thức của mình một cách rộng rãi với mọi người.' },
  ],
}
