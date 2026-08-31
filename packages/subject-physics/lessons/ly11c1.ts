// lessons/ly11c1.ts — Vật lí 11, Chương 1: Dao động (7 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY11_C1_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly11-c1-b1',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 1,
    title: 'Dao động điều hoà',
    hook:
      'Chiếc xích đu đung đưa, dây đàn ghi-ta rung động hay quả lắc đồng hồ tích tắc qua lại đều là dao động cơ. ' +
      'Dạng dao động cơ đơn giản và nền tảng nhất chính là dao động điều hoà.',
    theory:
      'DAO ĐỘNG CƠ (MECHANICAL OSCILLATION):\\n' +
      '— Dao động cơ là chuyển động lặp đi lặp lại của một vật quanh một vị trí cân bằng xác định.\\n' +
      '— Dao động tuần hoàn là dao động mà sau những khoảng thời gian bằng nhau gọi là chu kì, vật trở lại vị trí cũ theo hướng cũ.\\n\\n' +
      'DAO ĐỘNG ĐIỀU HOÀ (SIMPLE HARMONIC MOTION):\\n' +
      '— Là dao động tuần hoàn mà li độ (tọa độ của vật tính từ vị trí cân bằng) là một hàm cosin hoặc sin của thời gian.\\n' +
      '— Phương trình li độ: x = A.cos(ωt + φ).\\n\\n' +
      'CÁC ĐẠI LƯỢNG TRONG PHƯƠNG TRÌNH:\\n' +
      '1. x: Li độ của vật (đơn vị: m hoặc cm). Biểu diễn khoảng cách và chiều lệch từ vị trí cân bằng.\\n' +
      '2. A: Biên độ dao động (A > 0, cùng đơn vị với x). Là độ lệch cực đại của vật khỏi vị trí cân bằng.\\n' +
      '3. ω: Tần số góc (đơn vị: rad/s). Đo tốc độ biến đổi pha của dao động.\\n' +
      '4. (ωt + φ): Pha của dao động tại thời điểm t (đơn vị: rad). Xác định trạng thái dao động (vị trí, chiều chuyển động) tại t.\\n' +
      '5. φ: Pha ban đầu (đơn vị: rad). Xác định trạng thái của vật tại thời điểm khởi đầu t = 0.\\n\\n' +
      'CHU KÌ VÀ TẦN SỐ:\\n' +
      '— Chu kì (T): Thời gian vật thực hiện một dao động toàn phần. Công thức: T = 2π / ω (đơn vị: s).\\n' +
      '— Tần số (f): Số dao động toàn phần vật thực hiện trong một giây. Công thức: f = 1 / T = ω / 2π (đơn vị: Hz).',
    workedExample: {
      problem:
        'Một vật nhỏ dao động điều hoà theo phương trình li độ x = 6.cos(4πt - π/6) cm. ' +
        'Xác định biên độ, tần số góc, chu kì, tần số và pha ban đầu của dao động.',
      steps: [
        'So sánh phương trình x = 6.cos(4πt - π/6) với phương trình chuẩn x = A.cos(ωt + φ).',
        'Biên độ dao động: A = 6 cm.',
        'Tần số góc: ω = 4π rad/s.',
        'Chu kì dao động: T = 2π / ω = 2π / (4π) = 0,5 (s).',
        'Tần số dao động: f = 1 / T = 1 / 0,5 = 2 (Hz).',
        'Pha ban đầu của dao động: φ = -π/6 rad.',
      ],
      answer: 'A = 6 cm; ω = 4π rad/s; T = 0,5 s; f = 2 Hz; φ = -π/6 rad.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong phương trình li độ của dao động điều hoà x = A.cos(ωt + φ), đại lượng A đại diện cho:',
        choices: [
          { id: 'da_1', label: 'Biên độ dao động' },
          { id: 'da_2', label: 'Tần số góc' },
          { id: 'da_3', label: 'Pha ban đầu' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['da_1'],
        },
        explain: 'A là biên độ dao động, biểu thị độ lệch cực đại của vật khỏi vị trí cân bằng.',
      },
      {
        prompt:
          'Một vật dao động điều hoà với phương trình li độ x = 5.cos(10πt + π/3) cm. Hãy tính chu kì dao động của vật.',
        answer: {
          kind: 'numeric',
          value: 0.2,
          unit: 's',
        },
        explain: 'Tần số góc ω = 10π rad/s. Chu kì T = 2π / ω = 2π / 10π = 0,2 s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Biên độ dao động điều hoà A có giá trị âm hay dương?',
        dap: 'Biên độ A luôn luôn là một hằng số dương (A > 0).',
      },
      {
        hoi: 'Đơn vị đo chuẩn của tần số dao động trong hệ SI là gì?',
        dap: 'Hertz (Hz).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b2',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 2,
    title: 'Mô tả dao động điều hoà',
    hook:
      'Làm thế nào để xác định chính xác li độ hay hướng chuyển động của một vật dao động siêu nhanh tại một thời điểm bất kì? ' +
      'Các nhà khoa học sử dụng mối liên hệ hình học tuyệt vời giữa chuyển động tròn đều và dao động điều hoà.',
    theory:
      'ĐƯỜNG TRÒN LƯỢNG GIÁC (REFERENCE CIRCLE):\\n' +
      '— Một điểm M chuyển động tròn đều trên đường tròn bán kính A với tốc độ góc ω.\\n' +
      '— Hình chiếu P của điểm M lên đường kính nằm ngang của đường tròn sẽ dao động điều hoà quanh tâm O với phương trình x = A.cos(ωt + φ).\\n' +
      '— Do đó, biên độ dao động bằng đúng bán kính đường tròn (A = R), và tần số góc của dao động bằng đúng tốc độ góc quay của M.\\n\\n' +
      'ĐỘ LỆCH PHA GIỮA HAI DAO ĐỘNG (PHASE DIFFERENCE):\\n' +
      '— Cho hai dao động cùng tần số góc: x₁ = A₁.cos(ωt + φ₁) và x₂ = A₂.cos(ωt + φ₂).\\n' +
      '— Độ lệch pha: Δφ = φ₂ - φ₁.\\n' +
      '  — Nếu Δφ > 0: Dao động 2 nhanh pha (sớm pha) hơn dao động 1.\\n' +
      '  — Nếu Δφ < 0: Dao động 2 chậm pha (trễ pha) hơn dao động 1.\\n' +
      '  — Nếu Δφ = 2kπ (k nguyên): Hai dao động cùng pha.\\n' +
      '  — Nếu Δφ = (2k+1)π (k nguyên): Hai dao động ngược pha.\\n' +
      '  — Nếu Δφ = (2k+1)π/2 (k nguyên): Hai dao động vuông pha.',
    workedExample: {
      problem:
        'Xét hai dao động điều hoà cùng tần số có phương trình x₁ = 3.cos(10t + π/4) cm và x₂ = 5.cos(10t - π/4) cm. ' +
        'Hãy xác định độ lệch pha giữa hai dao động này và nêu mối quan hệ pha của chúng.',
      steps: [
        'Xác định pha ban đầu của dao động 1: φ₁ = π/4 rad.',
        'Xác định pha ban đầu của dao động 2: φ₂ = -π/4 rad.',
        'Tính độ lệch pha Δφ = φ₁ - φ₂ = π/4 - (-π/4) = π/2 rad.',
        'Vì Δφ = π/2 nên hai dao động này vuông pha với nhau, cụ thể dao động 1 sớm pha hơn dao động 2 một góc π/2 rad.',
      ],
      answer: 'Δφ = π/2 rad (Hai dao động vuông pha).',
    },
    checkQuestions: [
      {
        prompt:
          'Nếu hai dao động điều hoà cùng tần số có pha ban đầu lần lượt là φ₁ = π/3 và φ₂ = -2π/3, mối quan hệ pha của chúng là gì?',
        choices: [
          { id: 'ph_1', label: 'Ngược pha' },
          { id: 'ph_2', label: 'Cùng pha' },
          { id: 'ph_3', label: 'Vuông pha' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ph_1'],
        },
        explain:
          'Δφ = φ₁ - φ₂ = π/3 - (-2π/3) = π rad. Khi độ lệch pha bằng số lẻ lần π thì hai dao động ngược pha.',
      },
      {
        prompt:
          'Một điểm chuyển động tròn đều với bán kính 0,1 m. Biên độ của hình chiếu chuyển động này lên một trục nằm trong mặt phẳng quỹ đạo bằng bao nhiêu mét?',
        answer: {
          kind: 'numeric',
          value: 0.1,
          unit: 'm',
        },
        explain:
          'Biên độ dao động điều hoà của hình chiếu bằng chính bán kính đường tròn quỹ đạo: A = R = 0,1 m.',
      },
    ],
    srsCards: [
      {
        hoi: 'Thế nào là hai dao động cùng pha?',
        dap: 'Là hai dao động cùng tần số có độ lệch pha bằng một số nguyên lần 2π (Δφ = 2kπ).',
      },
      {
        hoi: 'Mối quan hệ giữa tốc độ góc của điểm chuyển động tròn đều và tần số góc của dao động điều hoà hình chiếu là gì?',
        dap: 'Tần số góc của dao động điều hoà bằng đúng tốc độ góc của chuyển động tròn đều (ω).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b3',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 3,
    title: 'Vận tốc, gia tốc trong dao động điều hoà',
    hook:
      'Trong lúc vật dao động điều hoà qua lại, tốc độ của nó thay đổi thế nào? Gia tốc của nó hướng về đâu? ' +
      'Phương trình đạo hàm thời gian sẽ tiết lộ những quy luật động học này.',
    theory:
      'VẬN TỐC TRONG DAO ĐỘNG ĐIỀU HOÀ (VELOCITY):\\n' +
      '— Vận tốc v là đạo hàm bậc nhất của li độ theo thời gian:\\n' +
      "  v = x' = -ω.A.sin(ωt + φ) = ω.A.cos(ωt + φ + π/2).\\n" +
      '— Tính chất: Vận tốc biến thiên điều hoà cùng tần số với li độ nhưng sớm pha hơn li độ một góc π/2.\\n' +
      '  — Ở vị trí cân bằng (x = 0): Vận tốc có độ lớn cực đại v_max = ω.A.\\n' +
      '  — Ở vị trí biên (x = ±A): Vận tốc bằng không (v = 0).\\n\\n' +
      'GIA TỐC TRONG DAO ĐỘNG ĐIỀU HOÀ (ACCELERATION):\\n' +
      '— Gia tốc a là đạo hàm bậc nhất của vận tốc (đạo hàm bậc hai của li độ) theo thời gian:\\n' +
      '  a = v\' = x" = -ω².A.cos(ωt + φ) = -ω².x = ω².A.cos(ωt + φ + π).\\n' +
      '— Tính chất: Gia tốc biến thiên điều hoà cùng tần số nhưng ngược pha với li độ (sớm pha π/2 so với vận tốc).\\n' +
      '  — Vectơ gia tốc luôn hướng về vị trí cân bằng và có độ lớn tỉ lệ với li độ.\\n' +
      '  — Ở vị trí cân bằng (x = 0): Gia tốc bằng không (a = 0).\\n' +
      '  — Ở vị trí biên (x = ±A): Gia tốc có độ lớn cực đại a_max = ω².A.',
    workedExample: {
      problem:
        'Một chất điểm dao động điều hoà với biên độ A = 5 cm và chu kì T = 2 s. ' +
        'Tính độ lớn vận tốc cực đại và độ lớn gia tốc cực đại của chất điểm.',
      steps: [
        'Tính tần số góc ω: ω = 2π / T = 2π / 2 = π rad/s.',
        'Tính độ lớn vận tốc cực đại: v_max = ω.A = π * 5 = 5π ≈ 15,71 cm/s = 0,157 m/s.',
        'Tính độ lớn gia tốc cực đại: a_max = ω².A = π² * 5 ≈ 10 * 5 = 50 cm/s² = 0,5 m/s² (lấy π² ≈ 10).',
      ],
      answer: 'v_max ≈ 0,157 m/s; a_max ≈ 0,5 m/s².',
    },
    checkQuestions: [
      {
        prompt: 'Vectơ gia tốc của vật dao động điều hoà luôn có đặc điểm nào sau đây?',
        choices: [
          { id: 'ac_1', label: 'Luôn hướng về vị trí cân bằng' },
          { id: 'ac_2', label: 'Luôn cùng hướng chuyển động' },
          { id: 'ac_3', label: 'Luôn hướng ra xa vị trí cân bằng' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ac_1'],
        },
        explain:
          'Gia tốc a = -ω²x có dấu trái với li độ x, nghĩa là vectơ gia tốc luôn hướng về vị trí cân bằng.',
      },
      {
        prompt:
          'Một vật dao động điều hoà với biên độ A = 0,1 m và tần số góc ω = 10 rad/s. Tính độ lớn vận tốc cực đại của vật.',
        answer: {
          kind: 'numeric',
          value: 1,
          unit: 'm/s',
        },
        explain: 'v_max = ω * A = 10 * 0,1 = 1 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại vị trí cân bằng, vận tốc và gia tốc có giá trị/độ lớn như thế nào?',
        dap: 'Vận tốc có độ lớn cực đại (v_max = ωA), gia tốc bằng không (a = 0).',
      },
      {
        hoi: 'Tại vị trí biên, vận tốc và gia tốc có giá trị/độ lớn như thế nào?',
        dap: 'Vận tốc bằng không (v = 0), gia tốc có độ lớn cực đại (a_max = ω²A).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b4',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 4,
    title: 'Bài tập về dao động điều hoà',
    hook:
      'Làm thế nào để kết nối các thông số li độ, vận tốc, gia tốc mà không cần biết thời gian t? ' +
      'Các hệ thức độc lập thời gian sẽ là chìa khoá để giải quyết mọi bài tập.',
    theory:
      'HỆ THỨC ĐỘC LẬP VỚI THỜI GIAN (TIME-INDEPENDENT EQUATION):\\n' +
      '— Từ hai phương trình vuông pha:\\n' +
      '  (x / A)² + (v / v_max)² = 1 ⇔ (x / A)² + (v / ωA)² = 1.\\n' +
      '— Viết lại công thức tính biên độ A: A² = x² + v² / ω².\\n' +
      '— Mối liên hệ gia tốc và li độ: a = -ω².x.\\n\\n' +
      'PHƯƠNG PHÁP XÁC ĐỊNH TRẠNG THÁI DAO ĐỘNG TẠI THỜI ĐIỂM T:\\n' +
      '— Bước 1: Xác định phương trình dao động x = A.cos(ωt + φ).\\n' +
      '— Bước 2: Thay thời điểm t vào phương trình li độ và phương trình vận tốc v = -ωA.sin(ωt + φ).\\n' +
      '— Bước 3: Xác định dấu của v để biết chiều chuyển động (v > 0: theo chiều dương, v < 0: theo chiều âm).',
    workedExample: {
      problem:
        'Một vật dao động điều hoà với tần số góc ω = 10 rad/s. Khi vật đi qua vị trí có li độ x = 3 cm ' +
        'thì nó đang chuyển động với tốc độ v = 40 cm/s. Hãy tính biên độ dao động A của vật.',
      steps: [
        'Xác định các đại lượng đã biết: ω = 10 rad/s, li độ x = 3 cm = 0,03 m, tốc độ v = 40 cm/s = 0,4 m/s.',
        'Sử dụng hệ thức độc lập thời gian tính A: A² = x² + v² / ω².',
        'Đổi đơn vị đồng bộ theo cm: A² = 3² + 40² / 10² = 9 + 1600 / 100 = 9 + 16 = 25 cm².',
        'Lấy căn bậc hai (biên độ A luôn dương): A = √25 = 5 cm = 0,05 m.',
      ],
      answer: 'A = 5 cm (hoặc 0,05 m).',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức độc lập với thời gian liên hệ giữa biên độ A, li độ x, vận tốc v và tần số góc ω.',
        choices: [
          { id: 'ind_1', label: 'A² = x² + v² / ω²' },
          { id: 'ind_2', label: 'A² = x² + v² * ω²' },
          { id: 'ind_3', label: 'A = x + v / ω' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ind_1'],
        },
        explain:
          'Hệ thức độc lập thời gian bắt nguồn từ hệ thức lượng giác cos²α + sin²α = 1: A² = x² + v²/ω².',
      },
      {
        prompt:
          'Một vật dao động điều hoà có biên độ A = 0,05 m, tần số góc ω = 10 rad/s. Khi vật đi qua vị trí cân bằng (x = 0), hãy tính vận tốc của vật theo chiều dương.',
        answer: {
          kind: 'numeric',
          value: 0.5,
          unit: 'm/s',
        },
        explain:
          'Ở vị trí cân bằng x = 0, vật đi theo chiều dương đạt vận tốc cực đại: v = ω * A = 10 * 0,05 = 0.5 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết hệ thức liên hệ trực tiếp giữa gia tốc a và li độ x trong dao động điều hoà.',
        dap: 'a = -ω²x.',
      },
      {
        hoi: 'Khi vật chuyển động theo chiều dương của trục toạ độ thì vận tốc v có dấu thế nào?',
        dap: 'Vận tốc v mang giá trị dương (v > 0).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b5',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 5,
    title: 'Động năng. Thế năng. Sự chuyển hoá năng lượng trong dao động điều hoà',
    hook:
      'Khi chơi xích đu, lúc bạn ở vị trí cao nhất, bạn dừng lại một khoảnh khắc (vận tốc bằng 0), nhưng khi rơi xuống điểm thấp nhất, ' +
      'bạn bay với tốc độ tối đa. Đó chính là sự biến đổi nhịp nhàng giữa Động năng và Thế năng.',
    theory:
      'ĐỘNG NĂNG TRONG DAO ĐỘNG ĐIỀU HOÀ (KINETIC ENERGY):\\n' +
      '— Là động năng của chất điểm khối lượng m chuyển động với vận tốc v:\\n' +
      '  W_đ = 1/2.m.v² = 1/2.m.ω².A².sin²(ωt + φ).\\n\\n' +
      'THẾ NĂNG TRONG DAO ĐỘNG ĐIỀU HOÀ (POTENTIAL ENERGY):\\n' +
      '— Thế năng đàn hồi hoặc thế năng trọng trường quy về li độ x của vật:\\n' +
      '  W_t = 1/2.m.ω².x² = 1/2.m.ω².A².cos²(ωt + φ).\\n\\n' +
      'CƠ NĂNG VÀ SỰ BẢO TOÀN CƠ NĂNG (MECHANICAL ENERGY):\\n' +
      '— Cơ năng W là tổng động năng và thế năng:\\n' +
      '  W = W_đ + W_t = 1/2.m.ω².A² = hằng số.\\n' +
      '— Khi không có lực ma sát cản trở, cơ năng của vật dao động điều hoà được bảo toàn, tỉ lệ với bình phương biên độ dao động.\\n\\n' +
      'CHU KÌ BIẾN THIÊN CỦA NĂNG LƯỢNG:\\n' +
      '— Trong khi li độ biến thiên tuần hoàn với chu kì T, tần số f, thì động năng và thế năng biến thiên tuần hoàn với:\\n' +
      "  — Chu kì: T' = T / 2.\\n" +
      "  — Tần số: f' = 2f; Tần số góc: ω' = 2ω.",
    workedExample: {
      problem:
        'Một vật nhỏ khối lượng m = 100g (0,1 kg) dao động điều hoà với biên độ A = 10 cm (0,1 m) ' +
        'và chu kì T = 0,2 s. Tính cơ năng dao động của vật (lấy π² = 10).',
      steps: [
        'Xác định các đại lượng ở đơn vị SI: m = 0,1 kg, A = 0,1 m, T = 0,2 s.',
        'Tính tần số góc ω: ω = 2π / T = 2π / 0,2 = 10π rad/s.',
        'Tính ω²: ω² = (10π)² = 100π² ≈ 100 * 10 = 1000 rad²/s².',
        'Áp dụng công thức tính cơ năng: W = 1/2.m.ω².A² = 0,5 * 0,1 * 1000 * 0,1² = 0,5 * 0,1 * 1000 * 0,01 = 0,5 J.',
      ],
      answer: 'W = 0,5 J.',
    },
    checkQuestions: [
      {
        prompt:
          "Nếu một vật dao động điều hoà có chu kì dao động li độ là T, thì thế năng của vật sẽ biến thiên tuần hoàn với chu kì T' bằng:",
        choices: [
          { id: 'en_1', label: "T' = T / 2" },
          { id: 'en_2', label: "T' = T" },
          { id: 'en_3', label: "T' = 2 * T" },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['en_1'],
        },
        explain:
          "Động năng và thế năng biến thiên tuần hoàn với chu kì bằng một nửa chu kì dao động của li độ: T' = T/2.",
      },
      {
        prompt:
          'Một vật dao động điều hoà có cơ năng toàn phần là W. Khi thế năng của vật bằng 3/4 cơ năng thì động năng của vật bằng bao nhiêu phần cơ năng?',
        answer: {
          kind: 'numeric',
          value: 0.25,
          unit: '',
        },
        explain: 'Động năng W_đ = W - W_t = W - 0,75W = 0,25W (tức 1/4 cơ năng).',
      },
    ],
    srsCards: [
      {
        hoi: 'Cơ năng của vật dao động điều hoà thay đổi như thế nào nếu biên độ dao động tăng lên gấp đôi?',
        dap: 'Cơ năng tăng lên gấp 4 lần (vì W tỉ lệ thuận với bình phương biên độ A²).',
      },
      {
        hoi: 'Tại vị trí nào thì động năng của vật đạt giá trị cực đại, thế năng đạt cực tiểu?',
        dap: 'Tại vị trí cân bằng (x = 0), khi đó vận tốc cực đại nên động năng cực đại, thế năng bằng không.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b6',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 6,
    title: 'Dao động tắt dần. Dao động cưỡng bức. Hiện tượng cộng hưởng',
    hook:
      'Tại sao chiếc xích đu nếu không đẩy sẽ dừng lại? Và tại sao một cây cầu thép vững chắc có thể đổ sập ' +
      'chỉ vì một cơn gió nhẹ thổi đúng nhịp? Đó là những bài học thực tế về tắt dần, cưỡng bức và cộng hưởng.',
    theory:
      'DAO ĐỘNG TẮT DẦN (DAMPED OSCILLATION):\\n' +
      '— Là dao động có biên độ và năng lượng giảm dần theo thời gian do tác dụng của lực cản/lực ma sát của môi trường.\\n' +
      '— Lực cản càng lớn, quá trình tắt dần càng nhanh. Ứng dụng: Thiết bị giảm xóc ô tô, xe máy, cửa đóng tự động.\\n\\n' +
      'DAO ĐỘNG DUY TRÌ (MAINTAINED OSCILLATION):\\n' +
      '— Được bù đắp năng lượng đúng bằng phần mất đi sau mỗi chu kì mà không làm thay đổi chu kì riêng của hệ. Ứng dụng: Quả lắc đồng hồ.\\n\\n' +
      'DAO ĐỘNG CƯỠNG BỨC (FORCED OSCILLATION):\\n' +
      '— Là dao động của hệ dưới tác dụng của ngoại lực biến thiên tuần hoàn F = F_o.cos(2πf.t).\\n' +
      '— Đặc điểm: Dao động cưỡng bức có biên độ không đổi và tần số bằng đúng tần số f của lực cưỡng bức bên ngoài.\\n\\n' +
      'HIỆN TƯỢNG CỘNG HƯỞNG (RESONANCE):\\n' +
      '— Hiện tượng biên độ của dao động cưỡng bức đạt giá trị cực đại khi tần số f của ngoại lực tuần hoàn bằng đúng tần số riêng f_o của hệ dao động.\\n' +
      '— Ý nghĩa và tác hại: Có hại làm nứt gãy cầu, nhà, bệ máy nếu tần số rung khớp tần số riêng. Có ích trong nhạc cụ (hộp đàn), chọn sóng đài vô tuyến.',
    workedExample: {
      problem:
        'Một hệ dao động riêng có tần số f_o = 10 Hz. Người ta đặt vào hệ các lực cưỡng bức tuần hoàn khác nhau có tần số ' +
        'lần lượt là f₁ = 5 Hz, f₂ = 9 Hz, f₃ = 12 Hz. Với tần số nào thì hệ xảy ra hiện tượng dao động mạnh nhất?',
      steps: [
        'Xác định tần số riêng của hệ: f_o = 10 Hz.',
        'Xác định các tần số của ngoại lực cưỡng bức: f₁ = 5 Hz, f₂ = 9 Hz, f₃ = 12 Hz.',
        'Theo lí thuyết cộng hưởng, biên độ dao động cưỡng bức đạt cực đại khi tần số ngoại lực tiến gần hoặc bằng tần số riêng f_o.',
        'So sánh: |f₂ - f_o| = |9 - 10| = 1 Hz, nhỏ hơn so với |f₃ - f_o| = 2 Hz và |f₁ - f_o| = 5 Hz.',
        'Do đó, với ngoại lực cưỡng bức tần số f₂ = 9 Hz, hệ sẽ dao động mạnh nhất trong số các tần số đã cho.',
      ],
      answer: 'Tần số f₂ = 9 Hz.',
    },
    checkQuestions: [
      {
        prompt: 'Hiện tượng cộng hưởng cơ xảy ra khi nào?',
        choices: [
          { id: 'res_1', label: 'Tần số ngoại lực bằng tần số riêng của hệ' },
          { id: 'res_2', label: 'Biên độ ngoại lực bằng biên độ riêng của hệ' },
          { id: 'res_3', label: 'Năng lượng ngoại lực lớn gấp đôi năng lượng của hệ' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['res_1'],
        },
        explain:
          'Cộng hưởng xảy ra khi tần số ngoại lực cưỡng bức tuần hoàn bằng tần số dao động riêng của hệ.',
      },
      {
        prompt:
          'Một hệ dao động có tần số riêng f_o = 5 Hz. Nếu tác dụng vào hệ một ngoại lực cưỡng bức tuần hoàn có tần số f = 5 Hz thì biên độ dao động cưỡng bức của hệ sẽ đạt trạng thái nào?',
        choices: [
          { id: 'max_1', label: 'Đạt giá trị cực đại (cộng hưởng)' },
          { id: 'max_2', label: 'Bằng không' },
          { id: 'max_3', label: 'Giảm dần về không' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['max_1'],
        },
        explain:
          'Vì tần số ngoại lực f bằng tần số riêng f_o = 5 Hz nên xảy ra hiện tượng cộng hưởng, biên độ đạt cực đại.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đặc điểm chính của dao động tắt dần là gì?',
        dap: 'Biên độ và năng lượng dao động giảm dần theo thời gian.',
      },
      {
        hoi: 'Tần số của dao động cưỡng bức được quyết định bởi yếu tố nào?',
        dap: 'Được quyết định hoàn toàn bởi tần số của ngoại lực cưỡng bức tuần hoàn bên ngoài.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c1-b7',
    grade: '11',
    chapterNumber: 1,
    chapterTitle: 'Dao động',
    lessonNumber: 7,
    title: 'Bài tập về sự chuyển hoá năng lượng trong dao động điều hoà',
    hook:
      'Làm thế nào để tìm vị trí mà ở đó động năng lớn gấp ba lần thế năng? Hay thế năng lớn gấp đôi động năng? ' +
      'Chúng ta sẽ học phương pháp đại số giải nhanh các bài toán năng lượng.',
    theory:
      'CÔNG THỨC LIÊN HỆ ĐỘNG NĂNG VÀ THẾ NĂNG:\\n' +
      '— Từ hệ thức bảo toàn cơ năng: W = W_đ + W_t.\\n' +
      '— Khi động năng bằng n lần thế năng (W_đ = n.W_t):\\n' +
      '  W = (n + 1).W_t ⇔ 1/2.m.ω².A² = (n + 1) * 1/2.m.ω².x²\\n' +
      '  ⇒ x = ± A / √(n + 1).\\n\\n' +
      'CÁC VỊ TRÍ ĐẶC BIỆT THƯỜNG GẶP:\\n' +
      '1. Động năng bằng thế năng (W_đ = W_t ⇔ n = 1):\\n' +
      '   x = ± A / √2 ≈ ± 0,707.A.\\n' +
      '2. Động năng gấp 3 lần thế năng (W_đ = 3.W_t ⇔ n = 3):\\n' +
      '   x = ± A / 2 = ± 0,5.A.\\n' +
      '3. Thế năng gấp 3 lần động năng (W_t = 3.W_đ ⇔ W_đ = 1/3.W_t ⇔ n = 1/3):\\n' +
      '   x = ± A.√3 / 2 ≈ ± 0,866.A.',
    workedExample: {
      problem:
        'Một vật dao động điều hoà với biên độ A = 8 cm. Hãy tìm li độ dương x của vật ' +
        'tại vị trí mà động năng bằng 3 lần thế năng.',
      steps: [
        'Xác định tỉ số n = W_đ / W_t = 3.',
        'Áp dụng công thức tìm li độ: x = ± A / √(n + 1).',
        'Thay số vào công thức: x = ± 8 / √(3 + 1) = ± 8 / √4 = ± 8 / 2 = ± 4 cm.',
        'Vì đề bài yêu cầu tìm li độ dương nên ta chọn x = 4 cm.',
      ],
      answer: 'x = 4 cm.',
    },
    checkQuestions: [
      {
        prompt:
          'Tại vị trí nào trong dao động điều hoà thì động năng của vật bằng thế năng của vật?',
        choices: [
          { id: 'pos_1', label: 'x = ± A / √2' },
          { id: 'pos_2', label: 'x = ± A / 2' },
          { id: 'pos_3', label: 'x = 0' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['pos_1'],
        },
        explain: 'Khi W_đ = W_t, ta có W = 2W_t ⇒ 1/2 m ω² A² = 2 * (1/2 m ω² x²) ⇒ x = ± A / √2.',
      },
      {
        prompt:
          'Một vật dao động điều hoà với biên độ A = 10 cm. Tìm li độ dương của vật tại vị trí mà thế năng bằng 3 lần động năng.',
        answer: {
          kind: 'numeric',
          value: 8.66,
          unit: 'cm',
        },
        explain:
          'Thế năng bằng 3 lần động năng tức W_đ = 1/3 W_t (n = 1/3) ⇒ x = ± A * √3 / 2 = 10 * 1.732 / 2 = 8,66 cm.',
      },
    ],
    srsCards: [
      {
        hoi: 'Khi động năng bằng ba lần thế năng, li độ x quan hệ thế nào với biên độ A?',
        dap: 'x = ± A / 2.',
      },
      {
        hoi: 'Tại sao tổng động năng và thế năng trong dao động điều hoà luôn không đổi theo thời gian?',
        dap: 'Vì cơ năng được bảo toàn khi không có ma sát tiêu hao năng lượng.',
      },
    ],
    reviewStatus: 'draft',
  },
]
