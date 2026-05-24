import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'
import { CATEGORY_DISPLAY } from '../lib/categories'
import { getSegmentConfig } from '../config/segments'

interface Props {
  user: User | null
  onClose: () => void
  onNeedLogin: () => void
}

const { questionsTable, id: segmentId } = getSegmentConfig()

const SEGMENT_CATEGORIES: Record<string, string[]> = {
  quizine: ['food','drink','famous_profiles','professional','service_guests','industry_culture','fun_reallife','labor_law','food_cost','scheduling_labor','guest_psychology','service_pressure'],
  voo:     ['anatomy_body','diagnoses_symptoms','emergency_firstaid','ethics_communication','infections_hygiene','medical_history','medications_pharma','popculture_healthcare','psychiatry_psychology'],
  it:      ['programming','cloud_infra','cybersecurity','databases','ai_ml','operating_systems','web_apis','app_development','tools_workflow','tech_history','fun_culture'],
}

const CATEGORIES = (SEGMENT_CATEGORIES[segmentId] ?? SEGMENT_CATEGORIES.quizine).map((id) => ({
  id,
  name: `${CATEGORY_DISPLAY[id]?.emoji ?? ''}  ${CATEGORY_DISPLAY[id]?.name ?? id}`,
}))

export function CreateQuestionModal({ user, onClose, onNeedLogin }: Props) {
  const keyboardOffset = useKeyboardOffset()
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0)
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const setAnswer = (i: number, val: string) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)))
  }

  const isValid =
    question.trim().length >= 10 &&
    answers.every((a) => a.trim().length > 0) &&
    categoryId !== ''

  const handleNewQuestion = () => {
    setQuestion('')
    setAnswers(['', '', '', ''])
    setCorrectIndex(0)
    setCategoryId('')
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async () => {
    if (!user) { onNeedLogin(); return }
    if (!isValid) return
    setError('')
    setSubmitting(true)
    try {
      const id = `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const { error: err } = await supabase.from(questionsTable).insert({
        id,
        category_id: categoryId,
        question: question.trim(),
        answers,
        correct_index: correctIndex,
        difficulty: 'medium',
        active: false,
      })
      if (err) throw err
      setSuccess(true)
    } catch {
      setError('Kunde inte skicka in frågan. Försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3,12,26,0.88)',
          backdropFilter: 'blur(6px)',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          bottom: keyboardOffset,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          transition: 'bottom 0.2s ease',
        }}
      >
      <div
        className="fade-in"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          marginBottom: 8,
          maxHeight: '90dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', marginBottom: 8 }}>
              Tack för din fråga!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Din fråga är inskickad och granskas av admin innan den publiceras.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleNewQuestion}
                style={{
                  padding: '13px',
                  background: 'var(--orange)',
                  color: '#fff',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                ✏️  Skapa en ny fråga
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '13px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                ← Tillbaka till startsidan
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)' }}>✏️  Skicka in en fråga</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Granskas av admin innan publicering
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', color: 'var(--text-dim)', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {!user && (
              <div
                style={{
                  background: 'rgba(255,107,43,0.08)',
                  border: '1px solid rgba(255,107,43,0.3)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: 'var(--orange)',
                  fontWeight: 600,
                }}
              >
                Du behöver vara inloggad för att skicka in en fråga.{' '}
                <button
                  onClick={onNeedLogin}
                  style={{ background: 'none', color: 'var(--orange)', textDecoration: 'underline', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Logga in
                </button>
              </div>
            )}

            {/* Question */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Fråga</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Skriv din fråga här..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                {question.trim().length}/10 tecken minimum
              </div>
            </div>

            {/* Answers */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Svarsalternativ</label>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                Markera det rätta svaret med radioknappen
              </div>
              {answers.map((answer, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i as 0 | 1 | 2 | 3)}
                    style={{ width: 18, height: 18, accentColor: 'var(--success)', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div
                    style={{
                      minWidth: 26,
                      height: 26,
                      borderRadius: 7,
                      background: correctIndex === i ? 'var(--success)' : 'var(--bg-card-2)',
                      color: correctIndex === i ? '#000' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                  <input
                    type="text"
                    placeholder={`Alternativ ${['A', 'B', 'C', 'D'][i]}`}
                    value={answer}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    style={{ ...inputStyle, flex: 1, padding: '10px 12px' }}
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Kategori
                {!categoryId && (
                  <span style={{ color: 'var(--orange)', marginLeft: 6, fontWeight: 700 }}>— välj en *</span>
                )}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CATEGORIES.map((c) => {
                  const selected = categoryId === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategoryId(c.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: selected ? '1.5px solid var(--orange)' : '1.5px solid var(--border)',
                        background: selected ? 'rgba(255,107,43,0.12)' : '#0A1628',
                        color: selected ? 'var(--orange)' : 'var(--text-muted)',
                        fontSize: 14,
                        fontWeight: selected ? 700 : 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                    >
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--error)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !isValid || !user}
              style={{
                width: '100%',
                padding: '14px',
                background: isValid && user ? 'var(--orange)' : 'var(--border)',
                color: '#fff',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: isValid && user && !submitting ? 'pointer' : 'default',
                opacity: (!isValid || !user) ? 0.6 : 1,
                border: 'none',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Skickar...' : 'Lägg till fråga'}
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A1628',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '11px 13px',
  color: 'var(--white)',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}

