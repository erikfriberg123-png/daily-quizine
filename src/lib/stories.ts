import { supabase } from './supabase'

// Only letters (incl. Swedish), digits, spaces and ,.!?
// Newlines are allowed inside the story text.
const ALLOWED_STORY = /^[a-zA-ZåäöÅÄÖéèêëàâùûüïîôœæç0-9 ,.!?\r\n]+$/
const ALLOWED_NAME  = /^[a-zA-ZåäöÅÄÖéèêëàâùûüïîôœæç0-9 ,.!?]+$/

export function validateStoryText(text: string): string | null {
  const t = text.trim()
  if (!t) return 'Berätta något — fältet får inte vara tomt.'
  if (t.length < 20) return 'Historien är för kort (minst 20 tecken).'
  if (t.length > 2000) return 'Historien är för lång (max 2 000 tecken).'
  if (!ALLOWED_STORY.test(t))
    return 'Texten innehåller otillåtna tecken. Endast bokstäver, siffror och , . ! ? är tillåtna.'
  return null
}

export function validateDisplayName(name: string): string | null {
  const n = name.trim()
  if (!n) return null // empty = anonymous, that's fine
  if (n.length > 50) return 'Namnet är för långt (max 50 tecken).'
  if (!ALLOWED_NAME.test(n))
    return 'Namnet innehåller otillåtna tecken.'
  return null
}

export async function submitStory(
  storyText: string,
  displayName: string | null,
  imageUrl: string | null,
  userId: string | null,
): Promise<{ error?: string }> {
  const { error } = await supabase.from('restaurant_stories').insert({
    user_id: userId ?? null,
    display_name: displayName?.trim() || null,
    story_text: storyText.trim(),
    image_url: imageUrl ?? null,
    status: 'pending',
  })
  return error ? { error: error.message } : {}
}

const STORY_BUCKET = 'story-images'

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let { width, height } = img
      if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX }
      else if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Komprimering misslyckades')),
        'image/jpeg', 0.80,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

export async function uploadStoryImage(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const blob = await compressImage(file)
    const filename = `story_${Date.now()}.jpg`
    const { error: uploadErr } = await supabase.storage
      .from(STORY_BUCKET)
      .upload(filename, blob, { contentType: 'image/jpeg', upsert: false })
    if (uploadErr) return { error: uploadErr.message }
    const { data } = supabase.storage.from(STORY_BUCKET).getPublicUrl(filename)
    return { url: data.publicUrl }
  } catch {
    return { error: 'Bilduppladdning misslyckades.' }
  }
}
