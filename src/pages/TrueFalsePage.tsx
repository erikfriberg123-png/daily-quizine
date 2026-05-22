import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchTrueFalseQuestions,
  pickTFQuestions,
  TF_LEVEL_CONFIG,
  TF_MAX_LEVEL,
  TF_QUESTIONS_PER_LEVEL,
  TFLevel,
  TrueFalseQuestion,
} from '../lib/trueFalseQuestions'
import { CATEGORY_DISPLAY } from '../lib/categories'

interface Props {
  onExit: () => void
}

type Phase = 'loading' | 'error' | 'quiz' | 'splash'
type SplashType = 'levelComplete' | 'failed' | 'allDone'
type AnswerState = 'idle' | 'correct' | 'wrong'

const FEEDBACK_MS = 750

export default function TrueFalsePage({ onExit }: Props) {
  const [level, setLevel] = useState<TFLevel>(1)
  const [loadKey, setLoadKey] = useState(0)

  const [phase, setPhase] = useState<Phase>('loading')
  const [splashType, setSplashType] = useState<SplashType>('failed')

  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [chosenIndex, setChosenIndex] = useState<0 | 1 | null>(null)

  const [failedQuestion, setFailedQuestion] = useState<TrueFalseQuestion | null>(null)
  const [failedAt, setFailedAt] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load questions whenever level or loadKey changes
  useEffect(() => {
    setPhase('loading')
    setQIndex(0)
    setAnswerState('idle')
    setChosenIndex(null)
    setFailedQuestion(null)

    fetchTrueFalseQuestions(level)
      .then((all) => {
        if (all.length === 0) { setPhase('error'); return }
        setQuestions(pickTFQuestions(all, TF_QUESTIONS_PER_LEVEL))
        setPhase('quiz')
      })
      .catch(() => setPhase('error'))
  }, [level, loadKey])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const handleAnswer = useCallback((index: 0 | 1) => {
    if (answerState !== 'idle' || phase !== 'quiz') return
    const q = questions[qIndex]
    const isCorrect = index === q.correctIndex

    setChosenIndex(index)
    setAnswerState(isCorrect ? 'correct' : 'wrong')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (isCorrect) {
        const next = qIndex + 1
        if (next >= questions.length) {
          setSplashType(level >= TF_MAX_LEVEL ? 'allDone' : 'levelComplete')
          setPhase('splash')
        } else {
          setQIndex(next)
          setAnswerState('idle')
          setChosenIndex(null)
        }
      } else {
        setFailedQuestion(q)
        setFailedAt(qIndex + 1)
        setSplashType('failed')
        setPhase('splash')
      }
    }, FEEDBACK_MS)
  }, [answerState, phase, qIndex, questions, level])

  const handleNextLevel = () => setLevel((l) => Math.min(l + 1, TF_MAX_LEVEL) as TFLevel)
  const handleRetry = () => setLoadKey((k) => k + 1)
  const handleRestart = () => { setLevel(1); setLoadKey((k) => k + 1) }

  const cfg = TF_LEVEL_CONFIG[level]

  /* ── Loading ── */
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 36, animation: 'pulse 1s ease infinite' }}>🧠</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>Laddar frågor…</div>
      </div>
    )
  }

  /* ── Error ── */
  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Inga frågor tillgängliga för den här nivån.</div>
        <button onClick={onExit} style={btnPrimary}>Tillbaka</button>
      </div>
    )
  }

  /* ── Splash ── */
  if (phase === 'splash') {
    return (
      <Splash
        type={splashType}
        level={level}
        questions={questions}
        failedQuestion={failedQuestion}
        failedAt={failedAt}
        onNextLevel={handleNextLevel}
        onRetry={handleRetry}
        onRestart={handleRestart}
        onExit={onExit}
      />
    )
  }

  /* ── Quiz ── */
  const q = questions[qIndex]
  const categoryLabel = CATEGORY_DISPLAY[q.categoryId]?.name ?? q.categoryId.replace(/_/g, ' ')
  const pct = (qIndex / questions.length) * 100

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <button onClick={onExit} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, padding: '4px 0' }}>
          ← Avbryt
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>Sant eller Falskt</div>
          <div style={{ fontSize: 11, marginTop: 1, color: cfg.levelColor, fontWeight: 600 }}>
            Level {level} · {cfg.label}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)', minWidth: 50, textAlign: 'right' }}>
          {qIndex}/{questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg-card-2)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.levelColor} 0%, var(--gold-light) 100%)`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 560, width: '100%', margin: '0 auto', padding: '20px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Question number */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.85 }}>
            Fråga {qIndex + 1} av {questions.length}
          </span>
        </div>

        {/* Question card */}
        <div
          key={qIndex}
          className="fade-in"
          style={{ flex: 1, background: 'linear-gradient(135deg, #1C1208 0%, var(--bg-card) 100%)', border: '1.5px solid var(--border-light)', borderRadius: 20, padding: '24px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {categoryLabel}
          </div>
          <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--white)', lineHeight: 1.55, margin: 0 }}>
            {q.question}
          </p>
        </div>

        {/* Sant / Falskt buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <TFBtn index={0} label="Sant" icon="✓" answerState={answerState} chosenIndex={chosenIndex} correctIndex={q.correctIndex} onClick={() => handleAnswer(0)} />
          <TFBtn index={1} label="Falskt" icon="✗" answerState={answerState} chosenIndex={chosenIndex} correctIndex={q.correctIndex} onClick={() => handleAnswer(1)} />
        </div>
      </div>
    </div>
  )
}

/* ─── TFBtn ─────────────────────────────────────────────────────────────── */

function TFBtn({ index, label, icon, answerState, chosenIndex, correctIndex, onClick }: {
  index: 0 | 1
  label: string
  icon: string
  answerState: AnswerState
  chosenIndex: 0 | 1 | null
  correctIndex: 0 | 1
  onClick: () => void
}) {
  const answered = answerState !== 'idle'
  const isChosen = chosenIndex === index
  const isCorrect = index === correctIndex

  let bg = 'var(--bg-card)'
  let border = 'var(--border-light)'
  let color = 'var(--white)'
  let opacity = 1
  let transform = 'scale(1)'

  if (answered) {
    if (isChosen && answerState === 'correct') {
      bg = 'var(--success-bg)'; border = 'var(--success)'; color = 'var(--success)'; transform = 'scale(1.03)'
    } else if (isChosen && answerState === 'wrong') {
      bg = 'var(--error-bg)'; border = 'var(--error)'; color = 'var(--error)'
    } else if (!isChosen && isCorrect && answerState === 'wrong') {
      bg = 'var(--success-bg)'; border = 'var(--success)'; color = 'var(--success)'
    } else {
      opacity = 0.4
    }
  }

  return (
    <button
      onClick={answered ? undefined : onClick}
      disabled={answered}
      style={{ flex: 1, padding: '22px 10px', background: bg, border: `2px solid ${border}`, borderRadius: 16, color, fontSize: 17, fontWeight: 800, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s ease', transform, opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

/* ─── Splash ─────────────────────────────────────────────────────────────── */

function Splash({ type, level, questions, failedQuestion, failedAt, onNextLevel, onRetry, onRestart, onExit }: {
  type: SplashType
  level: TFLevel
  questions: TrueFalseQuestion[]
  failedQuestion: TrueFalseQuestion | null
  failedAt: number
  onNextLevel: () => void
  onRetry: () => void
  onRestart: () => void
  onExit: () => void
}) {
  const cfg = TF_LEVEL_CONFIG[level]
  const nextLevel = (level + 1) as TFLevel
  const nextCfg = nextLevel <= TF_MAX_LEVEL ? TF_LEVEL_CONFIG[nextLevel] : null

  /* ── All levels done ── */
  if (type === 'allDone') {
    return (
      <div style={splashWrap}>
        <div className="pop-in" style={splashCard}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--gold-light)', marginBottom: 8 }}>Alla nivåer klarade!</div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.65 }}>
            Du klarade alla 3 nivåer av Sant eller Falskt.<br />Imponerande!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <button onClick={onRestart} style={{ ...btnPrimary, background: 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)', color: 'var(--cream)' }}>
              🔄 Spela igen från Level 1
            </button>
            <button onClick={onExit} style={btnSecondary}>← Tillbaka till menyn</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Level complete ── */
  if (type === 'levelComplete') {
    return (
      <div style={splashWrap}>
        <div className="pop-in" style={splashCard}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--gold-light)', marginBottom: 6 }}>
            Level {level} klar!
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            {cfg.label} — alla rätt!
          </div>

          {/* Result tile */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 24px', marginBottom: 20, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{questions.length}</span>
              <span style={{ fontSize: 22, color: 'var(--text-muted)' }}>/ {questions.length}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', textAlign: 'center' }}>Alla rätt! ✓</div>
          </div>

          {nextCfg && (
            <div style={{ background: 'rgba(29,111,232,0.07)', border: '1px solid rgba(29,111,232,0.2)', borderRadius: 12, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>
              Nästa: Level {nextLevel} · <span style={{ color: nextCfg.levelColor, fontWeight: 700 }}>{nextCfg.label}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {nextCfg && (
              <button onClick={onNextLevel} style={btnPrimary}>
                Level {nextLevel} · {nextCfg.label} →
              </button>
            )}
            <button onClick={onExit} style={btnSecondary}>← Tillbaka till menyn</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Failed ── */
  const correctLabel = failedQuestion?.correctIndex === 0 ? 'Sant' : 'Falskt'
  const hasExplanation = !!failedQuestion?.forklaring?.trim() &&
    failedQuestion.forklaring.trim().toLowerCase() !== 'förklaring saknas'

  return (
    <div style={splashWrap}>
      <div className="fade-in" style={{ ...splashCard, maxWidth: 460 }}>
        <div style={{ fontSize: 64, marginBottom: 10 }}>💔</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--error)', marginBottom: 6 }}>Fel svar!</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          Du kom till fråga <strong style={{ color: 'var(--white)' }}>{failedAt}</strong> av {questions.length}
        </div>

        {failedQuestion && (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--error)', borderRadius: 16, padding: '16px 18px', marginBottom: 20, textAlign: 'left', width: '100%' }}>
            <div style={{ fontSize: 14, color: 'var(--white)', lineHeight: 1.55, marginBottom: 12 }}>
              {failedQuestion.question}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--success-bg)', border: '1px solid var(--success)', borderRadius: 8, padding: '5px 12px', fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
              ✓ Rätt svar: {correctLabel}
            </div>
            {hasExplanation && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {failedQuestion.forklaring}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button onClick={onRetry} style={{ ...btnPrimary, background: 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)', color: 'var(--cream)' }}>
            🔄 Prova igen
          </button>
          <button onClick={onExit} style={btnSecondary}>← Tillbaka till menyn</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */

const splashWrap: React.CSSProperties = {
  minHeight: '100dvh',
  background: 'var(--bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px',
}

const splashCard: React.CSSProperties = {
  textAlign: 'center',
  maxWidth: 420,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
  color: '#fff',
  borderRadius: 16,
  fontSize: 16,
  fontWeight: 800,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 20px var(--blue-glow)',
}

const btnSecondary: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: 'transparent',
  color: 'var(--text-muted)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}
