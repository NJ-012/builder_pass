/**
 * HACKER HOUSE GOA 2026 — GENERATIVE IDENTITY ENGINE 2.0 (TYPOGRAPHY PASS)
 * 
 * Legibility First: Primary Name (+30%), Role (+25%), Domain/Energy (+20%), Headers (+20%)
 * Intelligent Long Name Fitting.
 */

import { loadImage } from './imageUtils'
import { WORLDS, ARCHETYPES, EDITIONS, COMPOSITION_SYSTEMS_12 } from '../constants/worlds'

export const FORMATS = {
  BUILDER_ID: { id: 'card', width: 1080, height: 1350, label: 'Builder ID' },
  PFP: { id: 'pfp', width: 1080, height: 1080, label: 'PFP Frame' },
  SHARE_CARD: { id: 'share', width: 1200, height: 630, label: 'Share Card' },
  SQUAD: { id: 'squad', width: 1080, height: 1350, label: 'Squad Pass' },
}

const BRAND = {
  greenDeep: '#073B2A',
  emerald: '#0B5D3B',
  sunYellow: '#FFD21C',
  cream: '#FFF1C7',
  tileRed: '#C94B36',
  festivalPink: '#F02B72',
  night: '#071A18',
  textDim: '#7A9A8A',
}

// Deterministic PRNG
function seededRandom(seedStr) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0
  }
  let s = Math.abs(h) || 247
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Generate Identity DNA 2.0 Object
export function generateIdentityDNA(identity) {
  const subject = identity.mode === 'squad' ? identity.teamName : identity.name
  const normName = (subject || 'BUILDER').trim().toLowerCase()
  const seedString = `${normName}-${identity.stack || ''}-${identity.energy || ''}-${identity.style || ''}-${identity.builderId || ''}`
  const rng = seededRandom(seedString)

  let rawHash = 0
  for (let i = 0; i < seedString.length; i++) {
    rawHash = Math.imul(31, rawHash) + seedString.charCodeAt(i) | 0
  }
  const posHash = Math.abs(rawHash) || 247

  const compIndex = Math.floor(rng() * 12)
  const envVarIndex = Math.floor(rng() * 5)
  const editionIndex = Math.floor(rng() * EDITIONS.length)

  const world = WORLDS[identity.style] || WORLDS.goan
  const archetype = ARCHETYPES[identity.energy] || ARCHETYPES.MAKER
  const domainCode = (identity.stack || 'DEV').substring(0, 3).toUpperCase()
  const hexSeed = (posHash.toString(16) + '6AE7').substring(0, 4).toUpperCase()

  const identityCode = `HHG26 / ${domainCode} / ${archetype.code} / ${world.code} / ${hexSeed}`

  return {
    seed: posHash,
    compositionId: compIndex,
    compositionName: COMPOSITION_SYSTEMS_12[compIndex],
    envVariantIndex: envVarIndex,
    editionName: EDITIONS[editionIndex],
    identityCode: identityCode,
    hexSeed: hexSeed,
    nameLength: normName.length,
    rng: rng,
  }
}

/**
 * Decoded-image cache. The studio re-renders on every keystroke and every
 * slider tick, so re-decoding the same data URL each time is the difference
 * between "instant" and "laggy". Keyed by data URL, bounded so a session of
 * swapping photos can't grow without limit.
 */
const imageCache = new Map()
const IMAGE_CACHE_MAX = 12

async function getImage(dataUrl) {
  const hit = imageCache.get(dataUrl)
  if (hit) {
    // Refresh recency
    imageCache.delete(dataUrl)
    imageCache.set(dataUrl, hit)
    return hit
  }
  const promise = loadImage(dataUrl)
  imageCache.set(dataUrl, promise)
  if (imageCache.size > IMAGE_CACHE_MAX) {
    imageCache.delete(imageCache.keys().next().value)
  }
  try {
    return await promise
  } catch (err) {
    imageCache.delete(dataUrl)
    throw err
  }
}

/** The label shown for a builder's domain — honours a custom "Other" entry. */
export function stackLabel(identity) {
  if (identity.stack === 'OTHER' && identity.customStack?.trim()) {
    return identity.customStack.trim().toUpperCase()
  }
  return (identity.stack || 'BUILDER').toUpperCase()
}

// Font loading helper
let fontsLoaded = false
async function ensureFonts() {
  if (fontsLoaded) return
  try {
    await Promise.allSettled([
      document.fonts.load('400 48px "Bebas Neue"'),
      document.fonts.load('400 16px "Inter"'),
      document.fonts.load('400 14px "JetBrains Mono"'),
    ])
  } catch (e) { /* continue */ }
  fontsLoaded = true
}

// Intelligent Font Size Calculation based on Name Length
function calculateNameFontSize(name, S, baseSize = 64) {
  const len = (name || '').length
  if (len <= 12) return Math.round(baseSize * S)
  if (len <= 18) return Math.round((baseSize - 14) * S)
  if (len <= 24) return Math.round((baseSize - 26) * S)
  return Math.round((baseSize - 34) * S)
}

