import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果部署到 GitHub Pages 子路径（如 /repo-name），取消下面的注释并设置正确的 base
  // base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/',
  base: process.env.VITE_BASE_PATH || '/',
})
