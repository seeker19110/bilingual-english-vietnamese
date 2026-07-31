// scripts/gen-lessons-template.mjs
// Sinh 1000 bài hội thoại bằng template phong phú (không cần API key).
// Mỗi bài 50 lượt thoại, song ngữ Anh-Việt.
// Chạy: node scripts/gen-lessons-template.mjs
// Sau đó: node scripts/split-lessons.mjs

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LESSONS_FILE = path.join(ROOT, 'apps/english/src/data/lessons.json')

// ── Đọc bài đã có ──────────────────────────────────────────────────────────
let existing = []
if (fs.existsSync(LESSONS_FILE)) {
  existing = JSON.parse(fs.readFileSync(LESSONS_FILE, 'utf8'))
}
const existingIds = new Set(existing.map((l) => l.id))

// ── Định nghĩa 1000 chủ đề đầy đủ ─────────────────────────────────────────
const TOPICS = [
  // Bài 1-100 đã có → bỏ qua (chỉ sinh từ 101)
  // Bài 101-200: Giao tiếp hàng ngày nâng cao
  {
    id: 101,
    title: 'Đặt lịch hẹn qua điện thoại',
    situation: 'Minh gọi điện đặt lịch hẹn với bác sĩ.',
    aName: { vi: 'Minh', en: 'Minh' },
    bName: { vi: 'Lễ tân', en: 'Receptionist' },
    aG: 'male',
    bG: 'female',
    turns: [
      {
        s: 'A',
        en: "Hello, I'd like to make an appointment with Dr. Lan.",
        vi: 'Xin chào, tôi muốn đặt lịch hẹn với bác sĩ Lan.',
      },
      {
        s: 'B',
        en: "Of course. What's your name, please?",
        vi: 'Tất nhiên rồi. Xin hỏi tên bạn là gì?',
      },
      { s: 'A', en: 'My name is Nguyen Van Minh.', vi: 'Tên tôi là Nguyễn Văn Minh.' },
      {
        s: 'B',
        en: 'Thank you, Mr. Minh. What day works best for you?',
        vi: 'Cảm ơn anh Minh. Ngày nào tiện nhất với anh?',
      },
      { s: 'A', en: 'Is Thursday afternoon available?', vi: 'Chiều thứ Năm có lịch trống không?' },
      {
        s: 'B',
        en: 'Let me check. Thursday at 3 PM works.',
        vi: 'Để tôi kiểm tra. Thứ Năm lúc 3 giờ chiều được.',
      },
      {
        s: 'A',
        en: 'Perfect. Is that for a regular checkup?',
        vi: 'Tốt quá. Đó là cho kiểm tra sức khỏe thường không?',
      },
      {
        s: 'B',
        en: 'Yes, or do you have a specific concern?',
        vi: 'Đúng, hay bạn có vấn đề cụ thể nào không?',
      },
      { s: 'A', en: "I've been having headaches for a week.", vi: 'Tôi bị đau đầu một tuần nay.' },
      { s: 'B', en: "I'll note that for the doctor.", vi: 'Tôi sẽ ghi lại cho bác sĩ biết.' },
      {
        s: 'A',
        en: 'Thank you. Should I bring any documents?',
        vi: 'Cảm ơn. Tôi có cần mang theo giấy tờ gì không?',
      },
      {
        s: 'B',
        en: 'Please bring your health insurance card.',
        vi: 'Xin hãy mang theo thẻ bảo hiểm y tế của bạn.',
      },
      {
        s: 'A',
        en: 'I have it. Is there a registration fee?',
        vi: 'Tôi có rồi. Có phí đăng ký không?',
      },
      { s: 'B', en: 'The consultation fee is 200,000 VND.', vi: 'Phí tư vấn là 200.000 đồng.' },
      {
        s: 'A',
        en: "That's fine. Can I cancel if needed?",
        vi: 'Được rồi. Tôi có thể hủy nếu cần không?',
      },
      {
        s: 'B',
        en: 'Yes, please call us 24 hours in advance.',
        vi: 'Được, xin gọi cho chúng tôi trước 24 tiếng.',
      },
      {
        s: 'A',
        en: 'Understood. Where is the clinic located?',
        vi: 'Hiểu rồi. Phòng khám ở đâu vậy?',
      },
      {
        s: 'B',
        en: 'We are at 15 Nguyen Hue Street, District 1.',
        vi: 'Chúng tôi ở 15 Nguyễn Huệ, Quận 1.',
      },
      { s: 'A', en: 'Is there parking nearby?', vi: 'Có bãi đỗ xe gần đó không?' },
      {
        s: 'B',
        en: "Yes, there's a parking lot next door.",
        vi: 'Có, có bãi đỗ xe ngay bên cạnh.',
      },
      { s: 'A', en: 'Great. Should I arrive early?', vi: 'Tốt. Tôi có nên đến sớm không?' },
      {
        s: 'B',
        en: 'Please arrive 15 minutes before your appointment.',
        vi: 'Xin đến sớm 15 phút trước giờ hẹn.',
      },
      {
        s: 'A',
        en: "I'll do that. Is the doctor female or male?",
        vi: 'Tôi sẽ làm vậy. Bác sĩ là nữ hay nam?',
      },
      {
        s: 'B',
        en: "Dr. Lan is female. She's very experienced.",
        vi: 'Bác sĩ Lan là nữ. Cô ấy rất có kinh nghiệm.',
      },
      { s: 'A', en: 'Good. Does she speak English?', vi: 'Tốt. Cô ấy có nói tiếng Anh không?' },
      { s: 'B', en: 'Yes, she studied medicine in Australia.', vi: 'Có, cô ấy học y khoa ở Úc.' },
      {
        s: 'A',
        en: "That's reassuring. Is the clinic open on weekends?",
        vi: 'Thật yên tâm. Phòng khám có mở cửa cuối tuần không?',
      },
      {
        s: 'B',
        en: "We're open Saturday mornings only.",
        vi: 'Chúng tôi chỉ mở sáng thứ Bảy thôi.',
      },
      {
        s: 'A',
        en: 'I see. Can I reschedule if needed?',
        vi: 'Tôi hiểu. Tôi có thể đổi lịch nếu cần không?',
      },
      {
        s: 'B',
        en: 'Yes, just call us ahead of time.',
        vi: 'Được, chỉ cần gọi cho chúng tôi trước.',
      },
      { s: 'A', en: 'Will I receive a reminder?', vi: 'Tôi có nhận được nhắc nhở không?' },
      {
        s: 'B',
        en: "Yes, we'll send an SMS the day before.",
        vi: 'Có, chúng tôi sẽ gửi tin nhắn vào ngày hôm trước.',
      },
      {
        s: 'A',
        en: 'Perfect. My phone number is 0901234567.',
        vi: 'Tốt quá. Số điện thoại của tôi là 0901234567.',
      },
      {
        s: 'B',
        en: "I've got it. Anything else I can help with?",
        vi: 'Tôi đã ghi lại rồi. Còn điều gì tôi có thể giúp không?',
      },
      {
        s: 'A',
        en: "That's everything, thank you very much.",
        vi: 'Hết rồi, cảm ơn bạn rất nhiều.',
      },
      { s: 'B', en: "You're welcome. See you Thursday!", vi: 'Không có gì. Hẹn gặp thứ Năm nhé!' },
      { s: 'A', en: 'See you then. Goodbye!', vi: 'Hẹn gặp lại. Tạm biệt!' },
      {
        s: 'B',
        en: 'Goodbye and have a great day!',
        vi: 'Tạm biệt và chúc bạn một ngày tốt lành!',
      },
      { s: 'A', en: 'Thank you. I will.', vi: 'Cảm ơn. Tôi sẽ vậy.' },
      {
        s: 'B',
        en: 'Take care of yourself until then.',
        vi: 'Hãy chăm sóc bản thân đến lúc đó nhé.',
      },
      {
        s: 'A',
        en: 'I will. Should I fast before the appointment?',
        vi: 'Tôi sẽ vậy. Tôi có cần nhịn ăn trước hẹn không?',
      },
      {
        s: 'B',
        en: 'Not necessary for this type of visit.',
        vi: 'Không cần thiết cho loại khám này.',
      },
      { s: 'A', en: "OK, that's good to know.", vi: 'OK, tốt khi biết điều đó.' },
      {
        s: 'B',
        en: 'Just stay hydrated and get good sleep.',
        vi: 'Chỉ cần uống đủ nước và ngủ đủ giấc.',
      },
      {
        s: 'A',
        en: "I'll try. Is the clinic air-conditioned?",
        vi: 'Tôi sẽ cố. Phòng khám có điều hòa không?',
      },
      { s: 'B', en: "Yes, it's very comfortable.", vi: 'Có, rất thoải mái.' },
      {
        s: 'A',
        en: 'Good. I tend to get hot waiting rooms.',
        vi: 'Tốt. Tôi thường nóng nực khi ngồi phòng chờ.',
      },
      { s: 'B', en: "No worries, you'll be comfortable.", vi: 'Đừng lo, bạn sẽ thoải mái thôi.' },
      {
        s: 'A',
        en: 'Great. One last thing - can I bring a friend?',
        vi: 'Tốt. Một điều cuối - tôi có thể mang bạn theo không?',
      },
      {
        s: 'B',
        en: 'Of course. Family and friends are welcome.',
        vi: 'Tất nhiên. Gia đình và bạn bè đều được chào đón.',
      },
      {
        s: 'A',
        en: 'Wonderful. Thank you for your help today.',
        vi: 'Tuyệt vời. Cảm ơn bạn đã giúp đỡ hôm nay.',
      },
      {
        s: 'B',
        en: 'Anytime! We look forward to seeing you.',
        vi: 'Lúc nào cũng được! Chúng tôi mong gặp bạn.',
      },
    ],
  },
  {
    id: 102,
    title: 'Thuê xe máy',
    situation: 'Hoa muốn thuê xe máy đi thăm quan thành phố.',
    aName: { vi: 'Hoa', en: 'Hoa' },
    bName: { vi: 'Chủ thuê xe', en: 'Rental owner' },
    aG: 'female',
    bG: 'male',
    turns: [
      {
        s: 'A',
        en: 'Excuse me, do you have motorbikes for rent?',
        vi: 'Xin lỗi, bạn có xe máy cho thuê không?',
      },
      { s: 'B', en: 'Yes, we do. How long do you need it?', vi: 'Có chứ. Bạn cần thuê bao lâu?' },
      {
        s: 'A',
        en: 'Just for today. I want to explore the city.',
        vi: 'Chỉ hôm nay thôi. Tôi muốn khám phá thành phố.',
      },
      { s: 'B', en: 'One day rental is 150,000 VND.', vi: 'Thuê một ngày là 150.000 đồng.' },
      {
        s: 'A',
        en: 'That sounds reasonable. What types do you have?',
        vi: 'Nghe có vẻ hợp lý. Bạn có loại xe nào?',
      },
      {
        s: 'B',
        en: 'We have Honda Wave and Yamaha Nouvo.',
        vi: 'Chúng tôi có Honda Wave và Yamaha Nouvo.',
      },
      {
        s: 'A',
        en: "I'll take the Honda Wave. Is it easy to ride?",
        vi: 'Tôi sẽ lấy Honda Wave. Nó có dễ lái không?',
      },
      {
        s: 'B',
        en: "Yes, it's very popular and reliable.",
        vi: 'Có, nó rất phổ biến và đáng tin cậy.',
      },
      { s: 'A', en: 'Do I need to leave a deposit?', vi: 'Tôi có cần đặt cọc không?' },
      {
        s: 'B',
        en: 'Yes, 500,000 VND deposit or your passport.',
        vi: 'Có, đặt cọc 500.000 đồng hoặc hộ chiếu của bạn.',
      },
      {
        s: 'A',
        en: "I'll leave the passport. Is it safe here?",
        vi: 'Tôi để hộ chiếu. Ở đây có an toàn không?',
      },
      {
        s: 'B',
        en: 'Absolutely. We keep it in a safe.',
        vi: 'Hoàn toàn. Chúng tôi giữ trong két an toàn.',
      },
      {
        s: 'A',
        en: 'Good. Does the bike come with a helmet?',
        vi: 'Tốt. Xe có kèm mũ bảo hiểm không?',
      },
      {
        s: 'B',
        en: 'Yes, one helmet is included. Extra helmets cost 10,000 each.',
        vi: 'Có, một mũ được kèm theo. Mũ thêm giá 10.000 đồng mỗi cái.',
      },
      {
        s: 'A',
        en: 'I only need one. What about insurance?',
        vi: 'Tôi chỉ cần một cái. Còn bảo hiểm thì sao?',
      },
      {
        s: 'B',
        en: 'Basic insurance is included in the price.',
        vi: 'Bảo hiểm cơ bản đã bao gồm trong giá.',
      },
      { s: 'A', en: 'Perfect. Is the tank full?', vi: 'Tốt quá. Bình xăng có đầy không?' },
      {
        s: 'B',
        en: 'Yes, please return it with a full tank.',
        vi: 'Có, xin hãy trả lại với bình xăng đầy.',
      },
      {
        s: 'A',
        en: 'No problem. What time should I return it?',
        vi: 'Không vấn đề. Tôi phải trả lại lúc mấy giờ?',
      },
      {
        s: 'B',
        en: "Please return by 6 PM or there's an extra charge.",
        vi: 'Xin trả lại trước 6 giờ tối hoặc sẽ tính thêm phí.',
      },
      {
        s: 'A',
        en: "I'll be back by 5. Can I ride to Da Lat?",
        vi: 'Tôi sẽ về trước 5 giờ. Tôi có thể đi Đà Lạt không?',
      },
      {
        s: 'B',
        en: 'The bike is for city use only, sorry.',
        vi: 'Xe chỉ dùng trong thành phố thôi, xin lỗi.',
      },
      {
        s: 'A',
        en: "That's fine, I'm just going around town.",
        vi: 'Không sao, tôi chỉ đi quanh thành phố thôi.',
      },
      {
        s: 'B',
        en: "Great. Do you have a Vietnamese driver's license?",
        vi: 'Tốt. Bạn có bằng lái xe Việt Nam không?',
      },
      {
        s: 'A',
        en: 'No, I have an international license.',
        vi: 'Không, tôi có bằng lái xe quốc tế.',
      },
      {
        s: 'B',
        en: "That's acceptable here. May I see it?",
        vi: 'Ở đây chấp nhận được. Bạn cho tôi xem được không?',
      },
      { s: 'A', en: 'Sure, here you go.', vi: 'Được thôi, đây.' },
      { s: 'B', en: "Thank you. I'll make a copy.", vi: 'Cảm ơn. Tôi sẽ photocopy lại.' },
      {
        s: 'A',
        en: 'Of course. Is the bike in good condition?',
        vi: 'Tất nhiên. Xe có tình trạng tốt không?',
      },
      {
        s: 'B',
        en: 'Yes, we just serviced it yesterday.',
        vi: 'Có, chúng tôi vừa bảo dưỡng hôm qua.',
      },
      {
        s: 'A',
        en: 'Great. Can you show me how to start it?',
        vi: 'Tốt. Bạn có thể chỉ tôi cách khởi động không?',
      },
      {
        s: 'B',
        en: 'Sure. Turn the key and press the start button.',
        vi: 'Được. Vặn chìa khóa và nhấn nút đề.',
      },
      {
        s: 'A',
        en: "That's straightforward. Where's the fuel gauge?",
        vi: 'Đơn giản nhỉ. Đồng hồ xăng ở đâu?',
      },
      {
        s: 'B',
        en: "It's on the dashboard, on the right side.",
        vi: 'Nó ở bảng điều khiển, bên phải.',
      },
      { s: 'A', en: 'Got it. What if I get a flat tire?', vi: 'Hiểu rồi. Nếu bị xẹp lốp thì sao?' },
      {
        s: 'B',
        en: "Call us and we'll come to help you.",
        vi: 'Gọi cho chúng tôi và chúng tôi sẽ đến giúp.',
      },
      {
        s: 'A',
        en: "That's reassuring. What's your phone number?",
        vi: 'Thật yên tâm. Số điện thoại của bạn là gì?',
      },
      {
        s: 'B',
        en: "It's on this card. Save it in your phone.",
        vi: 'Ở trên tấm card này. Lưu vào điện thoại nhé.',
      },
      { s: 'A', en: 'Will do. Is there a lock for the bike?', vi: 'Sẽ làm. Có khóa xe không?' },
      {
        s: 'B',
        en: "Yes, the steering lock is included. Here's how to use it.",
        vi: 'Có, có khóa tay lái. Đây là cách dùng.',
      },
      {
        s: 'A',
        en: 'I see. Is this area safe to park?',
        vi: 'Tôi hiểu. Khu vực này có an toàn để đỗ xe không?',
      },
      {
        s: 'B',
        en: 'Use guarded parking lots to be safe.',
        vi: 'Dùng bãi đỗ xe có người trông để an toàn.',
      },
      {
        s: 'A',
        en: 'Good advice. Are there any areas to avoid?',
        vi: 'Lời khuyên hay. Có khu vực nào nên tránh không?',
      },
      {
        s: 'B',
        en: 'Just be careful on narrow alleys at night.',
        vi: 'Chỉ cẩn thận trên các hẻm nhỏ vào ban đêm.',
      },
      { s: 'A', en: "I'll keep that in mind. Thank you.", vi: 'Tôi sẽ nhớ điều đó. Cảm ơn.' },
      { s: 'B', en: "You're welcome. Enjoy your ride!", vi: 'Không có gì. Chúc bạn đi vui!' },
      {
        s: 'A',
        en: 'I will. This is going to be a great day.',
        vi: 'Tôi sẽ vậy. Hôm nay sẽ thật tuyệt.',
      },
      {
        s: 'B',
        en: 'Come back anytime if you need more time.',
        vi: 'Ghé lại bất cứ lúc nào nếu cần thêm thời gian.',
      },
      {
        s: 'A',
        en: 'Thanks, I might extend it actually.',
        vi: 'Cảm ơn, thực ra tôi có thể gia hạn đấy.',
      },
      { s: 'B', en: 'No problem, just call us.', vi: 'Không vấn đề, cứ gọi cho chúng tôi.' },
      { s: 'A', en: 'Will do! Have a good day!', vi: 'Sẽ làm! Chúc bạn một ngày tốt lành!' },
      { s: 'B', en: 'You too! Safe travels!', vi: 'Bạn cũng vậy! Đi đường bình an!' },
    ],
  },
]

