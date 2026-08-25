import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

// Cổng CHỨC NĂNG dự án trục chặng P1 (PR-L3b): workspace + milestone check chấm hành vi
// bằng Pyodide thật (tự host, offline). Bước sau khoá tới khi bước trước đạt hết test.

test('bước 1 dự án: dùng code mẫu → đạt hết check → mở bước 2', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/du-an', { waitUntil: 'domcontentloaded' })

  // Bước 2 đang KHOÁ khi chưa xong bước 1
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeDisabled()

  // Dùng phao của bước 1 rồi chấm
  await page.getByRole('button', { name: 'Xem code mẫu bước này' }).click()
  await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
  await expect(page.getByText('Chào đúng tên chủ quán nhập vào')).toBeVisible({ timeout: 120_000 })

  // Đạt hết → banner + nút sang bước 2; nút "Bước 2" trên thanh cũng mở khoá
  await expect(page.getByText(/Đạt hết test của bước 1/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Sang bước 2' }).click()
  await expect(page.getByText('Bước 2: Chọn món + số lượng → tính tiền')).toBeVisible()
})

test('code khởi đầu (chưa làm gì) chấm bước 1 → có ca rớt, bước 2 vẫn khoá', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')
  await page.goto('/lap-trinh/du-an', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
  // Starter code không in gì → ca 1 rớt hiện rõ
  await expect(page.getByText('Chào đúng tên chủ quán nhập vào')).toBeVisible({ timeout: 120_000 })
  await expect(page.getByText('(không in gì)').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bước 2', exact: true })).toBeDisabled()
})

// Chặng P2 (PR-L6b) — phần rủi ro nhất của đợt này: workspace NHIỀU FILE. Bước cuối chấm
// bằng `probeCode` import thẳng logic.py/luu_tru.py của học viên, nên test này chứng minh
// Pyodide thật sự mount được cây file (import + ghi/đọc CSV trong FS bộ nhớ), chứ không chỉ
// chạy đúng ở python3 của CI.
test('chặng P2: khoá khi chưa xong P1; mở ra thì bước tách 3 file chấm được thật', async ({
  page,
}) => {
  test.setTimeout(240_000)
  await mockLogin(page, 'vi', 'dark-blue')

  // Chưa xong chặng P1 → nút chặng P2 bị khoá.
  await page.route('**/api/programming/progress', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ lessons: [] }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )
  await page.goto('/lap-trinh/du-an', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: /Chặng P2/ })).toBeDisabled()

  // Giả lập đã hoàn thành trọn chặng P1 → chặng P2 mở.
  const p1Done = ['p1-s1', 'p1-s2', 'p1-s3', 'p1-s4', 'p1-s5'].map((lessonId) => ({
    lessonId,
    status: 'completed',
    completedAt: 1,
  }))
  await page.route('**/api/programming/progress', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ lessons: p1Done }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )
  await page.route('**/api/programming/project', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ files: [], snapshots: [] }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )
  await page.goto('/lap-trinh/du-an?chang=p2', { waitUntil: 'domcontentloaded' })

  // Nhảy tới bước cuối (bước tách file) — các bước trước đã mở vì P1 xong… nhưng P2 thì chưa,
  // nên phải đi từng bước: dùng phao rồi chấm cho tới bước 5.
  for (let buoc = 1; buoc <= 5; buoc++) {
    await page.getByRole('button', { name: 'Xem code mẫu bước này' }).click()
    await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
    if (buoc < 5) {
      await expect(page.getByRole('button', { name: `Sang bước ${buoc + 1}` })).toBeVisible({
        timeout: 180_000,
      })
      await page.getByRole('button', { name: `Sang bước ${buoc + 1}` }).click()
    }
  }

  // Bước 5: có thanh file 3 file và đạt hết check của probe (import module thật)
  await expect(page.getByRole('button', { name: 'logic.py' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'luu_tru.py' })).toBeVisible()
  await expect(page.getByText('logic.tinh_tien gọi được từ ngoài và tính đúng')).toBeVisible({
    timeout: 180_000,
  })
  await expect(page.getByText(/Hoàn thành Chặng P2/)).toBeVisible()
})

