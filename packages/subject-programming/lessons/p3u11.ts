// lessons/p3u11.ts — Bài học P3-U11: CÔNG CỤ DEV (PR-L9).
// Đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4 ("Công cụ — dòng lệnh cơ bản,
// môi trường ảo, cấu trúc dự án · dự án mini: chuẩn hoá repo dự án theo khuôn").
//
// Chạy trên cùng bộ mô phỏng với U10 (gitSim.ts) — xem ghi chú luật soạn bài ở p3u10.ts.
// Phần "môi trường ảo" (venv) KHÔNG mô phỏng được (không có Python thật, không có hệ điều
// hành thật) nên bài dạy nó bằng lý thuyết + việc về nhà, và nói thẳng điều đó.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U11_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u11-l1',
    unitId: 'p3-u11',
    language: 'git',
    title: 'Dòng lệnh và cấu trúc dự án — dọn nhà cho code của bạn',
    hook: 'Mở một thư mục dự án của người làm nghề, bạn thấy README.md, .gitignore, src/, tests/ — luôn luôn cùng một bộ khung. Không phải vì họ thích ngăn nắp, mà vì người lạ (và chính họ sáu tháng sau) tìm được thứ cần trong ba giây.',
    theory:
      'DÒNG LỆNH: cửa sổ chỉ có chữ, gõ lệnh thì máy làm. Chậm hơn bấm chuột lúc đầu, nhưng mọi công cụ của nghề đều điều khiển bằng nó, và nó GHI LẠI ĐƯỢC — một dòng lệnh gửi cho đồng nghiệp là họ làm lại y hệt, còn "bấm vào nút thứ ba từ trên xuống" thì không.\n\nNăm lệnh dùng hằng ngày:\n    pwd                        # tôi đang đứng ở thư mục nào\n    ls                         # thư mục này có gì\n    cat ten_file               # xem nội dung file\n    echo "chu" > file          # ghi chữ vào file (> ghi đè, >> nối thêm vào cuối)\n    rm ten_file                # xoá file — KHÔNG có thùng rác, xoá là mất\n\nCẤU TRÚC DỰ ÁN CHUẨN — bốn thứ mọi kho tử tế đều có:\n\n1. README.md — dự án làm gì, chạy thế nào, ai làm. File đầu tiên người ta đọc.\n2. .gitignore — danh sách thứ KHÔNG đưa vào Git.\n3. Thư mục mã nguồn (src/ hoặc theo quy ước ngôn ngữ) — code thật nằm gọn một chỗ.\n4. File khai báo thư viện cần cài (requirements.txt cho Python, package.json cho JavaScript) — để người khác dựng lại đúng môi trường của bạn.\n\n.GITIGNORE QUAN TRỌNG HƠN BẠN TƯỞNG. Ba nhóm phải bỏ vào đó:\n- File bí mật: .env, khoá API. Lỡ commit khoá lên GitHub công khai thì coi như đã lộ — có bot quét liên tục, xoá đi cũng muộn vì lịch sử Git còn giữ. Đây là tai nạn kinh điển, mỗi năm hàng nghìn người dính.\n- File máy tự sinh: __pycache__/, node_modules/, dist/. Chúng dựng lại được từ mã nguồn, đưa vào kho chỉ làm nặng.\n- File riêng của máy bạn: cấu hình trình soạn thảo, file rác hệ điều hành.\n\nMÔI TRƯỜNG ẢO (venv) — phần này bạn phải làm trên máy thật, sandbox không chạy được nên đây là lý thuyết cho việc về nhà. Vấn đề: dự án A cần thư viện phiên bản 1, dự án B cần phiên bản 2, cài chung một chỗ thì đá nhau. Môi trường ảo cho mỗi dự án một "tủ thuốc" riêng:\n    python3 -m venv .venv            # tạo môi trường ảo trong thư mục .venv\n    source .venv/bin/activate        # bật nó lên (Windows: .venv\\Scripts\\activate)\n    pip install -r requirements.txt  # cài đúng bộ thư viện của dự án\nVà .venv/ luôn nằm trong .gitignore — nó là thứ dựng lại được, không phải mã nguồn.',
    workedExample: {
      code: `git init
echo "# Quan cua toi" > README.md
echo ".env" > .gitignore
echo "__pycache__/" >> .gitignore
cat .gitignore
git add .
git commit -m "Chuan hoa cau truc du an"
ls
git log --oneline`,
      stdinLines: [],
    },
    predict: {
      code: `echo "dong mot" > ghi_chu.txt
echo "dong hai" > ghi_chu.txt
cat ghi_chu.txt`,
      question: 'File ghi_chu.txt cuối cùng chứa gì?',
      choices: ['dong hai', 'dong mot\ndong hai', 'dong mot', 'Báo lỗi vì file đã tồn tại'],
      answerIndex: 0,
      explain:
        'Dấu > GHI ĐÈ: lần thứ hai xoá sạch nội dung cũ rồi viết lại. Muốn NỐI THÊM vào cuối thì dùng >> (hai dấu). Nhầm hai dấu này là cách nhanh nhất để tự xoá mất công sức của mình — nên nhớ: một dấu = thay thế, hai dấu = thêm vào.',
    },
    parsons: {
      prompt: 'Xếp các lệnh: dựng bộ khung chuẩn cho một dự án mới rồi chốt commit đầu tiên.',
      lines: [
        'git init',
        'echo "# Du an cua toi" > README.md',
        'echo ".env" > .gitignore',
        'echo "node_modules/" >> .gitignore',
        'git add .',
        'git commit -m "Khoi tao cau truc du an"',
      ],
    },
    make: {
      prompt:
        'Chuẩn hoá kho dự án cửa hàng theo khuôn nghề. Gõ các lệnh để:\n\n1. Khởi tạo kho git.\n2. Tạo README.md nội dung: # Quan cua toi\n3. Tạo .gitignore chứa ĐÚNG HAI DÒNG, theo thứ tự:\n.env\n__pycache__/\n(dòng đầu dùng >, dòng thứ hai dùng >> để nối thêm — dùng > hai lần là bạn xoá mất dòng đầu)\n4. Xem lại nội dung .gitignore bằng cat.\n5. Đưa tất cả vào Git và chốt commit với lời nhắn: Chuan hoa cau truc\n6. Liệt kê file trong thư mục.',
      starterCode: `git init\n# tao README.md\n\n# tao .gitignore hai dong (chu y > va >>)\n\n# kiem lai bang cat, roi add + commit, cuoi cung ls\n`,
      testCases: [
        {
          stdinLines: [],
          expected: '.env\n__pycache__/',
          match: 'contains',
          hidden: false,
          label: 'cat .gitignore hiện đủ hai dòng đúng thứ tự (dùng đúng > rồi >>)',
        },
        {
          stdinLines: [],
          expected: 'Chuan hoa cau truc',
          match: 'contains',
          hidden: false,
          label: 'Commit đúng lời nhắn',
        },
        {
          stdinLines: [],
          expected: '.gitignore\nREADME.md',
          match: 'contains',
          hidden: false,
          label: 'ls hiện đủ cả hai file của bộ khung',
        },
        {
          stdinLines: [],
          expected: '[main c1] Chuan hoa cau truc\n 2 file trong ban chup',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: commit chụp ĐỦ 2 file (git add . lấy cả file ẩn .gitignore)',
        },
      ],
      hints: [
        'Bộ khung tối thiểu chỉ gồm hai file: README.md và .gitignore. Tạo bằng echo "…" > ten_file.',
        'Hai dòng trong .gitignore: dòng đầu echo ".env" > .gitignore, dòng sau echo "__pycache__/" >> .gitignore. Dùng > cả hai lần là dòng đầu bị xoá mất.',
        'Xong phần file thì: cat .gitignore để kiểm, rồi git add . (dấu chấm = tất cả), git commit -m "Chuan hoa cau truc", cuối cùng ls.',
      ],
      sampleSolution: `git init
echo "# Quan cua toi" > README.md
echo ".env" > .gitignore
echo "__pycache__/" >> .gitignore
cat .gitignore
git add .
git commit -m "Chuan hoa cau truc"
ls`,
    },
    homework:
      'Về nhà (trên máy thật): mở terminal ở thư mục dự án của bạn, tạo môi trường ảo bằng python3 -m venv .venv rồi bật lên, cài thư viện và ghi lại danh sách bằng pip freeze > requirements.txt. Nhớ thêm .venv/ vào .gitignore trước khi commit. Sau bước này, bất kỳ ai clone kho của bạn cũng dựng lại được đúng môi trường chỉ bằng hai lệnh — đó là ranh giới giữa "code chạy trên máy tôi" và "dự án người khác dùng được".',
  },
]
