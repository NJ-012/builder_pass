import React, { useEffect, useRef, useState } from 'react'
import { renderCard } from '../lib/cardRenderer'

/**
 * A non-interactive canvas showing what the generator actually produces.
 * Rendered lazily on first scroll into view so a page full of samples never
 * blocks first paint.
 */
export default function SampleCard({ identity, format, scale = 0.32, className = '', alt }) {
  const canvasRef = useRef(null)
  const [seen, setSeen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = canvasRef.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  useEffect(() => {
    if (!seen || !canvasRef.current) return
    let cancelled = false
    renderCard(identity, format, canvasRef.current, scale).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [seen, identity, format, scale])

  return (
    <canvas
      ref={canvasRef}
      className={`sample ${ready ? 'sample--ready' : ''} ${className}`}
      style={{ aspectRatio: `${format.width} / ${format.height}` }}
      role="img"
      aria-label={alt || `${format.label} example`}
    />
  )
}
