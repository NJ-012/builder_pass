# Hacker House Goa 2026 — Builder Identity Studio

> Build your identity before you build your thing.

A premium web experience that generates personalized builder identity artifacts for Hacker House Goa 2026. Upload your photo, choose your stack and energy, and receive a Builder ID, PFP, and Share Card — all rendered client-side with Canvas.

## Features

- **Photo Upload** — Drag-drop, file picker, HEIC/HEIF support (auto-converted)
- **Builder Profile** — Name, stack (AI/Crypto/Cyber/Web/...), energy (Architect/Hacker/Explorer/...)
- **Title Engine** — 80+ curated builder titles generated from your stack × energy combination
- **Three Visual Worlds** — GOAN (warm gold), AFTER DARK (cool indigo), DEGEN (hot pink) — all sharing HH Goa brand DNA
- **Canvas Renderer** — Deterministic, same output for preview and export
- **Three Output Formats** — Builder ID (1080×1350), PFP (1080×1080), Share Card (1200×630)
- **Download** — All formats export as high-resolution PNG
- **X Sharing** — One-click share with #FrameInGoa hashtag
- **Privacy** — Your original photo never leaves your device
- **Reveal Animation** — Phased identity compilation sequence (skippable)
- **Mobile-First** — Responsive from 360px to 1920px

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| Rendering | Canvas 2D API |
| HEIC Support | heic2any (dynamically imported) |
| Typography | Bebas Neue, Inter, JetBrains Mono |
| Deployment | Vercel |
| Sharing | Vercel Blob Storage (optional) |

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Step orchestration
├── index.css                   # Design system tokens
├── context/
│   └── IdentityContext.jsx     # Centralized state (useReducer)
├── components/
│   ├── Landing.jsx             # Hero arrival experience
│   ├── Progress.jsx            # Step indicator
│   ├── ProfileStep.jsx         # Name + Stack selection
│   ├── EnergyStep.jsx          # Builder energy + live title preview
│   ├── PhotoStep.jsx           # Upload, pan, zoom, HEIC
│   ├── StyleStep.jsx           # Choose Your World + live preview
│   ├── Reveal.jsx              # Build animation sequence
│   └── Result.jsx              # Identity reveal + download + share
├── lib/
│   ├── cardRenderer.js         # THE unified Canvas renderer
│   ├── titleEngine.js          # Stack × Energy → Builder Title
│   ├── imageUtils.js           # HEIC conversion, validation
│   └── sharing.js              # X intent, download helper
└── constants/
    ├── stacks.js
    ├── energies.js
    └── styles.js
```

## Canvas Renderer

The renderer is the core of the product. It draws all identity artifacts using the Canvas 2D API.

```
render(identity, format, canvas, scaleFactor?)
```

- **Same code** for preview and export — preview just uses a smaller scale factor
- **Deterministic** — seeded random for noise textures
- **9 combinations** — 3 formats × 3 styles
- **Font-preloaded** — waits for Google Fonts before rendering

## Design System

Derived from the official Hacker House Goa visual identity:

- **Brand Primary**: `#E8461E` (red-orange from official cover/favicon)
- **Brand Cream**: `#F5F0E8` (from official background)
- **Display Font**: Bebas Neue (matches official condensed wordmark style)
- **Three Worlds**: Goan (`#F5C518`), After Dark (`#6366F1`), Degen (`#E8356D`)

All three worlds share the same brand DNA (wordmark, palette, typography, metadata layout) and differ in composition, texture, and mood.

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (optional, for sharing)

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage token for share uploads |

Without this token, sharing falls back to download + text-only X intent.

## Privacy

- Original photos are processed entirely in the browser
- Only the **generated artifact** (with photo composited into the card) is uploaded when sharing
- No authentication, no user accounts, no tracking
- Share uploads auto-expire after 30 days

## Credits

Built for Hacker House Goa 2026 shortlisting challenge.

Event: [hacker-house-goa-2026.devfolio.co](https://hacker-house-goa-2026.devfolio.co)  
Organized by: 2:47PM Studio  
Dates: October 28–31, 2026  
Location: Goa, India
