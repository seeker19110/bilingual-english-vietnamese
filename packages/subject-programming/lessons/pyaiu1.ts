// lessons/pyaiu1.ts — Chương C1 "Python nhập môn" của khoá "Python / AI Cơ Bản" (pyai)
// (docs/specs/2026-09-01-pyai-bai-hoc-chi-tiet.md). Khoá 1/6 cụm "Kỹ sư AI thực chiến"
// (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md).
//
// unitId 'pyai-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, đúng
// cơ chế 'ml-u*'/'git-u*'.
//
// Luật soạn riêng của khoá: mọi print() là tiếng Việt KHÔNG DẤU (Pyodide/CI chấm bằng so
// khớp chuỗi), không dùng thư viện ngoài trong code được chấm.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const PYAI_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u1-l1',
    unitId: 'pyai-u1',
    language: 'python',
    title: 'Chương trình Python đầu tiên — biến, kiểu và print',
    hook: 'Máy tính không tự biết gì cả: nó chỉ làm đúng những câu bạn viết ra, theo đúng thứ tự. Chương trình đầu tiên của mọi lập trình viên là bảo máy NÓI một câu. Hôm nay bạn bảo máy chào bạn — rồi bảo nó nhớ tên bạn vào một cái hộp gọi là BIẾN.',
    theory:
      'PYTHON chạy code từ trên xuống dưới, từng dòng một. Dòng đầu xong mới tới dòng sau — không có gì chạy song song, không có gì bỏ qua.\n\nBA thứ cần nắm hôm nay:\n\n1. print(...) — bảo máy IN ra màn hình. Trong ngoặc là thứ muốn in.\n2. BIẾN — cái hộp có tên, dùng dấu = để cất giá trị vào: ten = "Lan". Từ đó về sau, viết ten là máy hiểu "Lan". Dấu = trong lập trình KHÔNG phải "bằng nhau" của toán, nó là "cất vào".\n3. KIỂU dữ liệu — máy phân biệt chữ và số:\n   - str (chuỗi): đặt trong nháy "Lan" hoặc \'Lan\'. Cộng hai chuỗi là NỐI: "Lan" + "Anh" = "LanAnh".\n   - int (số nguyên): 10, -3. Cộng là cộng thật: 10 + 1 = 11.\n   - float (số thực): 2.5. Phép chia / luôn cho float: 4 / 2 = 2.0.\n\ninput() luôn trả về CHUỖI, kể cả khi người dùng gõ số. Muốn tính toán phải đổi kiểu: int("10") + 1 cho 11, còn "10" + 1 là LỖI (cộng chuỗi với số). Đây là lỗi số một của người mới.\n\nf-string là cách ghép chuỗi dễ đọc nhất: đặt chữ f trước nháy, rồi để biến trong { }:\nprint(f"Xin chao {ten}") — máy thay {ten} bằng giá trị của biến.',
    workedExample: {
      code: `# Chuong trinh dau tien: cat gia tri vao bien roi in ra
ten = "Lan"                      # bien kieu chuoi (str)
tuoi = 10                        # bien kieu so nguyen (int)

print("Xin chao!")               # in mot chuoi co dinh
print(f"Ban ten {ten}")          # f-string: thay {ten} bang "Lan"
print(f"Nam sau ban {tuoi + 1} tuoi")   # tinh toan ngay trong { }

cao = 1.4                        # bien kieu so thuc (float)
print(f"Chieu cao: {cao} met")
print(type(tuoi))                # xem may hieu bien nay kieu gi`,
      stdinLines: [],
    },
    predict: {
      code: `a = "10"\nb = 5\nprint(int(a) + b)`,
      question: 'Đoạn code này in ra gì?',
      choices: ['15', '105', 'Lỗi vì không cộng được chuỗi với số', '10 5'],
      answerIndex: 0,
      explain:
        'int("10") đổi chuỗi "10" thành số 10, nên 10 + 5 = 15. Nếu bỏ int(...) đi thì "10" + 5 mới báo lỗi TypeError vì Python không tự đoán ý bạn muốn cộng số hay nối chuỗi.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự một chương trình chào hỏi: hỏi tên → hỏi tuổi (đổi sang số) → chào → tính tuổi năm sau.',
      lines: [
        'ten = input("Ten ban: ")',
        'tuoi = int(input("Tuoi ban: "))',
        'print(f"Xin chao {ten}")',
        'print(f"Nam sau ban {tuoi + 1} tuoi")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình làm quen đọc 2 dòng input():\n- Dòng 1: tên người dùng.\n- Dòng 2: tuổi (số nguyên).\n\nIn ra đúng 2 dòng:\nXin chao <ten>\nNam sau ban <tuoi+1> tuoi\n\nVí dụ: nhập "Lan" và "10" thì in "Xin chao Lan" rồi "Nam sau ban 11 tuoi".\nLưu ý: input() trả về CHUỖI, muốn cộng 1 phải đổi sang int trước.',
      starterCode: `ten = input("Ten ban: ")
tuoi = input("Tuoi ban: ")
# Doi tuoi sang so nguyen bang int(...)
# In hai dong theo dung mau de bai
`,
      testCases: [
        {
          stdinLines: ['Lan', '10'],
          expected: 'Xin chao Lan\nNam sau ban 11 tuoi',
          match: 'contains',
          hidden: false,
          label: 'Lan, 10 tuổi → năm sau 11 tuổi',
        },
        {
          stdinLines: ['Minh', '25'],
          expected: 'Nam sau ban 26 tuoi',
          match: 'contains',
          hidden: false,
          label: 'Minh, 25 tuổi → năm sau 26 tuổi',
        },
        {
          stdinLines: ['An', '0'],
          expected: 'Xin chao An\nNam sau ban 1 tuoi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tuổi 0 — phải ra 1, không phải "01"',
        },
      ],
      hints: [
        'input() luôn trả chuỗi. Muốn cộng 1 vào tuổi thì phải bọc int(...) quanh nó: tuoi = int(input(...)).',
        'Nếu ra "101" thay vì 11 nghĩa là bạn đang NỐI chuỗi "10" với "1" chứ không cộng số — thiếu int().',
        'Dùng f-string cho gọn: print(f"Nam sau ban {tuoi + 1} tuoi"). Tính toán viết thẳng trong { } được.',
      ],
      sampleSolution: `ten = input("Ten ban: ")
tuoi = int(input("Tuoi ban: "))
print(f"Xin chao {ten}")
print(f"Nam sau ban {tuoi + 1} tuoi")`,
    },
    homework:
      'Viết thêm một chương trình "hồ sơ cá nhân": hỏi tên, năm sinh, chiều cao (mét), rồi in một đoạn giới thiệu có đủ ba thông tin và tính tuổi hiện tại từ năm sinh (2026 trừ năm sinh). Thử cố tình quên int() ở năm sinh để tự mắt nhìn thấy thông báo lỗi TypeError — nhớ mặt lỗi đó, bạn sẽ gặp lại rất nhiều lần. Ai muốn học Python sâu hơn nữa có thể học song song bậc P1 của xương sống môn Lập trình.',
    srsCards: [
      {
        hoi: 'input() trả về kiểu dữ liệu gì, và vì sao điều đó hay gây lỗi?',
        dap: 'Luôn trả về CHUỖI (str), kể cả khi người dùng gõ số. Muốn tính toán phải đổi kiểu bằng int(...) hoặc float(...); nếu quên, "10" + 1 sẽ báo TypeError còn "10" + "1" cho ra "101" (nối chuỗi) chứ không phải 11.',
      },
      {
        hoi: 'Vì sao dấu = trong Python KHÔNG phải "bằng nhau" như trong toán học?',
        dap: 'Vì nó là phép GÁN — cất giá trị bên phải vào cái hộp (biến) có tên bên trái, một hành động chứ không phải một mệnh đề. So sánh "bằng nhau" thật sự dùng hai dấu ==, khác hẳn với =.',
      },
      {
        hoi: 'f-string là gì và viết thế nào?',
        dap: 'Cách ghép biến vào chuỗi: đặt chữ f ngay trước dấu nháy rồi để biến hoặc biểu thức trong ngoặc nhọn, ví dụ print(f"Nam sau ban {tuoi + 1} tuoi"). Python thay phần trong { } bằng giá trị đã tính.',
      },
    ],
  },
  {
    id: 'pyai-u1-l2',
    unitId: 'pyai-u1',
    language: 'python',
    title: 'if / else — máy tự phân loại điểm',
    hook: 'Cô giáo có 40 bài kiểm tra và một bảng quy đổi: từ 8 trở lên là Giỏi, 6,5 trở lên là Khá... Ngồi xếp tay thì mỏi và dễ nhầm. Máy làm việc này không bao giờ chán và không bao giờ nhầm — miễn là bạn viết đúng RANH GIỚI.',
    theory:
      'RẼ NHÁNH là cách chương trình tự chọn việc phải làm.\n\nCú pháp:\nif dieu_kien:\n    # chạy khi điều kiện ĐÚNG\nelif dieu_kien_khac:\n    # chạy khi điều kiện trên sai mà cái này đúng\nelse:\n    # chạy khi mọi điều kiện trên đều sai\n\nHai luật sống còn:\n1. DẤU HAI CHẤM cuối dòng if/elif/else, và phần thân phải THỤT VÀO (thường 4 dấu cách). Python dùng khoảng trắng để biết dòng nào thuộc nhánh nào — thụt sai là chạy sai.\n2. Các nhánh xét TỪ TRÊN XUỐNG và dừng ở nhánh đầu tiên đúng. Vì thế thứ tự quan trọng: xét >= 8 trước, rồi mới >= 6.5. Nếu đảo ngược, điểm 9 sẽ rơi vào nhánh >= 6.5 và bị xếp Khá.\n\nToán tử so sánh: > lớn hơn, < nhỏ hơn, >= lớn hơn hoặc bằng, <= nhỏ hơn hoặc bằng, == bằng, != khác. Ghép điều kiện bằng and (cả hai đúng), or (một trong hai đúng), not (đảo lại).\n\nCÁI BẪY LỚN NHẤT là RANH GIỚI. "Từ 8 trở lên" là >= 8, không phải > 8 — viết > 8 thì học sinh đúng 8 điểm bị tụt hạng oan. Mỗi lần viết điều kiện, hãy tự hỏi: đúng số ở ranh giới thì rơi vào nhánh nào? Đây là loại lỗi mà máy không báo, chỉ người dùng mới phát hiện.',
    workedExample: {
      code: `# Phan loai nhiet do thanh 3 muc
nhiet_do = 30                    # thu doi so nay de xem nhanh nao chay

if nhiet_do >= 35:               # xet nhanh cao nhat TRUOC
    print("Nong gat")
elif nhiet_do >= 25:             # 30 khong >= 35, nhung >= 25 -> vao day
    print("Am ap")
else:                            # duoi 25 moi xuong day
    print("Mat troi")

# Ghep dieu kien bang and: khoang 25 den 34
if nhiet_do >= 25 and nhiet_do < 35:
    print("Trong khoang de chiu")`,
      stdinLines: [],
    },
    predict: {
      code: `diem = 8\nif diem > 8:\n    print("Gioi")\nelif diem >= 6.5:\n    print("Kha")\nelse:\n    print("Trung binh")`,
      question: 'Với điểm đúng bằng 8, chương trình in ra gì?',
      choices: ['Kha', 'Gioi', 'Trung binh', 'Không in gì'],
      answerIndex: 0,
      explain:
        'Điều kiện viết là diem > 8 (LỚN HƠN), mà 8 không lớn hơn 8 nên nhánh đầu bị bỏ qua; 8 >= 6.5 đúng nên in "Kha". Đây đúng là lỗi ranh giới kinh điển: muốn "từ 8 trở lên" phải viết >= 8.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự bậc thang xếp loại: đọc điểm → xét Giỏi → xét Khá → còn lại là Yếu.',
      lines: [
        'diem = float(input("Diem: "))',
        'if diem >= 8:',
        '    print("Gioi")',
        'elif diem >= 6.5:',
        '    print("Kha")',
        'else:',
        '    print("Yeu")',
      ],
    },
    make: {
      prompt:
        'Viết máy xếp loại điểm. Đọc 1 dòng input() là điểm (có thể có phần thập phân, vd "6.5").\n\nIn đúng 1 dòng: Xep loai: <loai>, theo bảng:\n- Từ 8.0 trở lên: Gioi\n- Từ 6.5 đến dưới 8.0: Kha\n- Từ 5.0 đến dưới 6.5: Trung binh\n- Dưới 5.0: Yeu\n\nChú ý ranh giới: đúng 8.0 là Gioi, đúng 5.0 là Trung binh.',
      starterCode: `diem = float(input("Diem: "))
# Xet cac nhanh tu cao xuong thap bang if / elif / else
# In dung mot dong: Xep loai: ...
`,
      testCases: [
        {
          stdinLines: ['9'],
          expected: 'Xep loai: Gioi',
          match: 'contains',
          hidden: false,
          label: '9 điểm → Gioi',
        },
        {
          stdinLines: ['6.5'],
          expected: 'Xep loai: Kha',
          match: 'contains',
          hidden: false,
          label: '6.5 đúng ranh giới dưới của Khá',
        },
        {
          stdinLines: ['4.9'],
          expected: 'Xep loai: Yeu',
          match: 'contains',
          hidden: false,
          label: '4.9 → Yeu',
        },
        {
          stdinLines: ['5'],
          expected: 'Xep loai: Trung binh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng 5.0 phải là Trung binh, không phải Yeu',
        },
      ],
      hints: [
        'Đổi input sang số thực trước: diem = float(input(...)) — dùng float chứ không int, vì đề có 6.5.',
        'Xét từ nhánh CAO nhất xuống: >= 8, rồi >= 6.5, rồi >= 5, cuối cùng else. Đảo thứ tự là sai kết quả.',
        'Ranh giới "từ X trở lên" viết là >= X. Nếu ca ẩn trượt, gần như chắc chắn bạn đang viết > 5 thay vì >= 5.',
      ],
      sampleSolution: `diem = float(input("Diem: "))
if diem >= 8:
    print("Xep loai: Gioi")
elif diem >= 6.5:
    print("Xep loai: Kha")
elif diem >= 5:
    print("Xep loai: Trung binh")
else:
    print("Xep loai: Yeu")`,
    },
    homework:
      'Mở rộng thành máy tính tiền gửi xe theo giờ: dưới 1 giờ 5.000đ, từ 1 đến dưới 3 giờ 10.000đ, từ 3 giờ trở lên 10.000đ cộng thêm 3.000đ mỗi giờ vượt quá 3. Trước khi code, hãy VIẾT RA GIẤY kết quả mong đợi cho các mốc 0.5 · 1 · 3 · 5 giờ — rồi mới viết if/elif. Thói quen liệt kê ranh giới trước khi code sẽ cứu bạn rất nhiều lần về sau.',
    srsCards: [
      {
        hoi: 'Vì sao thứ tự các nhánh if / elif lại quan trọng?',
        dap: 'Python xét từ trên xuống và DỪNG ở nhánh đầu tiên đúng. Nếu xét >= 6.5 trước >= 8 thì điểm 9 rơi vào nhánh Khá và không bao giờ tới được nhánh Giỏi. Luôn xét điều kiện chặt nhất (ngưỡng cao nhất) trước.',
      },
      {
        hoi: '"Từ 8 điểm trở lên" viết thành điều kiện Python thế nào, và viết sai kiểu gì?',
        dap: 'Viết diem >= 8. Sai kinh điển là viết diem > 8, khiến đúng 8 điểm bị loại khỏi nhánh — loại lỗi RANH GIỚI mà máy không báo, chỉ người dùng phát hiện.',
      },
      {
        hoi: 'Python dựa vào đâu để biết dòng nào thuộc nhánh if nào?',
        dap: 'Dựa vào THỤT ĐẦU DÒNG (indentation, thường 4 dấu cách) sau dấu hai chấm. Khác nhiều ngôn ngữ dùng dấu ngoặc nhọn; thụt sai là chương trình chạy sai chứ không chỉ xấu.',
      },
    ],
  },
  {
    id: 'pyai-u1-l3',
    unitId: 'pyai-u1',
    language: 'python',
    title: 'Vòng lặp — máy đoán số và vòng phản hồi',
    hook: 'Bạn nghĩ một số từ 1 đến 100, máy đoán, bạn chỉ được nói "cao quá" hay "thấp quá". Máy đoán bừa thì cả trăm lượt; máy đoán GIỮA khoảng còn lại thì tối đa 7 lượt là ra. Đây chính là hình dáng của mọi thuật toán học: đoán → nhận phản hồi → thu hẹp → đoán lại.',
    theory:
      'VÒNG LẶP để máy làm đi làm lại một việc mà bạn chỉ viết một lần.\n\nHai kiểu:\n1. for — lặp một số lần biết trước: for i in range(5): chạy 5 vòng với i = 0,1,2,3,4. range(1, 4) cho 1,2,3 (bao gồm đầu, KHÔNG bao gồm cuối).\n2. while — lặp CHỪNG NÀO điều kiện còn đúng: while con_lai > 1: ... Dùng khi chưa biết trước bao nhiêu vòng.\n\nbreak thoát khỏi vòng lặp ngay lập tức; continue bỏ qua phần còn lại của vòng hiện tại và sang vòng sau.\n\nVÒNG LẶP VÔ TẬN là lỗi hay gặp nhất: while mà điều kiện không bao giờ sai, hoặc bạn quên cập nhật biến điều khiển. Mỗi lần viết while, hãy chỉ ra được dòng nào làm cho vòng lặp TIẾN gần tới điểm dừng.\n\nTHUẬT TOÁN TÌM KIẾM NHỊ PHÂN (máy đoán số) hoạt động thế này: giữ hai mốc thap và cao (ban đầu 1 và 100). Mỗi vòng đoán điểm GIỮA = (thap + cao) // 2 (dấu // là chia lấy phần nguyên). Nếu đoán nhỏ hơn số bí mật thì mọi số từ đoán trở xuống bị loại: thap = doan + 1. Nếu lớn hơn thì cao = doan - 1. Mỗi vòng khoảng còn lại giảm một nửa, nên 100 khả năng chỉ cần tối đa 7 lượt (vì 2 mũ 7 = 128 > 100).\n\nĐây là mẫu VÒNG PHẢN HỒI: mỗi lần đoán, thông tin thu được làm không gian tìm kiếm nhỏ đi. Học máy cũng đúng như vậy, chỉ khác là "phản hồi" đến từ sai số trên dữ liệu.',
    workedExample: {
      code: `# Vong lap for: dem tu 1 den 5
for i in range(1, 6):            # i lan luot 1,2,3,4,5
    print(f"Vong {i}")

# Vong lap while: chia doi cho den khi con 1
n = 100
buoc = 0
while n > 1:                     # con lon hon 1 thi con lap
    n = n // 2                   # dong nay lam vong lap TIEN toi diem dung
    buoc = buoc + 1
print(f"So lan chia doi: {buoc}")   # 100 -> 50 -> 25 -> 12 -> 6 -> 3 -> 1`,
      stdinLines: [],
    },
    predict: {
      code: `thap = 1\ncao = 100\nprint((thap + cao) // 2)`,
      question: 'Lần đoán ĐẦU TIÊN của thuật toán nhị phân trong khoảng 1..100 là số nào?',
      choices: ['50', '50.5', '51', '1'],
      answerIndex: 0,
      explain:
        '(1 + 100) // 2 = 101 // 2 = 50 — dấu // là chia lấy phần nguyên nên bỏ phần lẻ, cho số nguyên 50. Nếu dùng dấu / thường sẽ ra 50.5 và không dùng làm số đoán được.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự một vòng đoán nhị phân: đặt mốc → lặp → đoán giữa → so sánh để thu hẹp.',
      lines: [
        'thap = 1',
        'cao = 100',
        'while thap <= cao:',
        '    doan = (thap + cao) // 2',
        '    if doan == bi_mat:',
        '        break',
        '    elif doan < bi_mat:',
        '        thap = doan + 1',
        '    else:',
        '        cao = doan - 1',
      ],
    },
    make: {
      prompt:
        'Viết máy đoán số bằng tìm kiếm nhị phân trong khoảng 1..100.\n\nĐọc 1 dòng input() là số bí mật (số nguyên 1..100). Máy tự đoán: mỗi vòng đoán số GIỮA khoảng còn lại, in ra "Doan: <so>", rồi thu hẹp khoảng theo kết quả so sánh. Khi đoán trúng thì dừng và in thêm dòng cuối: So lan doan: <n>.\n\nVí dụ với số bí mật 50: in "Doan: 50" rồi "So lan doan: 1".\nVới số bí mật 1: máy đoán lần lượt 50, 25, 12, 6, 3, 1 → "So lan doan: 6".',
      starterCode: `bi_mat = int(input("So bi mat: "))
thap = 1
cao = 100
dem = 0
# while: doan giua, in "Doan: ...", tang dem, roi thu hep thap/cao
# Trung thi break, cuoi cung in "So lan doan: ..."
`,
      testCases: [
        {
          stdinLines: ['50'],
          expected: 'Doan: 50\nSo lan doan: 1',
          match: 'contains',
          hidden: false,
          label: '50 nằm đúng giữa → trúng ngay lượt đầu',
        },
        {
          stdinLines: ['1'],
          expected: 'So lan doan: 6',
          match: 'contains',
          hidden: false,
          label: 'Số nhỏ nhất → 6 lượt (50, 25, 12, 6, 3, 1)',
        },
        {
          stdinLines: ['100'],
          expected: 'Doan: 75',
          match: 'contains',
          hidden: false,
          label: 'Sau khi 50 quá thấp, lượt hai phải là 75',
        },
        {
          stdinLines: ['100'],
          expected: 'So lan doan: 7',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: số lớn nhất — đúng 7 lượt là chặn trên của 1..100',
        },
      ],
      hints: [
        'Dùng phép // (chia lấy phần nguyên) cho số đoán: doan = (thap + cao) // 2. Dùng / sẽ ra số thực và in ra sai định dạng.',
        'Đoán NHỎ hơn số bí mật nghĩa là phần dưới bị loại hết: thap = doan + 1. Ngược lại thì cao = doan - 1. Quên cộng/trừ 1 sẽ gây vòng lặp vô tận.',
        'Đếm: tăng dem ngay sau khi tính doan (trước cả khi so sánh), để lượt đoán trúng cũng được tính. In "So lan doan: ..." SAU vòng lặp.',
      ],
      sampleSolution: `bi_mat = int(input("So bi mat: "))
thap = 1
cao = 100
dem = 0
while thap <= cao:
    doan = (thap + cao) // 2
    dem = dem + 1
    print(f"Doan: {doan}")
    if doan == bi_mat:
        break
    elif doan < bi_mat:
        thap = doan + 1
    else:
        cao = doan - 1
print(f"So lan doan: {dem}")`,
    },
    homework:
      'Đổi khoảng tìm kiếm thành 1..1000 rồi chạy thử với vài số: số lượt tối đa tăng lên bao nhiêu? (Gợi ý: 2 mũ 10 = 1024, nên tối đa 10 lượt — gấp 10 lần không gian nhưng chỉ thêm 3 lượt.) Sau đó viết bản ĐOÁN BỪA: mỗi vòng thử lần lượt 1, 2, 3... và đếm số lượt cho cùng các số bí mật. So sánh hai con số để tự thấy vì sao "thu hẹp một nửa mỗi bước" là ý tưởng lớn của khoa học máy tính.',
    srsCards: [
      {
        hoi: 'Khi nào dùng for, khi nào dùng while?',
        dap: 'for khi biết trước số vòng hoặc duyệt qua một dãy có sẵn (for i in range(5), for x in danh_sach). while khi số vòng phụ thuộc điều kiện chưa biết trước — lặp chừng nào điều kiện còn đúng.',
      },
      {
        hoi: 'Tìm kiếm nhị phân thu hẹp khoảng thế nào, và vì sao nhanh?',
        dap: 'Mỗi vòng đoán điểm giữa (thap + cao) // 2; nếu đoán thấp thì thap = doan + 1, nếu cao thì cao = doan - 1. Mỗi bước loại một nửa số khả năng, nên 100 khả năng chỉ cần tối đa 7 lượt (2 mũ 7 = 128 > 100).',
      },
      {
        hoi: 'Vòng lặp vô tận thường do đâu, phòng tránh thế nào?',
        dap: 'Do biến điều khiển không bao giờ tiến tới điểm dừng (quên cập nhật, hoặc cập nhật sai như thap = doan thay vì doan + 1). Mỗi khi viết while, phải chỉ ra được dòng nào làm điều kiện tiến gần tới chỗ sai.',
      },
    ],
  },
  {
    id: 'pyai-u1-l4',
    unitId: 'pyai-u1',
    language: 'python',
    title: 'Hàm — đóng gói một việc, gọi lại bao nhiêu lần cũng được',
    hook: 'Quầy vé bảo tàng tính giá theo tuổi: trẻ dưới 6 miễn phí, học sinh 25.000, người lớn 50.000, người già từ 60 giảm còn 20.000. Cả đoàn 30 người thì bạn không chép luật đó 30 lần — bạn viết MỘT lần thành hàm rồi gọi 30 lần.',
    theory:
      'HÀM là một khối code có tên, nhận đầu vào (THAM SỐ) và trả về đầu ra (GIÁ TRỊ TRẢ VỀ).\n\ndef gia_ve(tuoi):        # def = định nghĩa; tuoi là tham số\n    if tuoi < 6:\n        return 0         # return trả kết quả ra NGOÀI và kết thúc hàm ngay\n    return 50000\n\nGọi hàm: tien = gia_ve(10) — lúc này tuoi nhận giá trị 10.\n\nBa điều dễ nhầm:\n1. print KHÁC return. print chỉ hiện chữ lên màn hình cho người xem; return đưa giá trị về cho code gọi để tính tiếp. Hàm chỉ print mà không return sẽ trả về None, và tổng của bạn sẽ vỡ.\n2. return kết thúc hàm NGAY. Mọi dòng sau return trong cùng nhánh không bao giờ chạy — nhờ vậy không cần else sau mỗi return.\n3. Biến tạo bên trong hàm là biến CỤC BỘ, biến mất khi hàm chạy xong. Muốn dùng bên ngoài thì phải return ra.\n\nVÌ SAO PHẢI TÁCH HÀM: sửa một chỗ là đúng mọi chỗ (đổi giá vé chỉ sửa trong hàm); đặt tên hàm tốt thì đọc code như đọc tiếng Việt; và mỗi hàm nhỏ có thể kiểm thử riêng. Nguyên tắc: MỘT hàm làm MỘT việc, tên hàm là động từ mô tả việc đó.',
    workedExample: {
      code: `# Ham nhan tham so va TRA VE gia tri
def gia_ve(tuoi):
    if tuoi < 6:
        return 0                 # return ket thuc ham ngay tai day
    if tuoi < 18:
        return 25000
    if tuoi < 60:
        return 50000
    return 20000                 # tu 60 tro len

doan = [5, 12, 30, 70]           # danh sach tuoi ca doan
tong = 0
for t in doan:                   # goi ham mot lan cho moi nguoi
    tien = gia_ve(t)
    print(f"Tuoi {t}: {tien} dong")
    tong = tong + tien
print(f"Tong: {tong} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `def cong(a, b):\n    print(a + b)\n\nket_qua = cong(2, 3)\nprint(ket_qua)`,
      question: 'Chương trình in ra hai dòng nào?',
      choices: ['5\nNone', '5\n5', 'None\n5', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Hàm cong chỉ PRINT chứ không RETURN, nên nó in "5" rồi trả về None mặc định. Dòng print(ket_qua) vì thế in "None". Muốn dùng lại kết quả thì phải viết return a + b.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: định nghĩa hàm trước, gọi hàm sau, cộng dồn rồi in tổng.',
      lines: [
        'def gia_ve(tuoi):',
        '    if tuoi < 6:',
        '        return 0',
        '    return 50000',
        'tong = 0',
        'for t in [5, 30]:',
        '    tong = tong + gia_ve(t)',
        'print(tong)',
      ],
    },
    make: {
      prompt:
        'Viết máy tính tiền vé cả đoàn.\n\nĐịnh nghĩa hàm gia_ve(tuoi) trả về giá vé:\n- Dưới 6 tuổi: 0\n- Từ 6 đến 17: 25000\n- Từ 18 đến 59: 50000\n- Từ 60 trở lên: 20000\n\nĐọc 1 dòng input() là các tuổi cách nhau bởi dấu phẩy (vd "5,10,30"). Với MỖI người in một dòng:\nTuoi <tuoi>: <gia> dong\nCuối cùng in tổng:\nTong: <tong> dong\n\nVí dụ "5,10,30" → 0 + 25000 + 50000, dòng cuối "Tong: 75000 dong".',
      starterCode: `def gia_ve(tuoi):
    # Tra ve gia theo bang trong de bai (dung return, KHONG print)
    return 0

dong = input("Cac tuoi: ")
# Tach bang split(","), doi sang int, goi gia_ve cho tung nguoi
`,
      testCases: [
        {
          stdinLines: ['5,10,30'],
          expected: 'Tuoi 5: 0 dong\nTuoi 10: 25000 dong\nTuoi 30: 50000 dong\nTong: 75000 dong',
          match: 'contains',
          hidden: false,
          label: '3 người đủ ba bậc giá → tổng 75.000đ',
        },
        {
          stdinLines: ['70,70'],
          expected: 'Tong: 40000 dong',
          match: 'contains',
          hidden: false,
          label: 'Hai người từ 60 tuổi → 20.000đ mỗi vé',
        },
        {
          stdinLines: ['60,17,18'],
          expected: 'Tong: 95000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ba ranh giới 60 · 17 · 18 → 20000 + 25000 + 50000',
        },
      ],
      hints: [
        'Hàm phải RETURN giá chứ không print — nếu print thì không cộng dồn tổng được (bạn sẽ cộng phải None).',
        'Ranh giới: 6 tuổi đã phải trả 25000 (điều kiện miễn phí là tuoi < 6); 60 tuổi đã được giảm (điều kiện người lớn là tuoi < 60).',
        'Duyệt: for t in [int(x) for x in dong.split(",")]: rồi trong vòng lặp vừa in vừa cộng vào biến tong khai báo trước vòng lặp.',
      ],
      sampleSolution: `def gia_ve(tuoi):
    if tuoi < 6:
        return 0
    if tuoi < 18:
        return 25000
    if tuoi < 60:
        return 50000
    return 20000

dong = input("Cac tuoi: ")
tong = 0
for t in [int(x) for x in dong.split(",")]:
    tien = gia_ve(t)
    print(f"Tuoi {t}: {tien} dong")
    tong = tong + tien
print(f"Tong: {tong} dong")`,
    },
    homework:
      'Thêm hàm thứ hai giam_gia_nhom(tong, so_nguoi) trả về tổng sau giảm: từ 10 người trở lên giảm 10%, từ 20 người giảm 15%. Gọi nó sau khi đã cộng xong tổng. Chú ý đây là bài tập về ĐẶT TÊN: hãy đọc to tên hàm của bạn — nếu phải giải thích thêm mới hiểu nó làm gì thì tên chưa đạt, đổi lại.',
    srsCards: [
      {
        hoi: 'print và return khác nhau ở đâu?',
        dap: 'print hiện chữ lên màn hình cho NGƯỜI xem, không đưa giá trị nào về. return đưa giá trị ra ngoài cho CODE gọi dùng tiếp và kết thúc hàm ngay. Hàm không có return sẽ trả về None, cộng dồn vào tổng sẽ báo lỗi.',
      },
      {
        hoi: 'Vì sao nên tách một đoạn code lặp lại thành hàm?',
        dap: 'Sửa một chỗ là đúng mọi chỗ (đổi giá vé chỉ sửa trong hàm), tên hàm làm code tự giải thích, và mỗi hàm nhỏ kiểm thử riêng được. Nguyên tắc: một hàm làm một việc, tên là động từ mô tả việc đó.',
      },
      {
        hoi: 'Biến tạo bên trong hàm có dùng được ở ngoài không?',
        dap: 'Không — đó là biến CỤC BỘ, biến mất khi hàm chạy xong. Muốn dùng ở ngoài thì phải return giá trị ra rồi gán vào một biến bên ngoài.',
      },
    ],
  },
  {
    id: 'pyai-u1-l5',
    unitId: 'pyai-u1',
    language: 'python',
    title: 'Chuỗi & làm sạch dữ liệu người dùng nhập',
    hook: 'Cùng một người, ba lần điền form ra ba kiểu: "nguyen van an", "  NGUYEN  VAN AN ", "Nguyen Van  An". Máy coi đây là ba người khác nhau, và danh sách lớp có ba dòng trùng. Mọi dự án dữ liệu — kể cả AI — đều bắt đầu bằng bước tẻ nhạt này: LÀM SẠCH.',
    theory:
      'CHUỖI (str) trong Python là dãy ký tự, có sẵn nhiều phương thức làm sạch. Gọi bằng dấu chấm sau biến:\n\n- .strip() — cắt khoảng trắng THỪA ở hai đầu. "  Lan  ".strip() cho "Lan".\n- .lower() / .upper() — đổi hết thành chữ thường / chữ hoa.\n- .capitalize() — viết hoa chữ cái đầu, HẠ THƯỜNG toàn bộ phần còn lại: "vAN".capitalize() cho "Van".\n- .split() — cắt chuỗi thành list. Gọi KHÔNG tham số thì cắt theo khoảng trắng và tự bỏ mọi khoảng trắng thừa: "  a   b ".split() cho ["a", "b"]. Gọi có tham số thì cắt theo đúng ký tự đó: "a,b".split(",") cho ["a", "b"].\n- .join() — ngược lại của split, nối list thành chuỗi: " ".join(["Nguyen", "Van"]) cho "Nguyen Van".\n- .replace(cu, moi) — thay thế; len(chuoi) đếm số ký tự.\n\nMỘT ĐIỀU QUAN TRỌNG: chuỗi trong Python KHÔNG SỬA ĐƯỢC TẠI CHỖ (immutable). ten.strip() không đổi biến ten, nó TRẢ VỀ chuỗi mới. Phải gán lại: ten = ten.strip(). Đây là lỗi thầm lặng hay gặp — code chạy không báo gì mà dữ liệu vẫn bẩn.\n\nCÔNG THỨC CHUẨN HOÁ TÊN gọn nhất: " ".join(phan.capitalize() for phan in ten.split()). Nó xử lý gọn cả ba vấn đề cùng lúc: khoảng trắng đầu/cuối, khoảng trắng thừa ở giữa, và chữ hoa/thường lộn xộn.',
    workedExample: {
      code: `ban_dau = "  nguyen   VAN an  "     # du lieu ban nguoi dung nhap

print(f"Do dai ban dau: {len(ban_dau)}")

cac_phan = ban_dau.split()          # cat theo khoang trang, tu bo phan thua
print(cac_phan)                     # ['nguyen', 'VAN', 'an']

# capitalize(): hoa chu dau, ha thuong phan con lai -> "Van"
sach = " ".join(phan.capitalize() for phan in cac_phan)
print(f"Ten chuan: {sach}")
print(f"So ky tu: {len(sach)}")`,
      stdinLines: [],
    },
    predict: {
      code: `ten = "  Lan  "\nten.strip()\nprint(f"[{ten}]")`,
      question: 'Dòng cuối in ra gì?',
      choices: ['[  Lan  ]', '[Lan]', '[Lan  ]', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Chuỗi là bất biến: ten.strip() TRẢ VỀ chuỗi mới "Lan" nhưng kết quả bị vứt đi vì không gán cho ai. Biến ten vẫn nguyên "  Lan  ". Phải viết ten = ten.strip() mới đổi được.',
    },
    parsons: {
      prompt: 'Xếp đúng quy trình chuẩn hoá tên: đọc → cắt thành từ → viết hoa từng từ → nối lại.',
      lines: [
        'tho = input("Ho ten: ")',
        'cac_phan = tho.split()',
        'sach = " ".join(p.capitalize() for p in cac_phan)',
        'print(f"Ten chuan: {sach}")',
        'print(f"So ky tu: {len(sach)}")',
      ],
    },
    make: {
      prompt:
        'Viết bộ làm sạch họ tên. Đọc 1 dòng input() là họ tên người dùng nhập (có thể thừa khoảng trắng ở đầu, cuối, giữa; chữ hoa chữ thường lộn xộn).\n\nChuẩn hoá: bỏ mọi khoảng trắng thừa, mỗi từ viết hoa chữ cái đầu và thường phần còn lại, các từ cách nhau đúng MỘT khoảng trắng.\n\nIn đúng 2 dòng:\nTen chuan: <ten da chuan hoa>\nSo ky tu: <so ky tu cua ten da chuan hoa>\n\nVí dụ nhập "  nguyen   VAN an  " → "Ten chuan: Nguyen Van An" và "So ky tu: 13".',
      starterCode: `tho = input("Ho ten: ")
# Goi ý: .split() khong tham so tu bo moi khoang trang thua
# Chuan hoa tung tu bang .capitalize() roi noi lai bang " ".join(...)
`,
      testCases: [
        {
          stdinLines: ['  nguyen   VAN an  '],
          expected: 'Ten chuan: Nguyen Van An\nSo ky tu: 13',
          match: 'contains',
          hidden: false,
          label: 'Thừa khoảng trắng đầu, cuối và giữa → "Nguyen Van An" (13 ký tự)',
        },
        {
          stdinLines: ['TRAN thi B'],
          expected: 'Ten chuan: Tran Thi B\nSo ky tu: 10',
          match: 'contains',
          hidden: false,
          label: 'Chữ hoa toàn bộ phải hạ xuống → "Tran Thi B" (10 ký tự)',
        },
        {
          stdinLines: ['   le  '],
          expected: 'Ten chuan: Le\nSo ky tu: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ một từ, thừa khoảng trắng hai đầu → "Le" (2 ký tự)',
        },
      ],
      hints: [
        'Dùng .split() KHÔNG tham số: nó tự bỏ khoảng trắng thừa ở mọi vị trí, đỡ phải strip() rồi replace("  ", " ") nhiều lần.',
        '.capitalize() vừa viết hoa chữ đầu vừa HẠ THƯỜNG phần còn lại — đúng thứ cần cho "VAN" thành "Van". Chỉ .upper() chữ đầu thôi là chưa đủ.',
        'Nối lại: " ".join(p.capitalize() for p in cac_phan). Đếm ký tự bằng len(...) trên chuỗi ĐÃ chuẩn hoá, không phải chuỗi gốc.',
      ],
      sampleSolution: `tho = input("Ho ten: ")
cac_phan = tho.split()
sach = " ".join(p.capitalize() for p in cac_phan)
print(f"Ten chuan: {sach}")
print(f"So ky tu: {len(sach)}")`,
    },
    homework:
      'Mở rộng thành bộ làm sạch số điện thoại: người dùng có thể nhập "0912 345 678", "0912-345-678" hay " 0912345678 ". Hãy bỏ hết khoảng trắng và dấu gạch ngang (gợi ý: .replace), rồi kiểm tra kết quả có đúng 10 chữ số và bắt đầu bằng số 0 không (gợi ý: .isdigit() và cắt chuỗi bằng chỉ số). In "Hop le" hoặc "Khong hop le". Đây chính là bước tiền xử lý mà mọi dự án dữ liệu đều phải làm trước khi huấn luyện bất cứ mô hình nào.',
    srsCards: [
      {
        hoi: 'Vì sao ten.strip() không làm sạch được biến ten?',
        dap: 'Vì chuỗi trong Python BẤT BIẾN (immutable): mọi phương thức chuỗi trả về chuỗi MỚI chứ không sửa tại chỗ. Phải gán lại kết quả: ten = ten.strip(). Quên gán là lỗi thầm lặng — code chạy êm mà dữ liệu vẫn bẩn.',
      },
      {
        hoi: '.split() gọi không tham số khác gì .split(",")?',
        dap: 'Không tham số: cắt theo khoảng trắng và tự BỎ mọi khoảng trắng thừa, nên "  a   b ".split() cho ["a", "b"]. Có tham số: cắt đúng theo ký tự đó và giữ nguyên phần rỗng, "a,,b".split(",") cho ["a", "", "b"].',
      },
      {
        hoi: 'Công thức chuẩn hoá họ tên gọn nhất trong Python là gì?',
        dap: '" ".join(p.capitalize() for p in ten.split()) — xử lý cùng lúc ba vấn đề: khoảng trắng hai đầu, khoảng trắng thừa ở giữa, và chữ hoa/thường lộn xộn (capitalize hạ thường phần đuôi mỗi từ).',
      },
    ],
  },
]
