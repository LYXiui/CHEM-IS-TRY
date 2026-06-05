import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages: 設為 /你的-repo名稱/ ；本機開發用 /
  base: process.env.VITE_BASE || '/',
})
