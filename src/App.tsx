import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { getMyTodayScore } from './lib/dailyScores'
import { getParisDate } from './lib/dailyUtils'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'

type View = 'home' | 'quiz' | 'results'

interface QuizResult {
  score: number
  correct: number
  total: number
  dateStr: string
}

export interface ServerPlayed {
  score: number
  correct: number
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [serverPlayed, setServerPlayed] = useState<ServerPlayed | null>(null)
  const [serverPlayedChecked, setServerPlayedChecked] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsername(session.user.id)
        fetchServerPlayed(session.user.id)
      } else {
        setServerPlayedChecked(true)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsername(session.user.id)
        fetchServerPlayed(session.user.id)
      } else {
        setUsername(null)
        setServerPlayed(null)
        setServerPlayedChecked(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchUsername = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('username').eq('id', uid).single()
    setUsername((data?.username as string | null) ?? null)
  }

  const fetchServerPlayed = async (uid: string) => {
    setServerPlayedChecked(false)
    try {
      const data = await getMyTodayScore(uid, getParisDate())
      setServerPlayed(data)
    } catch {
      setServerPlayed(null)
    } finally {
      setServerPlayedChecked(true)
    }
  }

  const handleAuthChange = (u: User | null) => {
    setUser(u)
    if (u) {
      fetchUsername(u.id)
      fetchServerPlayed(u.id)
    } else {
      setUsername(null)
      setServerPlayed(null)
      setServerPlayedChecked(true)
    }
  }

  return (
    <>
      {view === 'home' && (
        <HomePage
          user={user}
          username={username}
          serverPlayed={serverPlayed}
          serverPlayedChecked={serverPlayedChecked}
          justCompleted={justCompleted}
          onStartQuiz={() => setView('quiz')}
          onAuthChange={handleAuthChange}
        />
      )}
      {view === 'quiz' && (
        <QuizPage
          user={user}
          username={username}
          onComplete={(r) => { setResult(r); setView('results') }}
          onExit={() => setView('home')}
        />
      )}
      {view === 'results' && result && (
        <ResultsPage
          result={result}
          user={user}
          username={username}
          onPlayAgain={() => { setJustCompleted(true); setView('home') }}
          onAuthChange={handleAuthChange}
        />
      )}
    </>
  )
}
