// lessons/gitu2.ts — Chương C2 "Nhìn thấy việc mình làm" của khoá Git & GitHub thực hành
// (PR 4/4 khoá Git — docs/specs/2026-08-30-khoa-hoc-thuc-hanh-github.md).
//
// unitId 'git-u2' KHÔNG nằm trong curriculum.ts (bậc P1–P6) — đây là quy ước riêng của tầng
// khoá ngắn: chương của khoá đóng vai trò "unit ảo", được lessons.test.ts công nhận qua
// SHORT_COURSES (packages/subject-programming/courses/registry.ts), không qua curriculum.
//
// Ba bài dùng đúng lệnh đã có trong gitSim.ts (không có --graph/show/blame — engine chưa làm):
// git diff (chưa add) · git diff --staged (đã add) · git log đầy đủ vs --oneline.
import type { ProgrammingLesson } from '../lessonTypes.js'

export const GIT_U2_LESSONS: ProgrammingLesson[] = [
  {
    id: 'git-u2-l1',
    unitId: 'git-u2',
    language: 'git',
    title: 'git diff — thấy CHÍNH XÁC dòng nào vừa đổi',
    hook: 'Bạn sửa một file lúc chiều, giờ không nhớ đã đổi gì. git status chỉ nói "file này đã sửa" — không nói ĐỔI CÁI GÌ. git diff mới trả lời được câu đó.',
    theory:
      'git diff so sánh HAI PHIÊN BẢN và in ra từng dòng khác nhau — dòng nào MẤT ĐI có dấu -, dòng nào MỚI THÊM có dấu +.\n\nKhông kèm gì: git diff\n    So THƯ MỤC LÀM VIỆC với thứ đã add (hoặc commit gần nhất nếu chưa add gì). Đây là câu hỏi "tôi vừa gõ thêm cái gì so với lần add cuối?"\n\nDùng thường xuyên nhất TRƯỚC KHI git add — đọc lại diff một lượt là cách tốt nhất để không add nhầm dòng debug hay comment quên xoá. Coi git diff như đọc lại bài trước khi nộp.\n\nOutput có dạng:\n    diff --git a/gia.txt b/gia.txt\n    -gia goc\n    +gia moi\n\nKhông có gì để so sánh (thư mục sạch) thì git diff không in gì cả — im lặng nghĩa là "không có gì khác".',
    workedExample: {
      code: `git init
echo "gia goc" > gia.txt
git add .
git commit -m "Bang gia goc"
echo "gia moi" > gia.txt
git diff`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "gia goc" > gia.txt
git add .
git commit -m "Bang gia goc"
echo "gia moi" > gia.txt
git diff`,
      question: 'git diff cho thấy dòng nào bị XOÁ (dấu -)?',
      choices: ['-gia goc', '-gia moi', '+gia goc', 'Khong co dong nao bi xoa'],
      answerIndex: 0,
      explain:
        'Dấu - đứng trước dòng CŨ vừa mất đi — ở đây là "gia goc" (nội dung trước khi sửa). Dấu + (không phải đáp án) mới là dòng MỚI thêm vào, "gia moi".',
    },
    parsons: {
      prompt: 'Xếp thứ tự: sửa file, rồi đọc lại đúng phần vừa đổi trước khi add.',
      lines: [
        'echo "gia moi" > gia.txt',
        'git diff',
        'git add gia.txt',
        'git commit -m "Cap nhat gia"',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit (file mota.txt, nội dung "quan nho xinh").\n\nGõ các lệnh để:\n1. Sửa mota.txt thành nội dung: quan nho xinh, gan truong hoc\n2. Chạy git diff để xem đúng phần vừa đổi (KHÔNG add).\n3. Sau khi xem xong, add và commit với lời nhắn: Cap nhat mo ta',
      starterCode: `# Kho da co san file mota.txt = "quan nho xinh"\n# 1. sua file\n\n# 2. git diff truoc khi add\n\n# 3. add + commit\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "quan nho xinh" > mota.txt',
            'git add .',
            'git commit -m "Mo ta ban dau"',
          ],
          expected: '-quan nho xinh',
          match: 'contains',
          hidden: false,
          label: 'diff cho thấy dòng cũ bị thay (dấu -)',
        },
        {
          stdinLines: [
            'git init',
            'echo "quan nho xinh" > mota.txt',
            'git add .',
            'git commit -m "Mo ta ban dau"',
          ],
          expected: '+quan nho xinh, gan truong hoc',
          match: 'contains',
          hidden: false,
          label: 'diff cho thấy dòng mới thêm (dấu +)',
        },
        {
          stdinLines: [
            'git init',
            'echo "quan nho xinh" > mota.txt',
            'git add .',
            'git commit -m "Mo ta ban dau"',
          ],
          expected: '[main c2] Cap nhat mo ta',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: commit thứ hai đúng lời nhắn',
        },
      ],
      hints: [
        'Sửa file bằng echo: echo "quan nho xinh, gan truong hoc" > mota.txt (ghi đè nội dung cũ).',
        'Xem diff TRƯỚC khi add: git diff — dòng cũ có dấu -, dòng mới có dấu +.',
        'Xem xong mới git add mota.txt rồi git commit -m "Cap nhat mo ta".',
      ],
      sampleSolution: `echo "quan nho xinh, gan truong hoc" > mota.txt
git diff
git add mota.txt
git commit -m "Cap nhat mo ta"`,
    },
    homework:
      'Về nhà: trên repo GitHub thật của bạn, sửa một dòng trong README.md rồi gõ git diff trước khi add. Tập thói quen này — nhiều lập trình viên có kinh nghiệm vẫn git diff mỗi lần trước khi commit, kể cả sau nhiều năm.',
    srsCards: [
      {
        hoi: 'git diff (không kèm gì) so sánh cái gì với cái gì?',
        dap: 'So THƯ MỤC LÀM VIỆC với thứ đã add (hoặc commit gần nhất nếu chưa add gì) — trả lời câu "tôi vừa gõ thêm cái gì so với lần add cuối?"',
      },
      {
        hoi: 'Dấu - và + trong output git diff nghĩa là gì?',
        dap: 'Dấu - là dòng CŨ vừa mất đi, dấu + là dòng MỚI vừa thêm vào.',
      },
      {
        hoi: 'Vừa commit xong, gõ git diff ngay thì in ra gì?',
        dap: 'Không in gì cả — thư mục làm việc và commit gần nhất giống hệt nhau, không có gì khác. Im lặng là câu trả lời, không phải lỗi.',
      },
    ],
  },
  {
    id: 'git-u2-l2',
    unitId: 'git-u2',
    language: 'git',
    title: 'git diff --staged — kiểm tra lại TRƯỚC khi bấm commit',
    hook: 'Bạn đã git add rồi, tay đang gõ git commit -m. Khoan đã — bạn có chắc THỨ NẰM TRONG VÙNG CHỜ đúng là thứ bạn muốn chốt không? git diff --staged là cái nhìn cuối trước khi quyết định.',
    theory:
      'git diff (bài trước) so thư mục làm việc với vùng chờ. git diff --staged làm việc KHÁC: so VÙNG CHỜ (thứ đã add) với COMMIT GẦN NHẤT.\n\nTại sao cần cả hai? Vì sau khi git add, bạn có thể LỠ sửa tiếp file đó (rất hay xảy ra). Lúc này git diff và git diff --staged trả lời hai câu hỏi khác nhau:\n\n    git diff --staged   → "nếu tôi commit NGAY BÂY GIỜ, cái gì sẽ được chốt?"\n    git diff             → "tôi vừa sửa thêm gì SAU KHI add, mà chưa kịp add lại?"\n\nQUY TRÌNH AN TOÀN trước mỗi lần commit:\n    git add <file>\n    git diff --staged     # đọc lại đúng thứ sắp chốt\n    git commit -m "..."\n\nĐọc git diff --staged trước khi commit là thói quen ngăn được lỗi phổ biến nhất: commit nhầm nội dung debug, dòng comment tạm, hoặc quên add một phần thay đổi.',
    workedExample: {
      code: `git init
echo "gia goc" > gia.txt
git add .
git commit -m "Bang gia goc"
echo "gia moi" > gia.txt
git add gia.txt
git diff --staged`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
echo "b" > a.txt
git add a.txt
echo "c" > a.txt
git diff --staged`,
      question:
        'File a.txt bị sửa HAI LẦN: đổi thành "b" rồi add, sau đó đổi tiếp thành "c" (chưa add lại). git diff --staged có dòng nào?',
      choices: ['+b', '+c', '-b', 'Khong co gi thay doi'],
      answerIndex: 0,
      explain:
        'git diff --staged CHỈ so vùng chờ với commit gần nhất — vùng chờ đang giữ đúng bản "b" (lúc git add), nên dòng mới hiện ra là +b. Bản "c" là thay đổi SAU KHI add, git diff --staged không thấy nó — phải gõ git diff (không --staged) để thấy phần "c" chưa add.',
    },
    parsons: {
      prompt: 'Xếp đúng quy trình an toàn: add rồi kiểm tra lại trước khi chốt.',
      lines: [
        'echo "gia moi" > gia.txt',
        'git add gia.txt',
        'git diff --staged',
        'git commit -m "Cap nhat gia"',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit (file gia.txt = "tra da 5000").\n\nGõ các lệnh để:\n1. Sửa gia.txt thành: tra da 6000\n2. git add gia.txt\n3. Chạy git diff --staged để kiểm tra lại (KHÔNG bỏ qua bước này).\n4. git commit -m "Tang gia tra da"',
      starterCode: `# Kho da co san gia.txt = "tra da 5000"\n# 1. sua file\n\n# 2. add\n\n# 3. diff --staged de kiem tra lai\n\n# 4. commit\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: '-tra da 5000',
          match: 'contains',
          hidden: false,
          label: 'diff --staged cho thấy dòng cũ (dấu -)',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: '+tra da 6000',
          match: 'contains',
          hidden: false,
          label: 'diff --staged cho thấy dòng mới (dấu +)',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: '[main c2] Tang gia tra da',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: commit thứ hai đúng lời nhắn',
        },
      ],
      hints: [
        'Sửa rồi add trước: echo "tra da 6000" > gia.txt, sau đó git add gia.txt.',
        'Kiểm tra lại bằng git diff --staged (có --staged, khác bài trước).',
        'Chốt bằng git commit -m "Tang gia tra da".',
      ],
      sampleSolution: `echo "tra da 6000" > gia.txt
git add gia.txt
git diff --staged
git commit -m "Tang gia tra da"`,
    },
    homework:
      'Về nhà: trước lần commit tiếp theo trên repo thật của bạn, bắt buộc tự mình chạy git diff --staged một lần trước khi bấm commit. Làm quen tay việc này 5 lần liên tiếp — sau đó nó tự thành phản xạ.',
    srsCards: [
      {
        hoi: 'git diff --staged so sánh cái gì với cái gì?',
        dap: 'So VÙNG CHỜ (thứ đã git add) với COMMIT GẦN NHẤT — trả lời câu "nếu tôi commit ngay bây giờ, cái gì sẽ được chốt?"',
      },
      {
        hoi: 'File bị sửa, add, rồi sửa tiếp (chưa add lại) — git diff --staged thấy phần nào?',
        dap: 'Chỉ thấy phần ĐÃ ADD, không thấy phần sửa thêm sau đó. Muốn thấy phần chưa add thì dùng git diff (không --staged).',
      },
    ],
  },
  {
    id: 'git-u2-l3',
    unitId: 'git-u2',
    language: 'git',
    title: 'Đọc lại lịch sử — git log đầy đủ và git log --oneline',
    hook: 'Bạn quay lại một dự án cũ, không nhớ ai đã làm gì lúc nào. git log là cỗ máy thời gian: nó kể lại toàn bộ chuyện đã xảy ra, theo đúng thứ tự.',
    theory:
      'git log liệt kê lịch sử commit, MỚI NHẤT ở trên cùng. Hai cách đọc:\n\n    git log              # đầy đủ: mã commit, nhánh, lời nhắn — dài, dùng khi cần đọc kỹ\n    git log --oneline    # gọn: mỗi commit một dòng — dùng để LƯỚT nhanh\n\ngit log --oneline là lệnh bạn gõ NHIỀU NHẤT trong ngày làm việc — nó trả lời "gần đây mình đã làm những gì" chỉ trong một cái nhìn.\n\nVÌ SAO LỜI NHẮN COMMIT QUAN TRỌNG (nhắc lại, giờ bạn đã thấy tác dụng thật): git log --oneline chỉ hiện được LỜI NHẮN, không hiện nội dung file. Lời nhắn mơ hồ như "sua loi" hay "update" thì log --oneline của bạn sẽ là một cột chữ "sua loi / update / fix / sua tiep" vô nghĩa — không ai (kể cả bạn 3 tháng sau) đoán được commit nào làm gì mà không mở từng cái ra xem.\n\nQuy ước lời nhắn tốt, viết như RA LỆNH: "Sua loi tinh sai tien khi mua tren 100k" — nói CÁI GÌ đổi. So với "sua loi" — không nói gì cả.',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "Them file dau tien"
echo "b" > b.txt
git add .
git commit -m "Them file thu hai"
git log --oneline
git log`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "commit mot"
echo "b" > b.txt
git add .
git commit -m "commit hai"
git log --oneline`,
      question: 'Dòng ĐẦU TIÊN trong output của git log --oneline là gì?',
      choices: ['c2 commit hai', 'c1 commit mot', 'commit c2', 'Nhanh: main'],
      answerIndex: 0,
      explain:
        'git log (và log --oneline) luôn liệt kê MỚI NHẤT TRƯỚC — đúng thứ tự người đọc muốn thấy: "gần đây có gì mới" nằm ngay đầu, không phải cuộn xuống cuối mới thấy.',
    },
    parsons: {
      prompt: 'Xếp thứ tự: làm hai commit rồi lướt nhanh lịch sử bằng bản gọn.',
      lines: [
        'echo "tra da 5000" > gia.txt',
        'git add gia.txt',
        'git commit -m "Them bang gia"',
        'echo "giam 10 phan tram" > khuyen_mai.txt',
        'git add khuyen_mai.txt',
        'git commit -m "Them khuyen mai"',
        'git log --oneline',
      ],
    },
    make: {
      prompt:
        'Kho của bạn TRẮNG (chưa init). Gõ các lệnh để:\n1. Khởi tạo kho.\n2. Tạo file mon1.txt nội dung: pho bo 45000, commit lời nhắn: Them mon pho bo\n3. Tạo file mon2.txt nội dung: bun cha 40000, commit lời nhắn: Them mon bun cha\n4. Xem lịch sử dạng gọn.\n5. Xem lịch sử dạng đầy đủ.',
      starterCode: `# 1. init\n\n# 2. mon1.txt + commit\n\n# 3. mon2.txt + commit\n\n# 4. log --oneline\n\n# 5. log day du\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'c2 Them mon bun cha\nc1 Them mon pho bo',
          match: 'contains',
          hidden: false,
          label: 'log --oneline: mới nhất (c2) hiện TRƯỚC',
        },
        {
          stdinLines: [],
          expected: 'commit c2\nNhanh: main',
          match: 'contains',
          hidden: false,
          label: 'log đầy đủ có mã commit và tên nhánh',
        },
        {
          stdinLines: [],
          expected: 'Them mon bun cha',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: log đầy đủ có lời nhắn commit gần nhất',
        },
      ],
      hints: [
        'Đủ 5 bước theo đúng thứ tự đề bài — mỗi món một commit RIÊNG, không gộp chung.',
        'Tạo file: echo "pho bo 45000" > mon1.txt rồi git add mon1.txt && git commit -m "Them mon pho bo".',
        'Xem lịch sử hai kiểu: git log --oneline (gọn) rồi git log (đầy đủ) — gõ cả hai, không chỉ một.',
      ],
      sampleSolution: `git init
echo "pho bo 45000" > mon1.txt
git add mon1.txt
git commit -m "Them mon pho bo"
echo "bun cha 40000" > mon2.txt
git add mon2.txt
git commit -m "Them mon bun cha"
git log --oneline
git log`,
    },
    homework:
      'Về nhà: mở một repo GitHub cũ của bạn (hoặc của ai đó nổi tiếng, ví dụ một thư viện mã nguồn mở quen thuộc), đọc git log --oneline hoặc tab "Commits" trên GitHub. Xem có bao nhiêu lời nhắn commit bạn đọc mà KHÔNG hiểu commit đó làm gì nếu không mở nó ra.',
    srsCards: [
      {
        hoi: 'git log và git log --oneline khác nhau ở chỗ nào?',
        dap: 'git log liệt kê ĐẦY ĐỦ (mã commit, nhánh, lời nhắn); git log --oneline gọn, mỗi commit một dòng — dùng để lướt nhanh, là lệnh gõ nhiều nhất trong ngày.',
      },
      {
        hoi: 'Trong git log, commit nào luôn hiện trước?',
        dap: 'Commit MỚI NHẤT luôn hiện ở trên cùng — đúng thứ tự người đọc cần: "gần đây có gì mới" thấy ngay không phải cuộn.',
      },
      {
        hoi: 'Vì sao lời nhắn commit mơ hồ ("sua loi") lại có hại về sau?',
        dap: 'git log --oneline chỉ hiện lời nhắn, không hiện nội dung file — nhiều commit đều ghi "sua loi" thì không ai (kể cả chính bạn) phân biệt được commit nào làm gì mà không mở từng cái ra xem.',
      },
    ],
  },
]
