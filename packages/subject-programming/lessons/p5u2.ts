// lessons/p5u2.ts — P5-U2: Tìm kiếm & sắp xếp (làn A, `python`).
//
// Chấm bằng PHÉP ĐẾM, không bằng đồng hồ (hiến chương P5 §2). Ở đây bộ đếm phải PHỤ THUỘC DỮ
// LIỆU mới có nghĩa: sắp xếp chọn (selection sort) luôn tốn đúng n(n-1)/2 phép so sánh bất kể
// dữ liệu, nên học viên tính nhẩm ra số đó mà không cần viết thuật toán. Sắp xếp CHÈN thì số
// so sánh đổi theo mức lộn xộn của dữ liệu — muốn ra đúng số phải thật sự chạy thuật toán.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u2-l1',
    unitId: 'p5-u2',
    language: 'python',
    title: 'Sắp xếp để tìm cho nhanh — và cái giá của việc sắp xếp',
    hook: 'Bài trước bạn thấy nhị phân nhanh gấp mấy trăm lần tuyến tính. Nhưng nó có một điều kiện: danh sách phải đã sắp xếp. Vậy nếu sổ đơn của quán đang lộn xộn thì sao — sắp xếp nó có đáng không?',
    theory:
      'Câu trả lời là: CÒN TÙY, và biết tùy vào cái gì chính là nội dung bài này.\n\nSắp xếp không miễn phí. Sắp xếp một danh sách n phần tử bằng các thuật toán đơn giản tốn cỡ O(n²) phép so sánh — với 1.000 đơn là hàng trăm nghìn lần. Tìm tuyến tính một lần chỉ tốn 1.000. Nên nếu bạn chỉ tra CÚU MỘT LẦN, sắp xếp rồi tìm nhị phân là lỗ nặng.\n\nNhưng quán bạn không tra một lần. Trang báo cáo tra hàng nghìn lần trên cùng một sổ. Lúc đó phép tính đảo chiều: trả trước một lần chi phí sắp xếp, rồi mỗi lần tra chỉ còn 10 bước thay vì 1.000. Đây là kiểu suy nghĩ bạn sẽ dùng suốt đời làm nghề: CHI PHÍ MỘT LẦN đổi lấy CHI PHÍ MỖI LẦN.\n\nHai thuật toán sắp xếp cơ bản nên biết vì chúng dạy hai kiểu tư duy khác nhau:\n\n- Sắp xếp CHỌN (selection sort): mỗi vòng quét cả phần còn lại để tìm số nhỏ nhất rồi đem về đầu. Đặc điểm đáng nhớ: nó tốn ĐÚNG n(n-1)/2 phép so sánh bất kể dữ liệu — danh sách đã sắp sẵn hoàn hảo cũng vẫn tốn từng ấy. Nó mù.\n- Sắp xếp CHÈN (insertion sort): giống cách bạn xếp bài trên tay — nhặt từng lá, lùi ngược về bên trái tới khi gặp lá nhỏ hơn thì dừng. Đặc điểm đáng nhớ: dữ liệu càng gần sắp sẵn thì nó càng ít việc; danh sách đã sắp sẵn chỉ tốn n-1 phép so sánh. Nó BIẾT NHÌN dữ liệu.\n\nHai thuật toán cùng O(n²) ở ca xấu nhất, nhưng chèn thắng đậm ở ca thực tế — vì dữ liệu đời thật hiếm khi lộn xộn hoàn toàn (sổ đơn thường đã gần theo thứ tự thời gian rồi). Đây là bài học lớn hơn cả big-O: big-O nói ca xấu nhất, còn ca bạn thật sự gặp mới quyết định trải nghiệm người dùng.\n\nMột lời nhắc thực tế: trong dự án thật bạn dùng sorted() của Python (thuật toán Timsort, O(n log n), rất tốt). Viết tay hai thuật toán trên là để HIỂU cái giá, không phải để dùng.',
    workedExample: {
      code: `def sap_xep_chon(ds):
    a = list(ds)                  # chép ra bản mới, không phá danh sách gốc
    dem = 0
    for i in range(len(a)):
        nho_nhat = i
        for j in range(i + 1, len(a)):
            dem += 1              # quét HẾT phần còn lại, không bao giờ dừng sớm
            if a[j] < a[nho_nhat]:
                nho_nhat = j
        a[i], a[nho_nhat] = a[nho_nhat], a[i]
    return a, dem


def sap_xep_chen(ds):
    a = list(ds)
    dem = 0
    for i in range(1, len(a)):
        khoa = a[i]               # lá bài vừa nhặt lên
        j = i - 1
        while j >= 0:
            dem += 1
            if a[j] <= khoa:      # gặp lá nhỏ hơn -> dừng ngay, đây là chỗ nó tiết kiệm
                break
            a[j + 1] = a[j]       # đẩy lá lớn hơn sang phải một ô
            j -= 1
        a[j + 1] = khoa
    return a, dem


da_sap = list(range(1, 101))              # 100 mã ĐÃ theo thứ tự
lon_xon = list(range(100, 0, -1))         # 100 mã theo thứ tự NGƯỢC (ca xấu nhất)

print("Da sap  - chon:", sap_xep_chon(da_sap)[1], "| chen:", sap_xep_chen(da_sap)[1])
print("Lon xon - chon:", sap_xep_chon(lon_xon)[1], "| chen:", sap_xep_chen(lon_xon)[1])

# Cột "chon" ra cùng một số ở cả hai dòng: nó không thèm nhìn dữ liệu.
# Cột "chen" chênh nhau gần 50 lần: dữ liệu càng gần sắp sẵn, nó càng ít việc.`,
      stdinLines: [],
    },
    predict: {
      code: `def tim_nhi_phan(ds, x):
    lo, hi = 0, len(ds) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if ds[mid] == x:
            return mid
        if ds[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

so = [50, 10, 90, 30]        # CHƯA sap xep
print(tim_nhi_phan(so, 30))`,
      question: 'Số 30 rõ ràng nằm trong danh sách. Hàm in ra gì?',
      choices: ['-1', '3', '0', 'Bao loi IndexError'],
      answerIndex: 0,
      explain:
        'In ra -1, nghĩa là "không tìm thấy" — dù 30 đang nằm ngay đó. Lần chia đầu: mid=1, ds[1]=10 < 30 nên hàm kết luận "30 phải ở nửa PHẢI" và vứt luôn nửa trái. Nhưng danh sách chưa sắp xếp nên kết luận đó sai. Đây là lỗi nguy hiểm nhất của nhị phân: nó KHÔNG báo lỗi, nó trả về một câu trả lời sai một cách rất tự tin. Trong dự án thật, thứ này thành cảnh "khách bảo đơn của tôi biến mất" mà log thì sạch trơn.',
    },
    parsons: {
      prompt: 'Xếp lại thân vòng lặp của sắp xếp CHÈN — nhặt một lá rồi lùi dần về bên trái.',
      lines: [
        'for i in range(1, len(a)):',
        '    khoa = a[i]',
        '    j = i - 1',
        '    while j >= 0 and a[j] > khoa:',
        '        a[j + 1] = a[j]',
        '        j -= 1',
        '    a[j + 1] = khoa',
      ],
    },
    make: {
      prompt:
        'Sổ mã đơn của quán được sinh ra bằng công thức (để bạn thử được với sổ rất lớn mà không phải gõ tay):\nds = [(i * 7919) % 10007 for i in range(n)]\n\nViết hai hàm:\n\n1. sap_xep_chen(ds) — sắp xếp CHÈN, trả về (danh_sach_da_sap, so_lan_so_sanh). Đếm đúng theo khuôn của ví dụ mẫu: mỗi vòng while cộng 1 vào biến đếm NGAY TRƯỚC khi so a[j] với khoá, gặp a[j] <= khoa thì break.\n2. tim_nhi_phan(ds, x) — trả về VỊ TRÍ của x trong danh sách đã sắp, không có thì trả về -1.\n\nChương trình chính đọc 2 dòng input(): dòng 1 là n, dòng 2 là mã cần tìm. Dựng ds theo công thức trên, sắp xếp, rồi in đúng hai dòng:\nSo sanh khi sap xep: <so lan>\nVi tri: <vi tri>',
      starterCode: `def sap_xep_chen(ds):
    a = list(ds)
    dem = 0
    # Nhặt từng phần tử từ i = 1, lùi về trái tới khi gặp phần tử nhỏ hơn hoặc bằng
    ...
    return a, dem


def tim_nhi_phan(ds, x):
    # Trả về vị trí, không thấy thì -1
    ...


n = int(input("So don: "))
x = int(input("Ma can tim: "))
ds = [(i * 7919) % 10007 for i in range(n)]
# Sắp xếp, rồi in hai dòng kết quả
`,
      testCases: [
        {
          stdinLines: ['10', '0'],
          expected: 'So sanh khi sap xep: 35',
          match: 'contains',
          hidden: false,
          label: 'Sổ 10 mã — sắp xếp chèn tốn 35 phép so sánh',
        },
        {
          stdinLines: ['10', '0'],
          expected: 'Vi tri: 0',
          match: 'contains',
          hidden: false,
          label: 'Mã 0 là nhỏ nhất → sau khi sắp xếp nó nằm ở vị trí 0',
        },
        {
          stdinLines: ['50', '7919'],
          expected: 'So sanh khi sap xep: 667',
          match: 'contains',
          hidden: false,
          label: 'Sổ 50 mã — 667 phép so sánh (số này phụ thuộc dữ liệu, không tính nhẩm được)',
        },
        {
          stdinLines: ['50', '7919'],
          expected: 'Vi tri: 39',
          match: 'contains',
          hidden: false,
          label: 'Mã 7919 nằm ở vị trí 39 sau khi sắp xếp',
        },
        {
          stdinLines: ['200', '5000'],
          expected: 'Vi tri: -1',
          match: 'contains',
          hidden: false,
          label: 'Mã 5000 KHÔNG có trong sổ 200 mã → phải trả về -1, không được báo lỗi',
        },
        {
          stdinLines: ['500', '4'],
          expected: 'So sanh khi sap xep: 63112',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sổ 500 mã — 63.112 phép so sánh (n gấp 10 thì việc gấp ~100)',
        },
        {
          stdinLines: ['1000', '7919'],
          expected: 'Vi tri: 791',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sổ 1.000 mã, tra cứu vẫn phải đúng vị trí',
        },
      ],
      hints: [
        'Nhớ chép danh sách ra bản mới bằng a = list(ds) trước khi sửa. Sửa thẳng vào ds là bạn đang phá dữ liệu gốc của người gọi — lỗi này rất hay gặp và rất khó truy.',
        'Vị trí đặt dem += 1 quyết định con số cuối cùng: nó phải nằm TRONG vòng while, NGAY TRƯỚC lệnh so sánh a[j] với khoa — kể cả lần so sánh làm bạn break cũng được tính.',
        'Đề dùng điều kiện dừng a[j] <= khoa (có dấu bằng). Viết thành a[j] < khoa thì hai phần tử bằng nhau vẫn bị đẩy qua đẩy lại, số đếm sẽ lệch.',
        'Hàm tìm kiếm chạy trên danh sách ĐÃ SẮP, không phải ds gốc. Truyền nhầm ds gốc thì ca "Vi tri: 39" ra số khác mà chương trình không hề báo lỗi.',
        'Khung tham chiếu cho phần chính:\n\nda_sap, dem = sap_xep_chen(ds)\nprint(f"So sanh khi sap xep: {dem}")\nprint(f"Vi tri: {tim_nhi_phan(da_sap, x)}")',
      ],
      sampleSolution: `def sap_xep_chen(ds):
    a = list(ds)                  # không phá danh sách gốc
    dem = 0
    for i in range(1, len(a)):
        khoa = a[i]
        j = i - 1
        while j >= 0:
            dem += 1              # đếm cả lần so sánh làm ta dừng lại
            if a[j] <= khoa:
                break
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = khoa
    return a, dem


def tim_nhi_phan(ds, x):
    lo, hi = 0, len(ds) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if ds[mid] == x:
            return mid
        if ds[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


n = int(input("So don: "))
x = int(input("Ma can tim: "))
ds = [(i * 7919) % 10007 for i in range(n)]

da_sap, dem = sap_xep_chen(ds)
print(f"So sanh khi sap xep: {dem}")
print(f"Vi tri: {tim_nhi_phan(da_sap, x)}")`,
    },
    homework:
      'Lấy đúng code bài này, thêm một phép đo: với n = 1.000, in ra số phép so sánh khi sắp xếp danh sách ĐÃ sắp sẵn (list(range(1000))) và khi sắp xếp danh sách NGƯỢC (list(range(1000, 0, -1))). Hai con số chênh nhau bao nhiêu lần? Rồi tự trả lời: sổ đơn của một quán thật — thêm dần theo thời gian — sẽ gần với ca nào hơn?',
    srsCards: [
      {
        hoi: 'Khi nào thì sắp xếp trước rồi tìm nhị phân LỖ hơn là tìm tuyến tính thẳng?',
        dap: 'Khi bạn chỉ tra cứu một hoặc vài lần. Sắp xếp tốn cỡ O(n²) (hoặc O(n log n)) một lần, trong khi tìm tuyến tính chỉ tốn O(n) mỗi lần — phải tra nhiều lần thì chi phí sắp xếp mới được chia đều ra và trở nên đáng.',
      },
      {
        hoi: 'Sắp xếp chọn và sắp xếp chèn khác nhau ở điểm quan trọng nhất nào?',
        dap: 'Sắp xếp chọn luôn tốn đúng n(n-1)/2 phép so sánh bất kể dữ liệu, còn sắp xếp chèn dừng sớm khi gặp phần tử nhỏ hơn nên dữ liệu càng gần sắp sẵn thì nó càng ít việc (tốt nhất chỉ n-1 lần).',
      },
      {
        hoi: 'Tìm kiếm nhị phân trên danh sách chưa sắp xếp gây ra chuyện gì?',
        dap: 'Nó trả về -1 hoặc một vị trí sai mà KHÔNG báo lỗi gì cả. Đó là loại lỗi nguy hiểm nhất: chương trình vẫn chạy êm, chỉ có dữ liệu là sai, nên không ai phát hiện cho tới khi người dùng kêu.',
      },
      {
        hoi: 'Trong dự án thật nên dùng gì để sắp xếp?',
        dap: 'Dùng sorted() hoặc .sort() có sẵn của Python (Timsort, O(n log n) và tối ưu cho dữ liệu gần sắp sẵn). Viết tay các thuật toán cơ bản là để hiểu cái giá, không phải để dùng trong sản phẩm.',
      },
    ],
  },
]
