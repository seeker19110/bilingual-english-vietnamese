// lessons/p5u7.ts — P5-U7: Hiệu năng (làn A, `python`).
//
// Bài này là chỗ big-O của U1 gặp dữ liệu thật của quán: 10.000 dòng chi tiết × 200 món.
// Chấm bằng PHÉP ĐẾM (hiến chương P5 §2) — 1.005.000 so sánh với cách quét, 10.000 với cách
// tra bảng băm. Mọi con số kỳ vọng đã chạy thật bằng python3 khi soạn.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P5U7_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p5-u7-l1',
    unitId: 'p5-u7',
    language: 'python',
    title: 'Tìm và sửa điểm chậm: đo trước, sửa một chỗ, đo lại',
    hook: 'Trang báo cáo doanh thu của quán mở mất 4 giây. Bản năng đầu tiên của gần như mọi người mới là đi tối ưu vòng lặp in bảng — chỗ trông "nặng nề" nhất. Và gần như mọi lần, chỗ đó không phải nguyên nhân.',
    theory:
      'Quy trình sửa hiệu năng có ba bước, và bước nào bỏ cũng hỏng:\n\n1. ĐO TRƯỚC KHI SỬA. Không đo mà sửa thì bạn đang đoán, và cái giá của đoán sai là code phức tạp hơn mà vẫn chậm y như cũ. Câu nói cũ của nghề: "đo, đừng đoán".\n2. SỬA ĐÚNG MỘT CHỖ — chỗ tốn nhiều nhất. Trong hầu hết chương trình, hơn 90% thời gian nằm ở dưới 10% dòng code. Tối ưu 90% dòng còn lại là công sức đổ xuống sông.\n3. ĐO LẠI. Không đo lại thì bạn không biết mình vừa cải thiện hay vừa làm tệ đi — chuyện làm tệ đi xảy ra thường hơn bạn tưởng.\n\nMẫu chậm phổ biến nhất bạn sẽ gặp cả đời làm nghề tên là VÒNG LẶP LỒNG VÒNG LẶP TRÊN HAI BẢNG. Nó trông rất vô hại:\n\n  for dong in chi_tiet:            # 10.000 dòng\n      for mon in danh_sach_mon:    # 200 món\n          if mon.id == dong.mon_id:\n              ...\n\nVới quán 50 đơn thì không ai thấy gì. Với 10.000 dòng × 200 món là hai triệu lần so sánh. Đây chính là O(n × m) — họ hàng gần của O(n²) bạn gặp ở bài big-O.\n\nCÁCH SỬA gần như luôn là một câu: DỰNG BẢNG BĂM MỘT LẦN, RỒI TRA.\n\n  bang_gia = {mon.id: mon.gia for mon in danh_sach_mon}   # 200 thao tác, làm MỘT lần\n  for dong in chi_tiet:                                    # 10.000 lần tra, mỗi lần O(1)\n      tong += bang_gia[dong.mon_id] * dong.so_luong\n\nTừ 2.000.000 xuống còn 10.200. Cùng một kết quả, cùng số dòng code, khác nhau 200 lần.\n\nHai cái bẫy đi kèm, cả hai đều KHÔNG báo lỗi:\n\n- DỰNG BẢNG TRONG VÒNG LẶP. Đặt dòng bang_gia = {...} vào bên trong for thì bạn dựng lại nó 10.000 lần, và toàn bộ lợi ích bốc hơi — trong khi kết quả vẫn đúng, nên không có gì báo cho bạn biết. Bước Dự đoán của bài cho bạn thấy đúng cảnh đó.\n- DÙNG "in" TRÊN LIST. if x in danh_sach là O(n) (quét), còn if x in tap_hop / if x in dict là O(1). Hai dòng code trông y hệt nhau, giá thì khác nhau cả nghìn lần.\n\nVà nguyên tắc cuối, quan trọng hơn mọi mẹo ở trên: TỐI ƯU LÀ VIỆC LÀM SAU CÙNG. Viết cho đúng và cho dễ đọc trước, có test rồi, đo thấy chậm thật rồi mới sửa. Code khó đọc vì tối ưu sớm là món nợ bạn trả suốt vòng đời dự án — và thường là nợ cho một chỗ chẳng ai thấy chậm.',
    workedExample: {
      code: `import time

# Sổ chi tiết đơn của quán: 10.000 dòng, mỗi dòng (ma_mon, so_luong)
CHI_TIET = [((i * 37) % 200, (i % 5) + 1) for i in range(10000)]
# Bảng món: 200 món, mỗi món (ma, gia)
DANH_SACH_MON = [(k, 5000 + k * 1000) for k in range(200)]


def doanh_thu_cham(chi_tiet, ds_mon):
    dem = 0
    tong = 0
    for ma_mon, so_luong in chi_tiet:
        for ma, gia in ds_mon:          # quét lại bảng món cho TỪNG dòng chi tiết
            dem += 1
            if ma == ma_mon:
                tong += gia * so_luong
                break
    return dem, tong


def doanh_thu_nhanh(chi_tiet, ds_mon):
    bang_gia = dict(ds_mon)             # dựng MỘT lần, ngoài mọi vòng lặp
    dem = 0
    tong = 0
    for ma_mon, so_luong in chi_tiet:
        dem += 1                        # mỗi dòng đúng MỘT lần tra, O(1)
        tong += bang_gia[ma_mon] * so_luong
    return dem, tong


t0 = time.perf_counter()
a, tien_a = doanh_thu_cham(CHI_TIET, DANH_SACH_MON)
t1 = time.perf_counter()
b, tien_b = doanh_thu_nhanh(CHI_TIET, DANH_SACH_MON)
t2 = time.perf_counter()

print(f"Cham : {a} thao tac | {tien_a} dong | {t1 - t0:.3f}s")
print(f"Nhanh: {b} thao tac | {tien_b} dong | {t2 - t1:.3f}s")
print("Cung ket qua:", tien_a == tien_b)

# Hai cột tiền GIỐNG HỆT nhau — đó là điều kiện của mọi việc tối ưu: đổi cái giá,
# không đổi kết quả. Cột thao tác thì chênh 100 lần, và cột giây chỉ để bạn cảm nhận.`,
      stdinLines: [],
    },
    predict: {
      code: `MON = [(k, 5000 + k * 1000) for k in range(200)]
CT = [((i * 37) % 200, 1) for i in range(1000)]

dem = 0
tong = 0
for ma_mon, so_luong in CT:
    bang_gia = {}
    for ma, gia in MON:          # dung bang gia o day
        dem += 1
        bang_gia[ma] = gia
    tong += bang_gia[ma_mon] * so_luong

print(dem)`,
      question:
        'Code này CÓ dùng bảng băm và kết quả tính tiền hoàn toàn đúng. In ra bao nhiêu thao tác?',
      choices: ['200000', '1000', '1200', '5000'],
      answerIndex: 0,
      explain:
        'In ra 200000 — đúng bằng bản quét chậm, không nhanh hơn tí nào. Vì dòng dựng bảng nằm BÊN TRONG vòng lặp: mỗi dòng chi tiết lại dựng lại toàn bộ bảng 200 món từ đầu. Đây là cái bẫy nguy hiểm nhất của bài: code có vẻ đã "được tối ưu", kết quả tính tiền đúng tuyệt đối, không lỗi nào được báo — chỉ có tốc độ là y như cũ. Chuyển đúng một dòng ra ngoài vòng lặp là còn 1.200 thao tác. Đây cũng là lý do bước "đo lại sau khi sửa" không được bỏ: không đo lại thì bạn đã đóng ticket và đi ngủ.',
    },
    parsons: {
      prompt:
        'Xếp lại hàm tính doanh thu bằng bảng băm — chú ý dòng dựng bảng phải nằm ngoài vòng lặp.',
      lines: [
        'def doanh_thu(chi_tiet, ds_mon):',
        '    bang_gia = dict(ds_mon)',
        '    tong = 0',
        '    for ma_mon, so_luong in chi_tiet:',
        '        tong += bang_gia[ma_mon] * so_luong',
        '    return tong',
      ],
    },
    make: {
      prompt:
        'Sổ của quán được sinh bằng công thức để bạn thử được ở quy mô thật:\nCHI_TIET = [((i * 37) % m, (i % 5) + 1) for i in range(n)]   # (ma_mon, so_luong)\nDANH_SACH_MON = [(k, 5000 + k * 1000) for k in range(m)]      # (ma, gia)\n\nViết HAI hàm, mỗi hàm trả về (so_thao_tac, tong_tien):\n\n1. doanh_thu_cham(chi_tiet, ds_mon) — với mỗi dòng chi tiết, duyệt ds_mon từ đầu, cộng 1 vào biến đếm mỗi lần so sánh một món, gặp đúng mã thì cộng tiền rồi break.\n2. doanh_thu_nhanh(chi_tiet, ds_mon) — dựng bảng băm MỘT LẦN ở ngoài vòng lặp, rồi mỗi dòng chi tiết chỉ cộng 1 vào biến đếm và tra bảng một lần.\n\nChương trình chính đọc 2 dòng input(): dòng 1 là n (số dòng chi tiết), dòng 2 là m (số món). Dựng dữ liệu theo công thức trên rồi in đúng ba dòng:\nCham: <so thao tac> thao tac\nNhanh: <so thao tac> thao tac\nDoanh thu: <tong tien> dong\n\nHai hàm PHẢI cho ra cùng một tổng tiền — đó là điều kiện của mọi việc tối ưu.',
      starterCode: `def doanh_thu_cham(chi_tiet, ds_mon):
    dem = 0
    tong = 0
    # Với mỗi dòng, quét lại bảng món
    ...
    return dem, tong


def doanh_thu_nhanh(chi_tiet, ds_mon):
    # Dựng bảng băm MỘT lần — nhớ đặt dòng này NGOÀI vòng lặp
    ...


n = int(input("So dong chi tiet: "))
m = int(input("So mon: "))
CHI_TIET = [((i * 37) % m, (i % 5) + 1) for i in range(n)]
DANH_SACH_MON = [(k, 5000 + k * 1000) for k in range(m)]
# In ba dòng kết quả
`,
      testCases: [
        {
          stdinLines: ['100', '10'],
          expected: 'Cham: 550 thao tac',
          match: 'contains',
          hidden: false,
          label: '100 dòng × 10 món — cách quét mất 550 thao tác',
        },
        {
          stdinLines: ['100', '10'],
          expected: 'Nhanh: 100 thao tac',
          match: 'contains',
          hidden: false,
          label: 'Cách tra bảng: đúng 1 thao tác mỗi dòng',
        },
        {
          stdinLines: ['100', '10'],
          expected: 'Doanh thu: 2950000 dong',
          match: 'contains',
          hidden: false,
          label: 'Tổng tiền hai cách phải giống hệt nhau',
        },
        {
          stdinLines: ['10000', '200'],
          expected: 'Cham: 1005000 thao tac',
          match: 'contains',
          hidden: false,
          label: 'Quy mô thật — 10.000 dòng × 200 món: hơn MỘT TRIỆU thao tác',
        },
        {
          stdinLines: ['10000', '200'],
          expected: 'Nhanh: 10000 thao tac',
          match: 'contains',
          hidden: false,
          label: 'Cùng dữ liệu đó, cách tra bảng chỉ 10.000 — nhanh gấp 100 lần',
        },
        {
          stdinLines: ['10000', '200'],
          expected: 'Doanh thu: 3145000000 dong',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ở quy mô thật, tối ưu vẫn KHÔNG được làm đổi kết quả',
        },
        {
          stdinLines: ['1000', '50'],
          expected: 'Cham: 25500 thao tac',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quy mô khác — số đếm phụ thuộc dữ liệu, không tính nhẩm được',
        },
      ],
      hints: [
        'Trong hàm chậm, dem += 1 nằm TRONG vòng lặp bên trong, ngay trước lệnh so sánh mã món — kể cả lần so sánh trúng cũng được đếm. Và nhớ break sau khi tìm thấy.',
        'Trong hàm nhanh, dòng dựng bảng phải nằm TRƯỚC vòng for, không phải bên trong. Đặt nhầm vào trong thì kết quả tiền vẫn đúng nhưng số đếm sẽ ra n × m — đúng cái bẫy ở bước Dự đoán.',
        'dict(ds_mon) đủ để đổi một danh sách các cặp (ma, gia) thành bảng băm — không cần viết vòng lặp.',
        'Hai hàm phải trả về CÙNG một tổng tiền. Nếu lệch, gần như chắc chắn hàm chậm thiếu break (nên cộng tiền nhiều lần) hoặc hàm nhanh nhân nhầm biến.',
        'Khung tham chiếu cho phần in:\n\ncham, tien = doanh_thu_cham(CHI_TIET, DANH_SACH_MON)\nnhanh, tien2 = doanh_thu_nhanh(CHI_TIET, DANH_SACH_MON)\nprint(f"Cham: {cham} thao tac")\nprint(f"Nhanh: {nhanh} thao tac")\nprint(f"Doanh thu: {tien} dong")',
      ],
      sampleSolution: `def doanh_thu_cham(chi_tiet, ds_mon):
    dem = 0
    tong = 0
    for ma_mon, so_luong in chi_tiet:
        for ma, gia in ds_mon:          # quét lại cả bảng món cho TỪNG dòng
            dem += 1
            if ma == ma_mon:
                tong += gia * so_luong
                break
    return dem, tong


def doanh_thu_nhanh(chi_tiet, ds_mon):
    bang_gia = dict(ds_mon)             # dựng MỘT lần, NGOÀI vòng lặp
    dem = 0
    tong = 0
    for ma_mon, so_luong in chi_tiet:
        dem += 1                        # mỗi dòng đúng một lần tra, O(1)
        tong += bang_gia[ma_mon] * so_luong
    return dem, tong


n = int(input("So dong chi tiet: "))
m = int(input("So mon: "))
CHI_TIET = [((i * 37) % m, (i % 5) + 1) for i in range(n)]
DANH_SACH_MON = [(k, 5000 + k * 1000) for k in range(m)]

cham, tien = doanh_thu_cham(CHI_TIET, DANH_SACH_MON)
nhanh, tien_nhanh = doanh_thu_nhanh(CHI_TIET, DANH_SACH_MON)

print(f"Cham: {cham} thao tac")
print(f"Nhanh: {nhanh} thao tac")
print(f"Doanh thu: {tien} dong")`,
    },
    homework:
      'Mở lại dự án trục của bạn (hoặc bất kỳ code nào bạn đã viết ở bậc P2–P4) và đi tìm MỘT vòng lặp lồng vòng lặp trên hai danh sách. Đừng sửa vội: trước tiên thêm biến đếm và chạy thử với dữ liệu gấp 100 lần hiện tại, ghi lại con số. Rồi sửa thành bảng băm, chạy lại, ghi con số thứ hai. Nếu không tìm thấy chỗ nào như vậy trong code của mình thì càng tốt — hãy ghi lại vì sao bạn chắc là không có.',
    srsCards: [
      {
        hoi: 'Ba bước của việc sửa hiệu năng là gì?',
        dap: 'Đo trước khi sửa, sửa đúng một chỗ tốn nhiều nhất, rồi đo lại. Bỏ bước đo đầu là đang đoán; bỏ bước đo cuối là không biết mình vừa cải thiện hay vừa làm tệ đi.',
      },
      {
        hoi: 'Mẫu code chậm phổ biến nhất trông như thế nào, và sửa bằng gì?',
        dap: 'Vòng lặp lồng vòng lặp trên hai bảng (O(n × m)) — với mỗi dòng bảng này lại quét cả bảng kia. Sửa bằng cách dựng một bảng băm (dict) MỘT lần rồi tra, đưa chi phí về O(n + m).',
      },
      {
        hoi: 'Vì sao dựng dict bên trong vòng lặp là cái bẫy nguy hiểm?',
        dap: 'Vì kết quả vẫn hoàn toàn đúng và không có lỗi nào được báo, chỉ có tốc độ là không cải thiện gì — code trông như đã tối ưu nhưng vẫn tốn n × m thao tác. Chỉ có phép đo mới phát hiện ra.',
      },
      {
        hoi: '"x in danh_sach" và "x in tap_hop" khác nhau chỗ nào?',
        dap: 'Hai dòng trông y hệt nhưng khác giá: trên list là O(n) vì phải quét, còn trên set hoặc dict là O(1) vì tính thẳng ra chỗ cần đến. Với danh sách lớn, khác biệt lên tới hàng nghìn lần.',
      },
    ],
  },
]
