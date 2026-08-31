// lessons/ly12c3.ts — Vật lí 12, Chương 3: Từ trường (8 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY12_C3_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly12-c3-b12',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 12,
    title: 'Đại cương về từ trường',
    hook:
      'Một cây kim la bàn luôn tự động quay về hướng Bắc, và hai thanh nam châm có thể đẩy hoặc hút nhau từ xa mà không cần tiếp xúc. ' +
      'Lực vô hình nào đã kết nối chúng? Đó chính là từ trường.',
    theory:
      'KHÁI NIỆM TỪ TRƯỜNG:\\n' +
      '— Từ trường: Là một dạng vật chất tồn tại xung quanh nam châm, dòng điện hoặc hạt mang điện chuyển động, biểu hiện bằng việc tác dụng lực từ lên nam châm, dòng điện hoặc hạt mang điện chuyển động khác đặt trong nó.\\n' +
      '— Tương tác từ: Tương tác giữa nam châm với nam châm, giữa nam châm với dòng điện, và giữa hai dòng điện với nhau.\\n\\n' +
      'ĐƯỜNG SỨC TỪ:\\n' +
      '— Đường sức từ: Là những đường vẽ trong không gian có từ trường, sao cho tiếp tuyến tại mỗi điểm trùng với hướng của từ trường tại điểm đó.\\n' +
      '— Các đặc điểm của đường sức từ:\\n' +
      '  1. Qua mỗi điểm trong không gian chỉ vẽ được một đường sức từ duy nhất.\\n' +
      '  2. Các đường sức từ là những đường cong khép kín hoặc vô hạn ở hai đầu.\\n' +
      '  3. Quy ước chiều đường sức từ: Đi ra từ cực Bắc (N) và đi vào cực Nam (S) của nam châm.\\n' +
      '  4. Nơi nào từ trường mạnh thì đường sức từ vẽ dày, nơi nào từ trường yếu thì đường sức từ vẽ thưa.\\n\\n' +
      'TỪ PHỔ:\\n' +
      '— Từ phổ: Hình ảnh các đường sức từ được hình thành bởi các mạt sắt rắc trên tấm phẳng đặt trong từ trường. Từ phổ giúp ta hình dung trực quan hình dạng của từ trường.',
    workedExample: {
      problem: 'Trình bày đặc điểm và chiều của đường sức từ bên ngoài một thanh nam châm thẳng.',
      steps: [
        'Nhận xét hình dạng: Các đường sức từ bên ngoài thanh nam châm thẳng là những đường cong khép kín.',
        'Mô tả chiều: Đi ra khỏi cực Bắc (North - N) và đi vào cực Nam (South - S).',
        'Nhận xét độ dày thưa: Đường sức từ dày nhất ở gần hai cực của nam châm (nơi từ trường mạnh nhất) và thưa dần khi ra xa.',
      ],
      answer: 'Là đường cong khép kín đi ra từ cực Bắc (N) và đi vào cực Nam (S) của nam châm.',
    },
    checkQuestions: [
      {
        prompt: 'Từ trường không tồn tại xung quanh đối tượng nào sau đây?',
        choices: [
          { id: 'tt_1', label: 'Một điện tích đứng yên' },
          { id: 'tt_2', label: 'Một dòng điện chạy trong dây dẫn' },
          { id: 'tt_3', label: 'Một thanh nam châm' },
          { id: 'tt_4', label: 'Một hạt electron đang bay' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['tt_1'],
        },
        explain:
          'Từ trường chỉ tồn tại xung quanh nam châm, dòng điện hoặc điện tích chuyển động. Điện tích đứng yên chỉ tạo ra điện trường.',
      },
      {
        prompt: 'Theo quy ước, chiều của đường sức từ bên ngoài thanh nam châm là:',
        choices: [
          { id: 'ch_1', label: 'Ra ở cực Bắc, vào ở cực Nam' },
          { id: 'ch_2', label: 'Ra ở cực Nam, vào ở cực Bắc' },
          { id: 'ch_3', label: 'Đi từ cực âm sang cực dương' },
          { id: 'ch_4', label: 'Đi từ trung tâm ra hai cực' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ch_1'],
        },
        explain:
          'Quy ước chiều đường sức từ của nam châm là đi ra từ cực Bắc (North) và đi vào ở cực Nam (South).',
      },
    ],
    srsCards: [
      {
        hoi: 'Từ trường là gì?',
        dap: 'Là một dạng vật chất tồn tại xung quanh nam châm, dòng điện hoặc hạt mang điện chuyển động, biểu hiện bằng lực từ.',
      },
      {
        hoi: 'Quy ước chiều đường sức từ bên ngoài nam châm?',
        dap: 'Đi ra từ cực Bắc (N) và đi vào cực Nam (S).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b13',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 13,
    title: 'Lực từ. Cảm ứng từ',
    hook:
      'Làm thế nào để tạo ra chuyển động quay của động cơ điện trong quạt hay máy bơm? ' +
      'Tất cả hoạt động dựa trên lực từ tác dụng lên dây dẫn có dòng điện chạy qua đặt trong từ trường.',
    theory:
      'LỰC TỪ TÁC DỤNG LÊN ĐOẠN DÂY DẪN THẲNG MANG DÒNG ĐIỆN:\\n' +
      'Một đoạn dây dẫn thẳng có chiều dài L, mang dòng điện I, đặt trong từ trường đều có cảm ứng từ B, chịu tác dụng của lực từ F:\\n' +
      '— Độ lớn (Công thức Ampere):\\n' +
      '  F = B * I * L * sin(theta)\\n' +
      'Trong đó theta là góc hợp bởi chiều dòng điện (hướng của dây) và chiều cảm ứng từ B.\\n' +
      '— Chiều: Xác định theo Quy tắc bàn tay trái:\\n' +
      '  + Đặt bàn tay trái sao cho các đường sức từ đâm vào lòng bàn tay.\\n' +
      '  + Chiều từ cổ tay đến ngón tay giữa trùng với chiều dòng điện.\\n' +
      '  + Ngón tay cái choãi ra 90 độ chỉ chiều của lực từ F.\\n\\n' +
      'CẢM ỨNG TỪ:\\n' +
      '— Cảm ứng từ (B): Đại lượng vectơ đặc trưng cho từ trường về phương diện tác dụng lực. Vectơ cảm ứng từ B có:\\n' +
      '  + Phương: Trùng với phương của nam châm thử cân bằng tại điểm đó.\\n' +
      '  + Chiều: Từ cực Nam sang cực Bắc của nam châm thử.\\n' +
      '— Đơn vị: Tesla (T).',
    workedExample: {
      problem:
        'Một đoạn dây dẫn thẳng dài 0.5 m mang dòng điện 2 A đặt vuông góc với một từ trường đều có cảm ứng từ B = 0.4 T. ' +
        'Tính độ lớn của lực từ tác dụng lên đoạn dây.',
      steps: [
        'Xác định các thông số: L = 0.5 m, I = 2 A, B = 0.4 T.',
        'Xác định góc theta: Vì đặt vuông góc nên theta = 90 độ, sin(theta) = 1.',
        'Áp dụng công thức F = B * I * L * sin(theta).',
        'Tính toán: F = 0.4 * 2 * 0.5 * 1 = 0.4 N.',
      ],
      answer: 'F = 0.4 N.',
    },
    checkQuestions: [
      {
        prompt: 'Đơn vị đo cảm ứng từ B trong hệ SI là:',
        choices: [
          { id: 'b_1', label: 'Tesla (T)' },
          { id: 'b_2', label: 'Weber (Wb)' },
          { id: 'b_3', label: 'Henry (H)' },
          { id: 'b_4', label: 'Ampere (A)' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['b_1'],
        },
        explain:
          'Đơn vị đo cảm ứng từ B là Tesla (T). Weber (Wb) là đơn vị từ thông, Henry (H) là độ tự cảm.',
      },
      {
        prompt:
          'Một đoạn dây dẫn thẳng dài 0.2 m mang dòng điện 5 A đặt song song với các đường sức từ của một từ trường đều có B = 0.5 T. ' +
          'Tính độ lớn lực từ (theo đơn vị N) tác dụng lên đoạn dây dẫn.',
        answer: {
          kind: 'numeric',
          value: 0,
          unit: 'N',
        },
        explain:
          'Khi dây dẫn đặt song song với đường sức từ, góc theta = 0 hoặc 180 độ. Khi đó sin(theta) = 0 => F = B * I * L * sin(theta) = 0 N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết công thức tính độ lớn lực từ tác dụng lên đoạn dây dẫn thẳng?',
        dap: 'F = B * I * L * sin(theta).',
      },
      {
        hoi: 'Độ lớn lực từ bằng 0 khi góc theta giữa dòng điện và B bằng bao nhiêu?',
        dap: 'Bằng 0 độ hoặc 180 độ (dây dẫn đặt song song đường sức từ).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b14',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 14,
    title: 'Từ trường của dòng điện chạy trong các dây dẫn có hình dạng đặc biệt',
    hook:
      'Mỗi hình dạng dây dẫn khác nhau khi mang dòng điện sẽ tạo ra các đường sức từ có hình dạng và độ lớn khác nhau. ' +
      'Nắm vững các công thức này là nền tảng thiết kế các nam châm điện dùng trong công nghiệp.',
    theory:
      'TỪ TRƯỜNG CỦA DÒNG ĐIỆN TRONG DÂY DẪN THẲNG DÀI VÔ HẠN:\\n' +
      '— Các đường sức từ là những đường tròn đồng tâm nằm trong mặt phẳng vuông góc với dây dẫn, tâm nằm trên dây dẫn.\\n' +
      '— Chiều đường sức từ xác định bằng Quy tắc nắm tay phải.\\n' +
      '— Độ lớn cảm ứng từ tại điểm cách dây dẫn khoảng cách r:\\n' +
      '  B = 2 * 10⁻⁷ * I / r\\n\\n' +
      'TỪ TRƯỜNG CỦA DÒNG ĐIỆN TRONG DÂY DẪN UỐN THÀNH VÒNG TRÒN:\\n' +
      '— Độ lớn cảm ứng từ tại tâm của vòng tròn bán kính R gồm N vòng dây quấn sát:\\n' +
      '  B = 2pi * 10⁻⁷ * N * I / R\\n\\n' +
      'TỪ TRƯỜNG CỦA DÒNG ĐIỆN TRONG ỐNG DÂY HÌNH TRỤ (SOLENOID):\\n' +
      '— Từ trường bên trong lòng ống dây là từ trường đều, các đường sức từ thẳng song song đều nhau.\\n' +
      '— Độ lớn cảm ứng từ bên trong lòng ống dây dài L có N vòng dây:\\n' +
      '  B = 4pi * 10⁻⁷ * (N / L) * I = 4pi * 10⁻⁷ * n * I\\n' +
      'Trong đó n = N/L là mật độ vòng dây.',
    workedExample: {
      problem:
        'Một dòng điện có cường độ 5 A chạy qua dây dẫn thẳng dài đặt trong không khí. ' +
        'Tính độ lớn cảm ứng từ tại một điểm cách dây dẫn 10 cm (0.1 m).',
      steps: [
        'Xác định thông số: I = 5 A, r = 10 cm = 0.1 m.',
        'Áp dụng công thức cảm ứng từ của dây dẫn thẳng dài: B = 2 * 10^-7 * I / r.',
        'Thay số: B = 2 * 10^-7 * 5 / 0.1.',
        'Tính toán: B = 10^-5 T.',
      ],
      answer: 'B = 10^-5 T.',
    },
    checkQuestions: [
      {
        prompt:
          'Để tính độ lớn cảm ứng từ tại một điểm cách dây dẫn thẳng dài mang dòng điện I một khoảng r, ta dùng công thức nào?',
        choices: [
          { id: 'f_1', label: 'B = 2.10^-7 * I / r' },
          { id: 'f_2', label: 'B = 2pi.10^-7 * I / r' },
          { id: 'f_3', label: 'B = 4pi.10^-7 * I / r' },
          { id: 'f_4', label: 'B = 2.10^-7 * I * r' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['f_1'],
        },
        explain: 'Công thức cảm ứng từ của dây dẫn thẳng dài là B = 2*10^-7 * I / r.',
      },
      {
        prompt:
          'Một ống dây hình trụ dài 0.5 m có 500 vòng dây. Khi có dòng điện cường độ 2 A chạy qua ống dây, ' +
          'độ lớn cảm ứng từ bên trong lòng ống dây xấp xỉ bằng bao nhiêu (lấy pi = 3.14)?',
        choices: [
          { id: 'o_1', label: '2.51e-3 T' },
          { id: 'o_2', label: '1.26e-3 T' },
          { id: 'o_3', label: '5.02e-3 T' },
          { id: 'o_4', label: '2.51e-4 T' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['o_1'],
        },
        explain:
          'B = 4 * pi * 10^-7 * N * I / L = 4 * 3.14 * 10^-7 * 500 * 2 / 0.5 = 2.512 * 10^-3 T.',
      },
    ],
    srsCards: [
      {
        hoi: 'Công thức tính cảm ứng từ của dòng điện chạy trong dây dẫn thẳng dài?',
        dap: 'B = 2 * 10^-7 * I / r.',
      },
      {
        hoi: 'Công thức tính cảm ứng từ tại tâm vòng tròn dây dẫn?',
        dap: 'B = 2pi * 10^-7 * N * I / R.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b15',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 15,
    title: 'Lực Lorentz',
    hook:
      'Từ trường của Trái Đất đóng vai trò như một lá chắn bảo vệ chúng ta khỏi luồng bức xạ vũ trụ có hại bằng cách ' +
      'bẻ cong đường đi của các hạt mang điện, tạo nên những dải cực quang tuyệt đẹp ở hai đầu cực. Lực bẻ cong đó chính là lực Lorentz.',
    theory:
      'ĐỊNH NGHĨA LỰC LORENTZ:\\n' +
      '— Lực Lorentz: Là lực do từ trường tác dụng lên một hạt mang điện chuyển động.\\n\\n' +
      'ĐẶC ĐIỂM CỦA LỰC LORENTZ:\\n' +
      'Một hạt có điện tích q chuyển động với vận tốc v trong từ trường đều B:\\n' +
      '— Độ lớn: F = |q| * v * B * sin(theta)\\n' +
      'Trong đó theta là góc giữa vectơ vận tốc v và vectơ cảm ứng từ B.\\n' +
      '— Phương: Vuông góc với cả v và B.\\n' +
      '— Chiều: Xác định bằng Quy tắc bàn tay trái:\\n' +
      '  + Đặt bàn tay trái sao cho các đường sức từ đâm vào lòng bàn tay.\\n' +
      '  + Chiều từ cổ tay đến ngón tay giữa trùng với chiều vận tốc v của hạt.\\n' +
      '  + Nếu q > 0: Ngón tay cái choãi ra 90 độ chỉ chiều lực Lorentz.\\n' +
      '  + Nếu q < 0: Lực Lorentz có chiều ngược với chiều chỉ của ngón tay cái.\\n\\n' +
      'CHUYỂN ĐỘNG CỦA HẠT MANG ĐIỆN TRONG TỪ TRƯỜNG ĐỀU:\\n' +
      'Khi hạt bay vuông góc với các đường sức từ (theta = 90 độ):\\n' +
      '— Lực Lorentz đóng vai trò lực hướng tâm làm hạt chuyển động tròn đều.\\n' +
      '— Bán kính quỹ đạo tròn: R = (m * v) / (|q| * B).',
    workedExample: {
      problem:
        'Một hạt electron (q = -1.6e-19 C) bay vuông góc vào một từ trường đều B = 0.5 T với vận tốc v = 2e6 m/s. ' +
        'Tính độ lớn của lực Lorentz tác dụng lên electron.',
      steps: [
        'Xác định thông số: |q| = 1.6 * 10^-19 C, v = 2 * 10^6 m/s, B = 0.5 T.',
        'Xác định góc theta: Vì bay vuông góc nên theta = 90 độ, sin(theta) = 1.',
        'Áp dụng công thức tính độ lớn lực Lorentz: F = |q| * v * B * sin(theta).',
        'Tính toán: F = 1.6 * 10^-19 * 2 * 10^6 * 0.5 * 1 = 1.6 * 10^-13 N.',
      ],
      answer: 'F = 1.6 * 10^-13 N.',
    },
    checkQuestions: [
      {
        prompt: 'Lực Lorentz tác dụng lên hạt mang điện chuyển động trong từ trường có phương:',
        choices: [
          { id: 'pl_1', label: 'Vuông góc với cả vận tốc v và cảm ứng từ B' },
          { id: 'pl_2', label: 'Song song với cảm ứng từ B' },
          { id: 'pl_3', label: 'Trùng với phương của vận tốc v' },
          { id: 'pl_4', label: 'Nằm trong mặt phẳng chứa vận tốc v và cảm ứng từ B' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['pl_1'],
        },
        explain:
          'Phương của lực Lorentz luôn vuông góc với cả vectơ vận tốc v và vectơ cảm ứng từ B.',
      },
      {
        prompt:
          'Một proton (q = 1.6e-19 C) chuyển động song song với đường sức từ của một từ trường đều B = 0.8 T. ' +
          'Lực Lorentz tác dụng lên proton có độ lớn bằng bao nhiêu?',
        answer: {
          kind: 'numeric',
          value: 0,
          unit: 'N',
        },
        explain:
          'Khi hạt chuyển động song song với đường sức từ, góc theta = 0 hoặc 180 độ, sin(theta) = 0. Do đó, lực Lorentz F = 0 N.',
      },
    ],
    srsCards: [
      {
        hoi: 'Lực Lorentz là gì?',
        dap: 'Là lực do từ trường tác dụng lên một hạt mang điện chuyển động.',
      },
      {
        hoi: 'Công thức tính bán kính quỹ đạo R của hạt mang điện bay vuông góc vào từ trường đều?',
        dap: 'R = m * v / (|q| * B).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b16',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 16,
    title: 'Tự cảm',
    hook:
      'Khi ta đột ngột rút phích cắm điện của một lò sưởi hay bóng đèn công suất lớn, ta thường thấy một tia lửa điện nhỏ phát ra. ' +
      'Hiện tượng này do chính cuộn dây trong mạch sinh ra nhằm chống lại sự giảm nhanh của dòng điện. Đó là hiện tượng tự cảm.',
    theory:
      'TỪ THÔNG RIÊNG CỦA MỘT MẠCH KÍN:\\n' +
      '— Khi có dòng điện cường độ i chạy qua mạch kín, nó tạo từ thông riêng:\\n' +
      '  Phi = L * i\\n' +
      'Trong đó L là độ tự cảm (hệ số tự cảm) của mạch. Đơn vị là Henry (H).\\n\\n' +
      'HIỆN TƯỢNG TỰ CẢM:\\n' +
      '— Hiện tượng tự cảm: Là hiện tượng cảm ứng điện từ xảy ra trong một mạch kín do chính sự biến đổi của cường độ dòng điện trong mạch đó gây ra.\\n\\n' +
      'SUẤT ĐIỆN ĐỘNG TỰ CẢM:\\n' +
      '— Khi dòng điện trong mạch biến thiên, xuất hiện suất điện động tự cảm:\\n' +
      '  etc = -L * (di / dt)\\n' +
      '— Độ lớn của suất điện động tự cảm tỉ lệ thuận với tốc độ biến thiên cường độ dòng điện trong mạch.',
    workedExample: {
      problem:
        'Một ống dây có độ tự cảm L = 0.2 H. Trong khoảng thời gian 0.1 s, cường độ dòng điện trong ống dây giảm đều từ 2 A xuống 0 A. ' +
        'Tính độ lớn suất điện động tự cảm xuất hiện trong ống dây.',
      steps: [
        'Xác định các thông số: L = 0.2 H, dt = 0.1 s, di = i2 - i1 = 0 - 2 = -2 A.',
        'Áp dụng công thức độ lớn suất điện động tự cảm: |etc| = L * |di / dt|.',
        'Thay số: |etc| = 0.2 * |-2| / 0.1.',
        'Tính toán: |etc| = 4 V.',
      ],
      answer: 'etc_magnitude = 4 V.',
    },
    checkQuestions: [
      {
        prompt: 'Đơn vị đo độ tự cảm L trong hệ SI là:',
        choices: [
          { id: 'l_1', label: 'Henry (H)' },
          { id: 'l_2', label: 'Weber (Wb)' },
          { id: 'l_3', label: 'Tesla (T)' },
          { id: 'l_4', label: 'Farad (F)' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['l_1'],
        },
        explain: 'Đơn vị đo hệ số tự cảm (độ tự cảm) L là Henry (H).',
      },
      {
        prompt:
          'Một ống dây có độ tự cảm 0.5 H. Nếu tốc độ biến thiên của cường độ dòng điện trong ống dây là 10 A/s, ' +
          'thì độ lớn suất điện động tự cảm xuất hiện trong ống dây là bao nhiêu Volt?',
        answer: {
          kind: 'numeric',
          value: 5,
          unit: 'V',
        },
        explain: '|etc| = L * |di/dt| = 0.5 * 10 = 5 V.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hiện tượng tự cảm là gì?',
        dap: 'Là hiện tượng cảm ứng điện từ xảy ra do chính sự biến đổi cường độ dòng điện trong mạch.',
      },
      {
        hoi: 'Suất điện động tự cảm tỉ lệ với đại lượng nào?',
        dap: 'Tốc độ biến thiên cường độ dòng điện trong mạch.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b17',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 17,
    title: 'Máy biến áp. Truyền tải điện năng đi xa',
    hook:
      'Các nhà máy điện thường phát ra điện thế hàng kilôvôn, nhưng để truyền tải điện năng đi xa hàng trăm kilômét, người ta phải nâng điện áp lên hàng trăm kilôvôn, ' +
      'sau đó lại hạ xuống 220 V để đưa vào gia đình sử dụng. Thiết bị thực hiện nhiệm vụ này một cách hiệu quả là máy biến áp.',
    theory:
      'MÁY BIẾN ÁP:\\n' +
      '— Máy biến áp: Là thiết bị có khả năng biến đổi điện áp xoay chiều mà không làm thay đổi tần số.\\n' +
      '— Cấu tạo: Gồm hai cuộn dây sơ cấp (N1 vòng) và thứ cấp (N2 vòng) quấn trên cùng lõi sắt non pha silic.\\n' +
      '— Công thức máy biến áp lí tưởng: U2 / U1 = I1 / I2 = N2 / N1.\\n' +
      '— Phân loại: N2 > N1: Máy tăng áp; N2 < N1: Máy hạ áp.\\n\\n' +
      'TRUYỀN TẢI ĐIỆN NĂNG ĐI XA:\\n' +
      '— Hao phí điện năng do toả nhiệt trên đường dây: Php = r * I² = r * P² / (U² * cos²(phi)).\\n' +
      '— Để giảm hao phí Php, giải pháp hiệu quả nhất là tăng điện áp truyền tải U trước khi đưa lên dây dẫn. Tăng U lên k lần thì hao phí Php giảm đi k² lần.',
    workedExample: {
      problem:
        'Một máy biến áp lí tưởng có số vòng dây cuộn sơ cấp là 1000 vòng, cuộn thứ cấp có 200 vòng. ' +
        'Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều U1 = 220 V. Tính điện áp hiệu dụng ở hai đầu cuộn thứ cấp để hở.',
      steps: [
        'Xác định thông số: N1 = 1000 vòng, N2 = 200 vòng, U1 = 220 V.',
        'Áp dụng công thức máy biến áp lý tưởng: U2 / U1 = N2 / N1 => U2 = U1 * (N2 / N1).',
        'Thay số: U2 = 220 * (200 / 1000) = 44 V.',
        'Kết luận: Điện áp hiệu dụng ở cuộn thứ cấp để hở là 44 V.',
      ],
      answer: 'U2 = 44 V.',
    },
    checkQuestions: [
      {
        prompt:
          'Đối với một máy biến áp lí tưởng, nếu số vòng dây cuộn thứ cấp lớn hơn cuộn sơ cấp (N2 > N1) thì nó có tác dụng:',
        choices: [
          { id: 'ap_1', label: 'Tăng điện áp, giảm cường độ dòng điện' },
          { id: 'ap_2', label: 'Giảm điện áp, tăng cường độ dòng điện' },
          { id: 'ap_3', label: 'Tăng điện áp, tăng tần số dòng điện' },
          { id: 'ap_4', label: 'Giảm điện áp, giảm tần số dòng điện' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ap_1'],
        },
        explain:
          'Khi N2 > N1 thì U2 > U1 và I2 < I1, máy biến áp đóng vai trò là máy tăng áp (tăng điện áp và giảm cường độ dòng điện).',
      },
      {
        prompt:
          'Khi truyền tải một công suất điện xoay chiều P đi xa, nếu tăng điện áp ở hai đầu đường dây truyền tải lên 10 lần ' +
          'thì công suất hao phí do toả nhiệt trên đường dây sẽ thay đổi như thế nào?',
        choices: [
          { id: 'hp_1', label: 'Giảm đi 100 lần' },
          { id: 'hp_2', label: 'Tăng lên 100 lần' },
          { id: 'hp_3', label: 'Giảm đi 10 lần' },
          { id: 'hp_4', label: 'Tăng lên 10 lần' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['hp_1'],
        },
        explain:
          'Hao phí tỉ lệ nghịch với bình phương điện áp U. Khi U tăng 10 lần thì hao phí giảm 10^2 = 100 lần.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hệ thức liên hệ giữa điện áp hiệu dụng U và số vòng dây N ở hai cuộn dây máy biến áp?',
        dap: 'U2 / U1 = N2 / N1.',
      },
      {
        hoi: 'Hao phí truyền tải điện năng giảm đi bao nhiêu lần khi tăng điện áp lên 5 lần?',
        dap: 'Giảm đi 25 lần.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b18',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 18,
    title: 'Ứng dụng của từ trường',
    hook:
      'Làm thế nào một đoàn tàu cao tốc Maglev nặng hàng chục tấn có thể "lơ lửng" trên không trung và lao đi với vận tốc 600 km/h? ' +
      'Làm sao máy chụp MRI có thể nhìn thấy chi tiết tế bào não mà không cần phẫu thuật? Tất cả là nhờ các ứng dụng kỳ diệu của từ trường.',
    theory:
      'NAM CHÂM ĐIỆN CÔNG NGHIỆP:\\n' +
      '— Cấu tạo gồm cuộn dây điện quấn quanh lõi sắt non. Lõi sắt non làm tăng từ trường lên nhiều lần và mất hết từ tính khi ngắt điện.\\n' +
      '— Ứng dụng: Cần cẩu điện hút kim loại vụn.\\n\\n' +
      'ĐỘNG CƠ ĐIỆN VÀ LOA ĐIỆN:\\n' +
      '— Động cơ điện: Biến đổi điện năng thành cơ năng dựa trên lực từ tác dụng lên cuộn dây mang điện đặt trong từ trường làm rotor quay.\\n' +
      '— Loa điện: Dòng điện xoay chiều âm tần chạy vào cuộn dây đặt trong từ trường biến thiên làm rung màng loa tạo sóng âm.\\n\\n' +
      'TÀU ĐỆM TỪ (MAGLEV):\\n' +
      '— Sử dụng lực đẩy và lực hút từ trường của nam châm siêu dẫn cực mạnh để nâng tàu lơ lửng trên đường ray (triệt tiêu ma sát) và đẩy tàu tiến lên.\\n\\n' +
      'CHỤP CỘNG HƯỞNG TỪ (MRI):\\n' +
      '— Sử dụng từ trường mạnh của nam châm siêu dẫn và sóng vô tuyến để định hướng lại mômen từ nguyên tử hydro trong cơ thể tạo ảnh sắc nét.',
    workedExample: {
      problem: 'Nêu nguyên lí hoạt động cơ bản của loa điện dùng trong các thiết bị âm thanh.',
      steps: [
        'Dòng điện xoay chiều mang tín hiệu âm tần chạy qua một cuộn dây nhỏ.',
        'Cuộn dây này được đặt trong từ trường của một nam châm vĩnh cửu mạnh.',
        'Dưới tác dụng của lực từ biến thiên tuần hoàn, cuộn dây dao động dọc và kéo màng loa dao động theo.',
        'Màng loa dao động nén và giãn không khí xung quanh, tạo ra sóng âm truyền đi.',
      ],
      answer:
        'Biến dao động điện thành dao động cơ của màng loa nhờ lực từ tác dụng lên cuộn dây mang điện đặt trong từ trường.',
    },
    checkQuestions: [
      {
        prompt:
          'Thiết bị y học nào sau đây ứng dụng từ trường mạnh của nam châm siêu dẫn để ghi hình cơ thể người?',
        choices: [
          { id: 'm_1', label: 'Máy chụp cộng hưởng từ (MRI)' },
          { id: 'm_2', label: 'Máy chụp cắt lớp vi tính (CT)' },
          { id: 'm_3', label: 'Máy chụp X-quang' },
          { id: 'm_4', label: 'Máy siêu âm' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['m_1'],
        },
        explain:
          'Máy chụp cộng hưởng từ (MRI - Magnetic Resonance Imaging) sử dụng từ trường mạnh và sóng vô tuyến để tái tạo cấu trúc cơ thể.',
      },
      {
        prompt:
          'Lõi của nam châm điện thường được làm bằng vật liệu gì để dễ từ hoá và dễ mất từ tính khi ngắt dòng điện?',
        choices: [
          { id: 'v_1', label: 'Sắt non' },
          { id: 'v_2', label: 'Thép cacbon cao' },
          { id: 'v_3', label: 'Đồng thau' },
          { id: 'v_4', label: 'Thạch anh' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['v_1'],
        },
        explain:
          'Sắt non (soft iron) có độ thẩm từ cao, dễ bị nhiễm từ mạnh nhưng cũng nhanh chóng mất từ tính khi ngắt dòng điện.',
      },
    ],
    srsCards: [
      {
        hoi: 'MRI viết tắt của phương pháp chẩn đoán hình ảnh nào?',
        dap: 'Chụp cộng hưởng từ (Magnetic Resonance Imaging).',
      },
      {
        hoi: 'Tại sao lõi nam châm điện làm bằng sắt non thay vì thép?',
        dap: 'Vì sắt non mất từ tính rất nhanh khi ngắt dòng điện, giúp điều khiển nam châm dễ dàng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly12-c3-b19',
    grade: '12',
    chapterNumber: 3,
    chapterTitle: 'Từ trường',
    lessonNumber: 19,
    title: 'Bài tập về từ trường',
    hook: 'Tổng hợp và giải quyết các bài tập nâng cao về từ trường giúp hệ thống lại toàn bộ kiến thức về lực từ, lực Lorentz, tự cảm và máy biến áp.',
    theory:
      'HỆ THỐNG CÔNG THỨC TRỌNG TÂM:\\n' +
      '1. Lực từ: F = B * I * L * sin(theta)\\n' +
      '2. Lực Lorentz: F = |q| * v * B * sin(theta)\\n' +
      '3. Suất điện động tự cảm: etc = -L * (di / dt)\\n' +
      '4. Máy biến áp lý tưởng: U2 / U1 = N2 / N1',
    workedExample: {
      problem:
        'Một dây dẫn thẳng mang dòng điện cường độ 3 A được đặt trong từ trường đều có B = 0.5 T. ' +
        'Chiều dài của dây dẫn là 0.4 m. Góc hợp bởi dây dẫn và đường sức từ là 30 độ. Tính độ lớn lực từ tác dụng lên dây.',
      steps: [
        'Xác định thông số: I = 3 A, B = 0.5 T, L = 0.4 m, theta = 30 độ.',
        'Tính giá trị sin: sin(30) = 0.5.',
        'Áp dụng công thức lực từ: F = B * I * L * sin(theta).',
        'Thay số và tính: F = 0.5 * 3 * 0.4 * 0.5 = 0.3 N.',
      ],
      answer: 'F = 0.3 N.',
    },
    checkQuestions: [
      {
        prompt:
          'Một ống dây có độ tự cảm 0.1 H. Cường độ dòng điện biến thiên đều với tốc độ 20 A/s. ' +
          'Độ lớn suất điện động tự cảm xuất hiện trong ống dây là bao nhiêu Volt?',
        answer: {
          kind: 'numeric',
          value: 2,
          unit: 'V',
        },
        explain: 'etc = L * |di/dt| = 0.1 * 20 = 2 V.',
      },
      {
        prompt:
          'Một máy biến áp lí tưởng có số vòng dây cuộn sơ cấp là 2200 vòng và cuộn thứ cấp là 110 vòng. ' +
          'Nếu đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều hiệu dụng 220 V thì điện áp hiệu dụng ở hai đầu cuộn thứ cấp để hở là bao nhiêu Volt?',
        answer: {
          kind: 'numeric',
          value: 11,
          unit: 'V',
        },
        explain: 'U2 = U1 * (N2 / N1) = 220 * (110 / 2200) = 11 V.',
      },
    ],
    srsCards: [
      {
        hoi: 'Lực Lorentz tác dụng lên điện tích chuyển động đạt cực đại khi nào?',
        dap: 'Khi điện tích bay vuông góc với đường sức từ (theta = 90 độ).',
      },
      {
        hoi: 'Suất điện động tự cảm xuất hiện khi nào?',
        dap: 'Khi có sự biến thiên của cường độ dòng điện trong chính mạch đó.',
      },
    ],
    reviewStatus: 'draft',
  },
]
