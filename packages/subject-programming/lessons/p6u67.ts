// lessons/p6u67.ts — P6-U67: HƯỚNG DỮ LIỆU, chặng S1 — Làm sạch dữ liệu (module `data-s1-m2`).
//
// Module này nằm giữa "SQL phân tích" (data-s1-m1) và "Thống kê đủ dùng" (data-s1-m3): trước
// khi tính bất cứ con số thống kê nào, dữ liệu phải SẠCH — không thì mọi kết luận sau đó đều
// xây trên cát. Hai bài, đúng thứ tự việc thật làm:
//
// l1 PHÁT HIỆN 3 loại lỗi kinh điển (thiếu/trùng/sai kiểu) trên một bảng bản ghi kiểu dict —
// nhấn mạnh trùng lặp phải so theo KHOÁ TỰ NHIÊN chứ không so nguyên cả dict, vì một trường phụ
// lệch nhau (giá cập nhật, thời điểm ghi) không có nghĩa là hai bản ghi khác nhau.
//
// l2 CHUẨN HOÁ ngày giờ về một định dạng duy nhất (ISO), và khép lại bằng nguyên tắc quan
// trọng nhất của làm sạch dữ liệu: MỌI quyết định sửa/loại bỏ phải GHI LẠI thành log kiểm
// được — không âm thầm sửa, vì người đọc báo cáo sau này (hoặc chính mình 3 tháng sau) phải
// truy lại được vì sao một con số lại khác với dữ liệu gốc.
//
// Cả hai dùng làn `python` thuần, chấm bằng cổng python3 thật (lessonsPython.test.ts). Cả hai
// bài đều đọc HẾT input rồi mới in kết quả ở cuối (không xen kẽ input/print trong vòng lặp) —
// tránh bẫy dòng echo của input() giả lập chen vào giữa các dòng print() khi ghép expected
// nhiều dòng bằng \n.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U67_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u67-l1',
    unitId: 'p6-u67',
    language: 'python',
    title: 'Ba lỗi kinh điển: thiếu, trùng, sai kiểu',
    hook: 'Sếp hỏi "tháng này có bao nhiêu khách mới?". Bạn COUNT thẳng lên bảng, ra 1.204. Con số đẹp, nhưng sai — vì trong đó có 40 bản ghi trùng (khách bấm gửi form hai lần), 15 bản ghi thiếu số điện thoại (không tính là "khách" được), và vài dòng tuổi ghi "ba mươi" thay vì 30. Dữ liệu bẩn không báo lỗi khi chạy — nó chỉ âm thầm cho ra CON SỐ SAI mà không ai nghi ngờ.',
    theory:
      'Trước khi tính bất cứ thống kê nào, dữ liệu phải qua một vòng KIỂM 3 loại lỗi kinh điển:\n\n1. **THIẾU GIÁ TRỊ (missing)** — một trường quan trọng rỗng: `None`, chuỗi rỗng `""`, hoặc các quy ước đánh dấu thiếu như `"N/A"`, `"NULL"`. Ba dạng này đều là "thiếu" dù trông khác nhau — kiểm thiếu mà chỉ so `is None` sẽ bỏ sót hai dạng còn lại.\n\n2. **TRÙNG LẶP (duplicate)** — hai bản ghi thật ra là MỘT, chỉ khác cách ghi. Điểm dễ sai nhất: so trùng bằng cách so TOÀN BỘ dict (từng trường phải giống hệt) sẽ BỎ SÓT rất nhiều trùng lặp thật, vì một trường phụ (thời điểm ghi, giá vừa cập nhật) lệch nhau không có nghĩa là hai khách hàng khác nhau. Cách đúng: so theo **KHOÁ TỰ NHIÊN** — trường (hoặc tổ hợp trường) định danh duy nhất một thực thể trong đời thật (mã khách hàng, số CCCD, email). Gặp khoá đã thấy → bản ghi sau là bản trùng, không tính thêm.\n\n3. **SAI KIỂU (type error)** — giá trị đúng vị trí nhưng sai bản chất: chuỗi số ("ba mươi" thay vì 30) nằm trong cột lẽ ra phải là số, hoặc một trường LUÔN PHẢI DƯƠNG (tuổi, số tiền chi tiêu, số lượng) lại mang giá trị âm — dấu hiệu lỗi nhập liệu hoặc lỗi hệ thống, không phải giá trị hợp lệ.\n\nBa loại lỗi này ĐỘC LẬP với nhau: một bản ghi có thể vừa thiếu vừa sai kiểu; một bản ghi trùng thì KHÔNG cần kiểm hai lỗi kia nữa (nó sẽ bị loại/gộp, kiểm thêm chỉ tốn công và dễ đếm sai — bài Make dưới đây sẽ luyện đúng thói quen này: gặp trùng thì `continue` ngay, không kiểm tiếp).',
    workedExample: {
      code: `# Mo phong mot bang CSV da doc vao thanh list cac dict
BAN_GHI = [
    {"ma_kh": "KH01", "ten": "Nguyen An", "tuoi": 25, "chi_tieu": 150000},
    {"ma_kh": "KH02", "ten": "Tran Binh", "tuoi": None, "chi_tieu": 200000},
    {"ma_kh": "KH01", "ten": "Nguyen An", "tuoi": 25, "chi_tieu": 150000},  # trung KH01
    {"ma_kh": "KH03", "ten": "Le Cuong", "tuoi": "ba muoi", "chi_tieu": 90000},
    {"ma_kh": "KH04", "ten": "Pham Dung", "tuoi": 40, "chi_tieu": -50000},  # chi tieu am
    {"ma_kh": "KH05", "ten": "N/A", "tuoi": 22, "chi_tieu": 120000},
]


def kiem_thieu(bg):
    for truong in ("ma_kh", "ten", "tuoi", "chi_tieu"):
        gia_tri = bg.get(truong)
        if gia_tri is None or gia_tri == "" or gia_tri == "N/A":
            return True
    return False


def kiem_sai_kieu(bg):
    if isinstance(bg.get("tuoi"), str):          # tuoi phai la so, khong phai chuoi
        return True
    chi_tieu = bg.get("chi_tieu")
    if isinstance(chi_tieu, (int, float)) and chi_tieu < 0:   # chi tieu khong duoc am
        return True
    return False


da_gap_khoa = set()   # khoa tu nhien: ma_kh
so_thieu = so_trung = so_sai_kieu = 0
for bg in BAN_GHI:
    khoa = bg["ma_kh"]
    if khoa in da_gap_khoa:
        so_trung += 1
        continue           # da la ban trung, khong kiem tiep 2 loi con lai
    da_gap_khoa.add(khoa)
    if kiem_thieu(bg):
        so_thieu += 1
    if kiem_sai_kieu(bg):
        so_sai_kieu += 1

print(f"Thieu: {so_thieu}")
print(f"Trung: {so_trung}")
print(f"Sai kieu: {so_sai_kieu}")`,
      stdinLines: [],
    },
    predict: {
      code: `BAN_GHI = [
    {"ma": "A1", "gia": 100},
    {"ma": "A1", "gia": 105},   # cung ma A1, gia khac
    {"ma": "A2", "gia": 200},
]
da_gap = set()
so_trung = 0
for bg in BAN_GHI:
    if bg["ma"] in da_gap:
        so_trung += 1
    else:
        da_gap.add(bg["ma"])
print(so_trung)`,
      question: 'Chương trình in ra số mấy? (chú ý: hai bản ghi đầu cùng "ma" nhưng khác "gia")',
      choices: ['1', '0', '2', '3'],
      answerIndex: 0,
      explain:
        'So trùng lặp dựa trên KHOÁ TỰ NHIÊN "ma", không so toàn bộ dict. Hai bản ghi đầu cùng ma="A1" nên bản thứ hai bị tính là trùng dù "gia" khác nhau (105 ≠ 100) — nếu so nguyên dict thì sẽ bỏ sót cặp này. Bản ghi A2 là khoá mới, không trùng. Vậy so_trung = 1.',
    },
    parsons: {
      prompt: 'Xếp lại hàm kiểm THIẾU GIÁ TRỊ — nhớ cả ba dạng thiếu: None, chuỗi rỗng, "N/A".',
      lines: [
        'def kiem_thieu(bg):',
        '    for truong in ("ma_kh", "tuoi"):',
        '        gia_tri = bg.get(truong)',
        '        if gia_tri is None or gia_tri == "" or gia_tri == "N/A":',
        '            return True',
        '    return False',
      ],
    },
    make: {
      prompt:
        'Viết máy quét bản ghi, đếm 3 loại lỗi: thiếu, trùng, sai kiểu.\n\nChương trình đọc:\n- Dòng 1: n (số bản ghi).\n- n dòng tiếp theo, mỗi dòng 4 trường cách nhau dấu "|": ma_kh|ten|tuoi|chi_tieu (tuổi và chi tiêu ở dạng chuỗi số, hoặc rỗng/"N/A" nếu thiếu).\n\nLuật đếm:\n- THIẾU: bất kỳ trong 4 trường là chuỗi rỗng hoặc "N/A".\n- TRÙNG: so theo khoá tự nhiên ma_kh — gặp ma_kh đã thấy thì tính là trùng và BỎ QUA, không kiểm 2 lỗi còn lại cho dòng đó.\n- SAI KIỂU: tuổi không phải chuỗi toàn chữ số (không đổi được sang số nguyên), HOẶC chi tiêu là số âm.\n\nIn đúng 3 dòng:\nThieu: <so>\nTrung: <so>\nSai kieu: <so>\n\nVí dụ n=1, dòng "KH01|An|25|150000" → không lỗi nào → in 3 dòng đều 0.',
      starterCode: `n = int(input())
ban_ghi = []
for _ in range(n):
    parts = input().split("|")
    ban_ghi.append(parts)  # [ma_kh, ten, tuoi, chi_tieu] deu la chuoi

da_gap = set()
so_thieu = 0
so_trung = 0
so_sai_kieu = 0
for ma_kh, ten, tuoi, chi_tieu in ban_ghi:
    ...
# In: Thieu: <so> / Trung: <so> / Sai kieu: <so>
`,
      testCases: [
        {
          stdinLines: [
            '4',
            'KH01|Nguyen An|25|150000',
            'KH02|Tran Binh||200000',
            'KH01|Nguyen An|25|150000',
            'KH03|Le Cuong|ba muoi|90000',
          ],
          expected: 'Thieu: 1\nTrung: 1\nSai kieu: 1',
          match: 'contains',
          hidden: false,
          label: '4 dòng: 1 thiếu tuổi, 1 trùng ma_kh, 1 sai kiểu tuổi',
        },
        {
          stdinLines: ['1', 'KH04|Pham Dung|40|-50000'],
          expected: 'Thieu: 0\nTrung: 0\nSai kieu: 1',
          match: 'contains',
          hidden: false,
          label: 'Chi tiêu âm → sai kiểu, dù đủ trường và không trùng',
        },
        {
          stdinLines: ['1', 'KH05|N/A|22|120000'],
          expected: 'Thieu: 1\nTrung: 0\nSai kieu: 0',
          match: 'contains',
          hidden: false,
          label: 'Trường "ten" ghi "N/A" cũng phải tính là thiếu, không chỉ ô rỗng',
        },
        {
          stdinLines: ['2', 'KH06|A|20|100', 'KH06|B|-5|9999'],
          expected: 'Trung: 1',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: dòng thứ hai trùng ma_kh KH06 — dù có lỗi sai kiểu (tuổi -5) vẫn KHÔNG được cộng vào Sai kieu vì đã là bản trùng, phải bỏ qua ngay',
        },
        {
          stdinLines: ['1', 'KH07|C|30|0'],
          expected: 'Thieu: 0\nTrung: 0\nSai kieu: 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn ranh giới: chi tiêu đúng bằng 0 KHÔNG phải số âm, không được tính sai kiểu',
        },
      ],
      hints: [
        'Duyệt qua từng dòng đã tách sẵn (ma_kh, ten, tuoi, chi_tieu) — cả 4 đều đang là chuỗi.',
        'Kiểm trùng TRƯỚC: nếu ma_kh đã có trong tập da_gap thì so_trung += 1 rồi bỏ qua dòng này (continue), không kiểm 2 lỗi còn lại.',
        'Kiểm thiếu: any(x == "" or x == "N/A" for x in (ma_kh, ten, tuoi, chi_tieu)).',
        'Kiểm sai kiểu tuổi bằng tuoi.lstrip("-").isdigit() để nhận biết chuỗi không phải số; kiểm chi tiêu âm bằng chi_tieu.lstrip("-").isdigit() and int(chi_tieu) < 0.',
        'Nhớ in đúng 3 dòng theo thứ tự Thieu / Trung / Sai kieu, mỗi dòng dạng "Nhan: so".',
      ],
      sampleSolution: `n = int(input())
ban_ghi = []
for _ in range(n):
    parts = input().split("|")
    ban_ghi.append(parts)

da_gap = set()
so_thieu = 0
so_trung = 0
so_sai_kieu = 0
for ma_kh, ten, tuoi, chi_tieu in ban_ghi:
    if ma_kh in da_gap:
        so_trung += 1
        continue
    da_gap.add(ma_kh)

    thieu = False
    for gt in (ma_kh, ten, tuoi, chi_tieu):
        if gt == "" or gt == "N/A":
            thieu = True
    if thieu:
        so_thieu += 1

    sai_kieu = False
    if tuoi != "" and tuoi != "N/A" and not tuoi.lstrip("-").isdigit():
        sai_kieu = True
    if chi_tieu != "" and chi_tieu != "N/A" and chi_tieu.lstrip("-").isdigit() and int(chi_tieu) < 0:
        sai_kieu = True
    if sai_kieu:
        so_sai_kieu += 1

print(f"Thieu: {so_thieu}")
print(f"Trung: {so_trung}")
print(f"Sai kieu: {so_sai_kieu}")`,
    },
    homework:
      'Lấy một file bạn có thật (danh bạ, danh sách chi tiêu, danh sách lớp — kể cả chép tay 15-20 dòng vào Google Sheet rồi xuất CSV). Áp 3 phép kiểm của bài này bằng tay hoặc bằng hàm vừa viết. Ghi lại: bao nhiêu dòng thiếu, trùng, sai kiểu — và với mỗi dòng lỗi, bạn sẽ SỬA hay LOẠI BỎ? Giữ lại quyết định đó, vì bài tiếp theo sẽ yêu cầu ghi nó thành log kiểm được.',
    srsCards: [
      {
        hoi: 'Ba loại lỗi dữ liệu kinh điển cần kiểm trước khi phân tích là gì?',
        dap: 'Thiếu giá trị (None/rỗng/"N/A"), trùng lặp (theo khoá tự nhiên), và sai kiểu (chuỗi số thay vì số, hoặc số âm không hợp lệ cho trường luôn phải dương).',
      },
      {
        hoi: 'Vì sao kiểm trùng lặp phải so theo KHOÁ TỰ NHIÊN, không so toàn bộ dict?',
        dap: 'So toàn bộ dict sẽ bỏ sót trùng lặp thật khi một trường phụ lệch nhau (giá vừa cập nhật, thời điểm ghi) — khoá tự nhiên (mã khách hàng, CCCD) mới định danh đúng một thực thể ngoài đời.',
      },
      {
        hoi: 'Vì sao khi phát hiện một bản ghi TRÙNG thì nên bỏ qua ngay, không kiểm tiếp 2 loại lỗi kia?',
        dap: 'Bản ghi trùng sẽ bị loại/gộp nên kiểm thêm không có ý nghĩa và dễ đếm sai (một lỗi bị cộng nhầm vào cả bản gốc lẫn bản trùng của nó).',
      },
    ],
  },
  {
    id: 'p6-u67-l2',
    unitId: 'p6-u67',
    language: 'python',
    title: 'Chuẩn hoá ngày giờ & ghi lại giả định làm sạch',
    hook: 'Ba nguồn dữ liệu ghép lại: một nơi ghi ngày kiểu "2026-08-01", nơi khác "01/08/2026", nơi khác nữa "1-8-2026" — cùng MỘT ngày, ba cách viết. Sắp xếp theo thời gian mà không chuẩn hoá trước sẽ ra kết quả vô nghĩa. Và khi bạn tự tay sửa một giá trị sai, nếu không ghi lại đã sửa gì, sáu tháng sau chính bạn cũng không biết vì sao con số báo cáo lại khác với dữ liệu gốc.',
    theory:
      'CHUẨN HOÁ NGÀY GIỜ: nhiều nguồn dữ liệu ghi ngày theo định dạng khác nhau (ISO "YYYY-MM-DD", "DD/MM/YYYY", "D-M-YYYY" không đệm số 0…). Trước khi so sánh hay sắp xếp theo thời gian, TẤT CẢ phải quy về MỘT định dạng chuẩn — dự án này (và phần lớn hệ thống) chọn ISO "YYYY-MM-DD" vì nó sắp xếp đúng thứ tự ngay cả khi so sánh như CHUỖI (không cần parse thành ngày mới so được).\n\nCách nhận diện: chuỗi có "/" thường là "ngày/tháng/năm" kiểu Việt Nam; chuỗi có "-" mà phần ĐẦU TIÊN dài 4 chữ số thì đã là ISO (năm đứng trước) — không cần đổi; còn lại (ví dụ "1-8-2026") là "ngày-tháng-năm" cần đổi. Đổi xong nhớ ĐỆM SỐ 0 cho tháng/ngày một chữ số ("2026-8-1" phải thành "2026-08-01", không thì sắp xếp chuỗi sẽ sai — "2026-8-1" đứng SAU "2026-12-1" theo thứ tự chuỗi dù ngày thực tế đứng trước).\n\nNGUYÊN TẮC QUAN TRỌNG NHẤT của làm sạch dữ liệu: **mọi quyết định làm sạch phải ghi lại thành log kiểm được, không âm thầm sửa**. "Âm thầm sửa" nghĩa là chương trình đổi giá trị nhưng không lưu vết — người đọc báo cáo sau này thấy con số khác dữ liệu gốc mà không tài nào truy lại được vì sao. Log tối thiểu phải trả lời được ba câu: bản ghi nào bị động tới, giá trị GỐC là gì, giá trị SAU KHI SỬA là gì (hoặc lý do bị LOẠI BỎ nếu không sửa được). Đây không phải cầu toàn — đây là điều kiện để một báo cáo dữ liệu ĐÁNG TIN, vì bất kỳ ai (kể cả chính bạn ba tháng sau) đều kiểm lại được quyết định làm sạch có hợp lý không.',
    workedExample: {
      code: `NGAY_THO = ["2026-08-01", "01/08/2026", "1-8-2026", "khong-ro"]


def chuan_hoa_ngay(chuoi):
    """Tra ve (ngay_chuan, ghi_chu) — ghi_chu la None neu doi thanh cong."""
    if "/" in chuoi:
        phan = chuoi.split("/")
        if len(phan) != 3:
            return None, "khong nhan dang duoc dinh dang"
        d, m, y = phan
        return f"{y}-{m.zfill(2)}-{d.zfill(2)}", None
    if "-" in chuoi:
        phan = chuoi.split("-")
        if len(phan) != 3:
            return None, "khong nhan dang duoc dinh dang"
        p1, p2, p3 = phan
        if len(p1) == 4:            # da la ISO: nam dung dau, khong can doi
            return chuoi, None
        d, m, y = p1, p2, p3
        return f"{y}-{m.zfill(2)}-{d.zfill(2)}", None
    return None, "khong nhan dang duoc dinh dang"


# Nhat ky lam sach: MOI dong ghi ro gia tri GOC va SAU KHI XU LY
for tho in NGAY_THO:
    chuan, loi = chuan_hoa_ngay(tho)
    if loi:
        print(f"Loi: {tho} -> {loi}")
    elif chuan == tho:
        print(f"Khong doi: {tho}")
    else:
        print(f"Doi: {tho} -> {chuan}")`,
      stdinLines: [],
    },
    predict: {
      code: `def chuan_hoa_ngay(chuoi):
    if "/" in chuoi:
        d, m, y = chuoi.split("/")
        return f"{y}-{m.zfill(2)}-{d.zfill(2)}"
    return chuoi


ngay = "5/9/2026"
moi = chuan_hoa_ngay(ngay)
print(f"Doi: {ngay} -> {moi}")`,
      question: 'Chương trình in ra dòng nào? (chú ý zfill(2) đệm số 0 cho tháng/ngày 1 chữ số)',
      choices: [
        'Doi: 5/9/2026 -> 2026-09-05',
        'Doi: 5/9/2026 -> 2026-9-05',
        'Doi: 5/9/2026 -> 2026-05-09',
        'Doi: 5/9/2026 -> 05-09-2026',
      ],
      answerIndex: 0,
      explain:
        'd="5", m="9", y="2026". Kết quả ghép là f"{y}-{m.zfill(2)}-{d.zfill(2)}" = "2026-09-05" — tháng 9 và ngày 5 đều được zfill(2) đệm thành 2 chữ số ("09", "05"), năm đứng đầu theo chuẩn ISO. Đáp án B thiếu đệm số 0 ở tháng, C nhầm vị trí ngày/tháng, D không theo thứ tự ISO (năm phải đứng đầu).',
    },
    parsons: {
      prompt: 'Xếp lại hàm chuẩn hoá ngày về ISO — nhớ đệm số 0 cho tháng và ngày một chữ số.',
      lines: [
        'def chuan_hoa_ngay(chuoi):',
        '    if "/" in chuoi:',
        '        d, m, y = chuoi.split("/")',
        '    else:',
        '        d, m, y = chuoi.split("-")',
        '    return f"{y}-{m.zfill(2)}-{d.zfill(2)}"',
      ],
    },
    make: {
      prompt:
        'Viết máy chuẩn hoá ngày về ISO, có ghi log từng dòng — KHÔNG âm thầm sửa.\n\nChương trình đọc:\n- Dòng 1: n (số ngày cần xử lý).\n- n dòng tiếp theo: mỗi dòng một chuỗi ngày thô.\n\nLuật xử lý từng dòng:\n- Có "/": dạng "ngay/thang/nam" → đổi sang ISO, đệm số 0 nếu cần, in "Doi: <goc> -> <moi>".\n- Có "-" và phần đầu (trước dấu "-" đầu tiên) dài đúng 4 ký tự: đã là ISO, KHÔNG đổi, in "Khong doi: <goc>".\n- Có "-" nhưng phần đầu không dài 4 ký tự: dạng "ngay-thang-nam" → đổi sang ISO như trên, in "Doi: <goc> -> <moi>".\n- Không tách được đúng 3 phần (dù theo "/" hay "-"), hoặc không có cả "/" lẫn "-": không nhận dạng được → in "Loi: <goc> khong nhan dang duoc".\n\nSau khi in xong n dòng log, in thêm 1 dòng cuối:\nTong: <n> dong, <so_loi> loi',
      starterCode: `n = int(input())
ngay_list = []
for _ in range(n):
    ngay_list.append(input())

so_loi = 0
for ngay in ngay_list:
    ...
# Sau vong lap, in: Tong: <n> dong, <so_loi> loi
`,
      testCases: [
        {
          stdinLines: ['3', '2026-08-01', '01/08/2026', '1-8-2026'],
          expected:
            'Khong doi: 2026-08-01\nDoi: 01/08/2026 -> 2026-08-01\nDoi: 1-8-2026 -> 2026-08-01',
          match: 'contains',
          hidden: false,
          label: 'Ba định dạng khác nhau cùng chỉ về một ngày, cả ba đều ra đúng ISO',
        },
        {
          stdinLines: ['2', '5/9/2026', '3-12-2026'],
          expected: 'Doi: 5/9/2026 -> 2026-09-05\nDoi: 3-12-2026 -> 2026-12-03',
          match: 'contains',
          hidden: false,
          label: 'Đệm số 0 đúng cho cả ngày và tháng một chữ số, dù nguồn "/" hay "-"',
        },
        {
          stdinLines: ['1', 'xyz'],
          expected: 'Loi: xyz khong nhan dang duoc',
          match: 'contains',
          hidden: false,
          label: 'Chuỗi không phải ngày phải ghi log LOI, không được bỏ qua âm thầm',
        },
        {
          stdinLines: ['2', '2026/08', '01/08/2026'],
          expected: 'Tong: 2 dong, 1 loi',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn: một dòng lỗi (thiếu phần năm) trộn cùng một dòng hợp lệ — đếm so_loi phải đúng dù có dòng thành công xen giữa',
        },
        {
          stdinLines: ['1', '2026-1-5'],
          expected: 'Khong doi: 2026-1-5',
          match: 'contains',
          hidden: true,
          label:
            'Ca ẩn ranh giới: đã ở dạng ISO (năm 4 chữ số đứng đầu) dù tháng/ngày chưa đệm 0 — vẫn tính là KHÔNG ĐỔI, không được sửa thêm',
        },
      ],
      hints: [
        'Đọc HẾT n dòng ngày vào một list trước, rồi mới xử lý và in — tránh in xen giữa lúc còn đang đọc input.',
        'Với chuỗi có "/": tách bằng split("/"); phải đúng 3 phần thì mới lấy được d, m, y — sai thì đó là lỗi định dạng.',
        'Với chuỗi có "-": tách bằng split("-"); nếu phần ĐẦU TIÊN dài 4 ký tự (len(phan[0]) == 4) thì đã là ISO, không đổi.',
        'Ghép ISO bằng f"{y}-{m.zfill(2)}-{d.zfill(2)}" để luôn đệm đủ 2 chữ số cho tháng và ngày.',
        'Đếm so_loi mỗi khi in dòng "Loi: ...", rồi sau vòng lặp in "Tong: <n> dong, <so_loi> loi".',
      ],
      sampleSolution: `n = int(input())
ngay_list = []
for _ in range(n):
    ngay_list.append(input())

so_loi = 0
for ngay in ngay_list:
    if "/" in ngay:
        phan = ngay.split("/")
        if len(phan) != 3:
            so_loi += 1
            print(f"Loi: {ngay} khong nhan dang duoc")
            continue
        d, m, y = phan
        print(f"Doi: {ngay} -> {y}-{m.zfill(2)}-{d.zfill(2)}")
    elif "-" in ngay:
        phan = ngay.split("-")
        if len(phan) != 3:
            so_loi += 1
            print(f"Loi: {ngay} khong nhan dang duoc")
            continue
        p1, p2, p3 = phan
        if len(p1) == 4:
            print(f"Khong doi: {ngay}")
        else:
            d, m, y = p1, p2, p3
            print(f"Doi: {ngay} -> {y}-{m.zfill(2)}-{d.zfill(2)}")
    else:
        so_loi += 1
        print(f"Loi: {ngay} khong nhan dang duoc")

print(f"Tong: {n} dong, {so_loi} loi")`,
    },
    homework:
      'Quay lại danh sách bạn dùng ở bài trước (danh bạ/chi tiêu/danh sách lớp). Tìm cột ngày tháng (ngày sinh, ngày mua hàng…) và chuẩn hoá về ISO bằng hàm vừa viết. Với MỌI dòng bị đổi hoặc bị loại, ghi ra một "nhật ký làm sạch" riêng (một file text hoặc một bảng): giá trị gốc, giá trị sau xử lý (hoặc lý do loại bỏ), và ngày bạn làm việc này. Đây chính là thứ để bạn (hoặc người khác) kiểm tra lại quyết định làm sạch sáu tháng sau.',
    srsCards: [
      {
        hoi: 'Vì sao nên chuẩn hoá ngày về đúng định dạng ISO "YYYY-MM-DD"?',
        dap: 'Với ISO, so sánh/sắp xếp theo thời gian đúng ngay cả khi so như CHUỖI (không cần parse thành kiểu ngày trước) — vì năm đứng trước, tháng và ngày đứng sau theo đúng thứ tự lớn dần.',
      },
      {
        hoi: 'Vì sao đệm số 0 (zfill) cho tháng/ngày một chữ số lại quan trọng?',
        dap: 'Thiếu đệm số 0 làm chuỗi ISO sắp sai thứ tự — ví dụ "2026-8-1" đứng SAU "2026-12-1" khi so như chuỗi, dù ngày thực tế đứng trước tháng 12.',
      },
      {
        hoi: 'Nguyên tắc quan trọng nhất khi làm sạch dữ liệu là gì?',
        dap: 'Mọi quyết định sửa hoặc loại bỏ đều phải ghi lại thành log kiểm được (giá trị gốc, giá trị sau xử lý hoặc lý do loại) — không bao giờ âm thầm sửa mà không lưu vết.',
      },
    ],
  },
]
