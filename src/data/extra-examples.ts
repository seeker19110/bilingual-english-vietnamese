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

  // ── Bổ sung: Thứ trong tuần còn thiếu ────────────────────────────────
  Tuesday: [
    { en: 'She has a dentist appointment every Tuesday.', vi: 'Cô ấy có lịch hẹn nha sĩ mỗi thứ Ba.' },
    { en: 'Tuesday is the second day of the working week.', vi: 'Thứ Ba là ngày thứ hai của tuần làm việc.' },
  ],
  Wednesday: [
    { en: 'We always have team lunch on Wednesday.', vi: 'Chúng tôi luôn ăn trưa nhóm vào thứ Tư.' },
    { en: 'Wednesday is exactly the middle of the week.', vi: 'Thứ Tư chính xác là giữa tuần.' },
  ],
  Thursday: [
    { en: 'The weekly report is due every Thursday.', vi: 'Báo cáo tuần đến hạn vào mỗi thứ Năm.' },
    { en: 'I go to the gym every Thursday evening.', vi: 'Tôi đi phòng gym mỗi tối thứ Năm.' },
  ],

  // ── Vòng 18: Thời tiết & mùa ─────────────────────────────────────────
  weather: [
    { en: 'The weather app says it will rain tomorrow.', vi: 'Ứng dụng thời tiết nói ngày mai sẽ mưa.' },
    { en: 'Hot weather makes me feel sleepy.', vi: 'Thời tiết nóng làm tôi buồn ngủ.' },
  ],
  sunny: [
    { en: 'Let\'s have a picnic on this sunny afternoon.', vi: 'Hãy đi dã ngoại vào buổi chiều nắng đẹp này.' },
    { en: 'The children played outside on the sunny day.', vi: 'Lũ trẻ chơi ngoài trời vào ngày nắng.' },
  ],
  cloudy: [
    { en: 'It was cloudy all day but it did not rain.', vi: 'Trời nhiều mây cả ngày nhưng không mưa.' },
    { en: 'A cloudy sky often means rain is coming.', vi: 'Trời nhiều mây thường có nghĩa là sắp mưa.' },
  ],
  rainy: [
    { en: 'I love rainy days because I can stay inside and read.', vi: 'Tôi thích ngày mưa vì có thể ở nhà đọc sách.' },
    { en: 'It was a rainy weekend, so we stayed home.', vi: 'Cuối tuần trời mưa nên chúng tôi ở nhà.' },
  ],
  windy: [
    { en: 'It was so windy that my umbrella turned inside out.', vi: 'Gió to đến mức ô tôi bị lộn ngược.' },
    { en: 'Flying a kite is fun on a windy day.', vi: 'Thả diều rất vui vào ngày có gió.' },
  ],
  foggy: [
    { en: 'Drive slowly when it is foggy.', vi: 'Lái xe chậm thôi khi trời có sương mù.' },
    { en: 'The foggy morning made everything look mysterious.', vi: 'Buổi sáng sương mù làm mọi thứ trông huyền bí.' },
  ],
  storm: [
    { en: 'The storm knocked down several trees in the park.', vi: 'Cơn bão làm đổ vài cây trong công viên.' },
    { en: 'Stay inside during a storm to stay safe.', vi: 'Ở trong nhà trong cơn bão để an toàn.' },
  ],
  lightning: [
    { en: 'Never stand under a tree during lightning.', vi: 'Đừng bao giờ đứng dưới cây khi có sét.' },
    { en: 'Lightning flashed across the sky before the thunder came.', vi: 'Sét lóe sáng trên bầu trời trước khi sấm vang.' },
  ],
  temperature: [
    { en: 'The temperature will reach forty degrees this weekend.', vi: 'Nhiệt độ sẽ đạt bốn mươi độ cuối tuần này.' },
    { en: 'Check the temperature before deciding what to wear.', vi: 'Kiểm tra nhiệt độ trước khi quyết định mặc gì.' },
  ],
  forecast: [
    { en: 'The forecast says there will be thunderstorms on Friday.', vi: 'Dự báo nói thứ Sáu sẽ có giông bão.' },
    { en: 'I always check the forecast before going on a trip.', vi: 'Tôi luôn kiểm tra dự báo trước khi đi du lịch.' },
  ],
  season: [
    { en: 'My favourite season is autumn because of the cool air.', vi: 'Mùa yêu thích của tôi là mùa thu vì không khí mát.' },
    { en: 'Each season brings different fruits and vegetables.', vi: 'Mỗi mùa mang lại rau củ quả khác nhau.' },
  ],
  spring: [
    { en: 'People go out more in spring after the long cold winter.', vi: 'Mọi người ra ngoài nhiều hơn vào mùa xuân sau mùa đông dài lạnh.' },
    { en: 'The park is most beautiful in spring when flowers bloom.', vi: 'Công viên đẹp nhất vào mùa xuân khi hoa nở.' },
  ],
  summer: [
    { en: 'We go to the beach every summer holiday.', vi: 'Chúng tôi đi biển mỗi kỳ nghỉ hè.' },
    { en: 'Summer evenings are perfect for outdoor barbecues.', vi: 'Buổi tối mùa hè rất thích hợp để nướng thịt ngoài trời.' },
  ],
  autumn: [
    { en: 'The trees turn red and yellow in autumn.', vi: 'Cây cối chuyển sang màu đỏ và vàng vào mùa thu.' },
    { en: 'Autumn is the best time for hiking in the mountains.', vi: 'Mùa thu là thời điểm tốt nhất để leo núi.' },
  ],
  winter: [
    { en: 'We wear thick coats and scarves in winter.', vi: 'Chúng tôi mặc áo dày và quàng khăn vào mùa đông.' },
    { en: 'Children love building snowmen in winter.', vi: 'Trẻ em thích đắp người tuyết vào mùa đông.' },
  ],
  wet: [
    { en: 'Wipe your feet on the mat — the floor is wet.', vi: 'Chùi chân lên thảm — sàn nhà ướt.' },
    { en: 'The wet grass made our shoes muddy.', vi: 'Cỏ ướt làm giày chúng tôi bị bùn.' },
  ],
  dry: [
    { en: 'Hang your clothes outside to dry in the sun.', vi: 'Phơi quần áo ra ngoài cho khô dưới nắng.' },
    { en: 'The soil is too dry — the plants need water.', vi: 'Đất quá khô — cây cần nước.' },
  ],
  rainbow: [
    { en: 'The children ran outside to see the rainbow.', vi: 'Lũ trẻ chạy ra ngoài để ngắm cầu vồng.' },
    { en: 'A rainbow has seven colours: red, orange, yellow, green, blue, indigo, violet.', vi: 'Cầu vồng có bảy màu: đỏ, cam, vàng, lục, lam, chàm, tím.' },
  ],
  degree: [
    { en: 'The water boils at one hundred degrees Celsius.', vi: 'Nước sôi ở một trăm độ C.' },
    { en: 'It dropped to minus five degrees last night.', vi: 'Nhiệt độ xuống âm năm độ tối qua.' },
  ],
  breeze: [
    { en: 'A gentle breeze kept us cool on the hot day.', vi: 'Làn gió nhẹ giúp chúng tôi mát mẻ vào ngày nóng.' },
    { en: 'Sit by the window and enjoy the evening breeze.', vi: 'Ngồi cạnh cửa sổ và tận hưởng làn gió chiều.' },
  ],

  // ── Vòng 19: Quần áo ─────────────────────────────────────────────────
  clothes: [
    { en: 'She laid out her clothes the night before school.', vi: 'Cô bé chuẩn bị quần áo tối hôm trước ngày đi học.' },
    { en: 'We donate old clothes to people in need.', vi: 'Chúng tôi quyên góp quần áo cũ cho người cần.' },
  ],
  shirt: [
    { en: 'He ironed his shirt before the job interview.', vi: 'Anh ấy là áo sơ mi trước buổi phỏng vấn.' },
    { en: 'She spilled coffee on her white shirt.', vi: 'Cô ấy đổ cà phê lên áo trắng.' },
  ],
  pants: [
    { en: 'He bought a new pair of pants for the meeting.', vi: 'Anh ấy mua một chiếc quần mới cho buổi họp.' },
    { en: 'These pants have deep pockets — very useful.', vi: 'Cái quần này có túi sâu — rất tiện.' },
  ],
  dress: [
    { en: 'She wore a long red dress to the wedding.', vi: 'Cô ấy mặc váy đỏ dài đi đám cưới.' },
    { en: 'The dress in the shop window caught her eye.', vi: 'Cái váy trong tủ kính cửa hàng thu hút ánh mắt cô ấy.' },
  ],
  shoes: [
    { en: 'Always tie your shoelaces before running.', vi: 'Luôn buộc dây giày trước khi chạy.' },
    { en: 'She tried on several pairs of shoes before choosing.', vi: 'Cô ấy thử nhiều đôi giày trước khi chọn.' },
  ],
  hat: [
    { en: 'He tilted his hat to shade his eyes from the sun.', vi: 'Anh ấy nghiêng mũ che mắt khỏi nắng.' },
    { en: 'She knitted a warm hat for winter.', vi: 'Cô ấy đan một cái mũ ấm cho mùa đông.' },
  ],
  jacket: [
    { en: 'Grab your jacket — it is chilly outside.', vi: 'Lấy áo khoác đi — bên ngoài lạnh đấy.' },
    { en: 'He left his jacket on the train by accident.', vi: 'Anh ấy vô tình để quên áo khoác trên tàu.' },
  ],
  coat: [
    { en: 'She bought a long wool coat for winter.', vi: 'Cô ấy mua áo khoác dài bằng len cho mùa đông.' },
    { en: 'Hang your coat on the hook behind the door.', vi: 'Treo áo khoác lên móc phía sau cửa.' },
  ],
  socks: [
    { en: 'Always wear clean socks to keep your feet fresh.', vi: 'Luôn mang tất sạch để giữ chân thoáng mát.' },
    { en: 'He could never find matching socks in the morning.', vi: 'Buổi sáng anh ấy không bao giờ tìm được đôi tất đôi.' },
  ],
  glasses: [
    { en: 'She put on her glasses to read the small print.', vi: 'Cô ấy đeo kính để đọc chữ nhỏ.' },
    { en: 'He scratched his glasses while cleaning them.', vi: 'Anh ấy làm trầy kính khi lau.' },
  ],
  wear: [
    { en: 'You should wear a helmet when riding a bicycle.', vi: 'Bạn nên đội mũ bảo hiểm khi đi xe đạp.' },
    { en: 'She wears the same ring every single day.', vi: 'Cô ấy đeo chiếc nhẫn đó mỗi ngày.' },
  ],
  size: [
    { en: 'This shirt fits perfectly — it is the right size.', vi: 'Cái áo này vừa đúng cỡ.' },
    { en: 'Could you check if you have a smaller size?', vi: 'Bạn có thể kiểm tra xem có cỡ nhỏ hơn không?' },
  ],
  style: [
    { en: 'Her style is simple but always elegant.', vi: 'Phong cách của cô ấy đơn giản nhưng luôn thanh lịch.' },
    { en: 'He developed his own unique style over the years.', vi: 'Anh ấy đã tạo ra phong cách riêng độc đáo qua năm tháng.' },
  ],
  uniform: [
    { en: 'The school uniform makes everyone look the same.', vi: 'Đồng phục trường làm mọi người trông giống nhau.' },
    { en: 'She ironed her uniform carefully every Sunday night.', vi: 'Cô ấy là đồng phục cẩn thận mỗi tối Chủ nhật.' },
  ],
  suit: [
    { en: 'He looked professional in his grey suit.', vi: 'Anh ấy trông chuyên nghiệp trong bộ vest xám.' },
    { en: 'She bought a new suit for the business trip.', vi: 'Cô ấy mua bộ vest mới cho chuyến công tác.' },
  ],
  boots: [
    { en: 'She put on her rain boots before going outside.', vi: 'Cô ấy đi ủng mưa trước khi ra ngoài.' },
    { en: 'His leather boots lasted over ten years.', vi: 'Đôi ủng da của anh ấy dùng được hơn mười năm.' },
  ],
  scarf: [
    { en: 'She wrapped a warm scarf around her neck in the cold.', vi: 'Cô ấy quấn khăn ấm quanh cổ trong thời tiết lạnh.' },
    { en: 'He used his scarf as a makeshift bandage.', vi: 'Anh ấy dùng khăn quàng làm băng tạm thời.' },
  ],
  skirt: [
    { en: 'She paired a floral skirt with a white top.', vi: 'Cô ấy kết hợp váy hoa với áo trắng.' },
    { en: 'The wind blew her skirt up — she laughed.', vi: 'Gió thổi váy cô ấy bay lên — cô ấy cười.' },
  ],
  sleeve: [
    { en: 'He rolled up his sleeves and got to work.', vi: 'Anh ấy xắn tay áo và bắt tay vào việc.' },
    { en: 'The sleeve of her shirt got caught on the door handle.', vi: 'Tay áo cô ấy bị vướng vào tay nắm cửa.' },
  ],
  button: [
    { en: 'She sewed the button back on carefully.', vi: 'Cô ấy cẩn thận đính lại nút áo.' },
    { en: 'Press the green button to start the machine.', vi: 'Nhấn nút màu xanh để khởi động máy.' },
  ],

  // ── Vòng 20: Giao thông & đi lại ─────────────────────────────────────
  bus: [
    { en: 'The bus was late so I arrived at work after nine.', vi: 'Xe buýt trễ nên tôi đến cơ quan sau chín giờ.' },
    { en: 'Take bus number five to get to the city centre.', vi: 'Đi xe buýt số năm để đến trung tâm thành phố.' },
  ],
  train: [
    { en: 'The high-speed train travels at three hundred kilometres per hour.', vi: 'Tàu tốc độ cao chạy ở ba trăm km mỗi giờ.' },
    { en: 'I missed the last train and had to take a taxi.', vi: 'Tôi lỡ chuyến tàu cuối và phải đi taxi.' },
  ],
  taxi: [
    { en: 'She called a taxi to get home after the party.', vi: 'Cô ấy gọi taxi về nhà sau bữa tiệc.' },
    { en: 'Taxis are more expensive but much more convenient.', vi: 'Taxi đắt hơn nhưng tiện hơn nhiều.' },
  ],
  plane: [
    { en: 'The plane landed smoothly despite the bad weather.', vi: 'Máy bay hạ cánh êm dù thời tiết xấu.' },
    { en: 'She watched the plane disappear into the clouds.', vi: 'Cô ấy nhìn máy bay biến mất vào mây.' },
  ],
  motorcycle: [
    { en: 'He weaved through the traffic on his motorcycle.', vi: 'Anh ấy lách qua dòng xe bằng xe máy.' },
    { en: 'Always wear a helmet when riding a motorcycle.', vi: 'Luôn đội mũ bảo hiểm khi đi xe máy.' },
  ],
  walk: [
    { en: 'It is a pleasant ten-minute walk to the park.', vi: 'Đi bộ mười phút dễ chịu đến công viên.' },
    { en: 'She walks her dog twice a day in the neighbourhood.', vi: 'Cô ấy dắt chó đi bộ hai lần mỗi ngày trong khu phố.' },
  ],
  drive: [
    { en: 'He learned to drive when he was eighteen.', vi: 'Anh ấy học lái xe khi mười tám tuổi.' },
    { en: 'Never drive when you are tired or sleepy.', vi: 'Không bao giờ lái xe khi mệt hay buồn ngủ.' },
  ],
  ride: [
    { en: 'She rides the bus to university every day.', vi: 'Cô ấy đi xe buýt lên đại học mỗi ngày.' },
    { en: 'He gave me a ride home after the meeting.', vi: 'Anh ấy cho tôi đi nhờ về nhà sau buổi họp.' },
  ],
  station: [
    { en: 'The train station is very crowded at rush hour.', vi: 'Ga tàu rất đông đúc vào giờ cao điểm.' },
    { en: 'Meet me at the main entrance of the station.', vi: 'Gặp tôi ở lối vào chính của ga nhé.' },
  ],
  airport: [
    { en: 'We arrived at the airport two hours before the flight.', vi: 'Chúng tôi đến sân bay hai tiếng trước giờ bay.' },
    { en: 'The airport has free Wi-Fi for all passengers.', vi: 'Sân bay có Wi-Fi miễn phí cho tất cả hành khách.' },
  ],
  ticket: [
    { en: 'I booked two train tickets online last night.', vi: 'Tôi đặt hai vé tàu online tối hôm qua.' },
    { en: 'Keep your ticket safe — you need it to exit.', vi: 'Giữ vé cẩn thận — bạn cần nó để ra cửa.' },
  ],
  map: [
    { en: 'She used a map on her phone to find the restaurant.', vi: 'Cô ấy dùng bản đồ trên điện thoại để tìm nhà hàng.' },
    { en: 'Print a map in case your phone battery dies.', vi: 'In bản đồ đề phòng điện thoại hết pin.' },
  ],
  direction: [
    { en: 'The police officer gave us clear directions to the hotel.', vi: 'Cảnh sát chỉ đường rõ ràng đến khách sạn cho chúng tôi.' },
    { en: 'I got confused because the directions were wrong.', vi: 'Tôi bị lạc vì chỉ đường sai.' },
  ],
  left: [
    { en: 'The post office is on the left side of the road.', vi: 'Bưu điện ở bên trái đường.' },
    { en: 'She turned left at the junction and found the cafe.', vi: 'Cô ấy rẽ trái ở ngã tư và tìm được quán cà phê.' },
  ],
  right: [
    { en: 'Turn right after the traffic lights.', vi: 'Rẽ phải sau đèn giao thông.' },
    { en: 'The supermarket is on the right — you cannot miss it.', vi: 'Siêu thị ở bên phải — bạn không thể bỏ lỡ đâu.' },
  ],
  straight: [
    { en: 'Go straight ahead and you will see the park.', vi: 'Đi thẳng và bạn sẽ thấy công viên.' },
    { en: 'Keep going straight for about five minutes.', vi: 'Cứ đi thẳng khoảng năm phút.' },
  ],
  traffic: [
    { en: 'Avoid the highway during rush-hour traffic.', vi: 'Tránh đường cao tốc vào giờ kẹt xe.' },
    { en: 'The traffic is much lighter on Sundays.', vi: 'Giao thông thưa hơn nhiều vào Chủ nhật.' },
  ],
  journey: [
    { en: 'The journey from Hanoi to Ho Chi Minh City takes two hours by plane.', vi: 'Hành trình từ Hà Nội đến TP.HCM mất hai tiếng bằng máy bay.' },
    { en: 'Learning a language is a long journey but worth it.', vi: 'Học ngôn ngữ là hành trình dài nhưng xứng đáng.' },
  ],
  fuel: [
    { en: 'The fuel warning light came on, so I stopped at a petrol station.', vi: 'Đèn báo xăng bật sáng nên tôi dừng vào trạm xăng.' },
    { en: 'Electric cars use electricity instead of fuel.', vi: 'Xe điện dùng điện thay vì xăng.' },
  ],
  parking: [
    { en: 'Parking in the city centre is very expensive.', vi: 'Đỗ xe ở trung tâm thành phố rất đắt.' },
    { en: 'There is free parking behind the shopping centre.', vi: 'Có bãi đậu xe miễn phí phía sau trung tâm mua sắm.' },
  ],

  // ── Vòng 21: Cảm xúc & trạng thái ───────────────────────────────────
  feel: [
    { en: 'I feel much better after a good night\'s sleep.', vi: 'Tôi cảm thấy tốt hơn nhiều sau một giấc ngủ ngon.' },
    { en: 'She felt proud when her son graduated.', vi: 'Cô ấy cảm thấy tự hào khi con trai tốt nghiệp.' },
  ],
  emotion: [
    { en: 'Music can trigger strong emotions.', vi: 'Âm nhạc có thể kích thích cảm xúc mạnh mẽ.' },
    { en: 'Learning to manage your emotions is important for life.', vi: 'Học cách kiểm soát cảm xúc rất quan trọng trong cuộc sống.' },
  ],
  angry: [
    { en: 'He was angry when he found out the truth.', vi: 'Anh ấy tức giận khi biết sự thật.' },
    { en: 'Take a walk when you feel angry — it helps.', vi: 'Đi bộ khi bạn tức giận — điều đó giúp ích đấy.' },
  ],
  tired: [
    { en: 'She was too tired to cook dinner, so they ordered food.', vi: 'Cô ấy quá mệt để nấu ăn nên họ gọi đồ ăn.' },
    { en: 'I feel tired after the long flight from London.', vi: 'Tôi cảm thấy mệt sau chuyến bay dài từ London.' },
  ],
  excited: [
    { en: 'The children were so excited on Christmas morning.', vi: 'Lũ trẻ rất hào hứng vào sáng Giáng sinh.' },
    { en: 'I am excited about starting my new job next week.', vi: 'Tôi hào hứng về việc bắt đầu công việc mới tuần sau.' },
  ],
  scared: [
    { en: 'She was scared when she heard a noise in the night.', vi: 'Cô ấy sợ khi nghe tiếng động vào ban đêm.' },
    { en: 'He was scared of flying but forced himself to try.', vi: 'Anh ấy sợ đi máy bay nhưng buộc mình phải thử.' },
  ],
  nervous: [
    { en: 'She was nervous on her first day at the new school.', vi: 'Cô ấy hồi hộp trong ngày đầu tiên ở trường mới.' },
    { en: 'He got nervous when speaking in front of a large crowd.', vi: 'Anh ấy hồi hộp khi nói trước đám đông lớn.' },
  ],
  surprised: [
    { en: 'She was surprised to see her old friend at the airport.', vi: 'Cô ấy ngạc nhiên khi gặp bạn cũ ở sân bay.' },
    { en: 'Everyone was surprised by his sudden decision to quit.', vi: 'Mọi người ngạc nhiên trước quyết định bỏ việc đột ngột của anh ấy.' },
  ],
  bored: [
    { en: 'He was bored during the long meeting.', vi: 'Anh ấy chán trong buổi họp dài.' },
    { en: 'Read a book when you are bored — time flies.', vi: 'Đọc sách khi chán — thời gian trôi nhanh lắm.' },
  ],
  proud: [
    { en: 'She was proud when she got the highest score in class.', vi: 'Cô ấy tự hào khi đạt điểm cao nhất lớp.' },
    { en: 'His parents were proud of everything he achieved.', vi: 'Bố mẹ anh ấy tự hào về tất cả những gì anh ấy đạt được.' },
  ],
  lonely: [
    { en: 'Moving to a new city can feel lonely at first.', vi: 'Chuyển đến thành phố mới có thể cảm thấy cô đơn lúc đầu.' },
    { en: 'She felt lonely because all her friends were far away.', vi: 'Cô ấy cảm thấy cô đơn vì tất cả bạn bè đều ở xa.' },
  ],
  grateful: [
    { en: 'I am grateful for every chance I have to learn something new.', vi: 'Tôi biết ơn mỗi cơ hội được học điều gì mới.' },
    { en: 'She wrote a note to say she was grateful for the gift.', vi: 'Cô ấy viết thư để nói rằng cô ấy biết ơn món quà.' },
  ],
  confused: [
    { en: 'The instructions were confusing — I did not know where to start.', vi: 'Hướng dẫn khó hiểu — tôi không biết bắt đầu từ đâu.' },
    { en: 'He looked confused when I asked him that question.', vi: 'Anh ấy trông bối rối khi tôi hỏi câu đó.' },
  ],
  worried: [
    { en: 'She was worried when her son did not come home on time.', vi: 'Cô ấy lo lắng khi con trai không về đúng giờ.' },
    { en: 'Do not be worried — everything will work out fine.', vi: 'Đừng lo lắng — mọi thứ rồi sẽ ổn thôi.' },
  ],
  calm: [
    { en: 'She remained calm even when things went wrong.', vi: 'Cô ấy vẫn bình tĩnh ngay cả khi mọi thứ không ổn.' },
    { en: 'Breathing slowly helps you feel calm in stressful moments.', vi: 'Thở chậm giúp bạn bình tĩnh trong lúc căng thẳng.' },
  ],
  hope: [
    { en: 'I hope the weather is good for the outdoor wedding.', vi: 'Tôi hi vọng thời tiết tốt cho đám cưới ngoài trời.' },
    { en: 'Never lose hope — things always get better eventually.', vi: 'Đừng bao giờ mất hi vọng — mọi thứ rồi sẽ tốt hơn.' },
  ],
  mood: [
    { en: 'Listening to music always improves my mood.', vi: 'Nghe nhạc luôn cải thiện tâm trạng của tôi.' },
    { en: 'She was in a great mood after getting the promotion.', vi: 'Cô ấy có tâm trạng tuyệt vời sau khi được thăng chức.' },
  ],
  stress: [
    { en: 'Too much stress can lead to serious health problems.', vi: 'Quá nhiều căng thẳng có thể gây ra vấn đề sức khỏe nghiêm trọng.' },
    { en: 'Exercise is a great way to reduce daily stress.', vi: 'Tập thể dục là cách tuyệt vời để giảm căng thẳng hàng ngày.' },
  ],
  relax: [
    { en: 'She spent Sunday afternoon relaxing in the garden.', vi: 'Cô ấy dành chiều Chủ nhật thư giãn trong vườn.' },
    { en: 'A warm bath is perfect for relaxing after a long day.', vi: 'Tắm nước ấm rất tuyệt để thư giãn sau ngày dài.' },
  ],
  cry: [
    { en: 'It is okay to cry — letting emotions out is healthy.', vi: 'Khóc không sao — giải phóng cảm xúc là điều tốt.' },
    { en: 'She cried tears of joy at her daughter\'s wedding.', vi: 'Cô ấy khóc vì vui trong đám cưới của con gái.' },
  ],

  // ── Vòng 22: Từ để hỏi & giới từ ─────────────────────────────────────
  what: [
    { en: 'What time does the restaurant close tonight?', vi: 'Nhà hàng tối nay đóng cửa lúc mấy giờ?' },
    { en: 'What is the best way to learn English quickly?', vi: 'Cách tốt nhất để học tiếng Anh nhanh là gì?' },
  ],
  who: [
    { en: 'Who is responsible for this project?', vi: 'Ai chịu trách nhiệm cho dự án này?' },
    { en: 'Who taught you how to cook so well?', vi: 'Ai đã dạy bạn nấu ăn ngon như vậy?' },
  ],
  where: [
    { en: 'Where can I find a good coffee shop nearby?', vi: 'Tôi có thể tìm quán cà phê ngon ở gần đây không?' },
    { en: 'Where are you from originally?', vi: 'Quê gốc của bạn ở đâu?' },
  ],
  when: [
    { en: 'When is the best time to visit this city?', vi: 'Thời điểm tốt nhất để thăm thành phố này là khi nào?' },
    { en: 'When did you arrive in Vietnam?', vi: 'Bạn đến Việt Nam khi nào?' },
  ],
  why: [
    { en: 'Why did you choose to learn Vietnamese?', vi: 'Tại sao bạn chọn học tiếng Việt?' },
    { en: 'Why is this exercise so difficult?', vi: 'Tại sao bài tập này khó vậy?' },
  ],
  how: [
    { en: 'How long does it take to become fluent?', vi: 'Mất bao lâu để nói thành thạo?' },
    { en: 'How do you say "thank you" in Vietnamese?', vi: 'Bạn nói "cảm ơn" bằng tiếng Việt như thế nào?' },
  ],
  which: [
    { en: 'Which restaurant do you recommend for seafood?', vi: 'Bạn gợi ý nhà hàng hải sản nào?' },
    { en: 'Which bus goes to the city centre?', vi: 'Xe buýt nào đi trung tâm thành phố?' },
  ],
  in: [
    { en: 'She lives in a small flat in the city centre.', vi: 'Cô ấy sống trong một căn hộ nhỏ ở trung tâm thành phố.' },
    { en: 'I will be in the office in the morning.', vi: 'Tôi sẽ ở văn phòng vào buổi sáng.' },
  ],
  on: [
    { en: 'The meeting is on Monday at nine.', vi: 'Cuộc họp là vào thứ Hai lúc chín giờ.' },
    { en: 'There is a cat sleeping on the warm roof.', vi: 'Có một con mèo đang ngủ trên mái nhà ấm.' },
  ],
  at: [
    { en: 'She is very good at speaking English.', vi: 'Cô ấy rất giỏi nói tiếng Anh.' },
    { en: 'I will meet you at the front gate at noon.', vi: 'Tôi sẽ gặp bạn ở cổng trước lúc trưa.' },
  ],
  under: [
    { en: 'The dog always hides under the bed during storms.', vi: 'Con chó luôn trốn dưới giường khi có bão.' },
    { en: 'Keep the document under the heavy book.', vi: 'Giữ tài liệu dưới cuốn sách nặng.' },
  ],
  above: [
    { en: 'The temperature above thirty degrees is too hot for me.', vi: 'Nhiệt độ trên ba mươi độ quá nóng với tôi.' },
    { en: 'The birds flew above the clouds.', vi: 'Những con chim bay phía trên mây.' },
  ],
  behind: [
    { en: 'The garden is behind the house — very peaceful.', vi: 'Khu vườn ở phía sau nhà — rất yên bình.' },
    { en: 'Do not fall behind in your studies.', vi: 'Đừng để học tập bị trễ.' },
  ],
  between: [
    { en: 'The café is between the library and the post office.', vi: 'Quán cà phê ở giữa thư viện và bưu điện.' },
    { en: 'Just between us — I am planning a surprise party.', vi: 'Chỉ giữa chúng ta thôi — tôi đang lên kế hoạch tiệc bất ngờ.' },
  ],
  near: [
    { en: 'Is there a pharmacy near this hotel?', vi: 'Gần khách sạn này có nhà thuốc không?' },
    { en: 'She moved to a flat near her workplace.', vi: 'Cô ấy chuyển đến căn hộ gần nơi làm việc.' },
  ],
  far: [
    { en: 'The nearest beach is not far — only twenty minutes away.', vi: 'Bãi biển gần nhất không xa — chỉ hai mươi phút thôi.' },
    { en: 'She has come far since she started learning English.', vi: 'Cô ấy đã tiến bộ nhiều kể từ khi bắt đầu học tiếng Anh.' },
  ],
  through: [
    { en: 'Walk through the tunnel and you will reach the station.', vi: 'Đi qua đường hầm và bạn sẽ đến ga.' },
    { en: 'She learned English through watching movies every night.', vi: 'Cô ấy học tiếng Anh qua việc xem phim mỗi tối.' },
  ],
  across: [
    { en: 'The school is directly across the road from the park.', vi: 'Trường học nằm ngay bên kia đường đối diện công viên.' },
    { en: 'She swam across the river without stopping.', vi: 'Cô ấy bơi qua sông mà không dừng lại.' },
  ],
  with: [
    { en: 'She made the cake with help from her mother.', vi: 'Cô ấy làm bánh với sự giúp đỡ của mẹ.' },
    { en: 'He moved to a new city with his whole family.', vi: 'Anh ấy chuyển đến thành phố mới cùng cả gia đình.' },
  ],
  without: [
    { en: 'She cannot start her day without a cup of coffee.', vi: 'Cô ấy không thể bắt đầu ngày mới nếu thiếu cà phê.' },
    { en: 'He finished the project without asking for any help.', vi: 'Anh ấy hoàn thành dự án mà không nhờ ai giúp.' },
  ],

  // ── Vòng 23: Tiền & mua sắm ──────────────────────────────────────────
  price: [
    { en: 'The price of this laptop is much higher than I expected.', vi: 'Giá của chiếc laptop này cao hơn nhiều so với tôi nghĩ.' },
    { en: 'Can you tell me the price of the room per night?', vi: 'Bạn có thể cho tôi biết giá phòng mỗi đêm không?' },
  ],
  buy: [
    { en: 'She went to the market to buy fresh vegetables.', vi: 'Cô ấy ra chợ mua rau tươi.' },
    { en: 'I buy most of my books online now.', vi: 'Bây giờ tôi mua hầu hết sách trực tuyến.' },
  ],
  sell: [
    { en: 'The farmer sells his produce at the weekend market.', vi: 'Người nông dân bán nông sản ở chợ cuối tuần.' },
    { en: 'She decided to sell her old car and buy a new one.', vi: 'Cô ấy quyết định bán xe cũ và mua xe mới.' },
  ],
  pay: [
    { en: 'I paid fifty dollars for a one-hour lesson.', vi: 'Tôi trả năm mươi đô cho một buổi học một tiếng.' },
    { en: 'You can pay online or at the counter.', vi: 'Bạn có thể thanh toán trực tuyến hoặc tại quầy.' },
  ],
  cheap: [
    { en: 'The street food here is cheap but really delicious.', vi: 'Đồ ăn đường phố ở đây rẻ nhưng rất ngon.' },
    { en: 'Cheap products are not always low quality.', vi: 'Sản phẩm rẻ không phải lúc nào cũng kém chất lượng.' },
  ],
  free: [
    { en: 'The museum is free on the first Sunday of every month.', vi: 'Bảo tàng miễn phí vào Chủ nhật đầu tiên của mỗi tháng.' },
    { en: 'Download the app for free on your phone.', vi: 'Tải ứng dụng miễn phí trên điện thoại của bạn.' },
  ],
  discount: [
    { en: 'She got a ten percent student discount at the bookshop.', vi: 'Cô ấy được giảm giá mười phần trăm cho sinh viên ở hiệu sách.' },
    { en: 'The shop offers discounts during the holiday season.', vi: 'Cửa hàng giảm giá trong mùa lễ hội.' },
  ],
  cash: [
    { en: 'Some small shops only accept cash, not card.', vi: 'Một số cửa hàng nhỏ chỉ nhận tiền mặt, không nhận thẻ.' },
    { en: 'Always keep some cash with you when travelling.', vi: 'Luôn giữ một ít tiền mặt khi đi du lịch.' },
  ],
  card: [
    { en: 'I paid for the dinner with my credit card.', vi: 'Tôi trả tiền bữa tối bằng thẻ tín dụng.' },
    { en: 'Her card was declined because the balance was too low.', vi: 'Thẻ của cô ấy bị từ chối vì số dư quá thấp.' },
  ],
  receipt: [
    { en: 'Always keep your receipt in case you need to return something.', vi: 'Luôn giữ hóa đơn phòng khi bạn cần đổi trả.' },
    { en: 'The cashier printed the receipt and handed it over.', vi: 'Thu ngân in hóa đơn và đưa cho khách.' },
  ],
  bill: [
    { en: 'The electricity bill this month was higher than usual.', vi: 'Hóa đơn điện tháng này cao hơn bình thường.' },
    { en: 'They split the restaurant bill equally.', vi: 'Họ chia đều hóa đơn nhà hàng.' },
  ],
  change: [
    { en: 'The cashier gave me the wrong change.', vi: 'Thu ngân thối sai tiền cho tôi.' },
    { en: 'Do you have change for a hundred-dollar note?', vi: 'Bạn có tiền lẻ đổi tờ trăm đô không?' },
  ],
  shop: [
    { en: 'She loves to window shop even when she has no money.', vi: 'Cô ấy thích đi dạo ngắm cửa hàng dù không có tiền.' },
    { en: 'There is a small gift shop near the entrance.', vi: 'Có một cửa hàng quà lưu niệm nhỏ gần lối vào.' },
  ],
  store: [
    { en: 'The convenience store is open twenty-four hours.', vi: 'Cửa hàng tiện lợi mở cửa hai mươi bốn tiếng.' },
    { en: 'She works at a clothing store in the mall.', vi: 'Cô ấy làm việc ở cửa hàng quần áo trong trung tâm thương mại.' },
  ],
  customer: [
    { en: 'The shop assistant greeted every customer warmly.', vi: 'Nhân viên cửa hàng chào hỏi mỗi khách hàng một cách thân thiện.' },
    { en: 'Loyal customers get special discounts.', vi: 'Khách hàng trung thành được giảm giá đặc biệt.' },
  ],
  sale: [
    { en: 'I bought this coat at half price during the winter sale.', vi: 'Tôi mua áo khoác này với nửa giá trong đợt sale mùa đông.' },
    { en: 'The store holds a big sale at the end of every season.', vi: 'Cửa hàng tổ chức sale lớn vào cuối mỗi mùa.' },
  ],
  spend: [
    { en: 'He spent all his savings on a new laptop.', vi: 'Anh ấy tiêu hết tiền tiết kiệm vào laptop mới.' },
    { en: 'I try to spend less on eating out each month.', vi: 'Tôi cố gắng chi ít hơn cho ăn ngoài mỗi tháng.' },
  ],
  earn: [
    { en: 'She earns extra money by teaching English online.', vi: 'Cô ấy kiếm thêm tiền bằng cách dạy tiếng Anh trực tuyến.' },
    { en: 'You earn respect by treating others well.', vi: 'Bạn giành được sự tôn trọng bằng cách đối xử tốt với người khác.' },
  ],
  cost: [
    { en: 'The course costs five hundred dollars for three months.', vi: 'Khoá học này tốn năm trăm đô cho ba tháng.' },
    { en: 'Good health is worth whatever it costs.', vi: 'Sức khoẻ tốt đáng bất kỳ chi phí nào.' },
  ],
  wallet: [
    { en: 'He checked his wallet and found only ten dollars left.', vi: 'Anh ấy kiểm tra ví và chỉ còn mười đô.' },
    { en: 'She uses a digital wallet app to pay for everything.', vi: 'Cô ấy dùng ứng dụng ví điện tử để thanh toán mọi thứ.' },
  ],

  // ── Vòng 24: Thể thao & sở thích ─────────────────────────────────────
  sport: [
    { en: 'Playing a sport regularly keeps you healthy.', vi: 'Chơi thể thao đều đặn giúp bạn khoẻ mạnh.' },
    { en: 'Football is the most popular sport in the world.', vi: 'Bóng đá là môn thể thao phổ biến nhất thế giới.' },
  ],
  swim: [
    { en: 'He learned to swim when he was only four years old.', vi: 'Anh ấy học bơi khi mới bốn tuổi.' },
    { en: 'Swimming is a great full-body workout.', vi: 'Bơi lội là bài tập tuyệt vời cho toàn thân.' },
  ],
  run: [
    { en: 'She runs a marathon every year to raise money for charity.', vi: 'Cô ấy chạy marathon mỗi năm để quyên tiền từ thiện.' },
    { en: 'Start by running just ten minutes a day and build up.', vi: 'Bắt đầu bằng cách chạy mười phút mỗi ngày rồi tăng dần.' },
  ],
  jump: [
    { en: 'The athlete jumped over the bar on her first attempt.', vi: 'Vận động viên nhảy qua xà ngay lần đầu tiên.' },
    { en: 'Jump rope is a fun and cheap way to get fit.', vi: 'Nhảy dây là cách vui và rẻ để tập thể dục.' },
  ],
  kick: [
    { en: 'She practised her kicks at martial arts class.', vi: 'Cô ấy luyện các cú đá ở lớp võ thuật.' },
    { en: 'He kicked the ball so hard it went over the fence.', vi: 'Anh ấy đá bóng mạnh đến mức bay qua hàng rào.' },
  ],
  play: [
    { en: 'Children learn a lot through play.', vi: 'Trẻ em học được rất nhiều qua việc chơi.' },
    { en: 'She plays chess with her grandfather every weekend.', vi: 'Cô ấy chơi cờ với ông ngoại mỗi cuối tuần.' },
  ],
  game: [
    { en: 'He downloaded a new game to play on his phone.', vi: 'Anh ấy tải trò chơi mới để chơi trên điện thoại.' },
    { en: 'Board games bring the whole family together.', vi: 'Trò chơi cờ bàn giúp cả gia đình quây quần.' },
  ],
  dance: [
    { en: 'She danced so gracefully that everyone stopped to watch.', vi: 'Cô ấy nhảy uyển chuyển đến mức mọi người dừng lại xem.' },
    { en: 'Dance is a beautiful way to express how you feel.', vi: 'Múa là cách tuyệt đẹp để bộc lộ cảm xúc.' },
  ],
  sing: [
    { en: 'She sings in the shower every morning — loudly.', vi: 'Cô ấy hát khi tắm mỗi sáng — rất to.' },
    { en: 'He sang a love song at his best friend\'s wedding.', vi: 'Anh ấy hát một bài tình ca tại đám cưới của bạn thân.' },
  ],
  draw: [
    { en: 'He draws comics to tell stories about daily life.', vi: 'Anh ấy vẽ truyện tranh để kể về cuộc sống hàng ngày.' },
    { en: 'She draws her ideas before turning them into designs.', vi: 'Cô ấy phác thảo ý tưởng trước khi biến chúng thành thiết kế.' },
  ],
  paint: [
    { en: 'She painted the living room walls light blue.', vi: 'Cô ấy sơn tường phòng khách màu xanh nhạt.' },
    { en: 'He spent the afternoon painting by the river.', vi: 'Anh ấy dành buổi chiều vẽ tranh bên sông.' },
  ],
  hobby: [
    { en: 'My hobbies include cooking, reading, and hiking.', vi: 'Sở thích của tôi bao gồm nấu ăn, đọc sách và đi bộ đường dài.' },
    { en: 'Having a hobby helps you relax after a busy week.', vi: 'Có sở thích giúp bạn thư giãn sau tuần bận rộn.' },
  ],
  win: [
    { en: 'She won first prize in the national essay competition.', vi: 'Cô ấy đoạt giải nhất trong cuộc thi viết văn toàn quốc.' },
    { en: 'Winning is great, but the effort matters more.', vi: 'Chiến thắng rất tuyệt, nhưng nỗ lực mới quan trọng hơn.' },
  ],
  lose: [
    { en: 'They lost the game but played with great spirit.', vi: 'Họ thua trận nhưng thi đấu với tinh thần tuyệt vời.' },
    { en: 'Nobody likes to lose, but it teaches you important lessons.', vi: 'Không ai thích thua, nhưng nó dạy cho bạn bài học quan trọng.' },
  ],
  score: [
    { en: 'The final score was three to one in our favour.', vi: 'Tỉ số cuối trận là ba một thiên về phía chúng tôi.' },
    { en: 'She scored top marks in the maths exam.', vi: 'Cô ấy đạt điểm tuyệt đối trong kỳ thi toán.' },
  ],
  match: [
    { en: 'The match ended in a draw after ninety minutes.', vi: 'Trận đấu kết thúc hoà sau chín mươi phút.' },
    { en: 'Our school team won every match this season.', vi: 'Đội trường chúng tôi thắng mọi trận mùa này.' },
  ],
  exercise: [
    { en: 'Regular exercise reduces the risk of heart disease.', vi: 'Tập thể dục đều đặn giảm nguy cơ bệnh tim.' },
    { en: 'She does twenty minutes of exercise every morning before breakfast.', vi: 'Cô ấy tập hai mươi phút thể dục mỗi sáng trước bữa sáng.' },
  ],
  compete: [
    { en: 'She competed in the national swimming championship.', vi: 'Cô ấy thi đấu trong giải bơi lội toàn quốc.' },
    { en: 'Companies compete to offer the best price and service.', vi: 'Các công ty cạnh tranh để cung cấp giá và dịch vụ tốt nhất.' },
  ],
  club: [
    { en: 'She joined the English conversation club at her university.', vi: 'Cô ấy tham gia câu lạc bộ hội thoại tiếng Anh ở đại học.' },
    { en: 'The chess club meets every Wednesday after school.', vi: 'Câu lạc bộ cờ vua họp mỗi thứ Tư sau giờ học.' },
  ],
  trophy: [
    { en: 'The coach lifted the trophy above his head and cheered.', vi: 'Huấn luyện viên nâng cúp lên đầu và hò reo.' },
    { en: 'She keeps all her trophies on a shelf in her bedroom.', vi: 'Cô ấy để tất cả cúp trên kệ trong phòng ngủ.' },
  ],

  // ── Vòng 25: Tính cách & phẩm chất ───────────────────────────────────
  kind: [
    { en: 'It was kind of you to help the elderly woman.', vi: 'Bạn thật tốt bụng khi giúp bà cụ đó.' },
    { en: 'Small acts of kindness make a big difference.', vi: 'Những hành động tốt bụng nhỏ tạo ra sự khác biệt lớn.' },
  ],
  honest: [
    { en: 'He was honest enough to admit he had made a mistake.', vi: 'Anh ấy đủ trung thực để thừa nhận mình đã mắc sai lầm.' },
    { en: 'Honest feedback, even when hard to hear, is valuable.', vi: 'Phản hồi trung thực, dù khó nghe, vẫn rất có giá trị.' },
  ],
  brave: [
    { en: 'She was brave enough to speak up against injustice.', vi: 'Cô ấy đủ dũng cảm để lên tiếng chống lại bất công.' },
    { en: 'It is brave to try something new, even if you might fail.', vi: 'Thử điều gì đó mới, dù có thể thất bại, là dũng cảm.' },
  ],
  lazy: [
    { en: 'He was too lazy to cook so he ordered takeaway again.', vi: 'Anh ấy lười quá không muốn nấu nên lại gọi đồ ăn mang về.' },
    { en: 'Being lazy sometimes means you just need a break.', vi: 'Đôi khi lười biếng chỉ có nghĩa là bạn cần nghỉ ngơi thôi.' },
  ],
  funny: [
    { en: 'His funny jokes always make the whole office laugh.', vi: 'Những trò đùa hài hước của anh ấy luôn làm cả văn phòng cười.' },
    { en: 'She has a funny way of explaining complicated things simply.', vi: 'Cô ấy có cách hài hước để giải thích những điều phức tạp một cách đơn giản.' },
  ],
  polite: [
    { en: 'He was always polite, even to people who were rude to him.', vi: 'Anh ấy luôn lịch sự, ngay cả với người thô lỗ với anh ấy.' },
    { en: 'Saying please and thank you is a simple way to be polite.', vi: 'Nói làm ơn và cảm ơn là cách đơn giản để lịch sự.' },
  ],
  rude: [
    { en: 'It is rude to use your phone during a meal with others.', vi: 'Dùng điện thoại trong bữa ăn với người khác là thô lỗ.' },
    { en: 'She walked out after the customer was repeatedly rude.', vi: 'Cô ấy rời đi sau khi khách hàng liên tục thô lỗ.' },
  ],
  confident: [
    { en: 'She walked into the interview confident and well-prepared.', vi: 'Cô ấy bước vào phòng phỏng vấn tự tin và chuẩn bị kỹ.' },
    { en: 'Practising every day makes you more confident in speaking.', vi: 'Luyện tập mỗi ngày giúp bạn tự tin hơn khi nói.' },
  ],
  serious: [
    { en: 'She is serious about becoming a professional musician.', vi: 'Cô ấy nghiêm túc với mục tiêu trở thành nhạc sĩ chuyên nghiệp.' },
    { en: 'He looks serious in meetings but is funny outside work.', vi: 'Anh ấy trông nghiêm túc trong cuộc họp nhưng hài hước ngoài giờ làm.' },
  ],
  quiet: [
    { en: 'She prefers a quiet evening at home to loud parties.', vi: 'Cô ấy thích buổi tối yên tĩnh ở nhà hơn tiệc ồn ào.' },
    { en: 'The library is a quiet place to focus on studying.', vi: 'Thư viện là nơi yên tĩnh để tập trung học bài.' },
  ],
  loud: [
    { en: 'The music was so loud I could not hear my friend speak.', vi: 'Nhạc to đến mức tôi không nghe bạn nói chuyện.' },
    { en: 'She has a loud laugh that fills the whole room.', vi: 'Cô ấy có tiếng cười to lấp đầy cả căn phòng.' },
  ],
  creative: [
    { en: 'Creative thinking helps you solve problems in new ways.', vi: 'Tư duy sáng tạo giúp bạn giải quyết vấn đề theo cách mới.' },
    { en: 'She is creative with both design and cooking.', vi: 'Cô ấy sáng tạo trong cả thiết kế lẫn nấu ăn.' },
  ],
  generous: [
    { en: 'He was generous enough to donate half his bonus to charity.', vi: 'Anh ấy hào phóng đủ để hiến một nửa tiền thưởng cho từ thiện.' },
    { en: 'She is generous with both her time and her advice.', vi: 'Cô ấy hào phóng với cả thời gian lẫn lời khuyên.' },
  ],
  selfish: [
    { en: 'It is selfish to take all the food without sharing.', vi: 'Lấy hết đồ ăn mà không chia sẻ là ích kỷ.' },
    { en: 'Sometimes being selfish means taking care of yourself first.', vi: 'Đôi khi ích kỷ có nghĩa là chăm sóc bản thân trước.' },
  ],
  shy: [
    { en: 'She was shy at first but opened up after a few classes.', vi: 'Cô ấy nhút nhát lúc đầu nhưng cởi mở hơn sau vài buổi học.' },
    { en: 'Many shy people are great listeners and deep thinkers.', vi: 'Nhiều người nhút nhát là người biết lắng nghe và suy nghĩ sâu sắc.' },
  ],
  friendly: [
    { en: 'The locals were so friendly that we felt at home right away.', vi: 'Người địa phương thân thiện đến mức chúng tôi cảm thấy như ở nhà ngay.' },
    { en: 'A friendly smile makes a big difference to someone\'s day.', vi: 'Một nụ cười thân thiện tạo ra sự khác biệt lớn cho ngày của ai đó.' },
  ],
  character: [
    { en: 'Her character shone through when she helped strangers.', vi: 'Nhân cách của cô ấy toả sáng khi cô ấy giúp đỡ người lạ.' },
    { en: 'You can judge a person\'s character by how they treat others.', vi: 'Bạn có thể đánh giá nhân cách một người qua cách họ đối xử với người khác.' },
  ],
  personality: [
    { en: 'Her warm personality makes everyone feel welcome.', vi: 'Cá tính ấm áp của cô ấy khiến mọi người cảm thấy được chào đón.' },
    { en: 'A positive personality is as important as technical skills.', vi: 'Cá tính tích cực quan trọng không kém kỹ năng chuyên môn.' },
  ],
  talent: [
    { en: 'Hard work beats talent when talent does not work hard.', vi: 'Chăm chỉ đánh bại tài năng khi tài năng không chăm chỉ.' },
    { en: 'She discovered her talent for languages at a young age.', vi: 'Cô ấy phát hiện năng khiếu ngôn ngữ của mình từ nhỏ.' },
  ],
  attitude: [
    { en: 'Your attitude determines how far you go in life.', vi: 'Thái độ của bạn quyết định bạn đi được bao xa trong cuộc sống.' },
    { en: 'She faced every challenge with a positive attitude.', vi: 'Cô ấy đối mặt với mọi thử thách với thái độ tích cực.' },
  ],

  // ── Vòng 26: Tháng trong năm ─────────────────────────────────────────────
  January: [
    { en: 'January is the coldest month in northern Vietnam.', vi: 'Tháng Một là tháng lạnh nhất ở miền Bắc Việt Nam.' },
    { en: 'She started her new job in January.', vi: 'Cô ấy bắt đầu công việc mới vào tháng Một.' },
  ],
  February: [
    { en: 'Tết often falls in January or February.', vi: 'Tết thường rơi vào tháng Một hoặc tháng Hai.' },
    { en: 'February is the shortest month of the year.', vi: 'Tháng Hai là tháng ngắn nhất trong năm.' },
  ],
  March: [
    { en: 'International Women\'s Day is on the eighth of March.', vi: 'Ngày Quốc tế Phụ nữ vào ngày tám tháng Ba.' },
    { en: 'The weather in March is usually warm and pleasant.', vi: 'Thời tiết tháng Ba thường ấm áp và dễ chịu.' },
  ],
  April: [
    { en: 'Reunification Day in Vietnam falls on the thirtieth of April.', vi: 'Ngày Thống Nhất của Việt Nam vào ngày ba mươi tháng Tư.' },
    { en: 'April showers bring May flowers.', vi: 'Mưa tháng Tư mang lại hoa tháng Năm.' },
  ],
  May: [
    { en: 'Labour Day is celebrated on the first of May.', vi: 'Ngày Lao động được tổ chức vào ngày một tháng Năm.' },
    { en: 'The rainy season often starts in May in southern Vietnam.', vi: 'Mùa mưa thường bắt đầu vào tháng Năm ở miền Nam Việt Nam.' },
  ],
  June: [
    { en: 'University entrance exams are usually held in June.', vi: 'Kỳ thi đại học thường được tổ chức vào tháng Sáu.' },
    { en: 'The days are long in June because of the summer solstice.', vi: 'Ngày dài vào tháng Sáu do điểm hạ chí.' },
  ],
  July: [
    { en: 'July is often the hottest month in many parts of the world.', vi: 'Tháng Bảy thường là tháng nóng nhất ở nhiều nơi trên thế giới.' },
    { en: 'She went on a holiday to Da Nang in July.', vi: 'Cô ấy đi nghỉ ở Đà Nẵng vào tháng Bảy.' },
  ],
  August: [
    { en: 'August is the peak season for beach holidays in Vietnam.', vi: 'Tháng Tám là mùa cao điểm cho kỳ nghỉ biển ở Việt Nam.' },
    { en: 'He completed his internship in August.', vi: 'Anh ấy hoàn thành thực tập vào tháng Tám.' },
  ],
  September: [
    { en: 'Mid-Autumn Festival is usually in September.', vi: 'Tết Trung Thu thường vào tháng Chín.' },
    { en: 'School begins again at the start of September.', vi: 'Trường học bắt đầu lại vào đầu tháng Chín.' },
  ],
  October: [
    { en: 'October is a great time to visit Hội An.', vi: 'Tháng Mười là thời điểm tuyệt vời để thăm Hội An.' },
    { en: 'The weather cools down in October in the north.', vi: 'Thời tiết mát dần vào tháng Mười ở miền Bắc.' },
  ],
  November: [
    { en: 'November is a good month for visiting Hanoi.', vi: 'Tháng Mười một là tháng tốt để thăm Hà Nội.' },
    { en: 'In November, the nights get noticeably longer.', vi: 'Vào tháng Mười một, đêm dài hơn rõ rệt.' },
  ],
  December: [
    { en: 'Families gather together in December for the holidays.', vi: 'Các gia đình tụ họp vào tháng Mười hai dịp lễ.' },
    { en: 'Hanoi can be quite cold in December.', vi: 'Hà Nội có thể khá lạnh vào tháng Mười hai.' },
  ],
  date: [
    { en: 'Write the date at the top of your answer sheet.', vi: 'Viết ngày tháng vào đầu bài làm của bạn.' },
    { en: 'What date does the conference start?', vi: 'Hội nghị bắt đầu vào ngày mấy?' },
  ],
  birthday: [
    { en: 'Happy birthday — I hope all your wishes come true.', vi: 'Chúc mừng sinh nhật — chúc bạn mọi điều ước thành hiện thực.' },
    { en: 'She baked a chocolate cake for his birthday.', vi: 'Cô ấy làm bánh sô-cô-la cho sinh nhật anh ấy.' },
  ],
  holiday: [
    { en: 'They spent their summer holiday at the beach.', vi: 'Họ dành kỳ nghỉ hè ở bãi biển.' },
    { en: 'Public holidays are a good time to visit family.', vi: 'Ngày lễ là dịp tốt để về thăm gia đình.' },
  ],
  anniversary: [
    { en: 'They celebrated their tenth wedding anniversary in Paris.', vi: 'Họ kỷ niệm mười năm ngày cưới ở Paris.' },
    { en: 'The company anniversary dinner was held at a luxury hotel.', vi: 'Tiệc kỷ niệm thành lập công ty được tổ chức tại khách sạn sang trọng.' },
  ],
  calendar: [
    { en: 'Mark the important dates on your calendar.', vi: 'Đánh dấu các ngày quan trọng vào lịch của bạn.' },
    { en: 'She checked the calendar and found a free slot on Friday.', vi: 'Cô ấy xem lịch và tìm được khoảng trống vào thứ Sáu.' },
  ],
  period: [
    { en: 'The busy period ends after the holiday season.', vi: 'Giai đoạn bận rộn kết thúc sau mùa lễ hội.' },
    { en: 'This is a critical period for the company.', vi: 'Đây là giai đoạn quan trọng với công ty.' },
  ],
  quarterly: [
    { en: 'The team holds quarterly reviews to track progress.', vi: 'Nhóm tổ chức đánh giá hàng quý để theo dõi tiến độ.' },
    { en: 'Quarterly reports show how the business is doing.', vi: 'Báo cáo hàng quý cho thấy tình hình kinh doanh ra sao.' },
  ],
  annual: [
    { en: 'The annual company trip is something everyone looks forward to.', vi: 'Chuyến du lịch thường niên của công ty là điều mọi người mong đợi.' },
    { en: 'She gets an annual salary review every December.', vi: 'Cô ấy được xem xét lương hàng năm vào mỗi tháng Mười hai.' },
  ],

  // ── Vòng 27: Địa điểm thành phố ──────────────────────────────────────────
  park: [
    { en: 'Families enjoy picnics in the park on weekends.', vi: 'Các gia đình thích dã ngoại trong công viên vào cuối tuần.' },
    { en: 'She runs three kilometres in the park every morning.', vi: 'Cô ấy chạy ba km trong công viên mỗi sáng.' },
  ],
  bank: [
    { en: 'He went to the bank to open a savings account.', vi: 'Anh ấy đến ngân hàng để mở tài khoản tiết kiệm.' },
    { en: 'The bank closes at five o\'clock on weekdays.', vi: 'Ngân hàng đóng cửa lúc năm giờ vào ngày thường.' },
  ],
  restaurant: [
    { en: 'The restaurant was fully booked for the weekend.', vi: 'Nhà hàng đã kín chỗ cho cuối tuần.' },
    { en: 'She recommended a great Vietnamese restaurant downtown.', vi: 'Cô ấy giới thiệu một nhà hàng Việt Nam tuyệt vời ở trung tâm thành phố.' },
  ],
  hotel: [
    { en: 'The hotel room had a beautiful sea view.', vi: 'Phòng khách sạn có tầm nhìn tuyệt đẹp ra biển.' },
    { en: 'Book your hotel early to get a better price.', vi: 'Đặt khách sạn sớm để được giá tốt hơn.' },
  ],
  museum: [
    { en: 'The history museum is a great place to learn about Vietnam.', vi: 'Bảo tàng lịch sử là nơi tuyệt vời để tìm hiểu về Việt Nam.' },
    { en: 'Children get in free at this museum on Sundays.', vi: 'Trẻ em được vào miễn phí ở bảo tàng này vào Chủ nhật.' },
  ],
  church: [
    { en: 'The old church was built over a hundred years ago.', vi: 'Nhà thờ cổ được xây dựng hơn một trăm năm trước.' },
    { en: 'They held a quiet wedding ceremony at the local church.', vi: 'Họ tổ chức lễ cưới yên tĩnh tại nhà thờ địa phương.' },
  ],
  gym: [
    { en: 'She works out at the gym for an hour every day.', vi: 'Cô ấy tập ở phòng tập thể dục một tiếng mỗi ngày.' },
    { en: 'He joined a gym to get fit before summer.', vi: 'Anh ấy đăng ký phòng gym để lấy lại vóc dáng trước mùa hè.' },
  ],
  cinema: [
    { en: 'We watched the new action film at the cinema last night.', vi: 'Chúng tôi xem phim hành động mới ở rạp tối qua.' },
    { en: 'The cinema was packed — we had to sit in the front row.', vi: 'Rạp phim chật cứng — chúng tôi phải ngồi hàng đầu.' },
  ],
  stadium: [
    { en: 'Thousands of fans filled the stadium for the final.', vi: 'Hàng nghìn người hâm mộ lấp đầy sân vận động cho trận chung kết.' },
    { en: 'The national stadium was renovated last year.', vi: 'Sân vận động quốc gia được cải tạo năm ngoái.' },
  ],
  supermarket: [
    { en: 'She does her weekly grocery shopping at the supermarket.', vi: 'Cô ấy mua đồ hàng tuần ở siêu thị.' },
    { en: 'The supermarket has a great selection of fresh produce.', vi: 'Siêu thị có nhiều lựa chọn thực phẩm tươi sống tốt.' },
  ],
  mall: [
    { en: 'The new mall has a cinema, gym, and food court.', vi: 'Trung tâm thương mại mới có rạp phim, phòng gym và khu ẩm thực.' },
    { en: 'Shopping at the mall is fun on a rainy day.', vi: 'Mua sắm ở trung tâm thương mại rất vui vào ngày mưa.' },
  ],
  café: [
    { en: 'She works from a café every Tuesday morning.', vi: 'Cô ấy làm việc ở quán cà phê mỗi sáng thứ Ba.' },
    { en: 'The café near the park serves excellent Vietnamese coffee.', vi: 'Quán cà phê gần công viên phục vụ cà phê Việt Nam rất ngon.' },
  ],
  bridge: [
    { en: 'The Dragon Bridge in Da Nang breathes fire on weekends.', vi: 'Cầu Rồng ở Đà Nẵng phun lửa vào cuối tuần.' },
    { en: 'They crossed the bridge to reach the other side of the river.', vi: 'Họ qua cầu để đến bờ sông bên kia.' },
  ],
  street: [
    { en: 'The street food on this street is amazing.', vi: 'Đồ ăn đường phố trên phố này rất tuyệt vời.' },
    { en: 'She walked down the busy street to find the office.', vi: 'Cô ấy đi dọc con phố đông đúc để tìm văn phòng.' },
  ],
  corner: [
    { en: 'There is a small pharmacy on the corner of the street.', vi: 'Có một hiệu thuốc nhỏ ở góc phố.' },
    { en: 'Wait for me on the corner — I\'ll be there in five minutes.', vi: 'Đợi tôi ở góc đường — tôi sẽ đến trong năm phút.' },
  ],
  block: [
    { en: 'The supermarket is just two blocks away from here.', vi: 'Siêu thị chỉ cách đây hai dãy nhà thôi.' },
    { en: 'She walks around the block every evening to clear her mind.', vi: 'Cô ấy đi bộ quanh khu phố mỗi tối để xua tan căng thẳng.' },
  ],
  neighborhood: [
    { en: 'They love their neighborhood because it is safe and quiet.', vi: 'Họ thích khu phố của mình vì nó an toàn và yên tĩnh.' },
    { en: 'She knows everyone in her neighborhood by name.', vi: 'Cô ấy biết tên mọi người trong khu phố.' },
  ],
  entrance: [
    { en: 'The main entrance is on the north side of the building.', vi: 'Lối vào chính ở phía bắc tòa nhà.' },
    { en: 'She waited at the entrance for her friend to arrive.', vi: 'Cô ấy đợi ở cổng vào cho bạn đến.' },
  ],
  exit: [
    { en: 'Please leave through the emergency exit on the right.', vi: 'Vui lòng thoát qua lối ra khẩn cấp bên phải.' },
    { en: 'She found the exit sign and followed it downstairs.', vi: 'Cô ấy tìm thấy biển lối ra và đi theo xuống cầu thang.' },
  ],
  floor: [
    { en: 'The restaurant is on the rooftop floor — great views.', vi: 'Nhà hàng ở tầng thượng — tầm nhìn tuyệt vời.' },
    { en: 'Take the lift to the eighth floor for the meeting room.', vi: 'Đi thang máy lên tầng tám để đến phòng họp.' },
  ],

  // ── Vòng 28: Nghề nghiệp ─────────────────────────────────────────────────
  job: [
    { en: 'She found a great job after only two weeks of searching.', vi: 'Cô ấy tìm được việc làm tốt sau chỉ hai tuần tìm kiếm.' },
    { en: 'Loving your job makes every workday enjoyable.', vi: 'Yêu công việc khiến mỗi ngày làm việc trở nên thú vị.' },
  ],
  occupation: [
    { en: 'Please write your occupation on the registration form.', vi: 'Hãy viết nghề nghiệp của bạn vào mẫu đăng ký.' },
    { en: 'Teaching is one of the most respected occupations in Vietnam.', vi: 'Giảng dạy là một trong những nghề được kính trọng nhất ở Việt Nam.' },
  ],
  engineer: [
    { en: 'She studied hard to become a civil engineer.', vi: 'Cô ấy học chăm chỉ để trở thành kỹ sư xây dựng.' },
    { en: 'Engineers designed the bridge to last a hundred years.', vi: 'Các kỹ sư thiết kế cây cầu để tồn tại một trăm năm.' },
  ],
  lawyer: [
    { en: 'He hired a lawyer to help with the contract dispute.', vi: 'Anh ấy thuê luật sư để giải quyết tranh chấp hợp đồng.' },
    { en: 'She studied law for five years before becoming a lawyer.', vi: 'Cô ấy học luật năm năm trước khi trở thành luật sư.' },
  ],
  accountant: [
    { en: 'The accountant prepared the annual financial report.', vi: 'Kế toán viên chuẩn bị báo cáo tài chính thường niên.' },
    { en: 'Hire an accountant to manage your business finances.', vi: 'Thuê kế toán để quản lý tài chính doanh nghiệp của bạn.' },
  ],
  chef: [
    { en: 'The chef created a new dish inspired by Vietnamese street food.', vi: 'Đầu bếp tạo ra món mới lấy cảm hứng từ ẩm thực đường phố Việt Nam.' },
    { en: 'She trained under a famous chef for three years.', vi: 'Cô ấy học dưới sự hướng dẫn của một đầu bếp nổi tiếng ba năm.' },
  ],
  driver: [
    { en: 'The taxi driver knew a shortcut to the airport.', vi: 'Tài xế taxi biết đường tắt ra sân bay.' },
    { en: 'He works as a bus driver for the city transport company.', vi: 'Anh ấy làm tài xế xe buýt cho công ty vận tải thành phố.' },
  ],
  farmer: [
    { en: 'The farmer harvested rice in the cool morning air.', vi: 'Người nông dân gặt lúa trong không khí buổi sáng mát mẻ.' },
    { en: 'Many Vietnamese farmers grow coffee in the central highlands.', vi: 'Nhiều nông dân Việt Nam trồng cà phê ở Tây Nguyên.' },
  ],
  soldier: [
    { en: 'The soldier stood guard in front of the government building.', vi: 'Người lính đứng canh trước tòa nhà chính phủ.' },
    { en: 'Veterans are soldiers who have retired from military service.', vi: 'Cựu chiến binh là những người lính đã giải ngũ.' },
  ],
  pilot: [
    { en: 'The pilot announced that we would land in twenty minutes.', vi: 'Phi công thông báo chúng tôi sẽ hạ cánh sau hai mươi phút.' },
    { en: 'She dreamed of becoming a pilot since she was a child.', vi: 'Cô ấy mơ ước trở thành phi công từ khi còn nhỏ.' },
  ],
  journalist: [
    { en: 'The journalist interviewed the mayor about city plans.', vi: 'Nhà báo phỏng vấn thị trưởng về kế hoạch thành phố.' },
    { en: 'She became a journalist to tell important stories.', vi: 'Cô ấy trở thành nhà báo để kể những câu chuyện quan trọng.' },
  ],
  architect: [
    { en: 'The architect spent a year designing the new library.', vi: 'Kiến trúc sư mất một năm thiết kế thư viện mới.' },
    { en: 'A good architect balances beauty with practical function.', vi: 'Kiến trúc sư giỏi cân bằng giữa vẻ đẹp và tính thực tiễn.' },
  ],
  scientist: [
    { en: 'Scientists discovered a new species of fish in the Mekong River.', vi: 'Các nhà khoa học phát hiện loài cá mới ở sông Mê Kông.' },
    { en: 'She wants to be a scientist to find cures for diseases.', vi: 'Cô ấy muốn trở thành nhà khoa học để tìm ra cách chữa bệnh.' },
  ],
  programmer: [
    { en: 'The programmer wrote the new feature in just two days.', vi: 'Lập trình viên viết tính năng mới chỉ trong hai ngày.' },
    { en: 'Being a programmer requires both logic and creativity.', vi: 'Làm lập trình viên đòi hỏi cả tư duy logic lẫn sáng tạo.' },
  ],
  artist: [
    { en: 'The artist spent three months painting the large mural.', vi: 'Họa sĩ dành ba tháng để vẽ bức tranh tường lớn.' },
    { en: 'She is an artist who uses recycled materials in her work.', vi: 'Cô ấy là nghệ sĩ sử dụng vật liệu tái chế trong tác phẩm.' },
  ],
  musician: [
    { en: 'The musician performed live on the rooftop stage.', vi: 'Nhạc sĩ biểu diễn trực tiếp trên sân khấu mái thượng.' },
    { en: 'She is a talented musician who plays both guitar and piano.', vi: 'Cô ấy là nhạc sĩ tài năng chơi được cả guitar lẫn piano.' },
  ],
  actor: [
    { en: 'The actor prepared for his role by living like a chef for a month.', vi: 'Diễn viên chuẩn bị cho vai diễn bằng cách sống như đầu bếp một tháng.' },
    { en: 'She became a famous actor after her first film.', vi: 'Cô ấy trở thành diễn viên nổi tiếng sau bộ phim đầu tiên.' },
  ],
  athlete: [
    { en: 'The athlete trained six hours a day to prepare for the Olympics.', vi: 'Vận động viên tập luyện sáu tiếng mỗi ngày để chuẩn bị cho Olympic.' },
    { en: 'Vietnamese athletes won several medals at the SEA Games.', vi: 'Các vận động viên Việt Nam đoạt nhiều huy chương tại SEA Games.' },
  ],
  volunteer: [
    { en: 'She volunteers at a food bank every Saturday morning.', vi: 'Cô ấy tình nguyện ở ngân hàng thực phẩm mỗi sáng thứ Bảy.' },
    { en: 'Volunteering helps you gain new skills and meet new people.', vi: 'Tình nguyện giúp bạn có thêm kỹ năng mới và gặp gỡ người mới.' },
  ],

  // ── Vòng 29: Rau củ quả ──────────────────────────────────────────────────
  mango: [
    { en: 'Vietnam exports millions of tonnes of mangoes every year.', vi: 'Việt Nam xuất khẩu hàng triệu tấn xoài mỗi năm.' },
    { en: 'She made mango smoothies for the whole family.', vi: 'Cô ấy làm sinh tố xoài cho cả gia đình.' },
  ],
  grape: [
    { en: 'He bought a bunch of red grapes from the market.', vi: 'Anh ấy mua một chùm nho đỏ ở chợ.' },
    { en: 'Grapes are used to make wine and juice.', vi: 'Nho được dùng để làm rượu vang và nước trái cây.' },
  ],
  strawberry: [
    { en: 'She picked fresh strawberries straight from the farm.', vi: 'Cô ấy hái dâu tây tươi ngay từ trang trại.' },
    { en: 'Strawberry ice cream is her favourite dessert.', vi: 'Kem dâu tây là món tráng miệng yêu thích của cô ấy.' },
  ],
  watermelon: [
    { en: 'Cutting cold watermelon is perfect on a hot afternoon.', vi: 'Thái dưa hấu lạnh rất tuyệt vào buổi chiều nóng.' },
    { en: 'Vietnamese people often eat watermelon during Tết.', vi: 'Người Việt thường ăn dưa hấu trong dịp Tết.' },
  ],
  pineapple: [
    { en: 'She added pineapple chunks to the sweet and sour dish.', vi: 'Cô ấy cho miếng dứa vào món chua ngọt.' },
    { en: 'Pineapple is sweet, sour, and very refreshing.', vi: 'Dứa vừa ngọt vừa chua và rất mát.' },
  ],
  tomato: [
    { en: 'She grew tomatoes in a pot on the balcony.', vi: 'Cô ấy trồng cà chua trong chậu trên ban công.' },
    { en: 'Tomatoes are used in hundreds of Vietnamese dishes.', vi: 'Cà chua được dùng trong hàng trăm món Việt Nam.' },
  ],
  potato: [
    { en: 'He made a simple salad with boiled potatoes and eggs.', vi: 'Anh ấy làm salad đơn giản với khoai tây luộc và trứng.' },
    { en: 'Potatoes can be fried, boiled, or baked.', vi: 'Khoai tây có thể chiên, luộc hoặc nướng.' },
  ],
  carrot: [
    { en: 'She added grated carrot to the salad for colour.', vi: 'Cô ấy bào cà rốt vào salad để thêm màu sắc.' },
    { en: 'Carrots are rich in vitamin A and beta-carotene.', vi: 'Cà rốt giàu vitamin A và beta-carotene.' },
  ],
  onion: [
    { en: 'Onion is the base of almost every Vietnamese soup.', vi: 'Hành là nền tảng của hầu hết các món canh Việt Nam.' },
    { en: 'She cried while cutting onions — as always.', vi: 'Cô ấy khóc khi thái hành — như mọi khi.' },
  ],
  garlic: [
    { en: 'Fry the garlic in oil until golden before adding vegetables.', vi: 'Phi thơm tỏi trong dầu trước khi cho rau vào.' },
    { en: 'Garlic is known for its strong flavour and health benefits.', vi: 'Tỏi nổi tiếng với hương vị đậm đà và lợi ích sức khoẻ.' },
  ],
  cucumber: [
    { en: 'Cucumber slices cool down any spicy dish nicely.', vi: 'Lát dưa leo làm dịu bất kỳ món cay nào.' },
    { en: 'She always adds cucumber to her fresh spring rolls.', vi: 'Cô ấy luôn cho dưa leo vào gỏi cuốn tươi.' },
  ],
  lettuce: [
    { en: 'Wrap the grilled meat in a lettuce leaf for extra freshness.', vi: 'Cuốn thịt nướng trong lá xà lách để thêm tươi mát.' },
    { en: 'She grows lettuce on her apartment balcony.', vi: 'Cô ấy trồng xà lách trên ban công căn hộ.' },
  ],
  corn: [
    { en: 'Grilled corn with butter and salt is a popular Vietnamese street snack.', vi: 'Ngô nướng bơ muối là món ăn đường phố phổ biến ở Việt Nam.' },
    { en: 'She boiled a pot of corn for the family dinner.', vi: 'Cô ấy luộc một nồi ngô cho bữa tối gia đình.' },
  ],
  pumpkin: [
    { en: 'Pumpkin soup is warm, sweet, and very comforting.', vi: 'Súp bí đỏ ấm áp, ngọt ngào và rất dễ chịu.' },
    { en: 'She grew a giant pumpkin in her garden this autumn.', vi: 'Cô ấy trồng một quả bí đỏ khổng lồ trong vườn mùa thu này.' },
  ],
  mushroom: [
    { en: 'She added shiitake mushrooms to the hot pot broth.', vi: 'Cô ấy cho nấm shiitake vào nước lẩu.' },
    { en: 'Mushrooms add a rich, earthy flavour to any stir-fry.', vi: 'Nấm thêm hương vị đậm đà, thơm đất cho bất kỳ món xào nào.' },
  ],
  avocado: [
    { en: 'She eats avocado toast for breakfast every morning.', vi: 'Cô ấy ăn bánh mì nướng bơ mỗi sáng.' },
    { en: 'Avocado smoothies are very popular in Vietnam.', vi: 'Sinh tố bơ rất phổ biến ở Việt Nam.' },
  ],
  lemon: [
    { en: 'Squeeze a little lemon over the grilled fish for flavour.', vi: 'Vắt một chút chanh vàng lên cá nướng cho thêm hương vị.' },
    { en: 'She drank warm lemon water every morning to stay healthy.', vi: 'Cô ấy uống nước chanh ấm mỗi sáng để giữ sức khoẻ.' },
  ],
  lime: [
    { en: 'Fresh lime juice makes the best dipping sauce for spring rolls.', vi: 'Nước cốt chanh tươi làm nước chấm gỏi cuốn ngon nhất.' },
    { en: 'A slice of lime in iced tea adds a lovely refreshing twist.', vi: 'Một lát chanh trong trà đá thêm một nét tươi mát thú vị.' },
  ],

  // ── Vòng 30: Nấu ăn & bếp ────────────────────────────────────────────────
  cook: [
    { en: 'She learned to cook traditional Vietnamese dishes from her mother.', vi: 'Cô ấy học nấu các món Việt truyền thống từ mẹ.' },
    { en: 'Cooking at home is healthier and cheaper than eating out.', vi: 'Nấu ăn ở nhà lành mạnh hơn và rẻ hơn ăn ngoài.' },
  ],
  boil: [
    { en: 'Boil the chicken bones for two hours to make a rich broth.', vi: 'Ninh xương gà hai tiếng để có nước dùng đậm đà.' },
    { en: 'Always boil water before drinking if you are unsure about safety.', vi: 'Luôn đun sôi nước trước khi uống nếu bạn không chắc về an toàn.' },
  ],
  fry: [
    { en: 'Fry the spring rolls until they are golden and crispy.', vi: 'Chiên chả giò cho đến khi vàng và giòn.' },
    { en: 'She fried the garlic and onion in hot oil first.', vi: 'Cô ấy phi thơm tỏi và hành tây trong dầu nóng trước tiên.' },
  ],
  bake: [
    { en: 'She bakes cookies every Sunday for her neighbours.', vi: 'Cô ấy nướng bánh quy mỗi Chủ nhật cho hàng xóm.' },
    { en: 'Bake the bread at one hundred eighty degrees for thirty minutes.', vi: 'Nướng bánh mì ở một trăm tám mươi độ trong ba mươi phút.' },
  ],
  grill: [
    { en: 'They grilled fresh seafood on the beach at sunset.', vi: 'Họ nướng hải sản tươi trên bãi biển lúc hoàng hôn.' },
    { en: 'Grilled meat with lemongrass is a classic Vietnamese flavour.', vi: 'Thịt nướng sả là hương vị Việt Nam cổ điển.' },
  ],
  cut: [
    { en: 'Cut the spring onions finely before adding them to the soup.', vi: 'Thái nhỏ hành lá trước khi cho vào canh.' },
    { en: 'He cut his finger while chopping vegetables.', vi: 'Anh ấy bị đứt tay khi thái rau củ.' },
  ],
  stir: [
    { en: 'Stir the porridge constantly to prevent it from sticking.', vi: 'Khuấy cháo liên tục để không bị dính.' },
    { en: 'She stirred the sauce gently until it thickened.', vi: 'Cô ấy khuấy nhẹ nước sốt cho đến khi sệt lại.' },
  ],
  mix: [
    { en: 'Mix the fish sauce, lime juice, and sugar to make dipping sauce.', vi: 'Trộn nước mắm, chanh và đường để làm nước chấm.' },
    { en: 'She mixed all the dry ingredients before adding the eggs.', vi: 'Cô ấy trộn tất cả nguyên liệu khô trước khi cho trứng vào.' },
  ],
  taste: [
    { en: 'Taste the broth before serving — add more salt if needed.', vi: 'Nếm nước dùng trước khi dọn — cho thêm muối nếu cần.' },
    { en: 'This dish tastes like my grandmother used to make.', vi: 'Món này có vị như bà ngoại tôi từng nấu.' },
  ],
  recipe: [
    { en: 'She shared her pho recipe with thousands of followers online.', vi: 'Cô ấy chia sẻ công thức nấu phở với hàng nghìn người theo dõi trực tuyến.' },
    { en: 'Follow the recipe step by step for the best results.', vi: 'Làm theo công thức từng bước để có kết quả tốt nhất.' },
  ],
  ingredient: [
    { en: 'Fresh ingredients make all the difference in Vietnamese cooking.', vi: 'Nguyên liệu tươi tạo ra sự khác biệt hoàn toàn trong nấu ăn Việt Nam.' },
    { en: 'Read the ingredient list to check for any allergens.', vi: 'Đọc danh sách thành phần để kiểm tra chất gây dị ứng.' },
  ],
  pot: [
    { en: 'She used a large pot to cook soup for twenty people.', vi: 'Cô ấy dùng nồi lớn để nấu canh cho hai mươi người.' },
    { en: 'The hot pot at the table keeps the broth warm throughout the meal.', vi: 'Nồi lẩu trên bàn giữ nước dùng nóng suốt bữa ăn.' },
  ],
  pan: [
    { en: 'Heat the pan over medium heat before adding the oil.', vi: 'Đun nóng chảo ở lửa vừa trước khi cho dầu vào.' },
    { en: 'She used a non-stick pan to fry the eggs perfectly.', vi: 'Cô ấy dùng chảo chống dính để rán trứng đẹp.' },
  ],
  knife: [
    { en: 'A sharp knife makes cooking faster and safer.', vi: 'Dao sắc làm nấu ăn nhanh hơn và an toàn hơn.' },
    { en: 'She uses a chef\'s knife for most of her cutting.', vi: 'Cô ấy dùng dao đầu bếp cho hầu hết việc thái chặt.' },
  ],
  fork: [
    { en: 'He picked up his fork and tasted the pasta.', vi: 'Anh ấy cầm dĩa lên và nếm thử mì ống.' },
    { en: 'She used a fork to mix the salad dressing into the leaves.', vi: 'Cô ấy dùng dĩa để trộn sốt vào lá rau.' },
  ],
  spoon: [
    { en: 'She tasted the soup with a wooden spoon.', vi: 'Cô ấy nếm canh bằng thìa gỗ.' },
    { en: 'Use a tablespoon of oil for stir-frying.', vi: 'Dùng một muỗng canh dầu để xào.' },
  ],
  plate: [
    { en: 'She arranged the food beautifully on the plate.', vi: 'Cô ấy bày đồ ăn đẹp mắt trên đĩa.' },
    { en: 'Always eat everything on your plate — do not waste food.', vi: 'Luôn ăn hết trên đĩa — đừng lãng phí thức ăn.' },
  ],
  bowl: [
    { en: 'She served the pho in a large, steaming bowl.', vi: 'Cô ấy dọn phở trong bát lớn đang bốc hơi.' },
    { en: 'He mixed the batter in a bowl before pouring it into the pan.', vi: 'Anh ấy trộn bột trong bát trước khi đổ vào chảo.' },
  ],
  oven: [
    { en: 'She preheated the oven before sliding the cake tin in.', vi: 'Cô ấy làm nóng lò trước khi cho khuôn bánh vào.' },
    { en: 'The oven beeped to signal that the cookies were ready.', vi: 'Lò phát ra tiếng bíp báo hiệu bánh quy đã chín.' },
  ],
  microwave: [
    { en: 'He reheated the leftover rice in the microwave.', vi: 'Anh ấy hâm nóng cơm thừa trong lò vi sóng.' },
    { en: 'The microwave is the fastest way to defrost frozen food.', vi: 'Lò vi sóng là cách nhanh nhất để rã đông thực phẩm đông lạnh.' },
  ],

  // ── Vòng 31: Thiên nhiên ─────────────────────────────────────────────────
  nature: [
    { en: 'Spending time in nature helps reduce stress and anxiety.', vi: 'Dành thời gian trong thiên nhiên giúp giảm căng thẳng và lo âu.' },
    { en: 'We should all do our part to protect nature.', vi: 'Tất cả chúng ta nên làm phần của mình để bảo vệ thiên nhiên.' },
  ],
  forest: [
    { en: 'The forest provides oxygen for millions of people.', vi: 'Rừng cung cấp oxy cho hàng triệu người.' },
    { en: 'They hiked deep into the forest and camped overnight.', vi: 'Họ đi bộ sâu vào rừng và cắm trại qua đêm.' },
  ],
  sky: [
    { en: 'The sky turned orange and red at sunset.', vi: 'Bầu trời chuyển sang màu cam và đỏ lúc hoàng hôn.' },
    { en: 'She looked up at the clear blue sky and felt free.', vi: 'Cô ấy nhìn lên bầu trời xanh trong và cảm thấy tự do.' },
  ],
  rock: [
    { en: 'He climbed to the top of the large rock to get a better view.', vi: 'Anh ấy leo lên đỉnh tảng đá lớn để ngắm cảnh đẹp hơn.' },
    { en: 'The rock face was steep and challenging to climb.', vi: 'Vách đá dựng đứng và rất thách thức khi leo.' },
  ],
  sand: [
    { en: 'The white sand beach stretched for kilometres in both directions.', vi: 'Bãi biển cát trắng trải dài hàng cây số về cả hai phía.' },
    { en: 'She let the warm sand run through her fingers.', vi: 'Cô ấy để cát ấm chảy qua những ngón tay.' },
  ],
  grass: [
    { en: 'Children rolled down the grassy hill laughing.', vi: 'Lũ trẻ lăn xuống đồi cỏ trong tiếng cười.' },
    { en: 'After the rain, the grass smelled fresh and clean.', vi: 'Sau mưa, cỏ có mùi tươi mát và sạch sẽ.' },
  ],
  leaf: [
    { en: 'A single red leaf floated down from the oak tree.', vi: 'Một chiếc lá đỏ lơ lửng rơi từ cây sồi xuống.' },
    { en: 'The jungle floor was covered in a thick layer of dead leaves.', vi: 'Nền rừng phủ dày một lớp lá khô.' },
  ],
  soil: [
    { en: 'The rich, dark soil in the Mekong Delta is perfect for farming.', vi: 'Đất màu mỡ, đen ở đồng bằng sông Cửu Long rất thích hợp để trồng trọt.' },
    { en: 'She tested the soil before planting to check its pH level.', vi: 'Cô ấy kiểm tra độ pH của đất trước khi trồng cây.' },
  ],
  air: [
    { en: 'The air in the mountains is so clean and crisp.', vi: 'Không khí trên núi rất trong lành và sảng khoái.' },
    { en: 'Open the windows to let in some fresh air.', vi: 'Mở cửa sổ để không khí trong lành vào.' },
  ],
  ice: [
    { en: 'She put ice cubes in the glass to keep the drink cold.', vi: 'Cô ấy cho đá vào ly để giữ đồ uống lạnh.' },
    { en: 'Ice-cold sugarcane juice is a favourite drink in Vietnam.', vi: 'Nước mía đá lạnh là loại thức uống yêu thích ở Việt Nam.' },
  ],
  wave: [
    { en: 'She stood at the edge of the water as a wave washed over her feet.', vi: 'Cô ấy đứng ở mép nước khi một con sóng ập qua chân.' },
    { en: 'The waves were too strong for swimming that day.', vi: 'Sóng quá mạnh để bơi hôm đó.' },
  ],
  earth: [
    { en: 'We only have one earth, so we must take care of it.', vi: 'Chúng ta chỉ có một Trái Đất, vì vậy phải chăm sóc nó.' },
    { en: 'The earthquake shook the earth violently for thirty seconds.', vi: 'Trận động đất làm mặt đất rung chuyển dữ dội trong ba mươi giây.' },
  ],

  // ── Đại từ (bổ sung) ──────────────────────────────────────────
  i: [
    { en: 'I am learning English every day.', vi: 'Tôi học tiếng Anh mỗi ngày.' },
    { en: 'I live with my family in Hanoi.', vi: 'Tôi sống với gia đình ở Hà Nội.' },
  ],

  // ── Số đếm (bổ sung) ──────────────────────────────────────────
  thirteen: [
    { en: 'My sister will be thirteen years old next month.', vi: 'Chị tôi sẽ tròn mười ba tuổi vào tháng tới.' },
    { en: 'There are thirteen students in this small class.', vi: 'Có mười ba học sinh trong lớp nhỏ này.' },
  ],
  thirty: [
    { en: 'The meeting will start in thirty minutes.', vi: 'Cuộc họp sẽ bắt đầu sau ba mươi phút.' },
    { en: 'He saved thirty dollars to buy a new game.', vi: 'Cậu ấy để dành ba mươi đô để mua game mới.' },
  ],
  forty: [
    { en: 'My father is turning forty this year.', vi: 'Bố tôi năm nay bước sang tuổi bốn mươi.' },
    { en: 'The shop is forty metres from the bus stop.', vi: 'Cửa hàng cách trạm xe buýt bốn mươi mét.' },
  ],
  fifty: [
    { en: 'About fifty people came to the wedding.', vi: 'Khoảng năm mươi người đến dự đám cưới.' },
    { en: 'This jacket costs fifty thousand dong.', vi: 'Cái áo khoác này giá năm mươi nghìn đồng.' },
  ],

  // ── Từ chung (bổ sung) ────────────────────────────────────────
  color: [
    { en: 'What is your favourite color?', vi: 'Màu yêu thích của bạn là gì?' },
    { en: 'The walls are painted a warm color.', vi: 'Những bức tường được sơn một màu ấm.' },
  ],
  fruit: [
    { en: 'Fresh fruit is good for your health.', vi: 'Trái cây tươi tốt cho sức khỏe.' },
    { en: 'She buys fruit at the market every morning.', vi: 'Cô ấy mua trái cây ở chợ mỗi sáng.' },
  ],

  // ── Ngày trong tuần ───────────────────────────────────────────
  monday: [
    { en: 'I always feel tired on Monday morning.', vi: 'Tôi luôn thấy mệt vào sáng thứ Hai.' },
    { en: 'The new course starts next Monday.', vi: 'Khóa học mới bắt đầu vào thứ Hai tới.' },
  ],
  tuesday: [
    { en: 'We have an English class every Tuesday.', vi: 'Chúng tôi có lớp tiếng Anh vào mỗi thứ Ba.' },
    { en: 'The shop is closed on Tuesday.', vi: 'Cửa hàng đóng cửa vào thứ Ba.' },
  ],
  wednesday: [
    { en: 'The meeting was moved to Wednesday.', vi: 'Cuộc họp được dời sang thứ Tư.' },
    { en: 'On Wednesday I usually go to the gym.', vi: 'Vào thứ Tư tôi thường đến phòng gym.' },
  ],
  thursday: [
    { en: 'She visits her grandmother every Thursday.', vi: 'Cô ấy thăm bà vào mỗi thứ Năm.' },
    { en: 'The report is due this Thursday.', vi: 'Báo cáo phải nộp vào thứ Năm này.' },
  ],
  friday: [
    { en: 'Everyone loves Friday evening.', vi: 'Ai cũng thích tối thứ Sáu.' },
    { en: "Let's have dinner together on Friday.", vi: 'Tối thứ Sáu mình ăn tối cùng nhau nhé.' },
  ],
  saturday: [
    { en: 'I sleep late on Saturday morning.', vi: 'Tôi ngủ nướng vào sáng thứ Bảy.' },
    { en: 'We are going to the beach on Saturday.', vi: 'Thứ Bảy chúng tôi đi biển.' },
  ],
  sunday: [
    { en: 'My family has lunch together every Sunday.', vi: 'Gia đình tôi ăn trưa cùng nhau vào mỗi Chủ nhật.' },
    { en: 'Most shops open later on Sunday.', vi: 'Phần lớn cửa hàng mở cửa muộn hơn vào Chủ nhật.' },
  ],

  // ── Tháng trong năm ───────────────────────────────────────────
  january: [
    { en: 'The new year begins in January.', vi: 'Năm mới bắt đầu vào tháng Một.' },
    { en: 'It is often cold in January.', vi: 'Tháng Một trời thường lạnh.' },
  ],
  february: [
    { en: 'February is the shortest month of the year.', vi: 'Tháng Hai là tháng ngắn nhất trong năm.' },
    { en: 'Her birthday is in February.', vi: 'Sinh nhật cô ấy vào tháng Hai.' },
  ],
  march: [
    { en: 'The flowers bloom in March.', vi: 'Hoa nở vào tháng Ba.' },
    { en: 'We will move to a new house in March.', vi: 'Chúng tôi sẽ chuyển nhà mới vào tháng Ba.' },
  ],
  april: [
    { en: 'It often rains in April.', vi: 'Tháng Tư trời hay mưa.' },
    { en: 'The exam is at the end of April.', vi: 'Kỳ thi diễn ra vào cuối tháng Tư.' },
  ],
  may: [
    { en: 'The weather is warm and pleasant in May.', vi: 'Thời tiết tháng Năm ấm áp dễ chịu.' },
    { en: 'We are planning a trip in May.', vi: 'Chúng tôi đang lên kế hoạch một chuyến đi vào tháng Năm.' },
  ],
  june: [
    { en: 'Schools close for summer in June.', vi: 'Trường học nghỉ hè vào tháng Sáu.' },
    { en: 'June is the start of the rainy season here.', vi: 'Tháng Sáu là đầu mùa mưa ở đây.' },
  ],
  july: [
    { en: 'July is usually the hottest month.', vi: 'Tháng Bảy thường là tháng nóng nhất.' },
    { en: 'They got married in July.', vi: 'Họ cưới nhau vào tháng Bảy.' },
  ],
  august: [
    { en: 'We took a long holiday in August.', vi: 'Chúng tôi có một kỳ nghỉ dài vào tháng Tám.' },
    { en: 'The new school year starts after August.', vi: 'Năm học mới bắt đầu sau tháng Tám.' },
  ],
  september: [
    { en: 'Children go back to school in September.', vi: 'Trẻ em trở lại trường vào tháng Chín.' },
    { en: 'The weather gets cooler in September.', vi: 'Thời tiết mát dần vào tháng Chín.' },
  ],
  october: [
    { en: 'The leaves turn yellow in October.', vi: 'Lá cây chuyển vàng vào tháng Mười.' },
    { en: 'Her exam results came out in October.', vi: 'Kết quả thi của cô ấy có vào tháng Mười.' },
  ],
  november: [
    { en: 'The days get shorter in November.', vi: 'Ngày ngắn dần vào tháng Mười Một.' },
    { en: 'We plan to visit Hanoi in November.', vi: 'Chúng tôi định thăm Hà Nội vào tháng Mười Một.' },
  ],
  december: [
    { en: 'December is the last month of the year.', vi: 'Tháng Mười Hai là tháng cuối cùng của năm.' },
    { en: 'Many people travel home in December.', vi: 'Nhiều người về quê vào tháng Mười Hai.' },
  ],

  // ── Du lịch ───────────────────────────────────────────────────
  trip: [
    { en: 'We are planning a trip to Da Lat.', vi: 'Chúng tôi đang lên kế hoạch một chuyến đi Đà Lạt.' },
    { en: 'How was your business trip?', vi: 'Chuyến công tác của bạn thế nào?' },
  ],
  passport: [
    { en: "Don't forget to bring your passport to the airport.", vi: 'Đừng quên mang hộ chiếu ra sân bay.' },
    { en: 'My passport expires next year.', vi: 'Hộ chiếu của tôi hết hạn vào năm sau.' },
  ],
  luggage: [
    { en: 'My luggage was too heavy to carry.', vi: 'Hành lý của tôi quá nặng để xách.' },
    { en: 'Please keep an eye on your luggage.', vi: 'Làm ơn để mắt đến hành lý của bạn.' },
  ],
  suitcase: [
    { en: 'She packed her suitcase the night before.', vi: 'Cô ấy xếp va li từ đêm hôm trước.' },
    { en: 'My suitcase is too small for this trip.', vi: 'Va li của tôi quá nhỏ cho chuyến đi này.' },
  ],
  flight: [
    { en: 'Our flight was delayed by two hours.', vi: 'Chuyến bay của chúng tôi bị hoãn hai tiếng.' },
    { en: 'I booked a direct flight to Singapore.', vi: 'Tôi đã đặt một chuyến bay thẳng đến Singapore.' },
  ],
  abroad: [
    { en: 'She wants to study abroad after graduation.', vi: 'Cô ấy muốn đi du học sau khi tốt nghiệp.' },
    { en: 'Have you ever travelled abroad?', vi: 'Bạn đã bao giờ đi nước ngoài chưa?' },
  ],
  tourist: [
    { en: 'Hoi An is full of tourists in summer.', vi: 'Hội An đông khách du lịch vào mùa hè.' },
    { en: 'The tourist asked me for directions.', vi: 'Vị khách du lịch hỏi tôi đường.' },
  ],
  sightseeing: [
    { en: 'We spent the whole day sightseeing in the old town.', vi: 'Chúng tôi dành cả ngày tham quan phố cổ.' },
    { en: 'There is so much sightseeing to do in Hue.', vi: 'Ở Huế có rất nhiều nơi để tham quan.' },
  ],
  visa: [
    { en: 'You need a visa to enter that country.', vi: 'Bạn cần thị thực để vào nước đó.' },
    { en: 'My tourist visa is valid for one month.', vi: 'Thị thực du lịch của tôi có giá trị một tháng.' },
  ],
  currency: [
    { en: 'The local currency is the dong.', vi: 'Đồng tiền địa phương là đồng (VND).' },
    { en: 'You can exchange currency at the airport.', vi: 'Bạn có thể đổi tiền ở sân bay.' },
  ],
  souvenir: [
    { en: 'I bought a small souvenir for my mother.', vi: 'Tôi mua một món quà lưu niệm nhỏ cho mẹ.' },
    { en: 'This shop sells local souvenirs.', vi: 'Cửa hàng này bán đồ lưu niệm địa phương.' },
  ],
  beach: [
    { en: 'We swam at the beach all afternoon.', vi: 'Chúng tôi bơi ở bãi biển suốt buổi chiều.' },
    { en: 'Nha Trang has a long, sandy beach.', vi: 'Nha Trang có bãi biển dài đầy cát.' },
  ],
  vacation: [
    { en: 'We are going on vacation next week.', vi: 'Tuần tới chúng tôi đi nghỉ mát.' },
    { en: 'How did you spend your vacation?', vi: 'Bạn đã nghỉ mát thế nào?' },
  ],
  pack: [
    { en: 'I need to pack my bags tonight.', vi: 'Tối nay tôi cần xếp đồ vào túi.' },
    { en: "Don't forget to pack an umbrella.", vi: 'Đừng quên mang theo một cái ô.' },
  ],
  destination: [
    { en: 'Da Nang is a popular holiday destination.', vi: 'Đà Nẵng là điểm đến nghỉ dưỡng nổi tiếng.' },
    { en: 'We finally reached our destination at midnight.', vi: 'Cuối cùng chúng tôi đến nơi vào lúc nửa đêm.' },
  ],
  guide: [
    { en: 'The tour guide spoke very good English.', vi: 'Hướng dẫn viên nói tiếng Anh rất tốt.' },
    { en: 'This book is a useful travel guide.', vi: 'Cuốn sách này là một cẩm nang du lịch hữu ích.' },
  ],
  backpack: [
    { en: 'He carried everything in one backpack.', vi: 'Anh ấy mang tất cả trong một chiếc ba lô.' },
    { en: 'My backpack is light and easy to carry.', vi: 'Ba lô của tôi nhẹ và dễ mang.' },
  ],
  reservation: [
    { en: 'I made a reservation at the restaurant.', vi: 'Tôi đã đặt chỗ ở nhà hàng.' },
    { en: 'Do you have a hotel reservation?', vi: 'Bạn đã đặt phòng khách sạn chưa?' },
  ],

  // ── Truyền thông & giải trí ───────────────────────────────────
  movie: [
    { en: 'We watched a funny movie last night.', vi: 'Tối qua chúng tôi xem một bộ phim vui.' },
    { en: 'This movie is based on a true story.', vi: 'Bộ phim này dựa trên một câu chuyện có thật.' },
  ],
  film: [
    { en: 'The film won several awards.', vi: 'Bộ phim đã giành nhiều giải thưởng.' },
    { en: 'I prefer films with happy endings.', vi: 'Tôi thích phim có kết thúc có hậu.' },
  ],
  song: [
    { en: 'This song always makes me happy.', vi: 'Bài hát này luôn khiến tôi vui.' },
    { en: 'She sang a beautiful song at the party.', vi: 'Cô ấy hát một bài hát hay tại bữa tiệc.' },
  ],
  television: [
    { en: 'My grandparents watch television every evening.', vi: 'Ông bà tôi xem ti vi mỗi tối.' },
    { en: 'There is a good documentary on television tonight.', vi: 'Tối nay có một phim tài liệu hay trên ti vi.' },
  ],
  news: [
    { en: 'I read the news every morning.', vi: 'Tôi đọc tin tức mỗi sáng.' },
    { en: 'That is great news!', vi: 'Đó là một tin tuyệt vời!' },
  ],
  magazine: [
    { en: 'She writes for a fashion magazine.', vi: 'Cô ấy viết cho một tạp chí thời trang.' },
    { en: 'I bought a travel magazine at the station.', vi: 'Tôi mua một tạp chí du lịch ở nhà ga.' },
  ],
  article: [
    { en: 'I read an interesting article about health.', vi: 'Tôi đọc một bài báo thú vị về sức khỏe.' },
    { en: 'He wrote an article for the school newspaper.', vi: 'Anh ấy viết một bài cho báo trường.' },
  ],
  channel: [
    { en: 'Can you change the channel, please?', vi: 'Bạn đổi kênh giúp được không?' },
    { en: 'This channel only shows sports.', vi: 'Kênh này chỉ chiếu thể thao.' },
  ],
  concert: [
    { en: 'We went to a rock concert last weekend.', vi: 'Cuối tuần trước chúng tôi đi xem một buổi hòa nhạc rock.' },
    { en: 'The concert tickets sold out in minutes.', vi: 'Vé buổi hòa nhạc bán hết trong vài phút.' },
  ],
  series: [
    { en: 'I am watching a new series on the weekend.', vi: 'Cuối tuần tôi đang xem một bộ phim dài tập mới.' },
    { en: 'The series has five seasons.', vi: 'Bộ phim có năm mùa.' },
  ],
  podcast: [
    { en: 'I listen to a podcast on my way to work.', vi: 'Tôi nghe podcast trên đường đi làm.' },
    { en: 'This podcast is about learning English.', vi: 'Podcast này nói về việc học tiếng Anh.' },
  ],
  radio: [
    { en: 'My father listens to the radio in the car.', vi: 'Bố tôi nghe đài trong xe.' },
    { en: 'They played my favourite song on the radio.', vi: 'Họ phát bài hát yêu thích của tôi trên đài.' },
  ],
  audience: [
    { en: 'The audience clapped after the show.', vi: 'Khán giả vỗ tay sau buổi diễn.' },
    { en: 'The speaker asked the audience a question.', vi: 'Diễn giả đặt một câu hỏi cho khán giả.' },
  ],
  review: [
    { en: 'I read a good review of that restaurant.', vi: 'Tôi đọc một bài đánh giá tốt về nhà hàng đó.' },
    { en: 'She wrote a review of the new phone.', vi: 'Cô ấy viết một bài đánh giá chiếc điện thoại mới.' },
  ],
  advertisement: [
    { en: 'I saw an advertisement for the job online.', vi: 'Tôi thấy một quảng cáo tuyển dụng trên mạng.' },
    { en: 'The advertisement was very funny.', vi: 'Mẩu quảng cáo rất hài hước.' },
  ],
  celebrity: [
    { en: 'A famous celebrity visited our city.', vi: 'Một người nổi tiếng đã đến thăm thành phố chúng tôi.' },
    { en: 'She became a celebrity after the film.', vi: 'Cô ấy trở thành người nổi tiếng sau bộ phim.' },
  ],
  episode: [
    { en: 'The last episode was really exciting.', vi: 'Tập cuối thật sự rất hấp dẫn.' },
    { en: 'I missed the first episode of the show.', vi: 'Tôi đã bỏ lỡ tập đầu của chương trình.' },
  ],

  // ── Môi trường ────────────────────────────────────────────────
  environment: [
    { en: 'We must protect the environment for the future.', vi: 'Chúng ta phải bảo vệ môi trường cho tương lai.' },
    { en: 'Plastic bags harm the environment.', vi: 'Túi nilon gây hại cho môi trường.' },
  ],
  pollution: [
    { en: 'Air pollution is a serious problem in big cities.', vi: 'Ô nhiễm không khí là vấn đề nghiêm trọng ở các thành phố lớn.' },
    { en: 'We can reduce pollution by using public transport.', vi: 'Chúng ta có thể giảm ô nhiễm bằng cách dùng phương tiện công cộng.' },
  ],
  climate: [
    { en: 'Climate change affects the whole planet.', vi: 'Biến đổi khí hậu ảnh hưởng đến cả hành tinh.' },
    { en: 'This region has a tropical climate.', vi: 'Vùng này có khí hậu nhiệt đới.' },
  ],
  recycle: [
    { en: 'We recycle paper, glass and plastic at home.', vi: 'Ở nhà chúng tôi tái chế giấy, thủy tinh và nhựa.' },
    { en: 'Please recycle these bottles.', vi: 'Làm ơn tái chế những chai này.' },
  ],
  plastic: [
    { en: 'Too much plastic ends up in the ocean.', vi: 'Quá nhiều nhựa trôi ra đại dương.' },
    { en: 'Try to use less plastic every day.', vi: 'Hãy cố dùng ít nhựa hơn mỗi ngày.' },
  ],
  energy: [
    { en: 'Turn off the lights to save energy.', vi: 'Tắt đèn để tiết kiệm năng lượng.' },
    { en: 'Solar panels produce clean energy.', vi: 'Tấm pin mặt trời tạo ra năng lượng sạch.' },
  ],
  waste: [
    { en: "Don't waste water when you brush your teeth.", vi: 'Đừng lãng phí nước khi đánh răng.' },
    { en: 'The factory must treat its waste properly.', vi: 'Nhà máy phải xử lý chất thải đúng cách.' },
  ],
  planet: [
    { en: 'Earth is the only planet we can live on.', vi: 'Trái Đất là hành tinh duy nhất chúng ta có thể sống.' },
    { en: 'We all share one planet.', vi: 'Tất cả chúng ta chung một hành tinh.' },
  ],
  protect: [
    { en: 'We should protect wild animals.', vi: 'Chúng ta nên bảo vệ động vật hoang dã.' },
    { en: 'A helmet protects your head.', vi: 'Mũ bảo hiểm bảo vệ đầu của bạn.' },
  ],
  reduce: [
    { en: 'We need to reduce our use of plastic.', vi: 'Chúng ta cần giảm việc dùng nhựa.' },
    { en: 'Walking to work can reduce pollution.', vi: 'Đi bộ đi làm có thể giảm ô nhiễm.' },
  ],
  garbage: [
    { en: 'Please take out the garbage tonight.', vi: 'Làm ơn đổ rác tối nay.' },
    { en: 'The streets were full of garbage after the festival.', vi: 'Đường phố đầy rác sau lễ hội.' },
  ],
  endangered: [
    { en: 'Tigers are an endangered species.', vi: 'Hổ là một loài có nguy cơ tuyệt chủng.' },
    { en: 'Many endangered animals live in this forest.', vi: 'Nhiều loài vật nguy cấp sống trong khu rừng này.' },
  ],
  species: [
    { en: 'Scientists discovered a new species of frog.', vi: 'Các nhà khoa học phát hiện một loài ếch mới.' },
    { en: 'Some species are disappearing very fast.', vi: 'Một số loài đang biến mất rất nhanh.' },
  ],
  renewable: [
    { en: 'Wind is a renewable source of energy.', vi: 'Gió là một nguồn năng lượng tái tạo.' },
    { en: 'Many countries are investing in renewable energy.', vi: 'Nhiều nước đang đầu tư vào năng lượng tái tạo.' },
  ],
  solar: [
    { en: 'They installed solar panels on the roof.', vi: 'Họ lắp tấm pin mặt trời trên mái nhà.' },
    { en: 'Solar power is cheaper than before.', vi: 'Điện mặt trời rẻ hơn trước đây.' },
  ],
  drought: [
    { en: 'The long drought damaged the rice fields.', vi: 'Đợt hạn hán kéo dài làm hỏng những cánh đồng lúa.' },
    { en: 'Farmers worry about drought every dry season.', vi: 'Nông dân lo lắng về hạn hán mỗi mùa khô.' },
  ],
  litter: [
    { en: "Please don't litter in the park.", vi: 'Làm ơn đừng xả rác trong công viên.' },
    { en: 'There was a lot of litter on the beach.', vi: 'Có rất nhiều rác trên bãi biển.' },
  ],
  sustainable: [
    { en: 'We need a more sustainable way of living.', vi: 'Chúng ta cần một lối sống bền vững hơn.' },
    { en: 'Sustainable farming protects the soil.', vi: 'Canh tác bền vững bảo vệ đất.' },
  ],
}
