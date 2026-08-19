// apps/english/src/lib/useRealtimeVoice.ts — Hook quản lý đàm thoại duplex thời gian thực qua WebSocket
import { useState, useRef, useCallback, useEffect } from 'react'

export type RealtimeVoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted'

export interface RealtimeVoiceOptions {
  onStateChange?: (state: RealtimeVoiceState) => void
  onTranscript?: (text: string, sender: 'user' | 'companion', isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useRealtimeVoice(options: RealtimeVoiceOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [voiceState, setVoiceState] = useState<RealtimeVoiceState>('idle')
  const [userTranscript, setUserTranscript] = useState('')
  const [companionTranscript, setCompanionTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const stopSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setIsConnected(false)
    setVoiceState('idle')
    setAudioLevel(0)
  }, [])

  const startSession = useCallback(async () => {
    try {
      setErrorMessage(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      mediaStreamRef.current = stream

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioCtx = new AudioCtx()
      audioContextRef.current = audioCtx

      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // Theo dõi âm lượng micro
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] ?? 0
        }
        const avg = dataArray.length > 0 ? sum / dataArray.length / 255 : 0
        setAudioLevel(avg)
        animFrameRef.current = requestAnimationFrame(updateVolume)
      }
      updateVolume()

      // Kết nối WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/voice-companion`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setVoiceState('listening')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'state_changed' && data.state) {
            setVoiceState(data.state)
            options.onStateChange?.(data.state)
          } else if (data.type === 'transcript') {
            if (data.sender === 'user') {
              setUserTranscript(data.text ?? '')
            } else {
              setCompanionTranscript(data.text ?? '')
            }
            options.onTranscript?.(
              data.text ?? '',
              data.sender ?? 'companion',
              data.isFinal ?? false,
            )
          } else if (data.type === 'error') {
            setErrorMessage(data.error ?? 'Lỗi không xác định')
            options.onError?.(data.error)
          }
        } catch (err) {
          console.error('[useRealtimeVoice] Failed to parse ws message:', err)
        }
      }

      ws.onerror = () => {
        setErrorMessage('Không thể kết nối đến máy chủ đàm thoại')
      }

      ws.onclose = () => {
        stopSession()
      }
    } catch (err) {
      console.error('[useRealtimeVoice] Error starting session:', err)
      setErrorMessage('Không thể truy cập microphone hoặc khởi tạo âm thanh')
      stopSession()
    }
  }, [options, stopSession])

  const interrupt = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'voice:interrupt' }))
    }
    setVoiceState('listening')
  }, [])

  useEffect(() => {
    return () => {
      stopSession()
    }
  }, [stopSession])

  return {
    isConnected,
    voiceState,
    userTranscript,
    companionTranscript,
    audioLevel,
    errorMessage,
    startSession,
    stopSession,
    interrupt,
  }
}
