# Đặc tả: KHOÁ RIÊNG "Git & GitHub thực hành" (môn Lập trình)

> Ngày 2026-08-30 · Khuôn: `docs/templates/dac-ta-tinh-nang.md`
> Nền: `docs/research/dac-ta-mon-lap-trinh-2026-08-24.md` (khuôn bài 8 bước) ·
> `packages/subject-programming/gitSim.ts` (terminal giả lập, PR-L9).

## 0. Một câu

Git & GitHub thành **khoá học ĐỘC LẬP** (`/lap-trinh/khoa/git`) học được mà không cần đi hết bậc
P1–P5, gồm **16 bài / 5 chương** — trong đó **2 bài đã có được DÙNG LẠI nguyên vẹn, không xoá,
không chép**.

## Vì sao tách khoá riêng (chốt 2026-08-30, người dùng yêu cầu)

Git không thuộc về một bậc nào: người mới cần nó từ tuần đầu, người đã đi làm vẫn quay lại tra
lệnh hoàn tác. Nhét vào `p3-u10` nghĩa là **phải học xong hai bậc rưỡi mới chạm tới Git** — sai
với thực tế dùng. Nên nó thành **tầng thứ ba** của môn, song song hai tầng đã có:

| Tầng                  | Cái đã có                     | Vào bằng URL                |
| --------------------- | ----------------------------- | --------------------------- |
| Xương sống P1–P6      | `curriculum.ts`               | `/lap-trinh/:levelId`       |
| Hướng chuyên sâu (13) | `specializations/registry.ts` | `/lap-trinh/huong/:specId`  |
| **Khoá ngắn (MỚI)**   | `courses/registry.ts`         | `/lap-trinh/khoa/:courseId` |

## Hiện trạng (đo thật, không đoán)

| Thứ                | Số thật hôm nay                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| Bài Git đang có    | 2 — `p3-u10-l1` (commit cơ bản), `p3-u10-l2` (nhánh & gộp)                      |
| `gitSim` chạy được | 8 lệnh: `init · status · add · commit · log · branch · switch/checkout · merge` |
| Chưa có            | hoàn tác (`diff`/`restore`/`reset`/`revert`) · kho từ xa (`remote/push/pull`)   |
| Bị chặn thẳng      | `GIT_CHUA_MO_PHONG` — rebase, stash, cherry-pick… báo "chưa mô phỏng"           |
| Test đơn vị gitSim | **KHÔNG CÓ** (`gitSim.test.ts` chưa tồn tại)                                    |
| Kiểu `lesson_id`   | `text` trong `0064_programming_schema.sql` → **không cần migration**            |

## ① Phạm vi

**LÀM:**

- **Tầng khoá ngắn** — `packages/subject-programming/courses/` (`types.ts` · `registry.ts` ·
  `git.ts`), hằng biên dịch, không I/O. Khoá = danh sách **chương**, mỗi chương là danh sách
  **id bài** (tham chiếu, không nhúng nội dung).
- **Khoá `git` 5 chương / 16 bài**, phủ 7 trong 11 nhóm của bản đồ lệnh:

  | Chương                     | Bài | Nội dung                                                                                                                                                |
  | -------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | C1 Nền móng                | 2   | **`p3-u10-l1` + `p3-u10-l2` DÙNG LẠI NGUYÊN VẸN** — repo setup, stage & commit, nhánh & gộp                                                             |
  | C2 Nhìn thấy việc mình làm | 3   | `status` + `diff` + `diff --staged` · `log --oneline/--graph` + `show` · `blame`, commit message tử tế, `.gitignore`                                    |
  | C3 Hoàn tác                | 3   | an toàn (`restore`, `restore --staged`, `revert`) · nguy hiểm (`reset` ba mức) · `reflog` cứu hộ                                                        |
  | C4 Cộng tác GitHub         | 5   | `remote` + `push -u` · `fetch`/`pull`, hiểu `origin/main` · **Pull Request & review** · **giải xung đột** (bài lõi) · `--force-with-lease` vs `--force` |
  | C5 Nâng cao                | 3   | `stash` khi bị cắt ngang · rebase vs merge chọn cái nào · `cherry-pick` + `tag -a`/release                                                              |

- **Mở rộng `gitSim.ts`** đúng ba tầng khái niệm mà các bài trên cần: ① hoàn tác ·
  ② **kho từ xa GIẢ LẬP** (biến trong bộ nhớ, có sẵn commit "của người khác" khai tất định — đây
  là thứ khiến bài `pull` và bài **xung đột** chấm được) · ③ stash/tag/cherry-pick/rebase tuyến
  tính.
- **Không gian id mới** `git-uN-lM` cho 14 bài mới (nới regex ở 3 chỗ — xem ②). Lý do không dùng
  `p3-u10-l3…`: khoá này **không thuộc bậc nào**, đánh số theo bậc là nói dối về vị trí của nó.
