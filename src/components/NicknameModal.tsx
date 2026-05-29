import { useState, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { validateUsername, checkUsernameAvailable, saveUsername } from '../lib/profile'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'

interface Props {
  user: User
  currentUsername?: string | null
  onSave: (username: string) => void
  onClose?: () => void
}

export function NicknameModal({ user, currentUsername, onSave, onClose }: Props) {
  const keyboardOffset = useKeyboardOffset()
  const [nick, setNick] = useState(currentUsername ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(currentUsername ? true : null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const trimmed = nick.trim()

    if (!trimmed) {
      setValidationError(null)
      setAvailable(null)
      setChecking(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    const err = validateUsername(trimmed)
    if (err) {
      setValidationError(err)
      setAvailable(null)
      setChecking(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    // Unchanged from current username — no need to check availability
    if (trimmed === currentUsername?.trim()) {
      setValidationError(null)
      setAvailable(true)
      setChecking(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    setValidationError(null)
    setChecking(true)
    setAvailable(null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const ok = await checkUsernameAvailable(trimmed, user.id)
      setChecking(false)
      setAvailable(ok)
    }, 600)
  }, [nick, currentUsername, user.id])

  const isUnchanged = nick.trim() === currentUsername?.trim()
  const canSubmit = !validationError && available === true && !saving && nick.trim().length >= 2

  const handleSave = async () => {
    if (!canSubmit) return
    setSaving(true)
    setSaveError('')
    try {
      await saveUsername(user.id, nick)
      onSave(nick.trim())
    } catch {
      setSaveError('Något gick fel. Försök igen.')
      setSaving(false)
    }
  }

  const borderColor = validationError
    ? 'var(--error)'
    : available === true
    ? '#4ade80'
    : available === false
    ? 'var(--error)'
    : 'var(--border)'

  const statusText = saveError
    ? { text: saveError, color: 'var(--error)' }
    : validationError
    ? { text: validationError, color: 'var(--error)' }
    : available === false
    ? { text: 'Det smeknamnet är redan taget', color: 'var(--error)' }
    : available === true && !isUnchanged
    ? { text: 'Smeknamnet är ledigt!', color: '#4ade80' }
    : null

  const isEditMode = !!currentUsername || !!onClose

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(3,12,26,0.92)', backdropFilter: 'blur(6px)' }}
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
          transition: 'bottom 0.2s ease',
        }}
      >
        <div
          className="fade-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px 24px 0 0',
            padding: '28px 24px',
            paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
            width: '100%',
            maxWidth: 460,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {onClose && (
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4, cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
          <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 10 }}>👤</div>
          <div style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 6, color: 'var(--cream)' }}>
            {isEditMode ? 'Byt smeknamn' : 'Välj ditt smeknamn'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginBottom: 22 }}>
            Smeknamnet syns på topplistan och fungerar på hela Quizine.
          </div>

          <div style={{ position: 'relative', marginBottom: 6 }}>
            <input
              autoFocus
              value={nick}
              onChange={(e) => { setNick(e.target.value); setSaveError('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              placeholder="Ditt smeknamn"
              maxLength={30}
              style={{
                width: '100%',
                background: '#0A1628',
                border: `1.5px solid ${borderColor}`,
                borderRadius: 12,
                padding: '13px 44px 13px 14px',
                color: 'var(--white)',
                fontSize: 16,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16, color: checking ? 'var(--text-muted)' : available === true ? '#4ade80' : available === false ? 'var(--error)' : 'transparent',
            }}>
              {checking ? '···' : available === true ? '✓' : available === false ? '✗' : ''}
            </div>
          </div>

          <div style={{ fontSize: 12, minHeight: 18, marginBottom: 14, paddingLeft: 2 }}>
            {statusText && (
              <span style={{ color: statusText.color }}>{statusText.text}</span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '15px',
              background: canSubmit
                ? 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)'
                : 'var(--bg-card-2)',
              color: canSubmit ? 'var(--cream)' : 'var(--text-muted)',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSubmit ? '0 4px 20px var(--gold-glow)' : 'none',
            }}
          >
            {saving ? 'Sparar...' : isEditMode ? 'Spara smeknamn' : 'Välj smeknamn'}
          </button>
        </div>
      </div>
    </div>
  )
}
