interface Props {
  label: string
  index: number
  state: 'idle' | 'correct' | 'wrong' | 'disabled'
  onClick: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function AnswerButton({ label, index, state, onClick }: Props) {
  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isDisabled = state === 'disabled' || isCorrect || isWrong

  let bg = 'var(--bg-card)'
  let border = 'var(--border)'
  let textColor = 'var(--white)'
  let badgeBg = 'var(--bg-card-2)'
  let badgeColor = 'var(--text-muted)'

  if (isCorrect) {
    bg = 'var(--success-bg)'
    border = 'var(--success)'
    badgeBg = 'var(--success)'
    badgeColor = '#000'
    textColor = 'var(--success)'
  } else if (isWrong) {
    bg = 'var(--error-bg)'
    border = 'var(--error)'
    badgeBg = 'var(--error)'
    badgeColor = '#fff'
    textColor = 'var(--error)'
  }

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 14,
        padding: '14px 16px',
        cursor: isDisabled ? 'default' : 'pointer',
        transition: 'all 0.18s ease',
        textAlign: 'left',
        opacity: state === 'disabled' ? 0.55 : 1,
        transform: isCorrect ? 'scale(1.01)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.borderColor = 'var(--blue)'
          e.currentTarget.style.background = 'var(--bg-card-2)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.background = 'var(--bg-card)'
        }
      }}
    >
      <span
        style={{
          minWidth: 28,
          height: 28,
          borderRadius: 8,
          background: badgeBg,
          color: badgeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 800,
          flexShrink: 0,
          transition: 'all 0.18s',
        }}
      >
        {LETTERS[index]}
      </span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: textColor,
          lineHeight: 1.4,
          transition: 'color 0.18s',
        }}
      >
        {label}
      </span>
    </button>
  )
}
