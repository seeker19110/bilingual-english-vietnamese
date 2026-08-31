// lessons/sinh12c2.ts — Sinh học 12, Phần Tiến hoá & Sinh thái (Bài 20-36).
import type { BiologyLesson } from '../lessonTypes.js'

export const SINH12_C2_LESSONS: BiologyLesson[] = [
  {
    id: 'sinh12-c6-b20',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Bằng chứng và cơ chế tiến hoá',
    lessonNumber: 20,
    title: 'Bằng chứng tiến hoá',
    hook: 'Tại sao xương cánh chim, xương tay người và xương vây cá voi lại có cùng cấu trúc xương nền tương tự? Đây là bằng chứng giải phẫu so sánh hùng hồn nhất cho thuyết tiến hoá chung.',
    theory:
      'BẰNG CHỨNG GIẢI PHẪU SO SÁNH:\\n' +
      '— Cơ quan tương đồng (Homologous organs): Các cơ quan ở các loài khác nhau có cùng nguồn gốc phát sinh nhưng có thể thực hiện các chức năng hoàn toàn khác nhau do đã phân hoá thích nghi với môi trường sống khác nhau.\\n' +
      '  + Ý nghĩa: Chứng minh nguồn gốc chung từ một tổ tiên.\\n  + Ví dụ: Tay người, cánh chim, vây cá voi, chân trước mèo đều là chi trước của động vật có xương sống.\\n' +
      '— Cơ quan thoái hoá (Vestigial organs): Cơ quan không còn giữ chức năng như tổ tiên nhưng vẫn để lại dấu vết trên cơ thể.\\n  + Ví dụ: Ruột thừa, xương cụt ở người; xương chân sau thoái hoá ở cá voi; cánh không bay được của đà điểu.\\n\\n' +
      'BẰNG CHỨNG PHÔI SINH HỌC:\\n' +
      '— Phôi của các loài động vật có xương sống trong giai đoạn đầu phát triển rất giống nhau (đều có túi mang, đuôi...). Phôi loài càng gần gũi nhau thì càng giống nhau ở giai đoạn càng muộn. Chứng tỏ xuất phát từ tổ tiên chung.\\n\\n' +
      'BẰNG CHỨNG ĐỊA LÝ SINH VẬT HỌC:\\n' +
      '— Sự phân bố địa lý của các loài phản ánh lịch sử tiến hoá. Các loài sinh vật phân bố gần nhau về địa lý thường có họ hàng tiến hoá gần nhau hơn. Ví dụ hệ động vật đặc hữu độc đáo ở Australia do lục địa bị cô lập.\\n\\n' +
      'BẰNG CHỨNG SINH HỌC PHÂN TỬ:\\n' +
      '— Mức độ giống nhau về trình tự nucleotit ADN hay trình tự axit amin trong protein (như cytochrome C, hemoglobin) phản ánh quan hệ họ hàng: trình tự càng giống nhau thì loài càng họ hàng gần.\\n' +
      '— Bằng chứng sắc nét nhất và định lượng được vì dựa trên dữ liệu phân tử khách quan.',
    workedExample: {
      problem: 'Cơ quan tương đồng và cơ quan tương tự khác nhau ở điểm gì? Cho ví dụ minh hoạ.',
      steps: [
        'Cơ quan tương đồng (homologous): Cùng nguồn gốc, cùng cấu trúc nền giải phẫu, nhưng chức năng khác nhau. Phản ánh nguồn gốc chung. Ví dụ: cánh dơi và tay người (cùng là chi trước, có cùng xương cánh tay - cẳng tay - cổ tay - ngón).',
        'Cơ quan tương tự (analogous): Khác nguồn gốc, khác cấu trúc giải phẫu, nhưng có cùng chức năng do thích nghi hội tụ với cùng môi trường. Không phản ánh nguồn gốc chung. Ví dụ: cánh côn trùng (là sự biến đổi của da) và cánh chim (là chi trước) đều dùng để bay nhưng không cùng nguồn gốc.',
      ],
      answer:
        'Tương đồng: cùng nguồn gốc, chức năng khác nhau (chứng minh tổ tiên chung). Tương tự: khác nguồn gốc, cùng chức năng (tiến hoá hội tụ).',
    },
    checkQuestions: [
      {
        prompt:
          'Xương tay người và xương vây trước của cá voi là ví dụ của loại bằng chứng tiến hoá nào?',
        choices: [
          { id: 'bc_1', label: 'Cơ quan tương đồng' },
          { id: 'bc_2', label: 'Cơ quan tương tự' },
          { id: 'bc_3', label: 'Bằng chứng phôi sinh học' },
          { id: 'bc_4', label: 'Bằng chứng địa lý sinh vật học' },
        ],
        answer: { kind: 'choice', correctIds: ['bc_1'] },
        explain:
          'Tay người và vây trước cá voi đều là chi trước của động vật có xương sống (cùng nguồn gốc tổ tiên), nhưng đã biến đổi chức năng khác nhau — đây là cơ quan tương đồng.',
      },
      {
        prompt:
          'Bằng chứng tiến hoá nào cho phép so sánh định lượng mức độ họ hàng giữa các loài một cách chính xác và khách quan nhất?',
        choices: [
          { id: 'bc_5', label: 'Bằng chứng sinh học phân tử (so sánh ADN/protein)' },
          { id: 'bc_6', label: 'Bằng chứng giải phẫu so sánh' },
          { id: 'bc_7', label: 'Bằng chứng phôi sinh học' },
          { id: 'bc_8', label: 'Bằng chứng hoá thạch' },
        ],
        answer: { kind: 'choice', correctIds: ['bc_5'] },
        explain:
          'So sánh trình tự ADN hoặc protein cho phép định lượng chính xác mức độ khác biệt phân tử giữa các loài, từ đó xây dựng cây phát sinh chủng loại có cơ sở vật chất.',
      },
    ],
    srsCards: [
      {
        hoi: 'Cơ quan thoái hoá là gì?',
        dap: 'Là cơ quan đã mất hoặc giảm chức năng so với tổ tiên nhưng vẫn còn dấu tích trên cơ thể, chứng minh nguồn gốc tiến hoá.',
      },
      {
        hoi: 'Tại sao phôi của người và cá đều có túi mang trong giai đoạn đầu phát triển?',
        dap: 'Vì cả hai đều có chung tổ tiên là động vật có xương sống thủy sinh; phôi lặp lại các đặc điểm tổ tiên trước khi biệt hoá thành loài đặc thù.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c6-b21',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Bằng chứng và cơ chế tiến hoá',
    lessonNumber: 21,
    title: 'Học thuyết tiến hoá của Darwin',
    hook: 'Darwin đã quan sát 13 loài chim sẻ ở quần đảo Galapagos và nhận ra rằng chúng đều có chung một tổ tiên nhưng đã phân hoá thành các loài khác nhau nhờ chọn lọc tự nhiên trong hàng triệu năm.',
    theory:
      'HỌC THUYẾT TIẾN HOÁ DARWIN (1859 — "Nguồn gốc các loài"):\\n' +
      '— Hai nội dung cốt lõi:\\n' +
      '  1. Các loài sinh vật không cố định bất biến mà đều có chung nguồn gốc từ một tổ tiên và phân nhánh tiến hoá dần dần thành đa dạng loài.\\n' +
      '  2. Chọn lọc tự nhiên là nhân tố chủ yếu thúc đẩy quá trình tiến hoá.\\n\\n' +
      'BIẾN DỊ CÁ THỂ (Individual variation):\\n' +
      '— Trong quần thể sinh vật, cá thể nào cũng có sự sai khác (biến dị) với nhau về mọi tính trạng (hình thái, sinh lý, sinh thái).\\n' +
      '— Biến dị là nguyên liệu cho chọn lọc tự nhiên tác động.\\n\\n' +
      'CHỌN LỌC TỰ NHIÊN (Natural selection):\\n' +
      '— Tự nhiên luôn chọn lọc giữ lại những cá thể có các biến dị có lợi (thích nghi tốt nhất với môi trường hiện tại) giúp chúng sống sót và sinh sản nhiều hơn, đồng thời đào thải các cá thể có biến dị bất lợi.\\n' +
      '— Qua nhiều thế hệ chọn lọc liên tiếp, quần thể tích luỹ ngày càng nhiều biến dị có lợi, dần dần khác biệt với quần thể gốc và có thể hình thành loài mới.\\n\\n' +
      'HẠN CHẾ CỦA HỌC THUYẾT DARWIN:\\n' +
      '— Darwin giải thích được quá trình tiến hoá thích nghi nhưng chưa giải thích được nguồn gốc phát sinh biến dị cá thể và cơ chế di truyền chúng từ thế hệ này sang thế hệ khác (do thời đó chưa có khoa học di truyền).',
    workedExample: {
      problem:
        'Dùng học thuyết Darwin giải thích tại sao quần thể vi khuẩn có thể phát triển tính kháng kháng sinh chỉ sau vài tuần sử dụng liên tục.',
      steps: [
        'Biến dị cá thể: Trong quần thể vi khuẩn ban đầu rất lớn, một số ít cá thể ngẫu nhiên có biến dị (đột biến) làm chúng kháng được kháng sinh ở mức độ nhất định.',
        'Chọn lọc tự nhiên: Khi dùng kháng sinh, đây chính là áp lực chọn lọc tự nhiên. Các vi khuẩn nhạy cảm bị tiêu diệt hàng loạt; chỉ có các vi khuẩn mang biến dị kháng kháng sinh sống sót và tiếp tục sinh sản.',
        'Tích luỹ biến dị: Qua nhiều thế hệ phân đôi rất nhanh, tần số vi khuẩn kháng kháng sinh tăng dần trong quần thể. Sau vài tuần, phần lớn quần thể vi khuẩn đều mang gene kháng kháng sinh.',
      ],
      answer:
        'Biến dị kháng kháng sinh xuất hiện ngẫu nhiên; chọn lọc tự nhiên (kháng sinh) đào thải vi khuẩn nhạy cảm, giữ lại vi khuẩn kháng; tích luỹ nhanh thành quần thể kháng thuốc.',
    },
    checkQuestions: [
      {
        prompt: 'Nhân tố chủ yếu thúc đẩy quá trình tiến hoá theo Darwin là:',
        choices: [
          { id: 'dw_1', label: 'Chọn lọc tự nhiên' },
          { id: 'dw_2', label: 'Đột biến gene ngẫu nhiên' },
          { id: 'dw_3', label: 'Di nhập gene' },
          { id: 'dw_4', label: 'Biến động di truyền' },
        ],
        answer: { kind: 'choice', correctIds: ['dw_1'] },
        explain:
          'Darwin đặt chọn lọc tự nhiên là cơ chế chủ đạo dẫn dắt tiến hoá theo hướng thích nghi.',
      },
      {
        prompt: 'Hạn chế lớn nhất của học thuyết Darwin so với di truyền học hiện đại là:',
        choices: [
          { id: 'dw_5', label: 'Chưa giải thích được nguồn gốc và cơ chế di truyền của biến dị' },
          { id: 'dw_6', label: 'Phủ nhận hoàn toàn vai trò của môi trường' },
          { id: 'dw_7', label: 'Cho rằng tiến hoá xảy ra ở cá thể chứ không ở quần thể' },
          { id: 'dw_8', label: 'Không thừa nhận sự tồn tại của loài' },
        ],
        answer: { kind: 'choice', correctIds: ['dw_5'] },
        explain:
          'Darwin sống trước thời đại Mendel nên chưa biết cơ chế di truyền gene, không giải thích được tại sao biến dị lại xuất hiện và di truyền theo quy luật.',
      },
    ],
    srsCards: [
      {
        hoi: 'Hai nội dung cốt lõi của học thuyết tiến hoá Darwin?',
        dap: '1. Các loài có nguồn gốc chung từ tổ tiên và phân nhánh dần; 2. Chọn lọc tự nhiên là động lực chủ yếu của tiến hoá.',
      },
      {
        hoi: 'Tại sao chọn lọc tự nhiên tác động lên quần thể mà không tác động lên cá thể?',
        dap: 'Vì chọn lọc tự nhiên thay đổi tần số allele trong quần thể qua nhiều thế hệ, còn cá thể đã có kiểu gen cố định từ khi sinh ra không thể thay đổi trong đời.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c6-b22',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Bằng chứng và cơ chế tiến hoá',
    lessonNumber: 22,
    title: 'Thuyết tiến hoá tổng hợp hiện đại và các nhân tố tiến hoá',
    hook: 'Thuyết tiến hoá hiện đại kết hợp học thuyết Darwin với di truyền học Mendel và di truyền quần thể, tạo ra bức tranh hoàn chỉnh về cơ chế tiến hoá ở cấp độ phân tử và quần thể.',
    theory:
      'THUYẾT TIẾN HOÁ TỔNG HỢP HIỆN ĐẠI (The Modern Synthesis):\\n' +
      '— Tiến hoá là sự thay đổi tần số alen và thành phần kiểu gen của quần thể qua các thế hệ.\\n' +
      '— Đơn vị tiến hoá cơ sở: Quần thể (không phải cá thể hay loài).\\n\\n' +
      'NĂM NHÂN TỐ TIẾN HOÁ CHÍNH:\\n' +
      '1. Đột biến (Mutation):\\n' +
      '   — Tạo ra alen mới → Nguyên liệu sơ cấp chủ yếu cho tiến hoá.\\n' +
      '   — Tần số đột biến rất thấp (10⁻⁶ đến 10⁻⁴/gen/thế hệ) nhưng vì quần thể lớn nên lượng đột biến phát sinh đáng kể.\\n' +
      '   — Hầu hết đột biến là có hại hoặc trung tính, chỉ một phần nhỏ có lợi; tuy nhiên trong điều kiện môi trường thay đổi, đột biến trước đó bất lợi có thể trở thành có lợi.\\n' +
      '2. Di nhập gen (Gene flow / Migration):\\n' +
      '   — Sự di chuyển của cá thể hoặc giao tử giữa các quần thể làm thay đổi tần số alen.\\n' +
      '   — Có thể làm tương đồng hoá cấu trúc di truyền của các quần thể lân cận với nhau.\\n' +
      '3. Biến động di truyền (Genetic drift):\\n' +
      '   — Là sự biến đổi ngẫu nhiên tần số alen trong quần thể nhỏ qua các thế hệ.\\n' +
      '   — Xảy ra mạnh nhất trong các quần thể nhỏ (hiệu ứng nút cổ chai, hiệu ứng người sáng lập).\\n' +
      '   — Không định hướng, không thích nghi.\\n' +
      '4. Chọn lọc tự nhiên (Natural selection):\\n' +
      '   — Nhân tố tiến hoá duy nhất có hướng và tạo ra thích nghi.\\n' +
      '   — Loại bỏ các kiểu gen có sức sống và khả năng sinh sản thấp hơn.\\n' +
      '5. Cách ly sinh sản (Reproductive isolation):\\n' +
      '   — Ngăn cản dòng gene giữa các quần thể, là điều kiện tiên quyết để các quần thể tiến hoá độc lập và hình thành loài mới.',
    workedExample: {
      problem:
        'Tại sao quần thể nhỏ dễ bị biến động di truyền (genetic drift) hơn quần thể lớn? Cho ví dụ.',
      steps: [
        'Nguyên lý thống kê: Trong quần thể nhỏ, mỗi cá thể đại diện cho tỉ lệ phần trăm lớn hơn trong quần thể, nên sự sinh sản hoặc chết ngẫu nhiên của vài cá thể sẽ ảnh hưởng mạnh đến tần số alen.',
        'Ví dụ: Quần thể gồm 10 cá thể với tần số alen A = 0.5. Nếu 2 cá thể mang alen A chết ngẫu nhiên không có con, tần số A giảm đáng kể. Trong quần thể 10.000 cá thể, 2 cá thể chết không ảnh hưởng đáng kể.',
        'Hệ quả: Quần thể nhỏ dễ bị mất hoàn toàn (fixation at 0%) hoặc cố định hoàn toàn (fixation at 100%) một alen ngẫu nhiên, dù alen đó không nhất thiết là có lợi.',
      ],
      answer:
        'Quần thể nhỏ: mỗi cá thể chiếm tỉ lệ lớn hơn nên mất mát ngẫu nhiên gây biến đổi tần số alen mạnh; quần thể lớn có tính ổn định thống kê cao.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong 5 nhân tố tiến hoá chính, nhân tố nào duy nhất mang tính định hướng và tạo ra sự thích nghi cho sinh vật?',
        choices: [
          { id: 'ntth_1', label: 'Chọn lọc tự nhiên' },
          { id: 'ntth_2', label: 'Đột biến' },
          { id: 'ntth_3', label: 'Biến động di truyền' },
          { id: 'ntth_4', label: 'Di nhập gen' },
        ],
        answer: { kind: 'choice', correctIds: ['ntth_1'] },
        explain:
          'Chọn lọc tự nhiên có hướng và có lợi theo hướng thích nghi; đột biến và biến động di truyền là ngẫu nhiên, không định hướng.',
      },
      {
        prompt: 'Đơn vị tiến hoá cơ sở theo thuyết tiến hoá tổng hợp hiện đại là:',
        choices: [
          { id: 'dv_1', label: 'Quần thể' },
          { id: 'dv_2', label: 'Cá thể' },
          { id: 'dv_3', label: 'Loài' },
          { id: 'dv_4', label: 'Gen' },
        ],
        answer: { kind: 'choice', correctIds: ['dv_1'] },
        explain:
          'Tiến hoá xảy ra khi tần số alen trong quần thể thay đổi qua các thế hệ; cá thể không tiến hoá vì kiểu gen đã cố định từ khi sinh ra.',
      },
    ],
    srsCards: [
      {
        hoi: 'Kể tên 5 nhân tố tiến hoá chính theo thuyết tổng hợp hiện đại?',
        dap: '1. Đột biến; 2. Di nhập gen; 3. Biến động di truyền; 4. Chọn lọc tự nhiên; 5. Cách ly sinh sản.',
      },
      {
        hoi: 'Biến động di truyền (Genetic drift) xảy ra mạnh nhất trong điều kiện nào?',
        dap: 'Quần thể có kích thước nhỏ.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c6-b23',
    grade: '12',
    chapterNumber: 6,
    chapterTitle: 'Bằng chứng và cơ chế tiến hoá',
    lessonNumber: 23,
    title: 'Hình thành loài và tiến hoá lớn',
    hook: 'Làm thế nào một loài ban đầu có thể phân hoá thành nhiều loài khác nhau? Đây là câu hỏi cốt lõi của sinh học tiến hoá, được trả lời thông qua cơ chế hình thành loài.',
    theory:
      'LOÀI VÀ TIÊU CHÍ PHÂN BIỆT LOÀI:\\n' +
      '— Loài sinh học: Nhóm quần thể có thể giao phối với nhau sinh ra con hữu thụ, nhưng cách ly sinh sản với các nhóm khác.\\n\\n' +
      'QUÁ TRÌNH HÌNH THÀNH LOÀI (Speciation):\\n' +
      '1. Hình thành loài khác khu địa lý (Allopatric speciation):\\n' +
      '   — Cơ chế: Quần thể bị chia cắt bởi rào cản địa lý (núi, biển, sa mạc). Hai quần thể con cách ly tiến hoá độc lập dưới áp lực chọn lọc khác nhau. Qua thời gian dài, tích luỹ đủ sự sai khác di truyền để trở thành hai loài cách ly sinh sản.\\n' +
      '   — Đây là con đường hình thành loài phổ biến nhất ở động vật.\\n' +
      '2. Hình thành loài cùng khu địa lý (Sympatric speciation):\\n' +
      '   — Cơ chế không cần cách ly địa lý:\\n' +
      '     + Đa bội hoá: Đột biến đa bội tạo ra cá thể đa bội không giao phối được với quần thể gốc lưỡng bội (cách ly sau hợp tử), đặc biệt phổ biến ở thực vật. Ví dụ: lúa mì bánh mì 6n hình thành từ lai xa + đa bội hoá.\\n' +
      '     + Cách ly tập tính: Một phần quần thể phát sinh đột biến làm thay đổi đặc điểm nhận dạng bạn tình (màu sắc, tiếng hót, mùi hương), dẫn đến cách ly giao phối.\\n\\n' +
      'TIẾN HOÁ LỚN (Macroevolution):\\n' +
      '— Sự hình thành các taxon trên loài (chi, họ, bộ, lớp, ngành) qua các khoảng thời gian địa chất dài hàng triệu năm.\\n' +
      '— Được minh chứng bằng hồ sơ hoá thạch (fossil record) ghi lại lịch sử tiến hoá.',
    workedExample: {
      problem:
        'Giải thích tại sao đa bội hoá ở thực vật lại dễ dẫn đến hình thành loài mới hơn ở động vật.',
      steps: [
        'Ở thực vật: Cây đa bội (4n) hình thành từ tế bào lưỡng bội (2n) vẫn có thể tự thụ phấn hoặc thụ phấn chéo với cây đa bội khác cùng dạng và tạo ra hạt giống hữu thụ. Chúng bị cách ly sinh sản ngay tức thì với cây lưỡng bội ban đầu vì con lai giữa 4n và 2n sẽ là 3n bất thụ.',
        'Ở động vật: Đa bội hoá ở động vật rất hiếm và hầu như gây chết vì hầu hết cơ chế xác định giới tính dựa vào NST giới tính sẽ bị rối loạn nghiêm trọng khi đa bội hoá.',
        'Kết luận: Thực vật dễ hình thành loài bằng đa bội hóa vì khả năng tự thụ phấn và không bị rối loạn xác định giới tính.',
      ],
      answer:
        'Thực vật có thể tự thụ phấn và không bị rối loạn xác định giới tính khi đa bội hoá, tạo loài mới ngay lập tức.',
    },
    checkQuestions: [
      {
        prompt: 'Con đường hình thành loài nào phổ biến nhất ở động vật?',
        choices: [
          { id: 'hl_1', label: 'Hình thành loài khác khu địa lý nhờ cách ly địa lý' },
          { id: 'hl_2', label: 'Hình thành loài nhờ đa bội hoá' },
          { id: 'hl_3', label: 'Hình thành loài nhờ cách ly tập tính' },
          { id: 'hl_4', label: 'Hình thành loài nhờ lai xa không cần cách ly' },
        ],
        answer: { kind: 'choice', correctIds: ['hl_1'] },
        explain:
          'Động vật thường bị rào cản địa lý chia cắt quần thể, sau đó tích luỹ sai khác di truyền dần dần đến mức cách ly sinh sản hoàn toàn.',
      },
      {
        prompt: 'Cây lúa mì bánh mì (6n = 42) được hình thành theo con đường nào?',
        choices: [
          { id: 'lm_1', label: 'Lai xa giữa các loài khác nhau kết hợp đa bội hoá' },
          { id: 'lm_2', label: 'Đột biến điểm tích luỹ qua hàng triệu thế hệ' },
          { id: 'lm_3', label: 'Cách ly địa lý và chọn lọc tự nhiên' },
          { id: 'lm_4', label: 'Biến động di truyền trong quần thể nhỏ' },
        ],
        answer: { kind: 'choice', correctIds: ['lm_1'] },
        explain:
          'Lúa mì bánh mì 6n hình thành từ 3 sự kiện lai xa và đa bội hoá liên tiếp giữa 3 loài lúa mì dại khác nhau qua lịch sử canh tác.',
      },
    ],
    srsCards: [
      {
        hoi: 'Định nghĩa loài sinh học?',
        dap: 'Nhóm quần thể có thể giao phối với nhau sinh ra con hữu thụ, bị cách ly sinh sản hoàn toàn với các nhóm khác.',
      },
      {
        hoi: 'Tại sao cần có cách ly địa lý trước khi hình thành cách ly sinh sản?',
        dap: 'Vì cách ly địa lý ngăn dòng gene giữa các quần thể, để chọn lọc tự nhiên và biến động di truyền tích luỹ sự sai khác di truyền theo từng hướng khác nhau cho đến khi hai quần thể không còn giao phối được nữa.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c7-b24',
    grade: '12',
    chapterNumber: 7,
    chapterTitle: 'Sự phát sinh và phát triển sự sống trên Trái Đất',
    lessonNumber: 24,
    title: 'Nguồn gốc sự sống và tiến hoá của sinh giới qua các đại địa chất',
    hook: 'Từ một môi trường nguyên thuỷ giàu hoá chất nhưng không có oxy, sự sống trên Trái Đất đã xuất hiện cách đây khoảng 3.8 tỷ năm và tiến hoá qua hàng trăm triệu năm thành muôn loài như ngày nay.',
    theory:
      'NGUỒN GỐC SỰ SỐNG (Thuyết tiến hoá hoá học):\\n' +
      '— Thuyết tiến hoá hoá học (Oparin – Haldane): Sự sống hình thành theo 3 giai đoạn từ vật chất vô sinh dưới điều kiện Trái Đất nguyên thuỷ (không có oxy, giàu CH₄, NH₃, H₂O, H₂, tia tử ngoại mạnh, sét...).\\n' +
      '  1. Tiến hoá hoá học: Từ chất vô cơ đơn giản → phân tử hữu cơ đơn giản (amino acid, base nitrogen, đường...) → polymer (protein, nucleic acid) dưới tác động của năng lượng tự nhiên.\\n' +
      '  2. Tiến hoá tiền sinh học: Các polymer liên kết tạo ra giọt coaxecva (coacervate) — cấu trúc có màng ngăn cách với môi trường ngoài và chứa enzyme thô sơ.\\n' +
      '  3. Tiến hoá sinh học: Hình thành tế bào sơ khai có khả năng tự nhân bản ADN và trao đổi chất.\\n\\n' +
      'CÁC ĐẠI ĐỊA CHẤT LƯỢC SỬ:\\n' +
      '— Đại Thái cổ (~3.8 tỷ năm trước): Xuất hiện tế bào nhân sơ đầu tiên (vi khuẩn cổ, vi khuẩn lam).\\n' +
      '— Đại Nguyên sinh (~2.5 tỷ → 540 triệu năm): Xuất hiện tế bào nhân thực đơn bào. Oxi bắt đầu tích luỹ trong khí quyển do vi khuẩn lam quang hợp.\\n' +
      '— Đại Cổ sinh (~541 → 252 triệu năm): Bùng nổ sinh vật đa bào. Thực vật, động vật tiến hoá lên cạn. Cuối đại xảy ra tuyệt chủng hàng loạt lớn nhất trong lịch sử (96% loài biển).\\n' +
      '— Đại Trung sinh (~252 → 66 triệu năm): Kỷ nguyên của khủng long. Xuất hiện thú túi, chim, thực vật hạt kín. Kết thúc bởi thiên thạch + núi lửa gây tuyệt chủng khủng long.\\n' +
      '— Đại Tân sinh (~66 triệu năm → nay): Thú nhau và linh trưởng bùng nổ. Khí hậu mát dần. Xuất hiện người hiện đại (Homo sapiens) khoảng 300.000 năm trước.',
    workedExample: {
      problem:
        'Chứng minh thí nghiệm Miller–Urey (1953) hỗ trợ thuyết tiến hoá hoá học về nguồn gốc sự sống như thế nào.',
      steps: [
        'Thiết kế thí nghiệm: Stanley Miller và Harold Urey tái tạo điều kiện khí quyển Trái Đất nguyên thuỷ trong bình thuỷ tinh kín (hỗn hợp khí CH₄, NH₃, H₂, H₂O), cung cấp năng lượng bằng tia lửa điện mô phỏng sét.',
        'Kết quả: Sau 1 tuần, phân tích dung dịch thu được 20 loại amino acid khác nhau và nhiều phân tử hữu cơ đơn giản khác.',
        'Ý nghĩa: Chứng minh thực nghiệm rằng các phân tử hữu cơ là nền tảng của sự sống có thể tự hình thành từ chất vô cơ dưới điều kiện vật lý mà không cần sự can thiệp của sinh vật sống trước đó.',
      ],
      answer:
        'Miller–Urey chứng minh amino acid và phân tử hữu cơ có thể tự hình thành từ chất vô cơ dưới điều kiện Trái Đất nguyên thuỷ.',
    },
    checkQuestions: [
      {
        prompt:
          'Điều kiện đặc biệt nào của Trái Đất nguyên thuỷ cho phép sự tổng hợp hoá học của các phân tử hữu cơ đầu tiên?',
        choices: [
          { id: 'ng_1', label: 'Không có oxy tự do trong khí quyển; giàu năng lượng (sét, UV)' },
          { id: 'ng_2', label: 'Giàu oxy và nước; nhiệt độ mát mẻ' },
          { id: 'ng_3', label: 'Nhiều sinh vật cung cấp enzyme xúc tác' },
          { id: 'ng_4', label: 'Không có tia tử ngoại và năng lượng điện' },
        ],
        answer: { kind: 'choice', correctIds: ['ng_1'] },
        explain:
          'Thiếu oxy bảo vệ phân tử hữu cơ khỏi bị oxy hoá ngay; năng lượng từ sét và UV cung cấp năng lượng hoạt hoá cho phản ứng tổng hợp hữu cơ.',
      },
      {
        prompt: 'Kỷ nguyên nào trong lịch sử Trái Đất được gọi là "thời đại của khủng long"?',
        choices: [
          { id: 'kl_1', label: 'Đại Trung sinh (252-66 triệu năm)' },
          { id: 'kl_2', label: 'Đại Cổ sinh (541-252 triệu năm)' },
          { id: 'kl_3', label: 'Đại Tân sinh (66 triệu năm đến nay)' },
          { id: 'kl_4', label: 'Đại Nguyên sinh (2.5 tỷ-541 triệu năm)' },
        ],
        answer: { kind: 'choice', correctIds: ['kl_1'] },
        explain:
          'Khủng long thống trị Trái Đất suốt Đại Trung sinh, cho đến khi bị tuyệt chủng vào cuối đại này do thiên thạch va chạm 66 triệu năm trước.',
      },
    ],
    srsCards: [
      {
        hoi: 'Ba giai đoạn của thuyết tiến hoá hoá học về nguồn gốc sự sống?',
        dap: '1. Tiến hoá hoá học (từ vô cơ → hữu cơ); 2. Tiến hoá tiền sinh học (coacervate); 3. Tiến hoá sinh học (tế bào sơ khai).',
      },
      {
        hoi: 'Loài nào có vai trò then chốt tích luỹ oxy trong khí quyển nguyên thuỷ Trái Đất?',
        dap: 'Vi khuẩn lam (cyanobacteria) thực hiện quang hợp giải phóng O₂.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c8-b25',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sinh thái học cá thể và quần thể',
    lessonNumber: 25,
    title: 'Sinh thái học và sinh thái học cá thể',
    hook: 'Tại sao cây rừng ở Trường Sơn có lá to xum xuê trong khi cây xương rồng sa mạc lại biến lá thành gai nhọn? Sinh thái học cá thể giải thích sự thích nghi của sinh vật với môi trường.',
    theory:
      'SINH THÁI HỌC (Ecology):\\n' +
      '— Là khoa học nghiên cứu mối quan hệ qua lại giữa sinh vật với môi trường sống và giữa các sinh vật với nhau.\\n\\n' +
      'MÔI TRƯỜNG VÀ CÁC NHÂN TỐ SINH THÁI:\\n' +
      '— Môi trường (Environment): Toàn bộ các nhân tố xung quanh sinh vật tác động lên đời sống của chúng.\\n' +
      '— Nhân tố sinh thái: Bao gồm nhân tố vô sinh (abiotic: ánh sáng, nhiệt độ, nước, đất, không khí...) và nhân tố hữu sinh (biotic: quan hệ giữa sinh vật với sinh vật, gồm cả con người).\\n\\n' +
      'GIỚI HẠN SINH THÁI (Ecological range / Tolerance range):\\n' +
      '— Là khoảng giá trị của một nhân tố sinh thái mà trong đó sinh vật có thể tồn tại và phát triển bình thường theo thời gian.\\n' +
      '— Điểm thuận lợi nhất trong giới hạn sinh thái gọi là điểm tối ưu (optimum).\\n' +
      '— Ổ sinh thái (Ecological niche): Không gian sinh thái mà ở đó tất cả các nhân tố sinh thái của môi trường đều ở mức thuận lợi cho loài sinh vật đó; phân biệt với nơi ở (habitat = địa điểm vật lý).\\n\\n' +
      'THÍCH NGHI CỦA SINH VẬT VỚI ÁNH SÁNG VÀ NHIỆT ĐỘ:\\n' +
      '— Nhóm cây ưa sáng: Lá nhỏ, cutin dày, mọc ở nơi quang đãng.\\n' +
      '— Nhóm cây ưa bóng (chịu bóng): Lá to, cutin mỏng, diệp lục nhiều để hấp thụ ánh sáng yếu.\\n' +
      '— Sinh vật biến nhiệt: Nhiệt độ cơ thể phụ thuộc môi trường (bò sát, ếch, cá...).\\n' +
      '— Sinh vật đẳng nhiệt: Duy trì nhiệt độ cơ thể ổn định nhờ trao đổi chất nội nhiệt (thú, chim). Lớn hơn → Tỉ lệ diện tích bề mặt/thể tích nhỏ hơn → tốn ít nhiệt hơn (quy tắc Bergmann).',
    workedExample: {
      problem:
        'Giải thích tại sao các loài thú sống ở vùng cực (như gấu Bắc Cực) có thân hình to lớn hơn và tai ngắn hơn các loài thú cùng chi sống ở vùng nhiệt đới.',
      steps: [
        'Quy tắc Bergmann (về kích thước cơ thể): Động vật đẳng nhiệt sống ở vùng lạnh thường có kích thước cơ thể lớn hơn để giảm tỉ lệ diện tích bề mặt/thể tích, giúp giảm sự mất nhiệt qua da.',
        'Quy tắc Allen (về hình dạng các phần phụ): Các bộ phận cơ thể nhô ra (tai, đuôi, chi) của động vật vùng lạnh thường ngắn hơn để giảm diện tích bề mặt thoát nhiệt.',
        'Kết luận: Đây là sự thích nghi hình thái với nhiệt độ thấp của vùng cực giúp động vật bảo tồn nhiệt năng cơ thể.',
      ],
      answer:
        'Thân to → giảm tỉ lệ diện tích/thể tích → ít mất nhiệt. Tai ngắn → giảm diện tích thoát nhiệt. Đây là thích nghi với môi trường lạnh.',
    },
    checkQuestions: [
      {
        prompt:
          'Ổ sinh thái (ecological niche) của một loài sinh vật khác với nơi ở (habitat) ở điểm nào?',
        choices: [
          {
            id: 'os_1',
            label:
              'Ổ sinh thái là không gian sinh thái đa chiều với mọi nhân tố đều tối ưu; nơi ở chỉ là địa điểm vật lý cụ thể',
          },
          { id: 'os_2', label: 'Ổ sinh thái là địa điểm vật lý, nơi ở là khái niệm sinh thái' },
          { id: 'os_3', label: 'Ổ sinh thái và nơi ở là hai khái niệm đồng nghĩa' },
          {
            id: 'os_4',
            label: 'Nơi ở bao gồm tất cả các nhân tố sinh thái, ổ sinh thái chỉ là nhiệt độ',
          },
        ],
        answer: { kind: 'choice', correctIds: ['os_1'] },
        explain:
          'Ổ sinh thái là không gian chức năng — tổng hợp tất cả các yêu cầu sinh thái của loài; nơi ở là địa điểm thực tế nơi sinh vật sống.',
      },
      {
        prompt: 'Nhóm động vật nào sau đây là sinh vật biến nhiệt?',
        choices: [
          { id: 'bt_1', label: 'Cá chép và ếch đồng' },
          { id: 'bt_2', label: 'Chim bồ câu và thỏ' },
          { id: 'bt_3', label: 'Chuột và gấu trắng' },
          { id: 'bt_4', label: 'Voi và hươu cao cổ' },
        ],
        answer: { kind: 'choice', correctIds: ['bt_1'] },
        explain:
          'Cá và ếch là động vật biến nhiệt (poikilotherm): nhiệt độ cơ thể thay đổi theo môi trường ngoài.',
      },
    ],
    srsCards: [
      {
        hoi: 'Giới hạn sinh thái là gì?',
        dap: 'Khoảng giá trị của một nhân tố sinh thái mà trong đó sinh vật có thể tồn tại và phát triển bình thường.',
      },
      {
        hoi: 'Phân biệt sinh vật đẳng nhiệt và biến nhiệt?',
        dap: 'Đẳng nhiệt: duy trì nhiệt độ cơ thể ổn định (thú, chim). Biến nhiệt: nhiệt độ cơ thể phụ thuộc môi trường (bò sát, ếch, cá).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c8-b26',
    grade: '12',
    chapterNumber: 8,
    chapterTitle: 'Sinh thái học cá thể và quần thể',
    lessonNumber: 26,
    title: 'Quần thể sinh vật và các đặc trưng cơ bản',
    hook: 'Tại sao dân số thế giới tăng chậm trong hàng ngàn năm nhưng chỉ mất 200 năm gần đây đã tăng từ 1 tỷ lên 8 tỷ người? Câu trả lời nằm trong học thuyết sinh trưởng quần thể.',
    theory:
      'QUẦN THỂ (Population):\\n' +
      '— Là tập hợp cá thể cùng loài, sống trong một khoảng không gian nhất định, có khả năng sinh sản và tạo thế hệ mới.\\n\\n' +
      'CÁC ĐẶC TRƯNG CƠ BẢN CỦA QUẦN THỂ:\\n' +
      '1. Kích thước quần thể (N): Tổng số cá thể trong quần thể.\\n' +
      '2. Mật độ quần thể: Số cá thể/đơn vị diện tích (hoặc thể tích). Phản ánh mức độ sử dụng nguồn sống.\\n' +
      '3. Tỉ lệ giới tính: Tỉ lệ đực/cái trong quần thể.\\n' +
      '4. Cấu trúc tuổi: Phân bố cá thể theo nhóm tuổi. Gồm ba dạng:\\n' +
      '   — Tháp tuổi phát triển: Nhóm tuổi non chiếm đa số → quần thể tăng trưởng.\\n' +
      '   — Tháp tuổi ổn định: Nhóm tuổi phân bố đồng đều → quần thể ổn định.\\n' +
      '   — Tháp tuổi suy giảm: Nhóm tuổi già chiếm đa số → quần thể suy giảm.\\n' +
      '5. Sự phân bố cá thể: Phân bố đều, ngẫu nhiên, hay theo nhóm.\\n\\n' +
      'TĂNG TRƯỞNG QUẦN THỂ:\\n' +
      '— Tăng trưởng theo tiềm năng sinh học (đường cong hình J): Xảy ra trong điều kiện nguồn sống không giới hạn; quần thể tăng theo hàm mũ.\\n' +
      '— Tăng trưởng thực tế (đường cong hình S/Logistic): Xảy ra trong môi trường thực tế có giới hạn nguồn sống. Quần thể tăng chậm → tăng nhanh → chậm dần → ổn định ở mức sức chứa môi trường K (carrying capacity).',
    workedExample: {
      problem:
        'Một quần thể cừu trên một hòn đảo có N₀ = 100 con và tốc độ tăng trưởng tức thời r = 0.2/năm. Tính số lượng cá thể sau 5 năm nếu không có giới hạn nguồn sống (tăng trưởng theo hàm mũ).',
      steps: [
        'Sử dụng công thức tăng trưởng hàm mũ: N_t = N₀ × e^(r×t), trong đó e ≈ 2.718.',
        'Thay số: N₅ = 100 × e^(0.2 × 5) = 100 × e^1.0.',
        'Tính e^1.0 ≈ 2.718. Vậy N₅ ≈ 100 × 2.718 ≈ 272 con.',
      ],
      answer: 'Sau 5 năm, quần thể cừu có khoảng 272 cá thể.',
    },
    checkQuestions: [
      {
        prompt: 'Tháp tuổi dạng nào cho thấy quần thể đang có xu hướng tăng trưởng về số lượng?',
        choices: [
          { id: 'tt_1', label: 'Tháp tuổi phát triển (đáy rộng, đỉnh hẹp — nhóm non chiếm đa số)' },
          { id: 'tt_2', label: 'Tháp tuổi ổn định (các nhóm tuổi bằng nhau)' },
          { id: 'tt_3', label: 'Tháp tuổi suy giảm (đáy hẹp, đỉnh rộng — nhóm già chiếm đa số)' },
          { id: 'tt_4', label: 'Tất cả các dạng tháp tuổi đều thể hiện quần thể tăng trưởng' },
        ],
        answer: { kind: 'choice', correctIds: ['tt_1'] },
        explain:
          'Nhiều cá thể ở nhóm tuổi non (trước sinh sản) sẽ gia nhập nhóm sinh sản trong tương lai, đảm bảo tốc độ sinh sản vượt tốc độ tử vong.',
      },
      {
        prompt: 'Sức chứa môi trường (K) trong mô hình tăng trưởng logistic là:',
        choices: [
          {
            id: 'sc_1',
            label: 'Kích thước quần thể tối đa mà môi trường có thể duy trì ổn định lâu dài',
          },
          { id: 'sc_2', label: 'Tốc độ tăng trưởng tức thời tối đa của quần thể' },
          { id: 'sc_3', label: 'Tỉ lệ sinh sản tối đa trong điều kiện lý tưởng' },
          { id: 'sc_4', label: 'Số cá thể bị chết đi trong một đơn vị thời gian' },
        ],
        answer: { kind: 'choice', correctIds: ['sc_1'] },
        explain:
          'K là kích thước quần thể mà ở đó tốc độ tăng trưởng bằng 0 do nguồn sống đã ở mức giới hạn.',
      },
    ],
    srsCards: [
      {
        hoi: 'Sự khác biệt giữa đường cong tăng trưởng hình J và hình S?',
        dap: 'Hình J: tăng trưởng hàm mũ vô hạn (điều kiện lý tưởng). Hình S (logistic): tăng chậm → nhanh → chậm dần và đạt ngưỡng K trong điều kiện thực tế.',
      },
      {
        hoi: 'Mật độ quần thể là gì và tại sao quan trọng?',
        dap: 'Số cá thể trên đơn vị diện tích (hoặc thể tích). Phản ánh áp lực cạnh tranh nguồn sống và ảnh hưởng đến tốc độ tăng trưởng quần thể.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c9-b27',
    grade: '12',
    chapterNumber: 9,
    chapterTitle: 'Quần xã sinh vật',
    lessonNumber: 27,
    title: 'Quần xã sinh vật và các mối quan hệ trong quần xã',
    hook: 'Trong rừng nhiệt đới, hàng ngàn loài sinh vật sống cùng nhau với một mạng lưới quan hệ phức tạp — từ cạnh tranh khốc liệt đến hội sinh, ký sinh và cộng sinh đôi bên cùng có lợi.',
    theory:
      'QUẦN XÃ (Community):\\n' +
      '— Là tập hợp các quần thể của nhiều loài sinh vật khác nhau cùng sống trong một không gian nhất định, có mối quan hệ gắn bó với nhau như một thể thống nhất.\\n\\n' +
      'CÁC ĐẶC TRƯNG CỦA QUẦN XÃ:\\n' +
      '— Đa dạng loài (Diversity): Số loài và số cá thể mỗi loài trong quần xã.\\n' +
      '— Loài ưu thế (Dominant species): Loài có số lượng cá thể hoặc sinh khối lớn nhất.\\n' +
      '— Loài chủ chốt (Keystone species): Loài có ảnh hưởng lớn đến cấu trúc quần xã không tương xứng với số lượng của chúng.\\n\\n' +
      'CÁC MỐI QUAN HỆ GIỮA CÁC LOÀI:\\n' +
      '1. Quan hệ cộng sinh (Mutualism +/+): Cả hai loài đều có lợi. VD: Nốt sần Rhizobium-đậu, tảo-nấm (địa y), cá hề-hải quỳ.\\n' +
      '2. Quan hệ hội sinh (Commensalism +/0): Một loài có lợi, loài kia không lợi không hại. VD: Phong lan bám cây gỗ lớn, cá ép bám cá mập.\\n' +
      '3. Quan hệ ký sinh (Parasitism +/-): Một loài có lợi (ký sinh trùng), một loài bị hại (vật chủ). VD: Sán ký sinh trong ruột người; virus ký sinh tế bào.\\n' +
      '4. Quan hệ ức chế - cảm nhiễm (Amensalism 0/-): Một loài ức chế loài khác mà bản thân không bị ảnh hưởng. VD: Nấm penicillium tiết penicillin ức chế vi khuẩn.\\n' +
      '5. Quan hệ cạnh tranh (Competition -/-): Hai loài cùng khai thác nguồn sống hạn chế và cản trở lẫn nhau. VD: Lúa và cỏ dại, sư tử và báo săn mồi cùng vùng.\\n' +
      '6. Quan hệ sinh vật ăn thịt (Predation +/-): Loài ăn thịt có lợi, con mồi bị hại. Điều tiết kích thước quần thể con mồi.',
    workedExample: {
      problem:
        'Phân biệt quan hệ cộng sinh và ký sinh bằng ví dụ cụ thể. Quan hệ nào có lợi cho cả hai loài?',
      steps: [
        'Cộng sinh (+/+): Cả hai loài đều có lợi và thường không thể thiếu nhau. Ví dụ: Vi khuẩn Rhizobium sống trong nốt sần rễ đậu. Vi khuẩn nhận chất dinh dưỡng, nơi ở ổn định từ cây; cây đậu nhận nguồn đạm (NH₄⁺) mà vi khuẩn cố định từ N₂ khí quyển.',
        'Ký sinh (+/-): Loài ký sinh có lợi, vật chủ bị hại (mất dinh dưỡng, suy yếu). Ví dụ: Sán dây sống trong ruột non người. Sán lấy chất dinh dưỡng người đã tiêu hoá; người bị thiếu dinh dưỡng, suy nhược.',
        'Kết luận: Cộng sinh có lợi cho cả hai loài. Ký sinh chỉ có lợi cho loài ký sinh.',
      ],
      answer:
        'Cộng sinh (+/+): cả hai có lợi (vi khuẩn nốt sần-cây đậu). Ký sinh (+/-): chỉ loài ký sinh có lợi (sán-người).',
    },
    checkQuestions: [
      {
        prompt: 'Mối quan hệ nào sau đây được xếp vào nhóm quan hệ cộng sinh?',
        choices: [
          { id: 'cs_1', label: 'Nấm và tảo tạo thành địa y (lichen)' },
          { id: 'cs_2', label: 'Cây phong lan bám trên thân cây gỗ lớn' },
          { id: 'cs_3', label: 'Sán dây ký sinh trong ruột người' },
          { id: 'cs_4', label: 'Hổ săn hươu làm thức ăn' },
        ],
        answer: { kind: 'choice', correctIds: ['cs_1'] },
        explain:
          'Trong địa y: nấm cung cấp nước, khoáng chất và bảo vệ; tảo quang hợp cung cấp chất hữu cơ cho nấm — đây là cộng sinh bắt buộc hai bên cùng có lợi.',
      },
      {
        prompt: 'Quan hệ nào sau đây thể hiện đúng ký hiệu (+/0)?',
        choices: [
          { id: 'hs_1', label: 'Cá ép bám dưới bụng cá mập để được di chuyển và kiếm ăn' },
          { id: 'hs_2', label: 'Tảo và nấm tạo địa y' },
          { id: 'hs_3', label: 'Nấm penicillium ức chế vi khuẩn' },
          { id: 'hs_4', label: 'Sư tử và linh cẩu tranh giành mồi' },
        ],
        answer: { kind: 'choice', correctIds: ['hs_1'] },
        explain:
          'Cá ép (+) được lợi nhờ bám vào cá mập để di chuyển và nhặt thức ăn thừa; cá mập (0) không bị ảnh hưởng đáng kể. Đây là hội sinh (+/0).',
      },
    ],
    srsCards: [
      {
        hoi: 'Loài chủ chốt (keystone species) là gì?',
        dap: 'Loài có ảnh hưởng cực lớn đến cấu trúc và đa dạng của quần xã, không tương xứng với số lượng ít ỏi của chúng. Ví dụ: rái cá biển kiểm soát nhím biển kiểm soát rong biển.',
      },
      {
        hoi: 'Phân biệt cạnh tranh (competition) và ký sinh (parasitism)?',
        dap: 'Cạnh tranh (-/-): cả hai loài cùng bị hại. Ký sinh (+/-): loài ký sinh có lợi, vật chủ bị hại.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c10-b28',
    grade: '12',
    chapterNumber: 10,
    chapterTitle: 'Hệ sinh thái, sinh quyển và bảo vệ môi trường',
    lessonNumber: 28,
    title: 'Hệ sinh thái',
    hook: 'Một ao cá nhỏ hay rừng nhiệt đới rộng lớn đều là hệ sinh thái — một đơn vị chức năng hoàn chỉnh trong đó sinh vật và môi trường liên tục trao đổi vật chất và năng lượng.',
    theory:
      'HỆ SINH THÁI (Ecosystem):\\n' +
      '— Là tập hợp quần xã sinh vật và môi trường vô sinh của chúng trong một khu vực nhất định, tương tác với nhau tạo thành hệ thống hoàn chỉnh và tương đối ổn định.\\n' +
      '— Hai loại: Hệ sinh thái tự nhiên (rừng, biển, đồng cỏ) và hệ sinh thái nhân tạo (ao cá nuôi, ruộng lúa, đô thị).\\n\\n' +
      'THÀNH PHẦN CẤU TRÚC HỆ SINH THÁI:\\n' +
      '1. Thành phần vô sinh (Abiotic): Đất, nước, ánh sáng, nhiệt độ, muối khoáng, khí...\\n' +
      '2. Thành phần hữu sinh (Biotic): Sinh vật sản xuất (thực vật, vi khuẩn quang hợp — tự dưỡng), sinh vật tiêu thụ (động vật ăn thực vật, động vật ăn thịt), sinh vật phân giải (vi khuẩn, nấm phân hủy xác).\\n\\n' +
      'CHUỖI THỨC ĂN VÀ LƯỚI THỨC ĂN:\\n' +
      '— Chuỗi thức ăn: Dãy các loài sinh vật mà loài trước là thức ăn của loài sau. Có hai loại:\\n' +
      '  + Chuỗi bắt đầu bằng sinh vật sản xuất (cỏ → sâu → ếch → rắn).\\n' +
      '  + Chuỗi bắt đầu bằng mùn bã hữu cơ (detritus → giun đất → chim).\\n' +
      '— Lưới thức ăn: Tổng hợp tất cả các chuỗi thức ăn trong quần xã, phản ánh mối quan hệ ăn-uống phức tạp.\\n' +
      '— Bậc dinh dưỡng (Trophic level): Mức độ trong chuỗi thức ăn (SX → SVTT1 → SVTT2 → SVTT3...). Năng lượng giảm dần từ bậc thấp lên bậc cao (~10% được chuyển sang bậc tiếp theo, 90% mất đi dưới dạng nhiệt).',
    workedExample: {
      problem:
        'Giải thích nguyên lý "kim tự tháp năng lượng" — tại sao kim tự tháp năng lượng luôn có đáy rộng và đỉnh hẹp.',
      steps: [
        'Nhận diện quy luật 10%: Trong mỗi bậc dinh dưỡng, sinh vật chỉ đồng hoá được khoảng 10% năng lượng từ bậc thấp hơn. 90% còn lại bị tiêu hao qua hô hấp tế bào (thải nhiệt), bài tiết, cấu trúc không tiêu hoá được.',
        'Áp dụng: Nếu bậc sản xuất (thực vật) có 10.000 kcal. Bậc tiêu thụ 1 (động vật ăn thực vật) chỉ tích luỹ ~1000 kcal. Bậc tiêu thụ 2 (động vật ăn thịt nhỏ) chỉ ~100 kcal. Bậc tiêu thụ 3 chỉ ~10 kcal.',
        'Kết luận: Năng lượng giảm theo cấp số nhân từ đáy lên đỉnh kim tự tháp, nên luôn cần sinh khối lớn hơn ở bậc thấp hơn để duy trì bậc cao hơn.',
      ],
      answer:
        'Năng lượng giảm ~90% qua mỗi bậc dinh dưỡng (chỉ ~10% chuyển lên bậc trên), nên bậc thấp phải có năng lượng và sinh khối lớn hơn → kim tự tháp đáy rộng đỉnh hẹp.',
    },
    checkQuestions: [
      {
        prompt: 'Trong hệ sinh thái, sinh vật phân giải có vai trò quan trọng nào sau đây?',
        choices: [
          {
            id: 'sv_1',
            label: 'Phân huỷ xác chết và chất thải hữu cơ trả lại chất khoáng cho môi trường',
          },
          { id: 'sv_2', label: 'Tổng hợp chất hữu cơ từ CO₂ và ánh sáng' },
          { id: 'sv_3', label: 'Ăn sinh vật tiêu thụ điều tiết quần thể' },
          { id: 'sv_4', label: 'Cung cấp O₂ cho hệ sinh thái' },
        ],
        answer: { kind: 'choice', correctIds: ['sv_1'] },
        explain:
          'Vi khuẩn và nấm phân huỷ phân giải chất hữu cơ phức tạp thành muối khoáng vô cơ đơn giản trả lại đất và nước, giúp khép kín chu trình tuần hoàn vật chất.',
      },
      {
        prompt:
          'Tỉ lệ năng lượng trung bình được chuyển tiếp từ bậc dinh dưỡng này lên bậc dinh dưỡng tiếp theo trong hệ sinh thái là khoảng:',
        choices: [
          { id: 'nl_1', label: '10%' },
          { id: 'nl_2', label: '50%' },
          { id: 'nl_3', label: '90%' },
          { id: 'nl_4', label: '100%' },
        ],
        answer: { kind: 'choice', correctIds: ['nl_1'] },
        explain:
          'Quy tắc 10% (Lindeman): Chỉ khoảng 10% năng lượng tích luỹ tại mỗi bậc dinh dưỡng được chuyển lên bậc tiếp theo; 90% mất dưới dạng nhiệt và không đồng hoá được.',
      },
    ],
    srsCards: [
      {
        hoi: 'Liệt kê các thành phần chức năng chính của hệ sinh thái?',
        dap: '1. Thành phần vô sinh (ánh sáng, nước, đất, khí...); 2. Sinh vật sản xuất; 3. Sinh vật tiêu thụ; 4. Sinh vật phân giải.',
      },
      {
        hoi: 'Bậc dinh dưỡng (trophic level) là gì?',
        dap: 'Vị trí của sinh vật trong chuỗi thức ăn, xác định bởi số bước cách xa sinh vật sản xuất (bậc 1 = sản xuất, bậc 2 = ăn thực vật, v.v.).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c10-b29',
    grade: '12',
    chapterNumber: 10,
    chapterTitle: 'Hệ sinh thái, sinh quyển và bảo vệ môi trường',
    lessonNumber: 29,
    title: 'Chu trình sinh địa hoá và sinh quyển',
    hook: 'Carbon trong CO₂ bạn thở ra ngày hôm nay có thể đã từng là một phần của cơ thể khủng long 65 triệu năm trước. Đó là nhờ chu trình tuần hoàn vật chất kỳ diệu trong sinh quyển.',
    theory:
      'SINH QUYỂN (Biosphere):\\n' +
      '— Là toàn bộ các hệ sinh thái trên Trái Đất, bao gồm lớp không khí, nước và đất nơi sự sống tồn tại.\\n\\n' +
      'CHU TRÌNH SINH ĐỊA HOÁ (Biogeochemical cycles):\\n' +
      'Là sự tuần hoàn vật chất trong tự nhiên, qua các thành phần hữu sinh và vô sinh của hệ sinh thái.\\n\\n' +
      'CHU TRÌNH CARBON:\\n' +
      '— CO₂ từ khí quyển được thực vật và vi khuẩn quang hợp hấp thụ tổng hợp thành chất hữu cơ (C₆H₁₂O₆).\\n' +
      '— Chất hữu cơ truyền qua chuỗi thức ăn. Sinh vật hô hấp giải phóng CO₂ trở lại khí quyển.\\n' +
      '— Vi sinh vật phân giải xác chết → CO₂.\\n' +
      '— Carbon trong than đá, dầu mỏ (nhiên liệu hoá thạch) bị giữ lại qua hàng triệu năm; đốt cháy nhiên liệu giải phóng CO₂ → tăng hiệu ứng nhà kính.\\n\\n' +
      'CHU TRÌNH NITROGEN:\\n' +
      '— N₂ chiếm 78% khí quyển nhưng hầu hết sinh vật không sử dụng trực tiếp được.\\n' +
      '— Cố định nitrogen: Vi khuẩn cố định đạm (Rhizobium, Azotobacter) chuyển N₂ → NH₃/NH₄⁺ (dạng mà thực vật hấp thụ được) hoặc sét sét → NO₃⁻.\\n' +
      '— Phân giải nitrogen: Vi khuẩn nitrat hoá NH₄⁺ → NO₂⁻ → NO₃⁻ (dạng thực vật ưa). Vi khuẩn phản nitrat hoá NO₃⁻ → N₂ (trả lại khí quyển).\\n\\n' +
      'CHU TRÌNH NƯỚC:\\n' +
      '— Bay hơi (từ biển, đất) → Ngưng tụ (mây) → Mưa → Thấm đất, chảy mặt về biển.',
    workedExample: {
      problem:
        'Giải thích tại sao sự gia tăng đốt nhiên liệu hoá thạch (than đá, dầu mỏ) làm biến đổi khí hậu Trái Đất.',
      steps: [
        'Nhiên liệu hoá thạch là gì: Than đá và dầu mỏ là xác sinh vật cổ đại tích luỹ carbon hữu cơ trong hàng triệu năm, loại carbon này bình thường nằm ngoài chu trình carbon hoạt động.',
        'Hệ quả khi đốt: Đốt cháy nhiên liệu hoá thạch giải phóng lượng lớn CO₂ đã bị "khoá chặt" trong lòng đất trở lại khí quyển rất nhanh (chỉ vài thế kỷ).',
        'Hiệu ứng nhà kính: CO₂ và các khí nhà kính khác (CH₄, N₂O) hấp thụ bức xạ nhiệt Trái Đất phát ra vào vũ trụ → Nhiệt độ Trái Đất tăng → Biến đổi khí hậu, băng tan, nước biển dâng.',
      ],
      answer:
        'Đốt nhiên liệu hoá thạch giải phóng nhanh CO₂ dự trữ hàng triệu năm, tăng hiệu ứng nhà kính gây nóng lên toàn cầu.',
    },
    checkQuestions: [
      {
        prompt:
          'Vi sinh vật nào sau đây thực hiện quá trình "cố định nitrogen" — chuyển N₂ khí quyển thành dạng mà thực vật có thể hấp thụ?',
        choices: [
          { id: 'nk_1', label: 'Vi khuẩn Rhizobium (sống cộng sinh trong nốt sần rễ đậu)' },
          { id: 'nk_2', label: 'Vi khuẩn Nitrobacter (vi khuẩn nitrat hoá)' },
          { id: 'nk_3', label: 'Nấm mốc Aspergillus' },
          { id: 'nk_4', label: 'Vi khuẩn lam sống trong dạ dày trâu bò' },
        ],
        answer: { kind: 'choice', correctIds: ['nk_1'] },
        explain:
          'Rhizobium cộng sinh trong nốt sần rễ họ Đậu có enzyme nitrogenase chuyển N₂ thành NH₃/NH₄⁺ dạng cây đồng hoá được.',
      },
      {
        prompt:
          'Trong chu trình carbon, bể chứa carbon dài hạn lớn nhất hiện nay (ngoài than đá và dầu mỏ) là:',
        choices: [
          { id: 'cc_1', label: 'Đại dương (CO₂ hoà tan và đá vôi CaCO₃)' },
          { id: 'cc_2', label: 'Khí quyển' },
          { id: 'cc_3', label: 'Sinh khối thực vật trên cạn' },
          { id: 'cc_4', label: 'Tế bào vi khuẩn đất' },
        ],
        answer: { kind: 'choice', correctIds: ['cc_1'] },
        explain:
          'Đại dương hấp thụ và lưu trữ lượng CO₂ khổng lồ dưới dạng hòa tan và đá vôi từ vỏ sinh vật biển — bể chứa carbon lớn nhất và quan trọng nhất điều tiết khí hậu.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phân biệt vi khuẩn cố định đạm và vi khuẩn nitrat hoá trong chu trình nitrogen?',
        dap: 'Cố định đạm: chuyển N₂ khí quyển thành NH₃/NH₄⁺. Nitrat hoá: chuyển NH₄⁺ → NO₂⁻ → NO₃⁻ (dạng cây ưa dùng nhất).',
      },
      {
        hoi: 'Tại sao chặt phá rừng đồng thời làm tăng CO₂ trong khí quyển?',
        dap: 'Vì cây rừng là bể chứa carbon sinh học lớn; phá rừng → gỗ phân huỷ hoặc đốt → CO₂ giải phóng vào khí quyển; đồng thời mất khả năng hấp thụ CO₂ của rừng.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'sinh12-c10-b30',
    grade: '12',
    chapterNumber: 10,
    chapterTitle: 'Hệ sinh thái, sinh quyển và bảo vệ môi trường',
    lessonNumber: 30,
    title: 'Bảo vệ đa dạng sinh học và môi trường',
    hook: 'Mỗi ngày, Trái Đất mất đi khoảng 30-150 loài sinh vật do hoạt động của con người. Bảo vệ đa dạng sinh học không chỉ là đạo đức mà còn là điều kiện sống còn của chính chúng ta.',
    theory:
      'ĐA DẠNG SINH HỌC (Biodiversity):\\n' +
      '— Bao gồm: Đa dạng di truyền (genetic diversity), đa dạng loài (species diversity), đa dạng hệ sinh thái (ecosystem diversity).\\n\\n' +
      'NGUYÊN NHÂN MẤT ĐA DẠNG SINH HỌC:\\n' +
      '1. Mất và suy thoái môi trường sống: Phá rừng, chuyển đất ngập nước thành nông nghiệp, đô thị hoá.\\n' +
      '2. Khai thác quá mức: Đánh bắt cá vượt sản lượng bền vững, săn bắt động vật hoang dã.\\n' +
      '3. Ô nhiễm môi trường: Hoá chất nông nghiệp, nhựa đại dương, ô nhiễm không khí.\\n' +
      '4. Loài ngoại lai xâm lấn: Loài nhập khẩu không có thiên địch cạnh tranh đào thải loài bản địa.\\n' +
      '5. Biến đổi khí hậu toàn cầu: Nhiệt độ tăng phá vỡ chu kỳ sinh học, thay đổi phân bố loài.\\n\\n' +
      'BIỆN PHÁP BẢO VỆ ĐA DẠNG SINH HỌC:\\n' +
      '1. Bảo tồn tại chỗ (In-situ): Thành lập các khu bảo tồn thiên nhiên, vườn quốc gia, hành lang sinh thái.\\n' +
      '2. Bảo tồn chuyển chỗ (Ex-situ): Vườn thú, ngân hàng gene, vườn thực vật, nuôi nhân tạo ngoài môi trường tự nhiên.\\n' +
      '3. Pháp luật và chính sách: Công ước CITES về buôn bán quốc tế động thực vật hoang dã nguy cấp.\\n' +
      '4. Phát triển bền vững: Khai thác tài nguyên không vượt khả năng tự phục hồi của hệ sinh thái.',
    workedExample: {
      problem:
        'Giải thích tại sao việc bảo vệ một loài chủ chốt (keystone species) như rái cá biển có thể bảo tồn toàn bộ hệ sinh thái rạn tảo bẹ.',
      steps: [
        'Xác định chuỗi quan hệ sinh thái: Rái cá biển ăn nhím biển; nhím biển ăn tảo bẹ kelp.',
        'Phân tích khi mất rái cá: Nếu không có rái cá, quần thể nhím biển bùng nổ số lượng; nhím biển ăn hết tảo bẹ làm rừng tảo bẹ biến mất.',
        'Hệ quả dây chuyền: Rừng tảo bẹ là nơi ở và nguồn thức ăn của hàng trăm loài sinh vật biển khác → toàn bộ hệ sinh thái ven biển sụp đổ.',
        'Kết luận: Bảo vệ một loài chủ chốt duy trì sự cân bằng toàn bộ mạng lưới thức ăn.',
      ],
      answer:
        'Rái cá kiểm soát nhím biển → nhím không ăn hết tảo bẹ → rừng tảo bẹ duy trì → toàn bộ hệ sinh thái ven biển được bảo tồn.',
    },
    checkQuestions: [
      {
        prompt: 'Phương pháp bảo tồn "in-situ" (tại chỗ) có nghĩa là:',
        choices: [
          {
            id: 'bt_1',
            label:
              'Bảo vệ sinh vật ngay trong môi trường sống tự nhiên của chúng (vườn quốc gia, khu bảo tồn)',
          },
          { id: 'bt_2', label: 'Nuôi giữ sinh vật trong vườn thú hoặc phòng thí nghiệm' },
          { id: 'bt_3', label: 'Đông lạnh gene trong ngân hàng gene' },
          { id: 'bt_4', label: 'Di chuyển sinh vật sang nơi sống mới an toàn hơn' },
        ],
        answer: { kind: 'choice', correctIds: ['bt_1'] },
        explain:
          'In-situ conservation (bảo tồn tại chỗ) là giữ nguyên môi trường sống tự nhiên, để sinh vật tự sinh sống, sinh sản và tiến hoá — phương pháp hiệu quả nhất.',
      },
      {
        prompt: 'Nguyên nhân nào được coi là tác nhân lớn nhất gây mất đa dạng sinh học hiện nay?',
        choices: [
          { id: 'nt_1', label: 'Phá huỷ và thu hẹp môi trường sống do con người' },
          { id: 'nt_2', label: 'Dịch bệnh tự nhiên của sinh vật hoang dã' },
          { id: 'nt_3', label: 'Tiến hoá tự nhiên dẫn đến tuyệt chủng' },
          { id: 'nt_4', label: 'Thiên tai (động đất, núi lửa)' },
        ],
        answer: { kind: 'choice', correctIds: ['nt_1'] },
        explain:
          'Phá rừng, đô thị hoá và chuyển đổi sử dụng đất là nguyên nhân số một gây mất nơi ở và tuyệt chủng loài theo IUCN.',
      },
    ],
    srsCards: [
      {
        hoi: 'Ba cấp độ đa dạng sinh học?',
        dap: '1. Đa dạng di truyền; 2. Đa dạng loài; 3. Đa dạng hệ sinh thái.',
      },
      {
        hoi: 'CITES là gì?',
        dap: 'Công ước quốc tế về buôn bán các loài động thực vật hoang dã nguy cấp, hạn chế/cấm buôn bán các loài bị đe doạ tuyệt chủng.',
      },
    ],
    reviewStatus: 'draft',
  },
]
