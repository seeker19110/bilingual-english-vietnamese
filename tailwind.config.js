import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Map màu zinc + white sang CSS variable để đổi theme (light/dark/dark blue)
      // chỉ bằng cách đổi biến trong index.css — không phải sửa lại từng file.
      colors: {
        white: 'rgb(var(--c-white) / <alpha-value>)',
        zinc: {
          50: 'rgb(var(--z-50) / <alpha-value>)',
          100: 'rgb(var(--z-100) / <alpha-value>)',
          200: 'rgb(var(--z-200) / <alpha-value>)',
          300: 'rgb(var(--z-300) / <alpha-value>)',
          400: 'rgb(var(--z-400) / <alpha-value>)',
          500: 'rgb(var(--z-500) / <alpha-value>)',
          600: 'rgb(var(--z-600) / <alpha-value>)',
          700: 'rgb(var(--z-700) / <alpha-value>)',
          800: 'rgb(var(--z-800) / <alpha-value>)',
          900: 'rgb(var(--z-900) / <alpha-value>)',
          950: 'rgb(var(--z-950) / <alpha-value>)',
        },
        // Màu nhấn thương hiệu — đổi theo theme (emerald / sky / pink / fuchsia).
        // Thay cho 'emerald' hard-code cũ: class bg-accent-500, text-accent-400...
        accent: {
          50: 'rgb(var(--a-50) / <alpha-value>)',
          100: 'rgb(var(--a-100) / <alpha-value>)',
          200: 'rgb(var(--a-200) / <alpha-value>)',
          300: 'rgb(var(--a-300) / <alpha-value>)',
          400: 'rgb(var(--a-400) / <alpha-value>)',
          500: 'rgb(var(--a-500) / <alpha-value>)',
          600: 'rgb(var(--a-600) / <alpha-value>)',
          700: 'rgb(var(--a-700) / <alpha-value>)',
          800: 'rgb(var(--a-800) / <alpha-value>)',
          900: 'rgb(var(--a-900) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-up': 'fade-up 0.4s ease-out both',
        'scale-in': 'scale-in 0.25s ease-out both',
        'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    // Biến thể `theme-light:` chỉ áp dụng cho 2 theme NỀN SÁNG (Blue sky, Pink).
    // Dùng để chọn SẮC ĐỘ ĐẬM HƠN cho các màu cố định của Tailwind (amber/sky/teal…)
    // — màu -300/-400 vốn sáng (đọc tốt trên nền tối) nhưng rớt AA trên nền sáng.
    // Theme tối (Xanh đêm, Rực rỡ) không bị ảnh hưởng (không thêm CSS).
    plugin(({ addVariant }) => {
      addVariant('theme-light', ['[data-theme="blue-sky"] &', '[data-theme="pink"] &'])
    }),
  ],
}
