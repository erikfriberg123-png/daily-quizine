import { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { NicknameModal } from './NicknameModal'

interface Props {
  user: User
  username: string | null
  onUsernameChange: (name: string) => void
}

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

export function UserMenu({ user, username, onUsernameChange }: Props) {
  const [open, setOpen] = useState(false)
  const [showNickname, setShowNickname] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    await supabase.auth.signOut()
  }

  const displayName = username ?? user.email?.split('@')[0] ?? 'Användare'

  return (
    <>
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Användarmeny"
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: open ? 'rgba(201,146,42,0.18)' : 'var(--bg-card-2)',
            border: `1px solid ${open ? 'rgba(201,146,42,0.4)' : 'var(--border)'}`,
            color: open ? 'var(--gold-light)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
        >
          <PersonIcon />
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              width: 210,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 300,
            }}
          >
            {/* User info */}
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>
                Inloggad som
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              {!username && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Inget smeknamn valt</div>
              )}
            </div>

            {/* Set / change nickname */}
            <button
              onClick={() => { setOpen(false); setShowNickname(true) }}
              style={{
                width: '100%',
                padding: '11px 14px',
                textAlign: 'left',
                background: 'none',
                color: 'var(--white)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 15, opacity: 0.8 }}>✏️</span>
              {username ? 'Byt smeknamn' : 'Ange smeknamn'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '11px 14px',
                textAlign: 'left',
                background: 'none',
                color: 'var(--error)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 15, opacity: 0.8 }}>↩</span>
              Logga ut
            </button>
          </div>
        )}
      </div>

      {showNickname && (
        <NicknameModal
          user={user}
          onSave={(name) => { onUsernameChange(name); setShowNickname(false) }}
          onClose={() => setShowNickname(false)}
        />
      )}
    </>
  )
}
