// lessons/p3u10.ts — Bài học P3-U10: GIT & GITHUB (PR-L9).
// Đặc tả docs/research/dac-ta-mon-lap-trinh-2026-08-24.md §4 ("Công cụ — Git: commit/branch/
// merge, GitHub, README · dự án mini: đưa mọi dự án đã làm lên GitHub").
//
// Bài 'git' chạy trên BỘ MÔ PHỎNG (gitSim.ts) chứ không phải git thật: sandbox học tập không
// có git, và cổng CI cũng không được đụng repo thật. Học viên GÕ LỆNH THẬT, thấy output như
// terminal, và bài Make chấm bằng trạng thái kho cuối cùng.
//
// LUẬT SOẠN BÀI CHO MẠCH NÀY: mô phỏng chỉ làm phần lõi (init/status/add/commit/log/branch/
// switch/merge). Thứ nó KHÔNG làm — push/pull/clone (không có mạng), xung đột thật, SHA thật
// — thì bài học phải NÓI THẲNG là mô hình không làm được và dạy bằng cách khác, tuyệt đối
// không soạn đề giả vờ như chạy được (cổng lessonsGit.test.ts có test canh điều này).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const P3U10_LESSONS: ProgrammingLesson[] = [
  {
    id: 'p3-u10-l1',
    unitId: 'p3-u10',
    language: 'git',
    title: 'Git — cỗ máy thời gian cho code của bạn',
    hook: 'Bạn sửa code cho "đẹp hơn", chạy thử, hỏng. Bản chạy được lúc nãy thì không còn. Ai làm nghề cũng từng mất một buổi tối vì chuyện này — đúng một lần, rồi họ học Git.',
    theory:
      'Git ghi lại LỊCH SỬ code của bạn: mỗi lần bạn nói "chốt bản này", nó chụp lại toàn bộ thư mục. Về sau muốn quay lại bản nào cũng được.\n\nBA NƠI code của bạn nằm — hiểu được ba nơi này là hiểu 80% Git:\n\n1. THƯ MỤC LÀM VIỆC — file bạn đang gõ dở, chưa nói gì với Git.\n2. VÙNG CHỜ (staging) — những thay đổi bạn đã CHỌN để đưa vào bản chụp tới. Lệnh: git add\n3. LỊCH SỬ — các bản chụp đã chốt vĩnh viễn. Lệnh: git commit\n\nVì sao phải có vùng chờ ở giữa, sao không chụp thẳng? Vì một buổi làm việc bạn thường sửa nhiều thứ chẳng liên quan gì nhau — sửa lỗi tính tiền, đổi màu nút, thêm ghi chú. Vùng chờ cho bạn gói chúng thành từng commit RIÊNG, mỗi commit một ý. Sau này ai đọc lịch sử cũng hiểu, và muốn bỏ riêng một thay đổi cũng được.\n\nVÒNG LẶP HẰNG NGÀY, bốn lệnh, lặp lại cả đời:\n    git status                  # tôi đang có gì? (gõ lệnh này nhiều nhất)\n    git add <file>              # chọn thứ đưa vào bản chụp (git add . = chọn tất cả)\n    git commit -m "loi nhan"    # chốt bản chụp, kèm lời nhắn nói mình vừa làm gì\n    git log --oneline           # xem lại lịch sử\n\nLỜI NHẮN COMMIT là thứ bạn viết cho CHÍNH BẠN ba tháng sau. "sua loi" thì vô dụng; "Sua loi tinh sai tien khi mua tren 100k" mới là thứ cứu bạn. Quy ước tốt: viết như ra lệnh, nói CÁI GÌ đổi và VÌ SAO.\n\nVỀ GITHUB: Git chạy trên máy bạn; GitHub là nơi trên Internet để CẤT BẢN SAO và cho người khác xem. Ba lệnh nối hai thứ đó là git clone (tải kho về), git push (đẩy commit lên), git pull (kéo commit mới về). Sandbox học tập KHÔNG có mạng nên ba lệnh này chỉ học lý thuyết — gõ vào, máy sẽ nói rõ vì sao không chạy được ở đây.\n\nCÒN README.md: file đầu tiên người lạ đọc khi mở kho của bạn trên GitHub. Nói được ba điều là đủ tử tế — dự án này làm gì, chạy nó thế nào, ai làm.',
    workedExample: {
      code: `git init
echo "Quan cua toi - web ban nuoc" > README.md
git status
git add README.md
git commit -m "Them README gioi thieu quan"
echo "print('xin chao')" > app.py
git add .
git commit -m "Them file chuong trinh dau tien"
git log --oneline`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > ghi_chu.txt
git commit -m "Luu ghi chu"`,
      question: 'Chuỗi lệnh này có tạo được commit không?',
      choices: [
        'Không — file chưa được git add nên vùng chờ rỗng',
        'Có — git commit tự lấy mọi file trong thư mục',
        'Có — nhưng commit rỗng, không chứa file nào',
        'Không — vì thiếu git status trước khi commit',
      ],
      answerIndex: 0,
      explain:
        'git commit CHỈ chốt những gì đang nằm trong vùng chờ. File mới tạo mà chưa git add thì Git coi như "chưa được theo dõi" — commit sẽ báo không có gì để chốt. Đây là lỗi số một của người mới, và cũng là lý do nên gõ git status trước khi commit cho quen tay.',
    },
    parsons: {
      prompt: 'Xếp các lệnh thành một vòng làm việc đúng: từ thư mục trắng tới commit đầu tiên.',
      lines: [
        'git init',
        'echo "Quan cua toi" > README.md',
        'git status',
        'git add README.md',
        'git commit -m "Them README"',
        'git log --oneline',
      ],
    },
    make: {
      prompt:
        'Đưa dự án cửa hàng của bạn vào Git. Gõ các lệnh (mỗi dòng một lệnh) để:\n\n1. Khởi tạo kho git.\n2. Tạo file README.md có nội dung: Quan cua toi\n3. Chốt nó thành commit đầu tiên với lời nhắn: Them README\n4. Tạo tiếp file gia.txt có nội dung: tra da 5000\n5. Chốt thành commit thứ hai với lời nhắn: Them bang gia\n6. In lịch sử dạng gọn.\n\nTạo file bằng: echo "noi dung" > ten_file\n\nHAI COMMIT RIÊNG, không gộp làm một — mỗi commit một ý là thói quen phải tập từ hôm nay.',
      starterCode: `git init\n# 1. tao README.md rồi add + commit\n\n# 2. tao gia.txt rồi add + commit\n\n# 3. xem lai lich su\n`,
      testCases: [
        {
          stdinLines: [],
          expected: 'Da khoi tao kho git rong',
          match: 'contains',
          hidden: false,
          label: 'Đã khởi tạo kho git',
        },
        {
          stdinLines: [],
          expected: '[main c1] Them README',
          match: 'contains',
          hidden: false,
          label: 'Commit đầu tiên đúng lời nhắn',
        },
        {
          stdinLines: [],
          expected: '[main c2] Them bang gia',
          match: 'contains',
          hidden: false,
          label: 'Commit thứ hai RIÊNG (không gộp chung)',
        },
        {
          stdinLines: [],
          expected: 'c2 Them bang gia\nc1 Them README',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: git log --oneline hiện đủ 2 commit, mới nhất trước',
        },
      ],
      hints: [
        'Bốn lệnh của vòng lặp hằng ngày: git init một lần lúc đầu, rồi lặp lại cặp git add <file> + git commit -m "loi nhan" cho mỗi việc.',
        'Tạo file: echo "Quan cua toi" > README.md — dấu > nghĩa là "ghi chữ bên trái vào file bên phải".',
        'Thứ tự đúng: git init → echo … > README.md → git add README.md → git commit -m "Them README" → echo … > gia.txt → git add gia.txt → git commit -m "Them bang gia" → git log --oneline.',
      ],
      sampleSolution: `git init
echo "Quan cua toi" > README.md
git add README.md
git commit -m "Them README"
echo "tra da 5000" > gia.txt
git add gia.txt
git commit -m "Them bang gia"
git log --oneline`,
    },
    homework:
      'Về nhà (làm trên máy thật, ngoài sandbox): cài Git, tạo tài khoản GitHub, rồi đưa dự án cửa hàng bạn đã làm ở chặng P3 lên đó — git init, commit, tạo repo trên GitHub và git push. Sandbox này không có mạng nên bước push phải làm ở máy thật; hướng dẫn từng bước nằm ngay trang tạo repo mới của GitHub. Có link repo rồi thì bạn đã có thứ đầu tiên để dán vào CV.',
  },
  {
    id: 'p3-u10-l2',
    unitId: 'p3-u10',
    language: 'git',
    title: 'Nhánh và gộp — thử ý tưởng mới mà không sợ hỏng bản đang chạy',
    hook: 'Quán đang chạy ổn, bạn muốn thử thêm tính năng giảm giá. Sửa thẳng vào bản đang dùng thì rủi ro; chép cả thư mục ra "cua_hang_v2_final_that" thì… bạn biết kết cục rồi đấy. Nhánh sinh ra đúng cho việc này.',
    theory:
      'NHÁNH là một dòng lịch sử song song. Bạn tách ra làm thử; bản chính không hề hấn gì. Xong xuôi và chạy tốt thì GỘP về.\n\n    git branch                      # đang có nhánh nào, mình ở đâu (dấu * là nhánh hiện tại)\n    git switch -c giam-gia          # tạo nhánh mới VÀ nhảy sang đó luôn\n    git switch main                 # quay về nhánh chính\n    git merge giam-gia              # đứng ở main, gộp nhánh giam-gia vào\n\n(Lệnh cũ hơn là git checkout -b và git checkout — bạn sẽ gặp nhiều trong tài liệu cũ, chúng làm cùng việc.)\n\nĐIỀU KHIẾN NGƯỜI MỚI HOẢNG NHẤT: đổi nhánh thì FILE TRONG THƯ MỤC ĐỔI THEO. Bạn tạo file ở nhánh giam-gia, nhảy về main, gõ ls — file "biến mất". Nó không mất: nó nằm ở nhánh kia, và sẽ trở lại khi bạn switch sang. Thư mục làm việc luôn là ảnh chụp của nhánh bạn đang đứng.\n\nHAI KIỂU GỘP, output khác nhau nên phải biết đọc:\n\n1. TUA NHANH (fast-forward): trong lúc bạn làm nhánh phụ, nhánh chính KHÔNG có commit mới nào. Git chỉ cần dời con trỏ main tới trước — không tạo commit gộp.\n2. COMMIT GỘP: cả hai nhánh đều có commit mới. Git tạo thêm một commit có HAI cha để nối hai dòng lịch sử lại.\n\nXUNG ĐỘT (conflict) là khi hai nhánh sửa CÙNG một chỗ trong CÙNG một file — Git không đoán hộ được ai đúng, nó dừng lại và bắt bạn chọn. Bộ mô phỏng của bài này KHÔNG diễn được xung đột thật (nó chỉ gộp ở mức file và sẽ nói rõ khi gặp trường hợp đó). Ngoài đời bạn sẽ thấy Git chèn vào file các dấu <<<<<<< ======= >>>>>>> đánh dấu hai phiên bản; việc của bạn là sửa file cho đúng ý, xoá mấy dấu đó, rồi git add + git commit.\n\nQUY TẮC NGHỀ: nhánh main luôn là bản CHẠY ĐƯỢC. Mọi thứ đang làm dở sống ở nhánh riêng, tên nhánh nói rõ đang làm gì (sua-loi-tinh-tien, them-trang-lien-he).',
    workedExample: {
      code: `git init
echo "gia goc" > gia.txt
git add .
git commit -m "Bang gia goc"
git switch -c giam-gia
echo "giam 10 phan tram" > khuyen_mai.txt
git add .
git commit -m "Them khuyen mai"
git switch main
ls
git merge giam-gia
ls
git log --oneline`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "commit dau"
git switch -c thu-nghiem
echo "b" > b.txt
git add .
git commit -m "them b"
git switch main
ls`,
      question: 'Lệnh ls cuối cùng (đang đứng ở nhánh main) in ra gì?',
      choices: ['a.txt', 'a.txt\nb.txt', 'b.txt', '(thu muc rong)'],
      answerIndex: 0,
      explain:
        'File b.txt được tạo và commit ở nhánh thu-nghiem. Quay về main, thư mục làm việc trở lại đúng ảnh chụp của main — nơi b.txt chưa từng tồn tại. Nó KHÔNG mất: switch sang thu-nghiem là thấy lại ngay. Đây là điều làm người mới hoảng nhất, và giờ bạn đã biết trước.',
    },
    parsons: {
      prompt: 'Xếp các lệnh: tách nhánh làm tính năng mới, rồi gộp về nhánh chính.',
      lines: [
        'git switch -c them-mon-moi',
        'echo "ca phe 20000" > mon_moi.txt',
        'git add mon_moi.txt',
        'git commit -m "Them mon ca phe"',
        'git switch main',
        'git merge them-mon-moi',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit (file gia.txt, lời nhắn "Bang gia goc") — bối cảnh đã dựng, bạn không phải tạo lại.\n\nGõ các lệnh để:\n1. Tạo nhánh mới tên khuyen-mai và nhảy sang đó.\n2. Tạo file uu_dai.txt nội dung: mua 2 tang 1\n3. Chốt commit với lời nhắn: Them uu dai\n4. Quay về nhánh main.\n5. Gộp nhánh khuyen-mai vào main.\n6. In lịch sử dạng gọn.',
      starterCode: `# Kho da co san commit "Bang gia goc" tren nhanh main\n# 1. tao nhanh khuyen-mai va nhay sang\n\n# 2. tao file uu_dai.txt roi commit\n\n# 3. ve main va gop lai\n`,
      testCases: [
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'Da chuyen sang nhanh moi "khuyen-mai"',
          match: 'contains',
          hidden: false,
          label: 'Tạo và nhảy sang nhánh khuyen-mai',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'Them uu dai',
          match: 'contains',
          hidden: false,
          label: 'Có commit "Them uu dai" trên nhánh mới',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'Tua nhanh (fast-forward)',
          match: 'contains',
          hidden: false,
          label: 'Gộp về main — main không có commit mới nên là TUA NHANH',
        },
        {
          stdinLines: [
            'git init',
            'echo "tra da 5000" > gia.txt',
            'git add .',
            'git commit -m "Bang gia goc"',
          ],
          expected: 'c2 Them uu dai\nc1 Bang gia goc',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sau khi gộp, main có đủ cả hai commit',
        },
      ],
      hints: [
        'Tạo nhánh và nhảy sang cùng lúc: git switch -c khuyen-mai (chữ c là create).',
        'Làm việc trên nhánh mới y hệt như trên main: echo … > uu_dai.txt rồi git add . và git commit -m "Them uu dai".',
        'Gộp phải đứng ở nhánh NHẬN: git switch main trước, rồi git merge khuyen-mai. Cuối cùng git log --oneline.',
      ],
      sampleSolution: `git switch -c khuyen-mai
echo "mua 2 tang 1" > uu_dai.txt
git add uu_dai.txt
git commit -m "Them uu dai"
git switch main
git merge khuyen-mai
git log --oneline`,
    },
    homework:
      'Về nhà: trên repo GitHub bạn vừa tạo ở bài trước, thử luồng làm việc thật của nghề — tạo nhánh mới, sửa một thứ nhỏ, push nhánh đó lên GitHub rồi mở một Pull Request và tự merge. Pull Request là chỗ người khác đọc và góp ý code TRƯỚC khi nó vào nhánh chính; mọi công ty phần mềm đều chạy bằng cơ chế này, và giờ bạn đã dùng qua một lần.',
  },
]
