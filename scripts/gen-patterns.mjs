// ════════════════════════════════════════════════════════════════════
//  gen-patterns.mjs — Sinh dữ liệu "Cụm từ thông dụng theo chủ thể"
//  Mục tiêu: 1000 chủ thể × 100 câu (Anh + Việt), chia file 8 chủ thể/chunk
//  để giao diện lazy load đúng 8 cái mỗi lần.
//
//  Cách hoạt động: ghép CHỦ THỂ (I, He, The teacher...) với KHUNG ngữ pháp
//  (have, was, want to...) rồi gắn BỔ NGỮ lấy từ 3 kho dùng chung.
//  => Câu luôn đúng ngữ pháp cả tiếng Anh lẫn tiếng Việt.
//
//  Chạy lại khi sửa kho/chủ thể:  node scripts/gen-patterns.mjs
// ════════════════════════════════════════════════════════════════════

import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'src', 'data', 'patterns')
const SENTENCES_PER_SUBJECT = 100
const SUBJECTS_PER_CHUNK = 8

// ─────────────────────────────────────────────────────────────────────
//  KHO 1 — CỤM ĐỘNG TỪ (dạng nguyên thể, dùng sau "to / can / don't...")
// ─────────────────────────────────────────────────────────────────────
const VERB = [
  ['help out','giúp đỡ'],['learn English','học tiếng Anh'],['go home','về nhà'],
  ['take a break','nghỉ giải lao'],['call back later','gọi lại sau'],
  ['finish the report','hoàn thành báo cáo'],['try again','thử lại'],
  ['ask a question','hỏi một câu'],['make a decision','đưa ra quyết định'],
  ['change the plan','thay đổi kế hoạch'],['join the meeting','tham gia cuộc họp'],
  ['send the email','gửi email'],['check the details','kiểm tra chi tiết'],
  ['fix the problem','sửa vấn đề'],['save money','tiết kiệm tiền'],
  ['start over','bắt đầu lại'],['work harder','làm việc chăm chỉ hơn'],
  ['speak English','nói tiếng Anh'],['travel abroad','đi du lịch nước ngoài'],
  ['stay home','ở nhà'],['wait a moment','chờ một chút'],['leave early','về sớm'],
  ['arrive on time','đến đúng giờ'],['cook dinner','nấu bữa tối'],
  ['buy a new phone','mua điện thoại mới'],['read more books','đọc thêm sách'],
  ['exercise every day','tập thể dục mỗi ngày'],['drink more water','uống nhiều nước hơn'],
  ['sleep early','ngủ sớm'],['quit smoking','bỏ thuốc lá'],['lose weight','giảm cân'],
  ['find a job','tìm việc làm'],['apply for the position','nộp đơn cho vị trí'],
  ['talk to the manager','nói chuyện với quản lý'],['book a ticket','đặt vé'],
  ['plan a trip','lên kế hoạch một chuyến đi'],['visit my family','thăm gia đình'],
  ['meet new people','gặp gỡ người mới'],['make new friends','kết bạn mới'],
  ['improve my skills','cải thiện kỹ năng'],['practice every day','luyện tập mỗi ngày'],
  ['pass the exam','đậu kỳ thi'],['get a promotion','được thăng chức'],
  ['open a business','mở một doanh nghiệp'],['help the team','giúp đỡ nhóm'],
  ['solve this issue','giải quyết vấn đề này'],['explain the situation','giải thích tình huống'],
  ['share my opinion','chia sẻ ý kiến'],['take notes','ghi chép'],
  ['follow the rules','tuân theo quy tắc'],['keep a promise','giữ lời hứa'],
  ['tell the truth','nói sự thật'],['say sorry','nói lời xin lỗi'],
  ['thank everyone','cảm ơn mọi người'],['take a rest','nghỉ ngơi'],
  ['watch a movie','xem phim'],['listen to music','nghe nhạc'],
  ['clean the house','dọn nhà'],['do the laundry','giặt đồ'],
  ['pay the bill','thanh toán hóa đơn'],['order food','gọi đồ ăn'],
  ['take the bus','đi xe buýt'],['drive to work','lái xe đi làm'],
  ['walk the dog','dắt chó đi dạo'],['water the plants','tưới cây'],
  ['answer the phone','trả lời điện thoại'],['reply to the message','trả lời tin nhắn'],
  ['schedule a meeting','sắp xếp cuộc họp'],['cancel the order','hủy đơn hàng'],
  ['confirm the booking','xác nhận đặt chỗ'],['sign the contract','ký hợp đồng'],
  ['review the document','xem lại tài liệu'],['prepare the presentation','chuẩn bị bài thuyết trình'],
  ['attend the workshop','tham dự buổi hội thảo'],['register for the course','đăng ký khóa học'],
  ['download the file','tải tệp xuống'],['update the software','cập nhật phần mềm'],
  ['back up the data','sao lưu dữ liệu'],['turn off the light','tắt đèn'],
  ['lock the door','khóa cửa'],['close the window','đóng cửa sổ'],
  ['take a photo','chụp một bức ảnh'],['charge the phone','sạc điện thoại'],
  ['fill out the form','điền vào biểu mẫu'],['make a reservation','đặt chỗ trước'],
  ['give it a try','thử một lần'],['take a chance','nắm lấy cơ hội'],
  ['ask for help','nhờ giúp đỡ'],['offer support','đề nghị hỗ trợ'],
  ['make a plan','lập một kế hoạch'],['set a goal','đặt một mục tiêu'],
  ['stay focused','giữ tập trung'],['calm down','bình tĩnh lại'],
  ['think it over','suy nghĩ kỹ'],['move forward','tiến về phía trước'],
  ['start a new project','bắt đầu một dự án mới'],['finish on time','hoàn thành đúng hạn'],
  ['double-check everything','kiểm tra lại mọi thứ'],['keep in touch','giữ liên lạc'],
  ['enjoy the weekend','tận hưởng cuối tuần'],['learn something new','học điều gì đó mới'],
  ['take it easy','thư giãn'],['be on time','đến đúng giờ'],
  ['understand the lesson','hiểu bài học'],['remember the password','nhớ mật khẩu'],
  ['call a friend','gọi cho một người bạn'],['write a report','viết một báo cáo'],
  ['read the news','đọc tin tức'],['check my email','kiểm tra email'],
  ['attend the class','tham gia lớp học'],['take the exam','làm bài thi'],
  ['submit the form','nộp biểu mẫu'],['print the document','in tài liệu'],
  ['scan the receipt','quét hóa đơn'],['book a hotel','đặt khách sạn'],
  ['rent a car','thuê xe'],['catch the train','bắt chuyến tàu'],
  ['miss the flight','lỡ chuyến bay'],['pack my bags','xếp hành lý'],
  ['wash the dishes','rửa bát'],['cook breakfast','nấu bữa sáng'],
  ['make tea','pha trà'],['buy groceries','mua thực phẩm'],
  ['cut the budget','cắt giảm ngân sách'],['raise the price','tăng giá'],
  ['lower the cost','giảm chi phí'],['hire new staff','tuyển nhân viên mới'],
  ['train the team','đào tạo nhóm'],['lead the project','dẫn dắt dự án'],
  ['manage the schedule','quản lý lịch trình'],['meet the deadline','kịp thời hạn'],
  ['reach the goal','đạt mục tiêu'],['win the contract','giành hợp đồng'],
  ['close the deal','chốt thỏa thuận'],['negotiate the terms','thương lượng điều khoản'],
  ['sign up today','đăng ký hôm nay'],['log in again','đăng nhập lại'],
  ['reset the password','đặt lại mật khẩu'],['restart the computer','khởi động lại máy tính'],
  ['install the app','cài đặt ứng dụng'],['delete the file','xóa tệp'],
  ['copy the link','sao chép liên kết'],['share the post','chia sẻ bài viết'],
  ['leave a comment','để lại bình luận'],['rate the service','đánh giá dịch vụ'],
  ['give feedback','góp ý'],['report the bug','báo lỗi'],
  ['test the feature','kiểm thử tính năng'],['launch the product','ra mắt sản phẩm'],
  ['grow the business','phát triển kinh doanh'],['invest wisely','đầu tư khôn ngoan'],
  ['cut expenses','cắt giảm chi tiêu'],['pay off the loan','trả hết khoản vay'],
  ['open a savings account','mở tài khoản tiết kiệm'],['donate to charity','quyên góp từ thiện'],
  ['volunteer on weekends','tình nguyện cuối tuần'],['join a club','tham gia câu lạc bộ'],
  ['learn to swim','học bơi'],['take a course','tham gia một khóa học'],
  ['study abroad','du học'],['get a degree','lấy bằng'],
  ['change careers','chuyển nghề'],['ask for a raise','xin tăng lương'],
  ['take a day off','xin nghỉ một ngày'],['go on vacation','đi nghỉ mát'],
  ['visit the doctor','đi khám bác sĩ'],['take medicine','uống thuốc'],
  ['get some rest','nghỉ ngơi một chút'],['eat healthy','ăn uống lành mạnh'],
  ['drink less coffee','uống ít cà phê hơn'],['go for a walk','đi dạo'],
  ['ride a bike','đạp xe'],['play sports','chơi thể thao'],
  ['watch the game','xem trận đấu'],['cheer for the team','cổ vũ cho đội'],
  ['celebrate together','ăn mừng cùng nhau'],['throw a party','tổ chức tiệc'],
  ['invite some friends','mời vài người bạn'],['cook for everyone','nấu ăn cho mọi người'],
  ['say goodbye','nói lời tạm biệt'],['keep a diary','viết nhật ký'],
  ['set an alarm','đặt báo thức'],['wake up early','dậy sớm'],
  ['stay up late','thức khuya'],['relax at home','thư giãn ở nhà'],
  ['meditate daily','thiền mỗi ngày'],['breathe deeply','hít thở sâu'],
  ['think positive','suy nghĩ tích cực'],['help a neighbor','giúp một người hàng xóm'],
  ['support each other','hỗ trợ lẫn nhau'],['work as a team','làm việc theo nhóm'],
  ['split the bill','chia hóa đơn'],['save for the future','tiết kiệm cho tương lai'],
  ['plan ahead','lên kế hoạch trước'],['stay organized','giữ ngăn nắp'],
  ['keep learning','tiếp tục học hỏi'],['never give up','không bao giờ bỏ cuộc'],
  ['try harder next time','cố gắng hơn lần sau'],['ask more questions','hỏi nhiều hơn'],
  ['listen carefully','lắng nghe cẩn thận'],['speak clearly','nói rõ ràng'],
  ['write it down','ghi nó lại'],['double-check the numbers','kiểm tra lại các con số'],
]

