// lessons/hoa12c1.ts — Hoá học 12, Chương 1: Ester - Lipid (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C1_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c1-b1',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Ester - Lipid',
    lessonNumber: 1,
    title: 'Ester - Lipid',
    hook:
      'Mùi chuối chín thơm phức là do isoamyl acetate, mùi hoa nhài dịu nhẹ là benzyl acetate. ' +
      'Đó đều là các ester — hợp chất chịu trách nhiệm cho các hương thơm ngọt ngào trong tự nhiên.',
    theory:
      'KHÁI NIỆM VÀ DANH PHÁP ESTER:\\n' +
      "— Khi thay thế nhóm −OH ở nhóm carboxyl của carboxylic acid bằng nhóm −OR' của alcohol ta thu được ester. Công thức tổng quát đơn giản nhất: RCOOR'.\\n" +
      '— Công thức chung của ester no, đơn chức, mạch hở: CₙH₂ₙO₂ (n ≥ 2).\\n' +
      '— Gọi tên ester: [Tên gốc alkyl R\'] + [Tên gốc acid RCOO] (đuôi "ate"). Ví dụ: CH₃COOC₂H₅ gọi là ethyl acetate.\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CỦA ESTER:\\n' +
      '1. Phản ứng thuỷ phân trong môi trường acid (thuận nghịch, t°, xúc tác H₂SO₄):\\n' +
      "   RCOOR' + H₂O ⇌ RCOOH + R'OH.\\n" +
      '2. Phản ứng thuỷ phân trong môi trường kiềm (một chiều, phản ứng xà phòng hoá, t°):\\n' +
      "   RCOOR' + NaOH → RCOONa (muối của acid) + R'OH.\\n\\n" +
      'KHÁI NIỆM VÀ PHÂN LOẠI LIPID (CHẤT BÉO):\\n' +
      '— Lipid là những hợp chất hữu cơ có trong tế bào sống, không tan trong nước nhưng tan nhiều trong dung môi hữu cơ không phân cực.\\n' +
      '— Chất béo (triglyceride) là triester của glycerol với các acid béo (acid đơn chức, mạch carbon dài, không phân nhánh, có số C chẵn từ C12 đến C24).\\n' +
      '— Các acid béo thường gặp: acid palmitic (C₁₅H₃₁COOH), acid stearic (C₁₇H₃₅COOH) (no); acid oleic (C₁₇H₃₃COOH), acid linoleic (C₁₇H₃₁COOH) (không no).\\n' +
      '— Tính chất: Chất béo lỏng (dầu thực vật, chứa nhiều acid béo không no); Chất béo rắn (mỡ động vật, chứa nhiều acid béo no). Phản ứng hiđro hoá chuyển dầu lỏng thành mỡ rắn.',
    workedExample: {
      problem:
        'Cho 8,8 gam ethyl acetate (CH₃COOC₂H₅, M=88) tác dụng hoàn toàn với dung dịch NaOH vừa đủ, đun nóng. ' +
        'Tính khối lượng muối sodium acetate (CH₃COONa, M=82) thu được.',
      steps: [
        'Tính số mol ethyl acetate: n = 8,8 / 88 = 0,1 mol.',
        'Viết phương trình phản ứng xà phòng hoá: CH₃COOC₂H₅ + NaOH → CH₃COONa + C₂H₅OH.',
        'Theo phương trình, tỉ lệ phản ứng là 1:1, nên số mol muối CH₃COONa thu được là 0,1 mol.',
        'Tính khối lượng muối sodium acetate: m = 0,1 * 82 = 8,2 gam.',
      ],
      answer: '8,2 gam',
    },
    checkQuestions: [
      {
        prompt: 'Công thức chung của ester no, đơn chức, mạch hở là gì?',
        choices: [
          { id: 'cnh2n_2_o2', label: 'CₙH₂ₙ₋₂O₂ (n ≥ 3)' },
          { id: 'cnh2n_o2', label: 'CₙH₂ₙO₂ (n ≥ 2)' },
          { id: 'cnh2n_plus2_o2', label: 'CₙH₂ₙ₊₂O₂ (n ≥ 1)' },
        ],
        answer: { kind: 'choice', correctIds: ['cnh2n_o2'] },
        explain:
          'Ester no, đơn chức, mạch hở được tạo từ acid no đơn chức và alcohol no đơn chức, có công thức chung CₙH₂ₙO₂ với n ≥ 2.',
      },
      {
        prompt: 'Chất béo là triester của acid béo với alcohol nào sau đây?',
        choices: [
          { id: 'methanol', label: 'Methanol (CH₃OH)' },
          { id: 'ethanol', label: 'Ethanol (C₂H₅OH)' },
          { id: 'glycerol', label: 'Glycerol (C₃H₅(OH)₃)' },
          { id: 'glycol', label: 'Ethylene glycol (C₂H₄(OH)₂)' },
        ],
        answer: { kind: 'choice', correctIds: ['glycerol'] },
        explain: 'Chất béo (triglyceride) là triester của glycerol và các acid béo.',
      },
    ],
    srsCards: [
      { hoi: 'Ester no đơn chức mạch hở có công thức chung là gì?', dap: 'CₙH₂ₙO₂ (n ≥ 2).' },
      {
        hoi: 'Sự khác nhau giữa thuỷ phân ester trong môi trường acid và kiềm?',
        dap: 'Trong môi trường acid là phản ứng thuận nghịch; trong môi trường kiềm là phản ứng một chiều (xà phòng hoá).',
      },
      { hoi: 'Glycerol có mấy nhóm hydroxyl?', dap: 'Có 3 nhóm hydroxyl (−OH).' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c1-b2',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Ester - Lipid',
    lessonNumber: 2,
    title: 'Xà phòng và chất giặt rửa',
    hook:
      'Nước thông thường không thể tự gột rửa các vết dầu mỡ bám bẩn. Nhưng xà phòng có thể kéo bay ' +
      'dầu mỡ dễ dàng nhờ cấu trúc phân tử mang hai đầu "đối lập" kì lạ.',
    theory:
      'KHÁI NIỆM VỀ XÀ PHÒNG VÀ CHẤT GIẶT RỬA TỔNG HỢP:\\n' +
      '— Xà phòng: là hỗn hợp các muối sodium hoặc potassium của các acid béo (thường là sodium stearate, sodium palmitate...).\\n' +
      '— Chất giặt rửa tổng hợp: là chất giặt rửa được tổng hợp hoá học từ dầu mỏ (ví dụ: sodium alkylbenzene sulfonate).\\n\\n' +
      'CẤU TRÚC PHÂN TỬ VÀ CƠ CHẾ GIẶT RỬA:\\n' +
      '— Phân tử chất giặt rửa gồm hai phần chính:\\n' +
      '  1. Đầu ưa nước (hydrophilic): là nhóm phân cực (như −COONa, −SO₃Na) dễ tan trong nước.\\n' +
      '  2. Đuôi kị nước (hydrophobic): là gốc hydrocarbon dài, không phân cực, dễ tan trong dầu mỡ.\\n\\n' +
      '— Cơ chế tẩy rửa: Đuôi kị nước đâm sâu vào vết dầu mỡ bám trên vải, đầu ưa nước hướng ra ngoài nước lỏng. Lực khuấy nhẹ làm dầu mỡ phân tán thành những hạt micelle rất nhỏ lơ lửng trong nước và bị rửa trôi đi.\\n\\n' +
      'SO SÁNH XÀ PHÒNG VÀ CHẤT GIẶT RỬA TỔNG HỢP:\\n' +
      '— Ưu điểm chất giặt rửa tổng hợp: Không bị mất tác dụng trong nước cứng (nước chứa nhiều ion Ca²⁺, Mg²⁺) vì muối calcium, magnesium của sulfonate tan được trong nước. Xà phòng bị mất tác dụng trong nước cứng do tạo kết tủa dạng cặn của muối carboxylate của Ca²⁺/Mg²⁺.',
    workedExample: {
      problem: 'Giải thích vì sao xà phòng mất khả năng giặt rửa khi dùng trong nước cứng.',
      steps: [
        'Nước cứng là nước chứa nhiều ion Ca²⁺ và Mg²⁺.',
        'Thành phần chính của xà phòng là các muối carboxylate của acid béo như C₁₇H₃₅COONa.',
        'Khi gặp Ca²⁺ và Mg²⁺, phản ứng trao đổi tạo ra muối carboxylate calcium/magnesium kết tủa không tan dạng cặn trắng:\\n  2C₁₇H₃₅COO⁻ + Ca²⁺ → (C₁₇H₃₅COO)₂Ca↓.',
        'Sự tạo cặn này làm mất đi các phân tử xà phòng hoạt động bề mặt, bám bẩn thêm vào sợi vải và làm mất khả năng giặt rửa.',
      ],
      answer: 'Tạo kết tủa không tan với ion Ca²⁺ và Mg²⁺',
    },
    checkQuestions: [
      {
        prompt: 'Thành phần chính của xà phòng thông thường là gì?',
        choices: [
          { id: 'axit', label: 'Các acid béo tự do' },
          { id: 'muoi_natri', label: 'Muối sodium hoặc potassium của các acid béo' },
          { id: 'ester', label: 'Ester của acid béo và glycerol' },
        ],
        answer: { kind: 'choice', correctIds: ['muoi_natri'] },
        explain: 'Xà phòng là hỗn hợp các muối sodium hoặc potassium của acid béo.',
      },
      {
        prompt:
          'Vì sao chất giặt rửa tổng hợp (như bột giặt) vẫn giặt sạch được trong nước cứng còn xà phòng thông thường thì không?',
        choices: [
          {
            id: 'a',
            label: 'Vì muối calcium/magnesium của chất giặt rửa tổng hợp tan tốt trong nước',
          },
          { id: 'b', label: 'Vì chất giặt rửa tổng hợp chứa ít chất béo hơn' },
          { id: 'c', label: 'Vì chất giặt rửa tổng hợp có tính acid mạnh hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Các muối calcium và magnesium của gốc sulfonate (trong chất giặt rửa tổng hợp) tan được trong nước cứng, không tạo kết tủa cặn như gốc carboxylate của xà phòng.',
      },
    ],
    srsCards: [
      { hoi: 'Xà phòng là gì?', dap: 'Muối sodium hoặc potassium của các acid béo.' },
      {
        hoi: 'Hai phần chính trong phân tử chất hoạt động bề mặt?',
        dap: 'Đầu ưa nước (phân cực) và Đuôi kị nước (gốc hydrocarbon dài).',
      },
      {
        hoi: 'Tại sao xà phòng không dùng được trong nước cứng?',
        dap: 'Vì tạo cặn kết tủa với các ion Ca²⁺ và Mg²⁺.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c1-b3',
    grade: '12',
    chapterNumber: 1,
    chapterTitle: 'Ester - Lipid',
    lessonNumber: 3,
    title: 'Ôn tập chương 1',
    hook:
      'Chương 1 trang bị kiến thức về Ester và Lipid, hai lớp chất béo chi phối dinh dưỡng sinh học và ' +
      'ngành công nghiệp xà phòng tẩy rửa thiết yếu.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 1:\\n' +
      "1. Ester (RCOOR'): No đơn chức CₙH₂ₙO₂ (n≥2). Thuỷ phân acid (⇌ tạo acid + alcohol), thuỷ phân kiềm (xà phòng hoá → muối + alcohol).\\n" +
      '2. Lipid (chất béo): Triester của glycerol và acid béo. Thể lỏng (không no, dầu ăn), thể rắn (no, mỡ). Phản ứng hidro hoá chuyển lỏng thành rắn.\\n' +
      '3. Xà phòng: Muối carboxylate của kiềm với acid béo. Mất tác dụng trong nước cứng.\\n' +
      '4. Chất giặt rửa tổng hợp: Gốc sulfonate, dùng được trong nước cứng nhờ muối Ca²⁺/Mg²⁺ của nó tan tốt.',
    workedExample: {
      problem:
        'Thuỷ phân hoàn toàn triolein (chất béo không no, M=884) trong dung dịch NaOH dư, đun nóng. ' +
        'Tính khối lượng glycerol (M=92) thu được từ 8,84 gam triolein.',
      steps: [
        'Tính số mol triolein: n = 8,84 / 884 = 0,01 mol.',
        'Viết phương trình xà phòng hoá: (C₁₇H₃₃COO)₃C₃H₅ + 3NaOH → 3C₁₇H₃₃COONa + C₃H₅(OH)₃.',
        'Theo phương trình, 1 mol triolein sinh ra 1 mol glycerol.',
        'Số mol glycerol thu được = 0,01 mol.',
        'Tính khối lượng glycerol: m = 0,01 * 92 = 0,92 gam.',
      ],
      answer: '0,92 gam',
    },
    checkQuestions: [
      {
        prompt:
          'Thuỷ phân hoàn toàn ethyl formate (HCOOC₂H₅) trong môi trường acid thu được hỗn hợp sản phẩm gồm những chất nào?',
        choices: [
          { id: 'a', label: 'Formic acid (HCOOH) và ethanol (C₂H₅OH)' },
          { id: 'b', label: 'Acetic acid (CH₃COOH) và methanol (CH₃OH)' },
          { id: 'c', label: 'Formic acid (HCOOH) và methanol (CH₃OH)' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Ester HCOOC₂H₅ thuỷ phân trong môi trường acid tạo acid formic HCOOH và cồn ethyl alcohol C₂H₅OH.',
      },
      {
        prompt: 'Chất béo triolein có chứa gốc acid béo nào sau đây?',
        choices: [
          { id: 'palmitic', label: 'Gốc acid palmitic' },
          { id: 'stearic', label: 'Gốc acid stearic' },
          { id: 'oleic', label: 'Gốc acid oleic' },
        ],
        answer: { kind: 'choice', correctIds: ['oleic'] },
        explain: 'Triolein là triester của glycerol và acid oleic, có công thức (C₁₇H₃₃COO)₃C₃H₅.',
      },
    ],
    srsCards: [
      {
        hoi: 'Mỡ động vật chứa nhiều loại chất béo nào?',
        dap: 'Chất béo no (thể rắn ở nhiệt độ thường).',
      },
      {
        hoi: 'Dầu thực vật chứa nhiều loại chất béo nào?',
        dap: 'Chất béo không no (thể lỏng ở nhiệt độ thường).',
      },
      {
        hoi: 'Chất dùng để chuyển hoá dầu lỏng thành mỡ rắn?',
        dap: 'Khí hydrogen (H₂), xúc tác Ni, nhiệt độ.',
      },
    ],
    reviewStatus: 'draft',
  },
]
