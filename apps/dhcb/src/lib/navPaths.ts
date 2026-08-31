// navPaths — bảng tiền tố đường dẫn của 5 tab điều hướng lõi, dùng CHUNG cho
// BottomNav (mobile, components/BottomNav.tsx) và DesktopSidebar (desktop,
// components/DesktopSidebar.tsx).
//
// Vì sao tách ra: trước đây bảng này nằm riêng trong BottomNav.tsx nên sidebar desktop
// chỉ so khớp được `/`, `/tien-do`, `/trang-ca-nhan` + STUDIOS — đứng ở /tro-truyen,
// /luyen-noi, /luyen-viet, /tu-dien, /bai-hoc… KHÔNG mục nào sáng, tức desktop mất định
// vị trong khi mobile vẫn có (audit 2026-08-31 mục A5). Một nguồn sự thật thì hai thanh
// điều hướng không bao giờ lệch nhau nữa.

export const LEARNING_PATHS = [
  '/phong-hoc',
  '/hoc-mon-hoc',
  '/subjects',
  '/mon-hoc',
  '/hoc-tieng-anh',
  '/tieng-anh',
  '/english',
  '/lo-trinh-hoc',
  '/hoc-ung-dung',
  '/applied-knowledge',
  '/ung-dung-thuc-te',
  '/mo-phong',
]

export const PRACTICE_PATHS = [
  '/phong-luyen-tap',
  '/luyen-tap',
  '/tro-truyen',
  '/luyen-noi',
  '/luyen-viet',
  '/luyen-nghe',
  '/tu-dien',
  '/truyen-song-ngu',
  '/cau-thong-dung',
  '/bai-hoc',
  '/so-tay-loi-sai',
  '/thu-thach',
]

export const COMPANION_PATHS = [
  '/agent-ban-dong-hanh',
  '/ban-dong-hanh',
  '/dong-hanh',
  '/companion',
  '/workspace',
  '/action-canvas',
]

/** Trang bảng giá — tách riêng để sidebar có mục "Nâng cấp" không bị "Hồ sơ" nuốt mất. */
export const PRICING_PATHS = ['/nang-cap']

export const PROFILE_PATHS = [
  '/trang-ca-nhan',
  '/profile',
  '/cai-dat',
  '/tien-do',
  '/lich-su-hoc',
  '/su-nghiep-cua-toi',
  '/hoc-su-nghiep',
  '/su-nghiep',
  '/su-nghiep-khoi-nghiep',
  '/career',
  '/cong-viec-cua-toi',
  '/hoc-cong-viec',
  '/cong-viec',
  '/cong-viec-cuoc-song',
  '/work',
  '/toi-khoi-nghiep',
  '/hoc-khoi-nghiep',
  '/khoi-nghiep',
  '/startup',
  '/cuoc-song-cua-toi',
  '/hoc-cuoc-song',
  '/cuoc-song',
  '/life',
  '/life-graph',
  '/ban-be',
  '/tin-nhan',
]

// ── Bảng riêng cho từng mục SIDEBAR desktop ─────────────────────────────────────
// Sidebar có nhiều mục hơn 5 tab mobile (mỗi studio một mục) nên cần tách nhỏ hơn:
// nếu để cả `LEARNING_PATHS` cho mục "Phòng Học" thì đứng ở `/hoc-tieng-anh` sẽ sáng
// nhầm mục đó thay vì "Học Tiếng Anh". Thứ tự ưu tiên do `resolveActiveNav` quyết định.

/** Môn Tiếng Anh — tập CON của LEARNING_PATHS, phải xét TRƯỚC nhóm Phòng Học. */
export const ENGLISH_PATHS = ['/hoc-tieng-anh', '/tieng-anh', '/english', '/lo-trinh-hoc']

export const CAREER_PATHS = [
  '/su-nghiep-khoi-nghiep',
  '/su-nghiep-cua-toi',
  '/hoc-su-nghiep',
  '/su-nghiep',
  '/career',
  '/toi-khoi-nghiep',
  '/hoc-khoi-nghiep',
  '/khoi-nghiep',
  '/startup',
]

export const WORKLIFE_PATHS = [
  '/cong-viec-cuoc-song',
  '/cong-viec-cua-toi',
  '/hoc-cong-viec',
  '/cong-viec',
  '/work',
  '/cuoc-song-cua-toi',
  '/hoc-cuoc-song',
  '/cuoc-song',
  '/life-graph',
  '/life',
]

/** Trang tiến độ — tách khỏi PROFILE_PATHS để sidebar có mục "Tiến độ" riêng. */
export const PROGRESS_PATHS = ['/tien-do']

/** Đường dẫn hiện tại có thuộc nhóm tab này không (so khớp theo TIỀN TỐ, như BottomNav
 *  vẫn làm từ trước — trang con `/luyen-noi/xxx` vẫn sáng đúng tab cha). */
export function matchesNav(pathname: string, paths: readonly string[]): boolean {
  return paths.some((p) => pathname.startsWith(p))
}

/**
 * Chọn ĐÚNG MỘT mục điều hướng đang hoạt động.
 *
 * Vì sao cần hàm này thay vì để mỗi mục tự `matchesNav`: các bảng path chồng lấn nhau
 * (`ENGLISH_PATHS` ⊂ `LEARNING_PATHS`; `PROFILE_PATHS` chứa cả path sự nghiệp/đời sống).
 * Nếu mục nào cũng tự xét thì một trang có thể làm sáng 2-3 mục cùng lúc. Ở đây quy ước
 * "AI ĐỨNG TRƯỚC THẮNG" — người gọi xếp entries từ cụ thể nhất tới bao quát nhất.
 *
 * @returns `to` của mục thắng, hoặc `null` khi không mục nào khớp.
 */
export function resolveActiveNav(
  pathname: string,
  entries: readonly { to: string; paths?: readonly string[]; exact?: boolean }[],
): string | null {
  for (const e of entries) {
    if (e.exact) {
      if (pathname === e.to) return e.to
      continue
    }
    if (matchesNav(pathname, e.paths ?? [e.to])) return e.to
  }
  return null
}
