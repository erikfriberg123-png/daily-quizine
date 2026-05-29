import { supabaseUrl, supabaseAnonKey } from './supabase'
import { getSegmentConfig } from '../config/segments'

export interface DailyQuestion {
  id: string
  question: string
  answers: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  categoryId: string
  imageUrl?: string
  forklaring?: string
}

// Use plain fetch instead of the supabase-js client so auth state
// (expired tokens, locked refresh) can never block question loading.
export async function fetchDailyQuestions(): Promise<DailyQuestion[]> {
  const { questionsTable } = getSegmentConfig()
  const params = new URLSearchParams({
    select: 'id,question,answers,correct_index,category_id,image_url,forklaring',
    active: 'eq.true',
    order: 'id',
  })
  const res = await fetch(
    `${supabaseUrl}/rest/v1/${questionsTable}?${params}`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    },
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: unknown[] = await res.json()

  return data
    .filter((row): row is Record<string, unknown> =>
      typeof row === 'object' && row !== null &&
      Array.isArray((row as Record<string, unknown>).answers) &&
      ((row as Record<string, unknown>).answers as unknown[]).length === 4
    )
    .map((row) => ({
      id: row.id as string,
      question: row.question as string,
      answers: row.answers as [string, string, string, string],
      correctIndex: row.correct_index as 0 | 1 | 2 | 3,
      categoryId: row.category_id as string,
      ...(row.image_url ? { imageUrl: row.image_url as string } : {}),
      ...(row.forklaring ? { forklaring: row.forklaring as string } : {}),
    }))
}
