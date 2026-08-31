// lessons/hoa12c7.ts — Hoá học 12, Chương 7: Nguyên tố nhóm IA và nhóm IIA (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C7_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c7-b24',
    grade: '12',
    chapterNumber: 7,
    chapterTitle: 'Nguyên tố nhóm IA và nhóm IIA',
    lessonNumber: 24,
    title: 'Nguyên tố nhóm IA',
    hook:
      'Lithium vận hành pin điện thoại, Sodium (Natri) là thành phần cấu tạo muối ăn hằng ngày.' +
      ' Các kim loại kiềm này có hoạt tính hoá học cực mạnh, có thể bốc cháy hoặc nổ tung khi gặp nước.',
    theory:
      'VỊ TRÍ VÀ CẤU TẠO:\\n' +
      '— Nhóm IA (kim loại kiềm) gồm: Lithium (Li), Sodium (Na), Potassium (K), Rubidium (Rb), Cesium (Cs). Nguyên tử của chúng đều có 1 electron ở lớp ngoài cùng (ns¹).\\n\\n' +
      'TÍNH CHẤT VẬT LÍ:\\n' +
      '— Có nhiệt độ nóng chảy, nhiệt độ sôi thấp, khối lượng riêng nhỏ (Li nhẹ nhất trong các kim loại rắn) và độ cứng thấp (mềm, cắt được bằng dao) do liên kết kim loại trong mạng tinh thể lập phương tâm khối khá yếu.\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC (Tính khử cực kì mạnh, tăng dần từ Li đến Cs):\\n' +
      '— Trong các phản ứng, chúng dễ dàng nhường 1e để đạt cấu hình khí hiếm bền vững, thể hiện số oxi hoá +1.\\n' +
      '1. Tác dụng với nước: Phản ứng mãnh liệt ở nhiệt độ thường giải phóng khí H₂ và tạo dung dịch kiềm mạnh: 2M + 2H₂O → 2M⁺ + 2OH⁻ + H₂↑. Vì thế, kim loại kiềm phải được bảo quản bằng cách ngâm ngập trong dầu hoả khan.\\n' +
      '2. Tác dụng với phi kim: Bốc cháy trong khí chlorine, phản ứng mạnh với oxygen tạo oxit hoặc peroxide.\\n\\n' +
      'MỘT SỐ HỢP CHẤT QUAN TRỌNG:\\n' +
      '— NaOH (caustic soda): Chất rắn màu trắng, hút ẩm mạnh, kiềm mạnh dùng trong dệt nhuộm, xà phòng.\\n' +
      '— NaHCO₃ (baking soda): Chất bột trắng, dùng làm bột nở, thuốc đau dạ dày do thừa axit (phản ứng trung hoà nhẹ). Bị nhiệt phân huỷ: 2NaHCO₃ → Na₂CO₃ + CO₂↑ + H₂O (t°).\\n' +
      '— Na₂CO₃ (soda): Hoá chất cơ bản dùng sản xuất thuỷ tinh, bột giặt, giấy.',
    workedExample: {
      problem:
        'Cho 4,6 gam kim loại Sodium (Na, M=23) phản ứng hoàn toàn với nước dư. ' +
        'Tính thể tích khí H₂ thoát ra ở điều kiện chuẩn (25 °C, 1 bar, thể tích mol 24,79 L/mol).',
      steps: [
        'Tính số mol Na: n = 4,6 / 23 = 0,2 mol.',
        'Viết phương trình phản ứng: 2Na + 2H₂O → 2NaOH + H₂↑.',
        'Theo tỉ lệ phương trình, số mol H₂ thu được bằng một nửa số mol Na phản ứng.',
        'Tính số mol H₂: nH₂ = 0,2 / 2 = 0,1 mol.',
        'Tính thể tích khí H₂ ở đkc: V = 0,1 * 24,79 = 2,479 L.',
      ],
      answer: '2,479 L',
    },
    checkQuestions: [
      {
        prompt:
          'Để bảo quản các kim loại kiềm như Sodium (Na) và Potassium (K) tránh tiếp xúc với không khí ẩm, người ta ngâm chúng trong chất lỏng nào sau đây?',
        choices: [
          { id: 'nuoc', label: 'Nước nguyên chất' },
          { id: 'dauhoa', label: 'Dầu hoả khan' },
          { id: 'ruou', label: 'Cồn cồn ethanol' },
        ],
        answer: { kind: 'choice', correctIds: ['dauhoa'] },
        explain:
          'Kim loại kiềm phản ứng mãnh liệt với nước và cả alcohol. Chúng không phản ứng với hydrocacbon trong dầu hoả nên được bảo quản bằng cách ngâm ngập trong dầu hoả.',
      },
      {
        prompt:
          'Khi đun nóng chất rắn sodium hydrogencarbonate (NaHCO₃), sản phẩm phân huỷ khí sinh ra là gì?',
        choices: [
          { id: 'o2', label: 'Khí oxygen (O₂)' },
          { id: 'co2', label: 'Khí carbon dioxide (CO₂)' },
          { id: 'h2', label: 'Khí hydrogen (H₂)' },
        ],
        answer: { kind: 'choice', correctIds: ['co2'] },
        explain:
          'Phản ứng nhiệt phân baking soda giải phóng khí CO₂ và hơi nước: 2NaHCO₃ → Na₂CO₃ + CO₂↑ + H₂O.',
      },
    ],
    srsCards: [
      {
        hoi: 'Các kim loại nhóm IA có mấy electron lớp ngoài cùng?',
        dap: 'Có 1 electron ở phân lớp ns¹.',
      },
      {
        hoi: 'Tại sao kim loại kiềm mềm và có nhiệt độ nóng chảy thấp?',
        dap: 'Do liên kết kim loại yếu trong cấu trúc mạng lập phương tâm khối.',
      },
      {
        hoi: 'Ứng dụng chính của NaHCO₃?',
        dap: 'Làm bột nở (baking soda), thuốc chữa đau dạ dày do thừa axit.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c7-b25',
    grade: '12',
    chapterNumber: 7,
    chapterTitle: 'Nguyên tố nhóm IA và nhóm IIA',
    lessonNumber: 25,
    title: 'Nguyên tố nhóm IIA',
    hook:
      'Canxi (Calcium) cấu tạo nên bộ xương chắc khoẻ của chúng ta và kiến tạo nên những hang động đá vôi kỳ vĩ.' +
      ' Các kim loại kiềm thổ này ẩn chứa nhiều quy luật hoá học lý thú.',
    theory:
      'VỊ TRÍ VÀ CẤU TẠO:\\n' +
      '— Nhóm IIA (kim loại kiềm thổ) gồm: Beryllium (Be), Magnesium (Mg), Calcium (Ca), Strontium (Sr), Barium (Ba). Có 2 electron ở lớp ngoài cùng (ns²).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC (Tính khử mạnh, tăng dần từ Be đến Ba):\\n' +
      '— Nhường 2e trong các phản ứng hoá học, đạt số oxi hoá +2.\\n' +
      '— Phản ứng với nước: Be không phản ứng; Mg phản ứng rất chậm với nước nóng; Ca, Sr, Ba phản ứng mạnh với nước ở nhiệt độ thường tạo dung dịch base: Ca + 2H₂O → Ca(OH)₂ + H₂↑.\\n\\n' +
      'SỰ TẠO THÀNH THẠCH NHŨ HANG ĐỘNG:\\n' +
      '— Giải thích bằng phản ứng thuận nghịch: CaCO₃ + CO₂ + H₂O ⇌ Ca(HCO₃)₂.\\n' +
      '   — Chiều thuận (đun nóng hoặc nhiều CO₂ trong nước mưa): Hoà tan đá vôi tạo hang động.\\n' +
      '   — Chiều nghịch (nhiệt độ giảm, áp suất CO₂ giảm): Kết tủa lại CaCO₃ tạo nên các măng đá, thạch nhũ lấp lánh.\\n\\n' +
      'NƯỚC CỨNG (Hard Water):\\n' +
      '— Định nghĩa: Là nước chứa nhiều ion Ca²⁺ và Mg²⁺ (nước chứa ít hoặc không chứa các ion này gọi là nước mềm).\\n' +
      '— Phân loại:\\n' +
      '  1. Nước cứng tạm thời: Chứa các muối Ca(HCO₃)₂ và Mg(HCO₃)₂. Gọi là tạm thời vì có thể loại bỏ tính cứng đơn giản bằng cách đun sôi (muối hidrocacbonate bị nhiệt phân tạo kết tủa CaCO₃/MgCO₃).\\n' +
      '  2. Nước cứng vĩnh cửu: Chứa các ion Ca²⁺, Mg²⁺ cùng với các anion Cl⁻, SO₄²⁻. Đun sôi không làm mất tính cứng.\\n' +
      '  3. Nước cứng toàn phần: Gồm cả tính cứng tạm thời và vĩnh cửu.\\n' +
      '— Phương pháp làm mềm nước cứng: Phương pháp kết tủa (dùng các chất kiềm vừa đủ hoặc Na₂CO₃, Na₃PO₄ để tạo kết tủa lọc bỏ) và Phương pháp trao đổi ion (dùng hạt nhựa zeolite thế ion Ca²⁺/Mg²⁺ bằng Na⁺/H⁺).',
    workedExample: {
      problem:
        'Giải thích vì sao đun sôi nước có thể làm mềm nước cứng tạm thời, và viết phương trình minh hoạ.',
      steps: [
        'Nước cứng tạm thời chứa các muối calcium hydrogencarbonate Ca(HCO₃)₂ và magnesium hydrogencarbonate Mg(HCO₃)₂ tan được trong nước.',
        'Khi đun sôi nước, nhiệt độ cao làm phân huỷ các muối hydrogencarbonate kém bền nhiệt tạo thành muối carbonate kết tủa không tan:\\n  Ca(HCO₃)₂ → CaCO₃↓ + CO₂↑ + H₂O (t°).\\n  Mg(HCO₃)₂ → MgCO₃↓ + CO₂↑ + H₂O (t°).',
        'Lọc bỏ các chất kết tủa lắng xuống đáy, ta loại bỏ được phần lớn các ion Ca²⁺ và Mg²⁺ ra khỏi dung dịch nước.',
        'Nước sau đun sôi trở thành nước mềm.',
      ],
      answer: 'Do nhiệt phân muối hydrogencarbonate tạo kết tủa',
    },
    checkQuestions: [
      {
        prompt: 'Nước cứng là nước chứa nhiều loại ion nào sau đây?',
        choices: [
          { id: 'na_k', label: 'Sodium (Na⁺) và Potassium (K⁺)' },
          { id: 'ca_mg', label: 'Calcium (Ca²⁺) và Magnesium (Mg²⁺)' },
          { id: 'fe_al', label: 'Iron (Fe³⁺) và Aluminium (Al³⁺)' },
        ],
        answer: { kind: 'choice', correctIds: ['ca_mg'] },
        explain: 'Theo định nghĩa, nước cứng là nước có chứa hàm lượng cao các ion Ca²⁺ và Mg²⁺.',
      },
      {
        prompt:
          'Hoá chất nào sau đây có thể dùng để làm mềm cả nước cứng tạm thời và nước cứng vĩnh cửu bằng phương pháp kết tủa?',
        choices: [
          { id: 'hcl', label: 'Dung dịch acid HCl' },
          { id: 'na2co3', label: 'Dung dịch Sodium carbonate (Na₂CO₃)' },
          { id: 'nacl', label: 'Dung dịch muối ăn NaCl' },
        ],
        answer: { kind: 'choice', correctIds: ['na2co3'] },
        explain:
          'Na₂CO₃ cung cấp ion CO₃²⁻. Ion này kết hợp với Ca²⁺ và Mg²⁺ tạo kết tủa CaCO₃ và MgCO₃ không tan kể cả trong nước cứng vĩnh cửu, giúp làm mềm nước.',
      },
    ],
    srsCards: [
      { hoi: 'Kim loại nào thuộc nhóm IIA không phản ứng với nước?', dap: 'Beryllium (Be).' },
      {
        hoi: 'Phản ứng giải thích sự xâm thực đá vôi của nước mưa tạo hang động?',
        dap: 'CaCO₃ + CO₂ + H₂O ⇌ Ca(HCO₃)₂ (chiều thuận).',
      },
      {
        hoi: 'Thế nào là nước cứng vĩnh cửu?',
        dap: 'Nước chứa ion Ca²⁺, Mg²⁺ cùng với ion Cl⁻ hoặc SO₄²⁻.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c7-b26',
    grade: '12',
    chapterNumber: 7,
    chapterTitle: 'Nguyên tố nhóm IA và nhóm IIA',
    lessonNumber: 26,
    title: 'Ôn tập chương 7',
    hook:
      'Chương 7 đúc kết các thuộc tính hoá học của hai nhóm kim loại hoạt động mạnh mẽ nhất bảng tuần hoàn, ' +
      'ứng dụng thực tế của kiềm và các kỹ thuật xử lý nước cứng trong đời sống.',
    theory:
      'TỔNG KẾT KIẾN THỨC CHƯƠNG 7:\\n' +
      '1. Kim loại kiềm (nhóm IA): Li, Na, K, Rb, Cs. Cấu hình ns¹. Hoạt tính cực mạnh, phản ứng mãnh liệt với nước tạo dung dịch kiềm mạnh và H₂. Bảo quản bằng cách ngâm dầu hoả. NaOH là kiềm mạnh; NaHCO₃ có tính lưỡng tính yếu, bị nhiệt phân giải phóng CO₂; Na₂CO₃ dùng làm mềm nước và sản xuất thuỷ tinh.\\n' +
      '2. Kim loại kiềm thổ (nhóm IIA): Be, Mg, Ca, Sr, Ba. Cấu hình ns². Be trơ với nước, Mg phản ứng nóng, Ca/Sr/Ba phản ứng nguội. Phản ứng xâm thực đá vôi và tạo thạch nhũ hang động là phản ứng thuận nghịch của hệ CaCO₃/Ca(HCO₃)₂.\\n' +
      '3. Nước cứng: Chứa nhiều Ca²⁺, Mg²⁺. Tạm thời (chứa HCO₃⁻, đun sôi làm mềm được). Vĩnh cửu (chứa Cl⁻, SO₄²⁻, đun sôi không làm mềm được). Làm mềm bằng cách dùng kết tủa (Na₂CO₃, Na₃PO₄) hoặc dùng nhựa trao đổi ion.',
    workedExample: {
      problem:
        'Cần thêm tối thiểu bao nhiêu gam dung dịch sodium carbonate Na₂CO₃ 10,6% vào nước cứng chứa ' +
        '0,01 mol ion Ca²⁺ để kết tủa hoàn toàn ion này?',
      steps: [
        'Viết phương trình phản ứng tạo kết tủa: Ca²⁺ + CO₃²⁻ → CaCO₃↓.',
        'Theo phương trình, số mol ion CO₃²⁻ cần dùng bằng số mol Ca²⁺ = 0,01 mol.',
        'Nguồn cung cấp CO₃²⁻ là muối Na₂CO₃, số mol Na₂CO₃ cần = 0,01 mol.',
        'Tính khối lượng chất tan Na₂CO₃ (M=106) cần dùng: m = 0,01 * 106 = 1,06 gam.',
        'Tính khối lượng dung dịch Na₂CO₃ 10,6% cần dùng: m_dd = m * 100 / 10,6 = 1,06 * 100 / 10,6 = 10 gam.',
      ],
      answer: '10 gam',
    },
    checkQuestions: [
      {
        prompt:
          'Trong các kim loại kiềm thổ sau, kim loại nào phản ứng mãnh liệt nhất với nước ở nhiệt độ thường?',
        choices: [
          { id: 'be', label: 'Beryllium (Be)' },
          { id: 'mg', label: 'Magnesium (Mg)' },
          { id: 'ba', label: 'Barium (Ba)' },
        ],
        answer: { kind: 'choice', correctIds: ['ba'] },
        explain:
          'Tính khử của kim loại kiềm thổ tăng dần từ Be đến Ba. Barium phản ứng mãnh liệt nhất với nước trong nhóm IIA ở nhiệt độ thường.',
      },
      {
        prompt: 'Chất nào sau đây không thể dùng để làm mềm nước cứng tạm thời?',
        choices: [
          { id: 'na2co3', label: 'Na₂CO₃' },
          { id: 'hcl', label: 'HCl' },
          { id: 'caoh2', label: 'Ca(OH)₂ (vừa đủ)' },
          { id: 'na3po4', label: 'Na₃PO₄' },
        ],
        answer: { kind: 'choice', correctIds: ['hcl'] },
        explain:
          'Axit HCl tác dụng với muối hydrogencarbonate giải phóng CO₂ nhưng không làm kết tủa ion Ca²⁺/Mg²⁺, ngược lại còn làm tăng nồng độ anion Cl⁻ trong nước, không làm mềm nước.',
      },
    ],
    srsCards: [
      { hoi: 'Muối baking soda có công thức hoá học là gì?', dap: 'NaHCO₃.' },
      {
        hoi: 'Măng đá, thạch nhũ cấu tạo chủ yếu từ hợp chất nào?',
        dap: 'Calcium carbonate (CaCO₃).',
      },
      {
        hoi: 'Hai phương pháp chính làm mềm nước cứng?',
        dap: 'Phương pháp kết tủa hoá học và phương pháp trao đổi ion.',
      },
    ],
    reviewStatus: 'draft',
  },
]