// ─────────────────────────────────────────────────────────────────────
//  KHO 2 — CỤM DANH TỪ (dùng sau "have / has")
// ─────────────────────────────────────────────────────────────────────
const NOUN = [
  ['a question','một câu hỏi'],['a meeting','một cuộc họp'],['a problem','một vấn đề'],
  ['an idea','một ý tưởng'],['a plan','một kế hoạch'],['a good reason','một lý do chính đáng'],
  ['enough time','đủ thời gian'],['a lot of work','rất nhiều việc'],
  ['some experience','một chút kinh nghiệm'],['a new job','một công việc mới'],
  ['a busy schedule','một lịch trình bận rộn'],['a great opportunity','một cơ hội tuyệt vời'],
  ['a deadline tomorrow','một thời hạn vào ngày mai'],['a few questions','một vài câu hỏi'],
  ['a suggestion','một đề xuất'],['a concern','một mối lo ngại'],['a request','một yêu cầu'],
  ['an appointment','một cuộc hẹn'],['a doctor\'s appointment','một cuộc hẹn với bác sĩ'],
  ['an important call','một cuộc gọi quan trọng'],['a new project','một dự án mới'],
  ['a small family','một gia đình nhỏ'],['two children','hai đứa con'],
  ['a pet dog','một chú chó cưng'],['a car','một chiếc xe hơi'],
  ['a new phone','một chiếc điện thoại mới'],['a headache','một cơn đau đầu'],
  ['a cold','bị cảm lạnh'],['a fever','bị sốt'],['a sore throat','đau họng'],
  ['good news','tin tốt'],['bad news','tin xấu'],['a lot of friends','rất nhiều bạn bè'],
  ['a long day','một ngày dài'],['a big decision to make','một quyết định lớn phải đưa ra'],
  ['a great team','một đội ngũ tuyệt vời'],['high expectations','kỳ vọng cao'],
  ['a tight budget','một ngân sách eo hẹp'],['a clear goal','một mục tiêu rõ ràng'],
  ['a strong opinion','một quan điểm mạnh mẽ'],['a different view','một góc nhìn khác'],
  ['a good point','một ý hay'],['a backup plan','một kế hoạch dự phòng'],
  ['a lot to learn','nhiều điều phải học'],['a lot to do','nhiều việc phải làm'],
  ['a question for you','một câu hỏi cho bạn'],['a favor to ask','một việc muốn nhờ'],
  ['a meeting at 3 PM','một cuộc họp lúc 3 giờ chiều'],['a reservation','một chỗ đặt trước'],
  ['a complaint','một lời phàn nàn'],['a special offer','một ưu đãi đặc biệt'],
  ['a discount','một ưu đãi giảm giá'],['a warranty','một chế độ bảo hành'],
  ['a question about the price','một câu hỏi về giá'],['a lot of experience','rất nhiều kinh nghiệm'],
  ['a degree in business','một bằng cấp về kinh doanh'],['a driver\'s license','một bằng lái xe'],
  ['an account here','một tài khoản ở đây'],['a reservation for two','một chỗ đặt cho hai người'],
  ['a table by the window','một bàn cạnh cửa sổ'],['a spare room','một phòng trống'],
  ['a flight at noon','một chuyến bay lúc trưa'],['a meeting with the client','một cuộc họp với khách hàng'],
  ['a lot on my mind','nhiều điều trong đầu'],['a feeling about this','một linh cảm về điều này'],
  ['a solution','một giải pháp'],['a better option','một lựa chọn tốt hơn'],
  ['a quick question','một câu hỏi nhanh'],['a long way to go','một chặng đường dài phía trước'],
  ['a big presentation','một bài thuyết trình lớn'],['a lot of responsibility','nhiều trách nhiệm'],
  ['a part-time job','một công việc bán thời gian'],['a side project','một dự án phụ'],
  ['a great mentor','một người cố vấn tuyệt vời'],['a supportive family','một gia đình ủng hộ'],
  ['a comfortable home','một ngôi nhà thoải mái'],['a healthy lifestyle','một lối sống lành mạnh'],
  ['a daily routine','một thói quen hằng ngày'],['a strong connection','một kết nối bền chặt'],
  ['a positive attitude','một thái độ tích cực'],['a busy week ahead','một tuần bận rộn phía trước'],
  ['a meeting this afternoon','một cuộc họp chiều nay'],['a phone call to make','một cuộc gọi cần thực hiện'],
  ['an email to send','một email cần gửi'],['a report to finish','một báo cáo cần hoàn thành'],
  ['a lot of homework','rất nhiều bài tập'],['a test next week','một bài kiểm tra vào tuần tới'],
  ['a presentation today','một bài thuyết trình hôm nay'],['a great idea for the project','một ý tưởng tuyệt cho dự án'],
  ['a good relationship with them','một mối quan hệ tốt với họ'],['a reason to celebrate','một lý do để ăn mừng'],
  ['a chance to win','một cơ hội để thắng'],['a question about the schedule','một câu hỏi về lịch trình'],
  ['a meeting tomorrow morning','một cuộc họp sáng mai'],['a new neighbor','một người hàng xóm mới'],
  ['a lovely garden','một khu vườn đáng yêu'],['a tight deadline','một thời hạn gấp'],
  ['a wonderful weekend','một cuối tuần tuyệt vời'],['a strong team spirit','một tinh thần đồng đội mạnh mẽ'],
  ['a clear schedule today','một lịch trình trống hôm nay'],['a brilliant idea','một ý tưởng xuất sắc'],
  ['a bright future','một tương lai tươi sáng'],['a busy morning','một buổi sáng bận rộn'],
  ['a quiet evening','một buổi tối yên tĩnh'],['a long weekend','một kỳ nghỉ cuối tuần dài'],
  ['a short break','một khoảng nghỉ ngắn'],['a tight schedule','một lịch trình dày đặc'],
  ['a good night\'s sleep','một giấc ngủ ngon'],['a balanced diet','một chế độ ăn cân bằng'],
  ['a gym membership','một thẻ tập gym'],['a personal trainer','một huấn luyện viên riêng'],
  ['a new hobby','một sở thích mới'],['a favorite book','một cuốn sách yêu thích'],
  ['a good movie','một bộ phim hay'],['a playlist for work','một danh sách nhạc để làm việc'],
  ['a cup of coffee','một tách cà phê'],['a glass of water','một ly nước'],
  ['a quick lunch','một bữa trưa nhanh'],['a home-cooked meal','một bữa ăn tự nấu'],
  ['a dinner reservation','một chỗ đặt bữa tối'],['a shopping list','một danh sách mua sắm'],
  ['a credit card','một thẻ tín dụng'],['a monthly budget','một ngân sách hàng tháng'],
  ['a savings plan','một kế hoạch tiết kiệm'],['a side income','một nguồn thu phụ'],
  ['a business idea','một ý tưởng kinh doanh'],['a startup plan','một kế hoạch khởi nghiệp'],
  ['a marketing strategy','một chiến lược tiếp thị'],['a loyal customer','một khách hàng trung thành'],
  ['a positive review','một đánh giá tích cực'],['a new contract','một hợp đồng mới'],
  ['a job interview','một buổi phỏng vấn việc làm'],['a strong resume','một bản lý lịch ấn tượng'],
  ['a reference letter','một thư giới thiệu'],['a promotion soon','một đợt thăng chức sắp tới'],
  ['a pay raise','một đợt tăng lương'],['a flexible schedule','một lịch trình linh hoạt'],
  ['a remote job','một công việc từ xa'],['a quiet workspace','một không gian làm việc yên tĩnh'],
  ['a fast internet connection','một kết nối internet nhanh'],['a reliable laptop','một chiếc laptop đáng tin cậy'],
  ['a backup device','một thiết bị dự phòng'],['a pair of headphones','một cặp tai nghe'],
  ['a comfortable chair','một chiếc ghế thoải mái'],['a standing desk','một bàn đứng'],
  ['a water bottle','một bình nước'],['a notebook and pen','một quyển sổ và bút'],
  ['a to-do list','một danh sách việc cần làm'],['a calendar reminder','một lời nhắc lịch'],
  ['a morning routine','một thói quen buổi sáng'],['a workout plan','một kế hoạch tập luyện'],
  ['a rest day','một ngày nghỉ ngơi'],['a doctor nearby','một bác sĩ gần đây'],
  ['health insurance','bảo hiểm sức khỏe'],['a regular checkup','một lần khám định kỳ'],
  ['a good night out','một buổi tối đi chơi vui'],['a weekend trip','một chuyến đi cuối tuần'],
  ['a travel plan','một kế hoạch du lịch'],['a passport ready','một hộ chiếu sẵn sàng'],
  ['a window seat','một ghế cạnh cửa sổ'],['a return ticket','một vé khứ hồi'],
  ['a local guide','một hướng dẫn viên địa phương'],['a city map','một bản đồ thành phố'],
  ['a hotel booking','một đặt phòng khách sạn'],['a beautiful view','một khung cảnh đẹp'],
  ['a sunny day','một ngày nắng đẹp'],['a rainy afternoon','một buổi chiều mưa'],
  ['a cozy cafe','một quán cà phê ấm cúng'],['a long conversation','một cuộc trò chuyện dài'],
  ['a helpful tip','một mẹo hữu ích'],['a fresh perspective','một góc nhìn mới mẻ'],
  ['a clear answer','một câu trả lời rõ ràng'],['a simple explanation','một lời giải thích đơn giản'],
  ['a detailed plan','một kế hoạch chi tiết'],['a realistic goal','một mục tiêu thực tế'],
  ['a second chance','một cơ hội thứ hai'],['a fresh start','một khởi đầu mới'],
  ['a good habit','một thói quen tốt'],['a strong mindset','một tư duy mạnh mẽ'],
  ['a supportive friend','một người bạn biết động viên'],['a kind gesture','một cử chỉ tử tế'],
  ['a warm welcome','một sự chào đón nồng nhiệt'],['a big surprise','một bất ngờ lớn'],
  ['a happy ending','một cái kết có hậu'],['a meaningful goal','một mục tiêu ý nghĩa'],
  ['a busy inbox','một hộp thư đầy ắp'],['a packed calendar','một lịch kín'],
  ['a pending task','một nhiệm vụ còn dang dở'],['an urgent matter','một việc khẩn cấp'],
  ['a minor issue','một vấn đề nhỏ'],['a major update','một bản cập nhật lớn'],
  ['a final decision','một quyết định cuối cùng'],['a clear deadline','một thời hạn rõ ràng'],
  ['a fair price','một mức giá hợp lý'],['a great deal','một món hời'],
]

