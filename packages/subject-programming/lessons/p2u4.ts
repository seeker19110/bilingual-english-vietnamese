// lessons/p2u4.ts — Bài học P2-U4: DICT & TUPLE (tra cứu theo khoá).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P2U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p2-u4-l1',
    unitId: 'p2-u4',
    language: 'python',
    title: 'Dict — tra giá theo TÊN món, không phải theo số thứ tự',
    hook: 'Với list, muốn biết giá "nuoc cam" bạn phải nhớ nó nằm ở vị trí số mấy. Khách gọi món bằng TÊN chứ có ai gọi "cho tôi món số 1" đâu. Dict cho phép tra thẳng bằng tên.',
    theory:
      'DICT (từ điển) lưu các cặp KHOÁ → GIÁ TRỊ, viết trong ngoặc nhọn:\n\nmenu = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\n- Tra cứu: menu["nuoc cam"] cho 15000. Tra khoá KHÔNG tồn tại là lỗi KeyError.\n- An toàn hơn: menu.get("ca phe") trả về None nếu không có; menu.get("ca phe", 0) trả về 0.\n- Kiểm tra tồn tại: if "tra da" in menu: — toán tử in trên dict xét theo KHOÁ.\n- Thêm/sửa: menu["ca phe"] = 20000 (khoá chưa có thì thêm, có rồi thì đè). Xoá: del menu["tra da"].\n- Duyệt: for ten, gia in menu.items(): lấy đồng thời khoá và giá trị. menu.keys() chỉ khoá, menu.values() chỉ giá trị.\n\nTUPLE giống list nhưng KHÔNG sửa được sau khi tạo, viết bằng ngoặc tròn: mon = ("tra da", 5000). Dùng tuple cho những thứ đi thành cặp cố định — chính items() ở trên trả về các tuple.\n\nMẹo so khớp: khách gõ "Tra Da" nhưng khoá lưu "tra da" — hãy .strip().lower() dữ liệu nhập TRƯỚC khi tra.',
    workedExample: {
      code: `# Sổ điểm: khoá là tên, giá trị là list điểm
so_diem = {"An": [8, 9, 7], "Binh": [5, 6, 6]}

for ten, diem in so_diem.items():        # duyệt cả khoá lẫn giá trị
    tb = sum(diem) / len(diem)           # trung bình cộng
    xep = "Kha" if tb >= 6.5 else "Trung binh"
    print(f"{ten}: TB {tb:.1f} - {xep}")  # :.1f = làm tròn 1 chữ số thập phân

so_diem["Chi"] = [10, 9, 10]             # thêm học sinh mới
print(f"So hoc sinh: {len(so_diem)}")
print(f"Diem cua Chi: {so_diem.get('Chi')}")
print(f"Diem cua Dung: {so_diem.get('Dung', 'chua co')}")   # get an toàn`,
      stdinLines: [],
    },
    predict: {
      code: `menu = {"tra da": 5000, "nuoc cam": 15000}\nmenu["tra da"] = 6000\nprint(len(menu), menu["tra da"])`,
      question: 'Chạy đoạn code này, máy in ra gì?',
      choices: ['2 6000', '3 6000', '2 5000', 'Báo lỗi KeyError'],
      answerIndex: 0,
      explain:
        'Khoá "tra da" đã tồn tại nên phép gán ĐÈ giá trị cũ chứ không thêm cặp mới — dict vẫn 2 phần tử, giá thành 6000. Khoá trong dict luôn duy nhất.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành chương trình: tra giá món khách gọi, có kiểm tra món không tồn tại.',
      lines: [
        'menu = {"tra da": 5000, "nuoc cam": 15000}',
        'ten = input("Mon: ").strip().lower()',
        'if ten in menu:',
        '    print(f"Gia: {menu[ten]} dong")',
        'else:',
        '    print("Khong co mon nay")',
      ],
    },
    make: {
      prompt:
        'Menu quán lưu bằng dict:\nmenu = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\n\nChương trình đọc 2 dòng bằng input(): dòng 1 là TÊN món khách gọi, dòng 2 là SỐ LƯỢNG.\n\n- Nếu món có trong menu (bỏ qua khoảng trắng thừa và hoa/thường — "  Tra Da " vẫn phải nhận ra) thì in:\n  Thanh tien: <giá × số lượng> dong\n- Nếu không có món đó thì in đúng một dòng:\n  Khong co mon nay\n\nVí dụ nhập "nuoc cam" và 3 → in "Thanh tien: 45000 dong".',
      starterCode: `menu = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\nten = input("Mon: ")\nso_luong = int(input("So luong: "))\n# Chuẩn hoá tên món, tra dict rồi in theo đúng 2 trường hợp của đề\n`,
      testCases: [
        {
          stdinLines: ['nuoc cam', '3'],
          expected: 'Thanh tien: 45000 dong',
          match: 'contains',
          hidden: false,
          label: '3 ly nước cam → 45.000đ',
        },
        {
          stdinLines: ['  Tra Da  ', '2'],
          expected: 'Thanh tien: 10000 dong',
          match: 'contains',
          hidden: false,
          label: 'Gõ thừa khoảng trắng + viết hoa vẫn phải nhận ra món',
        },
        {
          stdinLines: ['ca phe', '1'],
          expected: 'Khong co mon nay',
          match: 'contains',
          hidden: false,
          label: 'Món không có trong menu',
        },
        {
          stdinLines: ['SUA DAU', '10'],
          expected: 'Thanh tien: 100000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tên món viết hoa toàn bộ, số lượng lớn',
        },
      ],
      hints: [
        'Chuẩn hoá tên TRƯỚC khi tra: ten = ten.strip().lower() — khoá trong menu đều là chữ thường không thừa khoảng trắng.',
        'Kiểm tra tồn tại bằng if ten in menu: rồi mới lấy menu[ten]. Nếu tra thẳng menu[ten] khi món không có, chương trình sẽ vỡ vì KeyError.',
        'Nhánh có món: tien = menu[ten] * so_luong rồi print(f"Thanh tien: {tien} dong"). Nhánh else in đúng nguyên văn "Khong co mon nay".',
      ],
      sampleSolution: `menu = {"tra da": 5000, "nuoc cam": 15000, "sua dau": 10000}\nten = input("Mon: ").strip().lower()\nso_luong = int(input("So luong: "))\n\nif ten in menu:\n    tien = menu[ten] * so_luong\n    print(f"Thanh tien: {tien} dong")\nelse:\n    print("Khong co mon nay")`,
    },
    homework:
      'Về nhà: mở rộng dict thành menu {tên: {"gia": ..., "ton_kho": ...}} (dict lồng dict) rồi in bảng menu đầy đủ. Đây chính là bước dự án của unit này — món hàng có nhiều thuộc tính chứ không chỉ mỗi giá.',
  },
]
