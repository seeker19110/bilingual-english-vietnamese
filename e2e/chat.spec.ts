// e2e/chat.spec.ts — E2E tests for Friends & Real-time User-to-User Chat (PR 3/3)
import { test, expect } from '@playwright/test'
import { mockLogin, USER_ID } from './helpers/auth'

const MOCK_FRIEND = {
  id: '33333333-3333-3333-3333-333333333333',
  name: 'Tran Thi Mai',
}

const MOCK_ROOM_ID = '11111111-1111-1111-1111-111111111111'

test.describe('Friends & Real-time Chat E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page)

    // Mock Friends API (/api/friends)
    await page.route('**/api/friends*', async (route) => {
      const url = new URL(route.request().url())
      const lookup = url.searchParams.get('lookup')

      if (route.request().method() === 'GET') {
        if (lookup) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ user: MOCK_FRIEND }),
          })
          return
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'MYCODE99',
            friends: [MOCK_FRIEND],
          }),
        })
        return
      }

      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            alreadyFriends: false,
            friend: MOCK_FRIEND,
          }),
        })
        return
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    })

    // Mock Chat REST API (/api/chat)
    await page.route('**/api/chat*', async (route) => {
      const url = new URL(route.request().url())
      const roomId = url.searchParams.get('roomId')

      if (route.request().method() === 'GET') {
        if (roomId) {
          const messages = [
            {
              id: 'msg-e2e-1',
              roomId: MOCK_ROOM_ID,
              senderId: MOCK_FRIEND.id,
              senderName: MOCK_FRIEND.name,
              content: 'Chào bạn, chúc một ngày tốt lành!',
              createdAt: '2026-08-18T07:00:00.000Z',
            },
            {
              id: 'msg-e2e-2',
              roomId: MOCK_ROOM_ID,
              senderId: USER_ID,
              senderName: 'E2E User',
              content: 'Chào Mai! Mình đang học bài.',
              createdAt: '2026-08-18T07:05:00.000Z',
            },
          ]
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ messages }),
          })
          return
        }

        // List rooms
        const rooms = [
          {
            roomId: MOCK_ROOM_ID,
            peer: MOCK_FRIEND,
            lastMessage: {
              id: 'msg-e2e-2',
              roomId: MOCK_ROOM_ID,
              senderId: USER_ID,
              senderName: 'E2E User',
              content: 'Chào Mai! Mình đang học bài.',
              createdAt: '2026-08-18T07:05:00.000Z',
            },
            unreadCount: 0,
          },
        ]
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ rooms }),
        })
        return
      }

      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ roomId: MOCK_ROOM_ID }),
        })
        return
      }

      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
        return
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    })
  })

  test('Luồng Bạn bè: xem mã kết bạn và bấm "Nhắn tin" chuyển đến /tin-nhan', async ({ page }) => {
    await page.goto('/ban-be')
    await page.waitForLoadState('networkidle')

    // Kiểm tra hiển thị mã kết bạn của mình
    await expect(page.locator('text=MYCODE99')).toBeVisible()

    // Kiểm tra danh sách bạn bè
    await expect(page.locator(`text=${MOCK_FRIEND.name}`)).toBeVisible()

    // Bấm nút "Nhắn tin"
    const messageBtn = page.getByRole('link', { name: `Nhắn tin với ${MOCK_FRIEND.name}` })
    await expect(messageBtn).toBeVisible()
    await messageBtn.click()

    // Kiểm tra đã điều hướng sang /tin-nhan
    await expect(page).toHaveURL(new RegExp(`/tin-nhan\\?peerId=${MOCK_FRIEND.id}`))
    await expect(page.locator(`h3:has-text("${MOCK_FRIEND.name}")`)).toBeVisible()
  })

  test('Luồng Kết bạn qua link (/ket-ban/:code): xác nhận kết bạn thành công', async ({ page }) => {
    await page.goto('/ket-ban/FRIEND88')
    await page.waitForLoadState('networkidle')

    // Hiển thị tên bạn bè được tìm thấy từ mã
    await expect(page.locator(`text=${MOCK_FRIEND.name}`)).toBeVisible()

    // Bấm nút "Kết bạn"
    const addBtn = page.getByRole('button', { name: 'Kết bạn', exact: true })
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    // Sau khi kết bạn thành công, hiển thị nút "Nhắn tin ngay"
    await expect(page.locator('text=Đã kết bạn thành công!')).toBeVisible()
    const chatNowLink = page.getByRole('link', { name: 'Nhắn tin ngay' })
    await expect(chatNowLink).toBeVisible()
    await chatNowLink.click()

    await expect(page).toHaveURL(new RegExp(`/tin-nhan\\?peerId=${MOCK_FRIEND.id}`))
  })

  test('Luồng Chat UI (/tin-nhan): hiển thị lịch sử hội thoại, bong bóng tin nhắn và gửi tin mới', async ({
    page,
  }) => {
    await page.goto(`/tin-nhan?roomId=${MOCK_ROOM_ID}`)
    await page.waitForLoadState('networkidle')

    // Kiểm tra danh sách hội thoại bên trái
    await expect(page.locator('h2:has-text("Tin nhắn")')).toBeVisible()
    await expect(page.locator(`aside span:has-text("${MOCK_FRIEND.name}")`).first()).toBeVisible()

    // Kiểm tra tin nhắn trong khung chat
    await expect(page.locator('text=Chào bạn, chúc một ngày tốt lành!')).toBeVisible()
    await expect(page.locator('p.whitespace-pre-wrap:has-text("Chào Mai! Mình đang học bài.")')).toBeVisible()

    // Nhập tin nhắn vào ô soạn thảo
    const input = page.getByRole('textbox', { name: 'Nhập tin nhắn' })
    await expect(input).toBeVisible()
    await input.fill('Tối nay cùng luyện nghe tiếng Anh nhé!')

    // Bấm gửi tin nhắn
    const sendBtn = page.getByRole('button', { name: 'Gửi tin nhắn' })
    await expect(sendBtn).toBeEnabled()
    await sendBtn.click()

    // Ô input được xoá sau khi gửi
    await expect(input).toHaveValue('')
  })

  test('Luồng Chat UI: mở Friends Picker để bắt đầu trò chuyện mới', async ({ page }) => {
    await page.goto('/tin-nhan')
    await page.waitForLoadState('networkidle')

    // Bấm nút "Chat mới"
    const newChatBtn = page.getByRole('button', { name: 'Tạo cuộc trò chuyện mới' })
    await expect(newChatBtn).toBeVisible()
    await newChatBtn.click()

    // Hiển thị danh sách bạn bè để chọn
    await expect(page.locator('text=Chọn bạn bè để nhắn tin')).toBeVisible()
    const friendItem = page.locator('aside ul button', { hasText: MOCK_FRIEND.name })
    await expect(friendItem).toBeVisible()
    await friendItem.click()

    // Cửa sổ chat mở phòng tương ứng
    await expect(page.locator(`h3:has-text("${MOCK_FRIEND.name}")`)).toBeVisible()
  })

  test('Luồng Profile: có thẻ "Tin nhắn" trong Không gian chuyên biệt', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    const chatCard = page.locator('button', { hasText: 'Tin nhắn' })
    await expect(chatCard).toBeVisible()
    await chatCard.click()

    await expect(page).toHaveURL('/tin-nhan')
  })
})