// ── Hàm tạo bài học từ chủ đề cơ bản (template) ──────────────────────────
// Dùng cho các bài không có turns viết sẵn
function makeTemplateTurns(topic, id) {
  // Câu mở đầu theo ngữ cảnh
  const openers = {
    'Gọi thợ sửa điện nước': [
      [
        {
          en: 'Hello, is this the plumbing repair service?',
          vi: 'Xin chào, đây có phải dịch vụ sửa điện nước không?',
        },
        { en: 'Yes, it is. How can I help you?', vi: 'Vâng đúng rồi. Tôi có thể giúp gì cho bạn?' },
      ],
    ],
  }

  // Template chung cho 50 lượt thoại theo flow tự nhiên
  const flows = [
    // Giai đoạn 1: Giới thiệu vấn đề (10 lượt)
    [
      {
        en: `Hello, I need help with ${topic.situation.split('.')[0].toLowerCase()}.`,
        vi: `Xin chào, tôi cần giúp đỡ về ${topic.situation.split('.')[0]}.`,
      },
      {
        en: "I'd be happy to help. What exactly do you need?",
        vi: 'Tôi rất vui được giúp. Bạn cần gì cụ thể?',
      },
      { en: "I'm looking for information about this.", vi: 'Tôi đang tìm thông tin về điều này.' },
      { en: 'Sure, what would you like to know?', vi: 'Tất nhiên, bạn muốn biết gì?' },
      {
        en: 'Can you explain the process to me?',
        vi: 'Bạn có thể giải thích quy trình cho tôi không?',
      },
      {
        en: 'Of course. First, let me ask a few questions.',
        vi: 'Tất nhiên. Trước tiên, cho tôi hỏi vài câu.',
      },
      { en: "Go ahead, I'm listening.", vi: 'Cứ đi, tôi đang lắng nghe.' },
      {
        en: 'How long have you been dealing with this?',
        vi: 'Bạn đã xử lý vấn đề này bao lâu rồi?',
      },
      { en: 'Just recently, about a week or so.', vi: 'Mới gần đây thôi, khoảng một tuần.' },
      {
        en: "I see. And what's your main concern?",
        vi: 'Tôi hiểu. Và mối lo chính của bạn là gì?',
      },
    ],
    // Giai đoạn 2: Trao đổi chi tiết (15 lượt)
    [
      {
        en: 'My main concern is getting this sorted quickly.',
        vi: 'Mối lo chính của tôi là giải quyết nhanh chóng.',
      },
      {
        en: "That's understandable. Let me see what I can do.",
        vi: 'Điều đó có thể hiểu được. Để tôi xem tôi có thể làm gì.',
      },
      { en: 'What are the options available to me?', vi: 'Có những lựa chọn nào dành cho tôi?' },
      {
        en: 'There are several options. First option is...',
        vi: 'Có vài lựa chọn. Lựa chọn đầu tiên là...',
      },
      {
        en: 'That sounds interesting. What about the cost?',
        vi: 'Nghe có vẻ thú vị. Còn về chi phí thì sao?',
      },
      { en: 'The cost depends on what you choose.', vi: 'Chi phí phụ thuộc vào điều bạn chọn.' },
      { en: 'Can you give me a rough estimate?', vi: 'Bạn có thể ước tính sơ bộ không?' },
      {
        en: 'Roughly speaking, it would be around 500,000 VND.',
        vi: 'Nói sơ lược, sẽ vào khoảng 500.000 đồng.',
      },
      {
        en: 'Is that the total cost or are there additional fees?',
        vi: 'Đó có phải tổng chi phí không hay có phí phụ thêm?',
      },
      {
        en: "That's the base price. Additional services cost extra.",
        vi: 'Đó là giá cơ bản. Dịch vụ thêm tính thêm phí.',
      },
      { en: 'I understand. How long will it take?', vi: 'Tôi hiểu. Sẽ mất bao lâu?' },
      { en: 'It typically takes about 2-3 hours.', vi: 'Thường mất khoảng 2-3 tiếng.' },
      {
        en: "That's not too long. When can we start?",
        vi: 'Không quá lâu. Khi nào chúng ta có thể bắt đầu?',
      },
      {
        en: "We can start as soon as you're ready.",
        vi: 'Chúng ta có thể bắt đầu ngay khi bạn sẵn sàng.',
      },
      { en: "Let's do it today if possible.", vi: 'Hãy làm hôm nay nếu có thể.' },
    ],
    // Giai đoạn 3: Thỏa thuận và chi tiết (15 lượt)
    [
      {
        en: 'Today works. What time is convenient for you?',
        vi: 'Hôm nay được. Mấy giờ tiện cho bạn?',
      },
      {
        en: 'Afternoon would be best for me, around 2 PM.',
        vi: 'Buổi chiều sẽ tốt nhất, khoảng 2 giờ.',
      },
      {
        en: '2 PM is fine. Can you give me your address?',
        vi: '2 giờ chiều ổn. Bạn cho tôi địa chỉ được không?',
      },
      { en: "I'm at 123 Hai Ba Trung Street.", vi: 'Tôi ở 123 đường Hai Bà Trưng.' },
      {
        en: 'Got it. Is there anything I should prepare?',
        vi: 'Hiểu rồi. Có gì tôi cần chuẩn bị không?',
      },
      {
        en: 'Just make sure the area is accessible.',
        vi: 'Chỉ cần đảm bảo khu vực có thể tiếp cận được.',
      },
      { en: 'No problem. What should I have ready?', vi: 'Không vấn đề. Tôi nên chuẩn bị gì?' },
      { en: 'Have the relevant documents ready if any.', vi: 'Chuẩn bị giấy tờ liên quan nếu có.' },
      { en: "I'll prepare everything in advance.", vi: 'Tôi sẽ chuẩn bị tất cả trước.' },
      {
        en: 'Great. Do you have any questions for me?',
        vi: 'Tốt. Bạn có câu hỏi nào cho tôi không?',
      },
      {
        en: 'Yes, what payment methods do you accept?',
        vi: 'Có, bạn chấp nhận phương thức thanh toán nào?',
      },
      {
        en: 'We accept cash and bank transfer.',
        vi: 'Chúng tôi chấp nhận tiền mặt và chuyển khoản.',
      },
      { en: 'Bank transfer is easier for me.', vi: 'Chuyển khoản tiện hơn với tôi.' },
      {
        en: "That's fine. I'll send you the account details.",
        vi: 'Ổn thôi. Tôi sẽ gửi cho bạn thông tin tài khoản.',
      },
      { en: 'Thank you. Can I get a receipt?', vi: 'Cảm ơn. Tôi có thể lấy hóa đơn không?' },
    ],
    // Giai đoạn 4: Kết thúc (10 lượt)
    [
      {
        en: 'Of course, we always provide receipts.',
        vi: 'Tất nhiên, chúng tôi luôn cung cấp hóa đơn.',
      },
      { en: 'Good. Is there a warranty on the work?', vi: 'Tốt. Công việc có bảo hành không?' },
      { en: 'Yes, we offer a 30-day warranty.', vi: 'Có, chúng tôi cung cấp bảo hành 30 ngày.' },
      {
        en: "That's good to know. What if something goes wrong?",
        vi: 'Tốt khi biết điều đó. Nếu có sự cố thì sao?',
      },
      {
        en: "Just call us and we'll fix it at no extra charge.",
        vi: 'Chỉ cần gọi và chúng tôi sẽ sửa miễn phí.',
      },
      {
        en: "That's very reassuring. I feel confident now.",
        vi: 'Thật yên tâm. Bây giờ tôi cảm thấy tự tin hơn.',
      },
      {
        en: 'We pride ourselves on quality service.',
        vi: 'Chúng tôi tự hào về dịch vụ chất lượng.',
      },
      { en: 'I can see that. See you at 2 PM then.', vi: 'Tôi thấy vậy. Hẹn gặp lúc 2 giờ nhé.' },
      { en: "We'll be there on time. Thank you!", vi: 'Chúng tôi sẽ đến đúng giờ. Cảm ơn!' },
      { en: 'Thank you too. See you soon!', vi: 'Cảm ơn bạn cũng vậy. Hẹn gặp sớm!' },
    ],
  ]

  // Ghép tất cả thành 50 lượt, xen kẽ A-B
  const turns = []
  let speakerIdx = 0
  const allLines = flows.flat()
  for (let i = 0; i < Math.min(50, allLines.length); i++) {
    turns.push({
      speaker: i % 2 === 0 ? 'A' : 'B',
      en: allLines[i].en,
      vi: allLines[i].vi,
    })
  }
  return turns
}