// ─────────────────────────────────────────────────────────────────────
//  KHO 3 — TÍNH TỪ / CỤM TÍNH TỪ (dùng sau "be / was")
// ─────────────────────────────────────────────────────────────────────
const ADJ = [
  ['happy','vui'],['tired','mệt'],['busy','bận'],['ready','sẵn sàng'],
  ['hungry','đói'],['thirsty','khát'],['excited','hào hứng'],['nervous','hồi hộp'],
  ['worried','lo lắng'],['confident','tự tin'],['proud','tự hào'],['grateful','biết ơn'],
  ['confused','bối rối'],['surprised','ngạc nhiên'],['disappointed','thất vọng'],
  ['satisfied','hài lòng'],['comfortable','thoải mái'],['curious','tò mò'],
  ['motivated','có động lực'],['exhausted','kiệt sức'],['sleepy','buồn ngủ'],
  ['sick','ốm'],['stressed','căng thẳng'],['relaxed','thư giãn'],['bored','chán'],
  ['lonely','cô đơn'],['scared','sợ hãi'],['angry','tức giận'],['upset','buồn bực'],
  ['calm','bình tĩnh'],['fine','ổn'],['okay','ổn cả'],['late','muộn'],['early','sớm'],
  ['lucky','may mắn'],['careful','cẩn thận'],['honest','trung thực'],['friendly','thân thiện'],
  ['patient','kiên nhẫn'],['polite','lịch sự'],['serious','nghiêm túc'],['sure','chắc chắn'],
  ['free this weekend','rảnh cuối tuần này'],['available tomorrow','rảnh vào ngày mai'],
  ['interested','quan tâm'],['impressed','ấn tượng'],['thankful','biết ơn'],
  ['hopeful','tràn đầy hy vọng'],['optimistic','lạc quan'],['determined','quyết tâm'],
  ['focused','tập trung'],['organized','ngăn nắp'],['creative','sáng tạo'],
  ['responsible','có trách nhiệm'],['reliable','đáng tin cậy'],['flexible','linh hoạt'],
  ['open to ideas','cởi mở với ý tưởng'],['new here','mới đến đây'],
  ['from Vietnam','đến từ Việt Nam'],['on my way','đang trên đường'],
  ['almost done','gần xong'],['a little tired','hơi mệt'],['very happy','rất vui'],
  ['quite busy','khá bận'],['so excited','rất hào hứng'],['really proud','thực sự tự hào'],
  ['super hungry','đói lắm'],['a bit nervous','hơi hồi hộp'],['totally lost','hoàn toàn lạc lối'],
  ['wide awake','tỉnh táo hẳn'],['in a hurry','đang vội'],['in a good mood','đang vui vẻ'],
  ['out of energy','hết năng lượng'],['short on time','thiếu thời gian'],
  ['ready to go','sẵn sàng đi'],['willing to help','sẵn lòng giúp'],
  ['glad to be here','vui khi được ở đây'],['happy to help','sẵn lòng giúp đỡ'],
  ['sorry for the delay','xin lỗi vì sự chậm trễ'],['afraid of failing','sợ thất bại'],
  ['proud of my work','tự hào về công việc của mình'],['worried about the exam','lo lắng về kỳ thi'],
  ['grateful for your help','biết ơn sự giúp đỡ của bạn'],['excited about the trip','hào hứng về chuyến đi'],
  ['confident about the result','tự tin về kết quả'],['sure about my decision','chắc chắn về quyết định của mình'],
  ['happy with the result','hài lòng với kết quả'],['satisfied with the service','hài lòng với dịch vụ'],
  ['interested in the offer','quan tâm đến lời đề nghị'],['good at English','giỏi tiếng Anh'],
  ['bad at cooking','dở nấu ăn'],['new to this','mới với việc này'],
  ['used to it','đã quen với nó'],['ready for the challenge','sẵn sàng cho thử thách'],
  ['proud of the team','tự hào về đội'],['thankful for everything','biết ơn vì tất cả'],
  ['nervous about the interview','hồi hộp về buổi phỏng vấn'],['hopeful about the future','hy vọng về tương lai'],
  ['happy to see you','vui khi gặp bạn'],['glad you came','vui vì bạn đã đến'],
  ['free right now','rảnh ngay bây giờ'],['done for today','xong việc cho hôm nay'],
  ['cheerful','vui vẻ'],['energetic','tràn đầy năng lượng'],['peaceful','yên bình'],
  ['joyful','hân hoan'],['content','mãn nguyện'],['delighted','vui sướng'],
  ['amazed','kinh ngạc'],['inspired','được truyền cảm hứng'],['encouraged','được động viên'],
  ['refreshed','sảng khoái'],['well-rested','được nghỉ ngơi đầy đủ'],['alert','tỉnh táo'],
  ['cautious','thận trọng'],['thoughtful','chu đáo'],['considerate','biết quan tâm'],
  ['generous','rộng lượng'],['humble','khiêm tốn'],['ambitious','tham vọng'],
  ['hardworking','chăm chỉ'],['dedicated','tận tâm'],['passionate','đầy đam mê'],
  ['enthusiastic','nhiệt tình'],['calm and collected','bình tĩnh và điềm đạm'],
  ['under pressure','dưới áp lực'],['behind schedule','chậm tiến độ'],
  ['ahead of schedule','sớm hơn dự kiến'],['on the right track','đi đúng hướng'],
  ['full of energy','tràn đầy năng lượng'],['out of practice','lâu rồi không luyện'],
  ['short of money','thiếu tiền'],['low on battery','sắp hết pin'],
  ['out of ideas','hết ý tưởng'],['full of ideas','đầy ý tưởng'],
  ['ready for anything','sẵn sàng cho mọi thứ'],['open to feedback','cởi mở với góp ý'],
  ['eager to learn','háo hức học hỏi'],['quick to respond','phản hồi nhanh'],
  ['easy to talk to','dễ trò chuyện'],['hard to please','khó chiều'],
  ['proud of the result','tự hào về kết quả'],['happy for you','mừng cho bạn'],
  ['sorry to hear that','tiếc khi nghe điều đó'],['glad it worked','vui vì nó hiệu quả'],
  ['relieved','nhẹ nhõm'],['hopeful again','lại tràn hy vọng'],
  ['stronger than before','mạnh mẽ hơn trước'],['better than yesterday','tốt hơn hôm qua'],
  ['close to the goal','gần đạt mục tiêu'],['ready to start','sẵn sàng bắt đầu'],
  ['done with work','xong việc'],['free all day','rảnh cả ngày'],
  ['busy until noon','bận đến trưa'],['available after lunch','rảnh sau bữa trưa'],
  ['back at the office','đã trở lại văn phòng'],['working from home','làm việc tại nhà'],
  ['on a break','đang nghỉ giải lao'],['in a meeting','đang họp'],
  ['on the phone','đang nghe điện thoại'],['out for lunch','ra ngoài ăn trưa'],
  ['stuck in traffic','kẹt xe'],['almost there','sắp đến nơi'],
  ['running late','bị trễ'],['right on time','đúng giờ'],
  ['a bit overwhelmed','hơi quá tải'],['surprisingly calm','bình tĩnh đến lạ'],
  ['cautiously optimistic','lạc quan thận trọng'],['deeply grateful','vô cùng biết ơn'],
  ['truly impressed','thực sự ấn tượng'],['fully prepared','chuẩn bị kỹ càng'],
  ['slightly worried','hơi lo'],['quite confident','khá tự tin'],
  ['extremely tired','cực kỳ mệt'],['very motivated','rất có động lực'],
  ['completely lost','hoàn toàn lạc lối'],['totally focused','hoàn toàn tập trung'],
  ['absolutely sure','chắc chắn tuyệt đối'],['perfectly fine','hoàn toàn ổn'],
  ['more than happy','hơn cả vui'],['proud and grateful','tự hào và biết ơn'],
  ['calm and ready','bình tĩnh và sẵn sàng'],['tired but happy','mệt nhưng vui'],
  ['busy but okay','bận nhưng ổn'],['nervous but excited','hồi hộp nhưng hào hứng'],
  ['curious about it','tò mò về nó'],['serious about this','nghiêm túc về việc này'],
  ['committed to the plan','cam kết với kế hoạch'],['confident in the team','tin tưởng vào nhóm'],
  ['proud of everyone','tự hào về mọi người'],['thankful for today','biết ơn ngày hôm nay'],
  ['ready for the weekend','sẵn sàng cho cuối tuần'],['excited for tomorrow','háo hức cho ngày mai'],
  ['glad to help','vui được giúp đỡ'],['happy to be back','vui khi trở lại'],
  ['sad to leave','buồn khi phải đi'],['proud of the progress','tự hào về sự tiến bộ'],
  ['hopeful for the best','hy vọng điều tốt nhất'],
]