export async function renderCard(identity, format, canvas, scaleFactor = 1) {
  await ensureFonts()

  const W = Math.round(format.width * scaleFactor)
  const H = Math.round(format.height * scaleFactor)
  const S = scaleFactor

  canvas.width = W
  canvas.height = H
  canvas.style.aspectRatio = `${format.width} / ${format.height}`

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  const world = WORLDS[identity.style] || WORLDS.goan
  const archetype = ARCHETYPES[identity.energy] || ARCHETYPES.MAKER
  const domainKey = (identity.stack || 'OTHER').toUpperCase()
  const dna = generateIdentityDNA(identity)
  const rng = dna.rng

  // Layer 01 & 02: Base Background & Environment Illustration (15 Variants)
  if (world.mode === 'golden') {
    drawGoldenHourEnvironmentVariant(ctx, W, H, S, format, dna.envVariantIndex, rng)
  } else if (world.mode === 'night') {
    drawAfterDarkEnvironmentVariant(ctx, W, H, S, format, dna.envVariantIndex, rng)
  } else {
    drawDegenEnvironmentVariant(ctx, W, H, S, format, dna.envVariantIndex, rng)
  }

  // Layer 03 & 04: Domain Visual Language & Archetype Overlay Geometry
  drawDomainVisualMotifs(ctx, W, H, S, domainKey, rng)
  drawArchetypeGenerativeOverlay(ctx, W, H, S, archetype, rng)

  // Layer 05: Brand Header & Edition Tag
  drawBrandHeader(ctx, W, H, S, world, format, dna)

  if (format === FORMATS.SQUAD) {
    // Squad pass: a photo grid of the whole team, one shared frame.
    await drawSquadGrid(ctx, identity, W, H, S)
    drawSquadInfo(ctx, identity, W, H, S, dna)
    drawTactileStampsAndGrain(ctx, W, H, S, world, archetype, format, dna, rng)
    drawPosterBorders(ctx, W, H, S, world)
    return
  }

  // Layer 06: Photograph (Framed per Composition System 01-12)
  if (identity.photoDataUrl) {
    try {
      const img = await getImage(identity.photoDataUrl)
      drawPhoto(ctx, img, identity, format, W, H, S, world, archetype, dna.compositionId)
    } catch (e) {
      drawPhotoPlaceholder(ctx, format, W, H, S, world, dna.compositionId)
    }
  } else {
    drawPhotoPlaceholder(ctx, format, W, H, S, world, dna.compositionId)
  }

  // Layer 07 & 08: Identity Text & Serial Code (Prominent Typography Scale)
  drawIdentityInfo(ctx, identity, format, W, H, S, world, archetype, dna)

  // Layer 09: Builder Sigil Emblem
  drawBuilderSigil(ctx, W, H, S, format, dna)

  // Layer 10 & 11: Tactile Postage Stamps, Cancellation Lines, & Paper Grain
  drawTactileStampsAndGrain(ctx, W, H, S, world, archetype, format, dna, rng)

  // Outer Double Poster Borders
  drawPosterBorders(ctx, W, H, S, world)
}

// ─── BUILDER SIGIL EMBLEM DRAWING ─────────────────────────────────────

export function drawBuilderSigil(ctx, W, H, S, format, dna) {
  if (format === FORMATS.PFP) return

  ctx.save()
  const sigilX = format === FORMATS.SHARE_CARD ? W * 0.92 : W * 0.88
  const sigilY = format === FORMATS.SHARE_CARD ? H * 0.78 : H * 0.86
  const r = 24 * S

  const rng = seededRandom(`${dna.hexSeed}-sigil`)
  const type = Math.floor(rng() * 4)

  ctx.strokeStyle = BRAND.sunYellow
  ctx.fillStyle = BRAND.cream
  ctx.lineWidth = 1.5 * S

  ctx.beginPath()
  if (type % 2 === 0) {
    ctx.arc(sigilX, sigilY, r, 0, Math.PI * 2)
  } else {
    ctx.rect(sigilX - r, sigilY - r, r * 2, r * 2)
  }
  ctx.stroke()

  ctx.fillStyle = BRAND.tileRed
  ctx.beginPath()
  ctx.moveTo(sigilX, sigilY - r * 0.6)
  ctx.lineTo(sigilX + r * 0.6, sigilY)
  ctx.lineTo(sigilX, sigilY + r * 0.6)
  ctx.lineTo(sigilX - r * 0.6, sigilY)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = BRAND.sunYellow
  ctx.beginPath()
  ctx.arc(sigilX, sigilY, 3.5 * S, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// ─── ENVIRONMENT VARIATION DRAWING ────────────────────────────────────

function drawGoldenHourEnvironmentVariant(ctx, W, H, S, format, variantIdx, rng) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7)
  skyGrad.addColorStop(0, '#073B2A')
  skyGrad.addColorStop(0.35, '#0B5D3B')
  skyGrad.addColorStop(0.7, '#C94B36')
  skyGrad.addColorStop(1, '#FFD21C')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, W, H)

  const sunX = (variantIdx === 1 ? W * 0.3 : variantIdx === 2 ? W * 0.75 : W * 0.5)
  const sunY = (format === FORMATS.SHARE_CARD ? H * 0.35 : H * 0.28)
  const sunR = (format === FORMATS.SHARE_CARD ? 95 : 140) * S

  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2)
  sunGlow.addColorStop(0, '#FFD21C')
  sunGlow.addColorStop(0.4, 'rgba(255, 210, 28, 0.35)')
  sunGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = sunGlow
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD21C'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 0.55, 0, Math.PI * 2)
  ctx.fill()

  const seaY = H * 0.72
  const seaGrad = ctx.createLinearGradient(0, seaY, 0, H)
  seaGrad.addColorStop(0, '#C94B36')
  seaGrad.addColorStop(0.3, '#0B5D3B')
  seaGrad.addColorStop(1, '#073B2A')
  ctx.fillStyle = seaGrad
  ctx.fillRect(0, seaY, W, H - seaY)

  ctx.strokeStyle = '#FFD21C'
  ctx.globalAlpha = 0.3
  ctx.lineWidth = 1.5 * S
  for (let i = 0; i < 6; i++) {
    const wy = seaY + (i * 12 + 10) * S
    ctx.beginPath()
    ctx.moveTo(0, wy)
    ctx.quadraticCurveTo(W * 0.25, wy - 4 * S, W * 0.5, wy)
    ctx.quadraticCurveTo(W * 0.75, wy + 4 * S, W, wy)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  if (format !== FORMATS.SHARE_CARD) {
    ctx.save()
    ctx.fillStyle = '#C94B36'
    ctx.beginPath()
    ctx.moveTo(W * 0.7, seaY)
    ctx.lineTo(W * 0.82, seaY - 50 * S)
    ctx.lineTo(W * 0.94, seaY)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#073B2A'
    ctx.fillRect(W * 0.72, seaY, W * 0.2, 80 * S)
    ctx.fillStyle = '#FFD21C'
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(W * 0.82, seaY + 30 * S, 14 * S, Math.PI, 0)
    ctx.rect(W * 0.82 - 14 * S, seaY + 30 * S, 28 * S, 24 * S)
    ctx.fill()
    ctx.restore()
  }

  drawBeachShackAndSurfboard(ctx, W, H, S, format, false, false)
  drawRichPalmTrees(ctx, 40 * S, H, 1.3 * S, false)
  drawRichPalmTrees(ctx, W - 40 * S, H, 1.3 * S, true)
}

