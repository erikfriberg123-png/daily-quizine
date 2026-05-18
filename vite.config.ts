import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/quizine/',
  build: {
    outDir: 'dist/quizine',
  },
  define: {
    __SEGMENT__: JSON.stringify('quizine'),
  },
})
