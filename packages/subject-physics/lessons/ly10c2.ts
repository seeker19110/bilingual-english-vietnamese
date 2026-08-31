// lessons/ly10c2.ts — Vật lí 10, Chương 2: Động học (9 bài).
import type { PhysicsLesson } from '../lessonTypes.js'

export const LY10_C2_LESSONS: PhysicsLesson[] = [
  {
    id: 'ly10-c2-b4',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 4,
    title: 'Độ dịch chuyển và quãng đường đi được',
    hook:
      'Nếu bạn đi bộ 3 km về phía Đông rồi quay lại 3 km về phía Tây, tổng quãng đường bạn đi là 6 km, nhưng độ dịch chuyển của bạn lại bằng 0. ' +
      'Tại sao lại có sự khác biệt thú vị này?',
    theory:
      'HỆ QUY CHIẾU VÀ TỌA ĐỘ:\\n' +
      '— Để xác định vị trí của vật, ta cần chọn một vật làm mốc, hệ trục toạ độ gắn với vật mốc, mốc thời gian và một đồng hồ (hệ quy chiếu).\\n' +
      '— Vị trí vật tại một thời điểm được xác định bởi toạ độ (x, y).\\n\\n' +
      'QUÃNG ĐƯỜNG VÀ ĐỘ DỊCH CHUYỂN:\\n' +
      '— Quãng đường đi được (s): Độ dài tuyến đường vật đi qua. Là đại lượng vô hướng luôn không âm (s ≥ 0).\\n' +
      '— Độ dịch chuyển (d): Là một đại lượng vectơ biểu diễn sự thay đổi vị trí của vật. Vectơ độ dịch chuyển bắt đầu từ vị trí đầu và hướng thẳng tới vị trí cuối.\\n' +
      '  — Độ lớn của độ dịch chuyển bằng khoảng cách giữa vị trí đầu và vị trí cuối.\\n' +
      '  — Hướng: Hướng từ vị trí đầu đến vị trí cuối.\\n' +
      '— Mối liên hệ: Khi vật chuyển động thẳng và không đổi chiều, độ lớn độ dịch chuyển bằng quãng đường (d = s). Khi vật đổi chiều chuyển động, quãng đường luôn lớn hơn độ lớn độ dịch chuyển (s > d).',
    workedExample: {
      problem:
        'Một người đi xe đạp từ điểm A đến điểm B cách nhau 4 km về hướng Bắc, sau đó rẽ phải đi tiếp 3 km về hướng Đông đến điểm C. ' +
        'Tính quãng đường đi được và độ lớn độ dịch chuyển của người này.',
      steps: [
        'Bước 1: Tính quãng đường s = AB + BC = 4 + 3 = 7 (km).',
        'Bước 2: Vẽ sơ đồ chuyển động. Điểm A đến B (hướng Bắc), B đến C (hướng Đông) tạo thành tam giác vuông tại B.',
        'Bước 3: Độ dịch chuyển d là vectơ AC. Độ lớn d = AC = √(AB² + BC²) = √(4² + 3²) = √25 = 5 (km).',
      ],
      answer: 'Quãng đường: 7 km; Độ dịch chuyển: 5 km.',
    },
    checkQuestions: [
      {
        prompt:
          'Một vận động viên chạy 1 vòng quanh sân vận động hình tròn bán kính 50 m rồi trở về vạch xuất phát. Tính độ lớn độ dịch chuyển của vận động viên.',
        choices: [
          { id: 'zero', label: '0 m' },
          { id: 'tram', label: '100 m' },
          { id: 'chu_vi', label: '314 m' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['zero'],
        },
        explain:
          'Vì điểm đầu và điểm cuối trùng nhau nên khoảng cách giữa chúng bằng 0, dẫn đến độ dịch chuyển bằng 0.',
      },
      {
        prompt:
          'Một chiếc ô tô đi chuyển 10 km về phía Đông, sau đó quay lại đi 4 km về phía Tây. Tính độ lớn độ dịch chuyển của ô tô.',
        choices: [
          { id: 'sau', label: '6 km' },
          { id: 'muoi_bon', label: '14 km' },
          { id: 'tuy_y', label: '10 km' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['sau'],
        },
        explain: 'Chọn chiều dương hướng Đông. Độ dịch chuyển d = 10 - 4 = 6 km.',
      },
    ],
    srsCards: [
      {
        hoi: 'Độ dịch chuyển khác quãng đường đi được ở điểm cốt lõi nào?',
        dap: 'Độ dịch chuyển là vectơ có hướng, còn quãng đường là đại lượng vô hướng.',
      },
      {
        hoi: 'Khi nào độ lớn của độ dịch chuyển bằng quãng đường đi được?',
        dap: 'Khi vật chuyển động thẳng và không đổi chiều.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b5',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 5,
    title: 'Tốc độ và vận tốc',
    hook:
      'Đồng hồ tốc độ trên xe máy chỉ cho bạn biết xe chạy nhanh hay chậm (tốc độ). Nhưng để lái phi cơ an toàn, ' +
      'phi công cần biết thêm hướng chuyển động của gió và máy bay (vận tốc). Sự khác nhau giữa chúng là gì?',
    theory:
      'TỐC ĐỘ (SPEED):\\n' +
      '— Tốc độ trung bình: v_tb = s / t. Đặc trưng cho mức độ nhanh hay chậm của chuyển động trên cả quãng đường.\\n' +
      '— Tốc độ tức thời: Tốc độ tại một thời điểm xác định (chỉ số trên tốc kế).\\n\\n' +
      'VẬN TỐC (VELOCITY):\\n' +
      '— Vận tốc trung bình (v): Là đại lượng vectơ xác định bằng thương số giữa độ dịch chuyển của vật và thời gian dịch chuyển.\\n' +
      '  — Công thức: v = d / t (dạng độ lớn trên trục thẳng) hoặc vectơ v = vectơ d / t.\\n' +
      '  — Hướng của vận tốc trùng với hướng của độ dịch chuyển.\\n\\n' +
      'CÔNG THỨC CỘNG VẬN TỐC (RELATIVE VELOCITY):\\n' +
      '— Nếu một vật tham gia đồng thời hai chuyển động thì vận tốc tuyệt đối (vật so với hệ quy chiếu đứng yên 1-3) bằng tổng vectơ của vận tốc tương đối (vật so với hệ quy chiếu chuyển động 1-2) và vận tốc kéo theo (hệ quy chiếu chuyển động so với hệ quy chiếu đứng yên 2-3):\\n' +
      '  — Vectơ v₁₃ = vectơ v₁₂ + vectơ v₂₃.\\n' +
      '  — Cùng chiều: v₁₃ = v₁₂ + v₂₃. Ngược chiều: v₁₃ = |v₁₂ - v₂₃|.',
    workedExample: {
      problem:
        'Một con thuyền đi xuôi dòng với vận tốc 4 m/s so với dòng nước. Dòng nước chảy với vận tốc 1,5 m/s so với bờ. ' +
        'Tính vận tốc của con thuyền so với bờ khi thuyền đi xuôi dòng và ngược dòng.',
      steps: [
        'Gọi thuyền là vật (1), nước là hệ quy chiếu chuyển động (2), bờ là hệ quy chiếu đứng yên (3).',
        'Vận tốc của thuyền so với nước: v₁₂ = 4 m/s. Vận tốc của nước so với bờ: v₂₃ = 1,5 m/s.',
        'Khi thuyền đi xuôi dòng, vectơ v₁₂ cùng chiều với vectơ v₂₃: v₁₃ = v₁₂ + v₂₃ = 4 + 1,5 = 5,5 (m/s).',
        'Khi thuyền đi ngược dòng, vectơ v₁₂ ngược chiều với vectơ v₂₃: v₁₃ = v₁₂ - v₂₃ = 4 - 1,5 = 2,5 (m/s).',
      ],
      answer: 'Xuôi dòng: 5,5 m/s; Ngược dòng: 2,5 m/s.',
    },
    checkQuestions: [
      {
        prompt: 'Vận tốc khác tốc độ ở điểm đặc trưng nào?',
        choices: [
          { id: 'khong_khac', label: 'Không có điểm gì khác nhau' },
          { id: 'huong', label: 'Vận tốc là đại lượng vectơ có hướng, tốc độ là vô hướng' },
          { id: 'don_vi', label: 'Vận tốc đo bằng m/s, tốc độ đo bằng km/h' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['huong'],
        },
        explain:
          'Vận tốc mô tả cả độ nhanh chậm và hướng chuyển động của vật, trong khi tốc độ chỉ mô tả độ nhanh chậm.',
      },
      {
        prompt:
          'Một người bơi xuôi dòng sông với tốc độ 2 m/s so với dòng nước. Dòng sông chảy với tốc độ 0,5 m/s so với bờ. Tính tốc độ của người đó so với bờ.',
        answer: {
          kind: 'numeric',
          value: 2.5,
          unit: 'm/s',
        },
        explain: 'Bơi xuôi dòng nên vận tốc cộng lại: v = 2 + 0.5 = 2.5 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo chuẩn của vận tốc trong hệ SI là gì?',
        dap: 'Mét trên giây (m/s).',
      },
      {
        hoi: 'Phát biểu công thức cộng vận tốc dạng vectơ?',
        dap: 'Vectơ v₁₃ = vectơ v₁₂ + vectơ v₂₃.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b6',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 6,
    title: 'Thực hành: Đo tốc độ của vật chuyển động',
    hook:
      'Làm thế nào các thiết bị bắn tốc độ của cảnh sát giao thông biết chính xác xe bạn đang chạy quá tốc độ? ' +
      'Hãy học cách tự thiết lập phép đo tốc độ chính xác trong phòng thực hành.',
    theory:
      'PHƯƠNG PHÁP ĐO TỐC ĐỘ THƯỜNG DÙNG:\\n' +
      '— Sử dụng thước và đồng hồ bấm giây (đo thủ công): Sai số lớn do phản xạ bấm nút của con người (~0,1s đến 0,2s).\\n' +
      '— Sử dụng cổng quang điện và đồng hồ đo thời gian hiện số (đo tự động):\\n' +
      '  — Khi vật chắn cổng quang điện thứ nhất, đồng hồ bắt đầu chạy. Khi vật chắn cổng thứ hai, đồng hồ dừng.\\n' +
      '  — Tốc độ trung bình: v = s / t với s là khoảng cách giữa 2 cổng quang, t là thời gian hiển thị trên đồng hồ.\\n' +
      '— Sử dụng cảm biến chuyển động (sonar hoặc laser) nối với máy tính để ghi lại đồ thị độ dịch chuyển tự động.\\n\\n' +
      'SAI SỐ TRONG THỰC HÀNH:\\n' +
      '— Sai số ngẫu nhiên: Do vị trí thả vật lệch, luồng gió nhẹ, hoặc bấm nút lệch thời gian.\\n' +
      '— Sai số dụng cụ: Lấy theo độ chia nhỏ nhất của thước đo và độ nhạy của đồng hồ đo.',
    workedExample: {
      problem:
        'Trong thí nghiệm đo tốc độ của xe đồ chơi bằng cổng quang điện, khoảng cách giữa 2 cổng quang đo được là s = 0,80 m. ' +
        'Thời gian xe đi qua khoảng cách này hiển thị trên đồng hồ là t = 0,40s. Tính tốc độ trung bình của xe.',
      steps: [
        'Xác định quãng đường đi được s = 0,80 m.',
        'Xác định khoảng thời gian t = 0,40 s.',
        'Áp dụng công thức v = s / t = 0,80 / 0,40 = 2,0 (m/s).',
      ],
      answer: 'v = 2 m/s',
    },
    checkQuestions: [
      {
        prompt:
          'Thiết bị nào trong phòng thực hành giúp đo thời gian chuyển động của xe sắt đi qua một khoảng cách một cách tự động và chính xác cao?',
        choices: [
          { id: 'stopwatch', label: 'Đồng hồ bấm giây cầm tay' },
          { id: 'gate', label: 'Cổng quang điện kết hợp đồng hồ đo hiện số' },
          { id: 'ruler', label: 'Thước cuộn tự động' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['gate'],
        },
        explain:
          'Cổng quang điện kích hoạt và ngắt bộ đếm thời gian bằng chùm sáng bị chặn, loại bỏ hoàn toàn sai số do phản xạ người bấm.',
      },
      {
        prompt:
          'Khoảng cách giữa hai cổng quang điện là 0,5 m. Đồng hồ đo được thời gian xe đi qua là 0,2 s. Tính tốc độ của xe.',
        answer: {
          kind: 'numeric',
          value: 2.5,
          unit: 'm/s',
        },
        explain: 'Tốc độ v = s / t = 0,5 / 0,2 = 2,5 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Tại sao đo tốc độ bằng đồng hồ bấm giây bằng tay lại có sai số lớn?',
        dap: 'Do sai số phản xạ thần kinh của người bấm nút khi bắt đầu và kết thúc phép đo.',
      },
      {
        hoi: 'Công thức tính tốc độ trung bình của xe chạy qua hai cổng quang là gì?',
        dap: 'v = s / t (s là khoảng cách giữa 2 cổng quang, t là thời gian chuyển động).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b7',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 7,
    title: 'Đồ thị độ dịch chuyển – thời gian',
    hook:
      'Một đồ thị đơn giản có thể vẽ nên toàn bộ hành trình của một chiếc tàu hoả. Nhìn vào đồ thị độ dịch chuyển - thời gian, ' +
      'ta không chỉ biết tàu đang đi đâu, mà còn biết tàu chạy nhanh thế nào hay đang dừng nghỉ.',
    theory:
      'ĐỒ THỊ ĐỘ DỊCH CHUYỂN — THỜI GIAN (d-t):\\n' +
      '— Trục đứng (tung độ) biểu diễn độ dịch chuyển d. Trục ngang (hoành độ) biểu diễn thời gian t.\\n\\n' +
      'Ý NGHĨA CỦA ĐỒ THỊ d-t:\\n' +
      '— Đường thẳng nằm ngang (song song với trục t): Độ dịch chuyển không đổi theo thời gian → Vật đứng yên (v = 0).\\n' +
      '— Đường thẳng dốc lên: Độ dịch chuyển tăng đều theo thời gian → Vật chuyển động thẳng đều theo chiều dương (v > 0).\\n' +
      '— Đường thẳng dốc xuống: Độ dịch chuyển giảm đều theo thời gian → Vật chuyển động thẳng đều ngược chiều dương (v < 0).\\n' +
      '— Độ dốc (slope / hệ số góc) của đồ thị d-t chính là vận tốc của chuyển động:\\n' +
      '  — Hệ số góc: v = Δd / Δt = (d₂ - d₁) / (t₂ - t₁).',
    workedExample: {
      problem:
        'Một vật chuyển động thẳng đều có đồ thị d-t là một đường thẳng đi qua hai điểm: điểm đầu (t₁ = 0s; d₁ = 2 m) ' +
        'và điểm sau (t₂ = 4s; d₂ = 10 m). Tính vận tốc của vật.',
      steps: [
        'Xác định độ thay đổi độ dịch chuyển: Δd = d₂ - d₁ = 10 - 2 = 8 m.',
        'Xác định thời gian dịch chuyển tương ứng: Δt = t₂ - t₁ = 4 - 0 = 4 s.',
        'Tính hệ số góc của đồ thị d-t để tìm vận tốc: v = Δd / Δt = 8 / 4 = 2 (m/s).',
      ],
      answer: 'v = 2 m/s',
    },
    checkQuestions: [
      {
        prompt:
          'Độ dốc (slope) của đồ thị độ dịch chuyển — thời gian (d-t) của một chuyển động thẳng cho biết đại lượng nào?',
        choices: [
          { id: 'gia_toc', label: 'Gia tốc của chuyển động' },
          { id: 'van_toc', label: 'Vận tốc của chuyển động' },
          { id: 'quang_duong', label: 'Quãng đường đi được' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['van_toc'],
        },
        explain: 'Hệ số góc slope = Δd/Δt chính là định nghĩa của vận tốc trung bình.',
      },
      {
        prompt:
          'Đồ thị d-t của một vật là một đường thẳng nằm ngang song song với trục thời gian. Điều này cho biết vật đang ở trạng thái nào?',
        choices: [
          { id: 'dung_yen', label: 'Vật đứng yên' },
          { id: 'nhanh_dan', label: 'Vật chuyển động nhanh dần' },
          { id: 'cham_dan', label: 'Vật chuyển động chậm dần' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dung_yen'],
        },
        explain:
          'Đường nằm ngang có nghĩa là độ dịch chuyển d không đổi khi t tăng lên, tức là vật đứng yên.',
      },
    ],
    srsCards: [
      {
        hoi: 'Độ dốc của đồ thị d-t âm (đường dốc xuống) nghĩa là gì?',
        dap: 'Vật đang chuyển động thẳng đều ngược chiều dương đã chọn.',
      },
      {
        hoi: 'Công thức tìm vận tốc dựa vào toạ độ hai điểm trên đồ thị d-t?',
        dap: 'v = (d₂ - d₁) / (t₂ - t₁).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b8',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 8,
    title: 'Chuyển động biến đổi. Gia tốc',
    hook:
      'Một chiếc siêu xe thể thao có thể tăng tốc từ 0 lên 100 km/h chỉ trong 2,5 giây. Đại lượng nào đo lường ' +
      'mức độ thay đổi vận tốc nhanh hay chậm của chiếc xe đó?',
    theory:
      'KHÁI NIỆM CHUYỂN ĐỘNG BIẾN ĐỔI:\\n' +
      '— Chuyển động biến đổi là chuyển động có vận tốc thay đổi theo thời gian.\\n\\n' +
      'GIA TỐC (ACCELERATION):\\n' +
      '— Gia tốc là đại lượng vectơ đặc trưng cho sự thay đổi nhanh hay chậm của vận tốc theo thời gian.\\n' +
      '— Công thức tính gia tốc trung bình:\\n' +
      '  — a = Δv / Δt = (v_t - v_o) / t (dạng đại số trên trục chuyển động thẳng).\\n' +
      '  — Dạng vectơ: vectơ a = (vectơ v_t - vectơ v_o) / Δt.\\n' +
      '— Đơn vị đo trong hệ SI: Mét trên giây bình phương (m/s²).\\n\\n' +
      'TÍNH CHẤT CHUYỂN ĐỘNG THẲNG BIẾN ĐỔI:\\n' +
      '— Chuyển động thẳng nhanh dần: Vectơ vận tốc và vectơ gia tốc cùng chiều (a và v cùng dấu: a.v > 0).\\n' +
      '— Chuyển động thẳng chậm dần: Vectơ vận tốc và vectơ gia tốc ngược chiều (a và v trái dấu: a.v < 0).',
    workedExample: {
      problem:
        'Một ô tô đang chạy thẳng đều với vận tốc 10 m/s thì tăng tốc đều, sau 5s đạt vận tốc 25 m/s. ' +
        'Tính gia tốc của xe.',
      steps: [
        'Xác định vận tốc ban đầu v_o = 10 m/s.',
        'Xác định vận tốc thời điểm t: v_t = 25 m/s.',
        'Xác định thời gian thay đổi vận tốc: Δt = 5 s.',
        'Áp dụng công thức a = (v_t - v_o) / Δt = (25 - 10) / 5 = 15 / 5 = 3 (m/s²).',
      ],
      answer: 'a = 3 m/s²',
    },
    checkQuestions: [
      {
        prompt:
          'Một đoàn tàu đang đi vào ga với vận tốc 20 m/s thì hãm phanh chuyển động chậm dần đều. Sau 3s vận tốc tàu còn 5 m/s. Tính gia tốc của tàu.',
        answer: {
          kind: 'numeric',
          value: -5,
          unit: 'm/s^2',
        },
        explain: 'Gia tốc a = (v_t - v_o) / t = (5 - 20) / 3 = -15 / 3 = -5 m/s².',
      },
      {
        prompt:
          'Trong chuyển động thẳng nhanh dần đều, mối quan hệ về chiều (hoặc dấu) giữa vectơ gia tốc (a) và vectơ vận tốc (v) là gì?',
        choices: [
          { id: 'cung_chieu', label: 'Vectơ gia tốc và vectơ vận tốc cùng chiều (a.v > 0)' },
          { id: 'nguoc_chieu', label: 'Vectơ gia tốc và vectơ vận tốc ngược chiều (a.v < 0)' },
          { id: 'vuong_goc', label: 'Vectơ gia tốc vuông góc với vectơ vận tốc' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['cung_chieu'],
        },
        explain:
          'Chuyển động nhanh dần khi gia tốc cùng hướng với vận tốc để đẩy nhanh vận tốc vật.',
      },
    ],
    srsCards: [
      {
        hoi: 'Đơn vị đo gia tốc trong hệ SI là gì?',
        dap: 'Mét trên giây bình phương (m/s²).',
      },
      {
        hoi: 'Khi nào chuyển động thẳng là chậm dần đều?',
        dap: 'Khi gia tốc ngược chiều với vận tốc (a.v < 0).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b9',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 9,
    title: 'Chuyển động thẳng biến đổi đều',
    hook:
      'Khi một đoàn tàu phanh lại hoặc một chiếc phi cơ cất cánh trên đường băng, vận tốc của chúng tăng hoặc giảm đều đặn. ' +
      'Đây là chuyển động thẳng biến đổi đều — nền tảng của mọi bài toán cơ học động lực.',
    theory:
      'ĐỊNH NGHĨA CHUYỂN ĐỘNG THẲNG BIẾN ĐỔI ĐỀU:\\n' +
      '— Chuyển động thẳng có gia tốc không đổi theo thời gian (a = hằng số).\\n\\n' +
      'HỆ PHƯƠNG TRÌNH CHUYỂN ĐỘNG THẲNG BIẾN ĐỔI ĐỀU (Chọn gốc toạ độ trùng vị trí đầu, chiều dương là chiều chuyển động):\\n' +
      '1. Phương trình vận tốc: v = v_o + a.t.\\n' +
      '2. Phương trình độ dịch chuyển: d = v_o.t + 0,5.a.t².\\n' +
      '3. Công thức liên hệ không phụ thuộc thời gian: v² - v_o² = 2.a.d.',
    workedExample: {
      problem:
        'Một người đi xe máy đang chạy với vận tốc 10 m/s thì tắt máy hãm phanh chuyển động chậm dần đều với gia tốc có độ lớn 2 m/s². ' +
        'Tính quãng đường xe đi được từ lúc phanh đến khi dừng hẳn.',
      steps: [
        'Chọn chiều dương là chiều chuyển động. Vận tốc ban đầu v_o = 10 m/s.',
        'Xe chuyển động chậm dần đều nên gia tốc ngược chiều vận tốc: a = -2 m/s².',
        'Vật dừng hẳn: v = 0.',
        'Sử dụng công thức liên hệ v² - v_o² = 2.a.d => 0² - 10² = 2 * (-2) * d.',
        '-100 = -4.d => d = 25 (m).',
        'Vì xe đi thẳng không đổi chiều nên quãng đường s = d = 25 m.',
      ],
      answer: 's = 25 m',
    },
    checkQuestions: [
      {
        prompt:
          'Viết công thức liên hệ giữa vận tốc ban đầu (v_o), vận tốc sau (v), gia tốc (a) và độ dịch chuyển (d) trong chuyển động thẳng biến đổi đều.',
        choices: [
          { id: 'ct_1', label: 'v² - v_o² = 2.a.d' },
          { id: 'ct_2', label: 'v - v_o = a.d' },
          { id: 'ct_3', label: 'v² + v_o² = 2.a.d' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['ct_1'],
        },
        explain:
          'Công thức độc lập thời gian v² - v_o² = 2.a.d rút ra từ t = (v - v_o)/a thay vào phương trình độ dịch chuyển.',
      },
      {
        prompt:
          'Một xe đạp bắt đầu chuyển động từ trạng thái nghỉ (v_o = 0) và tăng tốc đều với gia tốc 2 m/s². Tính độ dịch chuyển của xe sau khi đi được 5 s.',
        answer: {
          kind: 'numeric',
          value: 25,
          unit: 'm',
        },
        explain: 'Áp dụng công thức d = v_o.t + 0.5.a.t² = 0 * 5 + 0.5 * 2 * 5² = 25 m.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết công thức tính vận tốc của vật tại thời điểm t trong chuyển động thẳng biến đổi đều?',
        dap: 'v = v_o + a.t.',
      },
      {
        hoi: 'Viết phương trình độ dịch chuyển d theo v_o, a và t?',
        dap: 'd = v_o.t + 0,5.a.t².',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b10',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 10,
    title: 'Sự rơi tự do',
    hook:
      'Nếu thả rơi một chiếc lá và một quả cân trong không khí, quả cân sẽ chạm đất trước. Nhưng nếu hút hết không khí ra để tạo chân không, ' +
      'cả hai sẽ rơi nhanh như nhau và chạm đất cùng lúc. Chuyển động kì diệu đó gọi là sự rơi tự do.',
    theory:
      'ĐỊNH NGHĨA SỰ RƠI TỰ DO:\\n' +
      '— Sự rơi tự do là sự rơi của các vật chỉ dưới tác dụng của trọng lực (bỏ qua sức cản của không khí).\\n\\n' +
      'ĐẶC ĐIỂM CỦA CHUYỂN ĐỘNG RƠI TỰ DO:\\n' +
      '— Phương: Thẳng đứng. Chiều: Từ trên xuống dưới.\\n' +
      '— Tính chất: Chuyển động thẳng nhanh dần đều không vận tốc đầu (v_o = 0).\\n\\n' +
      'GIA TỐC RƠI TỰ DO (g):\\n' +
      '— Tại một nơi xác định trên Trái Đất và ở gần mặt đất, mọi vật đều rơi tự do với cùng một gia tốc g.\\n' +
      '— Thường lấy g ≈ 9,8 m/s² hoặc g ≈ 10 m/s².\\n\\n' +
      'CÁC CÔNG THỨC RƠI TỰ DO (Chọn chiều dương hướng xuống, gốc tại điểm thả):\\n' +
      '1. Vận tốc tại thời điểm t: v = g.t.\\n' +
      '2. Quãng đường (độ cao rơi) sau thời gian t: h = 0,5.g.t².\\n' +
      '3. Vận tốc liên hệ với quãng đường: v² = 2.g.h hay v = √(2.g.h).',
    workedExample: {
      problem:
        'Một vật được thả rơi tự do từ độ cao h = 45 m xuống đất. Lấy g = 10 m/s². Tính thời gian rơi ' +
        'và vận tốc của vật khi chạm đất.',
      steps: [
        'Xác định độ cao rơi h = 45 m, gia tốc g = 10 m/s².',
        'Áp dụng công thức h = 0,5.g.t² => 45 = 0,5 * 10 * t² => 45 = 5 * t².',
        't² = 9 => t = 3 (s).',
        'Tính vận tốc chạm đất: v = g.t = 10 * 3 = 30 (m/s) hoặc dùng v = √(2.g.h) = √(2 * 10 * 45) = √900 = 30 (m/s).',
      ],
      answer: 'Thời gian rơi: 3s; Vận tốc chạm đất: 30 m/s.',
    },
    checkQuestions: [
      {
        prompt: 'Thế nào là sự rơi tự do?',
        choices: [
          { id: 'dinh_nghia', label: 'Sự rơi của các vật chỉ chịu tác dụng của trọng lực' },
          { id: 'suc_can', label: 'Sự rơi của các vật trong bầu khí quyển chịu sức cản lớn' },
          { id: 'tuy_y', label: 'Mọi chuyển động hướng từ trên xuống dưới' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['dinh_nghia'],
        },
        explain:
          'Sự rơi tự do bỏ qua hoàn toàn sức cản không khí, vật chỉ chịu lực hút Trái Đất (trọng lực).',
      },
      {
        prompt:
          'Thả một vật rơi tự do không vận tốc đầu từ độ cao h. Sau 2s vật chạm đất. Lấy g = 10 m/s². Tính vận tốc chạm đất của vật.',
        answer: {
          kind: 'numeric',
          value: 20,
          unit: 'm/s',
        },
        explain: 'Vận tốc chạm đất v = g.t = 10 * 2 = 20 m/s.',
      },
    ],
    srsCards: [
      {
        hoi: 'Phương và chiều của chuyển động rơi tự do là gì?',
        dap: 'Phương thẳng đứng, chiều từ trên xuống dưới.',
      },
      {
        hoi: 'Viết công thức liên hệ giữa vận tốc v và độ cao h của vật rơi tự do?',
        dap: 'v = √(2.g.h).',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b11',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 11,
    title: 'Thực hành: Đo gia tốc rơi tự do',
    hook:
      'Giá trị g = 9,8 m/s² được ghi trong sách giáo khoa từ đâu mà có? Hãy tự mình thực hành và tính toán ' +
      'hằng số vũ trụ này ngay tại phòng thí nghiệm trường học.',
    theory:
      'NGUYÊN TẮC ĐO GIA TỐC RƠI TỰ DO:\\n' +
      '— Một quả cầu kim loại được giữ trên cao bằng nam châm điện.\\n' +
      '— Khi ngắt điện, nam châm nhả quả cầu rơi tự do, đồng hồ hiện số bắt đầu đo thời gian.\\n' +
      '— Quả cầu đi qua cổng quang điện đặt ở khoảng cách h phía dưới, đồng hồ dừng đếm thời gian t.\\n' +
      '— Từ công thức h = 0,5.g.t² ta suy ra gia tốc rơi tự do thực nghiệm: g = 2.h / t².\\n\\n' +
      'HẠN CHẾ SAI SỐ TRONG THÍ NGHIỆM:\\n' +
      '— Dùng quả cầu sắt nhỏ, khối lượng riêng lớn để giảm thiểu tác dụng sức cản không khí.\\n' +
      '— Đo thời gian t nhiều lần tại mỗi độ cao h để lấy giá trị trung bình, giảm sai số ngẫu nhiên.' +
      '— Vẽ đồ thị h theo t² để tìm g từ hệ số góc của đồ thị.',
    workedExample: {
      problem:
        'Trong thí nghiệm đo gia tốc rơi tự do, học sinh đo khoảng cách rơi h = 0,80 m. ' +
        'Thời gian rơi đo được trên đồng hồ hiện số là t = 0,40s. Tính gia tốc g thực nghiệm.',
      steps: [
        'Xác định độ cao rơi h = 0,80 m.',
        'Xác định thời gian rơi t = 0,40 s.',
        'Áp dụng công thức thực nghiệm g = 2.h / t² = (2 * 0,80) / 0,40².',
        'g = 1,60 / 0,16 = 10,0 (m/s²).',
      ],
      answer: 'g = 10 m/s²',
    },
    checkQuestions: [
      {
        prompt:
          'Để đo gia tốc rơi tự do g trực tiếp trong phòng thực hành, ta cần thu thập số liệu của hai đại lượng trực tiếp nào?',
        choices: [
          { id: 'khoang_thoi', label: 'Quãng đường rơi h và thời gian rơi t' },
          { id: 'khoi_luong', label: 'Khối lượng quả cầu m và thời gian t' },
          { id: 'chu_vi', label: 'Chu vi quả cầu và chiều dài máng đỡ' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['khoang_thoi'],
        },
        explain:
          'Sử dụng công thức g = 2h/t² nên bắt buộc phải đo trực tiếp quãng đường rơi h và thời gian rơi t.',
      },
      {
        prompt:
          'Tại sao trong thí nghiệm đo gia tốc rơi tự do g người ta dùng một quả cầu thép nhỏ mà không dùng một quả cầu nhựa có cùng kích thước?',
        choices: [
          { id: 'thep_nhua', label: 'Để giảm thiểu ảnh hưởng của sức cản không khí lên quả cầu' },
          { id: 'giat_dien', label: 'Quả cầu nhựa dễ bị giật điện hơn' },
          { id: 'mau_sac', label: 'Quả cầu thép có màu sắc sáng hơn giúp mắt nhìn rõ hơn' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['thep_nhua'],
        },
        explain:
          'Quả cầu thép có khối lượng riêng lớn hơn nhựa nhiều lần, do đó trọng lực lớn hơn sức cản không khí rất nhiều, giúp chuyển động sát với rơi tự do hơn.',
      },
    ],
    srsCards: [
      {
        hoi: 'Viết công thức tính gia tốc rơi tự do g từ phép đo thực hành h và t?',
        dap: 'g = 2.h / t².',
      },
      {
        hoi: 'Bộ phận nào nhả quả cầu kim loại đồng bộ với việc bật đồng hồ đo thời gian?',
        dap: 'Nam châm điện.',
      },
    ],
    reviewStatus: 'draft',
  },
  {
    id: 'ly10-c2-b12',
    grade: '10',
    chapterNumber: 2,
    chapterTitle: 'Động học',
    lessonNumber: 12,
    title: 'Chuyển động ném',
    hook:
      'Khi một cầu thủ sút bóng bổng hoặc một phi cơ thả hàng cứu trợ, quỹ đạo bay của vật đều là một đường cong tuyệt đẹp. ' +
      'Làm thế nào để tính toán điểm rơi chính xác của vật ném?',
    theory:
      'CHUYỂN ĐỘNG NÉM NGANG (Chọn hệ trục Ox nằm ngang theo hướng ném, Oy thẳng đứng hướng xuống, gốc tại điểm ném):\\n' +
      '— Phương trình chuyển động:\\n' +
      '  — Theo trục Ox: Vật không chịu lực cản → Chuyển động thẳng đều: a_x = 0, v_x = v_o, x = v_o.t.\\n' +
      '  — Theo trục Oy: Vật chỉ chịu trọng lực → Chuyển động rơi tự do: a_y = g, v_y = g.t, y = 0,5.g.t².\\n' +
      '— Phương trình quỹ đạo (y theo x): y = (g / (2.v_o²)) * x² (quỹ đạo là một nhánh parabol).\\n' +
      '— Thời gian bay (cho đến khi chạm đất từ độ cao h): t = √(2.h / g).\\n' +
      '— Tầm xa (khoảng cách nằm ngang xa nhất): L = x_max = v_o * t = v_o * √(2.h / g).\\n\\n' +
      'CHUYỂN ĐỘNG NÉM XIÊN (Ném góc α so với phương ngang):\\n' +
      '— Vận tốc ban đầu phân tích thành: v_ox = v_o.cos α, v_oy = v_o.sin α.\\n' +
      '— Tầm xa đạt cực đại khi góc ném α = 45° (nếu bỏ qua sức cản không khí).',
    workedExample: {
      problem:
        'Một vật được ném ngang với vận tốc ban đầu v_o = 15 m/s từ độ cao h = 20 m xuống đất. ' +
        'Lấy g = 10 m/s². Tính thời gian rơi và tầm xa của vật.',
      steps: [
        'Xác định các thông số: v_o = 15 m/s, h = 20 m, g = 10 m/s².',
        'Tính thời gian chuyển động cho đến khi chạm đất: t = √(2.h / g) = √(2 * 20 / 10) = √4 = 2 (s).',
        'Tính tầm xa L của chuyển động ném ngang: L = v_o * t = 15 * 2 = 30 (m).',
      ],
      answer: 'Thời gian rơi: 2s; Tầm xa: 30 m.',
    },
    checkQuestions: [
      {
        prompt:
          'Trong chuyển động ném ngang, gia tốc của vật theo phương nằm ngang (trục Ox) bằng bao nhiêu (bỏ qua sức cản không khí)?',
        choices: [
          { id: 'zero', label: '0 m/s²' },
          { id: 'g', label: 'g (≈ 9,8 m/s²)' },
          { id: 'bien_thien', label: 'Biến thiên liên tục theo thời gian' },
        ],
        answer: {
          kind: 'choice',
          correctIds: ['zero'],
        },
        explain:
          'Theo phương ngang vật không chịu bất kỳ lực nào tác dụng (bỏ qua cản khí) nên gia tốc phương ngang bằng 0.',
      },
      {
        prompt:
          'Một máy bay bay ngang ở độ cao 80 m với tốc độ 50 m/s thì thả một thùng hàng cứu trợ xuống đất. Tính tầm xa của thùng hàng (lấy g = 10 m/s²).',
        answer: {
          kind: 'numeric',
          value: 200,
          unit: 'm',
        },
        explain:
          'Thời gian rơi t = √(2h/g) = √(160/10) = 4 s. Tầm xa L = v_o * t = 50 * 4 = 200 m.',
      },
    ],
    srsCards: [
      {
        hoi: 'Quỹ đạo của chuyển động ném ngang có dạng hình học gì?',
        dap: 'Một đường parabol (nhánh parabol).',
      },
      {
        hoi: 'Viết công thức tính tầm xa L của vật ném ngang từ độ cao h?',
        dap: 'L = v_o * √(2.h / g).',
      },
    ],
    reviewStatus: 'draft',
  },
]
