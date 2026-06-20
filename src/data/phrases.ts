// Dữ liệu cụm từ thông dụng song ngữ Anh–Việt
// Dùng cho cả hai chiều:
//   Chiều A (direction='A'): học tiếng Anh → hiển thị en là từ đích, vi là giải thích
//   Chiều B (direction='B'): học tiếng Việt → hiển thị vi là từ đích, en là giải thích

export interface Phrase {
  en: string       // cụm từ tiếng Anh
  vi: string       // nghĩa / cụm từ tiếng Việt tương đương
  noteA?: string   // ghi chú thêm cho người học tiếng Anh (bằng tiếng Việt)
  noteB?: string   // ghi chú thêm cho người học tiếng Việt (bằng tiếng Anh)
}

export interface PhraseCategory {
  id: string
  icon: string
  titleA: string   // tiêu đề hiển thị khi chiều A (tiếng Việt)
  titleB: string   // tiêu đề hiển thị khi chiều B (tiếng Anh)
  phrases: Phrase[]
}

export const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    id: 'greetings',
    icon: '👋',
    titleA: 'Chào hỏi & Giới thiệu',
    titleB: 'Greetings & Introductions',
    phrases: [
      { en: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.', noteA: 'Dùng khi gặp ai đó lần đầu' },
      { en: 'How are you doing?', vi: 'Bạn có khỏe không?', noteA: 'Thân mật hơn "How are you?"' },
      { en: 'I\'m doing well, thanks.', vi: 'Tôi vẫn khỏe, cảm ơn.' },
      { en: 'What do you do for a living?', vi: 'Bạn làm nghề gì?', noteA: 'Hỏi nghề nghiệp lịch sự' },
      { en: 'I\'m originally from Vietnam.', vi: 'Tôi quê ở Việt Nam.' },
      { en: 'It\'s a pleasure to meet you.', vi: 'Hân hạnh được gặp bạn.', noteA: 'Trang trọng hơn "Nice to meet you"' },
      { en: 'Long time no see!', vi: 'Lâu rồi không gặp!', noteA: 'Gặp lại bạn cũ sau thời gian dài' },
      { en: 'How have you been?', vi: 'Dạo này bạn thế nào?' },
    ],
  },
  {
    id: 'daily',
    icon: '☀️',
    titleA: 'Cuộc sống hàng ngày',
    titleB: 'Daily Life',
    phrases: [
      { en: 'I\'m running late.', vi: 'Tôi đến muộn rồi.', noteA: 'Thường dùng khi nhắn tin báo trước' },
      { en: 'Could you say that again?', vi: 'Bạn có thể nói lại không?', noteA: 'Lịch sự hơn "What?"' },
      { en: 'I didn\'t catch that.', vi: 'Tôi không nghe rõ.', noteA: 'Dùng khi không nghe kịp' },
      { en: 'It depends.', vi: 'Còn tùy.', noteA: 'Câu trả lời mở khi chưa chắc chắn' },
      { en: 'No worries.', vi: 'Không sao cả.', noteA: 'Thay thế cho "You\'re welcome" hoặc "It\'s OK"' },
      { en: 'Feel free to ask.', vi: 'Cứ tự nhiên hỏi nhé.', noteA: 'Mời đặt câu hỏi thoải mái' },
      { en: 'I\'m on my way.', vi: 'Tôi đang trên đường đến rồi.' },
      { en: 'Let me check.', vi: 'Để tôi kiểm tra một chút.' },
    ],
  },
  {
    id: 'work',
    icon: '💼',
    titleA: 'Công việc & Văn phòng',
    titleB: 'Work & Office',
    phrases: [
      { en: 'Let\'s schedule a meeting.', vi: 'Hãy sắp xếp một cuộc họp.', noteA: 'Đề xuất họp' },
      { en: 'I\'ll follow up with you.', vi: 'Tôi sẽ liên lạc lại với bạn sau.', noteA: '"Follow up" = theo dõi / liên hệ lại' },
      { en: 'Could you send me the report?', vi: 'Bạn có thể gửi báo cáo cho tôi không?' },
      { en: 'I\'m swamped right now.', vi: 'Tôi đang bận lắm lúc này.', noteA: '"Swamped" = quá bận, ngập việc' },
      { en: 'Let\'s touch base later.', vi: 'Để mình trao đổi lại sau nhé.', noteA: '"Touch base" = liên lạc ngắn, cập nhật tình hình' },
      { en: 'I need this by end of day.', vi: 'Tôi cần cái này trước cuối ngày hôm nay.' },
      { en: 'That\'s out of my hands.', vi: 'Việc đó không thuộc quyền của tôi.', noteA: 'Khi việc do người khác/cấp trên quyết định' },
      { en: 'Can we push the deadline?', vi: 'Chúng ta có thể dời hạn chót không?', noteA: '"Push" ở đây = dời, gia hạn' },
    ],
  },
  {
    id: 'restaurant',
    icon: '🍜',
    titleA: 'Nhà hàng & Ăn uống',
    titleB: 'Restaurant & Food',
    phrases: [
      { en: 'A table for two, please.', vi: 'Cho tôi một bàn hai người.', noteB: 'Nói khi vào nhà hàng' },
      { en: 'What do you recommend?', vi: 'Bạn/anh/chị có thể gợi ý gì không?', noteA: 'Hỏi món được đề xuất' },
      { en: 'I\'d like to order.', vi: 'Tôi muốn gọi món.', noteA: 'Mở đầu khi gọi đồ ăn' },
      { en: 'Is this dish spicy?', vi: 'Món này có cay không?', noteB: 'Useful for foreigners eating Vietnamese food' },
      { en: 'Can I get the check, please?', vi: 'Cho tôi xin hóa đơn.', noteA: 'Gọi tính tiền' },
      { en: 'Could you make it less spicy?', vi: 'Bạn có thể làm ít cay hơn không?', noteB: 'Common request in Vietnam' },
      { en: 'That was delicious!', vi: 'Món ăn ngon tuyệt!', noteA: 'Khen đồ ăn' },
      { en: 'We\'ll split the bill.', vi: 'Chúng tôi sẽ chia đôi tiền.', noteA: '"Split the bill" = chia đều tiền ăn' },
    ],
  },
  {
    id: 'shopping',
    icon: '🛍️',
    titleA: 'Mua sắm',
    titleB: 'Shopping',
    phrases: [
      { en: 'How much does this cost?', vi: 'Cái này giá bao nhiêu?', noteB: 'Essential phrase for markets in Vietnam' },
      { en: 'Can you give me a discount?', vi: 'Bạn có thể giảm giá không?', noteB: 'Bargaining is common in Vietnamese markets' },
      { en: 'Do you have this in a different size?', vi: 'Có size khác không?', noteA: 'Hỏi size khác' },
      { en: 'I\'m just looking, thanks.', vi: 'Tôi chỉ xem thôi, cảm ơn.', noteA: 'Dùng khi không muốn bị mời chào' },
      { en: 'Can I try this on?', vi: 'Tôi có thể thử cái này không?', noteA: 'Xin thử quần áo' },
      { en: 'I\'ll take it.', vi: 'Tôi lấy cái này.', noteA: 'Quyết định mua' },
      { en: 'Do you accept credit cards?', vi: 'Có nhận thẻ tín dụng không?', noteB: 'Cash is still common in Vietnam' },
      { en: 'Is this on sale?', vi: 'Cái này đang giảm giá không?', noteA: '"On sale" = đang giảm giá' },
    ],
  },
  {
    id: 'travel',
    icon: '✈️',
    titleA: 'Du lịch & Khách sạn',
    titleB: 'Travel & Hotel',
    phrases: [
      { en: 'I have a reservation.', vi: 'Tôi có đặt phòng trước.', noteA: 'Khi check-in khách sạn' },
      { en: 'How do I get to…?', vi: 'Làm thế nào để đến…?', noteB: 'Useful for getting around in Vietnam' },
      { en: 'Where is the nearest…?', vi: 'Cái gần nhất ở đâu?', noteA: 'Hỏi địa điểm gần nhất' },
      { en: 'Can you call me a taxi?', vi: 'Bạn có thể gọi taxi cho tôi không?', noteB: 'Also try Grab — very popular in Vietnam' },
      { en: 'I\'m lost.', vi: 'Tôi bị lạc đường.', noteA: 'Khi không tìm được đường' },
      { en: 'What time does it open/close?', vi: 'Mấy giờ mở/đóng cửa?', noteA: 'Hỏi giờ làm việc' },
      { en: 'Could I get a wake-up call at 7?', vi: 'Bạn có thể gọi điện đánh thức tôi lúc 7 giờ không?', noteA: 'Dịch vụ phòng khách sạn' },
      { en: 'Is breakfast included?', vi: 'Giá phòng có bao gồm bữa sáng không?', noteA: 'Hỏi khi đặt phòng' },
    ],
  },
  {
    id: 'health',
    icon: '🏥',
    titleA: 'Sức khỏe & Khẩn cấp',
    titleB: 'Health & Emergency',
    phrases: [
      { en: 'I don\'t feel well.', vi: 'Tôi không khỏe.', noteA: 'Câu đơn giản nhất để nói mình ốm' },
      { en: 'I need to see a doctor.', vi: 'Tôi cần gặp bác sĩ.', noteA: 'Khi cần khám bệnh' },
      { en: 'I\'m allergic to…', vi: 'Tôi bị dị ứng với…', noteB: 'Important to know when eating Vietnamese food' },
      { en: 'Please call an ambulance.', vi: 'Làm ơn gọi xe cấp cứu.', noteA: 'Tình huống khẩn cấp — số 115' },
      { en: 'Where is the nearest hospital?', vi: 'Bệnh viện gần nhất ở đâu?', noteA: 'Hỏi đường khi cần cấp cứu' },
      { en: 'I have a headache / stomachache.', vi: 'Tôi bị đau đầu / đau bụng.', noteA: 'Mô tả triệu chứng cơ bản' },
      { en: 'Do you have any painkillers?', vi: 'Bạn có thuốc giảm đau không?', noteA: 'Hỏi mua thuốc tại nhà thuốc' },
      { en: 'I have travel insurance.', vi: 'Tôi có bảo hiểm du lịch.', noteB: 'Mention this at Vietnamese hospitals' },
    ],
  },
  {
    id: 'social',
    icon: '🤝',
    titleA: 'Giao tiếp xã hội',
    titleB: 'Social Conversation',
    phrases: [
      { en: 'That\'s a good point.', vi: 'Điểm đó hay đấy.', noteA: 'Đồng ý một cách tích cực' },
      { en: 'I couldn\'t agree more.', vi: 'Tôi hoàn toàn đồng ý.', noteA: 'Đồng ý mạnh' },
      { en: 'I see your point, but…', vi: 'Tôi hiểu ý bạn, nhưng…', noteA: 'Lịch sự khi không đồng ý' },
      { en: 'Could you clarify what you mean?', vi: 'Bạn có thể giải thích rõ hơn không?', noteA: 'Hỏi thêm khi chưa hiểu' },
      { en: 'That\'s interesting.', vi: 'Thú vị đấy.', noteA: 'Phản hồi khi nghe thông tin mới' },
      { en: 'To be honest…', vi: 'Nói thật là…', noteA: 'Mở đầu khi nói quan điểm thẳng thắn' },
      { en: 'I\'m just kidding.', vi: 'Tôi chỉ đùa thôi.', noteA: 'Giải thích sau khi nói đùa' },
      { en: 'Anyway, where were we?', vi: 'Thôi, chúng ta đang nói đến đâu rồi?', noteA: 'Trở lại chủ đề sau khi lạc đề' },
    ],
  },
  {
    id: 'tech',
    icon: '💻',
    titleA: 'Công nghệ & Mạng xã hội',
    titleB: 'Tech & Social Media',
    phrases: [
      { en: 'The Wi-Fi isn\'t working.', vi: 'Wi-Fi không hoạt động.', noteB: 'Say this at cafés or hotels in Vietnam' },
      { en: 'What\'s the Wi-Fi password?', vi: 'Mật khẩu Wi-Fi là gì?', noteB: 'Very common question in Vietnamese cafés' },
      { en: 'Can you send me the link?', vi: 'Bạn có thể gửi link cho tôi không?', noteA: 'Xin đường dẫn' },
      { en: 'My phone is dead.', vi: 'Điện thoại tôi hết pin rồi.', noteA: '"Dead" ở đây = hết pin' },
      { en: 'Can I charge my phone here?', vi: 'Tôi có thể sạc điện thoại ở đây không?', noteA: 'Hỏi mượn ổ cắm điện' },
      { en: 'Let\'s stay in touch.', vi: 'Hãy giữ liên lạc nhé.', noteA: 'Nói khi chia tay' },
      { en: 'Add me on Zalo / Facebook.', vi: 'Kết bạn Zalo / Facebook với tôi nhé.', noteB: 'Zalo is the most popular messaging app in Vietnam' },
      { en: 'It\'s loading slowly.', vi: 'Đang tải chậm quá.', noteA: 'Khi mạng chậm' },
    ],
  },
  {
    id: 'feelings',
    icon: '😊',
    titleA: 'Cảm xúc & Thái độ',
    titleB: 'Feelings & Attitudes',
    phrases: [
      { en: 'I\'m really excited about this.', vi: 'Tôi thực sự hào hứng về điều này.', noteA: '"Excited" = hào hứng, phấn khích' },
      { en: 'I\'m a bit nervous.', vi: 'Tôi hơi lo lắng / hồi hộp.', noteA: '"Nervous" = lo lắng, hồi hộp' },
      { en: 'I\'m overwhelmed.', vi: 'Tôi bị áp lực quá.', noteA: '"Overwhelmed" = cảm giác quá tải, ngợp' },
      { en: 'I\'m relieved.', vi: 'Tôi nhẹ nhõm rồi.', noteA: '"Relieved" = cảm thấy nhẹ nhõm sau lo lắng' },
      { en: 'That really made my day.', vi: 'Điều đó làm tôi vui cả ngày.', noteA: '"Made my day" = làm ngày của mình trở nên tuyệt hơn' },
      { en: 'I\'m at a loss for words.', vi: 'Tôi không biết nói gì nữa.', noteA: 'Khi bất ngờ hoặc xúc động quá mức' },
      { en: 'I feel the same way.', vi: 'Tôi cảm thấy như vậy.', noteA: 'Đồng cảm với người khác' },
      { en: 'That\'s disappointing.', vi: 'Thật đáng thất vọng.', noteA: '"Disappointing" = gây thất vọng' },
    ],
  },
]
