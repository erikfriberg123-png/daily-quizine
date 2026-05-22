import { supabase } from './supabase'
import { SEGMENT } from '../config/segments'

const TABLE = SEGMENT === 'voo' ? 'voo_remote_questions' : 'remote_questions'

export interface TrueFalseQuestion {
  id: string
  question: string
  correctIndex: 0 | 1   // 0 = Sant, 1 = Falskt
  categoryId: string
  forklaring?: string
}

export type TFLevel = 1 | 2 | 3

export const TF_LEVEL_CONFIG: Record<TFLevel, { difficulty: string; label: string; levelColor: string }> = {
  1: { difficulty: 'easy',   label: 'Lätt',  levelColor: 'var(--success)' },
  2: { difficulty: 'medium', label: 'Medel', levelColor: 'var(--orange)' },
  3: { difficulty: 'hard',   label: 'Svår',  levelColor: 'var(--error)' },
}

export const TF_MAX_LEVEL: TFLevel = 3
export const TF_QUESTIONS_PER_LEVEL = 10

export async function fetchTrueFalseQuestions(level: TFLevel): Promise<TrueFalseQuestion[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, question, correct_index, category_id, forklaring, answers')
    .eq('active', true)
    .eq('difficulty', TF_LEVEL_CONFIG[level].difficulty)
    .order('id')

  if (error) throw error

  return (data ?? [])
    .filter((row) => {
      const ans = row.answers as string[] | null
      return ans?.[0]?.toLowerCase() === 'sant' && ans?.[1]?.toLowerCase() === 'falskt'
    })
    .map((row) => ({
      id: row.id as string,
      question: row.question as string,
      correctIndex: row.correct_index as 0 | 1,
      categoryId: row.category_id as string,
      ...(row.forklaring ? { forklaring: row.forklaring as string } : {}),
    }))
}

export function pickTFQuestions(all: TrueFalseQuestion[], count: number): TrueFalseQuestion[] {
  return [...all].sort(() => Math.random() - 0.5).slice(0, Math.min(count, all.length))
}
