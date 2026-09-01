// lessons/sinh11c1.ts — Sinh học 11, Chương 1 (Bài 1-12).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH11_C1_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh11-c1-b1',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 1,
    title: 'Khái quát về trao đổi chất và chuyển hóa năng lượng ở sinh vật',
    hook: 'Mọi sinh vật sống, từ cái cây nhỏ bé đến cơ thể con người, đều giống như một nhà máy hóa chất hoạt động không ngừng để chuyển hóa vật chất và năng lượng duy trì sự sống.',
    theory:
      'KHÁI NIỆM TRAO ĐỔI CHẤT VÀ CHUYỂN HÓA NĂNG LƯỢNG:\\n' +
      '— Trao đổi chất ở tế bào gồm hai quá trình đối lập nhưng thống nhất:\\n' +
      '  + Đồng hóa (Anabolism): Quá trình tổng hợp các chất hữu cơ phức tạp từ các chất đơn giản, đồng thời tích lũy năng lượng dưới dạng liên kết hóa học.\\n' +
      '  + Dị hóa (Catabolism): Quá trình phân giải các chất hữu cơ phức tạp thành chất đơn giản, đồng thời giải phóng năng lượng chứa trong các liên kết hóa học thành ATP và nhiệt năng.\\n' +
      '— Ba vai trò chính: Cung cấp nguyên liệu xây dựng tế bào; cung cấp năng lượng cho mọi hoạt động sống (ATP); đào thải các chất cặn bã, độc hại ra ngoài môi trường.\\n\\n' +
      'PHƯƠNG THỨC DINH DƯỠNG CỦA SINH VẬT:\\n' +
      'Dựa vào nguồn carbon và nguồn năng lượng, sinh vật được chia thành hai nhóm lớn:\\n' +
      '1. Sinh vật tự dưỡng (Autotrophs): Tự tổng hợp chất hữu cơ từ các chất vô cơ. Gồm quang tự dưỡng (dùng ánh sáng, ví dụ: thực vật, vi khuẩn lam) và hóa tự dưỡng (dùng năng lượng phản ứng hóa học vô cơ, ví dụ: vi khuẩn nitrat hóa).\\n' +
      '2. Sinh vật dị dưỡng (Heterotrophs): Lấy chất hữu cơ có sẵn từ sinh vật khác. Gồm quang dị dưỡng (vi khuẩn không lưu huỳnh màu tía) và hóa dị dưỡng (động vật, nấm, hầu hết vi khuẩn).\\n\\n' +
      'BA GIAI ĐOẠN TRAO ĐỔI CHẤT Ở SINH VẬT ĐA BÀO:\\n' +
      '— Giai đoạn 1: Trao đổi chất giữa môi trường ngoài và cơ thể (lấy thức ăn, nước, muối khoáng, khí O₂ và thải phân, nước tiểu, CO₂... qua các hệ cơ quan hô hấp, tiêu hóa, bài tiết).\\n' +
      '— Giai đoạn 2: Vận chuyển các chất giữa các cơ quan trong cơ thể (nhờ hệ tuần hoàn vận chuyển chất dinh dưỡng, O₂ đến tế bào và mang chất thải từ tế bào đến cơ quan bài tiết).\\n' +
      '— Giai đoạn 3: Trao đổi chất và năng lượng ở cấp độ tế bào (được thực hiện thông qua các phản ứng đồng hóa và dị hóa nội bào, trong đó hô hấp tế bào đóng vai trò trung tâm tạo ATP).',
    workedExample: {
      problem:
        'Trình bày vai trò cốt lõi của đồng tiền năng lượng ATP trong mối quan hệ giữa đồng hóa và dị hóa trong tế bào.',
      steps: [
        'Định nghĩa ATP: Adenosine Triphosphate là hợp chất cao năng, chứa các liên kết phosphate dễ bị thủy phân giải phóng năng lượng.',
        'Mối liên hệ với dị hóa: Quá trình dị hóa (phân giải chất hữu cơ) giải phóng năng lượng, năng lượng này được tế bào sử dụng để tổng hợp nên ATP (tích lũy năng lượng).',
        'Mối liên hệ với đồng hóa: Quá trình đồng hóa (tổng hợp chất hữu cơ) cần năng lượng. ATP sẽ bị phân hủy thành ADP và Pi, giải phóng năng lượng để cung cấp trực tiếp cho các phản ứng đồng hóa này.',
      ],
      answer:
        'Dị hóa giải phóng năng lượng để tổng hợp ATP; đồng hóa phân hủy ATP để lấy năng lượng cung cấp cho các phản ứng tổng hợp.',
    },
    checkQuestions: [
      {
        prompt: 'Quá trình đồng hóa (anabolism) trong tế bào có đặc điểm nào sau đây?',
        choices: [
          { id: 'dh_1', label: 'Tổng hợp các chất hữu cơ phức tạp và tích lũy năng lượng' },
          { id: 'dh_2', label: 'Phân giải các chất phức tạp và giải phóng năng lượng' },
          { id: 'dh_3', label: 'Chỉ xảy ra ở động vật ăn thực vật' },
          { id: 'dh_4', label: 'Không tiêu tốn năng lượng ATP của tế bào' },
        ],
        answer: { kind: 'choice', correctIds: ['dh_1'] },
        explain:
          'Đồng hóa là quá trình tổng hợp các chất hữu cơ phức tạp từ chất đơn giản, đồng thời tích lũy năng lượng trong các liên kết hóa học mới tạo thành.',
      },
      {
        prompt: 'Phương thức dinh dưỡng của thực vật màu xanh và vi khuẩn lam là gì?',
        choices: [
          { id: 'dd_1', label: 'Quang tự dưỡng' },
          { id: 'dd_2', label: 'Hóa tự dưỡng' },
          { id: 'dd_3', label: 'Quang dị dưỡng' },
          { id: 'dd_4', label: 'Hóa dị dưỡng' },
        ],
        answer: { kind: 'choice', correctIds: ['dd_1'] },
        explain:
          'Thực vật màu xanh và vi khuẩn lam có diệp lục để hấp thụ ánh sáng làm nguồn năng lượng và sử dụng CO₂ làm nguồn carbon để tự tổng hợp chất hữu cơ, do đó chúng có phương thức quang tự dưỡng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu sự khác nhau cơ bản giữa sinh vật tự dưỡng và sinh vật dị dưỡng?',
        dap: 'Sinh vật tự dưỡng tự tổng hợp chất hữu cơ từ chất vô cơ; sinh vật dị dưỡng phải lấy chất hữu cơ có sẵn từ các sinh vật khác.',
      },
      {
        hoi: 'Kể tên 3 giai đoạn trao đổi chất ở sinh vật đa bào?',
        dap: '1. Trao đổi chất giữa cơ thể với môi trường; 2. Vận chuyển các chất trong cơ thể; 3. Trao đổi chất và năng lượng ở tế bào.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b2',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 2,
    title: 'Trao đổi nước và khoáng ở thực vật',
    hook: 'Làm thế nào nước từ dưới lòng đất sâu có thể di chuyển ngược chiều trọng lực lên tận ngọn cây cao hàng trăm mét? Đó là nhờ một hệ thống bơm sinh học và lực kéo vật lý tinh vi.',
    theory:
      'HẤP THỤ NƯỚC VÀ KHOÁNG Ở RỄ:\\n' +
      '— Cơ quan hấp thụ chính: Tế bào lông hút ở miền hút của rễ. Lông hút làm tăng diện tích tiếp xúc giữa rễ và đất.\\n' +
      '— Cơ chế hấp thụ nước: Nước được hấp thụ thụ động theo cơ chế thẩm thấu (đi từ nơi có thế nước cao trong đất vào nơi có thế nước thấp trong tế bào lông hút do dịch bào lông hút ưu trương).\\n' +
      '— Cơ chế hấp thụ khoáng: Gồm hấp thụ thụ động (khuếch tán theo građien nồng độ) và hấp thụ chủ động (vận chuyển ngược građien nồng độ, cần protein vận chuyển và tiêu tốn năng lượng ATP).\\n\\n' +
      'VẬN CHUYỂN VẬT CHẤT TRONG CÂY:\\n' +
      '1. Dòng mạch gỗ (Xylem): Vận chuyển nước, ion khoáng và một số chất hữu cơ tổng hợp từ rễ lên thân, lá.\\n' +
      '   — Cấu tạo mạch gỗ: Các tế bào chết gồm quản bào và mạch ống liên kết đầu nối đầu thành ống rỗng liên tục.\\n' +
      '   — Động lực dòng mạch gỗ: Kết hợp 3 lực:\\n' +
      '     + Lực kéo do thoát hơi nước ở lá (chủ đạo).\\n' +
      '     + Lực đẩy của rễ (áp suất rễ - gây ra hiện tượng rỉ nhựa và ứ giọt).\\n' +
      '     + Lực liên kết giữa các phân tử nước với nhau và với thành mạch gỗ.\\n' +
      '2. Dòng mạch rây (Phloem): Vận chuyển các chất hữu cơ tổng hợp từ lá (cơ quan nguồn) đến các cơ quan dự trữ hoặc sinh trưởng như rễ, củ, quả (cơ quan chứa).\\n' +
      '   — Cấu tạo mạch rây: Tế bào sống gồm ống rây (không nhân) và tế bào kèm.\\n' +
      '   — Động lực dòng mạch rây: Chênh lệch áp suất thẩm thấu giữa cơ quan nguồn và cơ quan chứa.\\n\\n' +
      'THOÁT HƠI NƯỚC Ở LÁ:\\n' +
      '— Vai trò: Tạo lực kéo dòng mạch gỗ; làm giảm nhiệt độ bề mặt lá; tạo điều kiện cho khí khổng mở để CO₂ khuếch tán vào lá thực hiện quang hợp.\\n' +
      '— Con đường thoát hơi nước:\\n' +
      '  + Qua khí khổng (chủ yếu): Tốc độ lớn, được điều tiết bằng sự đóng mở khí khổng (tế bào hạt đậu no nước -> thành mỏng căng cong làm khí khổng mở; mất nước -> thành mỏng duỗi thẳng làm khí khổng đóng).\\n' +
      '  + Qua cutin (bề mặt lá): Tốc độ nhỏ, không được điều tiết (lá non lớp cutin mỏng thoát nước nhiều; lá già cutin dày thoát nước ít).',
    workedExample: {
      problem:
        'Hãy giải thích tại sao khi bón phân quá nhiều (bón thúc quá liều) cho cây trồng thì cây có thể bị héo và chết.',
      steps: [
        'Xem xét sự thay đổi nồng độ chất tan trong đất: Khi bón quá nhiều phân, nồng độ các ion khoáng trong dung dịch đất tăng cao vượt mức bình thường.',
        'So sánh thế nước: Đất trở thành môi trường ưu trương so với dịch tế bào lông hút (thế nước ở đất thấp hơn thế nước tế bào rễ).',
        'Xác định dòng nước thẩm thấu: Nước không thể thấm từ đất vào rễ, ngược lại nước từ trong tế bào rễ bị thẩm thấu ra ngoài đất làm rễ mất nước, tế bào co nguyên sinh, dẫn đến cây bị héo và chết.',
      ],
      answer:
        'Bón quá nhiều phân làm đất trở nên ưu trương, rễ cây không hút được nước mà còn bị mất nước ngược ra ngoài dẫn đến héo chết.',
    },
    checkQuestions: [
      {
        prompt:
          'Động lực chính đóng vai trò kéo dòng nước và ion khoáng trong mạch gỗ từ rễ lên ngọn cây là gì?',
        choices: [
          { id: 'dl_1', label: 'Lực kéo do quá trình thoát hơi nước ở lá' },
          { id: 'dl_2', label: 'Lực đẩy của rễ (áp suất rễ)' },
          { id: 'dl_3', label: 'Lực liên kết giữa các phân tử nước với nhau' },
          { id: 'dl_4', label: 'Trọng lực trái đất tác dụng lên dòng mạch gỗ' },
        ],
        answer: { kind: 'choice', correctIds: ['dl_1'] },
        explain:
          'Thoát hơi nước ở lá tạo ra một sự hụt nước liên tục, kéo thế nước ở lá xuống thấp và tạo ra lực kéo hút nước từ dưới rễ lên trên thân lá một cách mạnh mẽ nhất.',
      },
      {
        prompt: 'Dòng mạch rây ở thực vật có đặc điểm cấu tạo nào sau đây?',
        choices: [
          { id: 'mr_1', label: 'Gồm các tế bào sống là ống rây và tế bào kèm' },
          { id: 'mr_2', label: 'Gồm các tế bào chết là quản bào và mạch ống' },
          { id: 'mr_3', label: 'Là các tế bào hóa gỗ rỗng hoàn toàn' },
          { id: 'mr_4', label: 'Không có các cầu sinh chất nối giữa các tế bào' },
        ],
        answer: { kind: 'choice', correctIds: ['mr_1'] },
        explain:
          'Mạch rây cấu tạo từ các tế bào sống bao gồm ống rây (tế bào chuyên hóa mất nhân nhưng màng sinh chất và tế bào chất còn lại) và tế bào kèm giàu ti thể để cung cấp năng lượng vận chuyển chủ động.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nước được hấp thụ vào tế bào lông hút rễ theo cơ chế nào?',
        dap: 'Cơ chế thẩm thấu (thụ động) từ nơi thế nước cao trong đất vào nơi thế nước thấp trong tế bào.',
      },
      {
        hoi: 'Tại sao khí khổng mở ra khi tế bào hạt đậu no nước?',
        dap: 'Do tế bào hạt đậu có thành trong dày, thành ngoài mỏng. Khi no nước, thành ngoài mỏng căng ra kéo thành trong cong theo làm xuất hiện khe hở (khí khổng mở).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b3',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 3,
    title: 'Thực hành: Một số thí nghiệm về trao đổi nước và khoáng ở thực vật',
    hook: 'Làm thế nào để trực tiếp quan sát hiện tượng co nguyên sinh của tế bào thực vật, hay chứng minh sự chênh lệch thoát hơi nước ở hai mặt lá?',
    theory:
      'THÍ NGHIỆM CO NGUYÊN SINH VÀ PHẢN CO NGUYÊN SINH:\\n' +
      '— Nguyên tắc: Dựa trên sự di chuyển của nước qua màng sinh chất bán thấm tùy thuộc vào thế nước của môi trường ngoài tế bào.\\n' +
      '— Tiến trình thí nghiệm co nguyên sinh:\\n' +
      '  1. Bóc lớp biểu bì mặt sau lá cây thuốc bỏng hoặc hành ta nhuộm màu tím, đặt lên lam kính có giọt nước cất, đậy lamen và quan sát dưới kính hiển vi. Tế bào bình thường căng nước.\\n' +
      '  2. Nhỏ dung dịch sucrose 10% hoặc NaCl loãng vào một rìa lamen, dùng giấy thấm hút nước ở rìa đối diện để kéo dung dịch muối vào tế bào biểu bì. Quan sát: không bào co nhỏ lại, màng sinh chất tách dần khỏi thành tế bào (hiện tượng co nguyên sinh).\\n' +
      '— Tiến trình phản co nguyên sinh: Nhỏ tiếp nước cất vào một rìa lamen, thấm dung dịch muối ra. Quan sát: nước thẩm thấu vào tế bào làm không bào và tế bào chất nở ra sát thành tế bào.\\n\\n' +
      'THÍ NGHIỆM SO SÁNH TỐC ĐỘ THOÁT HƠI NƯỚC Ở HAI MẶT LÁ:\\n' +
      '— Nguyên tắc: Cobalt chloride (CoCl₂) khi khô có màu xanh da trời, khi gặp nước chuyển sang màu hồng.\\n' +
      '— Tiến trình: Kẹp hai tấm giấy thấm tẩm CoCl₂ khô (màu xanh) vào mặt trên và mặt dưới của một chiếc lá trên cây. Ép chặt bằng lam kính và kẹp định vị. Đo thời gian giấy chuyển từ xanh sang hồng.\\n' +
      '— Kết quả: Giấy kẹp ở mặt dưới lá chuyển sang màu hồng nhanh hơn mặt trên (đối với cây hai lá mầm) vì mặt dưới có nhiều khí khổng hơn.',
    workedExample: {
      problem:
        'Trong thí nghiệm so sánh tốc độ thoát hơi nước ở lá cây đa, nếu thấy giấy cobalt chloride ở mặt dưới chuyển màu hồng trong 3 phút còn mặt trên mất 15 phút, em rút ra kết luận gì?',
      steps: [
        'Liên hệ tốc độ đổi màu của giấy CoCl₂ với lượng hơi nước thoát ra: đổi màu nhanh = lượng hơi nước thoát ra nhiều trong thời gian ngắn.',
        'Liên hệ lượng hơi nước thoát ra với số lượng khí khổng: hơi nước thoát ra chủ yếu qua khí khổng.',
        'Rút ra kết luận: Mặt dưới của lá cây đa có mật độ khí khổng lớn hơn nhiều so với mặt trên lá, dẫn đến tốc độ thoát hơi nước ở mặt dưới diễn ra nhanh hơn.',
      ],
      answer:
        'Tốc độ thoát hơi nước ở mặt dưới lớn hơn nhiều so với mặt trên do mật độ khí khổng ở mặt dưới nhiều hơn.',
    },
    checkQuestions: [
      {
        prompt:
          'Khi nhỏ dung dịch muối ưu trương vào tế bào biểu bì lá hành ta dưới kính hiển vi, ta sẽ quan sát thấy hiện tượng nào?',
        choices: [
          {
            id: 'cn_1',
            label: 'Không bào co lại, màng sinh chất tách khỏi thành tế bào (co nguyên sinh)',
          },
          { id: 'cn_2', label: 'Tế bào hút nước trương to và bị vỡ ra ngay lập tức' },
          { id: 'cn_3', label: 'Lục lạp trong tế bào di chuyển ra sát thành tế bào' },
          { id: 'cn_4', label: 'Không có sự thay đổi nào về cấu trúc tế bào' },
        ],
        answer: { kind: 'choice', correctIds: ['cn_1'] },
        explain:
          'Dung dịch muối ưu trương làm nước thẩm thấu ra ngoài, làm thể tích không bào trung tâm giảm đi, kéo màng sinh chất co lại và tách rời khỏi thành tế bào cứng cáp.',
      },
      {
        prompt:
          'Chất chỉ thị màu dùng để so sánh tốc độ thoát hơi nước ở hai mặt lá của thực vật là:',
        choices: [
          { id: 'ct_1', label: 'Cobalt chloride (CoCl₂)' },
          { id: 'ct_2', label: 'Phenolphthalein' },
          { id: 'ct_3', label: 'Xanh methylene' },
          { id: 'ct_4', label: 'Thuốc thử Benedict' },
        ],
        answer: { kind: 'choice', correctIds: ['ct_1'] },
        explain:
          'Cobalt chloride nhạy cảm với độ ẩm, đổi màu rõ rệt từ xanh da trời (khô) sang hồng (ướt) nên được dùng để chỉ thị sự thoát hơi nước.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thế nào là hiện tượng phản co nguyên sinh?',
        dap: 'Là hiện tượng tế bào đã co nguyên sinh được đưa vào môi trường nhược trương (như nước cất), tế bào hút nước làm không bào to ra và màng sinh chất lại áp sát vào thành tế bào.',
      },
      {
        hoi: 'Tại sao giấy cobalt chloride ở mặt dưới lá cây cam lại đổi màu nhanh hơn mặt trên?',
        dap: 'Vì mặt dưới lá cây cam có mật độ khí khổng cao hơn nhiều so với mặt trên, dẫn đến tốc độ thoát hơi nước ở mặt dưới lớn hơn.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b4',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 4,
    title: 'Quang hợp ở thực vật',
    hook: 'Lá cây hấp thụ năng lượng mặt trời để biến CO₂ và nước thành chất dinh dưỡng hữu cơ và giải phóng oxi. Quá trình quang hợp duy trì toàn bộ sự sống trên Trái Đất.',
    theory:
      'KHÁI NIỆM QUANG HỢP:\\n' +
      '— Phương trình tổng quát: 6CO₂ + 6H₂O + Ánh sáng → C₆H₁₂O₆ + 6O₂.\\n' +
      '— Bộ phận quang hợp chính: Lá cây. Bào quan thực hiện: Lục lạp (Chloroplast).\\n\\n' +
      'HỆ SẮC TỐ QUANG HỢP (nằm trên màng thylakoid):\\n' +
      '— Sắc tố chính: Diệp lục (Chlorophyll), gồm diệp lục a và diệp lục b. Trong đó, diệp lục a ở trung tâm phản ứng trực tiếp nhận năng lượng ánh sáng và biến đổi thành năng lượng hóa học (ATP, NADPH).\\n' +
      '— Sắc tố phụ: Carotenoid (gồm caroten và xanthophyll), hấp thụ ánh sáng ở bước sóng khác rồi truyền năng lượng cho diệp lục a, đồng thời bảo vệ diệp lục khỏi bị phân hủy dưới ánh sáng mạnh.\\n\\n' +
      'HAI PHA CỦA QUANG HỢP:\\n' +
      '1. Pha sáng (xảy ra trên màng thylakoid):\\n' +
      '   — Điều kiện: Cần năng lượng ánh sáng.\\n' +
      '   — Quá trình: Diệp lục hấp thụ ánh sáng thực hiện quang phân li nước (2H₂O → 4H⁺ + 4e⁻ + O₂), giải phóng O₂. Đồng thời tổng hợp ATP và NADPH.\\n' +
      '2. Pha tối / Chu trình Calvin (xảy ra trong chất nền stroma):\\n' +
      '   — Điều kiện: Không cần ánh sáng trực tiếp nhưng cần sản phẩm của pha sáng (ATP, NADPH).\\n' +
      '   — Quá trình: Cố định CO₂ nhờ chu trình Calvin chuyển hóa thành chất hữu cơ (đường AlPG rồi thành Glucose).\\n\\n' +
      'CÁC NHÓM THỰC VẬT C₃, C₄ VÀ CAM:\\n' +
      '— Thực vật C₃: Sống ở vùng ôn đới, cận nhiệt đới (lúa, khoai, sắn). Cố định CO₂ trực tiếp bằng chu trình Calvin tại tế bào mô giậu.\\n' +
      '— Thực vật C₄: Sống ở vùng nhiệt đới nóng ẩm (mía, ngô, rau dền). Có năng suất quang hợp cao vì thực hiện con đường cố định CO₂ hai giai đoạn (ở tế bào mô giậu và tế bào bao bó mạch), không xảy ra hô hấp sáng.\\n' +
      '— Thực vật CAM: Thực vật mọng nước sống ở sa mạc hoặc khô hạn (xương rồng, dứa, lô hội). Đóng khí khổng ban ngày để tiết kiệm nước, chỉ mở khí khổng ban đêm để lấy CO₂ tích trữ dưới dạng axit hữu cơ (malate). Ban ngày giải phóng CO₂ từ axit này đưa vào chu trình Calvin.',
    workedExample: {
      problem:
        'Hãy so sánh đặc điểm quang hợp của ba nhóm thực vật C3, C4 và CAM về thời gian mở khí khổng và hiệu suất quang hợp.',
      steps: [
        'So sánh thời gian mở khí khổng: C3 và C4 mở khí khổng vào ban ngày để lấy CO₂ trực tiếp; CAM mở khí khổng vào ban đêm để tránh mất nước và đóng vào ban ngày.',
        'So sánh hiệu suất quang hợp: Thực vật C4 có hiệu suất quang hợp cao nhất do không có hô hấp sáng; thực vật C3 có hiệu suất trung bình; thực vật CAM có hiệu suất thấp nhất vì sinh trưởng trong môi trường hạn chế nước cực đoan.',
      ],
      answer: 'Khí khổng: C3, C4 mở ban ngày, CAM mở ban đêm. Hiệu suất quang hợp: C4 > C3 > CAM.',
    },
    checkQuestions: [
      {
        prompt:
          'Sắc tố quang hợp nào sau đây trực tiếp tham gia biến đổi năng lượng ánh sáng thành năng lượng hóa học trong các phản ứng sáng?',
        choices: [
          { id: 'st_1', label: 'Diệp lục a ở trung tâm phản ứng' },
          { id: 'st_2', label: 'Diệp lục b' },
          { id: 'st_3', label: 'Carotene' },
          { id: 'st_4', label: 'Xanthophyll' },
        ],
        answer: { kind: 'choice', correctIds: ['st_1'] },
        explain:
          'Chỉ có phân tử diệp lục a ở trung tâm phản ứng quang hóa mới có khả năng nhường electron bị kích thích cho chuỗi truyền electron để tạo ra ATP và NADPH.',
      },
      {
        prompt: 'Khí O₂ được giải phóng trong pha sáng của quang hợp có nguồn gốc từ chất nào?',
        choices: [
          { id: 'ng_1', label: 'H₂O (nước)' },
          { id: 'ng_2', label: 'CO₂' },
          { id: 'ng_3', label: 'C₆H₁₂O₆' },
          { id: 'ng_4', label: 'Axit cacbonic' },
        ],
        answer: { kind: 'choice', correctIds: ['ng_1'] },
        explain:
          'Trong pha sáng, ánh sáng mặt trời kích hoạt quá trình quang phân li nước xảy ra ở xoang thylakoid tạo H⁺, electron và giải phóng khí O₂.',
      },
    ],
    srsCards: [
      {
        hoi: 'Quá trình quang hợp ở thực vật xảy ra ở bào quan nào?',
        dap: 'Lục lạp (Chloroplast).',
      },
      {
        hoi: 'Tại sao thực vật CAM phải cố định CO₂ vào ban đêm?',
        dap: 'Để thích nghi với môi trường khô hạn sa mạc: ban ngày chúng phải đóng khí khổng chống mất nước, ban đêm mát mẻ mới mở khí khổng để hấp thụ CO₂.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b5',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 5,
    title: 'Thực hành: Một số thí nghiệm về quang hợp ở thực vật',
    hook: 'Làm thế nào để chứng minh lá cây cần ánh sáng để tổng hợp tinh bột, hay chiết xuất các chất màu diệp lục ra khỏi lá cây?',
    theory:
      'THÍ NGHIỆM CHỨNG MINH LÁ CÂY TẠO TINH BỘT KHI QUANG HỢP:\\n' +
      '— Nguyên tắc: Tinh bột gặp dung dịch iốt chuyển thành màu xanh tím đặc trưng.\\n' +
      '— Tiến trình:\\n' +
      '  1. Bịt một phần lá cây khoai lang hoặc thiết mộc lan bằng băng giấy đen cả hai mặt, để cây trong bóng tối 2 ngày, sau đó đưa ra nắng chiếu sáng 6-8 giờ.\\n' +
      '  2. Ngắt lá thí nghiệm, luộc sôi trong nước 5 phút, sau đó cho vào ống nghiệm chứa cồn 90% đun cách thủy để tẩy sạch diệp lục (lá có màu trắng ngà).\\n' +
      '  3. Rửa lá bằng nước ấm rồi nhỏ dung dịch iốt lên bề mặt lá.\\n' +
      '— Hiện tượng: Phần lá không bị che phủ (quang hợp bình thường) chuyển sang màu xanh tím đậm; phần lá bị bịt giấy đen không đổi màu (giữ màu trắng ngà của lá tẩy diệp lục).\\n\\n' +
      'THÍ NGHIỆM TÁCH CHIẾT SẮC TỐ QUANG HỢP:\\n' +
      '— Nguyên tắc: Sắc tố quang hợp tan trong dung môi hữu cơ (cồn, acetone) nhưng không tan trong nước.\\n' +
      '— Tiến trình: Giã nát lá xanh với một lượng nhỏ cồn 90% hoặc acetone, lọc dịch chiết bằng giấy lọc. Ta thu được dịch sắc tố màu xanh lục đậm.\\n' +
      '— Phân tách bằng sắc ký giấy: Nhỏ một giọt dịch chiết sắc tố lên giấy sắc ký, đặt đuôi giấy tiếp xúc với dung môi chạy sắc ký (ví dụ hỗn hợp ether dầu hỏa và acetone). Các sắc tố di chuyển với tốc độ khác nhau do độ tan và lực liên kết với giấy khác nhau, tách thành các vạch màu rõ rệt (carotene màu cam ở trên cùng, xanthophyll màu vàng, diệp lục a màu xanh lục, diệp lục b màu xanh vàng ở dưới cùng).',
    workedExample: {
      problem:
        'Giải thích tại sao trong thí nghiệm tinh bột cần phải tẩy diệp lục của lá bằng cồn nóng trước khi nhỏ dung dịch iốt lên lá.',
      steps: [
        'Nhận diện màu sắc lá ban đầu: Lá cây có màu xanh lục đậm do chứa lượng lớn diệp lục.',
        'Nhận diện màu của phản ứng iốt-tinh bột: Phản ứng tạo màu xanh tím.',
        'Lập luận: Nếu không tẩy diệp lục (màu xanh lục), màu xanh lục đậm sẽ che lấp và làm nhiễu sự quan sát màu xanh tím nhẹ của phản ứng iốt với tinh bột. Việc tẩy diệp lục bằng cồn giúp lá chuyển sang màu trắng ngà, tạo nền tương phản hoàn hảo để nhận diện rõ màu xanh tím tạo thành.',
      ],
      answer:
        'Tẩy diệp lục bằng cồn giúp lá mất màu xanh lục, tạo nền màu trắng để dễ dàng quan sát màu xanh tím khi nhỏ iốt.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong thí nghiệm chứng minh sự tạo thành tinh bột khi quang hợp, phần lá bị che băng giấy đen sau khi nhỏ iốt sẽ:',
        choices: [
          { id: 'tb_1', label: 'Không chuyển sang màu xanh tím (vẫn giữ màu trắng ngà)' },
          { id: 'tb_2', label: 'Chuyển sang màu xanh tím đậm giống phần chiếu sáng' },
          { id: 'tb_3', label: 'Chuyển sang màu đỏ gạch' },
          { id: 'tb_4', label: 'Bị phân hủy tan rã hoàn toàn' },
        ],
        answer: { kind: 'choice', correctIds: ['tb_1'] },
        explain:
          'Phần lá bị che đen không nhận được ánh sáng nên không thể thực hiện quang hợp tạo tinh bột, do đó không xảy ra phản ứng màu xanh tím với iốt.',
      },
      {
        prompt:
          'Dung môi hữu cơ nào sau đây thường được dùng để tách chiết sắc tố quang hợp ra khỏi tế bào thực vật trong phòng thí nghiệm?',
        choices: [
          { id: 'dm_1', label: 'Ethanol (cồn) hoặc Acetone' },
          { id: 'dm_2', label: 'Nước cất nóng' },
          { id: 'dm_3', label: 'Dung dịch NaOH 10%' },
          { id: 'dm_4', label: 'Axit clohydric (HCl)' },
        ],
        answer: { kind: 'choice', correctIds: ['dm_1'] },
        explain:
          'Các phân tử sắc tố quang hợp có bản chất kỵ nước, tan tốt trong các dung môi hữu cơ phân cực nhẹ như cồn (ethanol) hoặc acetone, không tan trong nước cất.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao phải đun cách thủy ống nghiệm chứa cồn tẩy diệp lục mà không đun trực tiếp trên lửa?',
        dap: 'Vì cồn là chất lỏng cực kỳ dễ cháy và bay hơi nhanh; đun trực tiếp trên ngọn lửa đèn cồn rất dễ gây hỏa hoạn nguy hiểm.',
      },
      {
        hoi: 'Nêu thứ tự phân tách các vạch sắc tố từ dưới lên trên giấy sắc ký?',
        dap: 'Diệp lục b (xanh vàng) -> Diệp lục a (xanh lục) -> Xanthophyll (vàng) -> Carotene (cam).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b6',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 6,
    title: 'Hô hấp ở thực vật',
    hook: 'Hạt giống khi nảy mầm tỏa ra một lượng nhiệt lớn và giải phóng nhiều CO₂. Đó chính là hoạt động hô hấp mạnh mẽ giúp cây lấy năng lượng phá vỡ vỏ hạt.',
    theory:
      'BẢN CHẤT CỦA HÔ HẤP Ở THỰC VẬT:\\n' +
      '— Định nghĩa: Là quá trình oxy hóa sinh học các chất hữu cơ (chủ yếu là glucose) diễn ra trong tế bào thực vật, tạo ra năng lượng dưới dạng ATP cung cấp cho các hoạt động sống, đồng thời giải phóng nhiệt năng, CO₂ và H₂O.\\n' +
      '— Phương trình: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Năng lượng (ATP + Nhiệt).\\n\\n' +
      'CÁC CON ĐƯỜNG HÔ HẤP Ở THỰC VẬT:\\n' +
      '1. Hô hấp hiếu khí (khi có O₂): Con đường chủ yếu của cây.\\n' +
      '   — Diễn ra trong tế bào chất và ti thể qua 3 giai đoạn:\\n' +
      '     + Đường phân (trong tế bào chất): Glucose → 2 Axit pyruvic (pyruvate) + 2 ATP + 2 NADH.\\n' +
      '     + Chu trình Krebs (trong chất nền ti thể): Axit pyruvic được oxy hóa hoàn toàn tạo CO₂, ATP, NADH, FADH₂.\\n' +
      '     + Chuỗi truyền electron hô hấp (trên màng trong ti thể): NADH và FADH₂ nhường electron giải phóng năng lượng tổng hợp khoảng 26-28 ATP (tổng cả quá trình tạo khoảng 30-32 ATP/glucose).\\n' +
      '2. Phân giải kị khí / Lên men (khi thiếu O₂ - ví dụ cây bị ngập úng hoặc hạt ngâm nước):\\n' +
      '   — Diễn ra trong tế bào chất: Đường phân tạo axit pyruvic, sau đó axit pyruvic lên men tạo rượu ethanol hoặc axit lactic. Chỉ thu được vỏn vẹn 2 ATP từ đường phân.\\n\\n' +
      'VAI TRÒ CỦA HÔ HẤP:\\n' +
      '— Cung cấp năng lượng ATP cho các quá trình sinh lý của cây (như rễ chủ động hấp thụ ion khoáng, sinh tổng hợp chất, sinh trưởng).\\n' +
      '— Giải phóng nhiệt năng giúp duy trì nhiệt độ cơ thể thực vật, thuận lợi cho các phản ứng enzym.\\n' +
      '— Tạo ra các chất hữu cơ trung gian là nguyên liệu cho các quá trình tổng hợp các chất khác.',
    workedExample: {
      problem:
        'Hãy giải thích tại sao khi đất trồng bị ngập úng nước kéo dài, rễ cây bị thối và cây trồng nhanh chóng bị héo, chết.',
      steps: [
        'Mất oxi trong đất: Khi ngập úng, nước chiếm chỗ của không khí trong các kẽ đất, làm lượng O₂ giảm mạnh.',
        'Chuyển đổi con đường hô hấp: Rễ cây không thể thực hiện hô hấp hiếu khí mà phải chuyển sang con đường lên men kị khí.',
        'Hệ quả: Lên men chỉ tạo 2 ATP (không đủ năng lượng cho rễ chủ động hút nước và khoáng), đồng thời sản phẩm phụ của lên men (rượu ethanol, axit lactic) tích lũy gây độc tế bào rễ, làm rễ bị thối, không hút được nước khiến cây héo chết.',
      ],
      answer:
        'Ngập úng làm rễ thiếu oxi phải hô hấp kị khí, tích lũy chất độc (ethanol) gây thối rễ và thiếu ATP để hút nước làm cây héo chết.',
    },
    checkQuestions: [
      {
        prompt:
          'Giai đoạn nào của quá trình hô hấp hiếu khí ở thực vật diễn ra ở chất nền của ti thể?',
        choices: [
          { id: 'hh_1', label: 'Chu trình Krebs' },
          { id: 'hh_2', label: 'Đường phân' },
          { id: 'hh_3', label: 'Chuỗi truyền electron hô hấp' },
          { id: 'hh_4', label: 'Quá trình lên men lactic' },
        ],
        answer: { kind: 'choice', correctIds: ['hh_1'] },
        explain:
          'Đường phân diễn ra ở tế bào chất. Chu trình Krebs diễn ra ở chất nền ti thể. Chuỗi truyền electron diễn ra ở màng trong ti thể.',
      },
      {
        prompt:
          'Hiệu suất năng lượng tích lũy được từ quá trình lên men kị khí so với hô hấp hiếu khí từ 1 phân tử glucose là:',
        choices: [
          { id: 'hs_1', label: 'Rất thấp (chỉ bằng khoảng 2/30 đến 2/32 lượng ATP)' },
          { id: 'hs_2', label: 'Tương đương nhau' },
          { id: 'hs_3', label: 'Cao hơn gấp đôi' },
          { id: 'hs_4', label: 'Lên men tạo ra 36 ATP' },
        ],
        answer: { kind: 'choice', correctIds: ['hs_1'] },
        explain:
          'Hô hấp hiếu khí oxy hóa hoàn toàn glucose tạo ra ~30-32 ATP, trong khi lên men kị khí chỉ tạo ra 2 ATP ở giai đoạn đường phân, do đó hiệu suất năng lượng của lên men rất thấp.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết phương trình tổng quát của quá trình hô hấp hiếu khí thực vật?',
        dap: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Năng lượng (ATP + Nhiệt).',
      },
      {
        hoi: 'Bào quan nào đóng vai trò chính trong hô hấp hiếu khí ở thực vật?',
        dap: 'Ti thể (Mitochondria).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b7',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 7,
    title: 'Thực hành: Một số thí nghiệm về hô hấp ở thực vật',
    hook: 'Làm thế nào để chứng minh hạt đang nảy mầm tỏa nhiệt ấm áp, hay chứng tỏ hô hấp hấp thụ khí oxi làm giọt nước màu dịch chuyển?',
    theory:
      'THÍ NGHIỆM CHỨNG MINH HÔ HẤP TỎA NHIỆT:\\n' +
      '— Nguyên tắc: Quá trình hô hấp giải phóng một phần năng lượng dưới dạng nhiệt năng. Hạt nảy mầm có tốc độ hô hấp cực lớn.\\n' +
      '— Tiến trình: Cho hạt đậu xanh đang nảy mầm vào phích nước giữ nhiệt, cắm nhiệt kế vào giữa khối hạt và nút bông kín miệng phích. Bình đối chứng chứa hạt luộc chín để nguội. Theo dõi nhiệt độ sau vài giờ.\\n' +
      '— Kết quả: Bình chứa hạt nảy mầm có nhiệt độ tăng lên rõ rệt (ví dụ từ 28°C lên 38°C); bình đối chứng chứa hạt chín nhiệt độ không đổi.\\n\\n' +
      'THÍ NGHIỆM CHỨNG MINH HÔ HẤP THẢI CO₂:\\n' +
      '— Nguyên tắc: CO₂ tác dụng với nước vôi trong tạo kết tủa trắng CaCO₃ làm đục nước vôi.\\n' +
      '— Tiến trình: Đặt hạt nảy mầm vào bình thủy tinh kín. Sau 2 giờ, dùng hệ thống ống dẫn khí ép không khí từ bình hạt sục qua ống nghiệm đựng nước vôi trong Ca(OH)₂.\\n' +
      '— Kết quả: Nước vôi trong bị vẩn đục trắng nhanh chóng.\\n\\n' +
      'THÍ NGHIỆM ĐO LƯỢNG O₂ TIÊU THỤ CỦA HẠT NẢY MẦM:\\n' +
      '— Nguyên tắc: Hô hấp tiêu thụ O₂ làm thể tích khí trong bình giảm. Cần loại bỏ CO₂ thải ra bằng chất hấp thụ để đo chính xác.\\n' +
      '— Tiến trình: Đặt hạt nảy mầm vào bình thủy tinh nút kín, bên trong bình có treo một cốc nhỏ đựng dung dịch KOH (để hấp thụ CO₂ thải ra). Nút cao su của bình có cắm một ống thủy tinh nằm ngang có chứa một giọt nước màu làm áp kế.\\n' +
      '— Kết quả: Giọt nước màu dịch chuyển dần về phía trong bình, chứng tỏ thể tích khí trong bình giảm do O₂ bị hạt hấp thụ.',
    workedExample: {
      problem:
        'Tại sao trong thí nghiệm đo lượng O2 tiêu thụ của hạt bằng áp kế, ta bắt buộc phải đặt cốc đựng KOH vào trong bình?',
      steps: [
        'Nhận diện các khí thay đổi trong bình do hô hấp: hạt hấp thụ O₂ và đồng thời giải phóng CO₂ theo tỉ lệ gần như 1:1.',
        'Phân tích áp suất khí nếu không có KOH: Thể tích khí O₂ mất đi được thay thế bằng khí CO₂ sinh ra, áp suất và thể tích khí trong bình không thay đổi nhiều, giọt nước màu sẽ không dịch chuyển.',
        'Giải thích vai trò của KOH: Dung dịch KOH phản ứng mạnh hấp thụ hoàn toàn lượng CO₂ sinh ra. Khi đó, sự giảm thể tích khí hoàn toàn là do lượng O₂ bị hạt tiêu thụ, làm áp suất giảm và kéo giọt nước màu di chuyển hướng vào trong bình.',
      ],
      answer:
        'KOH hấp thụ khí CO₂ thải ra, giúp giọt nước màu dịch chuyển chính xác theo thể tích O₂ bị tiêu thụ.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong thí nghiệm chứng minh hô hấp của thực vật thải ra khí CO₂, hóa chất được sử dụng làm chất chỉ thị màu để phát hiện CO₂ là:',
        choices: [
          { id: 'hc_1', label: 'Dung dịch nước vôi trong Ca(OH)₂' },
          { id: 'hc_2', label: 'Dung dịch NaOH đậm đặc' },
          { id: 'hc_3', label: 'Chất chỉ thị phenolphthalein' },
          { id: 'hc_4', label: 'Dung dịch thuốc tím KMnO₄' },
        ],
        answer: { kind: 'choice', correctIds: ['hc_1'] },
        explain:
          'Nước vôi trong phản ứng với khí CO₂ tạo kết tủa CaCO₃ không tan, làm dung dịch chuyển sang màu đục sữa, giúp dễ dàng nhận biết.',
      },
      {
        prompt:
          'Tại sao bình đối chứng trong thí nghiệm đo nhiệt lượng hô hấp phải sử dụng hạt đã luộc chín?',
        choices: [
          { id: 'dc_1', label: 'Để chứng minh rằng tế bào đã chết không còn hô hấp phát nhiệt' },
          { id: 'dc_2', label: 'Để hạt chín hút ẩm tốt hơn hạt sống' },
          { id: 'dc_3', label: 'Để ngăn ngừa hạt chín bị nấm mốc phân hủy' },
          { id: 'dc_4', label: 'Để chứng minh hạt chín tỏa nhiệt mạnh hơn hạt sống' },
        ],
        answer: { kind: 'choice', correctIds: ['dc_1'] },
        explain:
          'Hạt luộc chín làm tế bào chết, enzyme bị biến tính ngưng hoàn toàn hô hấp. Đây là bình đối chứng âm để so sánh với sự tăng nhiệt độ thực tế do hô hấp của hạt sống.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao phải dùng phích nước giữ nhiệt khi làm thí nghiệm chứng minh hô hấp tỏa nhiệt?',
        dap: 'Để ngăn cản nhiệt lượng sinh ra bị thất thoát ra ngoài môi trường, giúp nhiệt kế đo được sự tăng nhiệt độ tích lũy rõ rệt.',
      },
      {
        hoi: 'Hiện tượng gì xảy ra với nước vôi trong khi sục khí từ bình hạt nảy mầm vào?',
        dap: 'Xuất hiện kết tủa trắng làm dung dịch bị vẩn đục do CO₂ + Ca(OH)₂ -> CaCO₃↓ + H₂O.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b8',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 8,
    title: 'Dinh dưỡng và tiêu hóa ở động vật',
    hook: 'Tại sao trâu bò chỉ ăn cỏ khô nghèo dinh dưỡng vẫn phát triển béo tốt, còn con người ăn cỏ thì không thể tiêu hóa được? Bí mật nằm ở cấu trúc dạ dày và vi sinh vật cộng sinh.',
    theory:
      'CÁC HÌNH THỨC TIÊU HÓA Ở ĐỘNG VẬT:\\n' +
      '— Tiêu hóa nội bào (trong tế bào): Thức ăn được bao bọc trong không bào tiêu hóa, nhờ enzyme thủy phân của lysosome phân giải (gặp ở động vật đơn bào như trùng biến hình, trùng đế giày).\\n' +
      '— Tiêu hóa ngoại bào (ngoài tế bào):\\n' +
      '  + Trong túi tiêu hóa: Thức ăn được biến đổi hóa học nhờ enzyme tiết ra từ thành túi tiêu hóa, sau đó hấp thụ chất đơn giản (ở ruột khoang, giun dẹp).\\n' +
      '  + Trong ống tiêu hóa: Thức ăn đi một chiều qua ống (miệng -> thực quản -> dạ dày -> ruột -> hậu môn). Quá trình tiêu hóa cơ học (nhai, bóp) và hóa học (enzyme amylase, pepsin, trypsin...) phân giải thức ăn thành dạng hấp thụ được.\\n\\n' +
      'ĐẶC ĐIỂM TIÊU HÓA Ở THÚ ĂN THỊT VÀ THÚ ĂN THỰC VẬT:\\n' +
      '1. Thú ăn thịt (hổ, sư tử):\\n' +
      '   — Răng: Răng nanh sắc nhọn cắm xé mồi, răng trước hàm và răng hàm có gờ sắc để cắt thịt.\\n' +
      '   — Dạ dày: Dạ dày đơn, to, cơ khỏe. Tiết nhiều HCl và pepsin dịch vị.\\n' +
      '   — Ruột: Ruột non ngắn (do thức ăn giàu dinh dưỡng và dễ tiêu hóa). Manh tràng nhỏ không phát triển.\\n' +
      '2. Thú ăn thực vật (trâu, bò, ngựa, thỏ):\\n' +
      '   — Răng: Răng cửa dẹt để giật cỏ, răng hàm có bề mặt tiếp xúc lớn để nghiền nát cỏ có nhiều chất xơ.\\n' +
      '   — Dạ dày và ruột biệt hóa cao thành hai nhóm:\\n' +
      '     + Nhóm nhai lại (trâu, bò, cừu): Dạ dày 4 ngăn: Dạ cỏ (chứa cỏ, vi sinh vật cộng sinh lên men phân giải xenlulozo) -> Dạ tổ ong (đẩy cỏ ngược lên miệng nhai lại) -> Dạ lá sách (hấp thụ nước) -> Dạ múi khế (dạ dày thực sự, tiết HCl và pepsin tiêu hóa protein thực vật và protein từ chính vi sinh vật trôi xuống).\\n     + Nhóm dạ dày đơn (ngựa, thỏ): Có dạ dày đơn lớn, nhưng manh tràng (ruột tịt) cực kỳ phát triển, là nơi vi sinh vật cộng sinh lên men biến đổi xenlulozo.',
    workedExample: {
      problem:
        'Hãy so sánh sự khác nhau về vị trí biến đổi sinh học xenlulozo nhờ vi sinh vật cộng sinh ở động vật nhai lại (trâu, bò) và động vật ăn thực vật có dạ dày đơn (ngựa, thỏ).',
      steps: [
        'Xác định loài nhai lại: Trâu bò có dạ dày 4 ngăn. Quá trình lên men xenlulozo do vi sinh vật cộng sinh diễn ra ngay tại dạ cỏ (ngăn thứ nhất của dạ dày, ở phần trước ống tiêu hóa).',
        'Xác định loài dạ dày đơn: Ngựa thỏ có dạ dày đơn. Quá trình lên men xenlulozo diễn ra tại manh tràng (nằm ở phần sau của ống tiêu hóa, giáp giữa ruột non và ruột già).',
        'Phân tích hiệu quả: Ở trâu bò, protein vi sinh vật từ dạ cỏ trôi xuống dạ múi khế và ruột non sẽ được tiêu hóa triệt để làm nguồn dinh dưỡng. Ở ngựa thỏ, do manh tràng nằm ở phía sau ruột non nên chúng không hấp thụ được protein vi sinh vật trực tiếp (dẫn đến hành vi ăn lại phân mềm ở thỏ để hấp thụ lại dinh dưỡng).',
      ],
      answer:
        'Trâu bò thực hiện biến đổi sinh học ở dạ cỏ (đầu ống tiêu hóa); ngựa thỏ thực hiện ở manh tràng (cuối ống tiêu hóa).',
    },
    checkQuestions: [
      {
        prompt:
          'Ngăn nào trong dạ dày 4 ngăn của động vật nhai lại (như trâu, bò) được coi là dạ dày thực sự có khả năng tiết dịch vị tiêu hóa?',
        choices: [
          { id: 'dy_1', label: 'Dạ múi khế' },
          { id: 'dy_2', label: 'Dạ cỏ' },
          { id: 'dy_3', label: 'Dạ tổ ong' },
          { id: 'dy_4', label: 'Dạ lá sách' },
        ],
        answer: { kind: 'choice', correctIds: ['dy_1'] },
        explain:
          'Dạ múi khế (ngăn thứ tư) là ngăn duy nhất có các tuyến tiết ra axit HCl và enzym pepsin để thực hiện tiêu hóa hóa học protein giống như dạ dày đơn ở người.',
      },
      {
        prompt: 'Thú ăn thịt có đặc điểm cấu tạo ống tiêu hóa nào sau đây phù hợp với chế độ ăn?',
        choices: [
          { id: 'tt_1', label: 'Ruột non ngắn và dạ dày đơn to' },
          { id: 'tt_2', label: 'Manh tràng rất dài và phát triển' },
          { id: 'tt_3', label: 'Dạ dày cấu tạo gồm 4 ngăn phức tạp' },
          { id: 'tt_4', label: 'Răng hàm có bề mặt nghiền dẹt phẳng' },
        ],
        answer: { kind: 'choice', correctIds: ['tt_1'] },
        explain:
          'Thịt là thức ăn giàu dinh dưỡng và dễ tiêu hóa hóa học nên thú ăn thịt có ruột non ngắn hơn nhiều so với thú ăn thực vật. Dạ dày đơn to giúp chúng chứa được lượng thịt lớn sau mỗi lần săn mồi.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu vai trò của vi sinh vật cộng sinh trong dạ cỏ của bò?',
        dap: 'Tiết enzyme xenlulaza để phân giải xenlulozo trong thành tế bào thực vật thành nguồn đường đơn dễ hấp thụ, đồng thời cung cấp nguồn protein vi sinh vật dồi dào.',
      },
      {
        hoi: 'Động vật đơn bào (như trùng biến hình) tiêu hóa thức ăn bằng hình thức nào?',
        dap: 'Tiêu hóa nội bào bên trong không bào tiêu hóa nhờ enzyme từ bào quan lysosome.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b9',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 9,
    title: 'Hô hấp ở động vật',
    hook: 'Giun đất thở bằng da, châu chấu thở bằng ống khí, cá thở bằng mang, còn chim và thú thở bằng phổi. Sự đa dạng của các cơ quan hô hấp phản ánh sự thích nghi tuyệt vời với môi trường sống.',
    theory:
      'VAI TRÒ CỦA TRAO ĐỔI KHÍ Ở ĐỘNG VẬT:\\n' +
      '— Lấy khí O₂ từ môi trường ngoài cung cấp cho hô hấp tế bào tạo ATP, đồng thời thải khí CO₂ sinh ra từ quá trình dị hóa tế bào ra ngoài.\\n\\n' +
      'CÁC HÌNH THỨC TRAO ĐỔI KHÍ Ở ĐỘNG VẬT:\\n' +
      '1. Qua bề mặt cơ thể:\\n' +
      '   — Đặc điểm: Khí O₂ và CO₂ khuếch tán trực tiếp qua da ẩm ướt.\\n' +
      '   — Đại diện: Giun đất, giun dẹp, thủy tức. Động vật lưỡng cư (ếch) kết hợp da và phổi.\\n' +
      '2. Bằng hệ thống ống khí:\\n' +
      '   — Đặc điểm: Hệ thống ống dẫn khí phân nhánh nhỏ dần đi khắp cơ thể, tiếp xúc trực tiếp đến từng tế bào để trao đổi khí. Không cần hệ tuần hoàn tham gia vận chuyển khí.\\n' +
      '   — Đại diện: Côn trùng (châu chấu, gián, kiến).\\n' +
      '3. Bằng mang:\\n' +
      '   — Đặc điểm: Mang cấu tạo từ các phiến mang mỏng chứa mạng lưới mao mạch dày đặc. Có cơ chế dòng chảy song song ngược chiều (dòng nước chảy qua mang ngược hướng với dòng máu chảy trong mao mạch mang) giúp lấy được khoảng 80% lượng O₂ hòa tan trong nước.\\n' +
      '   — Đại diện: Cá xương, thân mềm (trai, sò), giáp xác (tôm, cua).\\n' +
      '4. Bằng phổi:\\n' +
      '   — Thú: Phổi cấu tạo từ hàng triệu phế nang nhỏ làm tăng diện tích bề mặt trao đổi khí lên cực lớn.\\n' +
      '   — Chim: Có hệ thống phổi kết hợp với 9 túi khí (túi khí trước và sau). Dòng khí đi qua phổi luôn là khí giàu O₂ một chiều cả khi hít vào lẫn thở ra, không có khí cặn. Đây là cơ quan hô hấp trên cạn hiệu quả nhất.',
    workedExample: {
      problem:
        'Giải thích tại sao khi đưa một con cá xương (ví dụ cá chép) lên cạn thì nó sẽ nhanh chóng bị chết ngạt dù hàm lượng O2 trên cạn cao hơn rất nhiều dưới nước.',
      steps: [
        'Xem xét cấu trúc của mang cá dưới nước: Các phiến mang xòe rộng, nổi lơ lửng nhờ lực nâng của nước, diện tích bề mặt trao đổi khí lớn.',
        'Xem xét sự thay đổi khi lên cạn: Khi lên cạn, mất lực nâng của nước làm các phiến mang xẹp xuống, dính chặt vào nhau tạo thành khối có diện tích bề mặt trao đổi khí rất nhỏ.',
        'Xem xét độ ẩm: Da mang bị khô nhanh chóng ngoài không khí, khí O₂ không thể hòa tan và khuếch tán qua màng khô, dẫn đến cá bị ngạt thở và chết.',
      ],
      answer:
        'Lên cạn mất lực nâng của nước làm các phiến mang dính tịt lại với nhau, diện tích bề mặt trao đổi khí giảm mạnh và mang bị khô làm cá chết ngạt.',
    },
    checkQuestions: [
      {
        prompt:
          'Nhóm động vật nào sau đây trao đổi khí trực tiếp qua hệ thống ống khí phân nhánh tiếp xúc trực tiếp đến từng tế bào cơ thể?',
        choices: [
          { id: 'ok_1', label: 'Côn trùng (như châu chấu, ong)' },
          { id: 'ok_2', label: 'Cá xương (như cá chép)' },
          { id: 'ok_3', label: 'Lưỡng cư (như ếch đồng)' },
          { id: 'ok_4', label: 'Chim (như bồ câu)' },
        ],
        answer: { kind: 'choice', correctIds: ['ok_1'] },
        explain:
          'Côn trùng có hệ thống ống khí mở ra các lỗ thở trên thành bụng, dẫn khí trực tiếp tới tận các tế bào mà không cần vận chuyển qua máu.',
      },
      {
        prompt:
          'Hiệu suất trao đổi khí ở cá xương đạt mức cao nhất dưới nước là nhờ đặc điểm nào sau đây?',
        choices: [
          {
            id: 'cx_1',
            label: 'Dòng nước chảy qua mang và dòng máu trong mao mạch mang chảy ngược chiều nhau',
          },
          { id: 'cx_2', label: 'Mang cá có khả năng hấp thụ trực tiếp O₂ từ phân tử nước' },
          { id: 'cx_3', label: 'Diện tích phổi của cá lớn hơn diện tích mang' },
          { id: 'cx_4', label: 'Cá luôn bơi liên tục không bao giờ ngừng lại' },
        ],
        answer: { kind: 'choice', correctIds: ['cx_1'] },
        explain:
          'Cơ chế dòng chảy song song ngược chiều duy trì sự chênh lệch nồng độ O₂ giữa nước và máu trên suốt chiều dài phiến mang, tối ưu hóa việc khuếch tán khí O₂ vào máu.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao chim bồ câu lại có hiệu suất hô hấp trên cạn cao nhất?',
        dap: 'Nhờ hệ thống túi khí giúp cho phổi luôn có dòng khí giàu O₂ đi qua theo một chiều liên tục cả khi hít vào và thở ra, không có khí cặn.',
      },
      {
        hoi: 'Nêu các điều kiện cần thiết để một bề mặt trao đổi khí đạt hiệu quả cao?',
        dap: 'Bề mặt diện tích rộng, mỏng, luôn ẩm ướt, có mạng lưới mao mạch máu phong phú và có sắc tố hô hấp.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b10',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 10,
    title: 'Tuần hoàn ở động vật',
    hook: 'Tim của bạn đập khoảng 100.000 lần mỗi ngày, bơm máu đi qua hệ thống mạch dài gần 100.000 km để nuôi dưỡng từng tế bào trong cơ thể.',
    theory:
      'CÁC DẠNG HỆ TUẦN HOÀN:\\n' +
      '— Hệ tuần hoàn hở (thân mềm, chân khớp): Máu được tim bơm vào động mạch rồi tràn vào khoang cơ thể trộn với dịch mô thành hỗn hợp máu - dịch mô tiếp xúc trực tiếp tế bào, sau đó thu hồi về tim qua tĩnh mạch. Áp lực máu thấp, tốc độ chảy chậm.\\n' +
      '— Hệ tuần hoàn kín (giun đất, bạch tuộc, động vật có xương sống): Máu chảy hoàn toàn trong mạch kín dưới áp lực cao, tốc độ nhanh. Gồm hai dạng:\\n' +
      '  + Tuần hoàn đơn (cá): Tim 2 ngăn (1 tâm nhĩ, 1 tâm thất), máu đi qua tim 1 lần trong mỗi chu kỳ tuần hoàn.\\n  + Tuần hoàn kép (lưỡng cư, bò sát, chim, thú): Tim có 3 hoặc 4 ngăn, máu đi qua tim 2 lần qua hai vòng tuần hoàn (vòng tuần hoàn nhỏ qua phổi, vòng tuần hoàn lớn đi nuôi cơ thể).\\n\\n' +
      'HOẠT ĐỘNG CỦA TIM:\\n' +
      '— Tính tự động của tim: Khả năng co bóp tự động theo chu kỳ nhờ hệ dẫn truyền tim gồm: Nút xoang nhĩ (tự phát xung điện) → Nút nhĩ thất → Bó His → Mạng Purkinje.\\n' +
      '— Chu kỳ hoạt động của tim ở người trưởng thành: Kéo dài khoảng 0.8 giây, gồm 3 pha: Pha co tâm nhĩ (0.1s) → Pha co tâm thất (0.3s) → Pha dãn chung (0.4s). Do thời gian nghỉ (0.4s) bằng thời gian co (0.1s + 0.3s) nên tim hoạt động suốt đời không mỏi.\\n\\n' +
      'HOẠT ĐỘNG CỦA HỆ MẠCH:\\n' +
      '— Huyết áp: Áp lực của máu tác dụng lên thành mạch. Giảm dần trong hệ mạch: Động mạch chủ > Động mạch nhỏ > Mao mạch > Tĩnh mạch > Tĩnh mạch chủ (thấp nhất).\\n' +
      '— Vận tốc máu: Tốc độ máu chảy. Cao nhất ở động mạch lớn, giảm dần đến mao mạch (chậm nhất) rồi tăng dần ở tĩnh mạch. Vận tốc máu tỉ lệ nghịch với tổng diện tích mặt cắt của hệ mạch (tổng diện tích mao mạch lớn nhất nên máu chảy chậm nhất để thực hiện trao đổi chất).',
    workedExample: {
      problem:
        'Hãy giải thích tại sao vận tốc máu lại chảy chậm nhất ở mao mạch và điều này có ý nghĩa sinh học như thế nào đối với cơ thể.',
      steps: [
        'Phân tích mối quan hệ giữa vận tốc máu (v) và tổng diện tích mặt cắt mạch (S): Theo nguyên lý vật lý dòng chảy, v tỉ lệ nghịch với S.',
        'So sánh tổng diện tích mặt cắt: Mặc dù từng mao mạch rất nhỏ, nhưng số lượng mao mạch trong cơ thể cực kỳ khổng lồ, khiến tổng diện tích mặt cắt của hệ mao mạch lớn nhất trong toàn hệ mạch (lớn hơn nhiều so với động mạch và tĩnh mạch).',
        'Giải thích ý nghĩa sinh học: Vận tốc máu ở mao mạch đạt mức thấp nhất (~0.5 mm/s), tạo điều kiện thời gian đủ lâu cho quá trình trao đổi chất (khuếch tán O₂, chất dinh dưỡng từ máu vào tế bào và CO₂, chất thải từ tế bào vào máu) diễn ra hoàn toàn qua thành mao mạch mỏng.',
      ],
      answer:
        'Tổng diện tích mặt cắt mao mạch lớn nhất làm vận tốc máu chậm nhất, tạo điều kiện thuận lợi cho sự trao đổi chất giữa máu và tế bào.',
    },
    checkQuestions: [
      {
        prompt:
          'Hệ dẫn truyền tim hoạt động tự động theo chu kỳ nhờ xung điện bắt đầu phát ra từ bộ phận nào?',
        choices: [
          { id: 'td_1', label: 'Nút xoang nhĩ' },
          { id: 'td_2', label: 'Nút nhĩ thất' },
          { id: 'td_3', label: 'Bó His' },
          { id: 'td_4', label: 'Mạng Purkinje' },
        ],
        answer: { kind: 'choice', correctIds: ['td_1'] },
        explain:
          'Nút xoang nhĩ nằm ở tâm nhĩ phải có khả năng tự phát xung điện theo chu kỳ, lan truyền khắp tâm nhĩ gây co nhĩ và kích hoạt nút nhĩ thất.',
      },
      {
        prompt:
          'Trật tự sắp xếp nào sau đây đúng về sự giảm dần của huyết áp trong hệ mạch ở người?',
        choices: [
          {
            id: 'ha_1',
            label: 'Động mạch chủ -> Động mạch -> Mao mạch -> Tĩnh mạch -> Tĩnh mạch chủ',
          },
          { id: 'ha_2', label: 'Động mạch chủ -> Tĩnh mạch -> Mao mạch -> Tĩnh mạch chủ' },
          { id: 'ha_3', label: 'Mao mạch -> Động mạch -> Tĩnh mạch chủ -> Động mạch chủ' },
          { id: 'ha_4', label: 'Động mạch chủ -> Mao mạch -> Động mạch -> Tĩnh mạch chủ' },
        ],
        answer: { kind: 'choice', correctIds: ['ha_1'] },
        explain:
          'Huyết áp giảm dần dọc theo hệ mạch từ động mạch chủ đến tĩnh mạch chủ do ma sát của máu với thành mạch làm tiêu hao năng lượng áp suất.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phân biệt hệ tuần hoàn hở và hệ tuần hoàn kín?',
        dap: 'Tuần hoàn hở: Máu tràn vào khoang cơ thể trộn lẫn dịch mô tiếp xúc trực tiếp tế bào. Tuần hoàn kín: Máu chảy hoàn toàn trong mạch kín dưới áp lực cao, không trộn lẫn dịch mô.',
      },
      {
        hoi: 'Tại sao tim hoạt động co bóp liên tục suốt đời mà không bị mỏi?',
        dap: 'Vì trong một chu kỳ tim 0.8 giây, tim co mất 0.4 giây và có thời gian dãn chung nghỉ ngơi hoàn toàn là 0.4 giây. Thời gian nghỉ đủ để phục hồi khả năng co bóp.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b11',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 11,
    title: 'Thực hành: Một số thí nghiệm về tuần hoàn ở động vật',
    hook: 'Làm thế nào để đo chỉ số huyết áp của bản thân, tự đếm nhịp tim và quan sát dòng máu chảy trong mao mạch đuôi cá vàng dưới kính hiển vi?',
    theory:
      'ĐO HUYẾT ÁP Ở NGƯỜI:\\n' +
      '— Dụng cụ: Huyết áp kế cơ (hoặc điện tử) và ống nghe y tế.\\n' +
      '— Các bước tiến hành đo bằng huyết áp kế cơ:\\n' +
      '  1. Người được đo nằm hoặc ngồi thoải mái, quấn bao cao su quanh bắp tay phía trên khuỷu tay 2-3 cm. Đặt loa ống nghe lên vị trí động mạch cánh tay.\\n  2. Bơm khí vào bao cao su đến khi đồng hồ chỉ khoảng 160-180 mmHg để ép dừng hoàn toàn dòng máu động mạch.\\n  3. Xả hơi từ từ qua van xả khí. Khi bắt đầu nghe thấy tiếng đập đầu tiên qua ống nghe, ghi lại số chỉ đồng hồ (Huyết áp tâm thu - tối đa).\\n  4. Tiếp tục xả hơi. Khi tiếng đập nhỏ dần rồi biến mất hoàn toàn, ghi lại số chỉ đồng hồ (Huyết áp tâm trương - tối thiểu).\\n  5. Kết quả bình thường ở thanh niên khỏe mạnh là khoảng 120/80 mmHg.\\n\\n' +
      'ĐẾM NHỊP TIM VÀ ĐO NHIỆT ĐỘ CƠ THỂ:\\n' +
      '— Đếm nhịp tim: Dùng ngón trỏ và ngón giữa ấn nhẹ vào động mạch quay ở cổ tay hoặc động mạch cảnh ở cổ để đếm số nhịp mạch đập trong 1 phút.\\n\\n' +
      'QUAN SÁT DÒNG MÁU Ở ĐUÔI CÁ VÀNG DƯỚI KÍNH HIỂN VI:\\n' +
      '— Cách làm: Quấn con cá vàng nhỏ trong bông ẩm để giữ ẩm cho da, chừa phần đuôi. Đặt cá lên đĩa Petri hoặc lam kính lớn, dàn mỏng vây đuôi, nhỏ một giọt nước cất và đặt lamen lên.\\n' +
      '— Quan sát dưới kính hiển vi ở vật kính 10x và 40x:\\n  + Mao mạch: Các mạch máu nhỏ nhất, hồng cầu di chuyển chậm thành một hàng đơn lẻ.\\n  + Động mạch: Máu chảy nhanh từ tim hướng ra đuôi.\\n  + Tĩnh mạch: Máu chảy chậm hơn động mạch, hướng từ đuôi về tim.',
    workedExample: {
      problem:
        'Nêu cách phân biệt động mạch, tĩnh mạch và mao mạch dựa vào tốc độ chảy và chiều chuyển động của hồng cầu khi quan sát vây đuôi cá vàng dưới kính hiển vi.',
      steps: [
        'Quan sát mao mạch: Thấy lòng mạch rất hẹp, chỉ vừa đủ cho các tế bào hồng cầu hình tròn di chuyển xếp hàng một hàng dọc từ từ.',
        'Quan sát động mạch: Thấy đường kính mạch lớn hơn, máu chảy giật cục theo nhịp tim, tốc độ dòng chảy nhanh nhất, chiều di chuyển của hồng cầu hướng từ gốc đuôi ra ngoài rìa vây đuôi.',
        'Quan sát tĩnh mạch: Đường kính tương tự động mạch nhưng dòng máu chảy êm đềm, liên tục, tốc độ chậm hơn động mạch, chiều di chuyển của hồng cầu hướng từ phía rìa vây đuôi trở về phía gốc đuôi (về tim).',
      ],
      answer:
        'Động mạch: máu chảy nhanh hướng ra rìa đuôi; Tĩnh mạch: máu chảy êm hướng về gốc đuôi; Mao mạch: hồng cầu đi hàng một rất chậm.',
    },
    checkQuestions: [
      {
        prompt:
          'Khi sử dụng huyết áp kế cơ để đo huyết áp ở người, thời điểm nghe thấy tiếng đập đầu tiên qua ống nghe tương ứng với:',
        choices: [
          { id: 'ha_1', label: 'Huyết áp tâm thu (tối đa)' },
          { id: 'ha_2', label: 'Huyết áp tâm trương (tối thiểu)' },
          { id: 'ha_3', label: 'Nhịp tim trung bình trong 1 phút' },
          { id: 'ha_4', label: 'Huyết áp trung bình của hệ mạch' },
        ],
        answer: { kind: 'choice', correctIds: ['ha_1'] },
        explain:
          'Khi xả khí, áp lực bao cao su giảm bằng huyết áp tâm thu, dòng máu bắt đầu lách qua chỗ hẹp gây ra tiếng đập đầu tiên nghe thấy được.',
      },
      {
        prompt:
          'Tại sao trong thí nghiệm quan sát dòng máu ở đuôi cá vàng, ta phải bọc thân cá bằng bông ẩm?',
        choices: [
          {
            id: 'ba_1',
            label:
              'Để giữ cho da cá không bị khô, giúp cá hô hấp bằng da trong quá trình thí nghiệm',
          },
          { id: 'ba_2', label: 'Để cá không giãy giụa làm vỡ lam kính' },
          { id: 'ba_3', label: 'Để làm tăng vận tốc máu chảy ở đuôi cá' },
          { id: 'ba_4', label: 'Để cản bớt ánh sáng mạnh chiếu từ kính hiển vi vào thân cá' },
        ],
        answer: { kind: 'choice', correctIds: ['ba_1'] },
        explain:
          'Cá là loài hô hấp bằng mang nhưng cũng trao đổi khí qua bề mặt da ẩm. Việc bọc bông ẩm giúp cá không bị ngạt thở và sống được trong suốt buổi thực hành cạn.',
      },
    ],
    srsCards: [
      {
        hoi: 'Trị số huyết áp 120/80 mmHg có ý nghĩa gì?',
        dap: '120 mmHg là huyết áp tâm thu (áp lực tối đa khi tim co); 80 mmHg là huyết áp tâm trương (áp lực tối thiểu khi tim dãn).',
      },
      {
        hoi: 'Làm thế nào để nhận biết mao mạch dưới kính hiển vi khi soi vây đuôi cá?',
        dap: 'Mạch máu siêu nhỏ, chỉ cho hồng cầu xếp thành một hàng đơn lẻ di chuyển chậm chạp.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh11-c1-b12',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Trao đổi chất và chuyển hoá năng lượng ở sinh vật',
    lessonNumber: 12,
    title: 'Bài tiết và cân bằng nội môi',
    hook: 'Sau khi ăn nhiều đồ ngọt, tại sao lượng đường trong máu của bạn vẫn nhanh chóng trở lại mức ổn định? Đó là nhờ cơ chế cân bằng nội môi kì diệu được điều hòa bởi tuyến tụy, gan và thận.',
    theory:
      'KHÁI NIỆM CÂN BẰNG NỘI MÔI:\\n' +
      '— Cân bằng nội môi (Homeostasis) là sự duy trì ổn định môi trường trong cơ thể (máu, dịch mô, bạch huyết) về các chỉ số lý hóa (pH, áp suất thẩm thấu, nhiệt độ, nồng độ các chất...). Giúp tế bào hoạt động bình thường.\\n\\n' +
      'CƠ CHẾ DUY TRÌ CÂN BẰNG NỘI MÔI:\\n' +
      'Gồm 3 bộ phận chính phối hợp theo vòng liên hệ ngược:\\n' +
      '1. Bộ phận tiếp nhận kích thích (Thụ thể ở da, cơ quan thụ cảm mạch máu...): Tiếp nhận biến động của môi trường trong hoặc ngoài, truyền xung thần kinh về bộ phận điều khiển.\\n' +
      '2. Bộ phận điều khiển (Trung khu thần kinh ở não bộ, hành não hoặc tuyến nội tiết): Xử lý tín hiệu, gửi lệnh đến bộ phận thực hiện.\\n' +
      '3. Bộ phận thực hiện (Thận, gan, phổi, tim, mạch máu...): Biến đổi hoạt động đưa môi trường trong về trạng thái cân bằng ổn định.\\n\\n' +
      'VAI TRÒ CỦA THẬN VÀ GAN TRONG DUY TRÌ ÁP SUẤT THẨM THẤU:\\n' +
      '— Vai trò của Thận: Điều hòa lượng nước và muối khoáng.\\n  + Khi áp suất thẩm thấu tăng (mất nước, ăn mặn): Vùng dưới đồi kích thích thùy sau tuyến yên tiết hormone ADH. ADH kích thích ống thận tăng tái hấp thu nước trả lại máu, làm giảm áp suất thẩm thấu và cô đặc nước tiểu.\\n  + Khi áp suất thẩm thấu giảm (thừa nước): Tuyến yên giảm tiết ADH, thận giảm tái hấp thu nước, thải nước tiểu loãng.\\n— Vai trò của Gan: Điều hòa nồng độ glucose trong máu luôn ở mức ổn định (~0.1%).\\n  + Sau bữa ăn (glucose máu tăng): Tuyến tụy tiết Insulin kích thích gan biến đổi glucose thành glycogen dự trữ và tăng hấp thu glucose vào tế bào.\\n  + Khi đói (glucose máu giảm): Tuyến tụy tiết Glucagon kích thích gan phân giải glycogen thành glucose giải phóng vào máu.\\n\\n' +
      'VAI TRÒ CỦA HỆ ĐỆM DUY TRÌ pH MÁU (ổn định ở mức 7.35 - 7.45):\\n' +
      '— Hệ đệm hóa học: Hấp thu hoặc giải phóng ion H⁺ khi pH môi trường biến động. Gồm 3 hệ đệm chính: Hệ đệm Bicarbonate (H₂CO₃/HCO₃⁻), hệ đệm Phosphate (H₂PO₄⁻/HPO₄²⁻), và hệ đệm Protein (mạnh nhất do cấu trúc lưỡng tính của protein huyết tương).',
    workedExample: {
      problem:
        'Hãy vẽ sơ đồ khối mô tả cơ chế điều hòa nồng độ glucose trong máu sau khi chúng ta ăn một bữa ăn giàu tinh bột.',
      steps: [
        'Kích thích: Ăn nhiều tinh bột -> tiêu hóa thành glucose hấp thụ vào máu -> nồng độ glucose trong máu tăng lên vượt mức bình thường (>0.1%).',
        'Bộ phận tiếp nhận và điều khiển: Tuyến tụy nhận biết sự tăng glucose máu (đồng thời là bộ phận điều khiển) tiết ra hormone Insulin vào máu.',
        'Bộ phận thực hiện: Insulin kích thích tế bào gan chuyển hóa glucose tự do thành glycogen dự trữ (dạng không tan) và kích thích các tế bào cơ thể tăng cường tiêu thụ glucose.',
        'Kết quả: Nồng độ glucose trong máu giảm xuống trở lại mức ổn định bình thường.',
      ],
      answer:
        'Glucose tăng -> Tuyến tụy tiết Insulin -> Gan chuyển glucose thành glycogen & tế bào tăng hấp thu -> Glucose máu trở về bình thường.',
    },
    checkQuestions: [
      {
        prompt:
          'Hormone nào sau đây được thùy sau của tuyến yên tiết ra giúp ống thận tăng cường tái hấp thu nước khi cơ thể bị mất nước?',
        choices: [
          { id: 'hm_1', label: 'ADH (Antidiuretic Hormone / Vasopressin)' },
          { id: 'hm_2', label: 'Insulin' },
          { id: 'hm_3', label: 'Glucagon' },
          { id: 'hm_4', label: 'Aldosterone' },
        ],
        answer: { kind: 'choice', correctIds: ['hm_1'] },
        explain:
          'ADH (hormone chống bài niệu) làm tăng tính thấm của ống lượn xa và ống góp đối với nước, giúp cơ thể giữ nước lại trong máu, tránh mất nước qua nước tiểu.',
      },
      {
        prompt:
          'Trong cơ chế duy trì cân bằng nội môi, bộ phận nào nhận tín hiệu điều khiển và trực tiếp tăng/giảm hoạt động để điều chỉnh chỉ số môi trường trong?',
        choices: [
          { id: 'bp_1', label: 'Bộ phận thực hiện (như gan, thận, phổi)' },
          { id: 'bp_2', label: 'Bộ phận tiếp nhận kích thích (thụ thể)' },
          { id: 'bp_3', label: 'Bộ phận điều khiển (trung ương thần kinh)' },
          { id: 'bp_4', label: 'Feedback loop (liên hệ ngược)' },
        ],
        answer: { kind: 'choice', correctIds: ['bp_1'] },
        explain:
          'Bộ phận thực hiện gồm các cơ quan như gan, thận, phổi, tim... trực tiếp đáp ứng lệnh điều khiển để đưa các thông số sinh lý trở lại trị số bình thường.',
      },
    ],
    srsCards: [
      {
        hoi: 'Cân bằng nội môi là gì?',
        dap: 'Là sự duy trì tính ổn định của môi trường trong cơ thể (áp suất thẩm thấu, pH, nhiệt độ, nồng độ các chất...) để đảm bảo hoạt động sống bình thường của tế bào.',
      },
      {
        hoi: 'Kể tên 3 hệ đệm hóa học chính giúp điều hòa ổn định pH máu ở động vật?',
        dap: 'Hệ đệm Bicarbonate (H₂CO₃/HCO₃⁻), hệ đệm Phosphate (H₂PO₄⁻/HPO₄²⁻) và hệ đệm Protein (Proteinate).',
      },
    ],
    reviewStatus: 'draft',
  },
]