- Cổng chấm: mở rộng `lessonsGit.test.ts` + thêm `gitSim.test.ts` (hiện chưa có).

**KHÔNG LÀM (quan trọng ngang mục trên):**

- **KHÔNG xoá, KHÔNG sửa, KHÔNG đổi id, KHÔNG di chuyển** `p3-u10-l1` và `p3-u10-l2`. Chúng **vẫn
  nằm nguyên trong `p3-u10`** của xương sống P3 — ai đang học P3 không thấy gì thay đổi. Khoá Git
  chỉ **trỏ tới** chúng bằng id. Hệ quả cố ý: học viên làm xong ở P3 thì mở khoá Git thấy hai bài
  đầu **đã xanh sẵn** (cùng khoá tiến độ, một nguồn sự thật).
- **KHÔNG chép nội dung hai bài đó sang file mới** — chép là tạo hai bản rồi phân kỳ.
- **KHÔNG** thêm unit/bậc mới vào `curriculum.ts`. Khoá ngắn nằm ngoài khung P1–P6.
- **KHÔNG** gọi git thật, API GitHub, hay mạng. Sandbox chạy trong trình duyệt và CI tuyệt đối
  không được đụng repo thật.
- **KHÔNG** mô phỏng `bisect` (chỉ kể chuyện + Predict), `worktree`, `submodule`, `git lfs`,
  `mergetool`, `rebase -i`, `archive`, `fsck`. Bài học **nói thẳng** mô phỏng không làm được,
  không giả vờ làm được — đúng luật đã ghi ở đầu `gitSim.ts`.

## ② Điểm chạm

| Việc | Đường dẫn                                                            | Ghi chú                                         |
| ---- | -------------------------------------------------------------------- | ----------------------------------------------- |
| Thêm | `packages/subject-programming/courses/{types,registry,git}.ts`       | Tầng khoá ngắn                                  |
| Thêm | `packages/subject-programming/courses/courses.test.ts`               | Mọi id bài trong khoá phải tồn tại thật         |
| Sửa  | `packages/subject-programming/gitSim.ts`                             | +3 tầng lệnh; **giữ nguyên 8 lệnh cũ**          |
| Thêm | `packages/subject-programming/gitSim.test.ts`                        | Chưa từng có                                    |
| Thêm | `lessons/gitu2.ts … gitu5.ts`                                        | 14 bài mới                                      |
| Sửa  | `packages/subject-programming/lessons.ts`                            | +4 import, +4 phần tử mảng                      |
| Sửa  | `packages/subject-programming/lessonTypes.ts`                        | nới regex `id`/`unitId` cho không gian `git-u*` |
| Sửa  | `apps/server/src/api/subjects/programming/progress.ts`               | nới regex `lessonId` (đã có tiền lệ nhánh spec) |
| Sửa  | `apps/server/src/api/subjects/programming/feedback.ts`               | nới regex `lessonId`                            |
| Thêm | `apps/dhcb/src/pages/subjects/programming/ProgrammingCoursePage.tsx` | Trang khoá                                      |
| Sửa  | `apps/dhcb/src/App.tsx`                                              | route `/lap-trinh/khoa/:courseId`               |
| Sửa  | `apps/dhcb/src/pages/subjects/programming/ProgrammingHome.tsx`       | lối vào khoá ngắn                               |

**Ảnh hưởng lan ra:** `gitSim.ts` và `lessonTypes.ts` đều là điểm nóng. Bắt buộc chạy
`npm run codemap -- impact` cho cả hai trước khi sửa, và dán kết quả vào PR.

## ③ Hợp đồng dữ liệu

```ts
/** Một khoá ngắn — cắt ngang bậc, học được độc lập. */
export interface ShortCourse {
  /** id ổn định, cũng là URL `/lap-trinh/khoa/<id>`. */
  id: 'git'
  title: string
  /** Một câu: học xong LÀM ĐƯỢC gì (can-do), không phải "biết về". */
  canDo: string
  duration: string
  /** Cần biết trước — rỗng nghĩa là vào thẳng được. */
  prerequisites: string[]
  chapters: CourseChapter[]
}

export interface CourseChapter {
  /** `<khoá>-c<số>`, ví dụ 'git-c3'. */
  id: string
  title: string
  /** id BÀI đã tồn tại trong `lessons.ts` — tham chiếu, KHÔNG nhúng nội dung.
   *  Cố ý cho phép trộn id cũ ('p3-u10-l1') với id mới ('git-u2-l1'). */
  lessonIds: string[]
}
```

Kho từ xa giả lập là **nội bộ** `RepoState`, không lộ ra API:

```ts
interface RemoteState {
  /** nhánh → id commit; 'origin' là tên duy nhất bài học dùng. */
  nhanh: Record<string, string | null>
  /** Commit "của người khác" đã có sẵn — dựng ca pull/xung đột, khai tất định. */
  commits: Commit[]
  url: string
}
```

