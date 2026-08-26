// lessons/p5u6.ts — P5-U6: Bảo mật nhập môn (làn A, `python`).
//
// Chạy làn A chứ KHÔNG phải làn B: sqlite3 và hashlib đều có thật trong Pyodide, còn bộ API
// giả lập của môn chưa có header — kể chuyện "Authorization: Bearer …" trên nó sẽ là bịa,
// vi phạm luật 1 của hiến chương P4. Phần phiên đăng nhập qua header để ở bước ⑦ (làn C).
//
// Test-case của bài PHÂN BIỆT ĐƯỢC hai lời giải cùng "chạy đúng": lời giải ghép chuỗi cho
// input "chu_quan' --" đăng nhập THÀNH CÔNG mà không cần mật khẩu, lời giải dùng tham số ?
// thì từ chối. Đã chạy thật cả hai bản khi soạn để chắc ca này thật sự tách được chúng.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u6-l1',
    unitId: 'p5-u6',
    language: 'python',
    title: 'Hai lỗ hổng kinh điển — cho nổ trên code của mình rồi mới vá',
    hook: "Trang đăng nhập của quán bạn chạy tốt. Cho tới hôm có người gõ vào ô tên đăng nhập một chuỗi trông rất vô hại: chu_quan' -- và bấm Đăng nhập với mật khẩu bỏ trống. Họ vào được. Không có mã độc nào cả, chỉ có hai ký tự gạch ngang.",
    theory:
      'Bảo mật cho người mới không phải là học thuộc danh sách. Nó là hiểu HAI cơ chế, và cả hai đều xuất phát từ cùng một sai lầm: LẪN LỘN GIỮA DỮ LIỆU VÀ LỆNH.\n\n① SQL INJECTION\n\nKhi bạn viết:\n  db.execute("SELECT * FROM nguoi_dung WHERE ten = \'" + ten + "\'")\nbạn đang lấy chuỗi người dùng gõ vào và DÁN NÓ VÀO GIỮA MỘT CÂU LỆNH. Với người dùng bình thường thì không sao. Nhưng nếu họ gõ chu_quan\' -- thì câu lệnh thành:\n  SELECT * FROM nguoi_dung WHERE ten = \'chu_quan\' --\' AND bam = \'...\'\nTrong SQL, hai dấu -- nghĩa là "phần còn lại của dòng là ghi chú, bỏ qua". Điều kiện kiểm mật khẩu vừa bị xoá sổ.\n\nCách vá không phải là "lọc dấu nháy" — đó là cuộc đua bạn sẽ thua (còn dấu nháy Unicode, còn mã hoá URL, còn mười biến thể bạn chưa nghĩ ra). Cách vá đúng là dùng THAM SỐ:\n  db.execute("SELECT * FROM nguoi_dung WHERE ten = ?", (ten,))\nVới dấu ?, CSDL nhận câu lệnh và dữ liệu qua HAI ĐƯỜNG RIÊNG. Chuỗi người dùng gõ không bao giờ được đọc như lệnh nữa — dù họ gõ gì. Đây là một trong số rất ít quy tắc bảo mật tuyệt đối: KHÔNG BAO GIỜ ghép chuỗi để dựng câu SQL. Không có ngoại lệ "chỗ này an toàn mà".\n\n② MẬT KHẨU LƯU THÔ\n\nCSDL của bạn rồi sẽ bị lộ — do sao lưu để nhầm chỗ, do một lỗ hổng khác, do một nhân viên cũ. Câu hỏi duy nhất là lúc đó kẻ cầm được file có đọc được mật khẩu của người dùng không. Và điều tệ nhất: người ta dùng lại mật khẩu, nên lộ mật khẩu quán bạn là lộ luôn email của họ.\n\nNên: không bao giờ lưu mật khẩu. Lưu MÃ BĂM của nó. Hàm băm đi một chiều — từ mật khẩu tính ra mã băm thì dễ, từ mã băm tìm ngược lại mật khẩu thì không. Lúc đăng nhập, bạn băm cái người ta vừa gõ rồi so hai mã băm với nhau.\n\nHai điều bắt buộc đi kèm, thiếu là hỏng:\n- MUỐI (salt): một chuỗi thêm vào trước khi băm. Không có muối thì hai người cùng đặt mật khẩu 123456 sẽ có mã băm giống hệt nhau, và kẻ tấn công tra bảng dựng sẵn là ra. Trong thực tế mỗi người một muối ngẫu nhiên, lưu kèm trong CSDL (muối không phải bí mật — nó chỉ cần khác nhau). Bài này dùng một muối cố định cho dễ chấm.\n- CHẬM CÓ CHỦ ĐÍCH: dùng hàm băm chuyên cho mật khẩu (pbkdf2_hmac, bcrypt, argon2) với số vòng lặp lớn, KHÔNG dùng md5 hay sha256 trần. Hàm băm thường được thiết kế để nhanh — mà nhanh nghĩa là kẻ tấn công thử được hàng tỷ mật khẩu mỗi giây.\n\n③ XSS — nhận biết thôi, chưa thực hành ở đây\n\nLỗ hổng thứ ba trong bộ ba kinh điển cũng là cùng một sai lầm, nhưng ở phía trình duyệt: lấy chuỗi người dùng gõ rồi nhét thẳng vào HTML bằng innerHTML, thế là chữ họ gõ được đọc như THẺ. Cách vá cùng một tinh thần: đưa dữ liệu qua đường dành cho dữ liệu — dùng textContent thay innerHTML, và để framework tự thoát ký tự. Bộ chạy DOM của môn không phải trình duyệt đầy đủ nên bài này không dựng được ca nổ trung thực, và môn mình không chấm thứ mình không kiểm chứng được — phần thực hành XSS nằm ở việc về nhà, trên trình duyệt thật của bạn.',
    workedExample: {
      code: `import sqlite3
import hashlib

MUOI = "quan-cua-toi-2026"     # bài dùng muối cố định cho dễ chấm; thật thì mỗi người một muối

def bam(mat_khau):
    # pbkdf2 với 100.000 vòng: chậm có chủ đích để kẻ tấn công không thử hàng loạt được
    return hashlib.pbkdf2_hmac("sha256", mat_khau.encode(), MUOI.encode(), 100000).hex()

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE nguoi_dung (ten TEXT PRIMARY KEY, bam TEXT NOT NULL)")
db.execute("INSERT INTO nguoi_dung VALUES (?, ?)", ("chu_quan", bam("caphe123")))

def dang_nhap_YEU(ten, mat_khau):        # ghép chuỗi — ĐỪNG BAO GIỜ viết thế này
    cau = "SELECT ten FROM nguoi_dung WHERE ten = '" + ten + "' AND bam = '" + bam(mat_khau) + "'"
    return db.execute(cau).fetchone() is not None

def dang_nhap_CHAC(ten, mat_khau):       # tham số ? — câu lệnh và dữ liệu đi hai đường riêng
    d = db.execute(
        "SELECT ten FROM nguoi_dung WHERE ten = ? AND bam = ?", (ten, bam(mat_khau))
    ).fetchone()
    return d is not None

ke_gian = "chu_quan' --"                 # hai dấu gạch = "phần sau là ghi chu, bo qua"
print("Ban yeu  - ke gian vao duoc:", dang_nhap_YEU(ke_gian, "khong-biet-mat-khau"))
print("Ban chac - ke gian vao duoc:", dang_nhap_CHAC(ke_gian, "khong-biet-mat-khau"))
print("Ban chac - chu quan that:", dang_nhap_CHAC("chu_quan", "caphe123"))

# Và đây là thứ nằm trong CSDL — kẻ lấy được file cũng không đọc ra "caphe123":
print("Luu trong CSDL:", db.execute("SELECT bam FROM nguoi_dung").fetchone()[0][:16], "...")`,
      stdinLines: [],
    },
    predict: {
      code: `import hashlib

def bam_nhanh(mat_khau):
    return hashlib.sha256(mat_khau.encode()).hexdigest()

# Hai nguoi dung khac nhau, cung dat mat khau de doan
an = bam_nhanh("123456")
binh = bam_nhanh("123456")
print(an == binh)`,
      question: 'Băm bằng sha256 trần, hai người đặt cùng mật khẩu — in ra gì?',
      choices: ['True', 'False', 'None', 'Bao loi TypeError'],
      answerIndex: 0,
      explain:
        'In ra True: hai mã băm giống hệt nhau. Nghe thì hiển nhiên, nhưng hệ quả mới là vấn đề. Kẻ lấy được CSDL chỉ cần băm sẵn một triệu mật khẩu phổ biến MỘT LẦN, rồi dò xem mã băm nào trùng — mọi tài khoản dùng mật khẩu yếu vỡ cùng lúc. Thêm nữa, sha256 được thiết kế để chạy CỰC NHANH: một máy tầm thường thử được hàng tỷ mật khẩu mỗi giây. Muối làm mã băm của hai người khác nhau; pbkdf2/bcrypt/argon2 làm mỗi lần thử tốn thời gian. Thiếu một trong hai là mật khẩu người dùng vẫn ở thế hở.',
    },
    parsons: {
      prompt: 'Xếp lại hàm đăng nhập AN TOÀN — tham số ? và so mã băm, không so mật khẩu thô.',
      lines: [
        'def dang_nhap(ten, mat_khau):',
        '    d = db.execute(',
        '        "SELECT ten FROM nguoi_dung WHERE ten = ? AND bam = ?",',
        '        (ten, bam(mat_khau)),',
        '    ).fetchone()',
        '    return d is not None',
      ],
    },
    make: {
      prompt:
        'Viết phần đăng nhập cho trang quản trị của quán.\n\n1. Dùng đúng hàm bam(mat_khau) của ví dụ mẫu: pbkdf2_hmac("sha256", mat_khau, MUOI, 100000) rồi .hex(), với MUOI = "quan-cua-toi-2026".\n2. Dựng CSDL trong bộ nhớ với bảng nguoi_dung (ten TEXT PRIMARY KEY, bam TEXT NOT NULL) và nạp sẵn hai tài khoản: chu_quan / caphe123 và thu_ngan / tradasua. Trong CSDL chỉ được có MÃ BĂM, không có mật khẩu thô.\n3. Viết dang_nhap(ten, mat_khau) trả về True/False, dùng MỘT câu truy vấn kiểm cả tên lẫn mã băm, và bắt buộc dùng tham số ? — không ghép chuỗi.\n\nChương trình chính đọc 2 dòng input(): dòng 1 tên đăng nhập, dòng 2 mật khẩu. Rồi in đúng hai dòng:\nMa bam chu quan: <16 ky tu dau cua ma bam mat khau chu_quan>\nDang nhap: OK        (hoặc "Dang nhap: TU CHOI" nếu sai)\n\nCó ca kiểm đưa vào ô tên một chuỗi tấn công thật. Ghép chuỗi thì nó vào được, và bạn sẽ thấy ngay ca đó đỏ.',
      starterCode: `import sqlite3
import hashlib

MUOI = "quan-cua-toi-2026"


def bam(mat_khau):
    # pbkdf2_hmac("sha256", ...) 100000 vòng, trả về chuỗi hex
    ...


db = sqlite3.connect(":memory:")
# Tạo bảng nguoi_dung rồi nạp hai tài khoản (chỉ lưu MÃ BĂM)


def dang_nhap(ten, mat_khau):
    # MỘT câu truy vấn, dùng tham số ?
    ...


ten = input("Ten dang nhap: ")
mat_khau = input("Mat khau: ")
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['chu_quan', 'caphe123'],
          expected: 'Dang nhap: OK',
          match: 'contains',
          hidden: false,
          label: 'Chủ quán với mật khẩu đúng — phải vào được',
        },
        {
          stdinLines: ['chu_quan', 'caphe123'],
          expected: 'Ma bam chu quan: a60c3d314529832c',
          match: 'contains',
          hidden: false,
          label: 'Mã băm đúng tham số (muối + 100.000 vòng) — sai một tham số là lệch hẳn',
        },
        {
          stdinLines: ['chu_quan', 'caphe124'],
          expected: 'Dang nhap: TU CHOI',
          match: 'contains',
          hidden: false,
          label: 'Sai mật khẩu một ký tự — phải từ chối',
        },
        {
          stdinLines: ["chu_quan' --", 'khong-biet-mat-khau'],
          expected: 'Dang nhap: TU CHOI',
          match: 'contains',
          hidden: false,
          label: 'TẤN CÔNG THẬT: ghép chuỗi thì ca này vào được, dùng tham số ? thì bị chặn',
        },
        {
          stdinLines: ['khong_co_nguoi_nay', 'gi cung duoc'],
          expected: 'Dang nhap: TU CHOI',
          match: 'contains',
          hidden: false,
          label: 'Tài khoản không tồn tại — từ chối êm, không nổ TypeError vì fetchone() là None',
        },
        {
          stdinLines: ['thu_ngan', 'tradasua'],
          expected: 'Dang nhap: OK',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: tài khoản thứ hai cũng phải vào được (không hardcode một tên)',
        },
        {
          stdinLines: ["' OR 1=1 --", 'x'],
          expected: 'Dang nhap: TU CHOI',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: biến thể tấn công khác cũng phải bị chặn',
        },
      ],
      hints: [
        'Tham số của execute là một TUPLE, và tuple một phần tử phải có dấu phẩy: (ten,) chứ không phải (ten). Thiếu dấu phẩy là Python hiểu thành chuỗi và báo lỗi số tham số.',
        'fetchone() trả về None khi không có dòng nào — nên kiểm bằng "is not None" trước khi đụng vào phần tử. Đây là chỗ ca "tài khoản không tồn tại" hay nổ TypeError.',
        'pbkdf2_hmac nhận BYTES chứ không nhận chuỗi: phải .encode() cả mật khẩu lẫn muối, rồi .hex() kết quả. Sai một tham số (số vòng, muối) thì mã băm lệch hoàn toàn và ca kiểm mã băm sẽ đỏ.',
        'Đề yêu cầu MỘT câu truy vấn kiểm cả tên lẫn mã băm: WHERE ten = ? AND bam = ?. Tách làm hai bước (tra tên trước, so mã băm sau bằng Python) cũng an toàn, nhưng ca tấn công sẽ không còn dạy được điều gì cho bạn.',
        'Khung tham chiếu cho phần in:\n\nprint(f"Ma bam chu quan: {bam(\'caphe123\')[:16]}")\nprint("Dang nhap:", "OK" if dang_nhap(ten, mat_khau) else "TU CHOI")',
      ],
      sampleSolution: `import sqlite3
import hashlib

MUOI = "quan-cua-toi-2026"


def bam(mat_khau):
    # Chậm có chủ đích: 100.000 vòng để kẻ tấn công không dò hàng loạt được
    return hashlib.pbkdf2_hmac("sha256", mat_khau.encode(), MUOI.encode(), 100000).hex()


db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE nguoi_dung (ten TEXT PRIMARY KEY, bam TEXT NOT NULL)")
for ten_tk, mk in [("chu_quan", "caphe123"), ("thu_ngan", "tradasua")]:
    db.execute("INSERT INTO nguoi_dung VALUES (?, ?)", (ten_tk, bam(mk)))   # chỉ lưu mã băm
db.commit()


def dang_nhap(ten, mat_khau):
    # Dấu ? -> câu lệnh và dữ liệu đi HAI đường riêng, chuỗi người dùng gõ
    # không bao giờ được đọc như lệnh nữa.
    d = db.execute(
        "SELECT ten FROM nguoi_dung WHERE ten = ? AND bam = ?",
        (ten, bam(mat_khau)),
    ).fetchone()
    return d is not None


ten = input("Ten dang nhap: ")
mat_khau = input("Mat khau: ")

print(f"Ma bam chu quan: {bam('caphe123')[:16]}")
print("Dang nhap:", "OK" if dang_nhap(ten, mat_khau) else "TU CHOI")`,
    },
    homework:
      'Hai việc trên máy thật của bạn.\n\n(1) Đổi hàm dang_nhap sang bản ghép chuỗi, chạy lại với tên "chu_quan\' --" và xem nó cho bạn vào. Đây là lần duy nhất bạn nên viết code đó — để không bao giờ quên cảm giác này.\n\n(2) XSS: mở một trang HTML trống, thêm một ô nhập và một nút. Bản một: nút gán ket_qua.innerHTML = o_nhap.value. Bản hai: gán ket_qua.textContent = o_nhap.value. Gõ vào ô này: <img src=x onerror="alert(1)"> rồi bấm cả hai bản. Bản nào bật hộp thoại? Bản nào hiện ra đúng dòng chữ bạn gõ? Ghi lại — đó là toàn bộ XSS trong một thí nghiệm 2 phút.',
    srsCards: [
      {
        hoi: 'Cách vá SQL injection ĐÚNG là gì?',
        dap: 'Dùng tham số (dấu ? hoặc :ten) để câu lệnh và dữ liệu đi hai đường riêng, không bao giờ ghép chuỗi. Lọc dấu nháy là cách sai — luôn còn biến thể mã hoá mà bộ lọc chưa biết.',
      },
      {
        hoi: 'Vì sao không được lưu mật khẩu dưới dạng thô?',
        dap: 'Vì CSDL rồi sẽ có ngày bị lộ (sao lưu để nhầm chỗ, lỗ hổng khác, nhân viên cũ), và người dùng hay dùng lại mật khẩu — lộ mật khẩu ở quán bạn là lộ luôn email của họ. Chỉ lưu mã băm.',
      },
      {
        hoi: 'Muối (salt) giải quyết vấn đề gì?',
        dap: 'Nó làm mã băm của hai người cùng mật khẩu khác nhau, nên kẻ tấn công không dùng được bảng mã băm dựng sẵn để tra ngược hàng loạt. Muối không cần bí mật, chỉ cần mỗi người mỗi khác.',
      },
      {
        hoi: 'Vì sao không dùng sha256 hay md5 để băm mật khẩu?',
        dap: 'Vì chúng được thiết kế để chạy cực nhanh, nghĩa là kẻ tấn công thử được hàng tỷ mật khẩu mỗi giây. Mật khẩu cần hàm chậm có chủ đích: pbkdf2 nhiều vòng, bcrypt hoặc argon2.',
      },
    ],
  },
]
