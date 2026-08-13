/**
 * Photo intake.
 *
 * The brief is explicit that people will upload whatever their phone gives
 * them — portrait, landscape, off-centre, HEIC straight from an iPhone, 12 MP
 * — and that they should not have to crop first. So intake normalises every
 * file to a sane, EXIF-corrected, downscaled bitmap before it ever reaches the
 * renderer. That is also what keeps "upload to result" feeling instant: the
 * canvas never has to push 12 megapixels around on every keystroke.
 */

const MAX_EDGE = 1800 // plenty for a 2160px export of a framed photo
const MAX_SIZE = 32 * 1024 * 1024

const VALID_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
]
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.heif']

export const ACCEPT_ATTR =
  'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif'

export function isHeicFile(file) {
  const name = (file.name || '').toLowerCase()
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  )
}

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `That image is ${(file.size / 1024 / 1024).toFixed(0)} MB. Please keep it under 32 MB.`,
    }
  }

  const ext = '.' + (file.name || '').split('.').pop().toLowerCase()
  const typeValid = VALID_TYPES.includes(file.type) || VALID_EXTENSIONS.includes(ext)

  if (!typeValid) {
    return { valid: false, error: 'That file type is not supported. Try a JPG, PNG, WEBP or HEIC.' }
  }

  return { valid: true }
}

export async function convertHeicToJpeg(file) {
  const heic2any = (await import('heic2any')).default
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(blob) ? blob[0] : blob
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

/** Decodes with EXIF orientation applied, falling back to a plain <img>. */
async function decode(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' })
    } catch {
      /* Safari < 15 and friends — fall through */
    }
  }
  return loadImage(await fileToDataUrl(blob))
}

/**
 * Normalises any uploaded file into a ready-to-render data URL.
 * Resolves to { dataUrl, width, height, aspect }.
 */
export async function prepareImage(file) {
  const validation = validateImageFile(file)
  if (!validation.valid) throw new Error(validation.error)

  let source = file
  if (isHeicFile(file)) {
    try {
      source = await convertHeicToJpeg(file)
    } catch {
      throw new Error("Couldn't read that HEIC. On iPhone, try sharing it as JPG — or pick another photo.")
    }
  }

  let bitmap
  try {
    bitmap = await decode(source)
  } catch {
    throw new Error("That image couldn't be opened. It may be corrupted — try another one.")
  }

  const sw = bitmap.width || bitmap.naturalWidth
  const sh = bitmap.height || bitmap.naturalHeight
  if (!sw || !sh) throw new Error('That image has no readable dimensions.')

  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh))
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  if (bitmap.close) bitmap.close()

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: w,
    height: h,
    aspect: w / h,
  }
}
