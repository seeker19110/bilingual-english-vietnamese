// lessons/p6u15.ts — Bài học P6-U15: PARADIGM S — THIẾT KẾ HỆ THỐNG & TƯ DUY KỸ SƯ (PR-M11).
//
// Trụ thứ ba, khép cụm paradigm và cả chương trình M phần nội dung. Dạy: ước lượng số lớn ·
// cache · hàng đợi · quan sát được · PHÂN TÍCH SỰ CỐ · gọi tên đánh đổi.
//
// Dự án lồng trong bài (hiến chương §7) chỉ định RÕ: "phân tích một sự cố có thật — dùng ngay
// hồ sơ sự cố của chính dự án này (docs/ke-hoach-khoi-phuc-su-co-server.md) — và viết
// post-mortem". Bài l2 dùng đúng sự cố 2026-07-30 (auto-deploy hỏng, BA lỗi độc lập xếp chồng)
// và đúng khuôn post-mortem 6 ô ở mục 5 của tài liệu đó.
//
// NGÔN NGỮ: Python — tầng 3 không thêm ngôn ngữ mới, nên bài đi qua `lessonsPython.test.ts`.
//
// LƯU Ý SOẠN BÀI (rút ra từ M9/M10, đừng lặp lại): đáp án `predict` phải là CHUỖI CON của output
// thật (cổng Python kiểm); `parsons.lines` không được có chuỗi rỗng; trong `theory` tránh code
// span dính dấu câu hoặc lồng trong **đậm** — cổng lessonMarkdown bắt cả hai.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U15_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u15-l1',
    unitId: 'p6-u15',
    language: 'python',
    title: 'Ước lượng số lớn và gọi tên đánh đổi',
    hook: 'Người phỏng vấn hỏi: "Hệ thống này chịu được bao nhiêu người dùng?" Câu trả lời tệ nhất không phải một con số sai — mà là "em không biết". Kỹ sư giỏi rút giấy ra, ước lượng trong hai phút, rồi nói rõ mình đã giả định những gì.',
    theory:
      'ƯỚC LƯỢNG SỐ LỚN (back-of-envelope) không phải đoán bừa. Nó là một phép tính có kỷ luật, dùng số tròn, và mục tiêu là **đúng bậc độ lớn** — biết thứ này cỡ nghìn hay cỡ triệu, chứ không phải chính xác từng đơn vị.\n\nVÌ SAO ĐÁNG GIÁ: nó cho bạn biết TRƯỚC khi viết code rằng thiết kế này có khả thi không. Ước lượng ra 50 GB mỗi ngày thì bạn biết ngay không thể để mọi thứ trong RAM — và bạn biết điều đó trong hai phút, không phải sau hai tháng.\n\nBỐN CON SỐ NÊN THUỘC, đủ cho phần lớn ước lượng:\n    1 ngày         ≈ 86.400 giây (nhớ tròn: ~100 nghìn)\n    1 triệu bản ghi × 1 KB  = 1 GB\n    Đọc RAM        ~ nano giây · Đọc SSD ~ micro giây · Đi mạng trong nước ~ mili giây\n    Chênh lệch RAM và mạng: khoảng một TRIỆU lần\n\nDòng cuối là dòng quan trọng nhất, và nó giải thích gần hết mọi quyết định kiến trúc bạn sẽ gặp.\n\nMẪU ƯỚC LƯỢNG BỐN BƯỚC:\n① Bao nhiêu người dùng, mỗi người bao nhiêu lần mỗi ngày → số việc mỗi ngày.\n② Chia cho 86.400 → số việc mỗi giây (trung bình).\n③ Nhân 2 tới 10 lần → giờ cao điểm (lưu lượng không bao giờ trải đều).\n④ Mỗi việc tốn bao nhiêu byte → dung lượng mỗi ngày, mỗi năm.\n\nVí dụ: 10.000 người học, mỗi người 50 lượt chấm bài mỗi ngày.\n    ① 10.000 × 50 = 500.000 lượt/ngày\n    ② 500.000 / 86.400 ≈ 6 lượt/giây\n    ③ cao điểm ≈ 6 × 5 = 30 lượt/giây\n    ④ mỗi lượt lưu 2 KB → 1 GB/ngày → ~365 GB/năm\nHai phút, và bạn đã biết: 30 lượt/giây thì một máy chủ thường lo được; nhưng 365 GB/năm thì phải nghĩ về lưu trữ ngay từ bây giờ.\n\nBA CÔNG CỤ, và cái giá của từng cái. Điểm chung: **không cái nào miễn phí** — mỗi cái đổi một vấn đề lấy một vấn đề khác:\n\n| Công cụ | Giải quyết | Cái giá phải trả |\n| --- | --- | --- |\n| Cache | Đọc chậm, đọc lặp lại | Dữ liệu CŨ. Phải trả lời được "cũ bao lâu thì chấp nhận được" và "khi nào xoá" |\n| Hàng đợi | Việc chậm làm nghẽn phản hồi | Việc thành BẤT ĐỒNG BỘ. Người dùng không biết xong chưa; phải xử lý việc hỏng và thử lại |\n| Phân mảnh | Một máy chứa không nổi | Truy vấn xuyên mảnh rất khó. Chọn sai khoá chia là phải làm lại |\n\nCÂU HỎI CHUẨN VỀ CACHE — hỏi đúng hai câu này là tránh được phần lớn lỗi: *dữ liệu cũ bao lâu thì người dùng chấp nhận được?* và *cái gì làm nó hết hiệu lực?* Không trả lời được câu hai thì bạn chưa có cache, bạn có một cái bẫy.\n\nGỌI TÊN ĐÁNH ĐỔI — thói quen phân biệt kỹ sư với người viết code. Không có phương án "tốt nhất", chỉ có phương án tốt hơn CHO TIÊU CHÍ NÀO. Nên câu trả lời tử tế luôn có ba phần: **chọn gì · được gì · mất gì**. Ví dụ: "Chọn thêm cache Redis — được: giảm tải database khi cao điểm; mất: dữ liệu có thể cũ tới 60 giây, và thêm một thứ nữa có thể sập."\n\nQUAN SÁT ĐƯỢC (observability) — thứ người tự học hay thiếu nhất. Hệ thống chạy được chưa đủ; phải **nhìn thấy** nó đang làm gì. Ba tầng, theo thứ tự nên có: **log** (chuyện gì đã xảy ra) → **số đo** (bao nhiêu, nhanh chậm thế nào) → **cảnh báo** (ai đó phải biết NGAY). Thiếu tầng ba là kiểu hỏng tệ nhất: hệ thống chết mà không ai hay — đúng như sự cố có thật mà bài sau sẽ mổ xẻ.',
    workedExample: {
      code: `# Ước lượng bốn bước — hàm THUẦN, nên kiểm được bằng assert (đúng bài trụ F)
GIAY_MOI_NGAY = 86400


def uoc_luong(so_nguoi, luot_moi_nguoi, kb_moi_luot, he_so_cao_diem=5):
    moi_ngay = so_nguoi * luot_moi_nguoi
    trung_binh = moi_ngay / GIAY_MOI_NGAY
    cao_diem = trung_binh * he_so_cao_diem
    gb_moi_ngay = moi_ngay * kb_moi_luot / 1_000_000     # 1 triệu KB = 1 GB
    return {
        "moi_ngay": moi_ngay,
        "moi_giay": round(trung_binh),
        "cao_diem": round(cao_diem),
        "gb_moi_ngay": round(gb_moi_ngay, 1),
        "gb_moi_nam": round(gb_moi_ngay * 365),
    }


kq = uoc_luong(10_000, 50, 2)
print("luot/ngay:", kq["moi_ngay"])
print("luot/giay:", kq["moi_giay"])
print("cao diem :", kq["cao_diem"])
print("GB/ngay  :", kq["gb_moi_ngay"])
print("GB/nam   :", kq["gb_moi_nam"])

# Đổi MỘT giả định thì kết luận đổi theo — nên giả định phải nói ra, không giấu
gap_10 = uoc_luong(100_000, 50, 2)
print("gap 10 lan nguoi dung -> cao diem:", gap_10["cao_diem"])

assert uoc_luong(86_400, 1, 1)["moi_giay"] == 1
print("tu kiem: dat")`,
      stdinLines: [],
    },
    predict: {
      code: `GIAY_MOI_NGAY = 86400

so_luot = 8_640_000
moi_giay = so_luot / GIAY_MOI_NGAY
cao_diem = moi_giay * 5

print(round(moi_giay), round(cao_diem))`,
      question: 'Đoạn này in ra gì?',
      choices: ['100 500', '86 430', '100 100', '1000 5000'],
      answerIndex: 0,
      explain:
        '8.640.000 chia 86.400 đúng bằng 100 lượt mỗi giây, nhân hệ số cao điểm 5 ra 500. Đây là lý do nên nhớ 86.400: nó biến "mấy triệu lượt một ngày" thành một con số bạn cảm nhận được ngay. Và nhớ luôn bước ③ — lưu lượng không bao giờ trải đều, nên con số trung bình một mình luôn lạc quan quá mức.',
    },
    parsons: {
      prompt: 'Xếp các dòng: ước lượng số lượt mỗi giây rồi nhân hệ số cao điểm.',
      lines: [
        'GIAY_MOI_NGAY = 86400',
        'moi_ngay = 10000 * 50',
        'moi_giay = moi_ngay / GIAY_MOI_NGAY',
        'cao_diem = moi_giay * 5',
        'print(round(cao_diem))',
      ],
    },
    make: {
      prompt:
        'Ước lượng cho tính năng "chấm phát âm" của một app học tiếng Anh.\n\nGiả định (dùng đúng các số này):\n- 50.000 người học, mỗi người 20 lượt chấm mỗi ngày\n- Mỗi lượt lưu 5 KB (đoạn ghi âm đã nén + kết quả chấm)\n- Hệ số cao điểm: 4\n\n1. Viết hàm THUẦN `uoc_luong(so_nguoi, luot_moi_nguoi, kb_moi_luot, he_so)` trả về tuple ba phần: `(luot_moi_ngay, luot_moi_giay_cao_diem, gb_moi_nam)`.\n   - `luot_moi_giay_cao_diem` = (lượt mỗi ngày / 86400) × hệ số, làm tròn bằng `round`\n   - `gb_moi_nam` = lượt mỗi ngày × KB mỗi lượt / 1000000 × 365, làm tròn bằng `round`\n\n2. In đúng ba dòng:\nLuot/ngay: 1000000\nCao diem: 46\nGB/nam: 1825',
      starterCode: `GIAY_MOI_NGAY = 86400


def uoc_luong(so_nguoi, luot_moi_nguoi, kb_moi_luot, he_so):
    ...


# in 3 dong theo de
`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Luot/ngay: 1000000',
          match: 'contains',
          hidden: false,
          label: '50.000 × 20',
        },
        {
          stdinLines: [],
          expected: 'Cao diem: 46',
          match: 'contains',
          hidden: false,
          label: '1 triệu / 86400 × 4',
        },
        {
          stdinLines: [],
          expected: 'GB/nam: 1825',
          match: 'contains',
          hidden: false,
          label: '5 KB mỗi lượt, cả năm',
        },
      ],
      hints: [
        'Lượt mỗi ngày = số người × lượt mỗi người. Với số liệu đề bài là đúng 1.000.000.',
        'Cao điểm = (lượt mỗi ngày / 86400) × hệ số. Chia trước, nhân sau, rồi mới `round`.',
        'Dung lượng: 1 triệu KB = 1 GB, nên chia cho 1000000 rồi nhân 365 để ra cả năm.',
        'Trả nhiều giá trị bằng tuple, rồi mở ra: `a, b, c = uoc_luong(...)`.',
      ],
      sampleSolution: `GIAY_MOI_NGAY = 86400


def uoc_luong(so_nguoi, luot_moi_nguoi, kb_moi_luot, he_so):
    moi_ngay = so_nguoi * luot_moi_nguoi
    cao_diem = round(moi_ngay / GIAY_MOI_NGAY * he_so)
    gb_moi_nam = round(moi_ngay * kb_moi_luot / 1_000_000 * 365)
    return (moi_ngay, cao_diem, gb_moi_nam)


moi_ngay, cao_diem, gb_moi_nam = uoc_luong(50_000, 20, 5, 4)
print("Luot/ngay:", moi_ngay)
print("Cao diem:", cao_diem)
print("GB/nam:", gb_moi_nam)`,
    },
    homework:
      'Chọn một tính năng bạn đang dùng hằng ngày (nhắn tin, xem video, đặt xe) và ước lượng nó theo bốn bước. Rồi làm phần quan trọng hơn: **viết ra các giả định của bạn thành một danh sách**, và với mỗi giả định, hỏi "nếu con số này sai gấp 10 lần thì kết luận có đổi không?". Giả định nào đổi kết luận thì đó chính là chỗ bạn cần đi tìm số thật. Đó là toàn bộ nghệ thuật của ước lượng: không phải đoán đúng, mà là biết chỗ nào việc đoán sai sẽ gây hại.',
    srsCards: [
      {
        hoi: 'Mục tiêu của ước lượng số lớn là gì?',
        dap: 'Đúng BẬC ĐỘ LỚN (cỡ nghìn hay cỡ triệu), không phải chính xác từng đơn vị. Để biết thiết kế có khả thi không TRƯỚC khi viết code.',
      },
      {
        hoi: 'Vì sao phải nhân hệ số cao điểm sau khi tính trung bình mỗi giây?',
        dap: 'Vì lưu lượng không bao giờ trải đều trong ngày. Con số trung bình một mình luôn lạc quan quá mức; thường nhân 2 đến 10 lần.',
      },
      {
        hoi: 'Hai câu hỏi bắt buộc trước khi thêm một cache?',
        dap: 'Dữ liệu cũ bao lâu thì người dùng chấp nhận được, và cái gì làm nó hết hiệu lực. Không trả lời được câu hai thì đó không phải cache mà là một cái bẫy.',
      },
      {
        hoi: 'Một câu trả lời tử tế về đánh đổi gồm mấy phần?',
        dap: 'Ba: chọn gì, được gì, mất gì. Không có phương án "tốt nhất", chỉ có tốt hơn cho một tiêu chí cụ thể.',
      },
    ],
  },
  {
    id: 'p6-u15-l2',
    unitId: 'p6-u15',
    language: 'python',
    title: 'Phân tích sự cố và viết post-mortem — dự án khép cụm paradigm',
    hook: 'Ngày 30/07/2026, auto-deploy của chính dự án này hỏng năm lần liên tiếp mà không ai hay. Sửa xong lỗi thứ nhất thì lộ ra lỗi thứ hai; sửa xong lỗi thứ hai lại lộ ra lỗi thứ ba. Bài này mổ xẻ đúng sự cố đó — vì nó dạy được thứ mà sự cố bịa ra không dạy nổi.',
    theory:
      'LUẬT SỐ MỘT CỦA PHÂN TÍCH SỰ CỐ: **lỗi bạn nhìn thấy là lớp NGOÀI CÙNG, không phải nguyên nhân.** Sửa nó xong, rất hay lộ ra lớp tiếp theo.\n\nSỰ CỐ CÓ THẬT của dự án này (hồ sơ đầy đủ ở tệp kế hoạch khôi phục sự cố, mục 7) — 30/07/2026, auto-deploy hỏng liên tục sau khi VPS đổi IP hôm trước. **Ba lỗi ĐỘC LẬP xếp chồng**, phải xử lý tuần tự mới thấy hết:\n\n① Secret VPS_HOST vẫn trỏ IP cũ → lỗi hết giờ kết nối. Sửa xong, chạy lại...\n② ...lộ ra khoá SSH trong secret sai định dạng → lỗi "không tìm thấy khoá". Sửa xong, chạy lại...\n③ ...lộ ra tài khoản database không có quyền tạo bảng trên schema public. **Lỗi này đã CÓ SẴN từ hôm dựng VPS**, chỉ chưa lộ vì trước đó chưa qua nổi bước SSH.\n\nBA BÀI HỌC RÚT RA, đáng giá hơn cả cách sửa:\n\n**1. Lỗi thứ ba nằm đó từ đầu.** Nó chỉ hiện ra khi hai lỗi trước được dọn. Nên đừng bao giờ tuyên bố "đã sửa xong" sau khi vá một lỗi — hãy CHẠY LẠI và xem nó báo gì tiếp.\n\n**2. Thông điệp lỗi ĐỔI thì hướng điều tra cũng phải đổi.** Lỗi hết giờ kết nối nghĩa là không tới được máy; lỗi xác thực nhanh gần như tức thì nghĩa là tới được rồi nhưng bị từ chối. Hai câu đó chỉ về hai chỗ hoàn toàn khác nhau. Đọc kỹ thông điệp lỗi tiết kiệm hàng giờ.\n\n**3. Cái hỏng tệ nhất là cái hỏng IM LẶNG.** Năm lần deploy thất bại liên tiếp mà không ai biết, vì không có cảnh báo chủ động. Đây chính là tầng thứ ba của quan sát được ở bài trước — thiếu nó thì hệ thống chết mà không ai hay.\n\nNGUYÊN NHÂN GỐC KHÁC TRIỆU CHỨNG. "Deploy hỏng" là triệu chứng. "Secret trỏ IP cũ" cũng vẫn là triệu chứng. Nguyên nhân gốc là: **đổi IP VPS không có danh sách kiểm những nơi cần cập nhật theo.** Cách phân biệt rẻ nhất là hỏi "vì sao" khoảng năm lần, tới khi câu trả lời chuyển từ MỘT THỨ HỎNG sang MỘT QUY TRÌNH THIẾU. Dừng quá sớm thì bạn sửa được lần này và gặp lại y hệt lần sau.\n\nKHÔNG ĐỔ LỖI CHO NGƯỜI (blameless). Không phải vì lịch sự, mà vì hiệu quả: hỏi "ai quên cập nhật secret" thì lần sau người ta giấu lỗi. Hỏi "vì sao hệ thống cho phép chuyện đó xảy ra mà không ai biết" thì bạn tìm ra thứ sửa được. **Người sai thì sửa được một lần; quy trình sai thì sửa được mãi mãi.**\n\nKHUÔN POST-MORTEM của dự án này — sáu ô, không hơn (dự án nhỏ, quy trình nặng thì không ai viết):\n\n    Sự cố                   — mô tả ngắn\n    Thời gian               — bắt đầu → khôi phục xong, tổng downtime\n    Nguyên nhân gốc         — vì sao xảy ra, KHÔNG chỉ triệu chứng\n    Đã làm gì để khôi phục  — các bước đã chạy thật\n    Có mất dữ liệu không    — có/không, phạm vi nếu có\n    Cách ngăn tái diễn      — đổi code/cấu hình/quy trình gì\n\nÔ cuối là ô dễ viết qua loa nhất và cũng là ô DUY NHẤT tạo ra giá trị lâu dài. Năm ô trên kể lại quá khứ; chỉ ô thứ sáu thay đổi tương lai. Nếu ô sáu chỉ ghi "cẩn thận hơn" thì coi như bỏ trống — nó phải là một thay đổi CỤ THỂ mà ai đó kiểm được là đã làm hay chưa.',
    workedExample: {
      code: `# Mô hình hoá sự cố THẬT ngày 30/07/2026 của dự án này: ba lỗi độc lập xếp chồng.
# Mỗi lần sửa một lớp, chạy lại, và lớp tiếp theo mới lộ ra.
CAC_LOP = [
    ("VPS_HOST tro IP cu", "dial tcp: i/o timeout"),
    ("VPS_SSH_KEY sai dinh dang", "ssh: no key found"),
    ("tutor_app thieu quyen schema public", "permission denied for schema public"),
]


def chay_deploy(da_sua):
    """Trả về lỗi ĐẦU TIÊN chưa được sửa — đúng cách sự cố thật diễn ra."""
    for ten, thong_diep in CAC_LOP:
        if ten not in da_sua:
            return thong_diep
    return "success"


da_sua = set()
lan = 1
while True:
    kq = chay_deploy(da_sua)
    print(f"lan {lan}: {kq}")
    if kq == "success":
        break
    # sửa đúng lớp vừa lộ ra, rồi CHẠY LẠI — không tuyên bố xong sớm
    ten_lop = next(t for t, m in CAC_LOP if m == kq)
    da_sua.add(ten_lop)
    lan += 1

print("so lan phai chay lai:", lan)


def tinh_downtime(bat_dau, ket_thuc):
    """'14:05' -> '15:10' = 65 phút. Hàm thuần, kiểm được bằng assert."""
    gio_d, phut_d = (int(x) for x in bat_dau.split(":"))
    gio_k, phut_k = (int(x) for x in ket_thuc.split(":"))
    return (gio_k * 60 + phut_k) - (gio_d * 60 + phut_d)


assert tinh_downtime("14:05", "15:10") == 65
print("downtime mau:", tinh_downtime("09:30", "10:00"), "phut")`,
      stdinLines: [],
    },
    predict: {
      code: `CAC_LOP = ["a", "b", "c"]


def chay(da_sua):
    for ten in CAC_LOP:
        if ten not in da_sua:
            return ten
    return "success"


da_sua = {"a"}
print(chay(da_sua))`,
      question: 'Đoạn này in ra gì?',
      choices: ['b', 'a', 'c', 'success'],
      answerIndex: 0,
      explain:
        'Lớp "a" đã được sửa nên bị bỏ qua, và hàm trả về lớp CHƯA sửa đầu tiên là "b". Đó đúng là cách sự cố nhiều lớp lộ ra: bạn chỉ nhìn thấy MỘT lỗi tại một thời điểm, và lỗi tiếp theo chỉ hiện ra sau khi lỗi trước được dọn. Vì thế không bao giờ tuyên bố "đã sửa xong" mà chưa chạy lại.',
    },
    parsons: {
      prompt: 'Xếp các dòng: tính downtime theo phút từ hai mốc giờ dạng HH:MM.',
      lines: [
        'def tinh_downtime(bat_dau, ket_thuc):',
        '    gio_d, phut_d = (int(x) for x in bat_dau.split(":"))',
        '    gio_k, phut_k = (int(x) for x in ket_thuc.split(":"))',
        '    return (gio_k * 60 + phut_k) - (gio_d * 60 + phut_d)',
        'print(tinh_downtime("14:05", "15:10"))',
      ],
    },
    make: {
      prompt:
        'DỰ ÁN KHÉP CỤM PARADIGM — công cụ soát post-mortem.\n\nDùng đúng khuôn sáu ô của dự án này. Viết:\n\n1. `SAU_O` — danh sách sáu tên ô, đúng thứ tự:\n   `su_co`, `thoi_gian`, `nguyen_nhan_goc`, `da_lam_gi`, `mat_du_lieu`, `ngan_tai_dien`\n\n2. `o_con_thieu(bao_cao)` — hàm THUẦN nhận một dict, trả về danh sách tên ô bị THIẾU hoặc để RỖNG (chuỗi rỗng, hoặc chỉ toàn dấu cách), giữ đúng thứ tự của `SAU_O`.\n\n3. `tinh_downtime(bat_dau, ket_thuc)` — nhận hai chuỗi dạng `HH:MM`, trả về số phút.\n\n4. Với báo cáo dưới đây (cố tình thiếu ô cuối và bỏ trống ô nguyên nhân gốc):\n```\nbao_cao = {\n    "su_co": "Auto-deploy hong 5 lan lien tiep",\n    "thoi_gian": "14:05 -> 15:10",\n    "nguyen_nhan_goc": "   ",\n    "da_lam_gi": "Sua secret, tao khoa CI, cap quyen schema",\n    "mat_du_lieu": "Khong",\n}\n```\n   In đúng ba dòng:\nThieu: [\'nguyen_nhan_goc\', \'ngan_tai_dien\']\nDowntime: 65 phut\nDat chuan: False',
      starterCode: `SAU_O = [...]


def o_con_thieu(bao_cao):
    ...


def tinh_downtime(bat_dau, ket_thuc):
    ...


bao_cao = {
    "su_co": "Auto-deploy hong 5 lan lien tiep",
    "thoi_gian": "14:05 -> 15:10",
    "nguyen_nhan_goc": "   ",
    "da_lam_gi": "Sua secret, tao khoa CI, cap quyen schema",
    "mat_du_lieu": "Khong",
}
# in 3 dong theo de
`,
      testCases: [
        {
          stdinLines: [],
          expected: "Thieu: ['nguyen_nhan_goc', 'ngan_tai_dien']",
          match: 'contains',
          hidden: false,
          label: 'ô rỗng và ô vắng mặt đều tính là thiếu',
        },
        {
          stdinLines: [],
          expected: 'Downtime: 65 phut',
          match: 'contains',
          hidden: false,
          label: '14:05 → 15:10',
        },
        {
          stdinLines: [],
          expected: 'Dat chuan: False',
          match: 'contains',
          hidden: false,
          label: 'còn ô thiếu thì chưa đạt',
        },
      ],
      hints: [
        'Ô "thiếu" gồm HAI trường hợp: không có khoá trong dict, và có khoá nhưng giá trị rỗng. Dùng `bao_cao.get(ten, "")` để gộp cả hai.',
        'Chuỗi chỉ toàn dấu cách cũng coi là rỗng — dùng `.strip()` trước khi kiểm.',
        'Giữ đúng thứ tự bằng cách duyệt `SAU_O`, không duyệt dict: `[t for t in SAU_O if not bao_cao.get(t, "").strip()]`.',
        'Downtime: đổi cả hai mốc sang phút rồi trừ. `gio * 60 + phut`.',
        '"Đạt chuẩn" nghĩa là danh sách thiếu RỖNG: `len(o_con_thieu(bao_cao)) == 0`.',
      ],
      sampleSolution: `SAU_O = [
    "su_co",
    "thoi_gian",
    "nguyen_nhan_goc",
    "da_lam_gi",
    "mat_du_lieu",
    "ngan_tai_dien",
]


def o_con_thieu(bao_cao):
    return [ten for ten in SAU_O if not bao_cao.get(ten, "").strip()]


def tinh_downtime(bat_dau, ket_thuc):
    gio_d, phut_d = (int(x) for x in bat_dau.split(":"))
    gio_k, phut_k = (int(x) for x in ket_thuc.split(":"))
    return (gio_k * 60 + phut_k) - (gio_d * 60 + phut_d)


bao_cao = {
    "su_co": "Auto-deploy hong 5 lan lien tiep",
    "thoi_gian": "14:05 -> 15:10",
    "nguyen_nhan_goc": "   ",
    "da_lam_gi": "Sua secret, tao khoa CI, cap quyen schema",
    "mat_du_lieu": "Khong",
}

thieu = o_con_thieu(bao_cao)
print("Thieu:", thieu)
print("Downtime:", tinh_downtime("14:05", "15:10"), "phut")
print("Dat chuan:", len(thieu) == 0)`,
    },
    homework:
      'Viết một post-mortem THẬT, sáu ô, cho một sự cố bạn từng gặp — máy tính hỏng lúc sắp nộp bài, mất file, deploy hỏng, bất cứ thứ gì có thật. Hai yêu cầu khó: (1) ở ô "nguyên nhân gốc", hỏi "vì sao" cho tới khi câu trả lời là một QUY TRÌNH THIẾU chứ không phải một thứ hỏng hay một người quên; (2) ở ô "cách ngăn tái diễn", viết một thay đổi CỤ THỂ mà người khác kiểm được là đã làm hay chưa — "cẩn thận hơn" thì không tính. Nếu muốn xem một bản mẫu viết thật, đọc mục 7 của tệp kế hoạch khôi phục sự cố trong kho mã dự án này: hai sự cố có thật, ghi đủ sáu ô, kể cả những chỗ làm chưa tốt.',
    srsCards: [
      {
        hoi: 'Luật số một khi phân tích một sự cố?',
        dap: 'Lỗi bạn nhìn thấy là lớp NGOÀI CÙNG, không phải nguyên nhân. Sửa xong một lớp phải CHẠY LẠI, vì lớp tiếp theo thường chỉ lộ ra sau đó.',
      },
      {
        hoi: 'Vì sao thông điệp lỗi đổi thì hướng điều tra phải đổi?',
        dap: 'Vì mỗi thông điệp chỉ về một chỗ khác nhau: hết giờ kết nối nghĩa là không tới được máy; xác thực hỏng gần như tức thì nghĩa là tới được rồi nhưng bị từ chối.',
      },
      {
        hoi: 'Vì sao post-mortem không đổ lỗi cho người?',
        dap: 'Không phải vì lịch sự mà vì hiệu quả: hỏi "ai quên" thì lần sau người ta giấu lỗi. Người sai sửa được một lần; quy trình sai sửa được mãi mãi.',
      },
      {
        hoi: 'Ô nào trong post-mortem tạo ra giá trị lâu dài, và điều kiện để nó có giá trị?',
        dap: 'Ô "cách ngăn tái diễn". Năm ô kia kể lại quá khứ, chỉ ô này thay đổi tương lai — và nó phải là thay đổi CỤ THỂ, kiểm được là đã làm hay chưa, chứ không phải "cẩn thận hơn".',
      },
    ],
  },
]
