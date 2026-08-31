// lessons/p6u68.ts — P6-U68: HƯỚNG DỮ LIỆU, chặng S1 — gộp 2 module cuối `data-s1-m3`
// ("Thống kê đủ dùng") + `data-s1-m4` ("Trực quan hoá trung thực").
//
// Gộp vào 1 unit vì mỗi module một mình không đủ dày cho một unit riêng — đúng tiền lệ đã có
// trong dự án (specializations/*.ts): `web-s1` gộp 2 module vào `p6-u16`/`p6-u17` (chỉ tách
// riêng `p6-u18` khi module đó đủ nặng), tương tự cách các đợt trước gộp cặp module cuối của
// nhiều hướng khác. Ở đây m3 (thống kê mô tả + tương quan/nhân quả) và m4 (trình bày trung thực)
// là hai nửa của CÙNG một kỹ năng nghề thật: đọc số đúng rồi TRÌNH BÀY số đó không đánh lừa ai —
// tách riêng sẽ vụn, gộp lại vừa một unit.
//
// l1 dạy tự cài trung bình/trung vị (và vì sao chúng lệch khi có ngoại lệ) + tương quan không
// phải nhân quả. l2 không vẽ biểu đồ thật (không có canvas trong làn python) mà dạy bằng TÍNH
// TOÁN: phát hiện trục Y không cắt gốc gây phóng đại chênh lệch, và chọn đúng loại biểu đồ theo
// câu hỏi. Cả hai dùng làn `python` thuần, chấm bằng cổng python3 thật (lessonsPython.test.ts).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U68_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u68-l1',
    unitId: 'p6-u68',
    language: 'python',
    title: 'Trung bình, trung vị và cái bẫy "tương quan là nhân quả"',
    hook: 'Sếp công bố "lương trung bình công ty là 40 triệu", nhân viên nghe xong thấy lạ vì chẳng ai quanh mình được thế. Cùng lúc, ai đó khoe biểu đồ "doanh số kem tăng thì số vụ đuối nước cũng tăng — chắc kem gây đuối nước". Cả hai câu chuyện đều sai vì hiểu nhầm CON SỐ, không phải vì số liệu giả.',
    theory:
      'TRUNG BÌNH (mean) = tổng chia số lượng. TRUNG VỊ (median) = giá trị đứng GIỮA khi đã sắp xếp (số phần tử chẵn thì lấy trung bình 2 giá trị giữa). Hai số này thường gần nhau, nhưng lệch xa khi dữ liệu có NGOẠI LỆ (outlier).\n\nVí dụ lương: 9 nhân viên lương 10 triệu, 1 sếp lương 310 triệu. Trung bình = (9×10 + 310) / 10 = 40 triệu — bị 1 con số cực lớn KÉO LÊN, không ai trong công ty thực sự kiếm gần mức đó. Trung vị (sắp 10 giá trị, lấy 2 giá trị giữa) = 10 triệu — phản ánh đúng "người điển hình". Quy tắc nhớ: trung bình NHẠY với ngoại lệ, trung vị BỀN với ngoại lệ.\n\nTƯƠNG QUAN (correlation) là hai đại lượng CÙNG TĂNG/GIẢM theo nhau. NHÂN QUẢ (causation) là cái này GÂY RA cái kia. Tương quan KHÔNG chứng minh nhân quả. Ví dụ kinh điển: doanh số kem và số vụ đuối nước cùng tăng vào mùa hè — không phải kem gây đuối nước, cả hai cùng bị kéo lên bởi một BIẾN ẨN chung là NHIỆT ĐỘ (trời nóng thì người ta vừa ăn kem nhiều hơn vừa đi bơi nhiều hơn).\n\nCách tự hỏi trước khi kết luận nhân quả: (1) có biến ẩn nào cùng ảnh hưởng cả hai không? (2) thứ tự thời gian có đúng chiều không (nguyên nhân phải xảy ra TRƯỚC kết quả)? (3) có thí nghiệm đối chứng nào tách riêng được yếu tố đó không? Không trả lời được cả ba thì chỉ nên nói "có tương quan", không được nói "gây ra".',
    workedExample: {
      code: `def trung_binh(so_lieu):
    return sum(so_lieu) / len(so_lieu)


def trung_vi(so_lieu):
    da_sap = sorted(so_lieu)
    n = len(da_sap)
    giua = n // 2
    if n % 2 == 1:
        return da_sap[giua]              # so phan tu le -> lay dung gia tri giua
    return (da_sap[giua - 1] + da_sap[giua]) / 2   # so phan tu chan -> trung binh 2 gia tri giua


LUONG = [10, 10, 10, 10, 10, 10, 10, 10, 10, 310]   # 9 nhan vien + 1 sep

print(f"Trung binh: {trung_binh(LUONG):.1f}")
print(f"Trung vi: {trung_vi(LUONG):.1f}")
# Trung binh bi keo len boi 1 gia tri cuc lon, trung vi van phan anh dung "nguoi dien hinh"`,
      stdinLines: [],
    },
    predict: {
      code: `def trung_vi(so_lieu):
    da_sap = sorted(so_lieu)
    n = len(da_sap)
    giua = n // 2
    if n % 2 == 1:
        return da_sap[giua]
    return (da_sap[giua - 1] + da_sap[giua]) / 2

print(trung_vi([7, 1, 3, 9]))`,
      question: 'Danh sách [7, 1, 3, 9] có 4 phần tử (chẵn). trung_vi in ra gì?',
      choices: ['5.0', '4.0', '3.0', '7.0'],
      answerIndex: 0,
      explain:
        'Sắp xếp [7,1,3,9] thành [1,3,7,9]. n=4 (chẵn), giua = 4//2 = 2. Lấy trung bình 2 giá trị giữa là vị trí 1 và 2 tức 3 và 7 → (3+7)/2 = 5.0. "3.0" và "7.0" chỉ là MỘT trong hai giá trị giữa, không phải trung vị đúng.',
    },
    parsons: {
      prompt: 'Xếp lại hàm tính trung vị — nhớ xử lý riêng trường hợp số phần tử chẵn/lẻ.',
      lines: [
        'def trung_vi(so_lieu):',
        '    da_sap = sorted(so_lieu)',
        '    n = len(da_sap)',
        '    giua = n // 2',
        '    if n % 2 == 1:',
        '        return da_sap[giua]',
        '    return (da_sap[giua - 1] + da_sap[giua]) / 2',
      ],
    },
    make: {
      prompt:
        'Viết hàm tính TRUNG BÌNH và TRUNG VỊ của một danh sách số.\n\nChương trình đọc:\n- Dòng 1: n (số lượng số).\n- Dòng 2: n số cách nhau dấu cách.\n\nIn đúng 2 dòng:\nTrung binh: <trung bình làm tròn 2 chữ số thập phân>\nTrung vi: <trung vị làm tròn 2 chữ số thập phân>\n\nTrung vị: sắp xếp rồi lấy giá trị giữa; số phần tử chẵn thì lấy trung bình 2 giá trị giữa.',
      starterCode: `n = int(input())
so_lieu = [float(x) for x in input().split()]
# Tinh trung binh va trung vi roi in dung 2 dong theo mau
`,
      testCases: [
        {
          stdinLines: ['10', '10 10 10 10 10 10 10 10 10 310'],
          expected: 'Trung binh: 40.00\nTrung vi: 10.00',
          match: 'contains',
          hidden: false,
          label: 'Lương 9 nhân viên + 1 sếp: trung bình bị kéo lên, trung vị vẫn thấp',
        },
        {
          stdinLines: ['5', '3 1 4 1 5'],
          expected: 'Trung binh: 2.80\nTrung vi: 3.00',
          match: 'contains',
          hidden: false,
          label: 'Số phần tử lẻ (5): trung vị là giá trị giữa sau sắp xếp',
        },
        {
          stdinLines: ['4', '1 2 3 4'],
          expected: 'Trung vi: 2.50',
          match: 'contains',
          hidden: false,
          label: 'Số phần tử chẵn (4): trung vị = trung bình 2 giá trị giữa',
        },
        {
          stdinLines: ['1', '7'],
          expected: 'Trung binh: 7.00\nTrung vi: 7.00',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: chỉ 1 phần tử — trung bình và trung vị bằng nhau',
        },
        {
          stdinLines: ['4', '5 1 5 1'],
          expected: 'Trung vi: 3.00',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dữ liệu chưa sắp xếp sẵn — hàm phải tự sort trước khi lấy giữa',
        },
      ],
      hints: [
        'Đọc n rồi đọc dòng số bằng [float(x) for x in input().split()].',
        'Trung bình = sum(so_lieu) / len(so_lieu).',
        'Trung vị: da_sap = sorted(so_lieu); n // 2 là vị trí giữa. n lẻ lấy da_sap[giua]; n chẵn lấy trung bình da_sap[giua-1] và da_sap[giua].',
        'In đúng 2 dòng theo mẫu, dùng f"{gia_tri:.2f}" để làm tròn 2 chữ số thập phân.',
      ],
      sampleSolution: `n = int(input())
so_lieu = [float(x) for x in input().split()]

trung_binh = sum(so_lieu) / len(so_lieu)

da_sap = sorted(so_lieu)
giua = n // 2
if n % 2 == 1:
    trung_vi = da_sap[giua]
else:
    trung_vi = (da_sap[giua - 1] + da_sap[giua]) / 2

print(f"Trung binh: {trung_binh:.2f}")
print(f"Trung vi: {trung_vi:.2f}")`,
    },
    homework:
      'Tìm một bản tin có câu "trung bình X" (lương, thu nhập, giá nhà...). Tự hỏi: dữ liệu này có khả năng bị vài giá trị cực lớn/cực nhỏ kéo lệch không? Nếu có, ước lượng xem trung vị thật sẽ khác trung bình bao nhiêu. Sau đó tìm thêm một câu khẳng định kiểu "A tăng thì B cũng tăng, vậy A gây ra B" và chỉ ra biến ẩn có thể đứng sau cả hai.',
    srsCards: [
      {
        hoi: 'Trung bình và trung vị khác nhau ở điểm nào khi có ngoại lệ?',
        dap: 'Trung bình bị ngoại lệ kéo lệch mạnh (cộng dồn vào tổng); trung vị bền vững vì chỉ nhìn vị trí giữa sau sắp xếp, không quan tâm giá trị đó lớn/nhỏ bao nhiêu.',
      },
      {
        hoi: 'Trung vị của danh sách có SỐ PHẦN TỬ CHẴN tính thế nào?',
        dap: 'Sắp xếp danh sách rồi lấy TRUNG BÌNH của 2 giá trị đứng giữa (vị trí n//2 - 1 và n//2).',
      },
      {
        hoi: 'Tương quan giữa hai đại lượng có chứng minh được cái này gây ra cái kia không?',
        dap: 'Không. Có thể do biến ẩn chung tác động lên cả hai (ví dụ nhiệt độ khiến cả doanh số kem và số vụ đuối nước cùng tăng), không phải kem gây đuối nước.',
      },
    ],
  },
  {
    id: 'p6-u68-l2',
    unitId: 'p6-u68',
    language: 'python',
    title: 'Trực quan hoá trung thực — trục cắt gốc và chọn đúng biểu đồ',
    hook: 'Một biểu đồ cột "doanh thu quý này tăng vọt" nhìn cực kỳ ấn tượng — cho tới khi bạn để ý trục Y bắt đầu từ 950 chứ không phải 0. Chênh lệch thật chỉ vài phần trăm, nhưng trục bị cắt khiến nó TRÔNG như tăng gấp đôi. Đọc số đúng (bài trước) chưa đủ — trình bày sai vẫn lừa được người xem.',
    theory:
      'TRỤC Y KHÔNG CẮT GỐC (không bắt đầu từ 0) là lỗi trình bày phổ biến nhất ở biểu đồ cột: khi trục chỉ trải dài đúng bằng khoảng chênh lệch dữ liệu, một khác biệt nhỏ chiếm HẾT chiều cao biểu đồ, trông như khác biệt lớn.\n\nCách LƯỢNG HOÁ mức phóng đại: gọi "khoảng thật" (true range) là khoảng cách giữa 2 giá trị đang so sánh (ví dụ 1050 - 1000 = 50). Nếu trục Y đi từ truc_y_bat_dau đến giá trị lớn nhất, "khoảng trục" (axis range) = gia_tri_lon_nhat - truc_y_bat_dau. Khi trục cắt gốc thật (bắt đầu từ 0), khoảng trục = gia_tri_lon_nhat, và 2 cột chiếm đúng tỉ lệ đúng của chúng. Mức phóng đại = (khoảng trục khi cắt gốc thật) / (khoảng trục hiện tại) = gia_tri_lon_nhat / (gia_tri_lon_nhat - truc_y_bat_dau) — con số này nói CHÊNH LỆCH TRỰC QUAN giữa 2 cột đang bị thổi phồng gấp bao nhiêu lần so với biểu đồ trục cắt gốc thật.\n\nCHỌN ĐÚNG LOẠI BIỂU ĐỒ theo câu hỏi cần trả lời:\n- So sánh NHIỀU DANH MỤC (doanh thu theo tỉnh, điểm theo môn) → biểu đồ CỘT.\n- Theo dõi XU HƯỚNG theo THỜI GIAN (doanh thu theo tháng) → biểu đồ ĐƯỜNG.\n- TỈ LỆ PHẦN trong một TỔNG (thị phần các hãng) → biểu đồ TRÒN — nhưng cảnh báo: quá nhiều lát (thường tính là TRÊN 6 lát) thì mắt người khó phân biệt và so sánh diện tích, nên đổi sang biểu đồ CỘT dù vẫn đang nói về tỉ lệ phần trong tổng.\n\nMột biểu đồ nên nói ĐÚNG MỘT Ý — nhồi quá nhiều chuỗi số/màu sắc vào một biểu đồ khiến người xem không biết nên nhìn kết luận nào.',
    workedExample: {
      code: `def muc_phong_dai(gia_tri_lon_nhat, truc_y_bat_dau):
    khoang_truc_hien_tai = gia_tri_lon_nhat - truc_y_bat_dau
    if khoang_truc_hien_tai <= 0:
        return 1.0
    return gia_tri_lon_nhat / khoang_truc_hien_tai


# Bieu do "doanh thu tang vot": that ra chi tang tu 1000 len 1050 (5%)
print(f"Truc cat goc (0): phong dai {muc_phong_dai(1050, 0):.2f} lan")
print(f"Truc bat dau tu 950: phong dai {muc_phong_dai(1050, 950):.2f} lan")
# Truc bat dau cang gan gia tri lon nhat thi phong dai cang manh`,
      stdinLines: [],
    },
    predict: {
      code: `def muc_phong_dai(gia_tri_lon_nhat, truc_y_bat_dau):
    khoang_truc_hien_tai = gia_tri_lon_nhat - truc_y_bat_dau
    if khoang_truc_hien_tai <= 0:
        return 1.0
    return gia_tri_lon_nhat / khoang_truc_hien_tai

print(round(muc_phong_dai(200, 180), 1))`,
      question: 'gia_tri_lon_nhat=200, truc_y_bat_dau=180. Kết quả in ra?',
      choices: ['10.0', '1.1', '20.0', '0.1'],
      answerIndex: 0,
      explain:
        'khoang_truc_hien_tai = 200 - 180 = 20. muc_phong_dai = 200 / 20 = 10.0. Trục chỉ còn trải dài 20 đơn vị thay vì 200 đơn vị nếu cắt gốc, nên chênh lệch trực quan bị thổi lên gấp 10 lần.',
    },
    parsons: {
      prompt: 'Xếp lại hàm tính mức phóng đại khi trục Y không cắt gốc.',
      lines: [
        'def muc_phong_dai(gia_tri_lon_nhat, truc_y_bat_dau):',
        '    khoang_truc_hien_tai = gia_tri_lon_nhat - truc_y_bat_dau',
        '    if khoang_truc_hien_tai <= 0:',
        '        return 1.0',
        '    return gia_tri_lon_nhat / khoang_truc_hien_tai',
      ],
    },
    make: {
      prompt:
        'Viết hàm kiểm tra biểu đồ cột có trục Y bị cắt gây phóng đại không.\n\nChương trình đọc 1 dòng: "gia_tri_nho_nhat gia_tri_lon_nhat truc_y_bat_dau_tu" (3 số thực cách nhau dấu cách).\n\nQuy tắc:\n- Nếu truc_y_bat_dau_tu <= 0 (trục CÓ cắt gốc): in "OK: truc cat goc, khong phong dai".\n- Nếu truc_y_bat_dau_tu > 0 (trục KHÔNG cắt gốc): tính muc_phong_dai = gia_tri_lon_nhat / (gia_tri_lon_nhat - truc_y_bat_dau_tu) rồi in "CANH BAO: phong dai <muc_phong_dai làm tròn 2 chữ số thập phân> lan".',
      starterCode: `gia_tri_nho_nhat, gia_tri_lon_nhat, truc_y_bat_dau_tu = [float(x) for x in input().split()]
# Neu truc_y_bat_dau_tu <= 0: in "OK: truc cat goc, khong phong dai"
# Nguoc lai: tinh muc phong dai roi in "CANH BAO: phong dai <so> lan"
`,
      testCases: [
        {
          stdinLines: ['1000 1050 950'],
          expected: 'CANH BAO: phong dai 10.50 lan',
          match: 'contains',
          hidden: false,
          label: 'Trục bắt đầu từ 950, gần sát giá trị lớn nhất 1050 -> phóng đại mạnh',
        },
        {
          stdinLines: ['0 1050 0'],
          expected: 'OK: truc cat goc, khong phong dai',
          match: 'contains',
          hidden: false,
          label: 'Trục bắt đầu từ 0 -> không phóng đại, in OK',
        },
        {
          stdinLines: ['10 200 180'],
          expected: 'CANH BAO: phong dai 10.00 lan',
          match: 'contains',
          hidden: false,
          label: 'Trục 180 trên nền 200 -> phóng đại đúng 10 lần',
        },
        {
          stdinLines: ['5 100 -20'],
          expected: 'OK: truc cat goc, khong phong dai',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: trục âm vẫn tính là cắt gốc (đi qua 0) -> OK, không cảnh báo',
        },
        {
          stdinLines: ['50 500 100'],
          expected: 'CANH BAO: phong dai 1.25 lan',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: trục bắt đầu từ 100 trên nền 500 -> phóng đại nhẹ 1.25 lần',
        },
      ],
      hints: [
        'Đọc 3 số bằng [float(x) for x in input().split()], gán đúng thứ tự gia_tri_nho_nhat, gia_tri_lon_nhat, truc_y_bat_dau_tu.',
        'Kiểm truc_y_bat_dau_tu <= 0 trước — bao gồm cả trục âm, vì trục đi qua 0 vẫn coi là cắt gốc.',
        'Khi phải cảnh báo: muc_phong_dai = gia_tri_lon_nhat / (gia_tri_lon_nhat - truc_y_bat_dau_tu).',
        'In bằng f-string với :.2f để làm tròn đúng 2 chữ số thập phân, khớp định dạng "CANH BAO: phong dai <so> lan".',
      ],
      sampleSolution: `gia_tri_nho_nhat, gia_tri_lon_nhat, truc_y_bat_dau_tu = [float(x) for x in input().split()]

if truc_y_bat_dau_tu <= 0:
    print("OK: truc cat goc, khong phong dai")
else:
    muc_phong_dai = gia_tri_lon_nhat / (gia_tri_lon_nhat - truc_y_bat_dau_tu)
    print(f"CANH BAO: phong dai {muc_phong_dai:.2f} lan")`,
    },
    homework:
      'Tìm một biểu đồ cột trên báo/mạng xã hội (kinh tế, thể thao, thời sự đều được). Xem trục Y có bắt đầu từ 0 không. Nếu không, ước lượng gia_tri_lon_nhat và truc_y_bat_dau_tu rồi tự tính mức phóng đại bằng công thức trong bài. Ngoài ra tìm một biểu đồ tròn có quá 6 lát và thử hình dung nếu đổi sang biểu đồ cột sẽ dễ đọc hơn ở chỗ nào.',
    srsCards: [
      {
        hoi: 'Vì sao trục Y không bắt đầu từ 0 lại gây hiểu sai ở biểu đồ cột?',
        dap: 'Trục chỉ trải dài đúng khoảng chênh lệch dữ liệu nên một khác biệt nhỏ chiếm gần hết chiều cao biểu đồ, khiến người xem thấy nó lớn hơn thực tế nhiều lần.',
      },
      {
        hoi: 'Muốn so sánh nhiều danh mục thì nên dùng loại biểu đồ nào?',
        dap: 'Biểu đồ CỘT — mỗi cột một danh mục, dễ so chiều cao trực tiếp.',
      },
      {
        hoi: 'Vì sao biểu đồ tròn có quá nhiều lát (trên 6) nên đổi sang biểu đồ cột?',
        dap: 'Mắt người khó so sánh chính xác diện tích/góc của nhiều lát nhỏ cùng lúc; biểu đồ cột xếp cạnh nhau dễ so chiều cao hơn dù vẫn đang thể hiện tỉ lệ phần trong tổng.',
      },
    ],
  },
]
