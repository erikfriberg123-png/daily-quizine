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

  if (SEGMENT === 'bygg') {
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
          style={{ filter: 'drop-shadow(0 0 5px #F5E0B0) drop-shadow(0 0 10px rgba(245,224,176,0.4))' }}>
          {/* Hard hat dome */}
          <path d="M13 31.6 Q13 21.7 26 18.3 Q39 21.7 39 31.6"
            stroke="#F5E0B0" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Brim */}
          <path d="M8.9 33 Q8.9 31.6 13 31.6 L39 31.6 Q43 31.6 43 33 Q43 34.7 39 34.7 L13 34.7 Q8.9 34.7 8.9 33Z"
            stroke="#F5E0B0" strokeWidth="2" strokeLinejoin="round" fill="none"/>
          {/* Center rib */}
          <line x1="26" y1="18.3" x2="26" y2="31.6"
            stroke="#F5E0B0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
          {/* Inner curve */}
          <path d="M14.6 31.6 Q14.6 30.6 26 30.1 Q37.4 30.6 37.4 31.6"
            stroke="#F5E0B0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
          <text x="26" y="30" textAnchor="middle" fontFamily="DM Sans,sans-serif"
            fontSize="13" fontWeight="800" fill="#F5E0B0">?</text>
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

  if (SEGMENT === 'fotboll') {
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
          style={{ filter: 'drop-shadow(0 0 5px #5BC8FF) drop-shadow(0 0 10px rgba(91,200,255,0.4))' }}>
          {/* Outer ball circle */}
          <circle cx="26" cy="26" r="16" stroke="#5BC8FF" strokeWidth="1.2" fill="none"/>
          {/* Centre pentagon */}
          <polygon points="26,17 34.5,23.3 31.2,33.2 20.8,33.2 17.6,23.3"
                   stroke="#5BC8FF" strokeWidth="1" strokeLinejoin="round" fill="none"/>
          {/* 5 radial seam lines */}
          <line x1="26" y1="17" x2="26" y2="10" stroke="#5BC8FF" strokeWidth="0.8"/>
          <line x1="34.5" y1="23.3" x2="41.4" y2="21.2" stroke="#5BC8FF" strokeWidth="0.8"/>
          <line x1="31.2" y1="33.2" x2="35.3" y2="38.9" stroke="#5BC8FF" strokeWidth="0.8"/>
          <line x1="20.8" y1="33.2" x2="16.7" y2="38.9" stroke="#5BC8FF" strokeWidth="0.8"/>
          <line x1="17.6" y1="23.3" x2="10.6" y2="21.2" stroke="#5BC8FF" strokeWidth="0.8"/>
          {/* 5 cross-seam lines */}
          <line x1="26" y1="14.2" x2="37.2" y2="22.4" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55"/>
          <line x1="37.2" y1="22.4" x2="32.8" y2="35.4" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55"/>
          <line x1="32.8" y1="35.4" x2="19.2" y2="35.4" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55"/>
          <line x1="19.2" y1="35.4" x2="14.9" y2="22.4" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55"/>
          <line x1="14.9" y1="22.4" x2="26" y2="14.2" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55"/>
          {/* Question mark */}
          <text x="26" y="31" textAnchor="middle" fontFamily="DM Sans,sans-serif"
            fontSize="11" fontWeight="900" fill="#5BC8FF">?</text>
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