**Ca lỗi (là một phần hợp đồng, không phải phụ lục):**

| Tình huống                                 | Hành vi mong đợi                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `git push` khi chưa `remote add`           | Lỗi tiếng Việt gợi đúng lệnh kế tiếp, KHÔNG stack trace                       |
| `git pull` gây xung đột                    | File có dấu `<<<<<<< HEAD`, repo vào trạng thái "đang gộp" — như git thật     |
| Hoàn tác mức mạnh khi còn việc chưa commit | Vẫn thực hiện (đúng git thật) **và** bài đã cảnh báo trước ở bước ②           |
| Lệnh ngoài phạm vi mô phỏng                | Nói rõ "mô phỏng không làm việc này" + chỉ chỗ đọc thêm, không im lặng bỏ qua |
| Khoá trỏ tới id bài không tồn tại          | **CI đỏ** ở `courses.test.ts`, không phải trang trắng lúc chạy                |

## ④ Tiêu chí chấp nhận

- [ ] `courses.test.ts`: mọi `lessonIds` của khoá `git` đều `getLesson()` ra bài thật; **khẳng
      định riêng** rằng chương C1 vẫn đúng là `['p3-u10-l1', 'p3-u10-l2']`.
- [ ] Test canh **không hồi quy**: `getLessonsByUnit('p3-u10')` vẫn trả về **đúng 2 bài**, id
      không đổi — bằng chứng bài cũ không bị xoá/di chuyển.
- [ ] Mọi `sampleSolution` của 14 bài mới chạy qua `gitSim` **đạt 100% test-case**
      (`lessonsGit.test.ts`).
- [ ] `gitSim.test.ts` phủ **từng lệnh mới**, gồm đủ ca lỗi ở bảng ③.
- [ ] Chạy cùng chuỗi lệnh hai lần cho output **byte-identical** (bất biến tất định).
- [ ] Vào thẳng `/lap-trinh/khoa/git` khi **chưa học bậc nào** vẫn học được bài đầu (E2E).
- [ ] `npm run eval:code-feedback` không phát sinh ca vi phạm mới.
- [ ] Coverage branches **không tụt dưới sàn 90** — biên hiện chỉ dư 0,56 điểm.
- [ ] Ngân sách bundle: Initial JS còn dưới 140 kB (trang khoá phải `lazyWithRetry` như các trang
      programming khác).

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run eval:code-feedback
npm run budget
npm run test:e2e -- --grep "khoa/git"
```

## ⑤ Bất biến không được phá

| Bất biến                                                            | Test canh                                |
| ------------------------------------------------------------------- | ---------------------------------------- |
| **`p3-u10` vẫn có đúng 2 bài, id không đổi**                        | `courses.test.ts` (ca không hồi quy)     |
| Nội dung bài chỉ có MỘT nguồn — khoá tham chiếu bằng id, không chép | `courses.test.ts`                        |
| `gitSim` **tất định tuyệt đối** — không `Date.now()`, không random  | `gitSim.test.ts` (chạy 2 lượt)           |
| Không I/O, không mạng, không đụng đĩa                               | ESLint: `packages/` không import `apps/` |
| Khoá tiến độ đã ghi vào Postgres không bao giờ đổi nghĩa            | `progress.ts` + `courses.test.ts`        |
| Bài Make chấm bằng **trạng thái repo**, không so chuỗi output thô   | `lessonsGit.test.ts`                     |
| Phản hồi AI không lộ lời giải, luôn tiếng Việt                      | `npm run eval:code-feedback`             |

## ⑥ Quy ước dự án phải theo

Comment tiếng Việt · import xuyên gói `@dhcb/...` không đuôi `.js`, nội bộ gói tương đối **có**
`.js` · conventional commits, scope **chữ thường** (`feat(programming): ...`) · mỗi bài mới đủ 8
bước + 2–4 thẻ SRS · terminal giả lập **xuất không dấu** (đúng như file hiện tại) · a11y: nội
dung/tiêu đề AAA (≥ 7:1), phần còn lại AA, màu lấy từ token `--a-*`.

## Nghiệm thu — đề nghị chia 4 PR

| PR  | Nội dung                                          | Vì sao tách                                                       |
| --- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | `gitSim` 3 tầng lệnh + `gitSim.test.ts`           | Hạ tầng, rủi ro cao nhất; review độc lập với nội dung             |
| 2   | Tầng `courses/` + khoá `git` chỉ có C1 (2 bài cũ) | **Chứng minh việc dùng lại bài cũ chạy được** trước khi soạn thêm |
| 3   | Trang `/lap-trinh/khoa/git` + route + lối vào     | Giao diện, sau khi dữ liệu đã đứng                                |
| 4   | 14 bài mới (C2→C5), nới regex id                  | Khối nội dung lớn nhất, đi cuối                                   |
