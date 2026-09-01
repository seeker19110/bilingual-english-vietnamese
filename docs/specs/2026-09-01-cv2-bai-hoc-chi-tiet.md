# Đặc tả nội dung chi tiết — khoá `cv2` "Deep Learning for CV nâng cao" (14 bài)

> Ngày: 2026-09-01 · Đặc tả cha: `docs/specs/2026-09-01-cum-6-khoa-ai-engineer.md` (§03e, §1.4)
> Phạm vi file này: **nội dung KÍN của đủ 14 bài học** — copy vào
> `packages/subject-programming/lessons/cv2u1.ts` … `cv2u4.ts` là chạy được, không phải nghĩ thêm.

## 0. Khoá này là gì

- `id: 'cv2'`, tên "Deep Learning for CV nâng cao", mức **NÂNG CAO**.
- `canDo`: "Tự cài được attention một đầu và giải thích ViT; tự cài IoU + NMS của object
  detection; giải thích và mô phỏng được GAN, diffusion — đọc hiểu paper/kiến trúc CV 2026."
- `prerequisites: ['Khoá Deep Learning for CV cơ bản (cv1)']`.
- 14 bài, chia **4 chương = 4 unit**:

| Unit     | File       | Bài | Nội dung                              |
| -------- | ---------- | --- | ------------------------------------- |
| `cv2-u1` | `cv2u1.ts` | 4   | Transformer & ViT                     |
| `cv2-u2` | `cv2u2.ts` | 4   | Object detection (IoU, NMS, dòng họ)  |
| `cv2-u3` | `cv2u3.ts` | 4   | Mô hình sinh ảnh (GAN, diffusion)     |
| `cv2-u4` | `cv2u4.ts` | 2   | Tổng hợp: project pipeline + tổng kết |

### Quyết định soạn: tách hẳn `cv2-u4` thay vì nhét 2 bài cuối vào `cv2-u3`

Đặc tả cha để ngỏ ("nằm cuối `cv2-u3` file thứ 3 hoặc file `cv2u4` nhỏ"). **Chọn `cv2-u4`
riêng**, vì ba lý do đo được:

1. **Sơ đồ khoá nói 4 giai đoạn.** Nếu 2 bài tổng hợp nằm trong `cv2-u3`, học viên thấy 3 unit
   trên giao diện trong khi tài liệu nói 4 giai đoạn — sai lệch tài liệu/thực tế đúng loại mà
   Tầng 6b của `QUY-TRINH-AUDIT.md` bắt.
2. **Ngữ nghĩa unit khác hẳn.** `cv2-u3` là "mô hình sinh ảnh"; hai bài cuối là project tổng hợp
   - tổng kết lối đi tiếp, không thuộc chủ đề sinh ảnh. Gộp vào là đặt tên unit nói dối nội dung.
3. **Chi phí bằng 0.** `cv2-u4` là "unit ảo" của tầng khoá ngắn (công nhận qua
   `courses/registry.ts`, đúng cơ chế `git-u*`/`ml-u*`), không cần đụng `curriculum.ts`.

Tổng: **4 + 4 + 4 + 2 = 14 bài**.

### Luật soạn áp cho MỌI bài dưới đây (đã tuân thủ sẵn)

- `language: 'python'` cho cả 14 bài. Code được chấm dùng **Python thuần** — chỉ `math` chuẩn,
  **không numpy/torch**. `softmax` tự cài bằng `math.exp` + chia tổng.
- Mọi `print()` **tiếng Việt KHÔNG DẤU**; số thực luôn `round(x, 2..4)` để test-case ổn định.
- `id` = `cv2-u<chương>-l<bài>`, `unitId` = `cv2-u<chương>`.
- Mỗi bài 3–4 `testCases`, **≥ 1 ca `hidden: true`**.
- **Mọi `sampleSolution` dưới đây đã được chạy thật bằng `python3`** với đúng `stdinLines` của
  từng test-case; các chuỗi `expected` là output thật, không phải suy đoán.

### Việc kỹ thuật kèm theo (ngoài nội dung)

Nới regex ở `packages/subject-programming/lessonTypes.ts` (`id` + `unitId`) và hai handler
`apps/server/src/api/subjects/programming/{progress,feedback}.ts` để nhận nhánh `cv2-u\d+-l\d+`
/ `cv2-u\d+` — như tiền lệ `ml`.

---

## 1. Chương 1 — Transformer & ViT (`cv2-u1`, 4 bài)

File `packages/subject-programming/lessons/cv2u1.ts`, export `CV2_U1_LESSONS: ProgrammingLesson[]`.

### Bài 1 — `cv2-u1-l1`

```typescript
{
  id: 'cv2-u1-l1',
  unitId: 'cv2-u1',
  language: 'python',
  title: 'Vì sao cần attention — chỗ CNN và RNN đuối sức',
  hook: 'Câu "Con mèo mà bà ngoại tôi nuôi từ hồi tôi còn bé xíu ĐÃ CHẾT" — chữ "mèo" và chữ "chết" cách nhau 12 từ. RNN phải truyền tin qua đủ 12 bước mới nối được hai chữ đó, tam sao thất bản. Attention nối thẳng: mọi từ nhìn thấy mọi từ trong ĐÚNG MỘT bước.',
  theory:
    'Trước 2017, hai kiến trúc thống trị đều có cùng một vết nứt: THÔNG TIN Ở XA THÌ KHÓ NỐI.\n\nRNN/LSTM đọc tuần tự trái sang phải, trạng thái ẩn mang ký ức đi theo. Muốn nối từ vị trí 1 với vị trí n, tín hiệu phải đi qua n−1 bước — mỗi bước nhân thêm một ma trận, gradient teo dần (vanishing gradient). Tệ hơn: tuần tự nghĩa là KHÔNG song song hoá được, GPU nằm chơi.\n\nCNN nối cục bộ: kernel 3×3 chỉ thấy hàng xóm sát bên. Muốn hai điểm cách nhau n bước "thấy nhau", phải chồng khoảng n/2 lớp — kiến trúc phình ra chỉ để mở rộng tầm nhìn (receptive field).\n\nATTENTION đổi luật chơi: với chuỗi n phần tử, nó tính TRỰC TIẾP điểm liên quan của mọi cặp (i, j) — n(n−1)/2 cặp, tất cả trong một bước, tất cả song song. Không còn khoảng cách xa hay gần: từ đầu câu và từ cuối câu cách nhau đúng MỘT phép nhân.\n\nCái giá phải trả, phải biết ngay từ bài đầu: chi phí là O(n²). Chuỗi 1.000 phần tử → 1 triệu cặp; 10.000 phần tử → 100 triệu. Vì vậy ảnh KHÔNG đưa từng pixel vào attention (ảnh 224×224 là 50.176 pixel!) mà cắt thành PATCH (bài 4). Toàn bộ ngành nghiên cứu "attention hiệu quả" (Linformer, Performer, FlashAttention) sinh ra chỉ để gặm con số n² này.',
  workedExample: {
    code: `# Do "khoang cach truyen tin" cua 3 kien truc tren cung mot cau
n = 12                       # cau dai 12 tu

# RNN: tin phai di tuan tu tu tu dau toi tu cuoi
print(f"RNN can: {n - 1} buoc")

# CNN kernel 3: moi lop mo rong tam nhin them 1 ve moi ben
print(f"CNN kernel 3 can: {(n - 1 + 1) // 2} lop")

