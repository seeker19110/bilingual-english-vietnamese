# Đặc tả: Khoá học THỰC HÀNH Git & GitHub (môn Lập trình)

> Ngày 2026-08-30 · Khuôn: `docs/templates/dac-ta-tinh-nang.md`
> Nền: `docs/research/dac-ta-mon-lap-trinh-2026-08-24.md` (khuôn bài 8 bước) ·
> `packages/subject-programming/gitSim.ts` (terminal giả lập, PR-L9).

## 0. Một câu

Nâng Git/GitHub từ **2 bài lẻ** trong `p3-u10` thành **khoá thực hành 16 bài / 3 unit**, trải
suốt P3→P5, mỗi bài học viên **gõ lệnh thật** trong terminal giả lập và được chấm bằng **trạng
thái repo cuối cùng**.

## Hiện trạng (đo thật, không đoán)

| Thứ                | Số thật hôm nay                                                                  |
| ------------------ | -------------------------------------------------------------------------------- |
| Bài Git đang có    | 2 (`p3-u10-l1` commit cơ bản, `p3-u10-l2` nhánh & gộp)                           |
| Lệnh `gitSim` chạy | `init · status · add · commit · log · branch · switch/checkout · merge` (8 lệnh) |
| Lệnh bị chặn thẳng | `GIT_CHUA_MO_PHONG` — rebase, stash, cherry-pick… báo "chưa mô phỏng"            |
| Không có mạng      | `push/pull/clone/remote` **chưa tồn tại**, kể cả dạng diễn tả                    |

Bản đồ lệnh người dùng đưa có ~80 lệnh / 11 nhóm. Khoá này phủ **7 nhóm cốt lõi**; 4 nhóm còn
lại xử lý ở ô "KHÔNG LÀM".

## ① Phạm vi

**LÀM:**

- Mở rộng `gitSim.ts` thêm **3 tầng khái niệm mới**:
  1. **Hoàn tác** — `git diff`, `git diff --staged`, `git restore <file>`, `git restore --staged`,
     `git reset --soft|--mixed|--hard`, `git revert <commit>`.
  2. **Kho từ xa GIẢ LẬP** — một biến `remote` trong bộ nhớ (không có mạng thật):
     `git remote add/-v`, `git push -u origin <nhánh>`, `git fetch`, `git pull`, `git clone`.
     Có mô phỏng **người khác đã push trước** để dựng ca `pull` và ca **xung đột** thật.
  3. **Nâng cao** — `git stash push/list/pop/apply/drop`, `git tag -a`, `git cherry-pick`,
     `git reflog`, `git rebase <nhánh>` (chỉ ca tuyến tính, không interactive).
- Thêm **14 bài** theo đúng khuôn 8 bước (`LessonSchema`), phân bố:

  | Unit                              | Bài | Nội dung (theo nhóm trong bản đồ lệnh)                                                                                                                                                                                                      |
  | --------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `p3-u10` Git & GitHub (2 → 6 bài) | +4  | l3 Xem & so sánh (`status/diff/log --oneline/--graph/show/blame`) · l4 **Hoàn tác an toàn** (`restore/revert`) · l5 Hoàn tác nguy hiểm (`reset` 3 mức, kèm luật "chỉ dùng khi chưa push") · l6 `.gitignore` + README + commit message tử tế |
  | `p4-u13` Cộng tác GitHub (mới, 6) | 6   | l1 remote & push đầu tiên · l2 fetch/pull, hiểu `origin/main` · l3 **Pull Request & review** · l4 **Giải xung đột** (bài lõi) · l5 nhánh theo tính năng, `push --force-with-lease` vs `--force` · l6 Dự án nhỏ: đưa dự án trục lên GitHub   |
  | `p5-u10` Git nâng cao (mới, 4)    | 4   | l1 `stash` khi bị cắt ngang · l2 `rebase` vs `merge` — chọn cái nào · l3 `cherry-pick` + `tag`/release · l4 **Cứu hộ**: `reflog`, `bisect` (dạng kể chuyện), `git gc`                                                                       |

- Ba unit mới chèn **trước** unit milestone của bậc trong mảng `units` (thứ tự hiển thị theo vị
  trí mảng), giữ id đánh số tiếp (`p4-u13`, `p5-u10`) vì **id là khoá tiến độ Postgres**.
- Test cổng: mở rộng `lessonsGit.test.ts` — mỗi bài Make phải chạy `sampleSolution` qua `gitSim`
  và **đạt hết test-case** (giống cổng `lessonsPython.test.ts`).

**KHÔNG LÀM (quan trọng ngang trên):**

- **KHÔNG gọi git thật, KHÔNG gọi API GitHub, KHÔNG mạng.** Sandbox học tập chạy trong trình
  duyệt; và CI tuyệt đối không được đụng repo thật.
- **KHÔNG** mô phỏng: `bisect` chạy được (chỉ kể chuyện + Predict), `worktree`, `submodule`,
  `git lfs`, `mergetool`, `rebase -i`, `archive`, `fsck`. Lý do: chi phí mô phỏng lớn hơn giá trị
  dạy học ở bậc này. Bài học **nói thẳng** là mô phỏng không làm được, không giả vờ làm được —
  đúng luật đã ghi ở đầu `gitSim.ts`.
- **KHÔNG** đổi id/hai bài `p3-u10-l1`, `p3-u10-l2` đang có, **KHÔNG** đánh số lại unit cũ.
- **KHÔNG** đụng `apps/dhcb` (giao diện) — 3 unit mới dùng lại đúng runner `git` đã có.

