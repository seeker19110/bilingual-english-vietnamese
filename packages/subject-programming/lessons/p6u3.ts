// lessons/p6u3.ts — P6-U3: Track hệ thống / C → Rust (làn A, `python`).
//
// Hiến chương P6 §3: bài KHÔNG chạy Rust. Học viên xây một BỘ KIỂM QUYỀN SỞ HỮU — mô hình của
// đúng thứ trình biên dịch Rust làm — rồi cài Rust thật ở bước ⑦ (làn C) và đối chiếu với mã
// lỗi thật E0382 / E0505. Bài nói thẳng đây là mô hình, không dùng câu chữ ngụ ý đang chạy Rust.
//
// Ba bài dựng dần một trình kiểm: l1 quyền sở hữu → l2 ba lỗi bộ nhớ kinh điển (dùng sau
// khi giải phóng · giải phóng hai lần · rò rỉ) → l3 luật mượn của Rust (&T / &mut T).
// l2 và l3 chấm bằng THÔNG BÁO LỖI ĐẦU TIÊN kèm số bước, nên thứ tự kiểm trạng thái phải
// đúng — đây chính là thứ borrow checker thật làm, thu nhỏ lại còn vài chục dòng Python.
// Ca biên dòng lệnh RỖNG có ở cả hai bài: không lệnh nào thì không lỗi, không rò rỉ.
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
  {
    id: 'p6-u3-l2',
    unitId: 'p6-u3',
    language: 'python',
    title: 'Con trỏ treo: ba lỗi bộ nhớ đã gây ra phần lớn lỗ hổng bảo mật của bốn mươi năm qua',
    hook: 'Chương trình chạy đúng suốt hai tháng rồi một hôm trả về dữ liệu của người dùng khác. Không ai sửa gì cả. Chỗ hỏng là một con trỏ đã được giải phóng từ lâu, và ô nhớ đó vừa được cấp lại cho việc khác.',
    theory:
      'Bài trước bạn đã gặp câu hỏi trung tâm của quản lý bộ nhớ: **ai chịu trách nhiệm giải phóng?** Bài này xem chuyện gì xảy ra khi câu trả lời đó sai — ba lỗi kinh điển, và vì sao chúng đáng sợ hơn hẳn mọi lỗi bạn từng gặp ở P1–P5.\n\nTrước hết, vì sao chúng nguy hiểm đến thế: **lỗi bộ nhớ thường không nổ ra tại chỗ.** Chia cho 0 thì chương trình dừng ngay, bạn nhìn thấy dòng nào sai. Còn đọc một ô đã giải phóng thì chương trình vẫn chạy tiếp, chỉ là dữ liệu nó đọc được là rác — hoặc tệ hơn, là dữ liệu thật của một việc khác vừa được cấp vào đúng ô đó. Triệu chứng xuất hiện ở chỗ khác, lúc khác, đôi khi vài giờ sau. Đó là loại lỗi tốn nhiều ngày công nhất trong nghề.\n\n**BA LỖI:**\n\n1. **Dùng sau khi giải phóng (use-after-free).** Bạn free() một ô rồi vẫn còn giữ con trỏ trỏ vào đó — con trỏ ấy gọi là **con trỏ treo (dangling pointer)**. Đọc qua nó cho ra rác; ghi qua nó là bạn giẫm lên dữ liệu của thứ khác. Đây là loại lỗi bị khai thác nhiều nhất để chiếm quyền điều khiển chương trình, vì kẻ tấn công có thể sắp đặt để ô vừa giải phóng được cấp lại cho dữ liệu do họ kiểm soát.\n\n2. **Giải phóng hai lần (double free).** Gọi free() lần thứ hai trên cùng một ô. Vấn đề không phải "thừa một lệnh" — nó phá hỏng cấu trúc sổ sách bên trong của bộ cấp phát, và từ đó những lần cấp phát sau có thể trả về hai con trỏ cùng trỏ vào một chỗ. Cũng là một lớp lỗ hổng bảo mật có tên riêng.\n\n3. **Rò rỉ (memory leak).** Cấp phát rồi không bao giờ giải phóng, hoặc đè con trỏ cũ bằng con trỏ mới nên mất luôn địa chỉ cũ — ô nhớ đó còn đó mà không ai với tới được nữa. Rò rỉ hiền hơn hai lỗi trên (không sai kết quả), nhưng với dịch vụ chạy liên tục thì nó là quả bom hẹn giờ: một tuần sau, tiến trình bị hệ điều hành giết vì hết bộ nhớ, và bạn không có manh mối gì từ log.\n\n**BỐN CÁCH LOÀI NGƯỜI ĐÃ THỬ ĐỂ CHỮA:**\n\n- **Kỷ luật thủ công (C).** Quy ước rõ ai cấp thì người đó giải phóng, gán NULL cho con trỏ ngay sau khi free, viết tài liệu cho từng hàm. Hiệu quả tới mức con người còn tỉnh táo — và bốn mươi năm cho thấy giới hạn đó thấp hơn ta tưởng.\n- **Bộ dọn rác (Java, Go, Python, JavaScript).** Máy tự tìm ô không ai còn trỏ tới và thu hồi. Ba lỗi trên biến mất gần hết. Giá phải trả: những khoảng dừng khó đoán, tốn bộ nhớ hơn, và bạn mất quyền kiểm soát chính xác thời điểm giải phóng — không hợp cho hệ thời gian thực hay hệ nhúng.\n- **Con trỏ thông minh (C++).** unique_ptr, shared_ptr — trách nhiệm giải phóng gắn vào vòng đời của một đối tượng. Tốt hơn nhiều, nhưng bạn vẫn cầm được con trỏ thô nếu muốn, nên vẫn tự bắn vào chân được.\n- **Kiểm tra lúc BIÊN DỊCH (Rust).** Đây là ý tưởng bài trước: mỗi giá trị có đúng một chủ sở hữu, chủ hết phạm vi thì giá trị được giải phóng, và trình biên dịch từ chối biên dịch nếu bạn còn giữ tham chiếu tới thứ đã chết. Không mất chi phí lúc chạy, không cần bộ dọn rác. Cái giá nằm ở chỗ khác: bạn phải trả bằng thời gian học và bằng những lần "cãi nhau" với trình biên dịch.\n\nBài hôm nay bạn viết một bộ kiểm tra bắt cả ba lỗi trên một dãy thao tác — chính là việc mà công cụ như Valgrind hay AddressSanitizer làm, chỉ ở quy mô tí hon. Viết xong bạn sẽ hiểu vì sao trình biên dịch Rust bắt bẻ bạn đúng những chỗ nó bắt bẻ.',
    workedExample: {
      code: `# Mo phong bo nho: moi o co trang thai "song" (dang cap phat) hoac "da_giai".
def kiem_bo_nho(lenh):
    """Tra ve (loi dau tien, so o con ro ri)."""
    o = {}

    def dang_song():
        return sum(1 for v in o.values() if v == "song")

    for buoc, l in enumerate(lenh, 1):
        viec, ten = l.split(":")
        if viec == "cap":
            if o.get(ten) == "song":
                # Đè con trỏ cũ = mất địa chỉ cũ = rò rỉ, không ai với tới ô đó nữa
                return f"buoc {buoc}: ghi de con tro dang song o {ten}", dang_song()
            o[ten] = "song"
        elif viec == "dung":
            if ten not in o:
                return f"buoc {buoc}: dung o chua cap phat {ten}", dang_song()
            if o[ten] == "da_giai":
                return f"buoc {buoc}: dung sau khi giai phong o {ten}", dang_song()
        elif viec == "giai":
            if ten not in o:
                return f"buoc {buoc}: giai phong o chua cap phat {ten}", dang_song()
            if o[ten] == "da_giai":
                return f"buoc {buoc}: giai phong hai lan o {ten}", dang_song()
            o[ten] = "da_giai"
    return "khong", dang_song()


for kich_ban in [
    "cap:a dung:a giai:a",              # dung chuan
    "cap:a dung:a giai:a dung:a",       # con tro treo
    "cap:a giai:a giai:a",              # giai phong hai lan
    "cap:a cap:b giai:a",               # b bi ro ri
]:
    print(kich_ban, "->", kiem_bo_nho(kich_ban.split()))`,
      stdinLines: [],
    },
    predict: {
      code: `o = {}
o["a"] = "song"
o["a"] = "da_giai"
# Con tro cu van con, va o vua duoc cap lai cho viec khac:
o["a"] = "song"
print(o["a"], len(o))`,
      question: 'Ô "a" được giải phóng rồi cấp lại. Con trỏ cũ trỏ vào đó giờ thấy gì?',
      choices: ['song 1', 'da_giai 1', 'song 2', 'da_giai 2'],
      answerIndex: 0,
      explain:
        'In ra "song 1": vẫn một ô duy nhất, trạng thái đang sống, và con trỏ cũ đọc được bình thường — chỉ có điều thứ nó đọc được là dữ liệu của một việc HOÀN TOÀN KHÁC vừa được cấp vào đúng địa chỉ đó. Đây chính là điều làm lỗi con trỏ treo đáng sợ hơn mọi lỗi bạn từng gặp: máy tính không hề báo lỗi, chương trình không dừng, nó chỉ lặng lẽ trả về dữ liệu sai. Trong đời thật, "dữ liệu của việc khác" có thể là thông tin của người dùng khác — và nếu kẻ tấn công sắp đặt được để chính họ chiếm ô vừa giải phóng, họ điều khiển được thứ chương trình bạn đọc ra.',
    },
    parsons: {
      prompt:
        'Xếp lại nhánh xử lý lệnh "dung" của bộ kiểm tra. Chú ý thứ tự: chưa cấp phát bao giờ là một lỗi khác với đã giải phóng rồi.',
      lines: [
        'elif viec == "dung":',
        '    if ten not in o:',
        '        return f"buoc {buoc}: dung o chua cap phat {ten}", dang_song()',
        '    if o[ten] == "da_giai":',
        '        return f"buoc {buoc}: dung sau khi giai phong o {ten}", dang_song()',
      ],
    },
    make: {
      prompt:
        'Viết bộ kiểm tra bộ nhớ tí hon — bản thu nhỏ của Valgrind.\n\nHàm kiem_bo_nho(lenh) nhận danh sách lệnh, mỗi lệnh dạng "viec:ten" với viec là cap, dung hoặc giai. Trả về (loi, ro_ri):\n- Gặp lỗi thì DỪNG NGAY, trả về mô tả lỗi và số ô còn đang sống tại thời điểm đó. Bốn lỗi, ghi đúng nguyên văn (buoc đếm từ 1):\n  · cap vào ô đang sống → "buoc {i}: ghi de con tro dang song o {ten}"\n  · dung ô chưa từng cấp phát → "buoc {i}: dung o chua cap phat {ten}"\n  · dung ô đã giải phóng → "buoc {i}: dung sau khi giai phong o {ten}"\n  · giai ô chưa từng cấp phát → "buoc {i}: giai phong o chua cap phat {ten}"\n  · giai ô đã giải phóng → "buoc {i}: giai phong hai lan o {ten}"\n- Chạy hết mà không lỗi → trả về ("khong", số ô còn đang sống — đó là số ô rò rỉ).\n\nChương trình chính đọc MỘT dòng input() là dãy lệnh cách nhau bởi dấu cách (dòng rỗng = không có lệnh nào), rồi in đúng hai dòng:\nLoi dau tien: <mô tả hoặc khong>\nSo o ro ri: <số>',
      starterCode: `def kiem_bo_nho(lenh):
    o = {}   # ten -> "song" hoac "da_giai"

    def dang_song():
        return sum(1 for v in o.values() if v == "song")

    for buoc, l in enumerate(lenh, 1):
        viec, ten = l.split(":")
        # cap / dung / giai — mỗi nhánh kiểm trạng thái TRƯỚC khi đổi nó
        ...
    return "khong", dang_song()


lenh = input("Day lenh: ").split()
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['cap:a dung:a giai:a dung:a'],
          expected: 'Loi dau tien: buoc 4: dung sau khi giai phong o a',
          match: 'contains',
          hidden: false,
          label: 'Con trỏ treo: dùng ô đã giải phóng ở bước 4',
        },
        {
          stdinLines: ['cap:a giai:a giai:a'],
          expected: 'Loi dau tien: buoc 3: giai phong hai lan o a',
          match: 'contains',
          hidden: false,
          label: 'Giải phóng hai lần — phá sổ sách của bộ cấp phát',
        },
        {
          stdinLines: ['cap:a cap:b giai:a'],
          expected: 'So o ro ri: 1',
          match: 'contains',
          hidden: false,
          label: 'Rò rỉ: cấp hai ô, chỉ giải phóng một',
        },
        {
          stdinLines: ['cap:a cap:b giai:a'],
          expected: 'Loi dau tien: khong',
          match: 'contains',
          hidden: false,
          label: 'Rò rỉ KHÔNG phải lỗi dừng chương trình — nó im lặng, đó mới là chỗ đáng sợ',
        },
        {
          stdinLines: ['cap:a dung:a giai:a'],
          expected: 'So o ro ri: 0',
          match: 'contains',
          hidden: false,
          label: 'Kịch bản chuẩn: cấp, dùng, giải phóng — sạch sẽ',
        },
        {
          stdinLines: [''],
          expected: 'So o ro ri: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: dòng rỗng, không lệnh nào → không lỗi, không rò rỉ',
        },
        {
          stdinLines: ['dung:a'],
          expected: 'Loi dau tien: buoc 1: dung o chua cap phat a',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dùng ô chưa từng tồn tại — khác hẳn ô đã giải phóng',
        },
        {
          stdinLines: ['cap:a cap:a'],
          expected: 'Loi dau tien: buoc 2: ghi de con tro dang song o a',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đè con trỏ đang sống — mất luôn địa chỉ cũ',
        },
        {
          stdinLines: ['cap:a cap:b cap:c giai:a giai:b'],
          expected: 'So o ro ri: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy dài hơn, còn đúng một ô chưa giải phóng',
        },
      ],
      hints: [
        'Chỉ cần MỘT dict: tên ô → trạng thái ("song" hoặc "da_giai"). Ô chưa từng cấp phát thì đơn giản là không có mặt trong dict — đó là cách phân biệt nó với ô đã giải phóng.',
        'Ba trạng thái, đừng gộp hai cái cuối: chưa từng tồn tại (not in o), đang sống, và đã giải phóng. Mỗi cái cho ra một thông báo lỗi khác nhau vì chúng là ba bệnh khác nhau.',
        'Trong mỗi nhánh, KIỂM trạng thái trước rồi mới ĐỔI trạng thái. Đổi trước thì bạn đã xoá mất bằng chứng để phát hiện lỗi.',
        'Đếm rò rỉ tại thời điểm dừng, kể cả khi dừng vì lỗi: sum(1 for v in o.values() if v == "song"). Viết thành hàm con để bốn chỗ return đều dùng lại được.',
        'Số bước đếm từ 1: dùng enumerate(lenh, 1) chứ đừng cộng tay, đó là chỗ hay lệch một đơn vị.',
      ],
      sampleSolution: `def kiem_bo_nho(lenh):
    o = {}   # ten -> "song" hoac "da_giai"; khong co mat = chua tung cap phat

    def dang_song():
        return sum(1 for v in o.values() if v == "song")

    for buoc, l in enumerate(lenh, 1):
        viec, ten = l.split(":")
        if viec == "cap":
            if o.get(ten) == "song":
                # Đè con trỏ cũ = mất địa chỉ cũ = ô đó rò rỉ vĩnh viễn
                return f"buoc {buoc}: ghi de con tro dang song o {ten}", dang_song()
            o[ten] = "song"
        elif viec == "dung":
            if ten not in o:
                return f"buoc {buoc}: dung o chua cap phat {ten}", dang_song()
            if o[ten] == "da_giai":
                # Con trỏ treo: đọc được, nhưng đọc phải dữ liệu của việc khác
                return f"buoc {buoc}: dung sau khi giai phong o {ten}", dang_song()
        elif viec == "giai":
            if ten not in o:
                return f"buoc {buoc}: giai phong o chua cap phat {ten}", dang_song()
            if o[ten] == "da_giai":
                return f"buoc {buoc}: giai phong hai lan o {ten}", dang_song()
            o[ten] = "da_giai"
    return "khong", dang_song()


lenh = input("Day lenh: ").split()
loi, ro_ri = kiem_bo_nho(lenh)
print(f"Loi dau tien: {loi}")
print(f"So o ro ri: {ro_ri}")`,
    },
    homework:
      'Ba việc tăng dần độ khó — việc 3 là lúc mọi thứ khớp vào nhau.\n\n1. **Mở rộng bộ kiểm tra.** Thêm lệnh "sao:a>b" nghĩa là tạo thêm con trỏ b cùng trỏ vào ô của a. Giờ giải phóng qua a thì b thành con trỏ treo — bộ kiểm của bạn có bắt được không? Đây chính là lý do Rust cấm hai chủ sở hữu cho một giá trị.\n\n2. **Đọc lỗi thật.** Tìm một lỗ hổng có nhãn use-after-free trong phần mềm bạn đang dùng (trình duyệt là chỗ nhiều nhất). Tự trả lời: từ một ô nhớ đọc nhầm tới việc chiếm quyền điều khiển máy, các bước ở giữa là gì?\n\n3. **Đối chiếu với Rust.** Nếu cài được Rust, thử biên dịch: let s = String::from("xin chao"); let r = &s; drop(s); println!("{}", r); Trình biên dịch từ chối đúng cái mà bộ kiểm của bạn phát hiện — chỉ khác là nó bắt lúc BIÊN DỊCH, trước khi chương trình kịp chạy lần nào.',
    srsCards: [
      {
        hoi: 'Vì sao lỗi dùng-sau-khi-giải-phóng khó tìm hơn hẳn các lỗi thông thường?',
        dap: 'Vì nó không nổ ra tại chỗ: chương trình vẫn chạy tiếp và chỉ đọc phải rác hoặc dữ liệu của việc khác vừa được cấp vào đúng ô đó. Triệu chứng xuất hiện ở chỗ khác, lúc khác, có khi vài giờ sau.',
      },
      {
        hoi: 'Con trỏ treo (dangling pointer) là gì?',
        dap: 'Là con trỏ vẫn còn trỏ vào một ô nhớ đã được giải phóng. Đọc qua nó cho ra dữ liệu không còn thuộc về mình; ghi qua nó là giẫm lên dữ liệu của thứ khác đang dùng ô đó.',
      },
      {
        hoi: 'Rò rỉ bộ nhớ nguy hiểm kiểu gì, khác hai lỗi kia ra sao?',
        dap: 'Nó không làm sai kết quả nên hoàn toàn im lặng, nhưng với dịch vụ chạy liên tục thì bộ nhớ cứ dồn lại tới ngày tiến trình bị hệ điều hành giết vì hết bộ nhớ — và log không để lại manh mối gì.',
      },
      {
        hoi: 'Bốn cách chữa lỗi bộ nhớ, mỗi cách trả giá bằng gì?',
        dap: 'Kỷ luật thủ công (C): phụ thuộc con người tỉnh táo. Bộ dọn rác: khoảng dừng khó đoán, tốn bộ nhớ. Con trỏ thông minh (C++): vẫn cầm được con trỏ thô. Kiểm lúc biên dịch (Rust): không tốn gì lúc chạy, trả bằng thời gian học.',
      },
    ],
  },
  {
    id: 'p6-u3-l3',
    unitId: 'p6-u3',
    language: 'python',
    title: 'Luật mượn: nhiều người cùng ĐỌC được, nhưng chỉ một người được GHI',
    hook: 'Cả phòng cùng đọc chung một bản kế hoạch trên tường thì không sao. Nhưng nếu một người bắt đầu tẩy xoá sửa lại nó trong lúc bốn người kia đang đọc, mỗi người sẽ đọc ra một bản khác nhau — và không ai biết mình đang đọc bản nào.',
    theory:
      'Hai bài trước đặt ra bài toán (ai giải phóng?) và cho thấy hậu quả khi làm sai (con trỏ treo, giải phóng hai lần, rò rỉ). Bài này là lời giải mà Rust đưa ra, và nó gói gọn trong đúng một luật — nghe rất đơn giản nhưng có sức mạnh đáng ngạc nhiên.\n\n**LUẬT MƯỢN: tại mỗi thời điểm, một giá trị có thể có HOẶC nhiều tham chiếu ĐỌC, HOẶC đúng một tham chiếu GHI — không bao giờ cả hai cùng lúc.**\n\nTrong Rust viết là &T (mượn đọc, muốn bao nhiêu cũng được) và &mut T (mượn ghi, độc quyền). Trình biên dịch kiểm luật này lúc BIÊN DỊCH; vi phạm thì chương trình không dịch được, chứ không phải chạy rồi mới sai.\n\n**VÌ SAO CHÍNH LÀ LUẬT NÀY.** Nó không phải một quy tắc tuỳ tiện — nó chặn cùng lúc hai họ lỗi lớn nhất của nghề, mà lâu nay ta vẫn coi là hai vấn đề riêng biệt:\n\n1. **Lỗi bộ nhớ.** Không ai được giữ tham chiếu tới thứ đang bị người khác sửa hoặc xoá. Con trỏ treo biến mất theo luật này, vì trình biên dịch không cho phép tham chiếu sống lâu hơn giá trị nó trỏ tới.\n2. **Tranh chấp dữ liệu giữa các luồng (data race).** Nhớ lại bài P6-U2 đầu tiên: "chung += 1" chạy sai vì hai luồng cùng đọc-sửa-ghi. Tranh chấp dữ liệu, theo định nghĩa, cần đúng ba điều kiện: hai luồng cùng truy cập một ô, ít nhất một bên GHI, và không có đồng bộ. Luật mượn phá điều kiện thứ hai ngay từ lúc biên dịch. Đây là lý do Rust được quảng cáo là "fearless concurrency" — không phải vì nó có công cụ đồng thời đặc biệt, mà vì cùng một luật đã dùng cho bộ nhớ cũng chặn luôn data race.\n\n**BA HỆ QUẢ hay làm người mới vấp, và cả ba đều hợp lý khi hiểu lý do:**\n\n- **Không thể sửa danh sách trong lúc đang duyệt nó.** Vòng lặp for đang giữ một mượn ĐỌC lên danh sách; muốn thêm phần tử là cần mượn GHI — vi phạm luật. Nghe khó chịu, nhưng chính là lỗi mà Python im lặng cho qua rồi cho ra kết quả kỳ quặc, còn Java thì ném ConcurrentModificationException lúc chạy. Rust chặn trước khi bạn kịp chạy.\n- **Mượn phải KẾT THÚC trước khi giá trị bị huỷ hoặc chuyển đi.** Không được trả về tham chiếu tới biến cục bộ của hàm — biến ấy chết khi hàm kết thúc.\n- **Chuyển quyền sở hữu (move) trong lúc còn người mượn là cấm.** Sau khi chuyển, chủ cũ không dùng lại được nữa — đúng ý bài P6-U3 đầu tiên.\n\n**CÁI GIÁ, nói cho công bằng.** Luật này chặt hơn thực tế cần: có những chương trình hoàn toàn đúng mà vẫn bị trình biên dịch từ chối, vì nó không đủ thông minh để chứng minh chúng an toàn. Rust để sẵn hai lối thoát: các kiểu như RefCell/Mutex dời việc kiểm tra sang lúc chạy (vi phạm thì chương trình panic thay vì âm thầm sai), và khối unsafe cho phép bạn tự chịu trách nhiệm ở những chỗ hiếm hoi thật sự cần. Đánh đổi tổng thể: bạn trả trước bằng thời gian cãi nhau với trình biên dịch, để không phải trả sau bằng những đêm truy lỗi không tái hiện được.\n\nBài hôm nay bạn viết chính bộ kiểm tra ấy — một trình kiểm mượn tí hon. Viết xong, những thông báo lỗi của Rust sẽ thôi trông như lời cằn nhằn vô cớ.',
    workedExample: {
      code: `# Trinh kiem muon ti hon: mo phong luat &T / &mut T cua Rust.
def kiem_muon(lenh):
    """Tra ve (loi dau tien, so nguoi cung doc dong thoi NHIEU NHAT)."""
    doc = 0            # so muon DOC dang mo
    ghi = 0            # so muon GHI dang mo (toi da 1)
    da_chuyen = False  # da chuyen quyen so huu di chua
    dinh = 0

    for b, l in enumerate(lenh, 1):
        if da_chuyen:
            return f"buoc {b}: dung sau khi chuyen quyen so huu", dinh
        if l == "doc+":
            if ghi > 0:
                return f"buoc {b}: muon doc khi dang co muon ghi", dinh
            doc += 1
            dinh = max(dinh, doc)
        elif l == "ghi+":
            if ghi > 0:
                return f"buoc {b}: muon ghi khi dang co muon ghi", dinh
            if doc > 0:
                return f"buoc {b}: muon ghi khi dang co muon doc", dinh
            ghi += 1
        elif l == "doc-":
            doc -= 1
        elif l == "ghi-":
            ghi -= 1
    return "khong", dinh


for kich_ban in [
    "doc+ doc+ doc+ doc- doc- doc-",   # nhieu nguoi cung doc: hop le
    "doc+ ghi+",                       # dang co nguoi doc ma doi ghi: cam
    "ghi+ ghi+",                       # hai nguoi cung ghi: cam
    "ghi+ ghi- doc+ doc-",             # tra xong roi muon tiep: hop le
]:
    print(kich_ban, "->", kiem_muon(kich_ban.split()))`,
      stdinLines: [],
    },
    predict: {
      code: `so = [1, 2, 3]
duyet = []
for x in so:
    if x == 2:
        so.append(99)     # sua danh sach TRONG luc dang duyet no
    duyet.append(x)
    if len(duyet) > 6:    # chan de bai in ra duoc
        break
print(len(duyet), len(so))`,
      question: 'Danh sách ba phần tử, nhưng bị thêm phần tử vào giữa lúc đang duyệt. In ra gì?',
      choices: ['4 4', '3 3', '3 4', '4 3'],
      answerIndex: 0,
      explain:
        'In ra "4 4": vòng lặp duyệt tới BỐN phần tử dù danh sách ban đầu chỉ có ba — phần tử 99 vừa thêm vào cũng bị duyệt luôn. Điều đáng nói là Python KHÔNG báo lỗi gì: bạn đang sửa chính cấu trúc mình đang duyệt, và ở hàm dài 200 dòng thì đây là loại lỗi mất cả ngày để tìm (có khi bỏ sót phần tử, có khi lặp vô hạn). Java ném ConcurrentModificationException lúc chạy — muộn, nhưng còn báo. Rust từ chối BIÊN DỊCH: vòng for đang giữ mượn đọc, mà append cần mượn ghi, vi phạm luật "đọc nhiều HOẶC ghi một".',
    },
    parsons: {
      prompt:
        'Xếp lại nhánh xử lý "ghi+" — nhánh cốt lõi của luật mượn. Chú ý phải kiểm CẢ HAI loại mượn đang mở.',
      lines: [
        'elif l == "ghi+":',
        '    if ghi > 0:',
        '        return f"buoc {b}: muon ghi khi dang co muon ghi", dinh',
        '    if doc > 0:',
        '        return f"buoc {b}: muon ghi khi dang co muon doc", dinh',
        '    ghi += 1',
      ],
    },
    make: {
      prompt:
        'Viết trình kiểm mượn tí hon — bản thu nhỏ của borrow checker trong Rust.\n\nHàm kiem_muon(lenh) nhận danh sách lệnh trên MỘT giá trị. Năm lệnh: doc+ (mở mượn đọc), doc- (trả mượn đọc), ghi+ (mở mượn ghi), ghi- (trả mượn ghi), chuyen (chuyển quyền sở hữu đi nơi khác).\n\nTrả về (loi, dinh_doc):\n- Gặp lỗi thì DỪNG NGAY, trả về mô tả lỗi kèm đỉnh số mượn đọc đồng thời tính tới thời điểm đó. Sáu lỗi, ghi đúng nguyên văn (buoc đếm từ 1):\n  · bất kỳ lệnh nào sau khi đã chuyen → "buoc {i}: dung sau khi chuyen quyen so huu"\n  · doc+ khi đang có mượn ghi → "buoc {i}: muon doc khi dang co muon ghi"\n  · ghi+ khi đang có mượn ghi → "buoc {i}: muon ghi khi dang co muon ghi"\n  · ghi+ khi đang có mượn đọc → "buoc {i}: muon ghi khi dang co muon doc"\n  · doc- mà không có mượn đọc nào → "buoc {i}: tra muon doc khong ton tai"\n  · ghi- mà không có mượn ghi nào → "buoc {i}: tra muon ghi khong ton tai"\n  · chuyen khi còn người mượn → "buoc {i}: chuyen quyen so huu khi dang co nguoi muon"\n- Chạy hết mà không lỗi → ("khong", đỉnh số mượn đọc đồng thời).\n\nLưu ý thứ tự kiểm ở ghi+: báo lỗi "dang co muon ghi" TRƯỚC, rồi mới tới "dang co muon doc".\n\nChương trình chính đọc MỘT dòng input() là dãy lệnh cách nhau bởi dấu cách (dòng rỗng = không lệnh nào), rồi in đúng hai dòng:\nLoi dau tien: <mô tả hoặc khong>\nDinh muon doc: <số>',
      starterCode: `def kiem_muon(lenh):
    doc = 0
    ghi = 0
    da_chuyen = False
    dinh = 0

    for b, l in enumerate(lenh, 1):
        # Sau khi chuyển quyền sở hữu thì MỌI lệnh đều sai — kiểm cái này trước tiên
        ...
    return "khong", dinh


lenh = input("Day lenh: ").split()
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['doc+ doc+ doc+ doc- doc- doc-'],
          expected: 'Dinh muon doc: 3',
          match: 'contains',
          hidden: false,
          label: 'Ba người cùng đọc là HỢP LỆ — luật chỉ cấm ghi khi có người khác',
        },
        {
          stdinLines: ['doc+ ghi+'],
          expected: 'Loi dau tien: buoc 2: muon ghi khi dang co muon doc',
          match: 'contains',
          hidden: false,
          label: 'Đang có người đọc mà đòi ghi → cấm',
        },
        {
          stdinLines: ['ghi+ ghi+'],
          expected: 'Loi dau tien: buoc 2: muon ghi khi dang co muon ghi',
          match: 'contains',
          hidden: false,
          label: 'Mượn ghi là ĐỘC QUYỀN, không thể có hai',
        },
        {
          stdinLines: ['ghi+ ghi- doc+ doc-'],
          expected: 'Loi dau tien: khong',
          match: 'contains',
          hidden: false,
          label: 'Trả xong rồi mượn kiểu khác thì hợp lệ — luật xét theo THỜI ĐIỂM',
        },
        {
          stdinLines: ['doc+ chuyen'],
          expected: 'Loi dau tien: buoc 2: chuyen quyen so huu khi dang co nguoi muon',
          match: 'contains',
          hidden: false,
          label: 'Chuyển quyền sở hữu trong lúc còn người mượn → con trỏ treo, phải cấm',
        },
        {
          stdinLines: [''],
          expected: 'Dinh muon doc: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: không lệnh nào → không lỗi, đỉnh 0',
        },
        {
          stdinLines: ['chuyen doc+'],
          expected: 'Loi dau tien: buoc 2: dung sau khi chuyen quyen so huu',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chủ cũ dùng lại giá trị đã chuyển đi',
        },
        {
          stdinLines: ['ghi-'],
          expected: 'Loi dau tien: buoc 1: tra muon ghi khong ton tai',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: trả một khoản mượn chưa từng mở — đừng để bộ đếm âm',
        },
        {
          stdinLines: ['doc+ doc+ doc- ghi+'],
          expected: 'Dinh muon doc: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đỉnh là 2 dù lúc lỗi chỉ còn 1 người đọc',
        },
      ],
      hints: [
        'Chỉ cần ba biến trạng thái: số mượn đọc đang mở, số mượn ghi đang mở, và một cờ đã chuyển quyền sở hữu hay chưa. Không cần lưu danh sách người mượn.',
        'Cờ da_chuyen phải kiểm ĐẦU MỖI VÒNG, trước khi phân nhánh theo lệnh — vì sau khi chuyển thì mọi lệnh đều sai, không riêng lệnh nào.',
        'Nhánh ghi+ có HAI điều kiện chứ không phải một, và đề yêu cầu kiểm "đang có mượn ghi" trước "đang có mượn doc" — thứ tự này quyết định thông báo lỗi nào hiện ra.',
        'Ca "ghi-" một mình: nếu bạn trừ thẳng mà không kiểm, bộ đếm thành -1 và mọi kiểm tra sau đó sai theo. Kiểm bằng 0 trước rồi mới trừ.',
        'Đỉnh cập nhật ngay sau mỗi lần doc += 1 bằng dinh = max(dinh, doc). Cập nhật ở cuối hàm thì mất, vì lúc đó số mượn đã trả về gần 0 rồi.',
      ],
      sampleSolution: `def kiem_muon(lenh):
    doc = 0            # so muon DOC dang mo
    ghi = 0            # so muon GHI dang mo (toi da 1)
    da_chuyen = False
    dinh = 0

    for b, l in enumerate(lenh, 1):
        # Sau khi chuyển quyền sở hữu, chủ cũ không được đụng vào nữa
        if da_chuyen:
            return f"buoc {b}: dung sau khi chuyen quyen so huu", dinh
        if l == "doc+":
            if ghi > 0:
                return f"buoc {b}: muon doc khi dang co muon ghi", dinh
            doc += 1
            dinh = max(dinh, doc)      # cập nhật NGAY, không để cuối hàm
        elif l == "doc-":
            if doc == 0:
                return f"buoc {b}: tra muon doc khong ton tai", dinh
            doc -= 1
        elif l == "ghi+":
            # Mượn ghi là độc quyền: không có mượn ghi khác VÀ không có mượn đọc nào
            if ghi > 0:
                return f"buoc {b}: muon ghi khi dang co muon ghi", dinh
            if doc > 0:
                return f"buoc {b}: muon ghi khi dang co muon doc", dinh
            ghi += 1
        elif l == "ghi-":
            if ghi == 0:
                return f"buoc {b}: tra muon ghi khong ton tai", dinh
            ghi -= 1
        elif l == "chuyen":
            if doc > 0 or ghi > 0:
                return f"buoc {b}: chuyen quyen so huu khi dang co nguoi muon", dinh
            da_chuyen = True
    return "khong", dinh


lenh = input("Day lenh: ").split()
loi, dinh = kiem_muon(lenh)
print(f"Loi dau tien: {loi}")
print(f"Dinh muon doc: {dinh}")`,
    },
    homework:
      'Ba việc để luật mượn đi từ "quy tắc phải nhớ" sang "cách nghĩ".\n\n1. **Nối hai bài lại.** Ghép trình kiểm mượn của bài này với bộ kiểm bộ nhớ của bài trước: sau lệnh "giai" mà còn mượn đang mở thì báo lỗi con trỏ treo. Bạn vừa tự chứng minh hai luật ấy thực ra là MỘT luật nhìn từ hai phía.\n\n2. **Tự tìm phản ví dụ.** Nghĩ một dãy lệnh mà bộ kiểm của bạn TỪ CHỐI nhưng thực tế vẫn an toàn (gợi ý: mượn ghi phần tử số 0 trong khi có người đọc phần tử số 5). Đây đúng là chỗ Rust cũng chặt quá tay, và là lý do tồn tại của RefCell, Mutex, split_at_mut.\n\n3. **Đọc lỗi Rust thật.** Thử biên dịch: let mut v = vec![1, 2, 3]; let r = &v[0]; v.push(4); println!("{}", r); Đối chiếu thông báo lỗi với chính nhánh ghi+ bạn vừa viết — bạn vừa viết lại nó bằng chín dòng Python.',
    srsCards: [
      {
        hoi: 'Luật mượn của Rust phát biểu thế nào?',
        dap: 'Tại mỗi thời điểm, một giá trị có HOẶC nhiều tham chiếu đọc (&T), HOẶC đúng một tham chiếu ghi (&mut T) — không bao giờ cả hai cùng lúc. Trình biên dịch kiểm lúc biên dịch, vi phạm thì không dịch được.',
      },
      {
        hoi: 'Vì sao luật mượn chặn được tranh chấp dữ liệu giữa các luồng?',
        dap: 'Vì tranh chấp dữ liệu cần đủ ba điều kiện: hai luồng cùng chạm một ô, ít nhất một bên GHI, và không có đồng bộ. Luật mượn phá điều kiện thứ hai ngay từ lúc biên dịch — đó là gốc của câu "fearless concurrency".',
      },
      {
        hoi: 'Vì sao Rust không cho sửa một danh sách trong lúc đang duyệt nó?',
        dap: 'Vì vòng lặp đang giữ một mượn đọc lên danh sách, còn thêm phần tử thì cần mượn ghi — vi phạm luật. Cùng đoạn code đó Python chạy im lặng cho ra kết quả kỳ quặc, Java ném lỗi lúc chạy, Rust chặn trước khi chạy.',
      },
      {
        hoi: 'Luật mượn chặt quá tay thì Rust để lối thoát nào?',
        dap: 'RefCell và Mutex dời việc kiểm tra sang lúc chạy (vi phạm thì panic thay vì âm thầm sai), và khối unsafe cho phép tự chịu trách nhiệm ở những chỗ hiếm hoi thật sự cần.',
      },
    ],
  },
]
