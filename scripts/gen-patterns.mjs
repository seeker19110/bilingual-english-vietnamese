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

function buildSentences(subj, frame) {
  const enPre = frame.en(subj)
  const viPre = frame.vi(subj)
  const out = []
  for (let i = 0; i < SENTENCES_PER_SUBJECT; i++) {
    const [ce, cv] = frame.pool[i % frame.pool.length]
    out.push({ en: `${enPre} ${ce}.`, vi: cap(`${viPre} ${cv}.`) })
  }
  return out
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