## ② Điểm chạm

| Việc | Đường dẫn                                                     | Ghi chú                                        |
| ---- | ------------------------------------------------------------- | ---------------------------------------------- |
| Sửa  | `packages/subject-programming/gitSim.ts`                      | +3 tầng lệnh; giữ nguyên 8 lệnh cũ             |
| Sửa  | `packages/subject-programming/curriculum.ts`                  | chèn `p4-u13`, `p5-u10` trước unit milestone   |
| Sửa  | `packages/subject-programming/lessons.ts`                     | +3 dòng import, +3 phần tử mảng                |
| Thêm | `lessons/p3u10b.ts` · `lessons/p4u13.ts` · `lessons/p5u10.ts` | 4 + 6 + 4 bài                                  |
| Sửa  | `packages/subject-programming/lessonsGit.test.ts`             | cổng chấm cho 14 bài mới                       |
| Thêm | `packages/subject-programming/gitSim.test.ts`                 | test đơn vị cho lệnh mới (hiện gitSim chưa có) |

**Ảnh hưởng lan ra:** `gitSim.ts` là điểm nóng — mọi bài `language: 'git'` phụ thuộc nó. Bắt
buộc chạy `npm run codemap -- impact packages/subject-programming/gitSim.ts` trước khi sửa.

## ③ Hợp đồng dữ liệu

Không đổi hợp đồng công khai. `gitSim` giữ nguyên `GitRunResult { output, error? }`; trạng thái
kho từ xa là **nội bộ** `RepoState`:

```ts
interface RemoteState {
  /** Tên → nhánh → id commit; 'origin' là tên duy nhất bài học dùng. */
  nhanh: Record<string, string | null>
  /** Commit của "người khác" đã có sẵn trên remote — dựng ca pull/xung đột, khai tất định. */
  commits: Commit[]
  url: string
}
```

**Ca lỗi (là một phần hợp đồng):**

| Tình huống                                 | Hành vi mong đợi                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `git push` khi chưa `remote add`           | Lỗi tiếng Việt gợi đúng lệnh kế tiếp, KHÔNG stack trace                        |
| `git pull` gây xung đột                    | File có dấu `<<<<<<< HEAD`, repo vào trạng thái "đang gộp" — đúng như git thật |
| `git reset --hard` khi có việc chưa commit | Vẫn thực hiện (đúng git thật) **và** bài học cảnh báo trước ở bước ②           |
| Lệnh nằm ngoài phạm vi mô phỏng            | Nói rõ "mô phỏng không làm việc này" + chỉ chỗ đọc thêm, không im lặng bỏ qua  |

## ④ Tiêu chí chấp nhận

- [ ] `npm test -- subject-programming` xanh; **mọi `sampleSolution` của 14 bài mới chạy qua
      `gitSim` đạt 100% test-case** (cổng trong `lessonsGit.test.ts`).
- [ ] `gitSim.test.ts` phủ **từng lệnh mới**, gồm ca lỗi ở bảng ③.
- [ ] Chạy cùng chuỗi lệnh hai lần cho **output byte-identical** (bất biến tất định).
- [ ] `LessonSchema` (`lessons.test.ts`) + cổng thẻ SRS (`srsCards.test.ts`) xanh cho bài mới.
- [ ] `curriculum.test.ts` xanh: mỗi `unitId` của bài đều tồn tại trong khung.
- [ ] `npm run eval:code-feedback` **không phát sinh ca vi phạm mới** (bài Git đi qua prompt
      phản hồi của môn).
- [ ] Coverage branches **không tụt dưới sàn 90** — biên hiện chỉ dư 0,56 điểm (`npm run budget`).

**Lệnh chứng minh:**

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run eval:code-feedback
npm run budget
```

## ⑤ Bất biến không được phá

| Bất biến                                                           | Test canh                                 |
| ------------------------------------------------------------------ | ----------------------------------------- |
| `gitSim` **tất định tuyệt đối** — không `Date.now()`, không random | `gitSim.test.ts` (chạy 2 lượt)            |
| Không I/O, không mạng, không đụng đĩa                              | `packages/` không import `apps/` (ESLint) |
| Id bài/unit cũ không đổi (khoá tiến độ Postgres)                   | `curriculum.test.ts`                      |
| Bài Make chấm bằng **trạng thái repo**, không so chuỗi output thô  | `lessonsGit.test.ts`                      |
| Phản hồi AI không lộ lời giải, luôn tiếng Việt                     | `npm run eval:code-feedback`              |

## ⑥ Quy ước dự án phải theo

Comment tiếng Việt · import xuyên gói `@dhcb/...` không đuôi `.js`, nội bộ gói tương đối **có**
`.js` · conventional commits, scope **chữ thường** (`feat(programming): ...`) · mỗi bài đủ 8
bước + 2–4 thẻ SRS · terminal giả lập **xuất không dấu** (đúng như file hiện tại).

## Nghiệm thu — đề nghị chia 3 PR

| PR  | Nội dung                                  | Vì sao tách                                                |
| --- | ----------------------------------------- | ---------------------------------------------------------- |
| 1   | `gitSim` + `gitSim.test.ts` (3 tầng lệnh) | Hạ tầng; review được độc lập với nội dung, rủi ro cao nhất |
| 2   | `p3-u10` +4 bài (hoàn tác, xem lịch sử)   | Nội dung, chỉ cần tầng lệnh của PR 1                       |
| 3   | `p4-u13` + `p5-u10` (10 bài) + curriculum | Hai unit mới, đụng khung giáo trình                        |