// ─────────────────────────────────────────────────────────────────────
//  CHỦ THỂ — 50 chủ thể (6 đại từ + 44 danh từ chỉ người)
//  flags: first/second/plural để chia động từ; mặc định = ngôi thứ 3 số ít
// ─────────────────────────────────────────────────────────────────────
const PRON = [
  { en:'I',    vi:'Tôi',        first:true,  cat:'I +',    color:'emerald' },
  { en:'You',  vi:'Bạn',        second:true, cat:'You +',  color:'amber' },
  { en:'We',   vi:'Chúng tôi',  plural:true, cat:'We +',   color:'sky' },
  { en:'They', vi:'Họ',         plural:true, cat:'They +', color:'violet' },
  { en:'He',   vi:'Anh ấy',                  cat:'He +',   color:'pink' },
  { en:'She',  vi:'Cô ấy',                   cat:'She +',  color:'rose' },
]

const PEOPLE_SG = [
  ['The teacher','Giáo viên'],['The student','Học sinh'],['The manager','Người quản lý'],
  ['The boss','Ông chủ'],['The doctor','Bác sĩ'],['The nurse','Y tá'],['The driver','Tài xế'],
  ['The customer','Khách hàng'],['The client','Vị khách'],['The waiter','Người phục vụ'],
  ['The engineer','Kỹ sư'],['The new employee','Nhân viên mới'],['The interviewer','Người phỏng vấn'],
  ['The candidate','Ứng viên'],['The salesperson','Nhân viên bán hàng'],['The receptionist','Lễ tân'],
  ['The coach','Huấn luyện viên'],['The owner','Người chủ'],['The host','Chủ nhà'],
  ['The team leader','Trưởng nhóm'],['The assistant','Trợ lý'],['The director','Giám đốc'],
  ['The visitor','Người ghé thăm'],['The guest','Khách mời'],
  ['My friend','Bạn của tôi'],['My boss','Sếp của tôi'],['My sister','Chị gái tôi'],
  ['My brother','Anh trai tôi'],['My mother','Mẹ tôi'],['My father','Bố tôi'],
  ['My partner','Người bạn đời của tôi'],['My roommate','Bạn cùng phòng của tôi'],
  ['My neighbor','Hàng xóm của tôi'],['My colleague','Đồng nghiệp của tôi'],
]

