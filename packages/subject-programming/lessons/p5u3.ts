// lessons/p5u3.ts — P5-U3: CTDL nền — stack, queue, hash, đệ quy (làn A, `python`).
//
// Cả bậc P5 chấm bằng chuỗi "contains" (khuôn TestCaseSchema), nên danh sách phải in trong
// DẤU NGOẶC VUÔNG: "Hang cho: [ca phe]" không thể lọt qua bài in "Hang cho: [ca phe, sinh to]",
// còn nếu in trần thì lời giải thừa phần tử vẫn được chấm đạt. Cùng lý do, phần rỗng in
// [trong] chứ không để trắng.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U3_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u3-l1',
    unitId: 'p5-u3',
    language: 'python',
    title: 'Bốn cấu trúc dữ liệu nền — mỗi cái sinh ra để làm gọn đúng một việc',
    hook: 'Quán bạn có hai loại danh sách rất khác nhau. Hàng chờ pha chế: ai gọi trước pha trước. Và chồng thao tác vừa làm, để bấm "hoàn tác" thì cái mới nhất bị gỡ trước. Cả hai đều là list của Python — nhưng nếu bạn không phân biệt được chúng, code sẽ chạy sai theo cách rất khó nhìn ra.',
    theory:
      'Danh sách (list) làm được mọi thứ, và chính vì thế nó không nói cho ai biết ý định của bạn. Bốn cấu trúc dưới đây là bốn Ý ĐỊNH khác nhau — nhớ chúng theo câu hỏi "ai ra trước".\n\n1. HÀNG ĐỢI (queue) — vào trước ra trước (FIFO). Hàng chờ pha chế, hàng người xếp ở quầy. Trong Python: append() để thêm vào cuối, pop(0) để lấy ở đầu.\n   Cảnh báo hiệu năng thật: pop(0) là O(n) — mỗi lần lấy, Python phải dịch toàn bộ phần tử còn lại sang trái một ô. Với hàng chờ 5 món thì không sao; với hàng đợi 100.000 việc thì đó là O(n²). Bản đúng cho việc thật là collections.deque, có popleft() chạy O(1).\n\n2. CHỒNG (stack) — vào sau ra trước (LIFO). Hoàn tác (Ctrl+Z), lịch sử nút Back của trình duyệt, và cả cách máy tính nhớ chỗ quay về khi gọi hàm lồng nhau. Trong Python: append() để thêm, pop() (không tham số) để lấy. Cả hai đều O(1).\n\n3. BẢNG BĂM (hash / dict) — tra theo KHOÁ, không theo vị trí. Đây là cấu trúc đổi đời nhiều dự án nhất: tra một khoá trong dict tốn O(1), tức là tra trong 10 phần tử hay 10 triệu phần tử đều nhanh như nhau. Cái giá phải trả: khoá phải "băm" được (chuỗi, số, tuple — không được là list), và dict không có thứ tự sắp xếp theo giá trị.\n\n4. ĐỆ QUY (recursion) — hàm tự gọi chính nó. Dùng khi bài toán chứa BẢN NHỎ HƠN CỦA CHÍNH NÓ: duyệt cây thư mục, duyệt bình luận lồng nhau, tính tổng theo nhánh. Luật sống còn: mọi hàm đệ quy phải có ĐIỀU KIỆN DỪNG được kiểm TRƯỚC lời gọi tiếp theo. Thiếu nó thì Python dừng bạn lại bằng RecursionError sau khoảng 1.000 tầng — và điều thú vị là chỗ Python cất các tầng gọi dở dang đó chính là một cái stack.\n\nĐiểm chung của cả bốn: chúng không làm được gì mà list không làm được. Giá trị của chúng là làm ĐÚNG MỘT VIỆC với chi phí thấp nhất và nói rõ ý định cho người đọc code — kể cả người đó là bạn của ba tháng sau.',
    workedExample: {
      code: `# Cùng dữ liệu, hai ý định khác nhau -> hai kết quả khác hẳn.
mon = ["tra da", "ca phe", "sinh to"]

hang_cho = list(mon)
print("Hang doi (FIFO) pha truoc:", hang_cho.pop(0))    # lấy ở ĐẦU -> món gọi sớm nhất

chong = list(mon)
print("Chong (LIFO) hoan tac:", chong.pop())            # lấy ở CUỐI -> thao tác mới nhất

# Bảng băm: tra theo khoá, không quét
gia = {"tra da": 5000, "ca phe": 20000, "sinh to": 30000}
print("Gia sinh to:", gia["sinh to"])                   # O(1), không duyệt phần tử nào
print("Gia nuoc loc:", gia.get("nuoc loc", 0))          # .get có mặc định -> không nổ KeyError

# Đệ quy: tổng tiền của một đơn có món kèm (món kèm lại có thể có món kèm nữa)
don = {"gia": 30000, "kem": [{"gia": 5000, "kem": []},
                             {"gia": 10000, "kem": [{"gia": 2000, "kem": []}]}]}

def tong_tien(muc):
    tong = muc["gia"]                     # phần của chính nó
    for con in muc["kem"]:                # rồi cộng bản NHỎ HƠN của cùng bài toán
        tong += tong_tien(con)
    return tong
# Điều kiện dừng ở đây là ngầm: "kem" rỗng thì vòng for không chạy, hàm trả về ngay.

print("Tong tien don:", tong_tien(don))`,
      stdinLines: [],
    },
    predict: {
      code: `hang = ["tra da", "ca phe", "sinh to"]
a = hang.pop()
b = hang.pop(0)
print(a, "|", b)`,
      question: 'Hai lệnh pop chỉ khác nhau một con số 0. In ra gì?',
      choices: ['sinh to | tra da', 'tra da | sinh to', 'tra da | ca phe', 'ca phe | sinh to'],
      answerIndex: 0,
      explain:
        'pop() không tham số lấy phần tử CUỐI ("sinh to") — đó là hành vi chồng, LIFO. pop(0) lấy phần tử ĐẦU ("tra da") — đó là hành vi hàng đợi, FIFO. Một con số 0 là toàn bộ khác biệt giữa "hoàn tác thao tác vừa rồi" và "pha món gọi sớm nhất". Đây là lỗi khiến hàng chờ pha chế phục vụ ngược từ người đến sau — mà chương trình không hề báo lỗi, chỉ có khách là bực.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm đệ quy đếm tổng số món trong một đơn có món kèm lồng nhau — chú ý chỗ nào là điều kiện dừng.',
      lines: [
        'def dem_mon(muc):',
        '    if not muc["kem"]:',
        '        return 1',
        '    tong = 1',
        '    for con in muc["kem"]:',
        '        tong += dem_mon(con)',
        '    return tong',
      ],
    },
    make: {
      prompt:
        'Mô phỏng quầy pha chế bằng MỘT hàng đợi và MỘT chồng.\n\nĐọc dòng đầu bằng input() là số lệnh n, rồi đọc n dòng lệnh, mỗi dòng là một trong ba loại:\n- "them <ten mon>" — món vào CUỐI hàng chờ.\n- "xong" — lấy món ở ĐẦU hàng chờ ra, đẩy lên chồng "đã xong". Hàng chờ rỗng thì bỏ qua lệnh này (không được báo lỗi).\n- "huy" — lấy món TRÊN CÙNG chồng đã xong ra, trả nó về ĐẦU hàng chờ. Chồng rỗng thì bỏ qua.\n\nCuối cùng in đúng hai dòng, danh sách đặt trong ngoặc vuông, các món cách nhau bằng dấu phẩy + khoảng trắng:\nHang cho: [<tu dau den cuoi>]\nDa xong: [<tu MOI NHAT den cu nhat>]\n\nDanh sách rỗng thì in [trong]. Ví dụ sau 3 lệnh "them tra da", "them ca phe", "xong":\nHang cho: [ca phe]\nDa xong: [tra da]',
      starterCode: `n = int(input("So lenh: "))
hang_cho = []      # hàng đợi: vào cuối, ra đầu
da_xong = []       # chồng: vào cuối, ra cuối

for _ in range(n):
    dong = input("Lenh: ")
    # Tách lệnh và tên món, rồi xử lý ba trường hợp
    ...


def ra(ds):
    # Danh sách rỗng -> "trong"
    ...


print(f"Hang cho: [{ra(hang_cho)}]")
# Còn dòng "Da xong" — nhớ in từ MỚI NHẤT trở về trước
`,
      testCases: [
        {
          stdinLines: ['3', 'them tra da', 'them ca phe', 'xong'],
          expected: 'Hang cho: [ca phe]',
          match: 'contains',
          hidden: false,
          label: 'Pha xong món gọi TRƯỚC (FIFO) → hàng chờ chỉ còn cà phê',
        },
        {
          stdinLines: ['3', 'them tra da', 'them ca phe', 'xong'],
          expected: 'Da xong: [tra da]',
          match: 'contains',
          hidden: false,
          label: 'Món ra khỏi hàng chờ là trà đá, không phải cà phê',
        },
        {
          stdinLines: ['6', 'them tra da', 'them ca phe', 'them sinh to', 'xong', 'xong', 'huy'],
          expected: 'Hang cho: [ca phe, sinh to]',
          match: 'contains',
          hidden: false,
          label: 'Huỷ trả cà phê về ĐẦU hàng chờ (nó được gọi trước sinh tố)',
        },
        {
          stdinLines: ['2', 'xong', 'huy'],
          expected: 'Hang cho: [trong]',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: lệnh trên danh sách rỗng phải bỏ qua êm, không nổ IndexError',
        },
        {
          stdinLines: ['2', 'xong', 'huy'],
          expected: 'Da xong: [trong]',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: chồng cũng rỗng',
        },
        {
          stdinLines: ['8', 'them a', 'them b', 'them c', 'xong', 'xong', 'xong', 'huy', 'huy'],
          expected: 'Hang cho: [b, c]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: huỷ hai lần phải trả về ĐÚNG thứ tự b rồi c (không phải c, b)',
        },
        {
          stdinLines: ['8', 'them a', 'them b', 'them c', 'xong', 'xong', 'xong', 'huy', 'huy'],
          expected: 'Da xong: [a]',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chồng còn lại đúng một món a',
        },
      ],
      hints: [
        'Tách lệnh bằng dong.split(maxsplit=1): phần tử [0] là lệnh, phần tử [1] là tên món. Dùng split() thường thì "them tra da" bị cắt thành ba mảnh và tên món mất chữ.',
        'Hàng chờ: thêm bằng append() (vào cuối), lấy bằng pop(0) (ra đầu). Chồng: thêm bằng append(), lấy bằng pop() (không tham số).',
        'Lệnh "huy" trả món về ĐẦU hàng chờ, tức hang_cho.insert(0, mon) — không phải append(). Ca ẩn huỷ hai lần trong đề chính là để bắt lỗi này: append sẽ cho ra thứ tự ngược.',
        'Trước khi pop, luôn kiểm danh sách có rỗng không: if hang_cho: ... — đề yêu cầu bỏ qua êm chứ không phải nổ IndexError.',
        'Dòng "Da xong" in từ MỚI NHẤT trở về trước, tức đảo ngược chồng khi in: reversed(da_xong) hoặc da_xong[::-1]. Bản thân chồng thì giữ nguyên thứ tự.',
      ],
      sampleSolution: `n = int(input("So lenh: "))
hang_cho = []      # hàng đợi (FIFO): append vào cuối, pop(0) ra đầu
da_xong = []       # chồng (LIFO): append vào cuối, pop() ra cuối

for _ in range(n):
    dong = input("Lenh: ")
    phan = dong.split(maxsplit=1)      # giữ nguyên tên món có khoảng trắng
    lenh = phan[0]
    if lenh == "them":
        hang_cho.append(phan[1])
    elif lenh == "xong":
        if hang_cho:                   # rỗng thì bỏ qua êm, không nổ IndexError
            da_xong.append(hang_cho.pop(0))
    elif lenh == "huy":
        if da_xong:
            hang_cho.insert(0, da_xong.pop())   # trả về ĐẦU hàng chờ


def ra(ds):
    return ", ".join(ds) if ds else "trong"


print(f"Hang cho: [{ra(hang_cho)}]")
print(f"Da xong: [{ra(list(reversed(da_xong)))}]")   # mới nhất trước`,
    },
    homework:
      'Thay hang_cho bằng collections.deque và đổi pop(0) thành popleft(). Chương trình chạy y hệt — đó là điều đáng chú ý: cùng một hành vi, khác nhau ở CÁI GIÁ. Rồi thử dựng một hàng đợi 200.000 việc và lấy hết ra bằng hai cách, bấm giờ. Chênh lệch bạn thấy chính là khác biệt giữa O(n²) và O(n) trong một dòng code trông vô hại.',
    srsCards: [
      {
        hoi: 'Hàng đợi và chồng khác nhau ở chỗ nào?',
        dap: 'Hàng đợi lấy ra phần tử VÀO TRƯỚC (FIFO) — như hàng người xếp ở quầy. Chồng lấy ra phần tử VÀO SAU CÙNG (LIFO) — như nút hoàn tác. Trong Python: pop(0) cho hàng đợi, pop() cho chồng.',
      },
      {
        hoi: 'Vì sao pop(0) trên list là một cái bẫy hiệu năng?',
        dap: 'Vì nó tốn O(n): mỗi lần lấy phần tử đầu, Python phải dịch toàn bộ phần còn lại sang trái một ô. Hàng đợi lớn thì vòng lặp lấy hết thành O(n²). Bản đúng là collections.deque với popleft() chạy O(1).',
      },
      {
        hoi: 'Tra một khoá trong dict tốn bao nhiêu, và điều kiện là gì?',
        dap: 'Tốn O(1) — tra trong 10 hay 10 triệu phần tử đều nhanh như nhau, vì nó tính thẳng ra chỗ cần đến chứ không quét. Điều kiện: khoá phải băm được (chuỗi, số, tuple), không được là list hay dict.',
      },
      {
        hoi: 'Điều gì bắt buộc phải có trong mọi hàm đệ quy?',
        dap: 'Một điều kiện DỪNG được kiểm TRƯỚC lời gọi tiếp theo, và mỗi lần gọi phải tiến gần điều kiện đó hơn. Thiếu thì chương trình chạy tới khi Python ném RecursionError ở khoảng 1.000 tầng gọi.',
      },
    ],
  },
]
