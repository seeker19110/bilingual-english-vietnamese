// lessons/p6u4.ts — P6-U4: Track luyện phỏng vấn thuật toán (làn A, `python`).
//
// Chấm bằng PHÉP ĐẾM (hiến chương P5 §2): dem phải đúng bằng n, tức chỉ lời giải MỘT LƯỢT
// (Kadane) mới qua — bản vét cạn O(n²) cho cùng đáp số nhưng số đếm khác hẳn.
//
// Ca biên toàn số âm là bẫy kinh điển của chính bài này trong phỏng vấn thật: lời giải khởi
// tạo tot_nhat = 0 trả về 0 thay vì phần tử lớn nhất. Đề có ca đó ở cả mức nhìn thấy lẫn ca ẩn.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P6U4_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p6-u4-l1',
    unitId: 'p6-u4',
    language: 'python',
    title: 'Phỏng vấn thuật toán: cách nghĩ quan trọng hơn lời giải',
    hook: 'Người phỏng vấn viết lên bảng một câu hai dòng và nhìn bạn. Điều họ chấm không phải là bạn có nhớ thuật toán này hay không — mà là mười phút tiếp theo bạn làm gì khi chưa biết đáp án.',
    theory:
      'Phỏng vấn thuật toán bị mang tiếng là học thuộc, nhưng người phỏng vấn giỏi chấm theo một khung khá cố định. Biết khung đó thì bạn đỡ hoảng, và cũng biết mình đang bỏ sót bước nào.\n\nNĂM BƯỚC, theo đúng thứ tự — bỏ bước nào cũng mất điểm:\n\n1. **LÀM RÕ ĐỀ (đừng bỏ qua).** Hỏi lại trước khi viết: dữ liệu có thể rỗng không? Có số âm không? Lớn cỡ nào? Có trùng lặp không? Người phỏng vấn cố tình ra đề mơ hồ — im lặng lao vào code là hỏng ngay ở đây. Với bài hôm nay, câu hỏi đáng giá nhất là: "mảng có thể toàn số âm không?".\n2. **NÊU CA BIÊN TRƯỚC KHI GIẢI.** Mảng rỗng, một phần tử, toàn âm, toàn dương. Nói to chúng ra: nó cho thấy bạn nghĩ như người viết phần mềm chạy thật, không phải người giải đố.\n3. **NÊU LỜI GIẢI THÔ trước, kèm big-O của nó.** "Em có thể thử mọi đoạn con, O(n²), chắc chắn đúng." Đừng ngại nói cách chậm — có một lời giải đúng trong tay là điểm sàn, và nó cho bạn cái để so.\n4. **TỐI ƯU, giải thích Ý TƯỞNG trước khi viết code.** Đây là chỗ chiếm nhiều điểm nhất.\n5. **TỰ KIỂM bằng ví dụ.** Chạy tay lời giải trên một ca nhỏ và một ca biên. Người phỏng vấn tìm được lỗi trước bạn là mất điểm; bạn tự tìm ra là được điểm.\n\nBÀI HÔM NAY: cho một dãy số (có cả âm), tìm ĐOẠN CON LIÊN TIẾP có tổng lớn nhất. Trả về tổng đó. Đoạn con phải có ít nhất một phần tử.\n\nCách thô: thử mọi cặp đầu-cuối, cộng lại, giữ số lớn nhất. O(n²). Đúng, và với 10.000 phần tử là 50 triệu phép cộng.\n\nÝ TƯỞNG TỐI ƯU (thuật toán Kadane) — chỉ một câu, nhưng phải hiểu chứ đừng thuộc: đi từ trái sang phải, tại mỗi phần tử hỏi **"đoạn tốt nhất KẾT THÚC TẠI ĐÂY là gì?"**. Chỉ có hai lựa chọn: hoặc nối tiếp đoạn tốt nhất kết thúc ở phần tử trước, hoặc bắt đầu lại từ chính phần tử này.\n  hien_tai = max(x, hien_tai + x)\nRồi giữ lại số lớn nhất từng thấy. Một lượt, O(n).\n\nVì sao "bắt đầu lại" là đúng: nếu tổng tích luỹ tới trước đang ÂM, thì mang nó theo chỉ làm mọi đoạn về sau tệ đi — vứt đi luôn tốt hơn. Đó là toàn bộ cái hay của thuật toán này.\n\nCÁI BẪY, và nó là bẫy thật trong phỏng vấn: rất nhiều người khởi tạo tot_nhat = 0. Với mảng toàn số âm, lời giải đó trả về 0 — nhưng 0 không phải tổng của đoạn con nào cả (đoạn con phải có ít nhất một phần tử). Đáp án đúng là phần tử LỚN NHẤT, tức số âm gần 0 nhất. Khởi tạo cả hai biến bằng ds[0] rồi duyệt từ phần tử thứ hai là hết bẫy. Đây chính là lý do bước 1 và bước 2 tồn tại: ai hỏi "có thể toàn âm không?" ngay từ đầu thì không bao giờ rơi vào đây.\n\nMột lời khuyên thực dụng cuối: **nói to cách nghĩ của bạn trong suốt buổi.** Im lặng năm phút rồi viết ra lời giải đúng vẫn kém hơn vừa nghĩ vừa nói. Người phỏng vấn không đọc được đầu bạn, và thứ họ cần chấm nằm trong đầu đó.',
    workedExample: {
      code: `def tong_lon_nhat_THO(ds):
    """Cách thô: thử MỌI đoạn con. O(n^2) — nói ra được cách này đã là điểm sàn."""
    if not ds:
        return 0
    tot_nhat = ds[0]
    for i in range(len(ds)):
        tong = 0
        for j in range(i, len(ds)):
            tong += ds[j]
            tot_nhat = max(tot_nhat, tong)
    return tot_nhat


def tong_lon_nhat(ds):
    """Kadane: một lượt, O(n). Tại mỗi phần tử hỏi 'đoạn tốt nhất KẾT THÚC TẠI ĐÂY?'"""
    if not ds:
        return 0, 0
    tot_nhat = hien_tai = ds[0]     # KHỞI TẠO BẰNG ds[0], không phải 0 -> hết bẫy toàn âm
    dem = 1
    for x in ds[1:]:
        dem += 1
        hien_tai = max(x, hien_tai + x)   # nối tiếp, hoặc bắt đầu lại từ x
        tot_nhat = max(tot_nhat, hien_tai)
    return tot_nhat, dem


vi_du = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Tho :", tong_lon_nhat_THO(vi_du))
print("Kadane:", tong_lon_nhat(vi_du))          # đoạn [4, -1, 2, 1] -> 6

toan_am = [-8, -3, -6, -2, -5]
print("Toan am - dung:", tong_lon_nhat(toan_am)[0])   # -2, KHÔNG phải 0

mot_phan_tu = [-7]
print("Mot phan tu:", tong_lon_nhat(mot_phan_tu)[0])  # -7`,
      stdinLines: [],
    },
    predict: {
      code: `def tong_lon_nhat_SAI(ds):
    tot_nhat = 0                 # <- khoi tao bang 0
    hien_tai = 0
    for x in ds:
        hien_tai = max(x, hien_tai + x)
        tot_nhat = max(tot_nhat, hien_tai)
    return tot_nhat

print(tong_lon_nhat_SAI([-8, -3, -6, -2, -5]))`,
      question: 'Mảng toàn số âm. Lời giải khởi tạo bằng 0 trả về gì?',
      choices: ['0', '-2', '-24', '-8'],
      answerIndex: 0,
      explain:
        'Trả về 0 — và 0 là một câu trả lời không tồn tại, vì không đoạn con nào của mảng này có tổng bằng 0 (đoạn con phải có ít nhất một phần tử, mà mọi phần tử đều âm). Đáp án đúng là -2: phần tử lớn nhất, tức số âm gần 0 nhất. Đây là cái bẫy được cài sẵn trong chính đề bài, và nó bắt được rất nhiều người trong phỏng vấn thật — không phải vì họ không biết thuật toán, mà vì họ không hỏi "mảng có thể toàn số âm không?" ở phút đầu tiên. Cách chữa: khởi tạo cả hai biến bằng ds[0] rồi duyệt từ phần tử thứ hai.',
    },
    parsons: {
      prompt: 'Xếp lại thuật toán Kadane — chú ý chỗ khởi tạo, vì đó là chỗ bẫy toàn số âm nằm.',
      lines: [
        'if not ds:',
        '    return 0',
        'tot_nhat = hien_tai = ds[0]',
        'for x in ds[1:]:',
        '    hien_tai = max(x, hien_tai + x)',
        '    tot_nhat = max(tot_nhat, hien_tai)',
        'return tot_nhat',
      ],
    },
    make: {
      prompt:
        'Đề phỏng vấn: cho một dãy số nguyên (có cả âm), tìm ĐOẠN CON LIÊN TIẾP có tổng lớn nhất, trả về tổng đó. Đoạn con phải có ít nhất một phần tử.\n\nDãy được sinh bằng công thức để thử được ở quy mô thật:\nds = [((i * 37) % 21) - 10 + lech for i in range(n)]\n\nViết tong_lon_nhat(ds) trả về (tong, dem):\n- tong: tổng lớn nhất.\n- dem: SỐ PHẦN TỬ đã xét — cộng 1 cho mỗi phần tử bạn duyệt qua. Lời giải một lượt sẽ có dem đúng bằng n; lời giải thử mọi đoạn con thì không.\n- ds rỗng → trả về (0, 0).\n\nChương trình chính đọc 2 dòng input(): dòng 1 là n, dòng 2 là lech (số nguyên, có thể âm). Dựng ds theo công thức rồi in đúng hai dòng:\nTong lon nhat: <tong>\nSo phan tu da xet: <dem>\n\nTrước khi nộp, tự chạy ca lech = -50 (mọi phần tử đều âm) và tự hỏi: kết quả có phải là tổng của một đoạn con có thật không?',
      starterCode: `def tong_lon_nhat(ds):
    if not ds:
        return 0, 0
    # Khởi tạo thế nào để ca TOÀN SỐ ÂM vẫn đúng?
    ...


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
ds = [((i * 37) % 21) - 10 + lech for i in range(n)]
# In hai dòng theo đúng khuôn của đề
`,
      testCases: [
        {
          stdinLines: ['20', '0'],
          expected: 'Tong lon nhat: 23',
          match: 'contains',
          hidden: false,
          label: 'Dãy 20 phần tử có cả âm lẫn dương → 23',
        },
        {
          stdinLines: ['20', '0'],
          expected: 'So phan tu da xet: 20',
          match: 'contains',
          hidden: false,
          label: 'Một lượt duy nhất: số phần tử xét đúng bằng n (thử mọi đoạn con sẽ ra 210)',
        },
        {
          stdinLines: ['20', '-50'],
          expected: 'Tong lon nhat: -40',
          match: 'contains',
          hidden: false,
          label: 'BẪY: toàn số âm → phải là -40 (phần tử lớn nhất), KHÔNG phải 0',
        },
        {
          stdinLines: ['1', '0'],
          expected: 'Tong lon nhat: -10',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: đúng một phần tử, và nó âm',
        },
        {
          stdinLines: ['0', '0'],
          expected: 'Tong lon nhat: 0',
          match: 'contains',
          hidden: false,
          label: 'Ca biên: dãy rỗng → 0, không nổ IndexError',
        },
        {
          stdinLines: ['1000', '-50'],
          expected: 'So phan tu da xet: 1000',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: quy mô 1.000 — vẫn phải là MỘT lượt, không phải 500.500',
        },
        {
          stdinLines: ['7', '3'],
          expected: 'Tong lon nhat: 21',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: dãy ngắn lệch dương — không hardcode theo một bộ dữ liệu',
        },
      ],
      hints: [
        'Câu hỏi đáng giá nhất của bài này, và cũng là câu nên hỏi người phỏng vấn ở phút đầu: mảng có thể toàn số âm không? Câu trả lời quyết định bạn khởi tạo bằng 0 hay bằng ds[0].',
        'Khởi tạo tot_nhat = hien_tai = ds[0] rồi duyệt từ ds[1:]. Khởi tạo bằng 0 thì ca lech = -50 trả về 0 — một con số không phải tổng của đoạn con nào cả.',
        'Cốt lõi chỉ một dòng: hien_tai = max(x, hien_tai + x). Nghĩa là "đoạn tốt nhất kết thúc tại x" hoặc nối tiếp đoạn trước, hoặc bắt đầu lại từ x — vì mang theo một tổng đang ÂM chỉ làm mọi đoạn sau tệ đi.',
        'Đừng quên cập nhật tot_nhat SAU mỗi bước, không phải chỉ ở cuối: đoạn tốt nhất có thể kết thúc ở giữa dãy rồi sau đó hien_tai tụt xuống.',
        'dem đếm PHẦN TỬ, và vì bạn khởi tạo bằng ds[0] nên nó bắt đầu từ 1 rồi cộng thêm cho từng phần tử trong ds[1:] — tổng cộng đúng bằng n.',
      ],
      sampleSolution: `def tong_lon_nhat(ds):
    if not ds:
        return 0, 0
    # Khởi tạo bằng ds[0], KHÔNG phải 0 -> ca toàn số âm vẫn ra đáp án có thật
    tot_nhat = hien_tai = ds[0]
    dem = 1
    for x in ds[1:]:
        dem += 1
        # Đoạn tốt nhất KẾT THÚC TẠI x: nối tiếp, hoặc bắt đầu lại từ x.
        # Mang theo một tổng đang âm chỉ làm mọi đoạn về sau tệ đi.
        hien_tai = max(x, hien_tai + x)
        tot_nhat = max(tot_nhat, hien_tai)   # cập nhật SAU mỗi bước
    return tot_nhat, dem


n = int(input("So phan tu: "))
lech = int(input("Do lech: "))
ds = [((i * 37) % 21) - 10 + lech for i in range(n)]

tong, dem = tong_lon_nhat(ds)
print(f"Tong lon nhat: {tong}")
print(f"So phan tu da xet: {dem}")`,
    },
    homework:
      'Luyện phỏng vấn không phải là cày số lượng đề — là luyện cách nghĩ tới lúc nó thành phản xạ.\n\n1. Viết thêm bản THÔ O(n²) của chính bài này, cho cả hai chạy trên dãy 1.000 phần tử và so số phép cộng. Rồi tự trả lời: nếu trong phỏng vấn bạn chỉ kịp viết bản thô, có nên nộp không? (Có — một lời giải đúng luôn hơn một lời giải tối ưu dang dở.)\n\n2. Mở rộng: trả về thêm VỊ TRÍ đầu và cuối của đoạn. Đây là câu hỏi tiếp theo người phỏng vấn hay hỏi, và nó khó hơn bạn tưởng — bạn phải nhớ chỗ "bắt đầu lại".\n\n3. Quan trọng nhất: giải một đề bất kỳ TRƯỚC MẶT một người và NÓI TO từng bước theo đúng năm bước ở phần lý thuyết. Không có ai thì tự quay màn hình kèm tiếng rồi xem lại — bạn sẽ nghe thấy mình im lặng bao lâu.',
    srsCards: [
      {
        hoi: 'Bước đầu tiên khi nhận một đề phỏng vấn thuật toán là gì?',
        dap: 'Làm rõ đề bằng cách hỏi lại: dữ liệu có rỗng không, có số âm không, lớn cỡ nào, có trùng lặp không. Đề được ra mơ hồ có chủ đích, và im lặng lao vào code là mất điểm ngay ở bước này.',
      },
      {
        hoi: 'Ý tưởng cốt lõi của thuật toán Kadane là gì?',
        dap: 'Đi một lượt từ trái sang, tại mỗi phần tử hỏi "đoạn tốt nhất KẾT THÚC TẠI ĐÂY là gì" — chỉ có hai lựa chọn: nối tiếp đoạn trước, hoặc bắt đầu lại từ chính phần tử này (khi tổng tích luỹ đang âm).',
      },
      {
        hoi: 'Vì sao khởi tạo tot_nhat = 0 là sai với bài tổng đoạn con lớn nhất?',
        dap: 'Vì khi mảng toàn số âm, nó trả về 0 — mà 0 không phải tổng của đoạn con nào (đoạn con phải có ít nhất một phần tử). Đáp án đúng là phần tử lớn nhất. Khởi tạo bằng ds[0] là hết bẫy.',
      },
      {
        hoi: 'Nên nêu lời giải thô O(n²) trong phỏng vấn hay giấu đi để chờ giải tối ưu?',
        dap: 'Nên nêu ra, kèm big-O của nó. Có một lời giải đúng trong tay là điểm sàn và là mốc để so khi tối ưu; một lời giải tối ưu viết dở dang thì không được điểm nào.',
      },
    ],
  },
]
