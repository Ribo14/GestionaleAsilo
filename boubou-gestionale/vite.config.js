import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['canvg', 'dompurify'],
  },
  build: {
    rollupOptions: {
      external: ['canvg', 'dompurify'],
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/firestore'],
        },
      },
    },
  },
})
