import { supabase } from './supabase'

export interface DailyQuestion {
  id: string
  question: string
  answers: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  categoryId: string
}

export async function fetchDailyQuestions(): Promise<DailyQuestion[]> {
  const { data, error } = await supabase
    .from('remote_questions')
    .select('id, question, answers, correct_index, category_id')
    .eq('active', true)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    question: row.question as string,
    answers: row.answers as [string, string, string, string],
    correctIndex: row.correct_index as 0 | 1 | 2 | 3,
    categoryId: row.category_id as string,
  }))
}
