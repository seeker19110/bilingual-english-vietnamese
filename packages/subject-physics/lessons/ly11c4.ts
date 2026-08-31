// lessons/ly11c4.ts — Vật lí 11, Chương 4: Dòng điện. Mạch điện (5 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY11_C4_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly11-c4-b22',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Dòng điện. Mạch điện',
    lessonNumber: 22,
    title: 'Cường độ dòng điện',
    hook:
      'Tại sao bóng đèn lại lập tức sáng lên ngay khi ta bật công tắc? ' +
      'Đó là nhờ dòng chảy của hàng tỷ tỷ electron tự do di chuyển có hướng dọc theo dây đồng. ' +
      'Tốc độ của dòng chảy này chính là Cường độ dòng điện.',
    theory:
      'DÒNG ĐIỆN VÀ ĐIỀU KIỆN CÓ DÒNG ĐIỆN:\\n' +
      '— Dòng điện là dòng dịch chuyển có hướng của các hạt mang điện tích.\\n' +
      '— Điều kiện để có dòng điện: Phải có các hạt mang điện tự do và phải có một điện trường duy trì bên trong vật dẫn (do nguồn điện cung cấp).\\n' +
      '— Chiều dòng điện: Được quy ước là chiều dịch chuyển có hướng của các điện tích dương (ngược chiều dịch chuyển của các electron tự do trong kim loại).\\n\\n' +
      'CƯỜNG ĐỘ DÒNG ĐIỆN (CURRENT INTENSITY):\\n' +
      '— Cường độ dòng điện (I) là đại lượng đặc trưng cho tác dụng mạnh hay yếu của dòng điện. Đo bằng lượng điện tích dịch chuyển qua tiết diện thẳng của vật dẫn trong một đơn vị thời gian.\\n' +
      '— Công thức cho dòng điện không đổi: I = q / t  ⇒  q = I * t.\\n' +
      '  — I: Cường độ dòng điện. Đơn vị trong hệ SI: Ampere (A).\\n' +
      '  — q: Điện tích chuyển qua tiết diện (C).\\n' +
      '  — t: Thời gian dòng điện chạy qua (s).\\n\\n' +
      'MÔ HÌNH DÒNG ĐIỆN TRONG KIM LOẠI (DRIFT VELOCITY):\\n' +
      '— I = n * S * v * e.\\n' +
      '  — n: Mật độ electron tự do trong kim loại.\\n' +
      '  — S: Diện tích tiết diện thẳng của dây dẫn.\\n' +
      '  — v: Tốc độ trôi (tốc độ chuyển động có hướng của electron dưới tác dụng của điện trường).\\n' +
      '  — e: Độ lớn điện tích của electron (e ≈ 1,6 * 10⁻¹⁹ C).',
    workedExample: {
      problem:
        'Một dây điện dẫn điện dòng điện không đổi. Trong thời gian t = 3 s, có một lượng điện tích q = 1,5 C ' +
        'dịch chuyển qua tiết diện thẳng của dây dẫn. Tính cường độ dòng điện chạy qua dây này.',
      steps: [
        'Xác định các thông số: điện tích q = 1,5 C, thời gian t = 3 s.',
        'Áp dụng công thức cường độ dòng điện không đổi: I = q / t.',
        'Thay số: I = 1,5 / 3 = 0,5 A.',
        'Kết luận: Cường độ dòng điện là 0,5 A (500 mA).',
      ],
      answer: 'I = 0,5 A.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức định nghĩa cường độ dòng điện không đổi I theo điện tích q và thời gian t.',
        choices: [
          { id: 'cur_1', label: 'I = q / t' },
          { id: 'cur_2', label: 'I = q * t' },
          { id: 'cur_3', label: 'q = I / t' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cur_1'],
        },
        explain:
          'Cường độ dòng điện bằng lượng điện tích di chuyển qua tiết diện chia cho thời gian di chuyển: I = q/t.',
      },
      {
        prompt:
          'Một dòng điện không đổi có cường độ I = 0,2 A chạy qua một dây dẫn. Tính lượng điện tích dịch chuyển qua tiết diện dây dẫn trong thời gian 10 s.',
        answer: {
          kind: 'numeric',
          value: 2,
          unit: 'C',
        },
        explain: 'q = I * t = 0,2 * 10 = 2 C.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo cường độ dòng điện trong hệ SI là gì?',
        dap: 'Ampere (A).',
      },
      {
        hoi: 'Chiều dòng điện được quy ước là chiều chuyển động của điện tích nào?',
        dap: 'Là chiều dịch chuyển có hướng của các điện tích dương.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c4-b23',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Dòng điện. Mạch điện',
    lessonNumber: 23,
    title: 'Điện trở. Định luật Ohm',
    hook:
      'Đẩy nước qua một đường ống rộng thì rất dễ dàng, nhưng đẩy nước qua một đường ống hẹp nhét đầy cát thì cực kì khó khăn. ' +
      'Dây dẫn điện cũng cản trở dòng electron tương tự như vậy. Đại lượng này là Điện trở.',
    theory:
      'ĐIỆN TRỞ CỦA VẬT DẪN (RESISTANCE):\\n' +
      '— Điện trở R đặc trưng cho mức độ cản trở dòng điện của vật dẫn. Đơn vị: Ohm (Ω).\\n\\n' +
      'ĐÌNH LUẬT OHM CHO ĐOẠN MẠCH CHỈ CÓ ĐIỆN TRỞ R:\\n' +
      '— Phát biểu: Cường độ dòng điện chạy qua một vật dẫn tỉ lệ thuận với hiệu điện thế giữa hai đầu vật dẫn và tỉ lệ nghịch với điện trở của nó.\\n' +
      '— Công thức: I = U / R  ⇒  R = U / I.\\n\\n' +
      'ĐIỆN TRỞ CỦA DÂY DẪN KIM LOẠI ĐỒNG TÍNH:\\n' +
      '— R = ρ * L / S.\\n' +
      '  — ρ: Điện trở suất của vật liệu dây dẫn (đơn vị: Ω.m). Điện trở suất phụ thuộc vào bản chất vật liệu và nhiệt độ (nhiệt độ tăng, ρ tăng).\\n' +
      '  — L: Chiều dài dây dẫn (m).\\n' +
      '  — S: Diện tích tiết diện ngang của dây dẫn (m²).',
    workedExample: {
      problem:
        'Một dây dẫn bằng đồng có chiều dài L = 10 m, diện tích tiết diện S = 0,1 mm² = 10⁻⁷ m². ' +
        'Biết điện trở suất của đồng là ρ = 1,6 * 10⁻⁸ Ω.m. Tính điện trở R của dây đồng này.',
      steps: [
        'Xác định các thông số ở đơn vị SI: L = 10 m, S = 10⁻⁷ m², ρ = 1,6 * 10⁻⁸ Ω.m.',
        'Áp dụng công thức tính điện trở dây dẫn: R = ρ * L / S.',
        'Thay số: R = 1,6 * 10⁻⁸ * 10 / 10⁻⁷.',
        'Tính toán: R = 1,6 * 10⁻⁷ / 10⁻⁷ = 1,6 Ω.',
      ],
      answer: 'R = 1,6 Ω.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính cường độ dòng điện I chạy qua một điện trở R dưới hiệu điện thế U theo Định luật Ohm.',
        choices: [
          { id: 'ohm_1', label: 'I = U / R' },
          { id: 'ohm_2', label: 'I = U * R' },
          { id: 'ohm_3', label: 'R = I / U' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ohm_1'],
        },
        explain:
          'Cường độ dòng điện tỉ lệ thuận hiệu điện thế và tỉ lệ nghịch điện trở đoạn mạch: I = U/R.',
      },
      {
        prompt:
          'Đặt một hiệu điện thế U = 5 V vào hai đầu một điện trở R = 10 Ω. Hãy tính cường độ dòng điện chạy qua điện trở đó.',
        answer: {
          kind: 'numeric',
          value: 0.5,
          unit: 'A',
        },
        explain: 'I = U / R = 5 / 10 = 0,5 A.',
      },
    ],
    srsCards: [
      {
        hoi: 'Điện trở suất ρ của vật liệu thay đổi như thế nào khi nhiệt độ của vật dẫn kim loại tăng lên?',
        dap: 'Điện trở suất ρ của kim loại tăng lên khi nhiệt độ tăng.',
      },
      {
        hoi: 'Nêu công thức tính điện trở R của một sợi dây dẫn đồng tính dài L, tiết diện S và điện trở suất ρ.',
        dap: 'R = ρ * L / S.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c4-b24',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Dòng điện. Mạch điện',
    lessonNumber: 24,
    title: 'Nguồn điện',
    hook:
      'Để nước chảy tuần hoàn trong máng trượt nước, ta cần một máy bơm nước đẩy nước lên cao. ' +
      'Để dòng điện chạy tuần hoàn trong mạch, ta cũng cần một "máy bơm điện" để đẩy điện tích. Đó là Nguồn điện.',
    theory:
      'BẢN CHẤT CỦA NGUỒN ĐIỆN VÀ LỰC LẠ:\\n' +
      '— Nguồn điện duy trì hiệu điện thế giữa hai cực của nó. Bên trong nguồn điện, các hạt mang điện chuyển động ngược chiều lực điện trường ' +
      'nhờ lực phi tĩnh điện gọi là lực lạ (lực hóa học trong pin, lực từ trong máy phát điện).\\n\\n' +
      'SUẤT ĐIỆN ĐỘNG CỦA NGUỒN ĐIỆN (ELECTROMOTIVE FORCE - EMF):\\n' +
      '— Suất điện động (ξ) đặc trưng cho khả năng thực hiện công của nguồn điện (thực chất là của lực lạ) dịch chuyển điện tích dương từ cực âm sang cực dương bên trong nguồn.\\n' +
      '— Công thức: ξ = A_lạ / q. Đơn vị: Volt (V).\\n' +
      '— Điện trở trong (r): Nguồn điện được cấu tạo từ vật dẫn điện nên bản thân nó cũng có một điện trở cản trở dòng điện gọi là điện trở trong r.\\n\\n' +
      'ĐỊNH LUẬT OHM CHO TOÀN MẠCH (CLOSED CIRCUIT):\\n' +
      '— Cường độ dòng điện chạy trong mạch điện kín tỉ lệ thuận với suất điện động của nguồn điện và tỉ lệ nghịch với điện trở toàn phần của mạch.\\n' +
      '— Công thức: I = ξ / (R_ngoài + r)  ⇒  ξ = I * (R_ngoài + r) = U_ngoài + I * r.\\n' +
      '  — R_ngoài: Tổng điện trở của các thiết bị tiêu thụ điện ngoài nguồn.\\n' +
      '  — U_ngoài = I * R_ngoài: Hiệu điện thế mạch ngoài (độ sụt thế mạch ngoài).',
    workedExample: {
      problem:
        'Một nguồn điện có suất điện động ξ = 6 V, điện trở trong r = 1 Ω được mắc vào một bóng điện có điện trở R_ngoài = 5 Ω ' +
        'để tạo thành mạch kín. Tính cường độ dòng điện I chạy trong mạch và hiệu điện thế mạch ngoài U.',
      steps: [
        'Xác định các thông số: ξ = 6 V, r = 1 Ω, R_ngoài = 5 Ω.',
        'Áp dụng định luật Ohm cho toàn mạch: I = ξ / (R_ngoài + r).',
        'Thay số tính I: I = 6 / (5 + 1) = 6 / 6 = 1 A.',
        'Tính hiệu điện thế mạch ngoài: U = I * R_ngoài = 1 * 5 = 5 V.',
      ],
      answer: 'I = 1 A; U = 5 V.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức định luật Ohm cho toàn mạch kín gồm nguồn có suất điện động E, điện trở trong r và mạch ngoài có điện trở R.',
        choices: [
          { id: 'wh_1', label: 'I = E / (R + r)' },
          { id: 'wh_2', label: 'I = E / R + r' },
          { id: 'wh_3', label: 'I = (R + r) / E' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['wh_1'],
        },
        explain:
          'Cường độ dòng điện trong toàn mạch kín bằng suất điện động chia cho tổng điện trở mạch ngoài và điện trở trong: I = E/(R+r).',
      },
      {
        prompt:
          'Một nguồn điện có suất điện động E = 12 V, điện trở trong r = 2 Ω được mắc vào một điện trở ngoài R = 10 Ω tạo thành mạch kín. Tính cường độ dòng điện chạy qua mạch.',
        answer: {
          kind: 'numeric',
          value: 1,
          unit: 'A',
        },
        explain: 'I = E / (R + r) = 12 / (10 + 2) = 1 A.',
      },
    ],
    srsCards: [
      {
        hoi: 'Lực lạ bên trong nguồn điện có tác dụng gì?',
        dap: 'Tác dụng thắng lực điện trường để đẩy các hạt mang điện tích di chuyển ngược chiều tự nhiên (dương từ cực âm sang cực dương) nhằm duy trì hiệu điện thế.',
      },
      {
        hoi: 'Độ sụt thế trong nguồn điện được tính bằng công thức nào?',
        dap: 'U_trong = I * r (với I là cường độ dòng điện, r là điện trở trong của nguồn).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c4-b25',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Dòng điện. Mạch điện',
    lessonNumber: 25,
    title: 'Năng lượng và công suất điện',
    hook:
      'Hằng tháng, gia đình chúng ta trả tiền điện dựa trên số "chữ" điện ghi trên công-tơ. ' +
      'Các "chữ" điện này thực chất là gì và chúng ta tính toán điện năng tiêu thụ của các thiết bị như thế nào?',
    theory:
      'CÔNG CỦA DÒNG ĐIỆN VÀ ĐIỆN NĂNG TIÊU THỤ (ELECTRICAL WORK):\\n' +
      '— Khi dòng điện chạy qua một đoạn mạch dưới hiệu điện thế U, lực điện trường sinh công dịch chuyển điện tích q, công này bằng điện năng tiêu thụ của đoạn mạch.\\n' +
      '— Công thức: A = U * q = U * I * t.\\n' +
      '  — A: Điện năng tiêu thụ (J). Đơn vị thực tế: Kilowatt-giờ (kWh). 1 kWh = 3.600.000 J (3,6 MJ).\\n\\n' +
      'CÔNG SUẤT ĐIỆN (ELECTRICAL POWER):\\n' +
      '— Công suất điện tiêu thụ của một đoạn mạch đặc trưng cho tốc độ tiêu thụ điện năng của đoạn mạch đó, đo bằng điện năng tiêu thụ trong một đơn vị thời gian.\\n' +
      '— Công thức: P = A / t = U * I.\\n  — P: Công suất điện. Đơn vị: Watt (W).\\n\\n' +
      'ĐỊNH LUẬT JOULE - LENZ (nhiệt lượng toả ra trên điện trở R):\\n' +
      '— Khi dòng điện chạy qua một đoạn mạch chỉ có điện trở thuần R, toàn bộ điện năng biến đổi thành nhiệt năng toả ra môi trường.\\n' +
      '— Công thức nhiệt lượng: Q = R * I² * t.\\n' +
      '— Công suất toả nhiệt của vật dẫn: P = Q / t = R * I² = U² / R.',
    workedExample: {
      problem:
        'Một chiếc ấm đun nước điện chạy ở hiệu điện thế U = 220 V và cường độ dòng điện chạy qua ấm là I = 5 A. ' +
        'a) Tính công suất tiêu thụ điện P của chiếc ấm.\\n' +
        'b) Tính điện năng tiêu thụ A của ấm khi hoạt động liên tục trong thời gian t = 10 phút.',
      steps: [
        'Tính công suất điện tiêu thụ P: P = U * I = 220 * 5 = 1100 W = 1,1 kW.',
        'Đổi thời gian đun nước sang đơn vị giây: t = 10 phút = 10 * 60 = 600 s.',
        'Tính điện năng tiêu thụ A: A = P * t = 1100 * 600 = 660000 J = 660 kJ.',
        'Kết luận: Công suất tiêu thụ là 1100 W, điện năng đun nước tiêu thụ trong 10 phút là 660 kJ.',
      ],
      answer: 'P = 1100 W; A = 660000 J.',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức tính công suất điện tiêu thụ P của một đoạn mạch có hiệu điện thế U và dòng điện I.',
        choices: [
          { id: 'pw_1', label: 'P = U * I' },
          { id: 'pw_2', label: 'P = U / I' },
          { id: 'pw_3', label: 'P = I / U' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['pw_1'],
        },
        explain:
          'Công suất tiêu thụ bằng tích hiệu điện thế và cường độ dòng điện chạy qua đoạn mạch: P = UI.',
      },
      {
        prompt:
          'Một bóng đèn có điện trở R = 20 Ω chạy dòng điện cường độ I = 2 A. Tính công suất toả nhiệt của bóng đèn này.',
        answer: {
          kind: 'numeric',
          value: 80,
          unit: 'W',
        },
        explain: 'P = R * I² = 20 * 2² = 20 * 4 = 80 W.',
      },
    ],
    srsCards: [
      {
        hoi: 'Một số điện (1 kWh) tương đương bao nhiêu Joule (J)?',
        dap: 'Tương đương 3.600.000 J (hoặc 3,6 MJ).',
      },
      {
        hoi: 'Nêu công thức tính nhiệt lượng Q toả ra trên điện trở thuần R trong thời gian t theo định luật Joule-Lenz.',
        dap: 'Q = R * I² * t.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly11-c4-b26',
    grade: '11',
    chapterNumber: 4,
    chapterTitle: 'Dòng điện. Mạch điện',
    lessonNumber: 26,
    title: 'Thực hành: Đo suất điện động và điện trở trong của pin điện hoá',
    hook:
      'Làm thế nào xác định chính xác các thông số ẩn của một viên pin tiểu như suất điện động ξ và điện trở trong r ' +
      'khi không thể bóc viên pin ra để đo? Ta sử dụng phương pháp đồ thị vôn-ampe.',
    theory:
      'SƠ ĐỒ THÍ NGHIỆM ĐO ξ VÀ r:\\n' +
      '— Mạch điện gồm: Pin cần đo mắc nối tiếp với một ampe kế (đo I), một biến trở R để thay đổi tải và một khóa k.\\n' +
      '— Mắc một vôn kế song song với hai cực của nguồn pin (đo hiệu điện thế mạch ngoài U).\\n\\n' +
      'PHƯƠNG PHÁP ĐỒ THỊ (PHƯƠNG PHÁP TOÀN MẠCH):\\n' +
      '— Theo định luật Ohm toàn mạch: U = ξ - I * r.\\n' +
      '— Tiến hành đo nhiều lần cặp giá trị (U, I) bằng cách thay đổi giá trị biến trở R. Vẽ đồ thị U = f(I) trên hệ trục toạ độ.\\n' +
      '— Đặc điểm đồ thị U = f(I): Là một đoạn thẳng nghiêng xuống.\\n' +
      '  — Điểm cắt trục tung (khi dòng điện I = 0): U_max = ξ (đọc được giá trị suất điện động).*\\n' +
      '  — Độ dốc của đường thẳng chính là giá trị điện trở trong r: r = |ΔU / ΔI|.',
    workedExample: {
      problem:
        'Trong một bài thực hành đo ξ và r của pin điện hoá, học sinh thu được đồ thị U = f(I) cắt trục tung tại điểm U = 1,5 V. ' +
        'Khi dòng điện trong mạch đạt I = 0,5 A thì vôn kế chỉ U = 1,3 V. Tính suất điện động ξ và điện trở trong r của pin.',
      steps: [
        'Xác định suất điện động từ giao điểm trục tung (I = 0): ξ = U_max = 1,5 V.',
        'Áp dụng phương trình đặc trưng nguồn điện: U = ξ - I * r.',
        'Thay số khi I = 0,5 A và U = 1,3 V: 1,3 = 1,5 - 0,5 * r.',
        'Giải phương trình tính r: 0,5 * r = 1,5 - 1,3 = 0,2 ⇔ r = 0,2 / 0,5 = 0,4 Ω.',
      ],
      answer: 'ξ = 1,5 V; r = 0,4 Ω.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong sơ đồ mạch điện thực hành đo suất điện động và điện trở trong của pin, vôn kế được mắc như thế nào với pin?',
        choices: [
          { id: 'vm_1', label: 'Mắc song song với hai cực của pin' },
          { id: 'vm_2', label: 'Mắc nối tiếp với ampe kế' },
          { id: 'vm_3', label: 'Mắc song song với biến trở duy nhất' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['vm_1'],
        },
        explain:
          'Vôn kế đo hiệu điện thế mạch ngoài (giữa hai cực nguồn pin) nên cần mắc song song với hai cực của pin.',
      },
      {
        prompt:
          'Từ phương trình U = E - I * r, nếu kết quả đo thực nghiệm chỉ ra: khi dòng điện mạch hở (I = 0) vôn kế chỉ 1,5 V, và khi dòng điện I = 0,5 A vôn kế chỉ 1,3 V. Hãy tính điện trở trong r của pin.',
        answer: {
          kind: 'numeric',
          value: 0.4,
          unit: 'ohm', // Note: 'ohm' or 'Ω' are both fine, let's use 'ohm'
        },
        explain: 'U = E - I*r ⇔ 1,3 = 1,5 - 0,5*r ⇔ r = 0,4 Ω.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao khi dòng điện I tăng lên thì hiệu điện thế mạch ngoài U lại giảm đi?',
        dap: 'Vì sụt thế trong nguồn I*r tăng lên làm giảm hiệu điện thế đầu ra U = E - I*r.',
      },
      {
        hoi: 'Làm thế nào để tìm suất điện động E từ đồ thị U = f(I) của thực nghiệm?',
        dap: 'Tìm giao điểm của đoạn đồ thị kéo dài với trục tung U (ứng với I = 0).',
      },
    ],
    reviewStatus: 'draft',
  },
]
