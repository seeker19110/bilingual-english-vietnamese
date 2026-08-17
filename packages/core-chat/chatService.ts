// packages/core-chat/chatService.ts — Business logic cho user-to-user chat.
//
// Tất cả mutation qua getPgPool() (write pool).
// Query đọc lịch sử qua getPgReadPool() (read replica nếu có, fallback về write).
//
// Quy tắc:
//   - KHÔNG để AI output trực tiếp vào chat messages
//   - KHÔNG tự động thay đổi billing/permissions
//   - Mọi input phải qua Zod validation trước khi đến đây

import { getPgPool, getPgReadPool } from '../core-db/pgPool.js'
import { moderateContent } from './moderator.js'
import type {
  ChatMessage,
  RoomSummary,
  UserSearchResult,
  RoomMember,
} from '../core-contracts/chat.js'

// ── Types internal ───────────────────────────────────────────────────────────

interface MessageRow {
  id: string
  room_id: string
  sender_id: string | null
  sender_name: string
  sender_nickname: string | null
  content: string
  content_clean: string | null
  is_blocked: boolean
  created_at: Date
  edited_at: Date | null
}

interface RoomRow {
  id: string
  is_group: boolean
  name: string | null
  created_at: Date
}

// ── Helper: convert DB row → ChatMessage ─────────────────────────────────────

function rowToMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderNickname: row.sender_nickname,
    content: row.content_clean ?? row.content,
    isFiltered: row.content_clean !== null,
    createdAt: row.created_at.toISOString(),
    editedAt: row.edited_at?.toISOString() ?? null,
  }
}

// ── createOrGetDmRoom ─────────────────────────────────────────────────────────

/**
 * Lấy hoặc tạo DM room giữa 2 users.
 * Idempotent: gọi nhiều lần vẫn trả cùng room.
 * @returns roomId (uuid)
 */
export async function createOrGetDmRoom(userAId: string, userBId: string): Promise<string> {
  const pool = getPgPool()

  // Tìm DM room đã tồn tại giữa 2 user này
  const existing = await pool.query<{ room_id: string }>(
    `SELECT rm1.room_id
     FROM chat.room_members rm1
     JOIN chat.room_members rm2 ON rm1.room_id = rm2.room_id
     JOIN chat.rooms r ON r.id = rm1.room_id
     WHERE rm1.user_id = $1
       AND rm2.user_id = $2
       AND r.is_group = false
     LIMIT 1`,
    [userAId, userBId],
  )

  if (existing.rows[0]) return existing.rows[0].room_id

  // Tạo room mới
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO chat.rooms (is_group, created_by) VALUES (false, $1) RETURNING id`,
      [userAId],
    )
    const roomId = rows[0]!.id
    await client.query(
      `INSERT INTO chat.room_members (room_id, user_id) VALUES ($1, $2), ($1, $3)`,
      [roomId, userAId, userBId],
    )
    await client.query('COMMIT')
    return roomId
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ── sendMessage ───────────────────────────────────────────────────────────────

export interface SendMessageResult {
  message: ChatMessage | null
  blocked: boolean
  moderationMatches: string[]
}

/**
 * Gửi một message vào room sau khi kiểm tra:
 *   1. User có phải member của room không
 *   2. User có đang bị suspend không
 *   3. Content moderation
 * @returns SendMessageResult
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  rawContent: string,
): Promise<SendMessageResult> {
  const pool = getPgPool()

  // 1. Kiểm tra membership
  const memberCheck = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM chat.room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, senderId],
  )
  if (memberCheck.rows.length === 0) {
    throw new Error('ROOM_NOT_MEMBER')
  }

  // 2. Kiểm tra suspension
  const suspendCheck = await pool.query<{ expires_at: Date }>(
    `SELECT expires_at FROM chat.suspensions WHERE user_id = $1 AND expires_at > now()`,
    [senderId],
  )
  if (suspendCheck.rows.length > 0) {
    throw new Error('USER_SUSPENDED')
  }

  // 3. Content moderation
  const modResult = moderateContent(rawContent)

  // Lấy thông tin sender để build ChatMessage
  const senderRow = await pool.query<{
    name: string
    nickname: string | null
  }>(
    `SELECT p.name, p.nickname
     FROM public.profiles p
     WHERE p.id = $1`,
    [senderId],
  )
  const senderName = senderRow.rows[0]?.name ?? 'User'
  const senderNickname = senderRow.rows[0]?.nickname ?? null

  // 4. Persist message
  const insertResult = await pool.query<{ id: string; created_at: Date }>(
    `INSERT INTO chat.messages
       (room_id, sender_id, content, content_clean, moderation_flags, is_blocked)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at`,
    [
      roomId,
      senderId,
      rawContent,
      modResult.severity !== 'none' && !modResult.blocked ? modResult.clean : null,
      modResult.severity !== 'none'
        ? JSON.stringify({ severity: modResult.severity, matches: modResult.matches })
        : null,
      modResult.blocked,
    ],
  )
  const msgId = insertResult.rows[0]!.id
  const createdAt = insertResult.rows[0]!.created_at

  // 5. Log moderation event nếu có vi phạm
  if (modResult.severity !== 'none') {
    void pool
      .query(
        `INSERT INTO chat.moderation_events (user_id, message_id, severity, matched, action)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          senderId,
          msgId,
          modResult.severity,
          modResult.matches,
          modResult.blocked ? 'blocked' : 'filtered',
        ],
      )
      .catch((err: unknown) => {
        console.error('[chatService] Lỗi log moderation event:', err)
      })

    // 6. Kiểm tra có cần suspend không (≥ 10 lần 'high' trong 24h)
    if (modResult.blocked) {
      void checkAndMaybeSuspend(senderId, pool).catch((err: unknown) => {
        console.error('[chatService] Lỗi check suspension:', err)
      })
    }
  }

  if (modResult.blocked) {
    return { message: null, blocked: true, moderationMatches: modResult.matches }
  }

  const message: ChatMessage = {
    id: msgId,
    roomId,
    senderId,
    senderName,
    senderNickname,
    content: modResult.severity !== 'none' ? modResult.clean : rawContent,
    isFiltered: modResult.severity !== 'none',
    createdAt: createdAt.toISOString(),
    editedAt: null,
  }

  return { message, blocked: false, moderationMatches: modResult.matches }
}

