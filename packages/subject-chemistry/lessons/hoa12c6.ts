// lessons/hoa12c6.ts — Hoá học 12, Chương 6: Đại cương về kim loại (6 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C6_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c6-b18',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 18,
    title: 'Cấu tạo và liên kết trong tinh thể kim loại',
    hook:
      'Vì sao kim loại có thể dát mỏng như lá vàng, kéo sợi dài như dây đồng và dẫn điện tốt đến thế? ' +
      'Bí ẩn nằm ở những "electron tự do" bao quanh các ion dương kim loại.',
    theory:
      'LIÊN KẾT KIM LOẠI:\\n' +
      '— Liên kết kim loại là liên kết được hình thành giữa các cation kim loại ở các nút mạng tinh thể và các electron tự do di chuyển hỗn loạn trong toàn bộ mạng tinh thể kim loại.\\n\\n' +
      'CẤU TRÚC TINH THỂ KIM LOẠI:\\n' +
      '— Hầu hết kim loại tồn tại ở trạng thái rắn (trừ thủy ngân) có cấu trúc tinh thể.\\n' +
      '— Ba kiểu mạng tinh thể kim loại phổ biến:\\n' +
      '  1. Mạng lập phương tâm khối (body-centered cubic): Các nguyên tử/ion chiếm các đỉnh và tâm của hình lập phương (độ rỗng lớn, vd: Li, Na, K, Ba, Fe_α).\\n' +
      '  2. Mạng lập phương tâm diện (face-centered cubic): Các nguyên tử/ion chiếm các đỉnh và tâm các mặt của hình lập phương (xếp khít hơn, vd: Al, Cu, Ag, Au).\\n' +
      '  3. Mạng lục phương (hexagonal close-packed): Các nguyên tử/ion xếp khít nhau dạng lăng trụ lục giác đều (vd: Be, Mg, Zn).',
    workedExample: {
      problem:
        'Giải thích vì sao kim loại có tính dẻo, dễ rèn, dát mỏng và kéo sợi mà không bị vỡ vụn.',
      steps: [
        'Mạng tinh thể kim loại gồm các cation kim loại nằm cố định tại các nút mạng và dòng electron tự do di chuyển xung quanh.',
        'Khi chịu tác dụng của lực cơ học bên ngoài, các lớp mạng tinh thể kim loại trượt lên nhau.',
        'Sự trượt này không làm phá vỡ liên kết vì các electron tự do giống như một chất bôi trơn kết dính, liên tục di chuyển và giữ các cation kim loại lại với nhau.',
        'Kết quả: kim loại chỉ bị biến dạng (móp, dát mỏng) chứ không bị vỡ vụn như tinh thể muối ăn (liên kết ion).',
      ],
      answer: 'Do các electron tự do liên kết các lớp cation trượt lên nhau',
    },
    checkQuestions: [
      {
        prompt:
          'Liên kết kim loại được hình thành nhờ lực hút tĩnh điện giữa các cation kim loại với thành phần nào?',
        choices: [
          { id: 'anion', label: 'Các anion phi kim' },
          { id: 'electron', label: 'Các electron tự do' },
          { id: 'hatnhan', label: 'Hạt nhân nguyên tử bên cạnh' },
        ],
        answer: { kind: 'choice', correctIds: ['electron'] },
        explain:
          'Liên kết kim loại là lực hút tĩnh điện giữa các cation kim loại ở nút mạng và đám mây electron tự do di chuyển xung quanh.',
      },
      {
        prompt: 'Kiểu mạng tinh thể nào sau đây có cấu trúc rỗng nhất (độ xếp khít nhỏ nhất)?',
        choices: [
          { id: 'tamkhoi', label: 'Mạng lập phương tâm khối' },
          { id: 'tamdien', label: 'Mạng lập phương tâm diện' },
          { id: 'lucphuong', label: 'Mạng lục phương' },
        ],
        answer: { kind: 'choice', correctIds: ['tamkhoi'] },
        explain:
          'Mạng lập phương tâm khối có độ xếp khít chỉ đạt 68% thể tích, rỗng nhất trong 3 kiểu mạng tinh thể kim loại.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liên kết kim loại là gì?',
        dap: 'Liên kết hình thành bởi lực hút giữa các cation kim loại ở nút mạng với các electron tự do.',
      },
      { hoi: 'Kim loại duy nhất ở thể lỏng ở điều kiện thường?', dap: 'Thủy ngân (Hg).' },
      {
        hoi: 'Ba kiểu mạng tinh thể kim loại phổ biến?',
        dap: 'Lập phương tâm khối, lập phương tâm diện, và lục phương.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c6-b19',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 19,
    title: 'Tính chất vật lí và tính chất hoá học của kim loại',
    hook:
      'Đồng dẫn điện tốt, vàng óng ánh sang trọng, sắt cứng cáp làm khung nhà. ' +
      'Các electron tự do không chỉ liên kết mạng tinh thể mà còn quyết định các tính chất vật lí kỳ diệu của kim loại.',
    theory:
      'TÍNH CHẤT VẬT LÍ CHUNG (Do electron tự do gây ra):\\n' +
      '— Tính dẻo: Vàng (Au) dẻo nhất (có thể dát mỏng đến mức ánh sáng đi qua được).\\n' +
      '— Tính dẫn điện: Ag > Cu > Au > Al > Fe. Nhiệt độ càng tăng thì tính dẫn điện càng giảm (do mạng tinh thể dao động mạnh cản trở electron di chuyển).\\n' +
      '— Tính dẫn nhiệt: Tỉ lệ thuận với tính dẫn điện.\\n' +
      '— Ánh kim: Phản xạ hầu hết ánh sáng nhìn thấy.\\n\\n' +
      'TÍNH CHẤT VẬT LÍ RIÊNG (Do nguyên tử và mạng tinh thể quyết định):\\n' +
      '— Khối lượng riêng: Nhỏ nhất là Li (0,5 g/cm³), lớn nhất là Os (22,6 g/cm³).\\n' +
      '— Nhiệt độ nóng chảy: Thấp nhất là Hg (−39 °C), cao nhất là W (Tungsten, 3410 °C - làm dây tóc bóng đèn).\\n' +
      '— Độ cứng: Mềm nhất là Cs (có thể cắt bằng dao), cứng nhất là Cr (Chromium - rạch được thuỷ tinh).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CHUNG:\\n' +
      '— Kim loại có tính KHỬ đặc trưng (dễ nhường electron để tạo cation): M → Mⁿ⁺ + ne.\\n' +
      '— Phản ứng đặc trưng: Tác dụng với phi kim (O₂, Cl₂, S); tác dụng với dung dịch acid (HCl, H₂SO₄ loãng giải phóng H₂; HNO₃, H₂SO₄ đặc tạo sản phẩm khử); tác dụng với nước (kim loại kiềm/kiềm thổ); tác dụng với muối của kim loại yếu hơn (thế kim loại).',
    workedExample: {
      problem: 'Sắp xếp khả năng dẫn điện giảm dần của các kim loại sau: Al, Ag, Cu, Fe.',
      steps: [
        'Khả năng dẫn điện của kim loại phụ thuộc vào mật độ electron tự do và cấu trúc tinh thể.',
        'Thứ tự dẫn điện giảm dần chuẩn xác của các kim loại phổ biến là: Bạc (Ag) > Đồng (Cu) > Vàng (Au) > Nhôm (Al) > Sắt (Fe).',
        'Áp dụng vào các kim loại đề bài cho: Ag > Cu > Al > Fe.',
      ],
      answer: 'Ag > Cu > Al > Fe',
    },
    checkQuestions: [
      {
        prompt: 'Kim loại nào sau đây dẫn điện tốt nhất ở điều kiện thường?',
        choices: [
          { id: 'cu', label: 'Copper (Cu)' },
          { id: 'al', label: 'Aluminium (Al)' },
          { id: 'ag', label: 'Silver (Ag)' },
          { id: 'fe', label: 'Iron (Fe)' },
        ],
        answer: { kind: 'choice', correctIds: ['ag'] },
        explain: 'Bạc (Ag) là kim loại dẫn điện và dẫn nhiệt tốt nhất, tiếp theo là Đồng (Cu).',
      },
      {
        prompt:
          'Kim loại có độ cứng lớn nhất (rạch được thuỷ tinh) dùng làm thành phần thép không gỉ là kim loại nào?',
        choices: [
          { id: 'fe', label: 'Iron (Fe)' },
          { id: 'cr', label: 'Chromium (Cr)' },
          { id: 'w', label: 'Tungsten (W)' },
        ],
        answer: { kind: 'choice', correctIds: ['cr'] },
        explain:
          'Chromium (Cr) có độ cứng lớn nhất trong các kim loại đơn chất, đạt thang độ cứng 9/10 Mohs.',
      },
    ],
    srsCards: [
      {
        hoi: 'Bốn tính chất vật lí chung của kim loại?',
        dap: 'Tính dẻo, dẫn điện, dẫn nhiệt, và ánh kim.',
      },
      {
        hoi: 'Nguyên nhân gây ra tính chất vật lí chung của kim loại?',
        dap: 'Do các electron tự do trong mạng tinh thể kim loại gây ra.',
      },
      {
        hoi: 'Kim loại có nhiệt độ nóng chảy cao nhất dùng làm dây tóc bóng đèn?',
        dap: 'Tungsten (W).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c6-b20',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 20,
    title: 'Kim loại trong tự nhiên và phương pháp tách kim loại',
    hook:
      'Hầu hết kim loại tồn tại trong vỏ Trái Đất dưới dạng quặng oxide hoặc sulfide thô sơ. ' +
      'Để thu được kim loại tinh khiết, con người đã phát minh ra các kỹ nghệ luyện kim tinh xảo.',
    theory:
      'TRẠNG THÁI TỰ NHIÊN:\\n' +
      '— Hầu hết kim loại tồn tại dưới dạng hợp chất (quặng bauxite Al₂O₃, quặng hematite Fe₂O₃, quặng pyrite FeS₂...). Chỉ một số ít kim loại rất yếu tồn tại ở trạng thái tự do (dạng đơn chất như Au, Pt).\\n\\n' +
      'PHƯƠNG PHÁP TÁCH (ĐIỀU CHẾ KIM LOẠI):\\n' +
      'Nguyên tắc chung: Khử ion kim loại thành nguyên tử: Mⁿ⁺ + ne → M.\\n' +
      '1. Phương pháp thuỷ luyện (Hydrometallurgy):\\n' +
      '   — Dùng kim loại mạnh đẩy kim loại yếu ra khỏi dung dịch muối (điều chế kim loại hoạt động yếu như Cu, Ag, Au).\\n' +
      '   — Ví dụ: Fe + CuSO₄ → FeSO₄ + Cu.\\n' +
      '2. Phương pháp nhiệt luyện (Pyrometallurgy):\\n' +
      '   — Dùng chất khử mạnh như CO, C, H₂, Al để khử ion kim loại trong oxide ở nhiệt độ cao (điều chế kim loại hoạt động trung bình như Fe, Cr, Zn, Cu).\\n' +
      '   — Ví dụ: Fe₂O₃ + 3CO → 2Fe + 3CO₂ (t°).\\n' +
      '3. Phương pháp điện phân (Electrolysis):\\n' +
      '   — Điện phân nóng chảy: Điều chế kim loại cực mạnh (nhóm IA, IIA, Al) từ muối clorua hoặc oxit nóng chảy.\\n' +
      '   — Điện phân dung dịch: Điều chế kim loại trung bình và yếu.',
    workedExample: {
      problem:
        'Cần dùng bao nhiêu lít khí CO (ở điều kiện chuẩn: 25 °C, 1 bar, thể tích mol 24,79 L/mol) ' +
        'để khử hoàn toàn 8,0 gam oxide sắt Fe₂O₃ (M=160) thành kim loại sắt Fe?',
      steps: [
        'Tính số mol Fe₂O₃: n = 8,0 / 160 = 0,05 mol.',
        'Viết phương trình phản ứng nhiệt luyện: Fe₂O₃ + 3CO → 2Fe + 3CO₂ (t°).',
        'Theo tỉ lệ phản ứng, 1 mol Fe₂O₃ cần 3 mol CO để phản ứng.',
        'Tính số mol khí CO cần dùng: nCO = 3 * n(Fe₂O₃) = 3 * 0,05 = 0,15 mol.',
        'Tính thể tích khí CO ở đkc: V = nCO * 24,79 = 0,15 * 24,79 = 3,7185 L.',
      ],
      answer: '3,7185 L',
    },
    checkQuestions: [
      {
        prompt: 'Nguyên tắc chung của quá trình điều chế kim loại là gì?',
        choices: [
          { id: 'oxi', label: 'Oxi hoá nguyên tử kim loại thành ion' },
          { id: 'khu', label: 'Khử ion kim loại trong hợp chất thành nguyên tử tự do' },
          { id: 'trunghoa', label: 'Trung hoà điện tích ion kim loại' },
        ],
        answer: { kind: 'choice', correctIds: ['khu'] },
        explain:
          'Điều chế kim loại là quá trình khử ion kim loại (Mⁿ⁺) bằng cách cho nó nhận electron để trở thành nguyên tử tự do (M).',
      },
      {
        prompt:
          'Để điều chế kim loại kiềm Sodium (Na) trong công nghiệp, người ta dùng phương pháp nào?',
        choices: [
          { id: 'nhiet', label: 'Nhiệt luyện quặng oxide' },
          { id: 'thuy', label: 'Thuỷ luyện muối chloride' },
          { id: 'dien_nongchay', label: 'Điện phân nóng chảy muối NaCl' },
        ],
        answer: { kind: 'choice', correctIds: ['dien_nongchay'] },
        explain:
          'Sodium là kim loại kiềm hoạt động hoá học cực mạnh, ion Na⁺ rất khó bị khử. Cách duy nhất trong công nghiệp là điện phân nóng chảy muối chloride NaCl.',
      },
    ],
    srsCards: [
      {
        hoi: 'Nguyên tắc điều chế kim loại?',
        dap: 'Khử ion kim loại thành nguyên tử tự do (Mⁿ⁺ + ne → M).',
      },
      {
        hoi: 'Phương pháp nhiệt luyện dùng chất khử nào ở nhiệt độ cao?',
        dap: 'Các chất khử mạnh như C, CO, H₂, Al.',
      },
      {
        hoi: 'Phương pháp thuỷ luyện dùng cho kim loại nào?',
        dap: 'Kim loại hoạt động yếu (Cu, Ag, Au...).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c6-b21',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 21,
    title: 'Hợp kim',
    hook:
      'Sắt nguyên chất khá mềm và dễ gỉ sét. Nhưng khi pha thêm một chút carbon và chromium, ' +
      'ta thu được thép không gỉ vững chãi kiến tạo nên những toà nhà chọc trời.',
    theory:
      'KHÁI NIỆM HỢP KIM:\\n' +
      '— Hợp kim là vật liệu kim loại có chứa một kim loại cơ bản và một số kim loại hoặc phi kim khác (như carbon, silicon).\\n\\n' +
      'TÍNH CHẤT CỦA HỢP KIM:\\n' +
      '— Tính chất hoá học: Tương tự như tính chất của các đơn chất tham gia tạo thành hợp kim.\\n' +
      '— Tính chất vật lí và cơ học (khác biệt nhiều so với kim loại thành phần):\\n' +
      '  1. Độ dẫn điện và dẫn nhiệt của hợp kim kém hơn kim loại thành phần tinh khiết (do sự xáo trộn mạng tinh thể cản trở electron di chuyển).\\n' +
      '  2. Độ cứng của hợp kim thường cao hơn kim loại thành phần (do các nguyên tử có kích thước khác nhau chèn vào mạng tinh thể làm các lớp tinh thể khó trượt lên nhau hơn).\\n' +
      '  3. Nhiệt độ nóng chảy của hợp kim thấp hơn nhiệt độ nóng chảy của kim loại thành phần.\\n\\n' +
      'HỢP KIM PHỔ BIẾN:\\n' +
      '— Gang (Cast iron): Hợp kim Fe−C (C chiếm 2% − 5%), giòn, cứng.\\n' +
      '— Thép (Steel): Hợp kim Fe−C (C < 2%), dẻo, bền dai. Thép không gỉ (Inox) chứa Fe−C−Cr−Ni.\\n' +
      '— Đồng thau (Brass): Hợp kim Cu−Zn; Đồng bạch: Cu−Ni.',
    workedExample: {
      problem: 'Vì sao hợp kim thường cứng hơn kim loại thành phần tinh khiết cấu tạo nên nó?',
      steps: [
        'Trong kim loại tinh khiết, các nguyên tử đồng đều về kích thước xếp khít nhau thành các lớp mạng phẳng dễ trượt lên nhau khi chịu lực.',
        'Khi tạo hợp kim, các nguyên tử kim loại hoặc phi kim khác loại (có kích thước khác biệt) chèn vào các kẽ hở hoặc nút mạng tinh thể kim loại cơ bản.',
        'Sự chênh lệch kích thước này làm biến dạng mạng tinh thể, tạo ra các rào cản ngăn cản các lớp nguyên tử trượt lên nhau một cách dễ dàng.',
        'Do đó, cấu trúc trở nên khóa chặt hơn và làm tăng đáng kể độ cứng của vật liệu.',
      ],
      answer: 'Do nguyên tử khác kích thước cản trở các lớp tinh thể trượt lên nhau',
    },
    checkQuestions: [
      {
        prompt:
          'Thép là hợp kim của sắt (Fe) với phi kim nào sau đây, trong đó tỉ lệ phi kim này nhỏ hơn 2%?',
        choices: [
          { id: 'si', label: 'Silicon (Si)' },
          { id: 'p', label: 'Phosphorus (P)' },
          { id: 'c', label: 'Carbon (C)' },
          { id: 's', label: 'Sulfur (S)' },
        ],
        answer: { kind: 'choice', correctIds: ['c'] },
        explain:
          'Thép và gang đều là hợp kim của sắt và carbon (C). Thép có hàm lượng C < 2%, gang có hàm lượng C từ 2% đến 5%.',
      },
      {
        prompt: 'Đồng thau (brass) là hợp kim của đồng với kim loại nào sau đây?',
        choices: [
          { id: 'sn', label: 'Tin (Thiếc, Sn)' },
          { id: 'zn', label: 'Zinc (Kẽm, Zn)' },
          { id: 'ni', label: 'Nickel (Ni)' },
        ],
        answer: { kind: 'choice', correctIds: ['zn'] },
        explain:
          'Đồng thau là hợp kim của Đồng (Cu) và Kẽm (Zn). Đồng thiếc (bronze) là hợp kim của Đồng và Thiếc (Sn).',
      },
    ],
    srsCards: [
      { hoi: 'Thành phần chính của gang và thép?', dap: 'Sắt (Fe) và Carbon (C).' },
      { hoi: 'Nhiệt độ nóng chảy của hợp kim so với kim loại gốc?', dap: 'Thường thấp hơn.' },
      {
        hoi: 'Độ dẫn điện của hợp kim so với kim loại gốc?',
        dap: 'Kém hơn (do mạng tinh thể bị xáo trộn làm electron tự do khó di chuyển).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c6-b22',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 22,
    title: 'Sự ăn mòn kim loại',
    hook:
      'Gỉ sét tàn phá cầu đường và tàu biển, gây thiệt hại hàng tỷ USD mỗi năm. ' +
      'Đây không chỉ là phản ứng hoá học đơn thuần mà là một quá trình điện hoá tinh vi.',
    theory:
      'KHÁI NIỆM ĂN MÒN KIM LOẠI:\\n' +
      '— Là sự phá huỷ kim loại hoặc hợp kim do tác dụng hoá học của các chất trong môi trường xung quanh: M → Mⁿ⁺ + ne.\\n\\n' +
      'PHÂN LOẠI ĂN MÒN:\\n' +
      '1. Ăn mòn hoá học: Kim loại phản ứng trực tiếp với chất oxi hoá trong môi trường (không phát sinh dòng điện, xảy ra ở chi tiết máy tiếp xúc nhiệt độ cao như van động cơ).\\n' +
      '2. Ăn mòn điện hoá (phổ biến và nguy hiểm nhất): Quá trình ăn mòn kim loại do tác dụng của dung dịch chất điện li và tạo ra dòng điện.\\n' +
      '   — Điều kiện xảy ra ăn mòn điện hoá (đồng thời cả 3 điều kiện):\\n' +
      '     1. Hai điện cực khác chất nhau (kim loại - kim loại, kim loại - phi kim như Fe−C).\\n' +
      '     2. Các điện cực tiếp xúc trực tiếp hoặc gián tiếp qua dây dẫn.\\n' +
      '     3. Các điện cực cùng tiếp xúc với dung dịch chất điện li (nước mưa, không khí ẩm chứa khí tan).\\n' +
      '   — Cơ chế cực: Cực âm (Anode) là kim loại mạnh hơn, bị ăn mòn; Cực dương (Cathode) là kim loại yếu hơn/phi kim, được bảo vệ.\\n\\n' +
      'PHƯƠNG PHÁP BẢO VỆ KIM LOẠI KHÔNG BỊ ĂN MÒN:\\n' +
      '— Phương pháp cách li môi trường: Sơn, mạ, bôi dầu mỡ, tráng men... lên bề mặt kim loại.\\n' +
      '— Phương pháp bảo vệ điện hoá: Dùng kim loại hoạt động mạnh hơn làm "vật hi sinh" để bảo vệ kim loại yếu hơn. Ví dụ: Gắn các khối kẽm (Zn) vào vỏ tàu biển bằng thép (Fe). Kẽm bị ăn mòn trước, thép của tàu được bảo vệ.',
    workedExample: {
      problem:
        'Một sợi dây đồng (Cu) được nối với một sợi dây sắt (Fe) rồi để ngoài không khí ẩm. ' +
        'Xác định loại ăn mòn xảy ra, cực âm, cực dương và chất nào bị ăn mòn.',
      steps: [
        'Xét điều kiện ăn mòn: hai điện cực khác nhau (Fe và Cu), tiếp xúc trực tiếp, cùng đặt trong không khí ẩm (chất điện li) ⇒ Thoả mãn ăn mòn điện hoá học.',
        'Xác định tính chất kim loại: Fe hoạt động hoá học mạnh hơn Cu.',
        'Cực âm (Anode): Fe. Quá trình oxi hoá xảy ra tại đây: Fe → Fe²⁺ + 2e. Sắt bị ăn mòn.',
        'Cực dương (Cathode): Cu. Quá trình khử của môi trường xảy ra tại đây (như khử O₂ hoặc H⁺). Đồng được bảo vệ, không bị ăn mòn.',
        'Kết luận: Xảy ra ăn mòn điện hoá; Fe là anode và bị ăn mòn; Cu là cathode và được bảo vệ.',
      ],
      answer: 'Fe bị ăn mòn điện hoá',
    },
    checkQuestions: [
      {
        prompt:
          'Để bảo vệ vỏ tàu biển bằng thép (thành phần chính là sắt) khỏi bị ăn mòn điện hoá bởi nước biển, người ta gắn vào vỏ tàu khối kim loại nào sau đây làm vật hi sinh?',
        choices: [
          { id: 'cu', label: 'Copper (Đồng, Cu)' },
          { id: 'ag', label: 'Silver (Bạc, Ag)' },
          { id: 'zn', label: 'Zinc (Kẽm, Zn)' },
          { id: 'pb', label: 'Lead (Chì, Pb)' },
        ],
        answer: { kind: 'choice', correctIds: ['zn'] },
        explain:
          'Kẽm (Zn) hoạt động mạnh hơn Sắt (Fe). Khi gắn vào vỏ tàu, Zn đóng vai trò cực âm (anode) và bị ăn mòn trước, bảo vệ sắt không bị oxi hoá.',
      },
      {
        prompt:
          'Điều kiện nào sau đây KHÔNG bắt buộc để xảy ra quá trình ăn mòn điện hoá học của kim loại?',
        choices: [
          { id: 'a', label: 'Hai điện cực phải tiếp xúc trực tiếp với nhau' },
          { id: 'b', label: 'Phải có dòng điện bên ngoài truyền vào' },
          { id: 'c', label: 'Các điện cực phải cùng tiếp xúc với một dung dịch chất điện li' },
        ],
        answer: { kind: 'choice', correctIds: ['b'] },
        explain:
          'Ăn mòn điện hoá tự phát sinh dòng điện từ phản ứng hoá học bên trong, không cần và không sử dụng dòng điện bên ngoài truyền vào.',
      },
    ],
    srsCards: [
      { hoi: 'Hai loại ăn mòn kim loại thường gặp?', dap: 'Ăn mòn hoá học và Ăn mòn điện hoá.' },
      {
        hoi: 'Trong ăn mòn điện hoá, điện cực nào bị ăn mòn?',
        dap: 'Cực âm (anode), làm bằng kim loại hoạt động mạnh hơn.',
      },
      {
        hoi: 'Bảo vệ điện hoá là phương pháp gì?',
        dap: 'Gắn một kim loại mạnh hơn làm vật hi sinh bị ăn mòn trước để bảo vệ kim loại chính.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c6-b23',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Đại cương về kim loại',
    lessonNumber: 23,
    title: 'Ôn tập chương 6',
    hook:
      'Chương 6 đúc kết các quy luật chung nhất về cấu trúc tinh thể, tính chất hoá học và phương pháp điều chế ' +
      'của thế giới kim loại.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 6:\\n' +
      '1. Cấu trúc kim loại: Liên kết kim loại (hút cation - electron tự do). 3 kiểu mạng tinh thể: lập phương tâm khối, lập phương tâm diện, lục phương.\\n' +
      '2. Tính chất vật lí: Dẫn điện (Ag>Cu>Au>Al>Fe), dẫn nhiệt, tính dẻo, ánh kim do electron tự do. Độ cứng (Cr nhất), nhiệt độ nóng chảy (W nhất), tỷ khối (Os nhất) do nguyên tử quyết định.\\n' +
      '3. Tính chất hoá học: Tính khử đặc trưng. Dãy điện hoá định hướng phản ứng chất oxi hoá mạnh hơn với chất khử mạnh hơn.\\n' +
      '4. Điều chế kim loại: Khử ion kim loại. Thuỷ luyện (yếu), Nhiệt luyện (C, CO, H₂, Al khử oxit trung bình/yếu), Điện phân (nóng chảy cho IA, IIA, Al; dung dịch cho trung bình/yếu).\\n' +
      '5. Hợp kim: Hợp chất kim loại với kim loại/phi kim. Cứng hơn, dẫn điện kém hơn, nóng chảy thấp hơn kim loại gốc.\\n' +
      '6. Ăn mòn: Ăn mòn hoá học và ăn mòn điện hoá (3 điều kiện). Cực âm (anode) bị ăn mòn. Bảo vệ bằng sơn/mạ hoặc gắn kim loại mạnh hi sinh.',
    workedExample: {
      problem:
        'Sắt bị ăn mòn điện hoá học khi tiếp xúc với kim loại nào sau đây trong không khí ẩm: Mg, Cu, Zn?',
      steps: [
        'Để sắt (Fe) bị ăn mòn điện hoá học khi tiếp xúc với kim loại khác trong không khí ẩm, sắt phải đóng vai trò cực âm (anode) của cặp điện cực.',
        'Muốn sắt là cực âm, sắt phải hoạt động hoá học mạnh hơn kim loại tiếp xúc cùng.',
        'So sánh hoạt động hoá học: Mg > Zn > Fe > Cu.',
        'Do đó, Fe chỉ mạnh hơn Cu. Trong cặp Fe-Cu, Fe bị ăn mòn điện hoá học. Trong cặp Mg-Fe và Zn-Fe, Mg và Zn bị ăn mòn trước để bảo vệ Fe.',
        'Kết luận: Sắt bị ăn mòn khi tiếp xúc với Cu.',
      ],
      answer: 'Cu',
    },
    checkQuestions: [
      {
        prompt:
          'Kim loại nào sau đây có tính khử yếu hơn sắt (Fe) nhưng mạnh hơn đồng (Cu) trong dãy hoạt động hoá học?',
        choices: [
          { id: 'mg', label: 'Magnesium (Mg)' },
          { id: 'pb', label: 'Lead (Chì, Pb)' },
          { id: 'al', label: 'Aluminium (Al)' },
          { id: 'na', label: 'Sodium (Na)' },
        ],
        answer: { kind: 'choice', correctIds: ['pb'] },
        explain:
          'Theo dãy hoạt động hoá học: Mg > Al > Zn > Fe > Ni > Sn > Pb > H > Cu. Do đó Chì (Pb) nằm giữa Fe và Cu.',
      },
      {
        prompt: 'Đặc điểm nào sau đây là của hợp kim so với kim loại gốc cấu tạo nên nó?',
        choices: [
          { id: 'a', label: 'Dẫn điện tốt hơn, cứng hơn' },
          { id: 'b', label: 'Dẫn điện kém hơn, cứng hơn, nhiệt độ nóng chảy thấp hơn' },
          { id: 'c', label: 'Dẫn điện tốt hơn, dẻo hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['b'] },
        explain:
          'Sự xáo trộn mạng tinh thể của hợp kim cản trở chuyển động của electron tự do (dẫn điện kém hơn) và cản trở sự trượt của các lớp nguyên tử (cứng hơn).',
      },
    ],
    srsCards: [
      { hoi: 'Kim loại dẻo nhất có thể dát mỏng cực độ?', dap: 'Vàng (Au).' },
      { hoi: 'Kim loại có khối lượng riêng lớn nhất (nặng nhất)?', dap: 'Osmium (Os).' },
      {
        hoi: 'Nguyên tử sắt có số oxi hoá cực đại là bao nhiêu?',
        dap: '+3 (khi tác dụng chất oxi hoá mạnh như Cl₂, HNO₃).',
      },
    ],
    reviewStatus: 'draft',
  },
]
