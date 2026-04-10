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
        background: '#040914', // Fondo base muy oscuro tirando a azulado marino
        surface: '#0d162a',    // Panels y Cards
        surfaceHover: '#18243e', // Hover states
        border: '#1e293b',     // Lineas e inputs
        primary: '#3b82f6',    // Acciones principales (Azul tech)
        primaryHover: '#60a5fa', 
        primaryLight: 'rgba(59,130,246,0.15)', // Para insignias y fondos
        textMain: '#f8fafc',
        textMuted: '#8b92b4',
        danger: '#ef4444',
        success: '#10b981',
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
