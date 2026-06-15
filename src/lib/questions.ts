import { supabaseUrl, supabaseAnonKey } from './supabase'
import { getSegmentConfig } from '../config/segments'

function shuffleAnswers(
  answers: [string, string, string, string],
  correctIndex: number,
): { answers: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
  const arr = answers.map((text, i) => ({ text, correct: i === correctIndex }))
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return {
    answers: arr.map(a => a.text) as [string, string, string, string],
    correctIndex: arr.findIndex(a => a.correct) as 0 | 1 | 2 | 3,
  }
}

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
    .map((row) => {
      const { answers, correctIndex } = shuffleAnswers(
        row.answers as [string, string, string, string],
        row.correct_index as number,
      )
      return {
        id: row.id as string,
        question: row.question as string,
        answers,
        correctIndex,
        categoryId: row.category_id as string,
        ...(row.image_url ? { imageUrl: row.image_url as string } : {}),
        ...(row.forklaring ? { forklaring: row.forklaring as string } : {}),
      }
    })
}