# Attention: moi cap noi truc tiep, mot buoc duy nhat
print("Attention can: 1 buoc")
print(f"Nhung phai tinh: {n * (n - 1) // 2} cap (chi phi O(n^2))")`,
    stdinLines: [],
  },
  predict: {
    code: `n = 100\nprint(n * (n - 1) // 2)`,
    question: 'Chuỗi 100 phần tử, attention phải tính bao nhiêu cặp liên quan?',
    choices: ['4950', '100', '10000', '99'],
    answerIndex: 0,
    explain:
      'Mỗi cặp (i, j) không trùng nhau: 100 × 99 / 2 = 4.950. Gấp đôi độ dài chuỗi là chi phí gấp BỐN — đó chính là O(n²), lý do ảnh phải cắt thành patch chứ không đưa từng pixel vào attention.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự so sánh chi phí ba kiến trúc trên chuỗi dài n.',
    lines: [
      'n = int(input("So tu: "))',
      'print(f"RNN can: {n - 1} buoc")',
      'print(f"CNN kernel 3 can: {(n - 1 + 1) // 2} lop")',
      'print("Attention can: 1 buoc")',
      'print(f"Chi phi attention: {n * (n - 1) // 2} cap")',
    ],
  },
  make: {
    prompt:
      'Viết máy so sánh ba kiến trúc trên một chuỗi dài n.\n\nChương trình đọc 1 dòng input(): số từ n (số nguyên ≥ 2).\n\nIn đúng 3 dòng:\nAttention noi truc tiep: <n*(n-1)//2> cap\nRNN can: <n-1> buoc de tu dau toi cuoi\nCNN kernel 3 can: <(n-1+1)//2> lop de phu het cau\n\nVí dụ n = 4 → 6 cặp, 3 bước, 2 lớp.',
    starterCode: `n = int(input("So tu: "))\n# So cap attention = n*(n-1)//2 (chia lay nguyen // de ra so nguyen)\n# So buoc RNN = n-1 ; so lop CNN kernel 3 = (n-1+1)//2\n`,
    testCases: [
      {
        stdinLines: ['4'],
        expected: 'Attention noi truc tiep: 6 cap\nRNN can: 3 buoc de tu dau toi cuoi\nCNN kernel 3 can: 2 lop de phu het cau',
        match: 'contains',
        hidden: false,
        label: 'n = 4 → 6 cặp · 3 bước · 2 lớp',
      },
      {
        stdinLines: ['8'],
        expected: 'Attention noi truc tiep: 28 cap\nRNN can: 7 buoc de tu dau toi cuoi\nCNN kernel 3 can: 4 lop de phu het cau',
        match: 'contains',
        hidden: false,
        label: 'n = 8 → 28 cặp (gấp đôi n, cặp gấp gần 5 lần)',
      },
      {
        stdinLines: ['2'],
        expected: 'Attention noi truc tiep: 1 cap\nRNN can: 1 buoc de tu dau toi cuoi\nCNN kernel 3 can: 1 lop de phu het cau',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: n = 2 — biên nhỏ nhất, đúng 1 cặp',
      },
    ],
    hints: [
      'Dùng phép chia lấy nguyên // chứ không phải / — đề yêu cầu số nguyên (6 chứ không phải 6.0).',
      'Số cặp không trùng của n phần tử là n*(n-1)//2 (công thức tổ hợp chập 2).',
      'Ba dòng print f-string, chép đúng từng chữ nhãn trong đề — máy chấm so chuỗi.',
    ],
    sampleSolution: `n = int(input("So tu: "))\ncap = n * (n - 1) // 2\nprint(f"Attention noi truc tiep: {cap} cap")\nprint(f"RNN can: {n - 1} buoc de tu dau toi cuoi")\nprint(f"CNN kernel 3 can: {(n - 1 + 1) // 2} lop de phu het cau")`,
  },
  homework:
    'Chạy code của bạn với n = 10, 100, 1000, 10000 rồi ghi lại 4 con số chi phí attention. Chuỗi dài gấp 10 thì chi phí gấp mấy? Từ đó tự trả lời: ảnh 224×224 = 50.176 pixel, nếu đưa TỪNG PIXEL vào attention thì phải tính bao nhiêu cặp — và vì sao ViT (bài 4) buộc phải cắt ảnh thành patch trước.',
  srsCards: [
    {
      hoi: 'Vết nứt chung của RNN và CNN mà attention vá được là gì?',
      dap: 'Thông tin ở XA thì khó nối: RNN phải truyền qua n−1 bước tuần tự (gradient teo, không song song hoá được), CNN phải chồng ~n/2 lớp vì kernel chỉ thấy hàng xóm. Attention nối MỌI cặp trực tiếp trong một bước, song song hoàn toàn.',
    },
    {
      hoi: 'Cái giá của attention là gì và nó dẫn tới hệ quả gì cho ảnh?',
      dap: 'Chi phí O(n²) — chuỗi n phần tử phải tính n(n−1)/2 cặp, gấp đôi độ dài là chi phí gấp bốn. Vì thế ảnh không đưa từng pixel vào attention (224×224 = 50.176 pixel) mà cắt thành patch làm "từ" (ViT).',
    },
    {
      hoi: 'Vì sao RNN không tận dụng được GPU tốt như Transformer?',
      dap: 'RNN đọc TUẦN TỰ: muốn tính trạng thái bước t phải có xong bước t−1, nên không song song hoá theo chiều thời gian. Attention tính mọi cặp độc lập nhau nên đưa hết lên GPU cùng lúc được.',
    },
  ],
}
```

### Bài 2 — `cv2-u1-l2` (mô phỏng bắt buộc: attention 1 đầu)

```typescript
{
  id: 'cv2-u1-l2',
  unitId: 'cv2-u1',
  language: 'python',
  title: 'Self-attention một đầu — tự cài Q·K → softmax → V',
  hook: 'Đọc câu "Con mèo đuổi con chuột vì NÓ đói", bạn tự động biết "nó" trỏ về con mèo. Não bạn vừa phân bổ SỰ CHÚ Ý: 80% vào "mèo", 15% vào "chuột", 5% vào phần còn lại. Bài này bạn cài đúng cơ chế đó bằng 15 dòng Python — và in ra được bảng phần trăm chú ý ấy.',
  theory:
    'Self-attention biến mỗi phần tử thành ba vector, đây là chỗ hay lẫn nhất nên nhớ bằng hình ảnh thư viện:\n- Q (Query, truy vấn) — "tôi đang tìm gì".\n- K (Key, khoá) — "tôi có gì để người khác tìm thấy".\n- V (Value, giá trị) — "nội dung tôi đưa ra nếu được chọn".\n\nCông thức đủ: Attention(Q,K,V) = softmax(Q·Kᵀ / √d) · V. Bốn bước, cài lần lượt:\n\n1. CHẤM ĐIỂM: điểm[i][j] = tích vô hướng Q[i]·K[j] = tổng của Q[i][t]*K[j][t]. Hai vector cùng hướng → điểm cao → "liên quan".\n2. CHIA THANG (scale): chia cho √d với d là số chiều. Vì sao? Tích vô hướng của d chiều lớn dần theo d; điểm quá lớn làm softmax bão hoà thành gần như 1 và 0 hết, gradient chết. Chia √d giữ điểm trong vùng lành.\n3. SOFTMAX: đổi dãy điểm thành TRỌNG SỐ dương cộng lại bằng 1. Tự cài: w[j] = exp(diem[j]) / tổng exp(diem). Mẹo ổn định số học của dân nghề: trừ đi max trước khi lấy exp — exp(diem[j] − max) — kết quả toán học y hệt (tử và mẫu cùng chia một hằng) nhưng không bao giờ tràn số.\n4. TRỘN: kết quả[t] = tổng w[j] * V[j][t] — trung bình có trọng số các vector V.\n\nHàng thứ i của bảng trọng số chính là "phần trăm chú ý" mà từ i dành cho từng từ trong câu. Đây là thứ các bài báo hay vẽ thành bản đồ nhiệt (attention map), và với ViT nó cho biết mô hình đang nhìn vào vùng nào của ảnh.',
  workedExample: {
    code: `import math

# 3 "tu", moi tu la vector 2 chieu. Bai nay cho Q = K = V (self-attention).
Q = [[1, 0], [0, 1], [1, 1]]
K = [[1, 0], [0, 1], [1, 1]]
V = [[1, 0], [0, 1], [1, 1]]
d = 2                                   # so chieu

i = 0                                   # tinh chu y CUA tu so 0
diem = []
for j in range(len(K)):                 # (1) cham diem Q[i] . K[j]
    s = sum(Q[i][t] * K[j][t] for t in range(d))
    diem.append(s / math.sqrt(d))       # (2) chia thang sqrt(d)
print("Diem sau scale:", [round(x, 3) for x in diem])

lon_nhat = max(diem)                    # (3) softmax tu cai, tru max cho on dinh
mu = [math.exp(s - lon_nhat) for s in diem]
tong = sum(mu)
w = [m / tong for m in mu]
print("Trong so chu y:", [round(x, 3) for x in w])
print("Tong trong so:", round(sum(w), 3))   # luon bang 1.0

ket = [sum(w[j] * V[j][t] for j in range(len(V))) for t in range(d)]
print("Vector ket qua:", [round(x, 3) for x in ket])   # (4) tron V`,
    stdinLines: [],
  },
  predict: {
    code: `import math\ndiem = [2.0, 0.0, 2.0]\nmu = [math.exp(s) for s in diem]\ntong = sum(mu)\nprint(round(sum(m / tong for m in mu), 3))`,
    question: 'Tổng các trọng số softmax in ra là bao nhiêu?',
    choices: ['1.0', '3.0', '0.0', '2.0'],
    answerIndex: 0,
    explain:
      'Softmax chia mỗi exp cho TỔNG các exp, nên cộng lại luôn bằng đúng 1.0 dù dãy điểm là gì. Đó là lý do gọi nó là "phân bổ chú ý": bạn có 100% sự chú ý và phải chia hết cho các từ, ưu ái từ này là phải bớt từ khác.',
  },
  parsons: {
    prompt: 'Xếp đúng 4 bước self-attention: chấm điểm → chia thang → softmax → trộn V.',
    lines: [
      'diem = [sum(Q[i][t] * K[j][t] for t in range(d)) / math.sqrt(d) for j in range(n)]',
      'lon_nhat = max(diem)',
      'mu = [math.exp(s - lon_nhat) for s in diem]',
      'w = [m / sum(mu) for m in mu]',
      'ket = [sum(w[j] * V[j][t] for j in range(n)) for t in range(d)]',
    ],
  },
  make: {
    prompt:
      'Tự cài self-attention MỘT ĐẦU cho 3 "từ" đã nhúng sẵn trong starter code (Q = K = V, mỗi vector 2 chiều).\n\nChương trình đọc 1 dòng input(): chỉ số từ truy vấn (0, 1 hoặc 2).\n\nLàm đủ 4 bước: chấm điểm Q·K → chia √d → softmax TỰ CÀI bằng math.exp → trộn V. In đúng 2 dòng, mỗi số làm tròn 3 chữ số thập phân, ngăn nhau bằng dấu phẩy + khoảng trắng:\nTrong so: <w0>, <w1>, <w2>\nKet qua: <y0>, <y1>\n\nVí dụ với chỉ số 0 → "Trong so: 0.401, 0.198, 0.401" và "Ket qua: 0.802, 0.599".',
    starterCode: `import math\n\nQ = [[1, 0], [0, 1], [1, 1]]\nK = [[1, 0], [0, 1], [1, 1]]\nV = [[1, 0], [0, 1], [1, 1]]\nd = 2\n\ni = int(input("Chi so tu truy van: "))\n# (1) diem[j] = tich vo huong Q[i].K[j] roi chia math.sqrt(d)\n# (2) softmax tu cai: exp(diem - max) chia tong\n# (3) ket qua[t] = tong w[j] * V[j][t]\n# In: "Trong so: ..." va "Ket qua: ..." (round 3, noi bang ", ")\n`,
    testCases: [
      {
        stdinLines: ['0'],
        expected: 'Trong so: 0.401, 0.198, 0.401\nKet qua: 0.802, 0.599',
        match: 'contains',
        hidden: false,
        label: 'Từ 0 = [1,0]: chú ý nhiều vào từ 0 và từ 2 (cùng có chiều thứ nhất)',
      },
      {
        stdinLines: ['1'],
        expected: 'Trong so: 0.198, 0.401, 0.401\nKet qua: 0.599, 0.802',
        match: 'contains',
        hidden: false,
        label: 'Từ 1 = [0,1]: đối xứng với ca trên',
      },
      {
        stdinLines: ['2'],
        expected: 'Trong so: 0.248, 0.248, 0.503\nKet qua: 0.752, 0.752',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: từ 2 = [1,1] tự chú ý mình nhiều nhất (0.503)',
      },
    ],
    hints: [
      'Tích vô hướng hai vector 2 chiều: sum(Q[i][t] * K[j][t] for t in range(d)) — đúng công thức bài học.',
      'Softmax tự cài: lon_nhat = max(diem); mu = [math.exp(s - lon_nhat) for s in diem]; w = [m / sum(mu) for m in mu]. Trừ max không đổi kết quả nhưng chống tràn số.',
      'In đúng định dạng: print("Trong so: " + ", ".join(str(round(x, 3)) for x in w)) — join bằng ", " chứ không phải ",".',
    ],
    sampleSolution: `import math\n\nQ = [[1, 0], [0, 1], [1, 1]]\nK = [[1, 0], [0, 1], [1, 1]]\nV = [[1, 0], [0, 1], [1, 1]]\nd = 2\n\ni = int(input("Chi so tu truy van: "))\ndiem = []\nfor j in range(len(K)):\n    s = sum(Q[i][t] * K[j][t] for t in range(d))\n    diem.append(s / math.sqrt(d))\nlon_nhat = max(diem)\nmu = [math.exp(s - lon_nhat) for s in diem]\ntong = sum(mu)\nw = [m / tong for m in mu]\nprint("Trong so: " + ", ".join(str(round(x, 3)) for x in w))\nket = [sum(w[j] * V[j][t] for j in range(len(V))) for t in range(d)]\nprint("Ket qua: " + ", ".join(str(round(x, 3)) for x in ket))`,
  },
  homework:
    'Sửa code để in CẢ BẢNG trọng số 3×3 (vòng lặp i từ 0 đến 2) — đó chính là "attention map" mà các bài báo hay vẽ. Rồi thử đổi V thành [[10,0],[0,10],[5,5]] và quan sát: bảng trọng số có đổi không, vector kết quả có đổi không? Từ đó tự giải thích vì sao K và V phải là hai vector KHÁC nhau trong Transformer thật (K quyết định CHỌN AI, V quyết định LẤY GÌ).',
  srsCards: [
    {
      hoi: 'Q, K, V trong attention lần lượt đóng vai gì?',
      dap: 'Q (query) = "tôi đang tìm gì"; K (key) = "tôi có gì để được tìm thấy"; V (value) = "nội dung tôi đưa ra nếu được chọn". Điểm chú ý tính từ Q·K, còn thứ được trộn ra kết quả là V.',
    },
    {
      hoi: 'Vì sao phải chia điểm attention cho √d trước khi softmax?',
      dap: 'Tích vô hướng lớn dần theo số chiều d; điểm quá lớn làm softmax bão hoà (một trọng số ≈ 1, còn lại ≈ 0), gradient gần như bằng 0 nên mô hình không học được. Chia √d giữ điểm trong vùng softmax còn nhạy.',
    },
    {
      hoi: 'Softmax tự cài gồm những phép nào, và mẹo ổn định số học là gì?',
      dap: 'w[j] = exp(diem[j]) / tổng exp(diem) — kết quả dương và cộng lại bằng 1. Mẹo: trừ max(diem) trước khi lấy exp; kết quả toán học không đổi (tử mẫu cùng chia một hằng) nhưng tránh tràn số với điểm lớn.',
    },
  ],
}
```

### Bài 3 — `cv2-u1-l3`

```typescript
{
  id: 'cv2-u1-l3',
  unitId: 'cv2-u1',
  language: 'python',
  title: 'Multi-head & positional encoding — nhiều góc nhìn và ý niệm thứ tự',
  hook: 'Attention bài trước có hai lỗ hổng chết người. Một: nó là phép tính trên TẬP HỢP — đảo "chó cắn người" thành "người cắn chó" ra kết quả y hệt. Hai: một đầu chú ý chỉ nhìn được một kiểu quan hệ. Transformer vá cả hai bằng hai mẹo đơn giản đến bất ngờ.',
  theory:
    'MULTI-HEAD ATTENTION (chú ý nhiều đầu). Thay vì một bộ Q/K/V chiều d, chia thành h bộ nhỏ chiều d/h, chạy attention ĐỘC LẬP song song, rồi nối kết quả lại và cho qua một lớp tuyến tính. Vì sao lợi: mỗi đầu tự do học một KIỂU quan hệ khác nhau — trong câu, đầu này chuyên nối đại từ với danh từ nó trỏ tới, đầu kia chuyên nối động từ với tân ngữ; trong ảnh, đầu này bám cạnh, đầu kia bám màu. Chi phí gần như không đổi vì mỗi đầu làm việc trên không gian nhỏ hơn h lần. Một đầu là "một ý kiến", nhiều đầu là "một hội đồng".\n\nPOSITIONAL ENCODING (mã hoá vị trí). Attention không có khái niệm thứ tự: nó nhìn chuỗi như một cái túi. Cách vá của Transformer gốc: CỘNG thẳng vào vector mỗi phần tử một "dấu vân tay vị trí" tính bằng sin/cos:\n  PE(pos, 2i)   = sin(pos / 10000^(2i/d))\n  PE(pos, 2i+1) = cos(pos / 10000^(2i/d))\nTức là chiều chẵn dùng sin, chiều lẻ dùng cos, và mỗi CẶP chiều có một bước sóng riêng — cặp đầu quay rất nhanh (phân biệt vị trí sát nhau), cặp sau quay rất chậm (phân biệt vị trí xa nhau). Giống kim giây/kim phút/kim giờ của đồng hồ: ba kim tốc độ khác nhau, đọc chung là biết chính xác thời điểm.\n\nHai tính chất khiến người ta chọn sin/cos: (a) không cần học tham số, chạy được với chuỗi DÀI HƠN mọi chuỗi từng thấy lúc huấn luyện; (b) vị trí pos+k biểu diễn được bằng phép quay tuyến tính từ pos, nên mô hình dễ học quan hệ "cách nhau k bước". Bản hiện đại (ViT, LLM 2026) hay dùng biến thể học được hoặc RoPE (quay vector Q/K theo vị trí), nhưng ý niệm cốt lõi vẫn đúng như trên: THỨ TỰ PHẢI ĐƯỢC BƠM VÀO, attention không tự có.',
  workedExample: {
    code: `import math

d = 4                       # so chieu cua vector nhung
for pos in range(3):        # 3 vi tri dau tien
    pe = []
    for i in range(d):
        # cap chieu thu (i//2) co buoc song rieng
        goc = pos / (10000 ** ((2 * (i // 2)) / d))
        # chieu chan dung sin, chieu le dung cos
        pe.append(math.sin(goc) if i % 2 == 0 else math.cos(goc))
    print(f"Vi tri {pos}: " + ", ".join(str(round(x, 4)) for x in pe))`,
    stdinLines: [],
  },
  predict: {
    code: `import math\npos = 0\nprint(round(math.sin(pos), 4), round(math.cos(pos), 4))`,
    question: 'Positional encoding của vị trí 0 với d = 2 in ra gì?',
    choices: ['0.0 1.0', '1.0 0.0', '0.0 0.0', '1.0 1.0'],
    answerIndex: 0,
    explain:
      'sin(0) = 0.0 và cos(0) = 1.0 — vị trí đầu tiên luôn có "vân tay" cố định (0, 1, 0, 1, …). Đó là mốc gốc: mọi vị trí sau được so với nó, và vì sin/cos tuần hoàn nên khoảng cách giữa hai vị trí đọc được bằng phép quay.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự tính positional encoding cho một vị trí pos.',
    lines: [
      'pe = []',
      'for i in range(d):',
      '    goc = pos / (10000 ** ((2 * (i // 2)) / d))',
      '    pe.append(math.sin(goc) if i % 2 == 0 else math.cos(goc))',
      'print("PE: " + ", ".join(str(round(x, 4)) for x in pe))',
    ],
  },
  make: {
    prompt:
      'Tự cài positional encoding kiểu Transformer gốc cho d = 4 chiều.\n\nChương trình đọc 1 dòng input(): vị trí pos (số nguyên ≥ 0).\n\nVới i chạy từ 0 đến 3: goc = pos / (10000 ** ((2 * (i // 2)) / 4)); chiều CHẴN dùng math.sin(goc), chiều LẺ dùng math.cos(goc). In đúng 1 dòng, mỗi số làm tròn 4 chữ số, ngăn nhau bằng ", ":\nPE: <p0>, <p1>, <p2>, <p3>\n\nVí dụ pos = 0 → "PE: 0.0, 1.0, 0.0, 1.0".',
    starterCode: `import math\n\npos = int(input("Vi tri: "))\nd = 4\n# Vong for i in range(d): tinh goc, chon sin (i chan) hay cos (i le)\n# In: PE: ... (round 4, noi bang ", ")\n`,
    testCases: [
      {
        stdinLines: ['0'],
        expected: 'PE: 0.0, 1.0, 0.0, 1.0',
        match: 'contains',
        hidden: false,
        label: 'pos = 0 → mốc gốc sin/cos: 0, 1, 0, 1',
      },
      {
        stdinLines: ['1'],
        expected: 'PE: 0.8415, 0.5403, 0.01, 1.0',
        match: 'contains',
        hidden: false,
        label: 'pos = 1 → cặp chiều đầu quay nhanh, cặp sau gần như đứng yên',
      },
      {
        stdinLines: ['2'],
        expected: 'PE: 0.9093, -0.4161, 0.02, 0.9998',
        match: 'contains',
        hidden: false,
        label: 'pos = 2 → chiều 1 đã âm, chiều 2 mới nhích lên 0.02',
      },
      {
        stdinLines: ['5'],
        expected: 'PE: -0.9589, 0.2837, 0.05, 0.9988',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: pos = 5 — sin đã quay quá nửa vòng',
      },
    ],
    hints: [
      'Chỉ số CẶP chiều là i // 2 (chia lấy nguyên): i = 0,1 cùng cặp 0; i = 2,3 cùng cặp 1.',
      'Chọn sin/cos bằng i % 2: chẵn → math.sin(goc), lẻ → math.cos(goc). Viết gọn bằng biểu thức điều kiện.',
      'In: print("PE: " + ", ".join(str(round(x, 4)) for x in pe)).',
    ],
    sampleSolution: `import math\n\npos = int(input("Vi tri: "))\nd = 4\npe = []\nfor i in range(d):\n    goc = pos / (10000 ** ((2 * (i // 2)) / d))\n    pe.append(math.sin(goc) if i % 2 == 0 else math.cos(goc))\nprint("PE: " + ", ".join(str(round(x, 4)) for x in pe))`,
  },
  homework:
    'In positional encoding cho pos từ 0 đến 9 rồi nhìn theo CỘT: cột 0 (sin, bước sóng ngắn) đổi nhanh cỡ nào, cột 2 (bước sóng dài) đổi chậm cỡ nào? Sau đó trả lời bằng lời: nếu Transformer KHÔNG cộng positional encoding thì câu "chó cắn người" và "người cắn chó" cho ra cùng một kết quả — vì sao? (Gợi ý: attention là tổng có trọng số trên một TẬP HỢP.)',
  srsCards: [
    {
      hoi: 'Multi-head attention lợi hơn một đầu ở chỗ nào?',
      dap: 'Chia Q/K/V thành h bộ nhỏ chạy song song, mỗi đầu tự do học MỘT KIỂU quan hệ khác nhau (đại từ↔danh từ, động từ↔tân ngữ; cạnh↔màu trong ảnh), rồi nối lại. Chi phí gần như không đổi vì mỗi đầu làm trên không gian nhỏ hơn h lần.',
    },
    {
      hoi: 'Vì sao Transformer cần positional encoding?',
      dap: 'Attention là tổng có trọng số trên một TẬP HỢP nên không có khái niệm thứ tự — đảo từ vẫn ra kết quả y hệt. Phải bơm thứ tự vào bằng cách cộng "vân tay vị trí" (sin/cos nhiều bước sóng, hoặc RoPE/học được ở bản hiện đại) vào vector mỗi phần tử.',
    },
    {
      hoi: 'Vì sao positional encoding dùng sin/cos nhiều bước sóng khác nhau?',
      dap: 'Giống kim giây/phút/giờ: cặp chiều đầu quay nhanh phân biệt vị trí sát nhau, cặp sau quay chậm phân biệt vị trí xa nhau. Lợi thêm: không cần học tham số nên dùng được với chuỗi dài hơn lúc huấn luyện, và vị trí pos+k suy ra từ pos bằng phép quay tuyến tính.',
    },
  ],
}
```

### Bài 4 — `cv2-u1-l4`

```typescript
{
  id: 'cv2-u1-l4',
  unitId: 'cv2-u1',
  language: 'python',
  title: 'ViT — cắt ảnh thành patch, coi mỗi patch là một "từ"',
  hook: 'Năm 2020 một nhóm ở Google thử điều gần như xấc xược: bỏ hết convolution, cắt ảnh thành 196 ô vuông, xếp thành một câu 196 "từ", rồi ném vào đúng Transformer của dịch máy. Tên bài báo nói hết: "An Image is Worth 16×16 Words". Nó thắng CNN — nhưng chỉ khi có đủ dữ liệu.',
  theory:
    'VISION TRANSFORMER (ViT) làm đúng 5 bước, không có bước nào bí ẩn:\n1. CẮT PATCH: ảnh 224×224 chia thành các ô 16×16 → 14×14 = 196 patch.\n2. LÀM PHẲNG + CHIẾU: mỗi patch 16×16×3 duỗi thành vector 768 số, nhân một ma trận để ra vector nhúng chiều d. Đây là "từ điển" của ViT.\n3. CỘNG POSITIONAL ENCODING (bài 3) — không có nó, xáo trộn các patch cho ra cùng kết quả, ảnh thành trò xếp hình vô nghĩa.\n4. QUA CÁC KHỐI TRANSFORMER: multi-head attention + mạng feed-forward, lặp 12 lớp (ViT-Base).\n5. ĐẦU PHÂN LOẠI: thêm một token đặc biệt [CLS] đứng đầu, sau các lớp thì vector của nó được coi là "tóm tắt cả ảnh", cho qua một lớp tuyến tính ra nhãn.\n\nCNN vs ViT — khác nhau ở ĐỊNH KIẾN CÀI SẴN (inductive bias). CNN được cài sẵn ba giả định về ảnh: cục bộ (pixel gần nhau liên quan), bất biến tịnh tiến (con mèo góc trái hay góc phải vẫn là mèo), phân cấp (cạnh → hình → vật). Ba giả định này ĐÚNG với ảnh, nên CNN học nhanh, ít dữ liệu vẫn tốt. ViT gần như không có định kiến nào — nó phải HỌC cả những điều đó từ dữ liệu. Hệ quả đo được: dữ liệu nhỏ (ImageNet-1k) thì CNN thắng; dữ liệu rất lớn (JFT-300M) thì ViT vượt lên, vì không bị định kiến giới hạn trần.\n\nBức tranh 2026: ranh giới đã mờ. ConvNeXt là CNN vay mượn thiết kế của Transformer; Swin Transformer là ViT vay mượn tính cục bộ và phân cấp của CNN (attention trong cửa sổ trượt). Bài học nghề: KHÔNG có kiến trúc thắng tuyệt đối — chọn theo lượng dữ liệu, ngân sách tính toán và bài toán, đúng như chọn mô hình detection ở bài `cv2-u2-l4`.',
  workedExample: {
    code: `# Cat anh 4x4 thanh 4 patch 2x2, moi patch thanh mot "tu"
anh = [
    [1, 1, 2, 2],
    [1, 1, 2, 2],
    [3, 3, 4, 4],
    [3, 3, 4, 4],
]
kich_thuoc = 2                    # canh moi patch

chuoi = []
for r in range(0, 4, kich_thuoc):         # duyet theo hang patch
    for c in range(0, 4, kich_thuoc):     # roi theo cot patch
        o = [anh[r][c], anh[r][c + 1], anh[r + 1][c], anh[r + 1][c + 1]]
        print(f"Patch tai ({r},{c}) = {o}")
        chuoi.append(round(sum(o) / 4, 2))    # "nhung" tam thoi: lay trung binh
print(f"So patch: {len(chuoi)}")
print(f"Chuoi dua vao Transformer: {chuoi}")`,
    stdinLines: [],
  },
  predict: {
    code: `print((224 // 16) ** 2)`,
    question: 'Ảnh 224×224 cắt patch 16×16 thì Transformer nhận chuỗi dài bao nhiêu?',
    choices: ['196', '14', '256', '50176'],
    answerIndex: 0,
    explain:
      '224 / 16 = 14 patch mỗi chiều → 14 × 14 = 196 patch. So với 224 × 224 = 50.176 pixel: cắt patch giảm độ dài chuỗi 256 lần, tức giảm chi phí attention O(n²) khoảng 65.000 lần. Đó chính là mẹo khiến ViT khả thi.',
  },
  parsons: {
    prompt: 'Xếp đúng thứ tự cắt ảnh thành chuỗi patch.',
    lines: [
      'chuoi = []',
      'for r in range(0, 4, 2):',
      '    for c in range(0, 4, 2):',
      '        tong = anh[r][c] + anh[r][c + 1] + anh[r + 1][c] + anh[r + 1][c + 1]',
      '        chuoi.append(round(tong / 4, 2))',
      'print(f"So patch: {len(chuoi)}")',
    ],
  },
  make: {
    prompt:
      'Viết bước tiền xử lý của ViT: cắt ảnh 4×4 thành patch 2×2 và "nhúng" mỗi patch bằng giá trị trung bình của nó.\n\nChương trình đọc 4 dòng input(), mỗi dòng là 4 số cách nhau dấu phẩy (một hàng của ảnh).\n\nDuyệt theo thứ tự: patch trên-trái, trên-phải, dưới-trái, dưới-phải. In đúng 2 dòng:\nSo patch: 4\nChuoi patch: <tb0>, <tb1>, <tb2>, <tb3>\n\nMỗi trung bình làm tròn 2 chữ số, ngăn nhau bằng ", ".',
    starterCode: `anh = [[float(v) for v in input().split(",")] for _ in range(4)]\n# Hai vong for buoc 2: r in range(0, 4, 2), c in range(0, 4, 2)\n# Moi patch = 4 o: anh[r][c], anh[r][c+1], anh[r+1][c], anh[r+1][c+1]\n`,
    testCases: [
      {
        stdinLines: ['1,1,2,2', '1,1,2,2', '3,3,4,4', '3,3,4,4'],
        expected: 'So patch: 4\nChuoi patch: 1.0, 2.0, 3.0, 4.0',
        match: 'contains',
        hidden: false,
        label: '4 vùng đồng nhất → 4 patch đúng bằng giá trị vùng',
      },
      {
        stdinLines: ['1,2,3,4', '5,6,7,8', '9,10,11,12', '13,14,15,16'],
        expected: 'Chuoi patch: 3.5, 5.5, 11.5, 13.5',
        match: 'contains',
        hidden: false,
        label: 'Ảnh tăng dần → 4 trung bình patch',
      },
      {
        stdinLines: ['0,0,0,0', '0,0,0,0', '0,0,0,0', '0,0,0,0'],
        expected: 'Chuoi patch: 0.0, 0.0, 0.0, 0.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: ảnh đen tuyền — mọi patch bằng 0.0',
      },
    ],
    hints: [
      'Đọc ảnh: anh = [[float(v) for v in input().split(",")] for _ in range(4)] — starter code đã cho sẵn.',
      'Bước nhảy 2 trong range: range(0, 4, 2) cho r = 0 rồi r = 2 — đúng góc trên-trái của từng patch.',
      'In: print(f"So patch: {len(patch)}") rồi print("Chuoi patch: " + ", ".join(str(v) for v in patch)).',
    ],
    sampleSolution: `anh = [[float(v) for v in input().split(",")] for _ in range(4)]\npatch = []\nfor r in range(0, 4, 2):\n    for c in range(0, 4, 2):\n        tong = anh[r][c] + anh[r][c + 1] + anh[r + 1][c] + anh[r + 1][c + 1]\n        patch.append(round(tong / 4, 2))\nprint(f"So patch: {len(patch)}")\nprint("Chuoi patch: " + ", ".join(str(v) for v in patch))`,
  },
  homework:
    'Tính bằng tay cho ảnh 224×224: nếu patch là 32×32 thì chuỗi dài bao nhiêu, chi phí attention (n²) bằng bao nhiêu phần so với patch 16×16? Patch to thì rẻ hơn nhưng mất gì? Viết 3 câu về đánh đổi này. Sau đó tự trả lời: dự án của bạn chỉ có 2.000 ảnh gán nhãn — chọn CNN hay ViT, vì sao?',
  srsCards: [
    {
      hoi: 'ViT xử lý một tấm ảnh qua 5 bước nào?',
      dap: 'Cắt ảnh thành patch (16×16) → làm phẳng + chiếu tuyến tính thành vector nhúng → cộng positional encoding → qua các khối Transformer (multi-head attention + feed-forward) → token [CLS] đưa qua đầu phân loại ra nhãn.',
    },
    {
      hoi: 'Vì sao ViT cần rất nhiều dữ liệu hơn CNN?',
      dap: 'CNN được cài sẵn định kiến đúng về ảnh (cục bộ, bất biến tịnh tiến, phân cấp) nên ít dữ liệu vẫn học tốt. ViT gần như không có định kiến nào, phải HỌC cả những điều đó từ dữ liệu — nên thua ở dữ liệu nhỏ, vượt lên ở dữ liệu rất lớn vì không bị định kiến giới hạn trần.',
    },
    {
      hoi: 'Vì sao ViT cắt patch thay vì đưa từng pixel vào attention?',
      dap: 'Attention tốn O(n²): ảnh 224×224 có 50.176 pixel là bất khả thi. Cắt patch 16×16 rút chuỗi còn 196 phần tử — ngắn hơn 256 lần, chi phí attention giảm khoảng 65.000 lần.',
    },
  ],
}
```

---

## 2. Chương 2 — Object detection (`cv2-u2`, 4 bài)

File `packages/subject-programming/lessons/cv2u2.ts`, export `CV2_U2_LESSONS`.

### Bài 1 — `cv2-u2-l1`

```typescript
{
  id: 'cv2-u2-l1',
  unitId: 'cv2-u2',
  language: 'python',
  title: 'Bài toán phát hiện vật — hộp, lớp và điểm tin cậy',
  hook: 'Phân loại ảnh trả lời "trong ảnh có gì" — một chữ. Xe tự lái cần nhiều hơn: có gì, ở ĐÂU, và bao nhiêu cái. Nó không hỏi "ảnh này có người không" mà hỏi "có 3 người, người gần nhất cách 4 mét, ở góc dưới trái".',
  theory:
    'PHÁT HIỆN VẬT (object detection) = với mỗi vật trong ảnh, trả về BỘ BA:\n1. HỘP BAO (bounding box) — vị trí. Hai định dạng thông dụng, lẫn nhau là sai hết: (x1, y1, x2, y2) tức góc trên-trái và góc dưới-phải; hoặc (cx, cy, w, h) tức tâm và kích thước. Khoá này dùng định dạng thứ nhất. Toạ độ ảnh có gốc ở GÓC TRÊN-TRÁI, y tăng khi đi XUỐNG — khác trục toạ độ toán học quen thuộc.\n2. LỚP (class) — vật gì: người, xe, chó…\n3. ĐIỂM TIN CẬY (confidence) — mô hình chắc bao nhiêu, số thực 0–1.\n\nMô hình thật không nhả ra vài hộp gọn ghẽ: YOLO đưa ra HÀNG NGHÌN hộp ứng viên cho mỗi ảnh. Hai bước lọc luôn đi kèm, và đây là toàn bộ chương 2:\n- LỌC THEO NGƯỠNG TIN CẬY: bỏ hộp có điểm dưới ngưỡng (thường 0,25–0,5). Bài này.\n- NON-MAX SUPPRESSION: gộp các hộp chồng nhau cùng chỉ một vật (bài 3), dựa trên thước đo IoU (bài 2).\n\nChọn ngưỡng tin cậy là một QUYẾT ĐỊNH SẢN PHẨM chứ không phải hằng số kỹ thuật: ngưỡng cao → ít báo động giả nhưng bỏ lọt vật (nguy hiểm cho xe tự lái); ngưỡng thấp → bắt được gần hết nhưng nhiễu (mệt cho camera an ninh báo về điện thoại lúc 3 giờ sáng). Đúng cặp precision/recall của bài `ml-u1-l4`, chỉ là mặc áo thị giác máy tính.',
  workedExample: {
    code: `# Ba hop ung vien tu mo hinh: (x1, y1, x2, y2, lop, diem tin cay)
boxes = [
    (0, 0, 10, 10, "nguoi", 0.92),
    (5, 5, 15, 20, "xe", 0.45),
    (20, 20, 30, 26, "cho", 0.77),
]

nguong = 0.5                       # quyet dinh san pham, khong phai hang so
for (x1, y1, x2, y2, nhan, diem) in boxes:
    rong = x2 - x1                 # chieu rong hop
    cao = y2 - y1                  # chieu cao hop (y tang khi di XUONG)
    trang_thai = "GIU" if diem >= nguong else "BO"
    print(f"{nhan}: {rong}x{cao}, dien tich {rong * cao}, diem {diem} -> {trang_thai}")`,
    stdinLines: [],
  },
  predict: {
    code: `x1, y1, x2, y2 = 2, 3, 8, 9\nprint((x2 - x1) * (y2 - y1))`,
    question: 'Hộp (2,3,8,9) có diện tích bao nhiêu?',
    choices: ['36', '48', '24', '18'],
    answerIndex: 0,
    explain:
      'Rộng = 8 − 2 = 6, cao = 9 − 3 = 6, diện tích = 36. Nhớ trừ đúng chiều: LUÔN là toạ độ lớn trừ toạ độ nhỏ. Đảo ngược sẽ ra số âm và làm hỏng IoU ở bài sau — đây là lỗi kinh điển của người mới.',
  },
  parsons: {
    prompt: 'Xếp đúng vòng lọc hộp theo ngưỡng tin cậy và in diện tích.',
    lines: [
      'giu = [b for b in boxes if b[5] >= nguong]',
      'print(f"So vat giu lai: {len(giu)}")',
      'for (x1, y1, x2, y2, nhan, diem) in giu:',
      '    print(f"{nhan}: dien tich {(x2 - x1) * (y2 - y1)}, diem {diem}")',
    ],
  },
  make: {
    prompt:
      'Viết bước lọc đầu tiên của mọi bộ phát hiện vật: bỏ các hộp có điểm tin cậy dưới ngưỡng.\n\nDanh sách hộp đã nhúng sẵn trong starter code, mỗi hộp là (x1, y1, x2, y2, lop, diem).\n\nChương trình đọc 1 dòng input(): ngưỡng tin cậy (số thực). Giữ lại hộp có điểm LỚN HƠN HOẶC BẰNG ngưỡng, giữ nguyên thứ tự ban đầu. In:\nSo vat giu lai: <n>\nrồi mỗi hộp giữ lại một dòng:\n<lop>: dien tich <(x2-x1)*(y2-y1)>, diem <diem>',
    starterCode: `boxes = [\n    (0, 0, 10, 10, "nguoi", 0.92),\n    (5, 5, 15, 20, "xe", 0.45),\n    (20, 20, 30, 26, "cho", 0.77),\n]\nnguong = float(input("Nguong tin cay: "))\n# Loc theo b[5] >= nguong roi in so luong va tung dong\n`,
    testCases: [
      {
        stdinLines: ['0.5'],
        expected: 'So vat giu lai: 2\nnguoi: dien tich 100, diem 0.92\ncho: dien tich 60, diem 0.77',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng 0.5 → loại "xe" (0.45), còn 2 vật',
      },
      {
        stdinLines: ['0.8'],
        expected: 'So vat giu lai: 1\nnguoi: dien tich 100, diem 0.92',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng cao 0.8 → chỉ còn "nguoi"',
      },
      {
        stdinLines: ['0.0'],
        expected: 'So vat giu lai: 3',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng 0 → giữ hết (nhiều báo động giả)',
      },
      {
        stdinLines: ['0.95'],
        expected: 'So vat giu lai: 0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: ngưỡng quá cao → không giữ vật nào, vẫn phải in dòng đếm',
      },
    ],
    hints: [
      'Lọc bằng list comprehension: giu = [b for b in boxes if b[5] >= nguong] — chỉ số 5 là điểm tin cậy.',
      'Dùng >= chứ không phải > (hộp đúng bằng ngưỡng vẫn được giữ).',
      'Diện tích = (x2 - x1) * (y2 - y1). Ca 0 hộp vẫn phải in dòng "So vat giu lai: 0" rồi kết thúc.',
    ],
    sampleSolution: `boxes = [\n    (0, 0, 10, 10, "nguoi", 0.92),\n    (5, 5, 15, 20, "xe", 0.45),\n    (20, 20, 30, 26, "cho", 0.77),\n]\nnguong = float(input("Nguong tin cay: "))\ngiu = [b for b in boxes if b[5] >= nguong]\nprint(f"So vat giu lai: {len(giu)}")\nfor (x1, y1, x2, y2, nhan, diem) in giu:\n    print(f"{nhan}: dien tich {(x2 - x1) * (y2 - y1)}, diem {diem}")`,
  },
  homework:
    'Chọn ngưỡng cho hai sản phẩm rồi biện hộ bằng 2–3 câu mỗi cái: (a) xe tự lái phát hiện người đi bộ; (b) camera an ninh gửi thông báo về điện thoại bạn ban đêm. Cùng một mô hình, cùng một tấm ảnh — vì sao hai ngưỡng phải khác nhau? Loại sai nào đắt hơn ở từng ca?',
  srsCards: [
    {
      hoi: 'Một kết quả phát hiện vật gồm những gì?',
      dap: 'Bộ ba: HỘP BAO (x1,y1,x2,y2 hoặc cx,cy,w,h — gốc toạ độ ở góc trên-trái, y tăng khi xuống) · LỚP của vật · ĐIỂM TIN CẬY 0–1. Khác phân loại ảnh chỉ trả về một nhãn cho cả ảnh.',
    },
    {
      hoi: 'Hai bước lọc sau khi mô hình detection nhả ra hàng nghìn hộp ứng viên?',
      dap: 'Lọc theo ngưỡng tin cậy (bỏ hộp điểm thấp, thường 0,25–0,5) rồi non-max suppression (gộp các hộp chồng nhau chỉ cùng một vật, dựa trên IoU).',
    },
    {
      hoi: 'Đặt ngưỡng tin cậy cao hay thấp thì đánh đổi gì?',
      dap: 'Cao: ít báo động giả (precision cao) nhưng bỏ lọt vật — nguy hiểm cho xe tự lái. Thấp: bắt gần hết (recall cao) nhưng nhiễu nhiều — phiền cho camera báo động. Chọn theo HẬU QUẢ của từng loại sai, không có giá trị đúng chung.',
    },
  ],
}
```

### Bài 2 — `cv2-u2-l2` (mô phỏng bắt buộc: IoU)

```typescript
{
  id: 'cv2-u2-l2',
  unitId: 'cv2-u2',
  language: 'python',
  title: 'IoU tự cài — đo hai hộp trùng nhau bao nhiêu',
  hook: 'Mô hình khoanh người đi bộ ở (10,20)-(50,80); đáp án đúng là (12,22)-(48,78). Đúng hay sai? Không có "đúng/sai" — cần một CON SỐ đo độ trùng. Con số đó tên là IoU, và cả ngành object detection đứng trên nó: chấm điểm mô hình bằng nó, lọc hộp thừa cũng bằng nó.',
  theory:
    'IoU (Intersection over Union — giao trên hợp) = diện tích phần GIAO NHAU / diện tích phần HỢP LẠI. Kết quả luôn nằm trong [0, 1]: 0 là rời hẳn, 1 là trùng khít.\n\nCài đúng 4 bước, và bước 2 là chỗ ai cũng sai lần đầu:\n1. Hình chữ nhật GIAO: x1 = max(a.x1, b.x1), y1 = max(a.y1, b.y1), x2 = min(a.x2, b.x2), y2 = min(a.y2, b.y2). Nhớ mẹo: giao thì lấy MAX của hai mép trái và MIN của hai mép phải.\n2. Diện tích giao = max(0, x2 − x1) * max(0, y2 − y1). BẮT BUỘC có max(0, …): hai hộp rời nhau cho x2 − x1 ÂM, nhân hai số âm ra số DƯƠNG — IoU sẽ dương một cách vô lý cho hai hộp chẳng dính gì nhau. Đây là lỗi kinh điển, và nó im lặng: code chạy, không báo lỗi, chỉ ra số sai.\n3. Diện tích hợp = dt_A + dt_B − dt_giao (trừ đi vì phần giao đã bị đếm hai lần).\n4. IoU = giao / hợp, phòng chia cho 0 khi cả hai hộp suy biến.\n\nDùng IoU ở hai chỗ, phải phân biệt:\n- CHẤM ĐIỂM mô hình: một dự đoán được tính là ĐÚNG nếu IoU với hộp thật ≥ ngưỡng. Chỉ số mAP@0.5 nghĩa là ngưỡng 0,5; mAP@[.5:.95] là trung bình qua nhiều ngưỡng từ 0,5 đến 0,95 — chuẩn khắt khe của bộ COCO.\n- LỌC hộp trùng: chính là NMS ở bài sau.\n\nHọ hàng cần biết mặt: GIoU, DIoU, CIoU — các biến thể vá điểm yếu "IoU bằng 0 thì không có gradient để học" khi hai hộp chưa hề chạm nhau.',
  workedExample: {
    code: `# IoU cua hai hop chong nhau mot goc
a = (0, 0, 10, 10)          # (x1, y1, x2, y2)
b = (5, 5, 15, 15)

x1 = max(a[0], b[0])        # mep trai cua phan giao: lay MAX
y1 = max(a[1], b[1])
x2 = min(a[2], b[2])        # mep phai cua phan giao: lay MIN
y2 = min(a[3], b[3])

rong = max(0, x2 - x1)      # max(0,..) BAT BUOC: hop roi nhau cho so am
cao = max(0, y2 - y1)
giao = rong * cao
print(f"Phan giao: {rong} x {cao} = {giao}")

dt_a = (a[2] - a[0]) * (a[3] - a[1])
dt_b = (b[2] - b[0]) * (b[3] - b[1])
hop = dt_a + dt_b - giao    # tru phan giao vi da dem hai lan
print(f"Phan hop: {dt_a} + {dt_b} - {giao} = {hop}")
print(f"IoU: {round(giao / hop, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `a = (0, 0, 10, 10)\nb = (20, 20, 30, 30)\nx2, x1 = min(a[2], b[2]), max(a[0], b[0])\ny2, y1 = min(a[3], b[3]), max(a[1], b[1])\nprint((x2 - x1) * (y2 - y1))`,
    question: 'Hai hộp RỜI HẲN nhau — biểu thức thiếu max(0,…) này in ra gì?',
    choices: ['100', '0', '-100', '200'],
    answerIndex: 0,
    explain:
      'x2 − x1 = 10 − 20 = −10 và y2 − y1 = −10; nhân hai số âm ra +100. Hai hộp cách nhau cả chục đơn vị mà "diện tích giao" lại là 100! Đây đúng là lý do phải bọc max(0, …) quanh từng chiều — lỗi này không hề báo, chỉ lặng lẽ trả số sai.',
  },
  parsons: {
    prompt: 'Xếp đúng 4 bước tính IoU: hình chữ nhật giao → diện tích giao (có max 0) → hợp → chia.',
    lines: [
      'x1 = max(a[0], b[0])',
      'y1 = max(a[1], b[1])',
      'x2 = min(a[2], b[2])',
      'y2 = min(a[3], b[3])',
      'giao = max(0.0, x2 - x1) * max(0.0, y2 - y1)',
      'hop = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - giao',
      'print(f"IoU: {round(giao / hop, 4)}")',
    ],
  },
  make: {
    prompt:
      'Tự cài IoU cho hai hộp bất kỳ.\n\nChương trình đọc 2 dòng input(), mỗi dòng là một hộp dạng "x1,y1,x2,y2" (số thực, cách nhau dấu phẩy).\n\nIn đúng 2 dòng:\nDien tich giao: <giao làm tròn 2>\nIoU: <iou làm tròn 4>\n\nBẮT BUỘC dùng max(0.0, …) cho cả chiều rộng lẫn chiều cao phần giao. Nếu diện tích hợp bằng 0 thì IoU là 0.0.\n\nVí dụ: "0,0,10,10" và "5,5,15,15" → giao 25.0, IoU 0.1429.',
    starterCode: `a = [float(v) for v in input("Box A: ").split(",")]\nb = [float(v) for v in input("Box B: ").split(",")]\n# x1 = max(a[0], b[0]) ... x2 = min(a[2], b[2]) ...\n# giao = max(0.0, x2-x1) * max(0.0, y2-y1)\n# hop = dt_a + dt_b - giao ; iou = giao / hop (phong hop == 0)\n`,
    testCases: [
      {
        stdinLines: ['0,0,10,10', '5,5,15,15'],
        expected: 'Dien tich giao: 25.0\nIoU: 0.1429',
        match: 'contains',
        hidden: false,
        label: 'Chồng một góc: giao 25, hợp 175 → 0.1429',
      },
      {
        stdinLines: ['0,0,10,10', '0,0,10,10'],
        expected: 'Dien tich giao: 100.0\nIoU: 1.0',
        match: 'contains',
        hidden: false,
        label: 'Trùng khít → IoU đúng bằng 1.0',
      },
      {
        stdinLines: ['0,0,10,10', '20,20,30,30'],
        expected: 'Dien tich giao: 0.0\nIoU: 0.0',
        match: 'contains',
        hidden: false,
        label: 'Rời hẳn → 0.0 (thiếu max(0,..) sẽ ra 100, sai!)',
      },
      {
        stdinLines: ['0,0,4,4', '2,0,6,4'],
        expected: 'IoU: 0.3333',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: chồng nửa theo chiều ngang — giao 8, hợp 24',
      },
    ],
    hints: [
      'Phần giao: mép trái lấy MAX của hai x1, mép phải lấy MIN của hai x2 (tương tự cho y).',
      'Đừng quên max(0.0, x2 - x1) và max(0.0, y2 - y1) — không có nó thì hai hộp rời nhau ra IoU dương, sai âm thầm.',
      'hop = dt_a + dt_b - giao (trừ vì phần giao bị đếm hai lần). In: round(giao, 2) và round(iou, 4).',
    ],
    sampleSolution: `a = [float(v) for v in input("Box A: ").split(",")]\nb = [float(v) for v in input("Box B: ").split(",")]\nx1 = max(a[0], b[0])\ny1 = max(a[1], b[1])\nx2 = min(a[2], b[2])\ny2 = min(a[3], b[3])\nrong = max(0.0, x2 - x1)\ncao = max(0.0, y2 - y1)\ngiao = rong * cao\ndt_a = (a[2] - a[0]) * (a[3] - a[1])\ndt_b = (b[2] - b[0]) * (b[3] - b[1])\nhop = dt_a + dt_b - giao\niou = giao / hop if hop > 0 else 0.0\nprint(f"Dien tich giao: {round(giao, 2)}")\nprint(f"IoU: {round(iou, 4)}")`,
  },
  homework:
    'Cố tình BỎ max(0.0, …) trong code của bạn rồi chạy lại ca "0,0,10,10" và "20,20,30,30". Ghi lại con số sai nhận được và giải thích bằng lời vì sao hai số âm nhân nhau lại ra diện tích dương. Sau đó tìm hai hộp có IoU khoảng 0,5 và vẽ ra giấy — cảm nhận xem "trùng một nửa" trông như thế nào, vì 0,5 chính là ngưỡng mặc định của mAP@0.5.',
  srsCards: [
    {
      hoi: 'Công thức IoU và ý nghĩa các giá trị?',
      dap: 'IoU = diện tích GIAO / diện tích HỢP, luôn trong [0,1]: 0 là rời hẳn, 1 là trùng khít. Hợp = dt_A + dt_B − dt_giao (trừ vì phần giao bị đếm hai lần).',
    },
    {
      hoi: 'Vì sao bắt buộc bọc max(0, …) khi tính diện tích giao?',
      dap: 'Hai hộp rời nhau cho x2−x1 và y2−y1 đều ÂM; nhân hai số âm ra diện tích DƯƠNG, khiến IoU dương một cách vô lý. Lỗi này không báo gì, chỉ âm thầm trả số sai.',
    },
    {
      hoi: 'IoU được dùng ở hai chỗ nào trong object detection?',
      dap: 'Chấm điểm (một dự đoán tính là đúng nếu IoU với hộp thật ≥ ngưỡng — mAP@0.5, mAP@[.5:.95]) và lọc hộp trùng trong non-max suppression.',
    },
  ],
}
```

### Bài 3 — `cv2-u2-l3` (mô phỏng bắt buộc: NMS)

```typescript
{
  id: 'cv2-u2-l3',
  unitId: 'cv2-u2',
  language: 'python',
  title: 'Non-max suppression — 5 hộp chồng nhau, giữ lại 2',
  hook: 'YOLO nhìn một người đi bộ và nhả ra 40 hộp gần như chồng khít lên nhau, mỗi hộp lệch vài pixel. Không ai muốn thấy 40 khung đỏ quanh một người. Cần một luật thu dọn: giữ hộp tự tin nhất, dẹp mọi hộp trùng nó. Luật đó tên là NMS, và bạn sắp tự viết nó trong 12 dòng.',
  theory:
    'NON-MAX SUPPRESSION (NMS — triệt tiêu các đỉnh không lớn nhất) là thuật toán THAM LAM, đúng 4 bước:\n1. Sắp xếp mọi hộp theo điểm tin cậy GIẢM DẦN.\n2. Lấy hộp điểm cao nhất còn lại, ĐƯA VÀO kết quả giữ.\n3. LOẠI khỏi danh sách mọi hộp có IoU với hộp vừa giữ VƯỢT ngưỡng — chúng bị coi là "cũng chính vật đó".\n4. Lặp lại từ bước 2 cho tới khi danh sách rỗng.\n\nNgưỡng IoU của NMS là một núm vặn có hậu quả rõ ràng và ngược đời với trực giác lần đầu:\n- Ngưỡng THẤP (0,1–0,3): loại hăng, gộp mạnh → ít hộp còn lại. Rủi ro: hai vật thật đứng sát nhau (hai người ôm nhau, dãy xe kẹt đường) bị gộp thành một, MẤT một vật.\n- Ngưỡng CAO (0,7–0,9): loại dè dặt → nhiều hộp trùng sót lại quanh cùng một vật.\nGiá trị thông dụng là 0,45–0,5. Chú ý: NMS chạy RIÊNG cho từng lớp — hộp "người" chồng hộp "xe" thì không được loại nhau, vì đó là hai vật khác nhau thật.\n\nBiến thể phải biết tên: Soft-NMS (thay vì xoá thẳng thì HẠ điểm hộp chồng — tốt cho cảnh đông đúc); và các mô hình kiểu DETR bỏ hẳn NMS bằng cách huấn luyện với "ghép cặp Hungary" để mỗi vật chỉ sinh ra đúng một dự đoán (bài sau). Nói cách khác, NMS là miếng vá cho một kiến trúc nhả thừa; kiến trúc mới thì không cần vá.\n\nMột chi tiết cài đặt hay bị bỏ qua: dùng "IoU <= ngưỡng thì GIỮ" (không phải <) để ngưỡng 0.0 vẫn giữ được các hộp rời hẳn nhau (IoU đúng bằng 0).',
  workedExample: {
    code: `def iou(a, b):
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    giao = max(0, x2 - x1) * max(0, y2 - y1)
    hop = (a[2]-a[0])*(a[3]-a[1]) + (b[2]-b[0])*(b[3]-b[1]) - giao
    return giao / hop if hop > 0 else 0.0

boxes = [(0, 0, 10, 10, 0.95), (1, 1, 11, 11, 0.90), (50, 50, 60, 60, 0.80)]
nguong = 0.5

con_lai = sorted(boxes, key=lambda b: -b[4])   # (1) sap theo diem GIAM dan
giu = []
while con_lai:
    tot_nhat = con_lai.pop(0)                  # (2) lay hop tu tin nhat
    giu.append(tot_nhat)
    # (3) loai moi hop trung no qua nguong; <= nguong thi GIU
    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]
print(f"Con lai {len(giu)} hop tu {len(boxes)} hop ban dau")`,
    stdinLines: [],
  },
  predict: {
    code: `boxes = [(0, 0, 10, 10, 0.7), (0, 0, 10, 10, 0.9), (0, 0, 10, 10, 0.8)]\ncon = sorted(boxes, key=lambda b: -b[4])\nprint(con[0][4])`,
    question: 'Sau khi sắp xếp giảm dần theo điểm, hộp đầu tiên có điểm bao nhiêu?',
    choices: ['0.9', '0.7', '0.8', '1.0'],
    answerIndex: 0,
    explain:
      'key=lambda b: -b[4] đổi dấu điểm nên sort tăng dần theo số âm = giảm dần theo điểm thật → 0.9 đứng đầu. Bước sắp xếp này là linh hồn của NMS: hộp tự tin nhất luôn được chọn trước, mọi hộp trùng nó bị dẹp.',
  },
  parsons: {
    prompt: 'Xếp đúng vòng lặp NMS: sắp giảm dần → lấy hộp đầu → giữ → loại hộp trùng.',
    lines: [
      'con_lai = sorted(boxes, key=lambda b: -b[4])',
      'giu = []',
      'while con_lai:',
      '    tot_nhat = con_lai.pop(0)',
      '    giu.append(tot_nhat)',
      '    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]',
    ],
  },
  make: {
    prompt:
      'Tự cài non-max suppression trên 5 hộp đã nhúng sẵn (mỗi hộp là (x1, y1, x2, y2, diem)).\n\nChương trình đọc 1 dòng input(): ngưỡng IoU (số thực).\n\nLàm đúng 4 bước: sắp giảm dần theo điểm → lấy hộp tốt nhất → giữ → loại mọi hộp có IoU VƯỢT ngưỡng (dùng "<= nguong thì giữ"). In:\nSo box con lai: <n>\nrồi mỗi hộp giữ lại một dòng theo thứ tự đã giữ:\n(<x1>,<y1>,<x2>,<y2>) diem <diem>\n\nVới ngưỡng 0.3 → còn 2 hộp.',
    starterCode: `boxes = [\n    (0, 0, 10, 10, 0.95),\n    (1, 1, 11, 11, 0.90),\n    (2, 0, 12, 10, 0.85),\n    (50, 50, 60, 60, 0.80),\n    (52, 52, 62, 62, 0.70),\n]\nnguong = float(input("Nguong IoU: "))\n\ndef iou(a, b):\n    # Chep lai cong thuc IoU cua bai truoc (nho max(0, ...))\n    return 0.0\n\n# sorted(..., key=lambda b: -b[4]) roi vong while nhu bai hoc\n`,
    testCases: [
      {
        stdinLines: ['0.3'],
        expected: 'So box con lai: 2\n(0,0,10,10) diem 0.95\n(50,50,60,60) diem 0.8',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng 0.3 → 5 hộp gộp còn đúng 2 vật',
      },
      {
        stdinLines: ['0.5'],
        expected: 'So box con lai: 3',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng 0.5 → cặp xa (IoU 0.47) không bị gộp nữa, còn 3',
      },
      {
        stdinLines: ['0.9'],
        expected: 'So box con lai: 5',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng quá cao → không loại ai, thừa hộp quanh cùng một vật',
      },
      {
        stdinLines: ['0.0'],
        expected: 'So box con lai: 2\n(0,0,10,10) diem 0.95\n(50,50,60,60) diem 0.8',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: ngưỡng 0.0 — dùng "<=" nên hộp RỜI HẲN (IoU = 0) vẫn được giữ',
      },
    ],
    hints: [
      'Hàm iou chép nguyên từ bài trước, nhớ max(0, …) — sai chỗ này thì mọi ca đều lệch.',
      'Sắp giảm dần: con_lai = sorted(boxes, key=lambda b: -b[4]). Vòng while con_lai: pop(0) lấy hộp đầu.',
      'Điều kiện GIỮ là iou(tot_nhat, b) <= nguong (không phải <): nhờ vậy ngưỡng 0.0 vẫn giữ được hộp rời hẳn có IoU đúng bằng 0.',
    ],
    sampleSolution: `boxes = [\n    (0, 0, 10, 10, 0.95),\n    (1, 1, 11, 11, 0.90),\n    (2, 0, 12, 10, 0.85),\n    (50, 50, 60, 60, 0.80),\n    (52, 52, 62, 62, 0.70),\n]\nnguong = float(input("Nguong IoU: "))\n\n\ndef iou(a, b):\n    x1 = max(a[0], b[0])\n    y1 = max(a[1], b[1])\n    x2 = min(a[2], b[2])\n    y2 = min(a[3], b[3])\n    giao = max(0, x2 - x1) * max(0, y2 - y1)\n    dt_a = (a[2] - a[0]) * (a[3] - a[1])\n    dt_b = (b[2] - b[0]) * (b[3] - b[1])\n    hop = dt_a + dt_b - giao\n    return giao / hop if hop > 0 else 0.0\n\n\ncon_lai = sorted(boxes, key=lambda b: -b[4])\ngiu = []\nwhile con_lai:\n    tot_nhat = con_lai.pop(0)\n    giu.append(tot_nhat)\n    con_lai = [b for b in con_lai if iou(tot_nhat, b) <= nguong]\nprint(f"So box con lai: {len(giu)}")\nfor b in giu:\n    print(f"({b[0]},{b[1]},{b[2]},{b[3]}) diem {b[4]}")`,
  },
  homework:
    'Chạy code với các ngưỡng 0.1, 0.3, 0.5, 0.7, 0.9 và lập bảng "ngưỡng → số hộp còn lại". Rồi nghĩ một cảnh thật mà ngưỡng THẤP gây hại: hai người đứng ôm nhau, hộp của họ chồng nhau IoU ~0,4 — chuyện gì xảy ra với ngưỡng 0,3? Từ đó tự tra xem Soft-NMS vá vấn đề này bằng cách nào (gợi ý: nó HẠ điểm thay vì XOÁ).',
  srsCards: [
    {
      hoi: 'Non-max suppression làm việc theo 4 bước nào?',
      dap: 'Sắp mọi hộp theo điểm tin cậy giảm dần → lấy hộp điểm cao nhất còn lại và giữ nó → loại mọi hộp có IoU với nó vượt ngưỡng (coi là cùng một vật) → lặp tới khi hết hộp. Thuật toán tham lam.',
    },
    {
      hoi: 'Đặt ngưỡng IoU của NMS thấp hay cao thì hỏng kiểu gì?',
      dap: 'Thấp (0,1–0,3): gộp mạnh, hai vật thật đứng sát nhau bị nhập làm một → MẤT vật. Cao (0,7–0,9): loại dè dặt, còn nhiều hộp trùng quanh cùng một vật. Thông dụng 0,45–0,5.',
    },
    {
      hoi: 'Vì sao NMS phải chạy riêng cho từng lớp, và mô hình nào bỏ được NMS?',
      dap: 'Hộp "người" chồng hộp "xe" là hai vật khác nhau thật, không được loại nhau. DETR bỏ hẳn NMS nhờ huấn luyện ghép cặp Hungary — mỗi vật chỉ sinh đúng một dự đoán; Soft-NMS thì hạ điểm thay vì xoá.',
    },
  ],
}
```

### Bài 4 — `cv2-u2-l4`

```typescript
{
  id: 'cv2-u2-l4',
  unitId: 'cv2-u2',
  language: 'python',
  title: 'Dòng họ mô hình phát hiện — hai pha, một pha và transformer',
  hook: 'Hỏi "mô hình phát hiện vật nào tốt nhất" cũng như hỏi "xe nào tốt nhất". Xe tải chở được nhiều, xe máy luồn được ngõ nhỏ. Camera đếm người trong siêu thị và xe tự lái chạy 100 km/h cần hai loại "xe" khác hẳn nhau — và tiêu chí chọn thì đếm được, không cảm tính.',
  theory:
    'Ba dòng họ, xếp theo thứ tự lịch sử và theo triết lý thiết kế:\n\n1. HAI PHA (two-stage) — R-CNN → Fast R-CNN → Faster R-CNN. Pha 1 đề xuất các vùng có thể có vật (region proposal); pha 2 phân loại và tinh chỉnh từng vùng. Như đọc lướt tìm đoạn khả nghi rồi mới đọc kỹ từng đoạn. Chính xác cao, nhất là với vật NHỎ; chậm (thường 5–15 FPS).\n\n2. MỘT PHA (one-stage) — YOLO, SSD, RetinaNet. Chia ảnh thành lưới, MỖI Ô đồng thời đoán hộp + lớp + điểm, tất cả trong một lần chạy mạng. Tên YOLO nói đúng ý: "You Only Look Once". Rất nhanh (30–150 FPS, chạy được thời gian thực trên thiết bị nhúng), xưa kém chính xác hơn nhưng khoảng cách đã hẹp gần hết ở các bản 2023–2026.\n\n3. TRANSFORMER (DETR và hậu duệ). Coi phát hiện vật là bài toán DỰ ĐOÁN TẬP HỢP: mô hình nhả ra đúng N "chỗ trống truy vấn", huấn luyện bằng ghép cặp Hungary để mỗi vật thật khớp đúng một dự đoán. Hệ quả đẹp: KHÔNG cần anchor box, KHÔNG cần NMS — hai miếng vá thủ công biến mất. Giá phải trả: hội tụ chậm khi huấn luyện (bản gốc cần rất nhiều epoch), và ngốn dữ liệu.\n\nCÁCH CHỌN, theo thứ tự câu hỏi phải trả lời:\n- Cần bao nhiêu FPS? Dưới 10 thì mọi lựa chọn đều mở; từ 30 trở lên gần như bắt buộc một pha.\n- Chạy ở đâu? Điện thoại/camera nhúng → một pha, mô hình nhỏ. Máy chủ có GPU → tuỳ.\n- Vật to hay nhỏ, dày hay thưa? Vật nhỏ và cảnh đông → nghiêng về hai pha hoặc DETR biến thể.\n- Có bao nhiêu ảnh gán nhãn? Ít → dùng mô hình pretrained + transfer learning (cv1), tránh DETR gốc.\nĐây là cùng một kiểu quyết định với "CNN hay ViT" ở `cv2-u1-l4`: không có nhà vô địch tuyệt đối, chỉ có lựa chọn hợp ràng buộc.',
  workedExample: {
    code: `# Bo chon mo hinh theo rang buoc san pham
def chon(fps, uu_tien):
    if uu_tien == "toc do" and fps >= 30:
        return "YOLO (mot pha)"          # thoi gian thuc, thiet bi nhung
    if uu_tien == "chinh xac" and fps < 10:
        return "Faster R-CNN (hai pha)"  # cham nhung ky, vat nho
    return "DETR (transformer)"          # can bang, bo anchor va NMS

print(chon(60, "toc do"))     # camera xe tu lai
print(chon(5, "chinh xac"))   # anh y te, xu ly theo lo
print(chon(20, "chinh xac"))  # o giua -> DETR`,
    stdinLines: [],
  },
  predict: {
    code: `fps = 45\nuu_tien = "toc do"\nprint("YOLO" if (uu_tien == "toc do" and fps >= 30) else "khac")`,
    question: 'Yêu cầu 45 FPS, ưu tiên tốc độ — máy in ra gì?',
    choices: ['YOLO', 'khac', 'DETR', 'Báo lỗi'],
    answerIndex: 0,
    explain:
      'Cả hai điều kiện đều đúng (45 ≥ 30 và ưu tiên là "toc do") nên nhánh đầu chạy. 30 FPS là mốc "thời gian thực" theo cảm nhận mắt người — dưới mức đó video bắt đầu giật, nên đây là con số kỹ thuật có gốc sinh học chứ không tuỳ tiện.',
  },
  parsons: {
    prompt: 'Xếp đúng bộ chọn mô hình: ưu tiên tốc độ + FPS cao → ưu tiên chính xác + FPS thấp → còn lại.',
    lines: [
      'if uu_tien == "toc do" and fps >= 30:',
      '    ten = "YOLO (mot pha)"',
      'elif uu_tien == "chinh xac" and fps < 10:',
      '    ten = "Faster R-CNN (hai pha)"',
      'else:',
      '    ten = "DETR (transformer)"',
      'print(f"Chon: {ten}")',
    ],
  },
  make: {
    prompt:
      'Viết bộ tư vấn chọn mô hình phát hiện vật.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số FPS cần đạt (số thực).\n- Dòng 2: ưu tiên, đúng một trong hai chuỗi "toc do" hoặc "chinh xac".\n\nÁp dụng đúng thứ tự luật:\n1. Nếu ưu tiên là "toc do" VÀ fps >= 30 → "YOLO (mot pha)"\n2. Nếu không, nếu ưu tiên là "chinh xac" VÀ fps < 10 → "Faster R-CNN (hai pha)"\n3. Còn lại → "DETR (transformer)"\n\nIn đúng 1 dòng: Chon: <tên mô hình>',
    starterCode: `fps = float(input("FPS can dat: "))\nuu_tien = input("Uu tien: ").strip()\n# Ba nhanh if / elif / else theo dung thu tu de cho\n`,
    testCases: [
      {
        stdinLines: ['60', 'toc do'],
        expected: 'Chon: YOLO (mot pha)',
        match: 'contains',
        hidden: false,
        label: 'Xe tự lái 60 FPS, ưu tiên tốc độ → YOLO',
      },
      {
        stdinLines: ['5', 'chinh xac'],
        expected: 'Chon: Faster R-CNN (hai pha)',
        match: 'contains',
        hidden: false,
        label: 'Ảnh y tế xử lý theo lô, cần kỹ → hai pha',
      },
      {
        stdinLines: ['20', 'chinh xac'],
        expected: 'Chon: DETR (transformer)',
        match: 'contains',
        hidden: false,
        label: 'Ở giữa hai thái cực → DETR',
      },
      {
        stdinLines: ['10', 'toc do'],
        expected: 'Chon: DETR (transformer)',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: ưu tiên tốc độ nhưng chỉ 10 FPS — chưa đủ 30 nên rơi xuống nhánh cuối',
      },
    ],
    hints: [
      'Nhớ .strip() cho dòng ưu tiên — chuỗi nhập có thể dính khoảng trắng thừa ở cuối.',
      'Thứ tự if/elif/else quan trọng: luật 1 xét trước, ca "toc do" mà fps thấp phải rơi xuống else.',
      'So chuỗi bằng == với đúng chữ "toc do" / "chinh xac" (không dấu, có khoảng trắng ở giữa).',
    ],
    sampleSolution: `fps = float(input("FPS can dat: "))\nuu_tien = input("Uu tien: ").strip()\nif uu_tien == "toc do" and fps >= 30:\n    ten = "YOLO (mot pha)"\nelif uu_tien == "chinh xac" and fps < 10:\n    ten = "Faster R-CNN (hai pha)"\nelse:\n    ten = "DETR (transformer)"\nprint(f"Chon: {ten}")`,
  },
  homework:
    'Chọn mô hình cho 3 bài toán thật và viết 2–3 câu biện hộ mỗi cái, nêu rõ FPS cần, thiết bị chạy, kích thước vật: (a) đếm người ra vào cửa hàng bằng camera Raspberry Pi; (b) phát hiện khối u nhỏ trên ảnh CT, chạy trên máy chủ, không gấp; (c) trọng tài bóng đá tự động bám bóng trực tiếp. Ràng buộc nào là ràng buộc QUYẾT ĐỊNH ở từng ca?',
  srsCards: [
    {
      hoi: 'Mô hình phát hiện hai pha khác một pha ở chỗ nào?',
      dap: 'Hai pha (Faster R-CNN): pha 1 đề xuất vùng khả nghi, pha 2 phân loại + tinh chỉnh từng vùng — chính xác hơn với vật nhỏ nhưng chậm (5–15 FPS). Một pha (YOLO/SSD): mỗi ô lưới đoán hộp + lớp + điểm trong một lần chạy — rất nhanh (30–150 FPS).',
    },
    {
      hoi: 'DETR bỏ được hai miếng vá thủ công nào, và trả giá gì?',
      dap: 'Bỏ anchor box và bỏ NMS, nhờ coi detection là dự đoán TẬP HỢP và huấn luyện bằng ghép cặp Hungary (mỗi vật khớp đúng một dự đoán). Giá: hội tụ chậm khi huấn luyện và cần nhiều dữ liệu.',
    },
    {
      hoi: 'Bốn câu hỏi cần trả lời khi chọn mô hình detection?',
      dap: 'Cần bao nhiêu FPS (≥30 thì gần như buộc một pha)? Chạy trên thiết bị gì (nhúng → mô hình nhỏ)? Vật to hay nhỏ, cảnh thưa hay đông (nhỏ/đông → hai pha hoặc DETR biến thể)? Có bao nhiêu ảnh gán nhãn (ít → pretrained + transfer learning)?',
    },
  ],
}
```

---

## 3. Chương 3 — Mô hình sinh ảnh (`cv2-u3`, 4 bài)

File `packages/subject-programming/lessons/cv2u3.ts`, export `CV2_U3_LESSONS`.

### Bài 1 — `cv2-u3-l1` (mô phỏng bắt buộc: GAN 2 người chơi)

```typescript
{
  id: 'cv2-u3-l1',
  unitId: 'cv2-u3',
  language: 'python',
  title: 'GAN — trò chơi hai người giữa kẻ làm giả và người giám định',
  hook: 'Một kẻ làm tiền giả và một chuyên gia ngân hàng chơi trò mèo vờn chuột nhiều năm. Chuyên gia giỏi lên thì tiền giả phải tinh vi hơn; tiền giả tinh vi hơn thì chuyên gia phải tinh mắt hơn. Sau vài nghìn vòng, tiền giả gần như thật. Năm 2014 Ian Goodfellow biến đúng câu chuyện này thành thuật toán.',
  theory:
    'GAN (Generative Adversarial Network — mạng đối kháng sinh mẫu) gồm hai mạng đấu nhau:\n- GENERATOR (G, kẻ làm giả): nhận nhiễu ngẫu nhiên, nhả ra một mẫu (ảnh) giả. MỤC TIÊU: lừa được D.\n- DISCRIMINATOR (D, giám định): nhận một mẫu, đoán thật hay giả. MỤC TIÊU: không bị lừa.\n\nHuấn luyện là hai bước xen kẽ nhau: (1) khoá G, luyện D phân biệt mẫu thật với mẫu G vừa làm; (2) khoá D, luyện G sao cho D chấm nhầm mẫu của nó là thật. Về mặt toán, đây là bài toán minimax — trò chơi tổng-không, khác hẳn tối ưu một mục tiêu như hồi quy. Điểm cân bằng lý tưởng (Nash) là khi phân phối mẫu do G sinh ra TRÙNG với phân phối dữ liệu thật, lúc đó D chỉ còn đoán bừa 50/50: nó thua vì không còn gì để phân biệt.\n\nĐiều quan trọng nhất phải nhớ: TÍN HIỆU HỌC CỦA G KHÔNG ĐẾN TỪ DỮ LIỆU THẬT, mà đến từ phản hồi của D. G chưa bao giờ được "nhìn" ảnh thật — nó chỉ nghe D nói "còn giả lắm" rồi tự sửa. Đó là lý do GAN đẹp về ý tưởng và khó về thực hành (bài sau).\n\nBài này mô phỏng bằng phiên bản một chiều TẤT ĐỊNH để nhìn rõ động lực học, không có random che mất bản chất: dữ liệu thật là vài con số, G là một tham số duy nhất theta (chính là "giá trị mà G sinh ra"), còn D rút gọn thành phản hồi "mẫu của bạn đang lệch trung bình thật bao nhiêu và về phía nào". Luật cập nhật: theta ← theta + lr × (trung_bình_thật − theta). Mỗi vòng theta thu hẹp một nửa khoảng cách (với lr = 0,5) — đó chính là hình ảnh "G học ra phân phối thật", đếm được bằng con số chứ không nói suông.',
  workedExample: {
    code: `# GAN mot chieu, tat dinh: G co dung MOT tham so theta
that = [4.0, 6.0, 5.0, 5.0]      # du lieu that
tb_that = sum(that) / len(that)  # trung binh that = 5.0 (G khong duoc nhin so nay)
theta = 1.0                      # G khoi dau rat te
lr = 0.5

for vong in range(1, 6):
    # D cham: mau cua G lech trung binh that bao nhieu, ve phia nao
    phan_hoi = tb_that - theta
    # G di theo phan hoi cua D (khong nhin thang du lieu that)
    theta = theta + lr * phan_hoi
    print(f"Vong {vong}: theta = {round(theta, 4)}, con lech = {round(abs(tb_that - theta), 4)}")

print(f"Trung binh that: {round(tb_that, 4)}")`,
    stdinLines: [],
  },
  predict: {
    code: `theta = 0.0\ntb = 10.0\nlr = 0.5\ntheta = theta + lr * (tb - theta)\nprint(theta)`,
    question: 'Sau MỘT vòng cập nhật với lr = 0.5, theta bằng bao nhiêu?',
    choices: ['5.0', '10.0', '0.5', '2.5'],
    answerIndex: 0,
    explain:
      '0.0 + 0.5 × (10.0 − 0.0) = 5.0 — đúng một nửa quãng đường tới đích. Mỗi vòng lại đi tiếp nửa khoảng cách còn lại (5 → 7.5 → 8.75…), nên G tiến gần phân phối thật rất nhanh lúc đầu rồi chậm dần: đúng dáng của một quá trình học hội tụ.',
  },
  parsons: {
    prompt: 'Xếp đúng vòng huấn luyện GAN mô phỏng: tính trung bình thật → lặp → D phản hồi → G cập nhật → in.',
    lines: [
      'tb_that = sum(that) / len(that)',
      'for vong in range(1, 6):',
      '    phan_hoi = tb_that - theta',
      '    theta = theta + lr * phan_hoi',
      '    print(f"Vong {vong}: theta = {round(theta, 4)}")',
    ],
  },
  make: {
    prompt:
      'Mô phỏng GAN một chiều: cho generator (một tham số theta) học ra trung bình của dữ liệu thật qua 5 vòng.\n\nChương trình đọc 2 dòng input():\n- Dòng 1: dữ liệu thật, các số cách nhau dấu phẩy (vd "4,6,5,5").\n- Dòng 2: theta ban đầu.\n\nĐặt lr = 0.5. Lặp đúng 5 vòng, mỗi vòng: phan_hoi = trung_bình_thật − theta; theta = theta + lr × phan_hoi. In mỗi vòng một dòng:\nVong <k>: theta = <theta làm tròn 4>, con lech = <|tb − theta| làm tròn 4>\nSau vòng cuối in thêm:\nTrung binh that: <tb làm tròn 4>',
    starterCode: `that = [float(v) for v in input("Du lieu that: ").split(",")]\ntheta = float(input("Theta ban dau: "))\nlr = 0.5\n# tb_that = trung binh cua that\n# for vong in range(1, 6): cap nhat theta roi in\n`,
    testCases: [
      {
        stdinLines: ['4,6,5,5', '1'],
        expected: 'Vong 1: theta = 3.0, con lech = 2.0\nVong 2: theta = 4.0, con lech = 1.0\nVong 3: theta = 4.5, con lech = 0.5\nVong 4: theta = 4.75, con lech = 0.25\nVong 5: theta = 4.875, con lech = 0.125\nTrung binh that: 5.0',
        match: 'contains',
        hidden: false,
        label: 'theta 1 → 4.875, mỗi vòng thu hẹp một nửa khoảng cách tới 5.0',
      },
      {
        stdinLines: ['10,10', '0'],
        expected: 'Vong 4: theta = 9.375, con lech = 0.625\nVong 5: theta = 9.6875, con lech = 0.3125\nTrung binh that: 10.0',
        match: 'contains',
        hidden: false,
        label: 'Khởi đầu xa (0 vs 10) vẫn hội tụ về gần 10',
      },
      {
        stdinLines: ['2,4', '3'],
        expected: 'Vong 1: theta = 3.0, con lech = 0.0\nTrung binh that: 3.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: G đã đúng ngay từ đầu → phản hồi bằng 0, theta đứng yên',
      },
    ],
    hints: [
      'Trung bình thật: tb_that = sum(that) / len(that) — tính MỘT LẦN trước vòng lặp.',
      'range(1, 6) cho vòng 1 đến 5. Trong vòng: phan_hoi = tb_that - theta rồi theta = theta + lr * phan_hoi (đúng thứ tự này).',
      'Độ lệch còn lại tính SAU khi cập nhật: round(abs(tb_that - theta), 4).',
    ],
    sampleSolution: `that = [float(v) for v in input("Du lieu that: ").split(",")]\ntheta = float(input("Theta ban dau: "))\nlr = 0.5\ntb_that = sum(that) / len(that)\nfor vong in range(1, 6):\n    phan_hoi = tb_that - theta\n    theta = theta + lr * phan_hoi\n    print(f"Vong {vong}: theta = {round(theta, 4)}, con lech = {round(abs(tb_that - theta), 4)}")\nprint(f"Trung binh that: {round(tb_that, 4)}")`,
  },
  homework:
    'Đổi lr thành 0.1, rồi 1.0, rồi 1.9 và chạy lại. Với lr = 0.1 sau 5 vòng theta tới đâu? Với lr = 1.0 thì sao (đạt đích ngay vòng 1)? Với lr = 1.9 thì theta có VƯỢT QUA đích rồi dao động không? Từ ba lần chạy đó, viết 3 câu về vì sao learning rate quá lớn khiến huấn luyện KHÔNG ổn định — đây chính là bệnh nặng nhất của GAN thật, học ở bài sau.',
  srsCards: [
    {
      hoi: 'GAN gồm hai mạng nào, mục tiêu của từng mạng?',
      dap: 'Generator (kẻ làm giả) nhận nhiễu, sinh mẫu giả, mục tiêu LỪA được discriminator. Discriminator (giám định) nhận mẫu, đoán thật/giả, mục tiêu KHÔNG bị lừa. Hai mạng luyện xen kẽ, là bài toán minimax chứ không phải tối ưu một mục tiêu.',
    },
    {
      hoi: 'Điểm cân bằng lý tưởng của GAN là gì?',
      dap: 'Khi phân phối do generator sinh ra TRÙNG với phân phối dữ liệu thật; lúc đó discriminator không còn gì để phân biệt nên chỉ đoán bừa 50/50.',
    },
    {
      hoi: 'Generator học từ đâu — nó có được nhìn dữ liệu thật không?',
      dap: 'KHÔNG. Generator chưa bao giờ nhìn thẳng ảnh thật; tín hiệu học của nó hoàn toàn đến từ phản hồi của discriminator ("còn giả lắm" / "gần thật rồi"). Đó vừa là vẻ đẹp vừa là điểm mong manh của GAN.',
    },
  ],
}
```

### Bài 2 — `cv2-u3-l2`

```typescript
{
  id: 'cv2-u3-l2',
  unitId: 'cv2-u3',
  language: 'python',
  title: 'Vì sao GAN khó huấn luyện — mode collapse',
  hook: 'Kẻ làm giả phát hiện chuyên gia hay bị lừa nhất bởi tờ 50 nghìn. Thế là hắn chỉ in duy nhất tờ 50 nghìn, hàng triệu bản y hệt. Hắn "thắng" theo đúng luật chơi, nhưng sản phẩm thì vô dụng. Trong GAN, chứng bệnh này có tên: mode collapse — và nó là lý do nhiều người bỏ GAN sang diffusion.',
  theory:
    'GAN đẹp trên giấy, khó trên máy. Ba bệnh kinh điển, xếp theo mức khó chịu:\n\n1. MODE COLLAPSE (sập chế độ). Dữ liệu thật có nhiều "mode" — chữ số 0 đến 9, nhiều giống chó, nhiều kiểu khuôn mặt. Generator phát hiện MỘT mẫu đủ lừa được discriminator hiện tại và chỉ sinh mãi mẫu đó (hoặc vài mẫu). Nó thắng trò chơi mà thua mục tiêu: bạn muốn một MÁY SINH ĐA DẠNG, nhận về một cái máy photocopy. Dấu hiệu nhận ra: sinh 100 mẫu thì thấy lặp đi lặp lại vài kiểu.\n\n2. MẤT CÂN BẰNG HAI ĐẤU THỦ. Nếu D quá mạnh, nó phân biệt đúng mọi thứ, phản hồi cho G bão hoà về gần 0 — G không còn gì để học (vanishing gradient). Nếu D quá yếu, phản hồi của nó vô nghĩa, G học theo tín hiệu rác. Huấn luyện GAN vì thế là nghệ thuật giữ hai bên NGANG SỨC.\n\n3. KHÔNG HỘI TỤ / DAO ĐỘNG. Vì là trò chơi hai người chứ không phải leo xuống một mặt sai số cố định, hai bên có thể đuổi nhau vòng tròn mãi. Tệ hơn: hàm mất mát của GAN gần như KHÔNG nói lên chất lượng — loss đẹp mà ảnh xấu là chuyện thường, nên người ta phải chấm bằng chỉ số riêng (FID) và bằng mắt.\n\nThuốc mà ngành đã tìm ra: WGAN + gradient penalty (đổi cách đo khoảng cách giữa hai phân phối, cho gradient lành hơn); spectral normalization (ghìm sức mạnh của D); minibatch discrimination (cho D nhìn CẢ LÔ để phát hiện lô toàn mẫu giống nhau — đánh thẳng vào mode collapse); và huấn luyện theo độ phân giải tăng dần (ProGAN, StyleGAN).\n\nĐo mode collapse thế nào? Cách thô nhất mà vẫn dùng được: sinh N mẫu, đếm số mẫu KHÁC NHAU, lấy tỷ lệ. Tỷ lệ thấp = nghi ngờ collapse. Nghề thật dùng FID (so thống kê đặc trưng của lô sinh với lô thật) hoặc precision/recall cho mô hình sinh, nhưng tinh thần vẫn là câu hỏi này: mẫu sinh ra có ĐA DẠNG như dữ liệu thật không?',
  workedExample: {
    code: `# Do da dang cua lo mau sinh: dau hieu tho cua mode collapse
lo_a = ["meo", "meo", "meo", "meo", "cho"]        # nghi ngo collapse
lo_b = ["meo", "cho", "chim", "ca", "ngua"]       # da dang tot

for ten, lo in [("Lo A", lo_a), ("Lo B", lo_b)]:
    khac = len(set(lo))                # set() bo trung lap
    ty_le = khac / len(lo)
    print(f"{ten}: {khac}/{len(lo)} mau khac nhau, do da dang {round(ty_le, 2)}")
    if ty_le < 0.5:
        print(f"  -> Canh bao: mode collapse")
    else:
        print(f"  -> On")`,
    stdinLines: [],
  },
  predict: {
    code: `lo = ["a", "a", "b", "a", "b"]\nprint(len(set(lo)) / len(lo))`,
    question: 'Độ đa dạng của lô này in ra là bao nhiêu?',
    choices: ['0.4', '0.5', '1.0', '0.2'],
    answerIndex: 0,
    explain:
      'set(["a","a","b","a","b"]) = {"a","b"} có 2 phần tử, chia cho 5 mẫu = 0.4. Sinh 5 mẫu mà chỉ có 2 kiểu là dấu hiệu generator đang lười: nó tìm được vài mẫu an toàn và bám lấy chúng thay vì học cả phân phối.',
  },
  parsons: {
    prompt: 'Xếp đúng máy đo mode collapse: đếm mẫu khác nhau → tính tỷ lệ → in → cảnh báo nếu dưới ngưỡng.',
    lines: [
      'khac = len(set(mau))',
      'ty_le = khac / len(mau)',
      'print(f"So mau khac nhau: {khac}/{len(mau)}")',
      'print(f"Do da dang: {round(ty_le, 2)}")',
      'if ty_le < 0.5:',
      '    print("Canh bao: mode collapse")',
      'else:',
      '    print("On: da dang chap nhan duoc")',
    ],
  },
  make: {
    prompt:
      'Viết máy phát hiện mode collapse cho một lô mẫu do generator sinh ra.\n\nChương trình đọc 1 dòng input(): các mẫu cách nhau dấu phẩy (vd "meo,meo,meo,meo,cho").\n\nTính độ đa dạng = số mẫu KHÁC NHAU / tổng số mẫu. In đúng 3 dòng:\nSo mau khac nhau: <khác>/<tổng>\nDo da dang: <tỷ lệ làm tròn 2>\nrồi "Canh bao: mode collapse" nếu tỷ lệ NHỎ HƠN 0.5, ngược lại "On: da dang chap nhan duoc".',
    starterCode: `mau = input("Mau sinh: ").split(",")\n# set(mau) bo trung lap; len(set(mau)) la so mau khac nhau\n`,
    testCases: [
      {
        stdinLines: ['meo,meo,meo,meo,cho'],
        expected: 'So mau khac nhau: 2/5\nDo da dang: 0.4\nCanh bao: mode collapse',
        match: 'contains',
        hidden: false,
        label: '5 mẫu chỉ 2 kiểu → 0.4, cảnh báo',
      },
      {
        stdinLines: ['a,b,c,d'],
        expected: 'So mau khac nhau: 4/4\nDo da dang: 1.0\nOn: da dang chap nhan duoc',
        match: 'contains',
        hidden: false,
        label: 'Khác nhau hết → 1.0, không cảnh báo',
      },
      {
        stdinLines: ['x,x,y,y'],
        expected: 'Do da dang: 0.5\nOn: da dang chap nhan duoc',
        match: 'contains',
        hidden: false,
        label: 'Đúng 0.5 — biên: NHỎ HƠN mới cảnh báo nên ca này "on"',
      },
      {
        stdinLines: ['k'],
        expected: 'So mau khac nhau: 1/1\nDo da dang: 1.0',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: đúng một mẫu — tỷ lệ 1.0, không chia cho 0',
      },
    ],
    hints: [
      'set() loại trùng lặp: len(set(mau)) là số mẫu khác nhau, len(mau) là tổng.',
      'Điều kiện cảnh báo là ty_le < 0.5 (nhỏ hơn thật sự) — ca đúng bằng 0.5 phải in "On".',
      'In tỷ lệ bằng round(ty_le, 2) để 0.4 và 0.5 hiện gọn, không ra 0.4000000001.',
    ],
    sampleSolution: `mau = input("Mau sinh: ").split(",")\nkhac = len(set(mau))\nty_le = khac / len(mau)\nprint(f"So mau khac nhau: {khac}/{len(mau)}")\nprint(f"Do da dang: {round(ty_le, 2)}")\nif ty_le < 0.5:\n    print("Canh bao: mode collapse")\nelse:\n    print("On: da dang chap nhan duoc")`,
  },
  homework:
    'Thước đo "đếm mẫu khác nhau" này hỏng ở đâu với ẢNH THẬT? (Gợi ý: hai ảnh lệch nhau đúng một pixel là "khác nhau" theo set(), nhưng mắt người thấy y hệt.) Viết 3 câu mô tả cách sửa: thay "bằng nhau tuyệt đối" bằng "gần nhau dưới một khoảng cách", rồi đọc lướt xem FID giải bài này bằng cách nào (so thống kê đặc trưng của cả lô, không so từng cặp ảnh).',
  srsCards: [
    {
      hoi: 'Mode collapse là gì?',
      dap: 'Generator phát hiện MỘT (hoặc vài) mẫu đủ lừa discriminator rồi chỉ sinh mãi mẫu đó — thắng trò chơi nhưng thua mục tiêu, vì ta cần máy sinh ĐA DẠNG chứ không phải máy photocopy. Dấu hiệu: sinh 100 mẫu chỉ thấy vài kiểu lặp lại.',
    },
    {
      hoi: 'Vì sao mất cân bằng giữa G và D làm hỏng huấn luyện GAN?',
      dap: 'D quá mạnh: phản hồi bão hoà, gradient về gần 0, G không còn gì để học. D quá yếu: phản hồi vô nghĩa, G học theo tín hiệu rác. Huấn luyện GAN là giữ hai đấu thủ NGANG SỨC.',
    },
    {
      hoi: 'Vì sao không thể nhìn hàm mất mát của GAN để biết chất lượng?',
      dap: 'GAN là trò chơi hai người, không phải leo xuống một mặt sai số cố định — loss đẹp mà ảnh xấu là chuyện thường, hai bên có thể dao động vòng tròn. Phải chấm bằng chỉ số riêng (FID) và bằng mắt.',
    },
  ],
}
```

### Bài 3 — `cv2-u3-l3` (mô phỏng bắt buộc: diffusion)

```typescript
{
  id: 'cv2-u3-l3',
  unitId: 'cv2-u3',
  language: 'python',
  title: 'Diffusion — thêm nhiễu dần rồi học cách gỡ ngược',
  hook: 'Nhỏ một giọt mực vào ly nước: mực loang dần cho tới khi cả ly xám đều. Quay ngược thước phim ấy, bạn thấy hỗn loạn tự gom lại thành một giọt sắc nét. Diffusion là mô hình học cách BẤM NÚT TUA NGƯỢC đó — và nó đứng sau Stable Diffusion, DALL·E 3, Midjourney.',
  theory:
    'Diffusion có hai chiều, và mấu chốt là chỉ MỘT chiều cần học:\n\nCHIỀU THUẬN (forward, KHÔNG cần học): lấy ảnh thật, cộng thêm một chút nhiễu, lặp T bước (T thường 1.000). Sau bước cuối, ảnh biến thành nhiễu thuần. Chiều này chỉ là một công thức cố định — chạy được ngay, không có tham số nào.\n\nCHIỀU NGƯỢC (reverse, PHẢI học): mạng nơ-ron nhận ảnh nhiễu ở bước t và học đoán "phần nhiễu đã bị cộng vào là gì", để trừ đi mà lùi về bước t−1. Lặp đủ T lần thì từ nhiễu thuần ra ảnh sạch.\n\nVì sao cách này ăn đứt GAN về ổn định: chiều thuận cho ta VÔ SỐ cặp huấn luyện miễn phí (ảnh sạch, ảnh nhiễu ở mọi mức) và bài học của mạng là một bài HỒI QUY bình thường — đoán nhiễu, so sai số, đi xuống. Không có đối thủ, không có minimax, không có mode collapse. Đổi lại, sinh ảnh phải chạy mạng hàng chục đến hàng nghìn bước nên CHẬM hơn GAN (GAN sinh xong trong một lần chạy). Toàn bộ ngành tăng tốc lấy mẫu (DDIM, distillation, consistency models) sinh ra để gặm con số này — 2026 đã có mô hình sinh ảnh chất lượng cao trong 1–4 bước.\n\nBài này mô phỏng bằng vector 8 phần tử với "nhiễu" TẤT ĐỊNH — mỗi bước cộng thêm một lượng cố định BIẾT TRƯỚC ([0.4, 0.2, 0.1], giảm dần đúng như lịch nhiễu thật). Vì lượng cộng đã biết, chiều ngược chỉ là trừ đúng lượng đó theo thứ tự ĐẢO NGƯỢC, và ta thấy vector trở về đúng bản gốc. Với ảnh thật thì nhiễu là ngẫu nhiên và KHÔNG ai đưa cho ta con số đã cộng — đó chính là chỗ mạng nơ-ron phải học đoán, còn lại khung sườn y hệt bài này.',
  workedExample: {
    code: `goc = [1.0, 2.0, 3.0, 4.0]     # "anh" goc (4 phan tu cho gon)
luong = [0.4, 0.2, 0.1]        # lich nhieu: giam dan, biet truoc

x = list(goc)                  # copy de khong sua goc
for t in range(3):             # CHIEU THUAN: them nhieu
    x = [round(v + luong[t], 2) for v in x]
    print(f"Them nhieu buoc {t + 1}: {x}")

for t in range(2, -1, -1):     # CHIEU NGUOC: tru DUNG luong, thu tu DAO
    x = [round(v - luong[t], 2) for v in x]
    print(f"Khu nhieu: {x}")

print("Khoi phuc dung goc" if x == goc else "Sai lech")`,
    stdinLines: [],
  },
  predict: {
    code: `x = [1.0, 2.0]\nfor luong in [0.4, 0.2]:\n    x = [round(v + luong, 2) for v in x]\nprint(x)`,
    question: 'Sau 2 bước thêm nhiễu, vector in ra là gì?',
    choices: ['[1.6, 2.6]', '[1.4, 2.4]', '[1.2, 2.2]', '[2.0, 3.0]'],
    answerIndex: 0,
    explain:
      'Bước 1 cộng 0.4 → [1.4, 2.4]; bước 2 cộng tiếp 0.2 → [1.6, 2.6]. Nhiễu CỘNG DỒN qua các bước, và lượng thêm mỗi bước giảm dần — đúng tinh thần lịch nhiễu (noise schedule) của diffusion thật.',
  },
  parsons: {
    prompt: 'Xếp đúng hai chiều diffusion: copy gốc → vòng thêm nhiễu xuôi → vòng khử nhiễu ngược → kiểm tra khôi phục.',
    lines: [
      'x = list(goc)',
      'for t in range(so_buoc):',
      '    x = [round(v + luong[t], 2) for v in x]',
      'for t in range(so_buoc - 1, -1, -1):',
      '    x = [round(v - luong[t], 2) for v in x]',
      'print("Khoi phuc dung anh goc" if x == goc else "Sai lech so voi goc")',
    ],
  },
  make: {
    prompt:
      'Mô phỏng đủ hai chiều của diffusion trên vector 8 phần tử đã nhúng sẵn.\n\nChương trình đọc 1 dòng input(): số bước (1, 2 hoặc 3). Lịch nhiễu cố định là [0.4, 0.2, 0.1].\n\nCHIỀU THUẬN: lặp t từ 0 đến so_buoc−1, cộng luong[t] vào MỌI phần tử (làm tròn 2), in:\nThem nhieu buoc <t+1>: <các số cách nhau ", ">\n\nCHIỀU NGƯỢC: lặp t từ so_buoc−1 về 0, trừ đúng luong[t] (làm tròn 2), in:\nKhu nhieu buoc <thứ tự 1,2,3>: <các số cách nhau ", ">\n\nCuối cùng in "Khoi phuc dung anh goc" nếu vector bằng đúng gốc, ngược lại "Sai lech so voi goc".',
    starterCode: `goc = [1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0]\nso_buoc = int(input("So buoc: "))\nluong = [0.4, 0.2, 0.1]\nx = list(goc)\n# Vong xuoi: for t in range(so_buoc) -> cong luong[t]\n# Vong nguoc: for t in range(so_buoc - 1, -1, -1) -> tru luong[t]\n`,
    testCases: [
      {
        stdinLines: ['1'],
        expected: 'Them nhieu buoc 1: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 1: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0\nKhoi phuc dung anh goc',
        match: 'contains',
        hidden: false,
        label: '1 bước: cộng 0.4 rồi trừ 0.4 → về đúng gốc',
      },
      {
        stdinLines: ['2'],
        expected: 'Them nhieu buoc 2: 1.6, 2.6, 3.6, 4.6, 5.6, 4.6, 3.6, 2.6\nKhu nhieu buoc 1: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 2: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0',
        match: 'contains',
        hidden: false,
        label: '2 bước: khử theo thứ tự ĐẢO NGƯỢC (0.2 trước, 0.4 sau)',
      },
      {
        stdinLines: ['3'],
        expected: 'Khu nhieu buoc 2: 1.4, 2.4, 3.4, 4.4, 5.4, 4.4, 3.4, 2.4\nKhu nhieu buoc 3: 1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0\nKhoi phuc dung anh goc',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: đủ 3 bước — cộng dồn 0.7 rồi gỡ hết, vẫn về gốc',
      },
    ],
    hints: [
      'Copy trước khi sửa: x = list(goc) — nếu gán x = goc thì bạn sửa luôn bản gốc và phép so sánh cuối luôn đúng một cách giả tạo.',
      'Vòng ngược đếm lùi: range(so_buoc - 1, -1, -1) cho t = 2, 1, 0 khi so_buoc = 3. Số thứ tự in ra là so_buoc - t.',
      'In một dòng vector: ", ".join(str(v) for v in x). Nhớ round(..., 2) sau MỖI phép cộng/trừ để so sánh cuối khớp đúng.',
    ],
    sampleSolution: `goc = [1.0, 2.0, 3.0, 4.0, 5.0, 4.0, 3.0, 2.0]\nso_buoc = int(input("So buoc: "))\nluong = [0.4, 0.2, 0.1]\nx = list(goc)\nfor t in range(so_buoc):\n    x = [round(v + luong[t], 2) for v in x]\n    print(f"Them nhieu buoc {t + 1}: " + ", ".join(str(v) for v in x))\nfor t in range(so_buoc - 1, -1, -1):\n    x = [round(v - luong[t], 2) for v in x]\n    print(f"Khu nhieu buoc {so_buoc - t}: " + ", ".join(str(v) for v in x))\nprint("Khoi phuc dung anh goc" if x == goc else "Sai lech so voi goc")`,
  },
  homework:
    'Trong bài này bạn BIẾT trước lượng nhiễu nên khử được chính xác. Với ảnh thật, nhiễu là ngẫu nhiên và không ai cho biết con số đã cộng — hãy viết 4–5 câu trả lời: mạng nơ-ron phải học ĐOÁN cái gì ở mỗi bước, dữ liệu huấn luyện cho việc đoán đó lấy ở đâu (gợi ý: chiều thuận sinh ra vô tận cặp miễn phí), và vì sao vì thế diffusion ổn định hơn GAN nhưng lại chậm hơn khi sinh ảnh.',
  srsCards: [
    {
      hoi: 'Diffusion gồm hai chiều nào, chiều nào phải học?',
      dap: 'Chiều thuận: cộng nhiễu dần vào ảnh qua T bước cho tới khi thành nhiễu thuần — công thức cố định, KHÔNG cần học. Chiều ngược: mạng học đoán phần nhiễu đã cộng ở mỗi bước để trừ đi, lùi dần về ảnh sạch — đây là phần phải học.',
    },
    {
      hoi: 'Vì sao diffusion ổn định hơn GAN khi huấn luyện?',
      dap: 'Chiều thuận cho vô số cặp huấn luyện miễn phí (ảnh sạch ↔ ảnh nhiễu ở mọi mức) và bài học chỉ là HỒI QUY đoán nhiễu — không có đối thủ, không minimax, không mode collapse. Đổi lại sinh ảnh chậm vì phải chạy mạng nhiều bước.',
    },
    {
      hoi: 'Điểm yếu chính của diffusion và hướng khắc phục?',
      dap: 'Sinh ảnh chậm — phải chạy mạng hàng chục đến hàng nghìn bước khử nhiễu (GAN chỉ một lần chạy). Khắc phục bằng lấy mẫu nhanh (DDIM), chưng cất (distillation), consistency models — 2026 đã sinh ảnh tốt trong 1–4 bước.',
    },
  ],
}
```

### Bài 4 — `cv2-u3-l4`

```typescript
{
  id: 'cv2-u3-l4',
  unitId: 'cv2-u3',
  language: 'python',
  title: 'Bức tranh sinh ảnh 2026 — diffusion, GAN, autoregressive và điều khiển bằng chữ',
  hook: 'Gõ "một con mèo phi hành gia cưỡi ngựa trên sao Hoả, ảnh chụp film" và 4 giây sau có ảnh. Giữa câu chữ đó và tấm ảnh là ba mảnh ghép: một mô hình hiểu chữ, một cầu nối chữ–ảnh, một máy sinh ảnh. Bài này ráp đủ ba mảnh và học cách chọn máy sinh theo NGÂN SÁCH, vì mỗi bước khử nhiễu là tiền thật.',
  theory:
    'BA HỌ MÁY SINH ẢNH, so theo ba trục dùng được:\n- DIFFUSION (Stable Diffusion, DALL·E 3, Midjourney, Imagen): chất lượng và đa dạng cao nhất, huấn luyện ổn định, điều khiển bằng chữ rất tốt. Chậm khi sinh (nhiều bước), tốn tính toán.\n- GAN (StyleGAN và hậu duệ): sinh CỰC nhanh — một lần chạy mạng, hợp thời gian thực (avatar, biến đổi khuôn mặt trực tiếp). Khó huấn luyện, dễ mode collapse, kém linh hoạt với chữ.\n- AUTOREGRESSIVE (sinh ảnh như sinh chữ, từng token một — dòng của các mô hình đa phương thức 2024–2026): dùng chung kiến trúc Transformer với LLM nên gộp chữ và ảnh vào MỘT mô hình được, suy luận theo ngữ cảnh tốt; chậm vì sinh tuần tự từng token.\n\nĐIỀU KHIỂN BẰNG VĂN BẢN, ở mức bản đồ. CLIP là mô hình được huấn luyện trên hàng trăm triệu cặp (ảnh, chú thích) với một mục tiêu duy nhất: đẩy vector của ảnh và vector của chú thích ĐÚNG của nó lại gần nhau, đẩy các cặp sai ra xa. Kết quả là một KHÔNG GIAN CHUNG cho chữ và ảnh, nơi "câu chữ" và "ảnh khớp câu đó" nằm cạnh nhau — đo bằng cosine, đúng thước đo bạn đã dùng ở khoá `mlds`. Nhờ không gian chung này, mô hình sinh ảnh có thể lái quá trình khử nhiễu về phía khớp với câu lệnh; và cũng nhờ nó mà CLIP phân loại được ảnh vào những lớp CHƯA từng thấy nhãn lúc huấn luyện (zero-shot).\n\nCác núm điều khiển khác cần biết tên: classifier-free guidance (núm "bám sát câu lệnh" — vặn cao thì đúng chữ nhưng ảnh cứng và kém đa dạng), ControlNet (ép bố cục theo ảnh phác/khung xương/độ sâu), LoRA (dạy mô hình một phong cách hoặc một nhân vật riêng với vài chục ảnh).\n\nMẶT TRÁI, phần bắt buộc của nghề chứ không phải phụ lục: deepfake và ảnh giả mạo người thật; bản quyền dữ liệu huấn luyện; thiên lệch trong dữ liệu bị khuếch đại lên ảnh sinh ra. Hai việc tối thiểu người làm nghề phải làm: gắn dấu nguồn gốc (watermark/C2PA) và không sinh ảnh người thật khi không được phép.\n\nKINH TẾ, thứ quyết định kiến trúc nhiều hơn người ta tưởng: chi phí sinh một ảnh tỷ lệ THẲNG với số bước khử nhiễu. 50 bước đắt gấp 50 lần một bước. Bài Make hôm nay tính đúng con số đó.',
  workedExample: {
    code: `# Chi phi sinh anh ty le thang voi so buoc khu nhieu
so_buoc = 50
gia_moi_buoc = 0.02          # don vi tien cho mot lan chay mang

tong = so_buoc * gia_moi_buoc
print(f"Diffusion 50 buoc: {round(tong, 2)}")
print(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")
print(f"Dat gap: {round(tong / gia_moi_buoc, 1)} lan")
print("=> Thoi gian thuc thi chon GAN hoac diffusion rut buoc (DDIM, distillation)")`,
    stdinLines: [],
  },
  predict: {
    code: `print(round(20 * 0.05, 2))`,
    question: 'Sinh một ảnh bằng 20 bước, mỗi bước tốn 0.05 — tổng chi phí là bao nhiêu?',
    choices: ['1.0', '0.05', '20.0', '0.25'],
    answerIndex: 0,
    explain:
      '20 × 0.05 = 1.0. Chi phí tỷ lệ THẲNG với số bước, nên rút từ 50 bước xuống 4 bước là giảm chi phí hơn 12 lần — đó là lý do kinh tế đứng sau cả một dòng nghiên cứu (DDIM, distillation, consistency models), không chỉ vì sốt ruột.',
  },
  parsons: {
    prompt: 'Xếp đúng máy tính chi phí sinh ảnh: đọc số bước → đọc giá mỗi bước → nhân → so với GAN.',
    lines: [
      'so_buoc = int(input("So buoc khu nhieu: "))',
      'gia_moi_buoc = float(input("Gia moi buoc: "))',
      'tong = so_buoc * gia_moi_buoc',
      'print(f"Diffusion: {round(tong, 2)}")',
      'print(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")',
      'print(f"Diffusion dat gap: {round(tong / gia_moi_buoc, 1)} lan")',
    ],
  },
  make: {
    prompt:
      'Viết máy so chi phí sinh ảnh giữa diffusion (nhiều bước) và GAN (một bước).\n\nChương trình đọc 2 dòng input():\n- Dòng 1: số bước khử nhiễu (số nguyên).\n- Dòng 2: giá mỗi lần chạy mạng (số thực).\n\nIn đúng 3 dòng:\nDiffusion: <số bước × giá, làm tròn 2>\nGAN (1 buoc): <giá, làm tròn 2>\nDiffusion dat gap: <tổng chia giá, làm tròn 1> lan',
    starterCode: `so_buoc = int(input("So buoc khu nhieu: "))\ngia_moi_buoc = float(input("Gia moi buoc: "))\n# tong = so_buoc * gia_moi_buoc, roi in 3 dong nhu de yeu cau\n`,
    testCases: [
      {
        stdinLines: ['50', '0.02'],
        expected: 'Diffusion: 1.0\nGAN (1 buoc): 0.02\nDiffusion dat gap: 50.0 lan',
        match: 'contains',
        hidden: false,
        label: '50 bước → đắt gấp 50 lần GAN',
      },
      {
        stdinLines: ['4', '1.5'],
        expected: 'Diffusion: 6.0\nGAN (1 buoc): 1.5\nDiffusion dat gap: 4.0 lan',
        match: 'contains',
        hidden: false,
        label: 'Mô hình rút bước (4 bước) → chỉ còn gấp 4',
      },
      {
        stdinLines: ['100', '0.05'],
        expected: 'Diffusion: 5.0\nGAN (1 buoc): 0.05\nDiffusion dat gap: 100.0 lan',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: 100 bước — tỷ lệ đắt đúng bằng số bước',
      },
    ],
    hints: [
      'Tổng chi phí đơn giản là phép nhân: tong = so_buoc * gia_moi_buoc.',
      'Tỷ lệ đắt gấp = tong / gia_moi_buoc — nó luôn bằng đúng số bước, và đó chính là điều bài học muốn bạn thấy.',
      'Chú ý mức làm tròn KHÁC nhau: hai dòng đầu round(..., 2), dòng cuối round(..., 1).',
    ],
    sampleSolution: `so_buoc = int(input("So buoc khu nhieu: "))\ngia_moi_buoc = float(input("Gia moi buoc: "))\ntong = so_buoc * gia_moi_buoc\nprint(f"Diffusion: {round(tong, 2)}")\nprint(f"GAN (1 buoc): {round(gia_moi_buoc, 2)}")\nprint(f"Diffusion dat gap: {round(tong / gia_moi_buoc, 1)} lan")`,
  },
  homework:
    'Chọn máy sinh cho 3 sản phẩm và biện hộ 2–3 câu mỗi cái, nêu rõ ràng buộc quyết định: (a) bộ lọc avatar chạy trực tiếp trên camera điện thoại; (b) công cụ vẽ minh hoạ cho nhà xuất bản, chất lượng là trên hết; (c) trợ lý vừa trả lời chữ vừa vẽ hình trong cùng một cuộc trò chuyện. Thêm một đoạn: với sản phẩm (a), bạn làm gì để KHÔNG cho phép sinh ảnh khuôn mặt người thật mà chủ nhân không đồng ý?',
  srsCards: [
    {
      hoi: 'So diffusion, GAN và autoregressive theo tốc độ sinh và chất lượng?',
      dap: 'Diffusion: chất lượng/đa dạng cao nhất, huấn luyện ổn định, sinh CHẬM (nhiều bước). GAN: sinh cực nhanh (một lần chạy), hợp thời gian thực, nhưng khó huấn luyện và dễ mode collapse. Autoregressive: gộp chung kiến trúc với LLM nên đa phương thức tốt, sinh chậm vì tuần tự từng token.',
    },
    {
      hoi: 'CLIP làm gì và vì sao nó cho phép điều khiển sinh ảnh bằng chữ?',
      dap: 'Huấn luyện trên hàng trăm triệu cặp (ảnh, chú thích) để kéo vector ảnh và vector chú thích đúng lại gần nhau (đo bằng cosine) — tạo KHÔNG GIAN CHUNG cho chữ và ảnh. Nhờ đó quá trình khử nhiễu lái được về phía khớp câu lệnh, và CLIP phân loại zero-shot được lớp chưa từng thấy nhãn.',
    },
    {
      hoi: 'Chi phí sinh một ảnh bằng diffusion phụ thuộc gì?',
      dap: 'Tỷ lệ THẲNG với số bước khử nhiễu — 50 bước đắt gấp 50 lần một bước. Đó là động lực kinh tế của cả dòng nghiên cứu rút bước (DDIM, distillation, consistency models), 2026 đã sinh ảnh tốt trong 1–4 bước.',
    },
  ],
}
```

---

## 4. Chương 4 — Tổng hợp (`cv2-u4`, 2 bài)

File `packages/subject-programming/lessons/cv2u4.ts`, export `CV2_U4_LESSONS`.

### Bài 1 — `cv2-u4-l1` (project: nối conv + chú ý + NMS)

```typescript
{
  id: 'cv2-u4-l1',
  unitId: 'cv2-u4',
  language: 'python',
  title: 'Project — pipeline dò "vật sáng" nối conv, chú ý và NMS',
  hook: 'Ba chương vừa rồi cho bạn ba mảnh rời: convolution (khoá cv1), bản đồ chú ý, và NMS. Hôm nay ráp cả ba thành một đường ống chạy được đầu-tới-cuối trên ảnh 8×8: quét ảnh, chấm điểm từng vị trí, lọc ngưỡng, dẹp trùng, trả về danh sách vật. Đó đúng là hình hài của một bộ phát hiện thật, chỉ nhỏ lại.',
  theory:
    'Mọi bộ phát hiện vật, bỏ hết chi tiết, đều là BỐN CHẶNG nối tiếp:\n1. TRÍCH ĐẶC TRƯNG — quét ảnh bằng convolution, ra một "bản đồ đặc trưng" (feature map) nói mỗi vị trí đáng chú ý cỡ nào. Trong bài này kernel là bộ lọc trung bình 3×3, và đặc trưng ta quan tâm là ĐỘ SÁNG.\n2. CHẤM ĐIỂM + LỌC NGƯỠNG — bỏ mọi vị trí điểm thấp, đúng bước `cv2-u2-l1`. Bản đồ điểm này chính là họ hàng gần của "bản đồ chú ý" ở chương 1: cả hai đều nói "nhìn vào đâu".\n3. DẸP TRÙNG (NMS) — một vật sáng làm cả một VÙNG vị trí lân cận cùng vượt ngưỡng; giữ vị trí mạnh nhất và loại các vị trí quá gần nó. Ở đây ta thay IoU của hộp bằng thước đo đơn giản hơn cho ĐIỂM: khoảng cách Chebyshev max(|Δhàng|, |Δcột|) < 2 thì coi là cùng một vật. Luật vẫn y nguyên tinh thần bài `cv2-u2-l3`: sắp giảm dần theo điểm, tham lam giữ, loại kẻ trùng.\n4. TRẢ KẾT QUẢ — danh sách vật kèm vị trí và độ mạnh.\n\nMột chi tiết kỹ thuật quan trọng: convolution "valid" (không đệm viền) trên ảnh 8×8 với kernel 3×3 chỉ tính được ở các tâm hàng/cột 1..6 — vì tâm ở mép sẽ đòi pixel nằm ngoài ảnh. Vì thế bản đồ đặc trưng là 6×6 chứ không phải 8×8, và toạ độ in ra là toạ độ TRÊN ẢNH GỐC (hàng 1..6, cột 1..6). Lệch chỗ này là toạ độ báo về sai một pixel — loại lỗi hay xảy ra thật khi ghép nhiều tầng xử lý.\n\nĐể kết quả ổn định và so sánh được, thứ tự sắp xếp phải TẤT ĐỊNH tuyệt đối: sắp theo (điểm giảm dần, hàng tăng, cột tăng). Hai vị trí cùng điểm mà không có tiêu chí phụ thì mỗi lần chạy có thể ra thứ tự khác — đúng loại lỗi mà Tầng 10 của quy trình audit dự án nhắm tới.',
  workedExample: {
    code: `# Chang 1: convolution trung binh 3x3 tren anh 4x4 (valid -> ban do 2x2)
anh = [
    [0, 0, 0, 0],
    [0, 9, 9, 0],
    [0, 9, 9, 0],
    [0, 0, 0, 0],
]
for r in range(1, 3):            # tam chi chay o 1..2 (khong dem vien)
    for c in range(1, 3):
        tong = 0
        for dr in (-1, 0, 1):    # cua so 3x3 quanh tam
            for dc in (-1, 0, 1):
                tong += anh[r + dr][c + dc]
        print(f"Tam ({r},{c}) do sang = {round(tong / 9, 2)}")`,
    stdinLines: [],
  },
  predict: {
    code: `print(len(range(1, 7)))`,
    question: 'Convolution 3×3 không đệm viền trên ảnh 8×8 cho bản đồ đặc trưng bao nhiêu hàng?',
    choices: ['6', '8', '7', '4'],
    answerIndex: 0,
    explain:
      'Tâm cửa sổ chỉ đặt được ở hàng 1..6 (hàng 0 và 7 sẽ đòi pixel ngoài ảnh) → 6 hàng, tương tự 6 cột, bản đồ 6×6. Công thức chung: kích thước ra = vào − kernel + 1 = 8 − 3 + 1 = 6.',
  },
  parsons: {
    prompt: 'Xếp đúng bốn chặng của pipeline: quét conv → lọc ngưỡng → sắp giảm dần → NMS giữ điểm xa nhau.',
    lines: [
      'for r in range(1, 7):',
      '    for c in range(1, 7):',
      '        do_sang = round(sum(anh[r + dr][c + dc] for dr in (-1, 0, 1) for dc in (-1, 0, 1)) / 9, 2)',
      '        if do_sang >= nguong:',
      '            diem.append((do_sang, r, c))',
      'diem.sort(key=lambda p: (-p[0], p[1], p[2]))',
      'giu = [p for p in diem if all(max(abs(p[1] - g[1]), abs(p[2] - g[2])) >= 2 for g in giu)]',
    ],
  },
  make: {
    prompt:
      'Ráp pipeline phát hiện "vật sáng" đầy đủ 4 chặng trên ảnh 8×8 đã nhúng sẵn.\n\nChương trình đọc 1 dòng input(): ngưỡng độ sáng (số thực).\n\nCHẶNG 1 — với mọi tâm (r, c) trong 1..6, tính do_sang = trung bình 9 ô của cửa sổ 3×3 quanh tâm, làm tròn 2.\nCHẶNG 2 — giữ các tâm có do_sang >= ngưỡng. In: So diem vuot nguong: <n>\nCHẶNG 3 — sắp giảm dần theo (điểm, rồi hàng tăng, rồi cột tăng); duyệt lần lượt, GIỮ một tâm nếu nó cách MỌI tâm đã giữ ít nhất 2 theo khoảng cách Chebyshev max(|Δr|, |Δc|).\nCHẶNG 4 — in: So vat phat hien: <m>\nrồi mỗi vật một dòng theo thứ tự đã giữ:\nVat tai (hang <r>, cot <c>), do sang <do_sang>\n\nVới ngưỡng 5 → 8 điểm vượt ngưỡng, gộp còn 2 vật.',
    starterCode: `anh = [\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n]\nnguong = float(input("Nguong sang: "))\ndiem = []\n# Chang 1+2: for r in range(1, 7): for c in range(1, 7): tinh trung binh 3x3, loc nguong\n# Chang 3: diem.sort(key=lambda p: (-p[0], p[1], p[2])) roi giu theo khoang cach Chebyshev >= 2\n`,
    testCases: [
      {
        stdinLines: ['5'],
        expected: 'So diem vuot nguong: 8\nSo vat phat hien: 2\nVat tai (hang 2, cot 2), do sang 9.0\nVat tai (hang 6, cot 6), do sang 8.0',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng 5 → 8 tâm sáng gộp lại đúng 2 vật',
      },
      {
        stdinLines: ['4'],
        expected: 'So diem vuot nguong: 12\nSo vat phat hien: 2',
        match: 'contains',
        hidden: false,
        label: 'Hạ ngưỡng → nhiều tâm hơn nhưng NMS vẫn gộp còn 2 vật',
      },
      {
        stdinLines: ['9.5'],
        expected: 'So diem vuot nguong: 0\nSo vat phat hien: 0',
        match: 'contains',
        hidden: false,
        label: 'Ngưỡng quá cao → không có vật nào',
      },
      {
        stdinLines: ['1'],
        expected: 'So diem vuot nguong: 24\nSo vat phat hien: 7',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: ngưỡng quá thấp — rìa mờ cũng thành "vật", 7 báo động',
      },
    ],
    hints: [
      'Cửa sổ 3×3 quanh tâm: hai vòng dr, dc chạy trong (-1, 0, 1), cộng anh[r + dr][c + dc] rồi chia 9 và round(..., 2).',
      'Tâm chỉ chạy range(1, 7) — hàng/cột 0 và 7 sẽ đòi pixel ngoài ảnh. Toạ độ in ra là toạ độ trên ảnh gốc.',
      'NMS: sau diem.sort(key=lambda p: (-p[0], p[1], p[2])), duyệt tuần tự và chỉ append khi all(max(abs(r - gr), abs(c - gc)) >= 2 for (gs, gr, gc) in giu) — dùng vòng for thường cho dễ đọc.',
    ],
    sampleSolution: `anh = [\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 9, 9, 9, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 0, 0, 0],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n    [0, 0, 0, 0, 0, 8, 8, 8],\n]\nnguong = float(input("Nguong sang: "))\ndiem = []\nfor r in range(1, 7):\n    for c in range(1, 7):\n        tong = 0\n        for dr in (-1, 0, 1):\n            for dc in (-1, 0, 1):\n                tong += anh[r + dr][c + dc]\n        do_sang = round(tong / 9, 2)\n        if do_sang >= nguong:\n            diem.append((do_sang, r, c))\nprint(f"So diem vuot nguong: {len(diem)}")\ndiem.sort(key=lambda p: (-p[0], p[1], p[2]))\ngiu = []\nfor (s, r, c) in diem:\n    if all(max(abs(r - gr), abs(c - gc)) >= 2 for (gs, gr, gc) in giu):\n        giu.append((s, r, c))\nprint(f"So vat phat hien: {len(giu)}")\nfor (s, r, c) in giu:\n    print(f"Vat tai (hang {r}, cot {c}), do sang {s}")`,
  },
  homework:
    'Mở rộng pipeline theo hai hướng và ghi lại kết quả: (1) đổi bán kính dẹp trùng từ 2 lên 3 — số vật phát hiện đổi thế nào ở ngưỡng 1, và vì sao? (2) Vẽ tay ảnh 8×8 của riêng bạn với BA vật sáng, trong đó hai vật đứng sát nhau; chạy pipeline và xem chúng có bị gộp làm một không. Nếu bị gộp, bạn chỉnh núm nào — ngưỡng sáng hay bán kính NMS? Đây đúng là việc kỹ sư thị giác máy tính làm mỗi ngày.',
  srsCards: [
    {
      hoi: 'Bốn chặng của một pipeline phát hiện vật là gì?',
      dap: 'Trích đặc trưng bằng convolution (ra bản đồ đặc trưng) → chấm điểm và lọc theo ngưỡng → dẹp trùng bằng NMS (một vật làm cả vùng lân cận cùng vượt ngưỡng) → trả danh sách vật kèm vị trí và độ mạnh.',
    },
    {
      hoi: 'Convolution 3×3 không đệm viền trên ảnh N×N cho bản đồ kích thước bao nhiêu, vì sao?',
      dap: 'N−3+1 mỗi chiều (8×8 → 6×6): tâm cửa sổ không đặt được ở mép vì sẽ đòi pixel ngoài ảnh. Nhớ báo toạ độ theo ẢNH GỐC, lệch chỗ này là sai vị trí một pixel khi ghép nhiều tầng.',
    },
    {
      hoi: 'Vì sao thứ tự sắp xếp trong pipeline phải tất định tuyệt đối?',
      dap: 'Hai vị trí cùng điểm mà không có tiêu chí phụ thì mỗi lần chạy có thể cho thứ tự khác nhau, kết quả không tái lập được. Cách sửa: sắp theo bộ khoá đầy đủ, ví dụ (điểm giảm dần, hàng tăng, cột tăng).',
    },
  ],
}
```

### Bài 2 — `cv2-u4-l2` (tổng kết)

```typescript
{
  id: 'cv2-u4-l2',
  unitId: 'cv2-u4',
  language: 'python',
  title: 'Tổng kết cv2 — bạn đã tự cài những gì và đi tiếp đâu',
  hook: 'Mười ba bài trước, bạn không đọc về attention — bạn CÀI nó. Không nghe kể về IoU — bạn viết nó và tự tay dính cái bẫy thiếu max(0,…). Bài cuối này gom lại toàn bộ bản đồ và chỉ ra ba con đường đi tiếp, để chỗ bạn đứng có tên gọi rõ ràng.',
  theory:
    'BẠN ĐÃ TỰ CÀI, bằng Python thuần, không thư viện:\n- Chương 1: chi phí O(n²) của attention · self-attention một đầu đủ 4 bước (Q·K → scale √d → softmax tự cài → trộn V) · positional encoding sin/cos · cắt ảnh thành patch kiểu ViT.\n- Chương 2: lọc hộp theo ngưỡng tin cậy · IoU (kèm bẫy max(0,…)) · non-max suppression tham lam · khung quyết định chọn dòng họ mô hình.\n- Chương 3: GAN một chiều tất định — thấy generator hội tụ về phân phối thật bằng con số · máy đo mode collapse · diffusion hai chiều thêm/khử nhiễu trên vector 8 phần tử · kinh tế của số bước lấy mẫu.\n- Chương 4: ráp cả ba mảnh thành pipeline dò vật chạy đầu-tới-cuối.\n\nBỐN Ý NIỆM ĐI THEO BẠN SANG MỌI KHOÁ SAU, đáng nhớ hơn mọi dòng code:\n1. Attention là "phân bổ 100% sự chú ý" — softmax luôn cộng lại bằng 1, ưu ái chỗ này là phải bớt chỗ khác. Nó là ruột của cả LLM lẫn ViT.\n2. Không có kiến trúc thắng tuyệt đối. CNN hay ViT, một pha hay hai pha, GAN hay diffusion — chọn theo dữ liệu, ngân sách và hậu quả của từng loại sai.\n3. Mọi đường ống thị giác đều là: trích đặc trưng → chấm điểm → lọc → dẹp trùng.\n4. Thước đo quyết định hành vi. Đổi ngưỡng tin cậy, ngưỡng NMS hay số bước khử nhiễu là đổi hẳn sản phẩm, dù mô hình không đổi một tham số nào.\n\nBA LỐI ĐI TIẾP:\n- Khoá `llmagent` (LLMs & AI Agents) — attention bạn vừa cài chính là ruột của LLM; ở đó bạn cài tokenizer, sinh next-token, RAG mini và vòng lặp agent ReAct.\n- Hướng chuyên sâu `ai` chặng S3 trong môn Lập trình — huấn luyện và triển khai mô hình thật với PyTorch, ở quy mô dự án.\n- Đọc paper gốc, nay đã đủ nền để đọc: "Attention Is All You Need" (2017), "An Image is Worth 16×16 Words" (ViT, 2020), "Denoising Diffusion Probabilistic Models" (2020).\n\nBài Make cuối là một công cụ nhỏ cho chính bạn: bản đồ tra cứu khái niệm → chương đã học, để khi quên thì biết quay lại đúng chỗ.',
  workedExample: {
    code: `# Ban do tra cuu: khai niem -> hoc o chuong nao
ban_do = {
    "attention": "Chuong 1 - Transformer & ViT",
    "iou": "Chuong 2 - Object detection",
    "gan": "Chuong 3 - Mo hinh sinh anh",
}

for tu in ["attention", "iou", "kubernetes"]:
    # .get(khoa, mac_dinh) tra ve mac dinh khi khong tim thay, khong bao loi
    print(f"{tu}: {ban_do.get(tu, 'Chua hoc trong khoa cv2')}")`,
    stdinLines: [],
  },
  predict: {
    code: `d = {"a": 1}\nprint(d.get("b", "khong co"))`,
    question: 'Tra khoá "b" không tồn tại bằng .get() với giá trị mặc định — in ra gì?',
    choices: ['khong co', 'None', 'Báo lỗi KeyError', '1'],
    answerIndex: 0,
    explain:
      '.get(khoa, mac_dinh) trả về giá trị mặc định khi không tìm thấy, khác hẳn d["b"] vốn ném KeyError làm sập chương trình. Đây là thói quen tốt cho mọi tra cứu có thể trượt — đúng tinh thần "mọi thao tác có thể lỗi đều có nhánh xử lý".',
  },
  parsons: {
    prompt: 'Xếp đúng công cụ tra cứu: chuẩn hoá chuỗi nhập → tra bản đồ có mặc định → in.',
    lines: [
      'tu = input("Khai niem: ").strip().lower()',
      'ket_qua = ban_do.get(tu, "Chua hoc trong khoa cv2")',
      'print(f"{tu}: {ket_qua}")',
    ],
  },
  make: {
    prompt:
      'Viết công cụ tra cứu tổng kết khoá: nhập tên một khái niệm, máy cho biết nó học ở chương nào.\n\nBản đồ tra cứu (dùng đúng 6 khoá này):\n- "attention", "patch" → "Chuong 1 - Transformer & ViT"\n- "iou", "nms" → "Chuong 2 - Object detection"\n- "gan", "diffusion" → "Chuong 3 - Mo hinh sinh anh"\n\nChương trình đọc 1 dòng input(): tên khái niệm. Phải CHUẨN HOÁ trước khi tra: bỏ khoảng trắng thừa (.strip()) và đổi về chữ thường (.lower()) — người dùng có thể gõ "IoU" hay " Attention ".\n\nIn đúng 1 dòng: <khái niệm đã chuẩn hoá>: <chương>\nNếu không có trong bản đồ, phần chương là "Chua hoc trong khoa cv2" (dùng .get() với giá trị mặc định, KHÔNG để chương trình báo lỗi).',
    starterCode: `ban_do = {\n    "attention": "Chuong 1 - Transformer & ViT",\n    "patch": "Chuong 1 - Transformer & ViT",\n    "iou": "Chuong 2 - Object detection",\n    "nms": "Chuong 2 - Object detection",\n    "gan": "Chuong 3 - Mo hinh sinh anh",\n    "diffusion": "Chuong 3 - Mo hinh sinh anh",\n}\ntu = input("Khai niem: ")\n# Chuan hoa bang .strip().lower() roi tra bang .get(tu, "Chua hoc trong khoa cv2")\n`,
    testCases: [
      {
        stdinLines: ['IoU'],
        expected: 'iou: Chuong 2 - Object detection',
        match: 'contains',
        hidden: false,
        label: 'Viết hoa lẫn lộn vẫn tra đúng nhờ .lower()',
      },
      {
        stdinLines: ['diffusion'],
        expected: 'diffusion: Chuong 3 - Mo hinh sinh anh',
        match: 'contains',
        hidden: false,
        label: 'Tra khái niệm chương 3',
      },
      {
        stdinLines: [' Attention '],
        expected: 'attention: Chuong 1 - Transformer & ViT',
        match: 'contains',
        hidden: false,
        label: 'Khoảng trắng thừa hai đầu bị .strip() cắt sạch',
      },
      {
        stdinLines: ['kubernetes'],
        expected: 'kubernetes: Chua hoc trong khoa cv2',
        match: 'contains',
        hidden: true,
        label: 'Ca ẩn: khoá lạ — .get() trả mặc định, không ném KeyError',
      },
    ],
    hints: [
      'Nối hai phép chuẩn hoá: tu = input("Khai niem: ").strip().lower() — strip trước, lower sau, thứ tự nào cũng được.',
      'Tra an toàn bằng .get(tu, "Chua hoc trong khoa cv2"); dùng ban_do[tu] sẽ ném KeyError với khoá lạ.',
      'In một dòng: print(f"{tu}: {ket_qua}") với tu là chuỗi ĐÃ chuẩn hoá (chữ thường).',
    ],
    sampleSolution: `ban_do = {\n    "attention": "Chuong 1 - Transformer & ViT",\n    "patch": "Chuong 1 - Transformer & ViT",\n    "iou": "Chuong 2 - Object detection",\n    "nms": "Chuong 2 - Object detection",\n    "gan": "Chuong 3 - Mo hinh sinh anh",\n    "diffusion": "Chuong 3 - Mo hinh sinh anh",\n}\ntu = input("Khai niem: ").strip().lower()\nprint(f"{tu}: {ban_do.get(tu, 'Chua hoc trong khoa cv2')}")`,
  },
  homework:
    'Viết một trang giấy (hoặc một file ghi chú) tổng kết cho chính bạn: với MỖI trong 4 ý niệm lớn của khoá (attention là phân bổ chú ý · không có kiến trúc thắng tuyệt đối · pipeline luôn là trích-chấm-lọc-dẹp · thước đo quyết định hành vi), viết 2 câu bằng lời của bạn và 1 ví dụ từ bài Make bạn đã tự viết. Sau đó chọn MỘT lối đi tiếp (khoá llmagent, hướng ai S3, hoặc đọc paper) và đặt một mốc thời gian cụ thể cho nó.',
  srsCards: [
    {
      hoi: 'Bốn ý niệm lớn còn lại sau khoá cv2?',
      dap: '① Attention là phân bổ 100% sự chú ý (softmax cộng lại bằng 1) ② Không có kiến trúc thắng tuyệt đối — chọn theo dữ liệu, ngân sách, hậu quả của từng loại sai ③ Pipeline thị giác luôn là trích đặc trưng → chấm điểm → lọc → dẹp trùng ④ Thước đo quyết định hành vi sản phẩm, dù mô hình không đổi.',
    },
    {
      hoi: 'Ba thứ bạn đã tự cài trong chương sinh ảnh?',
      dap: 'GAN một chiều tất định (generator hội tụ về trung bình thật qua từng vòng) · máy đo mode collapse bằng độ đa dạng mẫu · diffusion hai chiều thêm nhiễu rồi khử ngược trên vector 8 phần tử.',
    },
    {
      hoi: 'Vì sao nên dùng dict.get(khoa, mac_dinh) thay cho dict[khoa]?',
      dap: 'dict[khoa] ném KeyError làm sập chương trình khi khoá không tồn tại; .get() trả về giá trị mặc định để luồng đi tiếp bình thường — đúng nguyên tắc mọi thao tác có thể lỗi đều phải có nhánh xử lý.',
    },
  ],
}
```

---

## 5. Nghiệm thu đặc tả này

- [x] Đủ **14/14** bài, đúng cấu trúc 4 + 4 + 4 + 2 theo 4 chương `cv2-u1..u4`.
- [x] Đủ **4 mô phỏng bắt buộc** của §1.4: attention một đầu (`cv2-u1-l2`), IoU (`cv2-u2-l2`),
      NMS (`cv2-u2-l3`), GAN 2 người chơi trên phân phối 1 chiều (`cv2-u3-l1`), vòng khuếch tán
      thêm/khử nhiễu (`cv2-u3-l3`).
- [x] `language: 'python'`, chỉ `math` chuẩn — không numpy/torch trong code được chấm.
- [x] Mọi `print()` tiếng Việt không dấu; mọi số thực đã `round()`.
- [x] Mỗi bài đủ 8 bước (hook · theory · workedExample · predict · parsons · make · homework ·
      srsCards 3 thẻ), 3–4 test-case, ≥ 1 ca `hidden`.
- [x] **Mọi `sampleSolution` đã chạy thật bằng `python3`** với đúng `stdinLines`; các chuỗi
      `expected` chép từ output thật.

### Khi thi hành, còn phải làm ngoài file bài học

1. `courses/cv2.ts` + đăng ký `registry.ts` + nới `ShortCourseId`.
2. Nới regex nhận `cv2-u\d+-l\d+` / `cv2-u\d+` ở `lessonTypes.ts` và hai handler
   `apps/server/src/api/subjects/programming/{progress,feedback}.ts`.
3. Đăng ký 4 mảng bài vào `lessons.ts` + thêm `lessonsCv2.test.ts` (Zod validate + kiểm chéo
   unit ↔ `SHORT_COURSES`).
4. Chạy cổng đầy đủ + `npm run changelog` cho file nhật ký đợt việc.
