// api/memory-palace.ts — REST handler cho Spatial Memory Palace & Method of Loci.
import { jsonResponse } from './_lib/http.js'
import { validateAuth, getCorsHeaders } from '../packages/core-auth/security.js'
import { MemoryPalaceService } from '../packages/core-ai/memoryPalaceService.js'
import { MemoryPalaceRoom, MemoryPalaceState } from '../packages/core-contracts/memoryPalace.js'

const userPalaceMap = new Map<string, MemoryPalaceRoom[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  if (!auth) {
    return jsonResponse(
      {
        error: 'Unauthorized',
        message: 'Yêu cầu đăng nhập để truy cập Cung điện Trí nhớ Không gian.',
      },
      401,
    )
  }

  const personId = auth.userId
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // Đảm bảo user có ít nhất 1 phòng mặc định
  if (!userPalaceMap.has(personId)) {
    const defaultRoom = MemoryPalaceService.createMemoryPalaceRoom(personId, {
      name: 'Đại Sảnh Thư Viện Cổ Điển',
      theme: 'knowledge_library',
      description: 'Lưu trữ các cấu trúc ngữ âm, từ vựng C1/C2 và các quy luật ghi nhớ đỉnh cao.',
    })
    userPalaceMap.set(personId, [defaultRoom])
  }

  if (req.method === 'GET') {
    const rooms = userPalaceMap.get(personId) || []
    const totalMastered = rooms.reduce((acc, r) => acc + r.masteredAnchorsCount, 0)
    const avgRetention =
      rooms.length > 0
        ? Math.round(rooms.reduce((acc, r) => acc + r.averageRetentionRate, 0) / rooms.length)
        : 80

    const state: MemoryPalaceState = {
      rooms,
      totalMasteredAnchors: totalMastered,
      overallRetentionIndex: avgRetention,
      activeRoomId: rooms[0]?.id,
    }

    return jsonResponse({ success: true, state }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'create_room') {
        const { name, theme, description, initialConcepts } = body
        if (!name || !theme) {
          return jsonResponse({ error: 'Missing name or theme' }, 400)
        }

        const newRoom = MemoryPalaceService.createMemoryPalaceRoom(personId, {
          name,
          theme,
          description,
          initialConcepts,
        })

        const currentRooms = userPalaceMap.get(personId) || []
        currentRooms.push(newRoom)
        userPalaceMap.set(personId, currentRooms)

        return jsonResponse({ success: true, room: newRoom }, 200)
      }

      if (action === 'verify_recall') {
        const { roomId, locusId, userRecallText } = body
        if (!roomId || !locusId || !userRecallText) {
          return jsonResponse({ error: 'Missing roomId, locusId or userRecallText' }, 400)
        }

        const currentRooms = userPalaceMap.get(personId) || []
        const targetRoom = currentRooms.find((r) => r.id === roomId)
        if (!targetRoom) {
          return jsonResponse({ error: 'Room not found' }, 404)
        }

        const targetLocus = targetRoom.loci.find((l) => l.id === locusId)
        if (!targetLocus) {
          return jsonResponse({ error: 'Locus anchor not found' }, 404)
        }

        const recallResult = MemoryPalaceService.verifyLocusRecall(targetLocus, userRecallText)

        // Cập nhật trạng thái locus
        targetLocus.retentionStrength = recallResult.strengthenedRetention
        targetLocus.lastRecalledAt = new Date().toISOString()
        if (recallResult.isAccurate) {
          targetLocus.mastered = true
        }

        targetRoom.masteredAnchorsCount = targetRoom.loci.filter((l) => l.mastered).length
        targetRoom.averageRetentionRate = Math.round(
          targetRoom.loci.reduce((acc, l) => acc + l.retentionStrength, 0) / targetRoom.loci.length,
        )
        targetRoom.updatedAt = new Date().toISOString()

        return jsonResponse({ success: true, result: recallResult, updatedLocus: targetLocus }, 200)
      }

      return jsonResponse({ error: 'Unknown action' }, 400)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return jsonResponse({ error: 'Failed to process request', details: msg }, 500)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
