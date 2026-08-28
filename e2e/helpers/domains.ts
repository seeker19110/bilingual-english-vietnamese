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

/** Chặn 4 endpoint trụ, trả dữ liệu tối thiểu đủ để mọi hộp thoại mở được. */
export async function mockDomainApis(page: Page): Promise<void> {
  await page.route('**/api/startup**', (route) => {
    const kind = new URL(route.request().url()).searchParams.get('kind')
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(kind === 'ventures' ? [VENTURE] : []),
    })
  })
  // Career dùng ?resource= thay vì ?kind=; riêng `profile` trả về MỘT đối tượng
  // (hoặc null khi chưa thiết lập) chứ không phải mảng — trả '[]' ở đây sẽ khiến
  // trang coi như "đã có hồ sơ" rồi đọc thuộc tính không tồn tại.
  await page.route('**/api/career**', (route) => {
    const resource = new URL(route.request().url()).searchParams.get('resource')
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: resource === 'profile' ? 'null' : '[]',
    })
  })
  for (const domain of ['work', 'life']) {
    await page.route(`**/api/${domain}**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    )
  }
}
