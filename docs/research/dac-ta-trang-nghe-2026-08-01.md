# Đặc tả — Trang NGHE (`/listening`) · 2026-08-01

> Trạng thái: ĐANG TRIỂN KHAI (đợt 1). Nhánh `claude/listening-page-stories-conversations-c8jpm4`.
> Người duyệt: chủ dự án (đã chốt 3 quyết định phạm vi ngày 2026-08-01 — xem mục 2).

## 1. Mục tiêu

Một trang duy nhất gom **mọi nội dung để NGHE** của app, đường dẫn tiếng Anh `/listening`, gồm 4 mục:

| #   | Mục                                               | Nguồn dữ liệu                                      |
| --- | ------------------------------------------------- | -------------------------------------------------- |
| 1   | Câu thông dụng                                    | **Tái dùng** `/public/data/patterns/` (đã có)      |
| 2   | Các cuộc hội thoại                                | **Tái dùng** `/public/data/dialogues.json` (đã có) |
| 3   | Truyện cổ tích nổi tiếng các quốc gia (song ngữ)  | **MỚI** — `/public/data/stories/`                  |
| 4   | Truyện ngụ ngôn nổi tiếng các quốc gia (song ngữ) | **MỚI** — `/public/data/stories/`                  |

Khác biệt với trang `/phrases` và mục "Nghe" trong `/practice`: hai chỗ đó là **luyện tập có
chấm điểm** (dictation, nghe→chọn nghĩa). Trang `/listening` là **thư viện nghe** — nghe hiểu,
đọc theo, karaoke, song ngữ bật/tắt. Không nhân bản dữ liệu, không thêm bài tập chấm điểm ở đợt 1.

## 2. Quyết định phạm vi đã chốt (2026-08-01)

1. **Đợt 1 = 12 truyện** (6 cổ tích + 6 ngụ ngôn), phủ 8 quốc gia.
2. **Mục 1 & 2 tái dùng dữ liệu sẵn có**, chỉ đổi cách trình bày sang "chế độ nghe".
3. **TTS gọi theo từng câu khi cần** (`/api/tts` + cache mã hoá sẵn có), có nút "Phát cả truyện"
   phát tuần tự. KHÔNG prefetch trước lúc deploy ở đợt 1 (tránh tốn phí Google TTS trả trước).

## 3. ⚠️ Bản quyền — RÀNG BUỘC BẮT BUỘC

Đây là ràng buộc pháp lý, không phải gợi ý. Vi phạm = phải gỡ nội dung.

### 3.1 Bản tiếng Anh — CHỈ dùng public domain, TẢI THẬT, không chép từ trí nhớ

Bản dịch/bản kể tiếng Anh được phép dùng nguyên văn:

| Nguồn                                             | Người dịch/kể         | Năm  | Ghi chú |
| ------------------------------------------------- | --------------------- | ---- | ------- |
| Aesop's Fables                                    | George Fyler Townsend | 1867 | PD      |
| Aesop's Fables                                    | Joseph Jacobs         | 1894 | PD      |
| Grimm's Household Tales                           | Margaret Hunt         | 1884 | PD      |
| Andersen's Fairy Tales                            | H. P. Paull           | 1872 | PD      |
| Perrault (qua Andrew Lang, _The Blue Fairy Book_) | Andrew Lang           | 1889 | PD      |
| English Fairy Tales                               | Joseph Jacobs         | 1890 | PD      |
| The Japanese Fairy Book                           | Yei Theodora Ozaki    | 1903 | PD      |
| The Panchatantra / Indian Fairy Tales             | Joseph Jacobs         | 1892 | PD      |

**BẮT BUỘC:** văn bản tiếng Anh phải được **tải thật từ Project Gutenberg** (`gutenberg.org`)
rồi trích, **KHÔNG được gõ lại từ trí nhớ của AI** — sẽ sai chữ và vi phạm CLAUDE.md §5
(chống ảo giác). Mỗi truyện lưu kèm `source.enUrl` là URL Gutenberg đã tải.

