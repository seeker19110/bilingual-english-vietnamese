# Đặc tả KÍN — 13 bài học khoá `mathai` ("Toán Thiết Yếu cho AI")

Khoá ngắn `mathai` là khoá 02 của cụm "Kỹ sư AI thực chiến"
(`docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` §03b). Khoá có **13 bài** chia 3 chương:

| Chương     | unitId      | Số bài | Nội dung                                                         | File đích              |
| ---------- | ----------- | ------ | ---------------------------------------------------------------- | ---------------------- |
| C1         | `mathai-u1` | 5      | Xác suất & thống kê                                               | `lessons/mathaiu1.ts`  |
| C2         | `mathai-u2` | 4      | Đại số tuyến tính                                                 | `lessons/mathaiu2.ts`  |
| C3         | `mathai-u3` | 4      | Giải tích & tối ưu hoá                                            | `lessons/mathaiu3.ts`  |

**Người thi hành chỉ copy-paste** các object dưới đây vào mảng
`MATHAI_U1_LESSONS` / `MATHAI_U2_LESSONS` / `MATHAI_U3_LESSONS` (kiểu `ProgrammingLesson[]`)
trong 3 file trên — không còn quyết định nào phải tự chọn.

**Điều kiện tiên quyết kỹ thuật (làm TRƯỚC khi thêm bài):** nới regex `lessonId` để nhận tiền
tố `mathai` ở đúng 4 chỗ đã biết — `packages/subject-programming/lessonTypes.ts` (`id` và
`unitId`), `apps/server/src/api/subjects/programming/progress.ts`,
`apps/server/src/api/subjects/programming/feedback.ts`. Chưa nới thì Zod loại toàn bộ 13 bài.

**Luật soạn đã áp cho cả 13 bài:** `language: 'python'` · KHÔNG numpy (ma trận = list lồng
nhau + vòng lặp thuần) · mọi `print()` tiếng Việt KHÔNG DẤU · mô phỏng ngẫu nhiên được làm
TẤT ĐỊNH (dãy cho sẵn qua `input()`, không dùng `random`) · gradient descent chạy đúng 20
bước với learning rate cho qua `input()` và in kết quả `round(..., 4)`.

---

## C1 — Xác suất & thống kê (`mathai-u1`, 5 bài)

### Bài 1 — `mathai-u1-l1`

```typescript
{
  id: 'mathai-u1-l1',
  unitId: 'mathai-u1',
  language: 'python',
  title: 'Xác suất từ đếm — tung xu 10.000 lần thì thấy gì',
  hook: 'Tung một đồng xu 4 lần được 3 mặt ngửa — xu bị lỗi chăng? Tung 10.000 lần thì tần suất ngửa bò dần về 0,5 và nằm lì ở đó. Xác suất không phải phép màu: nó là con số mà TẦN SUẤT ĐẾM ĐƯỢC tiến về khi số lần thử đủ lớn.',
  theory:
    'XÁC SUẤT của một biến cố = phần trăm số lần biến cố đó xảy ra khi ta lặp phép thử vô hạn lần. Trong thực hành, ta không có vô hạn — ta có DỮ LIỆU, và ta ĐẾM:\n\ntần suất = số lần biến cố xảy ra / tổng số lần thử\n\nĐịnh nghĩa cổ điển cho trường hợp mọi khả năng đồng khả năng: P = số kết quả thuận lợi / tổng số kết quả. Xúc xắc 6 mặt, P(ra số chẵn) = 3/6 = 0,5.\n\nLUẬT SỐ LỚN nói: càng nhiều phép thử, tần suất đếm được càng bám sát xác suất thật. Đây là nền của toàn bộ học máy — ta không biết "quy luật thật", ta chỉ có mẫu dữ liệu và tin rằng mẫu đủ lớn thì phản ánh đúng quy luật. Mẫu nhỏ nói dối: 4 lần tung ra 3 ngửa là chuyện thường, 10.000 lần ra 7.500 ngửa thì đồng xu chắc chắn có vấn đề.\n\nBa tính chất phải nhớ: (1) 0 <= P <= 1; (2) tổng xác suất của mọi khả năng = 1; (3) P(không xảy ra A) = 1 - P(A).\n\nLƯU Ý KỸ THUẬT của khoá này: mọi bài chấm bằng test-case nên ta KHÔNG dùng module random (mỗi lần chạy ra số khác thì không chấm được). Ta mô phỏng bằng một DÃY KẾT QUẢ CHO SẴN — bản chất toán học không đổi, chỉ là ta thay "trời gieo" bằng "dãy đã ghi lại".',
  workedExample: {
    code: `# Luat so lon: tan suat bo dan ve 0.5 khi day dai ra
day = "NSNNSNSSNNSNSSNNSNSN"   # N = ngua, S = sap (day da ghi lai)

