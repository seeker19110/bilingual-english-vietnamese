// lessons/p5u4.ts — P5-U4: Cây & đồ thị (làn A, `python`).
//
// Bản đồ trong bài được dựng CÓ CHỦ ĐÍCH để mỗi cặp trạm chỉ có ĐÚNG MỘT đường ngắn nhất —
// nếu có hai đường cùng độ dài thì kết quả phụ thuộc thứ tự duyệt hàng xóm và test-case so
// chuỗi sẽ thành test flaky theo cách soạn (Tầng 1b của QUY-TRINH-AUDIT.md). Đã kiểm bằng
// vét cạn mọi đường đi khi soạn.
//
// Thứ tự hàng xóm của "Ben Thanh" cố tình đặt đường DÀI trước ("Cho Lon"), để lời giải đi
// theo kiểu chiều sâu cho ra đáp án dài hơn và bị test-case bắt.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u4-l1',
    unitId: 'p5-u4',
    language: 'python',
    title: 'Cây và đồ thị: khi dữ liệu không còn xếp thành hàng',
    hook: 'Mọi thứ bạn viết tới giờ đều là danh sách — dữ liệu xếp thành một hàng. Nhưng bản đồ tuyến xe buýt thì không: từ Bến Thành đi được hai hướng, mỗi hướng lại rẽ tiếp, và có khi vòng về đúng chỗ cũ. Câu hỏi "đi từ đây tới kia ít chặng nhất là mấy?" cần một cách nghĩ khác hẳn.',
    theory:
      'ĐỒ THỊ là dữ liệu gồm các ĐIỂM (đỉnh) và các NỐI giữa chúng (cạnh). Bản đồ tuyến xe, mạng bạn bè, các trang web liên kết nhau, các bảng CSDL tham chiếu nhau — tất cả đều là đồ thị. CÂY là trường hợp riêng của đồ thị: có gốc, không có vòng, mỗi nút có đúng một cha (thư mục, bình luận lồng nhau, cấu trúc HTML).\n\nCách ghi đồ thị trong Python đơn giản đến bất ngờ — một dict, khoá là điểm, giá trị là danh sách hàng xóm:\nban_do = {"Ben Thanh": ["Cho Lon", "Ba Son"], ...}\n\nCó hai cách đi khắp một đồ thị, và chọn sai là ra đáp án sai:\n\n- DUYỆT THEO CHIỀU SÂU (DFS): đi thẳng một mạch tới khi cụt rồi mới quay lại rẽ nhánh khác. Dùng CHỒNG (hoặc đệ quy, vốn cũng là chồng). Trả lời tốt câu hỏi "có đường nào tới đó không?", "có đi vòng tròn không?".\n- DUYỆT THEO CHIỀU RỘNG (BFS): đi hết mọi điểm cách 1 chặng, rồi mới tới mọi điểm cách 2 chặng… Dùng HÀNG ĐỢI. Trả lời tốt câu hỏi "ít chặng nhất là mấy?".\n\nĐây là điểm cốt lõi của bài: BFS tìm được ĐƯỜNG NGẮN NHẤT (theo số chặng), DFS thì KHÔNG. DFS vẫn cho ra một đường đi hợp lệ — nên nó không báo lỗi gì, chỉ là đường đó có thể dài hơn cần thiết. Lại đúng loại lỗi âm thầm bạn đã gặp ở bài nhị phân trên danh sách chưa sắp xếp.\n\nVà một thứ TUYỆT ĐỐI không được quên: TẬP ĐÃ THĂM. Đồ thị có vòng (Bến Thành → Chợ Lớn → Bến Thành), nên không đánh dấu điểm đã đi qua thì chương trình chạy mãi không dừng. Đánh dấu ngay lúc ĐƯA VÀO hàng đợi, đừng đợi tới lúc lấy ra — nếu không, cùng một điểm bị nhét vào hàng đợi nhiều lần và hàng đợi phình ra vô ích.',
    workedExample: {
      code: `from collections import deque

# Bản đồ tuyến: mỗi trạm kèm danh sách trạm nối trực tiếp (đi được cả hai chiều).
BAN_DO = {
    "Ben Thanh": ["Cho Lon", "Ba Son"],
    "Cho Lon": ["Ben Thanh", "Phu Lam"],
    "Phu Lam": ["Cho Lon", "Thao Dien"],
    "Ba Son": ["Ben Thanh", "Thao Dien"],
    "Thao Dien": ["Ba Son", "Phu Lam", "Suoi Tien"],
    "Suoi Tien": ["Thao Dien"],
    "Cat Lai": [],                       # trạm chưa nối tuyến nào
}

def duong_ngan_nhat(ban_do, dau, cuoi):
    da_tham = {dau}                      # đánh dấu NGAY, nếu không sẽ chạy vòng mãi
    hang_doi = deque([[dau]])            # hàng đợi chứa cả ĐƯỜNG ĐI, không chỉ điểm
    while hang_doi:
        duong = hang_doi.popleft()       # lấy ở ĐẦU -> xét hết chặng gần trước
        if duong[-1] == cuoi:
            return duong                 # BFS nên đường đầu tiên gặp là ngắn nhất
        for ke in ban_do[duong[-1]]:
            if ke not in da_tham:
                da_tham.add(ke)
                hang_doi.append(duong + [ke])
    return None                          # đi hết đồ thị vẫn không tới -> không có đường

d = duong_ngan_nhat(BAN_DO, "Ben Thanh", "Suoi Tien")
print("So chang:", len(d) - 1)           # số CHẶNG = số trạm - 1
print("Duong di:", " -> ".join(d))

print("Toi Cat Lai:", duong_ngan_nhat(BAN_DO, "Ben Thanh", "Cat Lai"))`,
      stdinLines: [],
    },
    predict: {
      code: `BAN_DO = {
    "Ben Thanh": ["Cho Lon", "Ba Son"],
    "Cho Lon": ["Ben Thanh", "Phu Lam"],
    "Phu Lam": ["Cho Lon", "Thao Dien"],
    "Ba Son": ["Ben Thanh", "Thao Dien"],
    "Thao Dien": ["Ba Son", "Phu Lam", "Suoi Tien"],
    "Suoi Tien": ["Thao Dien"],
}

def theo_chieu_sau(dau, cuoi, duong):     # đi thang mot mach, gap dau di do
    if dau == cuoi:
        return duong
    for ke in BAN_DO[dau]:
        if ke not in duong:
            kq = theo_chieu_sau(ke, cuoi, duong + [ke])
            if kq:
                return kq
    return None

d = theo_chieu_sau("Ben Thanh", "Thao Dien", ["Ben Thanh"])
print(len(d) - 1)`,
      question: 'Hàm này tìm đường từ Bến Thành tới Thảo Điền. In ra số chặng là bao nhiêu?',
      choices: ['3', '2', '1', '4'],
      answerIndex: 0,
      explain:
        'In ra 3, dù đường ngắn nhất chỉ 2 chặng (Ben Thanh → Ba Son → Thao Dien). Vì đây là duyệt theo CHIỀU SÂU: nó lấy hàng xóm đầu tiên là "Cho Lon" rồi lao thẳng theo hướng đó — Cho Lon → Phu Lam → Thao Dien, tới nơi thì trả về ngay, không bao giờ ngó qua hướng Ba Son. Hàm không sai cú pháp, không báo lỗi, chỉ trả về một đường dài hơn cần thiết. Muốn ngắn nhất thì phải BFS: xét hết mọi trạm cách 1 chặng trước khi xét trạm cách 2 chặng.',
    },
    parsons: {
      prompt: 'Xếp lại vòng lặp BFS tìm đường ngắn nhất — chú ý chỗ đánh dấu đã thăm.',
      lines: [
        'da_tham = {dau}',
        'hang_doi = deque([[dau]])',
        'while hang_doi:',
        '    duong = hang_doi.popleft()',
        '    if duong[-1] == cuoi:',
        '        return duong',
        '    for ke in ban_do[duong[-1]]:',
        '        if ke not in da_tham:',
        '            da_tham.add(ke)',
        '            hang_doi.append(duong + [ke])',
        'return None',
      ],
    },
    make: {
      prompt:
        'Dùng đúng bản đồ BAN_DO của ví dụ mẫu (chép nguyên vào bài làm của bạn — có 7 trạm, trong đó "Cat Lai" chưa nối tuyến nào).\n\nViết hàm duong_ngan_nhat(ban_do, dau, cuoi) trả về danh sách các trạm đi qua (kể cả trạm đầu và trạm cuối), hoặc None nếu không tới được. Bắt buộc dùng BFS — đề có ca kiểm chính xác số chặng nên đi theo chiều sâu sẽ ra sai.\n\nChương trình chính đọc 2 dòng input(): dòng 1 trạm đi, dòng 2 trạm đến. Rồi in:\n- Nếu có đường:\n  So chang: <so chang>\n  Duong di: <tram1> -> <tram2> -> ...\n- Nếu không tới được (hoặc tên trạm không có trên bản đồ), in đúng một dòng:\n  Khong den duoc\n\nSố chặng = số trạm đi qua trừ 1. Đi từ một trạm tới CHÍNH NÓ là 0 chặng.',
      starterCode: `from collections import deque

BAN_DO = {
    "Ben Thanh": ["Cho Lon", "Ba Son"],
    "Cho Lon": ["Ben Thanh", "Phu Lam"],
    "Phu Lam": ["Cho Lon", "Thao Dien"],
    "Ba Son": ["Ben Thanh", "Thao Dien"],
    "Thao Dien": ["Ba Son", "Phu Lam", "Suoi Tien"],
    "Suoi Tien": ["Thao Dien"],
    "Cat Lai": [],
}


def duong_ngan_nhat(ban_do, dau, cuoi):
    # Tên trạm không có trên bản đồ -> None
    # BFS: hàng đợi chứa các ĐƯỜNG ĐI, nhớ tập đã thăm
    ...


dau = input("Tram di: ")
cuoi = input("Tram den: ")
# In kết quả theo đúng hai khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['Ben Thanh', 'Suoi Tien'],
          expected: 'So chang: 3',
          match: 'contains',
          hidden: false,
          label: 'Bến Thành → Suối Tiên ít nhất 3 chặng (đi chiều sâu sẽ ra 4)',
        },
        {
          stdinLines: ['Ben Thanh', 'Suoi Tien'],
          expected: 'Duong di: Ben Thanh -> Ba Son -> Thao Dien -> Suoi Tien',
          match: 'contains',
          hidden: false,
          label: 'Đường ngắn nhất đi qua Ba Son, không qua Chợ Lớn',
        },
        {
          stdinLines: ['Ben Thanh', 'Ben Thanh'],
          expected: 'So chang: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: đi từ một trạm tới chính nó là 0 chặng',
        },
        {
          stdinLines: ['Ben Thanh', 'Cat Lai'],
          expected: 'Khong den duoc',
          match: 'contains',
          hidden: false,
          label: 'Trạm chưa nối tuyến nào — phải trả lời êm, không chạy vòng vô tận',
        },
        {
          stdinLines: ['Ben Thanh', 'Ga Ha Noi'],
          expected: 'Khong den duoc',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: tên trạm không có trên bản đồ, không được nổ KeyError',
        },
        {
          stdinLines: ['Suoi Tien', 'Cho Lon'],
          expected: 'Duong di: Suoi Tien -> Thao Dien -> Phu Lam -> Cho Lon',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chiều ngược lại cũng phải đúng (bản đồ đi được hai chiều)',
        },
        {
          stdinLines: ['Ba Son', 'Phu Lam'],
          expected: 'So chang: 2',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: Ba Son → Phu Lam qua Thảo Điền là 2 chặng, không phải 3 qua Bến Thành',
        },
      ],
      hints: [
        'Kiểm tên trạm TRƯỚC KHI bắt đầu duyệt: if dau not in ban_do or cuoi not in ban_do: return None. Thiếu bước này thì ca "Ga Ha Noi" nổ KeyError.',
        'Hàng đợi nên chứa cả ĐƯỜNG ĐI (một list), không chỉ chứa tên trạm — như vậy lúc tới đích bạn có sẵn lộ trình để in, khỏi phải lần ngược.',
        'Dùng deque và popleft(). Nếu dùng list và pop() (không tham số) thì bạn đang làm DFS chứ không phải BFS, và ca "So chang: 3" sẽ ra 4.',
        'Đánh dấu da_tham.add(ke) ngay lúc ĐƯA VÀO hàng đợi, đừng đợi tới lúc lấy ra. Đợi thì cùng một trạm bị nhét vào nhiều lần — vẫn ra kết quả đúng nhưng làm thừa rất nhiều việc.',
        'Khung tham chiếu cho phần in:\n\nd = duong_ngan_nhat(BAN_DO, dau, cuoi)\nif d is None:\n    print("Khong den duoc")\nelse:\n    print(f"So chang: {len(d) - 1}")\n    print("Duong di:", " -> ".join(d))',
      ],
      sampleSolution: `from collections import deque

BAN_DO = {
    "Ben Thanh": ["Cho Lon", "Ba Son"],
    "Cho Lon": ["Ben Thanh", "Phu Lam"],
    "Phu Lam": ["Cho Lon", "Thao Dien"],
    "Ba Son": ["Ben Thanh", "Thao Dien"],
    "Thao Dien": ["Ba Son", "Phu Lam", "Suoi Tien"],
    "Suoi Tien": ["Thao Dien"],
    "Cat Lai": [],
}


def duong_ngan_nhat(ban_do, dau, cuoi):
    if dau not in ban_do or cuoi not in ban_do:
        return None                      # tên trạm lạ -> trả lời êm, không nổ KeyError
    da_tham = {dau}
    hang_doi = deque([[dau]])
    while hang_doi:
        duong = hang_doi.popleft()       # ĐẦU hàng đợi -> xét hết chặng gần trước
        if duong[-1] == cuoi:
            return duong
        for ke in ban_do[duong[-1]]:
            if ke not in da_tham:
                da_tham.add(ke)          # đánh dấu ngay lúc đưa vào
                hang_doi.append(duong + [ke])
    return None


dau = input("Tram di: ")
cuoi = input("Tram den: ")

d = duong_ngan_nhat(BAN_DO, dau, cuoi)
if d is None:
    print("Khong den duoc")
else:
    print(f"So chang: {len(d) - 1}")
    print("Duong di:", " -> ".join(d))`,
    },
    homework:
      'Thêm vào bản đồ một trạm mới của riêng bạn, nối nó vào hai trạm sẵn có, rồi kiểm lại vài lộ trình xem số chặng có đổi không. Sau đó thử bỏ dòng da_tham.add(ke) đi và chạy lại — chương trình sẽ treo. Hãy giải thích được cho chính mình vì sao nó treo, bằng cách in ra len(hang_doi) mỗi vòng lặp.',
    srsCards: [
      {
        hoi: 'Muốn tìm đường ĐI ÍT CHẶNG NHẤT thì dùng cách duyệt nào?',
        dap: 'Duyệt theo chiều rộng (BFS) với một hàng đợi. Nó xét hết mọi điểm cách 1 chặng rồi mới tới điểm cách 2 chặng, nên đường đầu tiên chạm đích chắc chắn là ngắn nhất.',
      },
      {
        hoi: 'Duyệt theo chiều sâu (DFS) sai ở đâu khi tìm đường ngắn nhất?',
        dap: 'Nó vẫn trả về một đường đi hợp lệ và không báo lỗi gì, nhưng đường đó có thể dài hơn cần thiết — vì nó lao theo hàng xóm đầu tiên tới cùng thay vì xét đều các hướng.',
      },
      {
        hoi: 'Bỏ tập "đã thăm" khi duyệt đồ thị thì chuyện gì xảy ra?',
        dap: 'Chương trình chạy mãi không dừng, vì đồ thị có vòng: đi từ A sang B rồi lại quay về A và lặp vô tận. Đây là khác biệt lớn nhất giữa duyệt đồ thị và duyệt cây (cây không có vòng).',
      },
      {
        hoi: 'Nên đánh dấu một điểm là "đã thăm" vào lúc nào?',
        dap: 'Ngay lúc ĐƯA NÓ VÀO hàng đợi, không phải lúc lấy ra. Đánh dấu muộn thì cùng một điểm bị nhét vào hàng đợi nhiều lần, kết quả vẫn đúng nhưng tốn thêm rất nhiều việc vô ích.',
      },
    ],
  },
]
