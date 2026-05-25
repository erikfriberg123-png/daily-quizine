import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { getSegment } from '../packages/config/src/index'

const CONFIG_ALIAS = path.resolve(__dirname, '../packages/config/src/index.ts')
const DEFAULT_TITLE = 'Quizine Daily – Dagens quiz för restaurangfolk'

/**
 * Creates the Vite config for a daily-quizine segment build.
 * Segment title and description are read from packages/config/src/index.ts.
 *
 * Usage in vite.config.[seg].ts:
 *   import { createSegmentViteConfig } from './viteSegmentConfig'
 *   export default createSegmentViteConfig('voo')
 */
export function createSegmentViteConfig(segmentId: string) {
  const seg = getSegment(segmentId)
  const title = seg?.daily.title ?? DEFAULT_TITLE
  const description = seg?.daily.description ?? ''
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
                  .replace(
                    /<meta name="description"[^>]*>/,
                    `<meta name="description" content="${description}" />`,
                  )
              },
            },
          ]
        : []),
    ],
    base: `/${segmentId}/`,
    build: { outDir: `dist/${segmentId}` },
    define: { __SEGMENT__: JSON.stringify(segmentId) },
    resolve: {
      alias: { '@quizine/config': CONFIG_ALIAS },
    },
  })
}