function drawAfterDarkEnvironmentVariant(ctx, W, H, S, format, variantIdx, rng) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H)
  skyGrad.addColorStop(0, '#071A18')
  skyGrad.addColorStop(0.5, '#073B2A')
  skyGrad.addColorStop(1, '#0B5D3B')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#FFF1C7'
  for (let i = 0; i < 65; i++) {
    const sx = rng() * W
    const sy = rng() * H * 0.65
    const sr = (0.8 + rng() * 1.6) * S
    ctx.globalAlpha = 0.3 + rng() * 0.6
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const moonX = (variantIdx === 1 ? W * 0.25 : W * 0.78)
  const moonY = (format === FORMATS.SHARE_CARD ? 100 : 160) * S
  const moonR = 45 * S

  const moonHalo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 2.5)
  moonHalo.addColorStop(0, 'rgba(255, 241, 199, 0.4)')
  moonHalo.addColorStop(0.4, 'rgba(240, 43, 114, 0.15)')
  moonHalo.addColorStop(1, 'transparent')
  ctx.fillStyle = moonHalo
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFF1C7'
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  ctx.fill()

  const seaY = H * 0.75
  ctx.fillStyle = '#071A18'
  ctx.fillRect(0, seaY, W, H - seaY)

  ctx.strokeStyle = '#FFF1C7'
  ctx.globalAlpha = 0.25
  ctx.lineWidth = 1 * S
  for (let i = 0; i < 8; i++) {
    const wy = seaY + (i * 10 + 6) * S
    const wWidth = (80 + i * 20) * S
    ctx.beginPath()
    ctx.moveTo(moonX - wWidth / 2, wy)
    ctx.lineTo(moonX + wWidth / 2, wy)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = '#FFD21C'
  ctx.lineWidth = 1.5 * S
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.moveTo(0, 160 * S)
  ctx.quadraticCurveTo(W * 0.3, 210 * S, W * 0.6, 170 * S)
  ctx.quadraticCurveTo(W * 0.8, 220 * S, W, 180 * S)
  ctx.stroke()
  ctx.globalAlpha = 1

  for (let i = 1; i <= 9; i++) {
    const bx = (W / 10) * i
    const by = 160 * S + Math.sin(i) * 20 * S + 10 * S
    const isPink = i % 2 === 0
    ctx.fillStyle = isPink ? '#F02B72' : '#FFD21C'
    ctx.shadowColor = isPink ? '#F02B72' : '#FFD21C'
    ctx.shadowBlur = 12 * S
    ctx.beginPath()
    ctx.arc(bx, by, 5 * S, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.shadowBlur = 0

  drawBeachShackAndSurfboard(ctx, W, H, S, format, true, false)
  drawRichPalmTrees(ctx, 30 * S, H, 1.2 * S, false)
  drawRichPalmTrees(ctx, W - 30 * S, H, 1.2 * S, true)
}

function drawDegenEnvironmentVariant(ctx, W, H, S, format, variantIdx, rng) {
  const skyGrad = ctx.createLinearGradient(0, 0, W, H)
  skyGrad.addColorStop(0, '#071A18')
  skyGrad.addColorStop(0.35, '#F02B72')
  skyGrad.addColorStop(0.7, '#C94B36')
  skyGrad.addColorStop(1, '#FFD21C')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#FFD21C'
  ctx.globalAlpha = 0.08
  ctx.lineWidth = 14 * S
  for (let i = -5; i < 15; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 120 * S, 0)
    ctx.lineTo((i + 4) * 120 * S, H)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const sunX = format === FORMATS.SHARE_CARD ? W * 0.85 : W * 0.5
  const sunY = format === FORMATS.SHARE_CARD ? H * 0.35 : H * 0.28
  const sunR = (format === FORMATS.SHARE_CARD ? 90 : 130) * S

  ctx.fillStyle = '#F02B72'
  ctx.shadowColor = '#F02B72'
  ctx.shadowBlur = 30 * S
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  const seaY = H * 0.74
  ctx.fillStyle = '#073B2A'
  ctx.fillRect(0, seaY, W, H - seaY)

  drawBeachShackAndSurfboard(ctx, W, H, S, format, false, true)
  drawRichPalmTrees(ctx, 35 * S, H, 1.2 * S, false)
  drawRichPalmTrees(ctx, W - 35 * S, H, 1.2 * S, true)
}

// ─── DOMAIN MOTIFS & ARCHETYPE OVERLAYS ────────────────────────────────

function drawDomainVisualMotifs(ctx, W, H, S, domainKey, rng) {
  ctx.save()

  if (domainKey.includes('CYBER') || domainKey.includes('SECURITY')) {
    ctx.strokeStyle = '#FFD21C'
    ctx.globalAlpha = 0.18
    ctx.lineWidth = 1.5 * S
    const cx = W * 0.15, cy = H * 0.4, size = 30 * S
    ctx.beginPath()
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx + size, cy - size * 0.5)
    ctx.lineTo(cx + size, cy + size * 0.4)
    ctx.lineTo(cx, cy + size)
    ctx.lineTo(cx - size, cy + size * 0.4)
    ctx.lineTo(cx - size, cy - size * 0.5)
    ctx.closePath()
    ctx.stroke()
  } else if (domainKey.includes('AI') || domainKey.includes('ML')) {
    ctx.fillStyle = '#FFD21C'
    ctx.strokeStyle = '#FFD21C'
    ctx.globalAlpha = 0.2
    ctx.lineWidth = 1 * S
    const nodes = [
      { x: W * 0.15, y: H * 0.35 },
      { x: W * 0.25, y: H * 0.42 },
      { x: W * 0.18, y: H * 0.5 }
    ]
    nodes.forEach(n => {
      ctx.beginPath()
      ctx.arc(n.x, n.y, 4 * S, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.beginPath()
    ctx.moveTo(nodes[0].x, nodes[0].y)
    ctx.lineTo(nodes[1].x, nodes[1].y)
    ctx.lineTo(nodes[2].x, nodes[2].y)
    ctx.stroke()
  } else if (domainKey.includes('CRYPTO')) {
    ctx.strokeStyle = '#FFD21C'
    ctx.globalAlpha = 0.25
    ctx.lineWidth = 2 * S
    ctx.beginPath()
    ctx.arc(W * 0.85, H * 0.42, 22 * S, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.restore()
}

function drawArchetypeGenerativeOverlay(ctx, W, H, S, archetype, rng) {
  ctx.save()

  if (archetype.layoutStyle === 'structured') {
    ctx.strokeStyle = '#FFD21C'
    ctx.lineWidth = 0.6 * S
    ctx.globalAlpha = 0.12
    const gridGap = 40 * S
    for (let x = gridGap; x < W; x += gridGap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    for (let y = gridGap; y < H; y += gridGap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    }
  } else if (archetype.layoutStyle === 'technical') {
    ctx.strokeStyle = '#FFF1C7'
    ctx.lineWidth = 1 * S
    ctx.globalAlpha = 0.15
    for (let i = 0; i < 5; i++) {
      const cx = (0.2 + rng() * 0.6) * W
      const cy = (0.2 + rng() * 0.6) * H
      const size = 12 * S
      ctx.beginPath()
      ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy)
      ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size)
      ctx.stroke()
    }
  } else if (archetype.layoutStyle === 'postcard') {
    ctx.strokeStyle = '#FFD21C'
    ctx.lineWidth = 1 * S
    ctx.globalAlpha = 0.2
    const cx = W * 0.88, cy = H * 0.88, r = 24 * S
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.font = `${Math.round(9 * S)}px "JetBrains Mono", monospace`
    ctx.fillStyle = '#FFD21C'
    ctx.textAlign = 'center'
    ctx.fillText('N', cx, cy - r - 3 * S)
  }

  ctx.restore()
}

// ─── PALM TREES & BEACH SHACK ──────────────────────────────────────────

function drawRichPalmTrees(ctx, x, y, scale, flip) {
  ctx.save()
  ctx.fillStyle = '#073B2A'
  ctx.strokeStyle = '#073B2A'
  ctx.globalAlpha = 0.9

  const dir = flip ? -1 : 1

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.quadraticCurveTo(x + 50 * scale * dir, y - 220 * scale, x + 80 * scale * dir, y - 420 * scale)
  ctx.lineWidth = 16 * scale
  ctx.stroke()

  const lx = x + 80 * scale * dir
  const ly = y - 420 * scale

  const frondAngles = [-1.1, -0.7, -0.3, 0.1, 0.5, 0.9, 1.3]
  for (let angle of frondAngles) {
    ctx.beginPath()
    ctx.moveTo(lx, ly)
    const endX = lx + Math.cos(angle) * 130 * scale * dir
    const endY = ly + Math.sin(angle) * 130 * scale
    const ctrlX = lx + Math.cos(angle) * 70 * scale * dir
    const ctrlY = ly + Math.sin(angle) * 50 * scale + 25 * scale
    
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY)
    ctx.lineWidth = 6 * scale
    ctx.stroke()

    for (let t = 0.2; t <= 1; t += 0.15) {
      const px = (1 - t) * (1 - t) * lx + 2 * (1 - t) * t * ctrlX + t * t * endX
      const py = (1 - t) * (1 - t) * ly + 2 * (1 - t) * t * ctrlY + t * t * endY
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + 15 * scale * dir, py + 12 * scale)
      ctx.lineWidth = 2 * scale
      ctx.stroke()
    }
  }

  ctx.restore()
}

function drawBeachShackAndSurfboard(ctx, W, H, S, format, isNight = false, isDegen = false) {
  if (format === FORMATS.SHARE_CARD) return

  ctx.save()
  const shackX = W * 0.12
  const shackY = H * 0.68

  ctx.fillStyle = isNight ? '#071A18' : '#073B2A'
  ctx.beginPath()
  ctx.moveTo(shackX - 30 * S, shackY)
  ctx.lineTo(shackX + 60 * S, shackY - 35 * S)
  ctx.lineTo(shackX + 150 * S, shackY)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = isNight ? '#071A18' : '#073B2A'
  ctx.lineWidth = 4 * S
  ctx.beginPath()
  ctx.moveTo(shackX - 20 * S, shackY)
  ctx.lineTo(shackX - 20 * S, shackY + 50 * S)
  ctx.moveTo(shackX + 140 * S, shackY)
  ctx.lineTo(shackX + 140 * S, shackY + 50 * S)
  ctx.stroke()

  const umbX = W * 0.88
  const umbY = H * 0.66
  ctx.fillStyle = isNight ? '#F02B72' : '#C94B36'
  ctx.beginPath()
  ctx.arc(umbX, umbY, 35 * S, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#FFD21C'
  ctx.beginPath()
  ctx.arc(umbX, umbY, 35 * S, Math.PI, Math.PI * 1.33)
  ctx.arc(umbX, umbY, 35 * S, Math.PI * 1.66, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#073B2A'
  ctx.lineWidth = 3 * S
  ctx.beginPath()
  ctx.moveTo(umbX, umbY)
  ctx.lineTo(umbX - 10 * S, umbY + 60 * S)
  ctx.stroke()

  ctx.save()
  ctx.translate(umbX - 30 * S, umbY + 15 * S)
  ctx.rotate(-0.25)
  ctx.fillStyle = isDegen ? '#F02B72' : '#FFD21C'
  ctx.beginPath()
  roundRect(ctx, -10 * S, -40 * S, 20 * S, 80 * S, 10 * S)
  ctx.fill()
  ctx.strokeStyle = '#C94B36'
  ctx.lineWidth = 2 * S
  ctx.stroke()
  ctx.fillStyle = '#C94B36'
  ctx.fillRect(-10 * S, -10 * S, 20 * S, 12 * S)
  ctx.restore()

  ctx.restore()
}

// ─── BRAND HEADER & EDITION BADGE (PROMINENT LEGIBLE SCALE) ──────────

function drawBrandHeader(ctx, W, H, S, world, format, dna) {
  const pad = 36 * S
  const isShare = format === FORMATS.SHARE_CARD

  ctx.save()
  ctx.textBaseline = 'top'

  // Subtitle Metadata Tag (+27% scale)
  ctx.fillStyle = BRAND.sunYellow
  ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'left'
  ctx.fillText(`GOA, INDIA • 28—31 OCT 2026 • ${dna.editionName}`, pad, pad)

  // Header Title (+26% scale)
  const headerY = pad + 20 * S
  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round((isShare ? 38 : 48) * S)}px "Bebas Neue", sans-serif`
  ctx.fillText('HACKER HOUSE', pad, headerY)

  const hhWidth = ctx.measureText('HACKER HOUSE').width
  ctx.fillStyle = BRAND.sunYellow
  ctx.fillText('GOA', pad + hhWidth + 12 * S, headerY)

  // Studio & Coordinates (+30% scale)
  ctx.textAlign = 'right'
  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(13 * S)}px "JetBrains Mono", monospace`
  ctx.fillText('BUILDER IDENTITY STUDIO', W - pad, pad)
  ctx.fillStyle = BRAND.sunYellow
  ctx.fillText('15.4909° N, 73.8278° E', W - pad, pad + 18 * S)

  ctx.restore()
}

// ─── PHOTOGRAPH FRAMING ACCORDING TO 12 COMPOSITION SYSTEMS ────────────

function getPhotoDimensions(format, W, H, S, compId) {
  const pad = 36 * S
  const topOffset = (format === FORMATS.SHARE_CARD ? 95 : 140) * S

  if (format === FORMATS.SHARE_CARD) {
    return { x: pad, y: topOffset, w: W * 0.35, h: H - topOffset - pad, radius: 16 * S }
  }

  if (format === FORMATS.PFP) {
    const size = W * 0.62
    return { x: (W - size) / 2, y: topOffset + 20 * S, w: size, h: size, radius: size / 2 }
  }

  switch (compId) {
    case 0:
      return { x: (W - (W - pad * 2.8)) / 2, y: topOffset + 10 * S, w: W - pad * 2.8, h: H * 0.42, radius: 12 * S }
    case 1:
      return { x: pad * 1.5, y: topOffset + 15 * S, w: W * 0.50, h: H * 0.43, radius: 14 * S }
    case 2:
      return { x: (W - W * 0.72) / 2, y: topOffset + 12 * S, w: W * 0.72, h: H * 0.40, radius: 16 * S }
    case 3:
      return { x: W - W * 0.54 - pad * 1.2, y: topOffset + 10 * S, w: W * 0.54, h: H * 0.43, radius: 14 * S }
    case 4:
      return { x: pad * 1.8, y: topOffset + 20 * S, w: W * 0.54, h: H * 0.41, radius: 4 * S }
    case 5:
      return { x: (W - (W - pad * 2.8)) / 2, y: topOffset + 10 * S, w: W - pad * 2.8, h: H * 0.42, radius: 20 * S }
    case 6:
      return { x: (W - W * 0.66) / 2, y: topOffset + 25 * S, w: W * 0.66, h: H * 0.40, radius: 30 * S }
    case 7:
      return { x: (W - W * 0.60) / 2, y: topOffset + 50 * S, w: W * 0.60, h: H * 0.35, radius: 18 * S }
    case 8:
      return { x: W - W * 0.52 - pad * 1.5, y: topOffset + 15 * S, w: W * 0.52, h: H * 0.42, radius: 8 * S }
    case 9:
      return { x: (W - W * 0.68) / 2, y: topOffset + 40 * S, w: W * 0.68, h: H * 0.38, radius: 24 * S }
    case 10:
      return { x: (W - W * 0.56) / 2, y: topOffset + 35 * S, w: W * 0.56, h: H * 0.36, radius: 20 * S }
    case 11:
      return { x: pad * 1.4, y: topOffset + 10 * S, w: W * 0.56, h: H * 0.44, radius: 16 * S }
    default:
      return { x: (W - (W - pad * 2.8)) / 2, y: topOffset + 10 * S, w: W - pad * 2.8, h: H * 0.42, radius: 20 * S }
  }
}

function drawPhoto(ctx, img, identity, format, W, H, S, world, archetype, compId) {
  const { x, y, w, h, radius } = getPhotoDimensions(format, W, H, S, compId)

  ctx.save()

  ctx.shadowColor = BRAND.sunYellow
  ctx.shadowBlur = 24 * S
  ctx.fillStyle = BRAND.cream

  if (format === FORMATS.PFP) {
    ctx.beginPath()
    ctx.arc(x + w / 2, y + h / 2, w / 2 + 8 * S, 0, Math.PI * 2)
    ctx.fill()
  } else {
    roundRect(ctx, x - 6 * S, y - 6 * S, w + 12 * S, h + 12 * S, radius + 4 * S)
    ctx.fill()
  }
  ctx.shadowBlur = 0

  ctx.beginPath()
  if (format === FORMATS.PFP) {
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
  } else {
    roundRect(ctx, x, y, w, h, radius)
  }
  ctx.clip()

  const crop = identity.photoCrop || { x: 0, y: 0, scale: 1 }
  const imgAspect = img.naturalWidth / img.naturalHeight
  const frameAspect = w / h
  let drawW, drawH

  if (imgAspect > frameAspect) {
    drawH = h * crop.scale
    drawW = drawH * imgAspect
  } else {
    drawW = w * crop.scale
    drawH = drawW / imgAspect
  }

  // Bias the vertical crop upward. Heads sit above centre in almost every
  // photo, so a straight centre-crop is the single most common way an
  // uncropped upload loses its subject.
  const drawX = x + (w - drawW) / 2 + crop.x * S
  const drawY = y + (h - drawH) * 0.42 + crop.y * S
  ctx.drawImage(img, drawX, drawY, drawW, drawH)

  ctx.restore()

  ctx.save()
  ctx.strokeStyle = BRAND.sunYellow
  ctx.lineWidth = 3 * S
  ctx.beginPath()
  if (format === FORMATS.PFP) {
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
  } else {
    roundRect(ctx, x, y, w, h, radius)
  }
  ctx.stroke()

  if (format !== FORMATS.PFP) {
    ctx.fillStyle = BRAND.tileRed
    const cSize = 14 * S
    ctx.fillRect(x - 6 * S, y - 6 * S, cSize, cSize)
    ctx.fillRect(x + w + 6 * S - cSize, y - 6 * S, cSize, cSize)
    ctx.fillRect(x - 6 * S, y + h + 6 * S - cSize, cSize, cSize)
    ctx.fillRect(x + w + 6 * S - cSize, y + h + 6 * S - cSize, cSize, cSize)
  }

  ctx.restore()
}

/**
 * The empty state, drawn rather than left blank. It shows up on the marketing
 * samples and in the studio before a photo lands, so it has to read as a
 * deliberate part of the design instead of a missing asset.
 */
function drawPhotoPlaceholder(ctx, format, W, H, S, world, compId) {
  const { x, y, w, h, radius } = getPhotoDimensions(format, W, H, S, compId)
  const isCircle = format === FORMATS.PFP
  const cx = x + w / 2
  const cy = y + h / 2

  const outline = () => {
    ctx.beginPath()
    if (isCircle) ctx.arc(cx, cy, w / 2, 0, Math.PI * 2)
    else roundRect(ctx, x, y, w, h, radius)
  }

  ctx.save()

  // Base plate with a soft vertical lift, so it doesn't read as a flat hole
  const plate = ctx.createLinearGradient(0, y, 0, y + h)
  plate.addColorStop(0, BRAND.emerald)
  plate.addColorStop(1, BRAND.greenDeep)
  outline()
  ctx.fillStyle = plate
  ctx.fill()

  // Clip everything decorative to the frame
  ctx.save()
  outline()
  ctx.clip()

  // Diagonal hatch, riso-print style
  ctx.strokeStyle = BRAND.sunYellow
  ctx.globalAlpha = 0.07
  ctx.lineWidth = 2 * S
  const step = 22 * S
  for (let i = -h; i < w + h; i += step) {
    ctx.beginPath()
    ctx.moveTo(x + i, y)
    ctx.lineTo(x + i + h, y + h)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Head-and-shoulders silhouette
  const unit = Math.min(w, h)
  const headR = unit * 0.15
  const headY = cy - unit * 0.1
  ctx.fillStyle = BRAND.sunYellow
  ctx.globalAlpha = 0.42
  ctx.beginPath()
  ctx.arc(cx, headY, headR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - headR * 2.1, cy + unit * 0.34)
  ctx.quadraticCurveTo(cx - headR * 2.1, headY + headR * 1.35, cx, headY + headR * 1.35)
  ctx.quadraticCurveTo(cx + headR * 2.1, headY + headR * 1.35, cx + headR * 2.1, cy + unit * 0.34)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.restore()

  // Dashed inner rule + label
  ctx.strokeStyle = BRAND.sunYellow
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 2 * S
  ctx.setLineDash([9 * S, 8 * S])
  outline()
  ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 1

  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(13 * S)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('YOUR PHOTO HERE', cx, cy + unit * 0.42)

  // Solid frame on top
  ctx.strokeStyle = BRAND.sunYellow
  ctx.lineWidth = 3 * S
  outline()
  ctx.stroke()

  ctx.restore()
}

// ─── GENERATIVE IDENTITY INFO TEXT (UPGRADED READABILITY HIERARCHY) ──

function drawIdentityInfo(ctx, identity, format, W, H, S, world, archetype, dna) {
  const pad = 36 * S
  const compId = dna.compositionId
  const rawName = (identity.name || 'BUILDER NAME').toUpperCase()

  if (format === FORMATS.PFP) {
    ctx.save()
    const textY = H - 90 * S
    ctx.fillStyle = BRAND.greenDeep
    ctx.globalAlpha = 0.92
    roundRect(ctx, pad, textY, W - pad * 2, 60 * S, 12 * S)
    ctx.fill()
    ctx.strokeStyle = BRAND.sunYellow
    ctx.lineWidth = 2 * S
    ctx.stroke()

    ctx.fillStyle = BRAND.cream
    ctx.font = `${calculateNameFontSize(rawName, S, 32)}px "Bebas Neue", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(rawName, W / 2, textY + 22 * S)

    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(14 * S)}px "Bebas Neue", sans-serif`
    ctx.fillText(identity.builderTitle || 'HACKER HOUSE GOA 2026', W / 2, textY + 44 * S)
    ctx.restore()
    return
  }

  if (format === FORMATS.SHARE_CARD) {
    const infoX = W * 0.42
    let infoY = 110 * S

    ctx.save()
    ctx.textBaseline = 'top'

    // Name (+30% scale)
    ctx.fillStyle = BRAND.cream
    ctx.font = `${calculateNameFontSize(rawName, S, 52)}px "Bebas Neue", sans-serif`
    ctx.fillText(rawName, infoX, infoY)

    // Role (+25% scale)
    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(28 * S)}px "Bebas Neue", sans-serif`
    ctx.fillText(identity.builderTitle || 'BUILDER', infoX, infoY + 54 * S)

    ctx.strokeStyle = BRAND.tileRed
    ctx.lineWidth = 3 * S
    ctx.beginPath()
    ctx.moveTo(infoX, infoY + 92 * S)
    ctx.lineTo(infoX + 280 * S, infoY + 92 * S)
    ctx.stroke()

    // Domain & Archetype (+23% scale)
    ctx.fillStyle = BRAND.cream
    ctx.font = `${Math.round(16 * S)}px "JetBrains Mono", monospace`
    const stackText = `DOMAIN: ${stackLabel(identity)} • ${archetype.name.toUpperCase()} (${archetype.code})`
    ctx.fillText(stackText, infoX, infoY + 106 * S)

    // Serial Code (+27% scale)
    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
    ctx.fillText(`SERIAL: ${dna.identityCode}`, infoX, infoY + 134 * S)

    ctx.restore()
    return
  }

  // BUILDER ID PASS (PROMINENT LEGIBILITY HIERARCHY)
  ctx.save()
  ctx.textBaseline = 'top'

  if (compId === 1 || compId === 4 || compId === 11) {
    // Asymmetric Left (Info Stacked Right)
    const infoX = W * 0.60
    const infoY = 150 * S

    ctx.textAlign = 'left'
    ctx.fillStyle = BRAND.cream
    ctx.font = `${calculateNameFontSize(rawName, S, 54)}px "Bebas Neue", sans-serif`
    ctx.fillText(rawName, infoX, infoY)

    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(28 * S)}px "Bebas Neue", sans-serif`
    ctx.fillText(identity.builderTitle || 'GOA BUILDER', infoX, infoY + 56 * S)

    ctx.fillStyle = BRAND.cream
    ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
    ctx.fillText(`DOMAIN: ${stackLabel(identity)}`, infoX, infoY + 98 * S)
    ctx.fillText(`ARCHETYPE: ${archetype.name.toUpperCase()}`, infoX, infoY + 118 * S)

    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(13 * S)}px "JetBrains Mono", monospace`
    ctx.fillText(dna.identityCode, infoX, infoY + 142 * S)

    ctx.restore()
    return
  }

  if (compId === 2 || compId === 3 || compId === 8) {
    // Technical Right (Info Stacked Left)
    const infoX = pad * 1.5
    const infoY = 150 * S

    ctx.textAlign = 'left'
    ctx.fillStyle = BRAND.cream
    ctx.font = `${calculateNameFontSize(rawName, S, 54)}px "Bebas Neue", sans-serif`
    ctx.fillText(rawName, infoX, infoY)

    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(28 * S)}px "Bebas Neue", sans-serif`
    ctx.fillText(identity.builderTitle || 'GOA BUILDER', infoX, infoY + 56 * S)

    ctx.fillStyle = BRAND.cream
    ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
    ctx.fillText(`DOMAIN: ${stackLabel(identity)}`, infoX, infoY + 98 * S)
    ctx.fillText(`ARCHETYPE: ${archetype.name.toUpperCase()}`, infoX, infoY + 118 * S)

    ctx.fillStyle = BRAND.sunYellow
    ctx.font = `${Math.round(13 * S)}px "JetBrains Mono", monospace`
    ctx.fillText(dna.identityCode, infoX, infoY + 142 * S)

    ctx.restore()
    return
  }

  // Centered Lower Panel Layout (UPGRADED +30% PRIMARY SCALE)
  const infoY = H * 0.70

  ctx.textAlign = 'center'

  // 1. PRIMARY: BUILDER NAME (+30% Scale, 64px base)
  const nameSize = calculateNameFontSize(rawName, S, 64)
  ctx.fillStyle = BRAND.cream
  ctx.font = `${nameSize}px "Bebas Neue", sans-serif`
  ctx.fillText(rawName, W / 2, infoY)

  // 2. SECONDARY: ROLE / TITLE (+25% Scale, 32px)
  const titleY = infoY + nameSize * 0.95 + 4 * S
  ctx.fillStyle = BRAND.sunYellow
  ctx.font = `${Math.round(32 * S)}px "Bebas Neue", sans-serif`
  ctx.fillText(identity.builderTitle || 'GOA BUILDER', W / 2, titleY)

  // Divider Accent Line
  const divW = 180 * S
  const divY = titleY + 40 * S
  ctx.strokeStyle = BRAND.tileRed
  ctx.lineWidth = 3.5 * S
  ctx.beginPath()
  ctx.moveTo(W / 2 - divW, divY)
  ctx.lineTo(W / 2 + divW, divY)
  ctx.stroke()

  // 3. TERTIARY: DOMAIN / ARCHETYPE (+23% Scale, 16px Mono)
  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(16 * S)}px "JetBrains Mono", monospace`
  const domainText = `DOMAIN: ${stackLabel(identity)} | ARCHETYPE: ${archetype.name.toUpperCase()} (${archetype.code})`
  ctx.fillText(domainText, W / 2, divY + 14 * S)

  // 4. TECHNICAL METADATA: SERIAL CODE (+27% Scale, 14px Mono)
  ctx.fillStyle = BRAND.sunYellow
  ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
  const passSerial = `PASS NO: ${dna.identityCode}`
  ctx.fillText(passSerial, W / 2, divY + 40 * S)

  ctx.restore()
}

// ─── SQUAD PASS: ONE FRAME FOR THE WHOLE TEAM ────────────────────────

/**
 * Circular portraits, not a rectangular grid. Circles are far more forgiving
 * of whatever aspect ratio each teammate happens to upload, and they let the
 * layout stay balanced whether two people or four show up.
 */
function squadSlots(count, W, H, S) {
  const cx = W / 2
  switch (count) {
    case 1:
      return [{ x: cx, y: H * 0.395, r: 250 * S }]
    case 2:
      return [
        { x: cx - 200 * S, y: H * 0.395, r: 185 * S },
        { x: cx + 200 * S, y: H * 0.395, r: 185 * S },
      ]
    case 3:
      return [
        { x: cx - 320 * S, y: H * 0.395, r: 150 * S },
        { x: cx, y: H * 0.395, r: 150 * S },
        { x: cx + 320 * S, y: H * 0.395, r: 150 * S },
      ]
    default:
      // Rows are spaced so the first row's name labels clear the second row.
      return [
        { x: cx - 168 * S, y: H * 0.295, r: 132 * S },
        { x: cx + 168 * S, y: H * 0.295, r: 132 * S },
        { x: cx - 168 * S, y: H * 0.555, r: 132 * S },
        { x: cx + 168 * S, y: H * 0.555, r: 132 * S },
      ]
  }
}

/** Cover-fit into a circle, biased upward so faces survive the crop. */
function drawCircularPortrait(ctx, img, slot, S, crop) {
  const { x, y, r } = slot
  const scale = crop?.scale || 1
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const size = r * 2 * scale
  const aspect = iw / ih

  let dw, dh
  if (aspect > 1) {
    dh = size
    dw = size * aspect
  } else {
    dw = size
    dh = size / aspect
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.clip()
  // 0.42 rather than 0.5: heads sit above centre in almost every photo.
  const dx = x - dw / 2 + (crop?.x || 0) * S
  const dy = y - dh * 0.42 + (crop?.y || 0) * S
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

/** An empty crew seat — same silhouette language as the solo placeholder. */
function drawSquadSlotPlaceholder(ctx, slot) {
  const { x, y, r } = slot
  ctx.save()
  const plate = ctx.createLinearGradient(0, y - r, 0, y + r)
  plate.addColorStop(0, BRAND.emerald)
  plate.addColorStop(1, BRAND.greenDeep)
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = plate
  ctx.fill()
  ctx.clip()

  ctx.fillStyle = BRAND.sunYellow
  ctx.globalAlpha = 0.38
  const headR = r * 0.3
  const headY = y - r * 0.18
  ctx.beginPath()
  ctx.arc(x, headY, headR, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - headR * 2.1, y + r)
  ctx.quadraticCurveTo(x - headR * 2.1, headY + headR * 1.35, x, headY + headR * 1.35)
  ctx.quadraticCurveTo(x + headR * 2.1, headY + headR * 1.35, x + headR * 2.1, y + r)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawSquadSlotChrome(ctx, slot, S, index) {
  const { x, y, r } = slot
  ctx.save()
  ctx.strokeStyle = BRAND.sunYellow
  ctx.lineWidth = 5 * S
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = BRAND.tileRed
  ctx.lineWidth = 1.5 * S
  ctx.beginPath()
  ctx.arc(x, y, r + 8 * S, 0, Math.PI * 2)
  ctx.stroke()

  // Numbered tab, like a crew roster
  const tabR = 22 * S
  const tx = x + r * 0.72
  const ty = y - r * 0.72
  ctx.fillStyle = BRAND.tileRed
  ctx.beginPath()
  ctx.arc(tx, ty, tabR, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(20 * S)}px "Bebas Neue", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(index + 1).padStart(2, '0'), tx, ty + 1 * S)
  ctx.restore()
}

function drawSquadMemberName(ctx, name, slot, S) {
  if (!name) return
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = BRAND.cream
  const label = name.toUpperCase()
  let size = Math.round(26 * S)
  ctx.font = `${size}px "Bebas Neue", sans-serif`
  const maxW = slot.r * 2.3
  while (ctx.measureText(label).width > maxW && size > 12 * S) {
    size -= 1
    ctx.font = `${size}px "Bebas Neue", sans-serif`
  }
  ctx.fillText(label, slot.x, slot.y + slot.r + 16 * S)
  ctx.restore()
}

/** Every seat on the roster gets a circle, filled or not — so the card always
 *  matches the crew list the user is editing. */
async function drawSquadGrid(ctx, identity, W, H, S) {
  const roster = (identity.squad || []).slice(0, 4)
  const seats = roster.length ? roster : [{}]
  const slots = squadSlots(seats.length, W, H, S)

  for (let i = 0; i < seats.length; i++) {
    const slot = slots[i]
    const member = seats[i]

    if (!member.dataUrl) {
      drawSquadSlotPlaceholder(ctx, slot)
      drawSquadSlotChrome(ctx, slot, S, i)
      drawSquadMemberName(ctx, member.name, slot, S)
      continue
    }

    ctx.save()
    ctx.shadowColor = 'rgba(7, 26, 24, 0.55)'
    ctx.shadowBlur = 26 * S
    ctx.fillStyle = BRAND.greenDeep
    ctx.beginPath()
    ctx.arc(slot.x, slot.y, slot.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    try {
      const img = await getImage(member.dataUrl)
      drawCircularPortrait(ctx, img, slot, S, member.crop)
    } catch {
      /* leave the deep-green disc as the fallback */
    }

    drawSquadSlotChrome(ctx, slot, S, i)
    drawSquadMemberName(ctx, member.name, slot, S)
  }
}

function drawSquadInfo(ctx, identity, W, H, S, dna) {
  const count = Math.min(Math.max((identity.squad || []).length, 1), 4)
  const teamName = (identity.teamName || 'THE SQUAD').toUpperCase()

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const infoY = H * 0.735

  ctx.fillStyle = BRAND.cream
  const nameSize = calculateNameFontSize(teamName, S, 72)
  ctx.font = `${nameSize}px "Bebas Neue", sans-serif`
  ctx.fillText(teamName, W / 2, infoY)

  ctx.fillStyle = BRAND.sunYellow
  ctx.font = `${Math.round(30 * S)}px "Bebas Neue", sans-serif`
  ctx.fillText(
    `SQUAD OF ${count} • ${stackLabel(identity)}`,
    W / 2,
    infoY + nameSize * 0.95 + 4 * S
  )

  const divY = infoY + nameSize * 0.95 + 48 * S
  ctx.strokeStyle = BRAND.tileRed
  ctx.lineWidth = 3.5 * S
  ctx.beginPath()
  ctx.moveTo(W / 2 - 180 * S, divY)
  ctx.lineTo(W / 2 + 180 * S, divY)
  ctx.stroke()

  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(16 * S)}px "JetBrains Mono", monospace`
  ctx.fillText('BUILDING TOGETHER AT HACKER HOUSE GOA', W / 2, divY + 14 * S)

  ctx.fillStyle = BRAND.sunYellow
  ctx.font = `${Math.round(14 * S)}px "JetBrains Mono", monospace`
  ctx.fillText(`CREW NO: ${dna.identityCode}`, W / 2, divY + 40 * S)

  ctx.restore()
}

// ─── TACTILE STAMPS, CANCELLATION LINES, & PAPER GRAIN ───────────────

function drawTactileStampsAndGrain(ctx, W, H, S, world, archetype, format, dna, rng) {
  if (format === FORMATS.PFP) return

  ctx.save()

  // Postal Stamp Badge (Top Right)
  const stampX = W - 125 * S
  const stampY = 90 * S
  const stampW = 90 * S
  const stampH = 75 * S

  ctx.fillStyle = BRAND.cream
  ctx.fillRect(stampX, stampY, stampW, stampH)

  ctx.fillStyle = BRAND.tileRed
  ctx.fillRect(stampX + 4 * S, stampY + 4 * S, stampW - 8 * S, stampH - 8 * S)

  ctx.fillStyle = BRAND.cream
  ctx.font = `${Math.round(9 * S)}px "JetBrains Mono", monospace`
  ctx.textAlign = 'center'
  ctx.fillText(world.stampCode.split('•')[0] || 'GOA POST 2026', stampX + stampW / 2, stampY + 20 * S)
  ctx.font = `${Math.round(18 * S)}px "Bebas Neue", sans-serif`
  ctx.fillText('2:47PM', stampX + stampW / 2, stampY + 42 * S)
  ctx.font = `${Math.round(8 * S)}px "JetBrains Mono", monospace`
  ctx.fillText(archetype.code, stampX + stampW / 2, stampY + 60 * S)

  // Cancellation Wavy Lines
  ctx.strokeStyle = '#071A18'
  ctx.globalAlpha = 0.55
  ctx.lineWidth = 1.5 * S
  for (let i = 0; i < 4; i++) {
    const cy = stampY + 15 * S + i * 12 * S
    ctx.beginPath()
    ctx.moveTo(stampX - 35 * S, cy)
    ctx.quadraticCurveTo(stampX, cy - 6 * S, stampX + stampW + 20 * S, cy)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Paper Grain Overlay
  ctx.fillStyle = BRAND.cream
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 450; i++) {
    const gx = rng() * W
    const gy = rng() * H
    ctx.fillRect(gx, gy, 1.5 * S, 1.5 * S)
  }

  ctx.restore()
}

// ─── POSTER BORDERS ──────────────────────────────────────────────────

function drawPosterBorders(ctx, W, H, S, world) {
  const pad = 16 * S

  ctx.save()

  ctx.strokeStyle = BRAND.sunYellow
  ctx.lineWidth = 3 * S
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2)

  ctx.strokeStyle = BRAND.cream
  ctx.lineWidth = 1 * S
  ctx.globalAlpha = 0.6
  ctx.strokeRect(pad + 6 * S, pad + 6 * S, W - (pad + 6 * S) * 2, H - (pad + 6 * S) * 2)
  ctx.globalAlpha = 1

  const cornerSize = 24 * S
  ctx.fillStyle = BRAND.tileRed
  ctx.fillRect(pad, pad, cornerSize, 4 * S)
  ctx.fillRect(pad, pad, 4 * S, cornerSize)

  ctx.fillRect(W - pad - cornerSize, pad, cornerSize, 4 * S)
  ctx.fillRect(W - pad - 4 * S, pad, 4 * S, cornerSize)

  ctx.fillRect(pad, H - pad - 4 * S, cornerSize, 4 * S)
  ctx.fillRect(pad, H - pad - cornerSize, 4 * S, cornerSize)

  ctx.fillRect(W - pad - cornerSize, H - pad - 4 * S, cornerSize, 4 * S)
  ctx.fillRect(W - pad - 4 * S, H - pad - cornerSize, 4 * S, cornerSize)

  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Ultra High-Res Export Function (2160 × 2700 px Printable PNG)
export async function exportCard(identity, format) {
  const offscreen = document.createElement('canvas')
  await renderCard(identity, format, offscreen, 2.0)
  return new Promise((resolve) => {
    offscreen.toBlob((blob) => resolve(blob), 'image/png', 1.0)
  })
}
