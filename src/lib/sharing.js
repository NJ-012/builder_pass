/**
 * Share pipeline.
 *
 * The task requires a working share flow: a pre-filled caption carrying
 * #FrameInGoa, and — when we fall back to sharing a link instead of the raw
 * file — a link whose preview actually shows the generated graphic.
 *
 * Order of preference:
 *   1. Native share sheet with the PNG attached (mobile: posts the image itself)
 *   2. X web intent + a /s/ permalink whose OG image is the generated graphic
 *   3. X web intent, text only, with the PNG downloaded so it can be attached
 */

export const HASHTAG = '#FrameInGoa'

const CAPTION_OPENERS = [
  'Locked in for Hacker House Goa 2026.',
  'Pass issued. See you on the sand.',
  'Just minted my Hacker House Goa 2026 builder pass.',
  'Goa, October. Consider this my RSVP.',
]

/** Deterministic pick so a given builder always gets the same opener. */
function pickOpener(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return CAPTION_OPENERS[Math.abs(h) % CAPTION_OPENERS.length]
}

export function buildCaption({ name, builderTitle, stack, mode, teamName, url }) {
  const who = mode === 'squad' ? teamName || 'Our squad' : name || 'A builder'
  const opener = pickOpener(who)

  const lines = [opener, '']

  if (mode === 'squad') {
    lines.push(`${who} — building at HH Goa 2026 🌴`)
  } else {
    lines.push(`${who} — ${builderTitle || 'Builder'}${stack ? ` · ${stack}` : ''} 🌴`)
  }

  lines.push('', 'Make your own in about ten seconds:')
  if (url) lines.push(url)
  lines.push('', `${HASHTAG} #HHGoa2026`)

  return lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n')
}

export function buildXIntentUrl(caption, url) {
  // The permalink goes in `url` so X renders the OG card; keeping it out of
  // `text` avoids the link being duplicated in the composed tweet.
  const text = url ? caption.replace(url, '').replace(/\n{3,}/g, '\n\n').trim() : caption
  const params = new URLSearchParams({ text })
  if (url) params.set('url', url)
  return `https://x.com/intent/post?${params.toString()}`
}

/** True when this browser can put an actual image file into the share sheet. */
export function canShareFiles(blob) {
  if (typeof navigator === 'undefined' || !navigator.canShare || !navigator.share) return false
  try {
    const file = new File([blob], 'card.png', { type: 'image/png' })
    return navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

export async function shareNative(blob, filename, caption) {
  const file = new File([blob], filename, { type: 'image/png' })
  await navigator.share({ files: [file], text: caption })
}

/**
 * Uploads the artifact so the tweet's link preview can show it.
 * Returns a permalink, or null when sharing storage isn't configured — the
 * caller then falls back to a text-only intent plus a download.
 */
export async function uploadShareArtifact(blob, meta = {}) {
  const params = new URLSearchParams()
  if (meta.name) params.set('name', meta.name)
  if (meta.title) params.set('title', meta.title)

  const res = await fetch(`/api/share?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/png' },
    body: blob,
  })

  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  const data = await res.json()
  if (!data.pageUrl) throw new Error('Upload returned no permalink')
  return new URL(data.pageUrl, window.location.origin).toString()
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  // Fallback for non-secure contexts
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

export function slugify(str, fallback = 'builder') {
  const s = (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || fallback
}
