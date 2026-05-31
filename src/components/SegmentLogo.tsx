import { SEGMENT } from '../config/segments'

export function SegmentLogo() {
  if (SEGMENT === 'blaljus') {
    return (
      <div style={{
        width: 38, height: 38,
        background: 'transparent',
        border: '1px solid var(--border-light)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 14px var(--gold-glow)',
        flexShrink: 0,
      }}>
        <svg width="24" height="24" viewBox="0 0 52 52" fill="none"
          style={{ filter: 'drop-shadow(0 0 5px #FF1A3C) drop-shadow(0 0 10px rgba(255,26,60,0.4))' }}>
          <rect x="11" y="38" width="30" height="4" rx="2" stroke="#FF1A3C" strokeWidth="2" fill="none"/>
          <path d="M14 38 L16 30 L36 30 L38 38" stroke="#FF1A3C" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          <path d="M16 30 Q18 20 26 18 Q34 20 36 30" stroke="#FF1A3C" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M19 30 Q21 23 26 21 Q31 23 33 30" stroke="#FF1A3C" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
          <line x1="26" y1="18" x2="26" y2="11" stroke="#FF1A3C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          <line x1="26" y1="18" x2="19" y2="13" stroke="#FF1A3C" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/>
          <line x1="26" y1="18" x2="33" y2="13" stroke="#FF1A3C" strokeWidth="1.2" strokeLinecap="round" opacity="0.25"/>
          <circle cx="26" cy="18" r="2" fill="#FF1A3C" opacity="0.7"/>
          <text x="26" y="36" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="700" fill="#FF1A3C">?</text>
        </svg>
      </div>
    )
  }

  if (SEGMENT === 'it') {
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
          style={{ filter: 'drop-shadow(0 0 6px #00FF64)' }}>
          <path d="M20 8 L8 26 L20 44" stroke="#00FF64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M32 8 L44 26 L32 44" stroke="#00FF64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <text x="26" y="32" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="17" fontWeight="700" fill="#00FF64">?</text>
        </svg>
      </div>
    )
  }

  if (SEGMENT === 'handel') {
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
          style={{ filter: 'drop-shadow(0 0 6px #FF6B2B) drop-shadow(0 0 14px rgba(255,107,43,0.4))' }}>
          {/* Briefcase body */}
          <rect x="6" y="20" width="40" height="28" rx="5" stroke="#FF6B2B" strokeWidth="2.5" fill="none"/>
          {/* Handle — rectangular, sits on top */}
          <rect x="18" y="11" width="16" height="10" rx="3" stroke="#FF6B2B" strokeWidth="2.5" fill="none"/>
          {/* Question mark */}
          <text x="26" y="39" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="15" fontWeight="800" fill="#FF6B2B">?</text>
        </svg>
      </div>
    )
  }

  if (SEGMENT === 'hr_lon') {
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
          style={{ filter: 'drop-shadow(0 0 5px #FFE033) drop-shadow(0 0 10px rgba(255,224,51,0.4))' }}>
          {/* Outer shield */}
          <path d="M26 6 L40 11 L40 27 Q40 37 26 42 Q12 37 12 27 L12 11 Z"
            stroke="#FFE033" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
          {/* Inner shield ring */}
          <path d="M26 12 L36 16 L36 27 Q36 34 26 38 Q16 34 16 27 L16 16 Z"
            stroke="#FFE033" strokeWidth="1" strokeLinejoin="round" fill="none" opacity="0.35"/>
          {/* Question mark */}
          <text x="26" y="33" textAnchor="middle" fontFamily="DM Sans,sans-serif"
            fontSize="18" fontWeight="800" fill="#FFE033">?</text>
        </svg>
      </div>
    )
  }

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
