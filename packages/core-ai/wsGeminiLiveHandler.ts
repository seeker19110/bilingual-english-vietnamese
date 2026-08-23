// packages/core-ai/wsGeminiLiveHandler.ts — WebSocket Server cho Gemini Live Audio Streaming V7.2
// Gắn vào http.Server tại route /ws/gemini-live, proxy audio song công với xác thực cookie.
import type { Server as HttpServer, IncomingMessage } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import { validateAuth } from '@dhcb/core-auth/security'
import {
  createGeminiLiveSession,
  removeGeminiLiveSession,
  GeminiLiveSession,
} from './geminiLiveService.js'
import {
  GeminiLiveClientPacketSchema,
  type GeminiLiveClientPacket,
  type GeminiLiveServerPacket,
} from '@dhcb/core-contracts/geminiLive'

export const WS_GEMINI_LIVE_PATH = '/ws/gemini-live'

const activeLiveSockets = new Map<WebSocket, GeminiLiveSession>()

async function authenticateUpgrade(req: IncomingMessage): Promise<{ userId: string } | null> {
  const cookie = req.headers.cookie ?? ''
  const fakeRequest = new Request('http://localhost' + WS_GEMINI_LIVE_PATH, { headers: { cookie } })
  return validateAuth(fakeRequest)
}

export function _resetWsGeminiLiveHandlerStateForTests(): void {
  for (const session of activeLiveSockets.values()) {
    session.close()
  }
  activeLiveSockets.clear()
}

/** Gắn WebSocket server Gemini Live vào httpServer */
export function attachGeminiLiveWebSocketServer(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (url.pathname !== WS_GEMINI_LIVE_PATH) return // Nhường các WebSocket route khác

    authenticateUpgrade(req)
      .then((auth) => {
        if (!auth) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
          socket.destroy()
          return
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req, auth)
        })
      })
      .catch((err) => {
        console.error('[wsGeminiLiveHandler] Upgrade error:', err)
        socket.destroy()
      })
  })

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, auth: { userId: string }) => {
    const sessionId = `live-${auth.userId}-${Date.now()}`
    const session = createGeminiLiveSession({
      sessionId,
      personId: auth.userId,
    })

    activeLiveSockets.set(ws, session)

    session.on('packet', (packet: GeminiLiveServerPacket) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(packet))
      }
    })

    session.start()

    ws.on('message', (rawData, isBinary) => {
      try {
        if (isBinary) {
          session.handleUserAudioChunk(Buffer.from(rawData as Buffer))
          return
        }

        const parsed = JSON.parse(rawData.toString())
        const validation = GeminiLiveClientPacketSchema.safeParse(parsed)
        if (!validation.success) {
          ws.send(JSON.stringify({ type: 'error', errorMessage: 'Invalid client packet' }))
          return
        }

        const packet: GeminiLiveClientPacket = validation.data
        switch (packet.type) {
          case 'realtime_input':
            for (const chunk of packet.mediaChunks) {
              session.handleUserAudioChunk(chunk.data)
            }
            break
          case 'interrupt':
            session.interrupt()
            break
          case 'client_content':
          case 'setup':
            // Configuration / Text context
            break
        }
      } catch (err) {
        console.error('[wsGeminiLiveHandler] Error handling message:', err)
      }
    })

    const handleClose = () => {
      session.close()
      removeGeminiLiveSession(sessionId)
      activeLiveSockets.delete(ws)
    }

    ws.on('close', handleClose)
    ws.on('error', handleClose)
  })
}
