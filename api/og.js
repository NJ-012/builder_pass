/**
 * The permalink page behind /s/<token>.
 *
 * Its whole job is to carry og:image / twitter:image so a shared link renders
 * as the generated graphic rather than a default thumbnail. Humans who open
 * it see the image and a way back into the studio.
 */

import { decodeToken } from './share.js'

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export default function handler(req, res) {
  const token = req.query.token || req.query.id || ''
  const data = decodeToken(token)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  if (!data) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(404).send(
      page({
        title: 'Link not found — Hacker House Goa 2026',
        description: 'This share link is invalid or has expired.',
        image: '',
        heading: 'This link has expired',
        body: 'Make a fresh one — it takes about ten seconds.',
      })
    )
  }

  const name = data.n || 'A builder'
  const title = data.t ? `${name} — ${data.t}` : name

  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=86400')
  return res.status(200).send(
    page({
      title: `${title} · Hacker House Goa 2026`,
      description: `${name} is building at Hacker House Goa 2026. Make your own frame in seconds. #FrameInGoa`,
      image: data.u,
      heading: title,
      body: 'Building at Hacker House Goa 2026 · 28—31 Oct · #FrameInGoa',
    })
  )
}

function page({ title, description, image, heading, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#061d15">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${
  image
    ? `<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="${esc(image)}">`
    : ''
}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100svh;display:grid;place-items:center;padding:clamp(1.25rem,5vw,3rem);
    background:radial-gradient(120% 70% at 50% -10%,#2a6b42,transparent 60%),#061d15;
    color:#fcf6e6;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    text-align:center;line-height:1.6}
  main{display:flex;flex-direction:column;align-items:center;gap:1.5rem;max-width:640px;width:100%}
  img{width:100%;height:auto;border-radius:12px;border:1.5px solid rgba(245,220,94,.42);
    box-shadow:0 30px 64px -26px rgba(0,0,0,.75)}
  h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.6rem,4vw,2.4rem);
    text-transform:uppercase;letter-spacing:-.02em;line-height:1.05;font-weight:700}
  p{color:rgba(252,246,230,.62);font-size:.8125rem;letter-spacing:.1em;text-transform:uppercase;
    font-family:ui-monospace,'SF Mono',Menlo,monospace}
  a{display:inline-flex;align-items:center;gap:.5em;padding:.85em 1.6em;border-radius:999px;
    background:#f5dc5e;color:#061d15;font-weight:650;text-decoration:none;
    transition:transform .13s ease,background-color .22s ease}
  a:hover{transform:translateY(-2px);background:#ffe783}
</style>
</head>
<body>
<main>
  ${image ? `<img src="${esc(image)}" alt="${esc(heading)}">` : ''}
  <h1>${esc(heading)}</h1>
  <p>${esc(body)}</p>
  <a href="/">Make yours →</a>
</main>
</body>
</html>`
}