const PEOPLE_PL = [
  ['My parents','Bố mẹ tôi'],['The children','Bọn trẻ'],['The students','Các học sinh'],
  ['My friends','Bạn bè tôi'],['The neighbors','Hàng xóm'],['My colleagues','Các đồng nghiệp của tôi'],
  ['The customers','Các khách hàng'],['The team members','Các thành viên trong nhóm'],
]

const EVERYONE = [['Everyone','Mọi người'],['Someone','Ai đó']]

const SUBJECTS = [
  ...PRON,
  ...PEOPLE_SG.map(([en,vi]) => ({ en, vi, cat:'Người (số ít)', color:'teal' })),
  ...PEOPLE_PL.map(([en,vi]) => ({ en, vi, plural:true, cat:'Nhiều người', color:'indigo' })),
  ...EVERYONE.map(([en,vi]) => ({ en, vi, cat:'Mọi người', color:'purple' })),
]

// ─────────────────────────────────────────────────────────────────────
//  Chia động từ theo chủ thể
// ─────────────────────────────────────────────────────────────────────
const third = s => !s.first && !s.second && !s.plural      // ngôi 3 số ít?
const beOf  = s => s.first ? 'am' : (third(s) ? 'is' : 'are')
const wasOf = s => (s.first || third(s)) ? 'was' : 'were'
const hasOf = s => third(s) ? 'has' : 'have'
const dontOf= s => third(s) ? "doesn't" : "don't"
const sOf   = s => third(s) ? 's' : ''                     // đuôi -s động từ

