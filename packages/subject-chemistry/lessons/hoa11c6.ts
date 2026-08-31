// lessons/hoa11c6.ts — Hoá học 11, Chương 6: Hợp chất carbonyl - Carboxylic acid (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/11/page_0005.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA11_C6_LESSONS: ChemLesson[] = [
  {
    id: 'hoa11-c6-b23',
    grade: '11',
    chapterNumber: 6,
    chapterTitle: 'Hợp chất carbonyl - Carboxylic acid',
    lessonNumber: 23,
    title: 'Hợp chất carbonyl',
    hook:
      'Dung dịch formalin dùng để bảo quản xác sinh vật chứa formaldehyde. Nước rửa sơn móng tay có mùi thơm chứa acetone. ' +
      'Cả hai đều chứa nhóm chức carbonyl linh hoạt bậc nhất trong hoá hữu cơ.',
    theory:
      'KHÁI NIỆM VÀ PHÂN LOẠI:\\n' +
      '— Hợp chất carbonyl là hợp chất hữu cơ trong phân tử có chứa nhóm carbonyl (C=O).\\n' +
      '— Aldehyde: nhóm carbonyl liên kết với ít nhất một nguyên tử hydrogen (R−CHO, với chất đơn giản nhất là HCHO).\\n' +
      "— Ketone: nhóm carbonyl liên kết với hai gốc hydrocarbon (R−CO−R').\\n\\n" +
      'TÍNH CHẤT HOÁ HỌC:\\n' +
      '1. Phản ứng khử (cộng H₂):\\n' +
      '   — Aldehyde bị khử bởi H₂ (Ni, t°) tạo alcohol bậc I: R−CHO + H₂ → R−CH₂OH.\\n' +
      "   — Ketone bị khử bởi H₂ (Ni, t°) tạo alcohol bậc II: R−CO−R' + H₂ → R−CH(OH)−R'.\\n" +
      '2. Phản ứng oxi hoá (chỉ có ở aldehyde, ketone bền vững với chất oxi hoá yếu):\\n' +
      '   — Phản ứng tráng bạc: Aldehyde tác dụng với thuốc thử Tollens [Ag(NH₃)₂]OH tạo ra lớp kim loại bạc sáng bóng như gương bám vào thành ống nghiệm (tráng gương):\\n' +
      '     R−CHO + 2[Ag(NH₃)₂]OH → R−COONH₄ + 2Ag↓ + 3NH₃ + H₂O (t°).\\n' +
      '     (Riêng HCHO phản ứng tạo ra 4Ag do nhóm −CHO ở cả hai đầu của cấu trúc vô cơ trung gian).\\n' +
      '   — Phản ứng với Cu(OH)₂ trong môi trường kiềm nóng: Aldehyde tạo kết tủa đỏ gạch Cu₂O:\\n' +
      '     R−CHO + 2Cu(OH)₂ + NaOH → R−COONa + Cu₂O↓ + 3H₂O (t°).',
    workedExample: {
      problem:
        'Cho 4,4 gam acetaldehyde (CH₃CHO, M=44) phản ứng hoàn toàn với lượng dư thuốc thử Tollens ' +
        'trong dung dịch NH₃ đun nóng. Tính khối lượng bạc (Ag, M=108) tạo thành.',
      steps: [
        'Tính số mol acetaldehyde: n = 4,4 / 44 = 0,1 mol.',
        'Viết phương trình phản ứng tráng bạc của mono-aldehyde: CH₃CHO + 2[Ag(NH₃)₂]OH → CH₃COONH₄ + 2Ag↓ + 3NH₃ + H₂O.',
        'Từ phương trình, tỉ lệ phản ứng là: 1 mol aldehyde tạo ra 2 mol Ag.',
        'Tính số mol Ag thu được: nAg = 2 * n(acetaldehyde) = 2 * 0,1 = 0,2 mol.',
        'Tính khối lượng bạc tạo thành: mAg = 0,2 * 108 = 21,6 gam.',
      ],
      answer: '21,6 gam',
    },
    checkQuestions: [
      {
        prompt: 'Nhóm chức carbonyl có cấu tạo như thế nào?',
        choices: [
          { id: 'co', label: 'C=O (carbon liên kết đôi với oxygen)' },
          { id: 'oh', label: 'C−O−H (hydroxyl)' },
          { id: 'cho', label: 'C=O và đính thêm H (formyl)' },
        ],
        answer: { kind: 'choice', correctIds: ['co'] },
        explain:
          'Hợp chất carbonyl đặc trưng bởi nhóm carbonyl C=O. Aldehyde có nhóm −CHO, ketone có nhóm −CO−.',
      },
      {
        prompt:
          'Khi cho 1 mol acetaldehyde (CH₃CHO) tham gia phản ứng tráng bạc hoàn toàn với thuốc thử Tollens dư, số mol Ag kết tủa tối đa thu được là bao nhiêu?',
        answer: { kind: 'numeric', value: 2 },
        explain:
          'Mỗi nhóm −CHO của mono-aldehyde thông thường (như CH₃CHO) khi bị oxi hoá sẽ nhường electron khử 2 ion Ag⁺ thành 2 nguyên tử Ag kết tủa.',
      },
    ],
    srsCards: [
      { hoi: 'Carbonyl gồm những lớp chất nào?', dap: "Aldehyde (R−CHO) và Ketone (R−CO−R')." },
      {
        hoi: 'Hiện tượng phản ứng tráng bạc của aldehyde?',
        dap: 'Có lớp kim loại bạc (Ag) sáng bóng bám vào thành ống nghiệm.',
      },
      {
        hoi: 'Sự khác biệt khi oxi hoá aldehyde và ketone bằng thuốc thử nhẹ?',
        dap: 'Aldehyde dễ bị oxi hoá tạo Ag hoặc Cu₂O đỏ gạch, Ketone không phản ứng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c6-b24',
    grade: '11',
    chapterNumber: 6,
    chapterTitle: 'Hợp chất carbonyl - Carboxylic acid',
    lessonNumber: 24,
    title: 'Carboxylic acid',
    hook:
      'Giấm ăn có vị chua thanh nhẹ nhờ chứa acetic acid. Kiến đốt truyền nọc độc formic acid gây sưng rát. ' +
      'Cả hai đều là những axit hữu cơ thuộc nhóm axit carboxylic.',
    theory:
      'KHÁI NIỆM:\\n' +
      '— Carboxylic acid là hợp chất hữu cơ trong phân tử có nhóm carboxyl (−COOH) liên kết trực tiếp với nguyên tử carbon hoặc hydrogen.\\n' +
      '— Công thức chung của acid no, đơn chức, mạch hở: CₙH₂ₙ₊₁COOH (n ≥ 0).\\n\\n' +
      'TÍNH CHẤT VẬT LÍ (Nhiệt độ sôi rất cao):\\n' +
      '— Nhiệt độ sôi của carboxylic acid cao hơn alcohol có cùng phân tử khối vì các phân tử acid tạo được LIÊN KẾT HYDROGEN liên phân tử dạng vòng (dimer) hoặc dạng mạch bền vững hơn nhiều.\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC:\\n' +
      '1. Tính acid yếu (đầy đủ tính chất acid):\\n' +
      '   — Làm quỳ tím hoá đỏ. Tác dụng với kim loại giải phóng H₂: 2CH₃COOH + Zn → (CH₃COO)₂Zn + H₂.\\n' +
      '   — Tác dụng với muối carbonate giải phóng khí CO₂ (dùng nhận biết acid): 2CH₃COOH + CaCO₃ → (CH₃COO)₂Ca + CO₂↑ + H₂O.\\n' +
      '2. Phản ứng ester hoá (phản ứng với alcohol):\\n' +
      '   — Phản ứng xảy ra thuận nghịch dưới tác dụng của xúc tác H₂SO₄ đặc và đun nóng:\\n' +
      "     R−COOH + R'−OH ⇌ R−COOR' (ester) + H₂O.\\n" +
      '     Ví dụ: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ (ethyl acetate, mùi chuối chín) + H₂O.',
    workedExample: {
      problem:
        'Đun nóng hỗn hợp gồm 6,0 gam acetic acid (CH₃COOH, M=60) và lượng dư ethanol (C₂H₅OH) ' +
        'với xúc tác H₂SO₄ đặc. Biết hiệu suất phản ứng ester hoá đạt 80%. Tính khối lượng ' +
        'ethyl acetate (CH₃COOC₂H₅, M=88) thu được.',
      steps: [
        'Tính số mol acetic acid ban đầu: n = 6,0 / 60 = 0,1 mol.',
        'Viết phương trình phản ứng ester hoá: CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O.',
        'Theo lý thuyết (hiệu suất 100%), số mol ester thu được bằng số mol acid phản ứng = 0,1 mol.',
        'Vì hiệu suất phản ứng chỉ đạt 80% nên số mol ester thực tế thu được là: n_thucte = 0,1 * 80% = 0,08 mol.',
        'Tính khối lượng ester thực tế thu được: m = 0,08 * 88 = 7,04 gam.',
      ],
      answer: '7,04 gam',
    },
    checkQuestions: [
      {
        prompt: 'Vì sao carboxylic acid có nhiệt độ sôi cao hơn alcohol có cùng phân tử khối?',
        choices: [
          {
            id: 'a',
            label:
              'Do phân tử phân cực hơn và tạo liên kết hydrogen bền hơn dưới dạng dimer/polymer',
          },
          { id: 'b', label: 'Do liên kết C−C của acid khó bị bẻ gãy hơn' },
          { id: 'c', label: 'Do khối lượng của nguyên tố oxygen trong acid lớn hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Carboxylic acid tạo được liên kết hydrogen bền vững dạng dimer vòng kép hoặc polymer chuỗi dài, đòi hỏi nhiều nhiệt lượng để phá vỡ hơn alcohol.',
      },
      {
        prompt:
          'Phản ứng ester hoá giữa acetic acid và cồn ethanol (xúc tác H₂SO₄ đặc, nóng) tạo ra ester nào sau đây?',
        choices: [
          { id: 'methyl', label: 'Methyl acetate' },
          { id: 'ethyl', label: 'Ethyl acetate' },
          { id: 'propyl', label: 'Propyl acetate' },
        ],
        answer: { kind: 'choice', correctIds: ['ethyl'] },
        explain:
          'Phản ứng giữa gốc axetat (CH₃COO−) và gốc etyl (−C₂H₅) tạo ra ethyl acetate (CH₃COOC₂H₅).',
      },
    ],
    srsCards: [
      {
        hoi: 'Carboxylic acid là gì?',
        dap: 'Hợp chất hữu cơ có chứa nhóm carboxyl (−COOH) liên kết với carbon hoặc hydrogen.',
      },
      {
        hoi: 'Lớp chất hữu cơ nào có nhiệt độ sôi cao nhất trong các chất có cùng phân tử khối?',
        dap: 'Carboxylic acid (do liên kết hydrogen siêu bền dạng dimer).',
      },
      {
        hoi: 'Phản ứng ester hoá là gì?',
        dap: 'Là phản ứng thuận nghịch giữa acid và alcohol (xúc tác H₂SO₄ đặc) tạo ra ester và nước.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa11-c6-b25',
    grade: '11',
    chapterNumber: 6,
    chapterTitle: 'Hợp chất carbonyl - Carboxylic acid',
    lessonNumber: 25,
    title: 'Ôn tập chương 6',
    hook:
      'Ôn tập và liên kết hai lớp dẫn xuất chứa oxygen đỉnh cao: hợp chất carbonyl và carboxylic acid, ' +
      'hoàn thành lộ trình Hoá học hữu cơ lớp 11 của chúng ta.',
    theory:
      'TỔNG KẾT KIẾN THỨC CHƯƠNG 6:\\n' +
      "1. Hợp chất carbonyl: Có nhóm C=O. Gồm aldehyde (R−CHO) và ketone (R−CO−R').\\n" +
      '   — Khử bởi H₂ tạo alcohol tương ứng.\\n' +
      '   — Aldehyde có tính khử: tráng gương (tạo Ag), phản ứng Cu(OH)₂/NaOH nóng (tạo Cu₂O đỏ gạch). Ketone trơ với các phản ứng này.\\n' +
      '2. Carboxylic acid (R−COOH): Có nhóm −COOH. Nhiệt độ sôi rất cao nhờ dimer liên kết hydrogen. Thể hiện đầy đủ tính acid (làm đỏ quỳ, tác dụng kim loại trước H, phản ứng giải phóng khí CO₂ từ muối carbonate). Phản ứng ester hoá với alcohol là phản ứng thuận nghịch.',
    workedExample: {
      problem:
        'Nhận biết 3 chất lỏng đựng trong các lọ mất nhãn: acetaldehyde, acetone, và acetic acid bằng ' +
        'các thuốc thử đơn giản.',
      steps: [
        'Trích mẫu thử của 3 dung dịch.',
        'Nhỏ dung dịch NaHCO₃ (hoặc Na₂CO₃) vào 3 mẫu thử ⇒ Mẫu sủi bọt khí CO₂ thoát ra là acetic acid.',
        'Với 2 mẫu còn lại (acetaldehyde, acetone), cho tác dụng với thuốc thử Tollens đun nóng nhẹ.',
        'Mẫu tạo lớp bạc sáng bóng tráng gương bám thành ống nghiệm là acetaldehyde.',
        'Mẫu không có hiện tượng gì là acetone.',
      ],
      answer: 'Dùng NaHCO₃ và thuốc thử Tollens',
    },
    checkQuestions: [
      {
        prompt:
          'Thuốc thử nào thích hợp nhất để phân biệt nhanh dung dịch acetic acid với dung dịch acetaldehyde và dung dịch acetone?',
        choices: [
          { id: 'quỳ', label: 'Quỳ tím hoặc dung dịch muối Na₂CO₃ (sủi bọt khí)' },
          { id: 'tollens', label: 'Thuốc thử Tollens' },
          { id: 'h2', label: 'Khí hydrogen (Ni, t°)' },
        ],
        answer: { kind: 'choice', correctIds: ['quỳ'] },
        explain:
          'Acetic acid là một acid nên làm đỏ quỳ và giải phóng khí CO₂ khi gặp muối carbonate. Acetaldehyde và acetone không có tính axit này.',
      },
      {
        prompt: 'Chất nào sau đây tham gia phản ứng tráng bạc tạo gương sáng bóng?',
        choices: [
          { id: 'ace', label: 'Acetaldehyde (CH₃CHO)' },
          { id: 'act', label: 'Acetone (CH₃COCH₃)' },
          { id: 'aca', label: 'Acetic acid (CH₃COOH)' },
        ],
        answer: { kind: 'choice', correctIds: ['ace'] },
        explain:
          'Chỉ có aldehyde (có nhóm −CHO) mới tham gia phản ứng tráng bạc với thuốc thử Tollens. Ketone và carboxylic acid không phản ứng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Sản phẩm khử aldehyde và ketone bằng H₂?',
        dap: 'Aldehyde tạo alcohol bậc I; Ketone tạo alcohol bậc II.',
      },
      {
        hoi: 'Phản ứng dùng để nhận biết tính khử của aldehyde?',
        dap: 'Phản ứng tráng gương (thuốc thử Tollens) hoặc Cu(OH)₂ đun nóng.',
      },
      {
        hoi: 'Tại sao acid tác dụng với muối carbonate giải phóng khí?',
        dap: 'Vì carboxylic acid mạnh hơn carbonic acid (H₂CO₃), đẩy H₂CO₃ ra ngoài tự phân huỷ thành CO₂ và H₂O.',
      },
    ],
    reviewStatus: 'draft',
  },
]
