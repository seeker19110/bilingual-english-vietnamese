# Đặc tả KÍN: 17 bài học khoá ngắn `pyai` — "Python / AI Cơ Bản"

> Ngày 2026-09-01. Đặc tả khung của cả cụm: `docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md`
> (mục **03a. KHOÁ 01 — `pyai`**). Khuôn bài: `packages/subject-programming/lessonTypes.ts`
> (`LessonSchema`). Mẫu chất lượng bám theo: `packages/subject-programming/lessons/mlu1.ts`.

Khoá `pyai` là **cửa vào** của chuỗi 6 khoá "Kỹ sư AI thực chiến" (`prerequisites: []`), gồm
**17 bài** chia **4 chương**: `pyai-u1` Python nhập môn (5 bài) · `pyai-u2` Cấu trúc dữ liệu &
file & OOP (5 bài) · `pyai-u3` AI là gì (4 bài) · `pyai-u4` Case study chạy thật (3 bài).

**Luật thi hành (không được đổi khi transcribe):**

- Mọi bài `language: 'python'`; id `pyai-u<c>-l<b>`, `unitId: 'pyai-u<c>'`.
- Mọi chuỗi in ra bằng `print()` là **tiếng Việt KHÔNG DẤU** (Pyodide và python3 CI chấm bằng
  so khớp chuỗi y hệt nhau).
- Không dùng thư viện ngoài trong code được chấm (Python thuần).
- Mỗi object dưới đây copy-paste **nguyên văn** vào `packages/subject-programming/lessons/
pyaiu1.ts` … `pyaiu4.ts` (xuất mảng `PYAI_U1_LESSONS` … `PYAI_U4_LESSONS`, kiểu
  `ProgrammingLesson[]`, `import type { ProgrammingLesson } from '../lessonTypes.js'`).
- Trước khi hợp nhất: nới regex `lessonId` thêm tiền tố `pyai` ở `lessonTypes.ts` (id + unitId),
  `apps/server/src/api/subjects/programming/progress.ts`, `.../feedback.ts`.

---

## Chương 1 — `pyai-u1` · Python nhập môn (5 bài)

```typescript
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
        hoi: 'Dấu = trong Python nghĩa là gì?',
        dap: 'Là phép GÁN — cất giá trị bên phải vào cái hộp (biến) có tên bên trái, không phải "bằng nhau" của toán học. So sánh bằng nhau dùng hai dấu ==.',
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
      choices: ['5 rồi None', '5 rồi 5', 'None rồi 5', 'Báo lỗi'],
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
```

---

## Chương 2 — `pyai-u2` · Cấu trúc dữ liệu, file & OOP (5 bài)

```typescript
export const PYAI_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u2-l1',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'List — chứa nhiều dữ liệu và tự cài tổng, trung bình, lớn nhất',
    hook: 'Một biến chứa được một số. Nhưng lớp có 40 điểm, cửa hàng có 300 đơn, mô hình học từ 10.000 mẫu. Bạn không đặt 40 cái tên biến — bạn dùng LIST, một cái hộp dài chứa được cả dãy, và duyệt qua nó bằng vòng lặp.',
    theory:
      'LIST là dãy các giá trị có THỨ TỰ, viết trong ngoặc vuông: diem = [8, 6, 9].\n\n- Truy cập bằng CHỈ SỐ, đếm từ 0: diem[0] là 8, diem[2] là 9. Chỉ số âm đếm từ cuối: diem[-1] là phần tử cuối.\n- len(diem) cho số phần tử (3). Chỉ số hợp lệ là 0 tới len - 1; diem[3] báo IndexError.\n- diem.append(7) thêm vào cuối; list SỬA ĐƯỢC tại chỗ (khác chuỗi).\n- Duyệt: for d in diem: — d lần lượt nhận từng giá trị.\n\nPython có sẵn sum(), max(), min(), nhưng hôm nay ta TỰ CÀI để hiểu ruột, vì mọi thuật toán học máy sau này đều là biến thể của đúng ba mẫu vòng lặp dưới đây:\n\n1. CỘNG DỒN (tổng): đặt tong = 0 trước vòng lặp, mỗi vòng tong = tong + x.\n2. TÌM CỰC TRỊ (lớn nhất): đặt lon_nhat = phần tử ĐẦU TIÊN, mỗi vòng nếu x > lon_nhat thì thay. Khởi tạo bằng 0 là SAI khi dãy toàn số âm — đó là lỗi ca biên kinh điển.\n3. TRUNG BÌNH: tổng chia số phần tử. Phép / luôn cho float, nên 60 / 3 in ra 20.0 chứ không phải 20.\n\nGiá trị khởi tạo là chỗ dễ sai nhất: hãy luôn tự hỏi "nếu dãy chỉ có một phần tử thì sao? nếu toàn số âm thì sao?".',
    workedExample: {
      code: `diem = [8, 6, 9, 5]

tong = 0                          # bien cong don, bat dau tu 0
for d in diem:
    tong = tong + d               # moi vong cong them mot phan tu

lon_nhat = diem[0]                # KHOI TAO bang phan tu dau, khong phai 0
for d in diem:
    if d > lon_nhat:
        lon_nhat = d              # gap so lon hon thi thay the

print(f"Tong: {tong}")
print(f"Trung binh: {tong / len(diem)}")   # phep / luon ra so thuc
print(f"Lon nhat: {lon_nhat}")
print(f"Phan tu dau: {diem[0]}, phan tu cuoi: {diem[-1]}")`,
      stdinLines: [],
    },
    predict: {
      code: `so = [-5, -2, -9]\nlon_nhat = 0\nfor s in so:\n    if s > lon_nhat:\n        lon_nhat = s\nprint(lon_nhat)`,
      question: 'Đoạn code tìm số lớn nhất này in ra gì?',
      choices: ['0', '-2', '-9', '-5'],
      answerIndex: 0,
      explain:
        'Khởi tạo lon_nhat = 0 là sai: không số âm nào lớn hơn 0 nên nhánh if không bao giờ chạy, kết quả in 0 — một số KHÔNG CÓ trong dãy. Phải khởi tạo bằng phần tử đầu tiên (so[0]) thì mới ra -2.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc dữ liệu → khởi tạo biến cộng dồn → duyệt cộng → in trung bình.',
      lines: [
        'dong = input("Cac so: ")',
        'so = [int(x) for x in dong.split(",")]',
        'tong = 0',
        'for s in so:',
        '    tong = tong + s',
        'print(f"Tong: {tong}")',
        'print(f"Trung binh: {tong / len(so)}")',
      ],
    },
    make: {
      prompt:
        'Viết bộ thống kê tự cài (KHÔNG dùng sum, max, min có sẵn — hãy tự viết vòng lặp).\n\nĐọc 1 dòng input() là các số nguyên cách nhau bởi dấu phẩy (vd "10,20,30").\n\nIn đúng 4 dòng:\nTong: <tong>\nTrung binh: <tong chia so phan tu>\nLon nhat: <so lon nhat>\nNho nhat: <so nho nhat>\n\nVí dụ "10,20,30" → Tong: 60, Trung binh: 20.0, Lon nhat: 30, Nho nhat: 10.\nChú ý: trung bình dùng phép / nên luôn có phần thập phân (20.0).',
      starterCode: `dong = input("Cac so: ")
so = [int(x) for x in dong.split(",")]
tong = 0
lon_nhat = so[0]
nho_nhat = so[0]
# Duyet mot vong for, cap nhat ca ba bien tren
`,
      testCases: [
        {
          stdinLines: ['10,20,30'],
          expected: 'Tong: 60\nTrung binh: 20.0\nLon nhat: 30\nNho nhat: 10',
          match: 'contains',
          hidden: false,
          label: 'Ba số dương → tổng 60, trung bình 20.0',
        },
        {
          stdinLines: ['3,-1,7,7'],
          expected: 'Tong: 16\nTrung binh: 4.0\nLon nhat: 7\nNho nhat: -1',
          match: 'contains',
          hidden: false,
          label: 'Có số âm và số lặp lại → nhỏ nhất là -1',
        },
        {
          stdinLines: ['-5,-2,-9'],
          expected: 'Lon nhat: -2',
          match: 'contains',
          hidden: false,
          label: 'Toàn số âm → lớn nhất là -2, không phải 0',
        },
        {
          stdinLines: ['5'],
          expected: 'Tong: 5\nTrung binh: 5.0\nLon nhat: 5\nNho nhat: 5',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy chỉ có MỘT phần tử — cả bốn dòng đều về nó',
        },
      ],
      hints: [
        'Khởi tạo lon_nhat và nho_nhat bằng so[0] chứ KHÔNG phải 0 — nếu không, dãy toàn số âm sẽ cho kết quả sai.',
        'Một vòng for duy nhất là đủ cho cả ba việc: cộng dồn tong, so sánh cập nhật lon_nhat, so sánh cập nhật nho_nhat.',
        'Trung bình: tong / len(so) — dùng dấu / (ra số thực) chứ không phải // (chia lấy nguyên), để in ra đúng 20.0.',
      ],
      sampleSolution: `dong = input("Cac so: ")
so = [int(x) for x in dong.split(",")]
tong = 0
lon_nhat = so[0]
nho_nhat = so[0]
for s in so:
    tong = tong + s
    if s > lon_nhat:
        lon_nhat = s
    if s < nho_nhat:
        nho_nhat = s
print(f"Tong: {tong}")
print(f"Trung binh: {tong / len(so)}")
print(f"Lon nhat: {lon_nhat}")
print(f"Nho nhat: {nho_nhat}")`,
    },
    homework:
      'Thêm hai chỉ số nữa mà học máy dùng suốt: KHOẢNG BIẾN THIÊN (lớn nhất trừ nhỏ nhất) và ĐỘ LỆCH so với trung bình của từng phần tử (in mỗi số kèm chênh lệch của nó). Rồi thử với dãy [10, 10, 10, 100]: trung bình là 32.5 nhưng không có số nào gần 32.5 cả — hãy tự rút ra vì sao chỉ nhìn trung bình là dễ bị lừa, một bài học sẽ quay lại ở khoá Toán Thiết Yếu cho AI.',
    srsCards: [
      {
        hoi: 'Khi tự cài "tìm số lớn nhất", khởi tạo biến bằng gì mới đúng?',
        dap: 'Bằng PHẦN TỬ ĐẦU TIÊN của dãy (so[0]), không phải 0. Khởi tạo bằng 0 khiến dãy toàn số âm trả về 0 — một giá trị không có trong dãy. Đây là lỗi ca biên kinh điển mà máy không hề báo.',
      },
      {
        hoi: 'Chỉ số của list bắt đầu từ đâu, và chỉ số âm nghĩa là gì?',
        dap: 'Bắt đầu từ 0, nên phần tử cuối có chỉ số len - 1. Chỉ số âm đếm ngược từ cuối: danh_sach[-1] là phần tử cuối, [-2] là kế cuối. Vượt phạm vi sẽ báo IndexError.',
      },
      {
        hoi: 'Ba mẫu vòng lặp cơ bản trên list là gì?',
        dap: 'Cộng dồn (khởi tạo tong = 0, mỗi vòng cộng thêm), tìm cực trị (khởi tạo bằng phần tử đầu, so sánh rồi thay), và đếm/lọc theo điều kiện. Mọi thuật toán học máy tự cài về sau đều là biến thể của ba mẫu này.',
      },
    ],
  },
  {
    id: 'pyai-u2-l2',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Dict — đếm tần suất từ, nền móng của NLP',
    hook: 'Muốn biết một bài viết nói về cái gì, cách thô sơ nhất mà hiệu quả đến bất ngờ là ĐẾM TỪ: từ nào xuất hiện nhiều thì bài nói về cái đó. Bộ lọc thư rác đầu tiên trên đời, và cả bag-of-words trong xử lý ngôn ngữ, đều đứng trên đúng phép đếm này.',
    theory:
      'DICT (từ điển) lưu các cặp KHOÁ → GIÁ TRỊ, viết trong ngoặc nhọn: dem = {"toi": 2, "hoc": 1}.\n\n- Truy cập bằng KHOÁ chứ không bằng chỉ số: dem["toi"] cho 2. Khoá không tồn tại thì báo KeyError.\n- Gán dem["moi"] = 5 vừa là thêm mới vừa là cập nhật.\n- "toi" in dem cho True/False — kiểm tra khoá có tồn tại không.\n- dem.get("xyz", 0) lấy giá trị, nếu không có thì trả về 0 thay vì báo lỗi. Đây là mẹo gọn nhất để đếm.\n- dem.items() cho từng cặp (khoá, giá trị) để duyệt bằng for k, v in dem.items().\n\nMẪU ĐẾM TẦN SUẤT (nhớ thuộc lòng, dùng cả đời):\nfor tu in cau.split():\n    dem[tu] = dem.get(tu, 0) + 1\nDòng này đọc là: "lấy số đếm cũ của từ này, không có thì coi là 0, cộng thêm 1, cất lại".\n\nSẮP XẾP KẾT QUẢ: sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])) sắp theo số đếm GIẢM dần (dấu trừ đảo chiều), và khi bằng nhau thì theo thứ tự chữ cái TĂNG dần. Việc quy định rõ cách phá hoà (tie-break) rất quan trọng: nếu không, thứ tự in ra có thể khác nhau giữa các lần chạy và test sẽ chập chờn.\n\nLIST hay DICT? List khi bạn cần THỨ TỰ và truy cập theo vị trí; dict khi cần TRA CỨU theo tên/khoá — tra trong dict nhanh gần như tức thì dù có một triệu khoá, còn tìm trong list phải duyệt lần lượt.',
    workedExample: {
      code: `cau = "toi thich hoc toi thich python"

dem = {}                                  # dict rong
for tu in cau.split():                    # tach cau thanh tung tu
    dem[tu] = dem.get(tu, 0) + 1          # mau dem tan suat

print(f"So tu khac nhau: {len(dem)}")