// ── checkAndMaybeSuspend ──────────────────────────────────────────────────────

async function checkAndMaybeSuspend(
  userId: string,
  pool: ReturnType<typeof getPgPool>,
): Promise<void> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT count(*) FROM chat.moderation_events
     WHERE user_id = $1
       AND severity = 'high'
       AND created_at > now() - interval '24 hours'`,
    [userId],
  )
  const count = parseInt(rows[0]?.count ?? '0', 10)

  if (count >= 10) {
    // Suspend 24h
    await pool.query(
      `INSERT INTO chat.suspensions (user_id, reason, expires_at)
       VALUES ($1, $2, now() + interval '24 hours')
       ON CONFLICT (user_id) DO UPDATE SET expires_at = now() + interval '24 hours', reason = $2`,
      [userId, `Tự động: ${count} vi phạm nặng trong 24h`],
    )
  }
}

// ── getMessages ───────────────────────────────────────────────────────────────

/**
 * Lấy lịch sử messages của một room (paginated, newest first).
 * @param cursor - ISO datetime của tin nhắn cũ nhất đã tải (để load thêm về quá khứ)
 */
export async function getMessages(
  roomId: string,
  requestingUserId: string,
  cursor?: string,
  limit = 30,
): Promise<ChatMessage[]> {
  const pool = getPgReadPool()

  // Kiểm tra membership
  const memberCheck = await pool.query(
    `SELECT 1 FROM chat.room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, requestingUserId],
  )
  if (memberCheck.rows.length === 0) throw new Error('ROOM_NOT_MEMBER')

  const params: (string | number)[] = [roomId, limit]
  let cursorClause = ''
  if (cursor) {
    cursorClause = `AND m.created_at < $3`
    params.push(cursor)
  }

  const { rows } = await pool.query<MessageRow>(
    `SELECT
       m.id, m.room_id, m.sender_id,
       COALESCE(p.name, 'User') AS sender_name,
       p.nickname AS sender_nickname,
       m.content, m.content_clean, m.is_blocked,
       m.created_at, m.edited_at
     FROM chat.messages m
     LEFT JOIN public.profiles p ON p.id = m.sender_id
     WHERE m.room_id = $1
       AND m.deleted_at IS NULL
       AND m.is_blocked = false
       ${cursorClause}
     ORDER BY m.created_at DESC
     LIMIT $2`,
    params,
  )

  // Trả về theo thứ tự cũ → mới (UI thường hiển thị vậy)
  return rows.reverse().map(rowToMessage)
}

// ── getRooms ──────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách phòng chat của user, kèm tin nhắn cuối + unread count.
 */
