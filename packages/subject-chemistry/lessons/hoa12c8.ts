// lessons/hoa12c8.ts — Hoá học 12, Chương 8: Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C8_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c8-b27',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sơ lược về kim loại chuyển tiếp d và phức chất',
    lessonNumber: 27,
    title: 'Đại cương về kim loại chuyển tiếp dãy thứ nhất',
    hook:
      'Sắt chế tạo máy móc, đồng dẫn điện, chromium chống gỉ sét, manganese tăng độ cứng của thép. ' +
      'Tất cả chúng đều là các kim loại chuyển tiếp nhóm d, nằm ở trung tâm bảng tuần hoàn.',
    theory:
      'VỊ TRÍ VÀ CẤU HÌNH ELECTRON NGUYÊN TỬ:\\n' +
      '— Kim loại chuyển tiếp d thuộc các nhóm từ IIIB đến IIIB (nhóm 3 đến 12 trong bảng tuần hoàn), nằm ở chu kì 4, 5, 6, 7.\\n' +
      '— Dãy chuyển tiếp thứ nhất nằm ở chu kì 4, từ Scandium (Sc, Z=21) đến Zinc (Zn, Z=30). Nguyên tử của chúng có cấu hình electron lớp ngoài cùng dạng (n−1)d¹⁻¹⁰ns².\\n' +
      '   * Ngoại lệ cấu hình bán bão hoà và bão hoà bền vững: Chromium (Cr, Z=24): [Ar]3d⁵4s¹; Copper (Cu, Z=29): [Ar]3d¹⁰4s¹.\\n\\n' +
      'ĐẶC ĐIỂM TÍNH CHẤT VẬT LÍ:\\n' +
      '— Đều là kim loại. So với kim loại nhóm IA và IIA, kim loại chuyển tiếp d có nhiệt độ nóng chảy cao hơn, độ cứng lớn hơn, khối lượng riêng lớn hơn nhiều vì có sự tham gia liên kết của các electron lớp d.\\n\\n' +
      'ĐẶC ĐIỂM TÍNH CHẤT HOÁ HỌC:\\n' +
      '1. Có nhiều trạng thái oxi hoá khác nhau trong các hợp chất (do các electron 3d có năng lượng gần với 4s, đều có thể tham gia liên kết). Ví dụ: Fe (+2, +3); Cu (+1, +2); Cr (+2, +3, +6); Mn (+2, +4, +6, +7).\\n' +
      '2. Các hợp chất thường có màu sắc đặc trưng sinh động: dung dịch muối Cu²⁺ màu xanh lam; Fe³⁺ màu vàng nâu; Fe²⁺ màu xanh lục nhạt; ion MnO₄⁻ màu tím.',
    workedExample: {
      problem: 'Viết cấu hình electron của nguyên tử Iron (sắt, Fe, Z=26) và cation Fe³⁺.',
      steps: [
        'Nguyên tử Fe có Z = 26 electron. Viết phân bố electron theo mức năng lượng tăng dần: 1s²2s²2p⁶3s²3p⁶4s²3d⁶.',
        'Sắp xếp lại theo lớp electron để có cấu hình chính thức của Fe: [Ar] 3d⁶ 4s² (trong đó [Ar] viết tắt cho 1s²2s²2p⁶3s²3p⁶).',
        'Khi nguyên tử Fe nhường 3 electron để tạo cation Fe³⁺: electron sẽ bị tách ở lớp ngoài cùng (4s) trước, rồi mới tách tiếp ở phân lớp sát ngoài cùng (3d).',
        'Fe nhường 2e ở phân lớp 4s và 1e ở phân lớp 3d. Cấu hình electron của Fe³⁺ là: [Ar] 3d⁵ (đây là phân lớp d bán bão hoà bền vững).',
      ],
      answer: 'Fe: [Ar] 3d⁶ 4s²; Fe³⁺: [Ar] 3d⁵',
    },
    checkQuestions: [
      {
        prompt:
          'Cấu hình electron hoá trị của nguyên tử Copper (Cu, Z=29) ở trạng thái cơ bản là gì?',
        choices: [
          { id: 'a', label: '[Ar] 3d⁹ 4s²' },
          { id: 'b', label: '[Ar] 3d¹⁰ 4s¹' },
          { id: 'c', label: '[Ar] 3d⁸ 4s² 4p¹' },
        ],
        answer: { kind: 'choice', correctIds: ['b'] },
        explain:
          'Cấu hình electron của Cu là [Ar] 3d¹⁰ 4s¹ nhờ sự chuyển 1 electron từ 4s sang 3d để đạt trạng thái bão hoà 3d¹⁰ cực kì bền vững.',
      },
      {
        prompt:
          'Ion kim loại chuyển tiếp nào sau đây có màu xanh lam đặc trưng khi hoà tan trong nước?',
        choices: [
          { id: 'fe3', label: 'Fe³⁺' },
          { id: 'fe2', label: 'Fe²⁺' },
          { id: 'cu2', label: 'Cu²⁺' },
          { id: 'zn2', label: 'Zn²⁺' },
        ],
        answer: { kind: 'choice', correctIds: ['cu2'] },
        explain: 'Ion Cu²⁺ ngậm nước tạo phức chất aqua [Cu(H₂O)₆]²⁺ có màu xanh lam đặc trưng.',
      },
    ],
    srsCards: [
      { hoi: 'Cấu hình electron của Chromium (Z=24)?', dap: '[Ar] 3d⁵ 4s¹ (bán bão hoà).' },
      {
        hoi: 'Tại sao kim loại chuyển tiếp d có nhiều số oxi hoá?',
        dap: 'Vì các electron ở phân lớp sát ngoài cùng (n−1)d có mức năng lượng gần với lớp ngoài cùng ns, dễ tham gia liên kết.',
      },
      { hoi: 'Cấu hình electron của Fe²⁺?', dap: '[Ar] 3d⁶ (mất 2 electron ở phân lớp 4s).' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c8-b28',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sơ lược về kim loại chuyển tiếp d và phức chất',
    lessonNumber: 28,
    title: 'Sơ lược về phức chất',
    hook:
      'Chất hemoglobin trong máu người mang sắt (Fe²⁺) liên kết phối trí với khí oxygen để nuôi cơ thể.' +
      ' Chất diệp lục của cây xanh mang magnesium. Chúng đều thuộc một nhóm hợp chất đặc biệt gọi là phức chất.',
    theory:
      'KHÁI NIỆM PHỨC CHẤT:\\n' +
      '— Phức chất (coordination compound) là hợp chất có chứa cầu phức, được hình thành từ một ion kim loại trung tâm liên kết với các phối tử xung quanh bằng liên kết phối trí.\\n\\n' +
      'CẤU TRÚC PHỨC CHẤT (ví dụ: [Cu(NH₃)₄]²⁺):\\n' +
      '1. Ion trung tâm (central ion): Thường là cation kim loại chuyển tiếp d (như Cu²⁺, Ag⁺, Fe²⁺, Co³⁺) có các orbital trống.\\n' +
      '2. Phối tử (ligand): Là các phân tử hoặc anion có cặp electron tự do chưa liên kết (như H₂O, NH₃, Cl⁻, OH⁻, CN⁻) để nhường vào orbital trống của ion trung tâm.\\n' +
      '3. Liên kết phối trí (coordinate bond): Liên kết cho - nhận electron giữa phối tử và ion trung tâm (phối tử cho cặp electron, ion trung tâm nhận).\\n' +
      '4. Số phối trí (coordination number): Số liên kết phối trí trực tiếp của ion trung tâm với phối tử. Thường gặp: 2, 4, 6.\\n' +
      '5. Điện tích của cầu phức: Bằng tổng điện tích của ion trung tâm và các phối tử.',
    workedExample: {
      problem:
        'Xác định ion trung tâm, phối tử, số phối trí và số oxi hoá của ion trung tâm trong phức chất [Ag(NH₃)₂]⁺.',
      steps: [
        'Cầu phức là [Ag(NH₃)₂]⁺.',
        'Ion trung tâm là cation kim loại đứng đầu cầu phức: Ag.',
        'Phối tử là các phân tử liên kết xung quanh: NH₃.',
        'Có 2 phân tử NH₃ liên kết phối trí trực tiếp với Ag ⇒ Số phối trí của phức chất là 2.',
        'Phối tử NH₃ là phân tử trung hoà điện (điện tích = 0). Do đó, điện tích của cầu phức (+1) chính là điện tích của ion trung tâm Ag⁺ ⇒ Số oxi hoá của Ag là +1.',
      ],
      answer: 'Ion trung tâm Ag⁺, phối tử NH₃, số phối trí 2, số oxi hoá +1',
    },
    checkQuestions: [
      {
        prompt: 'Trong phức chất [Cu(NH₃)₄]²⁺, phối tử (ligand) là phân tử nào?',
        choices: [
          { id: 'cu', label: 'Ion Copper (Cu²⁺)' },
          { id: 'nh3', label: 'Phân tử Ammonia (NH₃)' },
          { id: 'h2o', label: 'Nước (H₂O)' },
        ],
        answer: { kind: 'choice', correctIds: ['nh3'] },
        explain:
          'Trong phức chất trên, Cu²⁺ là ion trung tâm, còn 4 phân tử NH₃ đóng vai trò là phối tử liên kết xung quanh.',
      },
      {
        prompt: 'Xác định số phối trí của ion trung tâm Fe trong phức chất [Fe(CN)₆]⁴⁻.',
        answer: { kind: 'numeric', value: 6 },
        explain:
          'Có 6 phối tử CN⁻ tạo 6 liên kết phối trí với ion sắt trung tâm, do đó số phối trí bằng 6.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phức chất gồm những phần cấu tạo nào?',
        dap: 'Ion trung tâm (cation kim loại) và các phối tử (ligands) liên kết xung quanh.',
      },
      {
        hoi: 'Bản chất liên kết trong phức chất là gì?',
        dap: 'Liên kết phối trí (cho - nhận cặp electron từ phối tử vào orbital trống của ion trung tâm).',
      },
      {
        hoi: 'Cách tính điện tích của cầu phức?',
        dap: 'Bằng tổng đại số điện tích của ion trung tâm và các phối tử.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c8-b29',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sơ lược về kim loại chuyển tiếp d và phức chất',
    lessonNumber: 29,
    title: 'Một số tính chất và ứng dụng của phức chất',
    hook:
      'Nhỏ amoniac vào cốc dung dịch đồng sunfat màu xanh nhạt: lúc đầu kết tủa xuất hiện, ' +
      'sau đó kết tủa tan rã ra tạo thành dung dịch màu xanh lam thẫm đẹp mắt. Phức chất đã làm thay đổi tính chất hoá học của đồng.',
    theory:
      'SỰ TẠO THÀNH PHỨC CHẤT TRONG DUNG DỊCH:\\n' +
      '1. Phức chất của Copper (đồng):\\n' +
      '   — Khi nhỏ dung dịch NH₃ từ từ vào dung dịch CuSO₄, ban đầu tạo kết tủa xanh nhạt Cu(OH)₂. Khi NH₃ dư, kết tủa tan tạo dung dịch phức chất màu xanh lam thẫm đặc trưng:\\n' +
      '     Cu(OH)₂↓ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻ (dung dịch phức tetraammincopper(II)).\\n' +
      '2. Phức chất của Silver (bạc):\\n' +
      '   — Kết tủa AgCl màu trắng ít tan trong nước, nhưng tan dễ dàng trong dung dịch NH₃ dư nhờ tạo phức chất không màu diamminesilver(I):\\n' +
      '     AgCl↓ + 2NH₃ → [Ag(NH₃)₂]⁺ + Cl⁻.\\n\\n' +
      'HẰNG SỐ BỀN (K_b):\\n' +
      '— Độ bền của phức chất trong dung dịch được đánh giá bằng hằng số bền K_b (hoặc hằng số tạo thành β). Trị số K_b càng lớn thì phức chất càng bền vững, phối tử khó bị thay thế bởi các tác nhân khác.\\n\\n' +
      'ỨNG DỤNG CỦA PHỨC CHẤT:\\n' +
      '— Trong hoá phân tích: Nhận biết, tách và định lượng các ion kim loại (ví dụ: dùng thuốc thử Tollens chứa phức chất bạc để nhận biết aldehyde).\\n' +
      '— Trong y học: Dùng chất tạo phức chelate (như muối EDTA) để giải độc kim loại nặng bằng cách "bẫy" ion kim loại độc hại thành phức chất tan, đào thải qua nước tiểu.\\n' +
      '— Xúc tác trong công nghiệp hoá chất.',
    workedExample: {
      problem:
        'Giải thích vì sao kết tủa đồng(II) hydroxide Cu(OH)₂ màu xanh nhạt lại tan trong dung dịch amoniac dư.',
      steps: [
        'Cu(OH)₂ là chất rắn kết tủa ít tan trong nước.',
        'Khi cho amoniac (NH₃) vào dung dịch, phân tử NH₃ có cặp electron tự do trên nguyên tử N nhường vào orbital trống của ion Cu²⁺.',
        'Phản ứng tạo phức chất [Cu(NH₃)₄]²⁺ tan tốt trong nước theo phương trình:\\n  Cu(OH)₂↓ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻.',
        'Nhờ sự hình thành cầu phức tan này, kết tủa xanh nhạt Cu(OH)₂ bị hoà tan hoàn toàn và dung dịch chuyển sang màu xanh lam thẫm.',
      ],
      answer: 'Do tạo phức chất tan [Cu(NH₃)₄]²⁺ màu xanh lam thẫm',
    },
    checkQuestions: [
      {
        prompt:
          'Sự hoà tan kết tủa AgCl màu trắng bằng dung dịch amoniac (NH₃) dư sinh ra phức chất nào sau đây?',
        choices: [
          { id: 'ag_nh3', label: '[Ag(NH₃)₂]⁺ (không màu)' },
          { id: 'cu_nh3', label: '[Cu(NH₃)₄]²⁺ (xanh thẫm)' },
          { id: 'fe_cn', label: '[Fe(CN)₆]³⁻' },
        ],
        answer: { kind: 'choice', correctIds: ['ag_nh3'] },
        explain:
          'Silver chloride phản ứng với NH₃ tạo phức chất diamminesilver(I) tan tốt, không màu: AgCl + 2NH₃ → [Ag(NH₃)₂]⁺ + Cl⁻.',
      },
      {
        prompt:
          'Giá trị hằng số bền (K_b) của phức chất biểu thị đặc tính nào của phức chất trong dung dịch?',
        choices: [
          { id: 'doc', label: 'Độ độc hại đối với cơ thể' },
          { id: 'ben', label: 'Độ bền vững (khó phân li) của phức chất' },
          { id: 'tan', label: 'Độ tan của phức chất trong nước' },
        ],
        answer: { kind: 'choice', correctIds: ['ben'] },
        explain:
          'Hằng số bền K_b đặc trưng cho cân bằng tạo phức. K_b càng lớn nghĩa là phức chất phân li ra ion trung tâm và phối tử càng ít, tức là phức chất càng bền vững.',
      },
    ],
    srsCards: [
      {
        hoi: 'Kết tủa Cu(OH)₂ tan trong dung dịch NH₃ tạo dung dịch màu gì?',
        dap: 'Xanh lam thẫm.',
      },
      {
        hoi: 'Hằng số bền K_b càng lớn thể hiện điều gì?',
        dap: 'Phức chất càng bền vững trong dung dịch.',
      },
      {
        hoi: 'EDTA có ứng dụng gì trong y học?',
        dap: 'Dùng giải độc chì, thuỷ ngân bằng cách tạo phức bền chelate tan được để đào thải.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c8-b30',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sơ lược về kim loại chuyển tiếp d và phức chất',
    lessonNumber: 30,
    title: 'Ôn tập chương 8',
    hook:
      'Chương 8 đúc kết cấu trúc phức tạp và thú vị của thế giới phức chất và kim loại chuyển tiếp d, ' +
      'nền tảng của hoá vô cơ hiện đại.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 8:\\n' +
      '1. Kim loại chuyển tiếp d chu kì 4 (Sc đến Zn): cấu hình lớp ngoài (n−1)d¹⁻¹⁰ns². Cr ([Ar]3d⁵4s¹) và Cu ([Ar]3d¹⁰4s¹) cấu hình đặc biệt. Tính chất: độ cứng cao, nóng chảy cao, nhiều số oxi hoá, hợp chất có màu đặc trưng.\\n' +
      '2. Phức chất: Gồm ion trung tâm (cation d) liên kết phối trí với phối tử ligand (H₂O, NH₃, Cl⁻...). Số phối trí là số liên kết phối trí (2, 4, 6).\\n' +
      '3. Sự tạo phức trong nước: Cu(OH)₂ tan trong NH₃ tạo [Cu(NH₃)₄]²⁺ màu xanh lam thẫm; AgCl tan trong NH₃ tạo [Ag(NH₃)₂]⁺ không màu.\\n' +
      '4. Hằng số bền K_b càng lớn phức chất càng bền. Ứng dụng phân tích định lượng, giải độc kim loại y học (EDTA), chất xúc tác.',
    workedExample: {
      problem:
        'Xác định số oxi hoá và số phối trí của ion trung tâm Nickel (Ni) trong phức chất [Ni(NH₃)₆]Cl₂.',
      steps: [
        'Cầu phức là [Ni(NH₃)₆]²⁺, bên ngoài cầu phức có 2 Cl⁻ mang điện tích −2.',
        'Ion trung tâm là Ni.',
        'Có 6 phối tử NH₃ liên kết phối trí trực tiếp với Ni ⇒ Số phối trí của ion trung tâm Ni bằng 6.',
        'Phối tử NH₃ là phân tử trung hoà điện tích (0). Điện tích cầu phức bằng +2. Do đó, điện tích của ion trung tâm Ni cũng bằng +2 ⇒ Số oxi hoá của Ni trong phức chất là +2.',
      ],
      answer: 'Số oxi hoá +2, số phối trí 6',
    },
    checkQuestions: [
      {
        prompt: 'Phức chất [Cr(H₂O)₆]³⁺ có số phối trí của ion trung tâm chromium bằng bao nhiêu?',
        answer: { kind: 'numeric', value: 6 },
        explain:
          'Có 6 phối tử nước H₂O liên kết phối trí trực tiếp với ion trung tâm Cr³⁺, do đó số phối trí bằng 6.',
      },
      {
        prompt: 'Nguyên tố nào sau đây thuộc dãy kim loại chuyển tiếp thứ nhất của phân nhóm d?',
        choices: [
          { id: 'na', label: 'Sodium (Na)' },
          { id: 'ca', label: 'Calcium (Ca)' },
          { id: 'fe', label: 'Iron (Fe)' },
          { id: 'al', label: 'Aluminium (Al)' },
        ],
        answer: { kind: 'choice', correctIds: ['fe'] },
        explain:
          'Iron (Fe, Z=26) thuộc nhóm VIIIB chu kì 4, thuộc dãy kim loại chuyển tiếp thứ nhất (nhóm d).',
      },
    ],
    srsCards: [
      { hoi: 'Màu của phức chất đồng - amoniac là màu gì?', dap: 'Xanh lam thẫm.' },
      {
        hoi: 'Phối tử là gì?',
        dap: 'Là các phân tử hoặc anion có cặp electron tự do chưa liên kết để nhường phối trí với ion trung tâm.',
      },
      { hoi: 'Số phối trí thường gặp trong phức chất?', dap: '2, 4, và 6.' },
    ],
    reviewStatus: 'draft',
  },
]