// ── Danh sách đầy đủ 1000 chủ đề (metadata) ──────────────────────────────
const ALL_TOPIC_META = [
  // Các bài đầy đủ nội dung
  ...TOPICS,
  // Bài 103-1000: tạo từ danh sách chủ đề
  ...[
    {
      id: 103,
      title: 'Gọi thợ sửa điện nước',
      situation: 'Anh Tuấn gọi thợ đến sửa vòi nước bị hỏng.',
      aName: { vi: 'Anh Tuấn', en: 'Tuan' },
      bName: { vi: 'Thợ sửa', en: 'Repairman' },
      aG: 'male',
      bG: 'male',
    },
    {
      id: 104,
      title: 'Mua vé tàu hỏa',
      situation: 'Lan mua vé tàu từ Hà Nội đi Đà Nẵng.',
      aName: { vi: 'Lan', en: 'Lan' },
      bName: { vi: 'Nhân viên bán vé', en: 'Ticket agent' },
      aG: 'female',
      bG: 'female',
    },
    {
      id: 105,
      title: 'Nhờ hàng xóm trông nhà',
      situation: 'Chị Mai nhờ hàng xóm trông nhà khi đi du lịch.',
      aName: { vi: 'Chị Mai', en: 'Mai' },
      bName: { vi: 'Chị Hằng', en: 'Hang' },
      aG: 'female',
      bG: 'female',
    },
    {
      id: 106,
      title: 'Đổi tiền ngoại tệ',
      situation: 'Khách du lịch đổi đô la sang tiền Việt tại ngân hàng.',
      aName: { vi: 'David', en: 'David' },
      bName: { vi: 'Nhân viên ngân hàng', en: 'Bank teller' },
      aG: 'male',
      bG: 'female',
    },
    {
      id: 107,
      title: 'Mua sắm ở chợ truyền thống',
      situation: 'Sarah mua rau và thịt ở chợ Bến Thành.',
      aName: { vi: 'Sarah', en: 'Sarah' },
      bName: { vi: 'Người bán hàng', en: 'Vendor' },
      aG: 'female',
      bG: 'female',
    },
    {
      id: 108,
      title: 'Xin giấy phép lái xe',
      situation: 'Anh Hùng đến trung tâm đăng kiểm để đổi bằng lái.',
      aName: { vi: 'Anh Hùng', en: 'Hung' },
      bName: { vi: 'Nhân viên', en: 'Officer' },
      aG: 'male',
      bG: 'male',
    },
    {
      id: 109,
      title: 'Đăng ký thẻ thư viện',
      situation: 'Sinh viên Phương đăng ký mượn sách ở thư viện.',
      aName: { vi: 'Phương', en: 'Phuong' },
      bName: { vi: 'Thủ thư', en: 'Librarian' },
      aG: 'female',
      bG: 'female',
    },
    {
      id: 110,
      title: 'Khiếu nại sản phẩm lỗi',
      situation: 'Khách hàng mang laptop lỗi đến cửa hàng đổi trả.',
      aName: { vi: 'Anh Bình', en: 'Binh' },
      bName: { vi: 'Nhân viên dịch vụ', en: 'Service staff' },
      aG: 'male',
      bG: 'female',
    },
  ].concat(
    // Sinh tự động từ 111 đến 1000
    Array.from({ length: 890 }, (_, i) => {
      const id = 111 + i
      const topics = [
        'Hỏi về khóa học tiếng Anh',
        'Thuê phòng trọ',
        'Mở tài khoản ngân hàng',
        'Đặt tiệc sinh nhật',
        'Nói về thói quen ăn uống',
        'Xin nghỉ phép',
        'Hỏi đường đi bộ',
        'Gửi và nhận bưu kiện',
        'Mua bảo hiểm xe máy',
        'Thảo luận về du lịch ba lô',
        'Bàn về kế hoạch hôn nhân',
        'Dạy con làm bài tập',
        'Nói chuyện về nghề nghiệp',
        'Hòa giải gia đình',
        'Thăm hỏi người ốm',
        'Chuẩn bị tiệc Tết',
        'Chia sẻ áp lực cuộc sống',
        'Xin lỗi vì lỡ hẹn',
        'Bàn về nuôi thú cưng',
        'Tư vấn bạn bè tình yêu',
        'Khám sức khỏe định kỳ',
        'Hỏi bác sĩ về thuốc',
        'Tư vấn dinh dưỡng',
        'Đặt lịch phẫu thuật',
        'Tư vấn sức khỏe tâm thần',
        'Mua thuốc tại hiệu thuốc',
        'Tập thể dục với huấn luyện viên',
        'Hỏi về bảo hiểm y tế',
        'Khám nha khoa',
        'Học yoga và thiền',
        'Thi vào đại học',
        'Xin học bổng nước ngoài',
        'Thuyết trình nhóm',
        'Viết luận văn',
        'Đăng ký môn học đại học',
        'Thảo luận phương pháp học',
        'Phỏng vấn thực tập',
        'Hỏi về chương trình trao đổi',
        'Học trực tuyến',
        'Thảo luận về sách hay',
        'Check in khách sạn 5 sao',
        'Thuê hướng dẫn viên',
        'Đặt tour du lịch',
        'Hỏi về visa',
        'Phàn nàn về phòng khách sạn',
        'Mua đồ lưu niệm',
        'Đi cáp treo',
        'Kể về chuyến đi đáng nhớ',
        'Xử lý hành lý thất lạc',
        'Nói về văn hóa khác biệt',
        'Họp nhóm dự án',
        'Viết email chuyên nghiệp',
        'Đàm phán hợp đồng',
        'Báo cáo kết quả kinh doanh',
        'Phỏng vấn ứng viên',
        'Giải quyết xung đột khách hàng',
        'Trình bày ý tưởng mới',
        'Phân công công việc',
        'Đề xuất tăng lương',
        'Onboarding nhân viên mới',
        'Hỏi về điện thoại mới',
        'Cài đặt ứng dụng',
        'Gọi hỗ trợ kỹ thuật',
        'Mua sắm online',
        'Bảo mật tài khoản',
        'Thiết kế website',
        'Sử dụng AI trong công việc',
        'Nói về mạng xã hội',
        'Học lập trình cơ bản',
        'Livestream bán hàng',
        'Lập kế hoạch tiết kiệm',
        'Hỏi về đầu tư chứng khoán',
        'Vay tiền ngân hàng',
        'Khai thuế thu nhập',
        'Bàn về tiết kiệm hưu trí',
        'Mua bảo hiểm nhân thọ',
        'Quản lý chi tiêu tháng',
        'Đầu tư bất động sản',
        'Thanh toán quốc tế',
        'Chia tiền thuê nhà',
        'Mua xe ô tô trả góp',
        'Nói về khởi nghiệp',
        'Xử lý thẻ tín dụng bị mất',
        'Bàn về thu nhập thụ động',
        'Thuê văn phòng startup',
        'Tư vấn pháp lý',
        'Khám phụ khoa',
        'Lên kế hoạch xây nhà',
        'Tư vấn marketing',
        'Phỏng vấn nhà báo',
        'Tư vấn thiết kế nội thất',
        'Hội thảo khoa học',
        'Cố vấn nghề nghiệp',
        'Hội chẩn y khoa',
        'Tư vấn xuất khẩu',
        'Học nấu phở bò',
        'Làm bánh mì Việt Nam',
        'Nấu cơm tấm Sài Gòn',
        'Học làm nem cuốn',
        'Pha cà phê phin',
        'Đăng ký lớp bơi lội',
        'Tập bóng đá cuối tuần',
        'Học đánh cầu lông',
        'Tham gia câu lạc bộ chạy bộ',
        'Đăng ký giải marathon',
        'Mua vé xem phim',
        'Đi xem ca nhạc',
        'Thăm triển lãm nghệ thuật',
        'Chơi board game',
        'Xem kịch sân khấu',
        'Mua quần áo thời trang',
        'Tư vấn phối đồ',
        'Mua giày sneaker',
        'Tìm áo dài truyền thống',
        'Mua đồ công sở',
        'Bảo vệ môi trường biển',
        'Phân loại rác tái chế',
        'Trồng cây xanh tại nhà',
        'Tiết kiệm điện nước',
        'Chăm sóc vườn rau',
        'Phát triển ứng dụng mobile',
        'Thiết kế UX/UI',
        'Phân tích dữ liệu',
        'Quản lý dự án IT',
        'An ninh mạng',
        'Điều trị ung thư',
        'Phục hồi chức năng',
        'Chăm sóc người cao tuổi',
        'Y học cổ truyền',
        'Sức khỏe tâm thần',
        'Dạy học trực tuyến',
        'Giáo dục STEM',
        'Học bổng nước ngoài',
        'Đào tạo kỹ năng mềm',
        'Coaching nghề nghiệp',
        'Quản lý nhân sự',
        'Chiến lược kinh doanh',
        'Marketing kỹ thuật số',
        'Quản lý chuỗi cung ứng',
        'Phân tích tài chính',
        'Giao thông công cộng',
        'Sinh sống ở chung cư',
        'Tìm nhà thành phố lớn',
        'Ô nhiễm không khí',
        'Tìm chỗ đỗ xe',
        'Gọi cấp cứu 115',
        'Báo cháy',
        'Khai báo tai nạn',
        'Sơ cứu vết thương',
        'Báo cáo trộm cắp',
        'Gặp gỡ đồng nghiệp mới',
        'Chào hỏi khách hàng lần đầu',
        'Giới thiệu sản phẩm',
        'Thuyết phục mua hàng',
        'Theo dõi đơn hàng',
        'Đặt phòng Airbnb',
        'Hỏi về tiện nghi phòng',
        'Phàn nàn về tiếng ồn',
        'Tìm căn hộ dịch vụ',
        'Thỏa thuận giá thuê nhà',
        'Học tiếng Hàn cơ bản',
        'Học tiếng Nhật căn bản',
        'Học tiếng Pháp',
        'Ôn luyện IELTS',
        'Chuẩn bị TOEFL',
        'Thực hành speaking IELTS',
        'Viết email business',
        'Đọc báo tiếng Anh',
        'Xem phim không phụ đề',
        'Nghe podcast tiếng Anh',
        'Nói về phim yêu thích',
        'Bàn về âm nhạc Việt Nam',
        'Thảo luận về thể thao',
        'Chia sẻ sở thích nấu ăn',
        'Nói về thần tượng',
        'Kết bạn với người nước ngoài',
        'Tham gia câu lạc bộ tiếng Anh',
        'Gặp gỡ tại hội chợ',
        'Trao đổi ở sân bay',
        'Làm quen trên mạng',
        'Đi chợ Tết',
        'Mua sắm dịp lễ',
        'Tặng quà sinh nhật',
        'Chọn hoa tươi',
        'Đặt bánh kem',
        'Đi xem triển lãm xe',
        'Hỏi về xe điện',
        'Mua phụ kiện ô tô',
        'Sửa xe ô tô',
        'Đăng kiểm xe',
        'Đặt vé máy bay giá rẻ',
        'Đổi vé máy bay',
        'Hỏi về hành lý xách tay',
        'Check in online',
        'Chọn chỗ ngồi trên máy bay',
        'Thuê xe tự lái',
        'Đặt xe Grab',
        'Đi taxi',
        'Hỏi giờ xe buýt',
        'Đặt vé xe khách',
        'Học cách pha cocktail',
        'Đặt đồ uống đặc biệt',
        'Hỏi về rượu vang',
        'Học pha trà đạo',
        'Thưởng thức cà phê đặc sản',
        'Hỏi về lịch sử Việt Nam',
        'Thăm bảo tàng',
        'Tìm hiểu phong tục tập quán',
        'Học về ngày lễ truyền thống',
        'Nói về di sản văn hóa',
        'Tham gia hội thi nấu ăn',
        'Học làm bánh',
        'Tham gia lớp yoga',
        'Học múa dân tộc',
        'Tham gia hội họa',
        'Thỏa thuận với nhà thầu',
        'Kiểm tra tiến độ xây dựng',
        'Chọn vật liệu xây nhà',
        'Thiết kế phòng ngủ',
        'Lắp đặt nội thất',
        'Thảo luận về biến đổi khí hậu',
        'Bàn về năng lượng tái tạo',
        'Học về điện mặt trời',
        'Bảo vệ đa dạng sinh học',
        'Nói về rừng nhiệt đới',
        'Nói chuyện với bác sĩ thú y',
        'Chăm sóc chó mèo',
        'Tiêm phòng cho thú cưng',
        'Mua thức ăn cho thú cưng',
        'Tìm thú cưng bị lạc',
        'Học làm vườn tại nhà',
        'Trồng rau hữu cơ',
        'Nuôi cá cảnh',
        'Chăm sóc cây bonsai',
        'Làm vườn trên sân thượng',
        'Đặt lịch xét nghiệm máu',
        'Nhận kết quả xét nghiệm',
        'Hỏi về tiêm vaccine',
        'Khám mắt',
        'Đo thính lực',
        'Học chơi đàn guitar',
        'Tham gia ban nhạc',
        'Học hát karaoke',
        'Tìm giáo viên âm nhạc',
        'Mua nhạc cụ',
        'Thực tập tại bệnh viện',
        'Thực tập tại công ty luật',
        'Thực tập tại ngân hàng',
        'Thực tập tại tòa soạn',
        'Thực tập tại startup',
        'Nói về ước mơ nghề nghiệp',
        'Kế hoạch 5 năm tới',
        'Phát triển bản thân',
        'Đọc sách tự phát triển',
        'Tham gia khóa học online',
        'Bàn về quyền phụ nữ',
        'Thảo luận về bình đẳng giới',
        'Nói về quyền trẻ em',
        'Bảo vệ người cao tuổi',
        'Hỗ trợ người khuyết tật',
        'Tìm hiểu về Phật giáo',
        'Nói về Thiên Chúa giáo',
        'Thảo luận về tâm linh',
        'Tham gia lễ hội tôn giáo',
        'Hỏi về phong thủy',
        'Mua sắm tại IKEA',
        'Đặt đồ nội thất online',
        'Lắp ráp đồ nội thất',
        'Chọn màu sơn nhà',
        'Mua đồ trang trí',
        'Đặt vé xem bóng đá',
        'Thảo luận về đội tuyển',
        'Xem giải V-League',
        'Bàn về World Cup',
        'Chia sẻ về thể thao điện tử',
        'Tham gia nhóm đọc sách',
        'Thảo luận tiểu thuyết',
        'Chia sẻ về truyện ngắn',
        'Bàn về thơ ca',
        'Nói về tác giả yêu thích',
        'Học múa hip hop',
        'Tham gia lớp Zumba',
        'Học khiêu vũ ballroom',
        'Tham gia nhóm flashmob',
        'Biểu diễn văn nghệ',
        'Hỏi về visa Nhật Bản',
        'Hỏi về visa Hàn Quốc',
        'Hỏi về visa Mỹ',
        'Hỏi về visa Canada',
        'Hỏi về visa Châu Âu',
        'Tìm nhà sách',
        'Mua sách giáo khoa',
        'Đặt sách trực tuyến',
        'Hỏi về sách mới xuất bản',
        'Trao đổi sách cũ',
        'Đặt lịch cắt tóc',
        'Nhuộm và uốn tóc',
        'Hỏi về kiểu tóc',
        'Mua sản phẩm chăm sóc tóc',
        'Làm nail tại salon',
        'Chọn tour du lịch mùa hè',
        'Đặt tour Tết',
        'Hỏi về tour Tây Nguyên',
        'Đặt tour miền Tây',
        'Hỏi về tour nước ngoài',
        'Mua đất nông nghiệp',
        'Hỏi về đất thổ cư',
        'Đặt cọc mua nhà',
        'Làm hợp đồng mua bán',
        'Chuyển nhượng bất động sản',
        'Học yoga online',
        'Tham gia marathon trực tuyến',
        'Tập thể dục tại nhà',
        'Hỏi về ứng dụng fitness',
        'Mua dụng cụ tập gym',
      ]

      const topicTitle = topics[(id - 111) % topics.length]
      const situations = [
        `Hai người thực hành hội thoại về chủ đề: ${topicTitle}.`,
        `Tình huống thực tế liên quan đến: ${topicTitle}.`,
        `Hội thoại thực hành kỹ năng giao tiếp: ${topicTitle}.`,
      ]
      const names = [
        [
          { vi: 'Lan', en: 'Lan' },
          { vi: 'Nam', en: 'Nam' },
        ],
        [
          { vi: 'Hoa', en: 'Hoa' },
          { vi: 'Minh', en: 'Minh' },
        ],
        [
          { vi: 'Thảo', en: 'Thao' },
          { vi: 'Tuấn', en: 'Tuan' },
        ],
        [
          { vi: 'Linh', en: 'Linh' },
          { vi: 'Khoa', en: 'Khoa' },
        ],
        [
          { vi: 'Sarah', en: 'Sarah' },
          { vi: 'Tom', en: 'Tom' },
        ],
        [
          { vi: 'Mai', en: 'Mai' },
          { vi: 'Hùng', en: 'Hung' },
        ],
        [
          { vi: 'Phương', en: 'Phuong' },
          { vi: 'Đức', en: 'Duc' },
        ],
        [
          { vi: 'Emma', en: 'Emma' },
          { vi: 'David', en: 'David' },
        ],
      ]
      const nameIdx = id % names.length
      const genders = [
        ['female', 'male'],
        ['male', 'female'],
        ['female', 'female'],
        ['male', 'male'],
      ]
      const gIdx = id % genders.length

      return {
        id,
        title: topicTitle,
        situation: situations[id % situations.length],
        aName: names[nameIdx][0],
        bName: names[nameIdx][1],
        aG: genders[gIdx][0],
        bG: genders[gIdx][1],
      }
    }),
  ),
]

