# Đặc tả kín: nội dung khoá ngắn `mlds` — "Machine Learning & Data Science"

> Ngày 2026-09-01. Khoá 03 của cụm 6 khoá "Kỹ sư AI thực chiến"
> (`docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` §03c).
> Đây là đặc tả KÍN: mọi bài mới được viết đầy đủ dưới dạng object literal `ProgrammingLesson`,
> người thi hành chỉ copy vào file nguồn, không phải tự nghĩ nội dung.

## 0. Phạm vi

**LÀM:** soạn 11 bài MỚI (4 bài chương C3 + 7 bài project chương C4) + file
`packages/subject-programming/courses/mlds.ts`.

**KHÔNG làm:** không soạn lại, không sửa, không sao chép nội dung 10 bài của khoá `ml` dùng ở
C1–C2; không đụng `ml-u3`/`ml-u4`; không thêm simulator mới; không dùng numpy/sklearn/pandas
trong code được chấm.

### 0.1. Điểm chạm file bắt buộc (ngoài nội dung bài)

| File                                                | Việc                                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `packages/subject-programming/lessonTypes.ts`        | Nới regex `id` và `unitId`: thêm `mlds` vào nhánh `(git\|hermes\|vibe\|openclaw\|ml)`     |
| `packages/subject-programming/courses/types.ts`      | `ShortCourseId` thêm `\| 'mlds'`                                                          |
| `packages/subject-programming/courses/registry.ts`   | Đăng ký `MLDS_COURSE`                                                                     |
| `packages/subject-programming/lessons/mldsu1..u3.ts` | 3 file bài học mới (4 + 4 + 3 bài)                                                        |
| `packages/subject-programming/lessons.ts`            | Nối 3 mảng bài mới vào danh sách tổng                                                     |

> ⚠️ Vướng mắc đã ghi nhận, KHÔNG tự chế: đặc tả cụm §1.3 nói "nới thêm 5 tiền tố mới ở 4 chỗ".
> Đặc tả này chỉ nêu 3 chỗ chắc chắn đọc được từ mã nguồn (`lessonTypes.ts` có 2 regex, `types.ts`,
> `registry.ts`). Người thi hành phải `grep -rn "openclaw|ml)-u" packages/ apps/` để tìm nốt các
> chỗ còn lại trước khi khai báo xong.

## 1. C1 và C2 — THAM CHIẾU, không soạn lại

Hai chương đầu của `mlds` **dùng nguyên** bài của khoá `ml` bằng `lessonIds`. Đây là luật số 1
của tầng khoá ngắn (`courses/types.ts`): tham chiếu, không nhúng — nhúng sẽ tạo hai bản sao rồi
phân kỳ theo thời gian.

**C1 — Bản đồ ML & học có giám sát** (5 bài, đã có sẵn trong `lessons/mlu1.ts`):

| id         | Tiêu đề bài đã có                                          |
| ---------- | ---------------------------------------------------------- |
| `ml-u1-l1` | Học máy là gì — luật viết tay vs học từ dữ liệu             |
| `ml-u1-l2` | Hồi quy tuyến tính — tự cài mô hình đoán con số             |
| `ml-u1-l3` | Phân loại k-NN — "hàng xóm gần nhất nói bạn là ai"          |
| `ml-u1-l4` | Train/test split & accuracy — đừng chấm bài bằng đề đã phát đáp án |
| `ml-u1-l5` | Overfitting — khi mô hình học vẹt thay vì học hiểu          |

**C2 — Học không giám sát** (5 bài, đã có sẵn trong `lessons/mlu2.ts`):

| id         | Tiêu đề bài đã có                                                  |
| ---------- | ------------------------------------------------------------------ |
| `ml-u2-l1` | K-means — tự cài một vòng gán-cụm                                   |
| `ml-u2-l2` | Chuẩn hoá dữ liệu — vì sao thang đo khác nhau làm khoảng cách nói dối |
| `ml-u2-l3` | Giảm chiều — giữ trục nào, bỏ trục nào                              |
| `ml-u2-l4` | Luật kết hợp — "mua bia thì hay mua thêm gì?"                       |
| `ml-u2-l5` | DBSCAN — gom cụm theo mật độ, không cần biết trước số cụm           |

Nội dung 10 bài trên **không được chép vào đây**. Chúng là ngữ cảnh đầu vào: các bài mới ở C3/C4
được soạn để NỐI TIẾP đúng mạch đó — gọi lại (nhắc tên, không dạy lại) train/test split, accuracy,
k-NN, k-means, chuẩn hoá min-max, overfitting, Naive Bayes.

## 2. Bốn bài mới của C3 — `mlds-u1` "Data Science thực chiến"

File nguồn: `packages/subject-programming/lessons/mldsu1.ts`, export `MLDS_U1_LESSONS`.

### 2.1. `mlds-u1-l1` — Làm sạch dữ liệu

```typescript
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
    prompt: 'Xếp đúng thứ tự một quy trình làm sạch: bỏ thiếu → khử trùng → tính ngưỡng IQR → lọc.',
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
}
```

### 2.2. `mlds-u1-l2` — Khám phá dữ liệu (EDA)

```typescript
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
    choices: ["{'a': 2, 'b': 1}", "{'a': 1, 'b': 1}", "{'a': 3, 'b': 1}", 'Lỗi KeyError ở vòng đầu'],
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
        expected: 'bac: tong 400, trung binh 200.0, so ban ghi 2\nnam: tong 300, trung binh 150.0, so ban ghi 2\nDan dau: bac',
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
}
```

### 2.3. `mlds-u1-l3` — Feature engineering

```typescript
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
        expected: 'Cot one-hot: hanoi hue\nNguoi 1: tuoi_chuan=0.0, nhom=tre, onehot=1 0\nNguoi 2: tuoi_chuan=0.33, nhom=truong thanh, onehot=0 1\nNguoi 3: tuoi_chuan=1.0, nhom=cao tuoi, onehot=1 0',
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
      hoi: 'Rò rỉ dữ liệu (data leakage) là gì?',
      dap: 'Khi feature chứa thông tin mà lúc dự đoán thật ta không thể có — ví dụ dùng "ngày trả nợ" để đoán "có trả nợ không", hoặc tính min/max trên toàn bộ dữ liệu rồi mới chia train/test.',
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
}
```

### 2.4. `mlds-u1-l4` — Đánh giá cho đúng

```typescript
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
    question: 'Mô hình "luôn trả lời 0" trên dữ liệu 1% dương tính cho accuracy và TP bằng bao nhiêu?',
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
}
```

## 3. Bảy bài project của C4 — chia 4 + 3

### 3.0. Cách chia và lý do

Đặc tả cụm §03c ghi "`mlds-u2` 5 bài + `mlds-u3` 3 bài" nhưng cùng lúc liệt kê **đúng 7 project**
(① giá nhà ② khoản vay ③ phân cụm khách hàng ④ NLP thư rác ⑤ CV ảnh 5×5 ⑥ time series
⑦ recommendation). 5 + 3 = 8 ≠ 7 — mâu thuẫn nội tại của khung. Tổng số project (7) là con số
được lặp lại ở cả `canDo`, bảng §1.1 và mô tả chi tiết, nên nó là con số ĐÚNG; "5 bài" là chỗ sai.

**Quyết định: `mlds-u2` 4 bài + `mlds-u3` 3 bài**, đúng gợi ý ưu tiên của brief. Ranh giới không
tuỳ tiện mà theo DẠNG DỮ LIỆU — thứ quyết định toàn bộ cách tiền xử lý:

- **`mlds-u2` "Project trên dữ liệu bảng và văn bản"** (4 bài): ba bài toán kinh điển của dữ liệu
  bảng (hồi quy · phân loại · gom cụm) rồi bước đầu sang văn bản (bag-of-words). Điểm chung: mỗi
  hàng là một bản ghi độc lập, thứ tự các hàng không mang thông tin.
- **`mlds-u3` "Project trên ảnh, chuỗi thời gian và hệ gợi ý"** (3 bài): ba dạng dữ liệu mà CẤU
  TRÚC là thông tin — ảnh có quan hệ không gian giữa các pixel, chuỗi thời gian có thứ tự không
  được xáo, ma trận đánh giá có quan hệ người × vật. Bài cuối kiêm tổng kết khoá.

File nguồn: `lessons/mldsu2.ts` (export `MLDS_U2_LESSONS`) và `lessons/mldsu3.ts`
(export `MLDS_U3_LESSONS`).

### 3.1. `mlds-u2-l1` — Project 1: dự đoán giá nhà (hồi quy, MAE)

```typescript
{
  id: 'mlds-u2-l1',
  unitId: 'mlds-u2',
  language: 'python',
  title: 'Project 1 — dự đoán giá nhà mini và đo sai số bằng MAE',
  hook: 'Nhà 45 m² trong ngõ đó giá bao nhiêu? Môi giới trả lời bằng kinh nghiệm; bạn trả lời bằng 6 căn đã bán quanh đó và một đường thẳng. Project đầu tiên của khoá: đi trọn một vòng từ dữ liệu thô tới con số dự đoán KÈM sai số trung bình — vì một dự đoán không có sai số đi kèm là một lời nói suông.',
  theory:
    'Đây là project đầu tiên: bạn ráp lại hồi quy tuyến tính (ml-u1-l2) với thói quen đo lường của người làm dữ liệu.\n\nMÔ HÌNH: gia = a × dien_tich + b, học bằng công thức least squares đã có ở ml-u1-l2:\n- a = tổng[(x − tb_x)(y − tb_y)] / tổng[(x − tb_x)²]\n- b = tb_y − a × tb_x\n\nTHƯỚC ĐO MỚI — MAE (Mean Absolute Error, sai số tuyệt đối trung bình): MAE = trung bình của |thật − dự đoán|. Ưu điểm lớn nhất là nó CÙNG ĐƠN VỊ với dữ liệu: "MAE 17,5 triệu" nói thẳng vào mặt bạn rằng mô hình lệch trung bình 17,5 triệu mỗi căn. Bạn không cần giải thích gì thêm cho người không làm kỹ thuật.\n\nHọ thước đo hồi quy, biết để đọc báo cáo người khác:\n- MAE — trung bình sai số tuyệt đối, mọi sai số nặng như nhau.\n- RMSE — căn của trung bình bình phương sai số, PHẠT NẶNG các ca lệch lớn. Chọn RMSE khi một cú lệch to tệ hơn nhiều cú lệch nhỏ.\n- MAPE — sai số theo phần trăm, dùng khi các giá trị chênh nhau nhiều bậc (gặp lại ở project 6).\n\nMột tính chất đẹp của hồi quy tuyến tính, nên tự kiểm bằng tay: đường hồi quy LUÔN đi qua điểm (trung bình x, trung bình y). Đưa vào diện tích đúng bằng trung bình thì mô hình trả về đúng giá trung bình. Nếu code của bạn không có tính chất đó, bạn đã sai công thức ở đâu đó.\n\nCẢNH BÁO nghề, phải nói thẳng: MAE trong bài này được đo TRÊN CHÍNH DỮ LIỆU HUẤN LUYỆN vì tập chỉ có 6 căn. Đó là con số LẠC QUAN — mô hình đã "thấy đáp án" (ml-u1-l4). Với dữ liệu thật bạn phải chia train/test rồi báo cáo MAE trên test. Ở đây ta chấp nhận đánh đổi để bài đủ nhỏ, nhưng phải nói ra, không được giấu.\n\nBản sklearn của cả project này gọn đúng bốn dòng: LinearRegression().fit(X, y), rồi mean_absolute_error(y, model.predict(X)). Bạn tự cài hôm nay để biết bốn dòng đó tính gì.',
  workedExample: {
    code: `# Hoi quy tuyen tinh + MAE tren mot bang nho
du_lieu = [(30, 950), (40, 1180), (50, 1520)]   # (dien tich m2, gia trieu)
x = [d[0] for d in du_lieu]
y = [d[1] for d in du_lieu]

tb_x = sum(x) / len(x)
tb_y = sum(y) / len(y)
tu_so = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))
mau_so = sum((x[i] - tb_x) ** 2 for i in range(len(x)))
a = tu_so / mau_so                      # do doc: moi m2 them bao nhieu trieu
b = tb_y - a * tb_x                     # diem cat truc
print(f"Mo hinh: gia = {round(a, 2)} * dien_tich + {round(b, 2)}")

