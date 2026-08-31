// lessons/hoa12c3.ts — Hoá học 12, Chương 3: Hợp chất chứa nitrogen (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C3_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c3-b8',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Hợp chất chứa nitrogen',
    lessonNumber: 8,
    title: 'Amine',
    hook:
      'Mùi tanh đặc trưng của cá là do các phân tử amine gây ra (như trimethylamine). ' +
      'Để giảm bớt mùi tanh này khi kho cá, ta thường nấu chung với các chất có vị chua như giấm hoặc nước khế.',
    theory:
      'KHÁI NIỆM VÀ PHÂN LOẠI:\\n' +
      '— Amine là hợp chất hữu cơ thu được khi thay thế một hoặc nhiều nguyên tử hydrogen trong phân tử NH₃ bằng một hoặc nhiều gốc hydrocarbon.\\n' +
      "— Phân loại theo bậc amine (bằng số gốc hydrocarbon liên kết với nguyên tử N): Amine bậc I (R−NH₂), Amine bậc II (R−NH−R'), Amine bậc III (R−N(R')−R\").\\n" +
      '— Phân loại theo gốc hydrocarbon: Aliphatic amine (amine béo, vd: methylamine, ethylamine) và Aromatic amine (amine thơm, vd: aniline C₆H₅NH₂).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CỦA AMINE:\\n' +
      '1. Tính base yếu (do nguyên tử N còn một cặp electron tự do chưa liên kết):\\n' +
      '   — Aliphatic amine có tính base mạnh hơn NH₃, làm quỳ tím hoá xanh, phenolphthalein hoá hồng, phản ứng dễ dàng với acid tạo muối.\\n' +
      '   — Aniline (amine thơm) có tính base rất yếu (yếu hơn NH₃) do vòng benzene hút electron, không làm đổi màu quỳ tím hay phenolphthalein. Aniline phản ứng được với acid mạnh (như HCl) tạo muối tan: C₆H₅NH₂ + HCl → C₆H₅NH₃Cl (phenylammonium chloride).\\n' +
      '2. Phản ứng thế ở nhân thơm của aniline:\\n' +
      '   — Aniline phản ứng cực kì dễ dàng với nước Bromine ở nhiệt độ thường tạo KẾT TỦA TRẮNG 2,4,6-tribromoaniline (nhận biết aniline): C₆H₅NH₂ + 3Br₂ → C₆H₂NH₂Br₃↓ + 3HBr.',
    workedExample: {
      problem:
        'Cho 9,3 gam aniline (C₆H₅NH₂, M=93) tác dụng hoàn toàn với dung dịch HCl dư. ' +
        'Tính khối lượng muối phenylammonium chloride (C₆H₅NH₃Cl, M=129,5) thu được.',
      steps: [
        'Tính số mol aniline phản ứng: n = 9,3 / 93 = 0,1 mol.',
        'Viết phương trình phản ứng tạo muối: C₆H₅NH₂ + HCl → C₆H₅NH₃Cl.',
        'Theo tỉ lệ phản ứng 1:1, số mol muối thu được là 0,1 mol.',
        'Tính khối lượng muối: m = 0,1 * 129,5 = 12,95 gam.',
      ],
      answer: '12,95 gam',
    },
    checkQuestions: [
      {
        prompt: 'Trimethylamine (CH₃)₃N thuộc loại amine bậc mấy?',
        choices: [
          { id: 'i', label: 'Amine bậc I' },
          { id: 'ii', label: 'Amine bậc II' },
          { id: 'iii', label: 'Amine bậc III' },
        ],
        answer: { kind: 'choice', correctIds: ['iii'] },
        explain:
          'Trong trimethylamine, nguyên tử N liên kết với 3 gốc methyl (−CH₃) nên đây là amine bậc III.',
      },
      {
        prompt:
          'Nhỏ nước bromine vào ống nghiệm chứa aniline ở nhiệt độ thường, xuất hiện hiện tượng gì?',
        choices: [
          { id: 'khi', label: 'Có bọt khí thoát ra' },
          { id: 'tua_trang', label: 'Xuất hiện kết tủa màu trắng' },
          { id: 'khong', label: 'Không có hiện tượng gì' },
        ],
        answer: { kind: 'choice', correctIds: ['tua_trang'] },
        explain:
          'Nhóm −NH₂ đẩy electron hoạt hoá nhân thơm, làm aniline dễ phản ứng với nước bromine tạo kết tủa trắng 2,4,6-tribromoaniline.',
      },
    ],
    srsCards: [
      {
        hoi: 'Bậc của amine được xác định thế nào?',
        dap: 'Bằng số nguyên tử hydrogen của NH₃ bị thế bởi gốc hydrocarbon.',
      },
      {
        hoi: 'Tại sao aniline có tính base yếu hơn methylamine?',
        dap: 'Vì nhân benzene hút electron làm giảm mật độ electron tự do trên nguyên tử N.',
      },
      {
        hoi: 'Phản ứng đặc trưng dùng nhận biết aniline?',
        dap: 'Tác dụng nước bromine tạo kết tủa trắng 2,4,6-tribromoaniline.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c3-b9',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Hợp chất chứa nitrogen',
    lessonNumber: 9,
    title: 'Amino acid và peptide',
    hook:
      'Gia vị bột ngọt (mì chính) chính là muối sodium của acid glutamic — một amino acid phổ biến. ' +
      'Các amino acid này liên kết với nhau bằng liên kết peptide tạo thành cấu trúc cơ bắp của động vật.',
    theory:
      'AMINO ACID:\\n' +
      '— Khái niệm: Là hợp chất hữu cơ tạp chức, phân tử chứa đồng thời nhóm amino (−NH₂) và nhóm carboxyl (−COOH).\\n' +
      '— Trạng thái: Chất rắn kết tinh, vị hơi ngọt, nhiệt độ nóng chảy cao (do tồn tại ở dạng ion lưỡng cực H₃N⁺−CH(R)−COO⁻).\\n' +
      '— Các amino acid thường gặp (bắt buộc nhớ cấu trúc và phân tử khối):\\n' +
      '  1. Glycine (Gly): H₂N−CH₂−COOH (M = 75).\\n' +
      '  2. Alanine (Ala): CH₃−CH(NH₂)−COOH (M = 89).\\n' +
      '  3. Valine (Val): (CH₃)₂CH−CH(NH₂)−COOH (M = 117).\\n' +
      '  4. Glutamic acid (Glu): HOOC−(CH₂)₂−CH(NH₂)−COOH (2 nhóm −COOH, 1 nhóm −NH₂, M = 147).\\n' +
      '  5. Lysine (Lys): H₂N−(CH₂)₄−CH(NH₂)−COOH (1 nhóm −COOH, 2 nhóm −NH₂, M = 146).\\n' +
      '— Tính chất hoá học: Có tính lưỡng tính (phản ứng với cả acid và base mạnh). Dung dịch Gly, Ala, Val trung tính; Glu axit (quỳ hoá đỏ); Lys base (quỳ hoá xanh).\\n\\n' +
      'PEPTIDE:\\n' +
      '— Khái niệm: Là hợp chất chứa từ 2 đến 50 mắt xích α-amino acid liên kết với nhau bằng các liên kết peptide −CO−NH−.\\n' +
      '— Phản ứng màu biuret (nhận biết peptide): Các peptide chứa từ 3 mắt xích trở lên (tripeptide trở lên) phản ứng với Cu(OH)₂ trong môi trường kiềm tạo dung dịch màu TÍM đặc trưng. Dipeptide không có phản ứng này.',
    workedExample: {
      problem:
        'Tính phân tử khối của dipeptide Gly-Ala được tạo thành từ 1 phân tử Glycine và 1 phân tử Alanine.',
      steps: [
        'Glycine có phân tử khối M = 75. Alanine có phân tử khối M = 89.',
        'Khi 2 amino acid liên kết với nhau tạo dipeptide, chúng phản ứng tách đi 1 phân tử nước H₂O (M=18) để hình thành liên kết peptide −CO−NH−.',
        'Công thức tính phân tử khối dipeptide: M = M(Gly) + M(Ala) − M(H₂O).',
        'Tính toán: M = 75 + 89 − 18 = 146 g/mol.',
      ],
      answer: '146',
    },
    checkQuestions: [
      {
        prompt:
          'Chất nào sau đây có tính chất lưỡng tính (tác dụng với cả dung dịch acid mạnh và base mạnh)?',
        choices: [
          { id: 'amine', label: 'Methylamine' },
          { id: 'aminoacid', label: 'Glycine' },
          { id: 'ester', label: 'Ethyl acetate' },
        ],
        answer: { kind: 'choice', correctIds: ['aminoacid'] },
        explain:
          'Glycine có nhóm carboxyl −COOH (axit) và nhóm amino −NH₂ (base) trong cùng phân tử nên thể hiện tính lưỡng tính.',
      },
      {
        prompt:
          'Phản ứng màu biuret (tạo phức màu tím với Cu(OH)₂/NaOH) KHÔNG xảy ra với chất nào sau đây?',
        choices: [
          { id: 'di', label: 'Dipeptide (như Gly-Ala)' },
          { id: 'tri', label: 'Tripeptide (như Gly-Ala-Gly)' },
          { id: 'tetra', label: 'Tetrapeptide' },
        ],
        answer: { kind: 'choice', correctIds: ['di'] },
        explain:
          'Chỉ các peptide chứa từ 2 liên kết peptide trở lên (tức là tripeptide có 3 mắt xích trở lên) mới tạo phức màu tím đặc trưng với Cu(OH)₂ trong môi trường kiềm.',
      },
    ],
    srsCards: [
      { hoi: 'Mảnh mắt xích cấu tạo nên peptide tự nhiên là gì?', dap: 'Các gốc α-amino acid.' },
      {
        hoi: 'Phân tử khối của Glycine và Alanine bằng bao nhiêu?',
        dap: 'Glycine M = 75; Alanine M = 89.',
      },
      {
        hoi: 'Amino acid nào làm quỳ tím chuyển sang màu xanh?',
        dap: 'Lysine (vì chứa 2 nhóm −NH₂ và chỉ có 1 nhóm −COOH).',
      },
      {
        hoi: 'Liên kết peptide có cấu tạo thế nào?',
        dap: 'Nhóm liên kết −CO−NH− giữa hai đơn vị α-amino acid.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c3-b10',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Hợp chất chứa nitrogen',
    lessonNumber: 10,
    title: 'Protein và enzyme',
    hook:
      'Lòng trắng trứng đông tụ thành thể rắn màu trắng khi chiên nóng. Tóc và tơ nhện dẻo dai ' +
      'đều là protein. Enzyme là các xúc tác sinh học giúp cơ thể ta tiêu hoá thức ăn chỉ trong vài giờ.',
    theory:
      'PROTEIN (Chất đạm):\\n' +
      '— Khái niệm: Là những polypeptide cao phân tử có khối lượng phân tử lớn từ vài chục nghìn đến hàng triệu g/mol.\\n' +
      '— Phân loại: Protein đơn giản (chỉ chứa các gốc α-amino acid, vd: albumin của lòng trắng trứng) và Protein phức tạp (có thêm thành phần phi protein như nucleic acid, lipid, carbohydrate...).\\n\\n' +
      'TÍNH CHẤT CỦA PROTEIN:\\n' +
      '1. Sự đông tụ (denaturation): Dưới tác dụng của nhiệt độ, acid, base hoặc muối kim loại nặng, protein bị mất cấu trúc không gian ba chiều tự nhiên và đông tụ lại thành chất rắn vô định hình (vd: trứng chín, sữa chua đông tụ).\\n' +
      '2. Phản ứng thuỷ phân: Phân huỷ nhờ acid, base hoặc enzyme tạo thành các chuỗi peptide ngắn và cuối cùng là hỗn hợp các α-amino acid.\\n' +
      '3. Phản ứng màu biuret: Tạo phức màu tím đặc trưng với Cu(OH)₂ trong môi trường kiềm.\\n\\n' +
      'ENZYME VÀ VAI TRÒ SINH HỌC:\\n' +
      '— Enzyme là những chất hầu hết có bản chất protein, xúc tác cho các phản ứng hoá sinh trong cơ thể sinh vật với hiệu quả cực cao và tính chọn lọc tuyệt đối (hoạt động theo cơ chế khớp khít "chìa khoá - ổ khoá" tại trung tâm hoạt động).',
    workedExample: {
      problem:
        'Trình bày hiện tượng xảy ra khi nhỏ vài giọt dung dịch acid nitric (HNO₃) đặc vào dung dịch lòng trắng trứng.',
      steps: [
        'Lòng trắng trứng chứa thành phần chính là protein albumin tan trong nước.',
        'HNO₃ đặc vừa là acid mạnh vừa là tác nhân gây đông tụ protein.',
        'Khi cho vào dung dịch lòng trắng trứng, protein bị đông tụ tạo kết tủa màu vàng đặc trưng (do phản ứng thế nitro vào vòng chứa nhân thơm của amino acid như tyrosine trong protein).',
      ],
      answer: 'Xuất hiện kết tủa màu vàng',
    },
    checkQuestions: [
      {
        prompt: 'Hiện tượng lòng trắng trứng đông tụ lại khi đun nóng được gọi là hiện tượng gì?',
        choices: [
          { id: 'thuỷphan', label: 'Thuỷ phân' },
          { id: 'đôngtụ', label: 'Sự đông tụ (biến tính)' },
          { id: 'trungngung', label: 'Trùng ngưng' },
        ],
        answer: { kind: 'choice', correctIds: ['đôngtụ'] },
        explain:
          'Sự đông tụ của protein xảy ra khi cấu trúc không gian bị phá vỡ bởi nhiệt độ cao.',
      },
      {
        prompt: 'Enzyme có đặc điểm xúc tác nổi bật nào so với các xúc tác hoá học thông thường?',
        choices: [
          {
            id: 'a',
            label:
              'Hiệu quả xúc tác cực cao và tính chọn lọc (chỉ xúc tác cho một phản ứng nhất định)',
          },
          { id: 'b', label: 'Có thể hoạt động tốt ở nhiệt độ hàng nghìn độ C' },
          { id: 'c', label: 'Không có bản chất hoá học xác định' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Enzyme là chất xúc tác sinh học có hoạt tính cao hơn chất xúc tác hoá học hàng triệu lần, hoạt động ở điều kiện ôn hoà và có tính chọn lọc rất cao.',
      },
    ],
    srsCards: [
      {
        hoi: 'Protein là gì?',
        dap: 'Polypeptide cao phân tử có khối lượng phân tử lớn, được tạo nên từ các gốc α-amino acid.',
      },
      {
        hoi: 'Các tác nhân gây đông tụ protein?',
        dap: 'Nhiệt độ cao, acid, base, hoặc ion kim loại nặng.',
      },
      { hoi: 'Bản chất của enzyme hầu hết là gì?', dap: 'Protein.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c3-b11',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Hợp chất chứa nitrogen',
    lessonNumber: 11,
    title: 'Ôn tập chương 3',
    hook:
      'Hệ thống hoá thế giới hợp chất hữu cơ chứa nitrogen — cầu nối trực tiếp giữa hoá học hữu cơ thuần tuý ' +
      'với thế giới sinh học sống động.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 3:\\n' +
      '1. Amine (R−NH₂): Có tính base (béo > NH₃ > thơm). Aniline có tính base yếu không đổi màu quỳ, tạo kết tủa trắng với nước bromine.\\n' +
      '2. Amino acid: Có nhóm −NH₂ và −COOH. Tính chất lưỡng tính. Trạng thái ion lưỡng cực rắn. Gly (75), Ala (89), Val (117), Glu (147, quỳ hoá đỏ), Lys (146, quỳ hoá xanh).\\n' +
      '3. Peptide: Liên kết −CO−NH− giữa các α-amino acid. Phản ứng màu biuret tạo dung dịch màu tím (tripeptide trở lên). Thuỷ phân cắt liên kết peptide.\\n' +
      '4. Protein: Polypeptide khổng lồ. Có phản ứng đông tụ do nhiệt, acid, kiềm. Có phản ứng màu biuret.',
    workedExample: {
      problem: 'Lập sơ đồ phân biệt 3 dung dịch mất nhãn: alanine, lysine, và aniline.',
      steps: [
        'Trích mẫu thử của 3 dung dịch.',
        'Nhỏ nước bromine vào các mẫu thử: mẫu xuất hiện kết tủa trắng là aniline.',
        'Dùng giấy quỳ tím nhúng vào 2 mẫu còn lại (alanine, lysine).',
        'Mẫu làm quỳ tím hoá xanh là lysine (chứa 2 nhóm base −NH₂ và 1 nhóm acid −COOH).',
        'Mẫu không làm quỳ tím đổi màu (vẫn màu tím hoặc trung tính) là alanine (chứa 1 nhóm −NH₂ và 1 nhóm −COOH).',
      ],
      answer: 'Dùng nước bromine và quỳ tím',
    },
    checkQuestions: [
      {
        prompt: 'Dung dịch chất nào sau đây làm quỳ tím chuyển sang màu xanh?',
        choices: [
          { id: 'alanine', label: 'Alanine' },
          { id: 'lysine', label: 'Lysine' },
          { id: 'glutamic', label: 'Glutamic acid' },
          { id: 'aniline', label: 'Aniline' },
        ],
        answer: { kind: 'choice', correctIds: ['lysine'] },
        explain:
          'Lysine có số nhóm −NH₂ (2) lớn hơn số nhóm −COOH (1) nên làm quỳ tím hoá xanh. Alanine trung tính, glutamic acid làm quỳ hoá đỏ, aniline trơ.',
      },
      {
        prompt: 'Dipeptide Gly-Ala phản ứng được với chất nào sau đây nhờ tính lưỡng tính?',
        choices: [
          { id: 'a', label: 'Cả dung dịch HCl và dung dịch NaOH' },
          { id: 'b', label: 'Chỉ dung dịch HCl' },
          { id: 'c', label: 'Chỉ dung dịch NaOH' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Peptide cấu tạo từ các amino acid còn dư nhóm −NH₂ ở đầu N và −COOH ở đầu C nên vẫn giữ tính chất lưỡng tính, phản ứng với cả acid và base.',
      },
    ],
    srsCards: [
      {
        hoi: 'Chất hữu cơ vừa tác dụng với HCl vừa tác dụng với NaOH là chất có tính chất gì?',
        dap: 'Tính lưỡng tính.',
      },
      { hoi: 'Peptide nào không tạo phức màu tím với Cu(OH)₂/NaOH?', dap: 'Dipeptide.' },
      {
        hoi: 'Muối phenylammonium chloride tan tốt trong nước không?',
        dap: 'Có (vì là muối ion).',
      },
    ],
    reviewStatus: 'draft',
  },
]
