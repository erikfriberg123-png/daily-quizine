import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { submitFeedback } from '../lib/feedback'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'

interface Props {
  user: User | null
  username: string | null
  onClose: () => void
}

export function FeedbackModal({ user, username, onClose }: Props) {
  const keyboardOffset = useKeyboardOffset()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSending(true)
    setError('')
    try {
      const { error: err } = await submitFeedback(text, user?.id ?? null, username)
      if (err) { setError('Något gick fel. Försök igen.'); return }
      setSent(true)
    } catch {
      setError('Något gick fel. Försök igen.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* dim backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />
      {/* sheet — sits right above the keyboard */}
      <div
        style={{
          position: 'absolute',
          bottom: keyboardOffset,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          transition: 'bottom 0.2s ease',
        }}
      >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '85dvh',
          overflowY: 'auto',
          padding: '24px 20px 32px',
          paddingBottom: `max(32px, env(safe-area-inset-bottom))`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)' }}>Lämna feedback</div>
          <button
            onClick={onClose}
            style={{ background: 'none', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
              Tack för din feedback!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              Vi läser allt och försöker bli bättre.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px',
                background: 'var(--blue)',
                color: '#fff',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Stäng
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
              Har du förslag, hittat en bugg eller vill säga något? Vi läser allt!
            </p>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError('') }}
              onFocus={(e) => { const t = e.target; setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 350) }}
              placeholder="Skriv ditt meddelande..."
              maxLength={1000}
              rows={5}
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 12,
                padding: '12px 14px',
                color: 'var(--white)',
                fontSize: 15,
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <div style={{ fontSize: 13, color: 'var(--error, #ff6b6b)', marginTop: 6 }}>{error}</div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '14px',
                background: text.trim() && !sending ? 'var(--blue)' : 'var(--bg-card-2)',
                color: text.trim() && !sending ? '#fff' : 'var(--text-muted)',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {sending ? 'Skickar...' : 'Skicka feedback'}
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  )
}
