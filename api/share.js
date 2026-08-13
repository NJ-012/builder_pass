/**
 * Stores a generated graphic and mints a permalink for it.
 *
 * The permalink is what makes the "share via link" route work: /s/<token>
 * renders an HTML page whose og:image is this graphic, so X shows the card
 * instead of a blank thumbnail. The token carries the blob URL directly, so
 * no database is needed.
 *
 * Requires BLOB_READ_WRITE_TOKEN. Without it this returns 503 and the client
 * falls back to attaching the PNG to the post itself.
 */

export const config = { api: { bodyParser: false } }

const MAX_BYTES = 8 * 1024 * 1024

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BYTES) {
        reject(new Error('Image too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export function encodeToken(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeToken(token) {
  try {
    const data = JSON.parse(Buffer.from(String(token), 'base64url').toString('utf8'))
    // Only ever trust a URL we minted on our own blob host.
    if (typeof data?.u !== 'string' || !/^https:\/\/[a-z0-9.-]+\.(?:vercel-storage|public\.blob\.vercel-storage)\.com\//i.test(data.u)) {
      return null
    }
    return data
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'sharing_not_configured',
      message: 'BLOB_READ_WRITE_TOKEN is not set. The client will attach the PNG instead.',
    })
  }

  try {
    const body = await readRawBody(req)
    if (!body.length) return res.status(400).json({ error: 'Empty body' })

    const { put } = await import('@vercel/blob')

    const name = String(req.query.name || 'builder').slice(0, 40)
    const title = String(req.query.title || '').slice(0, 60)
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase() || 'builder'

    const blob = await put(`frames/hh-goa-${safeName}-${Date.now()}.png`, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    })

    const token = encodeToken({ u: blob.url, n: name, t: title })

    return res.status(200).json({
      imageUrl: blob.url,
      pageUrl: `/s/${token}`,
    })
  } catch (error) {
    const tooLarge = error?.message === 'Image too large'
    return res.status(tooLarge ? 413 : 500).json({
      error: tooLarge ? 'image_too_large' : 'upload_failed',
    })
  }
}
