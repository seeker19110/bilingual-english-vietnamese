// lessons/hoa11c5.ts — Hoá học 11, Chương 5: Dẫn xuất halogen - Alcohol - Phenol (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C5_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c5-b19',
    grade: '11',
    chapterNumber: 5,
    chapterTitle: 'Dẫn xuất halogen - Alcohol - Phenol',
    lessonNumber: 19,
    title: 'Dẫn xuất halogen',
    hook:
      'Chảo chống dính Teflon bền bỉ và ống nhựa PVC dẻo dai đều là polymer được tổng hợp từ dẫn xuất halogen. ' +
      'Các hợp chất này mang nhiều ứng dụng quan trọng lẫn thách thức môi trường.',
    theory:
      'KHÁI NIỆM:\\n' +
      '— Dẫn xuất halogen là hợp chất thu được khi thay thế một hay nhiều nguyên tử hydrogen trong phân tử hydrocarbon bằng một hay nhiều nguyên tử halogen (F, Cl, Br, I).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC (Hai phản ứng quan trọng):\\n' +
      '1. Phản ứng thế nhóm halogen bằng nhóm OH (phản ứng thuỷ phân):\\n' +
      '   — Dẫn xuất halogen đun nóng với dung dịch kiềm (NaOH, KOH) tạo thành alcohol và muối halide.\\n' +
      '   — Phương trình tổng quát: R−X + NaOH → R−OH + NaX (t°).\\n' +
      '2. Phản ứng tách hydrogen halide (HX):\\n' +
      '   — Dẫn xuất halogen có nguyên tử H ở carbon bên cạnh (Cβ) khi đun nóng với dung dịch kiềm trong ethanol (KOH/C₂H₅OH) sẽ bị tách HX tạo ra alkene.\\n' +
      '   — Quy tắc Zaitsev (định hướng tách): Trong phản ứng tách HX, nguyên tử halogen (X) ưu tiên tách ra cùng với nguyên tử hydrogen (H) ở carbon bên cạnh có bậc cao hơn (có ít hydrogen hơn) để tạo ra sản phẩm chính có liên kết đôi bền vững hơn.',
    workedExample: {
      problem:
        'Xác định công thức cấu tạo của sản phẩm chính khi thực hiện phản ứng tách HBr từ chất ' +
        '2-bromobutane (CH₃-CH(Br)-CH₂-CH₃) bằng dung dịch KOH trong ethanol đun nóng.',
      steps: [
        '2-bromobutane có nguyên tử Br gắn ở C số 2.',
        'Hai carbon bên cạnh C số 2 là C số 1 (nhóm −CH₃ có 3 H) và C số 3 (nhóm −CH₂− có 2 H).',
        'Theo quy tắc Zaitsev, Br sẽ ưu tiên tách cùng H ở carbon bên cạnh có ít H hơn (C số 3 có 2 H, ít hơn C số 1 có 3 H).',
        'Sự tách Br ở C số 2 và H ở C số 3 tạo liên kết đôi giữa C số 2 và C số 3.',
        'Sản phẩm chính thu được là: CH₃-CH=CH-CH₃ (but-2-ene).',
      ],
      answer: 'but-2-ene',
    },
    checkQuestions: [
      {
        prompt:
          'Đun nóng ethyl chloride (CH₃-CH₂-Cl) với dung dịch NaOH, thu được sản phẩm hữu cơ thuộc lớp chất nào?',
        choices: [
          { id: 'alkene', label: 'Alkene' },
          { id: 'alcohol', label: 'Alcohol' },
          { id: 'ether', label: 'Ether' },
          { id: 'aldehyde', label: 'Aldehyde' },
        ],
        answer: { kind: 'choice', correctIds: ['alcohol'] },
        explain:
          'Ethyl chloride phản ứng thế nucleophilic với dung dịch NaOH (thuỷ phân) tạo ra ethanol (CH₃-CH₂-OH) là một alcohol.',
      },
      {
        prompt:
          'Theo quy tắc tách Zaitsev, nguyên tử halogen ưu tiên tách ra cùng với nguyên tử hydrogen ở carbon bên cạnh có đặc điểm gì?',
        choices: [
          { id: 'it_h', label: 'Có ít hydrogen hơn (carbon bậc cao hơn)' },
          { id: 'nhieu_h', label: 'Có nhiều hydrogen hơn (carbon bậc thấp hơn)' },
          { id: 'bat_ky', label: 'Carbon nào cũng được' },
        ],
        answer: { kind: 'choice', correctIds: ['it_h'] },
        explain:
          'Quy tắc Zaitsev: tách H ở carbon bên cạnh có ít H hơn (C bậc cao hơn) để tạo alkene nhiều nhóm thế hơn (bền hơn).',
      },
    ],
    srsCards: [
      {
        hoi: 'Dẫn xuất halogen là gì?',
        dap: 'Hydrocarbon bị thế một hoặc nhiều nguyên tử H bằng nguyên tử halogen (F, Cl, Br, I).',
      },
      {
        hoi: 'Hai phản ứng hoá học chính của dẫn xuất halogen?',
        dap: 'Phản ứng thế nhóm halogen (tạo alcohol) và phản ứng tách HX (tạo alkene).',
      },
      {
        hoi: 'Quy tắc Zaitsev định hướng điều gì?',
        dap: 'Định hướng phản ứng tách HX: H ưu tiên tách ở carbon bên cạnh có ít H hơn.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c5-b20',
    grade: '11',
    chapterNumber: 5,
    chapterTitle: 'Dẫn xuất halogen - Alcohol - Phenol',
    lessonNumber: 20,
    title: 'Alcohol',
    hook:
      'Ethanol có trong bia rượu là chất lỏng quen thuộc, nhưng methanol (cồn công nghiệp) chỉ hơn kém ' +
      'một nhóm CH₂ lại là chất độc chết người gây mù loà. Sự hiểu biết về alcohol giúp bảo vệ mạng sống của chúng ta.',
    theory:
      'KHÁI NIỆM VÀ PHÂN LOẠI:\\n' +
      '— Alcohol là hợp chất hữu cơ có nhóm hydroxyl (−OH) liên kết trực tiếp với nguyên tử carbon no.\\n' +
      '— Công thức chung của alcohol no, đơn chức, mạch hở: CₙH₂ₙ₊₁OH (n ≥ 1).\\n' +
      '— Polyalcohol là alcohol có nhiều nhóm −OH (ví dụ: ethylene glycol C₂H₄(OH)₂, glycerol C₃H₅(OH)₃).\\n\\n' +
      'TÍNH CHẤT VẬT LÍ (Liên kết hydrogen):\\n' +
      '— Ở điều kiện thường, các alcohol là chất lỏng hoặc rắn. Nhiệt độ sôi và độ tan trong nước của alcohol cao hơn nhiều so với hydrocarbon có cùng phân tử khối vì các phân tử alcohol tạo được LIÊN KẾT HYDROGEN liên phân tử với nhau và với nước.\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC:\\n' +
      '1. Phản ứng thế nguyên tử H của nhóm −OH: Tác dụng với kim loại kiềm giải phóng H₂: R−OH + Na → R−ONa + 1/2 H₂.\\n' +
      '2. Phản ứng oxi hoá không hoàn toàn bởi CuO (t°):\\n' +
      '   — Alcohol bậc I tạo aldehyde: R−CH₂OH + CuO → R−CHO + Cu + H₂O.\\n' +
      "   — Alcohol bậc II tạo ketone: R−CH(OH)−R' + CuO → R−CO−R' + Cu + H₂O.\\n" +
      '   — Alcohol bậc III bền vững, không bị CuO oxi hoá ở điều kiện này.\\n' +
      '3. Phản ứng tách nước (dehydration):\\n' +
      '   — Tách nước tạo alkene (tại 170 °C, xúc tác H₂SO₄ đặc): C₂H₅OH → C₂H₄ + H₂O.\\n' +
      '   — Tách nước tạo ether (tại 140 °C, xúc tác H₂SO₄ đặc): 2C₂H₅OH → C₂H₅−O−C₂H₅ + H₂O.',
    workedExample: {
      problem:
        'Cho 4,6 gam kim loại Sodium (Na, M=23) phản ứng hoàn toàn với lượng dư cồn ethanol nguyên chất. ' +
        'Tính thể tích khí H₂ sinh ra ở điều kiện chuẩn (25 °C, 1 bar, thể tích mol là 24,79 L/mol).',
      steps: [
        'Tính số mol Na: nNa = 4,6 / 23 = 0,2 mol.',
        'Viết phương trình phản ứng: C₂H₅OH + Na → C₂H₅ONa + 1/2 H₂.',
        'Tính số mol H₂ sinh ra theo tỉ lệ phản ứng: nH₂ = 1/2 * nNa = 0,2 / 2 = 0,1 mol.',
        'Tính thể tích khí H₂ ở điều kiện chuẩn: V = nH₂ * 24,79 = 0,1 * 24,79 = 2,479 L.',
      ],
      answer: '2,479 L',
    },
    checkQuestions: [
      {
        prompt:
          'Vì sao alcohol có nhiệt độ sôi cao hơn nhiều so với các hydrocarbon có khối lượng phân tử tương đương?',
        choices: [
          { id: 'lienket', label: 'Do phân tử tạo được liên kết hydrogen liên phân tử' },
          { id: 'hoatri', label: 'Do có liên kết cộng hoá trị bền hơn' },
          { id: 'khoiluong', label: 'Do khối lượng riêng của alcohol lớn hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['lienket'] },
        explain:
          'Nhóm −OH phân cực mạnh của alcohol cho phép hình thành liên kết hydrogen liên phân tử, cần nhiều năng lượng hơn để phá vỡ khi đun sôi.',
      },
      {
        prompt:
          'Khi oxi hoá alcohol bậc II bằng copper(II) oxide (CuO) ở nhiệt độ cao, sản phẩm hữu cơ thu được thuộc lớp chất nào?',
        choices: [
          { id: 'ald', label: 'Aldehyde' },
          { id: 'ket', label: 'Ketone' },
          { id: 'acid', label: 'Carboxylic acid' },
          { id: 'alk', label: 'Alkene' },
        ],
        answer: { kind: 'choice', correctIds: ['ket'] },
        explain:
          'Alcohol bậc I bị CuO oxi hoá tạo aldehyde, còn alcohol bậc II bị oxi hoá tạo ketone.',
      },
    ],
    srsCards: [
      {
        hoi: 'Alcohol là gì?',
        dap: 'Hợp chất hữu cơ có nhóm −OH liên kết trực tiếp với nguyên tử carbon no.',
      },
      {
        hoi: 'Nhiệt độ sôi của alcohol cao nhờ yếu tố nào?',
        dap: 'Liên kết hydrogen liên phân tử giữa các nhóm −OH.',
      },
      {
        hoi: 'Sản phẩm oxi hoá alcohol bậc I và II bằng CuO nóng?',
        dap: 'Alcohol bậc I tạo Aldehyde; bậc II tạo Ketone.',
      },
      {
        hoi: 'Hai điều kiện tách nước của ethanol (H₂SO₄ đặc)?',
        dap: '170 °C tạo alkene (ethylene); 140 °C tạo ether (diethyl ether).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c5-b21',
    grade: '11',
    chapterNumber: 5,
    chapterTitle: 'Dẫn xuất halogen - Alcohol - Phenol',
    lessonNumber: 21,
    title: 'Phenol',
    hook:
      'Phenol là chất sát trùng lâu đời nhất loài người tìm ra, nhưng nó có thể gây bỏng da nghiêm trọng. ' +
      'Khác với alcohol, phenol có tính axit yếu do ảnh hưởng qua lại của vòng benzene.',
    theory:
      'KHÁI NIỆM:\\n' +
      '— Phenol là những hợp chất hữu cơ trong phân tử có nhóm hydroxyl (−OH) liên kết trực tiếp với nguyên tử carbon của vòng benzene. Chất đơn giản nhất là C₆H₅OH (phenol).\\n\\n' +
      'ẢNH HƯỞNG QUA LẠI GIỮA VÒNG BENZENE VÀ NHÓM −OH:\\n' +
      '— Nhóm −OH đẩy electron vào vòng benzene làm tăng mật độ electron trong vòng, đặc biệt ở các vị trí o- và p-, làm phản ứng thế vào vòng dễ hơn benzene.\\n' +
      '— Vòng benzene hút electron làm liên kết O−H của nhóm −OH phân cực mạnh hơn so với alcohol, khiến nguyên tử H trở nên linh động hơn (thể hiện tính acid yếu).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC:\\n' +
      '1. Tính acid yếu (mạnh hơn alcohol nhưng yếu hơn carbonic acid H₂CO₃):\\n' +
      '   — Phenol phản ứng với dung dịch kiềm tạo muối phenolate: C₆H₅OH + NaOH → C₆H₅ONa + H₂O.\\n' +
      '   — Muối sodium phenolate dễ bị khí CO₂ và nước đẩy ngược lại tạo phenol (dung dịch đục): C₆H₅ONa + CO₂ + H₂O → C₆H₅OH↓ (vẩn đục) + NaHCO₃.\\n' +
      '2. Phản ứng thế ở vòng thơm:\\n' +
      '   — Tác dụng với nước Bromine tạo kết tủa TRẮNG (2,4,6-tribromophenol) ngay ở nhiệt độ thường (phản ứng nhạy dùng nhận biết phenol): C₆H₅OH + 3Br₂ → C₆H₂(OH)Br₃↓ + 3HBr.\\n' +
      '   — Tác dụng với HNO₃ đặc (xúc tác H₂SO₄ đặc) tạo kết tủa VÀNG picric acid (2,4,6-trinitrophenol).',
    workedExample: {
      problem:
        'Sục khí carbon dioxide (CO₂) vào dung dịch muối sodium phenolate (C₆H₅ONa) không màu. ' +
        'Nêu hiện tượng xảy ra và viết phương trình hoá học của phản ứng.',
      steps: [
        'Phenol là một axit rất yếu (yếu hơn carbonic acid H₂CO₃).',
        'Khi sục khí CO₂ vào dung dịch muối sodium phenolate, carbonic acid sinh ra từ CO₂ và H₂O sẽ đẩy phenol ra khỏi muối.',
        'Phản ứng: C₆H₅ONa + CO₂ + H₂O → C₆H₅OH + NaHCO₃.',
        'Phenol sinh ra ít tan trong nước lạnh ở điều kiện thường nên dung dịch không màu ban đầu trở nên vẩn đục.',
      ],
      answer: 'Dung dịch vẩn đục',
    },
    checkQuestions: [
      {
        prompt:
          'Nhỏ nước bromine vào dung dịch phenol, xuất hiện hiện tượng gì ngay ở nhiệt độ thường?',
        choices: [
          { id: 'khi', label: 'Có khí mùi hắc thoát ra' },
          { id: 'tua_trang', label: 'Xuất hiện kết tủa màu trắng' },
          { id: 'tua_vang', label: 'Xuất hiện kết tủa màu vàng' },
          { id: 'khong', label: 'Không có hiện tượng gì' },
        ],
        answer: { kind: 'choice', correctIds: ['tua_trang'] },
        explain:
          'Phenol tác dụng cực kỳ nhạy với nước bromine tạo kết tủa trắng 2,4,6-tribromophenol.',
      },
      {
        prompt:
          'Phenol tác dụng được với chất nào sau đây mà các alcohol thông thường như ethanol không phản ứng?',
        choices: [
          { id: 'na', label: 'Kim loại Sodium (Na)' },
          { id: 'naoh', label: 'Dung dịch NaOH' },
          { id: 'o2', label: 'Khí Oxygen' },
        ],
        answer: { kind: 'choice', correctIds: ['naoh'] },
        explain:
          'Phenol có tính acid yếu đủ phản ứng với kiềm NaOH tạo muối tan. Ethanol trung tính không phản ứng với NaOH.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phenol là gì?',
        dap: 'Hợp chất hữu cơ có nhóm −OH đính trực tiếp vào nguyên tử carbon của vòng benzene.',
      },
      {
        hoi: 'Vì sao phenol có tính axit lớn hơn alcohol?',
        dap: 'Do vòng benzene hút electron làm liên kết O−H phân cực mạnh hơn.',
      },
      {
        hoi: 'Hai phản ứng nhận biết nhanh phenol?',
        dap: 'Tác dụng nước bromine tạo kết tủa trắng; tác dụng HNO₃ đặc tạo kết tủa vàng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c5-b22',
    grade: '11',
    chapterNumber: 5,
    chapterTitle: 'Dẫn xuất halogen - Alcohol - Phenol',
    lessonNumber: 22,
    title: 'Ôn tập chương 5',
    hook:
      'Chương 5 hệ thống hoá các dẫn xuất chứa oxi và halogen, thiết lập chiếc cầu nối trung gian ' +
      'quan trọng từ hydrocarbon sang các hợp chất carbonyl tiếp theo.',
    theory:
      'TỔNG KẾT SO SÁNH DẪN XUẤT HALOGEN, ALCOHOL, PHENOL:\\n' +
      '1. Dẫn xuất halogen (R−X): Có phản ứng thế halogen bằng −OH (NaOH loãng, t°) và phản ứng tách HX (KOH/ethanol, t° - tuân theo quy tắc Zaitsev).\\n' +
      '2. Alcohol (R−OH): Có nhóm −OH gắn carbon no. Nhiệt độ sôi cao nhờ liên kết hydrogen. Tác dụng với Na. Oxi hoá bởi CuO tạo aldehyde (bậc I) hoặc ketone (bậc II). Tách nước tạo alkene (170 °C) hoặc ether (140 °C).\\n' +
      '3. Phenol (C₆H₅OH): Có nhóm −OH gắn trực tiếp vòng benzene. Có tính axit yếu (tác dụng NaOH, bị CO₂ đẩy ra). Dễ thế vòng thơm (phản ứng nước bromine tạo kết tủa trắng, phản ứng HNO₃ đặc tạo kết tủa vàng).\\n' +
      '4. Polyalcohol kề nhau (như glycerol): Tác dụng được với Cu(OH)₂ ở nhiệt độ thường tạo dung dịch xanh lam thẫm (phản ứng đặc trưng nhận biết polyalcohol có nhóm −OH kề nhau).',
    workedExample: {
      problem:
        'Nhận biết 3 chất lỏng không màu đựng trong 3 lọ mất nhãn: ethanol, glycerol và phenol bằng ' +
        'thuốc thử phù hợp.',
      steps: [
        'Trích mẫu thử của 3 chất lỏng.',
        'Nhỏ dung dịch nước bromine vào các mẫu thử ⇒ Mẫu tạo kết tủa trắng là phenol.',
        'Với 2 mẫu còn lại (ethanol, glycerol), nhỏ dung dịch Cu(OH)₂ ở nhiệt độ thường vào.',
        'Mẫu hoà tan Cu(OH)₂ tạo dung dịch màu xanh lam thẫm là glycerol (polyalcohol có các nhóm −OH kề nhau).',
        'Mẫu không có hiện tượng gì (không hoà tan Cu(OH)₂) là ethanol.',
      ],
      answer: 'Dùng nước bromine và Cu(OH)₂',
    },
    checkQuestions: [
      {
        prompt:
          'Thuốc thử nào dùng để phân biệt nhanh glycerol (C₃H₅(OH)₃) và ethanol (C₂H₅OH) ở nhiệt độ thường?',
        choices: [
          { id: 'na', label: 'Kim loại Sodium (Na)' },
          { id: 'cuoh2', label: 'Dung dịch / kết tủa Cu(OH)₂' },
          { id: 'hcl', label: 'Dung dịch HCl' },
        ],
        answer: { kind: 'choice', correctIds: ['cuoh2'] },
        explain:
          'Glycerol là polyalcohol có các nhóm −OH kề nhau, hoà tan Cu(OH)₂ tạo phức xanh lam thẫm. Ethanol không có tính chất này.',
      },
      {
        prompt: 'Chất nào sau đây phản ứng được với cả dung dịch NaOH và nước bromine?',
        choices: [
          { id: 'eth', label: 'Ethanol' },
          { id: 'phe', label: 'Phenol' },
          { id: 'gly', label: 'Glycerol' },
        ],
        answer: { kind: 'choice', correctIds: ['phe'] },
        explain:
          'Phenol có tính axit yếu nên phản ứng được với NaOH, đồng thời có nhân thơm hoạt hoá nên phản ứng được với nước bromine tạo kết tủa trắng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hiện tượng khi glycerol tác dụng với Cu(OH)₂?',
        dap: 'Hoà tan kết tủa tạo dung dịch xanh lam thẫm.',
      },
      {
        hoi: 'Chất nào phản ứng được với dung dịch kiềm NaOH?',
        dap: 'Phenol (axit yếu), còn alcohol thì không.',
      },
      {
        hoi: 'Sản phẩm của phản ứng tách nước alcohol ở 170 °C và 140 °C?',
        dap: '170 °C tạo alkene; 140 °C tạo ether.',
      },
    ],
    reviewStatus: 'draft',
  },
]