# Sap theo so dem GIAM dan, hoa nhau thi theo chu cai TANG dan
thu_tu = sorted(dem.items(), key=lambda kv: (-kv[1], kv[0]))
for tu, n in thu_tu:
    print(f"{tu}: {n}")`,
      stdinLines: [],
    },
    predict: {
      code: `dem = {"a": 1}\nprint(dem.get("b", 0))`,
      question: 'Dòng này in ra gì?',
      choices: ['0', 'None', 'Báo lỗi KeyError', 'b'],
      answerIndex: 0,
      explain:
        'Khoá "b" không có trong dict. Nếu viết dem["b"] thì báo KeyError, nhưng .get("b", 0) trả về giá trị mặc định 0 — đúng thứ ta cần khi đếm từ mới gặp lần đầu.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự mẫu đếm tần suất từ và in ra theo thứ tự đã sắp.',
      lines: [
        'cau = input("Cau: ")',
        'dem = {}',
        'for tu in cau.split():',
        '    dem[tu] = dem.get(tu, 0) + 1',
        'thu_tu = sorted(dem.items(), key=lambda kv: (-kv[1], kv[0]))',
        'for tu, n in thu_tu:',
        '    print(f"{tu}: {n}")',
      ],
    },
    make: {
      prompt:
        'Viết máy đếm tần suất từ. Đọc 1 dòng input() là một câu tiếng Việt KHÔNG DẤU, các từ cách nhau bởi khoảng trắng.\n\nIn dòng đầu:\nSo tu khac nhau: <n>\nRồi in mỗi từ một dòng theo dạng <tu>: <so lan>, sắp xếp theo số lần GIẢM dần; nếu hai từ bằng số lần thì từ nào đứng trước theo thứ tự chữ cái in trước.\n\nVí dụ "toi thich hoc toi thich python" → 4 từ khác nhau, rồi thich: 2, toi: 2, hoc: 1, python: 1.',
      starterCode: `cau = input("Cau: ")
dem = {}
# Dem tan suat bang mau dem[tu] = dem.get(tu, 0) + 1
# In so tu khac nhau, roi sap xep va in tung dong
`,
      testCases: [
        {
          stdinLines: ['toi thich hoc toi thich python'],
          expected: 'So tu khac nhau: 4\nthich: 2\ntoi: 2\nhoc: 1\npython: 1',
          match: 'contains',
          hidden: false,
          label: 'Hai cặp hoà nhau → phá hoà bằng thứ tự chữ cái',
        },
        {
          stdinLines: ['a a a'],
          expected: 'So tu khac nhau: 1\na: 3',
          match: 'contains',
          hidden: false,
          label: 'Một từ lặp 3 lần',
        },
        {
          stdinLines: ['b a'],
          expected: 'a: 1\nb: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hai từ cùng tần suất 1 → phải in theo chữ cái, a trước b',
        },
      ],
      hints: [
        'Đếm gọn nhất: dem[tu] = dem.get(tu, 0) + 1 — không cần if kiểm tra khoá đã tồn tại chưa.',
        'Số từ KHÁC NHAU là len(dem) (số khoá), không phải len(cau.split()) (tổng số từ).',
        'Sắp xếp hai tiêu chí trong một lần: sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])). Dấu trừ đảo chiều số đếm; phần tử thứ hai của tuple lo việc phá hoà theo chữ cái.',
      ],
      sampleSolution: `cau = input("Cau: ")
dem = {}
for tu in cau.split():
    dem[tu] = dem.get(tu, 0) + 1
print(f"So tu khac nhau: {len(dem)}")
for tu, n in sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])):
    print(f"{tu}: {n}")`,
    },
    homework:
      'Thêm danh sách STOPWORDS (từ vô nghĩa về nội dung: "va", "la", "cua", "toi", "nay") và bỏ chúng ra trước khi đếm. Chạy lại trên một đoạn văn dài bạn tự chọn rồi xem 5 từ đầu bảng: chúng có nói đúng chủ đề đoạn văn không? Bạn vừa tự tay làm phiên bản thô sơ của bag-of-words — thứ mà bài lọc thư rác ở chương 3 và cả TF-IDF ở khoá Machine Learning sẽ dựng tiếp lên.',
    srsCards: [
      {
        hoi: 'Mẫu đếm tần suất bằng dict viết thế nào và đọc ra sao?',
        dap: 'dem[tu] = dem.get(tu, 0) + 1 — đọc là "lấy số đếm cũ của từ này, chưa có thì coi là 0, cộng thêm 1, cất lại". Gọn hơn hẳn việc dùng if để kiểm tra khoá đã tồn tại.',
      },
      {
        hoi: 'dem["x"] và dem.get("x", 0) khác nhau chỗ nào?',
        dap: 'Nếu khoá "x" không tồn tại, dem["x"] báo lỗi KeyError và dừng chương trình, còn .get("x", 0) trả về giá trị mặc định 0 và chạy tiếp. Dùng .get khi khoá có thể chưa có.',
      },
      {
        hoi: 'Khi nào dùng list, khi nào dùng dict?',
        dap: 'List khi cần THỨ TỰ và truy cập theo vị trí (điểm của 40 học sinh theo danh sách). Dict khi cần TRA CỨU theo tên/khoá — tra dict nhanh gần như tức thì dù có triệu khoá, còn tìm trong list phải duyệt lần lượt.',
      },
    ],
  },
  {
    id: 'pyai-u2-l3',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Đọc & ghi file CSV bằng Python thuần',
    hook: 'Chương trình tắt là biến mất sạch: mọi thứ trong RAM không sống qua một lần đóng cửa sổ. Muốn dữ liệu ở lại, phải ghi xuống FILE. Và định dạng dữ liệu phổ biến nhất hành tinh không phải Excel — mà là CSV, một file text mỗi dòng một bản ghi, các cột cách nhau bởi dấu phẩy.',
    theory:
      'MỞ FILE dùng khối with, để Python tự đóng file kể cả khi có lỗi:\n\nwith open("diem.csv", "w") as f:      # "w" = write, XOÁ SẠCH nội dung cũ\n    f.write("An,8\\n")                 # phải tự thêm \\n xuống dòng\n\nwith open("diem.csv") as f:           # mặc định là "r" = read\n    for dong in f:                    # duyệt từng dòng\n        print(dong.strip())           # strip() bỏ ký tự xuống dòng ở cuối\n\nCác chế độ: "r" đọc (mặc định), "w" ghi đè từ đầu, "a" ghi thêm vào cuối. Nhầm "w" thành "a" (hay ngược lại) là mất dữ liệu hoặc nhân đôi dữ liệu — hãy nghĩ kỹ trước khi gõ.\n\nCSV (Comma-Separated Values) là file text thuần: mỗi dòng một bản ghi, các cột cách nhau bởi dấu phẩy.\nAn,8\nBinh,6\nTách một dòng thành cột: ten, diem = dong.strip().split(","). Phép gán này gọi là GIẢI NÉN (unpacking) — số biến bên trái phải đúng bằng số phần bên phải, sai là báo ValueError.\n\nHAI LỖI PHẢI NHỚ:\n1. Quên .strip(): giá trị cột cuối sẽ dính ký tự xuống dòng, và int("8\\n") tuy vẫn chạy nhưng so sánh chuỗi thì sai.\n2. Dòng RỖNG ở cuối file: file kết thúc bằng \\n nên vòng lặp có thể gặp một dòng rỗng — luôn bỏ qua bằng if not dong.strip(): continue.\n\nThư viện csv và pandas làm việc này gọn hơn nhiều, nhưng hôm nay ta làm tay để thấy CSV chẳng có gì huyền bí: chỉ là chuỗi và split.',
    workedExample: {
      code: `# GHI file: moi dong mot ban ghi "ten,diem"
with open("diem.csv", "w") as f:
    f.write("An,8\\n")                  # tu them ky tu xuong dong
    f.write("Binh,6\\n")

# DOC lai chinh file vua ghi
tong = 0
dem = 0
with open("diem.csv") as f:
    for dong in f:
        dong = dong.strip()            # bo ky tu xuong dong o cuoi
        if not dong:                   # bo qua dong rong
            continue
        ten, diem = dong.split(",")    # giai nen thanh 2 bien
        print(f"{ten}: {diem}")
        tong = tong + int(diem)        # diem dang la CHUOI, phai doi sang so
        dem = dem + 1
print(f"Trung binh: {tong / dem}")`,
      stdinLines: [],
    },
    predict: {
      code: `dong = "An,8\\n"\nten, diem = dong.strip().split(",")\nprint(int(diem) + 1)`,
      question: 'Đoạn code này in ra gì?',
      choices: ['9', '81', 'Báo lỗi vì diem là chuỗi', '8'],
      answerIndex: 0,
      explain:
        'strip() bỏ ký tự xuống dòng, split(",") cho ["An", "8"], giải nén vào hai biến nên diem = "8" (chuỗi). int("8") + 1 = 9. Nếu quên int thì "8" + 1 mới báo TypeError.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: ghi file xuống đĩa trước, rồi mở đọc lại và tách cột.',
      lines: [
        'with open("diem.csv", "w") as f:',
        '    f.write("An,8\\n")',
        'with open("diem.csv") as f:',
        '    for dong in f:',
        '        dong = dong.strip()',
        '        ten, diem = dong.split(",")',
        '        print(f"{ten}: {diem}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình lưu bảng điểm ra file rồi đọc lại.\n\nĐọc từ input():\n- Dòng 1: số học viên n.\n- n dòng tiếp theo, mỗi dòng dạng "ten,diem" (vd "An,8").\n\nGhi đúng n dòng đó vào file diem.csv, sau đó MỞ LẠI chính file này để đọc và in:\n<ten>: <diem>   (mỗi học viên một dòng, đúng thứ tự trong file)\nTrung binh: <trung binh diem>\n\nVí dụ nhập 2 · "An,8" · "Binh,6" → in "An: 8", "Binh: 6", "Trung binh: 7.0".',
      starterCode: `n = int(input("So hoc vien: "))
cac_dong = []
for _ in range(n):
    cac_dong.append(input())
# Ghi cac_dong xuong file diem.csv (nho them "\\n" moi dong)
# Roi mo lai file do de doc, in tung dong va tinh trung binh
`,
      testCases: [
        {
          stdinLines: ['2', 'An,8', 'Binh,6'],
          expected: 'An: 8\nBinh: 6\nTrung binh: 7.0',
          match: 'contains',
          hidden: false,
          label: '2 học viên → trung bình 7.0',
        },
        {
          stdinLines: ['3', 'A,5', 'B,6', 'C,10'],
          expected: 'A: 5\nB: 6\nC: 10\nTrung binh: 7.0',
          match: 'contains',
          hidden: false,
          label: '3 học viên, tổng 21 → trung bình 7.0',
        },
        {
          stdinLines: ['1', 'Chi,10'],
          expected: 'Chi: 10\nTrung binh: 10.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng 1 học viên — không được chia cho 0 hay bỏ sót',
        },
      ],
      hints: [
        'Đọc n dòng bằng vòng lặp for _ in range(n): rồi append vào một list trước khi ghi file.',
        'f.write KHÔNG tự xuống dòng: phải viết f.write(dong + "\\n"), nếu không mọi bản ghi dính thành một dòng dài.',
        'Khi đọc lại, luôn dong = dong.strip() rồi bỏ qua dòng rỗng (if not dong: continue) trước khi split(","), vì file kết thúc bằng ký tự xuống dòng.',
      ],
      sampleSolution: `n = int(input("So hoc vien: "))
cac_dong = []
for _ in range(n):
    cac_dong.append(input())

with open("diem.csv", "w") as f:
    for dong in cac_dong:
        f.write(dong + "\\n")

tong = 0
dem = 0
with open("diem.csv") as f:
    for dong in f:
        dong = dong.strip()
        if not dong:
            continue
        ten, diem = dong.split(",")
        print(f"{ten}: {diem}")
        tong = tong + int(diem)
        dem = dem + 1
print(f"Trung binh: {tong / dem}")`,
    },
    homework:
      'Đổi chế độ mở file từ "w" sang "a" rồi chạy chương trình hai lần với cùng dữ liệu — quan sát file phình lên gấp đôi, đó chính là lỗi "ghi trùng" hay gặp khi làm việc thật. Sau đó thêm một cột nữa (lop) thành "ten,lop,diem" và tính trung bình RIÊNG cho từng lớp bằng dict {lop: [danh sách điểm]} — bạn vừa tự cài phép group-by, thao tác trung tâm của mọi công việc phân tích dữ liệu.',
    srsCards: [
      {
        hoi: 'Ba chế độ mở file "r", "w", "a" khác nhau thế nào?',
        dap: '"r" chỉ đọc (mặc định); "w" ghi mới và XOÁ SẠCH nội dung cũ ngay khi mở; "a" ghi THÊM vào cuối, giữ nguyên nội dung cũ. Nhầm giữa "w" và "a" gây mất dữ liệu hoặc nhân đôi dữ liệu.',
      },
      {
        hoi: 'Vì sao phải gọi .strip() cho mỗi dòng khi đọc file?',
        dap: 'Vì mỗi dòng đọc lên còn dính ký tự xuống dòng \\n ở cuối, làm giá trị cột cuối bị sai khi so sánh chuỗi. strip() cũng cho phép phát hiện dòng RỖNG ở cuối file để bỏ qua trước khi split.',
      },
      {
        hoi: 'CSV là gì và tách một dòng CSV thành cột bằng cách nào?',
        dap: 'CSV (Comma-Separated Values) là file text thuần, mỗi dòng một bản ghi, các cột cách nhau dấu phẩy. Tách bằng ten, diem = dong.strip().split(",") — phép giải nén này đòi số biến bên trái đúng bằng số cột, sai sẽ báo ValueError.',
      },
    ],
  },
  {
    id: 'pyai-u2-l4',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Lớp & đối tượng — gói dữ liệu cùng hành vi',
    hook: 'Một học viên gồm tên, danh sách điểm, cách tính trung bình, cách xếp loại. Nếu để rời rạc thì bạn có ten1, diem1, ten2, diem2... và một mớ hàm nhận cả đống tham số. LỚP gói dữ liệu và hành vi liên quan vào một chỗ, để mỗi học viên là MỘT vật thể tự biết cách tính điểm của chính mình.',
    theory:
      'LỚP (class) là KHUÔN; ĐỐI TƯỢNG (object) là vật đúc ra từ khuôn đó.\n\nclass HocVien:\n    def __init__(self, ten):     # hàm khởi tạo, chạy khi tạo đối tượng mới\n        self.ten = ten           # thuộc tính, gắn vào chính đối tượng này\n        self.diem = []\n\n    def them_diem(self, d):      # phương thức = hàm thuộc về lớp\n        self.diem.append(d)\n\na = HocVien("An")                # tạo đối tượng, __init__ chạy tự động\na.them_diem(8)                   # gọi phương thức bằng dấu chấm\nprint(a.ten)\n\nBA điều bắt buộc nhớ:\n1. self là chính đối tượng đang được thao tác. Mọi phương thức phải có self làm tham số ĐẦU TIÊN, nhưng khi gọi thì KHÔNG truyền nó — Python tự điền. Quên self trong định nghĩa là lỗi phổ biến nhất của người mới học OOP.\n2. self.ten (có self) là thuộc tính sống cùng đối tượng; ten (không self) chỉ là biến cục bộ, chết khi hàm xong.\n3. __init__ chạy TỰ ĐỘNG một lần khi tạo đối tượng — đây là chỗ đặt giá trị ban đầu. Hai đối tượng tạo từ cùng một lớp có dữ liệu HOÀN TOÀN RIÊNG: sửa điểm của a không đụng gì tới b.\n\nKHI NÀO DÙNG LỚP: khi một nhóm dữ liệu luôn đi cùng nhau VÀ có những việc chỉ làm trên nhóm đó. Đừng lạm dụng — một hàm đơn giản thì cứ để là hàm. Về sau bạn sẽ gặp lại đúng ý tưởng này trong thư viện ML: model = LinearRegression() rồi model.fit(X, y) chính là tạo đối tượng và gọi phương thức của nó.',
    workedExample: {
      code: `class HocVien:
    def __init__(self, ten):        # chay tu dong khi tao doi tuong
        self.ten = ten              # thuoc tinh rieng cua doi tuong nay
        self.diem = []              # moi doi tuong co list rieng

    def them_diem(self, d):
        self.diem.append(d)

    def trung_binh(self):
        tong = 0
        for d in self.diem:
            tong = tong + d
        return tong / len(self.diem)

