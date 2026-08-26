// lessons/p4u6.ts — Bài học P4-U6: TEST TỰ ĐỘNG 2 (test BẮT ĐƯỢC lỗi ca biên thật).
// Làn A. Khác U5 ở điểm cốt tử: hàm bị chấm ở bài này CÓ BUG THẬT, nên bộ test viết cho có
// (assert True) không bao giờ ra được báo cáo mà đề yêu cầu. Đây là chỗ cổng chấm thật sự
// kiểm được CHẤT LƯỢNG test chứ không chỉ cấu trúc.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U6_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u6-l1',
    unitId: 'p4-u6',
    language: 'pytest',
    title: 'Test giỏi là test LÀM ĐỎ được code sai',
    hook: 'Một bộ test toàn màu xanh nghe thì yên tâm, nhưng nó chỉ chứng minh được một điều: những trường hợp BẠN NGHĨ RA đều chạy đúng. Quán bạn tính sai đúng một tình huống — hoá đơn đúng chẵn 100.000đ không được giảm giá — và bộ test xanh mướt không hề biết. Hôm nay bạn viết test để BẮT nó.',
    theory:
      'Giá trị của một test không nằm ở lúc nó xanh, mà ở khả năng nó CHUYỂN ĐỎ khi code sai. Test không bao giờ đỏ được là test vô dụng — nó chỉ tạo cảm giác an toàn.\n\nCách kiểm tra chính bộ test của mình (nghề gọi là "test cái test"): cố ý làm hỏng code một chút — đổi >= thành >, đổi + thành -, xoá một dòng — rồi chạy lại. Nếu KHÔNG có test nào đỏ, bộ test của bạn đang không canh chỗ đó.\n\nLỖI CA BIÊN là loại lỗi trốn giỏi nhất, vì hai lý do:\n1. Nó chỉ sai ở ĐÚNG MỘT giá trị. Thử 99.000 đúng, thử 150.000 đúng, chỉ 100.000 sai — mà 100.000 lại là con số ít ai nghĩ tới khi thử tay.\n2. Nó không làm chương trình vỡ. Không traceback, không báo lỗi; chỉ là một con số hơi khác, lặng lẽ, mỗi ngày.\n\nQuy tắc thực dụng: mỗi khi trong code có một con số so sánh (>= 100000, <= 50, > 0), viết ba test quanh nó — NGAY DƯỚI mốc, ĐÚNG MỐC, NGAY TRÊN mốc. Ba test đó bắt gần hết loại lỗi này.\n\nMột nếp làm việc quan trọng của nghề: khi có người báo lỗi, ĐỪNG sửa ngay. Viết trước một test tái hiện đúng lỗi đó và nhìn nó ĐỎ — lúc ấy bạn mới chắc mình đã hiểu đúng vấn đề. Sửa code cho tới khi test xanh. Test đó ở lại vĩnh viễn, canh cho lỗi ấy không quay lại.',
    workedExample: {
      code: `import pytest

# Hàm này CÓ LỖI ca biên gài sẵn: quán nói "từ 100.000đ trở lên giảm 10%",
# nhưng code viết > 100000 nên đúng 100.000 lại KHÔNG được giảm.
def tinh_tien_don(gia, so_luong):
    tien = gia * so_luong
    if tien > 100000:          # <-- LỖI: phải là >=
        tien = tien * 90 // 100
    return tien

def test_duoi_moc():                 # ngay DƯỚI mốc: đúng ra không giảm — code đúng ở đây
    assert tinh_tien_don(9000, 11) == 99000

def test_dung_moc_100k():            # ĐÚNG MỐC: đây là test bắt được lỗi -> se FAILED
    assert tinh_tien_don(10000, 10) == 90000

def test_tren_moc():                 # ngay TRÊN mốc: code đúng ở đây
    assert tinh_tien_don(10000, 11) == 99000`,
      stdinLines: [],
    },
    predict: {
      code: `import pytest\n\ndef chia(a, b):\n    if b == 0:\n        return 0\n    return a / b\n\ndef test_chia_khong():\n    with pytest.raises(ZeroDivisionError):\n        chia(10, 0)`,
      question: 'Bộ chạy test in ra dòng tổng kết nào ở cuối?',
      choices: [
        '=== 1 passed, 0 failed ===',
        '=== 0 passed, 1 failed ===',
        'Bao ZeroDivisionError roi dung chuong trinh',
        '=== 0 passed, 0 failed ===',
      ],
      answerIndex: 1,
      explain:
        'Hàm chia đã tự xử lý b == 0 nên nó KHÔNG ném lỗi nữa. pytest.raises khẳng định "phải ném" mà không thấy ném, nên chính test này thất bại (DID NOT RAISE). Đây là điều tốt: test đang nói cho bạn biết hành vi thật đã khác với điều bạn tưởng.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành ba test vây quanh mốc giảm giá 100.000đ (ngay dưới — đúng mốc — ngay trên).',
      lines: [
        'def test_duoi_moc():',
        '    assert tinh_tien_don(9000, 11) == 99000',
        'def test_dung_moc_100k():',
        '    assert tinh_tien_don(10000, 10) == 90000',
        'def test_tren_moc():',
        '    assert tinh_tien_don(10000, 11) == 99000',
      ],
    },
    make: {
      prompt:
        'Trong code khởi đầu có hàm tinh_tien_don(gia, so_luong) đang CHẠY SAI: quy định của quán là "hoá đơn TỪ 100.000đ trở lên được giảm 10%", nhưng code lại viết > 100000.\n\nViệc của bạn KHÔNG phải sửa hàm đó. Việc của bạn là viết bộ test VÂY QUANH MỐC để lỗi lộ ra — ĐÚNG 4 hàm, đúng tên:\n\n1. test_don_nho — 3 ly × 5.000đ = 15.000đ, không giảm.\n2. test_duoi_moc — 11 × 9.000đ = 99.000đ, không giảm (ngay DƯỚI mốc).\n3. test_ranh_gioi_100k — 10 × 10.000đ = 100.000đ, theo ĐÚNG quy định phải còn 90.000đ.\n4. test_tren_moc — 11 × 10.000đ = 110.000đ, giảm 10% còn 99.000đ.\n\nMỗi test khẳng định kết quả ĐÚNG THEO QUY ĐỊNH của quán, không phải theo cách code đang chạy. Kết quả mong đợi: 3 test xanh và ĐÚNG MỘT test đỏ — chính là test_ranh_gioi_100k. Bộ test đỏ ở đúng chỗ như vậy mới là bộ test làm được việc.\n\n(Làm tròn xuống đồng nguyên: tien * 90 // 100.)',
      starterCode: `import pytest

# HÀM NÀY CÓ LỖI — đừng sửa nó. Việc của bạn là viết test làm lỗi lộ ra.
def tinh_tien_don(gia, so_luong):
    tien = gia * so_luong
    if tien > 100000:
        tien = tien * 90 // 100
    return tien

# Viết 4 hàm test ở dưới đây
`,
      testCases: [
        {
          stdinLines: [],
          expected: '=== 3 passed, 1 failed ===',
          match: 'contains',
          hidden: false,
          label: 'Đúng 4 test, và đúng MỘT test đỏ',
        },
        {
          stdinLines: [],
          expected: 'test_ranh_gioi_100k FAILED',
          match: 'contains',
          hidden: false,
          label: 'Test đỏ phải là test ca biên 100.000đ — đây là bằng chứng nó bắt được lỗi',
        },
        {
          stdinLines: [],
          expected: 'test_duoi_moc PASSED',
          match: 'contains',
          hidden: false,
          label: 'Ca ngay DƯỚI mốc vẫn phải xanh (code đúng ở vùng này)',
        },
        {
          stdinLines: [],
          expected: 'test_tren_moc PASSED',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: ca ngay TRÊN mốc cũng phải xanh — không được đỏ bừa cho đủ số',
        },
      ],
      hints: [
        'Đề KHÔNG cho phép sửa hàm. Nếu bạn sửa > thành >= thì mọi test đều xanh và bài không đạt — vì mất luôn bằng chứng rằng test của bạn bắt được lỗi.',
        'test_ranh_gioi_100k phải assert theo QUY ĐỊNH (== 90000), không phải theo cách code đang chạy (100000). Assert theo code sai thì test xanh và lỗi tiếp tục ẩn.',
        '15.000 và 99.000 nằm dưới mốc nên giữ nguyên; 110.000 × 90 // 100 = 99.000. Chỉ ca đúng 100.000 mới lệch giữa quy định và code.',
        'Khung tham chiếu:\n\ndef test_ranh_gioi_100k():\n    assert tinh_tien_don(10000, 10) == 90000\n\ndef test_tren_moc():\n    assert tinh_tien_don(10000, 11) == 99000',
      ],
      sampleSolution: `import pytest

# HÀM NÀY CÓ LỖI — đừng sửa nó. Việc của bạn là viết test làm lỗi lộ ra.
def tinh_tien_don(gia, so_luong):
    tien = gia * so_luong
    if tien > 100000:
        tien = tien * 90 // 100
    return tien

def test_don_nho():
    assert tinh_tien_don(5000, 3) == 15000

def test_duoi_moc():                      # 99.000 — ngay dưới mốc, không giảm
    assert tinh_tien_don(9000, 11) == 99000

def test_ranh_gioi_100k():                # ĐÚNG mốc — theo quy định phải giảm còn 90.000
    assert tinh_tien_don(10000, 10) == 90000

def test_tren_moc():                      # 110.000 giảm 10% còn 99.000
    assert tinh_tien_don(10000, 11) == 99000`,
    },
    homework:
      'Quay lại thư mục pytest thật bạn đã dựng ở U5. Lần này làm đúng nếp của nghề: (1) cố ý làm hỏng một chỗ trong hàm của bạn — đổi một dấu >= thành >, hoặc + thành -; (2) chạy `pytest -v` và xem có test nào đỏ không. Nếu KHÔNG có test nào đỏ, đó là chỗ bộ test của bạn đang bỏ trống — viết thêm test cho tới khi nó đỏ, rồi khôi phục code và xem nó xanh lại. Ghi lại: bạn phát hiện được mấy chỗ trống như vậy?',
    srsCards: [
      {
        hoi: 'Làm sao biết một bộ test có thật sự canh được code hay không?',
        dap: 'Cố ý làm hỏng code một chút (đổi >= thành >, + thành -) rồi chạy lại. Không có test nào đỏ nghĩa là bộ test đang không canh chỗ đó — nó chỉ tạo cảm giác an toàn.',
      },
      {
        hoi: 'Thấy một con số so sánh trong code (>= 100000) thì viết mấy test quanh nó?',
        dap: 'Ba test: ngay DƯỚI mốc, ĐÚNG MỐC, ngay TRÊN mốc. Ba ca đó bắt gần hết lỗi ca biên — loại lỗi chỉ sai ở đúng một giá trị và không làm chương trình vỡ.',
      },
      {
        hoi: 'Có người báo lỗi, việc đầu tiên nên làm là gì?',
        dap: 'Viết một test tái hiện đúng lỗi đó và nhìn nó ĐỎ trước khi sửa. Đỏ được nghĩa là bạn đã hiểu đúng vấn đề; sửa tới khi xanh, và test đó ở lại canh cho lỗi không quay lại.',
      },
    ],
  },
]
