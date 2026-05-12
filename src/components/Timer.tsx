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

  const barColor = urgent
    ? 'var(--error)'
    : timeLeft <= 8
    ? 'var(--orange)'
    : 'var(--blue)'

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1 }}>
          TIMER
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: urgent ? 'var(--error)' : 'var(--white)',
            transition: 'color 0.3s',
            animation: urgent ? 'pulse 0.6s ease infinite' : 'none',
          }}
        >
          {timeLeft}s
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: 'var(--bg-card-2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            borderRadius: 3,
            background: barColor,
            transition: 'width 1s linear, background 0.3s',
            boxShadow: `0 0 8px ${barColor}`,
          }}
        />
      </div>
    </div>
  )
}