for moc in [5, 10, 20]:        # xem tan suat o 3 moc do dai
    phan_dau = day[:moc]       # cat moc ky tu dau tien
    so_ngua = phan_dau.count("N")   # dem so lan ngua
    print(f"Sau {moc} lan: {so_ngua} ngua, tan suat {so_ngua / moc}")`,
    stdinLines: [],
  },
  predict: {
    code: `day = "NNSN"\nprint(day.count("N") / len(day))`,
    question: 'Đoạn code in ra tần suất mặt ngửa bằng bao nhiêu?',
    choices: ['0.75', '3.0', '0.25', '4.0'],
    answerIndex: 0,
    explain:
      'Chuỗi "NNSN" có 3 ký tự N trên tổng 4 ký tự, nên 3 / 4 = 0.75. Đây đúng là định nghĩa tần suất: đếm số lần xảy ra chia tổng số lần thử. Với 4 lần thử thì 0.75 chưa nói được gì về đồng xu — mẫu quá nhỏ.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính tần suất từ một dãy kết quả: đọc dãy → đếm → chia → in.',
    lines: [
      'day = input("Day ket qua: ")',
      'so_ngua = day.count("N")',
      'tong = len(day)',
      'tan_suat = so_ngua / tong',
      'print(f"Tan suat: {tan_suat}")',
    ],
  },
  make: {
    prompt:
      'Viết máy tính tần suất cho một dãy tung xu đã ghi lại.\n\nChương trình đọc 1 dòng input(): một chuỗi chỉ gồm ký tự N (ngửa) và S (sấp), vd "NSNSN".\n\nIn đúng 2 dòng:\nSo lan ngua: <số ký tự N>\nTan suat: <số ký tự N chia tổng độ dài>\n\nVí dụ với "NSNSN": 3 ký tự N trên 5 → "So lan ngua: 3" và "Tan suat: 0.6".',
    starterCode: `day = input("Day tung xu: ").strip()\n# Dem so ky tu "N" bang day.count("N"), tong so lan la len(day)\n# In 2 dong: So lan ngua: ... va Tan suat: ...\n`,
    testCases: [
      {
        stdinLines: ['NSNSN'],
        expected: 'So lan ngua: 3\nTan suat: 0.6',
        match: 'contains',
        hidden: false,
        label: '3 ngửa trên 5 lần → 0.6',
      },
      {
        stdinLines: ['NNNN'],
        expected: 'Tan suat: 1.0',
        match: 'contains',
        hidden: false,
        label: 'Toàn ngửa → tần suất 1.0',
      },
      {
        stdinLines: ['SSSS'],
        expected: 'So lan ngua: 0\nTan suat: 0.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: không có ngửa nào → 0 và 0.0',
      },
    ],
    hints: [
      'Đếm ký tự trong chuỗi có sẵn phương thức: day.count("N") trả về số lần ký tự N xuất hiện.',
      'Tổng số lần thử chính là độ dài chuỗi: len(day). Phép chia / luôn cho số thực nên 3/5 in ra 0.6.',
      'In hai dòng: print(f"So lan ngua: {so_ngua}") rồi print(f"Tan suat: {so_ngua / len(day)}").',
    ],
    sampleSolution: `day = input("Day tung xu: ").strip()\nso_ngua = day.count("N")\ntong = len(day)\nprint(f"So lan ngua: {so_ngua}")\nprint(f"Tan suat: {so_ngua / tong}")`,
  },
  homework:
    'Tự tay tung một đồng xu thật 20 lần, ghi lại thành chuỗi N/S rồi chạy chương trình của bạn lên nó. Tần suất lệch bao nhiêu so với 0,5? Làm lại lần hai với 20 lần khác — hai lần có ra cùng con số không? Viết 3 câu trả lời: vì sao mẫu nhỏ thì tần suất nhảy nhót, và điều đó cảnh báo gì khi bạn đánh giá một mô hình AI trên tập test chỉ có 20 ca?',
  srsCards: [
    {
      hoi: 'Tần suất khác xác suất ở chỗ nào?',
      dap: 'Tần suất là con số ĐẾM ĐƯỢC từ dữ liệu hữu hạn (số lần xảy ra / tổng số lần thử); xác suất là giá trị thật mà tần suất tiến về khi số phép thử ra vô hạn. Luật số lớn nối hai thứ: mẫu càng lớn, tần suất càng sát xác suất.',
    },
    {
      hoi: 'Ba tính chất cơ bản của xác suất là gì?',
      dap: '(1) Mọi xác suất nằm trong đoạn 0 đến 1; (2) tổng xác suất của tất cả khả năng bằng 1; (3) xác suất biến cố KHÔNG xảy ra bằng 1 trừ xác suất nó xảy ra.',
    },
    {
      hoi: 'Vì sao đánh giá mô hình trên tập test quá nhỏ là nguy hiểm?',
      dap: 'Vì tần suất đo trên mẫu nhỏ dao động rất mạnh quanh giá trị thật (4 lần tung ra 3 ngửa là bình thường). Accuracy 90% trên 10 ca có thể chỉ là may mắn; cần mẫu đủ lớn thì con số mới đáng tin.',
    },
  ],
}
```

### Bài 2 — `mathai-u1-l2`

```typescript
{
  id: 'mathai-u1-l2',
  unitId: 'mathai-u1',
  language: 'python',
  title: 'Xác suất có điều kiện & Bayes — que thử dương tính có nghĩa gì',
  hook: 'Xét nghiệm chính xác 99%, bạn thử ra dương tính. Bạn đã mắc bệnh với xác suất 99%? Sai — nếu bệnh hiếm, con số thật có thể chỉ 50%, thậm chí 2%. Công thức Bayes là thứ duy nhất cho ra đáp án đúng, và nó là ruột của bộ lọc thư rác lẫn mọi hệ chẩn đoán AI.',
  theory:
    'XÁC SUẤT CÓ ĐIỀU KIỆN P(A | B) đọc là "xác suất A xảy ra KHI ĐÃ BIẾT B xảy ra". Biết thêm thông tin thì xác suất đổi: P(mưa) khác P(mưa | trời đang đầy mây đen).\n\nCÔNG THỨC BAYES lật ngược chiều điều kiện — từ cái ta ĐO ĐƯỢC sang cái ta MUỐN BIẾT:\n\nP(benh | duong) = P(duong | benh) * P(benh) / P(duong)\n\nTrong đó P(duong) là tổng hai đường dẫn tới kết quả dương tính:\nP(duong) = P(duong | benh) * P(benh) + P(duong | khong benh) * P(khong benh)\n\nGọi tên theo ngôn ngữ y tế: P(benh) là TỶ LỆ NỀN (prior — bao nhiêu phần trăm dân số mắc); P(duong | benh) là ĐỘ NHẠY (sensitivity — người bệnh thì máy báo dương đúng bao nhiêu phần); P(am | khong benh) là ĐỘ ĐẶC HIỆU (specificity), nên P(duong | khong benh) = 1 - độ đặc hiệu, chính là tỷ lệ BÁO ĐỘNG GIẢ.\n\nVí dụ kinh điển: bệnh hiếm 1% dân số, độ nhạy 99%, độ đặc hiệu 99%. Trong 10.000 người: 100 người bệnh → 99 báo dương đúng; 9.900 người khoẻ → 99 báo dương SAI. Tổng 198 ca dương, chỉ 99 là bệnh thật → xác suất 99/198 = 0,5. Xét nghiệm "chính xác 99%" mà dương tính chỉ đúng một nửa!\n\nBài học cốt tử cho AI: TỶ LỆ NỀN QUYẾT ĐỊNH TẤT CẢ. Bỏ quên tỷ lệ nền (base rate neglect) là lỗi tư duy phổ biến nhất khi đọc kết quả của mọi mô hình phân loại chuyện hiếm — phát hiện gian lận, phát hiện ung thư, lọc thư rác.',
  workedExample: {
    code: `# Bayes: benh hiem 1%, xet nghiem nhay 99%, dac hieu 99%
ty_le_nen = 0.01        # P(benh)
do_nhay = 0.99          # P(duong | benh)
do_dac_hieu = 0.99      # P(am | khong benh)

duong_that = ty_le_nen * do_nhay                        # bao dung
duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)         # bao dong gia
print(f"Duong that: {duong_that}")
print(f"Duong gia: {duong_gia}")

# Bayes: chia phan "dung" cho TONG moi ca duong tinh
ket_qua = duong_that / (duong_that + duong_gia)
print(f"P(benh | duong tinh) = {round(ket_qua, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `p = 0.01\nse = 0.99\nsp = 0.99\ntu = p * se\nmau = tu + (1 - p) * (1 - sp)\nprint(round(tu / mau, 2))`,
    question: 'Xét nghiệm "chính xác 99%" cho bệnh chỉ 1% dân số mắc — code in ra gì?',
    choices: ['0.5', '0.99', '0.01', '0.98'],
    answerIndex: 0,
    explain:
      'Tử số 0.01*0.99 = 0.0099 (dương thật), mẫu thêm 0.99*0.01 = 0.0099 (dương giả) → 0.0099/0.0198 = 0.5. Vì người khoẻ ĐÔNG GẤP 99 LẦN người bệnh nên dù chỉ sai 1%, họ vẫn tạo ra số ca báo động giả bằng đúng số ca đúng.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính Bayes: hai đường dẫn tới dương tính → chia đường đúng cho tổng.',
    lines: [
      'duong_that = ty_le_nen * do_nhay',
      'duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)',
      'tong_duong = duong_that + duong_gia',
      'ket_qua = duong_that / tong_duong',
      'print(f"Xac suat mac benh: {round(ket_qua, 4)}")',
    ],
  },
  make: {
    prompt:
      'Viết máy tính Bayes cho bài toán xét nghiệm.\n\nChương trình đọc 3 dòng input() (đều là số thực từ 0 đến 1):\n- Dòng 1: tỷ lệ nền P(benh).\n- Dòng 2: độ nhạy P(duong | benh).\n- Dòng 3: độ đặc hiệu P(am | khong benh).\n\nTính P(benh | duong tinh) theo công thức Bayes rồi in đúng 1 dòng:\nXac suat mac benh: <kết quả làm tròn 4 chữ số thập phân bằng round()>\n\nVí dụ 0.01 / 0.99 / 0.99 → "Xac suat mac benh: 0.5".',
    starterCode: `ty_le_nen = float(input("Ty le nen: "))\ndo_nhay = float(input("Do nhay: "))\ndo_dac_hieu = float(input("Do dac hieu: "))\n# duong_that = ty_le_nen * do_nhay\n# duong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)\n# In: Xac suat mac benh: <duong_that / (duong_that + duong_gia)> lam tron 4 chu so\n`,
    testCases: [
      {
        stdinLines: ['0.01', '0.99', '0.99'],
        expected: 'Xac suat mac benh: 0.5',
        match: 'contains',
        hidden: false,
        label: 'Bệnh hiếm 1% + xét nghiệm 99% → chỉ 0.5',
      },
      {
        stdinLines: ['0.5', '0.9', '0.9'],
        expected: 'Xac suat mac benh: 0.9',
        match: 'contains',
        hidden: false,
        label: 'Tỷ lệ nền 50% → dương tính đáng tin hẳn (0.9)',
      },
      {
        stdinLines: ['0.001', '0.99', '0.95'],
        expected: 'Xac suat mac benh: 0.0194',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: bệnh 1/1000, đặc hiệu 95% → dương tính chỉ đúng ~2%',
      },
    ],
    hints: [
      'Hai đường dẫn tới kết quả dương tính: người BỆNH được báo đúng, và người KHOẺ bị báo nhầm. Tính riêng từng đường trước.',
      'Đường báo nhầm dùng 1 - do_dac_hieu (tỷ lệ báo động giả) nhân với 1 - ty_le_nen (tỷ lệ người khoẻ).',
      'Kết quả = duong_that / (duong_that + duong_gia); in bằng print(f"Xac suat mac benh: {round(ket_qua, 4)}").',
    ],
    sampleSolution: `ty_le_nen = float(input("Ty le nen: "))\ndo_nhay = float(input("Do nhay: "))\ndo_dac_hieu = float(input("Do dac hieu: "))\nduong_that = ty_le_nen * do_nhay\nduong_gia = (1 - ty_le_nen) * (1 - do_dac_hieu)\nket_qua = duong_that / (duong_that + duong_gia)\nprint(f"Xac suat mac benh: {round(ket_qua, 4)}")`,
  },
  homework:
    'Chạy chương trình với tỷ lệ nền 0.001, 0.01, 0.1, 0.5 trong khi giữ nguyên độ nhạy 0.99 và độ đặc hiệu 0.99. Ghi 4 kết quả ra giấy: chỉ đổi tỷ lệ nền mà kết quả nhảy từ ~9% lên ~99%. Rồi nối sang nghề: mô hình phát hiện gian lận báo "gian lận" cho một giao dịch — bạn cần biết thêm CON SỐ NÀO nữa mới dám khoá tài khoản khách hàng?',
  srsCards: [
    {
      hoi: 'Viết công thức Bayes cho bài toán xét nghiệm bệnh.',
      dap: 'P(benh | duong) = P(duong | benh)·P(benh) / [ P(duong | benh)·P(benh) + P(duong | khong benh)·P(khong benh) ] — tức lấy đường "dương đúng" chia cho TỔNG mọi đường dẫn tới kết quả dương tính (dương đúng + dương giả).',
    },
    {
      hoi: 'Vì sao xét nghiệm "chính xác 99%" cho bệnh hiếm 1% mà dương tính chỉ đúng 50%?',
      dap: 'Vì người khoẻ đông gấp 99 lần người bệnh, nên 1% báo nhầm trên nhóm khoẻ tạo ra số ca dương giả bằng đúng số ca dương thật. Tỷ lệ nền (base rate) quyết định độ đáng tin của kết quả, không phải riêng độ chính xác.',
    },
    {
      hoi: 'Độ nhạy và độ đặc hiệu là gì?',
      dap: 'Độ nhạy = P(báo dương | thật sự có bệnh) — bắt được bao nhiêu phần ca bệnh. Độ đặc hiệu = P(báo âm | không bệnh) — tha đúng bao nhiêu phần người khoẻ; 1 trừ độ đặc hiệu chính là tỷ lệ báo động giả.',
    },
  ],
}
```

### Bài 3 — `mathai-u1-l3`

```typescript
{
  id: 'mathai-u1-l3',
  unitId: 'mathai-u1',
  language: 'python',
  title: 'Biến ngẫu nhiên, kỳ vọng & phương sai — tự cài mean và var',
  hook: 'Hai quán ăn cùng doanh thu trung bình 10 triệu/ngày. Quán A ngày nào cũng 10, quán B lúc 2 lúc 18. Trung bình giống hệt nhau nhưng đời sống của hai ông chủ khác nhau một trời một vực. Con số nói ra sự khác biệt đó là PHƯƠNG SAI.',
  theory:
    'BIẾN NGẪU NHIÊN là một đại lượng mà giá trị phụ thuộc kết quả ngẫu nhiên: số chấm xúc xắc, doanh thu ngày mai, điểm bài thi.\n\nKỲ VỌNG (expectation, E[X]) = giá trị trung bình về lâu dài. Khi biết xác suất từng giá trị: E[X] = tổng của (giá trị × xác suất của nó). Xúc xắc cân: E = (1+2+3+4+5+6)/6 = 3,5 — con số 3,5 không bao giờ xuất hiện trên mặt xúc xắc, nhưng trung bình 1.000 lần tung sẽ rất sát nó. Khi chỉ có dữ liệu thô, kỳ vọng ước lượng bằng TRUNG BÌNH CỘNG: sum(du_lieu) / len(du_lieu).\n\nPHƯƠNG SAI (variance) đo mức DÀN TRẢI quanh kỳ vọng:\nvar = trung bình của (mỗi giá trị trừ kỳ vọng) bình phương\n\nBình phương để (1) sai lệch âm và dương không triệt tiêu nhau, (2) phạt nặng những cú lệch lớn. Nhược điểm: đơn vị bị bình phương theo (triệu đồng bình phương — vô nghĩa), nên ta hay lấy căn bậc hai để về ĐỘ LỆCH CHUẨN (standard deviation) cùng đơn vị với dữ liệu.\n\nVì sao AI cần: hàm mất mát MSE (bài mathai-u3-l4) chính là phương sai của sai số; khởi tạo trọng số mạng nơ-ron chọn theo phương sai; chuẩn hoá dữ liệu (bài sau) chia cho độ lệch chuẩn; và cặp bias–variance của học máy mượn thẳng tên từ đây.\n\nLƯU Ý: công thức trên là phương sai TỔNG THỂ (chia cho n). Thống kê suy diễn có bản chia cho n-1 (phương sai mẫu) khi ước lượng từ mẫu nhỏ; khoá này dùng nhất quán bản chia cho n.',
  workedExample: {
    code: `# Hai quan cung ky vong 10 nhung phuong sai khac han
quan_a = [10, 10, 10, 10]
quan_b = [2, 18, 2, 18]

def ky_vong(ds):
    return sum(ds) / len(ds)            # trung binh cong

def phuong_sai(ds):
    tb = ky_vong(ds)                    # tam ve trung binh
    return sum((v - tb) ** 2 for v in ds) / len(ds)   # trung binh binh phuong lech

print(f"Quan A: ky vong {ky_vong(quan_a)}, phuong sai {phuong_sai(quan_a)}")
print(f"Quan B: ky vong {ky_vong(quan_b)}, phuong sai {phuong_sai(quan_b)}")
print(f"Do lech chuan quan B: {phuong_sai(quan_b) ** 0.5}")`,
    stdinLines: [],
  },
  predict: {
    code: `gia_tri = [1, 2, 3]\nxac_suat = [0.5, 0.25, 0.25]\nky_vong = sum(gia_tri[i] * xac_suat[i] for i in range(3))\nprint(ky_vong)`,
    question: 'Kỳ vọng của biến ngẫu nhiên này in ra bằng bao nhiêu?',
    choices: ['1.75', '2.0', '2.25', '1.5'],
    answerIndex: 0,
    explain:
      '1×0.5 + 2×0.25 + 3×0.25 = 0.5 + 0.5 + 0.75 = 1.75. Kỳ vọng KHÔNG phải trung bình cộng của các giá trị (đó là 2.0) — nó là trung bình CÓ TRỌNG SỐ theo xác suất, nên giá trị nào hay xảy ra thì kéo kết quả về phía nó.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính phương sai: trung bình trước, rồi bình phương độ lệch, rồi chia.',
    lines: [
      'so = [float(v) for v in input("Day so: ").split(",")]',
      'tb = sum(so) / len(so)',
      'tong_lech = sum((v - tb) ** 2 for v in so)',
      'ps = tong_lech / len(so)',
      'print(f"Phuong sai: {ps}")',
    ],
  },
  make: {
    prompt:
      'Tự cài mean và var — hai hàm bạn sẽ dùng lại suốt phần còn lại của khoá.\n\nChương trình đọc 1 dòng input(): các số cách nhau dấu phẩy, vd "1,2,3,4,5".\n\nIn đúng 2 dòng:\nKy vong: <trung bình cộng>\nPhuong sai: <trung bình của bình phương độ lệch, chia cho n>\n\nVí dụ "1,2,3,4,5" → kỳ vọng 3.0, phương sai (4+1+0+1+4)/5 = 2.0.',
    starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\n# tb = sum(so) / len(so)\n# ps = sum((v - tb) ** 2 for v in so) / len(so)\n# In 2 dong Ky vong: ... va Phuong sai: ...\n`,
    testCases: [
      {
        stdinLines: ['1,2,3,4,5'],
        expected: 'Ky vong: 3.0\nPhuong sai: 2.0',
        match: 'contains',
        hidden: false,
        label: 'Dãy 1..5 → kỳ vọng 3.0, phương sai 2.0',
      },
      {
        stdinLines: ['2,2,2'],
        expected: 'Phuong sai: 0.0',
        match: 'contains',
        hidden: false,
        label: 'Mọi giá trị giống nhau → phương sai 0.0',
      },
      {
        stdinLines: ['1,3'],
        expected: 'Ky vong: 2.0\nPhuong sai: 1.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: chỉ 2 phần tử → (1+1)/2 = 1.0',
      },
    ],
    hints: [
      'Bước 1 luôn là trung bình: tb = sum(so) / len(so). Mọi thứ sau đó đều đo khoảng cách tới tb.',
      'Bình phương độ lệch từng phần tử rồi cộng dồn: sum((v - tb) ** 2 for v in so). Nhớ chia cho len(so) ở cuối.',
      'In: print(f"Ky vong: {tb}") rồi print(f"Phuong sai: {ps}") — không làm tròn, các test đều ra số chẵn.',
    ],
    sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\ntb = sum(so) / len(so)\nps = sum((v - tb) ** 2 for v in so) / len(so)\nprint(f"Ky vong: {tb}")\nprint(f"Phuong sai: {ps}")`,
  },
  homework:
    'Ghi lại số phút bạn thực sự học mỗi ngày trong 7 ngày, rồi tính kỳ vọng, phương sai và độ lệch chuẩn bằng chương trình vừa viết. Sau đó thử: cộng thêm 10 phút vào MỌI ngày — kỳ vọng đổi thế nào, phương sai đổi thế nào? Nhân đôi mọi ngày thì sao? Tự rút ra hai quy tắc rồi kiểm bằng code (đáp: cộng hằng số không đổi phương sai; nhân k thì phương sai nhân k²).',
  srsCards: [
    {
      hoi: 'Công thức kỳ vọng khi biết xác suất từng giá trị?',
      dap: 'E[X] = tổng của (giá trị × xác suất của giá trị đó) — trung bình CÓ TRỌNG SỐ. Khi chỉ có dữ liệu thô không biết xác suất, ta ước lượng kỳ vọng bằng trung bình cộng sum(du_lieu)/len(du_lieu).',
    },
    {
      hoi: 'Phương sai đo cái gì và tính thế nào?',
      dap: 'Đo mức dàn trải của dữ liệu quanh kỳ vọng: trung bình của bình phương độ lệch — sum((v − tb)²)/n. Bình phương để lệch âm/dương không triệt tiêu và để phạt nặng cú lệch lớn.',
    },
    {
      hoi: 'Vì sao hay dùng độ lệch chuẩn thay vì phương sai?',
      dap: 'Vì phương sai có đơn vị bị bình phương (triệu đồng bình phương — vô nghĩa). Lấy căn bậc hai của phương sai ra độ lệch chuẩn, cùng đơn vị với dữ liệu nên đọc được trực tiếp.',
    },
  ],
}
```

### Bài 4 — `mathai-u1-l4`

```typescript
{
  id: 'mathai-u1-l4',
  unitId: 'mathai-u1',
  language: 'python',
  title: 'Phân phối thường gặp & định lý giới hạn trung tâm',
  hook: 'Tung một xúc xắc: sáu kết quả đều nhau, phẳng lì. Tung năm xúc xắc rồi lấy trung bình: kết quả tụm lại quanh 3,5 thành hình chuông. Phép màu đó có tên — định lý giới hạn trung tâm — và nó là lý do hình chuông xuất hiện ở khắp mọi nơi trong tự nhiên lẫn trong AI.',
  theory:
    'PHÂN PHỐI mô tả "giá trị nào hay xảy ra, giá trị nào hiếm". Ba phân phối phải thuộc:\n\n1. PHÂN PHỐI ĐỀU (uniform): mọi kết quả khả năng như nhau — xúc xắc cân, bốc số ngẫu nhiên. Đồ thị phẳng.\n2. PHÂN PHỐI NHỊ THỨC (binomial): đếm số lần THÀNH CÔNG trong n phép thử độc lập cùng xác suất p — tung xu 10 lần được mấy mặt ngửa, gửi 100 email được mấy người trả lời. Kỳ vọng = n·p.\n3. PHÂN PHỐI CHUẨN (normal / Gauss): hình chuông đối xứng quanh trung bình, đặc trưng bởi cặp (trung bình, độ lệch chuẩn). Quy tắc 68–95–99,7: khoảng 68% dữ liệu nằm trong 1 độ lệch chuẩn quanh trung bình, 95% trong 2, 99,7% trong 3.\n\nĐỊNH LÝ GIỚI HẠN TRUNG TÂM (CLT) nói điều đáng kinh ngạc: lấy TRUNG BÌNH của nhiều biến ngẫu nhiên độc lập — dù từng biến phân phối gì đi nữa, kể cả phẳng lì như xúc xắc — thì trung bình đó tiến về PHÂN PHỐI CHUẨN, và càng gộp nhiều biến, nó càng CO LẠI quanh kỳ vọng.\n\nHai hệ quả dùng hằng ngày: (1) hình chuông xuất hiện khắp nơi vì đại lượng thật thường là tổng của nhiều yếu tố nhỏ; (2) trung bình của mẫu lớn ổn định hơn hẳn giá trị lẻ — đo được bằng cách nhìn KHOẢNG (max trừ min) của các trung bình nhóm co lại so với khoảng của dữ liệu gốc. Bài Make hôm nay đo đúng sự co lại đó, hoàn toàn tất định.',
  workedExample: {
    code: `# CLT tat dinh: gop tung cap so lai, khoang bien thien co lai
goc = [1, 6, 2, 5, 3, 4, 1, 6]     # 8 lan "tung xuc xac" da ghi lai

tb_nhom = []
for i in range(0, len(goc), 2):    # cat thanh tung nhom 2 phan tu
    nhom = goc[i:i + 2]
    tb_nhom.append(sum(nhom) / 2)  # trung binh moi nhom

print(f"Du lieu goc: {goc}")
print(f"Trung binh cac nhom: {tb_nhom}")
print(f"Khoang goc: {max(goc) - min(goc)}")          # dan trai rong
print(f"Khoang nhom: {max(tb_nhom) - min(tb_nhom)}") # da co lai`,
    stdinLines: [],
  },
  predict: {
    code: `nhom = [1, 6]\nprint(sum(nhom) / len(nhom))`,
    question: 'Trung bình của nhóm hai giá trị cực trị 1 và 6 in ra là bao nhiêu?',
    choices: ['3.5', '7.0', '3.0', '6.0'],
    answerIndex: 0,
    explain:
      '(1 + 6)/2 = 3.5 — đúng bằng kỳ vọng của xúc xắc cân. Đây chính là cơ chế của CLT: hai giá trị lệch về hai phía triệt tiêu nhau, nên trung bình nhóm nằm gần tâm hơn hẳn từng giá trị lẻ.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự mô phỏng CLT tất định: cắt nhóm → trung bình từng nhóm → so khoảng.',
    lines: [
      'tb_nhom = []',
      'for i in range(0, len(so) - k + 1, k):',
      '    nhom = so[i:i + k]',
      '    tb_nhom.append(sum(nhom) / k)',
      'print(f"Khoang du lieu goc: {max(so) - min(so)}")',
      'print(f"Khoang trung binh nhom: {max(tb_nhom) - min(tb_nhom)}")',
    ],
  },
  make: {
    prompt:
      'Đo sự "co lại" của định lý giới hạn trung tâm bằng dữ liệu tất định.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dãy kết quả đã ghi lại, các số cách nhau dấu phẩy, vd "1,6,2,5,3,4".\n- Dòng 2: k — kích thước mỗi nhóm (số nguyên).\n\nCắt dãy thành các nhóm LIÊN TIẾP đúng k phần tử tính từ đầu (phần dư cuối dãy KHÔNG đủ k thì bỏ), tính trung bình mỗi nhóm, rồi in đúng 2 dòng:\nKhoang du lieu goc: <max trừ min của dãy gốc>\nKhoang trung binh nhom: <max trừ min của các trung bình nhóm>\n\nVí dụ "1,6,2,5,3,4" với k=2 → 3 nhóm đều có trung bình 3.5 → khoảng gốc 5.0, khoảng nhóm 0.0.',
    starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\nk = int(input("Kich thuoc nhom: "))\ntb_nhom = []\n# Dung vong for i in range(0, len(so) - k + 1, k) de cat nhom khong bi du\n# Tinh trung binh moi nhom roi in 2 dong khoang bien thien\n`,
    testCases: [
      {
        stdinLines: ['1,6,2,5,3,4', '2'],
        expected: 'Khoang du lieu goc: 5.0\nKhoang trung binh nhom: 0.0',
        match: 'contains',
        hidden: false,
        label: 'Ba nhóm đều ra 3.5 → khoảng nhóm co về 0.0',
      },
      {
        stdinLines: ['1,2,3,4', '2'],
        expected: 'Khoang du lieu goc: 3.0\nKhoang trung binh nhom: 2.0',
        match: 'contains',
        hidden: false,
        label: 'Nhóm 1.5 và 3.5 → khoảng nhóm 2.0, nhỏ hơn 3.0 của gốc',
      },
      {
        stdinLines: ['1,2,3,4,5', '2'],
        expected: 'Khoang du lieu goc: 4.0\nKhoang trung binh nhom: 2.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: 5 phần tử với k=2 — phần tử cuối lẻ ra phải BỎ',
      },
    ],
    hints: [
      'Cắt nhóm bằng lát cắt: so[i:i + k] lấy k phần tử từ vị trí i.',
      'Để không tạo nhóm thiếu phần tử, cho vòng lặp chạy range(0, len(so) - k + 1, k) — dừng trước khi phần còn lại ngắn hơn k.',
      'Khoảng biến thiên là max(...) - min(...); áp cho cả dãy gốc "so" lẫn danh sách trung bình nhóm "tb_nhom".',
    ],
    sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\nk = int(input("Kich thuoc nhom: "))\ntb_nhom = []\nfor i in range(0, len(so) - k + 1, k):\n    nhom = so[i:i + k]\n    tb_nhom.append(sum(nhom) / k)\nprint(f"Khoang du lieu goc: {max(so) - min(so)}")\nprint(f"Khoang trung binh nhom: {max(tb_nhom) - min(tb_nhom)}")`,
  },
  homework:
    'Lấy một dãy 24 số bất kỳ (điểm các bài kiểm tra, số bước chân 24 ngày...) rồi chạy chương trình với k = 2, 3, 4, 6, 12. Ghi lại khoảng trung bình nhóm theo từng k: nó giảm dần thế nào? Trả lời bằng lời: vì sao khảo sát 1.000 người đáng tin hơn hẳn khảo sát 10 người, dù cả hai đều "chọn ngẫu nhiên"?',
  srsCards: [
    {
      hoi: 'Định lý giới hạn trung tâm (CLT) nói gì?',
      dap: 'Trung bình của nhiều biến ngẫu nhiên độc lập sẽ tiến về PHÂN PHỐI CHUẨN (hình chuông) dù từng biến gốc phân phối gì đi nữa; càng gộp nhiều biến, phân phối của trung bình càng co hẹp quanh kỳ vọng.',
    },
    {
      hoi: 'Ba phân phối cơ bản và dấu hiệu nhận ra chúng?',
      dap: 'Đều (uniform): mọi kết quả khả năng như nhau, đồ thị phẳng. Nhị thức (binomial): đếm số lần thành công trong n phép thử độc lập, kỳ vọng n·p. Chuẩn (normal): hình chuông đối xứng, mô tả bằng cặp trung bình và độ lệch chuẩn.',
    },
    {
      hoi: 'Quy tắc 68–95–99,7 của phân phối chuẩn nghĩa là gì?',
      dap: 'Khoảng 68% dữ liệu nằm trong phạm vi 1 độ lệch chuẩn quanh trung bình, 95% trong 2 độ lệch chuẩn, 99,7% trong 3 — nên giá trị lệch quá 3 độ lệch chuẩn là bất thường đáng nghi.',
    },
  ],
}
```

### Bài 5 — `mathai-u1-l5`

```typescript
{
  id: 'mathai-u1-l5',
  unitId: 'mathai-u1',
  language: 'python',
  title: 'Thống kê mô tả — trung vị, phân vị và chuẩn hoá z-score',
  hook: 'Mười nhân viên lương 10 triệu, ông chủ lương 900 triệu: "lương trung bình công ty 91 triệu". Đúng về số học, dối trá về sự thật. Trung vị nói thẳng: 10 triệu. Đây là bài về những con số mô tả dữ liệu mà không để nó lừa mình.',
  theory:
    'TRUNG BÌNH (mean) rất nhạy với GIÁ TRỊ NGOẠI LAI (outlier): một con số khổng lồ kéo lệch cả bảng. TRUNG VỊ (median) — giá trị đứng giữa khi đã sắp xếp — thì trơ với ngoại lai: đổi lương ông chủ thành 9.000 triệu, trung vị vẫn y nguyên.\n\nCách tính trung vị: sắp xếp dãy; n lẻ thì lấy phần tử ở giữa (chỉ số n//2); n chẵn thì lấy trung bình hai phần tử giữa (chỉ số n//2 - 1 và n//2).\n\nPHÂN VỊ (percentile) tổng quát hoá ý đó: phân vị 90 là giá trị mà 90% dữ liệu nằm dưới. Ngành phần mềm sống bằng p95/p99 độ trễ — "trung bình 100ms" vô nghĩa nếu 1% người dùng phải chờ 8 giây.\n\nZ-SCORE (chuẩn hoá) trả lời câu "giá trị này lệch bao nhiêu ĐỘ LỆCH CHUẨN so với trung bình":\n\nz = (x - trung binh) / do lech chuan\n\nz = 0 nghĩa là đúng mức trung bình, z = 2 nghĩa là cao hơn trung bình 2 độ lệch chuẩn (thuộc nhóm ~2,5% dẫn đầu nếu dữ liệu hình chuông), z âm là dưới trung bình.\n\nVÌ SAO AI CẦN: các đặc trưng khác thang đo (tuổi 0–100 và thu nhập 0–100.000.000) thì đặc trưng số to nuốt trọn mọi phép đo khoảng cách (k-NN, k-means) và làm gradient descent zigzag chậm chạp. Chuẩn hoá z-score đưa mọi đặc trưng về cùng một thước đo "bao nhiêu độ lệch chuẩn" — đây là bước tiền xử lý phổ biến bậc nhất của nghề. Nhớ luật kèm theo (khoá ml, bài train/test): trung bình và độ lệch chuẩn phải tính TRÊN TẬP TRAIN rồi áp cho test, tính trên cả dữ liệu là RÒ RỈ.',
  workedExample: {
    code: `luong = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 900]  # trieu dong

tb = sum(luong) / len(luong)            # trung binh bi keo lech
sap = sorted(luong)                     # phai sap xep truoc khi lay trung vi
n = len(sap)
trung_vi = sap[n // 2] if n % 2 == 1 else (sap[n // 2 - 1] + sap[n // 2]) / 2

print(f"Trung binh: {round(tb, 2)}")
print(f"Trung vi: {trung_vi}")

do_lech = (sum((v - tb) ** 2 for v in luong) / n) ** 0.5   # do lech chuan
print(f"Do lech chuan: {round(do_lech, 2)}")
print(f"Z-score cua muc luong 10: {round((10 - tb) / do_lech, 2)}")`,
    stdinLines: [],
  },
  predict: {
    code: `so = sorted([5, 1, 9, 3])\nprint((so[1] + so[2]) / 2)`,
    question: 'Trung vị của dãy [5, 1, 9, 3] in ra là bao nhiêu?',
    choices: ['4.0', '3.0', '4.5', '5.0'],
    answerIndex: 0,
    explain:
      'Sắp xếp được [1, 3, 5, 9]; n = 4 là số chẵn nên trung vị là trung bình hai phần tử giữa: (3 + 5)/2 = 4.0. Bẫy hay gặp: quên sorted() rồi lấy giữa của dãy CHƯA sắp xếp — ra 9 và sai hoàn toàn.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính trung vị: sắp xếp → lấy độ dài → tách hai nhánh lẻ/chẵn.',
    lines: [
      'sap = sorted(so)',
      'n = len(sap)',
      'if n % 2 == 1:',
      '    trung_vi = sap[n // 2]',
      'else:',
      '    trung_vi = (sap[n // 2 - 1] + sap[n // 2]) / 2',
      'print(f"Trung vi: {trung_vi}")',
    ],
  },
  make: {
    prompt:
      'Viết máy thống kê mô tả: trung vị + chuẩn hoá z-score.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dãy dữ liệu, các số cách nhau dấu phẩy, vd "2,4,4,4,5,5,7,9".\n- Dòng 2: một giá trị x cần chuẩn hoá.\n\nIn đúng 2 dòng:\nTrung vi: <trung vị của dãy — nhớ sắp xếp trước; n chẵn thì lấy trung bình hai phần tử giữa>\nZ-score: <(x - trung bình) / độ lệch chuẩn, làm tròn 4 chữ số bằng round()>\n\nĐộ lệch chuẩn = căn bậc hai của phương sai chia cho n (như bài 3).\n\nVí dụ "2,4,4,4,5,5,7,9" và x = 7 → trung vị 4.5, trung bình 5.0, độ lệch chuẩn 2.0 → z = 1.0.',
    starterCode: `so = [float(v) for v in input("Day so: ").split(",")]\nx = float(input("Gia tri can chuan hoa: "))\n# Sap xep de lay trung vi (nho tach nhanh n le / n chan)\n# Tinh trung binh, do lech chuan roi z = (x - tb) / do_lech\n`,
    testCases: [
      {
        stdinLines: ['2,4,4,4,5,5,7,9', '7'],
        expected: 'Trung vi: 4.5\nZ-score: 1.0',
        match: 'contains',
        hidden: false,
        label: 'Trung bình 5.0, độ lệch chuẩn 2.0 → z = 1.0',
      },
      {
        stdinLines: ['1,2,3', '3'],
        expected: 'Trung vi: 2.0\nZ-score: 1.2247',
        match: 'contains',
        hidden: false,
        label: 'n lẻ → trung vị là phần tử giữa; z làm tròn 4 chữ số',
      },
      {
        stdinLines: ['10,20', '10'],
        expected: 'Trung vi: 15.0\nZ-score: -1.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: giá trị dưới trung bình → z ÂM',
      },
    ],
    hints: [
      'Luôn sorted(so) trước khi lấy trung vị — lấy phần tử giữa của dãy chưa sắp xếp là lỗi kinh điển.',
      'n lẻ (n % 2 == 1): sap[n // 2]. n chẵn: (sap[n // 2 - 1] + sap[n // 2]) / 2.',
      'Độ lệch chuẩn = (sum((v - tb) ** 2 for v in so) / len(so)) ** 0.5, rồi in round((x - tb) / do_lech, 4).',
    ],
    sampleSolution: `so = [float(v) for v in input("Day so: ").split(",")]\nx = float(input("Gia tri can chuan hoa: "))\nsap = sorted(so)\nn = len(sap)\nif n % 2 == 1:\n    trung_vi = sap[n // 2]\nelse:\n    trung_vi = (sap[n // 2 - 1] + sap[n // 2]) / 2\ntb = sum(so) / n\ndo_lech = (sum((v - tb) ** 2 for v in so) / n) ** 0.5\nprint(f"Trung vi: {trung_vi}")\nprint(f"Z-score: {round((x - tb) / do_lech, 4)}")`,
  },
  homework:
    'Lấy 10 con số thật (giá 10 món trong quán quen, hoặc thời gian tải 10 trang web bạn hay vào). Tính trung bình và trung vị — chúng lệch nhau bao nhiêu? Rồi thêm MỘT giá trị ngoại lai gấp 20 lần vào dãy và tính lại: con số nào nhảy dựng, con số nào đứng yên? Cuối cùng, tính z-score của giá trị ngoại lai đó và giải thích vì sao |z| > 3 thường bị coi là bất thường.',
  srsCards: [
    {
      hoi: 'Khi nào nên dùng trung vị thay cho trung bình?',
      dap: 'Khi dữ liệu có giá trị ngoại lai hoặc phân phối lệch (lương, giá nhà, thời gian phản hồi). Trung bình bị một giá trị khổng lồ kéo lệch, còn trung vị — phần tử đứng giữa sau khi sắp xếp — trơ với ngoại lai.',
    },
    {
      hoi: 'Z-score tính thế nào và nói lên điều gì?',
      dap: 'z = (x − trung bình) / độ lệch chuẩn, nghĩa là "x cách trung bình bao nhiêu độ lệch chuẩn". z = 0 là đúng mức trung bình, z dương là trên, z âm là dưới; |z| > 3 thường coi là bất thường.',
    },
    {
      hoi: 'Vì sao phải chuẩn hoá đặc trưng trước khi huấn luyện mô hình?',
      dap: 'Vì đặc trưng khác thang đo (tuổi vs thu nhập) làm đặc trưng số lớn nuốt trọn phép đo khoảng cách và khiến gradient descent zigzag chậm. Chuẩn hoá z-score đưa mọi đặc trưng về cùng thước "bao nhiêu độ lệch chuẩn"; trung bình/độ lệch phải tính trên tập train rồi mới áp cho test, nếu không là rò rỉ dữ liệu.',
    },
  ],
}
```

---

## C2 — Đại số tuyến tính (`mathai-u2`, 4 bài)

### Bài 6 — `mathai-u2-l1`

```typescript
{
  id: 'mathai-u2-l1',
  unitId: 'mathai-u2',
  language: 'python',
  title: 'Vector — cộng, nhân vô hướng, tích vô hướng và ý nghĩa hình học',
  hook: 'Một bộ phim trong hệ gợi ý của Netflix không phải cái tên — nó là một dãy số: [hài 0.9, kinh dị 0.1, dài 120]. Một khách hàng cũng là một dãy số. Toàn bộ AI hiện đại nói chuyện bằng thứ ngôn ngữ đó, và đơn vị nhỏ nhất của nó gọi là VECTOR.',
  theory:
    'VECTOR là một danh sách số có thứ tự: [3, 4] hay [0.9, 0.1, 120]. Trong Python thuần ta biểu diễn nó bằng list. Hai cách nhìn, cùng một thứ:\n- Cách ĐẠI SỐ: một bộ n con số (n gọi là số chiều).\n- Cách HÌNH HỌC: một mũi tên từ gốc toạ độ tới điểm (3, 4) — có HƯỚNG và có ĐỘ DÀI.\n\nBa phép toán phải thuộc lòng:\n1. CỘNG hai vector — cộng từng vị trí tương ứng: [1,2] + [3,4] = [4,6]. Hình học: nối đuôi hai mũi tên. Bắt buộc cùng số chiều.\n2. NHÂN VÔ HƯỚNG (scalar) — nhân mọi thành phần với một số: 2 * [1,2] = [2,4]. Hình học: kéo dài/thu ngắn mũi tên, số âm thì lật ngược hướng.\n3. TÍCH VÔ HƯỚNG (dot product) — nhân từng cặp rồi CỘNG LẠI, cho ra MỘT SỐ (không phải vector): [1,2,3]·[4,5,6] = 1·4 + 2·5 + 3·6 = 32.\n\nTích vô hướng là phép toán quan trọng nhất của cả ngành AI. Ý nghĩa: nó đo mức CÙNG HƯỚNG của hai vector — dương là cùng hướng, 0 là vuông góc (chẳng liên quan gì nhau), âm là ngược hướng. Mọi nơ-ron trong mạng nơ-ron chỉ làm đúng một việc: lấy tích vô hướng của vector đầu vào với vector trọng số, cộng bias, rồi cho qua hàm kích hoạt.\n\nĐỘ DÀI (chuẩn Euclid) của vector = căn bậc hai của tích vô hướng với chính nó: |v| = (v[0]² + v[1]² + ...) ** 0.5. Vector [3,4] có độ dài 5.\n\nKHÔNG dùng numpy trong khoá này: mọi phép trên viết bằng list comprehension và vòng lặp, để bạn thấy rõ từng phép cộng, phép nhân mà thư viện giấu đi.',
  workedExample: {
    code: `a = [1, 2, 3]
b = [4, 5, 6]

tong = [a[i] + b[i] for i in range(len(a))]   # cong tung vi tri
print(f"a + b = {tong}")

gap_doi = [2 * v for v in a]                  # nhan vo huong
print(f"2 * a = {gap_doi}")

dot = 0
for i in range(len(a)):                       # tich vo huong: nhan roi cong don
    dot += a[i] * b[i]
print(f"a . b = {dot}")

do_dai = sum(v * v for v in a) ** 0.5          # do dai Euclid
print(f"|a| = {round(do_dai, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `a = [1, 2, 3]\nb = [4, 5, 6]\nprint(sum(a[i] * b[i] for i in range(3)))`,
    question: 'Tích vô hướng của [1,2,3] và [4,5,6] in ra là bao nhiêu?',
    choices: ['32', '[4, 10, 18]', '21', '6'],
    answerIndex: 0,
    explain:
      '1·4 + 2·5 + 3·6 = 4 + 10 + 18 = 32. Chú ý kết quả là MỘT SỐ chứ không phải vector — tích vô hướng "nén" hai vector thành một con số đo mức cùng hướng. Đáp án [4, 10, 18] là phép nhân từng-vị-trí (elementwise), một phép khác hẳn.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự: đọc hai vector → cộng từng vị trí → cộng dồn tích vô hướng → in.',
    lines: [
      'a = [float(v) for v in input("Vector a: ").split(",")]',
      'b = [float(v) for v in input("Vector b: ").split(",")]',
      'tong = [a[i] + b[i] for i in range(len(a))]',
      'dot = sum(a[i] * b[i] for i in range(len(a)))',
      'print("Tong: " + ",".join(str(v) for v in tong))',
      'print(f"Tich vo huong: {dot}")',
    ],
  },
  make: {
    prompt:
      'Tự cài hai phép vector nền tảng.\n\nChương trình đọc 2 dòng input(): vector a và vector b, mỗi vector là các số cách nhau dấu phẩy và HAI VECTOR LUÔN CÙNG SỐ CHIỀU. Ví dụ "1,2,3" và "4,5,6".\n\nIn đúng 2 dòng:\nTong: <các thành phần của a + b, cách nhau dấu phẩy, KHÔNG có dấu cách>\nTich vo huong: <tích vô hướng của a và b>\n\nĐọc số bằng float() nên "1,2,3" + "4,5,6" phải in "Tong: 5.0,7.0,9.0" và "Tich vo huong: 32.0".',
    starterCode: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\n# tong = [a[i] + b[i] for i in range(len(a))]\n# Ghep chuoi bang ",".join(str(v) for v in tong)\n# dot = sum(a[i] * b[i] for i in range(len(a)))\n`,
    testCases: [
      {
        stdinLines: ['1,2,3', '4,5,6'],
        expected: 'Tong: 5.0,7.0,9.0\nTich vo huong: 32.0',
        match: 'contains',
        hidden: false,
        label: 'Vector 3 chiều kinh điển → dot 32.0',
      },
      {
        stdinLines: ['1,0', '0,1'],
        expected: 'Tong: 1.0,1.0\nTich vo huong: 0.0',
        match: 'contains',
        hidden: false,
        label: 'Hai vector VUÔNG GÓC → tích vô hướng 0.0',
      },
      {
        stdinLines: ['-1,2', '3,4'],
        expected: 'Tong: 2.0,6.0\nTich vo huong: 5.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: có thành phần ÂM → -3 + 8 = 5.0',
      },
    ],
    hints: [
      'Cộng vector là cộng theo TỪNG VỊ TRÍ: dùng range(len(a)) để đi qua các chỉ số chung của cả hai list.',
      'Ghép list số thành chuỗi: ",".join(str(v) for v in tong) — join chỉ nhận chuỗi nên phải str() từng phần tử.',
      'Tích vô hướng cộng dồn: dot = sum(a[i] * b[i] for i in range(len(a))), rồi print(f"Tich vo huong: {dot}").',
    ],
    sampleSolution: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\ntong = [a[i] + b[i] for i in range(len(a))]\ndot = sum(a[i] * b[i] for i in range(len(a)))\nprint("Tong: " + ",".join(str(v) for v in tong))\nprint(f"Tich vo huong: {dot}")`,
  },
  homework:
    'Mô tả CHÍNH BẠN bằng một vector 4 chiều: [số giờ học/ngày, số giờ ngủ, số buổi tập thể thao/tuần, số giờ dùng mạng xã hội]. Nhờ 2 người bạn làm tương tự. Tính tích vô hướng giữa vector của bạn với từng người, và độ dài của mỗi vector. Rồi trả lời: tích vô hướng lớn có chắc nghĩa là "giống nhau" không, hay chỉ vì ai đó có mọi con số đều to? (Bài sau sẽ chữa đúng vấn đề này.)',
  srsCards: [
    {
      hoi: 'Tích vô hướng (dot product) của hai vector tính thế nào, kết quả là gì?',
      dap: 'Nhân từng cặp thành phần tương ứng rồi cộng tất cả lại: [1,2,3]·[4,5,6] = 4+10+18 = 32. Kết quả là MỘT SỐ (không phải vector), đo mức hai vector cùng hướng: dương = cùng hướng, 0 = vuông góc, âm = ngược hướng.',
    },
    {
      hoi: 'Vì sao tích vô hướng là phép toán trung tâm của mạng nơ-ron?',
      dap: 'Vì mỗi nơ-ron chỉ làm đúng một việc: lấy tích vô hướng giữa vector đầu vào và vector trọng số, cộng bias rồi cho qua hàm kích hoạt. Một lớp mạng = nhiều tích vô hướng song song, tức là một phép nhân ma trận.',
    },
    {
      hoi: 'Độ dài (chuẩn Euclid) của vector tính thế nào?',
      dap: '|v| = căn bậc hai của tổng bình phương các thành phần — trong Python: sum(x*x for x in v) ** 0.5. Đó cũng chính là căn của tích vô hướng của vector với chính nó. Vector [3,4] có độ dài 5.',
    },
  ],
}
```

### Bài 7 — `mathai-u2-l2`

```typescript
{
  id: 'mathai-u2-l2',
  unitId: 'mathai-u2',
  language: 'python',
  title: 'Ma trận & nhân ma trận tự cài — vì sao mạng nơ-ron toàn phép nhân này',
  hook: 'Card đồ hoạ giá nghìn đô trong máy chủ AI về cơ bản là một cỗ máy làm đúng MỘT việc thật nhanh: nhân ma trận. Hôm nay bạn tự cài phép đó bằng ba vòng lặp Python — hiểu xong ba vòng lặp này là hiểu thứ mà toàn bộ ngành đang đốt điện để chạy.',
  theory:
    'MA TRẬN là bảng số hai chiều — trong Python thuần: LIST CỦA CÁC LIST, mỗi list con là một hàng. [[1,2],[3,4]] là ma trận 2 hàng 2 cột (2×2).\n\nNHÂN MA TRẬN C = A × B: phần tử C[i][j] là TÍCH VÔ HƯỚNG của hàng i trong A với cột j trong B.\n\nQuy tắc kích thước bất di bất dịch: A cỡ (n × m) nhân được với B cỡ (m × p) — số CỘT của A phải bằng số HÀNG của B — và kết quả cỡ (n × p). Lệch là không nhân được; lỗi "shape mismatch" là lỗi phổ biến nhất đời một kỹ sư ML.\n\nBa vòng lặp lồng nhau, thuộc lòng cấu trúc này:\n- vòng i chạy qua các HÀNG của A (và của kết quả),\n- vòng j chạy qua các CỘT của B (và của kết quả),\n- vòng k cộng dồn A[i][k] * B[k][j] — đây chính là tích vô hướng của bài trước.\n\nHai điều phải nhớ: (1) nhân ma trận KHÔNG giao hoán — A×B khác B×A, thậm chí một chiều nhân được còn chiều kia thì không; (2) ma trận ĐƠN VỊ (đường chéo toàn 1, còn lại 0) đóng vai số 1: nhân với nó thì không đổi gì.\n\nVÌ SAO AI CẦN: một lớp mạng nơ-ron dày đặc chính là phép nhân ma trận đầu-vào × trọng-số. Xử lý 64 mẫu cùng lúc (batch) = xếp 64 vector thành ma trận rồi nhân MỘT lần thay vì 64 lần — đó là lý do GPU (làm hàng nghìn phép nhân song song) chiếm ngôi trong AI. Bạn sẽ dùng lại đúng hàm này ở khoá cv1 khi cài forward pass của MLP.',
  workedExample: {
    code: `A = [[1, 2],
     [3, 4]]        # 2 hang, 2 cot
B = [[5, 6],
     [7, 8]]

n = len(A)          # so hang cua A
m = len(B)          # so hang cua B = so cot cua A
p = len(B[0])       # so cot cua B

for i in range(n):              # vong 1: tung hang cua A
    hang_kq = []
    for j in range(p):          # vong 2: tung cot cua B
        tong = 0
        for k in range(m):      # vong 3: tich vo huong hang i x cot j
            tong += A[i][k] * B[k][j]
        hang_kq.append(tong)
    print(hang_kq)              # in tung hang ket qua`,
    stdinLines: [],
  },
  predict: {
    code: `A = [[1, 2], [3, 4]]\nB = [[1, 0], [0, 1]]\nprint(A[0][0] * B[0][0] + A[0][1] * B[1][0])`,
    question: 'Phần tử C[0][0] của tích A × B với B là ma trận đơn vị bằng bao nhiêu?',
    choices: ['1', '2', '3', '0'],
    answerIndex: 0,
    explain:
      '1·1 + 2·0 = 1 — đúng bằng A[0][0] ban đầu. Ma trận đơn vị (đường chéo toàn 1) đóng vai trò "số 1" của phép nhân ma trận: nhân với nó thì ma trận không đổi. Đây là mẹo kiểm tra nhanh code nhân ma trận của bạn có đúng không.',
  },
  parsons: {
    prompt: 'Xếp đúng ba vòng lặp nhân ma trận: hàng A → cột B → cộng dồn tích vô hướng.',
    lines: [
      'for i in range(len(A)):',
      '    hang = []',
      '    for j in range(len(B[0])):',
      '        tong = 0.0',
      '        for k in range(len(B)):',
      '            tong += A[i][k] * B[k][j]',
      '        hang.append(tong)',
      '    print(",".join(str(v) for v in hang))',
    ],
  },
  make: {
    prompt:
      'Tự cài phép nhân ma trận bằng ba vòng lặp Python thuần (KHÔNG numpy).\n\nĐỊNH DẠNG input(): mỗi ma trận nằm trên MỘT dòng; các HÀNG cách nhau bởi dấu chấm phẩy ";", các phần tử trong một hàng cách nhau bởi dấu phẩy ",". Ví dụ "1,2;3,4" là ma trận [[1,2],[3,4]].\n\nChương trình đọc 2 dòng input(): ma trận A rồi ma trận B (đề luôn cho kích thước nhân được).\n\nIn kết quả A × B: MỖI HÀNG một dòng, các phần tử cách nhau dấu phẩy, KHÔNG có dấu cách. Đọc số bằng float().\n\nVí dụ A = "1,2;3,4", B = "5,6;7,8" → in 2 dòng:\n19.0,22.0\n43.0,50.0',
    starterCode: `def doc(s):\n    return [[float(x) for x in hang.split(",")] for hang in s.split(";")]\n\nA = doc(input("Ma tran A: "))\nB = doc(input("Ma tran B: "))\n# n = len(A) hang cua A, m = len(B) hang cua B, p = len(B[0]) cot cua B\n# Ba vong lap i, j, k roi in tung hang bang ",".join(str(v) for v in hang)\n`,
    testCases: [
      {
        stdinLines: ['1,2;3,4', '5,6;7,8'],
        expected: '19.0,22.0\n43.0,50.0',
        match: 'contains',
        hidden: false,
        label: 'Hai ma trận 2×2 kinh điển',
      },
      {
        stdinLines: ['1,0;0,1', '2,3;4,5'],
        expected: '2.0,3.0\n4.0,5.0',
        match: 'contains',
        hidden: false,
        label: 'Nhân với ma trận đơn vị → giữ nguyên B',
      },
      {
        stdinLines: ['1,2,3', '1;1;1'],
        expected: '6.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: (1×3) nhân (3×1) → kết quả 1×1 là 6.0',
      },
    ],
    hints: [
      'Đọc ma trận: tách hàng bằng s.split(";") trước, rồi tách phần tử mỗi hàng bằng .split(",").',
      'Kích thước: số hàng kết quả = len(A), số cột kết quả = len(B[0]), vòng trong chạy len(B) lần (số hàng của B = số cột của A).',
      'ĐỪNG cứng hoá số 2: dùng đúng len(A), len(B), len(B[0]) thì ca ẩn ma trận không vuông mới chạy được.',
    ],
    sampleSolution: `def doc(s):\n    return [[float(x) for x in hang.split(",")] for hang in s.split(";")]\n\nA = doc(input("Ma tran A: "))\nB = doc(input("Ma tran B: "))\nn = len(A)\nm = len(B)\np = len(B[0])\nfor i in range(n):\n    hang = []\n    for j in range(p):\n        tong = 0.0\n        for k in range(m):\n            tong += A[i][k] * B[k][j]\n        hang.append(tong)\n    print(",".join(str(v) for v in hang))`,
  },
  homework:
    'Dùng code của bạn kiểm hai điều bằng thực nghiệm: (1) nhân ma trận KHÔNG giao hoán — chạy "1,2;3,4" × "5,6;7,8" rồi đổi thứ tự hai ma trận, kết quả có giống nhau không? (2) Thử nhân một ma trận 2×3 với một ma trận 2×3 xem chương trình gãy ở đâu, rồi giải thích bằng lời quy tắc "số cột của A phải bằng số hàng của B". Cuối cùng đếm xem nhân hai ma trận 1000×1000 cần bao nhiêu phép nhân (đáp: 10⁹ — nay bạn hiểu vì sao AI cần GPU).',
  srsCards: [
    {
      hoi: 'Phần tử C[i][j] của tích hai ma trận được tính thế nào?',
      dap: 'Bằng tích vô hướng của HÀNG i trong A với CỘT j trong B: tổng của A[i][k]·B[k][j] khi k chạy hết chiều chung. Cài bằng ba vòng lặp lồng nhau i (hàng A), j (cột B), k (cộng dồn).',
    },
    {
      hoi: 'Quy tắc kích thước khi nhân ma trận?',
      dap: 'A cỡ (n×m) nhân được với B cỡ (m×p) — số CỘT của A phải bằng số HÀNG của B — và kết quả có cỡ (n×p). Lệch kích thước là lỗi "shape mismatch", lỗi phổ biến nhất khi làm mạng nơ-ron.',
    },
    {
      hoi: 'Vì sao AI chạy trên GPU lại nhanh hơn hẳn CPU?',
      dap: 'Vì lõi tính toán của mạng nơ-ron là nhân ma trận (mỗi lớp = đầu vào × trọng số), gồm hàng tỷ phép nhân-cộng ĐỘC LẬP nhau; GPU có hàng nghìn nhân song song nên làm chúng cùng lúc, còn CPU làm gần như tuần tự.',
    },
  ],
}
```

### Bài 8 — `mathai-u2-l3`

```typescript
{
  id: 'mathai-u2-l3',
  unitId: 'mathai-u2',
  language: 'python',
  title: 'Cosine similarity — đo độ giống nhau, nền của embedding và RAG',
  hook: 'Bạn hỏi chatbot công ty "chính sách nghỉ phép thế nào?", nó lục đúng đoạn tài liệu cần trong 500 trang. Nó không dò từ khoá — nó biến câu hỏi và từng đoạn văn thành vector rồi đo GÓC giữa chúng. Phép đo đó tên là cosine similarity, và hôm nay bạn tự cài nó.',
  theory:
    'Tích vô hướng có một tật: vector nào cũng DÀI thì tích vô hướng cũng to, dù hai vector chẳng cùng hướng lắm. Muốn đo riêng phần "cùng hướng", ta chia cho độ dài của cả hai:\n\ncosine(a, b) = (a · b) / (|a| × |b|)\n\nĐây đúng là cos của GÓC giữa hai vector, nên nó luôn nằm trong đoạn từ -1 đến 1:\n- 1 = cùng hướng hoàn toàn (rất giống nhau),\n- 0 = vuông góc (không liên quan),\n- -1 = ngược hướng hoàn toàn.\n\nĐiểm mấu chốt: cosine BỎ QUA ĐỘ DÀI, chỉ giữ HƯỚNG. Hai vector [1,2,3] và [2,4,6] có cosine = 1 vì cùng hướng, dù cái sau dài gấp đôi. Trong xử lý văn bản, điều đó nghĩa là: một bài dài 2.000 từ và một bài 200 từ nói cùng chủ đề vẫn được coi là giống nhau — thứ mà tích vô hướng trần trụi không làm nổi.\n\nEMBEDDING là cách AI biến một từ / câu / bức ảnh thành vector vài trăm tới vài nghìn chiều, sao cho những thứ có nghĩa gần nhau thì vector nằm gần nhau về hướng. Ghép hai thứ lại thành công thức làm nên nửa số sản phẩm AI hiện nay:\n- TÌM KIẾM NGỮ NGHĨA / RAG: nhúng câu hỏi thành vector, tính cosine với mọi đoạn tài liệu, lấy vài đoạn cao điểm nhất đưa cho LLM đọc.\n- HỆ GỢI Ý: hai người xem phim giống nhau thì vector sở thích có cosine cao.\n- CHỐNG ĐẠO VĂN, gom cụm tin tức, khử trùng lặp dữ liệu.\n\nKhoá llmagent (khoá 06 của cụm) cài RAG mini bằng đúng hàm bạn viết hôm nay.',
  workedExample: {
    code: `def cosine(a, b):
    dot = sum(a[i] * b[i] for i in range(len(a)))   # tich vo huong
    do_dai_a = sum(v * v for v in a) ** 0.5          # do dai a
    do_dai_b = sum(v * v for v in b) ** 0.5          # do dai b
    return dot / (do_dai_a * do_dai_b)               # chia de bo do dai

bai_ngan = [1, 2, 3]      # dem tu khoa trong bai ngan
bai_dai = [2, 4, 6]       # cung chu de, bai dai gap doi
bai_khac = [3, 0, 0]      # chu de khac han

print(f"Ngan vs dai: {round(cosine(bai_ngan, bai_dai), 4)}")
print(f"Ngan vs khac: {round(cosine(bai_ngan, bai_khac), 4)}")
print(f"Tich vo huong ngan-dai: {sum(bai_ngan[i] * bai_dai[i] for i in range(3))}")`,
    stdinLines: [],
  },
  predict: {
    code: `a = [3, 0]\nb = [6, 0]\ndot = a[0] * b[0] + a[1] * b[1]\ndo_a = (a[0] ** 2 + a[1] ** 2) ** 0.5\ndo_b = (b[0] ** 2 + b[1] ** 2) ** 0.5\nprint(round(dot / (do_a * do_b), 2))`,
    question: 'Cosine giữa [3,0] và [6,0] in ra là bao nhiêu?',
    choices: ['1.0', '18.0', '0.5', '2.0'],
    answerIndex: 0,
    explain:
      'dot = 18, |a| = 3, |b| = 6 → 18 / 18 = 1.0. Hai vector CÙNG HƯỚNG dù cái sau dài gấp đôi, nên cosine đạt tối đa 1.0. Đó chính là điều cosine làm mà tích vô hướng trần (18) không làm được: bỏ ảnh hưởng của độ dài.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính cosine: tích vô hướng → độ dài a → độ dài b → chia → in.',
    lines: [
      'dot = sum(a[i] * b[i] for i in range(len(a)))',
      'do_dai_a = sum(v * v for v in a) ** 0.5',
      'do_dai_b = sum(v * v for v in b) ** 0.5',
      'cos = dot / (do_dai_a * do_dai_b)',
      'print(f"Cosine: {round(cos, 4)}")',
    ],
  },
  make: {
    prompt:
      'Tự cài cosine similarity — hàm bạn sẽ dùng lại ở RAG và hệ gợi ý.\n\nChương trình đọc 2 dòng input(): vector a và vector b, các số cách nhau dấu phẩy, cùng số chiều, và KHÔNG vector nào là vector 0.\n\nIn đúng 1 dòng:\nCosine: <giá trị cosine, làm tròn 4 chữ số bằng round()>\n\nVí dụ "1,0" và "1,0" → "Cosine: 1.0"; "1,1" và "1,0" → "Cosine: 0.7071".',
    starterCode: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\n# dot = sum(a[i] * b[i] for i in range(len(a)))\n# do_dai = sum(v * v for v in ...) ** 0.5 cho tung vector\n# In: Cosine: <round(dot / (do_dai_a * do_dai_b), 4)>\n`,
    testCases: [
      {
        stdinLines: ['1,0', '1,0'],
        expected: 'Cosine: 1.0',
        match: 'contains',
        hidden: false,
        label: 'Hai vector y hệt nhau → 1.0',
      },
      {
        stdinLines: ['1,1', '1,0'],
        expected: 'Cosine: 0.7071',
        match: 'contains',
        hidden: false,
        label: 'Góc 45 độ → 0.7071',
      },
      {
        stdinLines: ['1,2,3', '2,4,6'],
        expected: 'Cosine: 1.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: dài gấp đôi nhưng CÙNG HƯỚNG → vẫn 1.0',
      },
    ],
    hints: [
      'Ba đại lượng cần tính riêng: tích vô hướng, độ dài a, độ dài b. Viết từng dòng, đừng nhồi vào một biểu thức.',
      'Độ dài = sum(v * v for v in a) ** 0.5 — chính là căn của tích vô hướng vector với chính nó.',
      'Cuối cùng chia rồi làm tròn: print(f"Cosine: {round(dot / (do_dai_a * do_dai_b), 4)}").',
    ],
    sampleSolution: `a = [float(v) for v in input("Vector a: ").split(",")]\nb = [float(v) for v in input("Vector b: ").split(",")]\ndot = sum(a[i] * b[i] for i in range(len(a)))\ndo_dai_a = sum(v * v for v in a) ** 0.5\ndo_dai_b = sum(v * v for v in b) ** 0.5\nprint(f"Cosine: {round(dot / (do_dai_a * do_dai_b), 4)}")`,
  },
  homework:
    'Làm một cỗ máy tìm kiếm ngữ nghĩa tí hon bằng tay: chọn 3 từ khoá (vd "hoc", "code", "an"), rồi mô tả 4 câu tiếng Việt không dấu bằng vector đếm số lần xuất hiện của 3 từ đó. Lấy một câu làm "câu hỏi", tính cosine với 3 câu còn lại, xếp hạng. Kết quả có hợp trực giác không? Rồi trả lời: nếu hai câu dùng từ KHÁC nhau nhưng nghĩa giống nhau ("hoc bai" vs "on tap"), cách đếm từ khoá này hỏng ở đâu — và vì sao embedding thật giải được?',
  srsCards: [
    {
      hoi: 'Công thức cosine similarity và khoảng giá trị của nó?',
      dap: 'cosine(a,b) = (a·b) / (|a|·|b|) — tích vô hướng chia cho tích hai độ dài. Giá trị luôn nằm trong [-1, 1]: 1 là cùng hướng (rất giống), 0 là vuông góc (không liên quan), -1 là ngược hướng.',
    },
    {
      hoi: 'Cosine hơn tích vô hướng trần ở điểm nào?',
      dap: 'Cosine chuẩn hoá theo độ dài nên chỉ đo HƯỚNG: một văn bản 2.000 từ và một văn bản 200 từ cùng chủ đề vẫn được coi là giống nhau. Tích vô hướng trần thiên vị vector có giá trị lớn, dễ nhầm "to" thành "giống".',
    },
    {
      hoi: 'Embedding + cosine tạo ra những sản phẩm AI nào?',
      dap: 'Tìm kiếm ngữ nghĩa và RAG (nhúng câu hỏi, lấy đoạn tài liệu có cosine cao nhất cho LLM đọc), hệ gợi ý (sở thích giống nhau về hướng), chống đạo văn, gom cụm tin tức, khử trùng lặp dữ liệu huấn luyện.',
    },
  ],
}
```

### Bài 9 — `mathai-u2-l4`

```typescript
{
  id: 'mathai-u2-l4',
  unitId: 'mathai-u2',
  language: 'python',
  title: 'Trực giác trị riêng & PCA — trục nào giữ được nhiều thông tin nhất',
  hook: 'Chụp cái ghế từ chính diện thì thấy một hình chữ nhật, chụp chéo 45 độ thì nhận ra ngay đó là ghế. Cùng vật thể, cùng số chiều bị mất, mà một góc nhìn giữ được thông tin còn góc kia phá hỏng. PCA là thuật toán đi tìm góc nhìn tốt nhất đó — bằng cách hỏi: trục nào giữ được nhiều PHƯƠNG SAI nhất?',
  theory:
    'Dữ liệu thật thường có rất nhiều chiều (ảnh 28×28 = 784 chiều; embedding = 1.536 chiều). GIẢM CHIỀU là ép nó xuống 2–3 chiều để vẽ được, hoặc xuống vài chục chiều để chạy nhanh hơn — mà mất mát ít nhất.\n\nÝ tưởng cốt lõi của PCA (Principal Component Analysis): THÔNG TIN NẰM Ở CHỖ DỮ LIỆU BIẾN THIÊN. Một cột mà mọi người đều có giá trị y hệt nhau (phương sai 0) chẳng nói lên điều gì — bỏ đi không mất gì. Cột nào dàn trải mạnh mới phân biệt được các mẫu. Vậy nên PCA đi tìm những TRỤC giữ được PHƯƠNG SAI lớn nhất, gọi là các thành phần chính, rồi chiếu dữ liệu lên vài trục đầu.\n\nTRỊ RIÊNG & VECTOR RIÊNG (eigenvalue, eigenvector) là ngôn ngữ toán của việc đó. Với ma trận hiệp phương sai của dữ liệu: mỗi VECTOR RIÊNG là một hướng trục đặc biệt (nhân ma trận vào chỉ co/giãn nó chứ không đổi hướng), và TRỊ RIÊNG đi kèm cho biết trục đó giữ bao nhiêu phương sai. Sắp trị riêng từ lớn xuống nhỏ, lấy vài vector riêng đầu — đó chính là PCA. (Tính trị riêng cho ma trận lớn cần thuật toán số học ngoài phạm vi khoá; ở đây ta nắm TRỰC GIÁC và tự đo phương sai theo trục.)\n\nBài Make hôm nay làm phiên bản tối giản, đúng linh hồn PCA: cho các điểm 2 chiều, đo phương sai theo trục X và theo trục Y, rồi chọn trục giữ nhiều thông tin hơn — tức là nếu buộc phải vứt một chiều, ta biết vứt chiều nào.\n\nLƯU Ý bắt buộc: PCA rất nhạy với THANG ĐO, nên phải chuẩn hoá dữ liệu (z-score, bài mathai-u1-l5) TRƯỚC khi chạy, nếu không cột có đơn vị lớn sẽ tự động chiếm hết phương sai. Nối tiếp: bài ml-u2-l3 của khoá Học máy dùng PCA để nén dữ liệu trước khi gom cụm.',
  workedExample: {
    code: `# 4 diem trai rong theo truc X, hep theo truc Y
diem = [[0, 0], [4, 0], [0, 1], [4, 1]]

xs = [p[0] for p in diem]      # tach rieng toa do x
ys = [p[1] for p in diem]      # tach rieng toa do y

def phuong_sai(ds):
    tb = sum(ds) / len(ds)
    return sum((v - tb) ** 2 for v in ds) / len(ds)

vx = phuong_sai(xs)
vy = phuong_sai(ys)
print(f"Phuong sai theo X: {vx}")
print(f"Phuong sai theo Y: {vy}")
# Neu buoc phai bo mot chieu, bo chieu giu it phuong sai hon
print("Giu lai truc: X" if vx >= vy else "Giu lai truc: Y")`,
    stdinLines: [],
  },
  predict: {
    code: `ds = [0, 4, 0, 4]\ntb = sum(ds) / len(ds)\nprint(sum((v - tb) ** 2 for v in ds) / len(ds))`,
    question: 'Phương sai của dãy toạ độ [0, 4, 0, 4] in ra là bao nhiêu?',
    choices: ['4.0', '2.0', '8.0', '16.0'],
    answerIndex: 0,
    explain:
      'Trung bình = 2.0; mỗi giá trị lệch 2 nên bình phương lệch = 4, có 4 phần tử → 16/4 = 4.0. Trục này dàn trải mạnh nên giữ nhiều thông tin — đó đúng là tiêu chí PCA dùng để chọn giữ trục nào.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự đo trục nào giữ nhiều thông tin: tách toạ độ → tính phương sai → so sánh.',
    lines: [
      'xs = [p[0] for p in diem]',
      'ys = [p[1] for p in diem]',
      'vx = phuong_sai(xs)',
      'vy = phuong_sai(ys)',
      'print(f"Phuong sai truc X: {round(vx, 4)}")',
      'print(f"Phuong sai truc Y: {round(vy, 4)}")',
      'print("Truc giu nhieu thong tin hon: " + ("X" if vx >= vy else "Y"))',
    ],
  },
  make: {
    prompt:
      'Cài phiên bản tối giản của PCA: đo phương sai theo từng trục rồi chọn trục giữ nhiều thông tin hơn.\n\nChương trình đọc 1 dòng input(): các điểm 2 chiều, mỗi điểm là "x,y", các ĐIỂM cách nhau bởi dấu chấm phẩy ";". Ví dụ "0,0;4,0;0,1;4,1".\n\nIn đúng 3 dòng:\nPhuong sai truc X: <phương sai của các hoành độ, round 4 chữ số>\nPhuong sai truc Y: <phương sai của các tung độ, round 4 chữ số>\nTruc giu nhieu thong tin hon: X hoặc Y\n\nLUẬT CHỌN: in "X" nếu phương sai trục X LỚN HƠN HOẶC BẰNG trục Y, ngược lại in "Y" (bằng nhau thì chọn X).\n\nDùng phương sai chia cho n như bài mathai-u1-l3.',
    starterCode: `diem = [[float(v) for v in p.split(",")] for p in input("Cac diem: ").split(";")]\nxs = [p[0] for p in diem]\nys = [p[1] for p in diem]\n# Viet ham phuong_sai(ds) roi tinh vx, vy\n# In 3 dong theo dung dinh dang de bai\n`,
    testCases: [
      {
        stdinLines: ['0,0;4,0;0,1;4,1'],
        expected: 'Phuong sai truc X: 4.0\nPhuong sai truc Y: 0.25\nTruc giu nhieu thong tin hon: X',
        match: 'contains',
        hidden: false,
        label: 'Trải rộng theo X → giữ trục X',
      },
      {
        stdinLines: ['0,0;0,4;1,0;1,4'],
        expected: 'Phuong sai truc X: 0.25\nPhuong sai truc Y: 4.0\nTruc giu nhieu thong tin hon: Y',
        match: 'contains',
        hidden: false,
        label: 'Trải rộng theo Y → giữ trục Y',
      },
      {
        stdinLines: ['1,1;2,2;3,3'],
        expected: 'Truc giu nhieu thong tin hon: X',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: hai trục phương sai BẰNG NHAU → luật chọn X',
      },
    ],
    hints: [
      'Tách chuỗi hai tầng: trước hết split(";") lấy từng điểm, sau đó split(",") lấy x và y của điểm đó.',
      'Viết hàm phuong_sai(ds) dùng lại từ bài mathai-u1-l3: tính trung bình, rồi sum((v - tb) ** 2) / len(ds).',
      'So sánh phải là vx >= vy (lớn hơn HOẶC BẰNG) thì ca hai trục bằng nhau mới cho ra "X" như đề yêu cầu.',
    ],
    sampleSolution: `diem = [[float(v) for v in p.split(",")] for p in input("Cac diem: ").split(";")]\nxs = [p[0] for p in diem]\nys = [p[1] for p in diem]\n\ndef phuong_sai(ds):\n    tb = sum(ds) / len(ds)\n    return sum((v - tb) ** 2 for v in ds) / len(ds)\n\nvx = phuong_sai(xs)\nvy = phuong_sai(ys)\nprint(f"Phuong sai truc X: {round(vx, 4)}")\nprint(f"Phuong sai truc Y: {round(vy, 4)}")\nprint("Truc giu nhieu thong tin hon: " + ("X" if vx >= vy else "Y"))`,
  },
  homework:
    'Vẽ ra giấy tập điểm "1,1;2,2;3,3" — chúng nằm trên một đường chéo. Chương trình nói hai trục X và Y giữ phương sai BẰNG NHAU, nhưng rõ ràng có một trục tốt hơn hẳn cả hai: chính đường chéo đó (chiếu lên nó thì không mất gì, vì các điểm thẳng hàng). Viết 4–5 câu giải thích: vì sao PCA thật KHÔNG chỉ so trục X với trục Y mà đi tìm hướng bất kỳ, và trị riêng đóng vai trò gì trong việc đó?',
  srsCards: [
    {
      hoi: 'PCA chọn giữ lại trục nào và theo tiêu chí gì?',
      dap: 'Giữ những trục (thành phần chính) có PHƯƠNG SAI lớn nhất, vì thông tin nằm ở chỗ dữ liệu biến thiên — chiều mà mọi mẫu gần như giống nhau thì bỏ đi gần như không mất gì.',
    },
    {
      hoi: 'Vector riêng và trị riêng đóng vai trò gì trong PCA?',
      dap: 'Với ma trận hiệp phương sai của dữ liệu, mỗi VECTOR RIÊNG là một hướng trục đặc biệt (phép nhân chỉ co/giãn chứ không xoay nó), còn TRỊ RIÊNG đi kèm cho biết trục đó giữ bao nhiêu phương sai. Sắp trị riêng giảm dần rồi lấy vài vector riêng đầu chính là PCA.',
    },
    {
      hoi: 'Vì sao phải chuẩn hoá dữ liệu trước khi chạy PCA?',
      dap: 'Vì PCA đi theo phương sai, mà phương sai phụ thuộc đơn vị đo: cột tính bằng đồng (hàng triệu) sẽ tự động nuốt hết phương sai so với cột tính bằng năm. Chuẩn hoá z-score đưa mọi cột về cùng thang trước khi so.',
    },
  ],
}
```

---

## C3 — Giải tích & tối ưu hoá (`mathai-u3`, 4 bài)

### Bài 10 — `mathai-u3-l1`

```typescript
{
  id: 'mathai-u3-l1',
  unitId: 'mathai-u3',
  language: 'python',
  title: 'Đạo hàm = tốc độ đổi — tự cài đạo hàm số (finite difference)',
  hook: 'Đồng hồ tốc độ trên xe máy chính là một cái máy tính đạo hàm: nó không đo bạn đã đi bao xa, nó đo quãng đường đang ĐỔI nhanh cỡ nào. Học máy sống bằng đúng câu hỏi đó — "nhích trọng số một tí thì sai số đổi bao nhiêu?" — và câu trả lời tên là đạo hàm.',
  theory:
    'ĐẠO HÀM của hàm f tại điểm x là TỐC ĐỘ ĐỔI của f quanh x: nhích x lên một chút thì f nhích bao nhiêu, tính trên mỗi đơn vị nhích. Hình học: độ dốc của tiếp tuyến tại điểm đó.\n\nĐịnh nghĩa giới hạn: f\'(x) = lim(h→0) [f(x+h) - f(x)] / h. Máy tính không làm được "h tiến tới 0", nên ta lấy h NHỎ và tính xấp xỉ — gọi là ĐẠO HÀM SỐ (numerical differentiation / finite difference):\n\n- Sai phân TIẾN: (f(x+h) - f(x)) / h — đơn giản, sai số cỡ h.\n- Sai phân TRUNG TÂM: (f(x+h) - f(x-h)) / (2h) — nhìn cả hai bên, sai số cỡ h², chính xác hơn hẳn với cùng h. Khoá này dùng bản trung tâm.\n\nBa đạo hàm phải thuộc (kiểm lại được bằng code): f(x) = x² → f\'(x) = 2x; f(x) = x → f\'(x) = 1; f(x) = hằng số → f\'(x) = 0. Cộng lại thì đạo hàm cũng cộng, nên f(x) = x² + 3x → f\'(x) = 2x + 3.\n\nBẪY CHỌN h: h quá lớn thì công thức xấp xỉ thô, sai; h quá nhỏ (vd 1e-15) thì f(x+h) và f(x-h) gần bằng nhau tới mức số thực máy tính làm tròn mất phần chênh — kết quả nhiễu loạn. Vùng an toàn thực hành: h khoảng 1e-4 đến 1e-6.\n\nVÌ SAO AI CẦN: huấn luyện mô hình = tìm bộ trọng số làm hàm mất mát nhỏ nhất, và cách đi tới đó là hỏi đạo hàm "nghiêng về phía nào thì lỗi giảm". Thư viện thật (PyTorch) dùng AUTOGRAD — tính đạo hàm chính xác bằng quy tắc chuỗi thay vì xấp xỉ số — nhưng đạo hàm số vẫn được dùng để KIỂM TRA cài đặt autograd có đúng không (gradient checking).',
  workedExample: {
    code: `def f(x):
    return x * x + 3 * x        # f(x) = x^2 + 3x, dao ham that la 2x + 3

def dao_ham_tien(x, h):
    return (f(x + h) - f(x)) / h              # sai phan tien

def dao_ham_trung_tam(x, h):
    return (f(x + h) - f(x - h)) / (2 * h)    # sai phan trung tam

x = 2.0                          # dao ham that tai day: 2*2 + 3 = 7
print(f"That: {2 * x + 3}")
print(f"Tien h=0.1: {round(dao_ham_tien(x, 0.1), 6)}")
print(f"Trung tam h=0.1: {round(dao_ham_trung_tam(x, 0.1), 6)}")
print(f"Tien h=0.001: {round(dao_ham_tien(x, 0.001), 6)}")`,
    stdinLines: [],
  },
  predict: {
    code: `def f(x):\n    return x * x\nh = 0.1\nprint(round((f(3 + h) - f(3)) / h, 2))`,
    question: 'Sai phân TIẾN của f(x) = x² tại x = 3 với h = 0.1 in ra bao nhiêu?',
    choices: ['6.1', '6.0', '9.61', '0.61'],
    answerIndex: 0,
    explain:
      '(3.1² − 3²)/0.1 = (9.61 − 9)/0.1 = 0.61/0.1 = 6.1. Đạo hàm THẬT là 2·3 = 6.0, nên xấp xỉ tiến lệch đúng 0.1 = h. Đó là lý do sai phân trung tâm được ưa hơn: cùng h nhưng sai số nhỏ hơn nhiều vì nó cân hai bên.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính đạo hàm số bằng sai phân trung tâm.',
    lines: [
      'def f(x):',
      '    return x * x + 3 * x',
      'x = float(input("Diem x: "))',
      'h = float(input("Buoc h: "))',
      'dao_ham = (f(x + h) - f(x - h)) / (2 * h)',
      'print(f"Dao ham xap xi: {round(dao_ham, 4)}")',
    ],
  },
  make: {
    prompt:
      'Tự cài máy tính đạo hàm số bằng SAI PHÂN TRUNG TÂM.\n\nHàm cố định của bài: f(x) = x*x + 3*x (đạo hàm thật là 2x + 3 — dùng để tự kiểm).\n\nChương trình đọc 2 dòng input(): điểm x và bước h (đều là số thực).\n\nIn đúng 1 dòng:\nDao ham xap xi: <(f(x+h) - f(x-h)) / (2*h), làm tròn 4 chữ số bằng round()>\n\nVí dụ x = 2, h = 0.001 → "Dao ham xap xi: 7.0".',
    starterCode: `def f(x):\n    return x * x + 3 * x\n\nx = float(input("Diem x: "))\nh = float(input("Buoc h: "))\n# dao_ham = (f(x + h) - f(x - h)) / (2 * h)\n# In: Dao ham xap xi: <lam tron 4 chu so>\n`,
    testCases: [
      {
        stdinLines: ['2', '0.001'],
        expected: 'Dao ham xap xi: 7.0',
        match: 'contains',
        hidden: false,
        label: 'x = 2 → đạo hàm thật 2·2 + 3 = 7.0',
      },
      {
        stdinLines: ['0', '0.01'],
        expected: 'Dao ham xap xi: 3.0',
        match: 'contains',
        hidden: false,
        label: 'x = 0 → đạo hàm 3.0 (phần 2x biến mất)',
      },
      {
        stdinLines: ['2', '0.5'],
        expected: 'Dao ham xap xi: 7.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: h TO tận 0.5 mà sai phân trung tâm vẫn đúng với hàm bậc 2',
      },
    ],
    hints: [
      'Định nghĩa hàm f trước, rồi mới gọi f(x + h) và f(x - h) — đừng viết lại công thức x*x + 3*x hai lần.',
      'Mẫu số là 2 * h chứ không phải h: sai phân trung tâm đi từ x-h tới x+h nên quãng đường là 2h.',
      'In đúng định dạng: print(f"Dao ham xap xi: {round(dao_ham, 4)}").',
    ],
    sampleSolution: `def f(x):\n    return x * x + 3 * x\n\nx = float(input("Diem x: "))\nh = float(input("Buoc h: "))\ndao_ham = (f(x + h) - f(x - h)) / (2 * h)\nprint(f"Dao ham xap xi: {round(dao_ham, 4)}")`,
  },
  homework:
    'Chạy chương trình tại x = 2 với h = 0.1, 0.001, 1e-8, 1e-14 và ghi lại 4 kết quả (bỏ round để thấy đủ chữ số). Đạo hàm thật là 7. h nhỏ dần thì kết quả tốt lên tới một mức nào rồi bắt đầu TỆ ĐI — vì sao? (Gợi ý: số thực trong máy tính chỉ giữ được khoảng 16 chữ số có nghĩa, nên f(x+h) và f(x-h) quá gần nhau thì phần chênh bị làm tròn mất.) Viết 3 câu kết luận về vùng h an toàn.',
  srsCards: [
    {
      hoi: 'Đạo hàm của một hàm tại điểm x nói lên điều gì?',
      dap: 'Tốc độ đổi của hàm quanh điểm đó — nhích x một đơn vị thì f đổi bao nhiêu; hình học là độ dốc của tiếp tuyến. Dấu dương nghĩa là hàm đang tăng, âm là đang giảm, bằng 0 là điểm bằng phẳng (cực trị hoặc yên ngựa).',
    },
    {
      hoi: 'Công thức sai phân trung tâm và ưu điểm so với sai phân tiến?',
      dap: 'Trung tâm: (f(x+h) − f(x−h)) / (2h); tiến: (f(x+h) − f(x)) / h. Trung tâm nhìn cân cả hai bên nên sai số cỡ h² thay vì h — với cùng bước h thì chính xác hơn hẳn, thậm chí đúng tuyệt đối với hàm bậc hai.',
    },
    {
      hoi: 'Vì sao chọn h quá nhỏ lại làm đạo hàm số sai?',
      dap: 'Vì số thực máy tính chỉ giữ ~16 chữ số có nghĩa: h quá nhỏ thì f(x+h) và f(x−h) gần bằng nhau tới mức phần chênh bị làm tròn mất, chia cho 2h càng khuếch đại nhiễu. Vùng thực hành an toàn khoảng 1e-4 đến 1e-6.',
    },
  ],
}
```

### Bài 11 — `mathai-u3-l2`

```typescript
{
  id: 'mathai-u3-l2',
  unitId: 'mathai-u3',
  language: 'python',
  title: 'Đạo hàm riêng & gradient — mũi tên chỉ hướng dốc nhất',
  hook: 'Đứng giữa sườn đồi trong sương mù dày, muốn xuống nhanh nhất thì làm gì? Dùng chân dò: bước sang đông dốc bao nhiêu, bước sang bắc dốc bao nhiêu. Ghép hai con số đó thành một mũi tên — đó chính là GRADIENT, và mọi mô hình AI trên đời đều được huấn luyện bằng đúng động tác dò chân này.',
  theory:
    'Hàm thật trong học máy có hàng triệu biến (mỗi trọng số là một biến). Với hàm nhiều biến, ĐẠO HÀM RIÊNG theo một biến = đạo hàm khi COI MỌI BIẾN KHÁC LÀ HẰNG SỐ. Ký hiệu ∂f/∂x đọc là "đạo hàm riêng của f theo x".\n\nVí dụ f(x, y) = x² + 3y²:\n- ∂f/∂x = 2x (coi y đứng yên, phần 3y² thành hằng số nên đạo hàm 0),\n- ∂f/∂y = 6y (coi x đứng yên).\n\nGRADIENT là VECTOR gom tất cả đạo hàm riêng lại: grad f = [∂f/∂x, ∂f/∂y]. Hai tính chất làm nên toàn bộ huấn luyện AI:\n1. Gradient chỉ hướng hàm TĂNG NHANH NHẤT tại điểm đó. Muốn GIẢM thì đi NGƯỢC gradient — đó là "gradient descent" của bài sau.\n2. Độ dài gradient cho biết dốc cỡ nào. Gradient bằng vector 0 nghĩa là đang ở chỗ bằng phẳng: đáy, đỉnh, hoặc điểm yên ngựa.\n\nHình dung MẶT LỖI (loss surface): với 2 biến, hàm mất mát là một mặt đồi trong không gian 3 chiều; huấn luyện là đi bộ trên mặt đồi đó tìm đáy. Với hàng triệu biến thì không vẽ được nữa, nhưng công thức vẫn y hệt — đây là lý do người ta luôn dạy bằng ví dụ 2 biến.\n\nTính gradient bằng đạo hàm số: làm sai phân trung tâm cho TỪNG biến, mỗi lần chỉ nhích đúng biến đó, các biến khác giữ nguyên. Với n biến thì tốn 2n lần gọi hàm — quá đắt cho mạng nơ-ron thật (hàng triệu biến), nên PyTorch dùng lan truyền ngược (backpropagation) tính toàn bộ gradient trong MỘT lượt. Nhưng bản số này vẫn là công cụ kiểm tra chuẩn khi nghi cài sai.',
  workedExample: {
    code: `def f(x, y):
    return x * x + 3 * y * y     # dao ham rieng that: 2x va 6y

h = 0.001
x, y = 1.0, 2.0

# Nhich RIENG x, giu y dung yen
gx = (f(x + h, y) - f(x - h, y)) / (2 * h)
# Nhich RIENG y, giu x dung yen
gy = (f(x, y + h) - f(x, y - h)) / (2 * h)

print(f"Dao ham rieng theo x: {round(gx, 4)} (that: {2 * x})")
print(f"Dao ham rieng theo y: {round(gy, 4)} (that: {6 * y})")
print(f"Gradient: [{round(gx, 4)}, {round(gy, 4)}]")
do_doc = (gx * gx + gy * gy) ** 0.5      # do dai gradient = do doc
print(f"Do doc tai day: {round(do_doc, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `def f(x, y):\n    return x * x + 3 * y * y\nh = 0.001\nprint(round((f(1, 1 + h) - f(1, 1 - h)) / (2 * h), 2))`,
    question: 'Đạo hàm riêng theo y tại điểm (1, 1) in ra bao nhiêu?',
    choices: ['6.0', '2.0', '4.0', '8.0'],
    answerIndex: 0,
    explain:
      'Đạo hàm riêng theo y của x² + 3y² là 6y, tại y = 1 cho 6.0. Chú ý phần x² hoàn toàn biến mất vì khi nhích y ta GIỮ x = 1 đứng yên, nên nó là hằng số và không đóng góp gì vào độ chênh.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính gradient 2 biến: nhích riêng x → nhích riêng y → in vector.',
    lines: [
      'def f(x, y):',
      '    return x * x + 3 * y * y',
      'gx = (f(x + h, y) - f(x - h, y)) / (2 * h)',
      'gy = (f(x, y + h) - f(x, y - h)) / (2 * h)',
      'print(f"Gradient: {round(gx, 4)},{round(gy, 4)}")',
    ],
  },
  make: {
    prompt:
      'Tự cài máy tính GRADIENT cho hàm 2 biến bằng sai phân trung tâm.\n\nHàm cố định của bài: f(x, y) = x*x + 3*y*y (gradient thật là [2x, 6y] — dùng để tự kiểm).\n\nChương trình đọc 3 dòng input(): x, y rồi h (đều là số thực).\n\nIn đúng 1 dòng:\nGradient: <đạo hàm riêng theo x>,<đạo hàm riêng theo y>\n\nHai thành phần cách nhau ĐÚNG một dấu phẩy, không dấu cách, mỗi thành phần làm tròn 4 chữ số bằng round().\n\nVí dụ x = 1, y = 1, h = 0.001 → "Gradient: 2.0,6.0".',
    starterCode: `def f(x, y):\n    return x * x + 3 * y * y\n\nx = float(input("x: "))\ny = float(input("y: "))\nh = float(input("h: "))\n# gx: nhich RIENG x, giu y nguyen. gy: nhich RIENG y, giu x nguyen.\n# In: Gradient: <gx>,<gy>\n`,
    testCases: [
      {
        stdinLines: ['1', '1', '0.001'],
        expected: 'Gradient: 2.0,6.0',
        match: 'contains',
        hidden: false,
        label: 'Tại (1,1) → [2·1, 6·1] = [2.0, 6.0]',
      },
      {
        stdinLines: ['0', '2', '0.001'],
        expected: 'Gradient: 0.0,12.0',
        match: 'contains',
        hidden: false,
        label: 'x = 0 → thành phần x bằng 0.0, y = 2 → 12.0',
      },
      {
        stdinLines: ['-2', '0', '0.01'],
        expected: 'Gradient: -4.0,0.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: x ÂM → gradient âm; y = 0 → đang ở đáy theo trục y',
      },
    ],
    hints: [
      'Mỗi đạo hàm riêng chỉ nhích ĐÚNG MỘT biến: f(x + h, y) và f(x - h, y) cho gx — y giữ nguyên ở cả hai lần gọi.',
      'Tương tự gy dùng f(x, y + h) và f(x, y - h); cả hai đều chia cho 2 * h.',
      'In một dòng duy nhất: print(f"Gradient: {round(gx, 4)},{round(gy, 4)}") — không thêm dấu cách sau dấu phẩy.',
    ],
    sampleSolution: `def f(x, y):\n    return x * x + 3 * y * y\n\nx = float(input("x: "))\ny = float(input("y: "))\nh = float(input("h: "))\ngx = (f(x + h, y) - f(x - h, y)) / (2 * h)\ngy = (f(x, y + h) - f(x, y - h)) / (2 * h)\nprint(f"Gradient: {round(gx, 4)},{round(gy, 4)}")`,
  },
  homework:
    'Chạy chương trình tại 5 điểm: (3,3), (1,1), (0.1,0.1), (0,0) và (-1,-1). Với mỗi điểm, ghi lại gradient và tính độ dài của nó. Bạn thấy quy luật gì khi tiến về gốc toạ độ (0,0)? Rồi trả lời bằng lời: nếu ta luôn bước NGƯỢC hướng gradient một đoạn tỷ lệ với chính gradient, thì càng gần đáy các bước sẽ càng thế nào — và vì sao đó là tính chất tuyệt vời cho một thuật toán huấn luyện?',
  srsCards: [
    {
      hoi: 'Đạo hàm riêng theo một biến nghĩa là gì?',
      dap: 'Là đạo hàm của hàm khi COI MỌI BIẾN KHÁC LÀ HẰNG SỐ — chỉ nhích đúng biến đang xét. Ví dụ f(x,y) = x² + 3y² có ∂f/∂x = 2x (phần 3y² thành hằng nên biến mất) và ∂f/∂y = 6y.',
    },
    {
      hoi: 'Gradient là gì và hai tính chất quan trọng nhất của nó?',
      dap: 'Gradient là vector gom mọi đạo hàm riêng: [∂f/∂x, ∂f/∂y, ...]. (1) Nó chỉ hướng hàm TĂNG nhanh nhất, nên muốn giảm thì đi ngược lại; (2) độ dài của nó cho biết độ dốc — gradient bằng 0 nghĩa là đang ở chỗ bằng phẳng (đáy, đỉnh hoặc yên ngựa).',
    },
    {
      hoi: 'Vì sao mạng nơ-ron thật không tính gradient bằng sai phân số?',
      dap: 'Vì sai phân số cần 2 lần gọi hàm cho MỖI biến, mà mô hình có hàng triệu tới hàng tỷ trọng số. Thay vào đó dùng lan truyền ngược (backpropagation) tính toàn bộ gradient chính xác trong một lượt; sai phân số chỉ dùng để kiểm tra cài đặt (gradient checking).',
    },
  ],
}
```

### Bài 12 — `mathai-u3-l3`

```typescript
{
  id: 'mathai-u3-l3',
  unitId: 'mathai-u3',
  language: 'python',
  title: 'Gradient descent tự cài — và learning rate quá to thì văng',
  hook: 'Bịt mắt thả vào một cái bát khổng lồ, làm sao xuống đáy? Dò chân tìm hướng dốc, bước một bước, dò lại, bước tiếp. Bước quá bé thì tới Tết chưa xuống; bước quá to thì nhảy vọt qua đáy sang thành bên kia rồi văng cao hơn cũ. Toàn bộ nghề huấn luyện AI nằm trong hai câu đó.',
  theory:
    'GRADIENT DESCENT là thuật toán tối ưu chạy trong mọi mô hình học sâu. Vòng lặp đúng ba bước, lặp đi lặp lại:\n1. Tính gradient của hàm mất mát tại vị trí hiện tại.\n2. Bước NGƯỢC hướng gradient một đoạn tỷ lệ với nó: x_moi = x - lr * gradient.\n3. Lặp lại cho tới khi hết số bước cho phép hoặc gradient đủ nhỏ.\n\nLEARNING RATE (lr, tốc độ học) là hệ số quyết định bước dài bao nhiêu — siêu tham số quan trọng bậc nhất của cả ngành:\n- lr quá NHỎ: hội tụ đúng nhưng chậm lê thê, có khi hết ngân sách tính toán vẫn chưa tới đáy.\n- lr VỪA: đi nhanh và ổn định về đáy.\n- lr quá LỚN: nhảy vọt qua đáy, mỗi lần lại xa hơn — sai số PHÂN KỲ (bay lên vô cực, trong thực tế hiện ra thành loss = nan).\n\nTa quan sát rõ điều đó với f(x) = (x-3)², đáy nằm tại x = 3, đạo hàm f\'(x) = 2(x-3). Quy tắc cập nhật x = x - lr·2(x-3) khiến khoảng cách tới đáy nhân với hệ số (1 - 2·lr) sau mỗi bước:\n- lr = 0,1 → hệ số 0,8: khoảng cách co lại 20% mỗi bước, hội tụ mượt.\n- lr = 0,5 → hệ số 0: nhảy thẳng vào đáy sau đúng MỘT bước (may mắn hiếm có, chỉ đúng với parabol này).\n- lr = 1,0 → hệ số -1: nhảy đối xứng qua đáy rồi nhảy về, dao động MÃI MÃI không bao giờ tới.\n- lr > 1,0 → |hệ số| > 1: mỗi bước xa đáy hơn bước trước, văng thẳng.\n\nBa điều thực chiến phải nhớ: (1) mất mát không giảm hoặc ra nan thì việc đầu tiên là GIẢM LEARNING RATE; (2) hàm thật có nhiều ĐÁY ĐỊA PHƯƠNG nên gradient descent chỉ hứa tìm được MỘT đáy, không hứa đáy sâu nhất; (3) các biến thể hiện đại (momentum, Adam) chỉ là cách tự động điều chỉnh bước đi, ruột vẫn là ba bước trên.',
  workedExample: {
    code: `def f(x):
    return (x - 3) ** 2          # day nam tai x = 3

def grad(x):
    return 2 * (x - 3)           # dao ham cua f

x = 0.0                          # diem xuat phat
lr = 0.1                         # learning rate
for buoc in range(5):            # in 5 buoc dau cho thay xu huong
    g = grad(x)
    x = x - lr * g               # buoc NGUOC huong gradient
    print(f"Buoc {buoc + 1}: x = {round(x, 4)}, f(x) = {round(f(x), 4)}")

print(f"Con cach day: {round(abs(x - 3), 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `x = 0.0\nlr = 0.1\ngrad = 2 * (x - 3)\nx = x - lr * grad\nprint(round(x, 2))`,
    question: 'Sau ĐÚNG MỘT bước gradient descent từ x = 0 với lr = 0.1, x bằng bao nhiêu?',
    choices: ['0.6', '-0.6', '3.0', '0.0'],
    answerIndex: 0,
    explain:
      'gradient = 2(0−3) = −6; bước ngược hướng: x = 0 − 0.1·(−6) = 0.6. Gradient ÂM nghĩa là hàm đang giảm khi x tăng, nên đi ngược gradient chính là đi SANG PHẢI — về phía đáy x = 3. Dấu trừ trong công thức lo đúng chuyện đó.',
  },
  parsons: {
    prompt: 'Xếp đúng vòng lặp gradient descent: định nghĩa gradient → lặp cố định số bước → cập nhật → in.',
    lines: [
      'def grad(x):',
      '    return 2 * (x - 3)',
      'for _ in range(20):',
      '    g = grad(x)',
      '    x = x - lr * g',
      'print(f"x cuoi: {round(x, 4)}")',
    ],
  },
  make: {
    prompt:
      'Tự cài gradient descent tìm đáy của f(x) = (x - 3)², với đạo hàm f\'(x) = 2*(x - 3).\n\nChương trình đọc 2 dòng input(): x ban đầu và learning rate (số thực).\n\nChạy ĐÚNG 20 bước lặp (dùng range(20)), mỗi bước cập nhật x = x - lr * 2 * (x - 3).\n\nSau 20 bước in đúng 2 dòng:\nx cuoi: <x làm tròn 4 chữ số bằng round()>\nf(x): <(x - 3) ** 2 làm tròn 4 chữ số>\n\nVí dụ x0 = 10, lr = 0.5 → nhảy thẳng vào đáy: "x cuoi: 3.0" và "f(x): 0.0".',
    starterCode: `x = float(input("x ban dau: "))\nlr = float(input("Learning rate: "))\nfor _ in range(20):\n    grad = 2 * (x - 3)\n    # Cap nhat x nguoc huong gradient\n# In 2 dong ket qua sau vong lap\n`,
    testCases: [
      {
        stdinLines: ['0', '0.1'],
        expected: 'x cuoi: 2.9654\nf(x): 0.0012',
        match: 'contains',
        hidden: false,
        label: 'lr vừa phải → sau 20 bước gần sát đáy 3',
      },
      {
        stdinLines: ['10', '0.5'],
        expected: 'x cuoi: 3.0\nf(x): 0.0',
        match: 'contains',
        hidden: false,
        label: 'lr = 0.5 → nhảy đúng vào đáy ngay bước đầu',
      },
      {
        stdinLines: ['0', '1.0'],
        expected: 'x cuoi: 0.0\nf(x): 9.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: lr = 1.0 → dao động 0 ↔ 6 mãi, KHÔNG hội tụ',
      },
    ],
    hints: [
      'Cập nhật phải là x = x - lr * grad (dấu TRỪ) — cộng vào là leo ngược lên đỉnh, sai số sẽ tăng.',
      'Tính grad = 2 * (x - 3) LẠI Ở MỖI VÒNG bằng x mới nhất; tính một lần ngoài vòng lặp là sai.',
      'Sau vòng lặp mới in: print(f"x cuoi: {round(x, 4)}") rồi print(f"f(x): {round((x - 3) ** 2, 4)}").',
    ],
    sampleSolution: `x = float(input("x ban dau: "))\nlr = float(input("Learning rate: "))\nfor _ in range(20):\n    grad = 2 * (x - 3)\n    x = x - lr * grad\nprint(f"x cuoi: {round(x, 4)}")\nprint(f"f(x): {round((x - 3) ** 2, 4)}")`,
  },
  homework:
    'Chạy chương trình với x0 = 0 và lr lần lượt 0.001, 0.01, 0.1, 0.5, 0.9, 1.0, 1.1 rồi lập bảng 7 dòng (lr, x cuối, f(x)). Đánh dấu vùng nào hội tụ nhanh, vùng nào chậm, vùng nào dao động, vùng nào văng. Bạn vừa tự tay làm cái mà dân nghề gọi là "dò learning rate" — công việc chiếm phần lớn thời gian huấn luyện một mô hình thật. Viết 3 câu kết luận về cách chọn lr.',
  srsCards: [
    {
      hoi: 'Ba bước của một vòng lặp gradient descent?',
      dap: '(1) Tính gradient của hàm mất mát tại vị trí hiện tại; (2) bước NGƯỢC hướng gradient: x = x − lr·gradient; (3) lặp lại tới khi hết số bước hoặc gradient đủ nhỏ. Dấu trừ là thứ biến "leo lên" thành "đi xuống".',
    },
    {
      hoi: 'Learning rate quá lớn và quá nhỏ gây hậu quả gì?',
      dap: 'Quá nhỏ: hội tụ đúng nhưng chậm lê thê, hết ngân sách vẫn chưa tới đáy. Quá lớn: nhảy vọt qua đáy, mỗi bước xa hơn bước trước — mất mát phân kỳ, thực tế hiện ra thành loss = nan. Gặp nan thì việc đầu tiên là giảm learning rate.',
    },
    {
      hoi: 'Gradient descent có hứa tìm được đáy sâu nhất không?',
      dap: 'Không. Hàm mất mát thật có nhiều đáy địa phương và điểm yên ngựa; thuật toán chỉ hứa đi xuống tới MỘT đáy gần nơi xuất phát. Điểm khởi tạo, learning rate và các biến thể (momentum, Adam) ảnh hưởng tới việc rơi vào đáy nào.',
    },
  ],
}
```

### Bài 13 — `mathai-u3-l4`

```typescript
{
  id: 'mathai-u3-l4',
  unitId: 'mathai-u3',
  language: 'python',
  title: 'Tối ưu trong ML thật — MSE, mini-batch, local minimum & tổng kết khoá',
  hook: 'Bạn vừa có đủ bốn mảnh: xác suất để hiểu dữ liệu, vector/ma trận để biểu diễn nó, đạo hàm để biết nghiêng về đâu, gradient descent để đi. Bài cuối này ráp cả bốn lại thành đúng cái vòng lặp mà mọi mô hình AI trên đời đang chạy — rồi chỉ đường bạn đi tiếp.',
  theory:
    'HÀM MẤT MÁT (loss function) là con số đo "mô hình sai bao nhiêu" — thứ mà gradient descent đi tìm đáy. Cho bài đoán số, chuẩn mực là SAI SỐ BÌNH PHƯƠNG TRUNG BÌNH (MSE):\n\nMSE = trung bình của (dự đoán - thực tế)²\n\nBình phương để sai lệch âm/dương không triệt tiêu và để phạt nặng những cú sai lớn — chính là phương sai của sai số (bài mathai-u1-l3). MSE luôn >= 0, bằng 0 khi đoán đúng tuyệt đối. Họ hàng: MAE (trị tuyệt đối, ít nhạy ngoại lai hơn) cho hồi quy, cross-entropy cho phân loại.\n\nGHÉP TOÀN BỘ KHOÁ LẠI — vòng lặp huấn luyện thật:\n1. Lấy dữ liệu, biểu diễn thành ma trận (C2).\n2. Mô hình tính dự đoán bằng phép nhân ma trận (C2).\n3. Hàm mất mát MSE đo sai (C1 + bài này).\n4. Tính gradient của mất mát theo từng trọng số (C3 bài 1–2).\n5. Cập nhật trọng số ngược hướng gradient (C3 bài 3).\n6. Lặp lại vài nghìn lần.\n\nBA KHÁI NIỆM THỰC CHIẾN khép lại khoá:\n- MINI-BATCH: tính gradient trên TOÀN BỘ dữ liệu mỗi bước (batch gradient descent) thì quá chậm với triệu mẫu; tính trên đúng 1 mẫu (stochastic) thì nhiễu loạn. Thực tế lấy từng lô nhỏ 32–256 mẫu — nhanh, và chút nhiễu còn giúp thoát đáy nông. Một EPOCH là một lượt đi hết dữ liệu.\n- LOCAL MINIMUM & YÊN NGỰA: mặt lỗi thật gồ ghề, gradient descent chỉ tìm được một đáy gần nơi xuất phát. Trong không gian nhiều chiều, kẻ cản đường thường là điểm yên ngựa chứ không phải đáy địa phương; momentum/Adam sinh ra để lướt qua chúng.\n- HÀM LỒI (convex): hàm chỉ có ĐÚNG MỘT đáy (như parabol bài trước) — gradient descent luôn tìm ra. Hồi quy tuyến tính, hồi quy logistic thuộc loại này; mạng nơ-ron thì KHÔNG, nên huấn luyện mạng luôn có phần may rủi và phụ thuộc khởi tạo.\n\nĐI TIẾP TỪ ĐÂY: khoá `mlds` (Machine Learning & Data Science) dùng đúng bộ toán này cho pipeline dữ liệu thật; khoá `cv1` cài forward pass MLP/CNN bằng nhân ma trận bạn tự viết; khoá `llmagent` dùng cosine similarity cho RAG. Muốn đào sâu phần toán thuần, đi hướng nền `mathforcode` chặng S4 (giải tích & tối ưu cho AI/ML) của môn Lập trình.',
  workedExample: {
    code: `du_doan = [3.0, 5.0, 7.0]      # mo hinh doan
thuc_te = [3.0, 4.0, 9.0]      # dap an that

tong = 0.0
for i in range(len(thuc_te)):
    sai = du_doan[i] - thuc_te[i]      # sai lech tung mau
    print(f"Mau {i + 1}: sai {sai}, binh phuong {sai ** 2}")
    tong += sai ** 2                    # cong don binh phuong
mse = tong / len(thuc_te)               # trung binh
print(f"MSE: {round(mse, 4)}")

# So voi MAE (tri tuyet doi) de thay MSE phat nang cu sai lon
mae = sum(abs(du_doan[i] - thuc_te[i]) for i in range(3)) / 3
print(f"MAE: {round(mae, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `du_doan = [1.0, 2.0]\nthuc_te = [2.0, 2.0]\nmse = sum((du_doan[i] - thuc_te[i]) ** 2 for i in range(2)) / 2\nprint(mse)`,
    question: 'MSE của hai mẫu này in ra là bao nhiêu?',
    choices: ['0.5', '1.0', '0.0', '2.0'],
    answerIndex: 0,
    explain:
      'Sai lệch là −1 và 0; bình phương thành 1 và 0; trung bình 1/2 = 0.5. Nhớ chia cho SỐ MẪU chứ không phải chỉ cộng lại — nếu không thì tập dữ liệu càng lớn mất mát càng to, so sánh giữa hai tập sẽ vô nghĩa.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính MSE: đọc hai dãy → cộng dồn bình phương sai lệch → chia số mẫu → in.',
    lines: [
      'du_doan = [float(v) for v in input("Du doan: ").split(",")]',
      'thuc_te = [float(v) for v in input("Thuc te: ").split(",")]',
      'n = len(thuc_te)',
      'tong = sum((du_doan[i] - thuc_te[i]) ** 2 for i in range(n))',
      'mse = tong / n',
      'print(f"MSE: {round(mse, 4)}")',
    ],
  },
  make: {
    prompt:
      'Cài hàm mất mát MSE — thước đo mà gradient descent đi tìm đáy.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: các giá trị mô hình DỰ ĐOÁN, cách nhau dấu phẩy.\n- Dòng 2: các giá trị THỰC TẾ, cùng độ dài.\n\nIn đúng 1 dòng:\nMSE: <trung bình của bình phương sai lệch, làm tròn 4 chữ số bằng round()>\n\nVí dụ "1,2,3" và "1,2,4" → sai lệch 0, 0, -1 → MSE = 1/3 → "MSE: 0.3333".',
    starterCode: `du_doan = [float(v) for v in input("Du doan: ").split(",")]\nthuc_te = [float(v) for v in input("Thuc te: ").split(",")]\n# tong = sum((du_doan[i] - thuc_te[i]) ** 2 for i in range(len(thuc_te)))\n# In: MSE: <tong chia so mau, lam tron 4 chu so>\n`,
    testCases: [
      {
        stdinLines: ['1,2,3', '1,2,4'],
        expected: 'MSE: 0.3333',
        match: 'contains',
        hidden: false,
        label: 'Sai đúng 1 đơn vị ở 1 trên 3 mẫu → 0.3333',
      },
      {
        stdinLines: ['5,5', '5,5'],
        expected: 'MSE: 0.0',
        match: 'contains',
        hidden: false,
        label: 'Đoán đúng tuyệt đối → MSE bằng 0.0',
      },
      {
        stdinLines: ['0,0', '3,4'],
        expected: 'MSE: 12.5',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: sai 3 và 4 → (9 + 16)/2 = 12.5, cú sai lớn bị phạt nặng',
      },
    ],
    hints: [
      'Sai lệch từng mẫu là du_doan[i] - thuc_te[i]; bình phương bằng ** 2 để dấu âm không triệt tiêu dấu dương.',
      'Cộng dồn hết rồi mới chia cho SỐ MẪU len(thuc_te) — quên chia thì tập càng lớn mất mát càng to.',
      'In đúng định dạng: print(f"MSE: {round(mse, 4)}").',
    ],
    sampleSolution: `du_doan = [float(v) for v in input("Du doan: ").split(",")]\nthuc_te = [float(v) for v in input("Thuc te: ").split(",")]\nn = len(thuc_te)\ntong = sum((du_doan[i] - thuc_te[i]) ** 2 for i in range(n))\nprint(f"MSE: {round(tong / n, 4)}")`,
  },
  homework:
    'Ráp trọn khoá thành một chương trình duy nhất: dùng hồi quy tuyến tính đơn giản y = a*x (chỉ một tham số a) trên dữ liệu x = [1,2,3], y = [2,4,6]. Viết hàm mat_mat(a) trả về MSE của dự đoán a*x so với y; tính đạo hàm của nó theo a bằng sai phân trung tâm (bài mathai-u3-l1); rồi chạy gradient descent 50 bước từ a = 0 với lr = 0.05. a có tiến về 2.0 không? Đổi lr thành 0.5 xem chuyện gì xảy ra. Bạn vừa tự huấn luyện một mô hình từ đầu tới cuối bằng chính bốn mảnh toán của khoá này.',
  srsCards: [
    {
      hoi: 'MSE tính thế nào và vì sao bình phương?',
      dap: 'MSE = trung bình của (dự đoán − thực tế)². Bình phương để sai lệch âm và dương không triệt tiêu nhau, và để phạt nặng những cú sai lớn. MSE luôn >= 0, bằng 0 khi đoán đúng tuyệt đối; nhớ chia cho số mẫu để so sánh được giữa các tập dữ liệu.',
    },
    {
      hoi: 'Mini-batch gradient descent là gì và vì sao được dùng phổ biến nhất?',
      dap: 'Tính gradient trên từng lô nhỏ 32–256 mẫu thay vì toàn bộ dữ liệu (quá chậm) hay đúng một mẫu (quá nhiễu). Nó nhanh, dùng được GPU hiệu quả, và chút nhiễu còn giúp thoát khỏi đáy nông. Một lượt đi hết dữ liệu gọi là một epoch.',
    },
    {
      hoi: 'Hàm lồi (convex) khác mặt lỗi của mạng nơ-ron thế nào?',
      dap: 'Hàm lồi chỉ có đúng một đáy (parabol, hồi quy tuyến tính/logistic) nên gradient descent luôn tìm ra nghiệm tốt nhất. Mặt lỗi mạng nơ-ron gồ ghề, nhiều đáy địa phương và điểm yên ngựa, nên kết quả phụ thuộc điểm khởi tạo, learning rate và thuật toán tối ưu (momentum, Adam).',
    },
    {
      hoi: 'Vòng lặp huấn luyện một mô hình gồm những bước nào?',
      dap: 'Biểu diễn dữ liệu thành ma trận → mô hình tính dự đoán bằng nhân ma trận → hàm mất mát (MSE/cross-entropy) đo sai → tính gradient của mất mát theo từng trọng số → cập nhật trọng số ngược hướng gradient → lặp lại nhiều epoch.',
    },
  ],
}
```

---

## Nghiệm thu đặc tả

- **13/13 bài** đủ 8 bước + `srsCards` (3 thẻ mỗi bài, riêng `mathai-u3-l4` có 4 thẻ tổng kết).
- Mọi `id` khớp `mathai-u<chương>-l<bài>` và bắt đầu bằng `unitId` (refine của Zod).
- Mọi `predict.answerIndex = 0` và luôn có 4 lựa chọn → thoả refine `answerIndex < choices.length`.
- Mỗi bài Make có 3 `testCases` (trong khoảng 1–10), đúng 1 ca `hidden: true` là ca biên.
- `parsons.lines` từ 5 đến 8 dòng (trong khoảng 3–12).
- Không bài nào dùng `random`, `numpy` hay bất kỳ thư viện ngoài; mọi `print()` không dấu.
