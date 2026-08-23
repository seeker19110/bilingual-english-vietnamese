// apps/dhcb/src/lib/geminiLiveApi.ts — Client Hook & API cho Gemini Live Realtime Streaming V7.2
import { useState, useEffect, useRef, useCallback } from 'react'
import type { GeminiLiveServerPacket, GeminiLiveStatus } from '@dhcb/core-contracts/geminiLive'

export function useGeminiLiveSession() {
  const [status, setStatus] = useState<GeminiLiveStatus>('idle')
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    try {
      setStatus('connecting')
      setError(null)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/gemini-live`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('active')
      }

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data) as GeminiLiveServerPacket
          if (packet.type === 'session_ready') {
            setStatus('active')
          } else if (packet.type === 'fallback') {
            setStatus('fallback_mode')
            if (packet.textDelta) setTranscript((prev) => prev + packet.textDelta)
          } else if (packet.type === 'text_delta') {
            if (packet.textDelta) setTranscript((prev) => prev + packet.textDelta)
          } else if (packet.type === 'interrupted') {
            setStatus('barge_in')
          } else if (packet.type === 'error') {
            setError(packet.errorMessage || 'Lỗi phiên Gemini Live')
            setStatus('error')
          }
        } catch {
          // Binary audio packet
        }
      }

      ws.onerror = () => {
        setError('Không thể kết nối đến máy chủ Gemini Live. Tự động chuyển sang chế độ dự phòng.')
        setStatus('fallback_mode')
      }

      ws.onclose = () => {
        setStatus('closed')
      }
    } catch (err) {
      setError(String(err))
      setStatus('fallback_mode')
    }
  }, [])

  const sendAudioChunk = useCallback((base64Pcm: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'realtime_input',
          mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64Pcm }],
        }),
      )
    }
  }, [])

  const interrupt = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus('closed')
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    status,
    transcript,
    error,
    connect,
    sendAudioChunk,
    interrupt,
    disconnect,
  }
}
