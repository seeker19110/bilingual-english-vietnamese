// lessons/hoa12c5.ts — Hoá học 12, Chương 5: Pin điện và điện phân (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C5_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c5-b15',
    grade: '12',
    chapterNumber: 5,
    chapterTitle: 'Pin điện và điện phân',
    lessonNumber: 15,
    title: 'Thế điện cực và nguồn điện hoá học',
    hook:
      'Pin điện thoại và pin lithium-ion trên xe điện hoạt động dựa trên sự chuyển dịch tự phát của electron' +
      ' giữa hai điện cực. Làm thế nào để ta đo lường và tính toán được hiệu điện thế của nguồn điện này?',
    theory:
      'THẾ ĐIỆN CỰC CHUẨN (E°):\\n' +
      '— Thế điện cực chuẩn của kim loại (E°_Mⁿ⁺/M) đặc trưng cho khả năng khử của kim loại ở trạng thái đơn chất và khả năng oxi hoá của ion kim loại đó trong dung dịch nước ở điều kiện chuẩn.\\n' +
      '— Điện cực chuẩn hydrogen (SHE) được quy ước có thế điện cực bằng 0,00 V ở mọi nhiệt độ.\\n' +
      '— Ý nghĩa: Trị số E° càng âm thì kim loại có tính khử càng mạnh, ion của nó có tính oxi hoá càng yếu; trị số E° càng dương thì kim loại có tính khử càng yếu, ion của nó có tính oxi hoá càng mạnh.\\n\\n' +
      'PIN ĐIỆN HOÁ (Galvanic Cell):\\n' +
      '— Là thiết bị chuyển hoá hoá năng của phản ứng oxi hoá - khử tự phát thành điện năng.\\n' +
      '— Cấu tạo (ví dụ Pin Daniell Zn-Cu):\\n' +
      '  1. Anode (cực âm): làm bằng kim loại có tính khử mạnh hơn (Zn), nơi xảy ra quá trình oxi hoá: Zn → Zn²⁺ + 2e.\\n' +
      '  2. Cathode (cực dương): làm bằng kim loại có tính khử yếu hơn (Cu), nơi xảy ra quá trình khử: Cu²⁺ + 2e → Cu.\\n' +
      '  3. Cầu muối: ngăn hai dung dịch điện li trộn lẫn nhau nhưng cho phép ion di chuyển qua để duy trì trung hoà điện tích.\\n\\n' +
      'SUẤT ĐIỆN ĐỘNG CHUẨN CỦA PIN (E°_pin):\\n' +
      '— Suất điện động chuẩn là hiệu điện thế cực đại giữa hai điện cực của pin điện hoá ở điều kiện chuẩn.\\n' +
      '— Công thức: E°_pin = E°_catot − E°_anot = E°_dương − E°_âm.\\n' +
      '— Ví dụ pin Zn-Cu: E°_pin = E°_Cu²⁺/Cu − E°_Zn²⁺/Zn = 0,34 − (−0,76) = 1,10 V.',
    workedExample: {
      problem:
        'Một pin điện hoá cấu tạo bởi hai cặp oxi hoá - khử chuẩn Fe²⁺/Fe (E° = −0,44 V) và Ag⁺/Ag (E° = 0,80 V). ' +
        'Xác định anode, cathode và tính suất điện động chuẩn E°_pin của pin này.',
      steps: [
        'So sánh thế điện cực chuẩn: E°_Fe²⁺/Fe (−0,44 V) < E°_Ag⁺/Ag (0,80 V).',
        'Cặp có thế điện cực chuẩn nhỏ hơn đóng vai trò là cực âm (Anode): Fe. Quá trình oxi hoá xảy ra tại đây: Fe → Fe²⁺ + 2e.',
        'Cặp có thế điện cực chuẩn lớn hơn đóng vai trò là cực dương (Cathode): Ag. Quá trình khử xảy ra tại đây: Ag⁺ + 1e → Ag.',
        'Áp dụng công thức tính suất điện động chuẩn: E°_pin = E°_catot − E°_anot = E°_Ag⁺/Ag − E°_Fe²⁺/Fe.',
        'Tính toán: E°_pin = 0,80 − (−0,44) = 1,24 V.',
      ],
      answer: 'E°_pin = 1,24 V',
    },
    checkQuestions: [
      {
        prompt: 'Trong pin điện hoá, quá trình oxi hoá xảy ra ở điện cực nào?',
        choices: [
          { id: 'anode', label: 'Anode (cực âm)' },
          { id: 'cathode', label: 'Cathode (cực dương)' },
          { id: 'caumuoi', label: 'Cầu muối' },
        ],
        answer: { kind: 'choice', correctIds: ['anode'] },
        explain:
          'Bất kể trong pin điện hay bình điện phân, ANODE luôn là nơi xảy ra quá trình OXI HOÁ (cực âm trong pin điện hoá).',
      },
      {
        prompt:
          'Tính suất điện động chuẩn E°_pin của pin điện hoá Cu - Ag, biết E°_Cu²⁺/Cu = 0,34 V và E°_Ag⁺/Ag = 0,80 V (V, chỉ nhập số).',
        answer: { kind: 'numeric', value: 0.46 },
        explain: 'Áp dụng công thức: E°_pin = E°_catot − E°_anot = 0,80 − 0,34 = 0,46 V.',
      },
    ],
    srsCards: [
      {
        hoi: 'Suất điện động chuẩn của pin tính bằng công thức nào?',
        dap: 'E°_pin = E°_catot − E°_anot (E°_cực dương − E°_cực âm).',
      },
      {
        hoi: 'Cực dương (cathode) của pin xảy ra quá trình gì?',
        dap: 'Quá trình khử (ion kim loại nhận electron).',
      },
      {
        hoi: 'Vai trò của cầu muối trong pin điện hoá?',
        dap: 'Duy trì sự trung hoà điện tích giữa hai dung dịch điện cực bằng cách cho phép các ion di chuyển qua.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c5-b16',
    grade: '12',
    chapterNumber: 5,
    chapterTitle: 'Pin điện và điện phân',
    lessonNumber: 16,
    title: 'Điện phân',
    hook:
      'Khác với pin điện giải phóng năng lượng hoá học, quá trình điện phân sử dụng năng lượng điện bắt buộc ' +
      'các phản ứng không tự phát xảy ra, giúp ta luyện nhôm, sản xuất khí clo hay mạ vàng đồ trang sức.',
    theory:
      'KHÁI NIỆM ĐIỆN PHÂN:\\n' +
      '— Điện phân là quá trình oxi hoá - khử xảy ra trên bề mặt các điện cực dưới tác dụng của dòng điện một chiều đi qua chất điện li nóng chảy hoặc dung dịch chất điện li.\\n\\n' +
      'SỰ KHÁC BIỆT ĐIỆN CỰC TRONG ĐIỆN PHÂN:\\n' +
      '— Anode (cực dương nối với cực dương nguồn điện): Xảy ra quá trình OXI HOÁ (anion nhường electron).\\n' +
      '— Cathode (cực âm nối với cực âm nguồn điện): Xảy ra quá trình KHỬ (cation nhận electron).\\n\\n' +
      'ĐIỆN PHÂN NÓNG CHẢY (Luyện kim mạnh):\\n' +
      '— Dùng để điều chế các kim loại có tính khử mạnh (như Na, K, Ca, Mg, Al) từ muối halide hoặc oxide nóng chảy.\\n' +
      '   Ví dụ điện phân Al₂O₃ nóng chảy (xúc tác cryolite): 2Al₂O₃ → 4Al (ở cathode) + 3O₂ (ở anode).\\n\\n' +
      'ĐỊNH LUẬT FARADAY VỀ ĐIỆN PHÂN:\\n' +
      '— Khối lượng chất giải phóng ở điện cực tỉ lệ thuận với điện lượng đi qua bình điện phân.\\n' +
      '— Công thức Faraday: m = (A * I * t) / (n * F).\\n' +
      '  Trong đó: m là khối lượng chất giải phóng (gam); A là khối lượng mol nguyên tử của chất (g/mol); I là cường độ dòng điện (Ampere, A); t là thời gian điện phân (giây, s); n là số electron trao đổi của nguyên tử/ion; F là hằng số Faraday (96500 C/mol).',
    workedExample: {
      problem:
        'Điện phân dung dịch CuSO₄ với dòng điện có cường độ I = 2,0 A trong thời gian t = 1930 giây. ' +
        'Tính khối lượng copper (đồng, Cu, M=64) bám vào cathode.',
      steps: [
        'Xác định phản ứng xảy ra ở cathode (cực âm): ion Cu²⁺ nhận 2e để tạo thành kim loại Cu: Cu²⁺ + 2e → Cu. Số electron trao đổi n = 2.',
        'Áp dụng công thức Faraday: m = (A * I * t) / (n * F).',
        'Thay số vào công thức: m = (64 * 2,0 * 1930) / (2 * 96500).',
        'Tính toán: m = 247040 / 193000 = 1,28 gam.',
      ],
      answer: '1,28 gam',
    },
    checkQuestions: [
      {
        prompt: 'Trong bình điện phân, cực âm (cathode) xảy ra quá trình nào sau đây?',
        choices: [
          { id: 'khu', label: 'Quá trình khử (cation nhận electron)' },
          { id: 'oxi', label: 'Quá trình oxi hoá (anion nhường electron)' },
          { id: 'trunghoa', label: 'Sự trung hoà điện tích' },
        ],
        answer: { kind: 'choice', correctIds: ['khu'] },
        explain:
          'Trong mọi bình điện phân, cathode là cực âm, nơi thu hút các cation (+) tới để thực hiện quá trình khử (nhận electron).',
      },
      {
        prompt: 'Hằng số Faraday (F) có giá trị chuẩn bằng bao nhiêu Coulomb/mol?',
        answer: { kind: 'numeric', value: 96500 },
        explain: 'Hằng số Faraday F = 96500 C/mol là điện tích của 1 mol electron.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nguyên tắc điều chế kim loại kiềm, kiềm thổ, nhôm?',
        dap: 'Điện phân nóng chảy hợp chất của chúng (muối clorua, oxit).',
      },
      {
        hoi: 'Anode trong bình điện phân nối với cực nào của nguồn điện?',
        dap: 'Nối với cực dương, xảy ra quá trình oxi hoá.',
      },
      { hoi: 'Công thức Faraday về điện phân?', dap: 'm = (A * I * t) / (n * F).' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c5-b17',
    grade: '12',
    chapterNumber: 5,
    chapterTitle: 'Pin điện và điện phân',
    lessonNumber: 17,
    title: 'Ôn tập chương 5',
    hook:
      'Chương 5 liên kết trực tiếp giữa năng lượng điện và năng lượng hoá học, cung cấp các định luật định lượng ' +
      'chuẩn xác nhất cho công nghiệp điện hoá và sản xuất kim loại.',
    theory:
      'TỔNG KẾT KIẾN THỨC CHƯƠNG 5:\\n' +
      '1. Thế điện cực chuẩn (E°): Chỉ số so sánh độ mạnh/yếu của cặp oxi hoá - khử so với SHE (0,00 V). E° âm hơn → kim loại tính khử mạnh hơn. E° dương hơn → ion tính oxi hoá mạnh hơn.\\n' +
      '2. Pin điện hoá: Phản ứng tự phát phát ra dòng điện. E°_pin = E°_catot − E°_anot (luôn dương). Cực âm (anode) oxi hoá, cực dương (catot) khử.\\n' +
      '3. Điện phân: Cưỡng bức bằng dòng điện. Cực dương (anode) oxi hoá, cực âm (catot) khử. Điện phân dung dịch NaCl có màng ngăn tạo NaOH, Cl₂ (anode), H₂ (catot).\\n' +
      '4. Định luật Faraday: m = A·I·t / (n·F). Tính khối lượng chất thoát ra ở các điện cực.',
    workedExample: {
      problem:
        'Tính suất điện động chuẩn E°_pin của pin điện hoá tạo bởi cặp Fe²⁺/Fe (E° = −0,44 V) và Cu²⁺/Cu (E° = 0,34 V).',
      steps: [
        'Cực âm (anode) của pin có thế điện cực nhỏ hơn: Fe (E° = −0,44 V).',
        'Cực dương (cathode) của pin có thế điện cực lớn hơn: Cu (E° = 0,34 V).',
        'Áp dụng công thức suất điện động chuẩn của pin: E°_pin = E°_catot − E°_anot.',
        'Tính toán: E°_pin = 0,34 − (−0,44) = 0,78 V.',
      ],
      answer: 'E°_pin = 0,78 V',
    },
    checkQuestions: [
      {
        prompt:
          'Khi điện phân dung dịch NaCl bão hoà có màng ngăn điện cực, sản phẩm thu được ở cực dương (anode) là khí nào?',
        choices: [
          { id: 'h2', label: 'Khí hydrogen (H₂)' },
          { id: 'cl2', label: 'Khí chlorine (Cl₂)' },
          { id: 'o2', label: 'Khí oxygen (O₂)' },
        ],
        answer: { kind: 'choice', correctIds: ['cl2'] },
        explain:
          'Ở cực dương (anode), ion Cl⁻ bị oxi hoá giải phóng khí Cl₂. Ở cực âm (cathode), nước bị khử giải phóng khí H₂ và tạo OH⁻.',
      },
      {
        prompt: 'Kim loại nào sau đây chỉ có thể điều chế bằng phương pháp điện phân nóng chảy?',
        choices: [
          { id: 'cu', label: 'Copper (Cu)' },
          { id: 'fe', label: 'Iron (Fe)' },
          { id: 'al', label: 'Aluminium (Al)' },
          { id: 'ag', label: 'Silver (Ag)' },
        ],
        answer: { kind: 'choice', correctIds: ['al'] },
        explain:
          'Aluminium (Al) có tính khử mạnh, các phương pháp thuỷ luyện hoặc nhiệt luyện không khử được ion Al³⁺. Phải dùng điện phân nóng chảy oxit Al₂O₃.',
      },
    ],
    srsCards: [
      {
        hoi: 'Suất điện động của pin điện hoá có bao giờ âm không?',
        dap: 'Không. Suất điện động chuẩn E°_pin của pin điện hoá luôn là một giá trị dương.',
      },
      {
        hoi: 'Tại sao điện phân dung dịch muối ăn cần màng ngăn giữa hai điện cực?',
        dap: 'Để ngăn khí Cl₂ ở cực dương phản ứng với NaOH sinh ra ở cực âm (nếu không có màng ngăn sẽ tạo ra nước Javel).',
      },
      {
        hoi: 'Đơn vị đo cường độ dòng điện I và thời gian t trong công thức Faraday?',
        dap: 'Cường độ dòng điện I tính bằng Ampere (A); thời gian t tính bằng giây (s).',
      },
    ],
    reviewStatus: 'draft',
  },
]
