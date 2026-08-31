// lessons/hoa12c2.ts — Hoá học 12, Chương 2: Carbohydrate (4 bài).
// Đối chiếu mục lục thật: tai-lieu-sgk/SGK-Hoa/12/page_0004.png (OCR 2026-08-31).
// reviewStatus='draft' — soạn từ docs/research/kho-kien-thuc-hoa-gdpt2018.md §3, chưa duyệt.
import type { ChemLesson } from '../lessonTypes.js'

export const HOA12_C2_LESSONS: ChemLesson[] = [
  {
    id: 'hoa12-c2-b4',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Carbohydrate',
    lessonNumber: 4,
    title: 'Glucose và fructose',
    hook:
      'Nho chín có vị ngọt đậm đà nhờ đường glucose. Mật ong ngọt sắc lịm là do đường fructose. ' +
      'Đây là hai nguồn năng lượng carbohydrate đơn giản nhất nuôi sống tế bào.',
    theory:
      'PHÂN LOẠI CARBOHYDRATE:\\n' +
      '— Carbohydrate (gluxit, saccarit) là những hợp chất hữu cơ tạp chức, thường có công thức chung Cₙ(H₂O)ₘ.\\n' +
      '— Chia làm 3 nhóm chính: Monosaccharide (không bị thuỷ phân, vd: glucose, fructose); Disaccharide (thuỷ phân tạo 2 monosaccharide, vd: saccharose, maltose); Polysaccharide (thuỷ phân tạo nhiều monosaccharide, vd: tinh bột, cellulose).\\n\\n' +
      'GLUCOSE VÀ FRUCTOSE (C₆H₁₂O₆ = 180):\\n' +
      '— Glucose và fructose là hai chất đồng phân của nhau.\\n' +
      '— Cấu trúc glucose: Là hợp chất tạp chức, dạng mạch hở là polyhydroxy aldehyde (có 5 nhóm −OH và 1 nhóm −CHO). Trong dung dịch, glucose tồn tại chủ yếu ở hai dạng vòng: α-glucose và β-glucose.\\n' +
      '— Cấu trúc fructose: Dạng mạch hở là polyhydroxy ketone (có 5 nhóm −OH và 1 nhóm ketone C=O ở vị trí C số 2).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CỦA GLUCOSE:\\n' +
      '1. Tính chất của polyalcohol: Hoà tan Cu(OH)₂ ở nhiệt độ thường tạo dung dịch màu xanh lam thẫm (do có nhiều nhóm −OH kề nhau).\\n' +
      '2. Tính chất của aldehyde: Phản ứng tráng bạc với thuốc thử Tollens (tạo gương Ag); phản ứng với Cu(OH)₂/NaOH nóng tạo kết tủa đỏ gạch Cu₂O.\\n' +
      '   * Lưu ý: Fructose không có nhóm −CHO nhưng vẫn có phản ứng tráng bạc vì trong môi trường kiềm (NH₃), fructose chuyển hoá thuận nghịch thành glucose.\\n' +
      '3. Phản ứng cộng hydrogen: C₆H₁₂O₆ + H₂ → C₆H₁₄O₆ (Sorbitol) (t°, Ni).\\n' +
      '4. Phản ứng lên men rượu: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂↑ (men rượu, 30 - 35 °C).',
    workedExample: {
      problem:
        'Thực hiện phản ứng tráng bạc hoàn toàn 1,8 gam glucose (C₆H₁₂O₆, M=180) với lượng dư ' +
        'thuốc thử Tollens. Tính khối lượng bạc (Ag, M=108) tạo thành.',
      steps: [
        'Tính số mol glucose: n = 1,8 / 180 = 0,01 mol.',
        'Vì glucose có 1 nhóm −CHO tự do nên 1 mol glucose phản ứng tạo ra 2 mol Ag.',
        'Tính số mol bạc tạo thành: nAg = 2 * n(glucose) = 2 * 0,01 = 0,02 mol.',
        'Tính khối lượng bạc kết tủa: mAg = 0,02 * 108 = 2,16 gam.',
      ],
      answer: '2,16 gam',
    },
    checkQuestions: [
      {
        prompt: 'Glucose và fructose có cùng công thức phân tử nào sau đây?',
        choices: [
          { id: 'c6h12o6', label: 'C₆H₁₂O₆' },
          { id: 'c12h22o11', label: 'C₁₂H₂₂O₁₁' },
          { id: 'c6h10o5', label: 'C₆H₁₀O₅' },
        ],
        answer: { kind: 'choice', correctIds: ['c6h12o6'] },
        explain:
          'Glucose và fructose là đồng phân cấu tạo của nhau, có cùng công thức phân tử C₆H₁₂O₆.',
      },
      {
        prompt:
          'Khi hiđro hoá hoàn toàn glucose bằng khí H₂ (xúc tác Ni, đun nóng), sản phẩm hữu cơ thu được là gì?',
        choices: [
          { id: 'gluconic', label: 'Gluconic acid' },
          { id: 'sorbitol', label: 'Sorbitol' },
          { id: 'ethanol', label: 'Ethanol' },
        ],
        answer: { kind: 'choice', correctIds: ['sorbitol'] },
        explain:
          'Nhóm aldehyde (−CHO) của glucose bị cộng hydrogen khử thành nhóm alcohol (−CH₂OH), tạo ra hexanol 6 chức là sorbitol.',
      },
    ],
    srsCards: [
      { hoi: 'Glucose thuộc loại carbohydrate nào?', dap: 'Monosaccharide (đường đơn).' },
      {
        hoi: 'Tại sao fructose vẫn tham gia phản ứng tráng bạc dù không có nhóm −CHO?',
        dap: 'Vì trong môi trường kiềm của phản ứng tráng bạc, fructose chuyển hoá thành glucose.',
      },
      {
        hoi: 'Sản phẩm của phản ứng lên men glucose?',
        dap: 'Ethanol (C₂H₅OH) và khí carbon dioxide (CO₂).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c2-b5',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Carbohydrate',
    lessonNumber: 5,
    title: 'Saccharose và maltose',
    hook:
      'Đường mía chúng ta ăn hằng ngày chứa chủ yếu saccharose. Mầm lúa mạch dùng để ủ bia ' +
      'chứa nhiều maltose. Đây là hai disaccharide phổ biến nhất.',
    theory:
      'SACCHAROSE (C₁₂H₂₂O₁₁ = 342):\\n' +
      '— Trạng thái: Chất rắn kết tinh, không màu, vị ngọt, tan tốt trong nước (có nhiều trong cây mía, củ cải đường, hoa thốt nốt).\\n' +
      '— Cấu trúc phân tử: Là disaccharide được cấu tạo từ 1 gốc α-glucose và 1 gốc β-fructose liên kết qua nguyên tử oxygen. Phân tử không có nhóm aldehyde (−CHO) tự do nên KHÔNG có phản ứng tráng bạc (được gọi là đường không khử).\\n\\n' +
      'TÍNH CHẤT HOÁ HỌC CỦA SACCHAROSE:\\n' +
      '1. Tính chất của polyalcohol: Hoà tan Cu(OH)₂ ở nhiệt độ thường tạo dung dịch màu xanh lam thẫm.\\n' +
      '2. Phản ứng thuỷ phân (tính chất quan trọng nhất, xúc tác acid hoặc enzyme):\\n' +
      '   C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆ (glucose) + C₆H₁₂O₆ (fructose).\\n\\n' +
      'MALTOSE (ĐỒNG PHÂN CỦA SACCHAROSE):\\n' +
      '— Cấu tạo từ 2 gốc α-glucose. Ở dạng mạch hở có chứa nhóm aldehyde tự do nên có tính khử (có phản ứng tráng bạc, hoà tan Cu(OH)₂ nóng tạo kết tủa đỏ gạch).',
    workedExample: {
      problem:
        'Thuỷ phân hoàn toàn 3,42 gam saccharose (C₁₂H₂₂O₁₁, M=342) trong môi trường acid. ' +
        'Lấy toàn bộ sản phẩm thu được cho tác dụng hoàn toàn với dung dịch Tollens dư. ' +
        'Tính số mol bạc (Ag) kết tủa thu được.',
      steps: [
        'Tính số mol saccharose: n = 3,42 / 342 = 0,01 mol.',
        'Viết phương trình thuỷ phân: Saccharose + H₂O → Glucose + Fructose.',
        'Số mol sản phẩm: n(glucose) = 0,01 mol; n(fructose) = 0,01 mol.',
        'Cho sản phẩm tác dụng với Tollens: cả glucose và fructose đều tráng bạc (tỉ lệ 1:2).',
        'Tổng số mol Ag sinh ra: nAg = 2 * n(glucose) + 2 * n(fructose) = 2 * 0,01 + 2 * 0,01 = 0,04 mol.',
      ],
      answer: '0,04 mol',
    },
    checkQuestions: [
      {
        prompt: 'Saccharose trực tiếp phản ứng được với chất nào sau đây ở nhiệt độ thường?',
        choices: [
          { id: 'tollens', label: 'Thuốc thử Tollens' },
          { id: 'cuoh2', label: 'Cu(OH)₂ (tạo dung dịch xanh lam)' },
          { id: 'h2', label: 'Khí hydrogen (Ni, t°)' },
        ],
        answer: { kind: 'choice', correctIds: ['cuoh2'] },
        explain:
          'Saccharose có nhiều nhóm −OH kề nhau nên hoà tan được Cu(OH)₂ tạo dung dịch xanh lam ở nhiệt độ thường. Nó không tráng bạc trực tiếp do không có nhóm −CHO tự do.',
      },
      {
        prompt:
          'Khi thuỷ phân hoàn toàn saccharose trong môi trường acid, thu được hỗn hợp monosaccharide nào?',
        choices: [
          { id: 'hai_glu', label: 'Hai phân tử glucose' },
          { id: 'glu_fru', label: 'Một phân tử glucose và một phân tử fructose' },
          { id: 'hai_fru', label: 'Hai phân tử fructose' },
        ],
        answer: { kind: 'choice', correctIds: ['glu_fru'] },
        explain:
          'Saccharose cấu tạo từ gốc glucose và fructose nên khi thuỷ phân sinh ra cả glucose và fructose với tỉ lệ mol 1:1.',
      },
    ],
    srsCards: [
      { hoi: 'Saccharose thuộc loại carbohydrate nào?', dap: 'Disaccharide (đường đôi).' },
      {
        hoi: 'Tại sao saccharose không có phản ứng tráng bạc trực tiếp?',
        dap: 'Vì phân tử không có nhóm aldehyde (−CHO) tự do.',
      },
      { hoi: 'Sản phẩm thuỷ phân saccharose gồm những gì?', dap: 'Glucose và Fructose.' },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c2-b6',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Carbohydrate',
    lessonNumber: 6,
    title: 'Tinh bột và cellulose',
    hook:
      'Gạo tẻ chứa tinh bột — nguồn dự trữ năng lượng của cây lúa. Bông nõn chứa cellulose tinh khiết ' +
      '— bộ khung vách tế bào thực vật dai bền. Cả hai đều là những polysaccharide khổng lồ.',
    theory:
      'TINH BỘT ((C₆H₁₀O₅)ₙ):\\n' +
      '— Cấu trúc: Là polymer của các gốc α-glucose liên kết α-1,4-glycoside và α-1,6-glycoside. Gồm 2 dạng chính:\\n' +
      '  1. Amylose: mạch không phân nhánh, xoắn lại thành hình lò xo.\\n' +
      '  2. Amylopectin: mạch phân nhánh nhiều.\\n' +
      '— Phản ứng đặc trưng: Tác dụng với Iodine (I₂) tạo phức màu xanh tím đặc trưng (ở nhiệt độ thường, đun nóng mất màu, nguội hiện lại). Phản ứng thuỷ phân đến cùng tạo glucose.\\n\\n' +
      'CELLULOSE ((C₆H₁₀O₅)ₙ):\\n' +
      '— Cấu trúc: Là polymer của các gốc β-glucose liên kết β-1,4-glycoside tạo mạch thẳng, kéo sợi bền vững, không xoắn, không phân nhánh.\\n' +
      '— Công thức cấu tạo: [C₆H₇O₂(OH)₃]ₙ (mỗi mắt xích có 3 nhóm −OH tự do).\\n' +
      '— Phản ứng hoá học đặc trưng:\\n' +
      '  1. Tác dụng với HNO₃ đặc (xúc tác H₂SO₄ đặc nóng): tạo cellulose trinitrate dùng làm thuốc súng không khói: [C₆H₇O₂(OH)₃]ₙ + 3n HNO₃ → [C₆H₇O₂(ONO₂)₃]ₙ + 3n H₂O.\\n' +
      '  2. Phản ứng thuỷ phân: Bị thuỷ phân đến cùng trong dung dịch acid đặc nóng tạo thành glucose.',
    workedExample: {
      problem:
        'Nhận biết dung dịch hồ tinh bột và dung dịch glucose đựng trong hai lọ mất nhãn bằng một thuốc thử ' +
        'đơn giản ở nhiệt độ thường.',
      steps: [
        'Trích mẫu thử của hai dung dịch.',
        'Nhỏ vài giọt dung dịch iodine (I₂) vào hai mẫu thử.',
        'Mẫu xuất hiện màu xanh tím đặc trưng là hồ tinh bột (do cấu trúc lò xo của amylose hấp phụ iodine).',
        'Mẫu không có hiện tượng gì ở nhiệt độ thường là glucose.',
      ],
      answer: 'Dùng dung dịch iodine',
    },
    checkQuestions: [
      {
        prompt: 'Thuốc thử đặc trưng dùng để nhận biết nhanh hồ tinh bột là chất nào?',
        choices: [
          { id: 'cuoh2', label: 'Cu(OH)₂' },
          { id: 'iodine', label: 'Dung dịch Iodine (I₂)' },
          { id: 'tollens', label: 'Thuốc thử Tollens' },
        ],
        answer: { kind: 'choice', correctIds: ['iodine'] },
        explain:
          'Iodine len lỏi vào các kẽ xoắn lò xo của tinh bột tạo liên kết hấp phụ màu xanh tím đặc trưng.',
      },
      {
        prompt: 'Cellulose trinitrate được sản xuất từ phản ứng giữa cellulose và chất nào?',
        choices: [
          { id: 'hno3', label: 'HNO₃ đặc (xúc tác H₂SO₄ đặc)' },
          { id: 'hcl', label: 'HCl đặc' },
          { id: 'ch3cooh', label: 'CH₃COOH khan' },
        ],
        answer: { kind: 'choice', correctIds: ['hno3'] },
        explain:
          'Ba nhóm −OH tự do trên mỗi mắt xích của cellulose phản ứng ester hoá với HNO₃ tạo cellulose trinitrate [C₆H₇O₂(ONO₂)₃]ₙ.',
      },
    ],
    srsCards: [
      {
        hoi: 'Công thức cấu tạo thu gọn của cellulose biểu diễn các nhóm −OH tự do?',
        dap: '[C₆H₇O₂(OH)₃]ₙ.',
      },
      {
        hoi: 'Hiện tượng tinh bột tác dụng với iodine?',
        dap: 'Xuất hiện màu xanh tím ở nhiệt độ thường.',
      },
      {
        hoi: 'Sản phẩm thuỷ phân đến cùng của cả tinh bột và cellulose là gì?',
        dap: 'Glucose (C₆H₁₂O₆).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'hoa12-c2-b7',
    grade: '12',
    chapterNumber: 2,
    chapterTitle: 'Carbohydrate',
    lessonNumber: 7,
    title: 'Ôn tập chương 2',
    hook:
      'Chương 2 tổng hợp bức tranh toàn cảnh về Carbohydrate — nguồn dinh dưỡng và vật liệu ' +
      'sinh học cốt lõi liên kết chặt chẽ mọi sự sống.',
    theory:
      'TỔNG KẾT SO SÁNH CÁC CARBOHYDRATE THƯỜNG GẶP:\\n' +
      '1. Monosaccharide: Glucose và Fructose (C₆H₁₂O₆). Đều hoà tan Cu(OH)₂ xanh lam, đều tráng bạc (fructose tráng bạc trong môi trường kiềm).\\n' +
      '2. Disaccharide: Saccharose (C₁₂H₂₂O₁₁). Hoà tan Cu(OH)₂ xanh lam. Không tráng bạc trực tiếp, thuỷ phân ra glucose + fructose.\\n' +
      '3. Polysaccharide: Tinh bột và Cellulose ((C₆H₁₀O₅)ₙ). Thuỷ phân đến cùng đều tạo glucose. Tinh bột làm xanh tím iodine. Cellulose có 3 nhóm −OH tự do, phản ứng HNO₃ tạo thuốc súng không khói.',
    workedExample: {
      problem:
        'Nhận biết 4 dung dịch mất nhãn sau bằng phương pháp hoá học: glycerol, glucose, saccharose, và hồ tinh bột.',
      steps: [
        'Trích các mẫu thử.',
        'Dùng dung dịch iodine ở nhiệt độ thường: mẫu hoá xanh tím là hồ tinh bột.',
        'Với 3 mẫu còn lại, nhỏ dung dịch Cu(OH)₂ ở nhiệt độ thường: cả 3 đều hoà tan tạo dung dịch xanh lam thẫm.',
        'Đun nóng nhẹ 3 ống nghiệm xanh lam: chỉ có mẫu glucose xuất hiện kết tủa đỏ gạch Cu₂O (do có nhóm −CHO). Hai mẫu kia không đổi màu.',
        'Để phân biệt glycerol và saccharose: thực hiện thuỷ phân 2 mẫu thử bằng acid, rồi trung hoà và thử Tollens. Mẫu saccharose sau khi thuỷ phân cho phản ứng tráng gương (do sinh ra glucose và fructose). Glycerol không phản ứng.',
      ],
      answer: 'Dùng Iodine, Cu(OH)₂ thường và đun nóng',
    },
    checkQuestions: [
      {
        prompt: 'Chất nào sau đây KHÔNG bị thuỷ phân trong môi trường acid?',
        choices: [
          { id: 'glu', label: 'Glucose' },
          { id: 'sac', label: 'Saccharose' },
          { id: 'starch', label: 'Tinh bột' },
        ],
        answer: { kind: 'choice', correctIds: ['glu'] },
        explain:
          'Glucose là monosaccharide, phân tử đường đơn giản nhất nên không bị thuỷ phân nhỏ hơn.',
      },
      {
        prompt:
          'Phương pháp hoá học nhanh nhất để phát hiện vết tinh bột có trong nước giò chả là gì?',
        choices: [
          { id: 'a', label: 'Nhỏ vài giọt dung dịch Iodine (I₂)' },
          { id: 'b', label: 'Thử bằng thuốc thử Tollens' },
          { id: 'c', label: 'Thử bằng dung dịch NaOH' },
        ],
        answer: { kind: 'choice', correctIds: ['a'] },
        explain:
          'Chỉ cần nhỏ vài giọt iodine, nếu có tinh bột pha loãng giò chả, dung dịch sẽ chuyển màu xanh tím đặc trưng.',
      },
    ],
    srsCards: [
      { hoi: 'Đường nho là tên gọi của loại đường nào?', dap: 'Glucose.' },
      { hoi: 'Đường mía là tên gọi của loại đường nào?', dap: 'Saccharose.' },
      {
        hoi: 'Maltose có tráng bạc được không?',
        dap: 'Có (vì cấu trúc mạch hở có chứa nhóm −CHO tự do).',
      },
    ],
    reviewStatus: 'draft',
  },
]
