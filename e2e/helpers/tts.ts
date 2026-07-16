import type { Page } from '@playwright/test'

// Vô hiệu hóa TTS để trang có audio không treo: chặn /api/tts (rớt về Web Speech) và
// làm speechSynthesis kết thúc NGAY (headless không có giọng đọc → onend có thể không
// bao giờ bắn → await speak()/speakBilingual() treo). Stub gọi onend ở tick sau để
// Promise resolve. Dùng chung cho mọi spec có màn tự phát audio (a11y.spec.ts,
// listening.spec.ts…) — tách ra đây để không copy 2 lần (CLAUDE.md §4.4 DRY).
export async function muteTts(page: Page) {
  await page.route('**/api/tts', (route) => route.abort())
  await page.addInitScript(() => {
    const synth = {
      speak: (u: SpeechSynthesisUtterance) => {
        const handler = u.onend
        if (handler)
          setTimeout(() => handler.call(u, new Event('end') as unknown as SpeechSynthesisEvent), 0)
      },
      cancel() {},
      pause() {},
      resume() {},
      getVoices: () => [] as SpeechSynthesisVoice[],
    }
    try {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
    } catch {
      /* trình duyệt không cho ghi đè — bỏ qua, fallback vẫn resolve qua onerror */
    }
  })
}
