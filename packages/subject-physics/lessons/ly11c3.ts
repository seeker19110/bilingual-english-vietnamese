// lessons/ly11c3.ts — Vật lí 11, Chương 3: Điện trường (6 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY11_C3_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly11-c3-b16',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 16,
    title: 'Lực tương tác giữa các điện tích',
    hook:
      'Chà xát quả bóng bay vào áo len, nó có thể dính chặt vào bức tường hay làm uốn cong cả dòng nước chảy từ vòi nước. ' +
      'Lực vô hình hút đẩy các vật ở xa nhau này là gì? Chúng tuân theo quy luật toán học nào?',
    theory:
      'ĐIỆN TÍCH (ELECTRIC CHARGE):\\n' +
      '— Có hai loại điện tích: điện tích dương (+) và điện tích âm (-).\\n' +
      '— Tương tác điện tích: Các điện tích cùng dấu thì đẩy nhau, trái dấu thì hút nhau. Đơn vị đo điện tích trong hệ SI: Coulomb (C).\\n\\n' +
      "ĐỊNH LUẬT COULOMB (COULOMB'S LAW):\\n" +
      '— Phát biểu: Độ lớn của lực tương tác giữa hai điện tích điểm đặt đứng yên trong chân không tỉ lệ thuận với tích độ lớn của hai điện tích và tỉ lệ nghịch với bình phương khoảng cách giữa chúng.\\n' +
      '— Công thức trong chân không: F = k * |q₁.q₂| / r².\\n' +
      '  — F: Lực tương tác tĩnh điện (N).\\n' +
      '  — q₁, q₂: Điện tích của hai điện tích điểm (C).\\n' +
      '  — r: Khoảng cách giữa hai điện tích điểm (m).\\n' +
      '  — k: Hằng số Coulomb (k ≈ 9 * 10⁹ N.m²/C²).\\n' +
      '— Tương tác trong điện môi đồng tính: Lực tương tác tĩnh điện giảm đi ε lần so với chân không: F = k * |q₁.q₂| / (ε.r²).\\n' +
      '  — ε: Hằng số điện môi của môi trường (điện môi chân không ε = 1, không khí ε ≈ 1, điện môi khác ε > 1).',
    workedExample: {
      problem:
        'Hai điện tích điểm q₁ = 2 * 10⁻⁸ C và q₂ = -3 * 10⁻⁸ C đặt cách nhau r = 3 cm trong chân không. ' +
        'Xác định lực tương tác tĩnh điện giữa chúng (là lực hút hay lực đẩy, tính độ lớn).',
      steps: [
        'Nhận xét: Hai điện tích trái dấu (q₁ dương, q₂ âm) nên lực tương tác là lực hút.',
        'Đổi khoảng cách sang đơn vị mét: r = 3 cm = 0,03 m.',
        'Áp dụng công thức định luật Coulomb: F = k * |q₁.q₂| / r².',
        'Thay số: F = 9 * 10⁹ * |2 * 10⁻⁸ * (-3 * 10⁻⁸)| / 0,03².',
        'Tính toán: F = 9 * 10⁹ * 6 * 10⁻¹⁶ / 0,0009 = 6 * 10⁻³ N = 0,006 N.',
      ],
      answer: 'Lực hút, độ lớn F = 0,006 N.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính độ lớn lực tương tác tĩnh điện F giữa hai điện tích điểm q₁, q₂ đặt cách nhau khoảng cách r trong môi trường điện môi có hằng số điện môi ε.',
        choices: [
          { id: 'cl_1', label: 'F = k * |q₁.q₂| / (ε * r²)' },
          { id: 'cl_2', label: 'F = k * |q₁.q₂| / r²' },
          { id: 'cl_3', label: 'F = k * |q₁.q₂| * ε / r²' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cl_1'],
        },
        explain:
          'Trong môi trường điện môi đồng tính, lực tĩnh điện Coulomb giảm đi ε lần: F = k|q₁q₂|/(εr²).',
      },
      {
        prompt:
          'Hai điện tích điểm trong chân không q₁ = 10⁻⁹ C và q₂ = 2 * 10⁻⁹ C đặt cách nhau r = 0,03 m. Tính độ lớn lực đẩy giữa chúng.',
        answer: {
          kind: 'numeric',
          value: 2e-5,
          unit: 'N',
        },
        explain:
          'F = k * |q₁.q₂| / r² = 9 * 10⁹ * (10⁻⁹ * 2 * 10⁻⁹) / 0,03² = 18 * 10⁻⁹ / 0,0009 = 2 * 10⁻⁵ N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị Coulomb (C) đo đại lượng vật lí nào?',
        dap: 'Đo điện tích (lượng điện dịch chuyển).',
      },
      {
        hoi: 'Hằng số điện môi ε của chân không có giá trị bằng bao nhiêu?',
        dap: 'Bằng 1.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c3-b17',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 17,
    title: 'Khái niệm điện trường',
    hook:
      'Làm thế nào một điện tích lại tác dụng lực hút hoặc đẩy lên một điện tích khác cách nó một khoảng xa mà không hề chạm trực tiếp? ' +
      'Xung quanh điện tích có một dạng vật chất vô hình lan toả gọi là Điện trường.',
    theory:
      'ĐIỆN TRƯỜNG (ELECTRIC FIELD):\\n' +
      '— Điện trường là một dạng vật chất bao quanh các điện tích và truyền tương tác lực điện giữa chúng. Điện tích đặt trong điện trường sẽ chịu tác dụng của lực điện.\\n\\n' +
      'CƯỜNG ĐỘ ĐIỆN TRƯỜNG (ELECTRIC FIELD STRENGTH):\\n' +
      '— Là đại lượng đặc trưng cho điện trường về phương diện tác dụng lực. Đo bằng thương số giữa lực điện tác dụng lên điện tích thử và độ lớn điện tích thử đó.\\n' +
      '— Công thức vectơ: vectơ E = vectơ F / q  ⇒  vectơ F = q * vectơ E.\\n' +
      '— Độ lớn: E = F / |q|. Đơn vị trong hệ SI: Volt trên mét (V/m).\\n\\n' +
      'ĐIỆN TRƯỜNG CỦA ĐIỆN TÍCH ĐIỂM Q:\\n' +
      '— Độ lớn cường độ điện trường do điện tích điểm Q gây ra tại điểm cách nó khoảng r trong chân không:\\n' +
      '  E = k * |Q| / r²  (Trong điện môi: E = k * |Q| / (ε.r²)).\\n' +
      '— Hướng của vectơ E:\\n' +
      '  — Hướng ra xa Q nếu Q là điện tích dương (Q > 0).\\n' +
      '  — Hướng về phía Q nếu Q là điện tích âm (Q < 0).\\n' +
      '— Nguyên lí chồng chất điện trường: Vectơ cường độ điện trường tổng hợp tại một điểm bằng tổng các vectơ thành phần: vectơ E = vectơ E₁ + vectơ E₂ + ...',
    workedExample: {
      problem:
        'Tính độ lớn cường độ điện trường do điện tích điểm Q = 10⁻⁹ C gây ra tại một điểm cách nó r = 3 cm = 0,03 m trong chân không.',
      steps: [
        'Xác định các thông số: Q = 10⁻⁹ C, r = 0,03 m, hằng số k = 9 * 10⁹ N.m²/C².',
        'Áp dụng công thức cường độ điện trường điện tích điểm: E = k * |Q| / r².',
        'Thay số: E = 9 * 10⁹ * 10⁻⁹ / 0,03².',
        'Tính toán: E = 9 / 0,0009 = 10000 V/m.',
      ],
      answer: 'E = 10000 V/m.',
    },
    checkQuestions: [
      {
        prompt: 'Đơn vị đo chuẩn của cường độ điện trường trong hệ SI là gì?',
        choices: [
          { id: 'ef_1', label: 'Volt trên mét (V/m)' },
          { id: 'ef_2', label: 'Newton trên Coulomb (N/C)' },
          { id: 'ef_3', label: 'Cả hai đơn vị trên đều đúng' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ef_3'],
        },
        explain:
          'Cường độ điện trường đo bằng F/q nên có đơn vị N/C, trong thực tế thường dùng V/m. Cả hai đơn vị đều đúng và tương đương nhau.',
      },
      {
        prompt:
          'Một điện tích thử q = 2 * 10⁻⁹ C đặt tại một điểm trong điện trường chịu tác dụng của lực điện F = 10⁻⁵ N. Tính độ lớn cường độ điện trường tại điểm đó.',
        answer: {
          kind: 'numeric',
          value: 5000,
          unit: 'V/m',
        },
        explain: 'E = F / q = 10⁻⁵ / (2 * 10⁻⁹) = 5000 V/m.',
      },
    ],
    srsCards: [
      {
        hoi: 'Vectơ cường độ điện trường gây ra bởi điện tích dương hướng về phía điện tích hay ra xa nó?',
        dap: 'Hướng thẳng hàng ra xa điện tích dương.',
      },
      {
        hoi: 'Phát biểu nguyên lí chồng chất điện trường.',
        dap: 'Cường độ điện trường do nhiều điện tích gây ra tại một điểm bằng tổng vectơ các cường độ điện trường do từng điện tích riêng lẻ gây ra.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c3-b18',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 18,
    title: 'Điện trường đều',
    hook:
      'Trong khoảng không gian giữa hai tấm kim loại phẳng song song tích điện trái dấu bằng nhau, cường độ điện trường có độ lớn và hướng như nhau tại mọi điểm. ' +
      'Đó chính là Điện trường đều - môi trường cốt lõi của các máy gia tốc hạt.',
    theory:
      'ĐỊNH NGHĨA ĐIỆN TRƯỜNG ĐỀU (UNIFORM ELECTRIC FIELD):\\n' +
      '— Điện trường đều là điện trường mà vectơ cường độ điện trường tại mọi điểm đều có cùng phương, cùng chiều và cùng độ lớn.\\n' +
      '— Đường sức điện: Là những đường thẳng song song, cùng chiều và cách đều nhau.\\n\\n' +
      'ĐIỆN TRƯỜNG GIỮA HAI BẢN KIM LOẠI PHẲNG SONG SONG TIÊU BIỂU:\\n' +
      '— Hai bản kim loại đặt song song, cách nhau một khoảng d, tích điện bằng nhau nhưng trái dấu.\\n' +
      '— Cường độ điện trường đều bên trong: E = U / d (U là hiệu điện thế giữa hai bản kim loại, d là khoảng cách giữa hai bản).\\n\\n' +
      'CHUYỂN ĐỘNG CỦA ĐIỆN TÍCH TRONG ĐIỆN TRƯỜNG ĐỀU:\\n' +
      '— Hạt tích điện q, khối lượng m đặt trong điện trường đều chịu lực điện không đổi: vectơ F = q * vectơ E.\\n' +
      '— Sinh ra gia tốc không đổi: vectơ a = q * vectơ E / m.\\n' +
      '  — Nếu hạt phóng dọc theo đường sức điện: chuyển động thẳng biến đổi đều (nhanh dần đều nếu q và E cùng hướng, chậm dần đều nếu ngược hướng).\\n' +
      '  — Nếu hạt phóng vuông góc với đường sức điện: chuyển động giống như chuyển động ném ngang (quỹ đạo là một parabol).',
    workedExample: {
      problem:
        'Hai bản kim loại phẳng song song nằm ngang cách nhau d = 2 cm = 0,02 m, nối với hiệu điện thế U = 200 V. ' +
        'Xác định cường độ điện trường đều E giữa hai bản.',
      steps: [
        'Xác định các thông số: hiệu điện thế U = 200 V, khoảng cách d = 0,02 m.',
        'Áp dụng công thức liên hệ trong điện trường đều: E = U / d.',
        'Thay số: E = 200 / 0,02 = 10000 V/m.',
        'Kết luận: Cường độ điện trường đều giữa hai bản là 10000 V/m.',
      ],
      answer: 'E = 10000 V/m.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết hệ thức liên hệ giữa cường độ điện trường E của điện trường đều với hiệu điện thế U và khoảng cách d giữa hai bản kim loại.',
        choices: [
          { id: 'uf_1', label: 'E = U / d' },
          { id: 'uf_2', label: 'E = U * d' },
          { id: 'uf_3', label: 'U = E / d' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['uf_1'],
        },
        explain:
          'Cường độ điện trường đều bằng hiệu điện thế chia cho khoảng cách dọc theo đường sức: E = U/d.',
      },
      {
        prompt:
          'Hai bản kim loại song song tích điện trái dấu cách nhau 0,01 m. Hiệu điện thế giữa hai bản là 50 V. Tính cường độ điện trường đều giữa hai bản.',
        answer: {
          kind: 'numeric',
          value: 5000,
          unit: 'V/m',
        },
        explain: 'E = U / d = 50 / 0,01 = 5000 V/m.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đường sức điện của điện trường đều có hình dạng và phân bố thế nào?',
        dap: 'Là những đường thẳng song song, cùng chiều và cách đều nhau.',
      },
      {
        hoi: 'Quỹ đạo chuyển động của một điện tích bay vuông góc vào điện trường đều có hình dạng gì?',
        dap: 'Có hình dạng đường parabol (tương tự chuyển động ném ngang).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c3-b19',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 19,
    title: 'Thế năng điện',
    hook:
      'Giống như một hòn đá được nâng lên cao có thế năng trọng trường tích luỹ, ' +
      'một điện tích dương khi bị ép lại gần một điện tích dương khác ngược chiều lực đẩy sẽ tích luỹ Thế năng điện.',
    theory:
      'CÔNG CỦA LỰC ĐIỆN TRONG ĐIỆN TRƯỜNG ĐỀU:\\n' +
      '— Lực điện tác dụng lên điện tích q đặt trong điện trường đều E là F = q.E.\\n' +
      '— Khi q di chuyển từ điểm M đến điểm N, công của lực điện được tính bằng công thức:\\n' +
      '  A_MN = q * E * d\\n' +
      '  — d: Hình chiếu của quãng đường di chuyển MN lên phương đường sức điện (d > 0 nếu hình chiếu cùng chiều đường sức, d < 0 nếu ngược chiều).\\n' +
      '— Đặc điểm: Công của lực điện thế không phụ thuộc vào hình dạng đường đi từ M đến N mà chỉ phụ thuộc vào vị trí của điểm đầu M và điểm cuối N (lực điện là lực thế).\\n\\n' +
      'THẾ NĂNG CỦA ĐIỆN TÍCH TRONG ĐIỆN TRƯỜNG:\\n' +
      '— Thế năng của điện tích q tại điểm M đặc trưng cho khả năng sinh công của điện trường khi đặt q tại đó:\\n' +
      '  W_M = A_M∞ = q * E * d_M (chọn mốc thế năng ở vô cực hoặc bản âm).',
    workedExample: {
      problem:
        'Một điện tích q = 2 * 10⁻⁹ C di chuyển một đoạn đường s = 10 cm dọc theo một đường sức của điện trường đều ' +
        'có cường độ E = 5000 V/m. Tính công của lực điện trường thực hiện khi điện tích di chuyển cùng chiều đường sức.',
      steps: [
        'Xác định các thông số: q = 2 * 10⁻⁹ C, E = 5000 V/m.',
        'Vì điện tích di chuyển cùng chiều đường sức nên d = s = 10 cm = 0,1 m.',
        'Áp dụng công thức công lực điện: A = q * E * d.',
        'Thay số: A = 2 * 10⁻⁹ * 5000 * 0,1 = 10⁻⁶ J.',
      ],
      answer: 'A = 10⁻⁶ J.',
    },
    checkQuestions: [
      {
        prompt:
          'Công của lực điện tác dụng lên điện tích q khi di chuyển từ điểm M đến điểm N trong điện trường đều E phụ thuộc vào yếu tố nào?',
        choices: [
          { id: 'wk_1', label: 'Hình dạng đường đi của điện tích' },
          { id: 'wk_2', label: 'Vị trí của điểm đầu M và điểm cuối N' },
          { id: 'wk_3', label: 'Tốc độ di chuyển của điện tích' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['wk_2'],
        },
        explain:
          'Vì lực điện là lực thế, công của nó chỉ phụ thuộc vào điểm đầu và điểm cuối của quỹ đạo chuyển động.',
      },
      {
        prompt:
          'Một điện tích q = 10⁻⁹ C di chuyển trong điện trường đều E = 1000 V/m. Biết hình chiếu quãng đường di chuyển dọc theo chiều đường sức điện là d = 0,05 m. Tính công của lực điện trường thực hiện.',
        answer: {
          kind: 'numeric',
          value: 5e-8,
          unit: 'J',
        },
        explain: 'A = q * E * d = 10⁻⁹ * 1000 * 0,05 = 5 * 10⁻⁸ J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao lực điện trường được coi là lực thế?',
        dap: 'Vì công của lực điện trường khi di chuyển một điện tích chỉ phụ thuộc vào điểm đầu và điểm cuối, không phụ thuộc vào hình dạng đường đi.',
      },
      {
        hoi: 'Viết công thức tính công của lực điện trường đều đối với điện tích q dịch chuyển quãng đường có hình chiếu d trên đường sức.',
        dap: 'A = qEd.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c3-b20',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 20,
    title: 'Điện thế',
    hook:
      'Chúng ta thường nghe nói pin tiểu 1,5V, ổ cắm điện nhà 220V. V hay Volt chính là đơn vị đo Điện thế và Hiệu điện thế. ' +
      'Điện thế đại diện cho mức năng lượng của điện trường tại mỗi điểm.',
    theory:
      'ĐIỆN THẾ (ELECTRIC POTENTIAL):\\n' +
      '— Điện thế tại một điểm M trong điện trường là đại lượng đặc trưng cho điện trường về phương diện tạo ra thế năng khi đặt tại đó một điện tích q.\\n' +
      '— Công thức: V_M = W_M / q = A_M∞ / q. Đơn vị: Volt (V).\\n\\n' +
      'HIỆU ĐIỆN THẾ (POTENTIAL DIFFERENCE):\\n' +
      '— Hiệu điện thế giữa hai điểm M và N trong điện trường là hiệu số giữa điện thế của M và N. Nó đặc trưng cho khả năng sinh công của điện trường khi di chuyển q giữa hai điểm đó.\\n' +
      '— Công thức: U_MN = V_M - V_N = A_MN / q. Đơn vị: Volt (V).\\n\\n' +
      'HỆ THỨC GIỮA CƯỜNG ĐỘ ĐIỆN TRƯỜNG VÀ HIỆU ĐIỆN THẾ:\\n' +
      '— Trong điện trường đều: E = U_MN / d  ⇒  U_MN = E * d.',
    workedExample: {
      problem:
        'Điện thế tại điểm M là V_M = 50 V, điện thế tại điểm N là V_N = 20 V. ' +
        'a) Tính hiệu điện thế U_MN.\\n' +
        'b) Tính công của điện trường làm dịch chuyển điện tích q = 2 * 10⁻⁶ C từ M đến N.',
      steps: [
        'Tính hiệu điện thế: U_MN = V_M - V_N = 50 - 20 = 30 V.',
        'Áp dụng công thức tính công: A_MN = q * U_MN.',
        'Thay số: A_MN = 2 * 10⁻⁶ * 30 = 6 * 10⁻⁵ J = 60 μJ.',
      ],
      answer: 'U_MN = 30 V; A_MN = 6 * 10⁻⁵ J.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức định nghĩa hiệu điện thế U_MN giữa hai điểm M, N dựa trên công A_MN dịch chuyển điện tích q.',
        choices: [
          { id: 'pt_1', label: 'U_MN = A_MN / q' },
          { id: 'pt_2', label: 'U_MN = A_MN * q' },
          { id: 'pt_3', label: 'U_MN = q / A_MN' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['pt_1'],
        },
        explain:
          'Hiệu điện thế bằng thương số giữa công lực điện dịch chuyển q và giá trị điện tích q: U = A/q.',
      },
      {
        prompt:
          'Điện thế tại điểm A trong điện trường là 100 V, tại điểm B là 40 V. Tính công của lực điện trường thực hiện để dịch chuyển điện tích q = 10⁻⁹ C từ A đến B.',
        answer: {
          kind: 'numeric',
          value: 6e-8,
          unit: 'J',
        },
        explain: 'U_AB = V_A - V_B = 100 - 40 = 60 V. A_AB = q * U_AB = 10⁻⁹ * 60 = 6 * 10⁻⁸ J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo hiệu điện thế trong hệ SI là gì?',
        dap: 'Volt (V).',
      },
      {
        hoi: 'Mối liên hệ giữa hiệu điện thế U giữa hai điểm và cường độ điện trường đều E có hình chiếu d là gì?',
        dap: 'U = E * d.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c3-b21',
    grade: '11',
    chapterNumber: 3,
    chapterTitle: 'Điện trường',
    lessonNumber: 21,
    title: 'Tụ điện',
    hook:
      'Đèn flash của điện thoại cần một lượng điện năng cực lớn phóng ra chỉ trong một mili giây để chớp sáng. ' +
      'Viên pin thường không thể phóng điện nhanh như vậy, nhưng Tụ điện làm được điều đó một cách hoàn hảo.',
    theory:
      'TỤ ĐIỆN LÀ GÌ (CAPACITOR):\\n' +
      '— Tụ điện là một hệ gồm hai vật dẫn đặt gần nhau và ngăn cách nhau bằng một lớp điện môi (chất cách điện). Nó dùng để tích và phóng điện năng.\\n\\n' +
      'ĐIỆN DUNG CỦA TỤ ĐIỆN (CAPACITANCE):\\n' +
      '— Điện dung C là đại lượng đặc trưng cho khả năng tích điện của tụ điện ở một hiệu điện thế nhất định. Đo bằng tỉ số giữa điện tích Q của tụ và hiệu điện thế U giữa hai bản tụ.\\n' +
      '— Công thức: C = Q / U  ⇒  Q = C * U.\\n' +
      '— Đơn vị: Farad (F). Các ước số thông dụng: Microfarad (μF = 10⁻⁶ F), Nanofarad (nF = 10⁻⁹ F), Picofarad (pF = 10⁻¹² F).\\n\\n' +
      'NĂNG LƯỢNG ĐIỆN TRƯỜNG CỦA TỤ ĐIỆN:\\n' +
      '— Khi tích điện, tụ điện tích luỹ năng lượng dưới dạng năng lượng điện trường trong lớp điện môi:\\n' +
      '  W = 1/2.Q.U = 1/2.C.U² = 1/2.Q² / C.',
    workedExample: {
      problem:
        'Một tụ điện có điện dung C = 10 μF được tích điện dưới hiệu điện thế U = 12 V. ' +
        'Tính điện tích Q mà tụ điện tích được và năng lượng điện trường W của tụ điện.',
      steps: [
        'Đổi điện dung sang đơn vị chuẩn F: C = 10 μF = 10 * 10⁻⁶ F = 10⁻⁵ F.',
        'Tính điện tích Q tích được: Q = C * U = 10⁻⁵ * 12 = 1,2 * 10⁻⁴ C.',
        'Tính năng lượng điện trường W của tụ: W = 1/2.C.U² = 0,5 * 10⁻⁵ * 12² = 0,5 * 10⁻⁵ * 144 = 7,2 * 10⁻⁴ J.',
      ],
      answer: 'Q = 1,2 * 10⁻⁴ C; W = 7,2 * 10⁻⁴ J.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức liên hệ giữa điện tích Q, điện dung C và hiệu điện thế U của một tụ điện.',
        choices: [
          { id: 'cap_1', label: 'Q = C * U' },
          { id: 'cap_2', label: 'Q = C / U' },
          { id: 'cap_3', label: 'C = Q * U' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cap_1'],
        },
        explain:
          'Điện tích tích được tỉ lệ thuận với hiệu điện thế qua hệ số tỉ lệ điện dung C: Q = CU.',
      },
      {
        prompt:
          'Một tụ điện có điện dung C = 2 * 10⁻⁶ F (2 μF) được nối vào nguồn điện có hiệu điện thế U = 50 V. Tính năng lượng điện trường tích luỹ trong tụ điện.',
        answer: {
          kind: 'numeric',
          value: 0.0025,
          unit: 'J',
        },
        explain: 'W = 1/2.C.U² = 0,5 * (2 * 10⁻⁶) * 50² = 10⁻⁶ * 2500 = 0,0025 J.',
      },
    ],
    srsCards: [
      {
        hoi: 'Cấu tạo cơ bản của tụ điện là gì?',
        dap: 'Gồm hai vật dẫn đặt song song gần nhau và cách điện với nhau bằng một lớp điện môi.',
      },
      {
        hoi: 'Nêu công thức liên hệ giữa năng lượng điện trường W tích tụ với điện tích Q và điện dung C.',
        dap: 'W = 1/2 * Q² / C.',
      },
    ],
    reviewStatus: 'draft',
  },
]
