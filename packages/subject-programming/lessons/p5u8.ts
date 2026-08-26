// lessons/p5u8.ts — P5-U8: Deploy (làn A cho phần đo được + làn C cho phần deploy thật).
//
// Hiến chương P5 §3: KHÔNG mô phỏng deploy. Phần chấm được của unit này là thứ quyết định
// deploy thành hay bại trong phần lớn trường hợp thật — ứng dụng đọc cấu hình từ MÔI TRƯỜNG
// và bí mật không nằm trong code. Thao tác trên nền tảng nằm ở bước ⑦, làn C, không chấm.
//
// os.environ ở đây là THẬT (Pyodide và python3 đều có). Chỉ có việc "ai đặt biến" là khác:
// trên nền tảng thật thì nền tảng đặt, ở bài này học viên tự nạp vào để chạy thử — bài nói
// rõ điều đó thay vì để học viên tưởng mình đang chạy trên máy chủ.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U8_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u8-l1',
    unitId: 'p5-u8',
    language: 'python',
    title: 'Chuẩn bị ra Internet: cấu hình sống ngoài code, bí mật không đi cùng code',
    hook: 'Bạn sắp đưa quán lên Internet thật. Trước khi bấm nút deploy, có một câu hỏi phải trả lời xong: cái chuỗi mật khẩu CSDL đang nằm ở dòng 12 file của bạn — nó sẽ đi đâu khi bạn push code lên GitHub?',
    theory:
      'Deploy không phải là bấm một cái nút. Deploy là chuyển ứng dụng từ "chạy trên máy tôi" sang "chạy ở một chỗ tôi không kiểm soát", và phần lớn ca hỏng đều rơi vào cùng một nguyên nhân: CODE ĐANG BIẾT NHỮNG THỨ NÓ KHÔNG NÊN BIẾT.\n\nNguyên tắc gốc: MỘT BỘ CODE, NHIỀU MÔI TRƯỜNG. Cùng một file chạy trên máy bạn, trên máy đồng đội, và trên máy chủ thật — thứ khác nhau giữa ba nơi đó KHÔNG được nằm trong code. Nó nằm trong BIẾN MÔI TRƯỜNG, do nơi chạy cung cấp.\n\nBốn thứ gần như luôn phải ra khỏi code:\n- Cổng lắng nghe (nền tảng thường tự chọn cổng và báo cho bạn qua biến PORT — viết cứng 3000 là ứng dụng không lên được).\n- Chuỗi kết nối CSDL (máy bạn là sqlite, máy chủ là postgres ở địa chỉ khác, mật khẩu khác).\n- Khoá API của các dịch vụ bên thứ ba.\n- Chế độ chạy: phát triển (hiện lỗi chi tiết cho bạn sửa) hay sản xuất (giấu chi tiết lỗi đi, vì thông điệp lỗi đầy đủ là một món quà cho kẻ tấn công).\n\nTrong Python, đọc chúng bằng os.environ:\n  cong = os.environ.get("PORT", "8000")     # có mặc định -> máy bạn chạy được ngay\n  url = os.environ.get("DATABASE_URL")      # KHÔNG mặc định -> thiếu là phải dừng\n\nBa luật đi kèm, mỗi luật rút từ một cách hỏng có thật:\n\n1. GIÁ TRỊ TỪ MÔI TRƯỜNG LUÔN LÀ CHUỖI. Không có ngoại lệ. os.environ.get("PORT", 8000) trông rất hợp lý nhưng khi biến CÓ tồn tại thì bạn nhận về "3001" (chuỗi) chứ không phải 3001 — và mọi phép so sánh sau đó âm thầm sai. Ép kiểu và kiểm giá trị ngay tại chỗ đọc.\n\n2. THIẾU CẤU HÌNH BẮT BUỘC THÌ DỪNG NGAY, ỒN ÀO. Ứng dụng thiếu DATABASE_URL mà vẫn khởi động được là ứng dụng sẽ hỏng ở một chỗ ngẫu nhiên nào đó, ba giờ sau, trước mặt người dùng. Kiểm hết cấu hình lúc khởi động và ném lỗi rõ ràng — đây là một trong số ít chỗ mà "làm chương trình chết ngay" là lựa chọn đúng.\n\n3. KHÔNG BAO GIỜ IN BÍ MẬT RA LOG. Log rất hay bị gửi đi nơi khác, bị lưu lâu, bị nhiều người đọc. In cấu hình khi khởi động là thói quen tốt, nhưng phải CHE phần bí mật: giữ lại phần đủ để chẩn đoán (giao thức, máy chủ) và thay phần nhạy cảm bằng ***. Cũng vì vậy, file .env luôn nằm trong .gitignore, và repo chỉ có .env.example ghi TÊN các biến chứ không ghi giá trị.\n\nVà một điều thẳng thắn về bài này: bạn KHÔNG deploy trong sandbox này được, và môn học không giả vờ ngược lại. Phần chạy trên máy chủ thật nằm ở việc về nhà. Cái bạn luyện ở đây là phần quyết định 90% ca deploy hỏng — và cũng là phần duy nhất kiểm chứng được bằng test.',
    workedExample: {
      code: `import os

# Trên nền tảng thật, các biến này do NƠI CHẠY đặt sẵn (bảng cấu hình của dịch vụ,
# hoặc file .env đã nằm trong .gitignore). Ở đây ta tự đặt để chạy thử.
os.environ["DATABASE_URL"] = "postgres://admin:matkhau123@db.quan.vn:5432/quan"
os.environ["CHE_DO"] = "san-xuat"


def doc_cau_hinh():
    cong = os.environ.get("PORT", "8000")            # luôn là CHUỖI, kể cả khi có mặc định số
    if not cong.isdigit() or not (1 <= int(cong) <= 65535):
        raise ValueError(f"PORT khong hop le: {cong}")

    url = os.environ.get("DATABASE_URL")             # bắt buộc -> KHÔNG cho mặc định
    if not url:
        raise ValueError("Thieu bien moi truong DATABASE_URL")

    che_do = os.environ.get("CHE_DO", "phat-trien")
    if che_do not in ("phat-trien", "san-xuat"):
        raise ValueError(f"CHE_DO khong hop le: {che_do}")

    return {"cong": int(cong), "url": url, "che_do": che_do}


def che_bi_mat(url):
    # Giữ đủ để chẩn đoán (giao thức + máy chủ), giấu phần tên/mật khẩu
    if "://" in url and "@" in url:
        return f"{url.split('://', 1)[0]}://***@{url.split('@', 1)[1]}"
    return "***"


c = doc_cau_hinh()
print(f"Cau hinh: cong={c['cong']} che_do={c['che_do']}")
print(f"Ket noi CSDL: {che_bi_mat(c['url'])}")     # dòng này an toàn để nằm trong log

os.environ["PORT"] = "khong-phai-so"
try:
    doc_cau_hinh()
except ValueError as loi:
    print("Chet ngay luc khoi dong (dung y do):", loi)`,
      stdinLines: [],
    },
    predict: {
      code: `import os

os.environ["PORT"] = "9"
cong = os.environ.get("PORT", 8000)      # mac dinh la SO 8000
print(cong > "10", type(cong).__name__)`,
      question: 'Cổng 9 có lớn hơn cổng 10 không, và biến cong thuộc kiểu gì?',
      choices: ['True str', 'False str', 'True int', 'False int'],
      answerIndex: 0,
      explain:
        'In ra "True str". Hai điều bất ngờ cùng lúc. Thứ nhất: dù bạn đặt mặc định là SỐ 8000, khi biến môi trường có tồn tại thì os.environ trả về CHUỖI "9" — giá trị mặc định chỉ được dùng khi biến vắng mặt, nên kiểu dữ liệu của biến cong phụ thuộc vào việc môi trường có đặt biến hay không. Thứ hai: "9" > "10" là True, vì so sánh chuỗi thì so từng ký tự và "9" đứng sau "1". Ghép hai điều đó lại, bạn có một chương trình chạy đúng trên máy mình (không đặt biến, nhận số 8000) và sai trên máy chủ (có đặt biến, nhận chuỗi) — đúng loại lỗi khó chịu nhất khi deploy.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm đọc cấu hình — ép kiểu và kiểm ngay tại chỗ đọc, thiếu bắt buộc thì ném lỗi.',
      lines: [
        'def doc_cau_hinh():',
        '    cong = os.environ.get("PORT", "8000")',
        '    if not cong.isdigit():',
        '        raise ValueError(f"PORT khong hop le: {cong}")',
        '    url = os.environ.get("DATABASE_URL")',
        '    if not url:',
        '        raise ValueError("Thieu bien moi truong DATABASE_URL")',
        '    return {"cong": int(cong), "url": url}',
      ],
    },
    make: {
      prompt:
        'Viết phần đọc cấu hình khởi động cho quán, sẵn sàng đem lên máy chủ.\n\nChương trình đọc dòng đầu bằng input() là số biến môi trường n, rồi n dòng dạng TEN=gia tri. Với mỗi dòng, nạp vào os.environ (dùng partition("=") để giá trị có chứa dấu = vẫn nguyên vẹn). Trước khi nạp, hãy xoá sạch ba khoá PORT, DATABASE_URL, CHE_DO khỏi os.environ để lượt chạy này không lẫn biến của máy bạn.\n\nViết doc_cau_hinh() đọc từ os.environ theo đúng ba luật:\n- PORT: mặc định "8000"; phải là số nguyên trong khoảng 1..65535, không thì raise ValueError(f"PORT khong hop le: {gia tri}").\n- DATABASE_URL: BẮT BUỘC, không có mặc định; thiếu hoặc rỗng thì raise ValueError("Thieu bien moi truong DATABASE_URL").\n- CHE_DO: mặc định "phat-trien"; chỉ nhận "phat-trien" hoặc "san-xuat", khác thì raise ValueError(f"CHE_DO khong hop le: {gia tri}").\n\nViết che_bi_mat(url): nếu url có cả "://" và "@" thì trả về "<giao thuc>://***@<phan sau dau @>", ngược lại trả về "***".\n\nCuối cùng: gọi doc_cau_hinh() trong try. Nếu ném ValueError, in đúng một dòng:\nLoi cau hinh: <thong diep>\nNếu không lỗi, in đúng hai dòng:\nCau hinh: cong=<so> che_do=<che do>\nKet noi CSDL: <chuoi da che>',
      starterCode: `import os

KHOA = ["PORT", "DATABASE_URL", "CHE_DO"]


def doc_cau_hinh():
    # Ba luật: ép kiểu + kiểm ngay tại chỗ đọc; bắt buộc thì không có mặc định
    ...


def che_bi_mat(url):
    # Giữ giao thức và máy chủ, giấu phần tên/mật khẩu
    ...


n = int(input("So bien: "))
for k in KHOA:
    os.environ.pop(k, None)        # dọn sạch để không lẫn biến của máy bạn
for _ in range(n):
    dong = input("Bien: ")
    # Tách TEN=gia tri rồi nạp vào os.environ
    ...

# Gọi doc_cau_hinh() trong try và in theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['1', 'DATABASE_URL=postgres://admin:matkhau123@db.quan.vn:5432/quan'],
          expected: 'Cau hinh: cong=8000 che_do=phat-trien',
          match: 'contains',
          hidden: false,
          label: 'Chỉ có biến bắt buộc — hai biến còn lại dùng mặc định',
        },
        {
          stdinLines: ['1', 'DATABASE_URL=postgres://admin:matkhau123@db.quan.vn:5432/quan'],
          expected: 'Ket noi CSDL: postgres://***@db.quan.vn:5432/quan',
          match: 'contains',
          hidden: false,
          label: 'Mật khẩu bị che, phần đủ để chẩn đoán thì giữ lại',
        },
        {
          stdinLines: [
            '3',
            'PORT=3001',
            'DATABASE_URL=postgres://a:b@db.quan.vn/quan',
            'CHE_DO=san-xuat',
          ],
          expected: 'Cau hinh: cong=3001 che_do=san-xuat',
          match: 'contains',
          hidden: false,
          label: 'Môi trường máy chủ: cổng và chế độ do nền tảng đặt',
        },
        {
          stdinLines: ['1', 'PORT=3001'],
          expected: 'Loi cau hinh: Thieu bien moi truong DATABASE_URL',
          match: 'contains',
          hidden: false,
          label: 'Thiếu cấu hình BẮT BUỘC → chết ngay lúc khởi động, ồn ào',
        },
        {
          stdinLines: ['2', 'PORT=abc', 'DATABASE_URL=postgres://a:b@h/q'],
          expected: 'Loi cau hinh: PORT khong hop le: abc',
          match: 'contains',
          hidden: false,
          label: 'PORT không phải số → báo rõ giá trị sai là gì',
        },
        {
          stdinLines: ['2', 'DATABASE_URL=postgres://a:b@h/q', 'CHE_DO=linh tinh'],
          expected: 'Loi cau hinh: CHE_DO khong hop le: linh tinh',
          match: 'contains',
          hidden: false,
          label: 'Chế độ lạ → từ chối, không âm thầm chạy như phát triển',
        },
        {
          stdinLines: ['2', 'PORT=0', 'DATABASE_URL=postgres://a:b@h/q'],
          expected: 'Loi cau hinh: PORT khong hop le: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 0 là số nhưng không phải cổng hợp lệ — kiểm KHOẢNG, không chỉ kiểm kiểu',
        },
        {
          stdinLines: ['1', 'DATABASE_URL=sqlite:///quan.db'],
          expected: 'Ket noi CSDL: ***',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chuỗi kết nối không có phần đăng nhập → che toàn bộ cho chắc',
        },
      ],
      hints: [
        'Tách dòng bằng dong.partition("="): nó cho ba phần (trước, dấu =, sau) và phần sau giữ nguyên mọi dấu = còn lại — quan trọng vì chuỗi kết nối hay có dấu = trong tham số.',
        'os.environ.get("PORT", "8000") — giá trị mặc định phải là CHUỖI "8000", không phải số 8000. Để số thì kiểu dữ liệu của biến sẽ khác nhau tuỳ môi trường, đúng cái bẫy ở bước Dự đoán.',
        'Kiểm PORT cần cả hai vế: cong.isdigit() (đúng kiểu) VÀ 1 <= int(cong) <= 65535 (đúng khoảng). Ca ẩn PORT=0 chính là để bắt lời giải chỉ kiểm kiểu.',
        'DATABASE_URL không được có giá trị mặc định. Cho nó mặc định là bạn vừa tạo ra một ứng dụng khởi động được mà không có CSDL — nó sẽ hỏng muộn hơn, ở một chỗ khó tìm hơn.',
        'Khung tham chiếu cho phần cuối:\n\ntry:\n    c = doc_cau_hinh()\nexcept ValueError as loi:\n    print(f"Loi cau hinh: {loi}")\nelse:\n    print(f"Cau hinh: cong={c[\'cong\']} che_do={c[\'che_do\']}")\n    print(f"Ket noi CSDL: {che_bi_mat(c[\'url\'])}")',
      ],
      sampleSolution: `import os

KHOA = ["PORT", "DATABASE_URL", "CHE_DO"]
CHE_DO_HOP_LE = ("phat-trien", "san-xuat")


def doc_cau_hinh():
    cong = os.environ.get("PORT", "8000")           # mặc định phải là CHUỖI
    if not cong.isdigit() or not (1 <= int(cong) <= 65535):
        raise ValueError(f"PORT khong hop le: {cong}")

    url = os.environ.get("DATABASE_URL")            # bắt buộc -> không mặc định
    if not url:
        raise ValueError("Thieu bien moi truong DATABASE_URL")

    che_do = os.environ.get("CHE_DO", "phat-trien")
    if che_do not in CHE_DO_HOP_LE:
        raise ValueError(f"CHE_DO khong hop le: {che_do}")

    return {"cong": int(cong), "url": url, "che_do": che_do}


def che_bi_mat(url):
    if "://" in url and "@" in url:
        giao_thuc = url.split("://", 1)[0]
        sau_dau_a = url.split("@", 1)[1]
        return f"{giao_thuc}://***@{sau_dau_a}"
    return "***"


n = int(input("So bien: "))
for k in KHOA:
    os.environ.pop(k, None)                         # dọn sạch, không lẫn biến của máy
for _ in range(n):
    dong = input("Bien: ")
    ten, _dau, gia_tri = dong.partition("=")        # partition giữ nguyên dấu = trong giá trị
    os.environ[ten] = gia_tri

try:
    c = doc_cau_hinh()
except ValueError as loi:
    print(f"Loi cau hinh: {loi}")
else:
    print(f"Cau hinh: cong={c['cong']} che_do={c['che_do']}")
    print(f"Ket noi CSDL: {che_bi_mat(c['url'])}")`,
    },
    homework:
      'Phần này làm TRÊN MÁY THẬT của bạn — sandbox không deploy được, và môn học không giả vờ ngược lại.\n\n1. Trong dự án của bạn, tìm mọi chỗ viết cứng cổng, đường dẫn CSDL hay khoá API. Chuyển hết sang os.environ. Tạo .env cho máy mình, thêm .env vào .gitignore, và tạo .env.example chỉ ghi TÊN biến.\n\n2. Chọn một nền tảng free-tier và tự kiểm ba điều TRƯỚC khi đăng ký (chính sách đổi liên tục, đừng tin bài hướng dẫn cũ nào, kể cả bài này): nó có cho chạy tiến trình web thường trú không · nó cấp CSDL hay bạn phải dùng dịch vụ khác · sau bao lâu không ai truy cập thì ứng dụng bị ngủ.\n\n3. Deploy thử, rồi chụp lại ba thứ: URL https chạy thật, bảng biến môi trường trên nền tảng (che giá trị), và dòng log khởi động. Đó là bằng chứng bạn nộp ở bài milestone.',
    srsCards: [
      {
        hoi: 'Vì sao cấu hình phải nằm ngoài code?',
        dap: 'Vì cùng một bộ code chạy ở nhiều nơi khác nhau (máy bạn, máy đồng đội, máy chủ thật) và thứ khác nhau giữa các nơi đó phải do NƠI CHẠY cung cấp. Viết cứng vào code là mỗi lần đổi môi trường lại phải sửa và deploy lại.',
      },
      {
        hoi: 'Giá trị đọc từ os.environ có kiểu gì?',
        dap: 'Luôn là chuỗi, không có ngoại lệ — kể cả khi bạn truyền giá trị mặc định là số, vì mặc định chỉ dùng khi biến vắng mặt. Phải ép kiểu và kiểm giá trị ngay tại chỗ đọc.',
      },
      {
        hoi: 'Thiếu một biến cấu hình BẮT BUỘC thì ứng dụng nên làm gì?',
        dap: 'Dừng ngay lúc khởi động với thông điệp rõ ràng. Cho nó giá trị mặc định để "chạy tạm" nghĩa là ứng dụng sẽ hỏng muộn hơn, ở một chỗ ngẫu nhiên, trước mặt người dùng thật.',
      },
      {
        hoi: 'Được in cấu hình ra log khi khởi động không?',
        dap: 'Được, và nên — nhưng phải che phần bí mật, giữ lại đủ để chẩn đoán (giao thức, máy chủ) và thay tên/mật khẩu bằng ***. Log hay bị gửi đi nơi khác, lưu lâu và nhiều người đọc được.',
      },
    ],
  },
]
