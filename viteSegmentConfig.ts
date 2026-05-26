import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_TITLE = 'Quizine Daily – Dagens quiz för restaurangfolk'

const SEGMENT_META: Record<string, { title: string; description: string }> = {
  quizine: {
    title: DEFAULT_TITLE,
    description: 'Visa vad du kan om livet på krogen. Tävla med kollegorna.',
  },
  voo: {
    title: 'Quizine Daily – Vård & Omsorg',
    description: 'Dagens quiz för vård- och omsorgspersonal. Tävla med dina kollegor.',
  },
  blaljus: {
    title: 'Quizine Daily – Blåljuspersonal',
    description: 'Dagens quiz för blåljuspersonal. Testa dina kunskaper om polis, brand och ambulans.',
  },
  it: {
    title: 'Quizine Daily – IT & Software',
    description: 'Dagens quiz för IT och mjukvaruutvecklare. Tävla med kollegorna.',
  },
}

export function createSegmentViteConfig(segmentId: string) {
  const meta = SEGMENT_META[segmentId] ?? SEGMENT_META.quizine
  const title = meta.title
  const description = meta.description
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
  })
}
