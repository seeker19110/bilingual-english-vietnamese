// lessons/mathaiu1.ts — Chương C1 "Xác suất & thống kê" của khoá "Toán Thiết Yếu cho AI"
// (mathai) (docs/specs/2026-09-01-mathai-bai-hoc-chi-tiet.md). Khoá 2/6 cụm "Kỹ sư AI
// thực chiến" (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md).
//
// unitId 'mathai-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn,
// đúng cơ chế 'pyai-u*'/'ml-u*'.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const MATHAI_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'mathai-u1-l1',
    unitId: 'mathai-u1',
    language: 'python',
    title: 'Xác suất từ đếm — tung xu 10.000 lần thì thấy gì',
    hook: 'Tung một đồng xu 4 lần được 3 mặt ngửa — xu bị lỗi chăng? Tung 10.000 lần thì tần suất ngửa bò dần về 0,5 và nằm lì ở đó. Xác suất không phải phép màu: nó là con số mà TẦN SUẤT ĐẾM ĐƯỢC tiến về khi số lần thử đủ lớn.',
    theory:
      'XÁC SUẤT của một biến cố = phần trăm số lần biến cố đó xảy ra khi ta lặp phép thử vô hạn lần. Trong thực hành, ta không có vô hạn — ta có DỮ LIỆU, và ta ĐẾM:\n\ntần suất = số lần biến cố xảy ra / tổng số lần thử\n\nĐịnh nghĩa cổ điển cho trường hợp mọi khả năng đồng khả năng: P = số kết quả thuận lợi / tổng số kết quả. Xúc xắc 6 mặt, P(ra số chẵn) = 3/6 = 0,5.\n\nLUẬT SỐ LỚN nói: càng nhiều phép thử, tần suất đếm được càng bám sát xác suất thật. Đây là nền của toàn bộ học máy — ta không biết "quy luật thật", ta chỉ có mẫu dữ liệu và tin rằng mẫu đủ lớn thì phản ánh đúng quy luật. Mẫu nhỏ nói dối: 4 lần tung ra 3 ngửa là chuyện thường, 10.000 lần ra 7.500 ngửa thì đồng xu chắc chắn có vấn đề.\n\nBa tính chất phải nhớ: (1) 0 <= P <= 1; (2) tổng xác suất của mọi khả năng = 1; (3) P(không xảy ra A) = 1 - P(A).\n\nLƯU Ý KỸ THUẬT của khoá này: mọi bài chấm bằng test-case nên ta KHÔNG dùng module random (mỗi lần chạy ra số khác thì không chấm được). Ta mô phỏng bằng một DÃY KẾT QUẢ CHO SẴN — bản chất toán học không đổi, chỉ là ta thay "trời gieo" bằng "dãy đã ghi lại".',
    workedExample: {
      code: `# Luat so lon: tan suat bo dan ve 0.5 khi day dai ra
day = "NSNNSNSSNNSNSSNNSNSN"   # N = ngua, S = sap (day da ghi lai)

for moc in [5, 10, 20]:        # xem tan suat o 3 moc do dai
    phan_dau = day[:moc]       # cat moc ky tu dau tien
    so_ngua = phan_dau.count("N")   # dem so lan ngua
    print(f"Sau {moc} lan: {so_ngua} ngua, tan suat {so_ngua / moc}")`,
      stdinLines: [],
    },
    predict: {
      code: `day = "NNSN"\nprint(day.count("N") / len(day))`,
      question: 'Đoạn code in ra tần suất mặt ngửa bằng bao nhiêu?',
      choices: ['0.75', '3.0', '0.25', '4.0'],
      answerIndex: 0,
      explain:
        'Chuỗi "NNSN" có 3 ký tự N trên tổng 4 ký tự, nên 3 / 4 = 0.75. Đây đúng là định nghĩa tần suất: đếm số lần xảy ra chia tổng số lần thử. Với 4 lần thử thì 0.75 chưa nói được gì về đồng xu — mẫu quá nhỏ.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự tính tần suất từ một dãy kết quả: đọc dãy → đếm → chia → in.',
      lines: [
        'day = input("Day ket qua: ")',
        'so_ngua = day.count("N")',
        'tong = len(day)',
        'tan_suat = so_ngua / tong',
        'print(f"Tan suat: {tan_suat}")',
      ],
    },
    make: {
      prompt:
        'Viết máy tính tần suất cho một dãy tung xu đã ghi lại.\n\nChương trình đọc 1 dòng input(): một chuỗi chỉ gồm ký tự N (ngửa) và S (sấp), vd "NSNSN".\n\nIn đúng 2 dòng:\nSo lan ngua: <số ký tự N>\nTan suat: <số ký tự N chia tổng độ dài>\n\nVí dụ với "NSNSN": 3 ký tự N trên 5 → "So lan ngua: 3" và "Tan suat: 0.6".',
      starterCode: `day = input("Day tung xu: ").strip()\n# Dem so ky tu "N" bang day.count("N"), tong so lan la len(day)\n# In 2 dong: So lan ngua: ... va Tan suat: ...\n`,
      testCases: [
        {
          stdinLines: ['NSNSN'],
          expected: 'So lan ngua: 3\nTan suat: 0.6',
          match: 'contains',
          hidden: false,
          label: '3 ngửa trên 5 lần → 0.6',
        },
        {
          stdinLines: ['NNNN'],
          expected: 'Tan suat: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Toàn ngửa → tần suất 1.0',
        },
        {
          stdinLines: ['SSSS'],
          expected: 'So lan ngua: 0\nTan suat: 0.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không có ngửa nào → 0 và 0.0',
        },
      ],
      hints: [
        'Đếm ký tự trong chuỗi có sẵn phương thức: day.count("N") trả về số lần ký tự N xuất hiện.',
        'Tổng số lần thử chính là độ dài chuỗi: len(day). Phép chia / luôn cho số thực nên 3/5 in ra 0.6.',
        'In hai dòng: print(f"So lan ngua: {so_ngua}") rồi print(f"Tan suat: {so_ngua / len(day)}").',
      ],
      sampleSolution: `day = input("Day tung xu: ").strip()\nso_ngua = day.count("N")\ntong = len(day)\nprint(f"So lan ngua: {so_ngua}")\nprint(f"Tan suat: {so_ngua / tong}")`,
    },
    homework:
      'Tự tay tung một đồng xu thật 20 lần, ghi lại thành chuỗi N/S rồi chạy chương trình của bạn lên nó. Tần suất lệch bao nhiêu so với 0,5? Làm lại lần hai với 20 lần khác — hai lần có ra cùng con số không? Viết 3 câu trả lời: vì sao mẫu nhỏ thì tần suất nhảy nhót, và điều đó cảnh báo gì khi bạn đánh giá một mô hình AI trên tập test chỉ có 20 ca?',
    srsCards: [
      {
        hoi: 'Tần suất khác xác suất ở chỗ nào?',
        dap: 'Tần suất là con số ĐẾM ĐƯỢC từ dữ liệu hữu hạn (số lần xảy ra / tổng số lần thử); xác suất là giá trị thật mà tần suất tiến về khi số phép thử ra vô hạn. Luật số lớn nối hai thứ: mẫu càng lớn, tần suất càng sát xác suất.',
      },
      {
        hoi: 'Ba tính chất cơ bản của xác suất là gì?',
        dap: '(1) Mọi xác suất nằm trong đoạn 0 đến 1; (2) tổng xác suất của tất cả khả năng bằng 1; (3) xác suất biến cố KHÔNG xảy ra bằng 1 trừ xác suất nó xảy ra.',
      },
      {
        hoi: 'Vì sao đánh giá mô hình trên tập test quá nhỏ là nguy hiểm?',
        dap: 'Vì tần suất đo trên mẫu nhỏ dao động rất mạnh quanh giá trị thật (4 lần tung ra 3 ngửa là bình thường). Accuracy 90% trên 10 ca có thể chỉ là may mắn; cần mẫu đủ lớn thì con số mới đáng tin.',
      },
    ],
  },
  {
    id: 'mathai-u1-l2',
    unitId: 'mathai-u1',
    language: 'python',
    title: 'Xác suất có điều kiện & Bayes — que thử dương tính có nghĩa gì',
    hook: 'Xét nghiệm chính xác 99%, bạn thử ra dương tính. Bạn đã mắc bệnh với xác suất 99%? Sai — nếu bệnh hiếm, con số thật có thể chỉ 50%, thậm chí 2%. Công thức Bayes là thứ duy nhất cho ra đáp án đúng, và nó là ruột của bộ lọc thư rác lẫn mọi hệ chẩn đoán AI.',
    theory:
      'XÁC SUẤT CÓ ĐIỀU KIỆN P(A | B) đọc là "xác suất A xảy ra KHI ĐÃ BIẾT B xảy ra". Biết thêm thông tin thì xác suất đổi: P(mưa) khác P(mưa | trời đang đầy mây đen).\n\nCÔNG THỨC BAYES lật ngược chiều điều kiện — từ cái ta ĐO ĐƯỢC sang cái ta MUỐN BIẾT:\n\nP(benh | duong) = P(duong | benh) * P(benh) / P(duong)\n\nTrong đó P(duong) là tổng hai đường dẫn tới kết quả dương tính:\nP(duong) = P(duong | benh) * P(benh) + P(duong | khong benh) * P(khong benh)\n\nGọi tên theo ngôn ngữ y tế: P(benh) là TỶ LỆ NỀN (prior — bao nhiêu phần trăm dân số mắc); P(duong | benh) là ĐỘ NHẠY (sensitivity — người bệnh thì máy báo dương đúng bao nhiêu phần); P(am | khong benh) là ĐỘ ĐẶC HIỆU (specificity), nên P(duong | khong benh) = 1 - độ đặc hiệu, chính là tỷ lệ BÁO ĐỘNG GIẢ.\n\nVí dụ kinh điển: bệnh hiếm 1% dân số, độ nhạy 99%, độ đặc hiệu 99%. Trong 10.000 người: 100 người bệnh → 99 báo dương đúng; 9.900 người khoẻ → 99 báo dương SAI. Tổng 198 ca dương, chỉ 99 là bệnh thật → xác suất 99/198 = 0,5. Xét nghiệm "chính xác 99%" mà dương tính chỉ đúng một nửa!\n\nBài học cốt tử cho AI: TỶ LỆ NỀN QUYẾT ĐỊNH TẤT CẢ. Bỏ quên tỷ lệ nền (base rate neglect) là lỗi tư duy phổ biến nhất khi đọc kết quả của mọi mô hình phân loại chuyện hiếm — phát hiện gian lận, phát hiện ung thư, lọc thư rác.',
    workedExample: {
      code: `# Bayes: benh hiem 1%, xet nghiem nhay 99%, dac hieu 99%
ty_le_nen = 0.01        # P(benh)
do_nhay = 0.99          # P(duong | benh)
do_dac_hieu = 0.99      # P(am | khong benh)

duong_that = ty_le_nen * do_nhay                        # bao dung
duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)         # bao dong gia
print(f"Duong that: {duong_that}")
print(f"Duong gia: {duong_gia}")

# Bayes: chia phan "dung" cho TONG moi ca duong tinh
ket_qua = duong_that / (duong_that + duong_gia)
print(f"P(benh | duong tinh) = {round(ket_qua, 4)}")`,
      stdinLines: [],
    },
    predict: {
      code: `p = 0.01\nse = 0.99\nsp = 0.99\ntu = p * se\nmau = tu + (1 - p) * (1 - sp)\nprint(round(tu / mau, 2))`,
      question: 'Xét nghiệm "chính xác 99%" cho bệnh chỉ 1% dân số mắc — code in ra gì?',
      choices: ['0.5', '0.99', '0.01', '0.98'],
      answerIndex: 0,
      explain:
        'Tử số 0.01*0.99 = 0.0099 (dương thật), mẫu thêm 0.99*0.01 = 0.0099 (dương giả) → 0.0099/0.0198 = 0.5. Vì người khoẻ ĐÔNG GẤP 99 LẦN người bệnh nên dù chỉ sai 1%, họ vẫn tạo ra số ca báo động giả bằng đúng số ca đúng.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự tính Bayes: hai đường dẫn tới dương tính → chia đường đúng cho tổng.',
      lines: [
        'duong_that = ty_le_nen * do_nhay',
        'duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)',
        'tong_duong = duong_that + duong_gia',
        'ket_qua = duong_that / tong_duong',
        'print(f"Xac suat mac benh: {round(ket_qua, 4)}")',
      ],
    },
    make: {
      prompt:
        'Viết máy tính Bayes cho bài toán xét nghiệm.\n\nChương trình đọc 3 dòng input() (đều là số thực từ 0 đến 1):\n- Dòng 1: tỷ lệ nền P(benh).\n- Dòng 2: độ nhạy P(duong | benh).\n- Dòng 3: độ đặc hiệu P(am | khong benh).\n\nTính P(benh | duong tinh) theo công thức Bayes rồi in đúng 1 dòng:\nXac suat mac benh: <kết quả làm tròn 4 chữ số thập phân bằng round()>\n\nVí dụ 0.01 / 0.99 / 0.99 → "Xac suat mac benh: 0.5".',
      starterCode: `ty_le_nen = float(input("Ty le nen: "))\ndo_nhay = float(input("Do nhay: "))\ndo_dac_hieu = float(input("Do dac hieu: "))\n# duong_that = ty_le_nen * do_nhay\n# duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)\n# In: Xac suat mac benh: <duong_that / (duong_that + duong_gia)> lam tron 4 chu so\n`,
      testCases: [
        {
          stdinLines: ['0.01', '0.99', '0.99'],
          expected: 'Xac suat mac benh: 0.5',
          match: 'contains',
          hidden: false,
          label: 'Bệnh hiếm 1% + xét nghiệm 99% → chỉ 0.5',
        },
        {
          stdinLines: ['0.5', '0.9', '0.9'],
          expected: 'Xac suat mac benh: 0.9',
          match: 'contains',
          hidden: false,
          label: 'Tỷ lệ nền 50% → dương tính đáng tin hẳn (0.9)',
        },
        {
          stdinLines: ['0.001', '0.99', '0.95'],
          expected: 'Xac suat mac benh: 0.0194',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bệnh 1/1000, đặc hiệu 95% → dương tính chỉ đúng ~2%',
        },
      ],
      hints: [
        'Hai đường dẫn tới kết quả dương tính: người BỆNH được báo đúng, và người KHOẺ bị báo nhầm. Tính riêng từng đường trước.',
        'Đường báo nhầm dùng 1 - do_dac_hieu (tỷ lệ báo động giả) nhân với 1 - ty_le_nen (tỷ lệ người khoẻ).',
        'Kết quả = duong_that / (duong_that + duong_gia); in bằng print(f"Xac suat mac benh: {round(ket_qua, 4)}").',
      ],
      sampleSolution: `ty_le_nen = float(input("Ty le nen: "))\ndo_nhay = float(input("Do nhay: "))\ndo_dac_hieu = float(input("Do dac hieu: "))\nduong_that = ty_le_nen * do_nhay\nduong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)\nket_qua = duong_that / (duong_that + duong_gia)\nprint(f"Xac suat mac benh: {round(ket_qua, 4)}")`,
    },
    homework:
      'Chạy chương trình với tỷ lệ nền 0.001, 0.01, 0.1, 0.5 trong khi giữ nguyên độ nhạy 0.99 và độ đặc hiệu 0.99. Ghi 4 kết quả ra giấy: chỉ đổi tỷ lệ nền mà kết quả nhảy từ ~9% lên ~99%. Rồi nối sang nghề: mô hình phát hiện gian lận báo "gian lận" cho một giao dịch — bạn cần biết thêm CON SỐ NÀO nữa mới dám khoá tài khoản khách hàng?',
    srsCards: [
      {
        hoi: 'Viết công thức Bayes cho bài toán xét nghiệm bệnh.',
        dap: 'P(benh | duong) = P(duong | benh)·P(benh) / [ P(duong | benh)·P(benh) + P(duong | khong benh)·P(khong benh) ] — tức lấy đường "dương đúng" chia cho TỔNG mọi đường dẫn tới kết quả dương tính (dương đúng + dương giả).',
      },
      {
        hoi: 'Vì sao xét nghiệm "chính xác 99%" cho bệnh hiếm 1% mà dương tính chỉ đúng 50%?',
        dap: 'Vì người khoẻ đông gấp 99 lần người bệnh, nên 1% báo nhầm trên nhóm khoẻ tạo ra số ca dương giả bằng đúng số ca dương thật. Tỷ lệ nền (base rate) quyết định độ đáng tin của kết quả, không phải riêng độ chính xác.',
      },
      {
        hoi: 'Độ nhạy và độ đặc hiệu là gì?',
        dap: 'Độ nhạy = P(báo dương | thật sự có bệnh) — bắt được bao nhiêu phần ca bệnh. Độ đặc hiệu = P(báo âm | không bệnh) — tha đúng bao nhiêu phần người khoẻ; 1 trừ độ đặc hiệu chính là tỷ lệ báo động giả.',
      },
    ],
  },
  {
    id: 'mathai-u1-l3',
    unitId: 'mathai-u1',
    language: 'python',
    title: 'Biến ngẫu nhiên, kỳ vọng & phương sai — tự cài mean và var',
    hook: 'Hai quán ăn cùng doanh thu trung bình 10 triệu/ngày. Quán A ngày nào cũng 10, quán B lúc 2 lúc 18. Trung bình giống hệt nhau nhưng đời sống của hai ông chủ khác nhau một trời một vực. Con số nói ra sự khác biệt đó là PHƯƠNG SAI.',
    theory:
      'BIẾN NGẪU NHIÊN là một đại lượng mà giá trị phụ thuộc kết quả ngẫu nhiên: số chấm xúc xắc, doanh thu ngày mai, điểm bài thi.\n\nKỲ VỌNG (expectation, E[X]) = giá trị trung bình về lâu dài. Khi biết xác suất từng giá trị: E[X] = tổng của (giá trị × xác suất của nó). Xúc xắc cân: E = (1+2+3+4+5+6)/6 = 3,5 — con số 3,5 không bao giờ xuất hiện trên mặt xúc xắc, nhưng trung bình 1.000 lần tung sẽ rất sát nó. Khi chỉ có dữ liệu thô, kỳ vọng ước lượng bằng TRUNG BÌNH CỘNG: sum(du_lieu) / len(du_lieu).\n\nPHƯƠNG SAI (variance) đo mức DÀN TRẢI quanh kỳ vọng:\nvar = trung bình của (mỗi giá trị trừ kỳ vọng) bình phương\n\nBình phương để (1) sai lệch âm và dương không triệt tiêu nhau, (2) phạt nặng những cú lệch lớn. Nhược điểm: đơn vị bị bình phương theo (triệu đồng bình phương — vô nghĩa), nên ta hay lấy căn bậc hai để về ĐỘ LỆCH CHUẨN (standard deviation) cùng đơn vị với dữ liệu.\n\nVì sao AI cần: hàm mất mát MSE (bài mathai-u3-l4) chính là phương sai của sai số; khởi tạo trọng số mạng nơ-ron chọn theo phương sai; chuẩn hoá dữ liệu (bài sau) chia cho độ lệch chuẩn; và cặp bias–variance của học máy mượn thẳng tên từ đây.\n\nLƯU Ý: công thức trên là phương sai TỔNG THỂ (chia cho n). Thống kê suy diễn có bản chia cho n-1 (phương sai mẫu) khi ước lượng từ mẫu nhỏ; khoá này dùng nhất quán bản chia cho n.',
    workedExample: {
      code: `# Hai quan cung ky vong 10 nhung phuong sai khac han
quan_a = [10, 10, 10, 10]
quan_b = [2, 18, 2, 18]

def ky_vong(ds):
    return sum(ds) / len(ds)            # trung binh cong

def phuong_sai(ds):
    tb = ky_vong(ds)                    # tam ve trung binh
    return sum((v - tb) ** 2 for v in ds) / len(ds)   # trung binh binh phuong lech

print(f"Quan A: ky vong {ky_vong(quan_a)}, phuong sai {phuong_sai(quan_a)}")
print(f"Quan B: ky vong {ky_vong(quan_b)}, phuong sai {phuong_sai(quan_b)}")
print(f"Do lech chuan quan B: {phuong_sai(quan_b) ** 0.5}")`,
      stdinLines: [],
    },
    predict: {
      code: `gia_tri = [1, 2, 3]\nxac_suat = [0.5, 0.25, 0.25]\nky_vong = sum(gia_tri[i] * xac_suat[i] for i in range(3))\nprint(ky_vong)`,
      question: 'Kỳ vọng của biến ngẫu nhiên này in ra bằng bao nhiêu?',
      choices: ['1.75', '2.0', '2.25', '1.5'],
      answerIndex: 0,
      explain:
        '1×0.5 + 2×0.25 + 3×0.25 = 0.5 + 0.5 + 0.75 = 1.75. Kỳ vọng KHÔNG phải trung bình cộng của các giá trị (đó là 2.0) — nó là trung bình CÓ TRỌNG SỐ theo xác suất, nên giá trị nào hay xảy ra thì kéo kết quả về phía nó.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự tính phương sai: trung bình trước, rồi bình phương độ lệch, rồi chia.',
      lines: [
        'so = [float(v) for v in input("Day so: ").split(",")]',
        'tb = sum(so) / len(so)',
        'tong_lech = sum((v - tb) ** 2 for v in so)',
        'ps = tong_lech / len(so)',
        'print(f"Phuong sai: {ps}")',
      ],
    },
    make: {
      prompt:
        'Tự cài mean và var — hai hàm bạn sẽ dùng lại suốt phần còn lại của khoá.\n\nChương trình đọc 1 dòng input(): các số cách nhau dấu phẩy, vd "1,2,3,4,5".\n\nIn đúng 2 dòng:\nKy vong: <trung bình cộng>\nPhuong sai: <trung bình của bình phương độ lệch, chia cho n>\n\nVí dụ "1,2,3,4,5" → kỳ vọng 3.0, phương sai (4+1+0+1+4)/5 = 2.0.',
      starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\n# tb = sum(so) / len(so)\n# ps = sum((v - tb) ** 2 for v in so) / len(so)\n# In 2 dong Ky vong: ... va Phuong sai: ...\n`,
      testCases: [
        {
          stdinLines: ['1,2,3,4,5'],
          expected: 'Ky vong: 3.0\nPhuong sai: 2.0',
          match: 'contains',
          hidden: false,
          label: 'Dãy 1..5 → kỳ vọng 3.0, phương sai 2.0',
        },
        {
          stdinLines: ['2,2,2'],
          expected: 'Phuong sai: 0.0',
          match: 'contains',
          hidden: false,
          label: 'Mọi giá trị giống nhau → phương sai 0.0',
        },
        {
          stdinLines: ['1,3'],
          expected: 'Ky vong: 2.0\nPhuong sai: 1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ 2 phần tử → (1+1)/2 = 1.0',
        },
      ],
      hints: [
        'Bước 1 luôn là trung bình: tb = sum(so) / len(so). Mọi thứ sau đó đều đo khoảng cách tới tb.',
        'Bình phương độ lệch từng phần tử rồi cộng dồn: sum((v - tb) ** 2 for v in so). Nhớ chia cho len(so) ở cuối.',
        'In: print(f"Ky vong: {tb}") rồi print(f"Phuong sai: {ps}") — không làm tròn, các test đều ra số chẵn.',
      ],
      sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\ntb = sum(so) / len(so)\nps = sum((v - tb) ** 2 for v in so) / len(so)\nprint(f"Ky vong: {tb}")\nprint(f"Phuong sai: {ps}")`,
    },
    homework:
      'Ghi lại số phút bạn thực sự học mỗi ngày trong 7 ngày, rồi tính kỳ vọng, phương sai và độ lệch chuẩn bằng chương trình vừa viết. Sau đó thử: cộng thêm 10 phút vào MỌI ngày — kỳ vọng đổi thế nào, phương sai đổi thế nào? Nhân đôi mọi ngày thì sao? Tự rút ra hai quy tắc rồi kiểm bằng code (đáp: cộng hằng số không đổi phương sai; nhân k thì phương sai nhân k²).',
    srsCards: [
      {
        hoi: 'Công thức kỳ vọng khi biết xác suất từng giá trị?',
        dap: 'E[X] = tổng của (giá trị × xác suất của giá trị đó) — trung bình CÓ TRỌNG SỐ. Khi chỉ có dữ liệu thô không biết xác suất, ta ước lượng kỳ vọng bằng trung bình cộng sum(du_lieu)/len(du_lieu).',
      },
      {
        hoi: 'Phương sai đo cái gì và tính thế nào?',
        dap: 'Đo mức dàn trải của dữ liệu quanh kỳ vọng: trung bình của bình phương độ lệch — sum((v − tb)²)/n. Bình phương để lệch âm/dương không triệt tiêu và để phạt nặng cú lệch lớn.',
      },
      {
        hoi: 'Vì sao hay dùng độ lệch chuẩn thay vì phương sai?',
        dap: 'Vì phương sai có đơn vị bị bình phương (triệu đồng bình phương — vô nghĩa). Lấy căn bậc hai của phương sai ra độ lệch chuẩn, cùng đơn vị với dữ liệu nên đọc được trực tiếp.',
      },
    ],
  },
  {
    id: 'mathai-u1-l4',
    unitId: 'mathai-u1',
    language: 'python',
    title: 'Phân phối thường gặp & định lý giới hạn trung tâm',
    hook: 'Tung một xúc xắc: sáu kết quả đều nhau, phẳng lì. Tung năm xúc xắc rồi lấy trung bình: kết quả tụm lại quanh 3,5 thành hình chuông. Phép màu đó có tên — định lý giới hạn trung tâm — và nó là lý do hình chuông xuất hiện ở khắp mọi nơi trong tự nhiên lẫn trong AI.',
    theory:
      'PHÂN PHỐI mô tả "giá trị nào hay xảy ra, giá trị nào hiếm". Ba phân phối phải thuộc:\n\n1. PHÂN PHỐI ĐỀU (uniform): mọi kết quả khả năng như nhau — xúc xắc cân, bốc số ngẫu nhiên. Đồ thị phẳng.\n2. PHÂN PHỐI NHỊ THỨC (binomial): đếm số lần THÀNH CÔNG trong n phép thử độc lập cùng xác suất p — tung xu 10 lần được mấy mặt ngửa, gửi 100 email được mấy người trả lời. Kỳ vọng = n·p.\n3. PHÂN PHỐI CHUẨN (normal / Gauss): hình chuông đối xứng quanh trung bình, đặc trưng bởi cặp (trung bình, độ lệch chuẩn). Quy tắc 68–95–99,7: khoảng 68% dữ liệu nằm trong 1 độ lệch chuẩn quanh trung bình, 95% trong 2, 99,7% trong 3.\n\nĐỊNH LÝ GIỚI HẠN TRUNG TÂM (CLT) nói điều đáng kinh ngạc: lấy TRUNG BÌNH của nhiều biến ngẫu nhiên độc lập — dù từng biến phân phối gì đi nữa, kể cả phẳng lì như xúc xắc — thì trung bình đó tiến về PHÂN PHỐI CHUẨN, và càng gộp nhiều biến, nó càng CO LẠI quanh kỳ vọng.\n\nHai hệ quả dùng hằng ngày: (1) hình chuông xuất hiện khắp nơi vì đại lượng thật thường là tổng của nhiều yếu tố nhỏ; (2) trung bình của mẫu lớn ổn định hơn hẳn giá trị lẻ — đo được bằng cách nhìn KHOẢNG (max trừ min) của các trung bình nhóm co lại so với khoảng của dữ liệu gốc. Bài Make hôm nay đo đúng sự co lại đó, hoàn toàn tất định.',
    workedExample: {
      code: `# CLT tat dinh: gop tung cap so lai, khoang bien thien co lai
goc = [1, 6, 2, 5, 3, 4, 1, 6]     # 8 lan "tung xuc xac" da ghi lai

tb_nhom = []
for i in range(0, len(goc), 2):    # cat thanh tung nhom 2 phan tu
    nhom = goc[i:i + 2]
    tb_nhom.append(sum(nhom) / 2)  # trung binh moi nhom

print(f"Du lieu goc: {goc}")
print(f"Trung binh cac nhom: {tb_nhom}")
print(f"Khoang goc: {max(goc) - min(goc)}")          # dan trai rong
print(f"Khoang nhom: {max(tb_nhom) - min(tb_nhom)}") # da co lai`,
      stdinLines: [],
    },
    predict: {
      code: `nhom = [1, 6]\nprint(sum(nhom) / len(nhom))`,
      question: 'Trung bình của nhóm hai giá trị cực trị 1 và 6 in ra là bao nhiêu?',
      choices: ['3.5', '7.0', '3.0', '6.0'],
      answerIndex: 0,
      explain:
        '(1 + 6)/2 = 3.5 — đúng bằng kỳ vọng của xúc xắc cân. Đây chính là cơ chế của CLT: hai giá trị lệch về hai phía triệt tiêu nhau, nên trung bình nhóm nằm gần tâm hơn hẳn từng giá trị lẻ.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự mô phỏng CLT tất định: cắt nhóm → trung bình từng nhóm → so khoảng.',
      lines: [
        'tb_nhom = []',
        'for i in range(0, len(so) - k + 1, k):',
        '    nhom = so[i:i + k]',
        '    tb_nhom.append(sum(nhom) / k)',
        'print(f"Khoang du lieu goc: {max(so) - min(so)}")',
        'print(f"Khoang trung binh nhom: {max(tb_nhom) - min(tb_nhom)}")',
      ],
    },
    make: {
      prompt:
        'Đo sự "co lại" của định lý giới hạn trung tâm bằng dữ liệu tất định.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dãy kết quả đã ghi lại, các số cách nhau dấu phẩy, vd "1,6,2,5,3,4".\n- Dòng 2: k — kích thước mỗi nhóm (số nguyên).\n\nCắt dãy thành các nhóm LIÊN TIẾP đúng k phần tử tính từ đầu (phần dư cuối dãy KHÔNG đủ k thì bỏ), tính trung bình mỗi nhóm, rồi in đúng 2 dòng:\nKhoang du lieu goc: <max trừ min của dãy gốc>\nKhoang trung binh nhom: <max trừ min của các trung bình nhóm>\n\nVí dụ "1,6,2,5,3,4" với k=2 → 3 nhóm đều có trung bình 3.5 → khoảng gốc 5.0, khoảng nhóm 0.0.',
      starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\nk = int(input("Kich thuoc nhom: "))\ntb_nhom = []\n# Dung vong for i in range(0, len(so) - k + 1, k) de cat nhom khong bi du\n# Tinh trung binh moi nhom roi in 2 dong khoang bien thien\n`,
      testCases: [
        {
          stdinLines: ['1,6,2,5,3,4', '2'],
          expected: 'Khoang du lieu goc: 5.0\nKhoang trung binh nhom: 0.0',
          match: 'contains',
          hidden: false,
          label: 'Ba nhóm đều ra 3.5 → khoảng nhóm co về 0.0',
        },
        {
          stdinLines: ['1,2,3,4', '2'],
          expected: 'Khoang du lieu goc: 3.0\nKhoang trung binh nhom: 2.0',
          match: 'contains',
          hidden: false,
          label: 'Nhóm 1.5 và 3.5 → khoảng nhóm 2.0, nhỏ hơn 3.0 của gốc',
        },
        {
          stdinLines: ['1,2,3,4,5', '2'],
          expected: 'Khoang du lieu goc: 4.0\nKhoang trung binh nhom: 2.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 5 phần tử với k=2 — phần tử cuối lẻ ra phải BỎ',
        },
      ],
      hints: [
        'Cắt nhóm bằng lát cắt: so[i:i + k] lấy k phần tử từ vị trí i.',
        'Để không tạo nhóm thiếu phần tử, cho vòng lặp chạy range(0, len(so) - k + 1, k) — dừng trước khi phần còn lại ngắn hơn k.',
        'Khoảng biến thiên là max(...) - min(...); áp cho cả dãy gốc "so" lẫn danh sách trung bình nhóm "tb_nhom".',
      ],
      sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\nk = int(input("Kich thuoc nhom: "))\ntb_nhom = []\nfor i in range(0, len(so) - k + 1, k):\n    nhom = so[i:i + k]\n    tb_nhom.append(sum(nhom) / k)\nprint(f"Khoang du lieu goc: {max(so) - min(so)}")\nprint(f"Khoang trung binh nhom: {max(tb_nhom) - min(tb_nhom)}")`,
    },
    homework:
      'Lấy một dãy 24 số bất kỳ (điểm các bài kiểm tra, số bước chân 24 ngày...) rồi chạy chương trình với k = 2, 3, 4, 6, 12. Ghi lại khoảng trung bình nhóm theo từng k: nó giảm dần thế nào? Trả lời bằng lời: vì sao khảo sát 1.000 người đáng tin hơn hẳn khảo sát 10 người, dù cả hai đều "chọn ngẫu nhiên"?',
    srsCards: [
      {
        hoi: 'Định lý giới hạn trung tâm (CLT) nói gì?',
        dap: 'Trung bình của nhiều biến ngẫu nhiên độc lập sẽ tiến về PHÂN PHỐI CHUẨN (hình chuông) dù từng biến gốc phân phối gì đi nữa; càng gộp nhiều biến, phân phối của trung bình càng co hẹp quanh kỳ vọng.',
      },
      {
        hoi: 'Ba phân phối cơ bản và dấu hiệu nhận ra chúng?',
        dap: 'Đều (uniform): mọi kết quả khả năng như nhau, đồ thị phẳng. Nhị thức (binomial): đếm số lần thành công trong n phép thử độc lập, kỳ vọng n·p. Chuẩn (normal): hình chuông đối xứng, mô tả bằng cặp trung bình và độ lệch chuẩn.',
      },
      {
        hoi: 'Quy tắc 68–95–99,7 của phân phối chuẩn nghĩa là gì?',
        dap: 'Khoảng 68% dữ liệu nằm trong phạm vi 1 độ lệch chuẩn quanh trung bình, 95% trong 2 độ lệch chuẩn, 99,7% trong 3 — nên giá trị lệch quá 3 độ lệch chuẩn là bất thường đáng nghi.',
      },
    ],
  },
  {
    id: 'mathai-u1-l5',
    unitId: 'mathai-u1',
    language: 'python',
    title: 'Thống kê mô tả — trung vị, phân vị và chuẩn hoá z-score',
    hook: 'Mười nhân viên lương 10 triệu, ông chủ lương 900 triệu: "lương trung bình công ty 91 triệu". Đúng về số học, dối trá về sự thật. Trung vị nói thẳng: 10 triệu. Đây là bài về những con số mô tả dữ liệu mà không để nó lừa mình.',
    theory:
      'TRUNG BÌNH (mean) rất nhạy với GIÁ TRỊ NGOẠI LAI (outlier): một con số khổng lồ kéo lệch cả bảng. TRUNG VỊ (median) — giá trị đứng giữa khi đã sắp xếp — thì trơ với ngoại lai: đổi lương ông chủ thành 9.000 triệu, trung vị vẫn y nguyên.\n\nCách tính trung vị: sắp xếp dãy; n lẻ thì lấy phần tử ở giữa (chỉ số n//2); n chẵn thì lấy trung bình hai phần tử giữa (chỉ số n//2 - 1 và n//2).\n\nPHÂN VỊ (percentile) tổng quát hoá ý đó: phân vị 90 là giá trị mà 90% dữ liệu nằm dưới. Ngành phần mềm sống bằng p95/p99 độ trễ — "trung bình 100ms" vô nghĩa nếu 1% người dùng phải chờ 8 giây.\n\nZ-SCORE (chuẩn hoá) trả lời câu "giá trị này lệch bao nhiêu ĐỘ LỆCH CHUẨN so với trung bình":\n\nz = (x - trung binh) / do lech chuan\n\nz = 0 nghĩa là đúng mức trung bình, z = 2 nghĩa là cao hơn trung bình 2 độ lệch chuẩn (thuộc nhóm ~2,5% dẫn đầu nếu dữ liệu hình chuông), z âm là dưới trung bình.\n\nVÌ SAO AI CẦN: các đặc trưng khác thang đo (tuổi 0–100 và thu nhập 0–100.000.000) thì đặc trưng số to nuốt trọn mọi phép đo khoảng cách (k-NN, k-means) và làm gradient descent zigzag chậm chạp. Chuẩn hoá z-score đưa mọi đặc trưng về cùng một thước đo "bao nhiêu độ lệch chuẩn" — đây là bước tiền xử lý phổ biến bậc nhất của nghề. Nhớ luật kèm theo (khoá ml, bài train/test): trung bình và độ lệch chuẩn phải tính TRÊN TẬP TRAIN rồi áp cho test, tính trên cả dữ liệu là RÒ RỈ.',
    workedExample: {
      code: `luong = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 900]  # trieu dong

tb = sum(luong) / len(luong)            # trung binh bi keo lech
sap = sorted(luong)                     # phai sap xep truoc khi lay trung vi
n = len(sap)
trung_vi = sap[n // 2] if n % 2 == 1 else (sap[n // 2 - 1] + sap[n // 2]) / 2

print(f"Trung binh: {round(tb, 2)}")
print(f"Trung vi: {trung_vi}")

do_lech = (sum((v - tb) ** 2 for v in luong) / n) ** 0.5   # do lech chuan
print(f"Do lech chuan: {round(do_lech, 2)}")
print(f"Z-score cua muc luong 10: {round((10 - tb) / do_lech, 2)}")`,
      stdinLines: [],
    },
    predict: {
      code: `so = sorted([5, 1, 9, 3])\nprint((so[1] + so[2]) / 2)`,
      question: 'Trung vị của dãy [5, 1, 9, 3] in ra là bao nhiêu?',
      choices: ['4.0', '3.0', '4.5', '5.0'],
      answerIndex: 0,
      explain:
        'Sắp xếp được [1, 3, 5, 9]; n = 4 là số chẵn nên trung vị là trung bình hai phần tử giữa: (3 + 5)/2 = 4.0. Bẫy hay gặp: quên sorted() rồi lấy giữa của dãy CHƯA sắp xếp — ra 9 và sai hoàn toàn.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự tính trung vị: sắp xếp → lấy độ dài → tách hai nhánh lẻ/chẵn.',
      lines: [
        'sap = sorted(so)',
        'n = len(sap)',
        'if n % 2 == 1:',
        '    trung_vi = sap[n // 2]',
        'else:',
        '    trung_vi = (sap[n // 2 - 1] + sap[n // 2]) / 2',
        'print(f"Trung vi: {trung_vi}")',
      ],
    },
    make: {
      prompt:
        'Viết máy thống kê mô tả: trung vị + chuẩn hoá z-score.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dãy dữ liệu, các số cách nhau dấu phẩy, vd "2,4,4,4,5,5,7,9".\n- Dòng 2: một giá trị x cần chuẩn hoá.\n\nIn đúng 2 dòng:\nTrung vi: <trung vị của dãy — nhớ sắp xếp trước; n chẵn thì lấy trung bình hai phần tử giữa>\nZ-score: <(x - trung bình) / độ lệch chuẩn, làm tròn 4 chữ số bằng round()>\n\nĐộ lệch chuẩn = căn bậc hai của phương sai chia cho n (như bài 3).\n\nVí dụ "2,4,4,4,5,5,7,9" và x = 7 → trung vị 4.5, trung bình 5.0, độ lệch chuẩn 2.0 → z = 1.0.',
      starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\nx = float(input("Gia tri can chuan hoa: "))\n# Sap xep de lay trung vi (nho tach nhanh n le / n chan)\n# Tinh trung binh, do lech chuan roi z = (x - tb) / do_lech\n`,
      testCases: [
        {
          stdinLines: ['2,4,4,4,5,5,7,9', '7'],
          expected: 'Trung vi: 4.5\nZ-score: 1.0',
          match: 'contains',
          hidden: false,
          label: 'Trung bình 5.0, độ lệch chuẩn 2.0 → z = 1.0',
        },
        {
          stdinLines: ['1,2,3', '3'],
          expected: 'Trung vi: 2.0\nZ-score: 1.2247',
          match: 'contains',
          hidden: false,
          label: 'n lẻ → trung vị là phần tử giữa; z làm tròn 4 chữ số',
        },
        {
          stdinLines: ['10,20', '10'],
          expected: 'Trung vi: 15.0\nZ-score: -1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: giá trị dưới trung bình → z ÂM',
        },
      ],
      hints: [
        'Luôn sorted(so) trước khi lấy trung vị — lấy phần tử giữa của dãy chưa sắp xếp là lỗi kinh điển.',
        'n lẻ (n % 2 == 1): sap[n // 2]. n chẵn: (sap[n // 2 - 1] + sap[n // 2]) / 2.',
        'Độ lệch chuẩn = (sum((v - tb) ** 2 for v in so) / len(so)) ** 0.5, rồi in round((x - tb) / do_lech, 4).',
      ],
      sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\nx = float(input("Gia tri can chuan hoa: "))\nsap = sorted(so)\nn = len(sap)\nif n % 2 == 1:\n    trung_vi = sap[n // 2]\nelse:\n    trung_vi = (sap[n // 2 - 1] + sap[n // 2]) / 2\ntb = sum(so) / n\ndo_lech = (sum((v - tb) ** 2 for v in so) / n) ** 0.5\nprint(f"Trung vi: {trung_vi}")\nprint(f"Z-score: {round((x - tb) / do_lech, 4)}")`,
    },
    homework:
      'Lấy 10 con số thật (giá 10 món trong quán quen, hoặc thời gian tải 10 trang web bạn hay vào). Tính trung bình và trung vị — chúng lệch nhau bao nhiêu? Rồi thêm MỘT giá trị ngoại lai gấp 20 lần vào dãy và tính lại: con số nào nhảy dựng, con số nào đứng yên? Cuối cùng, tính z-score của giá trị ngoại lai đó và giải thích vì sao |z| > 3 thường bị coi là bất thường.',
    srsCards: [
      {
        hoi: 'Khi nào nên dùng trung vị thay cho trung bình?',
        dap: 'Khi dữ liệu có giá trị ngoại lai hoặc phân phối lệch (lương, giá nhà, thời gian phản hồi). Trung bình bị một giá trị khổng lồ kéo lệch, còn trung vị — phần tử đứng giữa sau khi sắp xếp — trơ với ngoại lai.',
      },
      {
        hoi: 'Z-score tính thế nào và nói lên điều gì?',
        dap: 'z = (x − trung bình) / độ lệch chuẩn, nghĩa là "x cách trung bình bao nhiêu độ lệch chuẩn". z = 0 là đúng mức trung bình, z dương là trên, z âm là dưới; |z| > 3 thường coi là bất thường.',
      },
      {
        hoi: 'Vì sao phải chuẩn hoá đặc trưng trước khi huấn luyện mô hình?',
        dap: 'Vì đặc trưng khác thang đo (tuổi vs thu nhập) làm đặc trưng số lớn nuốt trọn phép đo khoảng cách và khiến gradient descent zigzag chậm. Chuẩn hoá z-score đưa mọi đặc trưng về cùng thước "bao nhiêu độ lệch chuẩn"; trung bình/độ lệch phải tính trên tập train rồi mới áp cho test, nếu không là rò rỉ dữ liệu.',
      },
    ],
  },
]
