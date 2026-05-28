import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { getLockedSeconds, recordAuthFailure, clearAuthRateLimit } from '../lib/authRateLimit'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'

const AppleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" style={{ flexShrink: 0 }}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
  </svg>
)

interface Props {
  onSuccess: (user: User) => void
  onClose: () => void
  hint?: string
}

export function LoginModal({ onSuccess, onClose, hint }: Props) {
  const keyboardOffset = useKeyboardOffset()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [done, setDone] = useState(false)

  const handleAppleSignIn = async () => {
    setAppleLoading(true)
    localStorage.setItem('postAuthRedirect', 'quiz')
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    setAppleLoading(false)
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return
    if (mode === 'register' && password !== confirmPassword) {
      setError('Lösenorden matchar inte.')
      return
    }

    const secondsLocked = getLockedSeconds()
    if (secondsLocked > 0) {
      setError(`För många misslyckade försök. Vänta ${secondsLocked} sekunder.`)
      return
    }

    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (e) {
          recordAuthFailure()
          throw e
        }
        clearAuthRateLimit()
        if (data.user) onSuccess(data.user)
      } else {
        const { data, error: e } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
        })
        if (e) {
          recordAuthFailure()
          throw e
        }
        localStorage.setItem('postAuthRedirect', 'quiz')
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
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(3,12,26,0.85)',
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
          padding: 28,
          width: '100%',
          maxWidth: 420,
          marginBottom: 8,
          position: 'relative',
          zIndex: 1,
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

            <form
              onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
              style={{ display: 'contents' }}
            >
              <input
                type="email"
                placeholder="E-postadress"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ ...inputStyle, marginTop: 10 }}
              />
              {mode === 'register' && (
                <input
                  type="password"
                  placeholder="Bekräfta lösenord"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  autoComplete="new-password"
                  style={{ ...inputStyle, marginTop: 10 }}
                />
              )}

              {error && (
                <div style={{ color: 'var(--error)', fontSize: 13, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim())}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '14px',
                  background: loading ? 'var(--border)' : 'var(--blue)',
                  color: '#fff',
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  opacity: (!email.trim() || !password.trim() || (mode === 'register' && !confirmPassword.trim())) ? 0.5 : 1,
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Laddar...' : mode === 'login' ? 'Logga in' : 'Skapa konto'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 4px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>eller</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '13px',
                background: appleLoading ? '#333' : '#000',
                color: '#fff',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                cursor: appleLoading ? 'default' : 'pointer',
                border: 'none',
                transition: 'background 0.15s',
                marginBottom: 4,
              }}
            >
              <AppleLogo />
              {appleLoading ? 'Omdirigerar...' : 'Logga in med Apple'}
            </button>

            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setConfirmPassword('') }}
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