> **🚧 CHẶN (2026-08-01):** network policy của môi trường Claude Code hiện **chặn hoàn toàn**
> `gutenberg.org`, `en.wikisource.org`, `classics.mit.edu`, `etc.usf.edu`, `sacred-texts.com`
> (CONNECT trả 403). `add_repo` cũng không gắn được kho GITenberg vì không cho thêm repo khác
> chủ sở hữu. **Chủ dự án đã chốt: mở network policy cho `gutenberg.org` rồi làm tiếp trong
> phiên mới.** Cho tới lúc đó, 9 truyện nước ngoài (mục 4) **CHƯA soạn được** — đợt 1 chỉ giao
> được 3 truyện dân gian Việt Nam (không cần nguồn ngoài).
>
> Cách mở: Claude Code trên web → cài đặt Environment của dự án → Network policy → thêm
> `gutenberg.org` (và `www.gutenberg.org`) vào danh sách cho phép. Xem
> https://code.claude.com/docs/en/claude-code-on-the-web

### 3.2 Bản tiếng Việt — Opus dịch tay

Các bản dịch tiếng Việt đang lưu hành (Lê Chu Cầu, Nguyễn Văn Hải, NXB Kim Đồng…) **VẪN CÒN
BẢN QUYỀN** — tuyệt đối không chép. Bản tiếng Việt trong app do **Opus dịch tay** từ bản PD
tiếng Anh, ghi rõ `source.vi = "Opus dịch tay 2026 từ bản public domain"`.

### 3.3 Truyện Việt Nam

Truyện dân gian Việt Nam (Tấm Cám, Ếch ngồi đáy giếng, Thầy bói xem voi…) là **văn học dân
gian, không có tác giả, thuộc phạm vi công cộng**. Bản tiếng Việt do Opus kể lại theo cốt
truyện dân gian (không chép sách giáo khoa/NXB nào), bản tiếng Anh do Opus dịch.

## 4. Danh sách 12 truyện đợt 1

### Cổ tích (`kind: "fairy-tale"`)

| id                  | Tiếng Anh               | Tiếng Việt                | Quốc gia    | Nguồn EN                  |
| ------------------- | ----------------------- | ------------------------- | ----------- | ------------------------- |
| `ft-hansel-gretel`  | Hansel and Gretel       | Hansel và Gretel          | 🇩🇪 Đức      | Grimm / Hunt 1884         |
| `ft-ugly-duckling`  | The Ugly Duckling       | Chú vịt con xấu xí        | 🇩🇰 Đan Mạch | Andersen / Paull 1872     |
| `ft-cinderella`     | Cinderella              | Cô bé Lọ Lem              | 🇫🇷 Pháp     | Perrault / Lang 1889      |
| `ft-jack-beanstalk` | Jack and the Beanstalk  | Jack và cây đậu thần      | 🇬🇧 Anh      | Jacobs 1890               |
| `ft-momotaro`       | Momotaro, the Peach Boy | Momotaro — cậu bé quả đào | 🇯🇵 Nhật Bản | Ozaki 1903                |
| `ft-tam-cam`        | Tam and Cam             | Tấm Cám                   | 🇻🇳 Việt Nam | Dân gian (Opus kể + dịch) |

### Ngụ ngôn (`kind: "fable"`)

| id                      | Tiếng Anh                      | Tiếng Việt                 | Quốc gia    | Nguồn EN                   |
| ----------------------- | ------------------------------ | -------------------------- | ----------- | -------------------------- |
| `fb-tortoise-hare`      | The Hare and the Tortoise      | Rùa và Thỏ                 | 🇬🇷 Hy Lạp   | Aesop / Townsend 1867      |
| `fb-boy-cried-wolf`     | The Shepherd Boy and the Wolf  | Cậu bé chăn cừu và con sói | 🇬🇷 Hy Lạp   | Aesop / Townsend 1867      |
| `fb-fox-grapes`         | The Fox and the Grapes         | Cáo và chùm nho            | 🇬🇷 Hy Lạp   | Aesop / Townsend 1867      |
| `fb-monkey-crocodile`   | The Monkey and the Crocodile   | Khỉ và Cá sấu              | 🇮🇳 Ấn Độ    | Panchatantra / Jacobs 1892 |
| `fb-frog-in-well`       | The Frog in the Well           | Ếch ngồi đáy giếng         | 🇻🇳 Việt Nam | Dân gian (Opus kể + dịch)  |
| `fb-blind-men-elephant` | The Blind Men and the Elephant | Thầy bói xem voi           | 🇻🇳 Việt Nam | Dân gian (Opus kể + dịch)  |

