import { useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'
import {
  submitStory, uploadStoryImage,
  validateStoryText, validateDisplayName,
} from '../lib/stories'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'
import { getSegmentConfig, SEGMENT } from '../config/segments'

interface Props {
  user: User | null
  username: string | null
  onClose: () => void
}

const PLACEHOLDERS: Record<string, string> = {
  quizine: 'Berätta en intressant händelse som du varit med om på restaurang.',
  voo:     'Berätta en intressant händelse från din tid i vården.',
  it:      'Berätta en intressant arbetsrelaterad händelse från din tid i IT-branschen.',
  blaljus: 'Berätta en intressant händelse från din tid som blåljuspersonal.',
}
const DEFAULT_TEXT = PLACEHOLDERS[SEGMENT] ?? 'Berätta en intressant arbetsrelaterad händelse.'

export function StoryModal({ user, username, onClose }: Props) {
  const seg = getSegmentConfig()
  const keyboardOffset = useKeyboardOffset()
  const [text, setText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [displayName, setDisplayName] = useState(username ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [textError, setTextError] = useState('')
  const [nameError, setNameError] = useState('')
  const [imageError, setImageError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (val: string) => {
    // Strip disallowed characters live (allow letters incl. Swedish, digits, spaces, ,.!? and newlines)
    const sanitized = val.replace(/[^a-zA-ZåäöÅÄÖéèêëàâùûüïîôœæç0-9 ,.!?\r\n]/g, '')
    setText(sanitized)
    if (textError) setTextError('')
  }

  const handleNameChange = (val: string) => {
    const sanitized = val.replace(/[^a-zA-ZåäöÅÄÖéèêëàâùûüïîôœæç0-9 ,.!?]/g, '')
    setDisplayName(sanitized)
    if (nameError) setNameError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setImageError('Bilden är för stor (max 15 MB).')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageError('')
  }

  const handleSubmit = async () => {
    const textErr = validateStoryText(text)
    const nameErr = isAnonymous ? null : validateDisplayName(displayName)
    if (textErr) { setTextError(textErr); return }
    if (nameErr) { setNameError(nameErr); return }

    setSending(true)

    let uploadedUrl: string | null = null
    if (imageFile) {
      setUploading(true)
      const result = await uploadStoryImage(imageFile)
      setUploading(false)
      if ('error' in result) {
        setImageError(result.error)
        setSending(false)
        return
      }
      uploadedUrl = result.url
    }

    const finalName = isAnonymous ? null : (displayName.trim() || null)
    try {
      const { error } = await submitStory(text, finalName, uploadedUrl, user?.id ?? null)
      if (error) { setTextError('Något gick fel. Försök igen.'); return }
      setSent(true)
    } catch {
      setTextError('Något gick fel. Försök igen.')
    } finally {
      setSending(false)
    }
  }

  const charLeft = 2000 - text.length

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* dim backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }}
        onClick={onClose}
      />
      {/* sheet — sits right above the keyboard */}
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
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          width: '100%',
          maxWidth: 560,
          maxHeight: '85dvh',
          overflowY: 'auto',
          padding: '24px 20px 40px',
          paddingBottom: `max(40px, env(safe-area-inset-bottom))`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)' }}>
              {seg.storyButtonText}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
              Intressanta historier kan publiceras på sajten.
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, padding: 4, flexShrink: 0 }}>✕</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
              Tack för din historia!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Vi läser igenom den och om den är läsvärd publicerar vi den på sajten.
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '13px 36px',
                background: 'var(--orange)',
                color: '#fff',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Stäng
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>

            {/* Story textarea */}
            <div>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={DEFAULT_TEXT}
                rows={7}
                maxLength={2000}
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: `1.5px solid ${textError ? 'var(--error, #ff6b6b)' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '14px',
                  color: 'var(--white)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {textError
                  ? <span style={{ fontSize: 12, color: 'var(--error, #ff6b6b)' }}>{textError}</span>
                  : <span />}
                <span style={{ fontSize: 12, color: charLeft < 100 ? 'var(--orange)' : 'var(--text-muted)' }}>
                  {charLeft} tecken kvar
                </span>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                Bild (valfritt)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img
                    src={imagePreview}
                    alt=""
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, display: 'block' }}
                  />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: 28, height: 28, cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '100%',
                    border: '1.5px dashed var(--border)',
                    borderRadius: 14,
                    padding: '14px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  📸  Lägg till en bild
                </button>
              )}
              {imageError && <div style={{ fontSize: 12, color: 'var(--error, #ff6b6b)', marginTop: 4 }}>{imageError}</div>}
            </div>

            {/* Anonymous toggle */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onClick={() => setIsAnonymous(v => !v)}
            >
              <div
                style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${isAnonymous ? 'var(--orange)' : 'var(--border)'}`,
                  background: isAnonymous ? 'var(--orange)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isAnonymous && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Skicka anonymt</span>
            </div>

            {/* Name input */}
            {!isAnonymous && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Ditt namn (valfritt)
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Skriv ditt namn eller alias..."
                  maxLength={50}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: `1.5px solid ${nameError ? 'var(--error, #ff6b6b)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: 'var(--white)',
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {nameError && <div style={{ fontSize: 12, color: 'var(--error, #ff6b6b)', marginTop: 4 }}>{nameError}</div>}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={sending || uploading}
              style={{
                width: '100%',
                padding: '15px',
                background: sending || uploading ? 'var(--bg-card-2)' : 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)',
                color: sending || uploading ? 'var(--text-muted)' : '#fff',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                border: 'none',
                cursor: sending || uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {uploading ? 'Laddar upp bild...' : sending ? 'Skickar...' : 'Skicka in min historia  →'}
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-dim, #4a4a6a)', textAlign: 'center', lineHeight: 1.5 }}>
              Historier granskas innan publicering. Inga personuppgifter om tredje part.
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
