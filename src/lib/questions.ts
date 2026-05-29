import { supabase } from './supabase'
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

export async function fetchDailyQuestions(): Promise<DailyQuestion[]> {
  const { questionsTable } = getSegmentConfig()
  const { data, error } = await supabase
    .from(questionsTable)
    .select('id, question, answers, correct_index, category_id, image_url, forklaring')
    .eq('active', true)
    .order('id')

  if (error) throw error

  return (data ?? [])
    .filter((row) => Array.isArray(row.answers) && row.answers.length === 4)
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
