// CodeEditor — ô soạn code Python dùng CodeMirror 6 (PR-L2 môn Lập trình).
// CodeMirror chỉ nằm trong chunk lazy của trang Lập trình (không vào bundle chính).
// Mobile-first: chữ 16px (tránh iOS tự zoom), theme tối khớp nền zinc-950 của app.
import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import { EditorState } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

interface Props {
  value: string
  onChange: (code: string) => void
  /** Nhãn cho screen reader (a11y). */
  ariaLabel: string
}

// Editor dùng NỀN TỐI CỐ ĐỊNH ở mọi theme (như các code editor quen thuộc) — nên màu
// chữ/syntax cũng cố định, KHÔNG theo token theme. Bảng màu chọn để mọi loại token đạt
// tương phản AA (≥ 4.5:1) trên nền #0a0a0a — gác bằng e2e/a11y.spec.ts.
const editorTheme = EditorView.theme(
  {
    '&': {
      fontSize: '16px',
      backgroundColor: '#0a0a0a',
      color: '#e5e5e5',
      minHeight: '220px',
    },
    '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
    '.cm-gutters': { backgroundColor: '#0a0a0a', border: 'none', color: '#a1a1aa' },
    '.cm-activeLine': { backgroundColor: '#ffffff0d' },
    '.cm-activeLineGutter': { backgroundColor: '#ffffff0d' },
    '.cm-cursor': { borderLeftColor: '#e5e5e5' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: '#3b82f640',
    },
    '&.cm-focused': { outline: 'none' },
  },
  { dark: true },
)

// Bảng màu syntax (lấy theo GitHub Dark — các mã màu đều ≥ 4.5:1 trên #0a0a0a).
const editorHighlight = HighlightStyle.define([
  { tag: tags.comment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.string, color: '#a5d6ff' },
  { tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword], color: '#ff9bce' },
  { tag: [tags.number, tags.bool], color: '#79c0ff' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#d2a8ff' },
  { tag: tags.variableName, color: '#e5e5e5' },
  { tag: [tags.operator, tags.punctuation], color: '#d4d4d8' },
])

export default function CodeEditor({ value, onChange, ariaLabel }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  // Giữ onChange mới nhất trong ref để không phải dựng lại editor mỗi lần re-render
  // (cập nhật trong effect, không gán lúc render — rule react-hooks/refs).
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!hostRef.current) return
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          python(),
          editorTheme,
          syntaxHighlighting(editorHighlight),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString())
          }),
        ],
      }),
      parent: hostRef.current,
    })
    view.contentDOM.setAttribute('aria-label', ariaLabel)
    viewRef.current = view
    return () => view.destroy()
    // Chỉ dựng 1 lần khi mount — value cập nhật từ ngoài xử lý ở effect dưới.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Khi value đổi TỪ BÊN NGOÀI (chọn bài mẫu khác) → thay toàn bộ nội dung editor.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    }
  }, [value])

  return (
    <div
      ref={hostRef}
      // Nền tối cố định (không theo theme) — khớp editorTheme ở trên.
      className="rounded-2xl border border-zinc-800 bg-[#0a0a0a] overflow-hidden"
    />
  )
}
