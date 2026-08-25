// lessons/p2u6.ts — Bài học P2-U6: FILE & CSV (dữ liệu sống sót sau khi tắt máy).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u6-l1',
    unitId: 'p2-u6',
    language: 'python',
    title: 'Ghi và đọc file CSV — sổ sách không mất khi tắt máy',
    hook: 'Mọi chương trình bạn viết từ trước tới giờ có một điểm chung buồn: tắt là mất sạch. Bán cả ngày, đóng cửa sổ, doanh thu về 0. Hôm nay bạn cho dữ liệu một chỗ ở lâu dài: file.',
    theory:
      'Ghi/đọc file trong Python luôn dùng câu lệnh with — nó tự ĐÓNG file kể cả khi giữa chừng có lỗi:\n\nwith open("don.csv", "w", encoding="utf-8") as f:\n    f.write("tra da,2,10000\\n")\n\n- Tham số thứ hai là CHẾ ĐỘ: "w" ghi đè (xoá sạch nội dung cũ!), "a" ghi thêm vào cuối, "r" chỉ đọc.\n- encoding="utf-8" nên luôn ghi rõ để tiếng Việt không thành ký tự lạ.\n- f.write KHÔNG tự xuống dòng — bạn phải tự thêm \\n ở cuối mỗi dòng.\n\nĐọc lại:\n\nwith open("don.csv", "r", encoding="utf-8") as f:\n    for dong in f:\n        dong = dong.strip()      # bỏ ký tự xuống dòng ở cuối\n\nCSV chỉ là file text mà mỗi dòng là một bản ghi, các cột ngăn nhau bằng dấu phẩy. Nên cắt cột bằng chính .split(",") đã học ở U3: ten, so_luong, tien = dong.split(",") — nhớ mọi thứ đọc từ file đều là CHUỖI, muốn tính toán phải int(...) trước.\n\nCẩn thận: mở bằng "w" là xoá trắng file cũ. Sổ sách thật thường mở "a" để ghi thêm đơn mới.',
    workedExample: {
      code: `# Ghi 3 đơn hàng ra file rồi đọc lại để tính doanh thu
don = [("tra da", 2, 10000), ("nuoc cam", 1, 15000), ("sua dau", 2, 20000)]

with open("don.csv", "w", encoding="utf-8") as f:       # "w" = tạo mới/ghi đè
    for ten, sl, tien in don:
        f.write(f"{ten},{sl},{tien}\\n")                  # tự thêm xuống dòng

tong = 0
with open("don.csv", "r", encoding="utf-8") as f:       # đọc lại từ đĩa
    for dong in f:
        ten, sl, tien = dong.strip().split(",")          # cắt 3 cột
        print(f"{ten} x{sl}: {tien} dong")
        tong = tong + int(tien)                          # đọc từ file ra là CHUỖI

print(f"Tong doanh thu: {tong} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `with open("thu.txt", "w", encoding="utf-8") as f:\n    f.write("dong 1\\n")\nwith open("thu.txt", "w", encoding="utf-8") as f:\n    f.write("dong 2\\n")\n\nwith open("thu.txt", "r", encoding="utf-8") as f:\n    print(f.read().strip())`,
      question: 'Chạy đoạn code này, file cuối cùng chứa gì?',
      choices: ['dong 1', 'dong 2', 'dong 1 rồi dong 2', 'File rỗng'],
      answerIndex: 1,
      explain:
        'Lần mở thứ hai vẫn dùng chế độ "w" nên nội dung cũ bị XOÁ TRẮNG trước khi ghi. Muốn giữ dòng cũ và ghi thêm thì phải mở bằng chế độ "a" (append).',
    },
    parsons: {
      prompt: 'Xếp các dòng sau thành chương trình: ghi 2 đơn ra file rồi đọc lại in tổng tiền.',
      lines: [
        'with open("don.csv", "w", encoding="utf-8") as f:',
        '    f.write("tra da,10000\\n")',
        '    f.write("nuoc cam,15000\\n")',
        'tong = 0',
        'with open("don.csv", "r", encoding="utf-8") as f:',
        '    for dong in f:',
        '        ten, tien = dong.strip().split(",")',
        '        tong = tong + int(tien)',
        'print(f"Tong: {tong} dong")',
      ],
    },
    make: {
      prompt:
        'Cho sẵn danh sách đơn bán trong ngày:\ndon = [("tra da", 2, 10000), ("nuoc cam", 1, 15000), ("sua dau", 2, 20000)]\n(mỗi tuple là tên món, số lượng, thành tiền)\n\nChương trình phải:\n1. GHI danh sách này ra file "doanh_thu.csv", mỗi đơn một dòng dạng ten,so_luong,thanh_tien\n2. ĐỌC LẠI chính file đó (không được tính thẳng từ biến don) rồi in đúng hai dòng:\nSo don: <số dòng đọc được>\nTong doanh thu: <tổng thành tiền> dong\n\nKết quả đúng: "So don: 3" và "Tong doanh thu: 45000 dong".',
      starterCode: `don = [("tra da", 2, 10000), ("nuoc cam", 1, 15000), ("sua dau", 2, 20000)]\n\n# 1) Ghi ra file doanh_thu.csv\n\n# 2) Đọc lại file, đếm số đơn và cộng tổng tiền, rồi in 2 dòng theo mẫu\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'So don: 3\nTong doanh thu: 45000 dong',
          match: 'contains',
          hidden: false,
          label: 'Ghi 3 đơn rồi đọc lại → tổng 45.000đ',
        },
        {
          stdinLines: [],
          expected: 'Tong doanh thu: 45000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chạy lại lần nữa vẫn ra đúng (file cũ không được cộng dồn)',
        },
      ],
      hints: [
        'Ghi: mở với chế độ "w" rồi lặp for ten, sl, tien in don: f.write(f"{ten},{sl},{tien}\\n"). Thiếu \\n là cả 3 đơn dính thành một dòng.',
        'Đọc: mở lại với "r", lặp for dong in f:, mỗi dòng nhớ .strip() trước khi .split(",") — nếu không, cột cuối sẽ dính ký tự xuống dòng và int() sẽ lỗi.',
        'Cộng tổng: giá trị đọc từ file là CHUỖI, phải int(tien) rồi mới cộng. Đếm số đơn bằng một biến đếm tăng dần trong vòng lặp đọc.',
      ],
      sampleSolution: `don = [("tra da", 2, 10000), ("nuoc cam", 1, 15000), ("sua dau", 2, 20000)]\n\nwith open("doanh_thu.csv", "w", encoding="utf-8") as f:\n    for ten, so_luong, tien in don:\n        f.write(f"{ten},{so_luong},{tien}\\n")\n\nso_don = 0\ntong = 0\nwith open("doanh_thu.csv", "r", encoding="utf-8") as f:\n    for dong in f:\n        dong = dong.strip()\n        if dong == "":\n            continue\n        ten, so_luong, tien = dong.split(",")\n        so_don = so_don + 1\n        tong = tong + int(tien)\n\nprint(f"So don: {so_don}")\nprint(f"Tong doanh thu: {tong} dong")`,
    },
    homework:
      'Về nhà: đổi chế độ ghi thành "a" rồi chạy chương trình 3 lần — mở file bằng Excel/Google Sheets xem dữ liệu dồn lại thế nào. Đó chính xác là cách sổ bán hàng thật lưu đơn: ghi thêm, không ghi đè.',
  },
]
