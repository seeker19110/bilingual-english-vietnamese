// lessons/gitu5.ts — Chương C5 "Nâng cao" của khoá Git & GitHub thực hành (PR 4/4 khoá Git).
// unitId 'git-u5' — quy ước "unit ảo", xem ghi chú đầu gitu2.ts. Chương đóng khoá Git.
//
// Ba bài: stash (cắt ngang việc đang làm dở) · rebase vs merge (chọn cái nào, không phải
// "rebase luôn tốt hơn") · cherry-pick + tag (mang một commit cụ thể sang nhánh khác, đánh
// dấu bản phát hành). rebase trong bài này CHỈ ca tuyến tính — đúng giới hạn đã ghi ở
// gitSim.ts (không rebase -i, không ca phức tạp cần giải xung đột giữa chừng).
import type { ProgrammingLesson } from '../lessonTypes.js'

export const GIT_U5_LESSONS: ProgrammingLesson[] = [
  {
    id: 'git-u5-l1',
    unitId: 'git-u5',
    language: 'git',
    title: 'git stash — cất việc đang làm dở khi bị cắt ngang',
    hook: 'Bạn đang sửa dở một tính năng, sếp bảo "sửa gấp lỗi kia trước đã". Code dang dở chưa muốn commit (chưa xong, không đáng một commit), nhưng cũng không thể bỏ đó chuyển nhánh — file sẽ theo bạn sang nhánh mới, lẫn lộn hết.',
    theory:
      'git stash CẤT thay đổi hiện tại (cả thư mục làm việc lẫn vùng chờ) vào một ngăn tạm, rồi trả thư mục làm việc về sạch như vừa commit — bạn RẢNH TAY để chuyển việc khác.\n\n    git stash push -m "dang lam tinh nang X"   # cất lại, có ghi chú để nhớ\n    git stash list                              # xem có bao nhiêu mục đang cất\n    git stash pop                               # lấy lại mục MỚI NHẤT và XOÁ khỏi ngăn\n    git stash apply                             # lấy lại mục mới nhất nhưng VẪN GIỮ trong ngăn\n    git stash drop                               # xoá mục mới nhất mà không lấy lại\n\nĐánh số ngăn: stash@{0} luôn là mục MỚI NHẤT, stash@{1} là mục cũ hơn kế tiếp — giống ngăn xếp (stack), cất sau lấy trước.\n\npop vs apply: pop thường dùng hơn (lấy về rồi dọn luôn ngăn tạm). apply hữu ích khi bạn muốn áp cùng một mục cất vào NHIỀU nhánh khác nhau — cất một lần, apply nhiều lần, drop khi thật sự xong.\n\nQUY TRÌNH THỰC TẾ: đang sửa dở → git stash push -m "..." → làm việc gấp (switch nhánh, sửa, commit, push) → quay lại nhánh cũ → git stash pop → tiếp tục đúng chỗ đang dở.',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
echo "dang do dang" > b.txt
git stash push -m "dang lam tinh nang moi"
git status
git stash list
git stash pop
git status`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
echo "dang do dang" > b.txt
git stash push -m "dang lam tinh nang moi"
git status`,
      question: 'Ngay SAU git stash push, git status hiện gì?',
      choices: [
        'Khong co gi de commit, thu muc lam viec sach',
        'File chua duoc theo doi (can git add): b.txt',
        'Thay doi da chuan bi de commit: moi/sua: b.txt',
        'Báo lỗi vì b.txt chưa từng được add',
      ],
      answerIndex: 0,
      explain:
        'stash push CẤT thay đổi (cả b.txt) vào ngăn tạm rồi TRẢ thư mục làm việc về đúng trạng thái commit gần nhất — sạch sẽ, như thể bạn chưa hề tạo b.txt. Thứ vừa làm dở không mất, chỉ đang nằm trong ngăn stash chờ lấy lại.',
    },
    parsons: {
      prompt: 'Xếp thứ tự: đang làm dở, bị cắt ngang, cất lại rồi lấy về sau khi xong việc gấp.',
      lines: [
        'echo "dang do dang" > b.txt',
        'git stash push -m "dang lam tinh nang moi"',
        'git status',
        'git stash pop',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit. Gõ lệnh mô phỏng bị cắt ngang giữa chừng:\n1. Tạo file dang_lam.txt nội dung: 50 phan tram xong\n2. Cất lại với ghi chú: dang viet trang lien he\n3. Kiểm tra git status — phải sạch (chứng minh đã cất thành công).\n4. Xem git stash list — phải thấy đúng một mục.\n5. Lấy lại bằng git stash pop.\n6. Kiểm tra git status lần nữa — phải thấy dang_lam.txt trở lại.',
      starterCode: `# Kho da co san 1 commit\n# 1. tao file dang lam do\n\n# 2. stash push\n\n# 3. kiem tra sach\n\n# 4. stash list\n\n# 5. stash pop\n\n# 6. kiem tra lai\n`,
      testCases: [
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'thu muc lam viec sach',
          match: 'contains',
          hidden: false,
          label: 'Sau khi stash, thư mục sạch (đã cất thành công)',
        },
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'stash@{0}: dang viet trang lien he',
          match: 'contains',
          hidden: false,
          label: 'stash list thấy đúng ghi chú',
        },
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'File chua duoc theo doi (can git add):\n  dang_lam.txt',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sau pop, dang_lam.txt trở lại đúng trong git status',
        },
      ],
      hints: [
        'Tạo file trước: echo "50 phan tram xong" > dang_lam.txt.',
        'Cất lại có ghi chú: git stash push -m "dang viet trang lien he".',
        'Lấy lại: git stash pop, rồi git status lần nữa để kiểm chứng.',
      ],
      sampleSolution: `echo "50 phan tram xong" > dang_lam.txt
git stash push -m "dang viet trang lien he"
git status
git stash list
git stash pop
git status`,
    },
    homework:
      'Về nhà: lần tới khi đang sửa dở một thứ trên repo thật mà cần chuyển nhánh gấp, dùng git stash thay vì commit tạm với lời nhắn "wip" hay "tam thoi" — thói quen commit rác kiểu đó làm bẩn lịch sử, còn stash thì không để lại dấu vết nào trong log.',
    srsCards: [
      {
        hoi: 'git stash push làm gì với thư mục làm việc?',
        dap: 'Cất thay đổi hiện tại vào ngăn tạm, rồi trả thư mục làm việc về đúng trạng thái commit gần nhất — sạch sẽ, rảnh tay chuyển việc khác.',
      },
      {
        hoi: 'git stash pop khác git stash apply ở chỗ nào?',
        dap: 'pop lấy lại mục mới nhất VÀ XOÁ khỏi ngăn (dùng phổ biến nhất). apply lấy lại nhưng VẪN GIỮ trong ngăn — hữu ích khi muốn áp cùng một mục vào nhiều nhánh.',
      },
    ],
  },
  {
    id: 'git-u5-l2',
    unitId: 'git-u5',
    language: 'git',
    title: 'Rebase vs merge — chọn cái nào, không phải cái nào "tốt hơn"',
    hook: 'Nhánh của bạn đứng yên một tuần trong khi main đã đi xa. Có hai cách để "bắt kịp": gộp (merge) hoặc viết lại lịch sử của bạn lên trên (rebase). Chọn sai không sai kỹ thuật — chỉ là khó đọc lại sau này.',
    theory:
      'git merge (đã học ở khoá Nền móng) TẠO một commit gộp mới có HAI CHA, giữ nguyên lịch sử THẬT đã xảy ra — nhánh nào rẽ khi nào, ai gộp vào ai lúc nào đều còn dấu vết.\n\ngit rebase main (đứng ở nhánh phụ) làm khác hẳn: nó LẤY từng commit của bạn, tạo lại chúng THÀNH COMMIT MỚI, đặt CHỒNG LÊN đầu main — như thể bạn bắt đầu làm nhánh phụ từ SAU khi main đã có mọi thứ mới nhất. Kết quả: lịch sử THẲNG MỘT ĐƯỜNG (linear), không có commit gộp rẽ nhánh.\n\nCHÚ Ý QUAN TRỌNG: rebase TẠO COMMIT MỚI (mã commit đổi hoàn toàn) — commit cũ vẫn còn đó (reflog thấy được) nhưng nhánh của bạn giờ trỏ tới bản MỚI. Nếu nhánh này ĐÃ PUSH lên GitHub và có người khác đang dùng chung, rebase làm lịch sử của bạn và của họ "lệch pha" — đây là lý do có quy tắc:\n\n    CHƯA push lên đâu, hoặc nhánh CHỈ MÌNH BẠN DÙNG → rebase thoải mái, lịch sử sạch đẹp hơn.\n    ĐÃ push và CÓ NGƯỜI KHÁC đang dựa vào nhánh đó → merge (an toàn), hoặc rebase xong phải push --force-with-lease VÀ báo trước cho mọi người.\n\nKHÔNG CÓ CÁI NÀO "ĐÚNG HƠN" TUYỆT ĐỐI — merge trung thực về lịch sử nhưng rối hơn khi đọc; rebase gọn đẹp nhưng "viết lại" quá khứ. Nhiều đội chọn: rebase nhánh riêng cho gọn TRƯỚC KHI mở Pull Request, rồi merge (không rebase) khi gộp PR vào main.',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git switch -c tinh-nang
echo "b" > b.txt
git add .
git commit -m "c2 tren tinh nang"
git switch main
echo "c" > c.txt
git add .
git commit -m "c3 tren main"
git switch tinh-nang
git rebase main
git log --oneline`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git switch -c tinh-nang
echo "b" > b.txt
git add .
git commit -m "c2 tren tinh nang"
git switch main
echo "c" > c.txt
git add .
git commit -m "c3 tren main"
git switch tinh-nang
git rebase main
git log --oneline`,
      question: 'Sau git rebase main, dòng ĐẦU TIÊN (mới nhất) trong git log --oneline là gì?',
      choices: ['c2 tren tinh nang', 'c3 tren main', 'c1', 'Gop nhanh tinh-nang vao main'],
      answerIndex: 0,
      explain:
        'rebase KHÔNG tạo commit gộp hai cha như merge — nó lấy commit của tinh-nang (lời nhắn "c2 tren tinh nang" được GIỮ NGUYÊN), tạo lại thành commit MỚI đặt chồng lên đầu main. Vì vậy nó vẫn đứng TRÊN CÙNG (mới nhất), nhưng giờ nằm sau commit của main trong một đường lịch sử THẲNG, không rẽ nhánh.',
    },
    parsons: {
      prompt:
        'Xếp thứ tự: tách nhánh, cả hai bên cùng có commit mới, rồi rebase nhánh phụ lên đầu main.',
      lines: [
        'git switch -c tinh-nang',
        'echo "b" > b.txt',
        'git add .',
        'git commit -m "them b"',
        'git switch main',
        'echo "c" > c.txt',
        'git add .',
        'git commit -m "them c tren main"',
        'git switch tinh-nang',
        'git rebase main',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit trên main. Gõ lệnh để dựng đúng tình huống "main đã đi xa trong lúc bạn làm nhánh phụ", rồi bắt kịp bằng rebase:\n1. Tạo nhánh phu-them-tinh-nang và nhảy sang.\n2. Tạo file tinh_nang.txt = "dang lam", commit lời nhắn: Them tinh nang\n3. Quay về main, tạo file khac.txt = "viec khac tren main", commit lời nhắn: Viec khac tren main\n4. Quay lại nhánh phụ, rebase lên main.\n5. Xem log --oneline để thấy lịch sử đã THẲNG MỘT ĐƯỜNG.',
      starterCode: `# Kho da co 1 commit tren main\n# 1. tao nhanh phu\n\n# 2. commit tren nhanh phu\n\n# 3. quay ve main, commit rieng\n\n# 4. rebase\n\n# 5. xem lai lich su\n`,
      testCases: [
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'Da rebase 1 commit len tren "main"',
          match: 'contains',
          hidden: false,
          label: 'rebase báo đúng đã đưa 1 commit lên trên main',
        },
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'c4 Them tinh nang\nc3 Viec khac tren main\nc1 c1',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: sau rebase, lịch sử THẲNG một đường, commit của nhánh phụ nằm trên cùng',
        },
      ],
      hints: [
        'Tạo nhánh phụ và commit trên đó trước: git switch -c phu-them-tinh-nang, rồi echo … > tinh_nang.txt, add, commit.',
        'Quay về main làm việc khác: git switch main, rồi echo … > khac.txt, add, commit — đây là bước làm main "đi xa hơn" trong lúc bạn làm nhánh phụ.',
        'Quay lại nhánh phụ rồi rebase: git switch phu-them-tinh-nang, git rebase main, cuối cùng git log --oneline.',
      ],
      sampleSolution: `git switch -c phu-them-tinh-nang
echo "dang lam" > tinh_nang.txt
git add tinh_nang.txt
git commit -m "Them tinh nang"
git switch main
echo "viec khac tren main" > khac.txt
git add khac.txt
git commit -m "Viec khac tren main"
git switch phu-them-tinh-nang
git rebase main
git log --oneline`,
    },
    homework:
      'Về nhà: đọc thêm về "interactive rebase" (git rebase -i) — mô phỏng của khoá này KHÔNG làm được ca này (nằm ngoài phạm vi bài học), nhưng nó là công cụ mạnh để GỘP/SỬA/SẮP XẾP LẠI nhiều commit trước khi đẩy lên, rất phổ biến trong công việc thật.',
    srsCards: [
      {
        hoi: 'rebase khác merge ở chỗ nào — commit gộp hai cha hay lịch sử thẳng?',
        dap: 'merge tạo commit gộp có HAI CHA, giữ lịch sử THẬT (rẽ nhánh rồi gộp). rebase tạo lại commit của bạn thành MỚI, đặt chồng lên main — kết quả lịch sử THẲNG một đường, không rẽ nhánh.',
      },
      {
        hoi: 'Khi nào KHÔNG nên rebase một nhánh?',
        dap: 'Khi nhánh ĐÃ PUSH lên và CÓ NGƯỜI KHÁC đang dùng chung — rebase tạo commit mới làm lịch sử của bạn và của họ lệch pha. Lúc đó nên merge, hoặc rebase xong phải push --force-with-lease và báo trước cho mọi người.',
      },
    ],
  },
  {
    id: 'git-u5-l3',
    unitId: 'git-u5',
    language: 'git',
    title: 'cherry-pick và tag — mang một commit sang nhánh khác, đánh dấu bản phát hành',
    hook: 'Bạn vừa sửa một lỗi khẩn cấp trên nhánh hotfix. Nhánh main cũng cần đúng bản sửa đó NGAY — nhưng chưa muốn gộp TOÀN BỘ hotfix vào main, chỉ cần đúng MỘT commit đó thôi.',
    theory:
      'GIT CHERRY-PICK — mang đúng MỘT COMMIT CỤ THỂ từ nhánh này sang nhánh khác, không kéo theo gì khác:\n\n    git cherry-pick <ma_commit>\n\nKhác merge (gộp TOÀN BỘ lịch sử một nhánh) — cherry-pick CHỌN LỌC đúng một commit, tạo ra một COMMIT MỚI (mã commit khác bản gốc) chứa đúng thay đổi đó, gắn vào nhánh hiện tại. Dùng khi: sửa lỗi khẩn cấp cần có mặt ở NHIỀU nhánh, hoặc chỉ muốn đúng MỘT phần việc từ nhánh khác mà không kéo theo phần còn lại.\n\nGIT TAG — đánh dấu VĨNH VIỄN một commit cụ thể, thường dùng cho các BẢN PHÁT HÀNH (release):\n\n    git tag -a v1.0 -m "Ban phat hanh dau tien"    # tag CÓ CHÚ THÍCH (nên dùng dạng này)\n    git tag                                          # liệt kê tag đã có\n\nKhác nhánh (branch) — nhánh là con trỏ DI ĐỘNG (mỗi commit mới nó tự dời theo), còn tag là NHÃN CỐ ĐỊNH gắn vào ĐÚNG một commit, không bao giờ tự dời. Quy ước phiên bản phổ biến: v1.0, v1.1, v2.0 (semantic versioning) — người dùng dựa vào tag để biết chính xác "bản nào tôi đang chạy".',
    workedExample: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git switch -c hotfix
echo "fix" > fix.txt
git add .
git commit -m "Sua loi khan cap"
git switch main
git cherry-pick c2
git tag -a v1.0 -m "Ban phat hanh dau tien"
git tag`,
      stdinLines: [],
    },
    predict: {
      code: `git init
echo "a" > a.txt
git add .
git commit -m "c1"
git switch -c hotfix
echo "fix" > fix.txt
git add .
git commit -m "Sua loi khan cap"
git switch main
git cherry-pick c2
git log --oneline`,
      question:
        'Sau git cherry-pick c2 (đứng ở main), dòng ĐẦU TIÊN của git log --oneline trên main là gì?',
      choices: ['c3 Sua loi khan cap', 'c2 Sua loi khan cap', 'c1 c1', 'Gop nhanh hotfix vao main'],
      answerIndex: 0,
      explain:
        'cherry-pick lấy NỘI DUNG thay đổi từ commit gốc (c2, lời nhắn "Sua loi khan cap" được GIỮ NGUYÊN), nhưng tạo ra một COMMIT HOÀN TOÀN MỚI (mã c3, khác hẳn c2) trên nhánh hiện tại — cùng nội dung, khác "danh tính".',
    },
    parsons: {
      prompt: 'Xếp thứ tự: sửa lỗi khẩn cấp trên nhánh riêng, rồi mang ĐÚNG commit đó sang main.',
      lines: [
        'git switch -c hotfix',
        'echo "fix" > fix.txt',
        'git add .',
        'git commit -m "Sua loi khan cap"',
        'git switch main',
        'git cherry-pick c2',
      ],
    },
    make: {
      prompt:
        'Kho của bạn đã có sẵn một commit trên main. Gõ lệnh để:\n1. Tạo nhánh hotfix, nhảy sang.\n2. Tạo file bug.txt = "da sua", commit lời nhắn: Sua loi nghiem trong\n3. Quay về main.\n4. cherry-pick đúng commit sửa lỗi đó vào main.\n5. Gắn tag phát hành: v1.0, chú thích: Ban vua sua loi',
      starterCode: `# Kho da co 1 commit tren main\n# 1. tao nhanh hotfix\n\n# 2. sua loi tren hotfix\n\n# 3. ve main\n\n# 4. cherry-pick\n\n# 5. gan tag\n`,
      testCases: [
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: '(cherry-pick tu c2',
          match: 'contains',
          hidden: false,
          label: 'cherry-pick báo rõ nguồn commit (c2) và tạo commit mới',
        },
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'Da tao tag "v1.0" tro toi',
          match: 'contains',
          hidden: false,
          label: 'Tag v1.0 được tạo thành công',
        },
        {
          stdinLines: ['git init', 'echo "a" > a.txt', 'git add .', 'git commit -m "c1"'],
          expected: 'bug.txt',
          match: 'contains',
          hidden: true,
          label: 'Ca ẩn: main giờ có luôn file bug.txt nhờ cherry-pick (kiểm bằng ls sau cùng)',
        },
      ],
      hints: [
        'Sửa lỗi trên nhánh riêng trước: git switch -c hotfix, rồi echo "da sua" > bug.txt, add, commit -m "Sua loi nghiem trong".',
        'Quay về main: git switch main. Mang commit đó sang: git cherry-pick c2 (mã commit của lần sửa lỗi vừa tạo).',
        'Gắn tag: git tag -a v1.0 -m "Ban vua sua loi". Muốn kiểm ca ẩn thì thêm ls ở cuối để thấy bug.txt đã có trên main.',
      ],
      sampleSolution: `git switch -c hotfix
echo "da sua" > bug.txt
git add bug.txt
git commit -m "Sua loi nghiem trong"
git switch main
git cherry-pick c2
git tag -a v1.0 -m "Ban vua sua loi"
ls`,
    },
    homework:
      'Về nhà: trên repo GitHub thật (hoặc một repo mã nguồn mở bạn theo dõi), vào tab "Tags" hoặc "Releases" — xem cách một dự án thật đánh dấu các phiên bản đã phát hành. Đối chiếu số hiệu (v1.0, v2.3.1…) với ngày tháng, hình dung quy mô thay đổi giữa các bản.',
    srsCards: [
      {
        hoi: 'git cherry-pick khác git merge ở điểm nào?',
        dap: 'merge gộp TOÀN BỘ lịch sử một nhánh. cherry-pick CHỌN LỌC đúng MỘT commit cụ thể, mang nội dung của nó sang nhánh khác mà không kéo theo phần còn lại.',
      },
      {
        hoi: 'Commit mới tạo ra bởi cherry-pick có cùng mã với commit gốc không?',
        dap: 'Không — cherry-pick tạo một commit HOÀN TOÀN MỚI (mã khác, cha khác), dù nội dung thay đổi giống hệt bản gốc.',
      },
      {
        hoi: 'git tag khác nhánh (branch) ở điểm nào?',
        dap: 'Nhánh là con trỏ DI ĐỘNG, tự dời theo mỗi commit mới. Tag là NHÃN CỐ ĐỊNH gắn vào đúng một commit, không bao giờ tự dời — dùng để đánh dấu các bản phát hành.',
      },
    ],
  },
]
