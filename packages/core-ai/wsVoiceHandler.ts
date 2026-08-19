// packages/core-ai/wsVoiceHandler.ts — WebSocket server cho đàm thoại giọng nói hai chiều thời gian thực
// Gắn vào http.Server hiện có tại route /ws/voice-companion, tái dùng xác thực phiên cookie HttpOnly.

import type { Server as HttpServer, IncomingMessage } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import { validateAuth } from '../core-auth/security.js'
import { RealtimeVoiceSession, type VoiceSessionEvent } from './realtimeVoiceService.js'

export const WS_VOICE_PATH = '/ws/voice-companion'

export interface WsVoiceClientMessage {
  type: 'voice:start' | 'voice:audio_chunk' | 'voice:transcript' | 'voice:interrupt' | 'voice:stop'
  audioBase64?: string
  text?: string
  isFinal?: boolean
  sampleRate?: number
}

async function authenticateUpgrade(req: IncomingMessage): Promise<{ userId: string } | null> {
  const cookie = req.headers.cookie ?? ''
  const fakeRequest = new Request('http://localhost' + WS_VOICE_PATH, { headers: { cookie } })
  return validateAuth(fakeRequest)
}

const activeVoiceSessions = new Map<WebSocket, RealtimeVoiceSession>()

export function _resetWsVoiceHandlerStateForTests(): void {
  for (const session of activeVoiceSessions.values()) {
    session.destroy()
  }
  activeVoiceSessions.clear()
}

/** Gắn WebSocket server đàm thoại giọng nói vào httpServer */
export function attachVoiceWebSocketServer(server: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    if (url.pathname !== WS_VOICE_PATH) return // Nhường các WebSocket route khác như /ws/chat

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
        console.error('[wsVoiceHandler] Upgrade error:', err)
        socket.destroy()
      })
  })

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, auth: { userId: string }) => {
    const session = new RealtimeVoiceSession({
      sessionId: `voice-${auth.userId}-${Date.now()}`,
      userId: auth.userId,
    })

    activeVoiceSessions.set(ws, session)

    // Forward các sự kiện từ session về client
    const cleanupListener = session.on((event: VoiceSessionEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event))
      }
    })

    session.start()

    ws.on('message', (rawData, isBinary) => {
      try {
        if (isBinary) {
          // Xử lý buffer âm thanh nhị phân trực tiếp
          session.handleUserAudioChunk(Buffer.from(rawData as Buffer))
          return
        }

        const msg = JSON.parse(rawData.toString()) as WsVoiceClientMessage
        switch (msg.type) {
          case 'voice:audio_chunk':
            if (msg.audioBase64) {
              session.handleUserAudioChunk(Buffer.from(msg.audioBase64, 'base64'))
            }
            break
          case 'voice:transcript':
            if (msg.text) {
              session.pushUserTranscript(msg.text, msg.isFinal ?? false)
            }
            break
          case 'voice:interrupt':
            session.setState('interrupted')
            session.setState('listening')
            break
          case 'voice:stop':
            session.destroy()
            ws.close()
            break
        }
      } catch (err) {
        console.error('[wsVoiceHandler] Error handling client message:', err)
      }
    })

    const handleClose = () => {
      cleanupListener()
      session.destroy()
      activeVoiceSessions.delete(ws)
    }

    ws.on('close', handleClose)
    ws.on('error', handleClose)
  })
}
