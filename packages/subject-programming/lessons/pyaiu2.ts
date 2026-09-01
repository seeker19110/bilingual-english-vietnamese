// lessons/pyaiu2.ts — Chương C2 "Cấu trúc dữ liệu, file & OOP" của khoá "Python / AI Cơ Bản"
// (pyai) (docs/specs/2026-09-01-pyai-bai-hoc-chi-tiet.md).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const PYAI_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'pyai-u2-l1',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'List — chứa nhiều dữ liệu và tự cài tổng, trung bình, lớn nhất',
    hook: 'Một biến chứa được một số. Nhưng lớp có 40 điểm, cửa hàng có 300 đơn, mô hình học từ 10.000 mẫu. Bạn không đặt 40 cái tên biến — bạn dùng LIST, một cái hộp dài chứa được cả dãy, và duyệt qua nó bằng vòng lặp.',
    theory:
      'LIST là dãy các giá trị có THỨ TỰ, viết trong ngoặc vuông: diem = [8, 6, 9].\n\n- Truy cập bằng CHỈ SỐ, đếm từ 0: diem[0] là 8, diem[2] là 9. Chỉ số âm đếm từ cuối: diem[-1] là phần tử cuối.\n- len(diem) cho số phần tử (3). Chỉ số hợp lệ là 0 tới len - 1; diem[3] báo IndexError.\n- diem.append(7) thêm vào cuối; list SỬA ĐƯỢC tại chỗ (khác chuỗi).\n- Duyệt: for d in diem: — d lần lượt nhận từng giá trị.\n\nPython có sẵn sum(), max(), min(), nhưng hôm nay ta TỰ CÀI để hiểu ruột, vì mọi thuật toán học máy sau này đều là biến thể của đúng ba mẫu vòng lặp dưới đây:\n\n1. CỘNG DỒN (tổng): đặt tong = 0 trước vòng lặp, mỗi vòng tong = tong + x.\n2. TÌM CỰC TRỊ (lớn nhất): đặt lon_nhat = phần tử ĐẦU TIÊN, mỗi vòng nếu x > lon_nhat thì thay. Khởi tạo bằng 0 là SAI khi dãy toàn số âm — đó là lỗi ca biên kinh điển.\n3. TRUNG BÌNH: tổng chia số phần tử. Phép / luôn cho float, nên 60 / 3 in ra 20.0 chứ không phải 20.\n\nGiá trị khởi tạo là chỗ dễ sai nhất: hãy luôn tự hỏi "nếu dãy chỉ có một phần tử thì sao? nếu toàn số âm thì sao?".',
    workedExample: {
      code: `diem = [8, 6, 9, 5]

tong = 0                          # bien cong don, bat dau tu 0
for d in diem:
    tong = tong + d               # moi vong cong them mot phan tu

lon_nhat = diem[0]                # KHOI TAO bang phan tu dau, khong phai 0
for d in diem:
    if d > lon_nhat:
        lon_nhat = d              # gap so lon hon thi thay the

print(f"Tong: {tong}")
print(f"Trung binh: {tong / len(diem)}")   # phep / luon ra so thuc
print(f"Lon nhat: {lon_nhat}")
print(f"Phan tu dau: {diem[0]}, phan tu cuoi: {diem[-1]}")`,
      stdinLines: [],
    },
    predict: {
      code: `so = [-5, -2, -9]\nlon_nhat = 0\nfor s in so:\n    if s > lon_nhat:\n        lon_nhat = s\nprint(lon_nhat)`,
      question: 'Đoạn code tìm số lớn nhất này in ra gì?',
      choices: ['0', '-2', '-9', '-5'],
      answerIndex: 0,
      explain:
        'Khởi tạo lon_nhat = 0 là sai: không số âm nào lớn hơn 0 nên nhánh if không bao giờ chạy, kết quả in 0 — một số KHÔNG CÓ trong dãy. Phải khởi tạo bằng phần tử đầu tiên (so[0]) thì mới ra -2.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: đọc dữ liệu → khởi tạo biến cộng dồn → duyệt cộng → in trung bình.',
      lines: [
        'dong = input("Cac so: ")',
        'so = [int(x) for x in dong.split(",")]',
        'tong = 0',
        'for s in so:',
        '    tong = tong + s',
        'print(f"Tong: {tong}")',
        'print(f"Trung binh: {tong / len(so)}")',
      ],
    },
    make: {
      prompt:
        'Viết bộ thống kê tự cài (KHÔNG dùng sum, max, min có sẵn — hãy tự viết vòng lặp).\n\nĐọc 1 dòng input() là các số nguyên cách nhau bởi dấu phẩy (vd "10,20,30").\n\nIn đúng 4 dòng:\nTong: <tong>\nTrung binh: <tong chia so phan tu>\nLon nhat: <so lon nhat>\nNho nhat: <so nho nhat>\n\nVí dụ "10,20,30" → Tong: 60, Trung binh: 20.0, Lon nhat: 30, Nho nhat: 10.\nChú ý: trung bình dùng phép / nên luôn có phần thập phân (20.0).',
      starterCode: `dong = input("Cac so: ")
so = [int(x) for x in dong.split(",")]
tong = 0
lon_nhat = so[0]
nho_nhat = so[0]
# Duyet mot vong for, cap nhat ca ba bien tren
`,
      testCases: [
        {
          stdinLines: ['10,20,30'],
          expected: 'Tong: 60\nTrung binh: 20.0\nLon nhat: 30\nNho nhat: 10',
          match: 'contains',
          hidden: false,
          label: 'Ba số dương → tổng 60, trung bình 20.0',
        },
        {
          stdinLines: ['3,-1,7,7'],
          expected: 'Tong: 16\nTrung binh: 4.0\nLon nhat: 7\nNho nhat: -1',
          match: 'contains',
          hidden: false,
          label: 'Có số âm và số lặp lại → nhỏ nhất là -1',
        },
        {
          stdinLines: ['-5,-2,-9'],
          expected: 'Lon nhat: -2',
          match: 'contains',
          hidden: false,
          label: 'Toàn số âm → lớn nhất là -2, không phải 0',
        },
        {
          stdinLines: ['5'],
          expected: 'Tong: 5\nTrung binh: 5.0\nLon nhat: 5\nNho nhat: 5',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy chỉ có MỘT phần tử — cả bốn dòng đều về nó',
        },
      ],
      hints: [
        'Khởi tạo lon_nhat và nho_nhat bằng so[0] chứ KHÔNG phải 0 — nếu không, dãy toàn số âm sẽ cho kết quả sai.',
        'Một vòng for duy nhất là đủ cho cả ba việc: cộng dồn tong, so sánh cập nhật lon_nhat, so sánh cập nhật nho_nhat.',
        'Trung bình: tong / len(so) — dùng dấu / (ra số thực) chứ không phải // (chia lấy nguyên), để in ra đúng 20.0.',
      ],
      sampleSolution: `dong = input("Cac so: ")
so = [int(x) for x in dong.split(",")]
tong = 0
lon_nhat = so[0]
nho_nhat = so[0]
for s in so:
    tong = tong + s
    if s > lon_nhat:
        lon_nhat = s
    if s < nho_nhat:
        nho_nhat = s
print(f"Tong: {tong}")
print(f"Trung binh: {tong / len(so)}")
print(f"Lon nhat: {lon_nhat}")
print(f"Nho nhat: {nho_nhat}")`,
    },
    homework:
      'Thêm hai chỉ số nữa mà học máy dùng suốt: KHOẢNG BIẾN THIÊN (lớn nhất trừ nhỏ nhất) và ĐỘ LỆCH so với trung bình của từng phần tử (in mỗi số kèm chênh lệch của nó). Rồi thử với dãy [10, 10, 10, 100]: trung bình là 32.5 nhưng không có số nào gần 32.5 cả — hãy tự rút ra vì sao chỉ nhìn trung bình là dễ bị lừa, một bài học sẽ quay lại ở khoá Toán Thiết Yếu cho AI.',
    srsCards: [
      {
        hoi: 'Khi tự cài "tìm số lớn nhất", khởi tạo biến bằng gì mới đúng?',
        dap: 'Bằng PHẦN TỬ ĐẦU TIÊN của dãy (so[0]), không phải 0. Khởi tạo bằng 0 khiến dãy toàn số âm trả về 0 — một giá trị không có trong dãy. Đây là lỗi ca biên kinh điển mà máy không hề báo.',
      },
      {
        hoi: 'Chỉ số của list bắt đầu từ đâu, và chỉ số âm nghĩa là gì?',
        dap: 'Bắt đầu từ 0, nên phần tử cuối có chỉ số len - 1. Chỉ số âm đếm ngược từ cuối: danh_sach[-1] là phần tử cuối, [-2] là kế cuối. Vượt phạm vi sẽ báo IndexError.',
      },
      {
        hoi: 'Ba mẫu vòng lặp cơ bản trên list là gì?',
        dap: 'Cộng dồn (khởi tạo tong = 0, mỗi vòng cộng thêm), tìm cực trị (khởi tạo bằng phần tử đầu, so sánh rồi thay), và đếm/lọc theo điều kiện. Mọi thuật toán học máy tự cài về sau đều là biến thể của ba mẫu này.',
      },
    ],
  },
  {
    id: 'pyai-u2-l2',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Dict — đếm tần suất từ, nền móng của NLP',
    hook: 'Muốn biết một bài viết nói về cái gì, cách thô sơ nhất mà hiệu quả đến bất ngờ là ĐẾM TỪ: từ nào xuất hiện nhiều thì bài nói về cái đó. Bộ lọc thư rác đầu tiên trên đời, và cả bag-of-words trong xử lý ngôn ngữ, đều đứng trên đúng phép đếm này.',
    theory:
      'DICT (từ điển) lưu các cặp KHOÁ → GIÁ TRỊ, viết trong ngoặc nhọn: dem = {"toi": 2, "hoc": 1}.\n\n- Truy cập bằng KHOÁ chứ không bằng chỉ số: dem["toi"] cho 2. Khoá không tồn tại thì báo KeyError.\n- Gán dem["moi"] = 5 vừa là thêm mới vừa là cập nhật.\n- "toi" in dem cho True/False — kiểm tra khoá có tồn tại không.\n- dem.get("xyz", 0) lấy giá trị, nếu không có thì trả về 0 thay vì báo lỗi. Đây là mẹo gọn nhất để đếm.\n- dem.items() cho từng cặp (khoá, giá trị) để duyệt bằng for k, v in dem.items().\n\nMẪU ĐẾM TẦN SUẤT (nhớ thuộc lòng, dùng cả đời):\nfor tu in cau.split():\n    dem[tu] = dem.get(tu, 0) + 1\nDòng này đọc là: "lấy số đếm cũ của từ này, không có thì coi là 0, cộng thêm 1, cất lại".\n\nSẮP XẾP KẾT QUẢ: sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])) sắp theo số đếm GIẢM dần (dấu trừ đảo chiều), và khi bằng nhau thì theo thứ tự chữ cái TĂNG dần. Việc quy định rõ cách phá hoà (tie-break) rất quan trọng: nếu không, thứ tự in ra có thể khác nhau giữa các lần chạy và test sẽ chập chờn.\n\nLIST hay DICT? List khi bạn cần THỨ TỰ và truy cập theo vị trí; dict khi cần TRA CỨU theo tên/khoá — tra trong dict nhanh gần như tức thì dù có một triệu khoá, còn tìm trong list phải duyệt lần lượt.',
    workedExample: {
      code: `cau = "toi thich hoc toi thich python"

dem = {}                                  # dict rong
for tu in cau.split():                    # tach cau thanh tung tu
    dem[tu] = dem.get(tu, 0) + 1          # mau dem tan suat

print(f"So tu khac nhau: {len(dem)}")

# Sap theo so dem GIAM dan, hoa nhau thi theo chu cai TANG dan
thu_tu = sorted(dem.items(), key=lambda kv: (-kv[1], kv[0]))
for tu, n in thu_tu:
    print(f"{tu}: {n}")`,
      stdinLines: [],
    },
    predict: {
      code: `dem = {"a": 1}\nprint(dem.get("b", 0))`,
      question: 'Dòng này in ra gì?',
      choices: ['0', 'None', 'Báo lỗi KeyError', 'b'],
      answerIndex: 0,
      explain:
        'Khoá "b" không có trong dict. Nếu viết dem["b"] thì báo KeyError, nhưng .get("b", 0) trả về giá trị mặc định 0 — đúng thứ ta cần khi đếm từ mới gặp lần đầu.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự mẫu đếm tần suất từ và in ra theo thứ tự đã sắp.',
      lines: [
        'cau = input("Cau: ")',
        'dem = {}',
        'for tu in cau.split():',
        '    dem[tu] = dem.get(tu, 0) + 1',
        'thu_tu = sorted(dem.items(), key=lambda kv: (-kv[1], kv[0]))',
        'for tu, n in thu_tu:',
        '    print(f"{tu}: {n}")',
      ],
    },
    make: {
      prompt:
        'Viết máy đếm tần suất từ. Đọc 1 dòng input() là một câu tiếng Việt KHÔNG DẤU, các từ cách nhau bởi khoảng trắng.\n\nIn dòng đầu:\nSo tu khac nhau: <n>\nRồi in mỗi từ một dòng theo dạng <tu>: <so lan>, sắp xếp theo số lần GIẢM dần; nếu hai từ bằng số lần thì từ nào đứng trước theo thứ tự chữ cái in trước.\n\nVí dụ "toi thich hoc toi thich python" → 4 từ khác nhau, rồi thich: 2, toi: 2, hoc: 1, python: 1.',
      starterCode: `cau = input("Cau: ")
dem = {}
# Dem tan suat bang mau dem[tu] = dem.get(tu, 0) + 1
# In so tu khac nhau, roi sap xep va in tung dong
`,
      testCases: [
        {
          stdinLines: ['toi thich hoc toi thich python'],
          expected: 'So tu khac nhau: 4\nthich: 2\ntoi: 2\nhoc: 1\npython: 1',
          match: 'contains',
          hidden: false,
          label: 'Hai cặp hoà nhau → phá hoà bằng thứ tự chữ cái',
        },
        {
          stdinLines: ['a a a'],
          expected: 'So tu khac nhau: 1\na: 3',
          match: 'contains',
          hidden: false,
          label: 'Một từ lặp 3 lần',
        },
        {
          stdinLines: ['b a'],
          expected: 'a: 1\nb: 1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: hai từ cùng tần suất 1 → phải in theo chữ cái, a trước b',
        },
      ],
      hints: [
        'Đếm gọn nhất: dem[tu] = dem.get(tu, 0) + 1 — không cần if kiểm tra khoá đã tồn tại chưa.',
        'Số từ KHÁC NHAU là len(dem) (số khoá), không phải len(cau.split()) (tổng số từ).',
        'Sắp xếp hai tiêu chí trong một lần: sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])). Dấu trừ đảo chiều số đếm; phần tử thứ hai của tuple lo việc phá hoà theo chữ cái.',
      ],
      sampleSolution: `cau = input("Cau: ")
dem = {}
for tu in cau.split():
    dem[tu] = dem.get(tu, 0) + 1
print(f"So tu khac nhau: {len(dem)}")
for tu, n in sorted(dem.items(), key=lambda kv: (-kv[1], kv[0])):
    print(f"{tu}: {n}")`,
    },
    homework:
      'Thêm danh sách STOPWORDS (từ vô nghĩa về nội dung: "va", "la", "cua", "toi", "nay") và bỏ chúng ra trước khi đếm. Chạy lại trên một đoạn văn dài bạn tự chọn rồi xem 5 từ đầu bảng: chúng có nói đúng chủ đề đoạn văn không? Bạn vừa tự tay làm phiên bản thô sơ của bag-of-words — thứ mà bài lọc thư rác ở chương 3 và cả TF-IDF ở khoá Machine Learning sẽ dựng tiếp lên.',
    srsCards: [
      {
        hoi: 'Mẫu đếm tần suất bằng dict viết thế nào và đọc ra sao?',
        dap: 'dem[tu] = dem.get(tu, 0) + 1 — đọc là "lấy số đếm cũ của từ này, chưa có thì coi là 0, cộng thêm 1, cất lại". Gọn hơn hẳn việc dùng if để kiểm tra khoá đã tồn tại.',
      },
      {
        hoi: 'dem["x"] và dem.get("x", 0) khác nhau chỗ nào?',
        dap: 'Nếu khoá "x" không tồn tại, dem["x"] báo lỗi KeyError và dừng chương trình, còn .get("x", 0) trả về giá trị mặc định 0 và chạy tiếp. Dùng .get khi khoá có thể chưa có.',
      },
      {
        hoi: 'Khi nào dùng list, khi nào dùng dict?',
        dap: 'List khi cần THỨ TỰ và truy cập theo vị trí (điểm của 40 học sinh theo danh sách). Dict khi cần TRA CỨU theo tên/khoá — tra dict nhanh gần như tức thì dù có triệu khoá, còn tìm trong list phải duyệt lần lượt.',
      },
    ],
  },
  {
    id: 'pyai-u2-l3',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Đọc & ghi file CSV bằng Python thuần',
    hook: 'Chương trình tắt là biến mất sạch: mọi thứ trong RAM không sống qua một lần đóng cửa sổ. Muốn dữ liệu ở lại, phải ghi xuống FILE. Và định dạng dữ liệu phổ biến nhất hành tinh không phải Excel — mà là CSV, một file text mỗi dòng một bản ghi, các cột cách nhau bởi dấu phẩy.',
    theory:
      'MỞ FILE dùng khối with, để Python tự đóng file kể cả khi có lỗi:\n\nwith open("diem.csv", "w") as f:      # "w" = write, XOÁ SẠCH nội dung cũ\n    f.write("An,8\\n")                 # phải tự thêm \\n xuống dòng\n\nwith open("diem.csv") as f:           # mặc định là "r" = read\n    for dong in f:                    # duyệt từng dòng\n        print(dong.strip())           # strip() bỏ ký tự xuống dòng ở cuối\n\nCác chế độ: "r" đọc (mặc định), "w" ghi đè từ đầu, "a" ghi thêm vào cuối. Nhầm "w" thành "a" (hay ngược lại) là mất dữ liệu hoặc nhân đôi dữ liệu — hãy nghĩ kỹ trước khi gõ.\n\nCSV (Comma-Separated Values) là file text thuần: mỗi dòng một bản ghi, các cột cách nhau bởi dấu phẩy.\nAn,8\nBinh,6\nTách một dòng thành cột: ten, diem = dong.strip().split(","). Phép gán này gọi là GIẢI NÉN (unpacking) — số biến bên trái phải đúng bằng số phần bên phải, sai là báo ValueError.\n\nHAI LỖI PHẢI NHỚ:\n1. Quên .strip(): giá trị cột cuối sẽ dính ký tự xuống dòng, và int("8\\n") tuy vẫn chạy nhưng so sánh chuỗi thì sai.\n2. Dòng RỖNG ở cuối file: file kết thúc bằng \\n nên vòng lặp có thể gặp một dòng rỗng — luôn bỏ qua bằng if not dong.strip(): continue.\n\nThư viện csv và pandas làm việc này gọn hơn nhiều, nhưng hôm nay ta làm tay để thấy CSV chẳng có gì huyền bí: chỉ là chuỗi và split.',
    workedExample: {
      code: `# GHI file: moi dong mot ban ghi "ten,diem"
with open("diem.csv", "w") as f:
    f.write("An,8\\n")                  # tu them ky tu xuong dong
    f.write("Binh,6\\n")

# DOC lai chinh file vua ghi
tong = 0
dem = 0
with open("diem.csv") as f:
    for dong in f:
        dong = dong.strip()            # bo ky tu xuong dong o cuoi
        if not dong:                   # bo qua dong rong
            continue
        ten, diem = dong.split(",")    # giai nen thanh 2 bien
        print(f"{ten}: {diem}")
        tong = tong + int(diem)        # diem dang la CHUOI, phai doi sang so
        dem = dem + 1
print(f"Trung binh: {tong / dem}")`,
      stdinLines: [],
    },
    predict: {
      code: `dong = "An,8\\n"\nten, diem = dong.strip().split(",")\nprint(int(diem) + 1)`,
      question: 'Đoạn code này in ra gì?',
      choices: ['9', '81', 'Báo lỗi vì diem là chuỗi', '8'],
      answerIndex: 0,
      explain:
        'strip() bỏ ký tự xuống dòng, split(",") cho ["An", "8"], giải nén vào hai biến nên diem = "8" (chuỗi). int("8") + 1 = 9. Nếu quên int thì "8" + 1 mới báo TypeError.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: ghi file xuống đĩa trước, rồi mở đọc lại và tách cột.',
      lines: [
        'with open("diem.csv", "w") as f:',
        '    f.write("An,8\\n")',
        'with open("diem.csv") as f:',
        '    for dong in f:',
        '        dong = dong.strip()',
        '        ten, diem = dong.split(",")',
        '        print(f"{ten}: {diem}")',
      ],
    },
    make: {
      prompt:
        'Viết chương trình lưu bảng điểm ra file rồi đọc lại.\n\nĐọc từ input():\n- Dòng 1: số học viên n.\n- n dòng tiếp theo, mỗi dòng dạng "ten,diem" (vd "An,8").\n\nGhi đúng n dòng đó vào file diem.csv, sau đó MỞ LẠI chính file này để đọc và in:\n<ten>: <diem>   (mỗi học viên một dòng, đúng thứ tự trong file)\nTrung binh: <trung binh diem>\n\nVí dụ nhập 2 · "An,8" · "Binh,6" → in "An: 8", "Binh: 6", "Trung binh: 7.0".',
      starterCode: `n = int(input("So hoc vien: "))
cac_dong = []
for _ in range(n):
    cac_dong.append(input())
# Ghi cac_dong xuong file diem.csv (nho them "\\n" moi dong)
# Roi mo lai file do de doc, in tung dong va tinh trung binh
`,
      testCases: [
        {
          stdinLines: ['2', 'An,8', 'Binh,6'],
          expected: 'An: 8\nBinh: 6\nTrung binh: 7.0',
          match: 'contains',
          hidden: false,
          label: '2 học viên → trung bình 7.0',
        },
        {
          stdinLines: ['3', 'A,5', 'B,6', 'C,10'],
          expected: 'A: 5\nB: 6\nC: 10\nTrung binh: 7.0',
          match: 'contains',
          hidden: false,
          label: '3 học viên, tổng 21 → trung bình 7.0',
        },
        {
          stdinLines: ['1', 'Chi,10'],
          expected: 'Chi: 10\nTrung binh: 10.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng 1 học viên — không được chia cho 0 hay bỏ sót',
        },
      ],
      hints: [
        'Đọc n dòng bằng vòng lặp for _ in range(n): rồi append vào một list trước khi ghi file.',
        'f.write KHÔNG tự xuống dòng: phải viết f.write(dong + "\\n"), nếu không mọi bản ghi dính thành một dòng dài.',
        'Khi đọc lại, luôn dong = dong.strip() rồi bỏ qua dòng rỗng (if not dong: continue) trước khi split(","), vì file kết thúc bằng ký tự xuống dòng.',
      ],
      sampleSolution: `n = int(input("So hoc vien: "))
cac_dong = []
for _ in range(n):
    cac_dong.append(input())

with open("diem.csv", "w") as f:
    for dong in cac_dong:
        f.write(dong + "\\n")

tong = 0
dem = 0
with open("diem.csv") as f:
    for dong in f:
        dong = dong.strip()
        if not dong:
            continue
        ten, diem = dong.split(",")
        print(f"{ten}: {diem}")
        tong = tong + int(diem)
        dem = dem + 1
print(f"Trung binh: {tong / dem}")`,
    },
    homework:
      'Đổi chế độ mở file từ "w" sang "a" rồi chạy chương trình hai lần với cùng dữ liệu — quan sát file phình lên gấp đôi, đó chính là lỗi "ghi trùng" hay gặp khi làm việc thật. Sau đó thêm một cột nữa (lop) thành "ten,lop,diem" và tính trung bình RIÊNG cho từng lớp bằng dict {lop: [danh sách điểm]} — bạn vừa tự cài phép group-by, thao tác trung tâm của mọi công việc phân tích dữ liệu.',
    srsCards: [
      {
        hoi: 'Ba chế độ mở file "r", "w", "a" khác nhau thế nào?',
        dap: '"r" chỉ đọc (mặc định); "w" ghi mới và XOÁ SẠCH nội dung cũ ngay khi mở; "a" ghi THÊM vào cuối, giữ nguyên nội dung cũ. Nhầm giữa "w" và "a" gây mất dữ liệu hoặc nhân đôi dữ liệu.',
      },
      {
        hoi: 'Vì sao phải gọi .strip() cho mỗi dòng khi đọc file?',
        dap: 'Vì mỗi dòng đọc lên còn dính ký tự xuống dòng \\n ở cuối, làm giá trị cột cuối bị sai khi so sánh chuỗi. strip() cũng cho phép phát hiện dòng RỖNG ở cuối file để bỏ qua trước khi split.',
      },
      {
        hoi: 'CSV là gì và tách một dòng CSV thành cột bằng cách nào?',
        dap: 'CSV (Comma-Separated Values) là file text thuần, mỗi dòng một bản ghi, các cột cách nhau dấu phẩy. Tách bằng ten, diem = dong.strip().split(",") — phép giải nén này đòi số biến bên trái đúng bằng số cột, sai sẽ báo ValueError.',
      },
    ],
  },
  {
    id: 'pyai-u2-l4',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Lớp & đối tượng — gói dữ liệu cùng hành vi',
    hook: 'Một học viên gồm tên, danh sách điểm, cách tính trung bình, cách xếp loại. Nếu để rời rạc thì bạn có ten1, diem1, ten2, diem2... và một mớ hàm nhận cả đống tham số. LỚP gói dữ liệu và hành vi liên quan vào một chỗ, để mỗi học viên là MỘT vật thể tự biết cách tính điểm của chính mình.',
    theory:
      'LỚP (class) là KHUÔN; ĐỐI TƯỢNG (object) là vật đúc ra từ khuôn đó.\n\nclass HocVien:\n    def __init__(self, ten):     # hàm khởi tạo, chạy khi tạo đối tượng mới\n        self.ten = ten           # thuộc tính, gắn vào chính đối tượng này\n        self.diem = []\n\n    def them_diem(self, d):      # phương thức = hàm thuộc về lớp\n        self.diem.append(d)\n\na = HocVien("An")                # tạo đối tượng, __init__ chạy tự động\na.them_diem(8)                   # gọi phương thức bằng dấu chấm\nprint(a.ten)\n\nBA điều bắt buộc nhớ:\n1. self là chính đối tượng đang được thao tác. Mọi phương thức phải có self làm tham số ĐẦU TIÊN, nhưng khi gọi thì KHÔNG truyền nó — Python tự điền. Quên self trong định nghĩa là lỗi phổ biến nhất của người mới học OOP.\n2. self.ten (có self) là thuộc tính sống cùng đối tượng; ten (không self) chỉ là biến cục bộ, chết khi hàm xong.\n3. __init__ chạy TỰ ĐỘNG một lần khi tạo đối tượng — đây là chỗ đặt giá trị ban đầu. Hai đối tượng tạo từ cùng một lớp có dữ liệu HOÀN TOÀN RIÊNG: sửa điểm của a không đụng gì tới b.\n\nKHI NÀO DÙNG LỚP: khi một nhóm dữ liệu luôn đi cùng nhau VÀ có những việc chỉ làm trên nhóm đó. Đừng lạm dụng — một hàm đơn giản thì cứ để là hàm. Về sau bạn sẽ gặp lại đúng ý tưởng này trong thư viện ML: model = LinearRegression() rồi model.fit(X, y) chính là tạo đối tượng và gọi phương thức của nó.',
    workedExample: {
      code: `class HocVien:
    def __init__(self, ten):        # chay tu dong khi tao doi tuong
        self.ten = ten              # thuoc tinh rieng cua doi tuong nay
        self.diem = []              # moi doi tuong co list rieng

    def them_diem(self, d):
        self.diem.append(d)

    def trung_binh(self):
        tong = 0
        for d in self.diem:
            tong = tong + d
        return tong / len(self.diem)

a = HocVien("An")                   # doi tuong thu nhat
a.them_diem(8)
a.them_diem(9)

b = HocVien("Binh")                 # doi tuong thu hai, du lieu RIENG
b.them_diem(5)

print(f"{a.ten}: {a.trung_binh()}") # 17 / 2 = 8.5
print(f"{b.ten}: {b.trung_binh()}") # 5 / 1 = 5.0`,
      stdinLines: [],
    },
    predict: {
      code: `class X:\n    def __init__(self):\n        self.so = []\n\na = X()\nb = X()\na.so.append(1)\nprint(len(b.so))`,
      question: 'Dòng cuối in ra gì?',
      choices: ['0', '1', 'None', 'Báo lỗi'],
      answerIndex: 0,
      explain:
        'Mỗi lần gọi X() là __init__ chạy lại và tạo một list MỚI gán vào self.so của riêng đối tượng đó. Thêm vào a.so hoàn toàn không đụng tới b.so, nên b.so vẫn rỗng, len là 0.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự: định nghĩa lớp với __init__ và phương thức, rồi tạo đối tượng và gọi.',
      lines: [
        'class HocVien:',
        '    def __init__(self, ten):',
        '        self.ten = ten',
        '        self.diem = []',
        '    def them_diem(self, d):',
        '        self.diem.append(d)',
        'a = HocVien("An")',
        'a.them_diem(8)',
        'print(a.ten, a.diem)',
      ],
    },
    make: {
      prompt:
        'Viết lớp HocVien có: __init__(self, ten) đặt self.ten và self.diem = []; phương thức them_diem(self, d); phương thức trung_binh(self) trả về trung bình các điểm; phương thức xep_loai(self) trả về chuỗi theo trung bình (>= 8: Gioi · >= 6.5: Kha · >= 5: Trung binh · còn lại: Yeu).\n\nĐọc từ input():\n- Dòng 1: tên học viên.\n- Dòng 2: các điểm cách nhau bởi dấu phẩy (vd "8,9,7").\n\nTạo đối tượng, thêm từng điểm, rồi in đúng 3 dòng:\nHoc vien: <ten>\nTrung binh: <trung binh>\nXep loai: <xep loai>\n\nVí dụ "An" và "8,9,7" → trung bình 8.0 → Gioi.',
      starterCode: `class HocVien:
    def __init__(self, ten):
        self.ten = ten
        self.diem = []
    # Them cac phuong thuc them_diem, trung_binh, xep_loai (nho tham so self)

ten = input("Ten: ")
dong = input("Cac diem: ")
`,
      testCases: [
        {
          stdinLines: ['An', '8,9,7'],
          expected: 'Hoc vien: An\nTrung binh: 8.0\nXep loai: Gioi',
          match: 'contains',
          hidden: false,
          label: 'Tổng 24 / 3 điểm = 8.0 → Gioi',
        },
        {
          stdinLines: ['Binh', '5,6,7'],
          expected: 'Trung binh: 6.0\nXep loai: Trung binh',
          match: 'contains',
          hidden: false,
          label: 'Trung bình 6.0 → xếp loại Trung binh',
        },
        {
          stdinLines: ['Chi', '5'],
          expected: 'Hoc vien: Chi\nTrung binh: 5.0\nXep loai: Trung binh',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: một điểm duy nhất, đúng ranh giới 5.0',
        },
      ],
      hints: [
        'Mọi phương thức phải có self là tham số đầu tiên khi ĐỊNH NGHĨA, nhưng khi GỌI thì không truyền: a.them_diem(8).',
        'Trong phương thức, truy cập dữ liệu của đối tượng phải có self: self.diem chứ không phải diem.',
        'Thêm điểm: for d in dong.split(","): hv.them_diem(int(d)). Nhớ đổi sang int, không thì trung bình sẽ lỗi cộng chuỗi.',
      ],
      sampleSolution: `class HocVien:
    def __init__(self, ten):
        self.ten = ten
        self.diem = []

    def them_diem(self, d):
        self.diem.append(d)

    def trung_binh(self):
        tong = 0
        for d in self.diem:
            tong = tong + d
        return tong / len(self.diem)

    def xep_loai(self):
        tb = self.trung_binh()
        if tb >= 8:
            return "Gioi"
        if tb >= 6.5:
            return "Kha"
        if tb >= 5:
            return "Trung binh"
        return "Yeu"

ten = input("Ten: ")
dong = input("Cac diem: ")
hv = HocVien(ten)
for d in dong.split(","):
    hv.them_diem(int(d))
print(f"Hoc vien: {hv.ten}")
print(f"Trung binh: {hv.trung_binh()}")
print(f"Xep loai: {hv.xep_loai()}")`,
    },
    homework:
      'Viết thêm lớp Lop chứa một list các đối tượng HocVien, với phương thức them(hv), trung_binh_lop() và gioi_nhat() trả về học viên có trung bình cao nhất. Chú ý gioi_nhat() phải trả về ĐỐI TƯỢNG chứ không phải tên, để bên ngoài còn dùng tiếp được .ten và .xep_loai() của nó. Đây là lần đầu bạn cho các đối tượng chứa lẫn nhau — đúng cách mọi phần mềm lớn được dựng lên.',
    srsCards: [
      {
        hoi: 'self là gì và vì sao mọi phương thức đều phải có nó?',
        dap: 'self là chính đối tượng đang được thao tác. Nó phải là tham số ĐẦU TIÊN khi định nghĩa phương thức để hàm biết đang làm việc trên vật nào; khi gọi thì Python tự điền nên không truyền. Quên self là lỗi phổ biến nhất của người mới học OOP.',
      },
      {
        hoi: '__init__ chạy khi nào và dùng để làm gì?',
        dap: 'Chạy TỰ ĐỘNG đúng một lần ngay khi tạo đối tượng mới (HocVien("An")). Dùng để đặt các thuộc tính ban đầu qua self.x = ... Mỗi đối tượng tạo ra có bộ dữ liệu hoàn toàn riêng, sửa cái này không đụng cái kia.',
      },
      {
        hoi: 'Khi nào nên dùng lớp thay vì chỉ dùng hàm?',
        dap: 'Khi một nhóm dữ liệu luôn đi cùng nhau VÀ có những việc chỉ làm trên nhóm đó (tên + điểm + cách tính trung bình). Việc lẻ, không có trạng thái kèm theo thì cứ để là hàm — lạm dụng lớp làm code rối hơn chứ không gọn hơn.',
      },
    ],
  },
  {
    id: 'pyai-u2-l5',
    unitId: 'pyai-u2',
    language: 'python',
    title: 'Tổ chức chương trình & xử lý lỗi try/except',
    hook: 'Chương trình của bạn chạy ngon suốt buổi chiều, cho tới khi người dùng gõ chữ "muoi" vào ô số tuổi. Cả chương trình chết đứng, mọi thứ chưa lưu bay sạch. Phần mềm thật không được phép như vậy: nó phải LƯỜNG TRƯỚC rằng dữ liệu vào sẽ có ngày sai.',
    theory:
      'NGOẠI LỆ (exception) là cách Python báo "tôi không làm được việc này". Vài loại gặp nhiều:\n- ValueError — đúng kiểu nhưng sai giá trị: int("abc").\n- ZeroDivisionError — chia cho 0.\n- KeyError / IndexError — tra khoá hoặc chỉ số không tồn tại.\n- TypeError — sai kiểu: "10" + 1.\n\nBẮT LỖI:\ntry:\n    kq = a / b\nexcept ZeroDivisionError:\n    print("Loi: khong chia duoc cho 0")\nexcept ValueError:\n    print("Loi: du lieu khong phai so")\n\nHai luật quan trọng:\n1. Bắt CỤ THỂ loại lỗi mình lường trước. Viết except: trống (bắt tất) sẽ nuốt luôn cả lỗi lập trình của chính bạn, biến chương trình sai thành chương trình im lặng — khó gỡ hơn nhiều so với việc để nó chết to tiếng.\n2. Để trong try ĐÚNG những dòng có thể lỗi, càng ít càng tốt. Nhét cả chương trình vào try là mất khả năng biết lỗi đến từ đâu.\n\nTỔ CHỨC CHƯƠNG TRÌNH: chia thành các HÀM nhỏ, mỗi hàm một việc, tên nói rõ việc đó; phần đọc dữ liệu vào tách khỏi phần tính toán; hàm tính toán KHÔNG nên tự print — nó return kết quả, để chỗ gọi quyết định hiển thị thế nào. Nhờ vậy cùng một hàm dùng được cho cả bản chạy dòng lệnh lẫn bản web sau này. Khi file to lên, tách sang file riêng rồi import — mỗi file là một MODULE.',
    workedExample: {
      code: `def chia_an_toan(a, b):
    # Ham chi TRA VE chuoi ket qua, khong tu print
    try:
        return f"{a} / {b} = {a / b}"
    except ZeroDivisionError:
        return "Loi: khong chia duoc cho 0"

def doc_hai_so(dong):
    # Co the nem ValueError neu khong phai so -> de noi goi bat
    x, y = dong.split()
    return int(x), int(y)

for dong in ["10 2", "5 0", "x 1"]:
    try:
        a, b = doc_hai_so(dong)
    except ValueError:
        print("Loi: du lieu khong phai so")
        continue                     # bo qua dong nay, sang dong sau
    print(chia_an_toan(a, b))`,
      stdinLines: [],
    },
    predict: {
      code: `try:\n    print(int("abc"))\nexcept ValueError:\n    print("Loi du lieu")\nprint("Van chay tiep")`,
      question: 'Chương trình in ra những gì?',
      choices: [
        'Loi du lieu\nVan chay tiep',
        'Chỉ "Loi du lieu"',
        'Chỉ "Van chay tiep"',
        'Chương trình dừng vì lỗi',
      ],
      answerIndex: 0,
      explain:
        'int("abc") ném ValueError, nhánh except bắt được nên in "Loi du lieu" thay vì chết. Bắt xong, chương trình chạy tiếp bình thường từ dòng sau khối try nên in "Van chay tiep".',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự: định nghĩa hàm an toàn, rồi vòng lặp đọc và gọi có bắt lỗi.',
      lines: [
        'def chia_an_toan(a, b):',
        '    try:',
        '        return f"{a} / {b} = {a / b}"',
        '    except ZeroDivisionError:',
        '        return "Loi: khong chia duoc cho 0"',
        'a, b = input().split()',
        'print(chia_an_toan(int(a), int(b)))',
      ],
    },
    make: {
      prompt:
        'Viết máy tính chia có xử lý lỗi.\n\nĐọc từ input():\n- Dòng 1: số phép tính n.\n- n dòng tiếp theo, mỗi dòng là hai giá trị cách nhau bởi khoảng trắng (vd "10 2").\n\nVới mỗi dòng in đúng MỘT dòng kết quả:\n- Nếu cả hai là số và số chia khác 0: <a> / <b> = <thuong>   (vd "10 / 2 = 5.0")\n- Nếu số chia bằng 0: Loi: khong chia duoc cho 0\n- Nếu có giá trị không phải số: Loi: du lieu khong phai so\n\nChương trình KHÔNG được dừng giữa chừng vì lỗi — phải xử lý hết n dòng.',
      starterCode: `n = int(input("So phep tinh: "))
for _ in range(n):
    dong = input()
    # try: tach dong, doi sang int, chia
    # except ValueError / ZeroDivisionError: in dung thong bao tuong ung
`,
      testCases: [
        {
          stdinLines: ['3', '10 2', '5 0', 'x 1'],
          expected: '10 / 2 = 5.0',
          match: 'contains',
          hidden: false,
          label: 'Phép chia bình thường ra số thực',
        },
        {
          stdinLines: ['3', '10 2', '5 0', 'x 1'],
          expected: 'Loi: khong chia duoc cho 0',
          match: 'contains',
          hidden: false,
          label: 'Chia cho 0 → đúng thông báo lỗi',
        },
        {
          stdinLines: ['3', '10 2', '5 0', 'x 1'],
          expected: 'Loi: du lieu khong phai so',
          match: 'contains',
          hidden: false,
          label: 'Dữ liệu không phải số → đúng thông báo lỗi',
        },
        {
          stdinLines: ['2', '9 3', '0 5'],
          expected: '0 / 5 = 0.0',
          match: 'contains',
          hidden: false,
          label: 'Số bị chia bằng 0 là HỢP LỆ (0.0), khác với số chia bằng 0',
        },
        {
          stdinLines: ['1', '7 7'],
          expected: '7 / 7 = 1.0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: một phép duy nhất, kết quả 1.0 (số thực)',
        },
      ],
      hints: [
        'Đặt cả phần int(...) lẫn phép chia trong CÙNG một khối try, rồi viết hai nhánh except riêng: ValueError và ZeroDivisionError.',
        'Đừng dùng except: trống — nó nuốt luôn cả lỗi lập trình của bạn và làm bài khó gỡ. Bắt đúng loại lỗi mình lường trước.',
        'Phân biệt "0 5" (số bị chia là 0 → kết quả 0.0, hợp lệ) với "5 0" (số CHIA là 0 → ZeroDivisionError). Chỉ trường hợp sau mới báo lỗi.',
      ],
      sampleSolution: `n = int(input("So phep tinh: "))
for _ in range(n):
    dong = input()
    try:
        x, y = dong.split()
        a = int(x)
        b = int(y)
        print(f"{a} / {b} = {a / b}")
    except ValueError:
        print("Loi: du lieu khong phai so")
    except ZeroDivisionError:
        print("Loi: khong chia duoc cho 0")`,
    },
    homework:
      'Gộp lại toàn bộ chương 2 thành một chương trình quản lý điểm hoàn chỉnh: lớp HocVien (bài 4), đọc/ghi CSV (bài 3), thống kê tự cài (bài 1), thống kê tần suất xếp loại bằng dict (bài 2), và mọi chỗ đọc dữ liệu đều bọc try/except (bài này). Tách thành các hàm nhỏ có tên rõ ràng, và giữ luật: hàm tính toán chỉ return, chỉ phần main mới print. Đây là chương trình "thật" đầu tiên của bạn — hãy giữ lại, cuối khoá sẽ đọc lại nó.',
    srsCards: [
      {
        hoi: 'try / except dùng để làm gì và viết ra sao?',
        dap: 'Để chương trình không chết khi gặp lỗi lường trước được: đặt dòng có thể lỗi trong try, xử lý trong except <LoaiLoi>. Sau khi bắt xong, chương trình chạy tiếp bình thường từ sau khối try.',
      },
      {
        hoi: 'Vì sao không nên viết except: trống (bắt mọi lỗi)?',
        dap: 'Vì nó nuốt luôn cả lỗi lập trình của chính bạn (gõ nhầm tên biến, sai kiểu), biến chương trình sai thành chương trình im lặng — khó gỡ hơn nhiều so với để nó chết to tiếng. Hãy bắt đúng loại lỗi đã lường trước.',
      },
      {
        hoi: 'Vì sao hàm tính toán không nên tự print kết quả?',
        dap: 'Vì print trói hàm vào một cách hiển thị duy nhất. Hàm nên RETURN kết quả để nơi gọi quyết định in ra màn hình, ghi file hay trả về cho web. Nhờ vậy cùng một hàm dùng lại được ở nhiều nơi và kiểm thử được.',
      },
    ],
  },
]
