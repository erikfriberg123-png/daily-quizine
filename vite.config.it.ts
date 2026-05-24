import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'it-html',
      transformIndexHtml(html: string) {
        return html
          .replace('Quizine Daily', 'Quizine Daily – IT &amp; Software')
          .replace(
            /<meta name="description"[^>]*>/,
            '<meta name="description" content="Dagens quiz för dig inom IT och mjukvara. Nytt quiz varje vardag." />',
          )
      },
    },
  ],
  base: '/it/',
  build: {
    outDir: 'dist/it',
  },
  define: {
    __SEGMENT__: JSON.stringify('it'),
  },
})
