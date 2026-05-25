import { ALL_CATEGORIES } from '@quizine/config'

/**
 * Auto-derived from packages/config/src/categories.ts.
 * Adding a new segment's categories to that file automatically populates here.
 */
export const CATEGORY_DISPLAY: Record<string, { name: string; emoji: string; desc: string }> =
  Object.fromEntries(
    ALL_CATEGORIES.map(c => [c.id, { name: c.name, emoji: c.icon, desc: c.description }]),
  )

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  ALL_CATEGORIES.map(c => [c.id, c.color]),
)

export const ROMAN = ['I.', 'II.', 'III.']
