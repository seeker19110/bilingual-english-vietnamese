// lessons/sinh10c2.ts — Sinh học 10, Chương 2 & 3 (Bài 7-12).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH10_C2_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh10-c3-b7',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Cấu trúc tế bào',
    lessonNumber: 7,
    title: 'Tế bào nhân sơ',
    hook:
      'Hàng tỉ vi khuẩn đang sống trong ruột bạn ngay lúc này, giúp bạn tiêu hoá thức ăn. ' +
      'Chúng thuộc dạng tế bào đơn giản nhất, nhưng cũng có thể làm khổ sở bạn với đủ loại bệnh tật.',
    theory:
      'TẾ BÀO NHÂN SƠ (PROKARYOTIC CELL - NHÂN NGUYÊN SƠ):\\n' +
      '— Định nghĩa: Là loại tế bào chưa có màng nhân (không có nhân thật sự), vật chất di truyền (DNA dạng vòng, không cuộn chặt với protein histone) nằm trực tiếp trong tế bào chất (vùng nhân - nucleoid).\\n' +
      '— Đại diện: Vi khuẩn (Bacteria) và Cổ khuẩn (Archaea).\\n\\n' +
      'CẤU TRÚC TẾ BÀO VI KHUẨN:\\n' +
      '1. Thành tế bào (Cell wall): Cấu tạo từ peptidoglycan. Bảo vệ tế bào, duy trì hình dạng cố định.\\n' +
      '2. Màng sinh chất (Plasma membrane): Lớp kép phospholipid nằm bên trong thành tế bào. Kiểm soát sự trao đổi chất với môi trường.\\n' +
      '3. Tế bào chất (Cytoplasm): Dung dịch nước (cytosol) chứa các phân tử hữu cơ và ribosome. Không có màng bao. Nơi diễn ra các phản ứng trao đổi chất.\\n' +
      '4. Vùng nhân (Nucleoid): Chứa một phân tử DNA vòng kép không gắn với protein histone.\\n' +
      '5. Ribosome: Là bào quan duy nhất của tế bào nhân sơ, nhỏ hơn ribosome tế bào nhân thực (70S so với 80S). Nơi tổng hợp protein.\\n' +
      '— Các cấu trúc phụ của một số vi khuẩn: Lông roi (Flagellum - giúp di chuyển), Lông nhung (Pilus/Fimbria - giúp bám dính), Vỏ nhày (Capsule - bảo vệ chống thực bào), Plasmid (DNA vòng nhỏ ngoài NST).',
    workedExample: {
      problem:
        'So sánh sự khác nhau cơ bản giữa tế bào nhân sơ và tế bào nhân thực về cấu trúc nhân.',
      steps: [
        'Tế bào nhân sơ: Không có màng nhân. Vật chất di truyền (DNA vòng) phân tán trong tế bào chất ở vùng nhân (nucleoid), không có màng bao riêng.',
        'Tế bào nhân thực: Có màng nhân (nuclear envelope) bao bọc rõ ràng, tạo ra khoang nhân (nucleus) tách biệt với tế bào chất.',
        'Kết luận: Sự có hay không có màng nhân là tiêu chí cơ bản nhất để phân biệt tế bào nhân sơ và tế bào nhân thực.',
      ],
      answer:
        'Tế bào nhân sơ không có màng nhân; DNA trần trong vùng nhân (nucleoid). Tế bào nhân thực có màng nhân bao bọc.',
    },
    checkQuestions: [
      {
        prompt: 'Đặc điểm nào sau đây là ĐÚNG đối với tế bào nhân sơ?',
        choices: [
          { id: 'ns_1', label: 'Không có màng nhân bao bọc vật chất di truyền' },
          { id: 'ns_2', label: 'Có nhiều loại bào quan có màng như mitochondria và lục lạp' },
          { id: 'ns_3', label: 'Ribosome có kích thước 80S' },
          { id: 'ns_4', label: 'DNA cuộn chặt với protein histone' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ns_1'],
        },
        explain:
          'Tế bào nhân sơ không có màng nhân - đây là điểm phân biệt cơ bản với tế bào nhân thực. Ribosome của tế bào nhân sơ cũng nhỏ hơn (70S không phải 80S).',
      },
      {
        prompt: 'Bào quan nào sau đây CÓ MẶT trong cả tế bào nhân sơ lẫn tế bào nhân thực?',
        choices: [
          { id: 'bq_1', label: 'Ribosome' },
          { id: 'bq_2', label: 'Ty thể (Mitochondria)' },
          { id: 'bq_3', label: 'Lưới nội chất (Endoplasmic Reticulum)' },
          { id: 'bq_4', label: 'Bộ máy Golgi' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['bq_1'],
        },
        explain:
          'Ribosome là bào quan duy nhất hiện diện trong cả tế bào nhân sơ lẫn nhân thực, vì tất cả tế bào đều cần tổng hợp protein.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đặc điểm cơ bản nhất của tế bào nhân sơ là gì?',
        dap: 'Không có màng nhân. Vật chất di truyền (DNA vòng trần) phân bố trong tế bào chất ở vùng nhân (nucleoid).',
      },
      {
        hoi: 'Thành tế bào vi khuẩn được cấu tạo từ vật liệu gì?',
        dap: 'Peptidoglycan.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c3-b8',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Cấu trúc tế bào',
    lessonNumber: 8,
    title: 'Tế bào nhân thực',
    hook: 'Mỗi tế bào trong cơ thể bạn giống như một siêu đô thị vi mô. Bên trong nó, hàng nghìn bào quan hoạt động 24/7 như các nhà máy, trung tâm điều khiển và nhà kho.',
    theory:
      'TẾ BÀO NHÂN THỰC (EUKARYOTIC CELL):\\n' +
      '— Có nhân thật sự được bao bọc bởi màng nhân.\\n' +
      '— Đại diện: Tế bào động vật, thực vật, nấm, động vật nguyên sinh.\\n\\n' +
      'CÁC BÀO QUAN CHÍNH VÀ CHỨC NĂNG:\\n' +
      '1. Nhân (Nucleus): Chứa DNA và nucleolus. Trung tâm điều khiển mọi hoạt động tế bào, bảo quản thông tin di truyền.\\n' +
      '2. Ty thể (Mitochondria): Có màng kép (outer + inner membrane), có DNA và ribosome riêng. Sản xuất ATP qua hô hấp tế bào (trạm năng lượng tế bào).\\n' +
      '3. Lưới nội chất (Endoplasmic Reticulum - ER):\\n' +
      '   — ER thô (có ribosome bám): Tổng hợp và vận chuyển protein tiết.\\n' +
      '   — ER trơn (không có ribosome): Tổng hợp lipid, chuyển hoá thuốc/độc chất.\\n' +
      '4. Bộ máy Golgi (Golgi apparatus): Phân loại, đóng gói và vận chuyển các phân tử (xuất bào).\\n' +
      '5. Ribosome: Gắn ER thô hoặc tự do trong tế bào chất. Tổng hợp protein.\\n' +
      '6. Lysosome (ở tế bào động vật): Chứa enzyme tiêu hoá nội bào. Tiêu hoá các phân tử lớn, bào quan hỏng.\\n' +
      '7. Không bào (Vacuole): Lớn ở tế bào thực vật (trung tâm không bào - chứa dịch tế bào), nhỏ ở tế bào động vật.\\n' +
      '8. Lục lạp (Chloroplast - chỉ có ở tế bào thực vật và tảo): Có màng kép và DNA riêng. Quang hợp chuyển hoá năng lượng ánh sáng thành năng lượng hoá học.\\n' +
      '9. Thành tế bào (Cell wall - ở tế bào thực vật, nấm): Cấu tạo từ cellulose (thực vật) hoặc chitin (nấm). Bảo vệ và duy trì hình dạng.\\n' +
      '10. Màng sinh chất (Plasma membrane): Bao xung quanh mọi tế bào, kiểm soát sự trao đổi chất.',
    workedExample: {
      problem: 'Tại sao một số nhà khoa học lại gọi ty thể là "trạm điện" của tế bào?',
      steps: [
        'Mô tả cấu trúc ty thể: Có màng kép gồm màng ngoài nhẵn và màng trong gấp nếp thành các mào (cristae). Chứa DNA vòng và ribosome kiểu nhân sơ riêng.',
        'Mô tả chức năng: Ty thể thực hiện quá trình hô hấp hiếu khí (aerobic respiration) bằng cách oxi hoá hoàn toàn glucose thành CO₂ và H₂O, giải phóng phần lớn năng lượng hoá học dưới dạng ATP.',
        'Kết luận: ATP (adenosine triphosphate) là đồng tiền năng lượng phổ quát của tế bào. Ty thể sản xuất ra phần lớn ATP dùng cho mọi hoạt động tế bào, do đó được gọi là "trạm điện" hay "nhà máy năng lượng".',
      ],
      answer:
        'Ty thể thực hiện hô hấp hiếu khí sản xuất ra phần lớn ATP — đồng tiền năng lượng phổ quát của tế bào.',
    },
    checkQuestions: [
      {
        prompt: 'Bào quan nào sau đây CHỈ CÓ ở tế bào thực vật mà không có ở tế bào động vật?',
        choices: [
          { id: 'tv_1', label: 'Lục lạp và thành tế bào cellulose' },
          { id: 'tv_2', label: 'Ribosome và ty thể' },
          { id: 'tv_3', label: 'Bộ máy Golgi và nhân' },
          { id: 'tv_4', label: 'Lysosome và màng sinh chất' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['tv_1'],
        },
        explain:
          'Lục lạp (quang hợp) và thành tế bào cellulose là đặc trưng của tế bào thực vật. Ribosome, ty thể, bộ máy Golgi và nhân đều có ở cả hai.',
      },
      {
        prompt:
          'Bào quan nào sau đây chịu trách nhiệm phân loại và đóng gói các protein để vận chuyển đến đích?',
        choices: [
          { id: 'go_1', label: 'Bộ máy Golgi' },
          { id: 'go_2', label: 'Lưới nội chất thô' },
          { id: 'go_3', label: 'Lysosome' },
          { id: 'go_4', label: 'Không bào' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['go_1'],
        },
        explain:
          'Bộ máy Golgi là trung tâm phân loại và đóng gói protein và lipid, đảm bảo chúng được vận chuyển đến đúng địa điểm cần thiết.',
      },
    ],
    srsCards: [
      {
        hoi: 'Bào quan nào trong tế bào động vật có chức năng tiêu hoá nội bào và loại bỏ bào quan hỏng?',
        dap: 'Lysosome.',
      },
      {
        hoi: 'Nêu điểm khác biệt về cấu trúc của lưới nội chất thô và lưới nội chất trơn?',
        dap: 'ER thô có ribosome bám vào mặt ngoài, ER trơn không có ribosome.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c3-b9',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Cấu trúc tế bào',
    lessonNumber: 9,
    title: 'Thực hành: Quan sát tế bào',
    hook: 'Sử dụng kính hiển vi, chúng ta sẽ thực sự "nhìn thấy" thế giới tế bào mà mắt thường không bao giờ thấy được: hình dạng tế bào biểu bì hành tây và các bào quan của nó.',
    theory:
      'KÍNH HIỂN VI VÀ KĨ THUẬT LÀM TIÊU BẢN TẾ BÀO:\\n' +
      '1. Kính hiển vi quang học (Light microscope): Dùng ánh sáng thông thường và thấu kính để phóng to mẫu. Độ phóng đại tối đa khoảng 1000-2000 lần. Quan sát được hình dạng và một số bào quan lớn.\\n' +
      '2. Kính hiển vi điện tử (Electron microscope): Dùng chùm electron, độ phóng đại lên đến hàng chục nghìn đến vài triệu lần. Quan sát được cấu trúc chi tiết các bào quan và vật thể nano.\\n\\n' +
      'QUY TRÌNH LÀM TIÊU BẢN HIỂN VI:\\n' +
      '1. Chuẩn bị mẫu: Bóc lớp biểu bì mỏng của hành tây.\\n' +
      '2. Đặt mẫu lên lam kính, nhỏ 1-2 giọt dung dịch nước cất lên mẫu.\\n' +
      '3. Đậy lamela (lá kính) nhẹ nhàng, tránh tạo bọt khí.\\n' +
      '4. Nhỏ thuốc nhuộm màu (dung dịch xanh methylene hoặc lugol) vào rìa lamela.\\n' +
      '5. Đặt lên bàn kính và quan sát từ vật kính bé (10x) đến vật kính lớn hơn (40x).',
    workedExample: {
      problem: 'Mô tả quy trình quan sát tế bào biểu bì hành tây qua kính hiển vi quang học.',
      steps: [
        'Bóc một lớp biểu bì mỏng trong suốt từ mặt ngoài vảy hành tây bằng kim mũi giáo và kẹp đầu nhọn.',
        'Đặt nhẹ lớp biểu bì lên giữa lam kính đã được vệ sinh sạch, trải phẳng bằng kim.',
        'Nhỏ vài giọt nước hoặc thuốc nhuộm xanh methylene 0.5%, đậy lamela bằng cách nghiêng một bên rồi hạ từ từ tránh bọt khí.',
        'Quan sát dưới kính hiển vi ở độ phóng đại 10x, sau đó chuyển sang 40x để quan sát rõ hơn.',
      ],
      answer:
        'Bóc biểu bì -> đặt lên lam -> nhuộm màu -> đậy lamela -> quan sát dưới kính từ độ phóng đại thấp lên cao.',
    },
    checkQuestions: [
      {
        prompt:
          'Loại kính hiển vi nào có độ phóng đại cao hơn và cho phép quan sát chi tiết cấu trúc bào quan?',
        choices: [
          { id: 'km_1', label: 'Kính hiển vi điện tử' },
          { id: 'km_2', label: 'Kính hiển vi quang học thông thường' },
          { id: 'km_3', label: 'Kính lúp thực địa' },
          { id: 'km_4', label: 'Kính viễn vọng thiên văn' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['km_1'],
        },
        explain:
          'Kính hiển vi điện tử dùng chùm electron với bước sóng nhỏ hơn nhiều, cho độ phóng đại cao hơn hàng nghìn lần so với kính hiển vi quang học.',
      },
      {
        prompt: 'Khi làm tiêu bản hiển vi, ta nhỏ thuốc nhuộm màu vào rìa lamela với mục đích gì?',
        choices: [
          {
            id: 'nd_1',
            label: 'Để thuốc nhuộm thấm vào mẫu nhờ lực mao dẫn, tăng độ tương phản khi quan sát',
          },
          { id: 'nd_2', label: 'Để bảo quản mẫu tránh hư hỏng' },
          { id: 'nd_3', label: 'Để cố định lamela không bị dịch chuyển' },
          { id: 'nd_4', label: 'Để tạo độ ẩm cho mẫu sinh học' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['nd_1'],
        },
        explain:
          'Thuốc nhuộm màu giúp tăng độ tương phản giữa các cấu trúc tế bào với nền trong suốt, giúp quan sát rõ hơn.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu tên hai loại kính hiển vi chính dùng trong nghiên cứu tế bào?',
        dap: 'Kính hiển vi quang học (dùng ánh sáng) và kính hiển vi điện tử (dùng chùm electron).',
      },
      {
        hoi: 'Tại sao khi đậy lamela phải hạ từ từ từ một bên?',
        dap: 'Để tránh tạo bọt khí trong mẫu, bọt khí sẽ làm biến dạng và khó quan sát tế bào.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c4-b10',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Trao đổi chất qua màng và truyền tin tế bào',
    lessonNumber: 10,
    title: 'Trao đổi chất qua màng tế bào',
    hook:
      'Màng tế bào không phải bức tường cứng mà là cửa kiểm soát năng động, chọn lọc cái gì vào và ra. ' +
      'Mỗi giây, hàng tỉ phân tử và ion đang di chuyển qua lớp màng mỏng chỉ bằng vài nanomét này.',
    theory:
      'MÀNG SINH CHẤT (PLASMA MEMBRANE):\\n' +
      '— Cấu trúc khảm lỏng (Fluid mosaic model): Lớp kép phospholipid (fluidic bilayer) với các protein màng rải rác và di động tự do. Có thể có cholesterol (ở tế bào động vật) để ổn định độ lỏng của màng.\\n\\n' +
      'CÁC CON ĐƯỜNG TRAO ĐỔI CHẤT QUA MÀNG:\\n' +
      '1. Khuếch tán thụ động (Passive transport - không cần năng lượng ATP):\\n' +
      '   — Khuếch tán đơn giản (Simple diffusion): Các phân tử nhỏ không phân cực, không tích điện (O₂, CO₂, N₂, các phân tử kị nước) thấm trực tiếp qua lớp kép phospholipid từ nơi nồng độ cao sang thấp.\\n' +
      '   — Khuếch tán có hỗ trợ (Facilitated diffusion): Các phân tử ưa nước hoặc ion đi qua màng nhờ protein kênh (channel protein) hoặc protein vận chuyển (carrier protein) từ cao xuống thấp.\\n' +
      '   — Thẩm thấu (Osmosis): Sự khuếch tán của nước qua màng bán thấm từ dung dịch nhược trương sang ưu trương.\\n' +
      '2. Vận chuyển chủ động (Active transport - cần năng lượng ATP):\\n' +
      '   — Di chuyển chất từ nơi nồng độ thấp đến cao (ngược gradient) cần protein vận chuyển đặc biệt và ATP.\\n' +
      '   — Ví dụ: Bơm Na⁺-K⁺ trong tế bào thần kinh.\\n' +
      '3. Nhập bào (Endocytosis) và Xuất bào (Exocytosis): Vận chuyển các phân tử lớn bằng túi thực bào hoặc xuất bào.\\n\\n' +
      'HIỆN TƯỢNG CO NGUYÊN SINH VÀ PHẢN CO NGUYÊN SINH:\\n' +
      '— Co nguyên sinh (Plasmolysis): Tế bào thực vật đặt trong dung dịch ưu trương, nước rời khỏi không bào, màng sinh chất tách khỏi thành tế bào.\\n' +
      '— Phản co nguyên sinh: Tế bào đã co nguyên sinh được đặt vào nước hoặc dung dịch nhược trương, nước thấm vào lại.',
    workedExample: {
      problem:
        'Giải thích tại sao rau xà lách bị héo khi muối quá mặn, nhưng có thể hồi phục khi ngâm vào nước lạnh?',
      steps: [
        'Khi rưới muối (hoặc nước muối mặn), tạo ra nồng độ muối bên ngoài cao hơn bên trong tế bào (dung dịch ưu trương bên ngoài).',
        'Theo nguyên lí thẩm thấu, nước từ trong tế bào (nơi nồng độ chất tan thấp hơn) di chuyển ra ngoài, làm tế bào mất nước.',
        'Kết quả: Không bào co lại, tế bào xẹp xuống => rau bị héo (co nguyên sinh).',
        'Khi ngâm vào nước lạnh: Nồng độ nước bên ngoài cao hơn bên trong tế bào, nước thấm ngược vào tế bào (phản co nguyên sinh), tế bào căng lại, rau hồi phục.',
      ],
      answer:
        'Muối tạo dung dịch ưu trương làm nước rời khỏi tế bào (co nguyên sinh). Ngâm nước lạnh làm nước thấm trở lại (phản co nguyên sinh).',
    },
    checkQuestions: [
      {
        prompt: 'Phương thức vận chuyển nào sau đây KHÔNG cần tiêu tốn năng lượng ATP?',
        choices: [
          { id: 'vt_1', label: 'Khuếch tán thụ động' },
          { id: 'vt_2', label: 'Vận chuyển chủ động' },
          { id: 'vt_3', label: 'Nhập bào (Endocytosis)' },
          { id: 'vt_4', label: 'Xuất bào (Exocytosis)' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['vt_1'],
        },
        explain:
          'Khuếch tán thụ động (bao gồm khuếch tán đơn giản, khuếch tán có hỗ trợ và thẩm thấu) di chuyển chất theo chiều gradient nồng độ, không cần tiêu tốn ATP.',
      },
      {
        prompt:
          'Hiện tượng nào xảy ra khi tế bào thực vật được đặt trong dung dịch ưu trương (hypertonic)?',
        choices: [
          { id: 'ut_1', label: 'Co nguyên sinh (Plasmolysis)' },
          { id: 'ut_2', label: 'Phản co nguyên sinh' },
          { id: 'ut_3', label: 'Tế bào bị vỡ do áp suất thẩm thấu' },
          { id: 'ut_4', label: 'Không có hiện tượng gì xảy ra' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ut_1'],
        },
        explain:
          'Trong dung dịch ưu trương, nồng độ chất tan bên ngoài > bên trong, nước thấm ra ngoài, không bào co lại và màng sinh chất tách khỏi thành tế bào (co nguyên sinh).',
      },
    ],
    srsCards: [
      {
        hoi: 'Thẩm thấu là gì?',
        dap: 'Sự khuếch tán của nước qua màng bán thấm từ dung dịch nhược trương (ít chất tan hơn) sang dung dịch ưu trương (nhiều chất tan hơn).',
      },
      {
        hoi: 'Sự khác biệt cơ bản giữa khuếch tán thụ động và vận chuyển chủ động?',
        dap: 'Khuếch tán thụ động theo chiều gradient nồng độ, không cần ATP. Vận chuyển chủ động ngược gradient nồng độ, cần tiêu tốn ATP.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c4-b11',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Trao đổi chất qua màng và truyền tin tế bào',
    lessonNumber: 11,
    title: 'Thực hành: Thí nghiệm co và phản co nguyên sinh',
    hook: 'Trong bài thực hành này, chúng ta sẽ thực sự quan sát bằng mắt qua kính hiển vi tế bào biểu bì hành tây co lại và phục hồi khi thay đổi môi trường lỏng.',
    theory:
      'THIẾT KẾ THÍ NGHIỆM CO VÀ PHẢN CO NGUYÊN SINH:\\n' +
      '1. Quan sát tế bào bình thường: Bóc biểu bì hành tây màu tím (có màu anthocyanin dễ quan sát), làm tiêu bản với nước cất và quan sát hình dạng tế bào.\\n' +
      '2. Gây co nguyên sinh:\\n' +
      '   — Nhỏ dung dịch muối ưu trương (NaCl 10%) vào rìa lamela.\\n' +
      '   — Dùng giấy thấm kéo dung dịch vào.\\n' +
      '   — Quan sát tế bào sau khoảng 5-10 phút: Không bào co lại, nguyên sinh chất (bao gồm màng sinh chất và tế bào chất) co rút và tách khỏi thành tế bào (plasmolysis).\\n' +
      '3. Gây phản co nguyên sinh:\\n' +
      '   — Sau khi quan sát co nguyên sinh, nhỏ nước cất vào rìa lamela, hút dung dịch ưu trương ra.\\n' +
      '   — Quan sát sau 5-10 phút: Nguyên sinh chất phình trở lại và tiếp xúc với thành tế bào (phản co nguyên sinh).',
    workedExample: {
      problem:
        'Giải thích kết quả quan sát thấy khi nhỏ nước cất vào tiêu bản đã đang ở trạng thái co nguyên sinh.',
      steps: [
        'Trạng thái ban đầu: Tế bào đang ở trạng thái co nguyên sinh do nồng độ chất tan bên trong tế bào cao hơn môi trường nước cất.',
        'Nguyên lí thẩm thấu: Nước từ môi trường nhược trương (nước cất) thấm qua màng bán thấm vào bên trong tế bào.',
        'Kết quả quan sát: Không bào của tế bào dần dần phình to trở lại, đẩy màng sinh chất về phía thành tế bào. Tế bào trở lại trạng thái bình thường.',
      ],
      answer:
        'Nước thấm vào tế bào theo thẩm thấu (từ nhược trương sang ưu trương hơn), làm không bào phình to, tế bào hồi phục.',
    },
    checkQuestions: [
      {
        prompt: 'Trong thí nghiệm co nguyên sinh, bộ phận nào của tế bào thực vật co lại đầu tiên?',
        choices: [
          {
            id: 'co_1',
            label: 'Không bào trung tâm co lại, kéo theo màng sinh chất tách khỏi thành tế bào',
          },
          { id: 'co_2', label: 'Thành tế bào cellulose bị vỡ ra' },
          { id: 'co_3', label: 'Nhân tế bào co lại rồi biến mất' },
          { id: 'co_4', label: 'Màng nhân tan chảy' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['co_1'],
        },
        explain:
          'Nước rời khỏi không bào trung tâm làm không bào co lại, kéo theo màng sinh chất tách khỏi thành tế bào. Thành tế bào không bị co vì nó cứng và không co giãn.',
      },
      {
        prompt:
          'Dung dịch nào nên được sử dụng để gây co nguyên sinh cho tế bào thực vật trong thí nghiệm?',
        choices: [
          { id: 'dd_1', label: 'Dung dịch muối ưu trương (ví dụ NaCl 10%)' },
          { id: 'dd_2', label: 'Nước cất hoặc dung dịch nhược trương' },
          { id: 'dd_3', label: 'Dung dịch đẳng trương tương đương nội bào' },
          { id: 'dd_4', label: 'Dung dịch acid HCl loãng' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dd_1'],
        },
        explain:
          'Cần dung dịch ưu trương (nồng độ chất tan cao hơn bên trong tế bào) để nước di chuyển ra khỏi tế bào gây co nguyên sinh.',
      },
    ],
    srsCards: [
      {
        hoi: 'Co nguyên sinh là gì?',
        dap: 'Hiện tượng màng sinh chất tách khỏi thành tế bào khi tế bào thực vật mất nước trong dung dịch ưu trương.',
      },
      {
        hoi: 'Điều kiện để xảy ra phản co nguyên sinh?',
        dap: 'Đặt tế bào đang co nguyên sinh vào nước cất hoặc dung dịch nhược trương để nước thấm trở lại.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c4-b12',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Trao đổi chất qua màng và truyền tin tế bào',
    lessonNumber: 12,
    title: 'Truyền tin tế bào',
    hook:
      'Khi bạn thấy mối nguy hiểm, trong mili giây não bộ đã truyền tín hiệu đến khắp cơ thể và tuyến thượng thận tiết ra adrenalin để chuẩn bị cho "chiến hay chạy". ' +
      'Tế bào giao tiếp với nhau như thế nào?',
    theory:
      'TRUYỀN TIN TẾ BÀO (CELL SIGNALING):\\n' +
      'Gồm 3 giai đoạn chính:\\n' +
      '1. Tiếp nhận (Reception): Phân tử tín hiệu (ligand như hormone, chất dẫn truyền thần kinh) gắn vào protein thụ thể (receptor) đặc hiệu trên màng tế bào đích.\\n' +
      '2. Chuyển đổi tín hiệu (Signal transduction): Liên kết của ligand thay đổi hình dạng thụ thể, khởi động một chuỗi phản ứng phân tử (signaling cascade) bên trong tế bào, khuếch đại tín hiệu.\\n' +
      '3. Đáp ứng (Response): Cuối cùng dẫn đến sự thay đổi hoạt động của tế bào (thay đổi biểu hiện gene, co rút cơ, tiết hormone, phân bào...).\\n\\n' +
      'CÁC LOẠI TÍN HIỆU PHÂN TỬ:\\n' +
      '— Phân tử ưa nước (như phần lớn hormone peptide, adrenaline): Không qua được màng lipid, gắn với thụ thể bề mặt, kích hoạt chuỗi phân tử nội bào.\\n' +
      '— Phân tử kị nước (như hormone steroid, NO, hormone tuyến giáp): Khuếch tán qua màng phospholipid, gắn với thụ thể trong tế bào chất hoặc nhân, trực tiếp thay đổi biểu hiện gene.',
    workedExample: {
      problem: 'Mô tả quá trình truyền tín hiệu khi adrenaline gắn vào thụ thể tế bào cơ tim.',
      steps: [
        'Giai đoạn Tiếp nhận: Phân tử adrenaline (ligand) gắn vào thụ thể beta-adrenergic đặc hiệu trên màng tế bào cơ tim.',
        'Giai đoạn Chuyển đổi: Thụ thể thay đổi hình dạng, hoạt hoá G-protein. G-protein hoạt hoá enzyme adenylyl cyclase, enzyme này xúc tác tổng hợp cAMP (second messenger) từ ATP. cAMP khuếch đại tín hiệu bằng cách hoạt hoá protein kinase A.',
        'Giai đoạn Đáp ứng: Protein kinase A phosphoryl hoá các protein điều tiết tim (ví dụ điều tiết kênh canxi), kết quả là tăng lực co và nhịp tim.',
      ],
      answer:
        'Adrenaline gắn thụ thể bề mặt → G-protein → cAMP (second messenger) → kinase A → tăng lực co và nhịp tim.',
    },
    checkQuestions: [
      {
        prompt: 'Trong quá trình truyền tin tế bào, bước nào diễn ra CUỐI CÙNG?',
        choices: [
          { id: 'tt_1', label: 'Đáp ứng của tế bào (Cellular response)' },
          { id: 'tt_2', label: 'Tiếp nhận tín hiệu (Reception)' },
          { id: 'tt_3', label: 'Chuyển đổi tín hiệu (Signal transduction)' },
          { id: 'tt_4', label: 'Giải phóng phân tử tín hiệu' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['tt_1'],
        },
        explain:
          'Ba giai đoạn của truyền tin tế bào theo thứ tự: Tiếp nhận -> Chuyển đổi -> Đáp ứng.',
      },
      {
        prompt: 'Hormone steroid (ví dụ testosterone) có thể gắn với thụ thể ở đâu và điều hoà gì?',
        choices: [
          {
            id: 'st_1',
            label: 'Gắn với thụ thể trong tế bào chất hoặc nhân, trực tiếp điều hoà biểu hiện gene',
          },
          { id: 'st_2', label: 'Gắn với thụ thể trên màng tế bào, kích hoạt cAMP' },
          { id: 'st_3', label: 'Gắn với thụ thể ngoài tế bào, không vào được tế bào' },
          { id: 'st_4', label: 'Không có thụ thể đặc hiệu, lan toả tự do' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['st_1'],
        },
        explain:
          'Hormone steroid là phân tử kị nước, dễ dàng khuếch tán qua màng sinh chất vào tế bào chất hoặc nhân, gắn với thụ thể ở đó và ảnh hưởng trực tiếp đến biểu hiện gene.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu 3 giai đoạn của quá trình truyền tin tế bào theo đúng thứ tự?',
        dap: 'Tiếp nhận (Reception) -> Chuyển đổi (Signal transduction) -> Đáp ứng (Response).',
      },
      {
        hoi: 'Tại sao phân tử tín hiệu ưa nước không thể tự khuếch tán qua màng tế bào?',
        dap: 'Vì lõi kị nước của lớp kép phospholipid ngăn cản các phân tử phân cực hoặc ion đi qua.',
      },
    ],
    reviewStatus: 'draft',
  },
]