export async function getRooms(userId: string): Promise<RoomSummary[]> {
  const pool = getPgReadPool()

  const { rows } = await pool.query<
    RoomRow & {
      last_read_at: Date
      unread_count: string
    }
  >(
    `SELECT
       r.id, r.is_group, r.name, r.created_at,
       rm.last_read_at,
       (
         SELECT count(*) FROM chat.messages m2
         WHERE m2.room_id = r.id
           AND m2.created_at > rm.last_read_at
           AND m2.is_blocked = false
           AND m2.deleted_at IS NULL
           AND m2.sender_id != $1
       ) AS unread_count
     FROM chat.rooms r
     JOIN chat.room_members rm ON rm.room_id = r.id AND rm.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId],
  )

  const results: RoomSummary[] = []

  for (const row of rows) {
    // Lấy thành viên
    const membersRes = await pool.query<{
      user_id: string
      name: string
      nickname: string | null
    }>(
      `SELECT rm.user_id, COALESCE(p.name, 'User') AS name, p.nickname
       FROM chat.room_members rm
       LEFT JOIN public.profiles p ON p.id = rm.user_id
       WHERE rm.room_id = $1`,
      [row.id],
    )

    const members: RoomMember[] = membersRes.rows.map((m) => ({
      userId: m.user_id,
      name: m.name,
      nickname: m.nickname,
    }))

    // Lấy tin nhắn cuối
    const lastMsgRes = await pool.query<MessageRow>(
      `SELECT
         m.id, m.room_id, m.sender_id,
         COALESCE(p.name, 'User') AS sender_name,
         p.nickname AS sender_nickname,
         m.content, m.content_clean, m.is_blocked,
         m.created_at, m.edited_at
       FROM chat.messages m
       LEFT JOIN public.profiles p ON p.id = m.sender_id
       WHERE m.room_id = $1
         AND m.deleted_at IS NULL
         AND m.is_blocked = false
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [row.id],
    )

    results.push({
      id: row.id,
      isGroup: row.is_group,
      name: row.name,
      members,
      lastMessage: lastMsgRes.rows[0] ? rowToMessage(lastMsgRes.rows[0]) : null,
      unreadCount: parseInt(row.unread_count, 10),
      lastReadAt: row.last_read_at.toISOString(),
    })
  }

  return results
}

// ── markRead ──────────────────────────────────────────────────────────────────

/**
 * Đánh dấu user đã đọc đến messageId trong room.
 */
export async function markRead(roomId: string, userId: string, messageId: string): Promise<void> {
  const pool = getPgPool()

  // Lấy created_at của message để set last_read_at
  const msgRes = await pool.query<{ created_at: Date }>(
    `SELECT created_at FROM chat.messages WHERE id = $1 AND room_id = $2`,
    [messageId, roomId],
  )
  if (!msgRes.rows[0]) return

  await pool.query(
    `UPDATE chat.room_members
     SET last_read_at = $1
     WHERE room_id = $2 AND user_id = $3
       AND last_read_at < $1`,
    [msgRes.rows[0].created_at, roomId, userId],
  )
}

// ── searchUsers ───────────────────────────────────────────────────────────────

/**
 * Tìm user theo nickname hoặc tên để bắt đầu DM.
 * Trả tối đa 10 kết quả. Không trả chính user đang tìm.
 */
export async function searchUsers(
  query: string,
  currentUserId: string,
): Promise<UserSearchResult[]> {
  const pool = getPgReadPool()

  const { rows } = await pool.query<{
    id: string
    name: string
    nickname: string | null
    plan: string
  }>(
    `SELECT u.id, p.name, p.nickname, p.plan
     FROM public.users u
     JOIN public.profiles p ON p.id = u.id
     WHERE u.id != $1
       AND (
         p.nickname ILIKE $2
         OR p.name ILIKE $2
       )
       AND u.email_verified IS NOT NULL
     ORDER BY
       CASE WHEN p.nickname ILIKE $3 THEN 0 ELSE 1 END,
       p.name
     LIMIT 10`,
    [currentUserId, `%${query}%`, `${query}%`],
  )

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nickname: r.nickname,
    plan: r.plan,
  }))
}

// ── deleteMessage ─────────────────────────────────────────────────────────────

/**
 * Soft delete message (chỉ sender mới xóa được message của mình).
 */
export async function deleteMessage(messageId: string, requestingUserId: string): Promise<boolean> {
  const pool = getPgPool()
  const { rowCount } = await pool.query(
    `UPDATE chat.messages
     SET deleted_at = now()
     WHERE id = $1
       AND sender_id = $2
       AND deleted_at IS NULL`,
    [messageId, requestingUserId],
  )
  return (rowCount ?? 0) > 0
}

// ── getUserSuspensionStatus ───────────────────────────────────────────────────

export async function getUserSuspensionStatus(
  userId: string,
): Promise<{ suspended: boolean; expiresAt?: string }> {
  const pool = getPgReadPool()
  const { rows } = await pool.query<{ expires_at: Date }>(
    `SELECT expires_at FROM chat.suspensions WHERE user_id = $1 AND expires_at > now()`,
    [userId],
  )
  if (rows[0]) {
    return { suspended: true, expiresAt: rows[0].expires_at.toISOString() }
  }
  return { suspended: false }
}