// ─────────────────────────────────────────────────────────────────────
//  KHUNG ngữ pháp — 20 khung. Mỗi khung: tiền tố Anh/Việt + chọn kho
// ─────────────────────────────────────────────────────────────────────
const FRAMES = [
  { id:'be',       en:s=>`${s.en} ${beOf(s)}`,            vi:s=>s.vi,            pool:ADJ },
  { id:'was',      en:s=>`${s.en} ${wasOf(s)}`,           vi:s=>`${s.vi} đã`,    pool:ADJ },
  { id:'have',     en:s=>`${s.en} ${hasOf(s)}`,           vi:s=>`${s.vi} có`,    pool:NOUN },
  { id:'want',     en:s=>`${s.en} want${sOf(s)} to`,      vi:s=>`${s.vi} muốn`,  pool:VERB },
  { id:'need',     en:s=>`${s.en} need${sOf(s)} to`,      vi:s=>`${s.vi} cần`,   pool:VERB },
  { id:'wouldlike',en:s=>`${s.en} would like to`,         vi:s=>`${s.vi} muốn`,  pool:VERB },
  { id:'love',     en:s=>`${s.en} love${sOf(s)} to`,      vi:s=>`${s.vi} thích`, pool:VERB },
  { id:'can',      en:s=>`${s.en} can`,                   vi:s=>`${s.vi} có thể`,pool:VERB },
  { id:'cant',     en:s=>`${s.en} can't`,                 vi:s=>`${s.vi} không thể`, pool:VERB },
  { id:'will',     en:s=>`${s.en} will`,                  vi:s=>`${s.vi} sẽ`,    pool:VERB },
  { id:'wont',     en:s=>`${s.en} won't`,                 vi:s=>`${s.vi} sẽ không`, pool:VERB },
  { id:'should',   en:s=>`${s.en} should`,                vi:s=>`${s.vi} nên`,   pool:VERB },
  { id:'might',    en:s=>`${s.en} might`,                 vi:s=>`${s.vi} có thể`,pool:VERB },
  { id:'haveto',   en:s=>`${s.en} ${hasOf(s)} to`,        vi:s=>`${s.vi} phải`,  pool:VERB },
  { id:'goingto',  en:s=>`${s.en} ${beOf(s)} going to`,   vi:s=>`${s.vi} sắp`,   pool:VERB },
  { id:'tryingto', en:s=>`${s.en} ${beOf(s)} trying to`,  vi:s=>`${s.vi} đang cố`, pool:VERB },
  { id:'planning', en:s=>`${s.en} ${beOf(s)} planning to`,vi:s=>`${s.vi} đang định`, pool:VERB },
  { id:'usedto',   en:s=>`${s.en} used to`,               vi:s=>`${s.vi} từng`,  pool:VERB },
  { id:'dont',     en:s=>`${s.en} ${dontOf(s)}`,          vi:s=>`${s.vi} không`, pool:VERB },
  { id:'didnt',    en:s=>`${s.en} didn't`,                vi:s=>`${s.vi} đã không`, pool:VERB },
]