## 5. Cấu trúc dữ liệu

### 5.1 File trên đĩa

```
apps/english/src/data/stories/
  index.ts          # type + hằng số, KHÔNG chứa nội dung truyện
  loader.ts         # fetch từ /data/stories/, giống data/patterns/loader.ts
  raw/<id>.json     # NGUỒN — 12 file, mỗi truyện 1 file (do Opus soạn)
public/data/stories/
  index.json        # meta 12 truyện (không có nội dung) — sinh bằng script
  <id>.json         # nội dung đầy đủ 1 truyện — sinh bằng script
scripts/gen-stories-json.mjs   # raw/*.json → public/data/stories/*
```

Lý do tách `raw/` và `public/`: giống hệt cách `patterns` / `dialogues` đang làm — nội dung
KHÔNG được import vào bundle JS (sẽ phình bundle, vi phạm size-limit), chỉ tải bằng `fetch()`
khi người dùng mở truyện.

### 5.2 Kiểu TypeScript (chốt — worker không được đổi)

```ts
// apps/english/src/data/stories/index.ts
export type StoryKind = 'fairy-tale' | 'fable'

/** Một câu song ngữ. `p` = chỉ số đoạn văn (để gom câu thành đoạn khi hiển thị). */
export interface StoryLine {
  p: number
  en: string
  vi: string
}

export interface StorySource {
  /** Vd: "Aesop's Fables, tr. George Fyler Townsend (1867) — public domain" */
  en: string
  /** URL Gutenberg đã tải văn bản gốc. Rỗng với truyện dân gian Việt Nam. */
  enUrl: string
  /** Vd: "Opus dịch tay 2026 từ bản public domain" */
  vi: string
}

/** Meta hiển thị ở danh sách — nằm trong index.json, KHÔNG kèm nội dung. */
export interface StoryMeta {
  id: string
  kind: StoryKind
  titleEn: string
  titleVi: string
  countryVi: string
  countryEn: string
  /** Emoji cờ, vd "🇩🇪". */
  flag: string
  /** Cấp CEFR gợi ý để người học tự lượng sức: 'A2' | 'B1' | 'B2'. */
  level: 'A2' | 'B1' | 'B2'
  /** Số câu — dùng ước lượng thời gian nghe ở danh sách. */
  lineCount: number
}

/** Nội dung đầy đủ — nằm trong <id>.json. */
export interface Story extends StoryMeta {
  source: StorySource
  /** Bài học rút ra (ngụ ngôn mới có). */
  moralEn?: string
  moralVi?: string
  lines: StoryLine[]
}
```

### 5.3 Ràng buộc dữ liệu (worker phải kiểm bằng test)

- `lines` không rỗng; mọi `en` và `vi` đều non-empty sau `trim()`.
- `p` bắt đầu từ 0, tăng dần, không nhảy cóc.
- `id` khớp tên file và khớp `index.json`.
- `lineCount === lines.length`.
- `kind === 'fable'` → phải có `moralEn` + `moralVi`.

## 6. UI — `apps/english/src/pages/Listening.tsx`

### 6.1 Cấu trúc trang

- Dùng `Layout` + `PageHeader` như các trang khác.
- Thanh **4 tab** ở đầu trang (mẫu: thanh tab trong `CefrLevelPage.tsx`):
  `Câu thông dụng · Hội thoại · Truyện cổ tích · Truyện ngụ ngôn`
  (chiều B: `Common phrases · Conversations · Fairy tales · Fables`).
- Tab hiện tại đồng bộ vào URL query `?tab=phrases|dialogues|fairy-tales|fables` để chia sẻ
  link và bấm Back được. Mặc định `phrases`.
- `VoiceMenu` + `RateToggle` ở đầu trang như `CommonPhrases.tsx`.

