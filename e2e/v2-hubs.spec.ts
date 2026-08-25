// e2e/v2-hubs.spec.ts — E2E Tests for Platform V2 Hubs & Companion
import { test, expect } from '@playwright/test'
import { mockLogin } from './helpers/auth'

test.describe('Platform V2 Specialized Domain Hubs & Companion E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page)

    // Mock Companion API — apps/dhcb/src/pages/Companion.tsx gửi { stream: true } và parse
    // SSE (event: <type>\ndata: <json>\n\n), xem apps/dhcb/src/lib/companionApi.ts#
    // sendCompanionMessageStream. Body phải đúng định dạng SSE, KHÔNG phải JSON thường — mock
    // JSON cũ khiến parser không bao giờ tách được sự kiện (không có "\n\n" trong JSON thô) nên
    // Companion không bao giờ nhận được onDone → text không hiện (đã gây CI đỏ, xem PR #602).
    await page.route('**/api/companion', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON()
        const response = {
          reply: `Phản hồi từ Bạn Đồng Hành AI cho miền: ${body.domain || 'all'}`,
          intent: 'career_planning',
          targetDomain: body.domain || 'career',
          proposedActions: [
            {
              id: 'pa-e2e-1',
              action: 'Cập nhật vị trí mục tiêu lên Senior Staff Engineer',
              targetDomain: 'career',
              riskLevel: 'low',
              status: 'pending',
              proposedPayload: { targetRole: 'Senior Staff Engineer' },
            },
          ],
          contextPackage: {
            summary: 'Ngữ cảnh thử nghiệm E2E',
            domain: 'career',
            tokenBudget: 2000,
            tokensUsed: 450,
            retrievedFacts: [
              {
                id: 'f-1',
                category: 'skill',
                key: 'English',
                value: 'C1 Fluent',
                confidence: 0.95,
                sensitivity: 'low',
                sourceType: 'user_declared',
              },
            ],
          },
        }
        const sse = `event: done\ndata: ${JSON.stringify(response)}\n\n`
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream; charset=utf-8',
          body: sse,
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    // Mock Proposed Actions confirmation/rejection
    await page.route('**/api/proposed-actions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          action: {
            id: 'pa-e2e-1',
            action: 'Cập nhật vị trí mục tiêu lên Senior Staff Engineer',
            targetDomain: 'career',
            riskLevel: 'low',
            status: 'committed',
            proposedPayload: { targetRole: 'Senior Staff Engineer' },
          },
        }),
      })
    })

    // Mock Career API
    await page.route('**/api/career*', async (route) => {
      const url = route.request().url()
      if (url.includes('resource=profile')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            targetRole: 'Staff AI Engineer',
            currentTitle: 'Senior Software Engineer',
            yearsOfExperience: 6,
            industry: 'EdTech AI',
            targetSalaryMin: 50000000,
            targetSalaryMax: 80000000,
            currency: 'VND',
          }),
        })
      } else if (url.includes('resource=experiences')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'exp-1',
              company: 'VNG Tech',
              role: 'Senior Software Engineer',
              startDate: '2022-01',
              isCurrent: true,
              achievements: ['Xây dựng kiến trúc hệ thống phục vụ 500k DAU'],
            },
          ]),
        })
      } else if (url.includes('resource=goals')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'goal-1',
              targetTitle: 'VP of Engineering',
              targetCompanyType: 'Global Tech',
              timeframe: '2 năm',
              skillsRequired: ['System Design', 'English C1', 'Executive Leadership'],
              status: 'in_progress',
            },
          ]),
        })
      } else if (url.includes('resource=skill_gap')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            goalId: 'goal-1',
            gaps: [
              { skill: 'System Design', requiredLevel: 'Expert', isFulfilled: true },
              {
                skill: 'English C1',
                requiredLevel: 'C1',
                currentMastery: 'B2',
                isFulfilled: false,
              },
            ],
          }),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    // Mock Work API
    await page.route('**/api/work*', async (route) => {
      const url = route.request().url()
      if (url.includes('kind=projects')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'proj-1',
              name: 'Platform V2 Core',
              description: 'Nâng cấp toàn diện kiến trúc AI Companion',
              status: 'active',
            },
          ]),
        })
      } else if (url.includes('kind=tasks')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'task-1',
              title: 'Hoàn thiện E2E Tests',
              priority: 'urgent',
              status: 'todo',
            },
          ]),
        })
      } else if (url.includes('kind=meetings')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'meet-1',
              title: 'V2 Architecture Sprint Sync',
              scheduledAt: new Date().toISOString(),
              durationMinutes: 45,
              summary: 'Rà soát 8 acceptance invariants',
              actionItems: ['Deploy staging drill'],
            },
          ]),
        })
      } else if (url.includes('kind=documents')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'doc-1',
              title: 'V2 Architecture Spec',
              documentType: 'spec',
              summary: 'Đặc tả 13 schemas và Life Graph',
            },
          ]),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    // Mock Startup API
    await page.route('**/api/startup*', async (route) => {
      const url = route.request().url()
      if (url.includes('kind=ventures')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'ven-1',
              name: 'AI Companion SaaS',
              stage: 'validation',
              description: 'Trợ lý học tập và phát triển cá nhân hóa',
            },
          ]),
        })
      } else if (url.includes('kind=problems')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'prob-1',
              statement: 'Người đi làm khó duy trì kỷ luật học tiếng Anh',
              customerSegment: 'Kỹ sư công nghệ',
              severity: 'critical',
              evidenceCount: 3,
            },
          ]),
        })
      } else if (url.includes('kind=hypotheses')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'hyp-1',
              statement: 'Tích hợp Life Graph tăng tỷ lệ giữ chân lên 40%',
              hypothesisType: 'solution',
              status: 'supported',
            },
          ]),
        })
      } else if (url.includes('kind=evidence')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'ev-1',
              title: 'Phỏng vấn 30 người dùng Alpha',
              evidenceType: 'interview',
              provenance: 'Survey 2026-08',
              findings: '90% người dùng đánh giá cao tính năng Life Graph',
              supportsHypothesis: true,
            },
          ]),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })

    // Mock Life Foundation API
    await page.route('**/api/life*', async (route) => {
      const url = route.request().url()
      if (url.includes('kind=habits')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'hab-1',
              title: 'Luyện phát âm 15 phút mỗi sáng',
              habitType: 'build',
              currentStreak: 12,
              bestStreak: 21,
            },
          ]),
        })
      } else if (url.includes('kind=wellbeing')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'wb-1',
              moodScore: 9,
              energyScore: 8,
              stressScore: 2,
              notes: 'Tràn đầy năng lượng sau buổi học',
              checkedAt: new Date().toISOString(),
            },
          ]),
        })
      } else if (url.includes('kind=plans')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'plan-1',
              title: 'Chinh phục IELTS 7.5 trong Q4',
              planType: 'quarterly',
              periodStart: '2026-10-01',
              periodEnd: '2026-12-31',
              status: 'active',
            },
          ]),
        })
      } else if (url.includes('kind=milestones')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mile-1',
              title: 'Hoàn thành Cấp độ CEFR B2',
              area: 'learning',
              achievedAt: '2026-08-15',
              description: 'Vượt qua bài thi đánh giá 4 kỹ năng',
            },
          ]),
        })
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      }
    })
  })

  test('Trang chủ hiển thị thẻ Bạn Đồng Hành AI, Không Gian Chuyên Biệt nằm ở trang Cá nhân', async ({
    page,
  }) => {
    // Khối "Không Gian Chuyên Biệt" đã dời khỏi Trang chủ sang /profile (Personal Command
    // Center) — xem PROGRESS.md mục "V2 UI — Multi-Subject Learning...". Trang chủ chỉ còn thẻ
    // "Bạn Đồng Hành AI" dẫn tới /dong-hanh.
    // Dùng heading (Home.tsx <h4>"Bạn Đồng Hành AI Đa Miền"</h4>) thay vì getByText để tránh
    // khớp nhầm các đoạn mô tả khác trên trang cùng nhắc tới "Bạn Đồng Hành AI".
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Bạn Đồng Hành AI/ })).toBeVisible()

    await page.goto('/profile')
    await expect(page.getByText('Sự nghiệp', { exact: true })).toBeVisible()
    await expect(page.getByText('Công việc', { exact: true })).toBeVisible()
    await expect(page.getByText('Khởi nghiệp', { exact: true })).toBeVisible()
    await expect(page.getByText('Đời sống', { exact: true })).toBeVisible()
  })

  test('Luồng Bạn Đồng Hành AI: gửi tin nhắn, nhận phản hồi và duyệt Proposed Action', async ({
    page,
  }) => {
    await page.goto('/ban-dong-hanh')
    await expect(page.getByText('Bạn Đồng Hành Đa Lĩnh Vực')).toBeVisible()

    // Chọn Domain Sự nghiệp
    await page.getByRole('button', { name: 'Sự nghiệp' }).click()

    // Gửi tin nhắn
    const input = page.getByPlaceholder(/Nhắn tin cho Bạn Đồng Hành AI/)
    await input.fill('Tư vấn lộ trình thăng tiến Senior lên Staff')
    await input.press('Enter')

    // Kiểm tra phản hồi
    await expect(page.getByText('Phản hồi từ Bạn Đồng Hành AI cho miền: career')).toBeVisible()

    // Kiểm tra thẻ Đề xuất hành động (Proposed Action) và nút duyệt
    await expect(page.getByText('Tác vụ đề xuất')).toBeVisible()
    const confirmBtn = page.getByRole('button', { name: 'Xác nhận' })
    await expect(confirmBtn).toBeVisible()
    await confirmBtn.click()
    await expect(page.getByText('Đã thực thi')).toBeVisible()
  })

  test('Luồng Career Hub: hiển thị thông tin hồ sơ, mục tiêu và phân tích khoảng cách kỹ năng', async ({
    page,
  }) => {
    await page.goto('/su-nghiep')
    await expect(page.getByText('Không Gian Sự Nghiệp (Career Hub)')).toBeVisible()
    await expect(page.getByText('Staff AI Engineer')).toBeVisible()
    await expect(page.getByText('6 năm kinh nghiệm')).toBeVisible()
    await expect(page.getByText('VP of Engineering')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Phân Tích Khoảng Cách Kỹ Năng/ })).toBeVisible()
    await expect(page.getByText('System Design').first()).toBeVisible()
    await expect(page.getByText('English C1').first()).toBeVisible()
  })

  test('Luồng Work Hub: chuyển đổi giữa các tab Công việc, Dự án, Cuộc họp và Tài liệu', async ({
    page,
  }) => {
    // Route cũ /cong-viec nay chuyển hướng sang tab "Công việc" của trụ gộp
    // "Công việc & Đời sống" (migration 0066) — kiểm luôn để link cũ không gãy im lặng.
    await page.goto('/cong-viec')
    await expect(page).toHaveURL(/\/cong-viec-cuoc-song\?muc=cong-viec/)
    await expect(page.getByText('Không Gian Công Việc (Work Hub)')).toBeVisible()

    // Tab 1: Công việc
    await expect(page.getByText('Hoàn thiện E2E Tests')).toBeVisible()

    // Tab 2: Dự án
    await page.getByRole('button', { name: /Dự án/ }).click()
    await expect(page.getByRole('heading', { name: 'Platform V2 Core' })).toBeVisible()

    // Tab 3: Cuộc họp
    await page.getByRole('button', { name: /Cuộc họp/ }).click()
    await expect(page.getByText('V2 Architecture Sprint Sync')).toBeVisible()

    // Tab 4: Tài liệu
    await page.getByRole('button', { name: /Tài liệu/ }).click()
    await expect(page.getByText('V2 Architecture Spec')).toBeVisible()
  })

  test('Luồng Startup Hub: xem Lean Canvas và Nhật ký Bằng chứng', async ({ page }) => {
    await page.goto('/khoi-nghiep')
    await expect(page.getByText('Không Gian Khởi Nghiệp (Startup Hub)')).toBeVisible()
    await expect(page.getByText('Trợ lý học tập và phát triển cá nhân hóa')).toBeVisible()
    await expect(page.getByText('Người đi làm khó duy trì kỷ luật học tiếng Anh')).toBeVisible()
    await expect(page.getByText('Tích hợp Life Graph tăng tỷ lệ giữ chân lên 40%')).toBeVisible()

    // Chuyển sang tab Nhật ký bằng chứng
    await page.getByRole('button', { name: /Nhật Ký Bằng Chứng/ }).click()
    await expect(page.getByText('Phỏng vấn 30 người dùng Alpha')).toBeVisible()
    await expect(page.getByText('Ủng hộ giả thuyết')).toBeVisible()
  })

  test('Luồng Life Foundation Hub: xem chuỗi thói quen, check-in sức khỏe và kế hoạch', async ({
    page,
  }) => {
    // Route cũ /cuoc-song nay chuyển hướng sang tab "Đời sống" của trụ gộp.
    await page.goto('/cuoc-song')
    await expect(page).toHaveURL(/\/cong-viec-cuoc-song\?muc=doi-song/)
    await expect(page.getByText('Nền Tảng Cuộc Sống (Life Foundation)')).toBeVisible()

    // Tab Thói quen
    await expect(page.getByText('Luyện phát âm 15 phút mỗi sáng')).toBeVisible()
    await expect(page.getByText('12 ngày')).toBeVisible()

    // Tab Sức khỏe & Tâm trạng
    await page.getByRole('button', { name: /Sức khỏe & Tâm trạng/ }).click()
    await expect(page.getByText('Tràn đầy năng lượng sau buổi học')).toBeVisible()

    // Tab Kế hoạch
    await page.getByRole('button', { name: /Kế hoạch/ }).click()
    await expect(page.getByText('Chinh phục IELTS 7.5 trong Q4')).toBeVisible()

    // Tab Cột mốc
    await page.getByRole('button', { name: /Cột mốc/ }).click()
    await expect(page.getByText('Hoàn thành Cấp độ CEFR B2')).toBeVisible()
  })
})
