// lessons/hoa12c4.ts — Hoá học 12, Chương 4: Polymer (3 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C4_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c4-b12',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Polymer',
    lessonNumber: 12,
    title: 'Đại cương về polymer',
    hook:
      'Túi nilon, sợi vải nhân tạo và lốp xe cao su đều cấu tạo từ các phân tử khổng lồ có hàng vạn nguyên tử liên kết với nhau.' +
      ' Chúng được các nhà hoá học gọi chung là polymer.',
    theory:
      'KHÁI NIỆM VÀ PHÂN LOẠI:\\n' +
      '— Polymer là những hợp chất có khối lượng phân tử rất lớn do nhiều đơn vị cơ bản (gọi là mắt xích) liên kết với nhau tạo nên. Monomer là những phân tử nhỏ phản ứng tạo nên polymer.\\n' +
      '— Phân loại theo nguồn gốc:\\n' +
      '  1. Polymer thiên nhiên: Có sẵn trong tự nhiên (như tinh bột, cellulose, bông, tơ tằm, cao su thiên nhiên).\\n' +
      '  2. Polymer tổng hợp: Do con người tự tổng hợp từ các chất hoá học (như PE, PVC, nylon-6,6, cao su Buna).\\n' +
      '  3. Polymer bán tổng hợp (nhân tạo): Lấy polymer thiên nhiên chế hoá hoá học một phần (như tơ viscose, tơ acetate).\\n\\n' +
      'ĐẶC ĐIỂM CẤU TRÚC:\\n' +
      '— Mạch không phân nhánh: như PE, PVC, amylose, cellulose.\\n' +
      '— Mạch phân nhánh: như amylopectin, glycogen.\\n' +
      '— Mạch mạng không gian (khâu mạch): như cao su lưu hoá, nhựa bakelite.\\n\\n' +
      'PHƯƠNG PHÁP TỔNG HỢP:\\n' +
      '1. Phản ứng trùng hợp: Là quá trình kết hợp nhiều phân tử nhỏ giống nhau hoặc tương tự nhau (monomer) thành phân tử lớn (polymer) không giải phóng chất phụ.\\n' +
      '   — Điều kiện monomer: Phân tử phải có liên kết bội kém bền (C=C, C≡C) hoặc vòng kém bền (như ethylene, vinyl chloride, styrene).\\n' +
      '2. Phản ứng trùng ngưng: Là quá trình kết hợp nhiều phân tử monomer thành phân tử polymer đồng thời giải phóng các phân tử nhỏ khác (thường là H₂O).\\n' +
      '   — Điều kiện monomer: Phân tử phải chứa ít nhất hai nhóm chức có khả năng phản ứng với nhau (ví dụ: acid adipic và hexamethylenediamine).',
    workedExample: {
      problem:
        'Một phân tử polyethylene (PE) có hệ số trùng hợp (số mắt xích n) là 10000. ' +
        'Tính khối lượng phân tử của phân tử polymer này.',
      steps: [
        'Mắt xích cấu tạo của PE là −CH₂−CH₂−.',
        'Tính khối lượng của một mắt xích (monomer ethylene C₂H₄): M = 12 * 2 + 1 * 4 = 28 g/mol.',
        'Hệ số trùng hợp n = 10000, nghĩa là phân tử gồm 10000 mắt xích nối với nhau.',
        'Tính khối lượng phân tử polymer: M_polymer = n * M_matxich = 10000 * 28 = 280000 g/mol.',
      ],
      answer: '280000',
    },
    checkQuestions: [
      {
        prompt: 'Tơ viscose và tơ acetate thuộc loại polymer nào sau đây?',
        choices: [
          { id: 'thiennhien', label: 'Polymer thiên nhiên' },
          { id: 'tonghop', label: 'Polymer tổng hợp' },
          { id: 'bantonghop', label: 'Polymer bán tổng hợp (nhân tạo)' },
        ],
        answer: { kind: 'choice', correctIds: ['bantonghop'] },
        explain:
          'Tơ viscose và tơ acetate được sản xuất bằng cách lấy polymer thiên nhiên là cellulose chế hoá thêm bằng tác chất hoá học (như CS₂ hoặc anhydride acetic), nên gọi là polymer bán tổng hợp.',
      },
      {
        prompt: 'Phản ứng trùng ngưng khác phản ứng trùng hợp ở điểm cốt lõi nào?',
        choices: [
          { id: 'a', label: 'Trùng ngưng giải phóng thêm các phân tử nhỏ khác (như nước)' },
          { id: 'b', label: 'Trùng ngưng cần áp suất cao hơn' },
          { id: 'c', label: 'Trùng ngưng tạo ra polymer có khối lượng phân tử nhỏ hơn nhiều' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Phản ứng trùng ngưng luôn sinh ra sản phẩm phụ là các phân tử nhỏ (thường là H₂O) bên cạnh polymer chính, còn phản ứng trùng hợp thì không.',
      },
    ],
    srsCards: [
      { hoi: 'Đơn vị nhỏ phản ứng tạo nên polymer gọi là gì?', dap: 'Monomer.' },
      {
        hoi: 'Ba dạng cấu trúc mạch polymer?',
        dap: 'Mạch không phân nhánh, mạch phân nhánh, và mạch mạng không gian.',
      },
      {
        hoi: 'Điều kiện phân tử monomer tham gia phản ứng trùng hợp?',
        dap: 'Có chứa liên kết bội kém bền (như C=C) hoặc vòng kém bền dễ mở.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c4-b13',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Polymer',
    lessonNumber: 13,
    title: 'Vật liệu polymer',
    hook:
      'Chất dẻo làm đồ gia dụng, tơ sợi dệt quần áo ấm, cao su làm lốp xe chịu lực, keo dán gắn kết vật liệu. ' +
      'Mọi vật liệu hiện đại này đều được làm từ polymer chế hoá phù hợp.',
    theory:
      'CHẤT DẺO (Plastics):\\n' +
      '— Là những vật liệu polymer có tính dẻo (bị biến dạng khi chịu tác dụng của nhiệt, áp lực bên ngoài và vẫn giữ nguyên sự biến dạng đó khi thôi tác dụng).\\n' +
      '— Các chất dẻo phổ biến: Polyethylene (PE), Poly(vinyl chloride) (PVC), Poly(methyl methacrylate) (PMM - thuỷ tinh hữu cơ Plexiglas), Poly(tetrafluoroethylene) (Teflon - chảo chống dính).\\n\\n' +
      'TƠ (Fibers):\\n' +
      '— Là những vật liệu polymer hình sợi dài, mảnh, độ bền kéo cao.\\n' +
      '— Tơ polyamide (chứa nhóm −CO−NH−): tơ nylon-6, nylon-6,6. Kém bền với nhiệt, acid, base do nhóm amide bị thuỷ phân.\\n' +
      '   * Nylon-6,6 trùng ngưng từ acid adipic HOOC−(CH₂)₄−COOH và hexamethylenediamine H₂N−(CH₂)₆−NH₂.\\n' +
      '— Tơ vinylic: tơ nitron (hay olon), dai, ấm, giữ nhiệt tốt, dùng dệt len nhân tạo, trùng hợp từ acrylonitrile CH₂=CH−CN.\\n\\n' +
      'CAO SU (Rubbers):\\n' +
      '— Là vật liệu polymer có tính đàn hồi (khả năng khôi phục hình dạng ban đầu sau khi chịu tác dụng lực).\\n' +
      '— Cao su thiên nhiên: polymer của isoprene (cis-polyisoprene).\\n' +
      '— Cao su tổng hợp: Cao su Buna (trùng hợp butadiene), cao su Buna-S (đồng trùng hợp butadiene và styrene), cao su Buna-N (đồng trùng hợp butadiene và acrylonitrile).\\n' +
      '— Lưu hoá cao su: Trộn cao su với lưu huỳnh và đun nóng, tạo cầu nối disulfide (−S−S−) giữa các mạch polymer, chuyển cấu trúc mạch thẳng thành cấu trúc mạng không gian bền vững, đàn hồi hơn, chịu nhiệt tốt hơn, khó tan hơn.',
    workedExample: {
      problem:
        'Viết phương trình phản ứng hoá học trùng hợp vinyl chloride (CH₂=CHCl) tạo thành polymer polyvinyl chloride (PVC).',
      steps: [
        'Xác định monomer: vinyl chloride (CH₂=CHCl).',
        'Phản ứng trùng hợp mở liên kết đôi C=C thành liên kết đơn và nối các mắt xích lại với nhau dưới tác dụng của nhiệt độ (t°), áp suất (p), xúc tác (xt).',
        'Viết phương trình phản ứng: n CH₂=CHCl → −(CH₂−CHCl)−ₙ.',
      ],
      answer: 'n CH2=CHCl -> -(CH2-CHCl)-n',
    },
    checkQuestions: [
      {
        prompt: 'Tơ nylon-6,6 thuộc loại tơ nào sau đây?',
        choices: [
          { id: 'polyester', label: 'Tơ polyester' },
          { id: 'polyamide', label: 'Tơ polyamide' },
          { id: 'acetate', label: 'Tơ acetate' },
        ],
        answer: { kind: 'choice', correctIds: ['polyamide'] },
        explain:
          'Nylon-6,6 được điều chế bằng cách trùng ngưng diamine và diacid, hình thành các nhóm amide −CO−NH− trên mạch nên thuộc loại tơ polyamide.',
      },
      {
        prompt: 'Monomer dùng để trùng hợp sản xuất cao su Buna là chất nào?',
        choices: [
          { id: 'isoprene', label: 'Isoprene' },
          { id: 'butadiene', label: 'Buta-1,3-diene (butadiene)' },
          { id: 'chloroprene', label: 'Chloroprene' },
        ],
        answer: { kind: 'choice', correctIds: ['butadiene'] },
        explain:
          'Cao su Buna viết tắt từ Butadiene và chất xúc tác Sodium (Natri), trùng hợp từ buta-1,3-diene (CH₂=CH−CH=CH₂).',
      },
    ],
    srsCards: [
      { hoi: 'Mắt xích cấu tạo của tơ nitron (olon)?', dap: '−(CH₂−CH(CN))−.' },
      {
        hoi: 'Mục đích của việc lưu hoá cao su là gì?',
        dap: 'Tạo cầu nối disulfide chuyển cấu trúc mạch thẳng sang mạng không gian, giúp tăng tính đàn hồi, chịu nhiệt, chịu mài mòn.',
      },
      {
        hoi: 'Tại sao quần áo dệt từ tơ nylon không nên giặt bằng xà phòng có tính kiềm mạnh hoặc ủi ở nhiệt độ cao?',
        dap: 'Vì tơ polyamide dễ bị thuỷ phân trong môi trường kiềm và kém bền nhiệt.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c4-b14',
    grade: '12',
    chapterNumber: 4,
    chapterTitle: 'Polymer',
    lessonNumber: 14,
    title: 'Ôn tập chương 4',
    hook:
      'Chương 4 kết nối bức tranh toàn cảnh từ các monomer phân tử nhỏ sang các vật liệu polymer khổng lồ, ' +
      'nền tảng của vật liệu học hiện đại.',
    theory:
      'HỆ THỐNG HOÁ KIẾN THỨC CHƯƠNG 4:\\n' +
      '1. Khái niệm polymer: n mắt xích monomer. Có 3 nguồn gốc: thiên nhiên, tổng hợp, bán tổng hợp (viscose, acetate). Mạch thẳng, nhánh (amylopectin), mạng không gian (cao su lưu hoá, bakelite).\\n' +
      '2. Phương pháp tổng hợp: Trùng hợp (cộng hợp mở liên kết đôi, không giải phóng phụ), Trùng ngưng (đóng vòng hoặc kết hợp có tách H₂O).\\n' +
      '3. Vật liệu polymer: Chất dẻo (PE, PVC, PMM, Teflon); Cao su (thiên nhiên isoprene, tổng hợp Buna, Buna-S, Buna-N); Tơ (thiên nhiên bông/tơ tằm, bán tổng hợp viscose/acetate, tổng hợp nylon-6, nylon-6,6, tơ nitron).',
    workedExample: {
      problem:
        'Để tổng hợp được 125 kg polyvinyl chloride (PVC, M=62,5) từ vinyl chloride (CH₂=CHCl, M=62,5) ' +
        'với hiệu suất phản ứng trùng hợp đạt 90%, ta cần bao nhiêu kg monomer vinyl chloride?',
      steps: [
        'Viết phương trình trùng hợp: n CH₂=CHCl → −(CH₂−CHCl)−ₙ. Khối lượng mắt xích bằng khối lượng monomer.',
        'Về mặt lý thuyết (hiệu suất 100%), khối lượng monomer cần dùng bằng khối lượng polymer tạo thành = 125 kg.',
        'Vì hiệu suất phản ứng đạt 90%, lượng monomer thực tế cần dùng phải lớn hơn để bù vào hao hụt.',
        'Tính khối lượng monomer thực tế cần dùng: m = 125 / 90% = 125 / 0,9 ≈ 138,89 kg.',
      ],
      answer: '138,89 kg',
    },
    checkQuestions: [
      {
        prompt: 'Mắt xích của polymer polyvinyl chloride (PVC) có công thức là gì?',
        choices: [
          { id: 'pe', label: '−CH₂−CH₂−' },
          { id: 'pvc', label: '−CH₂−CHCl−' },
          { id: 'ps', label: '−CH₂−CH(C₆H₅)−' },
        ],
        answer: { kind: 'choice', correctIds: ['pvc'] },
        explain:
          'PVC trùng hợp từ vinyl chloride CH₂=CHCl tạo mạch polymer có mắt xích lặp lại là −CH₂−CHCl−.',
      },
      {
        prompt: 'Polymer nào sau đây có cấu trúc mạch phân nhánh?',
        choices: [
          { id: 'cellulose', label: 'Cellulose' },
          { id: 'amylopectin', label: 'Amylopectin (trong tinh bột)' },
          { id: 'caosu', label: 'Cao su lưu hoá' },
        ],
        answer: { kind: 'choice', correctIds: ['amylopectin'] },
        explain:
          'Cellulose mạch thẳng, cao su lưu hoá cấu trúc mạng không gian khâu mạch, chỉ có amylopectin (và glycogen) cấu trúc mạch phân nhánh.',
      },
    ],
    srsCards: [
      { hoi: 'Monomer của nhựa PE?', dap: 'Ethylene (CH₂=CH₂).' },
      {
        hoi: 'Tơ nitron dệt len nhân tạo được điều chế bằng phản ứng nào?',
        dap: 'Phản ứng trùng hợp acrylonitrile (CH₂=CH−CN).',
      },
      {
        hoi: 'Độ bền của tơ polyamide bị ảnh hưởng bởi yếu tố nào?',
        dap: 'Dễ bị phân huỷ trong môi trường acid hoặc kiềm nóng do thuỷ phân liên kết amide.',
      },
    ],
    reviewStatus: 'draft',
  },
]