### 6.2 Tab 1 — Câu thông dụng

Đọc `data/patterns/loader.ts` (`loadIndex` + `loadSubject`). Trình bày **chế độ nghe**:
danh sách chủ thể → mở ra danh sách câu, mỗi câu là một `KaraokeText`, có nút
**"Phát tất cả"** phát tuần tự cả chủ thể. Bản dịch tiếng Việt ẩn/hiện bằng một nút gạt
"Hiện bản dịch" (mặc định ẨN — đây là trang luyện nghe).

### 6.3 Tab 2 — Hội thoại

Đọc `data/dialoguesLoader.ts`. Nhóm hội thoại theo cấp CEFR bằng tiền tố id
(`a1-*`, `a2-*`, `b1-*`, `b2-*`, `c1-*`, `c2-*`). Mỗi hội thoại: hiện tên nhân vật, mỗi
dòng một `KaraokeText`, **2 giọng khác nhau cho A/B** theo `speakerAGender`/`speakerBGender`
(dùng lại đúng logic đã có ở `RoadmapTab.tsx` — worker phải đọc và tái dùng, không viết lại).
Có nút "Phát cả hội thoại". Bản dịch ẩn/hiện như tab 1.

### 6.4 Tab 3 & 4 — Truyện cổ tích / ngụ ngôn

Cùng một component, khác `kind`.

**Danh sách:** lưới thẻ truyện — cờ quốc gia + tiêu đề (ngôn ngữ đích lớn, bản dịch nhỏ) +
nhãn cấp CEFR + ước lượng thời gian nghe (`lineCount × 4 giây`, làm tròn phút).
Có bộ lọc theo quốc gia (chip).

**Đọc truyện** (route con `/listening/story/:id`, lazy-load nội dung):

- Tiêu đề + cờ + dòng ghi nguồn (bắt buộc hiển thị `source.en` và `source.vi` — nghĩa vụ ghi công).
- Nội dung theo đoạn (`p`), mỗi câu một `KaraokeText` ngôn ngữ đích; bản dịch nằm ngay dưới,
  thụt lề bằng `KARAOKE_INDENT`, ẩn/hiện bằng nút gạt "Hiện bản dịch" (mặc định ẨN).
- Nút **"Phát cả truyện"**: phát tuần tự từng câu, tự cuộn tới câu đang đọc, câu đang đọc
  được làm nổi (dùng `externalState` của `KaraokeText`). Có nút Tạm dừng/Tiếp tục.
- Với ngụ ngôn: khối "Bài học rút ra" (`moralEn`/`moralVi`) ở cuối, có nút loa.
- Nút quay lại danh sách; giữ nguyên tab đang mở.

### 6.5 Chiều A / B

Tuân thủ `lib/direction.ts` như mọi trang: chiều A (Việt học Anh) → ngôn ngữ đích = Anh,
bản dịch = Việt. Chiều B → đảo lại (đọc `vi` bằng giọng `vi-VN`, bản dịch là `en`).
Toàn bộ nhãn UI song ngữ theo `useLang()`.

## 7. Điểm chạm code (đầy đủ — worker không cần đoán)

