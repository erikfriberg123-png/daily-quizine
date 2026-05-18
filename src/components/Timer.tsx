import { useEffect, useRef } from 'react'

interface Props {
  duration: number
  timeLeft: number
  onExpire: () => void
}

export function Timer({ duration, timeLeft, onExpire }: Props) {
  const calledRef = useRef(false)

  useEffect(() => {
    if (timeLeft <= 0 && !calledRef.current) {
      calledRef.current = true
      onExpire()
    }
    if (timeLeft > 0) calledRef.current = false
  }, [timeLeft, onExpire])

  const pct = Math.max(0, timeLeft / duration)
  const urgent = timeLeft <= 5

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
          letterSpacing: 1.5, textTransform: 'uppercase' as const,
        }}>
          Tid kvar
        </span>
        <span style={{
          fontSize: 16, fontWeight: 900,
          color: urgent ? 'var(--rust-light)' : 'var(--gold-light)',
          transition: 'color 0.3s',
          animation: urgent ? 'pulse 0.6s ease infinite' : 'none',
        }}>
          {timeLeft}s
        </span>
      </div>

      <div style={{ position: 'relative' as const }}>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct * 100}%`,
            borderRadius: 4,
            background: urgent
              ? 'linear-gradient(90deg, #C0441A 0%, #E05527 80%, #FF6633 100%)'
              : 'var(--timer-bar)',
            transition: 'width 1s linear',
          }} />
        </div>

        {pct > 0.04 && (
          <div
            className="glow-tip"
            style={{
              position: 'absolute' as const,
              left: `calc(${pct * 100}% - 7px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 12,
              color: urgent ? '#FF6633' : 'var(--timer-tip)',
              pointerEvents: 'none' as const,
              lineHeight: 1,
            }}
          >✦</div>
        )}
      </div>
    </div>
  )
}
