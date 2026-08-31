// lessons/ly12c4.ts — Vật lí 12, Chương 4: Vật lí hạt nhân (6 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY12_C4_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly12-c4-b20',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 20,
    title: 'Khái niệm sơ lược về hạt nhân. Cấu trúc hạt nhân',
    hook: 'Tại tâm của mỗi nguyên tử có một hạt nhân vô cùng nhỏ bé và đậm đặc, chiếm tới hơn 99.9% khối lượng nguyên tử nhưng kích thước chỉ bằng một phần một trăm nghìn kích thước nguyên tử.',
    theory:
      'KÍCH THƯỚC HẠT NHÂN:\\n' +
      '— Hạt nhân nguyên tử có kích thước rất nhỏ so với kích thước nguyên tử (khoảng 10⁵ lần nhỏ hơn).\\n' +
      '— Bán kính hạt nhân R được ước lượng phụ thuộc vào số khối A theo công thức: R ≈ 1.2 * 10⁻¹⁵ * A^(1/3) (m).\\n\\n' +
      'CẤU TẠO HẠT NHÂN:\\n' +
      '— Hạt nhân được cấu tạo từ các hạt nucleon, gồm hai loại:\\n' +
      '  1. Proton (ký hiệu là p): mang điện tích dương +e (e ≈ 1.6 * 10⁻¹⁹ C), khối lượng mp ≈ 1.00728 amu.\\n' +
      '  2. Neutron (ký hiệu là n): không mang điện, khối lượng mn ≈ 1.00866 amu.\\n' +
      '— Kí hiệu hạt nhân: _Z^A X\\n' +
      '  + X: tên nguyên tố.\\n' +
      '  + Z: số hiệu nguyên tử (số proton, số điện tích hạt nhân, số thứ tự trong bảng tuần hoàn).\\n' +
      '  + A: số khối (tổng số nucleon).\\n' +
      '— Số neutron trong hạt nhân là N = A - Z.\\n\\n' +
      'ĐỒNG VỊ:\\n' +
      '— Các hạt nhân của cùng một nguyên tố có cùng số proton Z nhưng khác nhau số neutron N (dẫn đến số khối A khác nhau) gọi là các đồng vị.\\n' +
      '— Ví dụ: Hiđrô có 3 đồng vị là Hiđrô thường _1^1 H, Đơteri _1^2 H (kí hiệu là D) và Triti _1^3 H (kí hiệu là T).',
    workedExample: {
      problem:
        'Xác định số proton và số neutron của các hạt nhân sau: hạt nhân Cacbon _6^{14}C và hạt nhân Urani _{92}^{235}U.',
      steps: [
        'Dùng kí hiệu chuẩn _Z^A X để đọc các chỉ số.',
        'Với Cacbon _6^{14}C: chỉ số dưới Z = 6 => số proton = 6; chỉ số trên A = 14 => số neutron N = 14 - 6 = 8.',
        'Với Urani _{92}^{235}U: chỉ số dưới Z = 92 => số proton = 92; chỉ số trên A = 235 => số neutron N = 235 - 92 = 143.',
      ],
      answer: 'Cacbon-14: 6p, 8n. Urani-235: 92p, 143n.',
    },
    checkQuestions: [
      {
        prompt: 'Trong kí hiệu hạt nhân _Z^A X, số neutron được xác định bằng công thức:',
        choices: [
          { id: 'n_1', label: 'A - Z' },
          { id: 'n_2', label: 'A + Z' },
          { id: 'n_3', label: 'Z' },
          { id: 'n_4', label: 'A' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['n_1'],
        },
        explain: 'Số khối A bằng tổng số proton Z và số neutron N. Do đó N = A - Z.',
      },
      {
        prompt: 'Hạt nhân nguyên tử Urani _92^238 U có số proton là bao nhiêu?',
        answer: {
          kind: 'numeric',
          value: 92,
        },
        explain: 'Chỉ số dưới Z = 92 đại diện cho số proton của hạt nhân.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nucleon gồm những hạt nào?',
        dap: 'Gồm proton (mang điện +e) và neutron (không mang điện).',
      },
      {
        hoi: 'Đồng vị là gì?',
        dap: 'Các hạt nhân của cùng một nguyên tố có cùng số proton Z nhưng khác nhau số neutron N.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c4-b21',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 21,
    title: 'Lực hạt nhân. Năng lượng liên kết hạt nhân',
    hook: 'Các hạt proton trong hạt nhân đều mang điện tích dương và đẩy nhau bằng một lực tĩnh điện cực mạnh. Lực nào đã thắng lực đẩy này để giữ chúng liên kết chặt chẽ trong hạt nhân? Đó là lực hạt nhân.',
    theory:
      'LỰC HẠT NHÂN (LỰC TƯƠNG TÁC MẠNH):\\n' +
      '— Lực hạt nhân: Là lực hút gắn kết các nucleon trong hạt nhân để tạo thành một cấu trúc bền vững.\\n' +
      '— Đặc điểm:\\n' +
      '  + Không có cùng bản chất với lực tĩnh điện hay lực hấp dẫn.\\n  + Là lực tương tác ngắn, chỉ có tác dụng trong phạm vi kích thước hạt nhân (khoảng 10⁻¹⁵ m).\\n  + Không phụ thuộc vào điện tích của nucleon (lực hút giữa p-p, n-n, p-n có độ lớn như nhau).\\n\\n' +
      'ĐỘ HỤT KHỐI (delta m):\\n' +
      '— Khối lượng của một hạt nhân luôn nhỏ hơn tổng khối lượng của các nucleon cấu tạo nên nó một lượng là delta m:\\n' +
      '  dm = [Z * mp + (A - Z) * mn] - m_hn > 0\\n\\n' +
      'NĂNG LƯỢNG LIÊN KẾT (Elk):\\n' +
      '— Năng lượng liên kết: Là năng lượng toả ra khi các nucleon liên kết lại với nhau tạo thành hạt nhân, hoặc năng lượng tối thiểu cần cung cấp để tách hạt nhân thành các nucleon riêng rẽ.\\n' +
      '  Elk = dm * c²\\n' +
      '— Nếu dm tính bằng đơn vị amu thì Elk = dm * 931.5 (MeV) (với 1 amu * c² ≈ 931.5 MeV).\\n\\n' +
      'NĂNG LƯỢNG LIÊN KẾT RIÊNG (Elkr):\\n' +
      '— Năng lượng liên kết riêng: Là năng lượng liên kết tính trên một nucleon:\\n' +
      '  Elkr = Elk / A\\n' +
      '— Năng lượng liên kết riêng đặc trưng cho mức độ bền vững của hạt nhân. Hạt nhân có năng lượng liên kết riêng càng lớn thì càng bền vững (các hạt nhân bền vững nhất ở giữa bảng tuần hoàn có 50 < A < 80, ví dụ Fe-56).',
    workedExample: {
      problem:
        'Tính năng lượng liên kết của hạt nhân Heli _2^4 He. Biết khối lượng hạt nhân Heli là 4.0015 amu, khối lượng proton là 1.00728 amu, khối lượng neutron là 1.00866 amu và 1 amu.c² = 931.5 MeV.',
      steps: [
        'Tính độ hụt khối delta m: dm = [2 * mp + 2 * mn] - m_He = [2 * 1.00728 + 2 * 1.00866] - 4.0015.',
        'Tính toán độ hụt khối: dm = 2.01456 + 2.01732 - 4.0015 = 0.03038 amu.',
        'Tính năng lượng liên kết Elk: Elk = dm * 931.5 = 0.03038 * 931.5.',
        'Kết quả: Elk ≈ 28.3 MeV.',
      ],
      answer: 'Elk = 28.3 MeV.',
    },
    checkQuestions: [
      {
        prompt: 'Đại lượng nào sau đây quyết định mức độ bền vững của một hạt nhân nguyên tử?',
        choices: [
          { id: 'bv_1', label: 'Năng lượng liên kết riêng' },
          { id: 'bv_2', label: 'Năng lượng liên kết' },
          { id: 'bv_3', label: 'Độ hụt khối' },
          { id: 'bv_4', label: 'Số lượng neutron trong hạt nhân' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['bv_1'],
        },
        explain:
          'Hạt nhân có năng lượng liên kết riêng (năng lượng liên kết chia cho số khối A) càng lớn thì hạt nhân đó càng bền vững.',
      },
      {
        prompt:
          'Tính độ hụt khối (theo đơn vị amu) của hạt nhân Heli _2^4He biết khối lượng hạt nhân Heli là 4.0015 amu, ' +
          'khối lượng proton mp = 1.00728 amu, khối lượng neutron mn = 1.00866 amu.',
        answer: {
          kind: 'numeric',
          value: 0.03038,
          unit: 'amu',
        },
        explain: 'dm = 2 * mp + 2 * mn - m_He = 2 * 1.00728 + 2 * 1.00866 - 4.0015 = 0.03038 amu.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phạm vi tác dụng của lực hạt nhân?',
        dap: 'Ngắn, chỉ khoảng kích thước hạt nhân (10^-15 m).',
      },
      {
        hoi: 'Năng lượng liên kết riêng đặc trưng cho điều gì của hạt nhân?',
        dap: 'Mức độ bền vững của hạt nhân.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c4-b22',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 22,
    title: 'Phản ứng hạt nhân. Định luật bảo toàn trong phản ứng hạt nhân',
    hook:
      'Trong các phản ứng hoá học, các nguyên tử chỉ sắp xếp lại liên kết và giữ nguyên bản chất. ' +
      'Nhưng trong phản ứng hạt nhân, các nguyên tố có thể biến đổi hoàn toàn thành các nguyên tố khác, giải phóng nguồn năng lượng khổng lồ.',
    theory:
      'PHÂN LOẠI PHẢN ỨNG HẠT NHÂN:\\n' +
      '— Phản ứng tự phát: Quá trình phân rã của một hạt nhân không bền vững tự động biến đổi thành hạt nhân khác (phóng xạ).\\n' +
      '— Phản ứng kích thích: Quá trình các hạt nhân tương tác với nhau để biến đổi thành các hạt nhân khác.\\n\\n' +
      'CÁC ĐỊNH LUẬT BẢO TOÀN TRONG PHẢN ỨNG HẠT NHÂN:\\n' +
      'Xét phản ứng: A1_Z1 A + A2_Z2 B -> A3_Z3 C + A4_Z4 D\\n' +
      '— Định luật bảo toàn số khối (số nucleon): A1 + A2 = A3 + A4\\n' +
      '— Định luật bảo toàn điện tích (số hiệu Z): Z1 + Z2 = Z3 + Z4\\n' +
      '— Định luật bảo toàn động lượng: p_A + p_B = p_C + p_D\\n' +
      '— Định luật bảo toàn năng lượng toàn phần.\\n' +
      '— Chú ý: Không có định luật bảo toàn khối lượng nghỉ, không bảo toàn số hạt proton hay neutron riêng rẽ.\\n\\n' +
      'NĂNG LƯỢNG PHẢN ỨNG HẠT NHÂN (delta E):\\n' +
      '  dE = (m_truoc - m_sau) * c²\\n' +
      '— dE > 0: Phản ứng toả năng lượng.\\n' +
      '— dE < 0: Phản ứng thu năng lượng.',
    workedExample: {
      problem:
        'Hoàn thành phương trình phản ứng hạt nhân sau và xác định số proton Z, số khối A của hạt nhân X:\n' +
        '_2^4 He + _7^{14} N -> _1^1 H + _Z^A X',
      steps: [
        'Áp dụng định luật bảo toàn số khối A: 4 + 14 = 1 + A => A = 17.',
        'Áp dụng định luật bảo toàn điện tích Z: 2 + 7 = 1 + Z => Z = 8.',
        'Xác định nguyên tố: Z = 8 tương ứng với Oxi (O).',
        'Kết quả: Hạt nhân X là đồng vị Oxi-17 (_8^{17}O).',
      ],
      answer: 'Z = 8, A = 17, X là Oxi (O).',
    },
    checkQuestions: [
      {
        prompt: 'Đại lượng nào sau đây KHÔNG được bảo toàn trong các phản ứng hạt nhân?',
        choices: [
          { id: 'bt_1', label: 'Tổng khối lượng nghỉ của hệ' },
          { id: 'bt_2', label: 'Tổng điện tích của hệ' },
          { id: 'bt_3', label: 'Tổng số nucleon (số khối)' },
          { id: 'bt_4', label: 'Tổng động lượng của hệ' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['bt_1'],
        },
        explain:
          'Khối lượng nghỉ không được bảo toàn. Hiệu số khối lượng nghỉ trước và sau phản ứng quyết định năng lượng toả ra hay thu vào.',
      },
      {
        prompt:
          'Trong phản ứng hạt nhân: _0^1 n + _92^235 U -> _38^94 Sr + _Z^A Xe + 2 _0^1 n, ' +
          'số khối A của hạt nhân Xenon (Xe) bằng bao nhiêu?',
        answer: {
          kind: 'numeric',
          value: 140,
        },
        explain:
          'Bảo toàn số khối: 1 + 235 = 94 + A + 2 * 1 => 236 = 96 + A => A = 236 - 96 = 140.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nêu 4 định luật bảo toàn trong phản ứng hạt nhân?',
        dap: 'Bảo toàn số khối, điện tích, động lượng và năng lượng toàn phần.',
      },
      {
        hoi: 'Phản ứng hạt nhân có bảo toàn khối lượng nghỉ không?',
        dap: 'Không bảo toàn khối lượng nghỉ.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c4-b23',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 23,
    title: 'Hiện tượng phóng xạ',
    hook: 'Vào cuối thế kỷ 19, Marie Curie và các nhà khoa học phát hiện ra rằng một số nguyên tố nặng có thể tự phát ra các tia bức xạ mắt thường không nhìn thấy được và biến đổi thành nguyên tố khác. Hiện tượng tự phát này được gọi là phóng xạ.',
    theory:
      'ĐỊNH NGHĨA HIỆN TƯỢNG PHÓNG XẠ:\\n' +
      '— Phóng xạ: Là quá trình phân rã tự phát của một hạt nhân không bền vững thành hạt nhân khác, đồng thời phát ra các tia phóng xạ.\\n\\n' +
      'CÁC DẠNG TIA PHÓNG XẠ CHÍNH:\\n' +
      '— Phóng xạ Alpha (alpha): Phát ra hạt nhân Heli _2^4 He. Phương trình: _Z^A X -> _(Z-2)^(A-4) Y + _2^4 He. Đâm xuyên yếu, bị lệch trong điện trường.\\n' +
      '— Phóng xạ Beta (beta):\\n' +
      '  + Beta trừ: phát ra hạt electron e-. _Z^A X -> _(Z+1)^A Y + e-.\\n  + Beta cộng: phát ra hạt positron e+. _Z^A X -> _(Z-1)^A Y + e+.\\n  + Đâm xuyên trung bình, bị lệch mạnh trong điện trường.\\n' +
      '— Phóng xạ Gamma (gamma): Bức xạ điện từ bước sóng cực ngắn (photon năng lượng cao). Không làm thay đổi cấu trúc hạt nhân, không bị lệch trong điện trường, đâm xuyên rất mạnh.\\n\\n' +
      'ĐỊNH LUẬT PHÓNG XẠ:\\n' +
      'Số hạt nhân (hoặc khối lượng) còn lại sau thời gian t:\\n' +
      '  N(t) = N0 * 2^(-t/T) = N0 * e^(-lambda * t)\\n' +
      '  m(t) = m0 * 2^(-t/T) = m0 * e^(-lambda * t)\\n' +
      'Trong đó T là chu kì bán rã, lambda = ln 2 / T ≈ 0.693 / T là hằng số phóng xạ.',
    workedExample: {
      problem:
        'Chất phóng xạ Iốt _{53}^{131}I có chu kì bán rã T = 8 ngày. ' +
        'Nếu ban đầu có 100 g chất này thì sau 24 ngày khối lượng Iốt còn lại là bao nhiêu gam?',
      steps: [
        'Xác định thông số ban đầu: m0 = 100 g, T = 8 ngày, thời gian phân rã t = 24 ngày.',
        'Tính số chu kì bán rã đã trôi qua: k = t / T = 24 / 8 = 3.',
        'Áp dụng công thức định luật phóng xạ: m = m0 * 2^(-k).',
        'Tính toán: m = 100 * 2^(-3) = 100 / 8 = 12.5 g.',
      ],
      answer: 'm = 12.5 g.',
    },
    checkQuestions: [
      {
        prompt: 'Dạng bức xạ phóng xạ nào không mang điện tích và có khả năng đâm xuyên mạnh nhất?',
        choices: [
          { id: 'px_1', label: 'Phóng xạ Gamma' },
          { id: 'px_2', label: 'Phóng xạ Alpha' },
          { id: 'px_3', label: 'Phóng xạ Beta trừ' },
          { id: 'px_4', label: 'Phóng xạ Beta cộng' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['px_1'],
        },
        explain:
          'Phóng xạ Gamma (gamma) là sóng điện từ bước sóng cực ngắn (photon năng lượng cao), không mang điện và có sức đâm xuyên rất mạnh.',
      },
      {
        prompt:
          'Một đồng vị phóng xạ có chu kì bán rã là 5 ngày. ' +
          'Sau 15 ngày, lượng chất phóng xạ còn lại chiếm bao nhiêu phần trăm so với ban đầu?',
        answer: {
          kind: 'numeric',
          value: 12.5,
          unit: '%',
        },
        explain: 't/T = 15/5 = 3 chu kì. Tỉ lệ còn lại = 2^-3 = 1/8 = 12.5%.',
      },
    ],
    srsCards: [
      {
        hoi: 'Bản chất tia phóng xạ Alpha là gì?',
        dap: 'Là dòng hạt nhân nguyên tử Heli (_2^4 He).',
      },
      {
        hoi: 'Bản chất tia phóng xạ Gamma là gì?',
        dap: 'Sóng điện từ có bước sóng cực ngắn (các photon năng lượng cao).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c4-b24',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 24,
    title: 'Phân hạch và nhiệt hạch',
    hook:
      'Năng lượng hạt nhân có hai nguồn khai thác chính: phân tách các hạt nhân rất nặng (phân hạch - dùng trong lò phản ứng hạt nhân) và ' +
      'hợp nhất các hạt nhân rất nhẹ ở nhiệt độ cực cao (nhiệt hạch - phản ứng đang thắp sáng Mặt Trời).',
    theory:
      'PHẢN ỨNG PHÂN HẠCH:\\n' +
      '— Định nghĩa: Phản ứng phân hạch là hiện tượng một hạt nhân rất nặng (như U-235, Pu-239) hấp thụ một neutron chậm rồi vỡ thành hai hạt nhân trung bình, giải phóng 2-3 neutron và toả ra năng lượng rất lớn (~200 MeV/hạt nhân).\\n\\n' +
      'PHẢN ỨNG DÂY CHUYỀN (CHAIN REACTION):\\n' +
      '— Gọi k là hệ số nhân neutron trung bình:\\n' +
      '  + k < 1: Phản ứng tắt ngay.\\n  + k = 1: Phản ứng tự duy trì ổn định (nhà máy điện hạt nhân).\\n  + k > 1: Phản ứng tăng bùng nổ mất kiểm soát (bom nguyên tử).\\n\\n' +
      'PHẢN ỨNG NHIỆT HẠCH:\\n' +
      '— Định nghĩa: Phản ứng nhiệt hạch là phản ứng kết hợp hai hạt nhân rất nhẹ (đồng vị H) thành hạt nhân nặng hơn ở nhiệt độ cực kì cao (hàng chục đến hàng trăm triệu độ C).\\n' +
      '— Phương trình tiêu biểu: _1^2 H + _1^3 H -> _2^4 He + _0^1 n + 17.6 MeV.\\n' +
      '— Ưu điểm: Năng lượng toả ra cực lớn, nguồn nhiên liệu vô tận, sạch và ít phế thải phóng xạ.',
    workedExample: {
      problem:
        'Trình bày điều kiện để thực hiện phản ứng nhiệt hạch trên Trái Đất và nêu khó khăn lớn nhất hiện nay.',
      steps: [
        'Nêu điều kiện nhiệt độ: Cần nhiệt độ cực cao (~100 triệu độ) để vượt qua lực đẩy tĩnh điện Coulomb.',
        'Nêu điều kiện mật độ và thời gian: Mật độ hạt nhân đủ lớn và thời gian giữ đủ lâu để xảy ra va chạm tổng hợp.',
        'Nêu khó khăn công nghệ: Chưa chế tạo được vật liệu làm thành bình chứa chịu được nhiệt độ cao như vậy. Hiện đang dùng bẫy từ trường (Tokamak) hoặc bẫy laser.',
      ],
      answer:
        'Cần nhiệt độ cực cao khoảng 100 triệu độ; khó khăn lớn nhất là công nghệ giữ khối khí nóng cô lập.',
    },
    checkQuestions: [
      {
        prompt:
          'Phản ứng hạt nhân nào sau đây đóng vai trò là nguồn năng lượng của Mặt Trời và các ngôi sao?',
        choices: [
          { id: 'nh_1', label: 'Phản ứng nhiệt hạch' },
          { id: 'nh_2', label: 'Phản ứng phân hạch' },
          { id: 'nh_3', label: 'Phóng xạ Alpha' },
          { id: 'nh_4', label: 'Phóng xạ Beta' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['nh_1'],
        },
        explain:
          'Mặt Trời và các ngôi sao toả nhiệt và sáng liên tục nhờ phản ứng nhiệt hạch (tổng hợp hạt nhân hiđrô thành heli) ở lõi nóng bỏng.',
      },
      {
        prompt:
          'Để duy trì phản ứng dây chuyền có kiểm soát ổn định trong các lò phản ứng của nhà máy điện hạt nhân, ' +
          'hệ số nhân neutron k phải thoả mãn điều kiện nào?',
        choices: [
          { id: 'k_1', label: 'k = 1' },
          { id: 'k_2', label: 'k > 1' },
          { id: 'k_3', label: 'k < 1' },
          { id: 'k_4', label: 'k tùy ý' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['k_1'],
        },
        explain:
          'Khi k = 1, số neutron kích thích phân hạch được duy trì ổn định, công suất phát ra không đổi và có kiểm soát.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phân hạch là gì?',
        dap: 'Hiện tượng một hạt nhân nặng hấp thụ neutron vỡ thành hai hạt nhân trung bình.',
      },
      {
        hoi: 'Nhiệt hạch là gì?',
        dap: 'Phản ứng kết hợp các hạt nhân nhẹ thành hạt nhân nặng hơn ở nhiệt độ cực cao.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c4-b25',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Vật lí hạt nhân',
    lessonNumber: 25,
    title: 'Bài tập về vật lí hạt nhân',
    hook: 'Luyện tập giải các bài tập tính toán độ hụt khối, năng lượng liên kết, năng lượng phản ứng hạt nhân và ứng dụng định luật phóng xạ.',
    theory:
      'CÁC CÔNG THỨC TRỌNG TÂM CẦN NHỚ:\\n' +
      '1. Độ hụt khối: dm = Z.mp + (A-Z).mn - m_hn\\n' +
      '2. Năng lượng liên kết: Elk = dm * c² = dm * 931.5 MeV (với dm tính bằng amu)\\n' +
      '3. Năng lượng liên kết riêng: Elkr = Elk / A\\n' +
      '4. Số hạt còn lại: N(t) = N0 * 2^(-t/T) = N0 * e^(-lambda * t)\\n' +
      '5. Năng lượng phản ứng: dE = (m_truoc - m_sau) * c² = Elk_sau - Elk_truoc',
    workedExample: {
      problem:
        'Một phản ứng hạt nhân có tổng khối lượng của các hạt trước phản ứng là 236.002 amu và ' +
        'tổng khối lượng các hạt sau phản ứng là 235.802 amu. Hãy xác định phản ứng này toả hay thu bao nhiêu năng lượng (theo đơn vị MeV)? ' +
        'Biết 1 amu.c² = 931.5 MeV.',
      steps: [
        'Tính hiệu số khối lượng trước và sau phản ứng: dm = m_truoc - m_sau = 236.002 - 235.802 = 0.2 amu.',
        'Áp dụng công thức dE = dm * 931.5 MeV.',
        'Tính toán: dE = 0.2 * 931.5 = 186.3 MeV.',
        'Vì dE > 0 nên phản ứng toả năng lượng với độ lớn 186.3 MeV.',
      ],
      answer: 'Phản ứng toả năng lượng 186.3 MeV.',
    },
    checkQuestions: [
      {
        prompt:
          'Một đồng vị phóng xạ có chu kì bán rã T = 10 ngày. ' +
          'Hằng số phóng xạ lambda của chất phóng xạ này xấp xỉ bằng bao nhiêu ngày^-1?',
        answer: {
          kind: 'numeric',
          value: 0.0693,
          unit: 'ngày^-1',
        },
        explain: 'lambda = ln(2) / T = 0.693 / 10 = 0.0693 ngày^-1.',
      },
      {
        prompt:
          'Một phản ứng hạt nhân có tổng khối lượng các hạt trước phản ứng nhỏ hơn tổng khối lượng các hạt sau phản ứng là 0.005 amu. ' +
          'Tính năng lượng thu vào của phản ứng này theo đơn vị MeV (lấy 1 amu.c² = 931.5 MeV).',
        answer: {
          kind: 'numeric',
          value: 4.6575,
          unit: 'MeV',
        },
        explain: 'E_thu = (m_sau - m_truoc) * c^2 = 0.005 * 931.5 = 4.6575 MeV.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hằng số phóng xạ lambda liên hệ thế nào với chu kì bán rã T?',
        dap: 'lambda = ln 2 / T ≈ 0.693 / T.',
      },
      {
        hoi: 'Công thức tính năng lượng phản ứng hạt nhân theo khối lượng nghỉ trước và sau?',
        dap: 'dE = (mtruoc - msau) * c².',
      },
    ],
    reviewStatus: 'draft',
  },
]
