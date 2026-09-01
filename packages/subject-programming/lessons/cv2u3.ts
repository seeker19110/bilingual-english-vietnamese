// lessons/cv2u3.ts — Chương 3 của khoá ngắn "Deep Learning for CV nâng cao"
// (docs/specs/2026-09-01-cv2-bai-hoc-chi-tiet.md). Nội dung chép nguyên văn từ đặc tả.
//
// unitId 'cv2-u3' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'git-u*'.
//
// Luật soạn riêng của khoá: mọi bài đều language 'python' và code được chấm là Python THUẦN
// (chỉ math chuẩn, không numpy/torch) để Pyodide trình duyệt và python3 CI chấm y hệt nhau.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const CV2_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'cv2-u3-l1',
    unitId: 'cv2-u3',
    language: 'python',
    title: 'GAN — trò chơi hai người giữa kẻ làm giả và người giám định',
    hook: 'Một kẻ làm tiền giả và một chuyên gia ngân hàng chơi trò mèo vờn chuột nhiều năm. Chuyên gia giỏi lên thì tiền giả phải tinh vi hơn; tiền giả tinh vi hơn thì chuyên gia phải tinh mắt hơn. Sau vài nghìn vòng, tiền giả gần như thật. Năm 2014 Ian Goodfellow biến đúng câu chuyện này thành thuật toán.',
    theory:
      'GAN (Generative Adversarial Network — mạng đối kháng sinh mẫu) gồm hai mạng đấu nhau:\n- GENERATOR (G, kẻ làm giả): nhận nhiễu ngẫu nhiên, nhả ra một mẫu (ảnh) giả. MỤC TIÊU: lừa được D.\n- DISCRIMINATOR (D, giám định): nhận một mẫu, đoán thật hay giả. MỤC TIÊU: không bị lừa.\n\nHuấn luyện là hai bước xen kẽ nhau: (1) khoá G, luyện D phân biệt mẫu thật với mẫu G vừa làm; (2) khoá D, luyện G sao cho D chấm nhầm mẫu của nó là thật. Về mặt toán, đây là bài toán minimax — trò chơi tổng-không, khác hẳn tối ưu một mục tiêu như hồi quy. Điểm cân bằng lý tưởng (Nash) là khi phân phối mẫu do G sinh ra TRÙNG với phân phối dữ liệu thật, lúc đó D chỉ còn đoán bừa 50/50: nó thua vì không còn gì để phân biệt.\n\nĐiều quan trọng nhất phải nhớ: TÍN HIỆU HỌC CỦA G KHÔNG ĐẾN TỪ DỮ LIỆU THẬT, mà đến từ phản hồi của D. G chưa bao giờ được "nhìn" ảnh thật — nó chỉ nghe D nói "còn giả lắm" rồi tự sửa. Đó là lý do GAN đẹp về ý tưởng và khó về thực hành (bài sau).\n\nBài này mô phỏng bằng phiên bản một chiều TẤT ĐỊNH để nhìn rõ động lực học, không có random che mất bản chất: dữ liệu thật là vài con số, G là một tham số duy nhất theta (chính là "giá trị mà G sinh ra"), còn D rút gọn thành phản hồi "mẫu của bạn đang lệch trung bình thật bao nhiêu và về phía nào". Luật cập nhật: theta ← theta + lr × (trung_bình_thật − theta). Mỗi vòng theta thu hẹp một nửa khoảng cách (với lr = 0,5) — đó chính là hình ảnh "G học ra phân phối thật", đếm được bằng con số chứ không nói suông.',
    workedExample: {
      code: `# GAN mot chieu, tat dinh: G co dung MOT tham so theta
that = [4.0, 6.0, 5.0, 5.0]      # du lieu that
tb_that = sum(that) / len(that)  # trung binh that = 5.0 (G khong duoc nhin so nay)
theta = 1.0                      # G khoi dau rat te
lr = 0.5

for vong in range(1, 6):
    # D cham: mau cua G lech trung binh that bao nhieu, ve phia nao
    phan_hoi = tb_that - theta
    # G di theo phan hoi cua D (khong nhin thang du lieu that)
    theta = theta + lr * phan_hoi
    print(f"Vong {vong}: theta = {round(theta, 4)}, con lech = {round(abs(tb_that - theta), 4)}")

print(f"Trung binh that: {round(tb_that, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `theta = 0.0\ntb = 10.0\nlr = 0.5\ntheta = theta + lr * (tb - theta)\nprint(theta)`,
      question: 'Sau MỘT vòng cập nhật với lr = 0.5, theta bằng bao nhiêu?',
      choices: ['5.0', '10.0', '0.5', '2.5'],
      answerIndex: 0,
      explain:
        '0.0 + 0.5 × (10.0 − 0.0) = 5.0 — đúng một nửa quãng đường tới đích. Mỗi vòng lại đi tiếp nửa khoảng cách còn lại (5 → 7.5 → 8.75…), nên G tiến gần phân phối thật rất nhanh lúc đầu rồi chậm dần: đúng dáng của một quá trình học hội tụ.',
    },
    parsons: {
      prompt:
        'Xếp đúng vòng huấn luyện GAN mô phỏng: tính trung bình thật → lặp → D phản hồi → G cập nhật → in.',
      lines: [
        'tb_that = sum(that) / len(that)',
        'for vong in range(1, 6):',
        '    phan_hoi = tb_that - theta',
        '    theta = theta + lr * phan_hoi',
        '    print(f"Vong {vong}: theta = {round(theta, 4)}")',
      ],
    },
    make: {
      prompt:
        'Mô phỏng GAN một chiều: cho generator (một tham số theta) học ra trung bình của dữ liệu thật qua 5 vòng.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dữ liệu thật, các số cách nhau dấu phẩy (vd "4,6,5,5").\n- Dòng 2: theta ban đầu.\n\nĐặt lr = 0.5. Lặp đúng 5 vòng, mỗi vòng: phan_hoi = trung_bình_thật − theta; theta = theta + lr × phan_hoi. In mỗi vòng một dòng:\nVong <k>: theta = <theta làm tròn 4>, con lech = <|tb − theta| làm tròn 4>\nSau vòng cuối in thêm:\nTrung binh that: <tb làm tròn 4>',
      starterCode: `that = [float(v) for v in input("Du lieu that: ").split(",")]\ntheta = float(input("Theta ban dau: "))\nlr = 0.5\n# tb_that = trung binh cua that\n# for vong in range(1, 6): cap nhat theta roi in\n`,
      testCases: [
        {
          stdinLines: ['4,6,5,5', '1'],
          expected:
            'Vong 1: theta = 3.0, con lech = 2.0\nVong 2: theta = 4.0, con lech = 1.0\nVong 3: theta = 4.5, con lech = 0.5\nVong 4: theta = 4.75, con lech = 0.25\nVong 5: theta = 4.875, con lech = 0.125\nTrung binh that: 5.0',
          match: 'contains',
          hidden: false,
          label: 'theta 1 → 4.875, mỗi vòng thu hẹp một nửa khoảng cách tới 5.0',
        },
        {
          stdinLines: ['10,10', '0'],
          expected:
            'Vong 4: theta = 9.375, con lech = 0.625\nVong 5: theta = 9.6875, con lech = 0.3125\nTrung binh that: 10.0',
          match: 'contains',
          hidden: false,
          label: 'Khởi đầu xa (0 vs 10) vẫn hội tụ về gần 10',
        },
        {
          stdinLines: ['2,4', '3'],
          expected: 'Vong 5: theta = 3.0, con lech = 0.0\nTrung binh that: 3.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: G đã đúng ngay từ đầu → phản hồi bằng 0, theta đứng yên',
        },
      ],
      hints: [
        'Trung bình thật: tb_that = sum(that) / len(that) — tính MỘT LẦN trước vòng lặp.',
        'range(1, 6) cho vòng 1 đến 5. Trong vòng: phan_hoi = tb_that - theta rồi theta = theta + lr * phan_hoi (đúng thứ tự này).',
        'Độ lệch còn lại tính SAU khi cập nhật: round(abs(tb_that - theta), 4).',
      ],
      sampleSolution: `that = [float(v) for v in input("Du lieu that: ").split(",")]\ntheta = float(input("Theta ban dau: "))\nlr = 0.5\ntb_that = sum(that) / len(that)\nfor vong in range(1, 6):\n    phan_hoi = tb_that - theta\n    theta = theta + lr * phan_hoi\n    print(f"Vong {vong}: theta = {round(theta, 4)}, con lech = {round(abs(tb_that - theta), 4)}")\nprint(f"Trung binh that: {round(tb_that, 4)}")`,
    },
    homework:
      'Đổi lr thành 0.1, rồi 1.0, rồi 1.9 và chạy lại. Với lr = 0.1 sau 5 vòng theta tới đâu? Với lr = 1.0 thì sao (đạt đích ngay vòng 1)? Với lr = 1.9 thì theta có VƯỢT QUA đích rồi dao động không? Từ ba lần chạy đó, viết 3 câu về vì sao learning rate quá lớn khiến huấn luyện KHÔNG ổn định — đây chính là bệnh nặng nhất của GAN thật, học ở bài sau.',
    srsCards: [
      {
        hoi: 'GAN gồm hai mạng nào, mục tiêu của từng mạng?',
        dap: 'Generator (kẻ làm giả) nhận nhiễu, sinh mẫu giả, mục tiêu LỪA được discriminator. Discriminator (giám định) nhận mẫu, đoán thật/giả, mục tiêu KHÔNG bị lừa. Hai mạng luyện xen kẽ, là bài toán minimax chứ không phải tối ưu một mục tiêu.',
      },
      {
        hoi: 'Điểm cân bằng lý tưởng của GAN là gì?',
        dap: 'Khi phân phối do generator sinh ra TRÙNG với phân phối dữ liệu thật; lúc đó discriminator không còn gì để phân biệt nên chỉ đoán bừa 50/50.',
      },
      {
        hoi: 'Generator học từ đâu — nó có được nhìn dữ liệu thật không?',
        dap: 'KHÔNG. Generator chưa bao giờ nhìn thẳng ảnh thật; tín hiệu học của nó hoàn toàn đến từ phản hồi của discriminator ("còn giả lắm" / "gần thật rồi"). Đó vừa là vẻ đẹp vừa là điểm mong manh của GAN.',
      },
    ],
  },
  {
    id: 'cv2-u3-l2',
    unitId: 'cv2-u3',
    language: 'python',
    title: 'Vì sao GAN khó huấn luyện — mode collapse',
    hook: 'Kẻ làm giả phát hiện chuyên gia hay bị lừa nhất bởi tờ 50 nghìn. Thế là hắn chỉ in duy nhất tờ 50 nghìn, hàng triệu bản y hệt. Hắn "thắng" theo đúng luật chơi, nhưng sản phẩm thì vô dụng. Trong GAN, chứng bệnh này có tên: mode collapse — và nó là lý do nhiều người bỏ GAN sang diffusion.',
    theory:
      'GAN đẹp trên giấy, khó trên máy. Ba bệnh kinh điển, xếp theo mức khó chịu:\n\n1. MODE COLLAPSE (sập chế độ). Dữ liệu thật có nhiều "mode" — chữ số 0 đến 9, nhiều giống chó, nhiều kiểu khuôn mặt. Generator phát hiện MỘT mẫu đủ lừa được discriminator hiện tại và chỉ sinh mãi mẫu đó (hoặc vài mẫu). Nó thắng trò chơi mà thua mục tiêu: bạn muốn một MÁY SINH ĐA DẠNG, nhận về một cái máy photocopy. Dấu hiệu nhận ra: sinh 100 mẫu thì thấy lặp đi lặp lại vài kiểu.\n\n2. MẤT CÂN BẰNG HAI ĐẤU THỦ. Nếu D quá mạnh, nó phân biệt đúng mọi thứ, phản hồi cho G bão hoà về gần 0 — G không còn gì để học (vanishing gradient). Nếu D quá yếu, phản hồi của nó vô nghĩa, G học theo tín hiệu rác. Huấn luyện GAN vì thế là nghệ thuật giữ hai bên NGANG SỨC.\n\n3. KHÔNG HỘI TỤ / DAO ĐỘNG. Vì là trò chơi hai người chứ không phải leo xuống một mặt sai số cố định, hai bên có thể đuổi nhau vòng tròn mãi. Tệ hơn: hàm mất mát của GAN gần như KHÔNG nói lên chất lượng — loss đẹp mà ảnh xấu là chuyện thường, nên người ta phải chấm bằng chỉ số riêng (FID) và bằng mắt.\n\nThuốc mà ngành đã tìm ra: WGAN + gradient penalty (đổi cách đo khoảng cách giữa hai phân phối, cho gradient lành hơn); spectral normalization (ghìm sức mạnh của D); minibatch discrimination (cho D nhìn CẢ LÔ để phát hiện lô toàn mẫu giống nhau — đánh thẳng vào mode collapse); và huấn luyện theo độ phân giải tăng dần (ProGAN, StyleGAN).\n\nĐo mode collapse thế nào? Cách thô nhất mà vẫn dùng được: sinh N mẫu, đếm số mẫu KHÁC NHAU, lấy tỷ lệ. Tỷ lệ thấp = nghi ngờ collapse. Nghề thật dùng FID (so thống kê đặc trưng của lô sinh với lô thật) hoặc precision/recall cho mô hình sinh, nhưng tinh thần vẫn là câu hỏi này: mẫu sinh ra có ĐA DẠNG như dữ liệu thật không?',
    workedExample: {
      code: `# Do da dang cua lo mau sinh: dau hieu tho cua mode collapse
lo_a = ["meo", "meo", "meo", "meo", "cho"]        # nghi ngo collapse
lo_b = ["meo", "cho", "chim", "ca", "ngua"]       # da dang tot

for ten, lo in [("Lo A", lo_a), ("Lo B", lo_b)]:
    khac = len(set(lo))                # set() bo trung lap
    ty_le = khac / len(lo)
    print(f"{ten}: {khac}/{len(lo)} mau khac nhau, do da dang {round(ty_le, 2)}")
    if ty_le < 0.5:
        print(f"  -> Canh bao: mode collapse")
    else:
        print(f"  -> On")`,
      stdinLines: [],
    },
    predict: {
      code: `lo = ["a", "a", "b", "a", "b"]\nprint(len(set(lo)) / len(lo))`,
      question: 'Độ đa dạng của lô này in ra là bao nhiêu?',
      choices: ['0.4', '0.5', '1.0', '0.2'],
      answerIndex: 0,
      explain:
        'set(["a","a","b","a","b"]) = {"a","b"} có 2 phần tử, chia cho 5 mẫu = 0.4. Sinh 5 mẫu mà chỉ có 2 kiểu là dấu hiệu generator đang lười: nó tìm được vài mẫu an toàn và bám lấy chúng thay vì học cả phân phối.',
    },
    parsons: {
      prompt:
        'Xếp đúng máy đo mode collapse: đếm mẫu khác nhau → tính tỷ lệ → in → cảnh báo nếu dưới ngưỡng.',
      lines: [
        'khac = len(set(mau))',
        'ty_le = khac / len(mau)',
        'print(f"So mau khac nhau: {khac}/{len(mau)}")',
        'print(f"Do da dang: {round(ty_le, 2)}")',
        'if ty_le < 0.5:',
        '    print("Canh bao: mode collapse")',
        'else:',
        '    print("On: da dang chap nhan duoc")',
      ],
    },
    make: {
      prompt:
        'Viết máy phát hiện mode collapse cho một lô mẫu do generator sinh ra.\n\nChương trình đọc 1 dòng input(): các mẫu cách nhau dấu phẩy (vd "meo,meo,meo,meo,cho").\n\nTính độ đa dạng = số mẫu KHÁC NHAU / tổng số mẫu. In đúng 3 dòng:\nSo mau khac nhau: <khác>/<tổng>\nDo da dang: <tỷ lệ làm tròn 2>\nrồi "Canh bao: mode collapse" nếu tỷ lệ NHỎ HƠN 0.5, ngược lại "On: da dang chap nhan duoc".',
      starterCode: `mau = input("Mau sinh: ").split(",")\n# set(mau) bo trung lap; len(set(mau)) la so mau khac nhau\n`,
      testCases: [
        {
          stdinLines: ['meo,meo,meo,meo,cho'],
          expected: 'So mau khac nhau: 2/5\nDo da dang: 0.4\nCanh bao: mode collapse',
          match: 'contains',
          hidden: false,
          label: '5 mẫu chỉ 2 kiểu → 0.4, cảnh báo',
        },
        {
          stdinLines: ['a,b,c,d'],
          expected: 'So mau khac nhau: 4/4\nDo da dang: 1.0\nOn: da dang chap nhan duoc',
          match: 'contains',
          hidden: false,
          label: 'Khác nhau hết → 1.0, không cảnh báo',
        },
        {
          stdinLines: ['x,x,y,y'],
          expected: 'Do da dang: 0.5\nOn: da dang chap nhan duoc',
          match: 'contains',
          hidden: false,
          label: 'Đúng 0.5 — biên: NHỎ HƠN mới cảnh báo nên ca này "on"',
        },
        {
          stdinLines: ['k'],
          expected: 'So mau khac nhau: 1/1\nDo da dang: 1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng một mẫu — tỷ lệ 1.0, không chia cho 0',
        },
      ],
      hints: [
        'set() loại trùng lặp: len(set(mau)) là số mẫu khác nhau, len(mau) là tổng.',
        'Điều kiện cảnh báo là ty_le < 0.5 (nhỏ hơn thật sự) — ca đúng bằng 0.5 phải in "On".',
        'In tỷ lệ bằng round(ty_le, 2) để 0.4 và 0.5 hiện gọn, không ra 0.4000000001.',
      ],
      sampleSolution: `mau = input("Mau sinh: ").split(",")\nkhac = len(set(mau))\nty_le = khac / len(mau)\nprint(f"So mau khac nhau: {khac}/{len(mau)}")\nprint(f"Do da dang: {round(ty_le, 2)}")\nif ty_le < 0.5:\n    print("Canh bao: mode collapse")\nelse:\n    print("On: da dang chap nhan duoc")`,
    },
    homework:
      'Thước đo "đếm mẫu khác nhau" này hỏng ở đâu với ẢNH THẬT? (Gợi ý: hai ảnh lệch nhau đúng một pixel là "khác nhau" theo set(), nhưng mắt người thấy y hệt.) Viết 3 câu mô tả cách sửa: thay "bằng nhau tuyệt đối" bằng "gần nhau dưới một khoảng cách", rồi đọc lướt xem FID giải bài này bằng cách nào (so thống kê đặc trưng của cả lô, không so từng cặp ảnh).',
    srsCards: [
      {
        hoi: 'Mode collapse là gì?',
        dap: 'Generator phát hiện MỘT (hoặc vài) mẫu đủ lừa discriminator rồi chỉ sinh mãi mẫu đó — thắng trò chơi nhưng thua mục tiêu, vì ta cần máy sinh ĐA DẠNG chứ không phải máy photocopy. Dấu hiệu: sinh 100 mẫu chỉ thấy vài kiểu lặp lại.',
      },
      {
        hoi: 'Vì sao mất cân bằng giữa G và D làm hỏng huấn luyện GAN?',
        dap: 'D quá mạnh: phản hồi bão hoà, gradient về gần 0, G không còn gì để học. D quá yếu: phản hồi vô nghĩa, G học theo tín hiệu rác. Huấn luyện GAN là giữ hai đấu thủ NGANG SỨC.',
      },
      {
        hoi: 'Vì sao không thể nhìn hàm mất mát của GAN để biết chất lượng?',
        dap: 'GAN là trò chơi hai người, không phải leo xuống một mặt sai số cố định — loss đẹp mà ảnh xấu là chuyện thường, hai bên có thể dao động vòng tròn. Phải chấm bằng chỉ số riêng (FID) và bằng mắt.',
      },
    ],
  },
  {
    id: 'cv2-u3-l3',
    unitId: 'cv2-u3',
    language: 'python',
    title: 'Diffusion — thêm nhiễu dần rồi học cách gỡ ngược',
    hook: 'Nhỏ một giọt mực vào ly nước: mực loang dần cho tới khi cả ly xám đều. Quay ngược thước phim ấy, bạn thấy hỗn loạn tự gom lại thành một giọt sắc nét. Diffusion là mô hình học cách BẤM NÚT TUA NGƯỢC đó — và nó đứng sau Stable Diffusion, DALL·E 3, Midjourney.',
    theory:
      'Diffusion có hai chiều, và mấu chốt là chỉ MỘT chiều cần học:\n\nCHIỀU THUẬN (forward, KHÔNG cần học): lấy ảnh thật, cộng thêm một chút nhiễu, lặp T bước (T thường 1.000). Sau bước cuối, ảnh biến thành nhiễu thuần. Chiều này chỉ là một công thức cố định — chạy được ngay, không có tham số nào.\n\nCHIỀU NGƯỢC (reverse, PHẢI học): mạng nơ-ron nhận ảnh nhiễu ở bước t và học đoán "phần nhiễu đã bị cộng vào là gì", để trừ đi mà lùi về bước t−1. Lặp đủ T lần thì từ nhiễu thuần ra ảnh sạch.\n\nVì sao cách này ăn đứt GAN về ổn định: chiều thuận cho ta VÔ SỐ cặp huấn luyện miễn phí (ảnh sạch, ảnh nhiễu ở mọi mức) và bài học của mạng là một bài HỒI QUY bình thường — đoán nhiễu, so sai số, đi xuống. Không có đối thủ, không có minimax, không có mode collapse. Đổi lại, sinh ảnh phải chạy mạng hàng chục đến hàng nghìn bước nên CHẬM hơn GAN (GAN sinh xong trong một lần chạy). Toàn bộ ngành tăng tốc lấy mẫu (DDIM, distillation, consistency models) sinh ra để gặm con số này — 2026 đã có mô hình sinh ảnh chất lượng cao trong 1–4 bước.\n\nBài này mô phỏng bằng vector 8 phần tử với "nhiễu" TẤT ĐỊNH — mỗi bước cộng thêm một lượng cố định BIẾT TRƯỚC ([0.4, 0.2, 0.1], giảm dần đúng như lịch nhiễu thật). Vì lượng cộng đã biết, chiều ngược chỉ là trừ đúng lượng đó theo thứ tự ĐẢO NGƯỢC, và ta thấy vector trở về đúng bản gốc. Với ảnh thật thì nhiễu là ngẫu nhiên và KHÔNG ai đưa cho ta con số đã cộng — đó chính là chỗ mạng nơ-ron phải học đoán, còn lại khung sườn y hệt bài này.',
    workedExample: {
      code: `goc = [1.0, 2.0, 3.0, 4.0]     # "anh" goc (4 phan tu cho gon)
luong = [0.4, 0.2, 0.1]        # lich nhieu: giam dan, biet truoc

x = list(goc)                  # copy de khong sua goc
for t in range(3):             # CHIEU THUAN: them nhieu
    x = [round(v + luong[t], 2) for v in x]
    print(f"Them nhieu buoc {t + 1}: {x}")

for t in range(2, -1, -1):     # CHIEU NGUOC: tru DUNG luong, thu tu DAO
    x = [round(v - luong[t], 2) for v in x]
    print(f"Khu nhieu: {x}")

print("Khoi phuc dung goc" if x == goc else "Sai lech")`,
      stdinLines: [],
    },
    predict: {
      code: `x = [1.0, 2.0]\nfor luong in [0.4, 0.2]:\n    x = [round(v + luong, 2) for v in x]\nprint(x)`,
      question: 'Sau 2 bước thêm nhiễu, vector in ra là gì?',
      choices: ['[1.6, 2.6]', '[1.4, 2.4]', '[1.2, 2.2]', '[2.0, 3.0]'],
      answerIndex: 0,
      explain:
        'Bước 1 cộng 0.4 → [1.4, 2.4]; bước 2 cộng tiếp 0.2 → [1.6, 2.6]. Nhiễu CỘNG DỒN qua các bước, và lượng thêm mỗi bước giảm dần — đúng tinh thần lịch nhiễu (noise schedule) của diffusion thật.',
    },
    parsons: {
      prompt:
        'Xếp đúng hai chiều diffusion: copy gốc → vòng thêm nhiễu xuôi → vòng khử nhiễu ngược → kiểm tra khôi phục.',
      lines: [
        'x = list(goc)',
        'for t in range(so_buoc):',
        '    x = [round(v + luong[t], 2) for v in x]',
        'for t in range(so_buoc - 1, -1, -1):',
        '    x = [round(v - luong[t], 2) for v in x]',
        'print("Khoi phuc dung anh goc" if x == goc else "Sai lech so voi goc")',
      ],
    },
    make: {
      prompt:
        'Mô phỏng đủ hai chiều của diffusion trên vector 8 phần tử đã nhúng sẵn.\n\nChương trình đọc 1 dòng input(): số bước (1, 2 hoặc 3). Lịch nhiễu cố định là [0.4, 0.2, 0.1].\n\nCHIỀU THUẬN: lặp t từ 0 đến so_buoc−1, cộng luong[t] vào MỌI phần tử (làm tròn 2), in:\nThem nhieu buoc <t+1>: <các số cách nhau ", ">\n\nCHIỀU NGƯỢC: lặp t từ so_buoc−1 về 0, trừ đúng luong[t] (làm tròn 2), in:\nKhu nhieu buoc <thứ tự 1,2,3>: <các số cách nhau ", ">\n\nCuối cùng in "Khoi phuc dung anh goc" nếu vector bằng đúng gốc, ngược lại "Sai lech so voi goc".',
      starterCode: `goc = [1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0]\nso_buoc = int(input("So buoc: "))\nluong = [0.4, 0.2, 0.1]\nx = list(goc)\n# Vong xuoi: for t in range(so_buoc) -> cong luong[t]\n# Vong nguoc: for t in range(so_buoc - 1, -1, -1) -> tru luong[t]\n`,
      testCases: [
        {
          stdinLines: ['1'],
          expected:
            'Them nhieu buoc 1: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 1: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0\nKhoi phuc dung anh goc',
          match: 'contains',
          hidden: false,
          label: '1 bước: cộng 0.4 rồi trừ 0.4 → về đúng gốc',
        },
        {
          stdinLines: ['2'],
          expected:
            'Them nhieu buoc 2: 1.6, 2.6, 3.6, 4.6, 5.6, 4.6, 3.6, 2.6\nKhu nhieu buoc 1: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 2: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0',
          match: 'contains',
          hidden: false,
          label: '2 bước: khử theo thứ tự ĐẢO NGƯỢC (0.2 trước, 0.4 sau)',
        },
        {
          stdinLines: ['3'],
          expected:
            'Khu nhieu buoc 2: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 3: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0\nKhoi phuc dung anh goc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đủ 3 bước — cộng dồn 0.7 rồi gỡ hết, vẫn về gốc',
        },
      ],
      hints: [
        'Copy trước khi sửa: x = list(goc) — nếu gán x = goc thì bạn sửa luôn bản gốc và phép so sánh cuối luôn đúng một cách giả tạo.',
        'Vòng ngược đếm lùi: range(so_buoc - 1, -1, -1) cho t = 2, 1, 0 khi so_buoc = 3. Số thứ tự in ra là so_buoc - t.',
        'In một dòng vector: ", ".join(str(v) for v in x). Nhớ round(..., 2) sau MỖI phép cộng/trừ để so sánh cuối khớp đúng.',
      ],
      sampleSolution: `goc = [1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0]\nso_buoc = int(input("So buoc: "))\nluong = [0.4, 0.2, 0.1]\nx = list(goc)\nfor t in range(so_buoc):\n    x = [round(v + luong[t], 2) for v in x]\n    print(f"Them nhieu buoc {t + 1}: " + ", ".join(str(v) for v in x))\nfor t in range(so_buoc - 1, -1, -1):\n    x = [round(v - luong[t], 2) for v in x]\n    print(f"Khu nhieu buoc {so_buoc - t}: " + ", ".join(str(v) for v in x))\nprint("Khoi phuc dung anh goc" if x == goc else "Sai lech so voi goc")`,
    },
    homework:
      'Trong bài này bạn BIẾT trước lượng nhiễu nên khử được chính xác. Với ảnh thật, nhiễu là ngẫu nhiên và không ai cho biết con số đã cộng — hãy viết 4–5 câu trả lời: mạng nơ-ron phải học ĐOÁN cái gì ở mỗi bước, dữ liệu huấn luyện cho việc đoán đó lấy ở đâu (gợi ý: chiều thuận sinh ra vô tận cặp miễn phí), và vì sao vì thế diffusion ổn định hơn GAN nhưng lại chậm hơn khi sinh ảnh.',
    srsCards: [
      {
        hoi: 'Diffusion gồm hai chiều nào, chiều nào phải học?',
        dap: 'Chiều thuận: cộng nhiễu dần vào ảnh qua T bước cho tới khi thành nhiễu thuần — công thức cố định, KHÔNG cần học. Chiều ngược: mạng học đoán phần nhiễu đã cộng ở mỗi bước để trừ đi, lùi dần về ảnh sạch — đây là phần phải học.',
      },
      {
        hoi: 'Vì sao diffusion ổn định hơn GAN khi huấn luyện?',
        dap: 'Chiều thuận cho vô số cặp huấn luyện miễn phí (ảnh sạch ↔ ảnh nhiễu ở mọi mức) và bài học chỉ là HỒI QUY đoán nhiễu — không có đối thủ, không minimax, không mode collapse. Đổi lại sinh ảnh chậm vì phải chạy mạng nhiều bước.',
      },
      {
        hoi: 'Điểm yếu chính của diffusion và hướng khắc phục?',
        dap: 'Sinh ảnh chậm — phải chạy mạng hàng chục đến hàng nghìn bước khử nhiễu (GAN chỉ một lần chạy). Khắc phục bằng lấy mẫu nhanh (DDIM), chưng cất (distillation), consistency models — 2026 đã sinh ảnh tốt trong 1–4 bước.',
      },
    ],
  },
  {
    id: 'cv2-u3-l4',
    unitId: 'cv2-u3',
    language: 'python',
    title: 'Bức tranh sinh ảnh 2026 — diffusion, GAN, autoregressive và điều khiển bằng chữ',
    hook: 'Gõ "một con mèo phi hành gia cưỡi ngựa trên sao Hoả, ảnh chụp film" và 4 giây sau có ảnh. Giữa câu chữ đó và tấm ảnh là ba mảnh ghép: một mô hình hiểu chữ, một cầu nối chữ–ảnh, một máy sinh ảnh. Bài này ráp đủ ba mảnh và học cách chọn máy sinh theo NGÂN SÁCH, vì mỗi bước khử nhiễu là tiền thật.',
    theory:
      'BA HỌ MÁY SINH ẢNH, so theo ba trục dùng được:\n- DIFFUSION (Stable Diffusion, DALL·E 3, Midjourney, Imagen): chất lượng và đa dạng cao nhất, huấn luyện ổn định, điều khiển bằng chữ rất tốt. Chậm khi sinh (nhiều bước), tốn tính toán.\n- GAN (StyleGAN và hậu duệ): sinh CỰC nhanh — một lần chạy mạng, hợp thời gian thực (avatar, biến đổi khuôn mặt trực tiếp). Khó huấn luyện, dễ mode collapse, kém linh hoạt với chữ.\n- AUTOREGRESSIVE (sinh ảnh như sinh chữ, từng token một — dòng của các mô hình đa phương thức 2024–2026): dùng chung kiến trúc Transformer với LLM nên gộp chữ và ảnh vào MỘT mô hình được, suy luận theo ngữ cảnh tốt; chậm vì sinh tuần tự từng token.\n\nĐIỀU KHIỂN BẰNG VĂN BẢN, ở mức bản đồ. CLIP là mô hình được huấn luyện trên hàng trăm triệu cặp (ảnh, chú thích) với một mục tiêu duy nhất: đẩy vector của ảnh và vector của chú thích ĐÚNG của nó lại gần nhau, đẩy các cặp sai ra xa. Kết quả là một KHÔNG GIAN CHUNG cho chữ và ảnh, nơi "câu chữ" và "ảnh khớp câu đó" nằm cạnh nhau — đo bằng cosine, đúng thước đo bạn đã dùng ở khoá `mlds`. Nhờ không gian chung này, mô hình sinh ảnh có thể lái quá trình khử nhiễu về phía khớp với câu lệnh; và cũng nhờ nó mà CLIP phân loại được ảnh vào những lớp CHƯA từng thấy nhãn lúc huấn luyện (zero-shot).\n\nCác núm điều khiển khác cần biết tên: classifier-free guidance (núm "bám sát câu lệnh" — vặn cao thì đúng chữ nhưng ảnh cứng và kém đa dạng), ControlNet (ép bố cục theo ảnh phác/khung xương/độ sâu), LoRA (dạy mô hình một phong cách hoặc một nhân vật riêng với vài chục ảnh).\n\nMẶT TRÁI, phần bắt buộc của nghề chứ không phải phụ lục: deepfake và ảnh giả mạo người thật; bản quyền dữ liệu huấn luyện; thiên lệch trong dữ liệu bị khuếch đại lên ảnh sinh ra. Hai việc tối thiểu người làm nghề phải làm: gắn dấu nguồn gốc (watermark/C2PA) và không sinh ảnh người thật khi không được phép.\n\nKINH TẾ, thứ quyết định kiến trúc nhiều hơn người ta tưởng: chi phí sinh một ảnh tỷ lệ THẲNG với số bước khử nhiễu. 50 bước đắt gấp 50 lần một bước. Bài Make hôm nay tính đúng con số đó.',
    workedExample: {
      code: `# Chi phi sinh anh ty le thang voi so buoc khu nhieu
so_buoc = 50
gia_moi_buoc = 0.02          # don vi tien cho mot lan chay mang

tong = so_buoc * gia_moi_buoc
print(f"Diffusion 50 buoc: {round(tong, 2)}")
print(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")
print(f"Dat gap: {round(tong / gia_moi_buoc, 1)} lan")
print("=> Thoi gian thuc thi chon GAN hoac diffusion rut buoc (DDIM, distillation)")`,
      stdinLines: [],
    },
    predict: {
      code: `print(round(20 * 0.05, 2))`,
      question: 'Sinh một ảnh bằng 20 bước, mỗi bước tốn 0.05 — tổng chi phí là bao nhiêu?',
      choices: ['1.0', '0.05', '20.0', '0.25'],
      answerIndex: 0,
      explain:
        '20 × 0.05 = 1.0. Chi phí tỷ lệ THẲNG với số bước, nên rút từ 50 bước xuống 4 bước là giảm chi phí hơn 12 lần — đó là lý do kinh tế đứng sau cả một dòng nghiên cứu (DDIM, distillation, consistency models), không chỉ vì sốt ruột.',
    },
    parsons: {
      prompt:
        'Xếp đúng máy tính chi phí sinh ảnh: đọc số bước → đọc giá mỗi bước → nhân → so với GAN.',
      lines: [
        'so_buoc = int(input("So buoc khu nhieu: "))',
        'gia_moi_buoc = float(input("Gia moi buoc: "))',
        'tong = so_buoc * gia_moi_buoc',
        'print(f"Diffusion: {round(tong, 2)}")',
        'print(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")',
        'print(f"Diffusion dat gap: {round(tong / gia_moi_buoc, 1)} lan")',
      ],
    },
    make: {
      prompt:
        'Viết máy so chi phí sinh ảnh giữa diffusion (nhiều bước) và GAN (một bước).\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số bước khử nhiễu (số nguyên).\n- Dòng 2: giá mỗi lần chạy mạng (số thực).\n\nIn đúng 3 dòng:\nDiffusion: <số bước × giá, làm tròn 2>\nGAN (1 buoc): <giá, làm tròn 2>\nDiffusion dat gap: <tổng chia giá, làm tròn 1> lan',
      starterCode: `so_buoc = int(input("So buoc khu nhieu: "))\ngia_moi_buoc = float(input("Gia moi buoc: "))\n# tong = so_buoc * gia_moi_buoc, roi in 3 dong nhu de yeu cau\n`,
      testCases: [
        {
          stdinLines: ['50', '0.02'],
          expected: 'Diffusion: 1.0\nGAN (1 buoc): 0.02\nDiffusion dat gap: 50.0 lan',
          match: 'contains',
          hidden: false,
          label: '50 bước → đắt gấp 50 lần GAN',
        },
        {
          stdinLines: ['4', '1.5'],
          expected: 'Diffusion: 6.0\nGAN (1 buoc): 1.5\nDiffusion dat gap: 4.0 lan',
          match: 'contains',
          hidden: false,
          label: 'Mô hình rút bước (4 bước) → chỉ còn gấp 4',
        },
        {
          stdinLines: ['100', '0.05'],
          expected: 'Diffusion: 5.0\nGAN (1 buoc): 0.05\nDiffusion dat gap: 100.0 lan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 100 bước — tỷ lệ đắt đúng bằng số bước',
        },
      ],
      hints: [
        'Tổng chi phí đơn giản là phép nhân: tong = so_buoc * gia_moi_buoc.',
        'Tỷ lệ đắt gấp = tong / gia_moi_buoc — nó luôn bằng đúng số bước, và đó chính là điều bài học muốn bạn thấy.',
        'Chú ý mức làm tròn KHÁC nhau: hai dòng đầu round(..., 2), dòng cuối round(..., 1).',
      ],
      sampleSolution: `so_buoc = int(input("So buoc khu nhieu: "))\ngia_moi_buoc = float(input("Gia moi buoc: "))\ntong = so_buoc * gia_moi_buoc\nprint(f"Diffusion: {round(tong, 2)}")\nprint(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")\nprint(f"Diffusion dat gap: {round(tong / gia_moi_buoc, 1)} lan")`,
    },
    homework:
      'Chọn máy sinh cho 3 sản phẩm và biện hộ 2–3 câu mỗi cái, nêu rõ ràng buộc quyết định: (a) bộ lọc avatar chạy trực tiếp trên camera điện thoại; (b) công cụ vẽ minh hoạ cho nhà xuất bản, chất lượng là trên hết; (c) trợ lý vừa trả lời chữ vừa vẽ hình trong cùng một cuộc trò chuyện. Thêm một đoạn: với sản phẩm (a), bạn làm gì để KHÔNG cho phép sinh ảnh khuôn mặt người thật mà chủ nhân không đồng ý?',
    srsCards: [
      {
        hoi: 'So diffusion, GAN và autoregressive theo tốc độ sinh và chất lượng?',
        dap: 'Diffusion: chất lượng/đa dạng cao nhất, huấn luyện ổn định, sinh CHẬM (nhiều bước). GAN: sinh cực nhanh (một lần chạy), hợp thời gian thực, nhưng khó huấn luyện và dễ mode collapse. Autoregressive: gộp chung kiến trúc với LLM nên đa phương thức tốt, sinh chậm vì tuần tự từng token.',
      },
      {
        hoi: 'CLIP làm gì và vì sao nó cho phép điều khiển sinh ảnh bằng chữ?',
        dap: 'Huấn luyện trên hàng trăm triệu cặp (ảnh, chú thích) để kéo vector ảnh và vector chú thích đúng lại gần nhau (đo bằng cosine) — tạo KHÔNG GIAN CHUNG cho chữ và ảnh. Nhờ đó quá trình khử nhiễu lái được về phía khớp câu lệnh, và CLIP phân loại zero-shot được lớp chưa từng thấy nhãn.',
      },
      {
        hoi: 'Chi phí sinh một ảnh bằng diffusion phụ thuộc gì?',
        dap: 'Tỷ lệ THẲNG với số bước khử nhiễu — 50 bước đắt gấp 50 lần một bước. Đó là động lực kinh tế của cả dòng nghiên cứu rút bước (DDIM, distillation, consistency models), 2026 đã sinh ảnh tốt trong 1–4 bước.',
      },
    ],
  },
]