| File                                                           | Việc                                                                                                             |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/english/src/pages/Listening.tsx`                         | MỚI — trang chính 4 tab                                                                                          |
| `apps/english/src/pages/StoryReader.tsx`                       | MỚI — màn đọc 1 truyện                                                                                           |
| `apps/english/src/components/StoryCard.tsx`                    | MỚI — thẻ truyện ở danh sách                                                                                     |
| `apps/english/src/data/stories/index.ts`                       | MỚI — type (mục 5.2)                                                                                             |
| `apps/english/src/data/stories/loader.ts`                      | MỚI — `loadStoryIndex()`, `loadStory(id)`                                                                        |
| `apps/english/src/data/stories/raw/*.json`                     | MỚI — 12 truyện (Opus soạn)                                                                                      |
| `scripts/gen-stories-json.mjs`                                 | MỚI — sinh `public/data/stories/`                                                                                |
| `package.json`                                                 | thêm `"gen:stories"`; nối vào `build` cạnh `gen-data-manifest.mjs`                                               |
| `apps/english/src/App.tsx`                                     | thêm route `/listening` + `/listening/story/:id`, lazy, bọc `RequireAuth` + `FeatureGate featureKey="listening"` |
| `apps/english/src/i18n/index.ts`                               | thêm nhãn `navListening` + nhãn 4 tab (cả `vi` và `en`)                                                          |
| `apps/english/src/pages/Practice.tsx`                          | mục "Nghe" thêm 1 thẻ trỏ sang `/listening`                                                                      |
| `apps/english/src/pages/Home.tsx`                              | thêm lối vào trang Nghe                                                                                          |
| `api/admin-plan-features.ts` (hoặc nơi khai danh sách feature) | thêm khoá `listening`                                                                                            |
| `scripts/gen-data-manifest.mjs`                                | kiểm xem có cần liệt kê thư mục stories không                                                                    |

**Lưu ý `FeatureGate`:** worker phải đọc `lib/planFeatures.ts` xác nhận khoá lạ mặc định là
**BẬT** (không khoá nhầm người dùng free). Nếu mặc định là TẮT thì phải thêm `listening` vào
danh sách bật sẵn cho mọi gói.

## 8. Chất lượng — cổng bắt buộc

- Test đơn vị: `apps/english/src/data/stories/stories.test.ts` — kiểm toàn bộ ràng buộc mục 5.3
  trên cả 12 file `raw/*.json` (chạy vòng lặp, không hard-code từng truyện).
- Test đơn vị cho hàm gom câu theo đoạn và hàm ước lượng thời gian nghe.
- a11y: tab dùng `role="tablist"`/`aria-selected`, nút loa có `aria-label`, vùng chạm ≥ 44px
  (class `tap-44`), tương phản AA ở cả 4 theme — **không hard-code màu**, chỉ dùng token `--a-*`
  / class `accent-*` (CLAUDE.md §4.8).
- Hiệu năng: nội dung truyện KHÔNG được import tĩnh vào bundle; kiểm `npm run size` không vượt
  ngân sách.
- Cổng commit CLAUDE.md §8: `npm run build` · `typecheck` · `lint` (0 cảnh báo) · `format` · `test`.
- Không đụng `apps/english/src/prompts/*` và `packages/core-ai/aiConfig.ts` → **không cần** chạy
  `npm run eval:tutor`.

## 9. Phân việc

| Việc                                                               | Người làm                 | Lý do                                                     |
| ------------------------------------------------------------------ | ------------------------- | --------------------------------------------------------- |
| A. Nội dung 12 truyện (tải PD từ Gutenberg + dịch tay tiếng Việt)  | **Opus (phiên chính)**    | Dịch văn học + rủi ro bản quyền/ảo giác — không giao được |
| B. Hạ tầng dữ liệu: type, loader, script sinh JSON, test ràng buộc | subagent `route:spec`     | Đặc tả đã kín (mục 5)                                     |
| C. UI: trang Listening 4 tab + StoryReader + route/nav/i18n        | subagent `route:standard` | Đặc tả UI cụ thể (mục 6-7)                                |

Thứ tự: B và C chạy song song trên dữ liệu mẫu → A đổ nốt các truyện còn lại → cổng chất lượng → PR.

**Tiến độ thực tế 2026-08-01:**

- [x] B — hạ tầng dữ liệu (subagent)
- [x] C — UI trang Nghe (subagent)
- [x] A — 3 truyện Việt Nam: `fb-frog-in-well`, `fb-blind-men-elephant`, `ft-tam-cam`
- [ ] A — 9 truyện nước ngoài: **CHẶN**, chờ mở network cho `gutenberg.org` (xem mục 3.1)

## 10. Ngoài phạm vi đợt 1 (ghi để khỏi phình)

- Bài tập chấm điểm trong trang Nghe (đã có ở `/practice`).
- Prefetch TTS toàn bộ truyện lúc deploy.
- Lưu tiến độ nghe/đánh dấu truyện đã nghe lên DB.
- Truyện có minh hoạ.
- Tốc độ đọc riêng cho truyện (dùng `RateToggle` toàn cục).