// Chặng P3 (PR-L8) — phần rủi ro nhất đợt này: MỖI BƯỚC MỘT NGÔN NGỮ (html → html/CSS → dom
// → sql → fetch). Cổng CI (projectStepsP3.test.ts) đã chấm nội dung bằng happy-dom/linkedom/
// sql.js ở Node; test này chốt thứ cổng kia không thấy: trang dự án chọn ĐÚNG bộ chạy theo
// `language` của bước, và 4 worker khác nhau đều nạp được trong trình duyệt thật.
test('chặng P3: cả 5 bước (HTML → CSS → DOM → SQL → fetch) chấm được trong trình duyệt', async ({
  page,
}) => {
  test.setTimeout(300_000)
  await mockLogin(page, 'vi', 'dark-blue')

  // Giả lập đã xong trọn P1 + P2 để chặng P3 mở.
  const done = [...Array(5)]
    .flatMap((_, i) => [`p1-s${i + 1}`, `p2-s${i + 1}`])
    .map((lessonId) => ({
      lessonId,
      status: 'completed',
      completedAt: 1,
    }))
  await page.route('**/api/programming/progress', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ lessons: done }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )
  await page.route('**/api/programming/project', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ files: [], snapshots: [] }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )

  await page.goto('/lap-trinh/du-an?chang=p3', { waitUntil: 'domcontentloaded' })

  for (let buoc = 1; buoc <= 5; buoc++) {
    await page.getByRole('button', { name: 'Xem code mẫu bước này' }).click()
    await page.getByRole('button', { name: 'Kiểm tra bước' }).click()
    if (buoc < 5) {
      await expect(page.getByRole('button', { name: `Sang bước ${buoc + 1}` })).toBeVisible({
        timeout: 180_000,
      })
      await page.getByRole('button', { name: `Sang bước ${buoc + 1}` }).click()
    }
  }

  // Bước 5 (fetch, milestone): menu lấy từ API cửa hàng — món 'ca phe sua' CHỈ có trong API,
  // nên ca này xanh chứng minh dữ liệu thật sự đi qua fetch giả chứ không phải bảng gõ cứng.
  await expect(
    page.getByText('Món CHỈ có trong API cũng hiện ra (menu thật từ máy chủ)'),
  ).toBeVisible({ timeout: 180_000 })
  await expect(page.getByText(/Hoàn thành Chặng P3/)).toBeVisible()
})

test('chặng P3 bước HTML: khung xem trang hiện ngay trang học viên đang viết', async ({ page }) => {
  test.setTimeout(180_000)
  await mockLogin(page, 'vi', 'dark-blue')

  const done = [...Array(5)]
    .flatMap((_, i) => [`p1-s${i + 1}`, `p2-s${i + 1}`])
    .map((lessonId) => ({
      lessonId,
      status: 'completed',
      completedAt: 1,
    }))
  await page.route('**/api/programming/progress', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ lessons: done }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )
  await page.route('**/api/programming/project', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, body: JSON.stringify({ files: [], snapshots: [] }) })
      : route.fulfill({ status: 200, body: '{}' }),
  )

  await page.goto('/lap-trinh/du-an?chang=p3', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Xem code mẫu bước này' }).click()

  // Bước HTML là trang TĨNH nên khung xem hiện luôn theo nội dung đang soạn (không cần bấm).
  const khung = page.frameLocator('iframe[title="Xem trước trang web bạn vừa viết"]')
  await expect(khung.locator('h1')).toHaveText('Quan cua toi')
  await expect(khung.locator('.menu li').first()).toHaveText('Tra da - 5000')
})
