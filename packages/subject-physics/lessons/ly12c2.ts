// lessons/ly12c2.ts — Vật lí 12, Chương 2: Khí lí tưởng (4 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY12_C2_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly12-c2-b8',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Khí lí tưởng',
    lessonNumber: 8,
    title: 'Định luật Boyle. Định luật Charles',
    hook:
      'Nếu bạn bóp một quả bóng bay đã bơm căng và buộc kín, bạn sẽ thấy quả bóng thu nhỏ lại nhưng vỏ bóng căng cứng hơn. ' +
      'Nếu bạn đun nóng một chai nhựa rỗng đậy kín, chai sẽ phồng lên. Những hiện tượng này tuân theo các định luật chất khí.',
    theory:
      'CÁC THÔNG SỐ TRẠNG THÁI CỦA MỘT LƯỢNG KHÍ:\\n' +
      '— Áp suất (p): Đơn vị chuẩn là Pascal (1 Pa = 1 N/m²), ngoài ra còn dùng atm, mmHg, bar (1 atm ≈ 1.013 * 10⁵ Pa, 1 bar = 10⁵ Pa).\\n' +
      '— Thể tích (V): Đơn vị chuẩn là mét khối (m³), ngoài ra còn dùng lít (l), mililít (ml), xentimét khối (cm³). (1 m³ = 1000 lít).\\n' +
      '— Nhiệt độ tuyệt đối (T): Đơn vị Kelvin (K). Công thức: T = t + 273 (với t là nhiệt độ Celsius).\\n\\n' +
      'QUÁ TRÌNH ĐẲNG NHIỆT VÀ ĐỊNH LUẬT BOYLE:\\n' +
      '— Quá trình đẳng nhiệt: Quá trình biến đổi trạng thái của một lượng khí khi nhiệt độ được giữ không đổi.\\n' +
      '— Định luật Boyle: Trong quá trình đẳng nhiệt của một lượng khí xác định, áp suất tỉ lệ nghịch với thể tích:\\n' +
      '  p.V = hằng số  (hay  p1.V1 = p2.V2)\\n' +
      '— Đường đẳng nhiệt: Trong hệ toạ độ (p, V), đường đẳng nhiệt là một nhánh của đường hyperbol.\\n\\n' +
      'QUÁ TRÌNH ĐẲNG ÁP VÀ ĐỊNH LUẬT CHARLES:\\n' +
      '— Quá trình đẳng áp: Quá trình biến đổi trạng thái của một lượng khí khi áp suất được giữ không đổi.\\n' +
      '— Định luật Charles: Trong quá trình đẳng áp của một lượng khí xác định, thể tích tỉ lệ thuận với nhiệt độ tuyệt đối:\\n' +
      '  V / T = hằng số  (hay  V1 / T1 = V2 / T2)\\n' +
      '— Đường đẳng áp: Trong hệ toạ độ (V, T), đường đẳng áp là đường thẳng đi qua gốc toạ độ (phần kéo dài).',
    workedExample: {
      problem:
        'Một lượng khí có thể tích 10 lít ở áp suất 1 bar và nhiệt độ 27 °C. ' +
        'Nếu nén đẳng nhiệt lượng khí này đến áp suất 2 bar thì thể tích mới của khối khí là bao nhiêu lít?',
      steps: [
        'Xác định các thông số trạng thái ban đầu: V1 = 10 lít, p1 = 1 bar.',
        'Xác định thông số trạng thái sau: p2 = 2 bar.',
        'Vì quá trình là đẳng nhiệt (T = const), áp dụng Định luật Boyle: p1*V1 = p2*V2.',
        'Suy ra thể tích mới: V2 = (p1 * V1) / p2 = (1 * 10) / 2 = 5 lít.',
      ],
      answer: 'V2 = 5 lít.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong quá trình đẳng nhiệt của một lượng khí xác định, khi thể tích của khối khí giảm đi 3 lần thì áp suất của khối khí sẽ:',
        choices: [
          { id: 'da_1', label: 'Tăng lên 3 lần' },
          { id: 'da_2', label: 'Giảm đi 3 lần' },
          { id: 'da_3', label: 'Tăng lên 9 lần' },
          { id: 'da_4', label: 'Không đổi' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['da_1'],
        },
        explain:
          'Theo định luật Boyle, p và V tỉ lệ nghịch với nhau khi T không đổi. V giảm 3 lần thì p tăng 3 lần.',
      },
      {
        prompt:
          'Một khối khí lí tưởng có thể tích 3 lít ở nhiệt độ 300 K. ' +
          'Nhiệt độ của khối khí tăng lên đến bao nhiêu Kelvin nếu nó giãn nở đẳng áp đến thể tích 4.5 lít?',
        answer: {
          kind: 'numeric',
          value: 450,
          unit: 'K',
        },
        explain:
          'Áp dụng định luật Charles cho quá trình đẳng áp: V1/T1 = V2/T2 => T2 = T1 * V2 / V1 = 300 * 4.5 / 3 = 450 K.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phát biểu định luật Boyle dưới dạng công thức cho quá trình đẳng nhiệt?',
        dap: 'p * V = hằng số (hay p1 * V1 = p2 * V2).',
      },
      {
        hoi: 'Phát biểu định luật Charles dưới dạng công thức cho quá trình đẳng áp?',
        dap: 'V / T = hằng số (hay V1 / T1 = V2 / T2).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c2-b9',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Khí lí tưởng',
    lessonNumber: 9,
    title: 'Phương trình trạng thái của khí lí tưởng',
    hook:
      'Khi một khinh khí cầu bay lên cao, cả áp suất, thể tích và nhiệt độ của lượng khí bên trong đều thay đổi đồng thời. ' +
      'Để tìm mối liên hệ giữa cả 3 thông số này, chúng ta sử dụng một phương trình tổng quát gọi là phương trình trạng thái của khí lí tưởng.',
    theory:
      'KHÁI NIỆM KHÍ LÍ TƯỞNG VÀ KHÍ THỰC:\\n' +
      '— Khí lí tưởng: Là chất khí trong đó các phân tử được coi là các chất điểm, chỉ tương tác với nhau khi va chạm đàn hồi.\\n' +
      '— Khí thực: Các khí tồn tại trong thực tế (như oxy, nitơ, cacbonic). Ở nhiệt độ và áp suất thông thường, khí thực gần đúng coi là khí lí tưởng.\\n\\n' +
      'PHƯƠNG TRÌNH TRẠNG THÁI CỦA KHÍ LÍ TƯỞNG (PHƯƠNG TRÌNH CLAPEYRON):\\n' +
      '— Với một lượng khí xác định chuyển từ trạng thái 1 (p1, V1, T1) sang trạng thái 2 (p2, V2, T2):\\n' +
      '  p1.V1 / T1 = p2.V2 / T2 = hằng số\\n\\n' +
      'PHƯƠNG TRÌNH CLAPEYRON - MENDELEEV:\\n' +
      '— Với một lượng khí bất kỳ có khối lượng m, số mol n = m / M:\\n' +
      '  p.V = n.R.T = (m / M).R.T\\n' +
      'Trong đó:\\n' +
      '— p: Áp suất (Pa).\\n' +
      '— V: Thể tích (m³).\\n' +
      '— T: Nhiệt độ tuyệt đối (K).\\n' +
      '— R ≈ 8.31 J/(mol.K) là hằng số khí lí tưởng.\\n' +
      '— n: Số mol chất khí (mol).',
    workedExample: {
      problem:
        'Tính áp suất (theo đơn vị kPa) của 0.2 mol khí lí tưởng đựng trong bình kín có thể tích 8.31 lít (bằng 0.00831 m³) ở nhiệt độ 27 °C.',
      steps: [
        'Đổi nhiệt độ sang Kelvin: T = 27 + 273 = 300 K.',
        'Áp dụng phương trình Clapeyron - Mendeleev: p.V = n.R.T => p = (n.R.T) / V.',
        'Thay số với V = 0.00831 m³, n = 0.2 mol, R = 8.31 J/(mol.K) và T = 300 K.',
        'Tính toán: p = (0.2 * 8.31 * 300) / 0.00831 = 60000 Pa = 60 kPa.',
      ],
      answer: 'p = 60 kPa.',
    },
    checkQuestions: [
      {
        prompt: 'Hằng số khí lí tưởng R trong hệ SI có giá trị xấp xỉ bằng:',
        choices: [
          { id: 'r_1', label: '8.31 J/(mol.K)' },
          { id: 'r_2', label: '0.082 J/(mol.K)' },
          { id: 'r_3', label: '8.31 J/(kg.K)' },
          { id: 'r_4', label: '8310 J/(mol.K)' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['r_1'],
        },
        explain: 'Trong hệ SI, hằng số khí R = 8.31 J/(mol.K).',
      },
      {
        prompt:
          'Một khối khí lí tưởng ở trạng thái 1 có p1 = 1 atm, V1 = 4 lít, T1 = 300 K. ' +
          'Khối khí biến đổi sang trạng thái 2 có V2 = 2 lít và T2 = 600 K. Tính áp suất p2 (theo đơn vị atm) của khối khí ở trạng thái mới.',
        answer: {
          kind: 'numeric',
          value: 4,
          unit: 'atm',
        },
        explain:
          'Áp dụng phương trình trạng thái: p1*V1/T1 = p2*V2/T2 => p2 = p1 * (V1/V2) * (T2/T1) = 1 * (4/2) * (600/300) = 4 atm.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết phương trình trạng thái của khí lí tưởng cho một lượng khí xác định?',
        dap: 'p1 * V1 / T1 = p2 * V2 / T2 = hằng số.',
      },
      {
        hoi: 'Viết phương trình Clapeyron - Mendeleev biểu diễn mối liên hệ p, V, T qua số mol n?',
        dap: 'p * V = n * R * T (với R = 8.31 J/(mol.K)).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c2-b10',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Khí lí tưởng',
    lessonNumber: 10,
    title: 'Thuyết động học phân tử chất khí',
    hook:
      'Khi đứng trước gió hoặc bơm lốp xe, chúng ta cảm nhận được áp suất khí như một lực liên tục. ' +
      'Thực chất, áp suất này là kết quả của hàng tỷ tỷ hạt phân tử siêu nhỏ đang bắn phá và va đập liên tục vào da hay thành lốp xe.',
    theory:
      'NỘI DUNG CƠ BẢN CỦA THUYẾT ĐỘNG HỌC PHÂN TỬ CHẤT KHÍ:\\n' +
      '— Các chất khí được cấu tạo từ các phân tử có kích thước rất nhỏ so với khoảng cách giữa chúng.\\n' +
      '— Các phân tử khí chuyển động hỗn loạn không ngừng; chuyển động này càng nhanh thì nhiệt độ của chất khí càng cao.\\n' +
      '— Khi chuyển động hỗn loạn, các phân tử khí va chạm vào nhau và va chạm vào thành bình gây ra áp suất lên thành bình.\\n\\n' +
      'CÔNG THỨC TÍNH ÁP SUẤT KHÍ THEO MÔ HÌNH ĐỘNG HỌC PHÂN TỬ:\\n' +
      '  p = (1/3).μ.v_rms² = (1/3).ρ.v_rms²\\n' +
      'Trong đó:\\n' +
      '— ρ: Khối lượng riêng của chất khí (kg/m³).\\n' +
      '— v_rms²: Trung bình bình phương tốc độ của các phân tử khí (m²/s²).\\n\\n' +
      'MỐI QUAN HỆ GIỮA ĐỘNG NĂNG PHÂN TỬ VÀ NHIỆT ĐỘ TUYỆT ĐỐI:\\n' +
      '— Động năng tịnh tiến trung bình của phân tử khí tỉ lệ thuận với nhiệt độ tuyệt đối:\\n' +
      '  E_d = (3/2).kB.T\\n' +
      'Trong đó kB ≈ 1.38 * 10⁻²³ J/K là hằng số Boltzmann (kB = R / NA).\\n' +
      '— Công thức này cho thấy nhiệt độ là số đo động năng trung bình của chuyển động nhiệt của phân tử.',
    workedExample: {
      problem:
        'Giải thích tại sao khi giữ nguyên thể tích của một lượng khí xác định trong bình kín và đun nóng, áp suất của khối khí lại tăng?',
      steps: [
        'Nhận xét ảnh hưởng của nhiệt độ: Khi nhiệt độ T tăng, động năng tịnh tiến trung bình và tốc độ của các phân tử khí tăng lên.',
        'Mô tả va chạm: Các phân tử chuyển động nhanh hơn, va đập mạnh hơn và thường xuyên hơn vào thành bình.',
        'Kết luận: Lực tác dụng trung bình của các phân tử lên mỗi đơn vị diện tích thành bình tăng lên, làm áp suất khí tăng lên.',
      ],
      answer:
        'Nhiệt độ tăng làm tốc độ và lực va đập của các phân tử lên thành bình tăng, dẫn đến áp suất tăng.',
    },
    checkQuestions: [
      {
        prompt:
          'Động năng tịnh tiến trung bình của các phân tử khí lí tưởng tỉ lệ thuận với thông số nào dưới đây?',
        choices: [
          { id: 't_1', label: 'Nhiệt độ tuyệt đối' },
          { id: 't_2', label: 'Áp suất khí' },
          { id: 't_3', label: 'Khối lượng riêng' },
          { id: 't_4', label: 'Thể tích bình chứa' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['t_1'],
        },
        explain:
          'Theo công thức Ed = 1.5 * kB * T, động năng tịnh tiến trung bình tỉ lệ thuận với nhiệt độ tuyệt đối T.',
      },
      {
        prompt:
          'Theo thuyết động học phân tử chất khí, nguyên nhân gây ra áp suất của chất khí lên thành bình là do:',
        choices: [
          { id: 'c_1', label: 'Các phân tử khí va chạm vào thành bình' },
          { id: 'c_2', label: 'Lực hút giữa các phân tử khí với nhau' },
          { id: 'c_3', label: 'Sự co dãn tự nhiên của các phân tử khí' },
          { id: 'c_4', label: 'Trọng lực của các phân tử đè lên đáy bình' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['c_1'],
        },
        explain:
          'Áp suất chất khí lên thành bình là do lực tác dụng từ các va chạm hỗn loạn của phân tử khí lên thành bình.',
      },
    ],
    srsCards: [
      {
        hoi: 'Mối quan hệ giữa động năng tịnh tiến trung bình của phân tử khí lí tưởng Ed và nhiệt độ tuyệt đối T?',
        dap: 'Ed = 1.5 * kB * T (với kB là hằng số Boltzmann).',
      },
      {
        hoi: 'Hằng số Boltzmann kB liên hệ thế nào với hằng số khí R và số Avogadro NA?',
        dap: 'kB = R / NA (xấp xỉ 1.38 * 10^-23 J/K).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c2-b11',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Khí lí tưởng',
    lessonNumber: 11,
    title: 'Bài tập về khí lí tưởng',
    hook:
      'Luyện tập giải các bài tập vận dụng các định luật chất khí, phương trình trạng thái và ' +
      'công thức động học phân tử là cách tốt nhất để nắm vững các đặc tính của chất khí trong thực tế.',
    theory:
      'CÁC CÔNG THỨC TRỌNG TÂM CẦN NHỚ:\\n' +
      '1. Định luật Boyle (Đẳng nhiệt): p1 * V1 = p2 * V2\\n' +
      '2. Định luật Charles (Đẳng áp): V1 / T1 = V2 / T2\\n' +
      '3. Phương trình trạng thái: p1 * V1 / T1 = p2 * V2 / T2\\n' +
      '4. Phương trình Mendeleev-Clapeyron: p * V = n * R * T = (m/M) * R * T\\n' +
      '5. Khối lượng riêng của khí: ρ = m / V = p * M / (R * T)',
    workedExample: {
      problem:
        'Một bình chứa khí oxi (M = 32 g/mol) có dung tích 10 lít ở áp suất 1.5 bar và nhiệt độ 27 °C. ' +
        'Tính khối lượng khí oxi trong bình (lấy R = 0.0831 bar.l/(mol.K), kết quả làm tròn đến 2 chữ số thập phân).',
      steps: [
        'Đổi nhiệt độ sang Kelvin: T = 27 + 273 = 300 K.',
        'Áp dụng phương trình Mendeleev-Clapeyron: p*V = n*R*T => n = (p*V) / (R*T).',
        'Thay số với p = 1.5 bar, V = 10 lít, R = 0.0831 bar.l/(mol.K), T = 300 K. Tính số mol: n = (1.5 * 10) / (0.0831 * 300) ≈ 0.6017 mol.',
        'Khối lượng oxi trong bình: m = n * M = 0.6017 * 32 ≈ 19.25 g.',
      ],
      answer: 'm = 19.25 g.',
    },
    checkQuestions: [
      {
        prompt:
          'Một khối khí lí tưởng có thể tích 6 lít ở nhiệt độ 27 °C và áp suất 1 atm. ' +
          'Khi nén khối khí này đến thể tích 3 lít và nung nóng đến nhiệt độ 327 °C, áp suất mới của khối khí là bao nhiêu atm?',
        answer: {
          kind: 'numeric',
          value: 4,
          unit: 'atm',
        },
        explain:
          'T1 = 27 + 273 = 300 K. T2 = 327 + 273 = 600 K. Áp dụng phương trình trạng thái: p1*V1/T1 = p2*V2/T2 => p2 = p1 * (V1/V2) * (T2/T1) = 1 * (6/3) * (600/300) = 4 atm.',
      },
      {
        prompt:
          'Ở điều kiện tiêu chuẩn (áp suất 1 atm, nhiệt độ 0 °C), 1 mol khí lí tưởng chiếm thể tích bao nhiêu lít?',
        answer: {
          kind: 'numeric',
          value: 22.4,
          unit: 'lít',
        },
        explain: 'Ở điều kiện tiêu chuẩn, thể tích của 1 mol chất khí bất kì là 22.4 lít.',
      },
    ],
    srsCards: [
      {
        hoi: 'Mối liên hệ giữa áp suất p, khối lượng riêng rho, nhiệt độ T và khối lượng mol M của chất khí?',
        dap: 'rho = p * M / (R * T).',
      },
      {
        hoi: 'Thể tích của 1 mol khí lí tưởng ở điều kiện tiêu chuẩn (0 độ C, 1 atm)?',
        dap: '22.4 lít.',
      },
    ],
    reviewStatus: 'draft',
  },
]
