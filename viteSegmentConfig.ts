import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { SEGMENTS } from './packages/config/src/index'

const configRoot = path.resolve(__dirname, './packages/config/src/index.ts')
const DEFAULT_TITLE = 'Quizine Daily – Dagens quiz för restaurangfolk'

export function createSegmentViteConfig(segmentId: string) {
  const seg = SEGMENTS.find(s => s.id === segmentId)
  const title       = seg?.daily.title       ?? DEFAULT_TITLE
  const description = seg?.daily.description ?? ''
  const siteUrl     = `https://daily.quizine.se/${segmentId}/`
  const needsHtmlTransform = title !== DEFAULT_TITLE

  return defineConfig({
    plugins: [
      react(),
      ...(needsHtmlTransform
        ? [
            {
              name: `${segmentId}-html`,
              transformIndexHtml(html: string) {
                return html
                  .replace(DEFAULT_TITLE, title)
                  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
                  .replace(/(<link rel="canonical" href=")[^"]*(")/,  `$1${siteUrl}$2`)
                  .replace(/(<meta property="og:url" content=")[^"]*(")/,         `$1${siteUrl}$2`)
                  .replace(/(<meta property="og:title" content=")[^"]*(")/,       `$1${title}$2`)
                  .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${description}$2`)
                  .replace(/(<meta name="twitter:title" content=")[^"]*(")/,      `$1${title}$2`)
                  .replace(/(<meta name="twitter:description" content=")[^"]*(")/,`$1${description}$2`)
              },
            },
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@quizine/config': configRoot,
      },
    },
    base: `/${segmentId}/`,
    build: { outDir: `dist/${segmentId}` },
    define: { __SEGMENT__: JSON.stringify(segmentId) },
  })
}
