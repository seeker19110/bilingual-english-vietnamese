// lessons/p5u1.ts — P5-U1: Big-O trực quan (làn A, `python`).
//
// LUẬT CỦA BẬC (docs/research/dac-ta-bac-p5-deploy-va-lan-c-2026-08-26.md §2): đồng hồ chỉ để
// NHÌN THẤY, chấm điểm thì ĐẾM THAO TÁC. Không test-case nào của P5 được so theo số giây —
// cùng một code chạy trên Pyodide điện thoại và runner CI lệch nhau cả chục lần, mà big-O vốn
// nói về tốc độ TĂNG chứ không nói về giây.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u1-l1',
    unitId: 'p5-u1',
    language: 'python',
    title: 'Big-O: cùng một kết quả đúng, hai cái giá khác hẳn nhau',
    hook: 'Quán của bạn chạy tốt suốt bậc P4 — với 50 đơn. Tháng này quán đông, sổ đơn lên 10.000 dòng, và trang báo cáo bắt đầu quay vòng vòng mất mấy giây. Code không hề sai. Chỉ là bạn đã chọn một cách làm mà cái giá của nó tăng theo số đơn.',
    theory:
      'Từ bậc này bạn không chỉ hỏi "code chạy đúng chưa?" nữa, mà hỏi thêm: "khi dữ liệu gấp 10 lần thì nó tốn gấp mấy?".\n\nBig-O là cách trả lời câu đó bằng MỘT chữ. Nó không nói chương trình chạy mất bao nhiêu giây — số giây phụ thuộc máy, phụ thuộc trình duyệt, phụ thuộc cả việc máy bạn đang mở bao nhiêu tab. Big-O nói thứ không đổi theo máy: SỐ THAO TÁC tăng thế nào theo lượng dữ liệu n.\n\nBa mức bạn sẽ gặp gần như suốt đời làm nghề:\n\n- O(1) — hằng số: dữ liệu tăng bao nhiêu cũng chừng đó việc. Ví dụ: lấy phần tử thứ 5 của danh sách.\n- O(log n) — logarit: mỗi bước LOẠI ĐI MỘT NỬA số ứng viên còn lại. Dữ liệu gấp đôi thì chỉ thêm ĐÚNG MỘT bước.\n- O(n) — tuyến tính: phải sờ tới từng phần tử. Dữ liệu gấp đôi thì việc gấp đôi.\n- O(n²) — bậc hai: với mỗi phần tử lại duyệt hết cả danh sách. Dữ liệu gấp đôi thì việc gấp BỐN. Đây là chỗ dự án chết.\n\nCách nhìn thấy điều đó mà không cần đồng hồ: ĐẾM. Đặt một biến đếm ngay chỗ tốn kém nhất trong vòng lặp (thường là phép so sánh), chạy thử với n = 1.000 rồi n = 2.000, và đọc hai con số. Tuyến tính: 1.000 → 2.000. Nhị phân: 10 → 11. Chỉ hai con số đó đã kể xong câu chuyện.\n\nVì sao đếm tốt hơn bấm giờ khi học: số đếm GIỐNG NHAU trên mọi máy, nên bạn so được hôm nay với hôm qua, so được máy bạn với máy bạn cùng lớp. Số giây thì không. Bấm giờ vẫn có ích — nhưng để bạn cảm nhận, không để bạn kết luận.\n\nMột điều kiện quan trọng của tìm kiếm nhị phân, đừng quên: danh sách PHẢI đã sắp xếp. Không sắp xếp mà chia đôi thì nửa bị vứt đi có thể đang chứa đúng thứ cần tìm.',
    workedExample: {
      code: `import time

# Cùng một việc: tìm mã đơn trong sổ đã sắp xếp. Hai cách làm, hai cái giá.

def tim_tuyen_tinh(ds, x):
    dem = 0
    for v in ds:
        dem += 1              # đếm ngay chỗ tốn kém: mỗi lần so sánh một phần tử
        if v == x:
            return dem
    return dem

def tim_nhi_phan(ds, x):
    dem = 0
    lo, hi = 0, len(ds) - 1   # vùng còn phải tìm: từ lo tới hi
    while lo <= hi:
        mid = (lo + hi) // 2  # nhìn vào GIỮA vùng đó
        dem += 1
        if ds[mid] == x:
            return dem
        if ds[mid] < x:
            lo = mid + 1      # nửa trái vô nghĩa -> vứt luôn một nửa
        else:
            hi = mid - 1      # nửa phải vô nghĩa -> vứt luôn một nửa
    return dem

for n in [1000, 2000, 4000]:
    so = list(range(1, n + 1))    # sổ đơn đã sắp xếp, mã 1..n
    t0 = time.perf_counter()
    a = tim_tuyen_tinh(so, n)     # tìm mã CUỐI = ca xấu nhất
    b = tim_nhi_phan(so, n)
    giay = time.perf_counter() - t0
    print(f"n={n}: tuyen tinh {a} so sanh | nhi phan {b} so sanh | {giay:.4f}s")

# Đọc cột số đếm: n gấp đôi -> tuyến tính gấp đôi, nhị phân chỉ +1. Đó là O(n) vs O(log n).
# Cột giây thì cứ chạy lại là ra số khác — nên nó chỉ để CẢM, không để kết luận.`,
      stdinLines: [],
    },
    predict: {
      code: `def tim_nhi_phan(ds, x):
    dem = 0
    lo, hi = 0, len(ds) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        dem += 1
        if ds[mid] == x:
            return dem
        if ds[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return dem

so = list(range(1, 101))      # 100 mã: 1, 2, 3, ... 100
print(tim_nhi_phan(so, 50))`,
      question: 'Tìm mã 50 trong danh sách 100 mã — in ra bao nhiêu lần so sánh?',
      choices: ['1', '7', '50', '100'],
      answerIndex: 0,
      explain:
        'Lần chia đầu tiên: mid = (0 + 99) // 2 = 49, mà ds[49] chính là số 50 — trúng ngay, chỉ MỘT lần so sánh. Đây là ca may nhất chứ không phải ca thường: big-O luôn nói về ca XẤU NHẤT, và ca xấu nhất của 100 phần tử là 7 lần. Bẫy ở đây là thói quen đọc "tìm phần tử ở giữa" thành "phải đi nửa danh sách" — nhị phân không đi qua phần tử nào cả, nó vứt bỏ chúng.',
    },
    parsons: {
      prompt: 'Xếp lại thân hàm tìm kiếm nhị phân — mỗi vòng lặp phải vứt đi đúng một nửa.',
      lines: [
        'lo, hi = 0, len(ds) - 1',
        'while lo <= hi:',
        '    mid = (lo + hi) // 2',
        '    if ds[mid] == x:',
        '        return mid',
        '    if ds[mid] < x:',
        '        lo = mid + 1',
        '    else:',
        '        hi = mid - 1',
        'return -1',
      ],
    },
    make: {
      prompt:
        'Sổ đơn của quán là danh sách mã đã sắp xếp: 1, 2, 3, ... n.\n\nViết HAI hàm, cả hai trả về SỐ LẦN SO SÁNH đã dùng (không trả về vị trí):\n\n1. dem_tuyen_tinh(ds, x) — duyệt từ đầu, cộng 1 vào biến đếm TRƯỚC mỗi lần so sánh một phần tử, dừng ngay khi gặp x.\n2. dem_nhi_phan(ds, x) — chia đôi như ví dụ mẫu: lo, hi = 0, len(ds)-1; mỗi vòng lấy mid = (lo+hi)//2 rồi cộng 1 vào biến đếm, so ds[mid] với x, vứt nửa vô nghĩa.\n\nChương trình chính đọc 2 dòng input(): dòng 1 là n, dòng 2 là mã cần tìm. Dựng ds = list(range(1, n+1)) rồi in đúng hai dòng:\nTuyen tinh: <so lan> so sanh\nNhi phan: <so lan> so sanh',
      starterCode: `def dem_tuyen_tinh(ds, x):
    dem = 0
    # Duyệt từng phần tử, đếm mỗi lần so sánh
    ...


def dem_nhi_phan(ds, x):
    dem = 0
    # Chia đôi: lo, hi = 0, len(ds) - 1
    ...


n = int(input("So don: "))
x = int(input("Ma can tim: "))
ds = list(range(1, n + 1))
# In hai dòng kết quả
`,
      testCases: [
        {
          stdinLines: ['1000', '1000'],
          expected: 'Tuyen tinh: 1000 so sanh',
          match: 'contains',
          hidden: false,
          label: '1.000 đơn, tìm mã cuối — tuyến tính phải sờ hết 1.000',
        },
        {
          stdinLines: ['1000', '1000'],
          expected: 'Nhi phan: 10 so sanh',
          match: 'contains',
          hidden: false,
          label: 'Cùng ca đó, nhị phân chỉ mất 10 lần',
        },
        {
          stdinLines: ['2000', '2000'],
          expected: 'Nhi phan: 11 so sanh',
          match: 'contains',
          hidden: false,
          label: 'n GẤP ĐÔI (2.000) — nhị phân chỉ thêm ĐÚNG 1 bước: 11',
        },
        {
          stdinLines: ['1000', '1'],
          expected: 'Tuyen tinh: 1 so sanh',
          match: 'contains',
          hidden: false,
          label: 'Tìm mã đầu tiên — đây là ca MAY của tuyến tính, không phải ca thường',
        },
        {
          stdinLines: ['10000', '7777'],
          expected: 'Nhi phan: 11 so sanh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 10.000 đơn, mã giữa chừng — nhị phân vẫn 11 lần',
        },
        {
          stdinLines: ['10000', '7777'],
          expected: 'Tuyen tinh: 7777 so sanh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: cùng ca đó, tuyến tính mất 7.777 lần — chênh 700 lần',
        },
      ],
      hints: [
        'Hai hàm đều TRẢ VỀ SỐ ĐẾM, không trả về vị trí tìm thấy. Đề chấm số lần so sánh chứ không chấm chỗ đứng của phần tử.',
        'Trong hàm tuyến tính, dem += 1 phải nằm TRƯỚC lệnh if. Đặt sau thì lần so sánh cuối cùng (lần tìm thấy) không được đếm và mọi kết quả lệch đi 1.',
        'Trong hàm nhị phân, dem += 1 đặt ngay sau khi tính mid — mỗi vòng lặp là đúng một lần so sánh. Điều kiện vòng lặp là lo <= hi (có dấu bằng), thiếu dấu bằng thì bỏ sót phần tử cuối cùng.',
        'Chú ý ds[mid] là GIÁ TRỊ, còn mid là vị trí. Với ds = [1..n] hai số này chỉ lệch nhau 1, nên viết nhầm vẫn ra kết quả gần đúng — đó là lý do đề có ca 10.000 đơn để lộ ra.',
        'Khung tham chiếu cho phần chính:\n\nds = list(range(1, n + 1))\nprint(f"Tuyen tinh: {dem_tuyen_tinh(ds, x)} so sanh")\nprint(f"Nhi phan: {dem_nhi_phan(ds, x)} so sanh")',
      ],
      sampleSolution: `def dem_tuyen_tinh(ds, x):
    dem = 0
    for v in ds:
        dem += 1              # đếm TRƯỚC khi so, kể cả lần so trúng
        if v == x:
            return dem
    return dem


def dem_nhi_phan(ds, x):
    dem = 0
    lo, hi = 0, len(ds) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        dem += 1
        if ds[mid] == x:
            return dem
        if ds[mid] < x:
            lo = mid + 1      # vứt nửa trái
        else:
            hi = mid - 1      # vứt nửa phải
    return dem


n = int(input("So don: "))
x = int(input("Ma can tim: "))
ds = list(range(1, n + 1))
print(f"Tuyen tinh: {dem_tuyen_tinh(ds, x)} so sanh")
print(f"Nhi phan: {dem_nhi_phan(ds, x)} so sanh")`,
    },
    homework:
      'Chạy lại ví dụ mẫu trên máy bạn, nhưng thêm n = 8000 và n = 16000 vào danh sách. Ghi lại hai cột: số đếm và số giây. Rồi trả lời cho chính mình: cột số đếm có đúng như bạn đoán trước khi chạy không? Cột số giây có bao giờ cho ra hai lần đo giống hệt nhau không? Đó chính là lý do bài này chấm bằng phép đếm.',
    srsCards: [
      {
        hoi: 'Big-O đo cái gì?',
        dap: 'Đo tốc độ TĂNG của số thao tác khi dữ liệu lớn lên, không đo số giây. Số giây phụ thuộc máy và mỗi lần chạy một khác; số thao tác thì giống nhau ở mọi máy.',
      },
      {
        hoi: 'Dữ liệu gấp đôi thì tìm kiếm nhị phân tốn thêm bao nhiêu bước?',
        dap: 'Đúng MỘT bước. Vì mỗi bước loại đi một nửa số ứng viên, nên muốn xử lý gấp đôi dữ liệu chỉ cần thêm một lần chia đôi nữa — đó là ý nghĩa của O(log n).',
      },
      {
        hoi: 'Tìm kiếm nhị phân đòi hỏi điều kiện gì ở dữ liệu?',
        dap: 'Danh sách phải ĐÃ SẮP XẾP. Chưa sắp xếp mà chia đôi thì nửa bị vứt đi có thể đang chứa đúng thứ cần tìm, và hàm trả về "không có" dù nó vẫn nằm đó.',
      },
      {
        hoi: 'Vì sao O(n²) là mức đáng sợ nhất trong bốn mức thường gặp?',
        dap: 'Vì dữ liệu gấp đôi thì việc gấp BỐN. Với 100 dòng thì không ai thấy gì, nhưng tới 10.000 dòng nó thành 100 triệu thao tác — đúng lúc sản phẩm bắt đầu có người dùng thật.',
      },
    ],
  },
]
