import type { Page } from '@playwright/test'

// Tắt animation/transition trước khi quét để axe đo TRẠNG THÁI CUỐI, không bắt
// nhằm khung giữa của `animate-fade-in` (opacity 0→1) — lúc opacity ~0.6 màu chữ
// trộn nền làm contrast tụt → vi phạm chập chờn (flaky).
// fade-in dùng fill-mode 'both' nên ép duration 0s sẽ nhảy thẳng tới opacity 1.
export async function freezeAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content:
      '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}',
  })
  await page.waitForTimeout(100)
}
