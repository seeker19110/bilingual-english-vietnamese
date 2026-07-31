// Lưu và đọc ngôn ngữ giao diện (vi / en) từ localStorage
export type UiLang = 'vi' | 'en'

const KEY = 'ui_lang'

export function getUiLang(): UiLang {
  return (localStorage.getItem(KEY) as UiLang) ?? 'vi'
}

export function setUiLang(lang: UiLang) {
  localStorage.setItem(KEY, lang)
}
