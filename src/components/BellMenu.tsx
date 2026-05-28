import { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Props {
  user: User
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

async function getSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  return navigator.serviceWorker.register('/sw.js').catch(() => null)
}

export function BellMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [emailOn, setEmailOn] = useState(false)
  const [pushOn, setPushOn] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [pushBlocked, setPushBlocked] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('email_reminders')
        .eq('id', user.id)
        .single()
      setEmailOn(data?.email_reminders ?? false)

      if ('serviceWorker' in navigator && 'PushManager' in window) {
        if (Notification.permission === 'denied') {
          setPushBlocked(true)
        } else {
          const reg = await navigator.serviceWorker.ready.catch(() => null)
          if (reg) {
            const sub = await reg.pushManager.getSubscription()
            setPushOn(!!sub)
          }
        }
      }
    }
    load()
  }, [user.id])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggleEmail = async () => {
    setEmailLoading(true)
    const next = !emailOn
    await supabase.from('profiles').update({ email_reminders: next }).eq('id', user.id)
    setEmailOn(next)
    setEmailLoading(false)
  }

  const togglePush = async () => {
    if (!VAPID_PUBLIC_KEY) return
    setPushLoading(true)
    try {
      const reg = await getSwRegistration()
      if (!reg) return

      if (pushOn) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', sub.endpoint)
        }
        setPushOn(false)
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        const json = sub.toJSON()
        const keys = json.keys as Record<string, string>
        await supabase.from('push_subscriptions').upsert(
          { user_id: user.id, endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth },
          { onConflict: 'user_id,endpoint' }
        )
        setPushOn(true)
      }
    } catch {
      if (Notification.permission === 'denied') setPushBlocked(true)
    } finally {
      setPushLoading(false)
    }
  }

  const isActive = emailOn || pushOn
  const pushAvailable = 'PushManager' in window && !!VAPID_PUBLIC_KEY

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Påminnelser"
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: open || isActive ? 'rgba(201,146,42,0.18)' : 'var(--bg-card-2)',
          border: `1px solid ${open || isActive ? 'rgba(201,146,42,0.4)' : 'var(--border)'}`,
          color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <BellIcon filled={isActive} />
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
            width: 250,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            zIndex: 300,
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)' }}>
              Dagliga påminnelser
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Skickas kl. 08:00 varje dag
            </div>
          </div>

          {/* Email row */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: pushAvailable ? '1px solid var(--border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>📧</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>E-post</div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>
            <Toggle on={emailOn} disabled={emailLoading} onToggle={toggleEmail} />
          </div>

          {/* Push row */}
          {pushAvailable && (
            <div
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>
                    Webbnotis
                  </div>
                  <div style={{ fontSize: 11, color: pushBlocked ? 'var(--error)' : 'var(--text-muted)' }}>
                    {pushBlocked ? 'Blockerad i webbläsaren' : 'Denna enhet'}
                  </div>
                </div>
              </div>
              <Toggle on={pushOn} disabled={pushLoading || pushBlocked} onToggle={togglePush} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({
  on,
  disabled,
  onToggle,
}: {
  on: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-checked={on}
      role="switch"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? 'var(--gold)' : 'var(--bg)',
        border: `1px solid ${on ? 'var(--gold)' : 'var(--border)'}`,
        position: 'relative',
        cursor: disabled ? 'default' : 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s, border-color 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: on ? 22 : 4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}

function BellIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="currentColor" />
        <circle cx="12" cy="8" r="6" fill="currentColor" opacity="0" />
      </svg>
    )
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