// ─────────────────────────────────────────────────────────────────────
//  Sinh dữ liệu
// ─────────────────────────────────────────────────────────────────────
const cap = str => str.charAt(0).toUpperCase() + str.slice(1)

// PRNG tất định (mulberry32) + hash chuỗi → cùng chủ thể luôn ra cùng kết quả,
// nhưng mỗi chủ thể/khung lại bốc một bộ 100 câu KHÁC nhau từ kho lớn.
function hashStr(s) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
// Xáo trộn (Fisher–Yates) theo seed rồi lấy n phần tử đầu.
function pickShuffled(pool, seed, n) {
  const rand = mulberry32(seed)
  const a = pool.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

function buildSentences(subj, frame) {
  const enPre = frame.en(subj)
  const viPre = frame.vi(subj)
  const seed = hashStr(`${subj.en}|${frame.id}`)
  const items = pickShuffled(frame.pool, seed, SENTENCES_PER_SUBJECT)
  return items.map(([ce, cv]) => ({ en: `${enPre} ${ce}.`, vi: cap(`${viPre} ${cv}.`) }))
}

const subjects = []
for (const subj of SUBJECTS) {
  for (const frame of FRAMES) {
    subjects.push({
      starter:  frame.en(subj),
      category: subj.cat,
      color:    subj.color,
      sentences: buildSentences(subj, frame),
    })
  }
}

// ─────────────────────────────────────────────────────────────────────
//  Ghi ra file: index.json (meta nhẹ) + chunk-XXX.json (8 chủ thể/chunk)
// ─────────────────────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true })
// Xóa chunk cũ + index cũ để tránh dữ liệu thừa
for (const f of readdirSync(OUT_DIR)) {
  if (/^chunk-\d+\.json$/.test(f) || f === 'index.json') rmSync(join(OUT_DIR, f))
}

const index = []
let chunkNo = 0
for (let i = 0; i < subjects.length; i += SUBJECTS_PER_CHUNK) {
  const slice = subjects.slice(i, i + SUBJECTS_PER_CHUNK)
  const file = `chunk-${String(chunkNo).padStart(3, '0')}.json`
  writeFileSync(join(OUT_DIR, file), JSON.stringify(slice))
  slice.forEach((s, idx) => {
    index.push({
      starter: s.starter,
      category: s.category,
      color: s.color,
      count: s.sentences.length,
      chunk: chunkNo,
      idx,
    })
  })
  chunkNo++
}
writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(index))

console.log(`✓ Đã sinh ${subjects.length} chủ thể × ${SENTENCES_PER_SUBJECT} câu`)
console.log(`✓ ${chunkNo} file chunk (${SUBJECTS_PER_CHUNK} chủ thể/chunk) + index.json`)
console.log(`✓ Tổng số câu: ${subjects.length * SENTENCES_PER_SUBJECT}`)
