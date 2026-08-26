// e2e/helpers/location.ts — Dựng sẵn một chuyến "Đi chung" cho E2E.
//
// Dùng chung cho CẢ HAI cổng a11y (a11y.spec.ts mức A/AA và a11y-aaa.spec.ts mức AAA) nên
// fixture chỉ có một bản — sửa dữ liệu mẫu ở đây là cả hai cổng cùng đổi theo.
//
// Vì sao trang /nhom-di-chung cần helper riêng thay vì chỉ `page.goto`: toàn bộ giao diện đáng
// quét (bản đồ, danh sách người, cảnh báo đi lạc, công tắc chia sẻ, nhóm nút của chủ chuyến)
// chỉ hiện SAU khi có dữ liệu chuyến từ backend. Tải trang trơn chỉ thấy màn tạo chuyến, nên
// trước đây trang này nằm ngoài mọi cổng a11y — và đó chính là lý do lỗi tương phản của nút
// chia sẻ (chữ trắng trên nền accent, rớt AA ở cả 5 theme) lọt lưới tới tận lúc thiết kế lại.

import { expect, type Page } from '@playwright/test'
import { mockLogin, USER_ID, type ThemeName } from './auth'

/**
 * Chuyến mẫu, cố ý dựng đủ mọi nhánh giao diện:
 *   • có ĐIỂM HẸN → hiện nút "Chỉ đường tới điểm hẹn" và mốc tính cảnh báo là điểm hẹn;
 *   • "Đức" ở xa hơn bán kính 300m → bật khối CẢNH BÁO ĐI LẠC (nền amber);
 *   • "Lan" dùng vị trí gần đúng và pin yếu → bật các mẩu chi tiết phụ trong danh sách;
 *   • "Minh" đang TẮT chia sẻ → bật nhánh avatar viền đứt;
 *   • tôi là CHỦ CHUYẾN → hiện thêm nhóm nút đặt điểm hẹn / gia hạn / kết thúc.
 */
function buildTripState() {
  return {
    sessionId: '11111111-2222-4333-8444-555555555555',
    name: 'Đi cà phê Bờ Hồ',
    inviteCode: 'K7M2QP',
    ownerId: USER_ID,
    expiresAt: new Date(Date.now() + 95 * 60_000).toISOString(),
    endedAt: null,
    alertRadiusM: 300,
    meetPoint: { lat: 21.0285, lng: 105.8542, label: 'Điểm hẹn' },
    members: [
      {
        userId: USER_ID,
        name: 'E2E User',
        sharingEnabled: true,
        precisionMode: 'exact',
        isOwner: true,
        position: { lat: 21.0286, lng: 105.8543, batteryPct: 82 },
        updatedAt: new Date(Date.now() - 20_000).toISOString(),
      },
      {
        userId: '99999999-2222-4333-8444-555555555555',
        name: 'Lan',
        sharingEnabled: true,
        precisionMode: 'approx',
        isOwner: false,
        position: { lat: 21.029, lng: 105.855, batteryPct: 14 },
        updatedAt: new Date(Date.now() - 120_000).toISOString(),
      },
      {
        userId: '77777777-2222-4333-8444-555555555555',
        name: 'Đức',
        sharingEnabled: true,
        precisionMode: 'exact',
        isOwner: false,
        position: { lat: 21.035, lng: 105.86 },
        updatedAt: new Date(Date.now() - 45_000).toISOString(),
      },
      {
        userId: '88888888-2222-4333-8444-555555555555',
        name: 'Minh',
        sharingEnabled: false,
        precisionMode: 'exact',
        isOwner: false,
        position: null,
        updatedAt: null,
      },
    ],
  }
}

/**
 * Trình duyệt E2E không có GPS thật, nên PHẢI giả lập — bỏ mặc thì kết quả phụ thuộc vào việc
 * trình duyệt trên máy này có từ chối quyền vị trí hay không, và test sẽ xanh ở máy dev mà đỏ
 * trên CI (đã dính đúng lỗi đó một lần).
 *   • 'fixed'  — luôn trả về một toạ độ cố định: trạng thái bình thường, không có toast.
 *   • 'denied' — luôn gọi callback lỗi: đúng cảnh người dùng chưa cấp quyền vị trí, làm hiện
 *     toast lỗi. Dùng để quét a11y của chính cái toast đó.
 */
type GeolocationMode = 'fixed' | 'denied'

async function stubGeolocation(page: Page, mode: GeolocationMode): Promise<void> {
  await page.addInitScript((m: GeolocationMode) => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition: (ok: (p: unknown) => void, err: (e: unknown) => void) => {
          if (m === 'denied') {
            setTimeout(() => err({ code: 1, PERMISSION_DENIED: 1 }), 30)
          } else {
            setTimeout(
              () => ok({ coords: { latitude: 21.0286, longitude: 105.8543, accuracy: 10 } }),
              30,
            )
          }
          return 1
        },
        clearWatch: () => {},
      },
    })
  }, mode)
}

/** Mở /nhom-di-chung và vào thẳng chuyến mẫu, chờ giao diện trong chuyến dựng xong. */
export async function openLiveLocationTrip(
  page: Page,
  theme: ThemeName,
  geolocation: GeolocationMode = 'fixed',
): Promise<void> {
  const state = buildTripState()
  await stubGeolocation(page, geolocation)

  await page.route('**/api/location*', (route) => {
    // Cùng một đường dẫn phục vụ hai việc: có `sessionId` là hỏi toàn cảnh 1 chuyến,
    // không có là hỏi danh sách chuyến đang mở của tôi.
    const body = route.request().url().includes('sessionId=')
      ? { state }
      : {
          sessions: [
            {
              sessionId: state.sessionId,
              name: state.name,
              inviteCode: state.inviteCode,
              expiresAt: state.expiresAt,
              memberCount: state.members.length,
            },
          ],
        }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })

  await mockLogin(page, 'vi', theme)
  await page.goto('/nhom-di-chung', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Đi cà phê Bờ Hồ/ }).click()
  await expect(page.getByRole('button', { name: /chia sẻ vị trí/i })).toBeVisible()
}
