import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User | null
  onClose: () => void
  onNeedLogin: () => void
}

const CATEGORIES = [
  { id: 'food',             name: '🍔  Mat' },
  { id: 'drink',            name: '🍷  Dryck' },
  { id: 'famous_profiles',  name: '🌟  Kända profiler' },
  { id: 'professional',     name: '👨‍🍳  Professionellt' },
  { id: 'service_guests',   name: '🤝  Service & Gäster' },
  { id: 'industry_culture', name: '🏆  Branschkultur' },
  { id: 'fun_reallife',     name: '😄  Kul & Vardag' },
  { id: 'labor_law',        name: '⚖️  Avtal & Lag' },
  { id: 'food_cost',        name: '🧾  Kostnad & Lönsamhet' },
  { id: 'scheduling_labor', name: '⏱️  Schema & Personal' },
  { id: 'guest_psychology', name: '🧍  Gästpsykologi' },
  { id: 'service_pressure', name: '⚡  Service Under Tryck' },
]

export function CreateQuestionModal({ user, onClose, onNeedLogin }: Props) {
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0)
  const [categoryId, setCategoryId] = useState('food')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const setAnswer = (i: number, val: string) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? val : a)))
  }

  const isValid =
    question.trim().length >= 10 &&
    answers.every((a) => a.trim().length > 0)

  const handleSubmit = async () => {
    if (!user) { onNeedLogin(); return }
    if (!isValid) return
    setError('')
    setSubmitting(true)
    try {
      const id = `rq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      const { error: err } = await supabase.from('remote_questions').insert({
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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3,12,26,0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', marginBottom: 8 }}>
              Tack för din fråga!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Din fråga är inskickad och granskas av admin innan den publiceras.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '13px 32px',
                background: 'var(--blue)',
                color: '#fff',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Stäng
            </button>
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

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={selectStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

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
              {submitting ? 'Skickar...' : 'Skicka in fråga'}
            </button>
          </>
        )}
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

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A1628',
  border: '1.5px solid var(--border)',
  borderRadius: 10,
  padding: '11px 13px',
  color: 'var(--white)',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  cursor: 'pointer',
}
