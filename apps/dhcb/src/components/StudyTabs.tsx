// ──────────────────────────────────────────────────────────────────────
// CÁC TAB HỌC THEO CẤP — Hôm nay · Ôn SRS · Từ khó · Kiểm tra
//
// Trước đây nằm ở trang /learning-path (Learn.tsx); nay mỗi cấp CEFR có
// TRANG RIÊNG (/learning-path/a1…b2) nên 4 tab này chuyển vào trang cấp
// (CefrLevelPage) và GIỚI HẠN theo từ vựng của cấp qua prop `pool`:
//   - pool = getLevelWords(cấp); riêng cấp CUỐI (B2) cộng thêm phần ngoài
//     lộ trình CEFR (getBeyondCefrWords) để học tiếp sau khi xong B2.
//   - Giới hạn ngày (20 từ/lượt, tối đa 100/ngày, quiz mở batch) vẫn tính
//     CHUNG toàn app (lib/curriculum.ts), KHÔNG tách theo cấp.
// Yêu cầu: đã await loadCurriculum() trước khi render (trang cấp lo việc này).
// ──────────────────────────────────────────────────────────────────────

//
// [2026-09-06] File này từng dài 2.071 dòng; nay chỉ là BARREL re-export. Mã thật nằm ở
// `components/studyTabs/` (mỗi tab một file). Đường import ở nơi dùng KHÔNG đổi.

export { TodayLesson } from './studyTabs/TodayLesson'
export { SRSReview } from './studyTabs/SRSReview'
export { HardWords } from './studyTabs/HardWords'
export { QuizTab } from './studyTabs/QuizTab'
export { ListeningTab } from './studyTabs/ListeningTab'
export type { GrammarQuizSource } from './studyTabs/quizBuilders'
