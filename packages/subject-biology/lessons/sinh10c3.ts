// lessons/sinh10c3.ts — Sinh học 10, Chương 4 & 5 (Bài 13-19).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH10_C3_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh10-c5-b13',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Chuyển hoá năng lượng trong tế bào',
    lessonNumber: 13,
    title: 'Khái quát về chuyển hoá vật chất và năng lượng',
    hook: 'Ngay cả khi ngủ, cơ thể bạn vẫn tiêu thụ năng lượng. Tế bào không bao giờ nghỉ ngơi—chúng không ngừng chuyển hoá năng lượng từ thức ăn thành ATP để duy trì sự sống.',
    theory:
      'CHUYỂN HOÁ VẬT CHẤT VÀ NĂNG LƯỢNG:\\n' +
      '— Chuyển hoá (Metabolism): Toàn bộ các phản ứng hoá học xảy ra trong tế bào và cơ thể sống.\\n' +
      '— Hai quá trình đối lập:\\n' +
      '  1. Đồng hoá (Anabolism): Tổng hợp các phân tử phức tạp từ phân tử đơn giản. Cần năng lượng ATP. Ví dụ: quang hợp, tổng hợp protein.\\n' +
      '  2. Dị hoá (Catabolism): Phân giải các phân tử phức tạp thành phân tử đơn giản. Giải phóng năng lượng ATP. Ví dụ: hô hấp tế bào.\\n\\n' +
      'ENZYME (ENZYM) VÀ VAI TRÒ XÚC TÁC:\\n' +
      '— Enzyme là chất xúc tác sinh học, bản chất là protein (một số là RNA - ribozyme).\\n' +
      '— Đặc điểm:\\n' +
      '  + Xúc tác đặc hiệu: Mỗi enzyme chỉ xúc tác một hoặc một số phản ứng nhất định.\\n' +
      '  + Tăng tốc độ phản ứng mà không bị tiêu hao.\\n' +
      '  + Hoạt động phụ thuộc nhiệt độ, pH, nồng độ cơ chất.\\n' +
      '— Cơ chế: Enzyme gắn với cơ chất (substrate) tại trung tâm hoạt động (active site), tạo phức enzyme-cơ chất, thực hiện phản ứng, rồi giải phóng sản phẩm.\\n' +
      '— ATP (Adenosine Triphosphate): Là đơn vị năng lượng phổ quát của tế bào. Năng lượng được lưu trong liên kết phosphate cao năng.',
    workedExample: {
      problem:
        'Giải thích tại sao enzyme amylase trong nước bọt chỉ phân giải tinh bột mà không phân giải protein thịt.',
      steps: [
        'Enzyme amylase có trung tâm hoạt động (active site) với hình dạng không gian đặc trưng.',
        'Chỉ có phân tử tinh bột (cơ chất đặc hiệu) mới có hình dạng phù hợp để gắn khít vào trung tâm hoạt động của amylase (giống khóa và chìa).',
        'Phân tử protein có hình dạng khác, không thể gắn vào trung tâm hoạt động của amylase, do đó không bị amylase xúc tác phân giải.',
      ],
      answer:
        'Enzyme có tính đặc hiệu cao: trung tâm hoạt động của amylase chỉ khớp với tinh bột, không khớp với protein.',
    },
    checkQuestions: [
      {
        prompt: 'Quá trình đồng hoá (Anabolism) trong tế bào có đặc điểm là:',
        choices: [
          { id: 'dh_1', label: 'Tổng hợp phân tử phức tạp từ đơn giản, cần tiêu tốn năng lượng' },
          { id: 'dh_2', label: 'Phân giải phân tử phức tạp thành đơn giản, giải phóng năng lượng' },
          { id: 'dh_3', label: 'Không liên quan đến ATP' },
          { id: 'dh_4', label: 'Chỉ xảy ra ở thực vật' },
        ],
        answer: { kind: 'choice', correctIds: ['dh_1'] },
        explain: 'Đồng hoá là tổng hợp, cần ATP (ví dụ: quang hợp, tổng hợp protein).',
      },
      {
        prompt: 'Đặc điểm nào sau đây KHÔNG đúng với enzyme?',
        choices: [
          { id: 'ez_1', label: 'Enzyme bị tiêu hao sau mỗi phản ứng mà nó xúc tác' },
          { id: 'ez_2', label: 'Enzyme có tính đặc hiệu cao với cơ chất' },
          { id: 'ez_3', label: 'Enzyme làm tăng tốc độ phản ứng hoá học' },
          { id: 'ez_4', label: 'Enzyme bản chất là protein' },
        ],
        answer: { kind: 'choice', correctIds: ['ez_1'] },
        explain:
          'Enzyme là chất xúc tác sinh học, không bị tiêu hao sau phản ứng và có thể tái sử dụng nhiều lần.',
      },
    ],
    srsCards: [
      {
        hoi: 'ATP là gì và vai trò của nó trong tế bào?',
        dap: 'ATP (Adenosine Triphosphate) là đơn vị năng lượng phổ quát của tế bào, dự trữ năng lượng trong liên kết phosphate cao năng.',
      },
      {
        hoi: 'Phân biệt đồng hoá và dị hoá?',
        dap: 'Đồng hoá: tổng hợp phân tử phức tạp, cần ATP. Dị hoá: phân giải phân tử phức tạp, giải phóng ATP.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c5-b14',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Chuyển hoá năng lượng trong tế bào',
    lessonNumber: 14,
    title: 'Phân giải và tổng hợp các chất trong tế bào',
    hook: 'Khi bạn chạy bộ, cơ thể đốt cháy glucose và mỡ để lấy năng lượng. Khi bạn ngủ, cơ thể dùng năng lượng đó để tổng hợp protein phục hồi cơ. Hai quá trình này—hô hấp tế bào và quang hợp—là trụ cột của sự sống.',
    theory:
      'HÔ HẤP TẾ BÀO (CELLULAR RESPIRATION):\\n' +
      '— Phương trình tổng quát: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Năng lượng (ATP + Nhiệt).\\n' +
      '— Ba giai đoạn chính:\\n' +
      '  1. Đường phân (Glycolysis): Xảy ra trong tế bào chất. Glucose (6C) → 2 Pyruvate (3C) + 2 ATP + 2 NADH.\\n' +
      '  2. Chu trình Krebs (Citric acid cycle): Xảy ra trong chất nền ty thể. Pyruvate → CO₂ + ATP + NADH + FADH₂.\\n' +
      '  3. Chuỗi chuyền điện tử (Electron Transport Chain): Xảy ra trên màng trong ty thể. NADH/FADH₂ → 32-34 ATP + H₂O.\\n\\n' +
      'QUANG HỢP (PHOTOSYNTHESIS) - Chỉ ở sinh vật có lục lạp:\\n' +
      '— Phương trình tổng quát: 6CO₂ + 6H₂O + Ánh sáng → C₆H₁₂O₆ + 6O₂.\\n' +
      '— Hai giai đoạn:\\n' +
      '  1. Pha sáng (Light reactions): Xảy ra trên màng thylakoid. Ánh sáng phân li H₂O, giải phóng O₂, tổng hợp ATP và NADPH.\\n' +
      '  2. Pha tối/Chu trình Calvin (Dark reactions/Calvin cycle): Xảy ra trong chất nền lục lạp (stroma). CO₂ + ATP + NADPH → Glucose.',
    workedExample: {
      problem:
        'Tính số phân tử ATP tối đa có thể tổng hợp được từ 1 phân tử glucose qua hô hấp hiếu khí.',
      steps: [
        'Đường phân: 2 ATP (thực tế).\\n',
        'Chu trình Krebs: 2 ATP.\\n',
        'Chuỗi chuyền điện tử: ~32-34 ATP từ 10 NADH và 2 FADH₂ qua phosphoryl hóa oxy hóa.\\n',
        'Tổng cộng: ~36-38 ATP/glucose. Trong thực tế tế bào, hiệu suất thực thường khoảng 30-32 ATP.',
      ],
      answer: 'Khoảng 36-38 ATP/glucose (lý thuyết), thực tế khoảng 30-32 ATP.',
    },
    checkQuestions: [
      {
        prompt: 'Giai đoạn nào trong hô hấp hiếu khí tạo ra nhiều ATP nhất?',
        choices: [
          { id: 'hr_1', label: 'Chuỗi chuyền điện tử (Electron Transport Chain)' },
          { id: 'hr_2', label: 'Đường phân (Glycolysis)' },
          { id: 'hr_3', label: 'Chu trình Krebs' },
          { id: 'hr_4', label: 'Tất cả giai đoạn đóng góp bằng nhau' },
        ],
        answer: { kind: 'choice', correctIds: ['hr_1'] },
        explain:
          'Chuỗi chuyền điện tử tạo ra ~32-34 ATP trong khi đường phân và Krebs mỗi giai đoạn chỉ tạo 2 ATP.',
      },
      {
        prompt: 'Sản phẩm phụ của quang hợp được thải ra ngoài môi trường là:',
        choices: [
          { id: 'qh_1', label: 'Oxy (O₂)' },
          { id: 'qh_2', label: 'CO₂' },
          { id: 'qh_3', label: 'ATP' },
          { id: 'qh_4', label: 'Glucose' },
        ],
        answer: { kind: 'choice', correctIds: ['qh_1'] },
        explain:
          'O₂ là sản phẩm phụ của pha sáng quang hợp, sinh ra khi H₂O bị phân li bởi năng lượng ánh sáng.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết phương trình tổng quát của hô hấp tế bào hiếu khí?',
        dap: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Năng lượng (ATP).',
      },
      {
        hoi: 'Quang hợp và hô hấp tế bào là hai quá trình đối nghịch như thế nào?',
        dap: 'Quang hợp: CO₂ + H₂O + ánh sáng → C₆H₁₂O₆ + O₂ (tích lũy năng lượng). Hô hấp: C₆H₁₂O₆ + O₂ → CO₂ + H₂O + ATP (giải phóng năng lượng).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c5-b15',
    grade: '10',
    chapterNumber: 5,
    chapterTitle: 'Chuyển hoá năng lượng trong tế bào',
    lessonNumber: 15,
    title:
      'Thực hành: Thí nghiệm phân tích ảnh hưởng của một số yếu tố đến hoạt tính của enzyme và kiểm tra hoạt tính của enzyme amylase',
    hook: 'Enzyme hoạt động trong điều kiện nhất định. Nhiệt độ cao có thể biến nước bọt mất khả năng tiêu hoá tinh bột. Hãy kiểm chứng điều này trong phòng thí nghiệm.',
    theory:
      'CÁC YẾU TỐ ẢNH HƯỞNG ĐẾN HOẠT TÍNH CỦA ENZYME:\\n' +
      '1. Nhiệt độ:\\n' +
      '   — Nhiệt độ thấp: Enzyme hoạt động chậm.\\n' +
      '   — Nhiệt độ tối ưu (thường 37-40°C với enzyme người): Hoạt tính cao nhất.\\n' +
      '   — Nhiệt độ cao (>60°C): Enzyme bị biến tính (denature), mất hoạt tính vĩnh viễn vì cấu trúc không gian bị phá huỷ.\\n' +
      '2. pH:\\n' +
      '   — Mỗi enzyme có pH tối ưu khác nhau (amylase nước bọt: pH ~7, pepsin dạ dày: pH ~2).\\n' +
      '   — pH quá cao hoặc thấp làm enzyme biến tính.\\n' +
      '3. Nồng độ cơ chất: Khi tăng nồng độ cơ chất đến mức bão hoà enzyme, vận tốc phản ứng tăng rồi đạt mức tối đa (Vmax).\\n\\n' +
      'THÍ NGHIỆM VỚI AMYLASE NƯỚC BỌT:\\n' +
      '— Ống 1 (đối chứng - nhiệt độ phòng): Amylase + hồ tinh bột → thử với dung dịch iốt sau 3 phút: không xanh tím (tinh bột đã bị phân giải).\\n' +
      '— Ống 2 (đun sôi): Đun sôi amylase trước rồi thêm hồ tinh bột → thử iốt: xanh tím (tinh bột không bị phân giải, enzyme bị biến tính).\\n' +
      '— Ống 3 (môi trường acid): Thêm HCl loãng → thử iốt: xanh tím (pH thấp làm enzyme mất hoạt tính).',
    workedExample: {
      problem:
        'Thiết kế thí nghiệm kiểm tra ảnh hưởng của nhiệt độ lên hoạt tính của enzyme amylase trong nước bọt.',
      steps: [
        'Chuẩn bị 3 ống nghiệm: Ống A (4°C), Ống B (37°C), Ống C (70°C).',
        'Cho vào mỗi ống 2ml hồ tinh bột 1% + 1ml nước bọt pha loãng 1:10.',
        'Ủ mỗi ống ở nhiệt độ tương ứng trong 10 phút.',
        'Nhỏ 2 giọt dung dịch iốt vào mỗi ống và quan sát màu sắc. Ống không xanh tím = tinh bột bị phân giải = enzyme hoạt động.',
      ],
      answer:
        'Ống B (37°C) không xanh tím. Ống A và C xanh tím vì enzyme ở 4°C hoạt động yếu, ở 70°C bị biến tính.',
    },
    checkQuestions: [
      {
        prompt:
          'Tại sao enzyme amylase trong nước bọt mất hoàn toàn khả năng phân giải tinh bột khi bị đun sôi?',
        choices: [
          {
            id: 'bd_1',
            label:
              'Nhiệt độ cao phá vỡ cấu trúc không gian ba chiều của enzyme (biến tính protein)',
          },
          { id: 'bd_2', label: 'Nước sôi pha loãng enzyme làm giảm nồng độ' },
          { id: 'bd_3', label: 'Nhiệt độ cao làm tinh bột cứng hơn enzyme không thể tiếp cận' },
          { id: 'bd_4', label: 'Enzyme tan hoàn toàn trong nước sôi' },
        ],
        answer: { kind: 'choice', correctIds: ['bd_1'] },
        explain:
          'Nhiệt độ quá cao phá vỡ liên kết hydrogen và tương tác kị nước duy trì cấu trúc bậc 3 của protein enzyme, làm biến dạng trung tâm hoạt động và mất khả năng xúc tác.',
      },
      {
        prompt: 'Enzyme pepsin trong dạ dày hoạt động tốt nhất ở pH nào?',
        choices: [
          { id: 'ph_1', label: 'pH khoảng 1-2 (acid mạnh)' },
          { id: 'ph_2', label: 'pH khoảng 7 (trung tính)' },
          { id: 'ph_3', label: 'pH khoảng 8-9 (kiềm nhẹ)' },
          { id: 'ph_4', label: 'pH không ảnh hưởng đến pepsin' },
        ],
        answer: { kind: 'choice', correctIds: ['ph_1'] },
        explain:
          'Pepsin là protease của dạ dày, hoạt động trong môi trường acid dạ dày (pH 1-2) do HCl tiết ra.',
      },
    ],
    srsCards: [
      {
        hoi: 'Điều gì xảy ra với enzyme khi nhiệt độ vượt quá nhiệt độ tối ưu?',
        dap: 'Enzyme bị biến tính: cấu trúc không gian bị phá huỷ, trung tâm hoạt động thay đổi, enzyme mất hoạt tính vĩnh viễn.',
      },
      {
        hoi: 'Mỗi enzyme có một pH tối ưu riêng. pH tối ưu của amylase nước bọt là bao nhiêu?',
        dap: 'pH trung tính, khoảng 6.7 - 7.0.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c6-b16',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chu kì tế bào và phân bào',
    lessonNumber: 16,
    title: 'Chu kì tế bào và nguyên phân',
    hook:
      'Từ một hợp tử duy nhất, sau hơn 40 lần phân chia bạn có được 37 nghìn tỉ tế bào cấu tạo nên cơ thể. ' +
      'Làm thế nào mỗi tế bào con lại nhận được đầy đủ bộ nhiễm sắc thể?',
    theory:
      'CHU KÌ TẾ BÀO (CELL CYCLE):\\n' +
      '— Chu kì tế bào: Chuỗi các sự kiện diễn ra từ khi tế bào được hình thành đến khi nó phân chia tạo ra tế bào con.\\n' +
      '— Gồm 2 giai đoạn chính:\\n' +
      '  1. Kì trung gian (Interphase): Chiếm phần lớn thời gian. Gồm G₁ (sinh trưởng, tổng hợp protein), S (nhân đôi DNA), G₂ (chuẩn bị phân bào). DNA được nhân đôi trong pha S.\\n' +
      '  2. Phân bào (M phase): Gồm nguyên phân (Mitosis) và phân chia tế bào chất (Cytokinesis).\\n\\n' +
      'NGUYÊN PHÂN (MITOSIS):\\n' +
      '— Từ 1 tế bào mẹ (2n) → 2 tế bào con (2n) có bộ NST giống hệt tế bào mẹ.\\n' +
      '— Vai trò: Tăng số lượng tế bào (sinh trưởng, sinh sản), tái sinh mô.\\n' +
      '— 4 kì phân bào:\\n' +
      '  1. Kì đầu (Prophase): NST co xoắn cực đại, thoi phân bào hình thành, màng nhân tan.\\n' +
      '  2. Kì giữa (Metaphase): NST xếp thành hàng ở mặt phẳng xích đạo tế bào.\\n' +
      '  3. Kì sau (Anaphase): Chromatid tách nhau, di chuyển về 2 cực tế bào.\\n' +
      '  4. Kì cuối (Telophase): Màng nhân hình thành, NST giãn xoắn, tế bào chất phân chia.\\n' +
      '— Kết quả: 1 tế bào mẹ (2n) → 2 tế bào con (2n).',
    workedExample: {
      problem:
        'Một tế bào có 2n=46 NST trải qua 3 lần nguyên phân liên tiếp. Tính số tế bào con và tổng số NST trong các tế bào con.',
      steps: [
        'Số tế bào con = 2^3 = 8 tế bào.',
        'Mỗi tế bào con có 2n = 46 NST (nguyên phân bảo toàn bộ NST).',
        'Tổng số NST = 8 × 46 = 368 NST.',
      ],
      answer: '8 tế bào con, mỗi tế bào có 46 NST, tổng 368 NST.',
    },
    checkQuestions: [
      {
        prompt: 'Trong chu kì tế bào, DNA được nhân đôi ở pha nào của kì trung gian?',
        choices: [
          { id: 'pha_1', label: 'Pha S' },
          { id: 'pha_2', label: 'Pha G₁' },
          { id: 'pha_3', label: 'Pha G₂' },
          { id: 'pha_4', label: 'Kì đầu của nguyên phân' },
        ],
        answer: { kind: 'choice', correctIds: ['pha_1'] },
        explain:
          'Pha S (Synthesis phase) là giai đoạn nhân đôi DNA trong kì trung gian của chu kì tế bào.',
      },
      {
        prompt:
          'Nguyên phân tạo ra bao nhiêu tế bào con từ 1 tế bào mẹ và chúng có bộ NST như thế nào?',
        choices: [
          { id: 'np_1', label: '2 tế bào con có bộ NST 2n bằng tế bào mẹ' },
          { id: 'np_2', label: '4 tế bào con có bộ NST n (đơn bội)' },
          { id: 'np_3', label: '2 tế bào con có bộ NST n (đơn bội)' },
          { id: 'np_4', label: '4 tế bào con có bộ NST 2n' },
        ],
        answer: { kind: 'choice', correctIds: ['np_1'] },
        explain:
          'Nguyên phân tạo 2 tế bào con có bộ NST lưỡng bội (2n) giống hệt tế bào mẹ, đảm bảo sự ổn định bộ gen.',
      },
    ],
    srsCards: [
      {
        hoi: 'Từ 1 tế bào ban đầu qua k lần nguyên phân tạo ra bao nhiêu tế bào con?',
        dap: '2^k tế bào con, mỗi tế bào có bộ NST 2n.',
      },
      {
        hoi: 'Ở kì nào của nguyên phân NST tập trung ở mặt phẳng xích đạo tế bào?',
        dap: 'Kì giữa (Metaphase).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c6-b17',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chu kì tế bào và phân bào',
    lessonNumber: 17,
    title: 'Giảm phân',
    hook:
      'Giảm phân là "bí quyết" của sinh sản hữu tính—nó tạo ra trứng và tinh trùng với nửa bộ nhiễm sắc thể. ' +
      'Khi hai tế bào đơn bội kết hợp, bộ NST lại trở về đủ số.',
    theory:
      'GIẢM PHÂN (MEIOSIS):\\n' +
      '— Mục tiêu: Tạo ra tế bào sinh dục (giao tử) có bộ NST đơn bội (n = một nửa).\\n' +
      '— Diễn ra trong các cơ quan sinh dục.\\n' +
      '— Gồm 2 lần phân bào liên tiếp:\\n\\n' +
      'GIẢM PHÂN I (Phân li đồng dạng):\\n' +
      '— Kì đầu I: NST kép cùng dạng (tương đồng) bắt cặp, trao đổi đoạn (crossing-over). Thoi phân bào hình thành.\\n' +
      '— Kì giữa I: Các cặp NST tương đồng xếp ngẫu nhiên ở mặt phẳng xích đạo.\\n' +
      '— Kì sau I: Các NST kép tương đồng phân li về 2 cực.\\n' +
      '— Kì cuối I: 2 tế bào con với n NST kép.\\n\\n' +
      'GIẢM PHÂN II (Giống nguyên phân):\\n' +
      '— Tách chromatid chị em, tạo 4 tế bào con (n NST đơn).\\n' +
      '— Kết quả: Từ 1 tế bào (2n) → 4 tế bào con (n).\\n\\n' +
      'Ý NGHĨA:\\n' +
      '— Duy trì bộ NST ổn định qua các thế hệ sinh hữu tính.\\n' +
      '— Tăng biến dị di truyền (nhờ crossing-over và phân li độc lập các cặp NST tương đồng).',
    workedExample: {
      problem:
        'Một tế bào sinh trứng 2n=46 NST qua giảm phân tạo ra bao nhiêu tế bào trứng? Bộ NST trong mỗi trứng là bao nhiêu?',
      steps: [
        '1 tế bào sinh trứng qua giảm phân tạo 4 tế bào con có bộ NST n = 23.',
        'Tuy nhiên ở người, quá trình tạo trứng (oogenesis) phân chia tế bào chất không đều, tạo 1 trứng chín và 2-3 thể cực (polar body) thoái hoá.',
        'Vậy, 1 tế bào sinh trứng (2n=46) → 1 trứng chức năng (n=23) + 2-3 thể cực.',
      ],
      answer: '1 tế bào sinh trứng (2n=46) tạo ra 1 trứng và 2-3 thể cực, tất cả đều có n=23 NST.',
    },
    checkQuestions: [
      {
        prompt:
          '1 tế bào sinh tinh (2n) qua giảm phân tạo ra bao nhiêu tinh trùng? Mỗi tinh trùng có bộ NST là bao nhiêu?',
        choices: [
          { id: 'gp_1', label: '4 tinh trùng, mỗi tinh trùng có n NST' },
          { id: 'gp_2', label: '2 tinh trùng, mỗi tinh trùng có 2n NST' },
          { id: 'gp_3', label: '4 tinh trùng, mỗi tinh trùng có 2n NST' },
          { id: 'gp_4', label: '1 tinh trùng, có n NST' },
        ],
        answer: { kind: 'choice', correctIds: ['gp_1'] },
        explain:
          'Giảm phân từ 1 tế bào 2n tạo 4 tế bào con n NST. Ở nam giới, tất cả 4 tế bào con đều phát triển thành tinh trùng chức năng.',
      },
      {
        prompt:
          'Sự kiện nào sau đây xảy ra trong kì đầu của giảm phân I mà KHÔNG xảy ra trong kì đầu của nguyên phân?',
        choices: [
          { id: 'co_1', label: 'Trao đổi đoạn (crossing-over) giữa các NST tương đồng' },
          { id: 'co_2', label: 'NST co xoắn cực đại' },
          { id: 'co_3', label: 'Thoi phân bào hình thành' },
          { id: 'co_4', label: 'Màng nhân tan biến' },
        ],
        answer: { kind: 'choice', correctIds: ['co_1'] },
        explain:
          'Crossing-over (trao đổi đoạn giữa các NST tương đồng) là sự kiện đặc trưng của kì đầu giảm phân I, tạo ra tổ hợp gen mới.',
      },
    ],
    srsCards: [
      {
        hoi: 'Kết quả của giảm phân từ 1 tế bào mẹ (2n) là bao nhiêu tế bào con và có bộ NST thế nào?',
        dap: '4 tế bào con có bộ NST đơn bội (n).',
      },
      {
        hoi: 'Trao đổi đoạn (crossing-over) xảy ra ở giai đoạn nào của giảm phân và có ý nghĩa gì?',
        dap: 'Xảy ra ở kì đầu của Giảm phân I. Tạo ra sự tái tổ hợp gen, tăng biến dị di truyền.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c6-b18',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chu kì tế bào và phân bào',
    lessonNumber: 18,
    title: 'Thực hành: Làm và quan sát tiêu bản quá trình nguyên phân và giảm phân',
    hook: 'Đỉnh rễ hành tây đang phân chia từng giây. Chúng ta có thể nhuộm và soi để trực tiếp nhìn thấy các NST trong từng kì phân bào.',
    theory:
      'QUY TRÌNH LÀM TIÊU BẢN QUAN SÁT NGUYÊN PHÂN (RỄ HÀNH TÂY):\\n' +
      '1. Chuẩn bị: Cắt 1 cm đỉnh rễ hành tây đang mọc (đỉnh rễ có nhiều tế bào đang phân chia tích cực).\\n' +
      '2. Xử lí hoá chất (thuốc nhuộm): Cố định mẫu bằng dung dịch Carnoy (ethanol:acid acetic 3:1), sau đó nhuộm bằng thuốc nhuộm Carmine hoặc Giemsa để NST bắt màu đỏ/tím.\\n' +
      '3. Xử lí mô mềm: Ngâm đỉnh rễ trong HCl 1N ở 60°C trong 8-12 phút để làm mềm mô và tách rời tế bào.\\n' +
      '4. Làm tiêu bản ép: Đặt đỉnh rễ lên lam kính, giọt glycerol + thuốc nhuộm, đậy lamela và ép nhẹ.\\n' +
      '5. Quan sát: Tìm kiếm các tế bào đang ở các kì khác nhau của nguyên phân dưới vật kính 40x hoặc 100x.',
    workedExample: {
      problem: 'Tại sao người ta chọn đỉnh rễ hành tây để quan sát nguyên phân?',
      steps: [
        'Đỉnh rễ hành tây là vùng sinh trưởng chứa tế bào phân sinh đỉnh (meristematic cells).',
        'Tế bào ở vùng này có chu kì tế bào ngắn, tốc độ phân chia cao, nên xác suất bắt gặp nhiều tế bào ở các kì phân bào khác nhau rất lớn.',
        'Mẫu dễ thu thập, giá rẻ, không cần phòng thí nghiệm chuyên sâu.',
      ],
      answer:
        'Đỉnh rễ có vùng phân sinh đỉnh với nhiều tế bào phân chia tích cực, dễ quan sát các kì nguyên phân.',
    },
    checkQuestions: [
      {
        prompt:
          'Tại sao trong thí nghiệm quan sát nguyên phân ở rễ hành tây, người ta phải xử lý mẫu với HCl?',
        choices: [
          { id: 'hcl_1', label: 'Để làm mềm mô, phá bỏ thành tế bào và tách rời các tế bào' },
          { id: 'hcl_2', label: 'Để nhuộm màu NST đặc hiệu' },
          { id: 'hcl_3', label: 'Để cố định hình thái và bảo quản mẫu' },
          { id: 'hcl_4', label: 'Để kích thích tế bào phân chia nhanh hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['hcl_1'] },
        explain:
          'HCl loãng ở nhiệt độ cao thủy phân các chất kết dính pectin trong thành tế bào thực vật, làm mô mềm ra và giúp các tế bào tách rời khi ép.',
      },
      {
        prompt:
          'Ở kì nào của nguyên phân, các NST co xoắn tối đa và nhìn rõ nhất dưới kính hiển vi?',
        choices: [
          { id: 'ki_1', label: 'Kì giữa (Metaphase)' },
          { id: 'ki_2', label: 'Kì đầu (Prophase)' },
          { id: 'ki_3', label: 'Kì sau (Anaphase)' },
          { id: 'ki_4', label: 'Kì cuối (Telophase)' },
        ],
        answer: { kind: 'choice', correctIds: ['ki_1'] },
        explain:
          'Ở kì giữa, NST co xoắn cực đại và nằm gọn trên mặt phẳng xích đạo nên quan sát rõ nhất.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao phải dùng HCl khi làm tiêu bản quan sát nguyên phân ở thực vật?',
        dap: 'Để làm mềm mô, thủy phân thành tế bào pectin, giúp tế bào tách rời và dàn mỏng trên lam kính.',
      },
      {
        hoi: 'Khi quan sát tiêu bản, làm thế nào để nhận biết một tế bào đang ở kì giữa của nguyên phân?',
        dap: 'Thấy các NST kép xếp thành hàng ở mặt phẳng trung tâm (xích đạo) tế bào.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh10-c6-b19',
    grade: '10',
    chapterNumber: 6,
    chapterTitle: 'Chu kì tế bào và phân bào',
    lessonNumber: 19,
    title: 'Công nghệ tế bào',
    hook: 'Nhờ công nghệ tế bào, các nhà khoa học tạo ra giống cây trồng mới chỉ trong vài tháng, sản xuất kháng thể chữa ung thư và thậm chí nuôi cấy da nhân tạo cho bệnh nhân bỏng.',
    theory:
      'CÔNG NGHỆ TẾ BÀO (CELL TECHNOLOGY):\\n' +
      '— Là ngành kĩ thuật ứng dụng kiến thức sinh học tế bào để sản xuất các sản phẩm phục vụ con người.\\n\\n' +
      'MỘT SỐ LĨNH VỰC CHÍNH:\\n' +
      '1. Nuôi cấy mô (Tissue culture / Micropropagation):\\n' +
      '   — Nguyên tắc: Dựa trên tính toàn năng của tế bào (mỗi tế bào đều chứa đủ bộ gene và có khả năng phát triển thành cơ thể hoàn chỉnh).\\n' +
      '   — Quy trình: Lấy mô thực vật → nuôi cấy trên môi trường dinh dưỡng vô trùng (hormone thực vật) → mô sẹo → cây hoàn chỉnh.\\n' +
      '   — Ứng dụng: Nhân giống nhanh cây sạch bệnh, giữ giống quý.\\n' +
      '2. Nhân bản vô tính (Cloning):\\n' +
      '   — Cừu Dolly (1996): Tế bào tuyến vú của cừu trưởng thành được chuyển nhân vào trứng đã bỏ nhân, kích hoạt phát triển → cừu con có bộ gen giống hệt cừu mẹ.\\n' +
      '3. Tế bào gốc (Stem cells):\\n' +
      '   — Tế bào có khả năng tự phân chia và biệt hoá thành nhiều loại tế bào chuyên biệt.\\n' +
      '   — Ứng dụng: Điều trị bệnh máu, trồng cơ quan nội tạng trong tương lai.',
    workedExample: {
      problem:
        'Giải thích nguyên lí tính toàn năng của tế bào và ý nghĩa của nó trong công nghệ nuôi cấy mô.',
      steps: [
        'Tính toàn năng (totipotency): Mỗi tế bào sinh dưỡng của cơ thể đa bào chứa bộ gen đầy đủ như tế bào ban đầu (tế bào hợp tử).',
        'Trong điều kiện nuôi cấy thích hợp (đủ dinh dưỡng, hormone), tế bào có thể biểu hiện lại tất cả gene cần thiết và phát triển thành cơ thể hoàn chỉnh.',
        'Ứng dụng: Từ 1 mảnh mô nhỏ của cây quý, ta có thể tạo ra hàng nghìn cây con giống nhau bằng nuôi cấy in vitro.',
      ],
      answer:
        'Tính toàn năng: mọi tế bào có đủ thông tin di truyền → từ 1 mô nhỏ nuôi cấy thành nhiều cây con có bộ gen đồng nhất.',
    },
    checkQuestions: [
      {
        prompt: 'Nguyên lí sinh học nào là cơ sở của kĩ thuật nuôi cấy mô thực vật?',
        choices: [
          { id: 'tn_1', label: 'Tính toàn năng của tế bào' },
          { id: 'tn_2', label: 'Tính chuyên hoá của tế bào biệt hoá' },
          { id: 'tn_3', label: 'Hiện tượng apoptosis (chết tế bào có lập trình)' },
          { id: 'tn_4', label: 'Sự khuếch tán của hormone qua màng tế bào' },
        ],
        answer: { kind: 'choice', correctIds: ['tn_1'] },
        explain:
          'Tính toàn năng (totipotency) là khả năng phát triển thành cơ thể hoàn chỉnh từ một tế bào đơn lẻ, là cơ sở của kĩ thuật nuôi cấy mô.',
      },
      {
        prompt: 'Cừu Dolly được tạo ra bằng phương pháp nào?',
        choices: [
          { id: 'dl_1', label: 'Chuyển nhân từ tế bào sinh dưỡng vào trứng đã bỏ nhân' },
          { id: 'dl_2', label: 'Thụ tinh trong ống nghiệm' },
          { id: 'dl_3', label: 'Ghép gene từ cừu khác' },
          { id: 'dl_4', label: 'Nuôi cấy tế bào gốc từ phôi thai' },
        ],
        answer: { kind: 'choice', correctIds: ['dl_1'] },
        explain:
          'Dolly được tạo bằng kĩ thuật chuyển nhân tế bào soma (somatic cell nuclear transfer - SCNT): lấy nhân tế bào tuyến vú cừu trưởng thành, chuyển vào trứng đã loại bỏ nhân.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tế bào gốc (stem cell) là gì?',
        dap: 'Tế bào có khả năng tự phân chia và biệt hoá thành nhiều loại tế bào chuyên biệt khác nhau.',
      },
      {
        hoi: 'Nhân bản vô tính tạo ra cá thể như thế nào?',
        dap: 'Chuyển nhân tế bào sinh dưỡng vào trứng đã bỏ nhân, kích hoạt phát triển phôi → cá thể có gen giống hệt cá thể cho nhân.',
      },
    ],
    reviewStatus: 'draft',
  },
]