sai_so = [abs(y[i] - (a * x[i] + b)) for i in range(len(x))]
mae = sum(sai_so) / len(sai_so)         # MAE: cung don vi voi gia
print(f"MAE: {round(mae, 2)} trieu")
print(f"Kiem tra: dua vao tb_x={tb_x} -> {round(a * tb_x + b, 2)} (phai bang tb_y={tb_y})")`,
    stdinLines: [],
  },
  predict: {
    code: `y_that = [100, 200, 300]\ny_doan = [110, 190, 330]\nsai = [abs(y_that[i] - y_doan[i]) for i in range(3)]\nprint(sum(sai) / 3)`,
    question: 'MAE của ba dự đoán này bằng bao nhiêu?',
    choices: ['16.666666666666668', '10.0', '50.0', '0.0'],
    answerIndex: 0,
    explain:
      'Sai số tuyệt đối là 10, 10, 30 → tổng 50, chia 3 = 16.67. Chú ý dấu GIÁ TRỊ TUYỆT ĐỐI: nếu quên abs() thì 10 + (−10) + 30 sẽ triệt tiêu nhau và cho con số đẹp giả tạo — một mô hình đoán cao chỗ này, thấp chỗ kia sẽ trông như hoàn hảo.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự một project hồi quy: tách cột → học tham số → dự đoán → đo sai số.',
    lines: [
      'x = [d[0] for d in du_lieu]',
      'y = [d[1] for d in du_lieu]',
      'tb_x, tb_y = sum(x) / len(x), sum(y) / len(y)',
      'a = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x))) / sum((x[i] - tb_x) ** 2 for i in range(len(x)))',
      'b = tb_y - a * tb_x',
      'mae = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x)',
    ],
  },
  make: {
    prompt:
      'Làm trọn project dự đoán giá nhà với dữ liệu 6 căn đã nhúng sẵn trong starterCode (diện tích m², giá triệu đồng).\n\nChương trình đọc MỘT dòng input(): diện tích căn cần định giá (số nguyên).\n\nIn đúng 3 dòng:\nMo hinh: gia = <a> * dien_tich + <b>\nMAE tren du lieu huan luyen: <mae>\nDu doan <dien tich> m2: <gia> trieu\n\nMọi con số làm tròn 2 chữ số. a và b học bằng công thức least squares; MAE đo trên chính 6 căn dữ liệu.\n\nGợi ý tự kiểm: diện tích trung bình của 6 căn là 55 — đưa vào 55 phải ra đúng giá trung bình 1655.0.',
    starterCode: `DU_LIEU = [(30, 950), (40, 1180), (50, 1520), (60, 1790), (70, 2110), (80, 2380)]\ndien_tich = int(input("Dien tich can dinh gia (m2): "))\nx = [d[0] for d in DU_LIEU]\ny = [d[1] for d in DU_LIEU]\n# Hoc a, b bang least squares\n# Tinh MAE tren chinh DU_LIEU\n# Du doan cho dien_tich\n`,
    testCases: [
      {
        stdinLines: ['55'],
        expected: 'Mo hinh: gia = 29.17 * dien_tich + 50.57\nMAE tren du lieu huan luyen: 17.52\nDu doan 55 m2: 1655.0 trieu',
        match: 'contains',
        hidden: false,
        label: 'Diện tích bằng trung bình → dự đoán đúng giá trung bình 1655.0',
      },
      {
        stdinLines: ['100'],
        expected: 'Du doan 100 m2: 2967.71 trieu',
        match: 'contains',
        hidden: false,
        label: 'Ngoại suy ra ngoài khoảng dữ liệu (30–80 m²)',
      },
      {
        stdinLines: ['45'],
        expected: 'Du doan 45 m2: 1363.29 trieu',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: nội suy giữa hai điểm dữ liệu',
      },
    ],
    hints: [
      'Tách hai cột trước: x là diện tích, y là giá. Cả công thức least squares chỉ làm việc trên hai list này.',
      'Công thức đã có ở ml-u1-l2: a = tổng[(x−tb_x)(y−tb_y)] / tổng[(x−tb_x)²], rồi b = tb_y − a × tb_x. Đừng đảo thứ tự — b cần a đã tính xong.',
      'MAE = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x). Nhớ abs(), thiếu nó thì sai số dương và âm triệt tiêu nhau.',
      'Làm tròn CHỈ khi in: round(a, 2) trong f-string. Nếu làm tròn a rồi mới tính b và MAE thì sai số cộng dồn và ba con số sẽ lệch.',
    ],
    sampleSolution: `DU_LIEU = [(30, 950), (40, 1180), (50, 1520), (60, 1790), (70, 2110), (80, 2380)]\ndien_tich = int(input("Dien tich can dinh gia (m2): "))\n\nx = [d[0] for d in DU_LIEU]\ny = [d[1] for d in DU_LIEU]\ntb_x = sum(x) / len(x)\ntb_y = sum(y) / len(y)\ntu_so = sum((x[i] - tb_x) * (y[i] - tb_y) for i in range(len(x)))\nmau_so = sum((x[i] - tb_x) ** 2 for i in range(len(x)))\na = tu_so / mau_so\nb = tb_y - a * tb_x\nprint(f"Mo hinh: gia = {round(a, 2)} * dien_tich + {round(b, 2)}")\n\nmae = sum(abs(y[i] - (a * x[i] + b)) for i in range(len(x))) / len(x)\nprint(f"MAE tren du lieu huan luyen: {round(mae, 2)}")\n\ngia = a * dien_tich + b\nprint(f"Du doan {dien_tich} m2: {round(gia, 2)} trieu")`,
  },
  homework:
    'Vào một trang rao bán nhà, chép tay 10 căn cùng một khu vực (diện tích và giá). Thay vào DU_LIEU rồi chạy lại. Trả lời ba câu: (1) độ dốc a bằng bao nhiêu, nghĩa là mỗi m² đáng giá bao nhiêu ở khu đó? (2) MAE bao nhiêu — bạn có dám mua bán dựa trên mô hình lệch chừng đó không? (3) Căn nào lệch xa nhất so với đường hồi quy, và vì sao (tầng cao? mặt tiền? ngõ nhỏ?) — chính câu ba chỉ cho bạn feature còn thiếu.',
  srsCards: [
    {
      hoi: 'MAE là gì và ưu điểm lớn nhất của nó?',
      dap: 'MAE = trung bình của |thật − dự đoán|. Ưu điểm: CÙNG ĐƠN VỊ với dữ liệu, nên "MAE 17,5 triệu" tự giải thích được cho người không làm kỹ thuật.',
    },
    {
      hoi: 'MAE khác RMSE ở chỗ nào?',
      dap: 'MAE coi mọi sai số nặng như nhau. RMSE bình phương sai số nên PHẠT NẶNG các ca lệch lớn — chọn RMSE khi một cú lệch to tệ hơn nhiều cú lệch nhỏ.',
    },
    {
      hoi: 'Tính chất nào của hồi quy tuyến tính dùng để tự kiểm code?',
      dap: 'Đường hồi quy luôn đi qua điểm (trung bình x, trung bình y). Đưa vào x bằng trung bình phải ra đúng y trung bình — không đúng là công thức đã sai.',
    },
    {
      hoi: 'Vì sao MAE đo trên dữ liệu huấn luyện là con số lạc quan?',
      dap: 'Vì mô hình đã "thấy" chính các điểm đó khi học. Con số trung thực phải đo trên tập test mà mô hình chưa từng gặp.',
    },
  ],
}
```

### 3.2. `mlds-u2-l2` — Project 2: duyệt khoản vay (phân loại + công bằng)

```typescript
{
  id: 'mlds-u2-l2',
  unitId: 'mlds-u2',
  language: 'python',
  title: 'Project 2 — duyệt khoản vay bằng k-NN và câu hỏi công bằng',
  hook: 'Ngân hàng đưa bạn 8 hồ sơ cũ kèm kết quả duyệt/từ chối, rồi hỏi: hồ sơ mới này nên duyệt không? Bạn viết được mô hình trong 30 dòng. Câu khó hơn nằm ngay sau đó: nếu mô hình từ chối một người, bạn có giải thích được VÌ SAO cho họ nghe không?',
  theory:
    'Project 2 ráp ba thứ đã học: k-NN (ml-u1-l3), chuẩn hoá min-max (ml-u2-l2, mlds-u1-l3) và ma trận nhầm lẫn (mlds-u1-l4).\n\nQUY TRÌNH đúng thứ tự, và thứ tự này quan trọng:\n1. Chia dữ liệu thành TRAIN và TEST trước mọi thứ khác.\n2. Học min/max CHỈ TỪ TRAIN, áp lên cả train lẫn test (luật chống rò rỉ ở mlds-u1-l3). Hồ sơ mới có thể chuẩn hoá ra ngoài [0, 1] — đúng, không phải lỗi.\n3. Với mỗi hồ sơ test: tính khoảng cách tới toàn bộ train, lấy k = 3 hàng xóm gần nhất, bỏ phiếu đa số.\n4. Đếm TP/FP/FN/TN trên tập test, báo cáo.\n\nVì sao BẮT BUỘC chuẩn hoá ở bài này: thu nhập chạy 12–30 (triệu), nợ chạy 2–14 (triệu). Nếu để thô, một chênh lệch 10 triệu thu nhập và 10 triệu nợ đóng góp bằng nhau vào khoảng cách dù dải giá trị của chúng khác nhau — thang đo lớn hơn sẽ lấn át. Chuẩn hoá đưa cả hai về [0, 1] để mỗi trục nói tiếng nói ngang nhau.\n\nBỎ PHIẾU với k lẻ (k = 3) thì không bao giờ hoà. Đó là lý do người ta chọn k lẻ cho bài nhị phân.\n\nBA CÂU HỎI NGHIỆP VỤ mà bài này bắt buộc phải đặt, và chúng quan trọng ngang phần code:\n\n1. TẬP TEST QUÁ NHỎ. Bốn hồ sơ test cho accuracy 1.0 — con số đó KHÔNG có nghĩa là mô hình hoàn hảo, nó chỉ có nghĩa là bạn chưa đo được gì cả. Một hồ sơ sai là accuracy tụt xuống 0.75. Luật ngón tay cái: dưới vài trăm ca test thì mọi con số đều là ước lượng rất thô.\n\n2. CHỌN THƯỚC ĐO THEO CÁI GIÁ CỦA LỖI. FP (duyệt nhầm người không trả được) làm ngân hàng mất tiền. FN (từ chối nhầm người tốt) làm một gia đình không mua được nhà — mất mát này không nằm trong sổ sách của ngân hàng, nên rất dễ bị bỏ quên. Ai chịu thiệt hại nào là câu hỏi phải trả lời TRƯỚC khi chọn tối ưu precision hay recall.\n\n3. CÔNG BẰNG (fairness). Mô hình học từ quyết định CŨ của con người. Nếu trước đây người duyệt có thiên kiến, mô hình sẽ học đúng thiên kiến đó rồi đóng dấu "khách quan vì máy tính tính" lên nó. Hai điều tối thiểu phải làm: (a) không đưa các thuộc tính nhạy cảm (giới tính, dân tộc, tôn giáo) vào feature — và nhớ rằng chúng có thể LỌT VÀO GIÁN TIẾP qua feature khác như địa chỉ; (b) đo lại precision/recall RIÊNG cho từng nhóm dân cư, vì mô hình có thể tốt trên tổng thể mà rất tệ với một nhóm. Nhiều nước đã có luật buộc bên cho vay giải thích được lý do từ chối — một mô hình không giải thích được là mô hình không dùng được, dù điểm cao.',
  workedExample: {
    code: `# k-NN k=3 co chuan hoa: tham so min/max HOC TU TRAIN roi ap len ho so moi
TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),
         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]

min_tn = min(h[0] for h in TRAIN)   # tham so tien xu ly: chi tu TRAIN
max_tn = max(h[0] for h in TRAIN)
min_no = min(h[1] for h in TRAIN)
max_no = max(h[1] for h in TRAIN)

def chuan(tn, no):
    return ((tn - min_tn) / (max_tn - min_tn), (no - min_no) / (max_no - min_no))

def du_doan(tn, no):
    diem = chuan(tn, no)
    kc = []
    for t in TRAIN:
        p = chuan(t[0], t[1])
        d = (p[0] - diem[0]) ** 2 + (p[1] - diem[1]) ** 2   # binh phuong khoang cach
        kc.append((d, t[2]))
    kc.sort()                                   # gan nhat len dau
    gan = kc[:3]
    so_duyet = sum(1 for x in gan if x[1] == 1)
    return 1 if so_duyet * 2 > 3 else 0         # bo phieu da so, k le nen khong hoa

print(du_doan(24, 3))   # thu nhap cao, no thap
print(du_doan(14, 11))  # thu nhap thap, no cao`,
    stdinLines: [],
  },
  predict: {
    code: `gan = [(0.01, 0), (0.05, 1), (0.09, 0)]\nso_duyet = sum(1 for x in gan if x[1] == 1)\nprint(so_duyet, 1 if so_duyet * 2 > 3 else 0)`,
    question: 'Ba hàng xóm gần nhất có nhãn 0, 1, 0 — kết quả bỏ phiếu là gì?',
    choices: ['1 0', '1 1', '2 1', '0 0'],
    answerIndex: 0,
    explain:
      'Chỉ 1 trong 3 hàng xóm mang nhãn duyệt, 1 × 2 = 2 không lớn hơn 3 nên kết quả là 0 (từ chối). Chú ý k-NN KHÔNG quan tâm hàng xóm gần tới mức nào — hàng xóm ở khoảng cách 0.01 và 0.09 có phiếu bằng nhau. Muốn phiếu nặng nhẹ theo khoảng cách thì phải dùng biến thể weighted k-NN.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự CHỐNG RÒ RỈ của một pipeline phân loại có chuẩn hoá.',
    lines: [
      'min_tn, max_tn = min(h[0] for h in TRAIN), max(h[0] for h in TRAIN)',
      'diem = chuan(ho_so[0], ho_so[1])',
      'kc = [((chuan(t[0], t[1])[0] - diem[0]) ** 2 + (chuan(t[0], t[1])[1] - diem[1]) ** 2, t[2]) for t in TRAIN]',
      'kc.sort()',
      'gan = kc[:3]',
      'nhan = 1 if sum(1 for x in gan if x[1] == 1) * 2 > 3 else 0',
    ],
  },
  make: {
    prompt:
      'Làm trọn project duyệt khoản vay. TRAIN (8 hồ sơ) và TEST (4 hồ sơ) đã nhúng sẵn trong starterCode, mỗi hồ sơ là (thu nhập triệu, nợ triệu, nhãn) với nhãn 1 = duyệt, 0 = từ chối.\n\nChương trình đọc 2 dòng input(): thu nhập rồi nợ của hồ sơ MỚI (số nguyên).\n\nQuy trình bắt buộc:\n1. Học min/max của cả hai cột CHỈ TỪ TRAIN, chuẩn hoá min-max.\n2. Phân loại bằng k-NN với k = 3, khoảng cách Euclid trên toạ độ đã chuẩn hoá, bỏ phiếu đa số.\n3. Chấm trên tập TEST rồi phân loại hồ sơ mới.\n\nIn đúng 3 dòng:\nTP=<tp> FP=<fp> FN=<fn> TN=<tn>\nAccuracy tren tap test: <x>\nHo so cua ban: duyet  (hoặc "Ho so cua ban: tu choi")\n\nAccuracy làm tròn 2 chữ số.',
    starterCode: `TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),\n         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]\nTEST = [(24, 3, 1), (14, 11, 0), (26, 12, 0), (19, 5, 1)]\nK = 3\n# Hoc min/max tu TRAIN, viet ham chuan(tn, no) va du_doan(tn, no)\n# Cham tren TEST (dem TP/FP/FN/TN), roi doc ho so moi tu input()\n`,
    testCases: [
      {
        stdinLines: ['21', '4'],
        expected: 'TP=2 FP=0 FN=0 TN=2\nAccuracy tren tap test: 1.0',
        match: 'contains',
        hidden: false,
        label: 'Chấm đúng 4 hồ sơ test: 2 duyệt, 2 từ chối',
      },
      {
        stdinLines: ['21', '4'],
        expected: 'Ho so cua ban: duyet',
        match: 'contains',
        hidden: false,
        label: 'Thu nhập khá, nợ thấp → 3 hàng xóm đều là hồ sơ được duyệt',
      },
      {
        stdinLines: ['13', '12'],
        expected: 'Ho so cua ban: tu choi',
        match: 'contains',
        hidden: false,
        label: 'Thu nhập thấp, nợ cao → 3 hàng xóm đều bị từ chối',
      },
      {
        stdinLines: ['30', '2'],
        expected: 'Ho so cua ban: duyet',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: hồ sơ nằm ở rìa dải dữ liệu train',
      },
    ],
    hints: [
      'Viết hàm chuan(tn, no) trả về BỘ ĐÔI đã chuẩn hoá, dùng chung cho cả điểm train lẫn hồ sơ mới — viết hai lần công thức là nguồn của lỗi lệch.',
      'So sánh khoảng cách thì KHÔNG cần math.sqrt: căn bậc hai là hàm tăng nên thứ tự không đổi. Bỏ nó đi cho gọn và nhanh.',
      'kc.append((d, nhan)) rồi kc.sort() — Python sắp xếp bộ đôi theo phần tử đầu, tức theo khoảng cách tăng dần. Lấy 3 phần tử đầu bằng kc[:3].',
      'Bỏ phiếu: so_duyet * 2 > K. Viết vậy để đổi K sang 5 hay 7 vẫn đúng, không phải sửa lại con số 1 hay 2.',
    ],
    sampleSolution: `TRAIN = [(20, 2, 1), (25, 5, 1), (30, 3, 1), (18, 10, 0),\n         (12, 8, 0), (15, 12, 0), (28, 14, 0), (22, 4, 1)]\nTEST = [(24, 3, 1), (14, 11, 0), (26, 12, 0), (19, 5, 1)]\nK = 3\n\nmin_tn = min(h[0] for h in TRAIN)\nmax_tn = max(h[0] for h in TRAIN)\nmin_no = min(h[1] for h in TRAIN)\nmax_no = max(h[1] for h in TRAIN)\n\n\ndef chuan(tn, no):\n    return ((tn - min_tn) / (max_tn - min_tn), (no - min_no) / (max_no - min_no))\n\n\ndef du_doan(tn, no):\n    diem = chuan(tn, no)\n    kc = []\n    for t in TRAIN:\n        p = chuan(t[0], t[1])\n        d = (p[0] - diem[0]) ** 2 + (p[1] - diem[1]) ** 2\n        kc.append((d, t[2]))\n    kc.sort()\n    gan = kc[:K]\n    so_duyet = sum(1 for x in gan if x[1] == 1)\n    return 1 if so_duyet * 2 > K else 0\n\n\ntp = fp = fn = tn = 0\nfor t in TEST:\n    p = du_doan(t[0], t[1])\n    if t[2] == 1 and p == 1:\n        tp += 1\n    elif t[2] == 0 and p == 1:\n        fp += 1\n    elif t[2] == 1 and p == 0:\n        fn += 1\n    else:\n        tn += 1\nprint(f"TP={tp} FP={fp} FN={fn} TN={tn}")\nprint(f"Accuracy tren tap test: {round((tp + tn) / len(TEST), 2)}")\n\nthu_nhap = int(input("Thu nhap (trieu): "))\nno = int(input("No (trieu): "))\nprint("Ho so cua ban: " + ("duyet" if du_doan(thu_nhap, no) == 1 else "tu choi"))`,
  },
  homework:
    'Mô hình của bạn vừa đạt accuracy 1.0 trên tập test. Viết ra ba lý do vì sao bạn KHÔNG được đem con số đó đi báo cáo như một lời hứa. Rồi thêm vào TRAIN một cột giả "quận" (giá trị 1 hoặc 2) sao cho quận 2 toàn hồ sơ bị từ chối, chạy lại và xem mô hình đối xử với hồ sơ quận 2 thế nào. Đó là mô phỏng thu nhỏ của cách thiên kiến lịch sử chui vào mô hình qua một feature trông hoàn toàn vô hại.',
  srsCards: [
    {
      hoi: 'Vì sao phải chuẩn hoá trước khi chạy k-NN?',
      dap: 'Vì k-NN đo khoảng cách. Cột có dải giá trị lớn hơn sẽ lấn át cột nhỏ dù không quan trọng hơn. Min-max đưa mọi cột về [0, 1] để mỗi trục có tiếng nói ngang nhau.',
    },
    {
      hoi: 'Vì sao chọn k LẺ cho bài phân loại nhị phân?',
      dap: 'Để bỏ phiếu đa số không bao giờ hoà — với k = 3 hoặc 5 luôn có một bên thắng, không cần luật phá hoà tuỳ tiện.',
    },
    {
      hoi: 'Mô hình duyệt vay học từ quyết định cũ của con người có rủi ro gì?',
      dap: 'Nó học luôn thiên kiến lịch sử rồi khoác cho thiên kiến đó vẻ khách quan của máy. Phải loại thuộc tính nhạy cảm (kể cả lọt vào gián tiếp qua địa chỉ) và đo precision/recall riêng cho từng nhóm dân cư.',
    },
    {
      hoi: 'Accuracy 1.0 trên tập test 4 mẫu nói lên điều gì?',
      dap: 'Gần như không nói lên gì — tập test quá nhỏ nên con số là ước lượng rất thô (sai một ca là tụt còn 0.75). Cần vài trăm ca test trở lên mới đáng tin.',
    },
  ],
}
```

### 3.3. `mlds-u2-l3` — Project 3: phân cụm khách hàng (k-means, diễn giải cụm)

```typescript
{
  id: 'mlds-u2-l3',
  unitId: 'mlds-u2',
  language: 'python',
  title: 'Project 3 — phân cụm khách hàng và đặt tên cho từng cụm',
  hook: 'Bạn có 8 khách hàng, không ai dán nhãn "VIP" hay "bình thường" cho bạn cả. K-means chia họ thành hai nhóm trong nửa giây. Nhưng máy chỉ trả về "cụm 0" và "cụm 1" — việc của bạn là nhìn vào tâm cụm rồi ĐẶT TÊN cho chúng, và đó mới là phần tạo ra giá trị.',
  theory:
    'Project 3 dùng lại k-means (ml-u2-l1) và chuẩn hoá (ml-u2-l2), lần này đi trọn vòng lặp chứ không chỉ một bước gán.\n\nVÒNG LẶP K-MEANS, lặp cho tới khi ổn định:\n1. GÁN: mỗi điểm về tâm gần nhất.\n2. CẬP NHẬT: tâm mới = trung bình các điểm trong cụm.\nLặp lại. Thuật toán dừng khi không điểm nào đổi cụm — với dữ liệu tách bạch, thường chỉ 2–3 vòng.\n\nVẤN ĐỀ TẤT ĐỊNH, phải xử lý dứt khoát: k-means thật khởi tạo tâm NGẪU NHIÊN, nên chạy hai lần có thể ra hai kết quả khác nhau (sklearn khắc phục bằng n_init: chạy nhiều lần rồi giữ kết quả tốt nhất). Trong bài này ta chốt cứng: tâm khởi tạo là điểm ĐẦU và điểm CUỐI của danh sách. Nhờ vậy chạy lại bao nhiêu lần cũng ra một kết quả — điều kiện bắt buộc để bài có thể chấm bằng test-case.\n\nDIỄN GIẢI CỤM là bước mà máy không làm hộ được. Quy trình chuẩn:\n1. Nhìn TÂM của từng cụm — cụm nào chi tiêu cao, mua nhiều lần?\n2. Nhìn KÍCH THƯỚC — cụm 3 người và cụm 300 người mang ý nghĩa kinh doanh khác hẳn.\n3. Đặt tên bằng ngôn ngữ nghiệp vụ: "khách VIP mua thường xuyên", "khách thử một lần rồi thôi".\n4. Ứng với mỗi cụm là một hành động khác nhau: cụm VIP thì chăm sóc riêng, cụm ngủ đông thì gửi ưu đãi đánh thức.\nMột báo cáo dừng ở "có 2 cụm" là báo cáo chưa làm xong việc.\n\nCHỌN k BAO NHIÊU: k-means bắt bạn khai trước số cụm. Cách chọn phổ biến là ELBOW — chạy với k = 1, 2, 3... rồi vẽ tổng bình phương khoảng cách trong cụm; chỗ đường gãy khuỷu là k hợp lý. Cách khác là silhouette. Bài này chốt k = 2 vì dữ liệu tách bạch rõ, nhưng phải biết rằng với dữ liệu thật, chọn k là một quyết định chứ không phải hằng số.',
  workedExample: {
    code: `# Mot vong k-means day du: gan roi cap nhat tam
KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]
tam = [KHACH[0], KHACH[-1]]      # khoi tao TAT DINH: diem dau va diem cuoi

for _ in range(3):               # 3 vong la du on dinh voi du lieu tach bach
    nhom = [[], []]
    for kh in KHACH:             # buoc GAN
        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2
        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2
        nhom[0 if d0 <= d1 else 1].append(kh)
    for c in range(2):           # buoc CAP NHAT
        if nhom[c]:
            tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]),
                      sum(p[1] for p in nhom[c]) / len(nhom[c]))

for c in range(2):
    print(f"Cum {c}: tam ({round(tam[c][0], 2)}, {round(tam[c][1], 2)}), so khach {len(nhom[c])}")`,
    stdinLines: [],
  },
  predict: {
    code: `nhom = [(1, 2), (2, 3), (1, 1), (3, 2)]\ntam_x = sum(p[0] for p in nhom) / len(nhom)\ntam_y = sum(p[1] for p in nhom) / len(nhom)\nprint(tam_x, tam_y)`,
    question: 'Tâm mới của cụm gồm 4 điểm này nằm ở đâu?',
    choices: ['1.75 2.0', '2.0 1.75', '7.0 8.0', '1.0 1.0'],
    answerIndex: 0,
    explain:
      'Tâm là trung bình theo TỪNG TRỤC riêng: x = (1+2+1+3)/4 = 1.75, y = (2+3+1+2)/4 = 2.0. Chú ý tâm cụm thường KHÔNG trùng với bất kỳ điểm dữ liệu nào — nó là một điểm ảo đại diện cho cả nhóm. (Muốn tâm luôn là một điểm thật thì dùng biến thể k-medoids.)',
  },
  parsons: {
    prompt: 'Xếp đúng một vòng lặp k-means: khởi tạo tâm → gán → cập nhật tâm.',
    lines: [
      'tam = [KHACH[0], KHACH[-1]]',
      'for _ in range(3):',
      '    nhom = [[], []]',
      '    for kh in KHACH:',
      '        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2',
      '        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2',
      '        nhom[0 if d0 <= d1 else 1].append(kh)',
      '    for c in range(2):',
      '        tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]), sum(p[1] for p in nhom[c]) / len(nhom[c]))',
    ],
  },
  make: {
    prompt:
      'Làm trọn project phân cụm khách hàng. Dữ liệu 8 khách đã nhúng sẵn: mỗi khách là (chi tiêu triệu, số lần mua).\n\nChạy k-means với k = 2, tâm khởi tạo là KHACH[0] và KHACH[-1], lặp đúng 3 vòng (gán → cập nhật tâm). Điểm cách đều hai tâm thì về cụm 0.\n\nSau đó chương trình đọc 2 dòng input(): chi tiêu và số lần mua của một khách MỚI (số nguyên), rồi gán khách đó vào cụm gần nhất.\n\nIn đúng 4 dòng:\nCum 0: tam (<x>, <y>), so khach <n>\nCum 1: tam (<x>, <y>), so khach <n>\nCum chi tieu cao nhat: cum <c>\nKhach moi thuoc: cum <c>\n\nToạ độ tâm làm tròn 2 chữ số. "Cụm chi tiêu cao nhất" là cụm có toạ độ x (chi tiêu) của tâm lớn hơn.',
    starterCode: `KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]\ntam = [KHACH[0], KHACH[-1]]\nfor _ in range(3):\n    nhom = [[], []]\n    # buoc GAN: moi khach ve tam gan nhat\n    # buoc CAP NHAT: tam moi = trung binh cac diem trong cum\n# in 2 dong tam, dong cum chi tieu cao nhat, roi doc khach moi tu input()\n`,
    testCases: [
      {
        stdinLines: ['2', '2'],
        expected: 'Cum 0: tam (1.75, 2.0), so khach 4\nCum 1: tam (21.5, 16.75), so khach 4\nCum chi tieu cao nhat: cum 1',
        match: 'contains',
        hidden: false,
        label: 'Hai tâm cụm hội tụ sau 3 vòng, mỗi cụm 4 khách',
      },
      {
        stdinLines: ['2', '2'],
        expected: 'Khach moi thuoc: cum 0',
        match: 'contains',
        hidden: false,
        label: 'Khách mới chi tiêu thấp → nhóm khách nhỏ',
      },
      {
        stdinLines: ['24', '19'],
        expected: 'Khach moi thuoc: cum 1',
        match: 'contains',
        hidden: false,
        label: 'Khách mới chi tiêu cao → nhóm VIP',
      },
      {
        stdinLines: ['10', '8'],
        expected: 'Khach moi thuoc: cum 0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: khách nằm giữa hai cụm, vẫn gần cụm 0 hơn',
      },
    ],
    hints: [
      'Biến nhom phải được TẠO LẠI ([[], []]) ở đầu MỖI vòng lặp. Quên bước này thì các điểm bị nhồi thêm mỗi vòng và số khách in ra sẽ gấp ba.',
      'Gán một dòng: nhom[0 if d0 <= d1 else 1].append(kh) — dùng <= để ca cách đều về cụm 0 đúng như đề yêu cầu.',
      'Cập nhật tâm: trung bình theo từng trục riêng. Kiểm if nhom[c] trước khi chia, phòng ca cụm rỗng (chia cho 0).',
      'Sau vòng lặp, biến nhom vẫn giữ kết quả lần gán cuối — dùng len(nhom[c]) để in số khách, không cần đếm lại.',
    ],
    sampleSolution: `KHACH = [(1, 2), (2, 3), (1, 1), (3, 2), (20, 15), (22, 18), (19, 14), (25, 20)]\ntam = [KHACH[0], KHACH[-1]]\n\nfor _ in range(3):\n    nhom = [[], []]\n    for kh in KHACH:\n        d0 = (kh[0] - tam[0][0]) ** 2 + (kh[1] - tam[0][1]) ** 2\n        d1 = (kh[0] - tam[1][0]) ** 2 + (kh[1] - tam[1][1]) ** 2\n        nhom[0 if d0 <= d1 else 1].append(kh)\n    for c in range(2):\n        if nhom[c]:\n            tam[c] = (sum(p[0] for p in nhom[c]) / len(nhom[c]),\n                      sum(p[1] for p in nhom[c]) / len(nhom[c]))\n\nfor c in range(2):\n    print(f"Cum {c}: tam ({round(tam[c][0], 2)}, {round(tam[c][1], 2)}), so khach {len(nhom[c])}")\ncao = 0 if tam[0][0] > tam[1][0] else 1\nprint(f"Cum chi tieu cao nhat: cum {cao}")\n\nchi_tieu = int(input("Chi tieu (trieu): "))\nso_lan = int(input("So lan mua: "))\nd0 = (chi_tieu - tam[0][0]) ** 2 + (so_lan - tam[0][1]) ** 2\nd1 = (chi_tieu - tam[1][0]) ** 2 + (so_lan - tam[1][1]) ** 2\nprint(f"Khach moi thuoc: cum {0 if d0 <= d1 else 1}")`,
  },
  homework:
    'Đặt tên nghiệp vụ cho hai cụm vừa tìm được, và với mỗi cụm viết MỘT hành động cụ thể bạn sẽ đề xuất với chủ cửa hàng (không phải "chăm sóc tốt hơn" — phải cụ thể tới mức làm được ngay tuần sau). Rồi thêm vào KHACH ba khách nằm lưng chừng, ví dụ (10, 8), (12, 9), (11, 7), chạy lại và xem hai tâm dịch đi bao nhiêu. Nhóm lưng chừng bị ép về một trong hai cụm — đó là lúc bạn nên cân nhắc k = 3.',
  srsCards: [
    {
      hoi: 'Hai bước lặp lại của k-means là gì?',
      dap: 'GÁN mỗi điểm về tâm gần nhất, rồi CẬP NHẬT tâm = trung bình các điểm trong cụm. Lặp cho tới khi không điểm nào đổi cụm.',
    },
    {
      hoi: 'Vì sao k-means thật có thể ra kết quả khác nhau giữa hai lần chạy?',
      dap: 'Vì tâm được khởi tạo ngẫu nhiên. sklearn khắc phục bằng n_init (chạy nhiều lần, giữ kết quả tốt nhất); bài học chốt cứng tâm khởi tạo để kết quả tất định, chấm được bằng test.',
    },
    {
      hoi: 'Sau khi có kết quả gom cụm thì việc còn lại của người phân tích là gì?',
      dap: 'Diễn giải: nhìn tâm và kích thước từng cụm, đặt tên bằng ngôn ngữ nghiệp vụ, và gắn cho mỗi cụm MỘT hành động cụ thể. Báo cáo dừng ở "có 2 cụm" là chưa làm xong việc.',
    },
    {
      hoi: 'Chọn số cụm k bằng cách nào?',
      dap: 'Elbow (vẽ tổng bình phương khoảng cách trong cụm theo k, lấy chỗ đường gãy khuỷu) hoặc silhouette. k là một quyết định, không phải hằng số cho sẵn.',
    },
  ],
}
```

### 3.4. `mlds-u2-l4` — Project 4: NLP lọc thư rác bằng Naive Bayes

```typescript
{
  id: 'mlds-u2-l4',
  unitId: 'mlds-u2',
  language: 'python',
  title: 'Project 4 — lọc thư rác bằng Naive Bayes trên bag-of-words',
  hook: 'Bài đầu tiên của khoá "Học máy" mở đầu bằng chính ví dụ này: viết 1.000 luật lọc thư rác là vô vọng. Bây giờ bạn đủ sức làm cách đúng — đưa máy 6 lá thư đã dán nhãn, để nó tự đếm xem chữ nào hay xuất hiện ở đâu, rồi tự quyết định.',
  theory:
    'Project 4 mở cánh cửa NLP (xử lý ngôn ngữ tự nhiên) và dùng lại Naive Bayes (ml-u4-l5), lần này trên văn bản thật.\n\nBAG-OF-WORDS (túi từ): biểu diễn một văn bản bằng tập các từ xuất hiện trong nó, VỨT BỎ thứ tự. "meo duoi chuot" và "chuot duoi meo" thành y hệt nhau. Nghe như mất mát nghiêm trọng — và đúng là mất — nhưng để lọc thư rác thì bấy nhiêu đã đủ tốt, vì tín hiệu nằm ở TỪ NÀO chứ không ở trật tự. (Muốn giữ trật tự thì cần n-gram, và xa hơn nữa là Transformer — bản đồ ở ml-u4-l3.)\n\nNAIVE BAYES cho văn bản. Với mỗi lớp c (spam / ham), tính điểm:\n  P(c) × tích các P(từ | c)\nChữ "naive" (ngây thơ) nằm ở chỗ ta giả định các từ ĐỘC LẬP với nhau — điều rõ ràng sai trong ngôn ngữ ("trúng" và "thưởng" luôn đi đôi). Giả định sai mà mô hình vẫn chạy tốt: đó là một trong những nghịch lý nổi tiếng và hữu ích nhất của ngành.\n\nHAI KỸ THUẬT BẮT BUỘC, thiếu là mô hình vỡ:\n\n1. LÀM TRƠN LAPLACE (add-one smoothing). Một từ chưa từng xuất hiện trong lớp spam sẽ có P = 0, mà 0 nhân với bất cứ gì cũng bằng 0 — MỘT từ lạ đủ giết cả tích số. Cách sửa: cộng 1 vào mọi bộ đếm.\n     P(từ | c) = (số lần từ xuất hiện trong c + 1) / (tổng số từ của c + |V|)\n   với |V| là kích thước TỪ ĐIỂN (số từ khác nhau trên toàn bộ dữ liệu huấn luyện). Cộng |V| vào mẫu số để tổng xác suất vẫn bằng 1.\n\n2. CỘNG LOG THAY VÌ NHÂN. Nhân 50 xác suất nhỏ với nhau cho ra số bé tới mức máy tính làm tròn thành 0 (underflow). Vì log là hàm TĂNG, so sánh log(A) với log(B) cho cùng kết luận như so sánh A với B, mà log biến tích thành tổng:\n     log P(c) + Σ log P(từ | c)\n   Đây là mẹo tiêu chuẩn, mọi thư viện thật đều làm thế.\n\nTIỀN XỬ LÝ VĂN BẢN thật còn nhiều bước ta bỏ qua ở đây cho gọn nhưng phải biết tên: hạ chữ thường, bỏ dấu câu, bỏ stopword (từ dừng như "và", "là"), tách từ tiếng Việt (khó hơn tiếng Anh nhiều vì từ ghép không có dấu cách phân định), và TF-IDF — cân lại trọng số để từ hiếm mà đặc trưng được coi trọng hơn từ đâu cũng có.\n\nTrong sklearn: CountVectorizer + MultinomialNB, hai dòng. Bạn đếm tay hôm nay để biết hai dòng đó đếm gì.',
  workedExample: {
    code: `import math

HUAN_LUYEN = [("trung thuong ngay hom nay", "spam"),
              ("nhan qua mien phi ngay", "spam"),
              ("hop luc ba gio chieu", "ham")]

dem = {"spam": {}, "ham": {}}     # lop -> tu -> so lan
tong = {"spam": 0, "ham": 0}      # tong so tu cua moi lop
so_thu = {"spam": 0, "ham": 0}    # so la thu cua moi lop
tu_dien = set()                   # tap tu khac nhau tren toan bo du lieu

for noi_dung, nhan in HUAN_LUYEN:
    so_thu[nhan] += 1
    for tu in noi_dung.split():
        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1
        tong[nhan] += 1
        tu_dien.add(tu)

v = len(tu_dien)
thu = "trung thuong ngay".split()
for nhan in ("spam", "ham"):
    d = math.log(so_thu[nhan] / len(HUAN_LUYEN))          # log cua xac suat tien nghiem
    for tu in thu:
        d += math.log((dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v))   # Laplace + log
    print(nhan, round(d, 2))`,
    stdinLines: [],
  },
  predict: {
    code: `dem_spam = {"trung": 2}\ntong_spam = 14\nv = 22\nprint((dem_spam.get("xin", 0) + 1) / (tong_spam + v))`,
    question: 'Từ "xin" chưa từng xuất hiện trong thư rác. Xác suất sau khi làm trơn Laplace là bao nhiêu?',
    choices: ['0.027777777777777776', '0.0', '1.0', 'Lỗi KeyError'],
    answerIndex: 0,
    explain:
      '(0 + 1) / (14 + 22) = 1/36 ≈ 0.0278. Không có Laplace thì con số này là 0, và vì ta NHÂN các xác suất, một số 0 duy nhất sẽ kéo cả tích về 0 — chỉ cần lá thư chứa một từ lạ là mô hình mất khả năng phán đoán. Cộng 1 vào tử và |V| vào mẫu giữ cho mọi từ có một phần xác suất nhỏ nhưng khác 0.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự huấn luyện Naive Bayes trên văn bản.',
    lines: [
      'for noi_dung, nhan in HUAN_LUYEN:',
      '    so_thu[nhan] += 1',
      '    for tu in noi_dung.split():',
      '        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1',
      '        tong[nhan] += 1',
      '        tu_dien.add(tu)',
      'v = len(tu_dien)',
    ],
  },
  make: {
    prompt:
      'Làm trọn project lọc thư rác. Tập huấn luyện 6 lá thư đã nhúng sẵn (3 spam, 3 thư thường), mỗi lá là một chuỗi từ cách nhau bởi dấu cách.\n\nChương trình đọc MỘT dòng input(): nội dung lá thư cần kiểm tra.\n\nHuấn luyện Naive Bayes bag-of-words với làm trơn Laplace (cộng 1 vào tử, cộng |V| vào mẫu, |V| = số từ khác nhau trên toàn bộ tập huấn luyện) và cộng LOG thay vì nhân. Điểm của một lớp = log P(lớp) + tổng log P(từ | lớp) trên mọi từ của lá thư.\n\nIn đúng 2 dòng:\nSo tu trong thu: <số từ>\nKet luan: SPAM  (nếu điểm spam LỚN HƠN điểm ham, ngược lại in "Ket luan: KHONG PHAI SPAM")',
    starterCode: `import math\n\nHUAN_LUYEN = [\n    ("trung thuong ngay hom nay", "spam"),\n    ("nhan qua mien phi ngay", "spam"),\n    ("trung thuong tien mat", "spam"),\n    ("hop luc ba gio chieu", "ham"),\n    ("gui bao cao hom nay", "ham"),\n    ("hen gap chieu mai", "ham"),\n]\n# Dem: dem[lop][tu], tong[lop], so_thu[lop], tu_dien\n# Doc thu tu input().split(), tinh diem log cho tung lop roi so sanh\n`,
    testCases: [
      {
        stdinLines: ['trung thuong tien mat'],
        expected: 'So tu trong thu: 4\nKet luan: SPAM',
        match: 'contains',
        hidden: false,
        label: 'Toàn từ đặc trưng của thư rác',
      },
      {
        stdinLines: ['gui bao cao chieu mai'],
        expected: 'So tu trong thu: 5\nKet luan: KHONG PHAI SPAM',
        match: 'contains',
        hidden: false,
        label: 'Toàn từ công việc → thư thường',
      },
      {
        stdinLines: ['nhan qua mien phi'],
        expected: 'Ket luan: SPAM',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: cụm từ quảng cáo chưa từng xuất hiện nguyên vẹn ở lớp ham',
      },
    ],
    hints: [
      'Ba bộ đếm phải xây trong MỘT vòng duyệt tập huấn luyện: dem[nhan][tu], tong[nhan] (tổng số từ), so_thu[nhan] (số lá thư). Thêm mọi từ vào tu_dien (một set) để lấy |V|.',
      '|V| là số từ khác nhau trên TOÀN BỘ dữ liệu (cả spam lẫn ham), không phải riêng từng lớp — dùng cùng một |V| cho cả hai mẫu số.',
      'Công thức Laplace: (dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v). Dùng .get(tu, 0) để từ lạ không gây KeyError.',
      'Cộng log: d = math.log(so_thu[nhan] / 6) rồi d += math.log(...) cho từng từ. Điểm sẽ là số ÂM — bình thường, vì log của số nhỏ hơn 1 luôn âm; ta chỉ so sánh hai số âm với nhau.',
    ],
    sampleSolution: `import math\n\nHUAN_LUYEN = [\n    ("trung thuong ngay hom nay", "spam"),\n    ("nhan qua mien phi ngay", "spam"),\n    ("trung thuong tien mat", "spam"),\n    ("hop luc ba gio chieu", "ham"),\n    ("gui bao cao hom nay", "ham"),\n    ("hen gap chieu mai", "ham"),\n]\n\ndem = {"spam": {}, "ham": {}}\ntong = {"spam": 0, "ham": 0}\nso_thu = {"spam": 0, "ham": 0}\ntu_dien = set()\nfor noi_dung, nhan in HUAN_LUYEN:\n    so_thu[nhan] += 1\n    for tu in noi_dung.split():\n        dem[nhan][tu] = dem[nhan].get(tu, 0) + 1\n        tong[nhan] += 1\n        tu_dien.add(tu)\nv = len(tu_dien)\n\nthu = input("Noi dung thu: ").split()\nprint(f"So tu trong thu: {len(thu)}")\n\ndiem = {}\nfor nhan in ("spam", "ham"):\n    d = math.log(so_thu[nhan] / len(HUAN_LUYEN))\n    for tu in thu:\n        d += math.log((dem[nhan].get(tu, 0) + 1) / (tong[nhan] + v))\n    diem[nhan] = d\nprint("Ket luan: " + ("SPAM" if diem["spam"] > diem["ham"] else "KHONG PHAI SPAM"))`,
  },
  homework:
    'Thu 20 tin nhắn thật trong máy bạn, tự dán nhãn rác/không rác, bỏ dấu tiếng Việt rồi thay vào HUAN_LUYEN. Sau đó thử ĐÁNH LỪA chính mô hình của mình: viết một tin nhắn rác mà nó phân loại nhầm thành thư thường (mẹo: pha thật nhiều từ công việc vào giữa). Bạn vừa tự tay làm một cuộc tấn công đối kháng (adversarial attack) — đúng thứ mà kẻ gửi rác làm hằng ngày với bộ lọc của Google.',
  srsCards: [
    {
      hoi: 'Bag-of-words biểu diễn văn bản thế nào và mất gì?',
      dap: 'Biểu diễn bằng tập các từ xuất hiện, VỨT BỎ thứ tự — "meo duoi chuot" và "chuot duoi meo" thành như nhau. Đủ tốt để lọc thư rác vì tín hiệu nằm ở từ nào, không ở trật tự.',
    },
    {
      hoi: 'Vì sao Naive Bayes bắt buộc phải làm trơn Laplace?',
      dap: 'Vì một từ chưa từng gặp trong lớp cho P = 0, mà 0 nhân với bất cứ gì cũng bằng 0 — một từ lạ giết cả tích số. Sửa bằng (đếm + 1) / (tổng + |V|).',
    },
    {
      hoi: 'Vì sao cộng LOG thay vì nhân xác suất?',
      dap: 'Nhân nhiều xác suất nhỏ gây underflow (máy làm tròn thành 0). Log là hàm tăng nên giữ nguyên thứ tự so sánh, và biến tích thành tổng.',
    },
    {
      hoi: 'Chữ "naive" trong Naive Bayes nghĩa là gì?',
      dap: 'Giả định các từ ĐỘC LẬP với nhau — rõ ràng sai trong ngôn ngữ ("trúng" và "thưởng" luôn đi đôi), nhưng mô hình vẫn chạy tốt trong thực tế.',
    },
  ],
}
```

### 3.5. `mlds-u3-l1` — Project 5: CV nhận chữ số trên ảnh 5×5 bằng k-NN pixel

```typescript
{
  id: 'mlds-u3-l1',
  unitId: 'mlds-u3',
  language: 'python',
  title: 'Project 5 — nhận chữ số trên ảnh 5×5 bằng k-NN pixel',
  hook: 'Máy tính không "nhìn thấy" chữ số 0. Nó thấy 25 con số 0 và 1 xếp thành lưới 5×5. Nếu bạn chấp nhận sự thật đó thì việc nhận dạng ảnh trở thành một phép đếm: lưới này khác lưới mẫu ở bao nhiêu ô?',
  theory:
    'Project 5 mở cánh cửa THỊ GIÁC MÁY TÍNH (computer vision) và là bài chuẩn bị trực tiếp cho khoá cv1.\n\nẢNH LÀ MA TRẬN SỐ. Ảnh xám 5×5 là 25 con số cường độ sáng (0–255). Bài này đơn giản hoá thành ảnh NHỊ PHÂN: mỗi ô chỉ 0 (nền) hoặc 1 (nét mực). Ảnh màu thì nhân ba (kênh R, G, B). Toàn bộ ngành thị giác máy tính đứng trên nhận thức này.\n\nĐẶC TRƯNG PIXEL THÔ (raw pixel features): coi thẳng 25 ô là 25 feature rồi ném vào k-NN. Cách thô sơ nhất mà vẫn chạy được — chính là baseline mà mọi bài báo phải vượt qua.\n\nKHOẢNG CÁCH HAMMING: với ảnh nhị phân, khoảng cách = số ô KHÁC NHAU giữa hai ảnh. Ở đây nó trùng với bình phương khoảng cách Euclid (vì (0−1)² = 1), nên hai cách đo cho cùng thứ tự — dùng cách nào cũng được, đếm ô khác nhau thì dễ hiểu hơn.\n\nk = 1 (nearest neighbor): lấy thẳng nhãn của mẫu gần nhất. Với 4 mẫu huấn luyện thì k = 1 là lựa chọn hợp lý; nó cũng làm kết quả tất định và dễ giải thích ("ảnh của bạn giống mẫu này nhất, lệch 1 ô").\n\nĐIỂM YẾU CHÍ TỬ của cách này — và chính là lý do CNN ra đời: k-NN pixel không chịu nổi DỊCH CHUYỂN. Lấy đúng ảnh số 1 rồi dịch sang phải một cột, mắt người vẫn thấy số 1, nhưng gần như MỌI ô đều đổi giá trị nên khoảng cách vọt lên rất lớn và mô hình đoán sai. Nó cũng không chịu được xoay, phóng to, hay đổi độ dày nét.\n\nCNN (mạng tích chập) giải quyết bằng bộ lọc TRƯỢT KHẮP ẢNH: cùng một bộ lọc dò cạnh được áp ở mọi vị trí, nên nét ngang được nhận ra dù nằm ở góc nào — tính chất gọi là bất biến tịnh tiến. Đó là nội dung chính của khoá cv1; hôm nay bạn cần cảm nhận được VÌ SAO cần tới nó, bằng cách tự tay chạm vào giới hạn của cách làm ngây thơ.',
  workedExample: {
    code: `# Anh nhi phan 5x5 = 5 chuoi 5 ky tu "0"/"1"; khoang cach = so o khac nhau
MAU = [(["11111", "10001", "10001", "10001", "11111"], 0),
       (["00100", "01100", "00100", "00100", "01110"], 1)]

anh = ["01110", "10001", "10001", "10001", "01110"]   # mot chu so 0 kieu khac

for mau, nhan in MAU:
    d = 0
    for r in range(5):            # duyet tung hang
        for c in range(5):        # duyet tung cot
            if mau[r][c] != anh[r][c]:
                d += 1            # dem o khac nhau (khoang cach Hamming)
    print(f"Giong mau chu so {nhan}? khoang cach {d}")`,
    stdinLines: [],
  },
  predict: {
    code: `a = ["00100", "00100"]\nb = ["01000", "00100"]\nd = 0\nfor r in range(2):\n    for c in range(5):\n        if a[r][c] != b[r][c]:\n            d += 1\nprint(d)`,
    question: 'Khoảng cách Hamming giữa hai lưới này là bao nhiêu?',
    choices: ['2', '1', '0', '10'],
    answerIndex: 0,
    explain:
      'Hàng 2 giống hệt nhau (0 ô khác). Hàng 1: nét mực dịch từ cột 2 sang cột 1, nên có HAI ô đổi — ô cũ từ 1 thành 0 và ô mới từ 0 thành 1. Đây chính là điểm yếu của k-NN pixel: dịch một pixel mà mắt người thấy là "cùng một hình" đã làm khoảng cách tăng gấp đôi số nét bị dịch.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tìm mẫu gần nhất (k-NN với k = 1) trên ảnh.',
    lines: [
      'tot_nhat = None',
      'for mau, nhan in MAU:',
      '    d = sum(1 for r in range(5) for c in range(5) if mau[r][c] != anh[r][c])',
      '    if tot_nhat is None or d < tot_nhat:',
      '        tot_nhat = d',
      '        nhan_tot = nhan',
      'print(nhan_tot, tot_nhat)',
    ],
  },
  make: {
    prompt:
      'Làm trọn project nhận chữ số. Bốn ảnh mẫu 5×5 đã nhúng sẵn: hai kiểu viết chữ số 0 và hai kiểu viết chữ số 1, mỗi ảnh là danh sách 5 chuỗi, mỗi chuỗi 5 ký tự "0"/"1".\n\nChương trình đọc 5 dòng input(), mỗi dòng 5 ký tự — đó là ảnh cần nhận dạng.\n\nDùng k-NN với k = 1, khoảng cách = số ô khác nhau (Hamming). Khi nhiều mẫu cùng khoảng cách nhỏ nhất thì lấy mẫu ĐỨNG TRƯỚC trong danh sách.\n\nIn đúng 1 dòng:\nDu doan: chu so <nhãn> (khoang cach <d>)',
    starterCode: `MAU = [\n    (["11111", "10001", "10001", "10001", "11111"], 0),\n    (["01110", "10001", "10001", "10001", "01110"], 0),\n    (["00100", "01100", "00100", "00100", "01110"], 1),\n    (["00100", "00100", "00100", "00100", "00100"], 1),\n]\nanh = [input() for _ in range(5)]\n# Voi tung mau: dem so o khac nhau, giu lai mau co khoang cach nho nhat\n`,
    testCases: [
      {
        stdinLines: ['01110', '10001', '10001', '10001', '01100'],
        expected: 'Du doan: chu so 0 (khoang cach 1)',
        match: 'contains',
        hidden: false,
        label: 'Chữ số 0 bị mờ mất 1 pixel ở hàng cuối',
      },
      {
        stdinLines: ['00100', '01100', '00100', '00100', '01110'],
        expected: 'Du doan: chu so 1 (khoang cach 0)',
        match: 'contains',
        hidden: false,
        label: 'Trùng khít một mẫu → khoảng cách 0',
      },
      {
        stdinLines: ['00100', '00100', '00100', '00100', '01110'],
        expected: 'Du doan: chu so 1 (khoang cach 1)',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: chữ số 1 thiếu nét chân, gần mẫu thứ ba nhất',
      },
    ],
    hints: [
      'Đọc ảnh: anh = [input() for _ in range(5)] — năm lần gọi input(), mỗi lần một hàng.',
      'Truy cập ô: mau[r][c] lấy ký tự cột c của hàng r. Chuỗi Python đánh chỉ số như list nên không cần tách gì thêm.',
      'So sánh KÝ TỰ với ký tự ("0" != "1"), đừng đổi sang int — không cần, và đổi nửa vời sẽ so chuỗi với số rồi luôn ra "khác nhau".',
      'Giữ mẫu tốt nhất bằng "d < tot_nhat" (dấu < chứ không phải <=) để ca hoà giữ được mẫu ĐỨNG TRƯỚC, đúng như đề yêu cầu.',
    ],
    sampleSolution: `MAU = [\n    (["11111", "10001", "10001", "10001", "11111"], 0),\n    (["01110", "10001", "10001", "10001", "01110"], 0),\n    (["00100", "01100", "00100", "00100", "01110"], 1),\n    (["00100", "00100", "00100", "00100", "00100"], 1),\n]\nanh = [input() for _ in range(5)]\n\ntot_nhat = None\nnhan_tot = None\nfor mau, nhan in MAU:\n    d = 0\n    for r in range(5):\n        for c in range(5):\n            if mau[r][c] != anh[r][c]:\n                d += 1\n    if tot_nhat is None or d < tot_nhat:\n        tot_nhat = d\n        nhan_tot = nhan\nprint(f"Du doan: chu so {nhan_tot} (khoang cach {tot_nhat})")`,
  },
  homework:
    'Lấy đúng ảnh mẫu chữ số 1 rồi DỊCH toàn bộ nét sang phải một cột, đưa vào chương trình. Ghi lại khoảng cách tới từng mẫu và xem mô hình có còn đoán đúng không. Rồi tự vẽ 5 ảnh 5×5 của riêng bạn (chữ thập, dấu trừ, hình vuông) và nghĩ xem cần thêm bao nhiêu mẫu để mô hình nhận được chúng. Con số bạn ước lượng chính là lý do bộ dữ liệu MNIST có 60.000 ảnh, và lý do CNN được phát minh.',
  srsCards: [
    {
      hoi: 'Máy tính "nhìn" một tấm ảnh dưới dạng gì?',
      dap: 'Một ma trận số. Ảnh xám là lưới cường độ sáng 0–255; ảnh màu là ba lưới (R, G, B). Ảnh nhị phân 5×5 trong bài là 25 số 0/1.',
    },
    {
      hoi: 'Khoảng cách Hamming giữa hai ảnh nhị phân là gì?',
      dap: 'Số ô có giá trị khác nhau giữa hai ảnh. Với ảnh 0/1 nó trùng với bình phương khoảng cách Euclid nên cho cùng thứ tự hàng xóm.',
    },
    {
      hoi: 'Điểm yếu chí tử của k-NN trên pixel thô là gì?',
      dap: 'Không chịu được dịch chuyển/xoay/phóng to: dịch một hình sang phải một cột làm gần như mọi ô đổi giá trị, khoảng cách vọt lên dù mắt người thấy vẫn là hình cũ.',
    },
    {
      hoi: 'CNN khắc phục điểm yếu đó bằng cách nào?',
      dap: 'Dùng bộ lọc TRƯỢT khắp ảnh — cùng một bộ lọc dò cạnh được áp ở mọi vị trí, nên đặc trưng được nhận ra dù nằm ở đâu (bất biến tịnh tiến).',
    },
  ],
}
```

### 3.6. `mlds-u3-l2` — Project 6: chuỗi thời gian (trung bình trượt, MAPE)

```typescript
{
  id: 'mlds-u3-l2',
  unitId: 'mlds-u3',
  language: 'python',
  title: 'Project 6 — dự báo doanh thu bằng trung bình trượt và đo bằng MAPE',
  hook: 'Doanh thu tháng này 165 triệu. Tháng sau bao nhiêu? Trước khi nghĩ tới bất kỳ mô hình nào, hãy trả lời bằng câu đơn giản nhất: "bằng tháng trước". Nghe ngớ ngẩn, nhưng dự báo naive đó là ĐỐI THỦ mà mọi mô hình phức tạp phải đánh bại — và rất nhiều mô hình đắt tiền đã thua nó.',
  theory:
    'Project 6 chạm vào loại dữ liệu mà THỨ TỰ chính là thông tin.\n\nCHUỖI THỜI GIAN (time series) khác mọi dữ liệu trước đó ở một điểm quyết định: các quan sát KHÔNG độc lập, và không được xáo trộn. Hệ quả trực tiếp lên cách chia train/test: bạn TUYỆT ĐỐI không được chia ngẫu nhiên. Train phải là quá khứ, test phải là tương lai — chia ngẫu nhiên nghĩa là dùng tháng 12 để dự báo tháng 6, tức rò rỉ dữ liệu ở dạng thô bạo nhất.\n\nBA THÀNH PHẦN của một chuỗi: XU HƯỚNG (trend — đi lên/xuống dài hạn), MÙA VỤ (seasonality — chu kỳ lặp: Tết, cuối tuần, giờ cao điểm), NHIỄU (noise — phần còn lại).\n\nTRUNG BÌNH TRƯỢT (moving average) cửa sổ k: mỗi điểm được thay bằng trung bình k điểm gần nhất. Tác dụng: LÀM MƯỢT — xoá bớt nhiễu để nhìn rõ xu hướng. Đánh đổi: k càng lớn càng mượt nhưng càng CHẬM phản ứng với thay đổi thật, và bạn mất k−1 điểm đầu chuỗi (chưa đủ dữ liệu để tính). Dự báo đơn giản nhất từ nó: điểm kế tiếp = trung bình k điểm cuối.\n\nHAI ĐƯỜNG CƠ SỞ (baseline) bắt buộc phải tính trước khi khoe mô hình:\n- NAIVE: dự báo tháng t = giá trị tháng t−1.\n- NAIVE THEO MÙA: dự báo tháng t = giá trị cùng kỳ chu kỳ trước (t−12 với dữ liệu tháng). Với dữ liệu có mùa vụ mạnh, baseline này rất khó đánh bại.\nLuật nghề: một mô hình không thắng nổi baseline là một mô hình chưa dùng được, dù nó phức tạp tới đâu.\n\nMAPE (Mean Absolute Percentage Error) = trung bình của |thật − dự báo| / |thật|, nhân 100 để ra phần trăm. Vì sao dùng nó thay MAE ở đây: doanh thu có thể là 100 triệu hay 100 tỉ, sai 10 triệu mang ý nghĩa hoàn toàn khác nhau ở hai quy mô; phần trăm so sánh được giữa các chuỗi khác quy mô. Nhược điểm phải nhớ: MAPE VỠ khi giá trị thật bằng 0 (chia cho 0) và phạt lệch-lên nặng hơn lệch-xuống.\n\nMô hình thật của ngành đi tiếp từ đây: ARIMA, ETS/Holt-Winters (làm mượt có mùa vụ), Prophet, và các mô hình học sâu cho chuỗi. Tất cả đều phải báo cáo kèm baseline naive.',
  workedExample: {
    code: `# Trung binh truot k=3 va MAPE cua du bao naive
DOANH_THU = [100, 110, 105, 120, 130, 125]
k = 3

truot = []
for i in range(k - 1, len(DOANH_THU)):        # bat dau tu diem thu k
    cua_so = DOANH_THU[i - k + 1 : i + 1]      # k diem gan nhat, ke ca diem hien tai
    truot.append(round(sum(cua_so) / k, 2))
print("Trung binh truot:", truot)
print("Du bao ky sau:", truot[-1])             # trung binh k ky cuoi

tong_sai = 0.0
for t in range(1, len(DOANH_THU)):             # naive: du bao ky t = gia tri ky t-1
    tong_sai += abs(DOANH_THU[t] - DOANH_THU[t - 1]) / DOANH_THU[t]
mape = tong_sai / (len(DOANH_THU) - 1) * 100   # chia cho SO LAN du bao, khong phai do dai chuoi
print(f"MAPE naive: {round(mape, 2)}%")`,
    stdinLines: [],
  },
  predict: {
    code: `chuoi = [10, 20, 30, 40]\nk = 2\ntruot = []\nfor i in range(k - 1, len(chuoi)):\n    truot.append(sum(chuoi[i - k + 1 : i + 1]) / k)\nprint(len(truot), truot[0])`,
    question: 'Chuỗi 4 điểm với cửa sổ k = 2 cho bao nhiêu giá trị trượt, và giá trị đầu là gì?',
    choices: ['3 15.0', '4 10.0', '3 20.0', '2 15.0'],
    answerIndex: 0,
    explain:
      'Vòng lặp chạy từ i = 1 tới i = 3 nên có 3 giá trị; giá trị đầu là (10 + 20) / 2 = 15.0. Quy tắc chung: cửa sổ k trên chuỗi n điểm cho n − k + 1 giá trị — bạn LUÔN mất k − 1 điểm đầu vì chưa đủ dữ liệu để lấp đầy cửa sổ.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính trung bình trượt rồi dự báo kỳ kế tiếp.',
    lines: [
      'truot = []',
      'for i in range(k - 1, len(DOANH_THU)):',
      '    cua_so = DOANH_THU[i - k + 1 : i + 1]',
      '    truot.append(round(sum(cua_so) / k, 2))',
      'du_bao = truot[-1]',
      'print(du_bao)',
    ],
  },
  make: {
    prompt:
      'Làm trọn project dự báo doanh thu. Chuỗi 12 tháng đã nhúng sẵn trong starterCode.\n\nChương trình đọc MỘT dòng input(): cửa sổ k (số nguyên ≥ 1).\n\nIn đúng 3 dòng:\nTrung binh truot k=<k>: <các giá trị cách nhau bởi dấu cách>\nDu bao thang 13: <giá trị trượt cuối cùng>\nMAPE du bao naive: <x>%\n\nQuy tắc:\n- Trung bình trượt cửa sổ k, mỗi giá trị làm tròn 2 chữ số; chuỗi 12 điểm cho 12 − k + 1 giá trị.\n- Dự báo tháng 13 = giá trị trượt cuối cùng.\n- MAPE của dự báo NAIVE (dự báo tháng t = giá trị tháng t−1), tính trên 11 lần dự báo, công thức trung bình của |thật − dự báo| / thật, nhân 100, làm tròn 2 chữ số.\n\nVí dụ k = 3 → dự báo tháng 13 là 165.0 và MAPE 7.01%.',
    starterCode: `DOANH_THU = [100, 110, 105, 120, 130, 125, 140, 150, 145, 160, 170, 165]\nk = int(input("Cua so k: "))\ntruot = []\n# Tinh trung binh truot cua so k (nho lam tron 2 chu so moi gia tri)\n# In chuoi truot, du bao thang 13, roi MAPE cua du bao naive\n`,
    testCases: [
      {
        stdinLines: ['3'],
        expected: 'Trung binh truot k=3: 105.0 111.67 118.33 125.0 131.67 138.33 145.0 151.67 158.33 165.0\nDu bao thang 13: 165.0\nMAPE du bao naive: 7.01%',
        match: 'contains',
        hidden: false,
        label: 'Cửa sổ 3 → 10 giá trị trượt, dự báo 165.0',
      },
      {
        stdinLines: ['4'],
        expected: 'Du bao thang 13: 160.0',
        match: 'contains',
        hidden: false,
        label: 'Cửa sổ rộng hơn → dự báo bị kéo về quá khứ nhiều hơn',
      },
      {
        stdinLines: ['2'],
        expected: 'Du bao thang 13: 167.5',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: cửa sổ hẹp bám sát dữ liệu mới nhất',
      },
    ],
    hints: [
      'Vòng lặp bắt đầu từ i = k − 1, không phải 0 — trước đó chưa đủ k điểm để lấp đầy cửa sổ.',
      'Cắt cửa sổ: DOANH_THU[i - k + 1 : i + 1] — nhớ Python cắt tới trước chỉ số cuối, nên phải viết i + 1 mới lấy được điểm thứ i.',
      'Nối chuỗi kết quả: " ".join(str(x) for x in truot). Vì bạn đã round() từng giá trị khi thêm vào list, str() sẽ in đúng dạng 111.67 và 105.0.',
      'MAPE chia cho SỐ LẦN dự báo (len − 1 = 11), không phải cho độ dài chuỗi (12). Mẫu số của mỗi số hạng là giá trị THẬT của tháng t, không phải tháng t−1.',
    ],
    sampleSolution: `DOANH_THU = [100, 110, 105, 120, 130, 125, 140, 150, 145, 160, 170, 165]\nk = int(input("Cua so k: "))\n\ntruot = []\nfor i in range(k - 1, len(DOANH_THU)):\n    cua_so = DOANH_THU[i - k + 1 : i + 1]\n    truot.append(round(sum(cua_so) / k, 2))\nprint(f"Trung binh truot k={k}: " + " ".join(str(x) for x in truot))\nprint(f"Du bao thang 13: {truot[-1]}")\n\ntong_sai = 0.0\nfor t in range(1, len(DOANH_THU)):\n    tong_sai += abs(DOANH_THU[t] - DOANH_THU[t - 1]) / DOANH_THU[t]\nmape = tong_sai / (len(DOANH_THU) - 1) * 100\nprint(f"MAPE du bao naive: {round(mape, 2)}%")`,
  },
  homework:
    'Chạy chương trình với k = 2, 3, 4, 6 và ghi lại bốn con số dự báo tháng 13. Chúng khác nhau — hãy giải thích vì sao k lớn lại cho dự báo THẤP hơn với chuỗi đang đi lên. Rồi lấy doanh thu (hoặc số bước chân, số giờ học) 12 kỳ thật của bạn, tính MAPE naive và trả lời: chuỗi của bạn dễ hay khó dự báo? MAPE naive dưới 5% nghĩa là chuỗi rất ổn định; trên 30% nghĩa là đừng tin bất kỳ dự báo nào cho tới khi tìm được thêm biến giải thích.',
  srsCards: [
    {
      hoi: 'Vì sao không được chia train/test NGẪU NHIÊN với chuỗi thời gian?',
      dap: 'Vì thứ tự là thông tin và các quan sát không độc lập. Chia ngẫu nhiên nghĩa là dùng tương lai để dự báo quá khứ — rò rỉ dữ liệu ở dạng thô bạo nhất. Train phải là quá khứ, test là tương lai.',
    },
    {
      hoi: 'Trung bình trượt cửa sổ k đánh đổi điều gì?',
      dap: 'k lớn → mượt hơn, ít nhiễu hơn, nhưng CHẬM phản ứng với thay đổi thật và mất k − 1 điểm đầu chuỗi.',
    },
    {
      hoi: 'Hai baseline bắt buộc phải tính cho bài dự báo là gì?',
      dap: 'Naive (dự báo kỳ t = giá trị kỳ t−1) và naive theo mùa (= giá trị cùng kỳ chu kỳ trước). Mô hình không thắng nổi baseline là mô hình chưa dùng được.',
    },
    {
      hoi: 'MAPE là gì và nhược điểm của nó?',
      dap: 'Trung bình của |thật − dự báo| / |thật| × 100, so sánh được giữa các chuỗi khác quy mô. Nhược: vỡ khi giá trị thật bằng 0, và phạt lệch-lên nặng hơn lệch-xuống.',
    },
  ],
}
```

### 3.7. `mlds-u3-l3` — Project 7: hệ gợi ý bằng lọc cộng tác + tổng kết khoá

```typescript
{
  id: 'mlds-u3-l3',
  unitId: 'mlds-u3',
  language: 'python',
  title: 'Project 7 — "người giống bạn cũng thích" và tổng kết khoá',
  hook: 'Netflix không hiểu bộ phim bạn vừa xem nói về cái gì. Nó chỉ biết một điều: có 4.000 người chấm điểm giống hệt bạn, và 3.900 người trong số đó đã xem tiếp bộ này. Lọc cộng tác là thuật toán kiếm ra nhiều tiền bậc nhất ngành, và ruột của nó là một phép đo góc giữa hai vector.',
  theory:
    'Project cuối: hệ gợi ý, rồi tổng kết cả khoá.\n\nHAI TRƯỜNG PHÁI GỢI Ý:\n- Content-based: gợi ý thứ GIỐNG món bạn đã thích (cùng thể loại, cùng đạo diễn). Cần mô tả nội dung.\n- Collaborative filtering (LỌC CỘNG TÁC): gợi ý thứ mà NGƯỜI GIỐNG BẠN đã thích. Không cần biết gì về nội dung món hàng — chỉ cần ma trận đánh giá. Đây là thứ ta cài hôm nay.\n\nMA TRẬN ĐÁNH GIÁ: hàng là người, cột là phim, ô là điểm chấm; 0 nghĩa là CHƯA XEM (không phải "chấm 0 điểm" — hai thứ khác hẳn nhau và lẫn lộn chúng là lỗi thiết kế kinh điển). Ma trận thật THƯA khủng khiếp: mỗi người chỉ xem vài chục trong hàng triệu món.\n\nCOSINE SIMILARITY đo GÓC giữa hai vector đánh giá:\n  cos(u, v) = (u · v) / (|u| × |v|)\nBằng 1 khi hai người cùng hướng sở thích, bằng 0 khi không liên quan. Vì sao dùng cosine chứ không phải khoảng cách Euclid: cosine bỏ qua ĐỘ LỚN. Người hào phóng chấm toàn 4–5 và người khó tính chấm toàn 1–2 nhưng cùng thứ tự ưu tiên sẽ có cosine rất cao, dù khoảng cách Euclid giữa họ rất xa. Ta muốn bắt GU, không phải bắt thói quen chấm điểm.\n\nQUY TRÌNH user-based, đúng bốn bước:\n1. Tính cosine giữa người cần gợi ý và mọi người khác.\n2. Lấy N người giống nhất (ở đây N = 2).\n3. Với mỗi món người đó CHƯA xem: điểm = tổng (cosine × điểm người hàng xóm chấm). Nhân với cosine để hàng xóm giống hơn có tiếng nói nặng hơn.\n4. Gợi ý món điểm cao nhất.\n\nHAI VẤN ĐỀ CỦA NGÀNH phải biết tên: KHỞI ĐẦU LẠNH (cold start) — người mới chưa chấm gì thì không có hàng xóm, phải chữa bằng gợi ý phổ biến hoặc hỏi vài câu lúc đăng ký. VÒNG PHẢN HỒI (filter bubble) — hệ chỉ gợi ý thứ giống cái đã xem, dần bịt kín tầm nhìn người dùng; các hệ tốt cố ý chèn thêm yếu tố đa dạng. Đây là quyết định đạo đức, không phải quyết định kỹ thuật.\n\n=== TỔNG KẾT KHOÁ mlds ===\nBạn đã đi trọn một vòng nghề dữ liệu: LÀM SẠCH (thiếu/trùng/ngoại lai) → KHÁM PHÁ (group-by) → TẠO ĐẶC TRƯNG (one-hot, binning, chuẩn hoá, chống rò rỉ) → ĐÁNH GIÁ ĐÚNG (precision/recall/F1) → BẢY PROJECT phủ hồi quy, phân loại, gom cụm, văn bản, ảnh, chuỗi thời gian, hệ gợi ý.\n\nBa điều đáng mang theo hơn cả code:\n1. Chất lượng DỮ LIỆU quyết định nhiều hơn lựa chọn thuật toán.\n2. Mọi con số phải đi kèm cách đo và đường cơ sở để so.\n3. Mô hình học từ quá khứ nên nó kế thừa cả thiên kiến của quá khứ.\n\nLỐI ĐI TIẾP: khoá cv1 (deep learning cho thị giác — bạn đã chạm giới hạn của k-NN pixel ở project 5), khoá llmagent (LLM và tác tử — nối tiếp bag-of-words của project 4), hoặc hướng chuyên sâu `data` / `ai` để đi theo bản đồ nghề dài hạn.',
  workedExample: {
    code: `import math
DANH_GIA = {"an": [5, 4, 0, 1, 0],       # 0 = CHUA XEM, khong phai cham 0 diem
            "binh": [4, 5, 3, 1, 0],
            "chi": [1, 0, 4, 5, 4]}

def cosine(u, v):
    tich = sum(u[i] * v[i] for i in range(len(u)))          # tich vo huong
    do_dai_u = math.sqrt(sum(x * x for x in u))             # do dai vector u
    do_dai_v = math.sqrt(sum(x * x for x in v))
    if do_dai_u == 0 or do_dai_v == 0:
        return 0.0                                          # nguoi chua cham gi
    return tich / (do_dai_u * do_dai_v)

print("an vs binh:", round(cosine(DANH_GIA["an"], DANH_GIA["binh"]), 2))
print("an vs chi:", round(cosine(DANH_GIA["an"], DANH_GIA["chi"]), 2))`,
    stdinLines: [],
  },
  predict: {
    code: `import math\nu = [1, 2, 3]\nv = [2, 4, 6]\ntich = sum(u[i] * v[i] for i in range(3))\nprint(round(tich / (math.sqrt(14) * math.sqrt(56)), 2))`,
    question: 'Hai người có gu y hệt nhau nhưng một người chấm điểm gấp đôi. Cosine bằng bao nhiêu?',
    choices: ['1.0', '0.5', '2.0', '0.0'],
    answerIndex: 0,
    explain:
      'v = 2u nên hai vector cùng HƯỚNG, góc bằng 0 và cosine bằng 1.0 — đúng điều ta muốn: hai người cùng gu, chỉ khác thói quen chấm điểm rộng tay. Khoảng cách Euclid giữa hai vector này lại khá lớn, nên nếu dùng Euclid ta sẽ kết luận sai rằng họ không giống nhau.',
  },
  parsons: {
    prompt: 'Xếp đúng bốn bước lọc cộng tác user-based.',
    lines: [
      'hang_xom = [(cosine(toi, vec), nguoi) for nguoi, vec in DANH_GIA.items() if nguoi != ten]',
      'hang_xom.sort(reverse=True)',
      'top2 = hang_xom[:2]',
      'diem = {PHIM[i]: sum(c * DANH_GIA[n][i] for c, n in top2) for i in range(len(PHIM)) if toi[i] == 0}',
      'tot = max(diem, key=lambda p: diem[p])',
    ],
  },
  make: {
    prompt:
      'Làm trọn project hệ gợi ý phim. Ma trận đánh giá 4 người × 5 phim đã nhúng sẵn, điểm 1–5 và 0 nghĩa là chưa xem.\n\nChương trình đọc MỘT dòng input(): tên người cần gợi ý ("an", "binh", "chi" hoặc "dung").\n\nQuy trình: tính cosine giữa người đó và 3 người còn lại → lấy 2 người giống nhất → với mỗi phim người đó CHƯA xem, điểm gợi ý = tổng (cosine × điểm mà hàng xóm đó chấm) → chọn phim điểm cao nhất.\n\nIn đúng 2 dòng:\nNguoi giong nhat: <tên> (cosine <x>)\nGoi y cho <tên>: <tên phim> (diem <y>)\n\nCả hai con số làm tròn 2 chữ số.',
    starterCode: `import math\n\nPHIM = ["Bo Gia", "Mat Biec", "Rom", "De Men", "Trang Ti"]\nDANH_GIA = {\n    "an": [5, 4, 0, 1, 0],\n    "binh": [4, 5, 3, 1, 0],\n    "chi": [1, 0, 4, 5, 4],\n    "dung": [0, 1, 5, 4, 5],\n}\n# Viet ham cosine(u, v), tinh do giong voi 3 nguoi con lai\n# Lay 2 nguoi giong nhat, cham diem cac phim CHUA xem (o bang 0), chon phim cao nhat\n`,
    testCases: [
      {
        stdinLines: ['an'],
        expected: 'Nguoi giong nhat: binh (cosine 0.89)\nGoi y cho an: Rom (diem 3.47)',
        match: 'contains',
        hidden: false,
        label: 'An giống Binh nhất; phim Rom được Binh chấm 3 điểm',
      },
      {
        stdinLines: ['chi'],
        expected: 'Goi y cho chi: Mat Biec (diem 2.89)',
        match: 'contains',
        hidden: false,
        label: 'Chi chỉ còn đúng một phim chưa xem',
      },
      {
        stdinLines: ['dung'],
        expected: 'Goi y cho dung: Bo Gia (diem 2.6)',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: hàng xóm giống nhất chấm phim đó thấp, người kia chấm cao',
      },
    ],
    hints: [
      'Hàm cosine cần ba đại lượng: tích vô hướng, độ dài u, độ dài v. Nhớ nhánh trả về 0.0 khi một vector toàn 0, nếu không sẽ chia cho 0.',
      'Xây danh sách hàng xóm dạng (cosine, tên) rồi hang_xom.sort(reverse=True) — Python sắp xếp theo phần tử đầu nên tự động ra giảm dần theo độ giống.',
      'Chỉ chấm điểm những phim mà toi[i] == 0 (chưa xem). Gợi ý một phim người ta đã xem là lỗi nghiệp vụ, dù điểm có cao tới đâu.',
      'Chọn phim tốt nhất: max(diem, key=lambda p: diem[p]) — max trên dict duyệt các KHOÁ, tham số key nói cho nó so sánh bằng giá trị nào.',
    ],
    sampleSolution: `import math\n\nPHIM = ["Bo Gia", "Mat Biec", "Rom", "De Men", "Trang Ti"]\nDANH_GIA = {\n    "an": [5, 4, 0, 1, 0],\n    "binh": [4, 5, 3, 1, 0],\n    "chi": [1, 0, 4, 5, 4],\n    "dung": [0, 1, 5, 4, 5],\n}\n\n\ndef cosine(u, v):\n    tich = sum(u[i] * v[i] for i in range(len(u)))\n    do_dai_u = math.sqrt(sum(x * x for x in u))\n    do_dai_v = math.sqrt(sum(x * x for x in v))\n    if do_dai_u == 0 or do_dai_v == 0:\n        return 0.0\n    return tich / (do_dai_u * do_dai_v)\n\n\nten = input("Ban la ai: ").strip()\ntoi = DANH_GIA[ten]\n\nhang_xom = []\nfor nguoi, vec in DANH_GIA.items():\n    if nguoi != ten:\n        hang_xom.append((cosine(toi, vec), nguoi))\nhang_xom.sort(reverse=True)\nprint(f"Nguoi giong nhat: {hang_xom[0][1]} (cosine {round(hang_xom[0][0], 2)})")\n\ntop2 = hang_xom[:2]\ndiem = {}\nfor i in range(len(PHIM)):\n    if toi[i] == 0:\n        s = 0.0\n        for cos_val, nguoi in top2:\n            s += cos_val * DANH_GIA[nguoi][i]\n        diem[PHIM[i]] = s\ntot = max(diem, key=lambda p: diem[p])\nprint(f"Goi y cho {ten}: {tot} (diem {round(diem[tot], 2)})")`,
  },
  homework:
    'Hai việc chốt khoá. (1) Thêm một người thứ năm chưa chấm phim nào (toàn số 0) rồi chạy chương trình cho người đó — bạn sẽ tự tay chạm vào bài toán khởi đầu lạnh; viết ra cách bạn sẽ chữa. (2) Nhìn lại 7 project và chọn MỘT cái bạn muốn làm nghiêm túc với dữ liệu thật của mình, rồi viết nửa trang: câu hỏi cần trả lời, dữ liệu lấy ở đâu, feature nào (đã rà rò rỉ chưa), thước đo nào và baseline là gì. Nửa trang đó chính là bản đặc tả một dự án dữ liệu — thứ mà người đi làm viết trước khi gõ dòng code đầu tiên.',
  srsCards: [
    {
      hoi: 'Lọc cộng tác khác gợi ý theo nội dung ở chỗ nào?',
      dap: 'Content-based gợi ý thứ GIỐNG món bạn đã thích (cần mô tả nội dung). Lọc cộng tác gợi ý thứ mà NGƯỜI GIỐNG BẠN đã thích — chỉ cần ma trận đánh giá, không cần biết gì về món hàng.',
    },
    {
      hoi: 'Vì sao dùng cosine chứ không phải khoảng cách Euclid để đo độ giống người dùng?',
      dap: 'Cosine đo GÓC nên bỏ qua độ lớn: người chấm rộng tay (toàn 4–5) và người khó tính (toàn 1–2) cùng gu vẫn có cosine cao. Ta muốn bắt gu, không bắt thói quen chấm điểm.',
    },
    {
      hoi: 'Trong ma trận đánh giá, số 0 nghĩa là gì?',
      dap: 'CHƯA XEM, không phải "chấm 0 điểm". Lẫn lộn hai thứ này là lỗi thiết kế kinh điển — nó biến sự vắng mặt của dữ liệu thành một đánh giá tiêu cực.',
    },
    {
      hoi: 'Hai vấn đề kinh điển của hệ gợi ý là gì?',
      dap: 'Khởi đầu lạnh (người/món mới chưa có dữ liệu để tìm hàng xóm) và vòng phản hồi/bong bóng lọc (chỉ gợi ý thứ giống cái đã xem, bịt kín tầm nhìn người dùng).',
    },
  ],
}
```

## 4. File `packages/subject-programming/courses/mlds.ts` (hoàn chỉnh, copy-paste)

```typescript
// courses/mlds.ts — Khoá ngắn "Machine Learning & Data Science", khoá 03 của cụm 6 khoá
// "Kỹ sư AI thực chiến" (docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md §03c; nội dung bài
// soạn đầy đủ ở docs/specs/2026-09-01-mlds-bai-hoc-chi-tiet.md).
//
// Luật số 1 của tầng khoá ngắn được áp ở đây một cách rõ rệt nhất trong toàn dự án: hai chương
// đầu THAM CHIẾU nguyên 10 bài của khoá `ml` bằng lessonIds, không nhúng và không sao chép.
// Sửa nội dung bản đồ ML thì sửa ở lessons/mlu1.ts + mlu2.ts, khoá này tự hưởng theo.
import type { ShortCourse } from './types.js'

