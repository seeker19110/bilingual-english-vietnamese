// lessons/p6u3.ts — P6-U3: Track hệ thống / C → Rust (làn A, `python`).
//
// Hiến chương P6 §3: bài KHÔNG chạy Rust. Học viên xây một BỘ KIỂM QUYỀN SỞ HỮU — mô hình của
// đúng thứ trình biên dịch Rust làm — rồi cài Rust thật ở bước ⑦ (làn C) và đối chiếu với mã
// lỗi thật E0382 / E0505. Bài nói thẳng đây là mô hình, không dùng câu chữ ngụ ý đang chạy Rust.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u3-l1',
    unitId: 'p6-u3',
    language: 'python',
    title: 'Quyền sở hữu: ai chịu trách nhiệm giải phóng bộ nhớ, và ai được nhìn nhờ',
    hook: 'Trong C, bạn tự xin bộ nhớ và tự trả. Quên trả thì rò rỉ; trả hai lần thì chương trình sập; dùng sau khi trả thì nó chạy tiếp với dữ liệu rác — và đó là lỗ hổng bảo mật được khai thác nhiều nhất lịch sử ngành. Rust không thêm bộ dọn rác nào. Nó chỉ đặt một câu hỏi mà C không hỏi: ai đang SỞ HỮU cái này?',
    theory:
      'Track này về C và Rust, và như track Go: **bài này không chạy Rust.** Bạn sẽ tự xây một MÔ HÌNH của bộ kiểm quyền sở hữu — chính là thứ trình biên dịch Rust chạy trước khi sinh mã — rồi cài Rust thật ở phần về nhà và xem nó nói y hệt bạn.\n\nBA CÁCH QUẢN LÝ BỘ NHỚ, và cái giá của từng cách:\n\n- **Thủ công (C):** bạn gọi malloc rồi phải nhớ gọi free. Nhanh nhất, và cũng là nơi sinh ra ba loại lỗi kinh điển: RÒ RỈ (quên free), GIẢI PHÓNG HAI LẦN (double free), và DÙNG SAU KHI GIẢI PHÓNG (use-after-free). Cái thứ ba tệ nhất: chương trình không sập ngay, nó chạy tiếp trên vùng nhớ đã bị người khác chiếm — và kẻ tấn công có thể chọn ai chiếm.\n- **Bộ dọn rác (Python, Java, Go):** một cơ chế chạy nền tự tìm và dọn thứ không ai còn dùng. An toàn, đổi lại là tốn bộ nhớ hơn và thỉnh thoảng chương trình khựng lại một nhịp không đoán trước được — chuyện không chấp nhận được với hệ điều hành, trình điều khiển thiết bị hay game engine.\n- **Quyền sở hữu (Rust):** không có bộ dọn rác, và cũng không phải nhớ free. Trình biên dịch suy ra chỗ giải phóng bằng ba luật, và TỪ CHỐI BIÊN DỊCH nếu bạn phạm luật.\n\nBA LUẬT ĐÓ:\n\n1. Mỗi giá trị có ĐÚNG MỘT chủ sở hữu.\n2. Chủ sở hữu hết phạm vi thì giá trị được giải phóng — đúng một lần, tự động.\n3. Gán giá trị cho tên khác là CHUYỂN QUYỀN (move), không phải sao chép: tên cũ lập tức thành không dùng được nữa.\n\nLuật 3 là chỗ người từ Python sang thấy sốc. Trong Python, b = a cho hai cái tên cùng trỏ một vật (bạn đã gặp ở bậc P4). Trong Rust, b = a nghĩa là a **giao quyền** cho b, và từ dòng đó trở đi chạm vào a là lỗi biên dịch. Lý do rất thực dụng: nếu cả a và b cùng được coi là chủ, tới lúc hết phạm vi cả hai cùng đi giải phóng — đúng lỗi double free mà C không cản được.\n\nNhưng nếu chỉ có chuyển quyền thì không viết nổi chương trình nào: truyền vào hàm là mất luôn biến. Nên có thêm MƯỢN (borrow): cho người khác NHÌN NHỜ mà không giao quyền. Kèm một luật:\n\n4. Đang có người mượn thì KHÔNG được chuyển quyền đi nơi khác.\n\nHợp lý tới mức hiển nhiên khi nói ra: bạn không thể đưa cuốn sách cho người thứ ba trong lúc người thứ hai đang đọc dở nó — họ sẽ cầm một tham chiếu tới thứ không còn ở đó. Đó chính là use-after-free, và luật 4 là cách Rust chặn nó ngay lúc biên dịch, không tốn một chút thời gian chạy nào.\n\nĐiều mô hình của bạn KHÔNG có (nói trước để đừng tưởng mình đã hiểu hết Rust): Rust còn phân biệt mượn ĐỌC (nhiều người cùng lúc được) với mượn GHI (chỉ một, và trong lúc đó không ai được mượn đọc); còn có vòng đời (lifetime) để bảo đảm người mượn không sống lâu hơn chủ. Bài này dựng phần lõi — chuyển quyền, mượn, dùng sau khi chuyển — vì đó là ba thứ chiếm gần hết lỗi của người mới.',
    workedExample: {
      code: `# MÔ HÌNH bộ kiểm quyền sở hữu — KHÔNG phải Rust, nhưng theo đúng ba luật của nó.
# Lệnh: tao <ten> | chuyen <a> <b> | doc <ten> | muon <ten> | tra <ten>

def kiem_tra(lenh_list):
    con_quyen = {}      # ten -> còn sở hữu giá trị không
    dang_muon = {}      # ten -> số người đang mượn
    for dong in lenh_list:
        p = dong.split()
        lenh = p[0]
        if lenh == "tao":
            con_quyen[p[1]] = True
            dang_muon[p[1]] = 0
            print("OK")
        elif lenh == "doc":
            print("OK" if con_quyen.get(p[1]) else f"Loi: dung sau khi chuyen quyen: {p[1]}")
        elif lenh == "muon":
            if not con_quyen.get(p[1]):
                print(f"Loi: dung sau khi chuyen quyen: {p[1]}")
            else:
                dang_muon[p[1]] += 1
                print("OK")
        elif lenh == "chuyen":
            a, b = p[1], p[2]
            if not con_quyen.get(a):
                print(f"Loi: dung sau khi chuyen quyen: {a}")        # luật 3
            elif dang_muon.get(a, 0) > 0:
                print(f"Loi: khong the chuyen khi dang cho muon: {a}")  # luật 4
            else:
                con_quyen[a] = False        # tên cũ mất quyền NGAY lập tức
                con_quyen[b] = True
                dang_muon[b] = 0
                print("OK")


print("--- Chuyen quyen roi dung ten CU:")
kiem_tra(["tao s", "chuyen s t", "doc s"])

print("--- Chuyen quyen roi dung ten MOI:")
kiem_tra(["tao s", "chuyen s t", "doc t"])

print("--- Chuyen khi con nguoi dang muon:")
kiem_tra(["tao s", "muon s", "chuyen s t"])

# Trong Rust thật, ba cảnh trên lần lượt là lỗi E0382, biên dịch được, và lỗi E0505.`,
      stdinLines: [],
    },
    predict: {
      code: `# Python: b = a KHONG phai chuyen quyen
a = ["tra da", "ca phe"]
b = a
b.append("sinh to")
print(len(a), len(b))`,
      question: 'Trong Python, gán b = a rồi thêm vào b. Hai độ dài in ra là bao nhiêu?',
      choices: ['3 3', '2 3', '3 2', '2 2'],
      answerIndex: 0,
      explain:
        'In ra "3 3": a và b là HAI CÁI TÊN của cùng MỘT danh sách, nên sửa qua tên nào cũng thấy ở tên kia. Đây đúng là chỗ Rust nhìn khác hẳn. Rust hỏi: nếu cả a và b đều là chủ, thì tới lúc hết phạm vi ai đi giải phóng vùng nhớ đó — cả hai à? Đó là lỗi double free. Nên Rust chọn cách khác: b = a là CHUYỂN QUYỀN, a lập tức không dùng được nữa, và chạm vào a sau đó là lỗi biên dịch E0382 chứ không phải một bất ngờ lúc chạy. Python thì chấp nhận rủi ro "sửa nhầm qua tên kia" và giao việc dọn dẹp cho bộ dọn rác.',
    },
    parsons: {
      prompt:
        'Xếp lại nhánh xử lý lệnh "chuyen" — hai luật phải kiểm, và tên cũ mất quyền ngay lập tức.',
      lines: [
        'a, b = p[1], p[2]',
        'if not con_quyen.get(a):',
        '    print(f"Loi: dung sau khi chuyen quyen: {a}")',
        'elif dang_muon.get(a, 0) > 0:',
        '    print(f"Loi: khong the chuyen khi dang cho muon: {a}")',
        'else:',
        '    con_quyen[a] = False',
        '    con_quyen[b] = True',
        '    print("OK")',
      ],
    },
    make: {
      prompt:
        'Xây bộ kiểm quyền sở hữu theo bốn luật của Rust.\n\nĐọc dòng đầu bằng input() là số lệnh n, rồi n dòng lệnh, mỗi dòng một trong năm loại:\n- "tao <ten>" — tạo giá trị mới, ten là chủ sở hữu, chưa ai mượn.\n- "chuyen <a> <b>" — chuyển quyền từ a sang b. a mất quyền NGAY.\n- "doc <ten>" — đọc giá trị.\n- "muon <ten>" — mượn (nhìn nhờ, không lấy quyền).\n- "tra <ten>" — trả lại một lượt mượn.\n\nVới MỖI lệnh, in đúng một dòng:\n- Hợp lệ → "OK"\n- Dùng tên đã mất quyền (doc / muon / chuyen từ nó) → "Loi: dung sau khi chuyen quyen: <ten>"\n- Chuyển quyền trong lúc còn người đang mượn → "Loi: khong the chuyen khi dang cho muon: <ten>"\n- Trả khi không ai đang mượn → "Loi: khong co ai dang muon: <ten>"\n\nThứ tự kiểm của lệnh "chuyen": kiểm MẤT QUYỀN trước, rồi mới kiểm ĐANG CHO MƯỢN.\n\nCuối cùng in thêm một dòng tổng kết:\nKet qua: <so lenh OK>/<tong so lenh>',
      starterCode: `n = int(input("So lenh: "))
con_quyen = {}      # ten -> còn sở hữu giá trị không
dang_muon = {}      # ten -> số người đang mượn
ok = 0

for _ in range(n):
    dong = input("Lenh: ")
    p = dong.split()
    # Xử lý năm loại lệnh, in OK hoặc thông điệp lỗi tương ứng
    ...

print(f"Ket qua: {ok}/{n}")
`,
      testCases: [
        {
          stdinLines: ['3', 'tao s', 'chuyen s t', 'doc t'],
          expected: 'Ket qua: 3/3',
          match: 'contains',
          hidden: false,
          label: 'Chuyển quyền rồi dùng tên MỚI — hợp lệ, Rust biên dịch được',
        },
        {
          stdinLines: ['3', 'tao s', 'chuyen s t', 'doc s'],
          expected: 'Loi: dung sau khi chuyen quyen: s',
          match: 'contains',
          hidden: false,
          label: 'Dùng tên CŨ sau khi chuyển quyền — đây là E0382 của Rust',
        },
        {
          stdinLines: ['3', 'tao s', 'muon s', 'chuyen s t'],
          expected: 'Loi: khong the chuyen khi dang cho muon: s',
          match: 'contains',
          hidden: false,
          label: 'Chuyển đi trong lúc còn người đang đọc dở — đây là E0505',
        },
        {
          stdinLines: ['5', 'tao s', 'muon s', 'tra s', 'chuyen s t', 'doc t'],
          expected: 'Ket qua: 5/5',
          match: 'contains',
          hidden: false,
          label: 'Trả xong mới chuyển → hợp lệ hết',
        },
        {
          stdinLines: ['2', 'tao s', 'tra s'],
          expected: 'Loi: khong co ai dang muon: s',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: trả khi chưa ai mượn',
        },
        {
          stdinLines: ['4', 'tao s', 'chuyen s t', 'chuyen s u', 'doc t'],
          expected: 'Ket qua: 3/4',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chuyển lần hai từ tên đã mất quyền phải bị chặn, t vẫn dùng được',
        },
        {
          stdinLines: ['5', 'tao s', 'muon s', 'muon s', 'tra s', 'chuyen s t'],
          expected: 'Loi: khong the chuyen khi dang cho muon: s',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: mượn hai lần, mới trả một → vẫn còn người mượn, phải đếm chứ không dùng cờ',
        },
      ],
      hints: [
        'dang_muon phải là một SỐ ĐẾM, không phải cờ True/False. Ca ẩn mượn hai lần rồi trả một lần chính là để bắt lỗi này: dùng cờ thì lệnh tra đầu tiên đã xoá sạch dấu vết của người mượn còn lại.',
        'Lệnh "chuyen" kiểm theo đúng thứ tự đề nói: mất quyền trước, đang cho mượn sau. Đảo lại thì chuyển từ một tên đã mất quyền mà đang có mượn sẽ báo nhầm thông điệp.',
        'Khi chuyển quyền thành công, nhớ làm ĐỦ ba việc: con_quyen[a] = False, con_quyen[b] = True, và dang_muon[b] = 0. Quên vế đầu là tên cũ vẫn dùng được và cả mô hình mất ý nghĩa.',
        'Dùng con_quyen.get(ten) chứ đừng con_quyen[ten] — tên chưa từng được "tao" sẽ nổ KeyError thay vì báo lỗi tử tế.',
        'Biến ok chỉ tăng khi lệnh HỢP LỆ. Cách gọn: mỗi nhánh in "OK" thì cộng 1 ngay tại đó, để không phải nhớ cộng ở cuối.',
      ],
      sampleSolution: `n = int(input("So lenh: "))
con_quyen = {}      # ten -> còn sở hữu giá trị không
dang_muon = {}      # ten -> SỐ người đang mượn (đếm, không phải cờ)
ok = 0

for _ in range(n):
    dong = input("Lenh: ")
    p = dong.split()
    lenh = p[0]

    if lenh == "tao":
        con_quyen[p[1]] = True
        dang_muon[p[1]] = 0
        ok += 1
        print("OK")

    elif lenh == "doc":
        if con_quyen.get(p[1]):
            ok += 1
            print("OK")
        else:
            print(f"Loi: dung sau khi chuyen quyen: {p[1]}")

    elif lenh == "muon":
        if not con_quyen.get(p[1]):
            print(f"Loi: dung sau khi chuyen quyen: {p[1]}")
        else:
            dang_muon[p[1]] += 1
            ok += 1
            print("OK")

    elif lenh == "tra":
        if dang_muon.get(p[1], 0) > 0:
            dang_muon[p[1]] -= 1
            ok += 1
            print("OK")
        else:
            print(f"Loi: khong co ai dang muon: {p[1]}")

    elif lenh == "chuyen":
        a, b = p[1], p[2]
        if not con_quyen.get(a):
            print(f"Loi: dung sau khi chuyen quyen: {a}")            # luật 3
        elif dang_muon.get(a, 0) > 0:
            print(f"Loi: khong the chuyen khi dang cho muon: {a}")   # luật 4
        else:
            con_quyen[a] = False        # tên cũ mất quyền NGAY lập tức
            con_quyen[b] = True
            dang_muon[b] = 0
            ok += 1
            print("OK")

print(f"Ket qua: {ok}/{n}")`,
    },
    homework:
      'Phần này chạm vào Rust THẬT, trên máy thật của bạn — sandbox của môn không chạy Rust và không giả vờ ngược lại.\n\n1. Cài Rust (rustup), viết đúng hai kịch bản bạn vừa mô hình hoá. `let s = String::from("quan"); let t = s; println!("{}", s);` phải cho lỗi E0382. Thêm `let r = &s;` trước dòng chuyển quyền thì phải cho E0505. Đọc kỹ thông điệp: nó chỉ CẢ dòng chuyển quyền lẫn dòng dùng lại, kèm gợi ý sửa — thứ mô hình của bạn chưa làm được.\n\n2. Thử phần mô hình CHƯA có: hai lần &s cùng lúc (Rust cho), rồi &s và &mut s cùng lúc (Rust từ chối). Tự trả lời: vì sao nhiều người cùng ĐỌC thì an toàn mà một người GHI thì không?\n\n3. Phía C: viết chương trình nhỏ có malloc/free, cố tình free hai lần, chạy dưới valgrind. C báo lúc CHẠY (nếu bạn nhớ chạy công cụ), Rust báo lúc BIÊN DỊCH.',
    srsCards: [
      {
        hoi: 'Ba luật quyền sở hữu của Rust là gì?',
        dap: 'Mỗi giá trị có đúng MỘT chủ sở hữu · chủ hết phạm vi thì giá trị được giải phóng đúng một lần, tự động · gán cho tên khác là CHUYỂN QUYỀN chứ không sao chép, tên cũ lập tức không dùng được.',
      },
      {
        hoi: 'Vì sao Rust không cho hai tên cùng sở hữu một giá trị?',
        dap: 'Vì tới lúc hết phạm vi thì cả hai đều đi giải phóng cùng một vùng nhớ — đúng lỗi double free của C. Cho đúng một chủ thì trình biên dịch suy ra được chỗ giải phóng duy nhất.',
      },
      {
        hoi: 'Đang có người mượn thì vì sao không được chuyển quyền đi?',
        dap: 'Vì người mượn đang giữ tham chiếu tới giá trị đó; chuyển quyền đi rồi thì tham chiếu ấy trỏ vào thứ không còn ở đấy — chính là use-after-free. Rust chặn ngay lúc biên dịch (E0505), không tốn thời gian chạy.',
      },
      {
        hoi: 'Quyền sở hữu khác bộ dọn rác ở cái giá nào?',
        dap: 'Bộ dọn rác an toàn nhưng tốn bộ nhớ hơn và thỉnh thoảng làm chương trình khựng một nhịp không đoán trước. Quyền sở hữu không tốn gì lúc chạy, đổi lại bạn phải thoả mãn trình biên dịch trước khi chương trình được biên dịch.',
      },
    ],
  },
]
