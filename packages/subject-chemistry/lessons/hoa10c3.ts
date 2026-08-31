// lessons/hoa10c3.ts — Hoá học 10, Chương 3: Liên kết hoá học (4 bài).
// Mục lục thật: tai-lieu-sgk/SGK-Hoa/10/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA10_C3_LESSONS: ChemLesson[] = [
  {
    id: 'hoa10-c3-b9',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Liên kết hoá học',
    lessonNumber: 9,
    title: 'Quy tắc octet',
    hook:
      'Khí hiếm không bao giờ tự tạo hợp chất với chất khác — chúng "hài lòng" với lớp vỏ ' +
      'electron sẵn có. Mọi nguyên tử khác đều muốn bắt chước sự "hài lòng" đó.',
    theory:
      'QUY TẮC OCTET: trong quá trình hình thành liên kết hoá học, nguyên tử có xu hướng ' +
      'nhường, nhận hoặc góp chung electron để đạt cấu hình electron bền vững của khí hiếm ' +
      'gần nhất — thường là 8 electron ở lớp ngoài cùng (riêng Hydrogen và Helium chỉ cần 2 ' +
      'electron).\n\n' +
      'Đây là quy tắc GIẢI THÍCH vì sao các nguyên tử liên kết với nhau, không phải một định ' +
      'luật vật lí tuyệt đối — có ngoại lệ (một số hợp chất của Boron, các nguyên tố d), ' +
      'nhưng đúng với đa số hợp chất phổ biến của các nguyên tố nhóm A.\n\n' +
      'Ba cách đạt octet: (1) NHƯỜNG electron (kim loại điển hình, VD Na nhường 1e), (2) NHẬN ' +
      'electron (phi kim điển hình, VD Cl nhận 1e), (3) GÓP CHUNG electron (giữa hai phi kim, ' +
      'tạo liên kết cộng hoá trị).',
    workedExample: {
      problem:
        'Nguyên tử Chlorine (Cl, Z=17) cần nhường hay nhận bao nhiêu electron để đạt cấu ' +
        'hình bền của khí hiếm gần nhất?',
      steps: [
        'Cấu hình electron của Cl: 1s²2s²2p⁶3s²3p⁵ ⇒ có 7 electron lớp ngoài cùng.',
        'Khí hiếm gần nhất là Argon (Ar) có 8 electron lớp ngoài cùng (cấu hình ...3s²3p⁶).',
        'Cl có 7e, cần thêm 1e nữa để đủ 8e ⇒ Cl có xu hướng NHẬN 1 electron.',
        'Khi nhận 1e, Cl trở thành ion Cl⁻ (mang điện tích −1), đạt cấu hình bền như Ar.',
      ],
      answer: 'Cl nhận 1 electron để tạo ion Cl⁻.',
    },
    checkQuestions: [
      {
        prompt:
          'Theo quy tắc octet, đa số nguyên tử có xu hướng đạt bao nhiêu electron ở lớp ngoài cùng?',
        answer: { kind: 'numeric', value: 8 },
        explain: 'Quy tắc octet: xu hướng đạt 8 electron lớp ngoài cùng (trừ H, He chỉ cần 2e).',
      },
      {
        prompt: 'Nguyên tử Sodium (Na, Z=11, cấu hình 1s²2s²2p⁶3s¹) đạt octet bằng cách nào?',
        choices: [
          { id: 'nhuong', label: 'Nhường 1 electron' },
          { id: 'nhan', label: 'Nhận 7 electron' },
          { id: 'gop', label: 'Góp chung electron' },
        ],
        answer: { kind: 'choice', correctIds: ['nhuong'] },
        explain:
          'Na có 1e lớp ngoài cùng — nhường đi 1e (dễ hơn nhận 7e) để lớp thứ 2 (đã đủ 8e) trở thành lớp ngoài cùng mới.',
      },
    ],
    srsCards: [
      {
        hoi: 'Quy tắc octet phát biểu gì?',
        dap: 'Nguyên tử có xu hướng đạt 8 electron lớp ngoài cùng (H, He chỉ cần 2e) bằng cách nhường/nhận/góp chung electron.',
      },
      {
        hoi: 'Ba cách nguyên tử đạt octet?',
        dap: 'Nhường electron, nhận electron, hoặc góp chung electron.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c3-b10',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Liên kết hoá học',
    lessonNumber: 10,
    title: 'Liên kết ion',
    hook:
      'Muối ăn (NaCl) là tinh thể rắn, nóng chảy ở 801°C — bền vững đến mức bạn có thể để ' +
      'hàng thế kỷ mà không phân huỷ. Bí mật nằm ở lực hút TĨNH ĐIỆN cực mạnh giữa các ion.',
    theory:
      'LIÊN KẾT ION là liên kết được hình thành bởi LỰC HÚT TĨNH ĐIỆN giữa các ion mang điện ' +
      'tích TRÁI DẤU.\n\n' +
      'Cơ chế: kim loại điển hình (độ âm điện nhỏ) NHƯỜNG electron cho phi kim điển hình (độ ' +
      'âm điện lớn) → tạo CATION (ion dương) và ANION (ion âm) → hai ion trái dấu hút nhau ' +
      'bằng lực tĩnh điện.\n\n' +
      'Ví dụ hình thành NaCl: Na → Na⁺ + 1e (Na nhường 1e); Cl + 1e → Cl⁻ (Cl nhận 1e); sau ' +
      'đó Na⁺ và Cl⁻ hút nhau tạo tinh thể NaCl.\n\n' +
      'Liên kết ion thường hình thành giữa nguyên tố có ĐỘ ÂM ĐIỆN CHÊNH LỆCH LỚN (thường ' +
      '≥1,7 theo thang Pauling) — điển hình giữa kim loại điển hình (nhóm IA, IIA) và phi kim ' +
      'điển hình (nhóm VIA, VIIA).\n\n' +
      'Tính chất chung của hợp chất ion: nhiệt độ nóng chảy/sôi CAO, thường ở thể RẮN ở nhiệt ' +
      'độ thường, dẫn điện khi nóng chảy hoặc hoà tan trong nước (do ion di chuyển tự do).',
    workedExample: {
      problem:
        'Giải thích quá trình hình thành liên kết ion trong phân tử MgO (Magnesium oxide), ' +
        'biết Mg có Z=12, O có Z=8.',
      steps: [
        'Mg (nhóm IIA) có 2 electron lớp ngoài cùng ⇒ nhường 2e để đạt octet: Mg → Mg²⁺ + 2e.',
        'O (nhóm VIA) có 6 electron lớp ngoài cùng, cần thêm 2e để đủ 8 ⇒ nhận 2e: O + 2e → O²⁻.',
        'Mg²⁺ mang điện tích +2, O²⁻ mang điện tích −2 — hai ion trái dấu hút nhau bằng lực ' +
          'tĩnh điện, tạo liên kết ion.',
        'Kết luận: MgO là hợp chất ion, công thức Mg²⁺O²⁻ (viết gọn MgO).',
      ],
      answer: 'Mg nhường 2e tạo Mg²⁺, O nhận 2e tạo O²⁻, hai ion hút nhau tạo liên kết ion MgO.',
    },
    checkQuestions: [
      {
        prompt: 'Liên kết ion được hình thành bởi lực nào?',
        choices: [
          { id: 'a', label: 'Lực hút tĩnh điện giữa các ion trái dấu' },
          { id: 'b', label: 'Lực hấp dẫn giữa các nguyên tử' },
          { id: 'c', label: 'Sự góp chung electron' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Liên kết ion = lực hút tĩnh điện giữa cation (+) và anion (−). Góp chung electron là đặc trưng của liên kết cộng hoá trị (bài sau).',
      },
      {
        prompt: 'Liên kết ion thường hình thành giữa loại nguyên tố nào với nhau?',
        choices: [
          { id: 'a', label: 'Kim loại điển hình và phi kim điển hình' },
          { id: 'b', label: 'Hai phi kim với nhau' },
          { id: 'c', label: 'Hai kim loại với nhau' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Cần độ âm điện chênh lệch lớn — kim loại điển hình (độ âm điện nhỏ) dễ nhường electron, phi kim điển hình (độ âm điện lớn) dễ nhận electron.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liên kết ion là gì?',
        dap: 'Lực hút tĩnh điện giữa các ion mang điện tích trái dấu.',
      },
      {
        hoi: 'Liên kết ion thường hình thành giữa loại nguyên tố nào?',
        dap: 'Kim loại điển hình (nhóm IA, IIA) và phi kim điển hình (nhóm VIA, VIIA).',
      },
      {
        hoi: 'Tính chất chung của hợp chất ion?',
        dap: 'Nhiệt độ nóng chảy/sôi cao, thể rắn ở nhiệt độ thường, dẫn điện khi nóng chảy/hoà tan.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c3-b11',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Liên kết hoá học',
    lessonNumber: 11,
    title: 'Liên kết cộng hoá trị',
    hook:
      'Khí oxygen (O₂) mà bạn đang hít thở không hình thành từ việc nhường-nhận electron — ' +
      'hai nguyên tử oxygen GÓP CHUNG electron với nhau, tạo ra kiểu liên kết khác hẳn liên ' +
      'kết ion.',
    theory:
      'LIÊN KẾT CỘNG HOÁ TRỊ là liên kết được hình thành giữa hai nguyên tử bằng MỘT HAY ' +
      'NHIỀU CẶP ELECTRON DÙNG CHUNG.\n\n' +
      'Thường hình thành giữa các nguyên tử của CÙNG một nguyên tố phi kim, hoặc giữa các phi ' +
      'kim có độ âm điện GẦN NHAU (chênh lệch <1,7 theo Pauling).\n\n' +
      'Hai loại liên kết cộng hoá trị:\n' +
      '— LIÊN KẾT CỘNG HOÁ TRỊ KHÔNG CỰC: cặp electron dùng chung ở CHÍNH GIỮA hai nguyên tử ' +
      '(hai nguyên tử giống hệt nhau, độ âm điện bằng nhau). Ví dụ: H₂, O₂, N₂, Cl₂.\n' +
      '— LIÊN KẾT CỘNG HOÁ TRỊ CÓ CỰC: cặp electron dùng chung LỆCH về phía nguyên tử có độ ' +
      'âm điện lớn hơn (hai nguyên tử khác nhau). Ví dụ: HCl (cặp electron lệch về Cl).\n\n' +
      'CÔNG THỨC LEWIS (công thức electron) biểu diễn liên kết bằng dấu chấm (electron riêng) ' +
      'hoặc gạch nối (cặp electron dùng chung). Một gạch nối = liên kết đơn (1 cặp e), hai ' +
      'gạch nối = liên kết đôi (2 cặp e), ba gạch nối = liên kết ba (3 cặp e).',
    workedExample: {
      problem:
        'Phân tử N₂ có liên kết ba giữa hai nguyên tử N. Giải thích vì sao N₂ rất bền, ít ' +
        'tham gia phản ứng ở điều kiện thường.',
      steps: [
        'Nguyên tử N (Z=7) có 5 electron lớp ngoài cùng, cần thêm 3e để đạt octet.',
        'Hai nguyên tử N góp chung 3 cặp electron (6 electron) để mỗi N đều đủ 8 electron lớp ' +
          'ngoài cùng ⇒ tạo LIÊN KẾT BA (N≡N).',
        'Liên kết ba có NĂNG LƯỢNG LIÊN KẾT rất lớn (khoảng 946 kJ/mol) — cần rất nhiều năng ' +
          'lượng mới phá vỡ được.',
        'Kết luận: vì liên kết ba N≡N bền vững, N₂ trơ về mặt hoá học ở điều kiện thường.',
      ],
      answer: 'N₂ có liên kết ba (N≡N) rất bền, năng lượng liên kết lớn nên khó bị phá vỡ.',
    },
    checkQuestions: [
      {
        prompt: 'Liên kết cộng hoá trị KHÔNG CỰC hình thành khi nào?',
        choices: [
          { id: 'a', label: 'Giữa hai nguyên tử giống nhau (độ âm điện bằng nhau)' },
          { id: 'b', label: 'Giữa kim loại và phi kim' },
          { id: 'c', label: 'Giữa hai phi kim khác nhau có độ âm điện chênh lệch lớn' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Không cực = cặp electron dùng chung ở chính giữa, không lệch về bên nào — xảy ra khi hai nguyên tử có độ âm điện BẰNG NHAU (cùng nguyên tố).',
      },
      {
        prompt: 'Phân tử O₂ có bao nhiêu cặp electron dùng chung (liên kết đôi O=O)?',
        answer: { kind: 'numeric', value: 2 },
        explain:
          'Liên kết đôi O=O gồm 2 cặp electron dùng chung (4 electron), giúp mỗi O đạt đủ 8 electron lớp ngoài cùng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liên kết cộng hoá trị là gì?',
        dap: 'Liên kết hình thành bằng một hay nhiều cặp electron dùng chung giữa hai nguyên tử.',
      },
      {
        hoi: 'Khác biệt giữa liên kết cộng hoá trị có cực và không cực?',
        dap: 'Không cực: cặp e dùng chung ở giữa (cùng nguyên tố). Có cực: cặp e lệch về nguyên tử có độ âm điện lớn hơn (khác nguyên tố).',
      },
      {
        hoi: 'Một gạch nối trong công thức Lewis biểu diễn gì?',
        dap: 'Một cặp electron dùng chung (liên kết đơn).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa10-c3-b12',
    grade: '10',
    chapterNumber: 3,
    chapterTitle: 'Liên kết hoá học',
    lessonNumber: 12,
    title: 'Liên kết hydrogen và tương tác van der Waals',
    hook:
      'Nước sôi ở 100°C, trong khi H₂S (cấu trúc tương tự nhưng thay O bằng S) chỉ sôi ở ' +
      '−60°C. Chênh lệch khổng lồ này đến từ một loại "liên kết yếu" đặc biệt chỉ nước và vài ' +
      'chất mới có.',
    theory:
      'LIÊN KẾT HYDROGEN là liên kết YẾU hình thành giữa nguyên tử HYDROGEN (đã liên kết cộng ' +
      'hoá trị với nguyên tử có độ âm điện lớn như F, O, N) với một nguyên tử có độ âm điện ' +
      'lớn (F, O, N) khác — thường ở PHÂN TỬ KHÁC (liên kết hydrogen liên phân tử).\n\n' +
      'Ví dụ điển hình: liên kết hydrogen giữa các phân tử nước (H₂O), giữa các phân tử ' +
      'alcohol (R-OH), giữa các phân tử ammonia (NH₃).\n\n' +
      'Vai trò: liên kết hydrogen tuy YẾU HƠN NHIỀU liên kết cộng hoá trị/ion, nhưng đủ mạnh ' +
      'để làm TĂNG nhiệt độ sôi/nóng chảy đáng kể so với các chất có khối lượng phân tử tương ' +
      'đương nhưng không có liên kết hydrogen (như H₂S so với H₂O).\n\n' +
      'TƯƠNG TÁC VAN DER WAALS là lực hút RẤT YẾU giữa các phân tử (yếu hơn cả liên kết ' +
      'hydrogen), xuất hiện ở MỌI phân tử, tăng theo khối lượng phân tử và diện tích tiếp ' +
      'xúc bề mặt. Đây là lý do các khí hiếm (không có liên kết hoá học nào khác) vẫn hoá ' +
      'lỏng được ở nhiệt độ đủ thấp.',
    workedExample: {
      problem:
        'Vì sao nhiệt độ sôi của H₂O (100°C) cao hơn hẳn nhiệt độ sôi của H₂S (−60°C), dù cả ' +
        'hai đều có công thức dạng H₂X?',
      steps: [
        'Oxygen (trong H₂O) có độ âm điện lớn (3,44) và kích thước nhỏ, còn Sulfur (trong ' +
          'H₂S) có độ âm điện nhỏ hơn nhiều (2,58) và kích thước lớn hơn.',
        'Vì vậy các phân tử H₂O hình thành được LIÊN KẾT HYDROGEN liên phân tử mạnh (H liên ' +
          'kết với O của phân tử H₂O khác).',
        'H₂S KHÔNG hình thành liên kết hydrogen đáng kể (S có độ âm điện chưa đủ lớn) — các ' +
          'phân tử H₂S chỉ hút nhau bằng tương tác van der Waals yếu.',
        'Kết luận: liên kết hydrogen của H₂O cần nhiều năng lượng hơn để phá vỡ khi đun sôi ' +
          '⇒ H₂O có nhiệt độ sôi cao hơn hẳn H₂S.',
      ],
      answer:
        'Vì H₂O có liên kết hydrogen liên phân tử mạnh, còn H₂S chỉ có tương tác van der Waals yếu.',
    },
    checkQuestions: [
      {
        prompt:
          'Liên kết hydrogen hình thành khi nguyên tử H liên kết cộng hoá trị với nguyên tử có tính chất gì?',
        choices: [
          { id: 'a', label: 'Độ âm điện lớn (như F, O, N)' },
          { id: 'b', label: 'Độ âm điện nhỏ (kim loại kiềm)' },
          { id: 'c', label: 'Bất kỳ nguyên tử nào' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Liên kết hydrogen cần H liên kết với nguyên tử có độ âm điện LỚN (F, O, N) — tạo ra sự phân cực mạnh cần cho liên kết hydrogen.',
      },
      {
        prompt: 'Tương tác van der Waals so với liên kết hydrogen thì mạnh hay yếu hơn?',
        choices: [
          { id: 'yeu', label: 'Yếu hơn' },
          { id: 'manh', label: 'Mạnh hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['yeu'] },
        explain:
          'Thứ tự độ mạnh: liên kết ion/cộng hoá trị > liên kết hydrogen > tương tác van der Waals.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liên kết hydrogen hình thành khi nào?',
        dap: 'Khi H (đã liên kết với F/O/N) tương tác với một nguyên tử F/O/N khác — thường ở phân tử khác.',
      },
      {
        hoi: 'Vì sao nhiệt độ sôi của H₂O cao hơn H₂S dù cùng dạng H₂X?',
        dap: 'Vì H₂O có liên kết hydrogen liên phân tử mạnh, H₂S không có.',
      },
      {
        hoi: 'Tương tác van der Waals có ở đâu?',
        dap: 'Ở MỌI phân tử, tăng theo khối lượng phân tử và diện tích tiếp xúc.',
      },
    ],
    reviewStatus: 'draft',
  },
]
