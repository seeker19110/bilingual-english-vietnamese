// lessons/hoa11c4.ts — Hoá học 11, Chương 4: Hydrocarbon (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C4_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c4-b15',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Hydrocarbon',
    lessonNumber: 15,
    title: 'Alkane',
    hook:
      'Khí gas nấu ăn hằng ngày chứa propane và butane. Xăng chạy xe máy chứa chủ yếu hexane và octane. ' +
      'Tất cả chúng đều thuộc dòng hydrocarbon no được gọi là alkane.',
    theory:
      'KHÁI NIỆM VÀ ĐỒNG PHÂN:\\n' +
      '— Alkane là các hydrocarbon no, mạch hở, chỉ có liên kết đơn C−C và C−H trong phân tử.\\n' +
      '— Công thức chung: CₙH₂ₙ₊₂ (n ≥ 1).\\n' +
      '— Đồng phân: Từ C₄H₁₀ trở đi có đồng phân mạch carbon (mạch thẳng và mạch phân nhánh).\\n\\n' +
      'DANH PHÁP (Tên thay thế theo IUPAC):\\n' +
      '— Tên 10 alkane mạch thẳng đầu tiên: Methane (C1), Ethane (C2), Propane (C3), Butane (C4), Pentane (C5), Hexane (C6), Heptane (C7), Octane (C8), Nonane (C9), Decane (C10).\\n' +
      '— Nguyên tắc gọi tên alkane mạch nhánh: Chọn mạch dài nhất làm mạch chính → Đánh số C mạch chính từ đầu gần nhánh hơn → Đọc tên: [Vị trí nhánh]-[Tên nhánh][Tên alkane mạch chính].\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC:\\n' +
      'Alkane khá trơ về mặt hoá học, phản ứng đặc trưng là phản ứng thế.\\n' +
      '1. Phản ứng thế halogen (clo hoá, brom hoá): Nguyên tử H ở carbon bậc cao hơn dễ bị thế hơn nguyên tử H ở carbon bậc thấp.\\n' +
      '   Ví dụ: CH₄ + Cl₂ → CH₃Cl + HCl (chiếu sáng).\\n' +
      '2. Phản ứng tách (cracking và reforming): Cracking bẻ gãy liên kết C−C tạo alkane và alkene ngắn hơn; reforming chuyển alkane mạch thẳng thành mạch nhánh hoặc vòng.\\n' +
      '3. Phản ứng oxi hoá (đốt cháy): Phản ứng toả nhiều nhiệt, luôn sinh ra nCO₂ < nH₂O: CₙH₂ₙ₊₂ + (3n+1)/2 O₂ → n CO₂ + (n+1) H₂O.',
    workedExample: {
      problem:
        'Khi cho propane (CH₃-CH₂-CH₃) tác dụng với chlorine (tỉ lệ mol 1:1, chiếu sáng) thu được sản phẩm thế ' +
        'monochlorine chính là chất nào? Giải thích.',
      steps: [
        'Propane có 2 loại nguyên tử Carbon khác nhau: 2 nhóm −CH₃ ở hai đầu (C bậc I) và 1 nhóm −CH₂− ở giữa (C bậc II).',
        'Phản ứng thế halogen ưu tiên xảy ra ở carbon có bậc cao hơn (nơi liên kết C−H yếu hơn, dễ bị bẻ gãy hơn).',
        'Vì vậy, nguyên tử Cl sẽ ưu tiên thế vào nguyên tử H của carbon bậc II ở giữa mạch.',
        'Sản phẩm chính thu được là 2-chloropropane (CH₃-CHCl-CH₃).',
      ],
      answer: '2-chloropropane',
    },
    checkQuestions: [
      {
        prompt: 'Công thức chung của dãy đồng đẳng alkane là gì?',
        choices: [
          { id: 'cnh2n', label: 'CₙH₂ₙ (n ≥ 2)' },
          { id: 'cnh2n_2', label: 'CₙH₂ₙ₋₂ (n ≥ 2)' },
          { id: 'cnh2n_2_plus', label: 'CₙH₂ₙ₊₂ (n ≥ 1)' },
          { id: 'cnh2n_6', label: 'CₙH₂ₙ₋₆ (n ≥ 6)' },
        ],
        answer: { kind: 'choice', correctIds: ['cnh2n_2_plus'] },
        explain: 'Alkane là hydrocarbon no mạch hở có công thức chung CₙH₂ₙ₊₂ với n ≥ 1.',
      },
      {
        prompt: 'Alkane mạch thẳng có 4 nguyên tử Carbon trong phân tử (C₄H₁₀) có tên gọi là gì?',
        choices: [
          { id: 'propane', label: 'Propane' },
          { id: 'butane', label: 'Butane' },
          { id: 'pentane', label: 'Pentane' },
          { id: 'ethane', label: 'Ethane' },
        ],
        answer: { kind: 'choice', correctIds: ['butane'] },
        explain:
          'Theo danh pháp thay thế, alkane mạch thẳng 1C là methane, 2C là ethane, 3C là propane, 4C là butane.',
      },
    ],
    srsCards: [
      { hoi: 'Alkane là gì?', dap: 'Hydrocarbon no, mạch hở, chỉ có liên kết đơn C−C và C−H.' },
      {
        hoi: 'Phản ứng hoá học đặc trưng của alkane là gì?',
        dap: 'Phản ứng thế halogen (chlorine, bromine) dưới ánh sáng.',
      },
      {
        hoi: 'Quy luật thế halogen vào alkane?',
        dap: 'Ưu tiên thế nguyên tử H ở carbon bậc cao hơn (tạo sản phẩm chính).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c4-b16',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Hydrocarbon',
    lessonNumber: 16,
    title: 'Hydrocarbon không no',
    hook:
      'Khí ethylene là một hormone thực vật tự nhiên giúp thúc quả chín nhanh. Trái cây xanh xếp cùng ' +
      'vài quả chín sẽ chín nhanh hơn nhờ khí ethylene giải phóng ra.',
    theory:
      'KHÁI NIỆM PHÂN LOẠI:\\n' +
      '— Alkene: hydrocarbon không no, mạch hở, có 1 liên kết đôi C=C. Công thức chung: CₙH₂ₙ (n ≥ 2).\\n' +
      '— Alkyne: hydrocarbon không no, mạch hở, có 1 liên kết ba C≡C. Công thức chung: CₙH₂ₙ₋₂ (n ≥ 2).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC (Đặc trưng là phản ứng cộng):\\n' +
      'Do có liên kết pi (π) kém bền trong liên kết đôi hoặc liên kết ba, chúng dễ tham gia phản ứng cộng để đạt trạng thái no bền vững hơn.\\n' +
      '1. Phản ứng cộng H₂, X₂ (nước Bromine):\\n' +
      '   — Alkene và alkyne làm MẤT MÀU nước bromine ngay ở điều kiện thường (dùng để nhận biết hydrocarbon không no).\\n' +
      '2. Phản ứng cộng HX, H₂O (quy tắc Markovnikov):\\n' +
      '   — Phát biểu: Khi cộng tác nhân bất đối xứng (như HCl, H₂O) vào alkene bất đối xứng, phần mang điện dương (như H⁺) ưu tiên cộng vào carbon mang liên kết đôi có nhiều H hơn (bậc thấp hơn), phần mang điện âm (như Cl⁻, OH⁻) ưu tiên cộng vào carbon có ít H hơn (bậc cao hơn).\\n' +
      '3. Phản ứng trùng hợp (đối với alkene):\\n' +
      '   — Nhiều phân tử alkene nhỏ (monomer) kết hợp với nhau tạo phân tử polymer mạch rất dài dưới tác dụng của t°, p, xt.\\n' +
      '   — Ví dụ trùng hợp ethylene: n CH₂=CH₂ → −(CH₂−CH₂)−ₙ (Polyethylene - nhựa PE).\\n' +
      '4. Phản ứng oxi hoá bởi dung dịch KMnO₄:\\n' +
      '   — Alkene và alkyne làm MẤT MÀU dung dịch thuốc tím KMnO₄ và tạo kết tủa đen MnO₂ (dùng nhận biết alkene/alkyne).\\n' +
      '5. Phản ứng thế kim loại của alk-1-yne:\\n' +
      '   — Các alkyne có liên kết ba đầu mạch (alk-1-yne như CH≡CH) phản ứng được với dung dịch AgNO₃ trong NH₃ tạo kết tủa màu vàng nhạt (bạc acetylide): CH≡CH + 2AgNO₃ + 2NH₃ → AgC≡CAg↓ + 2NH₄NO₃ (dùng nhận biết alk-1-yne).',
    workedExample: {
      problem:
        'Áp dụng quy tắc Markovnikov để xác định công thức cấu tạo của sản phẩm chính khi cho ' +
        'propene (CH₃-CH=CH₂) phản ứng cộng với hydrogen chloride (HCl).',
      steps: [
        'Propene là alkene bất đối xứng. Hai carbon mang liên kết đôi là C số 1 (CH₂ có 2 H) và C số 2 (CH có 1 H).',
        'Theo quy tắc Markovnikov, H⁺ của tác nhân HCl ưu tiên cộng vào C có nhiều H hơn (C số 1: CH₂), biến CH₂ thành CH₃.',
        'Nguyên tử Cl⁻ sẽ cộng vào C mang liên kết đôi có ít H hơn (C số 2: CH), biến CH thành CH-Cl.',
        'Kết quả thu được sản phẩm chính là: CH₃-CH(Cl)-CH₃ (2-chloropropane).',
      ],
      answer: 'CH3-CH(Cl)-CH3',
    },
    checkQuestions: [
      {
        prompt: ' alkene và alkyne làm mất màu dung dịch chất nào sau đây ngay ở điều kiện thường?',
        choices: [
          { id: 'nacl', label: 'Dung dịch NaCl' },
          { id: 'brom', label: 'Dung dịch nước Bromine (Br₂)' },
          { id: 'hcl', label: 'Dung dịch HCl' },
          { id: 'naoh', label: 'Dung dịch NaOH' },
        ],
        answer: { kind: 'choice', correctIds: ['brom'] },
        explain:
          'Liên kết pi kém bền của alkene và alkyne dễ dàng cộng với bromine làm mất màu nâu đỏ của dung dịch bromine ở điều kiện thường.',
      },
      {
        prompt:
          'Chất nào sau đây tác dụng với dung dịch AgNO₃ trong NH₃ tạo ra kết tủa màu vàng nhạt?',
        choices: [
          { id: 'ch4', label: 'Methane (CH₄)' },
          { id: 'c2h4', label: 'Ethylene (C₂H₄)' },
          { id: 'c2h2', label: 'Acetylene (CH≡CH)' },
          { id: 'c2h6', label: 'Ethane (C₂H₆)' },
        ],
        answer: { kind: 'choice', correctIds: ['c2h2'] },
        explain:
          'Acetylene là alk-1-yne, nguyên tử H linh động đính ở carbon mang liên kết ba đầu mạch bị thế bởi ion bạc tạo kết tủa vàng nhạt AgC≡CAg.',
      },
    ],
    srsCards: [
      {
        hoi: 'Công thức chung của Alkene và Alkyne?',
        dap: 'Alkene: CₙH₂ₙ (n ≥ 2); Alkyne: CₙH₂ₙ₋₂ (n ≥ 2).',
      },
      {
        hoi: 'Quy tắc Markovnikov áp dụng khi nào?',
        dap: 'Cộng tác nhân bất đối xứng (HX, H₂O) vào alkene bất đối xứng: H vào C nhiều H hơn, X vào C ít H hơn.',
      },
      {
        hoi: 'Phản ứng dùng để nhận biết alk-1-yne?',
        dap: 'Tác dụng với AgNO₃/NH₃ tạo kết tủa màu vàng nhạt.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c4-b17',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Hydrocarbon',
    lessonNumber: 17,
    title: 'Arene (Hydrocarbon thơm)',
    hook:
      'Benzene có cấu trúc vòng lục giác hoàn hảo với hệ liên kết bền vững khác thường. Nhờ độ bền này, ' +
      'nó là dung môi công nghiệp cực tốt, nhưng lại cực độc đối với con người.',
    theory:
      'CẤU TẠO PHÂN TỬ BENZENE (C₆H₆):\\n' +
      '— Phân tử benzene gồm 6 nguyên tử C tạo thành một vòng sáu cạnh đều nằm trên một mặt phẳng. Hệ liên kết pi (π) liên hợp khép kín tạo nên cấu trúc vòng siêu bền (nhân thơm).\\n\\n' +
      'DANH PHÁP ARENE:\\n' +
      '— Dãy đồng đẳng arene gồm benzene (C₆H₆) và các alkylbenzene (toluene C₆H₅-CH₃, xylene C₆H₄(CH₃)₂...).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC (Tính thơm: dễ thế, khó cộng, bền với chất oxi hoá):\\n' +
      '1. Phản ứng thế ở nhân thơm (tính chất đặc trưng):\\n' +
      '   — Thế halogen (brom hoá): Benzene phản ứng với Br₂ khan khi có xúc tác FeBr₃ tạo bromobenzene: C₆H₆ + Br₂ → C₆H₅Br + HBr.\\n' +
      '   — Phản ứng nitro hoá: Phản ứng với hỗn hợp HNO₃ đặc / H₂SO₄ đặc tạo nitrobenzene.\\n' +
      '   — Đối với toluene: Nhóm alkyl (−CH₃) hoạt hoá nhân thơm, làm phản ứng thế xảy ra dễ dàng hơn benzene và ưu tiên thế vào vị trí ortho (o-) và para (p-).\\n' +
      '2. Phản ứng cộng vào nhân thơm (chỉ xảy ra ở điều kiện khắc nghiệt):\\n' +
      '   — Cộng H₂ (t°, Ni) tạo cyclohexane.\\n' +
      '   — Cộng Cl₂ (chiếu sáng) tạo thuốc trừ sâu 666 (hexachlorocyclohexane C₆H₆Cl₆).\\n' +
      '3. Phản ứng oxi hoá mạch nhánh của alkylbenzene:\\n' +
      '   — Toluene phản ứng với dung dịch KMnO₄ khi đun nóng, làm mất màu thuốc tím tạo kali benzoate (C₆H₅COOK) và kết tủa đen MnO₂. Benzene không phản ứng.',
    workedExample: {
      problem:
        'Trình bày phương pháp hoá học đơn giản để phân biệt hai chất lỏng không màu đựng riêng biệt: ' +
        'Benzene và Toluene.',
      steps: [
        'Trích mẫu thử của hai chất lỏng.',
        'Nhỏ dung dịch thuốc tím KMnO₄ vào từng mẫu thử ở nhiệt độ thường ⇒ cả hai đều không phản ứng, không mất màu thuốc tím.',
        'Đun nóng nhẹ cả hai ống nghiệm.',
        'Ống nghiệm chứa Toluene xuất hiện kết tủa đen MnO₂ và làm mất màu tím của KMnO₄ (do oxi hoá nhóm −CH₃ thành −COOK).',
        'Ống nghiệm chứa Benzene vẫn giữ nguyên màu tím của KMnO₄ vì nhân benzene bền, không bị KMnO₄ oxi hoá kể cả khi đun nóng.',
      ],
      answer: 'Dùng dung dịch KMnO₄ đun nóng',
    },
    checkQuestions: [
      {
        prompt: 'Tính chất hoá học đặc trưng của nhân benzene là gì (quy tắc tính thơm)?',
        choices: [
          { id: 'a', label: 'Dễ cộng, khó thế, dễ bị oxi hoá' },
          { id: 'b', label: 'Dễ thế, khó cộng, bền vững với các chất oxi hoá' },
          { id: 'c', label: 'Chỉ tham gia phản ứng cháy' },
        ],
        answer: { kind: 'choice', correctIds: ['b'] },
        explain:
          'Cấu trúc vòng liên hợp bền vững của benzene làm cho nó có tính thơm: dễ tham gia phản ứng thế, khó tham gia phản ứng cộng và bền với các chất oxi hoá thông thường.',
      },
      {
        prompt:
          'Khi cho toluene tác dụng với dung dịch KMnO₄ và đun nóng, nhóm methyl (−CH₃) bị oxi hoá thành nhóm chức nào?',
        choices: [
          { id: 'ald', label: 'Aldehyde (−CHO)' },
          { id: 'alk', label: 'Alcohol (−CH₂OH)' },
          { id: 'car', label: 'Carboxylate (−COOK / −COOH)' },
          { id: 'ket', label: 'Ketone (−CO−)' },
        ],
        answer: { kind: 'choice', correctIds: ['car'] },
        explain:
          'Toluene bị oxi hoá bởi KMnO₄ nóng tạo thành muối kali benzoate C₆H₅COOK, axit hoá sẽ thu được axit benzoic C₆H₅COOH.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao benzene bền với chất oxi hoá?',
        dap: 'Vì có cấu trúc vòng phẳng sáu cạnh đều với hệ electron pi liên hợp khép kín siêu bền.',
      },
      {
        hoi: 'Hiện tượng phân biệt benzene và toluene bằng KMnO₄?',
        dap: 'Toluene làm mất màu KMnO₄ khi đun nóng, Benzene thì không.',
      },
      {
        hoi: 'Quy tắc thế vào toluene khác benzene thế nào?',
        dap: 'Nhóm methyl giúp thế dễ dàng hơn và định hướng vào vị trí ortho và para.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c4-b18',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Hydrocarbon',
    lessonNumber: 18,
    title: 'Ôn tập chương 4',
    hook:
      'Ôn tập và đối chiếu 4 nhóm hydrocarbon quan trọng nhất: Saturated (no), Unsaturated (không no) và Aromatic (thơm). ' +
      'Sự khác biệt cấu trúc tạo nên tính chất hoá học đặc trưng.',
    theory:
      'TỔNG KẾT SO SÁNH CÁC LỚP HYDROCARBON:\\n' +
      '1. Alkane (CₙH₂ₙ₊₂): Chỉ chứa liên kết đơn C−C, C−H. Phản ứng thế halogen (chiếu sáng) đặc trưng. Đốt cháy cho nCO₂ < nH₂O.\\n' +
      '2. Alkene (CₙH₂ₙ): Có 1 liên kết đôi C=C (chứa 1 liên kết pi kém bền). Phản ứng cộng (H₂, Br₂, HX, H₂O) đặc trưng, phản ứng trùng hợp. Làm mất màu nước Bromine và dung dịch KMnO₄.\\n' +
      '3. Alkyne (CₙH₂ₙ₋₂): Có 1 liên kết ba C≡C (chứa 2 liên kết pi kém bền). Phản ứng cộng tương tự alkene. Riêng alk-1-yne thế AgNO₃/NH₃ tạo kết tủa vàng nhạt.\\n' +
      '4. Arene (CₙH₂ₙ₋₆): Có nhân benzene bền vững. Phản ứng thế nhân đặc trưng, khó cộng. Alkylbenzene bị oxi hoá nhánh bởi KMnO₄ nóng.',
    workedExample: {
      problem:
        'Một hydrocarbon X có công thức phân tử C₂H₂. Khi sục X vào dung dịch AgNO₃ trong NH₃ dư ' +
        'thấy xuất hiện kết tủa màu vàng nhạt. Xác định tên gọi của X.',
      steps: [
        'Công thức phân tử C₂H₂ ứng với chất duy nhất là Acetylene (CH≡CH).',
        'Phân tử có liên kết ba đầu mạch (alk-1-yne) nên các nguyên tử H liên kết với carbon không no mang tính linh động cao.',
        'Ag⁺ trong phức bạc thế nguyên tử H đầu mạch tạo kết tủa màu vàng nhạt bạc acetylide (AgC≡CAg).',
        'Tên gọi của X là Acetylene (hoặc ethyne).',
      ],
      answer: 'Acetylene',
    },
    checkQuestions: [
      {
        prompt:
          'Đốt cháy hoàn toàn một hydrocarbon thu được số mol CO₂ nhỏ hơn số mol H₂O (nCO₂ < nH₂O). Hydrocarbon đó thuộc dãy đồng đẳng nào?',
        choices: [
          { id: 'alkane', label: 'Alkane' },
          { id: 'alkene', label: 'Alkene' },
          { id: 'alkyne', label: 'Alkyne' },
          { id: 'arene', label: 'Arene' },
        ],
        answer: { kind: 'choice', correctIds: ['alkane'] },
        explain:
          'Chỉ có đốt cháy alkane (CₙH₂ₙ₊₂) mới tạo ra tỉ lệ nước nhiều hơn CO₂ (nH₂O / nCO₂ = (n+1)/n > 1).',
      },
      {
        prompt:
          'Để phân biệt nhanh alkene (như ethylene) và alkane (như ethane) đựng trong 2 bình mất nhãn, thuốc thử tối ưu là gì?',
        choices: [
          { id: 'na', label: 'Kim loại Sodium (Na)' },
          { id: 'hcl', label: 'Dung dịch HCl' },
          { id: 'brom', label: 'Dung dịch nước Bromine' },
        ],
        answer: { kind: 'choice', correctIds: ['brom'] },
        explain:
          'Ethylene phản ứng cộng với bromine làm mất màu nước bromine, còn ethane không phản ứng ở điều kiện thường.',
      },
    ],
    srsCards: [
      { hoi: 'Hydrocarbon làm mất màu nước bromine?', dap: 'Alkene và Alkyne.' },
      {
        hoi: 'Chất dùng phân biệt alk-1-yne với các alkyne khác?',
        dap: 'Dung dịch AgNO₃ trong NH₃ (tạo kết tủa vàng nhạt).',
      },
      {
        hoi: 'Dấu hiệu nhận biết Arene có nhánh alkyl?',
        dap: 'Làm mất màu dung dịch KMnO₄ khi đun nóng.',
      },
    ],
    reviewStatus: 'draft',
  },
]