export const MLDS_COURSE: ShortCourse = {
  id: 'mlds',
  title: 'Machine Learning & Data Science',
  canDo:
    'Đi trọn pipeline dữ liệu thật: làm sạch → khám phá → tạo đặc trưng → train và đánh giá mô hình, rồi làm 7 project nhỏ phủ hồi quy, phân loại, gom cụm, NLP, ảnh, chuỗi thời gian và hệ gợi ý — tự cài lõi bằng Python thuần, đọc được code sklearn tương ứng. Biết chọn thước đo theo cái giá của lỗi và nhận ra rò rỉ dữ liệu trước khi nó phá hỏng kết quả.',
  duration: '5–7 tuần, mỗi bài một buổi ngắn',
  prerequisites: ['Khoá Toán Thiết Yếu cho AI (mathai)', 'Khoá Python / AI Cơ Bản (pyai)'],
  chapters: [
    {
      id: 'mlds-c1',
      title: 'Bản đồ ML & học có giám sát',
      summary:
        'Dùng lại nền của khoá "Học máy": học máy khác luật viết tay ra sao, tự cài hồi quy tuyến tính và k-NN, chia train/test đo accuracy đúng cách, nhận diện overfitting.',
      lessonIds: ['ml-u1-l1', 'ml-u1-l2', 'ml-u1-l3', 'ml-u1-l4', 'ml-u1-l5'],
    },
    {
      id: 'mlds-c2',
      title: 'Học không giám sát',
      summary:
        'Cũng từ khoá "Học máy": k-means gom cụm khách hàng, chuẩn hoá trước khi đo khoảng cách, trực giác giảm chiều và luật kết hợp, DBSCAN cho cụm hình dạng bất kỳ.',
      lessonIds: ['ml-u2-l1', 'ml-u2-l2', 'ml-u2-l3', 'ml-u2-l4', 'ml-u2-l5'],
    },
    {
      id: 'mlds-c3',
      title: 'Data Science thực chiến',
      summary:
        'Bốn kỹ năng mà dữ liệu thật đòi hỏi nhưng dữ liệu bài tập không dạy: làm sạch (thiếu, trùng, ngoại lai bằng IQR), khám phá bằng group-by, tạo đặc trưng và chống rò rỉ dữ liệu, đánh giá bằng precision/recall/F1 thay vì accuracy.',
      lessonIds: ['mlds-u1-l1', 'mlds-u1-l2', 'mlds-u1-l3', 'mlds-u1-l4'],
    },
    {
      id: 'mlds-c4',
      title: 'Bảy project nhỏ',
      summary:
        'Bốn project trên dữ liệu bảng và văn bản (giá nhà, duyệt khoản vay, phân cụm khách hàng, lọc thư rác Naive Bayes) rồi ba project trên dữ liệu có cấu trúc riêng (ảnh 5×5, chuỗi thời gian, hệ gợi ý) — mỗi bài một project trọn gói, dữ liệu nhúng sẵn.',
      lessonIds: [
        'mlds-u2-l1',
        'mlds-u2-l2',
        'mlds-u2-l3',
        'mlds-u2-l4',
        'mlds-u3-l1',
        'mlds-u3-l2',
        'mlds-u3-l3',
      ],
    },
  ],
}
```

> Ghi chú thi hành: chương C4 gộp cả hai unit `mlds-u2` và `mlds-u3` vào MỘT chương (7 bài) vì
> `CourseChapter.lessonIds` cho phép trộn id thuộc nhiều unit. Việc chia thành hai unit ở tầng
> BÀI là để tách file nguồn và nhóm theo dạng dữ liệu (§3.0), không bắt buộc phải phản ánh thành
> hai chương ở tầng khoá.

## 4.1. Bẫy đã dính khi soạn — đọc trước khi sửa test-case

`gradeTestCase()` (`packages/subject-programming/grading.ts`) so bằng `actual.includes(expected)`
trên output THÔ, chỉ chuẩn hoá khoảng trắng cuối dòng. Mà `input("Loi nhac: ")` in lời nhắc ra
**cùng dòng** với dòng kế tiếp. Hệ quả: một `expected` nhiều dòng sẽ TRƯỢT nếu có lời gọi
`input()` xen vào giữa các dòng đó — dù chương trình chạy hoàn toàn đúng.

Luật rút ra, áp cho mọi bài về sau: **một `expected` nhiều dòng chỉ được phủ các dòng in ra
LIÊN TIẾP mà không có `input()` nào ở giữa.** Cần khẳng định thêm một dòng nằm sau lời gọi
`input()` thì tách thành một test-case riêng với cùng `stdinLines`. Bài `mlds-u2-l2` và
`mlds-u2-l3` đã bị lỗi này lúc soạn và đã được tách (nên chúng có 4 test-case).

Mọi `sampleSolution` trong đặc tả này đã được chạy thật bằng `python3` với đúng `stdinLines`
của từng test-case, và output khớp `expected` theo đúng luật `includes` ở trên.

## 5. Nghiệm thu

| Tiêu chí                                                                              | Cách kiểm                                            |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 11 bài mới hợp `LessonSchema` (testCases 1–10, srsCards 2–4, answerIndex hợp lệ…)      | `npm test -- lessons`                                 |
| Mọi `sampleSolution` chạy đúng MỌI `testCases` bằng python3 thật                       | `npm test -- lessonsPython`                            |
| 10 `lessonIds` tham chiếu của C1/C2 tra ra được bằng `getLesson()`                      | `npm test -- courses`                                  |
| Không có bài nào của `ml` bị sửa                                                        | `git diff --stat -- packages/subject-programming/lessons/mlu*.ts` phải RỖNG |
| Không dùng numpy/sklearn/pandas trong code được chấm                                    | `grep -n "import numpy\|sklearn\|pandas" packages/subject-programming/lessons/mldsu*.ts` phải rỗng |
| Mọi `print()` không dấu tiếng Việt                                                      | Tự đọc lại diff                                        |
| Cổng dự án                                                                              | `npm run build` · `typecheck` · `lint` · `test`        |
