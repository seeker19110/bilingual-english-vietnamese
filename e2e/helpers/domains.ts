import type { Page } from '@playwright/test'
import { USER_ID } from './auth'

// Giả dữ liệu 4 trụ Career/Work/Startup/Life cho E2E.
//
// E2E chạy bằng `npm run dev` (Vite), KHÔNG có backend Postgres, nên mọi lời gọi
// /api/{career,work,startup,life} sẽ hỏng và trang rơi về danh sách rỗng. Phần lớn
// nút mở hộp thoại vẫn hiện ở đầu mỗi mục nên rỗng là đủ — RIÊNG trụ Startup thì
// không: chưa có dự án nào thì trang chỉ hiện màn "Chưa có dự án khởi nghiệp nào",
// ba hộp thoại Bài toán/Giả thuyết/Bằng chứng không thể mở. Nên ta gieo sẵn 1 dự án.
const NOW = '2026-01-01T00:00:00.000Z'
const VENTURE_ID = '11111111-1111-4111-8111-111111111111'

const VENTURE = {
  id: VENTURE_ID,
  personId: USER_ID,
  name: 'Dự án E2E',
  description: 'Dự án gieo sẵn cho kiểm thử',
  stage: 'ideation',
  schemaVersion: 1,
  createdAt: NOW,
  updatedAt: NOW,
}

// Server luôn BỌC response GET trong một object theo tên tài nguyên (vd { ventures: [...] },
// { profile: null }, { goals: [...] }) — xem apps/server/src/api/domains/{career,startup,work,
// life}.ts. Mock ở đây PHẢI khớp đúng hình dạng bọc đó, nếu không nó khớp với đúng lỗi
// client-đọc-thẳng-response-trần đã sửa ở careerApi.ts/startupApi.ts/workApi.ts/lifeApi.ts
// (2026-08-29, xem docs/changelog/0196-2026-08-29-fix-career-startup-api-unwrap.md) — mock kiểu
// cũ (mảng/giá trị trần) từng khiến bug này lọt qua E2E y hệt cách nó lọt qua unit test.

// Tên khoá bọc response KHÔNG phải lúc nào cũng trùng tên `kind`/`resource` trên URL — vd
// life kind=wellbeing trả về khoá "checks", career resource=skill_gap trả về khoá "analysis".
// Khớp đúng từng cặp theo handler thật, không đoán theo quy luật chung.
const STARTUP_KEY: Record<string, string> = {
  ventures: 'ventures',
  problems: 'problems',
  hypotheses: 'hypotheses',
  evidence: 'evidence',
}
const CAREER_KEY: Record<string, string> = {
  profile: 'profile',
  experiences: 'experiences',
  goals: 'goals',
  skill_levels: 'skillLevels',
  skill_gap: 'analysis',
}
const WORK_KEY: Record<string, string> = {
  projects: 'projects',
  tasks: 'tasks',
  meetings: 'meetings',
  documents: 'documents',
}
const LIFE_KEY: Record<string, string> = {
  plans: 'plans',
  habits: 'habits',
  wellbeing: 'checks',
  wheel: 'wheel',
  milestones: 'milestones',
}

/** Chặn 4 endpoint trụ, trả dữ liệu tối thiểu đủ để mọi hộp thoại mở được. */
export async function mockDomainApis(page: Page): Promise<void> {
  await page.route('**/api/startup**', (route) => {
    const kind = new URL(route.request().url()).searchParams.get('kind') ?? 'ventures'
    const key = STARTUP_KEY[kind] ?? kind
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ [key]: kind === 'ventures' ? [VENTURE] : [] }),
    })
  })
  // Career dùng ?resource= thay vì ?kind=; riêng `profile` trả về MỘT đối tượng
  // (hoặc null khi chưa thiết lập) chứ không phải mảng — trả '[]' ở đây sẽ khiến
  // trang coi như "đã có hồ sơ" rồi đọc thuộc tính không tồn tại.
  await page.route('**/api/career**', (route) => {
    const resource = new URL(route.request().url()).searchParams.get('resource') ?? 'profile'
    const key = CAREER_KEY[resource] ?? resource
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ [key]: resource === 'profile' ? null : [] }),
    })
  })
  await page.route('**/api/work**', (route) => {
    const kind = new URL(route.request().url()).searchParams.get('kind') ?? 'projects'
    const key = WORK_KEY[kind] ?? kind
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ [key]: [] }),
    })
  })
  await page.route('**/api/life**', (route) => {
    const kind = new URL(route.request().url()).searchParams.get('kind') ?? 'plans'
    const key = LIFE_KEY[kind] ?? kind
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ [key]: kind === 'wheel' ? null : [] }),
    })
  })
}
