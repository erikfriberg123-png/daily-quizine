import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'voo-html',
      transformIndexHtml(html: string) {
        return html
          .replace(
            'Quizine Daily – Dagens quiz för restaurangfolk',
            'Quizine Daily – Vård &amp; Omsorg',
          )
          .replace(
            /<meta name="description"[^>]*>/,
            '<meta name="description" content="Dagens quiz för dig inom vård och omsorg. Nytt quiz varje vardag." />',
          )
      },
    },
  ],
  base: '/voo/',
  build: {
    outDir: 'dist/voo',
  },
  define: {
    __SEGMENT__: JSON.stringify('voo'),
  },
})
