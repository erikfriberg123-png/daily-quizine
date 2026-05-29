import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSegmentConfig } from '../config/segments'

interface Props {
  senderName: string | null
  onClose: () => void
}

export function ShareModal({ senderName, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const seg = getSegmentConfig()
  const segmentUrl = `https://daily.quizine.se/${seg.id}/`
  const segmentName = seg.subtitle

  const handleSend = async () => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ange en giltig e-postadress.')
      return
    }
    setSending(true)
    setError('')
    try {
      const { error: fnErr } = await supabase.functions.invoke('send-invite', {
        body: {
          senderName: senderName || 'En spelkollega',
          recipientEmail: trimmed,
          segmentName,
          segmentUrl,
        },
      })
      if (fnErr) throw fnErr
      setSent(true)
    } catch {
      setError('Något gick fel. Kontrollera e-postadressen och försök igen.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(3,12,26,0.88)', backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
          width: '100%',
          maxWidth: 460,
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4, cursor: 'pointer' }}
        >
          ✕
        </button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✉️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', marginBottom: 8 }}>
              Tipsmail skickat!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Vi skickade ett personligt tips till <strong style={{ color: 'var(--gold-light)' }}>{email.trim()}</strong>.
            </div>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              style={{
                padding: '10px 24px',
                background: 'var(--bg-card-2)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: 10,
              }}
            >
              Tipsa fler
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)',
                color: 'var(--cream)',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Stäng
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 10 }}>📨</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--white)', textAlign: 'center', marginBottom: 6 }}>
              Tipsa en kollega
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginBottom: 22 }}>
              Vi skickar ett personligt tips i ditt namn — de behöver inget konto för att spela.
            </div>

            <input
              autoFocus
              type="email"
              placeholder="kollegans@epost.se"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
              style={{
                width: '100%',
                background: '#0A1628',
                border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '13px 14px',
                color: 'var(--white)',
                fontSize: 16,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 8,
                transition: 'border-color 0.2s',
              }}
            />

            {error && (
              <div style={{ fontSize: 12, color: 'var(--error)', marginBottom: 10, paddingLeft: 2 }}>
                {error}
              </div>
            )}

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, paddingLeft: 2, lineHeight: 1.5 }}>
              Tipset skickas från <strong style={{ color: 'var(--gold-light)' }}>{senderName || 'dig'}</strong> och innehåller en länk till {segmentName}.
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !email.trim()}
              style={{
                width: '100%',
                padding: '15px',
                background: sending || !email.trim()
                  ? 'var(--bg-card-2)'
                  : 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)',
                color: sending || !email.trim() ? 'var(--text-muted)' : 'var(--cream)',
                border: 'none',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: sending || !email.trim() ? 'default' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: sending || !email.trim() ? 'none' : '0 4px 20px var(--gold-glow)',
              }}
            >
              {sending ? 'Skickar…' : '📨  Skicka tipsmail'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
