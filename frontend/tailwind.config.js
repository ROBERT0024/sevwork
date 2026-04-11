/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surfaceHover: 'var(--surface-hover)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        primaryLight: 'var(--primary-light)',
        textMain: 'var(--text-main)',
        textMuted: 'var(--text-muted)',
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 4px 20px rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
