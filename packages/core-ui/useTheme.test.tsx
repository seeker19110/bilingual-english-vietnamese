import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { useTheme } from './useTheme.js'
import { ThemeContext } from './themeContext.js'

function Consumer() {
  const { theme, locked } = useTheme()
  return (
    <span>
      {theme}-{String(locked)}
    </span>
  )
}

describe('useTheme', () => {
  it('có ThemeContext.Provider bao ngoài → đọc đúng giá trị context', () => {
    const html = renderToStaticMarkup(
      <ThemeContext.Provider value={{ theme: 'pink', setTheme: () => {}, locked: false }}>
        <Consumer />
      </ThemeContext.Provider>,
    )
    expect(html).toContain('pink-false')
  })

  it('KHÔNG có Provider bao ngoài → throw lỗi rõ ràng thay vì context rỗng âm thầm', () => {
    expect(() => renderToStaticMarkup(<Consumer />)).toThrow(
      'useTheme must be used inside ThemeProvider',
    )
  })
})
