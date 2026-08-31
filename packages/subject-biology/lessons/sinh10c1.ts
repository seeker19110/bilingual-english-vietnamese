// lessons/sinh10c1.ts — Sinh học 10, Phần mở đầu & Chương 1 (Bài 1-6).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH10_C1_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh10-c1-b1',
    grade: '10',
    chapterNumber: 1,
    chapterTitle: 'Phần mở đầu',
    lessonNumber: 1,
    title: 'Giới thiệu khái quát môn Sinh học',
    hook: 'Từ thức ăn chúng ta ăn hằng ngày, các loại thuốc chữa bệnh, cho đến việc hiểu chính cơ thể mình, Sinh học là môn khoa học về sự sống.',
    theory:
      'KHÁI NIỆM VÀ ĐỐI TƯỢNG CỦA SINH HỌC:\\n' +
      '— Sinh học (Biology) là môn khoa học nghiên cứu về sự sống, cụ thể là các sinh vật và mối quan hệ giữa chúng với nhau cũng như với môi trường.\\n' +
      '— Đối tượng nghiên cứu: Các sinh vật sống (thực vật, động vật, nấm, vi sinh vật) và các cấp độ tổ chức sống từ phân tử đến sinh quyển.\\n\\n' +
      'CÁC PHÂN NGÀNH VÀ LĨNH VỰC NGHIÊN CỨU CHÍNH:\\n' +
      '— Thực vật học (Botany), Động vật học (Zoology), Vi sinh vật học (Microbiology), Di truyền học (Genetics), Sinh học tế bào (Cell Biology), Sinh học phân tử (Molecular Biology), Sinh thái học (Ecology).\\n\\n' +
      'VAI TRÒ CỦA SINH HỌC TRONG CUỘC SỐNG:\\n' +
      '— Y học: Sản xuất thuốc, vaccine, liệu pháp gene, chẩn đoán bệnh.\\n' +
      '— Nông nghiệp: Tạo giống cây trồng vật nuôi năng suất cao, kháng bệnh.\\n' +
      '— Công nghệ thực phẩm: Lên men sữa chua, bia, rượu, bảo quản thực phẩm.\\n' +
      '— Bảo vệ môi trường: Xử lí ô nhiễm sinh học (bioremediation), bảo tồn đa dạng sinh học.\\n\\n' +
      'PHÁT TRIỂN BỀN VỮNG VÀ ĐẠO ĐỨC SINH HỌC:\\n' +
      '— Phát triển bền vững là sự phát triển nhằm thoả mãn nhu cầu của thế hệ hiện tại mà không làm tổn hại đến khả năng thoả mãn nhu cầu của các thế hệ tương lai. Sinh học đóng góp bằng cách bảo tồn tài nguyên, năng lượng sạch và đa dạng sinh học.\\n' +
      '— Đạo đức sinh học (Bioethics) là những nguyên tắc, chuẩn mực đạo đức áp dụng trong các nghiên cứu và ứng dụng sinh học (ví dụ: nhân bản vô tính người, chỉnh sửa gene phôi thai).',
    workedExample: {
      problem:
        'Trình bày vai trò của Sinh học trong việc bảo vệ môi trường và phát triển bền vững.',
      steps: [
        'Nhận diện các thách thức môi trường hiện nay: ô nhiễm nước, đất, rác thải nhựa, biến đổi khí hậu.',
        'Trình bày giải pháp sinh học: Sử dụng vi sinh vật phân huỷ chất độc hại, ứng dụng thực vật hấp thụ kim loại nặng trong đất.',
        'Liên hệ với phát triển bền vững: Bảo tồn các hệ sinh thái rừng, biển giúp duy trì sự cân bằng carbon, bảo vệ đa dạng sinh học cho thế hệ tương lai.',
      ],
      answer:
        'Sinh học cung cấp giải pháp xử lí ô nhiễm bằng tác nhân sinh học, bảo tồn đa dạng sinh học và tài nguyên thiên nhiên.',
    },
    checkQuestions: [
      {
        prompt:
          'Phân ngành nào của Sinh học nghiên cứu về mối quan hệ giữa sinh vật với môi trường sống của chúng?',
        choices: [
          { id: 'da_1', label: 'Sinh thái học' },
          { id: 'da_2', label: 'Di truyền học' },
          { id: 'da_3', label: 'Vi sinh vật học' },
          { id: 'da_4', label: 'Sinh học tế bào' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['da_1'],
        },
        explain:
          'Sinh thái học (Ecology) nghiên cứu về mối quan hệ giữa các sinh vật với nhau và với môi trường sống.',
      },
      {
        prompt:
          'Sự phát triển đáp ứng nhu cầu của thế hệ hiện tại mà không làm tổn hại đến khả năng đáp ứng nhu cầu của các thế hệ tương lai được gọi là:',
        choices: [
          { id: 'bn_1', label: 'Phát triển bền vững' },
          { id: 'bn_2', label: 'Tăng trưởng kinh tế nóng' },
          { id: 'bn_3', label: 'Công nghiệp hoá hiện đại hoá' },
          { id: 'bn_4', label: 'Đô thị hoá tự phát' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['bn_1'],
        },
        explain: 'Đây là định nghĩa chuẩn về phát triển bền vững (Sustainable Development).',
      },
    ],
    srsCards: [
      {
        hoi: 'Đối tượng nghiên cứu của Sinh học là gì?',
        dap: 'Các sinh vật sống và các cấp độ tổ chức của thế giới sống.',
      },
      {
        hoi: 'Đạo đức sinh học (Bioethics) là gì?',
        dap: 'Là những nguyên tắc, chuẩn mực đạo đức áp dụng trong các nghiên cứu và ứng dụng sinh học.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c1-b2',
    grade: '10',
    chapterNumber: 1,
    chapterTitle: 'Phần mở đầu',
    lessonNumber: 2,
    title: 'Phương pháp nghiên cứu và học tập môn Sinh học',
    hook:
      'Làm thế nào các nhà khoa học tìm ra vaccine phòng ngừa dịch bệnh hay giải mã được bộ gene người? ' +
      'Họ đều sử dụng một quy trình nghiên cứu khoa học nghiêm ngặt.',
    theory:
      'CÁC PHƯƠNG PHÁP NGHIÊN CỨU VÀ HỌC TẬP SINH HỌC:\\n' +
      '1. Phương pháp quan sát: Sử dụng các giác quan hoặc dụng cụ hỗ trợ (kính hiển vi, kính lúp) để thu thập thông tin về hình thái, hành vi sinh vật.\\n' +
      '2. Phương pháp làm việc phòng thí nghiệm: Thực hiện các phản ứng hoá sinh, nuôi cấy vi sinh vật, quan sát lát cắt tế bào trong môi trường kiểm soát.\\n' +
      '3. Phương pháp thực nghiệm khoa học: Thiết kế và tiến hành thí nghiệm so sánh giữa lô đối chứng (control) và lô thí nghiệm để kiểm chứng giả thuyết.\\n\\n' +
      'TIẾN TRÌNH NGHIÊN CỨU KHOA HỌC (SCIENTIFIC METHOD):\\n' +
      '— Bước 1: Quan sát và đặt câu hỏi nghiên cứu.\\n' +
      '— Bước 2: Xây dựng giả thuyết khoa học (một lời giải thích có thể kiểm chứng).\\n' +
      '— Bước 3: Thiết kế và tiến hành thí nghiệm để kiểm chứng.\\n' +
      '— Bước 4: Thu thập số liệu, phân tích kết quả và thảo luận.\\n' +
      '— Bước 5: Báo cáo kết quả nghiên cứu và rút ra kết luận.\\n\\n' +
      'CÁC THIẾT BỊ VÀ AN TOÀN TRONG PHÒNG THÍ NGHIỆM:\\n' +
      '— Kính hiển vi quang học, máy li tâm, micropipette, tủ cấy vô trùng.\\n' +
      '— Quy tắc an toàn: Mặc áo bảo hộ (lab coat), đeo găng tay và kính bảo hộ; không ăn uống trong phòng thí nghiệm; tuân thủ quy trình xử lí hoá chất và sinh phẩm thải bỏ.',
    workedExample: {
      problem:
        'Nêu các bước trong tiến trình nghiên cứu ảnh hưởng của ánh sáng đến sự nảy mầm của hạt đậu.',
      steps: [
        'Bước 1: Quan sát thấy hạt đậu ở chỗ sáng nảy mầm khác chỗ tối. Đặt câu hỏi: Ánh sáng có ảnh hưởng đến tỉ lệ nảy mầm không?',
        'Bước 2: Đưa ra giả thuyết: Ánh sáng không ảnh hưởng đến tỉ lệ nảy mầm của hạt đậu (hoặc ngược lại).',
        'Bước 3: Thiết kế thí nghiệm: Chia hạt đậu làm 2 lô (Lô thí nghiệm: đặt ngoài sáng; Lô đối chứng: đặt trong bóng tối). Giữ nguyên các yếu tố khác như nước, nhiệt độ.',
        'Bước 4: Theo dõi sau 3 ngày, đếm số hạt nảy mầm ở cả hai lô và tính tỉ lệ phần trăm.',
        'Bước 5: Rút ra kết luận và viết báo cáo.',
      ],
      answer:
        'Tiến trình gồm: Đặt câu hỏi -> Giả thuyết -> Thí nghiệm kiểm chứng -> Phân tích kết quả -> Kết luận.',
    },
    checkQuestions: [
      {
        prompt: 'Giả thuyết khoa học được định nghĩa là:',
        choices: [
          {
            id: 'gt_1',
            label: 'Một câu trả lời giả định, có thể kiểm chứng được bằng thực nghiệm',
          },
          { id: 'gt_2', label: 'Một sự thật hiển nhiên không cần chứng minh' },
          { id: 'gt_3', label: 'Một kết luận chắc chắn sau khi hoàn thành thí nghiệm' },
          { id: 'gt_4', label: 'Một phương pháp quan sát sinh vật trong tự nhiên' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['gt_1'],
        },
        explain:
          'Giả thuyết khoa học phải là một câu trả lời giả định có khả năng kiểm chứng bằng thực nghiệm hoặc quan sát bổ sung.',
      },
      {
        prompt:
          'Để loại bỏ yếu tố ngẫu nhiên và khẳng định sự khác biệt là do nhân tố thí nghiệm tác động, các thí nghiệm sinh học luôn cần có:',
        choices: [
          { id: 'dc_1', label: 'Lô đối chứng (Control)' },
          { id: 'dc_2', label: 'Nhiều loại hoá chất khác nhau' },
          { id: 'dc_3', label: 'Kính hiển vi điện tử độ phân giải cao' },
          { id: 'dc_4', label: 'Sự giám sát của nhiều nhà khoa học' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dc_1'],
        },
        explain:
          'Lô đối chứng (control group) giúp so sánh và khẳng định kết quả thí nghiệm thực sự do biến độc lập gây ra.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phương pháp thực nghiệm khoa học có điểm gì khác phương pháp quan sát thông thường?',
        dap: 'Thực nghiệm chủ động tác động và kiểm soát các biến số (có lô thí nghiệm và lô đối chứng), còn quan sát chỉ ghi nhận hiện tượng tự nhiên.',
      },
      {
        hoi: 'Bước đầu tiên trong tiến trình nghiên cứu khoa học là gì?',
        dap: 'Quan sát và đặt câu hỏi nghiên cứu.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c1-b3',
    grade: '10',
    chapterNumber: 1,
    chapterTitle: 'Phần mở đầu',
    lessonNumber: 3,
    title: 'Các cấp độ tổ chức của thế giới sống',
    hook:
      'Cơ thể chúng ta được cấu tạo từ hàng nghìn tỉ tế bào liên kết chặt chẽ. ' +
      'Các tế bào lại được cấu tạo từ các bào quan, phân tử và nguyên tử. Hãy cùng tìm hiểu cấu trúc phân tầng kì diệu của sự sống.',
    theory:
      'KHÁI NIỆM CẤP ĐỘ TỔ CHỨC SỐNG:\\n' +
      '— Cấp độ tổ chức sống là vị trí phân cấp của các hệ thống sống từ nhỏ đến lớn trong thế giới sống.\\n\\n' +
      'SƠ ĐỒ CÁC CẤP ĐỘ TỔ CHỨC SỐNG:\\n' +
      '— Nguyên tử -> Phân tử -> Bào quan -> Tế bào -> Mô -> Cơ quan -> Hệ cơ quan -> Cơ thể -> Quần thể -> Quần xã -> Hệ sinh thái -> Sinh quyển.\\n' +
      '— Các cấp độ tổ chức sống cơ bản (có thể hoạt động độc lập và thể hiện đầy đủ đặc tính của sự sống):\\n' +
      '  1. Tế bào (Cell - cấp độ tổ chức cơ bản nhất).\\n' +
      '  2. Cơ thể (Organism).\\n' +
      '  3. Quần thể (Population).\\n' +
      '  4. Quần xã (Community).\\n' +
      '  5. Hệ sinh thái (Ecosystem).\\n\\n' +
      'ĐẶC ĐIỂM CHUNG CỦA CÁC CẤP ĐỘ TỔ CHỨC SỐNG:\\n' +
      '1. Tổ chức theo nguyên tắc thứ bậc (Hierarchical organization): Cấp dưới làm nền tảng xây dựng nên cấp trên. Cấp trên có những **đặc tính nổi trội** (emergent properties) mà cấp dưới không có.\\n' +
      '2. Hệ thống mở và tự điều chỉnh (Open and self-regulating system): Thường xuyên trao đổi vật chất và năng lượng với môi trường; có khả năng tự điều chỉnh để duy trì trạng thái cân bằng động (homeostasis).\\n' +
      '3. Liên tục tiến hoá: Mọi sinh vật đều có chung nguồn gốc nhưng không ngừng tiến hoá để thích nghi với môi trường sống.',
    workedExample: {
      problem: 'Thế nào là đặc tính nổi trội của thế giới sống? Cho ví dụ minh hoạ.',
      steps: [
        'Định nghĩa đặc tính nổi trội: Là đặc tính xuất hiện ở cấp độ tổ chức cao hơn nhờ sự tương tác của các bộ phận cấu thành ở cấp độ thấp hơn.',
        'Ví dụ ở cấp độ tế bào: Tế bào thần kinh đơn lẻ chỉ truyền xung thần kinh, nhưng hàng tỉ tế bào thần kinh liên kết tạo nên bộ não có khả năng tư duy, ghi nhớ, cảm xúc.',
        'Ví dụ ở cấp độ cơ thể: Các cơ quan tiêu hoá riêng lẻ không tự nuôi sống sinh vật, nhưng kết hợp lại tạo thành hệ tiêu hoá và cơ thể hoạt động sống hoàn chỉnh.',
      ],
      answer:
        'Đặc tính nổi trội là đặc tính mới xuất hiện ở cấp độ cao hơn nhờ sự tương tác của các thành phần ở cấp độ thấp hơn.',
    },
    checkQuestions: [
      {
        prompt: 'Cấp độ tổ chức sống nào sau đây là cấp độ tổ chức cơ bản nhất của thế giới sống?',
        choices: [
          { id: 'cd_1', label: 'Tế bào' },
          { id: 'cd_2', label: 'Cơ quan' },
          { id: 'cd_3', label: 'Cơ thể' },
          { id: 'cd_4', label: 'Phân tử' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cd_1'],
        },
        explain:
          'Tế bào là đơn vị cấu trúc và chức năng cơ bản nhất của mọi sinh vật sống. Mọi hoạt động sống đều diễn ra ở cấp độ tế bào.',
      },
      {
        prompt: 'Đặc tính nào sau đây KHÔNG phải là đặc điểm chung của các cấp độ tổ chức sống?',
        choices: [
          {
            id: 'dd_1',
            label: 'Là hệ thống kín, không trao đổi vật chất với môi trường bên ngoài',
          },
          { id: 'dd_2', label: 'Tổ chức theo nguyên tắc thứ bậc' },
          { id: 'dd_3', label: 'Hệ thống mở và tự điều chỉnh' },
          { id: 'dd_4', label: 'Liên tục tiến hoá' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dd_1'],
        },
        explain:
          'Các cấp độ tổ chức sống là những hệ thống mở (open systems), liên tục trao đổi chất và năng lượng với môi trường.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu 5 cấp độ tổ chức sống cơ bản?',
        dap: 'Tế bào, cơ thể, quần thể, quần xã, hệ sinh thái.',
      },
      {
        hoi: 'Giải thích nguyên tắc thứ bậc trong thế giới sống?',
        dap: 'Là nguyên tắc tổ chức từ thấp đến cao, trong đó tổ chức cấp dưới làm nền tảng cấu tạo nên tổ chức cấp trên.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c2-b4',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Thành phần hoá học của tế bào',
    lessonNumber: 4,
    title: 'Các nguyên tố hoá học và nước',
    hook:
      'Hơn 70% khối lượng cơ thể chúng ta là nước, và phần còn lại chủ yếu là các nguyên tố Carbon, Hydrogen, Oxygen, Nitrogen. ' +
      'Tại sao những nguyên tố này lại quan trọng đến thế?',
    theory:
      'CÁC NGUYÊN TỐ HOÁ HỌC TRONG TẾ BÀO:\\n' +
      'Trong khoảng 25 nguyên tố cấu tạo nên sự sống, chúng được chia làm 2 nhóm chính:\\n' +
      '1. Nguyên tố đa lượng (Macroelements): Chiếm tỉ lệ lớn (>= 0,01% khối lượng khô cơ thể). Ví dụ: C, H, O, N, P, S, Ca, K...\\n' +
      '   — Vai trò: Cấu tạo nên các đại phân tử sinh học (carbohydrate, lipid, protein, nucleic acid), cấu trúc nên tế bào và bào quan.\\n' +
      '   — Carbon (C) là nguyên tố quan trọng nhất vì có 4 electron hoá trị, dễ dàng hình thành liên kết cộng hoá trị bền vững với các nguyên tố khác, tạo nên mạch carbon vô cùng đa dạng.\\n' +
      '2. Nguyên tố vi lượng (Microelements): Chiếm tỉ lệ nhỏ (< 0,01% khối lượng khô cơ thể). Ví dụ: Fe, Cu, Zn, Mn, I, F...\\n' +
      '   — Vai trò: Tham gia cấu tạo enzyme hoạt hoá, hormone, sắc tố (ví dụ: Fe cấu tạo hồng cầu, I cấu tạo hormone tuyến giáp).\\n\\n' +
      'NƯỚC VÀ VAI TRÒ CỦA NƯỚC ĐỐI VỚI TẾ BÀO:\\n' +
      '— Cấu trúc phân cực: Nguyên tử Oxygen có độ âm điện lớn hơn nguyên tử Hydrogen, hút electron lệch về phía mình, làm đầu Oxygen mang điện tích âm nhẹ, đầu Hydrogen mang điện tích dương nhẹ.\\n' +
      '— Liên kết hydrogen: Nhờ tính phân cực, các phân tử nước hút nhau tạo thành các liên kết hydrogen linh động.\\n' +
      '— Vai trò của nước:\\n' +
      '  + Là dung môi hoà tan nhiều chất cần thiết cho tế bào.\\n' +
      '  + Là môi trường diễn ra và trực tiếp tham gia các phản ứng hoá sinh.\\n' +
      '  + Tham gia điều hoà nhiệt độ cơ thể nhờ nhiệt bay hơi và nhiệt dung riêng lớn.',
    workedExample: {
      problem:
        'Tại sao khi ta làm lạnh nước dưới 0 °C, nước đá lại nổi lên trên mặt nước lỏng? Điều này có ý nghĩa gì đối với sinh vật?',
      steps: [
        'Mô tả cấu trúc nước đá: Khi nhiệt độ giảm dưới 4 °C, các liên kết hydrogen giữa các phân tử nước trở nên cố định và giữ khoảng cách xa nhau, tạo cấu trúc mạng lưới tinh thể rỗng làm mật độ phân tử giảm.',
        'Kết luận về khối lượng riêng: Khối lượng riêng của nước đá nhỏ hơn nước lỏng, khiến nước đá nổi lên.',
        'Ý nghĩa sinh thái: Vào mùa đông ở vùng cực, lớp băng nổi lên trên mặt hồ tạo thành một tấm cách nhiệt ngăn nước bên dưới tiếp tục đóng băng, bảo vệ các sinh vật thuỷ sinh sống dưới nước.',
      ],
      answer:
        'Nước đá nổi do có cấu trúc tinh thể rỗng làm khối lượng riêng nhỏ hơn nước lỏng, giúp giữ ấm cho sinh vật dưới nước vào mùa đông.',
    },
    checkQuestions: [
      {
        prompt:
          'Nguyên tố hoá học nào sau đây được coi là cốt lõi cấu tạo nên mọi hợp chất hữu cơ trong tế bào?',
        choices: [
          { id: 'el_1', label: 'Carbon (C)' },
          { id: 'el_2', label: 'Oxygen (O)' },
          { id: 'el_3', label: 'Nitrogen (N)' },
          { id: 'el_4', label: 'Hydrogen (H)' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['el_1'],
        },
        explain:
          'Carbon có 4 electron hoá trị, có khả năng hình thành các mạch carbon thẳng, nhánh hoặc vòng, liên kết với nhiều nguyên tố tạo nên sự đa dạng của chất hữu cơ.',
      },
      {
        prompt: 'Các phân tử nước liên kết với nhau chủ yếu bằng liên kết nào sau đây?',
        choices: [
          { id: 'lk_1', label: 'Liên kết hydrogen' },
          { id: 'lk_2', label: 'Liên kết cộng hoá trị không phân cực' },
          { id: 'lk_3', label: 'Liên kết ion' },
          { id: 'lk_4', label: 'Liên kết peptide' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['lk_1'],
        },
        explain:
          'Nhờ tính phân cực, nguyên tử H mang điện dương nhẹ của phân tử nước này hút nguyên tử O mang điện âm nhẹ của phân tử nước kia tạo liên kết hydrogen.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phân biệt nguyên tố đa lượng và vi lượng dựa trên tỉ lệ khối lượng?',
        dap: 'Đa lượng chiếm >= 0,01% khối lượng khô; vi lượng chiếm < 0,01% khối lượng khô cơ thể.',
      },
      {
        hoi: 'Tại sao nước có tính chất phân cực?',
        dap: 'Vì nguyên tử Oxygen có độ âm điện lớn hơn Hydrogen, hút cặp electron dùng chung lệch về phía mình.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c2-b5',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Thành phần hoá học của tế bào',
    lessonNumber: 5,
    title: 'Các phân tử sinh học',
    hook:
      'Carbohydrate, lipid, protein, nucleic acid là những khối lắp ghép tạo nên sự sống. ' +
      'Mỗi nhóm chất thực hiện những nhiệm vụ độc đáo và tối quan trọng trong từng tế bào.',
    theory:
      'CÁC PHÂN TỬ SINH HỌC CHÍNH TRONG TẾ BÀO:\\n' +
      'Có 4 nhóm đại phân tử hữu cơ cấu tạo nên tế bào:\\n' +
      '1. Carbohydrate (Đường / Saccarit): Cấu tạo từ C, H, O theo tỉ lệ khoảng 1:2:1.\\n' +
      '   — Đường đơn (Monosaccharide): Glucose, Fructose, Galactose. Dùng làm nguồn năng lượng tức thời.\\n' +
      '   — Đường đôi (Disaccharide): Sucrose, Lactose, Maltose. Dùng làm đường vận chuyển.\\n' +
      '   — Đường đa (Polysaccharide): Tinh bột (dự trữ ở thực vật), Glycogen (dự trữ ở động vật), Cellulose (cấu tạo thành tế bào thực vật), Chitin (thành tế bào nấm, vỏ giáp xác).\\n' +
      '2. Lipid (Chất béo): Không tan trong nước (kị nước), cấu tạo chủ yếu từ C, H, O.\\n' +
      '   — Triglyceride (mỡ và dầu): Cấu tạo từ 1 glycerol và 3 acid béo. Dự trữ năng lượng lâu dài.\\n' +
      '   — Phospholipid: Cấu tạo từ 1 glycerol liên kết với 2 acid béo kị nước và 1 nhóm phosphate ưa nước. Là thành phần chính cấu tạo nên màng sinh chất.\\n' +
      '   — Steroid (ví dụ cholesterol, estrogen, testosterone): Điều hoà sinh lí, làm vững màng sinh chất.\\n' +
      '3. Protein (Chất đạm): Đại phân tử cấu tạo theo nguyên tắc đa phân, monomer là **amino acid** (có khoảng 20 loại khác nhau).\\n' +
      '   — Có 4 bậc cấu trúc: Bậc 1 (chuỗi polypeptide thẳng), Bậc 2 (xoắn alpha hoặc nếp gấp beta), Bậc 3 (cấu trúc không gian 3 chiều đặc trưng), Bậc 4 (sự liên kết của nhiều chuỗi polypeptide).\\n' +
      '   — Chức năng: Xúc tác (enzyme), cấu trúc (collagen, keratin), vận chuyển (hemoglobin), bảo vệ (kháng thể), truyền tín hiệu (hormone).\\n' +
      '4. Nucleic acid: Gồm DNA (A, T, G, C - mạch kép xoắn, lưu trữ thông tin di truyền) và RNA (A, U, G, C - mạch đơn, truyền đạt thông tin di truyền và dịch mã). Cấu tạo từ các monomer là **nucleotide**.',
    workedExample: {
      problem: 'Nêu sự khác biệt cơ bản giữa cấu trúc và chức năng của DNA và RNA.',
      steps: [
        'Về số mạch: DNA cấu tạo từ 2 mạch polynucleotide xoắn kép, ngược chiều nhau. RNA chỉ gồm 1 mạch polynucleotide.',
        'Về loại đường và base: Đường của DNA là deoxyribose, base chứa T (Thymine). Đường của RNA là ribose, base chứa U (Uracil) thay cho T.',
        'Về chức năng: DNA có tính bền vững cao, lưu trữ bảo quản thông tin di truyền. RNA linh động hơn, tham gia truyền đạt thông tin di truyền và dịch mã tổng hợp protein.',
      ],
      answer:
        'DNA mạch kép, chứa đường deoxyribose và base T; RNA mạch đơn, chứa đường ribose và base U.',
    },
    checkQuestions: [
      {
        prompt: 'Đường polysaccharide đóng vai trò cấu trúc cấu tạo nên thành tế bào thực vật là:',
        choices: [
          { id: 'cb_1', label: 'Cellulose' },
          { id: 'cb_2', label: 'Tinh bột' },
          { id: 'cb_3', label: 'Glycogen' },
          { id: 'cb_4', label: 'Chitin' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cb_1'],
        },
        explain:
          'Cellulose là polymer bền vững của các phân tử glucose, liên kết với nhau bằng liên kết hydro tạo các bó sợi microfibril cấu thành màng tế bào thực vật.',
      },
      {
        prompt:
          'Đại phân tử hữu cơ nào sau đây là thành phần chính cấu tạo nên lớp kép màng sinh chất của tế bào?',
        choices: [
          { id: 'lp_1', label: 'Phospholipid' },
          { id: 'lp_2', label: 'Triglyceride' },
          { id: 'lp_3', label: 'Sáp (Wax)' },
          { id: 'lp_4', label: 'Steroid' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['lp_1'],
        },
        explain:
          'Phospholipid có cấu trúc lưỡng cực gồm đầu ưa nước và hai đuôi kị nước, tự động sắp xếp thành lớp kép phospholipid trong nước tạo màng sinh chất.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn phân của Protein là gì?',
        dap: 'Các amino acid (axit amin).',
      },
      {
        hoi: 'Nêu sự khác biệt giữa base của DNA và RNA?',
        dap: 'DNA chứa A, T, G, C. RNA chứa A, U, G, C (thay Thymine bằng Uracil).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c2-b6',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Thành phần hoá học của tế bào',
    lessonNumber: 6,
    title: 'Thực hành: Nhận biết một số phân tử sinh học',
    hook:
      'Làm thế nào để chứng minh củ khoai tây có chứa tinh bột, quả nho có đường khử hay lòng trắng trứng chứa protein? ' +
      'Chúng ta sử dụng các thuốc thử màu hoá học đặc trưng.',
    theory:
      'NGUYÊN TẮC CÁC PHẢN ỨNG THỬ MÀU SINH HỌC:\\n' +
      '1. Nhận biết đường khử (glucose, fructose...):\\n' +
      '   — Thuốc thử: Dung dịch Benedict (hoặc thuốc thử Fehling chứa ion Cu²⁺).\\n' +
      '   — Hiện tượng: Khi đun nóng nhẹ hỗn hợp đường khử với thuốc thử Benedict, xuất hiện kết tủa đỏ gạch (Cu₂O) do đường khử oxi hoá Cu²⁺ thành Cu⁺.\\n' +
      '2. Nhận biết tinh bột:\\n' +
      '   — Thuốc thử: Dung dịch Iốt (I₂ / KI).\\n' +
      '   — Hiện tượng: Dung dịch Iốt len lỏi vào cấu trúc xoắn của tinh bột tạo thành phức chất có màu xanh tím đặc trưng. Khi đun nóng màu xanh tím biến mất, làm nguội màu xuất hiện trở lại.\\n' +
      '3. Nhận biết protein (Phản ứng Biuret):\\n' +
      '   — Thuốc thử: NaOH + CuSO₄ (phản ứng tạo môi trường kiềm cho ion Cu²⁺ liên kết với peptide).\\n' +
      '   — Hiện tượng: Sự hình thành phức chất màu tím đặc trưng giữa các nguyên tử Cu²⁺ và các liên kết peptide của protein.\\n' +
      '4. Nhận biết lipid:\\n' +
      '   — Nguyên tắc: Lipid không tan trong nước nhưng tan trong dung môi hữu cơ (ethanol). Khi cho nước vào dung dịch lipid đã hoà tan trong cồn, sẽ xuất hiện nhũ dịch trắng đục (emulsion).',
    workedExample: {
      problem:
        'Mô tả thí nghiệm nhận biết sự hiện diện của protein trong dung dịch lòng trắng trứng gà.',
      steps: [
        'Chuẩn bị ống nghiệm đựng 2 ml dung dịch lòng trắng trứng pha loãng.',
        'Thêm vào ống nghiệm 1 ml dung dịch NaOH 10% để tạo môi trường kiềm mạnh.',
        'Nhỏ tiếp vài giọt dung dịch CuSO₄ 1% vào ống nghiệm và lắc đều nhẹ nhàng.',
        'Quan sát hiện tượng: Dung dịch chuyển sang màu tím đặc trưng (phản ứng Biuret dương tính).',
      ],
      answer: 'Nhỏ NaOH và CuSO4 vào dung dịch lòng trắng trứng thấy xuất hiện phức chất màu tím.',
    },
    checkQuestions: [
      {
        prompt:
          'Để nhận biết sự có mặt của tinh bột trong mẫu thử thực phẩm, ta sử dụng dung dịch nào sau đây làm thuốc thử?',
        choices: [
          { id: 'th_1', label: 'Dung dịch Iốt' },
          { id: 'th_2', label: 'Dung dịch Benedict' },
          { id: 'th_3', label: 'Dung dịch NaOH 10%' },
          { id: 'th_4', label: 'Cồn ethanol 96%' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['th_1'],
        },
        explain: 'Dung dịch Iốt phản ứng tạo màu xanh tím đặc trưng với tinh bột.',
      },
      {
        prompt:
          'Khi đun nóng nhẹ dung dịch glucose với thuốc thử Benedict, hiện tượng màu sắc đặc trưng xuất hiện là:',
        choices: [
          { id: 'ms_1', label: 'Xuất hiện kết tủa đỏ gạch' },
          { id: 'ms_2', label: 'Xuất hiện dung dịch màu tím hoa cà' },
          { id: 'ms_3', label: 'Xuất hiện kết tủa màu đen nhánh' },
          { id: 'ms_4', label: 'Không có hiện tượng đổi màu' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ms_1'],
        },
        explain:
          'Đường khử (như glucose) khử Cu²⁺ trong thuốc thử Benedict thành Cu₂O kết tủa màu đỏ gạch khi đun nóng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phản ứng Biuret dùng để nhận biết nhóm chất nào và cho màu gì?',
        dap: 'Nhận biết protein, cho màu tím đặc trưng.',
      },
      {
        hoi: 'Tại sao màu xanh tím của tinh bột và iốt biến mất khi đun nóng?',
        dap: 'Vì nhiệt độ cao làm phân tử tinh bột duỗi thẳng, iốt giải phóng khỏi ống xoắn tinh bột; khi nguội tinh bột xoắn lại làm iốt bị bẫy lại và màu xanh tím xuất hiện.',
      },
    ],
    reviewStatus: 'draft',
  },
]
