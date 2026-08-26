// lessons/p4u5.ts — Bài học P4-U5: TEST TỰ ĐỘNG 1 (pytest — nghĩ ca biên TRƯỚC khi viết).
// Làn A theo hiến chương docs/research/dac-ta-bac-p4-mo-phong-den-dau-2026-08-26.md: chạy
// THẬT bằng engine Python, nhưng bộ chạy pytest là bản rút gọn tự khai (pytestPrelude.ts).
//
// Giới hạn CHẤM của bài này, ghi rõ để người soạn sau không tưởng nhầm: cổng chỉ kiểm được
// CẤU TRÚC (đủ 4 hàm test đúng tên, tất cả xanh) chứ không kiểm được học viên có assert tử tế
// hay không — về lý thuyết vẫn viết được `assert True` cho qua. Phần đó do U6 gánh: ở U6 hàm
// bị chấm CÓ BUG thật, test dối trá sẽ không bao giờ ra được báo cáo mà đề yêu cầu.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P4U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p4-u5-l1',
    unitId: 'p4-u5',
    language: 'pytest',
    title: 'Test tự động — để máy kiểm lại bạn, mỗi lần sửa code',
    hook: 'Cách bạn đang kiểm code là chạy tay rồi nhìn màn hình. Nó có thật sự kiểm không? Hôm nay bạn thử 3 trường hợp; tuần sau sửa công thức giảm giá, bạn thử lại đúng 1 trường hợp vừa sửa — hai cái kia gãy lúc nào không ai biết. Test tự động là bộ 3 trường hợp ấy được ghi lại thành code, chạy lại toàn bộ trong một giây.',
    theory:
      'Một test là một hàm có tên bắt đầu bằng test_, bên trong dùng assert để nói "cái này PHẢI đúng".\n\ndef test_tien_10_kwh():\n    assert tinh_tien_dien(10) == 18930\n\nassert đúng thì im lặng; sai thì ném AssertionError và bộ chạy ghi FAILED. Bạn không tự gọi hàm test — bộ chạy tự tìm mọi hàm test_ và chạy hết.\n\nBa dụng cụ dùng nhiều nhất:\n- pytest.raises: khẳng định code PHẢI ném lỗi.\n  with pytest.raises(ValueError):\n      tinh_tien_dien(-5)\n  Không ném lỗi thì chính test này FAILED — đúng ý bạn muốn.\n- pytest.approx: so số thực có dung sai. assert 0.1 + 0.2 == 0.3 là SAI trong mọi ngôn ngữ dùng số thực nhị phân; assert 0.1 + 0.2 == pytest.approx(0.3) mới đúng.\n- @pytest.mark.parametrize: một hàm test chạy nhiều bộ dữ liệu, mỗi bộ báo cáo riêng.\n\nĐiều quan trọng nhất của unit này KHÔNG phải cú pháp, mà là NGHĨ CA BIÊN TRƯỚC. Với mọi hàm, hỏi bốn câu: ca bình thường? ca RỖNG/số 0? ca ĐÚNG NGAY MỐC (50 kWh, đúng 100.000đ)? ca SAI HẲN (số âm, chữ thay vì số)? Lỗi thật của người mới gần như luôn nằm ở hai câu sau — và đó cũng là những ca không ai nhớ thử tay.\n\nLƯU Ý về sandbox: bộ chạy pytest ở đây là bản RÚT GỌN của bài học (nó tự in dòng [GIA LAP] đầu báo cáo) — có assert, raises, approx, parametrize, không có fixture/conftest. Cú pháp bạn gõ là cú pháp pytest thật, nên chạy pytest thật trên máy ở phần việc về nhà là chạy được ngay.',
    workedExample: {
      code: `import pytest

# Hàm cần kiểm: tiền điện bậc thang EVN (bậc 1: 1893đ, bậc 2: 1956đ, bậc 3: 2271đ)
def tinh_tien_dien(kwh):
    if kwh < 0:
        raise ValueError("So kWh khong the am")
    if kwh <= 50:
        return kwh * 1893
    if kwh <= 100:
        return 50 * 1893 + (kwh - 50) * 1956
    return 50 * 1893 + 50 * 1956 + (kwh - 100) * 2271

def test_ca_binh_thuong():          # ① ca thường ngày
    assert tinh_tien_dien(30) == 56790

def test_ca_rong():                 # ② ca 0 — nhà không dùng điện tháng đó
    assert tinh_tien_dien(0) == 0

def test_dung_ngay_moc_50():        # ③ CA BIÊN — chỗ lỗi hay nấp nhất
    assert tinh_tien_dien(50) == 94650

def test_so_am_thi_bao_loi():       # ④ ca sai hẳn — phải NÉM LỖI, không được trả số
    with pytest.raises(ValueError):
        tinh_tien_dien(-5)`,
      stdinLines: [],
    },
    predict: {
      code: `import pytest\n\ndef test_mot():\n    assert 2 + 2 == 4\n\ndef test_hai():\n    assert 0.1 + 0.2 == 0.3`,
      question: 'Bộ chạy test in ra dòng tổng kết nào ở cuối?',
      choices: [
        '=== 2 passed, 0 failed ===',
        '=== 1 passed, 1 failed ===',
        '=== 0 passed, 2 failed ===',
        'Bao loi cu phap, khong chay duoc',
      ],
      answerIndex: 1,
      explain:
        'test_mot đúng. test_hai FAILED: máy tính lưu số thực dạng nhị phân nên 0.1 + 0.2 ra 0.30000000000000004, không bằng đúng 0.3. Đây là lý do tồn tại của pytest.approx — viết assert 0.1 + 0.2 == pytest.approx(0.3) thì test xanh.',
    },
    parsons: {
      prompt:
        'Xếp các dòng sau thành một test khẳng định rằng gọi tinh_tien_dien với số âm PHẢI ném ValueError.',
      lines: [
        'import pytest',
        'def test_so_am_thi_bao_loi():',
        '    with pytest.raises(ValueError):',
        '        tinh_tien_dien(-5)',
      ],
    },
    make: {
      prompt:
        'Hàm tinh_tien_dien(kwh) đã có sẵn trong code khởi đầu và nó ĐÚNG. Việc của bạn là viết bộ test cho nó — ĐÚNG 4 hàm, đúng tên sau đây:\n\n1. test_ca_binh_thuong — 30 kWh phải ra 56790.\n2. test_ca_rong — 0 kWh phải ra 0.\n3. test_ranh_gioi_50 — ĐÚNG 50 kWh phải ra 94650 (mốc hết bậc 1).\n4. test_so_am — gọi với -5 phải NÉM ValueError (dùng pytest.raises).\n\nBạn KHÔNG tự gọi các hàm test; bộ chạy tự tìm và chạy hết. Cả 4 phải xanh.\n\nGợi ý tính tay: bậc 1 (tới 50 kWh) 1893đ/kWh → 30 × 1893 = 56.790; 50 × 1893 = 94.650.',
      starterCode: `import pytest

def tinh_tien_dien(kwh):
    if kwh < 0:
        raise ValueError("So kWh khong the am")
    if kwh <= 50:
        return kwh * 1893
    if kwh <= 100:
        return 50 * 1893 + (kwh - 50) * 1956
    return 50 * 1893 + 50 * 1956 + (kwh - 100) * 2271

# Viết 4 hàm test ở dưới đây
`,
      testCases: [
        {
          stdinLines: [],
          expected: '=== 4 passed, 0 failed ===',
          match: 'contains',
          hidden: false,
          label: 'Đủ 4 test và tất cả đều xanh',
        },
        {
          stdinLines: [],
          expected: 'test_ranh_gioi_50 PASSED',
          match: 'contains',
          hidden: false,
          label: 'Có test cho CA BIÊN 50 kWh, đặt đúng tên',
        },
        {
          stdinLines: [],
          expected: 'test_so_am PASSED',
          match: 'contains',
          hidden: false,
          label: 'Có test khẳng định số âm phải ném lỗi',
        },
        {
          stdinLines: [],
          expected: 'test_ca_rong PASSED',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: không quên ca 0 kWh',
        },
      ],
      hints: [
        'Tên hàm PHẢI bắt đầu bằng test_ thì bộ chạy mới tìm thấy — đặt tên kiem_tra_50 là nó lặng lẽ bỏ qua, báo cáo hiện 0 test.',
        'Đừng tự gọi test_ca_rong() ở cuối file. Bộ chạy làm việc đó; bạn gọi tay thì nó chạy hai lần.',
        'Ca số âm không dùng assert được, vì hàm ném lỗi trước khi kịp trả giá trị. Đó chính là lúc dùng with pytest.raises(ValueError):',
        'Khung tham chiếu:\n\ndef test_ca_binh_thuong():\n    assert tinh_tien_dien(30) == 56790\n\ndef test_so_am():\n    with pytest.raises(ValueError):\n        tinh_tien_dien(-5)',
      ],
      sampleSolution: `import pytest

def tinh_tien_dien(kwh):
    if kwh < 0:
        raise ValueError("So kWh khong the am")
    if kwh <= 50:
        return kwh * 1893
    if kwh <= 100:
        return 50 * 1893 + (kwh - 50) * 1956
    return 50 * 1893 + 50 * 1956 + (kwh - 100) * 2271

def test_ca_binh_thuong():
    assert tinh_tien_dien(30) == 56790

def test_ca_rong():
    assert tinh_tien_dien(0) == 0

def test_ranh_gioi_50():          # đúng mốc hết bậc 1 — chỗ lỗi hay nấp
    assert tinh_tien_dien(50) == 94650

def test_so_am():
    with pytest.raises(ValueError):
        tinh_tien_dien(-5)`,
    },
    homework:
      'Cài pytest THẬT trên máy bạn: mở dòng lệnh, chạy `pip install pytest`. Tạo file tinh_tien.py chứa hàm của bạn và file test_tinh_tien.py chứa các test, rồi chạy `pytest -v`. So báo cáo thật với báo cáo rút gọn trong bài: pytest thật in thêm gì mà bản ở đây không có? (Gợi ý: nhìn phần nó hiện GIÁ TRỊ thật hai vế của assert khi thất bại.) Đây là lần đầu bạn chạy một công cụ nghề nghiệp thật trên máy mình — giữ lại thư mục đó, U6 dùng tiếp.',
    srsCards: [
      {
        hoi: 'Bộ chạy test tìm hàm test bằng cách nào?',
        dap: 'Nó tự tìm mọi hàm có tên bắt đầu bằng test_ rồi chạy hết. Đặt tên khác là hàm bị bỏ qua lặng lẽ; và bạn không được tự gọi hàm test.',
      },
      {
        hoi: 'Khi nào dùng pytest.raises thay cho assert?',
        dap: 'Khi điều cần khẳng định là code PHẢI ném lỗi (dữ liệu sai hẳn). Hàm ném lỗi trước khi trả giá trị nên không assert được; with pytest.raises(ValueError): mới diễn đạt được ý đó.',
      },
      {
        hoi: 'Vì sao assert 0.1 + 0.2 == 0.3 lại thất bại?',
        dap: 'Máy lưu số thực dạng nhị phân nên tổng ra 0.30000000000000004. So số thực phải dùng dung sai: == pytest.approx(0.3).',
      },
      {
        hoi: 'Bốn câu hỏi cần đặt trước khi viết test cho một hàm là gì?',
        dap: 'Ca bình thường? Ca rỗng/số 0? Ca đúng ngay mốc (ranh giới)? Ca sai hẳn (âm, sai kiểu)? Lỗi thật gần như luôn nằm ở hai câu sau.',
      },
    ],
  },
]
