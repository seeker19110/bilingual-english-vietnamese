// lessons/hoa11c3.ts — Hoá học 11, Chương 3: Đại cương hoá học hữu cơ (5 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C3_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c3-b10',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Đại cương hoá học hữu cơ',
    lessonNumber: 10,
    title: 'Hợp chất hữu cơ và hoá học hữu cơ',
    hook:
      'Từ thức ăn chúng ta ăn, quần áo chúng ta mặc, cho đến DNA quy định sự sống — tất cả đều cấu tạo ' +
      'từ hợp chất hữu cơ. Hoá học hữu cơ chính là hoá học của nguyên tố Carbon.',
    theory:
      'KHÁI NIỆM HỢP CHẤT HỮU CƠ VÀ HOÁ HỌC HỮU CƠ:\\n' +
      '— Hợp chất hữu cơ là hợp chất của carbon (trừ một số chất vô cơ đơn giản như CO, CO₂, muối carbonate, xyanua, carbide...).\\n' +
      '— Hoá học hữu cơ là ngành hoá học nghiên cứu các hợp chất hữu cơ.\\n\\n' +
      'PHÂN LOẠI HỢP CHẤT HỮU CƠ:\\n' +
      '— Hydrocarbon: chỉ chứa hai nguyên tố Carbon (C) và Hydrogen (H) trong phân tử (ví dụ: CH₄, C₂H₄, C₆H₆).\\n' +
      '— Dẫn xuất của hydrocarbon: ngoài C và H, trong phân tử còn có các nguyên tố khác như O, N, S, Halogen... (ví dụ: C₂H₅OH, CH₃COOH, C₆H₅NH₂).\\n\\n' +
      'ĐẶC ĐIỂM CHUNG CỦA HỢP CHẤT HỮU CƠ:\\n' +
      '— Cấu tạo: Liên kết hoá học chủ yếu là liên kết cộng hoá trị.\\n' +
      '— Tính chất vật lí: Nhiệt độ nóng chảy và nhiệt độ sôi thấp (dễ bay hơi), hầu hết không tan hoặc ít tan trong nước, tan nhiều trong dung môi hữu cơ.\\n' +
      '— Tính chất hoá học: Thường kém bền nhiệt (dễ cháy); phản ứng hoá học xảy ra chậm, theo nhiều hướng khác nhau tạo ra hỗn hợp sản phẩm (hiệu suất không cao).',
    workedExample: {
      problem:
        'Phân tích định tính một chất hữu cơ X thấy khi đốt cháy X tạo ra CO₂ và H₂O. ' +
        'Xác định xem phân tử chất X bắt buộc phải chứa những nguyên tố nào, và có thể chứa nguyên tố nào.',
      steps: [
        'Đốt cháy X sinh ra CO₂ ⇒ sản phẩm có nguyên tố C ⇒ C phải lấy từ chất hữu cơ X (vì đốt trong oxygen O₂ không chứa C). Do đó X bắt buộc phải chứa Carbon (C).',
        'Đốt cháy X sinh ra H₂O ⇒ sản phẩm có nguyên tố H ⇒ H phải lấy từ chất hữu cơ X (vì oxygen O₂ không chứa H). Do đó X bắt buộc phải chứa Hydrogen (H).',
        'Sản phẩm cháy chứa Oxygen (O) nhưng Oxygen này có thể lấy từ O₂ dùng để đốt cháy hoặc từ chính phân tử X. Do đó X có thể chứa Oxygen (O) hoặc không.',
        'Kết luận: X bắt buộc chứa C, H và có thể chứa O.',
      ],
      answer: 'Bắt buộc chứa C, H; có thể chứa O',
    },
    checkQuestions: [
      {
        prompt: 'Hợp chất nào sau đây là hợp chất hữu cơ?',
        choices: [
          { id: 'co2', label: 'CO₂ (carbon dioxide)' },
          { id: 'c2h5oh', label: 'C₂H₅OH (ethanol)' },
          { id: 'caco3', label: 'CaCO₃ (calcium carbonate)' },
          { id: 'nacn', label: 'NaCN (sodium cyanide)' },
        ],
        answer: { kind: 'choice', correctIds: ['c2h5oh'] },
        explain:
          'C₂H₅OH là hợp chất của carbon không thuộc nhóm chất vô cơ ngoại lệ (như CO₂, muối carbonate, muối cyanide). Do đó C₂H₅OH là hợp chất hữu cơ.',
      },
      {
        prompt: 'Hợp chất hữu cơ nào sau đây thuộc loại dẫn xuất của hydrocarbon?',
        choices: [
          { id: 'ch4', label: 'CH₄ (methane)' },
          { id: 'c2h4', label: 'C₂H₄ (ethylene)' },
          { id: 'ch3cl', label: 'CH₃Cl (chloromethane)' },
          { id: 'c6h6', label: 'C₆H₆ (benzene)' },
        ],
        answer: { kind: 'choice', correctIds: ['ch3cl'] },
        explain:
          'CH₃Cl có chứa nguyên tố Cl ngoài C và H, nên thuộc loại dẫn xuất của hydrocarbon. Các chất CH₄, C₂H₄, C₆H₆ chỉ chứa C và H nên là hydrocarbon.',
      },
    ],
    srsCards: [
      {
        hoi: 'Định nghĩa hợp chất hữu cơ?',
        dap: 'Là hợp chất của carbon (trừ một số ít như CO, CO₂, muối carbonate, xyanua...).',
      },
      {
        hoi: 'Phân loại hợp chất hữu cơ gồm hai nhóm lớn nào?',
        dap: 'Hydrocarbon (chỉ chứa C, H) và Dẫn xuất của hydrocarbon (chứa C, H và nguyên tố khác như O, N, Cl...).',
      },
      {
        hoi: 'Liên kết hoá học chủ yếu trong hợp chất hữu cơ là gì?',
        dap: 'Liên kết cộng hoá trị.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c3-b11',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Đại cương hoá học hữu cơ',
    lessonNumber: 11,
    title: 'Phương pháp tách biệt và tinh chế hợp chất hữu cơ',
    hook:
      'Làm thế nào để lấy được tinh dầu hoa bưởi nguyên chất từ hoa bưởi tươi, hay tách cồn ra khỏi ' +
      'hỗn hợp rượu nước? Các nhà hoá học dùng các phương pháp vật lí tinh vi dựa trên sự khác biệt tính chất của các chất.',
    theory:
      'PHƯƠNG PHÁP CHƯNG CẤT (Distillation):\\n' +
      '— Nguyên lí: Dựa trên sự khác biệt về NHIỆT ĐỘ SÔI của các chất trong hỗn hợp lỏng.\\n' +
      '— Cách làm: Đun sôi hỗn hợp lỏng, chất có nhiệt độ sôi thấp hơn sẽ bay hơi trước, dẫn hơi qua ống sinh hàn để ngưng tụ thành chất lỏng tinh khiết (chưng cất phân đoạn dùng cho các chất có nhiệt độ sôi gần nhau, chưng cất lôi cuốn hơi nước dùng cho tinh dầu).\\n\\n' +
      'PHƯƠNG PHÁP CHIẾT (Extraction):\\n' +
      '— Nguyên lí: Dựa trên sự khác biệt về ĐỘ TAN của các chất trong hai dung môi không trộn lẫn vào nhau (thường là nước và dung môi hữu cơ như ether, chloroform).\\n' +
      '— Thiết bị: Dùng phễu chiết để tách riêng lớp dung dịch phía trên và lớp dung dịch phía dưới.\\n\\n' +
      'PHƯƠNG PHÁP KẾT TINH (Crystallization):\\n' +
      '— Nguyên lí: Dựa trên sự khác biệt về ĐỘ TAN của chất rắn theo NHIỆT ĐỘ.\\n' +
      '— Cách làm: Hoà tan chất rắn bẩn vào dung môi nóng tạo dung dịch bão hoà, lọc nóng để bỏ tạp chất không tan, để nguội cho chất cần tinh chế kết tinh lại dưới dạng tinh thể sạch, lọc lấy tinh thể.\\n\\n' +
      'PHƯƠNG PHÁP SẮC KÍ CỘT (Column Chromatography):\\n' +
      '— Nguyên lí: Dựa trên sự khác biệt về khả năng HẤP PHỤ của pha tĩnh (như silica gel) và khả năng hoà tan trong pha động (dung môi) của các chất cần tách.',
    workedExample: {
      problem:
        'Để tách tinh dầu xả ra khỏi hỗn hợp chưng cất lôi cuốn hơi nước (gồm tinh dầu xả và nước lỏng, ' +
        'không tan vào nhau), ta nên dùng phương pháp tách biệt nào?',
      steps: [
        'Hỗn hợp cần tách gồm hai chất lỏng không tan vào nhau: tinh dầu xả (nhẹ hơn, nổi ở trên) và nước (ở dưới).',
        'Tính chất không tan vào nhau của hai chất lỏng phân lớp rất thích hợp cho phương pháp chiết lỏng - lỏng.',
        'Ta cho hỗn hợp vào phễu chiết, để yên cho phân lớp rõ rệt.',
        'Mở khoá phễu chiết để nước chảy hết ra ngoài, thu lấy lớp tinh dầu xả còn lại trong phễu.',
      ],
      answer: 'Phương pháp chiết',
    },
    checkQuestions: [
      {
        prompt:
          'Phương pháp chưng cất được sử dụng dựa trên sự khác biệt về tính chất vật lí nào của các chất?',
        choices: [
          { id: 'tan', label: 'Độ tan trong các dung môi' },
          { id: 'soi', label: 'Nhiệt độ sôi' },
          { id: 'khoi', label: 'Khối lượng riêng' },
          { id: 'kich', label: 'Kích thước hạt tinh thể' },
        ],
        answer: { kind: 'choice', correctIds: ['soi'] },
        explain:
          'Phương pháp chưng cất dựa trên sự khác biệt về nhiệt độ sôi của các chất lỏng trong hỗn hợp.',
      },
      {
        prompt:
          'Để làm sạch muối ăn NaCl rắn có lẫn ít cát và tạp chất hữu cơ, ta hoà tan vào nước nóng, lọc bỏ cát, rồi cô bớt nước để muối kết tinh ra. Đây là phương pháp gì?',
        choices: [
          { id: 'chungcat', label: 'Chưng cất' },
          { id: 'chiet', label: 'Chiết' },
          { id: 'kettinh', label: 'Kết tinh' },
          { id: 'sacki', label: 'Sắc kí' },
        ],
        answer: { kind: 'choice', correctIds: ['kettinh'] },
        explain:
          'Quá trình hoà tan tạo dung dịch nóng, để nguội hoặc cô bớt dung môi để chất rắn tách ra dạng tinh thể gọi là phương pháp kết tinh.',
      },
    ],
    srsCards: [
      { hoi: 'Chưng cất dựa trên sự khác biệt gì?', dap: 'Nhiệt độ sôi của các chất lỏng.' },
      { hoi: 'Thiết bị dùng để thực hiện phương pháp chiết lỏng - lỏng?', dap: 'Phễu chiết.' },
      { hoi: 'Kết tinh dùng để tinh chế chất ở trạng thái nào?', dap: 'Chất rắn.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c3-b12',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Đại cương hoá học hữu cơ',
    lessonNumber: 12,
    title: 'Công thức phân tử hợp chất hữu cơ',
    hook:
      'Làm thế nào nhà hoá học biết một phân tử chứa chính xác bao nhiêu nguyên tử C, H, O? ' +
      'Bằng cách đốt cháy chất đó để định lượng, kết hợp phân tích phổ khối lượng (MS) hiện đại.',
    theory:
      'CÔNG THỨC ĐƠN GIẢN NHẤT (Empirical Formula):\\n' +
      '— Công thức đơn giản nhất cho biết tỉ lệ số nguyên tử của các nguyên tố trong phân tử (ở dạng số nguyên tối giản).\\n' +
      '— Cách thiết lập cho chất CxHyOz: x : y : z = nC : nH : nO = (%C / 12) : (%H / 1) : (%O / 16).\\n\\n' +
      'CÔNG THỨC PHÂN TỬ (Molecular Formula):\\n' +
      '— Công thức phân tử cho biết số lượng nguyên tử thực tế của mỗi nguyên tố trong một phân tử chất.\\n' +
      '— Công thức phân tử là bội số nguyên của công thức đơn giản nhất: (Công thức đơn giản nhất)n.\\n\\n' +
      'XÁC ĐỊNH KHỐI LƯỢNG PHÂN TỬ BẰNG PHỔ KHỐI LƯỢNG (MS):\\n' +
      '— Phương pháp phổ khối lượng (Mass Spectrometry - MS) được dùng để xác định phân tử khối của chất hữu cơ.\\n' +
      '— Trên giản đồ phổ MS, mảnh ion phân tử [M⁺] có giá trị m/z lớn nhất (thường ở ngoài cùng bên phải) tương ứng với khối lượng phân tử của chất đó.',
    workedExample: {
      problem:
        'Một chất hữu cơ X có phần trăm khối lượng các nguyên tố là 85,7% C và 14,3% H. ' +
        'Tìm công thức đơn giản nhất của X.',
      steps: [
        'Đặt công thức tổng quát của X là CxHy.',
        'Lập tỉ lệ số mol các nguyên tố: x : y = (%C / 12) : (%H / 1).',
        'Thay số: x : y = (85,7 / 12) : (14,3 / 1) = 7,14 : 14,3.',
        'Chia cả hai số cho số nhỏ nhất (7,14) để tối giản: x : y = 1 : 2.',
        'Kết luận: Công thức đơn giản nhất của X là CH₂.',
      ],
      answer: 'CH2',
    },
    checkQuestions: [
      {
        prompt:
          'Phương pháp phân tích hiện đại nào được sử dụng phổ biến nhất để xác định trực tiếp khối lượng phân tử của một chất hữu cơ?',
        choices: [
          { id: 'ms', label: 'Phổ khối lượng (MS)' },
          { id: 'ir', label: 'Phổ hồng ngoại (IR)' },
          { id: 'uv', label: 'Phổ tử ngoại (UV-Vis)' },
          { id: 'nmr', label: 'Phổ cộng hưởng từ hạt nhân (NMR)' },
        ],
        answer: { kind: 'choice', correctIds: ['ms'] },
        explain:
          'Phổ khối lượng (MS) cho biết giá trị m/z của ion phân tử, từ đó xác định chính xác khối lượng phân tử.',
      },
      {
        prompt:
          'Một chất hữu cơ Y có công thức đơn giản nhất là CH₂O và phân tử khối bằng 60 g/mol. Hãy tìm công thức phân tử của Y.',
        choices: [
          { id: 'ch2o', label: 'CH₂O' },
          { id: 'c2h4o2', label: 'C₂H₄O₂' },
          { id: 'c3h6o3', label: 'C₃H₆O₃' },
          { id: 'c4h8o4', label: 'C₄H₈O₄' },
        ],
        answer: { kind: 'choice', correctIds: ['c2h4o2'] },
        explain:
          'Công thức phân tử có dạng (CH₂O)n. Ta có phân tử khối = (12 + 2 + 16) * n = 30 * n = 60 ⇒ n = 2. Vậy công thức phân tử là C₂H₄O₂.',
      },
    ],
    srsCards: [
      {
        hoi: 'Công thức đơn giản nhất cho biết điều gì?',
        dap: 'Tỉ lệ số nguyên tử của các nguyên tố trong phân tử ở dạng tối giản.',
      },
      {
        hoi: 'Mảnh ion nào trên phổ MS cho biết khối lượng phân tử?',
        dap: 'Mảnh ion phân tử [M⁺] có giá trị m/z lớn nhất.',
      },
      {
        hoi: 'Mối quan hệ giữa công thức phân tử và công thức đơn giản nhất?',
        dap: 'Công thức phân tử = (Công thức đơn giản nhất)n với n là số nguyên dương.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c3-b13',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Đại cương hoá học hữu cơ',
    lessonNumber: 13,
    title: 'Cấu tạo hoá học hợp chất hữu cơ',
    hook:
      'Ethanol (cồn) và Dimethyl ether đều có cùng công thức phân tử C₂H₆O. Nhưng ethanol là chất lỏng ' +
      'uống được, còn dimethyl ether là chất khí gây mê. Sự khác biệt nằm ở cách sắp xếp liên kết các nguyên tử.',
    theory:
      'THUYẾT CẤU TẠO HOÁ HỌC (Butlerov):\\n' +
      '1. Trong phân tử hợp chất hữu cơ, các nguyên tử liên kết với nhau theo ĐÚNG THỨ TỰ và bằng hoá trị của chúng. Carbon luôn có hoá trị IV, Hydrogen hoá trị I, Oxygen hoá trị II, Nitrogen hoá trị III.\\n' +
      '2. Nguyên tử Carbon không chỉ liên kết với nguyên tử của nguyên tố khác mà còn có thể liên kết trực tiếp với nhau tạo thành MẠCH CARBON (mạch hở không phân nhánh, mạch hở phân nhánh, mạch vòng).\\n' +
      '3. Tính chất của chất phụ thuộc vào THÀNH PHẦN phân tử và CẤU TẠO hoá học (thứ tự liên kết).\\n\\n' +
      'ĐỒNG PHÂN (Isomerism):\\n' +
      '— Đồng phân là các chất khác nhau có cùng công thức phân tử nhưng khác nhau về cấu tạo hoá học (nên tính chất khác nhau).\\n' +
      '— Ví dụ: CH₃-CH₂-OH (ethanol) và CH₃-O-CH₃ (dimethyl ether) là đồng phân của nhau.\\n\\n' +
      'ĐỒNG ĐẲNG (Homology):\\n' +
      '— Đồng đẳng là các chất có cấu tạo và tính chất hoá học tương tự nhau, nhưng thành phần phân tử hơn kém nhau một hay nhiều nhóm −CH₂−.\\n' +
      '— Ví dụ: CH₄, C₂H₆, C₃H₈... lập thành dãy đồng đẳng alkane.\\n\\n' +
      'PHỔ HỒNG NGOẠI (IR):\\n' +
      '— Phổ hồng ngoại (Infrared Spectroscopy - IR) được dùng để xác định các nhóm chức đặc trưng trong phân tử (ví dụ: nhóm −OH có tín hiệu đặc trưng ở vùng 3200 - 3600 cm⁻¹; nhóm C=O ở vùng 1600 - 1850 cm⁻¹).',
    workedExample: {
      problem:
        'Viết công thức cấu tạo thu gọn của các đồng phân cấu tạo có công thức phân tử C₃H₈O.',
      steps: [
        'Carbon có hoá trị IV, Oxygen hoá trị II, Hydrogen hoá trị I.',
        'Mạch carbon có 3 C: C-C-C. Nhóm chức chứa oxygen có thể là nhóm alcohol (−OH) hoặc ether (−O−).',
        'Đồng phân alcohol: đính nhóm −OH vào vị trí carbon số 1 hoặc số 2:\\n  (1) CH₃-CH₂-CH₂-OH\\n  (2) CH₃-CH(OH)-CH₃',
        'Đồng phân ether: chen nguyên tử O vào giữa mạch carbon:\\n  (3) CH₃-CH₂-O-CH₃',
        'Kết luận: C₃H₈O có 3 đồng phân cấu tạo.',
      ],
      answer: '3 đồng phân',
    },
    checkQuestions: [
      {
        prompt: 'Trong hợp chất hữu cơ, nguyên tử Carbon luôn có hoá trị bằng bao nhiêu?',
        answer: { kind: 'numeric', value: 4 },
        explain:
          'Theo thuyết cấu tạo hoá học, Carbon luôn thể hiện hoá trị IV trong mọi hợp chất hữu cơ.',
      },
      {
        prompt:
          'Các chất có cùng công thức phân tử nhưng có cấu tạo hoá học khác nhau được gọi là gì?',
        choices: [
          { id: 'dongdang', label: 'Đồng đẳng' },
          { id: 'dongphan', label: 'Đồng phân' },
          { id: 'dongvi', label: 'Đồng vị' },
          { id: 'donghinh', label: 'Đồng hình' },
        ],
        answer: { kind: 'choice', correctIds: ['dongphan'] },
        explain:
          'Đồng phân là những chất khác nhau có cùng công thức phân tử nhưng khác cấu tạo hoá học.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hoá trị của C, H, O trong hợp chất hữu cơ?',
        dap: 'Carbon hoá trị IV, Hydrogen hoá trị I, Oxygen hoá trị II.',
      },
      {
        hoi: 'Đồng phân là gì?',
        dap: 'Các chất khác nhau có cùng công thức phân tử nhưng cấu tạo hoá học khác nhau.',
      },
      {
        hoi: 'Đồng đẳng là gì?',
        dap: 'Các chất có cấu tạo/tính chất tương tự nhau nhưng thành phần phân tử hơn kém nhau một hay nhiều nhóm −CH₂−.',
      },
      {
        hoi: 'Phổ hồng ngoại (IR) dùng để xác định cái gì?',
        dap: 'Các nhóm chức hoá học đặc trưng có trong phân tử.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c3-b14',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Đại cương hoá học hữu cơ',
    lessonNumber: 14,
    title: 'Ôn tập chương 3',
    hook:
      'Chương 3 mở ra cánh cổng vào thế giới Hoá học hữu cơ rộng lớn, trang bị các công cụ định lượng ' +
      'và tư duy cấu trúc phân tử để ta bước tiếp vào các nhóm hydrocarbon cụ thể.',
    theory:
      'TÓM TẮT NỘI DUNG CHƯƠNG 3:\\n' +
      '1. Hợp chất hữu cơ là hợp chất của Carbon. Chia làm Hydrocarbon (C, H) và Dẫn xuất (chứa O, N, S, halogen...).\\n' +
      '2. Bốn phương pháp tinh chế: Chưng cất (nhiệt độ sôi), Chiết (độ tan trong dung môi), Kết tinh (độ tan rắn theo nhiệt độ), Sắc kí cột (khả năng hấp phụ).\\n' +
      '3. Công thức phân tử CxHyOz tính từ tỉ lệ phần trăm khối lượng: x : y : z = %C/12 : %H/1 : %O/16. Phân tử khối xác định bằng phổ khối lượng (MS) từ đỉnh ion phân tử [M⁺].\\n' +
      '4. Thuyết cấu tạo hoá học: trật tự liên kết nguyên tử xác định tính chất; Carbon hoá trị IV, tạo được mạch C.\\n' +
      '5. Đồng phân: cùng CTPT, khác cấu tạo. Đồng đẳng: cấu tạo tương tự, hơn kém nhóm −CH₂−. Phổ IR dùng để nhận biết nhóm chức.',
    workedExample: {
      problem:
        'Một hydrocarbon mạch hở Y có công thức đơn giản nhất là CH₃. Biết phân tử khối của Y là 30 g/mol. ' +
        'Xác định công thức phân tử của Y.',
      steps: [
        'Công thức phân tử của Y có dạng (CH₃)n với n là số nguyên dương.',
        'Phân tử khối của Y là M = (12 + 1*3) * n = 15n = 30.',
        'Giải ra n: n = 30 / 15 = 2.',
        'Vậy công thức phân tử của Y là C₂H₆.',
      ],
      answer: 'C2H6',
    },
    checkQuestions: [
      {
        prompt: 'Chất nào sau đây là đồng đẳng của methane (CH₄)?',
        choices: [
          { id: 'c2h4', label: 'C₂H₄ (ethylene)' },
          { id: 'c2h6', label: 'C₂H₆ (ethane)' },
          { id: 'c2h2', label: 'C₂H₂ (acetylene)' },
          { id: 'c6h6', label: 'C₆H₆ (benzene)' },
        ],
        answer: { kind: 'choice', correctIds: ['c2h6'] },
        explain:
          'C₂H₆ hơn CH₄ một nhóm −CH₂− và có cùng công thức tổng quát của alkane (CₙH₂ₙ₊₂), cấu tạo tương tự nhau nên là đồng đẳng của nhau.',
      },
      {
        prompt:
          'Đỉnh ion phân tử [M⁺] có m/z bằng 46 trên phổ khối lượng MS của một alcohol. Phân tử khối của alcohol này bằng bao nhiêu?',
        answer: { kind: 'numeric', value: 46 },
        explain:
          'Trị số m/z của đỉnh ion phân tử [M⁺] chính bằng phân tử khối của chất đó. Ở đây m/z = 46 tương ứng phân tử khối bằng 46 g/mol.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hai nhóm lớn của hợp chất hữu cơ là gì?',
        dap: 'Hydrocarbon và Dẫn xuất của hydrocarbon.',
      },
      {
        hoi: 'Đỉnh [M⁺] trên phổ MS giúp xác định điều gì?',
        dap: 'Khối lượng phân tử của chất hữu cơ.',
      },
      { hoi: 'Tín hiệu hấp thụ nhóm −OH trên phổ IR nằm ở đâu?', dap: 'Vùng 3200 - 3600 cm⁻¹.' },
    ],
    reviewStatus: 'draft',
  },
]
