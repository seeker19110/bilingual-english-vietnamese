// Đến lượt người dùng trong chế độ đóng vai → nút ghi âm thay vì phát TTS (+ Dừng ghi âm /
// Bỏ qua). Tách từ LessonView.tsx (2026-09-06), JSX giữ nguyên.
import { Square, Mic } from 'lucide-react'

type Props = {
  isA: boolean
  canRecord: boolean
  rpRecording: boolean
  rpTranscribing: boolean
  beginRolePlayRecording: () => Promise<void>
  finishRolePlayRecording: () => Promise<void>
  skipRolePlayLine: () => void
}

export function RolePlayTurnControls({
  isA,
  canRecord,
  rpRecording,
  rpTranscribing,
  beginRolePlayRecording,
  finishRolePlayRecording,
  skipRolePlayLine,
}: Props) {
  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/60">
      {rpTranscribing ? (
        <span className="text-xs text-zinc-400">
          {isA ? 'Đang nhận diện...' : 'Transcribing...'}
        </span>
      ) : rpRecording ? (
        <button
          onClick={() => void finishRolePlayRecording()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 theme-light:text-red-700 text-xs font-semibold animate-pulse transition"
        >
          <Square className="w-3 h-3 fill-current" />
          {isA ? 'Dừng ghi âm' : 'Stop recording'}
        </button>
      ) : (
        <button
          onClick={() => void beginRolePlayRecording()}
          disabled={!canRecord}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 disabled:opacity-50 text-violet-300 theme-light:text-violet-800 text-xs font-semibold transition"
        >
          <Mic className="w-3.5 h-3.5" />
          {isA ? 'Bấm để nói câu này' : 'Tap to say this line'}
        </button>
      )}
      {!rpRecording && !rpTranscribing && (
        <button
          onClick={skipRolePlayLine}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          {isA ? 'Bỏ qua' : 'Skip'}
        </button>
      )}
    </div>
  )
}