a = HocVien("An")                   # doi tuong thu nhat
a.them_diem(8)
a.them_diem(9)

b = HocVien("Binh")                 # doi tuong thu hai, du lieu RIENG
b.them_diem(5)

print(f"{a.ten}: {a.trung_binh()}") # 17 / 2 = 8.5
print(f"{b.ten}: {b.trung_binh()}") # 5 / 1 = 5.0`,
      stdinLines: [],
    },
    predict: {
      code: `class X:\n    def __init__(self):\n        self.so = []\n\na = X()\nb = X()\na.so.append(1)\nprint(len(b.so))`,
      question: 'Dòng cuối in ra gì?',
      choices: ['0', '1', 'None', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Mỗi lần gọi X() là __init__ chạy lại và tạo một list MỚI gán vào self.so của riêng đối tượng đó. Thêm vào a.so hoàn toàn không đụng tới b.so, nên b.so vẫn rỗng, len là 0.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: định nghĩa lớp với __init__ và phương thức, rồi tạo đối tượng và gọi.',
      lines: [
        'class HocVien:',
        '    def __init__(self, ten):',
        '        self.ten = ten',
        '        self.diem = []',
        '    def them_diem(self, d):',
        '        self.diem.append(d)',
        'a = HocVien("An")',
        'a.them_diem(8)',
        'print(a.ten, a.diem)',
      ],
    },
    make: {
      prompt:
        'Viết lớp HocVien có: __init__(self, ten) đặt self.ten và self.diem = []; phương thức them_diem(self, d); phương thức trung_binh(self) trả về trung bình các điểm; phương thức xep_loai(self) trả về chuỗi theo trung bình (>= 8: Gioi · >= 6.5: Kha · >= 5: Trung binh · còn lại: Yeu).\n\nĐọc từ input():\n- Dòng 1: tên học viên.\n- Dòng 2: các điểm cách nhau bởi dấu phẩy (vd "8,9,7").\n\nTạo đối tượng, thêm từng điểm, rồi in đúng 3 dòng:\nHoc vien: <ten>\nTrung binh: <trung binh>\nXep loai: <xep loai>\n\nVí dụ "An" và "8,9,7" → trung bình 8.0 → Gioi.',
      starterCode: `class HocVien:
    def __init__(self, ten):
        self.ten = ten
        self.diem = []
    # Them cac phuong thuc them_diem, trung_binh, xep_loai (nho tham so self)

ten = input("Ten: ")
dong = input("Cac diem: ")
`,
      testCases: [
        {
          stdinLines: ['An', '8,9,7'],
          expected: 'Hoc vien: An\nTrung binh: 8.0\nXep loai: Gioi',
          match: 'contains',
          hidden: false,
          label: 'Tổng 24 / 3 điểm = 8.0 → Gioi',
        },
        {
          stdinLines: ['Binh', '5,6,7'],
          expected: 'Trung binh: 6.0\nXep loai: Trung binh',
          match: 'contains',
          hidden: false,
          label: 'Trung bình 6.0 → xếp loại Trung binh',
        },
        {
          stdinLines: ['Chi', '5'],
          expected: 'Hoc vien: Chi\nTrung binh: 5.0\nXep loai: Trung binh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: một điểm duy nhất, đúng ranh giới 5.0',
        },
      ],
      hints: [
        'Mọi phương thức phải có self là tham số đầu tiên khi ĐỊNH NGHĨA, nhưng khi GỌI thì không truyền: a.them_diem(8).',
        'Trong phương thức, truy cập dữ liệu của đối tượng phải có self: self.diem chứ không phải diem.',
        'Thêm điểm: for d in dong.split(","): hv.them_diem(int(d)). Nhớ đổi sang int, không thì trung bình sẽ lỗi cộng chuỗi.',
      ],
      sampleSolution: `class HocVien:
    def __init__(self, ten):
        self.ten = ten
        self.diem = []

    def them_diem(self, d):
        self.diem.append(d)

    def trung_binh(self):
        tong = 0
        for d in self.diem:
            tong = tong + d
        return tong / len(self.diem)

    def xep_loai(self):
        tb = self.trung_binh()
        if tb >= 8:
            return "Gioi"
        if tb >= 6.5:
            return "Kha"
        if tb >= 5:
            return "Trung binh"
        return "Yeu"

ten = input("Ten: ")
dong = input("Cac diem: ")
hv = HocVien(ten)
for d in dong.split(","):
    hv.them_diem(int(d))
print(f"Hoc vien: {hv.ten}")
print(f"Trung binh: {hv.trung_binh()}")
print(f"Xep loai: {hv.xep_loai()}")`,
    },
    homework:
      'Viết thêm lớp Lop chứa một list các đối tượng HocVien, với phương thức them(hv), trung_binh_lop() và gioi_nhat() trả về học viên có trung bình cao nhất. Chú ý gioi_nhat() phải trả về ĐỐI TƯỢNG chứ không phải tên, để bên ngoài còn dùng tiếp được .ten và .xep_loai() của nó. Đây là lần đầu bạn cho các đối tượng chứa lẫn nhau — đúng cách mọi phần mềm lớn được dựng lên.',
    srsCards: [
      {
        hoi: 'self là gì và vì sao mọi phương thức đều phải có nó?',
        dap: 'self là chính đối tượng đang được thao tác. Nó phải là tham số ĐẦU TIÊN khi định nghĩa phương thức để hàm biết đang làm việc trên vật nào; khi gọi thì Python tự điền nên không truyền. Quên self là lỗi phổ biến nhất của người mới học OOP.',
      },
      {
        hoi: '__init__ chạy khi nào và dùng để làm gì?',
        dap: 'Chạy TỰ ĐỘNG đúng một lần ngay khi tạo đối tượng mới (HocVien("An")). Dùng để đặt các thuộc tính ban đầu qua self.x = ... Mỗi đối tượng tạo ra có bộ dữ liệu hoàn toàn riêng, sửa cái này không đụng cái kia.',
      },
      {
        hoi: 'Khi nào nên dùng lớp thay vì chỉ dùng hàm?',
        dap: 'Khi một nhóm dữ liệu luôn đi cùng nhau VÀ có những việc chỉ làm trên nhóm đó (tên + điểm + cách tính trung bình). Việc lẻ, không có trạng thái kèm theo thì cứ để là hàm — lạm dụng lớp làm code rối hơn chứ không gọn hơn.',
      },
    ],
  },
  {
    id: 'pyai-u2-l5',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Tổ chức chương trình & xử lý lỗi try/except',
    hook: 'Chương trình của bạn chạy ngon suốt buổi chiều, cho tới khi người dùng gõ chữ "muoi" vào ô số tuổi. Cả chương trình chết đứng, mọi thứ chưa lưu bay sạch. Phần mềm thật không được phép như vậy: nó phải LƯỜNG TRƯỚC rằng dữ liệu vào sẽ có ngày sai.',
    theory:
      'NGOẠI LỆ (exception) là cách Python báo "tôi không làm được việc này". Vài loại gặp nhiều:\n- ValueError — đúng kiểu nhưng sai giá trị: int("abc").\n- ZeroDivisionError — chia cho 0.\n- KeyError / IndexError — tra khoá hoặc chỉ số không tồn tại.\n- TypeError — sai kiểu: "10" + 1.\n\nBẮT LỖI:\ntry:\n    kq = a / b\nexcept ZeroDivisionError:\n    print("Loi: khong chia duoc cho 0")\nexcept ValueError:\n    print("Loi: du lieu khong phai so")\n\nHai luật quan trọng:\n1. Bắt CỤ THỂ loại lỗi mình lường trước. Viết except: trống (bắt tất) sẽ nuốt luôn cả lỗi lập trình của chính bạn, biến chương trình sai thành chương trình im lặng — khó gỡ hơn nhiều so với việc để nó chết to tiếng.\n2. Để trong try ĐÚNG những dòng có thể lỗi, càng ít càng tốt. Nhét cả chương trình vào try là mất khả năng biết lỗi đến từ đâu.\n\nTỔ CHỨC CHƯƠNG TRÌNH: chia thành các HÀM nhỏ, mỗi hàm một việc, tên nói rõ việc đó; phần đọc dữ liệu vào tách khỏi phần tính toán; hàm tính toán KHÔNG nên tự print — nó return kết quả, để chỗ gọi quyết định hiển thị thế nào. Nhờ vậy cùng một hàm dùng được cho cả bản chạy dòng lệnh lẫn bản web sau này. Khi file to lên, tách sang file riêng rồi import — mỗi file là một MODULE.',
    workedExample: {
      code: `def chia_an_toan(a, b):
    # Ham chi TRA VE chuoi ket qua, khong tu print
    try:
        return f"{a} / {b} = {a / b}"
    except ZeroDivisionError:
        return "Loi: khong chia duoc cho 0"

def doc_hai_so(dong):
    # Co the nem ValueError neu khong phai so -> de noi goi bat
    x, y = dong.split()
    return int(x), int(y)

for dong in ["10 2", "5 0", "x 1"]:
    try:
        a, b = doc_hai_so(dong)
    except ValueError:
        print("Loi: du lieu khong phai so")
        continue                     # bo qua dong nay, sang dong sau
    print(chia_an_toan(a, b))`,
      stdinLines: [],
    },
    predict: {
      code: `try:\n    print(int("abc"))\nexcept ValueError:\n    print("Loi du lieu")\nprint("Van chay tiep")`,
      question: 'Chương trình in ra những gì?',
      choices: [
        'Loi du lieu rồi Van chay tiep',
        'Chỉ "Loi du lieu"',
        'Chỉ "Van chay tiep"',
        'Chương trình dừng vì lỗi',
      ],
      answerIndex: 0,
      explain:
        'int("abc") ném ValueError, nhánh except bắt được nên in "Loi du lieu" thay vì chết. Bắt xong, chương trình chạy tiếp bình thường từ dòng sau khối try nên in "Van chay tiep".',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: định nghĩa hàm an toàn, rồi vòng lặp đọc và gọi có bắt lỗi.',
      lines: [
        'def chia_an_toan(a, b):',
        '    try:',
        '        return f"{a} / {b} = {a / b}"',
        '    except ZeroDivisionError:',
        '        return "Loi: khong chia duoc cho 0"',
        'a, b = input().split()',
        'print(chia_an_toan(int(a), int(b)))',
      ],
    },
    make: {
      prompt:
        'Viết máy tính chia có xử lý lỗi.\n\nĐọc từ input():\n- Dòng 1: số phép tính n.\n- n dòng tiếp theo, mỗi dòng là hai giá trị cách nhau bởi khoảng trắng (vd "10 2").\n\nVới mỗi dòng in đúng MỘT dòng kết quả:\n- Nếu cả hai là số và số chia khác 0: <a> / <b> = <thuong>   (vd "10 / 2 = 5.0")\n- Nếu số chia bằng 0: Loi: khong chia duoc cho 0\n- Nếu có giá trị không phải số: Loi: du lieu khong phai so\n\nChương trình KHÔNG được dừng giữa chừng vì lỗi — phải xử lý hết n dòng.',
      starterCode: `n = int(input("So phep tinh: "))
for _ in range(n):
    dong = input()
    # try: tach dong, doi sang int, chia
    # except ValueError / ZeroDivisionError: in dung thong bao tuong ung
`,
      testCases: [
        {
          stdinLines: ['3', '10 2', '5 0', 'x 1'],
          expected: '10 / 2 = 5.0\nLoi: khong chia duoc cho 0\nLoi: du lieu khong phai so',
          match: 'contains',
          hidden: false,
          label: 'Đủ ba tình huống: bình thường · chia 0 · không phải số',
        },
        {
          stdinLines: ['2', '9 3', '0 5'],
          expected: '9 / 3 = 3.0\n0 / 5 = 0.0',
          match: 'contains',
          hidden: false,
          label: 'Số bị chia bằng 0 là HỢP LỆ (0.0), khác với số chia bằng 0',
        },
        {
          stdinLines: ['1', '7 7'],
          expected: '7 / 7 = 1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: một phép duy nhất, kết quả 1.0 (số thực)',
        },
      ],
      hints: [
        'Đặt cả phần int(...) lẫn phép chia trong CÙNG một khối try, rồi viết hai nhánh except riêng: ValueError và ZeroDivisionError.',
        'Đừng dùng except: trống — nó nuốt luôn cả lỗi lập trình của bạn và làm bài khó gỡ. Bắt đúng loại lỗi mình lường trước.',
        'Phân biệt "0 5" (số bị chia là 0 → kết quả 0.0, hợp lệ) với "5 0" (số CHIA là 0 → ZeroDivisionError). Chỉ trường hợp sau mới báo lỗi.',
      ],
      sampleSolution: `n = int(input("So phep tinh: "))
for _ in range(n):
    dong = input()
    try:
        x, y = dong.split()
        a = int(x)
        b = int(y)
        print(f"{a} / {b} = {a / b}")
    except ValueError:
        print("Loi: du lieu khong phai so")
    except ZeroDivisionError:
        print("Loi: khong chia duoc cho 0")`,
    },
    homework:
      'Gộp lại toàn bộ chương 2 thành một chương trình quản lý điểm hoàn chỉnh: lớp HocVien (bài 4), đọc/ghi CSV (bài 3), thống kê tự cài (bài 1), thống kê tần suất xếp loại bằng dict (bài 2), và mọi chỗ đọc dữ liệu đều bọc try/except (bài này). Tách thành các hàm nhỏ có tên rõ ràng, và giữ luật: hàm tính toán chỉ return, chỉ phần main mới print. Đây là chương trình "thật" đầu tiên của bạn — hãy giữ lại, cuối khoá sẽ đọc lại nó.',
    srsCards: [
      {
        hoi: 'try / except dùng để làm gì và viết ra sao?',
        dap: 'Để chương trình không chết khi gặp lỗi lường trước được: đặt dòng có thể lỗi trong try, xử lý trong except <LoaiLoi>. Sau khi bắt xong, chương trình chạy tiếp bình thường từ sau khối try.',
      },
      {
        hoi: 'Vì sao không nên viết except: trống (bắt mọi lỗi)?',
        dap: 'Vì nó nuốt luôn cả lỗi lập trình của chính bạn (gõ nhầm tên biến, sai kiểu), biến chương trình sai thành chương trình im lặng — khó gỡ hơn nhiều so với để nó chết to tiếng. Hãy bắt đúng loại lỗi đã lường trước.',
      },
      {
        hoi: 'Vì sao hàm tính toán không nên tự print kết quả?',
        dap: 'Vì print trói hàm vào một cách hiển thị duy nhất. Hàm nên RETURN kết quả để nơi gọi quyết định in ra màn hình, ghi file hay trả về cho web. Nhờ vậy cùng một hàm dùng lại được ở nhiều nơi và kiểm thử được.',
      },
    ],
  },
]
```

---

## Chương 3 — `pyai-u3` · AI là gì (4 bài)

> Vẫn `language: 'python'`, nhưng code ở chương này làm nhiệm vụ **minh hoạ khái niệm** —
> không có thuật toán ML thật, chỉ đếm và so ngưỡng, đúng quyết định §1.4 của đặc tả khung.

```typescript
export const PYAI_U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u3-l1',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Luật viết tay vs học từ dữ liệu — cùng bài toán lọc thư rác',
    hook: 'Bạn viết luật chặn thư rác: "có chữ TRUNG THUONG thì chặn". Kẻ gửi rác đổi câu chữ một chút là luật vỡ, bạn lại ngồi vá. Cách thứ hai: đưa máy vài trăm lá thư đã dán nhãn rác / không rác, để MÁY TỰ RÚT RA đâu là từ đáng ngờ. Hôm nay bạn viết cả hai cách, trên cùng một hộp thư, rồi so kết quả.',
    theory:
      'HAI CÁCH GIẢI cùng một bài toán:\n\nCÁCH 1 — LUẬT VIẾT TAY (rule-based): con người nghĩ ra quy tắc, code cứng vào chương trình. Ưu: minh bạch tuyệt đối (giải thích được vì sao chặn), chạy ngay, không cần dữ liệu. Nhược: người viết chỉ nghĩ ra được vài chục luật, thế giới thì đổi hàng ngày; luật càng nhiều càng đá nhau; mỗi tình huống mới lại phải sửa code.\n\nCÁCH 2 — HỌC TỪ DỮ LIỆU (machine learning): con người đưa VÍ DỤ ĐÃ CÓ NHÃN, chương trình tự rút ra quy luật. Ở bài này quy luật là một TẬP TỪ ĐÁNG NGỜ: những từ xuất hiện trong thư rác nhưng không xuất hiện trong thư sạch. Ưu: thêm dữ liệu là "luật" tự cập nhật, KHÔNG SỬA MỘT DÒNG CODE nào; bắt được cả những dấu hiệu con người không nghĩ ra. Nhược: cần dữ liệu có nhãn, khó giải thích hơn, và học sai nếu dữ liệu lệch.\n\nĐIỂM CỐT LÕI phải mang theo cả khoá: trong cách 2, thứ quyết định kết quả nằm ở DỮ LIỆU chứ không ở code. Đưa bộ dữ liệu khác vào là máy cho ra bộ luật khác — code y nguyên. Đó chính là câu "lập trình bằng dữ liệu".\n\nCẢ HAI ĐỀU SAI ĐƯỢC, theo hai kiểu:\n- BỎ SÓT (false negative): thư rác lọt lưới — luật viết tay hay dính vì kẻ gửi rác đổi chữ.\n- BÁO NHẦM (false positive): thư sạch bị chặn oan — nguy hiểm hơn nhiều, vì người dùng mất thư quan trọng. Khoá Machine Learning sau này sẽ gọi tên hai loại lỗi này là precision và recall.',
    workedExample: {
      code: `# Du lieu HUAN LUYEN: nhung la thu da co nhan
RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]

# CACH 1 - luat viet tay: nguoi tu nghi ra tu khoa
TU_KHOA = ["trung", "thuong"]

# CACH 2 - HOC tu du lieu: tu nao co trong thu rac ma khong co trong thu sach
tu_sach = set()
for thu in SACH:
    for tu in thu.split():
        tu_sach.add(tu)

nghi_ngo = set()
for thu in RAC:
    for tu in thu.split():
        if tu not in tu_sach:        # chi giu tu CHI xuat hien o thu rac
            nghi_ngo.add(tu)

print(f"So tu dang ngo hoc duoc: {len(nghi_ngo)}")   # 9 tu

thu_moi = "mien phi tang ban"
la_rac_luat = any(tu in TU_KHOA for tu in thu_moi.split())
la_rac_hoc = any(tu in nghi_ngo for tu in thu_moi.split())
print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach")
print("Hoc tu du lieu: rac" if la_rac_hoc else "Hoc tu du lieu: sach")`,
      stdinLines: [],
    },
    predict: {
      code: `TU_KHOA = ["trung", "thuong"]\nthu = "mien phi tang ban"\nprint(any(tu in TU_KHOA for tu in thu.split()))`,
      question: 'Luật viết tay có bắt được lá thư "mien phi tang ban" không?',
      choices: ['False — lọt lưới', 'True — bị chặn', 'Báo lỗi', 'None'],
      answerIndex: 0,
      explain:
        'Lá thư này không chứa từ "trung" hay "thuong" nên luật viết tay cho False: thư rác LỌT LƯỚI. Muốn bắt được thì người phải nghĩ ra và thêm tay từ khoá "mien"/"phi" — còn cách học từ dữ liệu tự có chúng vì chúng xuất hiện trong thư rác mẫu.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự bước "học" tập từ đáng ngờ: gom từ của thư sạch trước, rồi lọc từ thư rác.',
      lines: [
        'tu_sach = set()',
        'for thu in SACH:',
        '    for tu in thu.split():',
        '        tu_sach.add(tu)',
        'nghi_ngo = set()',
        'for thu in RAC:',
        '    for tu in thu.split():',
        '        if tu not in tu_sach:',
        '            nghi_ngo.add(tu)',
      ],
    },
    make: {
      prompt:
        'Viết bộ lọc thư rác GIẢI HAI CÁCH trên cùng một lá thư.\n\nDữ liệu huấn luyện và từ khoá đã cho sẵn trong code khởi đầu (RAC, SACH, TU_KHOA) — giữ nguyên, không sửa.\n\nĐọc 1 dòng input() là lá thư cần kiểm (tiếng Việt không dấu).\n\nIn đúng 2 dòng:\nLuat viet tay: rac   (nếu thư chứa ít nhất một từ trong TU_KHOA) hoặc Luat viet tay: sach\nHoc tu du lieu: rac  (nếu thư chứa ít nhất một từ ĐÁNG NGỜ học được: từ có trong thư RAC mà không có trong thư SACH) hoặc Hoc tu du lieu: sach\n\nVí dụ "mien phi tang ban" → "Luat viet tay: sach" nhưng "Hoc tu du lieu: rac".',
      starterCode: `RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]
TU_KHOA = ["trung", "thuong"]

thu = input("La thu: ")
# 1) Luat viet tay: thu co tu nao trong TU_KHOA khong?
# 2) Hoc tu du lieu: gom tu cua SACH, roi lay tu cua RAC khong nam trong do
`,
      testCases: [
        {
          stdinLines: ['trung thuong ngay hom nay'],
          expected: 'Luat viet tay: rac\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Thư rác rõ ràng — cả hai cách đều bắt được',
        },
        {
          stdinLines: ['mien phi tang ban'],
          expected: 'Luat viet tay: sach\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Luật viết tay LỌT LƯỚI, cách học từ dữ liệu bắt được',
        },
        {
          stdinLines: ['gui bao cao thuong ky'],
          expected: 'Luat viet tay: rac\nHoc tu du lieu: rac',
          match: 'contains',
          hidden: false,
          label: 'Thư công việc bị BÁO NHẦM vì chứa chữ "thuong" — cả hai cách đều sai',
        },
        {
          stdinLines: ['hop luc 3 gio chieu'],
          expected: 'Luat viet tay: sach\nHoc tu du lieu: sach',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: thư sạch đúng như mẫu huấn luyện — cả hai cách đều cho sach',
        },
      ],
      hints: [
        'Tách thư thành từ bằng thu.split() rồi kiểm tra bằng vòng lặp hoặc any(...): any(tu in TU_KHOA for tu in thu.split()).',
        'Bước "học": gom tất cả từ của SACH vào một set trước; sau đó duyệt từ của RAC, chỉ giữ từ KHÔNG có trong set đó.',
        'In gọn bằng biểu thức điều kiện: print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach").',
      ],
      sampleSolution: `RAC = ["trung thuong lon", "mien phi 100 phan tram", "trung thuong ngay"]
SACH = ["hop luc 3 gio chieu", "gui bao cao giup minh"]
TU_KHOA = ["trung", "thuong"]

thu = input("La thu: ")
cac_tu = thu.split()

la_rac_luat = False
for tu in cac_tu:
    if tu in TU_KHOA:
        la_rac_luat = True

tu_sach = set()
for t in SACH:
    for tu in t.split():
        tu_sach.add(tu)

nghi_ngo = set()
for t in RAC:
    for tu in t.split():
        if tu not in tu_sach:
            nghi_ngo.add(tu)

la_rac_hoc = False
for tu in cac_tu:
    if tu in nghi_ngo:
        la_rac_hoc = True

print("Luat viet tay: rac" if la_rac_luat else "Luat viet tay: sach")
print("Hoc tu du lieu: rac" if la_rac_hoc else "Hoc tu du lieu: sach")`,
    },
    homework:
      'Thêm 3 lá thư rác mới vào danh sách RAC (không sửa một dòng logic nào) rồi chạy lại với lá thư trước đó bị lọt lưới — xem kết quả của cách 2 tự đổi theo. Đó chính là trải nghiệm cốt lõi của học máy: cải thiện hệ thống bằng cách thêm DỮ LIỆU chứ không phải thêm CODE. Sau đó thử ngược lại: thêm một lá thư sạch chứa chữ "thuong" (vd "bao cao thuong nien") vào SACH và xem tập từ đáng ngờ co lại thế nào.',
    srsCards: [
      {
        hoi: 'Luật viết tay và học từ dữ liệu khác nhau ở chỗ nào khi cần cải thiện hệ thống?',
        dap: 'Luật viết tay: muốn tốt hơn phải SỬA CODE, thêm luật do người nghĩ ra. Học từ dữ liệu: chỉ cần thêm VÍ DỤ có nhãn, quy luật tự cập nhật mà code giữ nguyên — thứ quyết định kết quả nằm ở dữ liệu.',
      },
      {
        hoi: 'Hai kiểu sai của một bộ lọc là gì, kiểu nào nguy hiểm hơn?',
        dap: 'BỎ SÓT (thư rác lọt lưới) và BÁO NHẦM (thư sạch bị chặn oan). Báo nhầm thường nguy hiểm hơn vì người dùng mất thư quan trọng mà không biết. Khoá ML sau này gọi tên chúng qua precision và recall.',
      },
      {
        hoi: 'Nhược điểm chính của cách học từ dữ liệu là gì?',
        dap: 'Cần dữ liệu ĐÃ CÓ NHÃN với số lượng đủ, khó giải thích vì sao ra quyết định đó, và học sai nếu dữ liệu lệch hoặc thiên vị — máy chỉ trung thành với dữ liệu bạn đưa, kể cả khi dữ liệu đó phản ánh sai thực tế.',
      },
    ],
  },
  {
    id: 'pyai-u3-l2',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Bản đồ AI / ML / DL / GenAI — cái nào nằm trong cái nào',
    hook: 'Báo chí dùng lẫn lộn bốn chữ AI, machine learning, deep learning, AI tạo sinh như thể chúng là một. Chúng KHÔNG phải là một — chúng lồng vào nhau như bốn cái hộp, và biết cái nào nằm trong cái nào sẽ giúp bạn đọc mọi tin tức công nghệ mà không bị dắt mũi.',
    theory:
      'BỐN VÒNG TRÒN LỒNG NHAU, từ ngoài vào trong:\n\n1. AI (trí tuệ nhân tạo) — vòng NGOÀI CÙNG, rộng nhất: mọi cách làm cho máy hành xử "thông minh". Bao gồm cả hệ chuyên gia dựa trên LUẬT VIẾT TAY, thuật toán tìm kiếm, máy chơi cờ tính nước đi. Nhiều thứ trong ô này không hề học từ dữ liệu.\n\n2. ML (học máy) — nằm TRONG AI: máy học quy luật từ dữ liệu thay vì được lập trình luật. Lọc thư rác, dự đoán giá nhà, gợi ý sản phẩm.\n\n3. DL (học sâu) — nằm TRONG ML: dùng mạng nơ-ron NHIỀU LỚP. Mạnh với dữ liệu thô phức tạp (ảnh, âm thanh, văn bản) vì tự học ra đặc trưng thay vì để người chọn tay. Nhận diện khuôn mặt, nhận dạng giọng nói.\n\n4. GenAI (AI tạo sinh) — nằm TRONG DL: mạng nơ-ron TẠO RA nội dung mới (chữ, ảnh, nhạc, code) thay vì chỉ phân loại hay đoán số. ChatGPT, Midjourney thuộc ô này.\n\nQuan hệ đọc là: MỌI GenAI đều là DL, mọi DL đều là ML, mọi ML đều là AI — nhưng ngược lại thì KHÔNG. Máy chơi cờ bằng luật viết tay là AI mà không phải ML; hồi quy tuyến tính là ML mà không phải DL.\n\nMỘT MẸO PHÂN LOẠI NHANH: hỏi hai câu. Hệ này có học từ dữ liệu không? Không → chỉ là AI. Có → hỏi tiếp: nó có dùng mạng nơ-ron nhiều lớp không? Không → ML cổ điển. Có, và nó SINH RA nội dung mới → GenAI; có, nhưng chỉ phân loại/dự đoán → DL.',
    workedExample: {
      code: `# Bang tra: moi cong nghe thuoc vong tron nao
BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "nhan dien khuon mat": "DL",
    "chatgpt": "GenAI",
}

for ten, vung in BANG.items():
    print(f"{ten} -> {vung}")

# Tra mot cong nghe chua co trong bang: dung .get de khong bao loi
print(BANG.get("xe tu lai", "Chua ro"))

# Quan he bao nhau: tu ngoai vao trong
print("AI > ML > DL > GenAI")`,
      stdinLines: [],
    },
    predict: {
      code: `BANG = {"chatgpt": "GenAI"}\nprint(BANG.get("may hut bui", "Chua ro"))`,
      question: 'Dòng này in ra gì?',
      choices: ['Chua ro', 'GenAI', 'None', 'Báo lỗi KeyError'],
      answerIndex: 0,
      explain:
        'Khoá "may hut bui" không có trong bảng nên .get trả về giá trị mặc định "Chua ro". Nếu viết BANG["may hut bui"] thì chương trình đã chết vì KeyError — đúng lý do nên dùng .get khi tra bảng dữ liệu chưa đầy đủ.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc số dòng → lặp đọc từng tên → tra bảng → in kết quả.',
      lines: [
        'n = int(input("So cong nghe: "))',
        'for _ in range(n):',
        '    ten = input()',
        '    vung = BANG.get(ten, "Chua ro")',
        '    print(f"{ten} -> {vung}")',
      ],
    },
    make: {
      prompt:
        'Viết máy tra bản đồ AI. Bảng BANG đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc từ input():\n- Dòng 1: số công nghệ n.\n- n dòng tiếp theo, mỗi dòng là tên một công nghệ (chữ thường, không dấu).\n\nVới mỗi công nghệ in một dòng:\n<ten> -> <vung>\nTrong đó vung tra từ BANG; nếu không có trong bảng thì in Chua ro.\n\nVí dụ nhập 2 · "chatgpt" · "loc thu rac" → "chatgpt -> GenAI" và "loc thu rac -> ML".',
      starterCode: `BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "du doan gia nha": "ML",
    "nhan dien khuon mat": "DL",
    "nhan dang giong noi": "DL",
    "chatgpt": "GenAI",
    "ve tranh bang ai": "GenAI",
}

n = int(input("So cong nghe: "))
# Lap n lan: doc ten, tra BANG (dung .get voi mac dinh "Chua ro"), in ket qua
`,
      testCases: [
        {
          stdinLines: ['2', 'chatgpt', 'loc thu rac'],
          expected: 'chatgpt -> GenAI\nloc thu rac -> ML',
          match: 'contains',
          hidden: false,
          label: 'Tra hai công nghệ có trong bảng',
        },
        {
          stdinLines: ['1', 'nhan dien khuon mat'],
          expected: 'nhan dien khuon mat -> DL',
          match: 'contains',
          hidden: false,
          label: 'Nhận diện khuôn mặt thuộc học sâu',
        },
        {
          stdinLines: ['2', 'may tinh choi co bang luat', 've tranh bang ai'],
          expected: 'may tinh choi co bang luat -> AI\nve tranh bang ai -> GenAI',
          match: 'contains',
          hidden: false,
          label: 'Hai đầu bản đồ: luật viết tay là AI, vẽ tranh là GenAI',
        },
        {
          stdinLines: ['1', 'xe tu lai'],
          expected: 'xe tu lai -> Chua ro',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: công nghệ ngoài bảng — phải in Chua ro, không được chết vì KeyError',
        },
      ],
      hints: [
        'Đọc đúng n dòng bằng for _ in range(n): — đừng đọc dư hay thiếu, test so khớp theo từng dòng.',
        'Tra bảng bằng BANG.get(ten, "Chua ro") thay vì BANG[ten], để tên lạ không làm chương trình chết.',
        'Định dạng đúng có khoảng trắng hai bên mũi tên: print(f"{ten} -> {vung}").',
      ],
      sampleSolution: `BANG = {
    "may tinh choi co bang luat": "AI",
    "loc thu rac": "ML",
    "du doan gia nha": "ML",
    "nhan dien khuon mat": "DL",
    "nhan dang giong noi": "DL",
    "chatgpt": "GenAI",
    "ve tranh bang ai": "GenAI",
}

n = int(input("So cong nghe: "))
for _ in range(n):
    ten = input()
    vung = BANG.get(ten, "Chua ro")
    print(f"{ten} -> {vung}")`,
    },
    homework:
      'Lấy 5 tin công nghệ bạn đọc được tuần này và tự xếp mỗi cái vào một trong bốn ô, viết ra LÝ DO một câu. Với những cái bạn xếp là "AI" mà không phải "ML", hãy tự hỏi: nếu nó không học từ dữ liệu thì nó lấy quy luật ở đâu ra? Bài tập này rèn đúng thói quen quan trọng nhất khi đọc tin AI: phân biệt hệ thống HỌC từ dữ liệu với hệ thống chạy theo luật ai đó đã viết sẵn.',
    srsCards: [
      {
        hoi: 'Bốn khái niệm AI, ML, DL, GenAI lồng nhau theo thứ tự nào?',
        dap: 'AI bao ML, ML bao DL, DL bao GenAI. Mọi GenAI đều là DL, mọi DL đều là ML, mọi ML đều là AI — nhưng chiều ngược lại không đúng: máy chơi cờ bằng luật viết tay là AI mà không phải ML.',
      },
      {
        hoi: 'Deep learning khác machine learning cổ điển ở điểm nào?',
        dap: 'Deep learning dùng mạng nơ-ron NHIỀU LỚP và tự học ra đặc trưng từ dữ liệu thô (ảnh, âm thanh, văn bản), trong khi ML cổ điển thường cần người chọn tay đặc trưng trước. Đổi lại DL cần nhiều dữ liệu và nhiều sức tính hơn hẳn.',
      },
      {
        hoi: 'AI tạo sinh (GenAI) khác phần còn lại của deep learning ở chỗ nào?',
        dap: 'Đầu ra là NỘI DUNG MỚI (chữ, ảnh, nhạc, code) thay vì chỉ một nhãn phân loại hay một con số dự đoán. ChatGPT sinh văn bản, Midjourney sinh ảnh; còn nhận diện khuôn mặt chỉ trả về danh tính nên là DL mà không phải GenAI.',
      },
    ],
  },
  {
    id: 'pyai-u3-l3',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Vòng đời một dự án AI — từ dữ liệu tới triển khai',
    hook: 'Người mới hình dung làm AI là ngồi viết mô hình. Thực tế trong một dự án thật, phần huấn luyện mô hình chiếm chưa tới 20% thời gian; phần lớn công sức đổ vào thu thập và làm sạch dữ liệu, còn phần quyết định thành bại là ĐÁNH GIÁ: mô hình này đủ tốt để đem ra dùng chưa?',
    theory:
      'NĂM BƯỚC của một dự án AI, theo đúng thứ tự:\n\n1. THU THẬP DỮ LIỆU — dữ liệu ở đâu, ai gán nhãn, đủ nhiều và đủ đa dạng chưa. Bước tốn công nhất và hay bị xem nhẹ nhất.\n2. LÀM SẠCH DỮ LIỆU — thiếu, trùng, sai định dạng, giá trị ngoại lai. Dữ liệu rác vào thì mô hình rác ra (garbage in, garbage out) — không thuật toán nào cứu được.\n3. HUẤN LUYỆN MÔ HÌNH — chọn thuật toán, cho máy học trên phần dữ liệu HUẤN LUYỆN.\n4. ĐÁNH GIÁ — đo trên phần dữ liệu KIỂM TRA mà mô hình CHƯA TỪNG THẤY. Đây là điểm sống còn: đo trên chính dữ liệu đã học thì con số luôn đẹp và luôn dối, vì mô hình có thể chỉ học vẹt.\n5. TRIỂN KHAI — đưa vào dùng thật, rồi THEO DÕI: dữ liệu ngoài đời trôi dạt theo thời gian (data drift), mô hình tốt hôm nay có thể tệ sau sáu tháng.\n\nĐÂY LÀ VÒNG LẶP, KHÔNG PHẢI ĐƯỜNG THẲNG. Đánh giá xong mà chưa đạt thì quay lại — và quay lại đâu là một quyết định nghề nghiệp:\n- Kết quả quá thấp (mô hình đoán gần như bừa) → thường là thiếu dữ liệu hoặc dữ liệu không mang thông tin cần thiết → quay về bước 1.\n- Kết quả khá nhưng chưa đạt ngưỡng → tinh chỉnh mô hình, thêm đặc trưng → quay về bước 3.\n- Đạt ngưỡng → triển khai, rồi tiếp tục theo dõi.\n\nNGƯỠNG CHẤP NHẬN phải chốt TRƯỚC khi làm, cùng với người dùng thật, chứ không phải chọn sau khi đã nhìn kết quả — nếu không bạn sẽ tự hạ chuẩn cho vừa con số mình có.',
    workedExample: {
      code: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]

for b in BUOC:
    print(b)

do_chinh_xac = 0.72                  # ket qua do tren du lieu KIEM TRA

# Quyet dinh quay lai buoc nao - nguong da chot TRUOC khi lam
if do_chinh_xac < 0.6:
    print("Quay lai: thu thap them du lieu")
elif do_chinh_xac < 0.8:
    print("Quay lai: cai tien mo hinh")
else:
    print("Trien khai")`,
      stdinLines: [],
    },
    predict: {
      code: `acc = 0.8\nif acc < 0.6:\n    print("Quay lai: thu thap them du lieu")\nelif acc < 0.8:\n    print("Quay lai: cai tien mo hinh")\nelse:\n    print("Trien khai")`,
      question: 'Với độ chính xác đúng bằng 0.8, chương trình quyết định gì?',
      choices: [
        'Trien khai',
        'Quay lai: cai tien mo hinh',
        'Quay lai: thu thap them du lieu',
        'Không in gì',
      ],
      answerIndex: 0,
      explain:
        '0.8 không nhỏ hơn 0.6 và cũng không nhỏ hơn 0.8, nên rơi vào else: triển khai. Ngưỡng "đạt từ 0.8 trở lên" phải viết đúng như vậy — nếu viết acc <= 0.8 ở nhánh giữa thì mô hình vừa đủ chuẩn lại bị đẩy về sửa, một lỗi ranh giới tốn cả tuần làm việc.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự vòng đời dự án AI, từ dữ liệu tới quyết định triển khai.',
      lines: [
        'print("1. Thu thap du lieu")',
        'print("2. Lam sach du lieu")',
        'print("3. Huan luyen mo hinh")',
        'print("4. Danh gia")',
        'print("5. Trien khai")',
        'acc = float(input("Do chinh xac: "))',
        'print("Trien khai" if acc >= 0.8 else "Quay lai: cai tien mo hinh")',
      ],
    },
    make: {
      prompt:
        'Viết trợ lý quyết định vòng đời dự án AI.\n\nĐọc 1 dòng input() là độ chính xác đo trên dữ liệu kiểm tra (số thực từ 0 đến 1, vd "0.75").\n\nIn TRƯỚC 5 dòng vòng đời, đúng thứ tự và đúng chữ:\n1. Thu thap du lieu\n2. Lam sach du lieu\n3. Huan luyen mo hinh\n4. Danh gia\n5. Trien khai\n\nRồi in đúng MỘT dòng quyết định:\n- Nhỏ hơn 0.6: Quay lai: thu thap them du lieu\n- Từ 0.6 đến dưới 0.8: Quay lai: cai tien mo hinh\n- Từ 0.8 trở lên: Trien khai',
      starterCode: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]
acc = float(input("Do chinh xac: "))
# In lan luot 5 buoc, roi in dong quyet dinh theo nguong
`,
      testCases: [
        {
          stdinLines: ['0.5'],
          expected:
            '1. Thu thap du lieu\n2. Lam sach du lieu\n3. Huan luyen mo hinh\n4. Danh gia\n5. Trien khai\nQuay lai: thu thap them du lieu',
          match: 'contains',
          hidden: false,
          label: 'Độ chính xác 0.5 → quá thấp, quay về thu thập dữ liệu',
        },
        {
          stdinLines: ['0.75'],
          expected: 'Quay lai: cai tien mo hinh',
          match: 'contains',
          hidden: false,
          label: '0.75 nằm giữa hai ngưỡng → cải tiến mô hình',
        },
        {
          stdinLines: ['0.8'],
          expected: 'Trien khai',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ngưỡng 0.8 — "từ 0.8 trở lên" nghĩa là ĐẠT',
        },
      ],
      hints: [
        'In 5 bước bằng vòng lặp for b in BUOC: print(b) — chép tay 5 dòng print cũng được nhưng dễ sai chính tả.',
        'Đổi input sang float chứ không int, vì độ chính xác là số thực trong khoảng 0..1.',
        'Ranh giới: "từ 0.8 trở lên là đạt" nên nhánh giữa phải là acc < 0.8, không phải acc <= 0.8.',
      ],
      sampleSolution: `BUOC = [
    "1. Thu thap du lieu",
    "2. Lam sach du lieu",
    "3. Huan luyen mo hinh",
    "4. Danh gia",
    "5. Trien khai",
]
acc = float(input("Do chinh xac: "))
for b in BUOC:
    print(b)
if acc < 0.6:
    print("Quay lai: thu thap them du lieu")
elif acc < 0.8:
    print("Quay lai: cai tien mo hinh")
else:
    print("Trien khai")`,
    },
    homework:
      'Chọn một ý tưởng AI của riêng bạn (vd chấm bài tự động, gợi ý món ăn, nhận dạng chữ viết tay) và viết ra giấy đủ 5 bước cho nó: dữ liệu lấy ở đâu và ai dán nhãn, dữ liệu bẩn kiểu gì, đo bằng chỉ số nào, và NGƯỠNG bao nhiêu thì bạn dám đem ra dùng thật. Câu khó nhất — và cũng quan trọng nhất — là câu cuối: hãy chốt ngưỡng TRƯỚC khi bắt tay làm, để sau này không tự hạ chuẩn cho vừa kết quả mình có.',
    srsCards: [
      {
        hoi: 'Năm bước của vòng đời một dự án AI là gì?',
        dap: 'Thu thập dữ liệu → làm sạch dữ liệu → huấn luyện mô hình → đánh giá → triển khai và theo dõi. Đây là VÒNG LẶP: đánh giá chưa đạt thì quay lại bước thu thập hoặc bước huấn luyện tuỳ mức độ kém.',
      },
      {
        hoi: 'Vì sao phải đánh giá mô hình trên dữ liệu mô hình chưa từng thấy?',
        dap: 'Vì đo trên chính dữ liệu đã học thì con số luôn đẹp và luôn dối — mô hình có thể chỉ học vẹt các ví dụ đã gặp. Chỉ dữ liệu kiểm tra tách riêng mới cho biết mô hình có tổng quát hoá được sang ca mới hay không.',
      },
      {
        hoi: 'Vì sao ngưỡng chấp nhận phải chốt trước khi làm?',
        dap: 'Vì nếu chọn ngưỡng sau khi đã nhìn kết quả, người ta luôn có xu hướng hạ chuẩn cho vừa con số mình có. Chốt trước, cùng người dùng thật, giữ cho quyết định triển khai là quyết định trung thực.',
      },
    ],
  },
  {
    id: 'pyai-u3-l4',
    unitId: 'pyai-u3',
    language: 'python',
    title: 'Đạo đức & giới hạn — thiên lệch dữ liệu, ảo giác, khi nào KHÔNG dùng AI',
    hook: 'Một công ty lớn từng làm AI lọc hồ sơ xin việc, huấn luyện trên 10 năm hồ sơ tuyển dụng cũ. Mô hình học rất giỏi — nó học luôn cả thói quen thiên lệch trong dữ liệu cũ và bắt đầu tự động hạ điểm hồ sơ của phụ nữ. Không ai lập trình điều đó. Dữ liệu đã dạy nó.',
    theory:
      'MÁY TRUNG THÀNH VỚI DỮ LIỆU, KHÔNG TRUNG THÀNH VỚI CÔNG BẰNG. Ba giới hạn phải thuộc:\n\n1. THIÊN LỆCH DỮ LIỆU (bias). Nếu dữ liệu huấn luyện phản ánh một thực tế bất công hoặc chỉ đại diện cho một nhóm, mô hình sẽ tái tạo và KHUẾCH ĐẠI điều đó — rồi khoác lên nó vẻ khách quan của con số. Dấu hiệu sớm dễ đo nhất: một nhóm chiếm quá ít trong dữ liệu (dưới ~20%), mô hình gần như chắc chắn phục vụ nhóm đó tệ hơn. Cách chữa nằm ở DỮ LIỆU và ở việc đo riêng cho từng nhóm, không nằm ở thuật toán.\n\n2. ẢO GIÁC (hallucination) của AI tạo sinh. Mô hình ngôn ngữ được huấn luyện để nói câu NGHE HỢP LÝ, không phải nói câu ĐÚNG. Vì thế nó bịa ra tên sách, điều luật, số liệu, trích dẫn với giọng rất tự tin. Nguyên tắc dùng: mọi con số, tên riêng, điều luật do AI đưa ra đều phải KIỂM CHỨNG ở nguồn gốc trước khi dùng.\n\n3. KHÔNG GIẢI THÍCH ĐƯỢC (black box). Mô hình lớn không nói được vì sao nó quyết định như vậy. Với việc ảnh hưởng tới quyền lợi con người, điều đó là vấn đề pháp lý và đạo đức chứ không chỉ kỹ thuật.\n\nKHI NÀO KHÔNG NÊN DÙNG AI:\n- Khi quyết định ảnh hưởng lớn tới đời người (tuyển dụng, tín dụng, y tế, tư pháp) mà KHÔNG có người chịu trách nhiệm rà lại từng ca.\n- Khi một luật rõ ràng đã giải quyết xong bài toán — đừng dùng ML cho việc "trên 18 tuổi thì đủ điều kiện".\n- Khi không có dữ liệu đủ và đại diện; khi sai một lần là thảm hoạ không sửa được.\n- Khi bạn không đo được nó đúng bao nhiêu phần trăm. Không đo được thì không triển khai.\n\nMột câu đáng nhớ: AI nên đứng ở vị trí TRỢ GIÚP người quyết định, không phải thay thế người chịu trách nhiệm.',
    workedExample: {
      code: `# Kiem tra can bang du lieu truoc khi huan luyen
nhom_a = 90                       # so mau nhom thu nhat
nhom_b = 10                       # so mau nhom thu hai

tong = nhom_a + nhom_b
it_hon = nhom_a
if nhom_b < nhom_a:
    it_hon = nhom_b

ti_le = it_hon / tong             # ti le cua nhom it hon
print(f"Ti le nhom it hon: {ti_le}")

if ti_le < 0.2:                   # nguong canh bao lech du lieu
    print("Canh bao: du lieu lech")
else:
    print("Du lieu can bang")`,
      stdinLines: [],
    },
    predict: {
      code: `print(10 / 100)`,
      question: 'Nhóm thiểu số có 10 mẫu trên tổng 100 — tỉ lệ in ra là bao nhiêu?',
      choices: ['0.1', '10', '0', '10.0'],
      answerIndex: 0,
      explain:
        'Phép / cho số thực: 10 / 100 = 0.1, tức 10%. Ngưỡng cảnh báo thường đặt ở 0.2 (20%), nên bộ dữ liệu này bị đánh dấu lệch — mô hình huấn luyện trên nó gần như chắc chắn phục vụ nhóm thiểu số tệ hơn.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự bước kiểm tra cân bằng dữ liệu trước khi huấn luyện.',
      lines: [
        'a, b = input().split(",")',
        'a = int(a)',
        'b = int(b)',
        'it_hon = a if a < b else b',
        'ti_le = it_hon / (a + b)',
        'print(f"Ti le nhom it hon: {ti_le}")',
        'print("Canh bao: du lieu lech" if ti_le < 0.2 else "Du lieu can bang")',
      ],
    },
    make: {
      prompt:
        'Viết bộ kiểm tra thiên lệch dữ liệu — bước bắt buộc trước khi huấn luyện bất kỳ mô hình nào.\n\nĐọc 1 dòng input() gồm hai số nguyên cách nhau bởi dấu phẩy: số mẫu của nhóm A và nhóm B (vd "90,10").\n\nTính tỉ lệ của nhóm ÍT HƠN trên tổng số mẫu, rồi in đúng 2 dòng:\nTi le nhom it hon: <ti le>\nCanh bao: du lieu lech    (nếu tỉ lệ NHỎ HƠN 0.2)\nhoặc\nDu lieu can bang          (nếu tỉ lệ từ 0.2 trở lên)\n\nVí dụ "90,10" → "Ti le nhom it hon: 0.1" và "Canh bao: du lieu lech".',
      starterCode: `dong = input("So mau hai nhom: ")
# Tach bang split(","), doi sang int
# Tim nhom it hon, chia cho tong, so voi nguong 0.2
`,
      testCases: [
        {
          stdinLines: ['90,10'],
          expected: 'Ti le nhom it hon: 0.1\nCanh bao: du lieu lech',
          match: 'contains',
          hidden: false,
          label: '10 trên 100 → 0.1, dưới ngưỡng → cảnh báo lệch',
        },
        {
          stdinLines: ['50,50'],
          expected: 'Ti le nhom it hon: 0.5\nDu lieu can bang',
          match: 'contains',
          hidden: false,
          label: 'Cân bằng hoàn hảo → 0.5',
        },
        {
          stdinLines: ['10,90'],
          expected: 'Ti le nhom it hon: 0.1',
          match: 'contains',
          hidden: false,
          label: 'Nhóm ít hơn đứng TRƯỚC — kết quả phải như nhau',
        },
        {
          stdinLines: ['80,20'],
          expected: 'Ti le nhom it hon: 0.2\nDu lieu can bang',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng ngưỡng 0.2 — "từ 0.2 trở lên" là cân bằng',
        },
      ],
      hints: [
        'Nhóm ít hơn có thể đứng ở vị trí nào cũng được — phải so sánh rồi mới lấy, đừng mặc định số thứ hai nhỏ hơn.',
        'Tỉ lệ = số mẫu nhóm ít hơn chia cho TỔNG hai nhóm, dùng phép / để ra số thực.',
        'Ranh giới: cảnh báo khi ti_le < 0.2; đúng 0.2 thì coi là cân bằng.',
      ],
      sampleSolution: `dong = input("So mau hai nhom: ")
a, b = dong.split(",")
a = int(a)
b = int(b)
it_hon = a
if b < a:
    it_hon = b
ti_le = it_hon / (a + b)
print(f"Ti le nhom it hon: {ti_le}")
if ti_le < 0.2:
    print("Canh bao: du lieu lech")
else:
    print("Du lieu can bang")`,
    },
    homework:
      'Tìm một ứng dụng AI bạn đang dùng thật (gợi ý nội dung, dịch máy, trợ lý viết) và trả lời ba câu bằng văn viết: (1) Nếu nó sai một lần, hậu quả với bạn là gì — khó chịu, hay mất tiền, hay mất cơ hội? (2) Bạn có kiểm chứng được đầu ra của nó không, bằng cách nào? (3) Nếu chính bạn xây nó, dữ liệu huấn luyện sẽ thiếu đại diện cho nhóm người nào? Giữ lại câu trả lời — cuối khoá bạn sẽ đọc lại chúng bằng con mắt khác.',
    srsCards: [
      {
        hoi: 'Thiên lệch dữ liệu (bias) sinh ra như thế nào và chữa ở đâu?',
        dap: 'Sinh ra khi dữ liệu huấn luyện phản ánh thực tế bất công hoặc thiếu đại diện cho một nhóm; mô hình học lại và khuếch đại điều đó dưới vẻ khách quan của con số. Chữa ở khâu DỮ LIỆU và ở việc đo kết quả riêng cho từng nhóm, không chữa được bằng cách đổi thuật toán.',
      },
      {
        hoi: 'Vì sao AI tạo sinh hay bịa (ảo giác), và phải dùng nó thế nào cho an toàn?',
        dap: 'Vì nó được huấn luyện để sinh câu NGHE HỢP LÝ chứ không phải câu ĐÚNG, nên bịa tên sách, điều luật, số liệu với giọng rất tự tin. Nguyên tắc: mọi con số, tên riêng, trích dẫn do AI đưa ra đều phải kiểm chứng ở nguồn gốc trước khi dùng.',
      },
      {
        hoi: 'Kể ba tình huống KHÔNG nên dùng AI.',
        dap: 'Khi quyết định ảnh hưởng lớn tới đời người (tuyển dụng, tín dụng, y tế, tư pháp) mà không có người rà lại từng ca; khi một luật rõ ràng đã giải quyết xong bài toán; và khi bạn không đo được nó đúng bao nhiêu phần trăm — không đo được thì không triển khai.',
      },
    ],
  },
]
```

---

## Chương 4 — `pyai-u4` · Case study chạy thật (3 bài)

```typescript
export const PYAI_U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u4-l1',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Case study 1 — máy gợi ý món ăn theo ngân sách',
    hook: 'Trưa nào cũng câu hỏi cũ: hôm nay ăn gì, còn bao nhiêu tiền. Hệ gợi ý của Shopee hay Netflix, bóc hết lớp toán ra, cũng chỉ làm đúng ba việc: LỌC những thứ hợp điều kiện, CHẤM ĐIỂM theo sở thích, rồi SẮP XẾP đưa cái tốt nhất lên đầu. Hôm nay bạn tự viết cả ba.',
    theory:
      'HỆ GỢI Ý đơn giản nhất gồm ba bước, và mọi hệ phức tạp sau này đều giữ đúng ba bước đó:\n\n1. LỌC (filter) — loại thẳng những lựa chọn KHÔNG khả thi: quá ngân sách, hết hàng, sai chế độ ăn. Đây là luật cứng, không thương lượng.\n2. CHẤM ĐIỂM (score) — với những cái còn lại, gán một con số thể hiện mức phù hợp với người dùng. Ở bài này điểm rất thô: đúng loại ưa thích thì xếp trước.\n3. SẮP XẾP (rank) — đưa điểm cao lên đầu, và phải quy định rõ cách PHÁ HOÀ khi hai món cùng điểm, nếu không thứ tự sẽ chập chờn giữa các lần chạy.\n\nSẮP XẾP NHIỀU TIÊU CHÍ trong Python dùng một tuple làm khoá:\nsorted(mon, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))\nPython so sánh tuple theo TỪ TRÁI SANG PHẢI: so phần tử đầu trước, chỉ khi bằng nhau mới so phần tử sau. Ở đây: đúng loại ưa thích (0) đứng trước loại khác (1); trong cùng nhóm thì giá rẻ đứng trước.\n\nTUPLE là dãy giống list nhưng KHÔNG SỬA ĐƯỢC, viết trong ngoặc tròn: ("Com tam", 35000, "man"). Dùng cho bản ghi cố định nhiều trường. Truy cập vẫn bằng chỉ số: m[0] là tên, m[1] là giá, m[2] là loại.\n\nMỘT ĐIỀU HAY BỊ QUÊN: phải xử lý ca KHÔNG CÓ GÌ PHÙ HỢP. Trả về danh sách rỗng mà không nói gì là trải nghiệm tệ nhất của mọi hệ gợi ý — luôn có một câu trả lời tử tế cho tình huống đó.',
    workedExample: {
      code: `# Moi mon la mot tuple: (ten, gia, loai)
MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = 30000
uu_tien = "chay"

# Buoc 1: LOC theo ngan sach
hop_le = []
for m in MENU:
    if m[1] <= ngan_sach:
        hop_le.append(m)

# Buoc 2+3: CHAM DIEM va SAP XEP - dung loai uu tien truoc, roi gia re truoc
hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))

if len(hop_le) == 0:
    print("Khong co mon phu hop")
else:
    for m in hop_le:
        print(f"{m[0]} - {m[1]} dong")`,
      stdinLines: [],
    },
    predict: {
      code: `mon = [("A", 30, "chay"), ("B", 25, "man"), ("C", 20, "chay")]\nkq = sorted(mon, key=lambda m: (0 if m[2] == "chay" else 1, m[1]))\nprint(kq[0][0])`,
      question: 'Món nào được xếp lên đầu?',
      choices: ['C', 'A', 'B', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Khoá sắp xếp so phần tử đầu trước: A và C là "chay" nên được 0, B được 1 và tụt xuống cuối dù rẻ hơn A. Giữa A (30) và C (20) mới xét tới giá, C rẻ hơn nên đứng đầu. Đúng luật so sánh tuple: trái sang phải, chỉ khi hoà mới xét tiếp.',
    },
    parsons: {
      prompt: 'Xếp đúng ba bước của hệ gợi ý: lọc theo điều kiện cứng → sắp xếp theo ưu tiên → in.',
      lines: [
        'hop_le = []',
        'for m in MENU:',
        '    if m[1] <= ngan_sach:',
        '        hop_le.append(m)',
        'hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))',
        'for m in hop_le:',
        '    print(f"{m[0]} - {m[1]} dong")',
      ],
    },
    make: {
      prompt:
        'Viết máy gợi ý món ăn. MENU đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc từ input():\n- Dòng 1: ngân sách (số nguyên, đồng).\n- Dòng 2: loại ưa thích ("chay" hoặc "man").\n\nLọc các món có giá NHỎ HƠN HOẶC BẰNG ngân sách, rồi sắp xếp: món đúng loại ưa thích lên trước; trong cùng nhóm thì giá rẻ lên trước. In mỗi món một dòng:\n<ten> - <gia> dong\n\nNếu không món nào hợp ngân sách, in đúng một dòng: Khong co mon phu hop\n\nVí dụ ngân sách 30000, ưa thích "chay" → Salad - 25000 dong · Bun chay - 30000 dong · Banh mi - 20000 dong.',
      starterCode: `MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = int(input("Ngan sach: "))
uu_tien = input("Loai ua thich: ")
# 1) Loc theo ngan sach  2) Sap xep uu tien roi gia  3) In hoac bao khong co mon
`,
      testCases: [
        {
          stdinLines: ['30000', 'chay'],
          expected: 'Salad - 25000 dong\nBun chay - 30000 dong\nBanh mi - 20000 dong',
          match: 'contains',
          hidden: false,
          label: 'Hai món chay rẻ nhất lên trước, món mặn xuống cuối dù rẻ hơn',
        },
        {
          stdinLines: ['20000', 'man'],
          expected: 'Banh mi - 20000 dong',
          match: 'contains',
          hidden: false,
          label: 'Ngân sách vừa đúng 20000 → Banh mi vẫn hợp lệ',
        },
        {
          stdinLines: ['50000', 'man'],
          expected:
            'Banh mi - 20000 dong\nCom tam - 35000 dong\nPho bo - 45000 dong\nSalad - 25000 dong\nBun chay - 30000 dong',
          match: 'contains',
          hidden: false,
          label: 'Đủ tiền cả menu: ba món mặn theo giá tăng, rồi tới hai món chay',
        },
        {
          stdinLines: ['15000', 'chay'],
          expected: 'Khong co mon phu hop',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không món nào trong ngân sách — phải báo tử tế, không im lặng',
        },
      ],
      hints: [
        'Điều kiện lọc là "nhỏ hơn HOẶC BẰNG" ngân sách: m[1] <= ngan_sach. Viết < sẽ loại oan món đúng bằng ngân sách.',
        'Sắp hai tiêu chí bằng một tuple khoá: key=lambda m: (0 if m[2] == uu_tien else 1, m[1]). Python tự so từ trái sang phải.',
        'Nhớ nhánh rỗng: kiểm tra len(hop_le) == 0 rồi in "Khong co mon phu hop" thay vì để chương trình không in gì cả.',
      ],
      sampleSolution: `MENU = [
    ("Com tam", 35000, "man"),
    ("Pho bo", 45000, "man"),
    ("Bun chay", 30000, "chay"),
    ("Salad", 25000, "chay"),
    ("Banh mi", 20000, "man"),
]

ngan_sach = int(input("Ngan sach: "))
uu_tien = input("Loai ua thich: ")

hop_le = []
for m in MENU:
    if m[1] <= ngan_sach:
        hop_le.append(m)

hop_le = sorted(hop_le, key=lambda m: (0 if m[2] == uu_tien else 1, m[1]))

if len(hop_le) == 0:
    print("Khong co mon phu hop")
else:
    for m in hop_le:
        print(f"{m[0]} - {m[1]} dong")`,
    },
    homework:
      'Nâng máy gợi ý lên một bậc bằng cách CHẤM ĐIỂM thật thay vì chỉ chia hai nhóm: mỗi món cộng 2 điểm nếu đúng loại ưa thích, cộng 1 điểm nếu giá dưới 70% ngân sách (rẻ thì thích hơn), trừ 1 điểm nếu bạn đã ăn nó hôm qua (thêm một dòng input là tên món hôm qua). Sắp theo điểm giảm dần rồi giá tăng dần. Bạn vừa chạm tới ý tưởng "hàm điểm" — thứ mà mọi hệ gợi ý thật đều có, chỉ khác là điểm của họ do mô hình HỌC ra từ hành vi người dùng chứ không do bạn gán tay.',
    srsCards: [
      {
        hoi: 'Ba bước của một hệ gợi ý đơn giản là gì?',
        dap: 'LỌC (loại thẳng những lựa chọn không khả thi — quá ngân sách, hết hàng), CHẤM ĐIỂM (gán số thể hiện mức phù hợp với người dùng), SẮP XẾP (đưa điểm cao lên đầu kèm luật phá hoà rõ ràng). Hệ thật phức tạp hơn nhưng vẫn đúng ba bước này.',
      },
      {
        hoi: 'Python so sánh hai tuple khoá sắp xếp theo cách nào?',
        dap: 'Từ TRÁI SANG PHẢI: so phần tử đầu trước, chỉ khi chúng bằng nhau mới so tới phần tử sau. Nhờ vậy key=lambda m: (nhom, gia) cho ra "đúng nhóm ưu tiên lên trước, trong nhóm thì giá rẻ lên trước".',
      },
      {
        hoi: 'Vì sao hệ gợi ý luôn phải xử lý riêng ca "không có kết quả"?',
        dap: 'Vì trả về danh sách rỗng mà không nói gì là trải nghiệm tệ nhất — người dùng không biết hệ hỏng hay thật sự không có gì. Luôn in một câu trả lời tử tế (vd "Khong co mon phu hop") cho nhánh rỗng.',
      },
    ],
  },
  {
    id: 'pyai-u4-l2',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Case study 2 — chấm cảm xúc câu bằng từ điển điểm',
    hook: 'Một quán có 2.000 đánh giá trên mạng. Đọc hết thì mất cả tuần. Máy đọc trong một giây — bằng cách ngây thơ đến bất ngờ: cho mỗi từ một điểm cảm xúc, cộng lại, dương là khen, âm là chê. Đó là bản tổ tiên của phân tích cảm xúc (sentiment analysis) mà ngày nay mọi sàn thương mại đều chạy.',
    theory:
      'PHÂN TÍCH CẢM XÚC bằng TỪ ĐIỂN ĐIỂM (lexicon-based) hoạt động ba bước: tách câu thành từ, tra điểm từng từ trong từ điển, cộng tổng rồi phân loại theo dấu.\n\nTỪ ĐIỂN là một dict {tu: diem}: từ tích cực điểm dương ("vui": 2, "thich": 1), từ tiêu cực điểm âm ("buon": -2, "chan": -1). Từ không có trong từ điển được coi là 0 — dùng .get(tu, 0) để không phải kiểm tra khoá.\n\nPHÂN LOẠI theo tổng điểm: lớn hơn 0 là tích cực, bằng 0 là trung tính, nhỏ hơn 0 là tiêu cực. Ranh giới 0 phải rõ: đúng bằng 0 KHÔNG phải tích cực.\n\nƯU ĐIỂM: minh bạch tuyệt đối (chỉ ra được từ nào góp bao nhiêu điểm), chạy tức thì, không cần dữ liệu huấn luyện. Đây vẫn là lựa chọn đúng khi bạn chưa có dữ liệu có nhãn.\n\nBỐN CHỖ NÓ SAI, và đây mới là phần đáng học:\n1. PHỦ ĐỊNH: "khong vui" bị chấm dương vì máy chỉ thấy từ "vui".\n2. MỈA MAI: "hay lam, doi ba tieng dong ho" — toàn từ dương mà nghĩa âm.\n3. NGỮ CẢNH: "gia re" là khen với quán ăn, nhưng "chat luong re tien" lại là chê.\n4. TỪ NGOÀI TỪ ĐIỂN: tiếng lóng, từ mới, viết tắt đều thành 0 điểm.\n\nBa lỗi đầu chính là lý do người ta chuyển sang mô hình HỌC TỪ DỮ LIỆU: thay vì người gán điểm cho từng từ, máy tự học trọng số từ hàng chục nghìn đánh giá đã có nhãn — và học được cả những mẫu như "khong + từ dương". Khoá Machine Learning sẽ làm đúng bước nâng cấp đó bằng Naive Bayes.',
    workedExample: {
      code: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = "hom nay toi rat vui va thich mon nay"

diem = 0
for tu in cau.split():
    d = TU_DIEN.get(tu, 0)        # tu ngoai tu dien thi 0 diem
    if d != 0:
        print(f"  {tu}: {d}")     # in dau vet de giai thich duoc ket qua
    diem = diem + d

print(f"Diem: {diem}")            # 2 (vui) + 1 (thich) = 3
if diem > 0:
    print("Cam xuc: tich cuc")
elif diem == 0:
    print("Cam xuc: trung tinh")
else:
    print("Cam xuc: tieu cuc")`,
      stdinLines: [],
    },
    predict: {
      code: `TU_DIEN = {"vui": 2}\ncau = "toi khong vui"\ndiem = 0\nfor tu in cau.split():\n    diem = diem + TU_DIEN.get(tu, 0)\nprint(diem)`,
      question: 'Câu "toi khong vui" được chấm mấy điểm?',
      choices: ['2 — máy chấm sai thành tích cực', '-2', '0', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Máy chỉ cộng điểm từng từ rời rạc: "khong" không có trong từ điển nên 0 điểm, "vui" được 2. Tổng là 2, tức máy kết luận TÍCH CỰC cho một câu chê. Đây đúng là điểm yếu phủ định của phương pháp từ điển — lý do người ta chuyển sang mô hình học từ dữ liệu.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc câu → cộng dồn điểm từng từ → phân loại theo dấu.',
      lines: [
        'cau = input("Cau: ")',
        'diem = 0',
        'for tu in cau.split():',
        '    diem = diem + TU_DIEN.get(tu, 0)',
        'print(f"Diem: {diem}")',
        'if diem > 0:',
        '    print("Cam xuc: tich cuc")',
        'elif diem == 0:',
        '    print("Cam xuc: trung tinh")',
        'else:',
        '    print("Cam xuc: tieu cuc")',
      ],
    },
    make: {
      prompt:
        'Viết máy chấm cảm xúc. TU_DIEN đã cho sẵn trong code khởi đầu — giữ nguyên, không thêm từ.\n\nĐọc 1 dòng input() là một câu tiếng Việt KHÔNG DẤU, các từ cách nhau bởi khoảng trắng.\n\nCộng điểm của tất cả các từ (từ không có trong từ điển tính 0 điểm), rồi in đúng 2 dòng:\nDiem: <tong diem>\nCam xuc: tich cuc   (nếu tổng LỚN HƠN 0)\nCam xuc: trung tinh (nếu tổng BẰNG 0)\nCam xuc: tieu cuc   (nếu tổng NHỎ HƠN 0)\n\nVí dụ "hom nay toi rat vui va thich mon nay" → Diem: 3 → tich cuc.',
      starterCode: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = input("Cau: ")
# Cong diem tung tu bang TU_DIEN.get(tu, 0), roi phan loai theo dau
`,
      testCases: [
        {
          stdinLines: ['hom nay toi rat vui va thich mon nay'],
          expected: 'Diem: 3\nCam xuc: tich cuc',
          match: 'contains',
          hidden: false,
          label: 'vui (2) + thich (1) = 3 → tích cực',
        },
        {
          stdinLines: ['phim nay chan va te'],
          expected: 'Diem: -3\nCam xuc: tieu cuc',
          match: 'contains',
          hidden: false,
          label: 'chan (-1) + te (-2) = -3 → tiêu cực',
        },
        {
          stdinLines: ['mon ngon nhung phuc vu te'],
          expected: 'Diem: 0\nCam xuc: trung tinh',
          match: 'contains',
          hidden: false,
          label: 'ngon (2) + te (-2) = 0 → trung tính, khen chê bù nhau',
        },
        {
          stdinLines: ['hom nay troi mua'],
          expected: 'Diem: 0\nCam xuc: trung tinh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không từ nào trong từ điển — vẫn phải ra 0 và trung tính',
        },
      ],
      hints: [
        'Dùng TU_DIEN.get(tu, 0) để từ lạ tự tính 0 điểm — nếu viết TU_DIEN[tu] thì câu nào có từ ngoài từ điển sẽ chết vì KeyError.',
        'Ba nhánh phân loại phải xét đúng ranh giới: > 0 tích cực, == 0 trung tính, còn lại tiêu cực. Đúng 0 KHÔNG phải tích cực.',
        'In đủ hai dòng, dòng điểm trước dòng cảm xúc, đúng chính tả "Cam xuc: tich cuc" (không dấu, chữ thường ở nhãn).',
      ],
      sampleSolution: `TU_DIEN = {
    "vui": 2, "tuyet": 2, "thich": 1, "ngon": 2,
    "buon": -2, "te": -2, "chan": -1, "cham": -1,
}

cau = input("Cau: ")
diem = 0
for tu in cau.split():
    diem = diem + TU_DIEN.get(tu, 0)
print(f"Diem: {diem}")
if diem > 0:
    print("Cam xuc: tich cuc")
elif diem == 0:
    print("Cam xuc: trung tinh")
else:
    print("Cam xuc: tieu cuc")`,
    },
    homework:
      'Vá lỗi phủ định: nếu từ đứng NGAY TRƯỚC một từ có điểm là "khong", hãy ĐẢO DẤU điểm của từ đó ("khong vui" thành -2). Gợi ý: duyệt bằng chỉ số for i in range(len(cac_tu)) để nhìn được từ liền trước. Rồi thử tiếp với "khong the khong thich" và tự thấy vá kiểu này không bao giờ hết việc — đó chính là lý do ngành chuyển sang cho máy HỌC quy luật từ hàng chục nghìn câu đã dán nhãn, thay vì để người vá từng luật một.',
    srsCards: [
      {
        hoi: 'Phân tích cảm xúc bằng từ điển điểm hoạt động thế nào?',
        dap: 'Tách câu thành từ, tra điểm mỗi từ trong dict {tu: diem} (từ lạ tính 0 qua .get(tu, 0)), cộng tổng rồi phân loại theo dấu: dương là tích cực, bằng 0 là trung tính, âm là tiêu cực.',
      },
      {
        hoi: 'Kể ba tình huống làm phương pháp từ điển điểm chấm sai.',
        dap: 'Phủ định ("khong vui" bị chấm dương vì máy chỉ thấy từ "vui"), mỉa mai (toàn từ dương mà nghĩa âm), và ngữ cảnh (chữ "re" là khen với giá nhưng là chê với chất lượng). Thêm nữa, từ ngoài từ điển luôn tính 0 điểm.',
      },
      {
        hoi: 'Ưu điểm nào khiến phương pháp từ điển vẫn đáng dùng?',
        dap: 'Minh bạch tuyệt đối — chỉ ra được từ nào góp bao nhiêu điểm nên giải thích được mọi kết quả; chạy tức thì; và không cần dữ liệu huấn luyện có nhãn, nên là lựa chọn đúng khi dự án chưa có dữ liệu.',
      },
    ],
  },
  {
    id: 'pyai-u4-l3',
    unitId: 'pyai-u4',
    language: 'python',
    title: 'Tổng kết khoá & bản đồ 5 khoá tiếp theo',
    hook: 'Mười sáu bài trước, bạn đi từ dòng print đầu tiên tới hai hệ thống nhỏ chạy được thật. Khoá này không dạy bạn làm AI — nó dạy bạn ĐỦ NỀN để bước vào chuỗi năm khoá tiếp theo mà không hụt chân. Bài cuối là tấm bản đồ: bạn đang đứng đâu, và đi tiếp theo hướng nào.',
    theory:
      'BẠN ĐÃ CÓ GÌ SAU KHOÁ NÀY:\n- Python nền: biến và kiểu, if/else, vòng lặp for/while, hàm, chuỗi (chương 1).\n- Cấu trúc dữ liệu và tổ chức chương trình: list, dict, đọc/ghi file CSV, lớp và đối tượng, try/except (chương 2).\n- Khung tư duy AI: luật viết tay vs học từ dữ liệu, bản đồ AI/ML/DL/GenAI, năm bước vòng đời dự án, giới hạn và đạo đức (chương 3).\n- Hai hệ thống chạy được: máy gợi ý món ăn và máy chấm cảm xúc (chương 4).\n\nCHUỖI SÁU KHOÁ, theo thứ tự phụ thuộc:\n1. pyai — Python / AI Cơ Bản (khoá này, cửa vào).\n2. mathai — Toán Thiết Yếu cho AI: xác suất, thống kê, đại số tuyến tính, đạo hàm và gradient descent. Đây là khoá làm cho mọi công thức ở các khoá sau hết đáng sợ.\n3. mlds — Machine Learning & Data Science: pipeline dữ liệu thật, đánh giá mô hình cho đúng, 7 project nhỏ.\n4. cv1 — Deep Learning cho thị giác máy tính, cơ bản: nơ-ron, MLP, convolution, vòng huấn luyện.\n5. cv2 — Deep Learning cho thị giác, nâng cao: Transformer, ViT, phát hiện vật thể, GAN, diffusion.\n6. llmagent — LLMs & AI Agents: tokenizer, RAG, vòng lặp agent, triển khai.\n\nMỘT LỜI KHUYÊN VỀ NHỊP HỌC: đừng nhảy cóc qua khoá toán. Người bỏ qua nó vẫn chạy được code ở khoá 3 và 4, nhưng tới lúc mô hình không hội tụ hoặc kết quả vô lý thì không biết bắt đầu gỡ từ đâu, vì mọi manh mối đều nằm trong ngôn ngữ toán. Ai muốn nền lập trình dày hơn nữa thì học song song bậc P1–P2 của xương sống môn Lập trình; ai thích đi thẳng vào một nghề cụ thể thì xem 14 hướng chuyên sâu của môn.',
    workedExample: {
      code: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = "pyai"
vi_tri = CHUOI.index(hien_tai)          # tim chi so trong danh sach
print(f"Ban dang o: {TEN[hien_tai]}")

con_lai = CHUOI[vi_tri + 1:]            # cat lat: moi khoa SAU khoa hien tai
if len(con_lai) == 0:
    print("Ban da di het chuoi")
else:
    for i, ma in enumerate(con_lai, start=1):   # danh so tu 1
        print(f"{i}. {TEN[ma]}")`,
      stdinLines: [],
    },
    predict: {
      code: `CHUOI = ["a", "b", "c"]\nprint(CHUOI[1 + 1:])`,
      question: 'Phép cắt lát này cho ra gì?',
      choices: ["['c']", "['b', 'c']", "['a', 'b']", '[]'],
      answerIndex: 0,
      explain:
        'CHUOI[2:] lấy từ chỉ số 2 tới hết, tức chỉ còn phần tử "c". Cắt lát bắt đầu từ chỉ số ĐÃ CHO và không bao gồm phần tử trước đó — đúng thứ ta cần để liệt kê "những khoá còn lại sau khoá hiện tại".',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc mã khoá → tìm vị trí → cắt lấy phần còn lại → in đánh số.',
      lines: [
        'hien_tai = input("Khoa hien tai: ")',
        'vi_tri = CHUOI.index(hien_tai)',
        'print(f"Ban dang o: {TEN[hien_tai]}")',
        'con_lai = CHUOI[vi_tri + 1:]',
        'for i, ma in enumerate(con_lai, start=1):',
        '    print(f"{i}. {TEN[ma]}")',
      ],
    },
    make: {
      prompt:
        'Viết bản đồ lộ trình. CHUOI và TEN đã cho sẵn trong code khởi đầu — giữ nguyên.\n\nĐọc 1 dòng input() là mã khoá bạn vừa học xong (một trong: pyai, mathai, mlds, cv1, cv2, llmagent).\n\nIn dòng đầu:\nBan dang o: <ten day du cua khoa do>\nRồi liệt kê các khoá CÒN LẠI phía sau, đánh số từ 1:\n1. <ten khoa ke tiep>\n2. <ten khoa sau nua>\n...\nNếu đã ở khoá cuối cùng, thay danh sách bằng đúng một dòng: Ban da di het chuoi\n\nVí dụ "cv2" → "Ban dang o: Deep Learning CV nang cao" rồi "1. LLMs & AI Agents".',
      starterCode: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = input("Khoa hien tai: ")
# Tim vi tri bang CHUOI.index(...), cat lat phan con lai, in danh so tu 1
`,
      testCases: [
        {
          stdinLines: ['pyai'],
          expected:
            'Ban dang o: Python / AI Co Ban\n1. Toan Thiet Yeu cho AI\n2. Machine Learning & Data Science\n3. Deep Learning CV co ban\n4. Deep Learning CV nang cao\n5. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Đứng ở khoá đầu → còn đúng 5 khoá phía sau',
        },
        {
          stdinLines: ['cv2'],
          expected: 'Ban dang o: Deep Learning CV nang cao\n1. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Áp chót → chỉ còn một khoá',
        },
        {
          stdinLines: ['mlds'],
          expected: '1. Deep Learning CV co ban\n2. Deep Learning CV nang cao\n3. LLMs & AI Agents',
          match: 'contains',
          hidden: false,
          label: 'Đứng giữa chuỗi → đánh số lại từ 1',
        },
        {
          stdinLines: ['llmagent'],
          expected: 'Ban dang o: LLMs & AI Agents\nBan da di het chuoi',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: khoá cuối — danh sách rỗng phải in câu riêng',
        },
      ],
      hints: [
        'CHUOI.index("cv2") trả về chỉ số của phần tử trong list. Lấy phần còn lại bằng cắt lát CHUOI[vi_tri + 1:].',
        'Đánh số từ 1 gọn nhất bằng enumerate(con_lai, start=1) — trả về từng cặp (số thứ tự, giá trị).',
        'Nhớ nhánh rỗng: nếu len(con_lai) == 0 thì in "Ban da di het chuoi" thay vì không in gì.',
      ],
      sampleSolution: `CHUOI = ["pyai", "mathai", "mlds", "cv1", "cv2", "llmagent"]
TEN = {
    "pyai": "Python / AI Co Ban",
    "mathai": "Toan Thiet Yeu cho AI",
    "mlds": "Machine Learning & Data Science",
    "cv1": "Deep Learning CV co ban",
    "cv2": "Deep Learning CV nang cao",
    "llmagent": "LLMs & AI Agents",
}

hien_tai = input("Khoa hien tai: ")
vi_tri = CHUOI.index(hien_tai)
print(f"Ban dang o: {TEN[hien_tai]}")
con_lai = CHUOI[vi_tri + 1:]
if len(con_lai) == 0:
    print("Ban da di het chuoi")
else:
    for i, ma in enumerate(con_lai, start=1):
        print(f"{i}. {TEN[ma]}")`,
    },
    homework:
      'Viết một trang tổng kết cho chính bạn, gồm ba phần: (1) liệt kê 5 khái niệm bạn thấy khó nhất trong 17 bài vừa qua và tự giải thích lại bằng lời của mình — chỗ nào giải thích lắp bắp là chỗ chưa thật sự hiểu, quay lại bài đó; (2) mở lại chương trình quản lý điểm bạn viết ở cuối chương 2 và cải tiến một chỗ bất kỳ bằng thứ học được ở chương 4; (3) đặt lịch cụ thể cho khoá tiếp theo (mathai): ngày bắt đầu, mấy buổi một tuần. Lộ trình chỉ có tác dụng khi có ngày tháng gắn vào nó.',
    srsCards: [
      {
        hoi: 'Chuỗi sáu khoá "Kỹ sư AI thực chiến" gồm những khoá nào, theo thứ tự?',
        dap: 'pyai (Python / AI cơ bản) → mathai (Toán thiết yếu cho AI) → mlds (Machine Learning & Data Science) → cv1 (Deep Learning CV cơ bản) → cv2 (Deep Learning CV nâng cao) → llmagent (LLMs & AI Agents).',
      },
      {
        hoi: 'Vì sao không nên nhảy cóc qua khoá toán (mathai)?',
        dap: 'Vì không có nó bạn vẫn chạy được code, nhưng khi mô hình không hội tụ hay kết quả vô lý thì không biết gỡ từ đâu — mọi manh mối đều nằm trong ngôn ngữ xác suất, đại số tuyến tính và đạo hàm mà khoá đó dạy.',
      },
      {
        hoi: 'Cắt lát danh_sach[i + 1:] cho ra cái gì?',
        dap: 'Một list mới gồm mọi phần tử ĐỨNG SAU chỉ số i (bắt đầu từ i + 1 tới hết); nếu i là chỉ số cuối thì kết quả là list rỗng. Đây là cách gọn nhất để lấy "phần còn lại phía trước" của một lộ trình.',
      },
    ],
  },
]
```

---

## Nghiệm thu

- **17/17 bài** đủ 8 bước + 3 thẻ SRS mỗi bài; mọi bài `language: 'python'`.
- Mọi `sampleSolution` đã suy luận tay khớp **từng** test case liệt kê kèm bài; mọi bài có
  ≥ 3 test case và ít nhất **1 ca ẩn** kiểm ranh giới (tuổi 0 · đúng ngưỡng 5.0 / 0.2 / 0.8 ·
  dãy 1 phần tử · danh sách rỗng · từ ngoài từ điển · khoá cuối chuỗi).
- Mọi chuỗi in ra là **tiếng Việt không dấu**; không dùng thư viện ngoài.
- Sau khi transcribe, cổng bắt buộc: `npx vitest run packages/subject-programming` (gồm
  `lessons.test.ts`, `lessonsPython.test.ts` chạy python3 thật, `srsCards.test.ts`) rồi cổng
  chung `npm run build` · `npm run typecheck` · `npm run lint` · `npm test`.
