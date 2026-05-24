import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'blaljus-html',
      transformIndexHtml(html: string) {
        return html
          .replace(
            'Quizine Daily – Dagens quiz för restaurangfolk',
            'Quizine Daily – Blåljuspersonal',
          )
          .replace(
            /<meta name="description"[^>]*>/,
            '<meta name="description" content="Dagens quiz för blåljuspersonal. Testa dina kunskaper om polis, brand och ambulans." />',
          )
      },
    },
  ],
  base: '/blaljus/',
  build: {
    outDir: 'dist/blaljus',
  },
  define: {
    __SEGMENT__: JSON.stringify('blaljus'),
  },
})
