// lessons/p1u2.ts — Bài học P1-U2 (PR-L4). Khuôn: xem lessons/p1u4.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u2-l1',
    unitId: 'p1-u2',
    title: 'Biến và phép toán — quản lý tiền chợ bằng Python',
    hook: 'Đi chợ mua rau 15.000đ, mua thịt 45.000đ — bạn nhẩm tổng trong đầu ngay lập tức. Máy tính cũng cần một "chỗ nhớ" để giữ từng con số đó lại rồi tính toán. Chỗ nhớ ấy gọi là BIẾN.',
    theory:
      'Biến (variable) là một cái "hộp có tên" dùng để lưu dữ liệu, để lát sau dùng lại mà không phải gõ lại giá trị. Đặt biến bằng dấu = (gọi là gán, KHÔNG phải "bằng" như trong toán):\n\ngia_rau = 15000\n\nDòng trên nghĩa là: tạo một hộp tên gia_rau, bỏ số 15000 vào đó. Từ giờ, gõ gia_rau ở bất cứ đâu, máy sẽ tự thay bằng giá trị 15000.\n\nPython có nhiều kiểu dữ liệu (data type), hai kiểu cơ bản nhất:\n- Số nguyên (int): 15000, 3, -2 — không có dấu chấm thập phân.\n- Chuỗi (str): "rau muong", "Cô Ba" — chữ nằm trong dấu ngoặc kép.\n\nPhép toán (operator) trên số: + (cộng), - (trừ), * (nhân), / (chia lấy số thập phân), // (chia lấy phần nguyên). Ví dụ tong = gia_rau + gia_thit.\n\nLưu ý: tên biến ở Việt Nam nên viết KHÔNG DẤU và không có khoảng trắng (dùng gạch dưới _ thay khoảng trắng) — ví dụ gia_rau, không phải "giá rau" hay "gia rau".',
    workedExample: {
      code: `# Khai báo 2 biến lưu giá hai món ở quán nước
gia_tra_da = 5000       # biến số nguyên: giá trà đá
gia_sinh_to = 20000      # biến số nguyên: giá sinh tố

# Cộng hai biến lại thành biến mới
tong_tien = gia_tra_da + gia_sinh_to

# In kết quả ra màn hình, ghép chữ và số bằng dấu phẩy trong print()
print("Tong tien:", tong_tien, "dong")`,
      stdinLines: [],
    },
    predict: {
      code: `so_luong = 3\ndon_gia = 7000\nthanh_tien = so_luong * don_gia\nprint(thanh_tien)`,
      question: 'Chạy đoạn code này, máy in ra số nào?',
      choices: ['19000', '21000', '7003', '3000'],
      answerIndex: 1,
      explain:
        'thanh_tien = so_luong * don_gia = 3 * 7000 = 21000. Dấu * là phép nhân, không phải phép cộng hay ghép số — kết quả in ra là 21000.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình tính tiền mua 2 ổ bánh mì, mỗi ổ 12.000 đồng, rồi in tổng tiền.',
      lines: [
        'so_luong = 2',
        'don_gia = 12000',
        'tong_tien = so_luong * don_gia',
        'print("Tong tien banh mi:", tong_tien)',
      ],
    },
    make: {
      prompt:
        'Bạn Lan mua đồ dùng học tập: 4 quyển vở, mỗi quyển 8.000 đồng, và 1 hộp bút giá 25.000 đồng. Viết chương trình dùng biến để tính TỔNG TIỀN (không cần input, cứ gán số cố định như trên) rồi in đúng dòng:\nTong tien: <số tiền> dong\n(không dấu tiếng Việt, đúng khoảng trắng như mẫu)',
      starterCode: `so_vo = 4\ngia_vo = 8000\ngia_hop_but = 25000\n# Tính tong_tien rồi in: Tong tien: <tong_tien> dong\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Tong tien: 57000 dong',
          match: 'contains',
          hidden: false,
          label: '4 vở × 8.000 + hộp bút 25.000 = 57.000 đồng',
        },
        {
          stdinLines: [],
          expected: 'Tong tien:',
          match: 'contains',
          hidden: false,
          label: 'Phải in đúng nhãn "Tong tien:" ở đầu dòng',
        },
        {
          stdinLines: [],
          expected: 'dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: phải có đơn vị "dong" ở cuối dòng',
        },
      ],
      hints: [
        'Nhớ ví dụ mẫu: cộng 2 biến lại được biến mới. Ở đây cần NHÂN số vở với giá vở trước, rồi mới CỘNG với giá hộp bút.',
        'tien_vo = so_vo * gia_vo (dùng dấu *). Sau đó tong_tien = tien_vo + gia_hop_but.',
        'In bằng: print("Tong tien:", tong_tien, "dong") — hoặc dùng f-string print(f"Tong tien: {tong_tien} dong").',
      ],
      sampleSolution: `so_vo = 4\ngia_vo = 8000\ngia_hop_but = 25000\n\ntien_vo = so_vo * gia_vo\ntong_tien = tien_vo + gia_hop_but\n\nprint("Tong tien:", tong_tien, "dong")`,
    },
    homework:
      'Về nhà: liệt kê 3 món đồ THẬT bạn hay mua (ví dụ: nước ngọt, kẹo, thẻ điện thoại), gán mỗi món một biến giá tiền và một biến số lượng, rồi viết chương trình tính tổng tiền của cả 3 món bằng biến.',
  },
]
