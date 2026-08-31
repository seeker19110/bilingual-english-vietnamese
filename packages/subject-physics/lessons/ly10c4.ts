// lessons/ly10c4.ts — Vật lí 10, Chương 4: Năng lượng, công, công suất (5 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY10_C4_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly10-c4-b23',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Năng lượng, công, công suất',
    lessonNumber: 23,
    title: 'Năng lượng. Công cơ học',
    hook:
      'Gắng sức đẩy một bức tường đá nặng suốt một tiếng đồng hồ khiến bạn mệt lử, nhưng dưới góc nhìn Vật lí, bạn lại chưa thực hiện bất kỳ một "công" nào. ' +
      'Tại sao định nghĩa về công trong Vật lí lại nghiêm ngặt đến vậy?',
    theory:
      'NĂNG LƯỢNG (ENERGY):\\n' +
      '— Năng lượng là một đại lượng đặc trưng cho khả năng thực hiện công của hệ.\\n' +
      '— Định luật bảo toàn năng lượng: Năng lượng không tự sinh ra cũng không tự mất đi, nó chỉ truyền từ vật này sang vật khác hoặc chuyển hoá từ dạng này sang dạng khác.\\n\\n' +
      'CÔNG CƠ HỌC (WORK):\\n' +
      '— Công cơ học là số đo phần năng lượng được truyền từ vật này sang vật khác trong tương tác lực cơ học.\\n' +
      '— Công thức tính công của lực F không đổi làm vật dịch chuyển quãng đường s thẳng (góc α giữa lực vectơ F và hướng chuyển động):\\n' +
      '  — A = F.s.cos α.\\n' +
      '  — Đơn vị đo trong hệ SI: Joule (J), với 1 J = 1 N.m.\\n\\n' +
      'PHÂN LOẠI CÔNG THEO GÓC α:\\n' +
      '— Góc α nhọn (0 ≤ α < 90°): cos α > 0 => A > 0. Lực thực hiện công phát động (đẩy nhanh chuyển động).\\n' +
      '— Góc α vuông (α = 90°): cos α = 0 => A = 0. Lực không thực hiện công (vd lực căng dây của con lắc, trọng lực khi vật đi ngang).\\n' +
      '— Góc α tù (90° < α ≤ 180°): cos α < 0 => A < 0. Lực thực hiện công cản (cản trở chuyển động, vd lực ma sát).',
    workedExample: {
      problem:
        'Một người dùng dây kéo một chiếc hòm gỗ trượt trên sàn nhà nằm ngang bằng một lực F = 100 N theo phương hợp với sàn một góc α = 60°. ' +
        'Tính công của người đó thực hiện khi kéo hòm đi được một quãng đường s = 20 m.',
      steps: [
        'Xác định các thông số: Lực kéo F = 100 N, quãng đường s = 20 m, góc α = 60°.',
        'Áp dụng công thức tính công cơ học: A = F.s.cos α.',
        'Thay số: A = 100 * 20 * cos 60° = 2000 * 0,5 = 1000 (J).',
        'Vì A > 0 nên đây là công phát động giúp hòm gỗ di chuyển.',
      ],
      answer: 'A = 1000 J',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính công cơ học A của một lực F không đổi tác dụng làm vật dịch chuyển quãng đường s, với góc hợp bởi lực và hướng dịch chuyển là α.',
        choices: [
          { id: 'ct_1', label: 'A = F * s * cos α' },
          { id: 'ct_2', label: 'A = F * s * sin α' },
          { id: 'ct_3', label: 'A = F * s' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Công cơ học được định nghĩa bằng tích độ lớn lực, quãng đường dịch chuyển và cosin góc hợp giữa hướng lực và hướng dịch chuyển.',
      },
      {
        prompt:
          'Một lực ma sát trượt có độ lớn 20 N tác dụng lên một hộp gỗ trượt thẳng trên sàn, hướng lực ma sát luôn ngược hướng chuyển động (α = 180°). Tính công của lực ma sát khi hộp gỗ dịch chuyển được 5 m.',
        answer: {
          kind: 'numeric',
          value: -100,
          unit: 'J',
        },
        explain: 'A = F_ms * s * cos(180°) = 20 * 5 * (-1) = -100 J. Đây là công cản.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị Joule (J) của công cơ học tương đương với tích các đơn vị cơ bản nào?',
        dap: 'Newton nhân mét (N.m).',
      },
      {
        hoi: 'Khi hướng của lực tác dụng vuông góc với hướng chuyển động, công của lực đó bằng bao nhiêu?',
        dap: 'Bằng 0 (lực không sinh công).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c4-b24',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Năng lượng, công, công suất',
    lessonNumber: 24,
    title: 'Công suất',
    hook:
      'Một người thợ cần cả ngày để cuốc xong mảnh vườn, trong khi chiếc máy cày chỉ mất 15 phút. ' +
      'Cả hai đều thực hiện cùng một lượng công như nhau, nhưng máy cày có một đại lượng vượt trội hơn hẳn: Công suất.',
    theory:
      'ĐỊNH NGHĨA CÔNG SUẤT (POWER):\\n' +
      '— Công suất là đại lượng đặc trưng cho tốc độ thực hiện công của lực, đo bằng công thực hiện được trong một đơn vị thời gian.\\n' +
      '— Công thức tính công suất trung bình: 𝒫 = A / t.\\n' +
      '— Đơn vị đo trong hệ SI: Watt (kí hiệu là W), với 1 W = 1 J/s.\\n' +
      '  — Các đơn vị ngoài hệ SI thường dùng: mã lực (Horsepower, HP). Ở Pháp: 1 HP ≈ 736 W, ở Anh: 1 HP ≈ 746 W.\\n\\n' +
      'MỐI LIÊN HỆ GIỮA CÔNG SUẤT, LỰC VÀ VẬN TỐC:\\n' +
      '— Khi lực F cùng hướng với vận tốc v của vật, ta có: 𝒫 = A / t = (F.s) / t = F.v.\\n' +
      '— Công thức này giải thích tại sao khi xe lên dốc, để tăng lực kéo F giúp xe leo dốc khỏe hơn, người lái xe phải về số thấp để giảm vận tốc v của xe (giữ công suất 𝒫 động cơ tối đa không đổi).',
    workedExample: {
      problem:
        'Một cần cẩu nâng đều một thùng hàng khối lượng m = 500 kg lên độ cao h = 10 m trong thời gian t = 20 giây. ' +
        'Lấy g = 10 m/s². Tính công suất trung bình của động cơ cần cẩu.',
      steps: [
        'Tính lực nâng tối thiểu của cần cẩu để nâng đều vật: F = P = m.g = 500 * 10 = 5000 (N).',
        'Tính công cơ học thực hiện để nâng vật lên độ cao h: A = F.h = 5000 * 10 = 50000 (J).',
        'Tính công suất trung bình của động cơ cần cẩu: 𝒫 = A / t = 50000 / 20 = 2500 (W) = 2,5 kW.',
      ],
      answer: '𝒫 = 2500 W',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính công suất 𝒫 của một động cơ thực hiện công A trong khoảng thời gian t.',
        choices: [
          { id: 'ct_1', label: '𝒫 = A / t' },
          { id: 'ct_2', label: '𝒫 = A * t' },
          { id: 'ct_3', label: '𝒫 = t / A' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Công suất được định nghĩa bằng công thực hiện chia cho khoảng thời gian thực hiện công đó.',
      },
      {
        prompt:
          'Động cơ của một xe máy sinh ra công suất kéo 3 kW khi xe chạy đều trên đường phẳng. Tính công kéo của động cơ xe máy trong thời gian 10 giây.',
        answer: {
          kind: 'numeric',
          value: 30000,
          unit: 'J',
        },
        explain: 'Đổi 3 kW = 3000 W. Công A = 𝒫 * t = 3000 * 10 = 30000 J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị Watt (W) của công suất tương đương với những đơn vị cơ bản nào?',
        dap: 'Joule trên giây (J/s).',
      },
      {
        hoi: 'Viết công thức liên hệ giữa công suất 𝒫, lực kéo F và vận tốc chuyển động đều v?',
        dap: '𝒫 = F.v.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c4-b25',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Năng lượng, công, công suất',
    lessonNumber: 25,
    title: 'Động năng, thế năng',
    hook:
      'Một viên đạn nhỏ đang bay có thể xuyên thủng tấm thép dày nhờ mang động năng lớn. ' +
      'Một hồ chứa nước trên đỉnh núi cao lại chứa đựng một lượng thế năng khổng lồ sẵn sàng chạy máy phát điện. Hai dạng năng lượng này tích luỹ thế nào?',
    theory:
      'ĐỘNG NĂNG (KINETIC ENERGY):\\n' +
      '— Động năng (W_đ) là dạng năng lượng mà một vật có được do nó đang chuyển động.\\n' +
      '— Công thức tính động năng: W_đ = 0,5.m.v².\\n' +
      '— Định lí động năng: Độ biến thiên động năng của một vật bằng công của các ngoại lực tác dụng lên vật: A = W_đ2 - W_đ1.\\n\\n' +
      'THẾ NĂNG TRỌNG TRƯỜNG (GRAVITATIONAL POTENTIAL ENERGY):\\n' +
      '— Thế năng trọng trường (W_t) là dạng năng lượng tương tác giữa Trái Đất và vật, phụ thuộc vào vị trí của vật trong trọng trường.\\n' +
      '— Công thức tính thế năng trọng trường ở độ cao h so với mốc thế năng đã chọn: W_t = m.g.h.\\n' +
      '  — h: Độ cao của vật so với mốc chọn làm thế năng bằng 0 (hướng lên trên h dương, hướng xuống dưới h âm).',
    workedExample: {
      problem:
        'Một con chim bồ câu khối lượng m = 0,5 kg đang bay với vận tốc v = 10 m/s ở độ cao h = 20 m so với mặt đất. ' +
        'Lấy g = 10 m/s² và chọn mặt đất làm mốc thế năng. Tính động năng và thế năng trọng trường của con chim.',
      steps: [
        'Tính động năng của con chim: W_đ = 0,5.m.v² = 0,5 * 0,5 * 10² = 0,25 * 100 = 25 (J).',
        'Xác định độ cao h = 20 m so với mốc thế năng mặt đất.',
        'Tính thế năng trọng trường của con chim: W_t = m.g.h = 0,5 * 10 * 20 = 100 (J).',
      ],
      answer: 'Động năng: 25 J; Thế năng: 100 J.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính động năng W_đ của một vật khối lượng m đang chuyển động với vận tốc v.',
        choices: [
          { id: 'ct_1', label: 'W_đ = 0,5 * m * v²' },
          { id: 'ct_2', label: 'W_đ = m * v' },
          { id: 'ct_3', label: 'W_đ = 0,5 * m * v' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain: 'Động năng tỉ lệ thuận với khối lượng m và bình phương vận tốc v: W_đ = 0,5.m.v².',
      },
      {
        prompt:
          'Một vật có khối lượng 2 kg được đặt ở độ cao 5 m so với mặt đất (mốc thế năng). Lấy gia tốc trọng trường g = 10 m/s². Tính thế năng trọng trường của vật.',
        answer: {
          kind: 'numeric',
          value: 100,
          unit: 'J',
        },
        explain: 'Thế năng W_t = m.g.h = 2 * 10 * 5 = 100 J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Động năng của một vật thay đổi thế nào khi vận tốc của nó tăng lên gấp đôi?',
        dap: 'Tăng lên gấp 4 lần (vì tỉ lệ thuận với bình phương vận tốc).',
      },
      {
        hoi: 'Giá trị thế năng trọng trường phụ thuộc vào việc chọn đại lượng nào làm chuẩn?',
        dap: 'Phụ thuộc vào việc chọn gốc toạ độ (mốc thế năng bằng 0).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c4-b26',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Năng lượng, công, công suất',
    lessonNumber: 26,
    title: 'Cơ năng và định luật bảo toàn cơ năng',
    hook:
      'Khi tàu lượn siêu tốc lao dốc từ đỉnh cao nhất, nó chạy nhanh dần lên. Thế năng tích tụ ở đỉnh đã biến đi đâu? ' +
      'Nó chuyển hóa thành động năng dưới sự giám sát của định luật bảo toàn cơ năng.',
    theory:
      'KHÁI NIỆM CƠ NĂNG (MECHANICAL ENERGY):\\n' +
      '— Cơ năng (W) là tổng động năng và thế năng của vật: W = W_đ + W_t = 0,5.m.v² + m.g.h.\\n\\n' +
      'ĐỊNH LUẬT BẢO TOÀN CƠ NĂNG:\\n' +
      '— Phát biểu: Khi một vật chuyển động trong trọng trường chỉ chịu tác dụng của trọng lực (không có lực cản, lực ma sát), thì cơ năng của vật là một đại lượng bảo toàn (không đổi theo thời gian).\\n' +
      '— Biểu thức: W = W_đ + W_t = hằng số.\\n' +
      '  — Hệ quả: Động năng cực đại tại vị trí thế năng cực tiểu (mặt đất), thế năng cực đại tại vị trí động năng cực tiểu (đỉnh cao nhất).\\n\\n' +
      'ẢNH HƯỞNG CỦA LỰC MA SÁT (LỰC KHÔNG THẾ):\\n' +
      '— Nếu vật chịu thêm lực cản, ma sát, cơ năng không bảo toàn. Độ biến thiên cơ năng bằng công của lực ma sát: A_ms = W₂ - W₁ (cơ năng hao hụt chuyển thành nhiệt năng).',
    workedExample: {
      problem:
        'Một vật được thả rơi tự do không vận tốc đầu từ độ cao h = 20 m xuống mặt đất. Lấy g = 10 m/s². ' +
        'Dùng định luật bảo toàn cơ năng để tính vận tốc của vật ngay trước khi chạm đất.',
      steps: [
        'Chọn mốc thế năng tại mặt đất (h = 0).',
        'Cơ năng tại vị trí thả ở đỉnh cao h: W₁ = W_đ1 + W_t1 = 0 + m.g.h = m.g.h.',
        'Cơ năng tại vị trí chạm đất (h = 0): W₂ = W_đ2 + W_t2 = 0,5.m.v² + 0 = 0,5.m.v².',
        'Vì bỏ qua sức cản không khí, cơ năng bảo toàn: W₁ = W₂ => m.g.h = 0,5.m.v².',
        'Rút gọn m hai vế: g.h = 0,5.v² => v² = 2.g.h = 2 * 10 * 20 = 400.',
        'Suy ra v = √400 = 20 (m/s).',
      ],
      answer: 'v = 20 m/s',
    },
    checkQuestions: [
      {
        prompt:
          'Định luật bảo toàn cơ năng chỉ nghiệm đúng khi vật chuyển động dưới tác dụng của lực nào sau đây (bỏ qua các lực khác)?',
        choices: [
          { id: 'trong_luc', label: 'Chỉ chịu tác dụng của trọng lực (hoặc lực thế)' },
          { id: 'ma_sat', label: 'Chịu tác dụng chủ yếu của lực ma sát' },
          { id: 'khi_dong', label: 'Chịu tác dụng của lực cản không khí rất lớn' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['trong_luc'],
        },
        explain:
          'Bảo toàn cơ năng yêu cầu hệ không chịu lực cản, ma sát tiêu hao năng lượng, chỉ chịu tác dụng của lực thế như trọng lực.',
      },
      {
        prompt:
          'Một vật có cơ năng tổng cộng là 100 J chuyển động trong trọng trường. Tại một vị trí, thế năng trọng trường của vật đo được là 40 J. Tính động năng của vật tại vị trí đó.',
        answer: {
          kind: 'numeric',
          value: 60,
          unit: 'J',
        },
        explain: 'Động năng W_đ = W - W_t = 100 - 40 = 60 J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Cơ năng của một vật gồm các thành phần nào?',
        dap: 'Gồm động năng (năng lượng chuyển động) và thế năng (năng lượng vị trí).',
      },
      {
        hoi: 'Khi một vật rơi tự do xuống dưới, sự chuyển hoá năng lượng diễn ra như thế nào?',
        dap: 'Thế năng giảm dần và chuyển hoá hoàn toàn thành động năng tăng dần.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c4-b27',
    grade: '10',
    chapterNumber: 4,
    chapterTitle: 'Năng lượng, công, công suất',
    lessonNumber: 27,
    title: 'Hiệu suất',
    hook:
      'Không một động cơ nào trong thực tế có hiệu suất 100%. Phần lớn điện năng cung cấp cho bóng đèn sợi đốt bị biến thành nhiệt nóng vô ích thay vì phát sáng. ' +
      'Làm thế nào để đo lường mức độ hữu ích của máy móc?',
    theory:
      'KHÁI NIỆM HIỆU SUẤT (EFFICIENCY):\\n' +
      '— Hiệu suất (H) là tỉ số giữa năng lượng có ích (hoặc công có ích) tạo ra và năng lượng toàn phần (hoặc công toàn phần) cung cấp cho thiết bị.\\n' +
      '— Công thức tính hiệu suất:\\n' +
      '  — Theo công cơ học: H = (A_ich / A_tp) * 100%.\\n' +
      '  — Theo công suất: H = (𝒫_ich / 𝒫_tp) * 100%.\\n' +
      '— Do luôn có hao phí năng lượng (toả nhiệt do ma sát, điện trở hao phí), công có ích luôn nhỏ hơn công toàn phần nên hiệu suất luôn nhỏ hơn 100% (H < 100%).',
    workedExample: {
      problem:
        'Một động cơ điện tiêu thụ công suất toàn phần là 𝒫_tp = 1000 W để kéo một thang nâng. ' +
        'Công suất có ích dùng để nâng thang lên là 𝒫_ich = 800 W. Tính hiệu suất của động cơ điện này.',
      steps: [
        'Xác định công suất toàn phần cung cấp cho động cơ: 𝒫_tp = 1000 W.',
        'Xác định công suất có ích tạo ra lực kéo nâng thang: 𝒫_ich = 800 W.',
        'Áp dụng công thức tính hiệu suất theo công suất: H = (𝒫_ich / 𝒫_tp) * 100%.',
        'Thay số: H = (800 / 1000) * 100% = 0,8 * 100% = 80%.',
      ],
      answer: 'H = 80%',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính hiệu suất H của một máy biến đổi năng lượng dựa trên công có ích (A_ich) và công toàn phần tiêu thụ (A_tp).',
        choices: [
          { id: 'ct_1', label: 'H = (A_ich / A_tp) * 100%' },
          { id: 'ct_2', label: 'H = (A_tp / A_ich) * 100%' },
          { id: 'ct_3', label: 'H = A_ich * A_tp' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain: 'Hiệu suất bằng tỉ số phần có ích chia cho tổng thể toàn phần nhân với 100%.',
      },
      {
        prompt:
          'Một máy bơm nước tiêu thụ năng lượng toàn phần là 500 J, trong đó phần năng lượng có ích dùng để bơm nước lên bồn chứa là 400 J. Tính hiệu suất của máy bơm.',
        answer: {
          kind: 'numeric',
          value: 0.8,
          unit: '%',
        },
        explain: 'H = (400 / 500) * 100% = 80%.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao trong thực tế hiệu suất của máy móc luôn nhỏ hơn 100%?',
        dap: 'Vì luôn có một phần năng lượng bị hao phí (chuyển hoá thành nhiệt năng vô ích do ma sát hoặc điện trở).',
      },
      {
        hoi: 'Năng lượng hao phí thường biến đổi thành dạng năng lượng nào?',
        dap: 'Thường biến đổi thành nhiệt năng toả ra môi trường xung quanh.',
      },
    ],
    reviewStatus: 'draft',
  },
]
