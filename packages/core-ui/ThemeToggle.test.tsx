import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ThemeToggle } from './ThemeToggle'
import { ThemeContext } from './themeContext'

describe('ThemeToggle', () => {
  it('khi locked = false → render nút đổi giao diện với nhãn tiếng Việt mặc định', () => {
    const html = renderToStaticMarkup(
      <ThemeContext.Provider value={{ theme: 'dark-blue', setTheme: () => {}, locked: false }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    )
    expect(html).toContain('<button')
    expect(html).toContain('Xanh đêm')
    expect(html).toContain('Blue sky')
  })

  it('khi locked = false và lang = "en" → render với nhãn tiếng Anh', () => {
    const html = renderToStaticMarkup(
      <ThemeContext.Provider value={{ theme: 'dark-blue', setTheme: () => {}, locked: false }}>
        <ThemeToggle lang="en" />
      </ThemeContext.Provider>,
    )
    expect(html).toContain('Night blue')
    expect(html).toContain('Change theme')
  })

  it('khi locked = true (Nhi đồng) → ẩn hẳn nút (render null)', () => {
    const html = renderToStaticMarkup(
      <ThemeContext.Provider value={{ theme: 'kid', setTheme: () => {}, locked: true }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    )
    expect(html).toBe('')
  })
})
