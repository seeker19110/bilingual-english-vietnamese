// lessons/p2u10.ts — Bài học P2-U10: MILESTONE chặng P2 — ráp toàn bộ kiến thức bậc.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U10_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u10-l1',
    unitId: 'p2-u10',
    language: 'python',
    title: 'Milestone P2 — sổ bán hàng một phiên: dict + hàm + vòng lặp + try/except',
    hook: 'Đây là bài chốt bậc P2. Bạn sẽ ráp đúng những thứ vừa học — dict tra giá, hàm chia việc, vòng lặp nhận nhiều đơn, try/except chống nhập bậy — thành một sổ bán hàng chạy được cả phiên mà không sập lần nào.',
    theory:
      'Bậc P2 cho bạn 5 công cụ, bài này dùng cả 5 cùng lúc:\n\n1. DICT để tra giá theo tên món (U4) — nhanh và đúng hơn hẳn dãy if/elif dài dằng dặc.\n2. HÀM để đặt tên cho từng việc (U1) và tách logic khỏi giao diện (U9).\n3. VÒNG LẶP while để nhận đơn liên tiếp cho tới khi chủ quán gõ "xong" — kiểu vòng lặp "chưa biết trước bao nhiêu vòng", khác for range() của bậc P1.\n4. LIST/biến tích luỹ để cộng dồn doanh thu và đếm số đơn (U2).\n5. TRY/EXCEPT để một lần gõ bậy chỉ hỏng ĐÚNG đơn đó, không giết cả phiên bán hàng (U7).\n\nMột thói quen quan trọng của bài dài: viết ra HỢP ĐỒNG trước khi code — chương trình nhận gì, in gì, gặp dữ liệu xấu thì làm gì. Đề dưới đây đã viết sẵn hợp đồng đó; trong dự án thật, bạn là người phải tự viết nó ra giấy trước khi gõ dòng đầu tiên.\n\nMẹo gỡ rối: chạy thử từng phần nhỏ trước (chỉ vòng lặp thoát bằng "xong" đã, rồi mới thêm tính tiền, rồi mới thêm try/except) — đừng viết một mạch 30 dòng rồi mới chạy.',
    workedExample: {
      code: `# Bộ khung nhỏ của bài chốt: vòng lặp nhận đơn tới khi gõ "xong"
MENU = {"tra da": 5000}

def main():
    tong = 0
    while True:                                  # lặp chưa biết trước số vòng
        ten = input("Mon (xong de ket thuc): ").strip().lower()
        if ten == "xong":                        # điều kiện thoát
            break
        try:
            so_luong = int(input("So luong: "))
        except ValueError:                       # gõ bậy: bỏ qua ĐÚNG đơn này
            print("Du lieu khong hop le")
            continue
        tong = tong + MENU.get(ten, 0) * so_luong
    print(f"Tong: {tong} dong")

main()`,
      stdinLines: ['tra da', '2', 'xong'],
    },
    predict: {
      code: `tong = 0\nfor so in [1, 2, 3]:\n    if so == 2:\n        continue\n    tong = tong + so\nprint(tong)`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['6', '4', '3', '1'],
      answerIndex: 1,
      explain:
        'continue BỎ QUA phần còn lại của vòng hiện tại rồi chạy tiếp vòng sau — nên số 2 không được cộng, kết quả là 1 + 3 = 4. Khác với break: break thoát hẳn vòng lặp (khi đó kết quả sẽ là 1).',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành vòng lặp nhận đơn: gõ "xong" thì dừng, món không có thì báo rồi bỏ qua.',
      lines: [
        'MENU = {"tra da": 5000}',
        'while True:',
        '    ten = input("Mon: ").strip().lower()',
        '    if ten == "xong":',
        '        break',
        '    if ten not in MENU:',
        '        print("Khong co mon nay")',
        '        continue',
        '    print(f"Gia: {MENU[ten]} dong")',
      ],
    },
    make: {
      prompt:
        'SỔ BÁN HÀNG MỘT PHIÊN — bài chốt bậc P2.\n\nMENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\nChương trình lặp lại các bước sau cho tới khi kết thúc phiên:\n1. Đọc TÊN món bằng input(). Nếu là "xong" (không phân biệt hoa thường, bỏ khoảng trắng thừa) thì kết thúc phiên.\n2. Ngược lại, đọc thêm một dòng SỐ LƯỢNG (luôn đọc, kể cả khi tên món sai).\n3. Xử lý:\n   - Món không có trong MENU → in "Khong co mon nay", KHÔNG tính vào doanh thu.\n   - Số lượng không phải số nguyên → in "Du lieu khong hop le", KHÔNG tính vào doanh thu.\n   - Hợp lệ → in "Da ghi: <tiền> dong" và cộng vào doanh thu, tăng số đơn.\n\nKết thúc phiên, in đúng hai dòng:\nSo don: <số đơn hợp lệ>\nTong: <tổng doanh thu> dong\n\nChương trình không được văng lỗi trong bất kỳ trường hợp nào.',
      starterCode: `MENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\ndef main():\n    # Vòng lặp nhận đơn tới khi gõ "xong", cộng dồn số đơn và doanh thu\n    ...\n\nmain()\n`,
      testCases: [
        {
          stdinLines: ['tra da', '2', 'nuoc cam', '1', 'xong'],
          expected: 'So don: 2\nTong: 25000 dong',
          match: 'contains',
          hidden: false,
          label: 'Phiên bình thường: 2 trà đá + 1 nước cam → 25.000đ',
        },
        {
          stdinLines: ['ca phe', '1', 'tra da', '2', 'xong'],
          expected: 'Khong co mon nay',
          match: 'contains',
          hidden: false,
          label: 'Món ngoài menu phải bị báo và bỏ qua',
        },
        {
          stdinLines: ['ca phe', '1', 'tra da', '2', 'xong'],
          expected: 'So don: 1\nTong: 10000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đơn hỏng không được tính vào tổng kết phiên',
        },
        {
          stdinLines: ['tra da', 'hai', 'xong'],
          expected: 'Du lieu khong hop le',
          match: 'contains',
          hidden: false,
          label: 'Gõ chữ ở ô số lượng — không được làm sập phiên',
        },
        {
          stdinLines: ['XONG'],
          expected: 'So don: 0\nTong: 0 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đóng phiên ngay, gõ "XONG" viết hoa',
        },
        {
          stdinLines: ['  Sua Dau  ', '3', 'tra da', 'x', 'xong'],
          expected: 'So don: 1\nTong: 30000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tên bẩn vẫn nhận, đơn số lượng hỏng vẫn bị loại',
        },
      ],
      hints: [
        'Khung ngoài là while True: — đọc tên món, chuẩn hoá .strip().lower(), gặp "xong" thì break. Hai biến tích luỹ so_don và tong khai báo TRƯỚC vòng lặp, nếu không mỗi vòng lại bị đặt về 0.',
        'Luôn đọc dòng số lượng ngay sau tên món (đề yêu cầu vậy) rồi mới xét hợp lệ — nếu bạn "return sớm" khi món sai mà chưa đọc số lượng, các đơn phía sau sẽ đọc lệch dòng và cả bài sai theo.',
        'Ba nhánh xử lý: món không có trong MENU (kiểm bằng in) → in báo rồi continue; int(so_luong_str) bọc try/except ValueError → in báo rồi continue; còn lại thì tien = MENU[ten] * so_luong, cộng dồn và in "Da ghi: {tien} dong".',
      ],
      sampleSolution: `MENU = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\ndef main():\n    so_don = 0\n    tong = 0\n\n    while True:\n        ten = input("Mon (xong de ket thuc): ").strip().lower()\n        if ten == "xong":\n            break\n\n        tho = input("So luong: ")\n\n        if ten not in MENU:\n            print("Khong co mon nay")\n            continue\n\n        try:\n            so_luong = int(tho)\n        except ValueError:\n            print("Du lieu khong hop le")\n            continue\n\n        tien = MENU[ten] * so_luong\n        so_don = so_don + 1\n        tong = tong + tien\n        print(f"Da ghi: {tien} dong")\n\n    print(f"So don: {so_don}")\n    print(f"Tong: {tong} dong")\n\nmain()`,
    },
    homework:
      'Về nhà: nối bài này với U6 — sau khi đóng phiên, GHI danh sách đơn ra file doanh_thu.csv (chế độ "a"), rồi viết thêm một chương trình nhỏ đọc file đó in doanh thu cả tuần. Lúc đó bạn đã có phần mềm bán hàng dùng được thật, đúng mốc milestone chặng P2.',
  },
]
