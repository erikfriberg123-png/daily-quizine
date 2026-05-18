import { SEGMENT } from '../config/segments'

export function SegmentLogo() {
  if (SEGMENT === 'voo') {
    return (
      <div style={{
        width: 38, height: 38,
        background: 'var(--bg-card-2)',
        border: '1px solid var(--border-light)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 14px var(--gold-glow)',
        flexShrink: 0,
      }}>
        <svg width="24" height="24" viewBox="0 0 52 52" fill="none"
          style={{ filter: 'drop-shadow(0 0 5px #00D4FF)' }}>
          <path d="M16 10 C16 10 12 14 12 20 C12 27 18 32 26 32 C34 32 40 27 40 20 C40 14 36 10 36 10"
            stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="26" cy="34" r="8" stroke="#00D4FF" strokeWidth="2.5" fill="none"/>
          <text x="26" y="38" textAnchor="middle" fontFamily="DM Sans,sans-serif"
            fontSize="9" fontWeight="700" fill="#00D4FF">?</text>
        </svg>
      </div>
    )
  }

  return (
    <div style={{
      width: 38, height: 38,
      background: 'var(--bg-card-2)',
      border: '1px solid var(--border-light)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 14px var(--gold-glow)',
      flexShrink: 0,
    }}>
      <svg width="24" height="24" viewBox="0 0 52 52" fill="none"
        style={{ filter: 'drop-shadow(0 0 5px #9B59B6)' }}>
        <line x1="8" y1="8" x2="26" y2="34" stroke="#9B59B6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="44" y1="8" x2="26" y2="34" stroke="#9B59B6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="26" y1="34" x2="26" y2="46" stroke="#9B59B6" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="19" y1="46" x2="33" y2="46" stroke="#9B59B6" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="26" y="27" textAnchor="middle" fontFamily="DM Sans,sans-serif"
          fontSize="13" fontWeight="700" fill="#9B59B6">?</text>
      </svg>
    </div>
  )
}
