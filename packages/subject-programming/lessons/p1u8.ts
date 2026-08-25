// lessons/p1u8.ts — Bài học P1-U8: đọc code và tìm lỗi (trace + lỗi kinh điển người mới).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P1U8_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p1-u8-l1',
    unitId: 'p1-u8',
    language: 'python',
    title: 'Đọc code và tìm lỗi — trace trên giấy',
    hook: 'Code không chạy không phải vì máy tính "ghét" bạn — mà vì một lỗi rất nhỏ: sai một chữ hoa, thiếu một dấu ngoặc, lệch một khoảng trắng. Hôm nay bạn học cách ĐỌC code như máy tính đọc, để tự tìm ra lỗi thay vì đoán mò.',
    theory:
      'TRACE CODE nghĩa là chạy chương trình bằng MẮT và TAY trên giấy: đọc từng dòng theo đúng thứ tự, ghi lại giá trị của từng biến sau mỗi dòng — y như máy tính làm, chỉ chậm hơn.\n\nBốn lỗi người mới hay gặp NHẤT:\n\n1. Sai tên biến (phân biệt HOA/THƯỜNG): Python coi "So_du" và "so_du" là HAI BIẾN KHÁC NHAU hoàn toàn. Gõ nhầm một chữ hoa là chương trình báo lỗi "NameError: biến chưa tồn tại" — dù bạn "chắc chắn" đã gán nó rồi.\n\n2. Thiếu int()/float() khi đọc input(): input() LUÔN trả về CHUỖI, kể cả khi người dùng gõ số. "5" + "3" không phải 8, mà là ghép chuỗi thành "53"; còn "5" * 3 lại nhân LẶP chuỗi thành "555" chứ không phải phép nhân số học 15.\n\n3. Lệch thụt lề (indentation): Python dùng THỤT LỀ để biết dòng nào thuộc khối nào (thay vì dấu ngoặc {} như nhiều ngôn ngữ khác). Thụt lề thừa/thiếu một khoảng trắng là chương trình báo lỗi "IndentationError", hoặc tệ hơn — chạy được nhưng SAI Ý vì dòng đó bị đưa nhầm vào (hoặc ra khỏi) một khối if/for.\n\n4. Dùng biến chưa được gán: nếu một biến chỉ được gán bên trong nhánh if, mà nhánh đó KHÔNG chạy (điều kiện sai) và không có else, thì dòng print(biến) phía sau sẽ báo lỗi vì biến đó chưa từng tồn tại ở nhánh kia.\n\nCách tự dò: đọc từ trên xuống, với MỖI dòng tự hỏi "biến nào vừa được tạo/đổi giá trị, giá trị mới là gì" — rồi so với điều mình MUỐN chương trình làm.',
    workedExample: {
      code: `# Đếm xem trong danh sách điểm cho sẵn có bao nhiêu bạn đạt (>= 5) — bản đã sửa đúng
diem_list = [8, 4, 6, 3, 9]   # danh sách điểm 5 bạn, không cần nhập tay
so_dat = 0                    # biến TÍCH LŨY phải khởi tạo TRƯỚC vòng lặp

for diem in diem_list:        # lặp qua từng điểm trong danh sách
    if diem >= 5:              # thụt lề đúng 4 dấu cách để if nằm TRONG vòng lặp
        so_dat += 1             # thụt lề thêm 4 dấu cách nữa để nằm TRONG if

print(f"So hoc sinh dat: {so_dat}")`,
      stdinLines: [],
    },
    predict: {
      code: `Diem = 9\ndiem = 7\nprint(diem)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['9', '7', 'Lỗi biến chưa được gán', 'Không in gì cả'],
      answerIndex: 1,
      explain:
        'Diem (chữ D hoa) và diem (chữ d thường) là HAI BIẾN KHÁC NHAU với Python. Dòng print(diem) chỉ đọc biến diem (thường) — biến này được gán 7 ở dòng ngay trước, nên in ra 7. Biến Diem = 9 hoàn toàn không liên quan.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình đếm xem từ 1 đến n có bao nhiêu số CHẴN (chia hết cho 2), giữ đúng thụt lề.',
      lines: [
        'n = int(input("Đếm số chẵn tới số mấy? "))',
        'dem = 0',
        'for i in range(1, n + 1):',
        '    if i % 2 == 0:',
        '        dem += 1',
        'print(f"Co {dem} so chan")',
      ],
    },
    make: {
      prompt:
        'Đoạn code dưới đây (trong ô "code khởi đầu") ĐỊNH tính số tiền còn lại trong ví điện tử sau khi mua vé xem phim (giá vé 75.000đ/vé), nhưng có tới 3 LỖI khiến nó chạy sai hoặc không chạy được. Hãy tìm và SỬA cả 3 lỗi, rồi viết lại chương trình cho đúng.\n\nChương trình đọc: số vé muốn mua, rồi số dư trong ví — bằng input(). In ra đúng 1 dòng dạng:\nCon lai: <số tiền> dong\n\n(Số tiền có thể ÂM nếu không đủ tiền — vẫn in bình thường, không cần kiểm tra riêng.)',
      starterCode: `so_ve = input("Mua may ve? ")
So_du = int(input("So du trong vi? "))
gia_ve = 75000

tong_tien = so_ve * gia_ve
    con_lai = so_du - tong_tien
print(f"Con lai: {con_lai} dong")
`,
      testCases: [
        {
          stdinLines: ['2', '200000'],
          expected: 'Con lai: 50000 dong',
          match: 'contains',
          hidden: false,
          label: 'Mua 2 vé, đủ tiền (200.000 - 150.000)',
        },
        {
          stdinLines: ['1', '50000'],
          expected: 'Con lai: -25000 dong',
          match: 'contains',
          hidden: false,
          label: 'Mua 1 vé, không đủ tiền → số dư âm',
        },
        {
          stdinLines: ['0', '100000'],
          expected: 'Con lai: 100000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — ca biên: không mua vé nào (0 vé)',
        },
        {
          stdinLines: ['3', '225000'],
          expected: 'Con lai: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn — ca biên: vừa đúng số tiền, còn lại 0',
        },
      ],
      hints: [
        'Đọc lại phần lý thuyết: input() luôn trả về CHUỖI — muốn tính "so_ve * gia_ve" theo kiểu số học thì phải bọc int() quanh input() của số vé.',
        'Nhìn kỹ TÊN BIẾN ở 2 dòng đầu: "So_du" (chữ S hoa) và "so_du" (chữ s thường) đang bị coi là hai biến khác nhau — chọn MỘT cách viết và dùng thống nhất từ đầu đến cuối.',
        'Dòng "con_lai = so_du - tong_tien" đang bị thụt lề THỪA một cấp (4 dấu cách dư) — nó phải thẳng hàng với dòng "tong_tien = ..." phía trên, không nằm lồng trong khối nào cả.',
      ],
      sampleSolution: `so_ve = int(input("Mua may ve? "))
so_du = int(input("So du trong vi? "))
gia_ve = 75000

tong_tien = so_ve * gia_ve
con_lai = so_du - tong_tien
print(f"Con lai: {con_lai} dong")`,
    },
    homework:
      'Về nhà: mở lại một bài Make bạn đã làm ở các unit trước (ví dụ bài tiền điện U4), CỐ TÌNH gõ sai một tên biến (đổi hoa/thường) hoặc xoá một chỗ int(), chạy thử xem Python báo lỗi gì — rồi tự sửa lại. Càng quen mặt các lỗi này, sau này gặp lại bạn sẽ sửa trong vài giây.',
    srsCards: [
      {
        hoi: 'Python coi "So_du" và "so_du" là một biến hay hai biến?',
        dap: 'HAI biến khác nhau hoàn toàn — Python phân biệt HOA/THƯỜNG trong tên biến. Gõ nhầm hoa/thường gây lỗi NameError.',
      },
      {
        hoi: 'Vì sao "5" + "3" không ra 8?',
        dap: 'Vì "5" và "3" ở đây là CHUỖI (chưa ép kiểu int), nên + là GHÉP chuỗi, cho ra "53" chứ không phải phép cộng số học.',
      },
      {
        hoi: 'TRACE CODE nghĩa là làm gì?',
        dap: 'Chạy chương trình bằng mắt và tay trên giấy: đọc từng dòng theo thứ tự, ghi lại giá trị từng biến sau mỗi dòng, y như máy tính làm.',
      },
    ],
  },
]
