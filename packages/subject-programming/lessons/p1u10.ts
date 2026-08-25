// lessons/p1u10.ts — Bài học P1-U10: milestone chặng P1, ráp toàn bộ kiến thức
// (biến + input/output + if + vòng lặp) thành một chương trình nhỏ hoàn chỉnh.
// Đề bài KHÁC dự án trục T1 "Cửa hàng của tôi" (máy tính tiền cửa hàng) — chọn "máy bán
// nước tự động" theo gợi ý brief, tránh trùng nội dung với projectSteps.ts.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U10_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u10-l1',
    unitId: 'p1-u10',
    language: 'python',
    title: 'Milestone chặng P1 — ráp lại thành máy bán nước tự động',
    hook: 'Bạn đã học đủ 4 "viên gạch" của lập trình: biến, nhập/xuất, rẽ nhánh if, vòng lặp. Bài này không dạy gì mới — mà thử thách bạn RÁP cả 4 viên gạch đó lại thành một chương trình thật sự hữu ích: một cái MÁY BÁN NƯỚC TỰ ĐỘNG.',
    theory:
      'Một chương trình "làm được việc" thường có khuôn quen thuộc:\n\n1. Khởi tạo BIẾN TÍCH LŨY trước vòng lặp (ví dụ tổng doanh thu = 0) — vì nó cần "nhớ" giá trị qua nhiều lượt lặp.\n\n2. Dùng VÒNG LẶP (for/while) để lặp lại một việc nhiều lần mà không phải copy code — ví dụ lặp qua từng lượt khách mua hàng.\n\n3. Trong mỗi lượt lặp, dùng INPUT để nhận dữ liệu người dùng, rồi dùng IF/ELIF/ELSE để RẼ NHÁNH theo dữ liệu đó — ví dụ chọn đúng loại nước, kiểm tra đủ tiền hay không.\n\n4. Cập nhật biến tích lũy TRONG vòng lặp (ví dụ cộng dồn doanh thu mỗi lần bán được).\n\n5. In KẾT QUẢ TỔNG SAU KHI vòng lặp đã chạy xong — không in ở trong vòng lặp, vì lúc đó dữ liệu chưa đầy đủ.\n\nĐây chính xác là khuôn bạn sẽ dùng lại ở mọi chương trình lớn hơn về sau — kể cả dự án "Cửa hàng của tôi" bạn đang xây song song.',
    workedExample: {
      code: `# Trạm đèn giao thông mini: lặp 3 lượt, mỗi lượt nhập màu đèn rồi in hành động tương ứng
for luot in range(1, 4):                       # lặp đúng 3 lượt: luot = 1, 2, 3
    mau_den = input(f"Luot {luot} - Mau den (xanh/vang/do)? ")

    if mau_den == "xanh":                       # rẽ nhánh theo dữ liệu vừa nhập
        print("Duoc di")
    elif mau_den == "vang":
        print("Giam toc do, chuan bi dung")
    else:
        print("Dung lai")`,
      stdinLines: ['xanh', 'vang', 'do'],
    },
    predict: {
      code: `tong = 0\nfor i in range(3):\n    if i == 1:\n        tong = tong + 10\n    else:\n        tong = tong + 1\nprint(tong)`,
      question: 'Chạy đoạn code này, máy in ra số nào?',
      choices: ['3', '11', '12', '13'],
      answerIndex: 2,
      explain:
        'i chạy lần lượt 0, 1, 2. i=0 (khác 1) → tong = 0+1 = 1. i=1 → tong = 1+10 = 11. i=2 (khác 1) → tong = 11+1 = 12. In ra 12 — tổng được TÍCH LŨY qua từng vòng lặp, y như biến tổng doanh thu trong bài máy bán nước.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình đếm xem trong danh sách điểm cho sẵn có bao nhiêu bạn ĐẠT (điểm >= 5).',
      lines: [
        'diem_list = [8, 4, 6, 3, 9]',
        'so_dat = 0',
        'for diem in diem_list:',
        '    if diem >= 5:',
        '        so_dat += 1',
        'print(f"So hoc sinh dat: {so_dat}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình mô phỏng MÁY BÁN NƯỚC TỰ ĐỘNG, có 3 loại nước cố định:\n- 1 = Trà đá, giá 3000đ\n- 2 = Nước suối, giá 8000đ\n- 3 = Nước ngọt, giá 12000đ (số khác 1, 2 đều tính là loại này)\n\nBước 1: đọc số lượt mua (so_luot) bằng input().\nBước 2: lặp đúng so_luot lần, MỖI lượt đọc: loại nước (số) rồi số tiền khách đưa (tien_dua) — cả hai bằng input().\nBước 3: trong mỗi lượt, nếu tien_dua nhỏ hơn giá → in dòng "Thieu tien, khong ban duoc" (không cộng doanh thu). Nếu đủ tiền → in "Tien thua: <số tiền thừa> dong" VÀ cộng đúng GIÁ NƯỚC (không phải tien_dua) vào tổng doanh thu.\nBước 4: sau khi hết vòng lặp, in dòng "Tong doanh thu: <tổng> dong".',
      starterCode: `so_luot = int(input("May ban nuoc: co may luot mua? "))
tong_doanh_thu = 0

for i in range(so_luot):
    loai = int(input("Chon loai nuoc (1=Tra da, 2=Nuoc suoi, 3=Nuoc ngot): "))
    tien_dua = int(input("Khach dua bao nhieu tien? "))
    # TODO: xác định gia theo loai, rồi kiểm tien_dua đủ hay thiếu, in đúng dòng yêu cầu

print(f"Tong doanh thu: {tong_doanh_thu} dong")
`,
      testCases: [
        {
          stdinLines: ['1', '1', '5000'],
          expected: 'Tien thua: 2000 dong',
          match: 'contains',
          hidden: false,
          label: 'Mua 1 lượt trà đá (3000đ), đưa 5000đ',
        },
        {
          stdinLines: ['2', '2', '8000', '3', '10000'],
          expected: 'Tong doanh thu: 8000 dong',
          match: 'contains',
          hidden: false,
          label: 'Mua 2 lượt: lượt 1 đủ tiền, lượt 2 thiếu tiền (không cộng doanh thu)',
        },
        {
          stdinLines: ['0'],
          expected: 'Tong doanh thu: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — ca biên: không có lượt mua nào',
        },
        {
          stdinLines: ['1', '3', '12000'],
          expected: 'Tien thua: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — ca biên: đưa vừa đúng giá tiền, tiền thừa bằng 0',
        },
      ],
      hints: [
        'Nhớ khuôn ở phần lý thuyết: biến tong_doanh_thu = 0 phải khởi tạo TRƯỚC vòng lặp for, rồi cộng dồn BÊN TRONG vòng lặp — không khai báo lại nó mỗi lượt.',
        'Xác định gia bằng if/elif/else giống bài U4 (bậc thang): if loai == 1: gia = 3000, elif loai == 2: gia = 8000, else: gia = 12000.',
        'Kiểm đủ tiền bằng if/else: if tien_dua < gia thì in "Thieu tien, khong ban duoc"; else thì tính thua = tien_dua - gia, in "Tien thua: {thua} dong" VÀ cộng gia (không phải tien_dua) vào tong_doanh_thu.',
      ],
      sampleSolution: `so_luot = int(input("May ban nuoc: co may luot mua? "))
tong_doanh_thu = 0

for i in range(so_luot):
    loai = int(input("Chon loai nuoc (1=Tra da, 2=Nuoc suoi, 3=Nuoc ngot): "))
    tien_dua = int(input("Khach dua bao nhieu tien? "))

    if loai == 1:
        gia = 3000
    elif loai == 2:
        gia = 8000
    else:
        gia = 12000

    if tien_dua < gia:
        print("Thieu tien, khong ban duoc")
    else:
        thua = tien_dua - gia
        tong_doanh_thu = tong_doanh_thu + gia
        print(f"Tien thua: {thua} dong")

print(f"Tong doanh thu: {tong_doanh_thu} dong")`,
    },
    homework:
      'Về nhà mở rộng máy bán nước: thêm một loại nước thứ 4 tuỳ bạn đặt tên và giá, rồi mời một người thân "làm khách" mua thử — nhập số liệu y như một cái máy bán nước thật ở trường hoặc công ty. Ghi lại xem chương trình có bị "bối rối" ở tình huống nào không (ví dụ khách đưa đúng 0 đồng).',
  },
]
