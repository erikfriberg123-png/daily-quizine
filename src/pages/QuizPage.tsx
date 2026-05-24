import { useEffect, useRef, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { fetchDailyQuestions, DailyQuestion } from '../lib/questions'
import { getParisDate, pickDailyQuestions, saveTodayPlayedData, getActiveSession, saveActiveSession, clearActiveSession, getCachedDailySelection, cacheDailySelection } from '../lib/dailyUtils'
import { submitDailyScore } from '../lib/dailyScores'
import { Timer } from '../components/Timer'
import { AnswerButton } from '../components/AnswerButton'
import { CATEGORY_DISPLAY, CATEGORY_COLORS } from '../lib/categories'

const QUESTION_COUNT = 3
const TIMER_SECONDS = 20

interface Props {
  user: User | null
  username: string | null
  onComplete: (result: { score: number; correct: number; total: number; dateStr: string }) => void
  onExit: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong' | 'disabled'

export default function QuizPage({ user, username, onComplete, onExit }: Props) {
  const [questions, setQuestions] = useState<DailyQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [answered, setAnswered] = useState(false)
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(['idle', 'idle', 'idle', 'idle'])
  const [showNext, setShowNext] = useState(false)


  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const showNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const answeredRef = useRef(false)

  // Clear showNext timer on unmount
  useEffect(() => {
    return () => {
      if (showNextTimerRef.current) clearTimeout(showNextTimerRef.current)
    }
  }, [])

  useEffect(() => {
    fetchDailyQuestions()
      .then((all) => {
        const dateStr = getParisDate()
        let daily: DailyQuestion[]
        const cachedIds = getCachedDailySelection(dateStr)
        if (cachedIds) {
          const idMap = new Map(all.map(q => [q.id, q]))
          const restored = cachedIds.map(id => idMap.get(id)).filter((q): q is DailyQuestion => !!q)
          daily = restored.length === QUESTION_COUNT ? restored : pickDailyQuestions(all, dateStr, QUESTION_COUNT)
          if (restored.length !== QUESTION_COUNT) cacheDailySelection(dateStr, daily.map(q => q.id))
        } else {
          daily = pickDailyQuestions(all, dateStr, QUESTION_COUNT)
          cacheDailySelection(dateStr, daily.map(q => q.id))
        }
        const session = getActiveSession()

        if (session) {
          const resumeIndex = session.qIndex + 1
          if (resumeIndex >= daily.length) {
            // Forfeited the last question — complete quiz immediately with saved score
            saveTodayPlayedData({ score: session.score, correct: session.correct, total: daily.length })
            clearActiveSession()
            onComplete({ score: session.score, correct: session.correct, total: daily.length, dateStr: getParisDate() })
            return
          }
          // Skip the forfeited question and resume from the next one
          setQIndex(resumeIndex)
          setScore(session.score)
          setCorrect(session.correct)
          saveActiveSession({ qIndex: resumeIndex, score: session.score, correct: session.correct })
        } else {
          saveActiveSession({ qIndex: 0, score: 0, correct: 0 })
        }

        setQuestions(daily)
        setLoading(false)
      })
      .catch(() => {
        setError('Kunde inte ladda frågor. Kontrollera din internetanslutning.')
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const finishQuestion = useCallback(
    (chosenIndex: number | null) => {
      if (answeredRef.current) return
      answeredRef.current = true
      stopTimer()

      const q = questions[qIndex]
      const isCorrect = chosenIndex === q.correctIndex
      const gained = isCorrect ? 150 : 0

      setAnswered(true)
      setScore((s) => s + gained)
      if (isCorrect) setCorrect((c) => c + 1)

      const next: AnswerState[] = ['disabled', 'disabled', 'disabled', 'disabled']
      next[q.correctIndex] = 'correct'
      if (chosenIndex !== null && chosenIndex !== q.correctIndex) next[chosenIndex] = 'wrong'
      setAnswerStates(next)

      if (showNextTimerRef.current) clearTimeout(showNextTimerRef.current)
      showNextTimerRef.current = setTimeout(() => setShowNext(true), 600)
    },
    [qIndex, questions, stopTimer]
  )

  const handleTimerExpire = useCallback(() => {
    finishQuestion(null)
  }, [finishQuestion])

  // Start timer when question changes
  useEffect(() => {
    if (loading || questions.length === 0) return
    answeredRef.current = false
    setAnswered(false)
    setAnswerStates(['idle', 'idle', 'idle', 'idle'])
    setShowNext(false)
    setTimeLeft(TIMER_SECONDS)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => stopTimer()
  }, [qIndex, loading, questions.length, stopTimer])

  const handleNext = async () => {
    const nextIndex = qIndex + 1
    if (nextIndex >= questions.length) {
      const bonus = correct === questions.length ? 50 : 0
      const finalScore = score + bonus
      const finalCorrect = correct
      const dateStr = getParisDate()
      saveTodayPlayedData({ score: finalScore, correct: finalCorrect, total: questions.length })
      clearActiveSession()

      if (user && username) {
        try {
          await submitDailyScore({
            userId: user.id,
            username,
            date: dateStr,
            score: finalScore,
            correct: finalCorrect,
          })
        } catch {
          // Score saved locally; leaderboard submission failed silently
        }
      }

      onComplete({ score: finalScore, correct: finalCorrect, total: questions.length, dateStr })
    } else {
      saveActiveSession({ qIndex: nextIndex, score, correct })
      setQIndex(nextIndex)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ fontSize: 32, animation: 'pulse 1s ease infinite' }}>🎯</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Laddar dagens frågor...</div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 16, color: 'var(--text-muted)' }}>{error || 'Inga frågor i databasen ännu — hjälp till att skapa dem.'}</div>
        <button
          onClick={onExit}
          style={{
            marginTop: 8,
            padding: '12px 28px',
            background: 'var(--blue)',
            color: '#fff',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          Tillbaka
        </button>
      </div>
    )
  }

  const q = questions[qIndex]

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <button
          onClick={() => { clearActiveSession(); onExit() }}
          style={{
            background: 'none',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            padding: '4px 0',
          }}
        >
          ← Avbryt
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>
            Fråga {qIndex + 1}/{questions.length}
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--orange)',
            minWidth: 60,
            textAlign: 'right',
          }}
        >
          {score.toLocaleString('sv-SE')} XP
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg-card-2)' }}>
        <div
          style={{
            height: '100%',
            width: `${((qIndex + (answered ? 1 : 0)) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, var(--blue) 0%, var(--orange) 100%)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Quiz body */}
      <div
        style={{
          flex: 1,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          padding: '20px 16px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Timer duration={TIMER_SECONDS} timeLeft={timeLeft} onExpire={handleTimerExpire} />

        {/* Question card */}
        <div
          key={qIndex}
          className="fade-in"
          style={{
            background: 'linear-gradient(135deg, #1C1208 0%, var(--bg-card) 100%)',
            border: '1.5px solid var(--border-light)',
            borderRadius: 20,
            padding: '20px 20px 22px',
            marginBottom: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {CATEGORY_DISPLAY[q.categoryId]?.name ?? q.categoryId.replace(/_/g, ' ')}
          </div>
          {q.imageUrl && (
            <img
              src={q.imageUrl}
              alt=""
              style={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 12,
                marginBottom: 14,
                display: 'block',
              }}
            />
          )}
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', lineHeight: 1.45 }}>
            {q.question}
          </div>
        </div>

        {/* Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.answers.map((answer, i) => (
            <AnswerButton
              key={i}
              label={answer}
              index={i}
              state={answerStates[i]}
              onClick={() => finishQuestion(i)}
            />
          ))}
        </div>

        {/* Next button + explanation */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 20,
            opacity: showNext ? 1 : 0,
            transform: showNext ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s, transform 0.3s',
            pointerEvents: showNext ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: `1.5px solid ${CATEGORY_COLORS[q.categoryId] ?? 'var(--blue)'}`,
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 12,
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            {!!q.forklaring?.trim() && q.forklaring.trim().toLowerCase() !== 'förklaring saknas'
              ? q.forklaring.trim()
              : 'Ingen förklaring'}
          </div>
          <button
            onClick={handleNext}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
              color: '#fff',
              borderRadius: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px var(--blue-glow)',
              border: 'none',
            }}
          >
            {qIndex + 1 >= questions.length ? 'Visa resultat →' : 'Nästa fråga →'}
          </button>
        </div>
      </div>
    </div>
  )
}
