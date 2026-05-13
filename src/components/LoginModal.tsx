import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  onSuccess: (user: User) => void
  onClose: () => void
  hint?: string
}

export function LoginModal({ onSuccess, onClose, hint }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (e) throw e
        if (data.user) onSuccess(data.user)
      } else {
        const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password })
        if (e) throw e
        if (data.user && !data.user.email_confirmed_at) {
          setDone(true)
        } else if (data.user) {
          onSuccess(data.user)
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Något gick fel'
      if (msg.includes('Invalid login')) setError('Fel e-post eller lösenord.')
      else if (msg.includes('already registered')) setError('Den e-postadressen finns redan.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(3,12,26,0.85)',
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
          padding: 28,
          width: '100%',
          maxWidth: 420,
          marginBottom: 8,
        }}
      >
        {done ? (
          <>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
              Bekräfta din e-post
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              Vi skickade ett bekräftelsemail till <strong style={{ color: 'var(--white)' }}>{email}</strong>. Klicka på länken för att aktivera ditt konto.
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--blue)',
                color: '#fff',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Stäng
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </div>
            {hint && (
              <div style={{ fontSize: 13, color: 'var(--orange)', marginBottom: 16, fontWeight: 600 }}>
                {hint}
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              {mode === 'login'
                ? 'Samma konto som Quizine.se'
                : 'Skapa ett konto som fungerar på Quizine.se också'}
            </div>

            <input
              type="email"
              placeholder="E-postadress"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Lösenord"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              style={{ ...inputStyle, marginTop: 10 }}
            />

            {error && (
              <div style={{ color: 'var(--error)', fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim() || !password.trim()}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '14px',
                background: loading ? 'var(--border)' : 'var(--blue)',
                color: '#fff',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                opacity: (!email.trim() || !password.trim()) ? 0.5 : 1,
                cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Laddar...' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </button>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                style={{
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'underline',
                }}
              >
                {mode === 'login' ? 'Inget konto? Skapa ett' : 'Har du redan ett konto? Logga in'}
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                display: 'block',
                margin: '12px auto 0',
                background: 'none',
                color: 'var(--text-dim)',
                fontSize: 13,
              }}
            >
              Avbryt
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A1628',
  border: '1.5px solid var(--border)',
  borderRadius: 12,
  padding: '12px 14px',
  color: 'var(--white)',
  fontSize: 15,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}
