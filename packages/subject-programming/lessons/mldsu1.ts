// lessons/mldsu1.ts — Chương C3 "Data Science thực chiến" của khoá ngắn "Machine Learning &
// Data Science" (docs/specs/2026-09-01-mlds-bai-hoc-chi-tiet.md §2).
//
// unitId 'mlds-u1' KHÔNG nằm trong curriculum.ts — là "unit ảo" của tầng khoá ngắn, được
// lessons.test.ts công nhận qua SHORT_COURSES (courses/registry.ts), đúng cơ chế 'ml-u*'.
//
// Luật soạn riêng của khoá: mọi thuật toán LÕI đều tự cài bằng Python THUẦN (không numpy/
// sklearn/pandas) để Pyodide trình duyệt và python3 CI chấm y hệt nhau.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const MLDS_U1_LESSONS: ProgrammingLesson[] = [
  {
    id: 'mlds-u1-l1',
    unitId: 'mlds-u1',
    language: 'python',
    title: 'Làm sạch dữ liệu — thiếu, trùng, ngoại lai',
    hook: 'Bạn xuất file doanh thu từ phần mềm bán hàng: vài ô trống vì nhân viên quên nhập, một đơn bị bấm lưu hai lần, và một dòng ghi 200 triệu vì gõ thừa số 0. Đưa nguyên file đó cho mô hình học máy thì mô hình học luôn cả ba lỗi. Trước mọi thuật toán, việc đầu tiên của người làm dữ liệu là DỌN.',
    theory:
      'Khoá này bắt đầu ở chỗ khoá "Học máy" dừng lại: bạn đã tự cài hồi quy, k-NN, k-means và biết chia train/test. Nhưng mọi bài đó đều được phát dữ liệu SẠCH. Dữ liệu thật thì không.\n\nBa loại bẩn hay gặp nhất:\n\n1. THIẾU (missing) — ô trống. Ba cách xử: bỏ dòng (an toàn khi thiếu ít), điền bằng trung bình/trung vị (imputation, giữ được số dòng nhưng làm dữ liệu "phẳng" hơn thật), hoặc tạo thêm cột cờ "ô này vốn thiếu" để mô hình biết. Chọn cách nào phải nói rõ trong báo cáo — đây là quyết định, không phải thao tác máy móc.\n\n2. TRÙNG (duplicate) — cùng một bản ghi xuất hiện nhiều lần. Nguy hiểm âm thầm: bản ghi trùng làm mô hình tưởng ca đó phổ biến hơn thực tế, và nếu một bản nằm ở train còn bản kia ở test thì bạn đang chấm bài bằng đề đã phát đáp án (đúng cái bẫy ml-u1-l4 đã cảnh báo).\n\n3. NGOẠI LAI (outlier) — giá trị lệch hẳn khỏi phần còn lại. Cách phát hiện tiêu chuẩn là LUẬT IQR: sắp xếp dữ liệu, lấy Q1 (tứ phân vị dưới) và Q3 (tứ phân vị trên), IQR = Q3 − Q1; mọi giá trị nằm ngoài khoảng [Q1 − 1,5×IQR ; Q3 + 1,5×IQR] bị đánh dấu là ngoại lai.\n\nQuy ước tứ phân vị dùng trong khoá này (đơn giản, tất định, hợp Python thuần): với danh sách đã sắp xếp độ dài n, Q1 = phần tử ở chỉ số n // 4, Q3 = phần tử ở chỉ số (3 * n) // 4. Thư viện thật (numpy.percentile, pandas.describe) nội suy tinh vi hơn nên có thể lệch chút — không sao, ý tưởng là một.\n\nLuật nghề: ngoại lai KHÔNG mặc nhiên là rác. Một giao dịch 200 triệu có thể là gian lận — chính là thứ bạn muốn tìm. Đánh dấu trước, xoá sau, và chỉ xoá khi biết vì sao.\n\nTrong pandas thật, cả bài này gói lại thành: df.dropna(), df.drop_duplicates(), rồi lọc theo ngưỡng IQR. Bạn tự cài hôm nay để biết ba dòng đó thực sự làm gì.',
    workedExample: {
      code: `# Don mot cot du lieu: bo o thieu -> khu trung -> danh dau ngoai lai bang IQR
tho = ["10", "12", "", "11", "13", "10", "200"]   # "" la o thieu

so = [int(x) for x in tho if x != ""]              # buoc 1: bo o thieu
print("Sau khi bo thieu:", so)

duy_nhat = []                                       # buoc 2: khu trung, GIU thu tu
for v in so:
    if v not in duy_nhat:
        duy_nhat.append(v)
print("Sau khi khu trung:", duy_nhat)

sap = sorted(duy_nhat)                              # buoc 3: IQR
n = len(sap)
q1 = sap[n // 4]
q3 = sap[(3 * n) // 4]
iqr = q3 - q1
thap = q1 - 1.5 * iqr
cao = q3 + 1.5 * iqr
print(f"Nguong hop le: {thap} den {cao}")

sach = [v for v in duy_nhat if thap <= v <= cao]
print("Sach:", sach)`,
      stdinLines: [],
    },
    predict: {
      code: `sap = [10, 11, 12, 13, 200]\nn = len(sap)\nq1 = sap[n // 4]\nq3 = sap[(3 * n) // 4]\nprint(q1, q3, q3 - q1)`,
      question: 'Ba con số in ra là gì?',
      choices: ['11 13 2', '10 200 190', '12 13 1', '11 200 189'],
      answerIndex: 0,
      explain:
        'n = 5 nên n // 4 = 1 (Q1 = sap[1] = 11) và (3 * 5) // 4 = 3 (Q3 = sap[3] = 13). IQR = 13 − 11 = 2. Chú ý: giá trị 200 KHÔNG kéo Q1/Q3 đi đâu cả — đó chính là lý do người ta dùng tứ phân vị thay vì trung bình để bắt ngoại lai: trung bình bị một giá trị lạ kéo lệch, tứ phân vị thì không.',
    },
    parsons: {
      prompt:
        'Xếp đúng thứ tự một quy trình làm sạch: bỏ thiếu → khử trùng → tính ngưỡng IQR → lọc.',
      lines: [
        'so = [int(x) for x in tho if x != ""]',
        'duy_nhat = list(dict.fromkeys(so))',
        'sap = sorted(duy_nhat)',
        'q1, q3 = sap[len(sap) // 4], sap[(3 * len(sap)) // 4]',
        'thap, cao = q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)',
        'sach = [v for v in duy_nhat if thap <= v <= cao]',
      ],
    },
    make: {
      prompt:
        'Viết bộ làm sạch một cột số nguyên.\n\nChương trình đọc MỘT dòng input(): các giá trị cách nhau bởi dấu phẩy, trong đó ô rỗng nghĩa là THIẾU (ví dụ "10,12,,11").\n\nLàm đúng ba bước, theo đúng thứ tự:\n1. Bỏ mọi ô thiếu, đổi phần còn lại sang int.\n2. Khử trùng, GIỮ NGUYÊN thứ tự xuất hiện đầu tiên.\n3. Tính ngưỡng IQR theo quy ước của bài (Q1 = sap[n // 4], Q3 = sap[(3 * n) // 4] trên danh sách ĐÃ SẮP XẾP của kết quả bước 2), rồi giữ lại các giá trị nằm trong [Q1 − 1,5×IQR ; Q3 + 1,5×IQR].\n\nIn đúng 3 dòng:\nSo gia tri con lai: <số phần tử sau bước 2>\nNguong: <thap> den <cao>\nSach: <các giá trị còn lại, thứ tự như bước 2, nối bằng dấu phẩy>\n\nVí dụ "10,12,,11,13,10,200" → 5 giá trị, ngưỡng 8.0 đến 16.0, sạch = 10,12,11,13.',
      starterCode: `dong = input("Du lieu: ")            # vd "10,12,,11,13,10,200"\ntho = [p.strip() for p in dong.split(",")]\n# Buoc 1: bo o rong roi doi sang int\n# Buoc 2: khu trung nhung GIU thu tu\n# Buoc 3: sap xep, lay q1/q3, tinh nguong, loc\n`,
      testCases: [
        {
          stdinLines: ['10,12,,11,13,10,200'],
          expected: 'So gia tri con lai: 5\nNguong: 8.0 den 16.0\nSach: 10,12,11,13',
          match: 'contains',
          hidden: false,
          label: 'Có 1 ô thiếu, 1 giá trị trùng, 1 ngoại lai 200',
        },
        {
          stdinLines: ['5,5,5,5'],
          expected: 'So gia tri con lai: 1',
          match: 'contains',
          hidden: false,
          label: 'Toàn giá trị trùng → còn đúng 1',
        },
        {
          stdinLines: ['1,2,3,4,100,,2'],
          expected: 'Sach: 1,2,3,4',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: 100 bị loại, thứ tự gốc được giữ',
        },
      ],
      hints: [
        'Bỏ ô thiếu: [int(x) for x in tho if x != ""] — điều kiện if đứng SAU biểu thức trong list comprehension.',
        'Khử trùng giữ thứ tự: duyệt danh sách, chỉ append khi "v not in duy_nhat". Dùng set() sẽ MẤT thứ tự — đề yêu cầu giữ.',
        'Ngưỡng in ra là số thực vì nhân 1.5: q1 - 1.5 * iqr cho 8.0 chứ không phải 8. In thẳng bằng f-string là đúng định dạng.',
        'Nối kết quả: ",".join(str(v) for v in sach) — join chỉ nhận chuỗi nên phải str() từng phần tử.',
      ],
      sampleSolution: `dong = input("Du lieu: ")\ntho = [p.strip() for p in dong.split(",")]\nso = [int(p) for p in tho if p != ""]\n\nduy_nhat = []\nfor v in so:\n    if v not in duy_nhat:\n        duy_nhat.append(v)\nprint(f"So gia tri con lai: {len(duy_nhat)}")\n\nsap = sorted(duy_nhat)\nn = len(sap)\nq1 = sap[n // 4]\nq3 = sap[(3 * n) // 4]\niqr = q3 - q1\nthap = q1 - 1.5 * iqr\ncao = q3 + 1.5 * iqr\nprint(f"Nguong: {thap} den {cao}")\n\nsach = [v for v in duy_nhat if thap <= v <= cao]\nprint("Sach: " + ",".join(str(v) for v in sach))`,
    },
    homework:
      'Mở một file dữ liệu thật của bạn (bảng chi tiêu cá nhân, danh sách lớp, log bán hàng — bất cứ thứ gì có ≥ 30 dòng). Đếm tay: bao nhiêu ô thiếu, bao nhiêu dòng trùng, bao nhiêu giá trị bạn NGHI là ngoại lai. Với mỗi ngoại lai, viết một câu trả lời: đây là lỗi nhập liệu, hay là ca thật đáng chú ý? Chính câu trả lời đó quyết định xoá hay giữ — không có luật chung.',
    srsCards: [
      {
        hoi: 'Luật IQR bắt ngoại lai như thế nào?',
        dap: 'IQR = Q3 − Q1. Mọi giá trị nằm ngoài [Q1 − 1,5×IQR ; Q3 + 1,5×IQR] bị đánh dấu ngoại lai. Dùng tứ phân vị thay vì trung bình vì trung bình bị chính giá trị lạ kéo lệch.',
      },
      {
        hoi: 'Vì sao bản ghi TRÙNG nguy hiểm với việc đánh giá mô hình?',
        dap: 'Nếu một bản nằm ở train còn bản kia ở test thì mô hình đã "thấy đáp án" — điểm test cao giả tạo. Ngoài ra bản trùng làm mô hình tưởng ca đó phổ biến hơn thực tế.',
      },
      {
        hoi: 'Ba cách xử lý ô THIẾU và cái giá của mỗi cách?',
        dap: 'Bỏ dòng (mất dữ liệu, an toàn khi thiếu ít) · điền trung bình/trung vị (giữ số dòng nhưng làm dữ liệu phẳng hơn thật) · thêm cột cờ "vốn thiếu" (giữ được thông tin rằng ô đó từng trống).',
      },
      {
        hoi: 'Ngoại lai có phải lúc nào cũng nên xoá không?',
        dap: 'Không. Ngoại lai có thể chính là thứ cần tìm (gian lận, sự cố, ca hiếm). Nguyên tắc: đánh dấu trước, chỉ xoá khi đã biết vì sao nó lạ.',
      },
    ],
  },
  {
    id: 'mlds-u1-l2',
    unitId: 'mlds-u1',
    language: 'python',
    title: 'EDA — group-by và pivot tự cài bằng dict',
    hook: 'Sếp đưa bạn file 5.000 dòng doanh thu và hỏi "khu vực nào đang kéo cả công ty đi lên?". Bạn không cần mô hình học máy nào cả — bạn cần GOM NHÓM rồi cộng. Câu hỏi hay nhất của khoa học dữ liệu thường được trả lời bằng một phép group-by.',
    theory:
      'EDA (Exploratory Data Analysis — khám phá dữ liệu) là bước bạn NHÌN dữ liệu trước khi mô hình hoá. Bỏ qua bước này là nguồn gốc của phần lớn dự án hỏng: người ta train ba tuần rồi mới phát hiện một khu vực chiếm 90% dữ liệu.\n\nCông cụ chủ lực là GROUP-BY: chia dữ liệu thành nhóm theo một cột phân loại (khu vực, tháng, kênh bán), rồi tính một con số tổng hợp cho từng nhóm (tổng, trung bình, đếm, lớn nhất). Trong Python thuần, group-by chính là MỘT DICT: khoá là tên nhóm, giá trị là số đang cộng dồn.\n\nCặp hàm cần thuộc lòng: d.get(k, 0) trả về giá trị của khoá k, hoặc 0 nếu khoá chưa tồn tại — nhờ nó bạn viết được d[k] = d.get(k, 0) + x mà không cần kiểm tra "khoá đã có chưa". Đây là khuôn cộng dồn theo nhóm, dùng đi dùng lại suốt phần còn lại của khoá.\n\nBa con số nên tính cho MỌI nhóm, không bao giờ chỉ tính một:\n- TỔNG: nhóm này đóng góp bao nhiêu.\n- TRUNG BÌNH: mỗi bản ghi trong nhóm đáng giá bao nhiêu.\n- ĐẾM: nhóm có bao nhiêu bản ghi.\nThiếu ĐẾM là bẫy kinh điển: một khu vực trung bình 200 triệu/đơn nghe rất mạnh, cho tới khi bạn thấy nó chỉ có 1 đơn.\n\nPIVOT là group-by theo HAI cột cùng lúc (ví dụ khu vực × tháng), kết quả là bảng hai chiều. Trong Python thuần: dict lồng dict, hoặc dict có khoá là bộ đôi (khu_vuc, thang).\n\nSắp xếp kết quả: sorted(tong.keys(), key=lambda k: -tong[k]) xếp giảm dần theo tổng. sorted của Python là ỔN ĐỊNH — hai nhóm bằng điểm sẽ giữ nguyên thứ tự chúng xuất hiện trong dict, mà dict Python từ 3.7 giữ thứ tự chèn. Nhờ hai tính chất đó, kết quả của bạn TẤT ĐỊNH: chạy lại bao nhiêu lần cũng ra một thứ tự.\n\nTrong pandas thật, cả bài này là df.groupby("khu_vuc")["doanh_thu"].agg(["sum", "mean", "count"]).sort_values("sum", ascending=False). Bạn tự cài hôm nay để biết dòng đó đang cộng cái gì vào đâu.',
    workedExample: {
      code: `# Group-by tu cai: tong + trung binh + dem theo khu vuc
ban_ghi = [("bac", 100), ("nam", 200), ("bac", 300), ("nam", 100)]

tong = {}   # khu vuc -> tong doanh thu
dem = {}    # khu vuc -> so ban ghi
for khu, tien in ban_ghi:
    tong[khu] = tong.get(khu, 0) + tien   # khuon cong don theo nhom
    dem[khu] = dem.get(khu, 0) + 1

thu_tu = sorted(tong.keys(), key=lambda k: -tong[k])   # giam dan theo tong
for k in thu_tu:
    print(f"{k}: tong {tong[k]}, trung binh {tong[k] / dem[k]}, so ban ghi {dem[k]}")

print(f"Dan dau: {thu_tu[0]}")`,
      stdinLines: [],
    },
    predict: {
      code: `d = {}\nfor x in ["a", "b", "a"]:\n    d[x] = d.get(x, 0) + 1\nprint(d)`,
      question: 'Dict in ra là gì?',
      choices: [
        "{'a': 2, 'b': 1}",
        "{'a': 1, 'b': 1}",
        "{'a': 3, 'b': 1}",
        'Lỗi KeyError ở vòng đầu',
      ],
      answerIndex: 0,
      explain:
        'd.get("a", 0) ở vòng đầu trả về 0 vì khoá chưa tồn tại — nên KHÔNG có KeyError, và d["a"] thành 1; vòng thứ ba nó lên 2. Thứ tự in là thứ tự CHÈN (a trước b), tính chất được bảo đảm từ Python 3.7 và là lý do kết quả group-by của bạn tất định.',
    },
    parsons: {
      prompt: 'Xếp đúng một vòng group-by đầy đủ: khởi tạo → cộng dồn → sắp xếp → in.',
      lines: [
        'tong = {}',
        'dem = {}',
        'for khu, tien in ban_ghi:',
        '    tong[khu] = tong.get(khu, 0) + tien',
        '    dem[khu] = dem.get(khu, 0) + 1',
        'thu_tu = sorted(tong.keys(), key=lambda k: -tong[k])',
        'for k in thu_tu:',
        '    print(k, tong[k], tong[k] / dem[k])',
      ],
    },
    make: {
      prompt:
        'Viết báo cáo group-by cho bảng doanh thu.\n\nChương trình đọc:\n- Dòng 1: n — số bản ghi.\n- n dòng tiếp: mỗi dòng "<khu vuc>,<doanh thu>" (doanh thu là số nguyên; tên khu vực có thể chứa dấu cách, ví dụ "da nang,200").\n\nIn mỗi khu vực một dòng, SẮP XẾP GIẢM DẦN theo tổng doanh thu (bằng điểm thì giữ thứ tự xuất hiện đầu tiên), theo đúng khuôn:\n<khu vuc>: tong <tổng>, trung binh <trung bình>, so ban ghi <đếm>\n\nDòng cuối cùng in tên khu vực dẫn đầu:\nDan dau: <khu vuc>\n\nVí dụ với bac 100, nam 200, bac 300, nam 100 → "bac: tong 400, trung binh 200.0, so ban ghi 2" rồi "nam: tong 300, trung binh 150.0, so ban ghi 2" rồi "Dan dau: bac".',
      starterCode: `n = int(input("So ban ghi: "))\ntong = {}\ndem = {}\nfor _ in range(n):\n    dong = input()\n    khu, tien = dong.split(",")\n    # cong don vao tong va dem\n# sap xep giam dan theo tong roi in\n`,
      testCases: [
        {
          stdinLines: ['4', 'bac,100', 'nam,200', 'bac,300', 'nam,100'],
          expected:
            'bac: tong 400, trung binh 200.0, so ban ghi 2\nnam: tong 300, trung binh 150.0, so ban ghi 2\nDan dau: bac',
          match: 'contains',
          hidden: false,
          label: '2 khu vực, bac dẫn đầu với tổng 400',
        },
        {
          stdinLines: ['3', 'hue,50', 'hue,70', 'da nang,200'],
          expected: 'da nang: tong 200, trung binh 200.0, so ban ghi 1',
          match: 'contains',
          hidden: false,
          label: 'Tên có dấu cách; nhóm 1 bản ghi vẫn phải xếp trên',
        },
        {
          stdinLines: ['2', 'a,10', 'b,10'],
          expected: 'Dan dau: a',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: bằng điểm → giữ thứ tự xuất hiện đầu tiên',
        },
      ],
      hints: [
        'Tách dòng: khu, tien = dong.split(",") rồi tien = int(tien). Nhớ khu = khu.strip() phòng khoảng trắng thừa.',
        'Cộng dồn bằng khuôn dict: tong[khu] = tong.get(khu, 0) + tien và dem[khu] = dem.get(khu, 0) + 1.',
        'Sắp xếp giảm dần: sorted(tong.keys(), key=lambda k: -tong[k]). Vì sorted ổn định và dict giữ thứ tự chèn, ca bằng điểm tự động ra đúng.',
        'Trung bình là phép chia / nên luôn ra số thực: 400 / 2 in ra 200.0 chứ không phải 200.',
      ],
      sampleSolution: `n = int(input("So ban ghi: "))\ntong = {}\ndem = {}\nfor _ in range(n):\n    dong = input()\n    khu, tien = dong.split(",")\n    khu = khu.strip()\n    tien = int(tien)\n    tong[khu] = tong.get(khu, 0) + tien\n    dem[khu] = dem.get(khu, 0) + 1\n\nthu_tu = sorted(tong.keys(), key=lambda k: -tong[k])\nfor k in thu_tu:\n    print(f"{k}: tong {tong[k]}, trung binh {tong[k] / dem[k]}, so ban ghi {dem[k]}")\nprint(f"Dan dau: {thu_tu[0]}")`,
    },
    homework:
      'Lấy sao kê ngân hàng hoặc lịch sử ví điện tử một tháng của bạn. Group-by theo loại chi (ăn uống, đi lại, mua sắm...) và tính đủ ba con số: tổng, trung bình, số giao dịch. Rồi trả lời hai câu: (1) nhóm nào TỔNG lớn nhất, (2) nhóm nào TRUNG BÌNH mỗi lần lớn nhất. Hai câu trả lời thường khác nhau — và chính khoảng cách đó nói cho bạn biết nên cắt chi tiêu ở đâu.',
    srsCards: [
      {
        hoi: 'Khuôn cộng dồn theo nhóm bằng dict trong Python thuần là gì?',
        dap: 'tong[khoa] = tong.get(khoa, 0) + gia_tri — .get(khoa, 0) trả về 0 khi khoá chưa có, nên không cần kiểm tra "khoá đã tồn tại chưa" và không bao giờ KeyError.',
      },
      {
        hoi: 'Vì sao báo cáo group-by phải luôn kèm cột ĐẾM?',
        dap: 'Vì trung bình không có đếm là số dối: một nhóm "trung bình 200 triệu/đơn" nghe rất mạnh cho tới khi biết nó chỉ có 1 đơn. Tổng + trung bình + đếm phải đi cùng nhau.',
      },
      {
        hoi: 'EDA là gì và bỏ qua nó dẫn tới hậu quả gì?',
        dap: 'EDA = khám phá dữ liệu trước khi mô hình hoá (nhóm, đếm, phân bố, ngoại lai). Bỏ qua thì hay train xong ba tuần mới phát hiện dữ liệu lệch nặng hoặc sai từ gốc.',
      },
    ],
  },
  {
    id: 'mlds-u1-l3',
    unitId: 'mlds-u1',
    language: 'python',
    title: 'Feature engineering — one-hot, binning, chuẩn hoá và bẫy rò rỉ dữ liệu',
    hook: 'Mô hình học máy chỉ ăn được SỐ. Cột "thành phố" ghi "hanoi", cột "tuổi" ghi 70 còn cột "thu nhập" ghi 30.000.000 — ba cột đó ở ba thế giới khác nhau. Feature engineering là việc dịch dữ liệu đời thật sang thứ ngôn ngữ mà thuật toán hiểu, và nó quyết định chất lượng mô hình nhiều hơn cả việc chọn thuật toán.',
    theory:
      'FEATURE (đặc trưng) = một cột số đưa vào mô hình. Feature engineering = tạo ra các cột đó từ dữ liệu thô. Bốn kỹ thuật nền:\n\n1. ONE-HOT ENCODING — cho cột PHÂN LOẠI (thành phố, màu, hạng vé). Có k giá trị khác nhau thì tạo k cột, mỗi cột 0/1. "hanoi" trong tập {hanoi, hue} thành [1, 0]. Vì sao không đánh số hanoi=1, hue=2? Vì đánh số bịa ra một THỨ TỰ và một KHOẢNG CÁCH không có thật — mô hình sẽ tin hue lớn gấp đôi hanoi, và k-NN (ml-u1-l3) sẽ đo khoảng cách trên con số bịa đó. Quy ước của khoá: các cột one-hot xếp theo thứ tự bảng chữ cái, để chạy lại luôn ra một kết quả.\n\n2. BINNING (chia khoảng) — biến số liên tục thành nhóm: tuổi < 18 là "tre", 18–59 là "truong thanh", từ 60 là "cao tuoi". Được gì: mô hình đơn giản hơn, chịu ngoại lai tốt hơn, kết quả dễ giải thích cho người không làm kỹ thuật. Mất gì: vứt đi thông tin bên trong mỗi khoảng — 18 tuổi và 59 tuổi thành y hệt nhau.\n\n3. CHUẨN HOÁ (scaling) — bạn đã gặp ở ml-u2-l2: min-max đưa mọi cột về [0, 1] bằng (x − min) / (max − min). Bắt buộc trước mọi thuật toán ĐO KHOẢNG CÁCH (k-NN, k-means). Ca biên phải nhớ: khi max == min (cột hằng số) thì mẫu số bằng 0 — quy ước của khoá là trả về 0.0, đừng để chương trình vỡ.\n\n4. RÒ RỈ DỮ LIỆU (data leakage) — lỗi đắt giá nhất của cả nghề. Rò rỉ là khi feature chứa thông tin mà lúc dự đoán thật bạn KHÔNG THỂ có. Hai dạng hay gặp:\n   - Rò rỉ theo thời gian: dùng cột "ngày trả nợ" để dự đoán "có trả nợ không". Lúc duyệt vay làm gì đã có cột đó.\n   - Rò rỉ qua bước tiền xử lý: tính min/max (hoặc trung bình để điền ô thiếu) trên TOÀN BỘ dữ liệu rồi mới chia train/test. Thế là thông tin của tập test đã ngấm vào tập train qua con số min/max, điểm test đẹp giả tạo.\n   Luật chống rò rỉ: CHIA TRAIN/TEST TRƯỚC, mọi tham số tiền xử lý (min, max, trung bình, từ điển one-hot) chỉ được HỌC TỪ TRAIN, rồi ÁP y nguyên lên test. Trong sklearn đây chính là lý do có cặp fit() / transform(): fit trên train, transform cả hai. Hệ quả nghe lạ mà đúng: một giá trị test có thể chuẩn hoá thành 1.2 hoặc −0.3 vì nó nằm ngoài khoảng min–max của train. Không sao — đó là sự thật, không phải lỗi.',
    workedExample: {
      code: `# Ba phep bien doi tren cung mot bang nho
tuoi = [10, 30, 70]
tp = ["hanoi", "hue", "hanoi"]

cot = sorted(set(tp))              # cot one-hot theo thu tu bang chu cai
print("Cot one-hot:", cot)

nho = min(tuoi)                    # tham so chuan hoa: HOC tu du lieu huan luyen
lon = max(tuoi)
for i in range(len(tuoi)):
    chuan = round((tuoi[i] - nho) / (lon - nho), 2)     # min-max ve [0, 1]
    if tuoi[i] < 18:               # binning
        nhom = "tre"
    elif tuoi[i] < 60:
        nhom = "truong thanh"
    else:
        nhom = "cao tuoi"
    onehot = " ".join("1" if c == tp[i] else "0" for c in cot)
    print(f"Nguoi {i + 1}: tuoi_chuan={chuan}, nhom={nhom}, onehot={onehot}")`,
      stdinLines: [],
    },
    predict: {
      code: `train = [10, 20, 30]\nnho, lon = min(train), max(train)\ntest = 40\nprint(round((test - nho) / (lon - nho), 2))`,
      question: 'Một giá trị TEST lớn hơn max của train thì chuẩn hoá ra bao nhiêu?',
      choices: ['1.5', '1.0', '0.0', 'Lỗi vì vượt khoảng [0, 1]'],
      answerIndex: 0,
      explain:
        '(40 − 10) / (30 − 10) = 1.5. Vượt ra ngoài [0, 1] là chuyện BÌNH THƯỜNG và ĐÚNG: tham số min/max chỉ được học từ train, nên test hoàn toàn có thể nằm ngoài. Nếu bạn "sửa" bằng cách tính min/max trên cả train lẫn test thì bạn vừa tạo ra rò rỉ dữ liệu — bệnh nặng hơn nhiều so với một con số 1.5.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự CHỐNG RÒ RỈ khi chuẩn hoá dữ liệu.',
      lines: [
        'train, test = chia_du_lieu(tat_ca)',
        'nho = min(train)',
        'lon = max(train)',
        'train_chuan = [(x - nho) / (lon - nho) for x in train]',
        'test_chuan = [(x - nho) / (lon - nho) for x in test]',
      ],
    },
    make: {
      prompt:
        'Viết bộ biến đổi đặc trưng cho một bảng người dùng.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: tuổi của từng người, cách nhau bởi dấu phẩy (vd "10,30,70").\n- Dòng 2: thành phố của từng người, cùng số lượng, cách nhau bởi dấu phẩy.\n\nIn dòng đầu là danh sách cột one-hot (các thành phố khác nhau, XẾP THEO BẢNG CHỮ CÁI, nối bằng dấu cách):\nCot one-hot: <c1> <c2> ...\n\nSau đó mỗi người một dòng:\nNguoi <i>: tuoi_chuan=<x>, nhom=<bin>, onehot=<0/1 nối bằng dấu cách>\n\nQuy tắc:\n- tuoi_chuan = min-max chuẩn hoá tuổi, LÀM TRÒN 2 chữ số. Nếu max == min thì bằng 0.0.\n- nhom: tuổi < 18 → "tre"; 18 đến 59 → "truong thanh"; từ 60 → "cao tuoi".\n- i đếm từ 1.\n\nVí dụ tuổi "10,30,70" và thành phố "hanoi,hue,hanoi" → cột one-hot "hanoi hue", người 1 là "tuoi_chuan=0.0, nhom=tre, onehot=1 0".',
      starterCode: `tuoi = [int(x) for x in input("Tuoi: ").split(",")]\ntp = [x.strip() for x in input("Thanh pho: ").split(",")]\n# cot = sorted(set(tp)) roi in dong "Cot one-hot: ..."\n# min-max tuoi (nho ca bien max == min), binning, one-hot cho tung nguoi\n`,
      testCases: [
        {
          stdinLines: ['10,30,70', 'hanoi,hue,hanoi'],
          expected:
            'Cot one-hot: hanoi hue\nNguoi 1: tuoi_chuan=0.0, nhom=tre, onehot=1 0\nNguoi 2: tuoi_chuan=0.33, nhom=truong thanh, onehot=0 1\nNguoi 3: tuoi_chuan=1.0, nhom=cao tuoi, onehot=1 0',
          match: 'contains',
          hidden: false,
          label: '3 người, 2 thành phố, đủ 3 nhóm tuổi',
        },
        {
          stdinLines: ['20,20', 'da nang,da nang'],
          expected: 'Nguoi 1: tuoi_chuan=0.0, nhom=truong thanh, onehot=1',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: max == min → chuẩn hoá về 0.0, không chia cho 0',
        },
        {
          stdinLines: ['17,18,60', 'hue,hanoi,hue'],
          expected: 'Nguoi 2: tuoi_chuan=0.02, nhom=truong thanh, onehot=1 0',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: đúng hai mốc biên 18 và 60; cột one-hot xếp chữ cái',
        },
      ],
      hints: [
        'Lấy danh sách cột: sorted(set(tp)) — set() bỏ trùng, sorted() cho thứ tự bảng chữ cái ổn định.',
        'Kiểm max == min TRƯỚC khi chia, nếu bằng thì gán thẳng chuan = 0.0. Chia cho 0 sẽ làm chương trình vỡ ở ca biên.',
        'Binning dùng if/elif theo đúng biên đề ra: < 18, rồi < 60, còn lại. Đừng viết <= 18 — 18 tuổi phải rơi vào "truong thanh".',
        'One-hot một dòng: " ".join("1" if c == tp[i] else "0" for c in cot) — duyệt theo THỨ TỰ CỘT, không theo thứ tự người.',
      ],
      sampleSolution: `tuoi = [int(x) for x in input("Tuoi: ").split(",")]\ntp = [x.strip() for x in input("Thanh pho: ").split(",")]\n\ncot = sorted(set(tp))\nprint("Cot one-hot: " + " ".join(cot))\n\nnho = min(tuoi)\nlon = max(tuoi)\nfor i in range(len(tuoi)):\n    if lon == nho:\n        chuan = 0.0\n    else:\n        chuan = round((tuoi[i] - nho) / (lon - nho), 2)\n    if tuoi[i] < 18:\n        nhom = "tre"\n    elif tuoi[i] < 60:\n        nhom = "truong thanh"\n    else:\n        nhom = "cao tuoi"\n    onehot = " ".join("1" if c == tp[i] else "0" for c in cot)\n    print(f"Nguoi {i + 1}: tuoi_chuan={chuan}, nhom={nhom}, onehot={onehot}")`,
    },
    homework:
      'Lấy một bài toán bạn quan tâm (dự đoán điểm thi, dự đoán giá xe cũ, đoán khách có quay lại không) và viết ra 5 feature bạn định dùng. Với TỪNG feature, trả lời một câu duy nhất: "Tại thời điểm cần dự đoán, tôi CÓ con số này trong tay chưa?". Feature nào trả lời "chưa" là rò rỉ dữ liệu — gạch đi. Bài tập này bắt được nhiều lỗi hơn bất kỳ đoạn code nào.',
    srsCards: [
      {
        hoi: 'Vì sao không được mã hoá cột phân loại bằng cách đánh số 1, 2, 3?',
        dap: 'Vì đánh số bịa ra thứ tự và khoảng cách không có thật (hue "gấp đôi" hanoi). Thuật toán đo khoảng cách như k-NN/k-means sẽ tin con số bịa đó. Dùng one-hot: k giá trị thành k cột 0/1.',
      },
      {
        hoi: 'Làm sao phát hiện một feature bị rò rỉ dữ liệu?',
        dap: 'Tự hỏi từng feature: "Tại thời điểm cần dự đoán, tôi CÓ con số này trong tay chưa?". Trả lời "chưa" (ví dụ dùng "ngày trả nợ" để đoán "có trả nợ không") — đó là rò rỉ, gạch bỏ.',
      },
      {
        hoi: 'Luật chống rò rỉ khi tiền xử lý là gì?',
        dap: 'Chia train/test TRƯỚC. Mọi tham số (min, max, trung bình, từ điển one-hot) chỉ học từ TRAIN rồi áp y nguyên lên test — đúng cặp fit()/transform() của sklearn. Chấp nhận giá trị test chuẩn hoá ra ngoài [0, 1].',
      },
      {
        hoi: 'Binning được gì và mất gì?',
        dap: 'Được: mô hình đơn giản hơn, chịu ngoại lai tốt hơn, dễ giải thích. Mất: thông tin bên trong mỗi khoảng — 18 tuổi và 59 tuổi bị coi là như nhau.',
      },
    ],
  },
  {
    id: 'mlds-u1-l4',
    unitId: 'mlds-u1',
    language: 'python',
    title: 'Precision, recall, F1 — vì sao accuracy lừa người khi lệch lớp',
    hook: 'Một mô hình chẩn đoán ung thư đạt accuracy 99%. Nghe như tuyệt tác — cho tới khi bạn biết chỉ 1% bệnh nhân thật sự mắc bệnh, và mô hình đó chỉ làm đúng một việc: luôn trả lời "không mắc". Nó bỏ sót 100% người bệnh mà vẫn được 99 điểm. Accuracy là thước đo dễ đánh lừa nhất trong học máy.',
    theory:
      'Ở ml-u1-l4 bạn đã đo ACCURACY = số ca đúng / tổng số ca. Bài này chỉ ra khi nào con số đó vô dụng, và thay bằng gì.\n\nMọi bài phân loại nhị phân chỉ có bốn kết cục, gọi là MA TRẬN NHẦM LẪN (confusion matrix):\n- TP (true positive): thật là 1, đoán 1 — bắt đúng.\n- FP (false positive): thật là 0, đoán 1 — báo động giả.\n- FN (false negative): thật là 1, đoán 0 — BỎ SÓT.\n- TN (true negative): thật là 0, đoán 0 — bỏ qua đúng.\n\nBốn con số này là nguyên liệu của mọi thước đo:\n- Accuracy = (TP + TN) / tổng. Hỏng khi LỆCH LỚP (class imbalance): lớp 0 áp đảo thì TN khổng lồ nuốt chửng mọi thứ khác.\n- PRECISION = TP / (TP + FP) — "trong những ca tôi BÁO là dương tính, bao nhiêu phần đúng?". Precision cao = ít báo động giả.\n- RECALL = TP / (TP + FN) — "trong những ca THẬT SỰ dương tính, tôi bắt được bao nhiêu phần?". Recall cao = ít bỏ sót.\n- F1 = 2 × precision × recall / (precision + recall) — trung bình ĐIỀU HOÀ của hai cái trên. Dùng trung bình điều hoà chứ không phải trung bình cộng vì nó phạt nặng ca lệch: precision 1.0 và recall 0.0 cho F1 = 0, đúng như cảm nhận, trong khi trung bình cộng lại cho 0.5 nghe như "tạm được".\n\nCa biên phải xử tay: khi TP + FP = 0 (mô hình không báo dương tính lần nào) thì precision chia cho 0. Quy ước của khoá: trả về 0.0. Tương tự với recall và F1.\n\nCHỌN THƯỚC ĐO THEO CÁI GIÁ CỦA LỖI, đây là quyết định nghiệp vụ chứ không phải kỹ thuật:\n- Sàng lọc ung thư, phát hiện cháy: bỏ sót giết người, báo động giả chỉ tốn công kiểm tra lại → ưu tiên RECALL.\n- Lọc thư rác, chặn tài khoản: báo động giả làm mất thư quan trọng của người dùng → ưu tiên PRECISION.\n- Không rõ nghiêng bên nào → F1.\n\nHai đại lượng này luôn ĐÁNH ĐỔI: hạ ngưỡng quyết định thì recall lên, precision xuống; nâng ngưỡng thì ngược lại. Vẽ đường cong precision–recall theo ngưỡng là cách chuẩn để chọn điểm làm việc. Trong sklearn: confusion_matrix, precision_score, recall_score, f1_score, classification_report — bốn công thức bạn cài hôm nay nằm cả trong đó.',
    workedExample: {
      code: `# Bon con so cua ma tran nham lan roi suy ra moi thuoc do
that = [1, 1, 0, 0, 1, 0]
du = [1, 0, 0, 0, 1, 1]

tp = fp = fn = tn = 0
for i in range(len(that)):
    if that[i] == 1 and du[i] == 1:
        tp += 1          # bat dung
    elif that[i] == 0 and du[i] == 1:
        fp += 1          # bao dong gia
    elif that[i] == 1 and du[i] == 0:
        fn += 1          # BO SOT
    else:
        tn += 1
print(f"TP={tp} FP={fp} FN={fn} TN={tn}")

acc = (tp + tn) / len(that)
precision = tp / (tp + fp) if tp + fp > 0 else 0.0   # tranh chia cho 0
recall = tp / (tp + fn) if tp + fn > 0 else 0.0
f1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0.0
print(f"Accuracy: {round(acc, 2)}")
print(f"Precision: {round(precision, 2)}")
print(f"Recall: {round(recall, 2)}")
print(f"F1: {round(f1, 2)}")`,
      stdinLines: [],
    },
    predict: {
      code: `that = [1] + [0] * 99\ndu = [0] * 100\ntp = sum(1 for i in range(100) if that[i] == 1 and du[i] == 1)\ntn = sum(1 for i in range(100) if that[i] == 0 and du[i] == 0)\nprint((tp + tn) / 100, tp)`,
      question:
        'Mô hình "luôn trả lời 0" trên dữ liệu 1% dương tính cho accuracy và TP bằng bao nhiêu?',
      choices: ['0.99 0', '0.01 1', '0.99 1', '1.0 0'],
      answerIndex: 0,
      explain:
        'TP = 0 (không bắt được ca dương tính nào) nhưng TN = 99 nên accuracy = 0.99. Đây chính là cái bẫy lệch lớp: recall = 0/1 = 0.0 và precision = 0.0 phơi bày ngay mô hình vô dụng, còn accuracy thì che nó lại bằng một con số đẹp.',
    },
    parsons: {
      prompt: 'Xếp đúng thứ tự tính F1 từ nhãn thật và dự đoán.',
      lines: [
        'tp = sum(1 for i in range(n) if that[i] == 1 and du[i] == 1)',
        'fp = sum(1 for i in range(n) if that[i] == 0 and du[i] == 1)',
        'fn = sum(1 for i in range(n) if that[i] == 1 and du[i] == 0)',
        'precision = tp / (tp + fp) if tp + fp > 0 else 0.0',
        'recall = tp / (tp + fn) if tp + fn > 0 else 0.0',
        'f1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0.0',
      ],
    },
    make: {
      prompt:
        'Viết bộ chấm điểm phân loại nhị phân.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: nhãn THẬT, các số 0/1 cách nhau bởi dấu phẩy.\n- Dòng 2: nhãn DỰ ĐOÁN, cùng số lượng.\n\nIn đúng 5 dòng:\nTP=<tp> FP=<fp> FN=<fn> TN=<tn>\nAccuracy: <x>\nPrecision: <x>\nRecall: <x>\nF1: <x>\n\nMọi con số làm tròn 2 chữ số. Khi mẫu số bằng 0 thì thước đo đó bằng 0.0 (đừng để chương trình vỡ).\n\nVí dụ thật "1,1,0,0,1,0" và đoán "1,0,0,0,1,1" → TP=2 FP=1 FN=1 TN=2, cả bốn thước đo đều 0.67.',
      starterCode: `that = [int(x) for x in input("Nhan that: ").split(",")]\ndu = [int(x) for x in input("Du doan: ").split(",")]\ntp = fp = fn = tn = 0\n# dem 4 o cua ma tran nham lan\n# tinh accuracy / precision / recall / f1, nho ca mau so bang 0\n`,
      testCases: [
        {
          stdinLines: ['1,1,0,0,1,0', '1,0,0,0,1,1'],
          expected: 'TP=2 FP=1 FN=1 TN=2\nAccuracy: 0.67\nPrecision: 0.67\nRecall: 0.67\nF1: 0.67',
          match: 'contains',
          hidden: false,
          label: 'Ca cân bằng, đủ cả bốn ô',
        },
        {
          stdinLines: ['1,0,0,0,0,0,0,0,0,0', '0,0,0,0,0,0,0,0,0,0'],
          expected: 'Accuracy: 0.9\nPrecision: 0.0\nRecall: 0.0\nF1: 0.0',
          match: 'contains',
          hidden: false,
          label: 'Lệch lớp: accuracy 0.9 nhưng mô hình vô dụng',
        },
        {
          stdinLines: ['1,1,1,0', '1,1,0,0'],
          expected: 'F1: 0.8',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: precision 1.0, recall 0.67 → F1 = 0.8',
        },
      ],
      hints: [
        'Đếm bốn ô bằng một vòng for duy nhất với if/elif/else — mỗi chỉ số i rơi vào đúng MỘT ô, không bao giờ hai.',
        'Chia an toàn: precision = tp / (tp + fp) if tp + fp > 0 else 0.0. Ca test lệch lớp có tp + fp = 0 nên thiếu nhánh này là chương trình vỡ.',
        'F1 dùng trung bình ĐIỀU HOÀ: 2 * p * r / (p + r), không phải (p + r) / 2.',
        'Làm tròn khi IN, đừng làm tròn khi TÍNH: tính F1 từ precision/recall đầy đủ rồi mới round(f1, 2), nếu không sai số cộng dồn.',
      ],
      sampleSolution: `that = [int(x) for x in input("Nhan that: ").split(",")]\ndu = [int(x) for x in input("Du doan: ").split(",")]\n\ntp = fp = fn = tn = 0\nfor i in range(len(that)):\n    if that[i] == 1 and du[i] == 1:\n        tp += 1\n    elif that[i] == 0 and du[i] == 1:\n        fp += 1\n    elif that[i] == 1 and du[i] == 0:\n        fn += 1\n    else:\n        tn += 1\nprint(f"TP={tp} FP={fp} FN={fn} TN={tn}")\n\nacc = (tp + tn) / len(that)\nprecision = tp / (tp + fp) if tp + fp > 0 else 0.0\nrecall = tp / (tp + fn) if tp + fn > 0 else 0.0\nf1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0.0\nprint(f"Accuracy: {round(acc, 2)}")\nprint(f"Precision: {round(precision, 2)}")\nprint(f"Recall: {round(recall, 2)}")\nprint(f"F1: {round(f1, 2)}")`,
    },
    homework:
      'Chọn 3 hệ thống tự động bạn dùng hằng ngày (bộ lọc thư rác, cảnh báo gian lận thẻ, gợi ý video, cửa tự động siêu thị). Với mỗi cái, viết ra: một FN (bỏ sót) gây hậu quả gì, một FP (báo động giả) gây hậu quả gì, và bên nào tệ hơn. Kết luận của bạn chính là câu trả lời cho "nên tối ưu precision hay recall" — và đó là quyết định nghiệp vụ, không phải quyết định của người viết code.',
    srsCards: [
      {
        hoi: 'Bốn ô của ma trận nhầm lẫn là gì?',
        dap: 'TP thật 1 đoán 1 (bắt đúng) · FP thật 0 đoán 1 (báo động giả) · FN thật 1 đoán 0 (bỏ sót) · TN thật 0 đoán 0 (bỏ qua đúng).',
      },
      {
        hoi: 'Precision và recall khác nhau ở mẫu số nào?',
        dap: 'Precision = TP / (TP + FP) — trong những ca TÔI BÁO dương tính, bao nhiêu đúng. Recall = TP / (TP + FN) — trong những ca THẬT SỰ dương tính, tôi bắt được bao nhiêu.',
      },
      {
        hoi: 'Vì sao accuracy lừa người khi lệch lớp?',
        dap: 'Vì lớp áp đảo làm TN khổng lồ. Mô hình luôn trả lời lớp đa số vẫn được accuracy rất cao dù recall = 0 (bỏ sót 100% ca cần tìm).',
      },
      {
        hoi: 'F1 dùng trung bình điều hoà thay vì trung bình cộng để làm gì?',
        dap: 'Để phạt nặng ca lệch. Precision 1.0 với recall 0.0 cho F1 = 0 (đúng với cảm nhận), trong khi trung bình cộng cho 0.5 nghe như "tạm được".',
      },
    ],
  },
]