// ── Hàm sinh 50 lượt thoại đa dạng theo chủ đề ───────────────────────────
function generateTurns(topic) {
  // Dùng title làm seed để tạo hội thoại phù hợp ngữ cảnh
  const t = topic.title.toLowerCase()
  const aName = topic.aName?.en ?? 'Person A'
  const bName = topic.bName?.en ?? 'Person B'

  // Xác định ngữ cảnh từ title
  const isShop = t.includes('mua') || t.includes('thuê') || t.includes('đặt')
  const isHealth =
    t.includes('khám') || t.includes('bác sĩ') || t.includes('thuốc') || t.includes('sức khỏe')
  const isWork =
    t.includes('việc') || t.includes('công ty') || t.includes('đồng nghiệp') || t.includes('sếp')
  const isTravel =
    t.includes('du lịch') || t.includes('đi') || t.includes('sân bay') || t.includes('khách sạn')
  const isSchool =
    t.includes('học') || t.includes('trường') || t.includes('sinh viên') || t.includes('giáo viên')
  const isFood =
    t.includes('ăn') || t.includes('nấu') || t.includes('nhà hàng') || t.includes('món')

  // Templates hội thoại theo ngữ cảnh
  const dialogues = {
    shop: [
      [
        {
          en: `Excuse me, I'm looking for ${topic.title}.`,
          vi: `Xin lỗi, tôi đang tìm về ${topic.title}.`,
        },
        { en: 'Sure, I can help you with that.', vi: 'Được, tôi có thể giúp bạn điều đó.' },
      ],
      [
        { en: 'What options do you have?', vi: 'Bạn có những lựa chọn nào?' },
        {
          en: 'We have several options. Let me show you.',
          vi: 'Chúng tôi có vài lựa chọn. Để tôi chỉ cho bạn.',
        },
      ],
      [
        { en: "What's the price range?", vi: 'Mức giá là bao nhiêu?' },
        {
          en: 'It ranges from 100,000 to 500,000 VND.',
          vi: 'Dao động từ 100.000 đến 500.000 đồng.',
        },
      ],
      [
        { en: 'Can I try it first?', vi: 'Tôi có thể thử trước không?' },
        { en: 'Of course! Take your time.', vi: 'Tất nhiên! Cứ thử thoải mái.' },
      ],
      [
        { en: 'Do you have a discount?', vi: 'Bạn có giảm giá không?' },
        { en: 'Yes, we have 10% off today.', vi: 'Có, hôm nay giảm 10%.' },
      ],
    ],
    health: [
      [
        {
          en: "Doctor, I haven't been feeling well lately.",
          vi: 'Bác sĩ, tôi không khỏe mấy ngày gần đây.',
        },
        {
          en: "I'm sorry to hear that. Tell me your symptoms.",
          vi: 'Tôi rất tiếc khi nghe vậy. Hãy kể triệu chứng của bạn.',
        },
      ],
      [
        { en: 'I have a headache and feel tired.', vi: 'Tôi bị đau đầu và cảm thấy mệt mỏi.' },
        {
          en: 'How long have you had these symptoms?',
          vi: 'Bạn có những triệu chứng này bao lâu rồi?',
        },
      ],
      [
        { en: 'About three days now.', vi: 'Khoảng ba ngày nay.' },
        { en: 'Do you have any fever?', vi: 'Bạn có bị sốt không?' },
      ],
      [
        { en: 'A slight fever, yes.', vi: 'Sốt nhẹ thôi.' },
        { en: 'Let me check your temperature.', vi: 'Để tôi đo nhiệt độ của bạn.' },
      ],
      [
        { en: 'Is it serious, doctor?', vi: 'Có nghiêm trọng không, bác sĩ?' },
        {
          en: "It's probably just a mild virus. Get rest and fluids.",
          vi: 'Có lẽ chỉ là virus nhẹ. Hãy nghỉ ngơi và uống nhiều nước.',
        },
      ],
    ],
    work: [
      [
        {
          en: "Good morning. Ready for today's meeting?",
          vi: 'Chào buổi sáng. Sẵn sàng cho cuộc họp hôm nay chưa?',
        },
        { en: "Yes, I've prepared all the reports.", vi: 'Rồi, tôi đã chuẩn bị tất cả báo cáo.' },
      ],
      [
        { en: "Great. What's the main topic today?", vi: 'Tốt. Chủ đề chính hôm nay là gì?' },
        {
          en: "We're discussing the Q3 project deadline.",
          vi: 'Chúng ta sẽ thảo luận về thời hạn dự án Q3.',
        },
      ],
      [
        { en: 'Are we on track?', vi: 'Chúng ta có đúng tiến độ không?' },
        {
          en: 'Almost. There are a few minor delays.',
          vi: 'Gần như vậy. Có một vài chậm trễ nhỏ.',
        },
      ],
      [
        { en: 'What caused the delays?', vi: 'Điều gì gây ra sự chậm trễ?' },
        {
          en: 'Mainly technical issues in the testing phase.',
          vi: 'Chủ yếu là vấn đề kỹ thuật trong giai đoạn kiểm thử.',
        },
      ],
      [
        { en: 'Can we still meet the deadline?', vi: 'Chúng ta vẫn có thể kịp thời hạn không?' },
        {
          en: 'Yes, if we work overtime this week.',
          vi: 'Có, nếu chúng ta làm thêm giờ tuần này.',
        },
      ],
    ],
    travel: [
      [
        {
          en: "Excuse me, I'm looking for information about the tour.",
          vi: 'Xin lỗi, tôi đang tìm thông tin về tour.',
        },
        { en: "Welcome! I'll be happy to help.", vi: 'Chào mừng! Tôi rất vui được giúp.' },
      ],
      [
        { en: 'How many days is the trip?', vi: 'Chuyến đi bao nhiêu ngày?' },
        { en: 'This tour is 4 days and 3 nights.', vi: 'Tour này là 4 ngày 3 đêm.' },
      ],
      [
        { en: "What's included in the price?", vi: 'Giá bao gồm những gì?' },
        {
          en: 'Hotel, meals, and transportation are included.',
          vi: 'Khách sạn, bữa ăn và đi lại được bao gồm.',
        },
      ],
      [
        { en: 'Are there any optional activities?', vi: 'Có hoạt động tùy chọn nào không?' },
        {
          en: "Yes, there's snorkeling and boat trips.",
          vi: 'Có, có lặn ngắm san hô và đi thuyền.',
        },
      ],
      [
        { en: 'How much is the deposit?', vi: 'Tiền cọc là bao nhiêu?' },
        { en: '30% of the total price.', vi: '30% tổng giá trị.' },
      ],
    ],
    school: [
      [
        {
          en: 'Excuse me, could you help me with this assignment?',
          vi: 'Xin lỗi, bạn có thể giúp tôi bài tập này không?',
        },
        { en: 'Sure, what subject is it?', vi: 'Được chứ, đây là môn gì?' },
      ],
      [
        { en: "It's for my English class.", vi: 'Đây là cho lớp tiếng Anh của tôi.' },
        {
          en: 'What specifically do you need help with?',
          vi: 'Bạn cần giúp đỡ cụ thể về phần gì?',
        },
      ],
      [
        { en: 'I need to write an essay about culture.', vi: 'Tôi cần viết bài luận về văn hóa.' },
        {
          en: "That's an interesting topic. What's your angle?",
          vi: 'Đó là chủ đề thú vị. Góc nhìn của bạn là gì?',
        },
      ],
      [
        {
          en: 'I want to compare Vietnamese and American culture.',
          vi: 'Tôi muốn so sánh văn hóa Việt Nam và Mỹ.',
        },
        {
          en: 'Great idea! Start with similarities first.',
          vi: 'Ý hay! Hãy bắt đầu với điểm tương đồng trước.',
        },
      ],
      [
        { en: 'What are the main similarities?', vi: 'Những điểm tương đồng chính là gì?' },
        {
          en: 'Both cultures value family and education highly.',
          vi: 'Cả hai văn hóa đều coi trọng gia đình và giáo dục.',
        },
      ],
    ],
    food: [
      [
        { en: 'Welcome! What would you like today?', vi: 'Chào mừng! Hôm nay bạn muốn gì?' },
        { en: "I'd like to try something traditional.", vi: 'Tôi muốn thử món truyền thống.' },
      ],
      [
        {
          en: "I recommend the pho. It's our specialty.",
          vi: 'Tôi gợi ý món phở. Đó là đặc sản của chúng tôi.',
        },
        { en: "That sounds delicious. What's in it?", vi: 'Nghe có vẻ ngon. Nó có gì?' },
      ],
      [
        {
          en: 'It has beef broth, rice noodles, and herbs.',
          vi: 'Nó có nước dùng bò, bánh phở và rau thơm.',
        },
        { en: 'Can I get it with extra vegetables?', vi: 'Tôi có thể thêm rau nhiều hơn không?' },
      ],
      [
        {
          en: 'Of course! Any allergies I should know about?',
          vi: 'Tất nhiên! Có dị ứng gì tôi cần biết không?',
        },
        { en: "I'm allergic to shellfish.", vi: 'Tôi bị dị ứng hải sản có vỏ.' },
      ],
      [
        {
          en: "No shellfish in this dish. You're safe.",
          vi: 'Không có hải sản vỏ trong món này. Bạn an toàn rồi.',
        },
        { en: "Perfect. I'll have the pho please.", vi: 'Tuyệt vời. Cho tôi phở nhé.' },
      ],
    ],
    general: [
      [
        { en: 'Hello! How can I help you today?', vi: 'Xin chào! Tôi có thể giúp gì hôm nay?' },
        { en: 'Hi! I need some information please.', vi: 'Chào! Tôi cần một số thông tin.' },
      ],
      [
        { en: 'What would you like to know?', vi: 'Bạn muốn biết gì?' },
        { en: "I'm asking about " + topic.title + '.', vi: 'Tôi hỏi về ' + topic.title + '.' },
      ],
      [
        {
          en: 'Great topic. What specifically interests you?',
          vi: 'Chủ đề hay. Bạn quan tâm cụ thể điều gì?',
        },
        { en: 'I want to learn the basics first.', vi: 'Tôi muốn học những điều cơ bản trước.' },
      ],
      [
        {
          en: "That's a good approach. Let me explain.",
          vi: 'Đó là cách tiếp cận tốt. Để tôi giải thích.',
        },
        { en: "Please take your time. I'm listening.", vi: 'Xin cứ từ từ. Tôi đang lắng nghe.' },
      ],
      [
        { en: 'The most important thing to know is...', vi: 'Điều quan trọng nhất cần biết là...' },
        { en: "That's really useful information.", vi: 'Đó là thông tin thực sự hữu ích.' },
      ],
    ],
  }

  const contextDialogues = isShop
    ? dialogues.shop
    : isHealth
      ? dialogues.health
      : isWork
        ? dialogues.work
        : isTravel
          ? dialogues.travel
          : isSchool
            ? dialogues.school
            : isFood
              ? dialogues.food
              : dialogues.general

  // Phần tiếp theo của hội thoại (trung gian)
  const midTurns = [
    [
      {
        en: 'Can you explain that in more detail?',
        vi: 'Bạn có thể giải thích chi tiết hơn không?',
      },
      { en: 'Of course. Let me give you an example.', vi: 'Tất nhiên. Để tôi đưa ra ví dụ.' },
    ],
    [
      { en: "That's very helpful, thank you.", vi: 'Điều đó rất hữu ích, cảm ơn bạn.' },
      {
        en: "You're welcome. Do you have more questions?",
        vi: 'Không có gì. Bạn còn câu hỏi nào không?',
      },
    ],
    [
      { en: 'Yes, I have one more question.', vi: 'Có, tôi còn một câu hỏi nữa.' },
      { en: "Go ahead, I'm here to help.", vi: 'Cứ hỏi, tôi ở đây để giúp.' },
    ],
    [
      { en: 'What do you recommend for a beginner?', vi: 'Bạn gợi ý gì cho người mới bắt đầu?' },
      { en: 'I suggest starting with the basics.', vi: 'Tôi gợi ý bắt đầu với những điều cơ bản.' },
    ],
    [
      { en: 'How long does it usually take?', vi: 'Thường mất bao lâu?' },
      { en: 'It depends on your dedication.', vi: 'Tùy thuộc vào sự cố gắng của bạn.' },
    ],
    [
      {
        en: "I'm quite dedicated when I start something.",
        vi: 'Tôi khá tập trung khi bắt đầu điều gì đó.',
      },
      {
        en: "That's great! You'll make good progress then.",
        vi: 'Tuyệt lắm! Bạn sẽ tiến bộ tốt thôi.',
      },
    ],
    [
      { en: 'What are the common mistakes to avoid?', vi: 'Những lỗi thường gặp nào cần tránh?' },
      {
        en: 'Many beginners rush through the basics.',
        vi: 'Nhiều người mới thường vội qua phần cơ bản.',
      },
    ],
    [
      { en: "I'll make sure to take my time.", vi: 'Tôi sẽ chắc chắn không vội vã.' },
      { en: "That's the right attitude.", vi: 'Đó là thái độ đúng đắn.' },
    ],
    [
      { en: 'Is there a community I can join?', vi: 'Có cộng đồng nào tôi có thể tham gia không?' },
      {
        en: 'Yes, there are online groups and local meetups.',
        vi: 'Có, có nhóm trực tuyến và gặp mặt địa phương.',
      },
    ],
    [
      { en: 'That would be very helpful.', vi: 'Điều đó sẽ rất hữu ích.' },
      {
        en: 'Connecting with others accelerates learning.',
        vi: 'Kết nối với người khác giúp học nhanh hơn.',
      },
    ],
    [
      {
        en: "Any books or resources you'd recommend?",
        vi: 'Có sách hay tài liệu nào bạn gợi ý không?',
      },
      {
        en: "I'll email you a list of good resources.",
        vi: 'Tôi sẽ email cho bạn danh sách tài liệu tốt.',
      },
    ],
    [
      { en: 'That would be wonderful, thank you.', vi: 'Thật tuyệt vời, cảm ơn bạn.' },
      { en: 'Happy to help someone so motivated.', vi: 'Vui được giúp người nhiệt tình như bạn.' },
    ],
    [
      { en: 'I really appreciate your time.', vi: 'Tôi thực sự trân trọng thời gian của bạn.' },
      { en: "It's my pleasure.", vi: 'Rất vui được giúp.' },
    ],
    [
      { en: 'Shall we schedule a follow-up?', vi: 'Chúng ta có nên sắp xếp buổi tiếp theo không?' },
      { en: "Yes, that's a great idea.", vi: 'Có, đó là ý hay.' },
    ],
    [
      { en: 'When are you available?', vi: 'Bạn rảnh lúc nào?' },
      { en: 'How about next Tuesday afternoon?', vi: 'Chiều thứ Ba tuần sau thế nào?' },
    ],
  ]

  // Phần kết thúc
  const endTurns = [
    [
      { en: 'Next Tuesday works for me.', vi: 'Thứ Ba tuần sau tôi rảnh.' },
      { en: "Perfect. Let's meet at the same place.", vi: 'Tốt. Hẹn gặp ở chỗ cũ nhé.' },
    ],
    [
      { en: 'Same time, 2 PM?', vi: 'Cùng giờ, 2 giờ chiều?' },
      { en: 'Yes, 2 PM is perfect.', vi: 'Có, 2 giờ chiều là tốt.' },
    ],
    [
      { en: "I'm really looking forward to it.", vi: 'Tôi thực sự mong chờ điều đó.' },
      { en: "Me too. You've been a great student.", vi: 'Tôi cũng vậy. Bạn là học trò tuyệt vời.' },
    ],
    [
      { en: "You've been an excellent teacher.", vi: 'Bạn là giáo viên xuất sắc.' },
      { en: 'Thank you, that means a lot.', vi: 'Cảm ơn, điều đó có ý nghĩa lớn với tôi.' },
    ],
    [
      {
        en: "I'll practice what I've learned today.",
        vi: 'Tôi sẽ thực hành những gì học được hôm nay.',
      },
      { en: "That's the best way to improve.", vi: 'Đó là cách tốt nhất để tiến bộ.' },
    ],
    [
      { en: 'Any last tips before I go?', vi: 'Có lời khuyên cuối nào trước khi tôi đi không?' },
      {
        en: 'Be consistent and patient with yourself.',
        vi: 'Hãy kiên trì và kiên nhẫn với bản thân.',
      },
    ],
    [
      { en: 'I will. This has been very productive.', vi: 'Tôi sẽ vậy. Buổi này thực sự bổ ích.' },
      { en: "I'm glad you think so.", vi: 'Tôi vui khi bạn nghĩ vậy.' },
    ],
    [
      { en: 'See you next week then.', vi: 'Hẹn gặp tuần sau nhé.' },
      { en: 'Looking forward to it. Take care!', vi: 'Mong gặp lại. Bảo trọng nhé!' },
    ],
    [
      { en: 'You too! Goodbye!', vi: 'Bạn cũng vậy! Tạm biệt!' },
      { en: 'Goodbye! Have a great week!', vi: 'Tạm biệt! Chúc bạn một tuần tốt lành!' },
    ],
    [
      { en: 'Thanks for everything today.', vi: 'Cảm ơn vì tất cả hôm nay.' },
      { en: 'Anytime. See you soon!', vi: 'Lúc nào cũng được. Hẹn gặp sớm!' },
    ],
  ]

  // Ghép lại thành 50 lượt
  const allPairs = [...contextDialogues, ...midTurns, ...endTurns]
  const turns = []

  for (let i = 0; i < 25 && i < allPairs.length; i++) {
    const pair = allPairs[i]
    turns.push({ speaker: 'A', en: pair[0].en, vi: pair[0].vi })
    turns.push({ speaker: 'B', en: pair[1].en, vi: pair[1].vi })
  }

  return turns
}

// ── Sinh tất cả bài chưa có ───────────────────────────────────────────────
const newLessons = []

for (const topic of ALL_TOPIC_META) {
  if (existingIds.has(topic.id)) continue // Bỏ qua bài đã có

  const turns = topic.turns ?? generateTurns(topic)

  newLessons.push({
    id: topic.id,
    title: topic.title,
    situation: topic.situation,
    speakerAGender: topic.aG,
    speakerBGender: topic.bG,
    speakerAName: topic.aName,
    speakerBName: topic.bName,
    turns,
  })
}

// Gộp và sắp xếp
const merged = [...existing, ...newLessons].sort((a, b) => a.id - b.id)
fs.writeFileSync(LESSONS_FILE, JSON.stringify(merged, null, 2))
console.log(
  `✅ Đã ghi ${merged.length} bài vào src/data/lessons.json (${newLessons.length} bài mới)`,
)
console.log(`\n🔧 Chạy tiếp: node scripts/split-lessons.mjs`)
