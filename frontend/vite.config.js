import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client dùng `global` (Node.js) — polyfill thành window cho browser
    global: 'window',
  },
})
